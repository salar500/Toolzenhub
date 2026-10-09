/**
 * G3C-B1: behavior of the canonical core beyond the golden vectors: ordering hazards, strict number and value
 * refusals, the file acceptance check, content-id order, determinism and source hygiene.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  IMAGE_NUMBER_MAX,
  canonicalJson,
  compareContentIds,
  computeFileHash,
  computeItemFingerprint,
  encodeManifestFile,
  isCanonicalManifestFileBytes,
  isValidContentId,
  isValidImageNumber,
  serializeManifestFile,
  sha256Hex,
  sortContentIds,
} from "../../scripts/growth-manifest/canonical.mjs";

const MODULE_DIR = new URL("../../scripts/growth-manifest/", import.meta.url);
const CANONICAL_URL = new URL("canonical.mjs", MODULE_DIR).href;
const FIXTURE = JSON.parse(fs.readFileSync(new URL("../fixtures/growth-manifest/golden-vectors.json", import.meta.url), "utf8"));

describe("key ordering", () => {
  test("sorts by UTF-16 code unit, not by locale", () => {
    assert.equal(canonicalJson({ b: 1, B: 2, a: 3, _: 4, "\u00e9": 5, e: 6 }), '{"B":2,"_":4,"a":3,"b":1,"e":6,"\u00e9":5}');
  });

  test("integer-like keys are sorted as text, not hoisted the way a JavaScript object enumerates them", () => {
    const value = { b: 1, 9: 2, 10: 3 };
    assert.deepEqual(Object.keys(value), ["9", "10", "b"], "premise: the engine hoists integer-like keys");
    assert.equal(canonicalJson(value), '{"10":3,"9":2,"b":1}');
    assert.equal(serializeManifestFile(value), '{\n  "10": 3,\n  "9": 2,\n  "b": 1\n}\n');
  });

  test("code-unit order differs from code-point order for astral keys, and code-unit order wins", () => {
    const astral = String.fromCodePoint(0x1f600); // surrogate pair D83D DE00
    const bmpHigh = "\uff5e"; // U+FF5E: a higher code point, but a higher code unit than D83D
    assert.equal(canonicalJson({ [bmpHigh]: 1, [astral]: 2 }), `{${JSON.stringify(astral)}:2,${JSON.stringify(bmpHigh)}:1}`);
  });

  test("nested objects are sorted at every level; arrays keep their order", () => {
    assert.equal(canonicalJson({ z: [{ b: 1, a: 2 }, 3, "x"], a: { d: null, c: true } }), '{"a":{"c":true,"d":null},"z":[{"a":2,"b":1},3,"x"]}');
  });

  test("a null-prototype object is accepted", () => {
    const o = Object.assign(Object.create(null), { b: 1, a: 2 });
    assert.equal(canonicalJson(o), '{"a":2,"b":1}');
  });
});

describe("file layout", () => {
  test("matches JSON.stringify(value, null, 2) plus one newline for ordinary data", () => {
    const value = { content: [], counts: { articles: 0, tools: 0 }, nested: { a: [1, [2, 3], {}], b: "x\ny" }, schemaVersion: 1 };
    assert.equal(serializeManifestFile(value), JSON.stringify(value, null, 2) + "\n");
  });

  test("empty array and empty object are written compactly", () => {
    assert.equal(serializeManifestFile({ a: [], b: {} }), '{\n  "a": [],\n  "b": {}\n}\n');
    assert.equal(serializeManifestFile([]), "[]\n");
  });

  test("encodes as UTF-8 without a BOM, keeping non-ASCII text raw", () => {
    const bytes = encodeManifestFile({ t: "\u0c24\u0c46" });
    assert.equal(Buffer.from(bytes).toString("utf8"), '{\n  "t": "\u0c24\u0c46"\n}\n');
    assert.equal(bytes[0], 0x7b);
    assert.deepEqual([...bytes.subarray(10, 16)], [0xe0, 0xb0, 0xa4, 0xe0, 0xb1, 0x86]);
  });

  test("escapes quotes, backslashes and control characters per JSON", () => {
    assert.equal(canonicalJson("a\"b\\c\n\t\u0001"), '"a\\"b\\\\c\\n\\t\\u0001"');
  });
});

describe("strict values", () => {
  const refuse = (value, pattern) => assert.throws(() => canonicalJson(value), pattern);

  test("refuses anything that is not a safe integer number", () => {
    for (const n of [NaN, Infinity, -Infinity, 1.5, 0.1, -0, 2 ** 53, -(2 ** 53), 1e21]) refuse({ n }, RangeError);
  });

  test("accepts safe integers in plain decimal digits", () => {
    assert.equal(canonicalJson([0, 1, -1, 1200, 9007199254740991]), "[0,1,-1,1200,9007199254740991]");
  });

  test("refuses values that are not JSON-safe", () => {
    for (const bad of [undefined, () => 1, Symbol("s"), 10n]) refuse({ bad }, TypeError);
    refuse({ date: new Date(0) }, TypeError);
    refuse({ map: new Map() }, TypeError);
    refuse(new (class Thing {})(), TypeError);
    refuse([1, , 3], TypeError); // eslint-disable-line no-sparse-arrays
  });

  test("names the path of the offending value", () => {
    assert.throws(() => canonicalJson({ a: { b: [0, 1.5] } }), /a\.b\[1\]/);
  });

  test("refuses unsafe keys the consumer rejects", () => {
    for (const key of ["__proto__", "constructor", "prototype"]) {
      const o = {};
      Object.defineProperty(o, key, { value: 1, enumerable: true });
      refuse(o, TypeError);
    }
  });

  test("refuses a cycle instead of recursing forever", () => {
    const a = [];
    a.push(a);
    refuse(a, RangeError);
  });
});

describe("manifest file acceptance check", () => {
  const good = serializeManifestFile({ a: 1, b: [1, 2] });
  const bytes = (s) => Buffer.from(s, "utf8");

  test("accepts the canonical form", () => assert.equal(isCanonicalManifestFileBytes(bytes(good)), true));

  test("rejects every deviation the consumer rejects", () => {
    const cases = {
      "BOM": "\ufeff" + good,
      "CRLF": good.replace(/\n/g, "\r\n"),
      "missing trailing newline": good.slice(0, -1),
      "extra trailing newline": good + "\n",
      "tab indentation": good.replace(/ {2}/g, "\t"),
      "four-space indentation": JSON.stringify({ a: 1, b: [1, 2] }, null, 4) + "\n",
      "minified": JSON.stringify({ a: 1, b: [1, 2] }) + "\n",
      "reordered keys": '{\n  "b": [\n    1,\n    2\n  ],\n  "a": 1\n}\n',
      "duplicate key": '{\n  "a": 1,\n  "a": 1\n}\n',
      "non-canonical number": good.replace('"a": 1', '"a": 1.0'),
      "negative zero": good.replace('"a": 1', '"a": -0'),
      "not JSON": "{",
    };
    for (const [name, text] of Object.entries(cases)) assert.equal(isCanonicalManifestFileBytes(bytes(text)), false, name);
  });

  test("rejects bytes that are not valid UTF-8", () => {
    assert.equal(isCanonicalManifestFileBytes(Uint8Array.from([0x7b, 0xff, 0x7d, 0x0a])), false);
  });
});

describe("fingerprints", () => {
  const item = FIXTURE.items[0].item;

  test("is sha256 of the canonical JSON, prefixed, without sourceFingerprint", () => {
    assert.equal(computeItemFingerprint(item), "sha256:" + sha256Hex(canonicalJson(item)));
    assert.match(computeItemFingerprint(item), /^sha256:[0-9a-f]{64}$/);
  });

  test("any content change changes it", () => {
    for (const key of Object.keys(item)) {
      const changed = { ...item, [key]: item[key] === null ? "x" : typeof item[key] === "boolean" ? !item[key] : Array.isArray(item[key]) ? [...item[key], "tool:zz"] : item[key] + "!" };
      assert.notEqual(computeItemFingerprint(changed), computeItemFingerprint(item), key);
    }
  });

  test("rejects a non-object item", () => {
    for (const bad of [null, [], "x", 1]) assert.throws(() => computeItemFingerprint(bad), TypeError);
  });

  test("the file hash is the bare lowercase hex SHA-256 of the bytes", () => {
    assert.equal(computeFileHash(Buffer.from("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("content ids and ordering", () => {
  test("validates the identity forms", () => {
    for (const ok of ["tool:a", "tool:json-formatter", "tool:A.b_c-1", "article:1", "article:100", "article:9007199254740991"]) assert.equal(isValidContentId(ok), true, ok);
    for (const bad of ["", "tool:", "tool:-a", "tool:a b", "tool:a/b", "article:0", "article:01", "article:-1", "article:1.5", "article:1234567890123456789", "page:1", "tool", ":a", null, 1]) assert.equal(isValidContentId(bad), false, String(bad));
  });

  test("tools first by code unit, articles numerically", () => {
    assert.deepEqual(sortContentIds(["article:100", "tool:b", "article:9", "tool:B", "tool:a-b", "article:10", "tool:a"]), ["tool:B", "tool:a", "tool:a-b", "tool:b", "article:9", "article:10", "article:100"]);
  });

  test("is a consistent total order", () => {
    const ids = ["tool:a", "tool:b", "article:1", "article:2", "article:10"];
    for (const x of ids) {
      assert.equal(compareContentIds(x, x), 0);
      for (const y of ids) assert.equal(Math.sign(compareContentIds(x, y)) + Math.sign(compareContentIds(y, x)), 0);
    }
  });

  test("sorting returns a new array and does not touch the input", () => {
    const input = ["tool:b", "tool:a"];
    assert.deepEqual(sortContentIds(input), ["tool:a", "tool:b"]);
    assert.deepEqual(input, ["tool:b", "tool:a"]);
  });

  test("an invalid id throws instead of being sorted silently", () => {
    assert.throws(() => compareContentIds("tool:a", "article:01"), TypeError);
    assert.throws(() => sortContentIds(["tool:a", "oops"]), TypeError);
  });
});

describe("image numbers", () => {
  test("bounds", () => {
    assert.equal(IMAGE_NUMBER_MAX, 1000000);
    for (const n of [0, 1, 1200, 1000000]) assert.equal(isValidImageNumber(n), true, String(n));
    for (const n of [-1, -0, 1.5, 1000001, NaN, Infinity, 2 ** 53, "1", null]) assert.equal(isValidImageNumber(n), false, String(n));
  });
});

describe("determinism", () => {
  const manifest = JSON.parse(FIXTURE.ordering.file.text);

  test("repeated serialization in one process is byte-identical", () => {
    const first = computeFileHash(encodeManifestFile(manifest));
    for (let i = 0; i < 25; i++) assert.equal(computeFileHash(encodeManifestFile(JSON.parse(JSON.stringify(manifest)))), first);
    assert.equal(first, FIXTURE.ordering.file.sha256);
  });

  test("independent of locale, time zone and process (separate Node processes)", () => {
    const script = `import { readFileSync } from "node:fs"; import { encodeManifestFile, computeFileHash } from ${JSON.stringify(CANONICAL_URL)};
      const v = JSON.parse(readFileSync(${JSON.stringify(fileURLToPath(new URL("../fixtures/growth-manifest/golden-vectors.json", import.meta.url)))}, "utf8"));
      const reversed = (o) => Array.isArray(o) ? o.map(reversed) : o && typeof o === "object" ? Object.fromEntries(Object.entries(o).reverse().map(([k, x]) => [k, reversed(x)])) : o;
      process.stdout.write(computeFileHash(encodeManifestFile(reversed(JSON.parse(v.ordering.file.text)))));`;
    const hashes = new Set();
    for (const env of [{ TZ: "UTC", LC_ALL: "C", LANG: "C" }, { TZ: "Pacific/Kiritimati", LC_ALL: "tr_TR.UTF-8", LANG: "tr_TR.UTF-8" }, { TZ: "America/Los_Angeles", LC_ALL: "de_DE.UTF-8", LANG: "de_DE.UTF-8" }]) {
      hashes.add(execFileSync(process.execPath, ["--input-type=module", "-e", script], { env: { ...process.env, ...env }, encoding: "utf8" }));
    }
    assert.deepEqual([...hashes], [FIXTURE.ordering.file.sha256]);
  });
});

describe("module hygiene", () => {
  test("the new test sources are ASCII-only too (invisible characters are written as escapes)", () => {
    const dir = new URL(".", import.meta.url);
    const names = fs.readdirSync(dir).filter((n) => /^growth-manifest-.*[.]test[.]mjs$/.test(n));
    assert.ok(names.length >= 4);
    for (const f of names) {
      for (const ch of fs.readFileSync(new URL(f, dir), "utf8")) assert.ok(ch === "\n" || (ch >= " " && ch <= "~"), `unexpected character U+${ch.codePointAt(0).toString(16)} in ${f}`);
    }
  });

  const files = fs.readdirSync(MODULE_DIR).filter((f) => f.endsWith(".mjs"));

  test("the producer core exists as expected", () => {
    assert.deepEqual(files.sort(), ["canonical.mjs", "items.mjs", "ledger.mjs", "registry.mjs", "source-time.mjs", "text-policy.mjs", "validate.mjs"]);
  });

  for (const f of ["canonical.mjs", "source-time.mjs", "text-policy.mjs", "items.mjs", "validate.mjs", "registry.mjs", "ledger.mjs"]) {
    const source = fs.readFileSync(new URL(f, MODULE_DIR), "utf8");
    test(`${f}: ASCII-only source, built-in imports only, no clock, randomness or locale APIs`, () => {
      for (const ch of source) assert.ok(ch === "\n" || (ch >= " " && ch <= "~"), `unexpected character U+${ch.codePointAt(0).toString(16)} in ${f}`);
      for (const m of source.matchAll(/^import .* from "([^"]+)";?$/gm)) assert.ok(m[1].startsWith("node:") || /^[.][/][a-z-]+[.]mjs$/.test(m[1]), `${f} may import only Node built-ins and sibling modules`);
      const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      for (const forbidden of ["Date.now", "new Date()", "performance.now", "Math.random", "localeCompare", "toLocale", "Intl.", "process.env", "process.argv", "require("]) {
        assert.equal(code.includes(forbidden), false, `${f} must not use ${forbidden}`);
      }
    });
  }
});
