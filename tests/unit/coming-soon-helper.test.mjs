/**
 * The Coming Soon test helper (tests/helpers/coming-soon.mjs) picks a tool from the URL inventory. These tests check it
 * against the LIVE catalog, so the helper cannot drift from what is really Coming Soon.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

import { getComingSoonTool } from "../helpers/coming-soon.mjs";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let catalog;
before(async () => {
  catalog = await import("../../assets/js/data/calculators.js");
});

describe("getComingSoonTool", () => {
  test("returns a calculator that the catalog really lists as coming-soon, with no route", () => {
    const tool = getComingSoonTool();
    const entry = catalog.calculators.find((c) => c.id === tool.id);
    assert.ok(entry, `${tool.id} is not in the catalog`);
    assert.equal(entry.status, "coming-soon");
    assert.equal(entry.available, false);
    assert.equal(tool.mustReturn404, true);
    assert.equal(tool.hasHtmlFile, false);
  });

  test("is deterministic: the first Coming Soon calculator in catalog order, the same every time", () => {
    const firstInCatalog = catalog.calculators.find((c) => c.status === "coming-soon").id;
    assert.equal(getComingSoonTool().id, firstInCatalog);
    assert.equal(getComingSoonTool().id, getComingSoonTool().id);
  });

  test("a category constraint is honoured and matches the catalog", () => {
    const tool = getComingSoonTool({ category: "investment" });
    assert.equal(tool.category, "investment");
    assert.equal(catalog.calculators.find((c) => c.id === tool.id).status, "coming-soon");
    const firstInCategory = catalog.calculators.find((c) => c.status === "coming-soon" && c.category === tool.category).id;
    assert.equal(tool.id, firstInCategory, "the first Coming Soon Investment tool, in catalog order");
  });

  test("fails loudly, with what is left, when nothing matches", () => {
    assert.throws(() => getComingSoonTool({ category: "no-such-category" }), /No Coming Soon calculator in category "no-such-category"[\s\S]*Left:/);
  });
});
