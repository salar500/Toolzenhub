/* =========================================================
   ToolZen Hub
   Date Difference Calculator (Time Tools)

   For anyone who has two dates and wants to know how far apart
   they are: a deadline, a trip, a subscription, a contract or
   employment period, an event.

   THESE ARE CALENDAR DATES. No time of day and no time zone is
   involved, so daylight saving and the visitor's location cannot
   change a result. Business days and holidays are not calculated.

   The arithmetic is in date-engine.js (pure, tested against an
   independent reference). This file reads the two fields, asks
   that module for the difference, and shows it. It owns the
   wording and the layout; the shared UI (ui/) only wires labels,
   hints and errors.

   Everything is calculated in the browser. Nothing is sent
   anywhere and nothing is stored. The result updates as soon as
   both dates are valid, so there is no Calculate button.
========================================================= */

import {
    calculateDateDifference,
    unitsText,
    daysText,
    weeksText,
    dateText
} from "./date-engine.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    ROUTES
} from "../../routes.js";

import {
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    resultMetric,
    resultEmpty,
    resultError
} from "../../ui/result.js";

import {
    escapeHTML
} from "../../ui/escape.js";

import {
    wireTodayButtons,
    todayButton,
    todayIso
} from "../time-ui/time-ui.js";

import {
    addDays,
    parseDate,
    presetRange,
    SINGLE_DATE_PRESETS
} from "./date-engine.js";


/* There is nothing related to show yet: no other Time Tools tool, and no calculator is related to dates. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const BUSINESS_DAYS =
    getToolById("business-days");

const TITLE =
    getToolById("date-difference").title;

const IDS = {
    start: "date-start",
    end: "date-end"
};

const ERROR_ID =
    "date-results-error";

const EMPTY_MESSAGE =
    "Choose a start date and an end date.";


/* =========================================================
   RESULTS (HTML)
========================================================= */

function note(result) {

    if (result.same) {
        return result.inclusive ? "Both dates are the same day, which counts as 1 day." : "Both dates are the same.";
    }

    if (result.reversed) {
        return "The end date comes before the start date, so this is the distance between them.";
    }

    return "";

}

function summaryLines(result) {

    const from = dateText(result.earlier);
    const to = dateText(result.later);

    const calendar =
        unitsText(result.years, result.months, result.days);

    const both = `Counting both ${from} and ${to}: ${daysText(result.inclusiveDays)}.`;
    const apart = `Not counting the start day (days between the dates): ${daysText(result.elapsedDays)}.`;

    if (result.inclusive) {
        return [
            `From ${from} to ${to}, counting both dates, is ${daysText(result.totalDays)}${result.same ? "" : `, which the calendar counts as ${calendar}`}.`,
            apart
        ];
    }

    if (result.same) {
        return [`${from} is the same day as ${to}: 0 days apart.`, both];
    }

    return [
        `From ${from} to ${to} is ${daysText(result.totalDays)}. Counted by the calendar, that is ${calendar}.`,
        both
    ];

}

function renderResults(result) {

    const metrics = [
        resultMetric({ label: result.inclusive ? "Total days (both dates counted)" : "Total days (days between)", value: daysText(result.totalDays), primary: true }),
        resultMetric({ label: "Years, months and days", value: unitsText(result.years, result.months, result.days) }),
        resultMetric({ label: "Weeks and days", value: weeksText(result.weeks, result.weekDays) })
    ];

    const message = note(result);

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        The time between the two dates
                    </h2>

                </div>

                ${message ? `<p class="date-note" role="note">${escapeHTML(message)}</p>` : ""}

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="date-trust">
                    <strong>Calendar dates only.</strong>
                    The two days you choose are treated as dates, not moments:
                    no time of day or time zone is involved, and leap years and
                    different month lengths are counted. ${result.inclusive
                        ? "Both the start date and the end date are counted, so the result is one day more than the days between them."
                        : "Total days is the number of days between the dates, so the start day is not counted; tick the box to count both the start and the end date."}
                    Business days and public holidays are not calculated.
                </div>

            </div>
        `;

}

function liveSummary(result) {

    if (result.same) {
        return result.inclusive ? "Both dates are the same day: 1 day counting both." : "Both dates are the same: 0 days.";
    }

    return `${daysText(result.totalDays)}${result.inclusive ? ", counting both dates" : ""}, or ${unitsText(result.years, result.months, result.days)}.${result.reversed ? " The end date comes before the start date." : ""}`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine, from fixed dates, so the page
   can never disagree with it.
========================================================= */

function exampleParagraph() {

    const a = calculateDateDifference("2026-01-01", "2026-02-10");
    const b = calculateDateDifference("2026-01-31", "2026-03-01");

    return `From ${dateText(a.earlier)} to ${dateText(a.later)} is ${daysText(a.totalDays)}, which the calendar counts as ${unitsText(a.years, a.months, a.days)} (${weeksText(a.weeks, a.weekDays)}). A month-end start shows how the rule works: from ${dateText(b.earlier)} to ${dateText(b.later)} is ${daysText(b.totalDays)}, which is ${unitsText(b.years, b.months, b.days)}, because one month after 31 January is the last day of February.`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function dateField({ id, label, hint }) {

    return fieldShell({
        id,
        label,
        hint,
        control: `<input
                                    id="${escapeHTML(id)}"
                                    class="calculator-form__input date-input"
                                    type="date"
                                    min="0001-01-01"
                                    max="9999-12-31"
                                    aria-describedby="${escapeHTML(id)}-hint"
                                >
                                ${todayButton(id)}`
    });

}

/* the yyyy-mm-dd value of a date input */
const isoOf = ({ year, month, day }) =>
    `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/* the quick-fill buttons: a label and the id presetRange() (date-engine.js) or SINGLE_DATE_PRESETS knows */
const SINGLE_BUTTONS = [["Today", "today"], ["Yesterday", "yesterday"], ["Tomorrow", "tomorrow"]];

const PREVIOUS_BUTTONS = [
    ["Previous 5 days", "previous-days-5"],
    ["Previous 7 days", "previous-days-7"],
    ["Previous 14 days", "previous-days-14"],
    ["Previous 30 days", "previous-days-30"],
    ["Previous week", "previous-week"],
    ["Previous month", "previous-month"],
    ["Previous 3 months", "previous-months-3"],
    ["Previous 6 months", "previous-months-6"],
    ["Previous year", "previous-year"]
];

const NEXT_BUTTONS = [
    ["Next 5 days", "next-days-5"],
    ["Next 7 days", "next-days-7"],
    ["Next 14 days", "next-days-14"],
    ["Next 30 days", "next-days-30"],
    ["Next week", "next-week"],
    ["Next month", "next-month"],
    ["Next 3 months", "next-months-3"],
    ["Next 6 months", "next-months-6"],
    ["Next year", "next-year"]
];

const presetButtons = (list, kind) =>
    list.map(([label, id]) => `<button type="button" class="tt-inline-button" data-${kind}="${id}">${label}</button>`).join("\n                            ");

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Time Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Find how many days are between two dates, and how that
                        reads in years, months and days and in weeks.
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            Calculated in your browser • Nothing is stored
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE TOOL -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Choose Two Dates
                </div>

                <p class="calculator-section__description">
                    Pick a start date and an end date. The result appears as
                    soon as both are chosen.
                </p>

                <form
                    id="date-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid date-core">

                        ${dateField({
                            id: IDS.start,
                            label: "Start date",
                            hint: "The first date. Choose it from the calendar or type it."
                        })}

                        ${dateField({
                            id: IDS.end,
                            label: "End date",
                            hint: "The second date. It can be before the start date. Choose it from the calendar or type it."
                        })}

                    </div>

                    <label class="tt-check date-inclusive">
                        <input type="checkbox" id="date-inclusive" aria-describedby="date-inclusive-help">
                        <span>Count both the start and the end date</span>
                    </label>

                    <p class="calculator-form__help" id="date-inclusive-help">
                        Off (the default): the number of days between the dates, so 1 June to 6 June is 5 days. On: every calendar date from the start to the end is counted, so 1 June to 6 June is 6 days. Both answers are always shown in the result.
                    </p>

                    <div class="date-presets" role="group" aria-labelledby="date-presets-label">

                        <p class="calculator-form__help" id="date-presets-label">
                            Quick fill from today, as your device reads it. Range buttons set both dates. "Previous 7 days" ends today and starts 6 days earlier, so it covers 7 calendar dates and shows as 6 days between them, or 7 with the box above ticked; "Next 7 days" starts tomorrow and works the same way. The "Today to 6 days later" buttons are 6 days between the dates, or 7 counting both. Weeks run Monday to Sunday, and months and years are complete calendar months and years.
                        </p>

                        <fieldset class="date-presets__group">
                            <legend>Quick dates (one date)</legend>
                            <div class="date-presets__target" role="radiogroup" aria-label="Fill which date">
                                <label><input type="radio" name="date-quick-target" value="start" checked> Start date</label>
                                <label><input type="radio" name="date-quick-target" value="end"> End date</label>
                            </div>
                            ${presetButtons(SINGLE_BUTTONS, "single")}
                        </fieldset>

                        <fieldset class="date-presets__group">
                            <legend>Previous periods (both dates; "days" ends today and includes it)</legend>
                            ${presetButtons(PREVIOUS_BUTTONS, "range")}
                        </fieldset>

                        <fieldset class="date-presets__group">
                            <legend>Future periods (both dates; "days" starts tomorrow)</legend>
                            ${presetButtons(NEXT_BUTTONS, "range")}
                        </fieldset>

                        <fieldset class="date-presets__group">
                            <legend>From today (both dates)</legend>
                            <button type="button" class="tt-inline-button" data-preset="6">Today to 6 days later</button>
                            <button type="button" class="tt-inline-button" data-preset="7">Today to 7 days later</button>
                            <button type="button" class="tt-inline-button" data-preset="30">Today to 30 days later</button>
                            <button type="button" class="tt-inline-button" data-preset="month">1st of this month to today</button>
                        </fieldset>

                    </div>

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="date-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="date-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="date-live"
                class="date-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>
                        Choose the start date and the end date. "Use today" fills
                        a field with today's date from your device, only when
                        you press it.
                    </li>
                    <li>
                        Read the total number of days, then the same gap as
                        years, months and days, and as weeks and days.
                    </li>
                    <li>
                        Change either date to see the result update. Reset
                        clears both.
                    </li>
                </ol>

            </section>


            <!-- HOW IT IS CALCULATED -->

            <section class="calculator-info">

                <h2>
                    How the Difference Is Calculated
                </h2>

                <p>
                    <strong>Total days</strong> is the exact number of days
                    from the earlier date to the later one. The two dates are
                    counted as calendar dates, so a time zone or a daylight
                    saving change cannot move the answer. The days between
                    1 January and 2 January are 1 day.
                </p>

                <p>
                    <strong>Days between and days counted both ways.</strong>
                    By default the start day is not counted, as when you ask how
                    many days passed: 1 June to 6 June is 5 days. If you want
                    every calendar date from the start to the end, such as the
                    days of a leave, a booking or a course, tick "Count both
                    the start and the end date": 1 June to 6 June is then 6
                    days. The same date counted both ways is 1 day, and a whole
                    month such as 1 to 31 January is 1 month. A phrase such as
                    "the previous 6 days" is not a calculation until you decide
                    whether today is one of them: the quick buttons make this
                    explicit by including today in "Previous N days".
                </p>

                <p>
                    <strong>Years, months and days</strong> follow the
                    calendar. Count whole months forward from the earlier
                    date, keeping the same day of the month. When the target
                    month is shorter, the last day of that month is used, so
                    one month after 31 January is the last day of February.
                    The most whole months that fit before the later date are
                    the months; the days left over are the days.
                </p>

                <p>
                    <strong>Weeks and days</strong> divide the total days by
                    7.
                </p>

            </section>


            <!-- TOTAL DAYS VS CALENDAR -->

            <section class="calculator-info">

                <h2>
                    Total Days and the Calendar Breakdown
                </h2>

                <p>
                    Total days is exact. The calendar breakdown depends on how
                    long the months in between are, so "1 month" can be 28, 29,
                    30 or 31 days. Two gaps with the same number of days can
                    therefore read differently in months and days.
                </p>

            </section>


            <!-- LEAP YEARS -->

            <section class="calculator-info">

                <h2>
                    Leap Years and Month Lengths
                </h2>

                <p>
                    Leap years are handled: 29 February exists only in a leap
                    year, which is a year divisible by 4, except a century year
                    unless it is divisible by 400 (so 2000 and 2024 are leap
                    years, 1900 and 2100 are not). From 29 February, one year
                    later is 28 February in a year that is not a leap year.
                </p>

            </section>


            <!-- EXAMPLE -->

            <section class="calculator-info">

                <h2>
                    Example
                </h2>

                <p>
                    ${escapeHTML(exampleParagraph())}
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>How long until a deadline, or how long since a start date.</li>
                    <li>The length of a trip, a booking period or an event.</li>
                    <li>The span of a subscription, a contract or an employment period.</li>
                    <li>Planning a project between two milestones.</li>
                </ul>

                <p>
                    This calculator counts every calendar day. It does not
                    calculate business days, public holidays or working
                    calendars, and it does not use the time of day.
                    See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Does it count both the start and the end date?
                    </summary>
                    <p>
                        No. The total is the number of days between the dates:
                        from 1 January to 2 January is 1 day. If you want to
                        count both days, add 1.
                    </p>
                </details>

                <details>
                    <summary>
                        What if the end date is before the start date?
                    </summary>
                    <p>
                        You get the distance between them, with a note that the
                        end date comes before the start date. Nothing is swapped
                        silently.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is "1 month" sometimes 28 days and sometimes 31?
                    </summary>
                    <p>
                        Months have different lengths. The calendar breakdown
                        counts whole calendar months, so a month can be 28, 29,
                        30 or 31 days. The total number of days is always exact.
                    </p>
                </details>

                <details>
                    <summary>
                        Does the time zone or daylight saving change the result?
                    </summary>
                    <p>
                        No. The dates are treated as calendar dates with no time
                        of day, so the result is the same anywhere.
                    </p>
                </details>

                <details>
                    <summary>
                        Can it count business days or skip holidays?
                    </summary>
                    <p>
                        No. It counts every calendar day. Business days and
                        holidays depend on a country and a calendar, which this
                        calculator does not use. The
                        <a href="${BUSINESS_DAYS.href}">${escapeHTML(BUSINESS_DAYS.title)}</a>
                        counts them, with the weekend you choose and the
                        holidays you type.
                    </p>
                </details>
            </section>

        </div>
    `;
}


/* =========================================================
   RENDER
========================================================= */

export function render(
    mount = document.querySelector("#app")
) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();

    init();

}


/* =========================================================
   INIT
   Binds the two fields, the live result and reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#date-form");

    const results =
        document.querySelector("#date-results");

    const live =
        document.querySelector("#date-live");

    const resetButton =
        document.querySelector("#date-reset");

    if (!form || !results) {
        return;
    }

    const inputs = {
        start: document.getElementById(IDS.start),
        end: document.getElementById(IDS.end)
    };

    const inclusiveBox =
        document.getElementById("date-inclusive");

    const allInputs =
        Object.values(inputs);

    let announceTimer = null;

    /*
     * One short sentence for screen readers, a moment after the
     * visitor stops, so it is not read out on every change.
     */
    function announce(
        text
    ) {

        clearTimeout(announceTimer);

        if (!live) {
            return;
        }

        announceTimer =
            setTimeout(
                () => {
                    live.textContent = text;
                },
                400
            );

    }

    function update(
        { speak = true } = {}
    ) {

        clearFieldsInvalid(
            allInputs,
            ERROR_ID
        );

        const result =
            calculateDateDifference(
                inputs.start.value,
                inputs.end.value,
                { inclusive: Boolean(inclusiveBox?.checked) }
            );

        if (result.status === "incomplete") {

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        if (result.status === "invalid") {

            setFieldsInvalid(
                result.errors
                    .map(error => inputs[error.field])
                    .filter(Boolean),
                ERROR_ID
            );

            const message =
                result.errors
                    .map(
                        error =>
                            `${error.field === "start" ? "Start date" : "End date"}: ${error.message}`
                    )
                    .join(" ");

            results.innerHTML =
                resultError(
                    message,
                    { id: ERROR_ID }
                );

            if (speak) {
                announce(message);
            }

            return;

        }

        results.innerHTML =
            renderResults(result);

        if (speak) {
            announce(liveSummary(result));
        }

    }

    form.addEventListener(
        "input",
        () => update()
    );

    form.addEventListener(
        "change",
        () => update()
    );

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
        }
    );

    /* a date is filled with today only when the button is pressed */
    wireTodayButtons(form);

    /* a preset fills from today's date on this device, only when pressed: a range button sets both fields, a quick date sets the one chosen */
    const fill = (start, end) => {

        if (start) inputs.start.value = isoOf(start);
        if (end) inputs.end.value = isoOf(end);

        inputs.start.dispatchEvent(new Event("input", { bubbles: true }));
        inputs.end.dispatchEvent(new Event("change", { bubbles: true }));

    };

    for (const button of form.querySelectorAll("[data-preset]")) {

        button.addEventListener("click", () => {

            const today = parseDate(todayIso(new Date())).date;
            const preset = button.dataset.preset;

            const start = preset === "month" ? { ...today, day: 1 } : today;
            const end = preset === "month" ? today : addDays(today, Number(preset));

            fill(start, end);
            button.focus();

        });

    }

    for (const button of form.querySelectorAll("[data-range]")) {

        button.addEventListener("click", () => {

            const range = presetRange(button.dataset.range, parseDate(todayIso(new Date())).date);

            if (range) fill(range.start, range.end);

            button.focus();

        });

    }

    for (const button of form.querySelectorAll("[data-single]")) {

        button.addEventListener("click", () => {

            const target = form.querySelector('input[name="date-quick-target"]:checked')?.value === "end" ? "end" : "start";
            const date = addDays(parseDate(todayIso(new Date())).date, SINGLE_DATE_PRESETS[button.dataset.single]);

            fill(target === "start" ? date : null, target === "end" ? date : null);
            inputs[target].focus();

        });

    }

    resetButton?.addEventListener(
        "click",
        () => {

            for (const input of allInputs) {
                input.value = "";
            }

            if (inclusiveBox) {
                inclusiveBox.checked = false;
            }

            update({ speak: false });

            if (live) {
                clearTimeout(announceTimer);
                live.textContent = "";
            }

            inputs.start.focus();

        }
    );

    /* the first state, without announcing it */
    update({ speak: false });

}
