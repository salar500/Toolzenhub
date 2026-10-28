/* =========================================================
   ToolZen Hub
   Learning: optional, browser-local flashcard progress

   This is the one place learning progress can be stored, and only
   because the visitor turned saving on. Rule 7.7 allows this narrow
   exception; nothing else on the site stores learning data.

   What is stored: for each deck, the deck version and, for each card
   the visitor has graded, its id, box (1 to 5) and the day it was
   last graded. Never the visitor's answers, never free text, never a
   timestamp finer than a calendar day.

   Saving is OFF until the visitor enables it. While it is on, one
   key (KEY) holds the state, at most MAX_BYTES characters. Nothing is
   sent anywhere. Every value read back (from storage or from an
   imported file) is validated; an invalid value is dropped, never
   trusted, and reading never throws.

   The validation functions are pure and take the known decks as an
   argument:

     known = { [deckId]: { version: string, cardIds: Set<string> } }
========================================================= */

import { isEntry } from "./scheduler.js";

export const KEY = "tz-learn-v1";
export const MAX_BYTES = 100 * 1024;
export const FORMAT = "toolzenhub-flashcards-progress";
export const SCHEMA_VERSION = 1;

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const FORBIDDEN = new Set(["__proto__", "constructor", "prototype"]);
const MAX_DECKS = 20;
const MAX_CARDS_PER_DECK = 2000;

export function emptyState() {
    return { v: SCHEMA_VERSION, decks: {} };
}

const isPlain = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Check a parsed value against the known decks.
 * Returns { state, notices }. `state` always has the current shape and holds only
 * entries that are valid and refer to a card that exists in the current deck.
 */
export function validateState(value, known) {
    const notices = [];
    const state = emptyState();

    if (!isPlain(value)) {
        notices.push("The saved progress was not in a readable form and was ignored.");
        return { state, notices };
    }
    if (value.v !== SCHEMA_VERSION) {
        notices.push("The saved progress is from a different version of this tool and was ignored.");
        return { state, notices };
    }
    if (!isPlain(value.decks)) {
        notices.push("The saved progress has no decks and was ignored.");
        return { state, notices };
    }

    const deckIds = Object.keys(value.decks);
    if (deckIds.length > MAX_DECKS) {
        notices.push("The saved progress lists too many decks and was ignored.");
        return { state, notices };
    }

    let droppedDecks = 0;
    let droppedCards = 0;
    let keptCards = 0;

    for (const deckId of deckIds) {
        const saved = value.decks[deckId];
        if (FORBIDDEN.has(deckId) || !ID.test(deckId) || !Object.hasOwn(known, deckId) || !isPlain(saved) || !isPlain(saved.cards) || typeof saved.version !== "string") {
            droppedDecks += 1;
            continue;
        }
        const cardIds = Object.keys(saved.cards);
        if (cardIds.length > MAX_CARDS_PER_DECK) {
            droppedDecks += 1;
            continue;
        }
        const cards = {};
        for (const cardId of cardIds) {
            const entry = saved.cards[cardId];
            if (FORBIDDEN.has(cardId) || !known[deckId].cardIds.has(cardId) || !isEntry(entry)) {
                droppedCards += 1;
                continue;
            }
            cards[cardId] = { box: entry.box, day: entry.day };
            keptCards += 1;
        }
        state.decks[deckId] = { version: known[deckId].version, cards };
    }

    if (droppedDecks > 0) {
        notices.push(`${droppedDecks} saved deck${droppedDecks === 1 ? "" : "s"} did not match a deck in this tool and ${droppedDecks === 1 ? "was" : "were"} left out.`);
    }
    if (droppedCards > 0) {
        notices.push(`${droppedCards} saved card${droppedCards === 1 ? "" : "s"} did not match a card in the current decks or had invalid values and ${droppedCards === 1 ? "was" : "were"} left out.`);
    }
    return { state, notices, keptCards };
}

/** Parse and validate text (from storage or a file). Never throws. */
export function readText(text, known) {
    if (typeof text !== "string" || text.length === 0) {
        return { state: emptyState(), notices: [], keptCards: 0, empty: true };
    }
    if (text.length > MAX_BYTES) {
        return { state: emptyState(), notices: [`The saved progress is larger than ${MAX_BYTES / 1024} KB and was ignored.`], keptCards: 0, rejected: true };
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return { state: emptyState(), notices: ["The saved progress is not valid JSON and was ignored."], keptCards: 0, rejected: true };
    }
    return validateState(parsed, known);
}

/** The text that is stored. Throws RangeError if it would pass the size limit. */
export function serialize(state) {
    const text = JSON.stringify({ v: SCHEMA_VERSION, decks: state.decks });
    if (text.length > MAX_BYTES) throw new RangeError("progress is larger than the limit");
    return text;
}

/** The text of an export file: the state plus a format marker, nothing else. */
export function exportText(state) {
    return JSON.stringify({ format: FORMAT, v: SCHEMA_VERSION, decks: state.decks }, null, 2);
}

export function exportFileName(day) {
    return `toolzenhub-flashcards-progress-${day}.json`;
}

/**
 * Read an export file. Checks its size and format marker before the content.
 * Returns the same shape as readText, plus `error` when the file is refused.
 */
export function readImport(text, known) {
    if (typeof text !== "string" || text.length === 0) {
        return { error: "The file is empty." };
    }
    if (text.length > MAX_BYTES) {
        return { error: `The file is larger than ${MAX_BYTES / 1024} KB, which is more than this tool ever saves.` };
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return { error: "The file is not valid JSON." };
    }
    if (!isPlain(parsed) || parsed.format !== FORMAT) {
        return { error: "The file is not a ToolZen Hub flashcard progress export." };
    }
    const result = validateState(parsed, known);
    if (result.keptCards === undefined) {
        return { error: result.notices[0] ?? "The file could not be used." };
    }
    return result;
}

/** Merge validated progress into the current state; for a card in both, the later review day wins. */
export function mergeStates(current, incoming) {
    const out = { v: SCHEMA_VERSION, decks: {} };
    for (const deckId of new Set([...Object.keys(current.decks), ...Object.keys(incoming.decks)])) {
        const a = current.decks[deckId]?.cards ?? {};
        const b = incoming.decks[deckId]?.cards ?? {};
        const cards = { ...a };
        for (const [id, entry] of Object.entries(b)) {
            if (!Object.hasOwn(cards, id) || entry.day > cards[id].day) cards[id] = entry;
        }
        out.decks[deckId] = { version: (incoming.decks[deckId] ?? current.decks[deckId]).version, cards };
    }
    return out;
}

export function countCards(state) {
    let n = 0;
    for (const deck of Object.values(state.decks)) n += Object.keys(deck.cards).length;
    return n;
}

/**
 * The storage adapter. `storage` is localStorage in the page and a fake in tests.
 * Every call is guarded: a blocked, full or throwing storage gives a result, not an exception.
 */
export function createStore(getStorage) {
    const grab = () => {
        try {
            return getStorage() ?? null;
        } catch {
            return null;
        }
    };

    return {
        available() {
            const s = grab();
            if (!s) return false;
            try {
                s.getItem(KEY);
                return true;
            } catch {
                return false;
            }
        },
        /** Whether a saved value exists: this is what "saving is on" means. */
        isOn() {
            const s = grab();
            try {
                return s !== null && s.getItem(KEY) !== null;
            } catch {
                return false;
            }
        },
        read() {
            const s = grab();
            try {
                return s ? s.getItem(KEY) : null;
            } catch {
                return null;
            }
        },
        write(state) {
            const s = grab();
            if (!s) return { ok: false, reason: "unavailable" };
            let text;
            try {
                text = serialize(state);
            } catch {
                return { ok: false, reason: "too-large" };
            }
            try {
                s.setItem(KEY, text);
                return { ok: true };
            } catch {
                return { ok: false, reason: "blocked" };
            }
        },
        /** Removes only this tool's key. */
        clear() {
            const s = grab();
            try {
                s?.removeItem(KEY);
                return true;
            } catch {
                return false;
            }
        }
    };
}
