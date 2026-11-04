/**
 * Power BI Practice Lab: the lessons. Each example's result is pinned with a value worked out by hand (not by the engines),
 * the structure is checked, every exercise a lesson lists exists and every exercise is listed by some lesson.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

let lessons, set, runExample, lessonsMarkup, deck;

before(async () => {
    ({ lessons } = await import("../../assets/js/tools/power-bi-practice-lab/lessons.js"));
    ({ set } = await import("../../assets/js/tools/power-bi-practice-lab/exercises.js"));
    ({ runExample, lessonsMarkup } = await import("../../assets/js/tools/power-bi-practice-lab/lessons-view.js"));
    ({ deck } = await import("../../assets/js/tools/smart-flashcards/decks/power-bi.js"));
});

// worked by hand: lesson id -> the result lines of each example, in order
const HAND = {
    types: [["OrderID | Amount", "1 | 1200", "2 | 300", "3 | null", "4 | Error"]],
    cleaning: [["ID | Name | City", "1 | Asha Rao | Pune", "2 | Bilal Khan | Delhi", "3 | Chitra Iyer | Pune"]],
    reshaping: [["ID | First | Last", "1 | Asha | Rao", "2 | Bilal | Khan", "3 | Dev | Kumar Singh"]],
    combining: [["OrderID | ProductID | Qty | Category", "1 | P3 | 2 | Grocery", "2 | P5 | 1 | Electronics", "3 | P9 | 4 | null"]],
    star: [["Orders[ProductID] -> Products[ProductID]"]],
    relationships: [["Orders[ProductID] -> Products[ProductID]"]],
    dates: [["All data: 912"]],
    measures: [["Category = Grocery: 2550"], ["All data: 400"]],
    context: [["City = Pune: 2850"], ["All data: 6800"]],
    calculate: [["Category = Grocery: 3300"], ["Category = Electronics: 0.485294"]],
    time: [["Month = 2024-03: 3800"], ["Month = 2024-03: 500"]]
};

describe("Power BI lessons", () => {

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
            if (l.examples.length === 0) { assert.ok(["workflow", "reporting"].includes(l.id), l.id); continue; }
            assert.equal(l.examples.length, HAND[l.id].length, l.id);
            l.examples.forEach((e, i) => {
                const r = runExample(e, e.script);
                assert.equal(r.ok, true, `${l.id} example ${i + 1}: ${r.note}`);
                assert.deepEqual(r.lines, HAND[l.id][i], `${l.id} example ${i + 1}`);
            });
        }
    });

    it("the orphan example warns about the orphan; an edited example is run and a broken one explains itself", () => {
        const orphan = lessons.find((l) => l.id === "relationships").examples[0];
        assert.match(runExample(orphan, orphan.script).note, /1 value with no match/);
        const q = lessons.find((l) => l.id === "types").examples[0];
        assert.deepEqual(runExample(q, "change type Amount as text").lines.slice(0, 2), ["OrderID | Amount", "1 | 1,200"]);
        assert.match(runExample(q, "change type Nope as number").note, /no column named/);
        const dax = lessons.find((l) => l.id === "measures").examples[0];
        assert.match(runExample(dax, "Total Sales = SUMM(Orders[Amount])").note, /not supported in this lab/);
    });

    it("every exercise a lesson lists exists, and every exercise is listed by some lesson", () => {
        const ids = new Set(set.exercises.map((x) => x.id));
        const listed = new Set(lessons.flatMap((l) => l.practise));
        for (const id of listed) assert.ok(ids.has(id), id);
        assert.deepEqual([...ids].filter((id) => !listed.has(id)), []);
    });

    it("the lessons markup escapes its text, has no script, and has one Run button per example", () => {
        const html = lessonsMarkup(lessons, set.exercises);
        assert.doesNotMatch(html, /<script/i);
        assert.equal((html.match(/data-pb-run/g) ?? []).length, lessons.reduce((n, l) => n + l.examples.length, 0));
        assert.match(html, /Orders\[ProductID\] -&gt; Products\[ProductID\]/);
    });

    it("every exercise topic is a deck topic, and the deck names its limits", () => {
        const topics = new Set(deck.topics.map((t) => t.id));
        for (const ex of set.exercises) assert.ok(topics.has(ex.topic), `${ex.id}: ${ex.topic}`);
        assert.match(deck.reviewed.method, /No second reviewer yet/);
        assert.equal(deck.cards.length, 33);
    });

});
