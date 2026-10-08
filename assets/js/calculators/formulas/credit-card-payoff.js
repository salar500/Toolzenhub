/* =========================================================
   ToolZen Hub
   Credit Card Payoff: the formulas

   A simplified estimate of how long a FIXED monthly payment
   takes to clear a balance. It is not a card statement and it
   models no issuer's rules: the APR is divided by 12, interest
   is charged on the balance at the start of each month BEFORE
   that month's payment, and payments are made at the end of the
   month. No purchases, fees or minimum-payment rules.

   Pure and deterministic: no DOM, no clock, no storage.

   EXACT ARITHMETIC (docs/tool-packs/24-credit-card-payoff.md)
   Money is a whole number of PAISE and the APR a whole number
   of HUNDREDTHS OF A PERCENT, so the monthly rate is exactly
   apr / 120000. A balance is a BigInt fixed-point integer, scaled
   by 10^24 per paisa. Double arithmetic is not used for a balance,
   an interest figure or a total: just above the interest threshold
   a payment makes the balance hypersensitive to a rounding error
   in the rate, and doubles gave the wrong paise there.

   BigInt is called as a function (never written as 12n) so this file
   still loads where BigInt is missing; the page then says so.

   THREE DIFFERENT OUTCOMES
     non-amortizing   payment <= the first month's interest
                      (decided by an exact integer test, before any
                      simulation): the balance does not fall
     payoff           the balance reaches zero within 600 payments
     beyond-horizon   the payment exceeds the interest but a balance
                      remains after payment 600

   FINAL PAYMENT AND THE HALF-PAISA RULE
   Each month the payment is capped at the amount due. When the amount
   due is no more than half a paisa above the payment, that month's
   payment is the amount due (so the final payment can exceed the
   entered payment by less than half a paisa) and the balance is then
   exactly zero. So total repaid = balance + total interest exactly,
   and a residual below half a paisa never creates a further payment.
   The rule cannot change the classification: non-amortizing is decided
   before it, and it can only move a payoff that would otherwise need
   one extra payment of under half a paisa onto the last payment.
========================================================= */

export const HORIZON_MONTHS = 600;

export const BIGINT_AVAILABLE = typeof BigInt === "function";

export const LIMITS = Object.freeze({
    balance: { minPaise: 10000, maxPaise: 1000000000 },
    apr: { minHundredths: 0, maxHundredths: 10000 },
    payment: { minPaise: 100, maxPaise: 1000000000 }
});

/* one paisa is SCALE fixed-point units */
const SCALE_EXPONENT = 24;


/* =========================================================
   MESSAGES
========================================================= */

export const MESSAGES = Object.freeze({
    balance: "Enter a balance between ₹100 and ₹1,00,00,000, with at most 2 decimal places.",
    apr: "Enter an annual percentage rate between 0% and 100%, with at most 2 decimal places.",
    payment: "Enter a monthly payment between ₹1 and ₹1,00,00,000, with at most 2 decimal places.",
    noBigInt: "This browser cannot do the exact arithmetic this calculator needs, so it shows no result rather than an imprecise one. Please use a current version of your browser."
});


/* =========================================================
   PARSING (exact: no rounding, no exponent, no sign, no separators)
========================================================= */

const DECIMAL_TEXT = /^(?:[0-9]+(?:[.][0-9]{1,2})?|[.][0-9]{1,2})$/;

/*
 * "3500.01" -> 350001 (paise, or hundredths: the same shift of two decimals), or null when the text is not
 * digits with at most two decimals. A value with more decimals is refused, never rounded.
 */
export function parseHundredths(text) {

    const trimmed = String(text ?? "").trim();

    if (!DECIMAL_TEXT.test(trimmed)) {
        return null;
    }

    const [whole, fraction = ""] = trimmed.split(".");

    const value = Number(whole === "" ? "0" : whole) * 100 + Number(fraction.padEnd(2, "0"));

    return Number.isSafeInteger(value) ? value : null;

}


/*
 * raw: { balance, apr, payment, comparePayment } as text.
 * { ok: true, values: { balancePaise, aprHundredths, paymentPaise, comparePaise | null } }
 * { ok: false, errors: [{ fields: [name], message }] }
 */
export function validateInputs(raw) {

    const errors = [];

    const balance = parseHundredths(raw.balance);
    const apr = parseHundredths(raw.apr);
    const payment = parseHundredths(raw.payment);

    const blankCompare = String(raw.comparePayment ?? "").trim() === "";
    const compare = blankCompare ? null : parseHundredths(raw.comparePayment);

    if (balance === null || balance < LIMITS.balance.minPaise || balance > LIMITS.balance.maxPaise) {
        errors.push({ fields: ["balance"], message: MESSAGES.balance });
    }

    if (apr === null || apr < LIMITS.apr.minHundredths || apr > LIMITS.apr.maxHundredths) {
        errors.push({ fields: ["apr"], message: MESSAGES.apr });
    }

    if (payment === null || payment < LIMITS.payment.minPaise || payment > LIMITS.payment.maxPaise) {
        errors.push({ fields: ["payment"], message: MESSAGES.payment });
    }

    if (!blankCompare && (compare === null || compare < LIMITS.payment.minPaise || compare > LIMITS.payment.maxPaise)) {
        errors.push({ fields: ["comparePayment"], message: MESSAGES.payment });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        values: { balancePaise: balance, aprHundredths: apr, paymentPaise: payment, comparePaise: compare }
    };

}


/* =========================================================
   EXACT SIMULATION
========================================================= */

const big = (value) => BigInt(value);

/* a fixed-point amount (BigInt, SCALE per paisa, never negative) to whole paise, rounded half up */
function fixedToPaise(fixed) {

    const scale = big(10) ** big(SCALE_EXPONENT);

    return Number((fixed + scale / big(2)) / scale);

}

/* a signed difference of two fixed-point amounts to whole paise: rounded half up on the size, sign kept */
function signedFixedToPaise(fixed) {

    return fixed < big(0) ? -fixedToPaise(-fixed) : fixedToPaise(fixed);

}

/*
 * One payment's outcome for exact integer inputs (paise, hundredths of a percent).
 *
 * { state: "non-amortizing", firstInterestPaise, smallestReducingPaise }
 * { state: "payoff", months, totalRepaidPaise, totalInterestPaise, finalPaymentPaise, firstInterestPaise, _interest, _total }
 * { state: "beyond-horizon", firstInterestPaise }
 *
 * `_interest` and `_total` are the exact fixed-point totals, kept so a comparison can subtract before rounding.
 */
export function simulatePayoff({ balancePaise, aprHundredths, paymentPaise }) {

    if (!BIGINT_AVAILABLE) {
        throw new Error(MESSAGES.noBigInt);
    }

    const scale = big(10) ** big(SCALE_EXPONENT);

    const balanceP = big(balancePaise);
    const aprH = big(aprHundredths);
    const payP = big(paymentPaise);

    /* the first month's interest in fixed point, and the exact threshold test (integers only) */
    const firstFixed = (balanceP * scale * aprH) / big(120000);
    const firstInterestPaise = fixedToPaise(firstFixed);

    if (aprHundredths > 0 && payP * big(120000) <= balanceP * aprH) {

        return {
            state: "non-amortizing",
            firstInterestPaise,
            /* the smallest whole-paisa payment that is strictly above the interest */
            smallestReducingPaise: Number((balanceP * aprH) / big(120000)) + 1
        };

    }

    const half = scale / big(2);
    const multiplier = big(120000) + aprH;
    const divisor = big(120000);
    const payment = payP * scale;

    let balance = balanceP * scale;
    let total = big(0);
    let last = big(0);
    let months = 0;

    while (balance > half && months < HORIZON_MONTHS) {

        months += 1;

        const due = (balance * multiplier) / divisor;

        const pay = due <= payment + half ? due : payment;

        total += pay;
        last = pay;
        balance = due - pay;

    }

    if (balance > big(0)) {

        return { state: "beyond-horizon", firstInterestPaise };

    }

    const interest = total - balanceP * scale;

    return {
        state: "payoff",
        months,
        totalRepaidPaise: fixedToPaise(total),
        totalInterestPaise: fixedToPaise(interest),
        finalPaymentPaise: fixedToPaise(last),
        firstInterestPaise,
        _interest: interest,
        _total: total
    };

}


/* =========================================================
   THE WHOLE CALCULATION, WITH THE OPTIONAL COMPARISON
========================================================= */

/*
 * values: the object validateInputs returns.
 *
 * { primary: outcome, comparison: null | { outcome, kind, ... } }
 *
 * comparison.kind:
 *   "difference"   both pay off: monthsDifference and interestDifferencePaise are (payment 1) - (payment 2)
 *   "equal"        the two payments are the same
 *   "unavailable"  at least one side does not pay off: no difference of any kind is produced
 *                  (reason: "non-payoff")
 */
export function calculatePayoff(values) {

    const base = { balancePaise: values.balancePaise, aprHundredths: values.aprHundredths };

    const primary = simulatePayoff({ ...base, paymentPaise: values.paymentPaise });

    if (values.comparePaise === null || values.comparePaise === undefined) {
        return { values, primary, comparison: null };
    }

    const other = simulatePayoff({ ...base, paymentPaise: values.comparePaise });

    if (values.comparePaise === values.paymentPaise) {
        return { values, primary, comparison: { outcome: other, kind: "equal" } };
    }

    if (primary.state !== "payoff" || other.state !== "payoff") {
        return { values, primary, comparison: { outcome: other, kind: "unavailable" } };
    }

    return {
        values,
        primary,
        comparison: {
            outcome: other,
            kind: "difference",
            monthsDifference: primary.months - other.months,
            /* subtracted exactly, rounded once */
            interestDifferencePaise: signedFixedToPaise(primary._interest - other._interest)
        }
    };

}


/* =========================================================
   TEXT FOR THE PAGE
========================================================= */

const rupeeGroups = new Intl.NumberFormat("en-IN");

const pad2 = (n) => String(n).padStart(2, "0");

/* 7036029 -> "₹70,360.29" (integer arithmetic on paise; Indian grouping) */
export function formatPaise(paise) {

    const negative = paise < 0;

    const abs = Math.abs(paise);

    return `${negative ? "-" : ""}₹${rupeeGroups.format(Math.floor(abs / 100))}.${pad2(abs % 100)}`;

}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function describeMonths(months) {

    const years = Math.floor(months / 12);
    const rest = months % 12;

    if (months < 12) {
        return plural(months, "month", "months");
    }

    const parts = [plural(years, "year", "years")];

    if (rest > 0) {
        parts.push(plural(rest, "month", "months"));
    }

    return parts.join(" ");

}

/* the main sentence of one outcome */
export function outcomeSentence(outcome) {

    if (outcome.state === "payoff") {
        return `Estimated payoff: ${plural(outcome.months, "payment", "payments")} (${describeMonths(outcome.months)}). The last payment is ${formatPaise(outcome.finalPaymentPaise)}.`;
    }

    if (outcome.state === "non-amortizing") {
        /* the smallest payment is the exact integer threshold (the next whole paisa above the exact interest), never the rounded interest shown elsewhere */
        return `Your monthly payment does not cover the first month's interest under this model. A payment of at least ${formatPaise(outcome.smallestReducingPaise)} is needed to start reducing the balance.`;
    }

    return "At this payment the estimated payoff is more than 50 years (600 months) away, so no payoff time is shown.";

}

/* the sentence that says what the comparison can and cannot show */
export function comparisonSentences(comparison) {

    if (comparison === null) {
        return [];
    }

    if (comparison.kind === "equal") {
        return ["The two payments are the same."];
    }

    if (comparison.kind === "unavailable") {
        return ["At least one of the two payments does not pay the balance off within 50 years, so no saving in time or interest can be worked out."];
    }

    const months = comparison.monthsDifference;
    const interest = comparison.interestDifferencePaise;

    const monthText = months === 0
        ? "Payment 2 takes the same number of months as payment 1."
        : `Payment 2 takes ${plural(Math.abs(months), "month", "months")} ${months > 0 ? "fewer" : "more"} than payment 1.`;

    const interestText = interest === 0
        ? "The total interest is the same."
        : `Payment 2 costs ${formatPaise(Math.abs(interest))} ${interest > 0 ? "less" : "more"} interest than payment 1.`;

    return [monthText, interestText];

}

/* one sentence for a screen reader after Calculate */
export function announcement(result) {

    const { primary, comparison } = result;

    let text = primary.state === "payoff"
        ? `Estimated payoff ${describeMonths(primary.months)}. Total interest ${formatPaise(primary.totalInterestPaise)}.`
        : primary.state === "non-amortizing"
            ? "This payment will not pay off the balance."
            : "No payoff within 50 years at this payment.";

    if (comparison !== null) {

        if (comparison.kind === "difference") {
            text += ` ${comparisonSentences(comparison).join(" ")}`;
        } else if (comparison.kind === "equal") {
            text += " The two payments are the same.";
        } else {
            text += " No comparison of time or interest is available.";
        }

    }

    return text;

}

/* the example on the page: loaded by Load example */
export const EXAMPLE = Object.freeze({ balance: "50000", apr: "36", payment: "3000", comparePayment: "4000" });
