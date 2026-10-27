/**
 * Base64URL mode of the Base64 engine (Tool Pack 27 addendum, FR-B64-001..006).
 *
 * Oracles: RFC 4648 section 10 vectors and hand-derived bit patterns (written as literals), and Node's own
 * Buffer "base64url" codec as a second, independent implementation for a seeded round-trip corpus.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { encodeText, decodeBase64 } from "../../assets/js/tools/base64-encoder-decoder/base64-engine.js";

const URL_SAFE = { urlSafe: true };
const KEEP = { urlSafe: true, keepPadding: true };

test("hand-derived examples: ??? and >>> use + / and - _ ; fo drops its padding by default", () => {
    assert.equal(encodeText("???").value, "Pz8/");
    assert.equal(encodeText("???", URL_SAFE).value, "Pz8_");
    assert.equal(encodeText(">>>").value, "Pj4+");
    assert.equal(encodeText(">>>", URL_SAFE).value, "Pj4-");
    assert.equal(encodeText("fo").value, "Zm8=");
    assert.equal(encodeText("fo", URL_SAFE).value, "Zm8");
    assert.equal(encodeText("fo", KEEP).value, "Zm8=");
    assert.equal(encodeText("f", URL_SAFE).value, "Zg");
    assert.equal(encodeText("f", KEEP).value, "Zg==");
});

test("RFC 4648 section 10 vectors: unchanged in the standard alphabet and the same in URL-safe without padding", () => {
    const vectors = [["f", "Zg=="], ["fo", "Zm8="], ["foo", "Zm9v"], ["foob", "Zm9vYg=="], ["fooba", "Zm9vYmE="], ["foobar", "Zm9vYmFy"]];
    for (const [text, std] of vectors) {
        assert.equal(encodeText(text).value, std);
        assert.equal(encodeText(text, URL_SAFE).value, std.replace(/=+$/, ""));
        assert.equal(encodeText(text, KEEP).value, std);
        assert.equal(decodeBase64(std, URL_SAFE).value, text);
        assert.equal(decodeBase64(std.replace(/=+$/, ""), URL_SAFE).value, text);
    }
});

test("URL-safe decoding reads - and _, with padding optional but correct when present", () => {
    assert.equal(decodeBase64("Pz8_", URL_SAFE).value, "???");
    assert.equal(decodeBase64("Pj4-", URL_SAFE).value, ">>>");
    assert.equal(decodeBase64("Zm8", URL_SAFE).notes.length, 0);
    assert.equal(decodeBase64("Zg=", URL_SAFE).code, "BAD_PADDING");
    assert.equal(decodeBase64("Zg===", URL_SAFE).code, "BAD_PADDING");
    assert.equal(decodeBase64("Z", URL_SAFE).code, "TRUNCATED");
    assert.equal(decodeBase64("Zm9vY", URL_SAFE).code, "TRUNCATED");
    assert.equal(decodeBase64("QR", URL_SAFE).code, "NON_CANONICAL");
    assert.equal(decodeBase64("Z=g=", URL_SAFE).code, "MISPLACED_PADDING");
});

test("each alphabet refuses the other's characters with a hint to switch (FR-B64-004, FR-B64-005)", () => {
    const std = decodeBase64("-_8=");
    assert.equal(std.code, "BASE64URL");
    assert.equal(std.position, 1);
    assert.match(std.message, /Switch the alphabet to URL-safe\./);
    assert.doesNotMatch(std.message, /standard Base64 only/);
    const url = decodeBase64("Pz8/", URL_SAFE);
    assert.equal(url.code, "STANDARD_BASE64");
    assert.equal(url.position, 4);
    assert.match(url.message, /This looks like standard Base64\. Switch the alphabet to Standard\./);
    assert.equal(decodeBase64("a+b", URL_SAFE).position, 2);
    assert.equal(decodeBase64("a b!", URL_SAFE).code, "INVALID_CHARACTER");
    assert.match(decodeBase64("a b!", URL_SAFE).message, /A-Z, a-z, 0-9, - and _/);
});

test("standard mode is byte-for-byte unchanged when no option is given or when urlSafe is false", () => {
    for (const text of ["", "x", "héllo €😀", "???>>>", "a".repeat(1000)]) {
        if (text === "") continue;
        assert.deepEqual(encodeText(text), encodeText(text, {}));
        assert.deepEqual(encodeText(text), encodeText(text, { urlSafe: false, keepPadding: true }));
    }
    assert.equal(decodeBase64("Zm8").notes[0], "Padding was missing and is assumed.");
});

function mulberry32(seed) {
    return () => {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

test("round trip and agreement with Node's base64url over a seeded corpus (seed 4648)", () => {
    const rnd = mulberry32(4648);
    const pool = ["a", "Z", "?", ">", "~", "é", "€", "😀", "日", " ", "\n", "\u0000", "/", "+", "-", "_", "="];
    for (let n = 0; n < 500; n++) {
        const len = 1 + Math.floor(rnd() * 40);
        let text = "";
        for (let i = 0; i < len; i++) text += pool[Math.floor(rnd() * pool.length)];
        const bare = encodeText(text, URL_SAFE);
        const kept = encodeText(text, KEEP);
        const node = Buffer.from(text, "utf8").toString("base64url");
        assert.equal(bare.value, node, JSON.stringify(text));
        assert.equal(kept.value, node + "=".repeat((4 - (node.length % 4)) % 4));
        assert.equal(decodeBase64(bare.value, URL_SAFE).value, text);
        assert.equal(decodeBase64(kept.value, URL_SAFE).value, text);
        assert.equal(Buffer.from(bare.value, "base64url").toString("utf8"), text);
    }
});

test("limits and UTF-8 handling are unchanged in URL-safe mode", () => {
    assert.equal(encodeText("\ud800", URL_SAFE).code, "UNPAIRED_SURROGATE");
    assert.equal(encodeText("a".repeat(1000001), URL_SAFE).code, "TOO_LONG");
    assert.equal(decodeBase64("_w", URL_SAFE).code, "NOT_UTF8");
    assert.equal(decodeBase64("x".repeat(1333337), URL_SAFE).code, "TOO_LONG");
    assert.equal(decodeBase64("", URL_SAFE).code, "EMPTY");
});
