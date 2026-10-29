/**
 * Learning engines: timing and growth (Stage 3; AC-PERF-02 pure part, AC-PERF-05, AC-SEC-06, AC-SEC-07).
 *
 * Thresholds are the acceptance limits (or looser where the criterion names a reference laptop), so a slow machine does
 * not fail them while an accidental quadratic loop would. This measures the pure modules only: DOM node counts, heap
 * growth and listener counts need a browser and are reported separately.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { dueCards, countBoxes, nextDueAfter, grade } from "../../assets/js/learning/scheduler.js";
import { startPass, gradeCurrent, advance, summarize } from "../../assets/js/learning/session.js";
import { validateState, readText, serialize, readImport, exportText, MAX_BYTES } from "../../assets/js/learning/progress-store.js";

const time = (fn) => { const t = process.hrtime.bigint(); const r = fn(); return { ms: Number(process.hrtime.bigint() - t) / 1e6, r }; };

const cards = (n) => Array.from({ length: n }, (_, i) => ({ id: `c${i}`, topic: "t", kind: "recall", prompt: "p", answer: "a", explanation: "e" }));

describe("session and scheduler on a generated 500-card deck", () => {

    it("starts a pass in well under 300 ms and walks all 500 cards with the summary correct at the end", () => {
        const deck = cards(500);
        const start = time(() => startPass(deck, { random: Math.random }));
        assert.ok(start.ms < 300, `${start.ms} ms`);
        let pass = start.r;
        // the session functions return a new pass each time, so the result must be kept
        const walk = time(() => {
            for (let i = 0; i < 500; i += 1) pass = advance(gradeCurrent(pass, i % 3 !== 0, "self"));
        });
        assert.ok(walk.ms < 500, `${walk.ms} ms`);
        assert.equal(pass.finished, true);
        const s = summarize(pass);
        assert.equal(s.seen, 500);
        assert.equal(s.known + s.notKnown, 500);
        assert.equal(s.known, 333);
    });

    it("progress calculation over 500 reviewed cards takes under 50 ms (AC-PERF-05)", () => {
        const ids = deckIds(500);
        const entries = {};
        ids.forEach((id, i) => { entries[id] = { box: (i % 5) + 1, day: 20000 + (i % 40) }; });
        const { ms } = time(() => {
            for (let k = 0; k < 20; k += 1) { dueCards(ids, entries, 20030); countBoxes(ids, entries); nextDueAfter(ids, entries, 20030); }
        });
        assert.ok(ms / 20 < 50, `${ms / 20} ms per round`);
    });

    it("grading 100,000 times does not slow down or change the entry shape (no state grows with the number of actions)", () => {
        let entry;
        const { ms } = time(() => { for (let i = 0; i < 100000; i += 1) entry = grade(entry, i % 7 !== 0, 20000 + i % 400); });
        assert.ok(ms < 1500, `${ms} ms`);
        assert.deepEqual(Object.keys(entry).sort(), ["box", "day"]);
    });

});

const deckIds = (n) => Array.from({ length: n }, (_, i) => `c${i}`);

describe("progress storage: size limit and import speed (AC-SEC-06)", () => {

    const known = { d: { version: "1", cardIds: new Set(deckIds(2000)) } };

    it("a file of exactly the limit parses and validates in under a second; one character over is refused before parsing", () => {
        const cardsObj = {};
        deckIds(1500).forEach((id, i) => { cardsObj[id] = { box: 1 + (i % 5), day: 20000 + i }; });
        let text = JSON.stringify({ format: "toolzenhub-flashcards-progress", v: 1, decks: { d: { version: "1", cards: cardsObj } } });
        assert.ok(text.length < MAX_BYTES);
        text = text.slice(0, -1) + " ".repeat(MAX_BYTES - text.length) + "}";
        assert.equal(text.length, MAX_BYTES);
        const ok = time(() => readImport(text, known));
        assert.ok(ok.ms < 1000, `${ok.ms} ms`);
        assert.equal(ok.r.error, undefined);
        assert.equal(ok.r.keptCards, 1500);
        const over = time(() => readImport(text + " ", known));
        assert.match(over.r.error, /larger than 100 KB/);
        assert.ok(over.ms < 50);
    });

    it("saved text over the limit is ignored with a notice, never parsed, and a full state refuses to serialise", () => {
        const r = readText("x".repeat(MAX_BYTES + 1), known);
        assert.equal(r.rejected, true);
        const state = { v: 1, decks: { d: { version: "1", cards: Object.fromEntries(deckIds(4000).map((id) => [id, { box: 5, day: 2932896 }])) } } };
        assert.throws(() => serialize(state), RangeError);
    });

    it("validation of a 2,000-card state is fast and drops nothing valid", () => {
        const state = { v: 1, decks: { d: { version: "1", cards: Object.fromEntries(deckIds(2000).map((id) => [id, { box: 3, day: 20000 }])) } } };
        const { ms, r } = time(() => validateState(state, known));
        assert.ok(ms < 100, `${ms} ms`);
        assert.equal(r.keptCards, 2000);
        assert.ok(exportText(r.state).length > 0);
    });

});
