/**
 * G3C-B4: Git source identity, the dependency-aware dirty-source gate and ledger lineage
 * (scripts/growth-manifest/source-state.mjs). Every scenario runs in an isolated scratch repository; the real website
 * repository is never modified.
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { serializeLedger } from "../../scripts/growth-manifest/ledger.mjs";
import { checkWorkingTree, currentRevision, isGitIgnored, readCommittedLedger, readSourceIdentity, verifyLedgerLineage } from "../../scripts/growth-manifest/source-state.mjs";
import { COMMIT_DATE, COMMIT_ISO, NOW_MS, cloneRepo, commitAll, createBaseRepo, git, removeRepo, syntheticLedger, trySymlink, write } from "../helpers/growth-scratch-repo.mjs";

const DEPS = ["assets/js/data/tools.js", "assets/js/data/articles.js", "assets/js/data/articles/loans/guide.js", "assets/js/util/helper.js", "scripts/growth-manifest/registry.mjs", "scripts/growth-manifest/identity-ledger.json", "src/_data/toolStyles.json", "package.json"];
let base;
const made = [];
const fresh = () => {
  const r = cloneRepo(base);
  made.push(r);
  return r;
};
const codes = (r) => r.errors.map((e) => e.code);
const expectCode = (r, code, id) => {
  assert.equal(r.ok, false, `expected ${code}`);
  assert.ok(r.errors.some((e) => e.code === code && (id === undefined || e.id === id)), `expected ${code}${id ? " for " + id : ""}, got ${JSON.stringify(r.errors)}`);
};

before(() => {
  base = createBaseRepo();
});
after(() => {
  removeRepo(base);
  for (const r of made) removeRepo(r);
});

describe("source identity", () => {
  test("reads the exact HEAD commit and its committer time, not the wall clock", () => {
    const r = readSourceIdentity({ root: base, nowMs: NOW_MS });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.match(r.revision, /^[0-9a-f]{40}$/);
    assert.equal(r.revision, git(base, ["rev-parse", "HEAD"]).trim());
    assert.equal(r.branch, "main");
    assert.equal(r.generatedAt, COMMIT_ISO);
    assert.equal(currentRevision(base), r.revision);
  });

  test("the same content, identities and dates give the same commit id in two repositories", () => {
    const other = createBaseRepo();
    made.push(other);
    assert.equal(readSourceIdentity({ root: other, nowMs: NOW_MS }).revision, readSourceIdentity({ root: base, nowMs: NOW_MS }).revision);
  });

  test("a different commit time gives a different generatedAt", () => {
    const root = fresh();
    write(root, "docs/tool-packs/draft.md", "# changed\n");
    commitAll(root, "later", "2026-10-09T01:02:03Z");
    assert.equal(readSourceIdentity({ root, nowMs: NOW_MS }).generatedAt, "2026-10-09T01:02:03.000Z");
  });

  test("not a repository, or Git metadata missing", () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "tz-nogit-"));
    made.push(empty);
    expectCode(readSourceIdentity({ root: empty, nowMs: NOW_MS }), "GIT_UNAVAILABLE");
    const root = fresh();
    fs.rmSync(path.join(root, ".git"), { recursive: true, force: true });
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "GIT_UNAVAILABLE");
    expectCode(readSourceIdentity({ root: path.join(root, "missing"), nowMs: NOW_MS }), "REPO_MISSING");
  });

  test("a subdirectory is not the repository root", () => {
    expectCode(readSourceIdentity({ root: path.join(base, "assets"), nowMs: NOW_MS }), "REPO_MISMATCH");
  });

  test("the repository must be the ToolZenHub website", () => {
    const root = fresh();
    write(root, "package.json", JSON.stringify({ name: "something-else", type: "module" }));
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "REPO_IDENTITY");
    fs.rmSync(path.join(root, "package.json"));
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "REPO_IDENTITY");
  });

  test("an unexpected or detached branch is refused", () => {
    const root = fresh();
    git(root, ["checkout", "-q", "-b", "feature"]);
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "BRANCH_UNEXPECTED");
    assert.equal(readSourceIdentity({ root, nowMs: NOW_MS, expectedBranch: "feature" }).ok, true);
    git(root, ["checkout", "-q", "--detach"]);
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "BRANCH_UNEXPECTED");
  });

  test("an unborn branch has no revision", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-unborn-"));
    made.push(root);
    git(root, ["init", "-q", "-b", "main"]);
    write(root, "package.json", JSON.stringify({ name: "toolzenhub-regression-safety-net" }));
    expectCode(readSourceIdentity({ root, nowMs: NOW_MS }), "REVISION_INVALID");
  });

  test("a commit time more than 24 hours after the reference is refused; up to 24 hours is accepted", () => {
    const farFuture = fresh();
    write(farFuture, "docs/tool-packs/draft.md", "# later\n");
    commitAll(farFuture, "future", "2030-01-01T00:00:00Z");
    const r = readSourceIdentity({ root: farFuture, nowMs: NOW_MS });
    expectCode(r, "TIME_INVALID");
    assert.match(r.errors[0].message, /24 hours in the future/);
    assert.equal(readSourceIdentity({ root: farFuture, nowMs: Date.parse("2030-01-01T00:00:00Z") }).ok, true);
  });

  test("epoch 0 is accepted exactly, and Git itself cannot record a commit before the epoch", () => {
    const epochZero = fresh();
    write(epochZero, "docs/tool-packs/draft.md", "# epoch\n");
    commitAll(epochZero, "epoch zero", "1970-01-01T00:00:00Z");
    assert.equal(readSourceIdentity({ root: epochZero, nowMs: NOW_MS }).generatedAt, "1970-01-01T00:00:00.000Z");
    // Git rejects every pre-1970 date format, so the producer's refusal of a negative time can never fire on real history
    // (it is covered at the unit level in growth-manifest-source-time.test.mjs).
    const negative = fresh();
    write(negative, "docs/tool-packs/draft.md", "# before the epoch\n");
    assert.throws(() => commitAll(negative, "before epoch", "1969-12-31T23:59:59Z"));
  });
});

describe("the dirty-source gate", () => {
  test("a clean repository passes", () => {
    const r = checkWorkingTree({ root: base, dependencies: DEPS });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.checked, DEPS.length);
  });

  test("a modified, staged, deleted, renamed or replaced dependency is refused", () => {
    const scenarios = {
      "modified (unstaged)": (root) => write(root, "assets/js/data/tools.js", fs.readFileSync(path.join(root, "assets/js/data/tools.js"), "utf8") + "// edit\n"),
      "staged": (root) => { write(root, "assets/js/data/articles.js", fs.readFileSync(path.join(root, "assets/js/data/articles.js"), "utf8") + "// edit\n"); git(root, ["add", "assets/js/data/articles.js"]); },
      "modified after staging": (root) => { write(root, "assets/js/util/helper.js", "export const helper = () => 'a';\n"); git(root, ["add", "-A"]); write(root, "assets/js/util/helper.js", "export const helper = () => 'b';\n"); },
      "deleted": (root) => fs.rmSync(path.join(root, "assets/js/util/helper.js")),
      "deleted from the index": (root) => git(root, ["rm", "-q", "--cached", "assets/js/util/helper.js"]),
      "renamed away": (root) => git(root, ["mv", "assets/js/util/helper.js", "assets/js/util/helper2.js"]),
      "producer module": (root) => write(root, "scripts/growth-manifest/registry.mjs", fs.readFileSync(path.join(root, "scripts/growth-manifest/registry.mjs"), "utf8") + "\n// edit\n"),
      "ledger": (root) => write(root, "scripts/growth-manifest/identity-ledger.json", fs.readFileSync(path.join(root, "scripts/growth-manifest/identity-ledger.json"), "utf8").replace("Synthetic", "Edited")),
      "article implementation": (root) => write(root, "assets/js/data/articles/loans/guide.js", "export default { title: 'tampered' };\n"),
      "tool styles": (root) => write(root, "src/_data/toolStyles.json", "{}\n"),
      "package.json": (root) => write(root, "package.json", fs.readFileSync(path.join(root, "package.json"), "utf8") + " "),
    };
    for (const [name, mutate] of Object.entries(scenarios)) {
      const root = fresh();
      mutate(root);
      const r = checkWorkingTree({ root, dependencies: DEPS });
      assert.equal(r.ok, false, name);
      assert.ok(codes(r).some((c) => ["DIRTY_DEPENDENCY", "DEP_MISSING"].includes(c)), `${name}: ${JSON.stringify(codes(r))}`);
    }
  });

  test("a dependency that is not tracked, or is hidden from Git, is refused", () => {
    const untracked = fresh();
    write(untracked, "assets/js/util/extra.js", "export {};\n");
    expectCode(checkWorkingTree({ root: untracked, dependencies: [...DEPS, "assets/js/util/extra.js"] }), "UNTRACKED_DEPENDENCY", "assets/js/util/extra.js");
    const hidden = fresh();
    git(hidden, ["update-index", "--assume-unchanged", "assets/js/util/helper.js"]);
    write(hidden, "assets/js/util/helper.js", "export const helper = () => 'hidden edit';\n");
    expectCode(checkWorkingTree({ root: hidden, dependencies: DEPS }), "HIDDEN_CHANGE", "assets/js/util/helper.js");
    const skipped = fresh();
    git(skipped, ["update-index", "--skip-worktree", "assets/js/util/helper.js"]);
    expectCode(checkWorkingTree({ root: skipped, dependencies: DEPS }), "HIDDEN_CHANGE", "assets/js/util/helper.js");
  });

  test("an untracked shadow file at a dependency path is refused", () => {
    const root = fresh();
    git(root, ["rm", "-q", "--cached", "assets/js/util/helper.js"]);
    git(root, ["commit", "-q", "-m", "stop tracking helper"]);
    expectCode(checkWorkingTree({ root, dependencies: DEPS }), "UNTRACKED_DEPENDENCY", "assets/js/util/helper.js");
  });

  test("unrelated changes and untracked files do not block the export, including the owner's drafts", () => {
    const root = fresh();
    write(root, "docs/tool-packs/draft.md", "# edited draft\n");
    write(root, "docs/tool-packs/25-cron-expression-explainer.md", "# a new untracked owner draft\n");
    write(root, "tests/unit/anything.test.mjs", "// untracked test\n");
    write(root, "growth-export/leftover.txt", "ignored output\n");
    write(root, "assets/js/tools/stopwatch/index.js", "export const stopwatch = 2; // a tool implementation: its file is guarded only if it is an anchor\n");
    const gate = checkWorkingTree({ root, dependencies: DEPS });
    assert.equal(gate.ok, true, JSON.stringify(gate.errors));
    assert.equal(codes(gate).length, 0);
  });

  test("a dependency reached through a symbolic link is refused", (t) => {
    const root = fresh();
    fs.mkdirSync(path.join(root, "assets", "js", "real"), { recursive: true });
    write(root, "assets/js/real/mod.js", "export {};\n");
    commitAll(root, "add real module");
    if (!trySymlink(path.join(root, "assets", "js", "real"), path.join(root, "assets", "js", "alias"), "junction")) return t.skip("symbolic links are not available here");
    expectCode(checkWorkingTree({ root, dependencies: [...DEPS, "assets/js/alias/mod.js"] }), "UNSAFE_SYMLINK");
  });

  test("a file that is itself a symbolic link is refused", (t) => {
    const root = fresh();
    fs.rmSync(path.join(root, "assets/js/util/helper.js"));
    if (!trySymlink(path.join(root, "package.json"), path.join(root, "assets/js/util/helper.js"), "file")) return t.skip("file symbolic links are not available here");
    expectCode(checkWorkingTree({ root, dependencies: DEPS }), "UNSAFE_SYMLINK", "assets/js/util/helper.js");
  });

  test("a missing dependency and unsafe dependency paths are refused", () => {
    expectCode(checkWorkingTree({ root: base, dependencies: [...DEPS, "assets/js/util/missing.js"] }), "DEP_MISSING");
    for (const bad of ["../escape.js", "/abs.js", "a//b.js", "a\\b.js", "./x.js", ""]) expectCode(checkWorkingTree({ root: base, dependencies: [bad] }), "DEP_UNSAFE");
    expectCode(checkWorkingTree({ root: path.join(base, "nope"), dependencies: DEPS }), "REPO_MISSING");
  });

  test("the gate changes nothing in the repository", () => {
    const before = git(base, ["status", "--porcelain=v1", "-uall"]);
    const index = fs.statSync(path.join(base, ".git", "index")).mtimeMs;
    checkWorkingTree({ root: base, dependencies: DEPS });
    readSourceIdentity({ root: base, nowMs: NOW_MS });
    assert.equal(git(base, ["status", "--porcelain=v1", "-uall"]), before);
    assert.equal(git(base, ["stash", "list"]), "");
    assert.ok(fs.statSync(path.join(base, ".git", "index")).mtimeMs >= index - 1);
  });
});

describe("the committed ledger and its lineage", () => {
  test("the committed ledger at HEAD is read and validated", () => {
    const r = readCommittedLedger({ root: base });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.ledger, syntheticLedger());
    assert.equal(r.text, serializeLedger(syntheticLedger()));
  });

  test("an uncommitted, deleted, or invalid committed ledger is refused", () => {
    const missing = fresh();
    git(missing, ["rm", "-q", "scripts/growth-manifest/identity-ledger.json"]);
    git(missing, ["commit", "-q", "-m", "delete ledger"]);
    expectCode(readCommittedLedger({ root: missing }), "LEDGER_COMMITTED_MISSING");
    const bad = fresh();
    write(bad, "scripts/growth-manifest/identity-ledger.json", "{ not json");
    commitAll(bad, "corrupt ledger");
    assert.equal(readCommittedLedger({ root: bad }).ok, false);
  });

  test("a legitimate history passes", () => {
    const root = fresh();
    const next = syntheticLedger();
    next.articles.push({ id: 4, key: "loans/fourth", keyChanges: [], provenance: "allocated", state: "active" });
    next.nextArticleId = 5;
    write(root, "scripts/growth-manifest/identity-ledger.json", serializeLedger(next));
    commitAll(root, "allocate article 4");
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.versions, 2);
  });

  test("a past commit that dropped or rewrote an identity is found even though the final ledger is internally valid", () => {
    const dropped = fresh();
    const ledger = syntheticLedger();
    ledger.tools = ledger.tools.slice(1);
    write(dropped, "scripts/growth-manifest/identity-ledger.json", serializeLedger(ledger));
    commitAll(dropped, "silently drop alpha");
    assert.equal(readCommittedLedger({ root: dropped }).ok, true, "premise: valid on its own");
    expectCode(verifyLedgerLineage({ root: dropped }), "RECORD_DROPPED", `${git(dropped, ["rev-parse", "--short=7", "HEAD"]).trim()}:tool:alpha`);

    const renamed = fresh();
    const l2 = syntheticLedger();
    l2.articles[0].key = "loans/swapped";
    write(renamed, "scripts/growth-manifest/identity-ledger.json", serializeLedger(l2));
    commitAll(renamed, "swap key without recording it");
    expectCode(verifyLedgerLineage({ root: renamed }), "KEY_CHANGED");

    const reused = fresh();
    const l3 = syntheticLedger();
    l3.articles[0].state = "retired";
    l3.articles[0].retired = { reason: "withdrawn" };
    write(reused, "scripts/growth-manifest/identity-ledger.json", serializeLedger(l3));
    commitAll(reused, "retire article 1");
    write(reused, "scripts/growth-manifest/identity-ledger.json", serializeLedger(syntheticLedger()));
    commitAll(reused, "revive article 1");
    expectCode(verifyLedgerLineage({ root: reused }), "RETIRED_REVIVED");
  });

  test("a deleted or never-committed ledger has no lineage", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-lineage-"));
    made.push(root);
    git(root, ["init", "-q", "-b", "main"]);
    write(root, "x.txt", "x");
    commitAll(root, "no ledger");
    expectCode(verifyLedgerLineage({ root }), "LEDGER_LINEAGE_MISSING");
    const deleted = fresh();
    git(deleted, ["rm", "-q", "scripts/growth-manifest/identity-ledger.json"]);
    git(deleted, ["commit", "-q", "-m", "delete"]);
    expectCode(verifyLedgerLineage({ root: deleted }), "LEDGER_LINEAGE_BROKEN");
  });
});

describe("output ignore check", () => {
  test("reports whether Git ignores a path", () => {
    assert.equal(isGitIgnored({ root: base, relativePath: "growth-export/toolzenhub-manifest.json" }), true);
    assert.equal(isGitIgnored({ root: base, relativePath: "docs/readme.md" }), false);
  });
});

describe("environment hygiene", () => {
  test("a stray GIT_DIR cannot redirect the gate to another repository", () => {
    const decoy = createBaseRepo();
    made.push(decoy);
    write(decoy, "docs/tool-packs/draft.md", "# a different decoy commit\n");
    commitAll(decoy, "decoy", "2026-10-09T00:00:00Z");
    assert.notEqual(git(decoy, ["rev-parse", "HEAD"]).trim(), git(base, ["rev-parse", "HEAD"]).trim(), "premise: the decoy is a different commit");
    const expected = git(base, ["rev-parse", "HEAD"]).trim(); // computed before the environment is poisoned
    const saved = process.env.GIT_DIR;
    process.env.GIT_DIR = path.join(decoy, ".git");
    try {
      const r = readSourceIdentity({ root: base, nowMs: NOW_MS });
      assert.equal(r.ok, true, JSON.stringify(r.errors));
      assert.equal(r.revision, expected);
    } finally {
      if (saved === undefined) delete process.env.GIT_DIR;
      else process.env.GIT_DIR = saved;
    }
    assert.equal(COMMIT_DATE.length > 0, true);
  });
});
