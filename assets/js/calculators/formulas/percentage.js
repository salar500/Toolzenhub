/* =========================================================
   ToolZen Hub
   Percentage Calculator: the arithmetic

   Pure: no DOM, no storage, no clock. The page (percentage/
   index.js) reads the fields, hands the text to this module and
   shows what it returns; this module is tested against an
   independent reference (tests/fixtures/percentage-golden.py).

   THE RELATIONSHIP
       end = start × (100 + p) ÷ 100          (p is a percentage change)
   Any two of start, p and end give the third:
       end   = start × (100 + p) ÷ 100
       p     = (end ÷ start − 1) × 100
       start = end × 100 ÷ (100 + p)
   The change that undoes p, taking the end back to the start:
       u = −100 × p ÷ (100 + p)
   An optional second change q is taken of the ending value:
       end2 = end × (100 + q) ÷ 100,  net = (end2 ÷ start − 1) × 100
   and the plain sum p + q is returned only so the page can show
   why it is not the combined change.

   EXACT ARITHMETIC. Start and end are read as whole hundredths and
   a percentage as whole hundredths of a percentage point (from the
   TEXT, never through floating point). Every formula is then done
   with BigInt numerators and denominators, ranges are checked on
   the exact value, and the only rounding is for display: two
   decimals, half up (a tie goes away from zero), never "-0.00".

   WHICH FIELD IS SOLVED is decided only by which core field the
   visitor leaves empty:
       start + change → end;  start + end → change;  change + end → start.
   Fewer than two filled: nothing is calculated (not an error).
   All three filled: nothing is calculated and nothing is guessed;
   the page asks the visitor to clear one. The solved value is never
   written back into a field.

   TWO KINDS OF "OUT OF RANGE"
     - an INPUT error: the visitor typed a value outside its range;
     - a SOLVED value outside the range: the two values typed are
       fine and a mathematical answer exists, but it is outside what
       this tool shows. It is never clamped, rounded up or blamed on
       a field.
   The undoing change and the net effect are OUTPUTS and are not
   limited by the input range of a change.
========================================================= */


/* =========================================================
   LIMITS (in whole hundredths)
========================================================= */

export const PERCENTAGE_LIMITS = Object.freeze({

    /* a value (start, end, or a solved start / end): 0.01 to 1,00,00,00,000 */
    valueHundredths: Object.freeze({ min: 1n, max: 100000000000n }),

    /* a percentage change: −99.99 to 10,00,000 (hundredths of a percentage point) */
    changeHundredths: Object.freeze({ min: -9999n, max: 100000000n })

});

export const DEFAULT_INPUTS = Object.freeze({
    start: "2000",
    change: "20",
    end: "",
    second: ""
});

export const CORE_FIELDS = Object.freeze(["start", "change", "end"]);

const VALUE_MESSAGE =
    "Enter a value between 0.01 and 1,00,00,00,000.";

const CHANGE_MESSAGE =
    "Enter a percentage change between −99.99 and 10,00,000. A fall of 100% or more is not possible.";


/* =========================================================
   EXACT FRACTIONS (BigInt numerator and denominator, d > 0)
========================================================= */

function gcd(a, b) {

    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;

    while (b !== 0n) {
        [a, b] = [b, a % b];
    }

    return a;

}

function frac(n, d = 1n) {

    if (d < 0n) {
        n = -n;
        d = -d;
    }

    const g = gcd(n, d) || 1n;

    return { n: n / g, d: d / g };

}

const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const div = (a, b) => frac(a.n * b.d, a.d * b.n);

const HUNDRED = frac(100n);

/* hundredths → the plain number (start 2,000.00 is 200000 hundredths → 2000) */
const fromHundredths = (h) => frac(h, 100n);

const compare = (a, b) => {
    const left = a.n * b.d;
    const right = b.n * a.d;
    return left < right ? -1 : left > right ? 1 : 0;
};

/*
 * A fraction as whole hundredths, rounded half up (a tie goes away
 * from zero). Returns a BigInt; zero is zero (never negative).
 */
export function roundToHundredths(
    fraction
) {

    const negative = fraction.n < 0n;
    const n = (negative ? -fraction.n : fraction.n) * 100n;
    const rounded = (2n * n + fraction.d) / (2n * fraction.d);

    return negative && rounded !== 0n ? -rounded : rounded;

}

const inRange = (fraction, limits) =>
    compare(fraction, fromHundredths(limits.min)) >= 0 &&
    compare(fraction, fromHundredths(limits.max)) <= 0;

const valueInRange = (fraction) => inRange(fraction, PERCENTAGE_LIMITS.valueHundredths);
const changeInRange = (fraction) => inRange(fraction, PERCENTAGE_LIMITS.changeHundredths);


/* =========================================================
   READING A FIELD
   Returns { state, hundredths, message }:
     blank    nothing typed
     partial  still being typed ("-", "1.", "-0.") and not yet a number
     valid    a number with at most two decimals
     invalid  something that cannot be a value; `message` says why
========================================================= */

export function parseField(
    text,
    kind
) {

    const raw = String(text ?? "");

    let value =
        raw
            .replace(/[\s,]/g, "")
            .replace(/−/g, "-")
            .replace(/%$/, "");

    if (value === "") {
        return { state: raw.trim() === "" ? "blank" : "partial", hundredths: null };
    }

    /* still being typed: a lone sign or point, or a number ending in a point */
    if (/^[+-]?\.?$/.test(value) || /^[+-]?\d*\.$/.test(value)) {
        return { state: "partial", hundredths: null };
    }

    if (/^[+-]?\d*\.\d{3,}$/.test(value)) {
        return { state: "invalid", hundredths: null, message: "Use up to 2 decimal places." };
    }

    const match = /^([+-]?)(\d*)(?:\.(\d{1,2}))?$/.exec(value);

    if (!match || (match[2] === "" && match[3] === undefined)) {
        return { state: "invalid", hundredths: null, message: "Enter a number." };
    }

    const [, sign, whole, decimals = ""] = match;

    let hundredths =
        BigInt(whole === "" ? "0" : whole) * 100n +
        BigInt(decimals.padEnd(2, "0"));

    if (sign === "-" && hundredths !== 0n) {
        hundredths = -hundredths;
    }

    /* direct input ranges */
    const limits =
        kind === "change"
            ? PERCENTAGE_LIMITS.changeHundredths
            : PERCENTAGE_LIMITS.valueHundredths;

    if (hundredths < limits.min || hundredths > limits.max) {
        return {
            state: "invalid",
            hundredths: null,
            message: kind === "change" ? CHANGE_MESSAGE : VALUE_MESSAGE
        };
    }

    return { state: "valid", hundredths };

}


/* =========================================================
   THE CALCULATION
   `inputs` is { start, change, end, second }, each the text of a
   field. Returns an object with a `status`:

     "invalid"       a field holds an input error → `errors` [{ field, message }]
     "incomplete"    fewer than two core fields filled; nothing calculated
     "all-three"     all three filled; nothing calculated, nothing guessed
     "out-of-range"  the solved value is outside the range; `solvesFor`
                     and `exact` (the exact fraction) say which and what
     "solved"        `solvesFor` ("end" | "change" | "start") and the figures

   A figure is { h, exact } where h is the displayed value in whole
   hundredths (rounded half up) and exact is { n, d } as strings.
========================================================= */

const figure = (fraction) => ({
    h: roundToHundredths(fraction),
    exact: { n: fraction.n.toString(), d: fraction.d.toString() }
});

export function solvePercentage(
    inputs
) {

    const parsed = {
        start: parseField(inputs.start, "value"),
        change: parseField(inputs.change, "change"),
        end: parseField(inputs.end, "value"),
        second: parseField(inputs.second, "change")
    };

    const errors =
        Object.entries(parsed)
            .filter(([, p]) => p.state === "invalid")
            .map(([field, p]) => ({ field, message: p.message }));

    if (errors.length > 0) {
        return { status: "invalid", errors };
    }

    const filled = CORE_FIELDS.filter((field) => parsed[field].state === "valid");

    if (filled.length < 2) {
        return { status: "incomplete" };
    }

    if (filled.length === 3) {
        return { status: "all-three" };
    }

    const solvesFor =
        CORE_FIELDS.find((field) => !filled.includes(field));

    const value = (field) => fromHundredths(parsed[field].hundredths);

    let start = filled.includes("start") ? value("start") : null;
    let change = filled.includes("change") ? value("change") : null;
    let end = filled.includes("end") ? value("end") : null;

    let solved;
    let ok;

    if (solvesFor === "end") {

        end = div(mul(start, add(HUNDRED, change)), HUNDRED);
        solved = end;
        ok = valueInRange(solved);

    } else if (solvesFor === "change") {

        change = mul(sub(div(end, start), frac(1n)), HUNDRED);
        solved = change;
        ok = changeInRange(solved);

    } else {

        /* 100 + change is above zero: the change is at least −99.99 */
        start = div(mul(end, HUNDRED), add(HUNDRED, change));
        solved = start;
        ok = valueInRange(solved);

    }

    if (!ok) {
        return { status: "out-of-range", solvesFor, exact: figure(solved).exact };
    }

    const undo = div(mul(frac(-100n), change), add(HUNDRED, change));

    const result = {
        status: "solved",
        solvesFor,
        start: figure(start),
        change: figure(change),
        end: figure(end),
        amount: figure(sub(end, start)),
        endPercentOfStart: figure(mul(div(end, start), HUNDRED)),
        undo: figure(undo),
        second: null
    };

    if (parsed.second.state === "valid") {

        const q = fromHundredths(parsed.second.hundredths);
        const end2 = div(mul(end, add(HUNDRED, q)), HUNDRED);

        result.second =
            valueInRange(end2)
                ? {
                    status: "solved",
                    q: figure(q),
                    end2: figure(end2),
                    net: figure(mul(sub(div(end2, start), frac(1n)), HUNDRED)),
                    plainSum: figure(add(change, q))
                }
                : {
                    status: "out-of-range",
                    q: figure(q),
                    exact: figure(end2).exact
                };

    }

    return result;

}


/* =========================================================
   DISPLAY TEXT
   Whole hundredths as text. The grouped form uses the Indian
   grouping (1,00,000.00); the plain form has no separators.
   A minus is "-" here; the page may show a true minus sign.
========================================================= */

export function plainText(
    hundredths
) {

    const negative = hundredths < 0n;
    const digits = (negative ? -hundredths : hundredths).toString().padStart(3, "0");

    return `${negative ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`;

}

function groupIndian(
    integerDigits
) {

    if (integerDigits.length <= 3) {
        return integerDigits;
    }

    const head = integerDigits.slice(0, -3);
    const tail = integerDigits.slice(-3);

    return `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;

}

export function groupedText(
    hundredths
) {

    const [whole, decimals] = plainText(hundredths).replace("-", "").split(".");

    return `${hundredths < 0n ? "-" : ""}${groupIndian(whole)}.${decimals}`;

}
