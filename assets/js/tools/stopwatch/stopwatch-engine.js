/* =========================================================
   ToolZen Hub
   Stopwatch: the timing and lap rules

   Pure: no DOM, no timers and no clock of its own. Every
   function that needs "now" takes it as an argument, so the
   rules are tested with a fake clock and no waiting. The page
   passes performance.now(): a MONOTONIC clock, which a change of
   the computer's date or time, or a daylight-saving switch,
   cannot move. (Date.now() could jump; a stopwatch must not.)

   THE ELAPSED TIME
       elapsed = accumulated + (the running segment, if any)
                 where the running segment is  now - startedAt.
       Pausing adds the segment to `accumulated`; resuming starts
       a new segment. Nothing is counted tick by tick, so how often
       the page repaints (or whether a hidden tab repaints at all)
       has no effect on the time.

   LAPS
       A lap is the time since the previous lap (or the start).
       Each lap is stored with its number, its own time and the
       total elapsed time when it was taken (the "split"). Laps are
       recorded only while running, are numbered from 1, and are
       limited to MAX_LAPS.

   Times are worked in TENTHS of a second and rounded DOWN, so the
   display is never ahead of the true time, and each lap time is the
   difference of two displayed totals: the lap times always add up
   to the last total shown.

   STATES
       idle     nothing measured
       running  measuring
       paused   stopped, the elapsed time and the laps are kept
   A stopwatch has no natural end, so there is no finished state;
   the one limit is MAX_ELAPSED_MS, where it stops by itself.
========================================================= */

export const MAX_LAPS = 100;

/* 100 hours less a tenth of a second: 99:59:59.9 */
export const MAX_ELAPSED_MS = 100 * 3_600_000 - 100;


/* =========================================================
   STATE
========================================================= */

export function createStopwatch() {

    return {
        status: "idle",
        accumulatedMs: 0,
        startedAt: null,
        laps: [],
        reachedMax: false
    };

}

function clamp(ms) {

    return Math.min(MAX_ELAPSED_MS, Math.max(0, ms));

}

export function elapsedAt(sw, now) {

    if (sw.status === "running") {
        return clamp(sw.accumulatedMs + Math.max(0, now - sw.startedAt));
    }

    return sw.accumulatedMs;

}

export function start(sw, now) {

    if (sw.status !== "idle") {
        return sw;
    }

    return { ...sw, status: "running", startedAt: now };

}

export function pause(sw, now) {

    if (sw.status !== "running") {
        return sw;
    }

    return {
        ...sw,
        status: "paused",
        accumulatedMs: elapsedAt(sw, now),
        startedAt: null
    };

}

export function resume(sw, now) {

    if (sw.status !== "paused" || sw.reachedMax) {
        return sw;
    }

    return { ...sw, status: "running", startedAt: now };

}

/* a running stopwatch that reached the limit stops there; anything else is left as it is */
export function tick(sw, now) {

    if (sw.status !== "running") {
        return sw;
    }

    if (sw.accumulatedMs + Math.max(0, now - sw.startedAt) < MAX_ELAPSED_MS) {
        return sw;
    }

    return {
        ...sw,
        status: "paused",
        accumulatedMs: MAX_ELAPSED_MS,
        startedAt: null,
        reachedMax: true
    };

}

export function reset() {

    return createStopwatch();

}


/* =========================================================
   LAPS
========================================================= */

/* whole tenths of a second, rounded down */
export const tenthsOf = (ms) => Math.floor(ms / 100);

export function canLap(sw) {

    return sw.status === "running" && sw.laps.length < MAX_LAPS;

}

export function lapLimitReached(sw) {

    return sw.laps.length >= MAX_LAPS;

}

/*
 * Records a lap. Returns the same state when a lap cannot be taken
 * (not running, or the limit is reached), so the caller can tell.
 */
export function lap(sw, now) {

    if (!canLap(sw)) {
        return sw;
    }

    const totalTenths = tenthsOf(elapsedAt(sw, now));

    const previous = sw.laps[sw.laps.length - 1];

    const previousTenths = previous ? previous.totalTenths : 0;

    return {
        ...sw,
        laps: [
            ...sw.laps,
            {
                number: sw.laps.length + 1,
                totalTenths,
                lapTenths: Math.max(0, totalTenths - previousTenths)
            }
        ]
    };

}

/* the time of the lap in progress (not yet recorded), in tenths */
export function currentLapTenths(sw, now) {

    const previous = sw.laps[sw.laps.length - 1];

    return Math.max(
        0,
        tenthsOf(elapsedAt(sw, now)) - (previous ? previous.totalTenths : 0)
    );

}

/*
 * Fastest and slowest recorded laps, by lap time. Only when there are
 * at least two laps and they are not all the same time; equal times
 * share the mark. Returns the lap numbers.
 */
export function lapExtremes(laps) {

    if (laps.length < 2) {
        return { fastest: [], slowest: [] };
    }

    const times = laps.map(item => item.lapTenths);

    const min = Math.min(...times);
    const max = Math.max(...times);

    if (min === max) {
        return { fastest: [], slowest: [] };
    }

    return {
        fastest: laps.filter(item => item.lapTenths === min).map(item => item.number),
        slowest: laps.filter(item => item.lapTenths === max).map(item => item.number)
    };

}


/* =========================================================
   TEXT
========================================================= */

const two = (n) => String(n).padStart(2, "0");

/*
 * "00:12.3" under an hour, "1:02:03.4" from an hour. `tenths` is
 * a whole number of tenths of a second.
 */
export function formatTenths(tenths) {

    const total = Number.isFinite(tenths) ? Math.max(0, Math.floor(tenths)) : 0;

    const tenth = total % 10;
    const wholeSeconds = Math.floor(total / 10);

    const seconds = wholeSeconds % 60;
    const minutes = Math.floor(wholeSeconds / 60) % 60;
    const hours = Math.floor(wholeSeconds / 3600);

    return hours > 0
        ? `${hours}:${two(minutes)}:${two(seconds)}.${tenth}`
        : `${two(minutes)}:${two(seconds)}.${tenth}`;

}

export const formatElapsed = (ms) => formatTenths(tenthsOf(ms));

/* the same without the tenth, for the browser tab title: "00:12" */
export function formatWhole(ms) {

    return formatTenths(tenthsOf(ms) - (tenthsOf(ms) % 10)).replace(/\.0$/, "");

}
