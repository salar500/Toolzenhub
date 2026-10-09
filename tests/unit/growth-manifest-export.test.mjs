/**
 * G3C-B4: the export CLI end to end. Scenarios run in isolated scratch repositories (a synthetic site plus a copy of the real
 * producer modules); the real repository is only ever read, in check mode. No network, no Growth OS, no real manifest.
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

import { serializeLedger } from "../../scripts/growth-manifest/ledger.mjs";
import { validateManifestFile } from "../../scripts/growth-manifest/manifest.mjs";
import { REPO_ROOT } from "../../scripts/growth-manifest/registry.mjs";
import { parseArgs, runExport } from "../../scripts/growth-manifest/export.mjs";
import { NOW_MS, cloneRepo, commitAll, createBaseRepo, git, removeRepo, syntheticLedger, trySymlink, write } from "../helpers/growth-scratch-repo.mjs";

let base;
const made = [];
const fresh = () => {
  const r = cloneRepo(base);
  made.push(r);
  return r;
};
const OUT = "growth-export/toolzenhub-manifest.json";
const outPath = (root) => path.join(root, ...OUT.split("/"));
const read = (root, rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");
const run = (root, mode = "check", extra = {}) => runExport({ root, mode, nowMs: NOW_MS, ...extra });
const refused = (r, stage, code) => {
  assert.equal(r.ok, false, `expected a refusal at ${stage}`);
  assert.equal(r.stage, stage, JSON.stringify(r.errors.slice(0, 3)));
  assert.equal(r.wrote, false);
  if (code) assert.ok(r.errors.some((e) => e.code === code), `expected ${code}, got ${JSON.stringify(r.errors.slice(0, 5))}`);
};
const status = (root) => git(root, ["status", "--porcelain=v1", "-uall"]);
const cli = (root, args, env = {}) => spawnSync(process.execPath, [path.join(root, "scripts", "growth-manifest", "export.mjs"), ...args], { cwd: root, encoding: "utf8", env: { ...process.env, ...env } });

before(() => {
  base = createBaseRepo();
});
after(() => {
  removeRepo(base);
  for (const r of made) removeRepo(r);
});

describe("arguments", () => {
  test("exactly one known flag is accepted", () => {
    assert.deepEqual(parseArgs(["--check"]), { ok: true, mode: "check", errors: [] });
    assert.deepEqual(parseArgs(["--write"]), { ok: true, mode: "write", errors: [] });
  });

  test("missing, unknown, duplicated, conflicting and positional arguments are refused", () => {
    for (const argv of [[], ["--check", "--write"], ["--write", "--check"], ["--check", "--check"], ["--write", "--write"], ["--out", "x"], ["--check", "extra"], ["check"], ["--CHECK"], ["-c"], ["--check=1"], ["--check", "--bogus"]]) {
      const r = parseArgs(argv);
      assert.equal(r.ok, false, argv.join(" "));
      assert.equal(r.mode, null);
      assert.ok(r.errors.length > 0);
    }
  });

  test("runExport itself refuses a missing mode or reference time", async () => {
    refused(await runExport({ root: base, nowMs: NOW_MS }), "usage");
    refused(await runExport({ root: base, mode: "delete", nowMs: NOW_MS }), "usage");
    refused(await runExport({ root: base, mode: "check" }), "usage");
    refused(await runExport({ root: base, mode: "check", nowMs: NaN }), "usage");
  });
});

describe("check mode", () => {
  test("validates everything, reports the facts, and writes nothing", async () => {
    const root = fresh();
    const before = status(root);
    const r = await run(root);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.wrote, false);
    assert.equal(r.report.mode, "check");
    assert.equal(r.report.revision, git(root, ["rev-parse", "HEAD"]).trim());
    assert.equal(r.report.generatedAt, "2026-10-08T13:24:20.000Z");
    assert.deepEqual(r.report.counts, { tools: 2, articles: 2 });
    assert.match(r.report.manifestFingerprint, /^sha256:[0-9a-f]{64}$/);
    assert.match(r.report.fileHash, /^[0-9a-f]{64}$/);
    assert.equal(r.report.bytes, r.bytes.length);
    assert.equal(r.report.outputPath, OUT);
    assert.deepEqual(r.report.categorylessSections, ["time-tools"]);
    assert.ok(r.report.dependencies > 5);
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false, "check mode never creates the output directory");
    assert.equal(status(root), before);
    assert.equal(validateManifestFile(r.bytes).ok, true);
  });

  test("the prospective bytes are the canonical manifest of the published content", async () => {
    const r = await run(fresh());
    const manifest = JSON.parse(Buffer.from(r.bytes).toString("utf8"));
    assert.deepEqual(manifest.content.map((i) => i.id), ["tool:alpha", "tool:stopwatch", "article:1", "article:2"]);
    assert.equal(manifest.source.dirty, false);
    assert.equal(manifest.source.revision, r.report.revision);
    assert.equal("declaredCanonicalOrigin" in manifest.site, false);
    assert.equal(manifest.content.every((i) => i.marketingEligible === true), true);
    assert.deepEqual(manifest.content.find((i) => i.id === "article:1").image, { alt: "A chart of loan costs", height: 675, path: "/assets/Images/articles/guide.png", width: 1200 });
    assert.equal(manifest.content.find((i) => i.id === "tool:stopwatch").category, null);
  });

  test("never touches the network", async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = () => {
      throw new Error("network access is not allowed");
    };
    try {
      assert.equal((await run(fresh())).ok, true);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe("write mode", () => {
  test("writes exactly the checked bytes to the fixed ignored path and leaves the tree clean", async () => {
    const root = fresh();
    const checked = await run(root);
    const written = await run(root, "write");
    assert.equal(written.ok, true, JSON.stringify(written.errors));
    assert.equal(written.wrote, true);
    assert.deepEqual(fs.readFileSync(outPath(root)), Buffer.from(checked.bytes));
    assert.equal(written.report.fileHash, checked.report.fileHash);
    assert.deepEqual(fs.readdirSync(path.join(root, "growth-export")), ["toolzenhub-manifest.json"]);
    assert.equal(status(root), "", "the output is ignored by Git");
    assert.equal(validateManifestFile(new Uint8Array(fs.readFileSync(outPath(root)))).ok, true);
  });

  test("repeated writes are byte-identical", async () => {
    const root = fresh();
    await run(root, "write");
    const first = fs.readFileSync(outPath(root));
    await run(root, "write");
    assert.deepEqual(fs.readFileSync(outPath(root)), first);
  });

  test("two repositories with the same commit produce the same bytes", async () => {
    const other = createBaseRepo();
    made.push(other);
    const a = await run(base);
    const b = await run(other);
    assert.deepEqual(a.bytes, b.bytes);
    assert.equal(a.report.fileHash, b.report.fileHash);
    assert.equal(a.report.manifestFingerprint, b.report.manifestFingerprint);
  });

  test("a refused export leaves the previous output exactly as it was", async () => {
    const root = fresh();
    await run(root, "write");
    const previous = fs.readFileSync(outPath(root));
    write(root, "assets/js/data/tools.js", read(root, "assets/js/data/tools.js") + "\n// dirty\n");
    refused(await run(root, "write"), "dirty-source", "DIRTY_DEPENDENCY");
    assert.deepEqual(fs.readFileSync(outPath(root)), previous);
    assert.deepEqual(fs.readdirSync(path.join(root, "growth-export")), ["toolzenhub-manifest.json"]);
  });

  test("no option can redirect or weaken the export", async () => {
    const root = fresh();
    const tampered = syntheticLedger();
    tampered.tools = [];
    const r = await run(root, "check", { ledger: tampered, previousLedger: null, output: "/tmp/x.json", outDir: "elsewhere", skipChecks: true, force: true, expectedBranch: "main" });
    assert.equal(r.ok, true);
    assert.equal(r.report.outputPath, OUT);
    assert.equal(r.report.counts.tools, 2);
  });
});

describe("source integrity: each refusal happens before anything is written", () => {
  const dirty = {
    "the tool catalog": (root) => write(root, "assets/js/data/tools.js", read(root, "assets/js/data/tools.js") + "// edit\n"),
    "the article catalog": (root) => write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js") + "// edit\n"),
    "the taxonomy": (root) => write(root, "assets/js/data/categories.js", read(root, "assets/js/data/categories.js") + "// edit\n"),
    "the capability vocabulary": (root) => write(root, "assets/js/data/tool-capabilities.js", read(root, "assets/js/data/tool-capabilities.js") + "// edit\n"),
    "an article content module": (root) => write(root, "assets/js/data/articles/loans/second.js", 'export default { title: "tampered" };\n'),
    "a module imported by an article (transitive)": (root) => write(root, "assets/js/util/helper.js", 'export const helper = () => "tampered";\n'),
    "a tool implementation (ledger anchor)": (root) => write(root, "assets/js/tools/alpha/index.js", "export const alpha = 2;\n"),
    "the hero image": (root) => fs.appendFileSync(path.join(root, "assets/Images/articles/guide.png"), Buffer.from([0])),
    "the tool stylesheet table": (root) => write(root, "src/_data/toolStyles.json", "{}\n"),
    "the identity ledger": (root) => write(root, "scripts/growth-manifest/identity-ledger.json", read(root, "scripts/growth-manifest/identity-ledger.json").replace("Synthetic", "Edited")),
    "a producer module": (root) => write(root, "scripts/growth-manifest/items.mjs", read(root, "scripts/growth-manifest/items.mjs") + "\n// edit\n"),
    "the export CLI itself": (root) => write(root, "scripts/growth-manifest/export.mjs", read(root, "scripts/growth-manifest/export.mjs") + "\n// edit\n"),
    "package.json": (root) => write(root, "package.json", read(root, "package.json") + " "),
  };
  for (const [name, mutate] of Object.entries(dirty)) {
    test(`refuses when ${name} is modified`, async () => {
      const root = fresh();
      mutate(root);
      refused(await run(root, "write"), "dirty-source", "DIRTY_DEPENDENCY");
      assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
    });
  }

  test("refuses a staged edit, a deletion and a rename of a dependency", async () => {
    const staged = fresh();
    write(staged, "assets/js/data/tools.js", read(staged, "assets/js/data/tools.js") + "// staged\n");
    git(staged, ["add", "-A"]);
    refused(await run(staged), "dirty-source", "DIRTY_DEPENDENCY");
    const deleted = fresh();
    fs.rmSync(path.join(deleted, "assets/js/util/helper.js"));
    refused(await run(deleted), "tracing", "DEP_MISSING");
    const renamed = fresh();
    git(renamed, ["mv", "assets/js/util/helper.js", "assets/js/util/helper2.js"]);
    refused(await run(renamed), "tracing", "DEP_MISSING");
  });

  test("refuses an untracked dependency that a committed change started importing", async () => {
    const root = fresh();
    write(root, "assets/js/data/articles/loans/second.js", 'import { extra } from "../../../util/extra.js";\nexport default { title: extra };\n');
    commitAll(root, "second imports extra");
    write(root, "assets/js/util/extra.js", 'export const extra = "x";\n');
    refused(await run(root), "dirty-source", "UNTRACKED_DEPENDENCY");
  });

  test("refuses a dependency reached through a symbolic link", async (t) => {
    const root = fresh();
    fs.rmSync(path.join(root, "assets/js/util"), { recursive: true });
    fs.mkdirSync(path.join(root, "real-util"));
    write(root, "real-util/helper.js", 'export const helper = () => "guide";\n');
    if (!trySymlink(path.join(root, "real-util"), path.join(root, "assets/js/util"), "junction")) return t.skip("symbolic links are not available here");
    const r = await run(root);
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => ["UNSAFE_SYMLINK", "DIRTY_DEPENDENCY", "UNTRACKED_DEPENDENCY"].includes(e.code)));
  });

  test("unrelated changes, including the owner's drafts, do not block an export", async () => {
    const root = fresh();
    write(root, "docs/tool-packs/draft.md", "# edited draft\n");
    write(root, "docs/tool-packs/25-cron-expression-explainer.md", "# untracked owner draft\n");
    write(root, "tests/unit/new.test.mjs", "// an untracked test\n");
    write(root, "notes.txt", "scratch notes\n");
    const draft = read(root, "docs/tool-packs/25-cron-expression-explainer.md");
    const r = await run(root, "write");
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(read(root, "docs/tool-packs/25-cron-expression-explainer.md"), draft, "the draft is never touched");
    assert.ok(status(root).includes("25-cron-expression-explainer.md"), "and it stays untracked");
  });

  test("missing or unusable Git metadata", async () => {
    const root = fresh();
    fs.rmSync(path.join(root, ".git"), { recursive: true, force: true });
    refused(await run(root), "identity", "GIT_UNAVAILABLE");
    const wrongBranch = fresh();
    git(wrongBranch, ["checkout", "-q", "-b", "feature"]);
    refused(await run(wrongBranch), "identity", "BRANCH_UNEXPECTED");
    const wrongRepo = fresh();
    write(wrongRepo, "package.json", JSON.stringify({ name: "other", type: "module" }));
    commitAll(wrongRepo, "rename package");
    refused(await run(wrongRepo), "identity", "REPO_IDENTITY");
  });

  test("a commit time in the future is refused", async () => {
    const root = fresh();
    write(root, "docs/tool-packs/draft.md", "# later\n");
    commitAll(root, "from the future", "2031-01-01T00:00:00Z");
    refused(await run(root), "identity", "TIME_INVALID");
  });
});

describe("the previous committed ledger is always enforced", () => {
  test("a committed change that dropped a protected identity is refused", async () => {
    const root = fresh();
    const ledger = syntheticLedger();
    ledger.tools = ledger.tools.slice(1);
    write(root, "scripts/growth-manifest/identity-ledger.json", serializeLedger(ledger));
    commitAll(root, "drop alpha");
    refused(await run(root), "ledger", "RECORD_DROPPED");
  });

  test("a committed rename or revival that bypassed the explicit record is refused", async () => {
    const root = fresh();
    const ledger = syntheticLedger();
    ledger.articles[0].key = "loans/swapped";
    write(root, "scripts/growth-manifest/identity-ledger.json", serializeLedger(ledger));
    write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js").replace('key: "loans/guide", topic: "loans", slug: "guide"', 'key: "loans/swapped", topic: "loans", slug: "swapped"'));
    commitAll(root, "rename the article and the ledger together");
    refused(await run(root), "ledger", "KEY_CHANGED");
  });

  test("the ledger must exist at HEAD", async () => {
    const root = fresh();
    git(root, ["rm", "-q", "scripts/growth-manifest/identity-ledger.json"]);
    git(root, ["commit", "-q", "-m", "delete the ledger"]);
    refused(await run(root), "dirty-source", "DEP_MISSING");
    // recreated in the working tree but never committed: still refused, and never read as an empty ledger
    write(root, "scripts/growth-manifest/identity-ledger.json", serializeLedger(syntheticLedger()));
    refused(await run(root), "dirty-source", "UNTRACKED_DEPENDENCY");
  });

  test("a catalog that disagrees with the ledger is refused at the mapping stage", async () => {
    const renamed = fresh();
    write(renamed, "assets/js/data/articles.js", read(renamed, "assets/js/data/articles.js").replace('slug: "second"', 'slug: "second-renamed"').replace('key: "loans/second"', 'key: "loans/second-renamed"'));
    commitAll(renamed, "rename article 2 in the catalog only");
    refused(await run(renamed), "mapping", "ARTICLE_KEY_CHANGED");
    const reused = fresh();
    write(reused, "assets/js/data/articles.js", read(reused, "assets/js/data/articles.js").replace("id: 3, status", "id: 2, status"));
    commitAll(reused, "reuse an id");
    refused(await run(reused), "mapping");
    const unledgered = fresh();
    write(unledgered, "assets/js/data/tools.js", read(unledgered, "assets/js/data/tools.js").replace('{ id: "future", status: "coming-soon", available: false,', '{ id: "future", status: "published", available: true, loader: () => import("../tools/stopwatch/index.js"), sitePath: "/calculators/future/", capabilities: { reset: false, copy: false, validation: false },'));
    commitAll(unledgered, "publish a tool without recording it");
    refused(await run(unledgered), "mapping", "TOOL_UNLEDGERED");
  });

  test("broken published content is refused, never silently excluded", async () => {
    const root = fresh();
    write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js").replace('publishedAt: "Aug 26, 2026"', 'publishedAt: "yesterday"'));
    commitAll(root, "break a date");
    const r = await run(root, "write");
    refused(r, "mapping", "DATE_INVALID");
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("a validation failure keeps the previous output", async () => {
    const root = fresh();
    await run(root, "write");
    const previous = fs.readFileSync(outPath(root));
    write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js").replace('updatedAt: "Aug 26, 2026"', 'updatedAt: "Aug 01, 2026"'));
    commitAll(root, "misordered dates");
    const second = cli(root, ["--write"]);
    assert.equal(second.status, 1);
    assert.match(second.stdout, /REFUSED at stage "mapping"/);
    assert.match(second.stdout, /DATE_ORDER/);
    assert.deepEqual(fs.readFileSync(outPath(root)), previous);
  });
});

describe("a second run in the same process", () => {
  test("is refused when the source changed after the catalogs were loaded, instead of exporting stale modules", async () => {
    const root = fresh();
    assert.equal((await run(root)).ok, true);
    assert.equal((await run(root)).ok, true, "unchanged source may be run again");
    write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js").replace('updatedAt: "Aug 26, 2026"', 'updatedAt: "Aug 25, 2026"'));
    commitAll(root, "change a date");
    refused(await run(root), "stale-modules", "STALE_MODULE_CACHE");
    assert.equal(cli(root, ["--check"]).status, 1, "a new process sees the new source and applies the real rules");
  });
});

describe("the output location", () => {
  test("an output path that Git does not ignore is refused", async () => {
    const root = fresh();
    write(root, ".gitignore", "node_modules/\n");
    commitAll(root, "stop ignoring the export folder");
    refused(await run(root, "write"), "output", "OUTPUT_NOT_IGNORED");
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("a symlinked output directory is refused in check mode too", async (t) => {
    const root = fresh();
    const elsewhere = fresh();
    if (!trySymlink(path.join(elsewhere, "assets"), path.join(root, "growth-export"), "junction")) return t.skip("symbolic links are not available here");
    refused(await run(root, "check"), "output", "OUTPUT_UNSAFE");
    refused(await run(root, "write"), "output", "OUTPUT_UNSAFE");
  });

  test("an injected write failure leaves no partial output and reports it", async () => {
    const root = fresh();
    const failing = { ...fs, renameSync: () => { throw Object.assign(new Error("injected"), { code: "EIO" }); } };
    const r = await run(root, "write", { fsApi: failing });
    refused(r, "output", "OUTPUT_WRITE");
    assert.deepEqual(fs.readdirSync(path.join(root, "growth-export")), []);
  });
});

describe("the command line", () => {
  test("--check passes, prints the report and writes nothing", () => {
    const root = fresh();
    const r = cli(root, ["--check"]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /Check passed\. Nothing was written\./);
    assert.match(r.stdout, /sha256:[0-9a-f]{64}/);
    assert.match(r.stdout, /growth-export\/toolzenhub-manifest\.json \(not created\)/);
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
    assert.equal(r.stdout.includes(root), false, "no absolute machine path is printed");
  });

  test("--write writes; the same bytes appear under different locale and time zone settings", () => {
    const a = fresh();
    const b = fresh();
    assert.equal(cli(a, ["--write"], { TZ: "UTC", LC_ALL: "C" }).status, 0);
    assert.equal(cli(b, ["--write"], { TZ: "Pacific/Kiritimati", LC_ALL: "tr_TR.UTF-8" }).status, 0);
    assert.deepEqual(fs.readFileSync(outPath(a)), fs.readFileSync(outPath(b)));
  });

  test("usage errors exit 2 and refusals exit 1", () => {
    const root = fresh();
    for (const args of [[], ["--check", "--write"], ["--bogus"], ["--check", "--check"], ["x"]]) {
      const r = cli(root, args);
      assert.equal(r.status, 2, args.join(" "));
      assert.match(r.stderr, /usage: node scripts\/growth-manifest\/export\.mjs --check \| --write/);
    }
    write(root, "assets/js/data/tools.js", read(root, "assets/js/data/tools.js") + "// dirty\n");
    const refusal = cli(root, ["--write"]);
    assert.equal(refusal.status, 1);
    assert.match(refusal.stdout, /REFUSED at stage "dirty-source"/);
    assert.match(refusal.stdout, /Nothing was written\./);
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });
});

describe("the real repository (read-only)", () => {
  test("check mode either passes or refuses only because of uncommitted export inputs; it never writes and never blocks on drafts", async () => {
    const before = execFileSync("git", ["status", "--porcelain=v1", "-uall"], { cwd: REPO_ROOT, encoding: "utf8" });
    const existed = fs.existsSync(path.join(REPO_ROOT, "growth-export"));
    const r = await runExport({ root: REPO_ROOT, mode: "check", nowMs: Date.now() });
    assert.equal(r.wrote, false);
    assert.equal(fs.existsSync(path.join(REPO_ROOT, "growth-export")), existed, "check mode creates nothing");
    assert.equal(execFileSync("git", ["status", "--porcelain=v1", "-uall"], { cwd: REPO_ROOT, encoding: "utf8" }), before);
    if (r.ok) {
      assert.ok(r.report.counts.tools > 0 && r.report.counts.articles > 0);
      assert.equal(validateManifestFile(r.bytes).ok, true);
    } else {
      assert.equal(r.stage, "dirty-source", `unexpected refusal: ${JSON.stringify(r.errors.slice(0, 3))}`);
      assert.ok(r.errors.every((e) => ["DIRTY_DEPENDENCY", "UNTRACKED_DEPENDENCY", "CONTENT_MISMATCH"].includes(e.code)));
      assert.ok(r.errors.every((e) => !e.id.startsWith("docs/")), "a document never blocks the export");
    }
  });
});

describe("module hygiene", () => {
  const dir = path.join(REPO_ROOT, "scripts", "growth-manifest");
  const modules = ["deps.mjs", "manifest.mjs", "source-state.mjs", "writer.mjs", "export.mjs"];
  const code = (name) => fs.readFileSync(path.join(dir, name), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  test("ASCII-only source, and only built-ins and sibling modules are imported", () => {
    for (const name of modules) {
      const source = fs.readFileSync(path.join(dir, name), "utf8");
      for (const ch of source) assert.ok(ch === "\n" || (ch >= " " && ch <= "~"), `non-ASCII character in ${name}`);
      for (const m of source.matchAll(/^import .* from "([^"]+)";?$/gm)) assert.ok(m[1].startsWith("node:") || /^[.][/][a-z-]+[.]mjs$/.test(m[1]), `${name}: unexpected import ${m[1]}`);
    }
  });

  test("no network, eval or machine-specific path anywhere", () => {
    for (const name of [...modules, "registry.mjs", "ledger.mjs", "items.mjs", "validate.mjs"]) {
      const c = code(name);
      // deps.mjs NAMES these APIs in the patterns it uses to refuse them; it does not call them
      const named = name === "deps.mjs" ? ["WebSocket", "XMLHttpRequest"] : [];
      for (const token of ["fetch(", "node:http", "node:https", "node:net", "node:dgram", "node:dns", "node:tls", "WebSocket", "XMLHttpRequest", "eval(", "new Function", "C:\\\\", "/Users/", "/home/"]) if (!named.includes(token)) assert.equal(c.includes(token), false, `${name} must not contain ${token}`);
    }
  });

  test("capabilities are confined to one module each", () => {
    for (const name of modules) {
      const c = code(name);
      assert.equal(c.includes("node:child_process"), name === "source-state.mjs", `child_process only in source-state.mjs (${name})`);
      assert.equal(/\b(writeFileSync|appendFileSync|renameSync|mkdirSync|rmSync|unlinkSync|copyFileSync|symlinkSync|openSync)\b/.test(c), name === "writer.mjs", `file writes only in writer.mjs (${name})`);
      assert.equal(c.includes("Date.now"), name === "export.mjs", `the clock is read only in export.mjs (${name})`);
      assert.equal(c.includes("process.env"), name === "source-state.mjs", `the environment is read only in source-state.mjs (${name})`);
    }
    for (const name of ["canonical.mjs", "items.mjs", "ledger.mjs", "validate.mjs", "text-policy.mjs", "source-time.mjs", "manifest.mjs", "deps.mjs"]) assert.equal(/from "node:(fs|child_process)"/.test(code(name)), false, `${name} stays pure`);
  });

  test("the output directory is Git-ignored in the real repository", () => {
    assert.ok(read(REPO_ROOT, ".gitignore").split("\n").includes("growth-export/"));
  });
});
