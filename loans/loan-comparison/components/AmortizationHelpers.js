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


    if (!prefix) {

        return {

            multiplier:
                1,

            label:
                "INR"

        };

    }


    const unitElement =
        document.querySelector(
            `#${prefix}-unit`
        );


    if (!unitElement) {

        return {

            multiplier:
                1,

            label:
                "INR"

        };

    }


    const multiplier =
        Number(
            unitElement.value
        );


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
            : "INR";


    return {

        multiplier:
            Number.isFinite(multiplier) &&
            multiplier > 0
                ? multiplier
                : 1,

        label

    };

}


/* =========================================================
   FORMAT LOAN CURRENCY
========================================================= */

export function formatLoanCurrency(
    value,
    displayUnit
) {

    const amount =
        Number(
            value || 0
        );


    if (
        !displayUnit ||
        !displayUnit.multiplier ||
        displayUnit.multiplier === 1
    ) {

        return formatINR(
            amount
        );

    }


    const converted =
        amount /
        displayUnit.multiplier;


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


    return `₹${formatted} ${displayUnit.label}`;

}


/* =========================================================
   CALCULATE AMORTIZATION TOTALS
========================================================= */

export function getAmortizationTotals(
    loan,
    schedule
) {

    const emi =
        schedule.length > 0

            ? Number(
                schedule[0].principal || 0
            ) +
              Number(
                schedule[0].interest || 0
            )

            : 0;


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


    const totalRepayment =
        Number(
            loan.principal || 0
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
