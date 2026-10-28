/* =========================================================
   ToolZen Hub
   Learning: content schema and validators

   Decks and exercise sets are plain data. These functions check that
   data and return a list of problems (an empty list means the module
   is valid). A unit test runs them over every module, so invalid
   content cannot ship; the pages run the same check at run time and
   refuse invalid data with a plain message.

   Pure: no DOM, no storage.
========================================================= */

export const DIFFICULTIES = Object.freeze(["beginner", "intermediate", "advanced"]);
export const CARD_KINDS = Object.freeze(["recall", "choice"]);

export const MAX_TEXT = 2000;
export const MAX_CODE = 1200;
export const MAX_OPTIONS = 5;
export const MAX_HINTS = 3;
export const MAX_ITEMS = 500;

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const text = (v, min = 1, max = MAX_TEXT) =>
    typeof v === "string" && v.trim().length >= min && v.length <= max;

function checkHeader(module, problems) {
    if (module === null || typeof module !== "object") {
        problems.push("module is not an object");
        return false;
    }
    if (!ID.test(module.id ?? "")) problems.push("module id is missing or not a lowercase slug");
    if (!VERSION.test(module.version ?? "")) problems.push("module version must look like 1.0.0");
    if (!text(module.title, 3, 80)) problems.push("module title is missing");
    if (!text(module.description, 20, 400)) problems.push("module description is missing or too short");
    const r = module.reviewed;
    if (!r || !DATE.test(r.date ?? "") || !text(r.method, 10, 300)) problems.push("module needs a review record with a date and a method");
    return true;
}

/**
 * @param {object} deck
 * @param {{toolIds?: Set<string>}} [context]
 */
export function validateDeck(deck, { toolIds } = {}) {
    const problems = [];
    if (!checkHeader(deck, problems)) return problems;

    const topics = new Set();
    if (!Array.isArray(deck.topics) || deck.topics.length === 0) {
        problems.push("a deck needs at least one topic");
    } else {
        for (const t of deck.topics) {
            if (!ID.test(t?.id ?? "") || !text(t?.title, 2, 80)) problems.push(`topic ${JSON.stringify(t?.id)} is invalid`);
            else if (topics.has(t.id)) problems.push(`duplicate topic id ${t.id}`);
            else topics.add(t.id);
        }
    }

    if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
        problems.push("a deck needs at least one card");
        return problems;
    }
    if (deck.cards.length > MAX_ITEMS) problems.push(`more than ${MAX_ITEMS} cards`);

    const ids = new Set();
    const prompts = new Set();
    for (const card of deck.cards) {
        const where = `card ${card?.id ?? "(no id)"}`;
        if (!ID.test(card?.id ?? "")) { problems.push(`${where}: id is missing or not a lowercase slug`); continue; }
        if (ids.has(card.id)) problems.push(`${where}: duplicate id`);
        ids.add(card.id);
        if (!topics.has(card.topic)) problems.push(`${where}: unknown topic ${JSON.stringify(card.topic)}`);
        if (!CARD_KINDS.includes(card.kind)) problems.push(`${where}: kind must be recall or choice`);
        if (!DIFFICULTIES.includes(card.difficulty)) problems.push(`${where}: unsupported difficulty ${JSON.stringify(card.difficulty)}`);
        if (!text(card.prompt, 8)) problems.push(`${where}: prompt is missing or too long`);
        else {
            const key = (card.prompt + " " + (card.code ?? "")).trim().toLowerCase().replace(/\s+/g, " ");
            if (prompts.has(key)) problems.push(`${where}: same prompt as another card`);
            prompts.add(key);
        }
        if (card.code !== undefined && !text(card.code, 1, MAX_CODE)) problems.push(`${where}: code block is empty or too long`);
        if (!text(card.explanation, 30)) problems.push(`${where}: explanation is missing or too short`);
        if (!text(card.source, 5, 200)) problems.push(`${where}: source is missing`);
        if (card.tool !== undefined && toolIds && !toolIds.has(card.tool)) problems.push(`${where}: related tool ${card.tool} does not exist`);

        if (card.kind === "recall") {
            if (!text(card.answer, 1)) problems.push(`${where}: a recall card needs a non-empty answer`);
            if (card.options !== undefined || card.correct !== undefined) problems.push(`${where}: a recall card must not have options`);
        } else if (card.kind === "choice") {
            const o = card.options;
            if (!Array.isArray(o) || o.length < 2 || o.length > MAX_OPTIONS || !o.every((x) => text(x, 1, 300))) {
                problems.push(`${where}: a choice card needs 2 to ${MAX_OPTIONS} non-empty options`);
            } else if (new Set(o.map((x) => x.trim().toLowerCase())).size !== o.length) {
                problems.push(`${where}: options are not unique`);
            }
            if (!Number.isInteger(card.correct) || !Array.isArray(o) || card.correct < 0 || card.correct >= o.length) {
                problems.push(`${where}: correct must be the index of exactly one option`);
            }
            if (card.answer !== undefined) problems.push(`${where}: a choice card must not have an answer field`);
        }
    }
    return problems;
}

/**
 * Common checks for a lab exercise set. A lab's own test checks what is specific to it.
 * @param {object} set
 * @param {{toolIds?: Set<string>, deckTopics?: Set<string>}} [context]
 */
export function validateExerciseSet(set, { toolIds, deckTopics } = {}) {
    const problems = [];
    if (!checkHeader(set, problems)) return problems;
    if (!Array.isArray(set.exercises) || set.exercises.length === 0) {
        problems.push("an exercise set needs at least one exercise");
        return problems;
    }
    if (set.exercises.length > MAX_ITEMS) problems.push(`more than ${MAX_ITEMS} exercises`);

    const ids = new Set();
    for (const ex of set.exercises) {
        const where = `exercise ${ex?.id ?? "(no id)"}`;
        if (!ID.test(ex?.id ?? "")) { problems.push(`${where}: id is missing or not a lowercase slug`); continue; }
        if (ids.has(ex.id)) problems.push(`${where}: duplicate id`);
        ids.add(ex.id);
        if (!text(ex.title, 3, 90)) problems.push(`${where}: title is missing`);
        if (!DIFFICULTIES.includes(ex.difficulty)) problems.push(`${where}: unsupported difficulty ${JSON.stringify(ex.difficulty)}`);
        if (!text(ex.objective, 15, 300)) problems.push(`${where}: learning objective is missing`);
        if (!text(ex.instructions, 15)) problems.push(`${where}: instructions are missing`);
        if (!text(ex.explanation, 40)) problems.push(`${where}: explanation is missing or too short`);
        if (!text(ex.source, 5, 200)) problems.push(`${where}: source is missing`);
        if (!Array.isArray(ex.hints) || ex.hints.length < 1 || ex.hints.length > MAX_HINTS || !ex.hints.every((h) => text(h, 5, 300))) {
            problems.push(`${where}: needs 1 to ${MAX_HINTS} hints`);
        }
        if (ex.tool !== undefined && toolIds && !toolIds.has(ex.tool)) problems.push(`${where}: related tool ${ex.tool} does not exist`);
        if (ex.topic !== undefined && deckTopics && !deckTopics.has(ex.topic)) problems.push(`${where}: flashcard topic ${ex.topic} does not exist`);
    }
    return problems;
}

/** Ids of a deck in order, for the progress validators. */
export function cardIdsOf(deck) {
    return deck.cards.map((c) => c.id);
}
