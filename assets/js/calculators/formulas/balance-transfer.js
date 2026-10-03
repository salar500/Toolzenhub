/* =========================================================
   ToolZen Hub
   Loan Balance Transfer: pure calculation and input validation

   No DOM and no formatting: plain functions of numbers, so they
   can be tested on their own. The page (calculators/balance-transfer
   /index.js) only reads fields, calls these functions and shows
   what they return.

   MODEL (the standard reducing-balance loan, as formulas/loan.js
   and formulas/prepayment.js)

       i      monthly rate = annual rate / 12 / 100
       EMI    = P i (1+i)^n / ((1+i)^n - 1)          (calculateEMI)

   The loan is moved NOW, before the next EMI, for the same
   outstanding balance P.

       CURRENT LOAN   EMI0 for n0 months      outgo0 = EMI0 * n0
       NEW LOAN       EMI1 for n1 months      outgo1 = EMI1 * n1 + charges

   Charges are the amounts the user enters (what the current lender
   asks to close the loan early, and what the new lender asks), paid
   at month 0 from the user's own pocket. The model knows no lender
   rules.

       NET SAVING     outgo0 - outgo1    (negative: switching costs more)

   CUMULATIVE POSITION after month m (the break-even model)

       S(m) = EMI0 * min(m, n0) - EMI1 * min(m, n1) - charges

   It starts at -charges and, month by month, adds what the current
   loan would have cost minus what the new one costs. The BREAK-EVEN
   MONTH is the first m >= 1 with S(m) >= 0. S(last month) equals the
   net saving. When the new tenure is longer, S can climb above zero
   and fall back below it later: then the saving is only TEMPORARY.

   SAME-TENURE COMPARISON. Everything above again with n1 replaced by
   n0, so the effect of the lower rate can be told from the effect of
   a longer (or shorter) repayment period.

   BREAK-EVEN RATE. The new annual rate at which the net saving is
   exactly zero for the chosen new tenure. The net saving falls as the
   rate rises, so it is found by bisection.

   PRECISION. Nothing is rounded here; callers round for display. The
   totals use the constant EMI times the number of months (the same
   closed form as the other loan tools), so no month-by-month sum can
   drift. Two tolerances are explicit: a position within half a paisa
   of zero counts as zero (BREAK_EVEN_EPS), and a net saving smaller
   than one rupee counts as no difference (NEUTRAL_TOLERANCE).

   THESE ARE ESTIMATES. Lenders differ in when charges apply, how
   interest accrues, rounding, rate resets and fees. None of that is
   modelled.
========================================================= */

import {
    calculateEMI
} from "./loan.js";

import {
    monthsFromYearsMonths,
    splitMonths
} from "./prepayment.js";

export {
    monthsFromYearsMonths,
    splitMonths
};


/* =========================================================
   LIMITS AND TOLERANCES
========================================================= */

export const BALANCE_TRANSFER_LIMITS = Object.freeze({
    balance:     { min: 1000, max: 100000000 },
    rate:        { min: 0.1, max: 30 },
    years:       { min: 0, max: 40 },
    months:      { min: 0, max: 11 },
    totalMonths: { min: 1, max: 480 },
    charges:     { min: 0, max: 100000000 }
});

/* a cumulative position this close to zero (half a paisa) counts as zero */
export const BREAK_EVEN_EPS = 0.005;

/* a net saving smaller than this many rupees counts as "no difference" */
export const NEUTRAL_TOLERANCE = 1;

const BISECTION_STEPS = 100;


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers), by logical name:
           balance, currentRate, currentYears, currentMonths,
           newRate, newYears, newMonths, currentCharges, newCharges
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

function checkTenure(
    errors,
    years,
    months,
    names,
    label
) {

    const yearsOk =
        Number.isInteger(years) &&
        inRange(years, BALANCE_TRANSFER_LIMITS.years);

    const monthsOk =
        Number.isInteger(months) &&
        inRange(months, BALANCE_TRANSFER_LIMITS.months);

    if (!yearsOk) {

        errors.push({
            fields: [names.years],
            message:
                `Enter the ${label} years as a whole number from 0 to 40.`
        });

    }

    if (!monthsOk) {

        errors.push({
            fields: [names.months],
            message:
                `Enter the ${label} months as a whole number from 0 to 11.`
        });

    }

    if (!yearsOk || !monthsOk) {
        return NaN;
    }

    const total =
        monthsFromYearsMonths(years, months);

    if (!inRange(total, BALANCE_TRANSFER_LIMITS.totalMonths)) {

        errors.push({
            fields: [names.years, names.months],
            message:
                `The ${label} tenure must be at least 1 month and at most 40 years.`
        });

        return NaN;

    }

    return total;

}

export function validateBalanceTransferInputs(
    raw
) {

    const errors = [];

    const balance = toNumber(raw.balance);
    const currentRate = toNumber(raw.currentRate);
    const newRate = toNumber(raw.newRate);
    const currentCharges = toNumber(raw.currentCharges);
    const newCharges = toNumber(raw.newCharges);

    if (!inRange(balance, BALANCE_TRANSFER_LIMITS.balance)) {

        errors.push({
            fields: ["balance"],
            message:
                "Enter an outstanding loan balance between ₹1,000 and ₹10,00,00,000."
        });

    }

    if (!inRange(currentRate, BALANCE_TRANSFER_LIMITS.rate)) {

        errors.push({
            fields: ["currentRate"],
            message:
                "Enter your current interest rate between 0.1% and 30%."
        });

    }

    const currentMonths =
        checkTenure(
            errors,
            toNumber(raw.currentYears),
            toNumber(raw.currentMonths),
            { years: "currentYears", months: "currentMonths" },
            "remaining"
        );

    if (!inRange(newRate, BALANCE_TRANSFER_LIMITS.rate)) {

        errors.push({
            fields: ["newRate"],
            message:
                "Enter the new interest rate between 0.1% and 30%."
        });

    }

    const newMonths =
        checkTenure(
            errors,
            toNumber(raw.newYears),
            toNumber(raw.newMonths),
            { years: "newYears", months: "newMonths" },
            "new loan"
        );

    if (!inRange(currentCharges, BALANCE_TRANSFER_LIMITS.charges)) {

        errors.push({
            fields: ["currentCharges"],
            message:
                "Enter the charges at your current lender as an amount from ₹0 to ₹10,00,00,000 (0 if none)."
        });

    }

    if (!inRange(newCharges, BALANCE_TRANSFER_LIMITS.charges)) {

        errors.push({
            fields: ["newCharges"],
            message:
                "Enter the new lender's fees as an amount from ₹0 to ₹10,00,00,000 (0 if none)."
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
            currentRate,
            currentMonths,
            newRate,
            newMonths,
            currentCharges,
            newCharges
        }
    };

}


/* =========================================================
   CORE
   One comparison of "keep the current loan" against "move to a
   new loan", for explicit numbers. Used for the chosen terms, for
   the same-tenure check and for the break-even rate.
========================================================= */

function emiFor(
    balance,
    annualRate,
    months
) {

    return calculateEMI(
        balance,
        annualRate,
        months / 12
    );

}

/* S(m): the cumulative position after month m (see the model above) */
function position(
    month,
    emi0,
    n0,
    emi1,
    n1,
    charges
) {

    return (
        emi0 * Math.min(month, n0) -
        emi1 * Math.min(month, n1) -
        charges
    );

}

function compare({
    balance,
    currentRate,
    currentMonths: n0,
    newRate,
    newMonths: n1,
    currentCharges,
    newCharges
}) {

    const charges = currentCharges + newCharges;

    const emi0 = emiFor(balance, currentRate, n0);
    const emi1 = emiFor(balance, newRate, n1);

    const outgo0 = emi0 * n0;
    const repayment1 = emi1 * n1;
    const outgo1 = repayment1 + charges;

    const netSaving = outgo0 - outgo1;

    /* the first month the position is back at zero or better */

    const horizon = Math.max(n0, n1);

    let month = null;

    for (let m = 1; m <= horizon; m++) {

        if (
            position(m, emi0, n0, emi1, n1, charges) >=
            -BREAK_EVEN_EPS
        ) {

            month = m;
            break;

        }

    }

    const neutral =
        Math.abs(netSaving) < NEUTRAL_TOLERANCE;

    let breakEven;

    if (neutral || month === null) {

        breakEven = {
            kind: neutral ? "none" : "never",
            month: null
        };

    } else if (month === 1 && charges <= BREAK_EVEN_EPS) {

        breakEven = {
            kind: "immediate",
            month: 1
        };

    } else {

        breakEven = {
            kind: "months",
            month
        };

    }

    /* what the result means */

    let outcome;

    if (neutral) {
        outcome = "neutral";
    } else if (netSaving > 0) {
        outcome = "saving";
    } else if (breakEven.kind === "never") {
        outcome = "loss";
    } else {
        outcome = "temporary";
    }

    return {
        emi0,
        emi1,
        outgo0,
        repayment1,
        outgo1,
        charges,
        netSaving,
        outcome,
        breakEven,
        horizon
    };

}


/* =========================================================
   BREAK-EVEN RATE
   The new annual rate at which the net saving is zero for the
   chosen new tenure. Net saving falls as the new rate rises.

   kind "rate"   rate: the highest rate that still breaks even
        "none"   even the lowest allowed rate does not pay back
        "always" even the highest allowed rate still pays back
========================================================= */

export function findBreakEvenRate(
    values
) {

    const { min, max } = BALANCE_TRANSFER_LIMITS.rate;

    const net = (rate) =>
        compare({ ...values, newRate: rate }).netSaving;

    if (net(min) < 0) {
        return { kind: "none", rate: null };
    }

    if (net(max) >= 0) {
        return { kind: "always", rate: null };
    }

    let low = min;
    let high = max;

    for (let step = 0; step < BISECTION_STEPS; step++) {

        const mid = (low + high) / 2;

        if (net(mid) >= 0) {
            low = mid;
        } else {
            high = mid;
        }

    }

    return {
        kind: "rate",
        rate: low
    };

}


/* =========================================================
   YEARLY TABLE
   One row per loan year until both loans have ended, plus a
   "start" row (year 0) that shows the charges paid at the switch.
   Payments are what is paid in that year; the position is the
   cumulative S(m) at the end of the year (the last row ends at the
   last month of the longer loan, so it equals the net saving).
========================================================= */

function buildYearly({
    emi0,
    n0,
    emi1,
    n1,
    charges,
    horizon
}) {

    const rows = [
        {
            year: 0,
            paidCurrent: 0,
            paidNew: 0,
            charges,
            position: -charges
        }
    ];

    for (let year = 1; (year - 1) * 12 < horizon; year++) {

        const from = (year - 1) * 12;
        const to = Math.min(year * 12, horizon);

        rows.push({
            year,
            paidCurrent:
                emi0 * (Math.min(to, n0) - Math.min(from, n0)),
            paidNew:
                emi1 * (Math.min(to, n1) - Math.min(from, n1)),
            charges: 0,
            position:
                position(to, emi0, n0, emi1, n1, charges)
        });

    }

    return rows;

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateBalanceTransferInputs).
========================================================= */

export function calculateBalanceTransfer(
    values
) {

    const {
        balance,
        currentRate,
        currentMonths: n0,
        newRate,
        newMonths: n1,
        currentCharges,
        newCharges
    } = values;

    const main = compare(values);

    const lowerEmi = main.emi1 < main.emi0;

    /* the same comparison over the same remaining tenure, when the tenures differ */

    let sameTenure = null;

    if (n1 !== n0) {

        const same = compare({ ...values, newMonths: n0 });

        sameTenure = {
            months: n0,
            emi: same.emi1,
            netSaving: same.netSaving,
            outcome: same.outcome,
            breakEven: same.breakEven,
            totalInterest: same.repayment1 - balance
        };

    }

    return {
        input: {
            balance,
            currentRate,
            currentMonths: n0,
            newRate,
            newMonths: n1,
            currentCharges,
            newCharges
        },
        current: {
            emi: main.emi0,
            months: n0,
            totalInterest: main.outgo0 - balance,
            totalOutgo: main.outgo0
        },
        proposed: {
            emi: main.emi1,
            months: n1,
            totalInterest: main.repayment1 - balance,
            totalRepayment: main.repayment1,
            charges: main.charges,
            effectiveOutgo: main.outgo1
        },
        decision: {
            netSaving: main.netSaving,
            outcome: main.outcome,
            breakEven: main.breakEven,
            emiChange: main.emi0 - main.emi1,
            tenureChangeMonths: n0 - n1,
            lowerEmi,
            longerTenure: n1 > n0,
            shorterTenure: n1 < n0,
            lowerEmiHigherCost:
                lowerEmi && main.netSaving < 0 &&
                Math.abs(main.netSaving) >= NEUTRAL_TOLERANCE
        },
        sameTenure,
        breakEvenRate: findBreakEvenRate(values),
        yearly:
            buildYearly({
                emi0: main.emi0,
                n0,
                emi1: main.emi1,
                n1,
                charges: main.charges,
                horizon: main.horizon
            })
    };

}
