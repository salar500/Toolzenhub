import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";



export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

    console.log(
        "openAmortizationModal called:",
        {
            loan,
            schedule,
            loanName
        }
    );


    /*
     * =====================================================
     * SAFETY CHECKS
     * =====================================================
     */

    if (!loan) {

        console.error(
            "Amortization modal: loan data is missing."
        );

        return;
    }


    if (!Array.isArray(schedule)) {

        console.error(
            "Amortization modal: schedule is not an array.",
            schedule
        );

        return;
    }


    /*
     * =====================================================
     * REMOVE EXISTING MODAL
     * =====================================================
     */

    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {

        existingModal.remove();

    }


    /*
     * =====================================================
     * EMI
     * =====================================================
     */

    const emi =
        schedule.length > 0

            ? Number(
                schedule[0].principal || 0
            ) +
              Number(
                schedule[0].interest || 0
            )

            : 0;



    /*
     * =====================================================
     * TOTAL INTEREST
     * =====================================================
     */

    const totalInterest =
        schedule.reduce(
            (total, row) => {

                return (
                    total +
                    Number(
                        row.interest || 0
                    )
                );

            },
            0
        );



    /*
     * =====================================================
     * TOTAL REPAYMENT
     * =====================================================
     */

    const totalRepayment =
        Number(
            loan.principal || 0
        ) +
        totalInterest;



    /*
     * =====================================================
     * CREATE MODAL
     * =====================================================
     */

    const modal =
        document.createElement(
            "div"
        );


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


            <div
                class="loan-amortization-header"
            >

                <div>

                    <span
                        class="calculator-eyebrow"
                    >
                        ${loanName}
                    </span>


                    <h2
                        id="amortization-title"
                    >
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



            <div
                class="loan-amortization-summary"
            >


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



            <div
                class="loan-table-scroll"
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

                                        `
                                    )
                                    .join("")

                                : `

                                    <tr>

                                        <td
                                            colspan="4"
                                            style="text-align:center;"
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



            <div
                class="loan-amortization-footer"
            >

                <strong>
                    ${schedule.length}
                    monthly payments
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
     * =====================================================
     * APPEND MODAL
     * =====================================================
     */

    document.body.appendChild(
        modal
    );



    /*
     * =====================================================
     * CLOSE BUTTONS
     * =====================================================
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
     * =====================================================
     * ESCAPE KEY
     * =====================================================
     */

    document.addEventListener(
        "keydown",
        handleEscape
    );



    /*
     * =====================================================
     * LOCK BACKGROUND SCROLL
     * =====================================================
     */

    document.body.classList.add(
        "amortization-modal-open"
    );


    console.log(
        "Amortization modal opened successfully."
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

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}
