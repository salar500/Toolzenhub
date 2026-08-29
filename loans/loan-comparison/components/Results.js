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

        console.error(
            "Comparison result container not found."
        );

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


    /*
     * DEBUG
     *
     * Keep these for now.
     * Check the browser console after clicking Compare.
     */

    console.log(
        "Loan comparison data:",
        data
    );


    console.log(
        "Loan A amortization:",
        data.amortizationA
    );


    console.log(
        "Loan B amortization:",
        data.amortizationB
    );


    result.innerHTML = `

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
     * AMORTIZATION CLICK HANDLER
     * =====================================================
     *
     * Event delegation is used because the buttons are
     * created dynamically with innerHTML.
     */

    result.onclick = function (event) {

        const button =
            event.target.closest(
                ".loan-view-link"
            );


        if (!button) {
            return;
        }


        const loanKey =
            button.dataset.loan;


        console.log(
            "Amortization button clicked:",
            loanKey
        );


        if (loanKey === "a") {

            console.log(
                "Opening Loan A modal"
            );


            openAmortizationModal(
                data.loanA,
                data.amortizationA,
                "Loan A"
            );


            return;
        }


        if (loanKey === "b") {

            console.log(
                "Opening Loan B modal"
            );


            openAmortizationModal(
                data.loanB,
                data.amortizationB,
                "Loan B"
            );


            return;
        }


        console.error(
            "Unknown loan key:",
            loanKey
        );

    };

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

    if (!Array.isArray(schedule)) {

        return `

            <p>
                Amortization data unavailable.
            </p>

        `;

    }


    if (schedule.length === 0) {

        return `

            <p>
                No amortization data available.
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
