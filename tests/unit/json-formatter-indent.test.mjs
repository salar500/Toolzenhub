/**
 * JSON Formatter indentation choice (approved enhancement X3).
 * Oracle: JSON.stringify(JSON.parse(text), null, indent) on documents where its output is exact
 * (no duplicate keys, small integers, plain strings); the default must stay byte-identical to the old output.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { analyze, format, minify, INDENTS } from "../../assets/js/tools/json-formatter/json-engine.js";

const DOCS = [
  '{"a":1,"b":[1,2,{"c":null}],"d":{"e":[],"f":{}},"g":"x"}',
  "[1,[2,[3,[4]]]]",
  '{"a":{"b":{"c":{"d":true}}}}',
  "[]",
  "{}",
  '"s"',
  "[{},[],{\"k\":[{}]}]",
  ' \n {"a" : [ 1 , 2 ] , "b" :\t{ } } \n',
];

test("2 spaces, 4 spaces and tab match JSON.stringify exactly", () => {
  for (const doc of DOCS) {
    const value = JSON.parse(doc);
    assert.equal(format(doc, { indent: INDENTS.two }).output, JSON.stringify(value, null, 2), doc);
    assert.equal(format(doc, { indent: INDENTS.four }).output, JSON.stringify(value, null, 4), doc);
    assert.equal(format(doc, { indent: INDENTS.tab }).output, JSON.stringify(value, null, "\t"), doc);
  }
});

test("the default is byte-identical to two spaces and to the old call without options", () => {
  for (const doc of DOCS) {
    assert.equal(format(doc).output, format(doc, { indent: "  " }).output);
    assert.equal(format(doc).output, format(doc, {}).output);
    assert.equal(format(doc).output, JSON.stringify(JSON.parse(doc), null, 2));
  }
});

test("only the listed indentations are accepted; anything else falls back to two spaces", () => {
  const doc = '{"a":[1]}';
  for (const bad of [" ", "   ", "\t\t", "--", "", null, undefined, 4, "x"]) {
    assert.equal(format(doc, { indent: bad }).output, JSON.stringify(JSON.parse(doc), null, 2), String(bad));
  }
  assert.deepEqual(INDENTS, { two: "  ", four: "    ", tab: "\t" });
});

test("the indentation changes only whitespace: the content, numbers and strings are untouched", () => {
  const doc = String.raw`{"n":1.50,"big":12345678901234567890,"e":1E+2,"s":"a\u00e9\n","u":"é😀"}`;
  for (const indent of Object.values(INDENTS)) {
    const out = format(doc, { indent }).output;
    assert.equal(minify(out).output, minify(doc).output);
    assert.ok(out.includes("1.50") && out.includes("12345678901234567890") && out.includes("1E+2") && out.includes(String.raw`a\u00e9\n`));
  }
});

test("minify, check and the errors are unaffected by the option", () => {
  assert.equal(analyze('{"a": 1}', "minify", { indent: INDENTS.tab }).output, '{"a":1}');
  assert.equal(analyze('{"a": 1}', "check", { indent: INDENTS.tab }).output, null);
  const bad = analyze('{"a":1,}', "format", { indent: INDENTS.four });
  assert.equal(bad.state, "invalid");
  assert.equal(bad.error.column, 7);
});

test("depth 500 formats with every indentation and each level adds exactly one unit", () => {
  const deep = "[".repeat(500) + "]".repeat(500);
  for (const indent of Object.values(INDENTS)) {
    const out = format(deep, { indent }).output;
    const lines = out.split("\n");
    assert.equal(lines.length, 999);
    assert.equal(lines[250], indent.repeat(250) + "[");
  }
});
