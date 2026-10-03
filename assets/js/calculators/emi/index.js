/* =========================================================
   ToolZen Hub
   EMI Calculator
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest
} from "../formulas/loan.js";


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
    getCalculatorById
} from "../../data/calculators.js";


/* =========================================================
   IDENTITY

   Title (and the headings derived from it) come from the
   calculator catalog, the single source of tool identity.
   Intro copy and the rest of the content stay with the tool.
========================================================= */

const TITLE =
    getCalculatorById("emi").title;


/*
 * The inputs, and the error element they point at when the
 * entered values cannot be used (shared wiring: ui/field.js).
 */

const FIELD_IDS = [
    "emi-loan",
    "emi-rate",
    "emi-years"
];

const ERROR_ID =
    "emi-results-error";


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
                        Calculate your monthly EMI,
                        total interest and total
                        repayment for any loan.
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
                    Enter your loan amount, interest rate
                    and loan tenure to calculate your EMI.
                </p>


                <form
                    id="emi-form"
                    class="calculator-form"
                >

                    <div class="calculator-form__grid">

                        <!-- LOAN AMOUNT -->
                        ${numberField({
                            id: "emi-loan",
                            label: "Loan Amount",
                            unit: "₹",
                            hint: "Enter the total loan amount.",
                            min: 1000,
                            max: 100000000,
                            step: 1000,
                            value: 1000000
                        })}


                        <!-- INTEREST RATE -->
                        ${numberField({
                            id: "emi-rate",
                            label: "Interest Rate",
                            unit: "%",
                            hint: "Enter the annual interest rate.",
                            min: 1,
                            max: 30,
                            step: 0.01,
                            value: 8.5
                        })}


                        <!-- TENURE -->
                        ${numberField({
                            id: "emi-years",
                            label: "Loan Tenure",
                            unit: "Years",
                            hint: "Enter the repayment period.",
                            min: 1,
                            max: 40,
                            step: 1,
                            value: 20
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="submit"
                            class="calculator-form__button"
                        >
                            Calculate EMI
                        </button>

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
                aria-live="polite"
            >

                ${resultEmpty("Enter your loan details and calculate your EMI.")}

            </section>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>

                    <li>
                        Enter the loan amount.
                    </li>

                    <li>
                        Enter the annual interest rate.
                    </li>

                    <li>
                        Enter the loan tenure in years.
                    </li>

                    <li>
                        Click Calculate EMI to see your results.
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

    const inputs =
        FIELD_IDS.map(
            id =>
                document.getElementById(id)
        );


    /* =====================================================
       CALCULATE
    ===================================================== */

    function calculate() {

        clearFieldsInvalid(
            inputs,
            ERROR_ID
        );

        const loan =
            Number(
                document.querySelector("#emi-loan").value
            );

        const rate =
            Number(
                document.querySelector("#emi-rate").value
            );

        const years =
            Number(
                document.querySelector("#emi-years").value
            );


        if (
            !Number.isFinite(loan) ||
            !Number.isFinite(rate) ||
            !Number.isFinite(years) ||
            loan <= 0 ||
            rate < 0 ||
            years <= 0
        ) {

            setFieldsInvalid(
                inputs,
                ERROR_ID
            );

            results.innerHTML =
                resultError(
                    "Please enter valid loan details.",
                    { id: ERROR_ID }
                );

            return;
        }


        const emi =
            calculateEMI(
                loan,
                rate,
                years
            );

        const totalRepayment =
            calculateTotalRepayment(
                loan,
                rate,
                years
            );

        const totalInterest =
            calculateTotalInterest(
                loan,
                rate,
                years
            );


        results.innerHTML = `

            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        EMI Calculation
                    </h2>

                </div>


                    <div class="calculator-results__grid">

                        ${resultMetric({
                            label: "Monthly EMI",
                            value: formatCurrency(emi),
                            primary: true
                        })}

                        ${resultMetric({
                            label: "Total Interest",
                            value: formatCurrency(totalInterest)
                        })}

                        ${resultMetric({
                            label: "Total Repayment",
                            value: formatCurrency(totalRepayment)
                        })}

                        ${resultMetric({
                            label: "Loan Tenure",
                            value: `${years} years`
                        })}

                </div>


                <div class="calculator-results__summary">

                    For a loan of
                    <strong>${formatCurrency(loan)}</strong>
                    at
                    <strong>${rate}%</strong>
                    annual interest for
                    <strong>${years} years</strong>,
                    your estimated monthly EMI is
                    <strong>${formatCurrency(emi)}</strong>.

                </div>

            </div>

        `;

    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    form?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            calculate();

        }
    );


    /* =====================================================
       RESET
    ===================================================== */

    resetButton?.addEventListener(
        "click",
        () => {

            document.querySelector("#emi-loan").value =
                1000000;

            document.querySelector("#emi-rate").value =
                8.5;

            document.querySelector("#emi-years").value =
                20;

            clearFieldsInvalid(
                inputs,
                ERROR_ID
            );

            results.innerHTML =
                resultEmpty(
                    "Enter your loan details and calculate your EMI."
                );

        }
    );


    /* =====================================================
       INITIAL RESULT
    ===================================================== */

    calculate();

}
