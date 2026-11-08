/* Automation locator evaluator: the parser accepts the documented subset and explains what it does not support. */
import test from "node:test";
import assert from "node:assert/strict";
import { parseLocator } from "../../assets/js/practice-labs/automation/locator.js";

test("parses chains with options", () => {
  assert.deepEqual(parseLocator("await page.getByRole('button', { name: 'Add to cart', exact: true }).first();"),
    [{ method: "getByRole", arg: "button", options: { name: "Add to cart", exact: true } }, { method: "first", arg: undefined, options: {} }]);
  assert.deepEqual(parseLocator(`page.locator(".sl-card").filter({ hasText: "Lamp" }).nth(0)`).map((s) => s.method), ["locator", "filter", "nth"]);
  assert.equal(parseLocator("page.getByTestId('add-7')")[0].arg, "add-7");
  assert.equal(parseLocator("page.getByLabel(\"Coupon code\")")[0].arg, "Coupon code");
});

test("explains unsupported input", () => {
  assert.throws(() => parseLocator("getByText('x')"), /Start with page\./);
  assert.throws(() => parseLocator("page.getByRole('slider')"), /not in this teaching subset/);
  assert.throws(() => parseLocator("page.click('x')"), /not understood/);
});
