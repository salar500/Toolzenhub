/**
 * Tool Pack 6: the figures quoted in the three Home Loan articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/home-loan-golden.py (Python decimal: the repayment is simulated
 * month by month and whole rupees are searched for the largest loan an EMI room clears; the "articles" block plus the scenarios).
 * The engine must reproduce them, and every figure written in an article, formatted the way the tool formats money, must appear
 * in the article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateHomeLoan } from "../../assets/js/calculators/formulas/home-loan.js";

const REF = {
  withExisting: { room: "30000.0000", loan: 3456925, emi: "29999.9983", repaid: "7199999.5944", interest: "3743074.5944", property: 3956925 },
  withoutExisting: { room: "40000.0000", loan: 4609233 },
  difference: 1152308,
  tenures: {
    10: { loan: 2419634, interest: "1180365.8598", repaid: "3599999.8598" },
    15: { loan: 3046490, interest: "2353508.5885", repaid: "5399998.5885" },
    20: { loan: 3456925, interest: "3743074.5944", repaid: "7199999.5944" },
    25: { loan: 3725657, interest: "5274342.7603", repaid: "8999999.7603" },
    30: { loan: 3901609, interest: "6898390.1640", repaid: "10799999.1640" },
  },
  tenureChange: { loan10to30: "61.247899", interest10to30Times: "5.84", loan20to30: "12.863571", interest20to30: "84.297427" },
  rates: { "7.5": 3723963, "8.5": 3456925, "9.5": 3218431, "10.5": 3004868 },
  rateSteps: { first: 267038, second: 238494, third: 213563 },
};

const SLUGS = ["how-much-home-loan-fits-your-emi-budget", "longer-tenure-bigger-loan-much-more-interest", "how-interest-rates-change-the-home-loan-you-can-borrow"];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/home-loan/${slug}.js`)).default);
const N = Number;
const near = (a, b, label, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const grouped = (n) => Math.round(N(n)).toLocaleString("en-IN");
const rupees = (n) => `₹${grouped(n)}`;
const paise = (n) => `₹${N(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const calc = (income, existing, share, rate, years, own = null) => calculateHomeLoan({ income, existing, share, rate, years, own });
// the example: ₹1,00,000 income, 40% for EMIs, ₹10,000 of existing EMIs, 8.5% a year over 20 years
const EXAMPLE = [100000, 10000, 40, 8.5, 20];
const room30000 = (rate, years) => calc(100000, 10000, 40, rate, years);

describe("the engine reproduces the reference figures behind the articles", () => {
  test("the example, the effect of existing EMIs, the tenures and the rates", () => {
    const r = calc(...EXAMPLE, 500000);
    near(r.room, N(REF.withExisting.room), "room");
    assert.equal(r.loan, REF.withExisting.loan);
    near(r.emi, N(REF.withExisting.emi), "emi");
    near(r.totalRepayment, N(REF.withExisting.repaid), "repaid");
    near(r.totalInterest, N(REF.withExisting.interest), "interest");
    assert.equal(r.property, REF.withExisting.property);
    const none = calc(100000, 0, 40, 8.5, 20);
    near(none.room, N(REF.withoutExisting.room), "room without existing EMIs");
    assert.equal(none.loan, REF.withoutExisting.loan);
    assert.equal(none.loan - r.loan, REF.difference);
    for (const [years, g] of Object.entries(REF.tenures)) {
      const row = r.tenureRows.find((x) => x.years === N(years));
      assert.equal(row.loan, g.loan, `${years} y loan`);
      near(row.interest, N(g.interest), `${years} y interest`);
      near(row.repaid, N(g.repaid), `${years} y repaid`);
    }
    for (const [rate, loan] of Object.entries(REF.rates)) assert.equal(room30000(N(rate), 20).loan, loan, `${rate}% loan`);
  });
});

describe("every figure in 'How much home loan fits your EMI budget?' is the calculator's", () => {
  test("income to room, room to loan, and own funds", async () => {
    const t = await text("how-much-home-loan-fits-your-emi-budget");
    const r = calc(...EXAMPLE, 500000);
    const none = calc(100000, 0, 40, 8.5, 20);
    has(t, [rupees(r.capacity), rupees(r.room), rupees(r.loan), paise(r.emi), paise(r.totalRepayment), paise(r.totalInterest), rupees(r.property)]);
    has(t, [rupees(none.room), rupees(none.loan), rupees(none.loan - r.loan), "₹10,000", "₹5,00,000", "₹1,00,000", "40%", "8.5%", "20 years"]);
    assert.equal(r.capacity - 10000, r.room);
    assert.equal(r.loan + 500000, r.property);
    assert.equal(calc(10000, 20000, 40, 8.5, 20).loan, 0); // existing payments above the share: a result, not an error
    has(t, ["a result, not an error"]);
  });
});

describe("every figure in 'Longer tenure, bigger loan, much more interest' is the calculator's", () => {
  test("five tenures, the percentage changes and the repayments", async () => {
    const t = await text("longer-tenure-bigger-loan-much-more-interest");
    const rows = room30000(8.5, 20).tenureRows;
    for (const row of rows) has(t, [rupees(row.loan), paise(row.interest), paise(row.repaid)]);
    const t10 = rows.find((x) => x.years === 10), t15 = rows.find((x) => x.years === 15), t20 = rows.find((x) => x.years === 20);
    const t25 = rows.find((x) => x.years === 25), t30 = rows.find((x) => x.years === 30);
    assert.equal(((t30.loan / t10.loan - 1) * 100).toFixed(2), "61.25");
    assert.equal((t30.interest / t10.interest).toFixed(1), "5.8");
    assert.equal(((t30.loan / t20.loan - 1) * 100).toFixed(2), "12.86");
    assert.equal(((t30.interest / t20.interest - 1) * 100).toFixed(2), "84.30");
    has(t, ["61.25%", "5.8 times", "12.86%", "84.30%"]);
    // the loan added by each step shrinks: about 6.3 lakh from 10 to 15 years, about 1.8 lakh from 25 to 30
    near((t15.loan - t10.loan) / 1e5, 6.27, "10 to 15 lakh", 0.05);
    near((t30.loan - t25.loan) / 1e5, 1.76, "25 to 30 lakh", 0.05);
    has(t, ["₹6.3 lakh", "₹1.8 lakh"]);
    const gains = rows.slice(1).map((row, i) => row.loan - rows[i].loan);
    assert.ok(gains.every((g, i) => i === 0 || g < gains[i - 1]), "each step fits less additional loan");
    assert.ok(rows.every((row, i) => i === 0 || row.interest > rows[i - 1].interest));
  });
});

describe("every figure in 'How interest rates change the home loan you can borrow' is the calculator's", () => {
  test("four rates, the steps between them and the whole fall", async () => {
    const t = await text("how-interest-rates-change-the-home-loan-you-can-borrow");
    const loans = [7.5, 8.5, 9.5, 10.5].map((rate) => room30000(rate, 20).loan);
    has(t, loans.map(rupees));
    const steps = loans.slice(1).map((l, i) => loans[i] - l);
    assert.deepEqual(steps, [REF.rateSteps.first, REF.rateSteps.second, REF.rateSteps.third]);
    has(t, steps.map(rupees));
    assert.ok(steps[0] > steps[1] && steps[1] > steps[2], "each point takes less than the one before");
    assert.equal(loans[0] - loans[3], 719095);
    has(t, ["₹7,19,095"]);
    assert.equal(((1 - loans[3] / loans[0]) * 100).toFixed(2), "19.31");
    has(t, ["19.31%", "₹30,000", "20 years", "7.5%", "8.5%", "9.5%", "10.5%"]);
  });
});

describe("trust and scope wording", () => {
  test("no eligibility, approval, advice, benchmark or tenure-recommendation language in any Home Loan article", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/\beligible\b/i, /\beligibility\b/i, /\bapproved\b/i, /\bapproval\b/i, /bank will (lend|give)/i, /lender will (lend|give)/i, /safely afford/i, /recommended/i, /best tenure/i, /ideal (tenure|emi)/i, /guaranteed/i, /longer is better/i, /shorter is better/i, /you should (take|choose|pick)/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      const unqualified = (word) => t.split(/(?<=[.!?"])\s+/).filter((x) => new RegExp(word, "i").test(x) && !/\b(not|no|nor|never)\b/i.test(x));
      assert.deepEqual(unqualified("forecast"), [], `${s}: forecast`);
      assert.deepEqual(unqualified("guarantee"), [], `${s}: guarantee`);
      assert.ok(/not a lender's|lender decides|a lender's/i.test(t), `${s}: says it is not a lender's decision`);
      assert.ok(/fees/i.test(t) && /(stamp duty|tax benefits|part-payments)/i.test(t), `${s}: states what is left out`);
    }
  });

  test("the articles stay out of tax benefits advice, credit score, age and employment rules, and prepayment or refinancing", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["credit score of", "section 80", "cibil", "refinanc", "balance transfer", "prepay"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});
