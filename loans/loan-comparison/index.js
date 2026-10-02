/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */


import {
    createLoanCard,
    initializeLoanInputs,
    resetLoanInputs
} from "./components/LoanCard.js";


import {
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
    getCalculatorById
} from "../../assets/js/data/calculators.js";


/* =========================================================
   IDENTITY

   The title comes from the calculator catalog, the single
   source of tool identity. The breadcrumb, related content
   and error states are supplied by the shared tool page
   (assets/js/pages/tool-page.js); everything below is
   comparison-specific.
========================================================= */

const TITLE =
    getCalculatorById("loan-comparison").title;


/* =========================================================
   Render Calculator
========================================================= */

export function markup() {

    return `

        <div class="calculator-page">


            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Finance Tool
                    </span>

                    <h1>
                        ${TITLE}
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


        </div>

    `;

}


/* =========================================================
   Render

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
   Slider catch-up

   A generated page is interactive HTML before this script has
   loaded. If the visitor already typed into a field, bring the
   slider that mirrors it into line. The card's own listeners
   (and compareLoans below) take over from here and always work
   from the current input values.
========================================================= */

function syncSlidersWithInputs() {

    ["a", "b"].forEach(prefix => {

        ["amount", "rate", "years"].forEach(field => {

            const input =
                document.querySelector(`#${prefix}-${field}`);

            const slider =
                document.querySelector(`#${prefix}-${field}-slider`);

            if (
                input &&
                slider &&
                input.value !== "" &&
                slider.value !== input.value
            ) {

                slider.value =
                    input.value;

            }

        });

    });

}


/* =========================================================
   Init
========================================================= */

export function init() {


    syncSlidersWithInputs();

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
