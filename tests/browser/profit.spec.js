/**
 * Tool Pack 5 — Profit Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/profit-golden.py (Python decimal: break-even and
 * target units found by an integer search over whole units; every what-if row recomputed from scratch), written here as
 * literals. The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: price ₹800, variable cost ₹600, fixed costs ₹50,000, 400 units sold; no target.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#profit-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = {
  price: "#profit-price", variableCost: "#profit-variable", fixedCosts: "#profit-fixed", units: "#profit-units", target: "#profit-target",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/profit/");
  await page.locator("#profit-results .calculator-results__value").first().waitFor();
}
const rows = (page) => page.locator("#profit-results .calculator-results__table-wrapper tbody tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
const summary = (page) => page.locator("#profit-results .calculator-results__summary");
const targetCard = (page) => page.locator("#profit-target-card").locator("xpath=ancestor::section[1]");
// the words the tool must never use as a claim ("forecast" appears only in a denial)
const BANNED = /\b(you will make|safe|viable|good profit|healthy profit|recommended (volume|price|units)|guaranteed break-even|industry benchmark|best business decision|expected sales)\b/i;
const unqualified = (text, word) => text.split(/(?<=[.!?])\s+/).filter((s) => new RegExp(word, "i").test(s) && !/\b(not|no|nor|never)\b/i.test(s));

test.describe("Profit Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Profit Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1); // the shared breadcrumb, not one drawn by the tool
    await expect(crumb).toContainText("Profit Calculator");
    await expect(crumb).toContainText(/business/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}business.html`]); // the category step links to the category page

    await expect(page.getByLabel("Selling Price per Unit")).toHaveValue("800");
    await expect(page.getByLabel("Variable Cost per Unit")).toHaveValue("600");
    await expect(page.getByLabel("Fixed Costs for the Period")).toHaveValue("50000");
    await expect(page.getByLabel("Units Sold in the Period")).toHaveValue("400");
    await expect(page.getByLabel("Target Profit (optional)")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export/i })).toHaveCount(0);

    await expect(page.locator("#profit-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Profit for the period");
    await expect(metric(page, "Profit for the period")).toHaveText("₹30,000.00");
    await expect(metric(page, "Break-even point")).toHaveText("250 units");
    await expect(metric(page, "Units above break-even")).toHaveText("150 units");
    await expect(metric(page, "Contribution per unit")).toHaveText("₹200.00");
    await expect(metric(page, "Profit as a share of revenue")).toHaveText("9.38%");
    await expect(page.locator("#profit-results .calculator-results__item")).toHaveCount(5);
    expectClean(watch);
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 900 });
    await expect(metric(page, "Contribution per unit")).toHaveText("₹300.00");
    await expect(metric(page, "Profit for the period")).toHaveText("₹70,000.00");
    await expect(metric(page, "Break-even point")).toHaveText("167 units"); // 50,000 / 300 = 166.7
    await fill(page, { fixedCosts: 100000 });
    await expect(metric(page, "Break-even point")).toHaveText("334 units");
    await expect(metric(page, "Profit for the period")).toHaveText("₹20,000.00");
  });

  test("the breakdown reconciles with the profit", async ({ page, go }) => {
    await open(page, go);
    const card = page.locator("#profit-breakdown-card").locator("xpath=ancestor::section[1]");
    await expect(card).toContainText("₹3,20,000.00"); // revenue
    await expect(card).toContainText("₹2,40,000.00"); // variable costs
    await expect(card).toContainText("₹50,000.00"); // fixed costs
    await expect(card).toContainText("₹30,000.00"); // profit
    await expect(summary(page)).toContainText("a profit of ₹30,000.00");
  });

  test("a loss is a calm result with units short of break-even", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { units: 200 });
    await expect(page.locator("#profit-results-error")).toHaveCount(0);
    await expect(metric(page, "Profit for the period")).toHaveText("-₹10,000.00");
    await expect(metric(page, "Units short of break-even")).toHaveText("50 units");
    await expect(metric(page, "Break-even point")).toHaveText("250 units");
    await expect(metric(page, "Profit as a share of revenue")).toHaveText("-6.25%");
    await expect(summary(page)).toContainText("a loss of ₹10,000.00"); // in words, not only by a sign or a colour
    await expect(summary(page)).toContainText("50 units short of break-even");
    await expect(summary(page)).not.toContainText(/mistake|warning|danger|failing|you are losing/i);
  });

  test("exactly at break-even: profit zero, 'At break-even'", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { units: 250 });
    await expect(metric(page, "Profit for the period")).toHaveText("₹0.00");
    await expect(metric(page, "Against break-even")).toHaveText("At break-even");
    await expect(summary(page)).toContainText("exactly at break-even");
    await expect(summary(page)).toContainText("neither a profit nor a loss");
  });

  test("a break-even that is not whole is rounded up to the next unit", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 730, units: 500 });
    await expect(metric(page, "Contribution per unit")).toHaveText("₹130.00");
    await expect(metric(page, "Break-even point")).toHaveText("385 units"); // 50,000 / 130 = 384.6
    await expect(metric(page, "Units above break-even")).toHaveText("115 units");
    await expect(summary(page)).toContainText("₹2,81,050.00"); // revenue at the break-even
  });

  test("zero or negative contribution: no finite break-even, and neither is an error", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { variableCost: 800 });
    await expect(page.locator("#profit-results-error")).toHaveCount(0);
    await expect(metric(page, "Contribution per unit")).toHaveText("₹0.00");
    await expect(metric(page, "Break-even point")).toHaveText("No finite break-even");
    await expect(metric(page, "Against break-even")).toHaveText("Not applicable");
    await expect(metric(page, "Profit for the period")).toHaveText("-₹50,000.00");
    await expect(summary(page)).toContainText("no number of units sold would cover them");
    await fill(page, { variableCost: 900 });
    await expect(metric(page, "Contribution per unit")).toHaveText("-₹100.00");
    await expect(metric(page, "Break-even point")).toHaveText("No finite break-even");
    await expect(summary(page)).toContainText("₹100.00 below its variable cost");
    await expect(metric(page, "Profit for the period")).toHaveText("-₹90,000.00");
  });

  test("zero fixed costs: break-even at 0 units; zero units: a loss equal to the fixed costs", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { fixedCosts: 0 });
    await expect(metric(page, "Break-even point")).toHaveText("0 units");
    await expect(metric(page, "Units above break-even")).toHaveText("400 units");
    await expect(summary(page)).toContainText("no fixed costs");
    await fill(page, { fixedCosts: 50000, units: 0 });
    await expect(page.locator("#profit-results-error")).toHaveCount(0);
    await expect(metric(page, "Profit for the period")).toHaveText("-₹50,000.00");
    await expect(metric(page, "Profit as a share of revenue")).toHaveText("No revenue");
    await expect(metric(page, "Units short of break-even")).toHaveText("250 units");
  });

  test("a very large break-even is shown in full", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 0.01, variableCost: 0, fixedCosts: 100000000, units: 1000 });
    await expect(metric(page, "Break-even point")).toHaveText("10,00,00,00,000 units"); // 1,000 crore
  });

  test("target blank: no target block", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: "Your target profit" })).toHaveCount(0);
  });

  test("target entered: units, revenue and the additional units needed", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { target: 100000 });
    await expect(page.getByRole("heading", { name: "Your target profit" })).toBeVisible();
    const card = targetCard(page);
    await expect(card).toContainText("Units for the target");
    await expect(card).toContainText("₹1,00,000.00");
    await expect(card).toContainText("750 units");
    await expect(card).toContainText("₹6,00,000.00");
    await expect(card).toContainText("350 units");
    const text = await page.locator("#profit-results").innerText();
    expect(text).toContain("This is a goal, not an expectation");
    await fill(page, { target: 200000 });
    await expect(targetCard(page)).toContainText("1,250 units");
    await fill(page, { target: "" });
    await expect(page.getByRole("heading", { name: "Your target profit" })).toHaveCount(0);
  });

  test("a target already reached says so and needs no additional units", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { units: 1000, target: 100000 });
    const card = targetCard(page);
    await expect(card).toContainText("Target already met");
    await expect(card).toContainText("0 units"); // additional units needed
    await expect(page.locator("#profit-results")).toContainText("already meets this target");
    await expect(page.locator("#profit-results")).not.toContainText(/you should|recommend/i);
    await fill(page, { units: 400, target: 30000 });
    await expect(targetCard(page)).toContainText("Target already met"); // exactly equal counts as met
  });

  test("a target that no volume can reach under a non-positive contribution", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { variableCost: 800, target: 10000 });
    const card = targetCard(page);
    await expect(card).toContainText("Target cannot be reached");
    await expect(card).toContainText("No finite number");
    await expect(page.locator("#profit-results")).toContainText("no number of units reaches this target");
  });

  test("what-if table: nine rows, each a fresh calculation", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: "What changes under these assumptions" })).toBeVisible();
    await expect(rows(page)).toHaveCount(9);
    const expected = [
      ["As entered", "As entered", "₹30,000.00", "None", "250 units"],
      ["Selling price -10%", "₹720.00", "-₹2,000.00", "-₹32,000.00", "417 units"],
      ["Selling price +10%", "₹880.00", "₹62,000.00", "+₹32,000.00", "179 units"],
      ["Variable cost -10%", "₹540.00", "₹54,000.00", "+₹24,000.00", "193 units"],
      ["Variable cost +10%", "₹660.00", "₹6,000.00", "-₹24,000.00", "358 units"],
      ["Units sold -10%", "360 units", "₹22,000.00", "-₹8,000.00", "250 units"],
      ["Units sold +10%", "440 units", "₹38,000.00", "+₹8,000.00", "250 units"],
      ["Fixed costs -10%", "₹45,000.00", "₹35,000.00", "+₹5,000.00", "225 units"],
      ["Fixed costs +10%", "₹55,000.00", "₹25,000.00", "-₹5,000.00", "275 units"],
    ];
    for (let i = 0; i < 9; i++) expect(await cells(rows(page).nth(i))).toEqual(expected[i]);
    const headers = await page.locator("#profit-results table thead th").allInnerTexts();
    expect(headers).toEqual(["What changes", "New value", "Profit", "Change in profit", "Break-even units"]);
    await expect(page.locator("#profit-results")).toContainText("a 10% change in selling price moves the profit the most, by ₹32,000.00");
    const text = await page.locator("#profit-results").innerText();
    expect(text).toContain("It shows what the numbers would do, not what will happen");
  });

  test("what-if: a changed case with no contribution has no finite break-even; units round to whole units", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 650, units: 95 });
    expect(await cells(rows(page).nth(1))).toEqual(["Selling price -10%", "₹585.00", "-₹51,425.00", "-₹6,175.00", "No finite break-even"]);
    expect((await cells(rows(page).nth(5)))[1]).toBe("86 units"); // 95 x 0.9 = 85.5
    expect((await cells(rows(page).nth(6)))[1]).toBe("105 units"); // 95 x 1.1 = 104.5
  });

  test("what-if table is semantic and accessible; there is no chart", async ({ page, go }) => {
    await open(page, go);
    const table = page.locator("#profit-results table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(5);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(9);
    const region = page.locator("#profit-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /what changes/i);
    await expect(page.locator("#profit-results svg")).toHaveCount(0);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const price = page.locator(IDS.price);
    await price.fill("0");
    const error = page.locator("#profit-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/selling price/i);
    await expect(price).toHaveAttribute("aria-invalid", "true");
    await expect(price).toHaveAttribute("aria-describedby", /profit-results-error/);
    await expect(page.locator("#profit-results .calculator-results__value")).toHaveCount(0); // no stale numbers
    await expect(page.locator("#profit-results table")).toHaveCount(0);
    await price.fill("800");
    await expect(error).toHaveCount(0);
    await expect(price).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Profit for the period")).toHaveText("₹30,000.00");

    await fill(page, { variableCost: -1 });
    await expect(error).toContainText(/variable cost/i);
    await expect(page.locator(IDS.variableCost)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { variableCost: 600, fixedCosts: -5 });
    await expect(error).toContainText(/fixed costs/i);
    await fill(page, { fixedCosts: 50000, units: 1.5 });
    await expect(error).toContainText(/whole number/i);
    await expect(page.locator(IDS.units)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { units: -3 });
    await expect(error).toContainText(/whole number/i);
    await fill(page, { units: 400, target: 0 });
    await expect(error).toContainText(/target profit/i);
    await expect(page.locator(IDS.target)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { target: "" });
    await expect(error).toHaveCount(0);
  });

  test("an emptied required field shows the prompt; the optional target does not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.price).fill("");
    await expect(page.locator("#profit-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#profit-results-error")).toHaveCount(0);
    await page.locator(IDS.price).fill("800");
    await expect(metric(page, "Profit for the period")).toHaveText("₹30,000.00");
    await page.locator(IDS.units).fill("");
    await expect(page.locator("#profit-results .calculator-results__empty")).toBeVisible();
    await page.locator(IDS.units).fill("400");
    await fill(page, { target: "" });
    await expect(metric(page, "Profit for the period")).toHaveText("₹30,000.00");
    await expect(page.locator("#profit-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default, clears the target, and recomputes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 123, variableCost: 45, fixedCosts: 6789, units: 10, target: 5000 });
    await expect(metric(page, "Profit for the period")).not.toHaveText("₹30,000.00");
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [[IDS.price, "800"], [IDS.variableCost, "600"], [IDS.fixedCosts, "50000"], [IDS.units, "400"], [IDS.target, ""]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(metric(page, "Profit for the period")).toHaveText("₹30,000.00");
    await expect(page.getByRole("heading", { name: "Your target profit" })).toHaveCount(0);
  });

  test("keyboard: every field is reachable in order, and Reset works from the keyboard", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.price).focus();
    for (const id of [IDS.variableCost, IDS.fixedCosts, IDS.units, IDS.target]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(id)).toBeFocused();
    }
    await fill(page, { price: 900 });
    await page.getByRole("button", { name: "Reset" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(IDS.price)).toHaveValue("800");
    const outline = await page.getByRole("button", { name: "Reset" }).evaluate((el) => { el.focus(); return getComputedStyle(el).outlineStyle; });
    expect(outline).not.toBe("none");
  });

  test("buttons use the shared system: Reset is secondary and looks clickable, there is no primary button", async ({ page, go }) => {
    await open(page, go);
    const reset = page.getByRole("button", { name: "Reset" });
    await expect(reset).toHaveClass(/calculator-form__button--secondary/);
    const s = await reset.evaluate((el) => {
      const c = getComputedStyle(el);
      return { bg: c.backgroundColor, color: c.color, cursor: c.cursor };
    });
    expect(s).toEqual({ bg: "rgb(255, 255, 255)", color: "rgb(8, 127, 71)", cursor: "pointer" });
    await expect(page.locator("button.calculator-form__button:not(.calculator-form__button--secondary)")).toHaveCount(0);
  });

  test("a polite live region exists, the page has unique ids, and local mode only", async ({ page, go, context }) => {
    await open(page, go);
    const live = page.locator("#profit-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await fill(page, { price: 850 });
    await expect(live).toContainText(/Profit .*Break-even is at/, { timeout: 5000 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the trust note and exclusions are visible next to the result; no claims or out-of-scope features", async ({ page, go }) => {
    await open(page, go);
    const trust = page.locator("#profit-results .profit-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("For the numbers you entered");
    for (const word of ["same selling price and variable cost", "fixed costs that stay the same", "tax or GST", "depreciation", "interest", "owner's pay", "returns", "discounts", "stock"]) await expect(trust).toContainText(word);
    await expect(trust).toContainText("not advice");
    await fill(page, { target: 100000 });
    // the tool's own content (the related Margin card, which is Margin's text, is not part of it)
    const text = (await page.locator("#profit-results, .calculator-info").allInnerTexts()).join(" ");
    expect(text).not.toMatch(BANNED);
    expect(unqualified(text, "forecast")).toEqual([]);
    expect(unqualified(text, "guarantee")).toEqual([]);
    // none of the out-of-scope features: Margin's price solver, ROI and payback, a chart
    expect(text).not.toMatch(/payback|return on investment|\bROI\b|target margin|markup/i);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reading the Result/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions and What Is Not Included/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(5);
    const main = page.locator("main");
    await expect(main).toContainText("Break-even is a whole number of units");
    await expect(main).toContainText("250 units cover the fixed costs"); // the example
    await expect(main).toContainText("₹30,000.00");
    await expect(main).toContainText("750 units"); // the example's target
    await expect(main).toContainText("-₹2,000.00"); // the example's lower price
  });

  test("Margin is a related calculator; Coming soon ROI is not offered as usable", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    await expect(related).toHaveCount(1);
    await expect(related.first()).toContainText("Margin Calculator");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/margin/`]);
    await expect(page.locator("a[href*='calculators/roi']")).toHaveCount(0);
  });

  test("three curated articles, and Profit is not on the Home Featured Tools list", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const cards = page.locator(".related-article-card");
    await expect(cards).toHaveCount(3);
    const hrefs = await cards.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([
      `${siteRoot}articles/profit/how-to-find-your-break-even-point/`,
      `${siteRoot}articles/profit/price-cost-or-volume-which-matters-most/`,
      `${siteRoot}articles/profit/units-needed-for-a-target-profit/`,
    ]);
    await go("");
    await expect(page.locator("#popular-calculators")).not.toContainText("Profit Calculator");
  });

  test("all three articles render from static HTML and lead to the tool", async ({ page, go, siteRoot }) => {
    for (const slug of ["how-to-find-your-break-even-point", "price-cost-or-volume-which-matters-most", "units-needed-for-a-target-profit"]) {
      await go(`articles/profit/${slug}/`);
      await expect(page.locator("h1.article-title")).toBeVisible();
      await expect(page.locator(`a.article-calculator-button[href='${siteRoot}calculators/profit/']`)).toBeVisible();
      await expect(page.locator(".article-hero-image img")).toBeVisible();
      const text = await page.locator("article.article").innerText();
      expect(text).not.toMatch(BANNED);
      expect(unqualified(text, "forecast")).toEqual([]);
      expect(text).toMatch(/depreciation/i);
      await expect(page.locator(".article-related-card")).toHaveCount(2);
    }
  });

  test("search finds it by name and by its aliases; Coming soon ROI is not usable", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["profit", "break-even calculator", "business profit calculator", "contribution margin calculator"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/profit/']`)).toHaveCount(1);
      await expect(page.locator("#calculators-grid .calculator-card").first()).toContainText("Profit Calculator");
    }
    await input.fill("roi");
    await expect(page.locator("#calculators-grid a.calculator-card[href*='calculators/roi']")).toHaveCount(0);
  });

  test("responsive: no horizontal overflow with the target and the table open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { target: 100000 });
    await expect(page.locator("#profit-target-card")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    expect(reset.x + reset.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const id of Object.values(IDS)) {
      const box = await page.locator(id).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    }
  });
});
