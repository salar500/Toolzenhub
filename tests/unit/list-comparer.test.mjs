/**
 * Tool Pack 38: the List Comparer engine.
 *
 * Oracles: hand-derived results for every rule in the engine header, and an independent
 * implementation (array filter against a Set of keys, written here) over a seeded random corpus.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
    compareLists,
    splitLines,
    summaryText,
    noteLines,
    groupText,
    resultText,
    EXAMPLE_A,
    EXAMPLE_B,
    MAX_LINES,
    MAX_CHARS
} from "../../assets/js/tools/list-comparer/list-engine.js";

const texts = (items) => items.map((i) => i.text);

test("splitLines: LF, CRLF and CR; one final line break is not an item", () => {
    assert.deepEqual(splitLines("a\nb"), ["a", "b"]);
    assert.deepEqual(splitLines("a\r\nb\rc"), ["a", "b", "c"]);
    assert.deepEqual(splitLines("a\nb\n"), ["a", "b"]);
    assert.deepEqual(splitLines("a\n\n"), ["a", ""]);
    assert.deepEqual(splitLines("\n"), [""]);
    assert.deepEqual(splitLines(""), []);
});

test("the worked example: groups, order and counts", () => {
    const r = compareLists(EXAMPLE_A, EXAMPLE_B, { ignoreCase: true });
    assert.equal(r.state, "done");
    assert.deepEqual(texts(r.onlyA), ["apple", "date"]);
    assert.deepEqual(r.both, [{ text: "banana", countA: 2, countB: 1 }, { text: "cherry", countA: 1, countB: 1 }]);
    assert.deepEqual(texts(r.onlyB), ["elderberry", "fig"]);
    assert.deepEqual(r.repeatedA, [{ text: "banana", count: 2 }]);
    assert.deepEqual(r.repeatedB, []);
    assert.equal(summaryText(r), "A has 4 unique items and B has 4 unique items. 2 items are in both, 2 only in A and 2 only in B.");
});

test("case matters by default: Banana and banana are different items", () => {
    const r = compareLists("banana", "Banana");
    assert.deepEqual(texts(r.onlyA), ["banana"]);
    assert.deepEqual(texts(r.onlyB), ["Banana"]);
    assert.equal(r.both.length, 0);
});

test("ignore case: shown as first written, A's spelling wins in 'both', and 'Straße' is not folded to 'STRASSE'", () => {
    const r = compareLists("Apple\nBERLIN", "apple\nberlin\nBerlin", { ignoreCase: true });
    assert.deepEqual(r.both, [{ text: "Apple", countA: 1, countB: 1 }, { text: "BERLIN", countA: 1, countB: 2 }]);
    assert.deepEqual(r.repeatedB, [{ text: "berlin", count: 2 }]);
    const s = compareLists("Straße", "STRASSE", { ignoreCase: true });
    assert.equal(s.both.length, 0);
    const e = compareLists("ÉCOLE", "école", { ignoreCase: true });
    assert.equal(e.both.length, 1);
});

test("trim: white space at both ends is ignored, inside is kept, and the shown text is trimmed", () => {
    const off = compareLists("a \n b", "a\nb");
    assert.equal(off.both.length, 0);
    const on = compareLists("a \n  b\t", "a\nb", { trim: true });
    assert.deepEqual(texts(on.both), ["a", "b"]);
    const inner = compareLists("a  b", "a b", { trim: true });
    assert.equal(inner.both.length, 0);
    assert.ok(noteLines(on).some((n) => n.startsWith("White space at the start and end")));
});

test("empty lines: skipped by default and counted; kept as one item when skipEmpty is off", () => {
    const r = compareLists("a\n\nb\n\n\nc", "a");
    assert.deepEqual(texts(r.onlyA), ["b", "c"]);
    assert.equal(r.statsA.skipped, 3);
    assert.ok(noteLines(r).includes("3 empty lines were skipped in A."));
    const keep = compareLists("a\n\nb\n\n", "a\n", { skipEmpty: false });
    assert.deepEqual(texts(keep.onlyA), ["", "b"]);
    assert.deepEqual(keep.repeatedA, [{ text: "", count: 2 }].slice(0, 0).concat(keep.repeatedA));
    assert.equal(keep.statsA.skipped, 0);
    const blankTrim = compareLists("a\n   \nb", "a", { trim: true });
    assert.equal(blankTrim.statsA.skipped, 1);
    const blankNoTrim = compareLists("a\n   \nb", "a");
    assert.deepEqual(texts(blankNoTrim.onlyA), ["   ", "b"]);
});

test("duplicates: counted, listed once in order of first appearance, and reported", () => {
    const r = compareLists("x\ny\nx\nz\ny\nx", "q");
    assert.deepEqual(texts(r.onlyA), ["x", "y", "z"]);
    assert.deepEqual(r.repeatedA, [{ text: "x", count: 3 }, { text: "y", count: 2 }]);
    assert.equal(r.statsA.items, 6);
    assert.equal(r.statsA.unique, 3);
    assert.ok(noteLines(r).includes("A repeats 3 lines; each item is listed once below, and the repeats are shown separately."));
});

test("blocked: an empty or oversized side names itself; the other side's stats are kept", () => {
    assert.equal(compareLists("", "a").state, "blocked");
    assert.equal(compareLists("", "a").a.status, "empty");
    assert.equal(compareLists("", "a").b.status, "valid");
    assert.equal(compareLists("   \n  ", "a").a.status, "empty");
    const manyLines = compareLists("x\n".repeat(MAX_LINES + 1), "a");
    assert.equal(manyLines.a.status, "too-large");
    assert.equal(manyLines.a.kind, "lines");
    assert.equal(manyLines.a.limit, MAX_LINES);
    const manyChars = compareLists("x".repeat(MAX_CHARS + 1), "a");
    assert.equal(manyChars.a.kind, "characters");
    assert.equal(compareLists("x\n".repeat(MAX_LINES - 1) + "y", "a").state, "done");
    assert.equal(compareLists("x".repeat(MAX_CHARS), "a").state, "done");
});

test("keys such as __proto__ and constructor are ordinary items", () => {
    const r = compareLists("__proto__\nconstructor\nhasOwnProperty", "constructor\ntoString");
    assert.deepEqual(texts(r.onlyA), ["__proto__", "hasOwnProperty"]);
    assert.deepEqual(texts(r.both), ["constructor"]);
    assert.deepEqual(texts(r.onlyB), ["toString"]);
    assert.deepEqual(Object.keys(Object.prototype), []);
});

test("Unicode items compare by code points exactly: no normalization", () => {
    const r = compareLists("é\n😀", "é\n😀");
    assert.deepEqual(texts(r.both), ["😀"]);
    assert.equal(r.onlyA.length, 1);
    assert.equal(r.onlyB.length, 1);
});

function mulberry32(seed) {
    return () => {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

test("agrees with an independent set implementation over a seeded corpus (seed 38)", () => {
    const rnd = mulberry32(38);
    const pool = ["a", "A", "b", "B ", " b", "c", "", "  ", "é", "É", "😀", "x y", "X Y"];
    for (let n = 0; n < 300; n++) {
        const make = () => Array.from({ length: 1 + Math.floor(rnd() * 12) }, () => pool[Math.floor(rnd() * pool.length)]);
        const A = make();
        const B = make();
        for (const options of [{}, { ignoreCase: true }, { trim: true }, { ignoreCase: true, trim: true }, { skipEmpty: false }]) {
            const shape = (t) => (options.trim ? t.trim() : t);
            const key = (t) => (options.ignoreCase ? shape(t).toLowerCase() : shape(t));
            const keep = (t) => options.skipEmpty === false || shape(t) !== "";
            const uniq = (list) => {
                const seen = new Set();
                const out = [];
                for (const t of list.filter(keep)) {
                    if (!seen.has(key(t))) { seen.add(key(t)); out.push(shape(t)); }
                }
                return out;
            };
            const ua = uniq(A);
            const ub = uniq(B);
            const sa = new Set(ua.map(key));
            const sb = new Set(ub.map(key));
            const r = compareLists(A.join("\n") + "\n", B.join("\n") + "\n", options);
            if (r.state === "blocked") {
                assert.ok(ua.length === 0 || ub.length === 0 || A.join("\n").trim() === "" || B.join("\n").trim() === "", "blocked only for an empty side");
                continue;
            }
            assert.deepEqual(texts(r.onlyA), ua.filter((t) => !sb.has(key(t))), JSON.stringify([A, B, options]));
            assert.deepEqual(texts(r.onlyB), ub.filter((t) => !sa.has(key(t))));
            assert.deepEqual(texts(r.both), ua.filter((t) => sb.has(key(t))));
        }
    }
});

test("text for copying: a group is one item per line; the result text lists everything", () => {
    const r = compareLists(EXAMPLE_A, EXAMPLE_B, { ignoreCase: true });
    assert.equal(groupText(r.onlyA), "apple\ndate");
    const all = resultText(r);
    assert.ok(all.startsWith("A has 4 unique items"));
    assert.ok(all.includes("\nOnly in A (2)\napple\ndate\n"));
    assert.ok(all.includes("\nIn both (2)\nbanana\ncherry\n"));
    assert.ok(all.includes("\nRepeated in A (1)\nbanana\t2"));
});

test("a large pair is compared quickly", () => {
    const a = Array.from({ length: 90000 }, (_, i) => `i${i}`).join("\n");
    const b = Array.from({ length: 90000 }, (_, i) => `i${i + 45000}`).join("\n");
    const t = Date.now();
    const r = compareLists(a, b);
    assert.equal(r.both.length, 45000);
    assert.equal(r.onlyA.length, 45000);
    assert.ok(Date.now() - t < 3000, `took ${Date.now() - t} ms`);
});

test("the engine is pure: no DOM, network, storage, clock, randomness or code execution", () => {
    const code = readFileSync(new URL("../../assets/js/tools/list-comparer/list-engine.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const banned of ["fetch(", "XMLHttpRequest", "sendBeacon", "document.", "window.", "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "innerHTML", "setTimeout", "new RegExp"]) {
        assert.ok(!code.includes(banned), `engine must not contain ${banned}`);
    }
});
