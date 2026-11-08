/* Automation code checks: every model meets its rules; every weak version misses exactly the listed ones. */
import test from "node:test";
import assert from "node:assert/strict";
import { validateCodeExercise } from "../../assets/js/practice-labs/automation/code-check.js";
import { CODE } from "../../assets/js/practice-labs/playwright/code.js";

test("code exercises are pinned by their model and weak versions", () => {
  for (const ex of CODE) assert.deepEqual(validateCodeExercise(ex), [], ex.id);
});
