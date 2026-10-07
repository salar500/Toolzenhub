/**
 * M7: shared search index (data/search-index.js) and ranking (utils/search.js).
 *
 * The `OLD_*` functions below are LITERAL copies of the matching the pages used before M7
 * (categories/calculators page, Loans page, articles listing), so parity is checked against the old
 * behaviour, not against the code under test.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { getComingSoonTool } from "../helpers/coming-soon.mjs";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

// The committed URL inventory is an independent record of what is published (see tests/inventory).
const inventory = JSON.parse(fs.readFileSync(new URL("../inventory/url-inventory.json", import.meta.url), "utf8"));

let idx, engine, calcs, articles, cats, legacy;
before(async () => {
  idx = await import("../../assets/js/data/search-index.js");
  engine = await import("../../assets/js/utils/search.js");
  calcs = await import("../../assets/js/data/calculators.js");
  articles = await import("../../assets/js/data/articles.js");
  cats = await import("../../assets/js/data/categories.js");
  legacy = await import("../../assets/js/article-registry.js");
  CORPUS = buildCorpus();
});

/* ---------- the matching the pages used before M7 ---------- */
const catTitle = (id) => cats.categories.find((c) => c.id === id).title;
const OLD_TOOLS = (q) => {          // categories + calculators pages
  const s = String(q || "").trim().toLowerCase();
  if (!s) return [];
  // aliases are searchable too (Tool Pack 1 added the first ones), so they count as text the old pages would show
  return calcs.calculators.filter((c) => [c.title, c.description, catTitle(c.category), ...(c.aliases ?? [])].join(" ").toLowerCase().includes(s)).map((c) => c.id);
};
const OLD_LOANS = (q) => {          // Loans page
  const s = String(q || "").trim().toLowerCase();
  return calcs.calculators.filter((c) => c.category === "loans").filter((c) => [c.title, c.description, c.category, c.id, ...(c.aliases ?? [])].join(" ").toLowerCase().includes(s)).map((c) => c.id);
};
const OLD_ARTICLES = (q, category = "All") => {   // articles listing
  const s = String(q || "").trim().toLowerCase();
  return legacy.articleRegistry.filter((a) => (category === "All" || a.category === category) && (!s || a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s) || a.categoryName.toLowerCase().includes(s))).map((a) => a.id);
};

const TOOL_OPTS = { types: ["tool"], includeComingSoon: true };
const ids = (results) => results.map((r) => r.id);
const sorted = (xs) => [...xs].sort();

// every word of every title/description, plus fragments and the queries the browser tests use
let CORPUS;
const buildCorpus = () => {
  const words = new Set(["emi", "EMI", " emi ", "loan", "loan comparison", "interest", "home", "home loan", "calculator", "sip", "tax", "prepayment", "tenure", "fixed", "emi vs", "oans", "loans", "invest", "finance", "calc", "e", "a", "in", "zz", "zzzz-none", "x", "Loan", "LOANS", "loan-comparison", "personal"]);
  for (const t of [...calcs.calculators, ...articles.articles]) {
    for (const w of `${t.title} ${t.description}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) { words.add(w); words.add(w.slice(0, 3)); words.add(w.slice(1, 4)); }
  }
  return [...words];
};

describe("index structure", () => {
  test("covers categories, tools and articles (no subcategories are defined yet)", () => {
    const count = (type) => idx.searchIndex.filter((e) => e.type === type).length;
    assert.deepEqual([count("category"), count("subcategory"), count("tool"), count("article")], [8, 0, 32, 38]);
    assert.equal(new Set(idx.searchIndex.map((e) => e.key)).size, idx.searchIndex.length);
  });

  test("an entry has exactly the documented fields", () => {
    for (const e of idx.searchIndex) assert.deepEqual(Object.keys(e), ["key", "type", "id", "title", "description", "category", "categoryTitle", "section", "sectionTitle", "subcategory", "subcategoryTitle", "aliases", "keywords", "route", "status"], e.key);
  });

  test("literal entries: EMI tool, a published article, a coming-soon tool, the Loans category", () => {
    const get = (key) => idx.searchIndex.find((e) => e.key === key);
    assert.deepEqual(get("tool:emi"), {
      key: "tool:emi", type: "tool", id: "emi", title: "EMI Calculator",
      description: "Calculate your monthly EMI for any loan amount, interest rate and tenure.",
      category: "loans", categoryTitle: "Loans", section: "calculators", sectionTitle: "Calculators",
      subcategory: null, subcategoryTitle: "", aliases: [], keywords: [],
      route: "/Toolzenhub/calculators/emi/", status: "published",
    });
    const art = get("article:2");
    assert.equal(art.title, "EMI vs Total Interest: What Should You Compare?");
    assert.equal(art.route, "/Toolzenhub/articles/loan-comparison/emi-vs-total-interest/");
    assert.equal(art.status, "published");
    const soon = getComingSoonTool();
    assert.equal(get(`tool:${soon.id}`).route, null);
    assert.equal(get(`tool:${soon.id}`).status, "coming-soon");
    assert.equal(get("tool:sip").route, "/Toolzenhub/calculators/sip/");
    assert.equal(get("tool:sip").status, "published");
    assert.equal(get("category:loans").route, "/Toolzenhub/loans.html");
    assert.equal(get("category:tax").route, "/Toolzenhub/tax.html");
    assert.equal(get("category:health").route, "/Toolzenhub/categories.html#health");
  });

  test("status follows the catalogs: the published tools and articles of the URL inventory, everything else coming-soon", () => {
    const pub = (type) => idx.searchIndex.filter((e) => e.type === type && e.status === "published").length;
    assert.equal(pub("tool"), inventory.summary.builtCalculators.length);
    assert.equal(pub("article"), inventory.summary.publishedArticles.length);
    for (const e of idx.searchIndex.filter((x) => x.status !== "published")) assert.equal(e.route, null, e.key);
  });

  test("no invented aliases or keywords (only the Loan Prepayment and Balance Transfer calculators' own names), and no article bodies in the index", () => {
    const ALIASES = { "tool:prepayment": ["part payment", "early repayment"], "tool:balance-transfer": ["loan transfer", "refinance", "switch loan"], "tool:sip": ["systematic investment plan", "step-up sip"], "tool:margin": ["profit margin calculator", "markup calculator", "selling price calculator"], "tool:profit": ["break-even calculator", "business profit calculator", "contribution margin calculator"], "tool:home-loan": ["home loan affordability", "how much loan can i afford", "loan amount calculator"], "tool:fd": ["fixed deposit calculator", "fd maturity calculator", "fd comparison"], "tool:gst": ["add gst", "remove gst", "gst inclusive exclusive", "reverse gst calculator"], "tool:cagr": ["compound annual growth rate", "annualized return calculator", "required cagr", "cagr comparison"], "tool:percentage": ["percentage change calculator", "percentage increase calculator", "percentage decrease calculator", "reverse percentage calculator", "original price before increase"], "tool:date-difference": ["days between dates", "date duration", "weeks between dates", "how many days between dates", "calendar difference"], "tool:stopwatch": ["online stopwatch", "lap timer", "split timer", "elapsed time", "timer stopwatch"], "tool:text-diff": ["text diff", "diff checker", "compare text", "text compare", "compare two texts", "difference between two texts", "code diff", "prompt comparison", "compare versions"], "tool:unix-timestamp-converter": ["unix timestamp", "epoch converter", "epoch time", "timestamp converter", "unix time converter", "timestamp to date", "date to timestamp", "epoch to date", "milliseconds timestamp", "unix milliseconds"], "tool:income-tax": ["income tax calculator", "old vs new tax regime", "tax regime comparison", "new regime calculator", "old regime calculator", "salary tax calculator india", "new vs old regime"], "tool:json-formatter": ["json formatter", "json validator", "format json", "pretty json", "pretty print json", "beautify json", "minify json", "validate json", "json viewer"], "tool:countdown-timer": ["online timer", "timer", "minute timer", "study timer", "focus timer"], "tool:date-calculator": ["add days to date", "subtract days from date", "date after days", "date before days", "add months to date", "subtract months from date", "date arithmetic"] };
    for (const e of idx.searchIndex) {
      assert.deepEqual(e.aliases, ALIASES[e.key] ?? [], e.key);
      assert.deepEqual(e.keywords, [], e.key);
    }
    // What these two bounds protect: the index holds METADATA ONLY. Two things keep an article body (about 5 KB of text each) out of it:
    //  1. the exact field set, asserted in "an entry has exactly the documented fields" (there is no field a body could sit in), and
    //  2. a ceiling on any ONE entry (the largest today is about 600 bytes; a body would be roughly nine times that). This is the meaningful
    //     bound: it does not move as tools and articles are added.
    // The total below is only a coarse backstop. It has to rise with the catalog (69 entries are about 30,500 bytes; 50 were under 20,000), so
    // it has about 14 KB of headroom and would not catch one body on its own; the two checks above are what do.
    for (const e of idx.searchIndex) assert.ok(JSON.stringify(e).length < 1000, `${e.key} is ${JSON.stringify(e).length} bytes: is a body in the index?`);
    const bytes = JSON.stringify(idx.searchIndex).length;
    assert.ok(bytes < 45000, `index is ${bytes} bytes`);
  });
});

describe("ranking rules (fixture index)", () => {
  const E = (id, over) => ({ key: `tool:${id}`, type: "tool", id, title: id, description: "", category: "c", categoryTitle: "", subcategory: null, subcategoryTitle: "", aliases: [], keywords: [], route: "/", status: "published", ...over });
  const fixture = [
    E("d", { title: "Other", description: "mentions widget here" }),                       // description   20
    E("c", { title: "Other", categoryTitle: "Widget Tools" }),                              // category      30
    E("k", { title: "Other", keywords: ["widgetry"] }),                                     // keyword       40
    E("a", { title: "Other", aliases: ["the widget"] }),                                    // alias         50
    E("m", { title: "Big widget maker" }),                                                  // contains      60
    E("p", { title: "Widget Pro" }),                                                        // prefix        80
    E("x", { title: "Widget" }),                                                            // exact        100
  ];
  const run = (q, o) => engine.search(q, { index: fixture, ...o });

  test("exact title > title prefix > title contains > alias > keyword > category > description", () => {
    const r = run("widget");
    assert.deepEqual(ids(r), ["x", "p", "m", "a", "k", "c", "d"]);
    assert.deepEqual(r.map((x) => x.score), [100, 80, 60, 50, 40, 30, 20]);
  });

  test("subcategory title counts as category", () => {
    assert.equal(run("sub", { index: [E("s", { title: "Other", subcategoryTitle: "Sub Group" })] })[0].score, 30);
  });

  test("an id only matches when asked (matchId), below category and above description", () => {
    const one = [E("zebra-tool", { title: "Other", description: "x" })];
    assert.deepEqual(run("zebra", { index: one }), []);
    assert.equal(run("zebra", { index: one, matchId: true })[0].score, 25);
  });

  test("equal scores: published before coming-soon, then catalog order", () => {
    const tied = [E("s1", { title: "Same", status: "coming-soon" }), E("p1", { title: "Same" }), E("s2", { title: "Same", status: "coming-soon" }), E("p2", { title: "Same" })];
    assert.deepEqual(ids(engine.search("same", { index: tied, includeComingSoon: true })), ["p1", "p2", "s1", "s2"]);
  });

  test("case, surrounding spaces and a repeat call do not change the result", () => {
    assert.deepEqual(ids(run("  WIDGET ")), ids(run("widget")));
    assert.deepEqual(run("widget"), run("widget"));
  });

  test("empty / blank / missing queries return nothing", () => {
    for (const q of ["", "   ", null, undefined]) assert.deepEqual(run(q), []);
  });

  test("limit, types, category and subcategory scoping", () => {
    assert.equal(run("widget", { limit: 2 }).length, 2);
    assert.deepEqual(run("widget", { types: ["article"] }), []);
    assert.deepEqual(run("widget", { category: "nope" }), []);
    assert.equal(run("widget", { category: "c" }).length, 7);
  });
});

describe("real data: policy and ranking", () => {
  test("coming-soon items are NOT found unless the caller asks for them", () => {
    assert.deepEqual(ids(engine.search("ppf", { types: ["tool"] })), []);
    assert.deepEqual(ids(engine.search("ppf", { types: ["tool"], includeComingSoon: true })), ["ppf"]);
    assert.deepEqual(ids(engine.search("ppf")), []); // the Investment category description no longer names tools, so a Coming soon tool is not found through it
    // SIP is published (Tool Pack 3): found by name and by its aliases, the tool first
    assert.deepEqual(ids(engine.search("sip", { types: ["tool"] })), ["sip"]);
    assert.deepEqual(ids(engine.search("systematic investment plan", { types: ["tool"] })), ["sip"]);
    assert.deepEqual(ids(engine.search("step-up sip", { types: ["tool"] })), ["sip"]);
    assert.equal(engine.search("sip")[0].key, "tool:sip");
    assert.deepEqual(ids(engine.search("best sip strategies", { types: ["article"] })), []);
    assert.equal(engine.search("emi").every((r) => r.status === "published"), true);
  });

  test("emi: the EMI tool first (title prefix), then the others that mention EMI", () => {
    const r = engine.search("emi", TOOL_OPTS);
    assert.deepEqual(ids(r), ["emi", "loan-comparison", "home-loan", "prepayment", "personal-loan"]); // Home Loan is published now: ties fall in catalog order
    assert.deepEqual(r.map((x) => x.score), [80, 20, 20, 20, 20]);
  });

  test("loan: titles beginning with it, then titles containing it, then category matches", () => {
    assert.deepEqual(ids(engine.search("loan", TOOL_OPTS)), ["loan-comparison", "balance-transfer", "prepayment", "loan-eligibility", "home-loan", "personal-loan", "emi", "interest"]);
  });

  test("loan comparison / interest / home", () => {
    assert.deepEqual(ids(engine.search("loan comparison", TOOL_OPTS)), ["loan-comparison"]);
    assert.deepEqual(ids(engine.search("interest", TOOL_OPTS)), ["interest", "loan-comparison", "emi", "home-loan", "prepayment"]);
    assert.deepEqual(ids(engine.search("home", TOOL_OPTS)), ["home-loan"]);
  });

  test("article titles and partial matches (published articles only by default)", () => {
    assert.deepEqual(ids(engine.search("tenure", { types: ["article"] })), [4, 6, 13, 28, 15, 29, 31]);
    assert.deepEqual(ids(engine.search("prepay", { types: ["article"] })), [5, 13, 14, 16]);
    assert.deepEqual(ids(engine.search("what is loan prepayment", { types: ["article"] })), [5]);
    assert.deepEqual(ids(engine.search("fixed vs floating", { types: ["article"] })), [3]);
  });

  test("no-result queries", () => {
    assert.deepEqual(engine.search("zzzz-none", { includeComingSoon: true }), []);
    assert.deepEqual(engine.search("qwertyuiop"), []);
  });

  test("a mixed global search returns each type, published only", () => {
    const r = engine.search("emi");
    assert.deepEqual(r.map((x) => x.key), ["tool:emi", "article:2", "article:13", "article:27", "tool:loan-comparison", "tool:home-loan", "tool:prepayment", "article:28", "article:29"]);
    // the new tool is found by its aliases and only as a published tool
    assert.deepEqual(engine.search("part payment").map((x) => x.key), ["tool:prepayment"]);
    assert.deepEqual(engine.search("early repayment").map((x) => x.key), ["tool:prepayment"]);
  });
});

describe("parity with the searches the pages used before M7 (same set of matches)", () => {
  test("categories + calculators pages: identical sets for the whole corpus", () => {
    // the calculator pages list calculators only: a Time Tools or Developer Tools tool is in the shared index but is dropped by searchCalculators (see isolation spec)
    for (const q of CORPUS) assert.deepEqual(sorted(ids(engine.search(q, TOOL_OPTS)).filter((id) => !["date-difference", "date-calculator", "countdown-timer", "stopwatch", "json-formatter", "unix-timestamp-converter", "text-diff"].includes(id))), sorted(OLD_TOOLS(q)), `query "${q}"`);
  });

  test("Loans page: identical sets (id and category still match)", () => {
    for (const q of CORPUS.filter((x) => x.trim())) {
      const now = engine.search(q, { types: ["tool"], category: "loans", includeComingSoon: true, matchId: true });
      assert.deepEqual(sorted(ids(now)), sorted(OLD_LOANS(q)), `query "${q}"`);
    }
  });

  test("articles listing: identical sets for every category filter", () => {
    for (const category of ["All", "loans", "investment", "tax"]) {
      for (const q of CORPUS) {
        const now = engine.search(q, { types: ["article"], category: category === "All" ? undefined : category, includeComingSoon: true });
        assert.deepEqual(sorted(ids(now)), sorted(OLD_ARTICLES(q, category).filter(() => q.trim())), `${category} / "${q}"`);
      }
    }
  });

  test("the corpus is substantial and mostly non-trivial", () => {
    assert.ok(CORPUS.length > 200, `${CORPUS.length} queries`);
    assert.ok(CORPUS.filter((q) => OLD_TOOLS(q).length > 0).length > 100);
  });
});
