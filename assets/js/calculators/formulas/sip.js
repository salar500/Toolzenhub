/* =========================================================
   ToolZen Hub
   SIP projection: pure calculation and input validation

   No DOM and no formatting: plain functions of numbers, so they
   can be tested on their own. The page (calculators/sip/index.js)
   only reads fields, calls these functions and shows what they
   return.

   THIS IS A PROJECTION, NOT A FORECAST. The return is an
   assumption the user enters and the model applies it evenly
   every month. Real returns vary and can be negative. Nothing here
   is a promise, and the page says so next to every result.

   MODEL (the convention most SIP calculators use)

       i      monthly rate = assumed annual return / 12 / 100
       P      the monthly SIP in the first year
       n      the number of months

   Each instalment is invested at the START of the month and grows
   for that month; the value is read at the END of the last month:

       balance_m = (balance_(m-1) + payment_m) * (1 + i)

   With a fixed payment this is the closed form
       value = P * ((1 + i)^n - 1) / i * (1 + i)         (i > 0)
       value = P * n                                      (i = 0)

   YEARLY STEP-UP s%. The payment is P in months 1 to 12 and is
   raised once a year: P * (1 + s/100) in months 13 to 24, and so on.

   ESTIMATED GROWTH = estimated value - total invested.

   TARGET. The value is linear in P (every payment scales with it),
   so the starting SIP a target T needs, under the same return,
   period and step-up, is
       P_needed = T / (value of a plan that starts at 1)
                = T * P / value.

   SCENARIOS. The same plan at the assumed return minus and plus
   two percentage points ("lower", "as assumed", "higher"). The
   lower rate stops at 0% and the higher at 30%; a scenario that
   would equal the assumption is left out.

   Nothing is rounded here; callers round for display. Doubles are
   enough: at most 480 months, relative error well under 1e-12.
========================================================= */

import {
    monthsFromYearsMonths,
    splitMonths
} from "./prepayment.js";

export {
    monthsFromYearsMonths,
    splitMonths
};


/* =========================================================
   LIMITS
========================================================= */

export const SIP_LIMITS = Object.freeze({
    monthlySip:  { min: 100, max: 1000000 },
    rate:        { min: 0, max: 30 },
    years:       { min: 0, max: 40 },
    months:      { min: 0, max: 11 },
    totalMonths: { min: 1, max: 480 },
    stepUp:      { min: 0, max: 50 },
    target:      { min: 10000, max: 10000000000 }
});

/* the scenarios are the assumed return minus and plus this many percentage points */
export const SCENARIO_SPREAD = 2;


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers), by logical name:
           monthlySip, annualReturn, years, months,
           stepUp (blank means 0), target (blank means none)
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

function toNumber(
    raw
) {

    return isBlank(raw)
        ? NaN
        : Number(raw);

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

export function validateSipInputs(
    raw
) {

    const errors = [];

    const monthlySip = toNumber(raw.monthlySip);
    const annualReturn = toNumber(raw.annualReturn);
    const years = toNumber(raw.years);
    const months = toNumber(raw.months);

    if (!inRange(monthlySip, SIP_LIMITS.monthlySip)) {

        errors.push({
            fields: ["monthlySip"],
            message:
                "Enter a monthly SIP amount between ₹100 and ₹10,00,000."
        });

    }

    if (!inRange(annualReturn, SIP_LIMITS.rate)) {

        errors.push({
            fields: ["annualReturn"],
            message:
                "Enter an assumed annual return between 0% and 30%."
        });

    }

    const yearsOk =
        Number.isInteger(years) &&
        inRange(years, SIP_LIMITS.years);

    const monthsOk =
        Number.isInteger(months) &&
        inRange(months, SIP_LIMITS.months);

    if (!yearsOk) {

        errors.push({
            fields: ["years"],
            message:
                "Enter the investment years as a whole number from 0 to 40."
        });

    }

    if (!monthsOk) {

        errors.push({
            fields: ["months"],
            message:
                "Enter the investment months as a whole number from 0 to 11."
        });

    }

    let totalMonths = NaN;

    if (yearsOk && monthsOk) {

        totalMonths =
            monthsFromYearsMonths(years, months);

        if (!inRange(totalMonths, SIP_LIMITS.totalMonths)) {

            errors.push({
                fields: ["years", "months"],
                message:
                    "The investment period must be at least 1 month and at most 40 years."
            });

        }

    }

    /* the step-up is optional: blank means 0 */

    const stepUp =
        isBlank(raw.stepUp)
            ? 0
            : toNumber(raw.stepUp);

    if (!inRange(stepUp, SIP_LIMITS.stepUp)) {

        errors.push({
            fields: ["stepUp"],
            message:
                "Enter a yearly step-up between 0% and 50% (0 keeps the SIP the same)."
        });

    }

    /* the target is optional: blank means no target analysis */

    let target = null;

    if (!isBlank(raw.target)) {

        target = toNumber(raw.target);

        if (!inRange(target, SIP_LIMITS.target)) {

            errors.push({
                fields: ["target"],
                message:
                    "Enter a target amount between ₹10,000 and ₹1,000 crore, or leave it blank."
            });

        }

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
            monthlySip,
            annualReturn,
            months: totalMonths,
            stepUp,
            target
        }
    };

}


/* =========================================================
   THE PROJECTION
   Month by month, as in the model above. Returns the final value,
   the total invested, the payment of the last month and one row for
   the end of each year (the last row ends at the last month, so a
   final partial year has fewer than 12 months).
========================================================= */

function project(
    monthlySip,
    annualReturn,
    months,
    stepUp
) {

    const i = annualReturn / 12 / 100;

    let balance = 0;
    let invested = 0;
    let payment = monthlySip;

    const rows = [];

    for (let month = 1; month <= months; month++) {

        if (month > 1 && (month - 1) % 12 === 0) {
            payment = payment * (1 + stepUp / 100);
        }

        balance = (balance + payment) * (1 + i);
        invested += payment;

        if (month % 12 === 0 || month === months) {

            const year = Math.floor((month - 1) / 12) + 1;

            rows.push({
                year,
                months: month - (year - 1) * 12,
                monthlySip: payment,
                invested,
                value: balance,
                growth: balance - invested
            });

        }

    }

    return {
        value: balance,
        invested,
        lastMonthlySip: payment,
        rows
    };

}


/* =========================================================
   SCENARIOS
========================================================= */

export function scenarioRates(
    annualReturn
) {

    const { min, max } = SIP_LIMITS.rate;

    const lower =
        Math.max(min, annualReturn - SCENARIO_SPREAD);

    const higher =
        Math.min(max, annualReturn + SCENARIO_SPREAD);

    const list = [];

    if (lower !== annualReturn) {
        list.push({ key: "lower", rate: lower });
    }

    list.push({ key: "assumed", rate: annualReturn });

    if (higher !== annualReturn) {
        list.push({ key: "higher", rate: higher });
    }

    return list;

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateSipInputs).
========================================================= */

export function calculateSip({
    monthlySip,
    annualReturn,
    months,
    stepUp = 0,
    target = null
}) {

    const plan =
        project(monthlySip, annualReturn, months, stepUp);

    const scenarios =
        scenarioRates(annualReturn).map(
            ({ key, rate }) => {

                const run =
                    rate === annualReturn
                        ? plan
                        : project(monthlySip, rate, months, stepUp);

                return {
                    key,
                    rate,
                    value: run.value,
                    growth: run.value - run.invested
                };

            }
        );

    let targetResult = null;

    if (target !== null) {

        /* linear in the starting SIP: the value of a plan that starts at 1 is value / monthlySip */

        const requiredStartingSip =
            target * monthlySip / plan.value;

        targetResult = {
            amount: target,
            reached: plan.value >= target,
            difference: plan.value - target,
            requiredStartingSip
        };

    }

    return {
        input: {
            monthlySip,
            annualReturn,
            months,
            stepUp,
            target
        },
        plan: {
            totalInvested: plan.invested,
            estimatedValue: plan.value,
            estimatedGrowth: plan.value - plan.invested,
            multiple: plan.value / plan.invested,
            finalMonthlySip: plan.lastMonthlySip
        },
        scenarios,
        target: targetResult,
        yearly: plan.rows
    };

}
