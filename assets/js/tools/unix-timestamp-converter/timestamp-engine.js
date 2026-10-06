/* =========================================================
   ToolZen Hub
   Unix Timestamp Converter: the conversion rules

   Pure: no DOM and no clock of its own. Every function that needs
   "now" takes it as an argument.

   THE INSTANT
       An instant is an exact BigInt count of NANOSECONDS since
       1970-01-01T00:00:00Z. Nothing goes through Number, so a 19
       digit nanosecond value keeps every digit, and nothing is ever
       rounded: a value finer than a nanosecond is an error.

   RANGE
       Years 1 to 9999 (proleptic Gregorian, UTC). That is inside
       what a JavaScript Date and every browser's Intl handle, so the
       behaviour is defined everywhere. Leap seconds are not modelled:
       Unix time counts every day as exactly 86,400 seconds.

   UNIT DETECTION is a table on the number of digits of the integer
   part, not a guess about the value (see detectUnit). An ambiguous
   length is reported, never converted silently.

   TIME ZONES come from Intl.DateTimeFormat (the browser's IANA
   data); offsets are never written by hand. A local time that does
   not exist (a daylight-saving gap) or happens twice (an overlap) is
   named, never silently resolved.
========================================================= */

export const NS_PER = { s: 1_000_000_000n, ms: 1_000_000n, us: 1_000n, ns: 1n };

const SCALE = { s: 9, ms: 6, us: 3, ns: 0 };

export const UNIT_LABEL = {
    s: "seconds",
    ms: "milliseconds",
    us: "microseconds",
    ns: "nanoseconds"
};

export const MIN_SECONDS = -62135596800n;            /* 0001-01-01T00:00:00Z */
export const MAX_SECONDS = 253402300799n;            /* 9999-12-31T23:59:59Z */

export const MIN_NS = MIN_SECONDS * 1_000_000_000n;
export const MAX_NS = MAX_SECONDS * 1_000_000_000n + 999_999_999n;

const MIN_MS = Number(MIN_SECONDS) * 1000;
const MAX_MS = Number(MAX_SECONDS) * 1000 + 999;

export const BATCH_MAX_ENTRIES = 200;
export const BATCH_MAX_CHARS = 100_000;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MONTH_ABBR = MONTHS.map(name => name.slice(0, 3));

const WEEKDAY_ABBR = WEEKDAYS.map(name => name.slice(0, 3));

const pad = (n, width = 2) => String(n).padStart(width, "0");


/* =========================================================
   INSTANTS AS TEXT
========================================================= */

export function inRange(ns) {

    return ns >= MIN_NS && ns <= MAX_NS;

}

/* floor seconds and the nanoseconds after them (always 0..999999999) */
export function splitNs(ns) {

    let seconds = ns / 1_000_000_000n;
    let rest = ns % 1_000_000_000n;

    if (rest < 0n) {
        seconds -= 1n;
        rest += 1_000_000_000n;
    }

    return { seconds, nanos: Number(rest) };

}

const fractionText = (nanos) =>
    nanos === 0 ? "" : "." + String(nanos).padStart(9, "0").replace(/0+$/, "");

/* ms since the epoch of a UTC date; setUTCFullYear keeps years 0 to 99 as written */
export function utcMs(y, mo, d, h = 0, mi = 0, s = 0, ms = 0) {

    const date = new Date(0);

    date.setUTCFullYear(y, mo - 1, d);
    date.setUTCHours(h, mi, s, ms);

    return date.getTime();

}

const msOf = (ns) => Number(splitNs(ns).seconds) * 1000;

/* "2023-11-14T22:13:20Z", with a fraction only when there is one */
export function formatUtcIso(ns) {

    const { nanos } = splitNs(ns);

    const date = new Date(msOf(ns));

    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
        `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}${fractionText(nanos)}Z`;

}

/* the instant as an exact decimal in a unit: "1700000000", "1700000000.123" (never rounded) */
export function formatUnix(ns, unit) {

    const negative = ns < 0n;

    const abs = negative ? -ns : ns;

    const whole = abs / NS_PER[unit];

    let fraction = "";

    if (SCALE[unit] > 0) {

        fraction = String(abs % NS_PER[unit])
            .padStart(SCALE[unit], "0")
            .replace(/0+$/, "");

    }

    return `${negative ? "-" : ""}${whole}${fraction ? "." + fraction : ""}`;

}


/* =========================================================
   READING EPOCH TEXT
========================================================= */

const EPOCH = /^(-?)(\d+)(?:\.(\d+))?$/;

function epochProblem(text) {

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return "This looks like a date, not a Unix timestamp. Use Date to timestamp for a date.";
    }

    if (/^\+/.test(text)) {
        return "A plus sign is not accepted. Write the number without it.";
    }

    if (/^-?[\d.]+[eE][+-]?\d+$/.test(text)) {
        return "Scientific notation is not accepted because it can hide digits. Write the full number.";
    }

    if (/^-?0[xX]/.test(text)) {
        return "Hex is not accepted. Write the number in plain decimal digits.";
    }

    if (/\s/.test(text) || /[,_']/.test(text)) {
        return "Remove spaces and separators: write the number as plain digits, such as 1700000000.";
    }

    if (text === "-") {
        return "A minus sign must be followed by digits.";
    }

    if (/^-?\./.test(text) || /\.$/.test(text) || /\.\./.test(text)) {
        return "A decimal point needs digits on both sides, such as 1700000000.5.";
    }

    if (/[A-Za-z]/.test(text)) {
        return "A Unix timestamp is digits only. Letters are not accepted.";
    }

    return "Not a valid Unix timestamp. Use digits, with an optional minus sign and fraction.";

}

/* { state: "empty" | "invalid" | "ok", int, frac, negative, digits } */
export function parseEpochText(raw) {

    const text = String(raw ?? "").trim();

    if (text === "") {
        return { state: "empty" };
    }

    const match = EPOCH.exec(text);

    if (!match) {
        return { state: "invalid", message: epochProblem(text) };
    }

    const int = match[2].replace(/^0+(?=\d)/, "");

    return {
        state: "ok",
        negative: match[1] === "-",
        int,
        frac: match[3] ?? "",
        digits: int.length
    };

}

const MIN_TEXT = "0001-01-01T00:00:00Z";
const MAX_TEXT = "9999-12-31T23:59:59Z";

/* the exact instant of parsed epoch text in a unit, or why not */
export function epochToNs(parsed, unit) {

    const scale = SCALE[unit];

    let fraction = parsed.frac;

    if (fraction.length > scale) {

        if (/[^0]/.test(fraction.slice(scale))) {

            return {
                ok: false,
                error: `That has more precision than one nanosecond for ${UNIT_LABEL[unit]}. It is not rounded; shorten the fraction.`
            };

        }

        fraction = fraction.slice(0, scale);

    }

    let ns = BigInt(parsed.int) * NS_PER[unit] + (scale ? BigInt(fraction.padEnd(scale, "0")) : 0n);

    if (parsed.negative) {
        ns = -ns;
    }

    if (ns < MIN_NS) {
        return { ok: false, error: `Out of range: that is before ${MIN_TEXT}, the earliest instant this tool supports.` };
    }

    if (ns > MAX_NS) {
        return { ok: false, error: `Out of range: that is after ${MAX_TEXT}, the latest instant this tool supports.` };
    }

    return { ok: true, ns };

}


/* =========================================================
   UNIT DETECTION
   By the number of digits of the integer part (leading zeros,
   the sign and the fraction do not count):

       1-10   seconds                         certain
       11-12  seconds or milliseconds         ambiguous
       13     milliseconds                    certain
       14-15  milliseconds or microseconds    ambiguous
       16     microseconds                    certain
       17-18  microseconds or nanoseconds     ambiguous
       19     nanoseconds                     certain
       20+    none: only an explicit unit can read it
========================================================= */

export function detectUnit(digits) {

    if (digits <= 10) {
        return { kind: "certain", unit: "s", reason: `${digits === 1 ? "1 digit" : digits + " digits"}: up to 10 digits are read as seconds` };
    }

    if (digits === 13) {
        return { kind: "certain", unit: "ms", reason: "13 digits are read as milliseconds" };
    }

    if (digits === 16) {
        return { kind: "certain", unit: "us", reason: "16 digits are read as microseconds" };
    }

    if (digits === 19) {
        return { kind: "certain", unit: "ns", reason: "19 digits are read as nanoseconds" };
    }

    if (digits <= 12) {
        return { kind: "ambiguous", candidates: ["s", "ms"], reason: `${digits} digits could be seconds or milliseconds` };
    }

    if (digits <= 15) {
        return { kind: "ambiguous", candidates: ["ms", "us"], reason: `${digits} digits could be milliseconds or microseconds` };
    }

    if (digits <= 18) {
        return { kind: "ambiguous", candidates: ["us", "ns"], reason: `${digits} digits could be microseconds or nanoseconds` };
    }

    return { kind: "none", reason: `${digits} digits is longer than any automatic unit` };

}

/*
 * choice: "auto" | "s" | "ms" | "us" | "ns"
 *
 *   { state: "empty" }
 *   { state: "invalid", message }
 *   { state: "ambiguous", digits, reason, candidates: [{ unit, ns | null, error }] }
 *   { state: "ok", ns, unit, how: "digits" | "range" | "chosen", reason, digits }
 *
 * When Auto meets an ambiguous length and exactly ONE reading is inside the
 * supported range, that reading is used and the reason says so; if both are
 * in range the value stays ambiguous.
 */
export function resolveEpoch(text, choice = "auto") {

    const parsed = parseEpochText(text);

    if (parsed.state !== "ok") {
        return parsed;
    }

    if (choice !== "auto") {

        const result = epochToNs(parsed, choice);

        if (!result.ok) {
            return { state: "invalid", message: result.error };
        }

        return {
            state: "ok",
            ns: result.ns,
            unit: choice,
            how: "chosen",
            reason: `You chose ${UNIT_LABEL[choice]}`,
            digits: parsed.digits
        };

    }

    const detected = detectUnit(parsed.digits);

    if (detected.kind === "none") {

        return {
            state: "invalid",
            message: `${detected.reason}. Only nanoseconds can be this long and still be a date up to the year 9999: choose Nanoseconds in the unit list.`
        };

    }

    if (detected.kind === "certain") {

        const result = epochToNs(parsed, detected.unit);

        if (!result.ok) {
            return { state: "invalid", message: result.error };
        }

        return { state: "ok", ns: result.ns, unit: detected.unit, how: "digits", reason: detected.reason, digits: parsed.digits };

    }

    const candidates = detected.candidates.map((unit) => {

        const result = epochToNs(parsed, unit);

        return result.ok
            ? { unit, ns: result.ns, error: null }
            : { unit, ns: null, error: result.error };

    });

    const valid = candidates.filter(item => item.ns !== null);

    if (valid.length === 0) {

        return {
            state: "invalid",
            message: `${detected.reason}, and neither reading is a date between years 1 and 9999.`
        };

    }

    if (valid.length === 1) {

        const other = candidates.find(item => item.ns === null);

        return {
            state: "ok",
            ns: valid[0].ns,
            unit: valid[0].unit,
            how: "range",
            reason: `${detected.reason}; as ${UNIT_LABEL[other.unit]} it is outside the supported range, so it is read as ${UNIT_LABEL[valid[0].unit]}`,
            digits: parsed.digits
        };

    }

    return { state: "ambiguous", digits: parsed.digits, reason: detected.reason, candidates };

}


/* =========================================================
   TIME ZONES (Intl, never hand-written offsets)
========================================================= */

export const COMMON_ZONES = [
    "UTC",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland"
];

const formatters = new Map();

function partsFormatter(zone) {

    let formatter = formatters.get(zone);

    if (!formatter) {

        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            calendar: "gregory",
            numberingSystem: "latn",
            hourCycle: "h23",
            era: "short",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });

        formatters.set(zone, formatter);

    }

    return formatter;

}

const abbrFormatters = new Map();

function abbrFormatter(zone) {

    let formatter = abbrFormatters.get(zone);

    if (!formatter) {

        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            timeZoneName: "short"
        });

        abbrFormatters.set(zone, formatter);

    }

    return formatter;

}

export function isValidZone(zone) {

    if (typeof zone !== "string" || zone.trim() === "") {
        return false;
    }

    try {

        partsFormatter(zone);

        return true;

    } catch (problem) {

        return false;

    }

}

export function localZone() {

    try {

        return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    } catch (problem) {

        return "UTC";

    }

}

/* every zone the browser lists, or the common list where it cannot */
export function listZones() {

    try {

        if (typeof Intl.supportedValuesOf === "function") {

            const all = Intl.supportedValuesOf("timeZone");

            if (all.length > 0) {
                return all;
            }

        }

    } catch (problem) {
        /* fall back */
    }

    return COMMON_ZONES.filter(isValidZone);

}

/* the wall-clock fields of an instant (ms, a whole second) in a zone */
function wallFromMs(ms, zone) {

    const fields = {};

    for (const part of partsFormatter(zone).formatToParts(new Date(ms))) {

        if (part.type !== "literal") {
            fields[part.type] = part.value;
        }

    }

    /* years before 1 AD come back as a BC year; use the astronomical year (1 BC is 0) so the arithmetic stays right */
    return {
        y: fields.era === "BC" ? 1 - Number(fields.year) : Number(fields.year),
        mo: Number(fields.month),
        d: Number(fields.day),
        h: Number(fields.hour) % 24,
        mi: Number(fields.minute),
        s: Number(fields.second)
    };

}

const clampMs = (ms) => Math.min(MAX_MS, Math.max(MIN_MS, ms));

/* the zone's offset from UTC, in seconds, at an instant */
export function offsetSecondsAt(ms, zone) {

    const whole = Math.floor(clampMs(ms) / 1000) * 1000;

    const wall = wallFromMs(whole, zone);

    return (utcMs(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s) - whole) / 1000;

}

function offsetText(seconds, prefix) {

    const sign = seconds < 0 ? "-" : "+";

    const abs = Math.abs(seconds);

    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;

    return `${prefix}${sign}${pad(h)}:${pad(m)}${s ? ":" + pad(s) : ""}`;

}

/*
 * An instant as seen in a zone:
 *   iso      "2023-11-15T03:43:20+05:30"
 *   display  "Wednesday, 15 November 2023 at 03:43:20"
 *   offset   "UTC+05:30"
 */
export function describeInZone(ns, zone) {

    const { nanos } = splitNs(ns);

    const ms = msOf(ns);

    const wall = wallFromMs(ms, zone);

    const offset = (utcMs(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s) - ms) / 1000;

    const clock = `${pad(wall.h)}:${pad(wall.mi)}:${pad(wall.s)}${fractionText(nanos)}`;

    const weekday = WEEKDAYS[new Date(utcMs(wall.y, wall.mo, wall.d)).getUTCDay()];

    let abbr = "";

    try {

        abbr = abbrFormatter(zone).formatToParts(new Date(ms)).find(part => part.type === "timeZoneName")?.value ?? "";

    } catch (problem) {
        abbr = "";
    }

    return {
        zone,
        iso: `${pad(wall.y, 4)}-${pad(wall.mo)}-${pad(wall.d)}T${clock}${offsetText(offset, "")}`,
        display: `${weekday}, ${wall.d} ${MONTHS[wall.mo - 1]} ${wall.y} at ${clock}`,
        weekday,
        offsetSeconds: offset,
        offset: offsetText(offset, "UTC"),
        abbr
    };

}


/* =========================================================
   RELATIVE TIME
========================================================= */

/* "3 hours ago", "in 2 days", "about 2 years ago" (approximate beyond days) */
export function relativeText(deltaSeconds) {

    const future = deltaSeconds > 0;

    const abs = Math.abs(deltaSeconds);

    if (abs < 1) {
        return "now";
    }

    const days = abs / 86400;

    let count;
    let unit;
    let about = false;

    if (abs < 60) {
        count = Math.floor(abs);
        unit = "second";
    } else if (abs < 3600) {
        count = Math.floor(abs / 60);
        unit = "minute";
    } else if (abs < 86400) {
        count = Math.floor(abs / 3600);
        unit = "hour";
    } else if (days < 30.4375) {
        count = Math.floor(days);
        unit = "day";
    } else if (days < 365.2425) {
        count = Math.floor(days / 30.4375);
        unit = "month";
        about = true;
    } else {
        count = Math.floor(days / 365.2425);
        unit = "year";
        about = true;
    }

    const phrase = `${about ? "about " : ""}${count} ${unit}${count === 1 ? "" : "s"}`;

    return future ? `in ${phrase}` : `${phrase} ago`;

}

export function relativeToNow(ns, nowMs) {

    const delta = Number(splitNs(ns).seconds) - Math.floor(nowMs / 1000);

    return relativeText(delta);

}


/* =========================================================
   READING A DATE AND TIME (strict ISO 8601 and RFC 2822)
========================================================= */

const ISO =
    /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?)?\s*(Z|z|[+-]\d{2}(?::?\d{2})?)?$/;

const RFC =
    /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*)?(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+([+-]\d{4}|GMT|UT)$/i;

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const daysIn = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

function checkFields(y, mo, d, h, mi, s) {

    if (y < 1 || y > 9999) {
        return "The year must be between 0001 and 9999.";
    }

    if (mo < 1 || mo > 12) {
        return `${pad(mo)} is not a month (1 to 12).`;
    }

    if (d < 1 || d > daysIn(y, mo)) {
        return `${MONTHS[mo - 1]} ${y} does not have a day ${d}.`;
    }

    if (h === 24) {
        return "Hour 24 is not accepted. Write 00:00 of the next day.";
    }

    if (h > 23) {
        return `${pad(h)} is not an hour (0 to 23).`;
    }

    if (mi > 59) {
        return `${pad(mi)} is not a minute (0 to 59).`;
    }

    if (s === 60) {
        return "Second 60 (a leap second) is not supported. Unix time has no leap seconds.";
    }

    if (s > 59) {
        return `${pad(s)} is not a second (0 to 59).`;
    }

    return null;

}

function readOffset(text) {

    if (text === undefined || text === "") {
        return { given: false };
    }

    if (text === "Z" || text === "z") {
        return { given: true, seconds: 0 };
    }

    const sign = text[0] === "-" ? -1 : 1;

    const digits = text.slice(1).replace(":", "");

    const h = Number(digits.slice(0, 2));
    const m = digits.length > 2 ? Number(digits.slice(2)) : 0;

    if (h > 23 || m > 59) {
        return { given: true, error: `The offset ${text} is not valid (hours 0 to 23, minutes 0 to 59).` };
    }

    return { given: true, seconds: sign * (h * 3600 + m * 60) };

}

/*
 * { ok: true, wall: { y, mo, d, h, mi, s, nanos }, offset: seconds | null, hasTime, format }
 * { ok: false, message }
 */
export function parseDateTimeText(raw) {

    const text = String(raw ?? "").trim();

    if (text === "") {
        return { ok: false, empty: true, message: "" };
    }

    let match = ISO.exec(text);

    if (match) {

        const [, y, mo, d, h, mi, s, fraction, zoneText] = match;

        const hasTime = h !== undefined;

        if (!hasTime && zoneText) {
            return { ok: false, message: "A date without a time cannot have an offset. Add a time, such as 2023-11-14T00:00:00Z." };
        }

        const problem = checkFields(Number(y), Number(mo), Number(d), Number(h ?? 0), Number(mi ?? 0), Number(s ?? 0));

        if (problem) {
            return { ok: false, message: problem };
        }

        const offset = readOffset(zoneText);

        if (offset.error) {
            return { ok: false, message: offset.error };
        }

        return {
            ok: true,
            format: "ISO 8601",
            hasTime,
            offset: offset.given ? offset.seconds : null,
            wall: {
                y: Number(y),
                mo: Number(mo),
                d: Number(d),
                h: Number(h ?? 0),
                mi: Number(mi ?? 0),
                s: Number(s ?? 0),
                nanos: fraction ? Number(fraction.padEnd(9, "0")) : 0
            }
        };

    }

    match = RFC.exec(text);

    if (match) {

        const [, weekday, d, monthName, y, h, mi, s, zoneText] = match;

        const mo = MONTH_ABBR.findIndex(name => name.toLowerCase() === monthName.toLowerCase()) + 1;

        const problem = checkFields(Number(y), mo, Number(d), Number(h), Number(mi), Number(s ?? 0));

        if (problem) {
            return { ok: false, message: problem };
        }

        if (weekday) {

            const actual = WEEKDAY_ABBR[new Date(utcMs(Number(y), mo, Number(d))).getUTCDay()];

            if (actual.toLowerCase() !== weekday.toLowerCase()) {
                return { ok: false, message: `${d} ${monthName} ${y} is a ${WEEKDAYS[WEEKDAY_ABBR.indexOf(actual)]}, not a ${weekday}.` };
            }

        }

        const zone = /^(GMT|UT)$/i.test(zoneText) ? "Z" : zoneText;

        const offset = readOffset(zone);

        if (offset.error) {
            return { ok: false, message: offset.error };
        }

        return {
            ok: true,
            format: "RFC 2822",
            hasTime: true,
            offset: offset.seconds,
            wall: { y: Number(y), mo, d: Number(d), h: Number(h), mi: Number(mi), s: Number(s ?? 0), nanos: 0 }
        };

    }

    if (/^-?\d+(\.\d+)?$/.test(text)) {
        return { ok: false, message: "That is a Unix timestamp. Use Timestamp to date for it." };
    }

    if (/\b(today|tomorrow|yesterday|next|last|ago|now|noon|midnight|morning|evening|night|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) {
        return { ok: false, message: "Natural-language dates are not accepted. Use ISO 8601, such as 2023-11-14T22:13:20Z, or RFC 2822." };
    }

    if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/.test(text)) {
        return { ok: false, message: "A day-month-year or month-day-year date is ambiguous and is not accepted. Write the year first: 2023-11-14." };
    }

    return {
        ok: false,
        message: "Not recognised. Use ISO 8601, such as 2023-11-14T22:13:20+05:30 or 2023-11-14 22:13:20, or RFC 2822, such as Tue, 14 Nov 2023 22:13:20 +0000."
    };

}


/* =========================================================
   A LOCAL TIME IN A ZONE: unique, a gap, or an overlap
========================================================= */

const HOUR_MS = 3_600_000;

/* the moment (to the second) the zone's offset first differs from `before`, between two instants */
function findTransition(lowMs, highMs, before, zone) {

    let low = Math.floor(lowMs / 1000) * 1000;
    let high = Math.floor(highMs / 1000) * 1000;

    if (offsetSecondsAt(high, zone) === before) {
        return null;
    }

    while (high - low > 1000) {

        const middle = Math.floor((low + high) / 2000) * 1000;

        if (offsetSecondsAt(middle, zone) === before) {
            low = middle;
        } else {
            high = middle;
        }

    }

    return high;

}

function clockText(wall) {

    return `${pad(wall.h)}:${pad(wall.mi)}:${pad(wall.s)}`;

}

/*
 * kind: "unique" | "overlap" | "gap"
 *   unique, overlap: candidates [{ ns, offsetSeconds }] in time order
 *   gap: detail "clocks in X went from 01:59:59 (UTC-05:00) to 03:00:00 (UTC-04:00) on 2023-03-12"
 */
export function resolveWallTime(wall, zone) {

    const asUtc = utcMs(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s);

    const offsets = new Set();

    for (let hours = -36; hours <= 36; hours += 6) {
        offsets.add(offsetSecondsAt(asUtc + hours * HOUR_MS, zone));
    }

    const candidates = [];

    for (const offset of offsets) {

        const at = asUtc - offset * 1000;

        if (at < MIN_MS || at > MAX_MS) {
            continue;
        }

        if (offsetSecondsAt(at, zone) === offset) {

            candidates.push({
                ns: BigInt(at) * 1_000_000n + BigInt(wall.nanos),
                offsetSeconds: offset
            });

        }

    }

    candidates.sort((a, b) => (a.ns < b.ns ? -1 : a.ns > b.ns ? 1 : 0));

    if (candidates.length === 1) {
        return { kind: "unique", candidates };
    }

    if (candidates.length > 1) {
        return { kind: "overlap", candidates };
    }

    /* a gap: say what the clocks did */

    let detail = "";

    const lowMs = clampMs(asUtc - 36 * HOUR_MS);
    const highMs = clampMs(asUtc + 36 * HOUR_MS);

    const before = offsetSecondsAt(lowMs, zone);

    const at = findTransition(lowMs, highMs, before, zone);

    if (at !== null) {

        const last = wallFromMs(at - 1000, zone);
        const first = wallFromMs(at, zone);

        detail =
            `At that moment the clocks in ${zone} went from ${clockText(last)} (${offsetText(before, "UTC")}) ` +
            `to ${clockText(first)} (${offsetText(offsetSecondsAt(at, zone), "UTC")}) ` +
            `on ${pad(first.y, 4)}-${pad(first.mo)}-${pad(first.d)}.`;

    }

    return { kind: "gap", candidates: [], detail };

}

/*
 * A date and time text (and the zone to read it in when it has no offset) as an instant.
 *
 *   { state: "empty" }
 *   { state: "invalid", message }
 *   { state: "gap", message, detail }
 *   { state: "ok", kind: "unique" | "overlap" | "offset", format, zoneUsed, candidates: [{ ns, offsetSeconds }] }
 */
export function dateTimeToInstants(text, zone) {

    const parsed = parseDateTimeText(text);

    if (!parsed.ok) {

        return parsed.empty
            ? { state: "empty" }
            : { state: "invalid", message: parsed.message };

    }

    const { wall } = parsed;

    if (parsed.offset !== null) {

        const at = utcMs(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s) - parsed.offset * 1000;

        const ns = BigInt(at) * 1_000_000n + BigInt(wall.nanos);

        if (!inRange(ns)) {
            return { state: "invalid", message: "Out of range: with that offset the instant falls outside years 1 to 9999." };
        }

        return {
            state: "ok",
            kind: "offset",
            format: parsed.format,
            hasTime: parsed.hasTime,
            candidates: [{ ns, offsetSeconds: parsed.offset }]
        };

    }

    if (!isValidZone(zone)) {
        return { state: "invalid", message: "Choose a valid time zone." };
    }

    const resolved = resolveWallTime(wall, zone);

    if (resolved.kind === "gap") {

        return {
            state: "gap",
            message: "This local time does not exist in the selected time zone because of a daylight-saving transition.",
            detail: resolved.detail
        };

    }

    return {
        state: "ok",
        kind: resolved.kind,
        format: parsed.format,
        hasTime: parsed.hasTime,
        zoneUsed: zone,
        candidates: resolved.candidates
    };

}


/* =========================================================
   BATCH
========================================================= */

/* a standalone number of 10, 13, 16 or 19 digits, not part of a longer word or number */
const STANDALONE = /(?<![A-Za-z0-9_.])(-?)(\d{10}|\d{13}|\d{16}|\d{19})(\.\d+)?(?![A-Za-z0-9_])/g;

const excerpt = (text) => (text.length > 60 ? text.slice(0, 57) + "..." : text);

/*
 * Each non-empty line is one entry (a line that is only an epoch value) or
 * contributes every standalone 10, 13, 16 or 19 digit number it holds; a line
 * with none is a "none" entry. At most BATCH_MAX_ENTRIES are kept; the rest are counted.
 */
export function extractBatch(text) {

    const lines = String(text ?? "").slice(0, BATCH_MAX_CHARS).split(/\r?\n/);

    const entries = [];

    let total = 0;

    lines.forEach((raw, index) => {

        const line = raw.trim();

        if (line === "") {
            return;
        }

        const found = [];

        if (EPOCH.test(line)) {

            found.push({ kind: "value", token: line });

        } else {

            for (const match of line.matchAll(STANDALONE)) {
                found.push({ kind: "value", token: match[0] });
            }

            if (found.length === 0) {
                found.push({ kind: "none", token: excerpt(line) });
            }

        }

        for (const item of found) {

            total++;

            if (entries.length < BATCH_MAX_ENTRIES) {
                entries.push({ line: index + 1, ...item });
            }

        }

    });

    return {
        entries,
        total,
        truncatedInput: String(text ?? "").length > BATCH_MAX_CHARS
    };

}

/* rows: { line, token, ok, unitText, utc, local, message } */
export function convertBatch(text, choice, zone) {

    const { entries, total, truncatedInput } = extractBatch(text);

    let converted = 0;

    const rows = entries.map((entry) => {

        if (entry.kind === "none") {

            return {
                line: entry.line,
                token: entry.token,
                ok: false,
                message: "No timestamp found in this line. The batch looks for numbers of 10, 13, 16 or 19 digits."
            };

        }

        const result = resolveEpoch(entry.token, choice);

        if (result.state === "invalid") {
            return { line: entry.line, token: entry.token, ok: false, message: result.message };
        }

        if (result.state === "ambiguous") {

            return {
                line: entry.line,
                token: entry.token,
                ok: false,
                message: `Ambiguous unit: ${result.reason}. Choose a unit above.`
            };

        }

        converted++;

        const suffix = result.how === "chosen" ? " (chosen)" : result.how === "range" ? " (only valid reading)" : "";

        return {
            line: entry.line,
            token: entry.token,
            ok: true,
            unitText: `${UNIT_LABEL[result.unit]}${suffix}`,
            utc: formatUtcIso(result.ns),
            local: describeInZone(result.ns, zone).iso
        };

    });

    return {
        rows,
        total,
        shown: rows.length,
        converted,
        problems: rows.length - converted,
        truncatedInput
    };

}

/* the table as tab-separated text, for pasting into a spreadsheet */
export function batchToTsv(rows, zone) {

    const lines = [["Line", "Value", "Unit", "UTC", zone].join("\t")];

    for (const row of rows) {

        lines.push(
            row.ok
                ? [row.line, row.token, row.unitText, row.utc, row.local].join("\t")
                : [row.line, row.token, "", `Not converted: ${row.message}`, ""].join("\t")
        );

    }

    return lines.join("\n");

}


/* =========================================================
   THE LIVE CLOCK
========================================================= */

/* the Unix time of a wall-clock reading (Date.now()), as exact strings */
export function nowUnix(nowMs) {

    return {
        seconds: String(Math.floor(nowMs / 1000)),
        milliseconds: String(nowMs)
    };

}

/* milliseconds until just after the next whole second, so the display changes once a second, on the second */
export function msToNextSecond(nowMs) {

    return 1000 - (((nowMs % 1000) + 1000) % 1000) + 15;

}
