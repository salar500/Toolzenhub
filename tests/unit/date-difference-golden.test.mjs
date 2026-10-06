/**
 * Tool Pack 11: the Date Difference engine against the independent reference.
 *
 * GOLDEN holds the output of tests/fixtures/date-difference-golden.py (Python datetime for the total days, and the calendar breakdown
 * found by WALKING months with calendar.monthrange; it also asserts the month-step properties over about 420,000 start/offset pairs).
 * The engine uses integer days-from-civil arithmetic and a formula for the month count; nothing here is copied from it. Regenerate the
 * literal by running the script.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateDateDifference,
  parseDate,
  addMonths,
  dayNumber,
  daysInMonth,
  isLeapYear,
  unitsText,
  daysText,
  weeksText,
  dateText,
} from "../../assets/js/tools/date-difference/date-engine.js";

const GOLDEN = {
 "cases": {
  "2026-01-01|2026-01-02": {
   "start": "2026-01-01",
   "end": "2026-01-02",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2026-01-01|2026-02-01": {
   "start": "2026-01-01",
   "end": "2026-02-01",
   "reversed": false,
   "same": false,
   "totalDays": 31,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 3
  },
  "2024-02-28|2024-03-01": {
   "start": "2024-02-28",
   "end": "2024-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 2,
   "years": 0,
   "months": 0,
   "days": 2,
   "weeks": 0,
   "weekDays": 2
  },
  "2023-02-28|2023-03-01": {
   "start": "2023-02-28",
   "end": "2023-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2026-01-31|2026-02-28": {
   "start": "2026-01-31",
   "end": "2026-02-28",
   "reversed": false,
   "same": false,
   "totalDays": 28,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 0
  },
  "2026-01-31|2026-03-01": {
   "start": "2026-01-31",
   "end": "2026-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 29,
   "years": 0,
   "months": 1,
   "days": 1,
   "weeks": 4,
   "weekDays": 1
  },
  "2024-01-31|2024-03-01": {
   "start": "2024-01-31",
   "end": "2024-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 30,
   "years": 0,
   "months": 1,
   "days": 1,
   "weeks": 4,
   "weekDays": 2
  },
  "2024-01-31|2024-02-29": {
   "start": "2024-01-31",
   "end": "2024-02-29",
   "reversed": false,
   "same": false,
   "totalDays": 29,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 1
  },
  "2024-02-29|2025-02-28": {
   "start": "2024-02-29",
   "end": "2025-02-28",
   "reversed": false,
   "same": false,
   "totalDays": 365,
   "years": 1,
   "months": 0,
   "days": 0,
   "weeks": 52,
   "weekDays": 1
  },
  "2024-02-29|2025-03-01": {
   "start": "2024-02-29",
   "end": "2025-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 366,
   "years": 1,
   "months": 0,
   "days": 1,
   "weeks": 52,
   "weekDays": 2
  },
  "2024-02-29|2028-02-29": {
   "start": "2024-02-29",
   "end": "2028-02-29",
   "reversed": false,
   "same": false,
   "totalDays": 1461,
   "years": 4,
   "months": 0,
   "days": 0,
   "weeks": 208,
   "weekDays": 5
  },
  "2025-12-31|2026-01-01": {
   "start": "2025-12-31",
   "end": "2026-01-01",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2026-04-30|2026-05-30": {
   "start": "2026-04-30",
   "end": "2026-05-30",
   "reversed": false,
   "same": false,
   "totalDays": 30,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 2
  },
  "2026-04-30|2026-05-31": {
   "start": "2026-04-30",
   "end": "2026-05-31",
   "reversed": false,
   "same": false,
   "totalDays": 31,
   "years": 0,
   "months": 1,
   "days": 1,
   "weeks": 4,
   "weekDays": 3
  },
  "2026-03-31|2026-04-30": {
   "start": "2026-03-31",
   "end": "2026-04-30",
   "reversed": false,
   "same": false,
   "totalDays": 30,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 2
  },
  "2026-05-31|2026-06-30": {
   "start": "2026-05-31",
   "end": "2026-06-30",
   "reversed": false,
   "same": false,
   "totalDays": 30,
   "years": 0,
   "months": 1,
   "days": 0,
   "weeks": 4,
   "weekDays": 2
  },
  "2000-01-01|2026-10-05": {
   "start": "2000-01-01",
   "end": "2026-10-05",
   "reversed": false,
   "same": false,
   "totalDays": 9774,
   "years": 26,
   "months": 9,
   "days": 4,
   "weeks": 1396,
   "weekDays": 2
  },
  "2026-03-15|2026-03-15": {
   "start": "2026-03-15",
   "end": "2026-03-15",
   "reversed": false,
   "same": true,
   "totalDays": 0,
   "years": 0,
   "months": 0,
   "days": 0,
   "weeks": 0,
   "weekDays": 0
  },
  "2026-10-05|2026-01-01": {
   "start": "2026-10-05",
   "end": "2026-01-01",
   "reversed": true,
   "same": false,
   "totalDays": 277,
   "years": 0,
   "months": 9,
   "days": 4,
   "weeks": 39,
   "weekDays": 4
  },
  "2026-02-10|2026-01-01": {
   "start": "2026-02-10",
   "end": "2026-01-01",
   "reversed": true,
   "same": false,
   "totalDays": 40,
   "years": 0,
   "months": 1,
   "days": 9,
   "weeks": 5,
   "weekDays": 5
  },
  "0001-01-01|9999-12-31": {
   "start": "0001-01-01",
   "end": "9999-12-31",
   "reversed": false,
   "same": false,
   "totalDays": 3652058,
   "years": 9998,
   "months": 11,
   "days": 30,
   "weeks": 521722,
   "weekDays": 4
  },
  "1900-02-28|1900-03-01": {
   "start": "1900-02-28",
   "end": "1900-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2000-02-29|2000-03-01": {
   "start": "2000-02-29",
   "end": "2000-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2100-02-28|2100-03-01": {
   "start": "2100-02-28",
   "end": "2100-03-01",
   "reversed": false,
   "same": false,
   "totalDays": 1,
   "years": 0,
   "months": 0,
   "days": 1,
   "weeks": 0,
   "weekDays": 1
  },
  "2026-01-01|2026-12-31": {
   "start": "2026-01-01",
   "end": "2026-12-31",
   "reversed": false,
   "same": false,
   "totalDays": 364,
   "years": 0,
   "months": 11,
   "days": 30,
   "weeks": 52,
   "weekDays": 0
  },
  "2025-01-01|2026-01-01": {
   "start": "2025-01-01",
   "end": "2026-01-01",
   "reversed": false,
   "same": false,
   "totalDays": 365,
   "years": 1,
   "months": 0,
   "days": 0,
   "weeks": 52,
   "weekDays": 1
  },
  "2024-01-01|2025-01-01": {
   "start": "2024-01-01",
   "end": "2025-01-01",
   "reversed": false,
   "same": false,
   "totalDays": 366,
   "years": 1,
   "months": 0,
   "days": 0,
   "weeks": 52,
   "weekDays": 2
  },
  "2026-07-04|2027-07-03": {
   "start": "2026-07-04",
   "end": "2027-07-03",
   "reversed": false,
   "same": false,
   "totalDays": 364,
   "years": 0,
   "months": 11,
   "days": 29,
   "weeks": 52,
   "weekDays": 0
  }
 },
 "propertiesChecked": 420210
};

describe("the golden cases: every figure equals the independent reference", () => {
  for (const [key, g] of Object.entries(GOLDEN.cases)) {
    test(key, () => {
      const r = calculateDateDifference(g.start, g.end);
      assert.equal(r.status, "ok");
      assert.deepEqual(
        { totalDays: r.totalDays, years: r.years, months: r.months, days: r.days, weeks: r.weeks, weekDays: r.weekDays, reversed: r.reversed, same: r.same },
        { totalDays: g.totalDays, years: g.years, months: g.months, days: g.days, weeks: g.weeks, weekDays: g.weekDays, reversed: g.reversed, same: g.same },
      );
    });
  }
});

describe("the pinned examples", () => {
  const ok = (a, b) => calculateDateDifference(a, b);

  test("one day, one month, a leap-year edge and a common-year edge", () => {
    assert.equal(ok("2026-01-01", "2026-01-02").totalDays, 1);
    const jan = ok("2026-01-01", "2026-02-01");
    assert.deepEqual([jan.totalDays, jan.months, jan.days], [31, 1, 0]);
    const leap = ok("2024-02-28", "2024-03-01");
    assert.deepEqual([leap.totalDays, leap.months, leap.days], [2, 0, 2]);
    assert.equal(ok("2023-02-28", "2023-03-01").totalDays, 1);
  });

  test("month ends follow the stated rule (clamped to the end of the month)", () => {
    const a = ok("2026-01-31", "2026-02-28");
    assert.deepEqual([a.totalDays, a.months, a.days], [28, 1, 0]); // 31 Jan + 1 month = 28 Feb
    const b = ok("2026-01-31", "2026-03-01");
    assert.deepEqual([b.totalDays, b.months, b.days], [29, 1, 1]);
    const c = ok("2024-01-31", "2024-03-01");
    assert.deepEqual([c.totalDays, c.months, c.days], [30, 1, 1]);
    const d = ok("2024-02-29", "2025-02-28"); // 29 Feb + 12 months = 28 Feb in a common year
    assert.deepEqual([d.totalDays, d.years, d.months, d.days], [365, 1, 0, 0]);
    const e = ok("2024-02-29", "2028-02-29");
    assert.deepEqual([e.totalDays, e.years, e.months, e.days], [1461, 4, 0, 0]);
  });

  test("year boundary, a multi-year span and the widest supported span", () => {
    assert.equal(ok("2025-12-31", "2026-01-01").totalDays, 1);
    const x = ok("2000-01-01", "2026-10-05");
    assert.deepEqual([x.totalDays, x.years, x.months, x.days], [9774, 26, 9, 4]);
    const wide = ok("0001-01-01", "9999-12-31");
    assert.equal(wide.totalDays, 3652058);
    assert.deepEqual([wide.years, wide.months, wide.days], [9998, 11, 30]);
  });

  test("weeks and days", () => {
    const r = ok("2026-02-10", "2026-01-01");
    assert.deepEqual([r.totalDays, r.weeks, r.weekDays], [40, 5, 5]);
    assert.equal(weeksText(r.weeks, r.weekDays), "5 weeks, 5 days");
    assert.equal(weeksText(0, 5), "0 weeks, 5 days");
    assert.equal(weeksText(1, 1), "1 week, 1 day");
  });

  test("reversed dates give the distance and say so; the same date is zero and says so", () => {
    const rev = ok("2026-02-10", "2026-01-01");
    assert.equal(rev.reversed, true);
    assert.equal(rev.totalDays, 40);
    assert.deepEqual([rev.earlier, rev.later], [{ year: 2026, month: 1, day: 1 }, { year: 2026, month: 2, day: 10 }]);
    assert.equal(ok("2026-02-10", "2026-02-10").same, true);
    assert.equal(ok("2026-02-10", "2026-02-10").totalDays, 0);
    assert.equal(ok("2026-01-01", "2026-02-10").reversed, false);
  });
});

describe("reading a date: blank, incomplete and invalid input never produce a number", () => {
  test("blank and one date only", () => {
    assert.deepEqual(calculateDateDifference("", ""), { status: "incomplete" });
    assert.deepEqual(calculateDateDifference("2026-01-01", ""), { status: "incomplete" });
    assert.deepEqual(calculateDateDifference("", "2026-01-01"), { status: "incomplete" });
    assert.deepEqual(calculateDateDifference(undefined, null), { status: "incomplete" });
  });

  test("malformed and impossible dates name the field", () => {
    for (const bad of ["2026-02-30", "2026-13-01", "2026-00-10", "2026-04-31", "2023-02-29", "0000-01-01", "10000-01-01", "2026/01/01", "26-01-01", "abc", "2026-1-1", " 2026-01-01x"]) {
      const r = calculateDateDifference(bad, "2026-01-01");
      assert.equal(r.status, "invalid", bad);
      assert.deepEqual(r.errors.map((e) => e.field), ["start"], bad);
      assert.ok(r.errors[0].message.length > 10, bad);
    }
    const both = calculateDateDifference("nope", "2026-02-30");
    assert.deepEqual(both.errors.map((e) => e.field), ["start", "end"]);
    // one invalid field does not hide behind an empty other field
    assert.equal(calculateDateDifference("2026-02-30", "").status, "invalid");
  });

  test("leap years: 29 February exists only in a leap year (and 1900 and 2100 are not)", () => {
    assert.equal(parseDate("2024-02-29").state, "valid");
    assert.equal(parseDate("2000-02-29").state, "valid");
    assert.equal(parseDate("1900-02-29").state, "invalid");
    assert.equal(parseDate("2100-02-29").state, "invalid");
    assert.equal(parseDate("2023-02-29").state, "invalid");
    assert.deepEqual([isLeapYear(1900), isLeapYear(2000), isLeapYear(2024), isLeapYear(2100)], [false, true, true, false]);
    assert.deepEqual([daysInMonth(2024, 2), daysInMonth(2023, 2), daysInMonth(2026, 4), daysInMonth(2026, 12)], [29, 28, 30, 31]);
  });
});

describe("invariants over a grid (independent of the reference JSON)", () => {
  // Date.UTC is independent of the local time zone, so it is a fair second opinion on the total days
  test("total days equal the UTC day count, and the breakdown obeys addMonths(A, n) <= B < addMonths(A, n + 1)", () => {
    let checked = 0;
    for (const year of [1900, 2000, 2023, 2024, 2025, 2026, 2100]) {
      for (let month = 1; month <= 12; month++) {
        for (const day of [1, 15, 28, 29, 30, 31]) {
          if (day > daysInMonth(year, month)) continue;
          const a = { year, month, day };
          const aText = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          for (const offset of [0, 1, 2, 27, 28, 29, 30, 31, 32, 59, 60, 89, 90, 365, 366, 400, 1461, 3650]) {
            const utc = new Date(Date.UTC(year, month - 1, day + offset));
            const bText = `${String(utc.getUTCFullYear()).padStart(4, "0")}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
            const r = calculateDateDifference(aText, bText);
            assert.equal(r.totalDays, offset, `${aText} -> ${bText}`);
            const n = r.years * 12 + r.months;
            const stepped = addMonths(a, n);
            const next = addMonths(a, n + 1);
            const b = { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
            assert.ok(dayNumber(stepped) <= dayNumber(b), `${aText} -> ${bText}: stepped`);
            assert.ok(dayNumber(b) < dayNumber(next), `${aText} -> ${bText}: next`);
            assert.equal(dayNumber(b) - dayNumber(stepped), r.days);
            // reversing the pair gives the same distance and the same breakdown
            const back = calculateDateDifference(bText, aText);
            assert.deepEqual([back.totalDays, back.years, back.months, back.days], [r.totalDays, r.years, r.months, r.days]);
            assert.equal(back.reversed, offset > 0);
            checked++;
          }
        }
      }
    }
    assert.ok(checked > 8000);
  });

  test("the result does not depend on the machine time zone", () => {
    const before = calculateDateDifference("2026-03-08", "2026-03-09"); // a daylight-saving change in some zones
    const spring = calculateDateDifference("2026-03-28", "2026-03-30");
    assert.equal(before.totalDays, 1);
    assert.equal(spring.totalDays, 2);
    assert.equal(calculateDateDifference("2026-10-24", "2026-10-26").totalDays, 2);
  });
});

describe("the words", () => {
  test("a zero unit is left out; nothing left is 0 days; plurals", () => {
    assert.equal(unitsText(0, 1, 9), "1 month, 9 days");
    assert.equal(unitsText(2, 0, 1), "2 years, 1 day");
    assert.equal(unitsText(1, 1, 0), "1 year, 1 month");
    assert.equal(unitsText(0, 0, 0), "0 days");
    assert.equal(unitsText(26, 9, 4), "26 years, 9 months, 4 days");
    assert.equal(daysText(1), "1 day");
    assert.equal(daysText(0), "0 days");
    assert.equal(daysText(3652058), "36,52,058 days");
    assert.equal(dateText({ year: 2026, month: 1, day: 1 }), "1 January 2026");
  });
});
