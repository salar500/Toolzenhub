/**
 * M3: EMI numeric parity. Literals were captured from the live page BEFORE the migration
 * (formulas/loan.js + the page's own formatter), not derived from the code under test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateEMI, calculateTotalInterest, calculateTotalRepayment } from "../../assets/js/calculators/formulas/loan.js";
import { formatINR } from "../../assets/js/calculators/common/formatter.js";

const CASES = [
  // principal, rate, years, EMI, total interest, total repayment (as displayed)
  [1000000, 8.5, 20, "₹8,678", "₹10,82,776", "₹20,82,776"],
  [500000, 10, 5, "₹10,624", "₹1,37,411", "₹6,37,411"],
  [2500000, 7.25, 15, "₹22,822", "₹16,07,883", "₹41,07,883"],
  [1000, 1, 1, "₹84", "₹5", "₹1,005"],
  [100000000, 30, 40, "₹25,00,018", "₹1,10,00,08,545", "₹1,20,00,08,545"],
];

for (const [p, r, y, emi, interest, total] of CASES) {
  test(`EMI ${p} @ ${r}% for ${y}y`, () => {
    assert.equal(formatINR(calculateEMI(p, r, y)), emi);
    assert.equal(formatINR(calculateTotalInterest(p, r, y)), interest);
    assert.equal(formatINR(calculateTotalRepayment(p, r, y)), total);
  });
}

test("zero-interest loan splits the principal evenly (formula only; the form's minimum rate is 1%)", () => {
  assert.equal(calculateEMI(120000, 0, 1), 10000);
  assert.equal(calculateTotalInterest(120000, 0, 1), 0);
});

test("shared formatINR matches the formatter EMI used before M3 for every finite value", () => {
  const old = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  for (const v of [0, 0.4, 0.5, 84.2, 1005, 1234567.89, 1e8, 1.2e10]) assert.equal(formatINR(v), old.format(v));
});
