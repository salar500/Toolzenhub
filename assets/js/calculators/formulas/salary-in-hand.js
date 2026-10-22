/* =========================================================
   ToolZen Hub
   Salary / CTC to In-Hand Calculator (Tool Pack 30): the calculation

   Pure and deterministic: no DOM, no clock, no storage, no network, no
   formatting. Money is a WHOLE-RUPEE integer everywhere and every rate is an
   integer fraction, so no floating point enters a figure. The tax comes only
   from the Tool Pack 17 engine (income-tax.js), unchanged, through the narrow
   adapter in this file; no tax constant is repeated here.

   The model is specification section 6 of docs/tool-packs/30-salary-ctc-in-hand.md:

     basic        = rhu(CTC x basic% / 100)
     monthlyBasic = basic / 12                      (exact, never rounded)
     PF base      = capped: min(monthlyBasic, ceiling) | full-basic: monthlyBasic | none: 0
     monthlyPF    = rhu(12% x PF base)              (rounded per MONTH, scheme paragraph 18(5))
     employerPF   = 12 x monthlyPF;  employeePF = employerPF
     gratuity     = rhu(basic x 15 / 312)  or 0
     gross        = CTC - employerPF - gratuity - otherEmployerCosts
     takeHome     = gross - employeePF - professionalTax - tax
     monthly avg  = rhu(takeHome / 12)              (an average of an annual estimate)

   rhu(x) is round half up to the whole rupee for a non-negative exact value.
   Nothing is chosen for the user: the basic percentage, the PF basis and the
   gratuity choice are required and an absent one gives status "incomplete".
   The one-half wage add-back is NOT applied (spec D12): this is a simplified
   CTC estimate, not a determination of statutory wages. The tax is the
   estimated ANNUAL liability, not monthly tax deducted at source.

   RESULT STATUS (the top level)
     "ok"           the new-regime figures are complete (`old` may still be off, incomplete, invalid or unsupported)
     "incomplete"   a required entry is missing; nothing is calculated (`missing` lists them)
     "invalid"      an entry is wrong, or the decomposition is impossible (`errors`, keyed by field)
     "unsupported"  a valid request the tool refuses and never approximates (`reason`)
========================================================= */

import { calculate as calculateTax } from "./income-tax.js";
import { ACTIVE_SALARY_YEAR } from "./salary-in-hand-config.js";

export const PF_BASES = Object.freeze(["capped", "full-basic", "none"]);

/* the deductions the old-regime figure includes and excludes (the page prints these beside the figure; spec 6.6) */
export const OLD_REGIME_INCLUDED = Object.freeze([
    "standard-deduction",
    "professional-tax",
    "employee-pf-as-80c",
    "other-80c",
    "hra-exemption"
]);

export const OLD_REGIME_EXCLUDED = Object.freeze([
    "home-loan-interest",
    "health-insurance",
    "own-nps",
    "employer-nps",
    "lta-and-other-exemptions",
    "other-deductions",
    "other-income"
]);

const MONTHS = 12;

/* =========================================================
   EXACT INTEGER ARITHMETIC
========================================================= */

/* floor(n / d) for integers n >= 0, d > 0, without a floating-point quotient */
function floorDiv(n, d) {
    return (n - (n % d)) / d;
}

/* round half up: the nearest whole rupee to n / d, a fraction of exactly one half going up */
export function roundHalfUp(n, d) {
    return floorDiv(2 * n + d, 2 * d);
}

/* =========================================================
   INPUT CHECKS
========================================================= */

const WHOLE_RUPEES = "Enter a whole number of rupees, 0 or more.";

const isAmount = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const isAbsent = (value) => value === undefined || value === null || value === "";

/* "50", "50.5", "50.25" or the same as a number; at most two decimals; returned as integer hundredths, or null */
function parseHundredths(value) {

    const text = typeof value === "number" ? String(value) : value;

    if (typeof text !== "string") {
        return null;
    }

    const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(text.trim());

    if (!match) {
        return null;
    }

    return Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));

}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/*
 * `raw`: { ctc, basicPercent, pfBasis, gratuityIncluded, otherEmployerCosts, professionalTax,
 *          oldRegime: { enabled, hraReceived, rentPaid, highCity, other80C } }
 * `options`: { asOf: "YYYY-MM-DD" } optional; the caller supplies the date, this module never reads a clock.
 */
function checkInput(raw, config, options) {

    const errors = {};
    const missing = [];

    const input = raw && typeof raw === "object" ? raw : {};

    /* annual CTC */
    if (isAbsent(input.ctc)) {
        missing.push("ctc");
    } else if (!isAmount(input.ctc) || input.ctc === 0) {
        errors.ctc = "Enter your annual CTC as a whole number of rupees above 0.";
    }

    /* basic salary as a percentage of CTC: required, no default */
    let hundredths = null;

    if (isAbsent(input.basicPercent)) {
        missing.push("basicPercent");
    } else {

        hundredths = parseHundredths(input.basicPercent);

        if (hundredths === null || hundredths < 100 || hundredths > 10000) {
            errors.basicPercent = "Enter a percentage from 1 to 100, with at most two decimals.";
        }

    }

    /* PF basis: required choice, never preselected */
    if (isAbsent(input.pfBasis)) {
        missing.push("pfBasis");
    } else if (!PF_BASES.includes(input.pfBasis)) {
        errors.pfBasis = "Choose how the provident fund contribution is worked out.";
    }

    /* gratuity in CTC: required yes/no */
    if (isAbsent(input.gratuityIncluded)) {
        missing.push("gratuityIncluded");
    } else if (typeof input.gratuityIncluded !== "boolean") {
        errors.gratuityIncluded = "Choose yes or no.";
    }

    /* optional amounts, default 0 */
    for (const field of ["otherEmployerCosts", "professionalTax"]) {

        if (!isAbsent(input[field]) && !isAmount(input[field])) {
            errors[field] = WHOLE_RUPEES;
        }

    }

    /* the optional date the caller supplies for the validity check */
    if (options.asOf !== undefined && (typeof options.asOf !== "string" || !ISO_DATE.test(options.asOf))) {
        errors.asOf = "The date must be written as YYYY-MM-DD.";
    }

    return {
        errors,
        missing,
        values: {
            ctc: input.ctc,
            hundredths,
            pfBasis: input.pfBasis,
            gratuityIncluded: input.gratuityIncluded,
            otherEmployerCosts: isAbsent(input.otherEmployerCosts) ? 0 : input.otherEmployerCosts,
            professionalTax: isAbsent(input.professionalTax) ? 0 : input.professionalTax,
            oldRegime: input.oldRegime
        }
    };

}

/* =========================================================
   THE CTC DECOMPOSITION (spec 6.1)
========================================================= */

export function monthlyProvidentFund(basic, pfBasis, config) {

    if (pfBasis === "none") {
        return 0;
    }

    const { rateNumerator, rateDenominator, wageCeilingMonthly } = config.pf;

    /*
     * monthlyBasic = basic / 12. The contribution is rhu(rate x PF base).
     *   full-basic: rate x basic / 12 = rateNumerator x basic / (rateDenominator x 12)
     *   capped:     the same, but a monthly basic of at least the ceiling (basic >= 12 x ceiling) contributes on the ceiling.
     */
    if (pfBasis === "capped" && basic >= MONTHS * wageCeilingMonthly) {
        return roundHalfUp(rateNumerator * wageCeilingMonthly, rateDenominator);
    }

    return roundHalfUp(rateNumerator * basic, rateDenominator * MONTHS);

}

function decompose(values, config) {

    const basic = roundHalfUp(values.ctc * values.hundredths, 10000);

    const monthlyPf = monthlyProvidentFund(basic, values.pfBasis, config);

    const employerPf = MONTHS * monthlyPf;
    const employeePf = employerPf;

    const gratuity = values.gratuityIncluded
        ? roundHalfUp(basic * config.gratuity.numerator, config.gratuity.denominator)
        : 0;

    const gross = values.ctc - employerPf - gratuity - values.otherEmployerCosts;

    return { basic, monthlyPf, employerPf, employeePf, gratuity, gross };

}

/* =========================================================
   THE TAX ADAPTER (spec 7): Tool Pack 17, unchanged
========================================================= */

function taxFromEngine(engineInput) {

    const result = calculateTax(engineInput);

    return result;

}

function regimeFigures(gross, employeePf, professionalTax, tax) {

    const annualTakeHome = gross - employeePf - professionalTax - tax;

    return {
        tax,
        annualTakeHome,
        monthlyAverage: annualTakeHome >= 0 ? roundHalfUp(annualTakeHome, MONTHS) : 0
    };

}

/* the optional old-regime comparison: never allowed to disturb the new-regime figure */
function oldRegimeFigures(settings, parts, values) {

    if (!settings || settings.enabled !== true) {
        return { status: "off" };
    }

    const missing = [];
    const errors = {};

    for (const field of ["hraReceived", "rentPaid", "other80C"]) {

        if (isAbsent(settings[field])) {
            missing.push(field);
        } else if (!isAmount(settings[field])) {
            errors[field] = WHOLE_RUPEES;
        }

    }

    /* the metro choice matters only when both HRA received and rent paid are above zero */
    const needsMetro = isAmount(settings.hraReceived) && settings.hraReceived > 0
        && isAmount(settings.rentPaid) && settings.rentPaid > 0;

    if (needsMetro && typeof settings.highCity !== "boolean") {
        missing.push("highCity");
    }

    if (Object.keys(errors).length > 0) {
        return { status: "invalid", errors };
    }

    if (missing.length > 0) {
        return { status: "incomplete", missing };
    }

    if (settings.hraReceived + parts.basic > parts.gross) {
        return {
            status: "invalid",
            errors: { hraReceived: "HRA and basic salary together cannot be more than your gross salary." }
        };
    }

    const result = taxFromEngine({
        salary: parts.gross,
        basicPlusDa: parts.basic,
        professionalTax: values.professionalTax,
        section80C: parts.employeePf + settings.other80C,
        hraReceived: settings.hraReceived,
        rentPaid: settings.rentPaid,
        highCity: needsMetro ? settings.highCity : false
    });

    if (result.status !== "ok") {
        return { status: "unsupported", reason: "tax-engine-refused" };
    }

    const figures = regimeFigures(parts.gross, parts.employeePf, values.professionalTax, result.old.finalTax);

    if (figures.annualTakeHome < 0) {
        return {
            status: "invalid",
            errors: { decomposition: "The deductions are more than the gross salary. Check the professional tax." }
        };
    }

    return {
        status: "ok",
        ...figures,
        included: OLD_REGIME_INCLUDED,
        excluded: OLD_REGIME_EXCLUDED
    };

}

/* =========================================================
   THE CALCULATION
========================================================= */

function deepFreeze(value) {

    if (value && typeof value === "object" && !Object.isFrozen(value)) {

        Object.freeze(value);

        for (const key of Object.keys(value)) {
            deepFreeze(value[key]);
        }

    }

    return value;

}

export function calculateSalary(raw, options = {}, config = ACTIVE_SALARY_YEAR) {

    const checked = checkInput(raw, config, options);

    if (Object.keys(checked.errors).length > 0) {
        return deepFreeze({ status: "invalid", errors: checked.errors });
    }

    if (checked.missing.length > 0) {
        return deepFreeze({ status: "incomplete", missing: checked.missing });
    }

    const { values } = checked;

    if (options.asOf !== undefined && (options.asOf < config.validFrom || options.asOf > config.validThrough)) {
        return deepFreeze({ status: "unsupported", reason: "outside-validity", validFrom: config.validFrom, validThrough: config.validThrough });
    }

    if (values.ctc > config.ctcCap) {
        return deepFreeze({ status: "unsupported", reason: "ctc-above-cap", ceiling: config.ctcCap });
    }

    const parts = decompose(values, config);

    if (parts.gross <= 0 || parts.gross < parts.basic) {
        return deepFreeze({
            status: "invalid",
            errors: { decomposition: "The employer costs leave less than your basic salary. Check the basic percentage and the amounts." }
        });
    }

    if (values.professionalTax > parts.gross) {
        return deepFreeze({ status: "invalid", errors: { professionalTax: "Professional tax cannot be more than your gross salary." } });
    }

    /* the new-regime call is made with the new-regime inputs only, so the optional old-regime entries cannot affect it */
    const newResult = taxFromEngine({
        salary: parts.gross,
        basicPlusDa: parts.basic,
        professionalTax: values.professionalTax
    });

    if (newResult.status !== "ok") {
        return deepFreeze({ status: "unsupported", reason: "tax-engine-refused" });
    }

    const newFigures = regimeFigures(parts.gross, parts.employeePf, values.professionalTax, newResult.new.finalTax);

    if (newFigures.annualTakeHome < 0) {
        return deepFreeze({
            status: "invalid",
            errors: { decomposition: "The deductions are more than the gross salary. Check the professional tax." }
        });
    }

    const old = oldRegimeFigures(values.oldRegime, parts, values);

    return deepFreeze({
        status: "ok",
        salaryYear: config.id,
        taxYear: newResult.taxYear,
        verifiedOn: config.verifiedOn,
        ctc: values.ctc,
        basic: parts.basic,
        pfBasis: values.pfBasis,
        monthlyPf: parts.monthlyPf,
        employerPf: parts.employerPf,
        employeePf: parts.employeePf,
        gratuity: parts.gratuity,
        otherEmployerCosts: values.otherEmployerCosts,
        gross: parts.gross,
        professionalTax: values.professionalTax,
        new: newFigures,
        old,
        /* the CTC identity, recomputed from the lines (the oracle recomputes every line independently) */
        reconciliation: {
            cashAndDeductions: newFigures.annualTakeHome + parts.employeePf + values.professionalTax + newFigures.tax,
            employerCosts: parts.employerPf + parts.gratuity + values.otherEmployerCosts,
            ctc: values.ctc
        }
    });

}
