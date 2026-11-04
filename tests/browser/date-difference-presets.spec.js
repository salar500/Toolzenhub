/**
 * Date Difference Calculator: the quick-fill presets in a real browser, with the clock fixed at 5 March 2026 (a non-leap
 * February behind it). Expected dates are worked by hand: a difference counts the days between two dates, so a range
 * that covers n calendar days counting both ends is n - 1 days apart.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#date-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const PRESETS = [
  // [button, start, end, days apart]
  ["Last 7 days", "2026-02-27", "2026-03-05", "6 days"],
  ["Last 30 days", "2026-02-04", "2026-03-05", "29 days"],
  ["Today to 6 days later", "2026-03-05", "2026-03-11", "6 days"],
  ["Today to 7 days later", "2026-03-05", "2026-03-12", "7 days"],
  ["Today to 30 days later", "2026-03-05", "2026-04-04", "30 days"],
  ["1st of this month to today", "2026-03-01", "2026-03-05", "4 days"]
];

test.describe("Date Difference presets in the browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  test("nothing is filled until a preset is pressed", async ({ page, go }) => {
    await go("tools/date-difference/");
    await expect(page.locator("#date-start")).toHaveValue("");
    await expect(page.locator("#date-end")).toHaveValue("");
  });

  for (const [name, start, end, days] of PRESETS) {
    test(`${name}: ${start} to ${end}, ${days} apart`, async ({ page, go }) => {
      await go("tools/date-difference/");
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator("#date-start")).toHaveValue(start);
      await expect(page.locator("#date-end")).toHaveValue(end);
      await expect(metric(page, "Total days")).toHaveText(days);
      await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("the help text explains the inclusive reading and matches the Last 7 days range", async ({ page, go }) => {
    await go("tools/date-difference/");
    const help = page.locator("#date-presets-label");
    await expect(help).toContainText("6 days apart (7 if you count both end days)");
    await expect(help).toContainText("Last 7 days");
    await page.getByRole("button", { name: "Last 7 days", exact: true }).click();
    const n = Number((await metric(page, "Total days").innerText()).split(" ")[0]);
    expect(n + 1).toBe(7); // counting both end days
  });

  test("a preset replaces typed dates, and a backward range is not reported as reversed", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-start").fill("2020-01-01");
    await page.locator("#date-end").fill("2020-01-10");
    await page.getByRole("button", { name: "Last 30 days", exact: true }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-02-04");
    await expect(page.locator("#date-results")).not.toContainText("The end date comes before the start date");
  });

  test("boundary dates give a figure or a clear message, never NaN", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-start").fill("0001-01-01");
    await page.locator("#date-end").fill("9999-12-31");
    await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    await expect(metric(page, "Total days")).toHaveText("36,52,058 days");
    await page.locator("#date-start").fill("2024-02-29");
    await page.locator("#date-end").fill("2024-02-29");
    await expect(page.locator("#date-results")).toContainText("Both dates are the same.");
  });
});
