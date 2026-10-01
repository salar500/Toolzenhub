/**
 * M0.1 — Authoritative live URL inventory.
 *
 * Builds tests/inventory/url-inventory.json from repository reality:
 *   - every non-empty HTML file (live pages + the 404 document)
 *   - sitemap.xml membership  -> indexable vs non-indexable
 *   - <meta name="robots"> in the HTML
 *   - assets/js/data/calculators.js       -> calculators that are NOT built ("Coming soon")
 *   - assets/js/article-registry.js       -> articles that are NOT published ("Coming soon")
 *
 * Usage:
 *   node tests/inventory/generate-inventory.mjs          write the file
 *   node tests/inventory/generate-inventory.mjs --check  fail if the file is out of date
 *
 * The output is deterministic (no timestamps) so --check is stable. All URLs are expressed
 * relative to the SITE ROOT ("/" = site root), i.e. WITHOUT the /Toolzenhub/ GitHub Pages
 * prefix. Tests prepend whichever prefix the current deployment mode uses.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
export const INVENTORY_PATH = path.join(HERE, "url-inventory.json");

const SKIP_DIRS = new Set(["node_modules", "tests", "test-results", "playwright-report", ".git"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (f) => path.relative(REPO, f).split(path.sep).join("/");
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
const squash = (s) => decode(s).replace(/\s+/g, " ").trim();

function htmlMeta(file) {
  const html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>\s*([\s\S]*?)\s*<\/title>/i) || [])[1];
  const robots = (html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] ?? null;
  return { title: title ? squash(title) : null, robots };
}

/** url (site-root relative, leading slash) for an html file */
function urlFor(file) {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) return "/" + file.slice(0, -"index.html".length);
  return "/" + file;
}

/** page classification rules — every rule is checked by the smoke tests against the live DOM */
function describePage(file) {
  const m = {
    "index.html": { type: "home", primarySelector: "h1.hero__title", interactive: true, rendered: "client" },
    "categories.html": { type: "category-index", primarySelector: "#categories-grid .category-page-card", interactive: true, rendered: "client", queryVariants: ["?q=<search term>"] },
    "loans.html": { type: "category", primarySelector: "#loans-calculators-grid .calculator-card", interactive: true, rendered: "client" },
    "calculators.html": { type: "tool-index", primarySelector: "#calculators-grid .calculator-card", interactive: true, rendered: "client", queryVariants: ["?q=<search term>"] },
    "articles.html": { type: "article-index", primarySelector: "#articles-list .article-card", interactive: true, rendered: "client", queryVariants: ["?category=<category slug>"] },
    "about.html": { type: "info", primarySelector: "#app h1", interactive: false, rendered: "client" },
    "contact.html": { type: "contact", primarySelector: "form.contact-form", interactive: true, rendered: "static" },
    "privacy.html": { type: "legal", primarySelector: "article.legal-page__article", interactive: false, rendered: "static" },
    "terms.html": { type: "legal", primarySelector: "article.legal-page__article", interactive: false, rendered: "static" },
    "disclaimer.html": { type: "legal", primarySelector: "article.legal-page__article", interactive: false, rendered: "static" },
    "404.html": { type: "404", primarySelector: ".nf-card h1", interactive: true, rendered: "static" },
  };
  if (m[file]) return m[file];
  let g;
  if ((g = file.match(/^calculators\/([^/]+)\/index\.html$/))) {
    const primary = { emi: "#emi-form", "loan-comparison": "#compare-loans" }[g[1]] || ".calculator-page";
    return { type: "calculator", slug: g[1], primarySelector: primary, interactive: true, rendered: "client" };
  }
  if ((g = file.match(/^articles\/([^/]+)\/([^/]+)\/index\.html$/))) {
    return { type: "article", topic: g[1], slug: g[2], primarySelector: ".article-hero h1", interactive: false, rendered: "client" };
  }
  return { type: "unknown", primarySelector: "body", interactive: false, rendered: "unknown" };
}

async function loadComingSoon() {
  // routes.js reads window.location at import time; give it a harmless stand-in.
  globalThis.window = { location: { hostname: "inventory.local", pathname: "/", search: "" } };
  const calcMod = await import(pathToFileURL(path.join(REPO, "assets/js/data/calculators.js")).href);
  const artMod = await import(pathToFileURL(path.join(REPO, "assets/js/article-registry.js")).href);
  const calculators = calcMod.calculators
    .filter((c) => c.status !== "published")
    .map((c) => ({
      kind: "calculator",
      id: c.id,
      title: c.title,
      category: c.category,
      wouldBeUrl: `/calculators/${c.id}/`,
      hasHtmlFile: fs.existsSync(path.join(REPO, "calculators", c.id, "index.html")),
      mustReturn404: true,
    }));
  const articles = artMod.articleRegistry
    .filter((a) => a.published !== true)
    .map((a) => ({
      kind: "article",
      id: a.slug,
      title: a.title,
      category: a.category,
      wouldBeUrl: `/articles/${a.topic}/${a.slug}/`,
      hasHtmlFile: fs.existsSync(path.join(REPO, "articles", a.topic, a.slug, "index.html")),
      mustReturn404: true,
    }));
  const built = calcMod.calculators.filter((c) => c.status === "published").map((c) => c.id);
  const published = artMod.articleRegistry.filter((a) => a.published === true).map((a) => `${a.topic}/${a.slug}`);
  return { calculators, articles, built, published };
}

export async function buildInventory() {
  const sitemap = fs.readFileSync(path.join(REPO, "sitemap.xml"), "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // sitemap URLs are absolute on the production host; reduce to site-root-relative paths
  const sitemapPaths = new Set(sitemapUrls.map((u) => "/" + u.replace(/^https?:\/\/[^/]+\/[^/]+\//, "")));

  const htmlFiles = walk(REPO)
    .filter((f) => f.endsWith(".html") && fs.statSync(f).size > 10)
    .map(rel)
    .sort();

  const live = [];
  let notFound = null;
  for (const file of htmlFiles) {
    const { title, robots } = htmlMeta(path.join(REPO, file));
    const d = describePage(file);
    const url = urlFor(file);
    const isNoindex = robots !== null && /noindex/i.test(robots);
    const inSitemap = sitemapPaths.has(url);
    let classification;
    if (file === "404.html") classification = "404";
    else if (isNoindex || !inSitemap) classification = "live-non-indexable";
    else classification = "live-indexable";

    const entry = {
      url,
      file,
      classification,
      type: d.type,
      ...(d.slug ? { slug: d.slug } : {}),
      ...(d.topic ? { topic: d.topic } : {}),
      expectedTitle: title,
      primarySelector: d.primarySelector,
      expectsHeader: file !== "404.html",
      expectsFooter: file !== "404.html",
      interactive: d.interactive,
      renderedBy: d.rendered,
      inSitemap,
      robotsMeta: robots,
      ...(d.queryVariants ? { queryVariants: d.queryVariants } : {}),
    };
    if (file === "404.html") notFound = { ...entry, servedAtAnyMissingUrl: true, httpStatus: 404 };
    else live.push(entry);
  }

  const soon = await loadComingSoon();

  const inventory = {
    $comment:
      "Generated by tests/inventory/generate-inventory.mjs — do not edit by hand (npm run inventory:generate). URLs are relative to the SITE ROOT; prepend /Toolzenhub on GitHub Pages.",
    summary: {
      livePages: live.length,
      liveIndexable: live.filter((p) => p.classification === "live-indexable").length,
      liveNonIndexable: live.filter((p) => p.classification === "live-non-indexable").length,
      notFoundDocument: notFound ? 1 : 0,
      comingSoonCalculators: soon.calculators.length,
      comingSoonArticles: soon.articles.length,
      builtCalculators: soon.built,
      publishedArticles: soon.published,
    },
    live,
    notFound,
    comingSoon: [...soon.calculators, ...soon.articles],
    resources: ["/favicon.svg", "/robots.txt", "/sitemap.xml"].filter((r) => fs.existsSync(path.join(REPO, r.slice(1)))),
    redirectSeed: {
      note: "Every live URL must keep working (or redirect) in future migrations. Fill `to` only when a URL is intentionally moved.",
      entries: live.map((p) => ({ from: p.url, to: null })),
    },
  };
  return inventory;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const check = process.argv.includes("--check");
  const next = JSON.stringify(await buildInventory(), null, 2) + "\n";
  if (check) {
    const current = fs.existsSync(INVENTORY_PATH) ? fs.readFileSync(INVENTORY_PATH, "utf8").replace(/\r\n/g, "\n") : "";
    if (current !== next) {
      console.error("✗ tests/inventory/url-inventory.json is out of date with the repository.");
      console.error("  If the change is intentional run:  npm run inventory:generate  and review the diff.");
      const a = current.split("\n"), b = next.split("\n");
      for (let i = 0, shown = 0; i < Math.max(a.length, b.length) && shown < 12; i++) {
        if (a[i] !== b[i]) {
          console.error(`  line ${i + 1}:\n    - ${a[i] ?? "(missing)"}\n    + ${b[i] ?? "(missing)"}`);
          shown++;
        }
      }
      process.exit(1);
    }
    const inv = JSON.parse(next);
    console.log(`✓ URL inventory up to date: ${inv.summary.livePages} live pages (${inv.summary.liveIndexable} indexable, ${inv.summary.liveNonIndexable} non-indexable), 1 × 404 document, ${inv.comingSoon.length} Coming soon entries that must NOT be routes.`);
  } else {
    fs.writeFileSync(INVENTORY_PATH, next);
    const inv = JSON.parse(next);
    console.log(`Wrote ${rel(INVENTORY_PATH)}: ${inv.summary.livePages} live pages, ${inv.comingSoon.length} Coming soon entries.`);
  }
}
