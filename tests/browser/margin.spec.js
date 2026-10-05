/**
 * Tool Pack 4 — Margin Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/margin-golden.py (Python decimal: derived
 * prices found by an integer search over paise, volume multiples checked by counting units), written here as literals.
 * The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: cost ₹600; work out from a selling price of ₹800; no discount.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#margin-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const IDS = {
  cost: "#margin-cost", price: "#margin-price", margin: "#margin-target-margin", markup: "#margin-target-markup", discount: "#margin-discount",
};
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) await page.locator(IDS[name]).fill(String(value));
}
const BASIS = { price: "Selling price", margin: "Target margin", markup: "Target markup" };
// the radio itself is visually hidden, its label is the control
const choose = (page, basis) => page.locator(".margin-basis__option", { hasText: BASIS[basis] }).click();
const radio = (page, basis) => page.locator(`input[name="margin-basis"][value="${basis}"]`);

// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/margin/");
  await page.locator("#margin-results .calculator-results__value").first().waitFor();
}
const rows = (page) => page.locator("#margin-results .calculator-results__table-wrapper tbody tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
// the words the tool must never use about a result
const BANNED = /\b(good|healthy|ideal|standard|industry)\s+margin|recommended price|expected sales|best pricing|predicted sales/i;

test.describe("Margin Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Margin Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("Margin Calculator");
    // Business has no landing page of its own, so its crumb is plain text, not a dead link
    await expect(crumb).toContainText(/business/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}business.html`]); // the category step links to the category page

    await expect(page.getByLabel("Cost per Unit")).toHaveValue("600");
    await expect(radio(page, "price")).toBeChecked();
    await expect(page.locator(IDS.price)).toHaveValue("800");
    await expect(page.locator(IDS.price)).toBeVisible();
    await expect(page.getByLabel("Discount (optional)")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export/i })).toHaveCount(0);

    // selling-price basis: the margin leads
    await expect(page.locator("#margin-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Margin");
    await expect(metric(page, "Margin")).toHaveText("25.00%");
    await expect(metric(page, "Selling price")).toHaveText("₹800.00");
    await expect(metric(page, "Profit per unit")).toHaveText("₹200.00");
    await expect(metric(page, "Markup")).toHaveText("33.33%");
    await expect(page.locator("#margin-results .calculator-results__item")).toHaveCount(4); // no duplicate metrics
    expectClean(watch);
  });

  test("only the value field of the chosen basis is shown", async ({ page, go }) => {
    await open(page, go);
    const visible = async () => [await page.locator(IDS.price).isVisible(), await page.locator(IDS.margin).isVisible(), await page.locator(IDS.markup).isVisible()];
    expect(await visible()).toEqual([true, false, false]);
    await choose(page, "margin");
    expect(await visible()).toEqual([false, true, false]);
    await choose(page, "markup");
    expect(await visible()).toEqual([false, false, true]);
    await choose(page, "price");
    expect(await visible()).toEqual([true, false, false]);
  });

  test("target margin: the price leads; cost 600 at 40% is ₹1,000.00 with a 66.67% markup", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "margin");
    await fill(page, { margin: 40 });
    await expect(page.locator("#margin-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Selling price");
    await expect(metric(page, "Selling price")).toHaveText("₹1,000.00");
    await expect(metric(page, "Profit per unit")).toHaveText("₹400.00");
    await expect(metric(page, "Margin")).toHaveText("40.00%");
    await expect(metric(page, "Markup")).toHaveText("66.67%");
    await expect(page.locator("#margin-results")).toContainText("target margin of 40%");
  });

  test("target markup: cost 600 at 40% is ₹840.00 with a 28.57% margin", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "markup");
    await fill(page, { markup: 40 });
    await expect(page.locator("#margin-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Selling price");
    await expect(metric(page, "Selling price")).toHaveText("₹840.00");
    await expect(metric(page, "Profit per unit")).toHaveText("₹240.00");
    await expect(metric(page, "Margin")).toHaveText("28.57%");
    await expect(metric(page, "Markup")).toHaveText("40.00%");
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { price: 1000 });
    await expect(metric(page, "Margin")).toHaveText("40.00%");
    await fill(page, { cost: 500 });
    await expect(metric(page, "Margin")).toHaveText("50.00%");
    await expect(metric(page, "Markup")).toHaveText("100.00%");
  });

  test("margin is not markup: the explanation names both figures", async ({ page, go }) => {
    await open(page, go);
    const note = page.locator("#margin-results .margin-note--plain").first();
    await expect(note).toContainText("Margin is profit as a share of the selling price");
    await expect(note).toContainText("Markup is the same profit as a share of the cost");
    await expect(note).toContainText("25.00%");
    await expect(note).toContainText("33.33%");
  });

  test("a derived price is rounded up to the paisa, and the figures follow it", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "margin");
    await fill(page, { cost: 333.33, margin: 35 });
    await expect(metric(page, "Selling price")).toHaveText("₹512.82"); // the exact price is 512.8153846...
    await expect(metric(page, "Profit per unit")).toHaveText("₹179.49");
    await expect(metric(page, "Margin")).toHaveText("35.00%"); // 35.0006%, at least the target
    await expect(metric(page, "Markup")).toHaveText("53.85%");
    await expect(page.locator("#margin-results .calculator-results__summary")).toContainText("rounded up to the next paisa");
    // an exact price needs no such sentence
    await fill(page, { cost: 600, margin: 40 });
    await expect(page.locator("#margin-results .calculator-results__summary")).not.toContainText("rounded up");
  });

  test("a price below cost is a calm loss result, not an error; zero profit says so", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { cost: 800, price: 700 });
    await expect(page.locator("#margin-results-error")).toHaveCount(0);
    await expect(metric(page, "Margin")).toHaveText("-14.29%");
    await expect(metric(page, "Markup")).toHaveText("-12.50%");
    await expect(metric(page, "Profit per unit")).toHaveText("-₹100.00");
    const summary = page.locator("#margin-results .calculator-results__summary");
    await expect(summary).toContainText("₹100.00 below its cost"); // stated in words, not only by a sign or a colour
    await expect(summary).not.toContainText(/mistake|warning|danger|loss-making|you are losing/i);
    await expect(page.locator("#margin-live")).toBeAttached();

    await fill(page, { cost: 450, price: 450 });
    await expect(metric(page, "Profit per unit")).toHaveText("₹0.00");
    await expect(metric(page, "Margin")).toHaveText("0.00%");
    await expect(summary).toContainText("no profit");
  });

  test("the smallest cost and the highest margin and markup are valid", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "margin");
    await fill(page, { cost: 0.01, margin: 50 });
    await expect(metric(page, "Selling price")).toHaveText("₹0.02");
    await fill(page, { cost: 100000000, margin: 95 });
    await expect(metric(page, "Selling price")).toHaveText("₹2,00,00,00,000.00");
    await choose(page, "markup");
    await fill(page, { cost: 250, markup: 1000 });
    await expect(metric(page, "Selling price")).toHaveText("₹2,750.00");
    await expect(page.locator("#margin-results-error")).toHaveCount(0);
  });

  test("switching the basis keeps the cost and carries the figures across", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "margin");
    await expect(page.locator(IDS.margin)).toHaveValue("25");
    await expect(page.getByLabel("Cost per Unit")).toHaveValue("600");
    await expect(metric(page, "Selling price")).toHaveText("₹800.00");
    await choose(page, "markup");
    await expect(page.locator(IDS.markup)).toHaveValue("33.3333");
    await expect(metric(page, "Selling price")).toHaveText("₹800.00"); // 33.3333% of 600 is 799.9998, rounded up to the next paisa
    await choose(page, "price");
    await expect(page.locator(IDS.price)).toHaveValue("800");
  });

  test("cost-change table: five rows with the price that keeps the margin", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: "If your cost changes" })).toBeVisible();
    await expect(rows(page)).toHaveCount(5);
    const expected = [
      ["-10%", "₹540.00", "32.50%", "₹720.00", "-10.00%"],
      ["-5%", "₹570.00", "28.75%", "₹760.00", "-5.00%"],
      ["0% (your cost)", "₹600.00", "25.00%", "₹800.00", "0.00%"],
      ["+5%", "₹630.00", "21.25%", "₹840.00", "+5.00%"],
      ["+10%", "₹660.00", "17.50%", "₹880.00", "+10.00%"],
    ];
    for (let i = 0; i < 5; i++) expect(await cells(rows(page).nth(i))).toEqual(expected[i]);
    const headers = await page.locator("#margin-results table thead th").allInnerTexts();
    expect(headers).toEqual(["Cost change", "New cost", "Margin at your price", "Price to keep your margin", "Change in price"]);
  });

  test("cost-change table is semantic and accessible", async ({ page, go }) => {
    await open(page, go);
    const table = page.locator("#margin-results table");
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(5);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(5);
    const region = page.locator("#margin-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /cost changes/i);
    await expect(page.locator("#margin-results table")).toHaveCount(1); // one table, no chart, no second view
    await expect(page.locator("#margin-results svg")).toHaveCount(0);
  });

  test("with a loss the table gives the price that covers the new cost, not a margin to keep", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { cost: 800, price: 700 });
    const headers = await page.locator("#margin-results table thead th").allInnerTexts();
    expect(headers[3]).toBe("Price to cover the new cost");
    expect(await cells(rows(page).nth(0))).toEqual(["-10%", "₹720.00", "-2.86%", "₹720.00", "+2.86%"]);
    expect(await cells(rows(page).nth(4))).toEqual(["+10%", "₹880.00", "-25.71%", "₹880.00", "+25.71%"]);
    await expect(page.locator("#margin-results")).toContainText("no margin to keep");
  });

  test("discount: hidden until entered; 10% off needs about 1.67 times the sales", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: "If you offer a discount" })).toHaveCount(0);
    await fill(page, { discount: 10 });
    await expect(page.getByRole("heading", { name: "If you offer a discount" })).toBeVisible();
    const card = page.locator("#margin-discount-card").locator("xpath=ancestor::section[1]");
    await expect(card).toContainText("₹720.00");
    await expect(card).toContainText("₹120.00");
    await expect(card).toContainText("16.67%");
    await expect(card).toContainText("1.67 times");
    const text = await page.locator("#margin-results").innerText();
    expect(text).toContain("break-even on volume, not a forecast of sales");
    expect(text).toContain("67% more units");
    await fill(page, { discount: 20 });
    await expect(card).toContainText("5.00 times");
    await fill(page, { discount: 0 });
    await expect(page.getByRole("heading", { name: "If you offer a discount" })).toHaveCount(0);
    await fill(page, { discount: "" });
    await expect(page.getByRole("heading", { name: "If you offer a discount" })).toHaveCount(0);
  });

  test("a discount that removes the profit has no finite volume multiple", async ({ page, go }) => {
    await open(page, go);
    for (const discount of [25, 30]) {
      await fill(page, { discount });
      const card = page.locator("#margin-discount-card").locator("xpath=ancestor::section[1]");
      await expect(card).toContainText("No finite number");
      await expect(page.locator("#margin-results")).toContainText("no number of extra sales");
      await expect(card).not.toContainText(/times/);
    }
  });

  test("a discount on a price at or below cost shows no multiple", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { cost: 800, price: 700, discount: 5 });
    await expect(page.locator("#margin-results")).toContainText("already at or below your cost");
    await expect(page.locator("#margin-discount-card").locator("xpath=ancestor::section[1]")).not.toContainText(/\d times/);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const cost = page.locator(IDS.cost);
    await cost.fill("0");
    const error = page.locator("#margin-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/cost per unit/i);
    await expect(cost).toHaveAttribute("aria-invalid", "true");
    await expect(cost).toHaveAttribute("aria-describedby", /margin-results-error/);
    await expect(page.locator("#margin-results .calculator-results__value")).toHaveCount(0);
    await expect(page.locator("#margin-results table")).toHaveCount(0);

    await cost.fill("600");
    await expect(error).toHaveCount(0);
    await expect(cost).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Margin")).toHaveText("25.00%");

    await choose(page, "margin");
    await fill(page, { margin: 100 });
    await expect(error).toContainText(/95%/);
    await expect(page.locator(IDS.margin)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(IDS.margin)).toHaveAttribute("aria-describedby", /margin-results-error/);
    await fill(page, { margin: 40 });
    await expect(error).toHaveCount(0);

    await choose(page, "markup");
    await fill(page, { markup: 1500 });
    await expect(error).toContainText(/1,000%/);
    await fill(page, { markup: 50 });

    await fill(page, { discount: 96 });
    await expect(error).toContainText(/discount/i);
    await expect(page.locator(IDS.discount)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { discount: "" });
    await expect(error).toHaveCount(0);
  });

  test("a hidden basis does not produce errors; the chosen basis is the one validated", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "margin");
    await page.locator(IDS.price).fill("-5", { force: true }); // a hidden field: ignored
    await fill(page, { margin: 30 });
    await expect(page.locator("#margin-results-error")).toHaveCount(0);
    await expect(metric(page, "Selling price")).toHaveText("₹857.15");
  });

  test("an emptied required field shows the prompt; the optional discount does not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(IDS.cost).fill("");
    await expect(page.locator("#margin-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#margin-results-error")).toHaveCount(0);
    await page.locator(IDS.cost).fill("600");
    await expect(metric(page, "Margin")).toHaveText("25.00%");
    await page.locator(IDS.price).fill("");
    await expect(page.locator("#margin-results .calculator-results__empty")).toBeVisible();
    await page.locator(IDS.price).fill("800");
    await fill(page, { discount: "" });
    await expect(metric(page, "Margin")).toHaveText("25.00%");
    await expect(page.locator("#margin-results .calculator-results__empty")).toHaveCount(0);
  });

  test("reset restores every default, the basis, and recomputes", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "markup");
    await fill(page, { cost: 123, markup: 77, discount: 12 });
    await expect(metric(page, "Selling price")).not.toHaveText("₹800.00");
    await page.getByRole("button", { name: "Reset" }).click();
    for (const [id, value] of [[IDS.cost, "600"], [IDS.price, "800"], [IDS.margin, "25"], [IDS.markup, "33.33"], [IDS.discount, ""]]) {
      await expect(page.locator(id)).toHaveValue(value);
    }
    await expect(radio(page, "price")).toBeChecked();
    await expect(page.locator(IDS.price)).toBeVisible();
    await expect(page.locator(IDS.markup)).toBeHidden();
    await expect(metric(page, "Margin")).toHaveText("25.00%");
    await expect(page.getByRole("heading", { name: "If you offer a discount" })).toHaveCount(0);
  });

  test("keyboard: the basis is a radio group with a legend; arrow keys change it; reset works from the keyboard", async ({ page, go }) => {
    await open(page, go);
    const group = page.locator("fieldset.margin-basis");
    await expect(group.locator("legend")).toHaveText("Work out from");
    await expect(group.locator("input[type=radio]")).toHaveCount(3);
    // the tick is drawn by CSS and must not become part of the accessible name
    for (const name of ["Selling price", "Target margin", "Target markup"]) await expect(page.getByRole("radio", { name, exact: true })).toHaveCount(1);
    await radio(page, "price").focus();
    await page.keyboard.press("ArrowRight");
    await expect(radio(page, "margin")).toBeChecked();
    await expect(page.locator(IDS.margin)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(radio(page, "markup")).toBeChecked();
    // the label shows a focus ring for the focused radio
    const outline = await radio(page, "markup").evaluate((el) => getComputedStyle(el.nextElementSibling).outlineStyle);
    expect(outline).not.toBe("none");
    await page.getByRole("button", { name: "Reset" }).focus();
    await page.keyboard.press("Enter");
    await expect(radio(page, "price")).toBeChecked();
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
    const live = page.locator("#margin-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
    await fill(page, { price: 1234 });
    await expect(live).toContainText(/Selling price .*margin .*markup/, { timeout: 5000 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the trust note and exclusions are visible next to the result; no advice or benchmark wording", async ({ page, go }) => {
    await open(page, go);
    const trust = page.locator("#margin-results .margin-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("Per unit, for the numbers you entered");
    for (const word of ["overheads", "fixed costs", "tax or GST", "returns", "other business costs", "without GST"]) await expect(trust).toContainText(word);
    await expect(trust).toContainText("not pricing advice");
    await fill(page, { discount: 10 });
    // the tool's own content (the related Profit card, which is Profit's text, is not part of it)
    const text = (await page.locator("#margin-results, .calculator-info").allInnerTexts()).join(" ");
    expect(text).not.toMatch(BANNED);
    // none of the out-of-scope features
    expect(text).not.toMatch(/break-even point|fixed cost per month|payback|ROI of/i);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reading the Result/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions and What Is Not Included/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(5);
    const main = page.locator("main");
    await expect(main).toContainText("A 25% markup is a 20% margin");
    await expect(main).toContainText("rounded up to the next paisa");
    await expect(main).toContainText("₹1,000.00"); // the example: a 40% margin on a cost of ₹600
    await expect(main).toContainText("1.67 times"); // the example's discount
  });

  test("Profit is its related calculator (the other Business tool that is live) and three curated articles", async ({ page, go, siteRoot }) => {
    await open(page, go);
    // since Tool Pack 5 the Profit Calculator is published, so Margin shows it; Coming soon ROI is not offered
    const related = page.locator(".related-calculator-card");
    await expect(related).toHaveCount(1);
    await expect(related.first()).toContainText("Profit Calculator");
    await expect(page.locator("a[href*='calculators/roi']")).toHaveCount(0);
    const cards = page.locator(".related-article-card");
    await expect(cards).toHaveCount(3);
    const hrefs = await cards.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([
      `${siteRoot}articles/margin/margin-vs-markup/`,
      `${siteRoot}articles/margin/price-a-product-for-a-target-margin/`,
      `${siteRoot}articles/margin/what-a-discount-really-costs-you/`,
    ]);
  });

  test("Margin is on the Home Featured Tools list as a live link", async ({ page, go, siteRoot }) => {
    await go("");
    const card = page.locator(`#popular-calculators a.calculator-card[href='${siteRoot}calculators/margin/']`);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("Margin Calculator");
  });

  test("all three articles render from static HTML and lead to the tool", async ({ page, go, siteRoot }) => {
    for (const slug of ["margin-vs-markup", "price-a-product-for-a-target-margin", "what-a-discount-really-costs-you"]) {
      await go(`articles/margin/${slug}/`);
      await expect(page.locator("h1.article-title")).toBeVisible();
      await expect(page.locator(`a.article-calculator-button[href='${siteRoot}calculators/margin/']`)).toBeVisible();
      await expect(page.locator(".article-hero-image img")).toBeVisible();
      const text = await page.locator("article.article").innerText();
      expect(text).not.toMatch(BANNED);
      expect(text).toMatch(/overheads/i);
      await expect(page.locator(".article-related-card")).toHaveCount(2);
    }
  });

  test("search finds it by name and by its aliases; Coming soon ROI is not offered as usable", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["margin", "profit margin calculator", "markup calculator", "selling price calculator"]) {
      await input.fill(query);
      const card = page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/margin/']`);
      await expect(card).toHaveCount(1);
      await expect(page.locator("#calculators-grid .calculator-card").first()).toContainText("Margin Calculator");
    }
    await input.fill("roi calculator");
    await expect(page.locator("#calculators-grid a.calculator-card[href*='calculators/roi']")).toHaveCount(0); // Coming soon: not a link
  });

  test("responsive: no horizontal overflow with every optional block open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { discount: 10 });
    await expect(page.locator("#margin-discount-card")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    for (const basis of ["price", "margin", "markup"]) {
      const box = await page.locator(".margin-basis__option", { hasText: BASIS[basis] }).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
    }
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    await choose(page, "margin");
    await expectNoHorizontalOverflow(page);
  });
});
