/**
 * Power BI Practice Lab: the stated solution of every exercise is accepted by the evaluator, wrong attempts are refused, and
 * the exercises are well formed. Expected values come from a separate Python script (pbi_gen.py), not from the engines.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

let set, evaluate, validateExerciseSet;

before(async () => {
    ({ set } = await import("../../assets/js/tools/power-bi-practice-lab/exercises.js"));
    ({ evaluate } = await import("../../assets/js/tools/power-bi-practice-lab/evaluator.js"));
    ({ validateExerciseSet } = await import("../../assets/js/learning/content-schema.js"));
});

describe("Power BI exercises", () => {

    it("the set is well formed", () => {
        assert.deepEqual(validateExerciseSet(set), []);
        assert.equal(set.id, "power-bi-practice");
        assert.match(set.reviewed.method, /No second reviewer yet/);
    });

    it("every stated solution is accepted", () => {
        const bad = [];
        for (const ex of set.exercises) {
            const r = evaluate(ex, ex.solution);
            if (r.verdict !== "correct") bad.push(`${ex.id}: ${r.verdict} ${r.summary} ${(r.findings ?? []).join(" ")}`);
        }
        assert.deepEqual(bad, []);
    });

    it("an empty or nonsense answer is never correct", () => {
        for (const ex of set.exercises) {
            for (const text of ["x", "SUM(", "// nothing", "Total = 1"]) {
                assert.notEqual(evaluate(ex, text).verdict, "correct", `${ex.id} accepted ${text}`);
            }
        }
    });
});
