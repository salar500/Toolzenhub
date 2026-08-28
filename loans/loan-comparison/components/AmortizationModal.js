
import { formatINR } from "../../../assets/js/calculators/common/formatter.js";


export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

    /*
     * Safety checks
     */
    if (!loan) {

        console.error(
            "Amortization modal: loan data is missing."
        );

        return;
    }


    if (!Array.isArray(schedule)) {

        console.error(
            "Amortization modal: schedule must be an array.",
            schedule
        );

        return;
    }


    /*
     * Remove an existing modal
     */
    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {
        existingModal.remove();
    }


    /*
     * Calculate EMI from the first
     * amortization row.
     *
     * Principal + Interest = EMI
     */
    const emi =
        schedule.length > 0
            ? Number(schedule[0].principal || 0) +
              Number(schedule[0].interest || 0)
            : 0;


    /*
     * Calculate total interest
     */
    const totalInterest =
        schedule.reduce(
            (total, row) => {

                return (
                    total +
                    Number(row.interest || 0)
                );

            },
            0
        );


    /*
     * Calculate total repayment
     */
    const totalRepayment =
        Number(loan.principal || 0) +
        totalInterest;


    /*
     * Create modal
     */
    const modal =
        document.createElement("div");


    modal.id =
        "amortization-modal";


    modal.className =
        "loan-amortization-modal";


    modal.innerHTML = `

        <div
            class="loan-amortization-overlay"
            data-close-amortization
        ></div>


        <div
            class="loan-amortization-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amortization-title"
        >

            <!-- HEADER -->

            <div class="loan-amortization-header">

                <div>

                    <span class="calculator-eyebrow">
                        ${loanName}
                    </span>


                    <h2 id="amortization-title">
                        Full Amortization Schedule
                    </h2>


                    <p>

                        ${formatINR(
                            loan.principal
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


            <!-- SUMMARY -->

            <div class="loan-amortization-summary">


                <div>

                    <span>
                        Monthly EMI
                    </span>

                    <strong>
                        ${formatINR(emi)}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Interest
                    </span>

                    <strong>
                        ${formatINR(totalInterest)}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Repayment
                    </span>

                    <strong>
                        ${formatINR(totalRepayment)}
                    </strong>

                </div>


            </div>


            <!-- TABLE -->

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

                        ${
                            schedule.length > 0

                                ? schedule
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
                                    .join("")

                                : `

                                    <tr>

                                        <td
                                            colspan="4"
                                            style="text-align:center;"
                                        >
                                            No amortization data available.
                                        </td>

                                    </tr>

                                `
                        }

                    </tbody>

                </table>

            </div>


            <!-- FOOTER -->

            <div class="loan-amortization-footer">

                <strong>
                    ${schedule.length} monthly payments
                </strong>


                <button
                    type="button"
                    class="loan-primary-button"
                    data-close-amortization
                >
                    Close
                </button>

            </div>


        </div>

    `;


    /*
     * Add modal to page
     */
    document.body.appendChild(modal);


    /*
     * Close buttons / overlay
     */
    modal
        .querySelectorAll(
            "[data-close-amortization]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                closeAmortizationModal
            );

        });


    /*
     * Escape key
     */
    document.addEventListener(
        "keydown",
        handleEscape
    );


    /*
     * Prevent background scrolling
     */
    document.body.classList.add(
        "amortization-modal-open"
    );

}


export function closeAmortizationModal() {

    const modal =
        document.querySelector(
            "#amortization-modal"
        );


    if (!modal) {
        return;
    }


    modal.remove();


    document.body.classList.remove(
        "amortization-modal-open"
    );


    document.removeEventListener(
        "keydown",
        handleEscape
    );

}


function handleEscape(event) {

    if (event.key === "Escape") {

        closeAmortizationModal();

    }

}
