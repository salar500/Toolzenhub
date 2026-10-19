/**
 * World Clock (Tool Pack 28): the independent reference.
 *
 * tests/fixtures/world-clock-golden.json comes from Python's datetime and zoneinfo (tests/fixtures/world-clock-golden.py), which share no
 * logic with the JavaScript: for each zone and fixed instant it records the offset, the local date, time and weekday, and the next change
 * of offset found by asking for the offset at EVERY HOUR for 400 days and then every minute inside the first hour that differs.
 *
 * Agreement here means "agrees on the tested cases": these zones, these instants, this tzdata release. It is not a proof for every zone,
 * date or future rule, and the JavaScript asks the runtime's own copy of the database, which may be a different release (see the
 * version-divergence test below).
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { nextClockChange } from "../../assets/js/tools/world-clock/clock-engine.js";
import { wallAt } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const golden = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "fixtures", "world-clock-golden.json"), "utf8"));

const SECOND_TOLERANCE_MS = 60000; // the reference is to the minute; the JavaScript is to the second

function jsCase(c) {
  const w = wallAt(c.ms, c.zone);
  return { date: w.date, time: w.time, weekday: w.weekdayIndex, offsetSeconds: w.offsetSeconds, next: nextClockChange(c.zone, c.ms) };
}

function differences(c) {
  const js = jsCase(c);
  const out = [];
  for (const key of ["date", "time", "weekday", "offsetSeconds"]) if (js[key] !== c[key]) out.push(`${key}: ${js[key]} (runtime) vs ${c[key]} (reference)`);
  if ((js.next === null) !== (c.next === null)) {
    out.push(`next change: ${JSON.stringify(js.next)} (runtime) vs ${JSON.stringify(c.next)} (reference)`);
  } else if (c.next !== null) {
    if (Math.abs(js.next.atMs - c.next.atMs) > SECOND_TOLERANCE_MS) out.push(`next change instant ${new Date(js.next.atMs).toISOString()} vs ${new Date(c.next.atMs).toISOString()}`);
    if (js.next.fromOffset !== c.next.fromOffset || js.next.toOffset !== c.next.toOffset) out.push(`next change offsets ${js.next.fromOffset}->${js.next.toOffset} vs ${c.next.fromOffset}->${c.next.toOffset}`);
  }
  return out;
}

describe("the reference", () => {
  test("it names its tzdata release, covers the odd zones and both kinds of outcome", () => {
    assert.match(golden.tzdata, /^\d{4}[a-z]$/);
    assert.ok(golden.strict.length >= 200);
    for (const zone of ["Asia/Kathmandu", "Australia/Lord_Howe", "Pacific/Chatham", "America/St_Johns", "Asia/Tehran", "Pacific/Kiritimati", "Pacific/Pago_Pago", "Africa/Casablanca"]) {
      assert.ok(golden.strict.some((c) => c.zone === zone), zone);
    }
    assert.ok(golden.strict.some((c) => c.next === null) && golden.strict.some((c) => c.next !== null));
    assert.ok(!golden.strict.some((c) => c.zone in golden.knownDivergentZones), "a known-divergent zone is never in the strict set");
  });
});

describe("agreement on the tested cases (strict set)", () => {
  test("the offset, local date, local time and weekday of every zone at every instant", () => {
    const bad = [];
    for (const c of golden.strict) {
      const js = jsCase(c);
      for (const key of ["date", "time", "weekday", "offsetSeconds"]) if (js[key] !== c[key]) bad.push(`${c.zone} @ ${new Date(c.ms).toISOString()} ${key}: ${js[key]} vs ${c[key]}`);
    }
    assert.deepEqual(bad, []);
  });

  test("the next clock change: the same instant (to the minute) and the same offsets, or the same absence", () => {
    const bad = [];
    for (const c of golden.strict) {
      const d = differences(c).filter((m) => m.startsWith("next change"));
      if (d.length) bad.push(`${c.zone} @ ${new Date(c.ms).toISOString()}: ${d.join("; ")}`);
    }
    assert.deepEqual(bad, [], "a difference on a zone that is not on the known-divergent list is a defect, not a database difference");
  });
});

describe("tz-database version divergence (America/Asuncion stays as a regression case)", () => {
  test("the divergent zone is recorded with its reason, and is not hidden or deleted", () => {
    assert.ok("America/Asuncion" in golden.knownDivergentZones);
    const info = golden.knownDivergentZones["America/Asuncion"];
    assert.ok(info.reason.length > 30 && /2025a/.test(info.reason) && /2024a/.test(info.reason));
    assert.ok(golden.divergent.length >= 2 && golden.divergent.every((c) => c.zone === "America/Asuncion"));
  });

  test("the runtime either agrees with the pinned release, or differs on a LISTED zone while its own tz data is older than the pin", () => {
    const runtimeTz = process.versions.tz;
    for (const c of golden.divergent) {
      const diff = differences(c);
      if (diff.length === 0) continue; // the runtime's data is at least as new as the pin: the zone agrees today
      assert.ok(c.zone in golden.knownDivergentZones, `${c.zone} differs and is not on the known-divergent list: ${diff.join("; ")}`);
      assert.ok(typeof runtimeTz === "string" && /^\d{4}[a-z]$/.test(runtimeTz), "the runtime's tz version cannot be established, so a difference cannot be explained as a database difference");
      assert.ok(runtimeTz < golden.tzdata, `${c.zone} differs but the runtime's tz data (${runtimeTz}) is not older than the pin (${golden.tzdata}): ${diff.join("; ")}`);
    }
  });

  test("the divergence the audit saw is the one documented: on an older runtime Paraguay still has a 2027 change that the pin does not", () => {
    const c = golden.divergent[0];
    assert.equal(c.next, null);
    const runtimeNext = nextClockChange(c.zone, c.ms);
    if (runtimeNext !== null) {
      assert.equal(new Date(runtimeNext.atMs).toISOString(), "2027-03-28T03:00:00.000Z");
      assert.deepEqual([runtimeNext.fromOffset, runtimeNext.toOffset], [-10800, -14400]);
      assert.ok(process.versions.tz < golden.tzdata);
    }
  });

  test("any calculation difference on an ordinary zone cannot hide behind this list: the list holds exactly the one known zone", () => {
    assert.deepEqual(Object.keys(golden.knownDivergentZones), ["America/Asuncion"]);
  });
});
