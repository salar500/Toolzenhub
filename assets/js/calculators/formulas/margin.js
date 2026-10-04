/* =========================================================
   ToolZen Hub
   Margin and pricing: pure calculation and input validation

   No DOM and no formatting: plain functions, so they can be
   tested on their own. The page (calculators/margin/index.js)
   only reads fields, calls these functions and shows what they
   return.

   THIS IS PER-UNIT ARITHMETIC ON THE NUMBERS ENTERED. It is not
   a forecast and not advice. Overheads, fixed costs, tax, returns
   and other business costs are not part of it.

   DEFINITIONS (cost C, price P, in rupees)

       profit  = P - C
       margin  = (P - C) / P        profit as a share of the PRICE
       markup  = (P - C) / C        profit as a share of the COST
       (so margin = markup / (1 + markup))

   BASES (one at a time)

       price   P is entered
       margin  P = C / (1 - m)      m = target margin
       markup  P = C * (1 + k)      k = target markup

   A DERIVED PRICE IS ROUNDED UP to the next paisa, and profit,
   margin and markup are then worked out from that rounded price,
   so the price shown never misses the target because of ordinary
   rounding.

   COST CHANGES. The cost moves by -10, -5, 0, +5 and +10 percent.
   The margin at the price in use is (P - C') / P. The price that
   keeps the margin is P * C' / C (rounded up to the paisa); when
   the margin is zero or negative there is no margin to keep, so
   the row gives the price that covers the new cost (C', rounded
   up).

   DISCOUNT d. The discounted price is P * (1 - d), rounded to the
   nearest paisa. If the profit per unit stays above zero, the
   volume multiple is the profit before / the profit after: how
   many times today's sales would earn the same TOTAL profit with
   the same unit cost and nothing else changed. It is a
   break-even on volume, not a forecast of sales.

   EXACTNESS. Money is worked out with whole numbers (BigInt) on
   the decimal value the visitor typed, so a price that should be
   exactly 1,000.00 is never 1,000.01 because of floating point.
   Results are handed back as ordinary numbers.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const MARGIN_LIMITS = Object.freeze({
    cost:     { min: 0.01, max: 100000000 },
    price:    { min: 0.01, max: 10000000000 },
    margin:   { min: 0, max: 95 },
    markup:   { min: 0, max: 1000 },
    discount: { min: 0, max: 95 }
});

export const BASES = Object.freeze(["price", "margin", "markup"]);

/* the cost changes shown, in percent */
export const COST_CHANGES = Object.freeze([-10, -5, 0, 5, 10]);


/* =========================================================
   EXACT ARITHMETIC (private)
   S is the scale: a value is held as value * 10^10, a
   whole number.
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

    const negative =
        text.startsWith("-");

    const [whole, fraction = ""] =
        text.replace("-", "").split(".");

    const digits =
        BigInt(whole + fraction.padEnd(DECIMALS, "0"));

    return negative ? -digits : digits;

}

function ceilDiv(
    numerator,
    denominator
) {

    // numerator and denominator are positive here
    return (numerator + denominator - 1n) / denominator;

}

function roundHalfUp(
    numerator,
    denominator
) {

    return (2n * numerator + denominator) / (2n * denominator);

}

/* a ratio of two scaled whole numbers as a number */
function ratio(
    numerator,
    denominator
) {

    return Number(numerator) / Number(denominator);

}

const paiseToScaled = (paise) => paise * S / 100n;

const scaledToNumber = (value) => Number(value) / Number(S);


/* =========================================================
   VALIDATION
   Input:  raw values (strings or numbers):
           cost, basis ("price" | "margin" | "markup"),
           value (the figure of the chosen basis),
           discount (blank means none)
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

const VALUE_RULES = {
    price: {
        limits: MARGIN_LIMITS.price,
        message: "Enter a selling price between ₹0.01 and ₹1,000 crore."
    },
    margin: {
        limits: MARGIN_LIMITS.margin,
        message: "Enter a target margin from 0% to 95%. A margin of 100% or more would need an infinite price."
    },
    markup: {
        limits: MARGIN_LIMITS.markup,
        message: "Enter a target markup from 0% to 1,000%."
    }
};

export function validateMarginInputs(
    raw
) {

    const errors = [];

    const cost = toNumber(raw.cost);
    const value = toNumber(raw.value);
    const basis = raw.basis;

    if (!BASES.includes(basis)) {

        errors.push({
            fields: ["basis"],
            message:
                "Choose what you want to work from: a selling price, a target margin or a target markup."
        });

    }

    if (!inRange(cost, MARGIN_LIMITS.cost)) {

        errors.push({
            fields: ["cost"],
            message:
                "Enter a cost per unit between ₹0.01 and ₹10 crore."
        });

    }

    if (BASES.includes(basis)) {

        const rule =
            VALUE_RULES[basis];

        if (!inRange(value, rule.limits)) {

            errors.push({
                fields: ["value"],
                message: rule.message
            });

        }

    }

    let discount = null;

    if (!isBlank(raw.discount)) {

        const number =
            toNumber(raw.discount);

        if (!inRange(number, MARGIN_LIMITS.discount)) {

            errors.push({
                fields: ["discount"],
                message:
                    "Enter a discount from 0% to 95%, or leave it blank."
            });

        } else {

            discount = number;

        }

    }

    return errors.length > 0
        ? { ok: false, errors }
        : { ok: true, values: { cost, basis, value, discount } };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateMarginInputs).
   Returns plain numbers; nothing is formatted.
========================================================= */

/* the price of the chosen basis, in paise where it is derived, scaled otherwise */
function priceOf(
    basis,
    costS,
    valueS
) {

    if (basis === "price") {
        return valueS;
    }

    // percentages are scaled by S as well, so 100 * S is one hundred percent
    const paise =
        basis === "margin"
            ? ceilDiv(10000n * costS, 100n * S - valueS)
            : ceilDiv(costS * (100n * S + valueS), S * S);

    return paiseToScaled(paise < 1n ? 1n : paise);

}

function profitState(
    profitS
) {

    return profitS > 0n ? "profit" : profitS === 0n ? "zero" : "loss";

}

function costChangeRow(
    change,
    costS,
    priceS
) {

    const factor =
        BigInt(100 + change);

    const profitS =
        priceS - costS;

    // cost x (100 + change) / 100, as a ratio over 100 * S
    const newCostNumerator =
        costS * factor;

    const marginAtPrice =
        ratio(100n * priceS - newCostNumerator, 100n * priceS);

    const keeps =
        profitS > 0n;

    // paise: the price scaled by (100 + change), or the new cost, rounded up
    const paise =
        keeps
            ? ceilDiv(priceS * factor, S)
            : ceilDiv(newCostNumerator, S);

    const priceToKeepS =
        paiseToScaled(paise < 1n ? 1n : paise);

    return {
        change,
        cost: ratio(newCostNumerator, 100n * S),
        margin: marginAtPrice,
        price: scaledToNumber(priceToKeepS),
        priceChange: ratio(priceToKeepS - priceS, priceS),
        kind: keeps ? "keep" : "cover"
    };

}

function discountBlock(
    discount,
    costS,
    priceS
) {

    if (discount === null || discount === 0) {
        return null;
    }

    const discountS =
        scaled(discount);

    const paise =
        roundHalfUp(priceS * (100n * S - discountS), S * S);

    const discountedS =
        paiseToScaled(paise);

    const baseProfitS =
        priceS - costS;

    const profitS =
        discountedS - costS;

    const state =
        baseProfitS <= 0n
            ? "base-loss"
            : profitS <= 0n
                ? "none"
                : "profit";

    return {
        percent: discount,
        price: scaledToNumber(discountedS),
        profit: scaledToNumber(profitS),
        margin: discountedS > 0n ? ratio(profitS, discountedS) : null,
        state,
        volumeMultiple:
            state === "profit"
                ? ratio(baseProfitS, profitS)
                : null
    };

}

export function calculateMargin({
    cost,
    basis,
    value,
    discount = null
}) {

    const costS =
        scaled(cost);

    const priceS =
        priceOf(basis, costS, scaled(value));

    const profitS =
        priceS - costS;

    return {
        input: { cost, basis, value, discount },
        price: scaledToNumber(priceS),
        profit: scaledToNumber(profitS),
        margin: ratio(profitS, priceS),
        markup: ratio(profitS, costS),
        state: profitState(profitS),
        derived: basis !== "price",
        rows: COST_CHANGES.map(
            change => costChangeRow(change, costS, priceS)
        ),
        discount: discountBlock(discount, costS, priceS)
    };

}
