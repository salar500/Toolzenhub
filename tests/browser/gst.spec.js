/**
 * Tool Pack 8 — GST Calculator, realistic user flows.
 *
 * Expected figures are the independently derived values of tests/fixtures/gst-golden.py (Python Fraction / Decimal in whole paise:
 * Add rounds half up with exact fractions, Remove is a search over whole paise), written here as literals.
 * The test reads label -> value pairs and landmarks, not DOM positions.
 *
 * Default inputs: Add GST; Item 1 ₹10,000 at 18%; Items 2 to 4 empty.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#gst-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

const id = (kind, n) => `#gst-${kind}-${n}`;
async function fill(page, values) {
  for (const [name, value] of Object.entries(values)) {
    const [, kind, n] = /^(amount|rate)(\d)$/.exec(name);
    await page.locator(id(kind, n)).fill(String(value));
  }
}
const mode = (page, value) => page.locator(`.gst-mode__option:has(input[value="${value}"])`).click();
// the tool starts after the page loads: wait for the first result before interacting
async function open(page, go) {
  await go("calculators/gst/");
  await page.locator("#gst-results .calculator-results__value").first().waitFor();
}
const summary = (page) => page.locator("#gst-results .calculator-results__summary");
const tableRows = (page) => page.locator("#gst-results .calculator-results__table-wrapper tbody tr");
const total = (page) => page.locator("#gst-results .calculator-results__table-wrapper tfoot tr");
const cells = async (row) => row.locator("th, td").allInnerTexts();
// words the page must never use about a rate, an invoice or a result
const BANNED = /\b(correct (gst )?rate|current (gst )?rate|applicable rate|you must charge|gst-compliant|official calculation|legally required|standard rate|recommended rate)\b/i;
const unqualified = (text, word) => text.split(/(?<=[.!?])\s+/).filter((s) => new RegExp(word, "i").test(s) && !/\b(not|no|nor|never|does not|doesn't)\b/i.test(s));

test.describe("GST Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("GST Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    // Home > Calculators > Tax > GST Calculator, from the shared breadcrumb (not drawn by the tool)
    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("GST Calculator");
    await expect(crumb).toContainText(/tax/i);
    await expect(crumb).not.toContainText(/loans|business|investment/i);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
    const labels = (await crumb.locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 4)).toEqual(["home", "calculators", "tax", "gst calculator"]);

    await expect(page.locator("input[name='gst-mode']:checked")).toHaveValue("add");
    await expect(page.locator(id("amount", 1))).toHaveValue("10000");
    await expect(page.locator(id("rate", 1))).toHaveValue("18");
    for (const n of [2, 3, 4]) {
      await expect(page.locator(id("amount", n))).toHaveValue("");
      await expect(page.locator(id("rate", n))).toHaveValue("");
    }
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0); // live results
    await expect(page.getByRole("button", { name: /print|csv|export|download/i })).toHaveCount(0);

    await expect(page.locator("#gst-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Amount with GST");
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");
    await expect(metric(page, "Amount before GST")).toHaveText("₹10,000.00");
    await expect(metric(page, "GST")).toHaveText("₹1,800.00");
    await expect(metric(page, "GST as a share of the final amount")).toHaveText("15.25%");
    await expect(page.locator("#gst-results .calculator-results__item")).toHaveCount(4); // the answer and three supporting cards
    await expect(summary(page)).toContainText("₹10,000.00 before GST at your entered 18% rate becomes ₹11,800.00, including ₹1,800.00 GST.");
    await expect(page.locator("#gst-results table")).toHaveCount(0); // one item: no table
    expectClean(watch);
  });

  test("the answer and three supporting cards sit in a balanced two-by-two block (desktop)", async ({ page, go }) => {
    await open(page, go);
    if (page.viewportSize().width < 700) return; // one column on a phone: nothing to compare
    const boxes = await page.locator("#gst-results .calculator-results__item").evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; }));
    expect(boxes[0].y).toBe(boxes[1].y); // two to a row, no orphan
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[0].w).toBe(boxes[1].w);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  });

  test("Add GST: ₹1,000 at 18% is ₹180.00 of GST and ₹1,180.00, and the tax is 15.25% of the final amount", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 1000 });
    await expect(metric(page, "Amount with GST")).toHaveText("₹1,180.00");
    await expect(metric(page, "GST")).toHaveText("₹180.00");
    await expect(metric(page, "GST as a share of the final amount")).toHaveText("15.25%");
    await expect(summary(page)).toContainText("not the 18% rate you entered");
  });

  test("Remove GST: ₹1,180 at 18% is ₹1,000.00 before GST and ₹180.00 of GST, not ₹967.60", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "remove");
    await fill(page, { amount1: 1180 });
    await expect(page.locator("#gst-results .calculator-results__item--primary .calculator-results__label")).toHaveText("Amount before GST");
    await expect(metric(page, "Amount before GST")).toHaveText("₹1,000.00");
    await expect(metric(page, "GST")).toHaveText("₹180.00");
    await expect(metric(page, "Amount with GST")).toHaveText("₹1,180.00");
    await expect(page.locator("#gst-results")).not.toContainText("967.60");
    await expect(summary(page)).toContainText("₹1,180.00 including GST at your entered 18% rate contains ₹1,000.00 before GST and ₹180.00 GST.");
    await fill(page, { amount1: 1000 });
    await expect(metric(page, "Amount before GST")).toHaveText("₹847.46");
    await expect(metric(page, "GST")).toHaveText("₹152.54");
  });

  test("switching the mode keeps what was typed and changes the answer and its label", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 1180 });
    await expect(metric(page, "Amount with GST")).toHaveText("₹1,392.40");
    await mode(page, "remove");
    await expect(page.locator(id("amount", 1))).toHaveValue("1180");
    await expect(metric(page, "Amount before GST")).toHaveText("₹1,000.00");
    await mode(page, "add");
    await expect(metric(page, "Amount with GST")).toHaveText("₹1,392.40");
  });

  test("results update live as any field changes", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { rate1: 5 });
    await expect(metric(page, "GST")).toHaveText("₹500.00");
    await fill(page, { rate1: 12.5 });
    await expect(metric(page, "GST")).toHaveText("₹1,250.00");
    await fill(page, { amount1: 200 });
    await expect(metric(page, "GST")).toHaveText("₹25.00");
  });

  test("zero rate in both modes: nothing added or taken out, share 0.00%", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 1000, rate1: 0 });
    for (const m of ["add", "remove"]) {
      await mode(page, m);
      await expect(metric(page, "GST")).toHaveText("₹0.00");
      await expect(metric(page, "GST as a share of the final amount")).toHaveText("0.00%");
      await expect(metric(page, m === "add" ? "Amount with GST" : "Amount before GST")).toHaveText("₹1,000.00");
    }
    await expect(page.locator("#gst-results-error")).toHaveCount(0);
  });

  test("odd paisa rounds half up: ₹100.10 at 5% is ₹5.01; ₹99.99 at 5% is ₹5.00; ₹0.01 at 18% is ₹0.00", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: "100.10", rate1: 5 });
    await expect(metric(page, "GST")).toHaveText("₹5.01");
    await expect(metric(page, "Amount with GST")).toHaveText("₹105.11");
    await fill(page, { amount1: "99.99" });
    await expect(metric(page, "GST")).toHaveText("₹5.00");
    await fill(page, { amount1: "0.01", rate1: 18 });
    await expect(metric(page, "GST")).toHaveText("₹0.00");
    await expect(metric(page, "Amount with GST")).toHaveText("₹0.01");
  });

  test("the largest amount at the highest allowed rate is exact", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: "9999999999.99", rate1: 28 });
    await expect(metric(page, "GST")).toHaveText("₹2,80,00,00,000.00");
    await expect(metric(page, "Amount with GST")).toHaveText("₹12,79,99,99,999.99");
    await expectNoHorizontalOverflow(page);
  });

  test("a blank optional row is ignored, with no error; a rate without an amount does nothing", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { rate2: 5 });
    await expect(page.locator("#gst-results-error")).toHaveCount(0);
    await expect(page.locator("#gst-results table")).toHaveCount(0);
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");
  });

  test("an amount with no rate inherits Item 1's rate (the same rate gives one row)", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 1000, amount2: 500 });
    await expect(tableRows(page)).toHaveCount(1);
    expect(await cells(tableRows(page).nth(0))).toEqual(["18%", "₹1,500.00", "₹270.00", "₹1,770.00"]);
    expect(await cells(total(page))).toEqual(["Total", "₹1,500.00", "₹270.00", "₹1,770.00"]);
    await expect(metric(page, "Amount with GST")).toHaveText("₹1,770.00");
  });

  test("a mixed invoice: items grouped by rate, ascending, with a Total row", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 2000, rate1: 18, amount2: 1000, rate2: 5, amount3: 500, rate3: 18 });
    await expect(tableRows(page)).toHaveCount(2);
    expect(await cells(tableRows(page).nth(0))).toEqual(["5%", "₹1,000.00", "₹50.00", "₹1,050.00"]); // 5% first although it was entered second
    expect(await cells(tableRows(page).nth(1))).toEqual(["18%", "₹2,500.00", "₹450.00", "₹2,950.00"]);
    expect(await cells(total(page))).toEqual(["Total", "₹3,500.00", "₹500.00", "₹4,000.00"]);
    await expect(metric(page, "Amount with GST")).toHaveText("₹4,000.00");
    await expect(metric(page, "GST as a share of the final amount")).toHaveText("12.50%");
    await expect(summary(page)).toContainText("3 items, ₹3,500.00 before GST in all, become ₹4,000.00");
  });

  test("a mixed invoice in Remove mode splits the same figures back out", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "remove");
    await fill(page, { amount1: 1050, rate1: 5, amount2: 2360, rate2: 18, amount3: 590 });
    await fill(page, { rate3: 18 });
    expect(await cells(tableRows(page).nth(0))).toEqual(["5%", "₹1,000.00", "₹50.00", "₹1,050.00"]);
    expect(await cells(tableRows(page).nth(1))).toEqual(["18%", "₹2,500.00", "₹450.00", "₹2,950.00"]);
    expect(await cells(total(page))).toEqual(["Total", "₹3,500.00", "₹500.00", "₹4,000.00"]);
    await expect(metric(page, "Amount before GST")).toHaveText("₹3,500.00");
  });

  test("rates written differently (5, 5.0, 5.00) are one row; four different rates give four ascending rows", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: 100, rate1: "5", amount2: 100, rate2: "5.0", amount3: 100, rate3: "5.00" });
    await expect(tableRows(page)).toHaveCount(1);
    expect(await cells(tableRows(page).nth(0))).toEqual(["5%", "₹300.00", "₹15.00", "₹315.00"]);
    await fill(page, { rate1: 18, rate2: 28, rate3: 12, amount4: 100, rate4: 5 });
    await expect(tableRows(page)).toHaveCount(4);
    expect(await tableRows(page).evaluateAll((rows) => rows.map((r) => r.querySelector("th").textContent.trim()))).toEqual(["5%", "12%", "18%", "28%"]);
  });

  test("each item is rounded on its own: three items of ₹10.10 at 5% make ₹1.53 of GST, not ₹1.52", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount1: "10.10", rate1: 5, amount2: "10.10", amount3: "10.10" });
    expect(await cells(total(page))).toEqual(["Total", "₹30.30", "₹1.53", "₹31.83"]);
    await expect(metric(page, "GST")).toHaveText("₹1.53");
    await expect(page.locator("#gst-results")).toContainText("a total can differ by a paisa from GST worked out once on the grand total");
    await expect(page.locator("#gst-results .gst-note--trust")).toContainText("another billing system may round the grand total instead and differ by a paisa");
  });

  test("the by-rate table is semantic and accessible; there is no chart", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount2: 500, rate2: 5 });
    const table = page.locator("#gst-results table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator("thead th[scope='col']")).toHaveCount(4);
    await expect(table.locator("tbody th[scope='row']")).toHaveCount(2);
    await expect(table.locator("tfoot th[scope='row']")).toHaveText("Total");
    const region = page.locator("#gst-results .calculator-results__table-wrapper");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-label", /grouped by GST rate/);
    await expect(page.locator("#gst-results svg")).toHaveCount(0);
    await expect(page.locator("#gst-results canvas")).toHaveCount(0);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await open(page, go);
    const amount = page.locator(id("amount", 1));
    await amount.fill("0");
    const error = page.locator("#gst-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/between ₹0.01 and ₹99,99,99,999.99/);
    await expect(amount).toHaveAttribute("aria-invalid", "true");
    await expect(amount).toHaveAttribute("aria-describedby", /gst-results-error/);
    await expect(page.locator("#gst-results .calculator-results__value")).toHaveCount(0); // no stale numbers
    await amount.fill("10000");
    await expect(error).toHaveCount(0);
    await expect(amount).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");

    await fill(page, { amount1: "10000000000" });
    await expect(error).toContainText(/₹99,99,99,999.99/);
    await fill(page, { amount1: "10.005" });
    await expect(error).toContainText(/at most two decimals/);
    await fill(page, { amount1: -5 });
    await expect(error).toBeVisible();
    await fill(page, { amount1: 10000, rate1: 50.5 });
    await expect(error).toContainText(/between 0% and 50%/);
    await expect(page.locator(id("rate", 1))).toHaveAttribute("aria-invalid", "true");
    await fill(page, { rate1: -1 });
    await expect(error).toContainText(/between 0% and 50%/);
    await fill(page, { rate1: "18.005" });
    await expect(error).toContainText(/at most two decimals/);
    await fill(page, { rate1: 18, amount2: 100, rate2: 60 });
    await expect(error).toContainText(/Item 2:/);
    await expect(page.locator(id("rate", 2))).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(id("amount", 2))).not.toHaveAttribute("aria-invalid", "true");
    await fill(page, { amount2: "", rate2: "" });
    await expect(error).toHaveCount(0);
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");
  });

  test("an emptied Item 1 field shows the prompt; the optional items do not", async ({ page, go }) => {
    await open(page, go);
    await page.locator(id("amount", 1)).fill("");
    await expect(page.locator("#gst-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#gst-results-error")).toHaveCount(0);
    await page.locator(id("amount", 1)).fill("10000");
    await page.locator(id("rate", 1)).fill("");
    await expect(page.locator("#gst-results .calculator-results__empty")).toBeVisible();
    await page.locator(id("rate", 1)).fill("18");
    await fill(page, { amount2: "", rate2: "", amount3: "", rate3: "", amount4: "", rate4: "" });
    await expect(page.locator("#gst-results .calculator-results__empty")).toHaveCount(0);
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");
  });

  test("reset restores Add GST, Item 1 and clears Items 2 to 4", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "remove");
    await fill(page, { amount1: 555, rate1: 5, amount2: 100, rate2: 12, amount3: 50, amount4: 70, rate4: 28 });
    await expect(page.locator("#gst-results table")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("input[name='gst-mode']:checked")).toHaveValue("add");
    await expect(page.locator(id("amount", 1))).toHaveValue("10000");
    await expect(page.locator(id("rate", 1))).toHaveValue("18");
    for (const n of [2, 3, 4]) {
      await expect(page.locator(id("amount", n))).toHaveValue("");
      await expect(page.locator(id("rate", n))).toHaveValue("");
    }
    await expect(metric(page, "Amount with GST")).toHaveText("₹11,800.00");
    await expect(page.locator("#gst-results table")).toHaveCount(0);
  });

  test("keyboard: the mode radios use the arrow keys, the items follow in order, and Reset works", async ({ page, go }) => {
    await open(page, go);
    await page.locator("input[name='gst-mode']:checked").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("input[name='gst-mode']:checked")).toHaveValue("remove");
    await expect(page.getByRole("group", { name: "What You Are Starting From" }).getByRole("radio", { name: "Remove GST" })).toBeChecked();
    await page.keyboard.press("Tab");
    for (const sel of [id("amount", 1), id("rate", 1), id("amount", 2), id("rate", 2), id("amount", 3), id("rate", 3), id("amount", 4), id("rate", 4)]) {
      await expect(page.locator(sel)).toBeFocused();
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: "Reset" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("input[name='gst-mode']:checked")).toHaveValue("add");
    const outline = await page.getByRole("button", { name: "Reset" }).evaluate((el) => { el.focus(); return getComputedStyle(el).outlineStyle; });
    expect(outline).not.toBe("none");
  });

  test("the mode is a labelled radio group with a tick and a heavier border; each item is a labelled group", async ({ page, go }) => {
    await open(page, go);
    const group = page.getByRole("group", { name: "What You Are Starting From" });
    await expect(group.getByRole("radio")).toHaveCount(2);
    await expect(group).toContainText("Add GST: I have an amount before GST. Remove GST: I have an amount that already includes GST.");
    const style = await page.locator(".gst-mode__option:has(input[value='add']) span").evaluate((el) => ({ border: getComputedStyle(el).borderTopWidth, tick: getComputedStyle(el, "::before").content }));
    expect(style.border).toBe("2px");
    expect(style.tick).toContain("✓");
    for (const name of ["Item 1", "Item 2 (optional)", "Item 3 (optional)", "Item 4 (optional)"]) {
      await expect(page.getByRole("group", { name })).toHaveCount(1);
    }
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
    const live = page.locator("#gst-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await fill(page, { amount1: 1000 });
    await expect(live).toContainText("Amount with GST ₹1,180.00; GST ₹180.00.");
    const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the default rate is labelled an example, and the trust note and exclusions sit next to the result", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#gst-rate-1-hint")).toContainText("18% is only an example");
    const trust = page.locator("#gst-results .gst-note--trust");
    await expect(trust).toBeVisible();
    await expect(trust).toContainText("Calculated from the rate you entered");
    for (const word of ["does not decide whether GST applies", "which rate applies", "does not classify", "nearest paisa", "half up", "grand total", "HSN or SAC", "place of supply", "reverse charge", "input tax credit", "cess", "returns", "e-invoicing", "not tax advice"]) {
      await expect(trust, word).toContainText(new RegExp(word.replace(/ /g, "\\s+"), "i"));
    }
  });

  test("GST as a share of the final amount is kept apart from the rate", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#gst-results .calculator-results__label", { hasText: "GST as a share of the final amount" })).toHaveCount(1);
    await expect(page.locator("#gst-results")).not.toContainText(/effective (gst )?rate/i);
    const info = page.locator(".calculator-info");
    await expect(info.filter({ hasText: "Reading the Result" })).toContainText("smaller than the rate you entered");
  });

  test("no rate, classification, compliance or advice wording anywhere on the page", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount2: 500, rate2: 5 });
    const text = await page.locator(".calculator-page").innerText();
    expect(text).not.toMatch(BANNED);
    expect(unqualified(text, "compliant")).toEqual([]);
    expect(unqualified(text, "tax advice")).toEqual([]);
    expect(text).not.toMatch(/latest gst rate|gst rate (list|finder)|which gst rate to use is/i);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await open(page, go);
    const info = page.locator(".calculator-info");
    for (const heading of ["How to Use the GST Calculator", "Reading the Result", "Assumptions and What Is Not Included", "Example", "How It Is Calculated", "GST Calculator FAQ"]) {
      await expect(info.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(info.filter({ hasText: "Example" }).first()).toContainText("₹1,180.00");
    await expect(info.filter({ hasText: "Reading the Result" })).toContainText("₹1,180 less 18% would give ₹967.60");
    await expect(page.locator("details")).toHaveCount(5);
  });

  test("related: Margin and Profit are offered; the Old vs New Tax Regime Calculator shares the Tax category but is not related (autoRelated: false) and the other tools are not", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const related = page.locator(".related-calculator-card");
    const hrefs = await related.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/margin/`, `${siteRoot}calculators/profit/`]);
    await expect(page.locator("a[href*='calculators/income-tax']")).toHaveCount(0);
  });

  test("search finds it by name and by its aliases, not by rates or classification", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const query of ["gst", "gst calculator", "add gst", "remove gst", "gst inclusive exclusive", "reverse gst calculator"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/gst/']`), query).toHaveCount(1);
    }
    for (const query of ["gst rates", "latest gst rates", "gst rate finder", "hsn"]) {
      await input.fill(query);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/gst/']`), query).toHaveCount(0);
    }
    await input.fill("income tax");
    await expect(page.locator("#calculators-grid a.calculator-card[href*='income-tax']")).toHaveCount(1); // the live Old vs New Tax Regime Calculator
    await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/gst/']`)).toHaveCount(0);
  });

  test("responsive: no horizontal overflow with several items and the table open, and readable tap targets", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { amount2: 500, rate2: 5, amount3: 250, rate3: 12, amount4: 90, rate4: 28 });
    await expect(tableRows(page)).toHaveCount(4);
    await expectNoHorizontalOverflow(page);
    const reset = await page.getByRole("button", { name: "Reset" }).boundingBox();
    expect(reset.height).toBeGreaterThanOrEqual(36);
    expect(reset.x + reset.width).toBeLessThanOrEqual(page.viewportSize().width);
    for (const n of [1, 2, 3, 4]) {
      for (const kind of ["amount", "rate"]) {
        const box = await page.locator(id(kind, n)).boundingBox();
        expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
      }
    }
    for (const radio of await page.locator(".gst-mode__option span").all()) {
      expect((await radio.boundingBox()).height).toBeGreaterThanOrEqual(36);
    }
  });
});
