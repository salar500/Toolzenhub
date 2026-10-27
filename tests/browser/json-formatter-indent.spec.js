/**
 * JSON Formatter indentation choice (approved enhancement X3). The engine is proven in
 * tests/unit/json-formatter-indent.test.mjs; these tests prove the page control.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#jf-input");
const output = (page) => page.locator("#jf-output");
const select = (page) => page.getByLabel("Indentation for Format");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

const DOC = '{"a":[1,{"b":2}]}';

async function open(page, go) {
  await go("tools/json-formatter/");
  await expect(input(page)).toBeVisible();
}

test.describe("JSON Formatter indentation", () => {
  test("the control is labelled, defaults to 2 spaces, and the default output is unchanged", async ({ page, go }) => {
    await open(page, go);
    await expect(select(page)).toHaveValue("two");
    await expect(select(page).locator("option")).toHaveText(["2 spaces", "4 spaces", "Tab"]);
    await input(page).fill(DOC);
    await btn(page, "Format").click();
    await expect(output(page)).toHaveValue(JSON.stringify(JSON.parse(DOC), null, 2));
    await expect(page.locator("#jf-output-meta")).toContainText("Formatted, 2 spaces");
  });

  test("4 spaces and Tab format with that indentation and say so; Minify ignores the choice", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(DOC);
    await select(page).selectOption("four");
    await btn(page, "Format").click();
    await expect(output(page)).toHaveValue(JSON.stringify(JSON.parse(DOC), null, 4));
    await expect(page.locator("#jf-output-meta")).toContainText("Formatted, 4 spaces");
    await select(page).selectOption("tab");
    await btn(page, "Format").click();
    await expect(output(page)).toHaveValue(JSON.stringify(JSON.parse(DOC), null, "\t"));
    await expect(page.locator("#jf-output-meta")).toContainText("Formatted, tab indent");
    await btn(page, "Minify").click();
    await expect(output(page)).toHaveValue(DOC);
    await expect(input(page)).toHaveValue(DOC);
  });

  test("changing the choice does not format by itself, and the keyboard can operate it", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(DOC);
    await select(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(select(page)).toHaveValue("four");
    await expect(output(page)).toHaveValue("");
  });

  test("it fits at 320 px with a 44 px target", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, go);
    await expectNoHorizontalOverflow(page);
    const box = await select(page).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  });
});
