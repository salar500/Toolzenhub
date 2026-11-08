/* Git simulator: core behaviour matches Git for the supported commands; every task's model reaches its goal and its start does not. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRepo, run, status, headCommit } from "../../assets/js/practice-labs/devops/git-sim.js";
import { GIT_TASKS } from "../../assets/js/practice-labs/devops/git-tasks.js";

const base = () => createRepo({ commits: [{ msg: "init", tree: { "a.txt": "1" } }], work: { "a.txt": "2", "b.txt": "new" } });

test("status, add, commit, restore", () => {
  const r = base();
  assert.deepEqual(status(r), { staged: [], unstaged: [{ file: "a.txt", kind: "modified" }], untracked: ["b.txt"] });
  assert.match(run(r, "git commit -m x"), /nothing to commit/);
  run(r, "git add b.txt");
  assert.deepEqual(status(r).staged, [{ file: "b.txt", kind: "new file" }]);
  assert.match(run(r, 'git commit -m "Add b"'), /\[main [0-9a-f]{7}\] Add b\n 1 file changed/);
  run(r, "git restore a.txt");
  assert.match(run(r, "git status"), /working tree clean/);
  assert.match(run(r, "git add nope.txt"), /did not match/);
  assert.match(run(r, "ls"), /only runs git commands/);
  assert.match(run(r, "git rebase main"), /not supported/);
});

test("branches, switching rules, fast-forward and three-way merges, conflicts", () => {
  const r = base();
  assert.match(run(r, "git switch -c topic"), /new branch 'topic'/);
  assert.match(run(r, "git switch main"), /would be overwritten/);
  run(r, "git add ."); run(r, 'git commit -m "topic work"');
  run(r, "git switch main");
  assert.equal(r.work["a.txt"], "1");
  assert.match(run(r, "git merge topic"), /Fast-forward/);
  assert.equal(headCommit(r).msg, "topic work");
  // three-way merge: both sides change different files
  const m = createRepo({ commits: [{ msg: "init", tree: { "a": "1", "b": "1" } }], branches: { side: { commits: [{ msg: "side b", tree: { "b": "2" } }] } } });
  m.work.a = "2"; run(m, "git add a"); run(m, 'git commit -m "main a"');
  assert.match(run(m, "git merge side"), /ort/);
  assert.deepEqual(headCommit(m).tree, { a: "2", b: "2" });
  assert.equal(headCommit(m).parents.length, 2);
  // conflict: both change the same file
  const c = createRepo({ commits: [{ msg: "init", tree: { "p": "1" } }], branches: { side: { commits: [{ msg: "side p", tree: { "p": "3" } }] } } });
  c.work.p = "2"; run(c, "git add p"); run(c, 'git commit -m "main p"');
  const before = c.branches.main;
  assert.match(run(c, "git merge side"), /CONFLICT \(content\): Merge conflict in p/);
  assert.equal(c.branches.main, before);
});

test("every task: the model reaches the goal and the start does not", () => {
  assert.equal(new Set(GIT_TASKS.map((t) => t.id)).size, GIT_TASKS.length);
  for (const t of GIT_TASKS) {
    assert.equal(t.goal(createRepo(t.scenario)), false, `${t.id} start`);
    const r = createRepo(t.scenario);
    for (const line of t.model) run(r, line);
    assert.equal(t.goal(r), true, `${t.id} model`);
  }
});
