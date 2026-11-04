/**
 * JSON Compare: the line each difference sits on in its own document. Expected lines are counted by hand from the texts below.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { locateLines } from "../../assets/js/tools/json-compare/line-locator.js";
import { compareJson } from "../../assets/js/tools/json-compare/json-compare-engine.js";

const A = `{
  "name": "Asha",
  "tags": [
    "x",
    "y"
  ],
  "address": {
    "city": "Pune",
    "pin": "411001"
  },
  "gone": 1
}`;

const B = `{
  "name": "Asha Rao",
  "address": {
    "pin": "411001",
    "city": "Pune"
  },
  "tags": ["x", "z"],
  "new": true
}`;

test("locateLines: hand-counted lines for objects, arrays and nested members", () => {
    const at = locateLines(A);
    assert.equal(at([]), 1);
    assert.equal(at(["name"]), 2);
    assert.equal(at(["tags"]), 3);
    assert.equal(at(["tags", 0]), 4);
    assert.equal(at(["tags", 1]), 5);
    assert.equal(at(["address"]), 7);
    assert.equal(at(["address", "city"]), 8);
    assert.equal(at(["address", "pin"]), 9);
    assert.equal(at(["gone"]), 11);
    assert.equal(at(["missing"]), null);
});

test("locateLines: escapes, brackets inside strings, empty containers and a repeated key (first wins)", () => {
    const text = '{\n"a\\"b": "]}",\n"e": [],\n"o": {},\n"a\\"b": 2\n}';
    const at = locateLines(text);
    assert.equal(at(['a"b']), 2);
    assert.equal(at(["e"]), 3);
    assert.equal(at(["o"]), 4);
});

test("compareJson gives each difference the line in the first and the second document", () => {
    const r = compareJson(A, B);
    const by = (kind, path) => r.rows.find((x) => x.kind === kind && x.path.join("/") === path);
    const name = by("changed", "name");
    assert.deepEqual([name.lineA, name.lineB], [2, 2]);
    const z = by("changed", "tags/1");
    assert.deepEqual([z.lineA, z.lineB], [5, 7]);
    const gone = by("removed", "gone");
    assert.deepEqual([gone.lineA, gone.lineB], [11, null]);
    const added = by("added", "new");
    assert.deepEqual([added.lineA, added.lineB], [null, 8]);
    assert.equal(r.rows.some((x) => x.path.join("/").startsWith("address")), false, "moved keys are not differences");
});

test("with array order ignored no line is given", () => {
    const r = compareJson("[1,2]", "[2,3]", { ignoreOrder: true });
    assert.ok(r.rows.length > 0);
    assert.ok(r.rows.every((x) => x.lineA === undefined && x.lineB === undefined));
});

test("a large document is located without error", () => {
    const rows = Array.from({ length: 5000 }, (_, i) => `  {"id": ${i}}`);
    const text = `[\n${rows.join(",\n")}\n]`;
    const at = locateLines(text);
    assert.equal(at([4999]), 5001);
    assert.equal(at([0, "id"]), 2);
});
