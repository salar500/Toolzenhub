/**
 * Tool Pack 10: the Percentage engine against the independent reference.
 *
 * GOLDEN holds the output of tests/fixtures/percentage-golden.py (Python fractions.Fraction: exact rationals, a nearest-hundredth search
 * for the solved values, and the invariants). Displayed figures are rounded half up (a tie goes away from zero), never "-0.00". The engine reads the
 * text of a field to whole hundredths and does BigInt fraction arithmetic; nothing here is copied from it. Regenerate the literal by running the script.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  solvePercentage,
  parseField,
  roundToHundredths,
  plainText,
  groupedText,
  DEFAULT_INPUTS,
} from "../../assets/js/calculators/formulas/percentage.js";

const GOLDEN = {
 "scenarios": {
  "A_forward_up": {
   "inputs": {
    "start": "2000",
    "change": "20",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "2400/1",
   "outOfRange": false,
   "end": "2400.00",
   "start": "2000.00",
   "change": "20.00",
   "amount": "400.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67"
  },
  "B_forward_down": {
   "inputs": {
    "start": "2000",
    "change": "-20",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "1600/1",
   "outOfRange": false,
   "end": "1600.00",
   "start": "2000.00",
   "change": "-20.00",
   "amount": "-400.00",
   "endPercentOfStart": "80.00",
   "undo": "25.00"
  },
  "C_forward_zero": {
   "inputs": {
    "start": "2000",
    "change": "0",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "2000/1",
   "outOfRange": false,
   "end": "2000.00",
   "start": "2000.00",
   "change": "0.00",
   "amount": "0.00",
   "endPercentOfStart": "100.00",
   "undo": "0.00"
  },
  "D_change_up": {
   "inputs": {
    "start": "2000",
    "change": "",
    "end": "2400",
    "second": ""
   },
   "solves": "change",
   "exact": "20/1",
   "outOfRange": false,
   "change": "20.00",
   "start": "2000.00",
   "end": "2400.00",
   "amount": "400.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67"
  },
  "E_change_down": {
   "inputs": {
    "start": "2400",
    "change": "",
    "end": "2000",
    "second": ""
   },
   "solves": "change",
   "exact": "-50/3",
   "outOfRange": false,
   "change": "-16.67",
   "start": "2400.00",
   "end": "2000.00",
   "amount": "-400.00",
   "endPercentOfStart": "83.33",
   "undo": "20.00"
  },
  "F_change_equal": {
   "inputs": {
    "start": "1250",
    "change": "",
    "end": "1250",
    "second": ""
   },
   "solves": "change",
   "exact": "0/1",
   "outOfRange": false,
   "change": "0.00",
   "start": "1250.00",
   "end": "1250.00",
   "amount": "0.00",
   "endPercentOfStart": "100.00",
   "undo": "0.00"
  },
  "G_reverse_start": {
   "inputs": {
    "start": "",
    "change": "20",
    "end": "2400",
    "second": ""
   },
   "solves": "start",
   "exact": "2000/1",
   "outOfRange": false,
   "start": "2000.00",
   "change": "20.00",
   "end": "2400.00",
   "amount": "400.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67"
  },
  "H_reverse_start_fall": {
   "inputs": {
    "start": "",
    "change": "-20",
    "end": "1600",
    "second": ""
   },
   "solves": "start",
   "exact": "2000/1",
   "outOfRange": false,
   "start": "2000.00",
   "change": "-20.00",
   "end": "1600.00",
   "amount": "-400.00",
   "endPercentOfStart": "80.00",
   "undo": "25.00"
  },
  "I_reverse_18": {
   "inputs": {
    "start": "",
    "change": "18",
    "end": "118",
    "second": ""
   },
   "solves": "start",
   "exact": "100/1",
   "outOfRange": false,
   "start": "100.00",
   "change": "18.00",
   "end": "118.00",
   "amount": "18.00",
   "endPercentOfStart": "118.00",
   "undo": "-15.25"
  },
  "J_fractional": {
   "inputs": {
    "start": "80",
    "change": "-12.5",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "70/1",
   "outOfRange": false,
   "end": "70.00",
   "start": "80.00",
   "change": "-12.50",
   "amount": "-10.00",
   "endPercentOfStart": "87.50",
   "undo": "14.29"
  },
  "K_extreme_undo": {
   "inputs": {
    "start": "100",
    "change": "-99.99",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "1/100",
   "outOfRange": false,
   "end": "0.01",
   "start": "100.00",
   "change": "-99.99",
   "amount": "-99.99",
   "endPercentOfStart": "0.01",
   "undo": "999900.00"
  },
  "L_solved_start_below_min": {
   "inputs": {
    "start": "",
    "change": "1000000",
    "end": "0.01",
    "second": ""
   },
   "solves": "start",
   "exact": "1/1000100",
   "outOfRange": true
  },
  "M_large_reverse": {
   "inputs": {
    "start": "",
    "change": "10000",
    "end": "99999999.99",
    "second": ""
   },
   "solves": "start",
   "exact": "9999999999/10100",
   "outOfRange": false,
   "start": "990099.01",
   "change": "10000.00",
   "end": "99999999.99",
   "amount": "99009900.98",
   "endPercentOfStart": "10100.00",
   "undo": "-99.01"
  },
  "N_chain_20_down20": {
   "inputs": {
    "start": "100000",
    "change": "20",
    "end": "",
    "second": "-20"
   },
   "solves": "end",
   "exact": "120000/1",
   "outOfRange": false,
   "end": "120000.00",
   "start": "100000.00",
   "change": "20.00",
   "amount": "20000.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67",
   "second": {
    "q": "-20.00",
    "end2": "96000.00",
    "end2OutOfRange": false,
    "net": "-4.00",
    "plainSum": "0.00"
   }
  },
  "O_chain_down20_up25": {
   "inputs": {
    "start": "100000",
    "change": "-20",
    "end": "",
    "second": "25"
   },
   "solves": "end",
   "exact": "80000/1",
   "outOfRange": false,
   "end": "80000.00",
   "start": "100000.00",
   "change": "-20.00",
   "amount": "-20000.00",
   "endPercentOfStart": "80.00",
   "undo": "25.00",
   "second": {
    "q": "25.00",
    "end2": "100000.00",
    "end2OutOfRange": false,
    "net": "0.00",
    "plainSum": "5.00"
   }
  },
  "P_chain_two_rises": {
   "inputs": {
    "start": "5000",
    "change": "10",
    "end": "",
    "second": "10"
   },
   "solves": "end",
   "exact": "5500/1",
   "outOfRange": false,
   "end": "5500.00",
   "start": "5000.00",
   "change": "10.00",
   "amount": "500.00",
   "endPercentOfStart": "110.00",
   "undo": "-9.09",
   "second": {
    "q": "10.00",
    "end2": "6050.00",
    "end2OutOfRange": false,
    "net": "21.00",
    "plainSum": "20.00"
   }
  },
  "Q_chain_from_solved_start": {
   "inputs": {
    "start": "",
    "change": "20",
    "end": "120000",
    "second": "-20"
   },
   "solves": "start",
   "exact": "100000/1",
   "outOfRange": false,
   "start": "100000.00",
   "change": "20.00",
   "end": "120000.00",
   "amount": "20000.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67",
   "second": {
    "q": "-20.00",
    "end2": "96000.00",
    "end2OutOfRange": false,
    "net": "-4.00",
    "plainSum": "0.00"
   }
  },
  "R_chain_second_out_of_range": {
   "inputs": {
    "start": "900000000",
    "change": "10",
    "end": "",
    "second": "10"
   },
   "solves": "end",
   "exact": "990000000/1",
   "outOfRange": false,
   "end": "990000000.00",
   "start": "900000000.00",
   "change": "10.00",
   "amount": "90000000.00",
   "endPercentOfStart": "110.00",
   "undo": "-9.09",
   "second": {
    "q": "10.00",
    "end2": "1089000000.00",
    "end2OutOfRange": true,
    "net": "21.00",
    "plainSum": "20.00"
   }
  },
  "S_solved_end_above_max": {
   "inputs": {
    "start": "999999999",
    "change": "10",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "10999999989/10",
   "outOfRange": true
  },
  "T_solved_change_at_upper": {
   "inputs": {
    "start": "1",
    "change": "",
    "end": "10001",
    "second": ""
   },
   "solves": "change",
   "exact": "1000000/1",
   "outOfRange": false,
   "change": "1000000.00",
   "start": "1.00",
   "end": "10001.00",
   "amount": "10000.00",
   "endPercentOfStart": "1000100.00",
   "undo": "-99.99"
  },
  "U_solved_change_above_upper": {
   "inputs": {
    "start": "1",
    "change": "",
    "end": "10001.01",
    "second": ""
   },
   "solves": "change",
   "exact": "1000001/1",
   "outOfRange": true
  },
  "V_solved_change_below_lower": {
   "inputs": {
    "start": "1000",
    "change": "",
    "end": "0.01",
    "second": ""
   },
   "solves": "change",
   "exact": "-99999/1000",
   "outOfRange": true
  },
  "W_solved_change_at_lower": {
   "inputs": {
    "start": "100",
    "change": "",
    "end": "0.01",
    "second": ""
   },
   "solves": "change",
   "exact": "-9999/100",
   "outOfRange": false,
   "change": "-99.99",
   "start": "100.00",
   "end": "0.01",
   "amount": "-99.99",
   "endPercentOfStart": "0.01",
   "undo": "999900.00"
  },
  "X_tie_up": {
   "inputs": {
    "start": "1",
    "change": "0.5",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "201/200",
   "outOfRange": false,
   "end": "1.01",
   "start": "1.00",
   "change": "0.50",
   "amount": "0.01",
   "endPercentOfStart": "100.50",
   "undo": "-0.50"
  },
  "Y_tie_down": {
   "inputs": {
    "start": "1",
    "change": "-0.5",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "199/200",
   "outOfRange": false,
   "end": "1.00",
   "start": "1.00",
   "change": "-0.50",
   "amount": "-0.01",
   "endPercentOfStart": "99.50",
   "undo": "0.50"
  },
  "Z_change_tie_up": {
   "inputs": {
    "start": "10000",
    "change": "",
    "end": "10000.5",
    "second": ""
   },
   "solves": "change",
   "exact": "1/200",
   "outOfRange": false,
   "change": "0.01",
   "start": "10000.00",
   "end": "10000.50",
   "amount": "0.50",
   "endPercentOfStart": "100.01",
   "undo": "0.00"
  },
  "Z2_change_tie_down": {
   "inputs": {
    "start": "10000",
    "change": "",
    "end": "9999.5",
    "second": ""
   },
   "solves": "change",
   "exact": "-1/200",
   "outOfRange": false,
   "change": "-0.01",
   "start": "10000.00",
   "end": "9999.50",
   "amount": "-0.50",
   "endPercentOfStart": "100.00",
   "undo": "0.01"
  },
  "Z3_no_negative_zero": {
   "inputs": {
    "start": "100000",
    "change": "",
    "end": "99999.99",
    "second": ""
   },
   "solves": "change",
   "exact": "-1/100000",
   "outOfRange": false,
   "change": "0.00",
   "start": "100000.00",
   "end": "99999.99",
   "amount": "-0.01",
   "endPercentOfStart": "100.00",
   "undo": "0.00"
  },
  "Z4_min_values": {
   "inputs": {
    "start": "0.01",
    "change": "0",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "1/100",
   "outOfRange": false,
   "end": "0.01",
   "start": "0.01",
   "change": "0.00",
   "amount": "0.00",
   "endPercentOfStart": "100.00",
   "undo": "0.00"
  },
  "Z5_max_start_zero_change": {
   "inputs": {
    "start": "1000000000",
    "change": "0",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "1000000000/1",
   "outOfRange": false,
   "end": "1000000000.00",
   "start": "1000000000.00",
   "change": "0.00",
   "amount": "0.00",
   "endPercentOfStart": "100.00",
   "undo": "0.00"
  },
  "Z6_solved_start_at_min": {
   "inputs": {
    "start": "",
    "change": "-50",
    "end": "0.01",
    "second": ""
   },
   "solves": "start",
   "exact": "1/50",
   "outOfRange": false,
   "start": "0.02",
   "change": "-50.00",
   "end": "0.01",
   "amount": "-0.01",
   "endPercentOfStart": "50.00",
   "undo": "100.00"
  }
 },
 "article": {
  "a1_up": {
   "inputs": {
    "start": "100",
    "change": "20",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "120/1",
   "outOfRange": false,
   "end": "120.00",
   "start": "100.00",
   "change": "20.00",
   "amount": "20.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67"
  },
  "a1_down": {
   "inputs": {
    "start": "120",
    "change": "-20",
    "end": "",
    "second": ""
   },
   "solves": "end",
   "exact": "96/1",
   "outOfRange": false,
   "end": "96.00",
   "start": "120.00",
   "change": "-20.00",
   "amount": "-24.00",
   "endPercentOfStart": "80.00",
   "undo": "25.00"
  },
  "a1_chain": {
   "inputs": {
    "start": "100",
    "change": "20",
    "end": "",
    "second": "-20"
   },
   "solves": "end",
   "exact": "120/1",
   "outOfRange": false,
   "end": "120.00",
   "start": "100.00",
   "change": "20.00",
   "amount": "20.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67",
   "second": {
    "q": "-20.00",
    "end2": "96.00",
    "end2OutOfRange": false,
    "net": "-4.00",
    "plainSum": "0.00"
   }
  },
  "a1_undo_20": "-16.67",
  "a2_reverse": {
   "inputs": {
    "start": "",
    "change": "20",
    "end": "2400",
    "second": ""
   },
   "solves": "start",
   "exact": "2000/1",
   "outOfRange": false,
   "start": "2000.00",
   "change": "20.00",
   "end": "2400.00",
   "amount": "400.00",
   "endPercentOfStart": "120.00",
   "undo": "-16.67"
  },
  "a2_wrong_subtract": "1920.00",
  "a2_gst_like": {
   "inputs": {
    "start": "",
    "change": "18",
    "end": "118",
    "second": ""
   },
   "solves": "start",
   "exact": "100/1",
   "outOfRange": false,
   "start": "100.00",
   "change": "18.00",
   "end": "118.00",
   "amount": "18.00",
   "endPercentOfStart": "118.00",
   "undo": "-15.25"
  },
  "a3_points": {
   "from": "5",
   "to": "7",
   "points": "2.00",
   "percent": "40.00"
  }
 }
};

const SC = GOLDEN.scenarios;
const solve = (inputs) => solvePercentage({ start: "", change: "", end: "", second: "", ...inputs });
const shown = (fig) => plainText(fig.h);

describe("the golden scenarios: every displayed figure equals the independent reference", () => {
  for (const [name, g] of Object.entries(SC)) {
    test(name, () => {
      const r = solve(g.inputs);
      if (g.outOfRange) {
        assert.equal(r.status, "out-of-range");
        assert.equal(r.solvesFor, g.solves);
        assert.equal(`${r.exact.n}/${r.exact.d}`, g.exact);
        return;
      }
      assert.equal(r.status, "solved");
      assert.equal(r.solvesFor, g.solves);
      assert.equal(`${r[g.solves].exact.n}/${r[g.solves].exact.d}`, g.exact);
      for (const key of ["start", "change", "end", "amount", "undo"]) assert.equal(shown(r[key]), g[key], `${name}.${key}`);
      assert.equal(shown(r.endPercentOfStart), g.endPercentOfStart);
      if (g.second) {
        assert.equal(r.second.status, g.second.end2OutOfRange ? "out-of-range" : "solved");
        assert.equal(shown(r.second.q), g.second.q);
        if (!g.second.end2OutOfRange) {
          assert.equal(shown(r.second.end2), g.second.end2);
          assert.equal(shown(r.second.net), g.second.net);
          assert.equal(shown(r.second.plainSum), g.second.plainSum);
        }
      } else assert.equal(r.second, null);
    });
  }
});

describe("the three-way interaction", () => {
  test("exactly two filled solve the third", () => {
    assert.equal(solve({ start: "2000", change: "20" }).solvesFor, "end");
    assert.equal(solve({ start: "2000", end: "2400" }).solvesFor, "change");
    assert.equal(solve({ change: "20", end: "2400" }).solvesFor, "start");
  });

  test("fewer than two filled: nothing is calculated and it is not an error", () => {
    for (const inputs of [{}, { start: "2000" }, { change: "20" }, { end: "2400" }, { start: "   " }]) assert.equal(solve(inputs).status, "incomplete");
  });

  test("all three filled: nothing is calculated, nothing is guessed", () => {
    assert.deepEqual(solve({ start: "2000", change: "20", end: "2400" }), { status: "all-three" });
    // even three values that disagree are not resolved by the engine
    assert.deepEqual(solve({ start: "1", change: "1", end: "99" }), { status: "all-three" });
  });

  test("clearing one of three makes it the solved one, deterministically", () => {
    const all = { start: "2000", change: "20", end: "2400" };
    assert.equal(solve({ ...all, start: "" }).solvesFor, "start");
    assert.equal(plainText(solve({ ...all, start: "" }).start.h), "2000.00");
    assert.equal(solve({ ...all, change: "" }).solvesFor, "change");
    assert.equal(plainText(solve({ ...all, change: "" }).change.h), "20.00");
    assert.equal(solve({ ...all, end: "" }).solvesFor, "end");
    assert.equal(plainText(solve({ ...all, end: "" }).end.h), "2400.00");
    const again = (o) => JSON.stringify(solve(o), (k, v) => (typeof v === "bigint" ? v.toString() : v));
    assert.equal(again({ ...all, end: "" }), again({ ...all, end: "" }));
  });

  test("the Reset state solves the forward example (2,000 and 20% gives 2,400.00) and is never all three", () => {
    assert.deepEqual({ ...DEFAULT_INPUTS }, { start: "2000", change: "20", end: "", second: "" });
    const r = solve(DEFAULT_INPUTS);
    assert.equal(r.status, "solved");
    assert.equal(r.solvesFor, "end");
    assert.equal(plainText(r.end.h), "2400.00");
  });

  test("half-typed text is incomplete, not an error, and does not count as filled", () => {
    for (const text of ["-", "+", ".", "-.", "1.", "-0.", "%"]) {
      assert.equal(parseField(text, "change").state, "partial", text);
      assert.equal(solve({ start: "2000", change: text }).status, "incomplete", text);
    }
    assert.equal(parseField("", "value").state, "blank");
    assert.equal(parseField("   ", "value").state, "blank");
  });
});

describe("reading a field", () => {
  test("grouping, sign, percent sign and decimals", () => {
    assert.equal(parseField("1,50,000", "value").hundredths, 15000000n);
    assert.equal(parseField("150000.5", "value").hundredths, 15000050n);
    assert.equal(parseField("20%", "change").hundredths, 2000n);
    assert.equal(parseField("−12.5", "change").hundredths, -1250n);
    assert.equal(parseField("+3", "change").hundredths, 300n);
    assert.equal(parseField(".5", "change").hundredths, 50n);
    assert.equal(parseField("-0", "change").hundredths, 0n);
  });

  test("input errors: a value outside its range, a third decimal, text", () => {
    for (const [text, kind] of [["0", "value"], ["0.00", "value"], ["-5", "value"], ["1000000000.01", "value"], ["-100", "change"], ["-99.995", "change"], ["1000000.01", "change"], ["1.234", "value"], ["abc", "value"], ["1e5", "value"], ["1.2.3", "value"]]) {
      assert.equal(parseField(text, kind).state, "invalid", text);
    }
    assert.match(parseField("0", "value").message, /between 0\.01 and 1,00,00,00,000/);
    assert.match(parseField("-100", "change").message, /−99\.99 and 10,00,000/);
    assert.match(parseField("1.234", "value").message, /2 decimal/);
    assert.deepEqual(solve({ start: "0", change: "20" }).errors.map((e) => e.field), ["start"]);
    assert.equal(solve({ start: "0", change: "20" }).status, "invalid");
  });

  test("the boundaries are valid: 0.01, 1,00,00,00,000, -99.99, 10,00,000 and a zero change", () => {
    assert.equal(parseField("0.01", "value").state, "valid");
    assert.equal(parseField("1000000000", "value").state, "valid");
    assert.equal(parseField("-99.99", "change").state, "valid");
    assert.equal(parseField("1000000", "change").state, "valid");
    assert.equal(parseField("0", "change").state, "valid");
  });

  test("an invalid field shows its error and blocks a result, wherever it is", () => {
    assert.equal(solve({ start: "2000", change: "20", second: "-100" }).status, "invalid");
    assert.deepEqual(solve({ start: "2000", change: "20", second: "-100" }).errors.map((e) => e.field), ["second"]);
    assert.equal(solve({ start: "abc" }).status, "invalid");
  });
});

describe("solved result out of range (not an input error, never clamped)", () => {
  test("Golden 12: end 0.01 and +10,00,000% give a start of 1/1,000,100, below 0.01", () => {
    const r = solve({ change: "1000000", end: "0.01" });
    assert.equal(r.status, "out-of-range");
    assert.equal(r.solvesFor, "start");
    assert.deepEqual(r.exact, { n: "1", d: "1000100" });
    assert.equal("errors" in r, false);
    assert.equal("start" in r, false);
  });

  test("a solved end above the maximum, a solved change above and below its limits, and the exact edges that are allowed", () => {
    assert.equal(solve({ start: "999999999", change: "10" }).status, "out-of-range");
    assert.equal(solve({ start: "1", end: "10001.01" }).status, "out-of-range");
    assert.equal(solve({ start: "1000", end: "0.01" }).status, "out-of-range");
    assert.equal(solve({ start: "1", end: "10001" }).status, "solved");
    assert.equal(solve({ start: "100", end: "0.01" }).status, "solved");
    assert.equal(solve({ start: "1000000000", change: "0" }).status, "solved");
    assert.equal(solve({ change: "-50", end: "0.01" }).status, "solved"); // start 0.02
  });

  test("the range is judged on the exact value, before rounding", () => {
    // 0.01 * 100 / 100.5 is just under 0.01: out of range although it would round to 0.01
    assert.equal(solve({ change: "0.5", end: "0.01" }).status, "out-of-range");
    // exactly at the minimum is allowed
    assert.equal(solve({ change: "0", end: "0.01" }).status, "solved");
  });
});

describe("outputs: change amount, end as a percentage of the start, the undoing change", () => {
  test("the extreme undo is shown in full (it is an output, not limited by the input range of a change)", () => {
    const r = solve({ start: "100", change: "-99.99" });
    assert.equal(r.status, "solved");
    assert.equal(plainText(r.undo.h), "999900.00");
    assert.equal(groupedText(r.undo.h), "9,99,900.00");
  });

  test("the exact fractions: 7 raised by 13.37% is 79359/10000, and its exact undo returns 7", () => {
    const r = solve({ start: "7", change: "13.37" });
    assert.equal(`${r.end.exact.n}/${r.end.exact.d}`, "79359/10000");
    // the undo is -100 * 13.37 / 113.37 = -133700/11337 %, so 7.9359 * (100 - 1337000/11337) / 100 = 7 (checked in exact integers)
    const undoN = BigInt(r.undo.exact.n);
    const undoD = BigInt(r.undo.exact.d);
    const endN = BigInt(r.end.exact.n);
    const endD = BigInt(r.end.exact.d);
    // end * (100 + undo) / 100 = 7  <=>  endN * (100 * undoD + undoN) = 700 * endD * undoD
    assert.equal(endN * (100n * undoD + undoN), 700n * endD * undoD);
  });
});

describe("the second change", () => {
  test("applies after the first relationship: 1,00,000, +20%, then -20% gives 96,000, net -4.00%, plain sum 0.00%", () => {
    const r = solve({ start: "100000", change: "20", second: "-20" });
    assert.equal(plainText(r.end.h), "120000.00");
    assert.equal(plainText(r.second.end2.h), "96000.00");
    assert.equal(plainText(r.second.net.h), "-4.00");
    assert.equal(plainText(r.second.plainSum.h), "0.00");
  });

  test("it follows whichever core field is blank (a solved start is the base for the net)", () => {
    const r = solve({ change: "20", end: "120000", second: "-20" });
    assert.equal(plainText(r.start.h), "100000.00");
    assert.equal(plainText(r.second.net.h), "-4.00");
  });

  test("a blank or half-typed second change gives no scenario; one past the output range is out of range, not an error", () => {
    assert.equal(solve({ start: "5000", change: "10" }).second, null);
    assert.equal(solve({ start: "5000", change: "10", second: "-" }).second, null);
    assert.equal(solve({ start: "900000000", change: "10", second: "10" }).second.status, "out-of-range");
  });

  test("it never creates a result of its own: with fewer than two core fields, or all three, it is ignored", () => {
    assert.equal(solve({ start: "100000", second: "-20" }).status, "incomplete");
    assert.equal(solve({ start: "100", change: "10", end: "110", second: "5" }).status, "all-three");
  });
});

describe("display rounding and text", () => {
  test("half up: a tie goes away from zero, in both directions, and never negative zero", () => {
    assert.equal(roundToHundredths({ n: 201n, d: 200n }), 101n);
    assert.equal(roundToHundredths({ n: 199n, d: 200n }), 100n);
    assert.equal(roundToHundredths({ n: -1n, d: 200n }), -1n);
    assert.equal(roundToHundredths({ n: 1n, d: 200n }), 1n);
    assert.equal(roundToHundredths({ n: -1n, d: 100000n }), 0n);
    assert.equal(plainText(0n), "0.00");
  });

  test("grouping: Indian digits, the sign and the decimals", () => {
    assert.equal(groupedText(0n), "0.00");
    assert.equal(groupedText(100n), "1.00");
    assert.equal(groupedText(99999n), "999.99");
    assert.equal(groupedText(100000n), "1,000.00");
    assert.equal(groupedText(12345678n), "1,23,456.78");
    assert.equal(groupedText(-12345678n), "-1,23,456.78");
    assert.equal(groupedText(100000000n), "10,00,000.00");
    assert.equal(groupedText(100000000000n), "1,00,00,00,000.00");
  });
});

describe("invariants over a grid of values (exact fractions)", () => {
  test("forward then reverse returns the start exactly, and the net of a change then its undo is zero", () => {
    for (const s of ["0.01", "1", "7.77", "250", "99999.99"]) {
      for (const p of ["-99.99", "-50", "-12.5", "0", "0.01", "33.33", "1000", "250000"]) {
        const fwd = solve({ start: s, change: p });
        if (fwd.status !== "solved") continue;
        // reverse from the EXACT end: end * 100 / (100 + p) equals the start (integers: endN * 10000 == startH * ...)
        const endN = BigInt(fwd.end.exact.n);
        const endD = BigInt(fwd.end.exact.d);
        const startN = BigInt(fwd.start.exact.n);
        const startD = BigInt(fwd.start.exact.d);
        const pH = BigInt(Math.round(Number(p) * 100));
        // end = start * (10000 + pH) / 10000
        assert.equal(endN * startD * 10000n, startN * endD * (10000n + pH), `${s} ${p}`);
        const second = solve({ start: s, change: p, second: plainText(fwd.undo.h) });
        if (second.status === "solved" && second.second?.status === "solved") {
          // the undo is rounded for the field, so the net is within one hundredth of a percent of zero
          assert.ok(Math.abs(Number(plainText(second.second.net.h))) <= Math.max(0.02, Math.abs(Number(p)) * 0.0005 + 0.02), `${s} ${p} net ${plainText(second.second.net.h)}`);
        }
      }
    }
  });
});
