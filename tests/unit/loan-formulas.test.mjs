/**
 * M0.6 — Golden / regression tests for the SHARED loan formulas.
 *
 *   assets/js/calculators/formulas/loan.js
 *
 * Both live calculators (EMI and Loan Comparison) import these functions, so they are the most
 * valuable numeric safety net. Run with:  npm run test:unit   (Node's built-in test runner)
 *
 * GOLDEN numbers below were computed independently with exact decimal arithmetic (Python
 * `decimal`, 60 digits), NOT with the code under test. Floating-point results are compared with a
 * numeric tolerance, never string equality.
 *
 * "KNOWN QUIRKS" at the bottom pin down CURRENT behaviour that looks unintended. They are
 * characterization tests: they document today's reality so that any future change is deliberate.
 * They are not an endorsement of the behaviour.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateEMI,
  calculateTotalRepayment,
  calculateTotalInterest,
  calculateAmortization,
} from "../../assets/js/calculators/formulas/loan.js";

/** assert |actual - expected| <= tol (absolute) */
function near(actual, expected, tol, msg = "") {
  assert.ok(Number.isFinite(actual), `${msg} expected a finite number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tol, `${msg} expected ${expected} ± ${tol}, got ${actual} (diff ${actual - expected})`);
}

/** [principal, annual rate %, years, months, EMI, total repayment, total interest] */
const GOLDEN = [
  [1000000, 8.5, 20, 240, 8678.2323336553, 2082775.760077, 1082775.760077],
  [100000, 12, 1, 12, 8884.8788678342, 106618.546414, 6618.546414], // classic textbook case: ₹8,884.88
  [500000, 10, 5, 60, 10623.5223556341, 637411.341338, 137411.341338],
  [2500000, 7.25, 15, 180, 22821.5720258497, 4107882.964653, 1607882.964653],
  [5000000, 9, 25, 300, 41959.8181817422, 12587945.454523, 7587945.454523],
  [75000, 18, 2, 24, 3744.3076477132, 89863.383545, 14863.383545],
  [300000, 6.5, 3, 36, 9194.7008629529, 331009.231066, 31009.231066],
  [100000, 10, 0.5, 6, 17156.1394185592, 102936.836511, 2936.836511], // fractional years -> rounded months
];

describe("calculateEMI — standard loans (golden values)", () => {
  for (const [p, r, y, months, emi] of GOLDEN) {
    it(`₹${p} @ ${r}% for ${y}y (${months} months) => ${emi.toFixed(2)}`, () => {
      near(calculateEMI(p, r, y), emi, 1e-6);
    });
  }

  it("agrees with an independent closed-form reference across a parameter grid", () => {
    const ref = (P, annual, years) => {
      const n = Math.round(years * 12);
      const i = annual / 1200;
      return (P * i * (1 + i) ** n) / ((1 + i) ** n - 1);
    };
    let checked = 0;
    for (const P of [10000, 250000, 1e6, 7.5e6, 1e8]) {
      for (const rate of [0.5, 5, 8.5, 12.75, 24, 30]) {
        for (const years of [1, 2, 5, 10, 20, 30, 40]) {
          const got = calculateEMI(P, rate, years);
          const want = ref(P, rate, years);
          assert.ok(Math.abs(got - want) <= want * 1e-12 + 1e-9, `P=${P} r=${rate} y=${years}: ${got} vs ${want}`);
          checked++;
        }
      }
    }
    assert.equal(checked, 5 * 6 * 7);
  });

  it("accepts numeric strings (form inputs are strings before Number())", () => {
    near(calculateEMI("1000000", "8.5", "20"), 8678.2323336553, 1e-6);
  });

  it("is monotonic: higher rate => higher EMI; longer tenure => lower EMI", () => {
    assert.ok(calculateEMI(1e6, 9, 20) > calculateEMI(1e6, 8, 20));
    assert.ok(calculateEMI(1e6, 8, 25) < calculateEMI(1e6, 8, 20));
  });
});

describe("calculateEMI — zero-interest loan", () => {
  for (const [p, years, months] of [
    [1200000, 10, 120],
    [90000, 1.5, 18],
    [500000, 5, 60],
  ]) {
    it(`₹${p} @ 0% for ${years}y => principal / ${months} months`, () => {
      near(calculateEMI(p, 0, years), p / months, 1e-9);
    });
  }
});

describe("calculateEMI — input validation (actual contract: invalid input => 0, never throws)", () => {
  const invalid = {
    "principal 0": [0, 8, 10],
    "principal negative": [-100000, 8, 10],
    "principal NaN": [NaN, 8, 10],
    "principal non-numeric string": ["abc", 8, 10],
    "principal null": [null, 8, 10],
    "principal undefined": [undefined, 8, 10],
    "principal Infinity": [Infinity, 8, 10],
    "rate negative": [100000, -1, 10],
    "rate NaN": [100000, NaN, 10],
    "rate non-numeric string": [100000, "x", 10],
    "rate Infinity": [100000, Infinity, 10],
    "years 0": [100000, 8, 0],
    "years negative": [100000, 8, -2],
    "years NaN": [100000, 8, NaN],
    "years non-numeric string": [100000, 8, "ten"],
  };
  for (const [label, args] of Object.entries(invalid)) {
    it(`${label} => 0`, () => {
      assert.doesNotThrow(() => calculateEMI(...args));
      assert.equal(calculateEMI(...args), 0);
    });
  }
});

describe("calculateTotalRepayment", () => {
  for (const [p, r, y, months, emi, total] of GOLDEN) {
    it(`₹${p} @ ${r}% for ${y}y => EMI × ${months} = ${total.toFixed(2)}`, () => {
      const got = calculateTotalRepayment(p, r, y);
      near(got, total, 1e-4);
      near(got, calculateEMI(p, r, y) * months, 1e-6, "relationship to EMI × months:");
    });
  }
  it("zero-interest loan repays exactly the principal", () => {
    near(calculateTotalRepayment(1200000, 0, 10), 1200000, 1e-6);
  });
});

describe("calculateTotalInterest", () => {
  for (const [p, r, y, , , total, interest] of GOLDEN) {
    it(`₹${p} @ ${r}% for ${y}y => repayment − principal = ${interest.toFixed(2)}`, () => {
      const got = calculateTotalInterest(p, r, y);
      near(got, interest, 1e-4);
      near(got, calculateTotalRepayment(p, r, y) - p, 1e-9, "relationship to repayment − principal:");
      near(total - p, interest, 1e-6, "golden data self-consistency:");
    });
  }
  it("zero-interest loan has (effectively) zero interest and is never negative", () => {
    const v = calculateTotalInterest(1200000, 0, 10);
    near(v, 0, 1e-6);
    assert.ok(v >= 0);
  });
});

describe("calculateAmortization", () => {
  const cases = [
    ["standard 20y", 1000000, 8.5, 20],
    ["short 1y", 100000, 12, 1],
    ["fractional 0.5y", 100000, 10, 0.5],
    ["zero interest", 1200000, 0, 10],
    ["long 40y", 5000000, 9, 40],
  ];
  for (const [label, P, rate, years] of cases) {
    describe(label, () => {
      const rows = calculateAmortization(P, rate, years);
      const months = Math.round(years * 12);
      const r = rate / 1200;
      const emi = calculateEMI(P, rate, years);

      it("has one row per month, numbered 1..n", () => {
        assert.equal(rows.length, months);
        rows.forEach((row, i) => assert.equal(row.month, i + 1));
      });

      it("interest portion = previous balance × monthly rate", () => {
        let balance = P;
        for (const row of rows) {
          near(row.interest, balance * r, 1e-6, `month ${row.month}:`);
          balance = row.balance;
        }
      });

      it("principal portion = EMI − interest (except the final-payment correction)", () => {
        rows.slice(0, -1).forEach((row) => near(row.principal, emi - row.interest, 1e-6, `month ${row.month}:`));
      });

      it("each row's payment equals principal + interest and ≈ the EMI", () => {
        rows.forEach((row) => {
          near(row.emi, row.principal + row.interest, 1e-9, `month ${row.month}:`);
          near(row.emi, emi, 1e-4, `month ${row.month}:`);
        });
      });

      it("balance declines every month and never goes negative", () => {
        let prev = P;
        for (const row of rows) {
          assert.ok(row.balance <= prev + 1e-9, `balance increased in month ${row.month}`);
          assert.ok(row.balance >= 0);
          prev = row.balance;
        }
      });

      it("final balance is ~0", () => near(rows.at(-1).balance, 0, 1e-6));

      it("principal portions sum to the original principal", () => {
        near(rows.reduce((s, x) => s + x.principal, 0), P, 1e-4);
      });

      it("interest portions sum to total interest", () => {
        near(rows.reduce((s, x) => s + x.interest, 0), calculateTotalInterest(P, rate, years), 1e-3);
      });
    });
  }

  describe("validation (actual contract: invalid input => empty schedule)", () => {
    for (const [label, args] of Object.entries({
      "principal 0": [0, 8, 10],
      "principal negative": [-1, 8, 10],
      "principal NaN": [NaN, 8, 10],
      "rate negative": [1e5, -1, 10],
      "years 0": [1e5, 8, 0],
      "years negative": [1e5, 8, -2],
      "years NaN": [1e5, 8, NaN],
      "non-numeric": ["abc", "x", "y"],
    })) {
      it(`${label} => []`, () => assert.deepEqual(calculateAmortization(...args), []));
    }
  });
});

/* ---------------------------------------------------------------------------------------------
 * KNOWN QUIRKS — characterization of CURRENT behaviour (pre-existing, not introduced by M0).
 * The UI cannot reach these today (minimum tenure is 1 year, inputs are range-limited), but they
 * are defects in the pure functions' contract. Reported in the M0 report; NOT fixed in M0.
 * If a future change fixes one, update the expectation deliberately.
 * ------------------------------------------------------------------------------------------- */
describe("KNOWN QUIRKS (characterization — current behaviour, not endorsed)", () => {
  it("tenure that rounds to 0 months: EMI is Infinity, totals are NaN, schedule is empty", () => {
    assert.equal(calculateEMI(100000, 10, 0.01), Infinity);
    assert.equal(calculateEMI(100000, 0, 0.01), Infinity);
    assert.ok(Number.isNaN(calculateTotalRepayment(100000, 10, 0.01)));
    assert.ok(Number.isNaN(calculateTotalInterest(100000, 10, 0.01)));
    assert.deepEqual(calculateAmortization(100000, 10, 0.01), []);
  });

  it("calculateTotalRepayment / calculateTotalInterest do not validate their own input", () => {
    assert.ok(Number.isNaN(calculateTotalRepayment(1e5, 8, NaN)));
    assert.ok(Number.isNaN(calculateTotalInterest(NaN, 8, 10)));
    assert.equal(calculateTotalInterest(-5, 8, 10), 5); // negative principal => positive "interest"
    assert.ok(Object.is(calculateTotalRepayment(1e5, 8, -2), -0)); // negative zero
  });
});
