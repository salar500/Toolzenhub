/* Personal loan: the monthly EMI on a reducing balance, the total interest and, if a processing fee is entered,
   the fee and the total cost. The EMI formula is the one the EMI Calculator uses (formulas/loan.js).
   The fee is the percentage of the loan amount the lender charges; it is added as entered and no tax is assumed. */

import { parseNumber, money, plain } from "../common/number-text.js";
import { calculateEMI } from "./loan.js";

export function solvePersonalLoan(values) {

    if (["amount", "rate", "years"].some((k) => String(values[k]).trim() === "")) {
        return { state: "incomplete" };
    }

    const amount = parseNumber(values.amount);
    const rate = parseNumber(values.rate);
    const years = parseNumber(values.years);
    const feeText = String(values.fee ?? "").trim();
    const fee = feeText === "" ? 0 : parseNumber(feeText);
    const errors = {};

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1e12) errors.amount = "Enter the loan amount as a number greater than 0.";
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) errors.rate = "Enter the yearly interest rate from 0 to 100.";
    if (!Number.isFinite(years) || years <= 0 || years > 40) errors.years = "Enter the tenure in years, greater than 0 and at most 40.";
    if (!Number.isFinite(fee) || fee < 0 || fee > 25) errors.fee = "Enter the processing fee as a percentage from 0 to 25, or leave it empty.";

    if (Object.keys(errors).length) {
        return { state: "invalid", errors };
    }

    const months = Math.round(years * 12);
    const emi = calculateEMI(amount, rate, years);
    const total = emi * months;
    const interest = total - amount;
    const feeAmount = amount * (fee / 100);
    const metrics = [
        { label: "Monthly EMI", value: money(emi), primary: true },
        { label: "Total interest", value: money(interest) },
        { label: "Total repaid (principal + interest)", value: money(total) },
        { label: `Number of EMIs`, value: plain(months, 0) }
    ];

    if (fee > 0) {
        metrics.push(
            { label: `Processing fee (${plain(fee, 2)}% of the loan)`, value: money(feeAmount) },
            { label: "Interest and fee together", value: money(interest + feeAmount) },
            { label: "Total paid including the fee", value: money(total + feeAmount) }
        );
    }

    return {
        state: "ok",
        metrics,
        notes: fee > 0 ? ["The fee is added as entered. Lenders may deduct it from the amount you receive and may add tax; neither is included here."] : [],
        result: { emi, total, interest, feeAmount, months },
        summary: metrics.map((m) => `${m.label}: ${m.value}`).join("\n")
    };

}
