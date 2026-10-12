/**
 * Read-only repository checkpoint.
 *
 *   node scripts/dev/checkpoint.mjs
 *   node scripts/dev/checkpoint.mjs --expect-branch main --expect-head 666a677
 *   node scripts/dev/checkpoint.mjs --only docs/foo.md --only "path with spaces/a.js"
 *   node scripts/dev/checkpoint.mjs --all        (list every changed file, not just the first 30)
 *
 * It reports the branch, HEAD, the working-tree state, and ahead/behind against the CONFIGURED upstream using the
 * refs that are already local (it never fetches). It uses no network, writes nothing, stages nothing, commits and
 * pushes nothing, and runs only read-only git commands (with optional locks off, so even the index is left alone).
 *
 * It describes the repository state. It does NOT run any test or check, and it says nothing about whether the
 * application is correct, whether a phase is complete or whether anything is approved.
 *
 * Exit code: 0 when the report was produced and every expectation given (if any) holds; 1 when an expectation fails
 * or git itself fails unexpectedly; 2 for a usage error.
 */
import { execFileSync } from "node:child_process";

const MAX_LISTED = 30;

const args = process.argv.slice(2);
const flags = { all: false, expectBranch: null, expectHead: null, only: [] };

for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  const value = () => {
    if (i + 1 >= args.length) usage(`${a} needs a value`);
    i += 1;
    return args[i];
  };
  if (a === "--all") flags.all = true;
  else if (a === "--expect-branch") flags.expectBranch = value();
  else if (a === "--expect-head") flags.expectHead = value();
  else if (a === "--only") flags.only.push(value().replaceAll("\\", "/"));
  else if (a === "--help" || a === "-h") usage();
  else usage(`unknown option ${a}`);
}

function usage(problem) {
  const text = [
    "Read-only checkpoint: node scripts/dev/checkpoint.mjs [--expect-branch NAME] [--expect-head SHA] [--only PATH]... [--all]",
    "  --expect-branch NAME   fail if the current branch is not NAME",
    "  --expect-head SHA      fail if HEAD does not start with SHA (7 or more characters)",
    "  --only PATH            (repeatable) fail if any changed file is not exactly PATH or inside the directory PATH",
    "  --all                  list every changed file",
  ].join("\n");
  if (problem) {
    console.error(`${problem}\n${text}`);
    process.exit(2);
  }
  console.log(text);
  process.exit(0);
}

/* read-only git: no shell, no editor, no optional locks (so `git status` does not refresh the index), no prompts */
const ENV = { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0", LC_ALL: "C" };

/** Runs git and returns { ok, out, err }. A failure is returned, never swallowed silently. */
function git(...gitArgs) {
  try {
    const out = execFileSync("git", gitArgs, { env: ENV, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    return { ok: true, out, err: "" };
  } catch (error) {
    return { ok: false, out: "", err: String(error.stderr || error.message || error).trim() };
  }
}

const failures = [];
const unexpected = [];

const inside = git("rev-parse", "--is-inside-work-tree");
if (!inside.ok || inside.out.trim() !== "true") {
  console.error(`Not inside a Git work tree.${inside.err ? `\n${inside.err}` : ""}`);
  process.exit(1);
}

/* branch, or a detached HEAD */
const symbolic = git("symbolic-ref", "--quiet", "--short", "HEAD");
const detached = !symbolic.ok;
const branch = detached ? null : symbolic.out.trim();

/* HEAD (a new repository with no commit has none) */
const headFull = git("rev-parse", "--verify", "--quiet", "HEAD");
const hasHead = headFull.ok;
const head = hasHead ? headFull.out.trim() : null;
let subject = "";
if (hasHead) {
  const s = git("log", "-1", "--format=%s", "HEAD");
  if (s.ok) subject = s.out.trim();
  else unexpected.push(`git log: ${s.err}`);
}

/* upstream, from local refs only */
let upstream = null;
let ahead = null;
let behind = null;
let upstreamNote = "";
if (!detached && hasHead) {
  const up = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}");
  if (up.ok) {
    upstream = up.out.trim();
    const counts = git("rev-list", "--left-right", "--count", "HEAD...@{upstream}");
    if (counts.ok) {
      const [a, b] = counts.out.trim().split(/\s+/).map(Number);
      ahead = a;
      behind = b;
    } else {
      unexpected.push(`git rev-list: ${counts.err}`);
    }
  } else if (/no upstream|no such branch|not a branch/i.test(up.err)) {
    upstreamNote = "no upstream configured";
  } else if (/upstream branch .* not stored as a remote-tracking branch|no such ref/i.test(up.err)) {
    upstreamNote = "upstream is configured but its remote-tracking ref is not present locally";
  } else {
    unexpected.push(`git rev-parse @{upstream}: ${up.err}`);
  }
}

/* the working tree: names only, NUL-separated so spaces and odd characters in paths are safe */
const status = git("status", "--porcelain=v1", "-z", "--untracked-files=all");
const changed = [];
if (status.ok) {
  const entries = status.out.split("\0");
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry === "") continue;
    const xy = entry.slice(0, 2);
    const file = entry.slice(3);
    changed.push({ xy, file });
    if (xy[0] === "R" || xy[0] === "C" || xy[1] === "R" || xy[1] === "C") i += 1; /* the next entry is the original path */
  }
} else {
  unexpected.push(`git status: ${status.err}`);
}

const dirty = changed.length > 0;

/* ---- report ---- */

const lines = [];
lines.push("checkpoint (read-only: no fetch, no network, writes nothing; it does not verify application correctness)");
lines.push(`branch    ${detached ? "(detached HEAD)" : branch}`);
lines.push(`head      ${hasHead ? `${head.slice(0, 7)} ${subject}` : "(no commits yet)"}`);

if (detached) lines.push("upstream  none (detached HEAD)");
else if (upstream) lines.push(`upstream  ${upstream}  ahead ${ahead}  behind ${behind}  (local refs; not fetched)`);
else if (hasHead) lines.push(`upstream  ${upstreamNote || "unknown"}`);

if (!status.ok) {
  lines.push("tree      unknown (git status failed)");
} else if (!dirty) {
  lines.push("tree      clean");
} else {
  const tally = {};
  for (const c of changed) {
    const key = c.xy === "??" ? "untracked" : c.xy.includes("U") || c.xy === "AA" || c.xy === "DD" ? "conflict" : c.xy[0] !== " " && c.xy[1] !== " " ? "staged+unstaged" : c.xy[0] !== " " ? "staged" : "modified";
    tally[key] = (tally[key] || 0) + 1;
  }
  lines.push(`tree      dirty: ${changed.length} changed (${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ")})`);
  const shown = flags.all ? changed : changed.slice(0, MAX_LISTED);
  for (const c of shown) lines.push(`  ${c.xy} ${c.file}`);
  if (shown.length < changed.length) lines.push(`  ... and ${changed.length - shown.length} more (use --all)`);
}

/* optional expectations: reported plainly, never repaired */
if (flags.expectBranch !== null && branch !== flags.expectBranch) {
  failures.push(`expected branch ${flags.expectBranch}, found ${detached ? "a detached HEAD" : branch}`);
}
if (flags.expectHead !== null) {
  if (flags.expectHead.length < 7) failures.push("--expect-head needs at least 7 characters");
  else if (!hasHead || !head.startsWith(flags.expectHead.toLowerCase())) failures.push(`expected HEAD ${flags.expectHead}, found ${hasHead ? head.slice(0, 12) : "no commits"}`);
}
if (flags.only.length > 0) {
  const allowed = (file) => flags.only.some((p) => file === p || file.startsWith(p.endsWith("/") ? p : `${p}/`));
  const extra = changed.filter((c) => !allowed(c.file));
  if (extra.length > 0) failures.push(`changed files outside the expected list: ${extra.slice(0, 10).map((c) => c.file).join(", ")}${extra.length > 10 ? `, and ${extra.length - 10} more` : ""}`);
}

for (const u of unexpected) lines.push(`git problem: ${u}`);
for (const f of failures) lines.push(`EXPECTATION FAILED: ${f}`);

console.log(lines.join("\n"));

process.exit(failures.length > 0 || unexpected.length > 0 ? 1 : 0);
