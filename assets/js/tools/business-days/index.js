/* =========================================================
   ToolZen Hub
   Business Days Calculator (Time Tools)

   Add or subtract business days from a date, or count the business
   days between two dates, with the weekend days you choose and the
   holidays you type.

   The rules are in business-days-engine.js, which is pure and is
   checked against an independent reference. This file reads the
   fields, shows the result and the convention it used, and keeps
   the screen-reader announcements.

   Everything runs in the browser. Nothing is sent anywhere and
   nothing is stored: a reload starts again.
========================================================= */

import {
    LIMITS,
    WEEKDAY_NAMES,
    DEFAULT_WEEKEND,
    weekendFrom,
    parseHolidays,
    parseCount,
    addBusinessDays,
    countBusinessDays,
    dayText,
    weekdayText,
    weekendWords,
    plural,
    conventionSentence,
    resultText
} from "./business-days-engine.js";

import {
    DATE_LIMITS,
    parseDate,
    dayNumber
} from "../date-difference/date-engine.js";

import {
    getToolById
} from "../../data/tools.js";

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
    introMarkup,
    infoSection,
    faqSection,
    createAnnouncer,
    wireCopy,
    wireTodayButtons,
    todayButton
} from "../time-ui/time-ui.js";


/* The related-tools pilot for Time Tools: curated tools from this section only, no articles. */
export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE = getToolById("business-days").title;

const DATE_CALCULATOR = getToolById("date-calculator");
const DATE_DIFFERENCE = getToolById("date-difference");

const IDS = {
    start: "bd-start",
    end: "bd-end",
    count: "bd-count",
    holidays: "bd-holidays"
};

const ERROR_ID = "bd-error";

const EMPTY = {
    add: "Choose a start date and enter the number of business days to see the result.",
    count: "Choose a start date and an end date to count the business days between them."
};


/* =========================================================
   MARKUP
========================================================= */

function dateField({ id, label, hint, today = true }) {

    return fieldShell({
        id,
        label,
        hint,
        control: `<input
                                    id="${escapeHTML(id)}"
                                    class="calculator-form__input tt-date-input"
                                    type="date"
                                    min="0001-01-01"
                                    max="9999-12-31"
                                    aria-describedby="${escapeHTML(id)}-hint"
                                >${today ? `
                                ${todayButton(id)}` : ""}`
    });

}

function weekendBoxes() {

    return WEEKDAY_NAMES.map(
        (name, index) => `
                                <label class="tt-check">
                                    <input
                                        type="checkbox"
                                        name="bd-weekend"
                                        value="${index}"
                                        ${DEFAULT_WEEKEND[index] ? "checked" : ""}
                                    >
                                    <span>${name}</span>
                                </label>`
    ).join("");

}

export function markup() {

    return `
        <div class="calculator-page">
${introMarkup({
        title: TITLE,
        lead: "Add or subtract working days from a date, or count the working days between two dates. You choose the weekend and type the holidays."
    })}

            <!-- THE TOOL -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    What Do You Want to Find?
                </div>

                <form
                    id="bd-form"
                    class="calculator-form bd-form"
                    novalidate
                >

                    <fieldset class="tt-choice bd-modes">

                        <legend class="calculator-form__label">
                            Calculation
                        </legend>

                        <label class="tt-check">
                            <input type="radio" name="bd-mode" value="add" checked>
                            <span>Add or subtract business days</span>
                        </label>

                        <label class="tt-check">
                            <input type="radio" name="bd-mode" value="count">
                            <span>Count business days between two dates</span>
                        </label>

                    </fieldset>

                    <div class="calculator-form__grid bd-core">

                        ${dateField({
                            id: IDS.start,
                            label: "Start date",
                            hint: "The start date itself is never counted as one of the days added."
                        })}

                        <div id="bd-add-fields" class="bd-add-fields">

                            ${fieldShell({
                                id: IDS.count,
                                label: "Number of business days",
                                hint: `A whole number from 0 to ${LIMITS.maxBusinessDays}.`,
                                control: `<input
                                    id="${IDS.count}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    placeholder="10"
                                    maxlength="5"
                                    aria-describedby="${IDS.count}-hint"
                                >`
                            })}

                            <fieldset class="tt-choice bd-direction">

                                <legend class="calculator-form__label">
                                    Direction
                                </legend>

                                <label class="tt-check">
                                    <input type="radio" name="bd-direction" value="1" checked>
                                    <span>After the start date</span>
                                </label>

                                <label class="tt-check">
                                    <input type="radio" name="bd-direction" value="-1">
                                    <span>Before the start date</span>
                                </label>

                            </fieldset>

                        </div>

                        <div id="bd-count-fields" class="bd-count-fields" hidden>

                            ${dateField({
                                id: IDS.end,
                                label: "End date",
                                hint: "The end date is counted. It can be before the start date."
                            })}

                            <label class="tt-check bd-include">
                                <input type="checkbox" id="bd-include">
                                <span>Also count the earlier date, when it is a business day</span>
                            </label>

                        </div>

                    </div>

                    <fieldset class="tt-choice bd-weekend">

                        <legend class="calculator-form__label">
                            Weekend days (not business days)
                        </legend>

                        <div class="tt-checks">${weekendBoxes()}
                        </div>

                    </fieldset>

                    ${fieldShell({
                        id: IDS.holidays,
                        label: "Holidays to skip (optional)",
                        hint: `One date per line as year-month-day, for example 2026-12-25. Up to ${LIMITS.maxHolidays}. Nothing is filled in for you.`,
                        control: `<textarea
                                    id="${IDS.holidays}"
                                    class="calculator-form__input bd-holidays"
                                    rows="4"
                                    spellcheck="false"
                                    autocomplete="off"
                                    aria-describedby="${IDS.holidays}-hint"
                                ></textarea>`
                    })}

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="bd-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="bd-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY.add)}
            </section>

            <p
                id="bd-live"
                class="tt-sr-only"
                role="status"
                aria-live="polite"
            ></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        Choose a start date. Then either enter how many business
                        days to add or subtract, or switch to counting and choose
                        an end date.
                    </li>
                    <li>
                        Tick the days that are your weekend. Saturday and Sunday
                        are ticked to begin with; tick Friday and Saturday instead
                        if that is your week.
                    </li>
                    <li>
                        Type any holidays you want skipped, one date per line. The
                        result updates as you go, and shows which dates it skipped.
                    </li>
                </ol>`)}
${infoSection("How Business Days Are Counted", `<p>
                    A <strong>business day</strong> is a day that is not one of
                    your weekend days and is not a holiday you listed.
                </p>
                <p>
                    <strong>Adding or subtracting:</strong> the start date is
                    never counted. The result is the nth business day after (or
                    before) it. One business day after Friday is Monday, and so is
                    one business day after Saturday. Zero business days is the
                    start date itself.
                </p>
                <p>
                    <strong>Counting between two dates:</strong> the earlier date
                    is not counted and the later date is, so Monday to Tuesday is
                    1 business day. Tick the box to count the earlier date too
                    when it is a business day. If the end date is before the start
                    date, the two are swapped and the result says so.
                </p>`)}
${infoSection("Holidays", `<p>
                    This calculator does not know any public holidays. They depend
                    on the country, the region, the year and often the employer,
                    and a list that is out of date would give a wrong answer
                    without warning. Type the dates you want skipped. A holiday
                    that falls on a weekend day changes nothing, and the result
                    tells you when that happens.
                </p>`)}
${infoSection("Example", `<p>${escapeHTML(exampleParagraph())}</p>`)}
${infoSection("Common Uses", `<ul>
                    <li>A delivery, refund or notice period quoted in business days.</li>
                    <li>A deadline that is a number of working days from today.</li>
                    <li>How many working days there are in a project or a month.</li>
                </ul>
                <p>
                    To count every calendar day, use the
                    <a href="${DATE_DIFFERENCE.href}">${escapeHTML(DATE_DIFFERENCE.title)}</a>, or add
                    days, weeks, months or years with the
                    <a href="${DATE_CALCULATOR.href}">${escapeHTML(DATE_CALCULATOR.title)}</a>.
                    This tool does not work out public holidays, time zones, the time
                    of day or legal deadlines, which can have their own rules.
                </p>`)}
${faqSection(TITLE + " FAQ", [
        ["Is the start date counted?", "No. When you add business days, the start date is never counted: the result is the nth business day after it. When you count between two dates, the earlier date is not counted unless you tick the box, and the later date is."],
        ["What if the start date is a weekend or a holiday?", "It makes no difference to the rule. One business day after a Saturday is the following Monday, and zero business days is the date itself."],
        ["Can I choose a different weekend?", "Yes. Tick any of the seven days. At least one day must be left unticked, or there would be no business days."],
        ["Does it know public holidays?", "No. Type the dates you want skipped. A holiday that falls on a weekend day changes nothing."],
        ["Is anything sent or saved?", "No. Everything is calculated in your browser and nothing is stored, so a reload starts again."]
    ])}

        </div>
    `;
}


/* The worked example, from fixed dates, by the same engine, so the page can never disagree with it. */
function exampleParagraph() {

    const start = dayNumber({ year: 2026, month: 11, day: 13 });

    const holiday = dayNumber({ year: 2026, month: 11, day: 17 });

    const plain = addBusinessDays({ start, count: 5, direction: 1, weekend: DEFAULT_WEEKEND, holidays: new Set() });

    const skipping = addBusinessDays({ start, count: 5, direction: 1, weekend: DEFAULT_WEEKEND, holidays: new Set([holiday]) });

    return `Five business days after Friday, ${dayText(start)}, is ${weekdayText(plain.result)}, ${dayText(plain.result)} (${plural(plain.calendarDays, "calendar day")} later, skipping ${plural(plain.weekendDays, "weekend day")}). If ${dayText(holiday)} is a holiday, it is ${weekdayText(skipping.result)}, ${dayText(skipping.result)}.`;

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
========================================================= */

export function init() {

    const form = document.querySelector("#bd-form");
    const results = document.querySelector("#bd-results");
    const live = document.querySelector("#bd-live");

    if (!form || !results) {
        return;
    }

    const speaker = createAnnouncer(live);

    const inputs = {
        start: document.getElementById(IDS.start),
        end: document.getElementById(IDS.end),
        count: document.getElementById(IDS.count),
        holidays: document.getElementById(IDS.holidays),
        include: document.getElementById("bd-include")
    };

    const addFields = document.getElementById("bd-add-fields");
    const countFields = document.getElementById("bd-count-fields");

    const modeOf = () => form.querySelector("input[name='bd-mode']:checked").value;
    const directionOf = () => Number(form.querySelector("input[name='bd-direction']:checked").value);

    const weekendIndexes = () =>
        [...form.querySelectorAll("input[name='bd-weekend']:checked")].map(box => Number(box.value));

    let lastText = "";

    function paintMode() {

        const count = modeOf() === "count";

        addFields.hidden = count;
        countFields.hidden = !count;

    }

    function show(html) {

        results.innerHTML = html;

    }

    function fail(message, fields = []) {

        setFieldsInvalid(fields.filter(Boolean), ERROR_ID);

        show(resultError(message, { id: ERROR_ID }));

        lastText = "";

        speaker.announce(message);

    }

    function dateOf(input, label) {

        const parsed = parseDate(input.value);

        if (parsed.state === "invalid") {
            return { error: `${label}: ${parsed.message}`, input };
        }

        return parsed.state === "valid" ? { number: dayNumber(parsed.date) } : null;

    }

    function update({ speak = true } = {}) {

        clearFieldsInvalid(Object.values(inputs), ERROR_ID);

        paintMode();

        const mode = modeOf();

        const weekend = weekendFrom(weekendIndexes());

        if (weekend === null) {
            return fail("Leave at least one day of the week unticked. With every day a weekend there are no business days.");
        }

        const holidays = parseHolidays(inputs.holidays.value);

        if (!holidays.ok) {

            const first = holidays.errors[0];

            return fail(
                holidays.errors.length === 1 && first.line === 0
                    ? first.message
                    : `Holidays: ${holidays.errors.map(e => e.line === 0 ? e.message : `line ${e.line} (“${e.text}”) is not a date`).join("; ")}. Enter each holiday as year-month-day, for example 2026-12-25.`,
                [inputs.holidays]
            );

        }

        const start = dateOf(inputs.start, "Start date");

        if (start?.error) {
            return fail(start.error, [start.input]);
        }

        let result;

        if (mode === "add") {

            const count = parseCount(inputs.count.value);

            if (count.state === "invalid") {
                return fail(`Number of business days: ${count.message}`, [inputs.count]);
            }

            if (!start || count.state === "blank") {

                show(resultEmpty(EMPTY.add));

                lastText = "";

                if (speak) {
                    speaker.clear();
                }

                return;

            }

            result = addBusinessDays({
                start: start.number,
                count: count.value,
                direction: directionOf(),
                weekend,
                holidays: holidays.days
            });

            if (result.status === "out-of-range") {
                return fail(`That goes beyond the supported years (${DATE_LIMITS.minYear} to ${DATE_LIMITS.maxYear}).`, [inputs.start, inputs.count]);
            }

        } else {

            const end = dateOf(inputs.end, "End date");

            if (end?.error) {
                return fail(end.error, [end.input]);
            }

            if (!start || !end) {

                show(resultEmpty(EMPTY.count));

                lastText = "";

                if (speak) {
                    speaker.clear();
                }

                return;

            }

            result = countBusinessDays({
                start: start.number,
                end: end.number,
                includeStart: inputs.include.checked,
                weekend,
                holidays: holidays.days
            });

        }

        const context = { mode, weekend, holidays, direction: directionOf(), startNumber: start.number };

        show(renderResult(result, context));

        wireResultActions(result, context);

        lastText = resultText(result, { mode });

        if (speak) {
            speaker.announce(lastText.split("\n")[0]);
        }

    }

    function wireResultActions(result, context) {

        const button = results.querySelector("#bd-copy");
        const status = results.querySelector("#bd-copy-status");

        if (button && status) {

            wireCopy({
                button,
                status,
                getText: () => resultText(result, { mode: context.mode }),
                announce: (text, delay) => speaker.announce(text, delay)
            });

        }

    }

    form.addEventListener("input", () => update());
    form.addEventListener("change", () => update());

    form.addEventListener("submit", event => {
        event.preventDefault();
    });

    wireTodayButtons(form);

    document.getElementById("bd-reset")?.addEventListener(
        "click",
        () => {

            form.reset();

            for (const box of form.querySelectorAll("input[name='bd-weekend']")) {
                box.checked = DEFAULT_WEEKEND[Number(box.value)];
            }

            update({ speak: false });

            speaker.clear();

            inputs.start.focus();

        }
    );

    update({ speak: false });

    form.dataset.ready = "true";

}


/* =========================================================
   THE RESULT
========================================================= */

function listSkipped(result) {

    if (result.skipped.length === 0) {
        return "";
    }

    const total = result.weekendDays + result.holidayDays;

    const items = result.skipped
        .map(item => `<li>${escapeHTML(weekdayText(item.day))}, ${escapeHTML(dayText(item.day))} <span class="tt-tag">${item.kind === "weekend" ? "weekend" : "holiday"}</span></li>`)
        .join("");

    return `
                <details class="tt-details">
                    <summary>Show the ${plural(total, "day")} left out${total > result.skipped.length ? ` (first ${result.skipped.length})` : ""}</summary>
                    <ul class="tt-list">${items}</ul>
                </details>`;

}

function holidayNotes(context) {

    const notes = [];

    let onWeekend = 0;

    for (const day of context.holidays.days) {
        if (context.weekend[((day + 3) % 7 + 7) % 7]) {
            onWeekend += 1;
        }
    }

    if (onWeekend > 0) {
        notes.push(`${plural(onWeekend, "holiday")} fall${onWeekend === 1 ? "s" : ""} on a weekend day, so ${onWeekend === 1 ? "it changes" : "they change"} nothing.`);
    }

    if (context.holidays.duplicates > 0) {
        notes.push(`${plural(context.holidays.duplicates, "repeated holiday")} counted once.`);
    }

    return notes;

}

function renderResult(result, context) {

    const notes = holidayNotes(context);

    let headline;
    let metrics;
    let lines = [];

    if (context.mode === "add") {

        headline = `${weekdayText(result.result)}, ${dayText(result.result)}`;

        metrics = [
            resultMetric({ label: result.direction < 0 ? "Business days before" : "Business days after", value: plural(result.count, "business day"), primary: false }),
            resultMetric({ label: "Calendar days apart", value: String(result.calendarDays) }),
            resultMetric({ label: "Left out on the way", value: `${plural(result.weekendDays, "weekend day")}, ${plural(result.holidayDays, "holiday")}` })
        ];

        if (result.count === 0) {
            lines.push(`Zero business days is the start date itself, ${weekdayText(result.start)}${result.startKind === "business" ? "" : `, which is ${result.startKind === "weekend" ? "a weekend day" : "a listed holiday"}`}.`);
        } else if (result.startKind !== "business") {
            lines.push(`The start date, ${weekdayText(result.start)}, is ${result.startKind === "weekend" ? "a weekend day" : "a listed holiday"}; it is not counted.`);
        }

    } else {

        headline = plural(result.businessDays, "business day");

        metrics = [
            resultMetric({ label: "Between", value: `${dayText(result.first)} and ${dayText(result.last)}` }),
            resultMetric({ label: "Calendar days counted", value: String(result.calendarDays) }),
            resultMetric({ label: "Left out", value: `${plural(result.weekendDays, "weekend day")}, ${plural(result.holidayDays, "holiday")}` })
        ];

        if (result.reversed) {
            lines.push("The end date is before the start date, so the two were swapped.");
        }

        if (result.same) {
            lines.push("Both dates are the same day.");
        }

    }

    const convention = conventionSentence(context.mode, { includeStart: result.includeStart, direction: result.direction });

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        ${context.mode === "add" ? "The date you reach" : "Business days between the dates"}
                    </h2>

                </div>

                <p class="tt-answer">${escapeHTML(headline)}</p>

                <div class="calculator-results__grid bd-grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    <p>Weekend: ${escapeHTML(weekendWords(context.weekend))}.</p>
                    ${[...lines, ...notes].map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>
${listSkipped(result)}
                <p class="tt-note" role="note"><strong>Convention.</strong> ${escapeHTML(convention)}</p>

                <div class="tt-actions">
                    <button type="button" id="bd-copy" class="calculator-form__button calculator-form__button--secondary">Copy result</button>
                    <span id="bd-copy-status" class="tt-status" role="status" hidden></span>
                </div>

            </div>
        `;

}
