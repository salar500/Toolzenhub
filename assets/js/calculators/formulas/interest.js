/* Interest: simple and compound.
   Simple: I = P x r x t.   Compound: A = P (1 + r / n) ^ (n t),  I = A - P.
   r is the yearly rate as a fraction, t is in years, n is the number of
   compounding periods a year. */

import { parseNumber, money, plain } from "../common/number-text.js";

export const FREQUENCIES = [
    { value: "1", label: "Yearly" },
    { value: "2", label: "Half-yearly" },
    { value: "4", label: "Quarterly" },
    { value: "12", label: "Monthly" },
    { value: "365", label: "Daily (365 a year)" }
];

export function simpleInterest(principal, ratePercent, years) {

    return principal * (ratePercent / 100) * years;

}

export function compoundAmount(principal, ratePercent, years, perYear) {

    return principal * Math.pow(1 + ratePercent / 100 / perYear, perYear * years);

}

export function solveInterest(values) {

    if (["principal", "rate", "years"].some((k) => String(values[k]).trim() === "")) {
        return { state: "incomplete" };
    }

    const principal = parseNumber(values.principal);
    const rate = parseNumber(values.rate);
    const years = parseNumber(values.years);
    const perYear = Number(values.frequency || "1");
    const errors = {};

    if (!Number.isFinite(principal) || principal <= 0 || principal > 1e12) errors.principal = "Enter the principal as a number greater than 0.";
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) errors.rate = "Enter the yearly rate from 0 to 100.";
    if (!Number.isFinite(years) || years <= 0 || years > 100) errors.years = "Enter the time in years, greater than 0 and at most 100.";

    const frequency = FREQUENCIES.find((f) => Number(f.value) === perYear);

    if (!frequency) errors.frequency = "Choose how often the interest is added.";

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const simple = simpleInterest(principal, rate, years);
    const amount = compoundAmount(principal, rate, years, perYear);
    const compound = amount - principal;
    const metrics = [
        { label: "Compound interest", value: money(compound), primary: true },
        { label: "Amount after compounding", value: money(amount) },
        { label: "Simple interest on the same figures", value: money(simple) },
        { label: "Amount with simple interest", value: money(principal + simple) },
        { label: "Compound minus simple", value: money(compound - simple) }
    ];

    return {
        state: "ok",
        metrics,
        notes: [`Compounding ${frequency.label.toLowerCase()}: the interest is added to the balance ${plain(perYear)} time${perYear === 1 ? "" : "s"} a year.`],
        result: { simple, compound, amount },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
