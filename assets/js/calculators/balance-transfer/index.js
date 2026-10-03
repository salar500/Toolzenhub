/* =========================================================
   ToolZen Hub
   Loan Balance Transfer Calculator

   Shows whether moving a running loan to a lower rate pays off once
   the charges are counted, and when they are earned back. It also
   shows what the lower EMI really comes from: if the new loan runs
   longer, part of the "saving" is only the extra time, so the same
   comparison is shown over the current remaining tenure.

   The maths is in formulas/balance-transfer.js (pure, tested against
   an independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns the
   wording and the layout; the shared UI (ui/) only wires labels,
   hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateBalanceTransfer,
    validateBalanceTransferInputs,
    BALANCE_TRANSFER_LIMITS
} from "../formulas/balance-transfer.js";

import {
    formatINR,
    formatNumber,
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
   TITLE
   The title comes from the tool catalog. The copy and the rest
   of the content stay with the tool.
========================================================= */

const TITLE =
    getCalculatorById("balance-transfer").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    balance: "bt-balance",
    currentRate: "bt-current-rate",
    currentYears: "bt-current-years",
    currentMonths: "bt-current-months",
    newRate: "bt-new-rate",
    newYears: "bt-new-years",
    newMonths: "bt-new-months",
    currentCharges: "bt-current-charges",
    newCharges: "bt-new-charges"
};

const ERROR_ID =
    "bt-results-error";

const DEFAULTS = {
    balance: 2500000,
    currentRate: 9.5,
    currentYears: 15,
    currentMonths: 0,
    newRate: 8.5,
    newYears: 15,
    newMonths: 0,
    currentCharges: 0,
    newCharges: 15000
};

const EMPTY_MESSAGE =
    "Enter your loan details and the new offer to see whether switching pays off.";

const L = BALANCE_TRANSFER_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupees = formatINR;

function signedRupees(
    value
) {

    return value >= 0
        ? `+${rupees(value)}`
        : `−${rupees(-value)}`;

}

function monthsText(
    months
) {

    return formatDuration(months);

}


/* the verdict: how the net result is named, and what it says */

function verdict(
    result
) {

    const {
        decision: d,
        proposed
    } = result;

    const amount =
        rupees(Math.abs(d.netSaving));

    const charges =
        proposed.charges > 0
            ? `after ${rupees(proposed.charges)} of charges`
            : "with no charges";

    if (d.outcome === "saving") {

        return {
            label: "Potential saving",
            sentence:
                `Based on these inputs, switching may save about ${amount} overall, ${charges}.`
        };

    }

    if (d.outcome === "neutral") {

        return {
            label: "About the same",
            sentence:
                "Based on these inputs, switching would cost about the same overall (within ₹1)."
        };

    }

    return {
        label:
            d.lowerEmiHigherCost
                ? "Lower EMI, higher overall cost"
                : "Potential loss",
        sentence:
            `Based on these inputs, switching would cost about ${amount} more overall, ${charges}.`
    };

}

function breakEvenValue(
    breakEven
) {

    if (breakEven.kind === "immediate") {
        return "Immediately";
    }

    if (breakEven.kind === "months") {
        return monthsText(breakEven.month);
    }

    if (breakEven.kind === "never") {
        return "Not earned back";
    }

    return "Not applicable";

}

/* "month 11", or "month 12 (1 year)" once the month count is worth saying in years */

function monthLabel(
    month
) {

    return month >= 12
        ? `month ${month} (${monthsText(month)})`
        : `month ${month}`;

}

function breakEvenSentence(
    decision
) {

    const be = decision.breakEven;

    if (be.kind === "immediate") {
        return "There are no charges to earn back, so the lower payments help from the first month.";
    }

    if (be.kind === "months" && decision.outcome === "saving") {
        return `The charges are earned back by ${monthLabel(be.month)}; after that the new loan is ahead.`;
    }

    if (be.kind === "months") {
        return `The lower payments cover the charges by ${monthLabel(be.month)}, but the saving does not last: over the whole period the new loan costs more.`;
    }

    if (be.kind === "never") {
        return "The charges are never earned back over the life of the loans.";
    }

    return "There is no saving to earn the charges back from.";

}

function emiChangeValue(
    change
) {

    if (Math.abs(change) < 0.5) {
        return "Unchanged";
    }

    return change > 0
        ? `${rupees(change)} lower`
        : `${rupees(-change)} higher`;

}

function tenureChangeValue(
    months
) {

    if (months === 0) {
        return "Unchanged";
    }

    return months < 0
        ? `${formatDuration(-months)} longer`
        : `${formatDuration(months)} shorter`;

}

function breakEvenRateSentence(
    rate
) {

    if (rate.kind === "rate") {
        return `Switching pays off only if the new rate is below about ${formatNumber(rate.rate, 2)}% a year. That is the rate at which, with these charges and this tenure, the saving is exactly zero.`;
    }

    if (rate.kind === "none") {
        return "With these charges and this tenure, no rate in the calculator's range would earn the charges back.";
    }

    return "With this tenure, switching pays off at any rate in the calculator's range.";

}

function netText(
    netSaving
) {

    if (Math.abs(netSaving) < 1) {
        return "About the same";
    }

    return netSaving > 0
        ? `Saves ${rupees(netSaving)}`
        : `Costs ${rupees(-netSaving)} more`;

}


/* =========================================================
   RESULTS (HTML)
========================================================= */

function compareCard({
    id,
    title,
    tag,
    rows
}) {

    return `
                    <section
                        class="bt-compare__card"
                        aria-labelledby="${id}"
                    >

                        <h3
                            class="bt-compare__title"
                            id="${id}"
                        >
                            ${escapeHTML(title)}
                        </h3>

                        <p class="bt-compare__tag">
                            ${escapeHTML(tag)}
                        </p>

                        <dl class="bt-compare__list">
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

function yearlyTable(
    result
) {

    const label =
        "Year by year: what each loan costs and where you stand";

    return `
                <h3 class="bt-subtitle">
                    Year by year
                </h3>

                <p class="bt-note bt-note--plain">
                    Your position is what the current loan would have cost
                    you so far, minus what the new loan has cost you so far,
                    charges included. Below zero you are behind; above zero
                    you are ahead.
                </p>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}"
                >

                    <table class="calculator-results__table bt-table">

                        <caption class="bt-sr-only">
                            ${label}.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Year</th>
                                <th scope="col">Paid on current loan</th>
                                <th scope="col">Paid on new loan</th>
                                <th scope="col">Charges</th>
                                <th scope="col">Your position</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.yearly.map(
                                row => `
                            <tr>
                                <th scope="row">${row.year === 0 ? "At the switch" : `Year ${row.year}`}</th>
                                <td>${row.year === 0 ? "–" : rupees(row.paidCurrent)}</td>
                                <td>${row.year === 0 ? "–" : rupees(row.paidNew)}</td>
                                <td>${row.charges > 0 ? rupees(row.charges) : "–"}</td>
                                <td>${signedRupees(row.position)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="bt-note">
                    The last row is the end of the longer loan, so its
                    position is the overall saving or loss. Figures are
                    estimates and may differ from your lender's statements.
                </p>`;

}

function printSummary(
    result
) {

    const {
        input,
        proposed
    } = result;

    const rows = [
        ["Outstanding loan balance", rupees(input.balance)],
        ["Current loan", `${input.currentRate}% a year, ${formatDuration(input.currentMonths)} left`],
        ["New loan", `${input.newRate}% a year, ${formatDuration(input.newMonths)}`],
        ["One-time charges", `${rupees(proposed.charges)} (current lender ${rupees(input.currentCharges)}, new lender ${rupees(input.newCharges)})`]
    ];

    return `
                <div class="bt-print-only bt-print-summary">

                    <p class="bt-print-brand">
                        ToolZen Hub &middot; ${escapeHTML(TITLE)}
                    </p>

                    <dl class="bt-print-inputs">
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
        current,
        proposed,
        decision: d,
        sameTenure,
        breakEvenRate
    } = result;

    const said = verdict(result);

    const metrics = [

        resultMetric({
            label: said.label,
            value: rupees(Math.abs(d.netSaving)),
            primary: d.outcome === "saving"
        }),

        resultMetric({
            label: "Charges earned back",
            value: breakEvenValue(d.breakEven)
        }),

        resultMetric({
            label: "Monthly EMI",
            value: emiChangeValue(d.emiChange)
        }),

        resultMetric({
            label: "Loan tenure",
            value: tenureChangeValue(d.tenureChangeMonths)
        })

    ].join("");

    /* ---- the reading of the result ---- */

    const lines = [
        said.sentence,
        breakEvenSentence(d),
        `Your EMI would go from ${rupees(current.emi)} to about ${rupees(proposed.emi)}${Math.abs(d.emiChange) < 0.5 ? "" : ` (${rupees(Math.abs(d.emiChange))} ${d.emiChange > 0 ? "less" : "more"} each month)`}, and the loan would run for ${formatDuration(proposed.months)} instead of ${formatDuration(current.months)}.`,
        breakEvenRateSentence(breakEvenRate)
    ];

    let warning = "";

    if (d.lowerEmiHigherCost) {

        warning = `
                <div class="bt-note bt-note--warning">
                    <strong>Note: your monthly payment falls, but the overall cost rises.</strong>
                    ${escapeHTML(
                        d.longerTenure
                            ? ` The new loan runs ${formatDuration(-d.tenureChangeMonths)} longer, so you pay interest for more months. Part of the lower EMI comes from the longer tenure, not only from the lower rate.`
                            : " The charges are more than the lower rate saves, so the lower EMI does not pay for itself."
                    )}
                </div>`;

    }

    /* ---- the comparison ---- */

    const cards = [

        compareCard({
            id: "bt-c-current",
            title: "Current loan",
            tag: "If you stay",
            rows: [
                ["EMI", rupees(current.emi)],
                ["Time left", formatDuration(current.months)],
                ["Total interest", rupees(current.totalInterest)],
                ["Total you pay", rupees(current.totalOutgo)]
            ]
        }),

        compareCard({
            id: "bt-c-new",
            title: "New loan",
            tag: "If you switch",
            rows: [
                ["EMI", rupees(proposed.emi)],
                ["Tenure", formatDuration(proposed.months)],
                ["Total interest", rupees(proposed.totalInterest)],
                ["One-time charges", rupees(proposed.charges)],
                ["Total you pay", rupees(proposed.effectiveOutgo)]
            ]
        })

    ];

    if (sameTenure) {

        cards.push(
            compareCard({
                id: "bt-c-same",
                title: "New loan, same tenure",
                tag: `Fair check over ${formatDuration(sameTenure.months)}`,
                rows: [
                    ["EMI", rupees(sameTenure.emi)],
                    ["Overall", netText(sameTenure.netSaving)],
                    ["Charges earned back", breakEvenValue(sameTenure.breakEven)]
                ]
            })
        );

    }

    const sameLine = sameTenure
        ? `<p class="bt-note bt-note--plain">
                    Is it the rate or the tenure? Over the same ${escapeHTML(formatDuration(sameTenure.months))}, the lower rate on its own would ${sameTenure.netSaving >= 0 ? `save about ${escapeHTML(rupees(sameTenure.netSaving))}` : `cost about ${escapeHTML(rupees(-sameTenure.netSaving))} more`}. With the tenure you chose, the result is ${d.netSaving >= 0 ? `a saving of about ${escapeHTML(rupees(d.netSaving))}` : `a cost of about ${escapeHTML(rupees(-d.netSaving))} more`}. The difference between the two comes from changing the tenure.
                </p>`
        : "";

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        Your balance transfer estimate
                    </h2>

                </div>

                ${printSummary(result)}

                <div class="calculator-results__grid">
                    ${metrics}
                </div>

                ${warning}

                <div class="calculator-results__summary">
                    ${lines.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <h3 class="bt-subtitle">
                    Compared side by side
                </h3>

                <div class="bt-compare">
                    ${cards.join("")}
                </div>

                ${sameLine}

                ${yearlyTable(result)}

                <div class="bt-actions">

                    <button
                        type="button"
                        id="bt-print"
                        class="calculator-form__button calculator-form__button--secondary bt-action"
                    >
                        Print Summary
                    </button>

                </div>

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const d = result.decision;

    const amount =
        rupees(Math.abs(d.netSaving));

    if (d.outcome === "saving") {
        return `Switching may save about ${amount} overall. ${breakEvenSentence(d)}`;
    }

    if (d.outcome === "neutral") {
        return "Switching would cost about the same overall.";
    }

    return `Switching would cost about ${amount} more overall.${d.lowerEmiHigherCost ? " The monthly payment falls, but the overall cost rises." : ""}`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default values, so the page can never disagree with it. The
   second part changes only the tenure of the new loan.
========================================================= */

function exampleValues(
    over = {}
) {

    return {
        balance: DEFAULTS.balance,
        currentRate: DEFAULTS.currentRate,
        currentMonths: DEFAULTS.currentYears * 12 + DEFAULTS.currentMonths,
        newRate: DEFAULTS.newRate,
        newMonths: DEFAULTS.newYears * 12 + DEFAULTS.newMonths,
        currentCharges: DEFAULTS.currentCharges,
        newCharges: DEFAULTS.newCharges,
        ...over
    };

}

function exampleParagraph() {

    const base =
        calculateBalanceTransfer(exampleValues());

    const longer =
        calculateBalanceTransfer(
            exampleValues({
                newMonths: (DEFAULTS.newYears + 5) * 12
            })
        );

    return `Take a loan with ${rupees(DEFAULTS.balance)} outstanding, ${DEFAULTS.currentRate}% interest and ${DEFAULTS.currentYears} years left, so the EMI is about ${rupees(base.current.emi)}. A new lender offers ${DEFAULTS.newRate}% for the same ${DEFAULTS.newYears} years with ${rupees(DEFAULTS.newCharges)} of charges. The EMI falls to about ${rupees(base.proposed.emi)}, the charges are earned back by month ${base.decision.breakEven.month}, and over the whole loan switching may save about ${rupees(base.decision.netSaving)}. If the same offer ran for ${DEFAULTS.newYears + 5} years instead, the EMI would fall further, to about ${rupees(longer.proposed.emi)}, but you would pay interest for five more years and switching would cost about ${rupees(-longer.decision.netSaving)} more overall.`;

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
                        See whether moving your loan to a lower rate
                        pays off after the charges, and when you earn
                        them back.
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
                    Estimate Whether Switching Pays Off
                </div>

                <p class="calculator-section__description">
                    Enter your running loan, the new lender's offer and
                    the charges you were quoted. Results update as you type.
                </p>

                <form
                    id="bt-form"
                    class="calculator-form"
                    novalidate
                >

                    <!-- CURRENT LOAN -->

                    <fieldset class="bt-group">

                        <legend class="bt-group__title">
                            Your current loan
                        </legend>

                        <div class="calculator-form__grid">

                            ${numberField({
                                id: IDS.balance,
                                label: "Outstanding Loan Balance",
                                unit: "₹",
                                hint: "The principal you still owe, as shown on your loan statement.",
                                min: L.balance.min,
                                max: L.balance.max,
                                step: 1000,
                                value: DEFAULTS.balance
                            })}

                            ${numberField({
                                id: IDS.currentRate,
                                label: "Current Interest Rate",
                                unit: "% a year",
                                hint: "Your loan's yearly rate. It is assumed to stay the same until the loan ends.",
                                min: L.rate.min,
                                max: L.rate.max,
                                step: 0.01,
                                value: DEFAULTS.currentRate
                            })}

                            ${tenureFields({
                                legend: "Remaining Loan Tenure",
                                hintId: "bt-current-tenure-hint",
                                hint: "How long is left on the loan, for example 15 years and 6 months.",
                                yearsId: IDS.currentYears,
                                monthsId: IDS.currentMonths,
                                years: DEFAULTS.currentYears,
                                months: DEFAULTS.currentMonths
                            })}

                        </div>

                    </fieldset>


                    <!-- NEW LOAN -->

                    <fieldset class="bt-group">

                        <legend class="bt-group__title">
                            The new offer
                        </legend>

                        <div class="calculator-form__grid">

                            ${numberField({
                                id: IDS.newRate,
                                label: "New Interest Rate",
                                unit: "% a year",
                                hint: "The rate the new lender offers. It is assumed to stay the same until the loan ends.",
                                min: L.rate.min,
                                max: L.rate.max,
                                step: 0.01,
                                value: DEFAULTS.newRate
                            })}

                            ${tenureFields({
                                legend: "New Loan Tenure",
                                hintId: "bt-new-tenure-hint",
                                hint: "It starts as your remaining tenure. Change it if the new lender offers a different one.",
                                yearsId: IDS.newYears,
                                monthsId: IDS.newMonths,
                                years: DEFAULTS.newYears,
                                months: DEFAULTS.newMonths
                            })}

                        </div>

                    </fieldset>


                    <!-- CHARGES -->

                    <fieldset class="bt-group">

                        <legend class="bt-group__title">
                            One-time charges
                        </legend>

                        <div class="calculator-form__grid">

                            ${numberField({
                                id: IDS.currentCharges,
                                label: "Charges at Your Current Lender",
                                unit: "₹",
                                hint: "What your current lender asks to close the loan early. Enter 0 if none.",
                                min: L.charges.min,
                                max: L.charges.max,
                                step: 100,
                                value: DEFAULTS.currentCharges
                            })}

                            ${numberField({
                                id: IDS.newCharges,
                                label: "New Lender's Fees and Charges",
                                unit: "₹",
                                hint: "Processing, legal and valuation fees and taxes, as quoted. Assumed paid up front.",
                                min: L.charges.min,
                                max: L.charges.max,
                                step: 100,
                                value: DEFAULTS.newCharges
                            })}

                        </div>

                    </fieldset>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="bt-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="bt-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="bt-live"
                class="bt-sr-only"
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
                        Enter the balance, rate and time left on your current loan.
                    </li>
                    <li>
                        Enter the new lender's rate and the tenure it offers.
                        The tenure starts as your remaining tenure.
                    </li>
                    <li>
                        Enter the charges you were quoted, or 0 if there are none.
                    </li>
                    <li>
                        Read the result. It updates as you change any value.
                    </li>
                </ol>

            </section>


            <!-- WHY THE RATE IS NOT ENOUGH -->

            <section class="calculator-info">

                <h2>
                    Why the Rate Is Only Part of the Answer
                </h2>

                <p>
                    A lower rate does not always mean a cheaper loan. Three
                    things decide it, and the calculator shows each of them.
                </p>

                <p>
                    <strong>The charges.</strong> They are paid up front, so
                    you start behind. The switch only pays off once the lower
                    payments have earned them back. That point is the
                    break-even.
                </p>

                <p>
                    <strong>The time left.</strong> The fewer years remain,
                    the less interest there is to save, so the same charges
                    take longer to earn back.
                </p>

                <p>
                    <strong>The new tenure.</strong> If the new loan runs
                    longer, the EMI falls partly because you pay for more
                    months. That can lower your payment and still raise the
                    total cost, so the calculator also compares the offer over
                    your current remaining tenure.
                </p>

            </section>


            <!-- ASSUMPTIONS -->

            <section class="calculator-info">

                <h2>
                    Assumptions and Why Your Lender's Figures May Differ
                </h2>

                <ul>
                    <li>
                        Both rates stay the same until their loan ends.
                        Introductory, stepped or changing rates are not modelled.
                    </li>
                    <li>
                        The EMI is worked out from the balance, rate and tenure
                        you enter. Your lender's EMI may differ slightly.
                    </li>
                    <li>
                        The charges are the amounts you enter. They are paid up
                        front, not added to the loan. No charge is assumed:
                        whether one applies depends on your loan and lender.
                    </li>
                    <li>
                        The switch happens now, before your next EMI.
                    </li>
                    <li>
                        Real lenders can differ in payment dates, how often
                        interest is calculated, rounding and their own rules.
                    </li>
                </ul>

                <p>
                    These figures are estimates for understanding, not
                    financial advice, and the calculator does not recommend
                    switching lenders. See the
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
                    Each loan's EMI uses the standard formula:
                </p>

                <p>
                    EMI = P × r × (1 + r)<sup>n</sup>
                    ÷ ((1 + r)<sup>n</sup> − 1)
                </p>

                <p>
                    P is the balance, r is the monthly interest rate and n is
                    the number of months. What you would pay on the current
                    loan is its EMI times its months. What you would pay on the
                    new loan is its EMI times its months, plus the charges.
                    The difference is the saving or loss.
                </p>

                <p>
                    Your position after a month is what the current loan would
                    have cost so far, minus what the new loan has cost so far,
                    minus the charges. It starts at minus the charges. The
                    break-even is the first month it is back at zero or above.
                    The break-even rate is the new rate at which the overall
                    saving is exactly zero.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What counts as charges?
                    </summary>
                    <p>
                        Whatever you would pay to make the switch: what your
                        current lender asks to close the loan early, and the new
                        lender's processing, legal and valuation fees and taxes.
                        Enter the amounts you were quoted, or 0 for any that do
                        not apply. The calculator does not know any lender's rules.
                    </p>
                </details>

                <details>
                    <summary>
                        Why can a lower EMI cost more overall?
                    </summary>
                    <p>
                        If the new loan runs longer, you pay interest for more
                        months. The monthly payment falls, but the extra months
                        and the charges can add up to more than the lower rate
                        saves. The comparison over your current remaining tenure
                        shows what the rate alone would do.
                    </p>
                </details>

                <details>
                    <summary>
                        What is the break-even?
                    </summary>
                    <p>
                        It is the first month in which the payments you have
                        saved add up to at least the charges you paid up front.
                        Before it you are behind; after it you are ahead,
                        as long as the new loan stays cheaper.
                    </p>
                </details>

                <details>
                    <summary>
                        Why might my lender show different numbers?
                    </summary>
                    <p>
                        Lenders can differ in when a payment is posted, how
                        often interest is calculated, rounding, fees and their
                        own rules. This calculator uses a standard monthly
                        model, so treat the result as an estimate.
                    </p>
                </details>

            </section>

        </div>
    `;

}


/* two number fields (years and months) that make up one tenure */

function tenureFields({
    legend,
    hintId,
    hint,
    yearsId,
    monthsId,
    years,
    months
}) {

    return `
                            <fieldset
                                class="bt-tenure"
                                aria-describedby="${hintId}"
                            >

                                <legend class="calculator-form__label">
                                    ${legend}
                                </legend>

                                <div class="bt-pair">

                                    ${numberField({
                                        id: yearsId,
                                        label: "Years",
                                        min: L.years.min,
                                        max: L.years.max,
                                        step: 1,
                                        value: years
                                    })}

                                    ${numberField({
                                        id: monthsId,
                                        label: "Months",
                                        min: L.months.min,
                                        max: L.months.max,
                                        step: 1,
                                        value: months
                                    })}

                                </div>

                                <span
                                    class="calculator-form__help"
                                    id="${hintId}"
                                >
                                    ${hint}
                                </span>

                            </fieldset>`;

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
   Binds the fields, the live results, reset and print.
========================================================= */

export function init() {

    const form =
        document.querySelector("#bt-form");

    const results =
        document.querySelector("#bt-results");

    const live =
        document.querySelector("#bt-live");

    const resetButton =
        document.querySelector("#bt-reset");

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

    /*
     * The new loan's tenure follows the remaining tenure until the
     * visitor changes it themselves.
     */
    let newTenureEdited = false;

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

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        const check =
            validateBalanceTransferInputs(raw);

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

        const result =
            calculateBalanceTransfer(check.values);

        results.innerHTML =
            renderResults(result);

        if (speak) {
            announce(liveSummary(result));
        }

    }

    form.addEventListener(
        "input",
        event => {

            const id = event.target.id;

            if (
                id === IDS.newYears ||
                id === IDS.newMonths
            ) {

                newTenureEdited = true;

            } else if (
                (id === IDS.currentYears ||
                    id === IDS.currentMonths) &&
                !newTenureEdited
            ) {

                inputs.newYears.value = inputs.currentYears.value;
                inputs.newMonths.value = inputs.currentMonths.value;

            }

            update();

        }
    );

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
        }
    );

    results.addEventListener(
        "click",
        event => {

            if (event.target.closest("#bt-print")) {

                window.print();

            }

        }
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const [name, value] of Object.entries(DEFAULTS)) {
                inputs[name].value = value;
            }

            newTenureEdited = false;

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
