/* Python exercises: the shared harness run with the local CPython (skipped if python is not installed): every model
   passes, every buggy version fails a test, every starter fails, and errors and print output are reported. */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { HARNESS } from "../../assets/js/practice-labs/programming/py-harness.js";
import { PY_EXERCISES } from "../../assets/js/practice-labs/programming/py-exercises.js";

const hasPython = spawnSync("python", ["--version"]).status === 0;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tz-py-"));

function runAll(jobs) {
  const script = `${HARNESS}\nimport json, sys\njobs = json.loads(sys.stdin.read())\nprint(json.dumps([json.loads(__tz_run(c, f, json.dumps(t))) for c, f, t in jobs]))\n`;
  fs.writeFileSync(path.join(dir, "run.py"), script);
  const r = spawnSync("python", ["run.py"], { cwd: dir, input: JSON.stringify(jobs), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

test("python exercises are pinned", { skip: !hasPython && "python not installed" }, () => {
  assert.equal(new Set(PY_EXERCISES.map((e) => e.id)).size, PY_EXERCISES.length);
  const jobs = [], expect = [];
  for (const ex of PY_EXERCISES) {
    jobs.push([ex.model, ex.fn, ex.tests]); expect.push([ex.id, "model"]);
    jobs.push([ex.starter, ex.fn, ex.tests]); expect.push([ex.id, "starter"]);
    for (const b of ex.buggy) { jobs.push([b, ex.fn, ex.tests]); expect.push([ex.id, "buggy"]); }
  }
  const out = runAll(jobs);
  out.forEach((r, i) => {
    const [id, kind] = expect[i];
    const all = !r.error && r.passed === r.total;
    if (kind === "model") assert.ok(all, `${id} model: ${JSON.stringify(r)}`);
    else assert.ok(!all, `${id} ${kind} passes`);
  });
});

test("harness reports syntax errors, missing functions and print output", { skip: !hasPython && "python not installed" }, () => {
  const t = [{ args: [1], expect: 1 }];
  const [syntax, missing, logs] = runAll([["def f(:", "f", t], ["x = 1", "f", t], ["def f(x):\n    print('hi', x)\n    return x", "f", t]]);
  assert.match(syntax.error, /SyntaxError/);
  assert.match(missing.error, /No function named f/);
  assert.equal(logs.logs, "hi 1\n");
  assert.equal(logs.passed, 1);
});
