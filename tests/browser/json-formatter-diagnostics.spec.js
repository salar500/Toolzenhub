/**
 * JSON Formatter: diagnostics beyond the basic cases, in a real browser. Expected lines and columns are counted by hand.
 * The input is never changed by the tool except when the visitor presses "Apply this fix".
 */
import { test, expect } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#jf-input");
const where = (page) => page.locator("#jf-error-where");

async function validate(page, go, text) {
  await go("tools/json-formatter/");
  await expect(page.locator(".line-field")).toHaveCount(2);
  await input(page).evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); }, text);
  await page.getByRole("button", { name: "Validate", exact: true }).click();
}

test.describe("JSON Formatter: diagnostics", () => {
  test("a long document: the error is on the right line and column, Go to error scrolls to it, nothing is altered", async ({ page, go }) => {
    const rows = Array.from({ length: 2500 }, (_, i) => `  {"id": ${i}}`);
    rows[1999] = '  {"id": 1999 "x": 1}'; // line 2001 (the [ is line 1, row 0 is line 2): a comma is missing before "x"
    const text = `[\n${rows.join(",\n")}\n]`;
    await validate(page, go, text);
    await expect(page.locator("#jf-error")).toBeVisible();
    await expect(where(page)).toContainText("Line 2001, column 15");
    await expect(page.locator("#jf-error-message")).toContainText("comma may be missing");
    await expect(input(page)).toHaveValue(text);
    await page.getByRole("button", { name: "Go to error" }).click();
    const picked = await input(page).evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd + 3));
    expect(picked).toContain('"x"');
    await expect(page.locator("#jf-fix")).toBeVisible();
    await expect(input(page)).toHaveValue(text); // a proposal only
  });

  test("incomplete JSON says what is never closed and where it opened; a proposal is offered, not applied", async ({ page, go }) => {
    const text = '{\n  "a": [\n    1,\n    2\n';
    await validate(page, go, text);
    await expect(page.locator("#jf-error-message")).toContainText("never closed");
    await expect(page.locator("#jf-fix-text")).toContainText("Add ]}");
    await expect(input(page)).toHaveValue(text);
  });

  test("an unclosed string is reported with its line, and no fix is guessed", async ({ page, go }) => {
    const text = '{\n  "a": "open,\n  "b": 2\n}';
    await validate(page, go, text);
    await expect(page.locator("#jf-error")).toBeVisible();
    await expect(where(page)).toContainText(/Line [23]/);
    await expect(input(page)).toHaveValue(text);
  });

  test("a missing value after a colon and a stray closing bracket are located", async ({ page, go }) => {
    await validate(page, go, '{\n  "a":\n}');
    await expect(where(page)).toContainText("Line 3");
    await validate(page, go, '[1, 2]]');
    await expect(where(page)).toContainText("Line 1, column 7");
  });

  test("Apply this fix changes the text only when pressed, and Undo-by-typing is not blocked", async ({ page, go }) => {
    await validate(page, go, '{"a":1,\n"b":2,}');
    await expect(page.locator("#jf-fix")).toBeVisible();
    await page.getByRole("button", { name: "Apply this fix" }).click();
    await expect(input(page)).toHaveValue('{"a":1,\n"b":2}');
    await input(page).focus();
    await page.keyboard.type(" ");
    await expect(input(page)).toHaveValue('{"a":1,\n"b":2} ');
  });
});
