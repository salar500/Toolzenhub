/* Suggested fixes of the JSON Formatter engine: a proposal is only ever punctuation or quotes round a bare name, and
   applying it must give text that the platform's own JSON.parse accepts (the independent oracle here). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, applyFix } from "../../assets/js/tools/json-formatter/json-engine.js";

const parses = (text) => { try { JSON.parse(text); return true; } catch { return false; } };

const CASES = [
  ['{"a":1,}', '{"a":1}'],
  ['[1,2,]', '[1,2]'],
  ['{"a":{"b":1,},"c":2}', '{"a":{"b":1},"c":2}'],
  ['[1 2]', '[1, 2]'],
  ['[1,\n2\n3]', '[1,\n2,\n3]'],
  ['{"a" 1}', '{"a": 1}'],
  ['{a:1}', '{"a":1}'],
  ['{"a":1', '{"a":1}'],
  ['{"a":[1,{"b":2', '{"a":[1,{"b":2}]}'],
  ['[1,2\n', '[1,2\n]'],
];

for (const [bad, expected] of CASES) {
  test(`proposes a fix for ${JSON.stringify(bad)} that parses`, () => {
    assert.equal(parses(bad), false, "the input must really be invalid");
    const result = analyze(bad, "check");
    assert.equal(result.state, "invalid");
    assert.ok(result.error.fix, "a fix is proposed");
    const fixed = applyFix(bad, result.error.fix);
    assert.equal(fixed, expected);
    assert.equal(parses(fixed), true);
  });
}

test("no fix where the intent is unknown (the engine never guesses a value or a name)", () => {
  for (const bad of ['{"a":"x\ny"}', '{"a":tru}', "{'a':1}", '{"a":01}', '{"a":1}}', '}']) {
    const result = analyze(bad, "check");
    assert.equal(result.state, "invalid");
    assert.equal(result.error.fix, null, bad);
  }
});

test("valid JSON carries no fix and applying never mutates the original string", () => {
  const original = '{"a":1,}';
  const fix = analyze(original, "check").error.fix;
  applyFix(original, fix);
  assert.equal(original, '{"a":1,}');
  assert.equal(analyze('{"a":1}', "check").state, "valid");
});
