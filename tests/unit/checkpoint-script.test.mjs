/**
 * scripts/dev/checkpoint.mjs: the read-only repository checkpoint.
 *
 * Throwaway repositories are made in the operating system's temp folder; nothing in this repository is touched.
 * What is pinned: the report for a clean tree, a dirty tree and paths with spaces, a missing upstream, a detached
 * HEAD, a repository with no commit, ahead/behind from local refs only, the expectation flags and their exit
 * codes, and that running it changes nothing (the index file and the tree are byte-for-byte the same afterwards).
 */
import { describe, test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "dev", "checkpoint.mjs");
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "checkpoint-test-"));

const git = (cwd, ...a) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...a], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const run = (cwd, ...a) => spawnSync(process.execPath, [SCRIPT, ...a], { cwd, encoding: "utf8" });
const make = (name) => {
  const dir = path.join(ROOT, name);
  fs.mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q", "-b", "main");
  return dir;
};
const commit = (dir, file, text, message) => {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
  git(dir, "add", "--", file);
  git(dir, "commit", "-q", "-m", message);
};

after(() => fs.rmSync(ROOT, { recursive: true, force: true }));

describe("checkpoint script", () => {
  test("a clean tree with no upstream: branch, head, 'no upstream configured', clean, exit 0", () => {
    const dir = make("clean");
    commit(dir, "a.txt", "a\n", "first commit");
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /branch\s+main/);
    assert.match(r.stdout, /head\s+[0-9a-f]{7} first commit/);
    assert.match(r.stdout, /upstream\s+no upstream configured/);
    assert.match(r.stdout, /tree\s+clean/);
    assert.match(r.stdout, /does not verify application correctness/);
  });

  test("a dirty tree lists names, counts the kinds, and copes with spaces and renames", () => {
    const dir = make("dirty");
    commit(dir, "keep.txt", "k\n", "c1");
    commit(dir, "old name.txt", "o\n", "c2");
    fs.writeFileSync(path.join(dir, "keep.txt"), "changed\n");
    fs.mkdirSync(path.join(dir, "a dir with spaces"));
    fs.writeFileSync(path.join(dir, "a dir with spaces", "new file.txt"), "n\n");
    git(dir, "mv", "old name.txt", "renamed file.txt");
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /tree\s+dirty: 3 changed/);
    assert.match(r.stdout, / M keep\.txt/);
    assert.match(r.stdout, /\?\? a dir with spaces\/new file\.txt/);
    assert.match(r.stdout, /R\s+renamed file\.txt/);
    assert.ok(!r.stdout.includes("old name.txt"), "the original path of a rename is not listed as a separate change");
  });

  test("ahead and behind come from local refs only, and nothing is fetched", () => {
    const origin = path.join(ROOT, "origin.git");
    execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
    const dir = make("tracking");
    commit(dir, "a.txt", "a\n", "c1");
    git(dir, "remote", "add", "origin", origin);
    git(dir, "push", "-q", "-u", "origin", "main");
    commit(dir, "b.txt", "b\n", "c2");
    commit(dir, "c.txt", "c\n", "c3");
    let r = run(dir);
    assert.match(r.stdout, /upstream\s+origin\/main\s+ahead 2\s+behind 0/);
    /* the remote moves on, but the script does not fetch, so it still reports the old local view */
    const other = path.join(ROOT, "other");
    execFileSync("git", ["clone", "-q", origin, other]);
    commit(other, "x.txt", "x\n", "remote commit");
    git(other, "push", "-q", "origin", "main");
    r = run(dir);
    assert.match(r.stdout, /ahead 2\s+behind 0/);
    git(dir, "fetch", "-q");
    r = run(dir);
    assert.match(r.stdout, /ahead 2\s+behind 1/);
  });

  test("a detached HEAD and a repository with no commit are reported, not crashed on", () => {
    const dir = make("detached");
    commit(dir, "a.txt", "a\n", "c1");
    commit(dir, "b.txt", "b\n", "c2");
    git(dir, "checkout", "-q", "--detach", "HEAD~1");
    let r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /branch\s+\(detached HEAD\)/);
    assert.match(r.stdout, /upstream\s+none \(detached HEAD\)/);
    const empty = make("empty");
    r = run(empty);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /head\s+\(no commits yet\)/);
  });

  test("outside a repository it says so and exits 1", () => {
    const plain = path.join(ROOT, "not-a-repo");
    fs.mkdirSync(plain);
    const r = run(plain);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Not inside a Git work tree/);
  });

  test("expectations: branch, head and the allowed-files list pass or fail with exit codes and plain messages", () => {
    const dir = make("expect");
    commit(dir, "a.txt", "a\n", "c1");
    const sha = git(dir, "rev-parse", "HEAD").trim();
    fs.mkdirSync(path.join(dir, "docs"));
    fs.writeFileSync(path.join(dir, "docs", "my note.md"), "n\n");
    fs.writeFileSync(path.join(dir, "stray.txt"), "s\n");
    assert.equal(run(dir, "--expect-branch", "main", "--expect-head", sha.slice(0, 7)).status, 0);
    let r = run(dir, "--expect-branch", "develop");
    assert.equal(r.status, 1);
    assert.match(r.stdout, /EXPECTATION FAILED: expected branch develop, found main/);
    r = run(dir, "--expect-head", "deadbeef");
    assert.equal(r.status, 1);
    assert.match(r.stdout, /expected HEAD deadbeef/);
    r = run(dir, "--only", "docs");
    assert.equal(r.status, 1);
    assert.match(r.stdout, /outside the expected list: stray\.txt/);
    assert.equal(run(dir, "--only", "docs", "--only", "stray.txt").status, 0);
    assert.equal(run(dir, "--only", "docs/my note.md", "--only", "stray.txt").status, 0, "a path with a space is matched exactly");
    assert.equal(run(dir, "--expect-head", "abc").status, 1, "a head prefix shorter than 7 characters is refused");
    assert.equal(run(dir, "--bogus").status, 2);
    assert.equal(run(dir, "--expect-head").status, 2);
  });

  test("running it changes nothing: same index bytes, same status, no new files", () => {
    const dir = make("readonly");
    commit(dir, "a.txt", "a\n", "c1");
    fs.writeFileSync(path.join(dir, "a.txt"), "edited\n");
    fs.writeFileSync(path.join(dir, "u.txt"), "u\n");
    const indexFile = path.join(dir, ".git", "index");
    /* no git command of this test runs between the snapshot and the comparison: even `git status` can refresh the index */
    const before = { index: fs.readFileSync(indexFile), mtime: fs.statSync(indexFile).mtimeMs, files: fs.readdirSync(dir).sort(), gitFiles: fs.readdirSync(path.join(dir, ".git")).sort() };
    for (let i = 0; i < 3; i += 1) run(dir, "--all");
    assert.ok(before.index.equals(fs.readFileSync(indexFile)));
    assert.equal(fs.statSync(indexFile).mtimeMs, before.mtime);
    assert.deepEqual(fs.readdirSync(dir).sort(), before.files);
    assert.deepEqual(fs.readdirSync(path.join(dir, ".git")).sort(), before.gitFiles);
  });

  test("the source: only read-only git commands, no network, no writes, no shell", () => {
    const src = fs.readFileSync(SCRIPT, "utf8");
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
    for (const banned of ["writeFile", "appendFile", "unlink", "rmSync", "mkdir", "copyFile", "rename", "http", "net.", "shell: true", "exec(", "execSync", "spawn("]) {
      assert.ok(!code.includes(banned), `the script must not contain ${banned}`);
    }
    const used = [...code.matchAll(/git\(\s*"([a-z-]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(used)].sort(), ["log", "rev-list", "rev-parse", "status", "symbolic-ref"]);
    assert.ok(code.includes('GIT_OPTIONAL_LOCKS: "0"'));
  });
});
