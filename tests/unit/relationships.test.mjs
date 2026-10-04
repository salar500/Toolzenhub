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
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "balance-transfer", "prepayment"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("loan-comparison")), ["emi", "balance-transfer", "prepayment"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("prepayment")), ["emi", "loan-comparison", "balance-transfer"]); // curated order
    assert.deepEqual(toolIds(rel.getRelatedTools("balance-transfer")), ["prepayment", "emi", "loan-comparison"]); // curated order
    assert.deepEqual(rel.getRelatedTools("nope"), []);
    // parity with the pre-M7 rule for every tool without a curated list (the Loan Prepayment page curates its own order)
    for (const slug of Object.keys(registry.calculatorMetadata).filter((s) => !["prepayment", "balance-transfer"].includes(s))) assert.deepEqual(toolIds(rel.getRelatedTools(slug, { limit: 6 })), OLD_RELATED_TOOLS(slug), slug);
  });

  test("tool -> related articles: the first six published loan articles, in catalog order, for EMI and Loan Comparison", () => {
    for (const slug of ["emi", "loan-comparison"]) {
      assert.deepEqual(keys(rel.getRelatedArticlesForTool(slug, { limit: 6 })), PUBLISHED.slice(0, 6), slug);
      assert.deepEqual(rel.getRelatedArticlesForTool(slug, { limit: 6 }).map((a) => a.id), OLD_RELATED_ARTICLES(slug), slug);
    }
    assert.deepEqual(rel.getRelatedArticlesForTool("gst"), []); // a Coming Soon tool in a category with no published articles
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("sip")), calcs.getCalculatorById("sip").relatedArticles); // curated, not padded
  });

  test("article -> related tools: the curated primary tool first, then the rest of the category", () => {
    const expected = (key) => key === "loan-comparison/what-is-loan-prepayment" ? ["prepayment", "loan-comparison", "emi", "balance-transfer"]
      : key.startsWith("loan-prepayment/") ? ["prepayment", "loan-comparison", "emi", "balance-transfer"]
      : key === "balance-transfer/is-a-loan-balance-transfer-worth-it" ? ["balance-transfer", "loan-comparison", "emi", "prepayment"]
      : key === "balance-transfer/balance-transfer-vs-prepayment" ? ["balance-transfer", "prepayment", "loan-comparison", "emi"]
      : key.startsWith("sip/") ? ["sip"] // the only published Investment tool: no category fallback beyond it
      : key.startsWith("margin/") ? ["margin"] // the only published Business tool: no category fallback beyond it
      : ["loan-comparison", "emi", "balance-transfer", "prepayment"];
    for (const key of PUBLISHED) assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(key)), expected(key), key);
    assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(PUBLISHED[0], { fill: false })), ["loan-comparison"]);
  });

  test("article -> related articles: exactly the curated list, in order, not padded", () => {
    for (const key of PUBLISHED) {
      const entry = articles.getArticleByKey(key);
      assert.deepEqual(keys(rel.getRelatedArticles(key)), entry.related, key);
      assert.equal(rel.getRelatedArticles(key).length, key.startsWith("margin/") ? 2 : key.startsWith("loan-prepayment/") || key.startsWith("balance-transfer/") || key.startsWith("sip/") ? 3 : 5, key); // Margin: a three-article cluster, no other Business article
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
    // a curated list is shown as written, not padded ...
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("emi", { limit: 6 })), ["loan-comparison/choose-right-loan-tenure"]);
    // ... and when padding is asked for, the curated article comes first and is not repeated
    const got = keys(rel.getRelatedArticlesForTool("emi", { limit: 6, fill: true }));
    assert.equal(got[0], "loan-comparison/choose-right-loan-tenure");
    assert.equal(got.length, 6);
    assert.equal(new Set(got).size, 6);
    assert.deepEqual(got.slice(1), PUBLISHED.filter((k) => k !== "loan-comparison/choose-right-loan-tenure").slice(0, 5));
  });

  test("the Balance Transfer page shows its four curated articles exactly, in order", () => {
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("balance-transfer", { limit: 6 })), calcs.getCalculatorById("balance-transfer").relatedArticles);
    assert.equal(calcs.getCalculatorById("balance-transfer").relatedArticles.length, 4);
  });

  test("a tool with a curated article list shows exactly that list, never padded (the Loan Prepayment page)", () => {
    const curated = calcs.getCalculatorById("prepayment").relatedArticles;
    assert.equal(curated.length, 4);
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("prepayment", { limit: 6 })), curated);
    // asking for more does not pad it either
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("prepayment", { limit: 12 })), curated);
    // an explicit fill still pads, as before
    assert.ok(rel.getRelatedArticlesForTool("prepayment", { limit: 6, fill: true }).length > curated.length);
  });

  test("curated tools are kept first; unpublished or unknown curated ids are skipped", () => {
    emi().relatedTools = ["home-loan", "nope", "loan-comparison"];
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "balance-transfer", "prepayment"]);
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
    // the other published articles of ITS category (Loans): the Investment and Business articles are not offered
    assert.deepEqual(keys(rel.getRelatedArticles(PUBLISHED[0])), PUBLISHED.filter((k) => !k.startsWith("sip/") && !k.startsWith("margin/")).slice(1));
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
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["home-loan", "loan-comparison", "balance-transfer", "prepayment"]);
      delete home.subcategory;
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "home-loan", "balance-transfer", "prepayment"]);
    } finally {
      home.available = wasAvailable;
      delete home.subcategory;
    }
  });
});
