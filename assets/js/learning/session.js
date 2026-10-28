/* =========================================================
   ToolZen Hub
   Learning: a flashcard pass

   Pure functions over a plain object; nothing here touches the page,
   storage or the clock. A pass is one trip through a list of cards:
   each card is graded once, the learner moves on only after grading,
   and the summary is plain counts (no score, no percentage).

   A recall card is graded by the learner ("known" / "not known").
   A choice card is graded by its answer: known when the chosen option
   is the correct one. Those are different kinds of evidence, so each
   result records which kind it is.
========================================================= */

/* mulberry32: a small seeded generator, so a shuffled order is reproducible in tests */
export function seededRandom(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function shuffled(items, random) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Start a pass over `cards` (objects with id, topic and kind).
 * Duplicate ids are dropped so a card is never graded twice in one pass.
 */
export function startPass(cards, { random } = {}) {
    const seen = new Set();
    let list = cards.filter((c) => {
        if (!c || typeof c.id !== "string" || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
    });
    if (random) list = shuffled(list, random);
    return { cards: list, index: 0, results: {}, finished: list.length === 0 };
}

export function current(pass) {
    return pass.finished ? null : pass.cards[pass.index] ?? null;
}

export function resultOf(pass, id) {
    return Object.hasOwn(pass.results, id) ? pass.results[id] : null;
}

/**
 * Record the current card's grade. A card already graded in this pass keeps its first grade.
 * `evidence` is "self" for a recall card and "answer" for a choice card.
 */
export function gradeCurrent(pass, known, evidence, choice = null) {
    const card = current(pass);
    if (!card || resultOf(pass, card.id)) return pass;
    const entry = { known: Boolean(known), evidence };
    if (choice !== null) entry.choice = choice;
    return { ...pass, results: { ...pass.results, [card.id]: entry } };
}

export function canAdvance(pass) {
    const card = current(pass);
    return Boolean(card && resultOf(pass, card.id));
}

export function advance(pass) {
    if (!canAdvance(pass)) return pass;
    const index = pass.index + 1;
    return index >= pass.cards.length ? { ...pass, index: pass.cards.length, finished: true } : { ...pass, index };
}

export function back(pass) {
    if (pass.finished || pass.index === 0) return pass;
    return { ...pass, index: pass.index - 1 };
}

export function missedCards(pass) {
    return pass.cards.filter((c) => resultOf(pass, c.id)?.known === false);
}

/** Plain counts: seen, known, not known, per topic, and how many are left. */
export function summarize(pass) {
    const byTopic = {};
    let known = 0;
    let notKnown = 0;
    for (const card of pass.cards) {
        const r = resultOf(pass, card.id);
        if (!r) continue;
        const t = (byTopic[card.topic] ??= { known: 0, notKnown: 0 });
        if (r.known) { known += 1; t.known += 1; } else { notKnown += 1; t.notKnown += 1; }
    }
    return { total: pass.cards.length, seen: known + notKnown, known, notKnown, remaining: pass.cards.length - known - notKnown, byTopic };
}
