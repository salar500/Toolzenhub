/**
 * One-screen desktop workspace (owner finding, 2026-11-09; owner decision 2026-11-10): from 1200 px the result summary sits beside the
 * inputs, and a calculator's wide tables (schedules, year-by-year tables) sit in a full-width section under both, so no column of a
 * result table is hidden behind a sideways scroll. Every calculator in the inventory is checked at 1280 x 800 with its default values.
 */
import { test, expect, livePages } from "../helpers/test-base.mjs";

const CALCULATORS = livePages.filter((p) => p.url.startsWith("/calculators/")).map((p) => p.url.slice(1));

test.describe("Calculator result tables at 1280 px @desktop-only", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "subpath-desktop", "the width is set here");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  for (const url of CALCULATORS) {
    test(`${url}: no result table scrolls sideways`, async ({ page, go }) => {
      await go(url);
      await page.locator("main form, main input").first().waitFor();
      await page.waitForLoadState("networkidle");
      const squeezed = await page.evaluate(() => [...document.querySelectorAll("main .calculator-results__table-wrapper")]
        .filter((w) => w.offsetParent && w.scrollWidth > w.clientWidth + 2)
        .map((w) => `${w.getAttribute("aria-label") || w.className}: ${w.clientWidth} px shown of ${w.scrollWidth}`));
      expect(squeezed, "result tables must fit their column").toEqual([]);
    });
  }

  test("the wide-table calculators keep the result summary beside the inputs, with the tables under both", async ({ page, go }) => {
    for (const id of ["emi", "home-loan", "sip", "ppf", "margin", "prepayment", "profit", "balance-transfer", "swp"]) {
      await go(`calculators/${id}/`);
      const form = page.locator(".calculator-page > .calculator-section").first();
      const results = page.locator(".calculator-page > .calculator-results").first();
      const wide = page.locator(".calculator-page > .calculator-wide").first();
      await expect(wide.locator(".calculator-results__table-wrapper").first(), id).toBeAttached();
      const [f, r, w] = await Promise.all([form.boundingBox(), results.boundingBox(), wide.boundingBox()]);
      expect(r.x, `${id}: result beside the form`).toBeGreaterThan(f.x + f.width - 1);
      expect(r.y, `${id}: result starts in the first screen`).toBeLessThan(800);
      expect(w.y, `${id}: tables under the form and the result`).toBeGreaterThanOrEqual(Math.max(f.y + f.height, r.y + r.height) - 1);
      expect(w.width, `${id}: tables span both columns`).toBeGreaterThan(f.width + r.width);
    }
  });
});
