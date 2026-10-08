/**
 * Tool Pack 22: the JWT Decoder engine (assets/js/tools/jwt-decoder/jwt-engine.js).
 *
 * The reference values come from tests/fixtures/jwt-golden.json, written by tests/fixtures/jwt-golden.py from the
 * Python standard library (base64, json, datetime), not from the engine. Tokens in the other tests are built here with
 * Node's own base64url encoder. The engine is pure and takes the time as an argument, so every result is repeatable.
 *
 * What is pinned: the structure rules, strict base64url and UTF-8, strict JSON objects, claim types, NumericDate
 * seconds (never milliseconds), the informational status wording (a decoded token is never called valid, trusted
 * or verified), the safe display of control and bidirectional characters, and that numbers and strings are shown
 * exactly as the token wrote them.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  decodeToken,
  decodeBase64Url,
  encodeBase64Url,
  safeText,
  safeBlock,
  EXAMPLE_TOKEN,
  MAX_TOKEN_CHARS,
} from "../../assets/js/tools/jwt-decoder/jwt-engine.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "jwt-golden.json"), "utf8"));

const BS = String.fromCharCode(92); // a backslash, written this way so no escape sequence is needed in this file
const RLO = String.fromCharCode(0x202e);
const ZWSP = String.fromCharCode(0x200b);
const NEL = String.fromCharCode(0x85);

const b64 = (text) => Buffer.from(text, "utf8").toString("base64url");
const tok = (header, payload, signature = "c2ln") => `${b64(header)}.${b64(payload)}.${signature}`;
const HDR = '{"alg":"HS256","typ":"JWT"}';
const decode = (text, now = 1700000000000, zone = "UTC") => decodeToken(text, { nowMs: now, zone });
const claim = (r, name) => r.claims.find((c) => c.name === name);
const item = (r, name) => r.timing.items.find((i) => i.name === name);

describe("the example and the reference vectors", () => {
  test("the built-in example is exactly the token Python builds, and decodes to the expected header and payload", () => {
    assert.equal(EXAMPLE_TOKEN, GOLD.example);
    const r = decode(EXAMPLE_TOKEN);
    assert.equal(r.state, "decoded");
    assert.equal(r.header.formatted, GOLD.exampleHeader);
    assert.equal(r.payload.formatted, GOLD.examplePayload);
    assert.equal(r.structure.alg, "HS256");
    assert.deepEqual(r.claims.map((c) => c.name), ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"]);
    assert.match(claim(r, "iss").value, /\.invalid$/); // a reserved name: nothing here is a live credential
  });

  test("padding: unpadded and padded forms decode to the same text; the padded form adds a note", () => {
    for (const v of GOLD.padding) {
      const plain = decode(v.unpadded);
      const padded = decode(v.padded);
      assert.equal(plain.state, "decoded", v.payload);
      assert.equal(plain.payload.formatted, v.pretty);
      assert.equal(padded.state, "decoded");
      assert.equal(padded.payload.formatted, v.pretty);
      assert.deepEqual(plain.notes, []);
      assert.ok(padded.notes.some((n) => /Padding/.test(n)), v.padded);
    }
  });

  test("Unicode: raw UTF-8 and JSON escapes (including a surrogate pair) are decoded and shown as the token wrote them", () => {
    const [raw, escaped] = GOLD.unicode;
    const a = decode(raw.token);
    assert.equal(a.state, "decoded");
    assert.equal(a.payload.formatted, raw.pretty); // accented, CJK and an astral emoji
    const b = decode(escaped.token);
    assert.equal(b.state, "decoded");
    // the escapes stay escapes: the formatter does not rewrite strings
    assert.ok(b.payload.formatted.includes(BS + "u00e9e") || b.payload.formatted.includes("Ren" + BS + "u00e9e"));
    assert.ok(b.payload.formatted.includes(BS + "ud83d" + BS + "ude00"));
  });

  test("NumericDate values: the UTC text matches Python's datetime for every vector, and the local text matches the fixed offsets", () => {
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const wall = (text) => {
      const [d, t] = text.split(" ");
      const [y, mo, da] = d.split("-").map(Number);
      return `${da} ${MONTHS[mo - 1]} ${y} at ${t}`;
    };
    for (const v of GOLD.times) {
      const payload = `{"exp":${v.seconds}}`;
      const r = decode(tok(HDR, payload), 0, "UTC");
      assert.equal(item(r, "exp").utc, v.utc, String(v.seconds));
      const k = decode(tok(HDR, payload), 0, "Asia/Kolkata");
      if (v.kolkata) assert.ok(item(k, "exp").local.includes(wall(v.kolkata)), `${v.seconds} ${item(k, "exp").local}`);
      const n = decode(tok(HDR, payload), 0, "America/New_York");
      if (v.newYorkWinter && v.seconds === 1700000000) assert.ok(item(n, "exp").local.includes(wall(v.newYorkWinter)));
    }
    // a winter and a summer instant in New York show UTC-5 and UTC-4
    for (const [season, offset] of [["winter", "UTC-05:00"], ["summer", "UTC-04:00"]]) {
      const x = GOLD.newYork[season];
      const r = decode(tok(HDR, `{"exp":${x.seconds}}`), 0, "America/New_York");
      assert.ok(item(r, "exp").local.includes(wall(x.local)), season);
      assert.ok(item(r, "exp").local.includes(offset), season);
    }
  });
});

describe("token structure", () => {
  test("empty and whitespace-only text is the empty state; text over the limit is refused before anything is read", () => {
    assert.deepEqual(decode(""), { state: "empty" });
    assert.deepEqual(decode("  \n\t "), { state: "empty" });
    assert.deepEqual(decode(undefined), { state: "empty" });
    assert.deepEqual(decode("a".repeat(MAX_TOKEN_CHARS + 1)), { state: "too-large", limit: MAX_TOKEN_CHARS });
    assert.notEqual(decode("a".repeat(MAX_TOKEN_CHARS)).state, "too-large");
  });

  test("exactly three parts decode; one, two, four and six parts are invalid input and say how many were found", () => {
    const good = tok(HDR, '{"sub":"x"}');
    assert.equal(decode(good).state, "decoded");
    for (const [text, found] of [["abc", "1 part and no dots"], ["a.b", "2 parts"], ["a.b.c.d", "4 parts"], ["a.b.c.d.e.f", "6 parts"]]) {
      const r = decode(text);
      assert.equal(r.state, "invalid", text);
      assert.ok(r.problem.message.includes(found), r.problem.message);
    }
  });

  test("five parts is an encrypted token (JWE): recognised and refused, never decrypted", () => {
    const r = decode("a.b.c.d.e");
    assert.equal(r.state, "jwe");
    assert.match(r.message, /encrypted/);
    assert.match(r.message, /does not decrypt/);
  });

  test("an empty header or payload part is invalid input; an empty signature part is allowed", () => {
    assert.equal(decode(`.${b64('{"a":1}')}.sig`).problem.part, "header");
    assert.equal(decode(`${b64(HDR)}..sig`).problem.part, "payload");
    const r = decode(GOLD.unsigned.token);
    assert.equal(r.state, "decoded");
    assert.equal(r.structure.signatureEncodedLength, 0);
  });

  test("a leading Bearer (any case) and spaces or line breaks inside the token are ignored, each with a visible note", () => {
    const good = tok(HDR, '{"sub":"x"}');
    const bearer = decode(`Bearer ${good}`);
    assert.equal(bearer.state, "decoded");
    assert.ok(bearer.notes.some((n) => /Bearer/.test(n)));
    assert.equal(decode(`bEaReR   ${good}`).state, "decoded");
    const wrapped = decode(good.slice(0, 20) + "\n  " + good.slice(20, 50) + "\r\n" + good.slice(50));
    assert.equal(wrapped.state, "decoded");
    assert.ok(wrapped.notes.some((n) => /Spaces and line breaks/.test(n)));
    // surrounding whitespace alone needs no note
    assert.deepEqual(decode(`  ${good}\n`).notes, []);
    assert.match(decode("Bearer   ").problem.message, /nothing after the word Bearer/);
    assert.equal(decode("Bearer x").state, "invalid");
  });
});

describe("base64url, UTF-8 and JSON", () => {
  test("base64url alphabet: + and / get a hint, an equals sign inside, quotes and non-ASCII are named with their place", () => {
    const plus = decode(`${b64(HDR)}.ab+cd.sig`);
    assert.equal(plus.state, "invalid");
    assert.match(plus.problem.message, /Part 2 \(payload\) contains "\+" \(U\+002B\) at position 3/);
    assert.match(plus.problem.message, /uses base64url/);
    assert.match(decode(`${b64(HDR)}.ab/cd.sig`).problem.message, /"\/"/);
    assert.match(decode(`${b64(HDR)}.ab=cd.sig`).problem.message, /Padding \(=\) may only end a part/);
    const quote = decode(`"${b64(HDR)}.${b64("{}")}.sig"`);
    assert.match(quote.problem.message, /Remove any quotation marks/);
    const accent = decode(`${b64(HDR)}.ab${String.fromCharCode(0xe9)}cd.sig`);
    assert.match(accent.problem.message, /U\+00E9/);
  });

  test("a part of 1 modulo 4 characters is not possible base64url", () => {
    const r = decode(`${b64(HDR)}.abcde.sig`);
    assert.equal(r.state, "invalid");
    assert.match(r.problem.message, /not a possible base64url length/);
  });

  test("trailing bits that are not zero are a note, not an error", () => {
    const r = decode(`${b64(HDR)}.e31.sig`);
    assert.equal(r.state, "decoded");
    assert.equal(r.payload.formatted, "{}");
    assert.ok(r.notes.some((n) => /extra bits/.test(n)));
  });

  test("the base64url helpers agree with Node's own encoder for every length from 0 to 40", () => {
    for (let n = 0; n <= 40; n++) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 37 + n * 11) & 255);
      const text = encodeBase64Url(bytes);
      assert.equal(text, Buffer.from(bytes).toString("base64url"));
      const back = decodeBase64Url(text);
      assert.deepEqual([...back.bytes], [...bytes]);
      assert.equal(back.canonical, true);
    }
  });

  test("bytes that are not UTF-8 are refused as such; a byte order mark reaches the JSON check and fails there", () => {
    const bad = `${b64(HDR)}.${Buffer.from([0x7b, 0xff, 0x7d]).toString("base64url")}.sig`;
    const r = decode(bad);
    assert.equal(r.state, "invalid");
    assert.match(r.problem.message, /not valid UTF-8/);
    const bom = `${b64(HDR)}.${Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("{}")]).toString("base64url")}.sig`;
    const b = decode(bom);
    assert.equal(b.state, "invalid");
    assert.match(b.problem.message, /not valid JSON/);
  });

  test("malformed JSON names the part and the place, and shows the text around it", () => {
    const r = decode(tok(HDR, '{"a":}'));
    assert.equal(r.state, "invalid");
    assert.equal(r.problem.part, "payload");
    assert.match(r.problem.message, /The payload \(part 2\) is not valid JSON/);
    assert.match(r.problem.where, /^Line 1, column \d+$/);
    assert.ok(r.problem.context.length > 0);
    const h = decode(tok('{"alg":"HS256",}', '{"a":1}'));
    assert.equal(h.problem.part, "header");
    assert.match(h.problem.message, /The header \(part 1\)/);
  });

  test("a header or payload that is valid JSON but not an object is refused, for every other JSON type", () => {
    for (const [text, word] of [["[]", "an array"], ['"text"', "a string"], ["42", "a number"], ["null", "null"], ["true", "true or false"]]) {
      const p = decode(tok(HDR, text));
      assert.equal(p.state, "invalid", text);
      assert.equal(p.problem.part, "payload");
      assert.ok(p.problem.message.includes(word) && /must be a JSON object/.test(p.problem.message), p.problem.message);
      assert.equal(decode(tok(text, '{"a":1}')).problem.part, "header", text);
    }
  });

  test("numbers and strings are shown exactly as written: nothing is rounded, reformatted or rewritten", () => {
    const text = '{"id":12345678901234567890,"x":1.0,"e":1E3,"s":"' + BS + 'u00e9","k":-0}';
    const r = decode(tok(HDR, text));
    assert.equal(r.state, "decoded");
    for (const part of ["12345678901234567890", '"x": 1.0', '"e": 1E3', '"s": "' + BS + 'u00e9"', '"k": -0']) {
      assert.ok(r.payload.formatted.includes(part), part);
    }
    assert.ok(r.notes.some((n) => /^Payload: .*integer/.test(n)), "the precision note");
  });

  test("a repeated key is shown (both entries) with a note; the first and last are both in the text", () => {
    const r = decode(tok(HDR, '{"sub":"a","sub":"b"}'));
    assert.equal(r.state, "decoded");
    assert.ok(r.payload.formatted.includes('"sub": "a"') && r.payload.formatted.includes('"sub": "b"'));
    assert.ok(r.notes.some((n) => /^Payload: .*more than once/.test(n)));
  });

  test("a __proto__ key is an ordinary key and changes nothing about Object.prototype", () => {
    const r = decode(tok(HDR, '{"__proto__":{"polluted":true},"iss":"x"}'));
    assert.equal(r.state, "decoded");
    assert.ok(r.payload.formatted.includes('"__proto__"'));
    assert.equal(claim(r, "iss").value, "x");
    assert.equal({}.polluted, undefined);
    assert.equal(Object.prototype.polluted, undefined);
  });
});

describe("registered claims", () => {
  test("each claim with the right type is explained as what the token SAYS", () => {
    const r = decode(tok(HDR, '{"iss":"a","sub":"b","aud":["c","d"],"exp":10,"nbf":5,"iat":4,"jti":"j"}'));
    assert.deepEqual(r.claims.map((c) => [c.name, c.typeOk]), [["iss", true], ["sub", true], ["aud", true], ["exp", true], ["nbf", true], ["iat", true], ["jti", true]]);
    assert.equal(claim(r, "aud").value, '["c","d"]');
    // the page prefixes each meaning with "The token says this is", so it reads as a declaration, never as a fact
    for (const c of r.claims) assert.match(c.meaning, /token|issuer/, c.name);
  });

  test("wrong types are reported, never converted, and never raise an error", () => {
    const cases = {
      iss: [5, "a number"], sub: [null, "null"], jti: [true, "a boolean"], aud: [{ a: 1 }, "an object"],
      exp: ["123", "a string"], nbf: [null, "null"], iat: [[1], "an array"],
    };
    for (const [name, [value, found]] of Object.entries(cases)) {
      const r = decode(tok(HDR, JSON.stringify({ [name]: value })));
      assert.equal(r.state, "decoded", name);
      assert.equal(claim(r, name).typeOk, false, name);
      assert.equal(claim(r, name).found, found, name);
    }
    const mixed = decode(tok(HDR, '{"aud":["a",1]}'));
    assert.equal(claim(mixed, "aud").typeOk, false);
    // a time claim with the wrong type is not turned into a date
    assert.equal(decode(tok(HDR, '{"exp":"1700000000"}')).timing.items.length, 0);
    // a number JavaScript cannot hold is named as that
    const huge = decode(tok(HDR, '{"exp":1e999}'));
    assert.equal(claim(huge, "exp").typeOk, false);
    assert.equal(claim(huge, "exp").found, "a number too large for JavaScript");
  });

  test("other claims are left to the payload view; absent claims are simply not listed", () => {
    const r = decode(tok(HDR, '{"scope":"read","role":"admin"}'));
    assert.deepEqual(r.claims, []);
    assert.ok(r.payload.formatted.includes('"role": "admin"'));
  });
});

describe("times: seconds only, informational, and driven by the injected clock", () => {
  const at = (payload, now) => decode(tok(HDR, payload), now);

  test("exp: at or after the time it has passed; before it, it has not", () => {
    assert.match(item(at('{"exp":1000}', 1000 * 1000), "exp").status, /has passed \(now\)/);
    assert.match(item(at('{"exp":1000}', 1001 * 1000), "exp").status, /has passed \(1 second ago\)/);
    assert.match(item(at('{"exp":1000}', 999 * 1000), "exp").status, /has not passed yet \(in 1 second\)/);
    assert.match(item(at('{"exp":1000}', 1000 * 1000 - 1), "exp").status, /has not passed yet|has passed/); // inside the same second: still a sentence, never an exception
  });

  test("nbf: before the time it is not reached; at or after it, it is", () => {
    assert.match(item(at('{"nbf":1000}', 999 * 1000), "nbf").status, /has not been reached yet \(in 1 second\)/);
    assert.match(item(at('{"nbf":1000}', 1000 * 1000), "nbf").status, /has been reached/);
  });

  test("iat in the future says the clocks may differ; in the past it is just a time", () => {
    assert.match(item(at('{"iat":2000}', 1000 * 1000), "iat").status, /in the future.*clocks may differ/);
    assert.match(item(at('{"iat":500}', 1000 * 1000), "iat").status, /in the past/);
  });

  test("relative text is derived from the injected clock only, so it repeats exactly", () => {
    const a = at('{"exp":1700003600}', 1700001800000);
    const b = at('{"exp":1700003600}', 1700001800000);
    assert.deepEqual(a, b);
    assert.equal(item(a, "exp").relative, "in 30 minutes");
    assert.equal(a.timing.checkedAt, "2023-11-14T22:43:20Z");
  });

  test("a missing exp is stated; exp before iat or nbf is noted; the clock caveat is always there", () => {
    assert.ok(at('{"sub":"x"}', 0).timing.notes.some((n) => /no exp claim/.test(n)));
    assert.ok(at('{"exp":10,"iat":20}', 0).timing.notes.some((n) => /exp time is earlier than the iat/.test(n)));
    assert.ok(at('{"exp":10,"nbf":20}', 0).timing.notes.some((n) => /exp time is earlier than the nbf/.test(n)));
    for (const payload of ['{}', '{"exp":1}']) assert.ok(at(payload, 0).timing.notes.some((n) => /clock of this device, which may be wrong/.test(n)));
  });

  test("a value is read as seconds and is never converted from milliseconds; a large one is hinted at, with the milliseconds reading", () => {
    const ms = item(at('{"exp":1700000000000}', 0), "exp");
    assert.equal(ms.outOfRange, true); // as seconds this is far past the year 9999
    assert.match(ms.status, /outside the years 1 to 9999/);
    assert.match(ms.hint, /Read as milliseconds it would be 2023-11-14T22:13:20Z UTC/);
    assert.match(ms.hint, /Nothing was converted/);
    // 100 billion seconds is the year 5138 (in range as seconds) and also 1973 as milliseconds: the seconds reading is the one shown
    const edge = item(at('{"exp":100000000000}', 0), "exp");
    assert.equal(edge.outOfRange, undefined);
    assert.equal(edge.utc.slice(0, 4), "5138");
    assert.match(edge.hint, /1973-03-03/);
    // just below the threshold: no hint
    assert.equal(item(at('{"exp":99999999999}', 0), "exp").hint, null);
  });

  test("range: the last supported second is shown; the next one is outside the years 1 to 9999; zero and negatives are dates", () => {
    assert.equal(item(at('{"exp":253402300799}', 0), "exp").utc, "9999-12-31T23:59:59Z");
    assert.equal(item(at('{"exp":253402300800}', 0), "exp").outOfRange, true);
    assert.equal(item(at('{"exp":-62135596800}', 0), "exp").utc, "0001-01-01T00:00:00Z");
    assert.equal(item(at('{"exp":-62135596801}', 0), "exp").outOfRange, true);
    assert.equal(item(at('{"exp":0}', 0), "exp").utc, "1970-01-01T00:00:00Z");
    assert.equal(item(at('{"exp":-1}', 0), "exp").utc, "1969-12-31T23:59:59Z");
  });

  test("a fraction is kept to the millisecond and never rounds into the wrong second", () => {
    assert.equal(item(at('{"exp":1700000000.5}', 0), "exp").utc, "2023-11-14T22:13:20.5Z");
    assert.equal(item(at('{"exp":1700000000.123}', 0), "exp").utc, "2023-11-14T22:13:20.123Z");
    assert.equal(item(at('{"exp":1700000000.9996}', 0), "exp").utc, "2023-11-14T22:13:21Z");
  });
});

describe("header declarations are untrusted, and the wording never says valid, trusted or verified", () => {
  test("alg none, an empty signature and a signature next to alg none are each stated as a fact", () => {
    const none = decode(GOLD.unsigned.token);
    assert.ok(none.notes.some((n) => /declares alg "none".*no signature/.test(n)));
    assert.equal(none.notes.some((n) => /empty, although/.test(n)), false);
    const emptyHs = decode(`${b64(HDR)}.${b64('{"a":1}')}.`);
    assert.ok(emptyHs.notes.some((n) => /signature part is empty, although the header does not declare alg "none"/.test(n)));
    const both = decode(tok('{"alg":"None"}', '{"a":1}'));
    assert.ok(both.notes.some((n) => /declares alg "none", but the token has a signature part/.test(n)), "case-insensitive");
    assert.ok(decode(tok("{}", '{"a":1}')).notes.some((n) => /no alg field/.test(n)));
  });

  test("alg, typ, kid and cty are listed as declared strings; a non-string is flagged and not interpreted", () => {
    const r = decode(tok('{"cty":"JWT","kid":"k1","alg":"RS256","typ":"JWT"}', '{"a":1}'));
    assert.deepEqual(r.headerFields.map((f) => f.name), ["alg", "typ", "kid", "cty"]);
    assert.ok(r.headerFields.every((f) => f.typeOk));
    const odd = decode(tok('{"alg":5,"kid":{"x":1}}', '{"a":1}'));
    assert.deepEqual(odd.headerFields.map((f) => [f.name, f.typeOk, f.found]), [["alg", false, "a number"], ["kid", false, "an object"]]);
    assert.equal(odd.structure.alg, null);
  });

  test("no text of a decoded result calls the token valid, invalid, trusted, genuine, authentic or verified", () => {
    const samples = [EXAMPLE_TOKEN, GOLD.unsigned.token, tok(HDR, '{"exp":1,"nbf":9e9,"iat":9e9,"aud":3}'), tok('{"alg":"none"}', '{"exp":1700000000000}')];
    for (const text of samples) {
      const r = decode(text);
      assert.equal(r.state, "decoded");
      const words = JSON.stringify(r).replace(/\.invalid/g, ""); // the reserved .invalid host name in the example is data, not wording
      assert.equal(/\b(valid|invalid|trusted|genuine|authentic\w*|verified|safe|secure)\b/i.test(words), false, words.match(/\b(valid|invalid|trusted|genuine|authentic\w*|verified|safe|secure)\b/i)?.[0]);
    }
  });
});

describe("untrusted text", () => {
  test("script-like strings are returned as the same plain text, never changed or removed (the page puts them in with textContent)", () => {
    const evil = '<script>alert(1)</script><img src=x onerror=alert(2)>';
    const r = decode(tok(HDR, JSON.stringify({ sub: evil, iss: "javascript:alert(3)" })));
    assert.equal(claim(r, "sub").value, evil);
    assert.equal(claim(r, "iss").value, "javascript:alert(3)");
    assert.ok(r.payload.formatted.includes(evil));
  });

  test("control, invisible and bidirectional characters are written as visible escapes in every string the engine returns", () => {
    const payload = JSON.stringify({ sub: "a" + RLO + "b" + ZWSP + "c" + NEL + "d", iss: "x" });
    const r = decode(tok(HDR, payload));
    assert.equal(r.state, "decoded");
    assert.equal(claim(r, "sub").value, "a" + BS + "u202eb" + BS + "u200bc" + BS + "u0085d");
    assert.ok(r.payload.formatted.includes("a" + BS + "u202eb" + BS + "u200bc" + BS + "u0085d"));
    const all = JSON.stringify(r);
    for (const bad of [RLO, ZWSP, NEL]) assert.equal(all.includes(bad), false);
    // an escape inside a JSON string means the same character, so the escaped text is still the same JSON
    assert.equal(JSON.parse(r.payload.formatted).sub, "a" + RLO + "b" + ZWSP + "c" + NEL + "d");
  });

  test("safeText escapes line breaks and tabs; safeBlock keeps layout whitespace and escapes the rest", () => {
    assert.equal(safeText("a\nb"), "a" + BS + "u000ab");
    assert.equal(safeBlock("a\nb\tc"), "a\nb\tc");
    assert.equal(safeBlock("a" + RLO), "a" + BS + "u202e");
    assert.equal(safeText("plain text 123 " + String.fromCharCode(0xe9)), "plain text 123 " + String.fromCharCode(0xe9)); // ordinary letters are untouched
  });

  test("a hostile key name in a note or an error is escaped too", () => {
    const r = decode(tok(HDR, '{"' + RLO + 'k":1,"' + RLO + 'k":2}'));
    assert.equal(r.state, "decoded");
    assert.equal(JSON.stringify(r).includes(RLO), false);
  });
});

describe("whole numbers beyond 2^53 are never shown as if they were exact", () => {
  const big = "12345678901234567890";

  test("a time claim above the safe integer range gets no date, no digits of a rounded stand-in, and says so; the payload view keeps the exact digits", () => {
    const r = decode(tok(HDR, `{"exp":${big},"iat":9007199254740993}`));
    assert.equal(r.state, "decoded");
    for (const name of ["exp", "iat"]) {
      const i = item(r, name);
      assert.equal(i.utc, undefined, name);
      assert.equal(i.local, undefined, name);
      assert.match(i.status, /too large to read exactly, so no date is shown/);
      assert.match(i.seconds, /larger than JavaScript can hold exactly/);
      assert.equal(claim(r, name).value.includes("12345678901234567000") || claim(r, name).value.includes("9007199254740992"), false, name);
      assert.match(claim(r, name).value, /larger than JavaScript can hold exactly/);
    }
    assert.ok(r.payload.formatted.includes(big));
    assert.ok(r.payload.formatted.includes("9007199254740993")); // the exact digits, which a float cannot hold
    assert.ok(r.notes.some((n) => /beyond 15 digits/.test(n) || /integer/.test(n)), "the formatter's precision note");
    // no ordering note is built from a number that is not exact
    assert.equal(r.timing.notes.some((n) => /earlier than/.test(n)), false);
  });

  test("the last exactly representable integer is still read normally, as out of range for a date; the next one is not read at all", () => {
    const safe = decode(tok(HDR, '{"exp":9007199254740991}'));
    assert.equal(item(safe, "exp").seconds, "9007199254740991");
    assert.equal(item(safe, "exp").outOfRange, true);
    assert.equal(claim(safe, "exp").value, "9007199254740991");
    const next = decode(tok(HDR, '{"exp":9007199254740992}'));
    assert.match(item(next, "exp").seconds, /larger than JavaScript can hold exactly/);
    assert.equal(item(next, "exp").outOfRange, undefined);
  });

  test("any claim, of any type, or an array holding such a number, is disclosed instead of printed as a rounded value", () => {
    const r = decode(tok(HDR, `{"iss":${big},"aud":[${big}],"sub":{"n":${big}},"jti":"${big}"}`));
    assert.match(claim(r, "iss").value, /larger than JavaScript can hold exactly/);
    assert.match(claim(r, "aud").value, /larger than JavaScript can hold exactly/);
    assert.match(claim(r, "sub").value, /larger than JavaScript can hold exactly/);
    assert.equal(claim(r, "jti").value, big); // a string stays exactly what it is
    for (const name of ["iss", "aud", "sub"]) assert.equal(claim(r, name).typeOk, false, name);
    assert.equal(JSON.stringify(r.claims).includes("12345678901234567000"), false);
    // ordinary decimals and small numbers are untouched
    const ok = decode(tok(HDR, '{"iss":1.5,"aud":[1,2]}'));
    assert.equal(claim(ok, "iss").value, "1.5");
    assert.equal(claim(ok, "aud").value, "[1,2]");
  });
});

describe("the engine is pure", () => {
  test("the same text and time give the same result, and the input is not changed", () => {
    const text = `Bearer ${EXAMPLE_TOKEN}`;
    const copy = String(text);
    assert.deepEqual(decode(text, 5), decode(text, 5));
    assert.equal(text, copy);
  });
});
