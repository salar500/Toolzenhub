/**
 * Growth manifest source state: binds an export to one Git commit and refuses to export from anything that is not that
 * commit. Read-only: it runs only Git commands that read (rev-parse, symbolic-ref, log, show, ls-files, status,
 * check-ignore) and never changes the repository, its index or its configuration.
 *
 *  - IDENTITY: the repository is the one at `root`, on the expected branch, HEAD resolves to a full commit id, and the
 *    commit's committer time (not the wall clock) becomes generatedAt through source-time.mjs.
 *  - DIRTY-SOURCE GATE: every file that can influence the manifest (traced by deps.mjs, plus the explicit data reads) must be
 *    tracked, unmodified, unstaged and un-hidden, and must not be reached through a symbolic link. Unrelated changes, such as
 *    a draft document, do not block an export.
 *  - LEDGER LINEAGE: the identity ledger at HEAD must be a legitimate evolution of every earlier committed version.
 *
 * Git is told to ignore GIT_* environment overrides so a stray GIT_DIR or GIT_WORK_TREE cannot point it elsewhere.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { LEDGER_FILE, compareLedgers, parseLedgerText } from "./ledger.mjs";
import { parseCommitterTime } from "./source-time.mjs";

const REVISION = /^[0-9a-f]{40}$/;

function gitEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) if (!key.toUpperCase().startsWith("GIT_")) env[key] = value;
  env.GIT_OPTIONAL_LOCKS = "0";
  env.LC_ALL = "C";
  return env;
}

/**
 * Settings that could make Git hide a change are forced to their strict values for every command, whatever the repository or
 * user configuration says. (core.autocrlf and attributes are deliberately NOT forced: they define what "unchanged" means.)
 */
const STRICT_CONFIG = ["-c", "core.quotepath=off", "-c", "core.fsmonitor=false", "-c", "core.ignoreStat=false", "-c", "core.untrackedCache=false", "-c", "status.showUntrackedFiles=all", "-c", "core.sparseCheckout=false"];

/** Runs a read-only Git command in `root` (optionally feeding `input` on stdin). Returns { ok, out, code }. */
export function git(root, args, { input } = {}) {
  try {
    const out = execFileSync("git", [...STRICT_CONFIG, ...args], { cwd: root, encoding: "utf8", env: gitEnv(), input, maxBuffer: 256 * 1024 * 1024, stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"], windowsHide: true });
    return { ok: true, out, code: 0 };
  } catch (cause) {
    return { ok: false, out: "", code: typeof cause.status === "number" ? cause.status : -1 };
  }
}

const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const fail = (code, id, message) => ({ ok: false, errors: [{ code, id, message }] });

/** The exact commit being exported and its committer time. `nowMs` is only the reference for the future-time check. */
export function readSourceIdentity({ root, nowMs, expectedBranch = "main", expectedPackageName = "toolzenhub-regression-safety-net" }) {
  let realRoot;
  try {
    realRoot = fs.realpathSync(root);
  } catch {
    return fail("REPO_MISSING", "root", "the repository directory does not exist");
  }
  const top = git(realRoot, ["rev-parse", "--show-toplevel"]);
  if (!top.ok) return fail("GIT_UNAVAILABLE", "git", "this is not a Git repository, or Git is unavailable; the source revision cannot be determined");
  let realTop;
  try {
    realTop = fs.realpathSync(top.out.trim());
  } catch {
    return fail("REPO_MISMATCH", "root", "the Git top-level directory cannot be resolved");
  }
  if (!same(realTop, realRoot)) return fail("REPO_MISMATCH", "root", "the export root is not the top level of its Git repository");
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(realRoot, "package.json"), "utf8"));
  } catch {
    return fail("REPO_IDENTITY", "package.json", "package.json is missing or unreadable, so the repository identity cannot be confirmed");
  }
  if (pkg?.name !== expectedPackageName) return fail("REPO_IDENTITY", "package.json", `the package name is ${JSON.stringify(pkg?.name)}, not the ToolZenHub website (${expectedPackageName})`);

  const head = git(realRoot, ["rev-parse", "--verify", "-q", "HEAD^{commit}"]);
  const revision = head.out.trim();
  if (!head.ok || !REVISION.test(revision)) return fail("REVISION_INVALID", "HEAD", "HEAD does not resolve to a full commit id");
  const branch = git(realRoot, ["symbolic-ref", "--short", "-q", "HEAD"]);
  if (!branch.ok) return fail("BRANCH_UNEXPECTED", "HEAD", "HEAD is detached; export from a branch");
  if (expectedBranch !== null && branch.out.trim() !== expectedBranch) return fail("BRANCH_UNEXPECTED", "HEAD", `the branch is ${branch.out.trim()}, not ${expectedBranch}`);

  const time = git(realRoot, ["log", "-1", "--format=%ct", revision]);
  if (!time.ok) return fail("TIME_INVALID", "HEAD", "the commit time cannot be read");
  const parsed = parseCommitterTime(time.out.trim(), { nowMs });
  if (!parsed.ok) return fail("TIME_INVALID", "HEAD", `the commit's committer time is not usable: ${parsed.reason}`);
  return { ok: true, errors: [], revision, branch: branch.out.trim(), generatedAt: parsed.iso, committerEpoch: parsed.epochSeconds, root: realRoot };
}

/** The current HEAD commit id, or null. */
export function currentRevision(root) {
  const head = git(root, ["rev-parse", "--verify", "-q", "HEAD^{commit}"]);
  const revision = head.out.trim();
  return head.ok && REVISION.test(revision) ? revision : null;
}

/** Blob id and mode of every file at HEAD: Map path -> { mode, sha }. Null when it cannot be read. */
function committedBlobs(root) {
  const listed = git(root, ["ls-tree", "-r", "-z", "HEAD"]);
  if (!listed.ok) return null;
  const blobs = new Map();
  for (const entry of listed.out.split("\0")) {
    const tab = entry.indexOf("\t");
    if (tab < 0) continue;
    const [mode, , sha] = entry.slice(0, tab).split(" ");
    blobs.set(entry.slice(tab + 1), { mode, sha });
  }
  return blobs;
}

/**
 * The blob id Git would give each working-tree file, after the repository's own line-ending and attribute rules. This reads
 * the bytes themselves, so it does not depend on Git's stat cache, the index flags or `git status`.
 * Returns Map path -> sha, or null when Git cannot hash the files.
 */
export function workingTreeHashes(root, files) {
  if (files.length === 0) return new Map();
  const hashed = git(root, ["hash-object", "--stdin-paths"], { input: files.join("\n") + "\n" });
  if (!hashed.ok) return null;
  const lines = hashed.out.split("\n").filter(Boolean);
  if (lines.length !== files.length) return null;
  return new Map(files.map((file, i) => [file, lines[i]]));
}

/**
 * The dirty-source gate. `dependencies` are repository-relative posix paths. Every one must be an existing, tracked, regular
 * file that Git reports as unchanged (not modified, staged, deleted, renamed or conflicted, and not hidden with
 * assume-unchanged or skip-worktree), reached without a symbolic link in its path, AND whose bytes hash to exactly the blob
 * committed at HEAD (checked independently of Git's own change detection). Returns the working-tree hashes in `hashes` so a
 * later call can prove nothing moved. Never changes anything.
 */
export function checkWorkingTree({ root, dependencies }) {
  const errors = [];
  const add = (code, id, message) => errors.push({ code, id, message });
  let realRoot;
  try {
    realRoot = fs.realpathSync(root);
  } catch {
    return { ok: false, errors: [{ code: "REPO_MISSING", id: "root", message: "the repository directory does not exist" }], checked: 0 };
  }

  const wanted = new Set();
  for (const dep of dependencies) {
    if (typeof dep !== "string" || dep.length === 0 || dep.startsWith("/") || dep.split("/").some((s) => s === ".." || s === "." || s === "") || dep.includes("\\")) {
      add("DEP_UNSAFE", String(dep), "a dependency must be a clean repository-relative path");
      continue;
    }
    wanted.add(dep);
    // no symbolic link anywhere on the way to the file, and the file is a regular file
    let current = realRoot;
    let blocked = false;
    for (const segment of dep.split("/")) {
      current = path.join(current, segment);
      let stat;
      try {
        stat = fs.lstatSync(current);
      } catch {
        add("DEP_MISSING", dep, "a dependency of the export does not exist in the working tree");
        blocked = true;
        break;
      }
      if (stat.isSymbolicLink()) {
        add("UNSAFE_SYMLINK", dep, "is reached through a symbolic link, which could alias or shadow the tracked file");
        blocked = true;
        break;
      }
    }
    if (!blocked && !fs.lstatSync(path.join(realRoot, dep)).isFile()) add("DEP_UNSAFE", dep, "a dependency must be a regular file");
  }

  const listed = git(realRoot, ["ls-files", "-v", "-z"]);
  if (!listed.ok) add("GIT_UNAVAILABLE", "git", "the list of tracked files cannot be read");
  else {
    const tracked = new Map();
    for (const entry of listed.out.split("\0")) if (entry.length > 2) tracked.set(entry.slice(2), entry[0]);
    for (const dep of wanted) {
      const tag = tracked.get(dep);
      if (tag === undefined) add("UNTRACKED_DEPENDENCY", dep, "a file the export depends on is not tracked by Git, so it cannot be tied to the source revision");
      else if (tag !== "H") add("HIDDEN_CHANGE", dep, `Git is told to ignore changes to this dependency (flag ${tag}: assume-unchanged or skip-worktree)`);
    }
  }

  const status = git(realRoot, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames"]);
  if (!status.ok) add("GIT_UNAVAILABLE", "git", "the working tree status cannot be read");
  else {
    for (const entry of status.out.split("\0")) {
      if (entry.length < 4) continue;
      const code = entry.slice(0, 2);
      const file = entry.slice(3);
      if (wanted.has(file)) add("DIRTY_DEPENDENCY", file, `a file the export depends on has uncommitted changes (git status ${JSON.stringify(code)}); commit or revert it first`);
    }
  }

  // independent byte-level check against the committed blobs
  let hashes = new Map();
  const existing = [...wanted].filter((dep) => !errors.some((e) => e.id === dep && ["DEP_MISSING", "UNSAFE_SYMLINK", "DEP_UNSAFE"].includes(e.code))).sort();
  const blobs = committedBlobs(realRoot);
  const current = blobs === null ? null : workingTreeHashes(realRoot, existing);
  if (blobs === null || current === null) add("GIT_UNAVAILABLE", "git", "the committed blobs or the working-tree hashes cannot be read, so the source bytes cannot be verified");
  else {
    hashes = current;
    for (const dep of existing) {
      const committed = blobs.get(dep);
      if (committed === undefined) continue; // already reported as untracked
      if (committed.mode !== "100644" && committed.mode !== "100755") add("UNSAFE_MODE", dep, `is committed as mode ${committed.mode}, not a regular file`);
      else if (current.get(dep) !== committed.sha) add("CONTENT_MISMATCH", dep, "the bytes in the working tree do not match the blob committed at HEAD");
    }
  }
  return { ok: errors.length === 0, errors, checked: wanted.size, hashes };
}

/**
 * Proves the guarded files still hold the bytes verified earlier: re-hashes them, compares with `expected` (the hashes from
 * checkWorkingTree) and with the committed blobs, and checks that HEAD is still `revision`. Used immediately before output.
 */
export function verifySnapshot({ root, expected, revision }) {
  const errors = [];
  if (currentRevision(root) !== revision) errors.push({ code: "REVISION_CHANGED", id: "HEAD", message: "HEAD moved while the export was running" });
  const files = [...expected.keys()].sort();
  const blobs = committedBlobs(root);
  const now = workingTreeHashes(root, files);
  if (blobs === null || now === null) errors.push({ code: "GIT_UNAVAILABLE", id: "git", message: "the source bytes cannot be re-verified" });
  else {
    for (const file of files) {
      if (now.get(file) !== expected.get(file) || blobs.get(file)?.sha !== now.get(file)) errors.push({ code: "SOURCE_CHANGED", id: file, message: "a file the export depends on changed while the export was running" });
    }
  }
  return { ok: errors.length === 0, errors };
}

/** The ledger as committed at HEAD (validated). */
export function readCommittedLedger({ root }) {
  const shown = git(root, ["show", `HEAD:${LEDGER_FILE}`]);
  if (!shown.ok) return { ok: false, ledger: null, text: null, errors: [{ code: "LEDGER_COMMITTED_MISSING", id: "ledger", message: `${LEDGER_FILE} is not committed at HEAD, so there is nothing to compare the working ledger with` }] };
  const parsed = parseLedgerText(shown.out);
  return parsed.ok ? { ok: true, ledger: parsed.ledger, text: shown.out, errors: [] } : { ok: false, ledger: null, text: shown.out, errors: parsed.errors.map((e) => ({ ...e, message: `committed ledger: ${e.message}` })) };
}

/**
 * Walks every committed version of the ledger, oldest first, and requires each to be a legitimate evolution of the one before
 * (compareLedgers), so a past commit that edited the catalog and the ledger together cannot have rewritten an identity unseen.
 */
export function verifyLedgerLineage({ root }) {
  // History that is cut off cannot prove a lineage: refuse rather than verify a partial chain.
  const shallow = git(root, ["rev-parse", "--is-shallow-repository"]);
  if (!shallow.ok || shallow.out.trim() !== "false") return { ok: false, versions: 0, errors: [{ code: "LEDGER_LINEAGE_INCOMPLETE", id: "ledger", message: "the repository history is shallow or cannot be inspected, so the ledger's full lineage cannot be verified" }] };
  // First-parent order is the mainline of the checked-out branch: parents always come before children, and a branch that was
  // merged is compared as the single step the merge made. (Chronological order would mix unrelated branches.)
  const log = git(root, ["log", "--first-parent", "--format=%H", "--reverse", "--", LEDGER_FILE]);
  const commits = log.out.split("\n").map((s) => s.trim()).filter(Boolean);
  if (!log.ok || commits.length === 0) return { ok: false, versions: 0, errors: [{ code: "LEDGER_LINEAGE_MISSING", id: "ledger", message: "the ledger has no committed history" }] };
  const errors = [];
  let previous = null;
  for (const sha of commits) {
    const shown = git(root, ["show", `${sha}:${LEDGER_FILE}`]);
    if (!shown.ok) {
      errors.push({ code: "LEDGER_LINEAGE_BROKEN", id: sha.slice(0, 7), message: "the ledger was deleted in this commit" });
      previous = null;
      continue;
    }
    const parsed = parseLedgerText(shown.out);
    if (!parsed.ok) {
      errors.push(...parsed.errors.map((e) => ({ ...e, id: `${sha.slice(0, 7)}:${e.id}`, message: `ledger at ${sha.slice(0, 7)}: ${e.message}` })));
      previous = null;
      continue;
    }
    if (previous !== null) for (const e of compareLedgers(previous, parsed.ledger).errors) errors.push({ ...e, id: `${sha.slice(0, 7)}:${e.id}`, message: `ledger change in ${sha.slice(0, 7)}: ${e.message}` });
    previous = parsed.ledger;
  }
  return { ok: errors.length === 0, versions: commits.length, errors };
}

/** True when Git ignores the repository-relative path (so an export there can never be committed by accident). */
export function isGitIgnored({ root, relativePath }) {
  const r = git(root, ["check-ignore", "-q", "--", relativePath]);
  return r.ok;
}
