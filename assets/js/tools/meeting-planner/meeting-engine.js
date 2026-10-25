/* =========================================================
   ToolZen Hub
   International Meeting Planner: the engine (pure, no DOM, no
   clock of its own)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   WHAT IT ADDS TO THE TIME ZONE CONVERTER
   The converter takes one preferred-hours range per ZONE, one day
   at a time. This planner takes PEOPLE: each has a name, a time
   zone, the days of the week they can meet and a daily window
   that may cross midnight (a night-shift worker, 22:00 to 06:00).
   It scans up to 14 days at once, explains a day with no shared
   time by what blocks it, and checks whether a weekly meeting
   would move for anyone when clocks change.

   ONE EXACT RULE, the converter's: a meeting of L minutes that
   starts at an instant fits a person when every 15-minute block
   of it lies inside that person's availability, judged on that
   person's real clock at that instant (offset by instant, never a
   fixed number). Time zone data, wall-time resolution and
   formatting are the converter's own functions, imported by name.

   AVAILABILITY of a person on their local day D (Monday to
   Sunday) is the window [start, end) on D. When the end is
   earlier than the start the window runs into the next morning
   and belongs to the day it starts on: "Friday 22:00 to 06:00"
   covers Friday 22:00 to Saturday 06:00. Equal start and end are
   refused. Days apply to the day the window STARTS.

   Checked against an independent reference
   (tests/fixtures/meeting-golden.py, Python zoneinfo).
========================================================= */

import {
    GRID_MINUTES,
    UNSUPPORTED_ZONE,
    isValidZone,
    offsetSecondsAt,
    wallAt,
    describeInZone,
    startOfLocalDay,
    hoursMinutes,
    parseDate,
    addDays,
    resolveWall,
    formatClock,
    offsetLabel
} from "../time-zone-converter/time-zone-engine.js";

import {
    transitionBetween
} from "../time-zone-converter/dst-info.js";

export const LIMITS = Object.freeze({
    minPeople: 2,
    maxPeople: 4,
    maxDays: 14,
    defaultDays: 5,
    durations: Object.freeze([15, 30, 45, 60, 90, 120]),
    defaultDuration: 30,
    windowsPerDay: 4,
    recurringWeeks: 12,
    nameLength: 40
});

export const WEEKDAY_NAMES = Object.freeze([
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
]);

export const WEEKDAY_SHORT = Object.freeze(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

export const DEFAULT_PERSON = Object.freeze({
    name: "",
    zone: "",
    start: "09:00",
    end: "17:00",
    days: Object.freeze([true, true, true, true, true, false, false])
});

const MINUTE = 60000;
const BLOCK = GRID_MINUTES * MINUTE;

export const MESSAGES = Object.freeze({
    needTwo: "Add at least two people to find a time that works for everyone.",
    date: "Enter a valid first date (years 1970 to 2100).",
    range: "That range of dates goes beyond the year 2100.",
    duration: "Choose a meeting length from the list.",
    days: "Choose the number of days to look at, from 1 to 14.",
    zone: "Choose a time zone from the list.",
    hours: "Enter times in 15-minute steps, for example 09:00 or 22:15.",
    equal: "The start and end must differ. A window that crosses midnight is allowed, for example 22:00 to 06:00.",
    noDays: "Choose at least one day of the week.",
    unsupported: UNSUPPORTED_ZONE
});

/* weekday index with Monday = 0 from the converter's Sunday = 0 */
const mondayFirst = (sundayFirst) => (sundayFirst + 6) % 7;


/* =========================================================
   READING THE PEOPLE
   { ok: true, people } | { ok: false, issues: [{ person (index), field, message }] }
========================================================= */

export function readPeople(list) {

    const issues = [];
    const people = [];

    if (list.length < LIMITS.minPeople) {
        return { ok: false, issues: [{ person: -1, field: "people", message: MESSAGES.needTwo }] };
    }

    list.slice(0, LIMITS.maxPeople).forEach((entry, index) => {

        const zone = String(entry.zone ?? "");

        const from = hoursMinutes(entry.start);
        const to = hoursMinutes(entry.end);

        const days = Array.from({ length: 7 }, (_, i) => Boolean(entry.days?.[i]));

        const before = issues.length;

        if (zone === "" || !isValidZone(zone)) {
            issues.push({ person: index, field: "zone", message: MESSAGES.zone });
        }

        if (from === null) {
            issues.push({ person: index, field: "start", message: MESSAGES.hours });
        }

        if (to === null) {
            issues.push({ person: index, field: "end", message: MESSAGES.hours });
        }

        if (from !== null && to !== null && from === to) {
            issues.push({ person: index, field: "end", message: MESSAGES.equal });
        }

        if (!days.some(Boolean)) {
            issues.push({ person: index, field: "days", message: MESSAGES.noDays });
        }

        if (issues.length === before) {

            people.push({
                name: String(entry.name ?? "").trim().slice(0, LIMITS.nameLength) || `Person ${index + 1}`,
                zone,
                from,
                to,
                days,
                start: entry.start,
                end: entry.end
            });

        }

    });

    return issues.length > 0 ? { ok: false, issues } : { ok: true, people };

}

/* is a person available during the 15-minute block that starts at this instant? */
export function availableAt(person, ms) {

    const w = wallAt(ms, person.zone);

    const weekday = mondayFirst(w.weekdayIndex);

    const m = w.minuteOfDay;

    if (person.from < person.to) {
        return person.days[weekday] && m >= person.from && m < person.to;
    }

    /* the window crosses midnight: late part on its own day, early part on the day after */
    return (person.days[weekday] && m >= person.from) ||
        (person.days[mondayFirst((w.weekdayIndex + 6) % 7)] && m < person.to);

}


/* =========================================================
   THE SEARCH
   input: { date, days, duration, reference (a zone), people: [{ name, zone, start, end, days }], hour12 }
   status "invalid" { issues }
          "unsupported" { zone, message }
          "ok" { reference, duration, dates: [...], total, best, changes }
   Each date: { date, weekday, status: "ok" | "none", windows, total, startCount, people (when "none") }
========================================================= */

export function findMeetingTimes(input) {

    const issues = [];

    const people = readPeople(input.people ?? []);

    if (!people.ok) {
        return { status: "invalid", issues: people.issues };
    }

    if (!parseDate(input.date)) {
        issues.push({ person: -1, field: "date", message: MESSAGES.date });
    }

    if (!LIMITS.durations.includes(input.duration)) {
        issues.push({ person: -1, field: "duration", message: MESSAGES.duration });
    }

    const days = input.days;

    if (!Number.isInteger(days) || days < 1 || days > LIMITS.maxDays) {
        issues.push({ person: -1, field: "days", message: MESSAGES.days });
    }

    const reference = input.reference || people.people[0].zone;

    if (!isValidZone(reference)) {
        issues.push({ person: -1, field: "reference", message: MESSAGES.zone });
    }

    if (issues.length > 0) {
        return { status: "invalid", issues };
    }

    const endDate = addDays(input.date, days);

    if (endDate === null) {
        return { status: "invalid", issues: [{ person: -1, field: "date", message: MESSAGES.range }] };
    }

    const roster = people.people;

    const duration = input.duration;

    const blocksPerMeeting = duration / GRID_MINUTES;

    const rangeStart = startOfLocalDay(input.date, reference);
    const rangeEnd = startOfLocalDay(endDate, reference);

    const startCount = Math.round((rangeEnd - rangeStart) / BLOCK);

    /* availability of every person for every block, including the blocks a meeting at the end would run into */
    const total = startCount + blocksPerMeeting - 1;

    const grid = roster.map(() => new Uint8Array(total));

    for (let k = 0; k < total; k++) {

        const ms = rangeStart + k * BLOCK;

        for (let p = 0; p < roster.length; p++) {

            if (offsetSecondsAt(ms, roster[p].zone) % (GRID_MINUTES * 60) !== 0) {

                return {
                    status: "unsupported",
                    zone: roster[p].zone,
                    message: `${roster[p].zone} uses an offset on this date that is not a multiple of 15 minutes, so meeting times cannot be listed for it.`
                };

            }

            grid[p][k] = availableAt(roster[p], ms) ? 1 : 0;

        }

    }

    /* does a meeting starting at block k fit person p? (a running count over the next blocksPerMeeting blocks) */
    const fits = (p, k) => {

        for (let i = 0; i < blocksPerMeeting; i++) {
            if (!grid[p][k + i]) {
                return false;
            }
        }

        return true;

    };

    const refDay = (ms) => wallAt(ms, reference);

    const byDate = new Map();

    for (let n = 0; n < days; n++) {

        const date = addDays(input.date, n);

        byDate.set(date, { date, weekdayIndex: null, starts: [], single: roster.map(() => 0), blocks: roster.map(() => []) });

    }

    for (let k = 0; k < startCount; k++) {

        const ms = rangeStart + k * BLOCK;

        const day = byDate.get(refDay(ms).date);

        if (!day) {
            continue;
        }

        let everyone = true;

        for (let p = 0; p < roster.length; p++) {

            if (grid[p][k]) {
                day.blocks[p].push(ms);
            }

            if (fits(p, k)) {
                day.single[p] += 1;
            } else {
                everyone = false;
            }

        }

        if (everyone) {
            day.starts.push(ms);
        }

    }

    const show = (ms, zone) => describeInZone(ms, zone, refDay(ms).dayNumber);

    const dates = [];

    let best = null;
    let totalWindows = 0;

    for (const day of byDate.values()) {

        const sample = day.starts[0] ?? day.blocks.flat()[0] ?? null;

        const weekday = describeInZone(startOfLocalDay(day.date, reference), reference).weekday;

        const runs = runsOf(day.starts);

        totalWindows += runs.length;

        const windows = runs.slice(0, LIMITS.windowsPerDay).map((run) => {

            const endMs = run.lastMs + duration * MINUTE;

            return {
                firstStartMs: run.firstMs,
                lastStartMs: run.lastMs,
                endMs,
                starts: (run.lastMs - run.firstMs) / BLOCK + 1,
                perPerson: roster.map((person) => ({
                    name: person.name,
                    zone: person.zone,
                    start: show(run.firstMs, person.zone),
                    firstEnd: show(run.firstMs + duration * MINUTE, person.zone),
                    lastStart: show(run.lastMs, person.zone),
                    end: show(endMs, person.zone)
                }))
            };

        });

        if (best === null && windows.length > 0) {
            best = windows[0];
        }

        const entry = {
            date: day.date,
            weekday,
            status: runs.length > 0 ? "ok" : "none",
            windows,
            total: runs.length,
            startCount: day.starts.length,
            sampleMs: sample
        };

        if (runs.length === 0) {

            entry.people = roster.map((person, p) => ({
                name: person.name,
                zone: person.zone,
                canMeet: day.single[p] > 0,
                runs: runsOf(day.blocks[p]).slice(0, 3).map((run) => ({
                    startMs: run.firstMs,
                    endMs: run.lastMs + BLOCK,
                    start: show(run.firstMs, reference),
                    end: show(run.lastMs + BLOCK, reference)
                }))
            }));

            entry.blockedBy = entry.people.filter((person) => !person.canMeet).map((person) => person.name);

        }

        dates.push(entry);

    }

    return {
        status: "ok",
        reference,
        duration,
        dates,
        total: totalWindows,
        best,
        people: roster,
        changes: clockChanges(roster, rangeStart, rangeEnd)
    };

}

/* consecutive 15-minute instants merged into runs */
function runsOf(instants) {

    const runs = [];

    for (const ms of instants) {

        const last = runs[runs.length - 1];

        if (last && ms - last.lastMs === BLOCK) {
            last.lastMs = ms;
        } else {
            runs.push({ firstMs: ms, lastMs: ms });
        }

    }

    return runs;

}


/* =========================================================
   CLOCK CHANGES INSIDE THE SEARCHED DATES
   For each person whose offset changes between the start and the end of the range:
   the instant of the change (found to the minute) and the two offsets.
========================================================= */

export { transitionBetween };

function clockChanges(roster, rangeStart, rangeEnd) {

    const changes = [];

    const DAYS = 86400000;

    for (const person of roster) {

        /* sample every day, so two changes in one stretch are both found */
        for (let at = rangeStart; at < rangeEnd; at += DAYS) {

            const next = Math.min(at + DAYS, rangeEnd);

            const found = transitionBetween(person.zone, at, next);

            if (found) {

                const w = describeInZone(found.ms, person.zone);

                changes.push({
                    name: person.name,
                    zone: person.zone,
                    ms: found.ms,
                    fromOffset: found.fromOffset,
                    toOffset: found.toOffset,
                    local: w,
                    text: `${offsetLabel(found.fromOffset)} to ${offsetLabel(found.toOffset)}`
                });

            }

        }

    }

    return changes;

}


/* =========================================================
   A WEEKLY MEETING THROUGH CLOCK CHANGES
   The series is fixed on the reference zone's clock (the usual way a calendar holds a recurring
   meeting): same weekday, same reference-zone time, every week. Each other person's local time can
   move when their clocks change on a different date.

   input: { slotMs (week 0 start), reference, duration, people, weeks }
   Returns { weeks: [{ week, ms, date, status: "ok" | "skipped" | "ambiguous", perPerson: [{ time, weekday, shiftMinutes, dayShift, fits }] }],
             summary: [{ name, zone, base: {time, weekday}, firstShift: null | {...}, outsideFrom: null | week }],
             moved: boolean }
========================================================= */

const normalizeShift = (minutes) => {

    let shift = ((minutes % 1440) + 1440) % 1440;

    if (shift > 720) {
        shift -= 1440;
    }

    return shift;

};

export function recurringCheck({ slotMs, reference, duration, people, weeks = LIMITS.recurringWeeks }) {

    const roster = readPeople(people);

    if (!roster.ok) {
        return { status: "invalid", issues: roster.issues };
    }

    const blocks = duration / GRID_MINUTES;

    const base = wallAt(slotMs, reference);

    const baseLocal = roster.people.map((person) => wallAt(slotMs, person.zone));

    const rows = [];

    for (let week = 0; week < weeks; week++) {

        const date = addDays(base.date, 7 * week);

        if (date === null) {
            break;
        }

        const resolved = resolveWall(date, base.time, reference);

        if (resolved.kind === "gap") {

            rows.push({ week, date, status: "skipped", ms: null, perPerson: [] });

            continue;

        }

        const ms = resolved.candidates[0].ms;

        rows.push({
            week,
            date,
            status: resolved.kind === "overlap" ? "ambiguous" : "ok",
            ms,
            perPerson: roster.people.map((person, p) => {

                const w = wallAt(ms, person.zone);

                let fits = true;

                for (let i = 0; i < blocks; i++) {
                    if (!availableAt(person, ms + i * BLOCK)) {
                        fits = false;
                        break;
                    }
                }

                return {
                    time: w.time,
                    date: w.date,
                    weekday: mondayFirst(w.weekdayIndex),
                    shiftMinutes: normalizeShift(w.minuteOfDay - baseLocal[p].minuteOfDay),
                    dayShift: w.dayNumber - baseLocal[p].dayNumber - 7 * week,
                    fits,
                    offsetSeconds: w.offsetSeconds
                };

            })
        });

    }

    const summary = roster.people.map((person, p) => {

        const moved = rows.find((row) => row.status !== "skipped" && row.perPerson[p].shiftMinutes !== 0);

        const outside = rows.find((row) => row.status !== "skipped" && !row.perPerson[p].fits);

        return {
            name: person.name,
            zone: person.zone,
            baseTime: baseLocal[p].time,
            baseWeekday: mondayFirst(baseLocal[p].weekdayIndex),
            firstShift: moved
                ? {
                    week: moved.week,
                    date: moved.date,
                    time: moved.perPerson[p].time,
                    shiftMinutes: moved.perPerson[p].shiftMinutes,
                    dayShift: moved.perPerson[p].dayShift
                }
                : null,
            outsideFromWeek: outside ? outside.week : null,
            outsideWhenBaseFits: Boolean(outside) && rows[0].perPerson[p]?.fits === true
        };

    });

    return {
        status: "ok",
        weeks: rows,
        summary,
        moved: summary.some((entry) => entry.firstShift !== null),
        outside: summary.some((entry) => entry.outsideFromWeek !== null)
    };

}


/* =========================================================
   TEXT
========================================================= */

export function personTime(entry, hour12) {

    return formatClock(entry.h, entry.mi, hour12);

}

export function shiftWords(minutes) {

    const abs = Math.abs(minutes);

    const h = Math.floor(abs / 60);
    const m = abs % 60;

    const parts = [];

    if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
    if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);

    return `${parts.join(" ")} ${minutes > 0 ? "later" : "earlier"}`;

}

export function copyText(result, hour12 = false, limit = 6) {

    if (!result || result.status !== "ok") {
        return "";
    }

    const lines = [`Meeting options, ${result.duration} minutes (shown in each person's local time)`];

    let used = 0;

    for (const day of result.dates) {

        for (const slot of day.windows) {

            if (used >= limit) {
                break;
            }

            const first = slot.perPerson[0].start;

            used += 1;

            lines.push(
                "",
                `${first.dateLabel}: start between ${personTime(slot.perPerson[0].start, hour12)} and ${personTime(slot.perPerson[0].lastStart, hour12)} (${slot.perPerson[0].zone})`
            );

            for (const person of slot.perPerson) {

                const relation = person.start.dayDelta === 0 ? "" : ` (${person.start.relation.toLowerCase()})`;

                lines.push(
                    `  ${person.name}, ${person.zone}: earliest ${personTime(person.start, hour12)} to ${personTime(person.firstEnd, hour12)} ${offsetLabel(person.start.offsetSeconds, true)}${relation}`
                );

            }

        }

    }

    if (used === 0) {
        lines.push("", "No time falls inside everyone's availability on these dates.");
    }

    return `${lines.join("\n")}\n`;

}


/* =========================================================
   THE LINK (settings only; names are included only if typed)
   ?p=Name~Zone~0900~1700~1111100&p=...&len=30&d=2026-11-03&n=5&ref=Zone
========================================================= */

export function buildQuery(state) {

    const params = new URLSearchParams();

    for (const person of state.people) {

        params.append(
            "p",
            [
                String(person.name ?? "").replace(/~/g, " ").trim(),
                person.zone,
                String(person.start ?? "").replace(":", ""),
                String(person.end ?? "").replace(":", ""),
                (person.days ?? []).map((on) => (on ? "1" : "0")).join("")
            ].join("~")
        );

    }

    if (state.duration) params.set("len", String(state.duration));
    if (state.date) params.set("d", state.date);
    if (state.days) params.set("n", String(state.days));
    if (state.reference) params.set("ref", state.reference);

    return params.toString();

}

export function parseQuery(search) {

    const params = new URLSearchParams(String(search ?? "").replace(/^\?/, ""));

    const people = [];

    for (const value of params.getAll("p").slice(0, LIMITS.maxPeople)) {

        const parts = value.split("~");

        if (parts.length !== 5 || !/^[01]{7}$/.test(parts[4]) || !/^\d{4}$/.test(parts[2]) || !/^\d{4}$/.test(parts[3])) {
            continue;
        }

        people.push({
            name: parts[0].slice(0, LIMITS.nameLength),
            zone: parts[1],
            start: `${parts[2].slice(0, 2)}:${parts[2].slice(2)}`,
            end: `${parts[3].slice(0, 2)}:${parts[3].slice(2)}`,
            days: [...parts[4]].map((c) => c === "1")
        });

    }

    const duration = Number(params.get("len"));
    const days = Number(params.get("n"));

    return {
        people,
        duration: LIMITS.durations.includes(duration) ? duration : null,
        date: parseDate(params.get("d")) ? params.get("d") : null,
        days: Number.isInteger(days) && days >= 1 && days <= LIMITS.maxDays ? days : null,
        reference: params.get("ref") || null
    };

}
