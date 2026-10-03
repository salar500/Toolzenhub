/**
 * E3: the unified tool catalog (assets/js/data/tools.js) is the one owner of tool metadata.
 *
 * Everything else (the calculator compatibility view, the loader registry, taxonomy, search, relationships,
 * the site build, the URL inventory) must DERIVE from it. These tests pin that, the catalog's validation, and
 * that nothing visible changed. Runs in GitHub Pages mode.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };
const ROOT = "/Toolzenhub/";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(PROJECT, rel), "utf8");
const inventory = JSON.parse(read("tests/inventory/url-inventory.json"));

let cat, compat, registry, tax, idx, rel, arts, cats, caps;
before(async () => {
  cat = await import("../../assets/js/data/tools.js");
  compat = await import("../../assets/js/data/calculators.js");
  registry = await import("../../assets/js/calculator-registry.js");
  tax = await import("../../assets/js/data/taxonomy.js");
  idx = await import("../../assets/js/data/search-index.js");
  rel = await import("../../assets/js/data/relationships.js");
  arts = await import("../../assets/js/data/articles.js");
  cats = await import("../../assets/js/data/categories.js");
  caps = await import("../../assets/js/data/tool-capabilities.js");
});

// a valid published and a valid coming-soon entry, used as the base for the validation cases
const published = () => ({
  id: "sample", status: "published", category: "loans", icon: "x", title: "Sample", description: "A sample.",
  loader: () => import("../../assets/js/data/tool-capabilities.js"),
});
const soon = () => ({ id: "later", status: "coming-soon", category: "loans", icon: "x", title: "Later", description: "Later." });

describe("one authoritative catalog", () => {
  test("the catalog holds every tool exactly once", () => {
    const ids = cat.getTools().map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(cat.getPublishedTools().map((t) => t.id).sort(), [...inventory.summary.builtCalculators].sort());
  });

  test("the calculator view is the SAME objects, not a copy", () => {
    assert.ok(compat.calculators.length > 0);
    for (const c of compat.calculators) assert.strictEqual(c, cat.getToolById(c.id), c.id);
    assert.strictEqual(compat.getCalculatorById("emi"), cat.getToolById("emi"));
  });

  test("the calculator view is the Calculators section's tools", () => {
    const expected = cat.getTools().filter((t) => tax.getSectionForTool(t).id === "calculators").map((t) => t.id);
    assert.deepEqual(compat.calculators.map((c) => c.id), expected);
    assert.deepEqual(compat.getCalculatorsByCategory("loans").map((c) => c.id), cat.getToolsByCategory("loans").map((t) => t.id));
  });

  test("the old unused `type` field is gone; toolType is the only tool type concept", () => {
    for (const t of cat.getTools()) {
      assert.ok(!("type" in t), `${t.id} has the removed type field`);
      assert.ok(caps.TOOL_TYPES.includes(t.toolType), t.id);
    }
  });
});

describe("generic helpers", () => {
  test("getToolById, getToolsByCategory and getPublishedTools", () => {
    assert.equal(cat.getToolById("emi").title, "EMI Calculator");
    assert.equal(cat.getToolById("nope"), undefined);
    assert.deepEqual(cat.getToolsByCategory("loans").map((t) => t.id), tax.getToolsByCategory("loans").map((t) => t.id));
    assert.deepEqual(cat.getToolsByCategory("nope"), []);
    assert.ok(cat.getPublishedTools().every((t) => t.available && t.status === "published"));
  });

  test("getToolRoute resolves through the section-aware route mechanism", () => {
    for (const t of cat.getTools()) {
      assert.equal(cat.getToolRoute(t), t.href, t.id);
      assert.equal(t.href, `${ROOT}${tax.getSectionForTool(t).pathPrefix}/${t.id}/`, t.id);
      assert.equal(t.sitePath, `/calculators/${t.id}/`, t.id);
    }
  });

  test("getToolMetadata is what the breadcrumb and registry have always received", () => {
    assert.deepEqual(cat.getToolMetadata(cat.getToolById("emi")), { section: "Calculators", category: "loans", title: "EMI Calculator" });
    assert.deepEqual(cat.getToolMetadata(cat.getToolById("loan-comparison")), { section: "Calculators", category: "loans", title: "Loan Comparison Calculator" });
    assert.deepEqual(cat.getToolMetadata({ ...cat.getToolById("emi"), subcategory: "s" }).subcategory, "s");
    assert.deepEqual(registry.calculatorMetadata.emi, cat.getToolMetadata(cat.getToolById("emi")));
  });
});

describe("the two real tools are unchanged", () => {
  test("EMI Calculator", () => {
    const t = cat.getToolById("emi");
    assert.deepEqual([t.id, t.title, t.status, t.category, t.toolType, t.sitePath, t.section], ["emi", "EMI Calculator", "published", "loans", "calculator", "/calculators/emi/", "Calculators"]);
    assert.equal(t.description, "Calculate your monthly EMI for any loan amount, interest rate and tenure.");
    assert.deepEqual(t.seo, { title: "EMI Calculator | ToolZen Hub", description: "Calculate your monthly EMI, total interest and total repayment for a loan.", themeColor: "#2563eb" });
  });

  test("Loan Comparison Calculator", () => {
    const t = cat.getToolById("loan-comparison");
    assert.deepEqual([t.id, t.title, t.status, t.category, t.toolType, t.sitePath, t.section], ["loan-comparison", "Loan Comparison Calculator", "published", "loans", "calculator", "/calculators/loan-comparison/", "Calculators"]);
    assert.equal(t.seo.title, "Loan Comparison Calculator | ToolZenHub");
  });

  test("the Coming Soon tools are untouched: unpublished, no loader, no page", () => {
    const soonTools = cat.getTools().filter((t) => !t.available);
    assert.equal(soonTools.length, cat.getTools().length - inventory.summary.builtCalculators.length);
    for (const t of soonTools) {
      assert.equal(t.status, "coming-soon", t.id);
      assert.equal(t.loader, undefined, t.id);
    }
  });
});

describe("loaders: one owner, still lazy", () => {
  test("the registry's loaders ARE the catalog's functions", () => {
    for (const t of cat.getPublishedTools()) assert.strictEqual(registry.calculatorRegistry[t.id], t.loader, t.id);
    assert.deepEqual(Object.keys(registry.calculatorRegistry).sort(), cat.getPublishedTools().map((t) => t.id).sort());
  });

  test("tool modules are named only in the catalog, and only as dynamic import()", () => {
    const toolsSrc = read("assets/js/data/tools.js");
    assert.ok(!/^\s*import\s[^(]*from\s*["'][^"']*(calculators\/emi|loan-comparison)/m.test(toolsSrc), "static import of a tool module");
    assert.equal((toolsSrc.match(/import\(\s*"[^"]*(?:calculators\/emi|loan-comparison)[^"]*"\s*\)/g) || []).length, 2);
    for (const rel of ["assets/js/data/calculators.js", "assets/js/calculator-registry.js", "assets/js/data/search-index.js", "assets/js/data/relationships.js", "assets/js/data/taxonomy.js", "src/_data/tools.js"]) {
      assert.ok(!/calculators\/emi\/index|loans\/loan-comparison\/index/.test(read(rel)), `${rel} names a tool module`);
    }
  });

  test("a loader is a function that has not run until it is called (importing the catalog loads no tool code)", () => {
    for (const t of cat.getPublishedTools()) {
      assert.equal(typeof t.loader, "function");
      assert.match(String(t.loader), /import\(\s*["'][^"']+["']\s*\)/, t.id); // the build reads this literal path
    }
  });
});

describe("validation fails loudly", () => {
  const build = (...entries) => cat.buildToolCatalog(entries);

  test("a valid published and a valid coming-soon entry build", () => {
    const built = build(published(), soon());
    assert.deepEqual(built.map((t) => t.id), ["sample", "later"]);
    assert.equal(built[0].available, true);
    assert.equal(built[1].available, false);
    assert.equal(built[0].sitePath, "/calculators/sample/");
  });

  test("duplicate or malformed ids", () => {
    assert.throws(() => build(published(), { ...soon(), id: "sample" }), /Tool "sample": duplicate id/);
    for (const id of ["", "Has Caps", "under_score", "-lead", "trail-", 5, undefined]) {
      assert.throws(() => build({ ...soon(), id }), /must be a lower-case slug/, String(id));
    }
  });

  test("missing title or description", () => {
    assert.throws(() => build({ ...soon(), title: "" }), /missing title/);
    assert.throws(() => build({ ...soon(), title: undefined }), /missing title/);
    assert.throws(() => build({ ...soon(), description: " " }), /missing description/);
  });

  test("unknown category, and a category without a section", () => {
    assert.throws(() => build({ ...soon(), category: "nope" }), /unknown category "nope"/);
    const loans = cats.categories.find((c) => c.id === "loans");
    loans.sectionId = "nope";
    try {
      assert.throws(() => build(soon()), /has no section/);
    } finally {
      loans.sectionId = "calculators";
    }
  });

  test("invalid status", () => {
    assert.throws(() => build({ ...soon(), status: "draft" }), /status must be published or coming-soon/);
    assert.throws(() => build({ ...soon(), status: undefined }), /status must be/);
  });

  test("invalid tool type and malformed capabilities", () => {
    assert.throws(() => build({ ...published(), toolType: "widget" }), /unknown tool type/);
    assert.throws(() => build({ ...published(), capabilities: { reset: "yes" } }), /must be true or false/);
    assert.throws(() => build({ ...published(), capabilities: { nope: true } }), /unknown capability/);
    assert.throws(() => build({ ...soon(), capabilities: { reset: true } }), /cannot declare capabilities/);
  });

  test("a published tool needs a loader; a coming-soon tool must not have one", () => {
    const { loader, ...noLoader } = published();
    assert.throws(() => build(noLoader), /is published but has no loader/);
    assert.throws(() => build({ ...published(), loader: "x" }), /has no loader/);
    assert.throws(() => build({ ...soon(), loader: () => import("../../assets/js/data/tool-capabilities.js") }), /must not have a loader/);
  });

  test("the removed type field is rejected so it cannot return beside toolType", () => {
    assert.throws(() => build({ ...soon(), type: "simple" }), /old `type` field was removed/);
  });

  test("curated related tools must exist", () => {
    assert.throws(() => build({ ...soon(), relatedTools: ["ghost"] }), /relatedTools names unknown tool "ghost"/);
    assert.doesNotThrow(() => build(published(), { ...soon(), relatedTools: ["sample"] }));
  });

  test("every page in the real catalog is distinct (no route collisions)", () => {
    const paths = cat.getTools().map((t) => t.sitePath);
    assert.equal(new Set(paths).size, paths.length);
  });
});

describe("everything else derives from the catalog", () => {
  test("taxonomy lookups come from the catalog", () => {
    assert.deepEqual(tax.getToolsByCategory("investment").map((t) => t.id), cat.getToolsByCategory("investment").map((t) => t.id));
  });

  test("search: every tool entry is generated from its catalog entry", () => {
    const entries = idx.searchIndex.filter((e) => e.type === "tool");
    assert.equal(entries.length, cat.getTools().length);
    for (const t of cat.getTools()) {
      const e = entries.find((x) => x.id === t.id);
      assert.deepEqual([e.title, e.description, e.category, e.route, e.status], [t.title, t.description, t.category, t.available ? t.href : null, t.status], t.id);
    }
  });

  test("relationships point at stable tool ids that exist", () => {
    const ids = new Set(cat.getTools().map((t) => t.id));
    for (const a of arts.articles) for (const id of a.tools || []) assert.ok(ids.has(id), `article ${a.slug} -> unknown tool ${id}`);
    const keys = new Set(arts.articles.map((a) => a.key));
    for (const a of arts.articles) for (const k of a.related || []) assert.ok(keys.has(k), `article ${a.slug} -> unknown article ${k}`);
    for (const t of cat.getTools()) {
      for (const id of t.relatedTools || []) assert.ok(ids.has(id), t.id);
      for (const k of t.relatedArticles || []) assert.ok(keys.has(k), t.id);
    }
    assert.deepEqual(rel.getRelatedTools("emi").map((t) => t.id), rel.getRelatedTools("emi").map((t) => t.id).filter((id) => id !== "emi"));
  });

  test("the site build: one page per published tool, with the catalog's own SEO text and loader path", async () => {
    const data = (await import(pathToFileURL(path.join(PROJECT, "src", "_data", "tools.js")).href)).default;
    const pages = await data();
    assert.deepEqual(pages.map((p) => p.id).sort(), cat.getPublishedTools().map((t) => t.id).sort());
    for (const p of pages) {
      const t = cat.getToolById(p.id);
      assert.deepEqual([p.sitePath, p.title, p.description], [t.sitePath, t.seo.title, t.seo.description], p.id);
      assert.ok(p.modulePath.startsWith("/") && fs.existsSync(path.join(PROJECT, p.modulePath)), p.modulePath);
    }
  });

  test("the URL inventory agrees with the catalog", () => {
    assert.deepEqual([...inventory.summary.builtCalculators].sort(), cat.getPublishedTools().map((t) => t.id).sort());
    const soonInInventory = inventory.comingSoon.filter((c) => c.kind === "calculator");
    assert.deepEqual(soonInInventory.map((c) => c.id).sort(), cat.getTools().filter((t) => !t.available).map((t) => t.id).sort());
    for (const c of soonInInventory) assert.equal(c.wouldBeUrl, cat.getToolById(c.id).sitePath, c.id);
    assert.equal(inventory.summary.comingSoonCalculators, soonInInventory.length);
  });

  test("the sitemap lists exactly the published tools' pages (when built)", (t) => {
    const file = path.join(PROJECT, "dist", "sitemap.xml");
    if (!fs.existsSync(file)) return t.skip("dist/ not built");
    const locs = [...fs.readFileSync(file, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const toolLocs = locs.filter((l) => l.startsWith("https://toolzenhub.in/calculators/")).sort();
    assert.deepEqual(toolLocs, cat.getPublishedTools().map((tool) => `https://toolzenhub.in${tool.sitePath}`).sort());
  });
});
