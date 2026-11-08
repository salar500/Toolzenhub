/*
 * Structured writing labs: every exercise's model answer meets its whole rubric, and every weak answer misses exactly the
 * rubric items it is meant to miss, so the checker's verdicts are pinned down by examples.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { checkWriting, validateWritingExercise, VAGUE } from "../../assets/js/practice-labs/writing-check.js";
import { WRITING as MT } from "../../assets/js/practice-labs/manual-testing/writing.js";
import { AI_WRITING } from "../../assets/js/practice-labs/ai/writing.js";
import { WRITING_2 } from "../../assets/js/practice-labs/manual-testing/writing-2.js";
const WRITING = [...MT, ...AI_WRITING, ...WRITING_2];

test("every writing exercise is well formed, its model passes and its weak answers miss the expected items", () => {
  for (const exercise of WRITING) assert.deepEqual(validateWritingExercise(exercise), [], exercise.id);
});

test("unique ids, at least one weak answer each", () => {
  assert.equal(new Set(WRITING.map((w) => w.id)).size, WRITING.length);
  for (const w of WRITING) assert.ok(w.weak?.length >= 1, w.id);
});

test("rule mechanics", () => {
  const ex = { rules: [
    { id: "a", type: "oneAction", field: "s", label: "x", advice: "y" },
    { id: "b", type: "noVague", fields: ["e"], label: "x", advice: "y" },
    { id: "c", type: "concrete", field: "d", label: "x", advice: "y" }
  ] };
  const r = (answer) => checkWriting(ex, answer).items.map((i) => i.met);
  assert.deepEqual(r({ s: "Open the cart\nPress Apply", e: "The message X appears", d: "SAVE10 on ₹499" }), [true, true, true]);
  assert.deepEqual(r({ s: "Open the cart and then press Apply", e: "It works fine", d: "a product" }), [false, false, false]);
  assert.ok(VAGUE.includes("properly"));
});
