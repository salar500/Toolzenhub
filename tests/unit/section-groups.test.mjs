/** The sidebar groups: every published tool of a grouped section is placed in exactly one named group (none falls into "More"), and the search matcher. */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };
const { SECTION_GROUPS, groupSectionTools } = await import("../../assets/js/components/section-switcher.js");
const { matchLabels } = await import("../../assets/js/ui/section-rail.js");
const tax = await import("../../assets/js/data/taxonomy.js");

const live = (id) => tax.getToolsBySection(id).filter((t) => t.available);

test("every published tool of a grouped section is in exactly one named group, and no group names a missing tool", () => {
  for (const [section, defs] of Object.entries(SECTION_GROUPS)) {
    const tools = live(section);
    const groups = groupSectionTools(section, tools, () => undefined);
    assert.ok(!groups.some((g) => g.label === "More"), `${section}: a published tool is missing from SECTION_GROUPS: ${groups.find((g) => g.label === "More")?.items.map((t) => t.id)}`);
    const placed = groups.flatMap((g) => g.items.map((t) => t.id));
    assert.deepEqual([...placed].sort(), tools.map((t) => t.id).sort());
    assert.equal(new Set(placed).size, placed.length);
    for (const id of defs.flatMap((d) => d.ids)) assert.ok(tools.some((t) => t.id === id), `${section}: ${id} is not a published tool of the section`);
  }
});

test("Calculators are grouped by their catalog categories, in catalog order", () => {
  const groups = groupSectionTools("calculators", live("calculators"), (t) => tax.getCategoryForTool(t)?.title);
  assert.deepEqual(groups.map((g) => g.label), ["Loans", "Investment", "Tax", "Health", "Business", "Math", "Converter"]);
  assert.equal(groups.reduce((n, g) => n + g.items.length, 0), 30);
});

test("a section without groups or categories is one unnamed group", () => {
  const groups = groupSectionTools("image-tools", live("image-tools"), () => undefined);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, "");
});

test("search: every word must appear, any order, case-insensitive; empty matches all", () => {
  const labels = ["EMI Calculator", "Home Loan Calculator", "SIP Calculator", "Loan Prepayment Calculator"];
  assert.deepEqual(matchLabels(labels, ""), [0, 1, 2, 3]);
  assert.deepEqual(matchLabels(labels, "loan"), [1, 3]);
  assert.deepEqual(matchLabels(labels, "calculator LOAN"), [1, 3]);
  assert.deepEqual(matchLabels(labels, "prepay loan"), [3]);
  assert.deepEqual(matchLabels(labels, "zzz"), []);
});
