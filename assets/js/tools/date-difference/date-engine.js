/* =========================================================
   ToolZen Hub
   Date Difference: the calendar arithmetic

   Pure: no DOM, no storage, no clock, and no JavaScript `Date`
   object, so no time zone or daylight-saving rule can touch a
   result. A date here is a calendar date (year, month, day) read
   from "YYYY-MM-DD" text, in the proleptic Gregorian calendar.

   TOTAL DAYS
       dayNumber(later) - dayNumber(earlier), by integer
       "days from civil" arithmetic. Exact.

   CALENDAR BREAKDOWN (the rule the page states)
       addMonths(A, n) is the date n calendar months after A with
       the same day of the month, clamped to the last day of the
       target month (31 January + 1 month is 28 or 29 February).
       n is the LARGEST whole number of months with
       addMonths(A, n) <= B, where A is the earlier date and B the
       later one. Then years = floor(n / 12), months = n mod 12 and
       days = dayNumber(B) - dayNumber(addMonths(A, n)).
       So addMonths(A, n) <= B < addMonths(A, n + 1).

   Checked against an independent reference
   (tests/fixtures/date-difference-golden.py), which walks months
   with Python's calendar and datetime.
========================================================= */

export const DATE_LIMITS = Object.freeze({
    minYear: 1,
    maxYear: 9999
});

const MONTH_NAMES = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]);


/* =========================================================
   CALENDAR
========================================================= */

export function isLeapYear(year) {

    return (
        (year % 4 === 0 && year % 100 !== 0) ||
        year % 400 === 0
    );

}

export function daysInMonth(year, month) {

    if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    }

    return [4, 6, 9, 11].includes(month) ? 30 : 31;

}

/* days since 1970-01-01 of a calendar date (Hinnant's days_from_civil) */
export function dayNumber({ year, month, day }) {

    const y = month <= 2 ? year - 1 : year;
    const era = Math.floor(y / 400);
    const yearOfEra = y - era * 400;
    const dayOfYear =
        Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
    const dayOfEra =
        yearOfEra * 365 +
        Math.floor(yearOfEra / 4) -
        Math.floor(yearOfEra / 100) +
        dayOfYear;

    return era * 146097 + dayOfEra - 719468;

}

/* the date n months after `date`, the day of the month clamped to the end of that month */
export function addMonths(date, n) {

    const index = date.year * 12 + (date.month - 1) + n;
    const year = Math.floor(index / 12);
    const month = (index % 12 + 12) % 12 + 1;

    return {
        year,
        month,
        day: Math.min(date.day, daysInMonth(year, month))
    };

}

const isAfter = (a, b) => dayNumber(a) > dayNumber(b);


/* =========================================================
   READING A DATE
   Returns { state: "blank" } | { state: "invalid", message }
   | { state: "valid", date: { year, month, day } }.
========================================================= */

export function parseDate(text) {

    const value = String(text ?? "").trim();

    if (value === "") {
        return { state: "blank" };
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return { state: "invalid", message: "Enter a date as year-month-day, for example 2026-03-15." };
    }

    const [year, month, day] = match.slice(1).map(Number);

    if (
        year < DATE_LIMITS.minYear ||
        year > DATE_LIMITS.maxYear ||
        month < 1 || month > 12 ||
        day < 1 || day > daysInMonth(year, month)
    ) {
        return { state: "invalid", message: "That is not a real calendar date (years 1 to 9999)." };
    }

    return { state: "valid", date: { year, month, day } };

}


/* =========================================================
   THE DIFFERENCE
   Returns one of:
     { status: "incomplete" }                       fewer than two dates
     { status: "invalid", errors: [{ field, message }] }
     { status: "ok", ... }
   `ok` carries: earlier, later (dates), reversed, same,
   totalDays, years, months, days, weeks, weekDays.
========================================================= */

export function calculateDateDifference(startText, endText) {

    const start = parseDate(startText);
    const end = parseDate(endText);

    const errors = [
        ["start", start],
        ["end", end]
    ]
        .filter(([, parsed]) => parsed.state === "invalid")
        .map(([field, parsed]) => ({ field, message: parsed.message }));

    if (errors.length > 0) {
        return { status: "invalid", errors };
    }

    if (start.state !== "valid" || end.state !== "valid") {
        return { status: "incomplete" };
    }

    const reversed = isAfter(start.date, end.date);

    const earlier = reversed ? end.date : start.date;
    const later = reversed ? start.date : end.date;

    const totalDays = dayNumber(later) - dayNumber(earlier);

    /* the largest n with addMonths(earlier, n) <= later: the month difference, or one less when the day of the month is not yet reached */
    let months = (later.year - earlier.year) * 12 + (later.month - earlier.month);

    if (isAfter(addMonths(earlier, months), later)) {
        months -= 1;
    }

    const days = dayNumber(later) - dayNumber(addMonths(earlier, months));

    return {
        status: "ok",
        earlier,
        later,
        reversed,
        same: totalDays === 0,
        totalDays,
        years: Math.floor(months / 12),
        months: months % 12,
        days,
        weeks: Math.floor(totalDays / 7),
        weekDays: totalDays % 7
    };

}


/* =========================================================
   TEXT
========================================================= */

const plural = (count, word) =>
    `${count.toLocaleString("en-IN")} ${word}${count === 1 ? "" : "s"}`;

/* "1 month, 9 days"; a zero unit is left out; nothing left is "0 days" */
export function unitsText(years, months, days) {

    const parts = [];

    if (years > 0) {
        parts.push(plural(years, "year"));
    }

    if (months > 0) {
        parts.push(plural(months, "month"));
    }

    if (days > 0 || parts.length === 0) {
        parts.push(plural(days, "day"));
    }

    return parts.join(", ");

}

export function daysText(totalDays) {

    return plural(totalDays, "day");

}

export function weeksText(weeks, weekDays) {

    return `${plural(weeks, "week")}, ${plural(weekDays, "day")}`;

}

/* "1 January 2026" */
export function dateText({ year, month, day }) {

    return `${day} ${MONTH_NAMES[month - 1]} ${year}`;

}
