/**
 * M6: category / subcategory hierarchy (data/categories.js + data/taxonomy.js).
 * Expected values are LITERALS captured from the site as it was before M6 (git 3789936), not derived
 * from the code under test. Runs in GitHub Pages mode; taxonomy-root.test.mjs runs the root-domain mode.
 */
import { test, describe, before, afterEach } from "node:test";
import assert from "node:assert/strict";

import { getComingSoonTool } from "../helpers/coming-soon.mjs";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };
const ROOT = process.env.TZ_HOST ? "/" : "/Toolzenhub/";

let cats, tax, calcs, articles, registry, crumb;
before(async () => {
  cats = await import("../../assets/js/data/categories.js");
  tax = await import("../../assets/js/data/taxonomy.js");
  calcs = await import("../../assets/js/data/calculators.js");
  articles = await import("../../assets/js/data/articles.js");
  registry = await import("../../assets/js/calculator-registry.js");
  crumb = await import("../../assets/js/components/breadcrumb.js");
});

const CATEGORY_IDS = ["loans", "investment", "tax", "health", "business", "math", "converter", "more"];
const hrefs = (html) => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
const labels = (html) => [...html.matchAll(/<(?:a|strong)[^>]*>\s*([^<]*?)\s*<\/(?:a|strong)>/g)].map((m) => m[1]);

describe("current hierarchy data", () => {
  test("one section: Calculators, landing on the categories page", () => {
    assert.deepEqual(cats.sections, [{ id: "calculators", title: "Calculators", landing: "calculatorCategories", pathPrefix: "calculators" }]);
    assert.equal(tax.getSectionUrl("Calculators"), `${ROOT}categories.html`);
    assert.equal(tax.getSectionUrl("calculators"), `${ROOT}categories.html`);
    assert.equal(tax.getSectionUrl("Articles"), null);
  });

  test("the eight existing categories, in order, with their titles unchanged", () => {
    assert.deepEqual(cats.categories.map((c) => c.id), CATEGORY_IDS);
    assert.deepEqual(cats.categories.map((c) => c.title), ["Loans", "Investment", "Tax", "Health", "Business", "Math", "Converter", "More"]);
  });

  test("only Loans has a landing page; every other category links to its anchor on the categories page", () => {
    assert.deepEqual(cats.categories.filter((c) => c.landing).map((c) => c.id), ["loans"]);
    assert.equal(tax.getCategoryLandingUrl("loans"), `${ROOT}loans.html`);
    assert.equal(tax.getCategoryUrl("loans"), `${ROOT}loans.html`);
    for (const id of CATEGORY_IDS.slice(1)) {
      assert.equal(tax.getCategoryLandingUrl(id), null, id);
      assert.equal(tax.getCategoryUrl(id), `${ROOT}categories.html#${id}`, id);
    }
    assert.equal(tax.getCategoryLandingUrl("nope"), null);
  });

  test("no subcategories are defined yet: every tool sits directly under its major category", () => {
    assert.deepEqual(cats.subcategories, []);
    for (const tool of calcs.calculators) assert.equal(tool.subcategory, undefined, tool.id);
    assert.deepEqual(tax.getDirectTools("loans"), tax.getToolsByCategory("loans"));
    assert.deepEqual(tax.getToolsByCategory("loans").map((t) => t.id), ["loan-comparison", "emi", "home-loan", "personal-loan", "loan-eligibility", "balance-transfer", "interest", "prepayment"]);
  });

  test("category lookups by id and by title", () => {
    assert.equal(tax.getCategory("tax").title, "Tax");
    assert.equal(tax.getCategoryByTitle("Converter").iconClass, "converter");
    assert.equal(tax.getCategoryByTitle("nope"), undefined);
  });

  test("tool path: EMI and Loan Comparison resolve to Calculators > loans with no subcategory", () => {
    for (const id of ["emi", "loan-comparison"]) {
      const path = tax.getToolPath(calcs.getCalculatorById(id));
      assert.equal(path.section.title, "Calculators");
      assert.equal(path.category.id, "loans");
      assert.equal(path.subcategory, null);
    }
  });

  test("supporting articles: the six original articles point at Loan Comparison; the four SIP articles at SIP; the three Margin articles at Margin; the three Profit articles at Profit; the three Home Loan articles at Home Loan; the two FD articles at FD; none point at EMI or a Coming Soon tool", () => {
    assert.equal(tax.getArticlesForTool("loan-comparison").length, 6);
    assert.deepEqual(tax.getArticlesForTool("emi"), []);
    assert.equal(tax.getArticlesForTool("sip").length, 4);
    assert.equal(tax.getArticlesForTool("margin").length, 3);
    assert.equal(tax.getArticlesForTool("profit").length, 3);
    assert.equal(tax.getArticlesForTool("home-loan").length, 3);
    assert.equal(tax.getArticlesForTool("fd").length, 2);
    assert.deepEqual(tax.getArticlesForTool(getComingSoonTool().id), []);
  });
});

describe("Investment is a category inside Calculators (Tool Pack 7 pins SIP and FD, not only the page's appearance)", () => {
  const tool = (id) => calcs.getCalculatorById(id);

  test("SIP and FD: section = Calculators, category = Investment; no subcategory", () => {
    for (const id of ["sip", "fd"]) {
      assert.equal(tool(id).category, "investment", id);
      assert.equal(tool(id).subcategory, undefined, id);
      const path = tax.getToolPath(tool(id));
      assert.equal(path.section.id, "calculators", id);
      assert.equal(path.section.title, "Calculators", id);
      assert.equal(path.category.id, "investment", id);
      assert.equal(path.category.title, "Investment", id); // the human-facing name is "Investment", never "Investments"
      assert.equal(path.subcategory, null, id);
      assert.equal(tax.getSectionForTool(tool(id)).id, "calculators", id);
      assert.equal(tax.getCategoryForTool(tool(id)).id, "investment", id);
    }
  });

  test("Investment is a category of the Calculators section, not a section of its own", () => {
    assert.deepEqual(cats.sections.map((s) => s.id), ["calculators"]);
    assert.equal(cats.categories.find((c) => c.id === "investment").sectionId, "calculators");
    assert.equal(cats.categories.find((c) => c.id === "investment").title, "Investment");
    assert.deepEqual(tax.getToolsByCategory("investment").map((t) => t.id), ["sip", "ppf", "fd", "cagr"]);
    assert.deepEqual(tax.getToolsByCategory("investment").filter((t) => t.available).map((t) => t.id), ["sip", "fd"]);
  });

  test("the search index, the registry and the breadcrumb agree: Calculators > Investment > the tool", async () => {
    const idx = await import("../../assets/js/data/search-index.js");
    for (const [id, title] of [["sip", "SIP Calculator"], ["fd", "FD Calculator"]]) {
      const entry = idx.searchIndex.find((e) => e.key === `tool:${id}`);
      assert.equal(entry.sectionTitle, "Calculators", id);
      assert.equal(entry.categoryTitle, "Investment", id);
      assert.deepEqual(registry.calculatorMetadata[id], { section: "Calculators", category: "investment", title }, id);
      // the shared breadcrumb prints the category id (styled to read "Investment"); Home is added by the renderer, so the page reads
      // Home > Calculators > investment > <tool>
      assert.deepEqual(crumb.toolBreadcrumbItems(registry.calculatorMetadata[id]).map((i) => i.label), ["Calculators", "investment", title], id);
    }
  });
});

describe("referential integrity", () => {
  test("every tool's category exists; a tool's subcategory, if any, exists and belongs to that category", () => {
    for (const tool of calcs.calculators) {
      assert.ok(tax.getCategory(tool.category), `${tool.id}: category ${tool.category}`);
      if (tool.subcategory) assert.equal(tax.getSubcategory(tool.subcategory)?.category, tool.category, tool.id);
    }
  });

  test("every subcategory points at an existing category; ids are unique across sections, categories and subcategories", () => {
    for (const sub of cats.subcategories) assert.ok(tax.getCategory(sub.category), sub.id);
    const ids = [...cats.sections, ...cats.categories, ...cats.subcategories].map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("article categories are major categories, with the same id and name", () => {
    assert.deepEqual(articles.articleCategories.map((c) => c.slug), ["loans", "investment", "tax", "business", "health", "math", "converter"]);
    for (const c of articles.articleCategories) assert.equal(tax.getCategory(c.slug).title, c.name, c.slug);
    for (const a of articles.articles) {
      assert.ok(tax.getCategory(a.category), a.key);
      for (const id of a.tools || []) assert.ok(calcs.getCalculatorById(id), `${a.key} -> ${id}`);
    }
  });

  test("tool section ids resolve to a section", () => {
    for (const tool of calcs.calculators) assert.ok(tax.getSection(tool.section), tool.id);
  });
});

describe("breadcrumbs keep their labels and links", () => {
  test("EMI: Home > Calculators > loans > EMI Calculator", () => {
    const html = crumb.renderToolBreadcrumb(registry.calculatorMetadata.emi);
    assert.deepEqual(hrefs(html), [ROOT, `${ROOT}categories.html`, `${ROOT}loans.html`]);
    assert.deepEqual(labels(html), ["Home", "Calculators", "loans", "EMI Calculator"]);
  });

  test("Loan Comparison: Home > Calculators > loans > Loan Comparison Calculator", () => {
    const html = crumb.renderToolBreadcrumb(registry.calculatorMetadata["loan-comparison"]);
    assert.deepEqual(hrefs(html), [ROOT, `${ROOT}categories.html`, `${ROOT}loans.html`]);
    assert.deepEqual(labels(html), ["Home", "Calculators", "loans", "Loan Comparison Calculator"]);
  });

  test("a category without a landing page is plain text, not a link", () => {
    const html = crumb.renderToolBreadcrumb({ section: "Calculators", category: "tax", title: "Income Tax Calculator" });
    assert.deepEqual(hrefs(html), [ROOT, `${ROOT}categories.html`]);
    assert.deepEqual(labels(html), ["Home", "Calculators", "tax", "Income Tax Calculator"]);
  });

  test("calculator metadata is unchanged (no subcategory key while none is defined)", () => {
    assert.deepEqual(registry.calculatorMetadata.emi, { section: "Calculators", category: "loans", title: "EMI Calculator" });
    assert.deepEqual(registry.calculatorMetadata["loan-comparison"], { section: "Calculators", category: "loans", title: "Loan Comparison Calculator" });
  });
});

describe("subcategory support (exercised with a temporary subcategory)", () => {
  const sub = { id: "test-sub", category: "loans", title: "Test Subcategory" };
  afterEach(() => {
    cats.subcategories.length = 0;
    delete calcs.getCalculatorById("emi").subcategory;
  });

  test("a tool in a subcategory is found there, leaves the direct list, and still counts in its category", () => {
    const loansTools = calcs.calculators.filter((t) => t.category === "loans").length;
    cats.subcategories.push(sub);
    calcs.getCalculatorById("emi").subcategory = "test-sub";
    assert.deepEqual(tax.getSubcategoriesOf("loans"), [sub]);
    assert.deepEqual(tax.getToolsBySubcategory("test-sub").map((t) => t.id), ["emi"]);
    assert.equal(tax.getDirectTools("loans").length, loansTools - 1);
    assert.equal(tax.getToolsByCategory("loans").length, loansTools);
    assert.equal(tax.getToolPath(calcs.getCalculatorById("emi")).subcategory.title, "Test Subcategory");
  });

  test("the breadcrumb gains exactly one extra step: Home > Calculators > loans > Subcategory > Tool", () => {
    cats.subcategories.push({ ...sub, landing: "loans" });
    const html = crumb.renderToolBreadcrumb({ section: "Calculators", category: "loans", subcategory: "test-sub", title: "EMI Calculator" });
    assert.deepEqual(labels(html), ["Home", "Calculators", "loans", "Test Subcategory", "EMI Calculator"]);
    assert.deepEqual(hrefs(html), [ROOT, `${ROOT}categories.html`, `${ROOT}loans.html`, `${ROOT}loans.html`]);
    assert.equal((html.match(/calculator-breadcrumb"/g) || []).length, 1);
  });

  test("a subcategory without a page is plain text", () => {
    cats.subcategories.push(sub);
    const html = crumb.renderToolBreadcrumb({ section: "Calculators", category: "loans", subcategory: "test-sub", title: "EMI Calculator" });
    assert.deepEqual(hrefs(html), [ROOT, `${ROOT}categories.html`, `${ROOT}loans.html`]);
    assert.equal(tax.getSubcategoryLandingUrl("test-sub"), null);
  });
});
