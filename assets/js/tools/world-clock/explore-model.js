/* =========================================================
   ToolZen Hub
   World Clock 2.0: what the Explore directory shows (Tool Pack 28, section 20)

   PURE. Given what was typed, the filters, the sort and ONE instant,
   it decides which places match, how they are grouped and ordered,
   what the counts are, and what to say when nothing matches. The view
   (explore.js) only draws the answer.

   It reuses the World Clock engine for names, countries, continents
   and zone paths, the Time Zone Converter's engine for each place's
   actual local clock, and time-query.js for times, hours, AM and PM,
   ranges and UTC offsets. It lives apart from clock-engine.js so none
   of it is loaded until the Explore view is.

   A place is "listed" when it is one of the curated cities; any other
   time zone the browser knows (and the country data names) is an
   "other time zone". Counts keep the two apart, and a count of
   cities is never a count of time zones (section 20.7).
========================================================= */

import {
    wallAt,
    canonicalZone
} from "../time-zone-converter/time-zone-engine.js";

import {
    DIRECTORY,
    normalizeText,
    regionOf
} from "./city-directory.js";

import {
    placeFromEntry,
    placeFromZone,
    runSearch,
    countryLabel,
    usable,
    zoneKnown
} from "./clock-engine.js";

import {
    DEFAULT_TOLERANCE,
    parseTimeQuery,
    buildGroups,
    widerTolerance,
    describeSpan,
    formatOffset,
    HINTS,
    OFFSET_NOTE,
    UTC_NOTE,
    PERIOD_NOTE_AM
} from "./time-query.js";

export const SORTS = Object.freeze(["city", "country", "time", "offset"]);

/*
 * The region choices a visitor sees (section 22.6). They are labels over the directory's own six data regions, which
 * are not renamed: "Americas" holds North America and South America, "Australia & Pacific" is Oceania.
 */
export const REGION_GROUPS = Object.freeze({
    "Africa": Object.freeze(["Africa"]),
    "Asia": Object.freeze(["Asia"]),
    "Europe": Object.freeze(["Europe"]),
    "Americas": Object.freeze(["North America", "South America"]),
    "Australia & Pacific": Object.freeze(["Oceania"])
});

export const REGION_CHOICES = Object.freeze(Object.keys(REGION_GROUPS));

/* the data regions a choice stands for; a data region's own name stands for itself; nothing chosen is an empty list */
export const regionDataFor = (choice) =>
    !choice ? [] : Object.hasOwn(REGION_GROUPS, choice) ? REGION_GROUPS[choice] : [choice];

/* the visible label of a data region, or of a label */
export const regionLabel = (name) =>
    REGION_CHOICES.find((choice) => REGION_GROUPS[choice].includes(name)) ?? name;

/* a continent heading in the visible words ("Oceania" is shown as "Australia & Pacific") */
const relabel = (text) =>
    text.replace("North America and South America", "Americas").replace("Oceania", "Australia & Pacific");

const MAX_SUGGESTIONS = 5;

/* a suggestion must be within this many minutes of the request, or there is none */
const SUGGESTION_REACH = 180;

/* how many places a text search may return before the view's own handling (all of them, in practice) */
const TEXT_CAP = 2000;

const identities = new Map();

function identityOf(zone) {

    let id = identities.get(zone);

    if (id === undefined) {
        id = canonicalZone(zone);
        identities.set(zone, id);
    }

    return id;

}

/* ---------- the places ---------- */

const cityCache = new WeakMap();

/* the listed cities this browser can read, as places that also carry their country code and region */
export function cityPlaces(directory = DIRECTORY) {

    let cached = cityCache.get(directory);

    if (!cached) {

        const { entries } = usable(directory);

        const list = entries.map((entry) => ({ ...placeFromEntry(entry), country: entry.country, region: entry.region }));

        cached = { list, byKey: new Map(list.map((place) => [place.key, place])) };

        cityCache.set(directory, cached);

    }

    return cached;

}

const otherCache = new WeakMap();

/* every zone the browser knows, that the country data lists, that no listed city uses: { list, byZone } */
export function otherZonePlaces(countryData, directory = DIRECTORY) {

    if (!countryData) {
        return { list: [], byZone: new Map() };
    }

    let perDirectory = otherCache.get(countryData);

    if (!perDirectory) {
        perDirectory = new WeakMap();
        otherCache.set(countryData, perDirectory);
    }

    let cached = perDirectory.get(directory);

    if (!cached) {

        const { represented } = usable(directory);

        const seen = new Set(represented);

        const list = [];

        const byZone = new Map();

        for (const [country, items] of Object.entries(countryData.COUNTRY_ZONES)) {

            for (const item of items) {

                const [zone, note = ""] = item.split("|");

                if (!zoneKnown(zone)) {
                    continue;
                }

                const identity = identityOf(zone);

                if (!byZone.has(zone)) {
                    byZone.set(zone, { country, note });
                }

                if (seen.has(identity)) {
                    continue;
                }

                seen.add(identity);

                list.push({ ...placeFromZone(zone, { note, country }), region: regionOf(zone, country) });

            }

        }

        cached = { list, byZone };

        perDirectory.set(directory, cached);

    }

    return cached;

}

/* ---------- one snapshot per update ---------- */

/*
 * Each place's actual local clock at the one instant. The zone is read once however many places share it
 * (eight Indian cities read Asia/Kolkata once). A place the browser cannot read is left out.
 */
export function snapshotPlaces(places, nowMs) {

    const byZone = new Map();

    const rows = [];

    for (const place of places) {

        let snap = byZone.get(place.zone);

        if (snap === undefined) {

            try {

                const w = wallAt(nowMs, place.zone);

                snap = { local: w.minuteOfDay, offsetSeconds: w.offsetSeconds, dayNumber: w.dayNumber, weekday: w.weekdayIndex };

            } catch (problem) {
                snap = null;
            }

            byZone.set(place.zone, snap);

        }

        if (snap) {
            rows.push({ place, ...snap });
        }

    }

    return rows;

}

/* ---------- ordering ---------- */

const plain = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const titleKey = (row) => normalizeText(row.place.title);

const countryKey = (row) => normalizeText(row.place.kind === "city" ? countryLabel(row.place.country) : row.place.country ? countryLabel(row.place.country) : "~");

const COMPARERS = {
    city: (a, b) => plain(titleKey(a), titleKey(b)) || plain(a.place.key, b.place.key),
    country: (a, b) => plain(countryKey(a), countryKey(b)) || COMPARERS.city(a, b),
    time: (a, b) => a.local - b.local || COMPARERS.city(a, b),
    offset: (a, b) => a.offsetSeconds - b.offsetSeconds || COMPARERS.city(a, b)
};

/*
 * order rows; `groupKey` (a time query's own order) is used when no sort was chosen. `keep` is the search's own
 * best-match order (a typed name: "LA" finds Los Angeles first, "london" the better-known London first), used when no
 * sort was chosen or "relevance" was.
 */
function orderRows(rows, sort, groupKey, keep = false) {

    if (sort && COMPARERS[sort]) {
        return rows.sort(COMPARERS[sort]);
    }

    if (keep) {
        return rows;
    }

    if (groupKey) {
        return rows.sort((a, b) => groupKey(a.local, a.offsetSeconds) - groupKey(b.local, b.offsetSeconds) || COMPARERS.city(a, b));
    }

    /* ordinary browsing: the local time of day, 00:00 to 23:59, ties by city (section 22.4) */
    return rows.sort(COMPARERS.time);

}

/* ---------- wording ---------- */

const places = (n) =>
    `${n} ${n === 1 ? "place" : "places"}`;

const timeZones = (n) =>
    `${n} time zone${n === 1 ? "" : "s"}`;

/* "9 listed cities in 2 time zones, plus 0 other time zones" */
export function countLine(cities, zonesOfCities, others) {

    return `${cities} listed ${cities === 1 ? "city" : "cities"} in ${timeZones(zonesOfCities)}, plus ${others} other time zone${others === 1 ? "" : "s"}`;

}

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

/* the "no match" sentence from a heading: "Places currently between ..." becomes "No listed city is currently between ..." */
function noneSentence(heading) {

    return heading.replace(/^Places (where it is )?currently/, "No listed city is currently") + ".";

}

/* what each view says when it has no match (section 22.3): { cities, others } */
function noneMessages(headings, raw, region, country) {

    if (headings) {

        const none = headings.map(noneSentence).join(" ");

        return { cities: none, others: none.replace(/No listed city/g, "No other time zone") };

    }

    const typed = raw.trim();

    const clipped = typed.length > 40 ? `${typed.slice(0, 40)}…` : typed;

    const scope = [country ? countryLabel(country) : "", region ? regionLabel(region) : ""].filter(Boolean);

    const about = `${typed ? ` "${clipped}"` : ""}${scope.length ? ` in ${scope.join(", ")}` : typed ? "" : " the current filters"}`;

    return { cities: `No listed city matches${about}.`, others: `No other time zone matches${about}.` };

}

const wording = (n, heading) =>
    `${places(n)} ${lowerFirst(heading).replace(/^places /, "")}`;

/* ---------- the answer ---------- */

/*
 * runExplore: the whole answer for one state of the page.
 * options: { query, region, country, sort, tolerance, nowMs, countryData, directory, hour12 }
 *   sort: "" (not chosen: the query's own order, else the local time of day) or one of SORTS
 * returns {
 *   mode,          "all" | "time" | "invalid" | "abbreviation" | "region" | "country" | "cities" | "none"
 *   timeKind,      "hour" | "time" | "range" | "period" | "named" | "offset" | null
 *   groups,        [{ id, heading, rows }]   the listed cities that match, in groups (two for a bare hour)
 *   others,        { rows, count }           the other time zones that match
 *   counts,        { cities, zones, others, places }
 *   headings,      [heading]                 one per group, or the mode's own heading
 *   notes,         [text]                    explanations shown with the results
 *   hint,          text                      for an invalid query
 *   countLine, announce, instant, sort, tolerance,
 *   noneIn         { cities, others } what each view says when it has no match (null for an invalid or abbreviation query)
 *   empty          null, or { message, widenTo, suggestions }
 * }
 */
export function runExplore(options) {

    const {
        query = "",
        region = "",
        country = "",
        sort = "",
        tolerance = DEFAULT_TOLERANCE,
        nowMs,
        countryData = null,
        directory = DIRECTORY,
        hour12 = false
    } = options;

    const raw = String(query ?? "");

    const listed = cityPlaces(directory);

    const others = otherZonePlaces(countryData, directory);

    const regionList = regionDataFor(region);

    const wanted = (place) =>
        (regionList.length === 0 || regionList.includes(place.region)) && (!country || place.country === country);

    const result = {
        mode: "all",
        timeKind: null,
        groups: [],
        others: { rows: [], count: 0 },
        counts: { cities: 0, zones: 0, others: 0, places: 0 },
        headings: [],
        notes: [],
        hint: "",
        countLine: "",
        announce: "",
        instant: nowMs,
        sort: sort || "",
        tolerance,
        relevance: false,
        empty: null
    };

    const finish = () => {

        const cityRows = result.groups.flatMap((group) => group.rows);

        result.counts.cities = cityRows.length;
        result.counts.zones = new Set(cityRows.map((row) => identityOf(row.place.zone))).size;
        result.counts.others = result.others.rows.length;
        result.counts.places = result.counts.cities + result.counts.others;
        result.others.count = result.others.rows.length;

        result.countLine = countLine(result.counts.cities, result.counts.zones, result.counts.others);

        if (result.mode !== "invalid" && result.mode !== "abbreviation") {
            result.noneIn = noneMessages(result.mode === "time" ? result.headings : null, raw, region, country);
        }

        return result;

    };

    const parsed = parseTimeQuery(raw);

    /* ---- time, hour, AM/PM, range, offset ---- */
    if (parsed && parsed.kind === "invalid") {

        result.mode = "invalid";

        result.hint = HINTS[parsed.hint] ?? HINTS.time;

        result.announce = result.hint;

        return finish();

    }

    if (parsed) {

        result.mode = "time";

        result.timeKind = parsed.kind;

        const groups = buildGroups(parsed, tolerance);

        const cityRows = snapshotPlaces(listed.list.filter(wanted), nowMs);

        const otherRows = snapshotPlaces(others.list.filter(wanted), nowMs);

        let firstSortKey = null;

        result.groups = groups.map((group) => {

            const rows = cityRows.filter((row) => group.test(row.local, row.offsetSeconds));

            firstSortKey ??= group.sortKey;

            return { id: group.id, heading: group.heading, rows: orderRows(rows, sort, group.sortKey) };

        });

        const matchesAny = (row) => groups.some((group) => group.test(row.local, row.offsetSeconds));

        result.others.rows = orderRows(otherRows.filter(matchesAny), sort, firstSortKey);

        result.headings = groups.map((group) => group.heading(hour12));

        if (parsed.kind === "offset") {

            result.notes.push(OFFSET_NOTE);

            if (parsed.bare) {
                result.notes.push(UTC_NOTE);
            }

        }

        if (parsed.kind === "period" && parsed.period === "am") {
            result.notes.push(PERIOD_NOTE_AM);
        }

        finish();

        const total = result.counts.places;

        result.announce = result.headings.length === 1
            ? wording(total, result.headings[0])
            : `${places(total)}, in ${result.headings.length} groups`;

        /* no LISTED city matches: say so in the heading's own words, even when other time zones match (the view offers the other time zones, it never switches to them) */
        if (result.counts.cities === 0) {

            const none = result.headings.map(noneSentence).join(" ");

            result.empty = {
                message: total === 0 ? `${none} No other time zone matches either.` : none,
                widenTo: parsed.kind === "time" ? widerTolerance(tolerance) : null,
                suggestions: total === 0 ? suggest(parsed, groups, [...cityRows, ...otherRows], hour12) : []
            };

            result.announce = total === 0 ? result.empty.message : `${none} ${result.counts.others === 1 ? "1 other time zone matches" : `${result.counts.others} other time zones match`}.`;

        }

        return result;

    }

    /* ---- names: the words a visitor types for a place ---- */
    const found = runSearch(raw, { cap: TEXT_CAP, countryData, directory });

    result.mode = found.mode === "empty" ? "all" : found.mode;

    /* a typed name is listed best match first unless a sort was chosen; the view then offers "Best match" */
    result.relevance = found.mode === "cities";

    if (found.mode === "abbreviation") {

        result.notes.push(found.note);

        result.announce = found.note;

        return finish();

    }

    let cityList;
    let zoneList;

    if (found.mode === "empty") {

        cityList = listed.list;

        zoneList = others.list;

    } else {

        cityList = found.places.filter((place) => place.kind === "city").map((place) => listed.byKey.get(place.key)).filter(Boolean);

        zoneList = found.places.filter((place) => place.kind === "zone").map((place) => {

            const info = others.byZone.get(place.zone);

            const countryCode = place.country || info?.country || "";

            return { ...place, note: place.note || info?.note || "", country: countryCode, region: countryCode ? regionOf(place.zone, countryCode) : "" };

        });

        /* a continent word also lists that region's other time zones, collapsed */
        if (found.mode === "region") {

            const regions = found.header.replace(/ · .*$/, "").split(" and ");

            zoneList = others.list.filter((place) => regions.includes(place.region));

        }

    }

    cityList = cityList.filter(wanted);

    zoneList = zoneList.filter(wanted);

    const keep = found.mode === "cities";

    const cityRows = orderRows(snapshotPlaces(cityList, nowMs), sort, null, keep);

    result.groups = [{ id: "listed", heading: () => "", rows: cityRows }];

    result.others.rows = orderRows(snapshotPlaces(zoneList, nowMs), sort, null, keep);

    result.headings = found.header ? [found.header.replace(/ \(listed cities only\)$/, "")] : [];

    if (found.mode === "region" || found.mode === "country") {
        result.headings = [relabel(found.header)];
    }

    finish();

    const total = result.counts.places;

    result.announce = found.header
        ? `${relabel(found.header)}: ${places(total)}`
        : raw.trim() === "" ? places(total) : `${places(total)} for "${raw.trim().slice(0, 30)}"`;

    if (total === 0 && found.mode !== "all") {

        const typed = raw.trim();

        const clipped = typed.length > 60 ? `${typed.slice(0, 60)}…` : typed;

        result.mode = region || country ? "none" : result.mode;

        result.empty = {
            message: `No match for "${clipped}". Try a city name such as Lisbon, a country such as Kenya, or a time-zone name such as America/Chicago. This list does not include every city in the world.`,
            widenTo: null,
            suggestions: []
        };

        result.announce = result.empty.message;

    }

    return result;

}

/* ---------- the nearest places (not matches) ---------- */

/*
 * Up to five places closest to the request, with how far each is. They are NEVER part of the matches or their counts.
 * For times the distance is minutes on the local clock; for an offset it is minutes of offset.
 */
function suggest(parsed, groups, rows, hour12) {

    const best = [];

    for (const row of rows) {

        let nearest = null;

        for (const group of groups) {

            const gap = group.gap(row.local, row.offsetSeconds);

            if (nearest === null || gap < nearest.gap) {
                nearest = { gap, side: group.side(row.local, row.offsetSeconds) };
            }

        }

        if (nearest && nearest.gap > 0 && nearest.gap <= SUGGESTION_REACH) {
            best.push({ row, gap: nearest.gap, side: nearest.side });
        }

    }

    best.sort((a, b) => a.gap - b.gap || COMPARERS.city(a.row, b.row));

    /* one suggestion per time zone: eight Indian cities are one nearest place, not eight */
    const seen = new Set();

    const picked = [];

    for (const item of best) {

        const identity = identityOf(item.row.place.zone);

        if (seen.has(identity)) {
            continue;
        }

        seen.add(identity);

        picked.push({
            row: item.row,
            gap: item.gap,
            distance: parsed.kind === "offset"
                ? `${describeSpan(item.gap)} of offset ${item.side > 0 ? "east" : "west"} (${formatOffset(item.row.offsetSeconds)})`
                : `${describeSpan(item.gap)} ${item.side > 0 ? "after" : "before"}`
        });

        if (picked.length === MAX_SUGGESTIONS) {
            break;
        }

    }

    return picked;

}

/* does a refreshed answer differ from the one on screen? (for the minute tick) */
export function sameAnswer(a, b) {

    const keys = (answer) => [
        answer.mode,
        ...answer.groups.map((group) => group.rows.map((row) => row.place.key).join(",")),
        answer.others.rows.map((row) => row.place.key).join(",")
    ].join("|");

    return keys(a) === keys(b);

}
