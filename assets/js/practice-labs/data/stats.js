/* =========================================================
   ToolZen Hub
   Statistics path: small fixed datasets, the statistics functions (real formulas) and numeric exercises whose answers
   are computed from the data, never typed in. Pure; used at build time (tables) and in the browser (checking).
========================================================= */

export const DATASETS = Object.freeze({
    orders: {
        title: "Twelve ShopLite orders",
        columns: ["order", "city", "items", "value", "days"],
        labels: { order: "Order", city: "City", items: "Items", value: "Value (₹)", days: "Delivery days" },
        rows: [
            ["SL-1001", "Pune", 2, 1299, 3], ["SL-1002", "Delhi", 1, 499, 2], ["SL-1003", "Pune", 3, 2150, 4],
            ["SL-1004", "Mumbai", 1, 349, 2], ["SL-1005", "Chennai", 4, 3100, 5], ["SL-1006", "Delhi", 2, 899, 3],
            ["SL-1007", "Pune", 1, 499, 2], ["SL-1008", "Mumbai", 2, 1180, 3], ["SL-1009", "Delhi", 5, 8990, 6],
            ["SL-1010", "Chennai", 1, 599, 4], ["SL-1011", "Mumbai", 3, 1750, 4], ["SL-1012", "Pune", 2, 999, 2]
        ]
    },
    ads: {
        title: "Eight weeks of advertising and sales",
        columns: ["week", "spend", "sales"],
        labels: { week: "Week", spend: "Ad spend (₹ thousand)", sales: "Sales (₹ thousand)" },
        rows: [[1, 10, 120], [2, 12, 131], [3, 8, 109], [4, 15, 150], [5, 20, 171], [6, 18, 166], [7, 5, 95], [8, 14, 140]]
    }
});

export const column = (datasetId, name) => {
    const d = DATASETS[datasetId];
    const i = d.columns.indexOf(name);
    if (i < 0) throw new Error(`unknown column ${datasetId}.${name}`);
    return d.rows.map((r) => r[i]);
};

const sorted = (xs) => [...xs].sort((a, b) => a - b);
export const sum = (xs) => xs.reduce((s, x) => s + x, 0);
export const mean = (xs) => sum(xs) / xs.length;
export const median = (xs) => { const s = sorted(xs), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export const mode = (xs) => { const c = new Map(); for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1); return [...c].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]; };
export const range = (xs) => Math.max(...xs) - Math.min(...xs);
/* sample variance and standard deviation (n − 1), as Excel's VAR.S and STDEV.S */
export const variance = (xs) => { const m = mean(xs); return sum(xs.map((x) => (x - m) ** 2)) / (xs.length - 1); };
export const stdev = (xs) => Math.sqrt(variance(xs));
/* percentile with linear interpolation between closest ranks, as Excel's PERCENTILE.INC */
export const percentile = (xs, p) => { const s = sorted(xs), h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
export const iqr = (xs) => percentile(xs, 0.75) - percentile(xs, 0.25);
export const correlation = (xs, ys) => {
    const mx = mean(xs), my = mean(ys);
    const cov = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
    return cov / Math.sqrt(sum(xs.map((x) => (x - mx) ** 2)) * sum(ys.map((y) => (y - my) ** 2)));
};
/* least-squares line y = a + b·x */
export const slope = (xs, ys) => { const mx = mean(xs), my = mean(ys); return sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / sum(xs.map((x) => (x - mx) ** 2)); };

const FN = {
    sum: (d, c) => sum(column(d, c)), mean: (d, c) => mean(column(d, c)), median: (d, c) => median(column(d, c)),
    mode: (d, c) => mode(column(d, c)), range: (d, c) => range(column(d, c)), stdev: (d, c) => stdev(column(d, c)),
    p90: (d, c) => percentile(column(d, c), 0.9), iqr: (d, c) => iqr(column(d, c)),
    correlation: (d, c, c2) => correlation(column(d, c), column(d, c2)), slope: (d, c, c2) => slope(column(d, c), column(d, c2)),
    countWhere: (d, c, c2, value) => column(d, c).filter((x) => x === value).length,
    meanWhere: (d, c, c2, value) => { const keys = column(d, c), xs = column(d, c2); const sel = xs.filter((_, i) => keys[i] === value); return mean(sel); },
    shareAbove: (d, c, c2, value) => column(d, c).filter((x) => x > value).length / DATASETS[d].rows.length * 100
};

export const NUMERIC = Object.freeze([
    { id: "st-n-mean-value", dataset: "orders", fn: "mean", column: "value", decimals: 2, task: "What is the mean (average) order value?", explain: "Add the twelve values (22,313) and divide by 12. Excel: =AVERAGE(D2:D13)." },
    { id: "st-n-median-value", dataset: "orders", fn: "median", column: "value", decimals: 2, task: "What is the median order value?", explain: "Sort the values; with 12 of them the median is the average of the 6th and 7th (999 and 1180). The single ₹8,990 order pulls the mean far above it." },
    { id: "st-n-mode-days", dataset: "orders", fn: "mode", column: "days", decimals: 0, task: "What is the most common (modal) delivery time, in days?", explain: "2 days occurs four times, more than any other value. Excel: =MODE.SNGL(E2:E13)." },
    { id: "st-n-range-days", dataset: "orders", fn: "range", column: "days", decimals: 0, task: "What is the range of delivery days?", explain: "Largest minus smallest: 6 − 2." },
    { id: "st-n-stdev-days", dataset: "orders", fn: "stdev", column: "days", decimals: 2, task: "What is the sample standard deviation of delivery days? (Use n − 1, as STDEV.S does.)", explain: "Mean 3.33; square each difference from the mean, add them (18.67), divide by 11 and take the square root. Excel: =STDEV.S(E2:E13)." },
    { id: "st-n-p90-value", dataset: "orders", fn: "p90", column: "value", decimals: 2, task: "What is the 90th percentile of order value (PERCENTILE.INC)?", explain: "Position (12 − 1) × 0.9 = 9.9 in the sorted list (counting from 0): 2,150 + 0.9 × (3,100 − 2,150) = 3,005. The one very large order barely moves it." },
    { id: "st-n-iqr-value", dataset: "orders", fn: "iqr", column: "value", decimals: 2, task: "What is the interquartile range (Q3 − Q1) of order value, using PERCENTILE.INC?", explain: "Q1 at position 2.75 and Q3 at position 8.25 of the sorted values; the IQR describes the middle half and ignores the outlier." },
    { id: "st-n-count-pune", dataset: "orders", fn: "countWhere", column: "city", value: "Pune", decimals: 0, task: "How many orders came from Pune?", explain: "Excel: =COUNTIF(B2:B13, \"Pune\")." },
    { id: "st-n-mean-delhi", dataset: "orders", fn: "meanWhere", column: "city", column2: "value", value: "Delhi", decimals: 2, task: "What is the mean order value for Delhi?", explain: "(499 + 899 + 8,990) ÷ 3. Excel: =AVERAGEIF(B2:B13, \"Delhi\", D2:D13). One large order dominates a small group." },
    { id: "st-n-share-free", dataset: "orders", fn: "shareAbove", column: "value", value: 999, decimals: 1, task: "What percentage of orders are above ₹999 (and so ship free)?", explain: "6 of 12 orders are above ₹999 (₹999 itself is not above it): 50%." },
    { id: "st-n-correlation", dataset: "ads", fn: "correlation", column: "spend", column2: "sales", decimals: 3, task: "What is the correlation coefficient (Pearson's r) between ad spend and sales?", explain: "r near +1 means a strong positive straight-line relationship. Excel: =CORREL(B2:B9, C2:C9). It does not show that spending caused the sales." },
    { id: "st-n-slope", dataset: "ads", fn: "slope", column: "spend", column2: "sales", decimals: 2, task: "What is the slope of the least-squares line of sales on spend (sales gained per extra ₹1 thousand of spend)?", explain: "Excel: =SLOPE(C2:C9, B2:B9). Use it only within the range of spend you observed." }
]);

export const answerOf = (ex) => FN[ex.fn](ex.dataset, ex.column, ex.column2, ex.value);

/* the learner's number is accepted when it rounds to the answer at the exercise's precision; commas and ₹ are ignored */
export function checkNumeric(ex, input) {
    const raw = String(input ?? "").replace(/[₹,%\s]/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(raw)) return { ok: false, reason: "Enter a number, for example 1234.5." };
    const want = answerOf(ex);
    const tolerance = 0.5 * 10 ** -ex.decimals + 1e-9;
    return Math.abs(Number(raw) - want) <= tolerance ? { ok: true } : { ok: false, reason: "Not yet. Check the data and the formula, then try again." };
}

export const formatAnswer = (ex) => answerOf(ex).toFixed(ex.decimals);
