/* =========================================================
   ToolZen Hub
   List Comparer: the engine

   Pure functions. No DOM, network, storage, clock or randomness.

   Two lists, one item per line. The comparison is done on SETS of
   items: an item is a line, and two items are the same when their
   comparison keys are equal.

   COMPARISON KEY  the line itself, then (each only when its option is
     on): trimmed of white space at both ends (String.prototype.trim),
     lower-cased (String.prototype.toLowerCase, not locale-sensitive).
     Nothing else is changed: no sorting, no Unicode normalization.

   LINES  text is split at LF, CRLF or CR. One empty line at the very
     end (the usual final line break) is never an item. Other empty
     lines are items unless "skip empty lines" is on (the default),
     and the number skipped is reported.

   OUTPUT  every group lists each item once, in the order of its first
     appearance in its source list:
       only in A   items whose key is not in B
       only in B   items whose key is not in A
       in both     items in both, in A's order, shown as A first wrote them
       repeated    items that occur more than once in a list, with counts
     The text shown for an item is the text of its first occurrence
     (after trimming, if that option is on); with "ignore case" on, the
     other spellings are not shown.

   Limits: 100,000 lines and 1,000,000 characters per list.
========================================================= */

export const MAX_LINES = 100000;
export const MAX_CHARS = 1000000;
export const AUTO_LINES = 20000;
export const MAX_ROWS_SHOWN = 1000;

export const EXAMPLE_A = "apple\nbanana\ncherry\ndate\nbanana";
export const EXAMPLE_B = "Banana\ncherry\nelderberry\nfig";

export const GROUPS = [
    { key: "onlyA", title: "Only in A" },
    { key: "both", title: "In both" },
    { key: "onlyB", title: "Only in B" }
];

const plural = (n, one, many) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** the lines of a text, as described above */
export function splitLines(text) {

    const lines = String(text ?? "").split(/\r\n|\n|\r/);

    if (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines;
}

function readList(text, options) {

    const raw = String(text ?? "");

    if (raw.trim() === "") {
        return { status: "empty" };
    }

    if (raw.length > MAX_CHARS) {
        return { status: "too-large", kind: "characters", limit: MAX_CHARS, size: raw.length };
    }

    const lines = splitLines(raw);

    if (lines.length > MAX_LINES) {
        return { status: "too-large", kind: "lines", limit: MAX_LINES, size: lines.length };
    }

    const items = new Map();
    let skipped = 0;
    let count = 0;

    for (const line of lines) {

        const shown = options.trim ? line.trim() : line;

        if (shown === "" && options.skipEmpty) {
            skipped++;
            continue;
        }

        const key = options.ignoreCase ? shown.toLowerCase() : shown;

        count++;

        const known = items.get(key);

        if (known) {
            known.count++;
        } else {
            items.set(key, { text: shown, count: 1 });
        }
    }

    return {
        status: "valid",
        items,
        stats: { lines: lines.length, items: count, unique: items.size, skipped }
    };
}

/**
 * Compare two lists.
 *
 *   { state: "blocked", a: {status,...}, b: {status,...} }
 *       a side is empty or too large (status "empty", or "too-large" with kind/limit/size)
 *   { state: "done", onlyA, onlyB, both, repeatedA, repeatedB, statsA, statsB, options }
 *       onlyA, onlyB: [{ text }]   both: [{ text, countA, countB }]
 *       repeatedA, repeatedB: [{ text, count }]
 */
export function compareLists(textA, textB, options = {}) {

    const o = {
        ignoreCase: Boolean(options.ignoreCase),
        trim: Boolean(options.trim),
        skipEmpty: options.skipEmpty !== false
    };

    const a = readList(textA, o);
    const b = readList(textB, o);

    if (a.status !== "valid" || b.status !== "valid") {
        return {
            state: "blocked",
            a: a.status === "valid" ? { status: "valid", stats: a.stats } : a,
            b: b.status === "valid" ? { status: "valid", stats: b.stats } : b
        };
    }

    const onlyA = [];
    const both = [];
    const onlyB = [];
    const repeatedA = [];
    const repeatedB = [];

    for (const [key, item] of a.items) {

        const other = b.items.get(key);

        if (other) {
            both.push({ text: item.text, countA: item.count, countB: other.count });
        } else {
            onlyA.push({ text: item.text });
        }

        if (item.count > 1) {
            repeatedA.push({ text: item.text, count: item.count });
        }
    }

    for (const [key, item] of b.items) {

        if (!a.items.has(key)) {
            onlyB.push({ text: item.text });
        }

        if (item.count > 1) {
            repeatedB.push({ text: item.text, count: item.count });
        }
    }

    return {
        state: "done",
        onlyA,
        both,
        onlyB,
        repeatedA,
        repeatedB,
        statsA: a.stats,
        statsB: b.stats,
        options: o
    };
}

/** the first line of the result: sizes and the three groups */
export function summaryText(result) {

    const a = result.statsA;
    const b = result.statsB;

    return `A has ${plural(a.unique, "unique item", "unique items")} and B has ${plural(b.unique, "unique item", "unique items")}. ` +
        `${plural(result.both.length, "item is", "items are")} in both, ${result.onlyA.length.toLocaleString("en-US")} only in A and ${result.onlyB.length.toLocaleString("en-US")} only in B.`;
}

/** what the options did, in words (one sentence per effect that applied) */
export function noteLines(result) {

    const notes = [];
    const o = result.options;

    if (o.ignoreCase) {
        notes.push("Case is ignored: items that differ only by letter case count as the same, and each is shown as it was first written.");
    }

    if (o.trim) {
        notes.push("White space at the start and end of each line is ignored and not shown.");
    }

    for (const [label, stats] of [["A", result.statsA], ["B", result.statsB]]) {

        if (stats.skipped > 0) {
            notes.push(`${plural(stats.skipped, "empty line was", "empty lines were")} skipped in ${label}.`);
        }

        const duplicates = stats.items - stats.unique;

        if (duplicates > 0) {
            notes.push(`${label} repeats ${plural(duplicates, "line", "lines")}; each item is listed once below, and the repeats are shown separately.`);
        }
    }

    return notes;
}

/** plain text of one group, one item per line (what a Copy button copies) */
export function groupText(items) {
    return items.map((item) => item.text).join("\n");
}

/** plain text of the whole result (summary, notes, then each group) */
export function resultText(result) {

    const parts = [summaryText(result), ...noteLines(result)];

    const add = (title, items, format = (i) => i.text) => {
        parts.push("", `${title} (${items.length.toLocaleString("en-US")})`, ...items.map(format));
    };

    add("Only in A", result.onlyA);
    add("In both", result.both);
    add("Only in B", result.onlyB);

    if (result.repeatedA.length) add("Repeated in A", result.repeatedA, (i) => `${i.text}\t${i.count}`);
    if (result.repeatedB.length) add("Repeated in B", result.repeatedB, (i) => `${i.text}\t${i.count}`);

    return parts.join("\n");
}
