/**
 * Tool Pack 21: SWP Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/swp-golden.py (Python decimal, each plan
 * simulated period by period), written here as the rupee amounts the page shows (a withdrawal rounded down, a corpus
 * rounded up, everything else to the nearest rupee). The unit suite (tests/unit/swp-golden.test.mjs) proves the
 * maths; these tests prove the page: the three questions, what each shows, validation, reset, the table, the
 * announcements, privacy and the phone layouts.
 *
 * Default inputs: question A; corpus ₹1,00,00,000; withdrawal ₹80,000 monthly; return 8% a year; 25 years (used by B and C);
 * no yearly increase.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#swp-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const card = (page, title) => page.locator(`#swp-results .swp-compare__card:has(.swp-compare__title:text-is("${title}"))`);
const mode = (page, name) => page.getByRole("radio", { name });
const frequency = (page, name) => page.getByRole("radio", { name, exact: true });
const rows = (page) => page.locator("#swp-results .calculator-results__table-wrapper tbody tr");
const summary = (page) => page.locator("#swp-results .calculator-results__summary");

const A = "How long will my corpus last?";
const B = "How much can I withdraw?";
const C = "What corpus do I need?";

const IDS = { corpus: "#swp-corpus", withdrawal: "#swp-withdrawal", years: "#swp-years", annualReturn: "#swp-return", increase: "#swp-increase" };
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/swp/");
  await page.locator("#swp-results .calculator-results__value").first().waitFor();
}
// sentences that use "guarantee" without denying it ("not guaranteed", "not a guarantee")
const unqualifiedGuarantees = (text) =>
  text.split(/(?<=[.!?])\s+/).filter((sentence) => /guarantee/i.test(sentence) && !/\b(not|no|nor|never)\b/i.test(sentence));
const BANNED = /\b(safe|safely|sustainable|ideal|best|recommended)\b/i;

test.describe("SWP Calculator", () => {
  test("page, breadcrumb, form shell and the default Mode A answer", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("SWP Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    // "Systematic Withdrawal Plan" is understandable at the very beginning, and the page does not claim to model a fund
    await expect(page.locator(".calculator-intro p").first()).toContainText("Systematic Withdrawal Plan");
    await expect(page.locator(".calculator-section__description")).toContainText("not of any one fund");

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toContainText("SWP Calculator");
    await expect(crumb).toContainText(/investment/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}investment.html`]);

    await expect(mode(page, A)).toBeChecked();
    await expect(frequency(page, "Monthly")).toBeChecked();
    await expect(page.getByLabel("Starting Corpus")).toHaveValue("10000000");
    await expect(page.getByLabel("Withdrawal Each Time")).toHaveValue("80000");
    await expect(page.getByLabel("Assumed Annual Return")).toHaveValue("8");
    await expect(page.getByLabel("Yearly Increase in Withdrawal (optional)")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results

    await expect(metric(page, "Estimated to last")).toHaveText("20 years 10 months");
    await expect(metric(page, "Total withdrawn")).toHaveText("₹2,00,20,680");
    await expect(metric(page, "Estimated growth")).toHaveText("₹1,00,20,680");
    await expect(metric(page, "Balance left at the end")).toHaveText("₹0");
    await expect(summary(page)).toContainText("is estimated to cover 250 monthly withdrawals in full (20 years 10 months)");
    await expect(summary(page)).toContainText("The next withdrawal would be only partly covered: about ₹20,680");
    expectClean(watch);
  });

  test("Mode A scenarios: the same plan at 6% and 10%, kept compact beside the assumed return", async ({ page, go }) => {
    await open(page, go);
    await expect(card(page, "Lower return")).toContainText("6% a year");
    await expect(card(page, "Lower return")).toContainText("15 years 11 months");
    await expect(card(page, "As assumed")).toContainText("8% a year");
    await expect(card(page, "As assumed")).toContainText("20 years 10 months");
    await expect(card(page, "Higher return")).toContainText("10% a year");
    await expect(card(page, "Higher return")).toContainText("47 years 2 months");
    await expect(page.locator("#swp-results .swp-compare__card")).toHaveCount(3);
    await expect(page.locator("#swp-results")).toContainText("scenarios, not best or worst cases");
  });

  test("Mode A: the year table has four columns, one row a year, and marks the year the corpus is used up", async ({ page, go }) => {
    await open(page, go);
    const table = page.locator("#swp-results table");
    await expect(table.locator("thead th")).toHaveText(["Year", "Withdrawals", "Estimated growth", "Closing balance"]);
    await expect(table.locator("thead th").first()).toHaveAttribute("scope", "col");
    await expect(table.locator("tbody th").first()).toHaveAttribute("scope", "row");
    await expect(table.locator("caption")).toContainText("Year by year: withdrawals, estimated growth and closing balance"); // the table's accessible name
    await expect(page.locator("#swp-table-note")).toContainText("Closing balance = the previous closing balance − withdrawals + estimated growth"); // the visible context, linked to the region
    await expect(page.locator("#swp-results .calculator-results__table-wrapper")).toHaveAttribute("aria-describedby", "swp-table-note");
    await expect(rows(page)).toHaveCount(21);
    await expect(rows(page).first()).toContainText("Year 1");
    await expect(rows(page).first()).toContainText("₹9,60,000");
    await expect(rows(page).first()).toContainText("₹7,58,889");
    await expect(rows(page).first()).toContainText("₹97,98,889");
    await expect(rows(page).last()).toContainText("Year 21 (corpus used up)");
    await expect(rows(page).last()).toContainText("₹8,20,680");
    await expect(rows(page).last()).toContainText("₹23,911");
    await expect(rows(page).last().locator("td").last()).toHaveText("₹0");
    // the region is labelled and reachable by keyboard; no chart and no monthly table
    const region = page.locator("#swp-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /year by year/i);
    await expect(page.locator("#swp-results svg")).toHaveCount(0);
    await expect(page.locator("#swp-results table")).toHaveCount(1);
  });

  test("Mode A: a corpus that is not used up in 50 years says so and shows 50 rows", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { withdrawal: 30000, annualReturn: 10 });
    await expect(metric(page, "Estimated to last")).toHaveText("More than 50 years");
    await expect(metric(page, "Estimated balance after 50 years")).toHaveText("₹73,25,35,678");
    await expect(metric(page, "Total withdrawn")).toHaveText("₹1,80,00,000");
    await expect(summary(page)).toContainText("is not used up within the 50 years modeled");
    await expect(rows(page)).toHaveCount(50);
    await expect(rows(page).last()).not.toContainText("corpus used up");
    await expect(card(page, "Lower return")).toContainText("More than 50 years");
  });

  test("Mode A: used up exactly at the 50-year horizon", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { corpus: 6000000, withdrawal: 10000, annualReturn: 0 });
    await expect(metric(page, "Estimated to last")).toHaveText("50 years");
    await expect(summary(page)).toContainText("covers all 600 withdrawals, the full 50 years modeled, with nothing left");
    await expect(rows(page)).toHaveCount(50);
    await expect(rows(page).last()).toContainText("corpus used up");
  });

  test("Mode A: a first withdrawal larger than the corpus is told plainly", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { corpus: 50000, withdrawal: 60000 });
    await expect(metric(page, "Estimated to last")).toHaveText("0 months");
    await expect(summary(page)).toContainText("The corpus is smaller than the first withdrawal, so it could cover only part of it: ₹50,000 of ₹60,000.");
    await expect(rows(page)).toHaveCount(1);
  });

  test("Mode A: a yearly increase and a quarterly frequency", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { withdrawal: 50000, increase: 5 });
    await expect(metric(page, "Estimated to last")).toHaveText("23 years 2 months");
    await expect(summary(page)).toContainText("raised by 5% every year");
    await expect(metric(page, "Total withdrawn")).toHaveText("₹2,51,77,170");
    await expect(rows(page)).toHaveCount(24);
    await expect(rows(page).nth(1)).toContainText("₹6,30,000"); // year 2: 52,500 a month, once the year turns

    await fill(page, { corpus: 5000000, withdrawal: 100000, annualReturn: 7, increase: "" });
    await frequency(page, "Quarterly").check();
    await expect(metric(page, "Estimated to last")).toHaveText("26 years 9 months");
    await expect(summary(page)).toContainText("107 quarterly withdrawals");
    await expect(rows(page)).toHaveCount(27);

    await frequency(page, "Yearly").check();
    await fill(page, { corpus: 8000000, withdrawal: 600000, annualReturn: 7, increase: 3 });
    await expect(metric(page, "Estimated to last")).toHaveText("18 years");
    await expect(summary(page)).toContainText("18 yearly withdrawals");
    await expect(rows(page)).toHaveCount(19);
    await expect(rows(page).first()).toContainText("₹79,18,000"); // 80,00,000 - 6,00,000, then 7%
  });

  test("switching A to B to C shows the right fields, and hidden ones leave the tab order", async ({ page, go }) => {
    await open(page, go);
    const visible = async () => ({
      corpus: await page.locator("#swp-corpus").isVisible(),
      withdrawal: await page.locator("#swp-withdrawal").isVisible(),
      years: await page.locator("#swp-years").isVisible(),
      annualReturn: await page.locator("#swp-return").isVisible(),
      increase: await page.locator("#swp-increase").isVisible(),
      frequency: await frequency(page, "Monthly").isVisible()
    });
    expect(await visible()).toEqual({ corpus: true, withdrawal: true, years: false, annualReturn: true, increase: true, frequency: true });

    await mode(page, B).check();
    expect(await visible()).toEqual({ corpus: true, withdrawal: false, years: true, annualReturn: true, increase: true, frequency: true });
    await expect(page.locator("#swp-results h2")).toHaveText("Estimated withdrawal");

    await mode(page, C).check();
    expect(await visible()).toEqual({ corpus: false, withdrawal: true, years: true, annualReturn: true, increase: true, frequency: true });
    await expect(page.locator("#swp-results h2")).toHaveText("Estimated corpus needed");

    // a hidden field is truly removed (hidden attribute), not just painted away: it cannot take focus
    await expect(page.locator('[data-field="corpus"]')).toHaveAttribute("hidden", "");
    await page.locator("#swp-corpus").focus({ timeout: 500 }).catch(() => {});
    expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("swp-corpus");

    await mode(page, A).check();
    await expect(page.locator("#swp-results h2")).toHaveText("How long the corpus may last");
    expect(await visible()).toEqual({ corpus: true, withdrawal: true, years: false, annualReturn: true, increase: true, frequency: true });
  });

  test("a value typed in one question is kept when the question changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { corpus: 12345678, annualReturn: 9.5 });
    await mode(page, C).check();
    await mode(page, B).check();
    await expect(page.locator("#swp-corpus")).toHaveValue("12345678");
    await expect(page.locator("#swp-return")).toHaveValue("9.5");
  });

  test("Mode B: the first withdrawal that uses up the corpus over the years chosen", async ({ page, go }) => {
    await open(page, go);
    await mode(page, B).check();
    await expect(metric(page, "Estimated first withdrawal")).toHaveText("₹74,859 a month"); // 74,859.86, rounded DOWN
    await expect(metric(page, "Total withdrawn")).toHaveText("₹2,24,57,958");
    await expect(metric(page, "Estimated growth")).toHaveText("₹1,24,57,958");
    await expect(metric(page, "Withdrawal in the final year")).toHaveCount(0); // no increase
    await expect(summary(page)).toContainText("withdrawing about ₹74,859 a month would use up a corpus of ₹1,00,00,000 over 25 years, about ₹8,98,318 in the first year");
    await expect(summary(page)).toContainText("By design, this plan uses up the corpus at the end of the period; it does not leave anything behind.");
    await expect(rows(page)).toHaveCount(25);
    await expect(rows(page).last().locator("td").last()).toHaveText("₹0");
    await expect(card(page, "Lower return")).toContainText("₹63,154 a month");
    await expect(card(page, "Higher return")).toContainText("₹87,154 a month");

    await fill(page, { increase: 5 });
    await expect(metric(page, "Estimated first withdrawal")).toHaveText("₹47,422 a month");
    await expect(metric(page, "Withdrawal in the final year")).toHaveText("₹1,52,941 a month");
    await expect(metric(page, "Total withdrawn")).toHaveText("₹2,71,59,831");
  });

  test("Mode C: the corpus a withdrawal plan needs", async ({ page, go }) => {
    await open(page, go);
    await mode(page, C).check();
    await fill(page, { withdrawal: 50000 });
    await expect(metric(page, "Estimated corpus needed")).toHaveText("₹66,79,147"); // 66,79,146.87, rounded UP
    await expect(summary(page)).toContainText("withdrawing ₹50,000 a month for 25 years would need a starting corpus of about ₹66,79,147");
    await expect(card(page, "Lower return")).toContainText("₹79,17,071");
    await expect(card(page, "Higher return")).toContainText("₹57,36,933");
    await fill(page, { increase: 5 });
    await expect(metric(page, "Estimated corpus needed")).toHaveText("₹1,05,43,608");
    await fill(page, { years: 1, annualReturn: 0, increase: "" });
    await expect(metric(page, "Estimated corpus needed")).toHaveText("₹6,00,000");
    await expect(rows(page)).toHaveCount(1);
    await fill(page, { years: 50 });
    await expect(metric(page, "Estimated corpus needed")).toHaveText("₹3,00,00,000");
    await expect(rows(page)).toHaveCount(50);
  });

  test("Mode B and C answers agree: the corpus for B's withdrawal is the corpus that was entered", async ({ page, go }) => {
    await open(page, go);
    await mode(page, B).check();
    await fill(page, { corpus: 12000000, years: 20, annualReturn: 7, increase: 2 });
    const text = await metric(page, "Estimated first withdrawal").innerText();
    const withdrawal = Number(text.replace(/[^\d]/g, ""));
    await mode(page, C).check();
    await fill(page, { withdrawal });
    const needed = Number((await metric(page, "Estimated corpus needed").innerText()).replace(/[^\d]/g, ""));
    // B rounds down and C rounds up, so the corpus for B's displayed withdrawal never exceeds what was entered by more than rounding
    expect(needed).toBeLessThanOrEqual(12000000);
    expect(12000000 - needed).toBeLessThan(2000);
  });

  test("validation: an out-of-range value is an error on its field with a linked message, and recovery clears it", async ({ page, go }) => {
    await open(page, go);
    const field = page.locator("#swp-return");
    await field.fill("40");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const error = page.locator("#swp-results-error");
    await expect(error).toHaveText("Enter an assumed annual return between 0% and 30%.");
    await expect(field).toHaveAttribute("aria-describedby", /swp-results-error/);
    await expect(page.locator("#swp-results .calculator-results__card")).toHaveCount(0);

    await field.fill("-1");
    await expect(error).toBeVisible();
    await field.fill("8");
    await expect(field).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#swp-results-error")).toHaveCount(0);
    await expect(metric(page, "Estimated to last")).toHaveText("20 years 10 months");

    for (const [name, value, text] of [
      ["corpus", "9999", "Enter a starting corpus between ₹10,000 and ₹100 crore."],
      ["withdrawal", "50", "Enter a withdrawal between ₹100 and ₹10 crore."],
      ["increase", "25", "Enter a yearly increase between 0% and 20%, or leave it blank for none."]
    ]) {
      await page.locator(IDS[name]).fill(value);
      await expect(page.locator("#swp-results-error")).toHaveText(text);
      await expect(page.locator(IDS[name])).toHaveAttribute("aria-invalid", "true");
      await page.locator(IDS[name]).fill(name === "corpus" ? "10000000" : name === "withdrawal" ? "80000" : "");
    }
    await expect(metric(page, "Estimated to last")).toHaveText("20 years 10 months");
  });

  test("validation: an empty required field is a prompt, not an error", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#swp-corpus").fill("");
    await expect(page.locator("#swp-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#swp-results-error")).toHaveCount(0);
    await expect(page.locator("#swp-corpus")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("validation: only the chosen question's fields count, and no stale error follows a mode change", async ({ page, go }) => {
    await open(page, go);
    await mode(page, B).check();
    await page.locator("#swp-years").fill("999");
    await expect(page.locator("#swp-results-error")).toHaveText("Enter the duration as a whole number of years from 1 to 50.");
    await expect(page.locator("#swp-years")).toHaveAttribute("aria-invalid", "true");

    await mode(page, A).check(); // years is hidden here: its bad value is neither checked nor reported
    await expect(page.locator("#swp-results-error")).toHaveCount(0);
    await expect(metric(page, "Estimated to last")).toHaveText("20 years 10 months");
    await expect(page.locator("#swp-years")).not.toHaveAttribute("aria-invalid", "true");

    await mode(page, C).check(); // and it counts again where it is used
    await expect(page.locator("#swp-results-error")).toHaveText("Enter the duration as a whole number of years from 1 to 50.");

    await page.locator("#swp-years").fill("2.5");
    await expect(page.locator("#swp-results-error")).toBeVisible();
    await page.locator("#swp-years").fill("25");
    await expect(page.locator("#swp-results-error")).toHaveCount(0);
  });

  test("Reset restores the default question, frequency, values and result, and clears errors", async ({ page, go }) => {
    await open(page, go);
    await mode(page, C).check();
    await frequency(page, "Yearly").check();
    await fill(page, { withdrawal: 123456, years: 10, annualReturn: 12, increase: 4 });
    await page.locator("#swp-return").fill("99"); // an error on screen too
    await expect(page.locator("#swp-results-error")).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(mode(page, A)).toBeChecked();
    await expect(frequency(page, "Monthly")).toBeChecked();
    await expect(page.locator("#swp-corpus")).toHaveValue("10000000");
    await expect(page.locator("#swp-withdrawal")).toHaveValue("80000");
    await expect(page.locator("#swp-years")).toHaveValue("25");
    await expect(page.locator("#swp-return")).toHaveValue("8");
    await expect(page.locator("#swp-increase")).toHaveValue("");
    await expect(page.locator("#swp-results-error")).toHaveCount(0);
    await expect(page.locator("#swp-return")).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Estimated to last")).toHaveText("20 years 10 months");
    await expect(page.locator("#swp-live")).toHaveText("");
    await expect(page.locator("#swp-withdrawal")).toBeVisible();
    await expect(page.locator("#swp-years")).toBeHidden();
  });

  test("the live region announces one sentence a moment after typing stops, never per keystroke", async ({ page, go }) => {
    await open(page, go);
    const live = page.locator("#swp-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveText(""); // the first result is not announced
    await page.locator("#swp-withdrawal").pressSequentially("90000", { delay: 20 }); // appended to 80000: a bad value mid-typing is fine
    await page.locator("#swp-withdrawal").fill("90000");
    // not read out immediately...
    expect(await live.textContent()).toBe("");
    // ...but once the visitor stops
    await expect(live).toContainText("The corpus is estimated to last", { timeout: 3000 });
    await expect(live).toContainText("based on your assumptions");
    const sentence = await live.textContent();
    expect(sentence.split(/[.!?]/).filter(Boolean).length).toBe(1); // one short sentence
    await mode(page, B).check();
    await expect(live).toContainText("The estimated first withdrawal is ₹74,859 a month", { timeout: 3000 });
    await mode(page, C).check();
    await expect(live).toContainText("The estimated corpus needed is", { timeout: 3000 });
  });

  test("keyboard: the question is chosen with the arrow keys and every control is reachable in order", async ({ page, go }) => {
    await open(page, go);
    await mode(page, A).focus();
    await page.keyboard.press("ArrowDown");
    await expect(mode(page, B)).toBeChecked();
    await expect(page.locator("#swp-years")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(mode(page, C)).toBeChecked();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(mode(page, A)).toBeChecked();

    // Tab order in question A: corpus, withdrawal, frequency (its selected option), return, increase, Reset
    await page.locator("#swp-corpus").focus();
    const order = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement?.id || document.activeElement?.getAttribute("name") + ":" + document.activeElement?.value));
    }
    expect(order).toEqual(["swp-withdrawal", "swp-frequency:monthly", "swp-return", "swp-increase", "swp-reset"]);
    await page.keyboard.press("Enter"); // Reset by keyboard
    await expect(mode(page, A)).toBeChecked();

    // a frequency can be chosen by keyboard as well
    await frequency(page, "Monthly").focus();
    await page.keyboard.press("ArrowRight");
    await expect(frequency(page, "Quarterly")).toBeChecked();
  });

  test("labels, groups, hints and the visible focus ring are real", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("group", { name: "What do you want to find out?" })).toBeVisible();
    await expect(page.getByRole("group", { name: "How Often You Withdraw" })).toBeVisible();
    for (const label of ["Starting Corpus", "Withdrawal Each Time", "Assumed Annual Return", "Yearly Increase in Withdrawal (optional)"]) {
      const input = page.getByLabel(label);
      await expect(input).toBeVisible();
      expect(await input.getAttribute("aria-describedby")).toMatch(/-hint$/);
    }
    await mode(page, B).check();
    await expect(page.getByLabel("How Long", { exact: true })).toHaveAttribute("aria-describedby", "swp-years-hint");
    // the chosen option's span shows the focus ring (the radio itself is visually hidden)
    await mode(page, A).focus();
    await page.keyboard.press("ArrowDown"); // keyboard focus: the ring shows on the option that is now chosen
    await expect(mode(page, B)).toBeFocused();
    const outline = await page.locator(".swp-choice__option:has(input:checked) span").first().evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    // the chosen option carries a tick and a heavier border, not colour alone
    const tick = await page.locator(".swp-choice__option:has(input:checked) span").first().evaluate((el) => getComputedStyle(el, "::before").content);
    expect(tick).toContain("✓");
  });

  test("wording: estimates and scenarios only, never a promise, a recommendation or a 'safe' label", async ({ page, go }) => {
    await open(page, go);
    for (const which of [A, B, C]) {
      await mode(page, which).check();
      const text = (await page.locator("main").innerText()).replace(/not best or worst cases/g, "");
      expect(text, `question "${which}"`).not.toMatch(BANNED);
      expect(unqualifiedGuarantees(text), `question "${which}"`).toEqual([]);
      expect(text).not.toMatch(/guaranteed (income|corpus)/i);
    }
    const trust = page.locator("#swp-results .swp-note--trust");
    await expect(trust).toContainText("A scenario, not a forecast.");
    await expect(trust).toContainText("same rate every year");
    await expect(trust).toContainText("Taxes, fund charges, exit loads");
    await expect(trust).toContainText("sequence-of-returns risk");
    await expect(trust).toContainText("inflation");
    await expect(trust).toContainText("not financial advice and not a guarantee");
    await expect(page.locator(".calculator-section__description")).toContainText("examples, not recommendations");
    await expect(page.locator("#swp-increase-hint")).toContainText("not a forecast of inflation");
    await expect(page.locator("#swp-return-hint")).toContainText("not a forecast");
    await expect(page.locator("#swp-results")).not.toContainText(/\d{1,3}(,\d{3}){2,}(?!\d)/); // Indian grouping only
  });

  test("explanatory content, assumptions and the example come from the same engine", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions and What Is Not Included/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(4);
    const main = page.locator("main");
    await expect(main).toContainText("effective annual rate");
    await expect(main).toContainText("start of its period");
    await expect(main).toContainText("not a prediction of inflation");
    await expect(main).toContainText("250 withdrawals in full (20 years 10 months)"); // the example
    await expect(main).toContainText("15 years 11 months or 47 years 2 months");
    await expect(main).toContainText("about ₹74,859 a month");
    await expect(main).toContainText("about ₹1,06,86,635");
  });

  test("it opens nothing and stores nothing: no storage, no cookie, no address change, no network request while it is used", async ({ page, go, context }) => {
    await go("calculators/swp/");
    await page.locator("#swp-results .calculator-results__value").first().waitFor();
    const before = page.url();
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await mode(page, B).check();
    await fill(page, { corpus: 12345678, years: 31, annualReturn: 9.5, increase: 3 });
    await frequency(page, "Quarterly").check();
    await mode(page, C).check();
    await fill(page, { withdrawal: 77777 });
    await page.getByRole("button", { name: "Reset" }).click();
    await fill(page, { corpus: 12345678 });
    await page.waitForTimeout(700);
    expect(page.url()).toBe(before);
    expect(new URL(page.url()).search).toBe("");
    expect(new URL(page.url()).hash).toBe("");
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);
    expect(storage.cookie).toBe("");
    expect(requests, "no request at all while the calculator is used").toEqual([]);
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
    expect(await page.evaluate(() => [...document.querySelectorAll("a[href]")].some((a) => /12345678|77777/.test(a.href)))).toBe(false);
  });

  test("the ids are unique and the source has no Worker, chart or print block", async ({ page, go }) => {
    await open(page, go);
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await expect(page.locator("#swp-print")).toHaveCount(0);
    await expect(page.locator("canvas, svg.swp-chart")).toHaveCount(0);
  });

  test("SIP is the one related calculator, one way: SIP does not offer the SWP Calculator", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    await expect(related).toHaveCount(1);
    const href = await related.evaluate((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href"));
    expect(href).toBe(`${siteRoot}calculators/sip/`);
    await related.click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/sip/`);
    await expect(page.locator("a[href*='calculators/swp']")).toHaveCount(0); // SIP is unchanged
    await expect(page.locator(".related-calculator-card")).toHaveCount(2); // still FD and CAGR
  });

  test("search finds it by name and by its four aliases, and does not take SIP's queries", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["swp", "systematic withdrawal plan", "retirement withdrawal", "retirement drawdown", "withdrawal plan"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/swp/']`), query).toHaveCount(1);
      await expect(page.locator("#calculators-grid .calculator-card").first(), query).toContainText("SWP Calculator");
    }
    for (const query of ["sip", "systematic investment plan", "step-up sip"]) {
      await input.fill(query);
      await expect(page.locator("#calculators-grid .calculator-card").first(), query).toContainText("SIP Calculator");
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/swp/']`), query).toHaveCount(0);
    }
    await input.fill("cagr");
    await expect(page.locator("#calculators-grid .calculator-card").first()).toContainText("CAGR Calculator");
    await input.fill("pension");
    await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/swp/']`)).toHaveCount(0); // not claimed
  });

  test("the Investment category lists it after the other live tools", async ({ page, go, siteRoot }) => {
    await go("investment.html");
    const hrefs = await page.locator("a[href*='/calculators/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    const own = hrefs.filter((h, i) => hrefs.indexOf(h) === i && /calculators\/(sip|fd|cagr|swp)\/$/.test(h));
    expect(own).toEqual([`${siteRoot}calculators/sip/`, `${siteRoot}calculators/fd/`, `${siteRoot}calculators/cagr/`, `${siteRoot}calculators/swp/`]);
  });

  test("the static HTML has the heading, the explanation and the metadata, and the canonical is on the production origin", async ({ api, page, go }) => {
    await go("calculators/swp/");
    await expect(page).toHaveTitle("SWP Calculator: How Long Will a Corpus Last? | ToolZen Hub");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Estimate how long a corpus could last/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://toolzenhub.in/calculators/swp/");
    const html = await (await api.get("calculators/swp/")).text();
    expect(html).toContain("Systematic Withdrawal Plan");
    expect(html).toContain("Assumptions and What Is Not Included");
    expect(html).toContain("swp.css");
    expect(html).not.toMatch(/chart\.js|d3\.|\.min\.js/);
  });
});

/*
 * The phone layouts. Each width gets the cases most likely to break: the longest currency figure, a 50-row table,
 * the stacked question choice, an error message and every mode. Rendered geometry is measured, not assumed.
 */
for (const width of [320, 360, 390]) {
  test.describe(`SWP Calculator at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`no page-level overflow in any question, state or error at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);

      // Mode C at the largest values: the biggest corpus the form can produce
      await mode(page, C).check();
      await fill(page, { withdrawal: 100000000, years: 50, annualReturn: 0 });
      await expect(metric(page, "Estimated corpus needed")).toHaveText("₹60,00,00,00,000");
      await expectNoHorizontalOverflow(page);
      await expect(rows(page)).toHaveCount(50);

      // Mode A with a 50-row table and the longest balance
      await mode(page, A).check();
      await fill(page, { corpus: 1000000000, withdrawal: 100, annualReturn: 30, increase: 20 });
      await expectNoHorizontalOverflow(page);

      // Mode B with an increase (the extra metric) and quarterly
      await mode(page, B).check();
      await frequency(page, "Quarterly").check();
      await fill(page, { corpus: 1000000000, years: 50, annualReturn: 0, increase: 20 });
      await expect(metric(page, "Withdrawal in the final year")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      // an error, and the long sentence of a first-withdrawal-exceeds result
      await page.locator("#swp-return").fill("99");
      await expect(page.locator("#swp-results-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await mode(page, A).check();
      await page.locator("#swp-return").fill("8");
      await fill(page, { corpus: 10000, withdrawal: 100000000 });
      await expect(summary(page)).toContainText("could cover only part of it");
      await expectNoHorizontalOverflow(page);
    });

    test(`controls are at least 44px tall, the question stays stacked and readable, results stay inside their card at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      const boxes = async (selector) => page.locator(selector).evaluateAll((els) => els.filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), right: Math.round(r.right) }; }));

      const options = await boxes(".swp-choice--mode .swp-choice__option span");
      expect(options).toHaveLength(3);
      for (const box of options) expect(box.height).toBeGreaterThanOrEqual(44);
      // stacked: each option starts below the previous one and spans the same width inside the viewport
      expect(options[1].top).toBeGreaterThan(options[0].top + options[0].height - 2);
      expect(options[2].top).toBeGreaterThan(options[1].top + options[1].height - 2);
      for (const box of options) { expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(width); }
      // the long labels wrap instead of being cut off
      for (const label of [A, B, C]) {
        const clipped = await page.getByText(label, { exact: true }).first().evaluate((el) => el.scrollWidth > el.clientWidth + 1);
        expect(clipped, label).toBe(false);
      }

      for (const box of await boxes(".swp-choice:not(.swp-choice--mode) .swp-choice__option span")) expect(box.height).toBeGreaterThanOrEqual(44);
      for (const box of await boxes("#swp-form .calculator-form__input")) { expect(box.height).toBeGreaterThanOrEqual(44); expect(box.right).toBeLessThanOrEqual(width); }
      const [reset] = await boxes("#swp-reset");
      expect(reset.height).toBeGreaterThanOrEqual(44);
      expect(reset.right).toBeLessThanOrEqual(width);

      // every value inside the result card, and the scenario cards stacked in one column
      const inside = await page.evaluate(() => {
        const card = document.querySelector("#swp-results .calculator-results__card").getBoundingClientRect();
        return [...document.querySelectorAll("#swp-results .calculator-results__item, #swp-results .swp-compare__card, #swp-results .swp-note--trust")].map((e) => { const r = e.getBoundingClientRect(); return r.left >= card.left - 1 && r.right <= card.right + 1; });
      });
      expect(inside.every(Boolean)).toBe(true);
      const cards = await boxes("#swp-results .swp-compare__card");
      expect(cards).toHaveLength(3);
      if (width < 440) {
        expect(new Set(cards.map((c) => c.left)).size).toBe(1); // one column
        expect(cards[1].top).toBeGreaterThan(cards[0].top);
      }
    });

    test(`the table scrolls inside its own region, and the page does not, at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await fill(page, { corpus: 1000000000, withdrawal: 100, annualReturn: 30 }); // 50 rows of the biggest figures
      await expect(rows(page)).toHaveCount(50);
      const geometry = await page.evaluate(() => {
        const region = document.querySelector("#swp-results .calculator-results__table-wrapper");
        const r = region.getBoundingClientRect();
        return { regionRight: r.right, viewport: window.innerWidth, scrollWidth: region.scrollWidth, clientWidth: region.clientWidth, page: document.documentElement.scrollWidth, overflowX: getComputedStyle(region).overflowX };
      });
      expect(geometry.overflowX).toBe("auto");
      expect(geometry.regionRight).toBeLessThanOrEqual(geometry.viewport);
      expect(geometry.page).toBeLessThanOrEqual(geometry.viewport + 1);
      // if the table is wider than the region it scrolls there, and the first column stays in view
      if (geometry.scrollWidth > geometry.clientWidth) {
        await page.locator("#swp-results .calculator-results__table-wrapper").evaluate((el) => { el.scrollLeft = 200; });
        const sticky = await page.locator("#swp-results tbody th").first().evaluate((th) => th.getBoundingClientRect().left);
        const regionLeft = await page.locator("#swp-results .calculator-results__table-wrapper").evaluate((el) => el.getBoundingClientRect().left);
        expect(Math.abs(sticky - regionLeft)).toBeLessThanOrEqual(2);
      }
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("SWP Calculator on a wide screen", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("no overflow, the scenarios side by side, and the headline answer takes the first row @desktop-only", async ({ page, go }) => {
    await open(page, go);
    await expectNoHorizontalOverflow(page);
    const cards = await page.locator("#swp-results .swp-compare__card").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; }));
    expect(new Set(cards.map((c) => c.top)).size).toBe(1); // one row
    const primary = await page.locator("#swp-results .calculator-results__item--primary").evaluate((e) => ({ w: e.getBoundingClientRect().width, grid: e.parentElement.getBoundingClientRect().width }));
    expect(Math.abs(primary.w - primary.grid)).toBeLessThanOrEqual(2);
  });
});
