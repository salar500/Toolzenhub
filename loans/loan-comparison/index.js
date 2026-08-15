/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

import {
    renderLoanCard
} from "./components/LoanCard.js";

import {
    renderInfoSections
} from "./components/InfoSections.js";

import {
    renderRelatedContent
} from "./components/RelatedContent.js";

import {
    initializeLoanComparison
} from "./helpers/loanComparison.js";


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


            <!-- Breadcrumb -->

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


            <!-- Intro -->

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


            <!-- Calculator -->

            <section class="loan-comparison-tool">

                <div class="loan-comparison-grid">

                    ${renderLoanCard(
                        "a",
                        "Loan A",
                        "Option A",
                        8.5
                    )}


                    <div class="loan-vs">
                        VS
                    </div>


                    ${renderLoanCard(
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


            <!-- Results -->

            <section
                id="comparison-result"
                class="loan-results"
            ></section>


            <!-- Information -->

            ${renderInfoSections()}


            <!-- Related -->

            ${renderRelatedContent()}

        </div>

    `;


    /* Initialize calculator */

    initializeLoanComparison();

}
