/**
 * Every slider of every published calculator (found on the page, not listed here): its two ends are written under it, moving it to the
 * minimum, the midpoint and the maximum sets the number field to exactly that value, and a typed value beyond its range leaves the thumb at an
 * end without touching the number. 19 calculators, 71 sliders at the time of writing (scripts/gen-slider-inventory.mjs lists them).
 * It does not re-test the formulas (their own specs and golden tests do); it checks the control, and that no page shows NaN or undefined.
 */
import { test, expect, livePages, rel } from "../helpers/test-base.mjs";

const PAGES = livePages.filter((p) => /\/calculators\/[^/]+\/$/.test(p.url)).map((p) => rel(p.url));

const decimalsOf = (step) => (String(step).split(".")[1] ?? "").length;

test.describe("sliders of every calculator", () => {
  for (const path of PAGES) {
    test(`${path}: ends, minimum, midpoint, maximum, and a typed value beyond the range`, async ({ page, go }) => {
      await go(path);
      const sliders = page.locator("input.calculator-form__slider");
      const count = await page.locator("input[data-slider-min]").count(); // declared in the page; the sliders are drawn by script
      test.skip(count === 0, "no slider on this calculator");
      await expect(sliders).toHaveCount(count);
      const ends = page.locator("[data-slider-ends-for]");
      await expect(ends).toHaveCount(count);

      for (let i = 0; i < count; i += 1) {
        const slider = sliders.nth(i);
        const id = await slider.getAttribute("data-slider-for");
        const field = page.locator(`#${id}`);
        const min = Number(await slider.getAttribute("min"));
        const max = Number(await slider.getAttribute("max"));
        const step = Number(await slider.getAttribute("step"));
        const where = `${path} #${id} (${min}..${max}, step ${step})`;

        // both ends are written, readable, and not broken
        const labels = await page.locator(`[data-slider-ends-for="${id}"] span`).allInnerTexts();
        expect(labels, where).toHaveLength(2);
        for (const text of labels) expect(text, where).toMatch(/\d/);
        for (const text of labels) expect(text, where).not.toMatch(/NaN|undefined|null/);
        expect(await page.locator(`[data-slider-ends-for="${id}"]`).getAttribute("aria-hidden"), where).toBe("true");
        if (!(await field.isVisible())) continue; // a mode of the calculator that hides this field

        // the minimum, the midpoint (on a step) and the maximum
        const mid = Math.round((min + (max - min) / 2) / step) * step;
        for (const value of [min, mid, max]) {
          await slider.fill(String(value));
          const shown = Number(await field.inputValue());
          expect(shown, `${where} -> ${value}`).toBeCloseTo(value, decimalsOf(step));
          expect(Number(await slider.inputValue()), where).toBeCloseTo(value, decimalsOf(step));
        }

        // a typed value beyond the range: the thumb stays at the end, the typed number is left alone
        await field.fill(String(max * 10 + 1));
        expect(await field.inputValue(), where).toBe(String(max * 10 + 1));
        expect(Number(await slider.inputValue()), where).toBe(max);
        await field.fill(String(min));
        expect(Number(await slider.inputValue()), where).toBe(min);
      }

      const text = await page.locator("main").innerText();
      expect(text, path).not.toMatch(/\bNaN\b|\bundefined\b|\[object Object\]/);
    });
  }
});
