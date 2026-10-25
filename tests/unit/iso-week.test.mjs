/**
 * Tool Pack 34: the ISO week of the Date Calculator against the independent reference.
 *
 * tests/fixtures/iso-week-golden.json is the output of tests/fixtures/iso-week-golden.py (Python date.isocalendar()). Run with:
 *   node --test tests/unit/iso-week.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isoWeekOf } from "../../assets/js/tools/date-calculator/date-arithmetic.js";
import { parseDate } from "../../assets/js/tools/date-difference/date-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "iso-week-golden.json"), "utf8")).rows;

const of = (text) => isoWeekOf(parseDate(text).date);

describe("against the independent reference", () => {
  test("every row: week-year, week, weekday, day of the year and the weeks in the year", () => {
    assert.ok(GOLDEN.length > 3500);
    for (const [iso, weekYear, week, weekday, dayOfYear, weeks] of GOLDEN) {
      const got = of(iso);
      assert.deepEqual(
        [got.weekYear, got.week, got.weekday, got.dayOfYear, got.weeksInWeekYear],
        [weekYear, week, weekday, dayOfYear, weeks],
        iso
      );
    }
  });
});

describe("the boundaries, by name", () => {
  test("1 January can be in the last week of the year before", () => {
    assert.deepEqual([of("2021-01-01").weekYear, of("2021-01-01").week], [2020, 53]);
    assert.deepEqual([of("2022-01-01").weekYear, of("2022-01-01").week], [2021, 52]);
    assert.deepEqual([of("2023-01-01").weekYear, of("2023-01-01").week], [2022, 52]);
  });

  test("31 December can be in week 1 of the next year", () => {
    assert.deepEqual([of("2024-12-30").weekYear, of("2024-12-30").week], [2025, 1]);
    assert.deepEqual([of("2025-12-29").weekYear, of("2025-12-29").week], [2026, 1]);
    assert.deepEqual([of("2026-12-31").weekYear, of("2026-12-31").week], [2026, 53]);
  });

  test("years with 53 weeks", () => {
    assert.equal(of("2020-06-01").weeksInWeekYear, 53);
    assert.equal(of("2026-06-01").weeksInWeekYear, 53);
    assert.equal(of("2025-06-01").weeksInWeekYear, 52);
  });

  test("weekday is 1 for Monday to 7 for Sunday", () => {
    assert.equal(of("2026-11-02").weekday, 1);
    assert.equal(of("2026-11-08").weekday, 7);
  });

  test("the first and last days of the supported calendar", () => {
    assert.deepEqual([of("0001-01-01").weekYear, of("0001-01-01").week, of("0001-01-01").weekday], [1, 1, 1]);
    assert.deepEqual([of("9999-12-31").weekYear, of("9999-12-31").week], [9999, 52]);
  });

  test("leap day", () => {
    assert.deepEqual([of("2024-02-29").week, of("2024-02-29").dayOfYear], [9, 60]);
  });
});
