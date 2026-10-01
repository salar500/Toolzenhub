/**
 * Negative controls for the BROWSER tests (optional, slow):  npm run test:mutation
 *
 * Copies the site to a temp folder, breaks one thing at a time, serves the broken copy to the real
 * Playwright specs (TZ_SERVE_ROOT) and asserts that the matching spec FAILS. If a mutation is not
 * caught, the safety net has a hole. Never touches the working tree.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKIP = /(^|[\\/])(node_modules|\.git|tests|test-results|playwright-report)([\\/]|$)/;

const MUTATIONS = [
  {
    name: "EMI formula returns a slightly wrong value",
    spec: "tests/browser/emi.spec.js",
    apply: (root) => edit(root, "assets/js/calculators/formulas/loan.js", (s) => s.replace("factor -\n        1\n", "factor -\n        1.0001\n").replace(/(principal \*\s*monthlyRate \*\s*factor \/\s*\(factor - 1)\)/, "$1.0001)")),
  },
  {
    name: "a script throws on every page (uncaught JS error)",
    spec: "tests/browser/smoke.spec.js",
    grep: "about.html",
    apply: (root) => edit(root, "assets/js/components/footer.js", (s) => s + '\nsetTimeout(() => { throw new Error("mutation: boom"); }, 50);\n'),
  },
  {
    name: "calculator breadcrumb removed",
    spec: "tests/browser/emi.spec.js",
    apply: (root) => edit(root, "assets/js/pages/calculator.js", (s) => s.replace(/renderToolBreadcrumb\(metadata\)/, '""')),
  },
  {
    name: "footer link built without the site-root prefix",
    spec: "tests/browser/links.spec.js",
    apply: (root) => edit(root, "assets/js/components/footer.js", (s) => s.replace('href="${page("privacy.html")}"', 'href="/privacy.html"')),
  },
  {
    name: "Coming-soon card becomes a clickable link",
    spec: "tests/browser/navigation.spec.js",
    grep: "Coming soon items are not clickable",
    apply: (root) => edit(root, "assets/js/components/calculator-card.js", (s) => s.replace("<div\n                class=\"calculator-card calculator-card--soon\"", "<a href=\"#\"\n                class=\"calculator-card calculator-card--soon\"")),
  },
  {
    name: "contact form claims success",
    spec: "tests/browser/contact.spec.js",
    apply: (root) => edit(root, "assets/js/pages/contact.js", (s) => s.replace("Your message was not sent. ", "Thank you, your message was sent! ")),
  },
];

function edit(root, file, fn) {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, "utf8");
  const crlf = before.includes("\r\n");
  const after = fn(before.replace(/\r\n/g, "\n"));
  const out = crlf ? after.replace(/\n/g, "\r\n") : after;
  if (out === before) throw new Error(`mutation did not change ${file} (pattern drifted — update this control)`);
  fs.writeFileSync(p, out);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tz-browser-mutation-"));
let missed = 0;
try {
  for (const m of MUTATIONS) {
    const root = path.join(tmp, m.name.replace(/\W+/g, "-"));
    fs.cpSync(REPO, root, { recursive: true, filter: (src) => !SKIP.test(path.relative(REPO, src)) });
    m.apply(root);
    const args = ["playwright", "test", "--project=subpath-desktop", m.spec];
    if (m.grep) args.push("-g", m.grep);
    const r = spawnSync("npx", args, { cwd: REPO, env: { ...process.env, TZ_SERVE_ROOT: root }, encoding: "utf8", shell: true });
    const caught = r.status !== 0;
    if (!caught) missed++;
    console.log(`${caught ? "✓ caught " : "✗ MISSED"}  ${m.name}   (${m.spec}${m.grep ? ` -g "${m.grep}"` : ""})`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (missed) {
  console.error(`\n${missed} mutation(s) were NOT caught by the browser tests.`);
  process.exit(1);
}
console.log("\n✓ every injected fault was caught by the browser tests.");
