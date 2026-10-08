/**
 * Tool Pack 23: the Hours & Timesheet Calculator engine (assets/js/tools/hours-calculator/hours-engine.js).
 *
 * The reference values come from tests/fixtures/hours-golden.json, written by tests/fixtures/hours-golden.py from the
 * specification with the Python standard library (datetime for the length of a shift, Decimal with ROUND_HALF_UP for
 * decimal hours), not from the engine. Alongside the named vectors there are three exhaustive sweeps whose SHA-256
 * digests the reference wrote: every start and end pair (2,073,600), every total from 0 to 44,609 minutes as the page
 * shows it, and a grid of starts, ends and breaks around the break rule.
 *
 * What is pinned: integer-minute arithmetic, the overnight rule, equal times invalid, the 1,439-minute maximum, the
 * break rules, the four row states (empty, incomplete, invalid, valid), totals from valid rows only, the included and
 * excluded counts, the two-decimal display, exact message text, and that the engine source has no floating-point or
 * date machinery.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MAX_ROWS,
  MAX_SHIFT_MINUTES,
  MESSAGES,
  parseTime,
  parseBreak,
  shiftMinutes,
  classifyRow,
  summarize,
  formatHM,
  spokenDuration,
  decimalHours,
  describeRows,
  announcement,
  EXAMPLE_ROWS,
} from "../../assets/js/tools/hours-calculator/hours-engine.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "hours-golden.json"), "utf8"));
const ENGINE_SOURCE = fs.readFileSync(path.join(HERE, "..", "..", "assets", "js", "tools", "hours-calculator", "hours-engine.js"), "utf8");

const pad2 = (n) => String(n).padStart(2, "0");
const hhmm = (m) => (m === null ? "" : `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
const T = (h, m) => h * 60 + m;
const row = (start, end, brk) => ({ start, end, breakText: brk === undefined ? "" : String(brk) });
const rowsOf = (vector) => vector.rows.map(([s, e, b]) => ({ start: s ?? "", end: e ?? "", breakText: b === null ? "" : String(b) }));

const sha = () => crypto.createHash("sha256");

describe("the independent reference", () => {
  test("every named vector: row states, per-row net minutes, counts and the totals in both forms", () => {
    for (const v of GOLD.vectors) {
      const s = summarize(rowsOf(v));
      assert.deepEqual(s.rows.map((r) => r.state), v.states, v.name);
      assert.deepEqual(s.rows.map((r) => (r.state === "valid" ? r.net : null)), v.nets, v.name);
      assert.deepEqual(s.counts, v.counts, v.name);
      if (v.totals === null) {
        assert.equal(s.totals, null, v.name);
      } else {
        assert.equal(s.totals.net, v.totals.net, v.name);
        assert.equal(s.totals.gross, v.totals.gross, v.name);
        assert.equal(s.totals.breakMinutes, v.totals.break, v.name);
        assert.equal(formatHM(s.totals.net), v.totals.hm, v.name);
        assert.equal(decimalHours(s.totals.net), v.totals.decimal, v.name);
        assert.equal(formatHM(s.totals.gross), v.totals.grossHm, v.name);
        assert.equal(formatHM(s.totals.breakMinutes), v.totals.breakHm, v.name);
      }
    }
  });

  test("decimal hours for the listed minute counts match Decimal ROUND_HALF_UP", () => {
    for (const [m, text] of Object.entries(GOLD.decimals)) assert.equal(decimalHours(Number(m)), text, m);
  });

  test("exhaustive: all 1,440 x 1,440 start and end pairs give the reference's length and overnight flag", () => {
    const h = sha();
    for (let s = 0; s < 1440; s++) {
      for (let e = 0; e < 1440; e++) {
        const g = shiftMinutes(s, e);
        h.update(`${s},${e},${g === null ? -1 : g},${e < s ? 1 : 0}\n`);
      }
    }
    assert.equal(h.digest("hex"), GOLD.digests.pairs);
  });

  test("exhaustive: every total from 0 to 44,609 minutes is shown as the reference shows it, in both forms", () => {
    const h = sha();
    for (let m = 0; m <= GOLD.maxTotal; m++) h.update(`${m}:${formatHM(m)}:${decimalHours(m)}\n`);
    assert.equal(h.digest("hex"), GOLD.digests.totals);
  });

  test("a grid of starts, ends and breaks (0, 1, shift - 1, shift, shift + 1, 1,439) is classified as the reference classifies it", () => {
    const h = sha();
    for (let s = 0; s < 1440; s += 13) {
      for (let e = 0; e < 1440; e += 17) {
        const g = shiftMinutes(s, e);
        const breaks = new Set([0, 1, 1439]);
        if (g !== null) for (const b of [g - 1, g, g + 1]) breaks.add(b);
        for (const b of [...breaks].filter((x) => x >= 0 && x <= 1439).sort((a, c) => a - c)) {
          const r = classifyRow({ start: hhmm(s), end: hhmm(e), breakText: String(b) });
          h.update(`${s},${e},${b},${r.state},${r.state === "valid" ? r.net : -1}\n`);
        }
      }
    }
    assert.equal(h.digest("hex"), GOLD.digests.grid);
  });
});

describe("shifts, overnight and the limits", () => {
  test("a daytime shift, an overnight shift and the midnight boundaries", () => {
    assert.equal(shiftMinutes(T(9, 0), T(17, 0)), 480);
    assert.equal(shiftMinutes(T(22, 0), T(6, 0)), 480);
    assert.equal(shiftMinutes(T(23, 0), T(0, 0)), 60);
    assert.equal(shiftMinutes(T(23, 59), T(0, 0)), 1);
    assert.equal(shiftMinutes(T(0, 0), T(0, 1)), 1);
    assert.equal(shiftMinutes(T(12, 0), T(11, 59)), 1439);
    assert.equal(shiftMinutes(T(0, 0), T(23, 59)), 1439);
  });

  test("equal times have no length (invalid); every other pair is 1 to 1,439 minutes", () => {
    assert.equal(shiftMinutes(T(9, 0), T(9, 0)), null);
    assert.equal(shiftMinutes(0, 0), null);
    assert.equal(MAX_SHIFT_MINUTES, 1439);
    for (let s = 0; s < 1440; s += 7) for (let e = 0; e < 1440; e += 11) {
      const g = shiftMinutes(s, e);
      if (s === e) assert.equal(g, null);
      else assert.ok(g >= 1 && g <= 1439, `${s},${e},${g}`);
    }
  });

  test("overnight is flagged exactly when the end is earlier than the start", () => {
    assert.equal(classifyRow(row("22:00", "06:00")).overnight, true);
    assert.equal(classifyRow(row("09:00", "17:00")).overnight, false);
    assert.equal(classifyRow(row("23:59", "00:00")).overnight, true);
    assert.equal(classifyRow(row("00:00", "23:59")).overnight, false);
  });
});

describe("parsing", () => {
  test("times are strict 24-hour HH:MM", () => {
    assert.equal(parseTime("00:00"), 0);
    assert.equal(parseTime("09:05"), 545);
    assert.equal(parseTime("23:59"), 1439);
    for (const bad of ["9:00", "24:00", "12:60", "09:5", "", "09:00:00", " 09:00", "0900", "09.00", "ab:cd", "-1:00", "9:0", null, undefined]) {
      assert.equal(parseTime(bad), null, String(bad));
    }
  });

  test("a break is whole minutes: blank is 0, spaces around are fine, everything else is refused", () => {
    assert.equal(parseBreak(""), 0);
    assert.equal(parseBreak("   "), 0);
    assert.equal(parseBreak("0"), 0);
    assert.equal(parseBreak("05"), 5);
    assert.equal(parseBreak(" 30 "), 30);
    assert.equal(parseBreak("1439"), 1439);
    for (const bad of ["abc", "-5", "1.5", "1e2", "30m", "5 minutes", "12345", "9999", "1440", "+5", "1,5", "0x10", "3 0"]) {
      assert.equal(parseBreak(bad), null, bad);
    }
  });
});

describe("one row: empty, incomplete, invalid, valid", () => {
  test("an untouched row is empty, including a break box that only holds spaces", () => {
    assert.deepEqual(classifyRow(row("", "", "")), { state: "empty" });
    assert.deepEqual(classifyRow({ start: "", end: "", breakText: "   " }), { state: "empty" });
    assert.deepEqual(classifyRow({}), { state: "empty" });
  });

  test("a missing time makes the row incomplete, with the hint that names what is missing", () => {
    assert.deepEqual(classifyRow(row("09:00", "", "")), { state: "incomplete", message: MESSAGES.needEnd });
    assert.deepEqual(classifyRow(row("", "17:00", "")), { state: "incomplete", message: MESSAGES.needStart });
    assert.deepEqual(classifyRow(row("", "", 30)), { state: "incomplete", message: MESSAGES.needBoth });
    assert.deepEqual(classifyRow(row("09:00", "", 30)), { state: "incomplete", message: MESSAGES.needEnd });
    assert.equal(MESSAGES.needEnd, "Enter an end time.");
    assert.equal(MESSAGES.needStart, "Enter a start time.");
    assert.equal(MESSAGES.needBoth, "Enter start and end times for this shift.");
  });

  test("equal times and a break longer than the shift are invalid, each with its exact message and the field to mark", () => {
    const equal = classifyRow(row("09:00", "09:00", 0));
    assert.deepEqual(equal, { state: "invalid", field: "end", message: "Start and end are the same time. A shift must be at least 1 minute and less than 24 hours." });
    const long = classifyRow(row("09:00", "10:00", 61));
    assert.deepEqual(long, { state: "invalid", field: "break", message: "Break is 61 minutes but the shift is 60 minutes. The break cannot be longer than the shift." });
    assert.equal(classifyRow(row("09:00", "09:01", 2)).message, "Break is 2 minutes but the shift is 1 minute. The break cannot be longer than the shift.");
    assert.equal(classifyRow(row("09:00", "09:01", 1)).state, "valid"); // equal to the shift is allowed
    const zero = classifyRow(row("09:00", "10:00", 60));
    assert.equal(zero.state, "valid");
    assert.equal(zero.net, 0);
  });

  test("bad text is invalid whatever else is missing, and takes priority over incomplete", () => {
    assert.deepEqual(classifyRow(row("09:00", "", "abc")), { state: "invalid", field: "break", message: MESSAGES.breakText });
    assert.equal(classifyRow(row("", "", "-5")).state, "invalid");
    assert.equal(MESSAGES.breakText, "Break must be a whole number of minutes from 0 to 1,439.");
    assert.deepEqual(classifyRow(row("9:00", "", "")), { state: "invalid", field: "start", message: MESSAGES.timeText });
    assert.deepEqual(classifyRow(row("", "24:00", "")), { state: "invalid", field: "end", message: MESSAGES.timeText });
    assert.equal(MESSAGES.timeText, "Use 24-hour time such as 09:00 or 17:30.");
  });

  test("a half-filled time box (the browser's own signal) is invalid with its own message, even beside an empty value", () => {
    const a = classifyRow({ start: "", end: "", breakText: "", startPartial: true });
    assert.deepEqual(a, { state: "invalid", field: "start", message: MESSAGES.timePartial });
    const b = classifyRow({ start: "09:00", end: "", breakText: "", endPartial: true });
    assert.deepEqual(b, { state: "invalid", field: "end", message: MESSAGES.timePartial });
    assert.equal(MESSAGES.timePartial, "Enter a complete time, such as 09:00.");
  });

  test("a valid row carries the length, the break, the net and the overnight flag", () => {
    assert.deepEqual(classifyRow(row("22:00", "06:00", 45)), { state: "valid", start: "22:00", end: "06:00", gross: 480, breakMinutes: 45, net: 435, overnight: true });
    assert.deepEqual(classifyRow(row("08:15", "12:45", "")), { state: "valid", start: "08:15", end: "12:45", gross: 270, breakMinutes: 0, net: 270, overnight: false });
  });
});

describe("all rows: totals from valid rows only, and what was included and excluded", () => {
  test("the worked example: 8:00 + 7:15 + 4:00 is 19:15, which is 19.25 decimal hours", () => {
    const s = summarize(EXAMPLE_ROWS);
    assert.deepEqual(s.rows.map((r) => r.net), [480, 435, 240]);
    assert.deepEqual(s.totals, { gross: 1230, breakMinutes: 75, net: 1155 });
    assert.equal(formatHM(1230), "20:30");
    assert.equal(formatHM(75), "1:15");
    assert.equal(formatHM(1155), "19:15");
    assert.equal(decimalHours(1155), "19.25");
    assert.equal(s.included, 3);
    assert.equal(s.excluded, 0);
  });

  test("incomplete and invalid rows are excluded and counted separately; empty rows are ignored and not counted as excluded", () => {
    const s = summarize([row("09:00", "17:00", 30), row("09:00", "", ""), row("09:00", "09:00", 0), row("", "", ""), row("", "17:00", 15), row("10:00", "11:00", 90)]);
    assert.deepEqual(s.counts, { empty: 1, incomplete: 2, invalid: 2, valid: 1 });
    assert.equal(s.included, 1);
    assert.equal(s.excluded, 4);
    assert.equal(s.totals.net, 450); // only the one valid row
    const d = describeRows(s);
    assert.equal(d.includedText, "1 row included in the total");
    assert.equal(d.excludedText, "4 rows excluded: 2 incomplete, 2 invalid");
    assert.equal(announcement(s), "Total 7 hours 30 minutes, 7.50 decimal hours, from 1 shift. 4 rows not counted: 2 incomplete, 2 invalid.");
  });

  test("the wording when nothing is excluded, when only one kind is, and when nothing is counted", () => {
    const ok = summarize(EXAMPLE_ROWS);
    assert.deepEqual(describeRows(ok), { includedText: "3 rows included in the total", excludedText: "No rows excluded" });
    assert.equal(announcement(ok), "Total 19 hours 15 minutes, 19.25 decimal hours, from 3 shifts.");
    const inc = summarize([row("09:00", "17:00", 0), row("", "17:00", "")]);
    assert.equal(describeRows(inc).excludedText, "1 row excluded: 1 incomplete");
    const bad = summarize([row("09:00", "17:00", 0), row("09:00", "09:00", 0)]);
    assert.equal(describeRows(bad).excludedText, "1 row excluded: 1 invalid");
    const none = summarize([row("", "", ""), row("09:00", "", "")]);
    assert.equal(none.totals, null);
    assert.equal(none.included, 0);
    assert.equal(announcement(none), "No shifts counted yet. 1 row not counted: 1 incomplete.");
    assert.equal(announcement(summarize([row("", "", "")])), "No shifts counted yet.");
    assert.equal(describeRows(summarize([])).includedText, "0 rows included in the total");
  });

  test("the totals never count an excluded row, whatever it holds", () => {
    const withBad = summarize([row("09:00", "17:00", 0), row("09:00", "17:00", 999), row("09:00", "", 30)]);
    const alone = summarize([row("09:00", "17:00", 0)]);
    assert.deepEqual(withBad.totals, alone.totals);
  });

  test("rounded row figures need not add up to the total: three 20-minute shifts show 0.33 each and a total of 1.00", () => {
    const s = summarize([row("09:00", "09:20"), row("10:00", "10:20"), row("11:00", "11:20")]);
    assert.deepEqual(s.rows.map((r) => decimalHours(r.net)), ["0.33", "0.33", "0.33"]);
    assert.equal(decimalHours(s.totals.net), "1.00");
    assert.equal(formatHM(s.totals.net), "1:00");
  });

  test("31 rows of the longest shift: the largest possible total, 743:29 and 743.48; the row limit is 31", () => {
    assert.equal(MAX_ROWS, 31);
    const s = summarize(Array.from({ length: MAX_ROWS }, () => row("00:00", "23:59", 0)));
    assert.equal(s.totals.net, 31 * 1439);
    assert.equal(formatHM(s.totals.net), "743:29");
    assert.equal(decimalHours(s.totals.net), "743.48");
    assert.equal(spokenDuration(s.totals.net), "743 hours 29 minutes");
  });

  test("totals are exact sums in whole minutes for many mixed rows, and net always equals gross minus break", () => {
    const rows = [];
    for (let i = 0; i < 31; i++) rows.push(row(hhmm((i * 97) % 1440), hhmm((i * 211 + 5) % 1440), i % 7 === 0 ? "" : (i * 3) % 40));
    const s = summarize(rows);
    let g = 0, b = 0, n = 0;
    for (const r of s.rows) {
      if (r.state !== "valid") continue;
      assert.equal(r.net, r.gross - r.breakMinutes);
      assert.ok(Number.isInteger(r.net) && r.net >= 0);
      g += r.gross; b += r.breakMinutes; n += r.net;
    }
    assert.deepEqual(s.totals, { gross: g, breakMinutes: b, net: n });
    assert.ok(Number.isInteger(s.totals.net));
  });
});

describe("text for the page", () => {
  test("hours and minutes, and the spoken form", () => {
    for (const [m, hm, spoken] of [[0, "0:00", "0 hours 0 minutes"], [1, "0:01", "0 hours 1 minute"], [60, "1:00", "1 hour 0 minutes"], [61, "1:01", "1 hour 1 minute"], [450, "7:30", "7 hours 30 minutes"], [1155, "19:15", "19 hours 15 minutes"], [44609, "743:29", "743 hours 29 minutes"]]) {
      assert.equal(formatHM(m), hm);
      assert.equal(spokenDuration(m), spoken);
    }
  });

  test("decimal hours are a display of exact minutes, to two places", () => {
    for (const [m, d] of [[0, "0.00"], [1, "0.02"], [5, "0.08"], [20, "0.33"], [40, "0.67"], [59, "0.98"], [60, "1.00"], [440, "7.33"], [470, "7.83"], [525, "8.75"], [1439, "23.98"]]) assert.equal(decimalHours(m), d, String(m));
  });

  test("no message or text speaks of pay, wages, overtime, payroll or legal compliance", () => {
    const texts = [...Object.values(MESSAGES).filter((v) => typeof v === "string"), MESSAGES.breakTooLong(90, 60), announcement(summarize(EXAMPLE_ROWS)), describeRows(summarize(EXAMPLE_ROWS)).includedText];
    for (const t of texts) assert.equal(/pay|wage|overtime|payroll|legal|complian/i.test(t), false, t);
  });
});

describe("the engine is pure integer arithmetic", () => {
  const code = ENGINE_SOURCE.replace(/[/][*][^]*?[*][/]/g, "").replace(/^[ ]*[/][/].*$/gm, "");

  test("its code has no floating-point rounding, no Date, no timers, no network or storage, and imports nothing", () => {
    for (const banned of ["toFixed", "Math.round", "Math.ceil", "parseFloat", "Date", "setTimeout", "setInterval", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage", "document", "window", "Intl", "import "]) {
      assert.equal(code.includes(banned), false, banned);
    }
  });

  test("the same input gives the same result and the input is not changed", () => {
    const input = [Object.freeze(row("09:00", "17:30", 30)), Object.freeze(row("22:00", "06:00", 45))];
    assert.deepEqual(summarize(input), summarize(input));
    assert.deepEqual(input[0], { start: "09:00", end: "17:30", breakText: "30" });
  });
});
