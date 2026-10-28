/**
 * Learning: the Leitner revision scheduler and the flashcard pass (assets/js/learning/).
 *
 * The date arithmetic is checked against Date.UTC, an independent route to the same day numbers, and the box
 * table is written out by hand below rather than computed with the scheduler's own functions.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    INTERVAL_DAYS, dayNumber, localDay, grade, dueDay, isDue, dueCards, nextDueAfter, countBoxes, dayToIso, isDay, isEntry, intervalOf
} from "../../assets/js/learning/scheduler.js";
import {
    startPass, current, gradeCurrent, advance, back, canAdvance, missedCards, summarize, resultOf, seededRandom, shuffled
} from "../../assets/js/learning/session.js";

const utcDay = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 86400000);

describe("day numbers", () => {

    it("match Date.UTC for every day over 1969-2101", () => {
        for (let y = 1969; y <= 2101; y += 1) {
            for (const m of [1, 2, 3, 6, 10, 12]) {
                for (const d of [1, 15, 28]) assert.equal(dayNumber(y, m, d), utcDay(y, m, d), `${y}-${m}-${d}`);
            }
        }
    });

    it("count leap days: 2028-02-28 plus 2 is 2028-03-01, and 2027-02-28 plus 1 is 2027-03-01", () => {
        assert.equal(dayNumber(2028, 3, 1) - dayNumber(2028, 2, 28), 2);
        assert.equal(dayNumber(2027, 3, 1) - dayNumber(2027, 2, 28), 1);
        assert.equal(dayNumber(1900, 3, 1) - dayNumber(1900, 2, 28), 1);
        assert.equal(dayNumber(2000, 3, 1) - dayNumber(2000, 2, 28), 2);
    });

    it("dayToIso is the inverse", () => {
        for (const [y, m, d] of [[1970, 1, 1], [2024, 2, 29], [2028, 12, 31], [2100, 3, 1], [2026, 10, 28]]) {
            const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            assert.equal(dayToIso(dayNumber(y, m, d)), iso);
        }
    });

    it("localDay uses the local calendar date, so a daylight-saving change cannot move it", () => {
        assert.equal(localDay(new Date(2024, 2, 10, 2, 30)), dayNumber(2024, 3, 10));
        assert.equal(localDay(new Date(2024, 10, 3, 1, 30)), dayNumber(2024, 11, 3));
        assert.equal(localDay(new Date(2026, 9, 25, 23, 59, 59)), dayNumber(2026, 10, 25));
        assert.equal(localDay(new Date(2026, 9, 26, 0, 0, 0)), dayNumber(2026, 10, 26));
    });

    it("rejects values that are not a day", () => {
        for (const v of [-1, 1.5, NaN, Infinity, "5", null, undefined, 3_000_000]) assert.equal(isDay(v), false, String(v));
        assert.equal(isDay(0), true);
    });

});

describe("intervals", () => {

    it("are 1, 3, 7, 14 and 30 days", () => {
        assert.deepEqual([...INTERVAL_DAYS], [1, 3, 7, 14, 30]);
        assert.deepEqual([1, 2, 3, 4, 5].map(intervalOf), [1, 3, 7, 14, 30]);
        assert.throws(() => intervalOf(0));
        assert.throws(() => intervalOf(6));
    });

});

describe("grading", () => {

    it("follows the hand-written table for a card known on every review, then forgotten", () => {
        /* [grade day, known] -> [box after, next due day] */
        const table = [
            [100, true, 2, 103],
            [103, true, 3, 110],
            [110, true, 4, 124],
            [124, true, 5, 154],
            [154, true, 5, 184],
            [184, false, 1, 185]
        ];
        let entry;
        for (const [day, known, box, due] of table) {
            entry = grade(entry, known, day);
            assert.equal(entry.box, box, `box on day ${day}`);
            assert.equal(entry.day, day);
            assert.equal(dueDay(entry), due, `due after day ${day}`);
        }
    });

    it("puts a new card in box 1 when it is not known", () => {
        assert.deepEqual(grade(undefined, false, 50), { box: 1, day: 50 });
    });

    it("never goes above box 5 or below box 1", () => {
        let e = { box: 5, day: 10 };
        assert.equal(grade(e, true, 40).box, 5);
        assert.equal(grade({ box: 1, day: 1 }, false, 2).box, 1);
    });

    it("treats an invalid saved entry as a new card", () => {
        assert.equal(grade({ box: 9, day: 1 }, true, 5).box, 2);
        assert.equal(grade("x", true, 5).box, 2);
    });

    it("refuses an invalid today", () => {
        assert.throws(() => grade(undefined, true, -3), RangeError);
        assert.throws(() => grade(undefined, true, NaN), RangeError);
    });

});

describe("when a card is due", () => {

    it("is due on the review day plus the interval and not the day before", () => {
        const e = { box: 3, day: 200 };
        assert.equal(isDue(e, 206), false);
        assert.equal(isDue(e, 207), true);
        assert.equal(isDue(e, 400), true);
    });

    it("counts the leap day: box 2 reviewed on 2028-02-28 is due on 2028-03-02 (not 2028-03-01)", () => {
        const e = { box: 2, day: utcDay(2028, 2, 28) };
        assert.equal(isDue(e, utcDay(2028, 3, 1)), false);
        assert.equal(isDue(e, utcDay(2028, 3, 2)), true);
        assert.equal(dayToIso(dueDay(e)), "2028-03-02");
    });

    it("is not moved by a month end: box 1 reviewed on 2026-10-31 is due on 2026-11-01", () => {
        const e = { box: 1, day: utcDay(2026, 10, 31) };
        assert.equal(dayToIso(dueDay(e)), "2026-11-01");
    });

    it("treats a last review in the future (the clock went back) as due today", () => {
        assert.equal(isDue({ box: 5, day: 500 }, 100), true);
    });

    it("a card that was never reviewed or has an invalid entry is not 'due'", () => {
        assert.equal(isDue(undefined, 10), false);
        assert.equal(isDue({ box: 0, day: 1 }, 10), false);
        assert.throws(() => dueDay({}), TypeError);
    });

    it("lists due cards lowest box first, then in deck order", () => {
        const ids = ["a", "b", "c", "d", "e"];
        const entries = {
            a: { box: 3, day: 0 },
            b: { box: 1, day: 0 },
            c: { box: 1, day: 10 },
            d: { box: 2, day: 0 }
        };
        assert.deepEqual(dueCards(ids, entries, 10), ["b", "d", "a"]);
        assert.deepEqual(dueCards(ids, entries, 11), ["b", "c", "d", "a"]);
        /* a last review in the future counts as due today */
        assert.deepEqual(dueCards(ids, { c: { box: 1, day: 500 } }, 10), ["c"]);
        assert.deepEqual(dueCards(ids, {}, 10), []);
    });

    it("ignores an id that is an inherited property", () => {
        assert.deepEqual(dueCards(["toString", "constructor"], {}, 5), []);
    });

    it("finds the next future due day", () => {
        const ids = ["a", "b"];
        const entries = { a: { box: 2, day: 10 }, b: { box: 1, day: 10 } };
        assert.equal(nextDueAfter(ids, entries, 10), 11);
        assert.equal(nextDueAfter(ids, entries, 20), null);
    });

    it("counts cards per box and unseen cards", () => {
        const c = countBoxes(["a", "b", "c"], { a: { box: 2, day: 1 }, b: { box: 2, day: 1 } });
        assert.deepEqual(c, { boxes: [0, 2, 0, 0, 0], unseen: 1 });
    });

    it("validates an entry", () => {
        assert.equal(isEntry({ box: 1, day: 0 }), true);
        for (const v of [null, {}, { box: 1 }, { box: 6, day: 1 }, { box: 1.5, day: 1 }, { box: 1, day: -1 }, "1"]) assert.equal(isEntry(v), false);
    });

});

describe("a flashcard pass", () => {

    const cards = [
        { id: "a", topic: "t1", kind: "recall" },
        { id: "b", topic: "t1", kind: "choice" },
        { id: "c", topic: "t2", kind: "recall" }
    ];

    it("starts at the first card and cannot advance until it is graded", () => {
        let p = startPass(cards);
        assert.equal(current(p).id, "a");
        assert.equal(canAdvance(p), false);
        assert.equal(advance(p), p);
    });

    it("grades a card once: a second grade is ignored", () => {
        let p = startPass(cards);
        p = gradeCurrent(p, true, "self");
        const again = gradeCurrent(p, false, "self");
        assert.equal(again, p);
        assert.equal(resultOf(p, "a").known, true);
    });

    it("records the kind of evidence and the choice", () => {
        let p = startPass(cards);
        p = advance(gradeCurrent(p, true, "self"));
        p = gradeCurrent(p, false, "answer", 2);
        assert.deepEqual(resultOf(p, "b"), { known: false, evidence: "answer", choice: 2 });
    });

    it("finishes after the last card and summarises with plain counts", () => {
        let p = startPass(cards);
        p = advance(gradeCurrent(p, true, "self"));
        p = advance(gradeCurrent(p, false, "answer", 0));
        assert.equal(p.finished, false);
        p = advance(gradeCurrent(p, true, "self"));
        assert.equal(p.finished, true);
        assert.equal(current(p), null);
        const s = summarize(p);
        assert.deepEqual({ total: s.total, seen: s.seen, known: s.known, notKnown: s.notKnown, remaining: s.remaining }, { total: 3, seen: 3, known: 2, notKnown: 1, remaining: 0 });
        assert.deepEqual(s.byTopic.t1, { known: 1, notKnown: 1 });
        assert.deepEqual(s.byTopic.t2, { known: 1, notKnown: 0 });
        assert.deepEqual(missedCards(p).map((c) => c.id), ["b"]);
        assert.equal(Object.hasOwn(s, "score") || Object.hasOwn(s, "percent"), false);
    });

    it("goes back to an earlier card without changing its result", () => {
        let p = startPass(cards);
        p = advance(gradeCurrent(p, false, "self"));
        p = back(p);
        assert.equal(current(p).id, "a");
        assert.equal(resultOf(p, "a").known, false);
        assert.equal(back(p), p);
    });

    it("handles an empty list and a single card", () => {
        const empty = startPass([]);
        assert.equal(empty.finished, true);
        assert.equal(current(empty), null);
        let one = startPass([cards[0]]);
        one = advance(gradeCurrent(one, true, "self"));
        assert.equal(one.finished, true);
    });

    it("drops duplicate and invalid cards", () => {
        const p = startPass([cards[0], cards[0], null, { id: 5 }, cards[1]]);
        assert.deepEqual(p.cards.map((c) => c.id), ["a", "b"]);
    });

    it("rapid repeated actions change nothing the second time", () => {
        let p = startPass(cards);
        p = gradeCurrent(p, true, "self");
        const q = advance(advance(advance(p)));
        assert.equal(q.index, 1);
    });

    it("shuffles reproducibly with a seed, keeping every card once", () => {
        const items = Array.from({ length: 20 }, (_, i) => ({ id: `c${i}`, topic: "t", kind: "recall" }));
        const a = startPass(items, { random: seededRandom(7) }).cards.map((c) => c.id);
        const b = startPass(items, { random: seededRandom(7) }).cards.map((c) => c.id);
        const c = startPass(items, { random: seededRandom(8) }).cards.map((c2) => c2.id);
        assert.deepEqual(a, b);
        assert.notDeepEqual(a, c);
        assert.deepEqual([...a].sort(), items.map((i) => i.id).sort());
        assert.deepEqual(shuffled([1, 2, 3], seededRandom(1)).sort(), [1, 2, 3]);
    });

});
