import {
    formatPDFCurrency
} from "../../../assets/js/calculators/common/pdf/pdfFormatters.js";

import {
    generatePDF
} from "../../../assets/js/calculators/common/pdf/pdfGenerator.js";

import {
    createPDFFileName
} from "./AmortizationHelpers.js";


/* =========================================================
   DOWNLOAD AMORTIZATION PDF
========================================================= */

export async function downloadAmortizationPDF(
    loan,
    schedule,
    loanName,
    emi,
    totalInterest,
    totalRepayment,
    displayUnit,
    button
) {

    /* =====================================================
       SAFETY CHECK
    ===================================================== */

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

                    principal:
                        formatPDFLoanCurrency(
                            row.principal,
                            displayUnit
                        ),

                    interest:
                        formatPDFLoanCurrency(
                            row.interest,
                            displayUnit
                        ),

                    balance:
                        formatPDFLoanCurrency(
                            row.balance,
                            displayUnit
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
                    formatPDFLoanCurrency(
                        loan.principal,
                        displayUnit
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
                    formatPDFLoanCurrency(
                        emi,
                        displayUnit
                    )
            },

            {
                label:
                    "Total Interest",

                value:
                    formatPDFLoanCurrency(
                        totalInterest,
                        displayUnit
                    )
            },

            {
                label:
                    "Total Repayment",

                value:
                    formatPDFLoanCurrency(
                        totalRepayment,
                        displayUnit
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
            `${formatPDFLoanCurrency(
                loan.principal,
                displayUnit
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
                        loan.years,

                    displayUnit:
                        displayUnit?.label ||
                        "Rupees"

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
   PDF CURRENCY WITH SELECTED UNIT
========================================================= */

function formatPDFLoanCurrency(
    value,
    displayUnit
) {

    const amount =
        Number(
            value || 0
        );


    /* =====================================================
       RUPEES
    ===================================================== */

    if (
        !displayUnit ||
        displayUnit.multiplier === 1
    ) {

        return formatPDFCurrency(
            amount
        );

    }


    /* =====================================================
       CONVERT TO SELECTED UNIT
    ===================================================== */

    const converted =
        amount /
        displayUnit.multiplier;


    /* =====================================================
       FORMAT NUMBER
    ===================================================== */

    const formatted =
        new Intl.NumberFormat(
            "en-IN",
            {
                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        ).format(
            converted
        );


    /* =====================================================
       GET UNIT LABEL
    ===================================================== */

    const label =
        String(
            displayUnit.label ||
            ""
        ).trim();


    const normalizedLabel =
        label.toLowerCase();


    /* =====================================================
       INDIAN UNITS
    ===================================================== */

    if (
        normalizedLabel === "lakhs" ||
        normalizedLabel === "crores"
    ) {

        return `INR ${formatted} ${label}`;

    }


    /* =====================================================
       INTERNATIONAL UNITS
    ===================================================== */

    if (
        normalizedLabel === "million" ||
        normalizedLabel === "billion"
    ) {

        return `$${formatted} ${label}`;

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    return `INR ${formatted} ${label}`;

}
