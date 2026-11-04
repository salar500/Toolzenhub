/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: the evaluator

   evaluate(exercise, text) is pure and synchronous. A query exercise runs the learner's steps on the exercise's table and compares
   the result with the expected table; a model exercise checks the learner's relationships against the data and the expected set; a
   DAX exercise evaluates the learner's measure in several filter contexts. The feedback shows what the learner's work produced and
   never the expected result.
========================================================= */

import { runScript, diffTables, cellText, MAX_SCRIPT_CHARS } from "./pq/engine.js";
import { checkRelationships, compareRelationships, ModelError } from "./model.js";
import { evaluateMeasure, formatValue } from "./dax/engine.js";
import { SAKHI } from "./datasets.js";

export const MAX_RESPONSE_CHARS = MAX_SCRIPT_CHARS;

const SHOWN_ROWS = 5;

function preview(table) {
    const head = table.columns.join(" | ");
    const rows = table.rows.slice(0, SHOWN_ROWS).map((r) => r.map(cellText).join(" | "));
    return [head, ...rows, ...(table.rows.length > SHOWN_ROWS ? [`(${table.rows.length - SHOWN_ROWS} more rows)`] : [])];
}

function evaluateQuery(ex, text) {

    const done = runScript(ex.input.table, text, ex.tables ?? {});

    if (done.error) {
        return {
            verdict: "cannot-check",
            summary: done.error.line ? `Line ${done.error.line} could not be applied.` : "The steps could not be applied.",
            findings: [done.error.message]
        };
    }

    const problems = diffTables(done.table, ex.expected, ex.ordered);

    if (problems.length === 0) {
        return { verdict: "correct", summary: `Correct. Your steps produce the expected table (${done.table.rows.length} rows, ${done.table.columns.length} columns).`, lines: preview(done.table) };
    }

    return {
        verdict: "not-yet",
        summary: "Your steps run, but the resulting table is not the one this exercise asks for.",
        findings: problems,
        lines: preview(done.table)
    };

}

function evaluateModel(ex, text) {

    let checked;
    try {
        checked = checkRelationships(ex.tables, text);
    } catch (e) {
        if (e instanceof ModelError) {
            return { verdict: "cannot-check", summary: e.line ? `Line ${e.line} cannot be used.` : "The relationships cannot be used.", findings: [e.message] };
        }
        throw e;
    }

    const cmp = compareRelationships(checked.relationships, ex.expected.map((x) => ({ from: x.from, to: x.to, active: x.active })), ex.tables);
    const lines = checked.relationships.map((r) => `${r.from} -> ${r.to}${r.active ? "" : " (inactive)"}`);

    if (cmp.ok) {
        return { verdict: "correct", summary: "Correct. Every relationship is valid for this data, and together they form the model asked for.", findings: checked.notes, lines };
    }

    return { verdict: "not-yet", summary: "The relationships are valid for the data, but the model is not complete or not the one asked for.", findings: [...cmp.findings, ...checked.notes], lines };

}

function same(got, want) {
    if (want === null) return got === null;
    if (typeof want === "number") return typeof got === "number" && Math.abs(got - want) <= 1e-6 * Math.max(1, Math.abs(want));
    return got === want;
}

function evaluateDax(ex, text) {

    const model = SAKHI;
    const lines = [];
    const wrong = [];

    for (const c of ex.contexts) {
        const r = evaluateMeasure(model, text, { target: ex.target, helpers: ex.helpers, context: c.filters });
        if (r.error) {
            // a runtime error in one context is a result, a syntax or name error stops the check
            if (lines.length === 0 && /could not|not supported|no measure|Define a measure|Write a measure|was expected|not valid|closing|never closed|not a variable|no table|no column/.test(r.error)) {
                return { verdict: "cannot-check", summary: "The measure could not be evaluated.", findings: [r.error] };
            }
            lines.push(`${c.label}: error`);
            wrong.push(`${c.label}: ${r.error}`);
            continue;
        }
        lines.push(`${c.label}: ${formatValue(r.value)}`);
        if (!same(r.value, c.expected)) wrong.push(c.label);
    }

    if (wrong.length === 0) {
        return { verdict: "correct", summary: `Correct. ${ex.target} gives the right value in all ${ex.contexts.length} filter contexts.`, lines };
    }

    const gave = wrong.length === ex.contexts.length;
    return {
        verdict: "not-yet",
        summary: gave ? "The measure does not give the right value in any of the tested filter contexts." : `The measure is right in ${ex.contexts.length - wrong.length} of ${ex.contexts.length} filter contexts, so it is not yet doing what the exercise asks.`,
        findings: [
            `Not right in: ${wrong.join("; ")}.`,
            gave ? "" : "A measure that works for the total can still be wrong when a slicer or a category changes the filter context. Check how your formula reacts to the filters."
        ].filter(Boolean),
        lines
    };

}

export function evaluate(ex, text) {
    if (text.length > MAX_RESPONSE_CHARS) return { verdict: "cannot-check", summary: `The answer is longer than ${MAX_RESPONSE_CHARS.toLocaleString("en-US")} characters.` };
    if (ex.kind === "query") return evaluateQuery(ex, text);
    if (ex.kind === "model") return evaluateModel(ex, text);
    return evaluateDax(ex, text);
}
