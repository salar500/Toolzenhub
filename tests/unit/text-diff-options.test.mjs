/**
 * Text Diff options (approved enhancement X2): ignore case, and the unchanged-lines setting
 * (only the changes, N lines of context, all lines).
 *
 * Oracles: the default comparison itself applied to lower-cased inputs (a different code path),
 * hand-derived unified-diff text, and the property that the options leave the defaults byte-identical.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { compare, collapseRows, toUnifiedDiff, wordDiff, describeSummary } from "../../assets/js/tools/text-diff/text-diff-engine.js";

const kinds = (r) => r.rows.map((x) => x.kind);

test("ignore case: lines that differ only by case are unchanged, and the result says so", () => {
    const r = compare("Hello World\nSecond", "hello world\nSecond", { ignoreCase: true });
    assert.equal(r.ok, true);
    assert.equal(r.summary.identical, true);
    assert.equal(r.caseOnly, true);
    assert.equal(r.ignoreCase, true);
    const off = compare("Hello World\nSecond", "hello world\nSecond");
    assert.equal(off.summary.identical, false);
    assert.equal(off.caseOnly, false);
    assert.equal(off.ignoreCase, false);
});

test("ignore case equals the default comparison of the lower-cased texts, row kinds and counts", () => {
    const cases = [
        ["Alpha\nBeta\nGamma", "alpha\nBETA\nDelta"],
        ["A\nB\nC\nD", "a\nc\nd\ne"],
        ["The Quick Brown Fox", "the quick brown fox jumps"],
        ["", "X"],
        ["x", ""],
        ["ÉCOLE\nÀ la carte", "école\nà LA CARTE"],
        ["ß\nSTRASSE", "ß\nstrasse"],
    ];
    for (const [a, b] of cases) {
        const folded = compare(a.toLowerCase(), b.toLowerCase());
        const ic = compare(a, b, { ignoreCase: true });
        assert.deepEqual(kinds(ic), kinds(folded), JSON.stringify([a, b]));
        assert.deepEqual(ic.summary, folded.summary, JSON.stringify([a, b]));
    }
});

test("ignore case keeps the original text in the rows (never the lower-cased text)", () => {
    const r = compare("Foo\nBar", "foo\nBAZ", { ignoreCase: true });
    const same = r.rows.find((x) => x.kind === "same");
    assert.equal(same.aText, "Foo");
    assert.equal(same.bText, "foo");
    const other = r.rows.filter((x) => x.kind !== "same");
    assert.ok(other.some((x) => x.aText === "Bar" || x.bText === "BAZ"));
});

test("ignore case reaches the word level inside a changed line", () => {
    const r = compare("The Quick Brown Fox", "the QUICK red fox", { ignoreCase: true });
    const mod = r.rows.find((x) => x.kind === "mod");
    assert.ok(mod, "a changed line");
    const changedOld = mod.aWords.filter(([, changed]) => changed).map(([text]) => text.trim()).filter(Boolean);
    const changedNew = mod.bWords.filter(([, changed]) => changed).map(([text]) => text.trim()).filter(Boolean);
    assert.deepEqual(changedOld, ["Brown"]);
    assert.deepEqual(changedNew, ["red"]);
    const exact = wordDiff("The Quick", "the quick", false, undefined, false);
    assert.ok(exact.old.some(([, changed]) => changed));
    const folded = wordDiff("The Quick", "the quick", false, undefined, true);
    assert.ok(!folded.old.some(([, changed]) => changed) && !folded.new.some(([, changed]) => changed));
});

test("ignore case combines with ignore whitespace; both are named", () => {
    const r = compare("  Hello   World ", "hello world", { ignoreWhitespace: true, ignoreCase: true });
    assert.equal(r.summary.identical, true);
    assert.equal(r.caseOnly, true);
    const ws = compare("a  b", "a b", { ignoreWhitespace: true, ignoreCase: true });
    assert.equal(ws.summary.identical, true);
    assert.equal(ws.whitespaceOnly, true);
    assert.equal(ws.caseOnly, false);
});

test("the defaults are untouched: no options, empty options and false options give identical results", () => {
    const a = "One\nTwo\nThree\nFour";
    const b = "One\nTWO\nThree\nFive";
    const base = compare(a, b);
    assert.deepEqual(compare(a, b, {}), base);
    assert.deepEqual(compare(a, b, { ignoreCase: false, ignoreWhitespace: false }), base);
    assert.equal(base.ignoreCase, false);
    assert.equal(base.whitespaceOnly, false);
    assert.equal(describeSummary(base.summary).length > 0, true);
});

test("a long line and many lines still compare with ignore case within the limits", () => {
    const big = Array.from({ length: 5000 }, (_, i) => `Line ${i} Mixed Case`).join("\n");
    const t = Date.now();
    const r = compare(big, big.toLowerCase(), { ignoreCase: true });
    assert.equal(r.summary.identical, true);
    assert.ok(Date.now() - t < 3000);
});

const rowsFor = (n, changed) => {
    const a = Array.from({ length: n }, (_, i) => `line ${i}`);
    const b = a.slice();
    for (const i of changed) b[i] = `LINE ${i} changed`;
    return compare(a.join("\n"), b.join("\n"));
};

test("collapseRows: the default context is unchanged; 0 hides every unchanged line; Infinity shows all", () => {
    const r = rowsFor(30, [10, 20]);
    const def = collapseRows(r.rows);
    assert.deepEqual(def, collapseRows(r.rows, 3));
    const gaps = def.filter((x) => x.type === "gap");
    assert.equal(gaps.length, 3);
    const only = collapseRows(r.rows, 0);
    assert.ok(only.filter((x) => x.type === "row").every((x) => x.row.kind !== "same"));
    assert.equal(only.filter((x) => x.type === "gap").reduce((n, g) => n + g.rows.length, 0), r.summary.unchanged);
    const all = collapseRows(r.rows, Infinity);
    assert.equal(all.length, r.rows.length);
    assert.ok(all.every((x) => x.type === "row"));
    const one = collapseRows(r.rows, 1);
    assert.equal(one.filter((x) => x.type === "row" && x.row.kind === "same").length, 4);
});

test("collapseRows with 0 hides a single unchanged line between two changes", () => {
    const r = rowsFor(5, [1, 3]);
    const only = collapseRows(r.rows, 0);
    assert.equal(only.filter((x) => x.type === "row" && x.row.kind === "same").length, 0);
    assert.equal(only.filter((x) => x.type === "gap").length, 3);
    const def = collapseRows(r.rows);
    assert.equal(def.filter((x) => x.type === "gap").length, 0, "default: runs shorter than the minimum stay");
});

test("toUnifiedDiff: hand-derived hunks for context 0, 1 and the default", () => {
    const before = "k1 same\nk2 same words here\nk3 same\nk4 same\nk5 same words here";
    const after = "k1 same\nk2 CHANGED words here\nk3 same\nk4 same\nk5 CHANGED words here";
    const r = compare(before, after);
    assert.deepEqual(r.rows.map((x) => x.kind), ["same", "mod", "same", "same", "mod"]);
    assert.equal(
        toUnifiedDiff(r, { context: 0 }),
        "--- Original\n+++ Changed\n@@ -2,1 +2,1 @@\n-k2 same words here\n+k2 CHANGED words here\n@@ -5,1 +5,1 @@\n-k5 same words here\n+k5 CHANGED words here\n"
    );
    assert.equal(
        toUnifiedDiff(r, { context: 1 }),
        "--- Original\n+++ Changed\n@@ -1,5 +1,5 @@\n k1 same\n-k2 same words here\n+k2 CHANGED words here\n k3 same\n k4 same\n-k5 same words here\n+k5 CHANGED words here\n"
    );
    assert.equal(toUnifiedDiff(r), toUnifiedDiff(r, { context: 3 }));
    assert.equal(toUnifiedDiff(r, { context: Infinity }), toUnifiedDiff(r, { context: 99 }));
});

test("toUnifiedDiff with ignore case lists only the real differences", () => {
    const r = compare("Alpha\nBeta", "ALPHA\nGamma", { ignoreCase: true });
    assert.equal(toUnifiedDiff(r, { context: 0 }), "--- Original\n+++ Changed\n@@ -2,1 +2,1 @@\n-Beta\n+Gamma\n");
});
