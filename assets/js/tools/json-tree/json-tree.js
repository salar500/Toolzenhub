/* =========================================================
   ToolZen Hub
   JSON tree: a lossless reading of one JSON document

   Pure: no DOM, no network, no storage, no clock.

   Shared by JSON Compare and the JSONPath Tester. It does NOT
   replace the JSON Formatter's scanner: the text is first checked
   by that scanner (strict RFC 8259, the same located errors, the
   same size and depth limits), and only a document it accepts is
   turned into a tree here.

   WHY NOT JSON.parse
       JSON.parse rounds numbers to doubles, so 12345678901234567890
       and 12345678901234567891 would look equal. Here every number
       keeps its exact text and gets a canonical key computed from
       its digits, so 1, 1.0, 1e0 and 10e-1 are equal and nothing is
       ever compared as a floating point value. An object keeps its
       members in document order; a duplicate key keeps the LAST
       value (as JSON.parse does) at the position of the FIRST, and
       is recorded.

   Nodes
       { t: "object", map: Map(key -> node) }
       { t: "array",  items: [node] }
       { t: "string", v }
       { t: "number", text, key, digits }
       { t: "boolean", v }
       { t: "null" }
========================================================= */

import {
    validate,
    MAX_DEPTH
} from "../json-formatter/json-engine.js";

export { MAX_DEPTH };

/* a number whose exponent has more digits than this is refused rather than computed */
export const MAX_EXPONENT_DIGITS = 1000;

const NUMBER = /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/y;

const NUMBER_PARTS = /^(-?)([0-9]+)(?:\.([0-9]+))?(?:[eE]([+-]?)([0-9]+))?$/;

class Refused extends Error {}


/* ---------- exact number keys ---------- */

/**
 * The canonical key of a JSON number text: sign, the significant digits
 * without leading or trailing zeros, and a power of ten. Zero (and -0) is
 * "0". Two texts are the same number exactly when their keys are equal.
 */
export function numberKey(text) {

    const m = NUMBER_PARTS.exec(text);
    const frac = m[3] || "";
    const expDigits = m[5] ? m[5].replace(/^0+/, "") : "";

    if (expDigits.length > MAX_EXPONENT_DIGITS) {
        throw new Refused(`has an exponent with more than ${MAX_EXPONENT_DIGITS} digits`);
    }

    let digits = (m[2] + frac).replace(/^0+/, "");

    if (digits === "") {
        return { key: "0", digits: 0 };
    }

    let exp = BigInt(expDigits === "" ? "0" : expDigits);

    if (m[4] === "-") {
        exp = -exp;
    }

    exp -= BigInt(frac.length);

    let end = digits.length;

    while (end > 1 && digits.charCodeAt(end - 1) === 48) {
        end--;
    }

    exp += BigInt(digits.length - end);
    digits = digits.slice(0, end);

    return {
        key: `${m[1]}${digits}e${exp}`,
        digits: digits.length
    };
}


/* ---------- paths ---------- */

const ESCAPES = { 8: "\\b", 12: "\\f", 10: "\\n", 13: "\\r", 9: "\\t" };

function escapeName(name) {

    let out = "";

    for (let i = 0; i < name.length; i++) {

        const c = name.charCodeAt(i);

        if (c === 39) {
            out += "\\'";
        } else if (c === 92) {
            out += "\\\\";
        } else if (c < 32) {
            out += ESCAPES[c] || "\\u" + c.toString(16).padStart(4, "0");
        } else {
            out += name[i];
        }
    }

    return out;
}

/** RFC 9535 Normalized Path, for example $['b'][2]. */
export function normalizedPath(segments) {

    let out = "$";

    for (const s of segments) {
        out += typeof s === "number" ? `[${s}]` : `['${escapeName(s)}']`;
    }

    return out;
}

/** RFC 6901 JSON Pointer ("" is the whole document). */
export function pointer(segments) {

    return segments
        .map((s) => "/" + String(s).replace(/~/g, "~0").replace(/\//g, "~1"))
        .join("");
}


/* ---------- tree to text ---------- */

/** Compact JSON with every number written exactly as in the source. */
export function serialize(node) {

    switch (node.t) {
        case "object": {
            const parts = [];
            for (const [k, v] of node.map) {
                parts.push(JSON.stringify(k) + ":" + serialize(v));
            }
            return "{" + parts.join(",") + "}";
        }
        case "array":
            return "[" + node.items.map(serialize).join(",") + "]";
        case "string":
            return JSON.stringify(node.v);
        case "number":
            return node.text;
        case "boolean":
            return node.v ? "true" : "false";
        default:
            return "null";
    }
}


/* ---------- building ---------- */

const isLoneSurrogate = (s) => {

    for (let i = 0; i < s.length; i++) {

        const u = s.charCodeAt(i);

        if (u >= 0xD800 && u <= 0xDBFF) {

            const n = s.charCodeAt(i + 1);

            if (n >= 0xDC00 && n <= 0xDFFF) {
                i++;
                continue;
            }

            return true;
        }

        if (u >= 0xDC00 && u <= 0xDFFF) {
            return true;
        }
    }

    return false;
};

/* a validated document read left to right; the text is known to be strict JSON */
function build(text) {

    let i = 0;
    let count = 0;
    const path = [];
    const dups = [];
    const precision = [];
    const lone = [];

    const skip = () => {
        while (true) {
            const c = text.charCodeAt(i);
            if (c === 32 || c === 9 || c === 10 || c === 13) {
                i++;
            } else {
                return;
            }
        }
    };

    function readString() {

        const start = i;
        i++;

        while (true) {

            const c = text.charCodeAt(i);

            if (c === 92) {
                i += 2;
            } else if (c === 34) {
                i++;
                break;
            } else {
                i++;
            }
        }

        return JSON.parse(text.slice(start, i));
    }

    function value() {

        skip();
        count++;

        const c = text[i];

        if (c === "{") {

            i++;

            const map = new Map();

            skip();

            if (text[i] === "}") {
                i++;
                return { t: "object", map };
            }

            while (true) {

                skip();

                const key = readString();

                skip();
                i++;

                path.push(key);

                if (map.has(key)) {
                    dups.push({ path: path.slice(), key });
                }

                map.set(key, value());

                path.pop();
                skip();

                if (text[i] === ",") {
                    i++;
                    continue;
                }

                i++;

                return { t: "object", map };
            }
        }

        if (c === "[") {

            i++;

            const items = [];

            skip();

            if (text[i] === "]") {
                i++;
                return { t: "array", items };
            }

            while (true) {

                path.push(items.length);
                items.push(value());
                path.pop();
                skip();

                if (text[i] === ",") {
                    i++;
                    continue;
                }

                i++;

                return { t: "array", items };
            }
        }

        if (c === '"') {

            const v = readString();

            if (isLoneSurrogate(v)) {
                lone.push(path.slice());
            }

            return { t: "string", v };
        }

        if (c === "t") {
            i += 4;
            return { t: "boolean", v: true };
        }

        if (c === "f") {
            i += 5;
            return { t: "boolean", v: false };
        }

        if (c === "n") {
            i += 4;
            return { t: "null" };
        }

        NUMBER.lastIndex = i;

        const numberText = NUMBER.exec(text)[0];

        i += numberText.length;

        let k;

        try {
            k = numberKey(numberText);
        } catch (problem) {

            if (problem instanceof Refused) {
                throw new Refused(`The number at ${normalizedPath(path)} ${problem.message}, which this tool does not compare.`);
            }

            throw problem;
        }

        if (k.digits > 15) {
            precision.push({ path: path.slice(), digits: k.digits });
        }

        return { t: "number", text: numberText, key: k.key, digits: k.digits };
    }

    const root = value();

    return { root, count, dups, precision, lone };
}

/**
 * Check text with the JSON Formatter's scanner and, when it is valid JSON,
 * read it into a tree.
 *
 *   { state: "empty" }
 *   { state: "too-large", limit }
 *   { state: "invalid", error: { message, offset, line, column, context } }
 *   { state: "refused", message }
 *   { state: "valid", root, count, dups, precision, lone }
 */
export function parseJson(text, maxChars) {

    const input = String(text ?? "");

    if (input.trim() === "") {
        return { state: "empty" };
    }

    if (input.length > maxChars) {
        return { state: "too-large", limit: maxChars };
    }

    const checked = validate(input);

    if (checked.state !== "valid") {
        return checked;
    }

    try {
        return { state: "valid", ...build(input) };
    } catch (problem) {

        if (problem instanceof Refused) {
            return { state: "refused", message: problem.message };
        }

        throw problem;
    }
}
