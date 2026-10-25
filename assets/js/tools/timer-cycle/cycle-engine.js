/* =========================================================
   ToolZen Hub
   Timer cycles: the shared engine for the Pomodoro Focus Timer
   and the Interval Timer (pure, no DOM, no clock of its own)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   A SEQUENCE is a list of phases (each a label, a kind and a
   length in whole seconds) that either runs once or repeats for
   as long as the timer is left running.

   ONE NUMBER DRIVES EVERYTHING: the elapsed time of the whole
   sequence, in milliseconds. Which phase it is, how long is left
   in it and how many focus periods are done are all worked out
   from that number and the sequence, never counted by ticks. So
   a hidden tab, a slow frame or a missed timer callback cannot
   make the timer wrong: the next read of the clock is right.

   The caller passes in the time (`now`, from a steady clock such
   as the browser's monotonic clock), which makes every rule testable with a
   fake clock. Changing the computer's date or time cannot move a
   steady clock.

   WHAT HAPPENS AT THE END OF A PHASE
     auto = true    the next phase begins at once, in the same
                    running state
     auto = false   the timer stops at the start of the next phase
                    and waits ("waiting") until the person starts it;
                    time spent in a hidden tab past the end of the
                    phase is not carried into the next one
   A sequence that runs once ends in "done".

   SKIP moves to the start of the next phase. A focus period that
   was skipped is not counted as completed.
========================================================= */

export const LIMITS = Object.freeze({
    pomodoro: Object.freeze({
        focus: Object.freeze({ min: 1, max: 120 }),
        short: Object.freeze({ min: 1, max: 60 }),
        long: Object.freeze({ min: 1, max: 60 }),
        every: Object.freeze({ min: 2, max: 10 })
    }),
    interval: Object.freeze({
        seconds: Object.freeze({ min: 1, max: 3600 }),
        rounds: Object.freeze({ min: 1, max: 99 }),
        stages: 8,
        phases: 2000,
        totalSeconds: 36000,
        label: 30
    })
});

export const POMODORO_DEFAULTS = Object.freeze({
    focus: 25,
    short: 5,
    long: 15,
    every: 4
});

export const INTERVAL_PRESETS = Object.freeze([
    Object.freeze({ id: "tabata", name: "Tabata (20 s work, 10 s rest, 8 rounds)", prep: 10, work: 20, rest: 10, rounds: 8, cool: 0 }),
    Object.freeze({ id: "hiit", name: "HIIT (40 s work, 20 s rest, 10 rounds)", prep: 10, work: 40, rest: 20, rounds: 10, cool: 0 }),
    Object.freeze({ id: "emom", name: "EMOM (every minute, 10 rounds)", prep: 10, work: 60, rest: 0, rounds: 10, cool: 0 }),
    Object.freeze({ id: "study", name: "Study blocks (25 min, 5 min rest, 4 rounds)", prep: 0, work: 1500, rest: 300, rounds: 4, cool: 0 })
]);

const SECOND = 1000;


/* =========================================================
   READING WHOLE NUMBERS
   { state: "valid", value } | { state: "invalid", message }
========================================================= */

export function parseWhole(text, { min, max }, noun) {

    const value = String(text ?? "").trim();

    if (!/^\d{1,5}$/.test(value) || Number(value) < min || Number(value) > max) {

        return {
            state: "invalid",
            message: `${noun}: enter a whole number from ${min} to ${max}.`
        };

    }

    return { state: "valid", value: Number(value) };

}


/* =========================================================
   SEQUENCES
========================================================= */

/* phases: [{ label, kind, seconds }]; repeat: true repeats the list for ever */
export function buildSequence(phases, { repeat = false } = {}) {

    const list = phases.map(phase => ({
        label: phase.label,
        kind: phase.kind,
        round: phase.round ?? null,
        ms: phase.seconds * SECOND
    }));

    const starts = [];

    let total = 0;

    for (const phase of list) {
        starts.push(total);
        total += phase.ms;
    }

    return {
        phases: list,
        starts,
        period: total,
        repeat,
        total: repeat ? Infinity : total,
        focusPerPeriod: list.filter(phase => phase.kind === "focus").length
    };

}

/*
 * input: { focus, short, long, every } in minutes (whole numbers).
 * One period is: focus, short, focus, short, ... focus, long.
 * { ok: true, sequence } or { ok: false, errors: [{ field, message }] }
 */
export function pomodoroSequence(input) {

    const fields = [
        ["focus", "Focus minutes", LIMITS.pomodoro.focus],
        ["short", "Short break minutes", LIMITS.pomodoro.short],
        ["long", "Long break minutes", LIMITS.pomodoro.long],
        ["every", "Focus periods before a long break", LIMITS.pomodoro.every]
    ];

    const values = {};
    const errors = [];

    for (const [field, noun, range] of fields) {

        const read = parseWhole(input[field], range, noun);

        if (read.state === "valid") {
            values[field] = read.value;
        } else {
            errors.push({ field, message: read.message });
        }

    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const phases = [];

    for (let n = 1; n <= values.every; n++) {

        phases.push({ label: "Focus", kind: "focus", seconds: values.focus * 60, round: n });

        phases.push(
            n < values.every
                ? { label: "Short break", kind: "short", seconds: values.short * 60 }
                : { label: "Long break", kind: "long", seconds: values.long * 60 }
        );

    }

    return { ok: true, values, sequence: buildSequence(phases, { repeat: true }) };

}

/*
 * input: { prep, stages: [{ label, kind: "work" | "rest", seconds }], rounds, cool }
 * `prep` and `cool` are seconds (0 for none). A stage of 0 seconds is left out.
 * Each round runs every stage in order; the rest that would end the last round is left out,
 * so the session finishes on its last work period. A cool-down, if any, follows.
 * { ok: true, sequence } or { ok: false, errors: [{ field, message }] }
 */
export function intervalSequence(input) {

    const L = LIMITS.interval;
    const errors = [];

    const prep = Number(input.prep) || 0;
    const cool = Number(input.cool) || 0;

    for (const [field, value, noun] of [["prep", prep, "Get ready"], ["cool", cool, "Cool-down"]]) {

        if (!Number.isInteger(value) || value < 0 || value > L.seconds.max) {

            errors.push({
                field,
                message: `${noun}: enter 0 or a whole number of seconds up to ${L.seconds.max}.`
            });

        }

    }

    const rounds = parseWhole(input.rounds, L.rounds, "Rounds");

    if (rounds.state === "invalid") {
        errors.push({ field: "rounds", message: rounds.message });
    }

    const stages = [];

    (input.stages ?? []).forEach((stage, index) => {

        const label = String(stage.label ?? "").trim().slice(0, L.label);
        const seconds = Number(stage.seconds);

        if (!Number.isInteger(seconds) || seconds < 0 || seconds > L.seconds.max) {

            errors.push({
                field: `stage-${index}`,
                message: `${label || `Stage ${index + 1}`}: enter 0 or a whole number of seconds up to ${L.seconds.max}.`
            });

            return;

        }

        if (seconds > 0) {
            stages.push({
                label: label || (stage.kind === "rest" ? "Rest" : "Work"),
                kind: stage.kind === "rest" ? "rest" : "work",
                seconds
            });
        }

    });

    if (errors.length === 0 && !stages.some(stage => stage.kind === "work")) {
        errors.push({ field: "stage-0", message: "Add at least one work stage longer than 0 seconds." });
    }

    if (stages.length > L.stages) {
        errors.push({ field: "stages", message: `Use at most ${L.stages} stages.` });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const phases = [];

    if (prep > 0) {
        phases.push({ label: "Get ready", kind: "prep", seconds: prep });
    }

    for (let round = 1; round <= rounds.value; round++) {

        for (const stage of stages) {
            phases.push({ ...stage, round });
        }

    }

    /* the rest that would end the last round is left out */
    while (phases.length > 0 && phases[phases.length - 1].kind === "rest") {
        phases.pop();
    }

    if (cool > 0) {
        phases.push({ label: "Cool-down", kind: "cool", seconds: cool });
    }

    const totalSeconds = phases.reduce((sum, phase) => sum + phase.seconds, 0);

    if (phases.length > L.phases || totalSeconds > L.totalSeconds) {

        return {
            ok: false,
            errors: [{
                field: "rounds",
                message: `A session can have at most ${L.phases} stages in all and last at most ${L.totalSeconds / 3600} hours. Reduce the rounds or the lengths.`
            }]
        };

    }

    return {
        ok: true,
        rounds: rounds.value,
        totalSeconds,
        sequence: buildSequence(phases, { repeat: false })
    };

}


/* =========================================================
   WHERE THE SEQUENCE IS AT A GIVEN ELAPSED TIME
   { done: true, remainingMs: 0, ... } past the end of a sequence that runs once.
   Otherwise: { done: false, absolute (phase number from 0, counting repeats),
                index (in the list), cycle, phase, startMs, endMs, remainingMs, intoMs }
========================================================= */

export function phaseAt(sequence, elapsedMs) {

    const elapsed = Math.max(0, elapsedMs);

    const { phases, starts, period } = sequence;

    if (!sequence.repeat && elapsed >= period) {

        return {
            done: true,
            absolute: phases.length,
            index: phases.length,
            cycle: 0,
            phase: null,
            startMs: period,
            endMs: period,
            remainingMs: 0,
            intoMs: 0
        };

    }

    const cycle = sequence.repeat ? Math.floor(elapsed / period) : 0;

    const within = elapsed - cycle * period;

    /* the last phase whose start is at or before `within` */
    let low = 0;
    let high = phases.length - 1;

    while (low < high) {

        const middle = Math.ceil((low + high) / 2);

        if (starts[middle] <= within) {
            low = middle;
        } else {
            high = middle - 1;
        }

    }

    const startMs = cycle * period + starts[low];
    const endMs = startMs + phases[low].ms;

    return {
        done: false,
        absolute: cycle * phases.length + low,
        index: low,
        cycle,
        phase: phases[low],
        startMs,
        endMs,
        remainingMs: endMs - elapsed,
        intoMs: elapsed - startMs
    };

}

/* the phase `steps` after the one at `absolute`, or null past the end of a sequence that runs once */
export function phaseAfter(sequence, absolute, steps = 1) {

    const next = absolute + steps;

    if (sequence.repeat) {
        return sequence.phases[next % sequence.phases.length];
    }

    return next < sequence.phases.length ? sequence.phases[next] : null;

}

/* how many focus periods have ended by an elapsed time */
export function focusEndsBy(sequence, elapsedMs) {

    if (sequence.focusPerPeriod === 0) {
        return 0;
    }

    const elapsed = Math.max(0, Math.min(elapsedMs, sequence.total));

    const cycles = sequence.repeat ? Math.floor(elapsed / sequence.period) : 0;

    const within = elapsed - cycles * sequence.period;

    let count = cycles * sequence.focusPerPeriod;

    sequence.phases.forEach((phase, index) => {

        if (phase.kind === "focus" && sequence.starts[index] + phase.ms <= within) {
            count += 1;
        }

    });

    return count;

}


/* =========================================================
   THE RUNNER (all times in milliseconds from a steady clock)
   status: "idle" | "running" | "paused" | "waiting" | "done"
========================================================= */

export function createRunner() {

    return {
        status: "idle",
        accumulatedMs: 0,
        startedAt: 0,
        skippedFocus: 0
    };

}

export function elapsedAt(runner, now) {

    return runner.status === "running"
        ? runner.accumulatedMs + Math.max(0, now - runner.startedAt)
        : runner.accumulatedMs;

}

export function start(runner, now) {

    if (runner.status !== "idle") {
        return runner;
    }

    return { ...runner, status: "running", accumulatedMs: 0, startedAt: now };

}

export function pause(runner, now) {

    if (runner.status !== "running") {
        return runner;
    }

    return { ...runner, status: "paused", accumulatedMs: elapsedAt(runner, now) };

}

export function resume(runner, now) {

    if (runner.status !== "paused" && runner.status !== "waiting") {
        return runner;
    }

    return { ...runner, status: "running", startedAt: now };

}

/*
 * Bring the runner up to date. Call it on every frame and when the page becomes visible.
 * Applies the end-of-phase rule (see the top of this file) and the end of a sequence that runs once.
 */
export function tick(runner, sequence, now, auto) {

    if (runner.status !== "running") {
        return runner;
    }

    const elapsed = elapsedAt(runner, now);

    if (!sequence.repeat && elapsed >= sequence.total) {
        return { ...runner, status: "done", accumulatedMs: sequence.total };
    }

    if (auto) {
        return runner;
    }

    /* the phase the running stretch began in */
    const began = phaseAt(sequence, runner.accumulatedMs);

    if (elapsed >= began.endMs) {

        return !sequence.repeat && began.endMs >= sequence.total
            ? { ...runner, status: "done", accumulatedMs: sequence.total }
            : { ...runner, status: "waiting", accumulatedMs: began.endMs };

    }

    return runner;

}

/* skip to the start of the next phase; allowed while running or paused */
export function skip(runner, sequence, now) {

    if (runner.status !== "running" && runner.status !== "paused") {
        return runner;
    }

    const elapsed = elapsedAt(runner, now);

    const at = phaseAt(sequence, elapsed);

    if (at.done) {
        return { ...runner, status: "done", accumulatedMs: sequence.total };
    }

    const skippedFocus = runner.skippedFocus + (at.phase.kind === "focus" ? 1 : 0);

    if (!sequence.repeat && at.endMs >= sequence.total) {
        return { ...runner, status: "done", accumulatedMs: sequence.total, skippedFocus };
    }

    return {
        ...runner,
        accumulatedMs: at.endMs,
        startedAt: now,
        skippedFocus
    };

}

/* focus periods finished by their full length, not skipped */
export function completedFocus(runner, sequence, now) {

    return Math.max(0, focusEndsBy(sequence, elapsedAt(runner, now)) - runner.skippedFocus);

}

/* time left in the whole session, for a sequence that runs once; null otherwise */
export function sessionRemainingMs(runner, sequence, now) {

    return sequence.repeat ? null : Math.max(0, sequence.total - elapsedAt(runner, now));

}


/* =========================================================
   FORMATTING
========================================================= */

const pad2 = (n) => String(n).padStart(2, "0");

/* time left, rounded UP to a whole second, so a new phase shows its full length and 0:00 means finished */
export function formatRemaining(ms) {

    const seconds = Math.max(0, Math.ceil(ms / SECOND));

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;

}

export function spokenSeconds(totalSeconds) {

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const part = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

    const parts = [];

    if (h) parts.push(part(h, "hour"));
    if (m) parts.push(part(m, "minute"));
    if (s || parts.length === 0) parts.push(part(s, "second"));

    return parts.join(" ");

}

export function phaseLengthText(phase) {

    return spokenSeconds(phase.ms / SECOND);

}
