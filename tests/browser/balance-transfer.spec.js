/**
 * Tool Pack 2 — Loan Balance Transfer Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/balance-transfer-golden.py
 * (Python decimal, simulation and closed form agreeing), written here as literals. The test reads label -> value
 * pairs and landmarks, not DOM positions.
 *
 * Default inputs: 25,00,000 owed; current 9.5% with 15 years left; new 8.5% for 15 years; charges 0 at the current
 * lender and 15,000 at the new one.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#bt-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const card = (page, title) => page.locator(`#bt-results .bt-compare__card:has(.bt-compare__title:text-is("${title}"))`);

const IDS = {
  balance: "#bt-balance", currentRate: "#bt-current-rate", currentYears: "#bt-current-years", currentMonths: "#bt-current-months",
  newRate: "#bt-new-rate", newYears: "#bt-new-years", newMonths: "#bt-new-months", currentCharges: "#bt-current-charges", newCharges: "#bt-new-charges",
};
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/balance-transfer/");
  await page.locator("#bt-results .calculator-results__value").first().waitFor();
}
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}

test.describe("Loan Balance Transfer Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Loan Balance Transfer Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("Loan Balance Transfer Calculator");
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}loans.html`]);

    await expect(page.getByLabel("Outstanding Loan Balance")).toHaveValue("2500000");
    await expect(page.getByLabel("Current Interest Rate")).toHaveValue("9.5");
    await expect(page.getByLabel("New Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Charges at Your Current Lender")).toHaveValue("0");
    await expect(page.getByLabel("New Lender's Fees and Charges")).toHaveValue("15000");
    await expect(page.locator("#bt-current-years")).toHaveValue("15");
    await expect(page.locator("#bt-new-years")).toHaveValue("15");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    // results update live: no Calculate button
    await expect(page.getByRole("button", { name: /calculate|compare/i })).toHaveCount(0);

    await expect(metric(page, "Potential saving")).toHaveText("₹2,52,683");
    await expect(metric(page, "Charges earned back")).toHaveText("11 months");
    await expect(metric(page, "Monthly EMI")).toHaveText("₹1,487 lower");
    await expect(metric(page, "Loan tenure")).toHaveText("Unchanged");
    expectClean(watch);
  });

  test("the default comparison: current and new loan, no same-tenure card, no warning", async ({ page, go }) => {
    await open(page, go);
    await expect(card(page, "Current loan")).toContainText("₹26,106");
    await expect(card(page, "Current loan")).toContainText("₹21,99,011");
    await expect(card(page, "New loan")).toContainText("₹24,618");
    await expect(card(page, "New loan")).toContainText("₹19,31,328");
    await expect(card(page, "New loan")).toContainText("₹15,000");
    await expect(card(page, "New loan, same tenure")).toHaveCount(0);
    await expect(page.locator(".bt-note--warning")).toHaveCount(0);
    await expect(page.locator(".calculator-results__summary")).toContainText("Based on these inputs, switching may save about ₹2,52,683 overall");
    await expect(page.locator(".calculator-results__summary")).toContainText("earned back by month 11");
    await expect(page.locator(".calculator-results__summary")).toContainText("9.44%");
    await expect(page.locator("#bt-results")).not.toContainText(/\d{1,3}(,\d{3}){2,}(?!\d)/); // Indian grouping only
  });

  test("a longer new tenure: lower EMI, higher overall cost, with the same-tenure check beside it", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newYears: 20 });
    await expect(metric(page, "Lower EMI, higher overall cost")).toHaveText("₹5,22,928");
    await expect(metric(page, "Charges earned back")).toHaveText("4 months");
    await expect(metric(page, "Monthly EMI")).toHaveText("₹4,410 lower");
    await expect(metric(page, "Loan tenure")).toHaveText("5 years longer");
    const warning = page.locator(".bt-note--warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("Note: your monthly payment falls, but the overall cost rises.");
    await expect(warning).toContainText("5 years longer");
    const same = card(page, "New loan, same tenure");
    await expect(same).toBeVisible();
    await expect(same).toContainText("Saves ₹2,52,683");
    await expect(same).toContainText("11 months");
    await expect(page.locator("#bt-results")).toContainText("Over the same 15 years, the lower rate on its own would save about ₹2,52,683");
    // the saving is only temporary: said in words
    await expect(page.locator(".calculator-results__summary")).toContainText("the saving does not last");
  });

  test("charges that wipe out the saving: no break-even, still a lower EMI", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newCharges: 400000 });
    await expect(metric(page, "Lower EMI, higher overall cost")).toHaveText("₹1,32,317");
    await expect(metric(page, "Charges earned back")).toHaveText("Not earned back");
    await expect(page.locator(".bt-note--warning")).toContainText("charges are more than the lower rate saves");
    await expect(page.locator(".calculator-results__summary")).toContainText("never earned back");
    await expect(page.locator(".calculator-results__summary")).toContainText("about 7.99%");
  });

  test("a higher new rate: a plain loss, no lower-EMI warning", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newRate: 10.5 });
    await expect(metric(page, "Potential loss")).toHaveText("₹2,90,284");
    await expect(metric(page, "Monthly EMI")).toHaveText("₹1,529 higher");
    await expect(metric(page, "Charges earned back")).toHaveText("Not earned back");
    await expect(page.locator(".bt-note--warning")).toHaveCount(0);
  });

  test("no charges: break-even is immediate; charges equal to the saving: about the same", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newCharges: 0 });
    await expect(metric(page, "Charges earned back")).toHaveText("Immediately");
    await expect(metric(page, "Potential saving")).toHaveText("₹2,67,683");
    await fill(page, { newCharges: 267683 });
    await expect(metric(page, "About the same")).toBeVisible();
    await expect(metric(page, "Charges earned back")).toHaveText("Not applicable");
    await expect(page.locator(".calculator-results__summary")).toContainText("about the same overall");
  });

  test("charges at either lender count the same", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { currentCharges: 15000, newCharges: 0 });
    await expect(metric(page, "Potential saving")).toHaveText("₹2,52,683");
    await expect(card(page, "New loan")).toContainText("₹15,000");
  });

  test("a shorter new tenure: a higher EMI and a real saving", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newYears: 10 });
    await expect(metric(page, "Potential saving")).toHaveText("₹9,64,440");
    await expect(metric(page, "Monthly EMI")).toHaveText("₹4,891 higher");
    await expect(metric(page, "Loan tenure")).toHaveText("5 years shorter");
    await expect(card(page, "New loan, same tenure")).toBeVisible();
    await expect(page.locator(".bt-note--warning")).toHaveCount(0);
  });

  test("the new tenure follows the remaining tenure until you change it", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { currentYears: 10, currentMonths: 6 });
    await expect(page.locator("#bt-new-years")).toHaveValue("10");
    await expect(page.locator("#bt-new-months")).toHaveValue("6");
    await fill(page, { newYears: 12 });
    await fill(page, { currentYears: 8 });
    await expect(page.locator("#bt-new-years")).toHaveValue("12"); // no longer follows
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#bt-new-years")).toHaveValue("15");
    await fill(page, { currentYears: 5 });
    await expect(page.locator("#bt-new-years")).toHaveValue("5"); // follows again after a reset
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const rate = page.locator("#bt-new-rate");
    await rate.fill("45");
    const error = page.locator("#bt-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/new interest rate/i);
    await expect(rate).toHaveAttribute("aria-invalid", "true");
    await expect(rate).toHaveAttribute("aria-describedby", /bt-results-error/);
    await expect(page.locator("#bt-results .calculator-results__value")).toHaveCount(0);

    await rate.fill("8.5");
    await expect(error).toHaveCount(0);
    await expect(rate).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Potential saving")).toHaveText("₹2,52,683");

    // months above 11 are rejected on the right field, and a zero tenure names both fields
    await page.locator("#bt-new-months").fill("14");
    await expect(error).toContainText(/0 to 11/);
    await expect(page.locator("#bt-new-months")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#bt-new-months").fill("0");
    await fill(page, { newYears: 0 });
    await expect(error).toContainText(/at least 1 month/);
    await expect(page.locator("#bt-new-years")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#bt-new-months")).toHaveAttribute("aria-invalid", "true");
  });

  test("an emptied field shows the prompt, not an error", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#bt-new-charges").fill("");
    await expect(page.locator("#bt-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#bt-results-error")).toHaveCount(0);
  });

  test("reset restores every default and recomputes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { balance: 800000, currentRate: 11, currentYears: 5, newRate: 10, newYears: 7, newCharges: 4000, currentCharges: 1000 });
    await expect(page.locator("#bt-results .calculator-results__item").first()).not.toContainText("₹2,52,683");
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [["#bt-balance", "2500000"], ["#bt-current-rate", "9.5"], ["#bt-current-years", "15"], ["#bt-current-months", "0"], ["#bt-new-rate", "8.5"], ["#bt-new-years", "15"], ["#bt-new-months", "0"], ["#bt-current-charges", "0"], ["#bt-new-charges", "15000"]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(metric(page, "Potential saving")).toHaveText("₹2,52,683");
    await expect(page.locator("#bt-results-error")).toHaveCount(0);
  });

  test("year-by-year table: semantic, local scroll, the position starts below zero and ends at the net saving", async ({ page, go }) => {
    await open(page, go);
    const wrapper = page.locator("#bt-results .calculator-results__table-wrapper");
    await expect(wrapper).toHaveAttribute("role", "region");
    await expect(wrapper).toHaveAttribute("tabindex", "0");
    await expect(wrapper).toHaveAttribute("aria-label", /Year by year/);
    await expect(wrapper.locator("caption")).toHaveCount(1);
    await expect(wrapper.locator("th[scope=col]")).toHaveText(["Year", "Paid on current loan", "Paid on new loan", "Charges", "Your position"]);
    const rows = wrapper.locator("tbody tr");
    await expect(rows).toHaveCount(16); // the switch, then 15 years
    await expect(rows.first().locator("th")).toHaveText("At the switch");
    await expect(rows.first().locator("td").nth(2)).toHaveText("₹15,000");
    await expect(rows.first().locator("td").last()).toHaveText("−₹15,000");
    await expect(rows.nth(1).locator("th")).toHaveText("Year 1");
    await expect(rows.nth(1).locator("td").nth(0)).toHaveText("₹3,13,267");
    await expect(rows.nth(1).locator("td").nth(1)).toHaveText("₹2,95,422");
    await expect(rows.nth(1).locator("td").last()).toHaveText("+₹2,846");
    await expect(rows.last().locator("td").last()).toHaveText("+₹2,52,683");
    // no monthly detail, no CSV, no chart in v1
    await expect(page.getByRole("button", { name: /month-by-month|csv/i })).toHaveCount(0);
    await expect(page.locator("#bt-results canvas, #bt-results svg")).toHaveCount(0);
  });

  test("with a longer tenure the table runs until both loans end, and the position falls back", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { newYears: 20 });
    const rows = page.locator("#bt-results .calculator-results__table-wrapper tbody tr");
    await expect(rows).toHaveCount(21);
    await expect(rows.last().locator("td").last()).toHaveText("−₹5,22,928");
    await expect(rows.nth(15).locator("td").last()).toHaveText("+₹7,78,807"); // year 15: the peak, before the extra years
  });

  test("Print Summary opens the browser print dialog; the printout leaves out the page chrome", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("button", { name: "Print Summary" })).toBeVisible();
    await page.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
    await page.getByRole("button", { name: "Print Summary" }).click();
    expect(await page.evaluate(() => window.__prints)).toBe(1);

    await page.emulateMedia({ media: "print" });
    for (const hidden of ["#header", "footer.footer", ".calculator-breadcrumb", "#bt-form", ".related-section", ".calculator-info", ".bt-actions"]) {
      expect(await page.locator(hidden).first().isVisible(), `${hidden} is not printed`).toBe(false);
    }
    await expect(page.locator(".bt-print-brand")).toContainText("Loan Balance Transfer Calculator");
    const inputs = page.locator(".bt-print-inputs");
    await expect(inputs).toContainText("₹25,00,000");
    await expect(inputs).toContainText("9.5% a year, 15 years left");
    await expect(inputs).toContainText("8.5% a year, 15 years");
    await expect(inputs).toContainText("₹15,000");
    await expect(page.locator(".calculator-results__summary")).toBeVisible();
    await expect(page.locator(".bt-compare__card")).toHaveCount(2);
    await expect(page.locator("#bt-results tbody tr").first()).toBeVisible();
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator(".bt-print-brand")).toBeHidden();
  });

  test("keyboard: every control is reachable, reset and print work from the keyboard", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#bt-balance").focus();
    for (const id of ["bt-current-rate", "bt-current-years", "bt-current-months", "bt-new-rate", "bt-new-years", "bt-new-months", "bt-current-charges", "bt-new-charges", "bt-reset"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    expect(await page.locator("#bt-reset").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
    await page.locator("#bt-new-charges").fill("1");
    await page.locator("#bt-reset").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#bt-new-charges")).toHaveValue("15000");
    await page.locator("#bt-print").focus();
    expect(await page.locator("#bt-print").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  });

  test("buttons use the shared system: Reset and Print are secondary, and there is no primary button", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#bt-print").waitFor();
    for (const id of ["#bt-reset", "#bt-print"]) {
      await expect(page.locator(id)).toHaveClass(/calculator-form__button--secondary/);
      const s = await page.locator(id).evaluate((e) => { const c = getComputedStyle(e); return { bg: c.backgroundColor, color: c.color, cursor: c.cursor }; });
      expect(s).toEqual({ bg: "rgb(255, 255, 255)", color: "rgb(8, 127, 71)", cursor: "pointer" });
    }
    await expect(page.locator("button.calculator-form__button:not(.calculator-form__button--secondary)")).toHaveCount(0);
  });

  test("a polite live region exists, the page has unique ids, and local mode only", async ({ page, go, context }) => {
    await open(page, go);
    const live = page.locator("#bt-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await fill(page, { newCharges: 12345 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("explanatory content, assumptions, the example and the trust wording", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Why the Rate Is Only Part of the Answer/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(4);
    const main = page.locator("main");
    await expect(main).toContainText("does not recommend switching lenders");
    await expect(main).toContainText("estimates for understanding, not financial advice");
    await expect(main).toContainText("Introductory, stepped or changing rates are not modelled");
    await expect(main).toContainText("₹2,52,683"); // the example
    await expect(main).toContainText("₹5,22,928"); // the longer-tenure example
  });

  test("related tools and the four curated articles", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const tools = page.locator(".related-calculator-card");
    await expect(tools).toHaveCount(4); // the curated three, then Home Loan (Tool Pack 6) from the category
    await expect(tools.nth(0)).toHaveAttribute("href", `${siteRoot}calculators/prepayment/`);
    await expect(tools.nth(1)).toHaveAttribute("href", `${siteRoot}calculators/emi/`);
    await expect(tools.nth(2)).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);
    await expect(tools.nth(3)).toHaveAttribute("href", `${siteRoot}calculators/home-loan/`);
    const cards = page.locator(".related-article-card");
    await expect(cards).toHaveCount(4);
    const hrefs = await cards.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([
      `${siteRoot}articles/balance-transfer/is-a-loan-balance-transfer-worth-it/`,
      `${siteRoot}articles/balance-transfer/balance-transfer-vs-prepayment/`,
      `${siteRoot}articles/loan-comparison/loan-tenure-total-interest/`,
      `${siteRoot}articles/loan-comparison/emi-vs-total-interest/`,
    ]);
  });

  test("the Loans listing shows the live card, and the Prepayment page links to it", async ({ page, go, siteRoot }) => {
    await go("loans.html");
    await expect(page.locator("a[href$='calculators/balance-transfer/']").first()).toBeVisible();
    await go("calculators/prepayment/");
    await expect(page.locator(`.related-calculator-card[href='${siteRoot}calculators/balance-transfer/']`)).toHaveCount(1);
  });

  test("responsive: no horizontal overflow, the actions stay usable", async ({ page, go }) => {
    await open(page, go);
    await expectNoHorizontalOverflow(page);
    await fill(page, { newYears: 20 });
    await expect(page.locator(".bt-note--warning")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const box = await page.locator("#bt-print").boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(36);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const id of ["#bt-current-years", "#bt-current-months", "#bt-new-years", "#bt-new-months"]) await expect(page.locator(id)).toBeVisible();
  });

  test("both new articles render from static HTML and lead to the tool", async ({ page, go, siteRoot }) => {
    for (const slug of ["is-a-loan-balance-transfer-worth-it", "balance-transfer-vs-prepayment"]) {
      await go(`articles/balance-transfer/${slug}/`);
      await expect(page.locator("h1.article-title")).toBeVisible();
      await expect(page.locator(`a.article-calculator-button[href='${siteRoot}calculators/balance-transfer/']`)).toBeVisible();
      await expect(page.locator(".article-hero-image img")).toBeVisible();
    }
  });
});
