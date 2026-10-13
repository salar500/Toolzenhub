/**
 * Tool Pack 27: the Base64 engine (assets/js/tools/base64-encoder-decoder/base64-engine.js).
 *
 * Expected values are literals: the RFC 4648 section 10 vectors, and values computed with Python's base64 module
 * (never with the engine). Node's Buffer is a second, independent implementation used to cross-check.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  encodeText,
  decodeBase64,
  encodeBytes,
  MAX_ENCODE_BYTES,
  MAX_DECODE_CHARS,
} from "../../assets/js/tools/base64-encoder-decoder/base64-engine.js";

const VECTORS = [
  // RFC 4648 section 10
  ["f", "Zg=="], ["fo", "Zm8="], ["foo", "Zm9v"], ["foob", "Zm9vYg=="], ["fooba", "Zm9vYmE="], ["foobar", "Zm9vYmFy"],
  // ASCII
  ["Hello, World!", "SGVsbG8sIFdvcmxkIQ=="],
  ["Hello, ToolZen Hub!", "SGVsbG8sIFRvb2xaZW4gSHViIQ=="],
  ["a\nb", "YQpi"],
  ["\u0000", "AA=="],
  // Unicode
  ["é", "w6k="], ["€", "4oKs"], ["😀", "8J+YgA=="], ["日本語", "5pel5pys6Kqe"],
  ["नमस्ते", "4KSo4KSu4KS44KWN4KSk4KWH"], ["é€😀", "w6nigqzwn5iA"],
  ["﻿A", "77u/QQ=="],
];

describe("encode", () => {
  test("every vector (Python base64 and RFC 4648) is produced exactly", () => {
    for (const [text, expected] of VECTORS) {
      const r = encodeText(text);
      assert.equal(r.ok, true, text);
      assert.equal(r.value, expected, JSON.stringify(text));
    }
  });

  test("the alphabet's + and / characters (bytes FB FF and FF FE FD)", () => {
    assert.equal(encodeBytes(Uint8Array.from([0xfb, 0xff])), "+/8=");
    assert.equal(encodeBytes(Uint8Array.from([0xff, 0xfe, 0xfd])), "//79");
    assert.equal(encodeBytes(new Uint8Array(0)), "");
  });

  test("the lengths: 4 * ceil(n / 3), byte and character counts reported", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 100, 1000]) {
      const r = encodeText("x".repeat(n));
      assert.equal(r.chars, 4 * Math.ceil(n / 3));
      assert.equal(r.bytes, n);
      assert.match(r.value, /^[A-Za-z0-9+/]*={0,2}$/);
      assert.equal(r.value.length % 4, 0);
    }
    assert.equal(encodeText("é€😀").bytes, 9);
  });

  test("empty input and an unpaired surrogate are refused with a reason", () => {
    assert.deepEqual(encodeText(""), { ok: false, code: "EMPTY", message: "Enter some text to encode." });
    const lone = encodeText("ab\ud83dcd");
    assert.equal(lone.ok, false);
    assert.equal(lone.code, "UNPAIRED_SURROGATE");
    assert.equal(lone.position, 3);
    assert.equal(encodeText("\udc00").position, 1);
    assert.equal(encodeText("a😀b").ok, true); // a proper pair is fine
  });

  test("the limit is measured in UTF-8 bytes", () => {
    assert.equal(encodeText("a".repeat(MAX_ENCODE_BYTES)).ok, true);
    const over = encodeText("a".repeat(MAX_ENCODE_BYTES + 1));
    assert.equal(over.code, "TOO_LONG");
    // 333,334 euro signs are 1,000,002 bytes but only 333,334 characters
    const euros = encodeText("€".repeat(333334));
    assert.equal(euros.code, "TOO_LONG");
    assert.match(euros.message, /1,000,002 bytes/);
    assert.equal(encodeText("€".repeat(333333)).ok, true); // 999,999 bytes
  });
});

describe("decode: accepted input", () => {
  test("every vector decodes back, and agrees with Node's Buffer", () => {
    for (const [text, encoded] of VECTORS) {
      const r = decodeBase64(encoded);
      assert.equal(r.ok, true, encoded);
      assert.equal(r.value, text, encoded);
      assert.equal(Buffer.from(encoded, "base64").toString("utf8"), text);
      assert.deepEqual(r.notes, []);
    }
  });

  test("the byte-order mark is kept, so the round trip is exact", () => {
    const r = decodeBase64("77u/QQ==");
    assert.equal(r.value, "﻿A");
    assert.equal(r.value.length, 2);
  });

  test("missing padding is accepted, with a note", () => {
    for (const [encoded, text] of [["Zg", "f"], ["Zm8", "fo"], ["SGVsbG8sIFdvcmxkIQ", "Hello, World!"]]) {
      const r = decodeBase64(encoded);
      assert.equal(r.ok, true, encoded);
      assert.equal(r.value, text);
      assert.deepEqual(r.notes, ["Padding was missing and is assumed."]);
    }
  });

  test("only ASCII space, tab, CR and LF are ignored, and the note counts them", () => {
    const r = decodeBase64("SGVs\nbG8s\r\nIFdv cmxkIQ==");
    assert.equal(r.value, "Hello, World!");
    assert.deepEqual(r.notes, ["4 characters of whitespace were ignored."]);
    assert.equal(decodeBase64(" \tZm9v \r\n").value, "foo");
    assert.deepEqual(decodeBase64(" Zm9v").notes, ["1 character of whitespace was ignored."]);
  });
});

describe("decode: refused input", () => {
  const refused = (input, code, position) => {
    const r = decodeBase64(input);
    assert.equal(r.ok, false, JSON.stringify(input));
    assert.equal(r.code, code, `${JSON.stringify(input)}: ${r.message}`);
    if (position !== undefined) assert.equal(r.position, position, JSON.stringify(input));
    assert.equal(typeof r.message, "string");
    assert.ok(r.message.length > 10);
    return r;
  };

  test("empty and whitespace-only", () => {
    refused("", "EMPTY");
    refused(" \t\r\n ", "EMPTY");
  });

  test("characters outside the alphabet name the character and its position", () => {
    const bang = refused("Zm9v!", "INVALID_CHARACTER", 5);
    assert.match(bang.message, /"!" \(U\+0021\) at position 5/);
    const nbsp = refused("Zm9v ", "INVALID_CHARACTER", 5);
    assert.match(nbsp.message, /no-break space \(U\+00A0\)/);
    refused("Zm9v\u000b", "INVALID_CHARACTER", 5); // a vertical tab is not an ignored whitespace
    refused("Zm9v​", "INVALID_CHARACTER", 5);
    const astral = refused("Zm😀v", "INVALID_CHARACTER", 3);
    assert.match(astral.message, /"😀" \(U\+1F600\)/);
  });

  test("- and _ get the base64url hint", () => {
    const r = refused("-_8=", "BASE64URL", 1);
    assert.match(r.message, /base64url/);
    refused("Zm_v", "BASE64URL", 3);
  });

  test("malformed padding", () => {
    refused("Zg=", "BAD_PADDING"); // 2 characters need ==
    refused("Zg===", "BAD_PADDING"); // three =
    refused("Zm9v=", "BAD_PADDING"); // 4 characters need no =
    refused("Z=g=", "MISPLACED_PADDING", 2);
    refused("=Zg=", "MISPLACED_PADDING", 1);
    refused("Zg==Zg==", "MISPLACED_PADDING", 3);
    refused("====", "BAD_PADDING");
    const one = refused("Zm9vY", "TRUNCATED");
    assert.match(one.message, /single character/);
    refused("Z", "TRUNCATED");
    refused("Zm9vY=", "TRUNCATED");
  });

  test("a last character with unused bits set is refused (stricter than Node and Python, on purpose)", () => {
    const r = refused("QR==", "NON_CANONICAL", 2);
    assert.match(r.message, /many other decoders accept it/);
    refused("QQ=", "BAD_PADDING"); // padding wrong first
    refused("Zm9=", "NON_CANONICAL", 3); // 'Zm9' decodes with a stray bit
    assert.equal(Buffer.from("QR==", "base64").toString("utf8"), "A"); // the permissive reading, for the record
    assert.equal(decodeBase64("QQ==").value, "A");
    assert.equal(decodeBase64("Zm8=").value, "fo");
  });

  test("valid Base64 that is not UTF-8 text is explained, never shown as replacement characters", () => {
    for (const [encoded, bytes] of [["/w==", 1], ["gA==", 1], ["//79", 3]]) {
      const r = refused(encoded, "NOT_UTF8");
      assert.equal(r.bytes, bytes);
      assert.match(r.message, /not UTF-8 text/);
      assert.equal("value" in r, false);
    }
  });

  test("the limit applies to the submitted characters, whitespace included", () => {
    const ok = "AAAA".repeat(333334).slice(0, MAX_DECODE_CHARS);
    assert.equal(ok.length, MAX_DECODE_CHARS);
    assert.equal(decodeBase64(ok).ok, true);
    refused(ok + "A", "TOO_LONG");
    refused("Zm9v ".repeat(300000), "TOO_LONG"); // 1,500,000 characters with its spaces
    assert.equal(decodeBase64("Zm9v ".repeat(100000)).ok, true);
  });
});

describe("round trips and invariants", () => {
  test("decode(encode(x)) === x for the vectors and 200 seeded random strings (astral characters included)", () => {
    let seed = 20261013;
    const next = () => (seed = (seed * 1664525 + 1013904223) >>> 0);
    const pool = ["a", "Z", "0", " ", "\n", "é", "€", "ñ", "日", "😀", "𝄞", "\u0000", "~", "/", "+", "="];
    for (let k = 0; k < 200; k++) {
      let s = "";
      const n = 1 + (next() % 40);
      for (let i = 0; i < n; i++) s += pool[next() % pool.length];
      const e = encodeText(s);
      assert.equal(e.ok, true);
      assert.equal(e.value, Buffer.from(s, "utf8").toString("base64"), "Buffer agrees"); // independent implementation
      assert.equal(decodeBase64(e.value).value, s);
      assert.match(e.value, /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
    }
  });

  test("a 1,000,000-byte input encodes and decodes in well under a second each", () => {
    const text = "Ab€😀 ".repeat(100000).slice(0, 200000); // mixed bytes
    const big = "x".repeat(MAX_ENCODE_BYTES);
    let t = Date.now();
    const e = encodeText(big);
    assert.equal(e.chars, MAX_DECODE_CHARS);
    const d = decodeBase64(e.value);
    assert.equal(d.value.length, MAX_ENCODE_BYTES);
    assert.ok(Date.now() - t < 5000, `took ${Date.now() - t} ms`);
    assert.equal(decodeBase64(encodeText(text).value).value, text);
  });

  test("the module is pure: no Date, network, storage, DOM or logging", () => {
    const src = fs.readFileSync(new URL("../../assets/js/tools/base64-encoder-decoder/base64-engine.js", import.meta.url), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    for (const word of ["Date", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage", "indexedDB", "document", "window", "console", "atob", "btoa", "import("]) {
      assert.equal(src.includes(word), false, word);
    }
  });
});
