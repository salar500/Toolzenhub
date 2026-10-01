/**
 * M0.7 — EMI Calculator, realistic user flows.
 *
 * Expected numbers are computed from the shared loan formulas (golden-tested separately in
 * tests/unit) and formatted with Intl exactly like the page does (₹, Indian digit grouping, 0 dp).
 * The test reads result label -> value pairs instead of DOM positions, so cosmetic DOM changes
 * do not break it.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow, inr } from "../helpers/test-base.mjs";
import { calculateEMI, calculateTotalRepayment, calculateTotalInterest } from "../../assets/js/calculators/formulas/loan.js";

const result = (page, label) => page.locator(`#emi-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

async function expectResults(page, [principal, rate, years]) {
  await expect(result(page, "Monthly EMI")).toHaveText(inr(calculateEMI(principal, rate, years)));
  await expect(result(page, "Total Interest")).toHaveText(inr(calculateTotalInterest(principal, rate, years)));
  await expect(result(page, "Total Repayment")).toHaveText(inr(calculateTotalRepayment(principal, rate, years)));
  await expect(result(page, "Loan Tenure")).toHaveText(`${years} years`);
}

test.describe("EMI calculator", () => {
  test("page, breadcrumb and form shell", async ({ page, go, watch, siteRoot }) => {
    await go("calculators/emi/");
    await expect(page.locator("h1")).toHaveText("EMI Calculator");

    // breadcrumb: Home › Calculators › <category> › EMI Calculator, with working links
    const crumb = page.locator(".calculator-breadcrumb").first();
    await expect(crumb).toContainText("Home");
    await expect(crumb).toContainText("Calculators");
    await expect(crumb).toContainText("EMI Calculator");
    await expect(crumb).toContainText(/loans/i); // baseline: category is shown lower-case ("loans")
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}loans.html`]);

    // inputs with their defaults
    await expect(page.getByLabel("Loan Amount")).toHaveValue("1000000");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Loan Tenure")).toHaveValue("20");
    await expect(page.getByRole("button", { name: "Calculate EMI" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();

    // a result is shown straight away for the default inputs (₹10,00,000 @ 8.5% for 20 years)
    await expectResults(page, [1000000, 8.5, 20]);
    await expect(result(page, "Monthly EMI")).toHaveText("₹8,678"); // independent sanity check of the formatter
    expectClean(watch);
  });

  test("enter known values, calculate, verify results and currency formatting", async ({ page, go, watch }) => {
    await go("calculators/emi/");
    await page.getByLabel("Loan Amount").fill("500000");
    await page.getByLabel("Interest Rate").fill("10");
    await page.getByLabel("Loan Tenure").fill("5");
    await page.getByRole("button", { name: "Calculate EMI" }).click();

    await expectResults(page, [500000, 10, 5]);
    // known golden values for ₹5,00,000 @ 10% for 5 years
    await expect(result(page, "Monthly EMI")).toHaveText("₹10,624");
    await expect(result(page, "Total Repayment")).toHaveText("₹6,37,411");
    await expect(result(page, "Total Interest")).toHaveText("₹1,37,411");
    // indian digit grouping (lakh/crore), never western 1,000,000 style
    await expect(page.locator("#emi-results")).not.toContainText(/\d{1,3}(,\d{3}){2,}(?!\d)/);
    // summary sentence reflects the inputs
    await expect(page.locator(".calculator-results__summary")).toContainText("₹5,00,000");
    await expect(page.locator(".calculator-results__summary")).toContainText("10%");
    await expect(page.locator(".calculator-results__summary")).toContainText("5 years");

    // second calculation replaces the first (no stale results)
    await page.getByLabel("Loan Amount").fill("2500000");
    await page.getByLabel("Interest Rate").fill("7.25");
    await page.getByLabel("Loan Tenure").fill("15");
    await page.getByRole("button", { name: "Calculate EMI" }).click();
    await expectResults(page, [2500000, 7.25, 15]);
    await expect(result(page, "Monthly EMI")).toHaveText("₹22,822");
    expectClean(watch);
  });

  test("invalid input does not replace the last good result (native validation)", async ({ page, go }) => {
    await go("calculators/emi/");
    const before = await result(page, "Monthly EMI").textContent();
    const calculate = page.getByRole("button", { name: "Calculate EMI" });

    // empty
    await page.getByLabel("Loan Amount").fill("");
    await calculate.click();
    await expect(page.locator("#emi-loan:invalid")).toHaveCount(1);
    await expect(result(page, "Monthly EMI")).toHaveText(before);

    // baseline: the amount field has step=1000, so 123456 is rejected by the browser
    await page.getByLabel("Loan Amount").fill("123456");
    await calculate.click();
    await expect(page.locator("#emi-loan:invalid")).toHaveCount(1);
    await expect(result(page, "Monthly EMI")).toHaveText(before);

    // out of range (max 30%)
    await page.getByLabel("Loan Amount").fill("1000000");
    await page.getByLabel("Interest Rate").fill("45");
    await calculate.click();
    await expect(page.locator("#emi-rate:invalid")).toHaveCount(1);
    await expect(result(page, "Monthly EMI")).toHaveText(before);
  });

  test("reset restores defaults and clears the result; calculating again recovers", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.getByLabel("Loan Amount").fill("125000");
    await page.getByLabel("Interest Rate").fill("12");
    await page.getByLabel("Loan Tenure").fill("3");
    await page.getByRole("button", { name: "Calculate EMI" }).click();
    await expectResults(page, [125000, 12, 3]);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByLabel("Loan Amount")).toHaveValue("1000000");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Loan Tenure")).toHaveValue("20");
    // baseline behaviour: reset shows the empty-state prompt instead of a result
    await expect(page.locator("#emi-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#emi-results .calculator-results__value")).toHaveCount(0);

    await page.getByRole("button", { name: "Calculate EMI" }).click();
    await expectResults(page, [1000000, 8.5, 20]);
  });

  test("explanatory content: how to use, formula, FAQ", async ({ page, go }) => {
    await go("calculators/emi/");
    await expect(page.getByRole("heading", { name: "How to Use the EMI Calculator" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How EMI Is Calculated" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "EMI Calculator FAQ" })).toBeVisible();
    const faq = page.locator(".calculator-info details");
    await expect(faq).toHaveCount(3);
    await faq.first().locator("summary").click();
    await expect(faq.first()).toHaveJSProperty("open", true);
  });

  test("related calculators and related articles", async ({ page, go, siteRoot, api }) => {
    await go("calculators/emi/");
    const calcs = page.locator(".related-calculator-card");
    await expect(page.getByRole("heading", { name: "Related Calculators" })).toBeVisible();
    await expect(calcs).toHaveCount(1);
    await expect(calcs.first()).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);
    await expect(calcs.first()).toContainText("Loan Comparison Calculator");

    await expect(page.getByRole("heading", { name: "Related Articles" })).toBeVisible();
    const articles = page.locator(".related-article-card");
    expect(await articles.count()).toBeGreaterThanOrEqual(3);
    const hrefs = await articles.evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    for (const h of hrefs) {
      expect(h).toMatch(new RegExp(`^${siteRoot}articles/loan-comparison/[a-z-]+/$`));
      expect((await api.get(h)).status(), h).toBe(200);
    }

    // the related calculator link really navigates
    await calcs.first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/loan-comparison/`);
    await expect(page.locator("h1")).toHaveText("Loan Comparison Calculator");
  });

  test("layout fits the viewport (no horizontal scroll)", async ({ page, go }) => {
    await go("calculators/emi/");
    await expect(page.locator("#emi-form")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
