/**
 * Tool Pack 34: the shared timer-cycle engine (Pomodoro Focus Timer and Interval Timer), with a fake clock.
 *
 * The reference is deliberately naive: the sequence is expanded into one entry per second and a phase is found by indexing that
 * array, so it shares no search or arithmetic with the engine's binary search over start times. Run with:
 *   node --test tests/unit/timer-cycle.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LIMITS,
  POMODORO_DEFAULTS,
  INTERVAL_PRESETS,
  parseWhole,
  buildSequence,
  pomodoroSequence,
  intervalSequence,
  phaseAt,
  phaseAfter,
  focusEndsBy,
  createRunner,
  elapsedAt,
  start,
  pause,
  resume,
  tick,
  skip,
  completedFocus,
  sessionRemainingMs,
  formatRemaining,
  spokenSeconds,
} from "../../assets/js/tools/timer-cycle/cycle-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/* one entry per second: the index of the phase that second belongs to */
function expand(phases) {
  const perSecond = [];
  phases.forEach((phase, index) => {
    for (let s = 0; s < phase.seconds; s++) perSecond.push(index);
  });
  return perSecond;
}

describe("phaseAt against a per-second reference", () => {
  const cases = [
    [{ label: "a", kind: "work", seconds: 3 }, { label: "b", kind: "rest", seconds: 2 }, { label: "c", kind: "work", seconds: 1 }],
    [{ label: "x", kind: "focus", seconds: 7 }],
    [{ label: "f", kind: "focus", seconds: 5 }, { label: "s", kind: "short", seconds: 2 }, { label: "f", kind: "focus", seconds: 5 }, { label: "l", kind: "long", seconds: 3 }],
  ];

  test("a sequence that runs once: every second and every millisecond edge", () => {
    for (const phases of cases) {
      const sequence = buildSequence(phases);
      const reference = expand(phases);
      for (let s = 0; s < reference.length; s++) {
        for (const ms of [0, 1, 500, 999]) {
          const at = phaseAt(sequence, s * 1000 + ms);
          assert.equal(at.done, false);
          assert.equal(at.index, reference[s], `${s}s+${ms}`);
          assert.equal(at.remainingMs, at.endMs - (s * 1000 + ms));
          assert.ok(at.remainingMs > 0 && at.remainingMs <= at.phase.ms);
        }
      }
      assert.equal(phaseAt(sequence, reference.length * 1000).done, true);
      assert.equal(phaseAt(sequence, reference.length * 1000 - 1).done, false);
    }
  });

  test("a sequence that repeats: three full periods", () => {
    for (const phases of cases) {
      const sequence = buildSequence(phases, { repeat: true });
      const reference = expand(phases);
      for (let s = 0; s < reference.length * 3; s++) {
        const at = phaseAt(sequence, s * 1000);
        assert.equal(at.index, reference[s % reference.length], `${s}s`);
        assert.equal(at.cycle, Math.floor(s / reference.length));
        assert.equal(at.absolute, at.cycle * phases.length + at.index);
        assert.equal(at.done, false);
      }
    }
  });

  test("negative elapsed time is treated as zero", () => {
    assert.equal(phaseAt(buildSequence(cases[0]), -50).index, 0);
  });

  test("the phase after", () => {
    const once = buildSequence(cases[0]);
    assert.equal(phaseAfter(once, 0).label, "b");
    assert.equal(phaseAfter(once, 2), null);
    const repeating = buildSequence(cases[0], { repeat: true });
    assert.equal(phaseAfter(repeating, 2).label, "a");
    assert.equal(phaseAfter(repeating, 3).label, "b");
  });
});

describe("the Pomodoro sequence", () => {
  const settings = { focus: "25", short: "5", long: "15", every: "4" };

  test("25 / 5 / 15 every 4 is focus, short, focus, short, focus, short, focus, long", () => {
    const r = pomodoroSequence(settings);
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequence.phases.map((p) => p.kind), ["focus", "short", "focus", "short", "focus", "short", "focus", "long"]);
    assert.equal(r.sequence.period, (4 * 25 + 3 * 5 + 15) * 60000);
    assert.equal(r.sequence.repeat, true);
    assert.equal(r.sequence.focusPerPeriod, 4);
    assert.deepEqual(POMODORO_DEFAULTS, { focus: 25, short: 5, long: 15, every: 4 });
  });

  test("a long break after 2 focus periods", () => {
    const r = pomodoroSequence({ ...settings, every: "2" });
    assert.deepEqual(r.sequence.phases.map((p) => p.kind), ["focus", "short", "focus", "long"]);
  });

  test("invalid settings are named, field by field", () => {
    const r = pomodoroSequence({ focus: "0", short: "x", long: "61", every: "1" });
    assert.equal(r.ok, false);
    assert.deepEqual(r.errors.map((e) => e.field), ["focus", "short", "long", "every"]);
    assert.match(r.errors[0].message, /Focus minutes: enter a whole number from 1 to 120/);
    assert.equal(pomodoroSequence({ ...settings, focus: "120", every: "10" }).ok, true);
    assert.equal(pomodoroSequence({ ...settings, focus: "121" }).ok, false);
    assert.equal(pomodoroSequence({ ...settings, focus: "1.5" }).ok, false);
    assert.equal(pomodoroSequence({ ...settings, focus: "" }).ok, false);
  });
});

describe("the Interval sequence", () => {
  const tabata = { prep: 10, stages: [{ label: "Work", kind: "work", seconds: 20 }, { label: "Rest", kind: "rest", seconds: 10 }], rounds: "8", cool: 0 };

  test("Tabata: get ready, then 8 rounds, with no rest after the last work", () => {
    const r = intervalSequence(tabata);
    assert.equal(r.ok, true);
    assert.equal(r.sequence.phases.length, 1 + 8 * 2 - 1);
    assert.equal(r.totalSeconds, 10 + 8 * 20 + 7 * 10);
    assert.equal(r.sequence.phases[0].kind, "prep");
    assert.equal(r.sequence.phases.at(-1).kind, "work");
    assert.equal(r.sequence.phases.at(-1).round, 8);
    assert.equal(r.sequence.total, r.totalSeconds * 1000);
  });

  test("a zero-length stage is left out; a cool-down follows the last work", () => {
    const r = intervalSequence({ prep: 0, stages: [{ label: "Work", kind: "work", seconds: 60 }, { label: "Rest", kind: "rest", seconds: 0 }], rounds: "3", cool: 30 });
    assert.deepEqual(r.sequence.phases.map((p) => p.kind), ["work", "work", "work", "cool"]);
  });

  test("a routine of named stages repeats in order", () => {
    const r = intervalSequence({
      prep: 0,
      stages: [{ label: "Squats", kind: "work", seconds: 30 }, { label: "Plank", kind: "work", seconds: 45 }, { label: "Rest", kind: "rest", seconds: 15 }],
      rounds: "2",
      cool: 0,
    });
    assert.deepEqual(r.sequence.phases.map((p) => p.label), ["Squats", "Plank", "Rest", "Squats", "Plank"]);
  });

  test("the presets are all valid sequences", () => {
    for (const p of INTERVAL_PRESETS) {
      const r = intervalSequence({ prep: p.prep, stages: [{ label: "Work", kind: "work", seconds: p.work }, { label: "Rest", kind: "rest", seconds: p.rest }], rounds: String(p.rounds), cool: p.cool });
      assert.equal(r.ok, true, p.id);
    }
  });

  test("invalid input is named", () => {
    const bad = intervalSequence({ prep: 0, stages: [{ label: "Work", kind: "work", seconds: 0 }, { label: "Rest", kind: "rest", seconds: 10 }], rounds: "3", cool: 0 });
    assert.equal(bad.ok, false);
    assert.match(bad.errors[0].message, /at least one work stage/);
    assert.equal(intervalSequence({ ...tabata, rounds: "0" }).ok, false);
    assert.equal(intervalSequence({ ...tabata, rounds: "100" }).ok, false);
    assert.equal(intervalSequence({ ...tabata, prep: -1 }).ok, false);
    assert.equal(intervalSequence({ ...tabata, stages: [{ label: "W", kind: "work", seconds: 3601 }] }).ok, false);
    assert.equal(intervalSequence({ ...tabata, stages: Array.from({ length: 9 }, () => ({ label: "W", kind: "work", seconds: 5 })) }).ok, false);
  });

  test("a session over 10 hours or 2000 stages is refused with a reason", () => {
    const long = intervalSequence({ prep: 0, stages: [{ label: "Work", kind: "work", seconds: 3600 }], rounds: "11", cool: 0 });
    assert.equal(long.ok, false);
    assert.match(long.errors[0].message, /at most 2000 stages in all and last at most 10 hours/);
    const many = intervalSequence({ prep: 0, stages: Array.from({ length: 8 }, (_, i) => ({ label: `S${i}`, kind: "work", seconds: 1 })), rounds: "99", cool: 0 });
    assert.equal(many.ok, true);
    assert.equal(many.sequence.phases.length, 8 * 99);
  });

  test("whole-number reading", () => {
    assert.deepEqual(parseWhole(" 12 ", { min: 1, max: 99 }, "Rounds"), { state: "valid", value: 12 });
    for (const bad of ["", "0", "100", "-3", "1e1", "2.5", "abc"]) assert.equal(parseWhole(bad, { min: 1, max: 99 }, "Rounds").state, "invalid", bad);
  });
});

describe("the runner on a fake clock", () => {
  const phases = [
    { label: "Focus", kind: "focus", seconds: 10 },
    { label: "Short break", kind: "short", seconds: 4 },
    { label: "Focus", kind: "focus", seconds: 10 },
    { label: "Long break", kind: "long", seconds: 6 },
  ];
  const repeating = buildSequence(phases, { repeat: true });
  const once = buildSequence(phases);

  test("start, run, pause and resume: paused time is not counted", () => {
    let r = createRunner();
    assert.equal(r.status, "idle");
    r = start(r, 1000);
    assert.equal(elapsedAt(r, 4000), 3000);
    r = pause(r, 4000);
    assert.equal(r.status, "paused");
    assert.equal(elapsedAt(r, 99999), 3000);
    r = resume(r, 100000);
    assert.equal(elapsedAt(r, 102000), 5000);
    assert.equal(phaseAt(repeating, elapsedAt(r, 102000)).phase.label, "Focus");
  });

  test("pausing and resuming 60 times does not drift", () => {
    let r = start(createRunner(), 0);
    let now = 0;
    for (let i = 0; i < 60; i++) {
      now += 100;
      r = pause(r, now);
      now += 7777;
      r = resume(r, now);
    }
    now += 100;
    assert.equal(elapsedAt(r, now), 61 * 100);
  });

  test("auto: a 10-minute hidden tab lands on the right phase at once", () => {
    let r = start(createRunner(), 0);
    r = tick(r, repeating, 600000, true);
    assert.equal(r.status, "running");
    const e = elapsedAt(r, 600000);
    assert.equal(e, 600000);
    const at = phaseAt(repeating, e);
    assert.equal(at.cycle, 20);
    assert.equal(at.index, 0);
    assert.equal(completedFocus(r, repeating, 600000), 40);
  });

  test("not auto: the timer stops at the end of the phase and waits, however late the tick comes", () => {
    let r = start(createRunner(), 0);
    r = tick(r, repeating, 9999, false);
    assert.equal(r.status, "running");
    r = tick(r, repeating, 600000, false);
    assert.equal(r.status, "waiting");
    assert.equal(r.accumulatedMs, 10000);
    assert.equal(elapsedAt(r, 700000), 10000);
    assert.equal(phaseAt(repeating, r.accumulatedMs).phase.label, "Short break");
    assert.equal(completedFocus(r, repeating, 700000), 1);
    r = resume(r, 700000);
    assert.equal(r.status, "running");
    assert.equal(elapsedAt(r, 701000), 11000);
  });

  test("not auto: pausing mid-phase and resuming still stops at the end of that phase", () => {
    let r = start(createRunner(), 0);
    r = pause(r, 4000);
    r = resume(r, 50000);
    r = tick(r, repeating, 55000, false);
    assert.equal(r.status, "running");
    r = tick(r, repeating, 56000, false);
    assert.equal(r.status, "waiting");
    assert.equal(r.accumulatedMs, 10000);
  });

  test("a sequence that runs once ends in done, with the full length", () => {
    let r = start(createRunner(), 0);
    r = tick(r, once, 29999, true);
    assert.equal(r.status, "running");
    assert.equal(sessionRemainingMs(r, once, 29999), 1);
    r = tick(r, once, 90000, true);
    assert.equal(r.status, "done");
    assert.equal(r.accumulatedMs, once.total);
    assert.equal(sessionRemainingMs(r, once, 90000), 0);
    assert.equal(completedFocus(r, once, 90000), 2);
    assert.equal(sessionRemainingMs(start(createRunner(), 0), repeating, 5), null);
  });

  test("not auto: the last phase of a one-off sequence ends in done, not waiting", () => {
    const short = buildSequence([{ label: "a", kind: "work", seconds: 5 }]);
    let r = start(createRunner(), 0);
    r = tick(r, short, 7000, false);
    assert.equal(r.status, "done");
  });

  test("skip moves to the next phase; a skipped focus period is not counted", () => {
    let r = start(createRunner(), 0);
    r = skip(r, repeating, 3000);
    assert.equal(elapsedAt(r, 3000), 10000);
    assert.equal(phaseAt(repeating, elapsedAt(r, 3000)).phase.label, "Short break");
    assert.equal(completedFocus(r, repeating, 3000), 0);
    assert.equal(r.skippedFocus, 1);
    r = skip(r, repeating, 4000);
    assert.equal(phaseAt(repeating, elapsedAt(r, 4000)).phase.label, "Focus");
    assert.equal(r.skippedFocus, 1);
    r = tick(r, repeating, 4000 + 10000, true);
    assert.equal(completedFocus(r, repeating, 14000), 1);
  });

  test("skip while paused, and skip is refused when idle, waiting or done", () => {
    let r = start(createRunner(), 0);
    r = pause(r, 2000);
    r = skip(r, repeating, 9000);
    assert.equal(r.status, "paused");
    assert.equal(r.accumulatedMs, 10000);
    assert.equal(skip(createRunner(), repeating, 0).status, "idle");
    const waiting = tick(start(createRunner(), 0), repeating, 20000, false);
    assert.equal(skip(waiting, repeating, 20000), waiting);
  });

  test("skip on the last phase of a one-off sequence finishes it", () => {
    let r = start(createRunner(), 0);
    r = tick(r, once, 25000, true);
    r = skip(r, once, 25000);
    assert.equal(r.status, "done");
  });

  test("focus periods ended, by arithmetic, including many cycles", () => {
    assert.equal(focusEndsBy(repeating, 0), 0);
    assert.equal(focusEndsBy(repeating, 9999), 0);
    assert.equal(focusEndsBy(repeating, 10000), 1);
    assert.equal(focusEndsBy(repeating, 28000), 2);
    assert.equal(focusEndsBy(repeating, 30000), 2);
    assert.equal(focusEndsBy(repeating, 30000 * 100 + 10000), 201);
    assert.equal(focusEndsBy(once, 1e12), 2);
    assert.equal(focusEndsBy(buildSequence([{ label: "r", kind: "rest", seconds: 4 }]), 10000), 0);
  });

  test("reset is a fresh runner", () => {
    const r = createRunner();
    assert.deepEqual(r, { status: "idle", accumulatedMs: 0, startedAt: 0, skippedFocus: 0 });
    assert.equal(pause(r, 5), r);
    assert.equal(resume(r, 5), r);
    assert.equal(start(start(r, 5), 99).startedAt, 5);
  });
});

describe("formatting", () => {
  test("time left rounds up, so a full phase shows its full length", () => {
    assert.equal(formatRemaining(25 * 60000), "25:00");
    assert.equal(formatRemaining(25 * 60000 - 1), "25:00");
    assert.equal(formatRemaining(1), "00:01");
    assert.equal(formatRemaining(0), "00:00");
    assert.equal(formatRemaining(3600000), "1:00:00");
    assert.equal(formatRemaining(-5), "00:00");
  });

  test("spoken seconds", () => {
    assert.equal(spokenSeconds(1), "1 second");
    assert.equal(spokenSeconds(90), "1 minute 30 seconds");
    assert.equal(spokenSeconds(3600), "1 hour");
    assert.equal(spokenSeconds(0), "0 seconds");
  });

  test("the engine imports nothing from the browser", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "tools", "timer-cycle", "cycle-engine.js"), "utf8");
    for (const banned of ["document.", "window.", "fetch(", "localStorage", "new Date(", "Date.now", "performance.", "setTimeout", "setInterval"]) assert.equal(source.includes(banned), false, banned);
    assert.equal(LIMITS.pomodoro.every.max, 10);
  });
});
