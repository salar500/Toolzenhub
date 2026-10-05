/* =========================================================
   ToolZen Hub
   CAGR (compound annual growth rate): pure calculation and
   input validation

   No DOM and no formatting beyond the percentage rounding rule:
   plain functions, so they can be tested on their own. The page
   (calculators/cagr/index.js) only reads fields, calls these
   functions and shows what they return.

   THIS DESCRIBES TWO VALUES AND A PERIOD. It is not a forecast, a
   fund comparison or XIRR. It assumes one starting value and one
   ending value with nothing added or withdrawn in between.

   MODEL (start S, end E, period m months, t = m / 12 years)

       CAGR            g = (E / S)^(1 / t) - 1
       total growth      = (E - S) / S
       growth multiple   = E / S
       simple yearly average = total growth / t        (total growth
                           divided by the years, and nothing more:
                           it is NOT a mean of yearly returns)

   Looking ahead uses the same formula with a target as E: the yearly
   rate that mathematically connects the two values, not a prediction.

   MONEY is held as whole paise (1 rupee = 100 paise), so the ratio is
   built from exact integers. The root is taken with a floating-point
   power, which is accurate to about 15 significant digits: far beyond the
   two decimals shown, and checked against an independent high-precision
   reference (tests/fixtures/cagr-golden.py, which finds the rate by
   bisection on integer powers).

   DISPLAY ROUNDING. Percentages are shown to two decimals, rounded half
   up (a tie goes away from zero), and a result that rounds to zero is
   shown without a sign. percentText() adds a tiny allowance (1e-7 of a
   hundredth) so an exactly representable tie such as 0.125% is not
   pushed down by floating-point residue.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const CAGR_LIMITS = Object.freeze({
    valuePaise: { min: 1, max: 999999999999 },       // 0.01 to 99,99,99,999.99 rupees
    years: { min: 1, max: 50 },
    months: { min: 0, max: 11 },
    totalMonths: { min: 12, max: 600 },
    ratio: { min: 1 / 1000, max: 1000 }
});

export const CAGR_MODES = Object.freeze(["back", "ahead"]);


/* =========================================================
   PARSING (private)
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

/* "1234.5" -> 123450 paise; null when it is not a plain amount with at most two decimals */
function parsePaise(raw) {

    const text = String(raw).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
        return null;
    }

    const [whole, fraction = ""] = text.split(".");

    const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

    return Number.isSafeInteger(paise) ? paise : null;

}

/* the months of a years + months pair; null when both are empty, NaN when invalid */
export function periodMonths(
    years,
    months
) {

    if (isBlank(years) && isBlank(months)) {
        return null;
    }

    const y = isBlank(years) ? 0 : Number(years);
    const m = isBlank(months) ? 0 : Number(months);

    if (
        !Number.isInteger(y) ||
        !Number.isInteger(m) ||
        y < 0 ||
        y > CAGR_LIMITS.years.max ||
        m < CAGR_LIMITS.months.min ||
        m > CAGR_LIMITS.months.max
    ) {
        return NaN;
    }

    const total = y * 12 + m;

    return total >= CAGR_LIMITS.totalMonths.min && total <= CAGR_LIMITS.totalMonths.max
        ? total
        : NaN;

}


/* =========================================================
   VALIDATION
   Input:  { mode, start, end, years, months,
             bEnd, bStart, bYears, bMonths }      (raw strings or numbers)
   Output: { ok: true, values } or { ok: false, errors } where each
           error is { fields: [names], message }

   Case B is active only when its ending value is entered; with no
   ending value every other Case B field is ignored, without a message.
   A blank Case B starting value or period is the first case's.
========================================================= */

const START_MESSAGE =
    "Enter a starting value between ₹0.01 and ₹99,99,99,999.99, with at most two decimals.";

const END_MESSAGE =
    "Enter an ending value between ₹0.01 and ₹99,99,99,999.99, with at most two decimals.";

const RATIO_MESSAGE =
    "The ending value must be between 1/1,000 and 1,000 times the starting value.";

const PERIOD_MESSAGE =
    "Enter a period of at least 1 year and at most 50 years, with months from 0 to 11.";

const inValueRange = (paise) =>
    paise !== null &&
    paise >= CAGR_LIMITS.valuePaise.min &&
    paise <= CAGR_LIMITS.valuePaise.max;

/* end / start within 1/1,000 to 1,000, decided with whole numbers */
const ratioOk = (startPaise, endPaise) =>
    endPaise * 1000 >= startPaise &&
    endPaise <= startPaise * 1000;

export function validateCagrInputs(
    raw
) {

    const errors = [];

    const mode = String(raw.mode ?? "");

    if (!CAGR_MODES.includes(mode)) {

        errors.push({
            fields: ["mode"],
            message: "Choose looking back or looking ahead."
        });

    }

    const start = isBlank(raw.start) ? null : parsePaise(raw.start);
    const end = isBlank(raw.end) ? null : parsePaise(raw.end);
    const months = periodMonths(raw.years, raw.months);

    if (!inValueRange(start)) {
        errors.push({ fields: ["start"], message: START_MESSAGE });
    }

    if (!inValueRange(end)) {
        errors.push({ fields: ["end"], message: END_MESSAGE });
    }

    if (inValueRange(start) && inValueRange(end) && !ratioOk(start, end)) {
        errors.push({ fields: ["end"], message: RATIO_MESSAGE });
    }

    if (months === null || Number.isNaN(months)) {
        errors.push({ fields: ["years", "months"], message: PERIOD_MESSAGE });
    }

    /* Case B */
    let caseB = null;

    if (!isBlank(raw.bEnd)) {

        const bEnd = parsePaise(raw.bEnd);
        const bStart = isBlank(raw.bStart) ? start : parsePaise(raw.bStart);
        const bMonths = periodMonths(raw.bYears, raw.bMonths);

        if (!inValueRange(bEnd)) {
            errors.push({ fields: ["bEnd"], message: `Investment B: ${END_MESSAGE}` });
        }

        if (!isBlank(raw.bStart) && !inValueRange(bStart)) {
            errors.push({ fields: ["bStart"], message: `Investment B: ${START_MESSAGE}` });
        }

        if (Number.isNaN(bMonths)) {
            errors.push({ fields: ["bYears", "bMonths"], message: `Investment B: ${PERIOD_MESSAGE}` });
        }

        if (
            inValueRange(bEnd) &&
            inValueRange(bStart) &&
            !ratioOk(bStart, bEnd)
        ) {
            errors.push({ fields: ["bEnd"], message: `Investment B: ${RATIO_MESSAGE}` });
        }

        if (inValueRange(bEnd) && inValueRange(bStart) && !Number.isNaN(bMonths)) {
            caseB = {
                startPaise: bStart,
                endPaise: bEnd,
                months: bMonths === null ? months : bMonths
            };
        }

    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        values: {
            mode,
            startPaise: start,
            endPaise: end,
            months,
            caseB
        }
    };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateCagrInputs).
   Returns plain numbers (fractions, not percentages).
========================================================= */

function growthCase(
    startPaise,
    endPaise,
    months
) {

    const years = months / 12;
    const ratio = endPaise / startPaise;
    const totalGrowth = (endPaise - startPaise) / startPaise;

    return {
        startPaise,
        endPaise,
        months,
        years,
        cagr: ratio === 1 ? 0 : Math.pow(ratio, 1 / years) - 1,
        totalGrowth,
        multiple: ratio,
        simpleYearly: totalGrowth / years
    };

}

export function calculateCagr({
    mode,
    startPaise,
    endPaise,
    months,
    caseB = null
}) {

    const a = growthCase(startPaise, endPaise, months);

    const result = {
        mode,
        ...a,
        caseB: null,
        comparison: null
    };

    if (caseB) {

        const b = growthCase(caseB.startPaise, caseB.endPaise, caseB.months);

        result.caseB = b;

        result.comparison = {
            cagr: b.cagr - a.cagr,
            totalGrowth: b.totalGrowth - a.totalGrowth,
            multiple: b.multiple - a.multiple,
            simpleYearly: b.simpleYearly - a.simpleYearly,
            startPaise: b.startPaise - a.startPaise,
            endPaise: b.endPaise - a.endPaise,
            months: b.months - a.months
        };

    }

    return result;

}


/* =========================================================
   DISPLAY ROUNDING
========================================================= */

/* a fraction as a percentage with two decimals, half up (a tie away from zero), never "-0.00" */
export function percentText(
    fraction
) {

    const scaled = Math.abs(fraction) * 10000;                 // hundredths of a percent
    const rounded = Math.floor(scaled + 0.5 + 1e-7);

    if (rounded === 0) {
        return "0.00";
    }

    const text = (rounded / 100).toFixed(2);

    return fraction < 0 ? `-${text}` : text;

}

/* a ratio with two decimals, half up */
export function multipleText(
    ratio
) {

    return (Math.floor(ratio * 100 + 0.5 + 1e-7) / 100).toFixed(2);

}
