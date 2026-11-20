/* JavaScript exercises: every model passes, every buggy version fails a test, starters do not pass; runner reports errors and refuses import. */
import test from "node:test";
import assert from "node:assert/strict";
import { runTests, validateJsExercise } from "../../assets/js/practice-labs/programming/js-eval.js";
import { JS_EXERCISES } from "../../assets/js/practice-labs/programming/js-exercises.js";

test("exercises are pinned", () => {
  assert.equal(new Set(JS_EXERCISES.map((e) => e.id)).size, JS_EXERCISES.length);
  for (const ex of JS_EXERCISES) assert.deepEqual(validateJsExercise(ex), [], ex.id);
});

test("runner reports syntax errors, missing functions, thrown errors, logs and refuses import", () => {
  const ex = JS_EXERCISES[0];
  assert.match(runTests("function greet( {", ex).error, /SyntaxError/);
  assert.match(runTests("function hello() {}", ex).error, /No function named greet/);
  assert.match(runTests("function greet() { throw new Error('x'); }", ex).results[0].got, /Error: x/);
  assert.deepEqual(runTests("function greet(n) { console.log('hi', n); return `Hello, ${n}!`; }", ex).logs, ["hi Asha", "hi Ravi"]);
  assert.match(runTests("import('https://example.com/x.js'); function greet() {}", ex).error, /import is not available/);
});
