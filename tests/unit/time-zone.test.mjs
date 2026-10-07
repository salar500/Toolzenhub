/**
 * Time Zone Converter (Tool Pack 19). Pure engine only: no DOM, no other tool.
 *
 * Two kinds of evidence. (1) Hand-worked cases whose answers are derived from the rules, not from the code. (2) An
 * independent reference (tests/fixtures/time-zone-golden.py: Python datetime and zoneinfo, with a minute-by-minute brute force
 * for the meeting windows) compared case by case. The two share no logic.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MAX_ZONES, MAX_TARGETS, DURATIONS, UNSUPPORTED_ZONE, parseDate, parseTime, addDays, isValidZone, localZone, listZones, searchZones,
  offsetSecondsAt, wallAt, offsetLabel, formatClock, relationLabel, describeInZone, resolveWall, occurrenceOf, wallInputFor, nowInZone,
  canonicalZone, sameZone, convert, swapSource, addZone, removeZone, copyText, parseQuery, buildQuery, hoursMinutes, startOfLocalDay, meetingOverlap, copyMeetingText,
} from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const golden = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "fixtures", "time-zone-golden.json"), "utf8"));

const utc = (y, mo, d, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);

describe("independent reference (Python datetime + zoneinfo)", () => {
  test("the reference has the expected shape and covers every kind of wall time", () => {
    assert.ok(golden.resolve.length > 1000 && golden.describe.length > 250 && golden.overlap.length > 35);
    for (const kind of ["unique", "overlap", "gap"]) assert.ok(golden.resolve.some((c) => c.kind === kind), kind);
    assert.ok(golden.overlap.some((c) => c.status === "ok") && golden.overlap.some((c) => c.status === "none"));
  });

  test("resolve: the same kind and the same instants and offsets for every wall time (gaps, repeats and ordinary times)", () => {
    for (const [i, c] of golden.resolve.entries()) {
      const r = resolveWall(c.date, c.time, c.zone);
      assert.equal(r.kind, c.kind, `#${i} ${c.zone} ${c.date} ${c.time}`);
      assert.deepEqual(r.candidates.map((x) => [x.ms, x.offsetSeconds]), c.candidates, `#${i} ${c.zone} ${c.date} ${c.time}`);
    }
  });

  test("describe: the local date, time, weekday, offset and day difference of an instant in a zone", () => {
    for (const [i, c] of golden.describe.entries()) {
      const d = describeInZone(c.ms, c.zone, wallAt(c.ms, c.source).dayNumber);
      assert.deepEqual([d.date, d.time, d.weekday, d.offsetSeconds, d.dayDelta], [c.date, c.time, c.weekday, c.offsetSeconds, c.dayDelta], `#${i} ${c.source} -> ${c.zone}`);
    }
  });

  test("meeting overlap: the same windows as the minute-by-minute brute force, and the same preferred runs when there is none", () => {
    for (const [i, c] of golden.overlap.entries()) {
      const r = meetingOverlap({ date: c.date, source: c.source, zones: c.participants, duration: c.duration });
      const label = `#${i} ${c.date} ${c.participants.map((p) => `${p.zone} ${p.start}-${p.end}`).join(" | ")} ${c.duration}min`;
      assert.equal(r.status, c.status, label);
      if (c.status === "ok") {
        assert.equal(r.total, c.windows.length, label);
        assert.deepEqual(r.windows.map((w) => [w.firstStartMs, w.lastStartMs, w.endMs]), c.windows.slice(0, 6), label);
      } else {
        for (const p of r.preferred) {
          assert.deepEqual(p.runs.map((run) => [run.startMs, run.endMs]), c.preferred[p.zone], `${label} ${p.zone}`);
        }
      }
    }
  });
});

describe("dates, times and zones", () => {
  test("dates and times are parsed strictly, inside the supported years", () => {
    assert.deepEqual(parseDate("2026-10-13"), { y: 2026, mo: 10, d: 13 });
    for (const bad of ["2026-02-30", "2026-13-01", "2026-00-10", "26-10-13", "2026-10-13T00:00", "1969-12-31", "2101-01-01", "", null]) assert.equal(parseDate(bad), null, String(bad));
    assert.deepEqual(parseTime("09:05"), { h: 9, mi: 5 });
    for (const bad of ["24:00", "9:05", "09:60", "09:5", "", "ab:cd"]) assert.equal(parseTime(bad), null, bad);
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
    assert.equal(addDays("2100-12-31", 1), null);
  });

  test("zone identifiers are IANA-looking and accepted by the browser; offsets and junk are not", () => {
    for (const ok of ["UTC", "Asia/Kolkata", "America/New_York", "Australia/Lord_Howe", "Etc/GMT-5", "America/Argentina/Buenos_Aires"]) assert.equal(isValidZone(ok), true, ok);
    for (const bad of ["+05:30", "-0800", "GMT+5", "Mars/Olympus", "", " ", "../etc", "Asia/Kolkata<script>", "A".repeat(80), null, 5, "America//New_York"]) assert.equal(isValidZone(bad), false, String(bad));
    assert.equal(typeof localZone(), "string");
  });

  test("the zone list is sorted, has UTC and the modern spellings of the legacy names", () => {
    const zones = listZones();
    assert.ok(zones.length > 100);
    assert.deepEqual(zones, zones.slice().sort());
    for (const z of ["UTC", "Asia/Kolkata", "Asia/Kathmandu", "America/New_York", "Pacific/Kiritimati", "Australia/Lord_Howe"]) assert.ok(zones.includes(z), z);
    for (const z of zones) assert.equal(isValidZone(z), true, z);
  });

  test("search ignores case, underscores and slashes; the city ranks first; old spellings find the modern name", () => {
    assert.equal(searchZones("new york")[0], "America/New_York");
    assert.equal(searchZones("NEW_YORK")[0], "America/New_York");
    assert.equal(searchZones("america/new york")[0], "America/New_York");
    assert.equal(searchZones("kolkata")[0], "Asia/Kolkata");
    assert.ok(searchZones("calcutta").includes("Asia/Kolkata") && searchZones("calcutta").includes("Asia/Calcutta"));
    assert.equal(searchZones("kathmandu")[0], "Asia/Kathmandu");
    assert.equal(searchZones("utc")[0], "UTC");
    assert.equal(searchZones("lord howe")[0], "Australia/Lord_Howe");
    assert.deepEqual(searchZones(""), []);
    assert.deepEqual(searchZones("   "), []);
    assert.deepEqual(searchZones("zzzzzz"), []);
    assert.ok(searchZones("a", undefined, 8).length <= 8);
    assert.deepEqual(searchZones("london"), searchZones("london")); // deterministic
    assert.equal(searchZones("india").includes("Asia/Kolkata"), false); // IANA names only: there is no country or city database ("Indian/..." matches as text)
  });
});

describe("conversion (hand-worked)", () => {
  const base = { date: "2026-10-13", time: "15:00", source: "Asia/Kolkata" };

  test("India to London on a normal date: 15:00 IST is 10:30 BST, the same day", () => {
    const r = convert({ ...base, targets: ["Europe/London"] });
    assert.equal(r.status, "ok");
    assert.equal(r.ms, utc(2026, 10, 13, 9, 30));
    const london = r.rows[0];
    assert.deepEqual([london.date, london.time, london.weekday, london.offset, london.offsetSeconds, london.relation], ["2026-10-13", "10:30", "Tuesday", "UTC+01:00", 3600, "Same day"]);
    assert.equal(london.dateLabel, "Tuesday, 13 October 2026");
    assert.equal(r.source.offset, "UTC+05:30");
  });

  test("India to New York: 05:30 EDT the same morning, and a late evening in India lands on the previous day in New York", () => {
    const r = convert({ ...base, targets: ["America/New_York"] });
    const ny = r.rows[0];
    assert.deepEqual([ny.time, ny.offset, ny.relation], ["05:30", "UTC−04:00", "Same day"]);
    const late = convert({ date: "2026-10-13", time: "03:00", source: "Asia/Kolkata", targets: ["America/New_York"] });
    assert.deepEqual([late.rows[0].date, late.rows[0].time, late.rows[0].relation], ["2026-10-12", "17:30", "Previous day"]);
    const next = convert({ date: "2026-10-13", time: "22:00", source: "America/New_York", targets: ["Asia/Kolkata"] });
    assert.deepEqual([next.rows[0].date, next.rows[0].time, next.rows[0].relation], ["2026-10-14", "07:30", "Next day"]);
  });

  test("the offset is the one in force on that date: London is UTC+00:00 in winter and UTC+01:00 in summer", () => {
    assert.equal(convert({ date: "2026-01-13", time: "12:00", source: "UTC", targets: ["Europe/London"] }).rows[0].offset, "UTC+00:00");
    assert.equal(convert({ date: "2026-07-13", time: "12:00", source: "UTC", targets: ["Europe/London"] }).rows[0].offset, "UTC+01:00");
  });

  test("UTC is a zone like any other and reads UTC+00:00", () => {
    const r = convert({ date: "2026-10-13", time: "12:00", source: "UTC", targets: ["Asia/Kolkata"] });
    assert.deepEqual([r.source.offset, r.source.zone], ["UTC+00:00", "UTC"]);
    assert.equal(r.rows[0].time, "17:30");
  });

  test("non-hour offsets: India +05:30, Nepal +05:45, Adelaide +10:30 in summer and +09:30 in winter, Lord Howe +11:00 and +10:30", () => {
    const at = (zone, date) => describeInZone(utc(...date.split("-").map(Number), 12), zone).offset;
    assert.equal(at("Asia/Kolkata", "2026-10-13"), "UTC+05:30");
    assert.equal(at("Asia/Kathmandu", "2026-10-13"), "UTC+05:45");
    assert.equal(at("Australia/Adelaide", "2026-01-13"), "UTC+10:30");
    assert.equal(at("Australia/Adelaide", "2026-07-13"), "UTC+09:30");
    assert.equal(at("Australia/Lord_Howe", "2026-01-13"), "UTC+11:00");
    assert.equal(at("Australia/Lord_Howe", "2026-07-13"), "UTC+10:30");
    assert.equal(convert({ date: "2026-10-13", time: "12:00", source: "Asia/Kathmandu", targets: ["Asia/Kolkata"] }).rows[0].time, "11:45");
  });

  test("zones without daylight saving keep their offset all year", () => {
    for (const month of [1, 4, 7, 10]) {
      assert.equal(offsetSecondsAt(utc(2026, month, 15), "Asia/Kolkata"), 19800);
      assert.equal(offsetSecondsAt(utc(2026, month, 15), "Pacific/Honolulu"), -36000);
    }
  });

  test("southern-hemisphere daylight saving runs the other way: Sydney is UTC+11:00 in January and UTC+10:00 in July", () => {
    assert.equal(describeInZone(utc(2026, 1, 15), "Australia/Sydney").offset, "UTC+11:00");
    assert.equal(describeInZone(utc(2026, 7, 15), "Australia/Sydney").offset, "UTC+10:00");
  });

  test("the date line: Kiritimati (UTC+14) is two calendar days ahead of Pago Pago (UTC-11) and the relation says so", () => {
    const r = convert({ date: "2026-06-15", time: "23:30", source: "Pacific/Pago_Pago", targets: ["Pacific/Kiritimati"] });
    assert.deepEqual([r.rows[0].date, r.rows[0].time, r.rows[0].dayDelta, r.rows[0].relation], ["2026-06-17", "00:30", 2, "2 days later"]);
    const back = convert({ date: "2026-06-17", time: "00:30", source: "Pacific/Kiritimati", targets: ["Pacific/Pago_Pago"] });
    assert.deepEqual([back.rows[0].date, back.rows[0].dayDelta, back.rows[0].relation], ["2026-06-15", -2, "2 days earlier"]);
    const adak = convert({ date: "2026-07-01", time: "08:00", source: "America/Adak", targets: ["Pacific/Honolulu", "Asia/Tokyo"] });
    assert.deepEqual(adak.rows.map((x) => [x.zone, x.time, x.relation]), [["Pacific/Honolulu", "07:00", "Same day"], ["Asia/Tokyo", "02:00", "Next day"]]);
  });

  test("day relations are compared by calendar date, not by 24-hour spans, and read in words", () => {
    assert.deepEqual([0, 1, -1, 2, -3].map(relationLabel), ["Same day", "Next day", "Previous day", "2 days later", "3 days earlier"]);
    const r = convert({ date: "2026-01-13", time: "23:59", source: "UTC", targets: ["Europe/London", "Asia/Tokyo"] });
    assert.deepEqual(r.rows.map((x) => x.relation), ["Same day", "Next day"]); // London is on UTC+00:00 in winter
    const summer = convert({ date: "2026-07-13", time: "23:59", source: "UTC", targets: ["Europe/London"] });
    assert.equal(summer.rows[0].relation, "Next day"); // and on UTC+01:00 in summer
  });

  test("clock text is unambiguous in both formats", () => {
    assert.equal(formatClock(0, 5, true), "12:05 AM");
    assert.equal(formatClock(12, 0, true), "12:00 PM");
    assert.equal(formatClock(15, 30, true), "3:30 PM");
    assert.equal(formatClock(15, 30, false), "15:30");
    assert.equal(formatClock(0, 0, false), "00:00");
    assert.equal(offsetLabel(-14400), "UTC−04:00");
    assert.equal(offsetLabel(-14400, true), "UTC-04:00");
    assert.equal(offsetLabel(20700), "UTC+05:45");
    assert.equal(offsetLabel(0), "UTC+00:00");
  });

  test("an invalid date or time, and an unsupported zone, are named and never crash", () => {
    assert.deepEqual([convert({ ...base, date: "2026-02-31" }).status, convert({ ...base, date: "2026-02-31" }).field], ["invalid", "date"]);
    assert.deepEqual([convert({ ...base, time: "25:00" }).status, convert({ ...base, time: "25:00" }).field], ["invalid", "time"]);
    const bad = convert({ ...base, source: "Mars/Olympus" });
    assert.deepEqual([bad.status, bad.message, bad.zone], ["unsupported", UNSUPPORTED_ZONE, "Mars/Olympus"]);
    assert.equal(convert({ ...base, targets: ["Europe/London", "Nowhere/City"] }).status, "unsupported");
    assert.equal(convert({ ...base, date: "" }).status, "invalid");
  });
});

describe("daylight-saving gaps and repeats", () => {
  test("US spring forward: 02:30 on 2026-03-08 does not exist in New York, is named, and nothing is converted", () => {
    const r = convert({ date: "2026-03-08", time: "02:30", source: "America/New_York", targets: ["Europe/London"] });
    assert.equal(r.status, "gap");
    assert.equal(r.message, "This local time does not exist in this time zone because of a daylight-saving transition.");
    assert.match(r.detail, /On 2026-03-08 the clocks in America\/New_York went from 01:59 \(UTC−05:00\) to 03:00 \(UTC−04:00\)\./);
    assert.deepEqual(r.nearest, { before: "01:59", after: "03:00", date: "2026-03-08" });
    assert.equal(r.rows, undefined);
    assert.equal(convert({ date: "2026-03-08", time: "01:59", source: "America/New_York" }).status, "ok");
    assert.equal(convert({ date: "2026-03-08", time: "03:00", source: "America/New_York" }).status, "ok");
  });

  test("US fall back: 01:30 on 2026-11-01 happens twice; both are shown with their offsets and the user must choose", () => {
    const r = convert({ date: "2026-11-01", time: "01:30", source: "America/New_York", targets: ["UTC"] });
    assert.equal(r.status, "ambiguous");
    assert.deepEqual(r.options.map((o) => [o.choice, o.offsetSeconds, o.ms]), [["earlier", -14400, utc(2026, 11, 1, 5, 30)], ["later", -18000, utc(2026, 11, 1, 6, 30)]]);
    assert.deepEqual(r.options.map((o) => o.label), ["Earlier occurrence: 01:30 UTC−04:00", "Later occurrence: 01:30 UTC−05:00"]);
    const earlier = convert({ date: "2026-11-01", time: "01:30", source: "America/New_York", targets: ["UTC"], choice: "earlier" });
    const later = convert({ date: "2026-11-01", time: "01:30", source: "America/New_York", targets: ["UTC"], choice: "later" });
    assert.deepEqual([earlier.rows[0].time, later.rows[0].time], ["05:30", "06:30"]);
    assert.deepEqual([earlier.overlapChoice, later.overlapChoice], ["earlier", "later"]);
    assert.equal(convert({ date: "2026-11-01", time: "01:30", source: "America/New_York", choice: "maybe" }).status, "ambiguous");
    // a choice given for a time that is not repeated is ignored
    assert.equal(convert({ date: "2026-11-02", time: "01:30", source: "America/New_York", choice: "later" }).status, "ok");
  });

  test("the repeat is shown in the 12-hour format too, unambiguously", () => {
    const r = convert({ date: "2026-11-01", time: "01:30", source: "America/New_York", hour12: true });
    assert.deepEqual(r.options.map((o) => o.label), ["Earlier occurrence: 1:30 AM UTC−04:00", "Later occurrence: 1:30 AM UTC−05:00"]);
  });

  test("EU: 01:30 on 2026-03-29 does not exist in London, and 01:30 on 2026-10-25 happens twice", () => {
    assert.equal(convert({ date: "2026-03-29", time: "01:30", source: "Europe/London" }).status, "gap");
    const r = convert({ date: "2026-10-25", time: "01:30", source: "Europe/London" });
    assert.deepEqual(r.options.map((o) => o.offsetSeconds), [3600, 0]);
    assert.equal(convert({ date: "2026-03-29", time: "02:30", source: "Europe/Berlin" }).status, "gap");
  });

  test("southern hemisphere: Sydney's gap is in October and its repeat is in April", () => {
    assert.equal(convert({ date: "2026-10-04", time: "02:30", source: "Australia/Sydney" }).status, "gap");
    const r = convert({ date: "2026-04-05", time: "02:30", source: "Australia/Sydney" });
    assert.deepEqual(r.options.map((o) => o.offsetSeconds), [39600, 36000]);
    assert.equal(convert({ date: "2026-03-08", time: "02:30", source: "Australia/Sydney" }).status, "ok"); // the US date is an ordinary time here
  });

  test("Lord Howe shifts by 30 minutes, not an hour: the gap is 02:00 to 02:30 and the repeat is 01:30 to 02:00", () => {
    const gap = convert({ date: "2026-10-04", time: "02:15", source: "Australia/Lord_Howe" });
    assert.equal(gap.status, "gap");
    assert.deepEqual(gap.nearest, { before: "01:59", after: "02:30", date: "2026-10-04" });
    assert.match(gap.detail, /\(UTC\+10:30\) to 02:30 \(UTC\+11:00\)/);
    assert.equal(convert({ date: "2026-10-04", time: "02:30", source: "Australia/Lord_Howe" }).status, "ok");
    const repeat = convert({ date: "2026-04-05", time: "01:45", source: "Australia/Lord_Howe" });
    assert.equal(repeat.status, "ambiguous");
    assert.deepEqual(repeat.options.map((o) => o.offsetSeconds), [39600, 37800]);
    assert.equal(convert({ date: "2026-04-05", time: "01:15", source: "Australia/Lord_Howe" }).status, "ok");
    assert.equal(convert({ date: "2026-04-05", time: "02:00", source: "Australia/Lord_Howe" }).status, "ok");
  });

  test("zones without daylight saving never have a gap or a repeat", () => {
    for (const time of ["00:00", "02:30", "12:00", "23:59"]) {
      for (const date of ["2026-03-08", "2026-03-29", "2026-11-01", "2026-10-25"]) assert.equal(resolveWall(date, time, "Asia/Kolkata").kind, "unique");
    }
  });

  test("occurrence and wall input name the same instant again", () => {
    const earlier = utc(2026, 11, 1, 5, 30);
    const later = utc(2026, 11, 1, 6, 30);
    assert.equal(occurrenceOf(earlier, "2026-11-01", "01:30", "America/New_York"), "earlier");
    assert.equal(occurrenceOf(later, "2026-11-01", "01:30", "America/New_York"), "later");
    assert.equal(occurrenceOf(utc(2026, 11, 2, 5, 30), "2026-11-02", "00:30", "America/New_York"), null);
    assert.deepEqual(wallInputFor(later, "America/New_York"), { date: "2026-11-01", time: "01:30", choice: "later" });
    assert.deepEqual(wallInputFor(utc(2026, 10, 13, 9, 30), "Europe/London"), { date: "2026-10-13", time: "10:30", choice: null });
  });
});

describe("changing zones", () => {
  const state = { date: "2026-10-13", time: "10:00", source: "Asia/Kolkata", targets: ["Europe/London", "America/New_York"], choice: null };

  test("changing the SOURCE zone keeps the typed wall time and re-reads it in the new zone", () => {
    const india = convert(state);
    const london = convert({ ...state, source: "Europe/London", targets: ["Asia/Kolkata"] });
    assert.equal(india.source.time, "10:00");
    assert.equal(london.source.time, "10:00");
    assert.notEqual(india.ms, london.ms); // a different instant: 10:00 in the new zone, not the old instant
    assert.equal(london.ms - india.ms, 4.5 * 3600000); // 10:00 BST is 4.5 hours after 10:00 IST
  });

  test("changing a DESTINATION keeps the instant; only its display changes", () => {
    const a = convert(state);
    const b = convert({ ...state, targets: ["Asia/Tokyo", "Pacific/Auckland"] });
    assert.equal(a.ms, b.ms);
    assert.equal(b.rows[0].time, "13:30");
  });

  test("swap keeps the instant: the new source reads the old destination's local time", () => {
    const result = convert(state);
    const swapped = swapSource(state, result);
    assert.deepEqual([swapped.source, swapped.targets, swapped.date, swapped.time, swapped.choice], ["Europe/London", ["Asia/Kolkata", "America/New_York"], "2026-10-13", "05:30", null]);
    const again = convert(swapped);
    assert.equal(again.ms, result.ms);
    assert.deepEqual(again.rows.map((r) => [r.zone, r.time]), [["Asia/Kolkata", "10:00"], ["America/New_York", "00:30"]]);
    // swapping back gives the original state
    const back = swapSource(swapped, again);
    assert.deepEqual([back.source, back.targets, back.date, back.time], [state.source, state.targets, state.date, state.time]);
  });

  test("swap across a date change and across a repeated hour keeps the instant", () => {
    const s = { date: "2026-10-13", time: "03:00", source: "Asia/Kolkata", targets: ["America/New_York"], choice: null };
    const r = convert(s);
    const sw = swapSource(s, r);
    assert.deepEqual([sw.date, sw.time], ["2026-10-12", "17:30"]);
    assert.equal(convert(sw).ms, r.ms);
    // the destination reading is the later of two 01:30s: the new source must name that one
    const earlyIn = convert({ date: "2026-11-01", time: "11:00", source: "Asia/Kolkata", targets: ["America/New_York"], choice: null });
    assert.deepEqual([earlyIn.rows[0].time, earlyIn.rows[0].offset], ["01:30", "UTC−04:00"]); // 05:30 UTC
    const o2 = { date: "2026-11-01", time: "12:00", source: "Asia/Kolkata", targets: ["America/New_York"], choice: null };
    const r3 = convert(o2);
    assert.deepEqual([r3.rows[0].time, r3.rows[0].offset], ["01:30", "UTC−05:00"]); // 06:30 UTC: the later 01:30
    const sw2 = swapSource(o2, r3);
    assert.deepEqual([sw2.source, sw2.date, sw2.time, sw2.choice], ["America/New_York", "2026-11-01", "01:30", "later"]);
    assert.equal(convert(sw2).ms, r3.ms);
    assert.equal(convert({ ...sw2, choice: null }).status, "ambiguous");
  });

  test("swap with nothing to swap with, or before a valid result, does nothing", () => {
    assert.equal(swapSource({ ...state, targets: [] }, convert({ ...state, targets: [] })), null);
    assert.equal(swapSource(state, { status: "gap" }), null);
    assert.equal(swapSource(state, null), null);
  });

  test("zones are added without duplicates, the source counts, and the total is capped", () => {
    assert.equal(MAX_ZONES, 6);
    assert.equal(MAX_TARGETS, 5);
    assert.deepEqual(addZone("UTC", [], "Asia/Kolkata"), { ok: true, targets: ["Asia/Kolkata"] });
    assert.equal(addZone("UTC", ["Asia/Kolkata"], "Asia/Kolkata").ok, false);
    assert.match(addZone("UTC", [], "UTC").message, /already in the list/);
    assert.equal(addZone("UTC", [], "Mars/Olympus").message, UNSUPPORTED_ZONE);
    const full = ["America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];
    const refused = addZone("UTC", full, "Pacific/Auckland");
    assert.equal(refused.ok, false);
    assert.match(refused.message, /up to 6 time zones/);
    assert.deepEqual(removeZone(full, "Asia/Kolkata"), ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"]);
  });

  test("two spellings of one zone are one zone: Asia/Kolkata and Asia/Calcutta are never listed twice", () => {
    assert.equal(sameZone("Asia/Kolkata", "Asia/Calcutta"), true);
    assert.equal(sameZone("Asia/Kolkata", "Asia/Kathmandu"), false);
    assert.equal(sameZone("UTC", "UTC"), true);
    assert.equal(canonicalZone("Asia/Kolkata"), canonicalZone("Asia/Calcutta"));
    assert.equal(addZone("Asia/Calcutta", [], "Asia/Kolkata").ok, false);
    assert.equal(addZone("UTC", ["Asia/Calcutta"], "Asia/Kolkata").ok, false);
    assert.deepEqual(parseQuery("?from=Asia/Calcutta&to=Asia/Kolkata,Europe/London").targets, ["Europe/London"]);
  });

  test("removing a zone changes nothing else", () => {
    const four = { ...state, targets: ["Europe/London", "Asia/Tokyo", "America/New_York"] };
    const before = convert(four);
    const after = convert({ ...four, targets: removeZone(four.targets, "Asia/Tokyo") });
    assert.equal(after.ms, before.ms);
    assert.deepEqual(after.rows.map((r) => r.time), before.rows.filter((r) => r.zone !== "Asia/Tokyo").map((r) => r.time));
  });
});

describe("the current time as a default", () => {
  test("the system clock is read in the browser zone, not as UTC", () => {
    const now = utc(2026, 10, 13, 20, 7, 41);
    assert.deepEqual(nowInZone(now, "Asia/Kolkata"), { date: "2026-10-14", time: "01:37" }); // 20:07 UTC is 01:37 the next morning in India
    assert.deepEqual(nowInZone(now, "America/Los_Angeles"), { date: "2026-10-13", time: "13:07" });
    assert.deepEqual(nowInZone(now, "UTC"), { date: "2026-10-13", time: "20:07" });
    // the converted default names the same instant as the clock
    const d = nowInZone(now, "Asia/Kolkata");
    const r = convert({ ...d, source: "Asia/Kolkata", targets: ["UTC"] });
    assert.equal(r.rows[0].time, "20:07");
    assert.equal(r.ms, Math.floor(now / 60000) * 60000);
  });
});

describe("text to copy and the address", () => {
  test("copy text is plain, readable and uses ASCII minus signs and the chosen clock", () => {
    const r = convert({ date: "2026-10-13", time: "15:00", source: "Asia/Kolkata", targets: ["Europe/London", "America/New_York", "Pacific/Auckland"] });
    assert.equal(copyText(r, false), [
      "Time conversion, 13 Oct 2026",
      "15:00 Asia/Kolkata UTC+05:30",
      "10:30 Europe/London UTC+01:00",
      "05:30 America/New_York UTC-04:00",
      "22:30 Pacific/Auckland UTC+13:00",
      "",
    ].join("\n"));
    assert.equal(copyText(r, true).split("\n")[1], "3:00 PM Asia/Kolkata UTC+05:30");
    const next = convert({ date: "2026-10-13", time: "22:00", source: "America/New_York", targets: ["Asia/Kolkata"] });
    assert.equal(copyText(next, true).split("\n")[2], "7:30 AM Asia/Kolkata UTC+05:30 (next day, Wed 14 Oct)");
    assert.equal(copyText({ status: "gap" }, false), "");
  });

  test("the address carries only date, time, zones and the repeat choice, and round-trips", () => {
    const state = { date: "2026-10-13", time: "15:00", source: "Asia/Kolkata", targets: ["Europe/London", "America/New_York"], choice: "later" };
    const search = buildQuery(state);
    assert.equal(search, "?d=2026-10-13&t=15%3A00&from=Asia/Kolkata&to=Europe/London,America/New_York&c=later");
    assert.deepEqual(parseQuery(search), state);
    assert.equal(buildQuery({}), "");
  });

  test("hostile or invalid address values are ignored, never trusted", () => {
    assert.deepEqual(parseQuery("?d=2026-02-31&t=99:99&from=Mars/Olympus&to=Nowhere/Zone&c=maybe"), { targets: [] });
    assert.deepEqual(parseQuery('?from=<script>alert(1)</script>&to="><img src=x onerror=alert(1)>'), { targets: [] });
    assert.deepEqual(parseQuery("?from=%2B05%3A30&to=%2B0530,GMT%2B5"), { targets: [] });
    const dup = parseQuery("?from=UTC&to=UTC,Asia/Kolkata,Asia/Kolkata,Europe/London,America/New_York,Asia/Tokyo,Australia/Sydney,Pacific/Auckland,Pacific/Honolulu");
    assert.deepEqual(dup.targets, ["Asia/Kolkata", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"]); // no duplicate, not the source, at most five
    assert.deepEqual(parseQuery("?d=2026-10-13"), { date: "2026-10-13" });
    assert.deepEqual(parseQuery(""), {});
    assert.deepEqual(parseQuery("?" + "x=1&".repeat(5000)), {});
    assert.equal(buildQuery({ date: "2026-10-13", note: "private" }), "?d=2026-10-13");
  });
});

describe("meeting overlap (hand-worked)", () => {
  const hours = (zones, start = "09:00", end = "17:00") => zones.map((zone) => ({ zone, start, end }));
  const time = (d) => `${d.time}`;

  test("India and London on 2026-10-13: London 09:00 to 17:00 BST is 13:30 to 21:30 in India, so the overlap is 13:30 to 17:00 India", () => {
    const r = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "Europe/London"]), duration: 30 });
    assert.equal(r.status, "ok");
    assert.equal(r.total, 1);
    const w = r.windows[0];
    assert.deepEqual([time(w.perZone[0].start), time(w.perZone[0].lastStart), time(w.perZone[0].end)], ["13:30", "16:30", "17:00"]);
    assert.deepEqual([time(w.perZone[1].start), time(w.perZone[1].lastStart), time(w.perZone[1].end)], ["09:00", "12:00", "12:30"]);
    assert.equal(w.starts, 13);
  });

  test("exact boundary: a meeting that exactly fills the shared hour fits, and a longer one does not", () => {
    // India 09:00-17:00 and London 04:30-... : make the shared span exactly 60 minutes with explicit hours
    const zones = [{ zone: "Asia/Kolkata", start: "13:30", end: "15:30" }, { zone: "Europe/London", start: "09:00", end: "10:00" }]; // London 09:00-10:00 BST = 13:30-14:30 IST
    const exact = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 60 });
    assert.equal(exact.status, "ok");
    assert.deepEqual([exact.windows[0].perZone[0].start.time, exact.windows[0].perZone[0].end.time, exact.windows[0].starts], ["13:30", "14:30", 1]);
    const longer = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 90 });
    assert.equal(longer.status, "none");
    const shorter = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 15 });
    assert.equal(shorter.windows[0].starts, 4);
  });

  test("the meeting length decides what counts: 90 minutes leaves a shorter window than 15", () => {
    const at = (duration) => meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "Europe/London"]), duration }).windows[0];
    assert.equal(at(15).starts, 14); // 13:30 to 16:45
    assert.equal(at(90).starts, 9); // 13:30 to 15:30
    assert.equal(at(90).perZone[0].end.time, "17:00"); // never beyond the preferred hours
    assert.deepEqual(DURATIONS, [15, 30, 45, 60, 90]);
  });

  test("no overlap: India and New York in normal hours share nothing, and each zone's own hours are shown in source time", () => {
    const r = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "America/New_York"]), duration: 30 });
    assert.equal(r.status, "none");
    assert.equal(r.message, "No time falls inside everyone's preferred hours on this date.");
    const [india, ny] = r.preferred;
    assert.deepEqual([india.runs[0].start.time, india.runs[0].end.time], ["09:00", "17:00"]);
    // New York 09:00-17:00 EDT is 18:30 to 02:30 India time: the end of the previous New York day opens this India day, and the start of the next one closes it
    assert.deepEqual(ny.runs.map((run) => [run.start.time, run.end.time, run.end.date]), [["00:00", "02:30", "2026-10-13"], ["18:30", "00:00", "2026-10-14"]]);
  });

  test("a third zone that does not share the hours removes the overlap", () => {
    const two = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "Europe/London"]), duration: 30 });
    const three = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "Europe/London", "America/Los_Angeles"]), duration: 30 });
    assert.equal(two.status, "ok");
    assert.equal(three.status, "none");
  });

  test("individual preferred hours: a late riser and an early bird still meet when their own ranges overlap", () => {
    const zones = [{ zone: "Asia/Kolkata", start: "07:00", end: "10:00" }, { zone: "Europe/London", start: "04:00", end: "06:00" }]; // London 04:00-06:00 BST = 08:30-10:30 IST
    const r = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 60 });
    assert.equal(r.status, "ok");
    assert.deepEqual([r.windows[0].perZone[0].start.time, r.windows[0].perZone[0].end.time], ["08:30", "10:00"]);
  });

  test("the overlap depends on the DATE: London and New York share 5 hours most of the year and 4 for three weeks in March", () => {
    const span = (date) => {
      const r = meetingOverlap({ date, source: "Europe/London", zones: hours(["Europe/London", "America/New_York"]), duration: 30 });
      const w = r.windows[0];
      return [w.perZone[0].start.time, w.perZone[0].end.time];
    };
    assert.deepEqual(span("2026-03-04"), ["14:00", "17:00"]); // New York 09:00 is 14:00 in London (UTC-5, UK on UTC+0)
    assert.deepEqual(span("2026-03-10"), ["13:00", "17:00"]); // US clocks have moved (UTC-4), the UK's have not
    assert.deepEqual(span("2026-04-10"), ["14:00", "17:00"]); // both on summer time again
  });

  test("a transition inside the meeting: New York hours that hold the skipped hour are evaluated on the real clock", () => {
    // 2026-03-08 in New York: clocks jump from 02:00 to 03:00. UTC: 00:00-23:45. NY preferred 01:00-04:00.
    const zones = [{ zone: "America/New_York", start: "01:00", end: "04:00" }, { zone: "UTC", start: "00:00", end: "23:45" }];
    const r60 = meetingOverlap({ date: "2026-03-08", source: "America/New_York", zones, duration: 60 });
    // 01:00-04:00 on the clock is only TWO real hours that morning (01:00-02:00 EST, 03:00-04:00 EDT), so there is one continuous window of two hours
    assert.equal(r60.status, "ok");
    assert.equal(r60.windows.length, 1);
    assert.deepEqual([r60.windows[0].perZone[0].start.time, r60.windows[0].perZone[0].lastStart.time, r60.windows[0].perZone[0].end.time, r60.windows[0].starts], ["01:00", "03:00", "04:00", 5]);
    // a meeting that spans the jump is 60 real minutes (01:15 to 01:59 then 03:00 to 03:15), so it is inside the hours
    const r90 = meetingOverlap({ date: "2026-03-08", source: "America/New_York", zones, duration: 90 });
    assert.deepEqual([r90.windows[0].perZone[0].start.time, r90.windows[0].perZone[0].lastStart.time, r90.windows[0].starts], ["01:00", "01:30", 3]);
  });

  test("a repeated hour counts twice on the real clock: 01:00 to 03:00 in New York on 2026-11-01 is three real hours", () => {
    const zones = [{ zone: "America/New_York", start: "01:00", end: "03:00" }, { zone: "UTC", start: "00:00", end: "23:45" }];
    const r = meetingOverlap({ date: "2026-11-01", source: "America/New_York", zones, duration: 60 });
    assert.equal(r.status, "ok");
    // from 01:00 EDT to 02:00 EST by the clock is 3 real hours, so a 60-minute meeting can start at any of 9 quarter-hours
    const w = r.windows;
    assert.equal(w.length, 1);
    assert.deepEqual([w[0].firstStartMs, w[0].endMs - w[0].lastStartMs], [utc(2026, 11, 1, 5, 0), 3600000]);
    assert.equal(w[0].starts, 9);
  });

  test("a zone with an offset that is not a multiple of 15 minutes that day is named, not guessed", () => {
    const r = meetingOverlap({ date: "1971-06-01", source: "Africa/Monrovia", zones: hours(["Africa/Monrovia", "UTC"]), duration: 30 });
    assert.equal(r.status, "unsupported");
    assert.match(r.message, /Africa\/Monrovia uses an offset on this date that is not a multiple of 15 minutes/);
  });

  test("invalid ranges, overnight ranges, odd minutes and a missing second zone are explained", () => {
    const run = (zones, extra = {}) => meetingOverlap({ date: "2026-10-13", source: "UTC", zones, duration: 30, ...extra });
    assert.equal(run(hours(["UTC"])).status, "need-more");
    const over = run([{ zone: "UTC", start: "22:00", end: "02:00" }, { zone: "Asia/Tokyo", start: "09:00", end: "17:00" }]);
    assert.equal(over.status, "invalid");
    assert.match(over.issues[0].message, /must start before they end on the same day. Ranges that cross midnight are not supported/);
    assert.equal(run([{ zone: "UTC", start: "09:07", end: "17:00" }, { zone: "Asia/Tokyo", start: "09:00", end: "17:00" }]).status, "invalid");
    assert.equal(run([{ zone: "UTC", start: "09:00", end: "09:00" }, { zone: "Asia/Tokyo", start: "09:00", end: "17:00" }]).status, "invalid");
    assert.equal(run(hours(["UTC", "Asia/Tokyo"]), { duration: 20 }).status, "invalid");
    assert.equal(run(hours(["UTC", "Mars/Olympus"])).status, "unsupported");
    assert.equal(run(hours(["UTC", "Asia/Tokyo"]), { date: "2026-02-30" }).status, "invalid");
    assert.equal(hoursMinutes("09:15"), 555);
    assert.equal(hoursMinutes("09:10"), null);
  });

  test("the day is the source zone's calendar day, with 23 and 25 hour days handled", () => {
    const hour = 3600000;
    assert.equal(startOfLocalDay("2026-03-09", "America/New_York") - startOfLocalDay("2026-03-08", "America/New_York"), 23 * hour);
    assert.equal(startOfLocalDay("2026-11-02", "America/New_York") - startOfLocalDay("2026-11-01", "America/New_York"), 25 * hour);
    assert.equal(startOfLocalDay("2026-10-13", "Asia/Kolkata"), utc(2026, 10, 12, 18, 30));
  });

  test("it is deterministic and fast: six zones compute in a few milliseconds", () => {
    const zones = hours(["Asia/Kolkata", "Europe/London", "America/New_York", "America/Los_Angeles", "Australia/Sydney", "Asia/Tokyo"], "06:00", "23:45");
    const started = performance.now();
    let last;
    for (let i = 0; i < 5; i++) last = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 30 });
    const each = (performance.now() - started) / 5;
    assert.deepEqual(last, meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones, duration: 30 }));
    assert.ok(each < 150, `each overlap took ${each.toFixed(1)} ms`);
  });

  test("the meeting text lists the earliest window in every zone", () => {
    const r = meetingOverlap({ date: "2026-10-13", source: "Asia/Kolkata", zones: hours(["Asia/Kolkata", "Europe/London"]), duration: 30 });
    assert.equal(copyMeetingText(r, "2026-10-13", false), [
      "Meeting time, 13 Oct 2026 (earliest start, 30 minutes)",
      "13:30 Asia/Kolkata UTC+05:30",
      "09:00 Europe/London UTC+01:00",
      "",
    ].join("\n"));
    assert.equal(copyMeetingText({ status: "none" }, "2026-10-13", false), "");
  });
});
