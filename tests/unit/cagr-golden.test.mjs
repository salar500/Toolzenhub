/**
 * Tool Pack 9: the CAGR engine against the independent reference.
 *
 * GOLDEN holds the output of tests/fixtures/cagr-golden.py (Python decimal, 70 digits). The reference finds the growth rate by
 * BISECTION on integer powers ((1 + g)^months = (end / start)^12), cross-checks it with ln / exp, and rounds the displayed
 * percentages half up (a tie away from zero). It does not use the engine's power. Regenerate the literal by running the script.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateCagr,
  validateCagrInputs,
  periodMonths,
  percentText,
  multipleText,
  CAGR_LIMITS,
} from "../../assets/js/calculators/formulas/cagr.js";

const GOLDEN = {
 "scenarios": {
  "A_default": {
   "start": "100000",
   "end": "180000",
   "months": 60,
   "cagrPercent": "12.474611314209",
   "cagrDisplay": "12.47",
   "totalGrowthPercent": "80.000000000000",
   "totalGrowthDisplay": "80.00",
   "multiple": "1.800000000000",
   "multipleDisplay": "1.80",
   "simpleYearlyPercent": "16.000000000000",
   "simpleYearlyDisplay": "16.00"
  },
  "B_second_case": {
   "start": "100000",
   "end": "240000",
   "months": 108,
   "cagrPercent": "10.216265995200",
   "cagrDisplay": "10.22",
   "totalGrowthPercent": "140.000000000000",
   "totalGrowthDisplay": "140.00",
   "multiple": "2.400000000000",
   "multipleDisplay": "2.40",
   "simpleYearlyPercent": "15.555555555556",
   "simpleYearlyDisplay": "15.56"
  },
  "C_exact_10pc": {
   "start": "100",
   "end": "121",
   "months": 24,
   "cagrPercent": "10.000000000000",
   "cagrDisplay": "10.00",
   "totalGrowthPercent": "21.000000000000",
   "totalGrowthDisplay": "21.00",
   "multiple": "1.210000000000",
   "multipleDisplay": "1.21",
   "simpleYearlyPercent": "10.500000000000",
   "simpleYearlyDisplay": "10.50"
  },
  "D_no_change": {
   "start": "100000",
   "end": "100000",
   "months": 60,
   "cagrPercent": "0.000000000000",
   "cagrDisplay": "0.00",
   "totalGrowthPercent": "0.000000000000",
   "totalGrowthDisplay": "0.00",
   "multiple": "1.000000000000",
   "multipleDisplay": "1.00",
   "simpleYearlyPercent": "0.000000000000",
   "simpleYearlyDisplay": "0.00"
  },
  "E_loss": {
   "start": "100000",
   "end": "50000",
   "months": 36,
   "cagrPercent": "-20.629947401590",
   "cagrDisplay": "-20.63",
   "totalGrowthPercent": "-50.000000000000",
   "totalGrowthDisplay": "-50.00",
   "multiple": "0.500000000000",
   "multipleDisplay": "0.50",
   "simpleYearlyPercent": "-16.666666666667",
   "simpleYearlyDisplay": "-16.67"
  },
  "F_shortest_period": {
   "start": "100000",
   "end": "101000",
   "months": 12,
   "cagrPercent": "1.000000000000",
   "cagrDisplay": "1.00",
   "totalGrowthPercent": "1.000000000000",
   "totalGrowthDisplay": "1.00",
   "multiple": "1.010000000000",
   "multipleDisplay": "1.01",
   "simpleYearlyPercent": "1.000000000000",
   "simpleYearlyDisplay": "1.00"
  },
  "G_months": {
   "start": "100000",
   "end": "150000",
   "months": 42,
   "cagrPercent": "12.282426199355",
   "cagrDisplay": "12.28",
   "totalGrowthPercent": "50.000000000000",
   "totalGrowthDisplay": "50.00",
   "multiple": "1.500000000000",
   "multipleDisplay": "1.50",
   "simpleYearlyPercent": "14.285714285714",
   "simpleYearlyDisplay": "14.29"
  },
  "H_looking_ahead": {
   "start": "500000",
   "end": "10000000",
   "months": 180,
   "cagrPercent": "22.105530006757",
   "cagrDisplay": "22.11",
   "totalGrowthPercent": "1900.000000000000",
   "totalGrowthDisplay": "1900.00",
   "multiple": "20.000000000000",
   "multipleDisplay": "20.00",
   "simpleYearlyPercent": "126.666666666667",
   "simpleYearlyDisplay": "126.67"
  },
  "J_largest_ratio_one_year": {
   "start": "1",
   "end": "1000",
   "months": 12,
   "cagrPercent": "99900.000000000000",
   "cagrDisplay": "99900.00",
   "totalGrowthPercent": "99900.000000000000",
   "totalGrowthDisplay": "99900.00",
   "multiple": "1000.000000000000",
   "multipleDisplay": "1000.00",
   "simpleYearlyPercent": "99900.000000000000",
   "simpleYearlyDisplay": "99900.00"
  },
  "K_longest_period": {
   "start": "100000",
   "end": "100001",
   "months": 600,
   "cagrPercent": "0.000019999902",
   "cagrDisplay": "0.00",
   "totalGrowthPercent": "0.001000000000",
   "totalGrowthDisplay": "0.00",
   "multiple": "1.000010000000",
   "multipleDisplay": "1.00",
   "simpleYearlyPercent": "0.000020000000",
   "simpleYearlyDisplay": "0.00"
  },
  "L_smallest_ratio_one_year": {
   "start": "1000",
   "end": "1",
   "months": 12,
   "cagrPercent": "-99.900000000000",
   "cagrDisplay": "-99.90",
   "totalGrowthPercent": "-99.900000000000",
   "totalGrowthDisplay": "-99.90",
   "multiple": "0.001000000000",
   "multipleDisplay": "0.00",
   "simpleYearlyPercent": "-99.900000000000",
   "simpleYearlyDisplay": "-99.90"
  },
  "M_tie_up": {
   "start": "100000",
   "end": "100125",
   "months": 12,
   "cagrPercent": "0.125000000000",
   "cagrDisplay": "0.13",
   "totalGrowthPercent": "0.125000000000",
   "totalGrowthDisplay": "0.13",
   "multiple": "1.001250000000",
   "multipleDisplay": "1.00",
   "simpleYearlyPercent": "0.125000000000",
   "simpleYearlyDisplay": "0.13"
  },
  "M2_tie_down": {
   "start": "100000",
   "end": "99875",
   "months": 12,
   "cagrPercent": "-0.125000000000",
   "cagrDisplay": "-0.13",
   "totalGrowthPercent": "-0.125000000000",
   "totalGrowthDisplay": "-0.13",
   "multiple": "0.998750000000",
   "multipleDisplay": "1.00",
   "simpleYearlyPercent": "-0.125000000000",
   "simpleYearlyDisplay": "-0.13"
  },
  "N_paise": {
   "start": "12345.67",
   "end": "23456.78",
   "months": 66,
   "cagrPercent": "12.378309945536",
   "cagrDisplay": "12.38",
   "totalGrowthPercent": "90.000056700041",
   "totalGrowthDisplay": "90.00",
   "multiple": "1.900000567000",
   "multipleDisplay": "1.90",
   "simpleYearlyPercent": "16.363646672735",
   "simpleYearlyDisplay": "16.36"
  },
  "O_long_flat": {
   "start": "100000",
   "end": "100000",
   "months": 600,
   "cagrPercent": "0.000000000000",
   "cagrDisplay": "0.00",
   "totalGrowthPercent": "0.000000000000",
   "totalGrowthDisplay": "0.00",
   "multiple": "1.000000000000",
   "multipleDisplay": "1.00",
   "simpleYearlyPercent": "0.000000000000",
   "simpleYearlyDisplay": "0.00"
  },
  "P_halving_over_a_year": {
   "start": "100000",
   "end": "50000",
   "months": 12,
   "cagrPercent": "-50.000000000000",
   "cagrDisplay": "-50.00",
   "totalGrowthPercent": "-50.000000000000",
   "totalGrowthDisplay": "-50.00",
   "multiple": "0.500000000000",
   "multipleDisplay": "0.50",
   "simpleYearlyPercent": "-50.000000000000",
   "simpleYearlyDisplay": "-50.00"
  },
  "Q_tiny_amounts": {
   "start": "0.01",
   "end": "0.02",
   "months": 12,
   "cagrPercent": "100.000000000000",
   "cagrDisplay": "100.00",
   "totalGrowthPercent": "100.000000000000",
   "totalGrowthDisplay": "100.00",
   "multiple": "2.000000000000",
   "multipleDisplay": "2.00",
   "simpleYearlyPercent": "100.000000000000",
   "simpleYearlyDisplay": "100.00"
  }
 },
 "comparisons": {
  "L_two_cases": {
   "A": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "B": {
    "start": "100000",
    "end": "240000",
    "months": 108,
    "cagrPercent": "10.216265995200",
    "cagrDisplay": "10.22",
    "totalGrowthPercent": "140.000000000000",
    "totalGrowthDisplay": "140.00",
    "multiple": "2.400000000000",
    "multipleDisplay": "2.40",
    "simpleYearlyPercent": "15.555555555556",
    "simpleYearlyDisplay": "15.56"
   },
   "difference": {
    "cagrPoints": "-2.25834532",
    "totalGrowthPoints": "60.00000000",
    "multiple": "0.60000000",
    "simpleYearlyPoints": "-0.44444444",
    "start": "0.00",
    "end": "60000.00",
    "months": 48
   }
  },
  "M_inherit_start_and_period": {
   "A": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "B": {
    "start": "100000",
    "end": "240000",
    "months": 60,
    "cagrPercent": "19.135789816709",
    "cagrDisplay": "19.14",
    "totalGrowthPercent": "140.000000000000",
    "totalGrowthDisplay": "140.00",
    "multiple": "2.400000000000",
    "multipleDisplay": "2.40",
    "simpleYearlyPercent": "28.000000000000",
    "simpleYearlyDisplay": "28.00"
   },
   "difference": {
    "cagrPoints": "6.66117850",
    "totalGrowthPoints": "60.00000000",
    "multiple": "0.60000000",
    "simpleYearlyPoints": "12.00000000",
    "start": "0.00",
    "end": "60000.00",
    "months": 0
   }
  },
  "N_identical": {
   "A": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "B": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "difference": {
    "cagrPoints": "0.00000000",
    "totalGrowthPoints": "0.00000000",
    "multiple": "0.00000000",
    "simpleYearlyPoints": "0.00000000",
    "start": "0.00",
    "end": "0.00",
    "months": 0
   }
  },
  "R_different_starts": {
   "A": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "B": {
    "start": "250000",
    "end": "400000",
    "months": 84,
    "cagrPercent": "6.944880005339",
    "cagrDisplay": "6.94",
    "totalGrowthPercent": "60.000000000000",
    "totalGrowthDisplay": "60.00",
    "multiple": "1.600000000000",
    "multipleDisplay": "1.60",
    "simpleYearlyPercent": "8.571428571429",
    "simpleYearlyDisplay": "8.57"
   },
   "difference": {
    "cagrPoints": "-5.52973131",
    "totalGrowthPoints": "-20.00000000",
    "multiple": "-0.20000000",
    "simpleYearlyPoints": "-7.42857143",
    "start": "150000.00",
    "end": "220000.00",
    "months": 24
   }
  }
 },
 "articles": {
  "default": {
   "start": "100000",
   "end": "180000",
   "months": 60,
   "cagrPercent": "12.474611314209",
   "cagrDisplay": "12.47",
   "totalGrowthPercent": "80.000000000000",
   "totalGrowthDisplay": "80.00",
   "multiple": "1.800000000000",
   "multipleDisplay": "1.80",
   "simpleYearlyPercent": "16.000000000000",
   "simpleYearlyDisplay": "16.00"
  },
  "stepMultiplierA": "1.12474611",
  "caseB": {
   "start": "100000",
   "end": "240000",
   "months": 108,
   "cagrPercent": "10.216265995200",
   "cagrDisplay": "10.22",
   "totalGrowthPercent": "140.000000000000",
   "totalGrowthDisplay": "140.00",
   "multiple": "2.400000000000",
   "multipleDisplay": "2.40",
   "simpleYearlyPercent": "15.555555555556",
   "simpleYearlyDisplay": "15.56"
  },
  "stepMultiplierB": "1.10216266",
  "fiveStepsCompound": "1.80000000",
  "fiveAdditiveSixteens": "1.80000000",
  "compoundingSixteenFiveYears": "2.10034166",
  "comparison": {
   "A": {
    "start": "100000",
    "end": "180000",
    "months": 60,
    "cagrPercent": "12.474611314209",
    "cagrDisplay": "12.47",
    "totalGrowthPercent": "80.000000000000",
    "totalGrowthDisplay": "80.00",
    "multiple": "1.800000000000",
    "multipleDisplay": "1.80",
    "simpleYearlyPercent": "16.000000000000",
    "simpleYearlyDisplay": "16.00"
   },
   "B": {
    "start": "100000",
    "end": "240000",
    "months": 108,
    "cagrPercent": "10.216265995200",
    "cagrDisplay": "10.22",
    "totalGrowthPercent": "140.000000000000",
    "totalGrowthDisplay": "140.00",
    "multiple": "2.400000000000",
    "multipleDisplay": "2.40",
    "simpleYearlyPercent": "15.555555555556",
    "simpleYearlyDisplay": "15.56"
   },
   "difference": {
    "cagrPoints": "-2.25834532",
    "totalGrowthPoints": "60.00000000",
    "multiple": "0.60000000",
    "simpleYearlyPoints": "-0.44444444",
    "start": "0.00",
    "end": "60000.00",
    "months": 48
   }
  }
 }
};

const N = Number;
const rel = (actual, expected, label, tol = 1e-11) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${label}: ${actual} vs ${expected}`);

const rupees = (text) => String(text);
function run(g, mode = "back") {
  const check = validateCagrInputs({ mode, start: rupees(g.start), end: rupees(g.end), years: Math.floor(g.months / 12), months: g.months % 12 });
  assert.equal(check.ok, true, JSON.stringify(check.errors));
  return calculateCagr(check.values);
}

function matches(label, g, r) {
  rel(r.cagr * 100, N(g.cagrPercent), `${label} CAGR %`);
  rel(r.totalGrowth * 100, N(g.totalGrowthPercent), `${label} total growth %`);
  rel(r.multiple, N(g.multiple), `${label} multiple`);
  rel(r.simpleYearly * 100, N(g.simpleYearlyPercent), `${label} simple yearly %`);
  assert.equal(percentText(r.cagr), g.cagrDisplay, `${label} CAGR display`);
  assert.equal(percentText(r.totalGrowth), g.totalGrowthDisplay, `${label} total growth display`);
  assert.equal(multipleText(r.multiple), g.multipleDisplay, `${label} multiple display`);
  assert.equal(percentText(r.simpleYearly), g.simpleYearlyDisplay, `${label} simple yearly display`);
}

describe("every scenario matches the independent reference", () => {
  for (const [name, g] of Object.entries(GOLDEN.scenarios)) {
    test(name, () => matches(name, g, run(g)));
  }
});

describe("the planning goldens", () => {
  test("the default: 1,00,000 to 1,80,000 over 5 years", () => {
    const r = run(GOLDEN.scenarios.A_default);
    assert.equal(percentText(r.cagr), "12.47");
    assert.equal(percentText(r.totalGrowth), "80.00");
    assert.equal(multipleText(r.multiple), "1.80");
    assert.equal(percentText(r.simpleYearly), "16.00");
  });

  test("total growth divided by the years is not the CAGR, and the simple average is exactly total growth / years", () => {
    const r = run(GOLDEN.scenarios.A_default);
    assert.ok(r.simpleYearly > r.cagr);
    rel(r.simpleYearly, r.totalGrowth / 5, "simple yearly average", 1e-15);
    // compounding the simple 16% for five years would overshoot the ending value
    assert.ok(Math.pow(1.16, 5) > r.multiple);
    // five equal compounded steps of the CAGR reach exactly the multiple
    rel(Math.pow(1 + r.cagr, 5), r.multiple, "five compounded steps", 1e-12);
  });

  test("an exactly representable result is exact: 100 to 121 over 2 years is 10.00%", () => {
    const r = run(GOLDEN.scenarios.C_exact_10pc);
    assert.equal(percentText(r.cagr), "10.00");
    rel(r.cagr, 0.1, "10%", 1e-14);
  });

  test("no change is 0.00% and never '-0.00'", () => {
    for (const key of ["D_no_change", "O_long_flat"]) {
      const r = run(GOLDEN.scenarios[key]);
      assert.equal(r.cagr, 0);
      assert.equal(percentText(r.cagr), "0.00");
      assert.equal(percentText(r.totalGrowth), "0.00");
      assert.equal(percentText(r.simpleYearly), "0.00");
    }
    assert.equal(percentText(-0.00001), "0.00");
    assert.equal(percentText(0), "0.00");
  });

  test("a loss is a negative CAGR with its sign: 100 to 50 over 3 years is -20.63%", () => {
    const r = run(GOLDEN.scenarios.E_loss);
    assert.ok(r.cagr < 0);
    assert.equal(percentText(r.cagr), "-20.63");
    assert.equal(percentText(r.totalGrowth), "-50.00");
  });

  test("the half-up rule at an exact tie: +0.125% shows 0.13 and -0.125% shows -0.13", () => {
    assert.equal(percentText(run(GOLDEN.scenarios.M_tie_up).cagr), "0.13");
    assert.equal(percentText(run(GOLDEN.scenarios.M2_tie_down).cagr), "-0.13");
    assert.equal(percentText(0.00125), "0.13");
    assert.equal(percentText(0.0012499), "0.12");
    assert.equal(percentText(-0.0012499), "-0.12");
  });

  test("looking ahead uses the same formula: 5,00,000 to 1 crore over 15 years needs 22.11%", () => {
    const back = run(GOLDEN.scenarios.H_looking_ahead, "back");
    const ahead = run(GOLDEN.scenarios.H_looking_ahead, "ahead");
    assert.equal(percentText(ahead.cagr), "22.11");
    assert.equal(ahead.cagr, back.cagr);
    assert.equal(ahead.mode, "ahead");
  });

  test("the limits of the allowed ratio and period", () => {
    assert.equal(percentText(run(GOLDEN.scenarios.J_largest_ratio_one_year).cagr), "99900.00");
    assert.equal(percentText(run(GOLDEN.scenarios.L_smallest_ratio_one_year).cagr), "-99.90");
    assert.equal(percentText(run(GOLDEN.scenarios.F_shortest_period).cagr), "1.00");
    assert.equal(percentText(run(GOLDEN.scenarios.K_longest_period).cagr), "0.00");
    for (const r of Object.values(GOLDEN.scenarios).map((g) => run(g))) assert.ok(Number.isFinite(r.cagr) && Number.isFinite(r.simpleYearly));
  });
});

describe("Case B and the comparison", () => {
  const compare = (key) => {
    const g = GOLDEN.comparisons[key];
    const b = g.B;
    const check = validateCagrInputs({
      mode: "back", start: g.A.start, end: g.A.end, years: Math.floor(g.A.months / 12), months: g.A.months % 12,
      bEnd: b.end, bStart: b.start, bYears: Math.floor(b.months / 12), bMonths: b.months % 12,
    });
    assert.equal(check.ok, true, JSON.stringify(check.errors));
    return { g, r: calculateCagr(check.values) };
  };

  for (const key of Object.keys(GOLDEN.comparisons)) {
    test(`${key} matches the reference`, () => {
      const { g, r } = compare(key);
      matches(`${key} A`, g.A, r);
      matches(`${key} B`, g.B, r.caseB);
      rel(r.comparison.cagr * 100, N(g.difference.cagrPoints), "CAGR difference (points)", 1e-7);
      rel(r.comparison.totalGrowth * 100, N(g.difference.totalGrowthPoints), "total growth difference (points)", 1e-7);
      rel(r.comparison.multiple, N(g.difference.multiple), "multiple difference", 1e-7);
      rel(r.comparison.simpleYearly * 100, N(g.difference.simpleYearlyPoints), "simple yearly difference (points)", 1e-7);
      assert.equal(r.comparison.startPaise / 100, N(g.difference.start));
      assert.equal(r.comparison.endPaise / 100, N(g.difference.end));
      assert.equal(r.comparison.months, g.difference.months);
    });
  }

  test("the larger total gain over the longer period has the lower yearly rate (the article 2 point)", () => {
    const { r } = compare("L_two_cases");
    assert.ok(r.caseB.totalGrowth > r.totalGrowth);
    assert.ok(r.caseB.cagr < r.cagr);
    assert.equal(percentText(r.cagr), "12.47");
    assert.equal(percentText(r.caseB.cagr), "10.22");
  });

  test("identical cases differ by nothing", () => {
    const { r } = compare("N_identical");
    assert.equal(r.comparison.cagr, 0);
    assert.equal(r.comparison.months, 0);
  });

  test("a blank Case B start and period are the first case's", () => {
    const check = validateCagrInputs({ mode: "back", start: "100000", end: "180000", years: 5, months: 0, bEnd: "240000", bStart: "", bYears: "", bMonths: "" });
    assert.equal(check.ok, true);
    assert.deepEqual(check.values.caseB, { startPaise: 10000000, endPaise: 24000000, months: 60 });
  });

  test("without a Case B ending value there is no comparison, and the other Case B fields are ignored without a message", () => {
    const check = validateCagrInputs({ mode: "back", start: "100000", end: "180000", years: 5, months: 0, bEnd: "", bStart: "abc", bYears: "99", bMonths: "40" });
    assert.equal(check.ok, true);
    assert.equal(check.values.caseB, null);
    const r = calculateCagr(check.values);
    assert.equal(r.caseB, null);
    assert.equal(r.comparison, null);
  });
});

describe("invariants", () => {
  const cagrOf = (start, end, months) => run({ start, end, months }).cagr;

  test("(1 + CAGR) ^ years returns the ratio", () => {
    for (const g of Object.values(GOLDEN.scenarios)) {
      const r = run(g);
      rel(Math.pow(1 + r.cagr, r.years), r.multiple, `${g.start} to ${g.end}`, 1e-9);
    }
  });

  test("a rise and the matching fall are exact opposites in growth factor", () => {
    for (const [s, e, m] of [["100", "180", 60], ["1000", "2500", 84], ["50", "51", 12], ["100", "700", 180]]) {
      const up = cagrOf(s, e, m), down = cagrOf(e, s, m);
      rel((1 + up) * (1 + down), 1, `${s}/${e}`, 1e-12);
    }
  });

  test("CAGR rises with the ending value and falls with the period", () => {
    let last = -Infinity;
    for (const end of ["60000", "80000", "100000", "120000", "150000", "250000"]) {
      const g = cagrOf("100000", end, 60);
      assert.ok(g > last);
      last = g;
    }
    last = Infinity;
    for (const months of [12, 24, 36, 60, 120, 300, 600]) {
      const g = cagrOf("100000", "150000", months);
      assert.ok(g < last);
      last = g;
    }
  });

  test("the growth multiple is the ratio and total growth is the multiple less one", () => {
    for (const g of Object.values(GOLDEN.scenarios)) {
      const r = run(g);
      rel(r.multiple - 1, r.totalGrowth, "total growth", 1e-12);
      rel(r.multiple, N(g.end) / N(g.start), "ratio", 1e-12);
    }
  });
});

describe("validation", () => {
  const ok = { mode: "back", start: "100000", end: "180000", years: 5, months: 0 };
  const bad = (patch) => validateCagrInputs({ ...ok, ...patch });
  const fields = (patch) => bad(patch).errors.flatMap((e) => e.fields);

  test("the defaults are valid", () => {
    const v = validateCagrInputs(ok);
    assert.equal(v.ok, true);
    assert.deepEqual(v.values, { mode: "back", startPaise: 10000000, endPaise: 18000000, months: 60, caseB: null });
  });

  test("mode must be back or ahead", () => {
    assert.deepEqual(fields({ mode: "sideways" }), ["mode"]);
    assert.equal(bad({ mode: "ahead" }).ok, true);
  });

  test("value limits and precision", () => {
    assert.deepEqual(fields({ start: "0" }), ["start"]);
    assert.deepEqual(fields({ start: "0.00" }), ["start"]);
    assert.deepEqual(fields({ start: "-5" }), ["start"]);
    assert.deepEqual(fields({ start: "100.001" }), ["start"]);
    assert.deepEqual(fields({ start: "1e5" }), ["start"]);
    assert.deepEqual(fields({ start: "10000000000" }), ["start"]);
    assert.deepEqual(fields({ end: "0" }), ["end"]);
    assert.deepEqual(fields({ end: "" }), ["end"]);
    assert.equal(bad({ start: "99999999.99", end: "99999999.99" }).ok, true);
  });

  test("the ratio must be between 1/1,000 and 1,000 (decided on whole paise)", () => {
    assert.equal(bad({ start: "100", end: "100000" }).ok, true);      // exactly 1,000 times
    assert.deepEqual(fields({ start: "100", end: "100000.01" }), ["end"]);
    assert.equal(bad({ start: "100000", end: "100" }).ok, true);      // exactly 1/1,000
    assert.deepEqual(fields({ start: "100000", end: "99.99" }), ["end"]);
    assert.equal(bad({ start: "0.01", end: "10" }).ok, true);
    assert.deepEqual(fields({ start: "0.01", end: "10.01" }), ["end"]);
    assert.match(bad({ start: "100", end: "100000.01" }).errors[0].message, /between 1\/1,000 and 1,000 times/);
  });

  test("period limits: 12 to 600 months, months 0 to 11, whole numbers", () => {
    assert.equal(bad({ years: 1, months: 0 }).ok, true);
    assert.equal(bad({ years: 50, months: 0 }).ok, true);
    assert.equal(bad({ years: 0, months: 0 }).ok, false);
    assert.deepEqual(fields({ years: 0, months: 11 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 50, months: 1 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 51, months: 0 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 2, months: 12 }), ["years", "months"]);
    assert.deepEqual(fields({ years: 2.5, months: 0 }), ["years", "months"]);
    assert.deepEqual(fields({ years: -1, months: 0 }), ["years", "months"]);
    assert.equal(periodMonths(5, ""), 60);
    assert.ok(Number.isNaN(periodMonths("", 11)));
    assert.equal(periodMonths("", ""), null);
    assert.equal(bad({ years: 5, months: 6 }).values.months, 66);
  });

  test("Case B is checked once its ending value is entered; its messages name it", () => {
    const r = validateCagrInputs({ ...ok, bEnd: "0" });
    assert.deepEqual(r.errors.flatMap((e) => e.fields), ["bEnd"]);
    assert.match(r.errors[0].message, /^Investment B: /);
    assert.deepEqual(validateCagrInputs({ ...ok, bEnd: "240000", bStart: "x" }).errors.flatMap((e) => e.fields), ["bStart"]);
    assert.deepEqual(validateCagrInputs({ ...ok, bEnd: "240000", bYears: 0, bMonths: 6 }).errors.flatMap((e) => e.fields), ["bYears", "bMonths"]);
    assert.deepEqual(validateCagrInputs({ ...ok, bEnd: "240000000", bStart: "1000" }).errors.flatMap((e) => e.fields), ["bEnd"]);
  });

  test("the limits are the documented ones", () => {
    assert.deepEqual(CAGR_LIMITS.valuePaise, { min: 1, max: 999999999999 });
    assert.deepEqual(CAGR_LIMITS.totalMonths, { min: 12, max: 600 });
    assert.deepEqual(CAGR_LIMITS.ratio, { min: 0.001, max: 1000 });
  });
});
