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
    ROUTES
} from "../../routes.js";

import {
    renderBreadcrumb
} from "../../components/breadcrumb.js";


/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =========================================================
   RENDER
========================================================= */

export function render() {

    const app =
        document.querySelector("#app");

    if (!app) {
        return;
    }


    app.innerHTML = `

        <div class="calculator-page">

            ${renderBreadcrumb([
                {
                    label: "Loans",
                    href: ROUTES.loans
                },
                {
                    label: "EMI Calculator"
                }
            ])}


            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Finance Tool
                    </span>

                    <h1>
                        EMI Calculator
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

                        <div class="calculator-form__group">

                            <label
                                class="calculator-form__label"
                                for="emi-loan"
                            >
                                Loan Amount
                            </label>

                            <div class="calculator-form__field calculator-form__field--unit">

                                <input
                                    id="emi-loan"
                                    class="calculator-form__input"
                                    type="number"
                                    min="1000"
                                    max="100000000"
                                    step="1000"
                                    value="1000000"
                                    required
                                >

                                <span class="calculator-form__unit">
                                    ₹
                                </span>

                            </div>

                            <span class="calculator-form__help">
                                Enter the total loan amount.
                            </span>

                        </div>


                        <!-- INTEREST RATE -->

                        <div class="calculator-form__group">

                            <label
                                class="calculator-form__label"
                                for="emi-rate"
                            >
                                Interest Rate
                            </label>

                            <div class="calculator-form__field calculator-form__field--unit">

                                <input
                                    id="emi-rate"
                                    class="calculator-form__input"
                                    type="number"
                                    min="1"
                                    max="30"
                                    step="0.01"
                                    value="8.5"
                                    required
                                >

                                <span class="calculator-form__unit">
                                    %
                                </span>

                            </div>

                            <span class="calculator-form__help">
                                Enter the annual interest rate.
                            </span>

                        </div>


                        <!-- TENURE -->

                        <div class="calculator-form__group">

                            <label
                                class="calculator-form__label"
                                for="emi-years"
                            >
                                Loan Tenure
                            </label>

                            <div class="calculator-form__field calculator-form__field--unit">

                                <input
                                    id="emi-years"
                                    class="calculator-form__input"
                                    type="number"
                                    min="1"
                                    max="40"
                                    step="1"
                                    value="20"
                                    required
                                >

                                <span class="calculator-form__unit">
                                    Years
                                </span>

                            </div>

                            <span class="calculator-form__help">
                                Enter the repayment period.
                            </span>

                        </div>

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

                <div class="calculator-results__empty">
                    Enter your loan details and calculate your EMI.
                </div>

            </section>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the EMI Calculator
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
                    EMI Calculator FAQ
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


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form =
        document.querySelector("#emi-form");

    const resetButton =
        document.querySelector("#emi-reset");

    const results =
        document.querySelector("#emi-results");


    /* =====================================================
       CALCULATE
    ===================================================== */

    function calculate() {

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

            results.innerHTML = `
                <div class="calculator-results__error">
                    Please enter valid loan details.
                </div>
            `;

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


                    <div class="calculator-results__item calculator-results__item--primary">

                        <span class="calculator-results__label">
                            Monthly EMI
                        </span>

                        <strong class="calculator-results__value">
                            ${formatCurrency(emi)}
                        </strong>

                    </div>


                    <div class="calculator-results__item">

                        <span class="calculator-results__label">
                            Total Interest
                        </span>

                        <strong class="calculator-results__value">
                            ${formatCurrency(totalInterest)}
                        </strong>

                    </div>


                    <div class="calculator-results__item">

                        <span class="calculator-results__label">
                            Total Repayment
                        </span>

                        <strong class="calculator-results__value">
                            ${formatCurrency(totalRepayment)}
                        </strong>

                    </div>


                    <div class="calculator-results__item">

                        <span class="calculator-results__label">
                            Loan Tenure
                        </span>

                        <strong class="calculator-results__value">
                            ${years} years
                        </strong>

                    </div>

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

            results.innerHTML = `
                <div class="calculator-results__empty">
                    Enter your loan details and calculate your EMI.
                </div>
            `;

        }
    );


    /* =====================================================
       INITIAL RESULT
    ===================================================== */

    calculate();

}
