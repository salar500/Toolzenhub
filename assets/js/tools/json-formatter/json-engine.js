/* =========================================================
   ToolZen Hub
   JSON Formatter & Validator: the checking and layout rules

   Pure: no DOM, no clock. Strict JSON (RFC 8259) only.

   WHY IT HAS ITS OWN SCANNER
       JSON.parse() says whether text is valid, but its error
       wording and position differ between browsers (and some give
       no position at all). This scanner reads the text once, left to
       right, and reports the SAME message, offset, line and column
       in every browser. It does not guess what the writer meant.
       The tests cross-check its yes/no answer against JSON.parse.

   WHY FORMAT AND MINIFY ARE NOT PARSE + STRINGIFY
       JSON.parse + JSON.stringify would silently change the data:
       1.0 becomes 1, 12345678901234567890 is rounded, 1e999 becomes
       null, "é" is rewritten, a duplicate key is dropped and keys
       such as "10" move ahead of "b". Here the layout is rebuilt from
       the scanned tokens and every number and string is copied
       exactly as written, so only the whitespace between tokens
       changes. Key order and duplicate keys are kept.

   WHAT IT DOES NOT DO
       No repair, no guessing, no JSON5 or comments, no schema
       validation. A duplicate key or a number JavaScript cannot hold
       exactly is valid JSON, so it is reported as a NOTE, not an error.

   Offsets are positions in the text as JavaScript counts it
   (UTF-16 code units, from 0). Lines and columns count from 1; a
   column counts characters, not code units.
========================================================= */

/* the largest input the tool works on, in characters */
export const MAX_CHARS = 2_000_000;

/* the largest input checked automatically while typing */
export const LIVE_MAX_CHARS = 200_000;

/* containers nested deeper than this are refused (no recursion is used, the limit keeps the layout sane) */
export const MAX_DEPTH = 500;

const MAX_NOTES = 50;

const INDENT = "  ";


/* =========================================================
   LOCATION AND CONTEXT
========================================================= */

/* 1-based line and column of an offset */
export function locate(text, offset) {

    let line = 1;
    let lineStart = 0;

    for (let k = 0; k < offset && k < text.length; k++) {
        if (text.charCodeAt(k) === 10) {
            line++;
            lineStart = k + 1;
        }
    }

    const column = [...text.slice(lineStart, offset)].length + 1;

    return { line, column, lineStart };

}

function lineBounds(text, lineStart) {

    let end = text.indexOf("\n", lineStart);

    if (end === -1) {
        end = text.length;
    }

    if (end > lineStart && text.charCodeAt(end - 1) === 13) {
        end--;
    }

    return { start: lineStart, end };

}

const isLow = (code) => code >= 0xdc00 && code <= 0xdfff;

/* a short, single-line, display-safe piece of a line; `caret` is the offset into it for the marker */
function clip(lineText, focus) {

    const WIDTH = 72;

    let start = 0;
    let end = lineText.length;

    if (end > WIDTH) {

        start = Math.max(0, Math.min(focus - 36, end - WIDTH));
        end = Math.min(end, start + WIDTH);

        if (start > 0 && isLow(lineText.charCodeAt(start))) {
            start++;
        }

        if (end < lineText.length && isLow(lineText.charCodeAt(end))) {
            end--;
        }

    }

    const lead = start > 0 ? "…" : "";
    const tail = end < lineText.length ? "…" : "";

    const shown = lineText.slice(start, end).replace(/[\t\u0000-\u001f\u007f]/g, " ");

    return {
        text: lead + shown + tail,
        caret: lead.length + [...lineText.slice(start, Math.max(start, focus))].length
    };

}

/*
 * The lines around an offset, as plain text with a marker under the
 * exact spot:
 *
 *   2 |   "b": 2
 *   3 |   "c": 3,
 *     |   ^
 */
export function contextOf(text, offset) {

    const here = locate(text, offset);

    const bounds = lineBounds(text, here.lineStart);

    const rows = [];

    /* the line before */
    if (here.lineStart > 0) {

        let prevStart = text.lastIndexOf("\n", here.lineStart - 2) + 1;

        const prev = lineBounds(text, prevStart);

        rows.push({ number: here.line - 1, text: clip(text.slice(prev.start, prev.end), 0).text });

    }

    const focus = Math.min(offset, bounds.end) - bounds.start;

    const main = clip(text.slice(bounds.start, bounds.end), focus);

    rows.push({ number: here.line, text: main.text, caret: main.caret });

    /* the line after */
    if (bounds.end < text.length) {

        const nextStart = text.indexOf("\n", bounds.end) + 1;

        if (nextStart > 0 && nextStart <= text.length) {

            const next = lineBounds(text, nextStart);

            if (nextStart < text.length || next.end > nextStart) {
                rows.push({ number: here.line + 1, text: clip(text.slice(next.start, next.end), 0).text });
            }

        }

    }

    const width = String(rows[rows.length - 1].number).length;

    const lines = [];

    for (const row of rows) {

        lines.push(`${String(row.number).padStart(width)} | ${row.text}`);

        if (row.caret !== undefined) {
            lines.push(`${" ".repeat(width)} | ${" ".repeat(row.caret)}^`);
        }

    }

    return lines.join("\n");

}


/* =========================================================
   WHAT A CHARACTER IS CALLED IN A MESSAGE
========================================================= */

const NAMED = {
    " ": "a non-breaking space (U+00A0)",
    "﻿": "a byte order mark (U+FEFF)",
    "“": "a curly quote (“)",
    "”": "a curly quote (”)",
    "‘": "a curly quote (‘)",
    "’": "a curly quote (’)"
};

function describe(text, i) {

    const ch = String.fromCodePoint(text.codePointAt(i));

    if (NAMED[ch]) {
        return NAMED[ch];
    }

    const code = ch.codePointAt(0);

    if (code < 0x20 || code === 0x7f || /\s/u.test(ch)) {
        return `the character U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
    }

    return `"${ch}"`;

}

const hint = (text, i) =>
    /[ ﻿“”‘’]/.test(text[i])
        ? " JSON allows only plain spaces, tabs and line breaks between values, and straight double quotes (\") around text."
        : "";


/* =========================================================
   THE SCANNER
========================================================= */

class Fail {

    constructor(message, offset) {
        this.message = message;
        this.offset = offset;
    }

}

const fail = (message, offset) => {
    throw new Fail(message, offset);
};

const WORD = /[A-Za-z_$][A-Za-z0-9_$]*/y;

const isDigit = (code) => code >= 48 && code <= 57;

const closerOf = { "{": "}", "[": "]" };

function readString(text, i) {

    const n = text.length;

    for (let j = i + 1; j < n; j++) {

        const c = text.charCodeAt(j);

        if (c === 34) {
            return j + 1;
        }

        if (c === 92) {

            const e = text[j + 1];

            if (e === undefined) {
                break;
            }

            if ('"\\/bfnrt'.includes(e)) {
                j++;
                continue;
            }

            if (e === "u") {

                if (!/^[0-9a-fA-F]{4}$/.test(text.slice(j + 2, j + 6))) {
                    fail("Invalid \\u escape: it needs exactly four hex digits, such as \\u00e9.", j);
                }

                j += 5;
                continue;

            }

            fail(`Invalid escape "\\${e}" in a string. JSON allows only \\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX.`, j);

        }

        if (c < 0x20) {

            if (c === 10 || c === 13) {
                fail("A line break inside a string. A JSON string must stay on one line; write the line break as \\n.", j);
            }

            if (c === 9) {
                fail("A tab inside a string. Write it as \\t.", j);
            }

            fail(`A control character (U+${c.toString(16).toUpperCase().padStart(4, "0")}) inside a string. Write it as an escape such as \\u${c.toString(16).padStart(4, "0")}.`, j);

        }

    }

    fail("This string is never closed: the text ends before the closing double quote.", i);

}

/* returns { end, integer } */
function readNumber(text, i) {

    const n = text.length;

    let j = i;

    if (text[j] === "-") {
        j++;
    }

    if (!isDigit(text.charCodeAt(j))) {

        const rest = text.slice(j, j + 8);

        fail(
            /^Infinity/.test(rest)
                ? "Infinity is not valid JSON; use null or a string instead."
                : "A minus sign must be followed by digits.",
            i
        );

    }

    if (text[j] === "0") {

        j++;

        if (isDigit(text.charCodeAt(j))) {
            fail("A number cannot have leading zeros. Write 7, not 007.", i);
        }

    } else {

        while (j < n && isDigit(text.charCodeAt(j))) {
            j++;
        }

    }

    let integer = true;

    if (text[j] === ".") {

        integer = false;

        j++;

        if (!isDigit(text.charCodeAt(j))) {
            fail("A decimal point must be followed by digits. Write 1.0, not 1.", j - 1);
        }

        while (j < n && isDigit(text.charCodeAt(j))) {
            j++;
        }

    }

    if (text[j] === "e" || text[j] === "E") {

        integer = false;

        j++;

        if (text[j] === "+" || text[j] === "-") {
            j++;
        }

        if (!isDigit(text.charCodeAt(j))) {
            fail("An exponent needs digits after the e, such as 1e3.", j - 1);
        }

        while (j < n && isDigit(text.charCodeAt(j))) {
            j++;
        }

    }

    return { end: j, integer };

}

const pads = [""];

const pad = (depth) => {

    while (pads.length <= depth) {
        pads.push(pads[pads.length - 1] + INDENT);
    }

    return pads[depth];

};

const ROOT_TYPE = { "{": "object", "[": "array", '"': "string" };

/*
 * mode "check"   only validate
 *      "format"  validate and lay out with two spaces
 *      "minify"  validate and remove every insignificant space
 * Returns { output, notes, noteTotal, rootType, rootCount, depth }; throws Fail.
 */
function scan(text, mode) {

    const n = text.length;

    const build = mode !== "check";
    const pretty = mode === "format";

    const out = build ? [] : null;

    const stack = [];

    const notes = [];

    let noteTotal = 0;

    const note = (kind, message, offset) => {

        noteTotal++;

        if (notes.length < MAX_NOTES) {
            notes.push({ kind, message, offset });
        }

    };

    let state = "value";

    let commaAt = -1;
    let afterColon = false;
    let needBreak = false;
    let justOpened = false;

    let rootType = null;
    let rootCount = 0;
    let depth = 0;

    const lead = () => {

        if (pretty && needBreak) {
            out.push("\n" + pad(stack.length));
        }

        needBreak = false;
        justOpened = false;

    };

    const top = () => stack[stack.length - 1];

    const where = (frame) => {

        const at = locate(text, frame.at);

        return `line ${at.line}, column ${at.column}`;

    };

    const doneValue = () => {

        commaAt = -1;
        afterColon = false;

        state = stack.length ? "afterValue" : "end";

    };

    const open = (ch) => {

        if (stack.length === 0) {
            rootType = ROOT_TYPE[ch];
        } else if (top().ch === "[") {
            top().count++;
        }

        if (stack.length >= MAX_DEPTH) {
            fail(`This is nested more than ${MAX_DEPTH} levels deep, which is more than this tool handles.`, i);
        }

        if (build) {
            lead();
            out.push(ch);
        }

        stack.push({ ch, at: i, count: 0, keys: ch === "{" ? new Set() : null });

        depth = Math.max(depth, stack.length);

        justOpened = true;
        needBreak = true;
        commaAt = -1;
        afterColon = false;

        state = ch === "{" ? "keyOrClose" : "valueOrClose";

        i++;

    };

    const close = (ch) => {

        const frame = stack.pop();

        if (build) {

            if (pretty && !justOpened) {
                out.push("\n" + pad(stack.length));
            }

            out.push(ch);

        }

        justOpened = false;
        needBreak = false;

        if (stack.length === 0) {
            rootCount = frame.count;
        }

        i++;

        doneValue();

    };

    const unexpected = (what) => {

        fail(`Unexpected ${describe(text, i)} ${what}.${hint(text, i)}`, i);

    };

    const mismatch = (ch) => {

        const frame = top();

        fail(`Expected ${closerOf[frame.ch]} to close the ${frame.ch} opened at ${where(frame)}, but found ${ch}.`, i);

    };

    let i = 0;

    for (;;) {

        while (i < n) {

            const c = text.charCodeAt(i);

            if (c === 32 || c === 10 || c === 13 || c === 9) {
                i++;
            } else {
                break;
            }

        }

        if (i >= n) {
            break;
        }

        const ch = text[i];

        if (state === "end") {

            fail("There is more text after the JSON value. A JSON document has one value at its root; if you have several, they need to be inside an array or object.", i);

        }

        /* ---------- a comma or a close bracket where a value or key is due ---------- */

        if (state === "afterValue") {

            const frame = top();

            if (ch === ",") {

                if (build) {
                    out.push(",");
                }

                needBreak = true;
                commaAt = i;
                state = frame.ch === "{" ? "key" : "value";
                i++;

                continue;

            }

            if (ch === "}" || ch === "]") {

                if (closerOf[frame.ch] !== ch) {
                    mismatch(ch);
                }

                close(ch);

                continue;

            }

            if (ch === "/") {
                fail("Comments are not allowed in JSON.", i);
            }

            if (ch === ":") {
                fail(frame.ch === "{" ? "Unexpected \":\". A property name must be in double quotes and appear before its colon." : "Unexpected \":\" inside an array.", i);
            }

            if (/["{\[\-0-9A-Za-z']/.test(ch)) {
                fail(`Expected "," or "${closerOf[frame.ch]}" here, but found ${describe(text, i)}. A comma may be missing before it.`, i);
            }

            unexpected(`where "," or "${closerOf[frame.ch]}" was expected`);

        }

        /* ---------- the colon after a property name ---------- */

        if (state === "colon") {

            if (ch === ":") {

                if (build) {
                    out.push(pretty ? ": " : ":");
                }

                state = "value";
                commaAt = -1;
                afterColon = true;
                i++;

                continue;

            }

            fail(`Expected ":" after the property name, but found ${describe(text, i)}.`, i);

        }

        /* ---------- a property name ---------- */

        if (state === "keyOrClose" || state === "key") {

            if (ch === "}") {

                if (state === "key") {
                    fail("A trailing comma. JSON does not allow a comma before the closing }; remove it.", commaAt);
                }

                close("}");

                continue;

            }

            if (ch === '"') {

                const end = readString(text, i);

                const frame = top();

                frame.count++;

                const token = text.slice(i, end);

                const keyText = token.includes("\\") ? JSON.parse(token) : token.slice(1, -1);

                if (frame.keys.has(keyText)) {
                    note("duplicate-key", `The key "${keyText.length > 40 ? keyText.slice(0, 40) + "…" : keyText}" appears more than once in the same object. Most parsers keep only the last value.`, i);
                }

                frame.keys.add(keyText);

                if (build) {
                    lead();
                    out.push(token);
                }

                i = end;

                state = "colon";

                continue;

            }

            if (ch === "'") {
                fail("Property names must use double quotes, not single quotes.", i);
            }

            if (ch === "/") {
                fail("Comments are not allowed in JSON.", i);
            }

            if (ch === "]") {
                mismatch("]");
            }

            if (ch === ",") {
                fail("Unexpected \",\" where a property name was expected.", i);
            }

            WORD.lastIndex = i;

            const word = WORD.exec(text);

            if (word) {
                fail(`Property names must be in double quotes: write "${word[0]}" instead of ${word[0]}.`, i);
            }

            if (/[0-9\-]/.test(ch)) {
                fail("Property names must be strings in double quotes.", i);
            }

            unexpected("where a property name in double quotes was expected");

        }

        /* ---------- a value (state "value" or "valueOrClose") ---------- */

        if (ch === "]" && state === "valueOrClose") {

            close("]");

            continue;

        }

        if (ch === "{" || ch === "[") {

            open(ch);

            continue;

        }

        const inArray = stack.length > 0 && top().ch === "[";

        if (ch === '"') {

            const end = readString(text, i);

            if (stack.length === 0) {
                rootType = "string";
            } else if (inArray) {
                top().count++;
            }

            if (build) {
                lead();
                out.push(text.slice(i, end));
            }

            i = end;

            doneValue();

            continue;

        }

        if (ch === "-" || isDigit(text.charCodeAt(i))) {

            const num = readNumber(text, i);

            const token = text.slice(i, num.end);

            if (stack.length === 0) {
                rootType = "number";
            } else if (inArray) {
                top().count++;
            }

            if (!Number.isFinite(Number(token))) {

                note("number-range", `The number ${token.length > 30 ? token.slice(0, 30) + "…" : token} is larger than JavaScript can hold; JSON.parse in JavaScript turns it into Infinity.`, i);

            } else if (num.integer && token.replace("-", "").length > 15 && !Number.isSafeInteger(Number(token))) {

                note("number-precision", `The integer ${token.length > 30 ? token.slice(0, 30) + "…" : token} is beyond 15 digits. It is kept exactly as written here, but JavaScript would round it.`, i);

            }

            if (build) {
                lead();
                out.push(token);
            }

            i = num.end;

            doneValue();

            continue;

        }

        if (ch === "/") {
            fail("Comments are not allowed in JSON.", i);
        }

        if (ch === "'") {
            fail("Strings must use double quotes, not single quotes.", i);
        }

        if (ch === "+") {
            fail("A number cannot start with +. Remove the plus sign.", i);
        }

        if (ch === ".") {
            fail("A number cannot start with a decimal point. Write 0.5, not .5.", i);
        }

        if (ch === "," || ch === ":" || ch === "}" || ch === "]") {

            if (afterColon) {
                fail("A value is missing after the colon.", i);
            }

            if (ch === "}" || ch === "]") {

                if (commaAt >= 0 && stack.length && closerOf[top().ch] === ch) {
                    fail(`A trailing comma. JSON does not allow a comma before the closing ${ch}; remove it.`, commaAt);
                }

                if (stack.length && closerOf[top().ch] !== ch) {
                    mismatch(ch);
                }

                if (!stack.length) {
                    fail(`Unexpected "${ch}": nothing is open to close.`, i);
                }

            }

            fail(`A value is missing before "${ch}".`, i);

        }

        WORD.lastIndex = i;

        const word = WORD.exec(text);

        if (word) {

            const w = word[0];

            if (w === "true" || w === "false" || w === "null") {

                if (stack.length === 0) {
                    rootType = w === "null" ? "null" : "boolean";
                } else if (inArray) {
                    top().count++;
                }

                if (build) {
                    lead();
                    out.push(w);
                }

                i += w.length;

                doneValue();

                continue;

            }

            if (w === "NaN" || w === "Infinity") {
                fail(`${w} is not valid JSON. Use null, or write it as a string.`, i);
            }

            if (w === "undefined") {
                fail("undefined is not valid JSON. Use null, or leave the property out.", i);
            }

            if (["true", "false", "null"].includes(w.toLowerCase())) {
                fail(`"${w}" is not valid JSON: true, false and null must be lowercase.`, i);
            }

            fail(`Unexpected word "${w}". Text must be in double quotes ("${w}"); the only bare words JSON allows are true, false and null.`, i);

        }

        unexpected("where a value was expected");

    }


    /* ---------- the end of the text ---------- */

    if (stack.length > 0) {

        const frame = top();

        fail(`The text ends too soon: the ${frame.ch} opened at ${where(frame)} is never closed with ${closerOf[frame.ch]}.`, n);

    }

    if (commaAt >= 0) {
        fail("The text ends after a comma, where a value was expected.", n);
    }

    return {
        output: build ? out.join("") : null,
        notes,
        noteTotal,
        rootType,
        rootCount,
        depth
    };

}


/* =========================================================
   THE PUBLIC RESULT
========================================================= */

/*
 * analyze(text, mode = "check" | "format" | "minify")
 *
 *   { state: "empty" }
 *   { state: "too-large", limit }
 *   { state: "invalid", error: { message, offset, line, column, context } }
 *   { state: "valid", rootType, rootCount, depth, notes, noteTotal, output }
 *
 * `output` is the formatted or minified text (null when mode is "check").
 */
export function analyze(text, mode = "check") {

    const input = String(text ?? "");

    if (input.trim() === "") {
        return { state: "empty" };
    }

    if (input.length > MAX_CHARS) {
        return { state: "too-large", limit: MAX_CHARS };
    }

    try {

        const result = scan(input, mode);

        return { state: "valid", ...result };

    } catch (problem) {

        if (!(problem instanceof Fail)) {
            throw problem;
        }

        const at = locate(input, problem.offset);

        return {
            state: "invalid",
            error: {
                message: problem.message,
                offset: problem.offset,
                line: at.line,
                column: at.column,
                context: contextOf(input, problem.offset)
            }
        };

    }

}

export const format = (text) => analyze(text, "format");

export const minify = (text) => analyze(text, "minify");

export const validate = (text) => analyze(text, "check");


/* =========================================================
   TEXT FOR THE PAGE
========================================================= */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* "Object with 4 keys, 3 levels deep" */
export function describeValid(result) {

    const { rootType, rootCount, depth } = result;

    const levels = depth > 1 ? `, ${depth} levels deep` : "";

    switch (rootType) {

        case "object":
            return `Object with ${plural(rootCount, "key", "keys")}${levels}`;

        case "array":
            return `Array with ${plural(rootCount, "item", "items")}${levels}`;

        case "string":
            return "A string";

        case "number":
            return "A number";

        case "boolean":
            return "A boolean";

        default:
            return "null";

    }

}

/* a note with its place: "Line 4, column 3: ..." */
export function describeNote(text, note) {

    const at = locate(text, note.offset);

    return `Line ${at.line}, column ${at.column}: ${note.message}`;

}

/* "12,345 characters" or "1.2 million characters" */
export function describeSize(length) {

    return length >= 1_000_000
        ? `${(length / 1_000_000).toFixed(1)} million characters`
        : `${length.toLocaleString("en-US")} characters`;

}

export const EXAMPLE = '{"orderId":"ord_1042","status":"shipped","paid":true,"total":148.5,"currency":"USD","items":[{"sku":"KB-77","name":"Mechanical keyboard","qty":1,"price":129.0},{"sku":"CB-02","name":"USB-C cable","qty":2,"price":9.75}],"shipping":{"method":"express","address":{"city":"Austin","country":"US"},"tracking":null},"tags":[]}';
