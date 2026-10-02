/**
 * M7: content relationships (data/relationships.js) - tool<->tool, tool->article, article->tool,
 * article<->article. Curated links first, automatic fallback second.
 *
 * `OLD_*` are LITERAL copies of how the pages chose related content before M7.
 */
import { test, describe, before, afterEach } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let rel, calcs, articles, cats, legacy, registry;
before(async () => {
  rel = await import("../../assets/js/data/relationships.js");
  calcs = await import("../../assets/js/data/calculators.js");
  articles = await import("../../assets/js/data/articles.js");
  cats = await import("../../assets/js/data/categories.js");
  legacy = await import("../../assets/js/article-registry.js");
  registry = await import("../../assets/js/calculator-registry.js");
  PUBLISHED = articles.articles.filter((a) => a.published).map((a) => a.key);
});

/* ---------- how the pages chose related content before M7 ---------- */
const OLD_RELATED_TOOLS = (slug) => {          // components/related-calculators.js
  const category = registry.calculatorMetadata[slug]?.category;
  if (!category) return [];
  return Object.entries(registry.calculatorMetadata).filter(([s, m]) => m.category === category && s !== slug).map(([s]) => s).slice(0, 6);
};
const OLD_RELATED_ARTICLES = (slug) => {       // components/related-articles.js
  const category = registry.calculatorMetadata[slug]?.category;
  if (!category) return [];
  return legacy.articleRegistry.filter((a) => a.published === true && a.category === category).slice(0, 6).map((a) => a.id);
};

const toolIds = (xs) => xs.map((t) => t.id);
const keys = (xs) => xs.map((a) => a.key);
let PUBLISHED;

describe("current relationships (parity with the pre-M7 selection)", () => {
  test("tool -> related tools: same category, published, never itself", () => {
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("loan-comparison")), ["emi"]);
    assert.deepEqual(rel.getRelatedTools("nope"), []);
    for (const slug of Object.keys(registry.calculatorMetadata)) assert.deepEqual(toolIds(rel.getRelatedTools(slug, { limit: 6 })), OLD_RELATED_TOOLS(slug), slug);
  });

  test("tool -> related articles: the six published loan articles, in catalog order, for both tools", () => {
    for (const slug of ["emi", "loan-comparison"]) {
      assert.deepEqual(keys(rel.getRelatedArticlesForTool(slug, { limit: 6 })), PUBLISHED, slug);
      assert.deepEqual(rel.getRelatedArticlesForTool(slug, { limit: 6 }).map((a) => a.id), OLD_RELATED_ARTICLES(slug), slug);
    }
    assert.deepEqual(rel.getRelatedArticlesForTool("sip"), []); // a tool with no category match and no articles
  });

  test("article -> related tools: Loan Comparison first (curated), then the rest of the category", () => {
    for (const key of PUBLISHED) assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(key)), ["loan-comparison", "emi"], key);
    assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(PUBLISHED[0], { fill: false })), ["loan-comparison"]);
  });

  test("article -> related articles: exactly the curated list, in order, not padded", () => {
    for (const key of PUBLISHED) {
      const entry = articles.getArticleByKey(key);
      assert.deepEqual(keys(rel.getRelatedArticles(key)), entry.related, key);
      assert.equal(rel.getRelatedArticles(key).length, 5, key);
    }
  });

  test("coming-soon items are never returned", () => {
    for (const slug of Object.keys(registry.calculatorMetadata)) {
      assert.ok(rel.getRelatedTools(slug).every((t) => t.available));
      assert.ok(rel.getRelatedArticlesForTool(slug).every((a) => a.published));
    }
    assert.deepEqual(rel.getRelatedArticles("investment/best-sip-strategies-for-beginners"), [...rel.getRelatedArticles("investment/best-sip-strategies-for-beginners")].filter((a) => a.published));
  });
});

describe("curated first, automatic second", () => {
  const emi = () => calcs.getCalculatorById("emi");
  const first = () => articles.getArticleByKey(PUBLISHED[0]);
  let savedRelated;
  afterEach(() => {
    delete emi().relatedTools;
    delete emi().relatedArticles;
    delete emi().subcategory;
    if (savedRelated) first().related = savedRelated;
    savedRelated = null;
    cats.subcategories.length = 0;
  });

  test("a curated article for a tool comes first and is not repeated by the fallback", () => {
    emi().relatedArticles = ["loan-comparison/choose-right-loan-tenure"];
    const got = keys(rel.getRelatedArticlesForTool("emi", { limit: 6 }));
    assert.equal(got[0], "loan-comparison/choose-right-loan-tenure");
    assert.equal(got.length, 6);
    assert.equal(new Set(got).size, 6);
    assert.deepEqual(got.slice(1), PUBLISHED.filter((k) => k !== "loan-comparison/choose-right-loan-tenure").slice(0, 5));
  });

  test("curated tools are kept first; unpublished or unknown curated ids are skipped", () => {
    emi().relatedTools = ["home-loan", "nope", "loan-comparison"];
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison"]);
  });

  test("fill: false returns only the curated list (no automatic additions)", () => {
    emi().relatedArticles = ["loan-comparison/choose-right-loan-tenure"];
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("emi", { fill: false })), ["loan-comparison/choose-right-loan-tenure"]);
  });

  test("the subject is dropped BEFORE the limit, so a limit never comes back short", () => {
    assert.equal(rel.getRelatedArticles(PUBLISHED[0], { limit: 5, fill: true }).length, 5);
    assert.equal(rel.getRelatedToolsForArticle(PUBLISHED[0], { limit: 2 }).length, 2);
  });

  test("an article with no curated list falls back to the other published articles of its category", () => {
    savedRelated = first().related;
    first().related = [];
    assert.deepEqual(keys(rel.getRelatedArticles(PUBLISHED[0])), PUBLISHED.slice(1));
  });

  test("a curated article list is never replaced or padded by the automatic one", () => {
    savedRelated = first().related;
    first().related = [PUBLISHED[3], PUBLISHED[1]];
    assert.deepEqual(keys(rel.getRelatedArticles(PUBLISHED[0])), [PUBLISHED[3], PUBLISHED[1]]);
  });

  test("subcategory: tools in the same subcategory come before the rest of the category", () => {
    cats.subcategories.push({ id: "test-sub", category: "loans", title: "Test" });
    const home = calcs.getCalculatorById("home-loan");
    const wasAvailable = home.available;
    try {
      home.available = true;          // temporarily "published"
      emi().subcategory = "test-sub";
      home.subcategory = "test-sub";
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["home-loan", "loan-comparison"]);
      delete home.subcategory;
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "home-loan"]);
    } finally {
      home.available = wasAvailable;
      delete home.subcategory;
    }
  });
});
