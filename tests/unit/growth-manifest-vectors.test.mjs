/**
 * G3C-B1: parity of the standalone producer core with the vendored Growth golden vectors.
 *
 * The expectations are the fixture's own values (reference data copied byte for byte from Growth, see
 * tests/fixtures/growth-manifest/PROVENANCE.md). The code under test is scripts/growth-manifest/ and shares no code with
 * Growth. Do not edit the fixture to make a failure pass: a mismatch is a producer defect or a contract change.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ITEM_KEYS,
  canonicalJson,
  computeFileHash,
  computeItemFingerprint,
  computeManifestFingerprint,
  encodeManifestFile,
  isCanonicalImageNumberText,
  isCanonicalManifestFileBytes,
  isValidImageNumber,
  serializeManifestFile,
  sha256Hex,
  sortContentIds,
  sortItemsCanonical,
} from "../../scripts/growth-manifest/canonical.mjs";
import { findTextIssues, hasForbiddenCharacter } from "../../scripts/growth-manifest/text-policy.mjs";

const DIR = new URL("../fixtures/growth-manifest/", import.meta.url);
const fixtureBytes = fs.readFileSync(new URL("golden-vectors.json", DIR));
const V = JSON.parse(fixtureBytes.toString("utf8"));
const GROWTH_COMMIT = "112a7e97240ac2f74cb757037dc8aea97757aee0";

const reversedKeys = (obj) => Object.fromEntries(Object.entries(obj).reverse());

describe("vendored fixture integrity", () => {
  test("matches its SHA-256 pin and the recorded provenance", () => {
    const pin = fs.readFileSync(new URL("golden-vectors.sha256", DIR), "utf8");
    const actual = sha256Hex(fixtureBytes.toString("utf8"));
    assert.equal(pin, `${actual}  golden-vectors.json\n`, "the fixture bytes no longer match golden-vectors.sha256");
    const provenance = fs.readFileSync(new URL("PROVENANCE.md", DIR), "utf8");
    assert.ok(provenance.includes(actual), "PROVENANCE.md must record the fixture hash");
    assert.ok(provenance.includes(GROWTH_COMMIT), "PROVENANCE.md must record the Growth commit");
  });

  test("is ASCII only with LF line endings (no invisible character can hide in it)", () => {
    for (const byte of fixtureBytes) assert.ok(byte === 0x0a || (byte >= 0x20 && byte < 0x7f), `non-ASCII or control byte 0x${byte.toString(16)} in the fixture`);
  });

  test("has the expected vector groups", () => {
    assert.equal(V.items.length, 6);
    assert.equal(V.ordering.items.length, 5);
    assert.equal(V.ordering.comparatorCases.length, 3);
    assert.equal(V.characterPolicy.accepted.length, 13);
    assert.equal(V.characterPolicy.rejected.length, 45);
    assert.equal(V.numbers.acceptedImageNumberTexts.length, 5);
    assert.equal(V.numbers.rejectedImageNumberTexts.length, 15);
  });
});

describe("item vectors: canonical JSON and fingerprints", () => {
  const groups = [
    ["original", V.items],
    ["categorylessTool", [V.categorylessTool.item]],
    ["ordering", V.ordering.items],
  ];
  for (const [group, vectors] of groups) {
    for (const vec of vectors) {
      test(`${group}: ${vec.name}`, () => {
        assert.equal(canonicalJson(vec.item), vec.canonicalJson, `canonical JSON differs for vector "${vec.name}"`);
        assert.equal(computeItemFingerprint(vec.item), vec.fingerprint, `fingerprint differs for vector "${vec.name}"`);
        assert.equal(canonicalJson(reversedKeys(vec.item)), vec.canonicalJson, "key insertion order must not matter");
        assert.deepEqual([...Object.keys(vec.item), "sourceFingerprint"].sort(), [...ITEM_KEYS].sort(), "vector item has exactly the 18 contract keys");
        assert.deepEqual(findTextIssues(vec.item), [], "vector text must pass the character policy");
        assert.equal(computeItemFingerprint({ ...vec.item, sourceFingerprint: "sha256:" + "0".repeat(64) }), vec.fingerprint, "sourceFingerprint takes no part");
      });
    }
  }
});

describe("manifest fingerprint vectors", () => {
  const vectors = [
    ["original", V.manifestFingerprintVector],
    ["categorylessTool", V.categorylessTool.manifestFingerprintVector],
    ["ordering", V.ordering.manifestFingerprintVector],
  ];
  for (const [name, vec] of vectors) {
    test(name, () => {
      const hashInput = { schemaVersion: vec.schemaVersion, siteId: vec.siteId, items: vec.items };
      assert.equal(canonicalJson(hashInput), vec.canonicalJson, `manifest hash input differs for "${name}"`);
      assert.equal(computeManifestFingerprint(vec.schemaVersion, vec.siteId, vec.items), vec.manifestFingerprint, `manifest fingerprint differs for "${name}"`);
    });
  }

  test("only id and sourceFingerprint of each item take part, in the given order", () => {
    const vec = V.manifestFingerprintVector;
    const padded = vec.items.map((i) => ({ ...i, title: "ignored", extra: 1 }));
    assert.equal(computeManifestFingerprint(vec.schemaVersion, vec.siteId, padded), vec.manifestFingerprint);
    const swapped = [vec.items[1], vec.items[0], ...vec.items.slice(2)];
    assert.notEqual(computeManifestFingerprint(vec.schemaVersion, vec.siteId, swapped), vec.manifestFingerprint);
  });
});

describe("whole-file byte vectors", () => {
  const files = [
    ["original", V.file, V.items.map((v) => ({ ...v.item, sourceFingerprint: v.fingerprint })), V.manifestFingerprintVector],
    ["categorylessTool", V.categorylessTool.file, [{ ...V.categorylessTool.item.item, sourceFingerprint: V.categorylessTool.item.fingerprint }], V.categorylessTool.manifestFingerprintVector],
    ["ordering", V.ordering.file, V.ordering.items.map((v) => ({ ...v.item, sourceFingerprint: v.fingerprint })), V.ordering.manifestFingerprintVector],
  ];
  for (const [name, file, expectedItems, fpVector] of files) {
    describe(name, () => {
      const parsed = JSON.parse(file.text);

      test("re-serializing the parsed file reproduces the text and the file hash", () => {
        assert.equal(serializeManifestFile(parsed), file.text, `serialized text differs for "${name}"`);
        const bytes = encodeManifestFile(parsed);
        assert.equal(Buffer.from(bytes).toString("utf8"), file.text);
        assert.equal(computeFileHash(bytes), file.sha256, `file hash differs for "${name}"`);
        assert.equal(isCanonicalManifestFileBytes(Buffer.from(file.text, "utf8")), true);
      });

      test("byte-level form: UTF-8, no BOM, LF only, two-space indent, one trailing newline", () => {
        const bytes = Buffer.from(file.text, "utf8");
        assert.notDeepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], "a BOM is forbidden");
        assert.equal(file.text.includes("\r"), false);
        assert.equal(file.text.endsWith("}\n") && !file.text.endsWith("\n\n"), true);
        assert.equal(file.text.includes("\t"), false);
        const indents = file.text.split("\n").filter((l) => l.length > 0).map((l) => l.length - l.trimStart().length);
        assert.ok(indents.every((n) => n % 2 === 0), "indentation is two spaces per level");
      });

      test("the manifest is rebuilt exactly from the item vectors and the envelope", () => {
        const rebuilt = {
          ...parsed,
          content: expectedItems,
          manifestFingerprint: computeManifestFingerprint(parsed.schemaVersion, parsed.site.id, expectedItems),
          counts: { tools: expectedItems.filter((i) => i.type === "tool").length, articles: expectedItems.filter((i) => i.type === "article").length },
        };
        assert.equal(serializeManifestFile(rebuilt), file.text, `rebuilt file differs for "${name}"`);
        assert.equal(parsed.manifestFingerprint, fpVector.manifestFingerprint);
      });

      test("every stored fingerprint recomputes and the items are in canonical order", () => {
        for (const item of parsed.content) assert.equal(computeItemFingerprint(item), item.sourceFingerprint, `${item.id} fingerprint`);
        assert.deepEqual(parsed.content.map((i) => i.id), sortItemsCanonical(parsed.content).map((i) => i.id));
        assert.deepEqual(findTextIssues(parsed), [], "the whole file must pass the character policy");
      });
    });
  }
});

describe("character-policy vectors", () => {
  const text = (codePoints) => String.fromCodePoint(...codePoints);
  for (const vec of V.characterPolicy.accepted) {
    test(`accepts: ${vec.name}`, () => {
      const s = text(vec.codePoints);
      assert.equal(hasForbiddenCharacter(s), false, `"${vec.name}" must be accepted`);
      assert.equal(hasForbiddenCharacter(`a${s}b`), false, `"${vec.name}" must be accepted inside text`);
    });
  }
  for (const vec of V.characterPolicy.rejected) {
    test(`rejects: ${vec.name}`, () => {
      const s = text(vec.codePoints);
      assert.equal(hasForbiddenCharacter(s), true, `"${vec.name}" must be rejected`);
      assert.equal(hasForbiddenCharacter(`a${s}b`), true, `"${vec.name}" must be rejected inside text`);
    });
  }
});

describe("number-text vectors", () => {
  const writes = (value) => {
    try {
      return canonicalJson(value);
    } catch {
      return null;
    }
  };
  for (const t of V.numbers.acceptedImageNumberTexts) {
    test(`accepts ${t}`, () => {
      assert.equal(isCanonicalImageNumberText(t), true);
      assert.equal(isValidImageNumber(Number(t)), true);
      assert.equal(writes(Number(t)), t, "a valid number is written as exactly this text");
    });
  }
  for (const t of V.numbers.rejectedImageNumberTexts) {
    test(`rejects ${t}`, () => {
      assert.equal(isCanonicalImageNumberText(t), false);
      let parsed;
      try {
        parsed = JSON.parse(t);
      } catch {
        return; // not even JSON: rejected before any number is formed
      }
      assert.equal(isValidImageNumber(parsed) && writes(parsed) === t, false, "must not be usable as image metadata in this text form");
    });
  }
});

describe("comparator cases", () => {
  for (const [i, c] of V.ordering.comparatorCases.entries()) {
    test(`case ${i + 1}`, () => {
      assert.deepEqual(sortContentIds(c.unsorted), c.sorted);
      assert.deepEqual(sortContentIds([...c.unsorted].reverse()), c.sorted);
      assert.deepEqual(sortContentIds(c.sorted), c.sorted);
    });
  }
});
