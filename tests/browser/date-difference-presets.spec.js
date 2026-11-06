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
  ["Previous 7 days", "2026-02-27", "2026-03-05", "6 days"],
  ["Previous 30 days", "2026-02-04", "2026-03-05", "29 days"],
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

  test("the help text explains the inclusive reading and matches the Previous 7 days range", async ({ page, go }) => {
    await go("tools/date-difference/");
    const help = page.locator("#date-presets-label");
    await expect(help).toContainText("6 days apart (7 if you count both end days)");
    await expect(help).toContainText("Previous 7 days");
    await page.getByRole("button", { name: "Previous 7 days", exact: true }).click();
    const n = Number((await metric(page, "Total days").innerText()).split(" ")[0]);
    expect(n + 1).toBe(7); // counting both end days
  });

  test("a preset replaces typed dates, and a backward range is not reported as reversed", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-start").fill("2020-01-01");
    await page.locator("#date-end").fill("2020-01-10");
    await page.getByRole("button", { name: "Previous 30 days", exact: true }).click();
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

/* ---- grouped quick dates, previous and future periods, the calendar button (clock fixed at Thursday 5 March 2026, 23:59 local) ---- */
const RANGES = [
  // [button, start, end]
  ["Previous 5 days", "2026-03-01", "2026-03-05"],
  ["Previous 14 days", "2026-02-20", "2026-03-05"],
  ["Previous week", "2026-02-23", "2026-03-01"],
  ["Previous month", "2026-02-01", "2026-02-28"],
  ["Previous 3 months", "2025-12-01", "2026-02-28"],
  ["Previous 6 months", "2025-09-01", "2026-02-28"],
  ["Previous year", "2025-01-01", "2025-12-31"],
  ["Next 5 days", "2026-03-06", "2026-03-10"],
  ["Next 7 days", "2026-03-06", "2026-03-12"],
  ["Next 14 days", "2026-03-06", "2026-03-19"],
  ["Next 30 days", "2026-03-06", "2026-04-04"],
  ["Next week", "2026-03-09", "2026-03-15"],
  ["Next month", "2026-04-01", "2026-04-30"],
  ["Next 3 months", "2026-04-01", "2026-06-30"],
  ["Next 6 months", "2026-04-01", "2026-09-30"],
  ["Next year", "2027-01-01", "2027-12-31"],
];

test.describe("Date Difference: grouped presets and the calendar button", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 2, 5, 23, 59, 0));
  });

  test("the presets are in four labelled groups, quick dates first", async ({ page, go }) => {
    await go("tools/date-difference/");
    const legends = await page.locator(".date-presets__group > legend").allInnerTexts();
    expect(legends).toEqual(["Quick dates (one date)", "Previous periods (both dates)", "Future periods (both dates)", "From today (both dates)"]);
    await expect(page.locator(".date-presets__group").nth(1).locator("button")).toHaveCount(9);
    await expect(page.locator(".date-presets__group").nth(2).locator("button")).toHaveCount(9);
  });

  for (const [name, start, end] of RANGES) {
    test(`${name}: ${start} to ${end}`, async ({ page, go }) => {
      await go("tools/date-difference/");
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator("#date-start")).toHaveValue(start);
      await expect(page.locator("#date-end")).toHaveValue(end);
      await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    });
  }

  test("quick dates fill the one date chosen and leave the other alone; late evening is still today", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-end").fill("2030-01-01");
    await page.getByRole("button", { name: "Yesterday", exact: true }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-03-04");
    await expect(page.locator("#date-end")).toHaveValue("2030-01-01");
    await page.getByLabel("End date", { exact: true }).last().check();
    await page.getByRole("button", { name: "Tomorrow", exact: true }).click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-06");
    await expect(page.locator("#date-start")).toHaveValue("2026-03-04");
    await page.getByRole("button", { name: "Today", exact: true }).click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-05");
  });

  test("each date has a calendar button and Use today; manual typing still works", async ({ page, go }) => {
    await go("tools/date-difference/");
    for (const id of ["date-start", "date-end"]) {
      await expect(page.locator(`#${id}`).locator("xpath=..").locator(".date-field__button")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Open calendar: Start date/ })).toBeVisible();
    await page.locator('[data-today="date-end"]').click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-05");
    await expect(page.locator("#date-start")).toHaveValue("");
    await page.locator("#date-start").fill("2026-02-01");
    await expect(page.locator("#date-start")).toHaveValue("2026-02-01");
    await expect(metric(page, "Total days")).toHaveText("32 days");
  });

  test("the calendar button opens the browser's picker without changing the value", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-start").fill("2026-02-01");
    await page.evaluate(() => { window.__picker = 0; HTMLInputElement.prototype.showPicker = function () { window.__picker += 1; }; });
    await page.getByRole("button", { name: /Open calendar: Start date/ }).click();
    expect(await page.evaluate(() => window.__picker)).toBe(1);
    await expect(page.locator("#date-start")).toHaveValue("2026-02-01");
  });
});
