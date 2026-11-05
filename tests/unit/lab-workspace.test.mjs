/**
 * The workspace list of the shared lab shell: how a long exercise set is grouped and searched. Uses the real SQL, Excel and Power BI sets
 * (fixed data), so the groups and the search are checked against what a learner will see.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };
const { groupExercises, matchExercises, WORKSPACE_MIN } = await import("../../assets/js/learning/lab-shell.js");
const sql = (await import("../../assets/js/tools/sql-practice-lab/exercises.js")).set.exercises;
const xl = (await import("../../assets/js/tools/excel-practice-lab/exercises.js")).set.exercises;
const pbi = (await import("../../assets/js/tools/power-bi-practice-lab/exercises.js")).set.exercises;

test("the three big labs get the workspace list", () => {
  for (const set of [sql, xl, pbi]) assert.ok(set.length >= WORKSPACE_MIN);
});

test("groups cover every exercise exactly once, in order of first appearance", () => {
  for (const set of [sql, xl, pbi]) {
    const groups = groupExercises(set);
    const all = groups.flatMap((g) => g.indexes).sort((a, b) => a - b);
    assert.deepEqual(all, set.map((_, i) => i));
    for (const g of groups) assert.deepEqual(g.indexes, [...g.indexes].sort((a, b) => a - b));
  }
  assert.deepEqual(groupExercises(sql).map((g) => g.label).slice(0, 3), ["Select", "Where", "Sorting"]);
  assert.equal(groupExercises(sql).find((g) => g.key === "data cleaning").indexes.length, 8);
  assert.equal(groupExercises(pbi)[0].label, "Power query");
});

test("without topics the groups are the difficulty levels", () => {
  const groups = groupExercises([{ difficulty: "advanced" }, { difficulty: "beginner" }, { difficulty: "advanced" }]);
  assert.deepEqual(groups.map((g) => [g.label, g.indexes]), [["Advanced", [0, 2]], ["Beginner", [1]]]);
});

test("search: empty matches all; a number matches that exercise; words match title or topic; no match is empty", () => {
  assert.equal(matchExercises(sql, "").length, 49);
  assert.equal(matchExercises(sql, "   ").length, 49);
  assert.deepEqual(matchExercises(sql, "1"), [0]);
  assert.deepEqual(matchExercises(sql, "49"), [48]);
  assert.equal(matchExercises(sql, "JOINS").length >= 5, true);
  assert.deepEqual(matchExercises(sql, "data cleaning").length, 8);
  assert.deepEqual(matchExercises(sql, "zzzz-nothing"), []);
  assert.deepEqual(matchExercises(sql, "every column of a table"), [0]);
});
