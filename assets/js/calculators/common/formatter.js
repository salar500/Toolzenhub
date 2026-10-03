/* =========================================================
   ToolZen Hub
   Calculator Formatter
========================================================= */

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
});


export function formatINR(value) {

    return inrFormatter.format(
        Number(value) || 0
    );

}


export function formatNumber(
    value,
    decimals = 2
) {

    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(
        Number(value) || 0
    );

}


export function formatPercent(
    value,
    decimals = 2
) {

    return `${formatNumber(value, decimals)}%`;

}


/*
 * A length of time given in months, as years and months:
 * 0 -> "0 months", 12 -> "1 year", 186 -> "15 years 6 months".
 * Anything that is not a positive number is zero months.
 */

export function formatDuration(
    totalMonths
) {

    const value =
        Number(totalMonths);

    const total =
        Number.isFinite(value)
            ? Math.max(0, Math.round(value))
            : 0;

    const years =
        Math.floor(total / 12);

    const months =
        total % 12;

    const parts = [];

    if (years) {

        parts.push(
            `${years} ${years === 1 ? "year" : "years"}`
        );

    }

    if (months || !years) {

        parts.push(
            `${months} ${months === 1 ? "month" : "months"}`
        );

    }

    return parts.join(" ");

}
