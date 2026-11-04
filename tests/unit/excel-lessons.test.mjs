/**
 * Excel Practice Lab: the lessons. Each example's result is pinned with a value worked out by hand (not by the engine), the
 * structure is checked, and every exercise a lesson lists exists.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let lessons, set, runExample, lessonsMarkup;

before(async () => {
    ({ lessons } = await import("../../assets/js/tools/excel-practice-lab/lessons.js"));
    ({ set } = await import("../../assets/js/tools/excel-practice-lab/exercises.js"));
    ({ runExample, lessonsMarkup } = await import("../../assets/js/tools/excel-practice-lab/lessons-view.js"));
});

// worked by hand: lesson id -> the "address: value" lines of each example, in order
const HAND = {
    orientation: [["A1: 14"], ["B4: 1350"]],
    references: [["B4: 18", "B5: 45", "B6: 14.4"], ["B4: 18", "B5: 0", "B6: 0"]],
    summaries: [["B8: 11870"], ["B1: 2 / 3 / 1"]],
    numbers: [["A1: 3 -3"], ["C1: 20 boxes, 10 left"]],
    decisions: [["C2: B"], ["B4: no data"]],
    conditional: [["C7: 330"], ["C7: 3"]],
    text: [["B1: ELE / 0425"], ["B1: Asha, Bilal"]],
    dates: [["A1: 45322 -> 45351"], ["B3: 29"]],
    lookups: [["E2: 150"], ["E2: #N/A"], ["E2: 105"]],
    cleaning: [["B2: Asha Rao"], ["B2: Unique", "B3: Unique", "B4: Duplicate"]],
    finance: [["B4: 10379.18"], ["A1: 12682.5"]],
    errors: [["A1: #NAME?"], ["A2: #VALUE!"]]
};

describe("Excel lessons", () => {

    it("has 13 lessons, the first beginner, each with teaching text and common mistakes", () => {
        assert.equal(lessons.length, 13);
        assert.equal(lessons[0].level, "beginner");
        assert.equal(new Set(lessons.map((l) => l.id)).size, 13);
        for (const l of lessons) {
            assert.ok(l.intro.length > 80 && l.points.length >= 3 && l.mistakes.length >= 1, l.id);
            assert.ok(["beginner", "intermediate", "advanced"].includes(l.level), l.id);
        }
    });

    it("every example gives the result worked out by hand", () => {
        for (const l of lessons) {
            if (l.examples.length === 0) { assert.equal(l.id, "beyond"); continue; }
            assert.equal(l.examples.length, HAND[l.id].length, l.id);
            l.examples.forEach((e, i) => assert.deepEqual(runExample(e, e.formula).lines, HAND[l.id][i], `${l.id} example ${i + 1}`));
        }
    });

    it("an edited example formula is calculated, and a broken one explains itself", () => {
        const e = lessons[0].examples[1];
        assert.deepEqual(runExample(e, "=B2+B3").lines, ["B4: 453"]);
        assert.equal(runExample(e, "B2*B3").ok, false);
        assert.match(runExample(e, "=B2*(B3").note, /bracket/);
        assert.match(runExample(lessons.find((l) => l.id === "errors").examples[0], "=SUMM(1,2)").note, /does not support|not recogni/i);
    });

    it("every exercise a lesson lists exists, and every exercise is listed by some lesson", () => {
        const ids = new Set(set.exercises.map((x) => x.id));
        const listed = new Set(lessons.flatMap((l) => l.practise));
        for (const id of listed) assert.ok(ids.has(id), id);
        assert.deepEqual([...ids].filter((id) => !listed.has(id)), []);
    });

    it("the lessons markup escapes its text, has no script, and has one Calculate button per example", () => {
        const html = lessonsMarkup(lessons, set.exercises);
        assert.doesNotMatch(html, /<script/i);
        assert.equal((html.match(/data-xl-run/g) ?? []).length, lessons.reduce((n, l) => n + l.examples.length, 0));
        assert.match(html, /value="=IF\(COUNTIF\(\$A\$2:A2,A2\)&gt;1/);
    });

});
