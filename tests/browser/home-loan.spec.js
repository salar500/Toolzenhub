/**
 * Tool Pack 6 — Home Loan Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/home-loan-golden.py (Python decimal: the repayment is
 * simulated month by month and whole rupees are searched for the largest loan the EMI room clears), written here as literals.
 * The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: income ₹1,00,000; no existing EMIs; 40% of income for EMIs; 8.5% a year; 20 years; no own funds.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#home-loan-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = {
  income: "#home-loan-income", existing: "#home-loan-existing", share: "#home-loan-share", rate: "#home-loan-rate", years: "#home-loan-years", own: "#home-loan-own",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/home-loan/");
  await page.locator("#home-loan-results .calculator-results__value").first().waitFor();
}
const rows = (page) => page.locator("#home-loan-results .calculator-results__table-wrapper tbody tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
const summary = (page) => page.locator("#home-loan-results .calculator-results__summary");
// words the page must never use about a result or a lender
const BANNED = /\b(eligible|eligibility|approved|approval|bank will lend|lender will lend|safely afford|recommended|best tenure|ideal tenure|ideal EMI|guaranteed)\b/i;
const unqualified = (text, word) => text.split(/(?<=[.!?])\s+/).filter((s) => new RegExp(word, "i").test(s) && !/\b(not|no|nor|never)\b/i.test(s));

test.describe("Home Loan Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Home Loan Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1); // the shared breadcrumb, not one drawn by the tool
    await expect(crumb).toContainText("Home Loan Calculator");
    await expect(crumb).toContainText(/loans/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);

    await expect(page.getByLabel("Monthly Income")).toHaveValue("100000");
    await expect(page.getByLabel("Existing EMIs and Loan Payments (optional)")).toHaveValue("");
    await expect(page.getByLabel("Share of Income for EMIs")).toHaveValue("40");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Loan Tenure")).toHaveValue("20");
    await expect(page.getByLabel("Own Funds for the Property (optional)")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export/i })).toHaveCount(0);

    await expect(page.locator("#home-loan-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Loan that fits your EMI budget");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹46,09,233");
    await expect(metric(page, "Monthly EMI room")).toHaveText("₹40,000.00");
    await expect(metric(page, "Total interest")).toHaveText("₹49,90,765.76");
    await expect(metric(page, "Total repayment")).toHaveText("₹95,99,998.76");
    await expect(metric(page, "Existing EMIs as a share of income")).toHaveText("0.00%");
    await expect(page.locator("#home-loan-results .calculator-results__item")).toHaveCount(5); // the loan and four supporting cards
    expectClean(watch);
  });

  test("the primary loan spans the row so the four supporting cards sit in a balanced block (desktop)", async ({ page, go }) => {
    await open(page, go);
    if (page.viewportSize().width < 700) return; // one column on a phone: nothing to compare
    const boxes = await page.locator("#home-loan-results .calculator-results__item").evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; }));
    expect(boxes[0].w).toBeGreaterThan(boxes[1].w * 1.8); // the loan is about the full row
    expect(boxes[1].y).toBe(boxes[2].y); // the supporting cards: two to a row
    expect(boxes[3].y).toBe(boxes[4].y);
    expect(boxes[1].w).toBe(boxes[2].w);
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { income: 120000 });
    await expect(metric(page, "Monthly EMI room")).toHaveText("₹48,000.00");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹55,31,080");
    await fill(page, { share: 30 });
    await expect(metric(page, "Monthly EMI room")).toHaveText("₹36,000.00");
    await fill(page, { rate: 9.5, years: 25 });
    await expect(metric(page, "Loan that fits your EMI budget")).not.toHaveText("₹55,31,080");
  });

  test("existing EMIs reduce the room: ₹10,000 of them leave ₹30,000 and a loan of ₹34,56,925", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000 });
    await expect(metric(page, "Monthly EMI room")).toHaveText("₹30,000.00");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹34,56,925");
    await expect(metric(page, "Total interest")).toHaveText("₹37,43,074.59");
    await expect(metric(page, "Total repayment")).toHaveText("₹71,99,999.59");
    await expect(metric(page, "Existing EMIs as a share of income")).toHaveText("10.00%");
    await expect(summary(page)).toContainText("After your existing payments of ₹10,000.00");
    await expect(summary(page)).toContainText("₹30,000.00 a month of EMI room");
    await expect(summary(page)).toContainText("largest whole-rupee loan whose EMI fits is ₹34,56,925");
  });

  test("no EMI room is a calm, valid result, not an error", async ({ page, go }) => {
    await open(page, go);
    for (const [income, existing] of [[50000, 25000], [50000, 20000], [10000, 20000]]) {
      await fill(page, { income, existing });
      await expect(page.locator("#home-loan-results-error")).toHaveCount(0);
      await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹0");
      await expect(metric(page, "Monthly EMI room")).toHaveText("₹0.00");
      await expect(summary(page)).toContainText("no room for a new EMI under these numbers");
      await expect(page.locator(IDS.income)).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(IDS.existing)).not.toHaveAttribute("aria-invalid", "true");
    }
    await expect(metric(page, "Existing EMIs as a share of income")).toHaveText("200.00%");
    await expect(summary(page)).not.toContainText(/mistake|warning|danger|you cannot|unable/i);
    // the tenure table still renders, with ₹0 loans
    await expect(rows(page)).toHaveCount(5);
    expect((await cells(rows(page).nth(2)))[1]).toBe("₹0");
  });

  test("zero interest: the loan is the room times the months, with no interest", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000, rate: 0 });
    await expect(page.locator("#home-loan-results-error")).toHaveCount(0);
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹72,00,000");
    await expect(metric(page, "Total interest")).toHaveText("₹0.00");
    await expect(metric(page, "Total repayment")).toHaveText("₹72,00,000.00");
    await expect(summary(page)).toContainText("At 0% over 20 years");
    await expect(summary(page)).toContainText("no interest");
  });

  test("the extremes: 1 year, 30 years, a tiny room and a very large income", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000, years: 1 });
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹3,43,958");
    await fill(page, { years: 30 });
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹39,01,609");
    await fill(page, { income: 1000, existing: "", share: 5, rate: 30, years: 1 });
    await expect(metric(page, "Monthly EMI room")).toHaveText("₹50.00");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹512");
    await fill(page, { income: 10000000, existing: 500000, share: 90, rate: 6.75, years: 30 });
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹1,31,05,18,801");
    await expect(page.locator("#home-loan-results-error")).toHaveCount(0);
  });

  test("own funds: hidden when blank, a simple property budget when entered", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000 });
    await expect(page.getByRole("heading", { name: "With your own funds" })).toHaveCount(0);
    await fill(page, { own: 500000 });
    await expect(page.getByRole("heading", { name: "With your own funds" })).toBeVisible();
    const card = page.locator("#home-loan-budget-card").locator("xpath=ancestor::section[1]");
    await expect(card).toContainText("₹34,56,925");
    await expect(card).toContainText("₹5,00,000.00");
    await expect(card).toContainText("₹39,56,925.00");
    const text = await page.locator("#home-loan-results").innerText();
    expect(text).toContain("does not include stamp duty, registration, fees, insurance or tax");
    expect(text).toContain("loan-to-value");
    await fill(page, { own: 0 });
    await expect(page.getByRole("heading", { name: "With your own funds" })).toHaveCount(0); // zero adds nothing
    await fill(page, { own: "" });
    await expect(page.getByRole("heading", { name: "With your own funds" })).toHaveCount(0);
  });

  test("tenure table: the same room over other tenures, the entered tenure marked in text", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000 });
    await expect(page.getByRole("heading", { name: "What the same EMI room borrows over other tenures" })).toBeVisible();
    await expect(rows(page)).toHaveCount(5);
    const expected = [
      ["10 years", "₹24,19,634", "₹11,80,365.86", "₹35,99,999.86"],
      ["15 years", "₹30,46,490", "₹23,53,508.59", "₹53,99,998.59"],
      ["20 years (your tenure)", "₹34,56,925", "₹37,43,074.59", "₹71,99,999.59"],
      ["25 years", "₹37,25,657", "₹52,74,342.76", "₹89,99,999.76"],
      ["30 years", "₹39,01,609", "₹68,98,390.16", "₹1,07,99,999.16"],
    ];
    for (let i = 0; i < 5; i++) expect(await cells(rows(page).nth(i))).toEqual(expected[i]);
    const headers = await page.locator("#home-loan-results table thead th").allInnerTexts();
    expect(headers).toEqual(["Tenure", "Loan that fits", "Total interest", "Total repayment"]);
    const text = await page.locator("#home-loan-results").innerText();
    expect(text).toContain("a longer tenure can raise the loan that fits while raising the total interest");
    expect(text).toContain("it does not say which tenure to choose");
    expect(text).toContain("the loan that fits changes by 61.25% and the total interest by 484.43%"); // 10 to 30 years
  });

  test("a tenure outside the five is added and marked (six rows)", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000, years: 18 });
    await expect(rows(page)).toHaveCount(6);
    expect(await cells(rows(page).nth(2))).toEqual(["18 years (your tenure)", "₹33,13,242", "₹31,66,757.28", "₹64,79,999.28"]);
    expect((await rows(page).evaluateAll((trs) => trs.map((r) => r.querySelector("th").textContent.trim())))).toEqual(["10 years", "15 years", "18 years (your tenure)", "20 years", "25 years", "30 years"]);
    await fill(page, { years: 1 });
    await expect(rows(page)).toHaveCount(6);
    expect((await cells(rows(page).first()))[0]).toBe("1 year (your tenure)");
  });

  test("the tenure table is semantic and accessible; there is no chart", async ({ page, go }) => {
    await open(page, go);
    const table = page.locator("#home-loan-results table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(4);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(5);
    const region = page.locator("#home-loan-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /other tenures/i);
    await expect(page.locator("#home-loan-results svg")).toHaveCount(0);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const income = page.locator(IDS.income);
    await income.fill("500");
    const error = page.locator("#home-loan-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/monthly income/i);
    await expect(income).toHaveAttribute("aria-invalid", "true");
    await expect(income).toHaveAttribute("aria-describedby", /home-loan-results-error/);
    await expect(page.locator("#home-loan-results .calculator-results__value")).toHaveCount(0); // no stale numbers
    await expect(page.locator("#home-loan-results table")).toHaveCount(0);
    await income.fill("100000");
    await expect(error).toHaveCount(0);
    await expect(income).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹46,09,233");

    await fill(page, { share: 95 });
    await expect(error).toContainText(/share of income between 1% and 90%/);
    await expect(page.locator(IDS.share)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { share: 40, rate: 31 });
    await expect(error).toContainText(/interest rate/i);
    await fill(page, { rate: 8.5, years: 31 });
    await expect(error).toContainText(/whole years/i);
    await fill(page, { years: 12.5 });
    await expect(error).toContainText(/whole years/i);
    await expect(page.locator(IDS.years)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { years: 20, existing: -5 });
    await expect(error).toContainText(/existing payments/i);
    await expect(page.locator(IDS.existing)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { existing: "", own: -1 });
    await expect(error).toContainText(/own funds/i);
    await expect(page.locator(IDS.own)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { own: "" });
    await expect(error).toHaveCount(0);
  });

  test("an emptied required field shows the prompt; the optional fields do not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.income).fill("");
    await expect(page.locator("#home-loan-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#home-loan-results-error")).toHaveCount(0);
    await page.locator(IDS.income).fill("100000");
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹46,09,233");
    await page.locator(IDS.years).fill("");
    await expect(page.locator("#home-loan-results .calculator-results__empty")).toBeVisible();
    await page.locator(IDS.years).fill("20");
    await fill(page, { existing: "", own: "" });
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹46,09,233");
    await expect(page.locator("#home-loan-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default and clears the optional fields", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { income: 55555, existing: 4000, share: 33, rate: 11, years: 7, own: 250000 });
    await expect(metric(page, "Loan that fits your EMI budget")).not.toHaveText("₹46,09,233");
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [[IDS.income, "100000"], [IDS.existing, ""], [IDS.share, "40"], [IDS.rate, "8.5"], [IDS.years, "20"], [IDS.own, ""]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(metric(page, "Loan that fits your EMI budget")).toHaveText("₹46,09,233");
    await expect(page.getByRole("heading", { name: "With your own funds" })).toHaveCount(0);
  });

  test("keyboard: every field is reachable in order, and Reset works from the keyboard", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.income).focus();
    for (const id of [IDS.existing, IDS.share, IDS.rate, IDS.years, IDS.own]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(id)).toBeFocused();
    }
    await fill(page, { income: 90000 });
    await page.getByRole("button", { name: "Reset" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(IDS.income)).toHaveValue("100000");
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
    const live = page.locator("#home-loan-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await fill(page, { existing: 10000 });
    await expect(live).toContainText("A loan of ₹34,56,925 fits an EMI room of ₹30,000.00.", { timeout: 5000 });
    await fill(page, { existing: 60000 });
    await expect(live).toContainText("no EMI room", { timeout: 5000 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the defaults are labelled as examples, and the trust note and exclusions sit next to the result", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#home-loan-share-hint")).toContainText("Your own limit, not a lender's");
    await expect(page.locator("#home-loan-share-hint")).toContainText("40% is only an example");
    await expect(page.locator("#home-loan-rate-hint")).toContainText("8.5% is only an example");
    const trust = page.locator("#home-loan-results .home-loan-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("Your own planning, under your assumptions");
    for (const word of ["not a lender's offer or decision", "credit score", "age", "employment", "documents", "loan-to-value", "fees", "stamp duty", "registration", "insurance", "rate changes", "tax benefits", "part-payments"]) await expect(trust).toContainText(word);
  });

  test("no eligibility, approval, advice or tenure-recommendation wording anywhere on the page", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000, own: 500000 });
    const text = (await page.locator("#home-loan-results, .calculator-info, .calculator-section, .calculator-intro").allInnerTexts()).join(" ");
    expect(text).not.toMatch(BANNED);
    expect(unqualified(text, "forecast")).toEqual([]);
    expect(unqualified(text, "guarantee")).toEqual([]);
    expect(text).not.toMatch(/\b(longer|shorter) (is|tenure is) (better|best)|choose the (longest|shortest)/i);
    // not an EMI calculator: no loan-amount input
    await expect(page.getByLabel(/loan amount|principal/i)).toHaveCount(0);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reading the Result/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions and What Is Not Included/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(5);
    const main = page.locator("main");
    await expect(main).toContainText("It starts from the EMI, not the property");
    await expect(main).toContainText("₹34,56,925"); // the example's loan
    await expect(main).toContainText("₹39,56,925.00"); // the example's property budget
    await expect(main).toContainText("₹24,19,634"); // the example's 10-year loan
  });

  test("related loan tools are live; Coming soon Personal Loan and Loan Eligibility are not offered as usable", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    for (const tool of ["emi", "loan-comparison", "prepayment", "balance-transfer"]) {
      expect(hrefs, tool).toContain(`${siteRoot}calculators/${tool}/`);
    }
    expect(hrefs.some((h) => /personal-loan|loan-eligibility/.test(h))).toBe(false);
    await expect(page.locator("a[href*='calculators/personal-loan'], a[href*='calculators/loan-eligibility']")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases, not by 'eligibility'", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["home loan", "home loan affordability", "how much loan can i afford", "loan amount calculator"]) {
      await input.fill(query);
      const card = page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/home-loan/']`);
      await expect(card).toHaveCount(1);
    }
    await input.fill("eligibility");
    await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/home-loan/']`)).toHaveCount(0);
    await expect(page.locator("#calculators-grid a.calculator-card[href*='loan-eligibility']")).toHaveCount(0); // Coming soon: not a link
  });

  test("the Home page's existing Home Loan card is live, with no Coming soon badge", async ({ page, go, siteRoot }) => {
    await go("");
    const link = page.locator(`#popular-calculators a.calculator-card[href='${siteRoot}calculators/home-loan/']`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText("Home Loan Calculator");
    await expect(link).not.toContainText("Coming soon");
    await expect(page.locator("#popular-calculators .calculator-card--soon:has-text('Home Loan Calculator')")).toHaveCount(0);
    await expect(page.locator("#popular-calculators .calculator-card:has-text('Home Loan Calculator')")).toHaveCount(1); // not added twice
  });

  test("responsive: no horizontal overflow with the own funds and the table open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { existing: 10000, own: 500000, years: 18 });
    await expect(page.locator("#home-loan-budget-card")).toBeVisible();
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
