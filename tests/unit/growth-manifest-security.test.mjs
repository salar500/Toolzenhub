/**
 * G3C-B5: security hardening of the export. Each case targets a gap found in the B5 review or proves a claim the review makes:
 * opaque constructs in the dependency trace, byte-level source verification, time-of-check/time-of-use re-verification, and
 * ledger lineage over real Git topologies. Isolated scratch repositories only; nothing touches the real repository.
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { traceDependencies } from "../../scripts/growth-manifest/deps.mjs";
import { TRACE_OPTIONS, runExport } from "../../scripts/growth-manifest/export.mjs";
import { serializeLedger } from "../../scripts/growth-manifest/ledger.mjs";
import { checkWorkingTree, verifyLedgerLineage, verifySnapshot } from "../../scripts/growth-manifest/source-state.mjs";
import { NOW_MS, cloneRepo, commitAll, createBaseRepo, git, removeRepo, syntheticLedger, write } from "../helpers/growth-scratch-repo.mjs";

const trace = (map, roots = ["a.js"], options = TRACE_OPTIONS) => traceDependencies({ roots, readText: (f) => (Object.prototype.hasOwnProperty.call(map, f) ? map[f] : null), ...options });
const codes = (r) => r.errors.map((e) => e.code);
const LEDGER = "scripts/growth-manifest/identity-ledger.json";
const DEPS = ["assets/js/data/tools.js", "assets/js/util/helper.js", LEDGER, "package.json"];

let base;
const made = [];
const fresh = () => {
  const r = cloneRepo(base);
  made.push(r);
  return r;
};
const read = (root, rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");
const run = (root, extra = {}) => runExport({ root, mode: "write", nowMs: NOW_MS, ...extra });
before(() => {
  base = createBaseRepo();
});
after(() => {
  removeRepo(base);
  for (const r of made) removeRepo(r);
});

describe("dependency tracing refuses what it cannot see through", () => {
  const opaque = {
    "import.meta (a URL-relative read)": 'const u = new URL("./data.txt", import.meta.url);',
    "createRequire": 'import { createRequire } from "node:module"; const r = createRequire("/x");',
    "eval": 'eval("1");',
    "the Function constructor": 'const f = new Function("return 1");',
    "fetch": 'await fetch("/data.json");',
    "XMLHttpRequest": "const x = new XMLHttpRequest();",
    "process.binding": 'process.binding("fs");',
    "node:fs": 'import fs from "node:fs"; fs.readFileSync("x");',
    "node:fs/promises": 'import { readFile } from "node:fs/promises";',
    "node:child_process": 'import cp from "node:child_process";',
    "node:vm": 'import vm from "node:vm";',
    "node:worker_threads": 'import w from "node:worker_threads";',
    "node:module": 'import m from "node:module";',
    "node:http": 'import h from "node:http";',
    "a dynamic import of node:fs": 'const m = await import("node:fs");',
  };
  for (const [name, source] of Object.entries(opaque)) {
    test(`refuses ${name} outside the producer`, () => {
      const r = trace({ "a.js": source });
      assert.equal(r.ok, false, name);
      assert.ok(codes(r).includes("DEP_UNCLASSIFIABLE"));
    });
  }

  test("the producer itself may use them (its reads are declared, not traced)", () => {
    const r = trace({ "scripts/growth-manifest/x.mjs": 'import fs from "node:fs"; const u = new URL("./d", import.meta.url);' }, ["scripts/growth-manifest/x.mjs"]);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("the words inside strings and comments are not constructs", () => {
    const r = trace({ "a.js": '// fetch( eval( import.meta\nconst s = "fetch eval import.meta createRequire"; /* new Function */ export default s;' });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("a property or method named like an API is only flagged where it is the API (fetch as a word is over-reported, never missed)", () => {
    assert.equal(trace({ "a.js": "const x = data.fetch();" }).ok, false);
  });
});

describe("dynamic and conditional loading", () => {
  test("a dynamic import in any executed module is followed; only the tool catalog's loaders are not", () => {
    const map = { "a.js": 'import "./helper.js";', "helper.js": 'if (globalThis.flag) await import("./lazy.js");', "lazy.js": 'import "./deep.js";', "deep.js": "export {};" };
    assert.deepEqual(trace(map).files, ["a.js", "deep.js", "helper.js", "lazy.js"]);
    const tools = { "assets/js/data/tools.js": 'export const t = { loader: () => import("../tools/x/index.js") };', "assets/js/tools/x/index.js": 'import "./inner.js";', "assets/js/tools/x/inner.js": "export {};" };
    const r = trace(tools, ["assets/js/data/tools.js"]);
    assert.deepEqual(r.files, ["assets/js/data/tools.js", "assets/js/tools/x/index.js"], "the implementation file is guarded, its imports are not followed");
  });

  test("template-literal, escaped and computed specifiers are refused rather than guessed", () => {
    for (const source of ["await import(`./b.js`);", "await import('./b\\u002ejs');", "await import('./' + name + '.js');", "await import(name);"]) {
      const r = trace({ "a.js": source, "b.js": "export {};" });
      assert.equal(r.ok, false, source);
      assert.ok(codes(r).some((c) => c === "DEP_UNCLASSIFIABLE" || c === "DEP_MISSING"), source);
    }
  });

  test("import attributes, namespace re-exports and multi-line forms are captured", () => {
    const map = { "a.js": 'import data from "./c.json" with { type: "json" };\nexport * as ns from "./b.js";\nimport {\n  one,\n  two,\n} from "./d.js";', "b.js": "", "c.json": "{}", "d.js": "" };
    assert.deepEqual(trace(map).files, ["a.js", "b.js", "c.json", "d.js"]);
  });

  test("a package.json above a traced module is a dependency, because it changes how the module loads", () => {
    const map = { "a/b/mod.js": "export {};", "a/package.json": '{"type":"commonjs"}', "package.json": "{}" };
    assert.deepEqual(trace(map, ["a/b/mod.js"]).files, ["a/b/mod.js", "a/package.json", "package.json"]);
  });
});

describe("the operating guide matches the code", () => {
  test("every refusal stage the export can report is documented, and nothing else is", () => {
    const code = fs.readFileSync(new URL("../../scripts/growth-manifest/export.mjs", import.meta.url), "utf8");
    const guide = fs.readFileSync(new URL("../../docs/growth-manifest.md", import.meta.url), "utf8");
    const inCode = new Set([...code.matchAll(/refuse[(]"([a-z-]+)"/g)].map((m) => m[1]));
    const inGuide = new Set([...guide.matchAll(/^[|] `([a-z-]+)` [|]/gm)].map((m) => m[1]));
    assert.deepEqual([...inCode].sort(), [...inGuide].sort());
  });

  test("the guide states the approved generator identity, the fixed output path and that --write needs authorization", () => {
    const guide = fs.readFileSync(new URL("../../docs/growth-manifest.md", import.meta.url), "utf8");
    assert.match(guide, /toolzenhub-growth-manifest/);
    assert.ok(guide.includes("version `1.0.0`"));
    assert.ok(guide.includes("growth-export/toolzenhub-manifest.json"));
    assert.ok(guide.includes("Do not run `--write` without the") && guide.includes("explicit authorization"));
    assert.match(guide, /global stop engaged/);
  });
});

describe("byte-level source verification", () => {
  test("an edit hidden from git status by core.ignoreStat is caught by the blob check, independently of the hidden-flag check", () => {
    const root = fresh();
    git(root, ["config", "core.ignoreStat", "true"]);
    git(root, ["add", "-A", "--renormalize"]);
    git(root, ["update-index", "--refresh"]);
    write(root, "assets/js/util/helper.js", read(root, "assets/js/util/helper.js").replace("guide", "GUIDE"));
    assert.equal(git(root, ["-c", "core.ignoreStat=true", "status", "--porcelain=v1"]), "", "premise: plain git status shows nothing");
    const r = checkWorkingTree({ root, dependencies: DEPS });
    assert.equal(r.ok, false);
    assert.ok(codes(r).includes("CONTENT_MISMATCH"), JSON.stringify(codes(r)));
  });

  test("an ordinary Windows-style CRLF checkout made by Git itself is not a false positive", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-crlf-"));
    made.push(root);
    fs.rmSync(root, { recursive: true });
    execFileSync("git", ["clone", "-q", "--no-hardlinks", "-c", "core.autocrlf=true", base, root], { stdio: "ignore" });
    assert.ok(read(root, "assets/js/util/helper.js").includes("\r\n"), "premise: Git checked the source out with CRLF");
    assert.equal(execFileSync("git", ["status", "--porcelain=v1"], { cwd: root, encoding: "utf8" }), "", "premise: Git (with the repository's own settings) considers it clean");
    const r = checkWorkingTree({ root, dependencies: DEPS });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.hashes.get("assets/js/util/helper.js"), execFileSync("git", ["rev-parse", "HEAD:assets/js/util/helper.js"], { cwd: root, encoding: "utf8" }).trim());
  });

  test("the ledger is protected byte for byte: a CRLF rewrite of the canonical ledger is a change", () => {
    const root = fresh();
    write(root, ".gitattributes", `${LEDGER} -text\n`);
    commitAll(root, "mark the ledger -text");
    write(root, LEDGER, read(root, LEDGER).replace(/\n/g, "\r\n"));
    const r = checkWorkingTree({ root, dependencies: DEPS });
    assert.equal(r.ok, false);
    assert.ok(codes(r).includes("CONTENT_MISMATCH"));
  });

  test("a different-case spelling of a dependency cannot alias the tracked file", async () => {
    const root = fresh();
    write(root, "assets/js/data/articles/loans/guide.js", read(root, "assets/js/data/articles/loans/guide.js").replace("util/helper.js", "util/Helper.js"));
    commitAll(root, "import with different case");
    const r = await run(root);
    assert.equal(r.ok, false);
    assert.ok(["tracing", "dirty-source"].includes(r.stage), r.stage);
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("the gate returns the verified hashes, and a snapshot check notices any later change", () => {
    const root = fresh();
    const gate = checkWorkingTree({ root, dependencies: DEPS });
    assert.equal(gate.ok, true);
    assert.equal(gate.hashes.size, DEPS.length);
    const revision = git(root, ["rev-parse", "HEAD"]).trim();
    assert.equal(verifySnapshot({ root, expected: gate.hashes, revision }).ok, true);
    write(root, "assets/js/util/helper.js", "export const helper = () => 'changed';\n");
    const changed = verifySnapshot({ root, expected: gate.hashes, revision });
    assert.equal(changed.ok, false);
    assert.ok(changed.errors.some((e) => e.code === "SOURCE_CHANGED" && e.id === "assets/js/util/helper.js"));
    git(root, ["checkout", "--", "assets/js/util/helper.js"]);
    write(root, "docs/tool-packs/draft.md", "# moved on\n");
    commitAll(root, "move HEAD", "2026-10-09T01:00:00Z");
    assert.ok(verifySnapshot({ root, expected: gate.hashes, revision }).errors.some((e) => e.code === "REVISION_CHANGED"));
  });
});

describe("time of check versus time of use", () => {
  test("a guarded file changed after the catalogs were loaded is caught before anything is written", async () => {
    const root = fresh();
    const r = await run(root, { __afterMapping: () => write(root, "assets/js/util/helper.js", "export const helper = () => 'swapped';\n") });
    assert.equal(r.ok, false);
    assert.equal(r.stage, "dirty-source", "the full-set gate sees the dirty file first");
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("a guarded file changed after validation but before output is caught and nothing is written", async () => {
    const root = fresh();
    const r = await run(root, { __beforeOutput: () => write(root, "assets/js/data/articles/loans/second.js", 'export default { title: "swapped" };\n') });
    assert.equal(r.ok, false);
    assert.equal(r.stage, "recheck");
    assert.ok(r.errors.some((e) => e.code === "SOURCE_CHANGED" && e.id === "assets/js/data/articles/loans/second.js"));
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("a restored file is not silently accepted if it differs from the verified bytes", async () => {
    const root = fresh();
    const original = read(root, "assets/js/util/helper.js");
    const r = await run(root, {
      __beforeOutput: () => {
        write(root, "assets/js/util/helper.js", original + "// touched\n");
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.stage, "recheck");
  });

  test("HEAD moving during the run is caught and nothing is written", async () => {
    const root = fresh();
    const r = await run(root, { __beforeOutput: () => { write(root, "docs/tool-packs/draft.md", "# new commit\n"); commitAll(root, "HEAD moves", "2026-10-09T02:00:00Z"); } });
    assert.equal(r.ok, false);
    assert.equal(r.stage, "recheck");
    assert.ok(r.errors.some((e) => e.code === "REVISION_CHANGED"));
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });

  test("an unchanged run through both seams still succeeds and writes the verified bytes", async () => {
    const root = fresh();
    const r = await run(root, { __afterMapping: () => {}, __beforeOutput: () => {} });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.wrote, true);
  });
});

describe("ledger lineage over real Git topologies", () => {
  const commitLedger = (root, mutate, message, date) => {
    const ledger = JSON.parse(read(root, LEDGER));
    mutate(ledger);
    write(root, LEDGER, serializeLedger(ledger));
    return commitAll(root, message, date);
  };

  test("an authorized history passes: an addition, a recorded rename, then a retirement", () => {
    const root = fresh();
    commitLedger(root, (l) => { l.articles.push({ id: 4, key: "loans/fourth", keyChanges: [], provenance: "allocated", state: "active" }); l.nextArticleId = 5; }, "allocate article 4", "2026-10-09T01:00:00Z");
    commitLedger(root, (l) => { l.articles[3].key = "loans/fourth-renamed"; l.articles[3].keyChanges = [{ from: "loans/fourth", reason: "clearer title" }]; }, "rename article 4", "2026-10-09T02:00:00Z");
    commitLedger(root, (l) => { l.articles[3].state = "retired"; l.articles[3].retired = { reason: "merged into article 1" }; }, "retire article 4", "2026-10-09T03:00:00Z");
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.versions, 4);
  });

  test("rewritten provenance, reused retired ids and silent deletion in a past commit are found", () => {
    const provenance = fresh();
    commitLedger(provenance, (l) => (l.articles[0].provenance = "bootstrap"), "rewrite provenance");
    assert.ok(verifyLedgerLineage({ root: provenance }).errors.some((e) => e.code === "PROVENANCE_CHANGED"));
    const revived = fresh();
    commitLedger(revived, (l) => { l.articles[1].state = "retired"; l.articles[1].retired = { reason: "withdrawn" }; }, "retire article 2");
    commitLedger(revived, (l) => { l.articles[1].state = "active"; delete l.articles[1].retired; }, "revive article 2");
    assert.ok(verifyLedgerLineage({ root: revived }).errors.some((e) => e.code === "RETIRED_REVIVED"));
    const lowered = fresh();
    commitLedger(lowered, (l) => { l.articles.pop(); l.nextArticleId = 3; }, "drop article 3 and lower the mark");
    assert.ok(verifyLedgerLineage({ root: lowered }).errors.some((e) => e.code === "RECORD_DROPPED"));
  });

  test("an invalid or non-canonical historical version fails the lineage even if the latest is fine", () => {
    const root = fresh();
    write(root, LEDGER, read(root, LEDGER).replace(/\n/g, "\r\n"));
    commitAll(root, "CRLF ledger");
    write(root, LEDGER, serializeLedger(syntheticLedger()));
    commitAll(root, "canonical again");
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.code === "LEDGER_NOT_CANONICAL"));
  });

  test("a merged branch that dropped an identity is judged as the step the merge made", () => {
    const root = fresh();
    git(root, ["checkout", "-q", "-b", "side"]);
    commitLedger(root, (l) => (l.tools = l.tools.slice(1)), "side: drop alpha", "2026-10-09T01:00:00Z");
    git(root, ["checkout", "-q", "main"]);
    write(root, "docs/tool-packs/draft.md", "# main continues\n");
    commitAll(root, "main: unrelated", "2026-10-09T02:00:00Z");
    git(root, ["merge", "-q", "--no-ff", "-m", "merge side", "side"], { date: "2026-10-09T03:00:00Z" });
    assert.ok(verifyLedgerLineage({ root }).errors.some((e) => e.code === "RECORD_DROPPED"));
  });

  test("a merged branch with a legitimate change passes, whatever the commit dates say", () => {
    const root = fresh();
    git(root, ["checkout", "-q", "-b", "side"]);
    commitLedger(root, (l) => { l.articles.push({ id: 4, key: "loans/fourth", keyChanges: [], provenance: "allocated", state: "active" }); l.nextArticleId = 5; }, "side: allocate", "2026-10-08T01:00:00Z");
    git(root, ["checkout", "-q", "main"]);
    write(root, "docs/tool-packs/draft.md", "# main continues\n");
    commitAll(root, "main: unrelated", "2026-10-09T02:00:00Z");
    git(root, ["merge", "-q", "--no-ff", "-m", "merge side", "side"], { date: "2026-10-09T03:00:00Z" });
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("parallel legitimate edits on two branches are not a false alarm (ancestry order, not commit dates)", () => {
    const root = fresh();
    git(root, ["checkout", "-q", "-b", "side"]);
    commitLedger(root, (l) => { l.articles.push({ id: 4, key: "loans/fourth", keyChanges: [], provenance: "allocated", state: "active" }); l.nextArticleId = 5; }, "side: allocate article 4", "2026-10-08T01:00:00Z");
    git(root, ["checkout", "-q", "main"]);
    commitLedger(root, (l) => { l.articles[0].state = "retired"; l.articles[0].retired = { reason: "withdrawn" }; }, "main: retire article 1", "2026-10-09T01:00:00Z");
    git(root, ["merge", "-q", "--no-ff", "-m", "merge side", "side"], { date: "2026-10-09T03:00:00Z" });
    const merged = JSON.parse(read(root, LEDGER));
    assert.equal(merged.articles.length, 4, "premise: the merge kept both edits");
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("incomplete (shallow) history cannot prove a lineage and is refused", () => {
    const root = fresh();
    fs.writeFileSync(path.join(root, ".git", "shallow"), git(root, ["rev-parse", "HEAD"]));
    const r = verifyLedgerLineage({ root });
    assert.equal(r.ok, false);
    assert.equal(r.errors[0].code, "LEDGER_LINEAGE_INCOMPLETE");
  });

  test("the bootstrap boundary is explicit: the first committed version is validated, not compared", () => {
    const root = fresh();
    assert.equal(verifyLedgerLineage({ root }).versions, 1);
  });

  test("a catalog that re-uses a retired article key is refused at the mapping stage", async () => {
    const root = fresh();
    commitLedger(root, (l) => { l.articles[1].state = "retired"; l.articles[1].retired = { reason: "withdrawn" }; }, "retire article 2");
    write(root, "assets/js/data/articles.js", read(root, "assets/js/data/articles.js").replace('id: 3, status: "coming-soon", published: false, key: "loans/later", topic: "loans", slug: "later"', 'id: 3, status: "coming-soon", published: false, key: "loans/second", topic: "loans", slug: "second"'));
    commitAll(root, "give article 3 the retired key of article 2");
    const r = await run(root);
    assert.equal(r.ok, false);
    assert.ok(["mapping", "ledger"].includes(r.stage), r.stage);
    assert.equal(fs.existsSync(path.join(root, "growth-export")), false);
  });
});
