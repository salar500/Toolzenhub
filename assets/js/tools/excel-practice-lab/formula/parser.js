/* =========================================================
   ToolZen Hub
   Excel Practice Lab: formula tokenizer and parser

   An educational spreadsheet simulation, not Microsoft Excel. This file turns formula text into a syntax tree. It never runs the
   text as code: there is no eval and no Function. Pure functions, no DOM.

   Grammar (lowest to highest precedence, as in Excel):
     comparison  =  <>  <  <=  >  >=
     concat      &
     additive    +  -
     multiplicative  *  /
     power       ^
     percent     postfix %
     unary       -  +   (binds tighter than ^, so -2^2 is 4, as in Excel)
   Operands: numbers, "text" (a doubled "" is a quote), TRUE, FALSE, error literals (#N/A ...), references A1 $A$1 A$1 $A1,
   ranges A1:B5, brackets, and function calls NAME(arg, arg, ...). Arguments are separated by commas.

   Limits: 500 characters, 32 levels of nesting.
========================================================= */

export const MAX_FORMULA_LENGTH = 500;
export const MAX_DEPTH = 32;
export const MAX_COLUMN = 26 * 26 + 26; // up to column ZZ
export const MAX_ROW = 1000;

export class FormulaSyntaxError extends Error {}

const ERROR_LITERALS = ["#DIV/0!", "#N/A", "#VALUE!", "#REF!", "#NAME?", "#NUM!", "#NULL!"];
const REF = /^(\$?)([A-Za-z]{1,2})(\$?)(\d{1,4})$/;

export function columnToNumber(letters) {
    let n = 0;
    for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n;
}

export function numberToColumn(n) {
    let s = "";
    while (n > 0) {
        const r = (n - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
}

/** "B3" -> { col: 2, row: 3 }, or null when it is not a cell address. */
export function parseAddress(text) {
    const m = REF.exec(text);
    if (!m) return null;
    const col = columnToNumber(m[2]);
    const row = Number(m[4]);
    if (col < 1 || col > MAX_COLUMN || row < 1 || row > MAX_ROW) return null;
    return { col, row, absCol: m[1] === "$", absRow: m[3] === "$" };
}

export function addressOf(col, row) {
    return `${numberToColumn(col)}${row}`;
}

export function tokenize(text) {

    const tokens = [];
    let i = 0;

    while (i < text.length) {

        const ch = text[i];

        if (ch === " " || ch === "\t") { i += 1; continue; }

        if (ch === '"') {
            let j = i + 1;
            let value = "";
            for (;;) {
                if (j >= text.length) throw new FormulaSyntaxError("A text value starts with a quote but never ends. Close it with another double quote.");
                if (text[j] === '"') {
                    if (text[j + 1] === '"') { value += '"'; j += 2; continue; }
                    break;
                }
                value += text[j];
                j += 1;
            }
            tokens.push({ type: "str", value, start: i, end: j + 1 });
            i = j + 1;
            continue;
        }

        if (ch === "#") {
            const hit = ERROR_LITERALS.find((e) => text.slice(i, i + e.length).toUpperCase() === e);
            if (!hit) throw new FormulaSyntaxError("A # must start an error value such as #N/A.");
            tokens.push({ type: "err", value: hit, start: i, end: i + hit.length });
            i += hit.length;
            continue;
        }

        if (/[0-9.]/.test(ch)) {
            const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(text.slice(i));
            if (!m) throw new FormulaSyntaxError(`"${ch}" is not a valid number.`);
            tokens.push({ type: "num", value: Number(m[0]), start: i, end: i + m[0].length });
            i += m[0].length;
            continue;
        }

        if (/[A-Za-z_$]/.test(ch)) {
            const m = /^[$A-Za-z_][$A-Za-z0-9_.]*/.exec(text.slice(i));
            const word = m[0];
            const end = i + word.length;
            const next = text.slice(end).match(/^\s*(\()/);
            if (next && !word.includes("$")) {
                tokens.push({ type: "func", value: word.toUpperCase(), start: i, end });
            } else if (REF.test(word)) {
                tokens.push({ type: "ref", value: word, start: i, end });
            } else if (/^(TRUE|FALSE)$/i.test(word)) {
                tokens.push({ type: "bool", value: word.toUpperCase() === "TRUE", start: i, end });
            } else {
                tokens.push({ type: "name", value: word, start: i, end });
            }
            i = end;
            continue;
        }

        const two = text.slice(i, i + 2);
        if (two === "<=" || two === ">=" || two === "<>") {
            tokens.push({ type: "op", value: two, start: i, end: i + 2 });
            i += 2;
            continue;
        }

        if ("+-*/^&=<>%".includes(ch)) { tokens.push({ type: "op", value: ch, start: i, end: i + 1 }); i += 1; continue; }
        if (ch === "(" || ch === ")" || ch === "," || ch === ":") { tokens.push({ type: ch, value: ch, start: i, end: i + 1 }); i += 1; continue; }

        throw new FormulaSyntaxError(`The character "${ch}" is not allowed in a formula here.`);

    }

    return tokens;

}

/** Parse formula text that starts with "=". Returns the syntax tree, or throws FormulaSyntaxError with a plain-language message. */
export function parseFormula(source) {

    if (typeof source !== "string" || !source.startsWith("=")) throw new FormulaSyntaxError("A formula must start with an equals sign.");
    if (source.length > MAX_FORMULA_LENGTH) throw new FormulaSyntaxError(`This formula is longer than ${MAX_FORMULA_LENGTH} characters.`);

    const tokens = tokenize(source.slice(1));
    let pos = 0;

    const peek = () => tokens[pos];
    const take = () => tokens[pos++];
    const isOp = (...ops) => peek()?.type === "op" && ops.includes(peek().value);

    function expect(type, why) {
        const t = peek();
        if (!t || t.type !== type) throw new FormulaSyntaxError(why);
        pos += 1;
        return t;
    }

    function comparison(depth) {
        let left = concat(depth);
        while (isOp("=", "<>", "<", "<=", ">", ">=")) left = { t: "bin", op: take().value, l: left, r: concat(depth) };
        return left;
    }
    function concat(depth) {
        let left = additive(depth);
        while (isOp("&")) { take(); left = { t: "bin", op: "&", l: left, r: additive(depth) }; }
        return left;
    }
    function additive(depth) {
        let left = multiplicative(depth);
        while (isOp("+", "-")) left = { t: "bin", op: take().value, l: left, r: multiplicative(depth) };
        return left;
    }
    function multiplicative(depth) {
        let left = power(depth);
        while (isOp("*", "/")) left = { t: "bin", op: take().value, l: left, r: power(depth) };
        return left;
    }
    function power(depth) {
        let left = percent(depth);
        while (isOp("^")) { take(); left = { t: "bin", op: "^", l: left, r: percent(depth) }; }
        return left;
    }
    function percent(depth) {
        let x = unary(depth);
        while (isOp("%")) { take(); x = { t: "pct", x }; }
        return x;
    }
    function unary(depth) {
        if (isOp("-", "+")) {
            const op = take().value;
            return { t: "unary", op, x: unary(depth) };
        }
        return primary(depth);
    }

    function primary(depth) {

        if (depth > MAX_DEPTH) throw new FormulaSyntaxError(`This formula is nested more than ${MAX_DEPTH} levels deep.`);

        const t = take();

        if (!t) throw new FormulaSyntaxError("The formula ends too early: a value is missing at the end.");

        if (t.type === "num") return { t: "num", v: t.value };
        if (t.type === "str") return { t: "str", v: t.value };
        if (t.type === "bool") return { t: "bool", v: t.value };
        if (t.type === "err") return { t: "err", v: t.value };

        if (t.type === "(") {
            const inner = comparison(depth + 1);
            expect(")", "A bracket was opened but not closed. Add the missing closing bracket.");
            return inner;
        }

        if (t.type === "ref") {
            const a = parseAddress(t.value);
            if (!a) throw new FormulaSyntaxError(`${t.value} is not a cell this lab has (columns A to ZZ, rows 1 to ${MAX_ROW}).`);
            if (peek()?.type === ":") {
                take();
                const t2 = expect("ref", "A range needs a cell on both sides of the colon, like A1:A5.");
                const b = parseAddress(t2.value);
                if (!b) throw new FormulaSyntaxError(`${t2.value} is not a cell this lab has.`);
                return { t: "range", a, b };
            }
            return { t: "ref", ...a };
        }

        if (t.type === "func") {
            expect("(", `${t.value} must be followed by a bracket.`);
            const args = [];
            if (peek()?.type === ")") { take(); return { t: "call", name: t.value, args }; }
            for (;;) {
                // an empty argument (two commas in a row) is allowed by Excel for some functions; it is read as blank
                if (peek()?.type === "," || peek()?.type === ")") args.push({ t: "blank" });
                else args.push(comparison(depth + 1));
                const next = take();
                if (!next) throw new FormulaSyntaxError(`The bracket after ${t.value} is never closed. Add the missing closing bracket.`);
                if (next.type === ")") break;
                if (next.type !== ",") throw new FormulaSyntaxError(`Expected a comma or a closing bracket in ${t.value}, but found "${source.slice(1).slice(next.start, next.end)}".`);
            }
            return { t: "call", name: t.value, args };
        }

        if (t.type === "name") return { t: "name", v: t.value };

        const shown = source.slice(1).slice(t.start, t.end);
        throw new FormulaSyntaxError(`Unexpected "${shown}": a value was expected here.`);

    }

    if (tokens.length === 0) throw new FormulaSyntaxError("There is nothing after the equals sign.");

    const tree = comparison(0);

    if (pos < tokens.length) {
        const t = tokens[pos];
        const shown = source.slice(1).slice(t.start, t.end);
        throw new FormulaSyntaxError(t.type === ")" ? "There is a closing bracket without a matching opening bracket." : `Unexpected "${shown}" after a complete formula. A missing operator such as + or & between values?`);
    }

    return tree;

}

/**
 * What a formula becomes when it is copied dRow rows down and dCol columns right: relative parts move, parts with $ stay.
 * A reference that would move off the sheet becomes #REF!, as in Excel.
 */
export function shiftFormula(source, dRow, dCol) {

    if (!source.startsWith("=")) return source;

    const body = source.slice(1);
    let out = "";
    let last = 0;

    for (const t of tokenize(body)) {
        if (t.type !== "ref") continue;
        const a = parseAddress(t.value);
        if (!a) continue;
        const col = a.absCol ? a.col : a.col + dCol;
        const row = a.absRow ? a.row : a.row + dRow;
        out += body.slice(last, t.start);
        out += col < 1 || row < 1 || col > MAX_COLUMN || row > MAX_ROW ? "#REF!" : `${a.absCol ? "$" : ""}${numberToColumn(col)}${a.absRow ? "$" : ""}${row}`;
        last = t.end;
    }

    return "=" + out + body.slice(last);

}
