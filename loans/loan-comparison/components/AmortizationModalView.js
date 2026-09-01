import {
    formatLoanCurrency
} from "./AmortizationHelpers.js";


/* =========================================================
   RENDER AMORTIZATION MODAL
========================================================= */

export function renderAmortizationModal(
    {
        loan,
        schedule,
        loanName,
        emi,
        totalInterest,
        totalRepayment,
        displayUnit
    }
) {

    return `

        <!-- =================================================
             OVERLAY
        ================================================= -->

        <div
            class="loan-amortization-overlay"
            data-close-amortization
        ></div>


        <!-- =================================================
             DIALOG
        ================================================= -->

        <div
            class="loan-amortization-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amortization-title"
        >


            <!-- =================================================
                 HEADER
            ================================================= -->

            <div class="loan-amortization-header">

                <div>

                    <span class="calculator-eyebrow">
                        ${loanName}
                    </span>


                    <h2 id="amortization-title">
                        Full Amortization Schedule
                    </h2>


                    <p>

                        ${formatLoanCurrency(
                            loan.principal,
                            displayUnit
                        )}

                        •

                        ${loan.rate}% p.a.

                        •

                        ${loan.years} years

                    </p>

                </div>


                <button
                    type="button"
                    class="loan-amortization-close"
                    data-close-amortization
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <!-- =================================================
                 SUMMARY
            ================================================= -->

            <div class="loan-amortization-summary">


                <div
                    class="loan-amortization-summary-card"
                >

                    <span>
                        Monthly EMI
                    </span>


                    <strong>
                        ${formatLoanCurrency(
                            emi,
                            displayUnit
                        )}
                    </strong>

                </div>


                <div
                    class="loan-amortization-summary-card"
                >

                    <span>
                        Total Interest
                    </span>


                    <strong>
                        ${formatLoanCurrency(
                            totalInterest,
                            displayUnit
                        )}
                    </strong>

                </div>


                <div
                    class="loan-amortization-summary-card"
                >

                    <span>
                        Total Repayment
                    </span>


                    <strong>
                        ${formatLoanCurrency(
                            totalRepayment,
                            displayUnit
                        )}
                    </strong>

                </div>


            </div>


            <!-- =================================================
                 TABLE
            ================================================= -->

            <div
                class="loan-amortization-table-container"
            >

                <div
                    class="loan-full-table-scroll"
                >

                    <table
                        class="loan-amortization-table"
                    >

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

                            ${
                                schedule.length > 0

                                    ? schedule
                                        .map(
                                            row => `

                                                <tr>

                                                    <td>
                                                        ${row.month}
                                                    </td>


                                                    <td>
                                                        ${formatLoanCurrency(
                                                            row.principal,
                                                            displayUnit
                                                        )}
                                                    </td>


                                                    <td>
                                                        ${formatLoanCurrency(
                                                            row.interest,
                                                            displayUnit
                                                        )}
                                                    </td>


                                                    <td>
                                                        ${formatLoanCurrency(
                                                            row.balance,
                                                            displayUnit
                                                        )}
                                                    </td>

                                                </tr>

                                            `
                                        )
                                        .join("")

                                    : `

                                        <tr>

                                            <td
                                                colspan="4"
                                                class="loan-amortization-empty"
                                            >
                                                No amortization
                                                data available.
                                            </td>

                                        </tr>

                                    `
                            }

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- =================================================
                 FOOTER
            ================================================= -->

            <div class="loan-amortization-footer">

                <strong>

                    ${schedule.length}

                    monthly payments

                </strong>


                <div
                    class="loan-amortization-footer-actions"
                >

                    <!-- DOWNLOAD PDF -->

                    <button
                        type="button"
                        class="loan-primary-button"
                        data-download-amortization-pdf
                    >

                        Download PDF

                    </button>


                    <!-- CLOSE -->

                    <button
                        type="button"
                        class="loan-primary-button"
                        data-close-amortization
                    >

                        Close

                    </button>

                </div>

            </div>


        </div>

    `;

}
