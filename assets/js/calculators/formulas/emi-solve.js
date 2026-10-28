/* =========================================================
   ToolZen Hub
   EMI solving: how long, and at what rate

   Pure functions (no DOM). The EMI itself and the schedule for a
   known tenure stay in loan.js; this file answers the two
   reverse questions with the same convention:

   - reducing balance, monthly rate = annual rate / 12;
   - interest each month on the balance at the start of that month;
   - the payment is made at the end of the month;
   - no fees, insurance or taxes.

   TENURE (payoffSchedule)
     The balance is stepped month by month with the EMI the
     visitor gives; the last payment is whatever clears the
     balance. (-ln(1 - P r / E) / ln(1 + r) is the closed form;
     tests use it as an independent cross-check, the tool does
     not.) If the EMI does not exceed the first month's interest
     the balance never falls. Beyond MAX_PAYMENTS (50 years) the
     tool says so instead of listing more.

   RATE (rateForEmi)
     The EMI rises with the rate, so the annual rate that gives
     the entered EMI is found by bisection on the monthly rate.
========================================================= */

export const MAX_PAYMENTS = 600;

/* a balance below half a paisa is cleared by the payment being made */
const CLEARED = 0.005;

/* EMI for a monthly rate; the form P r / (1 - (1 + r)^-n) cannot overflow */
function emiAtMonthlyRate(principal, r, months) {
    if (r === 0) {
        return principal / months;
    }
    return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function payoffSchedule(principal, annualRate, emi, maxPayments = MAX_PAYMENTS) {
    principal = Number(principal);
    annualRate = Number(annualRate);
    emi = Number(emi);
    if (
        !Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(emi) ||
        principal <= 0 || annualRate < 0 || emi <= 0
    ) {
        return { state: "invalid", rows: [] };
    }
    const r = annualRate / 12 / 100;
    const firstInterest = principal * r;

    if (r > 0 && emi <= firstInterest) {
        return { state: "non-amortizing", firstInterest, rows: [] };
    }

    const rows = [];
    let balance = principal;
    let totalInterest = 0;
    let totalPayment = 0;

    for (let month = 1; month <= maxPayments; month++) {
        const interest = balance * r;
        const due = balance + interest;
        const clears = due - emi < CLEARED;
        const payment = clears ? due : emi;
        const principalPaid = payment - interest;
        balance = clears ? 0 : balance - principalPaid;
        totalInterest += interest;
        totalPayment += payment;
        rows.push({ month, emi: payment, principal: principalPaid, interest, balance });
        if (clears) {
            return {
                state: "payoff",
                payments: month,
                lastPayment: payment,
                firstInterest,
                totalInterest,
                totalPayment,
                rows
            };
        }
    }
    return { state: "beyond-horizon", firstInterest, rows };
}

export function rateForEmi(principal, months, emi) {
    principal = Number(principal);
    months = Number(months);
    emi = Number(emi);
    if (
        !Number.isFinite(principal) || !Number.isFinite(months) || !Number.isFinite(emi) ||
        principal <= 0 || months < 1 || emi <= 0
    ) {
        return { state: "invalid" };
    }
    const total = emi * months;
    if (Math.abs(total - principal) <= CLEARED) {
        return { state: "ok", annualRate: 0 };
    }
    if (total < principal) {
        return { state: "too-low" };
    }
    /* up to 100% a month; an EMI that needs more than that is not a loan this page models */
    let low = 0;
    let high = 1;
    if (emiAtMonthlyRate(principal, high, months) < emi) {
        return { state: "too-high" };
    }
    for (let i = 0; i < 200 && high - low > 1e-13; i++) {
        const mid = (low + high) / 2;
        if (emiAtMonthlyRate(principal, mid, months) < emi) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return { state: "ok", annualRate: ((low + high) / 2) * 12 * 100 };
}

/* one row per year of payments: principal and interest paid, closing balance */
export function yearlySummary(rows) {
    const years = [];
    for (const row of rows) {
        const index = Math.ceil(row.month / 12) - 1;
        const year = years[index] || (years[index] = { year: index + 1, principal: 0, interest: 0, balance: 0 });
        year.principal += row.principal;
        year.interest += row.interest;
        year.balance = row.balance;
    }
    return years;
}
