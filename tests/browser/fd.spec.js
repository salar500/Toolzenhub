/**
 * Tool Pack 7 — FD Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/fd-golden.py (Python decimal: the deposit is simulated
 * period by period and the effective yield is grown one period at a time), written here as literals. ToolZen Hub's convention for
 * a broken compounding period (simple interest pro rata) is the model's own and is stated on the page.
 * The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: ₹1,00,000; 7% a year; 5 years 0 months; compounded quarterly; no Option B.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#fd-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = {
  amount: "#fd-amount", rate: "#fd-rate", years: "#fd-years", months: "#fd-months", bRate: "#fd-b-rate", bYears: "#fd-b-years", bMonths: "#fd-b-months",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
const choose = (page, label) => page.locator(`.fd-compounding__option:has(input[value="${label.toLowerCase()}"])`).click();
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/fd/");
  await page.locator("#fd-results .calculator-results__value").first().waitFor();
}
const summary = (page) => page.locator("#fd-results .calculator-results__summary");
const tableRows = (page) => page.locator("#fd-results .calculator-results__table-wrapper tbody tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
// words the page must never use about an offer, a bank or a result
const BANNED = /\b(best|safest|safe|risk-free|recommended|winner|highest[- ]return|better (offer|fd|deposit)|worse (offer|fd|deposit))\b/i;
const unqualified = (text, word) => text.split(/(?<=[.!?])\s+/).filter((s) => new RegExp(word, "i").test(s) && !/\b(not|no|nor|never|isn't|is not)\b/i.test(s));

test.describe("FD Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("FD Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    // Home > Calculators > Investment > FD Calculator, from the shared breadcrumb (not drawn by the tool)
    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("FD Calculator");
    await expect(crumb).toContainText(/investment/i);
    await expect(crumb).not.toContainText(/loans|business/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
    const labels = (await crumb.locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 4)).toEqual(["home", "calculators", "investment", "fd calculator"]);

    await expect(page.getByLabel("Deposit Amount")).toHaveValue("100000");
    await expect(page.getByLabel("Interest Rate", { exact: true })).toHaveValue("7");
    await expect(page.locator(IDS.years)).toHaveValue("5");
    await expect(page.locator(IDS.months)).toHaveValue("0");
    await expect(page.locator("input[name='fd-compounding']:checked")).toHaveValue("quarterly");
    await expect(page.locator(IDS.bRate)).toHaveValue("");
    await expect(page.locator(IDS.bYears)).toHaveValue("");
    await expect(page.locator(IDS.bMonths)).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export/i })).toHaveCount(0);

    await expect(page.locator("#fd-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Maturity amount");
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");
    await expect(metric(page, "Interest earned")).toHaveText("₹41,477.82");
    await expect(metric(page, "Effective annual yield")).toHaveText("7.19%");
    await expect(metric(page, "Total growth over the entered period")).toHaveText("41.48%");
    await expect(page.locator("#fd-results .calculator-results__item")).toHaveCount(4); // the maturity and three supporting cards
    await expect(summary(page)).toContainText("₹1,00,000.00 at a quoted 7% a year for 5 years, with interest added quarterly, matures to ₹1,41,477.82");
    expectClean(watch);
  });

  test("the maturity and three supporting cards sit in a balanced two-by-two block (desktop)", async ({ page, go }) => {
    await open(page, go);
    if (page.viewportSize().width < 700) return; // one column on a phone: nothing to compare
    const boxes = await page.locator("#fd-results .calculator-results__item").evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; }));
    expect(boxes[0].y).toBe(boxes[1].y); // two to a row, no orphan
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[0].w).toBe(boxes[1].w);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount: 200000 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹2,82,955.64");
    await fill(page, { amount: 100000, rate: 8 });
    await expect(metric(page, "Maturity amount")).not.toHaveText("₹1,41,477.82");
    await fill(page, { rate: 7, years: 3, months: 6 });
    await expect(summary(page)).toContainText("for 3 years 6 months");
    await fill(page, { years: 5, months: 0 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");
  });

  test("each compounding choice changes the maturity and the effective yield, never the quoted rate", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["Monthly", "₹1,41,762.53", "₹41,762.53", "7.23%", "41.76%"],
      ["Half-yearly", "₹1,41,059.88", "₹41,059.88", "7.12%", "41.06%"],
      ["Yearly", "₹1,40,255.17", "₹40,255.17", "7.00%", "40.26%"],
      ["Quarterly", "₹1,41,477.82", "₹41,477.82", "7.19%", "41.48%"],
    ];
    for (const [label, maturity, interest, yieldText, growth] of cases) {
      await choose(page, label);
      await expect(metric(page, "Maturity amount"), label).toHaveText(maturity);
      await expect(metric(page, "Interest earned"), label).toHaveText(interest);
      await expect(metric(page, "Effective annual yield"), label).toHaveText(yieldText);
      await expect(metric(page, "Total growth over the entered period"), label).toHaveText(growth);
      await expect(summary(page), label).toContainText(`at a quoted 7% a year`);
      await expect(summary(page), label).toContainText(`interest added ${label.toLowerCase()}`);
    }
  });

  test("the compounding control is a labelled radio group with a tick and a heavier border for the selected choice", async ({ page, go }) => {
    await open(page, go);
    const group = page.getByRole("group", { name: "How Often Interest Is Added" });
    await expect(group.getByRole("radio")).toHaveCount(4);
    await expect(group.getByRole("radio", { name: "Quarterly" })).toBeChecked();
    await choose(page, "Monthly");
    await expect(group.getByRole("radio", { name: "Monthly" })).toBeChecked();
    const style = await page.locator(".fd-compounding__option:has(input[value='monthly'])").locator("span").evaluate((el) => ({ border: getComputedStyle(el).borderTopWidth, tick: getComputedStyle(el, "::before").content }));
    expect(style.border).toBe("2px");
    expect(style.tick).toContain("✓");
    await expect(group).toContainText("Quarterly is only an example");
  });

  test("a broken period earns simple interest pro rata, and says so; an exact period does not", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { years: 1, months: 2 }); // 14 months, quarterly: 4 periods and 2 months
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,08,436.41");
    await expect(metric(page, "Total growth over the entered period")).toHaveText("8.44%");
    await expect(summary(page)).toContainText("not a whole number of quarterly periods");
    await expect(summary(page)).toContainText("simple interest pro rata");
    await expect(summary(page)).toContainText("a bank may treat a broken period differently");

    await choose(page, "Yearly");
    await fill(page, { years: 1, months: 6 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,10,745.00");

    await fill(page, { years: 2, months: 0 }); // exactly two yearly periods
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,14,490.00");
    await expect(summary(page)).not.toContainText("pro rata");
    await fill(page, { years: 1, months: 0 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,07,000.00");
  });

  test("zero interest: the maturity is the deposit, with no interest and no yield", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { rate: 0 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,00,000.00");
    await expect(metric(page, "Interest earned")).toHaveText("₹0.00");
    await expect(metric(page, "Effective annual yield")).toHaveText("0.00%");
    await expect(metric(page, "Total growth over the entered period")).toHaveText("0.00%");
    await expect(summary(page)).toContainText("returned unchanged");
    await expect(page.locator("#fd-results-error")).toHaveCount(0);
  });

  test("the extremes: the smallest and the largest deposit, the shortest and the longest tenure", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount: 1000, years: 0, months: 1 });
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,005.83");
    await fill(page, { amount: 100000000, rate: 20, years: 30, months: 0 });
    await choose(page, "Monthly");
    await expect(metric(page, "Maturity amount")).toHaveText("₹38,39,63,96,323.27");
    await expect(metric(page, "Effective annual yield")).toHaveText("21.94%");
    await expectNoHorizontalOverflow(page);
    await fill(page, { amount: 100000, rate: 7, years: 30, months: 0 });
    await choose(page, "Quarterly");
    await expect(metric(page, "Maturity amount")).toHaveText("₹8,01,918.34");
  });

  test("Option B is hidden by default and appears when its rate is entered", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#fd-results table")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "How the two offers differ" })).toHaveCount(0);
    await fill(page, { bRate: 7.4 });
    await expect(page.getByRole("heading", { name: "How the two offers differ" })).toBeVisible();
    await fill(page, { bRate: "" });
    await expect(page.locator("#fd-results table")).toHaveCount(0);
    // a tenure alone starts nothing
    await fill(page, { bYears: 3 });
    await expect(page.locator("#fd-results table")).toHaveCount(0);
    await expect(page.locator("#fd-results-error")).toHaveCount(0);
  });

  test("same tenure: a blank Option B tenure inherits Option A's, and the difference is stated, not ranked", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bRate: 7.4 });
    await expect(tableRows(page)).toHaveCount(6);
    expect(await cells(tableRows(page).nth(0))).toEqual(["Quoted interest rate", "7% a year", "7.4% a year", "+0.40 points"]);
    expect(await cells(tableRows(page).nth(1))).toEqual(["Tenure", "5 years", "5 years", "Same"]);
    expect(await cells(tableRows(page).nth(2))).toEqual(["Interest added", "quarterly", "quarterly", "Same"]);
    expect(await cells(tableRows(page).nth(3))).toEqual(["Maturity amount", "₹1,41,477.82", "₹1,44,284.83", "+₹2,807.01"]);
    expect(await cells(tableRows(page).nth(4))).toEqual(["Interest earned", "₹41,477.82", "₹44,284.83", "+₹2,807.01"]);
    expect(await cells(tableRows(page).nth(5))).toEqual(["Effective annual yield", "7.19%", "7.61%", "+0.42 points"]);
    const sentence = page.locator("#fd-results .fd-note--plain");
    await expect(sentence).toContainText("Under these inputs, Option B matures to ₹2,807.01 more than Option A, over the same 5 years.");
    await expect(page.locator("#fd-results .fd-note--tenure")).toHaveCount(0); // equal tenures: no warning
    await expect(page.locator("#fd-results")).toContainText("does not rank the offers");
  });

  test("different tenures: a plain-text note says the maturities are not like-for-like", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { rate: 7.1, years: 3, bRate: 6.8, bYears: 5, bMonths: 0 });
    expect(await cells(tableRows(page).nth(0))).toEqual(["Quoted interest rate", "7.1% a year", "6.8% a year", "−0.30 points"]);
    expect(await cells(tableRows(page).nth(1))).toEqual(["Tenure", "3 years", "5 years", "+2 years"]);
    expect(await cells(tableRows(page).nth(3))).toEqual(["Maturity amount", "₹1,23,507.50", "₹1,40,093.85", "+₹16,586.35"]);
    expect(await cells(tableRows(page).nth(5))).toEqual(["Effective annual yield", "7.29%", "6.98%", "−0.32 points"]);
    const note = page.locator("#fd-results .fd-note--tenure");
    await expect(note).toBeVisible();
    await expect(note).toContainText("not a like-for-like comparison");
    await expect(note).toContainText("effective annual yields together with the tenures");
    await expect(page.locator("#fd-results .fd-note--plain")).toContainText("but it runs for 5 years against 3 years");
    // no ranking, in the note, the sentence or the table
    const text = await page.locator("#fd-results").innerText();
    expect(text).not.toMatch(BANNED);
    // correcting the tenure so both match removes the warning
    await fill(page, { bYears: 3 });
    await expect(note).toHaveCount(0);
  });

  test("identical offers differ by nothing, in words", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bRate: 7 });
    await expect(page.locator("#fd-results .fd-note--plain")).toContainText("the same amount as Option A");
    expect(await cells(tableRows(page).nth(3))).toEqual(["Maturity amount", "₹1,41,477.82", "₹1,41,477.82", "₹0.00"]);
  });

  test("Option B accepts a rate of zero and a tenure in months only", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bRate: 0, bYears: 0, bMonths: 6 });
    expect(await cells(tableRows(page).nth(1))).toEqual(["Tenure", "5 years", "6 months", "−4 years 6 months"]);
    expect(await cells(tableRows(page).nth(3))).toEqual(["Maturity amount", "₹1,41,477.82", "₹1,00,000.00", "−₹41,477.82"]);
  });

  test("the comparison table is semantic and accessible; there is no chart", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { bRate: 7.4 });
    const table = page.locator("#fd-results table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(4);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(6);
    await expect(table.locator("thead")).toContainText("Difference (B − A)");
    const region = page.locator("#fd-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /Option A and Option B/);
    await expect(page.locator("#fd-results svg")).toHaveCount(0);
    await expect(page.locator("#fd-results canvas")).toHaveCount(0);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const amount = page.locator(IDS.amount);
    await amount.fill("500");
    const error = page.locator("#fd-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/between ₹1,000 and ₹10 crore/);
    await expect(amount).toHaveAttribute("aria-invalid", "true");
    await expect(amount).toHaveAttribute("aria-describedby", /fd-results-error/);
    await expect(page.locator("#fd-results .calculator-results__value")).toHaveCount(0); // no stale numbers
    await expect(page.locator("#fd-results table")).toHaveCount(0);
    await amount.fill("100000");
    await expect(error).toHaveCount(0);
    await expect(amount).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");

    await fill(page, { amount: 100000001 });
    await expect(error).toContainText(/₹10 crore/);
    await fill(page, { amount: 100000, rate: 20.5 });
    await expect(error).toContainText(/between 0% and 20%/);
    await expect(page.locator(IDS.rate)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { rate: -1 });
    await expect(error).toContainText(/between 0% and 20%/);
    await fill(page, { rate: 7, years: 31, months: 0 });
    await expect(error).toContainText(/at least 1 month and at most 30 years/);
    await expect(page.locator(IDS.years)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(IDS.months)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { years: 0, months: 0 });
    await expect(error).toContainText(/at least 1 month/);
    await fill(page, { years: 2, months: 12 });
    await expect(error).toContainText(/months from 0 to 11/);
    await fill(page, { years: 5, months: 0, bRate: 25 });
    await expect(error).toContainText(/Option B/);
    await expect(page.locator(IDS.bRate)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { bRate: 6, bYears: 31 });
    await expect(page.locator(IDS.bYears)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { bRate: "", bYears: "" });
    await expect(error).toHaveCount(0);
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");
  });

  test("an emptied required field shows the prompt; the Option B fields do not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.amount).fill("");
    await expect(page.locator("#fd-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#fd-results-error")).toHaveCount(0);
    await page.locator(IDS.amount).fill("100000");
    await fill(page, { years: "", months: "" });
    await expect(page.locator("#fd-results .calculator-results__empty")).toBeVisible();
    await fill(page, { years: 5, months: "" }); // one part empty counts as 0
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");
    await fill(page, { bRate: "", bYears: "", bMonths: "" });
    await expect(page.locator("#fd-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default and clears Option B", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount: 55555, rate: 9, years: 2, months: 3, bRate: 8, bYears: 4, bMonths: 1 });
    await choose(page, "Monthly");
    await expect(page.locator("#fd-results table")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [[IDS.amount, "100000"], [IDS.rate, "7"], [IDS.years, "5"], [IDS.months, "0"], [IDS.bRate, ""], [IDS.bYears, ""], [IDS.bMonths, ""]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(page.locator("input[name='fd-compounding']:checked")).toHaveValue("quarterly");
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,477.82");
    await expect(page.locator("#fd-results table")).toHaveCount(0);
  });

  test("keyboard: every field is reachable in order, the radio group uses the arrow keys, and Reset works", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.amount).focus();
    for (const id of [IDS.rate, IDS.years, IDS.months]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(id)).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(page.locator("input[name='fd-compounding']:checked")).toBeFocused();
    await page.keyboard.press("ArrowRight"); // quarterly -> half-yearly
    await expect(page.locator("input[name='fd-compounding']:checked")).toHaveValue("half-yearly");
    await expect(metric(page, "Maturity amount")).toHaveText("₹1,41,059.88");
    await page.keyboard.press("Tab");
    for (const id of [IDS.bRate, IDS.bYears, IDS.bMonths]) {
      await expect(page.locator(id)).toBeFocused();
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: "Reset" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("input[name='fd-compounding']:checked")).toHaveValue("quarterly");
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
    const live = page.locator("#fd-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await fill(page, { amount: 200000 });
    await expect(live).toContainText("Maturity ₹2,82,955.64; interest ₹82,955.64; effective annual yield 7.19%.");
    const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the defaults are labelled as examples, and the trust note and exclusions sit next to the result", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#fd-rate-hint")).toContainText("7% is only an example");
    await expect(page.locator("#fd-compounding-hint")).toContainText("Quarterly is only an example");
    const trust = page.locator("#fd-results .fd-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("Your numbers, under stated assumptions");
    for (const word of ["stay the same", "stay in the deposit", "simple interest pro rata", "own convention", "not a rule every bank follows", "compounding dates", "day-count conventions", "rounding", "product terms", "not a bank's quote", "guaranteed amount", "tax and TDS", "premature withdrawal", "payout", "deposit insurance", "future rate changes"]) {
      await expect(trust, word).toContainText(new RegExp(word.replace(/ /g, "\\s+"), "i"));
    }
  });

  test("effective annual yield and total growth are explained and kept apart from the quoted rate", async ({ page, go }) => {
    await open(page, go);
    await expect(summary(page)).toContainText("what one year grows to under quarterly compounding");
    await expect(summary(page)).toContainText("The total growth is for the whole 5 years, not a yearly rate");
    const info = page.locator(".calculator-info");
    await expect(info.filter({ hasText: "Reading the Result" })).toContainText("not the growth over the whole tenure or the CAGR of another investment");
  });

  test("no ranking, safety, guarantee or recommendation wording anywhere on the page", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { rate: 7.1, years: 3, bRate: 6.8, bYears: 5 });
    const text = await page.locator(".calculator-page").innerText();
    expect(text).not.toMatch(BANNED);
    // the only mentions of "guarantee" deny it
    expect(unqualified(text, "guarantee")).toEqual([]);
    expect(unqualified(text, "bank'?s? (quote|rate)")).toEqual([]);
    expect(text).not.toMatch(/current (market )?rate|best fd|highest fd/i);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    const info = page.locator(".calculator-info");
    for (const heading of ["How to Use the FD Calculator", "Reading the Result", "Assumptions and What Is Not Included", "Example", "How It Is Calculated", "FD Calculator FAQ"]) {
      await expect(info.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(info.filter({ hasText: "Example" }).first()).toContainText("₹1,41,477.82");
    await expect(info.filter({ hasText: "Assumptions and What Is Not Included" })).toContainText("Actual FD maturity may differ");
    await expect(page.locator("details")).toHaveCount(5);
  });

  test("related: SIP is the only live related calculator; Coming soon CAGR and PPF are not offered as usable", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/sip/`]);
    await expect(page.locator("a[href*='calculators/cagr'], a[href*='calculators/ppf']")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["fd", "fd calculator", "fixed deposit calculator", "fd maturity calculator", "fd comparison"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/fd/']`), query).toHaveCount(1);
    }
    // aliases promise no rates, no banks and no ranking
    for (const query of ["best fd", "highest fd rate", "bank fd rates"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/fd/']`), query).toHaveCount(0);
    }
  });

  test("responsive: no horizontal overflow with Option B and the table open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { years: 3, months: 6, bRate: 7.4, bYears: 5 });
    await expect(page.locator("#fd-results .fd-note--tenure")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    expect(reset.x + reset.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const id of Object.values(IDS)) {
      const box = await page.locator(id).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    }
    for (const radio of await page.locator(".fd-compounding__option span").all()) {
      expect((await radio.boundingBox()).height).toBeGreaterThanOrEqual(36);
    }
  });
});
