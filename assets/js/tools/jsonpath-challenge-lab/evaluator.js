/* =========================================================
   ToolZen Hub
   JSONPath Challenge Lab: the evaluator (pure)

   evaluate(exercise, query) -> { verdict, summary, findings?, lines? }

   The query is run by the JSONPath Tester's own RFC 9535 engine on
   the exercise's built-in document. The answer is judged by WHICH
   NODES it selects (their Normalized Paths), never by the text of the
   query: any query that selects the same nodes is correct. Two
   different nodes with equal values are different nodes.

   - Each node must be selected once (a node selected twice is a
     difference).
   - In an unordered exercise the order of the nodes does not matter;
     in an ordered exercise it does.
   - A query the engine refuses (syntax error, unsupported function,
     too long) is "Cannot check" with the engine's message and
     position, not a wrong answer.
   The engine's own work limits apply. No eval, no regex built from
   the query, no HTML.
========================================================= */

import { evaluateQuery, MAX_QUERY_CHARS } from "../jsonpath-tester/jsonpath-engine.js";

export const MAX_RESPONSE_CHARS = MAX_QUERY_CHARS;
const MAX_LISTED = 5;

/* RFC 9535 section 2.7: names in single quotes, only \\ \' and control characters escaped */
const ESCAPES = { 8: "\\b", 9: "\\t", 10: "\\n", 12: "\\f", 13: "\\r" };

function quoteName(name) {
    let out = "";
    for (const ch of name) {
        const code = ch.codePointAt(0);
        if (ch === "'") out += "\\'";
        else if (ch === "\\") out += "\\\\";
        else if (ESCAPES[code]) out += ESCAPES[code];
        else if (code < 0x20) out += `\\u${code.toString(16).padStart(4, "0")}`;
        else out += ch;
    }
    return `'${out}'`;
}

/** ["library","books",0,"title"] -> $['library']['books'][0]['title'] */
export function normalizedPath(segments) {
    return "$" + segments.map((s) => (typeof s === "number" ? `[${s}]` : `[${quoteName(s)}]`)).join("");
}

const multiset = (list) => {
    const m = new Map();
    for (const p of list) m.set(p, (m.get(p) ?? 0) + 1);
    return m;
};

/** Paths in `a` beyond what `b` holds (counting repeats). */
function surplus(a, b) {
    const left = multiset(b);
    const out = [];
    for (const p of a) {
        const n = left.get(p) ?? 0;
        if (n > 0) left.set(p, n - 1);
        else out.push(p);
    }
    return out;
}

const listed = (title, paths) => {
    const shown = paths.slice(0, MAX_LISTED);
    return `${title}: ${shown.join("; ")}${paths.length > shown.length ? `; and ${paths.length - shown.length} more` : ""}`;
};

export function evaluate(exercise, query) {

    const run = evaluateQuery(exercise.document, query);

    if (run.state === "blocked") {
        const q = run.query;
        if (q.status === "empty") return { verdict: "cannot-check", summary: "There is nothing to check yet. Type a query first." };
        if (q.status === "too-large") return { verdict: "cannot-check", summary: `That query is longer than the ${MAX_QUERY_CHARS} characters this lab checks.` };
        if (q.status === "invalid") {
            return {
                verdict: "cannot-check",
                summary: "The query could not be read, so it was not checked.",
                findings: [q.position !== undefined ? `Position ${q.position}: ${q.message}` : q.message]
            };
        }
        throw new Error("the exercise document was refused by the engine");
    }

    if (run.state === "limit") {
        return { verdict: "cannot-check", summary: "That query does more work than this lab allows, so it was not checked. Try a more specific query." };
    }

    if (run.state !== "done") throw new Error("unknown engine state");

    const actual = run.nodes.map((n) => normalizedPath(n.path));
    const wanted = exercise.expected.map(normalizedPath);

    const extra = surplus(actual, wanted);
    const missing = surplus(wanted, actual);

    if (extra.length === 0 && missing.length === 0) {
        if (exercise.ordered && actual.some((p, i) => p !== wanted[i])) {
            return {
                verdict: "not-yet",
                summary: "The query selects the right nodes, but in a different order. This exercise needs them in the order described."
            };
        }
        return { verdict: "correct", summary: "The query selects exactly the nodes this exercise asks for." };
    }

    const findings = [];
    if (actual.length === 0) findings.push("The query selects nothing in this document.");
    else findings.push(`The query selects ${actual.length === 1 ? "1 node" : `${actual.length} nodes`}; the exercise asks for ${wanted.length === 1 ? "1" : wanted.length}.`);
    if (extra.length > 0) findings.push(listed("Selected but not wanted (or selected more than once)", extra));
    if (missing.length > 0) findings.push(listed("Wanted but not selected", missing));

    return {
        verdict: "not-yet",
        summary: "The query does not select the nodes this exercise asks for.",
        findings
    };

}
