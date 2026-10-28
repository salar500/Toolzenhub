/**
 * M0.7 — EMI Calculator, realistic user flows (Calculators Ecosystem 2.0, pack 45: live results, tenure and
 * rate modes, schedule, copy summary, starting values).
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
    await expect(page.getByRole("button", { name: "Calculate EMI" })).toHaveCount(0); // results are live
    await expect(page.locator("#emi-form button[type=submit]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Find the EMI" })).toBeChecked();

    // a result is shown straight away for the default inputs (₹10,00,000 @ 8.5% for 20 years)
    await expectResults(page, [1000000, 8.5, 20]);
    await expect(result(page, "Monthly EMI")).toHaveText("₹8,678"); // independent sanity check of the formatter
    expectClean(watch);
  });

  test("enter known values, results update live, verify results and currency formatting", async ({ page, go, watch }) => {
    await go("calculators/emi/");
    await page.getByLabel("Loan Amount").fill("500000");
    await page.getByLabel("Interest Rate").fill("10");
    await page.getByLabel("Loan Tenure").fill("5");

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
    await expectResults(page, [2500000, 7.25, 15]);
    await expect(result(page, "Monthly EMI")).toHaveText("₹22,822");
    expectClean(watch);
  });

  test("empty, partial and invalid input: a neutral prompt, errors only once a field is left, never a stale figure", async ({ page, go }) => {
    await go("calculators/emi/");
    const rate = page.getByLabel("Interest Rate");

    // empty: a prompt, no error, no figure
    await page.getByLabel("Loan Amount").fill("");
    await expect(page.locator("#emi-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#emi-results .calculator-results__error")).toHaveCount(0);
    await expect(page.locator("#emi-results .calculator-results__value")).toHaveCount(0);
    await page.getByLabel("Loan Amount").fill("1000000");
    await expect(result(page, "Monthly EMI")).toHaveText("₹8,678");

    // invalid while the field still has focus: no error yet, and the old figure is gone
    await rate.fill("45");
    await expect(page.locator("#emi-results .calculator-results__error")).toHaveCount(0);
    await expect(page.locator("#emi-results .calculator-results__value")).toHaveCount(0);
    await expect(rate).not.toHaveAttribute("aria-invalid", "true");

    // leaving the field reports it, keeps what was typed, and links the message to the field
    await page.keyboard.press("Tab");
    await expect(page.locator("#emi-results .calculator-results__error")).toContainText("between 0% and 30%");
    await expect(rate).toHaveAttribute("aria-invalid", "true");
    await expect(rate).toHaveValue("45");
    await expect(rate).toHaveAttribute("aria-describedby", /emi-results-error/);

    // fixing it brings the result back and clears the error
    await rate.fill("8.5");
    await expect(result(page, "Monthly EMI")).toHaveText("₹8,678");
    await expect(rate).not.toHaveAttribute("aria-invalid", "true");

    // a zero-interest loan is allowed
    await rate.fill("0");
    await expect(result(page, "Monthly EMI")).toHaveText("₹4,167");
    await expect(result(page, "Total Interest")).toHaveText("₹0");

    // the loan amount is not forced onto a step of 1,000 any more
    await page.getByLabel("Loan Amount").fill("1234567");
    await expect(result(page, "Monthly EMI")).toBeVisible();
  });

  test("an update never moves focus, and typing announces at most once", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.evaluate(() => {
      window.__live = [];
      new MutationObserver(() => window.__live.push(document.querySelector("#emi-live").textContent))
        .observe(document.querySelector("#emi-live"), { childList: true, characterData: true, subtree: true });
    });
    const loan = page.getByLabel("Loan Amount");
    await loan.fill("");
    await loan.pressSequentially("2500000", { delay: 20 });
    await expect(result(page, "Monthly EMI")).toBeVisible();
    expect(await page.evaluate(() => document.activeElement.id)).toBe("emi-loan");
    await expect.poll(() => page.evaluate(() => window.__live.length)).toBeGreaterThan(0);
    await page.waitForTimeout(900);
    const spoken = await page.evaluate(() => window.__live);
    expect(spoken.length).toBeLessThanOrEqual(1);
    expect(spoken[0]).toMatch(/^Monthly EMI ₹/);
    expect(await page.evaluate(() => document.activeElement.id)).toBe("emi-loan");
  });

  test("reset restores defaults, shows the default result, announces once and focuses the first field", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.getByLabel("Loan Amount").fill("125000");
    await page.getByLabel("Interest Rate").fill("12");
    await page.getByLabel("Loan Tenure").fill("3");
    await expectResults(page, [125000, 12, 3]);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByLabel("Loan Amount")).toHaveValue("1000000");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Loan Tenure")).toHaveValue("20");
    // live results: the defaults give the default result again
    await expectResults(page, [1000000, 8.5, 20]);
    await expect(page.getByLabel("Loan Amount")).toBeFocused();
    await expect(page.locator("#emi-live")).toHaveText("Values reset to the defaults.");
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
    // the curated list (pack 50) first: Loan Comparison, Loan Prepayment, Home Loan; then Loan Balance Transfer and the Credit Card Payoff Calculator from the automatic Loans relationship
    await expect(calcs).toHaveCount(5);
    await expect(calcs.first()).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);
    await expect(calcs.first()).toContainText("Loan Comparison Calculator");
    await expect(calcs.nth(1)).toHaveAttribute("href", `${siteRoot}calculators/prepayment/`);
    await expect(calcs.nth(2)).toHaveAttribute("href", `${siteRoot}calculators/home-loan/`);
    await expect(calcs.nth(3)).toHaveAttribute("href", `${siteRoot}calculators/balance-transfer/`);
    await expect(calcs.nth(4)).toHaveAttribute("href", `${siteRoot}calculators/credit-card-payoff/`);

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

  test("M3: exactly one breadcrumb, and identity comes from the catalog", async ({ page, go }) => {
    await go("calculators/emi/");
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    // breadcrumb is the first child of the page wrapper, related sections are last
    const order = await page.locator("#app .calculator-page > *").evaluateAll((els) => els.map((e) => e.className));
    expect(order[0]).toBe("calculator-breadcrumb");
    expect(order.slice(-2)).toEqual(["related-section", "related-section"]);
    // heading text derived from the catalog title must equal what it always said
    await expect(page.locator("h1")).toHaveText("EMI Calculator");
    await expect(page.getByRole("heading", { name: "How to Use the EMI Calculator" })).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "EMI Calculator FAQ" })).toHaveCount(1);
    // updating never adds another breadcrumb
    await page.getByLabel("Loan Amount").fill("900000");
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
  });

  test("M3: golden values at the form limits (literals captured before the migration)", async ({ page, go }) => {
    await go("calculators/emi/");
    const run = async (loan, rate, years) => {
      await page.getByLabel("Loan Amount").fill(loan);
      await page.getByLabel("Interest Rate").fill(rate);
      await page.getByLabel("Loan Tenure").fill(years);
    };
    await run("1000", "1", "1"); // minimum of every field
    await expect(result(page, "Monthly EMI")).toHaveText("₹84");
    await expect(result(page, "Total Interest")).toHaveText("₹5");
    await expect(result(page, "Total Repayment")).toHaveText("₹1,005");
    await run("100000000", "30", "40"); // maximum of every field
    await expect(result(page, "Monthly EMI")).toHaveText("₹25,00,018");
    await expect(result(page, "Total Interest")).toHaveText("₹1,10,00,08,545");
    await expect(result(page, "Total Repayment")).toHaveText("₹1,20,00,08,545");
    await run("2500000", "7.25", "15");
    await expect(result(page, "Total Interest")).toHaveText("₹16,07,883");
    await expect(result(page, "Total Repayment")).toHaveText("₹41,07,883");
  });

  test("tenure mode: how long an EMI takes, the last payment, and the cases that cannot work", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.getByRole("radio", { name: "Find the tenure" }).check();
    await expect(page.getByLabel("Loan Tenure")).toBeHidden();
    await page.getByLabel("Interest Rate").fill("9");
    await page.locator("#emi-payment").fill("15000");
    // reference: 93 payments (7 years 9 months), last 11,496.54, interest 3,91,496.54 (formula-reference-check.py)
    await expect(result(page, "Time to repay")).toHaveText("7 years 9 months");
    await expect(result(page, "Number of payments")).toHaveText("93");
    await expect(result(page, "Last payment")).toHaveText("₹11,497");
    await expect(result(page, "Total Interest")).toHaveText("₹3,91,497");
    // an EMI that only covers the first month's interest (7,500) never repays the loan
    await page.locator("#emi-payment").fill("7500");
    await expect(page.locator("#emi-results")).toContainText("does not repay this loan");
    await expect(page.locator("#emi-results")).toContainText("₹7,500");
    await expect(page.locator("#emi-results .calculator-results__value")).toHaveCount(0);
    // switching back keeps the shared values
    await page.getByRole("radio", { name: "Find the EMI" }).check();
    await expect(page.getByLabel("Loan Tenure")).toBeVisible();
    await expect(page.getByLabel("Interest Rate")).toHaveValue("9");
    await expect(result(page, "Monthly EMI")).toBeVisible();
  });

  test("rate mode: the rate an EMI implies, and an EMI too small to repay the loan", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.getByRole("radio", { name: "Find the rate" }).check();
    await expect(page.getByLabel("Interest Rate")).toBeHidden();
    await page.locator("#emi-payment").fill("9000");
    // reference: 9.004261% a year for 10,00,000 over 240 months with EMI 9,000
    await expect(result(page, "Interest rate")).toHaveText("9% a year");
    await expect(result(page, "Total Repayment")).toHaveText("₹21,60,000");
    await expect(result(page, "Total Interest")).toHaveText("₹11,60,000");
    await page.locator("#emi-payment").fill("4000");
    await expect(page.locator("#emi-results")).toContainText("no interest rate can fit");
  });

  test("schedule: yearly summary, lazily built monthly table, totals and final balance", async ({ page, go }) => {
    await go("calculators/emi/");
    const years = page.locator("#emi-results .emi-schedule table").first();
    await expect(years.locator("tbody tr")).toHaveCount(20);
    await expect(years.locator("thead th").first()).toHaveAttribute("scope", "col");
    await expect(years.locator("tbody tr").nth(0)).toContainText("₹9,80,097.71"); // reference: balance after 12 payments
    await expect(years.locator("tbody tr").nth(19)).toContainText("₹0.00");
    await expect(years.locator("tfoot")).toContainText("₹10,00,000.00"); // principal repaid in total
    await expect(years.locator("tfoot")).toContainText("₹10,82,775.76"); // reference: total interest
    // the monthly table is not built until it is opened
    await expect(page.locator("#emi-monthly-body table")).toHaveCount(0);
    await page.locator("#emi-monthly summary").click();
    const rows = page.locator("#emi-monthly-body tbody tr");
    await expect(rows).toHaveCount(240);
    await expect(rows.first()).toContainText("₹7,083.33"); // reference: month 1 interest
    await expect(rows.first()).toContainText("₹1,594.90"); // reference: month 1 principal
    await expect(rows.last()).toContainText("₹0.00");
    // it stays open while the inputs change
    await page.getByLabel("Loan Tenure").fill("10");
    await expect(rows).toHaveCount(120);
    await expect(page.locator("#emi-monthly")).toHaveJSProperty("open", true);
  });

  test("starting values set only the amount and the tenure; links lead on without carrying values", async ({ page, go, siteRoot }) => {
    await go("calculators/emi/");
    await page.getByLabel("Interest Rate").fill("9.75");
    await page.getByRole("button", { name: "Car loan" }).click();
    await expect(page.getByLabel("Loan Amount")).toHaveValue("800000");
    await expect(page.getByLabel("Loan Tenure")).toHaveValue("5");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("9.75");
    await expect(page.locator(".emi-start")).toContainText("Your lender's rate and fees decide the real EMI");
    const next = page.locator(".emi-next a");
    await expect(next).toHaveCount(2);
    expect(await next.evaluateAll((a) => a.map((x) => x.getAttribute("href")))).toEqual([`${siteRoot}calculators/prepayment/`, `${siteRoot}calculators/loan-comparison/`]);
  });

  test("copy summary: the clipboard gets the summary; without a clipboard the text is selected", async ({ page, go }) => {
    // the preview is served over plain http on a non-local host name, where the browser offers no clipboard,
    // so a recording stand-in is installed for the success path; the fallback below is the real behaviour there
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await go("calculators/emi/");
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.locator("#emi-copy-note")).toHaveText("Summary copied.");
    const text = await page.evaluate(() => window.__copied[0]);
    expect(text).toContain("Loan amount: ₹10,00,000");
    expect(text).toContain("Monthly EMI: ₹8,678");
    expect(text).toContain("Total interest: ₹10,82,776");
    expect(text).toContain("A lender's figures may differ");
    expect(text).not.toMatch(/guarantee|best|approved|eligible/i);

    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
    await page.getByRole("button", { name: "Copy summary" }).click();
    const box = page.locator("#emi-copy-fallback");
    await expect(box).toBeFocused();
    await expect(page.locator("#emi-copy-note")).toContainText("selected");
    expect(await box.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd))).toContain("Monthly EMI: ₹8,678");
  });

  test("the tool makes no request after load and stores nothing", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.waitForLoadState("networkidle");
    const seen = [];
    // images are left out: the shared related-article cards load their thumbnails lazily (site-wide behaviour, not this tool)
    page.on("request", (r) => { if (r.resourceType() !== "image") seen.push(r.url()); });
    await page.getByLabel("Loan Amount").fill("750000");
    await page.getByRole("radio", { name: "Find the tenure" }).check();
    await page.locator("#emi-payment").fill("12000");
    await page.locator("#emi-monthly summary").click();
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.locator("#emi-monthly-body table")).toHaveCount(1);
    expect(seen.filter((u) => /^https?:/.test(u)), "requests after load").toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, location.search, location.hash])).toEqual([0, 0, "", ""]);
  });

  for (const width of [320, 360, 390]) {
    test(`layout at ${width}px: no horizontal overflow with the schedule open, targets large enough`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await go("calculators/emi/");
      await page.locator("#emi-monthly summary").click();
      await expect(page.locator("#emi-monthly-body tbody tr")).toHaveCount(240);
      await expectNoHorizontalOverflow(page);
      for (const loc of [page.getByRole("button", { name: "Home loan" }), page.getByRole("button", { name: "Reset" }), page.getByRole("button", { name: "Copy summary" }), page.locator(".emi-mode__option span").first()]) {
        const box = await loc.boundingBox();
        expect(box.height, "touch target").toBeGreaterThanOrEqual(44);
      }
      for (const id of ["#emi-loan", "#emi-rate", "#emi-years"]) {
        expect(await page.locator(id).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      }
    });
  }
});
