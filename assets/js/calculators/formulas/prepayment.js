/* =========================================================
   ToolZen Hub
   Loan Prepayment: pure calculation and input validation

   No DOM and no formatting: everything here is a plain function
   of numbers, so it can be tested on its own. The page
   (calculators/prepayment/index.js) only reads fields, calls
   these functions and shows what they return.

   MODEL (the standard reducing-balance loan, the same model as
   formulas/loan.js)

       i      monthly rate = annual rate / 12 / 100
       n      payments still to make; one EMI at the end of each month
       EMI    = P i (1+i)^n / ((1+i)^n - 1)       (calculateEMI)
       B_k    the balance after k EMIs

   TIMING CONVENTION. A prepayment L is applied IMMEDIATELY AFTER
   EMI number k (k = 0: before the next EMI). It reduces the
   balance to B' = B_k - L. If L is at least B_k the loan is
   cleared at that point and only B_k is needed.

   After the prepayment, two outcomes:

     KEEP EMI    The EMI stays the same, so the loan ends sooner.
                 Months after the prepayment, in closed form:
                     m = ceil( -ln(1 - B' i / EMI) / ln(1 + i) )
                 (here found by stepping month by month, which
                 gives the same answer and also the schedule).
                 The last payment is whatever balance is left plus
                 its interest.

     REDUCE EMI  The end date stays the same; the EMI is worked
                 out again for the remaining n - k payments:
                     EMI' = B' i (1+i)^(n-k) / ((1+i)^(n-k) - 1)

   Interest saved = total interest without the prepayment minus
   total interest with it. Nothing is rounded here; callers round
   for display only (as the other tools do). A balance of half a
   paisa or less counts as repaid, so a floating-point crumb never
   adds a month.

   THESE ARE ESTIMATES. Lenders differ in when a payment posts,
   whether interest runs daily or monthly, rounding, charges and
   rules. The model includes none of those.
========================================================= */

import {
    calculateEMI
} from "./loan.js";


/* =========================================================
   LIMITS
========================================================= */

export const PREPAYMENT_LIMITS = Object.freeze({
    balance:    { min: 1000, max: 100000000 },
    rate:       { min: 0.1, max: 30 },
    years:      { min: 0, max: 40 },
    months:     { min: 0, max: 11 },
    totalMonths:{ min: 1, max: 480 },
    prepayment: { min: 1, max: 100000000 }
});

/* a balance this small (half a paisa) counts as repaid */
const REPAID = 0.005;

/* a loan this long cannot happen (the longest allowed is 480 months) */
const MAX_STEPS = 5000;


/* =========================================================
   TENURE
========================================================= */

export function monthsFromYearsMonths(
    years,
    months
) {

    return (
        Number(years) * 12 +
        Number(months)
    );

}


export function splitMonths(
    totalMonths
) {

    const total =
        Math.max(0, Math.round(Number(totalMonths) || 0));

    return {
        years: Math.floor(total / 12),
        months: total % 12
    };

}


/* =========================================================
   VALIDATION
   The rules and the wording belong to this tool. How an error
   is shown (aria-invalid, aria-describedby) is the shared UI's
   job and is not done here.

   Input:  raw values (strings or numbers), by logical name:
           balance, rate, years, months, prepayment, after
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }
========================================================= */

function toNumber(
    raw
) {

    if (
        raw === null ||
        raw === undefined ||
        String(raw).trim() === ""
    ) {
        return NaN;
    }

    return Number(raw);

}


function inRange(
    value,
    { min, max }
) {

    return (
        Number.isFinite(value) &&
        value >= min &&
        value <= max
    );

}


export function validatePrepaymentInputs(
    raw
) {

    const errors = [];

    const balance = toNumber(raw.balance);
    const rate = toNumber(raw.rate);
    const years = toNumber(raw.years);
    const months = toNumber(raw.months);
    const prepayment = toNumber(raw.prepayment);
    const after = toNumber(raw.after);

    if (!inRange(balance, PREPAYMENT_LIMITS.balance)) {

        errors.push({
            fields: ["balance"],
            message:
                "Enter an outstanding loan balance between ₹1,000 and ₹10,00,00,000."
        });

    }

    if (!inRange(rate, PREPAYMENT_LIMITS.rate)) {

        errors.push({
            fields: ["rate"],
            message:
                "Enter an annual interest rate between 0.1% and 30%."
        });

    }

    const yearsOk =
        Number.isInteger(years) &&
        inRange(years, PREPAYMENT_LIMITS.years);

    const monthsOk =
        Number.isInteger(months) &&
        inRange(months, PREPAYMENT_LIMITS.months);

    if (!yearsOk) {

        errors.push({
            fields: ["years"],
            message:
                "Enter the remaining years as a whole number from 0 to 40."
        });

    }

    if (!monthsOk) {

        errors.push({
            fields: ["months"],
            message:
                "Enter the remaining months as a whole number from 0 to 11."
        });

    }

    const totalMonths =
        yearsOk && monthsOk
            ? monthsFromYearsMonths(years, months)
            : NaN;

    if (
        yearsOk &&
        monthsOk &&
        !inRange(totalMonths, PREPAYMENT_LIMITS.totalMonths)
    ) {

        errors.push({
            fields: ["years", "months"],
            message:
                "The remaining tenure must be at least 1 month and at most 40 years."
        });

    }

    if (!inRange(prepayment, PREPAYMENT_LIMITS.prepayment)) {

        errors.push({
            fields: ["prepayment"],
            message:
                "Enter a prepayment amount of at least ₹1 and up to ₹10,00,00,000."
        });

    }

    const tenureUsable =
        inRange(totalMonths, PREPAYMENT_LIMITS.totalMonths);

    const afterOk =
        Number.isInteger(after) &&
        after >= 0 &&
        (!tenureUsable || after <= totalMonths - 1);

    if (!afterOk) {

        errors.push({
            fields: ["after"],
            message:
                tenureUsable
                    ? `Enter a whole number of EMIs from 0 to ${totalMonths - 1} (0 means before your next EMI).`
                    : "Enter a whole number of EMIs, 0 or more (0 means before your next EMI)."
        });

    }

    if (errors.length) {

        return {
            ok: false,
            errors
        };

    }

    return {
        ok: true,
        values: {
            balance,
            annualRate: rate,
            remainingMonths: totalMonths,
            prepayment,
            afterMonths: after
        }
    };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validatePrepaymentInputs).
========================================================= */

/*
 * Balance after each payment, from the first payment on, for a
 * fixed payment, until the balance is repaid (or `limit`
 * payments). Returns the balances after payment 1, 2, ... and
 * the interest charged along the way.
 */

function repay(
    startBalance,
    monthlyRate,
    payment,
    limit = MAX_STEPS
) {

    const balances = [];

    let balance = startBalance;
    let interest = 0;

    while (
        balance > REPAID &&
        balances.length < limit
    ) {

        const charge = balance * monthlyRate;

        interest += charge;

        const due = balance + charge;

        balance = due - Math.min(payment, due);

        balances.push(
            balance > REPAID ? balance : 0
        );

    }

    return {
        balances,
        interest
    };

}


export function calculatePrepayment({
    balance,
    annualRate,
    remainingMonths,
    prepayment,
    afterMonths = 0
}) {

    const n = remainingMonths;
    const k = afterMonths;
    const i = annualRate / 12 / 100;

    /* ---- without a prepayment ---- */

    const emi =
        calculateEMI(
            balance,
            annualRate,
            n / 12
        );

    const baselineInterest =
        Math.max(0, emi * n - balance);

    const baselineSeries = [balance];

    for (let t = 1; t <= n; t++) {

        const next =
            baselineSeries[t - 1] * (1 + i) - emi;

        baselineSeries.push(
            t === n || next < REPAID
                ? 0
                : next
        );

    }

    /* ---- at the prepayment ---- */

    const balanceAtPrepayment =
        baselineSeries[k];

    const clearsLoan =
        prepayment >= balanceAtPrepayment - REPAID;

    const applied =
        clearsLoan
            ? balanceAtPrepayment
            : prepayment;

    const balanceAfter =
        clearsLoan
            ? 0
            : balanceAtPrepayment - prepayment;

    /* interest already paid in the k months before the prepayment (the same in every outcome) */
    const interestBefore =
        emi * k - (balance - balanceAtPrepayment);

    /* ---- keep the EMI ---- */

    const keepRun =
        repay(balanceAfter, i, emi);

    const keepMonthsAfter =
        keepRun.balances.length;

    const keepTotalMonths =
        k + keepMonthsAfter;

    const keepInterest =
        interestBefore + keepRun.interest;

    const keepSeries =
        baselineSeries
            .slice(0, k)
            .concat([balanceAfter])
            .concat(keepRun.balances);

    const keepEmi = {
        emi,
        totalMonths: keepTotalMonths,
        monthsSaved: n - keepTotalMonths,
        totalInterest: keepInterest,
        totalRepayment: balance + keepInterest,
        interestSaved: baselineInterest - keepInterest
    };

    /* ---- reduce the EMI (the end date stays) ---- */

    let reduceEmi = null;

    if (!clearsLoan) {

        const remaining = n - k;

        const lowerEmi =
            calculateEMI(
                balanceAfter,
                annualRate,
                remaining / 12
            );

        const reduceInterest =
            interestBefore +
            (lowerEmi * remaining - balanceAfter);

        const reduceSeries =
            baselineSeries.slice(0, k).concat([balanceAfter]);

        for (let t = 1; t <= remaining; t++) {

            const next =
                reduceSeries[k + t - 1] * (1 + i) - lowerEmi;

            reduceSeries.push(
                t === remaining || next < REPAID
                    ? 0
                    : next
            );

        }

        reduceEmi = {
            emi: lowerEmi,
            emiReduction: emi - lowerEmi,
            totalMonths: n,
            totalInterest: reduceInterest,
            totalRepayment: balance + reduceInterest,
            interestSaved: baselineInterest - reduceInterest,
            series: reduceSeries
        };

    }

    /* ---- the balance at the end of each year ---- */

    const at = (series, t) =>
        t < series.length
            ? series[t]
            : 0;

    const yearly = [];

    for (let y = 1; y * 12 - 11 <= n; y++) {

        const t = y * 12;

        yearly.push({
            year: y,
            withoutPrepayment: at(baselineSeries, t),
            keepEmi: at(keepSeries, t),
            reduceEmi:
                reduceEmi
                    ? at(reduceEmi.series, t)
                    : null
        });

    }

    return {
        input: {
            balance,
            annualRate,
            remainingMonths: n,
            prepayment,
            afterMonths: k
        },
        baseline: {
            emi,
            totalMonths: n,
            totalInterest: baselineInterest,
            totalRepayment: balance + baselineInterest
        },
        prepaymentPoint: {
            afterMonths: k,
            balanceBefore: balanceAtPrepayment,
            applied,
            balanceAfter,
            clearsLoan,
            shareOfBalance: applied / balanceAtPrepayment
        },
        keepEmi,
        reduceEmi:
            reduceEmi
                ? (({ series, ...rest }) => rest)(reduceEmi)
                : null,
        savingPerRupee:
            keepEmi.interestSaved / applied,
        yearly
    };

}


/* =========================================================
   REPAYMENT SCHEDULE
   The month-by-month picture behind calculatePrepayment(),
   for one of three outcomes. It reuses the EMIs that function
   already worked out and applies the same timing convention:
   the prepayment is made right after EMI `afterMonths`, shown in
   that month's row (afterMonths = 0 gives a first row of its own,
   month 0, before any EMI). It does not change any total; the
   tests check that its rows add up to the figures above.

   scenario: "baseline" (no prepayment), "keep" (prepay, keep the
   EMI) or "reduce" (prepay, lower the EMI; only when the
   prepayment does not clear the loan).
========================================================= */

export const SCHEDULE_SCENARIOS = ["baseline", "keep", "reduce"];

export function buildSchedule(
    result,
    scenario
) {

    const {
        input,
        baseline,
        prepaymentPoint: point,
        keepEmi,
        reduceEmi
    } = result;

    if (
        !SCHEDULE_SCENARIOS.includes(scenario) ||
        (scenario === "reduce" && !reduceEmi)
    ) {

        return [];

    }

    const i = input.annualRate / 12 / 100;
    const n = input.remainingMonths;
    const k = point.afterMonths;
    const prepays = scenario !== "baseline";

    const rows = [];

    let balance = input.balance;

    /* a prepayment before the first EMI is a row of its own */

    if (prepays && k === 0) {

        const closing =
            point.clearsLoan
                ? 0
                : balance - point.applied;

        rows.push({
            month: 0,
            opening: balance,
            payment: 0,
            interest: 0,
            principal: 0,
            prepayment: point.applied,
            closing
        });

        balance = closing;

    }

    for (
        let month = 1;
        month <= n && balance > REPAID;
        month++
    ) {

        const emi =
            scenario === "reduce" && month > k
                ? reduceEmi.emi
                : scenario === "keep"
                    ? keepEmi.emi
                    : baseline.emi;

        const opening = balance;
        const interest = opening * i;
        const due = opening + interest;

        /* the last EMI of a fixed-end schedule clears whatever is left */

        const payment =
            scenario !== "keep" && month === n
                ? due
                : Math.min(emi, due);

        let closing = due - payment;

        if (closing < REPAID) {
            closing = 0;
        }

        let prepayment = 0;

        if (prepays && month === k) {

            prepayment = Math.min(point.applied, closing);
            closing = closing - prepayment;

            if (closing < REPAID) {
                closing = 0;
            }

        }

        rows.push({
            month,
            opening,
            payment,
            interest,
            principal: payment - interest,
            prepayment,
            closing
        });

        balance = closing;

    }

    return rows;

}

/*
 * The same rows added up by loan year (months 1 to 12 are year 1;
 * the "month 0" prepayment belongs to year 1).
 */

export function summarizeByYear(
    rows
) {

    const years = [];

    for (const row of rows) {

        const year =
            Math.max(1, Math.ceil(row.month / 12));

        let entry = years[years.length - 1];

        if (!entry || entry.year !== year) {

            entry = {
                year,
                opening: row.opening,
                payment: 0,
                interest: 0,
                principal: 0,
                prepayment: 0,
                closing: row.closing
            };

            years.push(entry);

        }

        entry.payment += row.payment;
        entry.interest += row.interest;
        entry.principal += row.principal;
        entry.prepayment += row.prepayment;
        entry.closing = row.closing;

    }

    return years;

}
