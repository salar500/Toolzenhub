/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the evaluator

   compareResults(expected, got, ordered) is pure and is what decides an answer: the same number of columns, the same
   number of rows, and the same values (rows as a set unless the exercise needs an order; whole numbers and decimals
   that are equal are equal; column names and capital letters in keywords do not matter). It never prints the expected
   rows, so feedback cannot hand over the answer.

   createEvaluator(runner) returns evaluate(exercise, sql): a promise of a lab verdict. The learner's SQL is run by the
   worker on a new in-memory copy of the practice data (see sql-worker.js), followed, for exercises that change data, by
   the exercise's own `verify` query.
========================================================= */

import { SETUP } from "./dataset.js";

export const MAX_RESPONSE_CHARS = 4000;
const SHOWN_ROWS = 10;

const key = (value) => {
    if (value === null || value === undefined) return "n:";
    if (typeof value === "number") return `d:${Number(value.toFixed(9))}`;
    return `s:${value}`;
};

const rowKey = (row) => row.map(key).join("\u0001");

/** @returns {{ same: true } | { same: false, reason: "columns" | "rows" | "values" | "order", detail?: string }} */
export function compareResults(expected, got, ordered) {

    const columns = got.columns.length;

    if (columns !== expected.columns) {
        return { same: false, reason: "columns", detail: `Your query returns ${columns} ${columns === 1 ? "column" : "columns"}; this exercise asks for ${expected.columns}.` };
    }

    if (got.total !== expected.rows.length) {
        return { same: false, reason: "rows", detail: `Your query returns ${got.total} ${got.total === 1 ? "row" : "rows"}; this exercise expects ${expected.rows.length}.` };
    }

    const mine = got.rows.map(rowKey);
    const wanted = expected.rows.map(rowKey);

    if (ordered) {
        if (mine.every((k, i) => k === wanted[i])) return { same: true };
        const sameSet = [...mine].sort().join("\u0002") === [...wanted].sort().join("\u0002");
        return { same: false, reason: sameSet ? "order" : "values", detail: sameSet ? "The right rows are there, but not in the order this exercise asks for." : "The number of rows and columns is right, but some values differ." };
    }

    if ([...mine].sort().join("\u0002") === [...wanted].sort().join("\u0002")) return { same: true };

    return { same: false, reason: "values", detail: "The number of rows and columns is right, but some values differ." };

}

const text = (value) => (value === null || value === undefined ? "NULL" : String(value));

/** The first rows of a result as plain lines, for the Details block. */
export function resultLines(got) {

    if (!got || got.columns.length === 0) return [];

    const lines = [got.columns.join(" | ")];

    for (const row of got.rows.slice(0, SHOWN_ROWS)) lines.push(row.map(text).join(" | "));

    if (got.total > SHOWN_ROWS) lines.push(`... ${got.total - SHOWN_ROWS} more rows`);

    return lines;

}

export function createEvaluator(runner) {

    return async function evaluate(exercise, sql) {

        const run = await runner.run({ setup: [...SETUP, ...(exercise.setup ?? [])], sql, verify: exercise.verify ?? null });

        if (run.unavailable) {
            return { verdict: "cannot-check", summary: "This browser could not start the SQL engine, which needs WebAssembly and Web Workers. Nothing was checked." };
        }

        if (run.timedOut) {
            return { verdict: "cannot-check", summary: "Your statement ran for longer than 3 seconds and was stopped, so it was not checked. Look for a join with no ON condition or a recursive query that never ends." };
        }

        if (!run.ok) {
            return { verdict: "cannot-check", summary: "SQLite could not run your statement, so it was not checked.", findings: [`SQLite says: ${run.error}`] };
        }

        const got = run.sets.length > 0 ? run.sets[run.sets.length - 1] : { columns: [], rows: [], total: 0 };

        const note = exercise.kind === "modify" ? [`After your statements the lab ran this query to check the result: ${exercise.verify}`] : [];

        if (exercise.kind !== "modify" && run.sets.length === 0) {
            return { verdict: "not-yet", summary: "Your statement ran but returned no rows, or no result at all. This exercise needs a SELECT that returns rows.", findings: [] };
        }

        if (exercise.expected.rows.length === 0 && got.total === 0) {
            return { verdict: "correct", summary: "Your answer matches what this exercise asks for." };
        }

        if (got.total === 0) {
            return { verdict: "not-yet", summary: "Not yet. The result is empty, and this exercise expects rows.", findings: note };
        }

        const verdict = compareResults(exercise.expected, got, exercise.ordered === true);

        if (verdict.same) {
            return { verdict: "correct", summary: "Your answer matches what this exercise asks for.", lines: exercise.kind === "modify" ? [] : resultLines(got) };
        }

        return { verdict: "not-yet", summary: "Not yet. The result is not the one this exercise asks for.", findings: [verdict.detail, ...note], lines: exercise.kind === "modify" ? [] : resultLines(got) };

    };

}
