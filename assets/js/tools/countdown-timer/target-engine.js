/* =========================================================
   ToolZen Hub
   Countdown Timer: counting down to a date (pure, no DOM, no clock
   of its own)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   The existing timer counts a LENGTH of time from the moment you
   press Start. This mode counts to a moment on the calendar: a
   date and a time on a clock, in a time zone you choose (or the
   zone of this device). That moment is turned into one exact
   instant with the Time Zone Converter's own functions, so a
   daylight-saving change between now and then is counted
   correctly, and a time that never happens (the hour clocks skip)
   is refused rather than guessed.

   The time left is the exact time between now and that instant,
   shown as days, hours, minutes and seconds, where a day is
   exactly 24 hours. (Across a daylight-saving change the calendar
   day and the 24-hour day differ by an hour; this is the time
   that will really pass.)

   Time comes in as `nowMs` (from the device clock). A wall-clock
   target is a real-world moment, so the device clock is the
   right reference; every read of it gives the right answer, which
   is why a hidden tab or a sleeping laptop shows the correct time
   as soon as it is looked at.
========================================================= */

import {
    MIN_YEAR,
    MAX_YEAR,
    parseDate,
    parseTime,
    isValidZone,
    localZone,
    resolveWall,
    describeInZone,
    UNSUPPORTED_ZONE
} from "../time-zone-converter/time-zone-engine.js";

export const NAME_LIMIT = 60;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const MESSAGES = Object.freeze({
    date: `Enter a date as year-month-day, between ${MIN_YEAR} and ${MAX_YEAR}.`,
    time: "Enter a time as hours and minutes, for example 09:30.",
    zone: UNSUPPORTED_ZONE,
    past: "That date and time has already passed. Choose a time in the future."
});

/*
 * input: { date: "YYYY-MM-DD", time: "HH:MM", zone: "" (this device) or an IANA name, choice: "earlier" | "later" }
 * { ok: true, ms, zone, ambiguous, other (the other instant when the time happens twice) }
 * { ok: false, errors: [{ field, message }] }
 */
export function parseTarget({ date, time, zone, choice }) {

    const errors = [];

    if (!parseDate(date)) {
        errors.push({ field: "date", message: MESSAGES.date });
    }

    if (!parseTime(time)) {
        errors.push({ field: "time", message: MESSAGES.time });
    }

    const chosen = zone || localZone();

    if (!chosen || !isValidZone(chosen)) {
        errors.push({ field: "zone", message: MESSAGES.zone });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const resolved = resolveWall(date, time, chosen);

    if (resolved.kind === "gap") {

        const gap = resolved.gap;

        return {
            ok: false,
            errors: [{
                field: "time",
                message: gap
                    ? `${time} does not exist in ${chosen} on ${date}: the clocks jump from ${gap.lastTime} to ${gap.firstTime}. Choose a time before or after the jump.`
                    : `${time} does not exist in ${chosen} on ${date}.`
            }]
        };

    }

    if (resolved.kind === "overlap") {

        const [earlier, later] = resolved.candidates;

        const pick = choice === "later" ? later : earlier;

        return {
            ok: true,
            ms: pick.ms,
            zone: chosen,
            ambiguous: true,
            other: pick === earlier ? later.ms : earlier.ms
        };

    }

    return { ok: true, ms: resolved.candidates[0].ms, zone: chosen, ambiguous: false, other: null };

}

/* the exact time between now and a target: { reached, ms (absolute), days, hours, minutes, seconds } */
export function remainingAt(targetMs, nowMs) {

    const difference = targetMs - nowMs;

    const abs = Math.abs(difference);

    /* whole seconds, rounded UP while counting down (so 0:00:00 means reached) and DOWN for time since */
    const seconds = difference > 0 ? Math.ceil(abs / SECOND) : Math.floor(abs / SECOND);

    return {
        reached: difference <= 0,
        ms: abs,
        days: Math.floor(seconds / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60,
        totalSeconds: seconds
    };

}

/* "Friday, 25 December 2026, 09:30 GMT (UTC+00:00)" */
export function eventText(ms, zone) {

    const d = describeInZone(ms, zone);

    return `${d.dateLabel}, ${d.time} ${d.abbr} (${d.offset})`.replace(/\s+/g, " ");

}

const pad2 = (n) => String(n).padStart(2, "0");

/* the display: "12 days 03:04:05" or "03:04:05" under a day */
export function clockText(parts) {

    const clock = `${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;

    return parts.days > 0
        ? `${parts.days} ${parts.days === 1 ? "day" : "days"} ${clock}`
        : clock;

}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* for a screen reader: "12 days 3 hours 4 minutes 5 seconds" with zero parts left out */
export function spokenParts(parts) {

    const list = [];

    if (parts.days) list.push(plural(parts.days, "day"));
    if (parts.hours) list.push(plural(parts.hours, "hour"));
    if (parts.minutes) list.push(plural(parts.minutes, "minute"));
    if (parts.seconds || list.length === 0) list.push(plural(parts.seconds, "second"));

    return list.join(" ");

}

/* the announcement steps: when the time left crosses these, say so (never every second) */
export function announceKey(parts) {

    if (parts.reached) return "reached";
    if (parts.days >= 1) return `d${parts.days}`;
    if (parts.hours >= 1) return `h${parts.hours}`;
    if (parts.minutes >= 1) return parts.minutes <= 10 ? `m${parts.minutes}` : `m${Math.floor(parts.minutes / 10) * 10}`;
    return `s${parts.seconds <= 10 ? parts.seconds : 11}`;

}


/* =========================================================
   THE LINK
   ?to=2026-12-25T09:30&tz=Europe/London&name=Holiday&c=later
   Only what was typed: the target, its zone, an optional name.
========================================================= */

export function buildQuery({ date, time, zone, name, choice }) {

    const params = new URLSearchParams();

    params.set("to", `${date}T${time}`);

    if (zone) params.set("tz", zone);
    if (name) params.set("name", name.slice(0, NAME_LIMIT));
    if (choice === "later") params.set("c", "later");

    return params.toString();

}

export function parseQuery(search) {

    const params = new URLSearchParams(String(search ?? "").replace(/^\?/, ""));

    const to = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(params.get("to") ?? "");

    if (!to) {
        return null;
    }

    return {
        date: to[1],
        time: to[2],
        zone: params.get("tz") ?? "",
        name: (params.get("name") ?? "").slice(0, NAME_LIMIT),
        choice: params.get("c") === "later" ? "later" : "earlier"
    };

}

export { DAY, HOUR };
