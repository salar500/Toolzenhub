import { formatINR } from "../../../../../assets/js/common/formatter.js";

import {
    calculateLoanComparison
} from "../helpers/loanComparison.js";


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


export function renderResults(result) {

    const data =
        calculateLoanComparison();


    result.innerHTML = `

        <div class="loan-summary-grid">

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
                    Saves ${formatINR(data.savings)} in interest
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
                    ${formatINR(data.savings)}
                </strong>

                <small>
                    Potential interest saving
                </small>

            </div>

        </div>


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
            Figures are approximate and for illustration purposes.
            Actual loan costs may vary depending on lender terms,
            fees, taxes and other charges.
        </p>

    `;

}


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


function renderAmortization(schedule) {

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
                                    ${formatINR(row.principal)}
                                </td>

                                <td>
                                    ${formatINR(row.interest)}
                                </td>

                                <td>
                                    ${formatINR(row.balance)}
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
