/**
 * E2: the tool capability contract (assets/js/data/tool-capabilities.js) and how the catalog uses it.
 *
 * The two real tools' profiles below are LITERALS taken from reading the tool code (a capability is
 * true only where the code does it), not derived from the code under test. Metadata does not create
 * functionality: nothing renders or behaves differently because of these flags, and these tests also
 * pin that nothing downstream (URLs, search, generated pages) changed.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const inventory = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "inventory", "url-inventory.json"), "utf8"));

const EXPECTED_KEYS = [
  "reset", "compare", "chart", "table", "modal", "print", "download", "share", "copy", "presets", "history",
  "savedState", "urlState", "unitSelection", "multipleInputs", "validation", "explanation", "examples",
  "schedule", "realtime", "timer", "localProcessing",
];
const EMI_TRUE = ["explanation", "localProcessing", "multipleInputs", "reset", "validation"];
const LOAN_COMPARISON_TRUE = [
  "compare", "download", "examples", "explanation", "localProcessing", "modal", "multipleInputs",
  "realtime", "reset", "schedule", "table", "unitSelection",
];
// features neither tool has (checked in the tool code): they must not be claimed
const NOT_BUILT = ["chart", "print", "share", "copy", "presets", "history", "savedState", "urlState", "timer"];

let cap, calcs, routes, idx;
before(async () => {
  cap = await import("../../assets/js/data/tool-capabilities.js");
  calcs = await import("../../assets/js/data/calculators.js");
  routes = await import("../../assets/js/routes.js");
  idx = await import("../../assets/js/data/search-index.js");
});

const trueKeys = (tool) => Object.entries(tool.capabilities).filter(([, v]) => v).map(([k]) => k).sort();

describe("tool type", () => {
  test("the allowed types are stable machine-readable values; calculator is the default", () => {
    assert.deepEqual([...cap.TOOL_TYPES], ["calculator", "converter", "timer", "timezone", "developer", "utility"]);
    assert.equal(cap.DEFAULT_TOOL_TYPE, "calculator");
    assert.equal(cap.resolveToolType(undefined), "calculator");
    for (const type of cap.TOOL_TYPES) assert.equal(cap.resolveToolType(type), type);
  });

  test("an unknown or malformed type fails loudly, naming the tool", () => {
    for (const bad of ["Calculator", "tool", "", null, 7, {}]) {
      assert.throws(() => cap.resolveToolType(bad, 'Tool "x"'), /Tool "x": unknown tool type/, String(bad));
    }
  });

  test("every tool in the catalog resolves as a calculator", () => {
    for (const tool of calcs.calculators) assert.equal(tool.toolType, "calculator", tool.id);
  });
});

describe("capability keys and defaults", () => {
  test("the contract's keys", () => {
    assert.deepEqual([...cap.CAPABILITY_KEYS], EXPECTED_KEYS);
    for (const key of cap.CAPABILITY_KEYS) assert.ok(typeof cap.CAPABILITIES[key] === "string" && cap.CAPABILITIES[key].length > 0, key);
  });

  test("nothing declared means every capability is false (no need to list unsupported ones)", () => {
    const none = cap.resolveCapabilities(undefined);
    assert.deepEqual(Object.keys(none), EXPECTED_KEYS);
    assert.ok(Object.values(none).every((v) => v === false));
    assert.deepEqual(cap.resolveCapabilities({}), none);
  });

  test("a compact declaration is enough; the result always has every key, in order", () => {
    const r = cap.resolveCapabilities({ reset: true, compare: true });
    assert.deepEqual(Object.keys(r), EXPECTED_KEYS);
    assert.deepEqual(Object.entries(r).filter(([, v]) => v).map(([k]) => k), ["reset", "compare"]);
  });

  test("an explicit false is accepted and stays false", () => {
    assert.equal(cap.resolveCapabilities({ chart: false }).chart, false);
  });

  test("the resolved set is frozen", () => {
    assert.ok(Object.isFrozen(cap.resolveCapabilities({ reset: true })));
  });
});

describe("validation fails loudly", () => {
  test("unknown capability keys", () => {
    assert.throws(() => cap.resolveCapabilities({ resett: true }, 'Tool "x"'), /Tool "x": unknown capability "resett"/);
    assert.throws(() => cap.resolveCapabilities({ reset: true, bogus: true }), /unknown capability "bogus"/);
  });

  test("values must be real booleans", () => {
    for (const bad of ["true", 1, 0, null, undefined, {}, [], { enabled: true }]) {
      assert.throws(() => cap.resolveCapabilities({ reset: bad }), /must be true or false/, JSON.stringify(bad));
    }
  });

  test("the declaration itself must be an object", () => {
    for (const bad of [null, "reset", 5, true, ["reset"]]) {
      assert.throws(() => cap.resolveCapabilities(bad), /capabilities must be an object/, JSON.stringify(bad));
    }
  });

  test("a tool that is not published cannot declare capabilities", () => {
    assert.throws(() => cap.describeTool({ id: "soon", status: "coming-soon", capabilities: { reset: true } }), /Tool "soon": is "coming-soon", so it cannot declare capabilities/);
    assert.throws(() => cap.describeTool({ id: "soon", status: "coming-soon", capabilities: {} }), /cannot declare capabilities/);
    const ok = cap.describeTool({ id: "soon", status: "coming-soon" });
    assert.equal(ok.toolType, "calculator");
    assert.ok(Object.values(ok.capabilities).every((v) => v === false));
  });

  test("a published tool with a bad declaration is rejected with its id", () => {
    assert.throws(() => cap.describeTool({ id: "emi", status: "published", capabilities: { chart: "yes" } }), /Tool "emi": capability "chart" must be true or false/);
    assert.throws(() => cap.describeTool({ id: "emi", status: "published", toolType: "widget" }), /Tool "emi": unknown tool type/);
  });
});

describe("the two real tools", () => {
  test("EMI Calculator: only what its code does", () => {
    const emi = calcs.getCalculatorById("emi");
    assert.deepEqual(trueKeys(emi), EMI_TRUE);
    assert.equal(emi.toolType, "calculator");
  });

  test("Loan Comparison Calculator: only what its code does", () => {
    const lc = calcs.getCalculatorById("loan-comparison");
    assert.deepEqual(trueKeys(lc), LOAN_COMPARISON_TRUE);
    assert.equal(lc.toolType, "calculator");
  });

  test("features neither tool has are not claimed", () => {
    for (const id of ["emi", "loan-comparison"]) {
      for (const key of NOT_BUILT) assert.equal(calcs.getCalculatorById(id).capabilities[key], false, `${id} ${key}`);
    }
    assert.equal(calcs.getCalculatorById("emi").capabilities.compare, false);
    assert.equal(calcs.getCalculatorById("emi").capabilities.realtime, false); // EMI needs its Calculate button
  });
});

describe("helpers", () => {
  test("hasToolCapability and getToolCapabilities read a catalog tool", () => {
    const emi = calcs.getCalculatorById("emi");
    assert.equal(cap.hasToolCapability(emi, "reset"), true);
    assert.equal(cap.hasToolCapability(emi, "compare"), false);
    assert.deepEqual(cap.getToolCapabilities(emi), emi.capabilities);
  });

  test("a tool without capabilities (or no tool) has none; an unknown key is an error, not false", () => {
    assert.equal(cap.hasToolCapability({ id: "plain" }, "reset"), false);
    assert.equal(cap.hasToolCapability(undefined, "reset"), false);
    assert.throws(() => cap.hasToolCapability(calcs.getCalculatorById("emi"), "resett"), /Unknown capability "resett"/);
  });
});

describe("Coming Soon tools stay unbuilt", () => {
  test("every unpublished tool supports nothing, has no loader and no page", () => {
    const soon = calcs.calculators.filter((t) => t.status !== "published");
    assert.ok(soon.length > 0);
    for (const t of soon) {
      assert.equal(t.available, false, t.id);
      assert.equal(t.loader, undefined, t.id);
      assert.ok(Object.values(t.capabilities).every((v) => v === false), t.id);
      assert.equal(trueKeys(t).length, 0, t.id);
    }
  });

  test("the published set is still exactly the URL inventory's built tools", () => {
    // the inventory lists every built tool page; Date Difference (Time Tools) is not in the calculator view
    assert.deepEqual(calcs.calculators.filter((t) => t.available).map((t) => t.id).sort(), inventory.summary.builtCalculators.filter((id) => !["date-difference", "date-calculator", "countdown-timer", "stopwatch", "json-formatter"].includes(id)).sort());
  });
});

describe("backward compatibility: nothing else changed", () => {
  test("a catalog entry keeps every field it had before E2, except the unused `type` hint removed in E3", () => {
    const emi = calcs.getCalculatorById("emi");
    for (const key of ["id", "status", "category", "icon", "title", "description", "seo", "section", "sitePath", "href", "available", "loader"]) {
      assert.ok(key in emi, key);
    }
    for (const tool of calcs.calculators) assert.ok(!("type" in tool), `${tool.id} still has the old type field`);
  });

  test("tool URLs are unchanged", () => {
    for (const tool of calcs.calculators) {
      assert.equal(tool.sitePath, `/calculators/${tool.id}/`, tool.id);
      assert.equal(tool.href, routes.ROUTES.calculator(tool.id), tool.id);
    }
  });

  test("the tool module contract (markup / init / render) is untouched", async () => {
    for (const id of ["emi", "loan-comparison"]) {
      const mod = await calcs.getCalculatorById(id).loader();
      for (const fn of ["markup", "init", "render"]) assert.equal(typeof mod[fn], "function", `${id}.${fn}`);
    }
  });

  test("search entries do not carry capabilities or a tool type: no visible or ranking change", () => {
    for (const e of idx.searchIndex) {
      assert.ok(!("capabilities" in e) && !("toolType" in e), e.key);
    }
  });
});
