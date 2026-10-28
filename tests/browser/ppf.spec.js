/**
 * Tool Pack 26, Phase 2: the PPF Calculator page.
 *
 * The figures below are the independently derived values of tests/fixtures/ppf-golden.py (exact fractions, a day-level
 * ledger plus closed forms), written here as the whole rupees the page shows. The unit suite (tests/unit/ppf-golden.test.mjs)
 * proves the maths; these tests prove the page: Calculate, both deposit patterns, the year labels, the annual-versus-monthly
 * comparison and its eligibility, validation, the out-of-date marker, Reset, announcements, privacy, the phone layouts and
 * the tool's place in the Investment listing, search and related tools.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const results = (page) => page.locator("#ppf-results");
const metric = (page, label) =>
  page.locator(`#ppf-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const live = (page) => page.locator("#ppf-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const F = {
  yearly: (page) => page.locator("#ppf-yearly"),
  monthly: (page) => page.locator("#ppf-monthly"),
  rate: (page) => page.locator("#ppf-rate"),
  years: (page) => page.locator("#ppf-years"),
};
const pattern = (page, which) => page.getByRole("radio", { name: which === "yearly" ? "Yearly: all in April, by the 5th" : "Monthly: every month, by the 5th" });
const kind = (page) => page.locator("#ppf-results .ppf-kind");
const rows = (page) => page.locator("#ppf-results .ppf-table tbody tr");

async function open(page, go) {
  await go("calculators/ppf/");
  await expect(page.locator("#ppf-form")).toHaveAttribute("data-ready", "true");
}

async function setInputs(page, { mode = "yearly", amount, rate = "7.1", years = "16" }) {
  await pattern(page, mode).check();
  await (mode === "yearly" ? F.yearly(page) : F.monthly(page)).fill(String(amount));
  await F.rate(page).fill(rate);
  await F.years(page).fill(years);
}

// the table is folded on a phone and open on a wide screen: make it open either way
async function openTable(page) {
  const details = page.locator("#ppf-table-details");
  if (!(await details.evaluate((d) => d.open))) await page.locator("#ppf-table-details summary").click();
  await expect(details).toHaveJSProperty("open", true);
}

// the page reports an invalid value when its field is left, not while it is being typed
const leave = (page) => page.evaluate(() => document.activeElement && document.activeElement.blur());

async function calculate(page, inputs) {
  await setInputs(page, inputs); // results are live: there is nothing to press
  await expect(results(page).locator(".ppf-result")).toBeVisible();
}

test.describe("PPF Calculator", () => {
  test("page, breadcrumb, fields, the example-rate label, the April assumption and the assumptions before any result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("PPF Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs[0]).toBe(siteRoot);
    expect(hrefs[1]).toBe(`${siteRoot}categories.html`);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("PPF Calculator");
    // the starting values of the specification
    await expect(pattern(page, "yearly")).toBeChecked();
    await expect(F.yearly(page)).toHaveValue("150000");
    await expect(F.monthly(page)).toHaveValue("12500");
    await expect(F.monthly(page)).toBeHidden(); // only the field the pattern uses is shown
    await expect(F.rate(page)).toHaveValue("7.1");
    await expect(F.years(page)).toHaveValue("16");
    // the rate is labelled an example and the page makes no current-rate claim
    await expect(page.getByLabel("Interest Rate (example)", { exact: true })).toHaveCount(1);
    await expect(page.locator("#ppf-rate-hint")).toContainText("only an example, not the current rate");
    await expect(page.locator("#ppf-rate-hint")).toContainText("reviews it every quarter");
    // the April opening is visible before any result, with no opening-month setting
    await expect(page.locator("#ppf-april")).toContainText("Assumes the account is opened in April");
    await expect(page.getByLabel(/opening month/i)).toHaveCount(0);
    await expect(btn(page, "Calculate")).toHaveCount(0); // results are live
    await expect(results(page).locator(".ppf-result")).toBeVisible(); // the starting values already give a result
    // the assumptions sit beside the results area
    const a = page.locator(".ppf-assumptions");
    await expect(a).toBeVisible();
    for (const text of ["annual rate divided by 12", "lowest balance between the close of the 5th", "once, at the end of each financial year", "opened in April", "end of year 16", "Rounded to whole rupees", "not a forecast, a guarantee or advice"]) {
      await expect(a).toContainText(text);
    }
    await expect(btn(page, "Reset")).toBeEnabled();
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/current (ppf )?rate is|today'?s (ppf )?rate|guaranteed|risk-free|best (ppf|investment)/i);
    expectClean(watch);
  });

  test("results are live: an empty field gives a prompt, a valid edit updates the result at once", async ({ page, go }) => {
    await open(page, go);
    await expect(results(page).locator(".ppf-result")).toBeVisible();
    await F.rate(page).fill("");
    await expect(results(page)).toContainText("Enter the deposit, the interest rate and the number of years");
    await expect(results(page).locator(".ppf-result")).toHaveCount(0);
    await expect(page.locator("#ppf-error")).toHaveCount(0); // empty is not an error
    await F.rate(page).fill("8");
    await expect(results(page).locator(".ppf-result")).toBeVisible();
    await expect(metric(page, "Estimated balance after 16 years")).not.toHaveText("₹45,17,702");
  });

  test("the default case: ₹1,50,000 in April for 16 years at 7.1% (the oracle's values)", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(metric(page, "Estimated balance after 16 years")).toHaveText("₹45,17,702");
    await expect(metric(page, "Total deposited")).toHaveText("₹24,00,000");
    await expect(metric(page, "Interest earned")).toHaveText("₹21,17,702");
    await expect(metric(page, "Interest share of the balance")).toHaveText("46.9%");
    await expect(page.locator("#ppf-results .ppf-lead")).toContainText("₹1,50,000 in April each year for 16 financial years, at the 7.1% a year you entered, could grow to about ₹45,17,702");
    await expect(kind(page)).toContainText("Year 16 is the end of the first term for an account opened in April");
    await expect(kind(page)).toContainText("earliest date on which the Scheme allows the account to be closed in full");
    await expect(page.locator("#ppf-results")).toContainText("Rounded to whole rupees. Actual credited balances can differ");
    await F.years(page).fill("16"); // an edit (the first render is silent): one announcement follows
    await expect(live(page)).toHaveText("Estimated balance after 16 years: ₹45,17,702. Total deposited ₹24,00,000, interest earned ₹21,17,702. These are projections from your inputs.");
    expectClean(watch);
  });

  test("the year-by-year table: 16 rows, the first row, the labels, and the last row equals the headline", async ({ page, go }) => {
    await open(page, go);
    await openTable(page);
    await expect(rows(page)).toHaveCount(16);
    const first = rows(page).first();
    await expect(first.locator("th")).toHaveText("1");
    await expect(first.locator("td")).toHaveText(["Before maturity", "₹0", "₹1,50,000", "₹10,650", "₹1,60,650"]);
    const last = rows(page).last();
    await expect(last.locator("td").first()).toHaveText("First term ends: earliest full closure");
    await expect(last.locator("td").last()).toHaveText("₹45,17,702");
    await expect(page.locator("#ppf-results .ppf-table caption")).toHaveText(/Every row is a projection/);
    await expect(page.getByRole("columnheader")).toHaveText(["Year", "What this year is", "Opening balance", "Deposits", "Interest added at year-end", "Closing balance"]);
    // every displayed row adds up: opening + deposits + interest = closing
    const sums = await rows(page).evaluateAll((trs) => trs.map((tr) => {
      const n = (t) => Number(t.replace(/[^\d]/g, ""));
      const c = [...tr.querySelectorAll("td")].map((td) => n(td.textContent));
      return c[1] + c[2] + c[3] === c[4];
    }));
    expect(sums.every(Boolean)).toBe(true);
  });

  test("the monthly pattern swaps the deposit field and gives the oracle's value", async ({ page, go }) => {
    await open(page, go);
    await pattern(page, "monthly").check();
    await expect(F.monthly(page)).toBeVisible();
    await expect(F.yearly(page)).toBeHidden();
    await expect(metric(page, "Estimated balance after 16 years")).toHaveText("₹43,80,435");
    await expect(metric(page, "Total deposited")).toHaveText("₹24,00,000");
    await expect(page.locator("#ppf-results .ppf-lead")).toContainText("₹12,500 a month, each by the 5th for 16 financial years");
    await pattern(page, "yearly").check();
    await expect(F.yearly(page)).toBeVisible();
    await expect(F.monthly(page)).toBeHidden();
  });

  test("annual versus monthly for the same total: the displayed difference reconciles with the two displayed balances", async ({ page, go }) => {
    await open(page, go);
    const compare = page.locator("#ppf-results .ppf-compare-grid");
    await expect(compare).toBeVisible();
    await expect(page.locator("#ppf-results .ppf-subtitle")).toHaveText("Annual versus monthly, for the same yearly total");
    const values = await compare.locator(".calculator-results__value").allInnerTexts();
    expect(values).toEqual(["₹45,17,702", "₹43,80,435", "₹1,37,267"]);
    const n = (t) => Number(t.replace(/[^\d]/g, ""));
    expect(n(values[0]) - n(values[1])).toBe(n(values[2])); // the three figures on screen agree (₹1,37,267, not the exact difference rounded alone)
    await expect(page.locator("#ppf-results .ppf-compare-grid + .ppf-note")).toHaveText("Depositing ₹1,50,000 in April each year gives about ₹1,37,267 more after 16 years than depositing ₹12,500 a month, because the money is in the account for more months. These are different deposit schedules, not the same investment, and this is not advice about when to deposit.");
    // 15 years
    await F.years(page).fill("15");
    await expect(compare.locator(".calculator-results__value")).toHaveText(["₹40,68,209", "₹39,44,599", "₹1,23,610"]);
    // never ranked or called equivalent
    const text = await results(page).innerText();
    expect(text).not.toMatch(/\b(better|worse|best|equivalent|identical)\b/i);
  });

  test("the comparison is offered only when the yearly total is a multiple of ₹600", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, { amount: 100000 });
    await expect(page.locator("#ppf-results .ppf-compare-grid")).toHaveCount(0);
    await expect(page.locator("#ppf-results")).toContainText("a multiple of ₹600. This total cannot.");
    await calculate(page, { amount: 148800 });
    await expect(page.locator("#ppf-results .ppf-compare-grid")).toBeVisible();
    await calculate(page, { mode: "monthly", amount: 5000 });
    await expect(page.locator("#ppf-results .ppf-compare-grid")).toBeVisible();
    await expect(page.locator("#ppf-results .ppf-compare-grid .calculator-results__label").first()).toHaveText("₹60,000 in April each year");
    await calculate(page, { amount: 500 });
    await expect(page.locator("#ppf-results .ppf-compare-grid")).toHaveCount(0);
  });

  test("what each year is: before maturity, the first-term end, inside and at the end of an extension block", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["1", /Year 1 is before maturity/, "Before maturity"],
      ["15", /Year 15 is before maturity/, "Before maturity"],
      ["16", /Year 16 is the end of the first term/, "First term ends: earliest full closure"],
      ["17", /Year 17 falls inside an extension block[\s\S]*not a date on which the account can be closed in full/, "Inside an extension block (projection)"],
      ["20", /Year 20 falls inside an extension block/, "Inside an extension block (projection)"],
      ["21", /Year 21 is the end of an extension block[\s\S]*holder's option/, "End of an extension block (if extended)"],
      ["46", /Year 46 is the end of an extension block/, "End of an extension block (if extended)"],
      ["50", /Year 50 falls inside an extension block/, "Inside an extension block (projection)"],
    ];
    for (const [years, sentence, label] of cases) {
      await calculate(page, { amount: 150000, years });
      await expect(kind(page)).toHaveText(sentence);
      await expect(rows(page)).toHaveCount(Number(years));
      await expect(rows(page).last().locator("td").first()).toHaveText(label);
    }
    // the closure points in a 50-year table are exactly 16, 21, 26, 31, 36, 41 and 46
    const closure = await rows(page).evaluateAll((trs) => trs.filter((tr) => /earliest full closure|End of an extension block/.test(tr.querySelector("td").textContent)).map((tr) => tr.querySelector("th").textContent));
    expect(closure).toEqual(["16", "21", "26", "31", "36", "41", "46"]);
    // years after 16 say the rate is unknown
    await expect(kind(page)).toContainText("The rate for these years is unknown");
  });

  test("a rate of 0 is a calculation case: the balance equals the deposits, with the explanation", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, { amount: 150000, rate: "0", years: "16" });
    await expect(metric(page, "Estimated balance after 16 years")).toHaveText("₹24,00,000");
    await expect(metric(page, "Interest earned")).toHaveText("₹0");
    await expect(metric(page, "Interest share of the balance")).toHaveText("0.0%");
    await expect(results(page)).toContainText("At a rate of 0% there is no interest");
    await expect(results(page)).toContainText("this is a calculation case, not a PPF rate");
    await expect(page.locator("#ppf-results .ppf-compare-grid .calculator-results__value").last()).toHaveText("₹0");
    await expect(page.locator("#ppf-results .ppf-compare-grid + .ppf-note")).toContainText("end at the same whole-rupee balance");
  });

  test("the extremes: 15% for 50 years, and the smallest deposits for 1 year", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, { amount: 150000, rate: "15", years: "50" });
    await expect(rows(page)).toHaveCount(50);
    const big = await metric(page, "Estimated balance after 50 years").innerText();
    expect(big).toMatch(/^₹\d{1,3}(,\d{2})*,\d{3}$/);
    expect(Number(big.replace(/[^\d]/g, ""))).toBeGreaterThan(1_200_000_000);
    await calculate(page, { amount: 500, years: "1" });
    await expect(metric(page, "Estimated balance after 1 year")).toHaveText("₹536");
    await expect(rows(page)).toHaveCount(1);
    await calculate(page, { mode: "monthly", amount: 50, years: "1" });
    await expect(metric(page, "Total deposited")).toHaveText("₹600");
  });

  test("validation: specific messages, the fields linked to the error, and the error cleared by a valid calculation", async ({ page, go }) => {
    await open(page, go);
    const error = page.locator("#ppf-error");
    const cases = [
      [{ amount: 499 }, "The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50.", F.yearly],
      [{ amount: 525 }, "The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50.", F.yearly],
      [{ amount: 150050 }, "The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50.", F.yearly],
      [{ amount: 150000, rate: "15.1" }, "The interest rate must be from 0% to 15%, in steps of 0.1.", F.rate],
      [{ amount: 150000, rate: "7.15" }, "The interest rate must be from 0% to 15%, in steps of 0.1.", F.rate],
      [{ amount: 150000, years: "0" }, "The number of years must be a whole number from 1 to 50.", F.years],
      [{ amount: 150000, years: "51" }, "The number of years must be a whole number from 1 to 50.", F.years],
      [{ amount: 150000, years: "16.5" }, "The number of years must be a whole number from 1 to 50.", F.years],
    ];
    for (const [inputs, message, field] of cases) {
      await setInputs(page, inputs);
      await leave(page);
      await expect(error).toBeVisible();
      await expect(error).toContainText(message);
      await expect(field(page)).toHaveAttribute("aria-invalid", "true");
      expect(await field(page).getAttribute("aria-describedby")).toContain("ppf-error");
      await expect(results(page).locator(".ppf-result")).toHaveCount(0);
      await expect(live(page)).toContainText(message);
    }
    await setInputs(page, { mode: "monthly", amount: 12550 });
    await leave(page);
    await expect(error).toContainText("The monthly deposit must be between ₹50 and ₹12,500, in multiples of ₹50");
    // empty fields
    await pattern(page, "yearly").check();
    await F.yearly(page).fill("");
    await F.rate(page).fill("");
    await leave(page);
    await expect(error).toHaveCount(0); // empty fields are a prompt, not an error
    await expect(results(page)).toContainText("Enter the deposit, the interest rate and the number of years");
    // a valid calculation clears the error state completely
    await setInputs(page, { amount: 150000 });
    await expect(page.locator("#ppf-error")).toHaveCount(0);
    for (const f of [F.yearly, F.rate, F.years]) await expect(f(page)).not.toHaveAttribute("aria-invalid", /.+/);
    expect(await F.yearly(page).getAttribute("aria-describedby")).toBe("ppf-yearly-hint");
  });

  test("an edit replaces the result at once (nothing is marked out of date); an invalid edit removes it; the table stays open", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#ppf-stale")).toHaveCount(0);
    await expect(metric(page, "Estimated balance after 16 years")).toHaveText("₹45,17,702");
    await openTable(page);
    await F.rate(page).fill("8");
    await expect(metric(page, "Estimated balance after 16 years")).not.toHaveText("₹45,17,702");
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    await expect(page.locator("#ppf-table-details")).toHaveJSProperty("open", true);
    // an invalid value is not reported while its field has focus, and no old figure is left beside it
    await F.rate(page).fill("15.1");
    await expect(results(page).locator(".ppf-result")).toHaveCount(0);
    await expect(page.locator("#ppf-error")).toHaveCount(0);
    await leave(page);
    await expect(page.locator("#ppf-error")).toContainText("The interest rate must be from 0% to 15%");
    // changing the pattern updates the result too
    await F.rate(page).fill("7.1");
    await pattern(page, "monthly").check();
    await expect(results(page).locator(".ppf-lead")).toContainText("₹12,500 a month, each by the 5th");
  });

  test("typing announces at most once, and an update never moves focus", async ({ page, go }) => {
    await open(page, go);
    await page.evaluate(() => {
      window.__live = [];
      new MutationObserver(() => window.__live.push(document.querySelector("#ppf-live").textContent))
        .observe(document.querySelector("#ppf-live"), { childList: true, characterData: true, subtree: true });
    });
    await F.rate(page).fill("");
    await F.rate(page).pressSequentially("8.5", { delay: 20 });
    await expect(results(page).locator(".ppf-result")).toBeVisible();
    expect(await page.evaluate(() => document.activeElement.id)).toBe("ppf-rate");
    await page.waitForTimeout(900);
    const spoken = await page.evaluate(() => window.__live.filter((t) => t !== ""));
    expect(spoken.length).toBeLessThanOrEqual(1);
    expect(spoken[0]).toMatch(/^Estimated balance after 16 years/);
  });

  test("Reset puts the starting values back, shows the starting result, clears any error, and returns focus to the first field", async ({ page, go }) => {
    await open(page, go);
    await calculate(page, { mode: "monthly", amount: 5000, rate: "9.5", years: "30" });
    await btn(page, "Reset").click();
    await expect(pattern(page, "yearly")).toBeChecked();
    await expect(F.yearly(page)).toHaveValue("150000");
    await expect(F.monthly(page)).toHaveValue("12500");
    await expect(F.rate(page)).toHaveValue("7.1");
    await expect(F.years(page)).toHaveValue("16");
    await expect(metric(page, "Estimated balance after 16 years")).toHaveText("₹45,17,702"); // live: the starting values give the starting result
    await expect(F.yearly(page)).toBeFocused();
    await expect(live(page)).toHaveText("Reset to the starting values.");
    await setInputs(page, { amount: 499 });
    await leave(page);
    await expect(page.locator("#ppf-error")).toBeVisible();
    await btn(page, "Reset").click();
    await expect(page.locator("#ppf-error")).toHaveCount(0);
    await expect(F.yearly(page)).not.toHaveAttribute("aria-invalid", /.+/);
  });

  test("privacy: no request carries the figures, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await calculate(page, { amount: 137650, rate: "8.3", years: "23" });
    await pattern(page, "monthly").check();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of ["137650", "137,650", "8.3"]) expect(logs.some((l) => l.includes(part)), `console ${part}`).toBe(false);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("keyboard and accessibility: the pattern choice by arrow keys, labelled fields, a polite live region, the table region, heading order", async ({ page, go }) => {
    await open(page, go);
    await pattern(page, "yearly").focus();
    await page.keyboard.press("ArrowRight");
    await expect(pattern(page, "monthly")).toBeChecked();
    await expect(F.monthly(page)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(pattern(page, "yearly")).toBeChecked();
    for (const label of ["Yearly Deposit", "Interest Rate (example)", "Financial Years of Deposits"]) await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
    await expect(page.locator("#ppf-live")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#ppf-live")).toHaveAttribute("role", "status");
    await openTable(page);
    const region = page.getByRole("region", { name: /Year-by-year balance/ });
    await expect(region).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Shift"); // keyboard modality, so :focus-visible applies to the programmatic focus
    await region.focus();
    const outline = await region.evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) }; });
    expect(outline.style !== "none" && outline.width > 0).toBe(true);
    await btn(page, "Reset").focus();
    const calcOutline = await btn(page, "Reset").evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
    expect((calcOutline.style !== "none" && calcOutline.width > 0) || calcOutline.shadow !== "none").toBe(true);
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    // the table is a real table with named columns, and the summary is a button-like disclosure
    await expect(page.getByRole("table")).toHaveCount(1);
    await expect(page.locator("#ppf-table-details summary")).toBeVisible();
  });

  test("static explanation: the sources and date, no current-rate claim, the 16-year explanation and the FAQ", async ({ page, go }) => {
    await open(page, go);
    const info = page.locator("main .calculator-info");
    await expect(info.filter({ hasText: "How PPF Interest Works" })).toContainText("lowest balance");
    await expect(info.filter({ hasText: "Maturity and Extension" })).toContainText("31 March 2042");
    await expect(info.filter({ hasText: "What This Calculator Does Not Do" })).toContainText("G.S.R. 915(E), 12 December 2019");
    await expect(info.filter({ hasText: "What This Calculator Does Not Do" })).toContainText("G.S.R. 290(E) of 5 May 2020");
    await expect(info.filter({ hasText: "What This Calculator Does Not Do" })).toContainText("read on 13 October 2026");
    await expect(page.locator("main")).toContainText("Is the 7.1% the current PPF rate?");
    await expect(page.locator("main")).toContainText("Why does it start at 16 years and not 15?");
    expect(await page.locator("main .calculator-info details").count()).toBe(6);
    await expect(page.locator("main")).not.toContainText(/\bSpring\b|\bJenkins\b/);
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`PPF Calculator at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`a 50-year result with the table open fits: no page-level overflow, readable text and 44px targets at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await calculate(page, { amount: 150000, rate: "15", years: "50" });
      await page.locator("#ppf-table-details summary").click(); // folded on a phone: open it
      await expect(rows(page)).toHaveCount(50);
      await expectNoHorizontalOverflow(page);
      const wide = await page.locator("#ppf-results *:not(.calculator-results__table-wrapper *)").evaluateAll((els, w) => els.filter((e) => e.getBoundingClientRect().right > w + 1).map((e) => e.tagName + "." + e.className), width);
      expect(wide).toEqual([]);
      const region = page.getByRole("region", { name: /Year-by-year balance/ });
      expect(await region.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true); // the table scrolls inside its own box
      const sizes = await page.locator("#ppf-results .calculator-results__value, #ppf-results .ppf-lead, #ppf-results .ppf-kind, .ppf-assumptions li").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(13);
      expect(parseFloat(await F.yearly(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      for (const name of ["Reset"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const which of ["yearly", "monthly"]) {
        const box = await pattern(page, which).locator("xpath=..").boundingBox();
        expect(box.height, which).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, which).toBeLessThanOrEqual(width);
      }
      const summary = await page.locator("#ppf-table-details summary").boundingBox();
      expect(summary.height).toBeGreaterThanOrEqual(44);
    });

    test(`the error state, the comparison and the empty state fit at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await setInputs(page, { amount: 499 });
      await leave(page);
      await expect(page.locator("#ppf-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await calculate(page, { amount: 150000 });
      await expect(page.locator("#ppf-results .ppf-compare-grid")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("PPF Calculator with larger text", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("text enlarged to 200%: the form, the result and the table region still fit the page", async ({ page, go }) => {
    await open(page, go);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expectNoHorizontalOverflow(page);
    await calculate(page, { amount: 150000 });
    await expectNoHorizontalOverflow(page);
    for (const name of ["Reset"]) {
      const box = await btn(page, name).boundingBox();
      expect(box.height, name).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width, name).toBeLessThanOrEqual(390);
    }
  });
});

test.describe("PPF Calculator in the Investment listing, search and related tools", () => {
  test("it is a live Investment tool in the category page, All Calculators and All Tools, and not a Coming soon card", async ({ page, go, siteRoot }) => {
    await go("investment.html");
    await expect(page.locator(`a[href$="calculators/ppf/"]`)).toHaveCount(1);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(0);
    await go("calculators.html");
    await expect(page.locator(`#calculators-grid a[href$="calculators/ppf/"]`)).toHaveCount(1);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="calculators/ppf/"]`)).toHaveCount(1);
    await go("developer-tools.html");
    await expect(page.locator(`a[href*="calculators/ppf"]`)).toHaveCount(0);
    await go("time-tools.html");
    await expect(page.locator(`a[href*="calculators/ppf"]`)).toHaveCount(0);
    void siteRoot;
  });

  test("the established automatic Investment relationship: PPF offers SIP, FD and CAGR, and they offer it; only live tools are linked", async ({ page, go, siteRoot }) => {
    await go("calculators/ppf/");
    const hrefs = await page.locator(".related-calculator-card").evaluateAll((l) => l.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/sip/`, `${siteRoot}calculators/fd/`, `${siteRoot}calculators/cagr/`]);
    for (const id of ["sip", "fd", "cagr"]) {
      await go(`calculators/${id}/`);
      expect(await page.locator(".related-calculator-card a, a.related-calculator-card").evaluateAll((l) => l.map((e) => e.getAttribute("href")))).toContain(`${siteRoot}calculators/ppf/`);
    }
    await go("calculators/swp/");
    expect(await page.locator(".related-calculator-card a, a.related-calculator-card").evaluateAll((l) => l.map((e) => e.getAttribute("href")))).not.toContain(`${siteRoot}calculators/ppf/`);
  });

  test("search finds it by its own names", async ({ page, go, siteRoot }) => {
    for (const q of ["ppf calculator", "public provident fund calculator", "ppf maturity calculator", "ppf interest calculator"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}calculators/ppf/']`).first(), q).toBeVisible();
    }
  });

  test("a direct visit and a refresh both load the page, and a refresh forgets edits (nothing is stored)", async ({ page, go }) => {
    await open(page, go);
    await F.rate(page).fill("9");
    await expect(results(page).locator(".ppf-result")).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#ppf-form")).toHaveAttribute("data-ready", "true");
    await expect(results(page).locator(".ppf-result")).toBeVisible();
    await expect(F.rate(page)).toHaveValue("7.1");
    expect(page.url()).toMatch(/\/calculators\/ppf\/$/);
  });
});
