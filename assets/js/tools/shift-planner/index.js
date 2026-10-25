/* =========================================================
   ToolZen Hub
   Shift Schedule Planner (Time Tools)

   Lay a repeating shift pattern (4 days on and 4 off, a rotating
   day and night cycle, or one you type) onto the calendar, with the
   shift times you set, and see every date as a Day, Evening, Night
   or Off shift.

   The rules are in shift-engine.js (pure, checked against an
   independent reference). This file owns the form, the month
   grids and the text version of the schedule.

   It lays out a rotation. It does not measure hours worked (use the
   Hours & Timesheet Calculator), and it knows nothing about pay,
   leave, breaks or labour law. Nothing is stored or sent anywhere.
========================================================= */

import {
    LIMITS,
    CODES,
    DEFAULT_TIMES,
    PRESETS,
    WEEKDAY_NAMES,
    parseCycle,
    cycleText,
    cycleWords,
    buildSchedule,
    hoursText,
    groupByMonth,
    copyText,
    plural
} from "./shift-engine.js";

import {
    parseDate,
    dayNumber
} from "../date-difference/date-engine.js";

import {
    dateFromDayNumber
} from "../date-calculator/date-arithmetic.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    fieldShell
} from "../../ui/field.js";

import {
    resultMetric,
    resultEmpty
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


const TITLE = getToolById("shift-planner").title;

const HOURS = getToolById("hours-calculator");
const DATE_CALCULATOR = getToolById("date-calculator");

const MONTH_NAMES = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]);

const EMPTY = "Choose a pattern and a start date to see the schedule.";

const ERROR_ID = "sp-error";


/* =========================================================
   MARKUP
========================================================= */

function timeField(code) {

    const name = CODES[code].name;

    return `
                            <div class="sp-time" data-code="${code}">
                                <span class="calculator-form__label">${name} shift</span>
                                <label class="sp-time__label">
                                    <span class="tt-sr-only">${name} shift starts</span>
                                    <input id="sp-${code}-start" class="calculator-form__input" type="time" value="${DEFAULT_TIMES[code].start}" aria-label="${name} shift starts">
                                </label>
                                <span aria-hidden="true">to</span>
                                <label class="sp-time__label">
                                    <span class="tt-sr-only">${name} shift ends</span>
                                    <input id="sp-${code}-end" class="calculator-form__input" type="time" value="${DEFAULT_TIMES[code].end}" aria-label="${name} shift ends">
                                </label>
                            </div>`;

}

export function markup() {

    return `
        <div class="calculator-page">
${introMarkup({
        title: TITLE,
        lead: "Place a repeating shift pattern on the calendar and see which dates are day, evening, night or off shifts, and how many hours a rota adds up to."
    })}

            <!-- THE TOOL -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Your Pattern
                </div>

                <form id="sp-form" class="calculator-form sp-form" novalidate>

                    <div class="calculator-form__grid sp-core">

                        <div class="calculator-form__field">
                            <label class="calculator-form__label" for="sp-preset">Start from a pattern</label>
                            <select id="sp-preset" class="calculator-form__input">
                                <option value="">Custom</option>
                                ${PRESETS.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}
                            </select>
                        </div>

                        ${fieldShell({
                            id: "sp-cycle",
                            label: "Cycle",
                            hint: "D day, E evening, N night, O off. For example 4D 4O or DDNNOOO.",
                            control: `<input
                                    id="sp-cycle"
                                    class="calculator-form__input"
                                    type="text"
                                    autocomplete="off"
                                    spellcheck="false"
                                    maxlength="120"
                                    placeholder="4D 4O"
                                    aria-describedby="sp-cycle-hint"
                                >`
                        })}

                        ${fieldShell({
                            id: "sp-start",
                            label: "Start date",
                            hint: "The first date of the schedule.",
                            control: `<input
                                    id="sp-start"
                                    class="calculator-form__input tt-date-input"
                                    type="date"
                                    min="0001-01-01"
                                    max="9999-12-31"
                                    aria-describedby="sp-start-hint"
                                >
                                ${todayButton("sp-start")}`
                        })}

                        ${fieldShell({
                            id: "sp-position",
                            label: "Day of the cycle on the start date",
                            hint: "1 is the first day of the cycle.",
                            control: `<input
                                    id="sp-position"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    maxlength="2"
                                    value="1"
                                    aria-describedby="sp-position-hint"
                                >`
                        })}

                        ${fieldShell({
                            id: "sp-weeks",
                            label: "Weeks to show",
                            unit: "weeks",
                            hint: `${LIMITS.minWeeks} to ${LIMITS.maxWeeks}`,
                            control: `<input
                                    id="sp-weeks"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    maxlength="2"
                                    value="8"
                                    aria-describedby="sp-weeks-hint"
                                >`
                        })}

                    </div>

                    <fieldset class="sp-times">

                        <legend class="calculator-form__label">Shift times (used only for shifts in your cycle)</legend>

                        ${["D", "E", "N"].map(timeField).join("")}

                    </fieldset>

                    <p id="${ERROR_ID}" class="tt-error" role="alert" hidden></p>

                    <div class="calculator-form__actions">
                        <button type="button" id="sp-reset" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section id="sp-results" class="calculator-results">
                ${resultEmpty(EMPTY)}
            </section>

            <p id="sp-live" class="tt-sr-only" role="status" aria-live="polite"></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        Pick a pattern, or type your own cycle with D (day),
                        E (evening), N (night) and O (off). <code>4D 4O</code> and
                        <code>DDDDOOOO</code> are the same cycle.
                    </li>
                    <li>
                        Choose the start date and say which day of the cycle that
                        date is. Set the shift times if yours differ.
                    </li>
                    <li>
                        Read the calendar, the hours added up, and the longest run of
                        days on and off. Copy the schedule as text or print it.
                    </li>
                </ol>`)}
${infoSection("How the Schedule Is Laid Out", `<p>
                    The cycle repeats without end from the start date. Each date
                    is the day of the cycle that falls on it. A shift belongs to
                    the date it <em>starts</em> on, so a night shift from 23:00 to
                    07:00 is shown on the first date, and is marked as ending the
                    next day.
                </p>
                <p>
                    The hours of a shift are the plain difference between its start
                    and end times, with an end at or before the start meaning the
                    next day. The planner does not adjust for a daylight-saving
                    change and does not subtract breaks. The patterns offered are
                    written out in full; the names are only labels.
                </p>`)}
${infoSection("Example", `<p>${escapeHTML(exampleParagraph())}</p>`)}
${infoSection("What It Does Not Do", `<p>
                    It lays out a rotation. It does not measure the hours people
                    actually worked, which is what the
                    <a href="${HOURS.href}">${escapeHTML(HOURS.title)}</a> is for, and it does not
                    calculate pay, leave, breaks, rest-period rules or any labour
                    law. To count the days between two dates or add days to a
                    date, use the
                    <a href="${DATE_CALCULATOR.href}">${escapeHTML(DATE_CALCULATOR.title)}</a>.
                </p>`)}
${faqSection(TITLE + " FAQ", [
        ["What does 4D 4O mean?", "Four day shifts, then four days off, repeating. Write the number before the letter: D day, E evening, N night, O off."],
        ["Which date does a night shift belong to?", "The date it starts on. A 23:00 to 07:00 shift is shown on the first date and marked as ending the next day."],
        ["What is the day of the cycle on the start date?", "Which place in the cycle the start date is. 1 means the schedule begins at the first day of your cycle."],
        ["Does it include breaks or pay?", "No. Hours are start to end, with no breaks taken off, and nothing about pay is calculated."],
        ["Is anything sent or saved?", "No. Everything is calculated in your browser and nothing is stored, so a reload starts again."]
    ])}

        </div>
    `;
}

/* The worked example, by the same engine, so the page can never disagree with it. */
function exampleParagraph() {

    const parsed = parseCycle("4D 4O");

    const start = dayNumber({ year: 2026, month: 11, day: 2 });

    const built = buildSchedule({ cycle: parsed.days, start, position: 1, weeks: 4, times: DEFAULT_TIMES });

    const s = built.summary;

    return `The cycle 4D 4O (${cycleWords(parsed.days)}) from Monday 2 November 2026, with day shifts 07:00 to 15:00, gives ${plural(s.workingDays, "working day")} and ${plural(s.offDays, "day")} off in 4 weeks, ${hoursText(s.totalMinutes)} hours in all, with up to ${plural(s.longestWorkRun, "day")} on in a row.`;

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
   THE RESULT
========================================================= */

const daySentence = (day) =>
    `${WEEKDAY_NAMES[day.weekday]} ${dateFromDayNumber(day.number).day}: ${day.working ? `${CODES[day.code].name} ${day.start} to ${day.end}${day.endsNextDay ? " next day" : ""}` : "Off"}`;

function monthGrid(month) {

    const first = month.days[0];

    const blanks = first.weekday;

    const cells = [
        ...Array.from({ length: blanks }, () => `<li class="sp-cell sp-cell--blank" aria-hidden="true"></li>`),
        ...month.days.map(day => `
                        <li class="sp-cell sp-cell--${day.working ? CODES[day.code].id : "off"}">
                            <span class="sp-date">${dateFromDayNumber(day.number).day}</span>
                            <span class="sp-code" aria-hidden="true">${day.code}</span>
                            <span class="tt-sr-only">${escapeHTML(daySentence(day))}</span>
                        </li>`)
    ];

    return `
                <section class="sp-month" aria-label="${MONTH_NAMES[month.month - 1]} ${month.year}">
                    <h3>${MONTH_NAMES[month.month - 1]} ${month.year}</h3>
                    <ol class="sp-days" role="list">
                        ${WEEKDAY_NAMES.map(name => `<li class="sp-head" aria-hidden="true">${name.slice(0, 3)}</li>`).join("")}
                        ${cells.join("")}
                    </ol>
                </section>`;

}

function renderResult(built, cycle, times) {

    const s = built.summary;

    const legend = ["D", "E", "N", "O"]
        .filter(code => s.counts[code] > 0)
        .map(code => `<li><span class="sp-key sp-key--${CODES[code].id}">${code}</span> ${CODES[code].name}${code === "O" ? "" : ` ${times[code].start} to ${times[code].end}`}: ${plural(s.counts[code], "day")}</li>`)
        .join("");

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Schedule
                    </span>

                    <h2 class="calculator-results__title">
                        ${escapeHTML(cycleText(cycle))} for ${plural(built.days.length / 7, "week")}
                    </h2>

                </div>

                <div class="calculator-results__grid sp-grid">
                    ${resultMetric({ label: "Working days", value: String(s.workingDays), primary: true })}
                    ${resultMetric({ label: "Days off", value: String(s.offDays) })}
                    ${resultMetric({ label: "Hours scheduled", value: hoursText(s.totalMinutes) })}
                    ${resultMetric({ label: "Average per week", value: hoursText(s.averageMinutesPerWeek) })}
                    ${resultMetric({ label: "Longest run on", value: plural(s.longestWorkRun, "day") })}
                    ${resultMetric({ label: "Longest run off", value: plural(s.longestOffRun, "day") })}
                </div>

                <ul class="sp-legend">${legend}</ul>

                <div class="sp-months">
                    ${groupByMonth(built.days).map(monthGrid).join("")}
                </div>

                <p class="tt-note" role="note">Hours are start to end with no breaks taken off. A shift belongs to the date it starts on.</p>

                <div class="tt-actions">
                    <button type="button" id="sp-copy" class="calculator-form__button calculator-form__button--secondary">Copy schedule</button>
                    <button type="button" id="sp-print" class="calculator-form__button calculator-form__button--secondary">Print</button>
                    <span id="sp-copy-status" class="tt-status" role="status" hidden></span>
                </div>

            </div>
        `;

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const form = document.querySelector("#sp-form");
    const results = document.querySelector("#sp-results");

    if (!form || !results) {
        return;
    }

    const speaker = createAnnouncer(document.querySelector("#sp-live"));

    const $ = (id) => document.getElementById(id);

    const preset = $("sp-preset");
    const cycleInput = $("sp-cycle");
    const startInput = $("sp-start");
    const positionInput = $("sp-position");
    const weeksInput = $("sp-weeks");
    const errorBox = $(ERROR_ID);

    const timeInputs = (code) => [$(`sp-${code}-start`), $(`sp-${code}-end`)];

    const allFields = [cycleInput, startInput, positionInput, weeksInput, ...["D", "E", "N"].flatMap(timeInputs)];

    function fail(message, fields = []) {

        for (const field of allFields) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        }

        for (const field of fields) {
            field.setAttribute("aria-invalid", "true");
            field.setAttribute("aria-describedby", ERROR_ID);
        }

        errorBox.textContent = message;
        errorBox.hidden = false;

        results.innerHTML = resultEmpty(EMPTY);

        speaker.announce(message);

    }

    function wholeNumber(text, min, max, noun) {

        const value = String(text).trim();

        if (!/^\d{1,3}$/.test(value) || Number(value) < min || Number(value) > max) {
            return { message: `${noun}: enter a whole number from ${min} to ${max}.` };
        }

        return { value: Number(value) };

    }

    function update({ speak = true } = {}) {

        errorBox.hidden = true;

        for (const field of allFields) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        }

        const parsed = parseCycle(cycleInput.value);

        if (!parsed.ok) {

            if (parsed.blank) {
                results.innerHTML = resultEmpty(EMPTY);
                speaker.clear();
                return;
            }

            return fail(parsed.message, [cycleInput]);

        }

        const cycle = parsed.days;

        if (cycle.length < LIMITS.minCycle || cycle.length > LIMITS.maxCycle) {
            return fail(`A cycle has ${LIMITS.minCycle} to ${LIMITS.maxCycle} days; yours has ${cycle.length}.`, [cycleInput]);
        }

        const position = wholeNumber(positionInput.value, 1, cycle.length, `Day of the cycle (this cycle has ${cycle.length} days)`);

        if (position.message) {
            return fail(position.message, [positionInput]);
        }

        const weeks = wholeNumber(weeksInput.value, LIMITS.minWeeks, LIMITS.maxWeeks, "Weeks to show");

        if (weeks.message) {
            return fail(weeks.message, [weeksInput]);
        }

        const date = parseDate(startInput.value);

        if (date.state === "invalid") {
            return fail(`Start date: ${date.message}`, [startInput]);
        }

        if (date.state !== "valid") {
            results.innerHTML = resultEmpty(EMPTY);
            speaker.clear();
            return;
        }

        const times = Object.fromEntries(
            ["D", "E", "N"].map(code => [code, { start: $(`sp-${code}-start`).value, end: $(`sp-${code}-end`).value }])
        );

        const built = buildSchedule({
            cycle,
            start: dayNumber(date.date),
            position: position.value,
            weeks: weeks.value,
            times
        });

        if (built.status === "invalid") {

            const first = built.errors[0];

            return fail(built.errors.map(e => e.message).join(" "), timeInputs(first.code));

        }

        if (built.status === "out-of-range") {
            return fail("That schedule goes beyond the supported years (1 to 9999). Choose an earlier start date.", [startInput]);
        }

        results.innerHTML = renderResult(built, cycle, times);

        const text = copyText(built, cycle, times);

        wireCopy({
            button: results.querySelector("#sp-copy"),
            status: results.querySelector("#sp-copy-status"),
            getText: () => text,
            announce: (message, delay) => speaker.announce(message, delay)
        });

        results.querySelector("#sp-print").addEventListener("click", () => window.print());

        if (speak) {
            speaker.announce(`${plural(built.summary.workingDays, "working day")}, ${plural(built.summary.offDays, "day")} off, ${hoursText(built.summary.totalMinutes)} hours scheduled.`);
        }

    }

    preset.addEventListener("change", () => {

        const chosen = PRESETS.find(p => p.id === preset.value);

        if (chosen) {
            cycleInput.value = chosen.cycle;
            positionInput.value = "1";
        }

        update();

    });

    cycleInput.addEventListener("input", () => {

        if (!PRESETS.some(p => p.id === preset.value && p.cycle === cycleInput.value)) {
            preset.value = "";
        }

    });

    form.addEventListener("input", () => update());
    form.addEventListener("change", (event) => {

        if (event.target !== preset) {
            update();
        }

    });

    form.addEventListener("submit", event => {
        event.preventDefault();
    });

    wireTodayButtons(form);

    $("sp-reset").addEventListener("click", () => {

        form.reset();

        update({ speak: false });

        speaker.clear();

        preset.focus();

    });

    update({ speak: false });

    form.dataset.ready = "true";

}
