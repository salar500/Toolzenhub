/**
 * JSONPath Challenge Lab: the exercises and the evaluator.
 *
 * Independent oracle: a small JSONPath evaluator written in Python for the subset of RFC 9535 the exercises use
 * (names, wildcard, indexes, slices, unions, descendant, filters with comparison, && || !, existence tests and count()).
 * It shares no code with the JavaScript engine the page uses. Three things must agree for every exercise:
 * the paths written by hand in the exercise data, the Python evaluator, and the page's engine.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, evaluate, normalizedPath, catalog, evaluateQuery;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ set } = await import("../../assets/js/tools/jsonpath-challenge-lab/exercises.js"));
    ({ evaluate, normalizedPath } = await import("../../assets/js/tools/jsonpath-challenge-lab/evaluator.js"));
    ({ evaluateQuery } = await import("../../assets/js/tools/jsonpath-tester/jsonpath-engine.js"));
});

const toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
const byId = (id) => set.exercises.find((e) => e.id === id);
const verdict = (ex, q) => evaluate(ex, q).verdict;

/** a plain walk by segments, to read the value at a path without any query engine */
const valueAt = (doc, segments) => segments.reduce((v, s) => v[s], doc);

describe("the exercise set", () => {

    it("is valid, with real tool ids", () => assert.deepEqual(validateExerciseSet(set, { toolIds }), []));

    it("has at least 16 exercises over three difficulty levels, with every concept the requirements list", () => {
        assert.ok(set.exercises.length >= 16);
        assert.deepEqual([...new Set(set.exercises.map((e) => e.difficulty))].sort(), ["advanced", "beginner", "intermediate"]);
        const CONCEPTS = {
            "child": "jpc-child-name", "index": "jpc-first-title", "wildcard": "jpc-all-titles", "negative index": "jpc-last-title", "slice": "jpc-slice-middle",
            "descendant": "jpc-descendant-name", "filter comparison": "jpc-filter-price", "filter and": "jpc-and", "filter or": "jpc-or", "filter not": "jpc-not-available"
        };
        for (const [concept, id] of Object.entries(CONCEPTS)) assert.ok(byId(id), concept);
        assert.ok(set.exercises.some((e) => e.ordered) && set.exercises.some((e) => !e.ordered));
    });

    it("the catalog and the set description state the real number of exercises", () => {
        const tool = catalog.getToolById("jsonpath-challenge-lab");
        assert.ok(tool.seo.description.includes(`with ${set.exercises.length} exercises`), tool.seo.description);
        assert.ok(set.description.includes("Nineteen"), set.description);
    });

    it("never asks for an unsupported function", () => {
        for (const ex of set.exercises) assert.ok(!/\b(match|search)\s*\(/.test(ex.solution), ex.id);
    });

    it("shows the same document in every exercise, as read-only text", () => {
        const docs = new Set(set.exercises.map((e) => e.document));
        assert.equal(docs.size, 1);
        assert.doesNotThrow(() => JSON.parse([...docs][0]));
    });

    it("the values shown are the values at the hand-written paths (read by a plain walk, no engine)", () => {
        for (const ex of set.exercises) {
            const doc = JSON.parse(ex.document);
            assert.deepEqual(ex.expected.map((p) => valueAt(doc, p)), ex.values, ex.id);
        }
    });

    it("no exercise expects the same node twice", () => {
        for (const ex of set.exercises) assert.equal(new Set(ex.expected.map(normalizedPath)).size, ex.expected.length, ex.id);
    });

});

describe("each exercise against the evaluator", () => {

    it("the starting query is not already correct", () => {
        for (const ex of set.exercises) assert.notEqual(verdict(ex, ex.starting), "correct", ex.id);
    });

    it("the solution is correct, and its nodes are exactly the hand-written paths", () => {
        for (const ex of set.exercises) {
            assert.equal(verdict(ex, ex.solution), "correct", ex.id);
            const run = evaluateQuery(ex.document, ex.solution);
            assert.deepEqual(run.nodes.map((n) => normalizedPath(n.path)), ex.expected.map(normalizedPath), ex.id);
        }
    });

    it("another spelling of the same selection is correct: bracket notation instead of dots", () => {
        assert.equal(verdict(byId("jpc-child-name"), "$['library']['name']"), "correct");
        assert.equal(verdict(byId("jpc-first-title"), "$['library']['books'][0]['title']"), "correct");
        assert.equal(verdict(byId("jpc-all-titles"), "$.library.books[*].title"), "correct");
        assert.equal(verdict(byId("jpc-all-titles"), "$..books[*].title"), "correct");
    });

    it("an unordered exercise accepts any order of the same nodes; an ordered one does not", () => {
        const prices = byId("jpc-descendant-price");
        assert.equal(prices.ordered, false);
        assert.equal(verdict(prices, "$.library.books[4,3,2,1,0].price"), "correct");
        const union = byId("jpc-union-indexes");
        assert.equal(union.ordered, true);
        assert.equal(verdict(union, "$.library.books[4,2,0].title"), "not-yet");
        assert.match(evaluate(union, "$.library.books[4,2,0].title").summary, /different order/);
        assert.equal(verdict(byId("jpc-reverse"), "$.library.books[*].title"), "not-yet");
    });

    it("a node selected twice is a difference", () => {
        const r = evaluate(byId("jpc-first-title"), "$.library.books[0,0].title");
        assert.equal(r.verdict, "not-yet");
        assert.ok(r.findings.some((f) => /more than once/.test(f)));
    });

    it("two different nodes with equal values are different nodes", () => {
        const ex = {
            document: JSON.stringify({ a: [{ v: 1 }, { v: 1 }] }), ordered: false,
            expected: [["a", 0, "v"]], solution: "$.a[0].v"
        };
        assert.equal(evaluate(ex, "$.a[0].v").verdict, "correct");
        assert.equal(evaluate(ex, "$.a[1].v").verdict, "not-yet");
        assert.match(evaluate(ex, "$.a[1].v").findings.join(" "), /\$\['a'\]\[1\]\['v'\]/);
    });

    it("a wrong query lists what is extra and what is missing, as paths, and never shows a query", () => {
        const ex = byId("jpc-filter-price");
        const r = evaluate(ex, "$.library.books[*].title");
        assert.equal(r.verdict, "not-yet");
        const text = JSON.stringify(r);
        assert.match(text, /Selected but not wanted/);
        assert.ok(!text.includes(ex.solution));
        const none = evaluate(ex, "$.nothing");
        assert.match(none.findings[0], /selects nothing/);
        assert.match(none.findings.join(" "), /Wanted but not selected/);
    });

    it("lists at most five extra and five missing paths", () => {
        const r = evaluate(byId("jpc-descendant-price"), "$..id");
        assert.match(r.findings.join(" "), /and 0 more|; and \d+ more|\$\['library'\]\['books'\]\[4\]\['id'\]/);
        assert.ok(r.findings.every((f) => f.split(";").length <= 7));
    });

    it("the 'not available' trap behaves as the exercise explains", () => {
        const ex = byId("jpc-not-available");
        assert.equal(verdict(ex, "$.library.books[?!@.available].title"), "not-yet");
        assert.match(evaluate(ex, "$.library.books[?!@.available].title").findings[0], /selects nothing/);
        assert.equal(verdict(ex, "$.library.books[?@.available==false].title"), "correct");
        assert.equal(verdict(ex, "$.library.books[?@.available!=true].title"), "correct");
    });

});

describe("queries the engine refuses are Cannot check, not wrong answers", () => {

    const ex = () => byId("jpc-child-name");

    it("a syntax error gives the engine's message with a position", () => {
        const r = evaluate(ex(), "$.library[");
        assert.equal(r.verdict, "cannot-check");
        assert.match(r.findings[0], /^Position \d+: /);
    });

    it("match() and search() are refused with the engine's own message", () => {
        const r = evaluate(ex(), "$.library.books[?match(@.title, 'S.*')].title");
        assert.equal(r.verdict, "cannot-check");
        assert.match(r.findings[0], /match\(\) and search\(\) are not supported/);
    });

    it("a query that does not start with $ cannot be checked", () => {
        assert.equal(verdict(ex(), "library.name"), "cannot-check");
    });

    it("a query over the length limit cannot be checked", () => {
        assert.equal(verdict(ex(), "$" + ".a".repeat(600)), "cannot-check");
    });

    it("a query that does too much work is stopped by the engine's bound, quickly", () => {
        const started = Date.now();
        const r = evaluate(ex(), "$" + "..*".repeat(40));
        assert.ok(["cannot-check", "not-yet"].includes(r.verdict));
        assert.ok(Date.now() - started < 5000);
    });

    it("script, markup and prototype text is only ever data", () => {
        for (const q of ["$.library[?(@.price<10)]", "$[?@.constructor]", "$.__proto__", "$['__proto__']", "<img src=x onerror=alert(1)>", "$[?@.price<10; alert(1)]"]) {
            const r = evaluate(ex(), q);
            assert.ok(["cannot-check", "not-yet"].includes(r.verdict), q);
        }
        assert.equal(({}).polluted, undefined);
    });

    it("the same query gives the same result every time", () => {
        const a = JSON.stringify(evaluate(byId("jpc-filter-price"), "$.library.books[*].price"));
        for (let i = 0; i < 3; i += 1) assert.equal(JSON.stringify(evaluate(byId("jpc-filter-price"), "$.library.books[*].price")), a);
    });

});

describe("normalizedPath()", () => {

    it("writes names in single quotes and indexes bare", () => {
        assert.equal(normalizedPath(["library", "books", 0, "title"]), "$['library']['books'][0]['title']");
        assert.equal(normalizedPath([]), "$");
    });

    it("escapes quote, backslash and control characters as RFC 9535 section 2.7 does", () => {
        assert.equal(normalizedPath(["it's"]), "$['it\\'s']");
        assert.equal(normalizedPath(["a\\b"]), "$['a\\\\b']");
        assert.equal(normalizedPath(["a\nb", "c\u0001"]), "$['a\\nb']['c\\u0001']");
    });

});

describe("independent oracle: a JSONPath subset evaluator written in Python", () => {

    const probe = spawnSync("python", ["-I", "-c", "import sys; sys.stdout.write('ok')"], { encoding: "utf8" });
    const available = probe.status === 0 && probe.stdout === "ok";

    const SCRIPT = String.raw`
import sys, json, re

class Err(Exception): pass

def kind(v):
    if v is None: return "null"
    if isinstance(v, bool): return "bool"
    if isinstance(v, (int, float)): return "number"
    if isinstance(v, str): return "string"
    if isinstance(v, list): return "array"
    return "object"

class P:
    def __init__(self, s): self.s, self.i = s, 0
    def peek(self, n=1): return self.s[self.i:self.i+n]
    def eat(self, t):
        if self.s.startswith(t, self.i): self.i += len(t); return True
        return False
    def ws(self):
        while self.i < len(self.s) and self.s[self.i] in " \t\r\n": self.i += 1
    def need(self, t):
        if not self.eat(t): raise Err("expected " + t + " at " + str(self.i))
    def name(self):
        m = re.compile(r"[A-Za-z_][A-Za-z0-9_]*").match(self.s, self.i)
        if not m: raise Err("name expected at " + str(self.i))
        self.i = m.end(); return m.group(0)
    def integer(self):
        m = re.compile(r"-?(0|[1-9][0-9]*)").match(self.s, self.i)
        if not m: return None
        self.i = m.end(); return int(m.group(0))
    def quoted(self):
        q = self.s[self.i]; self.i += 1; out = ""
        while self.s[self.i] != q:
            if self.s[self.i] == "\\": self.i += 1
            out += self.s[self.i]; self.i += 1
        self.i += 1; return out

    def query(self, root_char):
        self.need(root_char); segs = []
        while True:
            if self.peek(2) == "..":
                self.i += 2
                if self.peek() == "[": segs.append(("desc", self.bracket()))
                elif self.eat("*"): segs.append(("desc", [("wild",)]))
                else: segs.append(("desc", [("name", self.name())]))
            elif self.peek() == ".":
                self.i += 1
                if self.eat("*"): segs.append(("child", [("wild",)]))
                else: segs.append(("child", [("name", self.name())]))
            elif self.peek() == "[": segs.append(("child", self.bracket()))
            else: break
        return segs

    def bracket(self):
        self.need("["); sels = []
        while True:
            self.ws(); sels.append(self.selector()); self.ws()
            if self.eat(","): continue
            self.need("]"); return sels

    def selector(self):
        c = self.peek()
        if c == "*": self.i += 1; return ("wild",)
        if c == "?": self.i += 1; self.ws(); return ("filter", self.expr())
        if c in "'\"": return ("name", self.quoted())
        a = self.integer()
        self.ws()
        if self.peek() == ":":
            self.i += 1; self.ws(); b = self.integer(); self.ws(); step = None
            if self.eat(":"): self.ws(); step = self.integer()
            return ("slice", a, b, step)
        if a is None: raise Err("selector expected at " + str(self.i))
        return ("index", a)

    def expr(self):
        left = self.conj(); self.ws()
        while self.eat("||"): self.ws(); left = ("or", left, self.conj()); self.ws()
        return left
    def conj(self):
        left = self.unary(); self.ws()
        while self.eat("&&"): self.ws(); left = ("and", left, self.unary()); self.ws()
        return left
    def unary(self):
        self.ws()
        if self.eat("!"): return ("not", self.unary())
        if self.peek() == "(":
            self.i += 1; e = self.expr(); self.ws(); self.need(")"); return e
        left = self.operand(); self.ws()
        for op in ("==", "!=", "<=", ">=", "<", ">"):
            if self.eat(op):
                self.ws(); return ("cmp", op, left, self.operand())
        if left[0] == "rel": return ("exists", left)
        raise Err("test expected")
    def operand(self):
        self.ws(); c = self.peek()
        if c == "@": return ("rel", self.query("@"))
        if c == "$": return ("abs", self.query("$"))
        if c in "'\"": return ("lit", self.quoted())
        if self.s.startswith("true", self.i): self.i += 4; return ("lit", True)
        if self.s.startswith("false", self.i): self.i += 5; return ("lit", False)
        if self.s.startswith("null", self.i): self.i += 4; return ("lit", None)
        if self.s.startswith("count(", self.i):
            self.i += 6; self.ws(); q = self.operand(); self.ws(); self.need(")"); return ("count", q)
        m = re.compile(r"-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?").match(self.s, self.i)
        if not m: raise Err("operand expected at " + str(self.i))
        self.i = m.end(); t = m.group(0); return ("lit", float(t) if re.search(r"[.eE]", t) else int(t))

def children(v):
    if isinstance(v, list): return [(i, x) for i, x in enumerate(v)]
    if isinstance(v, dict): return list(v.items())
    return []

def slice_idx(n, a, b, step):
    step = 1 if step is None else step
    if step == 0: return []
    def norm(i): return i + n if i < 0 else i
    if step > 0:
        lo = max(min(norm(0 if a is None else a), n), 0); hi = max(min(norm(n if b is None else b), n), 0)
        return list(range(lo, hi, step))
    lo = max(min(norm(n - 1 if a is None else a), n - 1), -1); hi = max(min(norm(-n - 1 if b is None else b), n - 1), -1)
    return list(range(lo, hi, step))

def apply_sel(sel, path, v, root):
    out = []
    t = sel[0]
    if t == "name":
        if isinstance(v, dict) and sel[1] in v: out.append((path + [sel[1]], v[sel[1]]))
    elif t == "wild":
        for k, x in children(v): out.append((path + [k], x))
    elif t == "index":
        if isinstance(v, list):
            i = sel[1] + len(v) if sel[1] < 0 else sel[1]
            if 0 <= i < len(v): out.append((path + [i], v[i]))
    elif t == "slice":
        if isinstance(v, list):
            for i in slice_idx(len(v), sel[1], sel[2], sel[3]): out.append((path + [i], v[i]))
    elif t == "filter":
        for k, x in children(v):
            if truth(sel[1], x, root): out.append((path + [k], x))
    return out

def run(segs, start, root):
    nodes = [start]
    for kind_, sels in segs:
        nxt = []
        for path, v in nodes:
            if kind_ == "child":
                for s in sels: nxt += apply_sel(s, path, v, root)
            else:
                stack = [(path, v)]; order = []
                def walk(p, x):
                    order.append((p, x))
                    for k, y in children(x): walk(p + [k], y)
                walk(path, v)
                for p, x in order:
                    for s in sels: nxt += apply_sel(s, p, x, root)
        nodes = nxt
    return nodes

NOTHING = object()

def value_of(op, cur, root):
    t = op[0]
    if t == "lit": return op[1]
    if t == "count": return float(len(run(op[1][1], ([], cur if op[1][0] == "rel" else root), root))) if True else NOTHING
    nodes = run(op[1], ([], cur if t == "rel" else root), root)
    return nodes[0][1] if len(nodes) == 1 else NOTHING

def same(a, b):
    if a is NOTHING or b is NOTHING: return a is NOTHING and b is NOTHING
    if kind(a) != kind(b): return False
    if kind(a) in ("array", "object"): return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)
    return a == b

def truth(e, cur, root):
    t = e[0]
    if t == "or": return truth(e[1], cur, root) or truth(e[2], cur, root)
    if t == "and": return truth(e[1], cur, root) and truth(e[2], cur, root)
    if t == "not": return not truth(e[1], cur, root)
    if t == "exists":
        return len(run(e[1][1], ([], cur if e[1][0] == "rel" else root), root)) > 0
    op, a, b = e[1], value_of(e[2], cur, root), value_of(e[3], cur, root)
    if op == "==": return same(a, b)
    if op == "!=": return not same(a, b)
    if a is NOTHING or b is NOTHING: return False
    ka, kb = kind(a), kind(b)
    if ka != kb or ka not in ("number", "string"): return False
    return {"<": a < b, ">": a > b, "<=": a <= b, ">=": a >= b}[op]

def norm(path):
    out = "$"
    for s in path:
        out += "[%d]" % s if isinstance(s, int) else "['%s']" % s.replace("\\", "\\\\").replace("'", "\\'")
    return out

req = json.loads(sys.stdin.buffer.read().decode("utf-8"))
doc = json.loads(req["document"])
res = []
for q in req["queries"]:
    try:
        p = P(q); segs = p.query("$"); p.ws()
        if p.i != len(q): raise Err("trailing")
        res.append([norm(path) for path, _ in run(segs, ([], doc), doc)])
    except Exception as e:
        res.append("ERR " + str(e))
sys.stdout.buffer.write(json.dumps(res).encode("ascii"))
`;

    const pythonPaths = (document, queries) => {
        const run = spawnSync("python", ["-I", "-c", SCRIPT], { input: JSON.stringify({ document, queries }), encoding: "utf8" });
        assert.equal(run.status, 0, run.stderr);
        return JSON.parse(run.stdout);
    };

    it("Python, the hand-written paths and the page's engine agree on every solution", { skip: available ? false : "python is not available on this machine" }, () => {
        const document = set.exercises[0].document;
        const got = pythonPaths(document, set.exercises.map((e) => e.solution));
        set.exercises.forEach((ex, i) => {
            assert.ok(Array.isArray(got[i]), `${ex.id}: ${got[i]}`);
            assert.deepEqual(got[i], ex.expected.map(normalizedPath), `${ex.id}: Python vs hand-written`);
            assert.deepEqual(evaluateQuery(document, ex.solution).nodes.map((n) => normalizedPath(n.path)), got[i], `${ex.id}: engine vs Python`);
        });
    });

    it("Python and the engine agree on a wider set of queries (so the oracle is not only agreeing on the solutions)", { skip: available ? false : "python is not available on this machine" }, () => {
        const document = set.exercises[0].document;
        const queries = [
            "$.library.books[1:4:2].id", "$.library.books[-2:].id", "$.library.books[:2].id", "$.library.books[3:1:-1].id", "$.library.books[::2].title",
            "$..[?@.price>20].id", "$.library.staff[?@.years>5].name", "$.library.books[?@.tags[0]=='tech'].id", "$.library.books[?!(@.year<2000)].id",
            "$.library..id", "$..*", "$.library['name','location']", "$.library.books[?@.id>=2 && @.id<=4].title", "$.library.books[?@.year<1980 || @.price>40].id",
            "$.library.books[?count(@.tags[*])==0].id", "$.library.books[?count(@.tags[*])>=2].id", "$.library.books[?@.isbn].id", "$.library.books[?@.price==9].id",
            "$.library.books[?@.title=='Old Maps'].id", "$.library.books[?@.available!=true].id", "$.library.location[?@==3]", "$.library.books[10]", "$.library.books[-9]",
            "$.library.books[0].missing", "$.library.books[*].tags[*]", "$.library.books[?@.tags[*]].id", "$..books[?@.available==true && @.year>2010].id", "$['library']['staff'][1]['name']"
        ];
        const got = pythonPaths(document, queries);
        queries.forEach((q, i) => {
            assert.ok(Array.isArray(got[i]), `${q}: ${got[i]}`);
            const run = evaluateQuery(document, q);
            assert.equal(run.state, "done", q);
            assert.deepEqual(run.nodes.map((n) => normalizedPath(n.path)), got[i], q);
        });
    });

});
