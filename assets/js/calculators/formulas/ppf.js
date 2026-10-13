/* =========================================================
   ToolZen Hub
   Public Provident Fund (PPF): pure calculation and input validation

   No DOM and no formatting: plain functions, so they can be tested
   on their own. The page (calculators/ppf/index.js, a later phase)
   only reads fields, calls these functions and shows what they
   return. The approved specification is docs/tool-packs/26-ppf-calculator.md.

   THIS CALCULATES THE NUMBERS THE VISITOR ENTERS. It does not know a
   current PPF rate, a bank or a post office, and it never says what a
   real account will hold. The rate is the visitor's.

   MODEL (rupees; annual rate a percent, r = a / 100)

     Deposits are made on or before the 5th of their month, so the
     lowest balance between the close of the 5th and the month end is
     the balance after that month's deposits (nothing is withdrawn).
     Interest for a month is  balance * r / 12   (V1 ASSUMPTION: the
     annual rate divided by 12; it is our reading of "interest at the
     rate per annum is eligible for a calendar month", not an official
     formula and not a rounding convention).

     Interest is NOT added during the financial year. It is summed and
     added to the balance once, at the end of the year, so it earns
     interest from the next year.

     Yearly pattern: the whole yearly deposit D is made in April.
     Monthly pattern: a deposit m is made in every month (D = 12 m).

     The account is assumed opened in April, so year 1 is a full
     financial year of deposits. Years are consecutive financial years.

   NOT MODELLED, on purpose: withdrawals, loans, premature closure,
   missed or revived years, a changing rate, an opening month other
   than April, rounding of credited interest, tax.

   PRECISION. Plain IEEE doubles, unrounded all the way through; the
   independent reference (tests/fixtures/ppf-golden.py) uses exact
   fractions and the tests hold this module to a stated tolerance.
   Only the display helpers round, to whole rupees, halves up.

   PROJECTIONS. Every year is a mathematical projection. yearKind()
   says what a year is in the Scheme's terms: before maturity, the end
   of the first term (year 16 for an April account: 15 years after the
   end of the opening financial year), inside an extension block, or
   the end of a five-year extension block (years 21, 26, 31, ...). Only
   the first-term end and the block ends are points at which the Scheme
   allows the account to be closed in full, and the years after the
   first term assume the holder extends the account WITH deposits,
   which is the holder's option and not an entitlement this tool knows.
========================================================= */


/* =========================================================
   LIMITS (Scheme paras 4 and 5; specification section 5)
========================================================= */

export const PPF_LIMITS = Object.freeze({
    yearlyDeposit: { min: 500, max: 150000, step: 50 },
    monthlyDeposit: { min: 50, max: 12500, step: 50 },
    rate: { min: 0, max: 15, step: 0.1 },
    years: { min: 1, max: 50, default: 16 }
});

export const PPF_PATTERNS = Object.freeze({
    yearly: "yearly",
    monthly: "monthly"
});

/* an account opened in April matures 15 years after the end of its opening year: the end of year 16 */
export const FIRST_TERM_YEARS = 16;

export const EXTENSION_BLOCK_YEARS = 5;

/* the yearly total that splits into twelve whole-50-rupee monthly deposits */
export const COMPARISON_YEARLY_MULTIPLE = 600;

export const MONTHS_PER_YEAR = 12;


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers): pattern,
           yearlyDeposit, monthlyDeposit (only the one the pattern
           uses is read), rate, years
   Output: { ok: true, values } or { ok: false, errors } where each
           error is { fields: [names], message }; values are
           { pattern, deposit, annualDeposit, monthlyDeposit|null,
             rate, years } as numbers.
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

/* a plain decimal number only: no commas, no exponent, no stray text */
const toNum = (raw) => {

    if (isBlank(raw)) {
        return NaN;
    }

    const text = String(raw).trim();

    return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;

};

const isMultiple = (value, step) =>
    Number.isInteger(value) && value % step === 0;

const inRange = (value, { min, max }) =>
    Number.isFinite(value) && value >= min && value <= max;

const MESSAGES = Object.freeze({
    pattern: "Choose a deposit pattern: yearly in April, or monthly.",
    yearlyBlank: "Enter the yearly deposit.",
    yearly: "The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50.",
    monthlyBlank: "Enter the monthly deposit.",
    monthly: "The monthly deposit must be between ₹50 and ₹12,500, in multiples of ₹50, so that twelve deposits stay within ₹1,50,000 a year.",
    rateBlank: "Enter an interest rate.",
    rate: "The interest rate must be from 0% to 15%, in steps of 0.1.",
    yearsBlank: "Enter the number of years.",
    years: "The number of years must be a whole number from 1 to 50."
});

export function validatePpfInputs(
    raw
) {

    const errors = [];

    const pattern = raw && raw.pattern;

    if (pattern !== PPF_PATTERNS.yearly && pattern !== PPF_PATTERNS.monthly) {
        errors.push({ fields: ["pattern"], message: MESSAGES.pattern });
    }

    let deposit = NaN;

    if (pattern === PPF_PATTERNS.yearly) {

        deposit = toNum(raw.yearlyDeposit);

        if (isBlank(raw.yearlyDeposit)) {
            errors.push({ fields: ["yearlyDeposit"], message: MESSAGES.yearlyBlank });
        } else if (!inRange(deposit, PPF_LIMITS.yearlyDeposit) || !isMultiple(deposit, PPF_LIMITS.yearlyDeposit.step)) {
            errors.push({ fields: ["yearlyDeposit"], message: MESSAGES.yearly });
        }

    } else if (pattern === PPF_PATTERNS.monthly) {

        deposit = toNum(raw.monthlyDeposit);

        if (isBlank(raw.monthlyDeposit)) {
            errors.push({ fields: ["monthlyDeposit"], message: MESSAGES.monthlyBlank });
        } else if (!inRange(deposit, PPF_LIMITS.monthlyDeposit) || !isMultiple(deposit, PPF_LIMITS.monthlyDeposit.step)) {
            errors.push({ fields: ["monthlyDeposit"], message: MESSAGES.monthly });
        }

    }

    const rate = toNum(raw && raw.rate);

    if (isBlank(raw && raw.rate)) {
        errors.push({ fields: ["rate"], message: MESSAGES.rateBlank });
    } else if (
        !inRange(rate, PPF_LIMITS.rate) ||
        Math.abs(rate * 10 - Math.round(rate * 10)) > 1e-9
    ) {
        errors.push({ fields: ["rate"], message: MESSAGES.rate });
    }

    const years = toNum(raw && raw.years);

    if (isBlank(raw && raw.years)) {
        errors.push({ fields: ["years"], message: MESSAGES.yearsBlank });
    } else if (!inRange(years, PPF_LIMITS.years) || !Number.isInteger(years)) {
        errors.push({ fields: ["years"], message: MESSAGES.years });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const monthly = pattern === PPF_PATTERNS.monthly;

    return {
        ok: true,
        values: {
            pattern,
            deposit,
            annualDeposit: monthly ? deposit * MONTHS_PER_YEAR : deposit,
            monthlyDeposit: monthly ? deposit : null,
            rate,
            years
        }
    };

}


/* =========================================================
   WHAT A YEAR IS, in the Scheme's terms (every year is a projection)
   "before-maturity"          years 1 to 15
   "first-term-end"           year 16 (an account opened in April)
   "inside-extension-block"   years 17 to 20, 22 to 25, ...
   "extension-block-end"      years 21, 26, 31, ...
========================================================= */

export function yearKind(
    year
) {

    if (!Number.isInteger(year) || year < 1) {
        throw new RangeError("year must be a whole number of at least 1");
    }

    if (year < FIRST_TERM_YEARS) {
        return "before-maturity";
    }

    if (year === FIRST_TERM_YEARS) {
        return "first-term-end";
    }

    return (year - FIRST_TERM_YEARS) % EXTENSION_BLOCK_YEARS === 0
        ? "extension-block-end"
        : "inside-extension-block";

}

/* only the first-term end and the block ends are points where the Scheme allows full closure */
export const isClosurePoint = (year) => {

    const kind = yearKind(year);

    return kind === "first-term-end" || kind === "extension-block-end";

};

/* years after the first term assume the account is extended with deposits (the holder's option) */
export const assumesExtension = (year) => yearKind(year) === "extension-block-end" || yearKind(year) === "inside-extension-block";


/* =========================================================
   CALCULATION
   Input:  values from validatePpfInputs (or the same shape)
   Output: {
     pattern, rate, years, annualDeposit, monthlyDeposit,
     totalDeposited, balance, interest, interestShare,
     rows: [ { year, kind, isClosurePoint, assumesExtension,
               openingBalance, deposits, interest, closingBalance } ]
   }
   All figures are unrounded numbers.
========================================================= */

function assertValues(values) {

    if (!values || typeof values !== "object") {
        throw new TypeError("calculatePpf expects the values returned by validatePpfInputs");
    }

    const { pattern, annualDeposit, rate, years } = values;

    const ok =
        (pattern === PPF_PATTERNS.yearly || pattern === PPF_PATTERNS.monthly) &&
        Number.isFinite(annualDeposit) && annualDeposit > 0 &&
        Number.isFinite(rate) && rate >= 0 &&
        Number.isInteger(years) && years >= 1;

    if (!ok) {
        throw new TypeError("calculatePpf expects validated values");
    }

}

export function calculatePpf(
    values
) {

    assertValues(values);

    const { pattern, annualDeposit, rate, years } = values;

    const monthly = pattern === PPF_PATTERNS.monthly;

    const monthlyAmount = monthly ? annualDeposit / MONTHS_PER_YEAR : 0;

    const r = rate / 100;

    const rows = [];

    let balance = 0;

    for (let year = 1; year <= years; year += 1) {

        const opening = balance;

        let running = opening;

        let interest = 0;

        for (let month = 0; month < MONTHS_PER_YEAR; month += 1) {

            if (monthly) {
                running += monthlyAmount;
            } else if (month === 0) {
                running += annualDeposit;
            }

            /* the lowest balance after the 5th is the balance after this month's deposits */
            interest += running * r / MONTHS_PER_YEAR;

        }

        balance = running + interest;

        rows.push({
            year,
            kind: yearKind(year),
            isClosurePoint: isClosurePoint(year),
            assumesExtension: assumesExtension(year),
            openingBalance: opening,
            deposits: annualDeposit,
            interest,
            closingBalance: balance
        });

    }

    const totalDeposited = annualDeposit * years;

    return {
        pattern,
        rate,
        years,
        annualDeposit,
        monthlyDeposit: monthly ? monthlyAmount : null,
        totalDeposited,
        balance,
        interest: balance - totalDeposited,
        interestShare: balance > 0 ? (balance - totalDeposited) / balance : 0,
        rows
    };

}


/* =========================================================
   ANNUAL VERSUS MONTHLY, for the SAME yearly total
   Eligible only when the yearly total is a multiple of 600 (so it
   splits into twelve whole-50-rupee monthly deposits) and within the
   yearly limits. The difference is yearly minus monthly, never a
   ranking; the two are different deposit schedules. The figure shown
   on the page is displayDifference: the difference of the two displayed
   whole-rupee balances (not a separately rounded exact difference).
========================================================= */

export function comparePpfPatterns(
    values
) {

    assertValues(values);

    const { annualDeposit, rate, years } = values;

    if (
        !Number.isInteger(annualDeposit) ||
        annualDeposit % COMPARISON_YEARLY_MULTIPLE !== 0 ||
        annualDeposit < COMPARISON_YEARLY_MULTIPLE ||
        annualDeposit > PPF_LIMITS.yearlyDeposit.max
    ) {
        return {
            eligible: false,
            reason: "The yearly total cannot be split into twelve whole-₹50 monthly deposits (it must be a multiple of ₹600)."
        };
    }

    const yearly = calculatePpf({ pattern: PPF_PATTERNS.yearly, annualDeposit, rate, years });

    const monthly = calculatePpf({ pattern: PPF_PATTERNS.monthly, annualDeposit, rate, years });

    return {
        eligible: true,
        annualDeposit,
        monthlyDeposit: annualDeposit / MONTHS_PER_YEAR,
        yearly,
        monthly,
        /* the exact difference, kept for calculation */
        difference: yearly.balance - monthly.balance,
        /* what the page shows: the gap between the two DISPLAYED whole-rupee balances, so the three figures on screen always agree */
        displayDifference: roundRupee(yearly.balance) - roundRupee(monthly.balance)
    };

}


/* =========================================================
   DISPLAY (whole rupees, halves up; the only rounding anywhere)
   The displayed interest is the displayed balance minus the deposits,
   so balance, deposits and interest always add up on screen. In the
   table each closing balance is rounded from its exact value and each
   row's interest is closing - opening - deposits of the DISPLAYED
   figures, so every row adds up.
========================================================= */

export const roundRupee = (value) => Math.floor(value + 0.5);

export function toDisplay(
    result
) {

    const balance = roundRupee(result.balance);

    let previous = 0;

    const rows = result.rows.map((row) => {

        const closing = roundRupee(row.closingBalance);

        const shown = {
            year: row.year,
            kind: row.kind,
            isClosurePoint: row.isClosurePoint,
            assumesExtension: row.assumesExtension,
            openingBalance: previous,
            deposits: row.deposits,
            interest: closing - previous - row.deposits,
            closingBalance: closing
        };

        previous = closing;

        return shown;

    });

    return {
        balance,
        totalDeposited: result.totalDeposited,
        interest: balance - result.totalDeposited,
        interestSharePercent: balance > 0 ? ((balance - result.totalDeposited) / balance) * 100 : 0,
        rows
    };

}
