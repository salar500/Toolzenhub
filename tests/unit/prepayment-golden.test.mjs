/**
 * Loan Prepayment Calculator: the calculation engine (assets/js/calculators/formulas/prepayment.js),
 * its validation and the shared duration formatter.
 *
 * HOW THE EXPECTED VALUES WERE OBTAINED (they are NOT produced by the code under test)
 *   tests/fixtures/prepayment-golden.py recomputes every scenario with Python's decimal module
 *   (60 digits) in two independent ways, closed-form mathematics and a month-by-month simulation,
 *   and refuses to print a value unless they agree. The model is the standard reducing-balance loan:
 *       EMI = P i (1+i)^n / ((1+i)^n - 1),   B_k = P (1+i)^k - EMI ((1+i)^k - 1) / i
 *       a prepayment L is applied immediately after EMI number k, so the balance becomes B' = B_k - L
 *       keep the EMI:   months after = ceil( -ln(1 - B' i / EMI) / ln(1 + i) )
 *       reduce the EMI: EMI' = B' i (1+i)^(n-k) / ((1+i)^(n-k) - 1)
 *   Amounts below are rounded to the paisa; the tests allow one paisa of difference.
 *   To regenerate: python tests/fixtures/prepayment-golden.py
 *
 * Below the golden scenarios the tests check invariants (a prepayment never costs interest, keeping the
 * EMI never saves less than lowering it, an earlier prepayment never saves less, balances never rise),
 * agreement with closed forms written separately in this file over thousands of loans, the boundaries,
 * and the validation rules.
 */

// Golden data from tests/fixtures/prepayment-golden.py (amounts in rupees, as strings)
const GOLDEN = {
  "normal-now": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 300000,
      "afterMonths": 0
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "2500000.00",
    "clearsLoan": false,
    "prepaymentApplied": "300000.00",
    "balanceAfterPrepayment": "2200000.00",
    "keepEmi": {
      "totalMonths": 143,
      "monthsSaved": 37,
      "totalInterest": "1296129.43",
      "interestSaved": "635198.58",
      "lastPayment": "304.00"
    },
    "reduceEmi": {
      "emi": "21664.27",
      "emiReduction": "2954.22",
      "totalMonths": 180,
      "totalInterest": "1699568.65",
      "interestSaved": "231759.36"
    }
  },
  "normal-after-24": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 300000,
      "afterMonths": 24
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "2319918.32",
    "clearsLoan": false,
    "prepaymentApplied": "300000.00",
    "balanceAfterPrepayment": "2019918.32",
    "keepEmi": {
      "totalMonths": 148,
      "monthsSaved": 32,
      "totalInterest": "1426377.26",
      "interestSaved": "504950.75",
      "lastPayment": "7459.38"
    },
    "reduceEmi": {
      "emi": "21434.95",
      "emiReduction": "3183.54",
      "totalMonths": 180,
      "totalInterest": "1734696.18",
      "interestSaved": "196631.83"
    }
  },
  "normal-after-60": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 300000,
      "afterMonths": 60
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "1985591.17",
    "clearsLoan": false,
    "prepaymentApplied": "300000.00",
    "balanceAfterPrepayment": "1685591.17",
    "keepEmi": {
      "totalMonths": 155,
      "monthsSaved": 25,
      "totalInterest": "1591504.54",
      "interestSaved": "339823.47",
      "lastPayment": "257.24"
    },
    "reduceEmi": {
      "emi": "20898.92",
      "emiReduction": "3719.57",
      "totalMonths": 180,
      "totalInterest": "1784979.53",
      "interestSaved": "146348.48"
    }
  },
  "normal-after-120": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 300000,
      "afterMonths": 120
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "1199934.27",
    "clearsLoan": false,
    "prepaymentApplied": "300000.00",
    "balanceAfterPrepayment": "899934.27",
    "keepEmi": {
      "totalMonths": 163,
      "monthsSaved": 17,
      "totalInterest": "1799422.06",
      "interestSaved": "131905.95",
      "lastPayment": "11226.85"
    },
    "reduceEmi": {
      "emi": "18463.53",
      "emiReduction": "6154.96",
      "totalMonths": 180,
      "totalInterest": "1862030.45",
      "interestSaved": "69297.56"
    }
  },
  "small": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 25000,
      "afterMonths": 12
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "2413770.13",
    "clearsLoan": false,
    "prepaymentApplied": "25000.00",
    "balanceAfterPrepayment": "2388770.13",
    "keepEmi": {
      "totalMonths": 177,
      "monthsSaved": 3,
      "totalInterest": "1875175.51",
      "interestSaved": "56152.50",
      "lastPayment": "17321.46"
    },
    "reduceEmi": {
      "emi": "24363.51",
      "emiReduction": "254.98",
      "totalMonths": 180,
      "totalInterest": "1913491.43",
      "interestSaved": "17836.58"
    }
  },
  "large": {
    "input": {
      "balance": 2500000,
      "rate": "8.5",
      "remainingMonths": 180,
      "prepayment": 1500000,
      "afterMonths": 36
    },
    "baseline": {
      "emi": "24618.49",
      "totalInterest": "1931328.01",
      "totalRepayment": "4431328.01"
    },
    "balanceAtPrepayment": "2217770.87",
    "clearsLoan": false,
    "prepaymentApplied": "1500000.00",
    "balanceAfterPrepayment": "717770.87",
    "keepEmi": {
      "totalMonths": 69,
      "monthsSaved": 111,
      "totalInterest": "693113.61",
      "interestSaved": "1238214.41",
      "lastPayment": "19056.36"
    },
    "reduceEmi": {
      "emi": "7967.66",
      "emiReduction": "16650.83",
      "totalMonths": 180,
      "totalInterest": "1033607.99",
      "interestSaved": "897720.02"
    }
  },
  "short-tenure": {
    "input": {
      "balance": 400000,
      "rate": "10",
      "remainingMonths": 24,
      "prepayment": 100000,
      "afterMonths": 6
    },
    "baseline": {
      "emi": "18457.97",
      "totalInterest": "42991.29",
      "totalRepayment": "442991.29"
    },
    "balanceAtPrepayment": "307340.46",
    "clearsLoan": false,
    "prepaymentApplied": "100000.00",
    "balanceAfterPrepayment": "207340.46",
    "keepEmi": {
      "totalMonths": 18,
      "monthsSaved": 6,
      "totalInterest": "29360.30",
      "interestSaved": "13630.99",
      "lastPayment": "15574.80"
    },
    "reduceEmi": {
      "emi": "12452.26",
      "emiReduction": "6005.71",
      "totalMonths": 24,
      "totalInterest": "34888.55",
      "interestSaved": "8102.74"
    }
  },
  "long-tenure": {
    "input": {
      "balance": 8000000,
      "rate": "9",
      "remainingMonths": 360,
      "prepayment": 500000,
      "afterMonths": 60
    },
    "baseline": {
      "emi": "64369.81",
      "totalInterest": "15173131.37",
      "totalRepayment": "23173131.37"
    },
    "balanceAtPrepayment": "7670410.90",
    "clearsLoan": false,
    "prepaymentApplied": "500000.00",
    "balanceAfterPrepayment": "7170410.90",
    "keepEmi": {
      "totalMonths": 302,
      "monthsSaved": 58,
      "totalInterest": "11908245.59",
      "interestSaved": "3264885.78",
      "lastPayment": "32932.97"
    },
    "reduceEmi": {
      "emi": "60173.83",
      "emiReduction": "4195.98",
      "totalMonths": 360,
      "totalInterest": "14414336.82",
      "interestSaved": "758794.55"
    }
  },
  "low-interest": {
    "input": {
      "balance": 1200000,
      "rate": "4",
      "remainingMonths": 120,
      "prepayment": 200000,
      "afterMonths": 12
    },
    "baseline": {
      "emi": "12149.42",
      "totalInterest": "257929.99",
      "totalRepayment": "1457929.99"
    },
    "balanceAtPrepayment": "1100394.06",
    "clearsLoan": false,
    "prepaymentApplied": "200000.00",
    "balanceAfterPrepayment": "900394.06",
    "keepEmi": {
      "totalMonths": 98,
      "monthsSaved": 22,
      "totalInterest": "181682.55",
      "interestSaved": "76247.44",
      "lastPayment": "3189.14"
    },
    "reduceEmi": {
      "emi": "9941.22",
      "emiReduction": "2208.19",
      "totalMonths": 120,
      "totalInterest": "219445.06",
      "interestSaved": "38484.93"
    }
  },
  "high-interest": {
    "input": {
      "balance": 500000,
      "rate": "24",
      "remainingMonths": 60,
      "prepayment": 100000,
      "afterMonths": 0
    },
    "baseline": {
      "emi": "14383.98",
      "totalInterest": "363038.97",
      "totalRepayment": "863038.97"
    },
    "balanceAtPrepayment": "500000.00",
    "clearsLoan": false,
    "prepaymentApplied": "100000.00",
    "balanceAfterPrepayment": "400000.00",
    "keepEmi": {
      "totalMonths": 42,
      "monthsSaved": 18,
      "totalInterest": "190047.96",
      "interestSaved": "172991.02",
      "lastPayment": "304.66"
    },
    "reduceEmi": {
      "emi": "11507.19",
      "emiReduction": "2876.80",
      "totalMonths": 60,
      "totalInterest": "290431.18",
      "interestSaved": "72607.79"
    }
  },
  "near-payoff": {
    "input": {
      "balance": 1000000,
      "rate": "9",
      "remainingMonths": 120,
      "prepayment": 650000,
      "afterMonths": 12
    },
    "baseline": {
      "emi": "12667.58",
      "totalInterest": "520109.29",
      "totalRepayment": "1520109.29"
    },
    "balanceAtPrepayment": "935366.08",
    "clearsLoan": false,
    "prepaymentApplied": "650000.00",
    "balanceAfterPrepayment": "285366.08",
    "keepEmi": {
      "totalMonths": 37,
      "monthsSaved": 83,
      "totalInterest": "115776.68",
      "interestSaved": "404332.60",
      "lastPayment": "9743.90"
    },
    "reduceEmi": {
      "emi": "3864.69",
      "emiReduction": "8802.89",
      "totalMonths": 120,
      "totalInterest": "219397.10",
      "interestSaved": "300712.19"
    }
  },
  "payoff": {
    "input": {
      "balance": 1000000,
      "rate": "9",
      "remainingMonths": 120,
      "prepayment": 2000000,
      "afterMonths": 12
    },
    "baseline": {
      "emi": "12667.58",
      "totalInterest": "520109.29",
      "totalRepayment": "1520109.29"
    },
    "balanceAtPrepayment": "935366.08",
    "clearsLoan": true,
    "prepaymentApplied": "935366.08",
    "balanceAfterPrepayment": "0.00",
    "keepEmi": {
      "totalMonths": 12,
      "monthsSaved": 108,
      "totalInterest": "87377.01",
      "interestSaved": "432732.28"
    },
    "reduceEmi": null
  },
  "one-month-left": {
    "input": {
      "balance": 100000,
      "rate": "12",
      "remainingMonths": 1,
      "prepayment": 50000,
      "afterMonths": 0
    },
    "baseline": {
      "emi": "101000.00",
      "totalInterest": "1000.00",
      "totalRepayment": "101000.00"
    },
    "balanceAtPrepayment": "100000.00",
    "clearsLoan": false,
    "prepaymentApplied": "50000.00",
    "balanceAfterPrepayment": "50000.00",
    "keepEmi": {
      "totalMonths": 1,
      "monthsSaved": 0,
      "totalInterest": "500.00",
      "interestSaved": "500.00",
      "lastPayment": "50500.00"
    },
    "reduceEmi": {
      "emi": "50500.00",
      "emiReduction": "50500.00",
      "totalMonths": 1,
      "totalInterest": "500.00",
      "interestSaved": "500.00"
    }
  },
  "yearlyBalances-normal-after-24": {
    "1": {
      "withoutPrepayment": "2413770.13",
      "keepEmi": "2413770.13",
      "reduceEmi": "2413770.13"
    },
    "2": {
      "withoutPrepayment": "2319918.32",
      "keepEmi": "2019918.32",
      "reduceEmi": "2019918.32"
    },
    "3": {
      "withoutPrepayment": "2217770.87",
      "keepEmi": "1891253.60",
      "reduceEmi": "1930980.06"
    },
    "5": {
      "withoutPrepayment": "1985591.17",
      "keepEmi": "1598800.52",
      "reduceEmi": "1728824.65"
    },
    "10": {
      "withoutPrepayment": "1199934.27",
      "keepEmi": "609188.67",
      "reduceEmi": "1044764.89"
    },
    "12": {
      "withoutPrepayment": "779867.26",
      "keepEmi": "80073.13",
      "reduceEmi": "679018.81"
    },
    "15": {
      "withoutPrepayment": "0.00",
      "keepEmi": "0.00",
      "reduceEmi": "0.00"
    }
  },
  "interestInEmi-normal": {
    "1": {
      "interest": "17708.33",
      "shareOfEmiPercent": "71.9"
    },
    "61": {
      "interest": "14064.60",
      "shareOfEmiPercent": "57.1"
    },
    "121": {
      "interest": "8499.53",
      "shareOfEmiPercent": "34.5"
    }
  }
};

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculatePrepayment,
  validatePrepaymentInputs,
  buildSchedule,
  summarizeByYear,
  monthsFromYearsMonths,
  splitMonths,
  PREPAYMENT_LIMITS,
} from "../../assets/js/calculators/formulas/prepayment.js";
import { calculateEMI, calculateTotalInterest, calculateAmortization } from "../../assets/js/calculators/formulas/loan.js";
import { formatDuration } from "../../assets/js/calculators/common/formatter.js";

const num = (s) => Number(s);
const near = (actual, expected, label, tolerance = 0.011) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: got ${actual}, expected ${expected} (±${tolerance})`);

const SCENARIO_NAMES = Object.keys(GOLDEN).filter((k) => !k.startsWith("yearlyBalances") && !k.startsWith("interestInEmi"));
const run = (g) => calculatePrepayment({ balance: g.input.balance, annualRate: num(g.input.rate), remainingMonths: g.input.remainingMonths, prepayment: g.input.prepayment, afterMonths: g.input.afterMonths });

describe("golden scenarios: the engine equals the independent reference (to the paisa)", () => {
  for (const name of SCENARIO_NAMES) {
    test(name, () => {
      const g = GOLDEN[name];
      const r = run(g);
      near(r.baseline.emi, num(g.baseline.emi), "baseline EMI");
      near(r.baseline.totalInterest, num(g.baseline.totalInterest), "baseline interest");
      near(r.baseline.totalRepayment, num(g.baseline.totalRepayment), "baseline repayment");
      assert.equal(r.baseline.totalMonths, g.input.remainingMonths);
      near(r.prepaymentPoint.balanceBefore, num(g.balanceAtPrepayment), "balance at the prepayment");
      near(r.prepaymentPoint.applied, num(g.prepaymentApplied), "prepayment applied");
      near(r.prepaymentPoint.balanceAfter, num(g.balanceAfterPrepayment), "balance after the prepayment");
      assert.equal(r.prepaymentPoint.clearsLoan, g.clearsLoan);
      // keep the EMI
      assert.equal(r.keepEmi.totalMonths, g.keepEmi.totalMonths, "months with the EMI kept");
      assert.equal(r.keepEmi.monthsSaved, g.keepEmi.monthsSaved, "months saved");
      near(r.keepEmi.totalInterest, num(g.keepEmi.totalInterest), "interest, EMI kept");
      near(r.keepEmi.interestSaved, num(g.keepEmi.interestSaved), "interest saved, EMI kept");
      near(r.keepEmi.totalRepayment, g.input.balance + num(g.keepEmi.totalInterest), "total repayment, EMI kept");
      // reduce the EMI
      if (g.reduceEmi === null) {
        assert.equal(r.reduceEmi, null);
      } else {
        near(r.reduceEmi.emi, num(g.reduceEmi.emi), "reduced EMI");
        near(r.reduceEmi.emiReduction, num(g.reduceEmi.emiReduction), "EMI reduction");
        assert.equal(r.reduceEmi.totalMonths, g.input.remainingMonths);
        near(r.reduceEmi.totalInterest, num(g.baseline.totalInterest) - num(g.reduceEmi.interestSaved), "interest, EMI reduced");
        near(r.reduceEmi.interestSaved, num(g.reduceEmi.interestSaved), "interest saved, EMI reduced");
      }
    });
  }

  test("the yearly balance table equals the reference for the main scenario", () => {
    const r = run(GOLDEN["normal-after-24"]);
    for (const [year, expected] of Object.entries(GOLDEN["yearlyBalances-normal-after-24"])) {
      const row = r.yearly.find((x) => x.year === Number(year));
      assert.ok(row, `year ${year}`);
      near(row.withoutPrepayment, num(expected.withoutPrepayment), `year ${year} without`);
      near(row.keepEmi, num(expected.keepEmi), `year ${year} keep EMI`);
      near(row.reduceEmi, num(expected.reduceEmi), `year ${year} reduce EMI`);
    }
    assert.equal(r.yearly.length, 15);
  });

  test("the share of an EMI that is interest (quoted in an article) matches the existing schedule", () => {
    const schedule = calculateAmortization(2500000, 8.5, 15);
    for (const [payment, expected] of Object.entries(GOLDEN["interestInEmi-normal"])) {
      near(schedule[Number(payment) - 1].interest, num(expected.interest), `interest in EMI ${payment}`);
      near((schedule[Number(payment) - 1].interest / schedule[0].emi) * 100, num(expected.shareOfEmiPercent), `share of EMI ${payment}`, 0.06);
    }
  });
});

describe("the baseline is the existing loan maths, not a second copy", () => {
  test("EMI, interest and balances equal formulas/loan.js", () => {
    for (const [balance, rate, months] of [[2500000, 8.5, 180], [400000, 10, 24], [8000000, 9, 360], [100000, 12, 1], [1200000, 4, 123]]) {
      const r = calculatePrepayment({ balance, annualRate: rate, remainingMonths: months, prepayment: 1000, afterMonths: 0 });
      assert.equal(r.baseline.emi, calculateEMI(balance, rate, months / 12));
      near(r.baseline.totalInterest, calculateTotalInterest(balance, rate, months / 12), `interest ${balance}/${rate}/${months}`, 1e-6);
      const schedule = calculateAmortization(balance, rate, months / 12);
      // two floating-point routes to the same balance: agree to a ten-thousandth of a rupee
      for (const row of r.yearly) near(row.withoutPrepayment, row.year * 12 <= months ? schedule[row.year * 12 - 1].balance : 0, `year ${row.year}`, 1e-4);
    }
  });
});

// independent closed-form formulas, used only by these tests
const closedForm = ({ balance, annualRate, remainingMonths: n, prepayment: L, afterMonths: k }) => {
  const i = annualRate / 12 / 100;
  const emi = (balance * i * (1 + i) ** n) / ((1 + i) ** n - 1);
  const bk = balance * (1 + i) ** k - (emi * ((1 + i) ** k - 1)) / i;
  const after = bk - L;
  const realMonths = -Math.log(1 - (after * i) / emi) / Math.log(1 + i);
  const reducedEmi = (after * i * (1 + i) ** (n - k)) / ((1 + i) ** (n - k) - 1);
  return { emi, bk, after, realMonths, reducedEmi };
};

describe("invariants over a wide grid of loans", () => {
  const balances = [50000, 800000, 2500000, 30000000];
  const rates = [0.5, 4, 8.5, 14, 29];
  const tenures = [6, 37, 120, 180, 300, 480];
  const shares = [0.001, 0.05, 0.3, 0.7, 0.95];
  const cases = [];
  for (const balance of balances) for (const annualRate of rates) for (const remainingMonths of tenures) {
    const times = [0, Math.floor(remainingMonths / 3), remainingMonths - 1].filter((k, ix, a) => k >= 0 && a.indexOf(k) === ix);
    for (const afterMonths of times) for (const share of shares) {
      const probe = closedForm({ balance, annualRate, remainingMonths, prepayment: 0, afterMonths });
      const prepayment = Math.max(1, Math.round(probe.bk * share));
      cases.push({ balance, annualRate, remainingMonths, prepayment, afterMonths });
    }
  }

  test(`${cases.length} cases: everything finite, ordered and consistent`, () => {
    for (const c of cases) {
      const r = calculatePrepayment(c);
      const label = JSON.stringify(c);
      for (const v of [r.baseline.emi, r.baseline.totalInterest, r.keepEmi.interestSaved, r.keepEmi.totalInterest, r.savingPerRupee, r.prepaymentPoint.balanceAfter]) assert.ok(Number.isFinite(v), label);
      assert.ok(r.prepaymentPoint.balanceAfter <= r.prepaymentPoint.balanceBefore + 1e-9, `balance does not grow ${label}`);
      assert.ok(r.prepaymentPoint.applied <= c.prepayment + 1e-9, label);
      assert.ok(r.keepEmi.interestSaved >= -1e-6, `a prepayment never costs interest ${label}`);
      assert.ok(r.keepEmi.totalMonths <= c.remainingMonths, `keep EMI never lengthens ${label}`);
      assert.ok(r.keepEmi.monthsSaved >= 0 && r.keepEmi.monthsSaved <= c.remainingMonths - c.afterMonths, label);
      near(r.keepEmi.totalRepayment, c.balance + r.keepEmi.totalInterest, `repayment = principal + interest ${label}`, 1e-6);
      if (r.reduceEmi) {
        assert.ok(r.reduceEmi.emi <= r.baseline.emi + 1e-9, `reduced EMI is lower ${label}`);
        assert.ok(r.reduceEmi.interestSaved >= -1e-6, label);
        assert.ok(r.keepEmi.interestSaved >= r.reduceEmi.interestSaved - 1e-6, `keeping the EMI saves at least as much interest ${label}`);
        near(r.reduceEmi.totalRepayment, c.balance + r.reduceEmi.totalInterest, `repayment, reduced ${label}`, 1e-6);
      } else {
        assert.equal(r.prepaymentPoint.clearsLoan, true, label);
      }
      // the balance table: never negative, never rising, and repaid by the end
      for (const key of ["withoutPrepayment", "keepEmi", "reduceEmi"]) {
        let previous = Infinity;
        for (const row of r.yearly) {
          const value = row[key];
          if (value === null) continue;
          assert.ok(value >= 0 && Number.isFinite(value), `${key} balance valid ${label}`);
          assert.ok(value <= previous + 1e-6, `${key} balance does not rise ${label}`);
          previous = value;
        }
        const last = r.yearly[r.yearly.length - 1][key];
        if (last !== null) near(last, 0, `${key} reaches zero ${label}`, 1e-6);
      }
    }
  });

  test("the month-by-month engine agrees with the closed forms wherever the closed form is unambiguous", () => {
    let compared = 0;
    for (const c of cases) {
      const r = calculatePrepayment(c);
      if (r.prepaymentPoint.clearsLoan) continue;
      const f = closedForm(c);
      const frac = f.realMonths - Math.floor(f.realMonths);
      if (frac < 1e-6 || frac > 1 - 1e-6) continue; // right on a month boundary: either answer is defensible
      assert.equal(r.keepEmi.totalMonths, c.afterMonths + Math.ceil(f.realMonths), JSON.stringify(c));
      assert.ok(Math.abs(r.reduceEmi.emi - f.reducedEmi) <= 1e-6 * f.reducedEmi, `reduced EMI ${JSON.stringify(c)}`);
      compared++;
    }
    assert.ok(compared > 1000, `compared ${compared} cases`);
  });

  test("a larger prepayment never saves less interest, and an earlier one never saves less", () => {
    for (const [balance, annualRate, remainingMonths] of [[2500000, 8.5, 180], [800000, 14, 60], [30000000, 4, 300]]) {
      const saved = (prepayment, afterMonths) => calculatePrepayment({ balance, annualRate, remainingMonths, prepayment, afterMonths }).keepEmi.interestSaved;
      let previous = -Infinity;
      for (const fraction of [0.01, 0.05, 0.1, 0.25, 0.5, 0.75]) {
        const value = saved(balance * fraction, 12);
        assert.ok(value >= previous - 1e-6, `${balance}/${annualRate}/${remainingMonths} fraction ${fraction}`);
        previous = value;
      }
      let earlier = Infinity;
      for (const k of [0, 6, 24, 60, remainingMonths - 1].filter((v) => v <= remainingMonths - 1).sort((a, b) => a - b).filter((v, ix, a) => a.indexOf(v) === ix)) {
        const value = saved(balance * 0.1, k);
        assert.ok(value <= earlier + 1e-6, `timing ${k}`);
        earlier = value;
      }
    }
  });

  test("results are deterministic and the inputs are not changed", () => {
    const input = { balance: 2500000, annualRate: 8.5, remainingMonths: 180, prepayment: 300000, afterMonths: 24 };
    const copy = { ...input };
    assert.deepEqual(calculatePrepayment(input), calculatePrepayment(input));
    assert.deepEqual(input, copy);
  });
});

describe("boundaries", () => {
  const base = { balance: 1000000, annualRate: 9, remainingMonths: 120 };

  test("one payment left: the prepayment halves the last payment", () => {
    const r = calculatePrepayment({ balance: 100000, annualRate: 12, remainingMonths: 1, prepayment: 50000, afterMonths: 0 });
    assert.equal(r.keepEmi.totalMonths, 1);
    assert.equal(r.keepEmi.monthsSaved, 0);
    near(r.keepEmi.interestSaved, 500, "interest saved");
    near(r.reduceEmi.emi, 50500, "reduced EMI");
  });

  test("a prepayment equal to or above the balance clears the loan and only the balance is used", () => {
    const probe = calculatePrepayment({ ...base, prepayment: 1, afterMonths: 12 });
    for (const prepayment of [probe.prepaymentPoint.balanceBefore, probe.prepaymentPoint.balanceBefore + 1, 99999999]) {
      const r = calculatePrepayment({ ...base, prepayment, afterMonths: 12 });
      assert.equal(r.prepaymentPoint.clearsLoan, true);
      near(r.prepaymentPoint.applied, probe.prepaymentPoint.balanceBefore, "only the balance is used", 1e-6);
      assert.equal(r.keepEmi.totalMonths, 12);
      assert.equal(r.keepEmi.monthsSaved, 108);
      assert.equal(r.reduceEmi, null);
      near(r.prepaymentPoint.shareOfBalance, 1, "share", 1e-9);
    }
  });

  test("a prepayment within half a paisa of the balance counts as clearing it (no crumb month)", () => {
    const probe = calculatePrepayment({ ...base, prepayment: 1, afterMonths: 12 });
    const r = calculatePrepayment({ ...base, prepayment: probe.prepaymentPoint.balanceBefore - 0.001, afterMonths: 12 });
    assert.equal(r.prepaymentPoint.clearsLoan, true);
    assert.equal(r.keepEmi.totalMonths, 12);
  });

  test("the smallest allowed prepayment helps by a small, positive amount", () => {
    const r = calculatePrepayment({ ...base, prepayment: PREPAYMENT_LIMITS.prepayment.min, afterMonths: 0 });
    assert.ok(r.keepEmi.interestSaved > 0 && r.keepEmi.interestSaved < 10);
  });

  test("the last allowed payment point (every EMI but the last is already paid)", () => {
    const r = calculatePrepayment({ ...base, prepayment: 1000, afterMonths: 119 });
    assert.equal(r.keepEmi.totalMonths <= 120, true);
    assert.ok(Number.isFinite(r.reduceEmi?.emi ?? 0));
  });

  test("the longest loan and the largest amounts stay finite and exact enough", () => {
    const r = calculatePrepayment({ balance: 100000000, annualRate: 30, remainingMonths: 480, prepayment: 50000000, afterMonths: 100 });
    for (const v of [r.baseline.emi, r.keepEmi.interestSaved, r.reduceEmi.emi]) assert.ok(Number.isFinite(v) && v > 0);
    assert.equal(r.yearly.length, 40);
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const good = { balance: "2500000", rate: "8.5", years: "15", months: "0", prepayment: "300000", after: "0" };
  const errorsOf = (changes) => {
    const result = validatePrepaymentInputs({ ...good, ...changes });
    return result.ok ? null : result.errors;
  };

  test("valid input returns the values with the tenure in months", () => {
    const result = validatePrepaymentInputs({ ...good, years: "15", months: "6" });
    assert.equal(result.ok, true);
    assert.deepEqual(result.values, { balance: 2500000, annualRate: 8.5, remainingMonths: 186, prepayment: 300000, afterMonths: 0 });
  });

  test("numbers as well as strings are accepted", () => {
    assert.equal(validatePrepaymentInputs({ balance: 100000, rate: 10, years: 1, months: 0, prepayment: 5000, after: 0 }).ok, true);
  });

  test("the outstanding balance", () => {
    for (const balance of ["0", "-5", "999", "100000001", "", "abc", "1e400"]) assert.deepEqual(errorsOf({ balance })?.map((e) => e.fields.join()), ["balance"], balance);
    assert.equal(errorsOf({ balance: "1000" }), null);
    assert.equal(errorsOf({ balance: "100000000" }), null);
  });

  test("the interest rate", () => {
    for (const rate of ["0", "0.09", "30.01", "-1", "", "x"]) assert.deepEqual(errorsOf({ rate })?.map((e) => e.fields.join()), ["rate"], rate);
    assert.equal(errorsOf({ rate: "0.1" }), null);
    assert.equal(errorsOf({ rate: "30" }), null);
  });

  test("the remaining tenure: whole years and months, and at least one month", () => {
    assert.deepEqual(errorsOf({ years: "41" })?.map((e) => e.fields.join()), ["years"]);
    assert.deepEqual(errorsOf({ years: "1.5" })?.map((e) => e.fields.join()), ["years"]);
    assert.deepEqual(errorsOf({ years: "-1" })?.map((e) => e.fields.join()), ["years"]);
    assert.deepEqual(errorsOf({ months: "12" })?.map((e) => e.fields.join()), ["months"]);
    assert.deepEqual(errorsOf({ months: "2.5" })?.map((e) => e.fields.join()), ["months"]);
    assert.deepEqual(errorsOf({ years: "0", months: "0" })?.map((e) => e.fields.join("+")), ["years+months"]);
    assert.deepEqual(errorsOf({ years: "40", months: "1" })?.map((e) => e.fields.join("+")), ["years+months"]);
    assert.equal(errorsOf({ years: "0", months: "1" }), null);
    assert.equal(errorsOf({ years: "40", months: "0" }), null);
  });

  test("the prepayment amount", () => {
    for (const prepayment of ["0", "-1", "0.5", "100000001", "", "?"]) assert.deepEqual(errorsOf({ prepayment })?.map((e) => e.fields.join()), ["prepayment"], prepayment);
    assert.equal(errorsOf({ prepayment: "1" }), null);
  });

  test("when the prepayment is made: a whole number of EMIs, below the remaining payments", () => {
    for (const after of ["-1", "1.5", "180", "181", "", "n"]) assert.deepEqual(errorsOf({ after })?.map((e) => e.fields.join()), ["after"], after);
    assert.equal(errorsOf({ after: "179" }), null);
    assert.match(errorsOf({ after: "500" })[0].message, /from 0 to 179/);
  });

  test("several problems are all reported, each naming its fields; none is silently corrected", () => {
    const errors = errorsOf({ balance: "0", rate: "99", prepayment: "-1" });
    assert.deepEqual(errors.map((e) => e.fields[0]), ["balance", "rate", "prepayment"]);
    for (const e of errors) assert.ok(typeof e.message === "string" && e.message.length > 20);
  });

  test("a bad tenure does not also produce a confusing 'after' error for a fine value", () => {
    assert.deepEqual(errorsOf({ years: "0", months: "0", after: "5" })?.map((e) => e.fields.join("+")), ["years+months"]);
  });

  test("tenure helpers", () => {
    assert.equal(monthsFromYearsMonths(15, 6), 186);
    assert.deepEqual(splitMonths(186), { years: 15, months: 6 });
    assert.deepEqual(splitMonths(0), { years: 0, months: 0 });
    assert.deepEqual(splitMonths(-4), { years: 0, months: 0 });
  });
});

describe("duration formatting (shared formatter)", () => {
  test("years and months, with correct singular and plural", () => {
    const cases = [[0, "0 months"], [1, "1 month"], [2, "2 months"], [11, "11 months"], [12, "1 year"], [13, "1 year 1 month"], [24, "2 years"], [25, "2 years 1 month"], [37, "3 years 1 month"], [186, "15 years 6 months"], [480, "40 years"]];
    for (const [months, text] of cases) assert.equal(formatDuration(months), text, String(months));
  });

  test("anything that is not a positive number is zero months; fractions round", () => {
    for (const bad of [-3, NaN, undefined, null, "x", Infinity * 0]) assert.equal(formatDuration(bad), "0 months", String(bad));
    assert.equal(formatDuration(12.4), "1 year");
    assert.equal(formatDuration("14"), "1 year 2 months");
  });
});

describe("repayment schedule: the rows behind the totals", () => {
  const MAIN = GOLDEN["normal-after-24"];
  const sum = (rows, key) => rows.reduce((a, r) => a + r[key], 0);

  test("year-end closing balances equal the independent reference, for all three schedules", () => {
    const r = run(MAIN);
    const years = (key) => summarizeByYear(buildSchedule(r, key));
    for (const [year, expected] of Object.entries(GOLDEN["yearlyBalances-normal-after-24"])) {
      near(years("baseline").find((x) => x.year === Number(year)).closing, num(expected.withoutPrepayment), `year ${year} baseline`);
      near(years("keep").find((x) => x.year === Number(year))?.closing ?? 0, num(expected.keepEmi), `year ${year} keep`);
      near(years("reduce").find((x) => x.year === Number(year)).closing, num(expected.reduceEmi), `year ${year} reduce`);
    }
  });

  test("interest, principal and prepayment add up to the reference totals", () => {
    const r = run(MAIN);
    const base = buildSchedule(r, "baseline");
    const keep = buildSchedule(r, "keep");
    const reduce = buildSchedule(r, "reduce");
    near(sum(base, "interest"), num(MAIN.baseline.totalInterest), "baseline interest");
    near(sum(keep, "interest"), num(MAIN.keepEmi.totalInterest), "keep interest");
    near(sum(reduce, "interest"), num(MAIN.reduceEmi.totalInterest), "reduce interest");
    for (const rows of [base, keep, reduce]) {
      near(sum(rows, "principal") + sum(rows, "prepayment"), MAIN.input.balance, "everything borrowed is repaid");
      assert.equal(rows.at(-1).closing, 0);
    }
    assert.equal(base.length, 180);
    assert.equal(keep.length, MAIN.keepEmi.totalMonths);
    assert.equal(reduce.length, 180);
  });

  test("the prepayment lands in month k (after EMI k) and only there; the EMI changes after it", () => {
    const r = run(MAIN);
    const k = MAIN.input.afterMonths;
    for (const key of ["keep", "reduce"]) {
      const rows = buildSchedule(r, key);
      assert.deepEqual(rows.filter((x) => x.prepayment > 0).map((x) => x.month), [k], key);
      near(rows[k - 1].prepayment, MAIN.input.prepayment, `${key} prepayment`);
      near(rows[k - 1].closing, rows[k - 1].opening - rows[k - 1].principal - MAIN.input.prepayment, `${key} month ${k} closing`);
    }
    assert.equal(buildSchedule(r, "baseline").some((x) => x.prepayment > 0), false);
    const reduce = buildSchedule(r, "reduce");
    near(reduce[k - 1].payment, r.baseline.emi, "EMI up to the prepayment");
    near(reduce[k].payment, r.reduceEmi.emi, "lower EMI after it");
    near(buildSchedule(r, "keep")[k].payment, r.baseline.emi, "kept EMI after it");
  });

  test("a prepayment before the first EMI is a month 0 row; it belongs to year 1", () => {
    const r = run(GOLDEN["normal-now"]);
    const rows = buildSchedule(r, "keep");
    assert.equal(rows[0].month, 0);
    assert.equal(rows[0].payment, 0);
    near(rows[0].prepayment, 300000, "month 0 prepayment");
    assert.equal(rows[1].month, 1);
    near(rows[1].opening, 2500000 - 300000, "first EMI starts from the reduced balance");
    const year1 = summarizeByYear(rows)[0];
    assert.equal(year1.year, 1);
    near(year1.opening, 2500000, "year 1 opens with the full balance");
    near(year1.prepayment, 300000, "year 1 shows the prepayment");
  });

  test("a prepayment that clears the loan ends the schedule, and there is no lower-EMI schedule", () => {
    const r = run(GOLDEN["payoff"]);
    const keep = buildSchedule(r, "keep");
    assert.equal(keep.at(-1).closing, 0);
    assert.equal(keep.length, r.keepEmi.totalMonths + (r.input.afterMonths === 0 ? 1 : 0));
    near(sum(keep, "principal") + sum(keep, "prepayment"), r.input.balance, "balance repaid");
    assert.deepEqual(buildSchedule(r, "reduce"), []);
  });

  test("every row is consistent over a grid, and unknown schedules are empty", () => {
    let checked = 0;
    for (const balance of [50000, 2500000, 90000000]) for (const rate of [0.5, 8.5, 24]) for (const months of [1, 7, 60, 240, 480]) {
      for (const k of [0, 1, Math.floor(months / 2), months - 1]) {
        if (k > months - 1) continue;
        const r = calculatePrepayment({ balance, annualRate: rate, remainingMonths: months, prepayment: balance * 0.1, afterMonths: k });
        for (const key of ["baseline", "keep", "reduce"]) {
          const rows = buildSchedule(r, key);
          if (key === "reduce" && !r.reduceEmi) { assert.deepEqual(rows, []); continue; }
          let previous = balance;
          for (const row of rows) {
            near(row.opening, previous, `${key} opening`, 1e-6 * balance);
            near(row.closing, row.opening - row.principal - row.prepayment, `${key} closing`, 1e-6 * balance);
            assert.ok(row.interest >= 0 && row.principal >= -1e-6 && row.closing >= 0, key);
            previous = row.closing;
          }
          assert.equal(rows.at(-1).closing, 0, key);
          checked++;
        }
      }
    }
    assert.ok(checked > 100, String(checked));
    const r = run(MAIN);
    assert.deepEqual(buildSchedule(r, "nope"), []);
  });
});
