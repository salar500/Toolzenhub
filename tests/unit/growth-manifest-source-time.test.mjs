/**
 * G3C-B1: generatedAt from an explicitly supplied Git committer time. The function is pure: these tests also prove it
 * never consults the wall clock.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { MAX_FUTURE_SKEW_MS, formatCommitterTime, isManifestTimestamp, parseCommitterTime } from "../../scripts/growth-manifest/source-time.mjs";

// Literal captured from `git log -1 --format=%ct` of the website at 01893570 (committed 2026-10-08T18:54:20+05:30).
const HEAD_COMMITTER_EPOCH = 1791465860;
const HEAD_GENERATED_AT = "2026-10-08T13:24:20.000Z";
const NOW = 1791500000000; // an explicit reference instant, not the real clock

describe("formatting", () => {
  test("a known committer time becomes the documented UTC instant with milliseconds", () => {
    assert.equal(formatCommitterTime(HEAD_COMMITTER_EPOCH, { nowMs: NOW }), HEAD_GENERATED_AT);
    assert.equal(formatCommitterTime(String(HEAD_COMMITTER_EPOCH), { nowMs: NOW }), HEAD_GENERATED_AT);
  });

  test("known conversions", () => {
    const at = (s) => formatCommitterTime(s, { nowMs: 253402300799000 });
    assert.equal(at(0), "1970-01-01T00:00:00.000Z");
    assert.equal(at("0"), "1970-01-01T00:00:00.000Z");
    assert.equal(at(1), "1970-01-01T00:00:01.000Z");
    assert.equal(at(951782400), "2000-02-29T00:00:00.000Z");
    assert.equal(at(1709164799), "2024-02-28T23:59:59.000Z");
    assert.equal(at(253402300799), "9999-12-31T23:59:59.000Z");
  });

  test("the result is always a valid manifest timestamp", () => {
    for (const s of [0, 1, 86399, 1791465860, 2147483648, 4102444800, 253402300799]) assert.equal(isManifestTimestamp(formatCommitterTime(s, { nowMs: 253402300799000 })), true, String(s));
  });

  test("returns the parsed seconds as well", () => {
    assert.deepEqual(parseCommitterTime("1791465860", { nowMs: NOW }), { ok: true, epochSeconds: 1791465860, iso: HEAD_GENERATED_AT });
  });
});

describe("refusals", () => {
  const bad = (raw, options = { nowMs: NOW }) => {
    const r = parseCommitterTime(raw, options);
    assert.equal(r.ok, false, `expected ${typeof raw === "bigint" ? raw + "n" : String(raw)} to be refused`);
    assert.ok(r.reason.length > 0);
    assert.throws(() => formatCommitterTime(raw, options), RangeError);
    return r.reason;
  };

  test("malformed text", () => {
    for (const raw of ["", " 1", "1 ", "+1", "-1", "01", "00", "-0", "1.5", "1e9", "0x10", "1,000", "\u0661\u0662\u0663", "1791465860\n", "9999999999999"]) bad(raw);
  });

  test("not a whole positive number of seconds", () => {
    for (const raw of [-0, -1, 1.5, NaN, Infinity, -Infinity, 2 ** 53]) bad(raw);
  });

  test("not a string or a number", () => {
    for (const raw of [null, undefined, {}, [], 10n, true, new Date(1791465860000)]) bad(raw);
  });

  test("beyond the representable year", () => {
    bad(253402300800, { nowMs: 1e15 });
    assert.match(bad("253402300800", { nowMs: 1e15 }), /9999/);
  });

  test("the reference instant is mandatory and must be finite", () => {
    for (const options of [{}, { nowMs: undefined }, { nowMs: NaN }, { nowMs: Infinity }, { nowMs: "1791500000000" }, { nowMs: null }]) bad(HEAD_COMMITTER_EPOCH, options);
    assert.equal(parseCommitterTime(HEAD_COMMITTER_EPOCH).ok, false, "no options object at all");
    assert.throws(() => formatCommitterTime(HEAD_COMMITTER_EPOCH), RangeError);
  });
});

describe("future timestamps follow the consumer's 24-hour tolerance", () => {
  const now = 1791500000000;
  const edge = now / 1000 + MAX_FUTURE_SKEW_MS / 1000;

  test("the tolerance is 24 hours", () => assert.equal(MAX_FUTURE_SKEW_MS, 86400000));

  test("exactly 24 hours ahead is accepted, one second more is refused", () => {
    assert.equal(parseCommitterTime(edge, { nowMs: now }).ok, true);
    const refused = parseCommitterTime(edge + 1, { nowMs: now });
    assert.equal(refused.ok, false);
    assert.match(refused.reason, /24 hours in the future/);
  });

  test("times in the past or slightly ahead are accepted", () => {
    for (const s of [now / 1000 - 1, now / 1000, now / 1000 + 3600]) assert.equal(parseCommitterTime(s, { nowMs: now }).ok, true);
  });
});

describe("purity", () => {
  test("never reads the clock and the reference never becomes the result", () => {
    const realNow = Date.now;
    Date.now = () => {
      throw new Error("the wall clock must not be read");
    };
    try {
      const a = formatCommitterTime(HEAD_COMMITTER_EPOCH, { nowMs: NOW });
      const b = formatCommitterTime(HEAD_COMMITTER_EPOCH, { nowMs: NOW + 5 * 3600 * 1000 });
      assert.equal(a, HEAD_GENERATED_AT);
      assert.equal(b, HEAD_GENERATED_AT);
    } finally {
      Date.now = realNow;
    }
  });

  test("repeated calls are identical", () => {
    const first = formatCommitterTime(HEAD_COMMITTER_EPOCH, { nowMs: NOW });
    for (let i = 0; i < 20; i++) assert.equal(formatCommitterTime(HEAD_COMMITTER_EPOCH, { nowMs: NOW }), first);
  });
});

describe("isManifestTimestamp", () => {
  test("accepts only YYYY-MM-DDTHH:mm:ss.sssZ for a real instant", () => {
    assert.equal(isManifestTimestamp("2026-10-08T13:24:20.000Z"), true);
    assert.equal(isManifestTimestamp("2024-02-29T00:00:00.000Z"), true);
    for (const v of ["2026-10-08T13:24:20Z", "2026-10-08T13:24:20.00Z", "2026-10-08T13:24:20.000+00:00", "2026-10-08t13:24:20.000z", "2026-02-30T00:00:00.000Z", "2023-02-29T00:00:00.000Z", "2026-13-01T00:00:00.000Z", "2026-10-08T24:00:00.000Z", "2026-10-08 13:24:20.000Z", "+010000-01-01T00:00:00.000Z", "", null, 1791465860, new Date(0)]) {
      assert.equal(isManifestTimestamp(v), false, String(v));
    }
  });
});
