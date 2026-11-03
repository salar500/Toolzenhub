/* Age: the exact age from a date of birth to a chosen date (today when left empty), as years, months and days,
   with total days, the next birthday and the days until it. The calendar rules are those of the Date Difference
   tool (date-engine.js): a month after the 31st is the last day of the next month, so a person born on 29 February
   has their birthday on 28 February in a year that has no 29 February. */

import {
    parseDate,
    calculateDateDifference,
    addMonths,
    dayNumber,
    dateText,
    unitsText,
    daysText,
    weeksText
} from "../../tools/date-difference/date-engine.js";

const isoOf = ({ year, month, day }) =>
    `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export function solveAge(values, context = {}) {

    const birth = parseDate(values.birth);

    if (birth.state === "blank") {
        return { state: "incomplete" };
    }

    if (birth.state === "invalid") {
        return { state: "invalid", errors: { birth: birth.message } };
    }

    const asOnText = String(values.asOn ?? "").trim() === "" ? context.today : values.asOn;
    const asOn = parseDate(asOnText);

    if (asOn.state !== "valid") {
        return { state: "invalid", errors: { asOn: asOn.message ?? "Enter the date to measure the age on." } };
    }

    if (dayNumber(birth.date) > dayNumber(asOn.date)) {
        return { state: "invalid", errors: { birth: "The date of birth is after the date the age is measured on. Choose an earlier birth date or a later date." } };
    }

    const d = calculateDateDifference(isoOf(birth.date), isoOf(asOn.date));

    /* next birthday: the first date on or after the as-on date that is a whole number of years after birth */
    let years = asOn.date.year - birth.date.year;
    let next = addMonths(birth.date, years * 12);

    if (dayNumber(next) < dayNumber(asOn.date)) {
        years += 1;
        next = addMonths(birth.date, years * 12);
    }

    const untilNext = dayNumber(next) - dayNumber(asOn.date);
    const metrics = [
        { label: "Age", value: unitsText(d.years, d.months, d.days), primary: true },
        { label: "In total", value: `${daysText(d.totalDays)} (${weeksText(d.weeks, d.weekDays)})` },
        { label: "In months", value: `${(d.years * 12 + d.months).toLocaleString("en-IN")} months and ${d.days} ${d.days === 1 ? "day" : "days"}` },
        {
            label: years > d.years || untilNext > 0 ? "Next birthday" : "Birthday",
            value: untilNext === 0
                ? (years === 0 ? "None yet: the age is measured on the day of birth" : `Today, turning ${years}`)
                : `${dateText(next)}, turning ${years}, in ${daysText(untilNext)}`
        }
    ];

    return {
        state: "ok",
        metrics,
        notes: [`Measured on ${dateText(asOn.date)}${String(values.asOn ?? "").trim() === "" ? " (today's date from your device)" : ""}.`],
        result: { years: d.years, months: d.months, days: d.days, totalDays: d.totalDays, next, untilNext },
        summary: `Born ${dateText(birth.date)}; measured on ${dateText(asOn.date)}\n` + metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
