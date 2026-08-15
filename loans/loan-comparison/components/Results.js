/* =========================================================
   Loan Comparison
   Results Component
========================================================= */

import {
    formatINR
} from "../../../assets/js/common/formatter.js";


/* =========================================================
   MAIN RESULTS
========================================================= */

export function renderResults(data) {

    const result =
        document.querySelector(
            "#comparison-result"
        );

    if (!result) {
        return;
    }


    result.innerHTML = `

        <div class="loan-summary-grid">


            <!-- Winner -->

            <div class="loan-summary-card loan-summary-winner">

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
                    Saves ${formatINR(data.savings)}
                    in interest
                </small>

            </div>


            <!-- EMI -->

            <div class="loan-summary-card">

                <span>
                    EMI (Monthly)
                </span>

                <div class="loan-summary-values">

                    ${renderValue(
                        "Loan A",
                        data.emiA
                    )}

                    ${renderValue(
                        "Loan B",
                        data.emiB
                    )}

                </div>

            </div>


            <!-- Interest -->

            <div class="loan-summary-card">

                <span>
                    Total Interest
                </span>

                <div class="loan-summary-values">

                    ${renderValue(
                        "Loan A",
                        data.interestA
                    )}

                    ${renderValue(
                        "Loan B",
                        data.interestB
                    )}

                </div>

            </div>


            <!-- Repayment -->

            <div class="loan-summary-card">

                <span>
                    Total Repayment
                </span>

                <div class="loan-summary-values">

                    ${renderValue(
                        "Loan A",
                        data.repaymentA
                    )}

                    ${renderValue(
                        "Loan B",
                        data.repaymentB
                    )}

                </div>

            </div>


            <!-- Difference -->

            <div class="loan-summary-card">

                <span>
                    Interest Difference
                </span>

                <strong class="loan-saving-value">
                    ${formatINR(data.savings)}
                </strong>

                <small>
                    Potential interest saving
                </small>

            </div>

        </div>


        <!-- Amortization -->

        <div class="loan-amortization-grid">

            <div class="loan-content-card">

                <h3>
                    First 12 Months — Loan A
                </h3>

                ${renderAmortization(
                    data.amortizationA
                )}

            </div>


            <div class="loan-content-card">

                <h3>
                    First 12 Months — Loan B
                </h3>

                ${renderAmortization(
                    data.amortizationB
                )}

            </div>

        </div>


        <p class="loan-disclaimer">

            Figures are approximate and for illustration
            purposes. Actual loan costs may vary depending
            on lender terms, fees, taxes and other charges.

        </p>

    `;
}


/* =========================================================
   VALUE
========================================================= */

function renderValue(
    label,
    value
) {

    return `

        <div>

            <small>
                ${label}
            </small>

            <strong>
                ${formatINR(value)}
            </strong>

        </div>

    `;
}


/* =========================================================
   AMORTIZATION
========================================================= */

function renderAmortization(
    schedule
) {

    return `

        <div class="loan-table-scroll">

            <table class="loan-amortization-table">

                <thead>

                    <tr>

                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>

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
        >
            View Full Amortization Schedule →
        </button>

    `;

}
