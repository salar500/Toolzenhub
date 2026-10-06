/**
 * Tool Pack 14: the Stopwatch rules (assets/js/tools/stopwatch/stopwatch-engine.js), driven by a fake monotonic clock.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_LAPS,
  MAX_ELAPSED_MS,
  createStopwatch,
  elapsedAt,
  start,
  pause,
  resume,
  tick,
  reset,
  lap,
  canLap,
  lapLimitReached,
  currentLapTenths,
  lapExtremes,
  tenthsOf,
  formatTenths,
  formatElapsed,
  formatWhole,
} from "../../assets/js/tools/stopwatch/stopwatch-engine.js";

const T0 = 5_000; // a monotonic clock starts near zero, not at the epoch

describe("the initial state and starting", () => {
  test("a new stopwatch is idle at zero with no laps", () => {
    assert.deepEqual(createStopwatch(), { status: "idle", accumulatedMs: 0, startedAt: null, laps: [], reachedMax: false });
    assert.equal(elapsedAt(createStopwatch(), T0), 0);
    assert.deepEqual(reset(), createStopwatch());
  });

  test("start begins a segment; elapsed is now minus the segment start", () => {
    const sw = start(createStopwatch(), T0);
    assert.equal(sw.status, "running");
    assert.equal(elapsedAt(sw, T0), 0);
    assert.equal(elapsedAt(sw, T0 + 1), 1);
    assert.equal(elapsedAt(sw, T0 + 12_345), 12_345);
  });

  test("starting again, pausing, resuming and lapping an idle stopwatch change nothing", () => {
    const idle = createStopwatch();
    assert.equal(pause(idle, T0), idle);
    assert.equal(resume(idle, T0), idle);
    assert.equal(lap(idle, T0), idle);
    assert.equal(tick(idle, T0), idle);
    const running = start(idle, T0);
    assert.equal(start(running, T0 + 5), running);
    assert.equal(resume(running, T0 + 5), running);
  });

  test("a clock reading before the segment start never makes the time negative", () => {
    const sw = start(createStopwatch(), T0);
    assert.equal(elapsedAt(sw, T0 - 50), 0);
  });
});

describe("pause and resume", () => {
  test("pause freezes the elapsed time; the clock moving on changes nothing", () => {
    const paused = pause(start(createStopwatch(), T0), T0 + 4_250);
    assert.equal(paused.status, "paused");
    assert.equal(paused.accumulatedMs, 4_250);
    assert.equal(paused.startedAt, null);
    assert.equal(elapsedAt(paused, T0 + 999_999), 4_250);
    assert.equal(tick(paused, T0 + 999_999), paused);
  });

  test("resume starts a new segment on top of what was kept", () => {
    const paused = pause(start(createStopwatch(), T0), T0 + 4_250);
    const resumed = resume(paused, T0 + 100_000);
    assert.equal(resumed.status, "running");
    assert.equal(elapsedAt(resumed, T0 + 100_000), 4_250);
    assert.equal(elapsedAt(resumed, T0 + 101_750), 6_000);
  });

  test("many pause/resume cycles: elapsed is exactly the time spent running, however long the pauses", () => {
    let sw = start(createStopwatch(), T0);
    let clock = T0;
    let running = 0;
    for (let i = 0; i < 60; i++) {
      const run = 300 + ((i * 137) % 900);
      clock += run;
      running += run;
      sw = pause(sw, clock);
      clock += 1_000 + i * 733; // paused for any length
      sw = resume(sw, clock);
    }
    assert.equal(elapsedAt(sw, clock), running);
  });

  test("pausing and resuming at the same instant changes nothing", () => {
    const sw = start(createStopwatch(), T0);
    const same = resume(pause(sw, T0 + 777), T0 + 777);
    assert.equal(elapsedAt(same, T0 + 777), 777);
  });
});

describe("a background tab: one late look is exact", () => {
  test("elapsed after a long gap with no ticks in between equals the real time", () => {
    const sw = start(createStopwatch(), T0);
    assert.equal(elapsedAt(sw, T0 + 3_723_400), 3_723_400);
    assert.equal(formatElapsed(elapsedAt(sw, T0 + 3_723_400)), "1:02:03.4");
  });

  test("laps taken before and after a long unobserved gap are right", () => {
    let sw = start(createStopwatch(), T0);
    sw = lap(sw, T0 + 10_000);
    sw = lap(sw, T0 + 10_000 + 7_200_000); // two hours later, nothing repainted in between
    assert.deepEqual(sw.laps.map((l) => [l.number, l.lapTenths, l.totalTenths]), [[1, 100, 100], [2, 72_000, 72_100]]); // 2 h = 72,000 tenths
  });
});

describe("laps and splits", () => {
  test("a lap is the time since the previous lap; the split is the total at that moment", () => {
    let sw = start(createStopwatch(), T0);
    sw = lap(sw, T0 + 42_180); // 42.1 s (rounded down)
    sw = lap(sw, T0 + 125_440); // 2:05.4 total, a lap of 83.3 s
    assert.deepEqual(sw.laps, [
      { number: 1, lapTenths: 421, totalTenths: 421 },
      { number: 2, lapTenths: 833, totalTenths: 1254 },
    ]);
    assert.equal(formatTenths(sw.laps[0].lapTenths), "00:42.1");
    assert.equal(formatTenths(sw.laps[1].lapTenths), "01:23.3");
    assert.equal(formatTenths(sw.laps[1].totalTenths), "02:05.4");
  });

  test("lap times add up exactly to the last total shown (they are differences of displayed totals)", () => {
    let sw = start(createStopwatch(), T0);
    let clock = T0;
    for (let i = 0; i < 40; i++) {
      clock += 777 + i * 91;
      sw = lap(sw, clock);
    }
    const sum = sw.laps.reduce((total, l) => total + l.lapTenths, 0);
    assert.equal(sum, sw.laps[sw.laps.length - 1].totalTenths);
    assert.deepEqual(sw.laps.map((l) => l.number), Array.from({ length: 40 }, (_, i) => i + 1));
  });

  test("laps continue across a pause: only running time counts, and the first lap after resume is right", () => {
    let sw = start(createStopwatch(), T0);
    sw = lap(sw, T0 + 10_000);
    sw = pause(sw, T0 + 15_000);
    sw = resume(sw, T0 + 500_000);
    sw = lap(sw, T0 + 505_000); // 5 s more of running time: 15 s total
    assert.deepEqual(sw.laps.map((l) => [l.lapTenths, l.totalTenths]), [[100, 100], [100, 200]]); // lap 1 at 10 s; 5 s more running after the pause is 20 s in total, so lap 2 is 10 s
  });

  test("a lap needs a running stopwatch", () => {
    const paused = pause(start(createStopwatch(), T0), T0 + 1000);
    assert.equal(canLap(paused), false);
    assert.equal(lap(paused, T0 + 2000), paused);
    assert.equal(canLap(start(createStopwatch(), T0)), true);
  });

  test("the lap in progress is shown separately and is not a recorded lap", () => {
    let sw = start(createStopwatch(), T0);
    assert.equal(currentLapTenths(sw, T0 + 5_000), 50);
    sw = lap(sw, T0 + 5_000);
    assert.equal(currentLapTenths(sw, T0 + 5_000), 0);
    assert.equal(currentLapTenths(sw, T0 + 8_400), 34);
    assert.equal(sw.laps.length, 1);
  });

  test("two laps taken at the same instant: the second is zero, never negative", () => {
    let sw = start(createStopwatch(), T0);
    sw = lap(sw, T0 + 3_000);
    sw = lap(sw, T0 + 3_000);
    assert.deepEqual(sw.laps.map((l) => l.lapTenths), [30, 0]);
  });

  test("the lap list is limited, cleanly: at the limit a lap changes nothing", () => {
    assert.equal(MAX_LAPS, 100);
    let sw = start(createStopwatch(), T0);
    for (let i = 1; i <= MAX_LAPS; i++) sw = lap(sw, T0 + i * 1000);
    assert.equal(sw.laps.length, 100);
    assert.equal(lapLimitReached(sw), true);
    assert.equal(canLap(sw), false);
    assert.equal(lap(sw, T0 + 999_000), sw);
    assert.equal(sw.laps[99].number, 100);
    // timing itself carries on
    assert.equal(elapsedAt(sw, T0 + 200_000), 200_000);
  });
});

describe("fastest and slowest", () => {
  const mk = (...times) => times.map((lapTenths, i) => ({ number: i + 1, lapTenths, totalTenths: 0 }));

  test("none with fewer than two laps", () => {
    assert.deepEqual(lapExtremes([]), { fastest: [], slowest: [] });
    assert.deepEqual(lapExtremes(mk(100)), { fastest: [], slowest: [] });
  });

  test("two or more different laps: the shortest is fastest, the longest slowest", () => {
    assert.deepEqual(lapExtremes(mk(300, 200)), { fastest: [2], slowest: [1] });
    assert.deepEqual(lapExtremes(mk(300, 200, 450, 210)), { fastest: [2], slowest: [3] });
  });

  test("equal laps share a mark; all laps equal means no marks", () => {
    assert.deepEqual(lapExtremes(mk(200, 300, 200, 300)), { fastest: [1, 3], slowest: [2, 4] });
    assert.deepEqual(lapExtremes(mk(250, 250, 250)), { fastest: [], slowest: [] });
  });
});

describe("reset and the limit", () => {
  test("reset from any state returns to idle at zero with no laps and no marks", () => {
    let sw = start(createStopwatch(), T0);
    sw = lap(lap(sw, T0 + 1000), T0 + 2500);
    for (const state of [sw, pause(sw, T0 + 3000)]) {
      const fresh = reset(state);
      assert.deepEqual(fresh, createStopwatch());
      assert.deepEqual(lapExtremes(fresh.laps), { fastest: [], slowest: [] });
      assert.equal(elapsedAt(fresh, T0 + 99_999), 0);
    }
  });

  test("it stops by itself at 99:59:59.9 and does not run past it", () => {
    assert.equal(formatElapsed(MAX_ELAPSED_MS), "99:59:59.9");
    const sw = start(createStopwatch(), T0);
    assert.equal(tick(sw, T0 + MAX_ELAPSED_MS - 1), sw);
    const stopped = tick(sw, T0 + MAX_ELAPSED_MS + 5_000_000);
    assert.deepEqual([stopped.status, stopped.accumulatedMs, stopped.reachedMax], ["paused", MAX_ELAPSED_MS, true]);
    assert.equal(elapsedAt(sw, T0 + 10 * MAX_ELAPSED_MS), MAX_ELAPSED_MS); // even before a tick, the reading is capped
    assert.equal(resume(stopped, T0 + 1), stopped); // nothing more to measure
    assert.equal(formatElapsed(elapsedAt(stopped, T0 + 1)), "99:59:59.9");
  });
});

describe("the display", () => {
  test("mm:ss.t under an hour, h:mm:ss.t from an hour, rounded down", () => {
    assert.equal(formatElapsed(0), "00:00.0");
    assert.equal(formatElapsed(99), "00:00.0");
    assert.equal(formatElapsed(100), "00:00.1");
    assert.equal(formatElapsed(59_999), "00:59.9");
    assert.equal(formatElapsed(60_000), "01:00.0");
    assert.equal(formatElapsed(767_300), "12:47.3");
    assert.equal(formatElapsed(3_599_999), "59:59.9");
    assert.equal(formatElapsed(3_600_000), "1:00:00.0");
    assert.equal(formatElapsed(37_230_000), "10:20:30.0");
    assert.equal(tenthsOf(1_999), 19);
  });

  test("never negative, NaN or undefined", () => {
    for (const bad of [-1, -5_000, 0, Number.NaN]) assert.doesNotMatch(formatTenths(bad), /NaN|undefined|-/);
    assert.equal(formatTenths(-4), "00:00.0");
  });

  test("the tab title reads whole seconds", () => {
    assert.equal(formatWhole(12_900), "00:12");
    assert.equal(formatWhole(61_000), "01:01");
    assert.equal(formatWhole(3_600_000), "1:00:00");
    assert.equal(formatWhole(0), "00:00");
  });
});
