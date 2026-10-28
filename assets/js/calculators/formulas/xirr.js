/* =========================================================
   ToolZen Hub
   XIRR engine (pure)

   The annualised rate of return of cash flows on dated days: the
   rate r that makes

       sum of  amount_i / (1 + r) ^ (days_i / 365)  =  0

   where days_i counts from the earliest date (Actual/365, the
   definition spreadsheets use for XIRR). Money out is negative and
   money in is positive.

   Method. NPV(r) is not monotonic in general, so there can be zero,
   one or several rates. With x = ln(1 + r) the function is scanned
   on a fixed grid from r = -99.9999% to r = 1,000,000%, every sign
   change is refined by bisection (to 1e-15 in x, at most 200 steps),
   and the rate nearest zero is reported with the others listed. The
   function is rescaled by its largest term at each point (a positive
   factor, so signs and roots are unchanged) so that long periods and
   extreme rates cannot overflow. A double root that only touches zero
   has no sign change and is not found: the page says what it can and
   cannot promise.

   Nothing here reads the page, the clock or storage.
========================================================= */

export const XIRR_LIMITS = Object.freeze({
    minRows: 2,
    maxRows: 100,
    maxPasteChars: 20000,
    minDate: "1990-01-01",
    maxDate: "2100-12-31",
    maxAmount: 1e12
});

const DAY_MS = 86400000;
const BASIS_DAYS = 365;

const GRID_POINTS = 4000;
const X_LOW = Math.log(1e-6);
const X_HIGH = Math.log(1e6 + 1);
const MAX_ITERATIONS = 200;
const X_TOLERANCE = 1e-15;

/* =========================================================
   DATES
========================================================= */

function dayNumber(y, m, d) {

    const t = Date.UTC(y, m - 1, d);
    const check = new Date(t);

    if (
        check.getUTCFullYear() !== y ||
        check.getUTCMonth() !== m - 1 ||
        check.getUTCDate() !== d
    ) {
        return null;
    }

    return Math.round(t / DAY_MS);

}

const MIN_DAY = dayNumber(1990, 1, 1);
const MAX_DAY = dayNumber(2100, 12, 31);

const pad = (n, width) => String(n).padStart(width, "0");

/*
 * YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY (day first). Returns
 * { iso, day } or null. The day is a whole number of days since
 * 1970-01-01, so there is no time zone in any calculation.
 */
export function parseDate(text) {

    const s = String(text ?? "").trim();

    let y;
    let m;
    let d;
    let match;

    if ((match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) {
        [y, m, d] = [match[1], match[2], match[3]].map(Number);
    } else if ((match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s))) {
        [d, m, y] = [match[1], match[2], match[3]].map(Number);
    } else {
        return null;
    }

    const day = dayNumber(y, m, d);

    if (day === null || day < MIN_DAY || day > MAX_DAY) {
        return null;
    }

    return { iso: `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`, day };

}

/* =========================================================
   AMOUNTS
========================================================= */

/*
 * A plain or Indian-grouped number with up to 2 decimals, an
 * optional leading sign, ₹ or Rs, or (brackets) for negative.
 * Returns the signed number, or NaN.
 */
export function parseAmount(text) {

    let s = String(text ?? "").trim();

    if (s === "") {
        return NaN;
    }

    let negative = false;

    if (/^\(.*\)$/.test(s)) {
        negative = true;
        s = s.slice(1, -1).trim();
    }

    s = s.replace(/^(₹|rs\.?|inr)\s*/i, "");

    const signed = /^([+-])\s*(.*)$/.exec(s);

    if (signed) {
        negative = negative !== (signed[1] === "-");
        s = signed[2].replace(/^(₹|rs\.?|inr)\s*/i, "");
    }

    if (!/^(\d{1,2}(,\d{2})*,\d{3}|\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/.test(s)) {
        return NaN;
    }

    const value = Number(s.replace(/,/g, ""));

    return negative ? -value : value;

}

/* =========================================================
   PASTED ROWS
   One flow a line: a date, then an amount. Negative or in
   brackets is money out; positive is money in.
========================================================= */

const DATE_PART = "(\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{4})";
const LINE = new RegExp(`^${DATE_PART}\\s*[\\t;,|]?\\s*(.+)$`);

export function parsePastedRows(text) {

    const lines = String(text ?? "").split(/\r\n|\r|\n/);

    const rows = [];
    const errors = [];

    lines.forEach((raw, index) => {

        const line = raw.trim();

        if (line === "") {
            return;
        }

        const number = index + 1;
        const match = LINE.exec(line);

        if (!match) {
            /* a header line such as "Date, Amount" is skipped when it is the first non-empty line */
            if (rows.length === 0 && errors.length === 0 && !/\d/.test(line)) {
                return;
            }
            errors.push({ line: number, message: `Line ${number}: start with a date (YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY), then an amount.` });
            return;
        }

        const date = parseDate(match[1]);

        if (!date) {
            errors.push({ line: number, message: `Line ${number}: "${match[1]}" is not a valid date between 1990 and 2100.` });
            return;
        }

        const amount = parseAmount(match[2]);

        if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > XIRR_LIMITS.maxAmount) {
            errors.push({ line: number, message: `Line ${number}: the amount must be a non-zero number with up to 2 decimals.` });
            return;
        }

        rows.push({ iso: date.iso, amount });

    });

    return { rows, errors };

}

/* =========================================================
   VALIDATION
   flows: [{ day, amount }] (signed). Returns { ok, errors } or
   { ok, values: { flows (by date), ... } }.
========================================================= */

export function validateFlows(flows) {

    const errors = [];

    if (!Array.isArray(flows) || flows.length < XIRR_LIMITS.minRows) {
        errors.push({ message: "Enter at least two cash flows: money out and money in." });
        return { ok: false, errors };
    }

    if (flows.length > XIRR_LIMITS.maxRows) {
        errors.push({ message: `Use at most ${XIRR_LIMITS.maxRows} cash flows.` });
        return { ok: false, errors };
    }

    const hasOut = flows.some(flow => flow.amount < 0);
    const hasIn = flows.some(flow => flow.amount > 0);

    if (!hasOut || !hasIn) {
        errors.push({
            message: hasOut
                ? "Add at least one money-in amount. A rate needs both money out and money in."
                : "Add at least one money-out amount. A rate needs both money out and money in."
        });
        return { ok: false, errors };
    }

    const sorted = [...flows].sort((a, b) => a.day - b.day);
    const span = sorted.at(-1).day - sorted[0].day;

    if (span < 1) {
        errors.push({ message: "The dates must not all be the same day. A yearly rate needs a period." });
        return { ok: false, errors };
    }

    return { ok: true, values: { flows: sorted, span } };

}

/* =========================================================
   NET PRESENT VALUE AND THE SOLVER
========================================================= */

function times(flows) {

    const first = flows[0].day;

    return flows.map(flow => (flow.day - first) / BASIS_DAYS);

}

/* the plain NPV at rate r (a fraction), used for the residual and by the tests */
export function xnpv(rate, flows) {

    const t = times(flows);

    return flows.reduce(
        (sum, flow, i) => sum + flow.amount / Math.pow(1 + rate, t[i]),
        0
    );

}

/* NPV rescaled by its largest term: same sign, same roots, no overflow */
function scaled(x, flows, t) {

    let m = -Infinity;

    for (let i = 0; i < t.length; i++) {
        m = Math.max(m, -x * t[i]);
    }

    let sum = 0;

    for (let i = 0; i < t.length; i++) {
        sum += flows[i].amount * Math.exp(-x * t[i] - m);
    }

    return sum;

}

/*
 * |NPV| at the rate, relative to the size of the terms, computed with the
 * same rescaling as the solver so that a long period and a rate near
 * -100% cannot overflow or underflow into NaN (the plain xnpv can).
 */
export function relativeResidual(rate, flows) {

    const t = times(flows);
    const x = Math.log(1 + rate);

    let m = -Infinity;

    for (let i = 0; i < t.length; i++) {
        m = Math.max(m, -x * t[i]);
    }

    let net = 0;
    let size = 0;

    for (let i = 0; i < t.length; i++) {
        const term = flows[i].amount * Math.exp(-x * t[i] - m);
        net += term;
        size += Math.abs(term);
    }

    return Math.abs(net) / size;

}

/*
 * flows must be valid and sorted by date.
 * Returns { state: "ok", rate, roots, residual } (rates are fractions)
 * or { state: "none" }.
 */
export function solveXirr(flows) {

    const t = times(flows);
    const f = x => scaled(x, flows, t);

    const step = (X_HIGH - X_LOW) / GRID_POINTS;
    const roots = [];

    let xPrev = X_LOW;
    let fPrev = f(xPrev);

    if (fPrev === 0) {
        roots.push(xPrev);
    }

    for (let k = 1; k <= GRID_POINTS; k++) {

        const x = X_LOW + k * step;
        const fx = f(x);

        if (fx === 0) {
            roots.push(x);
        } else if (fPrev !== 0 && (fPrev < 0) !== (fx < 0)) {

            let lo = xPrev;
            let hi = x;
            let flo = fPrev;

            for (let n = 0; n < MAX_ITERATIONS && hi - lo > X_TOLERANCE; n++) {

                const mid = (lo + hi) / 2;
                const fm = f(mid);

                if (fm === 0) {
                    lo = hi = mid;
                    break;
                }

                if ((fm < 0) === (flo < 0)) {
                    lo = mid;
                    flo = fm;
                } else {
                    hi = mid;
                }

            }

            roots.push((lo + hi) / 2);

        }

        xPrev = x;
        fPrev = fx;

    }

    if (roots.length === 0) {
        return { state: "none" };
    }

    const rates = [...new Set(roots.map(x => Math.exp(x) - 1))].sort((a, b) => a - b);

    const rate = rates.reduce(
        (best, r) => (Math.abs(r) < Math.abs(best) ? r : best)
    );

    return {
        state: "ok",
        rate,
        roots: rates,
        residual: relativeResidual(rate, flows)
    };

}

/* =========================================================
   SUMMARY AND THE TWO-FLOW CROSS-CHECK
========================================================= */

export function summarise(flows) {

    let moneyOut = 0;
    let moneyIn = 0;

    for (const flow of flows) {
        if (flow.amount < 0) {
            moneyOut += -flow.amount;
        } else {
            moneyIn += flow.amount;
        }
    }

    const days = flows.at(-1).day - flows[0].day;

    return {
        moneyOut,
        moneyIn,
        net: moneyIn - moneyOut,
        days,
        years: days / BASIS_DAYS
    };

}

/*
 * When there is exactly one money-out and one money-in, the rate has
 * a closed form: (in / out) ^ (365 / days) - 1. Otherwise null.
 */
export function twoFlowRate(flows) {

    if (flows.length !== 2) {
        return null;
    }

    const out = flows.find(flow => flow.amount < 0);
    const into = flows.find(flow => flow.amount > 0);

    if (!out || !into) {
        return null;
    }

    const days = Math.abs(into.day - out.day);

    if (days < 1) {
        return null;
    }

    /* the closed form measures from the out-flow's date, which is the earliest only if the money goes out first; the exponent is signed to stay correct either way */
    const signed = (into.day - out.day) / BASIS_DAYS;

    return Math.pow(into.amount / -out.amount, 1 / signed) - 1;

}

/* the day number of an ISO date, for callers that build flows from rows */
export function toFlow(iso, amount) {

    const date = parseDate(iso);

    return date ? { day: date.day, amount } : null;

}
