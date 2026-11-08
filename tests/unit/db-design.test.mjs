/* Database Design and Specialised Testing paths: every SQL playground runs on the practice data (SETUP and CLEANING_SETUP, as in the browser) with Python's sqlite3 (the same SQLite family
   as sql.js), and errors exactly when the lesson says it should (skipped if python is not installed). */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { SETUP, CLEANING_SETUP } from "../../assets/js/tools/sql-practice-lab/dataset.js";
import { lessons as design } from "../../assets/js/practice-labs/sql/design-lessons.js";
import { lessons as specialised } from "../../assets/js/practice-labs/manual-testing/specialised-lessons.js";
const lessons = [...design, ...specialised];

const hasPython = spawnSync("python", ["--version"]).status === 0;

test("every SQL playground runs as the lesson claims", { skip: !hasPython && "python not installed" }, () => {
  const plays = lessons.flatMap((l) => l.blocks.filter((b) => b.type === "sqlplay").map((b) => ({ id: l.id, ...b })));
  assert.ok(plays.length >= 8);
  const py = `import json, sqlite3, sys\njobs = json.loads(sys.stdin.read())\nout = []\nfor setup, sql in jobs:\n    db = sqlite3.connect(":memory:")\n    for s in setup: db.executescript(s)\n    try:\n        rows = None\n        for stmt in [s for s in sql.split(";") if s.strip()]:\n            cur = db.execute(stmt)\n            r = cur.fetchall()\n            if cur.description: rows = r\n        out.append({"ok": True, "rows": rows})\n    except Exception as e:\n        out.append({"ok": False, "error": str(e)})\nprint(json.dumps(out))`;
  const r = spawnSync("python", ["-c", py], { input: JSON.stringify(plays.map((p) => [[...SETUP, ...CLEANING_SETUP], p.sql])), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const results = JSON.parse(r.stdout);
  results.forEach((res, i) => {
    const p = plays[i];
    if (p.expect === "error") assert.equal(res.ok, false, `${p.id}: expected an error`);
    else assert.equal(res.ok, true, `${p.id}: ${res.error}`);
  });
  const fk = results[plays.findIndex((p) => p.sql.includes("REFERENCES products"))];
  assert.match(fk.error, /FOREIGN KEY constraint failed/);
  const check = results[plays.findIndex((p) => p.expect === "error" && p.sql.includes("MEGA90"))];
  assert.match(check.error, /CHECK constraint failed/);
  const upsert = results[plays.findIndex((p) => p.sql.includes("ON CONFLICT"))];
  assert.deepEqual(upsert.rows, [[1, 8]]);
  const statuses = results[plays.findIndex((p) => p.sql.includes("NOT IN"))];
  assert.deepEqual(statuses.rows, [], "every order status is in the allowed list");
  const plan = results[plays.findIndex((p) => p.sql.includes("CREATE INDEX"))];
  assert.match(JSON.stringify(plan.rows), /USING INDEX idx_orders_customer/);
});
