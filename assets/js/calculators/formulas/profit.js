/* =========================================================
   ToolZen Hub
   Profit and break-even for a period: pure calculation and
   input validation

   No DOM and no formatting: plain functions, so they can be
   tested on their own. The page (calculators/profit/index.js)
   only reads fields, calls these functions and shows what they
   return.

   THESE ARE CALCULATED FIGURES FOR THE NUMBERS ENTERED. Tax and
   GST, depreciation, interest, the owner's pay (unless entered as
   a fixed cost), returns, discounts and stock are not part of it.
   It is not a forecast and not an accounting statement.

   DEFINITIONS (price P, variable cost V, fixed costs F, units Q)

       contribution c = P - V               per unit
       revenue        = P * Q
       variable costs = V * Q
       profit         = P*Q - V*Q - F = c*Q - F

   BREAK-EVEN. The smallest WHOLE number of units n with
   c*n >= F, that is ceil(F / c) when c > 0 (0 when F = 0). When
   c <= 0 there is no break-even: every unit brings in nothing
   towards the fixed costs, so more sales never cover them.

   MARGIN OF SAFETY. Q - break-even units: above (a positive
   number of units), at (0) or short (below). Its share is that
   over the units sold, when units were sold.

   TARGET T (a goal, not an expectation). The smallest whole n
   with c*n - F >= T, that is ceil((F + T) / c) when c > 0, and
   none when c <= 0. Additional units = max(n - Q, 0).

   WHAT-IF. Each of the four inputs moved by -10% and +10%, the
   others held, the whole model recomputed from the changed input.
   A changed number of units is rounded to the nearest whole unit
   (half up), because units are whole.

   EXACTNESS. Money is worked out with whole numbers (BigInt) on
   the decimal value the visitor typed, so a break-even that is
   exactly 250 units is never 251 because of floating point.
   Results are handed back as ordinary numbers.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const PROFIT_LIMITS = Object.freeze({
    price:         { min: 0.01, max: 100000000 },
    variableCost:  { min: 0, max: 100000000 },
    fixedCosts:    { min: 0, max: 1000000000 },
    units:         { min: 0, max: 100000000 },
    target:        { min: 0.01, max: 1000000000 }
});

/* the four inputs moved in the what-if rows, in the order shown, and the changes in percent */
export const WHAT_IF_LEVERS = Object.freeze(["price", "variable", "units", "fixed"]);
export const WHAT_IF_CHANGES = Object.freeze([-10, 10]);


/* =========================================================
   EXACT ARITHMETIC (private)
   A money value is held as value * 10^10, a whole number.
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

function ceilDiv(
    numerator,
    denominator
) {

    // both positive here (a zero numerator gives 0)
    return (numerator + denominator - 1n) / denominator;

}

/* a ratio of two whole numbers as a number */
function ratio(
    numerator,
    denominator
) {

    return Number(numerator) / Number(denominator);

}

const toMoney = (value, divisor = S) => Number(value) / Number(divisor);


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers):
           price, variableCost, fixedCosts, units,
           target (blank means none)
   Output: { ok: true, values } or { ok: false, errors } where
           each error is { fields: [names], message }
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

const toNumber = (raw) =>
    isBlank(raw) ? NaN : Number(raw);

const inRange = (value, { min, max }) =>
    Number.isFinite(value) && value >= min && value <= max;

export function validateProfitInputs(
    raw
) {

    const errors = [];

    const price = toNumber(raw.price);
    const variableCost = toNumber(raw.variableCost);
    const fixedCosts = toNumber(raw.fixedCosts);
    const units = toNumber(raw.units);

    if (!inRange(price, PROFIT_LIMITS.price)) {

        errors.push({
            fields: ["price"],
            message:
                "Enter a selling price between ₹0.01 and ₹10 crore."
        });

    }

    if (!inRange(variableCost, PROFIT_LIMITS.variableCost)) {

        errors.push({
            fields: ["variableCost"],
            message:
                "Enter a variable cost per unit between ₹0 and ₹10 crore."
        });

    }

    if (!inRange(fixedCosts, PROFIT_LIMITS.fixedCosts)) {

        errors.push({
            fields: ["fixedCosts"],
            message:
                "Enter fixed costs between ₹0 and ₹100 crore."
        });

    }

    if (
        !inRange(units, PROFIT_LIMITS.units) ||
        !Number.isInteger(units)
    ) {

        errors.push({
            fields: ["units"],
            message:
                "Enter the units sold as a whole number from 0 to 10 crore."
        });

    }

    let target = null;

    if (!isBlank(raw.target)) {

        const number =
            toNumber(raw.target);

        if (!inRange(number, PROFIT_LIMITS.target)) {

            errors.push({
                fields: ["target"],
                message:
                    "Enter a target profit between ₹0.01 and ₹100 crore, or leave it blank."
            });

        } else {

            target = number;

        }

    }

    return errors.length > 0
        ? { ok: false, errors }
        : { ok: true, values: { price, variableCost, fixedCosts, units, target } };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateProfitInputs).
   Returns plain numbers; nothing is formatted.
========================================================= */

/*
 * The model at a scale of 100 * S, so a change of a whole
 * percent is exact. `p`, `v`, `f` are money scaled by 100 * S,
 * `q` a whole number of units.
 */
function model(
    p,
    v,
    f,
    q
) {

    const contribution =
        p - v;

    const profit =
        contribution * q - f;

    const breakEven =
        contribution > 0n
            ? ceilDiv(f, contribution)
            : null;

    return {
        contribution,
        profit,
        breakEven
    };

}

function whatIfRows(
    priceS,
    variableS,
    fixedS,
    units
) {

    const hundred = 100n;

    const base =
        model(priceS * hundred, variableS * hundred, fixedS * hundred, units);

    const DIVISOR =
        100n * S;

    const rows = [{
        key: "base",
        change: 0,
        value: null,
        profit: toMoney(base.profit, DIVISOR),
        delta: 0,
        breakEven: base.breakEven === null ? null : Number(base.breakEven)
    }];

    const labels = {
        price: "price",
        variable: "variable",
        units: "units",
        fixed: "fixed"
    };

    for (const lever of WHAT_IF_LEVERS) {

        for (const change of WHAT_IF_CHANGES) {

            const factor =
                BigInt(100 + change);

            let p = priceS * hundred;
            let v = variableS * hundred;
            let f = fixedS * hundred;
            let q = units;
            let value;

            if (lever === "price") {

                p = priceS * factor;
                value = toMoney(p, DIVISOR);

            } else if (lever === "variable") {

                v = variableS * factor;
                value = toMoney(v, DIVISOR);

            } else if (lever === "fixed") {

                f = fixedS * factor;
                value = toMoney(f, DIVISOR);

            } else {

                // whole units: the nearest whole number, half up
                q = (2n * units * factor + 100n) / 200n;
                value = Number(q);

            }

            const row =
                model(p, v, f, q);

            rows.push({
                key: labels[lever],
                change,
                value,
                profit: toMoney(row.profit, DIVISOR),
                delta: toMoney(row.profit - base.profit, DIVISOR),
                breakEven: row.breakEven === null ? null : Number(row.breakEven)
            });

        }

    }

    return rows;

}

export function calculateProfit({
    price,
    variableCost,
    fixedCosts,
    units,
    target = null
}) {

    const priceS = scaled(price);
    const variableS = scaled(variableCost);
    const fixedS = scaled(fixedCosts);
    const q = BigInt(units);

    const contributionS = priceS - variableS;
    const revenueS = priceS * q;
    const variableCostsS = variableS * q;
    const profitS = contributionS * q - fixedS;

    const breakEven =
        contributionS > 0n
            ? ceilDiv(fixedS, contributionS)
            : null;

    let position = null;

    if (breakEven !== null) {

        const difference =
            q - breakEven;

        position = {
            state:
                difference > 0n ? "above" : difference === 0n ? "at" : "short",
            units: Number(difference < 0n ? -difference : difference),
            shareOfUnitsSold: q > 0n ? ratio(difference, q) : null
        };

    }

    let targetResult = null;

    if (target !== null) {

        const targetS = scaled(target);

        const targetUnits =
            contributionS > 0n
                ? ceilDiv(fixedS + targetS, contributionS)
                : null;

        targetResult = {
            amount: target,
            units: targetUnits === null ? null : Number(targetUnits),
            revenue: targetUnits === null ? null : toMoney(priceS * targetUnits),
            additional:
                targetUnits === null
                    ? null
                    : Number(targetUnits > q ? targetUnits - q : 0n),
            reached: profitS >= targetS
        };

    }

    return {
        input: { price, variableCost, fixedCosts, units, target },
        contribution: toMoney(contributionS),
        revenue: toMoney(revenueS),
        variableCosts: toMoney(variableCostsS),
        fixedCosts,
        profit: toMoney(profitS),
        state: profitS > 0n ? "profit" : profitS === 0n ? "zero" : "loss",
        profitShare: revenueS > 0n ? ratio(profitS, revenueS) : null,
        breakEvenUnits: breakEven === null ? null : Number(breakEven),
        breakEvenRevenue: breakEven === null ? null : toMoney(priceS * breakEven),
        position,
        target: targetResult,
        whatIf: whatIfRows(priceS, variableS, fixedS, q)
    };

}
