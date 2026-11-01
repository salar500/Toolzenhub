/* =========================================================
   ToolZen Hub
   Risk-Reward and Position Size: the arithmetic (pure module)

   Prices, an account size and a risk percentage go in as text;
   exact figures come out as text. No Date, no DOM, no storage, no
   network. Everything is exact BigInt fractions and is rounded only
   when a figure is written out (half up).

   This is arithmetic on the visitor's own numbers. It does not know
   any market, fee, slippage, tax or leverage, and it never calls a
   ratio good or bad. Specification: docs/tool-packs/51-risk-reward-calculator.md
========================================================= */

export const SIDES = Object.freeze(["long", "short"]);

export const LIMITS = Object.freeze({
    maxPrice: 1_000_000_000n,
    maxAccount: 1_000_000_000_000n,
    priceDecimals: 6,
    percentDecimals: 4
});

export const DEFAULT_INPUTS = Object.freeze({
    side: "long",
    entry: "",
    stop: "",
    target: "",
    account: "",
    riskPercent: ""
});

/* ---------- exact fractions ---------- */

function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b) [a, b] = [b, a % b];
    return a;
}

function frac(n, d = 1n) {
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    return { n: n / g, d: d / g };
}

const add = (x, y) => frac(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => frac(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => frac(x.n * y.n, x.d * y.d);
const div = (x, y) => frac(x.n * y.d, x.d * y.n);
const cmp = (x, y) => {
    const l = x.n * y.d;
    const r = y.n * x.d;
    return l < r ? -1 : l > r ? 1 : 0;
};

function floorFrac(x) {
    let q = x.n / x.d;
    if (x.n < 0n && x.n % x.d !== 0n) q -= 1n;
    return q;
}

/* Round half up (away from zero for ties on positives; inputs here are not negative except differences, handled by sign) */
function toDecimalText(x, places) {
    const neg = x.n < 0n;
    const absN = neg ? -x.n : x.n;
    const scale = 10n ** BigInt(places);
    let scaled = (absN * scale * 2n + x.d) / (x.d * 2n);
    const whole = scaled / scale;
    const rest = scaled % scale;
    const text = places > 0
        ? `${whole}.${rest.toString().padStart(places, "0")}`
        : `${whole}`;
    return neg && scaled !== 0n ? `-${text}` : text;
}

function groupIndian(digits) {
    if (digits.length <= 3) return digits;
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return `${rest},${last3}`;
}

/* Text for display with Indian digit grouping, e.g. "1,00,000.00". */
export function groupedText(decimalText) {
    const neg = decimalText.startsWith("-");
    const [whole, dec] = decimalText.replace("-", "").split(".");
    return `${neg ? "-" : ""}${groupIndian(whole)}${dec !== undefined ? `.${dec}` : ""}`;
}

/* ---------- parsing ---------- */

/* Returns { state:"empty" } | { state:"error", message } | { state:"ok", value:<fraction> } */
export function parseDecimal(raw, { decimals, label }) {
    const text = String(raw ?? "").replace(/[,\s]/g, "");
    if (text === "") return { state: "empty" };
    const m = /^(\d+)(?:\.(\d+))?$/.exec(text);
    if (!m) {
        return { state: "error", message: `${label} must be a positive number such as 125.50.` };
    }
    const frag = m[2] ?? "";
    if (frag.length > decimals) {
        return { state: "error", message: `${label} can have at most ${decimals} decimal places.` };
    }
    const scale = 10n ** BigInt(frag.length);
    return { state: "ok", value: frac(BigInt(m[1]) * scale + BigInt(frag || "0"), scale) };
}

/* ---------- the model ---------- */

/*
 * input: strings (see DEFAULT_INPUTS).
 * Returns { state:"incomplete", missing:[...] }
 *       | { state:"invalid", errors:{ field: message } }
 *       | { state:"ok", result }
 * Never returns a figure for an incomplete or invalid entry.
 */
export function solveRiskReward(input) {
    const raw = { ...DEFAULT_INPUTS, ...(input || {}) };
    const side = raw.side === "short" ? "short" : raw.side === "long" ? "long" : null;
    if (!side) return { state: "invalid", errors: { side: "Choose Long or Short." } };

    const errors = {};
    const missing = [];
    const maxPrice = frac(LIMITS.maxPrice);
    const zero = frac(0n);

    const priceFields = [
        ["entry", "Entry price"],
        ["stop", "Stop-loss price"],
        ["target", "Target price"]
    ];
    const p = {};
    for (const [key, label] of priceFields) {
        const r = parseDecimal(raw[key], { decimals: LIMITS.priceDecimals, label });
        if (r.state === "empty") { missing.push(key); continue; }
        if (r.state === "error") { errors[key] = r.message; continue; }
        if (cmp(r.value, zero) <= 0) { errors[key] = `${label} must be greater than zero.`; continue; }
        if (cmp(r.value, maxPrice) > 0) { errors[key] = `${label} can be at most 1,00,00,00,000.`; continue; }
        p[key] = r.value;
    }

    const accountR = parseDecimal(raw.account, { decimals: 2, label: "Account size" });
    const pctR = parseDecimal(raw.riskPercent, { decimals: LIMITS.percentDecimals, label: "Risk per trade" });
    let account = null;
    let pct = null;
    if (accountR.state === "error") errors.account = accountR.message;
    else if (accountR.state === "ok") {
        if (cmp(accountR.value, zero) <= 0) errors.account = "Account size must be greater than zero.";
        else if (cmp(accountR.value, frac(LIMITS.maxAccount)) > 0) errors.account = "Account size can be at most 10,00,00,00,00,000.";
        else account = accountR.value;
    }
    if (pctR.state === "error") errors.riskPercent = pctR.message;
    else if (pctR.state === "ok") {
        if (cmp(pctR.value, zero) <= 0) errors.riskPercent = "Risk per trade must be greater than 0%.";
        else if (cmp(pctR.value, frac(100n)) > 0) errors.riskPercent = "Risk per trade can be at most 100%.";
        else pct = pctR.value;
    }
    if (accountR.state === "empty" && pctR.state === "ok" && !errors.riskPercent) {
        errors.account = "Enter the account size to size the position, or clear the risk percentage.";
    }
    if (accountR.state === "ok" && pctR.state === "empty" && !errors.account) {
        errors.riskPercent = "Enter the risk per trade (for example 1) to size the position, or clear the account size.";
    }

    if (Object.keys(errors).length) return { state: "invalid", errors };
    if (missing.length) return { state: "incomplete", missing };

    const { entry, stop, target } = p;
    const long = side === "long";
    if (long) {
        if (cmp(stop, entry) >= 0) errors.stop = "For a long trade the stop-loss must be below the entry price.";
        if (cmp(target, entry) <= 0) errors.target = "For a long trade the target must be above the entry price.";
    } else {
        if (cmp(stop, entry) <= 0) errors.stop = "For a short trade the stop-loss must be above the entry price.";
        if (cmp(target, entry) >= 0) errors.target = "For a short trade the target must be below the entry price.";
    }
    if (Object.keys(errors).length) return { state: "invalid", errors };

    const riskPerUnit = long ? sub(entry, stop) : sub(stop, entry);
    const rewardPerUnit = long ? sub(target, entry) : sub(entry, target);
    const ratio = div(rewardPerUnit, riskPerUnit);
    const breakEven = div(riskPerUnit, add(riskPerUnit, rewardPerUnit));

    const result = {
        side,
        riskPerUnit: toDecimalText(riskPerUnit, 2),
        rewardPerUnit: toDecimalText(rewardPerUnit, 2),
        riskPercentOfEntry: toDecimalText(mul(div(riskPerUnit, entry), frac(100n)), 2),
        rewardPercentOfEntry: toDecimalText(mul(div(rewardPerUnit, entry), frac(100n)), 2),
        ratio: toDecimalText(ratio, 2),
        breakEvenWinRate: toDecimalText(mul(breakEven, frac(100n)), 2),
        sizing: null
    };

    if (account && pct) {
        const riskAmount = div(mul(account, pct), frac(100n));
        const quantity = floorFrac(div(riskAmount, riskPerUnit));
        const q = frac(quantity);
        const value = mul(q, entry);
        result.sizing = {
            riskAmount: toDecimalText(riskAmount, 2),
            quantity: quantity.toString(),
            positionValue: toDecimalText(value, 2),
            positionPercentOfAccount: toDecimalText(mul(div(value, account), frac(100n)), 2),
            lossAtStop: toDecimalText(mul(q, riskPerUnit), 2),
            gainAtTarget: toDecimalText(mul(q, rewardPerUnit), 2),
            exceedsAccount: cmp(value, account) > 0,
            belowOneUnit: quantity === 0n
        };
    }

    return { state: "ok", result };
}
