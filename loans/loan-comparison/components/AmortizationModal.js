import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";


/* =========================================================
   OPEN AMORTIZATION MODAL
========================================================= */

export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

    /* =====================================================
       SAFETY CHECKS
    ===================================================== */

    if (!loan) {

        console.error(
            "Amortization modal: loan data is missing.",
            loan
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


    console.log(
        "Opening amortization modal:",
        {
            loan,
            loanName,
            scheduleLength: schedule.length
        }
    );


    /* =====================================================
       REMOVE EXISTING MODAL
    ===================================================== */

    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {

        existingModal.remove();

    }


    /* =====================================================
       CALCULATE EMI
    ===================================================== */

    const emi =
        schedule.length > 0
            ? Number(
                schedule[0].principal || 0
            ) +
              Number(
                schedule[0].interest || 0
            )
            : 0;


    /* =====================================================
       TOTAL INTEREST
    ===================================================== */

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


    /* =====================================================
       TOTAL REPAYMENT
    ===================================================== */

    const totalRepayment =
        Number(
            loan.principal || 0
        ) +
        totalInterest;


    /* =====================================================
       CREATE MODAL
    ===================================================== */

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "amortization-modal";


    /*
     * IMPORTANT
     *
     * Add "is-open" immediately.
     *
     * Your CSS hides:
     *
     * .loan-amortization-modal
     *
     * and shows it only with:
     *
     * .loan-amortization-modal.is-open
     */

    modal.className =
        "loan-amortization-modal is-open";


    modal.innerHTML = `

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
                        ${formatINR(emi)}
                    </strong>

                </div>


                <div
                    class="loan-amortization-summary-card"
                >

                    <span>
                        Total Interest
                    </span>


                    <strong>
                        ${formatINR(
                            totalInterest
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
                        ${formatINR(
                            totalRepayment
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


    /* =====================================================
       ADD MODAL TO PAGE
    ===================================================== */

    document.body.appendChild(
        modal
    );


    /* =====================================================
       CLOSE BUTTONS + OVERLAY
    ===================================================== */

    modal
        .querySelectorAll(
            "[data-close-amortization]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeAmortizationModal
                );

            }
        );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        handleEscape
    );


    /* =====================================================
       PREVENT PAGE SCROLL
    ===================================================== */

    document.body.classList.add(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "hidden";


    console.log(
        "Amortization modal successfully added to DOM."
    );

}


/* =========================================================
   CLOSE AMORTIZATION MODAL
========================================================= */

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


    document.body.style.overflow =
        "";


    document.removeEventListener(
        "keydown",
        handleEscape
    );


    console.log(
        "Amortization modal closed."
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

function handleEscape(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}
