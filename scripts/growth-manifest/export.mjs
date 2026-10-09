/**
 * Growth manifest export CLI.
 *
 *   node scripts/growth-manifest/export.mjs --check    validate everything, build the bytes in memory, write NOTHING
 *   node scripts/growth-manifest/export.mjs --write    the same validation, then write growth-export/toolzenhub-manifest.json
 *
 * Exactly one of the two flags is required: there is no default write, no output-path option and no way to skip a check.
 * Exit status: 0 success, 1 the export was refused, 2 bad usage.
 *
 * The export is bound to ONE Git commit and fails closed, in this order:
 *   1. identity   the repository, branch, full HEAD id and the commit's committer time (generatedAt; never the wall clock)
 *   2. tracing    every file that can influence the manifest is traced from the code (deps.mjs)
 *   3. dirty gate every such file is tracked, unmodified, unstaged and reached through no symbolic link (source-state.mjs)
 *   4. ledger     the working ledger equals the committed one, and the committed history of the ledger is a legitimate evolution
 *   5. mapping    the catalogs are loaded, the identity ledger is enforced, and the published content is mapped and validated
 *   6. recheck    the full dependency set (images, tool modules) is gated again and HEAD must not have moved
 *   7. manifest   the canonical bytes are built and validated again from scratch (manifest.mjs)
 *   8. output     the destination is checked (fixed path, Git-ignored, no symlinks); --write then writes atomically
 * Nothing is imported into Growth OS, nothing touches the network, and the ledger is never rewritten.
 *
 * The wall clock is read in ONE place, main(), and only as the reference for rejecting an implausible future commit time; it
 * never becomes part of the output.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { traceDependencies } from "./deps.mjs";
import { LEDGER_FILE } from "./ledger.mjs";
import { buildManifestBytes, retiredAdvisories } from "./manifest.mjs";
import { REPO_ROOT as DEFAULT_ROOT, exportPublishedItems } from "./registry.mjs";
import { checkWorkingTree, currentRevision, isGitIgnored, readCommittedLedger, readSourceIdentity, verifyLedgerLineage } from "./source-state.mjs";
import { OUTPUT_RELATIVE_PATH, inspectDestination, plannedOutput, writeManifestAtomically } from "./writer.mjs";

/** The entry points the dependency trace starts from: this CLI (and so every producer module) and the four catalogs. */
export const TRACE_ROOTS = Object.freeze([
  "scripts/growth-manifest/export.mjs",
  "assets/js/data/tools.js",
  "assets/js/data/articles.js",
  "assets/js/data/categories.js",
  "assets/js/data/tool-capabilities.js",
]);
/** Data files the producer reads by path rather than by import. */
export const EXPLICIT_READS = Object.freeze(["package.json", "src/_data/toolStyles.json", LEDGER_FILE]);

const usage = "usage: node scripts/growth-manifest/export.mjs --check | --write";

/** Strict argument parsing: exactly one known flag, nothing else. */
export function parseArgs(argv) {
  const errors = [];
  const seen = [];
  for (const arg of argv) {
    if (arg === "--check" || arg === "--write") seen.push(arg);
    else errors.push(arg.startsWith("-") ? `unknown option ${arg}` : `unexpected argument ${arg}`);
  }
  if (seen.length === 0 && errors.length === 0) errors.push("a mode is required: --check or --write");
  if (new Set(seen).size < seen.length) errors.push(`${seen.find((a, i) => seen.indexOf(a) !== i)} was given more than once`);
  if (new Set(seen).size > 1) errors.push("--check and --write conflict; give exactly one");
  return errors.length > 0 ? { ok: false, mode: null, errors } : { ok: true, mode: seen[0] === "--write" ? "write" : "check", errors: [] };
}

function readTextFrom(root) {
  return (relative) => {
    try {
      return fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");
    } catch {
      return null;
    }
  };
}

/** Content digest of the traced files, per repository, for the stale-module guard above. */
const LOADED_DIGESTS = new Map();
function sourceDigest(readText, files) {
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file}\0${readText(file) ?? ""}\0`);
  return hash.digest("hex");
}

const refuse = (stage, errors, extra = {}) => ({ ok: false, stage, errors, notices: [], report: null, wrote: false, ...extra });

/**
 * Runs the whole export for the repository at `root`. `mode` is "check" or "write". `nowMs` is required (it is only the
 * reference for the future-time check). Returns { ok, stage, errors, notices, report, wrote }; never throws for a refusal.
 */
export async function runExport({ root = DEFAULT_ROOT, mode, nowMs, fsApi, expectedBranch = "main" } = {}) {
  if (mode !== "check" && mode !== "write") return refuse("usage", [{ code: "USAGE", id: "mode", message: 'mode must be "check" or "write"' }]);
  if (typeof nowMs !== "number" || !Number.isFinite(nowMs)) return refuse("usage", [{ code: "USAGE", id: "nowMs", message: "a reference time is required for the future-commit check" }]);

  // 1. identity
  const identity = readSourceIdentity({ root, nowMs, expectedBranch });
  if (!identity.ok) return refuse("identity", identity.errors);
  const repo = identity.root;

  // 2. tracing + 3. dirty gate, before any repository code is executed
  const traced = traceDependencies({
    roots: [...TRACE_ROOTS],
    readText: readTextFrom(repo),
    followDynamicFrom: (file) => file === "assets/js/data/articles.js",
    allowComputedDynamic: (file) => file === "scripts/growth-manifest/registry.mjs",
  });
  if (!traced.ok) return refuse("tracing", traced.errors);
  const baseDependencies = [...new Set([...traced.files, ...EXPLICIT_READS])].sort();
  const gate = checkWorkingTree({ root: repo, dependencies: baseDependencies });
  if (!gate.ok) return refuse("dirty-source", gate.errors);

  // Node caches ES modules by URL, so a second run in the same process would keep using catalogs loaded earlier even after
  // they changed. The first run records a digest of every traced file; a later run with different content must not proceed.
  const digest = sourceDigest(readTextFrom(repo), baseDependencies);
  const loadedBefore = LOADED_DIGESTS.get(repo);
  if (loadedBefore !== undefined && loadedBefore !== digest) return refuse("stale-modules", [{ code: "STALE_MODULE_CACHE", id: repo.split(path.sep).pop(), message: "the source changed after this process loaded the catalogs; start a new process (the command line does)" }]);
  LOADED_DIGESTS.set(repo, digest);

  // 4. the committed ledger, its lineage, and agreement with the working copy
  const committed = readCommittedLedger({ root: repo });
  if (!committed.ok) return refuse("ledger", committed.errors);
  const lineage = verifyLedgerLineage({ root: repo });
  if (!lineage.ok) return refuse("ledger", lineage.errors);
  const workingText = readTextFrom(repo)(LEDGER_FILE);
  if (workingText !== committed.text) return refuse("ledger", [{ code: "WORKING_LEDGER_DISAGREES", id: "ledger", message: "the working ledger differs from the committed ledger" }]);

  // 5. mapping with the identity gate (the committed ledger is always the previous ledger; no option bypasses it)
  const mapped = await exportPublishedItems({ root: repo, previousLedger: committed.ledger });
  if (!mapped.ok) return refuse("mapping", mapped.errors, { notices: mapped.notices ?? [] });

  // 6. gate the full dependency set now that the data-derived files are known, and make sure HEAD did not move
  const dataDependencies = [
    ...mapped.items.filter((i) => i.image !== null).map((i) => i.image.path.slice(1)),
    ...committed.ledger.tools.filter((t) => t.state === "active").map((t) => t.module),
  ];
  const fullGate = checkWorkingTree({ root: repo, dependencies: [...new Set([...baseDependencies, ...dataDependencies])].sort() });
  if (!fullGate.ok) return refuse("dirty-source", fullGate.errors, { notices: mapped.notices });
  if (currentRevision(repo) !== identity.revision) return refuse("recheck", [{ code: "REVISION_CHANGED", id: "HEAD", message: "HEAD moved while the export was running" }], { notices: mapped.notices });

  // 7. the manifest bytes
  const built = buildManifestBytes({ items: mapped.items, revision: identity.revision, generatedAt: identity.generatedAt, retired: retiredAdvisories(committed.ledger) });
  if (!built.ok) return refuse("manifest", built.errors, { notices: mapped.notices });

  // 8. the destination
  const planned = plannedOutput(repo);
  if (!isGitIgnored({ root: repo, relativePath: OUTPUT_RELATIVE_PATH })) return refuse("output", [{ code: "OUTPUT_NOT_IGNORED", id: OUTPUT_RELATIVE_PATH, message: "the output path is not ignored by Git; add growth-export/ to .gitignore first" }], { notices: mapped.notices });
  const destination = inspectDestination(repo, fsApi);
  if (!destination.ok) return refuse("output", destination.errors, { notices: mapped.notices });

  const report = {
    mode,
    revision: identity.revision,
    branch: identity.branch,
    generatedAt: identity.generatedAt,
    counts: built.manifest.counts,
    manifestFingerprint: built.manifestFingerprint,
    fileHash: built.fileHash,
    bytes: built.bytes.length,
    retired: built.manifest.retired?.length ?? 0,
    outputPath: planned.relativePath,
    dependencies: gate.checked,
    ledgerVersions: lineage.versions,
    categorylessSections: mapped.validation.categorylessSections,
  };
  if (mode === "check") return { ok: true, stage: "done", errors: [], notices: mapped.notices, report, wrote: false, bytes: built.bytes };

  const written = writeManifestAtomically({ root: repo, bytes: built.bytes, fsApi });
  if (!written.ok) return refuse("output", written.errors, { notices: mapped.notices });
  return { ok: true, stage: "done", errors: [], notices: mapped.notices, report, wrote: true, bytes: built.bytes };
}

function printResult(result, write) {
  if (!result.ok) {
    write(`REFUSED at stage "${result.stage}":`);
    for (const e of result.errors.slice(0, 40)) write(`  ${e.code}  ${e.id}: ${e.message}`);
    if (result.errors.length > 40) write(`  ... and ${result.errors.length - 40} more`);
    write("Nothing was written.");
    return;
  }
  const r = result.report;
  write(result.wrote ? "Manifest written." : "Check passed. Nothing was written.");
  write(`  source revision     ${r.revision} (${r.branch})`);
  write(`  generatedAt         ${r.generatedAt} (the commit's committer time)`);
  write(`  content             ${r.counts.tools} tools, ${r.counts.articles} articles, ${r.retired} retired advisories`);
  write(`  manifest fingerprint ${r.manifestFingerprint}`);
  write(`  file sha256         ${r.fileHash}`);
  write(`  size                ${r.bytes} bytes`);
  write(`  output              ${r.outputPath}${result.wrote ? "" : " (not created)"}`);
  write(`  guarded files       ${r.dependencies} (all clean and tracked); ledger versions verified: ${r.ledgerVersions}`);
  write(`  categoryless sections for Growth owner review: ${r.categorylessSections.join(", ") || "none"}`);
  write(`  notices             ${result.notices.length} (informational)`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.ok) {
    for (const e of parsed.errors) console.error(`error: ${e}`);
    console.error(usage);
    process.exitCode = 2;
    return;
  }
  // The only clock read: the reference for refusing an implausible future commit time. It is never exported.
  const result = await runExport({ mode: parsed.mode, nowMs: Date.now() });
  printResult(result, (line) => console.log(line));
  process.exitCode = result.ok ? 0 : 1;
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entry && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
