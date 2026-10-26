/**
 * Tool Pack 37: the URL Parser & Encoder engine.
 *
 * Expected values are hand-derived from RFC 3986 and the WHATWG URL
 * Standard (and agree with Python urllib.parse where the two standards
 * agree; the WHATWG-only cases are pinned by hand). They are not copied
 * from the engine's output. Covers AC-UP-001..028, 034.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
    parseUrl,
    parseQuery,
    percentEncode,
    formEncode,
    percentDecode,
    buildQuery,
    withQuery,
    firstInvalidUtf8,
    MAX_PARSE_CHARS,
    MAX_CODEC_CHARS,
    MAX_QUERY_ROWS
} from "../../assets/js/tools/url-parser/url-engine.js";

const FULL =
    "https://user:pw@Example.COM:443/a/./b/../c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag";

test("parse: the worked example", () => {
    const r = parseUrl(FULL);
    assert.equal(r.ok, true);
    assert.equal(r.href, "https://user:pw@example.com/a/c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag");
    assert.deepEqual(r.components, {
        scheme: "https",
        username: "user",
        password: "pw",
        host: "example.com",
        port: "default for the scheme",
        path: "/a/c%20d",
        query: "?x=1&x=2&y=a+b&z=%E4%BD%A0",
        fragment: "#frag",
        origin: "https://example.com"
    });
    assert.deepEqual(r.segments.map((s) => s.text), ["a", "c d"]);
    assert.deepEqual(r.changes, ["host lowercased", "default port removed", "dot segments resolved"]);
    assert.equal(r.normalized, false);
    assert.ok(r.warnings.includes("This URL contains credentials."));
    assert.deepEqual(
        r.params.map((p) => [p.name, p.value, p.repeated]),
        [["x", "1", true], ["x", "2", true], ["y", "a b", false], ["z", "你", false]]
    );
});

test("parse: leading and trailing spaces are noted, not kept", () => {
    const r = parseUrl(" https://example.com ");
    assert.equal(r.href, "https://example.com/");
    assert.deepEqual(r.notes, ["Leading or trailing spaces were ignored."]);
});

test("parse: no scheme and no base is refused, not guessed", () => {
    const r = parseUrl("example.com/path");
    assert.equal(r.ok, false);
    assert.equal(r.message, "This is not an absolute URL. Add a scheme such as https:// or give a Base URL.");
});

test("parse: a relative reference resolves against the base (RFC 3986 5.2)", () => {
    const r = parseUrl("../x", "https://example.com/a/b/c");
    assert.equal(r.href, "https://example.com/a/x");
    assert.equal(parseUrl("x", "not a url").field, "base");
});

test("parse: failures carry at most one deterministic hint", () => {
    assert.match(parseUrl("https://exa mple.com").message, /space or other forbidden character/);
    assert.match(parseUrl("http://a:99999").message, /port is outside the range 0 to 65535/);
    assert.equal(parseUrl("http://").message, "The browser could not parse this as a URL.");
});

test("parse: scheme, host and default port are normalized and named", () => {
    const r = parseUrl("HTTP://EXAMPLE.com:80/");
    assert.equal(r.components.scheme, "http");
    assert.equal(r.components.host, "example.com");
    assert.equal(r.components.port, "default for the scheme");
    assert.equal(r.components.origin, "http://example.com");
});

test("parse: an internationalized host is shown as punycode with a warning", () => {
    const r = parseUrl("https://bücher.de/");
    assert.equal(r.components.host, "xn--bcher-kva.de");
    assert.ok(r.warnings.some((w) => w.includes("xn--")));
    assert.ok(r.changes.includes("non-ASCII host converted to punycode"));
});

test("parse: path segments are decoded for display, bad UTF-8 stays raw", () => {
    const r = parseUrl("/a%20b/%FF", "https://e.com");
    assert.deepEqual(r.segments.map((s) => [s.text, s.note]), [["a b", null], ["%FF", "not valid UTF-8"]]);
});

test("parse: an already normalized URL says so", () => {
    const r = parseUrl("https://example.com/a?x=1");
    assert.equal(r.normalized, true);
    assert.deepEqual(r.changes, []);
});

test("parse: a bare host gets no false change report for the added slash", () => {
    assert.equal(parseUrl("https://example.com").normalized, true);
});

test("parse: query rows keep order, repeats, empties and a missing =", () => {
    const rows = parseQuery("?a=1&a=2&b&c=%20&d=x+y");
    assert.deepEqual(
        rows.map((r) => [r.name, r.value, r.hasEquals, r.repeated]),
        [["a", "1", true, true], ["a", "2", true, true], ["b", "", false, false], ["c", " ", true, false], ["d", "x y", true, false]]
    );
});

test("parse: malformed percent sequences are located per component and the text is untouched", () => {
    const r = parseUrl("https://e.com/%zz?q=%4&r=100%");
    assert.deepEqual(
        r.malformed.map((m) => [m.component, m.position, m.sequence]),
        [["path", 1, "%zz"], ["query", 3, "%4&"], ["query", 11, "%"]]
    );
    assert.equal(r.href, "https://e.com/%zz?q=%4&r=100%");
});

test("parse: javascript: is parsed as text and warned about, never run", () => {
    const r = parseUrl("javascript:alert(1)");
    assert.equal(r.ok, true);
    assert.equal(r.components.scheme, "javascript");
    assert.equal(r.components.origin, "opaque");
    assert.equal(r.segments, null);
    assert.ok(r.warnings.includes("This URL can run or embed content. It is shown as text and is never opened."));
});

test("parse: a value that is still percent-encoded is flagged as possibly double encoded", () => {
    const r = parseUrl("https://e.com/?v=%2520");
    assert.equal(r.params[0].value, "%20");
    assert.ok(r.warnings.some((w) => w.includes("encoded twice")));
});

test("parse: the length limit is exact", () => {
    const base = "https://e.com/?a=";
    const ok = parseUrl(base + "a".repeat(MAX_PARSE_CHARS - base.length));
    assert.equal(ok.ok, true);
    const over = parseUrl(base + "a".repeat(MAX_PARSE_CHARS - base.length + 1));
    assert.equal(over.ok, false);
    assert.match(over.message, /100,000 characters/);
});

test("percent-encode: RFC 3986 unreserved set, uppercase hex, UTF-8", () => {
    assert.equal(percentEncode("a b&c=d/é").value, "a%20b%26c%3Dd%2F%C3%A9");
    assert.equal(percentEncode("!'()*").value, "%21%27%28%29%2A");
    assert.equal(percentEncode("!'()*", { keepSpecials: true }).value, "!'()*");
    assert.equal(percentEncode("-._~").value, "-._~");
    assert.equal(percentEncode("😀").value, "%F0%9F%98%80");
});

test("percent-encode agrees with Python quote(s, safe='') on its first cases", () => {
    // quote("a b&c=d/é", safe="") == "a%20b%26c%3Dd%2F%C3%A9"; quote("~") == "~" (Python 3.7+)
    assert.equal(percentEncode("~").value, "~");
});

test("form-encode: space is +, * - . _ stay, ~ is escaped (WHATWG serializer)", () => {
    assert.equal(formEncode("a b*c-d.e_f~g").value, "a+b*c-d.e_f%7Eg");
});

test("encode: counts are in characters, output characters and UTF-8 bytes", () => {
    const r = percentEncode("é");
    assert.deepEqual([r.chars, r.outChars, r.bytes], [1, 6, 2]);
});

test("encode: a lone surrogate is an error with a position, never U+FFFD", () => {
    const r = percentEncode("a\uD800b");
    assert.equal(r.ok, false);
    assert.equal(r.position, 1);
    assert.equal(formEncode("\uDC00").ok, false);
});

test("decode: strict, with positions and no replacement character", () => {
    assert.equal(percentDecode("%41%42").value, "AB");
    assert.equal(percentDecode("a+b").value, "a+b");
    assert.equal(percentDecode("100%").position, 3);
    assert.equal(percentDecode("%zz").position, 0);
    assert.equal(percentDecode("%4").ok, false);
    const bad = percentDecode("%C3%28");
    assert.equal(bad.ok, false);
    assert.equal(bad.position, 0);
    assert.match(bad.message, /not valid UTF-8/);
    assert.ok(!JSON.stringify(bad).includes("�"));
});

test("decode: form decoding reads + as a space, percent decoding does not", () => {
    assert.equal(percentDecode("a+b%20c", { plusAsSpace: true }).value, "a b c");
});

test("decode: a result that still holds %XX is flagged, and decoding is not repeated", () => {
    const r = percentDecode("%2541");
    assert.equal(r.value, "%41");
    assert.equal(r.stillEncoded, true);
});

test("decode: multi-byte and astral characters round-trip", () => {
    assert.equal(percentDecode("%F0%9F%98%80").value, "😀");
    for (const s of ["", "plain", "a b&c=d/é", "日本語 😀", "100%"]) {
        assert.equal(percentDecode(percentEncode(s).value).value, s);
        assert.equal(percentDecode(formEncode(s).value, { plusAsSpace: true }).value, s);
    }
});

test("limits: encode and decode accept the limit and refuse one more", () => {
    assert.equal(percentEncode("a".repeat(MAX_CODEC_CHARS)).ok, true);
    assert.equal(percentEncode("a".repeat(MAX_CODEC_CHARS + 1)).ok, false);
    assert.equal(percentDecode("a".repeat(MAX_CODEC_CHARS)).ok, true);
    assert.equal(percentDecode("a".repeat(MAX_CODEC_CHARS + 1)).ok, false);
});

test("UTF-8 validator: well-formed table (RFC 3629)", () => {
    assert.equal(firstInvalidUtf8(Uint8Array.of(0xC0, 0x80)), 0);
    assert.equal(firstInvalidUtf8(Uint8Array.of(0xED, 0xA0, 0x80)), 0);
    assert.equal(firstInvalidUtf8(Uint8Array.of(0xF4, 0x90, 0x80, 0x80)), 0);
    assert.equal(firstInvalidUtf8(Uint8Array.of(0x61, 0xE2, 0x82)), 1);
    assert.equal(firstInvalidUtf8(Uint8Array.of(0xE2, 0x82, 0xAC)), -1);
});

test("build: rows in order, repeats kept, both styles", () => {
    const rows = [{ name: "q", value: "a b" }, { name: "tag", value: "x&y" }, { name: "tag", value: "é" }];
    assert.equal(buildQuery(rows).query, "q=a%20b&tag=x%26y&tag=%C3%A9");
    assert.equal(buildQuery(rows, "form").query, "q=a+b&tag=x%26y&tag=%C3%A9");
});

test("build: blank rows are skipped and counted; a value without a name is an error", () => {
    const r = buildQuery([{ name: "a", value: "1" }, { name: "", value: "" }, { name: "b", value: "2" }]);
    assert.equal(r.query, "a=1&b=2");
    assert.equal(r.blankSkipped, 1);
    const bad = buildQuery([{ name: "a", value: "1" }, { name: "", value: "x" }]);
    assert.equal(bad.ok, false);
    assert.equal(bad.row, 2);
});

test("build: 100 rows accepted, 101 refused", () => {
    const row = { name: "a", value: "1" };
    assert.equal(buildQuery(Array(MAX_QUERY_ROWS).fill(row)).ok, true);
    assert.equal(buildQuery(Array(MAX_QUERY_ROWS + 1).fill(row)).ok, false);
});

test("build: the base URL's query is replaced and its fragment kept", () => {
    assert.equal(withQuery("https://e.com/p?old=1#f", "q=1").href, "https://e.com/p?q=1#f");
    assert.equal(withQuery("nope", "q=1").ok, false);
});

test("the engine never navigates, fetches or touches the page", () => {
    const code = readFileSync(
        new URL("../../assets/js/tools/url-parser/url-engine.js", import.meta.url),
        "utf8"
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    for (const banned of [
        "fetch(", "XMLHttpRequest", "sendBeacon", "window.open", "location", "document",
        "localStorage", "sessionStorage", "eval(", "new Function", "Date.now", "Math.random", "innerHTML"
    ]) {
        assert.ok(!code.includes(banned), `engine must not contain ${banned}`);
    }
});
