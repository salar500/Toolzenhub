/* AI teaching models: hand-worked expectations for the tokenizer, budget, sampling, retrieval and metrics. */
import test from "node:test";
import assert from "node:assert/strict";
import { tokenize, contextBudget, sampling, retrieve, QUERIES, confusion } from "../../assets/js/practice-labs/ai/models.js";

test("tokenizer", () => {
  assert.deepEqual(tokenize("Hello world!"), ["Hell", "o", " worl", "d", "!"]);
  assert.deepEqual(tokenize("Pay ₹49"), ["Pay", " ₹", "4", "9"]);
  assert.equal(tokenize("").length, 0);
});

test("context budget", () => {
  assert.deepEqual(contextBudget({ window: 8000, system: 500, document: 6000, question: 200, output: 1000 }), { used: 7700, free: 300, fits: true, overflow: 0, documentAllowed: 6300 });
  assert.equal(contextBudget({ window: 4000, system: 500, document: 6000, question: 200, output: 1000 }).overflow, 3700);
});

test("sampling: probabilities sum to 1, low temperature sharpens, top-p cuts the tail", () => {
  const sharp = sampling({ temperature: 0.2, topP: 1 });
  const flat = sampling({ temperature: 2, topP: 1 });
  assert.ok(Math.abs(sharp.reduce((s, x) => s + x.p, 0) - 1) < 1e-9);
  assert.equal(sharp[0].token, "Paris");
  assert.ok(sharp[0].p > 0.99 && flat[0].p < sharp[0].p);
  const cut = sampling({ temperature: 1, topP: 0.9 });
  assert.equal(cut.filter((x) => x.kept).length < cut.length, true);
  assert.ok(Math.abs(cut.reduce((s, x) => s + x.pAfter, 0) - 1) < 1e-9);
});

test("retrieval ranks the matching documents first", () => {
  assert.deepEqual(retrieve(QUERIES[0].v, 2).map((d) => d.id), ["d2", "d1"]);
  assert.deepEqual(retrieve(QUERIES[1].v, 2).map((d) => d.id).sort(), ["d3", "d4"]);
  assert.equal(retrieve(QUERIES[2].v, 1)[0].id, "d5");
});

test("confusion matrix at threshold 0.5 (hand-counted)", () => {
  const m = confusion(0.5);
  assert.deepEqual([m.tp, m.fp, m.tn, m.fn], [8, 4, 6, 2]);
  assert.ok(Math.abs(m.precision - 8 / 12) < 1e-9 && Math.abs(m.recall - 0.8) < 1e-9 && m.accuracy === 0.7);
});
