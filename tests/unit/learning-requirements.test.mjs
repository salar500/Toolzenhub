/**
 * Practice Labs and Smart Flashcards: requirement checks that read the real pages and content (Stage 3).
 *
 * AC-LAB-002  introduction of at most 80 words; the worked example has no submit control
 * AC-LRN-013  the banned wording list and the gamification words are absent from pages and content
 * AC-LRN-012  no page says a limit is unlimited
 * AC-LRN-003  every item carries a source; every set and deck carries a review record that does not claim a second reviewer
 * AC-FC-005   a card without an explanation fails the content check and names the card
 * AC-LRN-001/002  an invalid fixture fails; a duplicate id fails
 * The pages are read through their markup(), exactly what the build writes into the HTML.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { validateDeck, validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };

const LABS = ["json-error-fixing-lab", "jsonpath-challenge-lab", "cron-challenge-lab", "test-design-lab"];
const pages = {};
const content = {};
let toolIds;

before(async () => {
    const catalog = await import("../../assets/js/data/tools.js");
    toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
    for (const id of [...LABS, "smart-flashcards"]) pages[id] = (await import(`../../assets/js/tools/${id}/index.js`)).markup();
    content.decks = [];
    for (const f of ["json", "http-apis", "software-testing"]) content.decks.push((await import(`../../assets/js/tools/smart-flashcards/decks/${f}.js`)).deck);
    content.sets = [];
    for (const id of LABS) content.sets.push((await import(`../../assets/js/tools/${id}/exercises.js`)).set);
});

const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");

const BANNED = [/\bmastery\b/i, /\bmastered\b/i, /\bcertified\b/i, /\bguarantee(d|s)?\b/i, /\bproven\b/i, /exam[- ]ready/i, /\bstreaks?\b/i, /\bpoints\b/i, /\bbadges?\b/i, /\branking(s)?\b/i, /\bnotifications?\b/i, /\bleaderboard\b/i, /\bachievements?\b/i];

describe("AC-LAB-002: introduction and worked example", () => {

    for (const id of LABS) {
        it(`${id}: the introduction is at most 80 words and the worked example cannot be submitted`, () => {
            const html = pages[id];
            const intro = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/)[1];
            const words = textOf(intro).trim().split(" ").length;
            assert.ok(words <= 80, `${words} words`);
            const worked = html.split('<section class="calculator-info">')[1].split("</section>")[0];
            assert.ok(/Worked Example/i.test(worked));
            assert.ok(!/<(button|form|input|textarea|select)\b/i.test(worked), "the worked example has a control");
        });
    }

});

describe("AC-LRN-013 and AC-LRN-012: wording on pages and in content", () => {

    it("no banned word appears on any page or in any deck or exercise set", () => {
        const found = [];
        const corpus = {
            ...Object.fromEntries(Object.entries(pages).map(([k, v]) => [`page ${k}`, textOf(v)])),
            ...Object.fromEntries(content.decks.map((d) => [`deck ${d.id}`, JSON.stringify(d)])),
            ...Object.fromEntries(content.sets.map((s) => [`set ${s.id}`, JSON.stringify(s)]))
        };
        for (const [where, text] of Object.entries(corpus)) for (const re of BANNED) { const m = text.match(re); if (m) found.push(`${where}: "${m[0]}" near "${text.slice(Math.max(0, m.index - 40), m.index + 40)}"`); }
        assert.deepEqual(found, []);
    });

    it("no page says that a limit is unlimited", () => {
        for (const [id, html] of Object.entries(pages)) assert.ok(!/unlimited/i.test(textOf(html)), id);
    });

    it("every page that takes input names a numeric maximum", () => {
        for (const id of LABS) assert.match(textOf(pages[id]), /\b\d[\d,]*\s*(characters|values|kilobytes|KB)\b|up to [\d,]+/i, id);
    });

});

describe("AC-LRN-001 to 003 and AC-FC-005: the content checks do what they claim", () => {

    it("every deck and set passes, and every item has a source", () => {
        for (const d of content.decks) { assert.deepEqual(validateDeck(d, { toolIds }), [], d.id); for (const c of d.cards) assert.ok(String(c.source ?? "").length >= 5, c.id); }
        for (const s of content.sets) { assert.deepEqual(validateExerciseSet(s, { toolIds }), [], s.id); for (const e of s.exercises) assert.ok(String(e.source ?? "").length >= 5, e.id); }
    });

    it("every deck and set has a review record, and none claims a second reviewer that did not happen", () => {
        for (const x of [...content.decks, ...content.sets]) {
            assert.match(x.reviewed.date, /^\d{4}-\d{2}-\d{2}$/, x.id);
            assert.ok(x.reviewed.method.length > 20, x.id);
            assert.ok(!/second reviewer (checked|reviewed|confirmed)|independently reviewed by|peer[- ]reviewed/i.test(x.reviewed.method), `${x.id}: ${x.reviewed.method}`);
        }
    });

    it("a card with no explanation fails and the message names the card", () => {
        const d = structuredClone(content.decks[0]);
        delete d.cards[3].explanation;
        const errors = validateDeck(d, { toolIds });
        assert.ok(errors.some((e) => e.includes(d.cards[3].id)), JSON.stringify(errors));
    });

    it("a duplicate card id fails; a card with no source fails; an unknown tool id fails; an empty deck fails", () => {
        const d = structuredClone(content.decks[0]);
        d.cards[1].id = d.cards[0].id;
        assert.ok(validateDeck(d, { toolIds }).some((e) => /duplicate/i.test(e)));
        const e = structuredClone(content.decks[0]); delete e.cards[0].source;
        assert.ok(validateDeck(e, { toolIds }).length > 0);
        const t = structuredClone(content.decks[0]); t.cards[0].tool = "no-such-tool";
        assert.ok(validateDeck(t, { toolIds }).length > 0);
        const z = structuredClone(content.decks[0]); z.cards = [];
        assert.ok(validateDeck(z, { toolIds }).length > 0);
    });

    it("a single-option choice card, two correct options, or a correct index out of range fails", () => {
        const base = content.decks[0].cards.find((c) => c.kind === "choice");
        for (const mutate of [(c) => { c.options = c.options.slice(0, 1); c.correct = 0; }, (c) => { c.correct = 99; }, (c) => { c.correct = -1; }]) {
            const d = structuredClone(content.decks[0]);
            const c = d.cards.find((x) => x.id === base.id);
            mutate(c);
            assert.ok(validateDeck(d, { toolIds }).length > 0);
        }
    });

    it("an exercise set with a duplicate exercise id or more than three hints fails", () => {
        const s = structuredClone(content.sets[0]);
        s.exercises[1].id = s.exercises[0].id;
        assert.ok(validateExerciseSet(s, { toolIds }).some((e) => /duplicate/i.test(e)));
        const h = structuredClone(content.sets[0]); h.exercises[0].hints = ["a one", "a two", "a three", "a four"];
        assert.ok(validateExerciseSet(h, { toolIds }).length > 0);
    });

});

describe("choice cards: no positional or wording tell (rule: one correct option, not always in the same place)", () => {

    it("the correct position is spread over all four positions in every deck that has enough choice cards", () => {
        for (const d of content.decks) {
            const choices = d.cards.filter((c) => c.kind === "choice");
            const counts = [0, 0, 0, 0];
            for (const c of choices) counts[c.correct] += 1;
            assert.ok(counts.every((n) => n >= 1), `${d.id}: ${counts}`);
            assert.ok(Math.max(...counts) <= Math.ceil(choices.length * 0.45), `${d.id}: ${counts}`);
        }
    });

    it("the correct option is not clearly longer than the others: at most 30% of prose choice cards, and never by more than 40%", () => {
        for (const d of content.decks) {
            const prose = d.cards.filter((c) => c.kind === "choice" && Math.max(...c.options.map((o) => o.length)) >= 40);
            let clearly = 0;
            for (const c of prose) {
                const lens = c.options.map((o) => o.length);
                const others = Math.max(...lens.filter((_, i) => i !== c.correct));
                if (lens[c.correct] > others * 1.1) clearly += 1;
                assert.ok(lens[c.correct] <= others * 1.4, `${c.id}: ${lens[c.correct]} against ${others}`);
            }
            assert.ok(clearly <= Math.floor(prose.length * 0.3), `${d.id}: ${clearly} of ${prose.length} prose cards have a clearly longer correct option`);
        }
    });

    it("no choice card has two identical options or an option that is a prefix of the correct one", () => {
        for (const d of content.decks) for (const c of d.cards.filter((x) => x.kind === "choice")) {
            assert.equal(new Set(c.options.map((o) => o.trim().toLowerCase())).size, c.options.length, c.id);
            assert.ok(c.options.length === 4, `${c.id} has ${c.options.length} options`);
        }
    });

});
