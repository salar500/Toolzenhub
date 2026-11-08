/* Structured-output exercises: the validator follows the JSON Schema rules it supports; each model passes and each weak answer fails. */
import test from "node:test";
import assert from "node:assert/strict";
import { validate, checkStructured, STRUCTURED } from "../../assets/js/practice-labs/ai/structured.js";

test("validator", () => {
  const s = { type: "object", required: ["a"], additionalProperties: false, properties: { a: { type: "integer", minimum: 1 }, b: { type: "string", enum: ["x"] } } };
  assert.deepEqual(validate(s, { a: 2 }), []);
  assert.equal(validate(s, {}).length, 1);
  assert.match(validate(s, { a: 1.5 })[0].message, /whole number/);
  assert.match(validate(s, { a: 0 })[0].message, /at least 1/);
  assert.match(validate(s, { a: 1, c: 1 })[0].message, /not allowed/);
  assert.match(validate(s, { a: 1, b: "y" })[0].message, /one of "x"/);
  assert.match(validate({ type: "array", minItems: 2 }, [1])[0].message, /at least 2/);
  assert.match(checkStructured(STRUCTURED[0], "{'a': 1}").syntax, /Not valid JSON/);
});

test("every exercise: model passes, weak answers fail", () => {
  assert.equal(new Set(STRUCTURED.map((e) => e.id)).size, STRUCTURED.length);
  for (const ex of STRUCTURED) {
    assert.equal(checkStructured(ex, ex.model).ok, true, ex.id);
    for (const w of ex.weak) assert.equal(checkStructured(ex, w.text).ok, false, `${ex.id}: ${w.text}`);
  }
});
