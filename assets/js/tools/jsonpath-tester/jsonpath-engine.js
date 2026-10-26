/* =========================================================
   ToolZen Hub
   JSONPath Tester: engine (RFC 9535, without match() and search())

   Pure functions: no DOM, network, storage, clock, randomness, eval or
   regular expressions built from user text. The query is parsed with a
   hand-written parser that follows the ABNF of RFC 9535 section 2, then
   evaluated over the shared lossless JSON tree (json-tree.js).

   What is deliberately NOT supported (DEC-JP-1): the match() and
   search() functions, because they would run a user-supplied regular
   expression. A query using them is refused with a clear message; the
   tool never claims full RFC 9535 conformance.

   Positions in errors are 1-based UTF-16 code unit offsets into the
   query text.
========================================================= */

import {
    parseJson,
    numberKey,
    serialize
} from "../json-tree/json-tree.js";

import {
    sideNotes
} from "../json-compare/json-compare-engine.js";


export const MAX_QUERY_CHARS = 1000;
export const MAX_DOCUMENT_CHARS = 1_000_000;
export const AUTO_DOCUMENT_CHARS = 200_000;
export const MAX_ROWS_SHOWN = 1000;
export const DISPLAY_VALUE_CHARS = 200;
export const MAX_WORKING_NODES = 100_000;
/* a safety bound on total node visits, so nested filters over a large document cannot hang the tab */
export const MAX_WORK = 4_000_000;
export const MAX_INTEGER = 9007199254740991;

export const EXAMPLE_DOCUMENT =
    '{ "store": {\n    "book": [\n      { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },\n      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },\n      { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },\n      { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }\n    ],\n    "bicycle": { "color": "red", "price": 399 }\n  }\n}';

export const EXAMPLE_QUERY = "$..book[?@.price<10]";

export const UNSUPPORTED_FUNCTIONS_MESSAGE =
    "match() and search() are not supported in this version.";

const FUNCTIONS = {
    length: { params: ["value"] },
    count: { params: ["nodes"] },
    value: { params: ["nodes"] }
};

const SELECTOR_WORDS = {
    name: "name selector",
    wild: "wildcard selector",
    index: "index selector",
    slice: "slice selector",
    filter: "filter selector"
};


/* =========================================================
   PARSER
========================================================= */

class QueryError extends Error {

    constructor(position, message) {
        super(message);
        this.position = position;
    }
}

const isDigit = (c) => c >= "0" && c <= "9";
const isAlpha = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
const isLower = (c) => c >= "a" && c <= "z";
const isBlank = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";

const describe = (text, i) => {

    if (i >= text.length) {
        return "the end of the query";
    }

    const cp = String.fromCodePoint(text.codePointAt(i));

    return cp.codePointAt(0) < 0x20 || cp === " "
        ? `a ${cp === " " ? "space" : "control character"}`
        : `"${cp}"`;
};

function isNameFirst(c) {

    if (c === undefined) {
        return false;
    }

    return isAlpha(c) || c === "_" || c.codePointAt(0) >= 0x80;
}

function parseQueryText(text) {

    let i = 0;

    const fail = (message, at = i) => {
        throw new QueryError(at + 1, message);
    };

    const skip = () => {
        while (i < text.length && isBlank(text[i])) {
            i++;
        }
    };

    const expect = (c, what) => {
        if (text[i] !== c) {
            fail(`Expected ${what || `"${c}"`}, found ${describe(text, i)}.`);
        }
        i++;
    };

    const peekIs = (s) => text.startsWith(s, i);

    /* ----- integers and numbers ----- */

    function readInt(label) {

        const start = i;

        if (text[i] === "-") {
            i++;
        }

        if (!isDigit(text[i] ?? "")) {
            fail(`Expected a number${label ? ` for the ${label}` : ""}, found ${describe(text, i)}.`);
        }

        const digitsStart = i;

        while (isDigit(text[i] ?? "")) {
            i++;
        }

        const digits = text.slice(digitsStart, i);

        if (digits.length > 1 && digits[0] === "0") {
            fail("A number may not have a leading zero.", digitsStart);
        }

        if (text[start] === "-" && digits === "0") {
            fail("-0 is not allowed here.", start);
        }

        const value = BigInt(text.slice(start, i));

        if (value > BigInt(MAX_INTEGER) || value < -BigInt(MAX_INTEGER)) {
            fail(`The integer ${text.slice(start, i)} is outside the range -9007199254740991 to 9007199254740991.`, start);
        }

        return Number(value);
    }

    function readNumberLiteral() {

        const start = i;

        if (text[i] === "-") {
            i++;
        }

        if (!isDigit(text[i] ?? "")) {
            fail(`Expected a digit, found ${describe(text, i)}.`);
        }

        const digitsStart = i;

        while (isDigit(text[i] ?? "")) {
            i++;
        }

        if (i - digitsStart > 1 && text[digitsStart] === "0") {
            fail("A number may not have a leading zero.", digitsStart);
        }

        if (text[i] === ".") {

            i++;

            if (!isDigit(text[i] ?? "")) {
                fail(`Expected a digit after the decimal point, found ${describe(text, i)}.`);
            }

            while (isDigit(text[i] ?? "")) {
                i++;
            }
        }

        if (text[i] === "e" || text[i] === "E") {

            i++;

            if (text[i] === "+" || text[i] === "-") {
                i++;
            }

            if (!isDigit(text[i] ?? "")) {
                fail(`Expected a digit in the exponent, found ${describe(text, i)}.`);
            }

            while (isDigit(text[i] ?? "")) {
                i++;
            }
        }

        const literal = text.slice(start, i);

        try {
            const { key, digits } = numberKey(literal);
            return { t: "number", text: literal, key, digits };
        } catch (problem) {
            return fail(`The number ${literal.length > 30 ? literal.slice(0, 30) + "…" : literal} ${problem.message}.`, start);
        }
    }

    /* ----- strings ----- */

    function readString() {

        const quote = text[i];
        const start = i;

        i++;

        let out = "";

        for (;;) {

            if (i >= text.length) {
                fail("The string is never closed.", start);
            }

            const c = text[i];

            if (c === quote) {
                i++;
                return out;
            }

            if (c === "\\") {

                const e = text[i + 1];

                if (e === "u") {

                    const unit = readHex4(i + 2);

                    if (unit >= 0xDC00 && unit <= 0xDFFF) {
                        fail("A low surrogate escape must follow a high surrogate escape.", i);
                    }

                    if (unit >= 0xD800 && unit <= 0xDBFF) {

                        if (!(text[i + 6] === "\\" && text[i + 7] === "u")) {
                            fail("A high surrogate escape must be followed by a low surrogate escape.", i);
                        }

                        const low = readHex4(i + 8);

                        if (!(low >= 0xDC00 && low <= 0xDFFF)) {
                            fail("A high surrogate escape must be followed by a low surrogate escape.", i);
                        }

                        out += String.fromCharCode(unit, low);
                        i += 12;
                        continue;
                    }

                    out += String.fromCharCode(unit);
                    i += 6;
                    continue;
                }

                const map = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", "/": "/", "\\": "\\" };

                if (e !== undefined && Object.prototype.hasOwnProperty.call(map, e)) {
                    out += map[e];
                    i += 2;
                    continue;
                }

                if (e === quote) {
                    out += quote;
                    i += 2;
                    continue;
                }

                fail(`"\\${e === undefined ? "" : e}" is not a valid escape here.`, i);
            }

            const cp = text.codePointAt(i);

            if (cp < 0x20) {
                fail("A control character in a string must be written as an escape.", i);
            }

            if (cp >= 0xD800 && cp <= 0xDFFF) {
                fail("The string contains an unpaired surrogate.", i);
            }

            const ch = String.fromCodePoint(cp);

            out += ch;
            i += ch.length;
        }
    }

    function readHex4(at) {

        const hex = text.slice(at, at + 4);

        for (let k = 0; k < 4; k++) {
            if (!/[0-9a-fA-F]/.test(hex[k] ?? "")) {
                fail("\\u must be followed by four hexadecimal digits.", at - 2);
            }
        }

        return parseInt(hex, 16);
    }

    /* ----- selectors ----- */

    function readMemberShorthand() {

        const start = i;

        if (!isNameFirst(text[i] === undefined ? undefined : String.fromCodePoint(text.codePointAt(i)))) {
            fail(`Expected a member name, found ${describe(text, i)}.`);
        }

        while (i < text.length) {

            const cp = text.codePointAt(i);
            const ch = String.fromCodePoint(cp);

            if (cp >= 0xD800 && cp <= 0xDFFF) {
                fail("The name contains an unpaired surrogate.", i);
            }

            if (!(isNameFirst(ch) || isDigit(ch))) {
                break;
            }

            i += ch.length;
        }

        return text.slice(start, i);
    }

    function readSelector() {

        const c = text[i];

        if (c === "'" || c === '"') {
            return { k: "name", name: readString() };
        }

        if (c === "*") {
            i++;
            return { k: "wild" };
        }

        if (c === "?") {
            i++;
            skip();
            return { k: "filter", expr: parseOr(false) };
        }

        if (c === ":" || c === "-" || isDigit(c ?? "")) {

            let first = null;

            if (c !== ":") {
                first = readInt("index");
            }

            const afterFirst = i;

            skip();

            if (text[i] !== ":") {

                i = afterFirst;

                if (first === null) {
                    fail(`Expected a selector, found ${describe(text, i)}.`);
                }

                return { k: "index", i: first };
            }

            i++;
            skip();

            let end = null;
            let step = null;

            if (text[i] === "-" || isDigit(text[i] ?? "")) {
                end = readInt("slice end");
                skip();
            }

            if (text[i] === ":") {

                i++;
                skip();

                if (text[i] === "-" || isDigit(text[i] ?? "")) {
                    step = readInt("slice step");
                }
            }

            return { k: "slice", start: first, end, step };
        }

        if (c === "(") {
            fail("Script expressions such as [(@.length-1)] are not part of RFC 9535. Use a negative index such as [-1], or a ?filter.");
        }

        return fail(`Expected a selector (a name in quotes, *, a number, a slice or ?filter), found ${describe(text, i)}.`);
    }

    function readBracketed() {

        expect("[");
        skip();

        const selectors = [readSelector()];

        skip();

        while (text[i] === ",") {
            i++;
            skip();
            selectors.push(readSelector());
            skip();
        }

        if (text[i] !== "]") {
            fail(`Expected "," or "]", found ${describe(text, i)}.`);
        }

        i++;

        return selectors;
    }

    /* a segment, or null when the text at i does not start one */
    function readSegment() {

        const start = i;

        if (peekIs("..")) {

            i += 2;

            let selectors;

            if (text[i] === "[") {
                selectors = readBracketed();
            } else if (text[i] === "*") {
                i++;
                selectors = [{ k: "wild" }];
            } else {

                if (i >= text.length) {
                    fail('A bare ".." with nothing after it is not part of RFC 9535. Follow it with a name, "*" or "[...]".');
                }

                if (!isNameFirst(String.fromCodePoint(text.codePointAt(i)))) {
                    fail(`Expected a name, "*" or "[" after "..", found ${describe(text, i)}.`);
                }

                selectors = [{ k: "name", name: readMemberShorthand() }];
            }

            return { descendant: true, selectors, text: text.slice(start, i) };
        }

        if (text[i] === ".") {

            i++;

            let selectors;

            if (text[i] === "*") {
                i++;
                selectors = [{ k: "wild" }];
            } else {

                if (i >= text.length) {
                    fail('Expected a name or "*" after ".", found the end of the query.');
                }

                if (text[i] === "[" || text[i] === "'" || text[i] === '"') {
                    fail(`Expected a name or "*" after ".", found ${describe(text, i)}. Write ["name"] without the dot.`);
                }

                selectors = [{ k: "name", name: readMemberShorthand() }];
            }

            return { descendant: false, selectors, text: text.slice(start, i) };
        }

        if (text[i] === "[") {
            return { descendant: false, selectors: readBracketed(), text: text.slice(start, i) };
        }

        return null;
    }

    function readSegments(allowBlankBefore) {

        const segments = [];

        for (;;) {

            const at = i;

            if (allowBlankBefore) {
                skip();
            }

            const segment = readSegment();

            if (segment === null) {
                i = at;
                return segments;
            }

            segments.push(segment);
        }
    }

    /* ----- queries ----- */

    function readQuery(root) {

        const start = i;

        i++;

        const segments = readSegments(true);

        return { root, segments, start, end: i };
    }

    const isSingular = (q) =>
        q.segments.every((s) =>
            !s.descendant && s.selectors.length === 1 && (s.selectors[0].k === "name" || s.selectors[0].k === "index"));

    /* ----- filter expressions ----- */

    function readIdentifier() {

        const start = i;

        while (i < text.length && (isLower(text[i]) || isDigit(text[i]) || text[i] === "_")) {
            i++;
        }

        return text.slice(start, i);
    }

    function readFunction(name, at) {

        if (name === "match" || name === "search") {
            fail(UNSUPPORTED_FUNCTIONS_MESSAGE, at);
        }

        const spec = Object.prototype.hasOwnProperty.call(FUNCTIONS, name) ? FUNCTIONS[name] : null;

        if (!spec) {
            fail(`Unknown function ${name}(). RFC 9535 defines length(), count(), value(), match() and search().`, at);
        }

        expect("(");
        skip();

        const args = [];

        if (text[i] !== ")") {

            for (;;) {

                args.push(readArgument());
                skip();

                if (text[i] === ",") {
                    i++;
                    skip();
                    continue;
                }

                break;
            }
        }

        if (text[i] !== ")") {
            fail(`Expected "," or ")", found ${describe(text, i)}.`);
        }

        i++;

        if (args.length !== spec.params.length) {
            fail(`${name}() takes ${spec.params.length} argument${spec.params.length === 1 ? "" : "s"}, but ${args.length} ${args.length === 1 ? "was" : "were"} given.`, at);
        }

        args.forEach((arg, n) => {

            const want = spec.params[n];

            if (want === "value") {

                if (arg.t === "lit" || arg.t === "fn") {
                    return;
                }

                if (arg.t === "query") {

                    if (!isSingular(arg.q)) {
                        fail(`${name}() needs a single value, but this query can select several nodes. Use a query with only names and indexes.`, at);
                    }

                    return;
                }

                fail(`${name}() needs a value, not a true/false test.`, at);
            }

            if (arg.t !== "query") {
                fail(`${name}() needs a query such as @.items, not a ${arg.t === "lit" ? "literal" : "value"}.`, at);
            }
        });

        return { t: "fn", name, args, at };
    }

    /* an operand: a literal, a query or a function call; returns null when none starts here */
    function readOperand() {

        const c = text[i];

        if (c === "'" || c === '"') {
            return { t: "lit", node: { t: "string", v: readString() } };
        }

        if (c === "-" || isDigit(c ?? "")) {
            return { t: "lit", node: readNumberLiteral() };
        }

        if (c === "@") {
            return { t: "query", q: readQuery("@") };
        }

        if (c === "$") {
            return { t: "query", q: readQuery("$") };
        }

        if (isLower(c ?? "")) {

            const at = i;
            const name = readIdentifier();

            if (text[i] === "(") {
                i = at + name.length;
                return readFunction(name, at);
            }

            if (name === "true") {
                return { t: "lit", node: { t: "boolean", v: true } };
            }

            if (name === "false") {
                return { t: "lit", node: { t: "boolean", v: false } };
            }

            if (name === "null") {
                return { t: "lit", node: { t: "null" } };
            }

            fail(`Expected a function call, true, false or null, found "${name}".`, at);
        }

        return null;
    }

    function readComparisonOp() {

        for (const op of ["==", "!=", "<=", ">=", "<", ">"]) {
            if (peekIs(op)) {
                i += op.length;
                return op;
            }
        }

        return null;
    }

    function toTest(operand, at) {

        if (operand.t === "query") {
            return { t: "test", q: operand.q };
        }

        if (operand.t === "fn") {
            return fail(`${operand.name}() returns a value, not a true/false result. Compare it with ==, <, > and so on.`, at);
        }

        return fail("A literal cannot be used on its own as a filter. Compare it with ==, <, > and so on.", at);
    }

    function checkComparable(operand, at) {

        if (operand.t === "query" && !isSingular(operand.q)) {
            fail("A comparison needs a single value, but this query can select several nodes. Use a query with only names and indexes, or count() or value().", at);
        }
    }

    function parseBasic(allowBare) {

        const at = i;

        if (text[i] === "!") {

            i++;
            skip();

            if (text[i] === "(") {
                return { t: "not", e: parseParen() };
            }

            const operand = readOperand();

            if (operand === null) {
                fail(`Expected a query, a function call or "(" after "!", found ${describe(text, i)}.`);
            }

            const afterOperand = i;

            skip();

            if (readComparisonOp() !== null) {
                fail('"!" cannot be applied to a comparison. Put the comparison in parentheses: !(a == b).', at);
            }

            i = afterOperand;

            return { t: "not", e: toTest(operand, at) };
        }

        if (text[i] === "(") {
            return parseParen();
        }

        const operand = readOperand();

        if (operand === null) {
            fail(`Expected a filter expression, found ${describe(text, i)}.`);
        }

        const afterOperand = i;

        skip();

        const opAt = i;
        const op = readComparisonOp();

        if (op !== null) {

            checkComparable(operand, at);
            skip();

            const right = readOperand();

            if (right === null) {
                fail(`Expected a value to compare with, found ${describe(text, i)}.`);
            }

            checkComparable(right, opAt);

            return { t: "cmp", op, l: operand, r: right };
        }

        i = afterOperand;

        if (allowBare) {
            return { t: "bare", operand, at };
        }

        return toTest(operand, at);
    }

    function parseParen() {

        expect("(");
        skip();

        const inner = parseOr(false);

        skip();
        expect(")", '")"');

        return inner;
    }

    function parseAnd(allowBare) {

        const items = [parseBasic(allowBare)];

        for (;;) {

            const at = i;

            skip();

            if (!peekIs("&&")) {
                i = at;
                break;
            }

            i += 2;
            skip();
            items.push(parseBasic(true));
        }

        if (items.length === 1) {
            return items[0];
        }

        return { t: "and", items: items.map((e) => e.t === "bare" ? toTest(e.operand, e.at) : e) };
    }

    function parseOr(allowBare) {

        const items = [parseAnd(allowBare)];

        for (;;) {

            const at = i;

            skip();

            if (!peekIs("||")) {
                i = at;
                break;
            }

            i += 2;
            skip();
            items.push(parseAnd(true));
        }

        if (items.length === 1) {
            return items[0];
        }

        return { t: "or", items: items.map((e) => e.t === "bare" ? toTest(e.operand, e.at) : e) };
    }

    function readArgument() {

        const at = i;
        const e = parseOr(true);

        if (e.t === "bare") {
            return e.operand;
        }

        return fail("A function argument must be a value or a query, not a true/false expression.", at);
    }

    /* ----- entry ----- */

    if (text[0] !== "$") {

        if (text.trim() !== text) {
            fail("Remove the spaces before and after the query: it must start with $ and end at the last segment.", 0);
        }

        fail(`A query must start with "$", found ${describe(text, 0)}.`, 0);
    }

    const query = readQuery("$");

    if (i < text.length) {

        if (text.trim().length !== text.length && text.slice(query.end).trim() === "") {
            fail("Remove the spaces after the query.", query.end);
        }

        skip();
        fail(`Expected a segment such as .name, ..name or ["name"], found ${describe(text, i)}.`);
    }

    return query;
}

/** { ok: true, query } or { ok: false, position, message } */
export function parseQuery(text) {

    try {
        return { ok: true, query: parseQueryText(text) };
    } catch (problem) {

        if (problem instanceof QueryError) {
            return { ok: false, position: problem.position, message: problem.message };
        }

        throw problem;
    }
}


/* =========================================================
   EVALUATION
========================================================= */

class LimitError extends Error {}

const NOTHING = undefined;

function numberParts(node) {

    if (node.key === "0") {
        return { zero: true };
    }

    const m = /^(-?)([0-9]+)e(-?[0-9]+)$/.exec(node.key);

    return {
        zero: false,
        negative: m[1] === "-",
        digits: m[2],
        adjusted: BigInt(m[3]) + BigInt(m[2].length)
    };
}

/** -1, 0 or 1: exact decimal comparison of two number nodes */
function compareNumbers(a, b) {

    if (a.key === b.key) {
        return 0;
    }

    const x = numberParts(a);
    const y = numberParts(b);

    if (x.zero) {
        return y.negative ? 1 : -1;
    }

    if (y.zero) {
        return x.negative ? -1 : 1;
    }

    if (x.negative !== y.negative) {
        return x.negative ? -1 : 1;
    }

    let magnitude;

    if (x.adjusted !== y.adjusted) {
        magnitude = x.adjusted < y.adjusted ? -1 : 1;
    } else {

        const length = Math.max(x.digits.length, y.digits.length);
        const p = x.digits.padEnd(length, "0");
        const q = y.digits.padEnd(length, "0");

        magnitude = p === q ? 0 : p < q ? -1 : 1;
    }

    return x.negative ? -magnitude : magnitude;
}

/** order by code points (not UTF-16 code units) */
function compareStrings(a, b) {

    let i = 0;
    let j = 0;

    while (i < a.length && j < b.length) {

        const x = a.codePointAt(i);
        const y = b.codePointAt(j);

        if (x !== y) {
            return x < y ? -1 : 1;
        }

        i += x > 0xFFFF ? 2 : 1;
        j += y > 0xFFFF ? 2 : 1;
    }

    if (i < a.length) {
        return 1;
    }

    return j < b.length ? -1 : 0;
}

function equalNodes(a, b) {

    if (a === b) {
        return true;
    }

    if (a.t !== b.t) {
        return false;
    }

    switch (a.t) {
        case "object": {

            if (a.map.size !== b.map.size) {
                return false;
            }

            for (const [k, v] of a.map) {

                const other = b.map.get(k);

                if (other === undefined || !equalNodes(v, other)) {
                    return false;
                }
            }

            return true;
        }
        case "array": {

            if (a.items.length !== b.items.length) {
                return false;
            }

            for (let n = 0; n < a.items.length; n++) {
                if (!equalNodes(a.items[n], b.items[n])) {
                    return false;
                }
            }

            return true;
        }
        case "string":
            return a.v === b.v;
        case "number":
            return a.key === b.key;
        case "boolean":
            return a.v === b.v;
        default:
            return true;
    }
}

function less(l, r) {

    if (l === NOTHING || r === NOTHING) {
        return false;
    }

    if (l.t === "number" && r.t === "number") {
        return compareNumbers(l, r) < 0;
    }

    if (l.t === "string" && r.t === "string") {
        return compareStrings(l.v, r.v) < 0;
    }

    return false;
}

function equal(l, r) {

    if (l === NOTHING && r === NOTHING) {
        return true;
    }

    if (l === NOTHING || r === NOTHING) {
        return false;
    }

    return equalNodes(l, r);
}

function compare(op, l, r) {

    switch (op) {
        case "==": return equal(l, r);
        case "!=": return !equal(l, r);
        case "<": return less(l, r);
        case ">": return less(r, l);
        case "<=": return less(l, r) || equal(l, r);
        default: return less(r, l) || equal(l, r);
    }
}

function numberNode(n) {

    const text = String(n);

    return { t: "number", text, ...numberKey(text) };
}

function codePointLength(s) {

    let n = 0;

    for (let i = 0; i < s.length; i++) {

        const u = s.charCodeAt(i);

        if (u >= 0xD800 && u <= 0xDBFF && i + 1 < s.length) {

            const v = s.charCodeAt(i + 1);

            if (v >= 0xDC00 && v <= 0xDFFF) {
                i++;
            }
        }

        n++;
    }

    return n;
}

/* a located node: the node and a link to its parent location (for the path) */
const locate = (node, parent, seg) => ({ node, parent, seg });

function pathOf(loc) {

    const out = [];

    for (let p = loc; p.parent !== null; p = p.parent) {
        out.push(p.seg);
    }

    return out.reverse();
}

function evaluate(query, rootNode, ctx, currentLoc) {

    let current = [query.root === "$" ? ctx.rootLoc : currentLoc];
    const counts = [];

    query.segments.forEach((segment, index) => {

        const before = current.length;

        if (ctx.top === query) {
            ctx.segmentNumber = index + 1;
        }

        current = applySegment(segment, current, ctx);

        counts.push({ in: before, out: current.length });
    });

    return { nodes: current, counts };
}

function applySegment(segment, input, ctx) {

    const out = [];

    const push = (loc) => {

        if (++ctx.work > MAX_WORK) {
            throw new LimitError(`The query needed too much work (more than ${MAX_WORK.toLocaleString("en-US")} steps) at segment ${ctx.segmentNumber}; narrow it.`);
        }

        out.push(loc);

        if (out.length > MAX_WORKING_NODES) {
            throw new LimitError(`The query selected more than ${MAX_WORKING_NODES.toLocaleString("en-US")} nodes at segment ${ctx.segmentNumber}; narrow it.`);
        }
    };

    for (const loc of input) {

        if (!segment.descendant) {
            select(segment.selectors, loc, push, ctx);
            continue;
        }

        const stack = [loc];

        while (stack.length) {

            const here = stack.pop();

            select(segment.selectors, here, push, ctx);

            const n = here.node;

            if (n.t === "array") {
                for (let k = n.items.length - 1; k >= 0; k--) {
                    stack.push(locate(n.items[k], here, k));
                }
            } else if (n.t === "object") {

                const entries = [...n.map];

                for (let k = entries.length - 1; k >= 0; k--) {
                    stack.push(locate(entries[k][1], here, entries[k][0]));
                }
            }
        }
    }

    return out;
}

function children(loc) {

    const n = loc.node;

    if (n.t === "array") {
        return n.items.map((item, k) => locate(item, loc, k));
    }

    if (n.t === "object") {
        return [...n.map].map(([k, v]) => locate(v, loc, k));
    }

    return [];
}

function normalizeIndex(i, length) {
    return i >= 0 ? i : length + i;
}

function sliceIndexes(sel, length) {

    const step = sel.step === null ? 1 : sel.step;

    if (step === 0) {
        return [];
    }

    const start = sel.start === null ? (step > 0 ? 0 : length - 1) : sel.start;
    const end = sel.end === null ? (step > 0 ? length : -length - 1) : sel.end;

    const nStart = normalizeIndex(start, length);
    const nEnd = normalizeIndex(end, length);

    const out = [];

    if (step > 0) {

        const lower = Math.min(Math.max(nStart, 0), length);
        const upper = Math.min(Math.max(nEnd, 0), length);

        for (let i = lower; i < upper; i += step) {
            out.push(i);
        }
    } else {

        const upper = Math.min(Math.max(nStart, -1), length - 1);
        const lower = Math.min(Math.max(nEnd, -1), length - 1);

        for (let i = upper; lower < i; i += step) {
            out.push(i);
        }
    }

    return out;
}

function select(selectors, loc, push, ctx) {

    const n = loc.node;

    for (const sel of selectors) {

        switch (sel.k) {

            case "name":
                if (n.t === "object") {

                    const child = n.map.get(sel.name);

                    if (child !== undefined) {
                        push(locate(child, loc, sel.name));
                    }
                }
                break;

            case "wild":
                for (const child of children(loc)) {
                    push(child);
                }
                break;

            case "index":
                if (n.t === "array") {

                    const k = normalizeIndex(sel.i, n.items.length);

                    if (k >= 0 && k < n.items.length) {
                        push(locate(n.items[k], loc, k));
                    }
                }
                break;

            case "slice":
                if (n.t === "array") {
                    for (const k of sliceIndexes(sel, n.items.length)) {
                        push(locate(n.items[k], loc, k));
                    }
                }
                break;

            default:
                for (const child of children(loc)) {
                    if (test(sel.expr, child, ctx)) {
                        push(child);
                    }
                }
        }
    }
}

function operandValue(operand, loc, ctx) {

    switch (operand.t) {

        case "lit":
            return operand.node;

        case "query": {

            const found = evaluate(operand.q, null, ctx, loc).nodes;

            return found.length === 1 ? found[0].node : NOTHING;
        }

        default:
            return callFunction(operand, loc, ctx);
    }
}

function callFunction(fn, loc, ctx) {

    const arg = fn.args[0];

    if (fn.name === "length") {

        const v = operandValue(arg, loc, ctx);

        if (v === NOTHING) {
            return NOTHING;
        }

        if (v.t === "string") {
            return numberNode(codePointLength(v.v));
        }

        if (v.t === "array") {
            return numberNode(v.items.length);
        }

        if (v.t === "object") {
            return numberNode(v.map.size);
        }

        return NOTHING;
    }

    const found = evaluate(arg.q, null, ctx, loc).nodes;

    if (fn.name === "count") {
        return numberNode(found.length);
    }

    return found.length === 1 ? found[0].node : NOTHING;
}

function test(expr, loc, ctx) {

    switch (expr.t) {

        case "or":
            return expr.items.some((e) => test(e, loc, ctx));

        case "and":
            return expr.items.every((e) => test(e, loc, ctx));

        case "not":
            return !test(expr.e, loc, ctx);

        case "cmp":
            return compare(expr.op, operandValue(expr.l, loc, ctx), operandValue(expr.r, loc, ctx));

        case "test":
            return evaluate(expr.q, null, ctx, loc).nodes.length > 0;

        default:
            /* a function used as a test: only a value-returning function can get here, and the parser rejects that */
            return false;
    }
}


/* =========================================================
   TRACE AND RESULT
========================================================= */

function segmentKind(segment) {

    const kinds = [...new Set(segment.selectors.map((s) => SELECTOR_WORDS[s.k]))];
    const base = segment.descendant ? "descendant segment" : "child segment";

    if (segment.selectors.length === 1) {
        return `${base}, ${kinds[0]}`;
    }

    return `${base}, ${segment.selectors.length} selectors (${kinds.join(", ")})`;
}

const plural = (n, one, many) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export function countText(n) {
    return `${plural(n, "node", "nodes")} matched.`;
}

export function truncate(text, limit = DISPLAY_VALUE_CHARS) {
    return text.length > limit ? text.slice(0, limit - 1) + "…" : text;
}

/** the matched values as one JSON array, in result order */
export function valuesText(result) {
    return "[" + result.nodes.map((n) => serialize(n.node)).join(",") + "]";
}

/**
 * Evaluate a query on a document.
 *
 *   { state: "blocked", document: {status,...}, query: {status,...} }
 *       when the document is empty/too large/invalid/refused or the query is
 *       empty/too long/malformed (the query status says which)
 *   { state: "limit", message, document, query, notes }
 *   { state: "done", nodes: [{ path, node }], trace, emptyAt, notes, document, query }
 */
export function evaluateQuery(documentText, queryText) {

    const doc = parseJson(documentText, MAX_DOCUMENT_CHARS);
    const raw = String(queryText ?? "");

    const documentStatus = doc.state === "valid" ? { status: "valid" } : { status: doc.state, ...doc };

    let queryStatus;
    let query = null;

    if (raw.trim() === "") {
        queryStatus = { status: "empty" };
    } else if (raw.length > MAX_QUERY_CHARS) {
        queryStatus = { status: "too-large", limit: MAX_QUERY_CHARS };
    } else {

        const parsed = parseQuery(raw);

        if (parsed.ok) {
            query = parsed.query;
            queryStatus = { status: "valid" };
        } else {
            queryStatus = { status: "invalid", position: parsed.position, message: parsed.message };
        }
    }

    if (doc.state !== "valid" || query === null) {
        return { state: "blocked", document: documentStatus, query: queryStatus };
    }

    const notes = sideNotes("Document", doc);
    const ctx = {
        rootLoc: locate(doc.root, null, null),
        work: 0,
        segmentNumber: 1,
        top: query
    };

    let run;

    try {
        run = evaluate(query, doc.root, ctx, ctx.rootLoc);
    } catch (problem) {

        if (problem instanceof LimitError) {
            return { state: "limit", message: problem.message, document: documentStatus, query: queryStatus, notes };
        }

        throw problem;
    }

    const trace = query.segments.map((segment, index) => ({
        text: segment.text,
        kind: segmentKind(segment),
        in: run.counts[index].in,
        out: run.counts[index].out
    }));

    const nodes = run.nodes.map((loc) => ({ path: pathOf(loc), node: loc.node }));
    const emptyAt = nodes.length === 0 ? trace.findIndex((t) => t.out === 0) : -1;

    return { state: "done", nodes, trace, emptyAt, notes, document: documentStatus, query: queryStatus };
}
