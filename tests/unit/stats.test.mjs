/* Statistics path: functions match hand-worked values and Excel's definitions; every exercise is answerable and checked with tolerance. */
import test from "node:test";
import assert from "node:assert/strict";
import { mean, median, mode, stdev, percentile, correlation, NUMERIC, answerOf, checkNumeric, formatAnswer } from "../../assets/js/practice-labs/data/stats.js";

test("statistics functions", () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5);
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(mode([3, 1, 3, 2, 1, 3]), 3);
  assert.ok(Math.abs(stdev([2, 4, 4, 4, 5, 5, 7, 9]) - 2.138089935) < 1e-8); // STDEV.S
  assert.equal(percentile([1, 2, 3, 4, 5], 0.9), 4.6); // PERCENTILE.INC
  assert.ok(Math.abs(correlation([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
});

test("numeric exercises: unique ids, finite answers, rounded answer accepted, off answers and text refused", () => {
  assert.equal(new Set(NUMERIC.map((e) => e.id)).size, NUMERIC.length);
  for (const e of NUMERIC) {
    assert.ok(Number.isFinite(answerOf(e)), e.id);
    assert.equal(checkNumeric(e, formatAnswer(e)).ok, true, e.id);
    assert.equal(checkNumeric(e, String(answerOf(e) + 1)).ok, false, e.id);
    assert.equal(checkNumeric(e, "abc").ok, false, e.id);
  }
  assert.equal(checkNumeric(NUMERIC[0], "₹1,859.42").ok, true);
});
