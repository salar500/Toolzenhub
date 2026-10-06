/**
 * M0.4 — Internal link & route checker (no browser).
 *
 *   npm run test:links
 *
 * Static checks (the rendered-DOM crawl lives in tests/browser/links.spec.js):
 *   1. every <a href> in the real HTML files resolves to an existing page (exact case)
 *   2. hard-coded href="…" literals inside JS HTML templates resolve (when the file is live)
 *   3. sitemap.xml  <->  URL inventory (both directions) and every <loc> maps to a file
 *   4. robots.txt references the sitemap and does not disallow the whole site
 *   5. calculator + article ROUTES really point at existing pages, in BOTH deployment modes
 *      (GitHub Pages /Toolzenhub/ prefix and a root/custom domain)
 *   6. registry consistency: built calculators / published articles have an HTML shell and a
 *      loader; "Coming soon" entries have NO route
 *   7. no NEW file hard-codes the GitHub Pages path/host (baseline in known-issues.json)
 *
 * Intentionally non-clickable "Coming soon" items are NOT links, so they are never flagged.
 * Placeholder links (href="#") are listed separately; they are not failures.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { REPO, SITE_BASE, rel, read, checkUrlPath, checkPath, isExternalOrSkippable, resolveRef, htmlRefs, jsHtmlHrefs, stripComments, buildAssetGraph } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(fs.readFileSync(process.env.TZ_INVENTORY || path.join(HERE, "..", "inventory", "url-inventory.json"), "utf8"));
const knownAll = JSON.parse(fs.readFileSync(process.env.TZ_KNOWN || path.join(HERE, "known-issues.json"), "utf8"));
const knownLinks = knownAll.links ?? [];

// The production origin the sitemap and robots.txt must use: read from the BUILT site's own config.
const { SITE } = await import(pathToFileURL(path.join(REPO, "assets/js/site-config.js")).href);
const PRODUCTION_URL = SITE.url;

const failures = [];
const warnings = [];
const fail = (section, msg) => failures.push({ section, msg });
const warn = (section, msg) => warnings.push({ section, msg });

const livePages = inventory.live.map((p) => p.file);
const entryHtml = [...livePages, inventory.notFound.file];
const liveUrlSet = new Set(inventory.live.map((p) => p.url)); // e.g. "/", "/about.html", "/calculators/emi/"
const { reachable } = buildAssetGraph(entryHtml);

/* ---------------------------------------------------------------------------------------------- */
/* 1. <a href> in real HTML files                                                                  */
/* ---------------------------------------------------------------------------------------------- */
let anchorCount = 0;
const placeholders = [];
for (const file of entryHtml) {
  for (const r of htmlRefs(read(file))) {
    if (r.tag !== "a") continue;
    const raw = r.value;
    if (raw.trim() === "#" || raw.trim() === "") {
      placeholders.push(`${file}`);
      continue;
    }
    if (isExternalOrSkippable(raw)) continue;
    anchorCount++;
    // A build is made for ONE base (npm run build -> "/", npm run build:preview -> "/Toolzenhub/"). Every
    // root-relative link must carry exactly that base; a link with another base would break the site.
    if (SITE_BASE === "/" && raw.includes("/Toolzenhub")) fail("html-links", `${file}: the preview base leaked into the root-domain build: href "${raw}"`);
    if (raw.startsWith("/") && SITE_BASE !== "/" && !(raw + (raw.endsWith("/") ? "" : "/")).startsWith(SITE_BASE)) fail("html-links", `${file}: href "${raw}" does not start with this build's base ${SITE_BASE}`);
    const target = resolveRef(file, raw);
    const res = checkUrlPath(target);
    if (res.ok) continue;
    if (res.caseMismatch) fail("html-links", `${file}: href "${raw}" has a CASE MISMATCH (resolves to ${target}, actual ${res.caseMismatch})`);
    else fail("html-links", `${file}: href "${raw}" -> ${target} does not exist`);
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* 2. hard-coded href="literal" inside JS HTML templates                                           */
/* ---------------------------------------------------------------------------------------------- */
let jsHrefCount = 0;
const jsFiles = fs.existsSync(path.join(REPO, "assets")) ? [] : [];
const walkJs = (dir) => {
  for (const e of fs.readdirSync(path.join(REPO, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walkJs(p);
    else if (e.name.endsWith(".js")) jsFiles.push(p);
  }
};
for (const top of ["assets", "loans"]) if (fs.existsSync(path.join(REPO, top))) walkJs(top);
for (const f of jsFiles.sort()) {
  const isLive = reachable.has(f);
  for (const raw of jsHtmlHrefs(read(f))) {
    if (raw === "#" || raw === "") {
      placeholders.push(`${f} (JS template)`);
      continue;
    }
    if (isExternalOrSkippable(raw)) continue;
    jsHrefCount++;
    // JS-template links are used from site-root pages (about, categories …): resolve from the site root.
    const target = resolveRef("index.html", raw);
    const res = checkUrlPath(target);
    if (res.ok) continue;
    const msg = res.caseMismatch ? `CASE MISMATCH (${res.caseMismatch})` : "does not exist";
    const known = knownLinks.find((k) => k.file === f && k.ref === raw);
    if (!isLive) warn("js-template-links", `${f}: dead code href "${raw}" ${msg}${known ? " (known)" : ""}`);
    else if (known) warn("js-template-links", `${f}: href "${raw}" ${msg} (known: ${known.reason})`);
    else fail("js-template-links", `${f}: href "${raw}" ${msg}`);
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* 3. sitemap.xml <-> inventory                                                                    */
/* ---------------------------------------------------------------------------------------------- */
const sitemapPath = checkPath("sitemap.xml");
let sitemapCount = 0;
if (!sitemapPath.ok) fail("sitemap", "sitemap.xml is missing");
else {
  const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  sitemapCount = locs.length;
  const seen = new Set();
  const asSitePath = (u) => "/" + u.replace(/^https?:\/\/[^/]+\//, "");
  for (const loc of locs) {
    const p = asSitePath(loc);
    if (seen.has(p)) fail("sitemap", `duplicate <loc> ${loc}`);
    seen.add(p);
    if (!loc.startsWith(PRODUCTION_URL)) fail("sitemap", `<loc> ${loc} is not under the production URL ${PRODUCTION_URL}`);
    if (/github\.io|\/Toolzenhub/.test(loc)) fail("sitemap", `<loc> ${loc} contains the preview host or base`);
    const res = checkUrlPath(p.slice(1) === "" ? "index.html" : p.slice(1));
    if (!res.ok) fail("sitemap", `<loc> ${loc} -> ${p} does not exist${res.caseMismatch ? ` (case: ${res.caseMismatch})` : ""}`);
    if (!liveUrlSet.has(p)) fail("sitemap", `<loc> ${loc} is not a live page in the URL inventory`);
  }
  for (const p of inventory.live.filter((x) => x.classification === "live-indexable")) {
    if (!seen.has(p.url)) fail("sitemap", `indexable live page ${p.url} is missing from sitemap.xml`);
  }
  for (const c of inventory.comingSoon) if (seen.has(c.wouldBeUrl)) fail("sitemap", `Coming soon URL ${c.wouldBeUrl} must not be in sitemap.xml`);
  if (/404\.html/.test(read("sitemap.xml"))) fail("sitemap", "404.html must not be in sitemap.xml");
}

/* ---------------------------------------------------------------------------------------------- */
/* 4. robots.txt                                                                                   */
/* ---------------------------------------------------------------------------------------------- */
if (!checkPath("robots.txt").ok) fail("robots", "robots.txt is missing");
else {
  const robots = read("robots.txt");
  const sitemapLines = robots.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^sitemap:/i.test(l));
  if (!sitemapLines.some((l) => l.replace(/^sitemap:\s*/i, "") === `${PRODUCTION_URL}sitemap.xml`)) fail("robots", `robots.txt has no Sitemap: line for ${PRODUCTION_URL}sitemap.xml`);
  if (/github\.io/.test(robots)) fail("robots", "robots.txt mentions the preview host");
  if (/^\s*Disallow:\s*\/\s*$/im.test(robots)) fail("robots", "robots.txt disallows the whole site");
  if (!/^\s*User-agent:\s*\*/im.test(robots)) fail("robots", "robots.txt has no 'User-agent: *' group");
}

/* ---------------------------------------------------------------------------------------------- */
/* 5. ROUTES contract in both deployment modes + routes point at real pages                         */
/* ---------------------------------------------------------------------------------------------- */
async function loadRoutes(hostname, tag) {
  globalThis.window = { location: { hostname, pathname: "/", search: "" } };
  const url = pathToFileURL(path.join(REPO, "assets/js/routes.js")).href + `?mode=${tag}`;
  return (await import(url)).ROUTES;
}
const prefixRoutes = await loadRoutes("salar500.github.io", "pages");
const rootRoutes = await loadRoutes("tools.example.org", "root");
const eq = (label, got, want) => got === want || fail("routes", `${label}: expected "${want}", got "${got}"`);
eq("pages home", prefixRoutes.home, "/Toolzenhub/");
eq("root home", rootRoutes.home, "/");
eq("pages calculator", prefixRoutes.calculator("emi"), "/Toolzenhub/calculators/emi/");
eq("root calculator", rootRoutes.calculator("emi"), "/calculators/emi/");
eq("pages article", prefixRoutes.article("loan-comparison", "x"), "/Toolzenhub/articles/loan-comparison/x/");
eq("root article", rootRoutes.article("loan-comparison", "x"), "/articles/loan-comparison/x/");
eq("pages asset", prefixRoutes.asset("/assets/Images/a.png"), "/Toolzenhub/assets/Images/a.png");
eq("root asset", rootRoutes.asset("/assets/Images/a.png"), "/assets/Images/a.png");
eq("asset passes absolute URLs through", prefixRoutes.asset("https://images.example/x.jpg"), "https://images.example/x.jpg");
for (const key of ["categories", "loans", "articles", "about", "contact", "terms", "disclaimer", "privacy", "calculators"]) {
  const root = rootRoutes[key];
  const target = root.slice(1);
  const r = checkUrlPath(target);
  if (!r.ok) fail("routes", `ROUTES.${key} (${root}) does not point at an existing page`);
  else if (!liveUrlSet.has(root)) fail("routes", `ROUTES.${key} (${root}) is not in the URL inventory`);
  if (prefixRoutes[key] !== "/Toolzenhub" + root) fail("routes", `ROUTES.${key} differs between modes: ${prefixRoutes[key]} vs ${root}`);
}

/* ---------------------------------------------------------------------------------------------- */
/* 6. registry consistency                                                                         */
/* ---------------------------------------------------------------------------------------------- */
const calcMod = await import(pathToFileURL(path.join(REPO, "assets/js/data/tools.js")).href + "?c=1");
const artMod = await import(pathToFileURL(path.join(REPO, "assets/js/article-registry.js")).href + "?c=1");
const articleCatalogMod = await import(pathToFileURL(path.join(REPO, "assets/js/data/articles.js")).href + "?c=1");
const articleLoaderSrc = stripComments(read("assets/js/data/articles.js")); // content loaders live in the article catalog (M5)

let routeChecks = 0;
for (const c of calcMod.tools) {
  const built = c.status === "published";
  if (!["published", "coming-soon"].includes(c.status)) fail("registry", `calculator "${c.id}": status must be "published" or "coming-soon" (got ${JSON.stringify(c.status)})`);
  if (c.available !== built) fail("registry", `calculator "${c.id}": available (${c.available}) disagrees with status "${c.status}"`);
  const route = c.sitePath || rootRoutes.calculator(c.id); // a tool's page lives under its section's prefix (/calculators/..., /tools/...)
  const shell = checkUrlPath(route.slice(1));
  const loaderMatch = String(c.loader ?? "").match(/import\(\s*"([^"]+)"/); // the loader is part of the catalog entry (E3)
  routeChecks++;
  if (built) {
    if (!shell.ok) fail("registry", `built calculator "${c.id}": no page at ${route}`);
    if (!liveUrlSet.has(route)) fail("registry", `built calculator "${c.id}": ${route} missing from URL inventory`);
    if (!loaderMatch) fail("registry", `built calculator "${c.id}": no loader in data/tools.js`);
    else if (!checkPath(resolveRef("assets/js/data/tools.js", loaderMatch[1])).ok) fail("registry", `built calculator "${c.id}": loader imports missing module ${loaderMatch[1]}`);
    if (c.href !== route) fail("registry", `built calculator "${c.id}": catalogue href "${c.href}" differs from ROUTES.calculator "${route}"`);
  } else {
    if (shell.ok) fail("registry", `Coming soon calculator "${c.id}" already has a page at ${route} (mark it published or remove the page)`);
    if (loaderMatch) fail("registry", `Coming soon calculator "${c.id}" has a loader but is not available`);
  }
}
for (const a of articleCatalogMod.articles) {
  if (!["published", "coming-soon"].includes(a.status)) fail("registry", `article "${a.slug}": status must be "published" or "coming-soon" (got ${JSON.stringify(a.status)})`);
  if (a.published !== (a.status === "published")) fail("registry", `article "${a.slug}": published (${a.published}) disagrees with status "${a.status}"`);
}
for (const a of artMod.articleRegistry) {
  const published = a.published === true;
  const route = rootRoutes.article(a.topic, a.slug);
  const shell = checkUrlPath(route.slice(1));
  const loader = articleLoaderSrc.match(new RegExp(`"${a.topic}/${a.slug}"\\s*:\\s*\\(\\)\\s*=>\\s*import\\(\\s*"([^"]+)"`));
  routeChecks++;
  if (published) {
    if (!shell.ok) fail("registry", `published article "${a.slug}": no page at ${route}`);
    if (!liveUrlSet.has(route)) fail("registry", `published article "${a.slug}": ${route} missing from URL inventory`);
    if (!loader) fail("registry", `published article "${a.slug}": no loader in data/articles.js`);
    else if (!checkPath(resolveRef("assets/js/data/articles.js", loader[1])).ok) fail("registry", `published article "${a.slug}": loader imports missing module ${loader[1]}`);
  } else {
    if (shell.ok) fail("registry", `Coming soon article "${a.slug}" already has a page at ${route}`);
    if (loader) fail("registry", `Coming soon article "${a.slug}" has a loader but is not published`);
  }
}
// every live HTML shell under calculators/ and articles/ must be in a registry (no orphan pages)
for (const p of inventory.live) {
  if (p.type === "calculator" && !calcMod.tools.some((c) => c.status === "published" && c.id === p.slug)) fail("registry", `orphan page ${p.url}: no 'available' calculator "${p.slug}" in data/tools.js`);
  if (p.type === "article" && !artMod.articleRegistry.some((a) => a.published === true && a.topic === p.topic && a.slug === p.slug)) fail("registry", `orphan page ${p.url}: no published article in article-registry.js`);
}

/* ---------------------------------------------------------------------------------------------- */
/* 7. hard-coded GitHub Pages path / host in source (guard against NEW occurrences)                 */
/* ---------------------------------------------------------------------------------------------- */
const hardcoded = [];
// Built HTML legitimately carries its base (/Toolzenhub/ in the preview build), so HTML is only scanned in the root build.
const sourceFiles = [...jsFiles, ...(SITE_BASE === "/" ? entryHtml : [])];
for (const f of sourceFiles) {
  const src = f.endsWith(".js") ? stripComments(read(f)) : read(f).replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const hits = [...src.matchAll(/\/Toolzenhub|salar500\.github\.io/g)].length;
  if (hits) hardcoded.push({ file: f, hits, live: reachable.has(f) });
}
const baselineFiles = (knownAll.hardcodedSitePrefix?.files ?? []).map((x) => x.file);
for (const h of hardcoded) {
  if (!baselineFiles.includes(h.file)) fail("hardcoded-prefix", `${h.file} hard-codes the GitHub Pages path/host (${h.hits}×) and is not in the known baseline`);
}

/* ---------------------------------------------------------------------------------------------- */
/* report                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
console.log("Link check");
console.log(`  HTML anchors checked ........ ${anchorCount} (${entryHtml.length} pages)`);
console.log(`  JS-template href literals ... ${jsHrefCount}`);
console.log(`  sitemap <loc> entries ....... ${sitemapCount} (inventory: ${inventory.summary.liveIndexable} indexable)`);
console.log(`  catalogue/registry entries .. ${routeChecks} (${inventory.summary.builtCalculators.length} calculators built, ${inventory.summary.publishedArticles.length} articles published, ${inventory.comingSoon.length} Coming soon with no route)`);
console.log(`  placeholder links (href="#")  ${placeholders.length}${placeholders.length ? "  -> " + [...new Set(placeholders)].join(", ") : ""}`);
console.log(`  files hard-coding /Toolzenhub or the github.io host: ${hardcoded.length}${hardcoded.length ? "\n      " + hardcoded.map((h) => `${h.file} (${h.hits}×${h.live ? "" : ", dead code"})`).join("\n      ") : ""}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  - [${w.section}] ${w.msg}`));
}
if (failures.length) {
  console.error(`\n✗ Link check FAILED (${failures.length}):`);
  failures.forEach((f) => console.error(`  - [${f.section}] ${f.msg}`));
  process.exit(1);
}
console.log("\n✓ Link check passed.");
