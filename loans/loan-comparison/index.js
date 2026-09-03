import {
    createLoanCard,
    initializeLoanInputs,
    resetLoanInputs
} from "./components/LoanCard.js";

import {
    renderResults,
    compareLoans
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

import {
    ROUTES
} from "../../assets/js/routes.js";


export function render() {

    const app = document.querySelector("#app");

    if (!app) {
        return;
    }

    app.innerHTML = `

        <div class="calculator-page">

            <div class="calculator-breadcrumb">

                <a href="${ROUTES.home}">
                    Home
                </a>

                <span>›</span>

                <a href="${ROUTES.loans}">
                    Loans
                </a>

                <span>›</span>

                <strong>
                    Loan Comparison Calculator
                </strong>

            </div>


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


            <section class="loan-comparison-tool">

                <div class="loan-comparison-grid">

                    ${createLoanCard(
                        "a",
                        "Loan A",
                        "Option A",
                        8.5
                    )}

                    <div class="loan-vs">
                        VS
                    </div>

                    ${createLoanCard(
                        "b",
                        "Loan B",
                        "Option B",
                        9
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


    initializeLoanInputs();


    document
        .querySelector("#compare-loans")
        ?.addEventListener(
            "click",
            compareLoans
        );


    document
        .querySelector("#reset-loans")
        ?.addEventListener(
            "click",
            resetLoanInputs
        );


    compareLoans();

}
