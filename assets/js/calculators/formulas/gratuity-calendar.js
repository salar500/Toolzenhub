/* =========================================================
   ToolZen Hub
   Gratuity Calculator (India): the calendar arithmetic

   Pure: no DOM, no storage, no clock, and no JavaScript `Date`
   object, so no time zone or daylight-saving rule can touch a
   result. A date is a calendar date { year, month, day } read from
   "YYYY-MM-DD" text, in the proleptic Gregorian calendar, years 1
   to 9999. It is a separate module from the Date Difference
   engine on purpose: a legal-money result must not change because
   another tool is edited (specification 33.4, decision P1).

   SERVICE DURATION (convention C-prime, owner decision 2026-10-21,
   PROVISIONAL: an estimation convention, not a legally mandated
   method and not validated for gratuity-specific month-end
   interpretation; specification 7.1 and 29.2)

     both days are counted: the exclusive end is the day AFTER the
     exit date;

     anniversary(join, m) is the date m calendar months after the
     joining date with the same day of the month, or, when that day
     does not exist in that month, the FIRST DAY OF THE FOLLOWING
     MONTH. Each anniversary is computed from the joining date,
     never from the previous anniversary;

     the completed months m are the LARGEST whole number with
     anniversary(join, m) on or before the exclusive end; then
     years = floor(m / 12), months = m mod 12 and
     days = exclusiveEnd - anniversary(join, m).

   The explorer's hypothetical exit dates use a DIFFERENT, clamp-style
   rule (addMonthsClamp): the same day of the month, or the last day
   of that month when it is shorter. It is a navigation convention
   for the dates offered, not an entitlement rule.
========================================================= */

export const CALENDAR_LIMITS = Object.freeze({
    minYear: 1,
    maxYear: 9999
});


/* =========================================================
   CALENDAR
========================================================= */

export function isLeapYear(year) {

    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

}

export function daysInMonth(year, month) {

    if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    }

    return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;

}

/* days since 1970-01-01 by integer "days from civil" arithmetic; exact for every year, including those beyond 9999 */
export function dayNumber({ year, month, day }) {

    const y = month <= 2 ? year - 1 : year;
    const era = Math.floor(y / 400);
    const yearOfEra = y - era * 400;
    const monthIndex = (month + 9) % 12;
    const dayOfYear = Math.floor((153 * monthIndex + 2) / 5) + day - 1;
    const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;

    return era * 146097 + dayOfEra - 719468;

}

/* the inverse of dayNumber */
export function dateFromDayNumber(number) {

    const z = number + 719468;
    const era = Math.floor(z / 146097);
    const dayOfEra = z - era * 146097;
    const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
    const y = yearOfEra + era * 400;
    const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
    const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1;
    const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9;

    return { year: month <= 2 ? y + 1 : y, month, day };

}

export function addDays(date, n) {

    return dateFromDayNumber(dayNumber(date) + n);

}

/* -1, 0 or 1 */
export function compareDates(a, b) {

    const difference = dayNumber(a) - dayNumber(b);

    return difference < 0 ? -1 : difference > 0 ? 1 : 0;

}

const pad = (value, width) => String(value).padStart(width, "0");

export function formatIso({ year, month, day }) {

    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;

}


/* =========================================================
   READING A DATE
   Returns { state: "blank" } | { state: "invalid", code }
   | { state: "valid", date }. Only the exact form YYYY-MM-DD
   is accepted, and an impossible date is refused, never
   normalized.
========================================================= */

export function parseDate(text) {

    if (text === undefined || text === null || text === "") {
        return { state: "blank" };
    }

    if (typeof text !== "string") {
        return { state: "invalid", code: "DATE_FORMAT" };
    }

    if (text.trim() === "") {
        return { state: "blank" };
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

    if (!match) {
        return { state: "invalid", code: "DATE_FORMAT" };
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (
        year < CALENDAR_LIMITS.minYear ||
        year > CALENDAR_LIMITS.maxYear ||
        month < 1 || month > 12 ||
        day < 1 || day > daysInMonth(year, month)
    ) {
        return { state: "invalid", code: "DATE_INVALID" };
    }

    return { state: "valid", date: { year, month, day } };

}


/* =========================================================
   THE ANNIVERSARY AND THE SERVICE (convention C-prime)
========================================================= */

/* the m-th month anniversary of the joining date: the same day, or the first day of the following month when that day does not exist */
export function anniversary(join, m) {

    const index = join.year * 12 + (join.month - 1) + m;
    const year = Math.floor(index / 12);
    const month = index - year * 12 + 1;
    const last = daysInMonth(year, month);

    if (join.day <= last) {
        return { year, month, day: join.day };
    }

    return addDays({ year, month, day: last }, 1);

}

/*
 * The service from the joining date to the exit date, both days counted. Requires valid dates with exit on or after
 * joining. Returns { totalMonths, years, months, days, exclusiveEnd, anniversary } where anniversary is the date of the
 * last completed month.
 */
export function measureService(join, exit) {

    const exclusiveEnd = addDays(exit, 1);

    let months = (exclusiveEnd.year - join.year) * 12 + (exclusiveEnd.month - join.month);

    while (compareDates(anniversary(join, months), exclusiveEnd) > 0) {
        months -= 1;
    }

    while (compareDates(anniversary(join, months + 1), exclusiveEnd) <= 0) {
        months += 1;
    }

    const last = anniversary(join, months);

    return {
        totalMonths: months,
        years: Math.floor(months / 12),
        months: months - Math.floor(months / 12) * 12,
        days: dayNumber(exclusiveEnd) - dayNumber(last),
        exclusiveEnd,
        anniversary: last
    };

}

/* the last day of the fifth year of service (both days counted): the day before the 60-month anniversary */
export function calendarFiveYearDate(join) {

    return addDays(anniversary(join, 60), -1);

}


/* =========================================================
   THE EXPLORER'S HYPOTHETICAL EXIT DATES (clamp-style)
========================================================= */

/* n calendar months after the date, the same day of the month, clamped to the end of a shorter month; not an anniversary rule */
export function addMonthsClamp(date, n) {

    const index = date.year * 12 + (date.month - 1) + n;
    const year = Math.floor(index / 12);
    const month = index - year * 12 + 1;

    return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };

}
