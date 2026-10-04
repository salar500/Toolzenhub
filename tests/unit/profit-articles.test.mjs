/**
 * Tool Pack 5: the figures quoted in the three Profit articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/profit-golden.py (Python decimal; break-even and target units
 * found by an integer search over whole units; every what-if row recomputed from scratch; the "articles" block). The engine
 * must reproduce them, and every figure written in an article, formatted the way the tool formats money, must appear in the
 * article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateProfit } from "../../assets/js/calculators/formulas/profit.js";

const REF = {
  contribution: "200.0000",
  breakEven: { units: 250, revenue: "200000.0000" },
  roundingExample: { contribution: "130.0000", fixedOverContribution: "384.6", units: 385 },
  targets: { 50000: { units: 500, revenue: "400000.0000" }, 100000: { units: 750, revenue: "600000.0000" }, 200000: { units: 1250, revenue: "1000000.0000" } },
  profitAt400: "30000.0000",
  levers: {
    "price-10": { profit: "-2000.0000", delta: "-32000.0000", breakEven: 417, value: "720" },
    "price+10": { profit: "62000.0000", delta: "32000.0000", breakEven: 179, value: "880" },
    "variable-10": { profit: "54000.0000", delta: "24000.0000", breakEven: 193, value: "540" },
    "variable+10": { profit: "6000.0000", delta: "-24000.0000", breakEven: 358, value: "660" },
    "units-10": { profit: "22000.0000", delta: "-8000.0000", breakEven: 250, value: "360" },
    "units+10": { profit: "38000.0000", delta: "8000.0000", breakEven: 250, value: "440" },
    "fixed-10": { profit: "35000.0000", delta: "5000.0000", breakEven: 225, value: "45000" },
    "fixed+10": { profit: "25000.0000", delta: "-5000.0000", breakEven: 275, value: "55000" },
  },
};

const SLUGS = ["how-to-find-your-break-even-point", "price-cost-or-volume-which-matters-most", "units-needed-for-a-target-profit"];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/profit/${slug}.js`)).default);
const N = Number;
const near = (a, b, label, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const grouped = (n) => Math.round(N(n)).toLocaleString("en-IN");
const rupees = (n) => `₹${grouped(n)}`;
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const calc = (price, variableCost, fixedCosts, units, target = null) => calculateProfit({ price, variableCost, fixedCosts, units, target });
const BASE = [800, 600, 50000, 400];

describe("the engine reproduces the reference figures behind the articles", () => {
  test("contribution, break-even, rounding, targets and the eight levers", () => {
    const r = calc(...BASE);
    near(r.contribution, N(REF.contribution), "contribution");
    near(r.profit, N(REF.profitAt400), "profit at 400");
    assert.equal(r.breakEvenUnits, REF.breakEven.units);
    near(r.breakEvenRevenue, N(REF.breakEven.revenue), "break-even revenue");
    const rounding = calc(730, 600, 50000, 500);
    near(rounding.contribution, N(REF.roundingExample.contribution), "rounding contribution");
    assert.equal(rounding.breakEvenUnits, REF.roundingExample.units);
    assert.equal((50000 / 130).toFixed(1), REF.roundingExample.fixedOverContribution);
    for (const [target, g] of Object.entries(REF.targets)) {
      const t = calc(...BASE, N(target)).target;
      assert.equal(t.units, g.units);
      near(t.revenue, N(g.revenue), `revenue for ${target}`);
    }
    for (const row of r.whatIf.filter((x) => x.key !== "base")) {
      const g = REF.levers[`${row.key}${row.change > 0 ? "+" : "-"}${Math.abs(row.change)}`];
      near(row.profit, N(g.profit), `${row.key}${row.change} profit`);
      near(row.delta, N(g.delta), `${row.key}${row.change} delta`);
      assert.equal(row.breakEven, g.breakEven, `${row.key}${row.change} break-even`);
      near(row.value, N(g.value), `${row.key}${row.change} value`, 1e-6);
    }
  });
});

describe("every figure in 'How to find your break-even point' is the calculator's", () => {
  test("the example, the rounding example and the units above and short", async () => {
    const t = await text("how-to-find-your-break-even-point");
    const base = calc(...BASE);
    has(t, [rupees(base.contribution), "250 units", rupees(base.breakEvenRevenue), rupees(base.profit), "150 units", "₹50,000", "₹800", "₹600"]);
    const loss = calc(800, 600, 50000, 200);
    has(t, [rupees(-loss.profit), `${loss.position.units} units`]);
    // the rounding example: price 730, contribution 130, 384.6 -> 385
    const r = calc(730, 600, 50000, 500);
    has(t, [rupees(r.contribution), "384.6", `${r.breakEvenUnits} units`, rupees(r.breakEvenRevenue)]);
    assert.equal(calc(730, 600, 50000, 384).profit, -80);
    assert.equal(calc(730, 600, 50000, 385).profit, 50);
    assert.equal(130 * 384, 49920);
    assert.equal(130 * 385, 50050);
    has(t, ["₹49,920", "₹50,050", "₹80", "₹50"]);
    assert.equal(calc(800, 600, 50000, 250).profit, 0);
    assert.equal(calc(800, 600, 0, 100).breakEvenUnits, 0);
    assert.equal(calc(600, 600, 50000, 400).breakEvenUnits, null);
  });
});

describe("every figure in 'Price, cost or volume: which matters most?' is the calculator's", () => {
  test("the starting point, all eight rows and the reasons", async () => {
    const t = await text("price-cost-or-volume-which-matters-most");
    const base = calc(...BASE);
    has(t, [rupees(base.profit), `${base.breakEvenUnits} units`, "₹80,000"]);
    assert.equal(base.contribution * 400, 80000);
    for (const row of base.whatIf.filter((x) => x.key !== "base")) {
      has(t, [rupees(Math.abs(row.profit)), rupees(Math.abs(row.delta))]);
      if (row.breakEven !== base.breakEvenUnits) has(t, [`${row.breakEven} units`]);
    }
    has(t, ["₹720", "₹880", "₹660", "₹540", "360 units", "440 units", "₹55,000", "₹45,000"]);
    // the ranking is the result of this example: price, then variable cost, then units, then fixed costs
    const move = (key) => Math.max(...base.whatIf.filter((x) => x.key === key).map((x) => Math.abs(x.delta)));
    assert.deepEqual(["price", "variable", "units", "fixed"].map(move), [32000, 24000, 8000, 5000]);
    assert.ok(move("price") > move("variable") && move("variable") > move("units") && move("units") > move("fixed"));
    // the reasons: 10% of 800 and of 600 on each of 400 units; 40 units at 200; 10% of 50,000 once
    assert.equal(80 * 400, 32000);
    assert.equal(60 * 400, 24000);
    assert.equal(40 * 200, 8000);
    assert.equal(50000 * 0.1, 5000);
    has(t, ["₹80 on each of 400 units", "40 units", "₹5,000 once"]);
    assert.equal(base.whatIf.find((x) => x.key === "price" && x.change === -10).profit, -2000);
    assert.ok(t.includes("loss of ₹2,000"));
  });
});

describe("every figure in 'How many units do you need for a target profit?' is the calculator's", () => {
  test("three targets, the units after the break-even, and the comparison with 400 units", async () => {
    const t = await text("units-needed-for-a-target-profit");
    for (const [target, g] of Object.entries(REF.targets)) {
      has(t, [`${grouped(g.units)} units`, rupees(g.revenue), rupees(target)]);
      const r = calc(...BASE, N(target)).target;
      assert.equal(r.units, g.units);
      has(t, [String(r.additional)]); // the units short of each target, for 400 units sold
      // contributions must total fixed costs + target
      assert.equal(200 * g.units >= 50000 + N(target), true);
      assert.equal(200 * (g.units - 1) < 50000 + N(target), true);
      // the units after the first 250 are what the target itself needs
      assert.equal(g.units - 250, (N(target)) / 200);
    }
    assert.deepEqual([50000, 100000, 200000].map((tg) => calc(...BASE, tg).target.additional), [100, 350, 850]);
    has(t, ["₹1,00,000", "₹1,50,000", "₹2,50,000", "₹10,00,000", "₹4,00,000", "₹6,00,000", "250 for ₹50,000, 500 for ₹1,00,000 and 1,000 for ₹2,00,000"]);
    assert.equal(calc(800, 600, 50000, 1000).profit, 150000);
    assert.equal(calc(800, 600, 50000, 1000, 100000).target.reached, true);
    assert.equal(calc(...BASE).profit, 30000);
  });
});

describe("trust and scope wording", () => {
  test("no benchmark, advice, forecast or guarantee claim in any Profit article", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/you will make/i, /\bsafe\b/i, /\bviable\b/i, /good profit/i, /healthy profit/i, /recommended (volume|price|units)/i, /guaranteed break-even/i, /industry (benchmark|average|standard)/i, /best business decision/i, /expected sales/i, /you should (sell|charge|price)/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      const unqualified = (word) => t.split(/(?<=[.!?"])\s+/).filter((x) => new RegExp(word, "i").test(x) && !/\b(not|no|nor|never)\b/i.test(x));
      assert.deepEqual(unqualified("forecast"), [], `${s}: forecast`);
      assert.deepEqual(unqualified("guarantee"), [], `${s}: guarantee`);
      assert.ok(/tax/i.test(t) && /depreciation/i.test(t) && /interest/i.test(t), `${s}: states what is left out`);
      assert.ok(/arithmetic, not advice|not a forecast|calculated figures/i.test(t) || /goal, not an expectation/i.test(t), `${s}: states what it is`);
    }
  });

  test("the articles stay out of ROI, payback, GST rates, Margin's price solver and multi-product modelling", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["payback", "roi ", "return on investment", "gst rate", "18%", "target margin", "markup", "inventory planning", "several products"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});
