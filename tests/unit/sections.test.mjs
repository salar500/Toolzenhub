/**
 * E1: Section -> Category -> optional Subcategory -> Tool.
 *
 * Calculators is the only active section and every current category belongs to it. These tests pin
 * the ownership model, the derivation tool -> category -> section, and (most important) that every
 * registered tool's URL is exactly the URL it has always had. Runs in GitHub Pages mode;
 * sections-root.test.mjs runs the root-domain mode.
 *
 * Literal expectations here (category ids, the two published URLs) are values captured from the site
 * before E1 (git 5feafa9), not derived from the code under test.
 */
import { test, describe, before, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };
const ROOT = process.env.TZ_HOST ? "/" : "/Toolzenhub/";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const inventory = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "inventory", "url-inventory.json"), "utf8"));

const CATEGORY_IDS = ["loans", "investment", "tax", "health", "business", "math", "converter", "more"];
const PUBLISHED_URLS = ["/calculators/balance-transfer/", "/calculators/cagr/", "/calculators/emi/", "/calculators/fd/", "/calculators/gst/", "/calculators/home-loan/", "/calculators/income-tax/", "/calculators/loan-comparison/", "/calculators/margin/", "/calculators/percentage/", "/calculators/prepayment/", "/calculators/profit/", "/calculators/sip/"];

let cats, tax, calcs, routes, registry, idx, search, tools;
before(async () => {
  cats = await import("../../assets/js/data/categories.js");
  tax = await import("../../assets/js/data/taxonomy.js");
  calcs = await import("../../assets/js/data/calculators.js");
  tools = await import("../../assets/js/data/tools.js");
  routes = await import("../../assets/js/routes.js");
  registry = await import("../../assets/js/calculator-registry.js");
  idx = await import("../../assets/js/data/search-index.js");
  search = await import("../../assets/js/utils/search.js");
});

describe("section model", () => {
  test("three sections, each with a stable id, its landing page and its path prefix: Calculators, Time Tools and Developer Tools", () => {
    assert.deepEqual(tax.getSections().map((s) => s.id), ["calculators", "time-tools", "developer-tools"]);
    const section = tax.getSectionById("calculators");
    assert.equal(section.title, "Calculators");
    assert.equal(section.landing, "calculatorCategories");
    assert.equal(section.pathPrefix, "calculators");
    const time = tax.getSectionById("time-tools");
    assert.equal(time.title, "Time Tools");
    assert.equal(time.landing, "timeTools");
    assert.equal(time.pathPrefix, "tools"); // /tools/<id>/, so /calculators/<id>/ is never used by a non-calculator
    assert.deepEqual(tax.getCategoriesBySection("time-tools"), []); // no categories: its tools sit directly under it
    const dev = tax.getSectionById("developer-tools");
    assert.equal(dev.title, "Developer Tools");
    assert.equal(dev.landing, "developerTools");
    assert.equal(dev.pathPrefix, "tools");
    assert.deepEqual(tax.getCategoriesBySection("developer-tools"), []); // no categories and no subcategory layer yet
    assert.deepEqual(tax.getToolsBySection("developer-tools").map((t) => t.id), ["json-formatter", "unix-timestamp-converter", "text-diff"]);
  });

  test("section ids are unique and every section names a landing page that exists in ROUTES", () => {
    const ids = tax.getSections().map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const s of tax.getSections()) assert.ok(typeof routes.ROUTES[s.landing] === "string", `${s.id} landing ${s.landing}`);
  });

  test("the two route meanings stay apart: the Calculators section landing is the categories page, not the all-calculators page", () => {
    assert.equal(routes.ROUTES.calculatorCategories, `${ROOT}categories.html`);
    assert.equal(routes.ROUTES.calculators, `${ROOT}calculators.html`);
    assert.equal(tax.getSectionUrl("calculators"), routes.ROUTES.calculatorCategories);
  });

  test("getSectionById matches ids only; the older getSection still accepts a title", () => {
    assert.equal(tax.getSectionById("Calculators"), undefined);
    assert.equal(tax.getSectionById("nope"), undefined);
    assert.equal(tax.getSection("Calculators").id, "calculators");
    assert.equal(tax.getSection("calculators").id, "calculators");
  });

  test("no future section is active", () => {
    for (const future of ["timers", "converters"]) assert.equal(tax.getSectionById(future), undefined, future);
  });
});

describe("category ownership", () => {
  test("the eight existing categories, unrenamed and in order, all belong to the Calculators section", () => {
    assert.deepEqual(cats.categories.map((c) => c.id), CATEGORY_IDS);
    for (const c of cats.categories) assert.equal(c.sectionId, "calculators", c.id);
  });

  test("every category's sectionId refers to a section that exists", () => {
    for (const c of cats.categories) assert.ok(tax.getSectionById(c.sectionId), c.id);
  });

  test("getCategoriesBySection lists them in order; an unknown section has none", () => {
    assert.deepEqual(tax.getCategoriesBySection("calculators").map((c) => c.id), CATEGORY_IDS);
    assert.deepEqual(tax.getCategoriesBySection("nope"), []);
  });

  test("Converter stays a category of the Calculators section", () => {
    assert.equal(tax.getSectionForCategory("converter").id, "calculators");
    assert.equal(tax.getCategory("converter").title, "Converter");
    assert.equal(tax.getSectionForCategory("nope"), undefined);
  });
});

describe("tool -> category -> section", () => {
  test("a tool carries only its category: no section id is stored on any tool", () => {
    for (const tool of calcs.calculators) assert.equal(tool.sectionId, undefined, tool.id);
  });

  test("every tool resolves to a category and a section by id", () => {
    for (const tool of calcs.calculators) {
      assert.equal(tax.getCategoryForTool(tool).id, tool.category, tool.id);
      assert.equal(tax.getSectionForTool(tool).id, "calculators", tool.id);
      assert.equal(tool.section, tax.getSectionForTool(tool).title, tool.id); // the label breadcrumbs have always shown
    }
    assert.equal(tax.getSectionForTool(undefined), undefined);
  });

  test("EMI and Loan Comparison: Loans -> Calculators", () => {
    for (const id of ["emi", "loan-comparison"]) {
      const path = tax.getToolPath(calcs.getCalculatorById(id));
      assert.equal(path.category.title, "Loans", id);
      assert.equal(path.section.title, "Calculators", id);
      assert.equal(path.subcategory, null, id);
    }
  });

  test("derivation follows ids: moving a category to another section moves its tools (no label matching)", () => {
    const more = cats.categories.find((c) => c.id === "more");
    cats.sections.push({ id: "temp-section", title: "Temp", landing: "calculatorCategories", pathPrefix: "temp" });
    more.sectionId = "temp-section";
    try {
      assert.equal(tax.getSectionForCategory("more").id, "temp-section");
      assert.deepEqual(tax.getCategoriesBySection("temp-section").map((c) => c.id), ["more"]);
      assert.ok(!tax.getCategoriesBySection("calculators").some((c) => c.id === "more"));
      assert.equal(tax.getSectionForTool({ category: "more" }).id, "temp-section");
    } finally {
      more.sectionId = "calculators";
      cats.sections.pop();
    }
  });

  test("the catalog refuses a tool whose category has no section", async () => {
    const loans = cats.categories.find((c) => c.id === "loans");
    loans.sectionId = "nope";
    try {
      const url = pathToFileURL(path.join(PROJECT, "assets", "js", "data", "tools.js")).href + "?no-section";
      await assert.rejects(import(url), /has no section/);
    } finally {
      loans.sectionId = "calculators";
    }
  });
});

describe("routing: every registered tool keeps its URL", () => {
  test("every catalog tool: site path /calculators/<id>/, link equal to ROUTES.calculator(id)", () => {
    assert.ok(calcs.calculators.length > 0);
    for (const tool of calcs.calculators) {
      assert.equal(tool.sitePath, `/calculators/${tool.id}/`, tool.id);
      assert.equal(tool.href, `${ROOT}calculators/${tool.id}/`, tool.id);
      assert.equal(tool.href, routes.ROUTES.calculator(tool.id), tool.id);
    }
  });

  test("the published tools' site paths are exactly the tool URLs in the URL inventory", () => {
    const published = calcs.calculators.filter((t) => t.available).map((t) => t.sitePath).sort();
    const live = inventory.live.map((p) => p.url).filter((u) => u.startsWith("/calculators/") && u.endsWith("/")).sort();
    assert.deepEqual(published, live);
    assert.deepEqual(published, [...PUBLISHED_URLS].sort());
  });

  test("the unpublished tools' reserved URLs in the inventory are the catalog's site paths", () => {
    for (const c of inventory.comingSoon.filter((x) => x.kind === "calculator")) {
      assert.equal(calcs.getCalculatorById(c.id).sitePath, c.wouldBeUrl, c.id);
    }
  });

  test("ROUTES.tool is the generic resolver: calculators match ROUTES.calculator, another prefix gives its own path", () => {
    for (const tool of calcs.calculators) assert.equal(routes.ROUTES.tool("calculators", tool.id), routes.ROUTES.calculator(tool.id));
    assert.equal(routes.ROUTES.tool("some-section", "some-tool"), `${ROOT}some-section/some-tool/`);
  });

  test("the calculator loader registry is unchanged: loaders only for the published tools, still lazy", () => {
    assert.deepEqual(Object.keys(registry.calculatorRegistry).sort(), ["balance-transfer", "cagr", "countdown-timer", "date-calculator", "date-difference", "emi", "fd", "gst", "home-loan", "income-tax", "json-formatter", "loan-comparison", "margin", "percentage", "prepayment", "profit", "sip", "stopwatch", "text-diff", "unix-timestamp-converter"]);
    for (const loader of Object.values(registry.calculatorRegistry)) assert.equal(typeof loader, "function");
    assert.deepEqual(registry.calculatorMetadata.emi, { section: "Calculators", category: "loans", title: "EMI Calculator" });
    assert.deepEqual(registry.calculatorMetadata["income-tax"], { section: "Calculators", category: "tax", title: "Old vs New Tax Regime Calculator" });
    assert.deepEqual(registry.calculatorMetadata["date-difference"], { section: "Time Tools", title: "Date Difference Calculator" });
    assert.deepEqual(registry.calculatorMetadata["date-calculator"], { section: "Time Tools", title: "Date Calculator" });
    assert.deepEqual(registry.calculatorMetadata["countdown-timer"], { section: "Time Tools", title: "Countdown Timer" });
    assert.deepEqual(registry.calculatorMetadata.stopwatch, { section: "Time Tools", title: "Stopwatch" });
    assert.deepEqual(registry.calculatorMetadata["json-formatter"], { section: "Developer Tools", title: "JSON Formatter & Validator" });
    assert.deepEqual(registry.calculatorMetadata["unix-timestamp-converter"], { section: "Developer Tools", title: "Unix Timestamp Converter" });
    assert.deepEqual(registry.calculatorMetadata["text-diff"], { section: "Developer Tools", title: "Text Diff / Compare" });
  });
});

describe("optional subcategory", () => {
  const sub = { id: "e1-sub", category: "loans", title: "E1 Subcategory" };
  afterEach(() => {
    cats.subcategories.length = 0;
    delete calcs.getCalculatorById("emi").subcategory;
  });

  test("Section -> Category -> Tool needs no subcategory", () => {
    const p = tax.getToolPath(calcs.getCalculatorById("emi"));
    assert.deepEqual([p.section.id, p.category.id, p.subcategory], ["calculators", "loans", null]);
  });

  test("Section -> Category -> Subcategory -> Tool resolves when a subcategory exists, section still derived from the category", () => {
    cats.subcategories.push(sub);
    calcs.getCalculatorById("emi").subcategory = "e1-sub";
    const p = tax.getToolPath(calcs.getCalculatorById("emi"));
    assert.deepEqual([p.section.id, p.category.id, p.subcategory.id], ["calculators", "loans", "e1-sub"]);
    assert.equal(tax.getSectionForCategory(sub.category).id, "calculators");
  });
});

describe("search derives the section from the data", () => {
  test("every index entry carries its section, taken from its category", () => {
    for (const e of idx.searchIndex) {
      const section = e.type === "tool" ? tax.getSectionForTool(tools.getToolById(e.id)) : tax.getSectionForCategory(e.category);
      assert.equal(e.section, section?.id ?? null, e.key);
      assert.equal(e.sectionTitle, section?.title ?? "", e.key);
    }
    assert.equal(idx.searchIndex.find((e) => e.key === "tool:emi").section, "calculators");
    assert.equal(idx.searchIndex.find((e) => e.key === "category:converter").section, "calculators");
  });

  test("ranking is unchanged: the section is not a search field", () => {
    const ids = (q) => search.search(q, { index: idx.searchIndex }).map((e) => e.key);
    const stripped = idx.searchIndex.map(({ section, sectionTitle, ...rest }) => rest);
    for (const q of ["loan", "emi", "calculator", "tax", "interest", "calculators"]) {
      assert.deepEqual(ids(q), search.search(q, { index: stripped }).map((e) => e.key), q);
    }
  });
});

describe("generated output follows the catalog", () => {
  for (const [dir, label] of [["dist", "root build"], ["dist-ghpages", "GitHub Pages build"]]) {
    test(`${label}: a page at every published tool's path, and none at an unpublished one`, (t) => {
      if (!fs.existsSync(path.join(PROJECT, dir))) return t.skip(`${dir}/ not built`);
      for (const tool of calcs.calculators) {
        const file = path.join(PROJECT, dir, tool.sitePath.slice(1), "index.html");
        assert.equal(fs.existsSync(file), tool.available, `${dir}${tool.sitePath}`);
      }
    });
  }
});
