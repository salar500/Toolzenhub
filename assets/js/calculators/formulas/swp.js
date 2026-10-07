/* =========================================================
   ToolZen Hub
   SWP calculator: pure calculation and input validation

   No DOM and no formatting: plain functions of numbers, so they
   can be tested on their own. The page (calculators/swp/index.js)
   only reads fields, calls these functions and shows what they
   return. The specification is docs/tool-packs/21-swp-calculator.md.

   THIS IS A PROJECTION, NOT A FORECAST. The return is an
   assumption the user enters and it is applied as the same rate
   every year. Real returns vary, and poor years early in a plan
   can use a corpus up sooner than a constant return shows (not
   modelled). Taxes, fund charges, exit loads and inflation are not
   modelled either. Nothing here is a promise.

   MODEL (rupees; corpus C, first-year withdrawal W, m withdrawals
   a year, annual return r and yearly increase s as fractions)
       i = (1 + r)^(1/m) - 1       return for one period, so the
                                   corpus grows by exactly r over a
                                   year whatever m is (i = 0 at r = 0)
   Each withdrawal is taken at the START of its period, then what is
   left grows for that period:
       after = balance - W_p;     balance = after * (1 + i)
   The withdrawal is raised once a year, not every period: every
   withdrawal in year k is W * (1 + s)^(k - 1).

   MODE A (how long will it last): simulate period by period for at
   most 50 years. A withdrawal the balance cannot cover in full is
   the last, PARTIAL one: it takes what is left and is never counted
   as time. The four outcomes are told apart:
       used-up              the corpus ran out inside the horizon
       not-used-up          a balance is left after 50 years
       used-up-at-horizon   exactly nothing left after 50 years
       first-exceeds        not even the first withdrawal is covered
   MODES B and C: the corpus that N withdrawals use up exactly is
       C = W * F,   F = sum over p of  a_p * v^(p-1),  v = 1/(1 + i)
   (a_p is the yearly increase factor), summed backwards for
   stability. Mode C is W * F and mode B is C / F. Running the
   recursion backwards adds a positive withdrawal at every step, so
   the balance never reaches zero before the end.

   TOLERANCE. A withdrawal counts as covered if the balance is at
   least W_p - EXHAUSTION_TOLERANCE (half a paisa), and a balance
   below the tolerance after a withdrawal is cleared to 0. It exists
   only so exact arithmetic is not defeated by floating-point
   residue. It is never used to round anything.

   Nothing is rounded here; callers round for display. Doubles are
   enough: at most 600 periods, relative error well under 1e-12.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const SWP_LIMITS = Object.freeze({
    corpus:     { min: 10000, max: 1000000000 },
    withdrawal: { min: 100, max: 100000000 },
    years:      { min: 1, max: 50 },
    rate:       { min: 0, max: 30 },
    increase:   { min: 0, max: 20 },
    horizonYears: 50
});

export const EXHAUSTION_TOLERANCE = 0.005;

/* the scenarios are the assumed return minus and plus this many percentage points */
export const SCENARIO_SPREAD = 2;

export const MODES = Object.freeze(["lasts", "withdraw", "corpus"]);

export const FREQUENCIES = Object.freeze({
    monthly: 12,
    quarterly: 4,
    yearly: 1
});


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers), by logical name:
           mode, corpus, withdrawal, frequency, years,
           annualReturn, increase (blank means 0)
   Only the fields the chosen mode uses are read: a value left in
   a field the mode hides is ignored, never checked.
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

const toNumber = (raw) =>
    isBlank(raw)
        ? NaN
        : Number(raw);

const inRange = (value, { min, max }) =>
    Number.isFinite(value) &&
    value >= min &&
    value <= max;

export function validateSwpInputs(
    raw
) {

    if (!MODES.includes(raw.mode)) {
        return {
            ok: false,
            errors: [{
                fields: ["mode"],
                message: "Choose what you want to find out."
            }]
        };
    }

    const mode = raw.mode;
    const errors = [];

    const usesCorpus = mode !== "corpus";
    const usesWithdrawal = mode !== "withdraw";
    const usesYears = mode !== "lasts";

    const corpus = usesCorpus ? toNumber(raw.corpus) : null;
    const withdrawal = usesWithdrawal ? toNumber(raw.withdrawal) : null;
    const years = usesYears ? toNumber(raw.years) : null;
    const annualReturn = toNumber(raw.annualReturn);

    if (usesCorpus && !inRange(corpus, SWP_LIMITS.corpus)) {
        errors.push({
            fields: ["corpus"],
            message: "Enter a starting corpus between ₹10,000 and ₹100 crore."
        });
    }

    if (usesWithdrawal && !inRange(withdrawal, SWP_LIMITS.withdrawal)) {
        errors.push({
            fields: ["withdrawal"],
            message: "Enter a withdrawal between ₹100 and ₹10 crore."
        });
    }

    if (!Object.hasOwn(FREQUENCIES, raw.frequency)) {
        errors.push({
            fields: ["frequency"],
            message: "Choose how often the money is withdrawn."
        });
    }

    if (usesYears && !(Number.isInteger(years) && inRange(years, SWP_LIMITS.years))) {
        errors.push({
            fields: ["years"],
            message: "Enter the duration as a whole number of years from 1 to 50."
        });
    }

    if (!inRange(annualReturn, SWP_LIMITS.rate)) {
        errors.push({
            fields: ["annualReturn"],
            message: "Enter an assumed annual return between 0% and 30%."
        });
    }

    /* the increase is optional: blank means 0 */
    const increase = isBlank(raw.increase) ? 0 : toNumber(raw.increase);

    if (!inRange(increase, SWP_LIMITS.increase)) {
        errors.push({
            fields: ["increase"],
            message: "Enter a yearly increase between 0% and 20%, or leave it blank for none."
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
            mode,
            corpus,
            withdrawal,
            years,
            annualReturn,
            increase,
            periodsPerYear: FREQUENCIES[raw.frequency]
        }
    };

}


/* =========================================================
   RETURN PER PERIOD
   The entered annual return is an effective annual rate. A
   yearly plan uses it as it is (no power, no rounding noise).
========================================================= */

export function periodReturn(
    annualReturn,
    periodsPerYear
) {

    const r = annualReturn / 100;

    if (r === 0 || periodsPerYear === 1) {
        return r;
    }

    return Math.pow(1 + r, 1 / periodsPerYear) - 1;

}


/* the factor on the first-year withdrawal for each year: 1, (1+s), (1+s)^2, ... built by multiplying once a year */

function yearFactors(
    years,
    increase
) {

    const factors = [1];

    for (let year = 2; year <= years; year++) {
        factors.push(factors[year - 2] * (1 + increase / 100));
    }

    return factors;

}


/* =========================================================
   THE SIMULATION
   Runs at most `periods` withdrawals. Returns the number of full
   withdrawals, the partial last one, what was withdrawn, the
   estimated growth, the balance at the end and one row per year
   (the last row is flagged `final` when the corpus is used up).
========================================================= */

function simulate({
    corpus,
    withdrawal,
    i,
    periodsPerYear: m,
    increase,
    periods
}) {

    const factors = yearFactors(Math.ceil(periods / m), increase);

    let balance = corpus;
    let full = 0;
    let withdrawn = 0;
    let growth = 0;
    let partial = 0;
    let usedUp = false;

    const rows = [];
    let yearWithdrawn = 0;
    let yearGrowth = 0;

    for (let p = 1; p <= periods; p++) {

        const year = Math.floor((p - 1) / m) + 1;
        const due = withdrawal * factors[year - 1];

        if (balance < due - EXHAUSTION_TOLERANCE) {

            /* the balance cannot cover this withdrawal in full: it pays what is left, and that is the end */
            partial = balance > EXHAUSTION_TOLERANCE ? balance : 0;
            withdrawn += partial;
            yearWithdrawn += partial;
            balance = 0;
            usedUp = true;

            /* no empty row for a year that never started */
            if (partial > 0 || (p - 1) % m !== 0) {
                rows.push({
                    year,
                    withdrawals: yearWithdrawn,
                    growth: yearGrowth,
                    closing: 0
                });
            }

            break;

        }

        let after = balance - due;

        if (after < EXHAUSTION_TOLERANCE) {
            after = 0;
        }

        const gain = after * i;

        balance = after + gain;
        withdrawn += due;
        growth += gain;
        yearWithdrawn += due;
        yearGrowth += gain;
        full += 1;

        if (p % m === 0) {
            rows.push({
                year: p / m,
                withdrawals: yearWithdrawn,
                growth: yearGrowth,
                closing: balance
            });
            yearWithdrawn = 0;
            yearGrowth = 0;
        }

    }

    if (rows.length && balance <= EXHAUSTION_TOLERANCE) {
        rows.at(-1).final = true;
    }

    return {
        full,
        partial,
        withdrawn,
        growth,
        ending: balance,
        usedUp,
        rows
    };

}


/* =========================================================
   THE FACTOR (modes B and C)
   The corpus that `periods` withdrawals use up, per rupee of
   first-year withdrawal. Summed backwards: f = a_p + v * f.
========================================================= */

function drawdownFactor({
    i,
    periodsPerYear: m,
    increase,
    periods
}) {

    const v = 1 / (1 + i);
    const factors = yearFactors(Math.ceil(periods / m), increase);

    let f = 0;

    for (let p = periods; p >= 1; p--) {
        f = factors[Math.floor((p - 1) / m)] + v * f;
    }

    return f;

}


/* =========================================================
   SCENARIOS
========================================================= */

export function scenarioRates(
    annualReturn
) {

    const { min, max } = SWP_LIMITS.rate;
    const lower = Math.max(min, annualReturn - SCENARIO_SPREAD);
    const higher = Math.min(max, annualReturn + SCENARIO_SPREAD);

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
   THE ANSWER FOR ONE RETURN
   Used for the assumed return and for each scenario.
========================================================= */

function stateOf(run, periods) {

    if (run.full === 0) {
        return "first-exceeds";
    }

    if (run.full === periods) {
        return run.ending > EXHAUSTION_TOLERANCE
            ? "not-used-up"
            : "used-up-at-horizon";
    }

    return "used-up";

}

function answerFor(
    mode,
    { corpus, withdrawal, years, increase, periodsPerYear: m },
    annualReturn
) {

    const i = periodReturn(annualReturn, m);

    if (mode === "lasts") {

        const periods = SWP_LIMITS.horizonYears * m;
        const run = simulate({ corpus, withdrawal, i, periodsPerYear: m, increase, periods });

        return {
            run,
            answer: {
                state: stateOf(run, periods),
                fullWithdrawals: run.full,
                months: run.full * 12 / m,
                partialWithdrawal: run.partial
            }
        };

    }

    const periods = years * m;
    const f = drawdownFactor({ i, periodsPerYear: m, increase, periods });

    return mode === "withdraw"
        ? { i, periods, answer: { firstWithdrawal: corpus / f } }
        : { i, periods, answer: { corpus: withdrawal * f } };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateSwpInputs). A field the
   mode does not use is never read.
========================================================= */

export function calculateSwp({
    mode,
    corpus = null,
    withdrawal = null,
    years = null,
    annualReturn,
    increase = 0,
    periodsPerYear
}) {

    const input = { corpus, withdrawal, years, increase, periodsPerYear };
    const used = {
        corpus: mode === "corpus" ? null : corpus,
        withdrawal: mode === "withdraw" ? null : withdrawal,
        years: mode === "lasts" ? null : years,
        increase,
        periodsPerYear
    };

    const main = answerFor(mode, used, annualReturn);

    const scenarios = scenarioRates(annualReturn).map(
        ({ key, rate }) => ({
            key,
            rate,
            answer:
                rate === annualReturn
                    ? main.answer
                    : answerFor(mode, used, rate).answer
        })
    );

    let run = main.run;
    let answer = main.answer;

    if (mode !== "lasts") {

        /* the table comes from a forward simulation with the solved amount, so it can be checked against the answer */

        const start = mode === "withdraw" ? used.corpus : answer.corpus;
        const first = mode === "withdraw" ? answer.firstWithdrawal : used.withdrawal;

        run = simulate({
            corpus: start,
            withdrawal: first,
            i: main.i,
            periodsPerYear: periodsPerYear,
            increase,
            periods: main.periods
        });

        answer = {
            ...answer,
            finalYearWithdrawal: first * yearFactors(used.years, increase).at(-1)
        };

    }

    const startingCorpus =
        mode === "corpus"
            ? answer.corpus
            : used.corpus;

    return {
        mode,
        input: { ...input, annualReturn },
        startingCorpus,
        answer,
        totals: {
            withdrawn: run.withdrawn,
            growth: run.growth,
            ending: run.ending
        },
        scenarios,
        yearly: run.rows
    };

}
