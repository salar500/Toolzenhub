/**
 * G3C-B4: the atomic manifest writer. Temporary directories only; the real website's growth-export folder is never used.
 */
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { computeFileHash } from "../../scripts/growth-manifest/canonical.mjs";
import { OUTPUT_DIR, OUTPUT_FILE, OUTPUT_RELATIVE_PATH, inspectDestination, plannedOutput, writeManifestAtomically } from "../../scripts/growth-manifest/writer.mjs";
import { trySymlink } from "../helpers/growth-scratch-repo.mjs";

const bytesOf = (text) => new Uint8Array(Buffer.from(text, "utf8"));
let root;
const out = () => path.join(root, OUTPUT_DIR);
const dest = () => path.join(out(), OUTPUT_FILE);
const listing = () => (fs.existsSync(out()) ? fs.readdirSync(out()).sort() : null);

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-writer-"));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("the fixed destination", () => {
  test("is growth-export/toolzenhub-manifest.json under the root", () => {
    assert.equal(OUTPUT_RELATIVE_PATH, "growth-export/toolzenhub-manifest.json");
    assert.equal(plannedOutput(root).relativePath, OUTPUT_RELATIVE_PATH);
    assert.equal(plannedOutput(root).absolutePath, path.join(path.resolve(root), "growth-export", "toolzenhub-manifest.json"));
  });

  test("there is no way to choose another path", () => {
    const r = writeManifestAtomically({ root, bytes: bytesOf("{}\n"), path: path.join(root, "elsewhere.json"), outDir: "x" });
    assert.equal(r.ok, true);
    assert.deepEqual(listing(), [OUTPUT_FILE]);
    assert.equal(fs.existsSync(path.join(root, "elsewhere.json")), false);
  });
});

describe("writing", () => {
  test("creates the directory and the file; reports the path and hash", () => {
    assert.equal(listing(), null);
    const bytes = bytesOf('{\n  "a": 1\n}\n');
    const r = writeManifestAtomically({ root, bytes });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.path, OUTPUT_RELATIVE_PATH);
    assert.equal(r.fileHash, computeFileHash(bytes));
    assert.deepEqual(fs.readFileSync(dest()), Buffer.from(bytes));
    assert.deepEqual(listing(), [OUTPUT_FILE], "no temporary file is left behind");
  });

  test("replaces an existing output with the new complete file; repeat writes are identical", () => {
    writeManifestAtomically({ root, bytes: bytesOf("old\n") });
    const bytes = bytesOf("new\n");
    assert.equal(writeManifestAtomically({ root, bytes }).ok, true);
    assert.equal(fs.readFileSync(dest(), "utf8"), "new\n");
    const first = fs.readFileSync(dest());
    assert.equal(writeManifestAtomically({ root, bytes }).ok, true);
    assert.deepEqual(fs.readFileSync(dest()), first);
    assert.deepEqual(listing(), [OUTPUT_FILE]);
  });

  test("never touches an unrelated file in the directory", () => {
    fs.mkdirSync(out());
    fs.writeFileSync(path.join(out(), "notes.txt"), "keep me");
    writeManifestAtomically({ root, bytes: bytesOf("x\n") });
    assert.equal(fs.readFileSync(path.join(out(), "notes.txt"), "utf8"), "keep me");
    assert.deepEqual(listing(), [OUTPUT_FILE, "notes.txt"].sort());
  });

  test("refuses empty or non-byte input and writes nothing", () => {
    for (const bad of [new Uint8Array(0), "text", null, undefined, 5]) {
      const r = writeManifestAtomically({ root, bytes: bad });
      assert.equal(r.ok, false);
      assert.equal(r.errors[0].code, "OUTPUT_INVALID");
    }
    assert.equal(listing(), null, "not even the directory is created");
  });
});

describe("failure handling", () => {
  const failing = (method) => ({ ...fs, [method]: () => { throw Object.assign(new Error("injected"), { code: "EIO" }); } });

  for (const method of ["openSync", "writeSync", "fsyncSync", "renameSync"]) {
    test(`a failure in ${method} leaves the previous output intact and no temporary file`, () => {
      writeManifestAtomically({ root, bytes: bytesOf("previous\n") });
      const r = writeManifestAtomically({ root, bytes: bytesOf("replacement\n"), fsApi: failing(method) });
      assert.equal(r.ok, false);
      assert.equal(r.errors[0].code, "OUTPUT_WRITE");
      assert.match(r.errors[0].message, /previous output is unchanged/);
      assert.equal(fs.readFileSync(dest(), "utf8"), "previous\n");
      assert.deepEqual(listing(), [OUTPUT_FILE], "the temporary file was removed");
    });
  }

  test("a failed first write leaves no output file", () => {
    const r = writeManifestAtomically({ root, bytes: bytesOf("x\n"), fsApi: failing("renameSync") });
    assert.equal(r.ok, false);
    assert.equal(fs.existsSync(dest()), false);
    assert.deepEqual(listing(), [], "only the empty directory remains");
  });

  test("a truncated write is detected before the rename and the output is untouched", () => {
    writeManifestAtomically({ root, bytes: bytesOf("previous\n") });
    // a file system that reports a full write but stored only 3 bytes
    let calls = 0;
    const lying = { ...fs, writeSync: (fd, buffer, offset, length) => { calls += 1; fs.writeSync(fd, buffer, offset, Math.min(length, 3)); return length; } };
    const r = writeManifestAtomically({ root, bytes: bytesOf("a much longer replacement\n"), fsApi: lying });
    assert.ok(calls > 0);
    assert.equal(r.ok, false);
    assert.equal(fs.readFileSync(dest(), "utf8"), "previous\n");
    assert.deepEqual(listing(), [OUTPUT_FILE]);
  });

  test("a missing root is refused", () => {
    const r = writeManifestAtomically({ root: path.join(root, "nope"), bytes: bytesOf("x\n") });
    assert.equal(r.ok, false);
    assert.equal(r.errors[0].code, "OUTPUT_UNSAFE");
  });

  test("a file where the directory belongs is refused and left alone", () => {
    fs.writeFileSync(out(), "I am a file");
    const r = writeManifestAtomically({ root, bytes: bytesOf("x\n") });
    assert.equal(r.ok, false);
    assert.equal(fs.readFileSync(out(), "utf8"), "I am a file");
  });

  test("a directory where the file belongs is refused", () => {
    fs.mkdirSync(dest(), { recursive: true });
    const r = writeManifestAtomically({ root, bytes: bytesOf("x\n") });
    assert.equal(r.ok, false);
    assert.ok(fs.statSync(dest()).isDirectory());
  });
});

describe("symbolic links", () => {
  test("a symlinked output directory is refused and nothing is written through it", (t) => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), "tz-elsewhere-"));
    try {
      if (!trySymlink(elsewhere, out(), "junction")) return t.skip("symbolic links are not available here");
      const r = writeManifestAtomically({ root, bytes: bytesOf("x\n") });
      assert.equal(r.ok, false);
      assert.equal(r.errors[0].code, "OUTPUT_UNSAFE");
      assert.deepEqual(fs.readdirSync(elsewhere), []);
      assert.equal(inspectDestination(root).ok, false);
    } finally {
      fs.rmSync(elsewhere, { recursive: true, force: true });
    }
  });

  test("a symlinked output file is refused and its target is untouched", (t) => {
    fs.mkdirSync(out());
    const target = path.join(root, "target.txt");
    fs.writeFileSync(target, "precious");
    if (!trySymlink(target, dest(), "file")) return t.skip("symbolic links are not available here");
    const r = writeManifestAtomically({ root, bytes: bytesOf("x\n") });
    assert.equal(r.ok, false);
    assert.equal(fs.readFileSync(target, "utf8"), "precious");
  });
});

describe("inspecting without writing", () => {
  test("a missing directory is fine and is not created", () => {
    const r = inspectDestination(root);
    assert.deepEqual(r, { ok: true, directoryExists: false, errors: [] });
    assert.equal(listing(), null);
  });

  test("an existing plain directory and file are fine", () => {
    writeManifestAtomically({ root, bytes: bytesOf("x\n") });
    assert.deepEqual(inspectDestination(root), { ok: true, directoryExists: true, errors: [] });
  });
});
