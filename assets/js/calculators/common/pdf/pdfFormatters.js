/* =========================================================
   ToolZen Hub
   PDF Formatters
========================================================= */


/* =========================================================
   CURRENCY
========================================================= */

/*
 * IMPORTANT
 *
 * jsPDF's default Helvetica font does not reliably support
 * the Unicode Indian Rupee symbol (₹).
 *
 * Therefore PDF currency is intentionally rendered as:
 *
 * INR 50,00,000
 *
 * instead of:
 *
 * ₹50,00,000
 *
 * This prevents the broken "¹" character appearing in PDFs.
 *
 * The normal website calculator formatting is NOT affected.
 */

export function formatPDFCurrency(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "INR 0";

    }


    return `INR ${
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
