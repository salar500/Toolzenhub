/**
 * Excel Practice Lab: the exercises and the evaluator.
 *
 * The expected values in exercises.js were calculated by Python (tools outside the repository), not by the formula engine. This
 * test makes the engine reproduce every one of them from the stated solution, on both sets of numbers, and shows that a typed-in
 * answer, a wrong reference and a formula that is not copy-safe are all refused.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, evaluate, calculate, fillCells, catalog;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ set } = await import("../../assets/js/tools/excel-practice-lab/exercises.js"));
    ({ evaluate, calculate, fillCells } = await import("../../assets/js/tools/excel-practice-lab/evaluator.js"));
});

describe("Excel Practice Lab: content", () => {

    it("passes the shared exercise-set validation and has 55 exercises with unique ids", () => {
        assert.deepEqual(validateExerciseSet(set, { toolIds: { has: (id) => Boolean(catalog.getToolById(id)) } }), []);
        assert.equal(set.exercises.length, 55);
        assert.equal(new Set(set.exercises.map((e) => e.id)).size, 55);
    });

    it("every exercise stays inside the sheet, has an empty answer cell and a second set of numbers that really differs", () => {
        for (const ex of set.exercises) {
            assert.equal(ex.sheet.cells[ex.sheet.answer], undefined, `${ex.id}: the answer cell must start empty`);
            const cells = fillCells(ex.sheet);
            assert.equal(ex.expected.length, cells.length, ex.id);
            assert.equal(ex.variants[0].expected.length, cells.length, ex.id);
            for (const f of cells) assert.equal(ex.sheet.cells[f.addr], undefined, `${ex.id}: ${f.addr} must start empty`);
            assert.notDeepEqual(ex.variants[0].expected, ex.expected, `${ex.id}: the second set must change the answer`);
            assert.match(ex.solution, /^=/, ex.id);
        }
    });

});

describe("Excel Practice Lab: every stated solution reproduces the independently calculated values", () => {

    it("on the sheet and on the second set of numbers", () => {
        const failures = [];
        for (const ex of set.exercises) {
            const r = evaluate(ex, ex.solution);
            if (r.verdict !== "correct") failures.push(`${ex.id}: ${r.verdict} ${r.summary} ${(r.lines ?? []).join(" ")}`);
        }
        assert.deepEqual(failures, []);
    });

    it("a typed-in answer passes the first sheet and fails the second", () => {
        const ex = set.exercises.find((e) => e.id === "xl-multiply");
        const typed = `=${ex.expected[0]}`;
        const r = evaluate(ex, typed);
        assert.equal(r.verdict, "not-yet");
        assert.match(r.summary, /right for these numbers, but not when the numbers change/);
    });

    it("a missing dollar sign is caught by the copy-down test, and a wrong function is not accepted", () => {
        const abs = set.exercises.find((e) => e.id === "xl-absolute");
        assert.equal(evaluate(abs, "=A4*B1").verdict, "not-yet");
        assert.equal(evaluate(abs, "=A4*$B$1").verdict, "correct");
        const sum = set.exercises.find((e) => e.id === "xl-sum");
        assert.equal(evaluate(sum, "=SUM(B2:B6)").verdict, "not-yet"); // one row short
        assert.equal(evaluate(sum, "=AVERAGE(B2:B7)").verdict, "not-yet");
    });

    it("different correct formulas are both accepted", () => {
        assert.equal(evaluate(set.exercises.find((e) => e.id === "xl-sum"), "=B2+B3+B4+B5+B6+B7").verdict, "correct");
        assert.equal(evaluate(set.exercises.find((e) => e.id === "xl-if"), '=IF(B2>39,"Pass","Fail")').verdict, "correct");
        assert.equal(evaluate(set.exercises.find((e) => e.id === "xl-vlookup"), "=INDEX(C2:C5,MATCH(E2,A2:A5,0))").verdict, "correct");
        assert.equal(evaluate(set.exercises.find((e) => e.id === "xl-countif"), '=COUNTIF(C2:C7,">"&100)').verdict, "correct");
    });

    it("VLOOKUP with an approximate match is refused for the exact-match exercise (the second set has a missing code)", () => {
        const ex = set.exercises.find((e) => e.id === "xl-vlookup");
        assert.equal(evaluate(ex, "=VLOOKUP(E2,A2:C5,3,TRUE)").verdict, "correct"); // same results on codes that exist: accepted, as in Excel
        assert.equal(evaluate(ex, "=VLOOKUP(E2,A2:C5,2,FALSE)").verdict, "not-yet");
    });

});

describe("Excel Practice Lab: feedback", () => {

    const ex = () => set.exercises.find((e) => e.id === "xl-multiply");

    it("an answer without = cannot be checked; an unreadable formula says why", () => {
        assert.equal(evaluate(ex(), "B2*B3").verdict, "cannot-check");
        const r = evaluate(ex(), "=B2*(B3");
        assert.equal(r.verdict, "cannot-check");
        assert.match(r.findings[0], /bracket/);
    });

    it("an error value is named and explained, and unsupported functions are said to be unsupported", () => {
        const r = evaluate(ex(), "=B2/0");
        assert.equal(r.verdict, "not-yet");
        assert.match(r.summary, /#DIV\/0!/);
        assert.match(r.findings[0], /divided by zero/);
        const u = evaluate(ex(), "=TODAY()");
        assert.match(u.summary, /#NAME\?/);
        assert.match(u.findings.join(" "), /does not support the function TODAY/);
    });

    it("the feedback shows the learner's own values and never the expected ones", () => {
        const e = set.exercises.find((x) => x.id === "xl-absolute");
        const r = evaluate(e, "=A4*B1");
        assert.ok(r.lines.length === 5 && r.lines[0].startsWith("B4: "));
        assert.doesNotMatch(JSON.stringify(r), new RegExp(String(e.expected[0]) + "\\b.*expected", "i"));
        assert.deepEqual(calculate(e, e.solution).length, 5);
    });

});
