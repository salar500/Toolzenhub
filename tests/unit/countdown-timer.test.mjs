/**
 * Tool Pack 13: the Countdown Timer rules (assets/js/tools/countdown-timer/timer-engine.js).
 *
 * The engine takes "now" as an argument, so every test below drives it with a fake clock: nothing waits in real time.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  LIMITS,
  PRESETS,
  parseDuration,
  splitSeconds,
  createTimer,
  start,
  remainingAt,
  tick,
  pause,
  resume,
  reset,
  formatClock,
  durationWords,
} from "../../assets/js/tools/countdown-timer/timer-engine.js";

const T0 = 1_700_000_000_000;

describe("reading a duration", () => {
  test("hours, minutes and seconds add up; blank is zero", () => {
    assert.deepEqual(parseDuration({ hours: "1", minutes: "25", seconds: "30" }), { status: "ok", totalSeconds: 5130 });
    assert.deepEqual(parseDuration({ hours: "", minutes: "10", seconds: "" }), { status: "ok", totalSeconds: 600 });
    assert.deepEqual(parseDuration({ minutes: " 5 " }), { status: "ok", totalSeconds: 300 });
    assert.deepEqual(parseDuration({ seconds: "0010" }), { status: "ok", totalSeconds: 10 });
  });

  test("any amount in any field is normalised by the total (90 seconds is 1 minute 30 seconds)", () => {
    assert.equal(parseDuration({ seconds: "90" }).totalSeconds, 90);
    assert.deepEqual(splitSeconds(90), { hours: 0, minutes: 1, seconds: 30 });
    assert.deepEqual(splitSeconds(86400), { hours: 24, minutes: 0, seconds: 0 });
    assert.deepEqual(splitSeconds(3661), { hours: 1, minutes: 1, seconds: 1 });
    assert.equal(parseDuration({ minutes: "120" }).totalSeconds, 7200);
  });

  test("all zero or all blank is an instruction, not a timer", () => {
    for (const input of [{}, { hours: "", minutes: "", seconds: "" }, { hours: "0", minutes: "0", seconds: "0" }]) {
      const r = parseDuration(input);
      assert.equal(r.status, "empty");
      assert.match(r.message, /above zero/);
    }
  });

  test("the maximum is 24 hours: reached exactly, refused one second beyond", () => {
    assert.equal(LIMITS.maxSeconds, 86400);
    assert.equal(parseDuration({ hours: "24" }).status, "ok");
    assert.equal(parseDuration({ hours: "23", minutes: "59", seconds: "60" }).status, "ok");
    assert.equal(parseDuration({ hours: "24", seconds: "1" }).status, "too-long");
    assert.equal(parseDuration({ hours: "99999" }).status, "too-long");
    assert.equal(parseDuration({ seconds: "86401" }).status, "too-long");
    assert.match(parseDuration({ hours: "25" }).message, /24 hours/);
  });

  test("negative, decimal, exponent, signed, separated or non-numeric input names the field and starts nothing", () => {
    for (const bad of ["-1", "1.5", "1e3", "+3", "1,000", "abc", "NaN", "Infinity", "0x10", "123456"]) {
      const r = parseDuration({ hours: "0", minutes: bad, seconds: "5" });
      assert.equal(r.status, "invalid", bad);
      assert.deepEqual(r.errors.map((e) => e.field), ["minutes"], bad);
      assert.doesNotMatch(r.errors[0].message, /NaN|undefined/);
    }
    assert.deepEqual(parseDuration({ hours: "x", minutes: "-1", seconds: "2.5" }).errors.map((e) => e.field), ["hours", "minutes", "seconds"]);
  });

  test("the presets are valid, ordered and few", () => {
    assert.deepEqual(PRESETS.map((p) => p.label), ["1 min", "5 min", "10 min", "25 min", "30 min", "60 min"]);
    for (const p of PRESETS) assert.equal(parseDuration(splitSecondsAsText(p.seconds)).totalSeconds, p.seconds);
    assert.deepEqual(PRESETS.map((p) => p.seconds), [...PRESETS.map((p) => p.seconds)].sort((a, b) => a - b));
  });
});

function splitSecondsAsText(total) {
  const s = splitSeconds(total);
  return { hours: String(s.hours), minutes: String(s.minutes), seconds: String(s.seconds) };
}

describe("start, run and finish", () => {
  test("a new timer is idle with nothing left", () => {
    assert.deepEqual(createTimer(), { status: "idle", totalMs: 0, remainingMs: 0, endAt: null });
    assert.deepEqual(reset(), createTimer());
  });

  test("starting sets an end time; the time left is end - now, not a count", () => {
    const t = start(createTimer(), 10, T0);
    assert.equal(t.status, "running");
    assert.equal(t.endAt, T0 + 10_000);
    assert.equal(remainingAt(t, T0), 10_000);
    assert.equal(remainingAt(t, T0 + 1), 9_999);
    assert.equal(remainingAt(t, T0 + 9_999), 1);
  });

  test("it finishes at exactly the end time and never goes negative", () => {
    const t = start(createTimer(), 10, T0);
    assert.equal(tick(t, T0 + 9_999).status, "running");
    const done = tick(t, T0 + 10_000);
    assert.deepEqual([done.status, done.remainingMs, done.endAt], ["finished", 0, null]);
    const late = tick(t, T0 + 10_000_000);
    assert.deepEqual([late.status, late.remainingMs], ["finished", 0]);
    assert.equal(remainingAt(t, T0 + 10_000_000), 0);
    assert.equal(formatClock(remainingAt(t, T0 + 10_000_000)), "00:00");
  });

  test("a finished or idle timer is left alone by tick, pause and resume", () => {
    const done = tick(start(createTimer(), 5, T0), T0 + 5000);
    assert.equal(tick(done, T0 + 9999), done);
    assert.equal(pause(done, T0 + 9999), done);
    assert.equal(resume(done, T0 + 9999), done);
    const idle = createTimer();
    assert.equal(tick(idle, T0), idle);
    assert.equal(pause(idle, T0), idle);
    assert.equal(resume(idle, T0), idle);
  });
});

describe("background tabs: the time is right however rarely the timer was ticked", () => {
  test("one look after a long gap equals the true elapsed time (no tick ran in between)", () => {
    const t = start(createTimer(), 600, T0);
    // the tab was hidden for 4 minutes 7 seconds: no tick ran; the first look still reads the right time
    const seen = tick(t, T0 + 247_000);
    assert.equal(seen.status, "running");
    assert.equal(seen.remainingMs, 353_000);
    assert.equal(formatClock(seen.remainingMs), "05:53");
  });

  test("a timer that ran out while hidden is finished on the first look", () => {
    const t = start(createTimer(), 30, T0);
    const seen = tick(t, T0 + 3_600_000);
    assert.deepEqual([seen.status, seen.remainingMs], ["finished", 0]);
  });

  test("ticking often and ticking once give the same answer", () => {
    let often = start(createTimer(), 100, T0);
    for (let ms = 250; ms <= 61_000; ms += 250) often = tick(often, T0 + ms);
    const once = tick(start(createTimer(), 100, T0), T0 + 61_000);
    assert.equal(often.remainingMs, once.remainingMs);
    assert.equal(often.remainingMs, 39_000);
  });
});

describe("pause and resume", () => {
  test("pause keeps the exact time left; the clock moving on changes nothing", () => {
    const running = start(createTimer(), 60, T0);
    const paused = pause(running, T0 + 20_500);
    assert.equal(paused.status, "paused");
    assert.equal(paused.remainingMs, 39_500);
    assert.equal(paused.endAt, null);
    assert.equal(remainingAt(paused, T0 + 999_999_999), 39_500);
    assert.equal(tick(paused, T0 + 999_999_999), paused);
  });

  test("resume sets a new end time from the stored time left", () => {
    const paused = pause(start(createTimer(), 60, T0), T0 + 20_500);
    const resumed = resume(paused, T0 + 100_000);
    assert.equal(resumed.status, "running");
    assert.equal(resumed.endAt, T0 + 100_000 + 39_500);
    assert.equal(remainingAt(resumed, T0 + 100_000), 39_500);
  });

  test("many pause/resume cycles lose nothing and add nothing: only running time is spent", () => {
    let t = start(createTimer(), 300, T0);
    let clock = T0;
    let spent = 0;
    for (let i = 0; i < 40; i++) {
      const run = 1_000 + (i * 137) % 900; // ms running
      clock += run;
      spent += run;
      t = pause(t, clock);
      clock += 5_000 + i * 321; // time spent paused, any length
      t = resume(t, clock);
    }
    assert.equal(remainingAt(t, clock), 300_000 - spent);
    assert.equal(t.status, "running");
  });

  test("pausing a timer that already ran out finishes it instead of pausing it", () => {
    const t = start(createTimer(), 5, T0);
    const after = pause(t, T0 + 60_000);
    assert.deepEqual([after.status, after.remainingMs], ["finished", 0]);
  });

  test("pausing and resuming at the same instant changes nothing", () => {
    const t = start(createTimer(), 90, T0);
    const same = resume(pause(t, T0 + 10_000), T0 + 10_000);
    assert.equal(same.endAt, t.endAt);
  });
});

describe("the display", () => {
  test("mm:ss under an hour and hh:mm:ss from an hour; a part of a second counts as the second", () => {
    assert.equal(formatClock(25 * 60_000), "25:00");
    assert.equal(formatClock(10_000), "00:10");
    assert.equal(formatClock(9_001), "00:10");
    assert.equal(formatClock(9_000), "00:09");
    assert.equal(formatClock(1), "00:01");
    assert.equal(formatClock(0), "00:00");
    assert.equal(formatClock(3_600_000), "01:00:00");
    assert.equal(formatClock(3_599_001), "01:00:00");
    assert.equal(formatClock(5_130_000), "01:25:30");
    assert.equal(formatClock(86_400_000), "24:00:00");
  });

  test("never negative, NaN or undefined", () => {
    for (const bad of [-5, -1, -1e9, 0]) assert.equal(formatClock(bad), "00:00");
    assert.doesNotMatch(formatClock(0), /NaN|undefined|-/);
  });

  test("duration in words", () => {
    assert.equal(durationWords(10), "10 seconds");
    assert.equal(durationWords(1), "1 second");
    assert.equal(durationWords(90), "1 minute and 30 seconds");
    assert.equal(durationWords(3600), "1 hour");
    assert.equal(durationWords(5130), "1 hour, 25 minutes and 30 seconds");
    assert.equal(durationWords(0), "0 seconds");
  });
});
