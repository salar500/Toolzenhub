/**
 * M0.5 — Asset reference checker (no browser).
 *
 *   npm run test:assets
 *
 * Verifies that every LOCAL asset referenced by the site exists with EXACT case:
 *   HTML   <link href> (css, icons, preload…), <script src>, <img src/srcset>, <source>
 *   CSS    @import, url(...)
 *   JS     static + dynamic import("...") specifiers, and asset-path string literals
 *          (images, css, json … e.g. "/assets/Images/articles/x.png")
 *
 * Problems are split by whether the referencing file is REACHABLE from a live page:
 *   LIVE   -> always a failure
 *   DEAD   -> unreachable legacy code; reported, and only fails if it is NOT listed in
 *             tests/static/known-issues.json (the pre-existing baseline)
 *
 * Case-sensitivity: resolution is exact-case. A reference that only matches with different
 * case is reported as CASE MISMATCH (works on Windows/macOS dev machines, 404s on GitHub Pages).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAssetGraph, REPO, SITE_BASE, read, resolveRef, checkPath } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(fs.readFileSync(process.env.TZ_INVENTORY || path.join(HERE, "..", "inventory", "url-inventory.json"), "utf8"));
const known = JSON.parse(fs.readFileSync(process.env.TZ_KNOWN || path.join(HERE, "known-issues.json"), "utf8")).assets ?? [];

const entryHtml = [...inventory.live.map((p) => p.file), inventory.notFound.file];
const { problems, reachable, stats, files } = buildAssetGraph(entryHtml);

const live = problems.filter((p) => reachable.has(p.file));
const dead = problems.filter((p) => !reachable.has(p.file));
const isKnown = (p) => known.some((k) => k.file === p.file && k.ref === p.ref);
const deadKnown = dead.filter(isKnown);
const deadNew = dead.filter((p) => !isKnown(p));
const staleBaseline = known.filter((k) => !problems.some((p) => p.file === k.file && p.ref === k.ref));

const line = (p) => `    • ${p.file}\n        ${p.kind}: "${p.ref}"  ->  ${p.problem}: ${p.detail}`;
console.log(`Asset check: ${stats.html} HTML, ${stats.css} CSS, ${stats.js} JS files scanned; ${stats.refs} local references resolved (${stats.external} external skipped).`);
console.log(`Reachable from live pages: ${reachable.size} files (${[...reachable].filter((f) => f.endsWith(".js")).length} JS, ${[...reachable].filter((f) => f.endsWith(".css")).length} CSS).`);
if (stats.dynamicTemplateFiles.length) console.log(`Note: ${stats.dynamicTemplateFiles.length} file(s) use computed import() specifiers (cannot be checked statically): ${stats.dynamicTemplateFiles.join(", ")}`);

let failed = false;
console.log(`\nLIVE problems (referenced from live pages): ${live.length}`);
if (live.length) {
  failed = true;
  live.forEach((p) => console.log(line(p)));
}
console.log(`DEAD-CODE problems already in baseline (known, not failing): ${deadKnown.length}`);
deadKnown.forEach((p) => console.log(line(p) + `\n        known: ${known.find((k) => k.file === p.file && k.ref === p.ref).reason}`));
console.log(`NEW dead-code problems (not in baseline): ${deadNew.length}`);
if (deadNew.length) {
  failed = true;
  deadNew.forEach((p) => console.log(line(p)));
  console.log("  If these are intentional/pre-existing add them to tests/static/known-issues.json with a reason.");
}
if (staleBaseline.length) {
  console.log(`\nBaseline entries that no longer occur (clean them out of known-issues.json): ${staleBaseline.length}`);
  staleBaseline.forEach((k) => console.log(`    • ${k.file}  "${k.ref}"`));
}

// ---------------------------------------------------------------------------------------------
// Build output: exactly the deployable site. Nothing from the repository root (tests, node_modules,
// package files, configs, sources) may be in it, and every tool module a page names must exist.
// ---------------------------------------------------------------------------------------------
const DEV_ONLY = ["tests", "node_modules", "package.json", "package-lock.json", "playwright.config.js", "test-results", "playwright-report", "src", "scripts", "eleventy.config.js", "eleventy.preview.config.js", "eleventy.shared.js", "_config.yml", ".git", ".gitignore"];
const allowedTop = new Set([
  ...inventory.live.map((p) => p.file.split("/")[0]),
  inventory.notFound.file,
  ...inventory.resources.map((r) => r.slice(1).split("/")[0]),
  "assets", "loans", "data", ".htaccess",
]);
const deployFailures = [];
for (const name of fs.readdirSync(REPO)) {
  if (DEV_ONLY.includes(name)) deployFailures.push(`development-only path "${name}" is in the build output`);
  else if (!allowedTop.has(name)) deployFailures.push(`unexpected top-level entry "${name}" in the build output`);
}
if (SITE_BASE !== "/" && fs.existsSync(path.join(REPO, ".htaccess"))) deployFailures.push(".htaccess belongs to the root-domain build only");
for (const page of inventory.live.filter((p) => p.type === "calculator")) {
  const html = read(page.file);
  const m = html.match(/data-tool-module="([^"]+)"/);
  if (!m) { deployFailures.push(`${page.file}: no data-tool-module attribute`); continue; }
  const target = resolveRef(page.file, m[1]);
  const res = checkPath(target);
  if (!res.ok) deployFailures.push(`${page.file}: tool module "${m[1]}" -> ${target} ${res.caseMismatch ? `CASE MISMATCH (${res.caseMismatch})` : "does not exist"}`);
  if (!m[1].startsWith(SITE_BASE)) deployFailures.push(`${page.file}: tool module "${m[1]}" does not start with this build's base ${SITE_BASE}`);
}
console.log(`
Build output (${path.basename(REPO)}, base ${SITE_BASE}): ${fs.readdirSync(REPO).length} top-level entries`);
if (deployFailures.length) {
  failed = true;
  deployFailures.forEach((m) => console.log(`    ✗ ${m}`));
} else console.log("    ✓ only deployable site files; every tool module a page names exists");

// informational: dead assets (files never referenced from any live page)
const infoDead = files.filter((f) => /\.(png|jpe?g|webp|gif|svg|ico|css|js)$/i.test(f) && !reachable.has(f));
console.log(`\nInfo: ${infoDead.length} asset/code files are NOT reachable from any live page (legacy/unused; see docs). Not a failure.`);

if (failed) {
  console.error("\n✗ Asset check FAILED");
  process.exit(1);
}
console.log("\n✓ Asset check passed: all live asset references exist with exact case.");
