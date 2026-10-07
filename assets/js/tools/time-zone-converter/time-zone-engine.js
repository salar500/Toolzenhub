/* =========================================================
   ToolZen Hub
   Time Zone Converter: the engine (pure, no DOM, no clock of its own)

   The rules are frozen in docs/tool-packs/19-time-zone-converter.md.

   INSTANT
       An integer number of milliseconds since the epoch. Minute
       precision is all this product needs.

   TIME ZONES come from Intl.DateTimeFormat (the browser's IANA
   data); offsets are never written by hand and are never a
   property of a zone NAME: they are always the offset in force at
   a given instant.

   A WALL TIME in a zone ("2026-03-08 02:30 in America/New_York")
   has one instant, two (the clocks went back) or none (the clocks
   went forward). Two and none are reported, never resolved
   silently.

   This is deliberately independent of the Unix Timestamp
   Converter's engine (see the spec): that one is built on BigInt
   nanoseconds and ships with batch and epoch parsing, so
   importing it would add about forty kilobytes for a hundred
   lines of need. Correctness is checked against an independent
   Python reference (tests/fixtures/time-zone-golden.py).
========================================================= */

export const MAX_ZONES = 6;
export const MAX_TARGETS = MAX_ZONES - 1;
export const GRID_MINUTES = 15;
export const DURATIONS = Object.freeze([15, 30, 45, 60, 90]);
export const DEFAULT_DURATION = 30;
export const DEFAULT_HOURS = Object.freeze({ start: "09:00", end: "17:00" });
export const MIN_YEAR = 1970;
export const MAX_YEAR = 2100;
export const MAX_RESULT_WINDOWS = 6;

export const UNSUPPORTED_ZONE = "This time zone is not supported by this browser.";

const MINUTE = 60000;
const HOUR = 3600000;
const DAY = 86400000;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const pad = (n, width = 2) => String(n).padStart(width, "0");

const floorDiv = (a, b) => Math.floor(a / b);


/* =========================================================
   Calendar text (no zone involved)
========================================================= */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/* { y, mo, d } for a real calendar date inside the supported years, else null */
export function parseDate(text) {

    const match = DATE_PATTERN.exec(String(text));

    if (!match) {
        return null;
    }

    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);

    if (y < MIN_YEAR || y > MAX_YEAR || mo < 1 || mo > 12 || d < 1) {
        return null;
    }

    const real = new Date(Date.UTC(y, mo - 1, d));

    if (real.getUTCMonth() !== mo - 1 || real.getUTCDate() !== d) {
        return null;
    }

    return { y, mo, d };

}

/* { h, mi } for HH:MM, else null */
export function parseTime(text) {

    const match = TIME_PATTERN.exec(String(text));

    return match ? { h: Number(match[1]), mi: Number(match[2]) } : null;

}

export function addDays(dateText, days) {

    const date = parseDate(dateText);

    if (!date) {
        return null;
    }

    const shifted = new Date(Date.UTC(date.y, date.mo - 1, date.d) + days * DAY);

    const text = `${pad(shifted.getUTCFullYear(), 4)}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;

    return parseDate(text) ? text : null;

}

const dayNumber = (y, mo, d) => floorDiv(Date.UTC(y, mo - 1, d), DAY);


/* =========================================================
   Zones
========================================================= */

/* an IANA-looking identifier: letters first, no "+05:30" style offsets */
const ZONE_SHAPE = /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/;

const formatters = new Map();

function partsFormatter(zone) {

    let formatter = formatters.get(zone);

    if (!formatter) {

        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            calendar: "gregory",
            numberingSystem: "latn",
            hourCycle: "h23",
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

export function abbreviationAt(ms, zone) {

    try {

        let formatter = abbrFormatters.get(zone);

        if (!formatter) {
            formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" });
            abbrFormatters.set(zone, formatter);
        }

        const name = formatter.formatToParts(new Date(ms)).find((part) => part.type === "timeZoneName")?.value ?? "";

        /* "GMT+5:30" style names are not abbreviations; only real ones are shown */
        return /^[A-Z]{2,5}$/.test(name) ? name : "";

    } catch (problem) {

        return "";

    }

}

export function isValidZone(zone) {

    if (typeof zone !== "string" || zone.length > 64 || !ZONE_SHAPE.test(zone)) {
        return false;
    }

    try {

        partsFormatter(zone);

        return true;

    } catch (problem) {

        return false;

    }

}

/*
 * The browser's own identity for a zone: two spellings of one zone
 * (Asia/Kolkata and Asia/Calcutta) share it, so the same zone is never
 * listed twice under different names.
 */
export function canonicalZone(zone) {

    try {

        return new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone || zone;

    } catch (problem) {

        return zone;

    }

}

export const sameZone = (a, b) => a === b || canonicalZone(a) === canonicalZone(b);

export function localZone() {

    try {

        return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    } catch (problem) {

        return "UTC";

    }

}

/* a few zones browsers often still list under the old name: the modern spelling is offered too */
export const MODERN_NAMES = Object.freeze({
    "Asia/Kolkata": "Asia/Calcutta",
    "Asia/Kathmandu": "Asia/Katmandu",
    "Asia/Ho_Chi_Minh": "Asia/Saigon",
    "Asia/Yangon": "Asia/Rangoon",
    "Europe/Kyiv": "Europe/Kiev"
});

const LEGACY_TO_MODERN = Object.freeze(Object.fromEntries(Object.entries(MODERN_NAMES).map(([modern, legacy]) => [legacy, modern])));

/* used only where the browser cannot list its zones */
export const COMMON_ZONES = Object.freeze([
    "UTC",
    "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
    "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Africa/Johannesburg", "Asia/Dubai", "Asia/Kolkata", "Asia/Kathmandu",
    "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "Australia/Lord_Howe",
    "Pacific/Auckland", "Pacific/Honolulu"
]);

/* the quick-add buttons */
export const QUICK_ZONES = Object.freeze([
    "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Australia/Sydney"
]);

let zoneCache = null;

export function listZones() {

    if (zoneCache) {
        return zoneCache;
    }

    let zones = [];

    try {

        if (typeof Intl.supportedValuesOf === "function") {
            zones = Intl.supportedValuesOf("timeZone").slice();
        }

    } catch (problem) {
        zones = [];
    }

    if (zones.length === 0) {
        zones = COMMON_ZONES.filter(isValidZone);
    }

    const have = new Set(zones);

    for (const extra of ["UTC", ...Object.keys(MODERN_NAMES)]) {

        if (!have.has(extra) && isValidZone(extra)) {
            zones.push(extra);
            have.add(extra);
        }

    }

    zoneCache = zones.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    return zoneCache;

}

const normalizeSearch = (text) => String(text).toLowerCase().replace(/[_/\-]+/g, " ").replace(/\s+/g, " ").trim();

/*
 * Zones matching what the visitor typed: every typed word must appear in the
 * name (case, underscores, slashes and hyphens ignored; an old spelling also
 * finds its modern name and the other way round). Ranked: the city is the
 * query, the city starts with it, a word starts with it, anything else.
 */
export function searchZones(query, zones = listZones(), limit = 8) {

    const q = normalizeSearch(query);

    if (q === "") {
        return [];
    }

    const words = q.split(" ");

    const scored = [];

    for (const zone of zones) {

        const name = normalizeSearch(zone);

        const other = MODERN_NAMES[zone] ?? LEGACY_TO_MODERN[zone];

        const hay = other ? `${name} ${normalizeSearch(other)}` : name;

        if (!words.every((word) => hay.includes(word))) {
            continue;
        }

        const cities = [name.split(" ").slice(1).join(" ") || name];

        if (other) {
            cities.push(normalizeSearch(other).split(" ").slice(1).join(" "));
        }

        let score = 3;

        if (cities.some((city) => city === q)) {
            score = 0;
        } else if (cities.some((city) => city.startsWith(q))) {
            score = 1;
        } else if (hay.split(" ").some((w) => w.startsWith(words[0]))) {
            score = 2;
        }

        scored.push({ zone, score, legacy: zone in LEGACY_TO_MODERN ? 1 : 0 });

    }

    scored.sort((a, b) => a.score - b.score || a.legacy - b.legacy || a.zone.length - b.zone.length || (a.zone < b.zone ? -1 : 1));

    return scored.slice(0, limit).map((entry) => entry.zone);

}


/* =========================================================
   An instant in a zone
========================================================= */

function wallFields(ms, zone) {

    const fields = {};

    for (const part of partsFormatter(zone).formatToParts(new Date(ms))) {

        if (part.type !== "literal") {
            fields[part.type] = Number(part.value);
        }

    }

    return {
        y: fields.year,
        mo: fields.month,
        d: fields.day,
        h: fields.hour % 24,
        mi: fields.minute,
        s: fields.second
    };

}

/* the zone's offset from UTC in seconds at an instant */
export function offsetSecondsAt(ms, zone) {

    const whole = Math.floor(ms / 1000) * 1000;

    const w = wallFields(whole, zone);

    return (Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) - whole) / 1000;

}

/* the wall clock of an instant in a zone */
export function wallAt(ms, zone) {

    const whole = Math.floor(ms / 1000) * 1000;

    const w = wallFields(whole, zone);

    const offsetSeconds = (Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) - whole) / 1000;

    return {
        y: w.y,
        mo: w.mo,
        d: w.d,
        h: w.h,
        mi: w.mi,
        offsetSeconds,
        date: `${pad(w.y, 4)}-${pad(w.mo)}-${pad(w.d)}`,
        time: `${pad(w.h)}:${pad(w.mi)}`,
        minuteOfDay: w.h * 60 + w.mi,
        dayNumber: dayNumber(w.y, w.mo, w.d),
        weekdayIndex: new Date(Date.UTC(w.y, w.mo - 1, w.d)).getUTCDay()
    };

}

/* "UTC+05:30", "UTC−04:00" (a real minus sign for people), or ASCII for text that is copied */
export function offsetLabel(seconds, ascii = false) {

    const minus = ascii ? "-" : "−";

    const sign = seconds < 0 ? minus : "+";

    const abs = Math.abs(seconds);

    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;

    return `UTC${sign}${pad(h)}:${pad(m)}${s ? ":" + pad(s) : ""}`;

}

export function formatClock(h, mi, hour12) {

    if (!hour12) {
        return `${pad(h)}:${pad(mi)}`;
    }

    return `${h % 12 === 0 ? 12 : h % 12}:${pad(mi)} ${h < 12 ? "AM" : "PM"}`;

}

export function relationLabel(delta) {

    if (delta === 0) return "Same day";
    if (delta === 1) return "Next day";
    if (delta === -1) return "Previous day";

    return delta > 0 ? `${delta} days later` : `${-delta} days earlier`;

}

/*
 * An instant as shown in a zone. `fromDayNumber` is the local day of the
 * source, so the relation compares calendar dates, not 24-hour spans.
 */
export function describeInZone(ms, zone, fromDayNumber = null) {

    const w = wallAt(ms, zone);

    const dayDelta = fromDayNumber === null ? 0 : w.dayNumber - fromDayNumber;

    return {
        zone,
        ms,
        y: w.y,
        mo: w.mo,
        d: w.d,
        h: w.h,
        mi: w.mi,
        date: w.date,
        time: w.time,
        minuteOfDay: w.minuteOfDay,
        weekday: WEEKDAYS[w.weekdayIndex],
        monthName: MONTHS[w.mo - 1],
        dateLabel: `${WEEKDAYS[w.weekdayIndex]}, ${w.d} ${MONTHS[w.mo - 1]} ${w.y}`,
        offsetSeconds: w.offsetSeconds,
        offset: offsetLabel(w.offsetSeconds),
        abbr: abbreviationAt(ms, zone),
        dayDelta,
        relation: relationLabel(dayDelta)
    };

}


/* =========================================================
   A wall time in a zone, as instants
========================================================= */

/*
 * { kind: "unique" | "overlap", candidates: [{ ms, offsetSeconds }] }   (time order)
 * { kind: "gap", candidates: [], gap: { transitionMs, fromOffset, toOffset, last, first, lastTime, firstTime, date } }
 *
 * `last` and `first` are the clock readings either side of the jump.
 */
export function resolveWall(dateText, timeText, zone) {

    const date = parseDate(dateText);
    const time = parseTime(timeText);

    const asUtc = Date.UTC(date.y, date.mo - 1, date.d, time.h, time.mi);

    /* every offset the zone has within a day and a half either side, found by sampling */
    const offsets = new Set();

    for (let hours = -36; hours <= 36; hours += 6) {
        offsets.add(offsetSecondsAt(asUtc + hours * HOUR, zone));
    }

    const candidates = [];

    for (const offset of offsets) {

        const at = asUtc - offset * 1000;

        if (offsetSecondsAt(at, zone) === offset) {
            candidates.push({ ms: at, offsetSeconds: offset });
        }

    }

    candidates.sort((a, b) => a.ms - b.ms);

    if (candidates.length === 1) {
        return { kind: "unique", candidates };
    }

    if (candidates.length > 1) {
        return { kind: "overlap", candidates };
    }

    return { kind: "gap", candidates: [], gap: findGap(asUtc, zone) };

}

/* the clock jump that skipped the reading `asUtc` (the reading as if it were UTC) */
function findGap(asUtc, zone) {

    let previous = asUtc - 36 * HOUR;

    let previousOffset = offsetSecondsAt(previous, zone);

    for (let at = previous + HOUR; at <= asUtc + 36 * HOUR; at += HOUR) {

        const offset = offsetSecondsAt(at, zone);

        if (offset !== previousOffset) {

            /* the first second with the new offset, by bisection */
            let low = previous;
            let high = at;

            while (high - low > 1000) {

                const mid = Math.floor((low + high) / 2000) * 1000;

                if (offsetSecondsAt(mid, zone) === previousOffset) {
                    low = mid;
                } else {
                    high = mid;
                }

            }

            const lastWall = wallAt(high - 1000, zone);
            const firstWall = wallAt(high, zone);

            const lastReading = Date.UTC(lastWall.y, lastWall.mo - 1, lastWall.d, lastWall.h, lastWall.mi);
            const firstReading = Date.UTC(firstWall.y, firstWall.mo - 1, firstWall.d, firstWall.h, firstWall.mi);

            if (lastReading < asUtc && asUtc < firstReading) {

                return {
                    transitionMs: high,
                    fromOffset: previousOffset,
                    toOffset: offset,
                    date: lastWall.date,
                    lastTime: lastWall.time,
                    firstTime: firstWall.time
                };

            }

        }

        previous = at;
        previousOffset = offset;

    }

    return null;

}

/* "Earlier" or "Later" for the instant `ms` among a wall time's candidates, or null when the time is not repeated */
export function occurrenceOf(ms, dateText, timeText, zone) {

    const resolved = resolveWall(dateText, timeText, zone);

    if (resolved.kind !== "overlap") {
        return null;
    }

    const index = resolved.candidates.findIndex((candidate) => candidate.ms === ms);

    if (index < 0) {
        return null;
    }

    return index === 0 ? "earlier" : "later";

}

/* the date and time (and overlap choice) that, read in `zone`, name exactly the instant `ms` */
export function wallInputFor(ms, zone) {

    const w = wallAt(ms, zone);

    return {
        date: w.date,
        time: w.time,
        choice: occurrenceOf(ms, w.date, w.time, zone)
    };

}

/* the current minute as a date and time in a zone */
export function nowInZone(nowMs, zone) {

    const w = wallAt(Math.floor(nowMs / MINUTE) * MINUTE, zone);

    return { date: w.date, time: w.time };

}


/* =========================================================
   The conversion
========================================================= */

const clockWords = (text, hour12) => {

    const t = parseTime(text);

    return formatClock(t.h, t.mi, hour12);

};

/*
 * input: { date, time, source, targets: [zone], choice: "earlier" | "later" | null, hour12 }
 *
 * status "invalid"      { field: "date" | "time", message }
 *        "unsupported"  { zone, message }
 *        "gap"          { message, detail, nearest: { before, after } }
 *        "ambiguous"    { message, options: [{ choice, ms, offsetSeconds, label }] }
 *        "ok"           { ms, source: describe, rows: [describe...] }
 */
export function convert(input) {

    const { date, time, source, targets = [], hour12 = false } = input;

    const choice = input.choice ?? null;

    if (!parseDate(date)) {

        return { status: "invalid", field: "date", message: `Enter a valid date between ${MIN_YEAR} and ${MAX_YEAR}.` };

    }

    if (!parseTime(time)) {

        return { status: "invalid", field: "time", message: "Enter a valid time." };

    }

    for (const zone of [source, ...targets]) {

        if (!isValidZone(zone)) {
            return { status: "unsupported", zone, message: UNSUPPORTED_ZONE };
        }

    }

    const resolved = resolveWall(date, time, source);

    if (resolved.kind === "gap") {

        const gap = resolved.gap;

        return {
            status: "gap",
            message: "This local time does not exist in this time zone because of a daylight-saving transition.",
            detail: gap
                ? `On ${gap.date} the clocks in ${source} went from ${clockWords(gap.lastTime, hour12)} (${offsetLabel(gap.fromOffset)}) to ${clockWords(gap.firstTime, hour12)} (${offsetLabel(gap.toOffset)}).`
                : "",
            nearest: gap ? { before: gap.lastTime, after: gap.firstTime, date: gap.date } : null
        };

    }

    let chosen = resolved.candidates[0];

    let options = null;

    if (resolved.kind === "overlap") {

        options = resolved.candidates.map((candidate, index) => ({
            choice: index === 0 ? "earlier" : "later",
            ms: candidate.ms,
            offsetSeconds: candidate.offsetSeconds,
            label: `${index === 0 ? "Earlier" : "Later"} occurrence: ${clockWords(time, hour12)} ${offsetLabel(candidate.offsetSeconds)}`
        }));

        if (choice !== "earlier" && choice !== "later") {

            return {
                status: "ambiguous",
                message: `${clockWords(time, hour12)} happens twice in ${source} on ${date} because the clocks go back. Choose which one you mean.`,
                options
            };

        }

        chosen = resolved.candidates[choice === "earlier" ? 0 : 1];

    }

    const from = describeInZone(chosen.ms, source);

    return {
        status: "ok",
        ms: chosen.ms,
        overlapChoice: resolved.kind === "overlap" ? choice : null,
        options,
        source: from,
        rows: targets.map((zone) => describeInZone(chosen.ms, zone, wallAt(chosen.ms, source).dayNumber))
    };

}

/*
 * Swap the source with the first destination without changing the instant.
 * `state` is { source, targets, date, time, choice } with a converted result `result` (status "ok").
 */
export function swapSource(state, result) {

    if (!result || result.status !== "ok" || state.targets.length === 0) {
        return null;
    }

    const newSource = state.targets[0];

    return {
        source: newSource,
        targets: [state.source, ...state.targets.slice(1)],
        ...wallInputFor(result.ms, newSource)
    };

}

/* add a destination: { ok, targets } or { ok: false, message } */
export function addZone(source, targets, zone) {

    if (!isValidZone(zone)) {
        return { ok: false, message: UNSUPPORTED_ZONE };
    }

    if (sameZone(zone, source) || targets.some((existing) => sameZone(zone, existing))) {
        return { ok: false, message: `${zone} is already in the list.` };
    }

    if (targets.length >= MAX_TARGETS) {
        return { ok: false, message: `You can compare up to ${MAX_ZONES} time zones, the source and ${MAX_TARGETS} others. Remove one to add another.` };
    }

    return { ok: true, targets: [...targets, zone] };

}

export function removeZone(targets, zone) {

    return targets.filter((candidate) => candidate !== zone);

}


/* =========================================================
   Text to copy
========================================================= */

/* plain readable lines, in the chosen clock format, with ASCII minus signs */
export function copyText(result, hour12) {

    if (!result || result.status !== "ok") {
        return "";
    }

    const rows = [result.source, ...result.rows];

    const header = `Time conversion, ${result.source.d} ${result.source.monthName.slice(0, 3)} ${result.source.y}`;

    const lines = rows.map((row) => {

        const day = row.dayDelta === 0
            ? ""
            : ` (${row.relation.toLowerCase()}, ${row.weekday.slice(0, 3)} ${row.d} ${row.monthName.slice(0, 3)})`;

        return `${formatClock(row.h, row.mi, hour12)} ${row.zone} ${offsetLabel(row.offsetSeconds, true)}${day}`;

    });

    return `${[header, ...lines].join("\n")}\n`;

}


/* =========================================================
   Shareable state (only date, time, zones and the overlap choice)
========================================================= */

/* the values of a query string that are valid; anything else is ignored */
export function parseQuery(search) {

    const state = {};

    let params;

    try {
        params = new URLSearchParams(String(search).slice(0, 2000));
    } catch (problem) {
        return state;
    }

    const d = params.get("d");
    const t = params.get("t");
    const from = params.get("from");
    const to = params.get("to");
    const c = params.get("c");

    if (d !== null && parseDate(d)) state.date = d;
    if (t !== null && parseTime(t)) state.time = t;
    if (from !== null && isValidZone(from)) state.source = from;

    if (to !== null) {

        const seen = new Set(state.source ? [canonicalZone(state.source)] : []);

        const targets = [];

        for (const zone of to.split(",").slice(0, 20)) {

            if (isValidZone(zone) && !seen.has(canonicalZone(zone)) && targets.length < MAX_TARGETS) {
                seen.add(canonicalZone(zone));
                targets.push(zone);
            }

        }

        state.targets = targets;

    }

    if (c === "earlier" || c === "later") state.choice = c;

    return state;

}

export function buildQuery(state) {

    const params = new URLSearchParams();

    if (state.date) params.set("d", state.date);
    if (state.time) params.set("t", state.time);
    if (state.source) params.set("from", state.source);
    if (state.targets && state.targets.length) params.set("to", state.targets.join(","));
    if (state.choice) params.set("c", state.choice);

    const text = params.toString().replace(/%2C/g, ",").replace(/%2F/g, "/");

    return text ? `?${text}` : "";

}


/* =========================================================
   Meeting overlap
========================================================= */

/* minutes since midnight for a 15-minute-step time, else null */
export function hoursMinutes(text) {

    const t = parseTime(text);

    return t && t.mi % GRID_MINUTES === 0 ? t.h * 60 + t.mi : null;

}

/* the first instant of a calendar date in a zone (a skipped midnight starts the day at the jump) */
export function startOfLocalDay(dateText, zone) {

    const resolved = resolveWall(dateText, "00:00", zone);

    if (resolved.kind === "gap") {
        return resolved.gap.transitionMs;
    }

    return resolved.candidates[0].ms;

}

/* the local minute of day of an instant, given its offset in seconds */
const minuteOfDayAt = (ms, offsetSeconds) => {

    const local = floorDiv(ms + offsetSeconds * 1000, MINUTE);

    return ((local % 1440) + 1440) % 1440;

};

/*
 * Does a meeting of `length` minutes starting at `startMs` sit inside
 * [from, to) minutes of the local day for a zone? Exact: when no offset
 * changes during the meeting the local start and end decide; when one
 * does, every minute is checked.
 */
function fits(startMs, length, zone, from, to, offsets) {

    const first = offsetSecondsAt(startMs, zone);

    if (first % (GRID_MINUTES * 60) !== 0) {
        offsets.unsupported = zone;
        return false;
    }

    const lastMinute = startMs + (length - 1) * MINUTE;

    const last = offsetSecondsAt(lastMinute, zone);

    if (first === last) {

        const m = minuteOfDayAt(startMs, first);

        return m >= from && m + length <= to;

    }

    for (let i = 0; i < length; i++) {

        const at = startMs + i * MINUTE;

        const m = minuteOfDayAt(at, offsetSecondsAt(at, zone));

        if (m < from || m >= to) {
            return false;
        }

    }

    return true;

}

/* merge consecutive grid instants into runs */
function runsOf(instants) {

    const runs = [];

    for (const ms of instants) {

        const last = runs[runs.length - 1];

        if (last && ms - last.lastMs === GRID_MINUTES * MINUTE) {
            last.lastMs = ms;
        } else {
            runs.push({ firstMs: ms, lastMs: ms });
        }

    }

    return runs;

}

/*
 * input: { date, source, zones: [{ zone, start, end }] (source first), duration, hour12 }
 *
 * status "need-more"  (fewer than two zones)
 *        "invalid"    { issues: [{ zone, message }] }
 *        "unsupported" (a zone is not supported, or uses an offset that is not a multiple of 15 minutes that day)
 *        "none"       { preferred }          no time inside everyone's hours
 *        "ok"         { windows, total }
 */
export function meetingOverlap(input) {

    const { date, source, zones, duration = DEFAULT_DURATION } = input;

    if (!parseDate(date)) {
        return { status: "invalid", issues: [{ zone: source, message: "Enter a valid date." }] };
    }

    for (const entry of zones) {

        if (!isValidZone(entry.zone)) {
            return { status: "unsupported", zone: entry.zone, message: UNSUPPORTED_ZONE };
        }

    }

    if (zones.length < 2) {

        return { status: "need-more", message: "Add at least one more time zone to find a time that works for everyone." };

    }

    if (!Number.isInteger(duration) || duration < GRID_MINUTES || duration % GRID_MINUTES !== 0) {
        return { status: "invalid", issues: [{ zone: source, message: "Choose a meeting length in 15-minute steps." }] };
    }

    const issues = [];
    const ranges = [];

    for (const entry of zones) {

        const from = hoursMinutes(entry.start);
        const to = hoursMinutes(entry.end);

        if (from === null || to === null) {

            issues.push({ zone: entry.zone, message: `Preferred hours for ${entry.zone} must be times in 15-minute steps.` });

        } else if (from >= to) {

            issues.push({ zone: entry.zone, message: `Preferred hours for ${entry.zone} must start before they end on the same day. Ranges that cross midnight are not supported.` });

        } else {

            ranges.push({ zone: entry.zone, from, to });

        }

    }

    if (issues.length) {
        return { status: "invalid", issues };
    }

    const dayStart = startOfLocalDay(date, source);
    const dayEnd = startOfLocalDay(addDays(date, 1), source);

    const offsets = { unsupported: null };

    const starts = [];
    const available = new Map(ranges.map((range) => [range.zone, []]));

    for (let t = dayStart; t < dayEnd; t += GRID_MINUTES * MINUTE) {

        let all = true;

        for (const range of ranges) {

            if (fits(t, GRID_MINUTES, range.zone, range.from, range.to, offsets)) {
                available.get(range.zone).push(t);
            }

            if (!fits(t, duration, range.zone, range.from, range.to, offsets)) {
                all = false;
            }

        }

        if (offsets.unsupported) {

            return {
                status: "unsupported",
                zone: offsets.unsupported,
                message: `${offsets.unsupported} uses an offset on this date that is not a multiple of 15 minutes, so meeting times cannot be listed for it.`
            };

        }

        if (all) {
            starts.push(t);
        }

    }

    const ids = ranges.map((range) => range.zone);

    const show = (ms, zone) => describeInZone(ms, zone, wallAt(ms, source).dayNumber);

    if (starts.length === 0) {

        return {
            status: "none",
            message: "No time falls inside everyone's preferred hours on this date.",
            duration,
            preferred: ids.map((zone) => ({
                zone,
                runs: runsOf(available.get(zone)).map((run) => ({
                    startMs: run.firstMs,
                    endMs: run.lastMs + GRID_MINUTES * MINUTE,
                    start: show(run.firstMs, source),
                    end: show(run.lastMs + GRID_MINUTES * MINUTE, source)
                }))
            }))
        };

    }

    const runs = runsOf(starts);

    const windows = runs.map((run) => {

        const endMs = run.lastMs + duration * MINUTE;

        return {
            firstStartMs: run.firstMs,
            lastStartMs: run.lastMs,
            endMs,
            starts: (run.lastMs - run.firstMs) / (GRID_MINUTES * MINUTE) + 1,
            perZone: ids.map((zone) => ({
                zone,
                start: show(run.firstMs, zone),
                lastStart: show(run.lastMs, zone),
                end: show(endMs, zone)
            }))
        };

    });

    return {
        status: "ok",
        duration,
        total: windows.length,
        windows: windows.slice(0, MAX_RESULT_WINDOWS)
    };

}

/* the plain text for the earliest window: every zone's local start and end */
export function copyMeetingText(overlap, date, hour12) {

    if (!overlap || overlap.status !== "ok" || overlap.windows.length === 0) {
        return "";
    }

    const window = overlap.windows[0];

    const first = window.perZone[0].start;

    const lines = window.perZone.map((entry) => {

        const day = entry.start.dayDelta === 0
            ? ""
            : ` (${entry.start.relation.toLowerCase()})`;

        return `${formatClock(entry.start.h, entry.start.mi, hour12)} ${entry.zone} ${offsetLabel(entry.start.offsetSeconds, true)}${day}`;

    });

    return `${[`Meeting time, ${first.d} ${first.monthName.slice(0, 3)} ${first.y} (earliest start, ${overlap.duration} minutes)`, ...lines].join("\n")}\n`;

}
