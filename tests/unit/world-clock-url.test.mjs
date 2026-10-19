/**
 * World Clock (Tool Pack 28): the shareable address (cities= and ref=).
 *
 * Every value in an address is untrusted: it is validated, bounded and never echoed. Nothing is stored.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_CITIES, MAX_QUERY_CHARS, MAX_CITIES_PARAM_CHARS, MAX_TOKENS_EXAMINED,
  parseBoardQuery, buildBoardQuery, placeFromEntry, resolveToken,
} from "../../assets/js/tools/world-clock/clock-engine.js";
import { DIRECTORY, getEntry } from "../../assets/js/tools/world-clock/city-directory.js";

const keys = (r) => r.places.map((p) => p.key);

describe("reading an address", () => {
  test("no cities parameter: nothing present, nothing skipped, the page uses its starter board", () => {
    for (const q of ["", "?", "?x=1", "?ref=mumbai-in", "?cities"]) {
      const r = parseBoardQuery(q);
      assert.deepEqual([r.places.length, r.skipped, r.ref], [0, 0, null], q);
    }
    assert.equal(parseBoardQuery("?x=1").present, false);
    assert.equal(parseBoardQuery("?cities=").present, true);
  });

  test("directory ids and browser zones are accepted, in order, with the ref", () => {
    const r = parseBoardQuery("?cities=mumbai-in,London/x,America/New_York,tokyo-jp&ref=tokyo-jp");
    assert.deepEqual(keys(r), ["mumbai-in", "America/New_York", "tokyo-jp"]);
    assert.equal(r.ref, "tokyo-jp");
    assert.equal(r.skipped, 1); // London/x is not a zone
    const zones = parseBoardQuery("?cities=UTC,Asia/Calcutta");
    assert.deepEqual(zones.places.map((p) => [p.kind, p.zone]), [["zone", "UTC"], ["zone", "Asia/Calcutta"]]);
  });

  test("a ref must name a city already on the board, else it is ignored", () => {
    assert.equal(parseBoardQuery("?cities=mumbai-in&ref=london-gb").ref, null);
    assert.equal(parseBoardQuery("?cities=mumbai-in&ref=__proto__").ref, null);
    assert.equal(parseBoardQuery("?cities=America/New_York&ref=America/New_York").ref, "America/New_York");
    assert.equal(parseBoardQuery("?cities=Asia/Kolkata&ref=Asia/Calcutta").ref, "Asia/Kolkata"); // one zone under two spellings
  });

  test("duplicates keep the first; a bare zone may repeat a listed city's zone because the labels differ", () => {
    assert.deepEqual(keys(parseBoardQuery("?cities=mumbai-in,mumbai-in,delhi-in")), ["mumbai-in", "delhi-in"]);
    assert.deepEqual(keys(parseBoardQuery("?cities=Asia/Kolkata,Asia/Calcutta")), ["Asia/Kolkata"]);
    assert.deepEqual(keys(parseBoardQuery("?cities=mumbai-in,Asia/Kolkata")), ["mumbai-in", "Asia/Kolkata"]);
    assert.equal(parseBoardQuery("?cities=mumbai-in,mumbai-in").skipped, 0);
  });

  test("at most MAX_CITIES are kept and at most 20 tokens are looked at; the rest are counted as skipped", () => {
    const ids = DIRECTORY.slice(0, 30).map((e) => e.id);
    const r = parseBoardQuery(`?cities=${ids.join(",")}`.slice(0, 590) + "");
    assert.ok(r.places.length <= MAX_CITIES);
    const eighteen = parseBoardQuery(`?cities=${DIRECTORY.slice(0, 18).map((e) => e.id).join(",")}`);
    assert.equal(eighteen.places.length, MAX_CITIES);
    assert.equal(eighteen.skipped, 18 - MAX_CITIES);
    assert.equal(MAX_TOKENS_EXAMINED, 20);
    const many = parseBoardQuery(`?cities=${Array(40).fill("mumbai-in").join(",")}`);
    assert.equal(many.places.length, 1);
    assert.ok(many.skipped >= 1, "tokens past the 20th are reported as not examined");
  });

  test("length limits: the whole query string is cut at 2000 characters and the cities value at 600", () => {
    assert.equal(MAX_QUERY_CHARS, 2000);
    assert.equal(MAX_CITIES_PARAM_CHARS, 600);
    const pad = "x".repeat(2100);
    assert.equal(parseBoardQuery(`?pad=${pad}&cities=mumbai-in`).places.length, 0); // cities begins after the cut
    const long = `mumbai-in,${"a".repeat(700)}`;
    const r = parseBoardQuery(`?cities=${long}`);
    assert.deepEqual(keys(r), ["mumbai-in"]);
  });

  test("hostile and malformed values are skipped, never echoed, and never throw", () => {
    const hostile = [
      "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "javascript:alert(1)", "' OR 1=1 --", "\"onfocus=\"alert(1)", "${7*7}", "{{7*7}}",
      "__proto__", "constructor", "prototype", "hasOwnProperty", "../../etc/passwd", "a".repeat(100), "mumbai-in\u0000", "mumbai-IN", "MUMBAI-IN",
      "%zz", "mumbai-in%2Cdelhi-in", "‮mumbai-in", "mumbai-xx", "Mumbai", "Asia/../Kolkata", "+05:30", "UTC+5", "GMT", "EST5EDT",
    ];
    for (const value of hostile) {
      const r = parseBoardQuery(`?cities=${encodeURIComponent(value)}&ref=${encodeURIComponent(value)}`);
      assert.deepEqual(r.places, [], JSON.stringify(value));
      assert.equal(r.ref, null, JSON.stringify(value));
      assert.ok(r.skipped >= 1, JSON.stringify(value));
      assert.ok(!JSON.stringify(r).includes("script") && !JSON.stringify(r).includes("onerror"), "the raw text is never part of the result");
    }
    for (const bad of [null, undefined, 5, {}, "%", "?cities=%E0%A4%A", "?cities=,,,", "?&&&", "?cities[]=x"]) {
      assert.doesNotThrow(() => parseBoardQuery(bad), String(bad));
    }
  });

  test("whitespace around a token is tolerated; empty tokens are ignored without counting", () => {
    const r = parseBoardQuery("?cities=%20mumbai-in%20,,%20,delhi-in");
    assert.deepEqual(keys(r), ["mumbai-in", "delhi-in"]);
    assert.equal(r.skipped, 0);
  });

  test("a directory id the browser cannot honour, or one that is absent from an empty directory, is skipped", () => {
    assert.equal(resolveToken("mumbai-in", []), null);
    const r = parseBoardQuery("?cities=mumbai-in,Asia/Kolkata", []);
    assert.deepEqual(keys(r), ["Asia/Kolkata"]);
    assert.equal(r.skipped, 1);
  });
});

describe("writing an address", () => {
  const places = (...ids) => ids.map((id) => placeFromEntry(getEntry(id)));

  test("directory ids and zones, with commas and slashes left readable", () => {
    assert.equal(buildBoardQuery({ places: places("mumbai-in", "london-gb") }), "?cities=mumbai-in,london-gb");
    assert.equal(buildBoardQuery({ places: [resolveToken("America/Indiana/Knox"), ...places("tokyo-jp")] }), "?cities=America/Indiana/Knox,tokyo-jp");
  });

  test("ref is written only when it names a city on the board", () => {
    assert.equal(buildBoardQuery({ places: places("mumbai-in", "london-gb"), ref: "london-gb" }), "?cities=mumbai-in,london-gb&ref=london-gb");
    assert.equal(buildBoardQuery({ places: places("mumbai-in"), ref: "london-gb" }), "?cities=mumbai-in");
    assert.equal(buildBoardQuery({ places: places("mumbai-in"), ref: null }), "?cities=mumbai-in");
  });

  test("an empty board writes no query", () => {
    assert.equal(buildBoardQuery({ places: [] }), "");
  });

  test("what is written is read back unchanged (a round trip), for boards of every size", () => {
    for (const n of [1, 2, 5, MAX_CITIES]) {
      const board = DIRECTORY.slice(0, n).map(placeFromEntry);
      const query = buildBoardQuery({ places: board, ref: board[n - 1].key });
      const back = parseBoardQuery(query);
      assert.deepEqual(keys(back), board.map((p) => p.key));
      assert.equal(back.ref, board[n - 1].key);
      assert.equal(back.skipped, 0);
      assert.ok(query.length < MAX_CITIES_PARAM_CHARS, "a full board fits the cities limit");
    }
  });
});
