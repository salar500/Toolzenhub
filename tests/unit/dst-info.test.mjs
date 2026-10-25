/**
 * Tool Pack 34: the Time Zone Converter's daylight-saving information against the independent reference.
 *
 * tests/fixtures/dst-golden.json is the output of tests/fixtures/dst-golden.py (zoneinfo, found by walking 15-minute steps; the engine
 * samples every three days and bisects). Run with:
 *   node --test tests/unit/dst-info.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SEARCH_DAYS,
  NEAR_DAYS,
  transitionBetween,
  zoneChanges,
  describeChange,
  zoneNotes,
  differenceChanges,
  differenceWords,
  amountWords,
} from "../../assets/js/tools/time-zone-converter/dst-info.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "dst-golden.json"), "utf8"));
const DAY = 86400000;
const REFERENCE_DAYS = 195;

describe("against the independent reference", () => {
  test("the previous and next clock change of every zone, at every moment", () => {
    assert.ok(GOLDEN.zones.length >= 70);
    let found = 0;
    for (const c of GOLDEN.zones) {
      const label = `${c.zone} at ${new Date(c.ms).toISOString()}`;
      const got = zoneChanges(c.zone, c.ms);
      for (const side of ["previous", "next"]) {
        const expected = c[side];
        if (expected) {
          assert.ok(got[side], `${label} ${side}`);
          assert.equal(got[side].ms, expected.ms, `${label} ${side} instant`);
          assert.equal(got[side].fromOffset, expected.from, `${label} ${side}`);
          assert.equal(got[side].toOffset, expected.to, `${label} ${side}`);
          assert.equal(got[side].forward, expected.forward, `${label} ${side}`);
          assert.equal(got[side].deltaMinutes, expected.deltaMinutes, `${label} ${side}`);
          const words = describeChange(got[side]);
          assert.equal(words.date, expected.date, `${label} ${side} date`);
          assert.equal(words.time, expected.time, `${label} ${side} time before`);
          assert.equal(words.newTime, expected.newTime, `${label} ${side} time after`);
          found += 1;
        } else if (got[side]) {
          assert.ok(Math.abs(got[side].ms - c.ms) > REFERENCE_DAYS * DAY, `${label} ${side} is only allowed beyond the reference window`);
        }
      }
    }
    assert.ok(found >= 60);
  });

  test("a change in the gap between two places, and the instant it happens", () => {
    let found = 0;
    for (const c of GOLDEN.differences) {
      const label = `${c.source} to ${c.target} at ${new Date(c.ms).toISOString()}`;
      const got = differenceChanges(c.source, [c.target], c.ms);
      if (c.change) {
        assert.equal(got.length, 1, label);
        assert.equal(got[0].ms, c.change.ms, label);
        assert.equal(got[0].before, c.change.before, label);
        assert.equal(got[0].after, c.change.after, label);
        found += 1;
      } else {
        assert.equal(got.length, 0, label);
      }
    }
    assert.ok(found >= 15);
  });
});

describe("what a person is told", () => {
  const march8 = Date.UTC(2026, 2, 8, 12, 0);

  test("New York springs forward: 2:00 becomes 3:00 on the right date", () => {
    const { next } = zoneChanges("America/New_York", Date.UTC(2026, 2, 1));
    const words = describeChange(next);
    assert.equal(words.date, "2026-03-08");
    assert.equal(words.dateWords, "Sunday 8 March 2026");
    assert.equal(words.headline, "Clocks go forward 1 hour on Sunday 8 March 2026: 02:00 becomes 03:00");
    assert.equal(words.offsets, "UTC−05:00 to UTC−04:00");
  });

  test("clocks go back in the autumn: 2:00 becomes 1:00", () => {
    const { next } = zoneChanges("America/New_York", Date.UTC(2026, 6, 1));
    const words = describeChange(next);
    assert.equal(words.date, "2026-11-01");
    assert.equal(words.headline, "Clocks go back 1 hour on Sunday 1 November 2026: 02:00 becomes 01:00");
  });

  test("a half-hour change is said in minutes", () => {
    assert.equal(amountWords(30), "30 minutes");
    assert.equal(amountWords(-60), "1 hour");
    assert.equal(amountWords(120), "2 hours");
    const { next } = zoneChanges("Australia/Lord_Howe", Date.UTC(2026, 2, 1));
    assert.equal(describeChange(next).amount, "30 minutes");
  });

  test("a zone with no daylight saving reports none, and says nothing is near", () => {
    const tokyo = zoneNotes("Asia/Tokyo", march8);
    assert.equal(tokyo.state, "none");
    assert.equal(tokyo.nearNext, false);
    const ny = zoneNotes("America/New_York", Date.UTC(2026, 2, 1));
    assert.equal(ny.state, "changes");
    assert.equal(ny.nearNext, true);
    assert.equal(ny.nearPrevious, false);
    assert.equal(zoneNotes("America/New_York", Date.UTC(2026, 5, 1)).nearNext, false);
    assert.ok(NEAR_DAYS < SEARCH_DAYS);
  });

  test("a change exactly at the converted moment is already in force", () => {
    const instant = Date.UTC(2026, 2, 8, 7, 0);
    const { previous, next } = zoneChanges("America/New_York", instant);
    assert.equal(previous.ms, instant);
    assert.notEqual(next?.ms, instant);
  });

  test("the gap between London and New York changes for three weeks in March, and the words say so", () => {
    const [change] = differenceChanges("Europe/London", ["America/New_York"], Date.UTC(2026, 2, 1, 12));
    assert.equal(change.before, -300);
    assert.equal(change.after, -240);
    assert.equal(change.cause, "target");
    assert.equal(differenceWords(change.before), "5 hours");
    assert.equal(differenceWords(change.after), "4 hours");
    assert.equal(differenceWords(330), "5 hours 30 minutes");
    assert.equal(differenceWords(0), "no difference");
    assert.equal(differenceChanges("Asia/Tokyo", ["Asia/Kolkata"], march8).length, 0);
    assert.equal(differenceChanges("Asia/Tokyo", ["Asia/Tokyo"], march8).length, 0);
    assert.equal(differenceChanges("Asia/Tokyo", ["Nowhere/City"], march8).length, 0);
  });

  test("bad zones and equal ends give nothing", () => {
    assert.deepEqual(zoneChanges("Nowhere/City", march8), { zone: "Nowhere/City", previous: null, next: null });
    assert.equal(transitionBetween("Asia/Tokyo", march8, march8 + DAY), null);
  });

  test("the module imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "time-zone-converter", "dst-info.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "Date.now", "hardcoded"]) assert.equal(source.includes(banned), false, banned);
  });
});
