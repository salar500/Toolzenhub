/**
 * Tool Pack 39: the UUID Generator engine.
 *
 * Oracles: hand-derived byte layouts from RFC 9562 (fixed random bytes in, exact text out), Node's
 * own crypto.randomUUID as an independent v4 shape check, and sort order of a generated batch.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { randomFillSync, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { generate, inspect, formatUuid, toCanonical, v4, v7Batch, nil, MAX_COUNT } from "../../assets/js/tools/uuid-generator/uuid-engine.js";

const fixed = (byte) => (n) => new Uint8Array(n).fill(byte);
const real = (n) => randomFillSync(new Uint8Array(n));
const RE = {
    v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    v7: /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
};

test("v4: version and variant bits are forced over any random bytes (all 0x00, all 0xff)", () => {
    assert.equal(toCanonical(v4(fixed(0x00))), "00000000-0000-4000-8000-000000000000");
    assert.equal(toCanonical(v4(fixed(0xff))), "ffffffff-ffff-4fff-bfff-ffffffffffff");
});

test("v4 matches the shape Node's randomUUID produces, over many real draws", () => {
    assert.match(randomUUID(), RE.v4);
    for (let i = 0; i < 2000; i++) assert.match(toCanonical(v4(real)), RE.v4);
});

test("nil is 128 zero bits", () => {
    assert.equal(generate({ version: "nil", count: 2 }).uuids.join(), "00000000-0000-0000-0000-000000000000,00000000-0000-0000-0000-000000000000");
    assert.equal(toCanonical(nil()), "00000000-0000-0000-0000-000000000000");
});

test("v7: hand-derived layout for a fixed clock and fixed random bytes", () => {
    /* ts = 0x018F_0000_0001 ms; counter seed bytes [1,0] -> 1; rand_b bytes all 0xff */
    const ts = 0x018f00000001;
    const rb = (n) => (n === 2 ? Uint8Array.of(1, 0) : new Uint8Array(n).fill(0xff));
    const [a, b] = v7Batch(2, () => ts, rb).map(toCanonical);
    assert.equal(a, "018f0000-0001-7001-bfff-ffffffffffff");
    assert.equal(b, "018f0000-0001-7002-bfff-ffffffffffff");
});

test("v7: the timestamp round-trips through inspect, and fields are in the RFC positions", () => {
    const now = 1735689600123;
    for (const u of generate({ version: "v7", count: 20 }, { randomBytes: real, now: () => now }).uuids) {
        assert.match(u, RE.v7);
        const info = inspect(u);
        assert.equal(info.valid, true);
        assert.equal(info.version, 7);
        assert.equal(info.variant, "RFC 9562");
        assert.equal(info.timestampMs, now);
    }
});

test("v7: a batch of 1000 sorts in creation order as text and as bytes (one millisecond)", () => {
    const r = generate({ version: "v7", count: 1000 }, { randomBytes: real, now: () => 1735689600000 });
    assert.deepEqual([...r.uuids].sort(), r.uuids);
    assert.equal(new Set(r.uuids).size, 1000);
});

test("v7: counter rollover moves the timestamp one millisecond ahead and stays sorted", () => {
    const rb = (n) => (n === 2 ? Uint8Array.of(255, 7) : real(n)); /* seed 2047 every time: 2049 values (2047..4095) per millisecond */
    const list = v7Batch(5000, () => 1000, rb).map(toCanonical);
    assert.deepEqual([...list].sort(), list);
    assert.equal(new Set(list).size, 5000);
    const stamps = list.map((u) => inspect(u).timestampMs);
    assert.ok(stamps.every((t, i) => i === 0 || t >= stamps[i - 1]));
    const per = (t) => stamps.filter((x) => x === t).length;
    assert.deepEqual([per(1000), per(1001), per(1002)], [2049, 2049, 902]);
});

test("v7: a clock outside 48 bits or not a number is refused with a message", () => {
    for (const bad of [-1, NaN, 2 ** 48, Infinity]) {
        const r = generate({ version: "v7", count: 1 }, { randomBytes: real, now: () => bad });
        assert.equal(r.ok, false, String(bad));
        assert.match(r.message, /clock/);
    }
});

test("formatting: hyphens, case and braces combine; the value is the same UUID", () => {
    const c = "0123abcd-4567-4890-a123-456789abcdef";
    assert.equal(formatUuid(c, {}), c);
    assert.equal(formatUuid(c, { uppercase: true }), "0123ABCD-4567-4890-A123-456789ABCDEF");
    assert.equal(formatUuid(c, { hyphens: false }), "0123abcd45674890a123456789abcdef");
    assert.equal(formatUuid(c, { braces: true, uppercase: true, hyphens: false }), "{0123ABCD45674890A123456789ABCDEF}");
    for (const o of [{}, { uppercase: true }, { hyphens: false }, { braces: true }]) assert.equal(inspect(formatUuid(c, o)).valid, true);
});

test("generate: counts and versions are validated; no random source is an error, never a weak fallback", () => {
    assert.equal(generate({ version: "v4", count: 0 }, { randomBytes: real }).ok, false);
    assert.equal(generate({ version: "v4", count: MAX_COUNT + 1 }, { randomBytes: real }).ok, false);
    assert.equal(generate({ version: "v4", count: 1.5 }, { randomBytes: real }).ok, false);
    assert.equal(generate({ version: "v4", count: MAX_COUNT }, { randomBytes: real }).uuids.length, MAX_COUNT);
    assert.equal(generate({ version: "v9", count: 1 }, { randomBytes: real }).ok, false);
    const none = generate({ version: "v4", count: 1 }, {});
    assert.equal(none.ok, false);
    assert.match(none.message, /secure random/);
    assert.equal(generate({}, { randomBytes: real }).uuids.length, 5);
});

test("v4: 20,000 draws have no duplicate and unbiased version/variant/bit balance", () => {
    const seen = new Set();
    let ones = 0;
    for (let i = 0; i < 20000; i++) {
        const u = toCanonical(v4(real));
        assert.equal(seen.has(u), false);
        seen.add(u);
        for (const ch of u.replaceAll("-", "").slice(13)) ones += (parseInt(ch, 16).toString(2).match(/1/g) || []).length;
    }
    const bits = 20000 * 19 * 4;
    assert.ok(Math.abs(ones / bits - 0.5) < 0.01, `ones ratio ${ones / bits}`);
});

test("inspect: rejects malformed text and reads v4, nil and braces", () => {
    assert.equal(inspect("not-a-uuid").valid, false);
    assert.equal(inspect("0123abcd-4567-4890-a123-456789abcde").valid, false);
    assert.equal(inspect("{0123ABCD-4567-4890-A123-456789ABCDEF}").version, 4);
    assert.equal(inspect("00000000-0000-0000-0000-000000000000").version, 0);
});

test("the engine is pure: no clock, randomness, DOM, network, storage or code execution", () => {
    const code = readFileSync(new URL("../../assets/js/tools/uuid-generator/uuid-engine.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const banned of ["fetch(", "XMLHttpRequest", "document.", "window.", "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "crypto.", "innerHTML", "setTimeout"]) {
        assert.ok(!code.includes(banned), `engine must not contain ${banned}`);
    }
});
