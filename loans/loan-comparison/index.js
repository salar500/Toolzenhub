/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../formulas/loan.js";

import {
    formatINR
} from "../common/formatter.js";

import { createLoanCard } from "./components/LoanCard.js";
import {
    renderResults,
    renderAmortization
} from "./components/Results.js";

import {
    renderHowToUse,
    renderWhyCompare,
    renderHowItWorks,
    renderExample,
    renderThingsToConsider,
    renderFAQ
} from "./components/InfoSections.js";

import {
    renderRelatedCalculators,
    renderRelatedArticles
} from "./components/RelatedContent.js";


/* =========================================================
   CONSTANTS
========================================================= */

const LOANS = ["a", "b"];

const DEFAULTS = {
    a: {
        amount: 50,
        unit: 100000,
        rate: 8.5,
        years: 20
    },

    b: {
        amount: 50,
        unit: 100000,
        rate: 9,
        years: 20
    }
};


/* =========================================================
   MAIN RENDER
========================================================= */

export function render() {

    const app = document.querySelector("#app");

    if (!app) return;

    app.innerHTML = `
        <div class="calculator-page">

            ${renderBreadcrumb()}

            ${renderIntro()}

            ${renderCalculator()}

            <section
                id="comparison-result"
                class="loan-results"
            ></section>

            ${renderHowToUse()}
            ${renderWhyCompare()}
            ${renderHowItWorks()}
            ${renderExample()}

            <div class="loan-info-grid">
                ${renderThingsToConsider()}
                ${renderFAQ()}
            </div>

            ${renderRelatedCalculators()}
            ${renderRelatedArticles()}

        </div>
    `;

    initializeInputs();

    document
        .querySelector("#compare-loans")
        ?.addEventListener("click", compareLoans);

    document
        .querySelector("#reset-loans")
        ?.addEventListener("click", resetLoans);

    compareLoans();
}


/* =========================================================
   PAGE SECTIONS
========================================================= */

function renderBreadcrumb() {

    return `
        <div class="calculator-breadcrumb">

            <a href="/Toolzenhub/">
                Home
            </a>

            <span>›</span>

            <a href="/Toolzenhub/loans/">
                Loans
            </a>

            <span>›</span>

            <strong>
                Loan Comparison Calculator
            </strong>

        </div>
    `;
}


function renderIntro() {

    return `
        <section class="calculator-intro">

            <div>

                <span class="calculator-eyebrow">
                    Finance Tool
                </span>

                <h1>
                    Loan Comparison Calculator
                </h1>

                <p>
                    Compare two loans by EMI, interest rate,
                    total interest and total repayment.
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
    `;
}


function renderCalculator() {

    return `
        <section class="loan-comparison-tool">

            <div class="loan-comparison-grid">

                ${createLoanCard(
                    "a",
                    "Loan A",
                    "Option A",
                    DEFAULTS.a.rate
                )}

                <div class="loan-vs">
                    VS
                </div>

                ${createLoanCard(
                    "b",
                    "Loan B",
                    "Option B",
                    DEFAULTS.b.rate
                )}

            </div>

            <div class="loan-actions">

                <button
                    id="compare-loans"
                    class="loan-primary-button"
                    type="button"
                >
                    Compare Loans
                </button>

                <button
                    id="reset-loans"
                    class="loan-reset-button"
                    type="button"
                >
                    ↻ Reset
                </button>

            </div>

        </section>
    `;
}


/* =========================================================
   INPUT INITIALIZATION
========================================================= */

function initializeInputs() {

    LOANS.forEach(prefix => {

        const amount =
            getElement(`${prefix}-amount`);

        const unit =
            getElement(`${prefix}-unit`);

        const amountSlider =
            getElement(`${prefix}-amount-slider`);

        const rate =
            getElement(`${prefix}-rate`);

        const rateSlider =
            getElement(`${prefix}-rate-slider`);

        const years =
            getElement(`${prefix}-years`);

        const yearsSlider =
            getElement(`${prefix}-years-slider`);


        /* Amount slider */

        amountSlider?.addEventListener("input", () => {

            amount.value = amountSlider.value;

            updateAmountDisplay(prefix);

            compareLoans();
        });


        /* Amount select */

        amount?.addEventListener("change", () => {

            amountSlider.value = amount.value;

            updateAmountDisplay(prefix);

            compareLoans();
        });


        /* Unit */

        unit?.addEventListener("change", () => {

            updateAmountDisplay(prefix);

            compareLoans();
        });


        /* Interest slider */

        rateSlider?.addEventListener("input", () => {

            rate.value = rateSlider.value;

            compareLoans();
        });


        /* Interest input */

        rate?.addEventListener("input", () => {

            rateSlider.value = rate.value;

            compareLoans();
        });


        /* Tenure slider */

        yearsSlider?.addEventListener("input", () => {

            years.value = yearsSlider.value;

            compareLoans();
        });


        /* Tenure input */

        years?.addEventListener("input", () => {

            yearsSlider.value = years.value;

            compareLoans();
        });


        updateAmountDisplay(prefix);
    });
}


/* =========================================================
   AMOUNT DISPLAY
========================================================= */

function updateAmountDisplay(prefix) {

    const amount =
        Number(getElement(`${prefix}-amount`)?.value);

    const unit =
        Number(getElement(`${prefix}-unit`)?.value);

    const display =
        getElement(`${prefix}-amount-display`);

    if (!display) return;

    display.textContent =
        formatINR(amount * unit);
}


/* =========================================================
   LOAN DATA
========================================================= */

function getLoanData(prefix) {

    const amount =
        Number(getElement(`${prefix}-amount`)?.value);

    const unit =
        Number(getElement(`${prefix}-unit`)?.value);

    const rate =
        Number(getElement(`${prefix}-rate`)?.value);

    const years =
        Number(getElement(`${prefix}-years`)?.value);


    return {
        principal: amount * unit,
        rate,
        years
    };
}


/* =========================================================
   CALCULATE LOAN
========================================================= */

function calculateLoan(prefix) {

    const loan = getLoanData(prefix);

    const emi =
        calculateEMI(
            loan.principal,
            loan.rate,
            loan.years
        );

    const interest =
        calculateTotalInterest(
            loan.principal,
            loan.rate,
            loan.years
        );

    const repayment =
        calculateTotalRepayment(
            loan.principal,
            loan.rate,
            loan.years
        );

    const amortization =
        calculateAmortization(
            loan.principal,
            loan.rate,
            loan.years
        );


    return {
        ...loan,
        emi,
        interest,
        repayment,
        amortization
    };
}


/* =========================================================
   COMPARE LOANS
========================================================= */

function compareLoans() {

    const loanA =
        calculateLoan("a");

    const loanB =
        calculateLoan("b");


    const savings =
        Math.abs(
            loanA.interest -
            loanB.interest
        );


    const winner =
        getWinner(
            loanA.interest,
            loanB.interest
        );


    const result =
        getElement("comparison-result");

    if (!result) return;


    result.innerHTML =
        renderResults({
            loanA,
            loanB,
            winner,
            savings
        });
}


/* =========================================================
   WINNER
========================================================= */

function getWinner(interestA, interestB) {

    if (interestA < interestB) {
        return "Loan A";
    }

    if (interestB < interestA) {
        return "Loan B";
    }

    return "Both Loans";
}


/* =========================================================
   RESET
========================================================= */

function resetLoans() {

    LOANS.forEach(prefix => {

        const defaults =
            DEFAULTS[prefix];

        setValue(
            `${prefix}-amount`,
            defaults.amount
        );

        setValue(
            `${prefix}-unit`,
            defaults.unit
        );

        setValue(
            `${prefix}-rate`,
            defaults.rate
        );

        setValue(
            `${prefix}-rate-slider`,
            defaults.rate
        );

        setValue(
            `${prefix}-years`,
            defaults.years
        );

        setValue(
            `${prefix}-years-slider`,
            defaults.years
        );

        setValue(
            `${prefix}-amount-slider`,
            defaults.amount
        );

        updateAmountDisplay(prefix);
    });


    compareLoans();
}


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);
}


function setValue(id, value) {

    const element = getElement(id);

    if (element) {
        element.value = value;
    }
}
