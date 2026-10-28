/**
 * JSON Error-Fixing Lab: the exercises and the evaluator.
 *
 * Independent oracle: Python's json module (strict: NaN and Infinity refused, duplicate keys refused, strict string
 * control characters) parses every starting text and every solution. The page's evaluator uses the JSON Formatter's
 * own engine, so Python gives a second, unrelated opinion on whether each exercise is really broken and each
 * solution really parses to the expected value.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, evaluate, differences, catalog, runEvaluator, statusOf, countStatuses;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ runEvaluator, statusOf, countStatuses } = await import("../../assets/js/learning/lab-shell.js"));
    ({ set } = await import("../../assets/js/tools/json-error-fixing-lab/exercises.js"));
    ({ evaluate, differences } = await import("../../assets/js/tools/json-error-fixing-lab/evaluator.js"));
});

const toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
const verdict = (ex, text) => evaluate(ex, text).verdict;
const byId = (id) => set.exercises.find((e) => e.id === id);

/** the text values inside a value (keys are paths and may be named; values must not be) */
const stringValues = (v) => typeof v === "string" ? (v.length >= 4 ? [v] : []) : Array.isArray(v) ? v.flatMap(stringValues) : v && typeof v === "object" ? Object.values(v).flatMap(stringValues) : [];

/** the same value with keys in the opposite order and a different layout */
const reordered = (v) => Array.isArray(v) ? v.map(reordered) : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).reverse().map((k) => [k, reordered(v[k])])) : v;

describe("the exercise set", () => {

    it("is valid, with real tool ids", () => assert.deepEqual(validateExerciseSet(set, { toolIds }), []));

    it("has at least 16 exercises over three difficulty levels", () => {
        assert.ok(set.exercises.length >= 16);
        assert.deepEqual([...new Set(set.exercises.map((e) => e.difficulty))].sort(), ["advanced", "beginner", "intermediate"]);
    });

    it("covers every fault the requirements list (hand-written map of fault to exercise)", () => {
        const FAULTS = {
            "trailing comma": "jef-trailing-comma", "single quotes": "jef-single-quotes", "unquoted key": "jef-unquoted-key",
            "missing comma": "jef-missing-comma", "missing closing bracket": "jef-missing-brace", "comment": "jef-comment",
            "NaN, Infinity, undefined": "jef-not-a-number", "leading zero": "jef-leading-zero", "malformed escape": "jef-bad-escape",
            "raw line break": "jef-raw-newline", "two faults": "jef-two-faults"
        };
        for (const [fault, id] of Object.entries(FAULTS)) assert.ok(byId(id), fault);
    });

    it("keeps the instructions unambiguous where two repairs would parse (they name the wanted one)", () => {
        assert.match(byId("jef-not-a-number").instructions, /null/);
        assert.match(byId("jef-leading-zero").instructions, /text 07030/);
        assert.match(byId("jef-duplicate-key").instructions, /comes last/);
    });

    it("shows no more than three hints and never puts the solution in a hint verbatim", () => {
        for (const ex of set.exercises) {
            assert.ok(ex.hints.length >= 1 && ex.hints.length <= 3, ex.id);
            for (const h of ex.hints) assert.notEqual(h.trim(), ex.solution.trim(), ex.id);
        }
    });

});

describe("each exercise against the evaluator", () => {

    it("the starting text is not already correct", () => {
        for (const ex of set.exercises) assert.notEqual(verdict(ex, ex.starting), "correct", ex.id);
    });

    it("the solution is correct", () => {
        for (const ex of set.exercises) assert.equal(verdict(ex, ex.solution), "correct", ex.id);
    });

    it("any layout and any key order of the right value is correct", () => {
        for (const ex of set.exercises) {
            for (const text of [JSON.stringify(ex.expected), JSON.stringify(ex.expected, null, 4), JSON.stringify(reordered(ex.expected), null, "\t"), `\n\n  ${JSON.stringify(ex.expected)}  \n`]) {
                assert.equal(verdict(ex, text), "correct", `${ex.id}: ${text.slice(0, 60)}`);
            }
        }
    });

    it("valid JSON of the wrong value is Not yet, and never shows the expected value", () => {
        for (const ex of set.exercises) {
            for (const text of ["null", "[]", "{}", '"x"', "0", "true"]) {
                if (JSON.stringify(ex.expected) === text) continue;
                const r = evaluate(ex, text);
                assert.equal(r.verdict, "not-yet", `${ex.id} ${text}`);
                const shown = JSON.stringify(r);
                for (const v of stringValues(ex.expected)) assert.ok(!shown.includes(v), `${ex.id} leaked ${v}`);
            }
        }
    });

    it("a changed type is wrong: a number as text, a boolean as text, null as a missing key", () => {
        assert.equal(verdict(byId("jef-trailing-comma"), '{"name": "Asha", "age": "31"}'), "not-yet");
        assert.equal(verdict(byId("jef-single-quotes"), '{"city": "Pune", "pin": 411001}'), "not-yet");
        assert.equal(verdict(byId("jef-python-literals"), '{"active": "true", "owner": null, "tags": ["a", "b"]}'), "not-yet");
        assert.equal(verdict(byId("jef-python-literals"), '{"active": true, "tags": ["a", "b"]}'), "not-yet");
        assert.equal(verdict(byId("jef-not-a-number"), '{"ratio": null, "limit": null}'), "not-yet");
        assert.equal(verdict(byId("jef-leading-zero"), '{"zip": 7030, "qty": 7}'), "not-yet");
    });

    it("array order matters and extra or missing members are found", () => {
        assert.equal(verdict(byId("jef-missing-comma"), '{"id": 7, "tags": ["blue", "red"]}'), "not-yet");
        assert.equal(verdict(byId("jef-extra-comma"), "[1, 2, 3, 4]"), "not-yet");
        assert.equal(verdict(byId("jef-extra-comma"), "[1, 3, 2]"), "not-yet");
        assert.equal(verdict(byId("jef-comment"), '{"max": 10, "min": 1}'), "not-yet");
    });

    it("a repeated key is refused whatever its values, but the exercise about it accepts the single key", () => {
        assert.equal(verdict(byId("jef-duplicate-key"), '{"id": 2, "name": "x", "id": 2}'), "not-yet");
        assert.equal(verdict(byId("jef-trailing-comma"), '{"name": "Asha", "age": 31, "age": 31}'), "not-yet");
        assert.equal(verdict(byId("jef-duplicate-key"), '{"name": "x", "id": 2}'), "correct");
    });

    it("a still-invalid answer reports the engine's line and column as text", () => {
        const r = evaluate(byId("jef-trailing-comma"), '{"name": "Asha",\n "age": 31,}');
        assert.equal(r.verdict, "not-yet");
        assert.match(r.findings[0], /^Line 2, column \d+: /);
    });

    it("the escaped solution really holds single backslashes and a real line break", () => {
        assert.equal(byId("jef-bad-escape").expected.path, "C:\\Users\\amy\\notes.txt");
        assert.equal(JSON.parse(byId("jef-bad-escape").solution).path.split("\\").length, 4);
        assert.equal(JSON.parse(byId("jef-raw-newline").solution).msg, "Line one\nline two");
    });

});

describe("differences()", () => {

    it("lists at most five paths and is strict about kinds", () => {
        const d = differences({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }, { a: "1", b: "2", c: "3", d: "4", e: "5", f: "6", g: "7" });
        assert.equal(d.length, 5);
        assert.ok(d.every((x) => /different kind of value/.test(x)));
    });

    it("names missing and extra keys and array lengths, and ignores key order", () => {
        assert.deepEqual(differences({ b: 1, a: 2 }, { a: 2, b: 1 }), []);
        assert.deepEqual(differences({ a: 1 }, { a: 1, b: 2 }), ["$.b is missing"]);
        assert.deepEqual(differences({ a: 1, z: 0 }, { a: 1 }), ["$.z should not be there"]);
        assert.deepEqual(differences({ l: [1] }, { l: [1, 2] }), ["$.l has a different number of items"]);
        assert.deepEqual(differences([1, [2, 3]], [1, [2, 4]]), ["$[1][1] has a different value"]);
    });

    it("null is a value, not a missing key", () => {
        assert.deepEqual(differences({ a: null }, { a: null }), []);
        assert.deepEqual(differences({}, { a: null }), ["$.a is missing"]);
    });

    it("a key named __proto__ or constructor is only a key", () => {
        const parsed = JSON.parse('{"__proto__": {"x": 1}, "constructor": 2}');
        assert.deepEqual(differences(parsed, parsed), []);
        assert.equal(({}).x, undefined);
        assert.deepEqual(differences(parsed, { constructor: 2 }), ["$.__proto__ should not be there"]);
    });

});

describe("hostile and oversized input", () => {

    const ex = () => byId("jef-trailing-comma");

    it("an empty or blank answer cannot be checked", () => {
        assert.equal(verdict(ex(), ""), "cannot-check");
        assert.equal(verdict(ex(), " \n\t "), "cannot-check");
    });

    it("text over the engine's size limit cannot be checked, and is fast", () => {
        const t = Date.now();
        assert.equal(verdict(ex(), "[" + "1,".repeat(1_100_000) + "1]"), "cannot-check");
        assert.ok(Date.now() - t < 2000);
    });

    it("very deep nesting is refused by the engine, not by a crash", () => {
        const r = evaluate(ex(), "[".repeat(600) + "]".repeat(600));
        assert.equal(r.verdict, "not-yet");
        assert.match(r.findings[0], /nested more than 500/);
    });

    it("script, markup and prototype text is only ever data", () => {
        for (const text of ["<img src=x onerror=alert(1)>", "{\"a\": \"<script>alert(1)</script>\"}", "function(){}", "__proto__", "{\"__proto__\": {\"polluted\": true}}", "constructor.constructor('return 1')()"]) {
            const r = evaluate(ex(), text);
            assert.ok(["not-yet", "cannot-check"].includes(r.verdict), text);
        }
        assert.equal(({}).polluted, undefined);
    });

    it("the same answer gives the same result every time", () => {
        const a = JSON.stringify(evaluate(ex(), '{"name": "Asha", "age": 31,}'));
        for (let i = 0; i < 3; i += 1) assert.equal(JSON.stringify(evaluate(ex(), '{"name": "Asha", "age": 31,}')), a);
    });

});

describe("the shell around the evaluator", () => {

    it("an evaluator that throws is an error state with no internal text", () => {
        const r = runEvaluator(() => { throw new Error("secret stack detail /home/x"); }, {}, "x");
        assert.equal(r.verdict, "error");
        assert.ok(!/secret|stack|home/.test(JSON.stringify(r)));
    });

    it("an evaluator that returns nonsense is an error state, never a wrong answer", () => {
        for (const bad of [null, undefined, {}, { verdict: "maybe" }, 5]) assert.equal(runEvaluator(() => bad, {}, "x").verdict, "error");
    });

    it("status follows what happened; a viewed solution is never completed", () => {
        assert.equal(statusOf({ touched: false }), "not-started");
        assert.equal(statusOf({ touched: true }), "in-progress");
        assert.equal(statusOf({ touched: true, completed: true }), "completed");
        assert.equal(statusOf({ touched: true, completed: true, solutionViewed: true }), "solution-viewed");
        assert.deepEqual(countStatuses([{ touched: false }, { completed: true }, { solutionViewed: true }, { touched: true }]), { completed: 1, "solution-viewed": 1, "in-progress": 1, "not-started": 1 });
    });

});

describe("independent oracle: Python's strict json module", () => {

    const python = spawnSync("python", ["-I", "-c", "import sys; sys.stdout.write('ok')"], { encoding: "utf8" });
    const available = python.status === 0 && python.stdout === "ok";

    const SCRIPT = `
import sys, json
def refuse_const(name): raise ValueError(name)
def pairs(items):
    seen = set()
    for k, _ in items:
        if k in seen: raise ValueError("duplicate")
        seen.add(k)
    return dict(items)
def strict(text): return json.loads(text, parse_constant=refuse_const, object_pairs_hook=pairs)
def same(a, b):
    if type(a) is not type(b): return False
    if isinstance(a, dict): return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    if isinstance(a, list): return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return a == b
out = []
for ex in json.loads(sys.stdin.buffer.read().decode("utf-8")):
    try: strict(ex["starting"]); start_fails = False
    except Exception: start_fails = True
    try: sol_equal = same(strict(ex["solution"]), json.loads(json.dumps(ex["expected"])))
    except Exception: sol_equal = False
    out.append({"id": ex["id"], "startFails": start_fails, "solutionEqual": sol_equal})
sys.stdout.buffer.write(json.dumps(out).encode("ascii"))
`;

    it("every starting text fails strict parsing and every solution parses to the expected value", { skip: available ? false : "python is not available on this machine" }, () => {
        const input = JSON.stringify(set.exercises.map(({ id, starting, solution, expected }) => ({ id, starting, solution, expected })));
        const run = spawnSync("python", ["-I", "-c", SCRIPT], { input, encoding: "utf8" });
        assert.equal(run.status, 0, run.stderr);
        const rows = JSON.parse(run.stdout);
        assert.equal(rows.length, set.exercises.length);
        for (const row of rows) {
            assert.equal(row.startFails, true, `${row.id}: Python accepts the starting text`);
            assert.equal(row.solutionEqual, true, `${row.id}: Python reads the solution as a different value`);
        }
    });

});
