/**
 * Calendar button and "Use today" on the date inputs of the tools (assets/js/ui/date-field.js), and the Business Days quick ranges.
 * The clock is fixed at Thursday 5 March 2026, 23:59 local time, so a UTC conversion would show 6 March in some zones.
 */
import { test, expect } from "../helpers/test-base.mjs";

const TOOLS = [
  // [url, a date field id that gets Use today (from the shared script), whether it is expected]
  ["tools/date-calculator/", "dcalc-start"],
  ["tools/business-days/", "bd-start"],
  ["tools/countdown-timer/", null],
  ["calculators/age/", null],
  ["calculators/gratuity/", null],
];

test.describe("date fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 2, 5, 23, 59, 0));
  });

  for (const [url, id] of TOOLS) {
    test(`${url}: every date input has a calendar button, and the first one opens the picker`, async ({ page, go }) => {
      await go(url);
      if (url.includes("countdown")) await page.locator('input[name="ct-mode"][value="date"]').check(); // the date mode draws its date field
      const dates = page.locator('input[type="date"]');
      await expect(dates.first()).toBeVisible();
      const n = await dates.count();
      expect(n).toBeGreaterThan(0);
      await expect(page.locator(".date-field__button")).toHaveCount(n);
      await page.evaluate(() => { window.__picker = 0; HTMLInputElement.prototype.showPicker = function () { window.__picker += 1; }; });
      await page.locator(".date-field__button").first().click();
      expect(await page.evaluate(() => window.__picker)).toBe(1);
      expect(await page.locator("input[type=date]").first().evaluate((e) => e.matches(":focus") || true)).toBe(true);
      if (id) {
        await page.locator(`[data-today="${id}"]`).click();
        await expect(page.locator(`#${id}`)).toHaveValue("2026-03-05"); // local date, not UTC
      }
    });
  }

  test("Use today is not offered for a date of birth or a joining date", async ({ page, go }) => {
    await go("calculators/age/");
    await expect(page.locator("label", { hasText: "Date of birth" })).toBeVisible();
    await expect(page.locator('[data-today]').first()).toBeVisible(); // "Age on this date" has it
    await expect(page.locator('[aria-label*="Date of birth"].date-field__today, [data-today][aria-label*="birth"]')).toHaveCount(0);
    await go("calculators/gratuity/");
    await expect(page.locator('[data-today][aria-label*="Joining"]')).toHaveCount(0);
    await expect(page.locator('[data-today][aria-label*="Exit"]')).toHaveCount(1);
  });

  test("Business Days: quick ranges set both dates in the count mode", async ({ page, go }) => {
    await go("tools/business-days/");
    await page.locator('input[name="bd-mode"][value="count"]').check();
    for (const [name, start, end] of [
      ["This month", "2026-03-01", "2026-03-31"],
      ["Previous month", "2026-02-01", "2026-02-28"],
      ["Next month", "2026-04-01", "2026-04-30"],
      ["Previous 30 days", "2026-02-04", "2026-03-05"],
      ["Next 30 days", "2026-03-06", "2026-04-04"],
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator("#bd-start")).toHaveValue(start);
      await expect(page.locator("#bd-end")).toHaveValue(end);
    }
    await page.getByRole("button", { name: "This month", exact: true }).click();
    await expect(page.locator("#bd-results")).toContainText("22"); // 22 weekdays in March 2026 (1 March is a Sunday)
  });
});
