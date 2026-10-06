/* =========================================================
   ToolZen Hub
   Date Calculator (Time Tools)

   For anyone who has a date and a length of time and wants the
   date that results: a deadline, a notice period, a due date, a
   warranty or a booking.

   THESE ARE CALENDAR DATES. No time of day and no time zone is
   involved, so daylight saving and the visitor's location cannot
   change a result. Weekends, business days and holidays are not
   part of this calculator.

   The arithmetic is in date-arithmetic.js (pure, tested against
   an independent reference). This file reads the fields, asks that
   module for the result, and shows it. It owns the wording and the
   layout; the shared UI (ui/) only wires labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent
   anywhere and nothing is stored. The result updates as soon as
   the inputs are valid, so there is no Calculate button.
========================================================= */

import {
    calculateDate,
    dateText,
    durationText,
    clampText,
    displacementText,
    parseAmount
} from "./date-arithmetic.js";

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


/* There is no related calculator, and no article about dates yet. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("date-calculator").title;

const DIFFERENCE =
    getToolById("date-difference");

const IDS = {
    start: "dcalc-start",
    years: "dcalc-years",
    months: "dcalc-months",
    weeks: "dcalc-weeks",
    days: "dcalc-days"
};

const MODE_NAME = "dcalc-operation";

const OPERATIONS = {
    add: "Add",
    subtract: "Subtract"
};

const DEFAULT_OPERATION = "add";

const ERROR_ID =
    "dcalc-results-error";

const EMPTY_MESSAGE =
    "Choose a start date and enter how much to add or subtract.";

const FIELD_LABELS = {
    start: "Start date",
    years: "Years",
    months: "Months",
    weeks: "Weeks",
    days: "Days"
};


/* =========================================================
   RESULTS (HTML)
========================================================= */

function durationOf(input) {

    return {
        years: parseAmount(input.years).value ?? 0,
        months: parseAmount(input.months).value ?? 0,
        weeks: parseAmount(input.weeks).value ?? 0,
        days: parseAmount(input.days).value ?? 0
    };

}

function renderResults(result, input) {

    const verb =
        result.operation === "add" ? "added" : "subtracted";

    const duration =
        durationText(durationOf(input));

    const metrics = [
        resultMetric({
            label: "Resulting date",
            value: dateText(result.result),
            primary: true
        }),
        resultMetric({
            label: "Weekday",
            value: result.resultWeekday
        }),
        resultMetric({
            label: "Distance from the start date",
            value: displacementText(result.displacement)
        })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        The date you get
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    <p>${escapeHTML(`${duration} ${verb === "added" ? "added to" : "subtracted from"} ${dateText(result.start)} (${result.startWeekday}) is ${dateText(result.result)} (${result.resultWeekday}).`)}</p>
                </div>

                ${result.clamp ? `<p class="dcalc-note" role="note">${escapeHTML(clampText(result.clamp))}</p>` : ""}

                <div class="dcalc-trust">
                    <strong>Calendar dates only.</strong>
                    Years and months are applied first, keeping the day of the
                    month where the month is long enough, then weeks and days.
                    No time of day or time zone is involved. Weekends and
                    holidays are not skipped.
                </div>

            </div>
        `;

}

function liveSummary(result) {

    return `${dateText(result.result)}, ${result.resultWeekday}.${result.clamp ? " The date was adjusted to the last day of the month." : ""}`;

}


/* =========================================================
   WORKED EXAMPLES
   Worked out by the same engine, from fixed dates, so the page
   can never disagree with it.
========================================================= */

function exampleParagraph() {

    const base = {
        years: "0",
        months: "0",
        weeks: "0",
        days: "0"
    };

    const a = calculateDate({ ...base, start: "2026-03-10", operation: "add", weeks: "2", days: "3" });
    const b = calculateDate({ ...base, start: "2026-01-31", operation: "add", months: "1" });
    const c = calculateDate({ ...base, start: "2026-03-31", operation: "subtract", months: "1" });

    return `Adding 2 weeks and 3 days to ${dateText(a.start)} gives ${dateText(a.result)}, a ${a.resultWeekday}. Adding 1 month to ${dateText(b.start)} gives ${dateText(b.result)}, because February is shorter than January, and subtracting 1 month from ${dateText(c.start)} gives ${dateText(c.result)} for the same reason.`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function startField() {

    return fieldShell({
        id: IDS.start,
        label: FIELD_LABELS.start,
        hint: "The date to start from.",
        control: `<input
                                    id="${IDS.start}"
                                    class="calculator-form__input dcalc-input"
                                    type="date"
                                    min="0001-01-01"
                                    max="9999-12-31"
                                    aria-describedby="${IDS.start}-hint"
                                >`
    });

}

function amountField(name, hint) {

    const id = IDS[name];

    return fieldShell({
        id,
        label: FIELD_LABELS[name],
        hint,
        control: `<input
                                    id="${id}"
                                    class="calculator-form__input dcalc-input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    placeholder="0"
                                    aria-describedby="${id}-hint"
                                >`
    });

}

function operationControl() {

    return `
                        <fieldset class="dcalc-mode">

                            <legend class="calculator-form__label">
                                Operation
                            </legend>

                            <div class="dcalc-mode__options">

                                ${Object.entries(OPERATIONS).map(
                                    ([value, label]) => `
                                <label class="dcalc-mode__option">
                                    <input
                                        type="radio"
                                        name="${MODE_NAME}"
                                        value="${value}"${value === DEFAULT_OPERATION ? " checked" : ""}
                                    >
                                    <span>${escapeHTML(label)}</span>
                                </label>`
                                ).join("")}

                            </div>

                        </fieldset>`;

}

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
                        Add or subtract days, weeks, months and years from a
                        date, and see the resulting date and its weekday.
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
                    Add or Subtract Days, Weeks, Months and Years
                </div>

                <p class="calculator-section__description">
                    Choose a start date, whether to add or subtract, and how
                    much. Leave a part blank for zero. The result appears as
                    soon as the entries are valid.
                </p>

                <form
                    id="dcalc-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid dcalc-start">

                        ${startField()}

                        ${operationControl()}

                    </div>

                    <div class="calculator-form__grid dcalc-amounts">

                        ${amountField("years", "Whole years.")}

                        ${amountField("months", "Whole months.")}

                        ${amountField("weeks", "Whole weeks.")}

                        ${amountField("days", "Whole days.")}

                    </div>

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="dcalc-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="dcalc-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="dcalc-live"
                class="dcalc-sr-only"
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
                        Choose the start date.
                    </li>
                    <li>
                        Choose Add or Subtract, then enter the years, months,
                        weeks and days. Any part can be left blank.
                    </li>
                    <li>
                        Read the resulting date and its weekday. Change any
                        entry to see it update. Reset clears everything.
                    </li>
                </ol>

            </section>


            <!-- HOW IT IS CALCULATED -->

            <section class="calculator-info">

                <h2>
                    How the Date Is Calculated
                </h2>

                <p>
                    The calculator works in the same order every time. Years
                    and months come first, together, as whole calendar months
                    (one year is twelve months). Weeks and days come after
                    that, as plain calendar days (one week is seven days).
                </p>

                <p>
                    The dates are calendar dates, so a time zone or a daylight
                    saving change cannot move the answer. Supported dates run
                    from the year 1 to the year 9999, and an entry that would
                    land outside them is not calculated.
                </p>

            </section>


            <!-- MONTH ENDS -->

            <section class="calculator-info">

                <h2>
                    Month Ends and Leap Years
                </h2>

                <p>
                    Months have different lengths, so "one month" is not a
                    fixed number of days. When the day of the month does not
                    exist in the target month, the last day of that month is
                    used: one month after 31 January is the last day of
                    February. When this happens the result says so.
                </p>

                <p>
                    Because of that, the calculation is not always
                    reversible. Adding a month to 31 January gives the last day
                    of February, and subtracting a month from that gives 28
                    January, not 31 January. From 29 February, one year later
                    is 28 February in a year that is not a leap year. Leap years
                    follow the Gregorian rule: divisible by 4, except a century
                    year unless it is divisible by 400 (2000 and 2024 are leap
                    years, 1900 and 2100 are not).
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
                    <li>A deadline, due date or end date that is a set time after a start.</li>
                    <li>The end of a notice period, a trial or a warranty.</li>
                    <li>A date a number of weeks or months before an event.</li>
                    <li>The date a number of days from a booking or a delivery.</li>
                </ul>

                <p>
                    This calculator counts every calendar day. It does not
                    skip weekends, calculate business days or public holidays,
                    or use the time of day. See the
                    <a href="${ROUTES.disclaimer}">disclaimer</a>.
                </p>

                <p>
                    To find how far apart two dates are instead, use the
                    <a href="${DIFFERENCE.href}">${escapeHTML(DIFFERENCE.title)}</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What order are the years, months, weeks and days applied in?
                    </summary>
                    <p>
                        Years and months first, then weeks and days. This keeps
                        the result the same whichever way you enter an amount.
                    </p>
                </details>

                <details>
                    <summary>
                        What happens when I add a month to the 31st?
                    </summary>
                    <p>
                        If the next month has no 31st, the last day of that
                        month is used, and the result tells you the date was
                        adjusted.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does subtracting not always undo adding?
                    </summary>
                    <p>
                        After a month-end adjustment the original day is lost.
                        31 January plus one month is 28 February, and 28
                        February minus one month is 28 January.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it skip weekends or holidays?
                    </summary>
                    <p>
                        No. It counts every calendar day. Weekends, business
                        days and holidays are not part of this calculator.
                    </p>
                </details>

                <details>
                    <summary>
                        Does the time zone change the result?
                    </summary>
                    <p>
                        No. The dates have no time of day, so the result is the
                        same anywhere.
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
   Binds the fields, the live result and reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#dcalc-form");

    const results =
        document.querySelector("#dcalc-results");

    const live =
        document.querySelector("#dcalc-live");

    const resetButton =
        document.querySelector("#dcalc-reset");

    if (!form || !results) {
        return;
    }

    const inputs = {};

    for (const [name, id] of Object.entries(IDS)) {
        inputs[name] = document.getElementById(id);
    }

    const allInputs =
        Object.values(inputs);

    const radios =
        [...form.querySelectorAll(`input[name="${MODE_NAME}"]`)];

    let announceTimer = null;

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

    function read() {

        return {
            start: inputs.start.value,
            operation:
                radios.find(radio => radio.checked)?.value ?? DEFAULT_OPERATION,
            years: inputs.years.value,
            months: inputs.months.value,
            weeks: inputs.weeks.value,
            days: inputs.days.value
        };

    }

    function update(
        { speak = true } = {}
    ) {

        clearFieldsInvalid(
            allInputs,
            ERROR_ID
        );

        const input = read();

        const result =
            calculateDate(input);

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
                            `${FIELD_LABELS[error.field]}: ${error.message}`
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

        if (result.status === "out-of-range") {

            results.innerHTML =
                resultError(
                    result.message,
                    { id: ERROR_ID }
                );

            if (speak) {
                announce(result.message);
            }

            return;

        }

        results.innerHTML =
            renderResults(result, input);

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

    resetButton?.addEventListener(
        "click",
        () => {

            for (const input of allInputs) {
                input.value = "";
            }

            for (const radio of radios) {
                radio.checked = radio.value === DEFAULT_OPERATION;
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
