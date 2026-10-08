/* =========================================================
   ToolZen Hub
   Hours & Timesheet Calculator (Time Tools)

   Enter the start and end time of each shift and any unpaid
   break, and see the time worked in each shift and in total, in
   hours and minutes and in decimal hours. The rules (overnight,
   the longest shift, the break rules, the four row states and
   the totals) are in hours-engine.js; this file is the page
   around them.

   - Results update as the visitor types; there is no Calculate
     button. Only the row that changed has its text replaced, so
     focus and the native time picker are never disturbed.
   - Every row is shown as empty, incomplete, invalid or counted,
     in words. The total is the sum of the counted rows only, and
     the page says how many rows were included and how many were
     left out (and why), so the total never implies more than it
     holds.
   - Everything is put on the page with textContent or as an
     input value, never as HTML. Nothing is stored, nothing is
     put in the address and nothing is sent anywhere.
========================================================= */

import {
    MAX_ROWS,
    summarize,
    formatHM,
    decimalHours,
    describeRows,
    announcement,
    EXAMPLE_ROWS
} from "./hours-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the Date Difference Calculator is linked in the text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("hours-calculator").title;

const DATE_TOOL =
    getToolById("date-difference");

const ANNOUNCE_DELAY_MS = 500;


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
   The shift rows are created by init().
========================================================= */

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
                        Add up the hours you worked across several shifts. Enter
                        start and end times and unpaid breaks, including shifts
                        that run past midnight.
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
                            Your times stay in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="hc-panel"
                    class="hc-workspace"
                >

                    <p class="hc-limits">
                        <strong>How times are read.</strong>
                        These are clock times: there are no dates or time zones.
                        If the end time is earlier than the start time, the shift
                        ends the next day. A shift can run from 1 minute up to
                        23 hours 59 minutes. Daylight-saving changes are not
                        adjusted. Breaks are unpaid and are taken off the shift.
                    </p>

                    <h2
                        id="hc-shifts-heading"
                        class="hc-heading"
                    >
                        Shifts
                    </h2>

                    <div
                        id="hc-rows"
                        class="hc-rows"
                        role="group"
                        aria-labelledby="hc-shifts-heading"
                    ></div>

                    <div class="hc-actions">

                        <button
                            type="button"
                            id="hc-add"
                            class="calculator-form__button hc-button"
                        >
                            Add shift
                        </button>

                        <button
                            type="button"
                            id="hc-example"
                            class="calculator-form__button calculator-form__button--secondary hc-button"
                        >
                            Load example
                        </button>

                        <button
                            type="button"
                            id="hc-clear"
                            class="calculator-form__button calculator-form__button--secondary hc-button"
                        >
                            Clear all
                        </button>

                        <p
                            id="hc-limit-note"
                            class="hc-limit-note"
                            hidden
                        >You can add up to ${MAX_ROWS} shifts.</p>

                    </div>


                    <section
                        id="hc-total"
                        class="hc-total"
                        aria-labelledby="hc-total-heading"
                    >

                        <h2 id="hc-total-heading">
                            Total worked
                        </h2>

                        <p
                            id="hc-total-empty"
                            class="hc-total__empty"
                        >Enter a start and end time for at least one shift to see the total.</p>

                        <div
                            id="hc-total-figures"
                            class="hc-total__figures"
                            hidden
                        >

                            <p class="hc-total__main">
                                <span id="hc-total-hm" class="hc-total__hm"></span>
                                <span class="hc-total__unit">hours and minutes</span>
                            </p>

                            <p class="hc-total__main">
                                <span id="hc-total-dec" class="hc-total__hm"></span>
                                <span class="hc-total__unit">decimal hours</span>
                            </p>

                            <dl class="hc-total__list">

                                <div class="hc-total__item">
                                    <dt>Total shift time</dt>
                                    <dd id="hc-total-gross"></dd>
                                </div>

                                <div class="hc-total__item">
                                    <dt>Total unpaid breaks</dt>
                                    <dd id="hc-total-break"></dd>
                                </div>

                            </dl>

                        </div>

                        <dl class="hc-counts">

                            <div class="hc-total__item">
                                <dt>Rows included</dt>
                                <dd id="hc-included"></dd>
                            </div>

                            <div class="hc-total__item">
                                <dt>Rows excluded</dt>
                                <dd id="hc-excluded"></dd>
                            </div>

                        </dl>

                        <p
                            id="hc-excluded-note"
                            class="hc-excluded-note"
                            hidden
                        ></p>

                        <p class="hc-total__fine">
                            The total adds up only the rows marked Counted. Empty
                            rows are ignored. Each figure is worked out from exact
                            minutes, so rounded decimal figures may differ from
                            the total by a hundredth.
                        </p>

                    </section>

                </div>

            </section>

            <p
                id="hc-live"
                class="hc-sr-only"
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
                        For each shift, choose the start time and the end time.
                        Enter any unpaid break in minutes, or leave it blank.
                    </li>
                    <li>
                        The row shows the shift, the break and the time worked as
                        you type. Use Add shift for more shifts, up to ${MAX_ROWS}.
                    </li>
                    <li>
                        The total adds up the rows marked Counted. A row with a
                        time missing is marked Incomplete, and a row that breaks a
                        rule is marked Invalid and explains why. Neither is added
                        to the total, and the page says how many rows were left
                        out.
                    </li>
                    <li>
                        Load example fills in three sample shifts. Clear all
                        starts again with one empty row.
                    </li>
                </ol>

            </section>


            <!-- WORKED EXAMPLE -->

            <section class="calculator-info">

                <h2>
                    Worked Example
                </h2>

                <p>
                    Load example shows three shifts:
                </p>

                <ul>
                    <li>Shift 1: 09:00 to 17:30 with a 30-minute break is 8 hours 30 minutes, minus 30 minutes, so <strong>8:00</strong> worked.</li>
                    <li>Shift 2: 22:00 to 06:00 (it ends the next day) with a 45-minute break is 8 hours, minus 45 minutes, so <strong>7:15</strong> worked.</li>
                    <li>Shift 3: 13:00 to 17:00 with no break is <strong>4:00</strong> worked.</li>
                </ul>

                <p>
                    The total worked is 8:00 + 7:15 + 4:00 = <strong>19:15</strong>,
                    which is <strong>19.25 decimal hours</strong>. The shifts
                    themselves add up to 20:30 and the breaks to 1:15.
                </p>

            </section>


            <!-- DECIMAL HOURS -->

            <section class="calculator-info">

                <h2>
                    Hours and Minutes Versus Decimal Hours
                </h2>

                <p>
                    <strong>7:20</strong> means 7 hours and 20 minutes. As a
                    decimal it is <strong>7.33</strong> hours, because 20 minutes
                    is a third of an hour. 7.20 hours would be 7 hours 12
                    minutes, so the two forms are not interchangeable. Many
                    timesheets and invoices ask for decimal hours; others ask
                    for hours and minutes. The tool shows both.
                </p>

                <p>
                    Decimal hours are shown to two places. Nothing else is
                    rounded: shifts are not rounded to the nearest 5 or 15
                    minutes, and every figure is worked out from exact minutes.
                    Because each figure is rounded for display on its own, the
                    decimal figures of the rows can differ from the decimal
                    figure of the total by a hundredth. To turn decimal hours
                    into pay you would multiply by a rate yourself; this tool
                    does not calculate pay.
                </p>

            </section>


            <!-- OVERNIGHT -->

            <section class="calculator-info">

                <h2>
                    Overnight Shifts and the Longest Shift
                </h2>

                <p>
                    If the end time is <strong>earlier</strong> than the start
                    time, the shift is taken to end on the following day: 22:00
                    to 06:00 is 8 hours. A row like this is tagged "Ends next
                    day".
                </p>

                <p>
                    If the start and end are <strong>the same time</strong>, the
                    row is invalid, because it could mean no time or a full day.
                    The longest shift the tool supports is
                    <strong>23 hours 59 minutes</strong> (for example 00:00 to
                    23:59), so a shift of 24 hours or more cannot be entered.
                </p>

                <p>
                    The tool works with clock times only. It has no dates and no
                    time zones, so it cannot tell when a shift happened and does
                    not adjust for a daylight-saving change in the night. It does
                    not check whether two rows overlap.
                </p>

            </section>


            <!-- LIMITATIONS -->

            <section class="calculator-info">

                <h2>
                    What This Tool Does Not Do
                </h2>

                <p>
                    It adds up time. It does not calculate wages, overtime, tax or
                    holiday pay, apply any break or working-time rules, or know
                    your employer's or country's rules. Its results do not show
                    that a timesheet meets any legal or payroll requirement, so
                    check the rules that apply to you.
                </p>

                <p>
                    To count days between dates instead of hours in a day, use
                    the <a href="${DATE_TOOL.href}">${DATE_TOOL.title}</a>.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Adding up the hours of a working week before filling in a timesheet.</li>
                    <li>Checking hours worked on shifts that run past midnight.</li>
                    <li>Working out time worked after unpaid breaks for an invoice or a record of your own hours.</li>
                </ul>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Does it round my time?
                    </summary>
                    <p>
                        No. Time is worked out in exact minutes. The only rounding
                        is that decimal hours are shown to two places, and the
                        exact hours and minutes are always shown beside them.
                    </p>
                </details>

                <details>
                    <summary>
                        How are shifts that go past midnight counted?
                    </summary>
                    <p>
                        An end time earlier than the start time means the shift
                        ends the next day, so 22:00 to 06:00 is 8 hours. The
                        longest shift is 23 hours 59 minutes, and equal start
                        and end times are not accepted.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is 7:20 shown as 7.33?
                    </summary>
                    <p>
                        7:20 is 7 hours and 20 minutes. Twenty minutes is a third
                        of an hour, 0.33 as a decimal, so the decimal form is
                        7.33 hours. The two forms measure the same time.
                    </p>
                </details>

                <details>
                    <summary>
                        Why was a row left out of the total?
                    </summary>
                    <p>
                        Only rows marked Counted are added. A row is Incomplete
                        when a start or end time is missing, and Invalid when it
                        breaks a rule, for example a break longer than the shift
                        or equal start and end times. The row says what to fix,
                        and the total says how many rows were included and how
                        many were excluded.
                    </p>
                </details>

                <details>
                    <summary>
                        Is my data stored or sent anywhere?
                    </summary>
                    <p>
                        No. The times are added up in your browser. Nothing is
                        sent to ToolZen Hub or stored, and reloading the page
                        clears everything.
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
========================================================= */

export function init() {

    const panel = document.querySelector("#hc-panel");

    if (!panel) {
        return;
    }

    const rowsBox = document.querySelector("#hc-rows");
    const live = document.querySelector("#hc-live");
    const limitNote = document.querySelector("#hc-limit-note");
    const totalEmpty = document.querySelector("#hc-total-empty");
    const totalFigures = document.querySelector("#hc-total-figures");
    const totalHm = document.querySelector("#hc-total-hm");
    const totalDec = document.querySelector("#hc-total-dec");
    const totalGross = document.querySelector("#hc-total-gross");
    const totalBreak = document.querySelector("#hc-total-break");
    const included = document.querySelector("#hc-included");
    const excluded = document.querySelector("#hc-excluded");
    const excludedNote = document.querySelector("#hc-excluded-note");

    const buttons = {
        add: document.querySelector("#hc-add"),
        example: document.querySelector("#hc-example"),
        clear: document.querySelector("#hc-clear")
    };

    /* rows in order; each holds its elements and the last message it showed */
    let rows = [];

    let nextId = 1;

    let announceTimer = null;


    /* ---------- small helpers ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            live.textContent = "";
            live.textContent = message;
        }, ANNOUNCE_DELAY_MS);

    }

    /* now, not after the pause: for adding, removing, clearing */
    function announceNow(message) {

        clearTimeout(announceTimer);

        live.textContent = "";

        live.textContent = message;

    }

    function node(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;

    }

    function field(rowId, name, labelText, input) {

        const wrap = node("div", `hc-field hc-field--${name}`);

        const label = node("label", "hc-label", labelText);

        label.id = `hc-r${rowId}-${name}-label`;

        input.id = `hc-r${rowId}-${name}`;

        label.htmlFor = input.id;

        input.setAttribute("aria-labelledby", `hc-r${rowId}-title ${label.id}`);

        wrap.append(label, input);

        return wrap;

    }

    function resultItem(list, term) {

        const wrap = node("div", "hc-result__item");

        const dt = node("dt", "", term);

        const dd = node("dd");

        wrap.append(dt, dd);

        list.append(wrap);

        return dd;

    }


    /* ---------- one shift row (built with the DOM, never as HTML) ---------- */

    function createRow(values) {

        const id = nextId++;

        const group = node("div", "hc-row");

        group.setAttribute("role", "group");
        group.setAttribute("aria-labelledby", `hc-r${id}-title`);
        group.dataset.state = "empty";
        group.dataset.rowId = String(id);

        const head = node("div", "hc-row__head");

        const title = node("h3", "hc-row__title", "Shift");
        title.id = `hc-r${id}-title`;

        const status = node("span", "hc-row__status");

        const remove = node("button", "calculator-form__button calculator-form__button--secondary hc-remove", "Remove");
        remove.type = "button";
        remove.dataset.action = "remove";

        head.append(title, status, remove);

        const start = node("input", "hc-input");
        start.type = "time";
        start.step = "60";

        const end = node("input", "hc-input");
        end.type = "time";
        end.step = "60";

        const breakInput = node("input", "hc-input hc-input--break");
        breakInput.type = "text";
        breakInput.inputMode = "numeric";
        breakInput.autocomplete = "off";
        breakInput.spellcheck = false;

        const fields = node("div", "hc-fields");

        fields.append(
            field(id, "start", "Start", start),
            field(id, "end", "End", end),
            field(id, "break", "Unpaid break (minutes)", breakInput)
        );

        const message = node("p", "hc-row__message");
        message.id = `hc-r${id}-message`;
        message.hidden = true;

        const result = node("dl", "hc-result");
        result.hidden = true;

        const shift = resultItem(result, "Shift");
        const brk = resultItem(result, "Unpaid break");
        const worked = resultItem(result, "Worked");
        const decimal = resultItem(result, "Decimal hours");

        const tag = node("p", "hc-row__tag", "Ends next day");
        tag.hidden = true;

        group.append(head, fields, message, result, tag);

        if (values) {
            start.value = values.start;
            end.value = values.end;
            breakInput.value = values.breakText;
        }

        return {
            id,
            group,
            title,
            status,
            remove,
            start,
            end,
            breakInput,
            message,
            result,
            shift,
            brk,
            worked,
            decimal,
            tag,
            lastMessage: ""
        };

    }

    function readRow(row) {

        return {
            start: row.start.value,
            end: row.end.value,
            breakText: row.breakInput.value,
            startPartial: row.start.value === "" && row.start.validity.badInput,
            endPartial: row.end.value === "" && row.end.validity.badInput
        };

    }


    /* ---------- showing the results ---------- */

    const STATUS_TEXT = {
        empty: "",
        valid: "Counted",
        incomplete: "Incomplete, not counted",
        invalid: "Invalid, not counted"
    };

    /* returns the error message to announce when this row has just started showing a new one */
    function paintRow(row, index, classified) {

        row.title.textContent = `Shift ${index + 1}`;

        row.remove.setAttribute("aria-label", `Remove shift ${index + 1}`);

        row.group.dataset.state = classified.state;

        row.status.textContent = STATUS_TEXT[classified.state];

        row.status.hidden = classified.state === "empty";

        for (const input of [row.start, row.end, row.breakInput]) {
            input.removeAttribute("aria-invalid");
            input.removeAttribute("aria-describedby");
        }

        if (classified.state === "incomplete" || classified.state === "invalid") {

            row.message.textContent = classified.message;
            row.message.hidden = false;

        } else {

            row.message.textContent = "";
            row.message.hidden = true;

        }

        if (classified.state === "invalid") {

            const target = classified.field === "start" ? row.start : classified.field === "end" ? row.end : row.breakInput;

            target.setAttribute("aria-invalid", "true");
            target.setAttribute("aria-describedby", row.message.id);

        }

        if (classified.state === "valid") {

            row.result.hidden = false;

            row.shift.textContent = formatHM(classified.gross);
            row.brk.textContent = formatHM(classified.breakMinutes);
            row.worked.textContent = formatHM(classified.net);
            row.decimal.textContent = decimalHours(classified.net);

            row.tag.hidden = !classified.overnight;

        } else {

            row.result.hidden = true;
            row.tag.hidden = true;

        }

        let toAnnounce = "";

        if (classified.state === "invalid" && row.lastMessage !== classified.message) {
            toAnnounce = `Shift ${index + 1}: ${classified.message}`;
        }

        row.lastMessage = classified.state === "invalid" ? classified.message : "";

        return toAnnounce;

    }

    function paintTotal(summary) {

        const text = describeRows(summary);

        included.textContent = text.includedText;
        excluded.textContent = text.excludedText;

        if (summary.totals === null) {

            totalEmpty.hidden = false;
            totalFigures.hidden = true;

        } else {

            totalEmpty.hidden = true;
            totalFigures.hidden = false;

            totalHm.textContent = formatHM(summary.totals.net);
            totalDec.textContent = decimalHours(summary.totals.net);
            totalGross.textContent = formatHM(summary.totals.gross);
            totalBreak.textContent = formatHM(summary.totals.breakMinutes);

        }

        if (summary.excluded > 0) {

            const parts = [];

            if (summary.counts.incomplete > 0) {
                parts.push(`${summary.counts.incomplete} incomplete`);
            }

            if (summary.counts.invalid > 0) {
                parts.push(`${summary.counts.invalid} invalid`);
            }

            excludedNote.textContent =
                summary.included === 0
                    ? `Nothing is counted yet. ${summary.excluded === 1 ? "1 row is" : summary.excluded + " rows are"} not included (${parts.join(", ")}).`
                    : `The total includes only the ${summary.included === 1 ? "1 counted row" : summary.included + " counted rows"}. ${summary.excluded === 1 ? "1 row is" : summary.excluded + " rows are"} not included (${parts.join(", ")}).`;

            excludedNote.hidden = false;

        } else {

            excludedNote.textContent = "";
            excludedNote.hidden = true;

        }

        const atLimit = rows.length >= MAX_ROWS;

        buttons.add.disabled = atLimit;

        limitNote.hidden = !atLimit;

    }

    /* one pass: classify every row, repaint what changed and the total */
    function refresh({ announceTotal = true } = {}) {

        const summary = summarize(rows.map(readRow));

        const errors = [];

        rows.forEach((row, index) => {

            const said = paintRow(row, index, summary.rows[index]);

            if (said) {
                errors.push(said);
            }

        });

        paintTotal(summary);

        if (announceTotal) {
            announce([announcement(summary), ...errors].join(" "));
        }

    }


    /* ---------- actions ---------- */

    function setRows(valuesList) {

        rowsBox.replaceChildren();

        rows = valuesList.map((values) => createRow(values));

        for (const row of rows) {
            rowsBox.append(row.group);
        }

    }

    function addRow() {

        if (rows.length >= MAX_ROWS) {
            return;
        }

        const row = createRow(null);

        rows.push(row);

        rowsBox.append(row.group);

        refresh({ announceTotal: false });

        row.start.focus();

        announceNow(`Shift ${rows.length} added.`);

    }

    function removeRow(id) {

        const index = rows.findIndex((row) => row.id === id);

        if (index === -1) {
            return;
        }

        if (rows.length === 1) {

            /* the only row is cleared rather than removed: there is always one to type in */
            const only = rows[0];

            only.start.value = "";
            only.end.value = "";
            only.breakInput.value = "";

            refresh({ announceTotal: false });

            only.start.focus();

            announceNow("Shift 1 cleared.");

            return;

        }

        const [gone] = rows.splice(index, 1);

        gone.group.remove();

        const focusRow = rows[Math.min(index, rows.length - 1)];

        refresh({ announceTotal: false });

        focusRow.start.focus();

        announceNow(`Shift ${index + 1} removed. ${rows.length} ${rows.length === 1 ? "shift remains" : "shifts remain"}.`);

    }

    function clearAll() {

        setRows([null]);

        refresh({ announceTotal: false });

        rows[0].start.focus();

        announceNow("All shifts cleared.");

    }

    function loadExample() {

        setRows(EXAMPLE_ROWS);

        refresh({ announceTotal: false });

        announceNow(`Example loaded. ${announcement(summarize(rows.map(readRow)))}`);

    }


    /* ---------- events: one listener each, on the rows box ---------- */

    rowsBox.addEventListener("input", () => refresh());

    rowsBox.addEventListener("change", () => refresh());

    rowsBox.addEventListener("click", (event) => {

        const button = event.target instanceof Element ? event.target.closest("button[data-action='remove']") : null;

        if (!button) {
            return;
        }

        const group = button.closest(".hc-row");

        removeRow(Number(group.dataset.rowId));

    });

    buttons.add.addEventListener("click", addRow);

    buttons.example.addEventListener("click", loadExample);

    buttons.clear.addEventListener("click", clearAll);

    setRows([null]);

    refresh({ announceTotal: false });

    panel.dataset.ready = "true";

}
