/**
 * Tool Pack 12: Date Calculator (add or subtract), its Time Tools placement and search relationships.
 * Results are the independently derived values of tests/fixtures/date-calculator-golden.py, written as literals.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#dcalc-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const IDS = { years: "#dcalc-years", months: "#dcalc-months", weeks: "#dcalc-weeks", days: "#dcalc-days" };
async function enter(page, { start, op = "Add", years = "", months = "", weeks = "", days = "" }) {
  await page.locator("#dcalc-start").fill(start);
  await page.getByRole("radio", { name: op }).check({ force: true });
  for (const [name, value] of Object.entries({ years, months, weeks, days })) await page.locator(IDS[name]).fill(String(value));
}
const crumbLabels = async (page) =>
  (await page.locator(".calculator-breadcrumb").locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);

test.describe("Date Calculator", () => {
  test("page, breadcrumb, blank default, controls and a first result", async ({ page, go, watch, siteRoot }) => {
    await go("tools/date-calculator/");
    await expect(page.locator("h1")).toHaveText("Date Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    expect((await crumbLabels(page)).slice(0, 3)).toEqual(["home", "time tools", "date calculator"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}time-tools.html`]);

    await expect(page.locator("#dcalc-start")).toHaveValue("");
    for (const sel of Object.values(IDS)) await expect(page.locator(sel)).toHaveValue("");
    await expect(page.getByLabel("Start date")).toBeVisible();
    for (const label of ["Years", "Months", "Weeks", "Days"]) await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Add" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Subtract" })).not.toBeChecked();
    await expect(page.locator("#dcalc-results")).toContainText("Choose a start date and enter how much to add or subtract.");
    await expect(page.getByRole("button", { name: "Reset" })).toBeEnabled();
    await expect(page.locator(".related-section")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0);

    await enter(page, { start: "2026-03-10", weeks: 2, days: 3 });
    await expect(metric(page, "Resulting date")).toHaveText("27 March 2026");
    await expect(metric(page, "Weekday")).toHaveText("Friday");
    await expect(metric(page, "Distance from the start date")).toHaveText("17 days after the start date");
    await expect(page.locator("#dcalc-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Resulting date");
    await expect(page.locator("#dcalc-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    await expect(page.locator(".dcalc-note")).toHaveCount(0); // no clamp, so no month-end note
    expectClean(watch);
  });

  test("month-end clamping is explained only when it happens", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await enter(page, { start: "2026-01-31", months: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("28 February 2026");
    await expect(metric(page, "Weekday")).toHaveText("Saturday");
    await expect(page.locator(".dcalc-note")).toContainText("February 2026 has only 28 days");
    await enter(page, { start: "2024-01-31", months: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("29 February 2024");
    await enter(page, { start: "2026-01-28", months: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("28 February 2026");
    await expect(page.locator(".dcalc-note")).toHaveCount(0);
    await enter(page, { start: "2024-02-29", years: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("28 February 2025");
    await expect(page.locator(".dcalc-note")).toContainText("February 2025 has only 28 days");
  });

  test("subtract, operation order and large offsets", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await enter(page, { start: "2026-03-31", op: "Subtract", months: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("28 February 2026");
    await enter(page, { start: "2026-03-31", op: "Subtract", months: 1, days: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("27 February 2026");
    await expect(metric(page, "Distance from the start date")).toHaveText("32 days before the start date");
    await enter(page, { start: "2026-06-15", years: 1, months: 2, weeks: 3, days: 4 });
    await expect(metric(page, "Resulting date")).toHaveText("9 September 2027");
    await enter(page, { start: "2026-01-01", days: 1000 });
    await expect(metric(page, "Resulting date")).toHaveText("27 September 2028");
  });

  test("blank duration is guidance; bad input and out-of-range entries are explained, never numbers", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await page.locator("#dcalc-start").fill("2026-01-01");
    await expect(page.locator("#dcalc-results")).toContainText("Choose a start date and enter how much");
    await expect(page.locator("#dcalc-results .calculator-results__value")).toHaveCount(0);
    await page.locator(IDS.days).fill("0");
    await expect(page.locator("#dcalc-results .calculator-results__value")).toHaveCount(0);

    await page.locator(IDS.days).fill("-5");
    await expect(page.locator("#dcalc-results")).toContainText("whole number of 0 or more");
    await expect(page.locator(IDS.days)).toHaveAttribute("aria-invalid", "true");
    await page.locator(IDS.days).fill("1.5");
    await expect(page.locator(IDS.days)).toHaveAttribute("aria-invalid", "true");
    await page.locator(IDS.days).fill("5");
    await expect(page.locator(IDS.days)).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Resulting date")).toHaveText("6 January 2026");

    await enter(page, { start: "9999-12-31", days: 1 });
    await expect(page.locator("#dcalc-results")).toContainText("outside the supported years, 1 to 9999");
    await expect(page.locator("#dcalc-results")).not.toContainText(/NaN|undefined|Invalid Date|Infinity/);
    await enter(page, { start: "0001-01-01", op: "Subtract", days: 1 });
    await expect(page.locator("#dcalc-results")).toContainText("outside the supported years");
    await enter(page, { start: "9999-12-30", days: 1 });
    await expect(metric(page, "Resulting date")).toHaveText("31 December 9999");
    await expect(metric(page, "Weekday")).toHaveText("Friday");
  });

  test("reset restores the blank default and returns focus to the start date", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await enter(page, { start: "2026-03-10", op: "Subtract", years: 1, days: 3 });
    await expect(metric(page, "Resulting date")).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#dcalc-start")).toHaveValue("");
    for (const sel of Object.values(IDS)) await expect(page.locator(sel)).toHaveValue("");
    await expect(page.getByRole("radio", { name: "Add" })).toBeChecked();
    await expect(page.locator("#dcalc-results")).toContainText("Choose a start date");
    await expect(page.locator("#dcalc-start")).toBeFocused();
  });

  test("keyboard: the operation is a radio group reachable and changeable with the keyboard", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await page.getByRole("radio", { name: "Add" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Subtract" })).toBeChecked();
    await expect(page.getByRole("group", { name: "Operation" })).toBeVisible();
  });

  test("scope, trust copy and explanation; no business-day or accuracy claims", async ({ page, go }) => {
    await go("tools/date-calculator/");
    const body = page.locator("main");
    for (const h of ["How to Use the Date Calculator", "How the Date Is Calculated", "Month Ends and Leap Years", "Example", "Common Uses"]) {
      await expect(body.getByRole("heading", { name: h })).toBeVisible();
    }
    await expect(body.locator("details")).toHaveCount(5);
    await expect(body.locator('a[href$="tools/date-difference/"]')).toHaveCount(1);
    await expect(body).toContainText("not part of this calculator");
    await expect(body).not.toContainText(/100% accurate|most accurate|\bbest\b|age calculator|business days calculator/i);
  });

  test("the layout does not overflow and the amounts are not squeezed into one row on narrow screens", async ({ page, go }) => {
    await go("tools/date-calculator/");
    await enter(page, { start: "2026-01-31", years: 1, months: 1, weeks: 1, days: 1 });
    await expectNoHorizontalOverflow(page);
    const width = page.viewportSize().width;
    if (width < 700) {
      const boxes = await Promise.all(Object.values(IDS).map((s) => page.locator(s).boundingBox()));
      const rows = new Set(boxes.map((b) => Math.round(b.y)));
      expect(rows.size).toBe(2); // two by two
      for (const b of boxes) expect(b.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("Date Calculator in Time Tools and search", () => {
  test("Time Tools lists both tools, with no Coming soon", async ({ page, go }) => {
    await go("time-tools.html");
    await expect(page.locator('a[href$="tools/date-calculator/"]')).toHaveCount(1);
    await expect(page.locator('a[href$="tools/date-difference/"]')).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon/i);
    await expectNoHorizontalOverflow(page);
  });

  test("All Tools lists it once; the old Converter Date Calculator entry is gone", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator('.directory-section a[href$="tools/date-calculator/"]')).toHaveCount(1);
    await expect(page.locator(".directory-soon")).not.toContainText(/date calculator/i);
    await go("calculators.html");
    await expect(page.locator("#calculators-grid")).not.toContainText("Date Calculator");
  });

  test("intent queries lead to the right tool first", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["date calculator", "add days to date", "subtract days from date", "date after days", "date before days", "add months to date", "subtract months from date", "date arithmetic"]) {
      await expect(await first(q), q).toContainText("Date Calculator");
    }
    for (const q of ["date difference", "days between dates", "weeks between dates", "how many days between dates"]) {
      await expect(await first(q), q).toContainText("Date Difference Calculator");
    }
    for (const q of ["business days calculator", "age calculator"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator("#tools-results a.directory-result", { hasText: /Date (Calculator|Difference)/ }), q).toHaveCount(0);
    }
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("add days to date");
    await expect(page.locator("main")).not.toContainText("Date Calculator");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("date calculator");
    await expect(page.locator("#calculators-grid")).not.toContainText("Date Calculator");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("add days to date");
    await expect(page.locator("main")).not.toContainText("Date Calculator");
  });
});
