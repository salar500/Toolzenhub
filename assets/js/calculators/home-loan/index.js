/* =========================================================
   ToolZen Hub
   Home Loan Calculator

   A planning tool for a home buyer: given the monthly EMI the
   visitor is comfortable carrying, which loan amount fits, what
   it costs in interest, and how the answer changes with the
   tenure. It solves FOR the loan amount; the EMI Calculator does
   the reverse (a known loan gives an EMI).

   THIS IS THE VISITOR'S OWN PLANNING, NOT A LENDER'S DECISION.
   The share of income, the rate and the tenure are the visitor's
   choices. The page never claims a lender's approval or criteria,
   never recommends a tenure and says plainly, next to the result,
   what is not included.

   The maths is in formulas/home-loan.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateHomeLoan,
    validateHomeLoanInputs,
    HOME_LOAN_LIMITS
} from "../formulas/home-loan.js";

import {
    formatINR,
    formatNumber
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
    getCalculatorById("home-loan").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    income: "home-loan-income",
    existing: "home-loan-existing",
    share: "home-loan-share",
    rate: "home-loan-rate",
    years: "home-loan-years",
    own: "home-loan-own"
};

/* the fields that may be left empty: blank existing EMIs mean 0, blank own funds mean none */
const OPTIONAL = ["existing", "own"];

const ERROR_ID =
    "home-loan-results-error";

const DEFAULTS = {
    income: 100000,
    existing: "",
    share: 40,
    rate: 8.5,
    years: 20,
    own: ""
};

const EMPTY_MESSAGE =
    "Enter your monthly income, the share you would put towards EMIs, an interest rate and a tenure to see the loan that fits.";

const L = HOME_LOAN_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

/* the loan is a whole number of rupees; the money worked out from it is shown to the paisa */

const loanText = formatINR;

const paiseFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const rupees = (value) => paiseFormatter.format(Number(value) || 0);

const percent = (fraction) => `${formatNumber(fraction * 100, 2)}%`;

const plainPercent = (value) => `${formatNumber(value, 2).replace(/\.?0+$/, "")}%`;

const yearsText = (count) => `${count} year${count === 1 ? "" : "s"}`;


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const {
        input,
        capacity,
        room,
        noRoom,
        loan,
        emi,
        totalRepayment,
        totalInterest
    } = result;

    const lines = [];

    lines.push(
        input.existing > 0
            ? `${plainPercent(input.share)} of ${rupees(input.income)} is ${rupees(capacity)} a month for EMIs. After your existing payments of ${rupees(input.existing)}, that leaves ${rupees(room)} a month of EMI room.`
            : `${plainPercent(input.share)} of ${rupees(input.income)} is ${rupees(capacity)} a month for EMIs, and you entered no existing payments, so the EMI room is ${rupees(room)} a month.`
    );

    if (noRoom) {

        lines.push(
            "Your existing payments already use all of that share, so there is no room for a new EMI under these numbers. Change the share, the income or the existing payments to see how the loan responds."
        );

        return lines;

    }

    lines.push(
        input.rate === 0
            ? `At 0% over ${yearsText(input.years)}, a loan of ${loanText(loan)} has an EMI of ${rupees(emi)}, within that room, and no interest. This is the largest whole-rupee loan whose EMI fits.`
            : `At ${plainPercent(input.rate)} over ${yearsText(input.years)}, the largest whole-rupee loan whose EMI fits is ${loanText(loan)}. Its EMI is ${rupees(emi)}, within that room. Over the tenure you would repay ${rupees(totalRepayment)}, of which ${rupees(totalInterest)} is interest.`
    );

    return lines;

}

function ownFundsSection(
    result
) {

    const {
        input,
        loan,
        property
    } = result;

    if (property === null || !(input.own > 0)) {
        return "";
    }

    const rows = [
        ["Loan that fits", loanText(loan)],
        ["Your own funds", rupees(input.own)],
        ["Property budget", rupees(property)]
    ];

    return `
                <h3 class="home-loan-subtitle">
                    With your own funds
                </h3>

                <div class="home-loan-compare">

                    <section
                        class="home-loan-compare__card"
                        aria-labelledby="home-loan-budget-card"
                    >

                        <h4
                            class="home-loan-compare__title"
                            id="home-loan-budget-card"
                        >
                            A simple planning total
                        </h4>

                        <p class="home-loan-compare__tag">
                            The loan plus the funds you add
                        </p>

                        <dl class="home-loan-compare__list">
                            ${rows.map(
                                ([label, value]) => `
                            <div>
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`
                            ).join("")}
                        </dl>

                    </section>

                </div>

                <p class="home-loan-note">
                    This is a simple total. It does not include stamp duty, registration, fees, insurance or tax, and it says nothing about a lender's loan-to-value requirement.
                </p>`;

}

function tenureSentence(
    rows
) {

    const first = rows[0];
    const last = rows[rows.length - 1];

    if (!(first.loan > 0) || !(first.interest > 0)) {
        return "";
    }

    return `Between ${yearsText(first.years)} and ${yearsText(last.years)}, the loan that fits changes by ${percent(last.loan / first.loan - 1)} and the total interest by ${percent(last.interest / first.interest - 1)}.`;

}

function tenureTable(
    result
) {

    const label =
        "What the same EMI room borrows over other tenures";

    const sentence =
        result.noRoom
            ? ""
            : tenureSentence(result.tenureRows);

    return `
                <h3 class="home-loan-subtitle">
                    What the same EMI room borrows over other tenures
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}: the loan that fits, total interest and total repayment for each tenure"
                >

                    <table class="calculator-results__table home-loan-table">

                        <caption class="home-loan-sr-only">
                            The loan that fits, the total interest and the total repayment for the same monthly EMI room over different tenures.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Tenure</th>
                                <th scope="col">Loan that fits</th>
                                <th scope="col">Total interest</th>
                                <th scope="col">Total repayment</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.tenureRows.map(
                                row => `
                            <tr>
                                <th scope="row">${yearsText(row.years)}${row.yours ? " (your tenure)" : ""}</th>
                                <td>${loanText(row.loan)}</td>
                                <td>${rupees(row.interest)}</td>
                                <td>${rupees(row.repaid)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="home-loan-note">
                    With the same EMI room, a longer tenure can raise the loan that fits while raising the total interest. The table shows that arithmetic for your numbers; it does not say which tenure to choose.${sentence ? ` ${escapeHTML(sentence)}` : ""}
                </p>`;

}

function renderResults(
    result
) {

    const {
        loan,
        room,
        totalInterest,
        totalRepayment,
        existingShare
    } = result;

    const metrics = [
        resultMetric({ label: "Loan that fits your EMI budget", value: loanText(loan), primary: true }),
        resultMetric({ label: "Monthly EMI room", value: rupees(room) }),
        resultMetric({ label: "Total interest", value: rupees(totalInterest) }),
        resultMetric({ label: "Total repayment", value: rupees(totalRepayment) }),
        resultMetric({ label: "Existing EMIs as a share of income", value: percent(existingShare) })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        The loan that fits your EMI budget
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="home-loan-note home-loan-note--trust">
                    <strong>Your own planning, under your assumptions.</strong>
                    The share of income, the rate and the tenure are your
                    choices, and the rate is assumed to stay the same for the
                    whole tenure. This is not a lender's offer or decision and
                    does not use a lender's rules. Not included: a lender's
                    own limits, credit score, age, employment and documents,
                    loan-to-value, fees, stamp duty, registration, insurance,
                    rate changes, tax benefits and part-payments.
                </div>

                ${ownFundsSection(result)}

                ${tenureTable(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    return result.noRoom
        ? "There is no EMI room under these numbers, so no loan fits."
        : `A loan of ${loanText(result.loan)} fits an EMI room of ${rupees(result.room)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from fixed
   example values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const r =
        calculateHomeLoan({ income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20, own: 500000 });

    const t10 = r.tenureRows.find(row => row.years === 10);
    const t30 = r.tenureRows.find(row => row.years === 30);

    return `Take a monthly income of ${rupees(100000)}, existing EMIs of ${rupees(10000)}, a ${40}% share for EMIs, an interest rate of ${8.5}% and ${yearsText(20)}. ${rupees(r.capacity)} is available for EMIs, ${rupees(r.room)} after the existing payments. The loan that fits is ${loanText(r.loan)}, with an EMI of ${rupees(r.emi)} and ${rupees(r.totalInterest)} of interest. With ${rupees(500000)} of your own funds the simple property budget is ${rupees(r.property)}. Over ${yearsText(10)} the same room fits ${loanText(t10.loan)}; over ${yearsText(30)} it fits ${loanText(t30.loan)}, with ${rupees(t30.interest)} of interest.`;

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
                        Work out the home loan that fits your monthly EMI
                        budget, what it would cost in interest, and how the
                        tenure changes it.
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
                    Find the Loan That Fits
                </div>

                <p class="calculator-section__description">
                    Enter your income and the share of it you would put
                    towards EMIs. Results update as you type.
                </p>

                <form
                    id="home-loan-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.income,
                            label: "Monthly Income",
                            unit: "₹",
                            hint: "The monthly income you want your EMI limit based on, for example your take-home pay.",
                            min: L.income.min,
                            max: L.income.max,
                            step: 1000,
                            value: DEFAULTS.income
                        })}

                        ${numberField({
                            id: IDS.existing,
                            label: "Existing EMIs and Loan Payments (optional)",
                            unit: "₹",
                            hint: "Leave blank if none. Add every EMI and loan payment you already make each month.",
                            min: L.existing.min,
                            max: L.existing.max,
                            step: 500,
                            value: DEFAULTS.existing,
                            required: false
                        })}

                        ${numberField({
                            id: IDS.share,
                            label: "Share of Income for EMIs",
                            unit: "% of income",
                            hint: "Your own limit, not a lender's. 40% is only an example; lenders set their own limits, which this does not know.",
                            min: L.share.min,
                            max: L.share.max,
                            step: 0.5,
                            value: DEFAULTS.share
                        })}

                        ${numberField({
                            id: IDS.rate,
                            label: "Interest Rate",
                            unit: "% a year",
                            hint: "An assumption: the rate for the whole tenure. 8.5% is only an example.",
                            min: L.rate.min,
                            max: L.rate.max,
                            step: 0.05,
                            value: DEFAULTS.rate
                        })}

                        ${numberField({
                            id: IDS.years,
                            label: "Loan Tenure",
                            unit: "years",
                            hint: "Whole years, from 1 to 30.",
                            min: L.years.min,
                            max: L.years.max,
                            step: 1,
                            value: DEFAULTS.years
                        })}

                        ${numberField({
                            id: IDS.own,
                            label: "Own Funds for the Property (optional)",
                            unit: "₹",
                            hint: "Leave blank to skip. If you enter it, you also see the property budget.",
                            min: L.own.min,
                            max: L.own.max,
                            step: 10000,
                            value: DEFAULTS.own,
                            required: false
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="home-loan-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="home-loan-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="home-loan-live"
                class="home-loan-sr-only"
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
                        Enter your monthly income, and any EMIs or loan
                        payments you already make.
                    </li>
                    <li>
                        Choose the share of income you would put towards
                        EMIs. This is your own limit.
                    </li>
                    <li>
                        Enter an interest rate to assume and a tenure in
                        whole years. Optionally add your own funds.
                    </li>
                    <li>
                        Read the loan that fits, then the table of other
                        tenures. Results update as you change any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>It starts from the EMI, not the property.</strong>
                    The EMI room is your income times the share you chose,
                    less what you already pay. The loan that fits is the
                    largest amount whose EMI stays within that room.
                </p>

                <p>
                    <strong>The loan is rounded down.</strong> It is the
                    largest whole-rupee loan whose EMI fits, so the EMI on it
                    never goes above your room and one rupee more would.
                </p>

                <p>
                    <strong>The tenure changes the loan and its cost.</strong>
                    With the same room, a longer tenure can fit a larger loan,
                    and the total interest rises with it. The table shows
                    both for your numbers.
                </p>

                <p>
                    <strong>Own funds make a simple total.</strong> If you add
                    them, the property budget is the loan plus those funds,
                    before any charges.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The share of income, the rate and the tenure are your
                        choices. The rate is assumed to stay the same for the
                        whole tenure.
                    </li>
                    <li>
                        Payments are equal, monthly and made at the end of each
                        month, as in the EMI Calculator.
                    </li>
                    <li>
                        This is not a lender's offer or decision. It does not
                        use a lender's limits, credit score, age, employment
                        or documents, or loan-to-value.
                    </li>
                    <li>
                        Not included: fees, stamp duty, registration,
                        insurance, rate changes, tax benefits and
                        part-payments.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not advice.
                    See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
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
                    How It Is Calculated
                </h2>

                <p>
                    EMI room = income × share of income - existing EMIs
                </p>

                <p>
                    EMI = loan × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ - 1), where r is the
                    yearly rate divided by 12 and n is the number of months.
                </p>

                <p>
                    The loan that fits is the largest whole-rupee amount whose
                    EMI is no more than the room. The total repayment is the
                    EMI times the months, and the total interest is that less
                    the loan. Each row of the table repeats the same working
                    for its tenure with the same room.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What is the share of income for EMIs?
                    </summary>
                    <p>
                        It is the part of your income you choose to put towards
                        EMIs. It is your own limit. Lenders use their own
                        limits, which this calculator does not know.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the loan rounded down?
                    </summary>
                    <p>
                        So that the EMI on the loan never goes above your EMI
                        room. It is the largest whole-rupee loan that fits, and
                        one rupee more would not.
                    </p>
                </details>

                <details>
                    <summary>
                        Is this what a lender would offer me?
                    </summary>
                    <p>
                        No. A lender decides on its own rules. This shows the
                        loan that fits an EMI budget you set, under a rate and a
                        tenure you assume.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does a longer tenure fit a larger loan but cost more interest?
                    </summary>
                    <p>
                        A longer tenure spreads the repayment over more
                        months, so the same EMI supports a larger loan. The
                        interest is charged on the balance for longer, so the
                        total interest rises.
                    </p>
                </details>

                <details>
                    <summary>
                        What if I already pay other EMIs?
                    </summary>
                    <p>
                        Enter them under existing EMIs. They are taken from the
                        EMI room before the loan is worked out, so a larger
                        amount there means a smaller loan.
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
        document.querySelector("#home-loan-form");

    const results =
        document.querySelector("#home-loan-results");

    const live =
        document.querySelector("#home-loan-live");

    const resetButton =
        document.querySelector("#home-loan-reset");

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

        /* a required field that is still empty is not an error yet */

        if (
            Object.entries(raw).some(
                ([name, value]) =>
                    !OPTIONAL.includes(name) &&
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
            validateHomeLoanInputs(raw);

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
            calculateHomeLoan(check.values);

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
        "submit",
        event => {
            event.preventDefault();
        }
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const [name, input] of Object.entries(inputs)) {
                input.value = DEFAULTS[name];
            }

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
