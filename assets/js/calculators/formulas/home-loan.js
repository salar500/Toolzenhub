/* =========================================================
   ToolZen Hub
   Home loan that fits an EMI budget: pure calculation and
   input validation

   No DOM and no formatting: plain functions, so they can be
   tested on their own. The page (calculators/home-loan/index.js)
   only reads fields, calls these functions and shows what they
   return.

   THIS IS THE VISITOR'S OWN PLANNING, NOT A LENDER'S DECISION. The
   share of income, the rate and the tenure are choices the visitor
   makes. Nothing here knows a lender's rules, credit score, age,
   documents or loan-to-value limit, and it never says a loan is
   "eligible" or "approved".

   MODEL (rupees; income I, existing EMIs X, share s percent, rate
   a percent a year, tenure N years, own funds O)

       r = a / 12 / 100          monthly rate
       n = 12 * N                number of monthly payments
       room B = max(0, I * s / 100 - X)

   Payments are equal and made at the end of each month. The EMI of
   a loan P is

       E(P) = P * r * (1 + r)^n / ((1 + r)^n - 1)       r > 0
       E(P) = P / n                                      r = 0

   THE LOAN THAT FITS is the LARGEST WHOLE-RUPEE P with E(P) <= B,
   that is
       P = floor( B * ((1 + r)^n - 1) / (r * (1 + r)^n) )
       P = floor( B * n )                                r = 0
   It is rounded DOWN, never to the nearest rupee, so the EMI on it
   never goes above the room and one rupee more would.

   TOTALS use the loan that fits: total repaid = E(P) * n and total
   interest = total repaid - P. The property budget is P + O, a
   simple total with no charges, stamp duty or lender limit.

   TENURE ROWS repeat the same solve for 10, 15, 20, 25 and 30
   years (and the entered tenure when it is not among them) with the
   SAME room.

   EXACTNESS. The room, the power (1 + r)^n and the floor are worked
   out with whole numbers (BigInt) on the decimal values the visitor
   typed, so a loan that should be exactly 34,56,925 is never off by a
   rupee because of floating point. Results are handed back as
   ordinary numbers.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const HOME_LOAN_LIMITS = Object.freeze({
    income:   { min: 1000, max: 10000000 },
    existing: { min: 0, max: 10000000 },
    share:    { min: 1, max: 90 },
    rate:     { min: 0, max: 30 },
    years:    { min: 1, max: 30 },
    own:      { min: 0, max: 1000000000 }
});

/* the tenures the table always shows, in years */
export const TENURE_ROWS = Object.freeze([10, 15, 20, 25, 30]);


/* =========================================================
   EXACT ARITHMETIC (private)
   A value is held as value * 10^10, a whole number.
========================================================= */

const DECIMALS = 10;

const S = 10n ** BigInt(DECIMALS);

/* a number as the decimal text it was typed as, scaled by S */
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

/* four decimals more than a paisa for the money worked out from a ratio */
const SC = 10n ** 8n;

const toNumber = (scaledValue) => Number(scaledValue) / Number(SC);


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers):
           income, share, rate, years,
           existing (blank means 0), own (blank means none)
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

const toNum = (raw) =>
    isBlank(raw) ? NaN : Number(raw);

const inRange = (value, { min, max }) =>
    Number.isFinite(value) && value >= min && value <= max;

export function validateHomeLoanInputs(
    raw
) {

    const errors = [];

    const income = toNum(raw.income);
    const share = toNum(raw.share);
    const rate = toNum(raw.rate);
    const years = toNum(raw.years);

    if (!inRange(income, HOME_LOAN_LIMITS.income)) {

        errors.push({
            fields: ["income"],
            message:
                "Enter a monthly income between ₹1,000 and ₹1 crore."
        });

    }

    if (!inRange(share, HOME_LOAN_LIMITS.share)) {

        errors.push({
            fields: ["share"],
            message:
                "Enter a share of income between 1% and 90%."
        });

    }

    if (!inRange(rate, HOME_LOAN_LIMITS.rate)) {

        errors.push({
            fields: ["rate"],
            message:
                "Enter an interest rate between 0% and 30%."
        });

    }

    if (
        !inRange(years, HOME_LOAN_LIMITS.years) ||
        !Number.isInteger(years)
    ) {

        errors.push({
            fields: ["years"],
            message:
                "Enter a tenure of 1 to 30 whole years."
        });

    }

    let existing = 0;

    if (!isBlank(raw.existing)) {

        const number =
            toNum(raw.existing);

        if (!inRange(number, HOME_LOAN_LIMITS.existing)) {

            errors.push({
                fields: ["existing"],
                message:
                    "Enter existing payments between ₹0 and ₹1 crore, or leave it blank."
            });

        } else {

            existing = number;

        }

    }

    let own = null;

    if (!isBlank(raw.own)) {

        const number =
            toNum(raw.own);

        if (!inRange(number, HOME_LOAN_LIMITS.own)) {

            errors.push({
                fields: ["own"],
                message:
                    "Enter your own funds between ₹0 and ₹100 crore, or leave it blank."
            });

        } else {

            own = number;

        }

    }

    return errors.length > 0
        ? { ok: false, errors }
        : { ok: true, values: { income, existing, share, rate, years, own } };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateHomeLoanInputs).
   Returns plain numbers; nothing is formatted.
========================================================= */

/*
 * The monthly rate as a ratio of whole numbers, ra / rb, where
 * r = a / 12 / 100 and a was typed with up to ten decimals.
 */
function monthlyRate(
    rate
) {

    return {
        ra: scaled(rate),
        rb: 1200n * S
    };

}

/*
 * The loan and what it costs for a room of roomNum / roomDen
 * rupees over `years` at `rate`.
 */
function solve(
    roomNum,
    roomDen,
    rate,
    years
) {

    const n = BigInt(years * 12);
    const { ra, rb } = monthlyRate(rate);

    if (roomNum === 0n) {
        return { loan: 0n, emi: 0n, repaid: 0n, interest: 0n };
    }

    if (ra === 0n) {

        // 0%: E(P) = P / n, so the largest whole P with P / n <= B is floor(B * n)
        const loan = roomNum * n / roomDen;
        const emi = loan * SC / n;
        const repaid = loan * SC;

        return { loan, emi, repaid, interest: 0n };

    }

    const u = rb + ra;
    const un = u ** n;
    const rbn = rb ** n;

    // largest whole-rupee P:  P = floor( B * ((1+r)^n - 1) / (r * (1+r)^n) ), with r = ra / rb
    const loan =
        roomNum * (un - rbn) * rb / (roomDen * ra * un);

    // E(P) = P * r * (1+r)^n / ((1+r)^n - 1) = P * ra * u^n / (rb * (u^n - rb^n))
    const emi =
        loan * ra * un * SC / (rb * (un - rbn));

    const repaid =
        loan * ra * un * n * SC / (rb * (un - rbn));

    return {
        loan,
        emi,
        repaid,
        interest: repaid - loan * SC
    };

}

export function calculateHomeLoan({
    income,
    existing = 0,
    share,
    rate,
    years,
    own = null
}) {

    const incomeS = scaled(income);
    const existingS = scaled(existing);
    const shareS = scaled(share);

    // rupees = numerator / (100 * S * S)
    const denominator = 100n * S * S;

    const capacityNum = incomeS * shareS;
    const roomNumRaw = capacityNum - existingS * 100n * S;
    const roomNum = roomNumRaw > 0n ? roomNumRaw : 0n;

    const main =
        solve(roomNum, denominator, rate, years);

    const tenures =
        [...new Set([...TENURE_ROWS, years])].sort((a, b) => a - b);

    const tenureRows =
        tenures.map(
            tenure => {

                const row =
                    solve(roomNum, denominator, rate, tenure);

                return {
                    years: tenure,
                    yours: tenure === years,
                    loan: Number(row.loan),
                    interest: toNumber(row.interest),
                    repaid: toNumber(row.repaid)
                };

            }
        );

    return {
        input: { income, existing, share, rate, years, own },
        capacity: toNumber(capacityNum * SC / denominator),
        room: toNumber(roomNum * SC / denominator),
        noRoom: roomNum === 0n,
        loan: Number(main.loan),
        emi: toNumber(main.emi),
        totalRepayment: toNumber(main.repaid),
        totalInterest: toNumber(main.interest),
        existingShare: Number(existingS) / Number(incomeS),
        property: own === null ? null : Number(main.loan) + own,
        tenureRows
    };

}
