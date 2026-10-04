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


/*
 * A short rupee amount for a chart axis, in the Indian units:
 * 50000 -> "₹50,000", 1000000 -> "₹10L", 25000000 -> "₹2.5Cr".
 */

export function formatINRCompact(value) {

    const amount = Number(value) || 0;

    const trim = (n) =>
        new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2
        }).format(n);

    if (Math.abs(amount) >= 10000000) {
        return `₹${trim(amount / 10000000)}Cr`;
    }

    if (Math.abs(amount) >= 100000) {
        return `₹${trim(amount / 100000)}L`;
    }

    return formatINR(amount);

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
