/* =========================================================
   ToolZen Hub
   Excel Practice Lab: the calculation engine

   An educational spreadsheet simulation, not Microsoft Excel. It evaluates the syntax trees made by parser.js over one sheet of
   cells, for the documented list of functions (SUPPORTED). A function that is not on the list gives #NAME? and a message that says
   so; it never gives a made-up value. No eval, no Function, no DOM, no network. Limits: a range of at most 2,000 cells.

   Values: a number, a string, a boolean, null (a blank cell) or an XlError. A range is { range: true, rows: [[value]] }.
   Dates are serial numbers (1 = 1900-01-01) and only dates from 1900-03-01 are supported, which avoids Excel's 1900 leap-year
   quirk; earlier results are #NUM!.
========================================================= */

import { parseFormula, FormulaSyntaxError, parseAddress, addressOf } from "./parser.js";

export const MAX_RANGE_CELLS = 2000;

export class XlError {
    constructor(code, note = "") { this.code = code; this.note = note; }
    toString() { return this.code; }
}

const err = (code, note) => new XlError(code, note);
const isErr = (v) => v instanceof XlError;
const isRange = (v) => v !== null && typeof v === "object" && v.range === true;

export const ERROR_HELP = {
    "#DIV/0!": "A number was divided by zero or by an empty cell. Check the cell you divide by, or wrap the formula in IFERROR.",
    "#N/A": "A lookup did not find what it was asked for. Check spelling, extra spaces, and whether the value is a number in one place and text in the other.",
    "#VALUE!": "A value is of the wrong kind, for example text where a number is needed. Check the cells the formula uses.",
    "#REF!": "A reference points to a cell that does not exist, usually after copying a formula off the sheet or deleting a cell.",
    "#NAME?": "Excel does not recognise a name: a function is misspelled, or this lab does not support it, or text is missing its quotes.",
    "#NUM!": "A number is not valid for the calculation, such as the square root of a negative number or a date before 1 March 1900.",
    "#NULL!": "A range operator is wrong."
};

/* ---------- conversions ---------- */

export function numberToText(n) {
    if (!Number.isFinite(n)) return String(n);
    const r = Number(n.toPrecision(15));
    if (Math.abs(r) >= 1e21 || (r !== 0 && Math.abs(r) < 1e-9)) return r.toExponential().replace("e+", "E+").replace("e-", "E-");
    return String(r);
}

function toNumber(v) {
    if (isErr(v)) return v;
    if (v === null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string") {
        const t = v.trim();
        if (t === "") return err("#VALUE!", "Empty text is not a number.");
        if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return Number(t);
        if (/^[+-]?(\d+\.?\d*|\.\d+)%$/.test(t)) return Number(t.slice(0, -1)) / 100;
        return err("#VALUE!", `"${v}" is text that cannot be read as a number.`);
    }
    return err("#VALUE!");
}

function toText(v) {
    if (isErr(v)) return v;
    if (v === null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    return numberToText(v);
}

function toBool(v) {
    if (isErr(v)) return v;
    if (v === null) return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const u = String(v).toUpperCase();
    if (u === "TRUE") return true;
    if (u === "FALSE") return false;
    return err("#VALUE!", `"${v}" is not TRUE or FALSE.`);
}

/** Excel's ordering across kinds: numbers < text < booleans. Blank counts as 0 or "" against the other side. */
function compare(a, b) {
    const rank = (v) => (typeof v === "number" ? 0 : typeof v === "string" ? 1 : 2);
    if (a === null) a = typeof b === "string" ? "" : typeof b === "boolean" ? false : 0;
    if (b === null) b = typeof a === "string" ? "" : typeof a === "boolean" ? false : 0;
    if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
    if (typeof a === "string") {
        const x = a.toLowerCase();
        const y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    }
    if (typeof a === "boolean") return Number(a) - Number(b);
    return a < b ? -1 : a > b ? 1 : 0;
}

/* ---------- dates ---------- */

const MS_DAY = 86400000;
const EPOCH = Date.UTC(1899, 11, 30);
const MIN_SERIAL = 61; // 1900-03-01

function serialFromParts(y, m, d) {
    const ms = Date.UTC(y, m - 1, d);
    // Date.UTC treats years 0 to 99 as 1900 to 1999; Excel does too
    return Math.round((ms - EPOCH) / MS_DAY);
}
function partsFromSerial(serial) {
    const dt = new Date(EPOCH + Math.floor(serial) * MS_DAY);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: dt.getUTCDay() };
}

/* ---------- the evaluator ---------- */

function flatten(v) {
    return isRange(v) ? v.rows.flat() : [v];
}

/** Numbers from arguments for SUM-like functions: in a range only real numbers count; typed arguments are converted. */
function collectNumbers(args) {
    const nums = [];
    for (const a of args) {
        if (isRange(a)) {
            for (const v of a.rows.flat()) {
                if (isErr(v)) return v;
                if (typeof v === "number") nums.push(v);
            }
        } else {
            if (isErr(a)) return a;
            if (a === null) continue;
            const n = toNumber(a);
            if (isErr(n)) return n;
            nums.push(n);
        }
    }
    return nums;
}

function wildcardRegex(pattern) {
    const esc = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/~\*/g, "\u0001").replace(/~\?/g, "\u0002").replace(/\*/g, ".*").replace(/\?/g, ".").replace(/\u0001/g, "\\*").replace(/\u0002/g, "\\?");
    return new RegExp(`^${esc}$`, "i");
}

/** A criterion such as ">50", "<>Pune", "A*", 10 or "". Returns a function of a cell value. */
function makeCriterion(c) {
    if (isErr(c)) return null;
    if (typeof c === "number" || typeof c === "boolean") return (v) => v !== null && typeof v === typeof c && v === c;
    const text = toText(c);
    const m = /^(<=|>=|<>|=|<|>)?(.*)$/s.exec(text);
    const op = m[1] ?? "=";
    const operand = m[2];
    const num = operand.trim() !== "" && !Number.isNaN(Number(operand)) ? Number(operand) : null;
    if (op === "=" || op === "<>") {
        let test;
        if (operand === "") test = (v) => v === null || v === "";
        else if (num !== null) test = (v) => typeof v === "number" ? v === num : false;
        else if (/^(TRUE|FALSE)$/i.test(operand)) test = (v) => typeof v === "boolean" && v === (operand.toUpperCase() === "TRUE");
        else {
            const re = wildcardRegex(operand);
            test = (v) => typeof v === "string" && re.test(v);
        }
        if (op === "<>") return operand === "" ? (v) => !(v === null || v === "") : (v) => !test(v);
        return test;
    }
    return (v) => {
        if (num !== null) {
            if (typeof v !== "number") return false;
            return op === "<" ? v < num : op === "<=" ? v <= num : op === ">" ? v > num : v >= num;
        }
        if (typeof v !== "string") return false;
        const c2 = compare(v, operand);
        return op === "<" ? c2 < 0 : op === "<=" ? c2 <= 0 : op === ">" ? c2 > 0 : c2 >= 0;
    };
}

function roundTo(x, digits, mode) {
    if (digits < 0) {
        const q = 10 ** -digits;
        const s = Number((Math.abs(x) / q).toPrecision(15));
        return Math.sign(x) * (mode === "up" ? Math.ceil(s) : mode === "down" ? Math.floor(s) : Math.round(s)) * q;
    }
    const p = 10 ** digits;
    const scaled = Number((Math.abs(x) * p).toPrecision(15));
    const r = mode === "up" ? Math.ceil(scaled) : mode === "down" ? Math.floor(scaled) : Math.round(scaled);
    return Math.sign(x) * (r / p);
}

function matchOne(lookup, list, type) {
    if (type === 0) {
        const re = typeof lookup === "string" && /[*?]/.test(lookup) ? wildcardRegex(lookup) : null;
        for (let i = 0; i < list.length; i += 1) {
            const v = list[i];
            if (re ? typeof v === "string" && re.test(v) : v !== null && typeof v === typeof lookup && compare(v, lookup) === 0) return i;
        }
        return -1;
    }
    let best = -1;
    for (let i = 0; i < list.length; i += 1) {
        const v = list[i];
        if (v === null || typeof v !== typeof lookup) continue;
        const c = compare(v, lookup);
        if (type === 1 ? c <= 0 : c >= 0) best = i;
        else break;
    }
    return best;
}

function financeArgs(args) {
    const n = args.map((a) => (a === null || a === undefined ? 0 : toNumber(a)));
    const bad = n.find(isErr);
    return bad ?? n;
}

/* Each function receives already evaluated arguments (ranges as { range, rows }). The lazy ones are listed in LAZY. */
const FUNCTIONS = {
    SUM: (a) => { const n = collectNumbers(a); return isErr(n) ? n : n.reduce((x, y) => x + y, 0); },
    PRODUCT: (a) => { const n = collectNumbers(a); return isErr(n) ? n : n.length ? n.reduce((x, y) => x * y, 1) : 0; },
    AVERAGE: (a) => { const n = collectNumbers(a); if (isErr(n)) return n; return n.length ? n.reduce((x, y) => x + y, 0) / n.length : err("#DIV/0!"); },
    MIN: (a) => { const n = collectNumbers(a); return isErr(n) ? n : n.length ? Math.min(...n) : 0; },
    MAX: (a) => { const n = collectNumbers(a); return isErr(n) ? n : n.length ? Math.max(...n) : 0; },
    MEDIAN: (a) => {
        const n = collectNumbers(a);
        if (isErr(n)) return n;
        if (!n.length) return err("#NUM!");
        n.sort((x, y) => x - y);
        const h = n.length >> 1;
        return n.length % 2 ? n[h] : (n[h - 1] + n[h]) / 2;
    },
    COUNT: (a) => {
        let c = 0;
        for (const x of a) for (const v of flatten(x)) if (typeof v === "number" || (!isRange(x) && !isErr(v) && v !== null && !isErr(toNumber(v)))) c += 1;
        return c;
    },
    COUNTA: (a) => a.reduce((c, x) => c + flatten(x).filter((v) => v !== null).length, 0),
    COUNTBLANK: (a) => a.reduce((c, x) => c + flatten(x).filter((v) => v === null || v === "").length, 0),
    ABS: ([x]) => { const n = toNumber(x); return isErr(n) ? n : Math.abs(n); },
    INT: ([x]) => { const n = toNumber(x); return isErr(n) ? n : Math.floor(n); },
    SQRT: ([x]) => { const n = toNumber(x); return isErr(n) ? n : n < 0 ? err("#NUM!") : Math.sqrt(n); },
    POWER: ([x, y]) => { const a = toNumber(x), b = toNumber(y); if (isErr(a)) return a; if (isErr(b)) return b; const r = a ** b; return Number.isFinite(r) ? r : err("#NUM!"); },
    MOD: ([x, y]) => {
        const a = toNumber(x), b = toNumber(y);
        if (isErr(a)) return a;
        if (isErr(b)) return b;
        if (b === 0) return err("#DIV/0!");
        return a - b * Math.floor(a / b);
    },
    ROUND: ([x, d = 0]) => { const n = toNumber(x), k = toNumber(d); return isErr(n) ? n : isErr(k) ? k : roundTo(n, Math.trunc(k), "half"); },
    ROUNDUP: ([x, d = 0]) => { const n = toNumber(x), k = toNumber(d); return isErr(n) ? n : isErr(k) ? k : roundTo(n, Math.trunc(k), "up"); },
    ROUNDDOWN: ([x, d = 0]) => { const n = toNumber(x), k = toNumber(d); return isErr(n) ? n : isErr(k) ? k : roundTo(n, Math.trunc(k), "down"); },
    AND: (a) => {
        let seen = false;
        for (const v of a.flatMap(flatten)) { if (isErr(v)) return v; if (v === null || typeof v === "string") continue; const b = toBool(v); if (isErr(b)) return b; seen = true; if (!b) return false; }
        return seen ? true : err("#VALUE!", "AND needs at least one logical value.");
    },
    OR: (a) => {
        let seen = false, any = false;
        for (const v of a.flatMap(flatten)) { if (isErr(v)) return v; if (v === null || typeof v === "string") continue; const b = toBool(v); if (isErr(b)) return b; seen = true; if (b) any = true; }
        return seen ? any : err("#VALUE!", "OR needs at least one logical value.");
    },
    NOT: ([x]) => { const b = toBool(x); return isErr(b) ? b : !b; },
    ISNUMBER: ([x]) => typeof x === "number",
    ISTEXT: ([x]) => typeof x === "string",
    ISBLANK: ([x]) => x === null,
    ISERROR: ([x]) => isErr(x),
    SUMIF: ([rng, crit, sumRng]) => {
        const test = makeCriterion(crit);
        if (!isRange(rng) || !test) return err("#VALUE!");
        const sum = isRange(sumRng) ? sumRng.rows.flat() : rng.rows.flat();
        let t = 0;
        rng.rows.flat().forEach((v, i) => { if (test(v) && typeof sum[i] === "number") t += sum[i]; });
        return t;
    },
    COUNTIF: ([rng, crit]) => { const test = makeCriterion(crit); return !isRange(rng) || !test ? err("#VALUE!") : rng.rows.flat().filter(test).length; },
    AVERAGEIF: ([rng, crit, avgRng]) => {
        const test = makeCriterion(crit);
        if (!isRange(rng) || !test) return err("#VALUE!");
        const vals = isRange(avgRng) ? avgRng.rows.flat() : rng.rows.flat();
        const hit = [];
        rng.rows.flat().forEach((v, i) => { if (test(v) && typeof vals[i] === "number") hit.push(vals[i]); });
        return hit.length ? hit.reduce((x, y) => x + y, 0) / hit.length : err("#DIV/0!");
    },
    SUMIFS: ([sumRng, ...rest]) => ifsReduce(sumRng, rest, (hit) => hit.reduce((x, y) => x + y, 0)),
    AVERAGEIFS: ([avgRng, ...rest]) => ifsReduce(avgRng, rest, (hit) => (hit.length ? hit.reduce((x, y) => x + y, 0) / hit.length : err("#DIV/0!"))),
    MAXIFS: ([r, ...rest]) => ifsReduce(r, rest, (hit) => (hit.length ? Math.max(...hit) : 0)),
    MINIFS: ([r, ...rest]) => ifsReduce(r, rest, (hit) => (hit.length ? Math.min(...hit) : 0)),
    COUNTIFS: (args) => {
        if (args.length < 2 || args.length % 2) return err("#VALUE!");
        const tests = [];
        for (let i = 0; i < args.length; i += 2) {
            const t = makeCriterion(args[i + 1]);
            if (!isRange(args[i]) || !t) return err("#VALUE!");
            tests.push([args[i].rows.flat(), t]);
        }
        const n = tests[0][0].length;
        if (tests.some(([cells]) => cells.length !== n)) return err("#VALUE!", "The ranges must have the same size.");
        let c = 0;
        for (let i = 0; i < n; i += 1) if (tests.every(([cells, t]) => t(cells[i]))) c += 1;
        return c;
    },
    SUMPRODUCT: (args) => {
        const lists = args.map((a) => flatten(a));
        if (lists.some((l) => l.length !== lists[0].length)) return err("#VALUE!", "The ranges must have the same size.");
        let t = 0;
        for (let i = 0; i < lists[0].length; i += 1) {
            let p = 1;
            for (const l of lists) { if (isErr(l[i])) return l[i]; p *= typeof l[i] === "number" ? l[i] : 0; }
            t += p;
        }
        return t;
    },
    LEN: ([x]) => { const s = toText(x); return isErr(s) ? s : s.length; },
    LEFT: ([x, n = 1]) => { const s = toText(x), k = toNumber(n); return isErr(s) ? s : isErr(k) ? k : k < 0 ? err("#VALUE!") : s.slice(0, Math.trunc(k)); },
    RIGHT: ([x, n = 1]) => { const s = toText(x), k = toNumber(n); return isErr(s) ? s : isErr(k) ? k : k < 0 ? err("#VALUE!") : Math.trunc(k) === 0 ? "" : s.slice(-Math.trunc(k)); },
    MID: ([x, st, n]) => {
        const s = toText(x), a = toNumber(st), k = toNumber(n);
        if (isErr(s)) return s;
        if (isErr(a)) return a;
        if (isErr(k)) return k;
        return a < 1 || k < 0 ? err("#VALUE!") : s.substr(Math.trunc(a) - 1, Math.trunc(k));
    },
    TRIM: ([x]) => { const s = toText(x); return isErr(s) ? s : s.replace(/ +/g, " ").replace(/^ | $/g, ""); },
    UPPER: ([x]) => { const s = toText(x); return isErr(s) ? s : s.toUpperCase(); },
    LOWER: ([x]) => { const s = toText(x); return isErr(s) ? s : s.toLowerCase(); },
    PROPER: ([x]) => { const s = toText(x); return isErr(s) ? s : s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, p, c) => p + c.toUpperCase()); },
    REPT: ([x, n]) => { const s = toText(x), k = toNumber(n); return isErr(s) ? s : isErr(k) ? k : k < 0 || s.length * k > 2000 ? err("#VALUE!") : s.repeat(Math.trunc(k)); },
    EXACT: ([a, b]) => { const x = toText(a), y = toText(b); return isErr(x) ? x : isErr(y) ? y : x === y; },
    FIND: ([f, w, st = 1]) => {
        const a = toText(f), b = toText(w), k = toNumber(st);
        if (isErr(a)) return a;
        if (isErr(b)) return b;
        const i = b.indexOf(a, Math.trunc(k) - 1);
        return i < 0 ? err("#VALUE!", `"${a}" was not found.`) : i + 1;
    },
    SEARCH: ([f, w, st = 1]) => {
        const a = toText(f), b = toText(w), k = toNumber(st);
        if (isErr(a)) return a;
        if (isErr(b)) return b;
        const i = b.toLowerCase().indexOf(a.toLowerCase(), Math.trunc(k) - 1);
        return i < 0 ? err("#VALUE!", `"${a}" was not found.`) : i + 1;
    },
    SUBSTITUTE: ([x, o, n, inst]) => {
        const s = toText(x), old = toText(o), nw = toText(n);
        if (isErr(s)) return s;
        if (old === "") return s;
        if (inst === undefined) return s.split(old).join(nw);
        const k = toNumber(inst);
        let idx = -1;
        for (let c = 0; c < k; c += 1) { idx = s.indexOf(old, idx + 1); if (idx < 0) return s; }
        return s.slice(0, idx) + nw + s.slice(idx + old.length);
    },
    CONCAT: (a) => { let out = ""; for (const v of a.flatMap(flatten)) { const t = toText(v); if (isErr(t)) return t; out += t; } return out; },
    CONCATENATE: (a) => FUNCTIONS.CONCAT(a),
    TEXTJOIN: ([d, ign, ...rest]) => {
        const delim = toText(d), skip = toBool(ign);
        if (isErr(delim)) return delim;
        if (isErr(skip)) return skip;
        const parts = [];
        for (const v of rest.flatMap(flatten)) { const t = toText(v); if (isErr(t)) return t; if (skip && t === "") continue; parts.push(t); }
        return parts.join(delim);
    },
    VALUE: ([x]) => (typeof x === "number" ? x : isErr(x) ? x : toNumber(toText(x))),
    DATE: ([y, m, d]) => {
        const a = toNumber(y), b = toNumber(m), c = toNumber(d);
        if (isErr(a) || isErr(b) || isErr(c)) return [a, b, c].find(isErr);
        const s = serialFromParts(Math.trunc(a), Math.trunc(b), Math.trunc(c));
        return s < MIN_SERIAL ? err("#NUM!", "This lab supports dates from 1 March 1900.") : s;
    },
    YEAR: ([x]) => dateField(x, (p) => p.y),
    MONTH: ([x]) => dateField(x, (p) => p.m),
    DAY: ([x]) => dateField(x, (p) => p.d),
    WEEKDAY: ([x, t = 1]) => {
        const kind = toNumber(t);
        return dateField(x, (p) => (kind === 2 ? ((p.wd + 6) % 7) + 1 : kind === 3 ? (p.wd + 6) % 7 : p.wd + 1));
    },
    EDATE: ([x, m]) => dateField(x, (p) => {
        const k = toNumber(m);
        if (isErr(k)) return k;
        const total = p.y * 12 + (p.m - 1) + Math.trunc(k);
        const y = Math.floor(total / 12), mo = (total % 12) + 1;
        const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
        return serialFromParts(y, mo, Math.min(p.d, last));
    }),
    EOMONTH: ([x, m]) => dateField(x, (p) => {
        const k = toNumber(m);
        if (isErr(k)) return k;
        const total = p.y * 12 + (p.m - 1) + Math.trunc(k);
        return serialFromParts(Math.floor(total / 12), (total % 12) + 1 + 1, 0);
    }),
    DAYS: ([e, s]) => { const a = toNumber(e), b = toNumber(s); return isErr(a) ? a : isErr(b) ? b : Math.floor(a) - Math.floor(b); },
    VLOOKUP: ([v, table, col, approx = true]) => {
        if (!isRange(table)) return err("#VALUE!");
        const c = toNumber(col);
        if (isErr(c)) return c;
        if (c < 1) return err("#VALUE!");
        if (c > table.rows[0].length) return err("#REF!", "The column number is larger than the table.");
        const exact = toBool(approx) === false;
        const first = table.rows.map((r) => r[0]);
        const i = matchOne(v, first, exact ? 0 : 1);
        return i < 0 ? err("#N/A") : table.rows[i][Math.trunc(c) - 1];
    },
    HLOOKUP: ([v, table, row, approx = true]) => {
        if (!isRange(table)) return err("#VALUE!");
        const r = toNumber(row);
        if (isErr(r)) return r;
        if (r < 1) return err("#VALUE!");
        if (r > table.rows.length) return err("#REF!", "The row number is larger than the table.");
        const exact = toBool(approx) === false;
        const i = matchOne(v, table.rows[0], exact ? 0 : 1);
        return i < 0 ? err("#N/A") : table.rows[Math.trunc(r) - 1][i];
    },
    MATCH: ([v, rng, t = 1]) => {
        if (!isRange(rng)) return err("#VALUE!");
        const kind = toNumber(t);
        const i = matchOne(v, rng.rows.flat(), kind === 0 ? 0 : kind > 0 ? 1 : -1);
        return i < 0 ? err("#N/A") : i + 1;
    },
    INDEX: ([rng, r, c]) => {
        if (!isRange(rng)) return err("#VALUE!");
        const rr = r === undefined || r === null ? 0 : toNumber(r);
        let cc = c === undefined || c === null ? 0 : toNumber(c);
        if (isErr(rr)) return rr;
        if (isErr(cc)) return cc;
        const oneRow = rng.rows.length === 1;
        const row = oneRow && c === undefined ? 1 : Math.trunc(rr);
        if (oneRow && c === undefined) cc = rr;
        const col = rng.rows[0].length === 1 && c === undefined ? 1 : Math.trunc(cc);
        if (row < 1 || col < 1 || row > rng.rows.length || col > rng.rows[0].length) return err("#REF!");
        return rng.rows[row - 1][col - 1];
    },
    XLOOKUP: ([v, look, ret, notFound, mode = 0]) => {
        if (!isRange(look) || !isRange(ret)) return err("#VALUE!");
        const list = look.rows.flat();
        const out = ret.rows.flat();
        if (list.length !== out.length) return err("#VALUE!", "The lookup and return ranges must have the same size.");
        const m = toNumber(mode);
        let i;
        if (m === 0) i = matchOne(v, list, 0);
        else {
            i = -1;
            let bestV = null;
            list.forEach((x, k) => {
                if (typeof x !== typeof v || x === null) return;
                const c = compare(x, v);
                if (c === 0) { if (i < 0 || compare(bestV, v) !== 0) { i = k; bestV = x; } return; }
                if (i >= 0 && compare(bestV, v) === 0) return;
                if (m === -1 && c < 0 && (i < 0 || compare(x, bestV) > 0)) { i = k; bestV = x; }
                if (m === 1 && c > 0 && (i < 0 || compare(x, bestV) < 0)) { i = k; bestV = x; }
            });
        }
        if (i < 0) return notFound === undefined || notFound === null ? err("#N/A") : notFound;
        return out[i];
    },
    PMT: (raw) => {
        const a = financeArgs(raw);
        if (isErr(a)) return a;
        const [rate, nper, pv, fv = 0, type = 0] = a;
        if (nper === 0) return err("#NUM!");
        if (rate === 0) return -(pv + fv) / nper;
        const f = (1 + rate) ** nper;
        return -(rate * (pv * f + fv)) / ((1 + rate * type) * (f - 1));
    },
    FV: (raw) => {
        const a = financeArgs(raw);
        if (isErr(a)) return a;
        const [rate, nper, pmt, pv = 0, type = 0] = a;
        if (rate === 0) return -(pv + pmt * nper);
        const f = (1 + rate) ** nper;
        return -(pv * f + pmt * (1 + rate * type) * ((f - 1) / rate));
    },
    PV: (raw) => {
        const a = financeArgs(raw);
        if (isErr(a)) return a;
        const [rate, nper, pmt, fv = 0, type = 0] = a;
        if (rate === 0) return -(fv + pmt * nper);
        const f = (1 + rate) ** nper;
        return -(fv + pmt * (1 + rate * type) * ((f - 1) / rate)) / f;
    }
};

function dateField(x, fn) {
    const n = toNumber(x);
    if (isErr(n)) return n;
    if (n < MIN_SERIAL) return err("#NUM!", "This lab supports dates from 1 March 1900.");
    return fn(partsFromSerial(n));
}

function ifsReduce(valueRng, rest, reduce) {
    if (!isRange(valueRng) || rest.length < 2 || rest.length % 2) return err("#VALUE!");
    const values = valueRng.rows.flat();
    const tests = [];
    for (let i = 0; i < rest.length; i += 2) {
        const t = makeCriterion(rest[i + 1]);
        if (!isRange(rest[i]) || !t) return err("#VALUE!");
        const cells = rest[i].rows.flat();
        if (cells.length !== values.length) return err("#VALUE!", "The ranges must have the same size.");
        tests.push([cells, t]);
    }
    const hit = [];
    values.forEach((v, k) => { if (typeof v === "number" && tests.every(([cells, t]) => t(cells[k]))) hit.push(v); });
    return reduce(hit);
}

/* Evaluated lazily (their branches are not all evaluated): IF, IFS, IFERROR, IFNA, CHOOSE. */
const LAZY = new Set(["IF", "IFS", "IFERROR", "IFNA", "CHOOSE"]);

export const SUPPORTED = [...Object.keys(FUNCTIONS), ...LAZY].sort();

/* ---------- the sheet ---------- */

/**
 * createSheet(cells): cells is { A1: "text, number text or =formula" }. A cell is a number when its text reads as one.
 * Returns { value(addr), formulaOf(addr), set(addr, text), evaluate(formulaText, atAddr) }.
 */
export function createSheet(cells = {}) {

    const raw = new Map(Object.entries(cells));
    let cache = new Map();
    const active = new Set();

    function parseRaw(text) {
        if (text === undefined || text === null || text === "") return null;
        if (typeof text === "number") return text;
        if (typeof text === "boolean") return text;
        const t = String(text);
        if (t.startsWith("=")) return undefined;
        const n = t.trim() === "" ? NaN : Number(t.trim());
        if (!Number.isNaN(n) && /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t.trim())) return n;
        if (/^(TRUE|FALSE)$/i.test(t.trim())) return t.trim().toUpperCase() === "TRUE";
        return t;
    }

    function cellValue(addr) {
        if (cache.has(addr)) return cache.get(addr);
        const text = raw.get(addr);
        const parsed = parseRaw(text);
        if (parsed !== undefined) return parsed;
        if (active.has(addr)) return err("#REF!", "circular");
        active.add(addr);
        let result;
        try {
            result = evalTree(parseFormula(String(text)));
        } catch (e) {
            result = e instanceof FormulaSyntaxError ? err("#NAME?", e.message) : err("#VALUE!", "The formula could not be calculated.");
        }
        active.delete(addr);
        if (result === undefined) result = null;
        cache.set(addr, result);
        return result;
    }

    function rangeValue(a, b) {
        const c0 = Math.min(a.col, b.col), c1 = Math.max(a.col, b.col), r0 = Math.min(a.row, b.row), r1 = Math.max(a.row, b.row);
        if ((c1 - c0 + 1) * (r1 - r0 + 1) > MAX_RANGE_CELLS) return err("#VALUE!", `A range may hold at most ${MAX_RANGE_CELLS} cells in this lab.`);
        const rows = [];
        for (let r = r0; r <= r1; r += 1) {
            const row = [];
            for (let c = c0; c <= c1; c += 1) row.push(cellValue(addressOf(c, r)));
            rows.push(row);
        }
        return { range: true, rows };
    }

    const scalar = (v) => (isRange(v) ? (v.rows.length === 1 && v.rows[0].length === 1 ? v.rows[0][0] : err("#VALUE!", "A range was used where one value is needed.")) : v);

    function evalTree(n) {
        switch (n.t) {
            case "num": case "str": case "bool": return n.v;
            case "err": return err(n.v);
            case "blank": return null;
            case "name": return err("#NAME?", `"${n.v}" is not a function, cell or value this lab knows. Text must be in double quotes.`);
            case "ref": return cellValue(addressOf(n.col, n.row));
            case "range": return rangeValue(n.a, n.b);
            case "pct": { const x = toNumber(scalar(evalTree(n.x))); return isErr(x) ? x : x / 100; }
            case "unary": { const x = toNumber(scalar(evalTree(n.x))); return isErr(x) ? x : n.op === "-" ? -x : x; }
            case "bin": return binary(n);
            case "call": return call(n);
            default: return err("#VALUE!");
        }
    }

    function binary(n) {
        const l = scalar(evalTree(n.l));
        const r = scalar(evalTree(n.r));
        if (isErr(l)) return l;
        if (isErr(r)) return r;
        if (n.op === "&") return toText(l) + toText(r);
        if (["=", "<>", "<", "<=", ">", ">="].includes(n.op)) {
            const c = compare(l, r);
            return n.op === "=" ? c === 0 : n.op === "<>" ? c !== 0 : n.op === "<" ? c < 0 : n.op === "<=" ? c <= 0 : n.op === ">" ? c > 0 : c >= 0;
        }
        const a = toNumber(l);
        const b = toNumber(r);
        if (isErr(a)) return a;
        if (isErr(b)) return b;
        switch (n.op) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return b === 0 ? err("#DIV/0!") : a / b;
            case "^": { const v = a ** b; return Number.isFinite(v) ? v : err("#NUM!"); }
            default: return err("#VALUE!");
        }
    }

    function call(n) {
        const name = n.name;
        if (LAZY.has(name)) return lazy(n);
        const fn = FUNCTIONS[name];
        if (!fn) return err("#NAME?", `This lab does not support the function ${name}. It may exist in Excel; the lab only teaches the functions on its supported list.`);
        const args = n.args.map((a) => {
            const v = evalTree(a);
            return a.t === "blank" ? undefined : v;
        });
        // a range holding an error is handled by the function; a bare error argument stops the call, except for the IS functions
        if (name !== "ISERROR") for (const a of args) if (isErr(a)) return a;
        return fn(args.map((a) => (a === undefined ? undefined : a)));
    }

    function lazy(n) {
        const { name, args } = n;
        const ev = (i) => scalar(evalTree(args[i]));
        switch (name) {
            case "IF": {
                if (args.length < 2 || args.length > 3) return err("#VALUE!", "IF needs two or three arguments.");
                const c = toBool(ev(0));
                if (isErr(c)) return c;
                if (c) return ev(1);
                return args.length === 3 ? ev(2) : false;
            }
            case "IFS": {
                if (args.length < 2 || args.length % 2) return err("#VALUE!", "IFS needs pairs of a condition and a value.");
                for (let i = 0; i < args.length; i += 2) {
                    const c = toBool(ev(i));
                    if (isErr(c)) return c;
                    if (c) return ev(i + 1);
                }
                return err("#N/A", "No condition in IFS was true.");
            }
            case "IFERROR": { if (args.length !== 2) return err("#VALUE!", "IFERROR needs two arguments."); const v = ev(0); return isErr(v) ? ev(1) : v; }
            case "IFNA": { if (args.length !== 2) return err("#VALUE!", "IFNA needs two arguments."); const v = ev(0); return isErr(v) && v.code === "#N/A" ? ev(1) : v; }
            case "CHOOSE": {
                const i = toNumber(ev(0));
                if (isErr(i)) return i;
                const k = Math.trunc(i);
                return k < 1 || k >= args.length ? err("#VALUE!") : ev(k);
            }
            default: return err("#NAME?");
        }
    }

    return {
        value(addr) { const v = cellValue(addr); return isRange(v) ? null : v; },
        raw(addr) { const v = raw.get(addr); return v === undefined ? "" : String(v); },
        set(addr, text) { if (text === "" || text === null || text === undefined) raw.delete(addr); else raw.set(addr, text); cache = new Map(); },
        addresses() { return [...raw.keys()]; },
        /** Calculate a formula as if it were typed into `atAddr` (so a reference to that same cell is circular). */
        evaluate(formula, atAddr) {
            const before = raw.get(atAddr);
            this.set(atAddr, formula);
            const v = this.value(atAddr);
            this.set(atAddr, before);
            return v;
        }
    };

}

/** Text for a value as the grid shows it. */
export function display(v) {
    return isErr(v) ? v.code : toText(v);
}

export { parseAddress, addressOf, isErr };
