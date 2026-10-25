/**
 * Tool Pack 34: the International Meeting Planner engine against the independent reference.
 *
 * tests/fixtures/meeting-golden.json is the output of tests/fixtures/meeting-golden.py (zoneinfo and datetime, availability tested every
 * five minutes on each person's real clock; the engine works in 15-minute blocks). Run with:
 *   node --test tests/unit/meeting-planner.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS,
  DEFAULT_PERSON,
  readPeople,
  availableAt,
  findMeetingTimes,
  transitionBetween,
  recurringCheck,
  copyText,
  shiftWords,
  buildQuery,
  parseQuery,
} from "../../assets/js/tools/meeting-planner/meeting-engine.js";
import { resolveWall } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "meeting-golden.json"), "utf8")).cases;

const weekdays = [true, true, true, true, true, false, false];
const person = (name, zone, start = "09:00", end = "17:00", days = weekdays) => ({ name, zone, start, end, days });

describe("against the independent reference", () => {
  test("every generated case: the shared windows, the clock changes and the weekly check match", () => {
    assert.ok(GOLDEN.length >= 50);
    let withWindows = 0;
    let withRecurring = 0;
    for (const c of GOLDEN) {
      const label = `${c.people.map((p) => `${p.zone} ${p.start}-${p.end}`).join(" | ")} ref ${c.reference} ${c.date} x${c.days} ${c.duration}min`;
      const r = findMeetingTimes({ date: c.date, days: c.days, duration: c.duration, reference: c.reference, people: c.people });
      assert.equal(r.status, "ok", label);
      assert.equal(r.dates.length, c.days, label);
      c.dates.forEach((expected, i) => {
        const got = r.dates[i];
        assert.equal(got.date, expected.date, label);
        assert.equal(got.total, expected.runs.length, `${label} ${expected.date} windows`);
        assert.equal(got.startCount, expected.startCount, `${label} ${expected.date} starts`);
        got.windows.forEach((w, k) => {
          assert.equal(w.firstStartMs, expected.runs[k][0], `${label} ${expected.date} window ${k} first`);
          assert.equal(w.lastStartMs, expected.runs[k][1], `${label} ${expected.date} window ${k} last`);
          assert.equal(w.endMs, expected.runs[k][1] + c.duration * 60000, label);
        });
        assert.equal(got.windows.length, Math.min(LIMITS.windowsPerDay, expected.runs.length), label);
        assert.equal(got.status, expected.runs.length > 0 ? "ok" : "none", label);
        if (expected.runs.length > 0) withWindows += 1;
      });
      const key = (x) => `${x.name}|${x.ms}|${x.from}|${x.to}`;
      assert.deepEqual(
        r.changes.map((x) => key({ name: x.name, ms: x.ms, from: x.fromOffset, to: x.toOffset })).sort(),
        c.changes.map(key).sort(),
        `${label} clock changes`
      );
      if (c.recurring) {
        const rec = recurringCheck({ slotMs: c.recurring.slotMs, reference: c.reference, duration: c.duration, people: c.people });
        assert.equal(rec.status, "ok", label);
        assert.equal(rec.weeks.length, c.recurring.rows.length, label);
        c.recurring.rows.forEach((expected, w) => {
          const got = rec.weeks[w];
          assert.equal(got.status, expected.status, `${label} week ${w}`);
          if (expected.status === "skipped") return;
          assert.equal(got.ms, expected.ms, `${label} week ${w}`);
          expected.per.forEach((e, p) => {
            assert.equal(got.perPerson[p].time, e.time, `${label} week ${w} person ${p}`);
            assert.equal(got.perPerson[p].shiftMinutes, e.shift, `${label} week ${w} person ${p} shift`);
            assert.equal(got.perPerson[p].fits, e.fits, `${label} week ${w} person ${p} fits`);
          });
        });
        withRecurring += 1;
      }
    }
    assert.ok(withWindows >= 20, "the cases include plenty of real results");
    assert.ok(withRecurring >= 20);
  });
});

describe("reading the people", () => {
  test("a person's availability: ordinary hours, days and the 15-minute edge", () => {
    const [ana] = readPeople([person("Ana", "Europe/London"), person("Raj", "Asia/Kolkata")]).people;
    const monday9 = Date.UTC(2026, 10, 2, 9, 0);
    assert.equal(availableAt(ana, monday9), true);
    assert.equal(availableAt(ana, monday9 - 15 * 60000), false);
    assert.equal(availableAt(ana, Date.UTC(2026, 10, 2, 16, 45)), true);
    assert.equal(availableAt(ana, Date.UTC(2026, 10, 2, 17, 0)), false);
    assert.equal(availableAt(ana, Date.UTC(2026, 10, 7, 10, 0)), false);
  });

  test("overnight hours belong to the day they start", () => {
    const night = readPeople([person("Sam", "Asia/Tokyo", "22:00", "06:00", [false, false, false, false, true, false, false]), person("B", "UTC")]).people[0];
    const tokyo = (d, h, m = 0) => Date.UTC(2026, 10, d, h - 9, m);
    assert.equal(availableAt(night, tokyo(6, 22)), true);
    assert.equal(availableAt(night, tokyo(7, 5, 45)), true);
    assert.equal(availableAt(night, tokyo(7, 6)), false);
    assert.equal(availableAt(night, tokyo(7, 22)), false);
    assert.equal(availableAt(night, tokyo(6, 5, 45)), false);
  });

  test("problems are named person by person and field by field", () => {
    const r = readPeople([
      person("A", "Nowhere/City", "09:07", "09:00", [false, false, false, false, false, false, false]),
      person("B", "UTC", "09:00", "09:00"),
    ]);
    assert.equal(r.ok, false);
    assert.deepEqual(r.issues.map((i) => [i.person, i.field]), [[0, "zone"], [0, "start"], [0, "days"], [1, "end"]]);
    assert.equal(readPeople([person("A", "UTC")]).issues[0].field, "people");
    assert.equal(readPeople([person("A", "UTC"), person("B", "UTC"), person("C", "UTC"), person("D", "UTC"), person("E", "UTC")]).people.length, 4);
    assert.equal(readPeople([{ ...person("", "UTC") }, person("", "UTC")]).people[1].name, "Person 2");
    assert.equal(DEFAULT_PERSON.start, "09:00");
  });
});

describe("the search", () => {
  const base = { date: "2026-11-03", days: 3, duration: 30, people: [person("Ana", "Europe/London"), person("Raj", "Asia/Kolkata")] };

  test("London and Kolkata share 09:00 to 17:00 weekday hours from 09:00 to 11:00 London time", () => {
    const r = findMeetingTimes({ ...base, reference: "Europe/London" });
    assert.equal(r.status, "ok");
    const w = r.dates[0].windows[0];
    assert.equal(w.perPerson[0].start.time, "09:00");
    assert.equal(w.perPerson[0].lastStart.time, "11:00");
    assert.equal(w.perPerson[1].start.time, "14:30");
    assert.equal(w.perPerson[1].end.time, "17:00");
    assert.equal(r.dates[0].weekday, "Tuesday");
  });

  test("the previous and next day are named for a person whose date differs", () => {
    const r = findMeetingTimes({
      date: "2026-11-03",
      days: 1,
      duration: 60,
      reference: "Asia/Tokyo",
      people: [person("Yui", "Asia/Tokyo", "08:00", "20:00"), person("Lee", "America/Los_Angeles", "15:00", "23:00")],
    });
    const w = r.dates[0].windows[0];
    assert.equal(w.perPerson[1].start.relation, "Previous day");
    assert.equal(w.perPerson[0].start.relation, "Same day");
  });

  test("a day with no shared time says who is blocking and when each person is free", () => {
    const r = findMeetingTimes({
      date: "2026-11-03",
      days: 2,
      duration: 60,
      reference: "UTC",
      people: [person("Day", "UTC", "09:00", "12:00"), person("Late", "UTC", "14:00", "18:00"), person("Wknd", "UTC", "09:00", "17:00", [false, false, false, false, false, true, true])],
    });
    const day = r.dates[0];
    assert.equal(day.status, "none");
    assert.deepEqual(day.blockedBy, ["Wknd"]);
    assert.equal(day.people[0].canMeet, true);
    assert.equal(day.people[0].runs[0].start.time, "09:00");
    assert.equal(day.people[2].runs.length, 0);
    assert.equal(r.total, 0);
    assert.equal(r.best, null);
  });

  test("everyone is free at different times: nobody is named as blocking, nobody has a shared hour", () => {
    const r = findMeetingTimes({ date: "2026-11-03", days: 1, duration: 30, reference: "UTC", people: [person("A", "UTC", "09:00", "12:00"), person("B", "UTC", "14:00", "18:00")] });
    assert.equal(r.dates[0].status, "none");
    assert.deepEqual(r.dates[0].blockedBy, []);
  });

  test("a longer meeting needs a longer shared stretch", () => {
    const people = [person("A", "UTC", "09:00", "10:00"), person("B", "UTC", "09:30", "12:00")];
    const at = (duration) => findMeetingTimes({ date: "2026-11-03", days: 1, duration, reference: "UTC", people }).dates[0];
    assert.equal(at(30).status, "ok");
    assert.equal(at(60).status, "none");
  });

  test("a week's search is bounded and fast", () => {
    const people = [person("A", "America/New_York"), person("B", "Europe/London"), person("C", "Asia/Kolkata"), person("D", "Pacific/Auckland", "22:00", "06:00")];
    const t0 = performance.now();
    const r = findMeetingTimes({ date: "2026-03-02", days: LIMITS.maxDays, duration: 120, reference: "America/New_York", people });
    const ms = performance.now() - t0;
    assert.equal(r.status, "ok");
    assert.equal(r.dates.length, 14);
    assert.ok(ms < 3000, `${ms} ms`);
  });

  test("DST: the 23-hour and 25-hour days are searched in full", () => {
    const people = [person("A", "America/New_York", "00:00", "23:45", [true, true, true, true, true, true, true]), person("B", "UTC", "00:00", "23:45", [true, true, true, true, true, true, true])];
    const spring = findMeetingTimes({ date: "2026-03-08", days: 1, duration: 15, reference: "America/New_York", people });
    const fall = findMeetingTimes({ date: "2026-11-01", days: 1, duration: 15, reference: "America/New_York", people });
    assert.equal(spring.dates[0].startCount > 0, true);
    assert.equal(fall.dates[0].startCount > spring.dates[0].startCount, true);
    assert.equal(spring.changes.length, 1);
    assert.equal(spring.changes[0].name, "A");
    assert.equal(spring.changes[0].fromOffset, -18000);
    assert.equal(spring.changes[0].toOffset, -14400);
  });

  test("half-hour, quarter-hour and date-line zones", () => {
    const r = findMeetingTimes({
      date: "2026-06-15",
      days: 1,
      duration: 60,
      reference: "Asia/Kathmandu",
      people: [person("N", "Asia/Kathmandu", "09:00", "17:00"), person("K", "Pacific/Kiritimati", "08:00", "18:00")],
    });
    assert.equal(r.status, "ok");
    for (const w of r.dates[0].windows) {
      assert.equal(["09:00", "09:15", "09:30", "09:45"].some((t) => w.perPerson[0].start.time.endsWith(t.slice(2))), true);
    }
  });

  test("invalid input is reported, never guessed", () => {
    const bad = (over) => findMeetingTimes({ ...base, reference: "Europe/London", ...over });
    assert.equal(bad({ date: "2026-02-30" }).status, "invalid");
    assert.equal(bad({ duration: 25 }).issues[0].field, "duration");
    assert.equal(bad({ days: 15 }).issues[0].field, "days");
    assert.equal(bad({ days: 0 }).status, "invalid");
    assert.equal(bad({ reference: "Mars/Base" }).issues[0].field, "reference");
    assert.equal(bad({ people: [person("A", "UTC")] }).issues[0].field, "people");
    assert.equal(bad({ date: "2100-12-31", days: 5 }).issues[0].message, "That range of dates goes beyond the year 2100.");
  });
});

describe("clock changes", () => {
  test("the instant of a change is found to the minute", () => {
    const t = transitionBetween("America/New_York", Date.UTC(2026, 2, 8), Date.UTC(2026, 2, 9));
    assert.equal(t.ms, Date.UTC(2026, 2, 8, 7, 0));
    assert.equal(t.fromOffset, -18000);
    assert.equal(t.toOffset, -14400);
    assert.equal(transitionBetween("Asia/Tokyo", Date.UTC(2026, 2, 8), Date.UTC(2026, 2, 9)), null);
    const lord = transitionBetween("Australia/Lord_Howe", Date.UTC(2026, 3, 4), Date.UTC(2026, 3, 6));
    assert.equal(lord.fromOffset - lord.toOffset, 1800);
  });
});

describe("a weekly meeting through clock changes", () => {
  test("9 a.m. in New York moves for London between the US and UK change dates, then comes back", () => {
    const slot = resolveWall("2026-03-05", "14:00", "Europe/London").candidates[0].ms;
    const r = recurringCheck({
      slotMs: slot,
      reference: "Europe/London",
      duration: 60,
      people: [person("Ana", "Europe/London", "08:00", "18:00"), person("Ned", "America/New_York", "08:00", "18:00")],
    });
    assert.equal(r.status, "ok");
    const ned = r.summary[1];
    assert.equal(ned.baseTime, "09:00");
    assert.equal(ned.firstShift.shiftMinutes, 60);
    assert.equal(ned.firstShift.date, "2026-03-12");
    assert.equal(ned.firstShift.time, "10:00");
    assert.equal(r.summary[0].firstShift, null);
    assert.equal(r.moved, true);
    assert.equal(r.weeks.find((w) => w.date === "2026-03-26").perPerson[1].time, "10:00");
    assert.equal(r.weeks.find((w) => w.date === "2026-04-02").perPerson[1].time, "09:00");
  });

  test("a shifted time that leaves a person's hours is flagged", () => {
    const slot = resolveWall("2026-03-05", "14:00", "Europe/London").candidates[0].ms;
    const r = recurringCheck({
      slotMs: slot,
      reference: "Europe/London",
      duration: 60,
      people: [person("Ana", "Europe/London"), person("Ned", "America/New_York", "09:00", "10:00")],
    });
    assert.equal(r.summary[1].outsideFromWeek, 1);
    assert.equal(r.outside, true);
    assert.equal(r.summary[1].outsideWhenBaseFits, true);
  });

  test("two zones that change on the same dates never move relative to each other", () => {
    const slot = resolveWall("2026-01-12", "10:00", "Europe/Berlin").candidates[0].ms;
    const r = recurringCheck({ slotMs: slot, reference: "Europe/Berlin", duration: 30, people: [person("A", "Europe/Berlin"), person("B", "Europe/London")], weeks: 52 });
    assert.equal(r.moved, false);
    assert.equal(r.weeks.length, 52);
  });

  test("shift words", () => {
    assert.equal(shiftWords(60), "1 hour later");
    assert.equal(shiftWords(-30), "30 minutes earlier");
    assert.equal(shiftWords(90), "1 hour 30 minutes later");
  });
});

describe("the copied text and the link", () => {
  test("the copied text lists each person's local time and the day relation", () => {
    const r = findMeetingTimes({ date: "2026-11-03", days: 1, duration: 30, reference: "Europe/London", people: [person("Ana", "Europe/London"), person("Raj", "Asia/Kolkata")] });
    const text = copyText(r, false);
    assert.match(text, /^Meeting options, 30 minutes \(shown in each person's local time\)/);
    assert.match(text, /Tuesday, 3 November 2026: start between 09:00 and 11:00 \(Europe\/London\)/);
    assert.match(text, /Ana, Europe\/London: earliest 09:00 to 09:30 UTC\+00:00/);
    assert.match(text, /Raj, Asia\/Kolkata: earliest 14:30 to 15:00 UTC\+05:30/);
    assert.match(copyText(r, true), /2:30 PM to 3:00 PM/);
    const none = findMeetingTimes({ date: "2026-11-07", days: 1, duration: 30, reference: "UTC", people: [person("A", "UTC"), person("B", "UTC")] });
    assert.match(copyText(none), /No time falls inside everyone's availability/);
    assert.equal(copyText({ status: "invalid" }), "");
  });

  test("the link round-trips and drops what it cannot read", () => {
    const state = {
      people: [person("Ana", "Europe/London", "09:00", "17:00"), person("Sam ~ T", "Asia/Tokyo", "22:15", "06:00", [false, true, true, true, true, true, false])],
      duration: 45,
      date: "2026-11-03",
      days: 7,
      reference: "Asia/Tokyo",
    };
    const query = buildQuery(state);
    const back = parseQuery(`?${query}`);
    assert.equal(back.people.length, 2);
    assert.deepEqual(back.people[0], state.people[0]);
    assert.equal(back.people[1].name, "Sam   T");
    assert.equal(back.people[1].start, "22:15");
    assert.deepEqual(back.people[1].days, state.people[1].days);
    assert.equal(back.duration, 45);
    assert.equal(back.date, "2026-11-03");
    assert.equal(back.days, 7);
    assert.equal(back.reference, "Asia/Tokyo");
    const junk = parseQuery("?p=a~b~c&p=Ana~UTC~0900~1700~1111100&len=77&d=nope&n=99");
    assert.equal(junk.people.length, 1);
    assert.equal(junk.duration, null);
    assert.equal(junk.date, null);
    assert.equal(junk.days, null);
    assert.equal(parseQuery("").people.length, 0);
  });

  test("names are the only personal data in a link, and the engine does not touch the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "meeting-planner", "meeting-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "Date.now", "new Date("]) assert.equal(source.includes(banned), false, banned);
  });
});
