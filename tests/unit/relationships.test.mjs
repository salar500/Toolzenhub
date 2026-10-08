/**
 * M7: content relationships (data/relationships.js) - tool<->tool, tool->article, article->tool,
 * article<->article. Curated links first, automatic fallback second.
 *
 * `OLD_*` are LITERAL copies of how the pages chose related content before M7.
 */
import { test, describe, before, afterEach } from "node:test";
import assert from "node:assert/strict";

import { getComingSoonTool } from "../helpers/coming-soon.mjs";

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
// tools with autoRelated: false are never offered as an automatic neighbour (the SWP Calculator, Tool Pack 21)
const NOT_AUTO_RELATED = ["swp"];
const OLD_RELATED_TOOLS = (slug) => {          // components/related-calculators.js
  const category = registry.calculatorMetadata[slug]?.category;
  if (!category) return [];
  return Object.entries(registry.calculatorMetadata).filter(([s, m]) => m.category === category && s !== slug && !NOT_AUTO_RELATED.includes(s)).map(([s]) => s).slice(0, 6);
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
    // Home Loan (Tool Pack 6) is a published Loans tool, so every Loans page relates to all the other Loans tools: the curated ones first, then the rest of the category in catalog order, which now ends with the Credit Card Payoff Calculator (Tool Pack 24)
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "home-loan", "balance-transfer", "prepayment", "credit-card-payoff"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("loan-comparison")), ["emi", "home-loan", "balance-transfer", "prepayment", "credit-card-payoff"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("prepayment")), ["emi", "loan-comparison", "balance-transfer", "home-loan", "credit-card-payoff"]); // curated order, then the category
    assert.deepEqual(toolIds(rel.getRelatedTools("balance-transfer")), ["prepayment", "emi", "loan-comparison", "home-loan", "credit-card-payoff"]); // curated order, then the category
    assert.deepEqual(toolIds(rel.getRelatedTools("home-loan")), ["loan-comparison", "emi", "balance-transfer", "prepayment", "credit-card-payoff"]);
    // FD (Tool Pack 7) is the second published Investment tool: SIP and FD relate to each other through the category, and only to each other
    // CAGR (Tool Pack 9) is the third: the Investment tools relate to each other through the category (PPF is Coming Soon and never offered)
    assert.deepEqual(toolIds(rel.getRelatedTools("sip")), ["fd", "cagr"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("fd")), ["sip", "cagr"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("cagr")), ["sip", "fd"]);
    // SWP (Tool Pack 21): one curated one-way relation to SIP (build the corpus, then draw it down); autoRelated is off, so it is not offered the other Investment tools and does not appear in theirs, and SIP does not link back
    assert.deepEqual(toolIds(rel.getRelatedTools("swp")), ["sip"]);
    // the SWP content pack: its two articles reach the calculator through article.tools alone (no tool.relatedArticles, so there is no second list to disagree), mechanism first; the SIP page does not gain them
    assert.deepEqual(rel.getRelatedArticlesForTool("swp").map((a) => a.key), ["swp/how-a-systematic-withdrawal-plan-works", "swp/what-changes-how-long-a-corpus-lasts"]);
    assert.equal(calcs.getCalculatorById("swp").relatedArticles, undefined);
    assert.ok(!rel.getRelatedArticlesForTool("sip").some((a) => a.topic === "swp"));
    // GST (Tool Pack 8) is the first live Tax tool: it has no category neighbours, so its curated cross-category list is what it shows (Income Tax is Coming Soon and never offered);
    // Margin and Profit do NOT link back to it (the reciprocal links are deferred)
    assert.deepEqual(toolIds(rel.getRelatedTools("gst")), ["margin", "profit"]);
    // Percentage (Tool Pack 10) is the first live Math tool: no category neighbours, so its explicit one-way list is what it shows, in this order (Profit is not added; Ratio and Age are Coming Soon and never offered).
    // The links are one way: GST and Margin do not offer Percentage and their own lists are unchanged.
    assert.deepEqual(toolIds(rel.getRelatedTools("percentage")), ["gst", "margin"]);
    assert.equal(toolIds(rel.getRelatedTools("gst")).includes("percentage"), false);
    // the two Time Tools relate to each other (they are the only tools directly under that section); neither is a calculator
    // (the Countdown Timer is also in that section; its page, like the date tools' pages, opts out of the related sections)
    // The Countdown Timer and the Stopwatch name each other (curated, so each comes first); the date tools are only related by section.
    assert.deepEqual(toolIds(rel.getRelatedTools("date-difference")), ["date-calculator", "countdown-timer", "stopwatch"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("date-calculator")), ["date-difference", "countdown-timer", "stopwatch"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("countdown-timer")), ["stopwatch", "date-difference", "date-calculator"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("stopwatch")), ["countdown-timer", "date-difference", "date-calculator"]);
    // the two Developer Tools name each other (timestamps live in JSON payloads) and nothing else: the Time Tools are not related to them, nor they to the Time Tools
    assert.deepEqual(toolIds(rel.getRelatedTools("json-formatter")), ["unix-timestamp-converter"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("unix-timestamp-converter")), ["json-formatter"]);
    // Text Diff names the JSON Formatter (format two documents, then compare them) and nothing else (autoRelated is off, so the section does not fill it); the link is one way and the Unix converter is not related to it
    assert.deepEqual(toolIds(rel.getRelatedTools("text-diff")), ["json-formatter"]);
    assert.equal(toolIds(rel.getRelatedTools("unix-timestamp-converter")).includes("text-diff"), false);
    // the JWT Decoder (Tool Pack 22) names the JSON Formatter (the payload is JSON) and the Unix Timestamp Converter (exp, nbf and iat are Unix times), and nothing else (autoRelated is off); the links are one way, so neither tool's list, nor any other tool's, gains it
    assert.deepEqual(toolIds(rel.getRelatedTools("jwt-decoder")), ["json-formatter", "unix-timestamp-converter"]);
    // the Credit Card Payoff Calculator (Tool Pack 24) keeps the automatic Loans relationships on: its curated tools first (a balance moved to a lower rate, extra payments, a fixed payment over a term), then the rest of the category, and it is appended to every other Loans tool's list (asserted above)
    assert.deepEqual(toolIds(rel.getRelatedTools("credit-card-payoff")), ["balance-transfer", "prepayment", "emi", "loan-comparison", "home-loan"]);
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("credit-card-payoff")), ["loan-comparison/loan-tenure-total-interest", "loan-comparison/emi-vs-total-interest"]); // curated, shown as written, not padded
    // the Hours & Timesheet Calculator (Tool Pack 23) relates to nothing (autoRelated is off and it names no tool), so it joins no other Time Tool's list and the four older Time Tools' lists above are unchanged
    assert.deepEqual(toolIds(rel.getRelatedTools("hours-calculator")), []);
    for (const id of ["date-difference", "date-calculator", "countdown-timer", "stopwatch", "time-zone-converter", "json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder", "image-compressor-resizer", "swp", "emi"]) assert.equal(toolIds(rel.getRelatedTools(id)).includes("hours-calculator"), false, id);
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "time-zone-converter", "image-compressor-resizer", "date-difference", "stopwatch", "swp", "emi"]) assert.equal(toolIds(rel.getRelatedTools(id)).includes("jwt-decoder"), false, id);
    // the Time Zone Converter names the Unix converter (both read instants and zones); autoRelated is off, so it joins no other Time Tool's list and none of theirs are changed (asserted above)
    assert.deepEqual(toolIds(rel.getRelatedTools("time-zone-converter")), ["unix-timestamp-converter"]);
    // the first Image Tools tool relates to nothing: no other tool is an image tool, and nothing is forced
    assert.deepEqual(toolIds(rel.getRelatedTools("image-compressor-resizer")), []);
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "time-zone-converter", "stopwatch", "countdown-timer", "date-calculator", "date-difference", "gst", "emi"]) assert.equal(toolIds(rel.getRelatedTools(id)).includes("image-compressor-resizer"), false, id);
    for (const id of ["date-difference", "date-calculator", "countdown-timer", "stopwatch", "json-formatter", "unix-timestamp-converter", "text-diff"]) assert.equal(toolIds(rel.getRelatedTools(id)).includes("time-zone-converter"), false, id);
    for (const id of ["date-difference", "date-calculator", "countdown-timer", "stopwatch"]) assert.equal(toolIds(rel.getRelatedTools(id)).some((x) => ["json-formatter", "unix-timestamp-converter", "text-diff", "time-zone-converter", "image-compressor-resizer"].includes(x)), false, id);
    // Income Tax (Tool Pack 17) shares the Tax category with GST but not its intent: it opts out of the automatic same-category lists (autoRelated: false),
    // so its related tools are exactly its curated Home Loan, it has no related articles from the GST category, and GST's list is unchanged
    assert.deepEqual(toolIds(rel.getRelatedTools("income-tax")), ["home-loan"]);
    assert.deepEqual(rel.getRelatedArticlesForTool("income-tax"), []);
    assert.deepEqual(toolIds(rel.getRelatedTools("gst")), ["margin", "profit"]);
    for (const id of ["home-loan", "emi", "loan-comparison", "sip", "margin", "percentage"]) assert.equal(toolIds(rel.getRelatedTools(id)).includes("income-tax"), false, id);
    assert.equal(toolIds(rel.getRelatedTools("margin")).includes("percentage"), false);
    assert.equal(toolIds(rel.getRelatedTools("profit")).includes("percentage"), false);
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("percentage")), calcs.getCalculatorById("percentage").relatedArticles);
    assert.deepEqual(toolIds(rel.getRelatedTools("margin")), ["profit"]);
    assert.deepEqual(toolIds(rel.getRelatedTools("profit")), ["margin"]);
    assert.deepEqual(rel.getRelatedTools("nope"), []);
    // parity with the pre-M7 rule for every tool without a curated list (the Loan Prepayment page curates its own order; GST and Percentage curate cross-category lists)
    for (const slug of Object.keys(registry.calculatorMetadata).filter((s) => !["prepayment", "balance-transfer", "gst", "percentage", "date-difference", "date-calculator", "countdown-timer", "stopwatch", "json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder", "time-zone-converter", "hours-calculator", "image-compressor-resizer", "income-tax", "swp", "credit-card-payoff"].includes(s))) assert.deepEqual(toolIds(rel.getRelatedTools(slug, { limit: 6 })), OLD_RELATED_TOOLS(slug), slug);
  });

  test("tool -> related articles: the first six published loan articles, in catalog order, for EMI and Loan Comparison", () => {
    for (const slug of ["emi", "loan-comparison"]) {
      assert.deepEqual(keys(rel.getRelatedArticlesForTool(slug, { limit: 6 })), PUBLISHED.slice(0, 6), slug);
      assert.deepEqual(rel.getRelatedArticlesForTool(slug, { limit: 6 }).map((a) => a.id), OLD_RELATED_ARTICLES(slug), slug);
    }
    assert.deepEqual(rel.getRelatedArticlesForTool("bmi"), []); // a Coming Soon tool in a category with no published articles
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("sip")), calcs.getCalculatorById("sip").relatedArticles); // curated, not padded
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("fd")), calcs.getCalculatorById("fd").relatedArticles);
    assert.deepEqual(keys(rel.getRelatedArticlesForTool("gst")), calcs.getCalculatorById("gst").relatedArticles);
  });

  test("article -> related tools: the curated primary tool first, then the rest of the category", () => {
    const expected = (key) => key === "loan-comparison/what-is-loan-prepayment" ? ["prepayment", "loan-comparison", "emi", "home-loan", "balance-transfer", "credit-card-payoff"]
      : key.startsWith("loan-prepayment/") ? ["prepayment", "loan-comparison", "emi", "home-loan", "balance-transfer", "credit-card-payoff"]
      : key === "balance-transfer/is-a-loan-balance-transfer-worth-it" ? ["balance-transfer", "loan-comparison", "emi", "home-loan", "prepayment", "credit-card-payoff"]
      : key === "balance-transfer/balance-transfer-vs-prepayment" ? ["balance-transfer", "prepayment", "loan-comparison", "emi", "home-loan", "credit-card-payoff"]
      : key.startsWith("home-loan/") ? ["home-loan", "loan-comparison", "emi", "balance-transfer", "prepayment", "credit-card-payoff"]
      : key.startsWith("sip/") ? ["sip", "fd", "cagr"] // the primary tool first, then the other published Investment tools
      : key.startsWith("fd/") ? ["fd", "sip", "cagr"]
      : key.startsWith("cagr/") ? ["cagr", "sip", "fd"]
      : key.startsWith("swp/") ? ["swp", "sip", "fd", "cagr"] // the primary tool first, then the Investment tools; SWP is not auto-related, so it joins no other article's fallback
      : key.startsWith("percentage/") ? ["percentage"] // the only published Math tool: no category fallback beyond it
      : key.startsWith("gst/") ? ["gst"] // the only published Tax tool: no category fallback beyond it
      : key.startsWith("margin/") ? ["margin", "profit"] // the primary tool first, then the other published Business tool
      : key.startsWith("profit/") ? ["profit", "margin"]
      : ["loan-comparison", "emi", "home-loan", "balance-transfer", "prepayment", "credit-card-payoff"];
    for (const key of PUBLISHED) assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(key)), expected(key), key);
    assert.deepEqual(toolIds(rel.getRelatedToolsForArticle(PUBLISHED[0], { fill: false })), ["loan-comparison"]);
  });

  test("article -> related articles: exactly the curated list, in order, not padded", () => {
    for (const key of PUBLISHED) {
      const entry = articles.getArticleByKey(key);
      assert.deepEqual(keys(rel.getRelatedArticles(key)), entry.related, key);
      assert.equal(rel.getRelatedArticles(key).length, key.startsWith("margin/") || key.startsWith("profit/") || key.startsWith("fd/") || key.startsWith("gst/") || key.startsWith("cagr/") || key.startsWith("percentage/") || key.startsWith("swp/") ? 2 : key.startsWith("loan-prepayment/") || key.startsWith("balance-transfer/") || key.startsWith("sip/") || key.startsWith("home-loan/") ? 3 : 5, key); // Margin and Profit: three-article clusters, so two others
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
    // a Coming Soon Loans tool (not named: whichever is first) and an unknown id are skipped; the published curated one stays first
    emi().relatedTools = [getComingSoonTool({ category: "loans" }).id, "nope", "loan-comparison"];
    assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "home-loan", "balance-transfer", "prepayment", "credit-card-payoff"]);
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
    assert.deepEqual(keys(rel.getRelatedArticles(PUBLISHED[0])), PUBLISHED.filter((k) => !k.startsWith("sip/") && !k.startsWith("margin/") && !k.startsWith("profit/") && !k.startsWith("fd/") && !k.startsWith("gst/") && !k.startsWith("cagr/") && !k.startsWith("percentage/") && !k.startsWith("swp/")).slice(1));
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
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["home-loan", "loan-comparison", "balance-transfer", "prepayment", "credit-card-payoff"]);
      delete home.subcategory;
      assert.deepEqual(toolIds(rel.getRelatedTools("emi")), ["loan-comparison", "home-loan", "balance-transfer", "prepayment", "credit-card-payoff"]);
    } finally {
      home.available = wasAvailable;
      delete home.subcategory;
    }
  });
});
