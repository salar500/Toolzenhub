/* ROI: return on investment. Pure arithmetic on the entered numbers.
   ROI % = (final value - amount invested) / amount invested x 100.
   Annualised (optional years) = ((final / invested) ^ (1 / years) - 1) x 100. */

import { parseNumber, money, plain } from "../common/number-text.js";

const MAX = 1e15;

export function solveRoi(values) {

    if (String(values.invested).trim() === "" || String(values.final).trim() === "") {
        return { state: "incomplete" };
    }

    const invested = parseNumber(values.invested);
    const final = parseNumber(values.final);
    const yearsText = String(values.years ?? "").trim();
    const errors = {};

    if (!Number.isFinite(invested) || invested <= 0 || invested > MAX) {
        errors.invested = "Enter the amount invested as a number greater than 0.";
    }

    if (!Number.isFinite(final) || final < 0 || final > MAX) {
        errors.final = "Enter the final value as a number, 0 or more.";
    }

    const years = yearsText === "" ? null : parseNumber(yearsText);

    if (years !== null && (!Number.isFinite(years) || years <= 0 || years > 100)) {
        errors.years = "Enter the years as a number greater than 0 and at most 100, or leave it empty.";
    }

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const profit = final - invested;
    const roi = (profit / invested) * 100;
    const metrics = [
        { label: "Return on investment", value: `${plain(roi, 2)}%`, primary: true },
        { label: profit >= 0 ? "Net profit" : "Net loss", value: money(Math.abs(profit)) },
        { label: "Final value as a multiple of the amount invested", value: `${plain(final / invested, 4)}x` }
    ];
    const notes = [];
    let annual = null;

    if (years !== null) {
        if (final === 0) {
            notes.push("The final value is 0, so the whole amount was lost; no yearly rate is shown.");
        } else {
            annual = (Math.pow(final / invested, 1 / years) - 1) * 100;
            metrics.push({ label: `Annualised return over ${plain(years, 2)} years`, value: `${plain(annual, 2)}% a year` });
        }
    }

    return {
        state: "ok",
        metrics,
        notes,
        result: { profit, roi, annual },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
