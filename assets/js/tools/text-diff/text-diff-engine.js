/* =========================================================
   ToolZen Hub
   Text Diff / Compare: the engine (pure, no DOM)

   Everything the page shows comes from here, so it can be tested
   without a browser. The rules are frozen in
   docs/tool-packs/18-text-diff.md; this file is the code for them.

   Model, in one paragraph. Both texts become lists of lines
   (line endings normalised for comparison only, one final newline
   not counted). A Myers shortest-edit search, in linear space and
   under a work budget, finds the lines the two texts share.
   Everything else is Removed or Added, except that inside one
   block of neighbouring removals and additions a removed line and
   a similar added line are paired as Changed and compared word by
   word. Nothing is guessed across the document and nothing here
   scores "similarity" for the whole text.

   Deterministic: the same input and options always give the same
   rows. The text itself is never modified; rows carry the
   original line text.
========================================================= */

export const LIMITS = Object.freeze({

    /* per side; stated on the page, never truncated silently */
    maxChars: 300000,
    maxLines: 20000,

    /* combined size up to which the page compares by itself */
    autoChars: 60000

});

/* work units for the whole line search (see bisect) */
const SEARCH_BUDGET = 25000000;

/* pairing of removed and added lines inside one block */
const PAIR_WINDOW = 8;
const PAIR_MIN_SIMILARITY = 0.5;
const MAX_PAIR_BLOCK = 60;
const MAX_PAIR_LINE_CHARS = 20000;
const PAIR_BUDGET = 3000000;
const PAIR_STEP_BUDGET = 200000;

/* unchanged runs shorter than this are never collapsed */
export const CONTEXT_LINES = 3;
const MIN_HIDDEN_LINES = 2;

export const EXAMPLE = Object.freeze({

    original:
        "Summarise the report below in three bullet points.\n" +
        "Write for a busy manager.\n" +
        "Use plain English and keep it under 80 words.\n" +
        "Do not mention the author.\n" +
        "Return the bullets only.\n",

    changed:
        "Summarise the report below in three short bullet points.\n" +
        "Write for a busy manager.\n" +
        "Use plain English and keep the whole answer under 60 words.\n" +
        "Return the bullets only.\n" +
        "If the report has no figures, say so in the last bullet.\n"

});


/* =========================================================
   Lines
========================================================= */

/* CRLF and a lone CR become LF. Nothing else changes. */
export function normalizeNewlines(text) {

    return String(text).replace(/\r\n?/g, "\n");

}

/*
   The lines of a text, after normalising line endings.
   One final newline ends the last line instead of starting another,
   so "a\nb" and "a\nb\n" have the same lines. The empty text has
   none. "a\n\n" has two lines, the second empty.
*/
export function splitLines(text) {

    const normalized = normalizeNewlines(text);

    if (normalized === "") {
        return [];
    }

    const lines = normalized.split("\n");

    if (lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines;

}

/* what "equal" means when whitespace-only changes are ignored */
export function whitespaceKey(line) {

    return line.replace(/\s+/g, " ").trim();

}

export function checkLimits(original, changed) {

    const sides = [["Original", original], ["Changed", changed]];

    for (const [name, text] of sides) {

        if (text.length > LIMITS.maxChars) {

            return {
                side: name,
                reason: "characters",
                message: `${name} is over the limit of ${LIMITS.maxChars.toLocaleString("en-US")} characters per side. Nothing was compared; shorten it or compare it in parts.`
            };

        }

        if (splitLines(text).length > LIMITS.maxLines) {

            return {
                side: name,
                reason: "lines",
                message: `${name} is over the limit of ${LIMITS.maxLines.toLocaleString("en-US")} lines per side. Nothing was compared; shorten it or compare it in parts.`
            };

        }

    }

    return null;

}


/* =========================================================
   Shortest edit search (Myers, linear space)

   matchSequences(a, b, budget) finds a longest common
   subsequence of two arrays of small integers and returns the
   matched positions. It is the divide-at-the-middle-snake form
   of Myers' O(ND) algorithm, so no table of size D by D is kept.
   Items that occur on only one side are set aside first (they
   can never match), which makes unrelated texts nearly free.
   When the work budget runs out the unfinished region is left
   unmatched: still a valid diff, no longer guaranteed minimal,
   and `complete` is false.
========================================================= */

function bisect(a, aLo, aHi, b, bLo, bHi, budget) {

    const n = aHi - aLo;
    const m = bHi - bLo;

    const maxD = Math.ceil((n + m) / 2);
    const offset = maxD;
    const size = 2 * maxD + 2;

    const v1 = new Int32Array(size).fill(-1);
    const v2 = new Int32Array(size).fill(-1);

    v1[offset + 1] = 0;
    v2[offset + 1] = 0;

    const delta = n - m;

    /* an odd delta means the forward path meets the reverse one */
    const front = delta % 2 !== 0;

    let k1Start = 0;
    let k1End = 0;
    let k2Start = 0;
    let k2End = 0;

    for (let d = 0; d < maxD; d++) {

        if (budget.left < 0) {
            budget.exhausted = true;
            return null;
        }

        for (let k1 = -d + k1Start; k1 <= d - k1End; k1 += 2) {

            const k1Offset = offset + k1;

            let x1 = (k1 === -d || (k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]))
                ? v1[k1Offset + 1]
                : v1[k1Offset - 1] + 1;

            let y1 = x1 - k1;

            budget.left -= 1;

            while (x1 < n && y1 < m && a[aLo + x1] === b[bLo + y1]) {
                x1++;
                y1++;
                budget.left -= 1;
            }

            v1[k1Offset] = x1;

            if (x1 > n) {

                k1End += 2;

            } else if (y1 > m) {

                k1Start += 2;

            } else if (front) {

                const k2Offset = offset + delta - k1;

                if (k2Offset >= 0 && k2Offset < size && v2[k2Offset] !== -1) {

                    const x2 = n - v2[k2Offset];

                    if (x1 >= x2) {
                        return [x1, y1];
                    }

                }

            }

        }

        for (let k2 = -d + k2Start; k2 <= d - k2End; k2 += 2) {

            const k2Offset = offset + k2;

            let x2 = (k2 === -d || (k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]))
                ? v2[k2Offset + 1]
                : v2[k2Offset - 1] + 1;

            let y2 = x2 - k2;

            budget.left -= 1;

            while (x2 < n && y2 < m && a[aLo + n - x2 - 1] === b[bLo + m - y2 - 1]) {
                x2++;
                y2++;
                budget.left -= 1;
            }

            v2[k2Offset] = x2;

            if (x2 > n) {

                k2End += 2;

            } else if (y2 > m) {

                k2Start += 2;

            } else if (!front) {

                const k1Offset = offset + delta - k2;

                if (k1Offset >= 0 && k1Offset < size && v1[k1Offset] !== -1) {

                    const x1 = v1[k1Offset];
                    const y1 = offset + x1 - k1Offset;

                    if (x1 >= n - x2) {
                        return [x1, y1];
                    }

                }

            }

        }

    }

    /* no commonality in this region */
    return null;

}

function diffRange(a, aLo, aHi, b, bLo, bHi, mi, mj, budget) {

    while (aLo < aHi && bLo < bHi && a[aLo] === b[bLo]) {

        mi.push(aLo);
        mj.push(bLo);

        aLo++;
        bLo++;

    }

    let sa = aHi;
    let sb = bHi;

    while (aLo < sa && bLo < sb && a[sa - 1] === b[sb - 1]) {

        sa--;
        sb--;

    }

    if (aLo < sa && bLo < sb) {

        const split = bisect(a, aLo, sa, b, bLo, sb, budget);

        if (split) {

            const x = aLo + split[0];
            const y = bLo + split[1];

            const whole = (x === aLo && y === bLo) || (x === sa && y === sb);

            if (whole) {

                /* cannot happen for a correct split; never recurse on the same problem */
                budget.exhausted = true;

            } else {

                diffRange(a, aLo, x, b, bLo, y, mi, mj, budget);
                diffRange(a, x, sa, b, y, sb, mi, mj, budget);

            }

        }

    }

    for (let k = 0; sa + k < aHi; k++) {

        mi.push(sa + k);
        mj.push(sb + k);

    }

}

export function matchSequences(a, b, budget = { left: SEARCH_BUDGET }) {

    budget.exhausted = false;

    let maxId = -1;

    for (const id of a) { if (id > maxId) maxId = id; }
    for (const id of b) { if (id > maxId) maxId = id; }

    const inA = new Uint8Array(maxId + 1);
    const inB = new Uint8Array(maxId + 1);

    for (const id of a) inA[id] = 1;
    for (const id of b) inB[id] = 1;

    const ra = [];
    const mapA = [];
    const rb = [];
    const mapB = [];

    for (let i = 0; i < a.length; i++) {

        if (inB[a[i]]) {
            ra.push(a[i]);
            mapA.push(i);
        }

    }

    for (let j = 0; j < b.length; j++) {

        if (inA[b[j]]) {
            rb.push(b[j]);
            mapB.push(j);
        }

    }

    const mi = [];
    const mj = [];

    diffRange(ra, 0, ra.length, rb, 0, rb.length, mi, mj, budget);

    return {
        a: mi.map((i) => mapA[i]),
        b: mj.map((j) => mapB[j]),
        complete: !budget.exhausted
    };

}


/* =========================================================
   Words (only inside a Changed pair)
========================================================= */

const TOKEN_PATTERN = /[\p{L}\p{N}\p{M}_]+|\s+|[^\s]/gu;

export function tokenize(line) {

    return line.match(TOKEN_PATTERN) ?? [];

}

const isSpace = (token) => /^\s/.test(token);

function segmentsOf(tokens, matched) {

    const segments = [];

    for (let i = 0; i < tokens.length; i++) {

        const changed = !matched[i];
        const last = segments[segments.length - 1];

        if (last && last[1] === changed) {
            last[0] += tokens[i];
        } else {
            segments.push([tokens[i], changed]);
        }

    }

    return segments;

}

/*
   Word-level comparison of two lines.
   Returns the changed words on each side and how similar the lines
   are: 2 x shared words / all words, counting words and punctuation
   but not spaces. null when the work budget for this pair ran out.
*/
export function wordDiff(oldLine, newLine, ignoreWhitespace = false, budget = { left: PAIR_STEP_BUDGET }) {

    const ta = tokenize(oldLine);
    const tb = tokenize(newLine);

    const ids = new Map();

    const idOf = (token) => {

        const key = ignoreWhitespace && isSpace(token) ? " " : token;

        let id = ids.get(key);

        if (id === undefined) {
            id = ids.size;
            ids.set(key, id);
        }

        return id;

    };

    const ia = ta.map(idOf);
    const ib = tb.map(idOf);

    const found = matchSequences(ia, ib, budget);

    if (!found.complete) {
        return null;
    }

    const matchedA = new Uint8Array(ta.length);
    const matchedB = new Uint8Array(tb.length);

    let shared = 0;

    for (let t = 0; t < found.a.length; t++) {

        matchedA[found.a[t]] = 1;
        matchedB[found.b[t]] = 1;

        if (!isSpace(ta[found.a[t]])) {
            shared++;
        }

    }

    const totalA = ta.filter((token) => !isSpace(token)).length;
    const totalB = tb.filter((token) => !isSpace(token)).length;

    return {
        similarity: totalA + totalB === 0 ? 0 : (2 * shared) / (totalA + totalB),
        old: segmentsOf(ta, matchedA),
        new: segmentsOf(tb, matchedB)
    };

}


/* =========================================================
   Compare
========================================================= */

/*
   Pair removed lines with similar added lines, inside ONE block
   (the lines between two unchanged lines). Order-preserving and
   bounded: each removed line looks only at the next few added
   lines. Returns [{ oldIndex, newIndex, words }] with both
   indexes increasing.
*/
function pairBlock(aLines, aFrom, aTo, bLines, bFrom, bTo, ignoreWhitespace, pairBudget) {

    const pairs = [];

    if (aTo - aFrom > MAX_PAIR_BLOCK || bTo - bFrom > MAX_PAIR_BLOCK) {
        return pairs;
    }

    let next = bFrom;

    for (let i = aFrom; i < aTo && next < bTo; i++) {

        if (aLines[i].length > MAX_PAIR_LINE_CHARS) {
            continue;
        }

        let best = null;

        for (let j = next; j < Math.min(next + PAIR_WINDOW, bTo); j++) {

            if (bLines[j].length > MAX_PAIR_LINE_CHARS) {
                continue;
            }

            if (pairBudget.left <= 0) {
                return pairs;
            }

            const local = { left: Math.min(PAIR_STEP_BUDGET, pairBudget.left) };

            const words = wordDiff(aLines[i], bLines[j], ignoreWhitespace, local);

            pairBudget.left -= (aLines[i].length + bLines[j].length) / 8 + (Math.min(PAIR_STEP_BUDGET, pairBudget.left) - local.left) + 1;

            if (words && words.similarity >= PAIR_MIN_SIMILARITY && (best === null || words.similarity > best.words.similarity)) {
                best = { j, words };
            }

        }

        if (best) {

            pairs.push({ oldIndex: i, newIndex: best.j, words: best.words });

            next = best.j + 1;

        }

    }

    return pairs;

}

function emitBlock(rows, aLines, aFrom, aTo, bLines, bFrom, bTo, ignoreWhitespace, pairBudget) {

    if (aFrom === aTo && bFrom === bTo) {
        return;
    }

    const pairs = (aFrom < aTo && bFrom < bTo)
        ? pairBlock(aLines, aFrom, aTo, bLines, bFrom, bTo, ignoreWhitespace, pairBudget)
        : [];

    let i = aFrom;
    let j = bFrom;

    const flush = (toI, toJ) => {

        for (; i < toI; i++) {
            rows.push({ kind: "del", a: i + 1, b: null, aText: aLines[i], bText: null });
        }

        for (; j < toJ; j++) {
            rows.push({ kind: "add", a: null, b: j + 1, aText: null, bText: bLines[j] });
        }

    };

    for (const pair of pairs) {

        flush(pair.oldIndex, pair.newIndex);

        rows.push({
            kind: "mod",
            a: pair.oldIndex + 1,
            b: pair.newIndex + 1,
            aText: aLines[pair.oldIndex],
            bText: bLines[pair.newIndex],
            aWords: pair.words.old,
            bWords: pair.words.new
        });

        i = pair.oldIndex + 1;
        j = pair.newIndex + 1;

    }

    flush(aTo, bTo);

}

/**
 * Compare two texts.
 *
 * @param {string} original
 * @param {string} changed
 * @param {{ ignoreWhitespace?: boolean }} options
 * @returns {{ ok: false, message: string } | {
 *   ok: true, rows: object[], summary: object, approximate: boolean,
 *   ignoreWhitespace: boolean, whitespaceOnly: boolean
 * }}
 */
export function compare(original, changed, options = {}) {

    const ignoreWhitespace = Boolean(options.ignoreWhitespace);

    const refused = checkLimits(original, changed);

    if (refused) {
        return { ok: false, message: refused.message, reason: refused.reason, side: refused.side };
    }

    const aLines = splitLines(original);
    const bLines = splitLines(changed);

    const ids = new Map();

    const idOf = (line) => {

        const key = ignoreWhitespace ? whitespaceKey(line) : line;

        let id = ids.get(key);

        if (id === undefined) {
            id = ids.size;
            ids.set(key, id);
        }

        return id;

    };

    const aIds = aLines.map(idOf);
    const bIds = bLines.map(idOf);

    const found = matchSequences(aIds, bIds, { left: SEARCH_BUDGET });

    const rows = [];
    const pairBudget = { left: PAIR_BUDGET };

    let i = 0;
    let j = 0;
    let whitespaceOnly = false;

    for (let t = 0; t < found.a.length; t++) {

        const ma = found.a[t];
        const mb = found.b[t];

        emitBlock(rows, aLines, i, ma, bLines, j, mb, ignoreWhitespace, pairBudget);

        if (aLines[ma] !== bLines[mb]) {
            whitespaceOnly = true;
        }

        rows.push({ kind: "same", a: ma + 1, b: mb + 1, aText: aLines[ma], bText: bLines[mb] });

        i = ma + 1;
        j = mb + 1;

    }

    emitBlock(rows, aLines, i, aLines.length, bLines, j, bLines.length, ignoreWhitespace, pairBudget);

    const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 };

    for (const row of rows) {

        if (row.kind === "add") summary.added++;
        else if (row.kind === "del") summary.removed++;
        else if (row.kind === "mod") summary.changed++;
        else summary.unchanged++;

    }

    summary.identical = summary.added + summary.removed + summary.changed === 0;
    summary.originalLines = aLines.length;
    summary.changedLines = bLines.length;

    return {
        ok: true,
        rows,
        summary,
        approximate: !found.complete,
        ignoreWhitespace,
        whitespaceOnly: ignoreWhitespace && whitespaceOnly
    };

}


/* =========================================================
   What the rows say
========================================================= */

/* the lines of one side, rebuilt from the rows ("a" Original, "b" Changed) */
export function reconstruct(result, side) {

    const lines = [];

    for (const row of result.rows) {

        if (side === "a" && row.kind !== "add") lines.push(row.aText);
        if (side === "b" && row.kind !== "del") lines.push(row.bText);

    }

    return lines;

}

export function describeSummary(summary) {

    if (summary.identical) {
        return "No differences found.";
    }

    const parts = [];

    if (summary.added) parts.push(`${summary.added} added`);
    if (summary.removed) parts.push(`${summary.removed} removed`);
    if (summary.changed) parts.push(`${summary.changed} changed`);

    parts.push(`${summary.unchanged} unchanged`);

    return parts.join(", ");

}

/*
   The rows as the page lists them: every row, except that a long
   run of unchanged lines becomes one gap with a few lines of
   context left on each side of a change. Pure, so it is tested.
*/
export function collapseRows(rows, context = CONTEXT_LINES) {

    const items = [];

    let run = [];

    const flushRun = (atStart, atEnd) => {

        if (run.length === 0) {
            return;
        }

        const keepBefore = atStart ? 0 : context;
        const keepAfter = atEnd ? 0 : context;

        const hidden = run.length - keepBefore - keepAfter;

        if (hidden >= MIN_HIDDEN_LINES) {

            for (const row of run.slice(0, keepBefore)) items.push({ type: "row", row });

            items.push({ type: "gap", rows: run.slice(keepBefore, run.length - keepAfter) });

            for (const row of run.slice(run.length - keepAfter)) items.push({ type: "row", row });

        } else {

            for (const row of run) items.push({ type: "row", row });

        }

        run = [];

    };

    let seenChange = false;

    for (const row of rows) {

        if (row.kind === "same") {

            run.push(row);

        } else {

            flushRun(!seenChange, false);

            seenChange = true;

            items.push({ type: "row", row });

        }

    }

    flushRun(!seenChange, true);

    /* with no change at all there is nothing to show */
    return seenChange ? items : [];

}


/* =========================================================
   Unified diff (the text Copy diff puts on the clipboard)
========================================================= */

export function toUnifiedDiff(result, options = {}) {

    const context = options.context ?? CONTEXT_LINES;
    const rows = result.rows;

    const changedAt = [];

    rows.forEach((row, index) => {
        if (row.kind !== "same") changedAt.push(index);
    });

    if (changedAt.length === 0) {
        return "";
    }

    /* merge the windows around the changes */
    const ranges = [];

    for (const index of changedAt) {

        const from = Math.max(0, index - context);
        const to = Math.min(rows.length - 1, index + context);

        const last = ranges[ranges.length - 1];

        if (last && from <= last[1] + 1) {
            last[1] = Math.max(last[1], to);
        } else {
            ranges.push([from, to]);
        }

    }

    /* lines of each side before every row */
    const aBefore = new Int32Array(rows.length + 1);
    const bBefore = new Int32Array(rows.length + 1);

    rows.forEach((row, index) => {

        aBefore[index + 1] = aBefore[index] + (row.kind === "add" ? 0 : 1);
        bBefore[index + 1] = bBefore[index] + (row.kind === "del" ? 0 : 1);

    });

    const out = [`--- ${options.originalLabel ?? "Original"}`, `+++ ${options.changedLabel ?? "Changed"}`];

    for (const [from, to] of ranges) {

        const aCount = aBefore[to + 1] - aBefore[from];
        const bCount = bBefore[to + 1] - bBefore[from];

        const aStart = aCount > 0 ? aBefore[from] + 1 : aBefore[from];
        const bStart = bCount > 0 ? bBefore[from] + 1 : bBefore[from];

        out.push(`@@ -${aStart},${aCount} +${bStart},${bCount} @@`);

        for (let index = from; index <= to; index++) {

            const row = rows[index];

            if (row.kind === "same") {
                out.push(` ${row.aText}`);
            } else if (row.kind === "add") {
                out.push(`+${row.bText}`);
            } else if (row.kind === "del") {
                out.push(`-${row.aText}`);
            } else {
                out.push(`-${row.aText}`, `+${row.bText}`);
            }

        }

    }

    return `${out.join("\n")}\n`;

}
