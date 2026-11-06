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

test("Previous 7 days and Previous 30 days: end today, start 6 or 29 days earlier, so 7 or 30 calendar days counting both ends", () => {
  /* hand-computed: today -> start across a month, a leap February and a year boundary */
  const rows = [
    ["2026-11-02", -6, "2026-10-27", 7],
    ["2026-03-05", -6, "2026-02-27", 7],
    ["2024-03-03", -6, "2024-02-26", 7],
    ["2026-01-03", -6, "2025-12-28", 7],
    ["2026-11-02", -29, "2026-10-04", 30],
    ["2024-03-10", -29, "2024-02-10", 30],
    ["2026-01-15", -29, "2025-12-17", 30],
  ];
  for (const [today, back, start, inclusive] of rows) {
    assert.equal(iso(addDays(parts(today), back)), start, `${today} ${back}`);
    assert.equal(calculateDateDifference(start, today).totalDays + 1, inclusive, `${start} to ${today}`);
  }
});

/* ---- previous / next period presets (presetRange). Every expected date is worked by hand from the calendar. ---- */
import { presetRange, SINGLE_DATE_PRESETS } from "../../assets/js/tools/date-difference/date-engine.js";

const range = (id, today) => { const r = presetRange(id, parts(today)); return r && [iso(r.start), iso(r.end)]; };

test("presetRange, today Thursday 2026-03-05 (Monday of that week is 2 March)", () => {
  const today = "2026-03-05";
  const rows = [
    ["previous-days-5", ["2026-03-01", "2026-03-05"]],
    ["previous-days-7", ["2026-02-27", "2026-03-05"]],
    ["previous-days-14", ["2026-02-20", "2026-03-05"]],
    ["previous-days-30", ["2026-02-04", "2026-03-05"]],
    ["next-days-5", ["2026-03-06", "2026-03-10"]],
    ["next-days-7", ["2026-03-06", "2026-03-12"]],
    ["next-days-14", ["2026-03-06", "2026-03-19"]],
    ["next-days-30", ["2026-03-06", "2026-04-04"]],
    ["previous-week", ["2026-02-23", "2026-03-01"]],
    ["next-week", ["2026-03-09", "2026-03-15"]],
    ["previous-month", ["2026-02-01", "2026-02-28"]],
    ["next-month", ["2026-04-01", "2026-04-30"]],
    ["previous-months-3", ["2025-12-01", "2026-02-28"]],
    ["previous-months-6", ["2025-09-01", "2026-02-28"]],
    ["next-months-3", ["2026-04-01", "2026-06-30"]],
    ["next-months-6", ["2026-04-01", "2026-09-30"]],
    ["previous-year", ["2025-01-01", "2025-12-31"]],
    ["next-year", ["2027-01-01", "2027-12-31"]],
  ];
  for (const [id, expected] of rows) assert.deepEqual(range(id, today), expected, id);
});

test("presetRange: month, year and leap-year boundaries", () => {
  assert.deepEqual(range("previous-month", "2028-03-10"), ["2028-02-01", "2028-02-29"], "leap February");
  assert.deepEqual(range("next-month", "2028-01-31"), ["2028-02-01", "2028-02-29"], "next month is a leap February; today's day 31 does not matter");
  assert.deepEqual(range("previous-month", "2026-01-15"), ["2025-12-01", "2025-12-31"], "across the new year");
  assert.deepEqual(range("previous-months-3", "2026-01-15"), ["2025-10-01", "2025-12-31"]);
  assert.deepEqual(range("next-month", "2026-12-20"), ["2027-01-01", "2027-01-31"]);
  assert.deepEqual(range("next-months-6", "2026-12-20"), ["2027-01-01", "2027-06-30"]);
  assert.deepEqual(range("next-months-3", "2026-10-31"), ["2026-11-01", "2027-01-31"], "31 October: the month length of the end month decides, not today's day");
  assert.deepEqual(range("previous-week", "2026-12-31"), ["2026-12-21", "2026-12-27"], "Thursday 31 December; Monday that week is 28 December");
  assert.deepEqual(range("next-week", "2026-12-31"), ["2027-01-04", "2027-01-10"]);
  assert.deepEqual(range("previous-days-7", "2026-01-03"), ["2025-12-28", "2026-01-03"]);
  assert.deepEqual(range("next-days-5", "2028-02-27"), ["2028-02-28", "2028-03-03"], "over a leap day");
});

test("presetRange: a Monday and a Sunday belong to the week they are in", () => {
  assert.deepEqual(range("previous-week", "2026-03-02"), ["2026-02-23", "2026-03-01"], "Monday 2 March");
  assert.deepEqual(range("next-week", "2026-03-02"), ["2026-03-09", "2026-03-15"]);
  assert.deepEqual(range("previous-week", "2026-03-08"), ["2026-02-23", "2026-03-01"], "Sunday 8 March: the current week is 2 to 8 March");
  assert.deepEqual(range("next-week", "2026-03-08"), ["2026-03-09", "2026-03-15"]);
});

test("presetRange: every range is ordered, and an unknown id is null", () => {
  for (const today of ["2026-03-05", "2028-02-29", "2026-12-31", "2026-01-01"]) {
    for (const id of ["previous-days-5", "next-days-30", "previous-week", "next-week", "previous-month", "next-month", "previous-months-6", "next-months-6", "previous-year", "next-year"]) {
      const [s, e] = range(id, today);
      assert.ok(s <= e, `${id} ${today}`);
    }
  }
  assert.equal(presetRange("nonsense", parts("2026-03-05")), null);
});

test("single-date presets are today, yesterday and tomorrow", () => {
  assert.deepEqual(SINGLE_DATE_PRESETS, { today: 0, yesterday: -1, tomorrow: 1 });
  assert.equal(iso(addDays(parts("2026-03-01"), SINGLE_DATE_PRESETS.yesterday)), "2026-02-28");
  assert.equal(iso(addDays(parts("2028-03-01"), SINGLE_DATE_PRESETS.yesterday)), "2028-02-29");
  assert.equal(iso(addDays(parts("2026-12-31"), SINGLE_DATE_PRESETS.tomorrow)), "2027-01-01");
});
