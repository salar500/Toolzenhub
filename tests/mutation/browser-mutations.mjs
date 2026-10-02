/**
 * Negative controls for the BROWSER tests (optional, slow):  npm run test:mutation
 *
 * Copies BOTH builds (dist/ and dist-ghpages/) to a temp folder, breaks one thing at a time, serves the
 * broken copies to the real Playwright specs (TZ_SERVE_PREVIEW / TZ_SERVE_ROOT) and asserts that the
 * matching spec FAILS. If a mutation is not caught, the safety net has a hole. Never touches the working
 * tree or the real build output. Run `npm run build:all` first.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PREVIEW_BUILD = path.join(REPO, "dist-ghpages");
const ROOT_BUILD = path.join(REPO, "dist");

// apply(root, kind): kind is "preview" (base /Toolzenhub/) or "root" (base /). Return false to skip a copy.
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
    name: "calculator breadcrumb removed from the generated page",
    spec: "tests/browser/emi.spec.js",
    apply: (root) => edit(root, "calculators/emi/index.html", (s) => s.replace(/<div class="calculator-breadcrumb">[\s\S]*?<\/div>/, "")),
  },
  {
    name: "article body missing from the generated page",
    spec: "tests/browser/build.spec.js",
    grep: "emi-vs-total-interest",
    apply: (root) => edit(root, "articles/loan-comparison/emi-vs-total-interest/index.html", (s) => s.replace(/<article class="article">[\s\S]*?<\/article>/, '<article class="article"></article>')),
  },
  {
    name: "canonical points at the GitHub Pages preview",
    spec: "tests/browser/build.spec.js",
    grep: "canonical",
    apply: (root) => edit(root, "about.html", (s) => s.replace("https://toolzenhub.in/about.html", "https://salar500.github.io/Toolzenhub/about.html")),
  },
  {
    name: "footer link built without the deployment base (preview build)",
    spec: "tests/browser/links.spec.js",
    apply: (root, kind) => (kind === "preview" ? edit(root, "index.html", (s) => s.replace('href="/Toolzenhub/privacy.html"', 'href="/privacy.html"')) : false),
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

for (const dir of [PREVIEW_BUILD, ROOT_BUILD]) {
  if (!fs.existsSync(dir)) {
    console.error(`✗ ${path.basename(dir)}/ is missing - run  npm run build:all  first`);
    process.exit(2);
  }
}

// Under the project (gitignored), so the copies still resolve the project's package.json ("type": "module").
const parent = path.join(REPO, "tests", ".tmp");
fs.mkdirSync(parent, { recursive: true });
const tmp = fs.mkdtempSync(path.join(parent, "browser-mutation-"));
let missed = 0;
try {
  for (const m of MUTATIONS) {
    const base = path.join(tmp, m.name.replace(/\W+/g, "-"));
    const preview = path.join(base, "preview");
    const root = path.join(base, "root");
    fs.cpSync(PREVIEW_BUILD, preview, { recursive: true });
    fs.cpSync(ROOT_BUILD, root, { recursive: true });
    m.apply(preview, "preview");
    m.apply(root, "root");
    const args = ["playwright", "test", "--project=subpath-desktop", "--workers=1", m.spec];
    if (m.grep) args.push("-g", m.grep);
    const r = spawnSync("npx", args, { cwd: REPO, env: { ...process.env, TZ_SERVE_PREVIEW: preview, TZ_SERVE_ROOT: root }, encoding: "utf8", shell: true });
    const caught = r.status !== 0;
    if (!caught) missed++;
    console.log(`${caught ? "✓ caught " : "✗ MISSED"}  ${m.name}   (${m.spec}${m.grep ? ` -g "${m.grep}"` : ""})`);
    fs.rmSync(base, { recursive: true, force: true });
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (missed) {
  console.error(`\n${missed} mutation(s) were NOT caught by the browser tests.`);
  process.exit(1);
}
console.log("\n✓ every injected fault was caught by the browser tests.");
