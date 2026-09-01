import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";


/* =========================================================
   GET LOAN DISPLAY UNIT
========================================================= */

export function getLoanDisplayUnit(
    loanName
) {

    const normalizedName =
        String(
            loanName || ""
        )
        .toLowerCase();


    let prefix =
        "";


    /* =====================================================
       DETERMINE LOAN PREFIX
    ===================================================== */

    if (
        normalizedName.includes("loan a")
    ) {

        prefix =
            "a";

    } else if (
        normalizedName.includes("loan b")
    ) {

        prefix =
            "b";

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    if (!prefix) {

        return {

            multiplier:
                1,

            label:
                "Rupees"

        };

    }


    /* =====================================================
       FIND SELECT
    ===================================================== */

    const unitElement =
        document.querySelector(
            `#${prefix}-unit`
        );


    if (!unitElement) {

        console.warn(
            `Loan ${prefix.toUpperCase()} unit selector not found.`
        );


        return {

            multiplier:
                1,

            label:
                "Rupees"

        };

    }


    /* =====================================================
       GET MULTIPLIER
    ===================================================== */

    const multiplier =
        Number(
            unitElement.value
        );


    /* =====================================================
       GET SELECTED LABEL
    ===================================================== */

    const selectedOption =
        unitElement.options[
            unitElement.selectedIndex
        ];


    const label =
        selectedOption
            ? String(
                selectedOption.textContent ||
                ""
            ).trim()
            : "Rupees";


    /* =====================================================
       VALIDATE MULTIPLIER
    ===================================================== */

    const safeMultiplier =
        Number.isFinite(multiplier) &&
        multiplier > 0

            ? multiplier

            : 1;


    return {

        multiplier:
            safeMultiplier,

        label

    };

}


/* =========================================================
   FORMAT LOAN CURRENCY FOR SCREEN
========================================================= */

export function formatLoanCurrency(
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

        return formatINR(
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
       DISPLAY
    ===================================================== */

    return `₹${formatted} ${displayUnit.label}`;

}


/* =========================================================
   CALCULATE AMORTIZATION TOTALS
========================================================= */

export function getAmortizationTotals(
    loan,
    schedule
) {

    if (
        !Array.isArray(schedule) ||
        schedule.length === 0
    ) {

        return {

            emi:
                0,

            totalInterest:
                0,

            totalRepayment:
                Number(
                    loan?.principal || 0
                )

        };

    }


    /* =====================================================
       EMI
    ===================================================== */

    const emi =
        Number(
            schedule[0]?.principal || 0
        ) +
        Number(
            schedule[0]?.interest || 0
        );


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
                        row?.interest || 0
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
            loan?.principal || 0
        ) +
        totalInterest;


    return {

        emi,

        totalInterest,

        totalRepayment

    };

}


/* =========================================================
   CREATE PDF FILENAME
========================================================= */

export function createPDFFileName(
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
