/**
 * Tool Pack 34: the Shift Schedule Planner engine against the independent reference.
 *
 * tests/fixtures/shift-golden.json is the output of tests/fixtures/shift-golden.py (datetime.date and a plain modulo; shift lengths from
 * datetime subtraction). Run with:
 *   node --test tests/unit/shift-planner.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS,
  PRESETS,
  DEFAULT_TIMES,
  parseCycle,
  cycleText,
  cycleWords,
  shiftLength,
  readTimes,
  buildSchedule,
  groupByMonth,
  hoursText,
  copyText,
  isoText,
  weekdayIndex,
} from "../../assets/js/tools/shift-planner/shift-engine.js";
import { parseDate, dayNumber } from "../../assets/js/tools/date-difference/date-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "shift-golden.json"), "utf8")).cases;

const num = (text) => dayNumber(parseDate(text).date);

describe("against the independent reference", () => {
  test("every generated case: the cycle text, each date's code, the totals and the runs match", () => {
    assert.ok(GOLDEN.length >= 160);
    for (const c of GOLDEN) {
      const label = `${c.text} pos ${c.position} from ${c.start} for ${c.weeks} weeks`;
      const parsed = parseCycle(c.text);
      assert.equal(parsed.ok, true, label);
      assert.equal(parsed.days.join(""), c.cycle, label);
      const r = buildSchedule({ cycle: parsed.days, start: num(c.start), position: c.position, weeks: c.weeks, times: c.times });
      assert.equal(r.status, "ok", label);
      assert.equal(r.days.map((d) => d.code).join(""), c.codes, label);
      assert.equal(isoText(r.days[r.days.length - 1].number), c.last, label);
      c.weekdays.forEach((w, i) => assert.equal(r.days[i].weekday, w, `${label} weekday ${i}`));
      const s = r.summary;
      assert.equal(s.workingDays, c.workingDays, label);
      assert.equal(s.offDays, c.offDays, label);
      assert.deepEqual(s.counts, c.counts, label);
      assert.equal(s.totalMinutes, c.totalMinutes, label);
      assert.equal(s.averageMinutesPerWeek, c.averageMinutesPerWeek, label);
      assert.equal(s.longestWorkRun, c.longestWorkRun, label);
      assert.equal(s.longestOffRun, c.longestOffRun, label);
      assert.equal(s.longestWorkRunInWindow, c.longestWorkRunInWindow, label);
    }
  });
});

describe("reading a cycle", () => {
  test("letters, spaced letters and runs all read the same", () => {
    const same = ["DDNNOOO", "D D N N O O O", "2D 2N 3O", "2d2n3o", "2D,2N,3O", "DDNN---"];
    for (const text of same) assert.equal(parseCycle(text).days.join(""), "DDNNOOO", text);
  });

  test("the presets are all valid, and 2-2-3 is a 14-day cycle", () => {
    for (const preset of PRESETS) assert.equal(parseCycle(preset.cycle).ok, true, preset.id);
    const p = PRESETS.find((x) => x.id === "2-2-3");
    assert.equal(parseCycle(p.cycle).days.length, 14);
    assert.equal(parseCycle(PRESETS.find((x) => x.id === "4-on-4-off").cycle).days.join(""), "DDDDOOOO");
  });

  test("refused, in words", () => {
    assert.equal(parseCycle("").blank, true);
    for (const bad of ["D", "OOOO", "DDXO", "0D 3O", "4", "2D 3Q"]) assert.equal(parseCycle(bad).ok, false, bad);
    assert.match(parseCycle("DDXO").message, /“X” is not part of a cycle/);
    assert.match(parseCycle("OOOO").message, /working day/);
    assert.equal(parseCycle("D".repeat(LIMITS.maxCycle)).ok, true);
    assert.equal(parseCycle("D".repeat(LIMITS.maxCycle + 1)).ok, false);
    assert.equal(parseCycle("99D 99O").ok, false);
  });

  test("text and words for a cycle", () => {
    assert.equal(cycleText(["D", "D", "N", "O", "O"]), "2D 1N 2O");
    assert.equal(cycleWords(["D", "D", "N", "O", "O"]), "2 day, 1 night, 2 off");
  });
});

describe("shift times and hours", () => {
  test("a shift ending at or before its start ends the next day; equal times are refused", () => {
    assert.equal(shiftLength("07:00", "15:00"), 480);
    assert.equal(shiftLength("23:00", "07:00"), 480);
    assert.equal(shiftLength("22:00", "06:00"), 480);
    assert.equal(shiftLength("06:30", "18:45"), 735);
    assert.equal(shiftLength("12:00", "12:00"), null);
    assert.equal(shiftLength("25:00", "12:00"), null);
    assert.equal(shiftLength("", "12:00"), null);
  });

  test("only the shifts a cycle uses need valid times", () => {
    const times = { D: { start: "07:00", end: "15:00" }, N: { start: "", end: "" } };
    assert.equal(readTimes(times, new Set(["D"])).ok, true);
    const bad = readTimes(times, new Set(["D", "N"]));
    assert.equal(bad.ok, false);
    assert.deepEqual(bad.errors.map((e) => e.code), ["N"]);
  });

  test("hours text", () => {
    assert.equal(hoursText(480), "8:00");
    assert.equal(hoursText(2250), "37:30");
  });
});

describe("the schedule", () => {
  const cycle = parseCycle("4D 4O").days;
  const build = (over = {}) => buildSchedule({ cycle, start: num("2026-11-02"), position: 1, weeks: 2, times: DEFAULT_TIMES, ...over });

  test("4 on 4 off from a Monday", () => {
    const r = build();
    assert.deepEqual(r.days.map((d) => d.code).join(""), "DDDDOOOODDDDOO");
    assert.equal(r.days[0].iso, "2026-11-02");
    assert.equal(r.days[0].start, "07:00");
    assert.equal(r.days[4].working, false);
    assert.equal(r.days[4].minutes, 0);
  });

  test("the start position shifts the pattern", () => {
    assert.deepEqual(build({ position: 5, weeks: 1 }).days.map((d) => d.code).join(""), "OOOODDD".slice(0, 4) + "DDD");
    assert.deepEqual(build({ position: 3, weeks: 1 }).days.map((d) => d.code).join(""), "DDOOOOD");
  });

  test("a night shift ends the next day and keeps its start date", () => {
    const r = buildSchedule({ cycle: parseCycle("2N 2O").days, start: num("2026-12-31"), position: 1, weeks: 1, times: DEFAULT_TIMES });
    assert.equal(r.days[0].iso, "2026-12-31");
    assert.equal(r.days[0].endsNextDay, true);
    assert.equal(r.days[0].minutes, 480);
    assert.equal(r.days[1].iso, "2027-01-01");
  });

  test("month and year boundaries, and leap day", () => {
    const r = build({ start: num("2024-02-26"), weeks: 1 });
    assert.deepEqual(r.days.map((d) => d.iso), ["2024-02-26", "2024-02-27", "2024-02-28", "2024-02-29", "2024-03-01", "2024-03-02", "2024-03-03"]);
    const months = groupByMonth(build({ start: num("2026-12-28"), weeks: 2 }).days);
    assert.deepEqual(months.map((m) => [m.year, m.month, m.days.length]), [[2026, 12, 4], [2027, 1, 10]]);
  });

  test("the summary", () => {
    const s = build({ weeks: 4 }).summary;
    assert.equal(s.totalDays, 28);
    assert.equal(s.workingDays, 16);
    assert.equal(s.totalMinutes, 16 * 480);
    assert.equal(s.averageMinutesPerWeek, 16 * 480 / 4);
    assert.equal(s.longestWorkRun, 4);
    assert.equal(s.longestOffRun, 4);
    assert.equal(s.cycleLength, 8);
  });

  test("a cycle's longest run counts the wrap-around", () => {
    const s = buildSchedule({ cycle: parseCycle("2D 3O 2D").days, start: num("2026-11-02"), position: 1, weeks: 1, times: DEFAULT_TIMES }).summary;
    assert.equal(s.longestWorkRun, 4);
  });

  test("invalid times and the calendar edges", () => {
    const bad = build({ times: { D: { start: "07:00", end: "07:00" } } });
    assert.equal(bad.status, "invalid");
    assert.equal(build({ start: num("9999-12-30"), weeks: 1 }).status, "out-of-range");
    assert.equal(build({ start: num("0001-01-01"), weeks: 1 }).status, "ok");
  });

  test("weekday index matches the calendar", () => {
    assert.equal(weekdayIndex(num("2026-11-02")), 0);
    assert.equal(weekdayIndex(num("2026-11-08")), 6);
  });

  test("copy text groups runs and states the overnight rule", () => {
    const r = buildSchedule({ cycle: parseCycle("2D 1N 3O").days, start: num("2026-11-02"), position: 1, weeks: 1, times: DEFAULT_TIMES });
    const text = copyText(r, ["D", "D", "N", "O", "O", "O"], DEFAULT_TIMES);
    assert.match(text, /^Shift schedule: 2D 1N 3O \(2 day, 1 night, 3 off\), repeating every 6 days/);
    assert.match(text, /Mon 2 Nov 2026 to Tue 3 Nov 2026: Day 07:00-15:00/);
    assert.match(text, /Wed 4 Nov 2026: Night 23:00-07:00 \(ends next day\)/);
    assert.match(text, /Thu 5 Nov 2026 to Sat 7 Nov 2026: Off/);
    assert.match(text, /4 working days, 3 days off, 32:00 hours of scheduled shifts/);
  });

  test("the engine imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "shift-planner", "shift-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "new Date(", "Date.now"]) assert.equal(source.includes(banned), false, banned);
  });
});
