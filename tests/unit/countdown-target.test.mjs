/**
 * Tool Pack 34: the Countdown Timer's "to a date" engine against the independent reference.
 *
 * tests/fixtures/countdown-target-golden.json is the output of tests/fixtures/countdown-target-golden.py (zoneinfo for the instants,
 * integer arithmetic for the time left). Run with:
 *   node --test tests/unit/countdown-target.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MESSAGES,
  NAME_LIMIT,
  parseTarget,
  remainingAt,
  eventText,
  clockText,
  spokenParts,
  announceKey,
  buildQuery,
  parseQuery,
} from "../../assets/js/tools/countdown-timer/target-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "countdown-target-golden.json"), "utf8"));

describe("against the independent reference", () => {
  test("every wall time: one instant, the earlier or later of a repeated time, or a refused skipped time", () => {
    assert.ok(GOLDEN.cases.length >= 130);
    const kinds = { unique: 0, overlap: 0, gap: 0 };
    for (const c of GOLDEN.cases) {
      const label = `${c.date} ${c.time} ${c.zone}`;
      const e = c.expect;
      kinds[e.kind] += 1;
      if (e.kind === "gap") {
        const r = parseTarget({ date: c.date, time: c.time, zone: c.zone });
        assert.equal(r.ok, false, label);
        assert.match(r.errors[0].message, /does not exist/, label);
      } else if (e.kind === "unique") {
        const r = parseTarget({ date: c.date, time: c.time, zone: c.zone });
        assert.equal(r.ok, true, label);
        assert.equal(r.ms, e.ms, label);
        assert.equal(r.ambiguous, false, label);
      } else {
        const early = parseTarget({ date: c.date, time: c.time, zone: c.zone, choice: "earlier" });
        const late = parseTarget({ date: c.date, time: c.time, zone: c.zone, choice: "later" });
        assert.equal(early.ms, e.earlier, label);
        assert.equal(late.ms, e.later, label);
        assert.equal(early.ambiguous, true, label);
        assert.equal(early.other, e.later, label);
        assert.equal(late.other, e.earlier, label);
      }
    }
    assert.ok(kinds.unique > 100 && kinds.overlap >= 3 && kinds.gap >= 3, JSON.stringify(kinds));
  });

  test("the time left, counting down and counting up", () => {
    for (const s of GOLDEN.spans) {
      const got = remainingAt(s.target, s.now);
      const e = s.expect;
      assert.deepEqual(
        [got.reached, got.days, got.hours, got.minutes, got.seconds, got.totalSeconds],
        [e.reached, e.days, e.hours, e.minutes, e.seconds, e.totalSeconds],
        `${s.target - s.now} ms`
      );
    }
  });
});

describe("reading the target", () => {
  test("a blank or bad date and time are named field by field", () => {
    const r = parseTarget({ date: "2026-02-30", time: "25:00", zone: "Mars/Base" });
    assert.equal(r.ok, false);
    assert.deepEqual(r.errors.map((e) => e.field), ["date", "time", "zone"]);
    assert.equal(parseTarget({ date: "1969-12-31", time: "10:00", zone: "UTC" }).errors[0].message, MESSAGES.date);
    assert.equal(parseTarget({ date: "2101-01-01", time: "10:00", zone: "UTC" }).ok, false);
    assert.equal(parseTarget({ date: "", time: "", zone: "UTC" }).errors.length, 2);
  });

  test("a blank zone is this device's zone", () => {
    const r = parseTarget({ date: "2026-12-25", time: "09:30", zone: "" });
    assert.equal(r.ok, true);
    assert.equal(typeof r.zone, "string");
    assert.ok(r.zone.length > 0);
  });

  test("the skipped hour names the jump", () => {
    const r = parseTarget({ date: "2026-03-08", time: "02:30", zone: "America/New_York" });
    assert.match(r.errors[0].message, /02:30 does not exist in America\/New_York on 2026-03-08: the clocks jump from 01:59 to 03:00/);
  });

  test("event text names the zone and the offset", () => {
    const ms = parseTarget({ date: "2026-12-25", time: "09:30", zone: "Europe/London" }).ms;
    assert.equal(eventText(ms, "Europe/London"), "Friday, 25 December 2026, 09:30 GMT (UTC+00:00)");
  });
});

describe("the display and the announcements", () => {
  test("clock text and spoken text", () => {
    assert.equal(clockText({ days: 12, hours: 3, minutes: 4, seconds: 5 }), "12 days 03:04:05");
    assert.equal(clockText({ days: 1, hours: 0, minutes: 0, seconds: 0 }), "1 day 00:00:00");
    assert.equal(clockText({ days: 0, hours: 0, minutes: 9, seconds: 9 }), "00:09:09");
    assert.equal(spokenParts({ days: 12, hours: 3, minutes: 0, seconds: 5 }), "12 days 3 hours 5 seconds");
    assert.equal(spokenParts({ days: 0, hours: 0, minutes: 0, seconds: 0 }), "0 seconds");
  });

  test("announcements happen on steps, not every second", () => {
    const keys = new Set();
    for (let s = 3 * 86400; s >= 0; s -= 1) keys.add(announceKey({ ...remainingAt(s * 1000 + 1, 0) }));
    assert.ok(keys.size < 200, `${keys.size} different announcements for three days`);
    assert.equal(announceKey(remainingAt(0, 5)), "reached");
  });

  test("the day count is 24-hour days across a clock change", () => {
    const march1 = parseTarget({ date: "2026-03-01", time: "12:00", zone: "America/New_York" }).ms;
    const march9 = parseTarget({ date: "2026-03-09", time: "12:00", zone: "America/New_York" }).ms;
    const r = remainingAt(march9, march1);
    assert.deepEqual([r.days, r.hours], [7, 23]);
  });
});

describe("the link", () => {
  test("round trip and refusals", () => {
    const q = buildQuery({ date: "2026-12-25", time: "09:30", zone: "Europe/London", name: "Holiday", choice: "later" });
    assert.deepEqual(parseQuery(q), { date: "2026-12-25", time: "09:30", zone: "Europe/London", name: "Holiday", choice: "later" });
    assert.equal(parseQuery("to=junk"), null);
    assert.equal(parseQuery(""), null);
    assert.equal(parseQuery(`?to=2026-12-25T09:30&name=${"x".repeat(200)}`).name.length, NAME_LIMIT);
    assert.equal(parseQuery("to=2026-12-25T09:30").choice, "earlier");
    assert.equal(parseQuery("to=2026-12-25T09:30").zone, "");
  });

  test("the engine imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "countdown-timer", "target-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "Date.now", "new Date("]) assert.equal(source.includes(banned), false, banned);
  });
});
