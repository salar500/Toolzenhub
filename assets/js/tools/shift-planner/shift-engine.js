/* =========================================================
   ToolZen Hub
   Shift Schedule Planner: the engine (pure, no DOM, no clock)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   A CYCLE is a list of days, each one Day, Evening, Night or Off,
   that repeats without end. The planner places the cycle on the
   calendar and lists what each date is. It lays out a rotation;
   it does not measure hours actually worked (that is the Hours &
   Timesheet Calculator) and it knows nothing about pay.

   DATES are calendar dates (year, month, day), so a daylight-
   saving change cannot move a shift. A night shift that starts at
   23:00 on a date ends the next morning; it belongs to the date it
   starts on. The hours of a shift are the plain difference between
   its start and end times on the clock (an end at or before the
   start means the next day), as in the Hours & Timesheet
   Calculator, so a shift that crosses a daylight-saving change is
   not adjusted.

   Checked against an independent reference
   (tests/fixtures/shift-golden.py, Python datetime).
========================================================= */

import {
    DATE_LIMITS,
    dayNumber
} from "../date-difference/date-engine.js";

import {
    dateFromDayNumber
} from "../date-calculator/date-arithmetic.js";

import {
    parseTime
} from "../hours-calculator/hours-engine.js";

export const LIMITS = Object.freeze({
    minCycle: 2,
    maxCycle: 56,
    minWeeks: 1,
    maxWeeks: 52
});

export const CODES = Object.freeze({
    D: Object.freeze({ code: "D", id: "day", name: "Day" }),
    E: Object.freeze({ code: "E", id: "evening", name: "Evening" }),
    N: Object.freeze({ code: "N", id: "night", name: "Night" }),
    O: Object.freeze({ code: "O", id: "off", name: "Off" })
});

export const DEFAULT_TIMES = Object.freeze({
    D: Object.freeze({ start: "07:00", end: "15:00" }),
    E: Object.freeze({ start: "15:00", end: "23:00" }),
    N: Object.freeze({ start: "23:00", end: "07:00" })
});

/* Each preset is written out in full on the page; the names are only labels. */
export const PRESETS = Object.freeze([
    Object.freeze({ id: "4-on-4-off", name: "4 days on, 4 days off", cycle: "4D 4O" }),
    Object.freeze({ id: "2-2", name: "2 on, 2 off", cycle: "2D 2O" }),
    Object.freeze({ id: "3-3", name: "3 on, 3 off", cycle: "3D 3O" }),
    Object.freeze({ id: "5-2", name: "5 on, 2 off", cycle: "5D 2O" }),
    Object.freeze({ id: "2-2-3", name: "2-2-3 (2 on, 2 off, 3 on, 2 off, 2 on, 3 off)", cycle: "2D 2O 3D 2O 2D 3O" }),
    Object.freeze({ id: "rotating", name: "Rotating: 2 day, 2 night, 4 off", cycle: "2D 2N 4O" })
]);

export const WEEKDAY_NAMES = Object.freeze([
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
]);

const MIN_DAY = dayNumber({ year: DATE_LIMITS.minYear, month: 1, day: 1 });
const MAX_DAY = dayNumber({ year: DATE_LIMITS.maxYear, month: 12, day: 31 });

export const weekdayIndex = (number) => ((number + 3) % 7 + 7) % 7;

const pad2 = (n) => String(n).padStart(2, "0");

export const isoText = (number) => {

    const { year, month, day } = dateFromDayNumber(number);

    return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;

};

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;


/* =========================================================
   READING A CYCLE
   Letters D, E, N, O (also "-" for Off), written as 2D 2N 3O or as
   DDNNOOO or D D N N O O O. { ok, days: ["D", ...] } or { ok: false, message }.
========================================================= */

export function parseCycle(text) {

    const value = String(text ?? "").toUpperCase().replace(/[,;]/g, " ").trim();

    if (value === "") {
        return { ok: false, blank: true, message: "Enter a cycle, for example 4D 4O or DDNNOOO." };
    }

    const days = [];

    const pattern = /(\d{1,2})?\s*([DENO-])/y;

    let position = 0;

    while (position < value.length) {

        if (/\s/.test(value[position])) {
            position += 1;
            continue;
        }

        pattern.lastIndex = position;

        const match = pattern.exec(value);

        if (!match) {

            return {
                ok: false,
                message: `“${value[position]}” is not part of a cycle. Use D (day), E (evening), N (night) and O (off), for example 2D 2N 4O.`
            };

        }

        const run = match[1] === undefined ? 1 : Number(match[1]);

        if (run < 1) {
            return { ok: false, message: "A run must be at least 1 day, for example 4D." };
        }

        const code = match[2] === "-" ? "O" : match[2];

        for (let i = 0; i < run; i++) {
            days.push(code);
        }

        position = pattern.lastIndex;

        if (days.length > LIMITS.maxCycle) {
            return { ok: false, message: `A cycle can be at most ${LIMITS.maxCycle} days long.` };
        }

    }

    if (days.length < LIMITS.minCycle) {
        return { ok: false, message: `A cycle needs at least ${LIMITS.minCycle} days.` };
    }

    if (days.every(code => code === "O")) {
        return { ok: false, message: "A cycle needs at least one working day (D, E or N)." };
    }

    return { ok: true, days };

}

/* a cycle as run-length text: ["D","D","O"] -> "2D 1O" */
export function cycleText(days) {

    const parts = [];

    for (const code of days) {

        const last = parts[parts.length - 1];

        if (last && last.code === code) {
            last.run += 1;
        } else {
            parts.push({ code, run: 1 });
        }

    }

    return parts.map(part => `${part.run}${part.code}`).join(" ");

}

/* a cycle in words: "2 days, 2 off" */
export function cycleWords(days) {

    const parts = [];

    for (const code of days) {

        const last = parts[parts.length - 1];

        if (last && last.code === code) {
            last.run += 1;
        } else {
            parts.push({ code, run: 1 });
        }

    }

    return parts
        .map(part => part.code === "O"
            ? `${part.run} off`
            : `${part.run} ${CODES[part.code].name.toLowerCase()}`)
        .join(", ");

}


/* =========================================================
   SHIFT TIMES
   { D: { start, end }, E: {...}, N: {...} } as HH:MM text.
   Returns { ok: true, minutes: { D, E, N } } or { ok: false, errors: [{ code, message }] }.
   A shift runs from start to end; an end at or before the start is the next day.
   Only the codes the cycle uses need valid times.
========================================================= */

export function shiftLength(startText, endText) {

    const start = parseTime(startText);
    const end = parseTime(endText);

    if (start === null || end === null) {
        return null;
    }

    if (start === end) {
        return null;
    }

    return ((end - start) % 1440 + 1440) % 1440;

}

export function readTimes(times, usedCodes) {

    const errors = [];
    const minutes = {};

    for (const code of ["D", "E", "N"]) {

        if (!usedCodes.has(code)) {
            continue;
        }

        const length = shiftLength(times?.[code]?.start, times?.[code]?.end);

        if (length === null) {

            errors.push({
                code,
                message: `${CODES[code].name} shift: enter a start and an end time that differ.`
            });

        } else {

            minutes[code] = length;

        }

    }

    return errors.length > 0 ? { ok: false, errors } : { ok: true, minutes };

}


/* =========================================================
   THE SCHEDULE
   input: { cycle: ["D", ...], start: day number, position: 1..cycle length,
            weeks: 1..52, times }
   { status: "ok", days, summary } | { status: "invalid", errors } | { status: "out-of-range" }
========================================================= */

export function buildSchedule({ cycle, start, position, weeks, times }) {

    const length = cycle.length;

    const used = new Set(cycle.filter(code => code !== "O"));

    const read = readTimes(times, used);

    if (!read.ok) {
        return { status: "invalid", errors: read.errors };
    }

    const count = weeks * 7;

    if (start < MIN_DAY || start + count - 1 > MAX_DAY) {
        return { status: "out-of-range" };
    }

    const days = [];

    for (let i = 0; i < count; i++) {

        const number = start + i;

        const index = ((position - 1 + i) % length + length) % length;

        const code = cycle[index];

        const working = code !== "O";

        days.push({
            number,
            iso: isoText(number),
            weekday: weekdayIndex(number),
            cyclePosition: index + 1,
            code,
            working,
            start: working ? times[code].start : null,
            end: working ? times[code].end : null,
            minutes: working ? read.minutes[code] : 0,
            endsNextDay: working && parseTime(times[code].end) <= parseTime(times[code].start)
        });

    }

    return { status: "ok", days, summary: summarize(days, cycle) };

}


/* =========================================================
   SUMMARY
========================================================= */

function longestRun(flags) {

    let best = 0;
    let current = 0;

    for (const flag of flags) {

        current = flag ? current + 1 : 0;

        if (current > best) {
            best = current;
        }

    }

    return best;

}

export function summarize(days, cycle) {

    const counts = { D: 0, E: 0, N: 0, O: 0 };

    let minutes = 0;

    for (const day of days) {
        counts[day.code] += 1;
        minutes += day.minutes;
    }

    const working = counts.D + counts.E + counts.N;

    /* the longest run around the cycle itself, so a short window does not hide it */
    const doubled = [...cycle, ...cycle];

    const cycleWork = longestRun(cycle.map(code => code !== "O"));
    const cycleOff = longestRun(cycle.map(code => code === "O"));

    const wrapWork = cycle.every(code => code !== "O")
        ? cycle.length
        : Math.min(longestRun(doubled.map(code => code !== "O")), cycle.length);

    const wrapOff = cycle.every(code => code === "O")
        ? cycle.length
        : Math.min(longestRun(doubled.map(code => code === "O")), cycle.length);

    return {
        totalDays: days.length,
        counts,
        workingDays: working,
        offDays: counts.O,
        totalMinutes: minutes,
        averageMinutesPerWeek: Math.round(minutes / (days.length / 7)),
        longestWorkRun: Math.max(cycleWork, wrapWork),
        longestOffRun: Math.max(cycleOff, wrapOff),
        longestWorkRunInWindow: longestRun(days.map(day => day.working)),
        longestOffRunInWindow: longestRun(days.map(day => !day.working)),
        cycleLength: cycle.length,
        cycleWorkingDays: cycle.filter(code => code !== "O").length
    };

}

/* "8:00" for 480 minutes, "37:30" for 2250 */
export function hoursText(minutes) {

    return `${Math.floor(minutes / 60)}:${pad2(minutes % 60)}`;

}


/* =========================================================
   MONTHS (for a calendar view)
   Groups the days by calendar month: [{ year, month, days: [...] }]
========================================================= */

export function groupByMonth(days) {

    const months = [];

    for (const day of days) {

        const { year, month } = dateFromDayNumber(day.number);

        const last = months[months.length - 1];

        if (last && last.year === year && last.month === month) {
            last.days.push(day);
        } else {
            months.push({ year, month, days: [day] });
        }

    }

    return months;

}


/* =========================================================
   COPY TEXT: runs of the same kind of day, not one line a day
========================================================= */

const MONTH_SHORT = Object.freeze([
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]);

const WEEKDAY_SHORT = Object.freeze(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

const shortDate = (number) => {

    const { year, month, day } = dateFromDayNumber(number);

    return `${WEEKDAY_SHORT[weekdayIndex(number)]} ${day} ${MONTH_SHORT[month - 1]} ${year}`;

};

export function copyText({ days, summary }, cycle, times) {

    const lines = [
        `Shift schedule: ${cycleText(cycle)} (${cycleWords(cycle)}), repeating every ${plural(cycle.length, "day")}`,
        `${shortDate(days[0].number)} to ${shortDate(days[days.length - 1].number)}`,
        ""
    ];

    let runStart = 0;

    const describe = (day) =>
        day.working
            ? `${CODES[day.code].name} ${day.start}-${day.end}${day.endsNextDay ? " (ends next day)" : ""}`
            : "Off";

    for (let i = 1; i <= days.length; i++) {

        if (i < days.length && days[i].code === days[runStart].code) {
            continue;
        }

        const first = days[runStart];
        const last = days[i - 1];

        const range = first.number === last.number
            ? shortDate(first.number)
            : `${shortDate(first.number)} to ${shortDate(last.number)}`;

        lines.push(`${range}: ${describe(first)}`);

        runStart = i;

    }

    lines.push(
        "",
        `${plural(summary.workingDays, "working day")}, ${plural(summary.offDays, "day")} off, ${hoursText(summary.totalMinutes)} hours of scheduled shifts`
    );

    return lines.join("\n");

}
