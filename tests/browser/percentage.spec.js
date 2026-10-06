/**
 * Tool Pack 10 — Percentage Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/percentage-golden.py (Python Fraction: exact rationals, half up,
 * a tie away from zero), written here as literals. The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default (Reset) state: Starting value 2,000; Percentage change 20; Ending value blank; second change blank. It solves the ending value.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#percentage-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = { start: "#percentage-start", change: "#percentage-change", end: "#percentage-end", second: "#percentage-second" };
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/percentage/");
  await page.locator("#percentage-results .calculator-results__value").first().waitFor();
}
const results = (page) => page.locator("#percentage-results");
const primary = (page) => page.locator("#percentage-results .calculator-results__item--primary");
const note = (page) => page.locator("#percentage-form-note");
// words the page must never use about a change or a result
const BANNED = /\b(good|fair|fairly|worth it|expected|save|saving|savings|best)\b/i;

test.describe("Percentage Calculator", () => {
  test("page, breadcrumb, form shell and the default solve (Ending value)", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Percentage Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    // Home > Calculators > math > Percentage Calculator, from the shared breadcrumb (not drawn by the tool)
    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("Percentage Calculator");
    await expect(crumb).toContainText(/math/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
    const labels = (await crumb.locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 4)).toEqual(["home", "calculators", "math", "percentage calculator"]);

    await expect(page.locator(IDS.start)).toHaveValue("2000");
    await expect(page.locator(IDS.change)).toHaveValue("20");
    await expect(page.locator(IDS.end)).toHaveValue(""); // the blank field stays blank: the answer is never written into it
    await expect(page.locator(IDS.second)).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export|download/i })).toHaveCount(0);
    await expect(page.locator("input[type=radio]")).toHaveCount(0); // no mode picker
    await expect(page.locator("#percentage-results table")).toHaveCount(0);

    await expect(primary(page).locator(".calculator-results__label")).toHaveText("Ending value");
    await expect(metric(page, "Ending value")).toHaveText("2,400.00");
    await expect(metric(page, "Change amount")).toHaveText("+400.00");
    await expect(metric(page, "Change that undoes it")).toHaveText("−16.67%");
    await expect(metric(page, "Ending value as a percentage of the starting value")).toHaveText("120.00%");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(4);
    await expect(results(page)).toContainText("2,000.00 increased by 20.00% gives 2,400.00. The 20.00% is calculated from the starting value.");
    await expect(results(page)).toContainText("2,000.00 × (100 + 20.00) ÷ 100 = 2,400.00");
    await expect(note(page)).toBeHidden();
    await expect(page.locator(IDS.second)).toBeEnabled(); // solved: the second change is available
    expectClean(watch);
  });

  test("Start + Change solve the Ending value; Start + End solve the Change; Change + End solve the Starting value", async ({ page, go }) => {
    await open(page, go);
    // Start + End: change
    await fill(page, { change: "", end: "2400" });
    await expect(primary(page).locator(".calculator-results__label")).toHaveText("Percentage change");
    await expect(metric(page, "Percentage change")).toHaveText("+20.00%");
    await expect(metric(page, "Change that undoes it")).toHaveText("−16.67%");
    await expect(page.locator(IDS.change)).toHaveValue("");
    // Change + End: start
    await fill(page, { start: "", change: "20" });
    await expect(primary(page).locator(".calculator-results__label")).toHaveText("Starting value");
    await expect(metric(page, "Starting value")).toHaveText("2,000.00");
    await expect(page.locator(IDS.start)).toHaveValue("");
    await expect(results(page)).toContainText("2,400.00 after a 20.00% increase came from a starting value of 2,000.00");
    await expect(results(page)).toContainText("not by subtracting 20.00%");
    // Start + Change: end
    await fill(page, { start: "2000", end: "" });
    await expect(primary(page).locator(".calculator-results__label")).toHaveText("Ending value");
    await expect(page.locator(IDS.end)).toHaveValue("");
  });

  test("fewer than two values is neutral guidance, not an error, and marks no field invalid", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "", change: "" });
    await expect(results(page)).toContainText("Fill in any two of the three to work out the third.");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(0);
    await expect(page.locator("#percentage-results .calculator-results__error")).toHaveCount(0);
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await fill(page, { start: "2000" });
    await expect(results(page)).toContainText("Fill in any two of the three to work out the third.");
    await expect(page.locator(IDS.second)).toBeDisabled(); // nothing solved: the second change is inactive
    await expect(page.locator("#percentage-second-hint")).toHaveText("Fill in two of the values above first.");
  });

  test("all three filled: nothing is calculated or guessed, no field is overwritten; clearing one solves that one", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: "2400" });
    await expect(note(page)).toBeVisible();
    await expect(note(page)).toHaveText("Clear one field to work it out.");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(0);
    await expect(page.locator("#percentage-results .calculator-results__error")).toHaveCount(0);
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await expect(page.locator(IDS.start)).toHaveValue("2000");
    await expect(page.locator(IDS.change)).toHaveValue("20");
    await expect(page.locator(IDS.end)).toHaveValue("2400");
    await expect(page.locator(IDS.second)).toBeDisabled();
    // even values that disagree are not resolved
    await fill(page, { end: "5000" });
    await expect(note(page)).toBeVisible();
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(0);
    await fill(page, { end: "2400" });
    // clearing Start solves Start, and Start stays blank
    await fill(page, { start: "" });
    await expect(note(page)).toBeHidden();
    await expect(metric(page, "Starting value")).toHaveText("2,000.00");
    await expect(page.locator(IDS.start)).toHaveValue("");
    // typing into the blank field returns to the all-three state
    await fill(page, { start: "2000" });
    await expect(note(page)).toBeVisible();
    // clearing Change, then End
    await fill(page, { change: "" });
    await expect(metric(page, "Percentage change")).toHaveText("+20.00%");
    await fill(page, { change: "20", end: "" });
    await expect(metric(page, "Ending value")).toHaveText("2,400.00");
  });

  test("half-typed values are not errors while typing; a sign alone does not count as filled", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { end: "" });
    const change = page.locator(IDS.change);
    for (const partial of ["-", "-0.", "1.", "+", "."]) {
      await change.fill(partial);
      await change.focus();
      await expect(page.locator("[aria-invalid='true']"), partial).toHaveCount(0);
      await expect(page.locator("#percentage-results .calculator-results__error"), partial).toHaveCount(0);
      await expect(results(page), partial).toContainText("Fill in any two of the three to work out the third.");
    }
    // typed one key at a time into an empty field: "-", "-2", "-20" never errors on the way
    await change.fill("");
    await change.pressSequentially("-20");
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await expect(metric(page, "Ending value")).toHaveText("1,600.00");
    await expect(metric(page, "Change that undoes it")).toHaveText("+25.00%");
  });

  test("a half-typed value is judged when the visitor leaves the field", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.change).fill("-");
    await page.locator(IDS.start).focus();
    await expect(page.locator(IDS.change)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#percentage-results .calculator-results__error")).toContainText("Percentage change: Enter a complete number");
  });

  test("Reset restores the example, clears the second change and never leaves all three filled", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "500", change: "-5", end: "900" });
    await expect(note(page)).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator(IDS.start)).toHaveValue("2000");
    await expect(page.locator(IDS.change)).toHaveValue("20");
    await expect(page.locator(IDS.end)).toHaveValue("");
    await expect(page.locator(IDS.second)).toHaveValue("");
    await expect(note(page)).toBeHidden();
    await expect(metric(page, "Ending value")).toHaveText("2,400.00");
    await fill(page, { second: "-20" });
    await expect(metric(page, "Net change from the starting value")).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator(IDS.second)).toHaveValue("");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(4);
  });

  test("a decrease, a zero change, and the lower boundary with the extreme undo shown in full", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { change: "-20" });
    await expect(metric(page, "Ending value")).toHaveText("1,600.00");
    await expect(metric(page, "Change amount")).toHaveText("−400.00");
    await expect(metric(page, "Change that undoes it")).toHaveText("+25.00%");
    await expect(metric(page, "Ending value as a percentage of the starting value")).toHaveText("80.00%");
    await expect(results(page)).toContainText("2,000.00 decreased by 20.00% gives 1,600.00");
    await fill(page, { change: "0" });
    await expect(metric(page, "Ending value")).toHaveText("2,000.00");
    await expect(metric(page, "Change amount")).toHaveText("0.00");
    await expect(metric(page, "Change that undoes it")).toHaveText("0.00%");
    // -99.99%: the end is 0.01, and the undo +9,99,900.00% is an OUTPUT, so it is shown although it is above the 10,00,000 input cap's neighbourhood
    await fill(page, { start: "100", change: "-99.99" });
    await expect(metric(page, "Ending value")).toHaveText("0.01");
    await expect(metric(page, "Change that undoes it")).toHaveText("+9,99,900.00%");
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
  });

  test("the upper input boundary +10,00,000% is valid; one hundredth beyond it is an input error", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "1", change: "1000000" });
    await expect(metric(page, "Ending value")).toHaveText("10,001.00");
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await fill(page, { change: "1000000.01" });
    await expect(page.locator(IDS.change)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#percentage-results .calculator-results__error")).toContainText("Percentage change: Enter a percentage change between −99.99 and 10,00,000.");
    await fill(page, { change: "-100" });
    await expect(page.locator(IDS.change)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#percentage-results .calculator-results__error")).toContainText("A fall of 100% or more is not possible");
  });

  test("input errors: a zero or too-large value, a third decimal and text, each on its own field with a linked message", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "0" });
    await expect(page.locator(IDS.start)).toHaveAttribute("aria-invalid", "true");
    const error = page.locator("#percentage-results-error");
    await expect(error).toContainText("Starting value: Enter a value between 0.01 and 1,00,00,00,000.");
    expect(await page.locator(IDS.start).getAttribute("aria-describedby")).toContain("percentage-results-error");
    await expect(page.locator(IDS.change)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(0);
    await fill(page, { start: "1000000000.01" });
    await expect(error).toContainText("between 0.01 and 1,00,00,00,000");
    await fill(page, { start: "12.345" });
    await expect(error).toContainText("Use up to 2 decimal places.");
    await fill(page, { start: "abc" });
    await expect(error).toContainText("Enter a number.");
    await fill(page, { start: "2000" });
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await expect(metric(page, "Ending value")).toHaveText("2,400.00");
    // the error clears the link too
    expect(await page.locator(IDS.start).getAttribute("aria-describedby")).not.toContain("percentage-results-error");
  });

  test("Golden 12: Ending value 0.01 with +10,00,000% has a mathematical start below 0.01, so it is outside the range: no field error, no number", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "", change: "1000000", end: "0.01" });
    await expect(results(page)).toContainText("The values you entered are fine, but the answer falls outside the range this calculator shows");
    await expect(page.locator("#percentage-results .calculator-results__item")).toHaveCount(0);
    await expect(page.locator("#percentage-results .calculator-results__error")).toHaveCount(0);
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0);
    await expect(page.locator(IDS.start)).toHaveValue(""); // not clamped to 0.01 and not written back
    await expect(page.locator(IDS.second)).toBeDisabled();
    // and a solved change that is too large or too small
    await fill(page, { start: "1", change: "", end: "10001.01" });
    await expect(results(page)).toContainText("falls outside the range");
    await fill(page, { start: "1000", end: "0.01" });
    await expect(results(page)).toContainText("falls outside the range");
    await fill(page, { start: "1", end: "10001" });
    await expect(metric(page, "Percentage change")).toHaveText("+10,00,000.00%");
  });

  test("the second change: +20% then −20% gives 96,000, net −4.00% and a plain sum of 0.00% that is not the combined change", async ({ page, go }) => {
    await open(page, go);
    await expect(results(page)).not.toContainText("After the second change");
    await fill(page, { start: "100000", second: "-20" });
    await expect(page.getByRole("heading", { name: "After the second change" })).toBeVisible();
    await expect(metric(page, "Ending value")).toHaveText("1,20,000.00");
    await expect(metric(page, "Value after the second change")).toHaveText("96,000.00");
    await expect(metric(page, "Net change from the starting value")).toHaveText("−4.00%");
    await expect(metric(page, "Adding the two percentages (not the combined change)")).toHaveText("0.00%");
    await expect(results(page)).toContainText("do not simply cancel or add up");
    await expect(results(page)).toContainText("taken of 1,20,000.00, the value after the first change");
    // a fall then a rise
    await fill(page, { change: "-20", second: "25" });
    await expect(metric(page, "Value after the second change")).toHaveText("1,00,000.00");
    await expect(metric(page, "Net change from the starting value")).toHaveText("0.00%");
    await expect(metric(page, "Adding the two percentages (not the combined change)")).toHaveText("+5.00%");
    // it follows the solved quantity: the start is solved from the end, and the net is measured from that start
    await fill(page, { start: "", change: "20", end: "120000", second: "-20" });
    await expect(metric(page, "Starting value")).toHaveText("1,00,000.00");
    await expect(metric(page, "Net change from the starting value")).toHaveText("−4.00%");
  });

  test("the second change becomes inactive and its results disappear when the first relationship cannot be solved", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { second: "-20" });
    await expect(metric(page, "Value after the second change")).toBeVisible();
    await fill(page, { end: "2400" }); // all three filled
    await expect(page.locator(IDS.second)).toBeDisabled();
    await expect(page.locator(IDS.second)).toHaveValue("-20"); // kept, not lost
    await expect(results(page)).not.toContainText("After the second change");
    await fill(page, { end: "" });
    await expect(page.locator(IDS.second)).toBeEnabled();
    await expect(metric(page, "Value after the second change")).toHaveText("1,920.00");
    await fill(page, { start: "" });
    await expect(page.locator(IDS.second)).toBeDisabled(); // fewer than two
    await expect(results(page)).not.toContainText("After the second change");
  });

  test("a second change past the range and an invalid second change", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "900000000", change: "10", second: "10" });
    await expect(metric(page, "Ending value")).toHaveText("99,00,00,000.00");
    await expect(results(page)).toContainText("the value after the second change falls outside the range");
    await fill(page, { second: "-100" });
    await expect(page.locator(IDS.second)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#percentage-results .calculator-results__error")).toContainText("Second change:");
    await expect(page.locator(IDS.second)).toBeEnabled(); // can be corrected
  });

  test("grouped numbers, a percent sign and a true minus sign are understood", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "1,50,000", change: "−12.5%", end: "" });
    await expect(metric(page, "Ending value")).toHaveText("1,31,250.00");
    await expect(metric(page, "Change that undoes it")).toHaveText("+14.29%");
  });

  test("half-up rounding: a tie goes away from zero, and a tiny change never shows negative zero", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { start: "1", change: "0.5" });
    await expect(metric(page, "Ending value")).toHaveText("1.01");
    await fill(page, { change: "-0.5" });
    await expect(metric(page, "Ending value")).toHaveText("1.00");
    await fill(page, { start: "10000", change: "", end: "10000.5" });
    await expect(metric(page, "Percentage change")).toHaveText("+0.01%");
    await fill(page, { end: "9999.5" });
    await expect(metric(page, "Percentage change")).toHaveText("−0.01%");
    await fill(page, { start: "100000", end: "99999.99" });
    await expect(metric(page, "Percentage change")).toHaveText("0.00%");
    await expect(metric(page, "Percentage change")).not.toContainText("−");
  });

  test("trust: the base is explained, the exclusions are stated, and no good/fair/saving wording is used", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { second: "-20" });
    const body = await page.locator("main, #app").first().innerText();
    expect(body).not.toMatch(BANNED);
    await expect(results(page)).toContainText("each percentage taken of its own base");
    await expect(results(page)).toContainText("tax, fees, and the rounding a shop or an invoice may apply");
    await expect(page.locator("details")).toHaveCount(5);
    await expect(page.locator(".calculator-info").filter({ hasText: "Assumptions and What Is Not Included" })).toContainText("percentage points");
    await expect(page.locator(".calculator-info").filter({ hasText: "Example" }).first()).toContainText("−4.00%");
    await expect(page.locator(".calculator-info a[href$='disclaimer.html']")).toHaveCount(1);
  });

  test("accessibility basics: labelled inputs with hints, a polite live region, a neutral status for all three, keyboard reach and reset", async ({ page, go }) => {
    await open(page, go);
    for (const [sel, label] of [[IDS.start, "Starting value"], [IDS.change, "Percentage change"], [IDS.end, "Ending value"], [IDS.second, "Then another change of"]]) {
      await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
      expect(await page.locator(sel).getAttribute("aria-describedby")).toContain(`${sel.slice(1)}-hint`);
    }
    await expect(page.locator("#percentage-live")).toHaveAttribute("aria-live", "polite");
    await expect(note(page)).toHaveAttribute("role", "status");
    await expect(page.locator("[aria-invalid='true']")).toHaveCount(0); // the opening and neutral states are not errors
    // keyboard: tab through the fields to Reset and press it
    await page.locator(IDS.start).focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(IDS.change)).toBeFocused();
    await fill(page, { start: "123" });
    await page.getByRole("button", { name: "Reset" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(IDS.start)).toHaveValue("2000");
    // the result region is announced as a one-line summary a moment after typing
    await fill(page, { start: "500" });
    await expect(page.locator("#percentage-live")).toContainText("Ending value 600.00; the change that undoes it is −16.67%.", { timeout: 4000 });
  });

  test("related: GST then Margin, in that order, and Coming soon Ratio and Age are not offered", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/gst/`, `${siteRoot}calculators/margin/`]);
    await expect(page.locator("a[href*='calculators/ratio'], a[href*='calculators/age'], a[href*='calculators/profit']")).toHaveCount(0);
    // the three articles
    const articles = page.locator(".related-article-card");
    await expect(articles).toHaveCount(3);
    await expect(articles.first()).toContainText("Why +20% Then −20% Doesn't Get You Back");
    // no image on these cards
    await expect(page.locator(".related-article-card .related-article-image")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases, not by percentage difference, CAGR or ROI", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["percentage", "percentage calculator", "percentage change calculator", "reverse percentage calculator", "original price before increase", "percentage increase calculator", "percentage decrease calculator"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/percentage/']`), query).toHaveCount(1);
    }
    for (const query of ["percentage difference", "percentage points calculator", "roi"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/percentage/']`), query).toHaveCount(0);
    }
  });

  test("responsive: no horizontal overflow with a second change open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { second: "-20" });
    await expect(metric(page, "Value after the second change")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    expect(reset.x + reset.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const sel of Object.values(IDS)) {
      const box = await page.locator(sel).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
      expect(box.height).toBeGreaterThanOrEqual(36);
    }
    if (page.viewportSize().width < 700) {
      // the three core fields stack on a phone
      const ys = await Promise.all(["start", "change", "end"].map(async (k) => (await page.locator(IDS[k]).boundingBox()).y));
      expect(ys[0]).toBeLessThan(ys[1]);
      expect(ys[1]).toBeLessThan(ys[2]);
    }
  });

  test("desktop: the three core fields share a row and the four result cards form a balanced two-by-two block", async ({ page, go }) => {
    await open(page, go);
    if (page.viewportSize().width < 900) return;
    const ys = await Promise.all(["start", "change", "end"].map(async (k) => Math.round((await page.locator(IDS[k]).boundingBox()).y)));
    expect(new Set(ys).size).toBe(1);
    const boxes = await page.locator("#percentage-results .calculator-results__item").evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { y: Math.round(b.y), w: Math.round(b.width) }; }));
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[0].w).toBe(boxes[1].w);
  });
});

test.describe("Percentage publication", () => {
  test("Math category section: Percentage is a live link; Ratio and Age stay Coming soon and are not links", async ({ page, go, siteRoot }) => {
    await go("categories.html#math");
    const section = page.locator("#math");
    await expect(section).toBeVisible();
    await expect(section.locator(`a.category-page-card[href='${siteRoot}calculators/percentage/']`)).toHaveCount(1);
    await expect(section.locator(".category-page-card--soon")).toHaveCount(2);
    await expect(section.locator(".category-page-card--soon")).toContainText(["Ratio Calculator", "Age Calculator"]);
    await expect(section.locator(".category-page-card--soon a")).toHaveCount(0);
    await expect(page.locator("a[href*='categories.html#more']")).toHaveCount(0);
    await expect(page.locator("#math-heading")).toBeFocused();
  });

  test("Calculators listing: a live Percentage card, no Coming soon badge, no duplicate; Ratio and Age stay Coming soon", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const live = page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/percentage/']`);
    await expect(live).toHaveCount(1);
    await expect(live.locator(".coming-soon-badge")).toHaveCount(0);
    await expect(page.locator("#calculators-grid .calculator-card:has-text('Percentage Calculator')")).toHaveCount(1);
    await expect(page.locator("#calculators-grid .calculator-card--soon:has-text('Ratio Calculator')")).toHaveCount(1);
    await expect(page.locator("#calculators-grid .calculator-card--soon:has-text('Age Calculator')")).toHaveCount(1);
    await expect(page.locator("#calculators-grid .calculator-card--soon")).toHaveCount(13);
  });

  test("the three articles are listed under Math with no image block, and their pages render without a hero image", async ({ page, go, siteRoot }) => {
    await go("articles.html");
    await page.getByRole("button", { name: /^Math/ }).click();
    const cards = page.locator(".article-card:not(.article-card--soon)"); // the Math filter also lists one Coming soon placeholder
    await expect(cards).toHaveCount(3);
    await expect(page.locator(".article-card:not(.article-card--soon) .article-card-image")).toHaveCount(0);
    await expect(page.locator(".article-card.article-card--no-image")).toHaveCount(3);
    await go("articles/percentage/percent-vs-percentage-points/");
    await expect(page.locator("h1")).toHaveText("Percent vs Percentage Points");
    await expect(page.locator(".article-hero img, .article-image img")).toHaveCount(0);
    await expect(page.locator(`a[href='${siteRoot}calculators/percentage/']`).first()).toBeVisible();
    await expect(page.locator("meta[property='og:image']")).toHaveCount(0);
  });
});
