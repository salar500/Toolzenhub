/**
 * Owner findings 12, 14, 15: line numbers beside the JSON boxes (JSON Formatter input and output, JSON Compare both inputs).
 * The numbers are drawn, not part of the value; they follow typing, code-set values and scrolling; an error line is marked.
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";

const gutterText = (box) => box.locator("xpath=..").locator(".line-field__numbers").evaluate((el) => el.textContent);

test.describe("line numbers", () => {
  test("JSON Formatter: input and output are numbered, the value stays clean, the error line is marked", async ({ page, go, watch }) => {
    await go("tools/json-formatter/");
    const input = page.locator("#jf-input");
    const output = page.locator("#jf-output");
    await expect(page.locator(".line-field")).toHaveCount(2);
    expect(await gutterText(input)).toBe("1");

    await input.fill('{"a":1,\n"b":[1,2,\n3],\n"c":{"d":true}}');
    expect((await gutterText(input)).split("\n")).toEqual(["1", "2", "3", "4"]);
    await expect(input).toHaveValue('{"a":1,\n"b":[1,2,\n3],\n"c":{"d":true}}'); // numbers are not in the value

    await page.getByRole("button", { name: "Format", exact: true }).click();
    const formatted = await output.inputValue();
    const lines = formatted.split("\n").length;
    expect(lines).toBeGreaterThan(4);
    expect((await gutterText(output)).split("\n")).toHaveLength(lines); // a value set by code is numbered too
    expect(formatted).toBe(JSON.stringify({ a: 1, b: [1, 2, 3], c: { d: true } }, null, 2)); // the value holds no line numbers

    // an invalid document: the number of the error line is marked, and cleared again when fixed
    await input.fill('{\n"a": 1,\n"b": 2,\n}');
    await page.getByRole("button", { name: "Validate", exact: true }).click();
    await expect(input.locator("xpath=..").locator(".line-field__mark:not([hidden])")).toHaveCount(1);
    await input.fill('{"a": 1}');
    await page.getByRole("button", { name: "Validate", exact: true }).click();
    await expect(input.locator("xpath=..").locator(".line-field__mark:not([hidden])")).toHaveCount(0);
    expectClean(watch);
  });

  test("a long document: the numbers scroll with the text and line up with it", async ({ page, go }) => {
    await go("tools/json-formatter/");
    const input = page.locator("#jf-input");
    await expect(page.locator(".line-field")).toHaveCount(2); // the tool has started
    const doc = "[\n" + Array.from({ length: 400 }, (_, i) => `  ${i}`).join(",\n") + "\n]";
    await input.fill(doc);
    expect((await gutterText(input)).split("\n")).toHaveLength(402);
    await input.evaluate((el) => { el.scrollTop = 1000; el.dispatchEvent(new Event("scroll")); });
    // the numbers follow the scroll position (within a pixel, once the scroll event has been handled)
    await expect.poll(() => input.evaluate((el) => {
      const shift = new DOMMatrixReadOnly(getComputedStyle(el.parentElement.querySelector(".line-field__inner")).transform).m42;
      return Math.abs(shift + el.scrollTop);
    })).toBeLessThan(1);
    // the first visible number sits on the same row as the first visible text line
    const aligned = await input.evaluate((el) => {
      const lh = parseFloat(getComputedStyle(el).lineHeight);
      const num = el.parentElement.querySelector(".line-field__numbers");
      return Math.abs(num.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - (parseFloat(getComputedStyle(el).paddingTop) + parseFloat(getComputedStyle(el).borderTopWidth) - 1)) < lh;
    });
    expect(aligned).toBe(true);
  });

  test("JSON Compare: both inputs are numbered and marked on an error", async ({ page, go }) => {
    await go("tools/json-compare/");
    await expect(page.locator(".line-field")).toHaveCount(2); // the tool has started
    await page.locator("#jc-first").fill('{\n"a": 1,\n"b": 2,\n}');
    await page.locator("#jc-second").fill('{"a": 1}');
    expect((await gutterText(page.locator("#jc-first"))).split("\n")).toEqual(["1", "2", "3", "4"]);
    expect(await gutterText(page.locator("#jc-second"))).toBe("1");
    await page.getByRole("button", { name: /compare/i }).first().click();
    await expect(page.locator("#jc-first").locator("xpath=..").locator(".line-field__mark:not([hidden])")).toHaveCount(1);
  });
});
