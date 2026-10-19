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
    COUNTRY_NAMES,
    COUNTRY_ALIASES,
    getEntry,
    countryName,
    placeName,
    normalizeText,
    regionOf,
    regionsForWord,
    isAbbreviation,
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


/* ---------- places: what a card is about ---------- */

const zoneWords = (zone) => String(zone).replace(/_/g, " ");

/*
 * Browsers still list a few zones under an old spelling (Chromium says Asia/Calcutta for India). The page SHOWS the modern name;
 * the zone's identity (what is stored in the address and handed to the Time Zone Converter) is untouched.
 */
const LEGACY_ZONE_NAMES = Object.freeze({
    "Asia/Calcutta": "Asia/Kolkata",
    "Asia/Katmandu": "Asia/Kathmandu",
    "Asia/Saigon": "Asia/Ho_Chi_Minh",
    "Asia/Rangoon": "Asia/Yangon",
    "Europe/Kiev": "Europe/Kyiv"
});

export const displayZone = (zone) =>
    LEGACY_ZONE_NAMES[zone] ?? zone;

/* { key, kind, title, subtitle, label, zone } (a zone place also has the IANA description and country when the search knows them) */
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

export function placeFromZone(zone, { note = "", country = "" } = {}) {

    const shown = displayZone(zone);

    const last = String(shown).split("/").pop();

    return {
        key: zone,
        kind: "zone",
        title: zoneWords(last),
        subtitle: shown,
        label: zoneWords(shown),
        zone,
        note,
        country
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


/* what a search or browse row shows beside a place: its time, weekday and offset now (null when the browser cannot read the zone) */
export function describeRow(place, nowMs, hour12 = false) {

    try {

        const w = wallAt(nowMs, place.zone);

        return {
            time: formatClock(w.h, w.mi, hour12),
            weekday: WEEKDAYS[w.weekdayIndex],
            offset: offsetLabel(w.offsetSeconds),
            dayNumber: w.dayNumber
        };

    } catch (problem) {
        return null;
    }

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
        return "";
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


/* ---------- search ---------- */

const usableCache = new WeakMap();

/*
 * The directory entries whose zone THIS browser accepts, and the zones they cover. Entries share zones (eight
 * Indian cities keep Asia/Kolkata), so each zone is checked once, not once per entry.
 */
function usable(directory) {

    let cached = usableCache.get(directory);

    if (!cached) {

        const valid = new Map();
        const identity = new Map();

        const entries = directory.filter((entry) => {

            if (!valid.has(entry.zone)) {
                valid.set(entry.zone, isValidZone(entry.zone));
            }

            return valid.get(entry.zone);

        });

        const represented = new Set(entries.map((entry) => {

            if (!identity.has(entry.zone)) {
                identity.set(entry.zone, canonicalZone(entry.zone));
            }

            return identity.get(entry.zone);

        }));

        cached = { entries, represented };

        usableCache.set(directory, cached);

    }

    return cached;

}

/* the zones this browser lists, as a Set; a zone it does not list but still accepts is checked directly */
let zoneSetCache = null;

function zoneKnown(zone) {

    if (zoneSetCache === null) {
        zoneSetCache = new Set(listZones());
    }

    return zoneSetCache.has(zone) || isValidZone(zone);

}

/* the two pieces of work the first search would otherwise do itself, so the page can do them while it is idle */
export function warmZoneList() {
    zoneKnown("UTC");
    return listZones().length;
}

export function warmDirectory(directory = DIRECTORY) {

    const { entries } = usable(directory);

    /* reading each zone once also builds the browser's formatter for it, which a row or a card would otherwise build on first sight */
    const now = Date.now();

    for (const zone of new Set(entries.map((entry) => entry.zone))) {

        try {
            wallAt(now, zone);
        } catch (problem) {
            /* a zone the browser cannot read is simply not warmed */
        }

    }

    return entries.length;

}

/* ---------- countries ---------- */

let regionNames = null;

/* the English name of a country: this site's own wording for the countries it lists, else the browser's, else the code */
export function countryLabel(code) {

    if (COUNTRY_NAMES[code]) {
        return COUNTRY_NAMES[code];
    }

    try {

        regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });

        const name = regionNames.of(code);

        /* ICU answers "Unknown Region" for a code it does not know */
        return name && name !== "Unknown Region" ? name : code;

    } catch (problem) {
        return code;
    }

}

const NO_DATA = {};
const indexCache = new WeakMap();

/* every country the search can name: the listed ones, and (once the country data has loaded) all of IANA's */
function countryIndex(countryData) {

    const key = countryData ?? NO_DATA;

    let index = indexCache.get(key);

    if (!index) {

        const codes = new Set(Object.keys(COUNTRY_NAMES));

        if (countryData) {

            for (const code of Object.keys(countryData.COUNTRY_ZONES)) {
                codes.add(code);
            }

        }

        index = { codes, byName: new Map([...codes].map((code) => [normalizeText(countryLabel(code)), code])) };

        indexCache.set(key, index);

    }

    return index;

}

/* a whole query that names ONE country (its name, or an alias such as "usa" or "uk"), else null */
export function resolveCountry(normalized, countryData = null) {

    const index = countryIndex(countryData);

    const alias = COUNTRY_ALIASES[normalized];

    if (alias && index.codes.has(alias)) {
        return alias;
    }

    const named = index.byName.get(normalized);

    if (named) {
        return named;
    }

    /* a bare two-letter code is NOT a country query: "la" is Los Angeles, "in" and "it" are ordinary words */
    return null;

}

/*
 * A country's places: the listed cities first (the directory's own order), then every other zone IANA lists for it
 * that this browser knows, each with zone.tab's own description. `zoneCount` counts distinct zones.
 */
export function countryPlaces(code, { directory = DIRECTORY, countryData = null } = {}) {

    const { entries } = usable(directory);

    const cities = entries.filter((entry) => entry.country === code).map(placeFromEntry);

    const seen = new Set(cities.map((place) => canonicalZone(place.zone)));

    const zones = [];

    for (const item of countryData?.COUNTRY_ZONES?.[code] ?? []) {

        const [zone, note = ""] = item.split("|");

        if (!zoneKnown(zone)) {
            continue;
        }

        const identity = canonicalZone(zone);

        if (seen.has(identity)) {
            continue;
        }

        seen.add(identity);

        zones.push(placeFromZone(zone, { note, country: code }));

    }

    return { cities, zones, zoneCount: seen.size };

}

/* the countries (as { code, name }, by name) that have a zone in a region, or all of them when no region is given; needs the country data */
export function countriesIn(region, countryData) {

    if (!countryData) {
        return [];
    }

    const wanted = region ? (Array.isArray(region) ? region : [region]) : null;

    const found = [];

    for (const [code, items] of Object.entries(countryData.COUNTRY_ZONES)) {

        const has = items.some((item) => {

            const zone = item.split("|")[0];

            return zoneKnown(zone) && (wanted === null || wanted.includes(regionOf(zone, code)));

        });

        if (has) {
            found.push({ code, name: countryLabel(code) });
        }

    }

    return found.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

}

/* ---------- searching ---------- */

export const abbreviationNote = (typed) =>
    `"${String(typed).slice(0, 12)}" is a time-zone abbreviation, and one abbreviation can mean several places (IST, CST and BST are each shared by more than one country), so abbreviations are not searched. Search for a city or country instead, such as Kolkata, Chicago or London.`;

const plural = (n, word) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

/* directory cities first, then time zones the browser lists that no listed city already covers */
function genericSearch(query, { region, cap, directory, zones }) {

    const { entries, represented } = usable(directory);

    const places = searchDirectory(query, { region, limit: cap, entries }).map(placeFromEntry);

    /* the zone list is searched for three letters or more, or a typed zone path: one or two letters match nearly every zone and help nobody */
    if (region || places.length >= cap || (normalizeText(query).length < 3 && !/[/_]/.test(String(query)))) {
        return places;
    }

    const seen = new Set();

    for (const zone of searchZones(query, zones, cap * 2)) {

        if (places.length >= cap) {
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

/*
 * What a typed query means, and what to show for it.
 *   { mode, places, total, header, note }
 *   mode "abbreviation"  a time-zone abbreviation: nothing is searched, `note` explains why
 *   mode "region"        a continent word (asia, north america, americas): that region's listed cities
 *   mode "country"       a whole country name, alias or code: its cities, then every other zone it has
 *   mode "cities"        anything else: city, alias, country-prefix and zone-path matches
 *   mode "empty"         nothing typed
 * `places` holds up to `cap` places; `total` is how many there are before that cap. `countryData` is the
 * lazily loaded country module (or null: country queries then see only the listed cities).
 */
export function runSearch(query, { region = "", cap = MAX_BROWSE, directory = DIRECTORY, zones = null, countryData = null } = {}) {

    const normalized = normalizeText(query ?? "");

    if (normalized === "") {
        return { mode: "empty", places: [], total: 0, header: "", note: "" };
    }

    if (isAbbreviation(normalized)) {
        return { mode: "abbreviation", places: [], total: 0, header: "", note: abbreviationNote(String(query).trim()) };
    }

    const regions = region ? null : regionsForWord(normalized);

    if (regions) {

        const found = browsePlaces(regions, { limit: cap, directory });

        return { mode: "region", places: found.places, total: found.total, header: `${regions.join(" and ")} · ${found.total} listed ${found.total === 1 ? "city" : "cities"}`, note: "" };

    }

    const code = region ? null : resolveCountry(normalized, countryData);

    if (code) {

        const found = countryPlaces(code, { directory, countryData });

        const places = [...found.cities, ...found.zones];

        if (places.length) {

            return {
                mode: "country",
                country: code,
                places: places.slice(0, cap),
                total: places.length,
                header: `${countryLabel(code)} · ${plural(found.zoneCount, "time zone")}${countryData ? "" : " (listed cities only)"}`,
                note: ""
            };

        }

    }

    const places = genericSearch(query, { region, cap, directory, zones: zones ?? listZones() });

    return { mode: "cities", places, total: places.length, header: "", note: "" };

}

/* the places matching a query (the list of runSearch), at most `limit` */
export function searchPlaces(query, { region = "", limit = MAX_RESULTS, directory = DIRECTORY, zones = null, countryData = null } = {}) {

    return runSearch(query, { region, cap: limit, directory, zones, countryData }).places;

}

/* a region's (or several regions') cities, alphabetical, capped; `total` is the uncapped count */
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
