/* Number parsing and display helpers shared by the simple calculators. No imports, so the pure formula modules
   (and their unit tests) do not depend on the page. */

/* a decimal typed with grouping or spaces ("1,25,000.50") as a number, or NaN */
export function parseNumber(text) {

    const cleaned = String(text ?? "").replace(/[,\s]/g, "");

    if (cleaned === "" || !/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) {
        return NaN;
    }

    return Number(cleaned);

}

export function todayIso(now = new Date()) {

    const p = (n) => String(n).padStart(2, "0");

    return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;

}

/* Indian digit grouping with fixed decimals: 1234567.5 -> "12,34,567.50" */
export function money(value, decimals = 2) {

    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

}

export function plain(value, decimals = 2) {

    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });

}
