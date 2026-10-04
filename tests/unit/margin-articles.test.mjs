/**
 * Tool Pack 4: the figures quoted in the three Margin articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/margin-golden.py (Python decimal; derived prices found
 * by an integer search over paise, volume multiples checked by counting units; the "articles" block plus the margin /
 * markup conversion). The engine must reproduce them, and every figure written in an article, formatted the way the
 * tool formats money and percentages, must appear in the article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateMargin } from "../../assets/js/calculators/formulas/margin.js";

const REF = {
  conversion: { 10: "9.090909", 25: "20.000000", 50: "33.333333", 100: "50.000000" },
  priceForMargin: { 25: "800.0000", 30: "857.1500", 40: "1000.0000" },
  profitForMargin: { 25: "200.0000", 30: "257.1500", 40: "400.0000" },
  markupAtMargin: { 25: "33.333333", 30: "42.858333", 40: "66.666667" },
  addMarginToCost: { 25: { price: "750.0000", margin: "20.000000" }, 40: { price: "840.0000", margin: "28.571429" } },
  discountOn800: {
    5: { price: "760.0000", profit: "160.0000", margin: "21.052632", multiple: "1.250000" },
    10: { price: "720.0000", profit: "120.0000", margin: "16.666667", multiple: "1.666667" },
    15: { price: "680.0000", profit: "80.0000", margin: "11.764706", multiple: "2.500000" },
    20: { price: "640.0000", profit: "40.0000", margin: "6.250000", multiple: "5.000000" },
    25: { price: "600.0000", profit: "0.0000", state: "none" },
  },
  discountOn1000: {
    10: { price: "900.0000", profit: "300.0000", multiple: "1.333333" },
    20: { price: "800.0000", profit: "200.0000", multiple: "2.000000" },
    30: { price: "700.0000", profit: "100.0000", multiple: "4.000000" },
  },
  costRise800: { 5: { cost: "630.00", margin: "21.250000", keep: "840.0000" }, 10: { cost: "660.00", margin: "17.500000", keep: "880.0000" } },
};

const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/margin/${slug}.js`)).default);
const N = Number;
const near = (a, b, label, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const frac = (p) => N(p) / 100;
// the way the tool writes things: money to the paisa with Indian grouping, percentages to two decimals, "about 1.67 times"
const money = (n) => `₹${N(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (f) => `${(f * 100).toFixed(2)}%`;
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const price = (cost, price, discount = null) => calculateMargin({ cost, basis: "price", value: price, discount });
const target = (cost, basis, value) => calculateMargin({ cost, basis, value });

describe("the engine reproduces the reference figures behind the articles", () => {
  test("conversions, target prices, the mistake, discounts and cost rises", () => {
    for (const [markup, margin] of Object.entries(REF.conversion)) near(target(1000, "markup", N(markup)).margin, frac(margin), `markup ${markup}`, 1e-8);
    for (const m of [25, 30, 40]) {
      const r = target(600, "margin", m);
      near(r.price, N(REF.priceForMargin[m]), `price at ${m}%`);
      near(r.profit, N(REF.profitForMargin[m]), `profit at ${m}%`);
      near(r.markup, frac(REF.markupAtMargin[m]), `markup at ${m}%`, 1e-8);
    }
    for (const m of [25, 40]) {
      const added = price(600, 600 * (1 + m / 100));
      near(added.price, N(REF.addMarginToCost[m].price), `adding ${m}%`);
      near(added.margin, frac(REF.addMarginToCost[m].margin), `margin after adding ${m}%`, 1e-8);
    }
    for (const [d, g] of Object.entries(REF.discountOn800)) {
      const r = price(600, 800, N(d)).discount;
      near(r.price, N(g.price), `800 at ${d}% off price`);
      near(r.profit, N(g.profit), `800 at ${d}% off profit`);
      if (g.state) assert.equal(r.state, g.state);
      else {
        near(r.margin, frac(g.margin), `800 at ${d}% off margin`, 1e-8);
        near(r.volumeMultiple, N(g.multiple), `800 at ${d}% off multiple`, 1e-6);
      }
    }
    for (const [d, g] of Object.entries(REF.discountOn1000)) {
      const r = price(600, 1000, N(d)).discount;
      near(r.price, N(g.price), `1000 at ${d}% off price`);
      near(r.profit, N(g.profit), `1000 at ${d}% off profit`);
      near(r.volumeMultiple, N(g.multiple), `1000 at ${d}% off multiple`, 1e-6);
    }
    for (const [c, g] of Object.entries(REF.costRise800)) {
      const row = price(600, 800).rows.find((x) => x.change === N(c));
      near(row.cost, N(g.cost), `cost +${c}%`, 1e-6);
      near(row.margin, frac(g.margin), `margin at cost +${c}%`, 1e-8);
      near(row.price, N(g.keep), `price to keep at cost +${c}%`);
    }
  });
});

describe("every figure in 'Margin vs markup' is the calculator's", () => {
  test("the example, the conversions and the pricing mistake", async () => {
    const t = await text("margin-vs-markup");
    const base = price(600, 800);
    has(t, [money(base.profit).replace(".00", ""), pct(base.margin), pct(base.markup)]);
    for (const [markup, margin] of Object.entries(REF.conversion)) has(t, [`${markup}% markup`, `${(frac(margin) * 100).toFixed(2)}%`]);
    for (const m of [25, 40]) has(t, [money(REF.addMarginToCost[m].price), pct(frac(REF.addMarginToCost[m].margin))]);
    has(t, [money(REF.priceForMargin[25]), money(REF.priceForMargin[40]), pct(frac(REF.markupAtMargin[40]))]);
    assert.ok(t.includes("A 25% markup is only a 20% margin") || t.includes("25% markup is only a 20% margin"));
  });
});

describe("every figure in 'How to price a product for a target margin' is the calculator's", () => {
  test("the three targets, the rounding and the cost rises", async () => {
    const t = await text("price-a-product-for-a-target-margin");
    has(t, [money(REF.priceForMargin[25]), money(REF.priceForMargin[30]), money(REF.priceForMargin[40]), "₹257.15", pct(frac(REF.markupAtMargin[25])), pct(frac(REF.markupAtMargin[40]))]);
    // the exact price behind the rounding example
    near(600 / 0.7, 857.142857, "exact price for 30%", 1e-6);
    assert.equal(target(600, "margin", 30).price, 857.15);
    near(price(600, 857.14).margin, 257.14 / 857.14, "857.14 would fall just short", 1e-12);
    assert.ok(price(600, 857.14).margin < 0.3 && price(600, 857.15).margin > 0.3);
    has(t, ["₹857.142857", "₹857.14"]);
    // 15 more points of margin add 200, a third of the cost
    near(target(600, "margin", 40).price - target(600, "margin", 25).price, 200, "rise", 1e-9);
    // adding the margin to the cost
    has(t, ["₹750.00", "20.00%"]);
    for (const c of ["5", "10"]) {
      const g = REF.costRise800[c];
      has(t, [money(g.cost), pct(frac(g.margin)), money(g.keep)]);
    }
    has(t, ["25.00%"]);
  });
});

describe("every figure in 'What a discount really costs you' is the calculator's", () => {
  test("prices, profits, shares of profit and sales multiples", async () => {
    const t = await text("what-a-discount-really-costs-you");
    const d = REF.discountOn800;
    has(t, [money(d[5].price), money(d[5].profit), money(d[10].price), money(d[10].profit), money(d[15].price), money(d[15].profit), money(d[20].price), money(d[20].profit), money(d[25].price)]);
    has(t, ["1.25 times", "about 1.67 times", "2.50 times", "5.00 times"]);
    for (const [pctOff, multiple] of [[5, "1.25"], [10, "1.67"], [15, "2.50"], [20, "5.00"]]) {
      assert.equal(price(600, 800, pctOff).discount.volumeMultiple.toFixed(2), multiple);
    }
    // the share of the profit that a discount is: 5% is 40 of 200 (20%), 10% is 80 (40%), 20% is 160 (80%), 25% is all of it
    for (const [pctOff, share] of [[5, 20], [10, 40], [20, 80], [25, 100]]) near(800 * pctOff / 100 / (800 - 600) * 100, share, `share at ${pctOff}%`, 1e-9);
    has(t, ["₹40", "20% of the ₹200 profit", "₹80", "40% of the profit", "₹160", "80% of the profit"]);
    // the 40% margin item
    const e = REF.discountOn1000;
    for (const [pctOff, multiple] of [[10, "1.33"], [20, "2.00"], [30, "4.00"]]) assert.equal(price(600, 1000, pctOff).discount.volumeMultiple.toFixed(2), multiple);
    has(t, ["about 1.33 times", "2.00 times", "4.00 times", "₹1,000", "a quarter of the profit"]);
    near(1000 * 0.1 / 400, 0.25, "10% of 1,000 is a quarter of the 400 profit", 1e-12);
    assert.equal(price(600, 800, 25).discount.state, "none");
    assert.equal(price(600, 800, 25).discount.volumeMultiple, null);
    assert.ok(e[10] && t.includes("16.67%") && t.includes("6.25%") && t.includes("25.00%") && t.includes("40.00%"));
    near(price(600, 800, 10).discount.margin, 0.1666667, "margin after 10% off", 1e-6);
    near(price(600, 800, 20).discount.margin, 0.0625, "margin after 20% off", 1e-9);
  });
});

describe("trust and scope wording", () => {
  const SLUGS = ["margin-vs-markup", "price-a-product-for-a-target-margin", "what-a-discount-really-costs-you"];

  test("no benchmark, advice or forecast language in any Margin article", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/good margin/i, /healthy margin/i, /ideal margin/i, /standard margin/i, /industry (margin|average|standard)/i, /recommended price/i, /best pricing/i, /you should (charge|price|offer)/i, /sales will (rise|increase|grow)/i, /expected sales/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      assert.ok(/overheads/i.test(t) && /fixed costs/i.test(t) && /tax/i.test(t), `${s}: states what is left out`);
      assert.ok(/not (advice|a forecast)|arithmetic, not/i.test(t) || /break-even/i.test(t) || /calculated figures/i.test(t) || /per-unit figures/i.test(t), `${s}: states what it is`);
    }
  });

  test("the articles stay in per-unit pricing: no break-even volume for fixed costs, ROI, payback, GST rates or multi-product modelling", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["payback", "roi ", "gst rate", "18%", "inventory", "fixed cost per month", "break-even point", "break-even sales"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});
