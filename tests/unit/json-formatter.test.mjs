/**
 * Tool Pack 15: JSON Formatter & Validator, the engine (assets/js/tools/json-formatter/json-engine.js).
 *
 * Golden inputs and outputs are written out by hand. The yes/no answer is also cross-checked against the
 * browser's own JSON.parse, which is an independent oracle, on hand-written cases and on seeded mutations.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  analyze, format, minify, validate, locate, contextOf, describeValid, describeNote, describeSize,
  MAX_CHARS, MAX_DEPTH, EXAMPLE,
} from "../../assets/js/tools/json-formatter/json-engine.js";

const nativeOk = (text) => {
  try { JSON.parse(text); return true; } catch { return false; }
};

const err = (text) => {
  const r = validate(text);
  assert.equal(r.state, "invalid", `expected invalid: ${JSON.stringify(text)}`);
  return r.error;
};

describe("valid documents of every root type", () => {
  const cases = [
    ["object", '{"a":1}', "object"],
    ["array", "[1,2]", "array"],
    ["string root", '"hello"', "string"],
    ["number root", "42", "number"],
    ["negative decimal root", "-0.5", "number"],
    ["exponent root", "1E+2", "number"],
    ["true root", "true", "boolean"],
    ["false root", "false", "boolean"],
    ["null root", "null", "null"],
    ["empty object", "{}", "object"],
    ["empty array", "[]", "array"],
    ["surrounding whitespace", "  \n\t [ 1 ] \r\n ", "array"],
    ["unicode", '{"名前":"日本語 😀 é"}', "object"],
    ["escapes", '{"a":"line\\nbreak \\"q\\" \\\\ \\/ \\u00e9 \\ud83d\\ude00 \\t \\b \\f \\r"}', "object"],
    ["nested", '{"a":{"b":[{"c":[[]]}]}}', "object"],
  ];
  for (const [name, text, root] of cases) {
    test(name, () => {
      const r = validate(text);
      assert.equal(r.state, "valid");
      assert.equal(r.rootType, root);
      assert.equal(nativeOk(text), true);
    });
  }

  test("empty and blank input is its own state, not an error", () => {
    for (const t of ["", "   ", "\n\t\r\n", null, undefined]) assert.equal(analyze(t).state, "empty");
  });
});

describe("invalid strict JSON: invalid, at the exact place, with a useful message", () => {
  // [text, offset, line, column, message pattern]
  const cases = [
    ["trailing comma in an object", '{"a":1,}', 6, 1, 7, /trailing comma.*}/i],
    ["trailing comma in an array", "[1,2,]", 4, 1, 5, /trailing comma.*]/i],
    ["single-quoted string", "{\"a\":'x'}", 5, 1, 6, /double quotes, not single/i],
    ["single-quoted key", "{'a':1}", 1, 1, 2, /double quotes, not single/i],
    ["unquoted key", "{a:1}", 1, 1, 2, /must be in double quotes: write "a"/],
    ["missing comma between properties", '{"a":1 "b":2}', 7, 1, 8, /comma may be missing/i],
    ["missing comma between array items", "[1 2]", 3, 1, 4, /comma may be missing/i],
    ["missing closing brace", '{"a":1', 6, 1, 7, /opened at line 1, column 1 is never closed/i],
    ["missing closing bracket", "[1,2", 4, 1, 5, /never closed with \]/],
    ["mismatched close", "[1,2}", 4, 1, 5, /Expected ] to close the \[ opened at line 1, column 1, but found }/],
    ["malformed escape", '"a\\xb"', 2, 1, 3, /Invalid escape "\\x"/],
    ["malformed unicode escape", '"\\u12G4"', 1, 1, 2, /four hex digits/],
    ["unterminated string", '{"a":"abc', 5, 1, 6, /never closed/],
    ["line break in a string", '"a\nb"', 2, 1, 3, /line break inside a string/i],
    ["tab in a string", '"a\tb"', 2, 1, 3, /tab inside a string/i],
    ["line comment", '// note\n{"a":1}', 0, 1, 1, /Comments are not allowed/],
    ["block comment", '{"a":1 /* c */}', 7, 1, 8, /Comments are not allowed/],
    ["undefined", '{"a":undefined}', 5, 1, 6, /undefined is not valid JSON/],
    ["NaN", "[NaN]", 1, 1, 2, /NaN is not valid JSON/],
    ["Infinity", "Infinity", 0, 1, 1, /Infinity is not valid JSON/],
    ["-Infinity", "-Infinity", 0, 1, 1, /Infinity is not valid JSON/],
    ["capitalised literal", "True", 0, 1, 1, /lowercase/],
    ["bare word", "[hello]", 1, 1, 2, /Unexpected word "hello"/],
    ["leading zero", "[007]", 1, 1, 2, /leading zeros/],
    ["plus sign", "[+1]", 1, 1, 2, /cannot start with \+/],
    ["leading decimal point", "[.5]", 1, 1, 2, /decimal point/],
    ["trailing decimal point", "[1.]", 2, 1, 3, /followed by digits/],
    ["lone minus", "[-]", 1, 1, 2, /minus sign/],
    ["empty exponent", "[1e]", 2, 1, 3, /exponent/],
    ["hex number", "[0x1F]", 2, 1, 3, /comma may be missing|Unexpected/],
    ["missing value after the colon", '{"a":}', 5, 1, 6, /value is missing after the colon/],
    ["missing colon", '{"a" 1}', 5, 1, 6, /Expected ":" after the property name/],
    ["value instead of a key", "{1:2}", 1, 1, 2, /Property names must be strings/],
    ["a second root value", "{} {}", 3, 1, 4, /more text after the JSON value/],
    ["two documents", "1 2", 2, 1, 3, /more text after the JSON value/],
    ["a stray closing brace", '{"a":1}}', 7, 1, 8, /more text after/],
    ["leading comma", "[,1]", 1, 1, 2, /value is missing before ","/],
    ["double comma", "[1,,2]", 3, 1, 4, /value is missing before ","/],
    ["colon in an array", "[1:2]", 2, 1, 3, /inside an array/],
    ["text ends after a comma", "[1,", 3, 1, 4, /never closed/],
    ["byte order mark", '\ufeff{"a":1}', 0, 1, 1, /byte order mark/],
    ["non-breaking space", '{"a":\u00a01}', 5, 1, 6, /non-breaking space/],
    ["curly quotes", "{\u201ca\u201d:1}", 1, 1, 2, /curly quote/],
    ["unquoted string value", '{"a":hello}', 5, 1, 6, /Unexpected word "hello"/],
  ];
  for (const [name, text, offset, line, column, message] of cases) {
    test(name, () => {
      const e = err(text);
      assert.equal(e.offset, offset, `offset (${e.message})`);
      assert.equal(e.line, line, "line");
      assert.equal(e.column, column, "column");
      assert.match(e.message, message);
      assert.equal(nativeOk(text), false, "the browser's own parser must agree it is invalid");
    });
  }

  test("line and column on a multi-line document", () => {
    const text = '{\n  "a": 1,\n  "b": 2,\n}';
    const e = err(text);
    assert.equal(e.line, 3);
    assert.equal(e.column, 9);
    assert.equal(text[e.offset], ",");
  });

  test("CRLF line breaks count as one line", () => {
    const e = err('{\r\n  "a": 1,\r\n}');
    assert.equal(e.line, 2);
    assert.equal(e.column, 9);
  });

  test("an error after astral characters counts characters, not code units", () => {
    const e = err('["😀😀", x]');
    assert.equal(e.line, 1);
    assert.equal(e.column, 8);
  });

  test("the context shows the lines around the spot with a marker under it", () => {
    const e = err('{\n  "a": 1,\n  "b": 2,\n}');
    assert.equal(e.context, ['2 |   "a": 1,', '3 |   "b": 2,', '  |         ^', '4 | }'].join("\n"));
  });

  test("a very long line is clipped around the error, with the marker still under it", () => {
    const long = `[${Array.from({ length: 400 }, (_, i) => i).join(",")},]`;
    const e = err(long);
    const rows = e.context.split("\n");
    assert.equal(rows.length, 2);
    assert.ok(rows[0].length < 100, "clipped");
    assert.ok(rows[0].includes("…"));
    const caret = rows[1].indexOf("^");
    assert.equal(rows[0][caret], ",", "the marker is under the trailing comma");
  });

  test("the context is plain text: markup in the input is only characters", () => {
    const e = err('{"a":"<img src=x onerror=alert(1)>", }');
    assert.ok(e.context.includes("<img src=x onerror=alert(1)>"));
  });
});

describe("format: two spaces, only the whitespace changes", () => {
  test("golden: object with an array", () => {
    const r = format('{"a":1,"b":[true,null]}');
    assert.equal(r.output, '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}');
  });

  test("golden: nested empty containers stay compact", () => {
    assert.equal(format('{"a":{},"b":[],"c":[{}],"d":[[]]}').output, '{\n  "a": {},\n  "b": [],\n  "c": [\n    {}\n  ],\n  "d": [\n    []\n  ]\n}');
  });

  test("golden: primitive roots", () => {
    for (const t of ["42", '"x"', "true", "null", "[]", "{}"]) assert.equal(format(`  ${t}\n`).output, t);
  });

  test("golden: already formatted text is unchanged (idempotent)", () => {
    const once = format('{"k":[1,{"z":2}],"m":"s"}').output;
    assert.equal(format(once).output, once);
  });

  test("irregular whitespace and CRLF are normalised", () => {
    assert.equal(format('{ "a" :\r\n 1 ,\t"b":[ 1 ,2 ] }').output, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });

  test("agrees with JSON.stringify(JSON.parse(x), null, 2) on ordinary documents", () => {
    for (const t of [EXAMPLE, '{"a":[1,2,{"b":null}],"c":"d"}', "[[1,[2,[3,[]]]],{}]", '{"é":"\\u00e9 😀"}', "[0.5,-3,1e3,true,false,null]"]) {
      // compare after parsing the native output back as well, since 1e3 would print as 1000 natively
      assert.deepEqual(JSON.parse(format(t).output), JSON.parse(t));
    }
    assert.equal(format(EXAMPLE).output, JSON.stringify(JSON.parse(EXAMPLE), null, 2).replace('"price": 129\n', '"price": 129.0\n'), "only the 129.0 literal may differ (JSON.stringify prints 129)");
  });

  test("numbers and strings are copied exactly as written", () => {
    const src = '{"x":1.0,"big":12345678901234567890,"tiny":1E-7,"neg":-0,"s":"\\u00e9\\/","e":1e999}';
    const out = format(src).output;
    for (const token of ["1.0", "12345678901234567890", "1E-7", "-0", '"\\u00e9\\/"', "1e999"]) assert.ok(out.includes(token), token);
    assert.equal(minify(src).output, src);
  });

  test("key order and duplicate keys are kept", () => {
    assert.equal(minify('{"b":1,"10":2,"a":3,"b":4}').output, '{"b":1,"10":2,"a":3,"b":4}');
  });

  test("HTML-like text stays inert text in the output", () => {
    const src = '{"a":"<script>alert(1)</script>","b":"\\"</div>\\\\"}';
    assert.equal(minify(format(src).output).output, src);
    assert.ok(format(src).output.includes("<script>alert(1)</script>"));
  });

  test("invalid input produces no output", () => {
    const r = format('{"a":1,}');
    assert.equal(r.state, "invalid");
    assert.equal(r.output, undefined);
  });
});

describe("minify", () => {
  test("golden: removes all insignificant whitespace", () => {
    assert.equal(minify('{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}').output, '{"a":1,"b":[true,null]}');
  });

  test("whitespace inside strings is kept", () => {
    assert.equal(minify('{ "a" : "  two  spaces  " }').output, '{"a":"  two  spaces  "}');
  });

  test("format then minify equals minify, and the parsed value never changes", () => {
    for (const t of [EXAMPLE, "[1,[2,[3]]]", '{"a":{"b":{}}}', '"x"', "[]"]) {
      assert.equal(minify(format(t).output).output, minify(t).output);
      assert.deepEqual(JSON.parse(minify(t).output), JSON.parse(t));
      assert.deepEqual(JSON.parse(format(t).output), JSON.parse(t));
    }
  });

  test("invalid input is not minified", () => {
    assert.equal(minify("[1,2").state, "invalid");
  });
});

describe("notes: valid JSON that deserves a mention", () => {
  test("a duplicate key is a note, not an error", () => {
    const r = validate('{"a":1,"b":{"a":2},"a":3}');
    assert.equal(r.state, "valid");
    assert.equal(r.noteTotal, 1);
    assert.equal(r.notes[0].kind, "duplicate-key");
    assert.match(r.notes[0].message, /"a" appears more than once/);
    assert.equal(r.notes[0].offset, 19);
  });

  test("a key repeated through different escapes is the same key", () => {
    assert.equal(validate('{"a":1,"\\u0061":2}').noteTotal, 1);
  });

  test("the same key in different objects is not a duplicate", () => {
    assert.equal(validate('[{"a":1},{"a":2}]').noteTotal, 0);
  });

  test("an integer beyond what JavaScript holds exactly, and one beyond its range", () => {
    const r = validate("[12345678901234567890, 123456789012345, 1e999]");
    assert.deepEqual(r.notes.map((n) => n.kind), ["number-precision", "number-range"]);
  });

  test("ordinary large numbers and decimals are not flagged", () => {
    assert.equal(validate("[9007199254740991, 1.5, 1e300, 0.1234567890123456789]").noteTotal, 0);
  });

  test("notes are bounded and counted", () => {
    const r = validate(`{${Array.from({ length: 200 }, () => '"k":1').join(",")}}`);
    assert.equal(r.noteTotal, 199);
    assert.equal(r.notes.length, 50);
  });

  test("describeNote gives the place", () => {
    const text = '{\n  "a": 1,\n  "a": 2\n}';
    assert.match(describeNote(text, validate(text).notes[0]), /^Line 3, column 3: /);
  });
});

describe("limits", () => {
  test("nesting at the limit is accepted, one deeper is refused", () => {
    assert.equal(validate("[".repeat(MAX_DEPTH) + "]".repeat(MAX_DEPTH)).state, "valid");
    const e = err("[".repeat(MAX_DEPTH + 1) + "]".repeat(MAX_DEPTH + 1));
    assert.match(e.message, /nested more than 500 levels/);
  });

  test("input over the size limit is refused, not processed", () => {
    assert.deepEqual(analyze("[" + "1,".repeat(MAX_CHARS) + "1]"), { state: "too-large", limit: MAX_CHARS });
  });

  test("a 1 MB document is checked, formatted and minified quickly", () => {
    const doc = JSON.stringify({ rows: Array.from({ length: 14_000 }, (_, i) => ({ id: i, name: `item ${i}`, tags: ["a", "b"], price: i / 4, ok: i % 2 === 0, none: null })) });
    assert.ok(doc.length > 900_000);
    const t = performance.now();
    const f = format(doc);
    const m = minify(doc);
    const elapsed = performance.now() - t;
    assert.equal(f.state, "valid");
    assert.ok(f.output.length > doc.length);
    assert.equal(m.output, doc);
    assert.ok(elapsed < 1500, `took ${elapsed} ms`);
  });
});

describe("summary text", () => {
  test("describeValid", () => {
    assert.equal(describeValid(validate('{"a":1,"b":2}')), "Object with 2 keys");
    assert.equal(describeValid(validate('{"a":1}')), "Object with 1 key");
    assert.equal(describeValid(validate("[1,2,3]")), "Array with 3 items");
    assert.equal(describeValid(validate('{"a":[{"b":1}]}')), "Object with 1 key, 3 levels deep");
    assert.equal(describeValid(validate('"x"')), "A string");
    assert.equal(describeValid(validate("7")), "A number");
    assert.equal(describeValid(validate("true")), "A boolean");
    assert.equal(describeValid(validate("null")), "null");
  });

  test("describeSize", () => {
    assert.equal(describeSize(12345), "12,345 characters");
    assert.equal(describeSize(1_500_000), "1.5 million characters");
  });

  test("locate and contextOf are consistent", () => {
    assert.deepEqual(locate("ab\ncd", 4), { line: 2, column: 2, lineStart: 3 });
    assert.equal(contextOf("ab", 1), "1 | ab\n  |  ^");
  });

  test("the example is valid and formats to a document with several levels", () => {
    const r = format(EXAMPLE);
    assert.equal(r.state, "valid");
    assert.equal(r.rootType, "object");
    assert.ok(r.depth >= 3);
    assert.equal(r.noteTotal, 0);
  });
});

describe("agreement with JSON.parse (an independent oracle)", () => {
  test("hand-written corpus", () => {
    const corpus = [
      "{}", "[]", '""', "0", "-0", "1e5", "1E-5", "0.0", "-1.5e+3", "true", "null", '"\\u0000"', '"\\ud800"', '"\u2028"',
      "{", "}", "[", "]", ",", ":", "01", "1.", ".1", "+1", "1e", "--1", "0x1", "'a'", '"a', 'a"', '{"a"}', '{"a":}', '{"a":1,}',
      "[1,]", "[,]", "[1 2]", '{"a":1 "b":2}', "nul", "NULL", "tru", "\u00a01", "[1]]", "[1]x", "{}{}", '{"a":1}\n\n', "\t[\t]\t",
      '"\\"', '"\\\\"', '"\\/"', '"\\a"', '"\\u12"', '"\t"', "\u2003[]",
    ];
    for (const t of corpus) assert.equal(validate(t).state === "valid" || validate(t).state === "empty" && false, nativeOk(t), JSON.stringify(t));
  });

  test("20,000 seeded single-character mutations of valid documents", () => {
    let seed = 20261006;
    const rand = (n) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed % n;
    };
    const bases = [
      EXAMPLE, '{"a":[1,2,{"b":null,"c":"d\\n"}],"e":-1.5e3}', "[[],{},[[]],[{}]]", '"x\\u00e9y"', "[0,-0,1,2.5,1e2]", "{\"k\":{\"k\":{\"k\":[true,false,null]}}}",
    ];
    const alphabet = '{}[],:"\'\\ \n\t0123456789.+-eEtrufalsn/*#xX\u00a0';
    let invalid = 0;
    for (let k = 0; k < 20_000; k++) {
      const base = bases[rand(bases.length)];
      const at = rand(base.length + 1);
      const ch = alphabet[rand(alphabet.length)];
      const kind = rand(3);
      const text = kind === 0 ? base.slice(0, at) + ch + base.slice(at) : kind === 1 ? base.slice(0, at) + base.slice(at + 1) : base.slice(0, at) + ch + base.slice(at + 1);
      const mine = validate(text);
      const expected = nativeOk(text);
      if (text.trim() === "") continue;
      assert.equal(mine.state === "valid", expected, `${JSON.stringify(text)} -> ${mine.error?.message}`);
      if (!expected) {
        invalid++;
        assert.ok(mine.error.offset >= 0 && mine.error.offset <= text.length);
        assert.ok(mine.error.line >= 1 && mine.error.column >= 1);
      }
    }
    assert.ok(invalid > 5_000, `the mutations must produce many invalid texts (got ${invalid})`);
  });
});

