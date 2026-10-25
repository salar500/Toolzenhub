/* =========================================================
   ToolZen Hub
   Time Zone Converter: daylight-saving information (pure, no DOM,
   no clock of its own)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   Nothing here knows when daylight saving starts anywhere. Every
   fact is read from the browser's own time zone data (through the
   converter's offsetSecondsAt): a clock change is simply a moment
   when a zone's offset from UTC is different a moment later. So a
   government that changes its rules is picked up with the browser's
   next time zone update, and a zone that never changes its clocks
   (or stopped) honestly reports no change.

   Checked against an independent reference
   (tests/fixtures/dst-golden.py, Python zoneinfo).
========================================================= */

import {
    offsetSecondsAt,
    offsetLabel,
    isValidZone
} from "./time-zone-engine.js";

const MINUTE = 60000;
const DAY = 86400000;

/* how far either side of the converted moment clock changes are looked for */
export const SEARCH_DAYS = 200;

/* a clock change is looked for in steps this long; no zone changes its clocks twice in three days */
const STEP_DAYS = 3;

/* how close a change is for the converter to point it out beside the result */
export const NEAR_DAYS = 45;

/*
 * The clock change between two instants, or null when the offset is the same at both ends.
 * { ms (the first minute on the new offset), fromOffset, toOffset } in seconds.
 */
export function transitionBetween(zone, lowMs, highMs) {

    const first = offsetSecondsAt(lowMs, zone);

    if (offsetSecondsAt(highMs, zone) === first) {
        return null;
    }

    let low = lowMs;
    let high = highMs;

    while (high - low > MINUTE) {

        const mid = Math.floor((low + high) / (2 * MINUTE)) * MINUTE;

        if (mid <= low) {
            break;
        }

        if (offsetSecondsAt(mid, zone) === first) {
            low = mid;
        } else {
            high = mid;
        }

    }

    return { ms: high, fromOffset: first, toOffset: offsetSecondsAt(high, zone) };

}

/*
 * The clock changes of a zone around an instant:
 * { zone, previous: change | null, next: change | null }, each change being
 * { ms, fromOffset, toOffset, deltaMinutes (+60 = clocks go forward), forward: boolean }.
 * `previous` is the latest change at or before the instant, `next` the first after it,
 * each looked for within SEARCH_DAYS.
 */
export function zoneChanges(zone, ms) {

    if (!isValidZone(zone)) {
        return { zone, previous: null, next: null };
    }

    const decorate = (found) => found && {
        ...found,
        deltaMinutes: (found.toOffset - found.fromOffset) / 60,
        forward: found.toOffset > found.fromOffset
    };

    let next = null;

    for (let at = ms; at < ms + SEARCH_DAYS * DAY && !next; at += STEP_DAYS * DAY) {
        next = transitionBetween(zone, at, at + STEP_DAYS * DAY);
    }

    let previous = null;

    for (let at = ms; at > ms - SEARCH_DAYS * DAY && !previous; at -= STEP_DAYS * DAY) {
        previous = transitionBetween(zone, at - STEP_DAYS * DAY, at);
    }

    /* a change exactly at the instant counts as "previous" (the new offset is already in force) */
    if (next && next.ms === ms) {
        previous = next;
        next = null;
    }

    return { zone, previous: decorate(previous), next: decorate(next) };

}

const pad2 = (n) => String(n).padStart(2, "0");

/* the clock reading, as year-month-day and hours:minutes, of an instant at a given offset */
function reading(ms, offsetSeconds) {

    const d = new Date(ms + offsetSeconds * 1000);

    return {
        date: `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`,
        time: `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
    };

}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dateWords(isoDate) {

    const [y, m, d] = isoDate.split("-").map(Number);

    const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

    return `${weekday} ${d} ${MONTHS[m - 1]} ${y}`;

}

export function amountWords(deltaMinutes) {

    const abs = Math.abs(deltaMinutes);

    if (abs % 60 === 0) {
        const h = abs / 60;
        return `${h} hour${h === 1 ? "" : "s"}`;
    }

    return `${abs} minutes`;

}

/*
 * A change in words: the date and clock reading in that zone just before it happens, and what it does.
 * { date, time, newTime, headline, offsets }
 */
export function describeChange(change) {

    const before = reading(change.ms, change.fromOffset);
    const after = reading(change.ms, change.toOffset);

    const direction = change.forward ? "forward" : "back";

    return {
        date: before.date,
        dateWords: dateWords(before.date),
        time: before.time,
        newTime: after.time,
        direction,
        amount: amountWords(change.deltaMinutes),
        offsets: `${offsetLabel(change.fromOffset)} to ${offsetLabel(change.toOffset)}`,
        headline: `Clocks go ${direction} ${amountWords(change.deltaMinutes)} on ${dateWords(before.date)}: ${before.time} becomes ${after.time}`
    };

}

/*
 * What to tell the person about one zone at the converted instant.
 * { zone, state: "none" | "changes", previous, next } where previous/next are decorated changes
 * (or null) and `near` marks a change within NEAR_DAYS of the instant.
 */
export function zoneNotes(zone, ms) {

    const { previous, next } = zoneChanges(zone, ms);

    const near = (change) => change !== null && Math.abs(change.ms - ms) <= NEAR_DAYS * DAY;

    return {
        zone,
        state: previous || next ? "changes" : "none",
        previous,
        next,
        nearPrevious: near(previous),
        nearNext: near(next)
    };

}

/*
 * When two places change clocks on different dates, the gap between them is not the same all year.
 * For a source and each target: the first change of either zone after the instant (within 120 days)
 * that moves the difference, with the difference before and after (in minutes, target minus source).
 * Returns [{ target, before, after, ms, cause: "source" | "target" }].
 */
export function differenceChanges(source, targets, ms) {

    const results = [];

    for (const target of targets) {

        if (target === source || !isValidZone(target) || !isValidZone(source)) {
            continue;
        }

        const diff = (at) => (offsetSecondsAt(at, target) - offsetSecondsAt(at, source)) / 60;

        let found = null;

        for (let at = ms; at < ms + 120 * DAY && !found; at += STEP_DAYS * DAY) {

            const end = at + STEP_DAYS * DAY;

            if (diff(at) === diff(end)) {
                continue;
            }

            let low = at;
            let high = end;

            const before = diff(at);

            while (high - low > MINUTE) {

                const mid = Math.floor((low + high) / (2 * MINUTE)) * MINUTE;

                if (mid <= low) {
                    break;
                }

                if (diff(mid) === before) {
                    low = mid;
                } else {
                    high = mid;
                }

            }

            found = {
                target,
                ms: high,
                before,
                after: diff(high),
                cause: offsetSecondsAt(high, source) !== offsetSecondsAt(high - MINUTE, source) ? "source" : "target"
            };

        }

        if (found) {
            results.push(found);
        }

    }

    return results;

}

export function differenceWords(minutes) {

    const abs = Math.abs(minutes);

    const h = Math.floor(abs / 60);
    const m = abs % 60;

    const parts = [];

    if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
    if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);

    return parts.length === 0 ? "no difference" : parts.join(" ");

}
