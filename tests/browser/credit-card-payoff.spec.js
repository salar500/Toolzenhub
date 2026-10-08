/**
 * Tool Pack 24: the Credit Card Payoff Calculator page.
 *
 * Expected figures are the independently derived values of tests/fixtures/credit-card-payoff-golden.py (Python
 * decimal, an exact Fraction simulation and the closed form), written here as the amounts the page shows. The unit
 * suite (tests/unit/credit-card-payoff.test.mjs) proves the maths; these tests prove the page: Calculate, the three
 * outcomes, the comparison states, validation, the out-of-date marker, reset, announcements, privacy, the phone
 * layouts and the tool's place in the Loans listing, search and related tools.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const results = (page) => page.locator("#ccp-results");
const metric = (page, label) =>
  page.locator(`#ccp-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const live = (page) => page.locator("#ccp-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const F = {
  balance: (page) => page.locator("#ccp-balance"),
  apr: (page) => page.locator("#ccp-apr"),
  payment: (page) => page.locator("#ccp-payment"),
  compare: (page) => page.locator("#ccp-compare"),
};

async function open(page, go) {
  await go("calculators/credit-card-payoff/");
  await expect(page.locator("#ccp-form")).toHaveAttribute("data-ready", "true");
}

async function fill(page, balance, apr, payment, compare = "") {
  await F.balance(page).fill(balance);
  await F.apr(page).fill(apr);
  await F.payment(page).fill(payment);
  await F.compare(page).fill(compare);
}

async function calculate(page, balance, apr, payment, compare = "") {
  await fill(page, balance, apr, payment, compare);
  await btn(page, "Calculate").click();
}

const outcome = (page) => page.locator("#ccp-results .ccp-outcome");

test.describe("Credit Card Payoff Calculator", () => {
  test("page, breadcrumb, the four fields and nothing personal, the assumptions before any result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Credit Card Payoff Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}loans.html`]);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Credit Card Payoff Calculator");
    // exactly four inputs, none asking for card or personal details
    await expect(page.locator("#ccp-form input")).toHaveCount(4);
    for (const label of ["Outstanding Balance", "Annual Percentage Rate (APR)", "Monthly Payment", "Compare With Another Monthly Payment (optional)"]) await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
    expect(await page.locator("#ccp-form").innerText()).not.toMatch(/card number|account|issuer|name|phone|email|cvv/i);
    for (const input of await page.locator("#ccp-form input").all()) await expect(input).toHaveValue("");
    await expect(results(page)).toContainText("press Calculate");
    // the assumptions are there before anything is calculated, beside the results area
    const a = page.locator(".ccp-assumptions");
    await expect(a).toBeVisible();
    for (const text of ["divided by 12", "before that month's payment", "The last payment is whatever is left", "A remaining amount of half a paisa or less may be included in the final payment.", "No new purchases, fees", "No card issuer's minimum-payment", "not a statement or a payoff quote", "not financial advice"]) await expect(a).toContainText(text);
    await expect(btn(page, "Calculate")).toBeEnabled();
    expectClean(watch);
  });

  test("results appear only after Calculate; Enter in a field calculates", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "50000", "36", "3000");
    await expect(results(page)).toContainText("press Calculate");
    await expect(outcome(page)).toHaveCount(0);
    await F.payment(page).press("Enter");
    await expect(outcome(page)).toHaveText("Estimated payoff: 24 payments (2 years). The last payment is ₹1,360.29.");
  });

  test("Load example: payment 1 pays off in 24 payments; the comparison with ₹4,000 is 8 months fewer and ₹6,752.50 less interest", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(outcome(page)).toHaveText("Estimated payoff: 24 payments (2 years). The last payment is ₹1,360.29.");
    await expect(metric(page, "Payoff time")).toHaveText("24 payments (2 years)");
    await expect(metric(page, "Total interest")).toHaveText("₹20,360.29");
    await expect(metric(page, "Total repaid")).toHaveText("₹70,360.29");
    await expect(metric(page, "First month's interest")).toHaveText("₹1,500.00");
    await expect(metric(page, "Final payment")).toHaveText("₹1,360.29");
    const sides = page.locator("#ccp-results .ccp-side");
    await expect(sides).toHaveCount(2);
    await expect(sides.nth(0).locator(".ccp-side__title")).toHaveText("Payment 1: ₹3,000.00 a month");
    await expect(sides.nth(1).locator(".ccp-side__title")).toHaveText("Payment 2: ₹4,000.00 a month");
    await expect(sides.nth(1)).toContainText("16 payments (1 year 4 months)");
    await expect(sides.nth(1)).toContainText("₹13,607.80");
    await expect(page.locator("#ccp-results .ccp-differences li")).toHaveText(["Payment 2 takes 8 months fewer than payment 1.", "Payment 2 costs ₹6,752.50 less interest than payment 1."]);
    await expect(live(page)).toHaveText("Estimated payoff 2 years. Total interest ₹20,360.29. Payment 2 takes 8 months fewer than payment 1. Payment 2 costs ₹6,752.50 less interest than payment 1.");
    // the assumptions are still beside the result, and no date or recommendation appears anywhere in it
    await expect(page.locator(".ccp-assumptions")).toBeVisible();
    expect(await results(page).innerText()).not.toMatch(/guarantee|payoff date|debt-free|recommend|should|best/i);
  });

  test("the three outcomes are different, with their own sentence and only the figures that exist", async ({ page, go }) => {
    await open(page, go);
    // payoff, one paisa above the interest
    await calculate(page, "100000", "42", "3500.01");
    await expect(outcome(page)).toHaveText("Estimated payoff: 372 payments (31 years). The last payment is ₹285.47.");
    await expect(metric(page, "Total repaid")).toHaveText("₹12,98,789.18");
    await expect(metric(page, "Total interest")).toHaveText("₹11,98,789.18");
    // non-amortizing: exactly the interest, and one paisa below it
    for (const p of ["3500", "3499.99"]) {
      await calculate(page, "100000", "42", p);
      await expect(outcome(page)).toHaveText("Your monthly payment does not cover the first month's interest under this model. A payment of at least ₹3,500.01 is needed to start reducing the balance.");
      await expect(metric(page, "First month's interest")).toHaveText("₹3,500.00");
      await expect(metric(page, "Smallest payment that reduces the balance")).toHaveText("₹3,500.01");
      await expect(metric(page, "Payoff time")).toHaveText("Not paid off at this payment");
      for (const label of ["Total interest", "Total repaid", "Final payment"]) await expect(metric(page, label)).toHaveCount(0);
      await expect(page.locator("#ccp-results h2")).toHaveText("This payment does not reduce the balance");
    }
    // beyond the horizon: the payment exceeds the interest but the balance remains after 600 payments
    await calculate(page, "100000", "12", "1002");
    await expect(outcome(page)).toHaveText("At this payment the estimated payoff is more than 50 years (600 months) away, so no payoff time is shown.");
    await expect(metric(page, "Payoff time")).toHaveText("More than 50 years (600 months)");
    for (const label of ["Total interest", "Total repaid", "Final payment"]) await expect(metric(page, label)).toHaveCount(0);
    await expect(page.locator("#ccp-results h2")).toHaveText("Payoff is more than 50 years away");
    // the 600/601 boundary at zero APR
    await calculate(page, "60000", "0", "100");
    await expect(metric(page, "Payoff time")).toHaveText("600 payments (50 years)");
    await calculate(page, "60000", "0", "99.99");
    await expect(metric(page, "Payoff time")).toHaveText("More than 50 years (600 months)");
    // zero APR, no interest; one payment clears a small balance
    await calculate(page, "24000", "0", "2000");
    await expect(metric(page, "Total interest")).toHaveText("₹0.00");
    await calculate(page, "1000", "36", "5000");
    await expect(outcome(page)).toHaveText("Estimated payoff: 1 payment (1 month). The last payment is ₹1,030.00.");
  });

  test("fractional-paisa interest: ₹1,00,000 at 12.02% (interest 1,001.6667) with ₹1,001.66 is told to pay at least ₹1,001.67, and ₹1,001.67 is not told it does not help", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, "100000", "12.02", "1001.66");
    await expect(outcome(page)).toHaveText("Your monthly payment does not cover the first month's interest under this model. A payment of at least ₹1,001.67 is needed to start reducing the balance.");
    await expect(metric(page, "First month's interest")).toHaveText("₹1,001.67"); // rounded for display; the threshold above is exact
    await expect(metric(page, "Smallest payment that reduces the balance")).toHaveText("₹1,001.67");
    expect(await results(page).innerText()).not.toMatch(/or less/);
    // the payment the warning names is not non-amortizing: it reduces the balance (very slowly: beyond the 50-year horizon)
    await calculate(page, "100000", "12.02", "1001.67");
    await expect(page.locator("#ccp-results h2")).toHaveText("Payoff is more than 50 years away");
    await expect(outcome(page)).not.toContainText("does not cover");
    // whole-paisa interest (3,500.00) and the smallest reducing payment one paisa above it
    await calculate(page, "100000", "42", "3500");
    await expect(outcome(page)).toContainText("at least ₹3,500.01 is needed");
    await calculate(page, "100000", "42", "3500.01");
    await expect(metric(page, "Payoff time")).toHaveText("372 payments (31 years)");
  });

  test("the half-paisa rule is disclosed in the assumptions, visible without opening anything, before and after a result", async ({ page, go }) => {
    await open(page, go);
    const rule = page.locator(".ccp-assumptions li", { hasText: "A remaining amount of half a paisa or less may be included in the final payment." });
    await expect(rule).toBeVisible();
    await expect(page.locator("details[open]")).toHaveCount(0); // nothing had to be opened
    await btn(page, "Load example").click();
    await expect(rule).toBeVisible();
    // the tie: the amount due is exactly half a paisa above the payment, so one payment of ₹100.005 is shown as ₹100.01
    await calculate(page, "100", "0.06", "100");
    await expect(outcome(page)).toHaveText("Estimated payoff: 1 payment (1 month). The last payment is ₹100.01.");
    await expect(metric(page, "Total interest")).toHaveText("₹0.01");
    await expect(metric(page, "Total repaid")).toHaveText("₹100.01");
    await expect(rule).toBeVisible();
    await expect(page.locator(".ccp-assumptions")).toContainText("The last payment is whatever is left");
  });

  test("the comparison: a difference only when both pay off; every other state says so and invents no saving; equal payments are neutral", async ({ page, go }) => {
    await open(page, go);
    const text = async () => results(page).innerText();
    // payoff against payoff, both ways round
    await calculate(page, "50000", "36", "4000", "3000");
    await expect(page.locator("#ccp-results .ccp-differences li")).toHaveText(["Payment 2 takes 8 months more than payment 1.", "Payment 2 costs ₹6,752.50 more interest than payment 1."]);
    // not paid off against paid off
    await calculate(page, "100000", "42", "3500", "4000");
    await expect(page.locator("#ccp-results .ccp-differences li")).toHaveText(["At least one of the two payments does not pay the balance off within 50 years, so no saving in time or interest can be worked out."]);
    expect(await text()).not.toMatch(/fewer|less interest|more interest|months more/);
    await expect(page.locator("#ccp-results .ccp-side").nth(1)).toContainText("61 payments");
    // beyond the horizon on either side, and two non-payoff states
    await calculate(page, "100000", "12", "1002", "1005");
    await expect(page.locator("#ccp-results .ccp-differences li")).toHaveCount(1);
    await expect(page.locator("#ccp-results .ccp-side").nth(1)).toContainText("533 payments");
    await calculate(page, "100000", "12", "1001", "1002");
    await expect(page.locator("#ccp-results .ccp-differences li")).toContainText("no saving in time or interest can be worked out");
    await calculate(page, "100000", "42", "3500", "3499.99");
    await expect(page.locator("#ccp-results .ccp-side")).toHaveCount(2);
    await expect(page.locator("#ccp-results .ccp-differences li")).toContainText("no saving");
    // equal payments, even written differently
    await calculate(page, "50000", "36", "3000", "3000.00");
    await expect(page.locator("#ccp-results .ccp-differences li")).toHaveText(["The two payments are the same."]);
    // a blank comparison is no comparison
    await calculate(page, "50000", "36", "3000", "");
    await expect(page.locator("#ccp-results .ccp-side")).toHaveCount(0);
    await expect(page.locator("#ccp-results .ccp-differences")).toHaveCount(0);
  });

  test("validation: each field has its own exact message, the field is marked and linked, nothing is rounded or clamped", async ({ page, go }) => {
    await open(page, go);
    const MONEY = "Enter a monthly payment between ₹1 and ₹1,00,00,000, with at most 2 decimal places.";
    const cases = [
      ["balance", ["99.99", "10000000.01", "0", "-5", "100.001", "1e3"], "Enter a balance between ₹100 and ₹1,00,00,000, with at most 2 decimal places."],
      ["apr", ["100.01", "-1", "36.001", "1e1"], "Enter an annual percentage rate between 0% and 100%, with at most 2 decimal places."],
      ["payment", ["0.99", "10000000.01", "3000.001", "-1"], MONEY],
    ];
    const base = { balance: "50000", apr: "36", payment: "3000" };
    for (const [name, bad, message] of cases) {
      for (const value of bad) {
        await fill(page, base.balance, base.apr, base.payment);
        await F[name](page).fill(value);
        await btn(page, "Calculate").click();
        await expect(page.locator("#ccp-error"), `${name} ${value}`).toHaveText(message);
        await expect(F[name](page)).toHaveAttribute("aria-invalid", "true");
        await expect(F[name](page)).toHaveAttribute("aria-describedby", /ccp-error/);
        for (const other of Object.keys(base).filter((n) => n !== name)) await expect(F[other](page)).not.toHaveAttribute("aria-invalid", "true");
        await expect(live(page)).toHaveText(message);
      }
    }
    // a bad comparison payment, and several errors together in field order
    await fill(page, base.balance, base.apr, base.payment, "0");
    await btn(page, "Calculate").click();
    await expect(page.locator("#ccp-error")).toHaveText(MONEY);
    await expect(F.compare(page)).toHaveAttribute("aria-invalid", "true");
    await fill(page, "", "101", "", "");
    await btn(page, "Calculate").click();
    await expect(page.locator("#ccp-error")).toContainText("Enter a balance between");
    await expect(page.locator("#ccp-error")).toContainText("Enter a monthly payment between");
    for (const name of ["balance", "payment"]) await expect(F[name](page)).toHaveAttribute("aria-invalid", "true");
    // the exact bounds are accepted
    await calculate(page, "100", "0", "1");
    await expect(page.locator("#ccp-error")).toHaveCount(0);
    await expect(metric(page, "Payoff time")).toHaveText("100 payments (8 years 4 months)");
    await expect(F.balance(page)).not.toHaveAttribute("aria-invalid", "true");
    await calculate(page, "10000000", "100", "10000000", "833333.34");
    await expect(page.locator("#ccp-error")).toHaveCount(0);
    await expect(page.locator("#ccp-results .ccp-side").nth(1)).toContainText("233 payments");
  });

  test("an edit after Calculate marks the result out of date, keeps it visible, and Calculate refreshes it", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, "50000", "36", "3000");
    await expect(page.locator("#ccp-stale")).toBeHidden();
    await F.payment(page).fill("4000");
    await expect(page.locator("#ccp-stale")).toBeVisible();
    await expect(page.locator("#ccp-stale")).toHaveText("The inputs have changed since this result was worked out. Press Calculate to update it.");
    await expect(results(page)).toHaveAttribute("data-stale", "true");
    await expect(outcome(page)).toContainText("24 payments"); // the old result, still shown, and labelled
    await expect(live(page)).toHaveText("The inputs have changed since this result was worked out. Press Calculate to update it.");
    await btn(page, "Calculate").click();
    await expect(page.locator("#ccp-stale")).toBeHidden();
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    await expect(outcome(page)).toContainText("16 payments");
    // typing before any result does not raise the marker
    await btn(page, "Reset").click();
    await F.balance(page).fill("5");
    await expect(page.locator("#ccp-stale")).toBeHidden();
  });

  test("Reset clears the fields, the result, the errors and the marker, announces it, and returns focus to the balance", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await F.payment(page).fill("0");
    await btn(page, "Calculate").click();
    await expect(F.payment(page)).toHaveAttribute("aria-invalid", "true");
    await btn(page, "Reset").click();
    for (const name of ["balance", "apr", "payment", "compare"]) await expect(F[name](page)).toHaveValue("");
    await expect(F.payment(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(results(page)).toContainText("press Calculate");
    await expect(page.locator("#ccp-error")).toHaveCount(0);
    await expect(page.locator("#ccp-stale")).toBeHidden();
    await expect(F.balance(page)).toBeFocused();
    await expect(live(page)).toHaveText("Cleared.");
  });

  test("announcements: one polite sentence per Calculate for each outcome", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await calculate(page, "50000", "36", "3000");
    await expect(live(page)).toHaveText("Estimated payoff 2 years. Total interest ₹20,360.29.");
    await calculate(page, "100000", "42", "3500");
    await expect(live(page)).toHaveText("This payment will not pay off the balance.");
    await calculate(page, "100000", "12", "1002");
    await expect(live(page)).toHaveText("No payoff within 50 years at this payment.");
    await calculate(page, "100000", "42", "3500", "4000");
    await expect(live(page)).toHaveText("This payment will not pay off the balance. No comparison of time or interest is available.");
  });

  test("keyboard: fields, Calculate, Load example and Reset are reachable in order and operable without a mouse, with visible focus", async ({ page, go }) => {
    await open(page, go);
    await F.balance(page).focus();
    for (const next of [F.apr, F.payment, F.compare, () => btn(page, "Calculate"), () => btn(page, "Load example"), () => btn(page, "Reset")]) {
      await page.keyboard.press("Tab");
      await expect(next(page)).toBeFocused();
    }
    await btn(page, "Load example").focus();
    await page.keyboard.press("Enter");
    await expect(outcome(page)).toContainText("24 payments");
    await btn(page, "Reset").focus();
    await page.keyboard.press("Space");
    await expect(F.balance(page)).toHaveValue("");
    for (const control of [F.balance(page), btn(page, "Calculate")]) {
      await control.focus();
      const outline = await control.evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((outline.style !== "none" && outline.width > 0) || outline.shadow !== "none").toBe(true);
    }
  });

  test("an unsupported BigInt shows a clear message and disables Calculate, never an imprecise result", async ({ page, go }) => {
    await page.addInitScript(() => { window.BigInt = undefined; });
    await go("calculators/credit-card-payoff/");
    await expect(page.locator("#ccp-form")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#ccp-error")).toContainText("cannot do the exact arithmetic");
    await expect(btn(page, "Calculate")).toBeDisabled();
  });

  test("privacy: no request carries the figures, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await calculate(page, "73519.37", "29.99", "4123.45", "5000");
    await F.payment(page).fill("1");
    await btn(page, "Load example").click();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    expect(logs.filter((l) => l.includes("73519") || l.includes("4123"))).toEqual([]);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("heading order and the assumptions heading", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    await expect(page.locator(".ccp-assumptions")).toHaveAttribute("aria-labelledby", "ccp-assumptions-heading");
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`Credit Card Payoff Calculator at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`every state with the largest values and a comparison: no page-level overflow, readable text and 44px controls at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      const cases = [
        ["10000000", "100", "10000000", "833333.34"], // payoff in 1 payment, and a longer payoff
        ["10000000", "99.99", "833325", "833325.01"], // non-amortizing, and the smallest above it
        ["10000000", "12", "100000.01", "100001"],    // beyond the horizon and a long payoff
        ["10000000", "0", "10000000", "9999999.99"],
      ];
      for (const c of cases) {
        await calculate(page, ...c);
        await expect(outcome(page)).toBeVisible();
        await expectNoHorizontalOverflow(page);
        const wide = await page.locator("main *").evaluateAll((els, w) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > w + 1; }).map((e) => e.tagName + "." + e.className), width);
        expect(wide).toEqual([]);
      }
      const sizes = await page.locator(".calculator-form__input, .ccp-outcome, .ccp-side__item dd, .ccp-assumptions li, .calculator-results__value").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(14);
      for (const name of ["Calculate", "Load example", "Reset"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const input of await page.locator("#ccp-form input").all()) expect((await input.boundingBox()).height).toBeGreaterThanOrEqual(44);
    });

    test(`the error and the out-of-date states fit at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await fill(page, "99999999999999999999", "101", "-1", "0");
      await btn(page, "Calculate").click();
      await expect(page.locator("#ccp-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await btn(page, "Load example").click();
      await F.payment(page).fill("2500");
      await expect(page.locator("#ccp-stale")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("Credit Card Payoff Calculator in the Loans listing, search and related tools", () => {
  test("it is in Loans and All Calculators, not in Time or Developer Tools; related tools and articles are the curated ones", async ({ page, go, siteRoot }) => {
    await go("loans.html");
    await expect(page.locator(`#loans-calculators-grid a[href$="calculators/credit-card-payoff/"]`)).toHaveCount(1);
    await go("calculators.html");
    await expect(page.locator(`#calculators-grid a[href$="calculators/credit-card-payoff/"]`)).toHaveCount(1);
    await go("developer-tools.html");
    await expect(page.locator(`a[href*="credit-card-payoff"]`)).toHaveCount(0);
    await go("calculators/credit-card-payoff/");
    const hrefs = await page.locator(".related-calculator-card").evaluateAll((l) => l.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/balance-transfer/`, `${siteRoot}calculators/prepayment/`, `${siteRoot}calculators/emi/`, `${siteRoot}calculators/loan-comparison/`, `${siteRoot}calculators/home-loan/`]);
    const articles = await page.locator(".related-article-card").evaluateAll((l) => l.map((e) => e.getAttribute("href")));
    expect(articles).toEqual([`${siteRoot}articles/loan-comparison/loan-tenure-total-interest/`, `${siteRoot}articles/loan-comparison/emi-vs-total-interest/`]);
    // the established automatic relationship: the other Loans tools offer it too (their pages are otherwise unchanged)
    await go("calculators/emi/");
    expect(await page.locator(".related-calculator-card a, a.related-calculator-card").evaluateAll((l) => l.map((e) => e.getAttribute("href")))).toContain(`${siteRoot}calculators/credit-card-payoff/`);
  });

  test("search finds it by its own names", async ({ page, go, siteRoot }) => {
    for (const q of ["credit card payoff", "pay off credit card", "credit card repayment calculator", "how long to pay off credit card"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}calculators/credit-card-payoff/']`).first(), q).toBeVisible();
    }
    // the alias list itself (no "minimum payment", no "statement") is pinned in tests/unit/search.test.mjs
  });
});
