/*
 * Date Difference quick-fill presets: the calendar-day addition behind them.
 * Expected dates are worked by hand (not produced by the code under test).
 * A difference counts the days between two dates; counting both end days adds 1.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { addDays, calculateDateDifference } from "../../assets/js/tools/date-difference/date-engine.js";

const iso = ({ year, month, day }) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const parts = (text) => { const [year, month, day] = text.split("-").map(Number); return { year, month, day }; };

test("addDays: hand-computed calendar dates", () => {
  const rows = [
    ["2026-10-31", 6, "2026-11-06"],
    ["2026-10-31", 7, "2026-11-07"],
    ["2026-10-31", 30, "2026-11-30"],
    ["2026-01-31", 30, "2026-03-02"],
    ["2028-02-28", 1, "2028-02-29"],
    ["2027-02-28", 1, "2027-03-01"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2026-03-01", -1, "2026-02-28"],
    ["2026-03-29", 1, "2026-03-30"],
  ];
  for (const [start, n, expected] of rows) assert.equal(iso(addDays(parts(start), n)), expected, `${start} + ${n}`);
});

test("a preset's gap is n days apart (n + 1 counting both end days)", () => {
  for (const n of [6, 7, 30]) {
    const start = "2026-10-31";
    const end = iso(addDays(parts(start), n));
    assert.equal(calculateDateDifference(start, end).totalDays, n);
  }
});
