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
import { buildAssetGraph, REPO } from "./lib.mjs";
import { readConfigExcludes, isExcluded } from "../helpers/jekyll-excludes.mjs";

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
// Deployment: _config.yml `exclude:` keeps development-only files out of the published site
// (GitHub Pages builds from the branch with Jekyll). It must exclude every dev-only path that exists,
// and must never exclude anything a live page needs.
// ---------------------------------------------------------------------------------------------
const DEV_ONLY = ["tests", "node_modules", "package.json", "package-lock.json", "playwright.config.js", "test-results", "playwright-report"];
const deployFailures = [];
const cfg = readConfigExcludes(REPO);
if (!cfg) deployFailures.push("_config.yml is missing or has no `exclude:` list — development-only files would be published by GitHub Pages");
else {
  if (cfg.globs.length) deployFailures.push(`_config.yml uses glob entries that cannot be verified here: ${cfg.globs.join(", ")}`);
  for (const d of DEV_ONLY) if (fs.existsSync(path.join(REPO, d)) && !isExcluded(d, REPO)) deployFailures.push(`development-only path "${d}" exists but is NOT excluded in _config.yml (it would be published)`);
  const needed = new Set([...reachable, ...inventory.live.map((p) => p.file), inventory.notFound.file, ...inventory.resources.map((r) => r.slice(1))]);
  for (const f of needed) if (isExcluded(f, REPO)) deployFailures.push(`"${f}" is used by the live site but is excluded from publishing by _config.yml / Jekyll defaults`);
}
console.log(`
Deployment (_config.yml): ${cfg ? `${cfg.entries.length} excluded entries (${cfg.entries.join(", ")})` : "no config"}`);
if (deployFailures.length) {
  failed = true;
  deployFailures.forEach((m) => console.log(`    ✗ ${m}`));
} else console.log("    ✓ all development-only paths are excluded; no live page/asset is excluded");

// informational: dead assets (files never referenced from any live page)
const infoDead = files.filter((f) => /\.(png|jpe?g|webp|gif|svg|ico|css|js)$/i.test(f) && !reachable.has(f));
console.log(`\nInfo: ${infoDead.length} asset/code files are NOT reachable from any live page (legacy/unused; see docs). Not a failure.`);

if (failed) {
  console.error("\n✗ Asset check FAILED");
  process.exit(1);
}
console.log("\n✓ Asset check passed: all live asset references exist with exact case.");
