import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";


/* =========================================================
   OPEN AMORTIZATION MODAL
========================================================= */

export function openAmortizationModal(
    loan,
    schedule,
    loanName = "Loan"
) {

    console.log(
        "openAmortizationModal() called",
        {
            loan,
            schedule,
            loanName
        }
    );


    /* -------------------------------------------------------
       SAFETY CHECKS
    ------------------------------------------------------- */

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


    if (schedule.length === 0) {

        console.error(
            "Amortization modal: schedule is empty."
        );

        return;
    }


    /* -------------------------------------------------------
       REMOVE OLD MODAL
    ------------------------------------------------------- */

    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {

        existingModal.remove();

    }


    /* -------------------------------------------------------
       EMI
    ------------------------------------------------------- */

    const emi =
        Number(
            schedule[0].principal || 0
        ) +
        Number(
            schedule[0].interest || 0
        );


    /* -------------------------------------------------------
       TOTAL INTEREST
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       TOTAL REPAYMENT
    ------------------------------------------------------- */

    const totalRepayment =
        Number(
            loan.principal || 0
        ) +
        totalInterest;


    /* -------------------------------------------------------
       CREATE MODAL
    ------------------------------------------------------- */

    const modal =
        document.createElement("div");


    modal.id =
        "amortization-modal";


    modal.className =
        "loan-amortization-modal";


    /*
     * IMPORTANT
     *
     * These inline styles make sure the modal is visible
     * even if your external CSS is missing or conflicting.
     */

    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.zIndex = "999999";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.padding = "20px";
    modal.style.boxSizing = "border-box";


    /* -------------------------------------------------------
       MODAL HTML
    ------------------------------------------------------- */

    modal.innerHTML = `

        <!-- OVERLAY -->

        <div
            class="loan-amortization-overlay"
            data-close-amortization
            style="
                position:absolute;
                inset:0;
                background:rgba(0,0,0,0.65);
                cursor:pointer;
            "
        ></div>


        <!-- DIALOG -->

        <div
            class="loan-amortization-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amortization-title"
            style="
                position:relative;
                z-index:2;
                width:min(1100px, 100%);
                max-height:90vh;
                background:#ffffff;
                color:#111111;
                border-radius:16px;
                overflow:hidden;
                display:flex;
                flex-direction:column;
                box-shadow:0 25px 80px rgba(0,0,0,0.35);
            "
        >


            <!-- HEADER -->

            <div
                class="loan-amortization-header"
                style="
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:20px;
                    padding:24px;
                    border-bottom:1px solid #e5e7eb;
                    flex-shrink:0;
                "
            >

                <div>

                    <span
                        class="calculator-eyebrow"
                    >
                        ${loanName}
                    </span>


                    <h2
                        id="amortization-title"
                        style="
                            margin:6px 0;
                            font-size:24px;
                        "
                    >
                        Full Amortization Schedule
                    </h2>


                    <p
                        style="
                            margin:0;
                            color:#6b7280;
                        "
                    >

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
                    style="
                        border:0;
                        background:transparent;
                        font-size:30px;
                        line-height:1;
                        cursor:pointer;
                        padding:4px 8px;
                        color:#555;
                    "
                >
                    ×
                </button>

            </div>


            <!-- SUMMARY -->

            <div
                class="loan-amortization-summary"
                style="
                    display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:1px;
                    background:#e5e7eb;
                    flex-shrink:0;
                "
            >

                <div
                    style="
                        background:#ffffff;
                        padding:18px 20px;
                    "
                >

                    <span
                        style="
                            display:block;
                            font-size:13px;
                            color:#6b7280;
                            margin-bottom:5px;
                        "
                    >
                        Monthly EMI
                    </span>


                    <strong
                        style="
                            display:block;
                            font-size:20px;
                        "
                    >
                        ${formatINR(emi)}
                    </strong>

                </div>


                <div
                    style="
                        background:#ffffff;
                        padding:18px 20px;
                    "
                >

                    <span
                        style="
                            display:block;
                            font-size:13px;
                            color:#6b7280;
                            margin-bottom:5px;
                        "
                    >
                        Total Interest
                    </span>


                    <strong
                        style="
                            display:block;
                            font-size:20px;
                        "
                    >
                        ${formatINR(totalInterest)}
                    </strong>

                </div>


                <div
                    style="
                        background:#ffffff;
                        padding:18px 20px;
                    "
                >

                    <span
                        style="
                            display:block;
                            font-size:13px;
                            color:#6b7280;
                            margin-bottom:5px;
                        "
                    >
                        Total Repayment
                    </span>


                    <strong
                        style="
                            display:block;
                            font-size:20px;
                        "
                    >
                        ${formatINR(totalRepayment)}
                    </strong>

                </div>

            </div>


            <!-- TABLE -->

            <div
                class="loan-table-scroll"
                style="
                    overflow:auto;
                    flex:1;
                    min-height:0;
                "
            >

                <table
                    class="loan-amortization-table"
                    style="
                        width:100%;
                        border-collapse:collapse;
                    "
                >

                    <thead>

                        <tr>

                            <th
                                style="
                                    position:sticky;
                                    top:0;
                                    background:#f8fafc;
                                    padding:12px;
                                    text-align:left;
                                    border-bottom:1px solid #e5e7eb;
                                "
                            >
                                Month
                            </th>


                            <th
                                style="
                                    position:sticky;
                                    top:0;
                                    background:#f8fafc;
                                    padding:12px;
                                    text-align:right;
                                    border-bottom:1px solid #e5e7eb;
                                "
                            >
                                Principal
                            </th>


                            <th
                                style="
                                    position:sticky;
                                    top:0;
                                    background:#f8fafc;
                                    padding:12px;
                                    text-align:right;
                                    border-bottom:1px solid #e5e7eb;
                                "
                            >
                                Interest
                            </th>


                            <th
                                style="
                                    position:sticky;
                                    top:0;
                                    background:#f8fafc;
                                    padding:12px;
                                    text-align:right;
                                    border-bottom:1px solid #e5e7eb;
                                "
                            >
                                Balance
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            schedule
                                .map(row => `

                                    <tr>

                                        <td
                                            style="
                                                padding:11px 12px;
                                                border-bottom:1px solid #f1f5f9;
                                            "
                                        >
                                            ${row.month}
                                        </td>


                                        <td
                                            style="
                                                padding:11px 12px;
                                                text-align:right;
                                                border-bottom:1px solid #f1f5f9;
                                            "
                                        >
                                            ${formatINR(
                                                row.principal
                                            )}
                                        </td>


                                        <td
                                            style="
                                                padding:11px 12px;
                                                text-align:right;
                                                border-bottom:1px solid #f1f5f9;
                                            "
                                        >
                                            ${formatINR(
                                                row.interest
                                            )}
                                        </td>


                                        <td
                                            style="
                                                padding:11px 12px;
                                                text-align:right;
                                                border-bottom:1px solid #f1f5f9;
                                            "
                                        >
                                            ${formatINR(
                                                row.balance
                                            )}
                                        </td>

                                    </tr>

                                `)
                                .join("")
                        }

                    </tbody>

                </table>

            </div>


            <!-- FOOTER -->

            <div
                class="loan-amortization-footer"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:20px;
                    padding:18px 24px;
                    border-top:1px solid #e5e7eb;
                    flex-shrink:0;
                    background:#ffffff;
                "
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


    /* -------------------------------------------------------
       ADD TO BODY
    ------------------------------------------------------- */

    document.body.appendChild(modal);


    console.log(
        "Amortization modal added to DOM:",
        modal
    );


    /* -------------------------------------------------------
       CLOSE BUTTONS
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       ESCAPE KEY
    ------------------------------------------------------- */

    document.addEventListener(
        "keydown",
        handleEscape
    );


    /* -------------------------------------------------------
       PREVENT BACKGROUND SCROLL
    ------------------------------------------------------- */

    document.body.classList.add(
        "amortization-modal-open"
    );


    document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE MODAL
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


    document.body.style.overflow = "";


    document.removeEventListener(
        "keydown",
        handleEscape
    );

}


/* =========================================================
   ESCAPE
========================================================= */

function handleEscape(event) {

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}
