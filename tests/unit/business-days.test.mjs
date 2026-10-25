/**
 * Tool Pack 34: the Business Days engine against the independent reference.
 *
 * tests/fixtures/business-days-golden.json is the output of tests/fixtures/business-days-golden.py, which steps Python datetime.date
 * objects one day at a time. The engine steps integer day numbers; nothing is shared. Run with:
 *   node --test tests/unit/business-days.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS,
  DEFAULT_WEEKEND,
  weekendFrom,
  parseHolidays,
  parseCount,
  addBusinessDays,
  countBusinessDays,
  isoText,
  weekdayText,
  weekendWords,
  resultText,
} from "../../assets/js/tools/business-days/business-days-engine.js";
import { parseDate, dayNumber } from "../../assets/js/tools/date-difference/date-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "business-days-golden.json"), "utf8")).cases;

const num = (text) => dayNumber(parseDate(text).date);
const mask = (indexes) => {
  const weekend = Array(7).fill(false);
  for (const i of indexes) weekend[i] = true;
  return weekend;
};
const holidaySet = (list) => new Set(list.map(num));

describe("against the independent reference", () => {
  test("every generated case matches (add, subtract and count)", () => {
    assert.ok(GOLDEN.length >= 700);
    let checked = 0;
    for (const c of GOLDEN) {
      const weekend = mask(c.weekend);
      const holidays = holidaySet(c.holidays);
      const label = JSON.stringify(c);
      if (c.kind === "add") {
        const r = addBusinessDays({ start: num(c.start), count: c.n, direction: c.dir, weekend, holidays });
        if (c.expect.status === "out-of-range") {
          assert.equal(r.status, "out-of-range", label);
        } else {
          assert.equal(r.status, "ok", label);
          assert.equal(isoText(r.result), c.expect.result, label);
          assert.equal(r.calendarDays, c.expect.calendarDays, label);
          assert.equal(r.weekendDays, c.expect.weekendDays, label);
          assert.equal(r.holidayDays, c.expect.holidayDays, label);
        }
      } else {
        const r = countBusinessDays({ start: num(c.start), end: num(c.end), includeStart: c.include, weekend, holidays });
        assert.equal(r.businessDays, c.expect.businessDays, label);
        assert.equal(r.calendarDays, c.expect.calendarDays, label);
        assert.equal(r.weekendDays, c.expect.weekendDays, label);
        assert.equal(r.holidayDays, c.expect.holidayDays, label);
        assert.equal(r.reversed, c.expect.reversed, label);
      }
      checked += 1;
    }
    assert.equal(checked, GOLDEN.length);
  });
});

describe("the stated convention, on fixed dates", () => {
  const saSu = DEFAULT_WEEKEND;
  const none = new Set();
  const add = (start, count, direction = 1, holidays = none, weekend = saSu) =>
    addBusinessDays({ start: num(start), count, direction, weekend, holidays });

  test("Friday plus 1 is Monday; Saturday plus 1 is Monday; Monday minus 1 is Friday", () => {
    assert.equal(isoText(add("2026-11-13", 1).result), "2026-11-16");
    assert.equal(isoText(add("2026-11-14", 1).result), "2026-11-16");
    assert.equal(isoText(add("2026-11-16", 1, -1).result), "2026-11-13");
    assert.equal(weekdayText(add("2026-11-13", 1).result), "Monday");
  });

  test("0 business days is the start date, whatever kind of day it is", () => {
    const r = add("2026-11-14", 0);
    assert.equal(isoText(r.result), "2026-11-14");
    assert.equal(r.startKind, "weekend");
    assert.equal(r.calendarDays, 0);
  });

  test("a holiday is skipped, and counted as a holiday, not a weekend day", () => {
    const r = add("2026-11-13", 1, 1, holidaySet(["2026-11-16"]));
    assert.equal(isoText(r.result), "2026-11-17");
    assert.equal(r.holidayDays, 1);
    assert.equal(r.weekendDays, 2);
  });

  test("a holiday on a weekend day changes nothing", () => {
    const r = add("2026-11-13", 1, 1, holidaySet(["2026-11-14"]));
    assert.equal(isoText(r.result), "2026-11-16");
    assert.equal(r.holidayDays, 0);
  });

  test("a Friday-Saturday weekend moves the answer", () => {
    const r = add("2026-11-12", 1, 1, none, mask([4, 5]));
    assert.equal(isoText(r.result), "2026-11-15");
    assert.equal(weekdayText(r.result), "Sunday");
  });

  test("leap day and year end", () => {
    assert.equal(isoText(add("2024-02-28", 2).result), "2024-03-01");
    assert.equal(isoText(add("2026-12-31", 1).result), "2027-01-01");
  });

  test("the edges of the calendar", () => {
    assert.equal(add("9999-12-31", 1).status, "out-of-range");
    assert.equal(add("0001-01-01", 1, -1).status, "out-of-range");
    assert.equal(isoText(add("9999-12-30", 1).result), "9999-12-31");
  });

  test("counting: Monday to Tuesday is 1; the same day is 0; the earlier date is not counted", () => {
    const count = (a, b, includeStart = false, holidays = none) =>
      countBusinessDays({ start: num(a), end: num(b), includeStart, weekend: saSu, holidays });
    assert.equal(count("2026-11-16", "2026-11-17").businessDays, 1);
    assert.equal(count("2026-11-16", "2026-11-16").businessDays, 0);
    assert.equal(count("2026-11-16", "2026-11-16", true).businessDays, 1);
    assert.equal(count("2026-11-16", "2026-11-16").same, true);
    assert.equal(count("2026-11-13", "2026-11-16").businessDays, 1);
    assert.equal(count("2026-11-14", "2026-11-15", true).businessDays, 0);
  });

  test("counting with the dates the wrong way round swaps them and says so", () => {
    const r = countBusinessDays({ start: num("2026-11-20"), end: num("2026-11-16"), includeStart: false, weekend: saSu, holidays: none });
    assert.equal(r.reversed, true);
    assert.equal(r.businessDays, 4);
    assert.equal(isoText(r.first), "2026-11-16");
  });

  test("a year of business days", () => {
    const r = countBusinessDays({ start: num("2025-12-31"), end: num("2026-12-31"), includeStart: false, weekend: saSu, holidays: none });
    assert.equal(r.businessDays, 261);
  });
});

describe("reading the inputs", () => {
  test("holidays: lines, commas, duplicates and bad lines", () => {
    const ok = parseHolidays("2026-12-25\n2026-01-01, 2026-01-26\n\n2026-12-25");
    assert.equal(ok.ok, true);
    assert.equal(ok.days.size, 3);
    assert.equal(ok.duplicates, 1);
    const bad = parseHolidays("2026-12-25\n25/12/2026\n2026-02-30");
    assert.equal(bad.ok, false);
    assert.deepEqual(bad.errors.map((e) => e.line), [2, 3]);
    assert.equal(parseHolidays("").ok, true);
    assert.equal(parseHolidays("   \n").days.size, 0);
  });

  test("too many holidays is an error, not a silent cut-off", () => {
    const lines = Array.from({ length: LIMITS.maxHolidays + 1 }, (_, i) => `2026-01-${String((i % 28) + 1).padStart(2, "0")}`).join("\n");
    assert.equal(parseHolidays(lines).ok, false);
  });

  test("the count", () => {
    assert.equal(parseCount("").state, "blank");
    assert.deepEqual(parseCount(" 15 "), { state: "valid", value: 15 });
    for (const bad of ["-1", "1.5", "abc", "100000", "1e3"]) assert.equal(parseCount(bad).state, "invalid", bad);
  });

  test("a weekend that leaves no business day is refused", () => {
    assert.equal(weekendFrom([0, 1, 2, 3, 4, 5, 6]), null);
    assert.deepEqual(weekendFrom([5, 6]), DEFAULT_WEEKEND.slice());
    assert.deepEqual(weekendFrom([]), Array(7).fill(false));
  });

  test("words and the copied text", () => {
    assert.equal(weekendWords(DEFAULT_WEEKEND), "Saturday and Sunday");
    assert.equal(weekendWords(mask([6])), "Sunday");
    assert.equal(weekendWords(Array(7).fill(false)), "no weekend days");
    const r = addBusinessDays({ start: num("2026-11-13"), count: 1, direction: 1, weekend: DEFAULT_WEEKEND, holidays: new Set() });
    const text = resultText(r, { mode: "add" });
    assert.match(text, /1 business day after 13 November 2026 is Monday, 16 November 2026/);
    assert.match(text, /The start date is not counted/);
  });

  test("the engine imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "business-days", "business-days-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "new Date(", "Date.now"]) assert.equal(source.includes(banned), false, banned);
  });
});
