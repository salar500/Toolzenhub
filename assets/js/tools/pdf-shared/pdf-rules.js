/* =========================================================
   ToolZen Hub
   PDF Tools: the rules shared by Merge PDF, Split PDF and
   Extract, Reorder and Rotate PDF Pages

   Pure functions only (no page, no library, no file reading), so
   every rule can be tested without a browser. See
   docs/tool-packs/33-pdf-tools-batch.md.

   Limits are PROVISIONAL: they are cautious guesses, not measured on
   any phone.
========================================================= */

export { formatBytes } from "../image-compressor-resizer/image-engine.js";
export { moveItem, summariseRejections } from "../photos-to-pdf/pdf-rules.js";

import { formatBytes } from "../image-compressor-resizer/image-engine.js";


export const MAX_FILES = 20;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
export const MAX_PAGES = 1000;
export const MAX_PARTS = 20;

/* how much of a file's start and end is read to recognise it */
export const HEAD_BYTES = 1024;
export const TAIL_BYTES = 1024;

export const MERGED_NAME = "merged.pdf";
export const PAGES_NAME = "pages.pdf";

export const TURNS = [
    { id: "0", label: "Do not turn", degrees: 0 },
    { id: "90", label: "Turn 90° clockwise", degrees: 90 },
    { id: "180", label: "Turn 180°", degrees: 180 },
    { id: "270", label: "Turn 90° anticlockwise", degrees: 270 }
];

const latin1 = (bytes) => {

    let text = "";

    for (let i = 0; i < bytes.length; i += 4096) {
        text += String.fromCharCode.apply(null, bytes.subarray(i, i + 4096));
    }

    return text;

};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;


/* =========================================================
   Recognising a file (content, not name)
========================================================= */

export const PROTECTED_MESSAGE =
    "This PDF is protected with a password or restrictions. ToolZen Hub does not remove protection. Open it in a PDF reader that allows it and save an unprotected copy, only if you are allowed to.";

export const DAMAGED_MESSAGE =
    "This PDF could not be read. It may be damaged or of a kind this tool does not support.";

/*
 * `head` and `tail` are the first and last bytes of the file (Uint8Array),
 * `size` its length. A PDF starts with %PDF- near the top and ends with
 * %%EOF. The end is checked because the library opens a file whose end is
 * missing as a shorter document without any error.
 */
export function checkPdfBytes(head, tail, size) {

    if (!size) {
        return { ok: false, message: "This file is empty." };
    }

    if (size > MAX_FILE_BYTES) {
        return { ok: false, message: `This file is ${formatBytes(size)}. The most one PDF can be here is ${formatBytes(MAX_FILE_BYTES)}.` };
    }

    if (!latin1(head).includes("%PDF-")) {
        return { ok: false, message: "This is not a PDF file. A PDF is recognised by what is inside it, not by its name." };
    }

    if (!latin1(tail).includes("%%EOF")) {
        return { ok: false, message: "This PDF looks incomplete or damaged, because its end is missing. It was not added." };
    }

    return { ok: true };

}


/* =========================================================
   Choosing files to add (Merge)
========================================================= */

/* `listedSizes`: the files already in the list; `candidates`: [{name,size}] */
export function planFiles(listedSizes, candidates) {

    const accepted = [];
    const rejected = [];

    let count = listedSizes.length;
    let total = listedSizes.reduce((sum, size) => sum + size, 0);

    candidates.forEach((file, index) => {

        if (!file.size) {
            rejected.push({ name: file.name, message: "This file is empty." });
            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            rejected.push({ name: file.name, message: `This file is ${formatBytes(file.size)}. The most one PDF can be here is ${formatBytes(MAX_FILE_BYTES)}.` });
            return;
        }

        if (count >= MAX_FILES) {
            rejected.push({ name: file.name, message: `Not added: up to ${MAX_FILES} PDFs can be joined at once. Merge these first, then merge the result with the rest.` });
            return;
        }

        if (total + file.size > MAX_TOTAL_BYTES) {
            rejected.push({ name: file.name, message: `Not added: the PDFs together would pass ${formatBytes(MAX_TOTAL_BYTES)}, which is the most this page handles at once.` });
            return;
        }

        accepted.push(index);
        count += 1;
        total += file.size;

    });

    return { accepted, rejected };

}


/* =========================================================
   Page ranges ("1-3, 5, 7-9", "all")
========================================================= */

/*
 * Returns { ok: true, items: [{from, to}], pages: [1-based page numbers in
 * order] } or { ok: false, message }. A descending run ("5-3") is allowed
 * only when `descending` is true (the page chooser); a part of a split must
 * go forward.
 */
export function parseRanges(text, pageCount, { descending = false, maxPages = MAX_PAGES } = {}) {

    const source = String(text ?? "").trim();

    if (!source) {
        return { ok: false, message: "Enter the pages, for example 1-3, 5 or all." };
    }

    const normalised = source.replace(/\s*[-–—]\s*/g, "-");
    const pieces = normalised.split(/[,;]/);
    const items = [];

    for (const piece of pieces) {

        const tokens = piece.trim().split(/\s+/).filter(Boolean);

        if (tokens.length === 0) {
            return { ok: false, message: "There is an empty place between two commas. Remove the extra comma." };
        }

        for (const token of tokens) {

            if (/^all$/i.test(token)) {
                items.push({ from: 1, to: pageCount });
                continue;
            }

            const match = /^(\d+)(?:-(\d+))?$/.exec(token);

            if (!match) {
                return { ok: false, message: `"${token}" is not a page or a range. Use numbers like 3 or 2-5, separated by commas.` };
            }

            const from = Number(match[1]);
            const to = match[2] === undefined ? from : Number(match[2]);

            for (const n of [from, to]) {

                if (n < 1) {
                    return { ok: false, message: "Pages start at 1." };
                }

                if (n > pageCount) {
                    return { ok: false, message: `Page ${n} does not exist: this PDF has ${plural(pageCount, "page", "pages")}.` };
                }

            }

            if (from > to && !descending) {
                return { ok: false, message: `"${token}" counts down. Write the smaller number first, for example ${to}-${from}.` };
            }

            items.push({ from, to });

        }

    }

    const pages = [];

    for (const { from, to } of items) {

        const step = from <= to ? 1 : -1;

        for (let n = from; n !== to + step; n += step) {

            pages.push(n);

            if (pages.length > maxPages) {
                return { ok: false, message: `That is more than ${maxPages} pages. Choose fewer pages.` };
            }

        }

    }

    return { ok: true, items, pages };

}


/* =========================================================
   Split plans
========================================================= */

export function planEveryN(pageCount, n) {

    const size = Number(n);

    if (!Number.isInteger(size) || size < 1) {
        return { ok: false, message: "Enter a whole number of pages, 1 or more." };
    }

    const parts = [];

    for (let from = 1; from <= pageCount; from += size) {
        parts.push({ from, to: Math.min(pageCount, from + size - 1) });
    }

    if (parts.length > MAX_PARTS) {
        return { ok: false, message: `That would make ${parts.length} files. The most is ${MAX_PARTS}. Use a larger number of pages.` };
    }

    return { ok: true, parts };

}

export function planRangeParts(text, pageCount) {

    const parsed = parseRanges(text, pageCount, { descending: false });

    if (!parsed.ok) {
        return parsed;
    }

    if (parsed.items.length > MAX_PARTS) {
        return { ok: false, message: `That would make ${parsed.items.length} files. The most is ${MAX_PARTS}.` };
    }

    return { ok: true, parts: parsed.items };

}

export function partName(index) {
    return `part-${index + 1}.pdf`;
}

export function describePart(part, index) {

    const pages = Math.abs(part.to - part.from) + 1;

    return `${partName(index)}: ${part.from === part.to ? `page ${part.from}` : `pages ${part.from} to ${part.to}`} (${plural(pages, "page", "pages")})`;

}


/* =========================================================
   Page chooser plan (Extract, Reorder and Rotate)
========================================================= */

/*
 * `keep`: the pages to keep, in order ("3, 1, 5-8", "all").
 * `turn`: one of "0", "90", "180", "270" (clockwise degrees).
 * `applyTo`: "all" (every kept page) or the text of the original pages to turn.
 * Returns { ok: true, entries: [{ source (1-based), turn }] } or { ok: false, message }.
 */
export function planPages({ pageCount, keep, turn = "0", applyTo = "all" }) {

    const chosen = parseRanges(keep, pageCount, { descending: true });

    if (!chosen.ok) {
        return chosen;
    }

    const angle = TURNS.find((t) => t.id === String(turn))?.degrees;

    if (angle === undefined) {
        return { ok: false, message: "Choose how to turn the pages." };
    }

    let turned = null;

    if (angle !== 0 && applyTo !== "all") {

        const which = parseRanges(applyTo, pageCount, { descending: true });

        if (!which.ok) {
            return { ok: false, message: `Pages to turn: ${which.message}` };
        }

        turned = new Set(which.pages);

    }

    const entries = chosen.pages.map((source) => ({
        source,
        turn: angle !== 0 && (turned === null || turned.has(source)) ? angle : 0
    }));

    return { ok: true, entries };

}

/* the new angle of a page: its own rotation plus the turn, always 0, 90, 180 or 270 */
export function addTurn(current, turn) {
    return (((Number(current) || 0) + turn) % 360 + 360) % 360;
}

export function describeEntry(entry, index) {

    const turn = entry.turn === 0 ? "" : entry.turn === 90 ? ", turned 90° clockwise" : entry.turn === 180 ? ", turned 180°" : ", turned 90° anticlockwise";

    return `Page ${index + 1} = original page ${entry.source}${turn}`;

}


/* =========================================================
   Wording
========================================================= */

export function describeMerge({ files, pages, bytes }) {
    return `${plural(files, "PDF", "PDFs")} joined into ${plural(pages, "page", "pages")}, ${formatBytes(bytes)}.`;
}

export function describePages({ pages, bytes }) {
    return `${plural(pages, "page", "pages")}, ${formatBytes(bytes)}.`;
}

export const NOT_KEPT_NOTE =
    "The new file is a new document. Bookmarks are not kept, and forms, signatures and tagged structure are not preserved. Page contents, sizes and turns are kept.";
