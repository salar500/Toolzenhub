/* =========================================================
   ToolZen Hub
   PDF Tools: opening, joining, cutting and choosing pages

   The PDF library is passed in (`pdfLib`), so these functions run in
   Node for the tests and in the browser for the tools. Nothing here
   touches the page. Every document is read and written with the same
   neutral settings: no creator, producer or date is added, and a plain
   cross-reference table is written (the same choice as Photos to PDF).
========================================================= */

import {
    MAX_PAGES,
    PROTECTED_MESSAGE,
    DAMAGED_MESSAGE,
    addTurn
} from "./pdf-rules.js";


export function loadPdfLib() {
    return import("../../vendor/pdf-lib/pdf-lib.esm.min.js");
}

const NEUTRAL = { updateMetadata: false };
const SAVE = { useObjectStreams: false };

const nextTurn = () => new Promise((resolve) => setTimeout(resolve, 0));


/* an error with a message that is safe to show to a visitor */
export class PdfProblem extends Error {
    constructor(message, kind) {
        super(message);
        this.name = "PdfProblem";
        this.kind = kind;
    }
}

/*
 * Anything the library throws becomes one of two plain messages. The
 * library's own wording is never shown, and the type of the error is not
 * trusted: a file with a PDF header and garbage after it raises a
 * TypeError, not a parse error.
 */
export function classifyError(error, pdfLib) {

    if (error instanceof PdfProblem) {
        return error;
    }

    if (pdfLib?.EncryptedPDFError && error instanceof pdfLib.EncryptedPDFError) {
        return new PdfProblem(PROTECTED_MESSAGE, "protected");
    }

    if (/encrypted/i.test(String(error?.message))) {
        return new PdfProblem(PROTECTED_MESSAGE, "protected");
    }

    return new PdfProblem(DAMAGED_MESSAGE, "damaged");

}

/* opens a PDF from its bytes; throws a PdfProblem */
export async function openPdf(bytes, pdfLib) {

    let doc;
    let count;

    /* the library opens some damaged files without complaint and fails on the first page access, so that is inside the try */
    try {
        doc = await pdfLib.PDFDocument.load(bytes, NEUTRAL);
        count = doc.getPageCount();
    } catch (error) {
        throw classifyError(error, pdfLib);
    }

    if (count < 1) {
        throw new PdfProblem("This PDF has no pages.", "empty");
    }

    if (count > MAX_PAGES) {
        throw new PdfProblem(`This PDF has ${count} pages. The most this page handles is ${MAX_PAGES}.`, "too-many-pages");
    }

    return { doc, pageCount: count };

}

/* what the chooser lists: the size of each page in points and its own turn */
export function pageFacts(doc) {

    return doc.getPages().map((page) => {

        const { width, height } = page.getSize();

        return { width, height, rotation: page.getRotation().angle };

    });

}

const cancelled = (isCancelled) => typeof isCancelled === "function" && isCancelled();

async function copyInto(target, source, indexes) {

    const pages = await target.copyPages(source, indexes);

    for (const page of pages) {
        target.addPage(page);
    }

    return pages;

}


/* =========================================================
   Merge: `count` documents, one at a time, in order
========================================================= */

export async function mergePdfs({ count, getBytes, pdfLib, onProgress, isCancelled, yieldBetween = true }) {

    const merged = await pdfLib.PDFDocument.create(NEUTRAL);
    let pages = 0;

    for (let index = 0; index < count; index += 1) {

        if (cancelled(isCancelled)) {
            return { cancelled: true };
        }

        if (typeof onProgress === "function") onProgress(index, count);

        let source;

        try {
            source = await openPdf(await getBytes(index), pdfLib);
        } catch (error) {
            throw Object.assign(classifyError(error, pdfLib), { index });
        }

        if (cancelled(isCancelled)) {
            return { cancelled: true };
        }

        pages += source.pageCount;

        if (pages > MAX_PAGES) {
            throw Object.assign(new PdfProblem(`Together the PDFs would have more than ${MAX_PAGES} pages, which is the most this page handles.`, "too-many-pages"), { index });
        }

        await copyInto(merged, source.doc, source.doc.getPageIndices());

        if (yieldBetween) await nextTurn();

    }

    if (cancelled(isCancelled)) {
        return { cancelled: true };
    }

    if (typeof onProgress === "function") onProgress(count, count);

    const bytes = await merged.save(SAVE);

    return { bytes, pages, files: count };

}


/* =========================================================
   Split: `parts` is [{from, to}] in 1-based pages, going forward
========================================================= */

export async function splitPdf({ bytes, parts, pdfLib, onProgress, isCancelled, yieldBetween = true }) {

    let source;

    try {
        source = await openPdf(bytes, pdfLib);
    } catch (error) {
        throw classifyError(error, pdfLib);
    }

    const results = [];

    for (let index = 0; index < parts.length; index += 1) {

        if (cancelled(isCancelled)) {
            return { cancelled: true };
        }

        if (typeof onProgress === "function") onProgress(index, parts.length);

        const { from, to } = parts[index];
        const indexes = [];

        for (let n = from; n <= to; n += 1) {
            indexes.push(n - 1);
        }

        const part = await pdfLib.PDFDocument.create(NEUTRAL);

        await copyInto(part, source.doc, indexes);

        results.push({ bytes: await part.save(SAVE), from, to, pages: indexes.length });

        if (yieldBetween) await nextTurn();

    }

    if (cancelled(isCancelled)) {
        return { cancelled: true };
    }

    if (typeof onProgress === "function") onProgress(parts.length, parts.length);

    return { parts: results };

}


/* =========================================================
   Pages: `entries` is [{source (1-based), turn (0, 90, 180, 270)}]
========================================================= */

export async function buildPagesPdf({ bytes, entries, pdfLib, onProgress, isCancelled, yieldBetween = true }) {

    let source;

    try {
        source = await openPdf(bytes, pdfLib);
    } catch (error) {
        throw classifyError(error, pdfLib);
    }

    if (cancelled(isCancelled)) {
        return { cancelled: true };
    }

    if (typeof onProgress === "function") onProgress(0, entries.length);

    const target = await pdfLib.PDFDocument.create(NEUTRAL);

    /* one call, so a page chosen twice becomes two independent pages */
    const pages = await target.copyPages(source.doc, entries.map((entry) => entry.source - 1));

    pages.forEach((page, index) => {

        const turn = entries[index].turn;

        if (turn !== 0) {
            page.setRotation(pdfLib.degrees(addTurn(page.getRotation().angle, turn)));
        }

        target.addPage(page);

    });

    if (yieldBetween) await nextTurn();

    if (cancelled(isCancelled)) {
        return { cancelled: true };
    }

    if (typeof onProgress === "function") onProgress(entries.length, entries.length);

    return { bytes: await target.save(SAVE), pages: entries.length };

}
