/* =========================================================
   ToolZen Hub
   XIRR Calculator (Investment)

   The annualised rate of return of dated cash flows: money you
   put in and money you got back, on the days they happened. The
   method, its limits and the numerical choices are in
   formulas/xirr.js; this file is the page around them.

   - The result appears as soon as the rows are complete and valid
     (Calculators Ecosystem 2.0, pack 49). An empty page gives a
     prompt; a row that is not valid is reported when its row is
     left, and the previous figure is removed meanwhile.
   - Rows are entered one by one or pasted (YYYY-MM-DD, DD/MM/YYYY
     or DD-MM-YYYY, day first). Pasting is an explicit action:
     "Add these rows". Nothing is read from the clipboard.
   - Everything is calculated in the browser. Nothing is stored,
     sent or put in the address. Values are written as escaped text.
========================================================= */

import {
    XIRR_LIMITS,
    parseDate,
    parseAmount,
    parsePastedRows,
    validateFlows,
    solveXirr,
    summarise,
    twoFlowRate
} from "../formulas/xirr.js";

import {
    formatINR,
    formatNumber
} from "../common/formatter.js";

import {
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
    getCalculatorById
} from "../../data/calculators.js";

import {
    SITE_ROOT
} from "../../routes.js";


const TITLE =
    getCalculatorById("xirr").title;

const ERROR_ID = "xirr-error";

const EMPTY_MESSAGE =
    "Enter at least one amount you paid and one you received, each with its date, to see the annual rate.";

const EXAMPLE = [
    ["2023-01-01", "100000", "out"],
    ["2023-07-01", "50000", "out"],
    ["2024-03-31", "20000", "in"],
    ["2025-01-01", "170000", "in"]
];

const ASSUMPTION =
    "The rate is the one yearly rate that makes the money out and the money in equal once each amount is counted from its own date, with a 365-day year (the convention behind spreadsheet XIRR functions). It is worked out from the figures you entered; it is not a forecast, does not include tax or charges you left out, and is not advice.";

const rupees = formatINR;

const percent = (rate) => `${formatNumber(rate * 100, 2)}%`;

const signedRupees = (value) => (value < 0 ? `−${rupees(-value)}` : rupees(value));

const dayWord = (days) => `${formatNumber(days, 0)} ${days === 1 ? "day" : "days"}`;


/* =========================================================
   ROW MARKUP
========================================================= */

let rowCounter = 0;

function rowMarkup({ date = "", amount = "", kind = "out" } = {}) {

    rowCounter += 1;

    const n = rowCounter;

    return `
                    <div class="xirr-row" role="group" aria-label="Cash flow">
                        <div class="xirr-cell">
                            <label class="calculator-form__label xirr-label" for="xirr-date-${n}">Date</label>
                            <input
                                id="xirr-date-${n}"
                                class="calculator-form__input xirr-date"
                                type="date"
                                min="${XIRR_LIMITS.minDate}"
                                max="${XIRR_LIMITS.maxDate}"
                                value="${escapeHTML(date)}"
                            >
                        </div>
                        <div class="xirr-cell">
                            <label class="calculator-form__label xirr-label" for="xirr-amount-${n}">Amount (₹)</label>
                            <input
                                id="xirr-amount-${n}"
                                class="calculator-form__input xirr-amount"
                                type="number"
                                inputmode="decimal"
                                min="0"
                                step="any"
                                placeholder="0"
                                value="${escapeHTML(amount)}"
                            >
                        </div>
                        <div class="xirr-cell">
                            <label class="calculator-form__label xirr-label" for="xirr-kind-${n}">Money out or in</label>
                            <select id="xirr-kind-${n}" class="calculator-form__input xirr-kind">
                                <option value="out"${kind === "out" ? " selected" : ""}>Money out (paid)</option>
                                <option value="in"${kind === "in" ? " selected" : ""}>Money in (received)</option>
                            </select>
                        </div>
                        <div class="xirr-cell xirr-cell--remove">
                            <button type="button" class="calculator-form__button calculator-form__button--secondary xirr-remove">
                                Remove<span class="xirr-sr-only"> this cash flow</span>
                            </button>
                        </div>
                    </div>`;

}


/* =========================================================
   RESULT
========================================================= */

function flowTable(flows) {

    const rows = flows.map(flow => `
                            <tr>
                                <th scope="row">${escapeHTML(flow.iso)}</th>
                                <td>${flow.amount < 0 ? "Money out" : "Money in"}</td>
                                <td>${escapeHTML(rupees(Math.abs(flow.amount)))}</td>
                            </tr>`).join("");

    return `
                <details class="xirr-flows">
                    <summary>Cash flows used, in date order</summary>
                    <div class="calculator-results__table-wrapper" tabindex="0" role="region" aria-label="Cash flows used, in date order">
                        <table class="calculator-results__table">
                            <thead>
                                <tr><th scope="col">Date</th><th scope="col">Type</th><th scope="col">Amount</th></tr>
                            </thead>
                            <tbody>${rows}
                            </tbody>
                        </table>
                    </div>
                </details>`;

}

function composeResult(flows, solved) {

    const sum = summarise(flows);
    const check = twoFlowRate(flows);

    const multiple = solved.roots.length > 1;

    const lines = [
        `Between ${flows[0].iso} and ${flows.at(-1).iso} (${dayWord(sum.days)}), paying ${rupees(sum.moneyOut)} and receiving ${rupees(sum.moneyIn)} works out to about ${percent(solved.rate)} a year.`
    ];

    if (sum.net === 0) {
        lines.push("You received exactly what you paid, so the rate is 0%.");
    }

    const notes = [];

    if (multiple) {
        notes.push(`These cash flows fit more than one yearly rate (${solved.roots.slice(0, 5).map(percent).join(", ")}${solved.roots.length > 5 ? ", and more" : ""}). The one closest to zero is shown. When money goes out again after coming in, a single rate can be misleading, so look at the cash flows rather than at this figure alone.`);
    }

    if (check !== null) {
        notes.push(`Cross-check: with one amount out and one in, this is the compound growth rate over ${dayWord(sum.days)}, (money in ÷ money out) ^ (365 ÷ ${formatNumber(sum.days, 0)}) − 1 = ${percent(check)}. The CAGR calculator gives the same figure for whole years.`);
    }

    const summary = [
        `${TITLE} (ToolZen Hub)`,
        `Period: ${flows[0].iso} to ${flows.at(-1).iso} (${dayWord(sum.days)})`,
        `Money out: ${rupees(sum.moneyOut)}`,
        `Money in: ${rupees(sum.moneyIn)}`,
        `Net: ${signedRupees(sum.net)}`,
        `Annualised rate (XIRR, 365-day year): ${percent(solved.rate)}`,
        ...(multiple ? ["More than one rate fits these cash flows; the one closest to zero is shown."] : []),
        "A calculation from the figures entered, not a forecast or advice."
    ].join("\n");

    const html = `
            <div class="calculator-results__card">
                <div class="calculator-results__header">
                    <span class="calculator-results__eyebrow">Your Result</span>
                    <h2 class="calculator-results__title">Annualised rate of return</h2>
                </div>

                <div class="calculator-results__grid">
                    ${resultMetric({ label: "XIRR (a year)", value: percent(solved.rate), primary: true })}
                    ${resultMetric({ label: "Total money out", value: rupees(sum.moneyOut) })}
                    ${resultMetric({ label: "Total money in", value: rupees(sum.moneyIn) })}
                    ${resultMetric({ label: "Net gain or loss", value: signedRupees(sum.net) })}
                    ${resultMetric({ label: "Period", value: `${dayWord(sum.days)} (${formatNumber(sum.years, 2)} years)` })}
                </div>

                <div class="calculator-results__summary">
                    ${lines.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                ${notes.map(note => `<p class="xirr-note${multiple && note === notes[0] ? " xirr-note--caution" : ""}">${escapeHTML(note)}</p>`).join("")}

                <p class="xirr-assumption">${escapeHTML(ASSUMPTION)}</p>

                <div class="xirr-actions">
                    <button type="button" id="xirr-copy" class="calculator-form__button calculator-form__button--secondary">Copy summary</button>
                    <span class="xirr-copy-note" id="xirr-copy-note"></span>
                </div>

                <p class="xirr-note">
                    Related: <a href="${SITE_ROOT}calculators/cagr/">CAGR Calculator</a> for a start and end value, and
                    <a href="${SITE_ROOT}calculators/sip/">SIP Calculator</a> for regular monthly investing.
                </p>

                ${flowTable(flows)}
            </div>
        `;

    const spoken = `XIRR ${percent(solved.rate)} a year. Money out ${rupees(sum.moneyOut)}, money in ${rupees(sum.moneyIn)}, over ${dayWord(sum.days)}.${multiple ? " More than one rate fits these cash flows; the one closest to zero is shown." : ""}`;

    return { html, summary, spoken };

}


/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">Investment Tool</span>
                    <h1>${TITLE}</h1>
                    <p>
                        Find the yearly rate of return of money you put in and got
                        back on different dates: a lump sum and later top-ups, a
                        policy, a fund or a loan. Enter each amount with its date, or
                        paste them. The rate updates as you type.
                    </p>
                </div>

                <div class="calculator-trust-card">
                    <div class="calculator-trust-icon">✓</div>
                    <div>
                        <strong>100% Free to Use</strong>
                        <span>Calculated in your browser • Nothing is stored</span>
                    </div>
                </div>
            </section>


            <section class="calculator-section">

                <div class="calculator-section__title">Enter Your Cash Flows</div>

                <p class="calculator-section__description">
                    Choose <strong>Money out</strong> for what you paid or invested and
                    <strong>Money in</strong> for what you received, including the final
                    value if you still hold it. At least two rows, at most
                    ${XIRR_LIMITS.maxRows}. The values are not stored or sent anywhere.
                </p>

                <form id="xirr-form" class="calculator-form" novalidate>

                    <div class="xirr-head" aria-hidden="true">
                        <span>Date</span><span>Amount (₹)</span><span>Money out or in</span><span></span>
                    </div>

                    <div id="xirr-rows" class="xirr-rows">${rowMarkup()}${rowMarkup()}
                    </div>

                    <div class="calculator-form__actions xirr-controls">
                        <button type="button" id="xirr-add" class="calculator-form__button calculator-form__button--secondary">Add a row</button>
                        <button type="button" id="xirr-example" class="calculator-form__button calculator-form__button--secondary">Fill in an example</button>
                        <button type="button" id="xirr-reset" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                    </div>

                    <details class="xirr-paste" id="xirr-paste-details">
                        <summary>Paste many rows</summary>
                        <p class="calculator-form__help" id="xirr-paste-help">
                            One cash flow a line: a date, then an amount. Dates as YYYY-MM-DD,
                            DD/MM/YYYY or DD-MM-YYYY (day first). A minus sign or brackets mean
                            money out; a plain number is money in. Up to
                            ${formatNumber(XIRR_LIMITS.maxPasteChars, 0)} characters. Nothing is read until you press the button.
                        </p>
                        <label class="calculator-form__label" for="xirr-paste">Rows to add</label>
                        <textarea
                            id="xirr-paste"
                            class="calculator-form__input xirr-paste-box"
                            rows="6"
                            spellcheck="false"
                            autocomplete="off"
                            aria-describedby="xirr-paste-help xirr-paste-error"
                            placeholder="2023-01-01  -100000&#10;2024-06-30  125000"
                        ></textarea>
                        <p class="xirr-paste-error" id="xirr-paste-error" role="alert"></p>
                        <button type="button" id="xirr-paste-add" class="calculator-form__button">Add these rows</button>
                    </details>

                </form>

            </section>


            <section id="xirr-results" class="calculator-results">
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p id="xirr-live" class="xirr-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Enter each date and amount. Choose Money out for what you paid in and Money in for what came back.</li>
                    <li>Include the value you would get today as a Money in row if you still hold the investment.</li>
                    <li>The rate appears when the rows are complete. Open "Cash flows used" to check them in date order.</li>
                    <li>To add many rows, open "Paste many rows", paste them and press Add these rows.</li>
                    <li>Reset clears all rows. Fill in an example shows how it works.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>How XIRR Is Worked Out</h2>
                <p>
                    XIRR finds the single yearly rate r that makes the cash flows balance: each amount is divided by
                    (1 + r) raised to the number of days since the first date, divided by 365, and the results add up to zero.
                    It is a compound, annualised rate, so it is comparable between investments that ran for different
                    lengths of time. It is not the total gain divided by the amount invested, and it is not a simple average.
                </p>
                <p>
                    The tool searches rates from −99.9999% to 1,000,000% a year, finds every rate at which the total changes
                    sign, refines each by repeated halving and shows the one closest to zero.
                </p>
            </section>

            <section class="calculator-info">
                <h2>What This Calculator Does Not Do</h2>
                <ul>
                    <li>It does not know the value of anything you still hold: enter it as a final Money in row yourself.</li>
                    <li>It does not include tax, exit loads or charges unless you put them in the amounts.</li>
                    <li>It treats each amount as arriving on its date. A SIP's cash flows are the dated instalments, so list each one.</li>
                    <li>Rows with the same date are added together in effect. At least one amount must go out and one come in, on at least two different dates.</li>
                    <li>A rate that exactly touches zero without crossing it, or a rate outside the range above, will not be found. The page then says no rate was found.</li>
                    <li>Amounts have up to two decimals and dates run from 1990 to 2100.</li>
                </ul>
                <p>
                    The result depends only on what you type. A rate is not a forecast, a guarantee or investment advice.
                </p>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Why does it say more than one rate fits?</summary>
                    <p>
                        When the sign of the running balance changes more than once, for example money goes in, comes back,
                        then goes out again, the equation can have several answers. The tool lists them and shows the one
                        closest to zero. In that case read the cash flows, not just the rate.
                    </p>
                </details>
                <details>
                    <summary>Why is XIRR different from the CAGR calculator?</summary>
                    <p>
                        For exactly one amount out and one amount in, they agree when the period is measured in days divided
                        by 365 (the page shows this cross-check). With several dated amounts only XIRR can be used.
                    </p>
                </details>
                <details>
                    <summary>What date formats can I paste?</summary>
                    <p>
                        YYYY-MM-DD, DD/MM/YYYY and DD-MM-YYYY, always day first. A line such as 05/03/2024 is 5 March 2024.
                        A first line that is only a heading is skipped; any other line that cannot be read stops the whole
                        paste and names the line, so nothing is added half-way.
                    </p>
                </details>
                <details>
                    <summary>Is my data stored or sent anywhere?</summary>
                    <p>
                        No. Everything is worked out in your browser. Nothing is stored, sent to ToolZen Hub or placed in the
                        address. Reloading the page clears every row.
                    </p>
                </details>
            </section>

        </div>
    `;

}


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

    const form = document.querySelector("#xirr-form");
    const rowsBox = document.querySelector("#xirr-rows");
    const results = document.querySelector("#xirr-results");
    const live = document.querySelector("#xirr-live");
    const pasteBox = document.querySelector("#xirr-paste");
    const pasteError = document.querySelector("#xirr-paste-error");

    if (!form || !rowsBox || !results) {
        return;
    }

    /* rows made in the browser never reuse an id of the rows that were in the page when it was built */
    rowCounter = Math.max(rowCounter, 100);

    let announceTimer = null;
    let spoken = "";
    let shownHtml = null;
    let summary = "";
    let flowsOpen = false;

    const rowEls = () => [...rowsBox.querySelectorAll(".xirr-row")];

    function numberRows() {

        const all = rowEls();

        all.forEach((row, i) => {
            row.setAttribute("aria-label", `Cash flow ${i + 1}`);
            row.querySelector(".xirr-remove").setAttribute("aria-label", `Remove cash flow ${i + 1}`);
        });

        form.querySelector("#xirr-add").disabled = all.length >= XIRR_LIMITS.maxRows;

    }

    function announce(text, delay = 600) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            if (text !== spoken) {
                live.textContent = text;
                spoken = text;
            }
        }, delay);

    }

    function say(text) {

        clearTimeout(announceTimer);
        live.textContent = text;
        spoken = text;

    }

    /* a result is put on the page only when it differs from what is there, so Copy and the open table survive */
    function show(html) {

        if (html === shownHtml) {
            return;
        }

        shownHtml = html;
        results.innerHTML = html;

        const details = results.querySelector(".xirr-flows");

        if (details) {
            details.open = flowsOpen;
        }

    }

    results.addEventListener("toggle", event => {
        if (event.target.classList?.contains("xirr-flows")) {
            flowsOpen = event.target.open;
        }
    }, true);


    /* -----------------------------------------------------
       READING THE ROWS
       Returns the complete flows, and the problems found
       (each with the inputs it is about).
    ----------------------------------------------------- */

    function readRows() {

        const flows = [];
        const problems = [];

        rowEls().forEach((row, i) => {

            const dateInput = row.querySelector(".xirr-date");
            const amountInput = row.querySelector(".xirr-amount");
            const kind = row.querySelector(".xirr-kind").value;

            const dateText = dateInput.value.trim();
            const amountText = amountInput.value.trim();
            const badAmountInput = amountInput.validity?.badInput === true;

            if (dateText === "" && amountText === "" && !badAmountInput) {
                return;
            }

            const label = `Cash flow ${i + 1}`;
            const date = dateText === "" ? null : parseDate(dateText);

            if (dateText === "" || amountText === "") {
                problems.push({
                    row,
                    inputs: [dateText === "" ? dateInput : amountInput],
                    message: `${label}: enter both a date and an amount.`
                });
                return;
            }

            if (!date) {
                problems.push({ row, inputs: [dateInput], message: `${label}: enter a date between 1990 and 2100.` });
                return;
            }

            const amount = parseAmount(amountText);

            if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > XIRR_LIMITS.maxAmount) {
                problems.push({
                    row,
                    inputs: [amountInput],
                    message: `${label}: enter an amount above zero with up to 2 decimals, up to ₹1,00,000 crore.`
                });
                return;
            }

            if (amount < 0) {
                problems.push({
                    row,
                    inputs: [amountInput],
                    message: `${label}: enter the amount without a minus sign and choose Money out or Money in.`
                });
                return;
            }

            flows.push({
                day: date.day,
                iso: date.iso,
                amount: kind === "out" ? -amount : amount
            });

        });

        return { flows, problems };

    }


    /* -----------------------------------------------------
       UPDATE
       focusEl: where focus is, or is going to. Problems in the
       row being edited wait until the row is left; a problem
       that concerns all rows waits until focus leaves the form.
    ----------------------------------------------------- */

    function update({ focusEl = document.activeElement, speak = true } = {}) {

        clearFieldsInvalid([...form.querySelectorAll(".xirr-date, .xirr-amount")], ERROR_ID);

        const focusRow = focusEl?.closest?.(".xirr-row") || null;
        const insideForm = !!(focusEl && form.contains(focusEl));

        const { flows, problems } = readRows();

        const shown = problems.filter(problem => problem.row !== focusRow);

        if (shown.length) {

            setFieldsInvalid(shown.flatMap(problem => problem.inputs), ERROR_ID);

            const message = shown.map(problem => problem.message).join(" ");

            show(resultError(message, { id: ERROR_ID }));

            if (speak) {
                announce(message);
            }

            return;

        }

        if (problems.length || flows.length === 0) {

            show(resultEmpty(EMPTY_MESSAGE));

            if (speak) {
                announce("");
            }

            return;

        }

        const check = validateFlows(flows);

        if (!check.ok) {

            const message = check.errors.map(error => error.message).join(" ");

            show(insideForm ? resultEmpty(message) : resultError(message, { id: ERROR_ID }));

            if (speak) {
                announce(insideForm ? "" : message);
            }

            return;

        }

        const solved = solveXirr(check.values.flows);

        if (solved.state !== "ok") {

            const message = "No yearly rate between −99.9999% and 1,000,000% fits these cash flows. Check that the amounts and dates are right.";

            show(insideForm ? resultEmpty(message) : resultError(message, { id: ERROR_ID }));

            if (speak) {
                announce(message);
            }

            return;

        }

        const composed = composeResult(check.values.flows, solved);

        summary = composed.summary;

        show(composed.html);

        if (speak) {
            announce(composed.spoken);
        }

    }


    /* -----------------------------------------------------
       ROWS: add, remove, fill, reset
    ----------------------------------------------------- */

    function setRows(values) {

        rowsBox.innerHTML = values.map(rowMarkup).join("");

        numberRows();

    }

    function addRow(values) {

        rowsBox.insertAdjacentHTML("beforeend", rowMarkup(values));

        numberRows();

        return rowEls().at(-1);

    }

    function resetAll() {

        setRows([{}, {}]);

        pasteBox.value = "";
        pasteError.textContent = "";
        flowsOpen = false;

        update({ focusEl: null, speak: false });

        say("All rows cleared.");

        rowsBox.querySelector(".xirr-date")?.focus();

    }

    function fillExample() {

        setRows(EXAMPLE.map(([date, amount, kind]) => ({ date, amount, kind })));

        update({ focusEl: null, speak: false });

        say("Example loaded: four cash flows.");

    }

    function addPasted() {

        pasteError.textContent = "";

        const text = pasteBox.value;

        if (text.trim() === "") {
            pasteError.textContent = "Paste at least one row first.";
            return;
        }

        if (text.length > XIRR_LIMITS.maxPasteChars) {
            pasteError.textContent = `The pasted text is longer than ${formatNumber(XIRR_LIMITS.maxPasteChars, 0)} characters. Paste fewer rows.`;
            return;
        }

        const parsed = parsePastedRows(text);

        if (parsed.errors.length) {

            const shownErrors = parsed.errors.slice(0, 5).map(error => error.message);

            if (parsed.errors.length > 5) {
                shownErrors.push(`${parsed.errors.length - 5} more lines also have problems.`);
            }

            pasteError.textContent = `Nothing was added. ${shownErrors.join(" ")}`;

            return;

        }

        if (parsed.rows.length === 0) {
            pasteError.textContent = "No rows were found. Start each line with a date, then the amount.";
            return;
        }

        /* blank rows are used first, so the page does not keep empty rows between the new ones */
        const blanks = rowEls().filter(row =>
            row.querySelector(".xirr-date").value === "" && row.querySelector(".xirr-amount").value === ""
        );

        const kept = rowEls().length - blanks.length;

        if (kept + parsed.rows.length > XIRR_LIMITS.maxRows) {
            pasteError.textContent = `That would make ${kept + parsed.rows.length} rows. The most is ${XIRR_LIMITS.maxRows}. Nothing was added.`;
            return;
        }

        blanks.forEach(row => row.remove());

        for (const row of parsed.rows) {
            rowsBox.insertAdjacentHTML("beforeend", rowMarkup({
                date: row.iso,
                amount: String(Math.abs(row.amount)),
                kind: row.amount < 0 ? "out" : "in"
            }));
        }

        while (rowEls().length < XIRR_LIMITS.minRows) {
            rowsBox.insertAdjacentHTML("beforeend", rowMarkup());
        }

        numberRows();

        pasteBox.value = "";

        update({ focusEl: null, speak: false });

        say(`Added ${parsed.rows.length} ${parsed.rows.length === 1 ? "row" : "rows"}.`);

    }

    async function copySummary() {

        const note = results.querySelector("#xirr-copy-note");

        if (!summary) {
            return;
        }

        try {

            await navigator.clipboard.writeText(summary);

            if (note) {
                note.textContent = "Summary copied.";
            }

            say("Summary copied.");

        } catch (error) {

            const box = document.createElement("textarea");

            box.id = "xirr-copy-fallback";
            box.className = "calculator-form__input xirr-copy-fallback";
            box.readOnly = true;
            box.rows = 8;
            box.setAttribute("aria-label", "Summary to copy");
            box.value = summary;

            results.querySelector(".calculator-results__card")?.append(box);

            box.focus();
            box.select();

            if (note) {
                note.textContent = "Copying is not available here. The summary is selected: press Ctrl+C (or Cmd+C) to copy it.";
            }

        }

    }


    /* -----------------------------------------------------
       EVENTS
    ----------------------------------------------------- */

    form.addEventListener("input", event => {

        if (event.target === pasteBox) {
            return;
        }

        update();

    });

    form.addEventListener("change", event => {

        if (event.target !== pasteBox) {
            update();
        }

    });

    form.addEventListener("focusout", event => {

        if (event.target === pasteBox) {
            return;
        }

        update({ focusEl: event.relatedTarget });

    });

    form.addEventListener("submit", event => event.preventDefault());

    form.addEventListener("click", event => {

        const remove = event.target.closest(".xirr-remove");

        if (remove) {

            const rows = rowEls();
            const row = remove.closest(".xirr-row");
            const index = rows.indexOf(row);

            if (rows.length <= XIRR_LIMITS.minRows) {
                /* two rows always stay: removing one clears it instead */
                row.querySelector(".xirr-date").value = "";
                row.querySelector(".xirr-amount").value = "";
                row.querySelector(".xirr-kind").value = "out";
                row.querySelector(".xirr-date").focus();
            } else {
                row.remove();
                numberRows();
                (rowEls()[Math.min(index, rowEls().length - 1)]).querySelector(".xirr-date").focus();
            }

            update({ focusEl: document.activeElement });

            return;

        }

        if (event.target.closest("#xirr-add")) {

            const row = addRow();

            row.querySelector(".xirr-date").focus();

            update({ focusEl: document.activeElement, speak: false });

            return;

        }

        if (event.target.closest("#xirr-example")) {
            fillExample();
            return;
        }

        if (event.target.closest("#xirr-reset")) {
            resetAll();
            return;
        }

        if (event.target.closest("#xirr-paste-add")) {
            addPasted();
        }

    });

    results.addEventListener("click", event => {
        if (event.target.closest("#xirr-copy")) {
            copySummary();
        }
    });

    numberRows();

    update({ focusEl: null, speak: false });

    form.dataset.ready = "true";

}
