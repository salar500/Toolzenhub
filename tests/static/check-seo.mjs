/**
 * M8 — SEO and static-rendering validator (no browser).
 *
 *   node tests/static/run-static.mjs seo      (runs it against dist/ and dist-ghpages/)
 *
 * Reads the GENERATED HTML of every live page and checks, without running any script:
 *   - title / description / canonical / Open Graph / Twitter tags, all on the PRODUCTION origin
 *     (the preview base and host must never appear in an absolute URL)
 *   - structured data: valid JSON, breadcrumbs match the visible breadcrumb, Article dates are ISO 8601,
 *     FAQ structured data only when the FAQ is visible on the page
 *   - published article bodies are in the HTML itself (not built by script)
 *   - tool pages are finished HTML with exactly one breadcrumb and load only their own scripts
 *   - the sitemap lists exactly the indexable live pages; robots.txt blocks nothing and names the sitemap
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { REPO, SITE_BASE, read } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(fs.readFileSync(process.env.TZ_INVENTORY || path.join(HERE, "..", "inventory", "url-inventory.json"), "utf8"));
const { SITE } = await import(pathToFileURL(path.join(REPO, "assets/js/site-config.js")).href);
const ORIGIN = SITE.origin;

// The tools a page may belong to come from the tool catalog, the source the build itself uses, so a new
// tool needs no change here. (routes.js reads window when it is imported; give it a harmless stand-in.)
globalThis.window = { location: { hostname: "seo-check.local", pathname: "/", search: "" } };
const { getPublishedTools } = await import(pathToFileURL(path.join(REPO, "assets/js/data/tools.js")).href);
const publishedTools = getPublishedTools();
const toolBySlug = new Map(publishedTools.map((tool) => [tool.id, tool]));
// the tool module's path from the site root, read from the catalog loader's literal import()
const moduleOf = (tool) => path.posix.normalize(path.posix.join("assets/js/data", String(tool.loader).match(/import\(\s*["']([^"']+)["']\s*\)/)[1]));

const failures = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&#x27;/g, "'");
const squash = (s) => decode(s).replace(/\s+/g, " ").trim();
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function headOf(html) {
  return html.slice(html.indexOf("<head"), html.indexOf("</head>"));
}
const metaContent = (head, attr, name) => {
  const out = [];
  for (const m of head.matchAll(/<meta\b[^>]*>/g)) {
    if (new RegExp(`${attr}="${name}"`).test(m[0])) out.push(decode((m[0].match(/content="([^"]*)"/) || [])[1] ?? ""));
  }
  return out;
};
const links = (head, rel) => [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((t) => new RegExp(`rel="${rel}"`).test(t)).map((t) => decode((t.match(/href="([^"]*)"/) || [])[1] ?? ""));
const jsonLd = (head) => [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const scriptsOf = (html) => [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((m) => m[1]);
const count = (html, re) => (html.match(re) || []).length;
const visibleCrumb = (html) => {
  const m = html.match(/<div class="calculator-breadcrumb">([\s\S]*?)<\/div>/);
  return m ? [...m[1].matchAll(/<(?:a|strong)\b[^>]*>\s*([\s\S]*?)\s*<\/(?:a|strong)>/g)].map((x) => squash(x[1])) : [];
};

const pages = [...inventory.live, inventory.notFound];
for (const p of pages) {
  const html = read(p.file);
  const head = headOf(html);
  const is404 = p.type === "404";
  const canonicalUrl = ORIGIN + p.url;

  /* ---- title, description ---- */
  const title = squash((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? "");
  if (title !== p.expectedTitle) fail(p.url, `title "${title}" differs from the inventory "${p.expectedTitle}"`);
  const descriptions = metaContent(head, "name", "description");
  if (descriptions.length !== 1 || !descriptions[0].trim()) fail(p.url, `needs exactly one non-empty meta description (found ${descriptions.length})`);

  /* ---- canonical, robots ---- */
  const canonicals = links(head, "canonical");
  const robots = metaContent(head, "name", "robots");
  if (is404) {
    if (canonicals.length) fail(p.url, "the 404 page must not declare a canonical");
    if (!robots.some((r) => /noindex/i.test(r))) fail(p.url, "the 404 page must be noindex");
  } else {
    if (canonicals.length !== 1) fail(p.url, `needs exactly one canonical (found ${canonicals.length})`);
    else if (canonicals[0] !== canonicalUrl) fail(p.url, `canonical "${canonicals[0]}" should be "${canonicalUrl}"`);
    if (robots.some((r) => /noindex/i.test(r))) fail(p.url, "an indexable page must not be noindex");
  }

  /* ---- Open Graph, Twitter ---- */
  if (!is404) {
    const og = (n) => metaContent(head, "property", n);
    const tw = (n) => metaContent(head, "name", n);
    if (og("og:title")[0] !== title) fail(p.url, "og:title differs from the page title");
    if (og("og:description")[0] !== descriptions[0]) fail(p.url, "og:description differs from the meta description");
    if (og("og:url")[0] !== canonicalUrl) fail(p.url, `og:url "${og("og:url")[0]}" should be "${canonicalUrl}"`);
    if (og("og:site_name")[0] !== SITE.name) fail(p.url, "og:site_name is missing or wrong");
    const wantType = p.type === "article" ? "article" : "website";
    if (og("og:type")[0] !== wantType) fail(p.url, `og:type should be "${wantType}"`);
    if (tw("twitter:title")[0] !== title) fail(p.url, "twitter:title differs from the page title");
    if (tw("twitter:description")[0] !== descriptions[0]) fail(p.url, "twitter:description differs from the meta description");
    const heroSrc = (html.match(/<figure\s+class="article-hero-image"\s*>[\s\S]*?<img[^>]*\bsrc="([^"]+)"/) || [])[1];
    const ogImage = og("og:image");
    if (p.type === "article" && heroSrc) {
      const sitePath = SITE_BASE !== "/" ? "/" + heroSrc.slice(SITE_BASE.length) : heroSrc;
      if (ogImage[0] !== ORIGIN + sitePath) fail(p.url, `og:image should be ${ORIGIN + sitePath}`);
      if (tw("twitter:image")[0] !== ogImage[0]) fail(p.url, "twitter:image differs from og:image");
      if (tw("twitter:card")[0] !== "summary_large_image") fail(p.url, "twitter:card should be summary_large_image");
    } else {
      if (ogImage.length || tw("twitter:image").length) fail(p.url, "an og/twitter image is declared for a page that has no image");
      if (tw("twitter:card")[0] !== "summary") fail(p.url, "twitter:card should be summary");
    }
  }

  /* ---- the preview host or base must never appear in metadata or structured data ---- */
  const metaText = [...head.matchAll(/<(?:meta|link)\b[^>]*>/g)].map((m) => m[0]).filter((t) => !/rel="(?:icon|stylesheet|preconnect)"/.test(t) && !/tz-site-base/.test(t)).join("\n") + jsonLd(head).join("\n");
  if (/github\.io/i.test(metaText)) fail(p.url, "the GitHub Pages host appears in SEO metadata");
  if (/https?:\/\/[^"\s]*\/Toolzenhub/.test(metaText)) fail(p.url, "the preview base appears in an absolute SEO URL");

  /* ---- structured data ---- */
  const blocks = [];
  for (const raw of jsonLd(head)) {
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      fail(p.url, "invalid JSON in a structured-data block");
    }
  }
  const byType = (t) => blocks.filter((b) => b["@type"] === t);
  const expectedTypes = p.type === "article" ? ["Article", "BreadcrumbList", "FAQPage"] : p.type === "calculator" || p.type === "directory" ? ["BreadcrumbList"] : [];
  const gotTypes = blocks.map((b) => b["@type"]).sort();
  if (JSON.stringify(gotTypes) !== JSON.stringify([...expectedTypes].sort())) fail(p.url, `structured data types [${gotTypes}] should be [${[...expectedTypes].sort()}]`);
  for (const crumb of byType("BreadcrumbList")) {
    const names = crumb.itemListElement.map((i) => i.name);
    const shown = visibleCrumb(html);
    if (JSON.stringify(names) !== JSON.stringify(shown)) fail(p.url, `breadcrumb structured data [${names}] differs from the visible breadcrumb [${shown}]`);
    crumb.itemListElement.forEach((item, i) => {
      if (item.position !== i + 1) fail(p.url, "breadcrumb positions are not sequential");
      if (item.item && !item.item.startsWith(ORIGIN + "/")) fail(p.url, `breadcrumb item "${item.item}" is not on the production origin`);
    });
    const last = crumb.itemListElement.at(-1);
    if (last.item !== canonicalUrl) fail(p.url, "the last breadcrumb item should be the page itself");
  }

  /* ---- published article: static body, ISO dates, FAQ only when visible ---- */
  if (p.type === "article") {
    const article = byType("Article")[0];
    const body = (html.match(/<article class="article">([\s\S]*?)<\/article>/) || [])[1] ?? "";
    const text = squash(body.replace(/<[^>]+>/g, " "));
    // A real article body, not an empty shell. How many sections an article has is an editorial choice.
    if (count(body, /class="article-section"/g) < 3 || text.length < 1500) fail(p.url, `article body is not in the HTML (${count(body, /class="article-section"/g)} sections, ${text.length} characters)`);
    if (count(html, /class="article-key-takeaways"/g) < 1) fail(p.url, "article body: key takeaways missing from the HTML");
    if (squash((html.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/) || [])[1] ?? "") !== p.expectedTitle.replace(/ \| ToolZen Hub$/, "")) fail(p.url, "the article <h1> is missing or differs from the title");
    if (article) {
      for (const f of ["datePublished", "dateModified"]) if (!ISO.test(article[f] ?? "")) fail(p.url, `Article ${f} "${article[f]}" is not ISO 8601 (YYYY-MM-DD)`);
      if (article.mainEntityOfPage?.["@id"] !== canonicalUrl) fail(p.url, "Article mainEntityOfPage should be the canonical URL");
      if (article.headline !== p.expectedTitle.replace(/ \| ToolZen Hub$/, "")) fail(p.url, "Article headline differs from the page title");
      if (article.publisher?.url !== SITE.url) fail(p.url, "Article publisher.url should be the production URL");
    }
    const faq = byType("FAQPage")[0];
    const visibleFaq = count(html, /<details\b/g);
    if (faq && faq.mainEntity.length > visibleFaq) fail(p.url, `FAQ structured data has ${faq.mainEntity.length} questions but only ${visibleFaq} are visible`);
  }

  /* ---- scripts: each page loads only what it needs ---- */
  const scripts = scriptsOf(html);
  const base = (s) => SITE_BASE + s;
  if (p.type === "calculator") {
    if (JSON.stringify(scripts) !== JSON.stringify([base("assets/js/entries/tool.js")])) fail(p.url, `scripts [${scripts}] should be only the tool entry`);
    if (count(html, /class="calculator-breadcrumb"/g) !== 1) fail(p.url, `needs exactly one breadcrumb (found ${count(html, /class="calculator-breadcrumb"/g)})`);
    const tool = toolBySlug.get(p.slug);
    const declared = (html.match(/data-tool-module="([^"]+)"/) || [])[1];
    if (!tool) {
      fail(p.url, `no published tool "${p.slug}" in the tool catalog`);
    } else {
      if (declared !== base(moduleOf(tool))) fail(p.url, `data-tool-module "${declared}" is not this tool's module`);
      // the finished tool markup is in the HTML itself: every id the tool's own markup() declares is present
      const ids = [...(await tool.loader()).markup().matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      const missing = ids.filter((id) => !html.includes(`id="${id}"`));
      if (!ids.length || missing.length) fail(p.url, `the tool markup is not in the HTML (${ids.length ? `missing ids: ${missing.join(", ")}` : "markup() declares no ids"})`);
      for (const other of publishedTools) {
        if (other.id !== tool.id && html.includes(moduleOf(other))) fail(p.url, `the page references another tool's module ${moduleOf(other)}`);
      }
    }
    // a tool that opts out of both related sections (no related tool or article exists yet) has none
    const mod = tool ? await tool.loader() : null;
    const optedOut = mod && mod.showRelatedCalculators === false && mod.showRelatedArticles === false;
    if (!optedOut && !/class="related-section"/.test(html)) fail(p.url, "related sections are not in the HTML");
  } else if (p.type === "article") {
    if (JSON.stringify(scripts) !== JSON.stringify([base("assets/js/entries/article.js")])) fail(p.url, `scripts [${scripts}] should be only the article entry`);
    if (count(html, /class="calculator-breadcrumb"/g) !== 1) fail(p.url, "needs exactly one breadcrumb");
  }

  /* ---- header and footer are in the HTML (not built by script) ---- */
  if (!is404) {
    if (!html.includes('class="site-header"')) fail(p.url, "the header is not in the HTML");
    if (!html.includes('class="footer"')) fail(p.url, "the footer is not in the HTML");
  }
}

/* ---- sitemap == indexable live pages, all on the production origin ---- */
const sitemap = read("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const wantLocs = inventory.live.filter((p) => p.classification === "live-indexable").map((p) => ORIGIN + p.url);
if (JSON.stringify([...locs].sort()) !== JSON.stringify([...wantLocs].sort())) fail("sitemap.xml", `lists [${locs.length}] URLs that differ from the ${wantLocs.length} indexable live pages`);
if (locs.some((l) => /github\.io|\/Toolzenhub/.test(l))) fail("sitemap.xml", "contains the preview host or base");

/* ---- robots.txt ---- */
const robots = read("robots.txt");
if (/^\s*Disallow:\s*\S/im.test(robots)) fail("robots.txt", "must not disallow anything (CSS, JavaScript and images are needed to render pages)");
if (!robots.split(/\r?\n/).some((l) => l.trim() === `Sitemap: ${ORIGIN}/sitemap.xml`)) fail("robots.txt", `needs the line "Sitemap: ${ORIGIN}/sitemap.xml"`);
if (/github\.io/i.test(robots)) fail("robots.txt", "mentions the preview host");

console.log(`SEO check · ${path.basename(REPO)} (base ${SITE_BASE}): ${pages.length} pages, sitemap ${locs.length} URLs, production origin ${ORIGIN}`);
if (failures.length) {
  console.error(`\n✗ SEO check FAILED (${failures.length}):`);
  failures.slice(0, 60).forEach((f) => console.error("  - " + f));
  if (failures.length > 60) console.error(`  … and ${failures.length - 60} more`);
  process.exit(1);
}
console.log("✓ SEO check passed");
