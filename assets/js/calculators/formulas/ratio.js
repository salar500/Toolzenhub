/* Ratio: simplify A : B, and solve the missing term of A : B = C : D.
   Decimals are scaled to whole numbers (up to 6 places) so the greatest
   common divisor is exact. */

import { parseNumber, plain } from "../common/number-text.js";

function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    while (b) {
        [a, b] = [b, a % b];
    }

    return a;

}

/* scale two non-negative decimals to whole numbers; null if one needs more than 6 places */
export function toWhole(a, b) {

    const places = (n) => {
        const s = String(n);
        if (s.includes("e")) return 99;
        const dot = s.indexOf(".");
        return dot === -1 ? 0 : s.length - dot - 1;
    };
    const k = Math.max(places(a), places(b));

    if (k > 6) {
        return null;
    }

    const f = 10 ** k;

    return [Math.round(a * f), Math.round(b * f)];

}

export function simplify(a, b) {

    const whole = toWhole(a, b);

    if (!whole) {
        return null;
    }

    const g = gcd(whole[0], whole[1]) || 1;

    return [whole[0] / g, whole[1] / g];

}

export function solveRatio(values) {

    if (String(values.a).trim() === "" || String(values.b).trim() === "") {
        return { state: "incomplete" };
    }

    const a = parseNumber(values.a);
    const b = parseNumber(values.b);
    const cText = String(values.c ?? "").trim();
    const errors = {};

    if (!Number.isFinite(a) || a < 0 || a > 1e12) errors.a = "Enter the first number as 0 or more (up to 1,000,000,000,000).";
    if (!Number.isFinite(b) || b < 0 || b > 1e12) errors.b = "Enter the second number as 0 or more (up to 1,000,000,000,000).";

    const c = cText === "" ? null : parseNumber(cText);

    if (c !== null && (!Number.isFinite(c) || c < 0 || c > 1e12)) errors.c = "Enter the third number as 0 or more, or leave it empty.";

    if (!errors.a && !errors.b && a === 0 && b === 0) errors.a = "Both numbers are 0, so there is no ratio. Enter at least one number above 0.";

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const s = simplify(a, b);

    if (!s) {
        return { state: "invalid", errors: { a: "Use at most 6 decimal places in each number." } };
    }

    const metrics = [{ label: "Simplest form", value: `${s[0]} : ${s[1]}`, primary: true }];

    if (b !== 0) metrics.push({ label: "First as a multiple of the second", value: plain(a / b, 6) });
    if (a !== 0) metrics.push({ label: "Second as a multiple of the first", value: plain(b / a, 6) });

    metrics.push({ label: "Share of the first in the total", value: `${plain((a / (a + b)) * 100, 4)}%` });
    metrics.push({ label: "Share of the second in the total", value: `${plain((b / (a + b)) * 100, 4)}%` });

    const notes = [];

    if (c !== null) {
        if (a === 0) {
            notes.push("The first number is 0, so the matching second term cannot be found.");
        } else {
            metrics.push({ label: `If the first term is ${plain(c, 6)}, the second term is`, value: plain((b * c) / a, 6) });
        }
    }

    return {
        state: "ok",
        metrics,
        notes,
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
