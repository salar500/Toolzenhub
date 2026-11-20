/* Shell simulator: commands behave like GNU coreutils for the supported subset; every task's model reaches its goal and a fresh shell does not. */
import test from "node:test";
import assert from "node:assert/strict";
import { createShell, run, fileContent } from "../../assets/js/practice-labs/devops/shell-sim.js";
import { SHELL_TASKS, SERVER } from "../../assets/js/practice-labs/devops/shell-tasks.js";

const fresh = () => createShell(SERVER);

test("navigation, reading, pipes and redirection", () => {
  const sh = fresh();
  assert.equal(run(sh, "pwd"), "/home/asha\n");
  assert.match(run(sh, "cd nowhere"), /No such file or directory/);
  run(sh, "cd shoplite");
  assert.equal(run(sh, "ls"), "README.md\nconfig.json\ndata\ndeploy.sh\nlogs\n");
  assert.equal(run(sh, "head -n 1 data/orders.csv"), "order,city,total\n");
  assert.equal(run(sh, "grep -c Pune data/orders.csv"), "2\n");
  assert.equal(run(sh, "grep -n WARN logs/app.log"), "4:2026-11-08 09:05:12 WARN  slow query 1840 ms\n");
  assert.equal(run(sh, "cut -d , -f 2 data/orders.csv | sort | uniq -c | sort -n | tail -n 1"), "      2 Pune\n");
  assert.equal(run(sh, "wc -l data/orders.csv"), "7 data/orders.csv\n");
  run(sh, "echo one > notes.txt"); run(sh, "echo two >> notes.txt");
  assert.equal(fileContent(sh, "/home/asha/shoplite/notes.txt"), "one\ntwo\n");
  assert.match(run(sh, "rm logs"), /Is a directory/);
  run(sh, "mv notes.txt logs"); assert.equal(fileContent(sh, "/home/asha/shoplite/logs/notes.txt"), "one\ntwo\n");
  run(sh, "rm -r logs"); assert.match(run(sh, "ls logs"), /cannot access/);
  assert.match(run(sh, "rm -r ~"), /refusing/);
  assert.match(run(sh, "sudo reboot"), /command not found in this simulator/);
  run(sh, "chmod 755 deploy.sh");
  assert.match(run(sh, "ls -l deploy.sh"), /^-rwxr-xr-x asha asha/);
  run(sh, "mkdir logs");
  assert.equal(run(sh, "cd logs && pwd"), "/home/asha/shoplite/logs\n");
  assert.match(run(sh, "cd nowhere && pwd"), /^cd: nowhere: No such file or directory\n$/);
});

test("every task: model reaches the goal, a fresh shell does not", () => {
  assert.equal(new Set(SHELL_TASKS.map((t) => t.id)).size, SHELL_TASKS.length);
  for (const t of SHELL_TASKS) {
    assert.equal(t.goal(fresh()), false, `${t.id} start`);
    const sh = fresh();
    for (const line of t.model) run(sh, line);
    assert.equal(t.goal(sh), true, `${t.id} model: ${JSON.stringify(sh.last)}`);
  }
});
