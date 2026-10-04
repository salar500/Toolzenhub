/**
 * Tool Pack 3: the figures quoted in the four SIP articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/sip-golden.py (Python decimal, each plan simulated month
 * by month; the "articles" block plus scenarios A, G and I). The engine must reproduce them, and every figure written in
 * an article, formatted the way the site formats whole rupees, must appear in the article text, so the text cannot drift
 * from the maths. A required SIP is shown rounded UP (a SIP that reaches the target), as the calculator does.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateSip } from "../../assets/js/calculators/formulas/sip.js";

const REF = {
  growthExceedsInvestmentYear: 13,
  year: {
    1: { invested: "120000.0000", value: "126702.8116" },
    5: { invested: "600000.0000", value: "780823.8111" },
    10: { invested: "1200000.0000", value: "2065520.2039" },
    15: { invested: "1800000.0000", value: "4179242.6576" },
  },
  lastThreeYearsAddToValue: "1391827.4069",
  lastThreeYearsShare: "33.30",
  stepUp: {
    0: { invested: "1800000.0000", value: "4179242.6576", finalMonthlySip: "10000.0000" },
    5: { invested: "2589427.6306", value: "5499930.7932", finalMonthlySip: "19799.3160" },
    10: { invested: "3812697.8033", value: "7437840.1044", finalMonthlySip: "37974.9834" },
  },
  targetByReturn: { 8: "28707.1607", 10: "23927.7803", 12: "19818.6200" },
  valueByReturn: { 8: "3483451.4309", 10: "4179242.6576", 12: "5045759.9951" },
  reachedPlan: { value: "49957395.9521", requiredStartingSip: "10008.5281" },
};

const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/sip/${slug}.js`)).default);
const rupees = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const up = (n) => rupees(Math.ceil(n));
const N = Number;
const near = (a, b, label, tol = 0.0101) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const plan = (monthlySip, annualReturn, years, stepUp = 0, target = null) => calculateSip({ monthlySip, annualReturn, months: years * 12, stepUp, target });
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };

describe("the engine reproduces the reference figures behind the articles", () => {
  test("yearly rows, step-ups, target, scenarios", () => {
    const base = plan(10000, 10, 15);
    for (const y of [1, 5, 10, 15]) {
      const row = base.yearly[y - 1];
      near(row.invested, N(REF.year[y].invested), `invested y${y}`);
      near(row.value, N(REF.year[y].value), `value y${y}`);
    }
    assert.equal(base.yearly.findIndex((r) => r.value - r.invested > r.invested) + 1, REF.growthExceedsInvestmentYear);
    const add = base.plan.estimatedValue - base.yearly[11].value;
    near(add, N(REF.lastThreeYearsAddToValue), "last three years");
    assert.equal((add / base.plan.estimatedValue * 100).toFixed(2), REF.lastThreeYearsShare);
    for (const s of [0, 5, 10]) {
      const p = plan(10000, 10, 15, s).plan;
      near(p.totalInvested, N(REF.stepUp[s].invested), `invested step-up ${s}`);
      near(p.estimatedValue, N(REF.stepUp[s].value), `value step-up ${s}`);
      near(p.finalMonthlySip, N(REF.stepUp[s].finalMonthlySip), `final SIP step-up ${s}`);
    }
    for (const r of [8, 10, 12]) {
      near(plan(10000, r, 15).plan.estimatedValue, N(REF.valueByReturn[r]), `value at ${r}`);
      near(plan(10000, r, 15, 0, 10000000).target.requiredStartingSip, N(REF.targetByReturn[r]), `required at ${r}`);
    }
    const reached = plan(50000, 12, 20, 0, 10000000);
    near(reached.plan.estimatedValue, N(REF.reachedPlan.value), "reached plan");
    near(reached.target.requiredStartingSip, N(REF.reachedPlan.requiredStartingSip), "reached plan required");
  });
});

describe("every figure in 'How a SIP grows' is the calculator's", () => {
  test("totals, year rows, the crossover year and the last three years", async () => {
    const t = await text("how-a-sip-grows");
    const b = plan(10000, 10, 15);
    has(t, [rupees(b.plan.totalInvested), rupees(b.plan.estimatedValue), rupees(b.plan.estimatedGrowth), b.plan.multiple.toFixed(2)]);
    for (const y of [1, 5, 10, 15]) has(t, [rupees(b.yearly[y - 1].invested), rupees(b.yearly[y - 1].value)]);
    has(t, [rupees(b.yearly[0].value - b.yearly[0].invested), rupees(b.plan.estimatedValue - b.yearly[11].value), "33.3%", "year 13"]);
  });
});

describe("every figure in 'How return assumptions change a SIP projection' is the calculator's", () => {
  test("scenario values, growth, differences and percentages", async () => {
    const t = await text("how-return-assumptions-change-a-sip-projection");
    const [lo, mid, hi] = [8, 10, 12].map((r) => plan(10000, r, 15).plan);
    has(t, [rupees(lo.estimatedValue), rupees(mid.estimatedValue), rupees(hi.estimatedValue), rupees(lo.estimatedGrowth), rupees(hi.estimatedGrowth), rupees(mid.totalInvested)]);
    has(t, [rupees(mid.estimatedValue - lo.estimatedValue), rupees(hi.estimatedValue - mid.estimatedValue), rupees(hi.estimatedValue - lo.estimatedValue)]);
    assert.equal(Math.round((1 - lo.estimatedValue / mid.estimatedValue) * 100), 17);
    assert.equal(Math.round((hi.estimatedValue / mid.estimatedValue - 1) * 100), 21);
    assert.equal(Math.round((hi.estimatedValue / lo.estimatedValue - 1) * 100), 45);
    has(t, ["17%", "21%", "45%"]);
  });
});

describe("every figure in 'Step-up SIP explained' is the calculator's", () => {
  test("invested, value, last-year SIP, multiples and the extra invested", async () => {
    const t = await text("step-up-sip-explained");
    const [f, s5, s10] = [0, 5, 10].map((s) => plan(10000, 10, 15, s).plan);
    has(t, [f, s5, s10].flatMap((p) => [rupees(p.totalInvested), rupees(p.estimatedValue)]));
    has(t, [rupees(s5.finalMonthlySip), rupees(s10.finalMonthlySip), rupees(s10.totalInvested - f.totalInvested), "₹11,000", "₹12,100"]);
    has(t, [f.multiple.toFixed(2), s5.multiple.toFixed(2), s10.multiple.toFixed(2)]);
    const y = plan(10000, 10, 15, 10).yearly;
    assert.deepEqual([y[0].monthlySip, y[1].monthlySip, y[2].monthlySip].map(Math.round), [10000, 11000, 12100]);
  });
});

describe("every figure in 'How much SIP do you need for a goal?' is the calculator's", () => {
  test("required SIP by return, the miss, the step-up case and the surplus case", async () => {
    const t = await text("how-much-sip-do-you-need-for-a-goal");
    const T = 10000000;
    const [r8, r10, r12] = [8, 10, 12].map((r) => plan(10000, r, 15, 0, T).target.requiredStartingSip);
    const base = plan(10000, 10, 15, 0, T);
    const step = plan(10000, 10, 15, 10, T);
    const surplus = plan(50000, 12, 20, 0, T);
    has(t, [up(r8), up(r10), up(r12), up(step.target.requiredStartingSip), up(surplus.target.requiredStartingSip)]);
    has(t, [rupees(base.plan.estimatedValue), rupees(-base.target.difference), rupees(step.plan.estimatedValue), rupees(-step.target.difference), rupees(surplus.plan.estimatedValue)]);
    assert.ok(surplus.target.reached && !base.target.reached && !step.target.reached);
    assert.equal(Math.round((r8 - r12) / 100) * 100, 8900, "a four-point difference in return is about 8,900 a month");
    assert.ok(t.includes("about ₹8,900"));
  });
});

describe("investment-trust wording", () => {
  test("no guarantee or certainty language in any SIP article", async () => {
    for (const s of ["how-a-sip-grows", "how-return-assumptions-change-a-sip-projection", "step-up-sip-explained", "how-much-sip-do-you-need-for-a-goal"]) {
      const t = (await text(s)).toLowerCase();
      for (const bad of ["guaranteed", "you will earn", "best return", "best sip", "risk-free", "assured return"]) {
        const i = t.indexOf(bad);
        assert.ok(i < 0 || /not|no |never|neither/.test(t.slice(Math.max(0, i - 40), i)), `${s}: "${bad}"`);
      }
      assert.ok(t.includes("not a forecast") || t.includes("not a promise") || t.includes("market risk") || t.includes("assumed"), `${s}: states it is an assumption`);
    }
  });
});
