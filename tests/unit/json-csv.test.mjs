/**
 * Tool Pack 40: the JSON <-> CSV engine.
 *
 * Oracles: Python's csv module (tests/fixtures/json-csv-golden.py, 150 seeded tables) for both
 * directions, and hand-derived expectations for every rule in the engine header.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { jsonToCsv, csvToJson, parseCsv, MAX_CHARS, MAX_ROWS, MAX_COLUMNS, EXAMPLE_JSON, EXAMPLE_CSV } from "../../assets/js/tools/json-csv/json-csv-engine.js";

const golden = JSON.parse(readFileSync(new URL("../fixtures/json-csv-golden.json", import.meta.url), "utf8"));

test("golden (Python csv.writer): JSON -> CSV is byte-identical for 150 seeded tables, all four delimiters", () => {
    for (const c of golden) {
        const json = JSON.stringify(c.rows.map((row) => Object.fromEntries(c.header.map((h, i) => [h, row[i]]))));
        const r = jsonToCsv(json, { delimiter: c.delimiter, guard: false });
        assert.equal(r.ok, true, r.message);
        assert.equal(r.csv, c.csv, JSON.stringify(c.rows));
    }
});

test("golden (Python csv.reader): the parser reads the same records back", () => {
    for (const c of golden) {
        const p = parseCsv(c.csv, c.delimiter);
        assert.equal(p.ok, true);
        assert.deepEqual(p.records, [c.header, ...c.rows], JSON.stringify(c.rows));
    }
});

test("golden: CSV -> JSON -> CSV round trip is exact (all values strings)", () => {
    for (const c of golden) {
        const j = csvToJson(c.csv, { delimiter: c.delimiter });
        assert.equal(j.ok, true, j.message);
        assert.deepEqual(JSON.parse(j.json), c.rows.map((row) => Object.fromEntries(c.header.map((h, i) => [h, row[i]]))));
        const back = jsonToCsv(j.json, { delimiter: c.delimiter, guard: false });
        assert.equal(back.csv, c.csv);
    }
});

test("JSON -> CSV: columns in first-seen order, missing keys empty, numbers verbatim, booleans, null empty and counted", () => {
    const r = jsonToCsv('[{"a":1,"b":"x"},{"b":"y","c":1.50,"d":true},{"a":1e3,"d":null}]');
    assert.equal(r.csv, "a,b,c,d\n1,x,,\n,y,1.50,true\n1e3,,,");
    assert.equal(r.rows, 3);
    assert.equal(r.columns, 4);
    assert.ok(r.notes.includes("1 null was written as an empty cell. CSV cannot tell null from an empty string."));
});

test("JSON -> CSV: large and precise numbers are written exactly as in the text", () => {
    const r = jsonToCsv('[{"n":12345678901234567890,"m":0.1000000000000000055511151231257827,"e":-0.0}]');
    assert.equal(r.csv, "n,m,e\n12345678901234567890,0.1000000000000000055511151231257827,-0.0");
});

test("JSON -> CSV: quoting follows RFC 4180 and the chosen delimiter", () => {
    assert.equal(jsonToCsv('[{"a":"x,y","b":"say \\"hi\\"","c":"l1\\nl2"}]').csv, 'a,b,c\n"x,y","say ""hi""","l1\nl2"');
    assert.equal(jsonToCsv('[{"a":"x,y","b":"p;q"}]', { delimiter: ";" }).csv, 'a;b\nx,y;"p;q"');
    assert.equal(jsonToCsv('[{"a":"1","b":"2"}]', { delimiter: "\t" }).csv, "a\tb\n1\t2");
    assert.equal(jsonToCsv('[{"a":"1","b":"2"}]', { delimiter: "|" }).csv, "a|b\n1|2");
    assert.equal(jsonToCsv('[{"a":"1","b":"2"}]', { eol: "\r\n" }).csv, "a,b\r\n1,2");
});

test("formula guard: string cells and headers starting with = + - @ tab CR get a leading quote, numbers do not, and it is counted", () => {
    const r = jsonToCsv('[{"=h":"=SUM(A1)","n":-5,"s":"-5","p":"+1","at":"@cmd","tab":"\\tx","safe":"a=b","blank":""}]');
    assert.equal(r.csv, `'=h,n,s,p,at,tab,safe,blank\n'=SUM(A1),-5,'-5,'+1,'@cmd,'\tx,a=b,`.replace("'\tx", "'\tx"));
    assert.equal(r.guarded, 6);
    assert.ok(r.notes.some((n) => n.startsWith("6 cells were written with a leading '")));
    const off = jsonToCsv('[{"x":"=1+1"}]', { guard: false });
    assert.equal(off.csv, "x\n=1+1");
    assert.equal(off.guarded, 0);
});

test("nested values are refused by default naming row and column; the option writes JSON text; nothing is flattened silently", () => {
    const refuse = jsonToCsv('[{"a":1},{"a":1,"b":{"c":[1,2]}}]');
    assert.equal(refuse.ok, false);
    assert.equal(refuse.state, "nested");
    assert.match(refuse.message, /row 2, column "b" is an object/);
    assert.match(jsonToCsv('[{"a":[1]}]').message, /row 1, column "a" is an array/);
    const json = jsonToCsv('[{"a":{"c":[1,"x"],"d":null}}]', { nested: "json" });
    assert.equal(json.csv, 'a\n"{""c"":[1,""x""],""d"":null}"');
    assert.ok(json.notes.some((n) => n.startsWith("1 nested value was written as JSON text")));
});

test("JSON -> CSV: shape and syntax errors are specific", () => {
    assert.equal(jsonToCsv("").state, "empty");
    assert.equal(jsonToCsv('{"a":1}').state, "shape");
    assert.equal(jsonToCsv("[]").state, "shape");
    assert.match(jsonToCsv('[{"a":1}, 5]').message, /Item 2 is a number, not an object/);
    assert.match(jsonToCsv('[{"a":1}, [1]]').message, /Item 2 is an array/);
    const bad = jsonToCsv('[{"a":1,}]');
    assert.equal(bad.state, "invalid");
    assert.match(bad.message, /^This is not valid JSON: .*line 1, column/);
    assert.equal(jsonToCsv("x".repeat(MAX_CHARS + 1)).state, "too-large");
});

test("JSON -> CSV: duplicate keys use the last value and say so; __proto__ and constructor are ordinary column names", () => {
    const d = jsonToCsv('[{"a":1,"a":2}]');
    assert.equal(d.csv, "a\n2");
    assert.ok(d.notes.some((n) => n.includes("repeat")));
    const p = jsonToCsv('[{"__proto__":"x","constructor":"y","toString":"z"}]');
    assert.equal(p.csv, "__proto__,constructor,toString\nx,y,z");
    assert.deepEqual(Object.keys(Object.prototype), []);
});

test("JSON -> CSV: row and column limits", () => {
    const rows = "[" + Array(MAX_ROWS + 1).fill("{}").join(",") + "]";
    assert.equal(jsonToCsv(rows).state, "too-large");
    const wide = "[{" + Array.from({ length: MAX_COLUMNS + 1 }, (_, i) => `"k${i}":1`).join(",") + "}]";
    assert.equal(jsonToCsv(wide).state, "too-large");
    const ok = jsonToCsv("[" + Array(MAX_ROWS).fill('{"a":1}').join(",") + "]");
    assert.equal(ok.ok, true);
    assert.equal(ok.rows, MAX_ROWS);
});

test("CSV -> JSON: header objects, quoted fields, BOM, CR line ends, empty lines skipped and counted", () => {
    const r = csvToJson('﻿id,name\r\n1,"A, B"\r\n\r\n2,"say ""x"""\r3,\r\n');
    assert.equal(r.ok, true);
    assert.deepEqual(JSON.parse(r.json), [{ id: "1", name: "A, B" }, { id: "2", name: 'say "x"' }, { id: "3", name: "" }]);
    assert.ok(r.notes.includes("1 empty line was skipped."));
    assert.equal(r.rows, 3);
});

test("CSV -> JSON: a quoted empty single column is a record, an unquoted empty line is not", () => {
    assert.deepEqual(parseCsv('a\n""\n\nb', ",").records, [["a"], [""], ["b"]]);
    assert.equal(parseCsv('a\n""\n\nb', ",").skipped, 1);
});

test("CSV -> JSON: without a header the result is arrays; header-only gives an empty array", () => {
    assert.deepEqual(JSON.parse(csvToJson("1,2\n3,4", { header: false }).json), [["1", "2"], ["3", "4"]]);
    const h = csvToJson("a,b\n");
    assert.equal(h.json, "[]");
    assert.ok(h.notes.some((n) => n.includes("header row and no data rows")));
});

test("CSV -> JSON: every value stays a string; convert turns only exact JSON numbers (<=15 digits) and true/false", () => {
    const csv = "a,b,c,d,e,f,g,h,i\n1,-2.5e3,007,+5,true,TRUE,12345678901234567890,,0";
    const plain = JSON.parse(csvToJson(csv).json)[0];
    assert.deepEqual(Object.values(plain).every((v) => typeof v === "string"), true);
    const conv = csvToJson(csv, { convert: true });
    assert.deepEqual(JSON.parse(conv.json)[0], { a: 1, b: -2500, c: "007", d: "+5", e: true, f: "TRUE", g: "12345678901234567890", h: "", i: 0 });
    assert.ok(conv.notes.includes("4 values were converted to a number or true/false. Empty fields stay as empty strings."));
});

test("CSV -> JSON: refusals name the line, column or record", () => {
    assert.match(csvToJson('a,b\n1,"open').message, /quoted field that starts at line 2, column 3 is never closed/);
    assert.match(csvToJson('a,b\n"x"y,2').message, /Unexpected text after a closing quote at line 2, column 4/);
    const ragged = csvToJson("a,b\n1,2\n3");
    assert.equal(ragged.state, "ragged");
    assert.match(ragged.message, /Record 3 has 1 field, but the first record has 2/);
    assert.match(csvToJson("a,,c\n1,2,3").message, /Header column 2 has no name/);
    assert.match(csvToJson("a,b,a\n1,2,3").message, /"a" appears more than once \(column 3\)/);
    assert.equal(csvToJson("  \n ").state, "empty");
});

test("CSV -> JSON: header names such as __proto__ become own keys in the text; the output is valid JSON", () => {
    const r = csvToJson("__proto__,constructor\n1,2");
    assert.equal(r.json, '[\n  {"__proto__": "1", "constructor": "2"}\n]');
    assert.equal(Object.getPrototypeOf(JSON.parse(r.json)[0]), Object.prototype);
    assert.equal(Object.keys(JSON.parse(r.json)[0]).includes("__proto__"), true);
});

test("CSV -> JSON: limits and the other delimiters", () => {
    assert.equal(csvToJson("a\n".repeat(MAX_ROWS + 2)).state, "too-large");
    assert.equal(csvToJson(Array.from({ length: MAX_COLUMNS + 1 }, (_, i) => `c${i}`).join(",") + "\n1").state, "too-large");
    assert.deepEqual(JSON.parse(csvToJson("a;b\n1;2", { delimiter: ";" }).json), [{ a: "1", b: "2" }]);
    assert.deepEqual(JSON.parse(csvToJson("a\tb\n1\t2", { delimiter: "\t" }).json), [{ a: "1", b: "2" }]);
    assert.deepEqual(JSON.parse(csvToJson("a|b\n1|2", { delimiter: "|" }).json), [{ a: "1", b: "2" }]);
    assert.equal(csvToJson("a,b\n1;2", { delimiter: ";" }).state, "ragged");
});

test("the examples convert both ways", () => {
    const a = jsonToCsv(EXAMPLE_JSON);
    assert.equal(a.ok, true);
    assert.match(a.csv, /'=SUM\(A1:A9\)/);
    assert.equal(csvToJson(EXAMPLE_CSV).ok, true);
});

test("a large CSV converts quickly", () => {
    const csv = "a,b,c\n" + Array.from({ length: 15000 }, (_, i) => `${i},"x ${i}",y`).join("\n");
    const t = Date.now();
    const r = csvToJson(csv);
    assert.equal(r.rows, 15000);
    const back = jsonToCsv(r.json);
    assert.equal(back.rows, 15000);
    assert.ok(Date.now() - t < 4000, `${Date.now() - t} ms`);
});

test("the engine is pure: no DOM, network, storage, clock, randomness or code execution", () => {
    const code = readFileSync(new URL("../../assets/js/tools/json-csv/json-csv-engine.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const banned of ["fetch(", "XMLHttpRequest", "document.", "window.", "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "innerHTML", "setTimeout", "new RegExp"]) {
        assert.ok(!code.includes(banned), `engine must not contain ${banned}`);
    }
});
