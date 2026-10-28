/* =========================================================
   ToolZen Hub
   EMI Calculator 2.0

   What it does
     Finds one of three things for a reducing-balance loan:
     the monthly EMI (the original job), how long a loan takes to
     repay at an EMI you choose, or the interest rate an EMI
     implies. The result appears as soon as the numbers are
     complete and valid (no Calculate button); a yearly summary
     and a monthly schedule follow the result.

   Conventions (shared with the rest of the Loans tools)
     Monthly rate = annual rate / 12, interest on the balance at
     the start of the month, payment at the end of the month, fixed
     rate, no fees, insurance or taxes. The EMI formula and the
     schedule come from formulas/loan.js; the two reverse questions
     from formulas/emi-solve.js. Nothing here changes either.

   How the page behaves
     - An empty field gives a neutral prompt, not an error.
     - A value that is invalid while its field still has focus is
       not reported yet; it is reported when the field is left.
       The previous result is removed while the inputs cannot be
       used, so a figure never sits beside inputs it was not
       calculated from.
     - One short sentence is announced to screen readers a moment
       after typing stops (never per key); an update never moves
       focus.
     - No storage, no address-bar state, no network. Every value
       is escaped or set as text.
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../formulas/loan.js";

import {
    payoffSchedule,
    rateForEmi,
    yearlySummary,
    MAX_PAYMENTS
} from "../formulas/emi-solve.js";

import {
    formatINR as formatCurrency
} from "../common/formatter.js";

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

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    SITE_ROOT
} from "../../routes.js";


/* =========================================================
   IDENTITY

   Title (and the headings derived from it) come from the
   calculator catalog, the single source of tool identity.
   Intro copy and the rest of the content stay with the tool.
========================================================= */

const TITLE =
    getCalculatorById("emi").title;

const ERROR_ID =
    "emi-results-error";

const MODE_NAME =
    "emi-mode";

const MODES = {
    emi: "Find the EMI",
    tenure: "Find the tenure",
    rate: "Find the rate"
};

const DEFAULTS = {
    mode: "emi",
    loan: 1000000,
    rate: 8.5,
    years: 20,
    payment: 10000
};

/*
 * The inputs. `modes` are the modes that need the field; the
 * bounds are the ones the form has always had, except that the
 * rate may be 0 (a zero-interest loan) and the loan amount and
 * tenure need not be round numbers.
 */
const FIELDS = {
    loan: {
        id: "emi-loan",
        name: "The loan amount",
        modes: ["emi", "tenure", "rate"],
        min: 1000,
        max: 100000000,
        bounds: "between ₹1,000 and ₹10,00,00,000"
    },
    rate: {
        id: "emi-rate",
        name: "The interest rate",
        modes: ["emi", "tenure"],
        min: 0,
        max: 30,
        bounds: "between 0% and 30%"
    },
    years: {
        id: "emi-years",
        name: "The loan tenure",
        modes: ["emi", "rate"],
        min: 1,
        max: 40,
        bounds: "between 1 and 40 years"
    },
    payment: {
        id: "emi-payment",
        name: "The monthly EMI",
        modes: ["tenure", "rate"],
        min: 1,
        max: 100000000,
        bounds: "between ₹1 and ₹10,00,00,000"
    }
};

const EMPTY_MESSAGE = {
    emi: "Enter the loan amount, the interest rate and the tenure to see your EMI.",
    tenure: "Enter the loan amount, the interest rate and the EMI you can pay to see how long it takes.",
    rate: "Enter the loan amount, the tenure and the EMI to see the interest rate."
};

/*
 * Starting values for the loan amount and tenure. They set no
 * rate and are only examples: a lender's rate and fees decide the
 * real EMI.
 */
const STARTING_VALUES = [
    ["Home loan", 5000000, 20],
    ["Personal loan", 500000, 3],
    ["Car loan", 800000, 5],
    ["Education loan", 1000000, 7]
];

const rupees2 =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const money2 =
    value => rupees2.format(value);

const plural =
    (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* 93 months -> "7 years 9 months" */
function formatMonths(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (years === 0) {
        return plural(rest, "month");
    }
    return rest === 0
        ? plural(years, "year")
        : `${plural(years, "year")} ${plural(rest, "month")}`;
}

/* a rate to two decimals without a trailing zero pair: 9 -> "9", 9.004 -> "9" , 9.5 -> "9.5", 9.456 -> "9.46" */
function formatRate(rate) {
    return String(Number(rate.toFixed(2)));
}


/* =========================================================
   RENDER
========================================================= */

function modeControl() {

    return `
                    <fieldset
                        class="emi-mode"
                        aria-describedby="emi-mode-hint"
                    >

                        <legend class="calculator-form__label">
                            What do you want to find?
                        </legend>

                        <div class="emi-mode__options">
                            ${Object.entries(MODES).map(
                                ([value, label]) => `
                            <label class="emi-mode__option">
                                <input
                                    type="radio"
                                    name="${MODE_NAME}"
                                    value="${value}"${value === DEFAULTS.mode ? " checked" : ""}
                                >
                                <span>${escapeHTML(label)}</span>
                            </label>`
                            ).join("")}
                        </div>

                        <span
                            class="calculator-form__help"
                            id="emi-mode-hint"
                        >
                            Find the EMI: I know the loan. Find the tenure: I know the EMI I can pay. Find the rate: I know the EMI I am quoted.
                        </span>

                    </fieldset>`;

}

function fieldWrap(key, control) {

    const modes = FIELDS[key].modes;
    const hidden = modes.includes(DEFAULTS.mode) ? "" : " hidden";

    return `
                        <div class="emi-field" data-modes="${modes.join(" ")}"${hidden}>
                            ${control}
                        </div>`;

}

function startingValues() {

    return `
                    <div
                        class="emi-start"
                        role="group"
                        aria-labelledby="emi-start-label"
                    >
                        <span class="calculator-form__label" id="emi-start-label">
                            Try a starting value
                        </span>
                        <div class="emi-start__buttons">
                            ${STARTING_VALUES.map(
                                ([label, loan, years], index) => `
                            <button
                                type="button"
                                class="calculator-form__button calculator-form__button--secondary emi-start__button"
                                data-start="${index}"
                            >${escapeHTML(label)}</button>`
                            ).join("")}
                        </div>
                        <span class="calculator-form__help">
                            These set only the loan amount and the tenure, as examples. Your lender's rate and fees decide the real EMI.
                        </span>
                    </div>`;

}

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
                        Calculate your monthly EMI,
                        total interest and total
                        repayment for any loan, or work out
                        how long a loan takes to repay
                        and the interest rate an EMI implies.
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
                            No sign-up required • Instant results
                        </span>

                    </div>

                </div>

            </section>


            <!-- CALCULATOR -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Calculate Your EMI
                </div>

                <p class="calculator-section__description">
                    Choose what you want to find and enter the
                    loan details. The result updates as you type.
                </p>


                <form
                    id="emi-form"
                    class="calculator-form"
                    novalidate
                >

                    ${modeControl()}

                    <div class="calculator-form__grid">

                        ${fieldWrap("loan", numberField({
                            id: FIELDS.loan.id,
                            label: "Loan Amount",
                            unit: "₹",
                            hint: "Enter the total loan amount.",
                            min: FIELDS.loan.min,
                            max: FIELDS.loan.max,
                            step: "any",
                            value: DEFAULTS.loan
                        }))}

                        ${fieldWrap("rate", numberField({
                            id: FIELDS.rate.id,
                            label: "Interest Rate",
                            unit: "%",
                            hint: "Enter the annual interest rate.",
                            min: FIELDS.rate.min,
                            max: FIELDS.rate.max,
                            step: 0.01,
                            value: DEFAULTS.rate
                        }))}

                        ${fieldWrap("years", numberField({
                            id: FIELDS.years.id,
                            label: "Loan Tenure",
                            unit: "Years",
                            hint: "Enter the repayment period.",
                            min: FIELDS.years.min,
                            max: FIELDS.years.max,
                            step: "any",
                            value: DEFAULTS.years
                        }))}

                        ${fieldWrap("payment", numberField({
                            id: FIELDS.payment.id,
                            label: "Monthly EMI",
                            unit: "₹",
                            hint: "The fixed amount you pay every month.",
                            min: FIELDS.payment.min,
                            max: FIELDS.payment.max,
                            step: "any",
                            value: DEFAULTS.payment
                        }))}

                    </div>

                    ${startingValues()}

                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="emi-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="emi-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE[DEFAULTS.mode])}
            </section>

            <p
                id="emi-live"
                class="emi-sr-only"
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
                        Choose what you want to find: the monthly EMI,
                        the loan tenure or the interest rate.
                    </li>
                    <li>
                        Enter the loan details the page asks for.
                    </li>
                    <li>
                        The result appears as soon as the numbers
                        are complete and changes when you change one.
                    </li>
                    <li>
                        Open the repayment schedule to see how each
                        payment splits into principal and interest.
                    </li>
                </ol>

            </section>


            <!-- HOW IT WORKS -->

            <section class="calculator-info">

                <h2>
                    How EMI Is Calculated
                </h2>

                <p>
                    EMI is calculated using the loan amount,
                    monthly interest rate and total number
                    of monthly payments.
                </p>

                <p>
                    The standard EMI formula is:
                </p>

                <p>
                    EMI = P × r × (1 + r)<sup>n</sup>
                    ÷ ((1 + r)<sup>n</sup> − 1)
                </p>

                <p>
                    Where P is the principal loan amount,
                    r is the monthly interest rate and
                    n is the total number of monthly payments.
                </p>

                <p>
                    The monthly rate is the annual rate divided by 12,
                    interest for a month is charged on the balance at the
                    start of that month, and the payment is made at the end
                    of it. To find the tenure, the page steps through the
                    months with the EMI you enter until the balance is
                    cleared; the last payment is whatever is left. To find
                    the rate, it searches for the rate at which that EMI
                    repays the loan over the tenure. Fees, insurance and
                    taxes are not included, and a lender's own figures may
                    differ.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What is EMI?
                    </summary>
                    <p>
                        EMI stands for Equated Monthly
                        Instalment. It is the fixed amount
                        generally paid every month toward
                        a loan.
                    </p>
                </details>

                <details>
                    <summary>
                        Does a higher loan tenure reduce EMI?
                    </summary>
                    <p>
                        A longer tenure generally reduces
                        the monthly EMI but can increase
                        the total interest paid over the
                        life of the loan.
                    </p>
                </details>

                <details>
                    <summary>
                        What does the EMI include?
                    </summary>
                    <p>
                        The EMI generally consists of both
                        principal repayment and interest.
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
   RESULTS
   Each builder returns { html, announcement, summary } for one
   outcome. `summary` is the plain text the Copy button copies.
========================================================= */

const ASSUMPTION =
    "This is an estimate. It assumes a fixed rate on a reducing balance, with each payment made at the end of the month; fees, insurance and taxes are not included, and a lender's figures may differ.";

function nextSteps() {

    return `
                <p class="emi-next">
                    Next:
                    <a href="${SITE_ROOT}calculators/prepayment/">see what a part-payment would save</a>
                    or
                    <a href="${SITE_ROOT}calculators/loan-comparison/">compare two loans</a>.
                </p>`;

}

function card(title, metrics, sentence, rows, summaryText) {

    const schedule = rows && rows.length ? scheduleMarkup(rows) : "";

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">
                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>
                    <h2 class="calculator-results__title">
                        ${escapeHTML(title)}
                    </h2>
                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${sentence}
                </div>

                <p class="emi-assumption">
                    ${escapeHTML(ASSUMPTION)}
                </p>

                <div class="emi-actions">
                    <button
                        type="button"
                        id="emi-copy"
                        class="calculator-form__button calculator-form__button--secondary"
                    >
                        Copy summary
                    </button>
                    <span class="emi-copy-note" id="emi-copy-note"></span>
                </div>

                ${nextSteps()}

                ${schedule}

            </div>
        `;

}

function scheduleMarkup(rows) {

    const years = yearlySummary(rows);
    const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
    const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);

    return `
                <section class="emi-schedule" aria-labelledby="emi-schedule-title">

                    <h3 id="emi-schedule-title">
                        Repayment schedule
                    </h3>

                    <div class="calculator-results__table-wrapper" role="region" aria-label="Yearly repayment summary" tabindex="0">
                        <table class="calculator-results__table emi-table">
                            <caption>Yearly summary</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Year</th>
                                    <th scope="col">Principal paid</th>
                                    <th scope="col">Interest paid</th>
                                    <th scope="col">Balance at year end</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${years.map(year => `
                                <tr>
                                    <th scope="row">${year.year}</th>
                                    <td>${money2(year.principal)}</td>
                                    <td>${money2(year.interest)}</td>
                                    <td>${money2(year.balance)}</td>
                                </tr>`).join("")}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th scope="row">Total</th>
                                    <td>${money2(totalPrincipal)}</td>
                                    <td>${money2(totalInterest)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <details class="emi-monthly" id="emi-monthly">
                        <summary>
                            Monthly schedule (${plural(rows.length, "payment")})
                        </summary>
                        <div id="emi-monthly-body"></div>
                    </details>

                    <p class="emi-note">
                        Rows are rounded to the paisa for display. Totals are added from the unrounded amounts, so a column can differ by a paisa or two from the rows shown.
                    </p>

                </section>`;

}

function monthlyRowsMarkup(rows) {

    return `
                        <div class="calculator-results__table-wrapper" role="region" aria-label="Monthly repayment schedule" tabindex="0">
                            <table class="calculator-results__table emi-table">
                                <caption>Monthly schedule</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Payment</th>
                                        <th scope="col">EMI</th>
                                        <th scope="col">Principal</th>
                                        <th scope="col">Interest</th>
                                        <th scope="col">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(row => `
                                    <tr>
                                        <th scope="row">${row.month}</th>
                                        <td>${money2(row.emi)}</td>
                                        <td>${money2(row.principal)}</td>
                                        <td>${money2(row.interest)}</td>
                                        <td>${money2(row.balance)}</td>
                                    </tr>`).join("")}
                                </tbody>
                            </table>
                        </div>`;

}

function summaryText(lines) {

    return [
        "EMI estimate",
        ...lines,
        "Estimate on a reducing balance, fixed rate, payment at the end of each month; fees, insurance and taxes are not included. A lender's figures may differ.",
        "ToolZen Hub EMI Calculator"
    ].join("\n");

}

function resultForEmi({ loan, rate, years }) {

    const emi = calculateEMI(loan, rate, years);
    const totalRepayment = calculateTotalRepayment(loan, rate, years);
    const totalInterest = calculateTotalInterest(loan, rate, years);
    const principalShare = Math.round((loan / totalRepayment) * 100);

    const sentence = `
                    For a loan of
                    <strong>${formatCurrency(loan)}</strong>
                    at
                    <strong>${rate}%</strong>
                    annual interest for
                    <strong>${years} years</strong>,
                    your estimated monthly EMI is
                    <strong>${formatCurrency(emi)}</strong>.`;

    const rows = calculateAmortization(loan, rate, years);

    return {
        html: card("EMI Calculation", [
            resultMetric({ label: "Monthly EMI", value: formatCurrency(emi), primary: true }),
            resultMetric({ label: "Total Interest", value: formatCurrency(totalInterest) }),
            resultMetric({ label: "Total Repayment", value: formatCurrency(totalRepayment) }),
            resultMetric({ label: "Loan Tenure", value: `${years} years` }),
            resultMetric({ label: "Principal share of repayment", value: `${principalShare}%` })
        ], sentence, rows),
        rows,
        announcement: `Monthly EMI ${formatCurrency(emi)}. Total interest ${formatCurrency(totalInterest)}. Total repayment ${formatCurrency(totalRepayment)}.`,
        summary: summaryText([
            `Loan amount: ${formatCurrency(loan)}`,
            `Interest rate: ${rate}% a year`,
            `Tenure: ${years} years`,
            `Monthly EMI: ${formatCurrency(emi)}`,
            `Total interest: ${formatCurrency(totalInterest)}`,
            `Total repayment: ${formatCurrency(totalRepayment)}`
        ])
    };

}

function noticeMarkup(message) {

    return `
            <div class="calculator-results__card">
                <div class="calculator-results__summary" role="note">
                    ${escapeHTML(message)}
                </div>
            </div>`;

}

function resultForTenure({ loan, rate, payment }) {

    const plan = payoffSchedule(loan, rate, payment);

    if (plan.state === "non-amortizing") {
        const message = `An EMI of ${formatCurrency(payment)} does not repay this loan: the first month's interest alone is ${formatCurrency(plan.firstInterest)}, so the balance would never fall. Enter an EMI above ${formatCurrency(plan.firstInterest)}.`;
        return { html: noticeMarkup(message), announcement: message, summary: "" };
    }

    if (plan.state === "beyond-horizon") {
        const message = `At an EMI of ${formatCurrency(payment)} this loan would take more than ${MAX_PAYMENTS / 12} years to repay. Try a higher EMI.`;
        return { html: noticeMarkup(message), announcement: message, summary: "" };
    }

    const time = formatMonths(plan.payments);

    const sentence = `
                    A loan of
                    <strong>${formatCurrency(loan)}</strong>
                    at
                    <strong>${rate}%</strong>
                    annual interest, repaid with
                    <strong>${formatCurrency(payment)}</strong>
                    a month, takes about
                    <strong>${time}</strong>
                    (${plural(plan.payments, "payment")}). The last payment is
                    <strong>${formatCurrency(plan.lastPayment)}</strong>.`;

    return {
        html: card("Loan Tenure", [
            resultMetric({ label: "Time to repay", value: time, primary: true }),
            resultMetric({ label: "Number of payments", value: String(plan.payments) }),
            resultMetric({ label: "Last payment", value: formatCurrency(plan.lastPayment) }),
            resultMetric({ label: "Total Interest", value: formatCurrency(plan.totalInterest) }),
            resultMetric({ label: "Total Repayment", value: formatCurrency(plan.totalPayment) })
        ], sentence, plan.rows),
        rows: plan.rows,
        announcement: `Time to repay ${time}, ${plural(plan.payments, "payment")}. Total interest ${formatCurrency(plan.totalInterest)}.`,
        summary: summaryText([
            `Loan amount: ${formatCurrency(loan)}`,
            `Interest rate: ${rate}% a year`,
            `Monthly EMI: ${formatCurrency(payment)}`,
            `Time to repay: ${time} (${plural(plan.payments, "payment")}), last payment ${formatCurrency(plan.lastPayment)}`,
            `Total interest: ${formatCurrency(plan.totalInterest)}`,
            `Total repayment: ${formatCurrency(plan.totalPayment)}`
        ])
    };

}

function resultForRate({ loan, years, payment }) {

    const months = Math.round(years * 12);
    const solved = rateForEmi(loan, months, payment);

    if (solved.state === "too-low") {
        const message = `An EMI of ${formatCurrency(payment)} for ${years} years repays ${formatCurrency(payment * months)} in total, which is less than the loan of ${formatCurrency(loan)}, so no interest rate can fit. Enter a higher EMI.`;
        return { html: noticeMarkup(message), announcement: message, summary: "" };
    }

    if (solved.state !== "ok") {
        const message = `No interest rate this page can show fits a loan of ${formatCurrency(loan)} over ${years} years with an EMI of ${formatCurrency(payment)}. Check the three numbers.`;
        return { html: noticeMarkup(message), announcement: message, summary: "" };
    }

    const total = payment * months;
    const interest = total - loan;
    const rateText = `${formatRate(solved.annualRate)}%`;
    const plan = payoffSchedule(loan, solved.annualRate, payment);

    const sentence = `
                    A loan of
                    <strong>${formatCurrency(loan)}</strong>
                    over
                    <strong>${years} years</strong>
                    with a monthly EMI of
                    <strong>${formatCurrency(payment)}</strong>
                    works out to about
                    <strong>${rateText}</strong>
                    a year.`;

    return {
        html: card("Interest Rate", [
            resultMetric({ label: "Interest rate", value: `${rateText} a year`, primary: true }),
            resultMetric({ label: "Monthly EMI", value: formatCurrency(payment) }),
            resultMetric({ label: "Total Interest", value: formatCurrency(interest) }),
            resultMetric({ label: "Total Repayment", value: formatCurrency(total) }),
            resultMetric({ label: "Loan Tenure", value: `${years} years` })
        ], sentence, plan.state === "payoff" ? plan.rows : []),
        rows: plan.state === "payoff" ? plan.rows : [],
        announcement: `Interest rate about ${rateText} a year. Total interest ${formatCurrency(interest)}.`,
        summary: summaryText([
            `Loan amount: ${formatCurrency(loan)}`,
            `Tenure: ${years} years`,
            `Monthly EMI: ${formatCurrency(payment)}`,
            `Interest rate: about ${rateText} a year`,
            `Total interest: ${formatCurrency(interest)}`,
            `Total repayment: ${formatCurrency(total)}`
        ])
    };

}

const RESULT_FOR = {
    emi: resultForEmi,
    tenure: resultForTenure,
    rate: resultForRate
};


/* =========================================================
   INIT
   Binds the form, reset and results to the markup above.
========================================================= */

export function init() {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form =
        document.querySelector("#emi-form");

    const resetButton =
        document.querySelector("#emi-reset");

    const results =
        document.querySelector("#emi-results");

    const live =
        document.querySelector("#emi-live");

    const inputs =
        Object.fromEntries(
            Object.entries(FIELDS).map(
                ([key, field]) => [
                    key,
                    document.getElementById(field.id)
                ]
            )
        );

    const radios =
        [...form.querySelectorAll(`input[name="${MODE_NAME}"]`)];

    const wrappers =
        [...form.querySelectorAll(".emi-field")];

    let announceTimer = null;
    let spoken = "";
    let summary = "";
    let monthlyOpen = false;
    let monthlyRows = [];
    let shownHtml = null;


    const currentMode =
        () =>
            radios.find(radio => radio.checked)?.value ?? DEFAULTS.mode;


    /* =====================================================
       ANNOUNCE
       One sentence for screen readers a moment after typing
       stops, never per key, and never the same sentence twice.
    ===================================================== */

    function announce(text, delay = 600) {

        clearTimeout(announceTimer);

        if (!live) {
            return;
        }

        announceTimer =
            setTimeout(
                () => {
                    if (text !== spoken) {
                        live.textContent = text;
                        spoken = text;
                    }
                },
                delay
            );

    }


    /* =====================================================
       READ THE INPUTS
       -> { empty } | { errors: [{ key, message }] } | { values }
    ===================================================== */

    function read(mode) {

        const values = {};
        const errors = [];
        let empty = false;

        for (const [key, field] of Object.entries(FIELDS)) {

            if (!field.modes.includes(mode)) {
                continue;
            }

            const input = inputs[key];
            const raw = input.value.trim();

            if (raw === "") {
                if (input.validity?.badInput) {
                    errors.push({ key, message: `${field.name} must be a number.` });
                } else {
                    empty = true;
                }
                continue;
            }

            const number = Number(raw);

            if (!Number.isFinite(number)) {
                errors.push({ key, message: `${field.name} must be a number.` });
            } else if (number < field.min || number > field.max) {
                errors.push({ key, message: `${field.name} must be ${field.bounds}.` });
            } else {
                values[key] = number;
            }

        }

        if (errors.length) {
            return { errors };
        }

        return empty ? { empty: true } : { values };

    }


    /*
     * Puts a result on the page only when it differs from what is
     * there, so a field being left does not replace the Copy button
     * (or the open schedule) the visitor is using.
     */
    function show(html, { rows = [], text = "" } = {}) {

        summary = text;

        if (html === shownHtml) {
            return;
        }

        shownHtml = html;
        monthlyRows = rows;
        results.innerHTML = html;

        const details = results.querySelector("#emi-monthly");

        if (details && monthlyOpen) {
            details.open = true;
            fillMonthly();
        }

    }


    /* =====================================================
       UPDATE
       final: true when a field has just been left, so every
       error is reported; while typing, the field that still
       has focus is given time to be finished.
    ===================================================== */

    function update({ final = false, speak = true } = {}) {

        const mode = currentMode();
        const allInputs = Object.values(inputs);

        clearFieldsInvalid(allInputs, ERROR_ID);

        const state = read(mode);

        if (state.empty) {
            show(resultEmpty(EMPTY_MESSAGE[mode]));
            if (speak) {
                announce("");
            }
            return;
        }

        if (state.errors) {

            const focused = document.activeElement;

            const shown = final
                ? state.errors
                : state.errors.filter(error => inputs[error.key] !== focused);

            if (!shown.length) {
                show(resultEmpty(EMPTY_MESSAGE[mode]));
                if (speak) {
                    announce("");
                }
                return;
            }

            setFieldsInvalid(
                shown.map(error => inputs[error.key]),
                ERROR_ID
            );

            const message = shown.map(error => error.message).join(" ");

            show(resultError(message, { id: ERROR_ID }));

            if (speak) {
                announce(message);
            }
            return;

        }

        const result = RESULT_FOR[mode](state.values);

        show(result.html, { rows: result.rows, text: result.summary });

        if (speak) {
            announce(result.announcement);
        }

    }

    /* the monthly table is built when it is first opened, not on every keystroke */
    function fillMonthly() {

        const body = results.querySelector("#emi-monthly-body");

        if (body && !body.firstChild) {
            body.innerHTML = monthlyRowsMarkup(monthlyRows);
        }

    }


    /* =====================================================
       MODE
    ===================================================== */

    function showFieldsForMode() {

        const mode = currentMode();

        for (const wrapper of wrappers) {
            wrapper.hidden = !wrapper.dataset.modes.split(" ").includes(mode);
        }

    }


    /* =====================================================
       COPY
    ===================================================== */

    async function copySummary() {

        const note = results.querySelector("#emi-copy-note");

        if (!summary) {
            return;
        }

        try {

            await navigator.clipboard.writeText(summary);

            if (note) {
                note.textContent = "Summary copied.";
            }

            announce("Summary copied.", 0);

        } catch (error) {

            const box = document.createElement("textarea");

            box.id = "emi-copy-fallback";
            box.className = "calculator-form__input emi-copy-fallback";
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


    /* =====================================================
       EVENTS
    ===================================================== */

    form.addEventListener(
        "input",
        () => update()
    );

    form.addEventListener(
        "focusout",
        () => update({ final: true })
    );

    form.addEventListener(
        "submit",
        event => event.preventDefault()
    );

    for (const radio of radios) {
        radio.addEventListener(
            "change",
            () => {
                showFieldsForMode();
                update({ final: true });
            }
        );
    }

    form.querySelectorAll("[data-start]").forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    const [, loan, years] = STARTING_VALUES[Number(button.dataset.start)];
                    inputs.loan.value = loan;
                    inputs.years.value = years;
                    update({ final: true });
                }
            );
        }
    );

    results.addEventListener(
        "click",
        event => {
            if (event.target.closest("#emi-copy")) {
                copySummary();
            }
        }
    );

    results.addEventListener(
        "toggle",
        event => {
            if (event.target.id === "emi-monthly") {
                monthlyOpen = event.target.open;
                if (monthlyOpen) {
                    fillMonthly();
                }
            }
        },
        true
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const radio of radios) {
                radio.checked = radio.value === DEFAULTS.mode;
            }

            for (const key of Object.keys(FIELDS)) {
                inputs[key].value = DEFAULTS[key];
            }

            monthlyOpen = false;

            showFieldsForMode();
            update({ final: true, speak: false });

            clearTimeout(announceTimer);
            live.textContent = "Values reset to the defaults.";
            spoken = live.textContent;

            inputs.loan.focus();

        }
    );


    /* =====================================================
       INITIAL RESULT
    ===================================================== */

    showFieldsForMode();
    update({ final: true, speak: false });

}
