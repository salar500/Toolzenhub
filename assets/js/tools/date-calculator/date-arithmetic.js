/* =========================================================
   ToolZen Hub
   Date Calculator: adding and subtracting a duration

   Pure: no DOM, no storage, no clock and no JavaScript `Date`
   object, so no time zone or daylight-saving rule can touch a
   result. A date is a calendar date (year, month, day) in the
   proleptic Gregorian calendar, years 1 to 9999. The shared
   calendar primitives (reading a date, day numbers, month
   lengths, clamped month steps) come from the Date Difference
   engine; this file adds what that one does not need: the date
   that belongs to a day number, and the weekday.

   THE CONTRACT
     1. Years and months are added (or subtracted) together as
        whole calendar months (1 year = 12 months). The day of the
        month is kept, and clamped to the last day of the target
        month when that month is shorter (31 January + 1 month is
        28 or 29 February).
     2. Then weeks and days are added (or subtracted) as plain
        calendar days (1 week = 7 days).
     3. A result before year 1 or after year 9999 is not given.

   This is calendar arithmetic, not a reversible one: after a
   month-end clamp, undoing the step does not return to the start
   (31 January + 1 month = 28 February; 28 February - 1 month =
   28 January).

   Checked against an independent reference
   (tests/fixtures/date-calculator-golden.py, Python datetime).
========================================================= */

import {
    DATE_LIMITS,
    parseDate,
    dayNumber,
    daysInMonth,
    addMonths,
    dateText
} from "../date-difference/date-engine.js";

export const AMOUNT_LIMIT_DIGITS = 7;

const WEEKDAYS = Object.freeze([
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
]);

const MONTH_NAMES = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]);


/* =========================================================
   CALENDAR
========================================================= */

/* the calendar date of a day number (days since 1970-01-01); the inverse of dayNumber (Hinnant's civil_from_days) */
export function dateFromDayNumber(number) {

    const z = number + 719468;
    const era = Math.floor(z / 146097);
    const dayOfEra = z - era * 146097;
    const yearOfEra = Math.floor(
        (dayOfEra -
            Math.floor(dayOfEra / 1460) +
            Math.floor(dayOfEra / 36524) -
            Math.floor(dayOfEra / 146096)) / 365
    );
    const dayOfYear =
        dayOfEra -
        (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    const shifted = Math.floor((5 * dayOfYear + 2) / 153);

    const day = dayOfYear - Math.floor((153 * shifted + 2) / 5) + 1;
    const month = shifted < 10 ? shifted + 3 : shifted - 9;
    const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);

    return { year, month, day };

}

/* 1970-01-01 (day number 0) was a Thursday */
export function weekdayOf(date) {

    return WEEKDAYS[((dayNumber(date) + 3) % 7 + 7) % 7];

}

const inRange = ({ year }) =>
    year >= DATE_LIMITS.minYear && year <= DATE_LIMITS.maxYear;


/* =========================================================
   READING A DURATION PART
   Blank is 0. Only whole numbers, up to seven digits.
========================================================= */

export function parseAmount(text) {

    const value = String(text ?? "").trim();

    if (value === "") {
        return { state: "valid", value: 0 };
    }

    if (!new RegExp(`^\\d{1,${AMOUNT_LIMIT_DIGITS}}$`).test(value)) {
        return {
            state: "invalid",
            message: "Enter a whole number of 0 or more, up to 7 digits."
        };
    }

    return { state: "valid", value: Number(value) };

}


/* =========================================================
   THE CALCULATION
   input: { start, operation, years, months, weeks, days }, all text
   (start as YYYY-MM-DD; operation "add" or "subtract").
   Returns one of:
     { status: "incomplete" }                 no start date, or no duration
     { status: "invalid", errors: [{ field, message }] }
     { status: "out-of-range", message }
     { status: "ok", start, result, operation, resultWeekday,
       startWeekday, displacement, clamp: null | { ... } }
========================================================= */

const FIELDS = ["years", "months", "weeks", "days"];

export function calculateDate(input) {

    const operation =
        input?.operation === "subtract" ? "subtract" : "add";

    const start = parseDate(input?.start);

    const errors = [];

    if (start.state === "invalid") {
        errors.push({ field: "start", message: start.message });
    }

    const amounts = {};

    for (const field of FIELDS) {

        const parsed = parseAmount(input?.[field]);

        if (parsed.state === "invalid") {
            errors.push({ field, message: parsed.message });
        } else {
            amounts[field] = parsed.value;
        }

    }

    if (errors.length > 0) {
        return { status: "invalid", errors };
    }

    const nothingToApply =
        FIELDS.every(field => amounts[field] === 0);

    if (start.state !== "valid" || nothingToApply) {
        return { status: "incomplete" };
    }

    const sign = operation === "add" ? 1 : -1;

    const monthSteps = sign * (amounts.years * 12 + amounts.months);
    const daySteps = sign * (amounts.weeks * 7 + amounts.days);

    const stepped = addMonths(start.date, monthSteps);

    if (!inRange(stepped)) {
        return outOfRange();
    }

    const result =
        dateFromDayNumber(dayNumber(stepped) + daySteps);

    if (!inRange(result)) {
        return outOfRange();
    }

    const clamped = stepped.day !== start.date.day;

    return {
        status: "ok",
        operation,
        start: start.date,
        result,
        startWeekday: weekdayOf(start.date),
        resultWeekday: weekdayOf(result),
        displacement: dayNumber(result) - dayNumber(start.date),
        clamp: clamped
            ? {
                requestedDay: start.date.day,
                month: stepped.month,
                year: stepped.year,
                lastDay: daysInMonth(stepped.year, stepped.month),
                thenOffset: daySteps !== 0
            }
            : null
    };

}

function outOfRange() {

    return {
        status: "out-of-range",
        message: `The result would fall outside the supported years, ${DATE_LIMITS.minYear} to ${DATE_LIMITS.maxYear}. Try a smaller amount.`
    };

}


/* =========================================================
   TEXT
========================================================= */

const plural = (count, word) =>
    `${count.toLocaleString("en-IN")} ${word}${count === 1 ? "" : "s"}`;

/* "1 year, 2 months, 3 weeks and 4 days": a zero part is left out */
export function durationText({ years, months, weeks, days }) {

    const parts = [
        [years, "year"],
        [months, "month"],
        [weeks, "week"],
        [days, "day"]
    ]
        .filter(([count]) => count > 0)
        .map(([count, word]) => plural(count, word));

    if (parts.length <= 1) {
        return parts[0] ?? "";
    }

    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

}

export function clampText(clamp) {

    const month = MONTH_NAMES[clamp.month - 1];

    return `${month} ${clamp.year} has only ${clamp.lastDay} days, so the date was adjusted from day ${clamp.requestedDay} to the last day of the month, ${clamp.lastDay} ${month}.${clamp.thenOffset ? " The weeks and days were then counted from that date." : ""}`;

}

export function displacementText(displacement) {

    if (displacement === 0) {
        return "the same day as the start date";
    }

    const count = Math.abs(displacement);

    return `${plural(count, "day")} ${displacement > 0 ? "after" : "before"} the start date`;

}

export { dateText };
