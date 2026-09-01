/* =========================================================
   ToolZen Hub
   PDF Formattersb
========================================================= */


/* =========================================================
   CURRENCY
========================================================= */

export function formatPDFCurrency(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "₹0";

    }


    return `₹${
        new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 0
            }
        ).format(number)
    }`;

}


/* =========================================================
   NUMBER
========================================================= */

export function formatPDFNumber(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    ).format(number);

}


/* =========================================================
   PERCENTAGE
========================================================= */

export function formatPDFPercentage(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0%";

    }


    return `${number}%`;

}


/* =========================================================
   GENERIC PDF VALUE
========================================================= */

export function formatPDFValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value);

}
