/* =========================================================
   ToolZen Hub
   Business Days Calculator: the engine (pure, no DOM, no clock)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   A date is a calendar date (year, month, day) in the proleptic
   Gregorian calendar, years 1 to 9999. No time zone, no time of
   day and no JavaScript `Date` object is involved, so nothing
   can drift with daylight saving. The calendar primitives come
   from the Date Difference engine.

   THE CONVENTION (stated on the page, and the same everywhere)
     A business day is a day that is not a weekend day and not a
     listed holiday.

     ADD or SUBTRACT n business days: the result is the nth
     business day AFTER (or BEFORE) the start date. The start date
     itself is never counted, whatever kind of day it is. Friday
     plus 1 is Monday; Saturday plus 1 is also Monday; Monday
     minus 1 is the previous Friday. n = 0 gives the start date.

     COUNT between two dates: the earlier date is not counted, the
     later date is. Monday to Tuesday is 1 business day. A switch
     counts the earlier date too (when it is a business day).
     If the dates are the wrong way round they are swapped, and
     the result says so.

   Holidays are only the dates the user types. There is no list of
   public holidays here: those depend on country, region, year and
   employer, and a list that is out of date is worse than none.
   A holiday that falls on a weekend day changes nothing and is
   reported as such.

   Checked against an independent reference
   (tests/fixtures/business-days-golden.py, Python datetime).
========================================================= */

import {
    DATE_LIMITS,
    parseDate,
    dayNumber,
    dateText
} from "../date-difference/date-engine.js";

import {
    dateFromDayNumber
} from "../date-calculator/date-arithmetic.js";

export const LIMITS = Object.freeze({
    maxBusinessDays: 99999,
    maxHolidays: 500,
    listedDates: 40
});

export const WEEKDAY_NAMES = Object.freeze([
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
]);

export const DEFAULT_WEEKEND = Object.freeze([
    false, false, false, false, false, true, true
]);

const MIN_DAY = dayNumber({ year: DATE_LIMITS.minYear, month: 1, day: 1 });
const MAX_DAY = dayNumber({ year: DATE_LIMITS.maxYear, month: 12, day: 31 });

/* 0 = Monday ... 6 = Sunday; 1970-01-01 (day 0) was a Thursday */
export const weekdayIndex = (number) => ((number + 3) % 7 + 7) % 7;

export const dayText = (number) => dateText(dateFromDayNumber(number));

export const weekdayText = (number) => WEEKDAY_NAMES[weekdayIndex(number)];

export const isoText = (number) => {

    const { year, month, day } = dateFromDayNumber(number);

    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

};


/* =========================================================
   READING THE INPUTS
========================================================= */

/* a list of seven booleans from a list of weekday indexes; null when it leaves no business day */
export function weekendFrom(indexes) {

    const weekend = Array(7).fill(false);

    for (const index of indexes) {
        if (Number.isInteger(index) && index >= 0 && index <= 6) {
            weekend[index] = true;
        }
    }

    return weekend.every(Boolean) ? null : weekend;

}

/*
 * Holidays typed one per line (commas and semicolons also separate).
 * Returns { ok: true, days: Set<dayNumber>, duplicates } or
 * { ok: false, errors: [{ line, text, message }] }. A bad line is an
 * error and is never skipped quietly.
 */
export function parseHolidays(text) {

    const days = new Set();
    const errors = [];

    let duplicates = 0;
    let entries = 0;

    String(text ?? "").split(/\r?\n/).forEach((line, index) => {

        for (const piece of line.split(/[;,]/)) {

            const value = piece.trim();

            if (value === "") {
                continue;
            }

            entries += 1;

            const parsed = parseDate(value);

            if (parsed.state !== "valid") {

                errors.push({
                    line: index + 1,
                    text: value.slice(0, 40),
                    message: "Enter each holiday as year-month-day, for example 2026-12-25."
                });

                continue;

            }

            const number = dayNumber(parsed.date);

            if (days.has(number)) {
                duplicates += 1;
            }

            days.add(number);

        }

    });

    if (entries > LIMITS.maxHolidays) {

        errors.push({
            line: 0,
            text: "",
            message: `Enter at most ${LIMITS.maxHolidays} holidays.`
        });

    }

    return errors.length > 0
        ? { ok: false, errors }
        : { ok: true, days, duplicates };

}

/* a whole number of business days, 0 to the limit, as text */
export function parseCount(text) {

    const value = String(text ?? "").trim();

    if (value === "") {
        return { state: "blank" };
    }

    if (!/^\d{1,5}$/.test(value) || Number(value) > LIMITS.maxBusinessDays) {

        return {
            state: "invalid",
            message: `Enter a whole number of business days from 0 to ${LIMITS.maxBusinessDays}.`
        };

    }

    return { state: "valid", value: Number(value) };

}

const classify = (number, weekend, holidays) =>
    weekend[weekdayIndex(number)]
        ? "weekend"
        : holidays.has(number)
            ? "holiday"
            : "business";


/* =========================================================
   ADD OR SUBTRACT BUSINESS DAYS
   input: { start: day number, count: 0..max, direction: 1 | -1,
            weekend: boolean[7], holidays: Set }
========================================================= */

export function addBusinessDays({ start, count, direction, weekend, holidays }) {

    const step = direction < 0 ? -1 : 1;

    let current = start;
    let counted = 0;

    let weekendDays = 0;
    let holidayDays = 0;

    const skipped = [];

    while (counted < count) {

        current += step;

        if (current < MIN_DAY || current > MAX_DAY) {
            return { status: "out-of-range" };
        }

        const kind = classify(current, weekend, holidays);

        if (kind === "business") {

            counted += 1;

        } else {

            if (kind === "weekend") {
                weekendDays += 1;
            } else {
                holidayDays += 1;
            }

            if (skipped.length < LIMITS.listedDates) {
                skipped.push({ day: current, kind });
            }

        }

    }

    return {
        status: "ok",
        start,
        result: current,
        count,
        direction: step,
        calendarDays: Math.abs(current - start),
        weekendDays,
        holidayDays,
        skipped,
        startKind: classify(start, weekend, holidays)
    };

}


/* =========================================================
   COUNT BUSINESS DAYS BETWEEN TWO DATES
   input: { start, end: day numbers, includeStart, weekend, holidays }
========================================================= */

export function countBusinessDays({ start, end, includeStart, weekend, holidays }) {

    const reversed = end < start;

    const first = reversed ? end : start;
    const last = reversed ? start : end;

    let business = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    const skipped = [];

    const from = includeStart ? first : first + 1;

    for (let day = from; day <= last; day++) {

        const kind = classify(day, weekend, holidays);

        if (kind === "business") {

            business += 1;

        } else {

            if (kind === "weekend") {
                weekendDays += 1;
            } else {
                holidayDays += 1;
            }

            if (skipped.length < LIMITS.listedDates) {
                skipped.push({ day, kind });
            }

        }

    }

    return {
        status: "ok",
        first,
        last,
        reversed,
        same: first === last,
        includeStart: Boolean(includeStart),
        businessDays: business,
        calendarDays: last - from + 1,
        weekendDays,
        holidayDays,
        skipped
    };

}


/* =========================================================
   WORDS
========================================================= */

export function weekendWords(weekend) {

    const names = WEEKDAY_NAMES.filter((_, index) => weekend[index]);

    if (names.length === 0) {
        return "no weekend days";
    }

    return names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

}

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function conventionSentence(mode, { includeStart, direction } = {}) {

    if (mode === "count") {

        return includeStart
            ? "Both the earlier and the later date are counted when they are business days."
            : "The earlier date is not counted; the later date is.";

    }

    return `The start date is not counted. The result is the nth business day ${direction < 0 ? "before" : "after"} it.`;

}

export function resultText(result, input) {

    if (result.status !== "ok") {
        return "";
    }

    if (input.mode === "count") {

        return [
            `${plural(result.businessDays, "business day")} between ${dayText(result.first)} and ${dayText(result.last)}.`,
            `${plural(result.calendarDays, "calendar day")} counted, ${plural(result.weekendDays, "weekend day")} and ${plural(result.holidayDays, "holiday")} left out.`,
            conventionSentence("count", result)
        ].join("\n");

    }

    return [
        `${plural(result.count, "business day")} ${result.direction < 0 ? "before" : "after"} ${dayText(result.start)} is ${weekdayText(result.result)}, ${dayText(result.result)}.`,
        `${plural(result.calendarDays, "calendar day")} apart, ${plural(result.weekendDays, "weekend day")} and ${plural(result.holidayDays, "holiday")} skipped.`,
        conventionSentence("add", result)
    ].join("\n");

}
