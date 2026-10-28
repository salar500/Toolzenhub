/* =========================================================
   ToolZen Hub
   JSON Error-Fixing Lab: the evaluator (pure)

   evaluate(exercise, text) -> { verdict, summary, findings?, lines? }

   Steps:
     1. The strict JSON engine of the JSON Formatter checks the text.
        Still invalid is "Not yet" and carries the engine's own message
        with its line and column.
     2. A valid text that repeats a key is "Not yet" (the meaning of a
        repeated key depends on the parser).
     3. The text is parsed and its VALUE is compared with the value the
        exercise expects. Whitespace and key order do not matter. Types
        are never coerced: 1 is not "1", true is not "true", null is not
        a missing key. Array order does matter.
   The expected value is never shown; differences are listed as paths.
   No eval, no Function, no HTML, no network.
========================================================= */

import { analyze, MAX_DEPTH } from "../json-formatter/json-engine.js";

export const MAX_RESPONSE_CHARS = 20000;
const MAX_DIFFS = 5;

const kindOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

/** JSONPath-style path for the learner: $.items[1].price */
const keyPath = (base, key) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`);

/**
 * Paths where two parsed values differ, at most `max`. Strict about types; arrays are ordered; object key order is ignored.
 * Own-property checks only, so a key named __proto__ or constructor is just a key.
 */
export function differences(actual, expected, max = MAX_DIFFS) {

    const out = [];

    const walk = (a, b, path) => {

        if (out.length >= max) return;

        const ka = kindOf(a), kb = kindOf(b);

        if (ka !== kb) { out.push(`${path} has a different kind of value`); return; }

        if (ka === "array") {
            if (a.length !== b.length) { out.push(`${path} has a different number of items`); return; }
            for (let i = 0; i < a.length && out.length < max; i += 1) walk(a[i], b[i], `${path}[${i}]`);
            return;
        }

        if (ka === "object") {
            const keysA = Object.keys(a), keysB = Object.keys(b);
            const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
            for (const k of keysB) if (!has(a, k) && out.length < max) out.push(`${keyPath(path, k)} is missing`);
            for (const k of keysA) if (!has(b, k) && out.length < max) out.push(`${keyPath(path, k)} should not be there`);
            for (const k of keysB) if (has(a, k)) walk(a[k], b[k], keyPath(path, k));
            return;
        }

        if (!Object.is(a, b) && !(ka === "number" && a === b)) out.push(`${path} has a different value`);

    };

    walk(actual, expected, "$");

    return out;

}

export function evaluate(exercise, text) {

    const report = analyze(text, "check");

    if (report.state === "empty") {
        return { verdict: "cannot-check", summary: "There is nothing to check yet. Type an answer first." };
    }

    if (report.state === "too-large") {
        return { verdict: "cannot-check", summary: "That text is longer than this lab checks." };
    }

    if (report.state === "invalid") {
        const e = report.error;
        return {
            verdict: "not-yet",
            summary: "The text is still not valid JSON.",
            findings: [`Line ${e.line}, column ${e.column}: ${e.message}`],
            lines: e.context ? [e.context] : undefined
        };
    }

    const repeated = (report.notes ?? []).filter((n) => n.kind === "duplicate-key");

    if (repeated.length > 0) {
        return {
            verdict: "not-yet",
            summary: "The text is valid JSON, but an object has the same key more than once, so its meaning depends on the parser. Use each key once."
        };
    }

    let value;
    try {
        value = JSON.parse(text);
    } catch {
        /* the engine accepted it but the platform parser did not: this is not the learner's mistake */
        throw new Error("engine and parser disagree");
    }

    const diffs = differences(value, exercise.expected);

    if (diffs.length === 0) {
        return { verdict: "correct", summary: "The text is valid JSON and has the value this exercise asks for." };
    }

    return {
        verdict: "not-yet",
        summary: "The text is valid JSON, but its value is not the one the exercise asks for. Compare it with the instructions.",
        findings: diffs
    };

}

export { MAX_DEPTH };
