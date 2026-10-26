/**
 * Tool Pack 36: the JSONPath Tester engine (RFC 9535 without match() and search()).
 *
 * Expected values are derived by hand from RFC 9535: the section 1.5 bookstore
 * document, the worked examples of sections 2.3.1 to 2.5.2, the comparison table of
 * 2.3.5.2 and the Normalized Path rules of 2.7. No code is shared with the engine.
 * The official compliance suite was NOT vendored (licence and availability were not
 * verified, OPEN-03); the vectors below are independent RFC-derived cases and the
 * refused regex functions are asserted as intentional refusals, not skipped.
 * Covers AC-JP-002..015, 020, 027, 028, 030 at the engine level.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
    evaluateQuery,
    parseQuery,
    countText,
    valuesText,
    EXAMPLE_DOCUMENT,
    EXAMPLE_QUERY,
    UNSUPPORTED_FUNCTIONS_MESSAGE,
    MAX_QUERY_CHARS
} from "../../assets/js/tools/jsonpath-tester/jsonpath-engine.js";

import { normalizedPath, serialize } from "../../assets/js/tools/json-tree/json-tree.js";

const run = (doc, query) => evaluateQuery(typeof doc === "string" ? doc : JSON.stringify(doc), query);

/** the matched values as JSON.parse'd values */
const values = (doc, query) => {
    const r = run(doc, query);
    assert.equal(r.state, "done", `${query}: ${JSON.stringify(r.query)}`);
    return r.nodes.map((n) => JSON.parse(serialize(n.node)));
};

const paths = (doc, query) => run(doc, query).nodes.map((n) => normalizedPath(n.path));

const refused = (query, doc = "{}") => {
    const r = run(doc, query);
    assert.equal(r.state, "blocked", query);
    assert.equal(r.query.status, "invalid", `${query} should be refused`);
    return r.query;
};

const STORE = JSON.parse(EXAMPLE_DOCUMENT);
const [B0, B1, B2, B3] = STORE.store.book;


/* ---------- RFC 9535 section 1.5 ---------- */

test("1.5 bookstore: the documented queries and their results", () => {
    assert.deepEqual(values(STORE, "$.store.book[*].author"), ["Nigel Rees", "Evelyn Waugh", "Herman Melville", "J. R. R. Tolkien"]);
    assert.deepEqual(values(STORE, "$..author"), ["Nigel Rees", "Evelyn Waugh", "Herman Melville", "J. R. R. Tolkien"]);
    assert.deepEqual(values(STORE, "$.store.*"), [STORE.store.book, STORE.store.bicycle]);
    assert.deepEqual(values(STORE, "$.store..price"), [8.95, 12.99, 8.99, 22.99, 399]);
    assert.deepEqual(values(STORE, "$..book[2]"), [B2]);
    assert.deepEqual(values(STORE, "$..book[-1]"), [B3]);
    assert.deepEqual(values(STORE, "$..book[0,1]"), [B0, B1]);
    assert.deepEqual(values(STORE, "$..book[:2]"), [B0, B1]);
    assert.deepEqual(values(STORE, "$..book[?@.isbn]"), [B2, B3]);
    assert.deepEqual(values(STORE, "$..book[?@.price<10]"), [B0, B2]);
});

test("1.5: $..* visits every member value and element exactly once", () => {
    // store (1) + book, bicycle (2) + 4 books + members: 4+4+5+5 = 18, bicycle members 2
    assert.equal(run(STORE, "$..*").nodes.length, 1 + 2 + 4 + 18 + 2);
});

test("1.5: the example loader's query gives the documented result and paths", () => {
    assert.deepEqual(paths(EXAMPLE_DOCUMENT, EXAMPLE_QUERY), ["$['store']['book'][0]", "$['store']['book'][2]"]);
});

test("$..book[2].publisher matches nothing and the trace says where it became empty (AC-JP-007)", () => {
    const r = run(STORE, "$..book[2].publisher");
    assert.equal(r.nodes.length, 0);
    assert.deepEqual(r.trace.map((t) => [t.text, t.in, t.out]), [["..book", 1, 1], ["[2]", 1, 1], [".publisher", 1, 0]]);
    assert.equal(r.emptyAt, 2);
    assert.deepEqual(r.trace.map((t) => t.kind), ["descendant segment, name selector", "child segment, index selector", "child segment, name selector"]);
    assert.equal(countText(0), "0 nodes matched.");
    assert.equal(countText(1), "1 node matched.");
    assert.equal(countText(4), "4 nodes matched.");
});


/* ---------- 2.3 selectors ---------- */

test("2.3.1 name selectors", () => {
    const d = { o: { "j j": { "k.k": 3 } }, "'": { "@": 2 } };
    assert.deepEqual(values(d, "$.o['j j']['k.k']"), [3]);
    assert.deepEqual(values(d, '$.o["j j"]["k.k"]'), [3]);
    assert.deepEqual(values(d, '$["\'"]["@"]'), [2]);
    assert.deepEqual(values(d, "$['\\'']['@']"), [2]);
});

test("2.3.2 wildcard selectors, duplicates kept", () => {
    const d = { o: { j: 1, k: 2 }, a: [5, 3] };
    assert.deepEqual(values(d, "$[*]"), [{ j: 1, k: 2 }, [5, 3]]);
    assert.deepEqual(values(d, "$.o[*]"), [1, 2]);
    assert.deepEqual(values(d, "$.o[*, *]"), [1, 2, 1, 2]);
    assert.deepEqual(values(d, "$.a[*]"), [5, 3]);
    assert.deepEqual(values({ a: 1 }, "$.a[*]"), []);
});

test("2.3.3 index selectors, including negative and out of range", () => {
    const d = ["a", "b"];
    assert.deepEqual(values(d, "$[1]"), ["b"]);
    assert.deepEqual(values(d, "$[-2]"), ["a"]);
    assert.deepEqual(values(d, "$[2]"), []);
    assert.deepEqual(values(d, "$[-3]"), []);
    assert.deepEqual(values({ 1: "x" }, "$[1]"), []);
});

test("2.3.4 array slice selectors (AC-JP-009)", () => {
    const d = ["a", "b", "c", "d", "e", "f", "g"];
    assert.deepEqual(values(d, "$[1:3]"), ["b", "c"]);
    assert.deepEqual(values(d, "$[5:]"), ["f", "g"]);
    assert.deepEqual(values(d, "$[1:5:2]"), ["b", "d"]);
    assert.deepEqual(values(d, "$[5:1:-2]"), ["f", "d"]);
    assert.deepEqual(values(d, "$[::-1]"), ["g", "f", "e", "d", "c", "b", "a"]);
    const n = [0, 1, 2, 3, 4];
    assert.deepEqual(values(n, "$[1:3]"), [1, 2]);
    assert.deepEqual(values(n, "$[::2]"), [0, 2, 4]);
    assert.deepEqual(values(n, "$[3:0:-1]"), [3, 2, 1]);
    assert.deepEqual(values(n, "$[::0]"), []);
    assert.deepEqual(values(n, "$[-2:]"), [3, 4]);
    assert.deepEqual(values(n, "$[:-3]"), [0, 1]);
    assert.deepEqual(values(n, "$[10:20]"), []);
    assert.deepEqual(values(n, "$[-10:2]"), [0, 1]);
    assert.deepEqual(values(n, "$[ 1 : 3 ]"), [1, 2]);
    assert.deepEqual(values(n, "$[::]"), [0, 1, 2, 3, 4]);
    assert.deepEqual(values({ a: 1 }, "$[0:1]"), []);
});

test("2.3.5 filter selectors on the RFC document", () => {
    const d = {
        a: [3, 5, 1, 2, 4, 6, { b: "j" }, { b: "k" }, { b: {} }, { b: "kilo" }],
        o: { p: 1, q: 2, r: 3, s: 5, t: { u: 6 } },
        e: "f"
    };
    assert.deepEqual(values(d, "$.a[?@>3.5]"), [5, 4, 6]);
    assert.deepEqual(values(d, "$.a[?@.b]"), [{ b: "j" }, { b: "k" }, { b: {} }, { b: "kilo" }]);
    assert.deepEqual(values(d, "$[?@.*]"), [d.a, d.o]);
    assert.deepEqual(values(d, "$[?@[?@.b]]"), [d.a]);
    assert.deepEqual(values(d, "$.o[?@<3, ?@<3]"), [1, 2, 1, 2]);
    assert.deepEqual(values(d, '$.a[?@<2 || @.b == "k"]'), [1, { b: "k" }]);
    assert.deepEqual(values(d, '$.a[?(@.b == "kilo")]'), [{ b: "kilo" }]);
    assert.deepEqual(values(d, "$.a[?!@.b]"), [3, 5, 1, 2, 4, 6]);
    assert.deepEqual(values(d, "$.a[?@>3 && @<6]"), [5, 4]);
    assert.deepEqual(values(d, "$.a[?!(@>3 || @.b)]"), [3, 1, 2]);
    assert.deepEqual(values(d, "$.o[?@ == 1 || @ == 2 && @ == 3]"), [1]);
    assert.deepEqual(values(d, "$.a[ ?@ == 6 ]"), [6]);
});

test("filters apply to the members of an object and the elements of an array only", () => {
    assert.deepEqual(values({ a: "x" }, "$.a[?@]"), []);
    assert.deepEqual(values([1], "$[0][?@]"), []);
});

test("2.3.5.2 comparison table, including Nothing (AC-JP-030)", () => {
    const d = { obj: { x: "y" }, arr: [2, 3] };
    const yes = (f) => assert.equal(values(d, `$[?${f}]`).length, 2, f);
    const no = (f) => assert.equal(values(d, `$[?${f}]`).length, 0, f);
    yes("$.absent1 == $.absent2");
    yes("$.absent1 <= $.absent2");
    no("$.absent1 != $.absent2");
    no("$.absent == 'g'");
    yes("$.absent != 'g'");
    yes("1 == 1");
    yes("1 <= 2");
    no("1 > 2");
    no("13 == '13'");
    yes("13 != '13'");
    yes("'a' <= 'b'");
    no("'a' > 'b'");
    no("$.obj == $.arr");
    yes("$.obj != $.arr");
    yes("$.obj == $.obj");
    yes("$.obj <= $.obj");
    no("$.obj < $.arr");
    yes("$.arr == $.arr");
    yes("$.arr <= $.arr");
    no("1 <= $.arr");
    yes("true <= true");
    no("true > true");
    yes("null == null");
    yes("null <= null");
    no("null < null");
    no("$.x == 1");
    assert.deepEqual(values({ a: [{ k: 1 }, {}] }, "$.a[?@.k == @.z]"), [{}]);
});

test("a filter over a node lacking the member: missing equals missing, missing never equals a value", () => {
    assert.deepEqual(values([{ a: 1 }, {}], "$[?@.a==@.b]"), [{}]);
    assert.deepEqual(values([{ a: 1 }, {}], "$[?@.a==1]"), [{ a: 1 }]);
    assert.deepEqual(values([{ a: null }, {}], "$[?@.a==null]"), [{ a: null }]);
    assert.deepEqual(values([{ a: null }, {}], "$[?@.a]"), [{ a: null }]);
});

test("object and array equality is structural; key order and number spelling do not matter", () => {
    assert.deepEqual(values([{ x: { a: 1, b: [1, 2] } }], '$[?@.x == $[0].x]').length, 1);
    assert.deepEqual(values('[{"x":{"a":1,"b":[1,2]}},{"x":{"b":[1,2.0],"a":1.0}},{"x":{"a":1,"b":[2,1]}}]', "$[?@.x == $[0].x]").length, 2);
});


/* ---------- numbers are exact ---------- */

test("number comparison is exact decimal, not floating point", () => {
    const t = (a, op, b, expected) => {
        const r = values([0], `$[?${a} ${op} ${b}]`);
        assert.equal(r.length === 1, expected, `${a} ${op} ${b}`);
    };
    t("1", "<", "2", true);
    t("-1", "<", "-2", false);
    t("-1", ">", "-2", true);
    t("0", "==", "-0", true);
    t("0.5", "==", "0.50", true);
    t("1e3", ">", "999", true);
    t("-1e3", "<", "-999", true);
    t("0", "<", "1e-400", true);
    t("1e-400", ">", "0", true);
    t("-1e-400", "<", "0", true);
    t("123", "<", "124", true);
    t("12345678901234567890", "<", "12345678901234567891", true);
    t("12345678901234567890", "==", "12345678901234567891", false);
    t("0.1", "==", "0.1000000000000000055511151231257827", false);
    t("1e400", "==", "1" + "0".repeat(400), true);
    t("1e99999999999999999999", ">", "1e9999999999999999999", true);
    t("10", ">", "9.99999999999999999999", true);
    t("2e0", "<=", "2", true);
    t("2", ">=", "2.0", true);
});

test("a document number longer than a double is compared exactly", () => {
    assert.deepEqual(values("[12345678901234567890,12345678901234567891]", "$[?@>12345678901234567890]"), [JSON.parse("12345678901234567891")]);
    assert.equal(run("[12345678901234567890]", "$[0]").nodes.length, 1);
    assert.equal(serialize(run("[12345678901234567890]", "$[0]").nodes[0].node), "12345678901234567890");
    assert.equal(run("[1.50]", "$[0]").nodes[0].node.text, "1.50");
});

test("an extreme exponent in a query is compared without being expanded", () => {
    const huge = "1e" + "9".repeat(440);
    assert.equal(run([1], `$[?@<${huge}]`).nodes.length, 1);
    assert.equal(run([1], `$[?@>-${huge}]`).nodes.length, 1);
    assert.equal(run([1], `$[?${huge}==${huge}]`).nodes.length, 1);
    const tooBig = "1e" + "9".repeat(1001);
    assert.equal(run(`[${tooBig}]`, "$[0]").document.status, "refused");
    assert.match(run(`[${tooBig}]`, "$[0]").document.message, /exponent with more than 1000 digits/);
});

test("strings compare by code point (an astral character sorts above U+FFFF-range BMP characters)", () => {
    assert.equal(values(["\uffff"], "$[?@ < '😀']").length, 1);
    assert.equal(values(["\ud7ff"], "$[?@ < '\ue000']").length, 1);
    assert.equal(values(["a"], "$[?@ < 'ab']").length, 1);
    assert.equal(values(["b"], "$[?@ > 'ab']").length, 1);
    assert.equal(values(["é"], "$[?@ == 'e\\u0301']").length, 0);
});


/* ---------- 2.4 functions ---------- */

test("length(): code points, array elements, object members, Nothing otherwise", () => {
    const d = [{ a: "héllo" }, { a: "😀😀" }, { a: [1, 2, 3] }, { a: { x: 1, y: 2 } }, { a: 5 }, { a: true }, { a: null }, {}];
    assert.deepEqual(values(d, "$[?length(@.a)==5]"), [{ a: "héllo" }]);
    assert.deepEqual(values(d, "$[?length(@.a)==2]"), [{ a: "😀😀" }, { a: { x: 1, y: 2 } }]);
    assert.deepEqual(values(d, "$[?length(@.a)==3]"), [{ a: [1, 2, 3] }]);
    assert.deepEqual(values(d, "$[?length(@.a)>0]").length, 4);
    assert.deepEqual(values(d, "$[?length(@.a)==length(@.a)]").length, 8, "Nothing == Nothing");
    assert.deepEqual(values(d, "$[?length('abc')==3]").length, 8);
});

test("count(): the size of a node list; value(): the value when there is exactly one node (AC-JP-010)", () => {
    const d = [{ a: [1, 2], b: { x: 1 } }, { a: [] }, { a: [1], x: 1 }];
    assert.deepEqual(values(d, "$[?count(@.*)==2]"), [d[0], d[2]]);
    assert.deepEqual(values(d, "$[?count(@.a[*])==0]"), [d[1]]);
    assert.deepEqual(values(d, "$[?count(@..*)>2]"), [d[0], d[2]]);
    assert.deepEqual(values(d, "$[?count(@..*)>4]"), [d[0]]);
    assert.deepEqual(values(d, "$[?value(@.x)==1]"), [d[2]]);
    assert.deepEqual(values([{ x: 1 }, { x: 2 }, { y: 1 }], "$[?value(@..x)==1]"), [{ x: 1 }]);
    assert.deepEqual(values([{ a: { x: 1, y: 1 } }], "$[?value(@.a.*)==1]").length, 0, "two nodes: Nothing");
    assert.deepEqual(values([{ a: { x: 1 } }], "$[?value(@.a.*)==1]").length, 1);
});

test("ill-typed uses of functions are refused and name the function (AC-JP-010)", () => {
    for (const [q, name] of [
        ["$[?length(@.*)>0]", "length()"],
        ["$[?length(@..a)>0]", "length()"],
        ["$[?count(1)>0]", "count()"],
        ["$[?count('a')>0]", "count()"],
        ["$[?value(1)==1]", "value()"],
        ["$[?length(@.a, @.b)>0]", "length()"],
        ["$[?length()>0]", "length()"],
        ["$[?count(@.a == 1)>0]", "A function argument"]
    ]) {
        assert.ok(refused(q).message.includes(name), `${q}: ${refused(q).message}`);
    }
    for (const q of ["$[?length(@.a)]", "$[?count(@.a)]", "$[?value(@.a)]", "$[?true]", "$[?1]", "$[?'a']", "$[?@.* == 1]", "$[?@.a..b == 1]", "$[?$[*] == 1]", "$[?@.a[0,1] == 1]", "$[?@.a[?@] == 1]", "$[?@.a[1:2] == 1]", "$[?!@.a == 1]", "$[?unknown(@.a)]", "$[?Length(@.a)>1]"]) {
        refused(q);
    }
});

test("match() and search() are intentionally refused with the stated message (AC-JP-011, DEC-JP-1)", () => {
    for (const q of ["$[?match(@.a,'x')]", "$[?search(@.a,'x')]", "$[?!match(@.a,'x')]", "$..[?match(@.a, 'a.*')]"]) {
        const r = refused(q);
        assert.equal(r.message, UNSUPPORTED_FUNCTIONS_MESSAGE);
        assert.equal(r.message, "match() and search() are not supported in this version.");
    }
    assert.equal(run("{}", "$[?match(@.a,'x')]").document.status, "valid");
});


/* ---------- 2.5 descendants ---------- */

test("2.5.2 descendant segments and their order", () => {
    const d = { o: { j: 1, k: 2 }, a: [5, 3, [{ j: 4 }, { k: 6 }]] };
    assert.deepEqual(values(d, "$..j"), [1, 4]);
    assert.deepEqual(values(d, "$..[0]"), [5, { j: 4 }]);
    assert.deepEqual(values(d, "$..[*]"), [d.o, d.a, 1, 2, 5, 3, [{ j: 4 }, { k: 6 }], { j: 4 }, { k: 6 }, 4, 6]);
    assert.deepEqual(values(d, "$..*"), values(d, "$..[*]"));
    assert.deepEqual(values(d, "$..o"), [d.o]);
    assert.deepEqual(values(d, "$.o..[*, *]"), [1, 2, 1, 2]);
    assert.deepEqual(values(d, "$.a..[0, 1]"), [5, 3, { j: 4 }, { k: 6 }]);
    assert.deepEqual(values(d, "$..['j','k']"), [1, 2, 4, 6]);
    assert.deepEqual(paths(d, "$..j"), ["$['o']['j']", "$['a'][2][0]['j']"]);
    assert.deepEqual(values({ a: 1 }, "$..a"), [1]);
    assert.deepEqual(values({ a: { a: 1 } }, "$..a"), [{ a: 1 }, 1]);
});

test("the root alone, and a root that is a scalar", () => {
    assert.deepEqual(paths({ a: 1 }, "$"), ["$"]);
    assert.deepEqual(values(5, "$"), [5]);
    assert.deepEqual(values('"x"', "$[*]"), []);
    assert.deepEqual(values(null, "$.a"), []);
    assert.deepEqual(run({ a: 1 }, "$").trace, []);
});


/* ---------- 2.7 normalized paths ---------- */

test("normalized paths (AC-JP-008)", () => {
    assert.deepEqual(paths({ a: 1 }, "$.a"), ["$['a']"]);
    assert.deepEqual(paths({ a: 1 }, '$["a"]'), ["$['a']"]);
    assert.deepEqual(paths([1, 2, 3, 4, 5], "$[-3]"), ["$[2]"]);
    assert.deepEqual(paths({ "\u000b": 1 }, '$["\\u000B"]'), ["$['\\u000b']"]);
    assert.deepEqual(paths({ "a'b": 1, "c\\d": 2, "e\nf": 3, é: 4 }, "$[*]"), ["$['a\\'b']", "$['c\\\\d']", "$['e\\nf']", "$['é']"]);
    assert.deepEqual(paths(STORE, "$..book[1:3]"), ["$['store']['book'][1]", "$['store']['book'][2]"]);
    assert.deepEqual(paths(STORE, "$..book[?@.price>12]"), ["$['store']['book'][1]", "$['store']['book'][3]"]);
});


/* ---------- query grammar ---------- */

test("malformed queries are refused with a position and nothing is evaluated (AC-JP-012)", () => {
    for (const q of ["$.", "$[", "$[?@.a", "$..", "$[1:2:3:4]", "$.a b", "$.a.", "$[", "$[]", "$['a'", "$['a]", "$[a]", "$[1,]", "$[,1]", "$[?]", "$[?@.a ==]", "$[?@.a == 1 &&]", "$[?(@.a]", "$[?@.a)]", "$.1a", "$.-a", "$..[", "$...a", "$.[a]", "a", "@.a", "", "$[1.5]", "$[1e2]", "$[1:2:]x", "$[?@.a === 1]", "$[?@.a = 1]", "$[?@.a <> 1]", "$[?@.a & @.b]", "$[?@.a | @.b]", "$['a' 'b']", "$[?@.a == 'x]", "$[?@.a == \"x']"]) {
        const r = run("{}", q);
        if (q === "") {
            assert.equal(r.query.status, "empty");
            continue;
        }
        assert.equal(r.state, "blocked", q);
        assert.equal(r.query.status, "invalid", `${q} should be refused`);
        assert.ok(Number.isInteger(r.query.position) && r.query.position >= 1 && r.query.position <= q.length + 1, `${q}: position ${r.query.position}`);
    }
});

test("positions point at the offending character (1-based)", () => {
    assert.equal(refused("$.a b").position, 5);
    assert.equal(refused("$[1:2:3:4]").position, 8);
    assert.equal(refused("$.").position, 3);
    assert.equal(refused("$..").position, 4);
    assert.equal(refused("$[?match(@.a,'x')]").position, 4);
    assert.equal(refused("x").position, 1);
});

test("implementation-specific syntax is refused with the reason (AC-JP-013)", () => {
    assert.match(refused("$[(@.length-1)]").message, /not part of RFC 9535/);
    assert.match(refused("$..").message, /not part of RFC 9535/);
    assert.deepEqual(values({ length: 3, a: { length: 7 } }, "$.a.length"), [7]);
    assert.deepEqual(values({ length: 3 }, "$.length"), [3]);
    assert.match(refused("@.a").message, /must start with "\$"/);
});

test("whitespace: allowed between segments and inside brackets, rejected around the whole query (DEC-JP-3)", () => {
    assert.deepEqual(values({ a: { b: 2 } }, "$ ['a'] .b".replace(" .b", " ['b']")), [2]);
    assert.deepEqual(values({ a: { b: 2 } }, "$ .a  .b"), [2]);
    assert.deepEqual(values([1, 2], "$[ 0 , 1 ]"), [1, 2]);
    assert.deepEqual(values([1, 2], "$[\n0\t,\r1]"), [1, 2]);
    assert.match(refused(" $.a").message, /Remove the spaces before/);
    assert.match(refused("$.a ").message, /Remove the spaces after/);
    assert.match(refused("$.a\n").message, /Remove the spaces after/);
    assert.equal(run("{}", "   ").query.status, "empty");
});

test("integers: the I-JSON range, no leading zeros, no -0 (AC-JP-014)", () => {
    assert.equal(run([1], "$[9007199254740991]").state, "done");
    assert.equal(run([1], "$[-9007199254740991]").state, "done");
    assert.match(refused("$[9007199254740992]").message, /outside the range/);
    assert.match(refused("$[-9007199254740992]").message, /outside the range/);
    assert.match(refused("$[::9007199254740992]").message, /outside the range/);
    refused("$[01]");
    refused("$[-0]");
    refused("$[00]");
    assert.equal(run([1, 2], "$[0]").nodes.length, 1);
    assert.deepEqual(values([1, 2, 3], "$[::9007199254740991]"), [1]);
});

test("quoted names: escapes, surrogate pairs, errors (AC-JP-015)", () => {
    assert.deepEqual(values({ "😀": 1 }, "$['😀']"), [1]);
    assert.deepEqual(values({ "😀": 1 }, '$["\\ud83d\\ude00"]'), [1]);
    assert.deepEqual(values({ "😀": 1 }, "$['\\uD83D\\uDE00']"), [1]);
    assert.deepEqual(values({ "a\nb": 1, "tab\t": 2, "q'": 3, 'q"': 4, "s/": 5, "b\\": 6, "\b\f\r": 7 }, "$['a\\nb','tab\\t',\"q'\",'q\"','s\\/','b\\\\','\\b\\f\\r']"), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(values({ "q'": 3 }, "$['q\\'']"), [3]);
    assert.deepEqual(values({ 'q"': 4 }, '$["q\\""]'), [4]);
    assert.deepEqual(values({ "é": 1 }, "$['\\u00e9']"), [1]);
    for (const q of ["$['\\ud800']", "$['\\udc00']", "$['\\ud800x']", "$['\\ud800\\u0041']", "$['\\u12']", "$['\\u12g4']", "$['\\x41']", "$['\\q']", "$[\"\\'\"]", "$['\\\"']", "$['a\nb']", "$['a\u0001b']", "$['\ud800']"]) {
        refused(q);
    }
    assert.deepEqual(values({ "": 1 }, "$['']"), [1]);
    assert.deepEqual(values({ é: 1, "日本": 2 }, "$.é"), [1]);
    assert.deepEqual(values({ é: 1, "日本": 2 }, "$.日本"), [2]);
    assert.deepEqual(values({ a_1: 1 }, "$.a_1"), [1]);
    assert.deepEqual(values({ _x: 1 }, "$._x"), [1]);
});

test("a document string with a lone surrogate escape is kept and noted", () => {
    const r = run('{"a":"\\ud800"}', "$.a");
    assert.equal(r.nodes.length, 1);
    assert.match(r.notes.join(" "), /lone surrogate/);
});

test("prototype-like names are ordinary member names (AC-JP-028)", () => {
    const d = '{"__proto__":1,"constructor":2,"hasOwnProperty":3,"toString":4}';
    assert.deepEqual(values(d, "$.__proto__"), [1]);
    assert.deepEqual(values(d, "$.constructor"), [2]);
    assert.deepEqual(values(d, "$['hasOwnProperty']"), [3]);
    assert.deepEqual(values(d, "$.toString"), [4]);
    assert.deepEqual(values(d, "$[*]"), [1, 2, 3, 4]);
    assert.deepEqual(values("{}", "$.__proto__"), []);
    assert.deepEqual(values("{}", "$.constructor"), []);
    assert.deepEqual(values('{"a":{}}', "$.a.__proto__.x"), []);
    assert.equal(Object.prototype.polluted, undefined);
    assert.deepEqual(Object.keys(Object.prototype), []);
    const f = run("[1]", "$[?@.constructor == 1 || @.hasOwnProperty == 1 || @.length == 1]");
    assert.equal(f.nodes.length, 0);
});


/* ---------- documents ---------- */

test("document states: empty, invalid (located), too large; the query is still checked", () => {
    const empty = run("  ", "$.a");
    assert.equal(empty.state, "blocked");
    assert.equal(empty.document.status, "empty");
    assert.equal(empty.query.status, "valid");
    const bad = run('{"a":1,}', "$.a[");
    assert.equal(bad.document.status, "invalid");
    assert.equal(bad.document.error.line, 1);
    assert.equal(bad.document.error.column, 7);
    assert.equal(bad.query.status, "invalid");
    const noQuery = run("{}", "");
    assert.equal(noQuery.query.status, "empty");
    assert.equal(noQuery.document.status, "valid");
    const big = evaluateQuery("[" + "1".repeat(1_000_000) + "]", "$");
    assert.equal(big.document.status, "too-large");
    assert.equal(big.document.limit, 1_000_000);
    const exactly = evaluateQuery("[" + "1".repeat(999_998) + "]", "$");
    assert.equal(exactly.state, "done");
});

test("strict JSON: comments, NaN, a BOM, trailing commas and depth 501 are invalid; depth 500 is fine", () => {
    for (const bad of ["{/*c*/}", "NaN", "\uFEFF{}", "[1,]", "{'a':1}"]) {
        assert.equal(run(bad, "$").document.status, "invalid", bad);
    }
    const deep = (n) => "[".repeat(n) + "]".repeat(n);
    assert.equal(run(deep(500), "$").state, "done");
    assert.equal(run(deep(501), "$").document.status, "invalid");
    assert.equal(run(deep(500), "$..*").state, "done");
});

test("duplicate keys: the last value wins, with a note", () => {
    const r = run('{"a":1,"a":2}', "$.a");
    assert.deepEqual(r.nodes.map((n) => serialize(n.node)), ["2"]);
    assert.match(r.notes[0], /^Document: 1 key appears more than once/);
});


/* ---------- limits and hostile queries ---------- */

test("query length: 1,000 characters accepted, 1,001 refused (AC-JP-020)", () => {
    assert.equal(MAX_QUERY_CHARS, 1000);
    const ok = "$" + "[0]".repeat(333);
    assert.equal(ok.length, 1000);
    assert.equal(run("[[[1]]]", ok).state, "done");
    const over = ok + "[";
    assert.equal(run("[1]", over).query.status, "too-large");
    assert.equal(run("[1]", over).query.limit, 1000);
});

test("working set: more than 100,000 nodes at one segment stops with the stated message", () => {
    const doc = JSON.stringify(Array.from({ length: 350 }, () => Array.from({ length: 350 }, (_, i) => i)));
    const r = run(doc, "$..*");
    assert.equal(r.state, "limit");
    assert.equal(r.message, "The query selected more than 100,000 nodes at segment 1; narrow it.");
    const small = run(JSON.stringify(Array.from({ length: 300 }, () => Array.from({ length: 300 }, (_, i) => i))), "$..*");
    assert.equal(small.state, "done");
    assert.equal(small.nodes.length, 300 + 300 * 300);
    const level = (width, n) => Array.from({ length: width }, () => (n === 0 ? 1 : level(width, n - 1)));
    const chain = run(JSON.stringify(level(14, 3)), "$..*..*");
    assert.equal(chain.state, "limit");
    assert.equal(chain.message, "The query selected more than 100,000 nodes at segment 2; narrow it.");
    assert.equal(run(JSON.stringify(level(14, 3)), "$..*").state, "done");
});

test("nested filters over a large document stop instead of hanging", () => {
    const doc = JSON.stringify(Array.from({ length: 200 }, () => Array.from({ length: 200 }, (_, i) => ({ x: i }))));
    const t = Date.now();
    const r = run(doc, "$[?count(@..x) > 5]..[?count(@..*) > 0]");
    assert.ok(["done", "limit"].includes(r.state));
    assert.ok(Date.now() - t < 8000, `took ${Date.now() - t} ms`);
});

test("a large filter runs in reasonable time", () => {
    const doc = "[" + Array.from({ length: 100000 }, (_, i) => i).join(",") + "]";
    const t = Date.now();
    const r = run(doc, "$[?@>99990]");
    assert.equal(r.nodes.length, 9);
    assert.ok(Date.now() - t < 5000, `took ${Date.now() - t} ms`);
});

test("hostile query text is only ever data", () => {
    for (const q of ["$[?@.a == '<img src=x onerror=1>']", "$['<script>alert(1)</script>']", "$[\"'; DROP TABLE x; --\"]", "$[?(@.a == 1) || constructor.constructor('return 1')()]"]) {
        const r = run('{"a":1}', q);
        assert.ok(r.state === "done" || r.query.status === "invalid", q);
    }
    assert.equal(globalThis.__pwned, undefined);
});

test("valuesText: a JSON array of the matches in result order, exact number text", () => {
    assert.equal(valuesText(run("[1.50,\"x\",{\"a\":[1e400]}]", "$[*]")), '[1.50,"x",{"a":[1e400]}]');
    assert.equal(valuesText(run("[]", "$[*]")), "[]");
});

test("parseQuery is exported and returns ok/position/message without throwing on any string", () => {
    for (const s of ["", "$", "$.a", "\u0000", "$[?", "$[?@.a==", "$['\ud800", "$" + "[".repeat(500), "$[?" + "(".repeat(400) + "@.a" + ")".repeat(400) + "]", "$[?" + "!".repeat(300) + "@.a]"]) {
        const r = parseQuery(s);
        assert.equal(typeof r.ok, "boolean");
    }
    assert.equal(parseQuery("$[?" + "(".repeat(400) + "@.a" + ")".repeat(400) + "]").ok, true);
});


/* ---------- purity ---------- */

test("the engine is pure: no DOM, network, storage, clock, randomness, code execution or user-built regular expressions", () => {
    const code = readFileSync(new URL("../../assets/js/tools/jsonpath-tester/jsonpath-engine.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const banned of ["fetch(", "XMLHttpRequest", "sendBeacon", "document.", "window.", "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "innerHTML", "setTimeout", "new RegExp", "RegExp(", ".match(", ".search(", ".replace("]) {
        assert.ok(!code.includes(banned), `engine must not contain ${banned}`);
    }
});
