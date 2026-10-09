/**
 * G3C-B1: the manifest character policy, checked against a second, differently written statement of the contract
 * (range tables transcribed from Growth docs/09-INTEGRATION.md section 12a) over every Unicode code point.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { findTextIssues, hasForbiddenCharacter, isForbiddenCodePoint, isNfc, textProblem } from "../../scripts/growth-manifest/text-policy.mjs";

const cp = (...codes) => String.fromCodePoint(...codes);

/** Forbidden ranges as written in the contract; the tag block is handled separately because of the flag exception. */
const FORBIDDEN_RANGES = [
  [0x00, 0x08], [0x0b, 0x1f], [0x7f, 0x9f], [0xad, 0xad], [0x61c, 0x61c], [0x180e, 0x180e], [0x200b, 0x200b], [0x200e, 0x200f],
  [0x2028, 0x2029], [0x202a, 0x202e], [0x2060, 0x206f], [0xfeff, 0xfeff], [0xfff9, 0xfffd], [0xfdd0, 0xfdef], [0xe000, 0xf8ff],
  [0xf0000, 0x10ffff], [0xd800, 0xdfff], [0xe0000, 0xe007f],
];
const isNoncharacter = (c) => (c & 0xffff) === 0xfffe || (c & 0xffff) === 0xffff;
const referenceForbidden = (c) => isNoncharacter(c) || FORBIDDEN_RANGES.some(([lo, hi]) => c >= lo && c <= hi);

describe("single code points", () => {
  test("agree with the reference ranges for every code point U+0000..U+10FFFF", () => {
    const wrong = [];
    for (let c = 0; c <= 0x10ffff; c++) {
      if (hasForbiddenCharacter(cp(c)) !== referenceForbidden(c)) wrong.push(c.toString(16));
      if (wrong.length > 10) break;
    }
    assert.deepEqual(wrong, [], "code points where the policy and the contract ranges disagree");
  });

  test("isForbiddenCodePoint excludes surrogates and tags, which are handled by position", () => {
    assert.equal(isForbiddenCodePoint(0xd800), false);
    assert.equal(isForbiddenCodePoint(0xe0067), false);
    assert.equal(isForbiddenCodePoint(0x7f), true);
  });

  test("boundaries of the rejected ranges", () => {
    for (const [lo, hi] of FORBIDDEN_RANGES.filter(([a]) => a < 0xd800 || a > 0xdfff)) {
      if (lo >= 0xe0000 && lo <= 0xe007f) continue;
      assert.equal(hasForbiddenCharacter(cp(lo)), true, lo.toString(16));
      assert.equal(hasForbiddenCharacter(cp(hi)), true, hi.toString(16));
    }
    for (const ok of [0x09, 0x0a, 0x20, 0x7e, 0xa0, 0xa1, 0x34f, 0x200c, 0x200d, 0x202f, 0x2010, 0x205f, 0x2070, 0xfdcf, 0xfdf0, 0xfe00, 0xfe0f, 0xff00, 0xfff8, 0x10000, 0xe0100, 0xe01ef, 0xe01f0, 0x180b, 0x180d, 0x3c4, 0xc24]) {
      assert.equal(hasForbiddenCharacter(cp(ok)), false, ok.toString(16));
    }
  });
});

describe("sequences", () => {
  const FLAG = [0x1f3f4, 0xe0067, 0xe0062, 0xe0065, 0xe006e, 0xe0067, 0xe007f];
  test("the emoji subdivision-flag sequence is accepted, alone and in text", () => {
    assert.equal(hasForbiddenCharacter(cp(...FLAG)), false);
    assert.equal(hasForbiddenCharacter("flag " + cp(...FLAG) + " end"), false);
    assert.equal(hasForbiddenCharacter(cp(...FLAG, ...FLAG)), false);
  });

  test("a tag run must start after U+1F3F4 and finish with U+E007F", () => {
    assert.equal(hasForbiddenCharacter(cp(0xe0067)), true);
    assert.equal(hasForbiddenCharacter(cp(0x1f3f4, 0xe0067)), true);
    assert.equal(hasForbiddenCharacter(cp(0x1f3f4, 0xe0067, 0x41, 0xe007f)), true);
    assert.equal(hasForbiddenCharacter(cp(0xe007f)), true);
    assert.equal(hasForbiddenCharacter(cp(0x41, 0xe0067, 0xe007f)), true);
    assert.equal(hasForbiddenCharacter(cp(...FLAG, 0xe0067)), true);
    assert.equal(hasForbiddenCharacter(cp(0x1f3f4, 0xe007f)), true, "cancel tag without any tag character");
    assert.equal(hasForbiddenCharacter(cp(0xe0001)), true);
    assert.equal(hasForbiddenCharacter(cp(0xe0000)), true);
  });

  test("lone surrogates are rejected, valid pairs are not", () => {
    assert.equal(hasForbiddenCharacter("\ud800"), true);
    assert.equal(hasForbiddenCharacter("\udc00"), true);
    assert.equal(hasForbiddenCharacter("\udc00\ud800"), true);
    assert.equal(hasForbiddenCharacter("a\ud83d"), true);
    assert.equal(hasForbiddenCharacter("\ud83d\ude00"), false);
  });

  test("Telugu with ZWNJ and ZWJ and an emoji variation selector are accepted", () => {
    assert.equal(hasForbiddenCharacter(cp(0xc24, 0xc46, 0xc32, 0xc41, 0xc17, 0xc41)), false);
    assert.equal(hasForbiddenCharacter(cp(0xc15, 0xc4d, 0x200c, 0xc37)), false);
    assert.equal(hasForbiddenCharacter(cp(0xc15, 0xc4d, 0x200d, 0xc37)), false);
    assert.equal(hasForbiddenCharacter(cp(0x2764, 0xfe0f)), false);
  });

  test("the empty string is clean", () => assert.equal(hasForbiddenCharacter(""), false));
});

describe("NFC", () => {
  test("composed text passes, decomposed text fails", () => {
    assert.equal(isNfc(cp(0xe9)), true);
    assert.equal(isNfc(cp(0x65, 0x301)), false);
    assert.equal(textProblem(cp(0x65, 0x301)), "is not NFC-normalized");
    assert.equal(textProblem(cp(0xe9)), null);
  });

  test("the policy never repairs: a non-NFC string is reported, not changed", () => {
    const s = cp(0x65, 0x301);
    assert.notEqual(s, s.normalize("NFC"));
    assert.equal(textProblem(s) !== null, true);
  });

  test("a forbidden character is reported before a normalization problem", () => {
    assert.match(textProblem(cp(0x65, 0x301, 0x200b)), /character policy/);
  });
});

describe("findTextIssues", () => {
  test("reports the path of each bad value and key, and nothing for clean data", () => {
    const value = { content: [{ title: "ok", description: "tab\tand\nlf are fine" }, { title: "bad" + cp(0x200b), image: { alt: cp(0x65, 0x301) } }], ["k" + cp(0x202e)]: "v" };
    assert.deepEqual(findTextIssues(value), [
      { path: "content[1].image.alt", message: "is not NFC-normalized" },
      { path: "content[1].title", message: "contains a character the manifest character policy forbids" },
      { path: "k" + cp(0x202e), message: "key contains a character the manifest character policy forbids" },
    ]);
    assert.deepEqual(findTextIssues({ a: ["x", { b: "y" }], n: 1, t: true, z: null }), []);
  });

  test("numbers, booleans and null are ignored; deep nesting is reported, not followed", () => {
    let deep = "x";
    for (let i = 0; i < 80; i++) deep = [deep];
    assert.equal(findTextIssues(deep).length, 1);
  });
});
