/**
 * SQL Practice Lab: the exercises, the comparison and the evaluator's messages.
 *
 * The expected results were produced by Python's sqlite3 (a separate SQLite build from the sql.js used on the page);
 * tests/browser/sql-practice-lab.spec.js runs every stated solution in the real engine and requires it to match. Here the
 * pure parts are pinned: the content is valid, the comparison rules are exactly the documented ones, and every outcome of the
 * worker (error, timeout, unavailable, no result) becomes the right verdict without ever echoing the expected rows.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, compareResults, createEvaluator, resultLines, SETUP, catalog;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ set } = await import("../../assets/js/tools/sql-practice-lab/exercises.js"));
    ({ compareResults, createEvaluator, resultLines } = await import("../../assets/js/tools/sql-practice-lab/evaluator.js"));
    ({ SETUP } = await import("../../assets/js/tools/sql-practice-lab/dataset.js"));
});

const result = (columns, rows, total = rows.length) => ({ columns, rows, total });

describe("SQL Practice Lab: content", () => {

    it("passes the shared exercise-set validation", () => {
        assert.deepEqual(validateExerciseSet(set, { toolIds: { has: (id) => Boolean(catalog.getToolById(id)) } }), []);
        assert.equal(set.exercises.length, 30);
    });

    it("every exercise has a solution, a kind, an expected result of the right shape, and a verify query exactly when it modifies data", () => {
        for (const ex of set.exercises) {
            assert.ok(["query", "modify"].includes(ex.kind), ex.id);
            assert.match(ex.solution, /;$/, ex.id);
            assert.ok(Number.isInteger(ex.expected.columns) && ex.expected.columns >= 1, ex.id);
            for (const row of ex.expected.rows) assert.equal(row.length, ex.expected.columns, ex.id);
            assert.equal(Boolean(ex.verify), ex.kind === "modify", ex.id);
            assert.ok(Array.isArray(ex.setup), ex.id);
            if (ex.ordered) assert.match(ex.solution, /ORDER BY/i, `${ex.id}: an ordered exercise must sort in its solution`);
        }
    });

    it("the practice database setup is four tables, written once", () => {
        const text = SETUP.join("\n");
        for (const table of ["customers", "products", "orders", "order_items"]) assert.match(text, new RegExp(`CREATE TABLE ${table} `), table);
        assert.equal((text.match(/CREATE TABLE/g) ?? []).length, 4);
    });

    it("spot checks against hand counts of the data: delivered orders, the average price, customers with three orders, orders left", () => {
        const by = (id) => set.exercises.find((e) => e.id === id);
        assert.deepEqual(by("sql-count").expected.rows, [[12]]);
        assert.deepEqual(by("sql-min-max-avg").expected.rows, [[10, 1800, 595]]);
        assert.equal(by("sql-subquery").expected.rows.length, 4);
        assert.deepEqual(by("sql-having").expected.rows.sort(), [[1, 4], [2, 3], [4, 3]]);
        assert.deepEqual(by("sql-delete").expected.rows, [[18]]);
    });

});

describe("SQL Practice Lab: compareResults", () => {

    const expected = { columns: 2, rows: [["a", 1], ["b", 2]] };

    it("same rows in another order are the same unless an order is required", () => {
        assert.equal(compareResults(expected, result(["x", "y"], [["b", 2], ["a", 1]]), false).same, true);
        const ordered = compareResults(expected, result(["x", "y"], [["b", 2], ["a", 1]]), true);
        assert.equal(ordered.same, false);
        assert.equal(ordered.reason, "order");
    });

    it("column names do not matter; the number of columns does", () => {
        assert.equal(compareResults(expected, result(["p", "q"], [["a", 1], ["b", 2]]), false).same, true);
        const r = compareResults(expected, result(["p"], [["a"], ["b"]]), false);
        assert.deepEqual([r.same, r.reason], [false, "columns"]);
    });

    it("the number of rows and the values are told apart", () => {
        assert.equal(compareResults(expected, result(["x", "y"], [["a", 1]]), false).reason, "rows");
        assert.equal(compareResults(expected, result(["x", "y"], [["a", 1], ["b", 3]]), false).reason, "values");
    });

    it("whole numbers and decimals that are equal are equal; text is case sensitive; NULL equals NULL only", () => {
        assert.equal(compareResults({ columns: 1, rows: [[595]] }, result(["v"], [[595.0]]), false).same, true);
        assert.equal(compareResults({ columns: 1, rows: [[0.1 + 0.2]] }, result(["v"], [[0.3]]), false).same, true);
        assert.equal(compareResults({ columns: 1, rows: [["Pune"]] }, result(["v"], [["pune"]]), false).same, false);
        assert.equal(compareResults({ columns: 1, rows: [[null]] }, result(["v"], [[null]]), false).same, true);
        assert.equal(compareResults({ columns: 1, rows: [[null]] }, result(["v"], [["NULL"]]), false).same, false);
        assert.equal(compareResults({ columns: 1, rows: [[1]] }, result(["v"], [["1"]]), false).same, false);
    });

    it("the feedback never contains the expected values", () => {
        const secret = { columns: 1, rows: [["Hidden Value 7"]] };
        const r = compareResults(secret, result(["v"], [["other"]]), false);
        assert.doesNotMatch(JSON.stringify(r), /Hidden Value/);
    });

});

describe("SQL Practice Lab: the evaluator and what the worker can answer", () => {

    const exercise = (extra = {}) => ({ kind: "query", expected: { columns: 1, rows: [["x"]] }, ordered: false, setup: [], verify: null, ...extra });
    const evaluate = (reply, ex = exercise()) => createEvaluator({ run: async () => reply })(ex, "SELECT 1");

    it("an engine that could not start, a timeout and a SQL error are Cannot check, never Not yet", async () => {
        assert.equal((await evaluate({ ok: false, unavailable: true })).verdict, "cannot-check");
        const timeout = await evaluate({ ok: false, timedOut: true });
        assert.equal(timeout.verdict, "cannot-check");
        assert.match(timeout.summary, /3 seconds/);
        const error = await evaluate({ ok: false, error: "no such table: t" });
        assert.equal(error.verdict, "cannot-check");
        assert.deepEqual(error.findings, ["SQLite says: no such table: t"]);
    });

    it("a query with no result set is Not yet; an empty result is correct only when empty was expected", async () => {
        assert.equal((await evaluate({ ok: true, sets: [] })).verdict, "not-yet");
        assert.equal((await evaluate({ ok: true, sets: [] }, exercise({ kind: "modify", verify: "SELECT 1", expected: { columns: 1, rows: [] } }))).verdict, "correct");
        assert.equal((await evaluate({ ok: true, sets: [] }, exercise({ kind: "modify", verify: "SELECT 1" }))).verdict, "not-yet");
    });

    it("a matching result is Correct and shows the first rows; a data-changing exercise shows its check query when wrong", async () => {
        const ok = await evaluate({ ok: true, sets: [result(["name"], [["x"]])] });
        assert.equal(ok.verdict, "correct");
        assert.deepEqual(ok.lines, ["name", "x"]);
        const wrong = await evaluate({ ok: true, sets: [result(["n"], [["y"]])] }, exercise({ kind: "modify", verify: "SELECT n FROM t" }));
        assert.equal(wrong.verdict, "not-yet");
        assert.ok(wrong.findings.some((f) => f.includes("SELECT n FROM t")));
        assert.equal(wrong.lines.length, 0);
    });

    it("only the last result set counts for a query", async () => {
        const r = await evaluate({ ok: true, sets: [result(["a"], [["no"]]), result(["a"], [["x"]])] });
        assert.equal(r.verdict, "correct");
    });

    it("resultLines shows at most ten rows and says how many more", () => {
        const rows = Array.from({ length: 12 }, (_, i) => [i]);
        assert.equal(resultLines(result(["n"], rows, 12)).length, 12);
        assert.equal(resultLines(result(["n"], rows, 25)).at(-1), "... 15 more rows");
        assert.deepEqual(resultLines(result([], [], 0)), []);
    });

});
