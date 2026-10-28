/**
 * Test Design Lab: the exercises and the evaluator.
 *
 * The evaluator works out the required boundary values from a declarative rule (minimum, maximum, inclusive flags).
 * Independent oracle: a Python program that never reads the rule's formulas. It builds a yes/no predicate for "is this
 * whole number valid?" from the flags, scans the number line, finds every place where validity changes, and reads the
 * boundary values off those places. A seeded corpus of 2,000 generated rules, each with several answers (the exact
 * set, one value missing, extras added, everything shifted by one, a random subset), must give the same required set
 * and the same verdict in both. Partitions get the same treatment: generated tilings of the whole numbers, classified
 * by Python with a linear scan.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, evaluate, requiredValues, validEnds, parseWholeNumbers, partitionOf, catalog;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ set } = await import("../../assets/js/tools/test-design-lab/exercises.js"));
    ({ evaluate, requiredValues, validEnds, parseWholeNumbers, partitionOf } = await import("../../assets/js/tools/test-design-lab/evaluator.js"));
});

const toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
const byId = (id) => set.exercises.find((e) => e.id === id);
const bvaOnes = () => set.exercises.filter((e) => e.mode === "bva");
const epOnes = () => set.exercises.filter((e) => e.mode === "ep");
const verdict = (ex, v) => evaluate(ex, v).verdict;
const choicesFor = (ex) => ex.samples.map((x) => partitionOf(ex.partitions, x).id);

describe("the exercise set", () => {

    it("is valid, with real tool ids", () => assert.deepEqual(validateExerciseSet(set, { toolIds }), []));

    it("has at least ten boundary and ten partition exercises over three difficulty levels", () => {
        assert.ok(bvaOnes().length >= 10 && epOnes().length >= 10);
        assert.deepEqual([...new Set(set.exercises.map((e) => e.difficulty))].sort(), ["advanced", "beginner", "intermediate"]);
        for (const mode of ["bva", "ep"]) assert.ok(new Set(set.exercises.filter((e) => e.mode === mode).map((e) => e.difficulty)).size >= 2, mode);
    });

    it("every specification says whole numbers only; every boundary exercise says two values or three", () => {
        for (const ex of set.exercises) assert.match(ex.instructions, /Whole numbers only/, ex.id);
        for (const ex of bvaOnes()) {
            assert.ok(ex.perBoundary === 2 || ex.perBoundary === 3, ex.id);
            assert.match(ex.instructions, ex.perBoundary === 3 ? /three values at each boundary/ : /two values at each boundary/, ex.id);
        }
        assert.ok(bvaOnes().some((e) => e.perBoundary === 2) && bvaOnes().some((e) => e.perBoundary === 3));
    });

    it("every limit is stated as included or excluded in words that match the rule", () => {
        for (const ex of bvaOnes()) {
            const { rule } = ex;
            const text = ex.instructions;
            if (rule.min !== null) assert.ok(text.includes(String(rule.min)), `${ex.id} names its lower limit`);
            if (rule.max !== null) assert.ok(text.includes(String(rule.max)), `${ex.id} names its upper limit`);
            const inclusiveWords = /(from|at least|at most|both|inclusive|exactly)/;
            const exclusiveWords = /(greater than|more than|below|not including|is not|not accepted|is refused)/;
            const anyExclusive = (rule.min !== null && !rule.minInclusive) || (rule.max !== null && !rule.maxInclusive);
            assert.match(text, inclusiveWords, `${ex.id} states an inclusive limit`);
            if (anyExclusive) assert.match(text, exclusiveWords, `${ex.id} states its exclusive limit`);
        }
    });

    it("no hint is the solution, at most three hints each", () => {
        for (const ex of set.exercises) {
            assert.ok(ex.hints.length >= 1 && ex.hints.length <= 3, ex.id);
            for (const h of ex.hints) assert.notEqual(h.trim(), ex.solution.trim(), ex.id);
        }
    });

    it("each explanation names the kind of defect the technique targets", () => {
        for (const ex of set.exercises) assert.match(ex.explanation, /The kind of defect this finds: .{12,}\.$/, ex.id);
    });

    it("makes no claim about certification, an exam or a syllabus, and names no examining body", () => {
        const all = JSON.stringify(set).toLowerCase();
        for (const re of [/certif/, /exams?/, /exam-/, /syllabus/, /istqb/, /guarantee/, /qualification/]) assert.ok(!re.test(all), String(re));
    });

    it("the catalog and the set description state the real number of exercises", () => {
        const tool = catalog.getToolById("test-design-lab");
        assert.ok(tool.seo.description.includes(`with ${set.exercises.length} exercises`), tool.seo.description);
        assert.ok(set.description.startsWith("Twenty exercises"), set.description);
        assert.equal(set.exercises.length, 20);
    });

});

describe("boundary exercises", () => {

    it("the solution text is accepted, and equals the required values found by scanning the number line", () => {
        for (const ex of bvaOnes()) {
            assert.equal(verdict(ex, ex.solution), "correct", ex.id);
            const valid = (x) => (ex.rule.min === null || (ex.rule.minInclusive ? x >= ex.rule.min : x > ex.rule.min)) && (ex.rule.max === null || (ex.rule.maxInclusive ? x <= ex.rule.max : x < ex.rule.max));
            const found = new Set();
            for (let x = -700; x < 10100; x += 1) {
                if (valid(x) !== valid(x + 1)) {
                    const inside = valid(x) ? x : x + 1, outside = valid(x) ? x + 1 : x;
                    found.add(inside); found.add(outside);
                    if (ex.perBoundary === 3) found.add(inside + (inside - outside));
                }
            }
            assert.deepEqual([...found].sort((a, b) => a - b), parseWholeNumbers(ex.solution).values.sort((a, b) => a - b), ex.id);
        }
    });

    it("any order, spacing and separator is accepted; repeated values are counted once", () => {
        const ex = byId("tdl-bva-age");
        for (const text of ["66 65 18 17", "17,18,65,66", "17\n18\n65\n66", " 17 ,18; 65  ,66".replace(";", ","), "17, 17, 18, 18, 65, 66"]) assert.equal(verdict(ex, text), "correct", text);
    });

    it("extra values are listed and are neither wrong nor needed", () => {
        const r = evaluate(byId("tdl-bva-age"), "17, 18, 40, 65, 66, 100");
        assert.equal(r.verdict, "correct");
        assert.match(r.findings[0], /Extra values \(neither wrong nor needed\): 40, 100\./);
    });

    it("each missing value is named by its role and not by number", () => {
        const ex = byId("tdl-bva-age");
        const cases = { "18, 65, 66": "the value just below the valid range", "17, 65, 66": "the lowest valid value", "17, 18, 66": "the highest valid value", "17, 18, 65": "the value just above the valid range" };
        for (const [text, role] of Object.entries(cases)) {
            const r = evaluate(ex, text);
            assert.equal(r.verdict, "not-yet", text);
            assert.match(r.findings.join(" "), new RegExp(role), text);
            assert.match(r.findings[0], /present: 3 of 4/);
            const missingLine = r.findings.find((f) => f.startsWith("Still missing"));
            assert.ok(!/\d/.test(missingLine), `${text}: ${missingLine}`);
        }
    });

    it("the classic wrong answers are Not yet: only the valid edges, only the middle, the neighbours shifted by one", () => {
        const ex = byId("tdl-bva-age");
        for (const text of ["18, 65", "40", "19, 64", "16, 17, 66, 67", "17, 18, 65", "0, 100"]) assert.equal(verdict(ex, text), "not-yet", text);
        assert.equal(verdict(byId("tdl-bva-discount"), "99, 100, 500, 501"), "not-yet");
        assert.equal(verdict(byId("tdl-bva-discount"), "100, 101, 499, 500"), "not-yet");
        assert.equal(verdict(byId("tdl-bva-temperature"), "-21, -20, 40, 41"), "not-yet");
    });

    it("three-value exercises need the inside neighbour as well", () => {
        const ex = byId("tdl-bva-score");
        assert.equal(verdict(ex, "-1, 0, 100, 101"), "not-yet");
        assert.match(evaluate(ex, "-1, 0, 100, 101").findings.join(" "), /the value just above the lowest valid value and|the value just above the lowest valid value; |the value just below the highest valid value/);
        assert.equal(verdict(ex, "-1, 0, 1, 99, 100, 101"), "correct");
    });

    it("a one-sided range has one boundary", () => {
        const ex = byId("tdl-bva-shipping");
        assert.equal(verdict(ex, "49, 50"), "correct");
        assert.equal(verdict(ex, "50"), "not-yet");
        assert.deepEqual([...requiredValues(ex.rule, 2).keys()], [49, 50]);
    });

    it("a small range keeps both roles when one value plays two", () => {
        const need = requiredValues({ min: 1, max: 3, minInclusive: true, maxInclusive: true }, 3);
        assert.deepEqual([...need.keys()].sort((a, b) => a - b), [0, 1, 2, 3, 4]);
        assert.deepEqual(need.get(2), ["the value just above the lowest valid value", "the value just below the highest valid value"]);
    });

    it("input that is not usable is Cannot check and names the token", () => {
        const ex = byId("tdl-bva-age");
        for (const [text, token] of [["abc", "abc"], ["17, 18.5, 65", "18.5"], ["1e3", "1e3"], ["17 - 18", "-"], ["١٧", "١٧"], ["0x12", "0x12"], ["1,000", "000"], ["2000000000", "2000000000"], ["--5", "--5"], ["007", "007"], ["+5", "+5"]]) {
            const r = evaluate(ex, text);
            assert.equal(r.verdict, "cannot-check", text);
            assert.ok(r.summary.includes(`"${token}"`), `${text}: ${r.summary}`);
        }
    });

    it("more than 30 values is Cannot check; exactly 30 is read", () => {
        const ex = byId("tdl-bva-age");
        assert.equal(verdict(ex, Array.from({ length: 31 }, (_, i) => i).join(",")), "cannot-check");
        assert.equal(verdict(ex, [17, 18, 65, 66, ...Array.from({ length: 26 }, (_, i) => 100 + i)].join(",")), "correct");
    });

    it("values at the size limit are read; one beyond is refused", () => {
        const ex = byId("tdl-bva-age");
        assert.equal(verdict(ex, "17, 18, 65, 66, 1000000000, -1000000000"), "correct");
        assert.equal(verdict(ex, "17, 18, 65, 66, 1000000001"), "cannot-check");
    });

    it("zero and minus zero are the same value, and a plain zero is read", () => {
        assert.deepEqual(parseWholeNumbers("0, -0, 0").values, [0]);
        assert.equal(Object.is(parseWholeNumbers("-0").values[0], 0), true);
    });

    it("hostile text is only ever data", () => {
        const ex = byId("tdl-bva-age");
        for (const text of ["<img src=x onerror=alert(1)>", "__proto__", "constructor", "17); alert(1); (", "${1+1}", "`rm -rf`"]) assert.equal(verdict(ex, text), "cannot-check", text);
        assert.equal(({}).polluted, undefined);
    });

    it("the same answer gives the same result every time", () => {
        const a = JSON.stringify(evaluate(byId("tdl-bva-age"), "17, 18, 65"));
        for (let i = 0; i < 3; i += 1) assert.equal(JSON.stringify(evaluate(byId("tdl-bva-age"), "17, 18, 65")), a);
    });

});

describe("partition exercises", () => {

    it("the partitions cover every whole number exactly once", () => {
        for (const ex of epOnes()) {
            for (let x = -2500; x <= 2500; x += 1) {
                const holders = ex.partitions.filter((p) => (p.min === null || x >= p.min) && (p.max === null || x <= p.max));
                assert.equal(holders.length, 1, `${ex.id}: ${x} is in ${holders.length} partitions`);
            }
            assert.equal(ex.partitions.filter((p) => p.min === null).length, 1, ex.id);
            assert.equal(ex.partitions.filter((p) => p.max === null).length, 1, ex.id);
            assert.equal(new Set(ex.partitions.map((p) => p.id)).size, ex.partitions.length, ex.id);
        }
    });

    it("every partition has at least one sample, samples are distinct, and every label states its own range", () => {
        for (const ex of epOnes()) {
            assert.equal(new Set(ex.samples).size, ex.samples.length, ex.id);
            for (const p of ex.partitions) {
                assert.ok(ex.samples.some((x) => partitionOf(ex.partitions, x) === p), `${ex.id}: no sample in ${p.id}`);
                const nums = (p.label.match(/-?\d+/g) ?? []).map(Number);
                if (p.min !== null) assert.ok(nums.includes(p.min), `${ex.id}/${p.id}: label does not state ${p.min}`);
                if (p.max !== null) assert.ok(nums.includes(p.max), `${ex.id}/${p.id}: label does not state ${p.max}`);
            }
        }
    });

    it("placing every value correctly is Correct; the solution text lists the same placements", () => {
        for (const ex of epOnes()) {
            assert.equal(verdict(ex, JSON.stringify(choicesFor(ex))), "correct", ex.id);
            assert.equal(ex.solution.split("\n").length, ex.samples.length, ex.id);
        }
    });

    it("one wrong placement is Not yet with the count and a word for every value", () => {
        for (const ex of epOnes()) {
            const right = choicesFor(ex);
            ex.samples.forEach((x, i) => {
                const wrong = ex.partitions.find((p) => p.id !== right[i]).id;
                const choices = right.map((c, j) => (j === i ? wrong : c));
                const r = evaluate(ex, JSON.stringify(choices));
                assert.equal(r.verdict, "not-yet", `${ex.id} ${x}`);
                assert.match(r.summary, new RegExp(`^${ex.samples.length - 1} of ${ex.samples.length} values`), `${ex.id} ${x}`);
                assert.equal(r.findings.length, ex.samples.length);
                assert.equal(r.findings[i], `${x}: Not yet`);
                assert.equal(r.findings.filter((f) => f.endsWith("Correct")).length, ex.samples.length - 1);
            });
        }
    });

    it("an unplaced value, a malformed value or a foreign id cannot be checked", () => {
        const ex = byId("tdl-ep-age");
        const right = choicesFor(ex);
        for (const bad of [JSON.stringify(right.map((c, i) => (i === 0 ? "" : c))), "not json", "{}", "[]", JSON.stringify(right.slice(1)), JSON.stringify(right.map(() => "__proto__")), JSON.stringify(right.map(() => 1))]) {
            assert.equal(verdict(ex, bad), "cannot-check", bad);
        }
    });

    it("feedback never shows the right partition for a wrong value", () => {
        const ex = byId("tdl-ep-age");
        const r = evaluate(ex, JSON.stringify(ex.samples.map(() => "low")));
        assert.equal(r.verdict, "not-yet");
        assert.ok(!JSON.stringify(r).includes("Accepted (18 to 65)"));
    });

});

describe("independent oracle: Python scanning the number line, over a generated corpus", () => {

    const probe = spawnSync("python", ["-I", "-c", "import sys; sys.stdout.write('ok')"], { encoding: "utf8" });
    const available = probe.status === 0 && probe.stdout === "ok";

    const SCRIPT = String.raw`
import sys, json

def predicate(rule):
    lo, hi = rule["min"], rule["max"]
    def valid(x):
        if lo is not None:
            if rule["minInclusive"]:
                if not (x >= lo): return False
            elif not (x > lo): return False
        if hi is not None:
            if rule["maxInclusive"]:
                if not (x <= hi): return False
            elif not (x < hi): return False
        return True
    return valid

def required(rule, per):
    valid = predicate(rule)
    finite = [v for v in (rule["min"], rule["max"]) if v is not None]
    start, stop = min(finite) - 6, max(finite) + 6
    need = set()
    for x in range(start, stop):
        if valid(x) != valid(x + 1):
            inside, outside = (x, x + 1) if valid(x) else (x + 1, x)
            need.add(inside); need.add(outside)
            if per == 3: need.add(inside + (inside - outside))
    return need

def classify(partitions, x):
    hits = [p["id"] for p in partitions if (p["min"] is None or x >= p["min"]) and (p["max"] is None or x <= p["max"])]
    return hits[0] if len(hits) == 1 else None

req = json.loads(sys.stdin.buffer.read().decode("utf-8"))
out = {"bva": [], "ep": []}
for case in req["bva"]:
    need = required(case["rule"], case["per"])
    ans = set(case["answer"])
    out["bva"].append({"required": sorted(need), "missing": len(need - ans), "correct": need <= ans})
for case in req["ep"]:
    out["ep"].append([classify(case["partitions"], x) for x in case["values"]])
sys.stdout.buffer.write(json.dumps(out).encode("ascii"))
`;

    /* mulberry32: a small seeded generator so the corpus is the same on every run */
    const rng = (seed) => () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const corpus = () => {
        const rand = rng(20261029);
        const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
        const bva = [];
        for (let i = 0; i < 2000; i += 1) {
            const sided = rand();
            const lowest = int(-60, 60);
            const rule = {
                min: sided < 0.1 ? null : lowest,
                max: sided > 0.9 ? null : lowest + int(3, 40),
                minInclusive: rand() < 0.5,
                maxInclusive: rand() < 0.5
            };
            if (rule.min === null && rule.max === null) rule.min = lowest;
            const per = rand() < 0.5 ? 2 : 3;
            const need = [...requiredValues(rule, per).keys()];
            const answers = [
                need,
                need.filter((_, k) => k !== int(0, need.length - 1)),
                [...need, int(-100, 100), int(-100, 100)],
                need.map((v) => v + 1),
                need.map((v) => v - 1),
                need.filter(() => rand() < 0.6),
                [int(-100, 100)]
            ];
            for (const answer of answers) if (answer.length > 0) bva.push({ rule, per, answer: [...new Set(answer)] });
        }
        const ep = [];
        for (let i = 0; i < 400; i += 1) {
            const cuts = [...new Set(Array.from({ length: int(1, 5) }, () => int(-80, 80)))].sort((a, b) => a - b);
            const partitions = [{ id: "p0", min: null, max: cuts[0] - 1 }];
            cuts.forEach((c, k) => partitions.push({ id: `p${k + 1}`, min: c, max: k + 1 < cuts.length ? cuts[k + 1] - 1 : null }));
            const values = Array.from({ length: 12 }, () => int(-120, 120)).concat(cuts, cuts.map((c) => c - 1));
            ep.push({ partitions, values });
        }
        return { bva, ep };
    };

    it("the generated corpus is big enough to mean something", () => {
        const c = corpus();
        assert.ok(c.bva.length >= 10000, `${c.bva.length} boundary cases`);
        assert.equal(c.ep.length, 400);
    });

    it("Python and the page agree on the required values, the number missing and the verdict for every boundary case", { skip: available ? false : "python is not available on this machine" }, () => {
        const c = corpus();
        const run = spawnSync("python", ["-I", "-c", SCRIPT], { input: JSON.stringify(c), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        assert.equal(run.status, 0, run.stderr);
        const py = JSON.parse(run.stdout);
        let correct = 0, wrong = 0;
        c.bva.forEach((cs, i) => {
            const mine = requiredValues(cs.rule, cs.per);
            assert.deepEqual([...mine.keys()].sort((a, b) => a - b), py.bva[i].required, `case ${i} ${JSON.stringify(cs.rule)} per ${cs.per}`);
            const ex = { mode: "bva", rule: cs.rule, perBoundary: cs.per };
            const r = evaluate(ex, cs.answer.join(","));
            assert.equal(r.verdict, py.bva[i].correct ? "correct" : "not-yet", `case ${i}`);
            if (!py.bva[i].correct) {
                assert.match(r.findings.find((f) => f.startsWith("Required boundary values present")), new RegExp(`present: ${py.bva[i].required.length - py.bva[i].missing} of ${py.bva[i].required.length}\\.`), `case ${i}`);
                wrong += 1;
            } else {
                correct += 1;
            }
        });
        assert.ok(correct > 2000 && wrong > 2000, `mix of verdicts: ${correct} correct, ${wrong} not yet`);
    });

    it("Python and the page place every value in the same partition for 400 generated tilings", { skip: available ? false : "python is not available on this machine" }, () => {
        const c = corpus();
        const run = spawnSync("python", ["-I", "-c", SCRIPT], { input: JSON.stringify(c), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        assert.equal(run.status, 0, run.stderr);
        const py = JSON.parse(run.stdout);
        c.ep.forEach((cs, i) => {
            const mine = cs.values.map((x) => partitionOf(cs.partitions, x)?.id ?? null);
            assert.deepEqual(mine, py.ep[i], `tiling ${i}`);
            assert.ok(mine.every((id) => id !== null), `tiling ${i} leaves a value out`);
        });
    });

    it("validEnds() agrees with a scan for every combination of flags", () => {
        for (const minInclusive of [true, false]) for (const maxInclusive of [true, false]) {
            const rule = { min: 10, max: 20, minInclusive, maxInclusive };
            const { lowest, highest } = validEnds(rule);
            const valid = (x) => (minInclusive ? x >= 10 : x > 10) && (maxInclusive ? x <= 20 : x < 20);
            const xs = Array.from({ length: 60 }, (_, k) => k - 10).filter(valid);
            assert.equal(lowest, xs[0]);
            assert.equal(highest, xs[xs.length - 1]);
        }
    });

});
