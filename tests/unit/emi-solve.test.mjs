/**
 * Calculators Ecosystem 2.0, pack 45: tenure and rate solving for the EMI Calculator.
 * Expected values are LITERALS from docs/ecosystem-review/calculators/formula-reference-check.py
 * (50-digit Decimal, written from the textbook definitions), not derived from the code under test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { payoffSchedule, rateForEmi, yearlySummary, MAX_PAYMENTS } from "../../assets/js/calculators/formulas/emi-solve.js";
import { calculateAmortization, calculateEMI } from "../../assets/js/calculators/formulas/loan.js";

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test("tenure: 10,00,000 at 9% with EMI 15,000 takes 93 payments, the last 11,496.54", () => {
    const r = payoffSchedule(1_000_000, 9, 15000);
    assert.equal(r.state, "payoff");
    assert.equal(r.payments, 93);
    near(r.lastPayment, 11496.54, 0.005, "last payment");
    near(r.totalInterest, 391496.54, 0.01, "total interest");
    near(r.totalPayment, 1_391_496.54, 0.01, "total payment");
    assert.equal(r.rows.length, 93);
    assert.equal(r.rows.at(-1).balance, 0);
});

test("tenure: 5,00,000 at 12% with EMI 20,000 takes 29 payments, the last 18,244.19", () => {
    const r = payoffSchedule(500_000, 12, 20000);
    assert.equal(r.payments, 29);
    near(r.lastPayment, 18244.19, 0.005, "last payment");
    near(r.totalInterest, 78244.19, 0.01, "total interest");
});

test("tenure: zero rate is the loan divided by the EMI", () => {
    const r = payoffSchedule(1_200_000, 0, 10000);
    assert.equal(r.payments, 120);
    assert.equal(r.totalInterest, 0);
    near(r.lastPayment, 10000, 1e-9, "last payment");
});

test("tenure: an EMI equal to the first month's interest does not reduce the balance", () => {
    const r = payoffSchedule(1_000_000, 9, 7500);
    assert.equal(r.state, "non-amortizing");
    near(r.firstInterest, 7500, 1e-9, "first month's interest");
    assert.equal(payoffSchedule(1_000_000, 9, 7000).state, "non-amortizing");
});

test("tenure: just above the first month's interest is beyond the 50-year horizon", () => {
    assert.equal(payoffSchedule(1_000_000, 9, 7501).state, "beyond-horizon");
    assert.equal(MAX_PAYMENTS, 600);
});

test("tenure: the EMI of a normal loan clears it in exactly its months (no phantom extra payment)", () => {
    for (const [p, rate, years] of [[1_000_000, 8.5, 20], [250_000, 11.25, 3], [5_000_000, 7, 30], [100_000, 0, 1]]) {
        const emi = calculateEMI(p, rate, years);
        const r = payoffSchedule(p, rate, emi);
        assert.equal(r.state, "payoff");
        assert.equal(r.payments, Math.round(years * 12), `${p} ${rate} ${years}`);
        near(r.lastPayment, emi, 0.01, "last payment");
    }
});

test("tenure: the schedule agrees with the existing amortization engine for the same loan", () => {
    const emi = calculateEMI(1_000_000, 8.5, 20);
    const mine = payoffSchedule(1_000_000, 8.5, emi).rows;
    const theirs = calculateAmortization(1_000_000, 8.5, 20);
    assert.equal(mine.length, theirs.length);
    for (const i of [0, 11, 119, 239]) {
        near(mine[i].interest, theirs[i].interest, 1e-6, `interest ${i}`);
        near(mine[i].balance, theirs[i].balance, 1e-5, `balance ${i}`);
    }
    // reference: month 1 interest 7,083.33 principal 1,594.90; balance after 12 payments 9,80,097.71
    near(mine[0].interest, 7083.33, 0.005, "month 1 interest");
    near(mine[0].principal, 1594.90, 0.005, "month 1 principal");
    near(mine[11].balance, 980097.71, 0.005, "balance after 12");
});

test("tenure: invalid input", () => {
    for (const args of [[0, 9, 100], [1000, -1, 100], [1000, 9, 0], [NaN, 9, 100]]) {
        assert.equal(payoffSchedule(...args).state, "invalid");
    }
});

test("rate: 10,00,000 over 240 months with EMI 9,000 is 9.004261% a year", () => {
    const r = rateForEmi(1_000_000, 240, 9000);
    assert.equal(r.state, "ok");
    near(r.annualRate, 9.004261, 5e-6, "rate");
});

test("rate: round trip through the EMI formula", () => {
    for (const [p, rate, years] of [[1_000_000, 8.5, 20], [250_000, 24, 2], [10_000_000, 0.5, 40], [50_000, 29.99, 1]]) {
        const emi = calculateEMI(p, rate, years);
        const r = rateForEmi(p, Math.round(years * 12), emi);
        near(r.annualRate, rate, 1e-7, `${p} ${rate} ${years}`);
    }
});

test("rate: an EMI that only repays the loan is 0%; one that cannot is refused", () => {
    near(rateForEmi(1_200_000, 120, 10000).annualRate, 0, 0, "zero rate");
    assert.equal(rateForEmi(1_000_000, 240, 4000).state, "too-low");
    assert.equal(rateForEmi(1000, 12, 1_000_000).state, "too-high");
    assert.equal(rateForEmi(0, 12, 100).state, "invalid");
});

test("yearly summary adds up to the loan and to the interest", () => {
    const rows = calculateAmortization(1_000_000, 8.5, 20);
    const years = yearlySummary(rows);
    assert.equal(years.length, 20);
    near(years.reduce((s, y) => s + y.principal, 0), 1_000_000, 1e-4, "principal");
    near(years.reduce((s, y) => s + y.interest, 0), 1082775.76, 0.01, "interest");
    near(years[0].balance, 980097.71, 0.005, "balance after year 1");
    near(years[19].balance, 0, 1e-6, "final balance");
    assert.equal(yearlySummary(payoffSchedule(500_000, 12, 20000).rows).length, 3);
});
