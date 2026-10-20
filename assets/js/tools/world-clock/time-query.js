/* =========================================================
   ToolZen Hub
   World Clock 2.0: current-time queries (Tool Pack 28, section 20)

   PURE. No DOM, no clock of its own: every function is given the
   local minute of a place (and its UTC offset) at ONE shared instant.

   Reads what a visitor types when it is a time, an hour, AM or PM, a
   range of times or a UTC offset, and says which places match, with the
   wording of the heading. Everything else a visitor types (a city, a
   country, a continent, a zone path) is not this module's business.

   Contract (section 20.4 to 20.6):
     hour       "8 pm" is the local hour 20:00 to 20:59; "08" is 08:00 to
                08:59; a bare 1 to 12 ("8") is read BOTH ways and shown as
                two groups; "noon" and "midnight" are the hours 12:00 to
                12:59 and 00:00 to 00:59
     period     "am" is 00:00 to 11:59, "pm" is 12:00 to 23:59
     time       "8:30 am": around 08:30, by default within 15 minutes,
                both ends included, wrapping across midnight; never
                widened silently
     range      "9 am-12 pm": from 09:00 up to and including 12:00; may
                cross midnight; each end must say AM or PM or be on the
                24-hour clock
     offset     "UTC+05:30", "+5:30", "-4": the places whose offset NOW is
                that one; a sign (or utc/gmt) is required
   A local minute is 0 to 1439 (hour times 60 plus minute).
========================================================= */

export const DEFAULT_TOLERANCE = 15;
export const TOLERANCES = Object.freeze([5, 15, 30, 60]);

/* the next wider tolerance, or null when already the widest */
export const widerTolerance = (tolerance) =>
    TOLERANCES.find((value) => value > tolerance) ?? null;

const DAY = 1440;

/* lower case, one dash, a.m. as am, spaces collapsed */
export function normalizeQuery(raw) {

    return String(raw ?? "")
        .trim()
        .toLowerCase()
        .replace(/[−–—]/g, "-")
        .replace(/\./g, "")
        .replace(/\s+/g, " ");

}

const ATOM = "(?:noon|midnight|\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)";
const ATOM_RE = /^(?:(noon|midnight)|(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)$/;
const RANGE_RE = new RegExp(`^(${ATOM})\\s*(?:-|to)\\s*(${ATOM})$`);
const OFFSET_RE = /^(?:(utc|gmt)\s*)?([+-])\s*(\d{1,2})(?::?(\d{2}))?$/;

/*
 * One time atom, or null when the text is not one, or { bad } when it looks like one but cannot be.
 *   { minute, hasMinutes, either, word }
 * `either` is true for a bare 1 to 12 with no leading zero and no am/pm: it has two readings.
 */
function readAtom(text) {

    const m = ATOM_RE.exec(text.trim());

    if (!m) {
        return null;
    }

    if (m[1]) {
        return { minute: m[1] === "noon" ? 720 : 0, hasMinutes: false, either: false, word: m[1], hour: m[1] === "noon" ? 12 : 0 };
    }

    const hour = Number(m[2]);

    const hasMinutes = m[3] !== undefined;

    const minutes = hasMinutes ? Number(m[3]) : 0;

    const suffix = m[4] ?? null;

    if (minutes > 59) {
        return { bad: true };
    }

    if (suffix) {

        if (hour < 1 || hour > 12) {
            return { bad: true };
        }

        return { minute: ((hour % 12) + (suffix === "pm" ? 12 : 0)) * 60 + minutes, hasMinutes, either: false, suffix, hour: (hour % 12) + (suffix === "pm" ? 12 : 0) };

    }

    if (hour > 23) {
        return { bad: true };
    }

    const leadingZero = /^0\d/.test(m[2]);

    const either = !leadingZero && hour >= 1 && hour <= 12;

    return { minute: hour * 60 + minutes, hasMinutes, either, hour };

}

/*
 * What a query means, if it is a time query; otherwise null (so the caller goes on to names).
 *   { kind: "offset", seconds, bare }                       a UTC offset
 *   { kind: "range", start, end }                           two times (minutes)
 *   { kind: "time", minutes: [m] or [m, m+720] }            a time with minutes (two readings when bare)
 *   { kind: "hour", hours: [h] or [h, h+12], word }         an hour (two readings when bare)
 *   { kind: "period", period: "am" | "pm" }
 *   { kind: "invalid", hint }                               looks like a time or offset but is not one
 */
export function parseTimeQuery(raw) {

    const q = normalizeQuery(raw);

    if (q === "") {
        return null;
    }

    /* 2: a UTC offset (an explicit sign, or utc/gmt) */
    if (q === "utc" || q === "gmt") {
        return { kind: "offset", seconds: 0, bare: q };
    }

    const offset = OFFSET_RE.exec(q);

    if (offset) {

        const hours = Number(offset[3]);
        const minutes = offset[4] ? Number(offset[4]) : 0;

        if (hours > 14 || minutes > 59 || minutes % 15 !== 0 || (hours === 14 && minutes > 0) || (offset[2] === "-" && hours * 60 + minutes > 720)) {
            return { kind: "invalid", hint: "offset" };
        }

        return { kind: "offset", seconds: (offset[2] === "-" ? -1 : 1) * (hours * 3600 + minutes * 60), bare: null };

    }

    /* 3: a range of two times */
    const range = RANGE_RE.exec(q);

    if (range) {

        const a = readAtom(range[1]);
        const b = readAtom(range[2]);

        if (!a || !b || a.bad || b.bad) {
            return { kind: "invalid", hint: "range" };
        }

        if (a.minute === b.minute) {
            return { kind: "invalid", hint: "range-equal" };
        }

        /*
         * An end that is a bare 1 to 12 (no leading zero, no am/pm) could be either half of the day. It is accepted only when the
         * OTHER end is plainly on the 24-hour clock (a leading zero, hour 0, or an hour above 12): then the whole range is 24-hour,
         * so "08:00-10:00" and "9:00-17:00" work and "9-12" and "9 am-12" do not. Nothing is guessed.
         */
        const plain24 = (atom) => !atom.either && !atom.word && !atom.suffix;

        if ((a.either && !plain24(b)) || (b.either && !plain24(a))) {
            return { kind: "invalid", hint: "range-halves" };
        }

        return { kind: "range", start: a.minute, end: b.minute };

    }

    /* 4 and 5: one time atom, with or without minutes (or the words noon and midnight) */
    const atom = readAtom(q);

    if (atom) {

        if (atom.bad) {
            return { kind: "invalid", hint: "time" };
        }

        if (atom.word) {
            return { kind: "hour", hours: [atom.hour], word: atom.word };
        }

        if (atom.hasMinutes) {
            return { kind: "time", minutes: atom.either ? [atom.minute % 720, (atom.minute % 720) + 720] : [atom.minute] };
        }

        return { kind: "hour", hours: atom.either ? [atom.hour % 12, (atom.hour % 12) + 12] : [atom.hour], word: null };

    }

    /* 6: AM or PM on its own */
    if (q === "am" || q === "pm") {
        return { kind: "period", period: q };
    }

    /* 7: it starts like a time or an offset, or is noon or midnight with something after it, but is none */
    if (/^[\d+-]/.test(q) || /^(utc|gmt)\s*[+-]/.test(q) || /^(noon|midnight)\b/.test(q)) {
        return { kind: "invalid", hint: "time" };
    }

    return null;

}

/* ---------- wording ---------- */

/* "8:15 AM", or "08:15" on the 24-hour clock */
export function formatMinute(minute, hour12) {

    const m = ((minute % DAY) + DAY) % DAY;

    const h = Math.floor(m / 60);

    const mi = String(m % 60).padStart(2, "0");

    if (!hour12) {
        return `${String(h).padStart(2, "0")}:${mi}`;
    }

    return `${h % 12 === 0 ? 12 : h % 12}:${mi} ${h < 12 ? "AM" : "PM"}`;

}

export function formatOffset(seconds) {

    const sign = seconds < 0 ? "−" : "+";

    const abs = Math.abs(seconds);

    return `UTC${sign}${String(Math.floor(abs / 3600)).padStart(2, "0")}:${String(Math.floor((abs % 3600) / 60)).padStart(2, "0")}`;

}

export const HINTS = Object.freeze({
    time: "That is not a time or offset we can read. Try 8 PM, 20:00, 8:30 AM, 9 AM-12 PM or UTC+05:30.",
    offset: "That is not a UTC offset we can read. Offsets run from -12:00 to +14:00 in steps of 15 minutes, for example UTC+05:30 or -04:00.",
    range: "That is not a time range we can read. Try 9 AM-12 PM or 08:00-10:00.",
    "range-halves": "Add AM or PM to both ends, or use 24-hour times such as 09:00-12:00.",
    "range-equal": "A range needs two different times."
});

/*
 * The groups of places a parsed query selects, as plain data the caller can test places against.
 * Each group: { id, heading(hour12), test(local, offsetSeconds) -> boolean,
 *               gap(local, offsetSeconds) -> minutes outside the group (0 when inside), sortKey(local) }
 * `gap` is how far a place is from matching, for the nearest suggestions; for offsets it is minutes of offset.
 * `tolerance` applies to a specific time only.
 */
export function buildGroups(parsed, tolerance = DEFAULT_TOLERANCE) {

    const circular = (a, b) => {
        const d = Math.abs(a - b) % DAY;
        return Math.min(d, DAY - d);
    };

    /* a window [start, end] (minutes, may wrap), both ends included */
    const windowGroup = (id, start, end, heading, from) => {

        const s = ((start % DAY) + DAY) % DAY;
        const e = ((end % DAY) + DAY) % DAY;

        const inside = (local) => (s <= e ? local >= s && local <= e : local >= s || local <= e);

        return {
            id,
            heading,
            test: (local) => inside(local),
            gap: (local) => (inside(local) ? 0 : Math.min(circular(local, s), circular(local, e))),
            /* which side of the window a place is on, for "before" and "after" */
            side: (local) => (inside(local) ? 0 : (((local - e) % DAY) + DAY) % DAY <= DAY / 2 ? 1 : -1),
            sortKey: (local) => (((local - from) % DAY) + DAY) % DAY
        };

    };

    switch (parsed.kind) {

        case "hour":
            return parsed.hours.map((hour) =>
                windowGroup(`hour-${hour}`, hour * 60, hour * 60 + 59,
                    (hour12) => `Places currently between ${formatMinute(hour * 60, hour12)} and ${formatMinute(hour * 60 + 59, hour12)}`,
                    hour * 60)
            );

        case "period":
            return [parsed.period === "am"
                ? windowGroup("am", 0, 719, (hour12) => `Places where it is currently AM (midnight to ${formatMinute(719, hour12)})`, 0)
                : windowGroup("pm", 720, 1439, (hour12) => `Places where it is currently PM (noon to ${formatMinute(1439, hour12)})`, 720)];

        case "time":
            return parsed.minutes.map((target) => {

                const group = windowGroup(`time-${target}`, target - tolerance, target + tolerance,
                    (hour12) => `Places currently around ${formatMinute(target, hour12)} (${formatMinute(target - tolerance, hour12)} to ${formatMinute(target + tolerance, hour12)}, ±${tolerance} minutes)`,
                    target);

                /* nearest first: the sort key of a specific time is the distance from it */
                group.sortKey = (local) => circular(local, target);

                return group;

            });

        case "range": {

            const crossing = parsed.start > parsed.end;

            return [windowGroup("range", parsed.start, parsed.end,
                (hour12) => `Places currently between ${formatMinute(parsed.start, hour12)} and ${formatMinute(parsed.end, hour12)}${crossing ? " (crossing midnight)" : ""}`,
                parsed.start)];

        }

        case "offset":
            return [{
                id: "offset",
                heading: () => `Places currently using ${formatOffset(parsed.seconds)}`,
                test: (local, offsetSeconds) => offsetSeconds === parsed.seconds,
                gap: (local, offsetSeconds) => Math.abs(offsetSeconds - parsed.seconds) / 60,
                side: (local, offsetSeconds) => (offsetSeconds === parsed.seconds ? 0 : offsetSeconds > parsed.seconds ? 1 : -1),
                sortKey: (local) => local
            }];

        default:
            return [];

    }

}

/* "8 minutes", "1 hour 5 minutes", "2 hours" */
export function describeSpan(minutes) {

    const m = Math.round(minutes);

    const h = Math.floor(m / 60);

    const rest = m % 60;

    const parts = [];

    if (h) {
        parts.push(`${h} hour${h === 1 ? "" : "s"}`);
    }

    if (rest || !h) {
        parts.push(`${rest} minute${rest === 1 ? "" : "s"}`);
    }

    return parts.join(" ");

}

/* the explanation shown with an offset search */
export const OFFSET_NOTE =
    "An offset can change with daylight saving, and one offset covers many time zones. It is not a time-zone name.";

export const UTC_NOTE =
    "UTC and GMT are the same standard time. A place such as London is on UTC+01:00 in summer, so it is not listed here then.";

export const PERIOD_NOTE_AM =
    "Showing places where it is currently AM. Looking for Amman or Amsterdam? Keep typing.";
