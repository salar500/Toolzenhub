/* Loan eligibility estimate. Lenders decide with their own rules; a common one is that all monthly loan payments
   (existing EMIs plus the new one) stay within a share of monthly income, often called the FOIR (fixed obligation to
   income ratio). This page uses the share the VISITOR enters, not a lender's figure:

       affordable EMI = monthly income x share / 100 - existing EMIs        (0 if negative)
       loan amount    = EMI x (1 - (1 + i)^-n) / i,  i = monthly rate, n = months   (EMI x n when the rate is 0)

   It is arithmetic on the entered numbers, not an approval, an offer or a lender's decision. */

import { parseNumber, money, plain } from "../common/number-text.js";

export function loanForEmi(emi, annualRatePercent, months) {

    const i = annualRatePercent / 12 / 100;

    if (i === 0) {
        return emi * months;
    }

    return emi * (1 - Math.pow(1 + i, -months)) / i;

}

export function solveLoanEligibility(values) {

    if (["income", "share", "rate", "years"].some((k) => String(values[k]).trim() === "")) {
        return { state: "incomplete" };
    }

    const income = parseNumber(values.income);
    const existing = String(values.existing ?? "").trim() === "" ? 0 : parseNumber(values.existing);
    const share = parseNumber(values.share);
    const rate = parseNumber(values.rate);
    const years = parseNumber(values.years);
    const errors = {};

    if (!Number.isFinite(income) || income <= 0 || income > 1e10) errors.income = "Enter your monthly income as a number greater than 0.";
    if (!Number.isFinite(existing) || existing < 0 || existing > 1e10) errors.existing = "Enter your existing monthly EMIs as 0 or more, or leave it empty.";
    if (!Number.isFinite(share) || share <= 0 || share > 100) errors.share = "Enter the share of income for loan payments, above 0 and at most 100.";
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) errors.rate = "Enter the yearly interest rate from 0 to 100.";
    if (!Number.isFinite(years) || years <= 0 || years > 40) errors.years = "Enter the tenure in years, greater than 0 and at most 40.";

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const months = Math.round(years * 12);
    const room = income * (share / 100);
    const emi = Math.max(0, room - existing);
    const loan = loanForEmi(emi, rate, months);
    const metrics = [
        { label: "Loan amount this EMI could support", value: money(loan), primary: true },
        { label: "Highest new EMI within your share", value: money(emi) },
        { label: `Total monthly loan payments allowed (${plain(share, 2)}% of income)`, value: money(room) },
        { label: "Existing EMIs", value: money(existing) }
    ];
    const notes = [];

    if (emi === 0) {
        notes.push("Your existing EMIs already use all of the share you entered, so no new EMI fits. Raise the share, or lower the existing EMIs, to see an amount.");
    }

    return {
        state: "ok",
        metrics,
        notes,
        result: { loan, emi, room, months },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
