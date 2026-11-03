/* Age Calculator (Math). The page is drawn by common/simple-calculator.js; the arithmetic is formulas/age.js, which
   uses the calendar rules of the Date Difference tool. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveAge } from "../formulas/age.js";

const calculator = createSimpleCalculator({
    prefix: "age",
    toolId: "age",
    eyebrow: "Math Tool",
    intro: "Find an exact age in years, months and days from a date of birth, with the total days and the next birthday.",
    sectionTitle: "Enter the Date of Birth",
    sectionText: "Pick the date from the calendar or type it. The age is measured on today's date unless you choose another.",
    emptyMessage: "Choose a date of birth to see the age.",
    footnote: "Calendar arithmetic on the dates you entered. For legal or official ages, follow the rule of the body that asks.",
    fields: [
        { key: "birth", label: "Date of birth", kind: "date", hint: "Choose it from the calendar or type it as year-month-day." },
        { key: "asOn", label: "Age on this date (optional)", kind: "date", hint: "Leave empty to use today's date from your device, or choose any other date." }
    ],
    solve: solveAge,
    howTo: [
        "Choose the date of birth, with the calendar icon or by typing it.",
        "Leave the second date empty to measure the age today, or choose another date to measure it then.",
        "Read the age in years, months and days, the total days and the next birthday."
    ],
    reading: [
        "<strong>The age</strong> counts whole years first, then whole months, then the remaining days, the way the Date Difference tool does.",
        "<strong>The next birthday</strong> is the first date on or after the measured date that is a whole number of years after birth. A birthday on 29 February is shown as 28 February in a year without a 29 February."
    ],
    example: {
        values: { birth: "1990-05-15", asOn: "2026-11-02" },
        text: "Born on 15 May 1990 and measured on 2 November 2026: 36 years take the date to 15 May 2026, 5 more months to 15 October 2026, and 18 more days to 2 November 2026."
    },
    assumptions: [
        "Dates follow the Gregorian calendar and are treated as calendar dates; no time of day or time zone is used.",
        "When the second date is empty, today's date comes from your device and is shown in the result.",
        "The date of birth must not be after the date the age is measured on.",
        "Some official forms count age in a different way (for example completed years on a cut-off date). This page gives the plain calendar age.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "How is the age calculated?", a: "From the date of birth, the page counts whole years, then whole months, then days, up to the date you measure on." },
        { q: "How is this different from the Date Difference tool?", a: "It uses the same calendar rules but is set up for a birth date, and adds the next birthday." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
