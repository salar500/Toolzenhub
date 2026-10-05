/**
 * Tool Pack 9 — CAGR Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/cagr-golden.py (Python decimal: the growth rate is found by
 * bisection on integer powers and cross-checked with ln / exp; percentages are rounded half up), written here as literals.
 * The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: Looking back; ₹1,00,000 to ₹1,80,000; 5 years 0 months; no Investment B.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#cagr-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = {
  start: "#cagr-start", end: "#cagr-end", years: "#cagr-years", months: "#cagr-months",
  bEnd: "#cagr-b-end", bStart: "#cagr-b-start", bYears: "#cagr-b-years", bMonths: "#cagr-b-months",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
const mode = (page, value) => page.locator(`.cagr-mode__option:has(input[value="${value}"])`).click();
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/cagr/");
  await page.locator("#cagr-results .calculator-results__value").first().waitFor();
}
const summary = (page) => page.locator("#cagr-results .calculator-results__summary");
const tableRows = (page) => page.locator("#cagr-results .calculator-results__table-wrapper tbody tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
// words the page must never use about a rate, a result or an investment
const BANNED = /\b(expected return|good return|bad return|beats? the market|you will earn|likely return|best investment|safe|guaranteed|should earn)\b/i;
const unqualified = (text, word) => text.split(/(?<=[.!?])\s+/).filter((s) => new RegExp(word, "i").test(s) && !/\b(not|no|nor|never|does not|doesn't)\b/i.test(s));

test.describe("CAGR Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("CAGR Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    // Home > Calculators > Investment > CAGR Calculator, from the shared breadcrumb (not drawn by the tool)
    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("CAGR Calculator");
    await expect(crumb).toContainText(/investment/i);
    await expect(crumb).not.toContainText(/loans|business|tax/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
    const labels = (await crumb.locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 4)).toEqual(["home", "calculators", "investment", "cagr calculator"]);

    await expect(page.locator("input[name='cagr-mode']:checked")).toHaveValue("back");
    await expect(page.locator(IDS.start)).toHaveValue("100000");
    await expect(page.locator(IDS.end)).toHaveValue("180000");
    await expect(page.locator(IDS.years)).toHaveValue("5");
    await expect(page.locator(IDS.months)).toHaveValue("0");
    for (const k of ["bEnd", "bStart", "bYears", "bMonths"]) await expect(page.locator(IDS[k])).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export|download/i })).toHaveCount(0);

    await expect(page.locator("#cagr-results .calculator-results__item--primary .calculator-results__label")).toHaveText("CAGR");
    await expect(metric(page, "CAGR")).toHaveText("12.47%");
    await expect(metric(page, "Total growth")).toHaveText("80.00%");
    await expect(metric(page, "Growth multiple")).toHaveText("1.80×");
    await expect(metric(page, "Simple yearly average")).toHaveText("16.00%");
    await expect(page.locator("#cagr-results .calculator-results__item")).toHaveCount(4);
    await expect(summary(page)).toContainText("₹1,00,000 growing to ₹1,80,000 over 5 years corresponds to a CAGR of about 12.47%.");
    await expect(summary(page)).toContainText("Total growth is 80.00%. Dividing that by 5 years gives 16.00% (the simple yearly average), which does not account for compounding");
    await expect(page.locator("#cagr-results table")).toHaveCount(0); // no second case: no table
    expectClean(watch);
  });

  test("the CAGR and three supporting cards sit in a balanced two-by-two block (desktop)", async ({ page, go }) => {
    await open(page, go);
    if (page.viewportSize().width < 700) return; // one column on a phone: nothing to compare
    const boxes = await page.locator("#cagr-results .calculator-results__item").evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; }));
    expect(boxes[0].y).toBe(boxes[1].y); // two to a row, no orphan
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[0].w).toBe(boxes[1].w);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 240000 });
    await expect(metric(page, "CAGR")).toHaveText("19.14%");
    await fill(page, { years: 9 });
    await expect(metric(page, "CAGR")).toHaveText("10.22%");
    await expect(metric(page, "Total growth")).toHaveText("140.00%");
    await fill(page, { start: 200000 });
    await expect(metric(page, "Growth multiple")).toHaveText("1.20×");
  });

  test("an exactly representable result is exact: 100 to 121 over 2 years is 10.00%", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: 100, end: 121, years: 2 });
    await expect(metric(page, "CAGR")).toHaveText("10.00%");
    await expect(metric(page, "Total growth")).toHaveText("21.00%");
    await expect(metric(page, "Simple yearly average")).toHaveText("10.50%");
  });

  test("no change is 0.00%, never a signed zero", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 100000 });
    await expect(metric(page, "CAGR")).toHaveText("0.00%");
    await expect(metric(page, "Total growth")).toHaveText("0.00%");
    await expect(metric(page, "Growth multiple")).toHaveText("1.00×");
    await expect(summary(page)).toContainText("staying at ₹1,00,000 over 5 years corresponds to a CAGR of 0.00%");
    await expect(page.locator("#cagr-results")).not.toContainText("−0.00");
  });

  test("a loss is a negative CAGR with its sign: ₹1,00,000 to ₹50,000 over 3 years is −20.63%", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 50000, years: 3 });
    await expect(metric(page, "CAGR")).toHaveText("−20.63%");
    await expect(metric(page, "Total growth")).toHaveText("−50.00%");
    await expect(metric(page, "Growth multiple")).toHaveText("0.50×");
    await expect(metric(page, "Simple yearly average")).toHaveText("−16.67%");
    await expect(summary(page)).toContainText("falling to ₹50,000 over 3 years");
  });

  test("a period with months: 3 years 6 months to ₹1,50,000 is 12.28%, and the divisor is 3.5 years", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 150000, years: 3, months: 6 });
    await expect(metric(page, "CAGR")).toHaveText("12.28%");
    await expect(metric(page, "Simple yearly average")).toHaveText("14.29%");
    await expect(summary(page)).toContainText("over 3 years 6 months");
    await expect(summary(page)).toContainText("Dividing that by 3.5 years");
  });

  test("an exact half-up tie: ₹1,00,000 to ₹1,00,125 in a year is 0.125% and shows 0.13%", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 100125, years: 1 });
    await expect(metric(page, "CAGR")).toHaveText("0.13%");
    await fill(page, { end: 99875 });
    await expect(metric(page, "CAGR")).toHaveText("−0.13%");
  });

  test("the extremes: the shortest and longest period, and the largest and smallest allowed ratio", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: 101000, years: 1 });
    await expect(metric(page, "CAGR")).toHaveText("1.00%");
    await fill(page, { start: 100, end: 100000, years: 1 });
    await expect(metric(page, "CAGR")).toHaveText("99900.00%");
    await fill(page, { start: 100000, end: 100, years: 1 });
    await expect(metric(page, "CAGR")).toHaveText("−99.90%");
    await fill(page, { start: 100000, end: 100001, years: 50 });
    await expect(metric(page, "CAGR")).toHaveText("0.00%");
    await expectNoHorizontalOverflow(page);
  });

  test("Looking ahead: the required CAGR, with target wording and no forecast language", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "ahead");
    await expect(page.getByLabel("Target Value", { exact: true })).toBeVisible();
    await fill(page, { start: 500000, end: 10000000, years: 15 });
    await expect(page.locator("#cagr-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Required CAGR");
    await expect(metric(page, "Required CAGR")).toHaveText("22.11%");
    await expect(metric(page, "Growth multiple")).toHaveText("20.00×");
    await expect(summary(page)).toContainText("To grow ₹5,00,000 to ₹1,00,00,000 over 15 years, the mathematical CAGR required is about 22.11%");
    await expect(summary(page)).toContainText("it says nothing about whether it will happen");
    await expect(page.locator("#cagr-end-hint")).toContainText("The value you want to reach");
    await mode(page, "back");
    await expect(page.getByLabel("Ending Value", { exact: true })).toBeVisible();
    await expect(page.locator(IDS.end)).toHaveValue("10000000"); // what was typed is kept
    await expect(page.locator("#cagr-results .calculator-results__item--primary .calculator-results__label")).toHaveText("CAGR");
  });

  test("Investment B is hidden by default and appears when its ending value is entered", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#cagr-results table")).toHaveCount(0);
    await fill(page, { bEnd: 240000 });
    await expect(page.getByRole("heading", { name: "How the two cases compare" })).toBeVisible();
    await fill(page, { bEnd: "" });
    await expect(page.locator("#cagr-results table")).toHaveCount(0);
    // the other Case B fields alone start nothing and raise no error, whatever they hold
    await fill(page, { bStart: -5, bYears: 99, bMonths: 40 });
    await expect(page.locator("#cagr-results table")).toHaveCount(0);
    await expect(page.locator("#cagr-results-error")).toHaveCount(0);
    await expect(metric(page, "CAGR")).toHaveText("12.47%");
  });

  test("two cases, different periods: the table states the differences and that the periods differ", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 240000, bYears: 9, bMonths: 0 });
    await expect(tableRows(page)).toHaveCount(7);
    expect(await cells(tableRows(page).nth(0))).toEqual(["Starting value", "₹1,00,000", "₹1,00,000", "₹0"]); // B's start was blank: the first case's
    expect(await cells(tableRows(page).nth(1))).toEqual(["Ending value", "₹1,80,000", "₹2,40,000", "+₹60,000"]);
    expect(await cells(tableRows(page).nth(2))).toEqual(["Period", "5 years", "9 years", "+4 years"]);
    expect(await cells(tableRows(page).nth(3))).toEqual(["Total growth", "80.00%", "140.00%", "+60.00 points"]);
    expect(await cells(tableRows(page).nth(4))).toEqual(["Growth multiple", "1.80×", "2.40×", "+0.60×"]);
    expect(await cells(tableRows(page).nth(5))).toEqual(["Simple yearly average", "16.00%", "15.56%", "−0.44 points"]);
    expect(await cells(tableRows(page).nth(6))).toEqual(["CAGR", "12.47%", "10.22%", "−2.26 points"]);
    const note = page.locator("#cagr-results .cagr-note--period");
    await expect(note).toBeVisible();
    await expect(note).toContainText("The periods differ");
    await expect(note).toContainText("nothing about what either did outside its own period");
    await expect(page.locator("#cagr-results")).toContainText("does not rank the two cases or say which is the better investment");
    const text = await page.locator("#cagr-results").innerText();
    expect(text).not.toMatch(BANNED);
  });

  test("a blank Investment B period is the first case's: no period note", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 240000 });
    expect(await cells(tableRows(page).nth(2))).toEqual(["Period", "5 years", "5 years", "Same"]);
    expect(await cells(tableRows(page).nth(6))).toEqual(["CAGR", "12.47%", "19.14%", "+6.66 points"]);
    await expect(page.locator("#cagr-results .cagr-note--period")).toHaveCount(0);
  });

  test("Investment B with its own starting value", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 400000, bStart: 250000, bYears: 7, bMonths: 0 });
    expect(await cells(tableRows(page).nth(0))).toEqual(["Starting value", "₹1,00,000", "₹2,50,000", "+₹1,50,000"]);
    expect(await cells(tableRows(page).nth(6))).toEqual(["CAGR", "12.47%", "6.94%", "−5.53 points"]);
  });

  test("identical cases differ by nothing, in words", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 180000 });
    expect(await cells(tableRows(page).nth(6))).toEqual(["CAGR", "12.47%", "12.47%", "0.00 points"]);
    expect(await cells(tableRows(page).nth(4))).toEqual(["Growth multiple", "1.80×", "1.80×", "0.00×"]);
  });

  test("Looking ahead table wording says Target value", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "ahead");
    await fill(page, { bEnd: 240000 });
    expect(await cells(tableRows(page).nth(1))).toEqual(["Target value", "₹1,80,000", "₹2,40,000", "+₹60,000"]);
    expect(await cells(tableRows(page).nth(6)).then((c) => c[0])).toBe("Required CAGR");
  });

  test("the comparison table is semantic and accessible; there is no chart", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 240000, bYears: 9 });
    const table = page.locator("#cagr-results table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(4);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(7);
    await expect(table.locator("thead")).toContainText("Difference (B − A)");
    const region = page.locator("#cagr-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /Investment A and Investment B/);
    await expect(page.locator("#cagr-results svg")).toHaveCount(0);
    await expect(page.locator("#cagr-results canvas")).toHaveCount(0);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const start = page.locator(IDS.start);
    await start.fill("0");
    const error = page.locator("#cagr-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/between ₹0.01 and ₹99,99,99,999.99/);
    await expect(start).toHaveAttribute("aria-invalid", "true");
    await expect(start).toHaveAttribute("aria-describedby", /cagr-results-error/);
    await expect(page.locator("#cagr-results .calculator-results__value")).toHaveCount(0); // no stale numbers
    await expect(page.locator("#cagr-results table")).toHaveCount(0);
    await start.fill("100000");
    await expect(error).toHaveCount(0);
    await expect(start).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "CAGR")).toHaveText("12.47%");

    await fill(page, { start: 100, end: "100000.01" });
    await expect(error).toContainText(/between 1\/1,000 and 1,000 times the starting value/);
    await expect(page.locator(IDS.end)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { end: 100000 }); // exactly 1,000 times: valid
    await expect(error).toHaveCount(0);
    await fill(page, { start: 100000, end: "99.99" });
    await expect(error).toContainText(/between 1\/1,000 and 1,000 times/);
    await fill(page, { end: "100" }); // exactly 1/1,000: valid
    await expect(error).toHaveCount(0);
    await fill(page, { end: "180000.005" });
    await expect(error).toContainText(/at most two decimals/);
    await fill(page, { end: -5 });
    await expect(error).toBeVisible();
    await fill(page, { end: 180000, years: 0, months: 11 });
    await expect(error).toContainText(/at least 1 year and at most 50 years/);
    await expect(page.locator(IDS.years)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(IDS.months)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { years: 51, months: 0 });
    await expect(error).toContainText(/at most 50 years/);
    await fill(page, { years: 50, months: 0 }); // the longest allowed period
    await expect(error).toHaveCount(0);
    await fill(page, { years: 1, months: 0 }); // the shortest allowed period
    await expect(error).toHaveCount(0);
    await fill(page, { years: 2, months: 12 });
    await expect(error).toContainText(/months from 0 to 11/);
    await fill(page, { years: 5, months: 0, bEnd: 0 });
    await expect(error).toContainText(/Investment B/);
    await expect(page.locator(IDS.bEnd)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { bEnd: 240000, bYears: 0, bMonths: 6 });
    await expect(page.locator(IDS.bYears)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { bEnd: "", bYears: "", bMonths: "" });
    await expect(error).toHaveCount(0);
    await expect(metric(page, "CAGR")).toHaveText("12.47%");
  });

  test("an emptied required field shows the prompt; the Investment B fields do not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.start).fill("");
    await expect(page.locator("#cagr-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#cagr-results-error")).toHaveCount(0);
    await page.locator(IDS.start).fill("100000");
    await fill(page, { years: "", months: "" });
    await expect(page.locator("#cagr-results .calculator-results__empty")).toBeVisible();
    await fill(page, { years: 5, months: "" }); // one part empty counts as 0
    await expect(metric(page, "CAGR")).toHaveText("12.47%");
    await fill(page, { bEnd: "", bStart: "", bYears: "", bMonths: "" });
    await expect(page.locator("#cagr-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default, Looking back, and clears Investment B", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "ahead");
    await fill(page, { start: 55555, end: 99999, years: 7, months: 3, bEnd: 120000, bStart: 60000, bYears: 4, bMonths: 1 });
    await expect(page.locator("#cagr-results table")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("input[name='cagr-mode']:checked")).toHaveValue("back");
    for (const [k, v] of [["start", "100000"], ["end", "180000"], ["years", "5"], ["months", "0"], ["bEnd", ""], ["bStart", ""], ["bYears", ""], ["bMonths", ""]]) {
      await expect(page.locator(IDS[k])).toHaveValue(v);
    }
    await expect(page.getByLabel("Ending Value", { exact: true })).toBeVisible(); // the label returns with the mode
    await expect(metric(page, "CAGR")).toHaveText("12.47%");
    await expect(page.locator("#cagr-results table")).toHaveCount(0);
  });

  test("keyboard: the mode uses the arrow keys, every field follows in order, and Reset works", async ({ page, go }) => {
    await open(page, go);
    await page.locator("input[name='cagr-mode']:checked").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("input[name='cagr-mode']:checked")).toHaveValue("ahead");
    await expect(page.getByRole("group", { name: "What You Know" }).getByRole("radio", { name: "Looking ahead" })).toBeChecked();
    await page.keyboard.press("Tab");
    for (const sel of [IDS.start, IDS.end, IDS.years, IDS.months, IDS.bEnd, IDS.bStart, IDS.bYears, IDS.bMonths]) {
      await expect(page.locator(sel)).toBeFocused();
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: "Reset" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("input[name='cagr-mode']:checked")).toHaveValue("back");
    const outline = await page.getByRole("button", { name: "Reset" }).evaluate((el) => { el.focus(); return getComputedStyle(el).outlineStyle; });
    expect(outline).not.toBe("none");
  });

  test("the mode is a labelled radio group with a tick and a heavier border", async ({ page, go }) => {
    await open(page, go);
    const group = page.getByRole("group", { name: "What You Know" });
    await expect(group.getByRole("radio")).toHaveCount(2);
    await expect(group).toContainText("Looking back: you know the ending value. Looking ahead: you want to reach a target value.");
    const style = await page.locator(".cagr-mode__option:has(input[value='back']) span").evaluate((el) => ({ border: getComputedStyle(el).borderTopWidth, tick: getComputedStyle(el, "::before").content }));
    expect(style.border).toBe("2px");
    expect(style.tick).toContain("✓");
    for (const name of ["Period", "Investment B Period (optional)"]) await expect(page.getByRole("group", { name, exact: true })).toHaveCount(1);
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
    const live = page.locator("#cagr-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await fill(page, { end: 240000 });
    await expect(live).toContainText("CAGR 19.14%; total growth 140.00%.");
    const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the trust note and exclusions sit next to the result", async ({ page, go }) => {
    await open(page, go);
    const trust = page.locator("#cagr-results .cagr-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("Two values and a period, nothing more");
    for (const word of ["one starting value and one ending value", "no money added or withdrawn", "constant yearly rate", "year-by-year path", "past CAGR does not mean", "regular investing", "SIP is not a lump sum", "XIRR", "fees", "tax", "inflation", "dividends", "not a forecast or advice"]) {
      await expect(trust, word).toContainText(new RegExp(word.replace(/ /g, "\\s+"), "i"));
    }
  });

  test("the simple yearly average means total growth divided by the years, and nothing else", async ({ page, go }) => {
    await open(page, go);
    const info = page.locator(".calculator-info");
    await expect(info.filter({ hasText: "Reading the Result" })).toContainText("total growth divided by the number of years, nothing more");
    await expect(info.filter({ hasText: "How It Is Calculated" })).toContainText("Simple yearly average = total growth ÷ years");
    const text = await page.locator(".calculator-page").innerText();
    expect(text).not.toMatch(/arithmetic mean|mean of (the )?yearly|average of (the )?yearly|average annual return|\+100%|−50% /i);
  });

  test("no forecast, recommendation, ranking or achievability wording anywhere on the page", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "ahead");
    await fill(page, { bEnd: 240000, bYears: 9 });
    const text = await page.locator(".calculator-page").innerText();
    expect(text).not.toMatch(BANNED);
    expect(unqualified(text, "achievable")).toEqual([]);
    expect(unqualified(text, "forecast")).toEqual([]);
    expect(unqualified(text, "likely")).toEqual([]);
    expect(text).not.toMatch(/xirr (calculator|result)|fund|stock|mutual|index fund|nifty|sensex/i);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    const info = page.locator(".calculator-info");
    for (const heading of ["How to Use the CAGR Calculator", "Reading the Result", "Assumptions and What Is Not Included", "Example", "How It Is Calculated", "CAGR Calculator FAQ"]) {
      await expect(info.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(info.filter({ hasText: "Example" }).first()).toContainText("12.47%");
    await expect(page.locator("details")).toHaveCount(5);
  });

  test("related: SIP and FD are offered; Coming soon PPF is not", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs.sort()).toEqual([`${siteRoot}calculators/fd/`, `${siteRoot}calculators/sip/`]);
    await expect(page.locator("a[href*='calculators/ppf']")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases, not by XIRR or returns", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["cagr", "cagr calculator", "compound annual growth rate", "annualized return calculator", "required cagr", "cagr comparison"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/cagr/']`), query).toHaveCount(1);
    }
    for (const query of ["xirr", "best returns", "sip returns"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/cagr/']`), query).toHaveCount(0);
    }
  });

  test("responsive: no horizontal overflow with both cases and the table open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bEnd: 240000, bStart: 150000, bYears: 9, bMonths: 6 });
    await expect(tableRows(page)).toHaveCount(7);
    await expectNoHorizontalOverflow(page);
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    expect(reset.x + reset.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const sel of Object.values(IDS)) {
      const box = await page.locator(sel).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    }
    for (const radio of await page.locator(".cagr-mode__option span").all()) {
      expect((await radio.boundingBox()).height).toBeGreaterThanOrEqual(36);
    }
  });
});
