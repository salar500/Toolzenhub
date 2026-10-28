/**
 * Learning: the optional saved progress (assets/js/learning/progress-store.js).
 * Saving is opt-in and holds untrusted data on read, so the tests are mostly hostile input.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
    KEY, MAX_BYTES, FORMAT, emptyState, validateState, readText, readImport, serialize, exportText, exportFileName,
    mergeStates, countCards, createStore
} from "../../assets/js/learning/progress-store.js";

const known = {
    json: { version: "1.0.0", cardIds: new Set(["json-a", "json-b", "json-c"]) },
    http: { version: "1.0.0", cardIds: new Set(["http-a"]) }
};

const good = () => ({ v: 1, decks: { json: { version: "1.0.0", cards: { "json-a": { box: 2, day: 100 }, "json-b": { box: 1, day: 101 } } } } });

function fakeStorage(extra = {}) {
    const data = new Map(Object.entries(extra));
    let writes = 0;
    return {
        data,
        get writes() { return writes; },
        getItem: (k) => (data.has(k) ? data.get(k) : null),
        setItem: (k, v) => { writes += 1; data.set(k, String(v)); },
        removeItem: (k) => { data.delete(k); }
    };
}

describe("validating saved state", () => {

    it("keeps valid entries", () => {
        const { state, notices } = validateState(good(), known);
        assert.deepEqual(state.decks.json.cards["json-a"], { box: 2, day: 100 });
        assert.equal(countCards(state), 2);
        assert.deepEqual(notices, []);
    });

    it("ignores anything that is not an object of the right version", () => {
        for (const v of [null, [], "x", 5, { v: 2, decks: {} }, { v: 1 }, { v: 1, decks: [] }]) {
            const { state, notices } = validateState(v, known);
            assert.deepEqual(state, emptyState());
            assert.ok(notices.length > 0);
        }
    });

    it("drops cards that no longer exist, and bad boxes, days and types, but keeps the rest", () => {
        const value = good();
        value.decks.json.cards["gone-card"] = { box: 1, day: 1 };
        value.decks.json.cards["json-c"] = { box: 9, day: 1 };
        value.decks.json.cards["json-b"] = { box: 1, day: -4 };
        const { state, notices } = validateState(value, known);
        assert.deepEqual(Object.keys(state.decks.json.cards), ["json-a"]);
        assert.match(notices.join(" "), /3 saved cards/);
    });

    it("drops unknown decks and a deck with the wrong shape", () => {
        const value = { v: 1, decks: { nope: { version: "1.0.0", cards: {} }, http: "x", json: { version: 1, cards: {} } } };
        const { state, notices } = validateState(value, known);
        assert.deepEqual(state.decks, {});
        assert.match(notices.join(" "), /3 saved decks/);
    });

    it("rewrites the deck version to the current one, so a changed deck keeps matching cards", () => {
        const value = good();
        value.decks.json.version = "0.9.0";
        assert.equal(validateState(value, known).state.decks.json.version, "1.0.0");
    });

    it("rejects prototype-polluting keys without changing Object.prototype", () => {
        const text = '{"v":1,"decks":{"__proto__":{"version":"1.0.0","cards":{}},"json":{"version":"1.0.0","cards":{"__proto__":{"box":1,"day":1},"constructor":{"box":1,"day":1},"json-a":{"box":1,"day":1,"__proto__":{"polluted":true}}}}}}';
        const { state } = readText(text, known);
        assert.deepEqual(Object.keys(state.decks.json.cards), ["json-a"]);
        assert.equal({}.polluted, undefined);
        assert.equal(Object.prototype.polluted, undefined);
        assert.equal(Object.hasOwn(state.decks, "__proto__"), false);
        assert.deepEqual(Object.keys(state.decks.json.cards["json-a"]).sort(), ["box", "day"]);
    });

    it("strips unexpected fields from entries", () => {
        const value = good();
        value.decks.json.cards["json-a"].answer = "my secret answer";
        const { state } = validateState(value, known);
        assert.deepEqual(state.decks.json.cards["json-a"], { box: 2, day: 100 });
    });

    it("rejects too many decks and too many cards", () => {
        const decks = {};
        for (let i = 0; i < 25; i += 1) decks[`d${i}`] = { version: "1.0.0", cards: {} };
        assert.ok(validateState({ v: 1, decks }, known).notices.length > 0);
        const cards = {};
        for (let i = 0; i < 2001; i += 1) cards[`c${i}`] = { box: 1, day: 1 };
        assert.deepEqual(validateState({ v: 1, decks: { json: { version: "1.0.0", cards } } }, known).state.decks, {});
    });

});

describe("reading stored text", () => {

    it("treats nothing as empty and corrupt text as ignored, never throwing", () => {
        assert.equal(readText(null, known).empty, true);
        assert.equal(readText("", known).empty, true);
        for (const t of ["{", "not json", "[1,2", "\u0000", "{\"v\":"]) {
            const r = readText(t, known);
            assert.deepEqual(r.state, emptyState());
            assert.ok(r.notices.length === 1);
        }
    });

    it("refuses text over the size limit before parsing", () => {
        const big = " ".repeat(MAX_BYTES + 1) + "{}";
        const r = readText(big, known);
        assert.equal(r.rejected, true);
        assert.match(r.notices[0], /larger than 100 KB/);
    });

    it("parses text of exactly the limit", () => {
        const body = JSON.stringify(good());
        const padded = body + " ".repeat(MAX_BYTES - body.length);
        assert.equal(padded.length, MAX_BYTES);
        assert.equal(countCards(readText(padded, known).state), 2);
    });

});

describe("writing and exporting", () => {

    it("serialises only the version and the decks", () => {
        const text = serialize({ v: 1, decks: good().decks, extra: "x" });
        assert.deepEqual(Object.keys(JSON.parse(text)).sort(), ["decks", "v"]);
    });

    it("refuses to serialise past the limit", () => {
        const cards = {};
        for (let i = 0; i < 2000; i += 1) cards[`json-card-with-a-long-identifier-number-${i}`] = { box: 5, day: 999999 };
        assert.throws(() => serialize({ v: 1, decks: { a: { version: "1.0.0", cards }, b: { version: "1.0.0", cards }, c: { version: "1.0.0", cards } } }), RangeError);
    });

    it("exports a marked file with nothing but the progress", () => {
        const parsed = JSON.parse(exportText(good()));
        assert.deepEqual(Object.keys(parsed).sort(), ["decks", "format", "v"]);
        assert.equal(parsed.format, FORMAT);
        assert.deepEqual(Object.keys(parsed.decks.json), ["version", "cards"]);
        assert.equal(exportFileName("2026-10-28"), "toolzenhub-flashcards-progress-2026-10-28.json");
    });

    it("round-trips through import", () => {
        const r = readImport(exportText(good()), known);
        assert.equal(r.keptCards, 2);
        assert.deepEqual(r.state, good());
    });

});

describe("importing a file", () => {

    it("refuses an empty file, a big file, invalid JSON and the wrong format, leaving a clear error", () => {
        assert.match(readImport("", known).error, /empty/);
        assert.match(readImport("x".repeat(MAX_BYTES + 1), known).error, /larger than 100 KB/);
        assert.match(readImport("{not json", known).error, /not valid JSON/);
        assert.match(readImport("[]", known).error, /not a ToolZen Hub/);
        assert.match(readImport(JSON.stringify({ v: 1, decks: {} }), known).error, /not a ToolZen Hub/);
    });

    it("refuses a file of the wrong version", () => {
        const r = readImport(JSON.stringify({ format: FORMAT, v: 7, decks: {} }), known);
        assert.ok(r.error);
    });

    it("never treats text in the file as markup or code: it only ever sees ids it already knows", () => {
        const value = { format: FORMAT, v: 1, decks: { json: { version: "1.0.0", cards: { "<img src=x onerror=alert(1)>": { box: 1, day: 5 }, "json-a": { box: 1, day: 5 } } } } };
        const r = readImport(JSON.stringify(value), known);
        assert.deepEqual(Object.keys(r.state.decks.json.cards), ["json-a"]);
    });

    it("merges by the later review day and leaves the originals untouched", () => {
        const current = { v: 1, decks: { json: { version: "1.0.0", cards: { "json-a": { box: 3, day: 200 }, "json-b": { box: 1, day: 50 } } } } };
        const incoming = { v: 1, decks: { json: { version: "1.0.0", cards: { "json-a": { box: 1, day: 100 }, "json-b": { box: 4, day: 90 }, "json-c": { box: 2, day: 10 } } }, http: { version: "1.0.0", cards: { "http-a": { box: 2, day: 3 } } } } };
        const before = JSON.stringify(current);
        const m = mergeStates(current, incoming);
        assert.deepEqual(m.decks.json.cards, { "json-a": { box: 3, day: 200 }, "json-b": { box: 4, day: 90 }, "json-c": { box: 2, day: 10 } });
        assert.equal(countCards(m), 4);
        assert.equal(JSON.stringify(current), before);
    });

});

describe("the storage adapter", () => {

    it("writes nothing until write() is called, and uses only its own key", () => {
        const s = fakeStorage({ other: "keep me" });
        const store = createStore(() => s);
        assert.equal(store.available(), true);
        assert.equal(store.isOn(), false);
        assert.equal(s.writes, 0);
        assert.equal(store.write(good()).ok, true);
        assert.equal(store.isOn(), true);
        assert.deepEqual([...s.data.keys()].sort(), [KEY, "other"].sort());
        assert.equal(KEY, "tz-learn-v1");
    });

    it("clear removes only this key", () => {
        const s = fakeStorage({ other: "keep me", "tz-analytics-consent": "granted" });
        const store = createStore(() => s);
        store.write(good());
        assert.equal(store.clear(), true);
        assert.equal(s.data.get("other"), "keep me");
        assert.equal(s.data.get("tz-analytics-consent"), "granted");
        assert.equal(s.data.has(KEY), false);
    });

    it("survives a missing, blocked or full storage", () => {
        const missing = createStore(() => null);
        assert.equal(missing.available(), false);
        assert.equal(missing.isOn(), false);
        assert.equal(missing.read(), null);
        assert.deepEqual(missing.write(good()), { ok: false, reason: "unavailable" });
        assert.equal(missing.clear(), true);

        const throwingGetter = createStore(() => { throw new Error("SecurityError"); });
        assert.equal(throwingGetter.available(), false);
        assert.deepEqual(throwingGetter.write(good()), { ok: false, reason: "unavailable" });

        const full = { getItem: () => null, setItem: () => { throw new DOMException("full", "QuotaExceededError"); }, removeItem: () => {} };
        assert.deepEqual(createStore(() => full).write(good()), { ok: false, reason: "blocked" });

        const throwsOnRead = { getItem: () => { throw new Error("denied"); }, setItem: () => {}, removeItem: () => { throw new Error("denied"); } };
        const store = createStore(() => throwsOnRead);
        assert.equal(store.available(), false);
        assert.equal(store.read(), null);
        assert.equal(store.clear(), false);
    });

});

describe("what the site says about saved progress", () => {

    const flat = (file) => fs.readFileSync(new URL(file, import.meta.url), "utf8").replace(/&ldquo;|&rdquo;|&rsquo;/g, "'").replace(/\s+/g, " ");

    it("the privacy page names the key, says it is off until turned on, and says no answers or analytics", () => {
        const page = flat("../../src/privacy.njk");
        assert.match(page, /Saved Flashcard Progress/);
        assert.match(page, /only if you turn on 'Save my progress on this device'/);
        assert.match(page, /It is off until you do/);
        assert.match(page, /tz-learn-v1/);
        assert.match(page, /does not hold your answers/);
        assert.match(page, /not shared with analytics/);
        assert.match(page, /The Practice Labs do not save anything/);
    });

    it("rule 7.7 records the narrow exception once, with the same key and limit", () => {
        const rules = flat("../../docs/product-decision-rules.md");
        assert.equal((rules.match(/Approved exception \(owner, 2026-10-28\), learning tools only/g) ?? []).length, 1);
        assert.match(rules, /`tz-learn-v1`, at most 100 KB/);
        assert.match(rules, /Saving is off by default/);
    });

    it("the key and the limit in the rule are the ones the code uses", () => {
        assert.equal(KEY, "tz-learn-v1");
        assert.equal(MAX_BYTES, 100 * 1024);
    });

});
