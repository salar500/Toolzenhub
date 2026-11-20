/* Regular Expressions path: every model pattern passes its tests and every weak pattern fails one; invalid patterns are reported. */
import test from "node:test";
import assert from "node:assert/strict";
import { REGEX, runRegex, validateRegexExercise } from "../../assets/js/practice-labs/programming/regex.js";

test("regex exercises are pinned", () => {
  assert.equal(new Set(REGEX.map((e) => e.id)).size, REGEX.length);
  for (const ex of REGEX) assert.deepEqual(validateRegexExercise(ex), [], ex.id);
  assert.match(runRegex(REGEX[0], "(", "").error, /Invalid pattern/);
});
