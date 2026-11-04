/**
 * JSON Compare: the line of each difference in its own document, the line-number gutters, and a large pair.
 * Expected lines are counted by hand from the texts below.
 */
import { test, expect } from "../helpers/test-base.mjs";

const first = (page) => page.locator("#jc-first");
const second = (page) => page.locator("#jc-second");
const status = (page) => page.locator("#jc-status");

async function open(page, go) {
  await go("tools/json-compare/");
  await expect(page.locator("#jc-panel")).toHaveAttribute("data-ready", "true");
}

const A = ["{", '  "name": "Asha",', '  "tags": [', '    "x",', '    "y"', "  ],", '  "gone": 1', "}"].join("\n");
const B = ["{", '  "name": "Asha Rao",', '  "tags": ["x", "z"],', '  "new": true', "}"].join("\n");

test.describe("JSON Compare: lines", () => {
  test("each difference shows its line in both documents", async ({ page, go }) => {
    await open(page, go);
    await first(page).fill(A);
    await second(page).fill(B);
    await expect(status(page)).toContainText("4 differences");
    const cells = await page.locator("#jc-rows tr").evaluateAll((rows) =>
      rows.map((r) => [...r.children].slice(1).map((c) => c.textContent.replace(/\s+/g, " ").trim())));
    const byPath = Object.fromEntries(cells.map((c) => [c[0], c]));
    expect(byPath["$['name']"][1]).toMatch(/^Line 2/);
    expect(byPath["$['name']"][2]).toMatch(/^Line 2/);
    expect(byPath["$['tags'][1]"][1]).toMatch(/^Line 5/);
    expect(byPath["$['tags'][1]"][2]).toMatch(/^Line 3/);
    expect(byPath["$['gone']"][1]).toMatch(/^Line 7/);
    expect(byPath["$['gone']"][2]).toBe("(none)");
    expect(byPath["$['new']"][2]).toMatch(/^Line 4/);
  });

  test("both boxes have a line-number gutter and do not wrap", async ({ page, go }) => {
    await open(page, go);
    await first(page).fill(A);
    await expect(first(page)).toHaveAttribute("wrap", "off");
    await expect(second(page)).toHaveAttribute("wrap", "off");
    expect(await page.locator("#jc-panel [class*='gutter']").count()).toBeGreaterThanOrEqual(2);
  });

  test("a large pair: the single difference is found on the right line and nothing is truncated", async ({ page, go }) => {
    await open(page, go);
    const rows = (v) => "[\n" + Array.from({ length: 3000 }, (_, i) => `  {"id": ${i}, "v": ${i === 1234 ? v : 0}}`).join(",\n") + "\n]";
    for (const [box, text] of [[first(page), rows(1)], [second(page), rows(2)]]) {
      await box.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); }, text);
    }
    const compare = page.getByRole("button", { name: "Compare", exact: true });
    if (await compare.isEnabled()) await compare.click();
    await expect(status(page)).toContainText("1 difference");
    const text = await page.locator("#jc-rows tr").first().evaluate((r) => r.textContent.replace(/\s+/g, " "));
    expect(text).toContain("Line 1236"); // [ on line 1, element 1234 on line 1236
  });
});
