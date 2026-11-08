/*
 * Date Difference: counting both the start and the end date.
 * Expected values are worked by hand, not produced by the code under test.
 * Elapsed days = the days between the dates; inclusive = every calendar date from start to end.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { calculateDateDifference, presetRange, parseDate } from "../../assets/js/tools/date-difference/date-engine.js";

const both = (a, b) => calculateDateDifference(a, b, { inclusive: true });
const gap = (a, b) => calculateDateDifference(a, b);

test("default is unchanged: 1 June to 6 June is 5 days between, 6 counting both", () => {
  const r = gap("2026-06-01", "2026-06-06");
  assert.equal(r.totalDays, 5);
  assert.equal(r.elapsedDays, 5);
  assert.equal(r.inclusiveDays, 6);
  assert.equal(r.inclusive, false);
});

test("inclusive adds one day to the total and keeps weeks and calendar units consistent", () => {
  const r = both("2026-06-01", "2026-06-06");
  assert.deepEqual([r.totalDays, r.years, r.months, r.days, r.weeks, r.weekDays], [6, 0, 0, 6, 0, 6]);
  assert.equal(r.elapsedDays, 5);
  const w = both("2026-06-01", "2026-06-07");
  assert.deepEqual([w.totalDays, w.weeks, w.weekDays], [7, 1, 0]);
});

test("same date: 0 between, 1 counting both", () => {
  const a = gap("2026-06-06", "2026-06-06");
  assert.deepEqual([a.same, a.totalDays, a.inclusiveDays], [true, 0, 1]);
  const b = both("2026-06-06", "2026-06-06");
  assert.deepEqual([b.same, b.totalDays, b.days, b.months], [true, 1, 1, 0]);
});

test("consecutive dates: 1 between, 2 counting both", () => {
  assert.equal(gap("2026-06-05", "2026-06-06").totalDays, 1);
  assert.equal(both("2026-06-05", "2026-06-06").totalDays, 2);
});

test("a whole month counted both ways is exactly 1 month", () => {
  const r = both("2026-01-01", "2026-01-31");
  assert.deepEqual([r.totalDays, r.years, r.months, r.days], [31, 0, 1, 0]);
  const f = both("2026-02-01", "2026-02-28");
  assert.deepEqual([f.totalDays, f.months, f.days], [28, 1, 0]);
});

test("month boundary: 30 June to 1 July", () => {
  assert.equal(gap("2026-06-30", "2026-07-01").totalDays, 1);
  assert.equal(both("2026-06-30", "2026-07-01").totalDays, 2);
});

test("year boundary: 31 December to 1 January", () => {
  assert.equal(gap("2026-12-31", "2027-01-01").totalDays, 1);
  const r = both("2026-12-31", "2027-01-01");
  assert.equal(r.totalDays, 2);
  const y = both("2026-01-01", "2026-12-31");
  assert.deepEqual([y.totalDays, y.years, y.months, y.days], [365, 1, 0, 0]);
});

test("leap years: 29 February exists in 2028 and is counted, 2027 has none", () => {
  assert.equal(gap("2028-02-28", "2028-03-01").totalDays, 2);
  assert.equal(both("2028-02-28", "2028-03-01").totalDays, 3);
  assert.equal(gap("2027-02-28", "2027-03-01").totalDays, 1);
  assert.equal(both("2027-02-28", "2027-03-01").totalDays, 2);
  const y = both("2028-01-01", "2028-12-31");
  assert.deepEqual([y.totalDays, y.years], [366, 1]);
});

test("a reversed pair counts the same", () => {
  const r = both("2026-06-06", "2026-06-01");
  assert.deepEqual([r.reversed, r.totalDays, r.elapsedDays], [true, 6, 5]);
});

test("the last supported day can be counted both ways", () => {
  const r = both("9999-12-30", "9999-12-31");
  assert.equal(r.status, "ok");
  assert.equal(r.totalDays, 2);
});

test("Previous 6 days (ends today, includes today) is 5 days between, 6 counting both", () => {
  const today = parseDate("2026-06-06").date;
  const { start, end } = presetRange("previous-days-6", today);
  assert.deepEqual([start.month, start.day, end.month, end.day], [6, 1, 6, 6]);
  const iso = (d) => `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
  assert.equal(gap(iso(start), iso(end)).totalDays, 5);
  assert.equal(both(iso(start), iso(end)).totalDays, 6);
});
