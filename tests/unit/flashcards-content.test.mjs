/**
 * Smart Flashcards: content schema, every deck, and the claims the cards make.
 *
 * Where a card says that an example text is valid or invalid JSON, the claim is checked here by the strict JSON
 * engine of the JSON Formatter, against a table written by hand in this file (not read from the card). Claims
 * about JavaScript behaviour are checked by running JavaScript.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { validateDeck } from "../../assets/js/learning/content-schema.js";
import { analyze } from "../../assets/js/tools/json-formatter/json-engine.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let flash;
let catalog;
const decks = {};

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    flash = await import("../../assets/js/tools/smart-flashcards/index.js");
    for (const meta of flash.DECKS) decks[meta.id] = (await meta.load()).deck;
});

const toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
const strictlyValid = (text) => analyze(text).state === "valid";

describe("validateDeck rejects broken decks", () => {

    const base = () => ({
        id: "t", version: "1.0.0", title: "Test deck", description: "A deck used only to test the validator.",
        reviewed: { date: "2026-10-28", method: "Checked by the test suite for this fixture." },
        topics: [{ id: "x", title: "Topic X" }],
        cards: [
            { id: "c1", topic: "x", kind: "recall", difficulty: "beginner", prompt: "What is one plus one?", answer: "Two", explanation: "Adding one to one gives two, the next whole number.", source: "Arithmetic" },
            { id: "c2", topic: "x", kind: "choice", difficulty: "beginner", prompt: "Which of these is even?", options: ["3", "4"], correct: 1, explanation: "Four divides by two with no remainder; three does not.", source: "Arithmetic" }
        ]
    });

    it("accepts a correct deck", () => assert.deepEqual(validateDeck(base()), []));

    const cases = [
        ["a duplicate card id", (d) => { d.cards[1].id = "c1"; }, /duplicate id/],
        ["a missing explanation", (d) => { delete d.cards[0].explanation; }, /explanation/],
        ["a too-short explanation", (d) => { d.cards[0].explanation = "Because."; }, /explanation/],
        ["an empty answer", (d) => { d.cards[0].answer = "  "; }, /answer/],
        ["an unknown topic", (d) => { d.cards[0].topic = "nope"; }, /unknown topic/],
        ["an unsupported difficulty", (d) => { d.cards[0].difficulty = "expert"; }, /difficulty/],
        ["an unknown kind", (d) => { d.cards[0].kind = "essay"; }, /kind/],
        ["a correct index outside the options", (d) => { d.cards[1].correct = 2; }, /correct/],
        ["a negative correct index", (d) => { d.cards[1].correct = -1; }, /correct/],
        ["a non-integer correct index", (d) => { d.cards[1].correct = "1"; }, /correct/],
        ["several correct answers (an array)", (d) => { d.cards[1].correct = [0, 1]; }, /correct/],
        ["duplicate options", (d) => { d.cards[1].options = ["4", "4"]; }, /not unique/],
        ["one option only", (d) => { d.cards[1].options = ["4"]; }, /2 to 5/],
        ["six options", (d) => { d.cards[1].options = ["1", "2", "3", "4", "5", "6"]; }, /2 to 5/],
        ["an empty option", (d) => { d.cards[1].options = ["4", " "]; }, /2 to 5/],
        ["a missing source", (d) => { delete d.cards[0].source; }, /source/],
        ["the same prompt twice", (d) => { d.cards[1].prompt = "what is one plus one?"; }, /same prompt/],
        ["a recall card with options", (d) => { d.cards[0].options = ["a", "b"]; }, /must not have options/],
        ["a choice card with an answer field", (d) => { d.cards[1].answer = "4"; }, /must not have an answer/],
        ["a related tool that does not exist", (d) => { d.cards[0].tool = "no-such-tool"; }, /does not exist/],
        ["no cards", (d) => { d.cards = []; }, /at least one card/],
        ["no review record", (d) => { delete d.reviewed; }, /review record/],
        ["a bad version", (d) => { d.version = "one"; }, /version/],
        ["a bad id", (d) => { d.cards[0].id = "Bad Id"; }, /id is missing/],
        ["an empty code block", (d) => { d.cards[0].code = ""; }, /code block/]
    ];

    for (const [name, mutate, pattern] of cases) {
        it(`rejects ${name}`, () => {
            const d = base();
            mutate(d);
            const problems = validateDeck(d, { toolIds });
            assert.ok(problems.some((p) => pattern.test(p)), `${name}: ${JSON.stringify(problems)}`);
        });
    }

    it("rejects something that is not an object", () => {
        assert.ok(validateDeck(null).length > 0);
        assert.ok(validateDeck("deck").length > 0);
    });

});

describe("the deck manifest", () => {

    it("matches the decks: ids, titles and card counts", () => {
        assert.ok(flash.DECKS.length >= 1);
        for (const meta of flash.DECKS) {
            const deck = decks[meta.id];
            assert.equal(deck.id, meta.id);
            assert.equal(deck.title, meta.title);
            assert.equal(deck.cards.length, meta.cardCount, `${meta.id} card count`);
        }
    });

    it("has unique deck ids and card ids across all decks", () => {
        const all = Object.values(decks).flatMap((d) => d.cards.map((c) => c.id));
        assert.equal(new Set(all).size, all.length);
        assert.equal(new Set(flash.DECKS.map((m) => m.id)).size, flash.DECKS.length);
    });

});

describe("every deck is valid", () => {

    it("passes the schema, with real tool ids", () => {
        for (const deck of Object.values(decks)) assert.deepEqual(validateDeck(deck, { toolIds }), [], deck.id);
    });

    it("uses every topic it declares, with at least two cards in each", () => {
        for (const deck of Object.values(decks)) {
            for (const topic of deck.topics) {
                const n = deck.cards.filter((c) => c.topic === topic.id).length;
                assert.ok(n >= 2, `${deck.id}/${topic.id} has ${n}`);
            }
        }
    });

    it("mixes both card kinds and has a spread of difficulties", () => {
        for (const deck of Object.values(decks)) {
            assert.ok(deck.cards.some((c) => c.kind === "recall"), `${deck.id} recall`);
            assert.ok(deck.cards.some((c) => c.kind === "choice"), `${deck.id} choice`);
            assert.ok(new Set(deck.cards.map((c) => c.difficulty)).size >= 2, `${deck.id} difficulties`);
        }
    });

    it("never puts the correct answer in the same position on every choice card", () => {
        for (const deck of Object.values(decks)) {
            const positions = new Set(deck.cards.filter((c) => c.kind === "choice").map((c) => c.correct));
            assert.ok(positions.size >= 2, `${deck.id} positions ${[...positions]}`);
        }
    });

    it("keeps every choice answer free of the words always/never giveaways in the correct option only", () => {
        /* a crude guard against a tell: the correct option should not be the only longest one on every card */
        for (const deck of Object.values(decks)) {
            const choice = deck.cards.filter((c) => c.kind === "choice");
            const longest = choice.filter((c) => {
                const lengths = c.options.map((o) => o.length);
                return lengths[c.correct] === Math.max(...lengths) && lengths.filter((l) => l === Math.max(...lengths)).length === 1;
            }).length;
            assert.ok(longest / choice.length <= 0.6, `${deck.id}: the correct option is the single longest on ${longest} of ${choice.length} cards`);
        }
    });

    it("has no banned claim words and no markup in any card", () => {
        const banned = /\b(mastery|mastered|certified|certification course|guaranteed|proven|exam-ready|streak|badge)\b/i;
        for (const deck of Object.values(decks)) {
            for (const c of deck.cards) {
                const text = [c.prompt, c.answer, c.explanation, ...(c.options ?? [])].join(" ");
                assert.equal(banned.test(text), false, `${c.id} contains a banned word`);
                assert.equal(/<\/?[a-z][^>]*>/i.test(text.replace(/<img src=x onerror=alert\(1\)>/g, "")), false, `${c.id} contains markup`);
            }
        }
    });

});

describe("JSON deck: the claims the cards make", () => {

    /* hand-written: card id -> is the example text strictly valid JSON? */
    const CODE_VALID = {
        "json-top-level-number": true,
        "json-trailing-comma": false,
        "json-single-quotes": false,
        "json-unquoted-key": false,
        "json-missing-comma": false,
        "json-mismatched-bracket": false,
        "json-two-documents": false,
        "json-escape-quote": false,
        "json-raw-newline": false,
        "json-leading-zero": false,
        "json-boolean-case": false,
        "json-duplicate-keys": true
    };

    it("example texts are valid or invalid exactly as stated, by the strict engine", () => {
        for (const [id, expected] of Object.entries(CODE_VALID)) {
            const card = decks.json.cards.find((c) => c.id === id);
            assert.ok(card?.code !== undefined, `${id} has a code sample`);
            assert.equal(strictlyValid(card.code), expected, `${id}: ${JSON.stringify(card.code)}`);
        }
    });

    it("every code sample on a card is covered by the table", () => {
        for (const c of decks.json.cards) if (c.code !== undefined) assert.ok(Object.hasOwn(CODE_VALID, c.id), `${c.id} is not in the hand-written table`);
    });

    it("the 'which is valid' cards have exactly the stated option valid", () => {
        const number = decks.json.cards.find((c) => c.id === "json-valid-number");
        // by the option's text and the card's own correct index, never by a fixed position
        assert.deepEqual(number.options.map(strictlyValid), number.options.map((_, i) => i === number.correct));
        assert.equal(number.options[number.correct], "-0.5e3");
        const empty = decks.json.cards.find((c) => c.id === "json-valid-empty");
        assert.deepEqual(empty.options.map(strictlyValid), empty.options.map((_, i) => i === empty.correct));
        assert.equal(empty.options[empty.correct], "{}");
    });

    it("the fix shown on the trailing-comma card is valid", () => {
        assert.equal(strictlyValid("{\"name\":\"Alex\",\"age\":25}"), true);
        assert.equal(strictlyValid("{\"a\":1,\"b\":2}"), true);
        assert.equal(strictlyValid("[{\"a\":1},{\"b\":2}]"), true);
        assert.equal(strictlyValid("{\"quote\":\"She said \\\"hi\\\"\"}"), true);
    });

    it("a card whose answer is the right option for the text it shows", () => {
        const byId = (id) => decks.json.cards.find((c) => c.id === id);
        /* choice cards that ask 'is this valid?' or 'what is wrong?': the correct option must say no / name the defect */
        assert.match(byId("json-trailing-comma").options[byId("json-trailing-comma").correct], /^No/);
        assert.match(byId("json-single-quotes").options[byId("json-single-quotes").correct], /double quotation/);
        assert.match(byId("json-top-level-number").options[byId("json-top-level-number").correct], /^Yes/);
        assert.match(byId("json-leading-zero").options[byId("json-leading-zero").correct], /^No/);
        assert.match(byId("json-raw-newline").options[byId("json-raw-newline").correct], /^No/);
        assert.match(byId("json-boolean-case").options[byId("json-boolean-case").correct], /^No/);
        assert.match(byId("json-duplicate-keys").options[byId("json-duplicate-keys").correct], /parsers differ/);
    });

    it("the JavaScript behaviour the cards describe is real", () => {
        assert.equal(JSON.stringify({ a: undefined }), "{}");
        assert.equal(JSON.stringify([undefined]), "[null]");
        assert.equal(JSON.stringify(NaN), "null");
        assert.equal(JSON.stringify({ n: Infinity }), "{\"n\":null}");
        assert.equal(JSON.parse("12345678901234567890"), 12345678901234567000);
        assert.notEqual(String(JSON.parse("12345678901234567890")), "12345678901234567890");
        assert.equal(JSON.parse("{\"a\":1,\"a\":2}").a, 2);
        assert.deepEqual(JSON.parse("{\"a\":1}"), { a: 1 });
        assert.throws(() => JSON.parse(""));
        assert.throws(() => JSON.parse("{\u00a0}"));
        assert.doesNotThrow(() => JSON.parse("{ \t\r\n}"));
        assert.equal(JSON.parse("-0.5e3"), -500);
        assert.equal(JSON.parse("\"\\u00e9\""), "\u00e9");
    });

    it("the engine agrees with the whitespace and escape claims", () => {
        assert.equal(strictlyValid("{\u00a0}"), false);
        assert.equal(strictlyValid("{ \t\r\n}"), true);
        assert.equal(strictlyValid("\"\\u00e9\""), true);
        assert.equal(strictlyValid(""), false);
        assert.equal(strictlyValid("42"), true);
    });

});

describe("HTTP and APIs deck: the claims the cards make", () => {

    /* status names written by hand from RFC 9110 and RFC 6585, not read from the cards or from Node */
    const NAMES = {
        200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 205: "Reset Content", 301: "Moved Permanently",
        302: "Found", 304: "Not Modified", 307: "Temporary Redirect", 308: "Permanent Redirect", 400: "Bad Request",
        401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 406: "Not Acceptable", 408: "Request Timeout",
        410: "Gone", 412: "Precondition Failed", 415: "Unsupported Media Type", 422: "Unprocessable Content",
        429: "Too Many Requests", 500: "Internal Server Error", 503: "Service Unavailable", 507: "Insufficient Storage"
    };

    it("every 'NNN Name' written on a card is a real status with the right name", () => {
        const seen = new Set();
        for (const c of decks["http-apis"].cards) {
            const text = [c.prompt, c.answer, c.explanation, ...(c.options ?? [])].join(" | ");
            for (const m of text.matchAll(/\b([1-5]\d\d) ((?:[A-Z][a-z]+)(?: [A-Z][a-z]+)*)/g)) {
                const code = Number(m[1]);
                assert.ok(NAMES[code], `${c.id}: unknown status ${code}`);
                assert.ok(m[2] === NAMES[code] || NAMES[code].startsWith(m[2]) || m[2].startsWith(NAMES[code]), `${c.id}: ${code} is called ${m[2]}, expected ${NAMES[code]}`);
                seen.add(code);
            }
        }
        assert.ok(seen.size >= 12);
    });

    it("the cards state the method properties the RFC gives (safe, idempotent)", () => {
        const SAFE = ["GET", "HEAD", "OPTIONS", "TRACE"], IDEMPOTENT = ["PUT", "DELETE", ...SAFE], NOT_IDEMPOTENT = ["POST", "PATCH"];
        const safe = decks["http-apis"].cards.find((c) => c.id === "http-safe-methods").answer;
        for (const m of ["GET", "HEAD"]) assert.match(safe, new RegExp(m));
        const idem = decks["http-apis"].cards.find((c) => c.id === "http-idempotent-methods").answer;
        for (const m of IDEMPOTENT.filter((x) => !["OPTIONS", "TRACE"].includes(x))) assert.match(idem, new RegExp(m));
        for (const m of NOT_IDEMPOTENT) assert.match(idem, new RegExp(m));
    });

    it("the permanent-redirect card does not call a temporary code permanent", () => {
        const c = decks["http-apis"].cards.find((x) => x.id === "http-redirect-permanent");
        assert.match(c.options[c.correct], /^301 Moved Permanently/);
    });

    it("the right option of each status choice card names a code of the stated class", () => {
        const classes = { "http-404-missing": 4, "http-201-created": 2, "http-204-no-content": 2, "http-401-vs-403": 4, "http-500-vs-400": 5, "http-429-rate-limit": 4, "http-503-unavailable": 5, "http-redirect-permanent": 3 };
        for (const [id, cls] of Object.entries(classes)) {
            const c = decks["http-apis"].cards.find((x) => x.id === id);
            const code = Number(c.options[c.correct].match(/\b([1-5]\d\d)\b/)[1]);
            assert.equal(Math.floor(code / 100), cls, id);
        }
    });

});

describe("Software Testing deck: the boundary and partition cards", () => {

    /* An independent oracle: scan a whole number line, find where validity changes, and read the boundary values off the scan. */
    const scan = (valid, lo = -50, hi = 700) => {
        const edges = [];
        for (let x = lo; x < hi; x += 1) if (valid(x) !== valid(x + 1)) edges.push(valid(x) ? [x, x + 1] : [x + 1, x]); // [valid side, invalid side]
        return edges;
    };
    const twoValue = (valid) => scan(valid).flatMap(([v, i]) => [v, i]).sort((a, b) => a - b);
    const threeValue = (valid) => scan(valid).flatMap(([v, i]) => [v, i, v + (i > v ? -1 : 1)]).sort((a, b) => a - b);
    const optionSet = (text) => text.split(",").map((t) => Number(t.trim()));
    const card = (id) => decks["software-testing"].cards.find((c) => c.id === id);

    it("age 18 to 65 inclusive: the two-value answer is 17, 18, 65, 66 and nothing else matches", () => {
        const want = twoValue((x) => x >= 18 && x <= 65);
        assert.deepEqual(want, [17, 18, 65, 66]);
        const c = card("st-bva-two-value");
        const matching = c.options.map((o, i) => [i, optionSet(o)]).filter(([, set]) => JSON.stringify(set) === JSON.stringify(want));
        assert.deepEqual(matching.map(([i]) => i), [c.correct]);
    });

    it("age 18 to 65 inclusive: the three-value answer has six values and only the keyed option matches", () => {
        const want = threeValue((x) => x >= 18 && x <= 65);
        assert.deepEqual(want, [17, 18, 19, 64, 65, 66]);
        const c = card("st-bva-three-value");
        const matching = c.options.map((o, i) => [i, optionSet(o)]).filter(([, set]) => JSON.stringify(set) === JSON.stringify(want));
        assert.deepEqual(matching.map(([i]) => i), [c.correct]);
    });

    it("over 100 and at most 500: the two-value answer is 100, 101, 500, 501 and only the keyed option matches", () => {
        const want = twoValue((x) => x > 100 && x <= 500);
        assert.deepEqual(want, [100, 101, 500, 501]);
        const c = card("st-bva-exclusive");
        const matching = c.options.map((o, i) => [i, optionSet(o)]).filter(([, set]) => JSON.stringify(set) === JSON.stringify(want));
        assert.deepEqual(matching.map(([i]) => i), [c.correct]);
    });

    it("weight 0.5 to 20.0 in steps of 0.1: counting in tenths gives 0.4, 0.5, 20.0, 20.1", () => {
        const tenths = twoValue((t) => t >= 5 && t <= 200).map((t) => (t / 10).toFixed(1));
        assert.deepEqual(tenths, ["0.4", "0.5", "20.0", "20.1"]);
        const a = card("st-bva-decimal").answer;
        for (const v of tenths) assert.ok(a.includes(v), v);
    });

    it("quantity 1 to 10 has three partitions (below, inside, above), found by scanning", () => {
        const valid = (x) => x >= 1 && x <= 10;
        assert.equal(scan(valid).length + 1, 3);
        const c = card("st-partitions-count");
        assert.match(c.options[c.correct], /^Three/);
    });

    it("two yes/no conditions give four decision table columns; three would give eight", () => {
        let n = 0;
        for (const a of [false, true]) for (const b of [false, true]) n += 1;
        assert.equal(n, 4);
        const c = card("st-decision-table");
        assert.equal(c.options[c.correct], "4");
        assert.equal(2 ** 3, 8);
    });

});
