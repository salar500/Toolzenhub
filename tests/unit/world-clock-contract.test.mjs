/**
 * World Clock (Tool Pack 28): its behavioural contract with the Time Zone Converter's pure engine.
 *
 * The World Clock imports a handful of functions from the Time Zone Converter (see the import in clock-engine.js: that statement is the
 * contract, and a missing name fails at module load). These tests check what those functions DO for the World Clock, not the list of
 * everything the other module exports, so the other tool may add, move or rename what the World Clock does not use.
 * One test names the Time Zone Converter's address reader, because the hand-off link is a published URL contract between the two pages.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  isValidZone, canonicalZone, sameZone, localZone, listZones, searchZones, offsetSecondsAt, wallAt, offsetLabel, formatClock, parseQuery,
} from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";
import { handoffQuery, placeFromEntry, placeFromZone, defaultBoard } from "../../assets/js/tools/world-clock/clock-engine.js";
import { DIRECTORY, getEntry } from "../../assets/js/tools/world-clock/city-directory.js";

const utc = (y, mo, d, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);

describe("what the World Clock relies on", () => {
  test("offsets in seconds for the instant, including 30- and 45-minute zones and a change of offset", () => {
    assert.equal(offsetSecondsAt(utc(2026, 10, 19, 14, 20), "Asia/Kolkata"), 19800);
    assert.equal(offsetSecondsAt(utc(2026, 10, 19, 14, 20), "Asia/Kathmandu"), 20700);
    assert.equal(offsetSecondsAt(utc(2026, 10, 19, 14, 20), "America/New_York"), -14400);
    assert.equal(offsetSecondsAt(utc(2026, 11, 15, 12, 0), "America/New_York"), -18000);
    assert.equal(offsetSecondsAt(utc(2026, 10, 19), "UTC"), 0);
  });

  test("the wall clock of an instant: local date and time, weekday and a comparable day number", () => {
    const w = wallAt(utc(2026, 10, 19, 14, 20), "Asia/Kolkata");
    assert.deepEqual([w.date, w.time, w.weekdayIndex, w.offsetSeconds, w.h, w.mi, w.minuteOfDay], ["2026-10-19", "19:50", 1, 19800, 19, 50, 1190]);
    const next = wallAt(utc(2026, 10, 19, 14, 20), "Pacific/Kiritimati");
    assert.equal(next.dayNumber - w.dayNumber, 1);
  });

  test("zone validity and identity: a real zone is accepted, nonsense is rejected, two spellings of one zone are one zone", () => {
    assert.equal(isValidZone("Europe/London"), true);
    for (const bad of ["Not/AZone", "", "x".repeat(100), "+05:30", null, undefined, 5]) assert.equal(isValidZone(bad), false, String(bad));
    assert.equal(sameZone("Asia/Kolkata", "Asia/Calcutta"), true);
    assert.equal(sameZone("Asia/Kolkata", "Asia/Dubai"), false);
    assert.equal(canonicalZone("Asia/Kolkata"), canonicalZone("Asia/Calcutta"));
  });

  test("the zone list is a sorted list of zones the runtime accepts (its length and order beyond that are the browser's business)", () => {
    const zones = listZones();
    assert.ok(Array.isArray(zones) && zones.length > 50);
    assert.deepEqual(zones, [...zones].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    assert.ok(zones.every(isValidZone));
    assert.ok(zones.includes("UTC"));
  });

  test("a typed city finds its zone, in either spelling", () => {
    assert.ok(searchZones("kolkata").some((z) => z === "Asia/Kolkata" || z === "Asia/Calcutta"));
    assert.ok(searchZones("calcutta").some((z) => z === "Asia/Kolkata" || z === "Asia/Calcutta"));
    assert.deepEqual(searchZones(""), []);
  });

  test("the visitor's own zone is one the runtime accepts, and labels and clock readings come out as the cards print them", () => {
    assert.equal(isValidZone(localZone()), true);
    assert.equal(offsetLabel(19800), "UTC+05:30");
    assert.equal(offsetLabel(-14400), "UTC−04:00");
    assert.equal(offsetLabel(-14400, true), "UTC-04:00");
    assert.equal(formatClock(0, 5, true), "12:05 AM");
    assert.equal(formatClock(13, 5, false), "13:05");
  });
});

describe("the hand-off link is accepted by the Time Zone Converter's own address reader", () => {
  test("for boards of different shapes, its source and every destination are read back and none is dropped", () => {
    const boards = [
      ["new-york-us", "london-gb", "dubai-ae", "singapore-sg", "sydney-au"],
      ["mumbai-in", "delhi-in", "kathmandu-np", "lord-howe-island-au", "chatham-islands-nz", "kiritimati-ki", "tokyo-jp"],
      ["london-gb"],
      [],
    ];
    for (const ids of boards) {
      for (const here of ["Asia/Kolkata", "Asia/Calcutta", "America/New_York", "UTC", "Pacific/Chatham"]) {
        const places = ids.map((id) => placeFromEntry(getEntry(id)));
        const query = handoffQuery(places, here);
        const read = parseQuery(query);
        assert.equal(read.source, here, `${ids} / ${here}`);
        const distinct = [...new Set(places.map((p) => canonicalZone(p.zone)))].filter((z) => z !== canonicalZone(here)).slice(0, 5);
        assert.deepEqual((read.targets ?? []).map(canonicalZone), distinct, `${ids} / ${here}`);
      }
    }
  });

  test("a board of bare browser zones is read back too, and the starter board always produces a valid link", () => {
    const places = ["America/Indiana/Knox", "Asia/Kolkata", "UTC"].map(placeFromZone);
    const read = parseQuery(handoffQuery(places, "Europe/London"));
    assert.deepEqual(read.targets, ["America/Indiana/Knox", "Asia/Kolkata", "UTC"]);
    for (const here of ["Asia/Kolkata", "UTC", "America/Los_Angeles"]) {
      const read2 = parseQuery(handoffQuery(defaultBoard(here), here));
      assert.equal(read2.source, here);
      assert.ok(read2.targets.length >= 4);
    }
  });

  test("every directory zone survives the hand-off, so no listed city produces a link the converter would drop", () => {
    for (const e of DIRECTORY) {
      const read = parseQuery(handoffQuery([placeFromEntry(e)], "Pacific/Auckland"));
      if (!sameZone(e.zone, "Pacific/Auckland")) assert.deepEqual(read.targets, [e.zone], e.id);
    }
  });
});
