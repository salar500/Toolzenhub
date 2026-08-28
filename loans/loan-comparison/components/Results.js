
import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";


import {
    calculateLoanComparison
} from "../helpers/loanComparison.js";


import {
    openAmortizationModal
} from "./AmortizationModal.js";



export function compareLoans() {

    const result =
        document.querySelector(
            "#comparison-result"
        );


    if (!result) {
        return;
    }


    renderResults(result);

}



/*
 * =========================================================
 * RENDER RESULTS
 * =========================================================
 */

export function renderResults(result) {

    const data =
        calculateLoanComparison();


    result.innerHTML = `


        <!-- SUMMARY CARDS -->

        <div class="loan-summary-grid">


            <div
                class="loan-summary-card loan-summary-winner"
            >

                <div class="loan-summary-icon">
                    🏆
                </div>


                <span>
                    Lower Interest Cost
                </span>


                <strong>
                    ${data.winner}
                </strong>


                <small>
                    Saves
                    ${formatINR(data.savings)}
                    in interest
                </small>

            </div>



            ${renderComparisonCard(
                "EMI (Monthly)",
                data.emiA,
                data.emiB
            )}



            ${renderComparisonCard(
                "Total Interest",
                data.interestA,
                data.interestB
            )}



            ${renderComparisonCard(
                "Total Repayment",
                data.repaymentA,
                data.repaymentB
            )}



            <div class="loan-summary-card">

                <span>
                    Interest Difference
                </span>


                <strong class="loan-saving-value">

                    ${formatINR(
                        data.savings
                    )}

                </strong>


                <small>
                    Potential interest saving
                </small>

            </div>


        </div>



        <!-- AMORTIZATION PREVIEW -->

        <div class="loan-amortization-grid">


            <!-- LOAN A -->

            <div class="loan-content-card">


                <h3>
                    First 12 Months — Loan A
                </h3>


                ${renderAmortization(
                    data.amortizationA,
                    "a"
                )}


            </div>



            <!-- LOAN B -->

            <div class="loan-content-card">


                <h3>
                    First 12 Months — Loan B
                </h3>


                ${renderAmortization(
                    data.amortizationB,
                    "b"
                )}


            </div>


        </div>



        <p class="loan-disclaimer">

            Figures are approximate and for illustration
            purposes. Actual loan costs may vary depending
            on lender terms, fees, taxes and other charges.

        </p>


    `;



    /*
     * =====================================================
     * FULL AMORTIZATION BUTTONS
     * =====================================================
     */

    result
        .querySelectorAll(
            ".loan-view-link"
        )
        .forEach(button => {


            button.addEventListener(
                "click",
                () => {


                    const loanKey =
                        button.dataset.loan;



                    /*
                     * LOAN A
                     */

                    if (
                        loanKey === "a"
                    ) {

                        openAmortizationModal(
                            data.loanA,
                            data.amortizationA,
                            "Loan A"
                        );

                    }



                    /*
                     * LOAN B
                     */

                    else if (
                        loanKey === "b"
                    ) {

                        openAmortizationModal(
                            data.loanB,
                            data.amortizationB,
                            "Loan B"
                        );

                    }


                }
            );


        });


}



/*
 * =========================================================
 * COMPARISON CARD
 * =========================================================
 */

function renderComparisonCard(
    title,
    valueA,
    valueB
) {

    return `


        <div class="loan-summary-card">


            <span>
                ${title}
            </span>


            <div class="loan-summary-values">


                <div>

                    <small>
                        Loan A
                    </small>


                    <strong>
                        ${formatINR(valueA)}
                    </strong>

                </div>



                <div>

                    <small>
                        Loan B
                    </small>


                    <strong>
                        ${formatINR(valueB)}
                    </strong>

                </div>


            </div>


        </div>


    `;

}



/*
 * =========================================================
 * AMORTIZATION PREVIEW
 * =========================================================
 */

function renderAmortization(
    schedule,
    loanKey
) {

    /*
     * Safety check
     */

    if (!Array.isArray(schedule)) {

        return `

            <p>
                Amortization data unavailable.
            </p>

        `;

    }


    return `


        <div class="loan-table-scroll">


            <table class="loan-amortization-table">


                <thead>

                    <tr>

                        <th>
                            Month
                        </th>

                        <th>
                            Principal
                        </th>

                        <th>
                            Interest
                        </th>

                        <th>
                            Balance
                        </th>

                    </tr>

                </thead>



                <tbody>


                    ${schedule
                        .slice(0, 12)
                        .map(row => `

                            <tr>

                                <td>
                                    ${row.month}
                                </td>


                                <td>
                                    ${formatINR(
                                        row.principal
                                    )}
                                </td>


                                <td>
                                    ${formatINR(
                                        row.interest
                                    )}
                                </td>


                                <td>
                                    ${formatINR(
                                        row.balance
                                    )}
                                </td>

                            </tr>

                        `)
                        .join("")}


                </tbody>


            </table>


        </div>



        <button
            type="button"
            class="loan-view-link"
            data-loan="${loanKey}"
        >

            View Full Amortization Schedule →

        </button>


    `;

}
