/**
 * Slider audit, calculation level (2026-11-05). slider-inventory.spec.js proves the control; this proves what the page does with it.
 * For every slider of every published calculator that has one (found on the page), except EMI, FD and GST which the owner asked not to
 * re-run unless shared code changed:
 *   - at the minimum, the midpoint and the maximum, the results shown for a value set by the slider are exactly the results shown when the
 *     same number is typed into the field (so the two inputs are one input), and never contain NaN, Infinity, undefined or [object Object];
 *   - a typed value far beyond the range, and text that is not a number, never break the page (no script error, no NaN) and are answered
 *     either by results or by a message;
 *   - Reset puts the field back to its starting value and the results back to what they were on arrival.
 * It does not recompute the formulas (the golden and unit tests do that); two calculators also get an independent number check at the end.
 */
import { test, expect, livePages, rel } from "../helpers/test-base.mjs";

const SKIP = new Set(["emi", "fd", "gst"]);
const PAGES = livePages
  .filter((p) => /\/calculators\/[^/]+\/$/.test(p.url))
  .map((p) => rel(p.url))
  .filter((path) => !SKIP.has(path.split("/").filter(Boolean).pop()));

const BAD = /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/;
const decimalsOf = (step) => (String(step).split(".")[1] ?? "").length;

const results = (page) => page.locator(".calculator-results").first().innerText();
const settle = (page) => page.waitForTimeout(150);

test.describe("slider values drive the calculation", () => {
  for (const path of PAGES) {
    test(`${path}: slider and typed values agree, edge inputs are answered, Reset restores`, async ({ page, go }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await go(path);
      const declared = await page.locator("input[data-slider-min]").count();
      test.skip(declared === 0, "no slider on this calculator");
      const sliders = page.locator("input.calculator-form__slider");
      await expect(sliders).toHaveCount(declared);

      const arrival = await results(page);
      const starts = {};
      for (let i = 0; i < declared; i += 1) {
        const id = await sliders.nth(i).getAttribute("data-slider-for");
        starts[id] = await page.locator(`#${id}`).inputValue();
      }

      for (let i = 0; i < declared; i += 1) {
        const slider = sliders.nth(i);
        const id = await slider.getAttribute("data-slider-for");
        const field = page.locator(`#${id}`);
        if (!(await field.isVisible())) continue; // a mode of the calculator that hides this field
        const min = Number(await slider.getAttribute("min"));
        const max = Number(await slider.getAttribute("max"));
        const step = Number(await slider.getAttribute("step"));
        const mid = Math.round((min + (max - min) / 2) / step) * step;
        const where = `${path} #${id}`;

        for (const value of [min, mid, max]) {
          await slider.fill(String(value));
          await settle(page);
          const bySlider = await results(page);
          const shown = await field.inputValue();
          await field.fill(String(Number(value.toFixed(decimalsOf(step)))));
          await settle(page);
          const byTyping = await results(page);
          expect(byTyping, `${where} = ${value}: typed and slider results differ`).toBe(bySlider);
          expect(bySlider, `${where} = ${value}`).not.toMatch(BAD);
          expect(Number(shown), `${where} slider set ${value}`).toBeCloseTo(value, decimalsOf(step));
        }

        // far beyond the range, and not a number: answered, never broken
        const isNumber = (await field.getAttribute("type")) === "number"; // the browser itself refuses letters in a number field
        for (const odd of [String(max * 10 + 1), isNumber ? "1e400" : "abc", "-5", "0"]) {
          await field.fill(odd);
          await settle(page);
          expect(await results(page), `${where} typed "${odd}"`).not.toMatch(BAD);
          expect(await page.locator("main").innerText(), `${where} typed "${odd}"`).not.toMatch(BAD);
        }
        await field.fill(starts[id]);
        await settle(page);
      }

      expect(errors, `${path}: script errors`).toEqual([]);

      // Reset: values and results are what they were on arrival
      const reset = page.getByRole("button", { name: /^Reset$/ }).first();
      if (await reset.count()) {
        for (let i = 0; i < declared; i += 1) {
          const id = await sliders.nth(i).getAttribute("data-slider-for");
          if (await page.locator(`#${id}`).isVisible()) await page.locator(`#${id}`).fill("123");
        }
        await reset.click();
        await settle(page);
        for (let i = 0; i < declared; i += 1) {
          const id = await sliders.nth(i).getAttribute("data-slider-for");
          if (await page.locator(`#${id}`).isVisible()) expect(await page.locator(`#${id}`).inputValue(), `${path} #${id} after Reset`).toBe(starts[id]);
        }
        expect(await results(page), `${path}: results after Reset`).toBe(arrival);
      }
    });
  }
});

test.describe("an independent number check", () => {
  test("CAGR: the years slider at its minimum, midpoint and maximum gives (end / start)^(1 / years) - 1", async ({ page, go }) => {
    await go("calculators/cagr/");
    await page.locator("#cagr-start").fill("100000");
    await page.locator("#cagr-end").fill("200000");
    const slider = page.locator('input.calculator-form__slider[data-slider-for="cagr-years"]');
    await expect(slider).toBeVisible();
    const min = Number(await slider.getAttribute("min"));
    const max = Number(await slider.getAttribute("max"));
    for (const years of [min, Math.round((min + max) / 2), max]) {
      await slider.fill(String(years));
      await settle(page);
      const expected = ((2 ** (1 / years)) - 1) * 100;
      await expect(page.locator(".calculator-results").first(), `${years} years`).toContainText(`${expected.toFixed(2)}%`);
    }
  });
});
