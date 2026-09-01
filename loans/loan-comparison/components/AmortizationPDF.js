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
        button?.textContent || "Download PDF";


    if (button) {

        button.disabled = true;

        button.textContent =
            "Preparing PDF...";

    }


    try {

        /* =================================================
           DEBUG
           Remove later if not needed
        ================================================= */

        console.log(
            "PDF displayUnit:",
            displayUnit
        );


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
                        getDisplayUnitLabel(
                            displayUnit
                        )

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

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}


/* =========================================================
   PDF CURRENCY
   SUPPORTS:
   - Object
   - Number
   - String
   ========================================================= */

function formatPDFLoanCurrency(
    value,
    displayUnit
) {

    const amount =
        Number(value || 0);


    /* =====================================================
       NORMALIZE DISPLAY UNIT
    ===================================================== */

    const unit =
        normalizeDisplayUnit(
            displayUnit
        );


    /* =====================================================
       RUPEES
    ===================================================== */

    if (
        unit.multiplier === 1
    ) {

        return formatPDFCurrency(
            amount
        );

    }


    /* =====================================================
       CONVERT
    ===================================================== */

    const converted =
        amount /
        unit.multiplier;


    /* =====================================================
       FORMAT
    ===================================================== */

    const formatted =
        new Intl.NumberFormat(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(
            converted
        );


    /* =====================================================
       INDIAN UNITS
    ===================================================== */

    if (
        unit.type === "lakhs"
    ) {

        return `₹${formatted} Lakhs`;

    }


    if (
        unit.type === "crores"
    ) {

        return `₹${formatted} Crores`;

    }


    if (
        unit.type === "thousands"
    ) {

        return `₹${formatted} Thousands`;

    }


    if (
        unit.type === "millions"
    ) {

        return `₹${formatted} Millions`;

    }


    if (
        unit.type === "billions"
    ) {

        return `₹${formatted} Billions`;

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    return `₹${formatted} ${unit.label}`;

}


/* =========================================================
   NORMALIZE DISPLAY UNIT
========================================================= */

function normalizeDisplayUnit(
    displayUnit
) {

    /* =====================================================
       OBJECT
    ===================================================== */

    if (
        displayUnit &&
        typeof displayUnit === "object"
    ) {

        const multiplier =
            Number(
                displayUnit.multiplier
            );


        const label =
            String(
                displayUnit.label || ""
            ).trim();


        if (
            Number.isFinite(multiplier) &&
            multiplier > 0
        ) {

            return {
                multiplier,
                label,
                type:
                    detectUnitType(
                        label,
                        multiplier
                    )
            };

        }

    }


    /* =====================================================
       NUMBER
       Example:
       1
       1000
       100000
       10000000
    ===================================================== */

    if (
        typeof displayUnit === "number"
    ) {

        return normalizeMultiplier(
            displayUnit
        );

    }


    /* =====================================================
       STRING
       Example:
       "Lakhs"
       "Crores"
       "100000"
    ===================================================== */

    if (
        typeof displayUnit === "string"
    ) {

        const trimmed =
            displayUnit
                .trim();


        const numeric =
            Number(
                trimmed
            );


        if (
            Number.isFinite(numeric) &&
            numeric > 0
        ) {

            return normalizeMultiplier(
                numeric
            );

        }


        const normalized =
            trimmed.toLowerCase();


        if (
            normalized === "thousand" ||
            normalized === "thousands"
        ) {

            return {
                multiplier: 1000,
                label: "Thousands",
                type: "thousands"
            };

        }


        if (
            normalized === "lakh" ||
            normalized === "lakhs"
        ) {

            return {
                multiplier: 100000,
                label: "Lakhs",
                type: "lakhs"
            };

        }


        if (
            normalized === "crore" ||
            normalized === "crores"
        ) {

            return {
                multiplier: 10000000,
                label: "Crores",
                type: "crores"
            };

        }


        if (
            normalized === "million" ||
            normalized === "millions"
        ) {

            return {
                multiplier: 1000000,
                label: "Millions",
                type: "millions"
            };

        }


        if (
            normalized === "billion" ||
            normalized === "billions"
        ) {

            return {
                multiplier: 1000000000,
                label: "Billions",
                type: "billions"
            };

        }

    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    return {
        multiplier: 1,
        label: "Rupees",
        type: "rupees"
    };

}


/* =========================================================
   NORMALIZE MULTIPLIER
========================================================= */

function normalizeMultiplier(
    multiplier
) {

    if (
        multiplier === 1000
    ) {

        return {
            multiplier: 1000,
            label: "Thousands",
            type: "thousands"
        };

    }


    if (
        multiplier === 100000
    ) {

        return {
            multiplier: 100000,
            label: "Lakhs",
            type: "lakhs"
        };

    }


    if (
        multiplier === 10000000
    ) {

        return {
            multiplier: 10000000,
            label: "Crores",
            type: "crores"
        };

    }


    if (
        multiplier === 1000000
    ) {

        return {
            multiplier: 1000000,
            label: "Millions",
            type: "millions"
        };

    }


    if (
        multiplier === 1000000000
    ) {

        return {
            multiplier: 1000000000,
            label: "Billions",
            type: "billions"
        };

    }


    return {
        multiplier: 1,
        label: "Rupees",
        type: "rupees"
    };

}


/* =========================================================
   DETECT UNIT TYPE
========================================================= */

function detectUnitType(
    label,
    multiplier
) {

    const normalized =
        String(
            label || ""
        )
        .toLowerCase()
        .trim();


    if (
        normalized.includes("lakh")
    ) {

        return "lakhs";

    }


    if (
        normalized.includes("crore")
    ) {

        return "crores";

    }


    if (
        normalized.includes("thousand")
    ) {

        return "thousands";

    }


    if (
        normalized.includes("million")
    ) {

        return "millions";

    }


    if (
        normalized.includes("billion")
    ) {

        return "billions";

    }


    return detectUnitTypeFromMultiplier(
        multiplier
    );

}


/* =========================================================
   DETECT FROM MULTIPLIER
========================================================= */

function detectUnitTypeFromMultiplier(
    multiplier
) {

    if (
        multiplier === 1000
    ) {

        return "thousands";

    }


    if (
        multiplier === 100000
    ) {

        return "lakhs";

    }


    if (
        multiplier === 10000000
    ) {

        return "crores";

    }


    if (
        multiplier === 1000000
    ) {

        return "millions";

    }


    if (
        multiplier === 1000000000
    ) {

        return "billions";

    }


    return "rupees";

}


/* =========================================================
   DISPLAY UNIT LABEL
========================================================= */

function getDisplayUnitLabel(
    displayUnit
) {

    const unit =
        normalizeDisplayUnit(
            displayUnit
        );


    return unit.label;

}
