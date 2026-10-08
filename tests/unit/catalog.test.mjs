/**
 * M1: the calculator catalog (assets/js/data/calculators.js) is the single source of truth.
 * Expected values below are LITERALS captured from the catalog as it was before M1 (git 94c3e2f/adfbb58),
 * not derived from the code under test.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { getComingSoonTool } from "../helpers/coming-soon.mjs";

const inventory = JSON.parse(fs.readFileSync(new URL("../inventory/url-inventory.json", import.meta.url), "utf8"));

// routes.js decides the URL prefix from window.location (GitHub Pages project site vs root).
globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

const ROOT = "/Toolzenhub/";
let catalog, registry, related, allTools;

before(async () => {
  catalog = await import("../../assets/js/data/calculators.js");
  registry = await import("../../assets/js/calculator-registry.js");
  allTools = await import("../../assets/js/data/tools.js");
  const cats = await import("../../assets/js/data/categories.js");
  related = { categories: cats.categories };
});

// the published tools of the Calculators section; Date Difference (Time Tools) is a published tool too, but it is not a calculator
const PUBLISHED_CALCULATORS = ["loan-comparison", "emi", "prepayment", "balance-transfer", "sip", "margin", "profit", "home-loan", "fd", "gst", "cagr", "swp", "percentage", "income-tax"];
const PUBLISHED = [...PUBLISHED_CALCULATORS, "date-difference", "date-calculator", "countdown-timer", "stopwatch", "json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder", "time-zone-converter", "hours-calculator", "image-compressor-resizer"];
const LOANS = ["loan-comparison", "emi", "home-loan", "personal-loan", "loan-eligibility", "balance-transfer", "interest", "prepayment"];

describe("catalog model", () => {
  test("tool ids are unique, and every tool recorded in the URL inventory is still in the catalog (same category)", () => {
    const ids = allTools.tools.map((c) => c.id); // every tool, in every section
    assert.equal(new Set(ids).size, ids.length);
    // the committed inventory is an independent record of every tool that exists today; new tools may be added
    for (const id of inventory.summary.builtCalculators) assert.ok(ids.includes(id), `published tool ${id} disappeared`);
    for (const c of inventory.comingSoon.filter((x) => x.kind === "calculator")) {
      assert.equal(catalog.getCalculatorById(c.id)?.category, c.category, `${c.id} disappeared or changed category`);
    }
  });

  test("every tool has an explicit status of published or coming-soon", () => {
    for (const c of catalog.calculators) assert.ok(["published", "coming-soon"].includes(c.status), `${c.id}: ${c.status}`);
  });

  test("exactly EMI, Loan Comparison, Loan Prepayment, Loan Balance Transfer and SIP Margin, Profit, Home Loan, FD, GST, CAGR and Percentage, Income Tax (the Old vs New Tax Regime Calculator) and SWP are published; all other 12 are coming-soon", () => {
    const pub = catalog.calculators.filter((c) => c.status === "published").map((c) => c.id).sort();
    assert.deepEqual(pub, [...PUBLISHED_CALCULATORS].sort());
    assert.equal(catalog.calculators.filter((c) => c.status === "coming-soon").length, 12);
  });

  test("`available` (read by cards and search) is exactly status === published", () => {
    for (const c of catalog.calculators) assert.equal(c.available, c.status === "published", c.id);
  });

  test("only published tools have a loader, and every published tool has one", () => {
    for (const c of catalog.calculators) {
      if (c.status === "published") assert.equal(typeof c.loader, "function", `${c.id} needs a loader`);
      else assert.equal(c.loader, undefined, `${c.id} is coming-soon and must have no loader`);
    }
  });

  test("routes are /calculators/<id>/ for every tool (EMI and Loan Comparison unchanged)", () => {
    for (const c of catalog.calculators) assert.equal(c.href, `${ROOT}calculators/${c.id}/`, c.id);
    assert.equal(catalog.getCalculatorById("emi").href, `${ROOT}calculators/emi/`);
    assert.equal(catalog.getCalculatorById("loan-comparison").href, `${ROOT}calculators/loan-comparison/`);
  });

  test("every tool category exists in the shared category list; section is Calculators", () => {
    const known = new Set(related.categories.map((c) => c.id));
    for (const c of catalog.calculators) {
      assert.ok(known.has(c.category), `${c.id}: unknown category ${c.category}`);
      assert.equal(c.section, "Calculators");
    }
  });

  test("Loans category lists the same 8 tools in the same order", () => {
    assert.deepEqual(catalog.getCalculatorsByCategory("loans").map((c) => c.id), LOANS);
  });

  test("published identity: titles and descriptions unchanged", () => {
    const emi = catalog.getCalculatorById("emi");
    assert.equal(emi.title, "EMI Calculator");
    assert.equal(emi.category, "loans");
    assert.equal(emi.description, "Calculate your monthly EMI for any loan amount, interest rate and tenure.");
    const lc = catalog.getCalculatorById("loan-comparison");
    assert.equal(lc.title, "Loan Comparison Calculator");
    assert.equal(lc.category, "loans");
    // the existing Coming Soon entry was promoted: same id and URL, new display title
    const pp = catalog.getCalculatorById("prepayment");
    assert.equal(pp.title, "Loan Prepayment Calculator");
    assert.equal(pp.category, "loans");
    assert.equal(pp.href, `${ROOT}calculators/prepayment/`);
  });
});

describe("registry is derived from the catalog", () => {
  test("registry has loaders for exactly the published tools", () => {
    assert.deepEqual(Object.keys(registry.calculatorRegistry).sort(), [...PUBLISHED].sort());
    for (const id of PUBLISHED) assert.equal(registry.calculatorRegistry[id], allTools.getToolById(id).loader);
  });

  test("coming-soon tools are not in the registry or the metadata", () => {
    for (const c of catalog.calculators.filter((c) => c.status !== "published")) {
      assert.equal(c.id in registry.calculatorRegistry, false, c.id);
      assert.equal(c.id in registry.calculatorMetadata, false, c.id);
    }
  });

  test("metadata shape is unchanged: section, category, title", () => {
    assert.deepEqual(registry.calculatorMetadata, {
      "loan-comparison": { section: "Calculators", category: "loans", title: "Loan Comparison Calculator" },
      emi: { section: "Calculators", category: "loans", title: "EMI Calculator" },
      prepayment: { section: "Calculators", category: "loans", title: "Loan Prepayment Calculator" },
      "balance-transfer": { section: "Calculators", category: "loans", title: "Loan Balance Transfer Calculator" },
      sip: { section: "Calculators", category: "investment", title: "SIP Calculator" },
      margin: { section: "Calculators", category: "business", title: "Margin Calculator" },
      profit: { section: "Calculators", category: "business", title: "Profit Calculator" },
      "home-loan": { section: "Calculators", category: "loans", title: "Home Loan Calculator" },
      fd: { section: "Calculators", category: "investment", title: "FD Calculator" },
      gst: { section: "Calculators", category: "tax", title: "GST Calculator" },
      cagr: { section: "Calculators", category: "investment", title: "CAGR Calculator" },
      swp: { section: "Calculators", category: "investment", title: "SWP Calculator" },
      percentage: { section: "Calculators", category: "math", title: "Percentage Calculator" },
      "income-tax": { section: "Calculators", category: "tax", title: "Old vs New Tax Regime Calculator" },
      // a tool directly under a section has no category at all
      "date-difference": { section: "Time Tools", title: "Date Difference Calculator" },
      "date-calculator": { section: "Time Tools", title: "Date Calculator" },
      "countdown-timer": { section: "Time Tools", title: "Countdown Timer" },
      stopwatch: { section: "Time Tools", title: "Stopwatch" },
      "json-formatter": { section: "Developer Tools", title: "JSON Formatter & Validator" },
      "unix-timestamp-converter": { section: "Developer Tools", title: "Unix Timestamp Converter" },
      "text-diff": { section: "Developer Tools", title: "Text Diff / Compare" },
      "jwt-decoder": { section: "Developer Tools", title: "JWT Decoder" },
      "hours-calculator": { section: "Time Tools", title: "Hours & Timesheet Calculator" },
      "time-zone-converter": { section: "Time Tools", title: "Time Zone Converter" },
      "image-compressor-resizer": { section: "Image Tools", title: "Image Compressor & Resizer" },
    });
  });
});

describe("search labels come from the category list", () => {
  test("search results carry the category title and a URL only for published tools", async () => {
    const search = await import("../../assets/js/utils/categories-search.js");
    const all = search.getCalculators();
    assert.equal(all.length, catalog.calculators.length);
    const emi = all.find((c) => c.id === "emi");
    assert.equal(emi.category, "Loans");
    assert.equal(emi.url, `${ROOT}calculators/emi/`);
    // a Coming Soon Investment tool: a category title, and no URL
    const soon = all.find((c) => c.id === getComingSoonTool({ category: "investment" }).id);
    assert.equal(soon.category, "Investment");
    assert.equal(soon.url, null);
    // SIP is published (Tool Pack 3): the same category, and a URL
    const sip = all.find((c) => c.id === "sip");
    assert.equal(sip.category, "Investment");
    assert.equal(sip.url, `${ROOT}calculators/sip/`);
    assert.equal(all.filter((c) => c.url).length, catalog.calculators.filter((c) => c.available).length);
    // the same eight matches as before M7; M7 ranks them (title matches first, published before Coming Soon).
    // "Loan Prepayment Calculator" and "Loan Balance Transfer Calculator" begin with "loan", so they rank with the title-prefix matches.
    assert.deepEqual(search.searchCalculators("loan").map((c) => c.id), ["loan-comparison", "balance-transfer", "prepayment", "loan-eligibility", "home-loan", "personal-loan", "emi", "interest"]);
  });
});
