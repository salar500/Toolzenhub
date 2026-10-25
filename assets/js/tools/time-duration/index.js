/* =========================================================
   ToolZen Hub
   Time Duration Calculator (Time Tools)

   Add and subtract lengths of time (1:45, 2h 30m, 90m, 45s) and see
   the total as days, hours, minutes and seconds, as hours:minutes:
   seconds, and as decimal hours, total minutes and total seconds.

   The rules are in duration-engine.js (pure, integer seconds, checked
   against an independent reference). This file owns the rows, the
   result and the announcements.

   Everything runs in the browser. Nothing is sent anywhere and
   nothing is stored: a reload starts again.
========================================================= */

import {
    LIMITS,
    parseDuration,
    sumRows,
    resultSet,
    wordsText,
    copyText
} from "./duration-engine.js";

import {
    getToolById
} from "../../data/tools.js";

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
    wireCopy
} from "../time-ui/time-ui.js";


/* The related-tools pilot for Time Tools: curated tools from this section only, no articles. */
export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE = getToolById("time-duration").title;

const HOURS = getToolById("hours-calculator");
const DATE_DIFFERENCE = getToolById("date-difference");

const EMPTY = "Enter at least one length of time, such as 1:45 or 2h 30m, to see the total.";

const START_ROWS = 2;


/* =========================================================
   MARKUP
========================================================= */

function rowMarkup(number, sign = "+") {

    return `
                        <li class="td-row" data-row>

                            <label class="td-sign-label">
                                <span class="tt-sr-only">Row ${number}: add or subtract</span>
                                <select class="calculator-form__input td-sign" aria-label="Row ${number}: add or subtract">
                                    <option value="+"${sign === "+" ? " selected" : ""}>+ Add</option>
                                    <option value="-"${sign === "-" ? " selected" : ""}>− Subtract</option>
                                </select>
                            </label>

                            <div class="td-length">
                                <input
                                    class="calculator-form__input td-input"
                                    type="text"
                                    inputmode="text"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="1:45 or 2h 30m"
                                    aria-label="Row ${number}: length of time"
                                >
                                <span class="td-hint" role="note"></span>
                            </div>

                            <button
                                type="button"
                                class="td-remove tt-inline-button"
                                aria-label="Remove row ${number}"
                            >Remove</button>

                        </li>`;

}

export function markup() {

    return `
        <div class="calculator-page">
${introMarkup({
        title: TITLE,
        lead: "Add and subtract lengths of time, such as 1:45 or 2h 30m, and read the total as hours, minutes and seconds or as decimal hours."
    })}

            <!-- THE TOOL -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Lengths of Time
                </div>

                <p class="calculator-section__description">
                    Type each length on its own row. The total appears as soon as
                    one row is filled in.
                </p>

                <form
                    id="td-form"
                    class="calculator-form td-form"
                    novalidate
                >

                    <ol id="td-rows" class="td-rows" aria-label="Lengths of time">${Array.from({ length: START_ROWS }, (_, i) => rowMarkup(i + 1)).join("")}
                    </ol>

                    <p id="td-error" class="tt-error" role="alert" hidden></p>

                    <div class="calculator-form__actions td-actions">

                        <button
                            type="button"
                            id="td-add"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Add a row
                        </button>

                        <button
                            type="button"
                            id="td-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                    <p class="td-formats">
                        Accepted: <code>1:45</code>, <code>1:45:30</code>,
                        <code>1h 45m</code>, <code>90m</code>, <code>45s</code>,
                        <code>1.75h</code>.
                    </p>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="td-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY)}
            </section>

            <p
                id="td-live"
                class="tt-sr-only"
                role="status"
                aria-live="polite"
            ></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        Type a length of time on a row: <code>1:45</code> is 1 hour
                        45 minutes, <code>1h 45m 30s</code> adds seconds, and
                        <code>90m</code> or <code>45s</code> use a single unit.
                    </li>
                    <li>
                        Choose Add or Subtract for each row, and use Add a row for
                        more (up to ${LIMITS.rows}).
                    </li>
                    <li>
                        Read the total in words, as hours:minutes:seconds, as
                        decimal hours, and as total minutes and seconds. Copy it
                        with one click.
                    </li>
                </ol>`)}
${infoSection("How the Total Is Worked Out", `<p>
                    Every length is turned into a whole number of seconds and
                    the rows are added or subtracted, so there is no rounding
                    along the way. One day here is exactly 24 hours. Decimal
                    hours are shown to two places, rounded to the nearest, and
                    the page says when that is a rounding (20 minutes is 0.33
                    hours, not exactly one third).
                </p>
                <p>
                    A decimal such as <code>1.75h</code> is accepted only when it
                    is a whole number of seconds. <code>1.3333h</code> is not,
                    so it is refused instead of being quietly rounded. If the
                    total is below zero it is shown with a minus sign.
                </p>`)}
${infoSection("Lengths of Time, Not Clock Times", `<p>
                    This adds <em>lengths</em>, like a task that took 1:45 and
                    another that took 2:30. It does not use dates, clock times or
                    time zones, so a daylight-saving change cannot affect it. To
                    find the time worked between a start and an end clock time,
                    including overnight shifts and breaks, use the
                    <a href="${HOURS.href}">${escapeHTML(HOURS.title)}</a>. To find
                    the days between two dates, use the
                    <a href="${DATE_DIFFERENCE.href}">${escapeHTML(DATE_DIFFERENCE.title)}</a>.
                </p>`)}
${infoSection("Example", `<p>${escapeHTML(exampleParagraph())}</p>`)}
${faqSection(TITLE + " FAQ", [
        ["Why is 1:30 plus 1:45 not 2:75?", "Minutes carry into hours at 60, not 100. 1 hour 30 minutes plus 1 hour 45 minutes is 3 hours 15 minutes."],
        ["Can the total be negative?", "Yes. Subtracting a longer length from a shorter one gives a negative total, shown with a minus sign."],
        ["What is the largest length?", "Each row can be up to 99,999 hours 59 minutes 59 seconds, and there can be up to " + LIMITS.rows + " rows."],
        ["Does it use dates or time zones?", "No. It adds lengths of time only, so a time zone or a daylight-saving change cannot change the answer."],
        ["Is anything sent or saved?", "No. Everything is calculated in your browser and nothing is stored, so a reload starts again."]
    ])}

        </div>
    `;
}

/* The worked example, by the same engine, so the page can never disagree with it. */
function exampleParagraph() {

    const total = sumRows([
        { sign: "+", text: "1:45" },
        { sign: "+", text: "2h 30m" },
        { sign: "-", text: "20m" }
    ]);

    const shown = resultSet(total.seconds);

    return `1:45 plus 2h 30m minus 20m is ${shown.words} (${shown.clock}), which is ${shown.decimalHours} decimal hours and ${shown.totalMinutes} minutes.`;

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

    const form = document.querySelector("#td-form");
    const list = document.querySelector("#td-rows");
    const results = document.querySelector("#td-results");
    const live = document.querySelector("#td-live");
    const errorBox = document.querySelector("#td-error");
    const addButton = document.querySelector("#td-add");

    if (!form || !list || !results) {
        return;
    }

    const speaker = createAnnouncer(live);

    const rowsOf = () => [...list.querySelectorAll("[data-row]")];

    /* row numbers are part of every label, so renumber after an add or a remove */
    function renumber() {

        rowsOf().forEach((row, index) => {

            const n = index + 1;

            row.querySelector(".td-sign").setAttribute("aria-label", `Row ${n}: add or subtract`);
            row.querySelector(".td-sign-label .tt-sr-only").textContent = `Row ${n}: add or subtract`;
            row.querySelector(".td-input").setAttribute("aria-label", `Row ${n}: length of time`);
            row.querySelector(".td-remove").setAttribute("aria-label", `Remove row ${n}`);

        });

        const full = rowsOf().length >= LIMITS.rows;

        addButton.disabled = full;

        addButton.textContent = full ? `Limit of ${LIMITS.rows} rows reached` : "Add a row";

        for (const button of list.querySelectorAll(".td-remove")) {
            button.hidden = rowsOf().length <= 1;
        }

    }

    function update({ speak = true } = {}) {

        const rows = rowsOf().map(row => ({
            sign: row.querySelector(".td-sign").value,
            text: row.querySelector(".td-input").value
        }));

        let bad = 0;

        rowsOf().forEach((row, index) => {

            const input = row.querySelector(".td-input");
            const hint = row.querySelector(".td-hint");

            const read = parseDuration(rows[index].text);

            hint.classList.toggle("td-hint--error", read.state === "invalid");

            if (read.state === "invalid") {

                bad += 1;

                input.setAttribute("aria-invalid", "true");

                hint.id = `td-hint-${index}`;

                input.setAttribute("aria-describedby", hint.id);

                hint.textContent = read.message;

            } else {

                input.removeAttribute("aria-invalid");

                input.removeAttribute("aria-describedby");

                hint.textContent = read.state === "valid" ? `= ${wordsText(read.seconds)}` : "";

            }

        });

        errorBox.hidden = true;

        const sum = sumRows(rows);

        if (sum.status === "invalid") {

            const message = `${bad === 1 ? "One row is" : `${bad} rows are`} not a length of time. Fix ${bad === 1 ? "it" : "them"} to see the total.`;

            results.innerHTML = resultEmpty(message);

            if (speak) {
                speaker.announce(message);
            }

            return;

        }

        if (sum.status === "empty") {

            results.innerHTML = resultEmpty(EMPTY);

            if (speak) {
                speaker.clear();
            }

            return;

        }

        const shown = resultSet(sum.seconds);

        const roundedHours = shown.decimalHoursExact ? "" : " (rounded)";
        const roundedMinutes = shown.totalMinutesExact ? "" : " (rounded)";

        results.innerHTML = `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        The total
                    </h2>

                </div>

                <p class="tt-answer">${escapeHTML(shown.sign + shown.words)}</p>

                <div class="calculator-results__grid td-grid">
                    ${resultMetric({ label: "Hours:minutes:seconds", value: shown.sign + shown.clock })}
                    ${resultMetric({ label: "Decimal hours" + roundedHours, value: shown.sign + shown.decimalHours })}
                    ${resultMetric({ label: "Total minutes" + roundedMinutes, value: shown.sign + shown.totalMinutes })}
                    ${resultMetric({ label: "Total seconds", value: shown.sign + shown.totalSeconds })}
                </div>

                <div class="calculator-results__summary">
                    <p>${sum.counted === 1 ? "One length" : `${sum.counted} lengths`} counted.${shown.decimalHoursExact ? "" : ` Decimal hours to four places: ${escapeHTML(shown.sign + shown.decimalHoursLong)}.`}${shown.negative ? " The total is below zero because more was subtracted than added." : ""}</p>
                </div>

                <div class="tt-actions">
                    <button type="button" id="td-copy" class="calculator-form__button calculator-form__button--secondary">Copy result</button>
                    <span id="td-copy-status" class="tt-status" role="status" hidden></span>
                </div>

            </div>
        `;

        wireCopy({
            button: results.querySelector("#td-copy"),
            status: results.querySelector("#td-copy-status"),
            getText: () => copyText(sum.seconds),
            announce: (text, delay) => speaker.announce(text, delay)
        });

        if (speak) {
            speaker.announce(`Total ${shown.sign ? "minus " : ""}${shown.words}, ${shown.sign ? "minus " : ""}${shown.decimalHours} decimal hours.`);
        }

    }

    form.addEventListener("input", () => update());
    form.addEventListener("change", () => update());

    form.addEventListener("submit", event => {
        event.preventDefault();
    });

    addButton.addEventListener(
        "click",
        () => {

            if (rowsOf().length >= LIMITS.rows) {
                return;
            }

            list.insertAdjacentHTML("beforeend", rowMarkup(rowsOf().length + 1));

            renumber();

            update({ speak: false });

            rowsOf().at(-1).querySelector(".td-input").focus();

        }
    );

    list.addEventListener(
        "click",
        event => {

            const button = event.target.closest(".td-remove");

            if (!button || rowsOf().length <= 1) {
                return;
            }

            const row = button.closest("[data-row]");

            const rows = rowsOf();

            const index = rows.indexOf(row);

            row.remove();

            renumber();

            update({ speak: false });

            const remaining = rowsOf();

            remaining[Math.min(index, remaining.length - 1)].querySelector(".td-input").focus();

            speaker.announce(`Row ${index + 1} removed.`, 0);

        }
    );

    document.querySelector("#td-reset")?.addEventListener(
        "click",
        () => {

            list.innerHTML = Array.from({ length: START_ROWS }, (_, i) => rowMarkup(i + 1)).join("");

            renumber();

            update({ speak: false });

            speaker.clear();

            rowsOf()[0].querySelector(".td-input").focus();

        }
    );

    renumber();

    update({ speak: false });

    form.dataset.ready = "true";

}
