/* =========================================================
   ToolZen Hub
   World Clock: the pure engine (Tool Pack 28)

   No DOM and no clock of its own: every function takes the instant
   it works on, so tests are deterministic and every card on the board
   is built from ONE reference instant.

   The time-zone arithmetic (offsets, the wall clock of an instant,
   zone validity and identity, the zone list and its search) is
   reused from the Time Zone Converter's pure engine. Only the
   functions named in the import below are used; that statement is
   the whole contract with the other tool, and nothing here edits it.

   What belongs to this tool and lives here:
     - the card model (time, date, offset, difference, day word)
     - the next clock change (optional, secondary; see below)
     - search over the city directory plus the browser's zones
     - the shareable address (cities= and ref=)
     - the starter board

   Next clock change. The time-zone database that ships with a
   browser is asked for the zone's offset every 72 hours for 400
   days; where the offset differs from now, the change is bracketed
   and found to the second by halving. Two changes inside one 72-hour
   step (a change and its reversal) would not be seen, and the answer
   is what THIS browser's data says, which can differ from another
   browser's or from the current law. "None found" describes the
   sampled window only. The feature sits behind SHOW_NEXT_CLOCK_CHANGE
   and nothing else depends on it.
========================================================= */

import {
    isValidZone,
    canonicalZone,
    sameZone,
    listZones,
    searchZones,
    offsetSecondsAt,
    wallAt,
    offsetLabel,
    formatClock
} from "../time-zone-converter/time-zone-engine.js";

import {
    DIRECTORY,
    getEntry,
    countryName,
    placeName,
    searchDirectory,
    browseRegion
} from "./city-directory.js";


/* ---------- limits and switches ---------- */

export const MAX_CITIES = 12;
export const MAX_RESULTS = 10;
export const MAX_BROWSE = 60;

/* the address: how much of it is read at all, and how much of `cities` */
export const MAX_QUERY_CHARS = 2000;
export const MAX_CITIES_PARAM_CHARS = 600;
export const MAX_TOKENS_EXAMINED = 20;
export const MAX_TOKEN_CHARS = 64;

/* approximate day: the local clock from 06:00 up to (not including) 18:00 */
export const DAY_STARTS_AT = 6 * 60;
export const DAY_ENDS_AT = 18 * 60;

/* the optional next clock change */
export const SHOW_NEXT_CLOCK_CHANGE = true;
export const CHANGE_STEP_HOURS = 72;
export const CHANGE_HORIZON_DAYS = 400;
const CHANGE_RECHECK_MARGIN_DAYS = 30;

export const STARTER_IDS = Object.freeze([
    "new-york-us",
    "london-gb",
    "dubai-ae",
    "singapore-sg",
    "sydney-au"
]);
export const STARTER_COUNT = 4;

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*-[a-z]{2}$/;
const MAX_ID_CHARS = 40;

export const NO_CHANGE_TEXT = "No clock change found in the next 13 months (this browser's data)";


/* ---------- places: what a card is about ---------- */

const zoneWords = (zone) => String(zone).replace(/_/g, " ");

/* { key, kind, title, subtitle, label, zone } */
export function placeFromEntry(entry) {

    return {
        key: entry.id,
        kind: "city",
        title: entry.city,
        subtitle: countryName(entry.country),
        label: placeName(entry),
        zone: entry.zone
    };

}

export function placeFromZone(zone) {

    const last = String(zone).split("/").pop();

    return {
        key: zone,
        kind: "zone",
        title: zoneWords(last),
        subtitle: zone,
        label: zoneWords(zone),
        zone
    };

}

/* what makes two places the same: a city by its id, a bare zone by the browser's identity for it */
const identityOf = (place) =>
    place.kind === "city" ? place.key : `zone:${canonicalZone(place.zone)}`;

/* a token from an address: a directory id, or an IANA zone the browser accepts; anything else is null */
export function resolveToken(token, directory = DIRECTORY) {

    if (typeof token !== "string") {
        return null;
    }

    const text = token.trim();

    if (text === "" || text.length > MAX_TOKEN_CHARS) {
        return null;
    }

    if (text.length <= MAX_ID_CHARS && ID_PATTERN.test(text)) {

        const entry = getEntry(text, directory);

        return entry && isValidZone(entry.zone) ? placeFromEntry(entry) : null;

    }

    if ((text === "UTC" || text.includes("/")) && isValidZone(text)) {
        return placeFromZone(text);
    }

    return null;

}


/* ---------- time: one instant, many cards ---------- */

export function dayPhase(minuteOfDay) {
    return minuteOfDay >= DAY_STARTS_AT && minuteOfDay < DAY_ENDS_AT ? "day" : "night";
}

export const dayWord = (phase) =>
    phase === "day" ? "Daytime" : "Night-time";

/* the card's date against the reference's date */
export function dayRelation(delta) {

    if (delta === 0) return "Today";
    if (delta === 1) return "Tomorrow";
    if (delta === -1) return "Yesterday";

    return delta > 0 ? `${delta} days later` : `${-delta} days earlier`;

}

/* "3h 30m ahead of Your time", "45m behind London, United Kingdom", "Same time as Your time" */
export function differenceText(deltaSeconds, refLabel) {

    const minutes = Math.trunc(Math.abs(deltaSeconds) / 60);

    if (minutes === 0) {
        return `Same time as ${refLabel}`;
    }

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    const amount = [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");

    return `${amount} ${deltaSeconds > 0 ? "ahead of" : "behind"} ${refLabel}`;

}

/* "14:32" or "2:32 PM" split into the digits and the suffix */
export function clockParts(h, mi, hour12) {

    const text = formatClock(h, mi, hour12);

    if (!hour12) {
        return { main: text, suffix: "", text };
    }

    const [main, suffix] = text.split(" ");

    return { main, suffix, text };

}

export const msUntilNextMinute = (nowMs) =>
    MINUTE_MS - (((nowMs % MINUTE_MS) + MINUTE_MS) % MINUTE_MS);

/*
 * Everything a card shows, from one instant.
 *   ref        the reference's wall clock at the same instant (wallAt), so
 *              a board of cities reads the reference once
 *   refLabel   how the reference is named in the difference line
 */
export function buildCard({ nowMs, place, ref, refLabel, isReference = false, hour12 = false }) {

    const w = wallAt(nowMs, place.zone);

    const deltaSeconds = w.offsetSeconds - ref.offsetSeconds;

    const dayDelta = w.dayNumber - ref.dayNumber;

    const phase = dayPhase(w.minuteOfDay);

    const parts = clockParts(w.h, w.mi, hour12);

    return {
        key: place.key,
        title: place.title,
        subtitle: place.subtitle,
        zone: place.zone,
        h: w.h,
        mi: w.mi,
        timeMain: parts.main,
        timeSuffix: parts.suffix,
        timeText: parts.text,
        isoLocal: `${w.date}T${w.time}${offsetLabel(w.offsetSeconds, true).slice(3)}`,
        dateText: `${WEEKDAYS[w.weekdayIndex]}, ${w.d} ${MONTHS[w.mo - 1]} ${w.y}`,
        offsetSeconds: w.offsetSeconds,
        offset: offsetLabel(w.offsetSeconds),
        deltaSeconds,
        isReference,
        differenceText: isReference ? "This is the comparison reference" : differenceText(deltaSeconds, refLabel),
        dayDelta,
        dayRelation: dayRelation(dayDelta),
        phase,
        dayWord: dayWord(phase)
    };

}


/* ---------- the next clock change (optional) ---------- */

/*
 * The first instant after `fromMs` at which the zone's UTC offset differs
 * from its offset at `fromMs`, or null when none is found in the window.
 * { atMs, fromOffset, toOffset } with atMs the first second on the new offset.
 */
export function nextClockChange(zone, fromMs, { stepHours = CHANGE_STEP_HOURS, horizonDays = CHANGE_HORIZON_DAYS } = {}) {

    const step = stepHours * HOUR_MS;
    const end = fromMs + horizonDays * DAY_MS;

    const before = offsetSecondsAt(fromMs, zone);

    for (let t = fromMs + step; t <= end; t += step) {

        if (offsetSecondsAt(t, zone) === before) {
            continue;
        }

        let lo = t - step;
        let hi = t;

        while (hi - lo > 1000) {

            const mid = Math.floor((lo + hi) / 2000) * 1000;

            if (mid <= lo) {
                break;
            }

            if (offsetSecondsAt(mid, zone) !== before) {
                hi = mid;
            } else {
                lo = mid;
            }

        }

        return { atMs: hi, fromOffset: before, toOffset: offsetSecondsAt(hi, zone) };

    }

    return null;

}

/* "Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 02:00)": the clock reading is the one on the OLD offset at the moment of the jump */
export function clockChangeText(change, hour12 = false) {

    if (!change) {
        return NO_CHANGE_TEXT;
    }

    const local = new Date(change.atMs + change.fromOffset * 1000);

    const day = `${WEEKDAYS[local.getUTCDay()]} ${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]}`;

    const at = formatClock(local.getUTCHours(), local.getUTCMinutes(), hour12);

    return `Clocks change ${day}: ${offsetLabel(change.fromOffset)} → ${offsetLabel(change.toOffset)} (at ${at})`;

}

/*
 * Results are kept per browser identity of the zone, so cards that share a zone
 * (Mumbai and Delhi) share one value, and a minute tick never recomputes.
 * A value is reused until the change it found has passed, the checked window is
 * nearly used up, or the clock jumps back by more than a day.
 */
export function createClockChangeCache(compute = nextClockChange) {

    const values = new Map();

    /* the browser's identity for a zone is looked up once per spelling, not on every minute tick */
    const identities = new Map();

    const identity = (zone) => {

        if (!identities.has(zone)) {
            identities.set(zone, canonicalZone(zone));
        }

        return identities.get(zone);

    };

    const valid = (entry, nowMs) =>
        entry !== undefined && nowMs >= entry.computedFromMs - DAY_MS && nowMs < entry.validUntilMs;

    return {

        /* the stored value or undefined (never computes) */
        peek(zone, nowMs) {

            const entry = values.get(identity(zone));

            return valid(entry, nowMs) ? { result: entry.result } : undefined;

        },

        /* the stored value, computing it when there is none; `computed` tells which happened */
        get(zone, nowMs) {

            const key = identity(zone);

            const entry = values.get(key);

            if (valid(entry, nowMs)) {
                return { result: entry.result, computed: false };
            }

            const result = compute(zone, nowMs);

            values.set(key, {
                result,
                computedFromMs: nowMs,
                validUntilMs: result ? result.atMs : nowMs + (CHANGE_HORIZON_DAYS - CHANGE_RECHECK_MARGIN_DAYS) * DAY_MS
            });

            return { result, computed: true };

        },

        get size() {
            return values.size;
        }

    };

}


/* ---------- search: the directory first, then the browser's zones ---------- */

const usableCache = new WeakMap();

/* the directory entries whose zone THIS browser accepts, and the zones they cover */
function usable(directory) {

    let cached = usableCache.get(directory);

    if (!cached) {

        const entries = directory.filter((entry) => isValidZone(entry.zone));

        cached = {
            entries,
            represented: new Set(entries.map((entry) => canonicalZone(entry.zone)))
        };

        usableCache.set(directory, cached);

    }

    return cached;

}

/*
 * Places matching the query: directory cities first (a region narrows only
 * these), then time zones the browser lists that no listed city already covers.
 */
export function searchPlaces(query, { region = "", limit = MAX_RESULTS, directory = DIRECTORY, zones = listZones() } = {}) {

    const { entries, represented } = usable(directory);

    const places = searchDirectory(query, { region, limit, entries }).map(placeFromEntry);

    if (region || places.length >= limit || String(query).trim() === "") {
        return places;
    }

    const seen = new Set();

    for (const zone of searchZones(query, zones, limit * 4)) {

        if (places.length >= limit) {
            break;
        }

        const canonical = canonicalZone(zone);

        if (represented.has(canonical) || seen.has(canonical)) {
            continue;
        }

        seen.add(canonical);

        places.push(placeFromZone(zone));

    }

    return places;

}

/* a region's cities, alphabetical, capped; `total` is the uncapped count */
export function browsePlaces(region, { limit = MAX_BROWSE, directory = DIRECTORY } = {}) {

    const { entries } = usable(directory);

    const found = browseRegion(region, { limit, entries });

    return { places: found.entries.map(placeFromEntry), total: found.total };

}


/* ---------- the starter board ---------- */

/* the starter cities, leaving out any that keep the same clock as the visitor, first STARTER_COUNT */
export function defaultBoard(hereZone, directory = DIRECTORY) {

    const places = [];

    for (const id of STARTER_IDS) {

        if (places.length >= STARTER_COUNT) {
            break;
        }

        const entry = getEntry(id, directory);

        if (!entry || !isValidZone(entry.zone) || sameZone(entry.zone, hereZone)) {
            continue;
        }

        places.push(placeFromEntry(entry));

    }

    return places;

}


/* ---------- the shareable address ---------- */

/*
 * The valid part of an address: { places, ref, skipped, present }.
 *   cities   comma-separated directory ids and IANA zones, at most
 *            MAX_TOKENS_EXAMINED looked at and MAX_CITIES kept
 *   ref      one token naming a city already on the board
 * Anything else is ignored. `skipped` counts what was dropped (invalid,
 * over the limit or not examined) for one polite note; the text itself
 * is never reported. Zero valid places leaves the caller to use the starter board.
 */
export function parseBoardQuery(search, directory = DIRECTORY) {

    const result = { places: [], ref: null, skipped: 0, present: false };

    let params;

    try {
        params = new URLSearchParams(String(search ?? "").slice(0, MAX_QUERY_CHARS));
    } catch (problem) {
        return result;
    }

    const raw = params.get("cities");

    if (raw === null) {
        return result;
    }

    result.present = true;

    const all = raw.slice(0, MAX_CITIES_PARAM_CHARS).split(",");

    const examined = all.slice(0, MAX_TOKENS_EXAMINED);

    result.skipped += all.length - examined.length;

    const seen = new Set();

    for (const token of examined) {

        if (token.trim() === "") {
            continue;
        }

        const place = resolveToken(token, directory);

        if (!place) {
            result.skipped += 1;
            continue;
        }

        const identity = identityOf(place);

        if (seen.has(identity)) {
            continue;
        }

        if (result.places.length >= MAX_CITIES) {
            result.skipped += 1;
            continue;
        }

        seen.add(identity);

        result.places.push(place);

    }

    const refToken = params.get("ref");

    if (refToken !== null) {

        const refPlace = resolveToken(refToken, directory);

        const onBoard = refPlace && result.places.find((place) => identityOf(place) === identityOf(refPlace));

        result.ref = onBoard ? onBoard.key : null;

    }

    return result;

}

/* "?cities=new-york-us,London/..." with the commas and slashes left readable; "" when there is nothing to say */
export function buildBoardQuery({ places, ref = null }) {

    if (!places.length) {
        return "";
    }

    const params = new URLSearchParams();

    params.set("cities", places.map((place) => place.key).join(","));

    if (ref && places.some((place) => place.key === ref)) {
        params.set("ref", ref);
    }

    return `?${params.toString().replace(/%2C/g, ",").replace(/%2F/g, "/")}`;

}

/*
 * The query string for the Time Zone Converter's own address format (from and to):
 * the visitor's zone as the source and up to five distinct other zones from the board.
 */
export function handoffQuery(places, hereZone, maxTargets = 5) {

    const params = new URLSearchParams();

    params.set("from", hereZone);

    const seen = new Set([canonicalZone(hereZone)]);

    const targets = [];

    for (const place of places) {

        const canonical = canonicalZone(place.zone);

        if (seen.has(canonical) || targets.length >= maxTargets) {
            continue;
        }

        seen.add(canonical);

        targets.push(place.zone);

    }

    if (targets.length) {
        params.set("to", targets.join(","));
    }

    return `?${params.toString().replace(/%2C/g, ",").replace(/%2F/g, "/")}`;

}
