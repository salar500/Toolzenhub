/* =========================================================
   ToolZen Hub
   Old vs New Tax Regime Calculator: the calculation

   Pure and deterministic: no DOM, no clock, no formatting. The
   rules (slabs, rebate, limits, rates) come from a tax-year
   configuration object (income-tax-config.js); nothing here
   contains an annual constant. Tested against an independent
   Python reference written from the statute
   (tests/fixtures/income-tax-golden.py).

   SCOPE (v1): a resident individual under 60 with salary or
   pension income and optional other income taxed at normal slab
   rates, total income up to the configured ceiling (so surcharge
   never applies), for ONE tax year. Anything else is refused,
   never approximated.

   MONEY is an integer number of PAISE everywhere inside this file
   (Rs 1 = 100). A rate such as 5% of a whole-rupee amount is then
   an exact integer of paise, and the 4% cess on that an exact
   count of hundredths of a paisa, so there is no floating-point
   error in a result. Inputs are whole rupees.

   WHERE ROUNDING HAPPENS (Income-tax Act 2025, s.516: "the amount
   of total income computed or any amount payable ... shall be
   rounded off to the nearest multiple of 10 ignoring any part of a
   rupee consisting of paise" and then up if the last figure is 5 or
   more):
     1. the total income of each regime, before the slabs apply;
     2. the final amount payable (tax after rebate plus cess).
   Nothing in between is rounded: slab tax, rebate and cess are
   exact. (Whether the Department's own utility also rounds the
   parts is unconfirmed; the effect is at most Rs 10.)

   THE STEPS
     old regime   salary - HRA exemption - standard deduction
                  - professional tax, + other income, - the loss on a
                  self-occupied house (the interest, up to its limit),
                  = gross total income; minus the Chapter VIII
                  deductions (never more than the gross total income);
                  = total income -> round -> slabs -> s.156(1) rebate
                  -> cess -> round.
     new regime   salary - standard deduction, + other income, minus
                  the employer's NPS contribution (s.124(1)/(2)) only;
                  = total income -> round -> slabs -> s.156(2) rebate
                  with marginal relief -> cess -> round.
========================================================= */

import {
    ACTIVE_TAX_YEAR
} from "./income-tax-config.js";

const PAISE = 100;

/* an input sanity limit (not a legal limit): 100 crore rupees */
export const FIELD_MAX = 1_000_000_000;

const NUMBER_FIELDS = [
    "salary",
    "otherIncome",
    "basicPlusDa",
    "hraReceived",
    "rentPaid",
    "hraManual",
    "section80C",
    "ownNps",
    "healthSelfFamily",
    "healthParents",
    "professionalTax",
    "homeLoanInterest",
    "employerNps",
    "otherDeductions"
];

export const DEFAULT_INPUT = Object.freeze({
    salary: 0,
    otherIncome: 0,
    basicPlusDa: 0,
    hraMode: "calculate",
    hraReceived: 0,
    rentPaid: 0,
    highCity: false,
    hraManual: 0,
    section80C: 0,
    ownNps: 0,
    healthSelfFamily: 0,
    healthParents: 0,
    parentsSenior: false,
    professionalTax: 0,
    homeLoanInterest: 0,
    homeLoanOtherPurpose: false,
    employerNps: 0,
    employerGovernment: false,
    otherDeductions: 0
});


/* =========================================================
   STATUTORY ROUNDING (s.516)
========================================================= */

/*
 * An amount in paise to rupees, ignoring the paise (flooring), then to
 * the nearest multiple of 10: a last figure of 5 or more rounds UP,
 * less than 5 rounds DOWN. Amounts here are never negative.
 */
export function roundStatutory(paise, multiple = 10) {

    const rupees = Math.floor(paise / PAISE);

    const rest = rupees % multiple;

    return rest * 2 >= multiple
        ? rupees - rest + multiple
        : rupees - rest;

}


/* =========================================================
   VALIDATION
========================================================= */

const WHOLE_RUPEES = "Enter a whole number of rupees, 0 or more.";

/*
 * { ok, errors: { field: message }, input }
 * `input` is the input with every number checked and every missing
 * field defaulted.
 */
export function validateInput(raw = {}, config = ACTIVE_TAX_YEAR) {

    const input = { ...DEFAULT_INPUT, ...raw };

    const errors = {};

    for (const field of NUMBER_FIELDS) {

        const value = input[field];

        if (
            typeof value !== "number" ||
            !Number.isInteger(value) ||
            value < 0
        ) {
            errors[field] = WHOLE_RUPEES;
        } else if (value > FIELD_MAX) {
            errors[field] = "That is more than this calculator accepts.";
        }

    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors, input };
    }

    if (input.basicPlusDa > input.salary) {
        errors.basicPlusDa = "Basic salary plus DA cannot be more than your annual salary.";
    }

    if (
        input.hraMode === "calculate" &&
        input.hraReceived > 0 &&
        input.basicPlusDa === 0
    ) {
        errors.basicPlusDa = "Enter your basic salary plus DA: the HRA exemption is worked out from it.";
    }

    if (
        input.hraMode === "calculate" &&
        input.hraReceived + input.basicPlusDa > input.salary
    ) {
        errors.hraReceived = "Basic salary plus DA and HRA together cannot be more than your annual salary.";
    }

    if (input.hraMode === "manual" && input.hraManual > input.salary) {
        errors.hraManual = "The HRA exemption cannot be more than your annual salary.";
    }

    if (input.employerNps > 0 && input.basicPlusDa === 0) {
        errors.basicPlusDa = "Enter your basic salary plus DA: the employer NPS limit is a share of it.";
    }

    if (input.employerNps > input.salary) {
        errors.employerNps = "The employer's NPS contribution cannot be more than your annual salary.";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        input
    };

}

export function isWithinSupportedIncome(input, config = ACTIVE_TAX_YEAR) {

    return input.salary + input.otherIncome <= config.supportedIncomeCeiling;

}


/* =========================================================
   BUILDING BLOCKS (paise)
========================================================= */

/* tax on a whole-rupee total income at the slabs, in paise: whole rupees times a whole percent is exact paise */
function slabTaxPaise(totalIncomeRupees, slabs) {

    let tax = 0;
    let lower = 0;

    for (const { upTo, ratePercent } of slabs) {

        const upper = upTo === null ? Infinity : upTo;

        if (totalIncomeRupees > lower) {
            tax += (Math.min(totalIncomeRupees, upper) - lower) * ratePercent;
        }

        if (totalIncomeRupees <= upper) {
            break;
        }

        lower = upper;

    }

    return tax;

}

/* HRA exemption in paise: the least of three amounts (rule 279). Salary is basic + DA. */
export function hraExemptionPaise(input, config = ACTIVE_TAX_YEAR) {

    const { hra } = config;

    const salary = input.basicPlusDa * PAISE;

    const received = input.hraReceived * PAISE;

    const rentExcess = Math.max(
        0,
        input.rentPaid * PAISE - Math.floor(salary * hra.rentExcessOverPercentOfSalary / 100)
    );

    const share = Math.floor(
        salary * (input.highCity ? hra.highCityPercentOfSalary : hra.otherPercentOfSalary) / 100
    );

    return Math.min(received, rentExcess, share);

}

function employerNpsLimitPaise(input, percent) {

    return Math.floor(input.basicPlusDa * PAISE * percent / 100);

}


/*
 * The tax of one regime from a total income, in paise:
 *   { totalIncome (rupees, rounded), taxBeforeRebate, rebate, taxAfterRebate, cess, totalBeforeRounding, finalTax (rupees) }
 */
function taxFromTotalIncome(totalIncomePaise, regime, config) {

    const totalIncome = roundStatutory(totalIncomePaise, config.roundingMultiple);

    const taxBeforeRebate = slabTaxPaise(totalIncome, config.slabs[regime]);

    let rebate = 0;

    if (regime === "old") {

        const rule = config.rebate.old;

        if (totalIncome <= rule.maxTotalIncome) {
            rebate = Math.min(taxBeforeRebate, rule.maxRebate * PAISE);
        }

    } else {

        const rule = config.rebate.new;

        if (totalIncome <= rule.maxTotalIncome) {

            rebate = Math.min(taxBeforeRebate, rule.maxRebate * PAISE);

        } else {

            /* s.156(2)(b): marginal relief; the tax cannot exceed the income above the threshold */
            const excess = (totalIncome - rule.maxTotalIncome) * PAISE;

            rebate = taxBeforeRebate > excess
                ? taxBeforeRebate - excess
                : 0;

        }

    }

    const taxAfterRebate = taxBeforeRebate - rebate;

    /* cess: percent of tax; kept in hundredths of a paisa so nothing is rounded early */
    const cessHundredthsOfPaisa = taxAfterRebate * config.cessPercent;

    const totalHundredthsOfPaisa = taxAfterRebate * 100 + cessHundredthsOfPaisa;

    return {
        totalIncome,
        taxBeforeRebate,
        rebate,
        taxAfterRebate,
        cess: Math.round(cessHundredthsOfPaisa / 100),
        totalBeforeRounding: Math.round(totalHundredthsOfPaisa / 100),
        finalTax: roundStatutory(Math.floor(totalHundredthsOfPaisa / 100), config.roundingMultiple)
    };

}


/* =========================================================
   THE TWO REGIMES
========================================================= */

/* extraDeductionRupees: more Chapter VIII deductions than entered, used only by the break-even search */
function oldRegime(input, config, extraDeductionRupees = 0) {

    const { caps, standardDeduction } = config;

    const salary = input.salary * PAISE;

    const hraExemption = input.hraMode === "manual"
        ? input.hraManual * PAISE
        : hraExemptionPaise(input, config);

    const standard = Math.min(standardDeduction.old * PAISE, salary);

    const professionalTax = input.professionalTax * PAISE;

    const salaryIncome = Math.max(0, salary - hraExemption - standard - professionalTax);

    const otherIncome = input.otherIncome * PAISE;

    const interestCap = (input.homeLoanOtherPurpose
        ? caps.homeLoanInterestOther
        : caps.homeLoanInterestStandard) * PAISE;

    const houseLoss = Math.min(input.homeLoanInterest * PAISE, interestCap);

    const grossTotalIncome = Math.max(0, salaryIncome + otherIncome - houseLoss);

    const parentsCap = (input.parentsSenior
        ? caps.healthParentsSenior
        : caps.healthParentsUnder60) * PAISE;

    const employerPercent = input.employerGovernment
        ? caps.employerNpsPercent.oldRegimeGovernmentEmployer
        : caps.employerNpsPercent.oldRegime;

    const lines = {
        section80C: line(input.section80C, caps.section80C),
        ownNps: line(input.ownNps, caps.ownNps),
        healthSelfFamily: line(input.healthSelfFamily, caps.healthSelfFamily),
        healthParents: lineFromPaise(input.healthParents * PAISE, parentsCap),
        employerNps: lineFromPaise(input.employerNps * PAISE, employerNpsLimitPaise(input, employerPercent)),
        otherDeductions: lineFromPaise((input.otherDeductions + extraDeductionRupees) * PAISE, Infinity)
    };

    const claimed = Object.values(lines).reduce((sum, item) => sum + item.used, 0);

    /* s.122(2): the Chapter VIII deductions together cannot exceed the gross total income */
    const deductionsApplied = Math.min(claimed, grossTotalIncome);

    const totalIncomePaise = grossTotalIncome - deductionsApplied;

    return {
        regime: "old",
        salary,
        standardDeduction: standard,
        hraExemption,
        professionalTax,
        salaryIncome,
        otherIncome,
        houseLoss: { entered: input.homeLoanInterest * PAISE, used: houseLoss, cap: interestCap },
        grossTotalIncome,
        lines,
        deductionsApplied,
        totalIncomeBeforeRounding: totalIncomePaise,
        /* what the old regime took off, excluding the standard deduction: for the break-even */
        exemptionsAndDeductions: hraExemption + professionalTax + houseLoss + deductionsApplied,
        ...taxFromTotalIncome(totalIncomePaise, "old", config)
    };

}

function newRegime(input, config) {

    const { caps, standardDeduction } = config;

    const salary = input.salary * PAISE;

    const standard = Math.min(standardDeduction.new * PAISE, salary);

    const salaryIncome = Math.max(0, salary - standard);

    const otherIncome = input.otherIncome * PAISE;

    const grossTotalIncome = salaryIncome + otherIncome;

    const employerNps = lineFromPaise(
        input.employerNps * PAISE,
        employerNpsLimitPaise(input, caps.employerNpsPercent.newRegime)
    );

    const deductionsApplied = Math.min(employerNps.used, grossTotalIncome);

    const totalIncomePaise = grossTotalIncome - deductionsApplied;

    return {
        regime: "new",
        salary,
        standardDeduction: standard,
        salaryIncome,
        otherIncome,
        grossTotalIncome,
        lines: { employerNps },
        deductionsApplied,
        totalIncomeBeforeRounding: totalIncomePaise,
        ...taxFromTotalIncome(totalIncomePaise, "new", config)
    };

}

function line(enteredRupees, capRupees) {

    return lineFromPaise(enteredRupees * PAISE, capRupees * PAISE);

}

function lineFromPaise(enteredPaise, capPaise) {

    return {
        entered: enteredPaise,
        cap: capPaise,
        used: Math.min(enteredPaise, capPaise)
    };

}


/* =========================================================
   BREAK-EVEN
========================================================= */

/*
 * How much old-regime deduction (in addition to what was entered)
 * makes the old regime's final tax no more than the new regime's.
 *
 * The old regime's final tax never rises when a deduction rises (the
 * deduction can only lower the total income, and the slabs, the
 * rebate and the cess are all non-decreasing in it, even across the
 * Rs 5,00,000 rebate cliff), so the smallest such amount is found by a
 * bisection over whole rupees. The search is bounded by the gross
 * total income (a deduction beyond it is ignored) and takes at most
 * about 30 steps.
 */
function findBreakEven(input, config, oldResult, newResult) {

    if (oldResult.finalTax <= newResult.finalTax) {
        return { status: "old-lower-or-equal" };
    }

    let low = 0;
    let high = Math.ceil(oldResult.grossTotalIncome / PAISE);

    /* at `high` every rupee of income is deducted, so the old tax is 0, which is never above the new tax */
    while (low < high) {

        const middle = Math.floor((low + high) / 2);

        if (oldRegime(input, config, middle).finalTax <= newResult.finalTax) {
            high = middle;
        } else {
            low = middle + 1;
        }

    }

    const extra = low;

    /* what the old regime takes off now (HRA, professional tax, house loan interest, Chapter VIII), excluding the standard deduction */
    const current = Math.round(oldResult.exemptionsAndDeductions / PAISE);

    const required = current + extra;

    return {
        status: "found",
        /* exact, whole rupees */
        extraRupees: extra,
        currentRupees: current,
        requiredRupees: required,
        /* for display: about, to the nearest Rs 1,000 */
        requiredApproxRupees: Math.round(required / 1000) * 1000,
        extraApproxRupees: Math.max(0, Math.round(required / 1000) * 1000 - current)
    };

}


/* =========================================================
   THE RESULT
========================================================= */

/*
 *   { status: "invalid", errors }
 *   { status: "unsupported", reason: "income-above-ceiling", ceiling }
 *   { status: "ok", taxYear, old, new, comparison, breakEven, effective }
 */
export function calculate(raw = {}, config = ACTIVE_TAX_YEAR) {

    const checked = validateInput(raw, config);

    if (!checked.ok) {
        return { status: "invalid", errors: checked.errors };
    }

    const { input } = checked;

    if (!isWithinSupportedIncome(input, config)) {

        return {
            status: "unsupported",
            reason: "income-above-ceiling",
            ceiling: config.supportedIncomeCeiling,
            taxYear: config.label
        };

    }

    const old = oldRegime(input, config);

    const next = newRegime(input, config);

    const difference = Math.abs(old.finalTax - next.finalTax);

    const lower = old.finalTax === next.finalTax
        ? "equal"
        : next.finalTax < old.finalTax ? "new" : "old";

    const income = input.salary + input.otherIncome;

    /* tenths of a percent: Rs 97,500 on Rs 15,00,000 is 65 (6.5%) */
    const permille = (tax) => income > 0 ? Math.round(tax * 1000 / income) : null;

    return {
        status: "ok",
        taxYear: config.label,
        income: {
            salary: input.salary,
            otherIncome: input.otherIncome,
            total: income
        },
        old,
        new: next,
        comparison: {
            lower,
            differenceRupees: difference
        },
        effective: {
            oldPermille: permille(old.finalTax),
            newPermille: permille(next.finalTax)
        },
        breakEven: findBreakEven(input, config, old, next)
    };

}
