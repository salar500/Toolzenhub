/* =========================================================
   ToolZen Hub
   Fixed deposit (FD): pure calculation and input validation

   No DOM and no formatting: plain functions, so they can be
   tested on their own. The page (calculators/fd/index.js) only
   reads fields, calls these functions and shows what they return.

   THIS CALCULATES THE NUMBERS THE VISITOR ENTERS. It does not know
   a bank, a current rate or a product, and it never says an FD is
   "best", "safe" or "guaranteed".

   MODEL (rupees; deposit P, quoted rate a percent a year, m
   compounding periods a year, tenure N months)

       i = a / 100 / m                 rate for one compounding period
       L = 12 / m                      months in one period
       k = floor(N / L)                COMPLETED periods
       q = N - k * L                   months left over (a broken period)

   Interest is added to the deposit at the end of every completed
   period and stays invested (cumulative), and the rate is constant.

   THE BROKEN-PERIOD CONVENTION IS TOOLZEN HUB'S OWN. Completed
   periods compound; the q leftover months earn SIMPLE interest pro
   rata at the period rate:

       M = P * (1 + i)^k * (1 + i * q / L)

   With q = 0 this is plain compound interest. Banks differ on
   compounding dates, day counts, products, rounding and broken
   periods, so a bank's maturity can differ from this figure.

   EFFECTIVE ANNUAL YIELD = (1 + i)^m - 1: the growth of one year
   under the chosen compounding. It is not the quoted rate (unless
   compounding is yearly), not the growth over the whole tenure and
   not the CAGR of anything else.

   TOTAL GROWTH over the tenure = (M - P) / P.

   COMPARISON: Option B has its own rate and tenure but the SAME
   deposit and compounding as Option A. Differences are B - A, never
   a ranking, and they are marked as not like-for-like when the
   tenures differ.

   EXACTNESS. The power, the product and the divisions are worked out
   with whole numbers (BigInt) on the decimal values the visitor typed,
   so a maturity that should be exactly 1,07,000.00 is never off by a
   paisa because of floating point. Results are handed back as
   ordinary numbers; the working keeps eight decimals of a rupee.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const FD_LIMITS = Object.freeze({
    amount: { min: 1000, max: 100000000 },
    rate: { min: 0, max: 20 },
    years: { min: 0, max: 30 },
    months: { min: 0, max: 11 },
    totalMonths: { min: 1, max: 360 }
});

/* compounding periods a year, by name; the order is the order the page shows */
export const COMPOUNDING = Object.freeze({
    monthly: 12,
    quarterly: 4,
    "half-yearly": 2,
    yearly: 1
});


/* =========================================================
   EXACT ARITHMETIC (private)
   A typed decimal is held as value * 10^10, a whole number.
========================================================= */

const DECIMALS = 10;

const S = 10n ** BigInt(DECIMALS);

function scaled(
    value
) {

    let text =
        String(value);

    const decimals =
        text.includes(".") ? text.split(".")[1].length : 0;

    if (/e/i.test(text) || decimals > DECIMALS) {
        text = Number(value).toFixed(DECIMALS);
    }

    const [whole, fraction = ""] =
        text.split(".");

    return BigInt(whole + fraction.padEnd(DECIMALS, "0"));

}

/* money worked out from a ratio keeps eight decimals of a rupee */
const SC = 10n ** 8n;

const toMoney = (scaledValue) => Number(scaledValue) / Number(SC);


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers):
           amount, rate, years, months, compounding,
           and optionally bRate, bYears, bMonths
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }

   A tenure left completely empty (both years and months) is
   "not entered"; one of the two empty counts as 0.
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

const toNum = (raw) =>
    isBlank(raw) ? NaN : Number(raw);

const inRange = (value, { min, max }) =>
    Number.isFinite(value) && value >= min && value <= max;

/* the months of a years + months pair; null when both are empty, NaN when invalid */
export function tenureMonths(
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
        !inRange(y, FD_LIMITS.years) ||
        !inRange(m, FD_LIMITS.months)
    ) {
        return NaN;
    }

    const total = y * 12 + m;

    return inRange(total, FD_LIMITS.totalMonths)
        ? total
        : NaN;

}

const TENURE_MESSAGE =
    "Enter a tenure of at least 1 month and at most 30 years, with months from 0 to 11.";

export function validateFdInputs(
    raw
) {

    const errors = [];

    const amount = toNum(raw.amount);
    const rate = toNum(raw.rate);

    if (!inRange(amount, FD_LIMITS.amount)) {

        errors.push({
            fields: ["amount"],
            message:
                "Enter a deposit between ₹1,000 and ₹10 crore."
        });

    }

    if (!inRange(rate, FD_LIMITS.rate)) {

        errors.push({
            fields: ["rate"],
            message:
                "Enter an interest rate between 0% and 20%."
        });

    }

    const months =
        tenureMonths(raw.years, raw.months);

    if (months === null || Number.isNaN(months)) {

        errors.push({
            fields: ["years", "months"],
            message: TENURE_MESSAGE
        });

    }

    const compounding =
        String(raw.compounding ?? "");

    if (!Object.hasOwn(COMPOUNDING, compounding)) {

        errors.push({
            fields: ["compounding"],
            message:
                "Choose how often interest is added."
        });

    }

    /* Option B: a rate makes a comparison; a tenure alone does nothing */
    let optionB = null;

    if (!isBlank(raw.bRate)) {

        const bRate = toNum(raw.bRate);

        if (!inRange(bRate, FD_LIMITS.rate)) {

            errors.push({
                fields: ["bRate"],
                message:
                    "Enter a rate between 0% and 20% for Option B, or leave it blank."
            });

        }

        const bMonths =
            tenureMonths(raw.bYears, raw.bMonths);

        if (Number.isNaN(bMonths)) {

            errors.push({
                fields: ["bYears", "bMonths"],
                message:
                    "Enter an Option B tenure of at least 1 month and at most 30 years, or leave it blank to use Option A's."
            });

        }

        if (inRange(bRate, FD_LIMITS.rate) && !Number.isNaN(bMonths)) {
            optionB = { rate: bRate, months: bMonths };   // null months: the same as Option A
        }

    } else {

        /* a tenure typed without a rate is still checked, so a bad value is not left unmarked */
        const bMonths =
            tenureMonths(raw.bYears, raw.bMonths);

        if (Number.isNaN(bMonths)) {

            errors.push({
                fields: ["bYears", "bMonths"],
                message:
                    "Enter an Option B tenure of at least 1 month and at most 30 years, or leave it blank."
            });

        }

    }

    return errors.length > 0
        ? { ok: false, errors }
        : {
            ok: true,
            values: {
                amount,
                rate,
                months,
                compounding,
                optionB: optionB === null
                    ? null
                    : { rate: optionB.rate, months: optionB.months ?? months }
            }
        };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateFdInputs).
   Returns plain numbers; nothing is formatted.
========================================================= */

function deposit(
    amount,
    rate,
    months,
    compounding
) {

    const m = COMPOUNDING[compounding];
    const length = 12 / m;
    const k = Math.floor(months / length);
    const q = months - k * length;

    const principal = scaled(amount);
    const ia = scaled(rate);                       // i = ia / ib
    const ib = 100n * S * BigInt(m);
    const u = ib + ia;
    const kk = BigInt(k);

    // M = P * u^k * (ib * L + ia * q) / (ib^k * ib * L)
    const numerator = principal * u ** kk * (ib * BigInt(length) + ia * BigInt(q));
    const denominator = S * ib ** kk * ib * BigInt(length);

    const maturityScaled = numerator * SC / denominator;
    const interestScaled = maturityScaled - principal * SC / S;

    // yield = (1 + i)^m - 1 as a fraction, kept to ten decimals
    const yieldScaled = (u ** BigInt(m) - ib ** BigInt(m)) * S / ib ** BigInt(m);

    // growth over the tenure = interest / principal, to ten decimals
    const growthScaled = interestScaled * S / (principal * SC / S);

    return {
        rate,
        months,
        completedPeriods: k,
        remainingMonths: q,
        maturity: toMoney(maturityScaled),
        interest: toMoney(interestScaled),
        effectiveYield: Number(yieldScaled) / Number(S),
        totalGrowth: Number(growthScaled) / Number(S)
    };

}

export function calculateFd({
    amount,
    rate,
    months,
    compounding,
    optionB = null
}) {

    const a =
        deposit(amount, rate, months, compounding);

    const result = {
        input: { amount, rate, months, compounding, optionB },
        periodsPerYear: COMPOUNDING[compounding],
        periodMonths: 12 / COMPOUNDING[compounding],
        ...a,
        optionB: null,
        comparison: null
    };

    if (optionB) {

        const b =
            deposit(amount, optionB.rate, optionB.months, compounding);

        result.optionB = b;

        /* differences are B - A; money to the paisa so the table agrees with what it shows */
        result.comparison = {
            maturity: Math.round((b.maturity - a.maturity) * 100) / 100,
            interest: Math.round((b.interest - a.interest) * 100) / 100,
            effectiveYield: b.effectiveYield - a.effectiveYield,
            months: b.months - a.months,
            rate: Math.round((b.rate - a.rate) * 1e10) / 1e10,
            likeForLike: a.months === b.months
        };

    }

    return result;

}
