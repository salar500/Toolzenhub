/**
 * G3C-B4: the manifest envelope builder and its from-scratch file validator (scripts/growth-manifest/manifest.mjs).
 * Synthetic items only; pure.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { computeManifestFingerprint, encodeManifestFile, serializeManifestFile } from "../../scripts/growth-manifest/canonical.mjs";
import { mapRegistry } from "../../scripts/growth-manifest/items.mjs";
import { GENERATOR, MAX_FILE_BYTES, SITE_ID, buildManifest, buildManifestBytes, retiredAdvisories, validateManifestFile } from "../../scripts/growth-manifest/manifest.mjs";
import { baseRegistry } from "../helpers/growth-registry.mjs";

const REVISION = "0123456789abcdef0123456789abcdef01234567";
const GENERATED_AT = "2026-10-08T13:24:20.000Z";
const items = () => mapRegistry(baseRegistry()).items;
const build = (extra = {}) => buildManifestBytes({ items: items(), revision: REVISION, generatedAt: GENERATED_AT, ...extra });
/** Re-serializes a modified manifest canonically so only the targeted rule can fail. */
const reserialize = (mutate) => {
  const manifest = JSON.parse(Buffer.from(build().bytes).toString("utf8"));
  mutate(manifest);
  return encodeManifestFile(manifest);
};
const expectProblem = (bytes, code) => {
  const r = validateManifestFile(bytes);
  assert.equal(r.ok, false, `expected ${code}`);
  assert.ok(r.problems.some((p) => p.code === code), `expected ${code}, got ${JSON.stringify(r.problems.slice(0, 4))}`);
};

describe("building", () => {
  test("a valid manifest has the documented envelope and nothing invented", () => {
    const r = build();
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(Object.keys(r.manifest).sort(), ["content", "counts", "generatedAt", "generator", "manifestFingerprint", "schemaVersion", "site", "source"]);
    assert.equal(r.manifest.schemaVersion, 1);
    assert.deepEqual(r.manifest.site, { id: SITE_ID }, "no declared origin is written");
    assert.deepEqual(r.manifest.generator, { name: GENERATOR.name, version: GENERATOR.version });
    assert.deepEqual(r.manifest.source, { revision: REVISION, dirty: false });
    assert.equal(r.manifest.generatedAt, GENERATED_AT);
    assert.deepEqual(r.manifest.counts, { tools: 2, articles: 2 });
    assert.equal(r.manifest.manifestFingerprint, computeManifestFingerprint(1, SITE_ID, items()));
    assert.equal("retired" in r.manifest, false, "an empty retired list is omitted");
    assert.match(r.fileHash, /^[0-9a-f]{64}$/);
    assert.equal(r.manifestFingerprint, r.manifest.manifestFingerprint);
  });

  test("the bytes are the canonical file and byte-identical on every build", () => {
    const a = build();
    const b = build();
    assert.deepEqual(a.bytes, b.bytes);
    assert.equal(a.fileHash, b.fileHash);
    assert.equal(Buffer.from(a.bytes).toString("utf8"), serializeManifestFile(a.manifest));
  });

  test("input order does not matter; the output is in canonical order", () => {
    const reversed = items().reverse();
    const r = buildManifestBytes({ items: reversed, revision: REVISION, generatedAt: GENERATED_AT });
    assert.equal(r.ok, false, "the builder does not sort for the caller; unsorted items are refused");
    assert.ok(r.errors.some((e) => e.code === "ORDER"));
  });

  test("a refusal returns no bytes", () => {
    const r = buildManifestBytes({ items: [], revision: "short", generatedAt: GENERATED_AT });
    assert.equal(r.ok, false);
    assert.equal(r.bytes, null);
  });

  test("the revision and timestamp must be exact", () => {
    for (const revision of ["", "ABCDEF0123456789abcdef0123456789abcdef01", REVISION.slice(1), REVISION + "0", null, undefined]) {
      assert.equal(buildManifestBytes({ items: items(), revision, generatedAt: GENERATED_AT }).ok, false, String(revision));
    }
    for (const generatedAt of ["2026-10-08T13:24:20Z", "2026-02-30T00:00:00.000Z", "", null, "2026-10-08"]) {
      assert.equal(buildManifestBytes({ items: items(), revision: REVISION, generatedAt }).ok, false, String(generatedAt));
    }
  });

  test("an empty content list is a valid manifest", () => {
    const r = buildManifestBytes({ items: [], revision: REVISION, generatedAt: GENERATED_AT });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.manifest.counts, { tools: 0, articles: 0 });
  });
});

describe("retired advisories", () => {
  const ledger = () => ({
    articles: [{ id: 9, state: "retired", retired: { reason: "merged into article 1" } }, { id: 10, state: "active" }, { id: 7, state: "retired", retired: { reason: "withdrawn" } }],
    tools: [{ id: "old-tool", state: "retired", retired: { reason: "replaced" } }, { id: "live", state: "active" }],
  });

  test("come from the ledger's recorded retirements in canonical order", () => {
    assert.deepEqual(retiredAdvisories(ledger()), [
      { id: "tool:old-tool", reason: "replaced" },
      { id: "article:7", reason: "withdrawn" },
      { id: "article:9", reason: "merged into article 1" },
    ]);
    assert.deepEqual(retiredAdvisories({ articles: [], tools: [] }), []);
  });

  test("are written when present and validated", () => {
    const r = build({ retired: retiredAdvisories(ledger()) });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.manifest.retired.length, 3);
  });

  test("a retired identity that is also published, or a malformed advisory, is refused", () => {
    expectProblem(reserialize((m) => (m.retired = [{ id: "tool:stopwatch", reason: "x" }])), "RETIRED");
    expectProblem(reserialize((m) => (m.retired = [])), "RETIRED");
    expectProblem(reserialize((m) => (m.retired = [{ id: "nonsense", reason: "x" }])), "RETIRED");
    expectProblem(reserialize((m) => (m.retired = [{ id: "article:9", reason: "" }])), "RETIRED");
    expectProblem(reserialize((m) => (m.retired = [{ id: "article:9", reason: "two\nlines" }])), "RETIRED");
    expectProblem(reserialize((m) => (m.retired = [{ id: "article:9", reason: "a" }, { id: "article:7", reason: "b" }])), "RETIRED");
  });
});

describe("validating bytes from scratch", () => {
  test("accepts what the builder produced", () => assert.equal(validateManifestFile(build().bytes).ok, true));

  test("rejects non-canonical bytes", () => {
    const text = Buffer.from(build().bytes).toString("utf8");
    for (const bad of [text.replace(/\n/g, "\r\n"), text.slice(0, -1), "\ufeff" + text, JSON.stringify(JSON.parse(text)) + "\n", text.replace(/ {2}/g, "\t")]) expectProblem(Buffer.from(bad, "utf8"), "FILE");
    expectProblem(Uint8Array.from([0x7b, 0xff]), "FILE");
    assert.equal(validateManifestFile("not bytes").ok, false);
    assert.equal(validateManifestFile(null).ok, false);
  });

  test("rejects a wrong envelope", () => {
    expectProblem(reserialize((m) => (m.extra = 1)), "ENVELOPE");
    expectProblem(reserialize((m) => delete m.generator), "ENVELOPE");
    expectProblem(reserialize((m) => (m.schemaVersion = 2)), "ENVELOPE");
    expectProblem(reserialize((m) => (m.site = { id: "other" })), "ENVELOPE");
    expectProblem(reserialize((m) => (m.site = { id: SITE_ID, declaredCanonicalOrigin: "https://toolzenhub.in" })), "ENVELOPE");
    expectProblem(reserialize((m) => (m.generator.version = "9.9.9")), "ENVELOPE");
    expectProblem(reserialize((m) => (m.generatedAt = "yesterday")), "ENVELOPE");
    expectProblem(reserialize((m) => (m.source.dirty = true)), "ENVELOPE");
    expectProblem(reserialize((m) => (m.source.revision = "abc")), "ENVELOPE");
    expectProblem(reserialize((m) => (m.source.extra = 1)), "ENVELOPE");
  });

  test("rejects counts and fingerprints that do not match the content", () => {
    expectProblem(reserialize((m) => (m.counts.tools = 99)), "COUNTS");
    expectProblem(reserialize((m) => (m.counts.extra = 1)), "COUNTS");
    expectProblem(reserialize((m) => (m.manifestFingerprint = "sha256:" + "0".repeat(64))), "FINGERPRINT");
    expectProblem(reserialize((m) => (m.manifestFingerprint = "md5:x")), "FINGERPRINT");
    expectProblem(reserialize((m) => (m.content[0].title = "Changed without a new fingerprint")), "FINGERPRINT");
  });

  test("rejects invalid content through the item validator", () => {
    expectProblem(reserialize((m) => (m.content[0].status = "coming_soon")), "STATUS");
    expectProblem(reserialize((m) => m.content.reverse()), "ORDER");
    expectProblem(reserialize((m) => m.content.push(structuredClone(m.content[0]))), "DUPLICATE");
    expectProblem(reserialize((m) => (m.content = "none")), "ENVELOPE");
  });

  test("enforces the consumer's size ceilings", () => {
    assert.equal(MAX_FILE_BYTES, 4 * 1024 * 1024);
    const huge = reserialize((m) => (m.content[0].description = "x".repeat(MAX_FILE_BYTES)));
    const r = validateManifestFile(huge);
    assert.ok(r.problems.some((p) => p.code === "FILE" && /larger than/.test(p.message)));
  });

  test("never throws on garbage", () => {
    for (const bad of [new Uint8Array(0), Buffer.from("{}\n"), Buffer.from("[]\n"), Buffer.from("null\n"), Buffer.from("1\n"), Buffer.from('"x"\n')]) assert.equal(validateManifestFile(bad).ok, false);
  });
});

describe("determinism", () => {
  test("the envelope contains no clock, path or environment value", () => {
    const text = Buffer.from(build().bytes).toString("utf8");
    assert.equal(/[A-Za-z]:[\\/]|\/Users\/|\/home\/|\\\\/.test(text), false, "no absolute machine path");
    assert.ok(!text.includes(String(new Date().getFullYear() + 5)));
    assert.equal(buildManifest({ items: [], revision: REVISION, generatedAt: GENERATED_AT }).generatedAt, GENERATED_AT);
  });
});
