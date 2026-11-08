/*
 * JOIN visualizer model: each join type gives the rows a hand-worked join gives, and an independent SQLite build agrees
 * (the expected rows below were worked out by hand from the preset and confirmed with Python's sqlite3, SQLite 3.40.1).
 */
import test from "node:test";
import assert from "node:assert/strict";

import { PRESET, joinSteps, sqlFor, setupFor, sameRows } from "../../assets/js/practice-labs/join-model.js";

const EXPECTED = {
  INNER: [["Asha", 101], ["Asha", 102], ["Chitra", 103]],
  LEFT: [["Asha", 101], ["Asha", 102], ["Bilal", null], ["Chitra", 103], ["Divya", null]],
  RIGHT: [["Asha", 101], ["Asha", 102], ["Chitra", 103], [null, 104]],
  FULL: [["Asha", 101], ["Asha", 102], ["Bilal", null], ["Chitra", 103], ["Divya", null], [null, 104]]
};

for (const [type, rows] of Object.entries(EXPECTED)) {
  test(`${type} JOIN rows`, () => {
    assert.ok(sameRows(joinSteps(type).rows, rows), JSON.stringify(joinSteps(type).rows));
  });
}

test("steps: one per driving row, plus a final step for FULL; every result row comes from a step", () => {
  assert.equal(joinSteps("INNER").steps.length, PRESET.left.rows.length);
  assert.equal(joinSteps("RIGHT").steps.length, PRESET.right.rows.length);
  assert.equal(joinSteps("FULL").steps.length, PRESET.left.rows.length + 1);
  for (const type of ["INNER", "LEFT", "RIGHT", "FULL"]) {
    const { steps, rows } = joinSteps(type);
    assert.equal(steps.flatMap((s) => s.added).length, rows.length, type);
  }
});

test("SQL and setup text", () => {
  assert.match(sqlFor("FULL"), /FULL OUTER JOIN orders o ON o\.customer_id = c\.id/);
  assert.equal(setupFor().length, 4);
  assert.match(setupFor()[1], /INSERT INTO customers VALUES \(1, 'Asha', 'Pune'\)/);
});
