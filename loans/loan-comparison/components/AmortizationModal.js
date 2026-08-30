import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";


export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

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
            "Amortization modal: schedule must be an array.",
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
     * CALCULATE EMI
     * =====================================================
     *
     * Principal + Interest = EMI
     *
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


    /*
     * IMPORTANT:
     *
     * Do NOT add "is-open" here.
     *
     * It is added after the modal is inserted
     * into the DOM below.
     */

    modal.className =
        "loan-amortization-modal";


    modal.innerHTML = `

        <!-- OVERLAY -->

        <div
            class="loan-amortization-overlay"
            data-close-amortization
        ></div>


        <!-- DIALOG -->

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
                        ${formatINR(
                            totalInterest
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Repayment
                    </span>


                    <strong>
                        ${formatINR(
                            totalRepayment
                        )}
                    </strong>

                </div>


            </div>


            <!-- TABLE -->

            <div class="loan-amortization-table-container">

                <div class="loan-full-table-scroll">

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
                                                class="loan-amortization-empty"
                                            >
                                                No amortization data available.
                                            </td>

                                        </tr>

                                    `
                            }

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- FOOTER -->

            <div class="loan-amortization-footer">

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
     * ADD MODAL TO BODY
     * =====================================================
     */

    document.body.appendChild(
        modal
    );


    /*
     * =====================================================
     * IMPORTANT FIX
     * =====================================================
     *
     * Your CSS hides the modal by default:
     *
     * .loan-amortization-modal {
     *     visibility: hidden;
     *     opacity: 0;
     * }
     *
     * The CSS shows it only when:
     *
     * .loan-amortization-modal.is-open
     *
     * Therefore we add "is-open" after the modal
     * has been inserted into the DOM.
     */

    requestAnimationFrame(() => {

        modal.classList.add(
            "is-open"
        );

    });


    /*
     * =====================================================
     * CLOSE BUTTONS + OVERLAY
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
     * PREVENT BACKGROUND SCROLL
     * =====================================================
     */

    document.body.classList.add(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "hidden";


    /*
     * DEBUG
     */

    console.log(
        "Amortization modal opened:",
        {
            loan,
            scheduleLength:
                schedule.length,
            loanName
        }
    );

}


/*
 * =========================================================
 * CLOSE MODAL
 * =========================================================
 */

export function closeAmortizationModal() {

    const modal =
        document.querySelector(
            "#amortization-modal"
        );


    if (!modal) {

        return;

    }


    /*
     * Remove open state first
     * so the CSS closing animation can run.
     */

    modal.classList.remove(
        "is-open"
    );


    /*
     * Remove modal after animation.
     */

    setTimeout(() => {

        if (modal) {

            modal.remove();

        }

    }, 200);


    /*
     * Restore body scrolling.
     */

    document.body.classList.remove(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "";


    /*
     * Remove Escape listener.
     */

    document.removeEventListener(
        "keydown",
        handleEscape
    );

}


/*
 * =========================================================
 * ESCAPE HANDLER
 * =========================================================
 */

function handleEscape(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}
