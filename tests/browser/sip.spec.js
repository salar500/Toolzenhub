/**
 * Tool Pack 3 — SIP Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/sip-golden.py (Python decimal, each plan
 * simulated month by month), written here as literals. The test reads label -> value pairs and landmarks, not DOM
 * positions.
 *
 * Default inputs: ₹10,000 a month; an assumed return of 10% a year; 15 years; no step-up; no target.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#sip-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const card = (page, title) => page.locator(`#sip-results .sip-compare__card:has(.sip-compare__title:text-is("${title}"))`);

const IDS = {
  monthlySip: "#sip-amount", annualReturn: "#sip-return", years: "#sip-years", months: "#sip-months", stepUp: "#sip-stepup", target: "#sip-target",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/sip/");
  await page.locator("#sip-results .calculator-results__value").first().waitFor();
}
// sentences that use "guarantee" without denying it ("not guaranteed", "not a guarantee")
const unqualifiedGuarantees = (text) =>
  text.split(/(?<=[.!?])\s+/).filter((sentence) => /guarantee/i.test(sentence) && !/\b(not|no|nor|never)\b/i.test(sentence));
const rows = (page) => page.locator("#sip-results .calculator-results__table-wrapper tbody tr");

test.describe("SIP Calculator", () => {
  test("page, breadcrumb, form shell and the default projection", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("SIP Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("SIP Calculator");
    // Investment has no landing page of its own, so its crumb is plain text, not a dead link
    await expect(crumb).toContainText(/investment/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`]);

    await expect(page.getByLabel("Monthly SIP Amount")).toHaveValue("10000");
    await expect(page.getByLabel("Assumed Annual Return")).toHaveValue("10");
    await expect(page.locator("#sip-years")).toHaveValue("15");
    await expect(page.locator("#sip-months")).toHaveValue("0");
    await expect(page.getByLabel("Yearly Step-Up (optional)")).toHaveValue("0");
    await expect(page.getByLabel("Target Amount (optional)")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results

    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");
    await expect(metric(page, "Total invested")).toHaveText("₹18,00,000");
    await expect(metric(page, "Estimated growth")).toHaveText("₹23,79,243");
    await expect(metric(page, "Multiple of your investment")).toHaveText("2.32 times");
    expectClean(watch);
  });

  test("your money, the assumed return and the estimated value are kept apart in the wording", async ({ page, go }) => {
    await open(page, go);
    const summary = page.locator(".calculator-results__summary");
    await expect(summary).toContainText("Based on these assumptions, investing ₹10,000 a month");
    await expect(summary).toContainText("at an assumed return of 10% a year could grow to an estimated ₹41,79,243");
    await expect(summary).toContainText("You would invest ₹18,00,000 in total. The other ₹23,79,243 is estimated growth");
    await expect(summary).toContainText("depends entirely on the return you assume");
    await expect(page.locator("#sip-results")).not.toContainText(/\d{1,3}(,\d{3}){2,}(?!\d)/); // Indian grouping only
  });

  test("the trust wording is on the page, and the banned words are not", async ({ page, go }) => {
    await open(page, go);
    const note = page.locator(".sip-note--trust");
    await expect(note).toContainText("Projection, not a forecast.");
    await expect(note).toContainText("not guaranteed");
    await expect(note).toContainText("can be lower than assumed and can be negative");
    await expect(note).toContainText("subject to market risk");
    await expect(note).toContainText("Taxes, fund charges, exit loads and inflation are not included");
    await expect(note).toContainText("not investment advice");
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/you will earn|best return|safest|recommended (fund|investment)|expected profit/i);
    expect(unqualifiedGuarantees(text)).toEqual([]); // "guarantee" appears only in a sentence that denies it
    expect(text).toMatch(/An assumption you control, not a forecast/);
    await expect(page.locator("main")).toContainText("does not recommend any investment");
  });

  test("scenarios: lower, as assumed and higher, with the assumed one findable and none called best or worst", async ({ page, go }) => {
    await open(page, go);
    const lower = card(page, "Lower return"), assumed = card(page, "As assumed"), higher = card(page, "Higher return");
    await expect(lower).toContainText("8% a year");
    await expect(lower).toContainText("₹34,83,451");
    await expect(assumed).toContainText("10% a year");
    await expect(assumed).toContainText("₹41,79,243");
    await expect(assumed).toHaveClass(/sip-compare__card--assumed/);
    await expect(higher).toContainText("12% a year");
    await expect(higher).toContainText("₹50,45,760");
    await expect(page.locator("#sip-results")).toContainText("not best or worst cases");
    for (const c of [lower, assumed, higher]) await expect(c).not.toContainText(/best|worst|expected/i);
  });

  test("the scenario set at the boundaries: 0% has no lower scenario, 30% has no higher one", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { annualReturn: 0 });
    await expect(card(page, "Lower return")).toHaveCount(0);
    await expect(card(page, "As assumed")).toContainText("0% a year");
    await expect(card(page, "Higher return")).toContainText("2% a year");
    await expect(metric(page, "Estimated value")).toHaveText("₹18,00,000");
    await expect(metric(page, "Estimated growth")).toHaveText("₹0");
    await expect(page.locator(".calculator-results__summary")).toContainText("At an assumed return of 0% the estimated value equals the ₹18,00,000 you would invest");
    await fill(page, { annualReturn: 30 });
    await expect(card(page, "Higher return")).toHaveCount(0);
    await expect(card(page, "Lower return")).toContainText("28% a year");
  });

  test("a yearly step-up: the monthly SIP rises each year, from the 13th month", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { stepUp: 10 });
    await expect(metric(page, "Estimated value")).toHaveText("₹74,37,840");
    await expect(metric(page, "Total invested")).toHaveText("₹38,12,698");
    await expect(metric(page, "Estimated growth")).toHaveText("₹36,25,142");
    await expect(metric(page, "Monthly SIP in the last year")).toHaveText("₹37,975");
    await expect(page.locator(".calculator-results__summary")).toContainText("raised by 10% every year");
    await expect(page.locator(".calculator-results__summary")).toContainText("reaches ₹37,975 in the last year");
    await expect(rows(page).nth(0).locator("td").first()).toHaveText("₹10,000");
    await expect(rows(page).nth(1).locator("td").first()).toHaveText("₹11,000");
    await expect(rows(page).nth(2).locator("td").first()).toHaveText("₹12,100");
    await expect(rows(page).nth(14).locator("td").first()).toHaveText("₹37,975");
    await expect(card(page, "Lower return")).toContainText("₹64,16,131");
    // a blank step-up is the same as 0
    await page.locator("#sip-stepup").fill("");
    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");
    await expect(page.locator("#sip-results-error")).toHaveCount(0);
  });

  test("target absent: no target block", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: "Your target" })).toHaveCount(0);
    await expect(card(page, "Target may be missed")).toHaveCount(0);
  });

  test("a target that is missed: the shortfall and the starting SIP it needs", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { target: 10000000 });
    const missed = card(page, "Target may be missed");
    await expect(missed).toBeVisible();
    await expect(missed).toContainText("₹1,00,00,000");
    await expect(missed).toContainText("Estimated shortfall");
    await expect(missed).toContainText("₹58,20,757");
    await expect(missed).toContainText("₹23,928 a month");
    await expect(page.locator("#sip-results")).toContainText("may fall short of the target by an estimated ₹58,20,757");
    await expect(page.locator("#sip-results")).toContainText("a starting SIP of about ₹23,928 a month");
  });

  test("a target with a step-up uses the same step-up for the SIP it needs", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { stepUp: 10, target: 10000000 });
    const missed = card(page, "Target may be missed");
    await expect(missed).toContainText("₹25,62,160");
    await expect(missed).toContainText("₹13,445 a month");
    await expect(page.locator("#sip-results")).toContainText("raised by 10% every year as in your plan");
  });

  test("a target that is reached: a surplus, and a smaller SIP than the plan's", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { monthlySip: 50000, annualReturn: 12, years: 20, target: 10000000 });
    await expect(metric(page, "Estimated value")).toHaveText("₹4,99,57,396");
    const reached = card(page, "Target may be reached");
    await expect(reached).toBeVisible();
    await expect(reached).toContainText("Estimated surplus");
    await expect(reached).toContainText("₹3,99,57,396");
    await expect(reached).toContainText("₹10,009 a month");
    await expect(page.locator("#sip-results")).toContainText("may reach the target");
  });

  test("a partial final year is labelled with its months", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { years: 1, months: 6 });
    await expect(rows(page)).toHaveCount(2);
    await expect(rows(page).nth(0).locator("th")).toHaveText("Year 1");
    await expect(rows(page).nth(1).locator("th")).toHaveText("Year 2 (6 months)");
    await fill(page, { years: 0, months: 11 });
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first().locator("th")).toHaveText("Year 1 (11 months)");
    await expect(rows(page).first().locator("td").nth(2)).toHaveText("₹1,15,656"); // value after 11 months, golden 115,655.6809
  });

  test("year-by-year table: semantic, reconciles with the result", async ({ page, go }) => {
    await open(page, go);
    const wrapper = page.locator("#sip-results .calculator-results__table-wrapper");
    await expect(wrapper).toHaveAttribute("role", "region");
    await expect(wrapper).toHaveAttribute("tabindex", "0");
    await expect(wrapper).toHaveAttribute("aria-label", /Year by year/);
    await expect(wrapper.locator("caption")).toHaveCount(1);
    await expect(wrapper.locator("th[scope=col]")).toHaveText(["Year", "Monthly SIP", "Total invested", "Estimated value", "Estimated growth"]);
    await expect(rows(page)).toHaveCount(15);
    await expect(rows(page).first().locator("th")).toHaveText("Year 1");
    const first = rows(page).first().locator("td");
    await expect(first.nth(0)).toHaveText("₹10,000");
    await expect(first.nth(1)).toHaveText("₹1,20,000");
    await expect(first.nth(2)).toHaveText("₹1,26,703");
    await expect(first.nth(3)).toHaveText("₹6,703");
    const last = rows(page).last().locator("td");
    await expect(last.nth(1)).toHaveText("₹18,00,000");
    await expect(last.nth(2)).toHaveText("₹41,79,243");
    await expect(last.nth(3)).toHaveText("₹23,79,243");
    // no monthly detail and no CSV in v1
    await expect(page.getByRole("button", { name: /month-by-month|csv/i })).toHaveCount(0);
  });

  test("the chart: one native SVG, with a text alternative, built from the table's own numbers", async ({ page, go }) => {
    await open(page, go);
    const svg = page.locator("#sip-results svg.sip-chart");
    await expect(svg).toHaveCount(1);
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).toHaveAttribute("aria-labelledby", "sip-chart-title sip-chart-desc");
    await expect(svg.locator("title")).toHaveText("Total invested compared with estimated value");
    await expect(svg.locator("desc")).toContainText("rises to ₹18,00,000");
    await expect(svg.locator("desc")).toContainText("rises to ₹41,79,243");
    await expect(svg.locator("polyline")).toHaveCount(2);
    // 15 years plus the start: 16 points on each line
    const points = await svg.locator("polyline").evaluateAll((l) => l.map((p) => p.getAttribute("points").trim().split(/\s+/).length));
    expect(points).toEqual([16, 16]);
    // the two lines differ by dash as well as by colour, and the end markers differ in shape
    const dash = await svg.locator(".sip-chart__line").evaluateAll((l) => l.map((e) => getComputedStyle(e).strokeDasharray));
    expect(dash[0]).not.toBe("none");
    expect(dash[1]).toBe("none");
    await expect(svg.locator("rect.sip-chart__marker--invested")).toHaveCount(1);
    await expect(svg.locator("circle.sip-chart__marker--value")).toHaveCount(1);
    await expect(page.locator(".sip-legend li")).toHaveCount(2);
    await expect(page.locator(".sip-figure figcaption")).toContainText("The table below gives the same figures");
    // no chart library, no canvas, no second chart
    await expect(page.locator("#sip-results canvas")).toHaveCount(0);
    await expect(page.locator("#sip-results svg")).toHaveCount(1);
    expect(await page.evaluate(() => Object.keys(window).filter((k) => /^(Chart|d3|Highcharts|Plotly)$/.test(k)))).toEqual([]);
    // no NaN anywhere in the drawing
    expect(await svg.evaluate((e) => e.outerHTML)).not.toMatch(/NaN|undefined|Infinity/);
  });

  test("the chart scales to the screen and keeps readable labels", async ({ page, go }) => {
    await open(page, go);
    const box = await page.locator("svg.sip-chart").boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    // axis labels are 13 units in a 480-wide drawing: at least about 9px on a 360px-wide screen
    const px = await page.locator(".sip-chart__label").first().evaluate((e) => e.getBoundingClientRect().height);
    expect(px).toBeGreaterThanOrEqual(8);
    await expectNoHorizontalOverflow(page);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const rate = page.locator("#sip-return");
    await rate.fill("45");
    const error = page.locator("#sip-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/assumed annual return/i);
    await expect(rate).toHaveAttribute("aria-invalid", "true");
    await expect(rate).toHaveAttribute("aria-describedby", /sip-results-error/);
    await expect(page.locator("#sip-results .calculator-results__value")).toHaveCount(0);
    await expect(page.locator("#sip-results svg")).toHaveCount(0);

    await rate.fill("10");
    await expect(error).toHaveCount(0);
    await expect(rate).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");

    await page.locator("#sip-months").fill("14");
    await expect(error).toContainText(/0 to 11/);
    await expect(page.locator("#sip-months")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#sip-months").fill("0");
    await fill(page, { years: 0 });
    await expect(error).toContainText(/at least 1 month/);
    await expect(page.locator("#sip-years")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#sip-months")).toHaveAttribute("aria-invalid", "true");
    await fill(page, { years: 15, target: 5000 });
    await expect(error).toContainText(/target amount/i);
    await expect(page.locator("#sip-target")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#sip-target").fill("");
    await expect(error).toHaveCount(0);
  });

  test("an emptied required field shows the prompt; the optional fields do not", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#sip-amount").fill("");
    await expect(page.locator("#sip-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#sip-results-error")).toHaveCount(0);
    await page.locator("#sip-amount").fill("10000");
    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");
    await page.locator("#sip-target").fill("");
    await page.locator("#sip-stepup").fill("");
    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");
    await expect(page.locator("#sip-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default and recomputes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { monthlySip: 2500, annualReturn: 7, years: 3, months: 5, stepUp: 8, target: 900000 });
    await expect(page.locator("#sip-results .calculator-results__item").first()).not.toContainText("₹41,79,243");
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [["#sip-amount", "10000"], ["#sip-return", "10"], ["#sip-years", "15"], ["#sip-months", "0"], ["#sip-stepup", "0"], ["#sip-target", ""]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(metric(page, "Estimated value")).toHaveText("₹41,79,243");
    await expect(page.locator("#sip-results-error")).toHaveCount(0);
    await expect(card(page, "Target may be missed")).toHaveCount(0);
  });

  test("Print Summary opens the browser print dialog; the printout leaves out the page chrome", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { stepUp: 10, target: 10000000 });
    await expect(page.getByRole("button", { name: "Print Summary" })).toBeVisible();
    await page.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
    await page.getByRole("button", { name: "Print Summary" }).click();
    expect(await page.evaluate(() => window.__prints)).toBe(1);

    await page.emulateMedia({ media: "print" });
    for (const hidden of ["#header", "footer.footer", ".calculator-breadcrumb", "#sip-form", ".related-section", ".calculator-info", ".sip-actions"]) {
      expect(await page.locator(hidden).first().isVisible(), `${hidden} is not printed`).toBe(false);
    }
    await expect(page.locator(".sip-print-brand")).toContainText("SIP Calculator");
    const inputs = page.locator(".sip-print-inputs");
    await expect(inputs).toContainText("₹10,000, raised by 10% a year");
    await expect(inputs).toContainText("10% a year");
    await expect(inputs).toContainText("15 years");
    await expect(inputs).toContainText("₹1,00,00,000");
    await expect(page.locator(".sip-note--trust")).toBeVisible();
    await expect(page.locator(".sip-compare__card")).toHaveCount(4); // three scenarios and the target
    await expect(page.locator("svg.sip-chart")).toBeVisible();
    await expect(page.locator("#sip-results tbody tr").first()).toBeVisible();
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator(".sip-print-brand")).toBeHidden();
  });

  test("keyboard: every control is reachable, reset and print work from the keyboard", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#sip-amount").focus();
    for (const id of ["sip-return", "sip-years", "sip-months", "sip-stepup", "sip-target", "sip-reset"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    expect(await page.locator("#sip-reset").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
    await page.locator("#sip-amount").fill("500");
    await page.locator("#sip-reset").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#sip-amount")).toHaveValue("10000");
    await page.locator("#sip-print").focus();
    expect(await page.locator("#sip-print").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  });

  test("buttons use the shared system: Reset and Print are secondary, and there is no primary button", async ({ page, go }) => {
    await open(page, go);
    for (const id of ["#sip-reset", "#sip-print"]) {
      await expect(page.locator(id)).toHaveClass(/calculator-form__button--secondary/);
      const s = await page.locator(id).evaluate((e) => { const c = getComputedStyle(e); return { bg: c.backgroundColor, color: c.color, cursor: c.cursor }; });
      expect(s).toEqual({ bg: "rgb(255, 255, 255)", color: "rgb(8, 127, 71)", cursor: "pointer" });
    }
    await expect(page.locator("button.calculator-form__button:not(.calculator-form__button--secondary)")).toHaveCount(0);
  });

  test("a polite live region exists, the page has unique ids, and local mode only", async ({ page, go, context }) => {
    await open(page, go);
    const live = page.locator("#sip-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await fill(page, { monthlySip: 12345 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reading the Projection/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions and What Is Not Included/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(4);
    const main = page.locator("main");
    await expect(main).toContainText("divided by 12");
    await expect(main).toContainText("starting in the 13th month");
    await expect(main).toContainText("₹41,79,243"); // the example
    await expect(main).toContainText("₹74,37,840"); // the step-up example
    await expect(main).toContainText("₹23,928"); // the starting SIP for ₹1 crore
  });

  test("no related calculators in v1 (no other Investment tool is live) and four curated articles", async ({ page, go, siteRoot }) => {
    await open(page, go);
    await expect(page.locator(".related-calculator-card")).toHaveCount(0);
    const cards = page.locator(".related-article-card");
    await expect(cards).toHaveCount(4);
    const hrefs = await cards.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([
      `${siteRoot}articles/sip/how-a-sip-grows/`,
      `${siteRoot}articles/sip/how-return-assumptions-change-a-sip-projection/`,
      `${siteRoot}articles/sip/step-up-sip-explained/`,
      `${siteRoot}articles/sip/how-much-sip-do-you-need-for-a-goal/`,
    ]);
  });

  test("the Home page's SIP card is live, by the catalog, with no Coming soon badge", async ({ page, go, siteRoot }) => {
    await go("");
    const link = page.locator(`#popular-calculators a.calculator-card[href='${siteRoot}calculators/sip/']`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText("SIP Calculator");
    await expect(link).not.toContainText("Coming soon");
    await expect(page.locator("#popular-calculators .calculator-card--soon:has-text('SIP Calculator')")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["sip", "systematic investment plan", "step-up sip"]) {
      await input.fill(query);
      const card = page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/sip/']`);
      await expect(card).toHaveCount(1);
      await expect(page.locator("#calculators-grid .calculator-card").first()).toContainText("SIP Calculator");
    }
  });

  test("responsive: no horizontal overflow with every optional block open", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { stepUp: 10, target: 10000000 });
    await expect(card(page, "Target may be missed")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const box = await page.locator("#sip-print").boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(36);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const id of ["#sip-years", "#sip-months"]) await expect(page.locator(id)).toBeVisible();
  });

  test("all four articles render from static HTML and lead to the tool", async ({ page, go, siteRoot }) => {
    for (const slug of ["how-a-sip-grows", "how-return-assumptions-change-a-sip-projection", "step-up-sip-explained", "how-much-sip-do-you-need-for-a-goal"]) {
      await go(`articles/sip/${slug}/`);
      await expect(page.locator("h1.article-title")).toBeVisible();
      await expect(page.locator(`a.article-calculator-button[href='${siteRoot}calculators/sip/']`)).toBeVisible();
      await expect(page.locator(".article-hero-image img")).toBeVisible();
      const text = await page.locator("article.article").innerText();
      expect(text).not.toMatch(/you will earn|best return|safest|recommended (fund|investment)/i);
      expect(unqualifiedGuarantees(text)).toEqual([]);
    }
  });
});
