/**
 * Date Difference Calculator: quick dates and ranges in a real browser, with the clock fixed in March 2026 (a non-leap
 * February behind it). Expected dates are worked by hand. Two counts are always shown: the days between the dates
 * (today to 6 days from today is 6) and the calendar dates counted with both ends (7).
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

// The page ships as static HTML that the script then redraws; a click before that is lost. The date-field enhancer marks the redrawn input.
const openTool = async (page, go) => {
  await go("tools/date-difference/");
  await expect(page.locator('#date-start[data-date-field="ready"]')).toBeAttached();
};

const metric = (page, label) =>
  page.locator(`#date-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const BETWEEN = "Days between the dates";
const DATES = "Calendar dates, both counted";

const RANGES = [
  // [button, start, end, calendar dates counted, days between]
  ["Last 7 calendar days (including today)", "2026-02-27", "2026-03-05", "7 days", "6 days"],
  ["Next 7 calendar days (including today)", "2026-03-05", "2026-03-11", "7 days", "6 days"],
  ["Next 14 calendar days (including today)", "2026-03-05", "2026-03-18", "14 days", "13 days"],
  ["This month so far (1st to today)", "2026-03-01", "2026-03-05", "5 days", "4 days"]
];

test.describe("Date Difference: quick dates under each field and common ranges", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  test("nothing is filled until a button is pressed", async ({ page, go }) => {
    await openTool(page, go);
    await expect(page.locator("#date-start")).toHaveValue("");
    await expect(page.locator("#date-end")).toHaveValue("");
  });

  test("each date has its own quick dates directly below its input, named for that field", async ({ page, go }) => {
    await openTool(page, go);
    for (const [id, field, extra] of [["date-start", "start date", "6 days ago"], ["date-end", "end date", "6 days from today"]]) {
      const row = page.getByRole("group", { name: `Quick dates for the ${field}` });
      await expect(row.getByRole("button")).toHaveText(["Yesterday", "Today", "Tomorrow", extra]);
      const input = await page.locator(`#${id}`).boundingBox(), box = await row.boundingBox();
      expect(box.y).toBeGreaterThan(input.y);
      expect(box.y - (input.y + input.height)).toBeLessThan(60);
    }
    await expect(page.locator('input[name="date-quick-target"]')).toHaveCount(0);
  });

  test("quick dates fill only their own field", async ({ page, go }) => {
    await openTool(page, go);
    await page.locator("#date-end").fill("2030-01-01");
    await page.getByRole("button", { name: "Set the start date to yesterday" }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-03-04");
    await expect(page.locator("#date-end")).toHaveValue("2030-01-01");
    await page.getByRole("button", { name: "Set the end date to tomorrow" }).click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-06");
    await expect(page.locator("#date-start")).toHaveValue("2026-03-04");
    await page.getByRole("button", { name: "Set the end date to today" }).click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-05");
  });

  test("6 days ago to 6 days from today: 12 days between, 13 calendar dates", async ({ page, go }) => {
    await openTool(page, go);
    await page.getByRole("button", { name: "Set the start date to 6 days ago" }).click();
    await page.getByRole("button", { name: "Set the end date to 6 days from today" }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-02-27");
    await expect(page.locator("#date-end")).toHaveValue("2026-03-11");
    await expect(metric(page, BETWEEN)).toHaveText("12 days");
    await expect(metric(page, DATES)).toHaveText("13 days");
  });

  for (const [name, start, end, dates, between] of RANGES) {
    test(`${name}: ${start} to ${end}, ${dates} counted, ${between} between`, async ({ page, go }) => {
      await openTool(page, go);
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator("#date-start")).toHaveValue(start);
      await expect(page.locator("#date-end")).toHaveValue(end);
      await expect(page.locator("#date-inclusive")).toBeChecked();
      await expect(page.locator("#date-results .calculator-results__item--primary .calculator-results__label")).toHaveText(DATES);
      await expect(metric(page, DATES)).toHaveText(dates);
      await expect(metric(page, BETWEEN)).toHaveText(between);
      await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("the help text explains the two counts with the 6 and 7 example", async ({ page, go }) => {
    await openTool(page, go);
    await expect(page.locator("#date-presets-label")).toContainText("6 days apart and covers 7 calendar dates, today included");
  });

  test("a range replaces typed dates, and a backward range is not reported as reversed", async ({ page, go }) => {
    await openTool(page, go);
    await page.locator("#date-start").fill("2020-01-01");
    await page.locator("#date-end").fill("2020-01-10");
    await page.getByRole("button", { name: "Last 7 calendar days (including today)" }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-02-27");
    await expect(page.locator("#date-results")).not.toContainText("The end date comes before the start date");
  });

  test("boundary dates give a figure or a clear message, never NaN", async ({ page, go }) => {
    await openTool(page, go);
    await page.locator("#date-start").fill("0001-01-01");
    await page.locator("#date-end").fill("9999-12-31");
    await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    await expect(metric(page, BETWEEN)).toHaveText("36,52,058 days");
    await page.locator("#date-start").fill("2024-02-29");
    await page.locator("#date-end").fill("2024-02-29");
    await expect(page.locator("#date-results")).toContainText("Both dates are the same.");
  });
});

/* ---- whole periods under More ranges, and the calendar button (clock fixed at Thursday 5 March 2026, 23:59 local) ---- */
const PERIODS = [
  // [button, start, end]
  ["Previous week", "2026-02-23", "2026-03-01"],
  ["Previous month", "2026-02-01", "2026-02-28"],
  ["Previous 3 months", "2025-12-01", "2026-02-28"],
  ["Previous 6 months", "2025-09-01", "2026-02-28"],
  ["Previous year", "2025-01-01", "2025-12-31"],
  ["Next week", "2026-03-09", "2026-03-15"],
  ["Next month", "2026-04-01", "2026-04-30"],
  ["Next 3 months", "2026-04-01", "2026-06-30"],
  ["Next 6 months", "2026-04-01", "2026-09-30"],
  ["Next year", "2027-01-01", "2027-12-31"]
];

test.describe("Date Difference: More ranges and the calendar button", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 2, 5, 23, 59, 0));
  });

  test("whole periods are collapsed under More ranges until opened", async ({ page, go }) => {
    await openTool(page, go);
    const more = page.locator("details.date-presets__more");
    await expect(more).not.toHaveAttribute("open", "");
    await expect(page.getByRole("button", { name: "Previous week", exact: true })).toBeHidden();
    await more.locator("summary").click();
    await expect(more.locator(".date-presets__group > legend")).toHaveText(["Previous (both dates)", "Next (both dates)"]);
    await expect(more.locator("button")).toHaveCount(10);
  });

  for (const [name, start, end] of PERIODS) {
    test(`${name}: ${start} to ${end}`, async ({ page, go }) => {
      await openTool(page, go);
      await page.locator("details.date-presets__more summary").click();
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator("#date-start")).toHaveValue(start);
      await expect(page.locator("#date-end")).toHaveValue(end);
      await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    });
  }

  test("late evening is still today for the quick dates", async ({ page, go }) => {
    await openTool(page, go);
    await page.getByRole("button", { name: "Set the start date to today" }).click();
    await expect(page.locator("#date-start")).toHaveValue("2026-03-05");
  });

  test("each date has a calendar button; manual typing still works", async ({ page, go }) => {
    await openTool(page, go);
    for (const id of ["date-start", "date-end"]) {
      await expect(page.locator(`#${id}`).locator("xpath=..").locator(".date-field__button")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Open calendar: Start date/ })).toBeVisible();
    await page.locator('[data-today="date-end"]').click();
    await expect(page.locator("#date-end")).toHaveValue("2026-03-05");
    await expect(page.locator("#date-start")).toHaveValue("");
    await page.locator("#date-start").fill("2026-02-01");
    await expect(page.locator("#date-start")).toHaveValue("2026-02-01");
    await expect(metric(page, BETWEEN)).toHaveText("32 days");
  });

  test("the calendar button opens the browser's picker without changing the value", async ({ page, go }) => {
    await openTool(page, go);
    await page.locator("#date-start").fill("2026-02-01");
    await page.evaluate(() => { window.__picker = 0; HTMLInputElement.prototype.showPicker = function () { window.__picker += 1; }; });
    await page.getByRole("button", { name: /Open calendar: Start date/ }).click();
    expect(await page.evaluate(() => window.__picker)).toBe(1);
    await expect(page.locator("#date-start")).toHaveValue("2026-02-01");
  });
});
