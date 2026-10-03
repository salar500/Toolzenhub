/* =========================================================
   ToolZen Hub
   Loan Prepayment Calculator

   Shows what a one-time prepayment does to a loan that is
   already running: how much interest it saves, how much sooner
   the loan ends if the EMI is kept, and how far the EMI falls if
   the end date is kept.

   The maths is in formulas/prepayment.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It
   owns the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent
   anywhere and nothing is stored.
========================================================= */

import {
    calculatePrepayment,
    buildSchedule,
    summarizeByYear,
    validatePrepaymentInputs,
    PREPAYMENT_LIMITS
} from "../formulas/prepayment.js";

import {
    downloadScheduleCsv
} from "./export.js";

import {
    formatINR,
    formatNumber,
    formatPercent,
    formatDuration
} from "../common/formatter.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    ROUTES
} from "../../routes.js";

import {
    numberField,
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


/* =========================================================
   IDENTITY
   The title comes from the tool catalog. The copy and the rest
   of the content stay with the tool.
========================================================= */

const TITLE =
    getCalculatorById("prepayment").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    balance: "prepay-balance",
    rate: "prepay-rate",
    years: "prepay-years",
    months: "prepay-months",
    prepayment: "prepay-amount",
    after: "prepay-after"
};

const ERROR_ID =
    "prepay-results-error";

const DEFAULTS = {
    balance: 2500000,
    rate: 8.5,
    years: 15,
    months: 0,
    prepayment: 300000,
    after: 0
};

const EMPTY_MESSAGE =
    "Enter your loan details to see the impact of a prepayment.";


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupees = formatINR;

function emisText(
    count
) {

    return `${count} EMI${count === 1 ? "" : "s"}`;

}

function timingText(
    afterMonths
) {

    return afterMonths === 0
        ? "right away, before your next EMI"
        : `right after EMI ${afterMonths}`;

}


/* =========================================================
   RESULTS (HTML)
========================================================= */

function comparisonCard({
    id,
    title,
    tag,
    rows
}) {

    return `
                    <section
                        class="prepay-compare__card"
                        aria-labelledby="${id}"
                    >

                        <h3
                            class="prepay-compare__title"
                            id="${id}"
                        >
                            ${escapeHTML(title)}
                        </h3>

                        <p class="prepay-compare__tag">
                            ${escapeHTML(tag)}
                        </p>

                        <dl class="prepay-compare__list">
                            ${rows.map(
                                ([label, value]) => `
                            <div>
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`
                            ).join("")}
                        </dl>

                    </section>`;

}

/* =========================================================
   REPAYMENT SCHEDULE
   One schedule at a time: year by year by default, month by
   month on request. The choice of schedule is a native radio
   group (arrow keys, labels and "checked" come from the
   browser); the choice survives recalculation.
========================================================= */

const view = {
    scenario: "keep",
    monthly: false
};

function scenarioLabel(
    result,
    key
) {

    if (key === "baseline") {
        return "Without prepayment";
    }

    if (key === "keep") {
        return result.prepaymentPoint.clearsLoan
            ? "Prepay and clear the loan"
            : "Prepay, keep EMI";
    }

    return "Prepay, lower EMI";

}

function scenarioKeys(
    result
) {

    return result.reduceEmi
        ? ["baseline", "keep", "reduce"]
        : ["baseline", "keep"];

}

function currentScenario(
    result
) {

    return scenarioKeys(result).includes(view.scenario)
        ? view.scenario
        : "keep";

}

function scenarioNote(
    result,
    key
) {

    const {
        input,
        baseline,
        prepaymentPoint: point,
        keepEmi,
        reduceEmi
    } = result;

    if (key === "baseline") {

        return `The loan as it is: ${rupees(baseline.emi)} a month for ${formatDuration(baseline.totalMonths)}.`;

    }

    const when =
        point.afterMonths === 0
            ? "before the first EMI"
            : `right after EMI ${point.afterMonths}`;

    if (key === "keep") {

        return point.clearsLoan
            ? `The prepayment of ${rupees(point.applied)} clears the loan ${when}, so no EMIs follow.`
            : `The ${rupees(point.applied)} prepayment is made ${when}. The EMI stays ${rupees(keepEmi.emi)}, so the loan ends after ${emisText(keepEmi.totalMonths)}.`;

    }

    return point.afterMonths === 0
        ? `The ${rupees(point.applied)} prepayment is made before the first EMI. The EMI is ${rupees(reduceEmi.emi)} from the start, and the loan still ends after ${emisText(input.remainingMonths)}.`
        : `The ${rupees(point.applied)} prepayment is made ${when}. The EMI is ${rupees(baseline.emi)} until then and ${rupees(reduceEmi.emi)} after, and the loan still ends after ${emisText(input.remainingMonths)}.`;

}

function tableHead(
    first,
    showPrepayment,
    paymentLabel
) {

    return `
                            <tr>
                                <th scope="col">${first}</th>
                                <th scope="col">Opening balance</th>
                                <th scope="col">${paymentLabel}</th>
                                <th scope="col">Interest</th>
                                <th scope="col">Principal</th>${showPrepayment
                                    ? `
                                <th scope="col">Prepayment</th>`
                                    : ""}
                                <th scope="col">Closing balance</th>
                            </tr>`;

}

function tableRow(
    label,
    row,
    showPrepayment
) {

    return `
                            <tr>
                                <th scope="row">${label}</th>
                                <td>${rupees(row.opening)}</td>
                                <td>${row.payment > 0 ? rupees(row.payment) : "–"}</td>
                                <td>${row.interest > 0 ? rupees(row.interest) : "–"}</td>
                                <td>${row.principal > 0 ? rupees(row.principal) : "–"}</td>${showPrepayment
                                    ? `
                                <td>${row.prepayment > 0 ? rupees(row.prepayment) : "–"}</td>`
                                    : ""}
                                <td>${rupees(row.closing)}</td>
                            </tr>`;

}

function scheduleView(
    result
) {

    const key = currentScenario(result);
    const label = scenarioLabel(result, key);
    const rows = buildSchedule(result, key);
    const years = summarizeByYear(rows);
    const showPrepayment = key !== "baseline";

    const yearly = `
                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="Repayment schedule by year: ${escapeHTML(label)}"
                >

                    <table class="calculator-results__table prepay-table">

                        <caption class="prepay-sr-only">
                            Repayment schedule by year: ${escapeHTML(label)}. Each row adds up that year's EMIs.
                        </caption>

                        <thead>${tableHead("Year", showPrepayment, "EMIs paid")}
                        </thead>

                        <tbody>${years.map(
                            row => tableRow(`Year ${row.year}`, row, showPrepayment)
                        ).join("")}
                        </tbody>

                    </table>

                </div>`;

    const monthly = view.monthly
        ? `
                <div
                    class="calculator-results__table-wrapper prepay-monthly__wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="Repayment schedule by month: ${escapeHTML(label)}"
                >

                    <table class="calculator-results__table prepay-table">

                        <caption class="prepay-sr-only">
                            Repayment schedule by month: ${escapeHTML(label)}.
                        </caption>

                        <thead>${tableHead("Month", showPrepayment, "EMI")}
                        </thead>

                        <tbody>${rows.map(
                            row => tableRow(
                                row.month === 0 ? "Start" : `Month ${row.month}`,
                                row,
                                showPrepayment
                            )
                        ).join("")}
                        </tbody>

                    </table>

                </div>`
        : "";

    return `
                <p class="prepay-print-only">
                    Schedule shown: ${escapeHTML(label)}
                </p>

                <p class="prepay-note prepay-note--lead">
                    ${escapeHTML(scenarioNote(result, key))}
                </p>

                ${yearly}

                <div class="prepay-actions">

                    <button
                        type="button"
                        id="prepay-monthly-toggle"
                        class="calculator-form__button calculator-form__button--secondary prepay-toggle"
                        aria-expanded="${view.monthly}"
                        aria-controls="prepay-monthly"
                    >
                        ${view.monthly
                            ? "Hide month-by-month detail"
                            : `Show month-by-month detail (${rows.length} rows)`}
                    </button>

                    <button
                        type="button"
                        id="prepay-csv"
                        class="calculator-form__button calculator-form__button--secondary prepay-toggle"
                    >
                        Download CSV<span class="prepay-sr-only"> of the schedule: ${escapeHTML(label)}</span>
                    </button>

                    <button
                        type="button"
                        id="prepay-print"
                        class="calculator-form__button calculator-form__button--secondary prepay-toggle"
                    >
                        Print Summary
                    </button>

                </div>

                <div id="prepay-monthly">${monthly}
                </div>

                <p class="prepay-note">
                    A prepayment is shown in the month it is made. Balances
                    and totals are estimates and may differ slightly from
                    your lender's statement.
                </p>`;

}

function scheduleSection(
    result
) {

    const current = currentScenario(result);

    return `
                <h3 class="prepay-subtitle" id="prepay-schedule-title">
                    Repayment schedule
                </h3>

                <fieldset class="prepay-scenarios">

                    <legend class="prepay-sr-only">
                        Choose which schedule to show
                    </legend>

                    ${scenarioKeys(result).map(
                        key => `
                    <label class="prepay-scenarios__option">
                        <input
                            type="radio"
                            name="prepay-scenario"
                            value="${key}"${key === current ? " checked" : ""}
                        >
                        <span>${escapeHTML(scenarioLabel(result, key))}</span>
                    </label>`
                    ).join("")}

                </fieldset>

                <div id="prepay-schedule-view">
                    ${scheduleView(result)}
                </div>`;

}

/*
 * Shown only when the page is printed (or saved as a PDF): what
 * was assumed, since the form itself is left out of the printout.
 */

function printSummary(
    result
) {

    const {
        input,
        prepaymentPoint: point
    } = result;

    const rows = [
        ["Outstanding loan balance", rupees(input.balance)],
        ["Interest rate", `${formatNumber(input.annualRate, 2)}% a year`],
        ["Remaining tenure", formatDuration(input.remainingMonths)],
        ["Prepayment", `${rupees(point.applied)}, made ${timingText(point.afterMonths)}`]
    ];

    return `
                <div class="prepay-print-only prepay-print-summary">

                    <p class="prepay-print-brand">
                        ToolZen Hub &middot; ${escapeHTML(TITLE)}
                    </p>

                    <dl class="prepay-print-inputs">
                        ${rows.map(
                            ([label, value]) => `
                        <div>
                            <dt>${escapeHTML(label)}</dt>
                            <dd>${escapeHTML(value)}</dd>
                        </div>`
                        ).join("")}
                    </dl>

                </div>`;

}

function renderResults(
    result
) {

    const {
        baseline,
        prepaymentPoint: point,
        keepEmi,
        reduceEmi
    } = result;

    const clears =
        point.clearsLoan;

    const metrics = [

        resultMetric({
            label:
                clears
                    ? "Prepayment needed to clear the loan"
                    : "Prepayment",
            value:
                rupees(point.applied)
        }),

        resultMetric({
            label:
                "Interest saved",
            value:
                rupees(keepEmi.interestSaved),
            primary:
                true
        }),

        resultMetric({
            label:
                "Time saved",
            value:
                formatDuration(keepEmi.monthsSaved)
        }),

        resultMetric({
            label:
                clears
                    ? "EMIs stop after"
                    : "Loan ends in",
            value:
                clears
                    ? emisText(point.afterMonths)
                    : formatDuration(keepEmi.totalMonths)
        })

    ].join("");

    /* ---- plain-language reading of the result ---- */

    const lines = [];

    if (clears) {

        lines.push(
            `Your prepayment is at least the ${rupees(point.balanceBefore)} still owed ${point.afterMonths === 0 ? "now" : `after EMI ${point.afterMonths}`}, so it would clear the loan. Only ${rupees(point.applied)} is needed. EMIs would stop ${point.afterMonths === 0 ? "straight away" : `after EMI ${point.afterMonths}`}, ${formatDuration(keepEmi.monthsSaved)} sooner than planned, and you would pay about ${rupees(keepEmi.interestSaved)} less interest. Lowering the EMI does not apply because no loan would remain.`
        );

    } else {

        lines.push(
            `If you keep your EMI at ${rupees(baseline.emi)}, the loan would end in about ${formatDuration(keepEmi.totalMonths)} instead of ${formatDuration(baseline.totalMonths)}, which is ${formatDuration(keepEmi.monthsSaved)} sooner, and you would pay about ${rupees(keepEmi.interestSaved)} less interest.`
        );

        lines.push(
            `If you keep the same end date instead, your EMI would fall from ${rupees(baseline.emi)} to about ${rupees(reduceEmi.emi)} (${rupees(reduceEmi.emiReduction)} less each month), and you would pay about ${rupees(reduceEmi.interestSaved)} less interest.`
        );

    }

    lines.push(
        `This prepayment is ${formatPercent(point.shareOfBalance * 100, 1)} of the balance at that point. Every ₹1 prepaid saves about ₹${formatNumber(result.savingPerRupee, 2)} in interest${clears ? "" : " if you keep your EMI"}.`
    );

    lines.push(
        `Estimated with the prepayment made ${timingText(point.afterMonths)}. Interest saved is before any prepayment charge or fee your lender may apply.`
    );

    /* ---- the comparison ---- */

    const cards = [

        comparisonCard({
            id: "prepay-c-base",
            title: "Without prepayment",
            tag: "Your loan as it is",
            rows: [
                ["EMI", rupees(baseline.emi)],
                ["Loan ends in", formatDuration(baseline.totalMonths)],
                ["Total interest", rupees(baseline.totalInterest)],
                ["Total you pay", rupees(baseline.totalRepayment)]
            ]
        }),

        comparisonCard({
            id: "prepay-c-keep",
            title: clears ? "Prepay and clear the loan" : "Prepay, keep your EMI",
            tag: clears ? "No EMIs after that" : "Finish sooner",
            rows: [
                ["EMI", clears ? "none after" : rupees(keepEmi.emi)],
                ["Loan ends in", formatDuration(keepEmi.totalMonths)],
                ["Total interest", rupees(keepEmi.totalInterest)],
                ["Total you pay", rupees(keepEmi.totalRepayment)],
                ["Time saved", formatDuration(keepEmi.monthsSaved)],
                ["Interest saved", rupees(keepEmi.interestSaved)]
            ]
        })

    ];

    if (reduceEmi) {

        cards.push(
            comparisonCard({
                id: "prepay-c-reduce",
                title: "Prepay, lower your EMI",
                tag: "Same end date",
                rows: [
                    ["EMI", rupees(reduceEmi.emi)],
                    ["Loan ends in", formatDuration(reduceEmi.totalMonths)],
                    ["Total interest", rupees(reduceEmi.totalInterest)],
                    ["Total you pay", rupees(reduceEmi.totalRepayment)],
                    ["EMI change", `${rupees(reduceEmi.emiReduction)} less`],
                    ["Interest saved", rupees(reduceEmi.interestSaved)]
                ]
            })
        );

    }

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        Your prepayment impact
                    </h2>

                </div>

                ${printSummary(result)}

                <div class="calculator-results__grid">
                    ${metrics}
                </div>

                <div class="calculator-results__summary">
                    ${lines.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <h3 class="prepay-subtitle">
                    Compared side by side
                </h3>

                <div class="prepay-compare">
                    ${cards.join("")}
                </div>

                ${scheduleSection(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const {
        prepaymentPoint: point,
        keepEmi
    } = result;

    return point.clearsLoan
        ? `This prepayment clears the loan and saves about ${rupees(keepEmi.interestSaved)} in interest.`
        : `Prepaying ${rupees(point.applied)} saves about ${rupees(keepEmi.interestSaved)} in interest and ends the loan ${formatDuration(keepEmi.monthsSaved)} sooner if you keep your EMI.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const result =
        calculatePrepayment({
            balance: DEFAULTS.balance,
            annualRate: DEFAULTS.rate,
            remainingMonths: DEFAULTS.years * 12 + DEFAULTS.months,
            prepayment: DEFAULTS.prepayment,
            afterMonths: DEFAULTS.after
        });

    const {
        baseline,
        keepEmi,
        reduceEmi
    } = result;

    return `Take a loan with ${rupees(DEFAULTS.balance)} outstanding, an interest rate of ${DEFAULTS.rate}% and ${DEFAULTS.years} years left. The EMI works out to about ${rupees(baseline.emi)}. A one-time prepayment of ${rupees(DEFAULTS.prepayment)} made right away would, if you keep the EMI, end the loan in ${formatDuration(keepEmi.totalMonths)} (${formatDuration(keepEmi.monthsSaved)} sooner) and save about ${rupees(keepEmi.interestSaved)} in interest. If you lower the EMI instead, the loan would still end in ${formatDuration(reduceEmi.totalMonths)}, the EMI would fall to about ${rupees(reduceEmi.emi)} and the interest saved would be about ${rupees(reduceEmi.interestSaved)}.`;

}


/* =========================================================
   RENDER
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Finance Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        See how much interest and time a
                        one-time prepayment could save on your
                        loan, and what it does to your EMI.
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


            <!-- CALCULATOR -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Estimate Your Prepayment Impact
                </div>

                <p class="calculator-section__description">
                    Enter what you owe today and the lump sum you
                    are thinking of paying. Results update as you type.
                </p>

                <form
                    id="prepay-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.balance,
                            label: "Outstanding Loan Balance",
                            unit: "₹",
                            hint: "The principal you still owe, as shown on your loan statement.",
                            min: PREPAYMENT_LIMITS.balance.min,
                            max: PREPAYMENT_LIMITS.balance.max,
                            step: 1000,
                            value: DEFAULTS.balance
                        })}


                        ${numberField({
                            id: IDS.rate,
                            label: "Interest Rate",
                            unit: "% a year",
                            hint: "Your loan's yearly rate. It is assumed to stay the same until the loan ends.",
                            min: PREPAYMENT_LIMITS.rate.min,
                            max: PREPAYMENT_LIMITS.rate.max,
                            step: 0.01,
                            value: DEFAULTS.rate
                        })}


                        <!-- REMAINING TENURE -->

                        <fieldset
                            class="prepay-tenure"
                            aria-describedby="prepay-tenure-hint"
                        >

                            <legend class="calculator-form__label">
                                Remaining Loan Tenure
                            </legend>

                            <div class="prepay-pair">

                                ${numberField({
                                    id: IDS.years,
                                    label: "Years",
                                    min: PREPAYMENT_LIMITS.years.min,
                                    max: PREPAYMENT_LIMITS.years.max,
                                    step: 1,
                                    value: DEFAULTS.years
                                })}

                                ${numberField({
                                    id: IDS.months,
                                    label: "Months",
                                    min: PREPAYMENT_LIMITS.months.min,
                                    max: PREPAYMENT_LIMITS.months.max,
                                    step: 1,
                                    value: DEFAULTS.months
                                })}

                            </div>

                            <span
                                class="calculator-form__help"
                                id="prepay-tenure-hint"
                            >
                                How long is left on the loan, for example 15 years and 6 months.
                            </span>

                        </fieldset>


                        ${numberField({
                            id: IDS.prepayment,
                            label: "Prepayment Amount",
                            unit: "₹",
                            hint: "The one-time lump sum you would pay towards the loan.",
                            min: PREPAYMENT_LIMITS.prepayment.min,
                            max: PREPAYMENT_LIMITS.prepayment.max,
                            step: 1000,
                            value: DEFAULTS.prepayment
                        })}


                        ${numberField({
                            id: IDS.after,
                            label: "Make the Prepayment After",
                            unit: "EMIs",
                            hint: "0 means right away, before your next EMI. 24 means after 24 more EMIs have been paid.",
                            min: 0,
                            step: 1,
                            value: DEFAULTS.after
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="prepay-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="prepay-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="prepay-live"
                class="prepay-sr-only"
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
                        Enter the loan balance you still owe and your
                        interest rate.
                    </li>
                    <li>
                        Enter how many years and months are left on the loan.
                    </li>
                    <li>
                        Enter the lump sum you would prepay, and when you
                        would pay it (0 means right away).
                    </li>
                    <li>
                        Read the result. It updates as you change any value.
                    </li>
                </ol>

            </section>


            <!-- WHAT IT ESTIMATES -->

            <section class="calculator-info">

                <h2>
                    Keep Your EMI or Lower It
                </h2>

                <p>
                    A prepayment lowers the amount you owe. What it
                    changes next depends on what happens to the EMI, so
                    the calculator shows both outcomes side by side.
                </p>

                <p>
                    <strong>Keep your EMI.</strong> You keep paying the
                    same EMI. With less left to repay, the loan ends
                    sooner and you pay less interest in total.
                </p>

                <p>
                    <strong>Lower your EMI.</strong> The loan still ends
                    on the same date, so the EMI is worked out again on
                    the smaller balance. Your monthly payment falls and
                    you also pay less interest, though not as much as when
                    you keep the EMI.
                </p>

                <p>
                    Which of these a lender offers, and how, depends on
                    the loan terms.
                </p>

            </section>


            <!-- ASSUMPTIONS -->

            <section class="calculator-info">

                <h2>
                    Assumptions and Why Your Lender's Figures May Differ
                </h2>

                <ul>
                    <li>
                        The EMI is worked out from your balance, rate and
                        remaining tenure. Your lender's EMI may differ slightly.
                    </li>
                    <li>
                        The rate stays the same for the rest of the loan.
                    </li>
                    <li>
                        Interest is charged every month on the balance
                        still owed, and each EMI is paid at the end of the month.
                    </li>
                    <li>
                        The prepayment is applied immediately after the EMI
                        you choose (0 means before your next EMI).
                    </li>
                    <li>
                        Prepayment charges, fees and taxes are not included.
                        Subtract any charge your lender applies from the
                        interest saved.
                    </li>
                    <li>
                        Real lenders can differ in payment dates, how often
                        interest is calculated, rounding and their own rules.
                    </li>
                </ul>

                <p>
                    These figures are estimates for understanding, not
                    financial advice. See the
                    <a href="${ROUTES.disclaimer}">disclaimer</a>.
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


            <!-- HOW IT WORKS -->

            <section class="calculator-info">

                <h2>
                    How the Estimate Is Calculated
                </h2>

                <p>
                    The EMI uses the standard formula:
                </p>

                <p>
                    EMI = P × r × (1 + r)<sup>n</sup>
                    ÷ ((1 + r)<sup>n</sup> − 1)
                </p>

                <p>
                    P is the balance, r is the monthly interest rate and n
                    is the number of months left. The prepayment lowers the
                    balance by its amount. If you keep the EMI, the
                    calculator steps through the loan month by month until
                    the balance reaches zero. If you lower the EMI, it
                    applies the same formula to the new balance and the
                    months left.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Why does a prepayment save interest?
                    </summary>
                    <p>
                        Interest is charged on the balance you still owe.
                        Paying part of that balance early means less is
                        left to charge interest on for the rest of the loan.
                    </p>
                </details>

                <details>
                    <summary>
                        What is the difference between keeping and lowering the EMI?
                    </summary>
                    <p>
                        Keeping the EMI ends the loan sooner. Lowering the
                        EMI keeps the end date and reduces what you pay
                        each month. Both reduce the interest, and keeping
                        the EMI reduces it by more.
                    </p>
                </details>

                <details>
                    <summary>
                        Does this include prepayment charges?
                    </summary>
                    <p>
                        No. Charges depend on your lender and loan terms,
                        so they are not included. Check your loan agreement
                        and subtract any charge from the interest saved.
                    </p>
                </details>

                <details>
                    <summary>
                        Why might my lender show different numbers?
                    </summary>
                    <p>
                        Lenders can differ in when a payment is posted, how
                        often interest is calculated, rounding and their
                        own rules. This calculator uses a standard monthly
                        model, so treat the result as an estimate.
                    </p>
                </details>

            </section>

        </div>
    `;

}


/* =========================================================
   RENDER
   Puts the markup into the mount and starts the tool. The
   site build already puts the markup in the generated page, so
   the shared tool page calls init() alone there.
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
   Binds the fields, the live results and reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#prepay-form");

    const results =
        document.querySelector("#prepay-results");

    const live =
        document.querySelector("#prepay-live");

    const resetButton =
        document.querySelector("#prepay-reset");

    if (!form || !results) {
        return;
    }

    const inputs =
        Object.fromEntries(
            Object.entries(IDS).map(
                ([name, id]) => [
                    name,
                    document.getElementById(id)
                ]
            )
        );

    const allInputs =
        Object.values(inputs);

    let announceTimer = null;

    /* the result on screen, so the schedule can change without recalculating */
    let shown = null;

    /*
     * One short sentence for screen readers, a moment after the
     * visitor stops typing, so it is not read out on every key.
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
                500
            );

    }

    function update(
        { speak = true } = {}
    ) {

        clearFieldsInvalid(
            allInputs,
            ERROR_ID
        );

        const raw =
            Object.fromEntries(
                Object.entries(inputs).map(
                    ([name, input]) => [
                        name,
                        input.value
                    ]
                )
            );

        /* a field that is still empty is not an error yet */

        if (
            Object.values(raw).some(
                value =>
                    String(value).trim() === ""
            )
        ) {

            shown = null;

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        const check =
            validatePrepaymentInputs(raw);

        if (!check.ok) {

            const names =
                new Set(
                    check.errors.flatMap(
                        error =>
                            error.fields
                    )
                );

            setFieldsInvalid(
                [...names].map(
                    name =>
                        inputs[name]
                ),
                ERROR_ID
            );

            const message =
                check.errors
                    .map(error => error.message)
                    .join(" ");

            shown = null;

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

        /* the latest allowed payment point depends on the tenure */

        inputs.after.max =
            String(
                check.values.remainingMonths - 1
            );

        const result =
            calculatePrepayment(check.values);

        shown = result;

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

    /*
     * Which schedule is shown, and whether the monthly rows are
     * open. Only the schedule is redrawn, so focus stays where the
     * visitor put it.
     */

    function redrawSchedule(
        focusSelector
    ) {

        const target =
            results.querySelector("#prepay-schedule-view");

        if (!shown || !target) {
            return;
        }

        target.innerHTML =
            scheduleView(shown);

        if (focusSelector) {
            results.querySelector(focusSelector)?.focus();
        }

    }

    results.addEventListener(
        "change",
        event => {

            if (event.target.name === "prepay-scenario") {

                view.scenario = event.target.value;

                redrawSchedule();

            }

        }
    );

    results.addEventListener(
        "click",
        event => {

            if (event.target.closest("#prepay-monthly-toggle")) {

                view.monthly = !view.monthly;

                redrawSchedule("#prepay-monthly-toggle");

            }

            if (event.target.closest("#prepay-csv") && shown) {

                const name =
                    downloadScheduleCsv(
                        shown,
                        currentScenario(shown)
                    );

                announce(`Downloaded ${name}`);

            }

            if (event.target.closest("#prepay-print")) {

                window.print();

            }

        }
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

            for (const [name, value] of Object.entries(DEFAULTS)) {
                inputs[name].value = value;
            }

            view.scenario = "keep";
            view.monthly = false;

            update({ speak: false });

            if (live) {
                clearTimeout(announceTimer);
                live.textContent = "";
            }

        }
    );

    /* the first result, without announcing it */

    update({ speak: false });

}
