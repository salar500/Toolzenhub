/* =========================================================
   ToolZen Hub
   Countdown Timer: the timing rules

   Pure: no DOM, no timers and no clock of its own. Every
   function that needs "now" takes it as an argument (a number of
   milliseconds, such as Date.now()), so the rules can be tested
   without waiting.

   THE ONE RULE
       While the timer runs it holds an END TIME. The time left
       is always  endAt - now , worked out when it is asked for.
       Nothing is counted down second by second, so a timer that
       was throttled or frozen in a background tab (or a laptop
       that slept) shows the right time the moment it is looked at.

   PAUSE / RESUME
       Pausing stores the time left at that moment. Resuming sets
       a new end time = now + that stored time. Nothing is added
       or lost across any number of pauses.

   STATES
       idle      set up, not started
       running   counting down to endAt
       paused    stopped, with a time left
       finished  reached zero (the time left is 0, never negative)

   A state is a plain object; every function returns a new one.
========================================================= */

export const LIMITS = Object.freeze({
    maxSeconds: 24 * 60 * 60,
    maxDigits: 5
});

export const PRESETS = Object.freeze([
    { label: "1 min", seconds: 60 },
    { label: "5 min", seconds: 5 * 60 },
    { label: "10 min", seconds: 10 * 60 },
    { label: "25 min", seconds: 25 * 60 },
    { label: "30 min", seconds: 30 * 60 },
    { label: "60 min", seconds: 60 * 60 }
]);


/* =========================================================
   READING A DURATION
   Hours, minutes and seconds are whole numbers; blank is 0.
   Any amount is accepted in any field (90 seconds is fine) and
   the total is what counts, up to 24 hours.
========================================================= */

const AMOUNT = new RegExp(`^\\d{1,${LIMITS.maxDigits}}$`);

const FIELD_NAMES = {
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds"
};

export function parseDuration({ hours, minutes, seconds }) {

    const input = { hours, minutes, seconds };

    const errors = [];

    const values = {};

    for (const field of Object.keys(FIELD_NAMES)) {

        const text = String(input[field] ?? "").trim();

        if (text === "") {
            values[field] = 0;
        } else if (!AMOUNT.test(text)) {
            errors.push({
                field,
                message: `${FIELD_NAMES[field]}: enter a whole number of 0 or more.`
            });
        } else {
            values[field] = Number(text);
        }

    }

    if (errors.length > 0) {
        return { status: "invalid", errors };
    }

    const totalSeconds =
        values.hours * 3600 + values.minutes * 60 + values.seconds;

    if (totalSeconds === 0) {
        return {
            status: "empty",
            message: "Set a time above zero, or choose a preset."
        };
    }

    if (totalSeconds > LIMITS.maxSeconds) {
        return {
            status: "too-long",
            message: "The longest time is 24 hours. Enter a shorter time."
        };
    }

    return { status: "ok", totalSeconds };

}

/* the same total as hours, minutes and seconds each within range */
export function splitSeconds(totalSeconds) {

    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
    };

}


/* =========================================================
   STATE
========================================================= */

export function createTimer() {

    return {
        status: "idle",
        totalMs: 0,
        remainingMs: 0,
        endAt: null
    };

}

export function start(timer, totalSeconds, now) {

    const totalMs = totalSeconds * 1000;

    return {
        status: "running",
        totalMs,
        remainingMs: totalMs,
        endAt: now + totalMs
    };

}

/* the time left at `now`, never below 0 */
export function remainingAt(timer, now) {

    if (timer.status === "running") {
        return Math.max(0, timer.endAt - now);
    }

    return timer.remainingMs;

}

/* brings a running timer up to date: it becomes finished once its end time has passed */
export function tick(timer, now) {

    if (timer.status !== "running") {
        return timer;
    }

    const remainingMs = remainingAt(timer, now);

    if (remainingMs === 0) {
        return {
            ...timer,
            status: "finished",
            remainingMs: 0,
            endAt: null
        };
    }

    return { ...timer, remainingMs };

}

export function pause(timer, now) {

    if (timer.status !== "running") {
        return timer;
    }

    /* a timer that reached zero while nobody was looking is finished, not paused */
    const settled = tick(timer, now);

    if (settled.status === "finished") {
        return settled;
    }

    return {
        ...settled,
        status: "paused",
        endAt: null
    };

}

export function resume(timer, now) {

    if (timer.status !== "paused") {
        return timer;
    }

    return {
        ...timer,
        status: "running",
        endAt: now + timer.remainingMs
    };

}

export function reset() {

    return createTimer();

}


/* =========================================================
   TEXT
========================================================= */

const two = (n) => String(n).padStart(2, "0");

/*
 * "25:00", or "01:25:00" from one hour up. A part of a second
 * counts as the whole second, so the display shows 00:00 only
 * when the timer is really finished.
 */
export function formatClock(ms) {

    const total = Math.max(0, Math.ceil(ms / 1000));

    const { hours, minutes, seconds } = splitSeconds(total);

    return hours > 0
        ? `${two(hours)}:${two(minutes)}:${two(seconds)}`
        : `${two(minutes)}:${two(seconds)}`;

}

/* "1 hour, 25 minutes and 30 seconds": for a sentence or a screen reader */
export function durationWords(totalSeconds) {

    const { hours, minutes, seconds } = splitSeconds(totalSeconds);

    const parts = [
        [hours, "hour"],
        [minutes, "minute"],
        [seconds, "second"]
    ]
        .filter(([count]) => count > 0)
        .map(([count, word]) => `${count} ${word}${count === 1 ? "" : "s"}`);

    if (parts.length <= 1) {
        return parts[0] ?? "0 seconds";
    }

    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

}
