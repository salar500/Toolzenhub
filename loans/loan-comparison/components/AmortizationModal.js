import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";

import {
    formatPDFCurrency
} from "../../../assets/js/calculators/common/pdf/pdfFormatters.js";

import {
    generatePDF
} from "../../../assets/js/calculators/common/pdf/pdfGenerator.js";


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
            scheduleLength:
                schedule.length
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
            (
                total,
                row
            ) => {

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
       DOWNLOAD PDF BUTTON
    ===================================================== */

    const downloadButton =
        modal.querySelector(
            "[data-download-amortization-pdf]"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            async () => {

                await downloadAmortizationPDF(

                    loan,

                    schedule,

                    loanName,

                    emi,

                    totalInterest,

                    totalRepayment,

                    downloadButton

                );

            }
        );

    }


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
   DOWNLOAD AMORTIZATION PDF
========================================================= */

async function downloadAmortizationPDF(
    loan,
    schedule,
    loanName,
    emi,
    totalInterest,
    totalRepayment,
    button
) {

    if (
        !Array.isArray(schedule) ||
        schedule.length === 0
    ) {

        console.error(
            "Cannot generate PDF: amortization schedule is empty."
        );

        return;

    }


    /* =====================================================
       BUTTON STATE
    ===================================================== */

    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Preparing PDF...";


    try {

        /* =================================================
           PDF TABLE ROWS
        ================================================= */

        const rows =
            schedule.map(
                row => ({

                    month:
                        row.month,

                    /*
                     * IMPORTANT:
                     *
                     * Use PDF-specific currency formatting.
                     *
                     * This produces:
                     *
                     * INR 86,925
                     *
                     * rather than the broken:
                     *
                     * ¹86,925
                     */

                    principal:
                        formatPDFCurrency(
                            row.principal
                        ),

                    interest:
                        formatPDFCurrency(
                            row.interest
                        ),

                    balance:
                        formatPDFCurrency(
                            row.balance
                        )

                })
            );


        /* =================================================
           PDF SUMMARY
        ================================================= */

        const summary = [

            {
                label:
                    "Loan Amount",

                value:
                    formatPDFCurrency(
                        loan.principal
                    )
            },

            {
                label:
                    "Interest Rate",

                value:
                    `${loan.rate}% p.a.`
            },

            {
                label:
                    "Loan Tenure",

                value:
                    `${loan.years} years`
            },

            {
                label:
                    "Monthly EMI",

                value:
                    formatPDFCurrency(
                        emi
                    )
            },

            {
                label:
                    "Total Interest",

                value:
                    formatPDFCurrency(
                        totalInterest
                    )
            },

            {
                label:
                    "Total Repayment",

                value:
                    formatPDFCurrency(
                        totalRepayment
                    )
            }

        ];


        /* =================================================
           CREATE FILENAME
        ================================================= */

        const filename =
            createPDFFileName(
                loanName,
                loan
            );


        /* =================================================
           CREATE PDF SUBTITLE
        ================================================= */

        const subtitle =
            `${loanName} • ` +
            `${formatPDFCurrency(
                loan.principal
            )} • ` +
            `${loan.rate}% p.a. • ` +
            `${loan.years} years`;


        /* =================================================
           GENERATE PDF
        ================================================= */

        const success =
            await generatePDF({

                filename,

                title:
                    "Full Amortization Schedule",

                subtitle,

                summary,

                columns: [

                    {
                        key:
                            "month",

                        label:
                            "Month"
                    },

                    {
                        key:
                            "principal",

                        label:
                            "Principal"
                    },

                    {
                        key:
                            "interest",

                        label:
                            "Interest"
                    },

                    {
                        key:
                            "balance",

                        label:
                            "Balance"
                    }

                ],

                rows,

                footer:
                    "Generated by ToolZen Hub",

                watermark:
                    "TOOLZEN HUB",

                metadata: {

                    calculator:
                        "Loan Comparison",

                    loan:
                        loanName,

                    principal:
                        loan.principal,

                    interestRate:
                        loan.rate,

                    tenure:
                        loan.years

                }

            });


        if (!success) {

            console.error(
                "PDF generation was unsuccessful."
            );

        }

    } catch (error) {

        console.error(
            "Amortization PDF download failed:",
            error
        );

    } finally {

        /* =================================================
           RESTORE BUTTON
        ================================================= */

        button.disabled =
            false;


        button.textContent =
            originalText;

    }

}


/* =========================================================
   CREATE PDF FILENAME
========================================================= */

function createPDFFileName(
    loanName,
    loan
) {

    const safeName =
        String(
            loanName ||
            "loan"
        )
        .trim()
        .replace(
            /[^a-z0-9]+/gi,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .toLowerCase();


    const amount =
        Number(
            loan?.principal || 0
        );


    const safeAmount =
        Number.isFinite(amount)
            ? Math.round(amount)
            : 0;


    const rate =
        Number(
            loan?.rate || 0
        );


    const safeRate =
        Number.isFinite(rate)
            ? String(rate)
            : "0";


    const years =
        Number(
            loan?.years || 0
        );


    const safeYears =
        Number.isFinite(years)
            ? String(years)
            : "0";


    return `${
        safeName || "loan"
    }-${
        safeAmount
    }-${
        safeRate
    }-percent-${
        safeYears
    }-years-amortization-schedule.pdf`;

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
