/**
 * Tool Pack 11: Date Difference Calculator, the Time Tools section and search isolation.
 * Figures are the independently derived values of tests/fixtures/date-difference-golden.py, written as literals.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#date-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const setDates = async (page, a, b) => {
  await page.locator("#date-start").fill(a);
  await page.locator("#date-end").fill(b);
};
const crumbLabels = async (page) =>
  (await page.locator(".calculator-breadcrumb").locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);

test.describe("Date Difference Calculator", () => {
  test("page, breadcrumb, blank default and a normal result", async ({ page, go, watch, siteRoot }) => {
    await go("tools/date-difference/");
    await expect(page.locator("h1")).toHaveText("Date Difference Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    expect((await crumbLabels(page)).slice(0, 3)).toEqual(["home", "time tools", "date difference calculator"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}time-tools.html`]);

    await expect(page.locator("#date-start")).toHaveValue("");
    await expect(page.locator("#date-end")).toHaveValue("");
    await expect(page.getByLabel("Start date")).toBeVisible();
    await expect(page.getByLabel("End date")).toBeVisible();
    await expect(page.locator("#date-results")).toContainText("Choose a start date and an end date.");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.locator(".related-section")).toHaveCount(0);

    await setDates(page, "2026-01-01", "2026-02-10");
    await expect(metric(page, "Total days")).toHaveText("40 days");
    await expect(metric(page, "Years, months and days")).toHaveText("1 month, 9 days");
    await expect(metric(page, "Weeks and days")).toHaveText("5 weeks, 5 days");
    await expect(page.locator("#date-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Total days");
    await expect(page.locator("#date-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#date-start")).toHaveValue("");
    await expect(page.locator("#date-results")).toContainText("Choose a start date and an end date.");
    expectClean(watch);
  });

  test("reversed, same date and month-end cases", async ({ page, go }) => {
    await go("tools/date-difference/");
    await setDates(page, "2026-02-10", "2026-01-01");
    await expect(metric(page, "Total days")).toHaveText("40 days");
    await expect(page.locator("#date-results")).toContainText("The end date comes before the start date");
    await setDates(page, "2026-02-10", "2026-02-10");
    await expect(metric(page, "Total days")).toHaveText("0 days");
    await expect(page.locator("#date-results")).toContainText("Both dates are the same.");
    await setDates(page, "2026-01-31", "2026-03-01");
    await expect(metric(page, "Total days")).toHaveText("29 days");
    await expect(metric(page, "Years, months and days")).toHaveText("1 month, 1 day");
    await setDates(page, "2024-02-29", "2025-02-28");
    await expect(metric(page, "Total days")).toHaveText("365 days");
    await expect(metric(page, "Years, months and days")).toHaveText("1 year");
    await setDates(page, "2000-01-01", "2026-10-05");
    await expect(metric(page, "Total days")).toHaveText("9,774 days");
    await expect(metric(page, "Years, months and days")).toHaveText("26 years, 9 months, 4 days");
  });

  test("one date only gives guidance, not a number", async ({ page, go }) => {
    await go("tools/date-difference/");
    await page.locator("#date-start").fill("2026-01-01");
    await expect(page.locator("#date-results")).toContainText("Choose a start date and an end date.");
    await expect(page.locator("#date-results .calculator-results__value")).toHaveCount(0);
    await page.locator("#date-end").fill("2026-01-02");
    await expect(metric(page, "Total days")).toHaveText("1 day");
  });

  test("explanation sections are on the page and make no accuracy claim", async ({ page, go }) => {
    await go("tools/date-difference/");
    const body = page.locator("main");
    for (const h of ["How to Use the Date Difference Calculator", "How the Difference Is Calculated", "Leap Years and Month Lengths", "Common Uses"]) {
      await expect(body.getByRole("heading", { name: h })).toBeVisible();
    }
    await expect(body.locator("details")).toHaveCount(5);
    await expect(body).not.toContainText(/100% accurate|most accurate|\bbest\b|age calculator/i);
  });

  test("a result does not overflow the viewport", async ({ page, go }) => {
    await go("tools/date-difference/");
    await setDates(page, "2026-01-01", "2026-02-10");
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Time Tools section, All Tools and search isolation", () => {
  test("the Time Tools landing lists the tool, with the right title and breadcrumb", async ({ page, go, watch }) => {
    await go("time-tools.html");
    await expect(page.locator("h1")).toHaveText("Time Tools");
    await expect(page).toHaveTitle("Time Tools | ToolZen Hub");
    expect((await crumbLabels(page)).slice(0, 3)).toEqual(["home", "all tools", "time tools"]);
    await expect(page.locator('a[href$="tools/date-difference/"]')).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon/i);
    await expectNoHorizontalOverflow(page);
    expectClean(watch);
  });

  test("All Tools search finds it first by name and by alias", async ({ page, go }) => {
    for (const q of ["date difference", "days between dates", "weeks between dates", "how many days between dates", "calendar difference"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      const first = page.locator("#tools-results a.directory-result").first();
      await expect(first).toContainText("Date Difference Calculator");
      await expect(first).toContainText("Time Tools");
    }
    await go("tools.html?q=age%20calculator");
    await expect(page.locator("#tools-results a.directory-result", { hasText: "Date Difference" })).toHaveCount(0);
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("date difference");
    await expect(page.locator("main")).not.toContainText("Date Difference Calculator");
    await page.locator("#categories-search-input").fill("days between dates");
    await expect(page.locator("main")).not.toContainText("Date Difference Calculator");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("days between dates");
    await expect(page.locator("#calculators-grid")).not.toContainText("Date Difference");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("date difference");
    await expect(page.locator("main")).not.toContainText("Date Difference Calculator");
  });

  test("Home hero search finds it on All Tools", async ({ page, go }) => {
    await go("");
    await page.locator('#calculator-search input[name="q"]').fill("days between dates");
    await page.locator('#calculator-search input[name="q"]').press("Enter");
    await expect(page.locator("#tools-results a.directory-result").first()).toContainText("Date Difference Calculator");
  });
});
