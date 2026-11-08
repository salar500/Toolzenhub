/* Output-prediction exercises: every stated output is what the real runtime prints (javac/java 17 and CPython; each
   language is skipped if its runtime is not installed), and the checker ignores only trailing whitespace. */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PREDICT, checkPrediction } from "../../assets/js/practice-labs/programming/predict.js";

const has = (cmd, arg) => spawnSync(cmd, [arg]).status === 0;
const hasJava = has("java", "-version"), hasPython = has("python", "--version");

test("ids are unique and the checker is exact apart from trailing whitespace", () => {
  assert.equal(new Set(PREDICT.map((p) => p.id)).size, PREDICT.length);
  const ex = PREDICT[0];
  assert.equal(checkPrediction(ex, `${ex.output}  \n\n`), true);
  assert.equal(checkPrediction(ex, ex.output.replace("3.5", "3")), false);
});

test("java outputs match the real JVM", { skip: !hasJava && "java not installed" }, () => {
  for (const ex of PREDICT.filter((p) => p.lang === "java")) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tz-java-"));
    fs.writeFileSync(path.join(dir, "Main.java"), ex.code);
    const r = spawnSync("java", ["Main.java"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, `${ex.id}: ${r.stderr}`);
    assert.equal(r.stdout.replace(/\r\n/g, "\n").replace(/\n$/, ""), ex.output, ex.id);
  }
});

const TSC = ["npx", "--no-install", "tsc"];
const tsc = spawnSync(TSC.join(" "), ["-v"], { shell: true }).status === 0;

test("typescript answers match the real compiler (tsc --strict) and Node.js", { skip: !tsc && "tsc not installed" }, () => {
  for (const ex of PREDICT.filter((p) => p.lang === "typescript")) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tz-ts-"));
    fs.writeFileSync(path.join(dir, "main.ts"), ex.code);
    const r = spawnSync(TSC.join(" "), ["--strict", "--target", "es2022", "--module", "commonjs", "--pretty", "false", "main.ts"], { cwd: dir, encoding: "utf8", shell: true });
    if (ex.check === "compile") {
      const first = /main\.ts\((\d+),\d+\): error/.exec(r.stdout);
      assert.equal(first ? `line ${first[1]}` : "compiles", ex.output, `${ex.id}: ${r.stdout}`);
    } else {
      assert.equal(r.status, 0, `${ex.id}: ${r.stdout}`);
      const run = spawnSync("node", ["main.js"], { cwd: dir, encoding: "utf8" });
      assert.equal(run.stdout.replace(/\r\n/g, "\n").replace(/\n$/, ""), ex.output, ex.id);
    }
  }
});

test("python outputs match CPython", { skip: !hasPython && "python not installed" }, () => {
  for (const ex of PREDICT.filter((p) => p.lang === "python")) {
    const r = spawnSync("python", ["-c", ex.code], { encoding: "utf8" });
    assert.equal(r.status, 0, `${ex.id}: ${r.stderr}`);
    assert.equal(r.stdout.replace(/\r\n/g, "\n").replace(/\n$/, ""), ex.output, ex.id);
  }
});
