/**
 * Tool Pack 2: the figures quoted in the two Balance Transfer articles are the calculators' own numbers.
 *
 * ARTICLE_FIGURES holds the independent reference values of tests/fixtures/balance-transfer-golden.py (the "articles"
 * scenarios: Python decimal, each loan simulated month by month, charges added). Each figure written in an article is
 * formatted the way the site formats rupees and must appear in the article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateBalanceTransfer } from "../../assets/js/calculators/formulas/balance-transfer.js";
import { calculatePrepayment } from "../../assets/js/calculators/formulas/prepayment.js";
import { formatINR } from "../../assets/js/calculators/common/formatter.js";

const ARTICLE_FIGURES = {
  bigDrop: {
    baselineInterest: "2199011.0729",
    A_prepayOnly: { interest: "1441997.3467", interestSaved: "757013.7262", months: 140 },
    B_switchOnly: { interestPlusCharges: "1948828.0107", netSaved: "250183.0622" },
    C_switchThenPrepay: { interestPlusCharges: "1344313.9288", netSaved: "854697.1441", months: 144 },
  },
  smallDrop: {
    baselineInterest: "2199011.0729",
    A_prepayOnly: { interest: "1441997.3467", interestSaved: "757013.7262", months: 140 },
    B_switchOnly: { interestPlusCharges: "2162356.2078", netSaved: "36654.8651" },
    C_switchThenPrepay: { interestPlusCharges: "1465339.0476", netSaved: "733672.0252", months: 143 },
  },
};

const text = async (file) => {
  const article = (await import(`../../assets/js/data/articles/balance-transfer/${file}.js`)).default;
  return JSON.stringify(article);
};
const near = (a, b, label, tolerance = 0.0101) => assert.ok(Math.abs(a - b) <= tolerance, `${label}: ${a} vs ${b}`);
const N = (s) => Number(s);

const BASE = { balance: 2500000, currentRate: 9.5, currentMonths: 180, newRate: 8.5, newMonths: 180, currentCharges: 0, newCharges: 17500 };

describe("the engines reproduce the reference figures behind the articles", () => {
  for (const [name, newRate] of [["bigDrop", 8.5], ["smallDrop", 9.3]]) {
    test(name, () => {
      const f = ARTICLE_FIGURES[name];
      const prepay = calculatePrepayment({ balance: 2500000, annualRate: 9.5, remainingMonths: 180, prepayment: 300000, afterMonths: 0 });
      near(prepay.baseline.totalInterest, N(f.baselineInterest), "interest if nothing changes");
      near(prepay.keepEmi.interestSaved, N(f.A_prepayOnly.interestSaved), "prepay only");
      assert.equal(prepay.keepEmi.totalMonths, f.A_prepayOnly.months);
      const sw = calculateBalanceTransfer({ ...BASE, newRate });
      near(sw.decision.netSaving, N(f.B_switchOnly.netSaved), "switch only");
      const both = calculatePrepayment({ balance: 2500000, annualRate: newRate, remainingMonths: 180, prepayment: 300000 - 17500, afterMonths: 0 });
      near(prepay.baseline.totalInterest - (both.keepEmi.totalInterest + 17500), N(f.C_switchThenPrepay.netSaved), "switch then prepay");
      assert.equal(both.keepEmi.totalMonths, f.C_switchThenPrepay.months);
    });
  }
});

describe("every figure in 'Is a loan balance transfer worth it?' is the calculator's", () => {
  test("main example, small drop, short loan, longer tenure, break-even rates", async () => {
    const t = await text("is-a-loan-balance-transfer-worth-it");
    const base = calculateBalanceTransfer(BASE);
    const longer = calculateBalanceTransfer({ ...BASE, newMonths: 240 });
    const small = calculateBalanceTransfer({ balance: 1000000, currentRate: 8.5, currentMonths: 120, newRate: 8.4, newMonths: 120, currentCharges: 0, newCharges: 5000 });
    const short = calculateBalanceTransfer({ balance: 200000, currentRate: 12, currentMonths: 6, newRate: 10, newMonths: 6, currentCharges: 0, newCharges: 2000 });
    const heavy = calculateBalanceTransfer({ ...BASE, newCharges: 400000 });
    const figures = [
      formatINR(base.decision.netSaving), formatINR(base.decision.emiChange), formatINR(base.current.emi), formatINR(base.proposed.emi),
      formatINR(base.current.totalInterest), formatINR(base.proposed.totalInterest), formatINR(base.yearly[1].position),
      formatINR(longer.proposed.emi), formatINR(longer.decision.emiChange), formatINR(-longer.decision.netSaving),
      formatINR(small.decision.emiChange), formatINR(small.decision.netSaving), formatINR(-short.decision.netSaving), formatINR(short.decision.emiChange),
    ];
    for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`);
    assert.equal(base.decision.breakEven.month, 12);
    assert.equal(longer.decision.breakEven.month, 4);
    assert.equal(small.decision.breakEven.month, 94);
    assert.equal(short.decision.breakEven.kind, "never");
    assert.ok(t.includes("month 12") && t.includes("month 4") && t.includes("month 94") && t.includes("7 years 10 months"));
    assert.ok(t.includes("9.44%") && t.includes("7.99%"));
    assert.equal(base.breakEvenRate.rate.toFixed(2), "9.44");
    assert.equal(heavy.breakEvenRate.rate.toFixed(2), "7.99");
    assert.ok(heavy.decision.netSaving < 0, "at 8.5% the 4,00,000 charges do not pay back");
  });
});

describe("every figure in 'Balance transfer vs prepayment' is the calculators'", () => {
  test("the figures, the months and the per-rupee ratios", async () => {
    const t = await text("balance-transfer-vs-prepayment");
    const big = ARTICLE_FIGURES.bigDrop, small = ARTICLE_FIGURES.smallDrop;
    const figures = [
      formatINR(N(big.baselineInterest)), formatINR(N(big.A_prepayOnly.interestSaved)), formatINR(N(big.B_switchOnly.netSaved)),
      formatINR(N(big.C_switchThenPrepay.netSaved)), formatINR(N(small.B_switchOnly.netSaved)), formatINR(N(small.C_switchThenPrepay.netSaved)),
      formatINR(300000 - 17500),
    ];
    for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`);
    assert.ok(t.includes(`${big.A_prepayOnly.months} EMIs`) && t.includes(`${big.C_switchThenPrepay.months} EMIs`));
    const per = (saved, spent) => (N(saved) / spent).toFixed(2);
    assert.equal(per(big.B_switchOnly.netSaved, 17500), "14.30");
    assert.equal(per(small.B_switchOnly.netSaved, 17500), "2.09");
    assert.equal(per(big.A_prepayOnly.interestSaved, 300000), "2.52");
    assert.ok(t.includes("₹14.30") && t.includes("₹2.09") && t.includes("₹2.52"));
    // the order flips: with the small drop, prepaying alone beats switching and then prepaying
    assert.ok(N(small.A_prepayOnly.interestSaved) > N(small.C_switchThenPrepay.netSaved));
    assert.ok(N(big.C_switchThenPrepay.netSaved) > N(big.A_prepayOnly.interestSaved));
  });
});

describe("the catalog entry of the tool", () => {
  test("it is the reserved balance-transfer entry, now published, with the capabilities it really has", async () => {
    globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };
    const { getToolById, getPublishedTools } = await import("../../assets/js/data/tools.js");
    const tool = getToolById("balance-transfer");
    assert.equal(tool.status, "published");
    assert.equal(tool.title, "Loan Balance Transfer Calculator");
    assert.equal(tool.category, "loans");
    assert.deepEqual(tool.aliases, ["loan transfer", "refinance", "switch loan"]);
    assert.deepEqual(tool.relatedTools, ["prepayment", "emi", "loan-comparison"]);
    assert.equal(tool.relatedArticles.length, 4);
    const claimed = Object.entries(tool.capabilities).filter(([, v]) => v === true).map(([k]) => k).sort();
    assert.deepEqual(claimed, ["compare", "examples", "explanation", "localProcessing", "multipleInputs", "print", "realtime", "reset", "table", "validation"]);
    // no export, chart or schedule claimed: the pack decided against them
    for (const absent of ["download", "chart", "schedule", "copy", "share"]) assert.notEqual(tool.capabilities[absent], true, absent);
    assert.equal(getPublishedTools().filter((x) => x.id === "balance-transfer").length, 1, "one entry only");
    assert.match(String(tool.loader), /calculators\/balance-transfer\/index\.js/);
  });
});
