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
