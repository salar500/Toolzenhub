/**
 * Tool Pack 35: the JSON Compare engine and the shared JSON tree.
 *
 * Expected values are derived by hand from RFC 8259, RFC 6901, RFC 6902 and
 * RFC 9535 section 2.7 (Normalized Paths). Patch correctness is checked with an
 * INDEPENDENT applier written here on plain JSON.parse values (it shares no code
 * with the engine's own self-check), over hand cases and a seeded random corpus.
 * Covers AC-JC-001..030 at the engine level.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
    compareJson,
    summaryText,
    differencesText,
    KIND_LABEL,
    EXAMPLE_FIRST,
    EXAMPLE_SECOND,
    MAX_CHARS_PER_SIDE
} from "../../assets/js/tools/json-compare/json-compare-engine.js";

import {
    numberKey,
    normalizedPath,
    pointer,
    parseJson
} from "../../assets/js/tools/json-tree/json-tree.js";

const run = (a, b, o) => compareJson(a, b, o);
const rowsOf = (a, b, o) =>
    run(a, b, o).rows.map((r) => [KIND_LABEL[r.kind], normalizedPath(r.path)]);


/* ---------- an independent RFC 6902 applier on plain values ---------- */

function applyPlain(doc, ops) {

    let d = JSON.parse(JSON.stringify(doc));

    for (const o of ops) {

        const segs = o.path === "" ? [] : o.path.slice(1).split("/").map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));

        if (segs.length === 0) {
            assert.equal(o.op, "replace");
            d = JSON.parse(JSON.stringify(o.value));
            continue;
        }

        let cur = d;

        for (const s of segs.slice(0, -1)) {
            cur = cur[s];
            assert.ok(cur !== undefined, `pointer ${o.path} does not resolve`);
        }

        const k = segs.at(-1);

        if (Array.isArray(cur)) {
            const i = Number(k);
            if (o.op === "add") { assert.ok(i <= cur.length); cur.splice(i, 0, o.value); }
            else if (o.op === "remove") { assert.ok(i < cur.length); cur.splice(i, 1); }
            else { assert.ok(i < cur.length); cur[i] = o.value; }
        } else {
            if (o.op === "add") cur[k] = o.value;
            else if (o.op === "remove") { assert.ok(k in cur); delete cur[k]; }
            else { assert.ok(k in cur); cur[k] = o.value; }
        }
    }

    return d;
}

function patchHolds(a, b) {

    const r = run(a, b);

    assert.equal(r.state, "done");
    assert.ok(r.patch !== null, `patch withheld: ${r.patchReason}`);

    assert.deepStrictEqual(applyPlain(JSON.parse(a), JSON.parse(r.patch)), JSON.parse(b));
}


/* ---------- AC-JC: the worked example ---------- */

test("worked example: rows, order, summary and patch", () => {
    const r = run(EXAMPLE_FIRST, EXAMPLE_SECOND);
    assert.deepEqual(rowsOf(EXAMPLE_FIRST, EXAMPLE_SECOND), [
        ["Changed", "$['b'][2]"],
        ["Type changed", "$['d']"],
        ["Added", "$['c']"]
    ]);
    assert.equal(summaryText(r), "3 differences: 1 added, 0 removed, 1 changed, 1 type changed.");
    assert.equal(
        r.patch,
        '[{"op":"replace","path":"/b/2","value":4},{"op":"replace","path":"/d","value":1},{"op":"add","path":"/c","value":true}]'
    );
});

test("equal documents: no differences, an empty patch, the value count", () => {
    const r = run('{"a":1,"b":[true,null]}', '{ "b" : [ true , null ] , "a" : 1.0 }');
    assert.equal(summaryText(r), "No differences. Compared 5 values on each side.");
    assert.equal(r.patch, "[]");
});

test("key order is never a difference", () => {
    assert.deepEqual(rowsOf('{"a":1,"b":2}', '{"b":2,"a":1}'), []);
});

test("arrays compare by position, extras are added or removed", () => {
    assert.deepEqual(rowsOf("[1,2,3]", "[1,9]"), [["Changed", "$[1]"], ["Removed", "$[2]"]]);
    assert.deepEqual(rowsOf("[1]", "[1,2,3]"), [["Added", "$[1]"], ["Added", "$[2]"]]);
});

test("a whole added or removed subtree is one row", () => {
    assert.deepEqual(rowsOf('{"a":1}', '{"a":1,"b":{"x":[1,2,3]}}'), [["Added", "$['b']"]]);
    assert.deepEqual(rowsOf('{"a":1,"b":{"x":[1,2,3]}}', '{"a":1}'), [["Removed", "$['b']"]]);
});

test("rows follow the first document, then members only in the second", () => {
    assert.deepEqual(rowsOf('{"z":1,"y":1}', '{"n":1,"y":2,"z":2,"m":1}'), [
        ["Changed", "$['z']"], ["Changed", "$['y']"], ["Added", "$['n']"], ["Added", "$['m']"]
    ]);
});


/* ---------- numbers ---------- */

test("number keys: equal values share a key, from the digits alone", () => {
    for (const same of [["1", "1.0", "1e0", "10e-1", "0.1e1", "1E+0"], ["0.1", "0.10", "1e-1", "10e-2"], ["0", "-0", "0.0", "0e5", "-0.000"], ["100", "1e2", "1.00e2", "0.1e3"]]) {
        const keys = new Set(same.map((t) => numberKey(t).key));
        assert.equal(keys.size, 1, same.join(" "));
    }
    assert.equal(numberKey("1e400").key, numberKey("1" + "0".repeat(400)).key);
    assert.notEqual(numberKey("1").key, numberKey("-1").key);
    assert.notEqual(numberKey("12345678901234567890").key, numberKey("12345678901234567891").key);
    assert.notEqual(numberKey("0.1").key, numberKey("0.01").key);
});

test("numbers: hand-derived canonical keys", () => {
    assert.equal(numberKey("1").key, "1e0");
    assert.equal(numberKey("1200").key, "12e2");
    assert.equal(numberKey("-0.00120").key, "-12e-4");
    assert.equal(numberKey("5e-324").key, "5e-324");
});

test("numbers are exact beyond 2^53 and never floats", () => {
    assert.deepEqual(rowsOf("9007199254740993", "9007199254740992"), [["Changed", "$"]]);
    assert.deepEqual(rowsOf("[0.1]", "[0.1000000000000000055511151231257827]"), [["Changed", "$[0]"]]);
    assert.deepEqual(rowsOf("[1e400]", "[1" + "0".repeat(400) + "]"), []);
    assert.deepEqual(rowsOf("[1.0, 1e0, 10e-1, -0]", "[1, 1, 1, 0]"), []);
});

test("a hostile exponent is refused without being expanded, a long ordinary one is fine", () => {
    const r = run("1e" + "9".repeat(1001), "1");
    assert.equal(r.state, "blocked");
    assert.equal(r.first.status, "refused");
    assert.match(r.first.message, /exponent with more than 1000 digits/);
    const ok = run("1e" + "9".repeat(1000), "1e" + "9".repeat(1000));
    assert.equal(ok.state, "done");
    assert.deepEqual(ok.rows, []);
});

test("precision note on each side, exact comparison unchanged", () => {
    const r = run("[12345678901234567890]", "[12345678901234567890, 1]");
    assert.equal(r.notes.length, 2);
    assert.match(r.notes[0], /^First JSON: 1 number has more than 15 significant digits \(first at \$\[0\]\)/);
    assert.deepEqual(r.rows.map((x) => KIND_LABEL[x.kind]), ["Added"]);
});


/* ---------- types, strings, Unicode ---------- */

test("a different type is a type change, never a change", () => {
    for (const [a, b] of [["1", '"1"'], ["true", "1"], ["null", "0"], ["[]", "{}"], ['"a"', '["a"]'], ["false", "null"]]) {
        assert.deepEqual(rowsOf(a, b), [["Type changed", "$"]], `${a} vs ${b}`);
    }
});

test("strings compare by code points exactly, with a note when only normalization differs", () => {
    assert.deepEqual(rowsOf('"A"', '"a"'), [["Changed", "$"]]);
    assert.deepEqual(rowsOf('"a"', '"a "'), [["Changed", "$"]]);
    assert.deepEqual(rowsOf('"\\ud83d\\ude00"', '"😀"'), []);
    const r = run('"\\u00e9"', '"e\\u0301"');
    assert.equal(r.rows[0].note, "Differs only by Unicode normalization");
    assert.match(differencesText(r), /Differs only by Unicode normalization$/);
    assert.equal(run('"a"', '"b"').rows[0].note, undefined);
});

test("an escaped lone surrogate is valid, kept and noted", () => {
    const r = run('["\\ud800"]', '["\\ud800"]');
    assert.deepEqual(r.rows, []);
    assert.match(r.notes[0], /lone surrogate escape; first at \$\[0\]/);
    assert.deepEqual(rowsOf('["\\ud800"]', '["\\udc00"]'), [["Changed", "$[0]"]]);
});

test("duplicate keys: the last value wins and each side says so", () => {
    const r = run('{"a":1,"a":2,"b":{"c":1,"c":3}}', '{"a":2,"b":{"c":3}}');
    assert.deepEqual(r.rows, []);
    assert.equal(r.notes.length, 1);
    assert.equal(
        r.notes[0],
        "First JSON: 2 keys appear more than once in the same object (first at $['a'], $['b']['c']). The last value is used, as JSON.parse does."
    );
});

test("keys such as __proto__ and constructor are ordinary keys", () => {
    assert.deepEqual(rowsOf('{"__proto__":1,"constructor":2}', '{"__proto__":2,"constructor":2}'), [["Changed", "$['__proto__']"]]);
    assert.equal(Object.prototype.polluted, undefined);
    assert.deepEqual(Object.keys(Object.prototype), []);
});


/* ---------- paths and pointers ---------- */

test("normalized paths escape quotes, backslashes and control characters (RFC 9535 2.7)", () => {
    assert.equal(normalizedPath(["a'b", "c\\d", "e\nf", "\u0001", "é", 3]), "$['a\\'b']['c\\\\d']['e\\nf']['\\u0001']['é'][3]");
    assert.equal(normalizedPath([]), "$");
});

test("JSON Pointers escape ~ and / (RFC 6901)", () => {
    assert.equal(pointer(["a/b", "c~d", "~1", 0]), "/a~1b/c~0d/~01/0");
    assert.equal(pointer([]), "");
});

test("escaped member names appear escaped in the rows and the patch", () => {
    const r = run('{"a/b":1,"c~d":{"e\'":1}}', '{"a/b":2,"c~d":{"e\'":2}}');
    assert.deepEqual(r.rows.map((x) => normalizedPath(x.path)), ["$['a/b']", "$['c~d']['e\\'']"]);
    assert.equal(r.patch, '[{"op":"replace","path":"/a~1b","value":2},{"op":"replace","path":"/c~0d/e\'","value":2}]');
});


/* ---------- ignore array order ---------- */

test("ignore order: arrays are multisets, only added and removed elements are listed", () => {
    assert.deepEqual(rowsOf("[1,2,3]", "[3,1,2]", { ignoreOrder: true }), []);
    assert.deepEqual(rowsOf("[1,2,3]", "[3,1,2,9]", { ignoreOrder: true }), [["Added", "$[3]"]]);
    assert.deepEqual(rowsOf("[1,2,3]", "[1,3]", { ignoreOrder: true }), [["Removed", "$[1]"]]);
});

test("ignore order: duplicates count, objects match by canonical form, nested arrays keep their order", () => {
    assert.deepEqual(rowsOf("[1,1,2]", "[1,2]", { ignoreOrder: true }), [["Removed", "$[1]"]]);
    assert.deepEqual(rowsOf("[1,2]", "[1,1,2]", { ignoreOrder: true }), [["Added", "$[1]"]]);
    assert.deepEqual(rowsOf('[{"a":1,"b":2}]', '[{"b":2,"a":1.0}]', { ignoreOrder: true }), []);
    assert.deepEqual(rowsOf("[[1,2]]", "[[2,1]]", { ignoreOrder: true }), [["Removed", "$[0]"], ["Added", "$[0]"]]);
    assert.deepEqual(rowsOf('{"k":[1,2]}', '{"k":[2,1]}', { ignoreOrder: true }), []);
});

test("ignore order: no patch, with the reason", () => {
    const r = run("[1,2]", "[2,1]", { ignoreOrder: true });
    assert.equal(r.patch, null);
    assert.equal(r.patchReason, "A patch cannot express an ignored order.");
    assert.match(summaryText(r), /Array order was ignored\.$/);
});


/* ---------- the patch ---------- */

test("patch: array removals run from the highest index down, additions ascending", () => {
    assert.equal(run("[1,2,3,4]", "[1]").patch, '[{"op":"remove","path":"/3"},{"op":"remove","path":"/2"},{"op":"remove","path":"/1"}]');
    assert.equal(run("[1]", "[1,2,3]").patch, '[{"op":"add","path":"/1","value":2},{"op":"add","path":"/2","value":3}]');
});

test("patch: the whole document, and objects inside arrays", () => {
    assert.equal(run("1", '"x"').patch, '[{"op":"replace","path":"","value":"x"}]');
    patchHolds('[{"a":1},{"b":2},3]', '[{"a":2},{"b":2,"c":[]}]');
    patchHolds('{"a":[1,2,{"x":1}],"b":1}', '{"a":[1,{"x":1,"y":2}],"c":null}');
    patchHolds("[[1,2],[3,4]]", "[[1],[3,4,5],[6]]");
});

test("patch: values keep their exact number text and escapes", () => {
    const r = run("[]", '[1.50, 1e400, "é\\n"]');
    assert.equal(r.patch, '[{"op":"add","path":"/0","value":1.50},{"op":"add","path":"/1","value":1e400},{"op":"add","path":"/2","value":"é\\n"}]');
});

function mulberry32(seed) {
    return () => {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

test("patch: applying it to the first document gives the second, over a seeded random corpus (seed 20261026)", () => {
    const rnd = mulberry32(20261026);
    const keys = ["a", "b", "c", "a/b", "c~d", "", "é"];
    const gen = (depth) => {
        const r = rnd();
        if (depth > 3 || r < 0.35) {
            const p = Math.floor(rnd() * 5);
            return [Math.floor(rnd() * 4), "s" + Math.floor(rnd() * 3), rnd() < 0.5, null, Math.floor(rnd() * 3) + 0.5][p];
        }
        if (r < 0.65) return Array.from({ length: Math.floor(rnd() * 5) }, () => gen(depth + 1));
        const o = {};
        for (const k of keys) if (rnd() < 0.4) o[k] = gen(depth + 1);
        return o;
    };
    const mutate = (v) => {
        if (rnd() < 0.15) return gen(2);
        if (Array.isArray(v)) {
            const c = v.map(mutate);
            if (rnd() < 0.3) c.push(gen(3));
            if (rnd() < 0.3) c.splice(Math.floor(rnd() * (c.length + 1)), 1);
            return c;
        }
        if (v && typeof v === "object") {
            const o = {};
            for (const [k, x] of Object.entries(v)) if (rnd() < 0.85) o[k] = mutate(x);
            if (rnd() < 0.3) o[keys[Math.floor(rnd() * keys.length)]] = gen(3);
            return o;
        }
        return v;
    };
    let nonEmpty = 0;
    for (let n = 0; n < 400; n++) {
        const a = gen(0);
        const b = mutate(a);
        const A = JSON.stringify(a);
        const B = JSON.stringify(b);
        const r = run(A, B);
        assert.ok(r.patch !== null, `case ${n}: ${A} -> ${B}: ${r.patchReason}`);
        assert.deepStrictEqual(applyPlain(a, JSON.parse(r.patch)), b, `case ${n}: ${A} -> ${B}`);
        assert.equal(r.rows.length === 0, JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b)), `case ${n}`);
        if (r.rows.length) nonEmpty++;
    }
    assert.ok(nonEmpty > 200, `only ${nonEmpty} corpus pairs differed`);
});

function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
    return v;
}


/* ---------- validation, limits ---------- */

test("blocked sides: empty, invalid (located), both invalid", () => {
    const empty = run("  ", "1");
    assert.equal(empty.state, "blocked");
    assert.equal(empty.first.status, "empty");
    assert.equal(empty.second.status, "valid");
    const bad = run('{"a":1,}', "[1,2");
    assert.equal(bad.first.status, "invalid");
    assert.equal(bad.first.error.line, 1);
    assert.equal(bad.first.error.column, 7);
    assert.equal(bad.second.status, "invalid");
    assert.match(bad.second.error.message, /never closed/);
});

test("strict grammar: comments, single quotes, NaN, trailing commas, a BOM and two values are all invalid", () => {
    for (const bad of ["{/*c*/}", "{'a':1}", "NaN", "[1,]", "﻿{}", "{} {}", "[01]", '"a\nb"', "+1", ".5", "1.", "Infinity"]) {
        assert.equal(run(bad, "1").first.status, "invalid", JSON.stringify(bad));
    }
    assert.match(run("﻿{}", "1").first.error.message, /byte order mark/);
});

test("limits: 1,000,000 characters per side accepted, one more refused, nothing truncated", () => {
    const pad = (n) => "[" + "1".repeat(n - 2) + "]";
    const ok = run(pad(MAX_CHARS_PER_SIDE), "[1]");
    assert.equal(ok.state, "done");
    const over = run(pad(MAX_CHARS_PER_SIDE + 1), "[1]");
    assert.equal(over.state, "blocked");
    assert.equal(over.first.status, "too-large");
    assert.equal(over.first.limit, 1_000_000);
});

test("limits: depth 500 accepted, 501 refused", () => {
    const deep = (n) => "[".repeat(n) + "]".repeat(n);
    assert.equal(run(deep(500), deep(500)).state, "done");
    assert.equal(run(deep(501), deep(500)).first.status, "invalid");
});

test("a large pair compares in reasonable time", () => {
    const big = (extra) => "[" + Array.from({ length: 30000 }, (_, i) => `{"id":${i},"v":"x${i}"}`).join(",") + extra + "]";
    const t = Date.now();
    const r = run(big(""), big(',{"id":-1}'));
    assert.equal(r.rows.length, 1);
    assert.ok(Date.now() - t < 5000, `took ${Date.now() - t} ms`);
});


/* ---------- the text for the page ---------- */

test("the copied differences: summary, notes, then one tab-separated row each", () => {
    const text = differencesText(run(EXAMPLE_FIRST, EXAMPLE_SECOND));
    assert.equal(
        text,
        "3 differences: 1 added, 0 removed, 1 changed, 1 type changed.\nChanged\t$['b'][2]\t3\t4\nType changed\t$['d']\t\"x\"\t1\nAdded\t$['c']\t-\ttrue"
    );
});

test("parseJson reports a missing document, size and the scanner's own errors", () => {
    assert.equal(parseJson("", 10).state, "empty");
    assert.equal(parseJson("[1,2,3,4,5,6]", 5).state, "too-large");
    assert.equal(parseJson("{", 10).state, "invalid");
});

test("the engine and tree are pure: no DOM, network, storage, clock, randomness or code execution", () => {
    for (const file of ["json-compare/json-compare-engine.js", "json-tree/json-tree.js"]) {
        const code = readFileSync(new URL(`../../assets/js/tools/${file}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        for (const banned of ["fetch(", "XMLHttpRequest", "sendBeacon", "document", "window", "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "innerHTML", "setTimeout"]) {
            assert.ok(!code.includes(banned), `${file} must not contain ${banned}`);
        }
    }
});
