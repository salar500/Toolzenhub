/**
 * Tool Pack 7: the FD calculation engine against the independent reference.
 *
 * GOLDEN holds the output of tests/fixtures/fd-golden.py (Python decimal, 80 digits). The reference SIMULATES the deposit period by
 * period (interest added at the end of each completed compounding period, then simple interest pro rata for a broken period, which
 * is ToolZen Hub's own convention) and finds the effective yield by growing one year of periods one at a time. It does not use the
 * engine's closed form, so the two cannot agree by sharing a mistake. Regenerate the literal below by running the script.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateFd,
  validateFdInputs,
  tenureMonths,
  FD_LIMITS,
  COMPOUNDING,
} from "../../assets/js/calculators/formulas/fd.js";

const GOLDEN = {
 "scenarios": {
  "A_default_quarterly": {
   "principal": "100000",
   "rate": "7",
   "months": 60,
   "compounding": "quarterly",
   "completedPeriods": 20,
   "remainingMonths": 0,
   "maturity": "141477.81957558",
   "interest": "41477.81957558",
   "effectiveYieldPercent": "7.18590313",
   "totalGrowthPercent": "41.47781958"
  },
  "B_monthly": {
   "principal": "100000",
   "rate": "7",
   "months": 60,
   "compounding": "monthly",
   "completedPeriods": 60,
   "remainingMonths": 0,
   "maturity": "141762.52596140",
   "interest": "41762.52596140",
   "effectiveYieldPercent": "7.22900809",
   "totalGrowthPercent": "41.76252596"
  },
  "C_half_yearly": {
   "principal": "100000",
   "rate": "7",
   "months": 60,
   "compounding": "half-yearly",
   "completedPeriods": 10,
   "remainingMonths": 0,
   "maturity": "141059.87606211",
   "interest": "41059.87606211",
   "effectiveYieldPercent": "7.12250000",
   "totalGrowthPercent": "41.05987606"
  },
  "D_yearly": {
   "principal": "100000",
   "rate": "7",
   "months": 60,
   "compounding": "yearly",
   "completedPeriods": 5,
   "remainingMonths": 0,
   "maturity": "140255.17307000",
   "interest": "40255.17307000",
   "effectiveYieldPercent": "7.00000000",
   "totalGrowthPercent": "40.25517307"
  },
  "E_exact_period_3y_monthly": {
   "principal": "100000",
   "rate": "7",
   "months": 36,
   "compounding": "monthly",
   "completedPeriods": 36,
   "remainingMonths": 0,
   "maturity": "123292.55874769",
   "interest": "23292.55874769",
   "effectiveYieldPercent": "7.22900809",
   "totalGrowthPercent": "23.29255875"
  },
  "E2_exact_period_2y_yearly": {
   "principal": "100000",
   "rate": "7",
   "months": 24,
   "compounding": "yearly",
   "completedPeriods": 2,
   "remainingMonths": 0,
   "maturity": "114490.00000000",
   "interest": "14490.00000000",
   "effectiveYieldPercent": "7.00000000",
   "totalGrowthPercent": "14.49000000"
  },
  "E3_exact_period_1y_yearly": {
   "principal": "100000",
   "rate": "7",
   "months": 12,
   "compounding": "yearly",
   "completedPeriods": 1,
   "remainingMonths": 0,
   "maturity": "107000.00000000",
   "interest": "7000.00000000",
   "effectiveYieldPercent": "7.00000000",
   "totalGrowthPercent": "7.00000000"
  },
  "F_partial_14m_quarterly": {
   "principal": "100000",
   "rate": "7",
   "months": 14,
   "compounding": "quarterly",
   "completedPeriods": 4,
   "remainingMonths": 2,
   "maturity": "108436.40533208",
   "interest": "8436.40533208",
   "effectiveYieldPercent": "7.18590313",
   "totalGrowthPercent": "8.43640533"
  },
  "F2_partial_18m_yearly": {
   "principal": "100000",
   "rate": "7",
   "months": 18,
   "compounding": "yearly",
   "completedPeriods": 1,
   "remainingMonths": 6,
   "maturity": "110745.00000000",
   "interest": "10745.00000000",
   "effectiveYieldPercent": "7.00000000",
   "totalGrowthPercent": "10.74500000"
  },
  "F3_under_one_period_2m_quarterly": {
   "principal": "100000",
   "rate": "7",
   "months": 2,
   "compounding": "quarterly",
   "completedPeriods": 0,
   "remainingMonths": 2,
   "maturity": "101166.66666667",
   "interest": "1166.66666667",
   "effectiveYieldPercent": "7.18590313",
   "totalGrowthPercent": "1.16666667"
  },
  "G_zero_rate": {
   "principal": "100000",
   "rate": "0",
   "months": 60,
   "compounding": "quarterly",
   "completedPeriods": 20,
   "remainingMonths": 0,
   "maturity": "100000.00000000",
   "interest": "0.00000000",
   "effectiveYieldPercent": "0.00000000",
   "totalGrowthPercent": "0.00000000"
  },
  "H_smallest_amount_1m": {
   "principal": "1000",
   "rate": "7",
   "months": 1,
   "compounding": "quarterly",
   "completedPeriods": 0,
   "remainingMonths": 1,
   "maturity": "1005.83333333",
   "interest": "5.83333333",
   "effectiveYieldPercent": "7.18590313",
   "totalGrowthPercent": "0.58333333"
  },
  "I_largest_amount_20pc_30y_monthly": {
   "principal": "100000000",
   "rate": "20",
   "months": 360,
   "compounding": "monthly",
   "completedPeriods": 360,
   "remainingMonths": 0,
   "maturity": "38396396323.27157360",
   "interest": "38296396323.27157360",
   "effectiveYieldPercent": "21.93910849",
   "totalGrowthPercent": "38296.39632327"
  },
  "J_shortest_tenure_1m_monthly": {
   "principal": "100000",
   "rate": "7",
   "months": 1,
   "compounding": "monthly",
   "completedPeriods": 1,
   "remainingMonths": 0,
   "maturity": "100583.33333333",
   "interest": "583.33333333",
   "effectiveYieldPercent": "7.22900809",
   "totalGrowthPercent": "0.58333333"
  },
  "K_longest_tenure_360m_quarterly": {
   "principal": "100000",
   "rate": "7",
   "months": 360,
   "compounding": "quarterly",
   "completedPeriods": 120,
   "remainingMonths": 0,
   "maturity": "801918.34313395",
   "interest": "701918.34313395",
   "effectiveYieldPercent": "7.18590313",
   "totalGrowthPercent": "701.91834313"
  },
  "L_fraction_rate_6_85": {
   "principal": "250000",
   "rate": "6.85",
   "months": 42,
   "compounding": "half-yearly",
   "completedPeriods": 7,
   "remainingMonths": 0,
   "maturity": "316459.92122903",
   "interest": "66459.92122903",
   "effectiveYieldPercent": "6.96730625",
   "totalGrowthPercent": "26.58396849"
  },
  "M_paise_principal": {
   "principal": "12345.67",
   "rate": "7.25",
   "months": 27,
   "compounding": "monthly",
   "completedPeriods": 27,
   "remainingMonths": 0,
   "maturity": "14525.99200372",
   "interest": "2180.32200372",
   "effectiveYieldPercent": "7.49582974",
   "totalGrowthPercent": "17.66062112"
  },
  "N_max_rate_20_yearly_1m": {
   "principal": "1000",
   "rate": "20",
   "months": 1,
   "compounding": "yearly",
   "completedPeriods": 0,
   "remainingMonths": 1,
   "maturity": "1016.66666667",
   "interest": "16.66666667",
   "effectiveYieldPercent": "20.00000000",
   "totalGrowthPercent": "1.66666667"
  }
 },
 "comparisons": {
  "same_tenure_L": {
   "A": {
    "principal": "100000",
    "rate": "7",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "141477.81957558",
    "interest": "41477.81957558",
    "effectiveYieldPercent": "7.18590313",
    "totalGrowthPercent": "41.47781958"
   },
   "B": {
    "principal": "100000",
    "rate": "7.4",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "144284.82821581",
    "interest": "44284.82821581",
    "effectiveYieldPercent": "7.60789436",
    "totalGrowthPercent": "44.28482822"
   },
   "difference": {
    "maturity": "2807.00864023",
    "interest": "2807.00864023",
    "effectiveYieldPoints": "0.42199123",
    "months": 0,
    "likeForLike": true
   }
  },
  "different_tenure_M": {
   "A": {
    "principal": "100000",
    "rate": "7.1",
    "months": 36,
    "compounding": "quarterly",
    "completedPeriods": 12,
    "remainingMonths": 0,
    "maturity": "123507.50047309",
    "interest": "23507.50047309",
    "effectiveYieldPercent": "7.29128437",
    "totalGrowthPercent": "23.50750047"
   },
   "B": {
    "principal": "100000",
    "rate": "6.8",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "140093.84609886",
    "interest": "40093.84609886",
    "effectiveYieldPercent": "6.97537355",
    "totalGrowthPercent": "40.09384610"
   },
   "difference": {
    "maturity": "16586.34562577",
    "interest": "16586.34562577",
    "effectiveYieldPoints": "-0.31591082",
    "months": 24,
    "likeForLike": false
   }
  },
  "identical_terms": {
   "A": {
    "principal": "100000",
    "rate": "7",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "141477.81957558",
    "interest": "41477.81957558",
    "effectiveYieldPercent": "7.18590313",
    "totalGrowthPercent": "41.47781958"
   },
   "B": {
    "principal": "100000",
    "rate": "7",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "141477.81957558",
    "interest": "41477.81957558",
    "effectiveYieldPercent": "7.18590313",
    "totalGrowthPercent": "41.47781958"
   },
   "difference": {
    "maturity": "0.00000000",
    "interest": "0.00000000",
    "effectiveYieldPoints": "0.00000000",
    "months": 0,
    "likeForLike": true
   }
  },
  "same_rate_longer_tenure": {
   "A": {
    "principal": "100000",
    "rate": "7",
    "months": 36,
    "compounding": "quarterly",
    "completedPeriods": 12,
    "remainingMonths": 0,
    "maturity": "123143.93149448",
    "interest": "23143.93149448",
    "effectiveYieldPercent": "7.18590313",
    "totalGrowthPercent": "23.14393149"
   },
   "B": {
    "principal": "100000",
    "rate": "7",
    "months": 60,
    "compounding": "quarterly",
    "completedPeriods": 20,
    "remainingMonths": 0,
    "maturity": "141477.81957558",
    "interest": "41477.81957558",
    "effectiveYieldPercent": "7.18590313",
    "totalGrowthPercent": "41.47781958"
   },
   "difference": {
    "maturity": "18333.88808110",
    "interest": "18333.88808110",
    "effectiveYieldPoints": "0.00000000",
    "months": 24,
    "likeForLike": false
   }
  }
 }
};

const N = Number;
const near = (actual, expected, label, tol = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: ${actual} vs ${expected}`);

const run = (g) => calculateFd({ amount: N(g.principal), rate: N(g.rate), months: g.months, compounding: g.compounding });

function matches(label, g, r) {
  assert.equal(r.completedPeriods, g.completedPeriods, `${label}: completed periods`);
  assert.equal(r.remainingMonths, g.remainingMonths, `${label}: remaining months`);
  const tol = Math.max(1e-6, N(g.maturity) * 1e-13);
  near(r.maturity, N(g.maturity), `${label}: maturity`, tol);
  near(r.interest, N(g.interest), `${label}: interest`, tol);
  near(r.effectiveYield * 100, N(g.effectiveYieldPercent), `${label}: effective yield %`, 1e-7);
  near(r.totalGrowth * 100, N(g.totalGrowthPercent), `${label}: total growth %`, Math.max(1e-6, N(g.totalGrowthPercent) * 1e-9));
}

describe("every scenario matches the independent reference", () => {
  for (const [name, g] of Object.entries(GOLDEN.scenarios)) {
    test(name, () => matches(name, g, run(g)));
  }
});

describe("the planning goldens", () => {
  test("the default: 1,00,000 at 7% for 5 years, quarterly", () => {
    const r = run(GOLDEN.scenarios.A_default_quarterly);
    near(r.maturity, 141477.82, "maturity", 0.005);
    near(r.interest, 41477.82, "interest", 0.005);
    near(r.effectiveYield * 100, 7.1859, "yield", 5e-5);
    near(r.totalGrowth * 100, 41.4778, "growth", 5e-5);
  });

  test("the four compounding choices on the same deposit", () => {
    const m = (c) => calculateFd({ amount: 100000, rate: 7, months: 60, compounding: c });
    near(m("monthly").maturity, 141762.53, "monthly", 0.005);
    near(m("quarterly").maturity, 141477.82, "quarterly", 0.005);
    near(m("half-yearly").maturity, 141059.88, "half-yearly", 0.005);
    near(m("yearly").maturity, 140255.17, "yearly", 0.005);
    near(m("yearly").effectiveYield, 0.07, "yearly yield equals the rate", 1e-12);
    assert.ok(m("monthly").effectiveYield > m("quarterly").effectiveYield);
    assert.ok(m("quarterly").effectiveYield > m("half-yearly").effectiveYield);
    assert.ok(m("half-yearly").effectiveYield > m("yearly").effectiveYield);
  });

  test("exact periods have no broken-period tail", () => {
    for (const [months, c] of [[60, "quarterly"], [36, "monthly"], [24, "yearly"], [12, "yearly"], [6, "half-yearly"]]) {
      const r = calculateFd({ amount: 100000, rate: 7, months, compounding: c });
      assert.equal(r.remainingMonths, 0, `${months} ${c}`);
    }
    // exactly one yearly period: 1,00,000 * 1.07 to the paisa, with no floating-point drift
    assert.equal(calculateFd({ amount: 100000, rate: 7, months: 12, compounding: "yearly" }).maturity, 107000);
    assert.equal(calculateFd({ amount: 100000, rate: 7, months: 24, compounding: "yearly" }).maturity, 114490);
  });

  test("a broken period earns simple interest pro rata, not another compounding", () => {
    // 18 months yearly: one full year, then half a year of simple interest on 1,07,000
    assert.equal(calculateFd({ amount: 100000, rate: 7, months: 18, compounding: "yearly" }).maturity, 110745);
    const r = calculateFd({ amount: 100000, rate: 7, months: 2, compounding: "quarterly" });
    assert.equal(r.completedPeriods, 0);
    assert.equal(r.remainingMonths, 2);
    near(r.maturity, 101166.66666667, "2 months of a quarter", 1e-6);
  });

  test("zero rate: maturity is the deposit, nothing else", () => {
    const r = calculateFd({ amount: 100000, rate: 0, months: 60, compounding: "quarterly" });
    assert.equal(r.maturity, 100000);
    assert.equal(r.interest, 0);
    assert.equal(r.effectiveYield, 0);
    assert.equal(r.totalGrowth, 0);
    assert.ok(Number.isFinite(r.maturity));
  });

  test("the smallest and the largest valid deposits", () => {
    const small = calculateFd({ amount: FD_LIMITS.amount.min, rate: 7, months: 1, compounding: "quarterly" });
    near(small.maturity, 1005.83333333, "smallest", 1e-6);
    const big = calculateFd({ amount: FD_LIMITS.amount.max, rate: 20, months: 360, compounding: "monthly" });
    near(big.maturity, 38396396323.27157, "largest", 1e-3);
    assert.ok(Number.isFinite(big.maturity) && Number.isFinite(big.effectiveYield));
  });
});

describe("Option B", () => {
  const compare = (key) => {
    const g = GOLDEN.comparisons[key];
    const a = g.A, b = g.B;
    const r = calculateFd({
      amount: N(a.principal), rate: N(a.rate), months: a.months, compounding: a.compounding,
      optionB: { rate: N(b.rate), months: b.months },
    });
    return { g, r };
  };

  for (const key of Object.keys(GOLDEN.comparisons)) {
    test(`${key} matches the reference`, () => {
      const { g, r } = compare(key);
      matches(`${key} A`, g.A, r);
      matches(`${key} B`, g.B, r.optionB);
      near(r.comparison.maturity, N(g.difference.maturity), "maturity difference", 0.006);
      near(r.comparison.interest, N(g.difference.interest), "interest difference", 0.006);
      near(r.comparison.effectiveYield * 100, N(g.difference.effectiveYieldPoints), "yield difference (points)", 1e-7);
      assert.equal(r.comparison.months, g.difference.months);
      assert.equal(r.comparison.likeForLike, g.difference.likeForLike);
    });
  }

  test("different tenures are flagged as not like-for-like; equal ones are", () => {
    assert.equal(compare("different_tenure_M").r.comparison.likeForLike, false);
    assert.equal(compare("same_tenure_L").r.comparison.likeForLike, true);
    assert.equal(compare("identical_terms").r.comparison.likeForLike, true);
  });

  test("identical offers differ by nothing", () => {
    const { r } = compare("identical_terms");
    assert.equal(r.comparison.maturity, 0);
    assert.equal(r.comparison.interest, 0);
    assert.equal(r.comparison.effectiveYield, 0);
  });

  test("a higher maturity over a longer tenure comes with a lower yield here (the point of the warning)", () => {
    const { r } = compare("different_tenure_M");
    assert.ok(r.comparison.maturity > 0, "B matures to more");
    assert.ok(r.comparison.effectiveYield < 0, "B has the lower effective yield");
    assert.ok(r.comparison.months > 0, "B runs longer");
  });

  test("without an Option B there is no comparison", () => {
    const r = calculateFd({ amount: 100000, rate: 7, months: 60, compounding: "quarterly" });
    assert.equal(r.optionB, null);
    assert.equal(r.comparison, null);
  });
});

describe("invariants", () => {
  const f = (o) => calculateFd({ amount: 100000, rate: 7, months: 60, compounding: "quarterly", ...o });

  test("maturity rises with the deposit, the rate and the tenure, and never falls below the deposit", () => {
    assert.ok(f({ amount: 200000 }).maturity > f({}).maturity);
    assert.ok(f({ rate: 8 }).maturity > f({}).maturity);
    let last = 0;
    for (let months = 1; months <= 60; months++) {
      const m = f({ months }).maturity;
      assert.ok(m >= last, `month ${months}`);
      assert.ok(m >= 100000);
      last = m;
    }
  });

  test("the deposit and the maturity are in proportion", () => {
    near(f({ amount: 200000 }).maturity, 2 * f({}).maturity, "double", 1e-6);
    near(f({ amount: 200000 }).totalGrowth, f({}).totalGrowth, "same growth", 1e-12);
  });

  test("interest is maturity minus deposit and growth is interest over deposit", () => {
    const r = f({});
    near(r.maturity - 100000, r.interest, "interest", 1e-6);
    near(r.interest / 100000, r.totalGrowth, "growth", 1e-9);
  });

  test("compounding frequency raises the effective yield but never changes the quoted rate", () => {
    const yields = Object.keys(COMPOUNDING).map((c) => f({ compounding: c }).effectiveYield);
    assert.deepEqual([...yields].sort((a, b) => b - a), yields, "monthly > quarterly > half-yearly > yearly");
  });
});

describe("validation", () => {
  const base = { amount: 100000, rate: 7, years: 5, months: 0, compounding: "quarterly" };
  const bad = (patch) => validateFdInputs({ ...base, ...patch });
  const fields = (patch) => bad(patch).errors.flatMap((e) => e.fields);

  test("the defaults are valid and the optional Option B is off", () => {
    const v = validateFdInputs(base);
    assert.equal(v.ok, true);
    assert.equal(v.values.months, 60);
    assert.equal(v.values.optionB, null);
  });

  test("deposit limits", () => {
    assert.equal(bad({ amount: 999 }).ok, false);
    assert.deepEqual(fields({ amount: 999 }), ["amount"]);
    assert.equal(bad({ amount: 1000 }).ok, true);
    assert.equal(bad({ amount: 100000000 }).ok, true);
    assert.equal(bad({ amount: 100000001 }).ok, false);
    assert.equal(bad({ amount: -5 }).ok, false);
  });

  test("rate limits: zero is valid, over 20% and negative are not", () => {
    assert.equal(bad({ rate: 0 }).ok, true);
    assert.equal(bad({ rate: 20 }).ok, true);
    assert.deepEqual(fields({ rate: 20.01 }), ["rate"]);
    assert.deepEqual(fields({ rate: -1 }), ["rate"]);
  });

  test("tenure limits: 1 to 360 months, months 0 to 11", () => {
    assert.equal(bad({ years: 0, months: 1 }).ok, true);
    assert.equal(bad({ years: 30, months: 0 }).ok, true);
    assert.deepEqual(fields({ years: 0, months: 0 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 30, months: 1 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 31, months: 0 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 2, months: 12 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 2.5, months: 0 }), ["years", "months"]);
    assert.deepEqual(fields({ years: -1, months: 3 }), ["years", "months"]);
    assert.equal(tenureMonths(5, ""), 60);
    assert.equal(tenureMonths("", 6), 6);
    assert.equal(tenureMonths("", ""), null);
  });

  test("compounding must be one of the four", () => {
    assert.deepEqual(fields({ compounding: "daily" }), ["compounding"]);
    for (const c of Object.keys(COMPOUNDING)) assert.equal(bad({ compounding: c }).ok, true);
  });

  test("Option B: a rate turns the comparison on; a blank tenure is Option A's", () => {
    const v = bad({ bRate: 6.8, bYears: "", bMonths: "" });
    assert.equal(v.ok, true);
    assert.deepEqual(v.values.optionB, { rate: 6.8, months: 60 });
    assert.deepEqual(bad({ bRate: 6.8, bYears: 3, bMonths: "" }).values.optionB, { rate: 6.8, months: 36 });
    assert.deepEqual(bad({ bRate: 0, bYears: "", bMonths: "" }).values.optionB, { rate: 0, months: 60 }, "0% is a rate");
  });

  test("Option B: a tenure without a rate is ignored, a bad value anywhere is still marked", () => {
    assert.equal(bad({ bRate: "", bYears: 3, bMonths: "" }).values.optionB, null);
    assert.deepEqual(fields({ bRate: 25 }), ["bRate"]);
    assert.deepEqual(fields({ bRate: 6, bYears: 31, bMonths: 0 }), ["bYears", "bMonths"]);
    assert.deepEqual(fields({ bRate: "", bYears: 0, bMonths: 0 }), ["bYears", "bMonths"]);
  });
});
