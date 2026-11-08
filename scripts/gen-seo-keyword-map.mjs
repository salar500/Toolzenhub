/**
 * Generates docs/seo-keyword-map.json: an INTERNAL planning resource built only from the site's own catalogs
 * (names, aliases, categories, curated relationships). It holds no search-volume or ranking figures and nothing in it is published
 * on any page; Google ignores the meta keywords tag, so none is emitted. Run: node scripts/gen-seo-keyword-map.mjs
 */
import fs from "node:fs";
globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };

const inventory = JSON.parse(fs.readFileSync("tests/inventory/url-inventory.json", "utf8"));
const { getPublishedTools } = await import("../assets/js/data/tools.js");
const { getPublishedArticles } = await import("../assets/js/data/articles.js");
const { getRelatedTools, getRelatedArticlesForTool } = await import("../assets/js/data/relationships.js");

const tools = getPublishedTools();
const articles = getPublishedArticles();
const byRoute = new Map();
for (const t of tools) byRoute.set(t.sitePath ?? `/${t.id}/`, t);
const articleByUrl = new Map(articles.map((a) => [`/articles/${a.topic}/${a.slug}/`, a]));

const strip = (s) => s.replace(/\s*\|\s*ToolZen Hub$/, "");
const uniq = (a) => [...new Set(a.filter(Boolean).map((x) => String(x).trim()).filter(Boolean))];
const lc = (s) => String(s).toLowerCase();

const entries = [];
for (const p of inventory.live) {
  const title = strip(p.expectedTitle);
  const e = { url: p.url, type: p.type, title, primaryKeyword: "", secondaryKeywords: [], searchIntent: "", relatedSearchPhrases: [], relatedTools: [], articleOpportunities: [], cannibalizationWarnings: [], contentGaps: [] };
  const tool = byRoute.get(p.url);
  const art = articleByUrl.get(p.url);
  if (tool) {
    const name = tool.name ?? tool.title ?? tool.id;
    e.primaryKeyword = lc(name);
    e.secondaryKeywords = uniq([...(tool.aliases ?? []), ...(tool.keywords ?? [])].map(lc));
    e.searchIntent = p.type === "calculator" ? "transactional/tool: the visitor wants to calculate now" : "transactional/tool: the visitor wants to use the tool now";
    e.relatedSearchPhrases = uniq([`${lc(name)} online`, `${lc(name)} free`, `how to use ${lc(name)}`, `${lc(name)} formula`].slice(0, p.type === "calculator" ? 4 : 3));
    try { e.relatedTools = uniq(getRelatedTools(tool.id).map((t) => t.sitePath ?? t.id)); } catch { /* none */ }
    let rel = [];
    try { rel = getRelatedArticlesForTool(tool.id); } catch { /* none */ }
    e.articleOpportunities = rel.length ? [] : [`no guide article yet for ${lc(name)}: a "how it works" or "common mistakes" guide would serve the informational intent`];
    if (!rel.length && p.type === "calculator") e.contentGaps.push("no supporting article");
  } else if (art) {
    e.primaryKeyword = lc(art.title).replace(/[:?].*$/, "").trim();
    e.secondaryKeywords = uniq([art.topic?.replace(/-/g, " "), art.category]).map(lc);
    e.searchIntent = "informational: the visitor wants to understand a concept before or after calculating";
    e.relatedSearchPhrases = uniq([`${e.primaryKeyword} explained`, `${e.primaryKeyword} example`]);
    e.relatedTools = uniq((art.tools ?? []).map((id) => `tool:${id}`));
  } else if (p.type === "learn") {
    // Practice Labs: lessons, modules, paths and interview pages answer learning questions; the home and departments browse
    e.primaryKeyword = lc(title).replace(/\s*\|.*$/, "").trim();
    const slug = p.url.replace(/^\/practice-labs\/|\/$/g, "");
    const browse = slug === "" || !slug.includes("/");
    e.searchIntent = browse ? "navigational: browse learning paths and labs" : "informational: the visitor wants to learn and practise a skill";
    e.relatedSearchPhrases = browse ? [] : uniq([`learn ${e.primaryKeyword}`, `${e.primaryKeyword} practice`, `${e.primaryKeyword} tutorial`]);
  } else {
    e.primaryKeyword = lc(title).replace(/\s*[|:–-].*$/, "").trim();
    e.searchIntent = { home: "navigational/brand", "tool-index": "navigational: browse all tools", "article-index": "navigational: browse guides", category: "navigational/commercial investigation: a category of tools", "category-index": "navigational", directory: "navigational", legal: "navigational/trust", info: "navigational/trust", contact: "navigational/trust" }[p.type] ?? "navigational";
  }
  entries.push(e);
}

// cannibalization: the same primary keyword, or the same alias claimed by two pages
const byPrimary = new Map(), byAlias = new Map();
for (const e of entries) {
  (byPrimary.get(e.primaryKeyword) ?? byPrimary.set(e.primaryKeyword, []).get(e.primaryKeyword)).push(e);
  if (e.type !== "article") for (const k of e.secondaryKeywords) (byAlias.get(k) ?? byAlias.set(k, []).get(k)).push(e);
}
for (const [k, list] of byPrimary) if (k && list.length > 1) for (const e of list) e.cannibalizationWarnings.push(`primary keyword "${k}" is also the primary keyword of ${list.filter((x) => x !== e).map((x) => x.url).join(", ")}`);
for (const [k, list] of byAlias) if (list.length > 1) for (const e of list) e.cannibalizationWarnings.push(`secondary keyword "${k}" is also claimed by ${list.filter((x) => x !== e).map((x) => x.url).join(", ")}`);

const gaps = entries.filter((e) => e.contentGaps.length).map((e) => e.url);
const out = {
  "$comment": "INTERNAL planning file. Not published, not a ranking mechanism, no search volumes. Built from the site's catalogs by scripts/gen-seo-keyword-map.mjs; regenerate after the catalog changes. Use it to improve real titles, descriptions, headings, copy and internal links naturally; never as a hidden keyword block (Google ignores the meta keywords tag).",
  generated: new Date().toISOString().slice(0, 10),
  pages: entries.length,
  summary: { calculatorsWithoutSupportingArticle: gaps.length, pagesWithCannibalizationWarnings: entries.filter((e) => e.cannibalizationWarnings.length).length },
  pages_: entries,
};
out.entries = out.pages_; delete out.pages_;
fs.writeFileSync("docs/seo-keyword-map.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.pages, JSON.stringify(out.summary));
