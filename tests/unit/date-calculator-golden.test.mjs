/**
 * Tool Pack 12: the Date Calculator engine against the independent reference.
 *
 * GOLDEN is the output of tests/fixtures/date-calculator-golden.py (Python datetime.date, timedelta and calendar.monthrange; the
 * supported range is the one Python's date type enforces). The engine uses integer days-from-civil arithmetic; nothing here is copied
 * from it. Regenerate the literal by running the script. The contract is NOT reversible after a month-end clamp, so no test asserts
 * "add then subtract returns the start"; the tests state the defined semantics instead.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateDate,
  dateFromDayNumber,
  weekdayOf,
  parseAmount,
  durationText,
  clampText,
  displacementText,
} from "../../assets/js/tools/date-calculator/date-arithmetic.js";
import { dayNumber, daysInMonth } from "../../assets/js/tools/date-difference/date-engine.js";

const GOLDEN = {
 "cases": {
  "2026-01-15|add|0|0|0|10": {
   "status": "ok",
   "result": "2026-01-25",
   "weekday": "Sunday",
   "clamped": false,
   "displacement": 10
  },
  "2026-01-15|subtract|0|0|0|10": {
   "status": "ok",
   "result": "2026-01-05",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -10
  },
  "2026-03-10|add|0|0|2|3": {
   "status": "ok",
   "result": "2026-03-27",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 17
  },
  "2026-03-10|subtract|0|0|2|3": {
   "status": "ok",
   "result": "2026-02-21",
   "weekday": "Saturday",
   "clamped": false,
   "displacement": -17
  },
  "2026-06-15|add|1|2|3|4": {
   "status": "ok",
   "result": "2027-09-09",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 451
  },
  "2026-06-15|subtract|1|2|3|4": {
   "status": "ok",
   "result": "2025-03-21",
   "weekday": "Friday",
   "clamped": false,
   "displacement": -451
  },
  "2026-01-31|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": 28
  },
  "2024-01-31|add|0|1|0|0": {
   "status": "ok",
   "result": "2024-02-29",
   "weekday": "Thursday",
   "clamped": true,
   "displacement": 29
  },
  "2026-03-31|subtract|0|1|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": -31
  },
  "2026-05-31|subtract|0|1|0|0": {
   "status": "ok",
   "result": "2026-04-30",
   "weekday": "Thursday",
   "clamped": true,
   "displacement": -31
  },
  "2026-08-31|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-09-30",
   "weekday": "Wednesday",
   "clamped": true,
   "displacement": 30
  },
  "2026-01-30|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": 29
  },
  "2026-01-29|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": 30
  },
  "2028-01-29|add|0|1|0|0": {
   "status": "ok",
   "result": "2028-02-29",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 31
  },
  "2026-01-31|add|0|1|0|1": {
   "status": "ok",
   "result": "2026-03-01",
   "weekday": "Sunday",
   "clamped": true,
   "displacement": 29
  },
  "2026-01-31|add|0|1|1|0": {
   "status": "ok",
   "result": "2026-03-07",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": 35
  },
  "2026-01-31|add|0|2|0|0": {
   "status": "ok",
   "result": "2026-03-31",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 59
  },
  "2026-01-31|add|0|13|0|0": {
   "status": "ok",
   "result": "2027-02-28",
   "weekday": "Sunday",
   "clamped": true,
   "displacement": 393
  },
  "2026-02-28|subtract|0|1|0|0": {
   "status": "ok",
   "result": "2026-01-28",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": -31
  },
  "2026-02-28|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-03-28",
   "weekday": "Saturday",
   "clamped": false,
   "displacement": 28
  },
  "2026-10-31|subtract|0|8|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": -245
  },
  "2024-02-29|add|1|0|0|0": {
   "status": "ok",
   "result": "2025-02-28",
   "weekday": "Friday",
   "clamped": true,
   "displacement": 365
  },
  "2024-02-29|add|4|0|0|0": {
   "status": "ok",
   "result": "2028-02-29",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 1461
  },
  "2024-02-29|subtract|1|0|0|0": {
   "status": "ok",
   "result": "2023-02-28",
   "weekday": "Tuesday",
   "clamped": true,
   "displacement": -366
  },
  "2024-02-29|add|0|12|0|0": {
   "status": "ok",
   "result": "2025-02-28",
   "weekday": "Friday",
   "clamped": true,
   "displacement": 365
  },
  "2024-02-28|add|0|0|0|1": {
   "status": "ok",
   "result": "2024-02-29",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 1
  },
  "2024-02-28|add|0|0|0|2": {
   "status": "ok",
   "result": "2024-03-01",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 2
  },
  "2023-02-28|add|0|0|0|1": {
   "status": "ok",
   "result": "2023-03-01",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": 1
  },
  "1900-02-28|add|0|0|0|1": {
   "status": "ok",
   "result": "1900-03-01",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 1
  },
  "2000-02-28|add|0|0|0|1": {
   "status": "ok",
   "result": "2000-02-29",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 1
  },
  "2100-02-28|add|0|0|0|1": {
   "status": "ok",
   "result": "2100-03-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": 1
  },
  "1900-03-01|subtract|0|0|0|1": {
   "status": "ok",
   "result": "1900-02-28",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": -1
  },
  "2000-03-01|subtract|0|0|0|1": {
   "status": "ok",
   "result": "2000-02-29",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": -1
  },
  "2000-02-29|add|100|0|0|0": {
   "status": "ok",
   "result": "2100-02-28",
   "weekday": "Sunday",
   "clamped": true,
   "displacement": 36524
  },
  "2000-02-29|add|400|0|0|0": {
   "status": "ok",
   "result": "2400-02-29",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 146097
  },
  "1896-02-29|add|4|0|0|0": {
   "status": "ok",
   "result": "1900-02-28",
   "weekday": "Wednesday",
   "clamped": true,
   "displacement": 1460
  },
  "2025-12-31|add|0|0|0|1": {
   "status": "ok",
   "result": "2026-01-01",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 1
  },
  "2026-01-01|subtract|0|0|0|1": {
   "status": "ok",
   "result": "2025-12-31",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": -1
  },
  "2025-12-15|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-01-15",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 31
  },
  "2026-01-15|subtract|0|1|0|0": {
   "status": "ok",
   "result": "2025-12-15",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -31
  },
  "2025-11-30|add|0|3|0|0": {
   "status": "ok",
   "result": "2026-02-28",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": 90
  },
  "2026-01-28|add|0|0|1|0": {
   "status": "ok",
   "result": "2026-02-04",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": 7
  },
  "2026-12-28|add|0|0|1|0": {
   "status": "ok",
   "result": "2027-01-04",
   "weekday": "Monday",
   "clamped": false,
   "displacement": 7
  },
  "2026-01-03|subtract|0|0|1|0": {
   "status": "ok",
   "result": "2025-12-27",
   "weekday": "Saturday",
   "clamped": false,
   "displacement": -7
  },
  "2026-02-25|add|0|0|2|0": {
   "status": "ok",
   "result": "2026-03-11",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": 14
  },
  "2026-01-01|add|0|0|0|1000": {
   "status": "ok",
   "result": "2028-09-27",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": 1000
  },
  "2026-01-01|subtract|0|0|0|1000": {
   "status": "ok",
   "result": "2023-04-07",
   "weekday": "Friday",
   "clamped": false,
   "displacement": -1000
  },
  "2026-01-01|add|0|0|5000|0": {
   "status": "ok",
   "result": "2121-10-30",
   "weekday": "Thursday",
   "clamped": false,
   "displacement": 35000
  },
  "2026-01-01|add|100|0|0|0": {
   "status": "ok",
   "result": "2126-01-01",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 36524
  },
  "2026-01-01|add|0|1200|0|0": {
   "status": "ok",
   "result": "2126-01-01",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 36524
  },
  "2026-01-01|add|0|0|0|3652058": {
   "status": "out-of-range"
  },
  "2026-05-05|add|0|0|0|0": {
   "status": "ok",
   "result": "2026-05-05",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 0
  },
  "2026-05-05|subtract|0|0|0|0": {
   "status": "ok",
   "result": "2026-05-05",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 0
  },
  "0001-01-01|add|0|0|0|0": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": 0
  },
  "0001-01-01|add|0|0|0|1": {
   "status": "ok",
   "result": "0001-01-02",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 1
  },
  "0001-01-01|subtract|0|0|0|1": {
   "status": "out-of-range"
  },
  "0001-01-02|subtract|0|0|0|1": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -1
  },
  "0001-01-31|subtract|0|1|0|0": {
   "status": "out-of-range"
  },
  "0001-03-31|subtract|0|1|0|0": {
   "status": "ok",
   "result": "0001-02-28",
   "weekday": "Wednesday",
   "clamped": true,
   "displacement": -31
  },
  "0001-12-31|subtract|1|0|0|0": {
   "status": "out-of-range"
  },
  "0002-01-01|subtract|1|0|0|0": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -365
  },
  "0002-01-01|subtract|0|12|0|0": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -365
  },
  "0005-02-28|subtract|4|0|0|0": {
   "status": "ok",
   "result": "0001-02-28",
   "weekday": "Wednesday",
   "clamped": false,
   "displacement": -1461
  },
  "9999-12-31|add|0|0|0|0": {
   "status": "ok",
   "result": "9999-12-31",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 0
  },
  "9999-12-30|add|0|0|0|1": {
   "status": "ok",
   "result": "9999-12-31",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 1
  },
  "9999-12-31|add|0|0|0|1": {
   "status": "out-of-range"
  },
  "9999-12-31|add|0|1|0|0": {
   "status": "out-of-range"
  },
  "9999-12-31|add|1|0|0|0": {
   "status": "out-of-range"
  },
  "9999-01-31|add|0|11|0|0": {
   "status": "ok",
   "result": "9999-12-31",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 334
  },
  "9999-01-31|add|0|12|0|0": {
   "status": "out-of-range"
  },
  "9998-12-31|add|1|0|0|0": {
   "status": "ok",
   "result": "9999-12-31",
   "weekday": "Friday",
   "clamped": false,
   "displacement": 365
  },
  "9999-06-15|add|0|0|29|0": {
   "status": "out-of-range"
  },
  "9999-06-15|add|0|0|28|0": {
   "status": "ok",
   "result": "9999-12-28",
   "weekday": "Tuesday",
   "clamped": false,
   "displacement": 196
  },
  "9999-12-01|subtract|9998|11|0|0": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -3652028
  },
  "9999-12-31|subtract|9998|11|0|30": {
   "status": "ok",
   "result": "0001-01-01",
   "weekday": "Monday",
   "clamped": false,
   "displacement": -3652058
  },
  "9999-12-31|subtract|9998|11|0|31": {
   "status": "out-of-range"
  },
  "9999-12-31|subtract|9999|0|0|0": {
   "status": "out-of-range"
  },
  "2026-03-31|subtract|0|1|0|1": {
   "status": "ok",
   "result": "2026-02-27",
   "weekday": "Friday",
   "clamped": true,
   "displacement": -32
  },
  "2026-03-31|subtract|0|1|1|0": {
   "status": "ok",
   "result": "2026-02-21",
   "weekday": "Saturday",
   "clamped": true,
   "displacement": -38
  },
  "2026-07-31|add|0|1|0|0": {
   "status": "ok",
   "result": "2026-08-31",
   "weekday": "Monday",
   "clamped": false,
   "displacement": 31
  }
 }
};

const iso = ({ year, month, day }) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const run = (start, operation, years = 0, months = 0, weeks = 0, days = 0) =>
  calculateDate({ start, operation, years: String(years), months: String(months), weeks: String(weeks), days: String(days) });

describe("the golden cases: every result equals the independent reference", () => {
  for (const [key, g] of Object.entries(GOLDEN.cases)) {
    test(key, () => {
      const [start, op, y, m, w, d] = key.split("|");
      const zero = [y, m, w, d].every((x) => x === "0");
      const r = run(start, op, y, m, w, d);
      if (zero) return assert.equal(r.status, "incomplete"); // nothing to apply: guidance, not a result
      if (g.status === "out-of-range") return assert.equal(r.status, "out-of-range");
      assert.equal(r.status, "ok");
      assert.deepEqual(
        { result: iso(r.result), weekday: r.resultWeekday, clamped: r.clamp !== null, displacement: r.displacement },
        { result: g.result, weekday: g.weekday, clamped: g.clamped, displacement: g.displacement },
      );
    });
  }
});

describe("the contract, stated with examples", () => {
  test("month-end clamping", () => {
    assert.equal(iso(run("2026-01-31", "add", 0, 1).result), "2026-02-28");
    assert.equal(iso(run("2024-01-31", "add", 0, 1).result), "2024-02-29");
    assert.equal(iso(run("2024-02-29", "add", 1).result), "2025-02-28");
    assert.equal(iso(run("2026-03-31", "subtract", 0, 1).result), "2026-02-28");
    assert.equal(iso(run("2026-07-31", "add", 0, 1).result), "2026-08-31");
  });

  test("operation order: months first (with the clamp), then weeks and days", () => {
    assert.equal(iso(run("2026-01-31", "add", 0, 1, 0, 1).result), "2026-03-01"); // 28 Feb, then +1 day
    assert.equal(iso(run("2026-03-31", "subtract", 0, 1, 0, 1).result), "2026-02-27"); // 28 Feb, then -1 day
    assert.equal(iso(run("2026-06-15", "add", 1, 2, 3, 4).result), "2027-09-09"); // 15 Aug 2027, then +25 days
  });

  test("a year is exactly twelve months", () => {
    for (const start of ["2024-02-29", "2026-05-31", "2023-10-31"]) {
      assert.deepEqual(run(start, "add", 2).result, run(start, "add", 0, 24).result);
      assert.deepEqual(run(start, "subtract", 1, 6).result, run(start, "subtract", 0, 18).result);
    }
  });

  test("a week is exactly seven days", () => {
    for (const start of ["2026-02-25", "2025-12-28", "1999-01-01"]) {
      assert.deepEqual(run(start, "add", 0, 0, 3).result, run(start, "add", 0, 0, 0, 21).result);
      assert.deepEqual(run(start, "subtract", 0, 0, 52).result, run(start, "subtract", 0, 0, 0, 364).result);
    }
  });

  test("it is not reversible after a clamp, and that is the defined behavior", () => {
    const forward = run("2026-01-31", "add", 0, 1);
    assert.equal(iso(forward.result), "2026-02-28");
    assert.equal(iso(run("2026-02-28", "subtract", 0, 1).result), "2026-01-28"); // not 31 January
  });

  test("Gregorian century rules", () => {
    assert.equal(iso(run("1900-02-28", "add", 0, 0, 0, 1).result), "1900-03-01"); // 1900 is not a leap year
    assert.equal(iso(run("2000-02-28", "add", 0, 0, 0, 1).result), "2000-02-29"); // 2000 is
    assert.equal(iso(run("2100-02-28", "add", 0, 0, 0, 1).result), "2100-03-01"); // 2100 is not
    assert.equal(iso(run("2000-02-29", "add", 100).result), "2100-02-28");
    assert.equal(iso(run("2000-02-29", "add", 400).result), "2400-02-29");
  });

  test("displacement is the signed calendar days from the start to the result, not the entered duration", () => {
    assert.equal(run("2026-01-31", "add", 0, 1).displacement, 28);
    assert.equal(run("2026-01-01", "add", 0, 1).displacement, 31);
    assert.equal(run("2026-01-01", "subtract", 0, 0, 1).displacement, -7);
  });

  test("the clamp is reported only when it happened", () => {
    assert.equal(run("2026-01-30", "add", 0, 1).clamp.lastDay, 28);
    assert.equal(run("2026-01-28", "add", 0, 1).clamp, null);
    assert.equal(run("2026-01-31", "add", 0, 0, 0, 40).clamp, null); // days alone never clamp
    assert.equal(run("2026-01-31", "add", 0, 1, 0, 1).clamp.thenOffset, true);
    assert.equal(run("2026-01-31", "add", 0, 1).clamp.thenOffset, false);
  });
});

describe("the supported range", () => {
  test("the two ends are reachable and one step beyond is refused", () => {
    assert.equal(iso(run("0001-01-02", "subtract", 0, 0, 0, 1).result), "0001-01-01");
    assert.equal(run("0001-01-01", "subtract", 0, 0, 0, 1).status, "out-of-range");
    assert.equal(iso(run("9999-12-30", "add", 0, 0, 0, 1).result), "9999-12-31");
    assert.equal(run("9999-12-31", "add", 0, 0, 0, 1).status, "out-of-range");
    assert.equal(run("9999-12-31", "add", 0, 1).status, "out-of-range");
    assert.equal(run("0001-06-01", "subtract", 1).status, "out-of-range");
    assert.match(run("9999-12-31", "add", 1).message, /1 to 9999/);
  });

  test("seven-digit amounts are accepted and refused by range, never by overflow", () => {
    assert.equal(run("2026-01-01", "add", 9999999).status, "out-of-range");
    assert.equal(run("2026-01-01", "add", 0, 9999999).status, "out-of-range");
    assert.equal(run("2026-01-01", "add", 0, 0, 9999999).status, "out-of-range");
    assert.equal(run("2026-01-01", "subtract", 0, 0, 0, 9999999).status, "out-of-range");
    assert.equal(iso(run("0001-01-01", "add", 0, 0, 0, 3652058).result), "9999-12-31");
  });
});

describe("input handling: never a number from bad input", () => {
  test("a missing start date or an empty duration gives guidance, not a result", () => {
    assert.deepEqual(calculateDate({ start: "", operation: "add", days: "5" }), { status: "incomplete" });
    assert.deepEqual(calculateDate({ start: "2026-01-01", operation: "add" }), { status: "incomplete" });
    assert.deepEqual(run("2026-01-01", "add", 0, 0, 0, 0), { status: "incomplete" });
    assert.deepEqual(calculateDate({}), { status: "incomplete" });
    assert.deepEqual(calculateDate(undefined), { status: "incomplete" });
  });

  test("blank amounts are zero", () => {
    const r = calculateDate({ start: "2026-01-01", operation: "add", years: "", months: " ", weeks: "", days: "3" });
    assert.equal(iso(r.result), "2026-01-04");
  });

  test("impossible dates and bad amounts name the field", () => {
    for (const bad of ["2026-02-30", "2026-13-01", "0000-01-01", "10000-01-01", "2026-1-1", "abc", "2023-02-29", "1900-02-29"]) {
      const r = run(bad, "add", 0, 0, 0, 1);
      assert.equal(r.status, "invalid", bad);
      assert.deepEqual(r.errors.map((e) => e.field), ["start"], bad);
    }
    for (const bad of ["-1", "1.5", "1e3", "abc", "12345678", "NaN", "Infinity", "+3", "1,000", "0x10"]) {
      const r = calculateDate({ start: "2026-01-01", operation: "add", days: bad });
      assert.equal(r.status, "invalid", bad);
      assert.deepEqual(r.errors.map((e) => e.field), ["days"], bad);
      assert.ok(r.errors[0].message.length > 10);
    }
    const many = calculateDate({ start: "x", operation: "add", years: "-1", weeks: "2.5" });
    assert.deepEqual(many.errors.map((e) => e.field), ["start", "years", "weeks"]);
    assert.equal(parseAmount("0").value, 0);
    assert.equal(parseAmount("0012").value, 12);
  });

  test("an unknown operation is treated as add, never as something else", () => {
    assert.equal(iso(calculateDate({ start: "2026-01-01", operation: "multiply", days: "1" }).result), "2026-01-02");
  });
});

describe("weekday and day-number round trips, against the UTC clock as a second opinion", () => {
  test("weekdays: known dates", () => {
    assert.equal(weekdayOf({ year: 2026, month: 1, day: 1 }), "Thursday");
    assert.equal(weekdayOf({ year: 1970, month: 1, day: 1 }), "Thursday");
    assert.equal(weekdayOf({ year: 2000, month: 2, day: 29 }), "Tuesday");
    assert.equal(weekdayOf({ year: 1, month: 1, day: 1 }), "Monday");
    assert.equal(weekdayOf({ year: 9999, month: 12, day: 31 }), "Friday");
    assert.equal(weekdayOf({ year: 1969, month: 12, day: 31 }), "Wednesday");
  });

  test("dateFromDayNumber inverts dayNumber across years 1 to 9999 (sampled), and weekdays match UTC", () => {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let checked = 0;
    for (let year = 1; year <= 9999; year += 7) {
      for (let month = 1; month <= 12; month++) {
        for (const day of [1, 14, 28, daysInMonth(year, month)]) {
          const date = { year, month, day };
          assert.deepEqual(dateFromDayNumber(dayNumber(date)), date, iso(date));
          // years below 100 are read as 1900+ by Date.UTC, so set the year explicitly
          const utc = new Date(Date.UTC(2000, month - 1, day));
          utc.setUTCFullYear(year);
          assert.equal(weekdayOf(date), names[utc.getUTCDay()], iso(date));
          checked++;
        }
      }
    }
    assert.ok(checked > 60000);
  });

  test("every day number in windows around the epoch and the century boundaries round-trips", () => {
    for (const center of [0, dayNumber({ year: 1900, month: 3, day: 1 }), dayNumber({ year: 2000, month: 3, day: 1 }), dayNumber({ year: 2100, month: 3, day: 1 })]) {
      for (let n = center - 800; n <= center + 800; n++) {
        const date = dateFromDayNumber(n);
        assert.equal(dayNumber(date), n);
        assert.ok(date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= daysInMonth(date.year, date.month));
      }
    }
  });
});

describe("the words", () => {
  test("duration, clamp and displacement text", () => {
    assert.equal(durationText({ years: 1, months: 2, weeks: 3, days: 4 }), "1 year, 2 months, 3 weeks and 4 days");
    assert.equal(durationText({ years: 0, months: 1, weeks: 0, days: 0 }), "1 month");
    assert.equal(durationText({ years: 0, months: 2, weeks: 0, days: 1 }), "2 months and 1 day");
    assert.equal(durationText({ years: 0, months: 0, weeks: 0, days: 0 }), "");
    assert.equal(clampText(run("2026-01-31", "add", 0, 1).clamp), "February 2026 has only 28 days, so the date was adjusted from day 31 to the last day of the month, 28 February.");
    assert.equal(displacementText(28), "28 days after the start date");
    assert.equal(displacementText(-1), "1 day before the start date");
    assert.equal(displacementText(0), "the same day as the start date");
  });
});
