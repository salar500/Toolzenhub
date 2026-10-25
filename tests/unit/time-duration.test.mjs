/**
 * Tool Pack 34: the Time Duration engine against the independent reference.
 *
 * tests/fixtures/time-duration-golden.json is the output of tests/fixtures/time-duration-golden.py (timedelta for the sums and
 * fractions.Fraction for the decimal text). Run with:
 *   node --test tests/unit/time-duration.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS,
  parseDuration,
  sumRows,
  breakdown,
  wordsText,
  clockText,
  decimalOf,
  resultSet,
  copyText,
} from "../../assets/js/tools/time-duration/duration-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "time-duration-golden.json"), "utf8")).cases;

describe("against the independent reference", () => {
  test("every generated case: each row reads as expected and the sum and every representation match", () => {
    assert.ok(GOLDEN.length >= 300);
    for (const c of GOLDEN) {
      const label = JSON.stringify(c.rows);
      for (const row of c.rows) {
        const read = parseDuration(row.text);
        assert.equal(read.state, "valid", `${row.text} in ${label}`);
        assert.equal(read.seconds, row.seconds, `${row.text} in ${label}`);
      }
      const sum = sumRows(c.rows);
      assert.equal(sum.status, "ok", label);
      assert.equal(sum.seconds, c.total, label);
      const r = resultSet(sum.seconds);
      const e = c.expect;
      assert.deepEqual(breakdown(sum.seconds), { days: e.days, hours: e.hours, minutes: e.minutes, seconds: e.seconds }, label);
      assert.equal(r.clock, e.clock, label);
      assert.equal(r.decimalHours, e.decimalHours, label);
      assert.equal(r.decimalHoursLong, e.decimalHoursLong, label);
      assert.equal(r.decimalHoursExact, e.decimalHoursExact, label);
      assert.equal(r.totalMinutes, e.totalMinutes, label);
      assert.equal(r.totalMinutesExact, e.totalMinutesExact, label);
      assert.equal(r.totalSeconds, e.totalSeconds, label);
      assert.equal(r.negative, e.negative, label);
    }
  });
});

describe("reading one length", () => {
  const seconds = (text) => {
    const r = parseDuration(text);
    assert.equal(r.state, "valid", text);
    return r.seconds;
  };

  test("the accepted styles", () => {
    assert.equal(seconds("1:45"), 6300);
    assert.equal(seconds("1:45:30"), 6330);
    assert.equal(seconds("0:00:01"), 1);
    assert.equal(seconds("125:30"), 451800);
    assert.equal(seconds("1h 45m"), 6300);
    assert.equal(seconds("1h45m30s"), 6330);
    assert.equal(seconds("1 hour 5 minutes 7 seconds"), 3907);
    assert.equal(seconds("90m"), 5400);
    assert.equal(seconds("45s"), 45);
    assert.equal(seconds("2 HRS"), 7200);
    assert.equal(seconds("  3 min "), 180);
  });

  test("decimals only when they are a whole number of seconds", () => {
    assert.equal(seconds("1.75h"), 6300);
    assert.equal(seconds("0.5m"), 30);
    assert.equal(seconds("0.1h"), 360);
    assert.equal(seconds("0.1m"), 6);
    assert.equal(seconds("1.5h 30m"), 5400 + 1800);
    for (const bad of ["1.3333h", "0.7s", "0.01m"]) {
      const r = parseDuration(bad);
      assert.equal(r.state, "invalid", bad);
      assert.match(r.message, /whole number of seconds/);
    }
  });

  test("blank, unreadable, out of order and too long", () => {
    assert.equal(parseDuration("").state, "blank");
    assert.equal(parseDuration("   ").state, "blank");
    for (const bad of ["abc", "1:75", "1:2:3:4", "5x", "1h 1h", "30m 1h", "-5m", "1:45 30s", "h", "1,5h"]) {
      assert.equal(parseDuration(bad).state, "invalid", bad);
    }
    assert.match(parseDuration("1:75").message, /0 to 59/);
    assert.match(parseDuration("30m 1h").message, /order/);
    assert.match(parseDuration("100000h").message, /too long/);
    assert.equal(parseDuration(`${LIMITS.maxRowSeconds}s`).state, "valid");
    assert.equal(parseDuration(`${LIMITS.maxRowSeconds + 1}s`).state, "invalid");
  });
});

describe("adding and subtracting", () => {
  test("carry across seconds, minutes, hours and days", () => {
    const sum = (...texts) => sumRows(texts.map((text) => ({ sign: "+", text }))).seconds;
    assert.equal(wordsText(sum("0:59:59", "0:00:01")), "1 hour");
    assert.equal(wordsText(sum("23:59:59", "0:00:01")), "1 day");
    assert.equal(wordsText(sum("1:30", "1:45")), "3 hours 15 minutes");
    assert.equal(clockText(sum("1:30", "1:45")), "3:15:00");
    assert.equal(clockText(sum("48h", "0:00:01")), "48:00:01");
  });

  test("borrow and negative results", () => {
    const r = sumRows([{ sign: "+", text: "1:00" }, { sign: "-", text: "1:30" }]);
    assert.equal(r.seconds, -1800);
    assert.equal(r.negative, true);
    const shown = resultSet(r.seconds);
    assert.equal(shown.sign, "−");
    assert.equal(shown.words, "30 minutes");
    assert.equal(shown.decimalHours, "0.50");
    assert.equal(sumRows([{ sign: "-", text: "0:00:01" }]).seconds, -1);
  });

  test("zero, blank rows and errors", () => {
    assert.equal(sumRows([{ sign: "+", text: "" }, { sign: "-", text: " " }]).status, "empty");
    const zero = sumRows([{ sign: "+", text: "1:00" }, { sign: "-", text: "1:00" }]);
    assert.equal(zero.seconds, 0);
    assert.equal(zero.negative, false);
    assert.equal(wordsText(0), "0 seconds");
    const bad = sumRows([{ sign: "+", text: "1:00" }, { sign: "+", text: "oops" }, { sign: "-", text: "9x" }]);
    assert.equal(bad.status, "invalid");
    assert.deepEqual(bad.errors.map((e) => e.index), [1, 2]);
  });

  test("a long accumulation stays exact", () => {
    const rows = Array.from({ length: LIMITS.rows }, () => ({ sign: "+", text: "99999h 59m 59s" }));
    const r = sumRows(rows);
    assert.equal(r.seconds, LIMITS.rows * LIMITS.maxRowSeconds);
    assert.ok(Number.isSafeInteger(r.seconds));
    assert.equal(resultSet(r.seconds).totalSeconds, String(r.seconds));
  });

  test("no floating-point drift: three 20-minute lengths are exactly one hour", () => {
    const r = sumRows([{ sign: "+", text: "20m" }, { sign: "+", text: "20m" }, { sign: "+", text: "20m" }]);
    assert.equal(r.seconds, 3600);
    assert.equal(resultSet(r.seconds).decimalHours, "1.00");
    assert.equal(resultSet(r.seconds).decimalHoursExact, true);
  });
});

describe("decimal hours and the copied text", () => {
  test("rounding half up, and saying when it is rounded", () => {
    assert.deepEqual(decimalOf(1200, 3600, 2), { text: "0.33", exact: false });
    assert.deepEqual(decimalOf(6300, 3600, 2), { text: "1.75", exact: true });
    assert.deepEqual(decimalOf(5, 3600, 4), { text: "0.0014", exact: false });
    assert.deepEqual(decimalOf(-1800, 3600, 2), { text: "0.50", exact: true });
    assert.equal(decimalOf(59, 60, 0).text, "1");
    assert.equal(decimalOf(10, 60, 0).text, "0");
    assert.equal(decimalOf(30, 60, 0).text, "1");
  });

  test("copy text carries the sign and the words", () => {
    assert.equal(
      copyText(-1800),
      ["Total: -30 minutes (-0:30:00)", "Decimal hours: -0.50", "Total minutes: -30.00", "Total seconds: -1800"].join("\n")
    );
    assert.match(copyText(1200), /Decimal hours: 0\.33 \(rounded\)/);
  });

  test("the engine imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "time-duration", "duration-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "new Date(", "Date.now"]) assert.equal(source.includes(banned), false, banned);
  });
});
