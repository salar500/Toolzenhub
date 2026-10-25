/**
 * Tool Pack 33: Merge PDF, Split PDF, Extract, Reorder and Rotate PDF Pages.
 *
 * Pure rules, and the three operations run with the VENDORED pdf-lib on synthetic documents. The
 * results are read back by tests/helpers/pdf-pages.mjs (a strict reader that knows nothing about the
 * tools) and, when pypdf is installed, by a second reader in Python. The input documents with
 * bookmarks, an annotation, a turned page and three kinds of protection were made by pypdf, not by
 * the code under test (tests/fixtures/pdf-tools-fixtures.*).
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
    MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES, MAX_PAGES, MAX_PARTS,
    checkPdfBytes, planFiles, parseRanges, planEveryN, planRangeParts, planPages,
    addTurn, describeEntry, describePart, partName, describeMerge, describePages,
    PROTECTED_MESSAGE, DAMAGED_MESSAGE
} from "../../assets/js/tools/pdf-shared/pdf-rules.js";

import { openPdf, mergePdfs, splitPdf, buildPagesPdf, PdfProblem } from "../../assets/js/tools/pdf-shared/pdf-ops.js";
import { readPages } from "../helpers/pdf-pages.mjs";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

const manifest = JSON.parse(fs.readFileSync("tests/fixtures/pdf-tools-fixtures.json", "utf8")).items;
const fx = (name) => manifest.find((f) => f.name === name);
const bytesOf = (name) => new Uint8Array(Buffer.from(fx(name).base64, "base64"));
const labelsOf = (out) => readPages(out).pages.map((p) => p.label);
const noYield = { yieldBetween: false };

/* a labelled document of `n` pages, made here for the size tests */
async function numbered(n) {
    const d = await pdfLib.PDFDocument.create({ updateMetadata: false });
    const f = await d.embedFont(pdfLib.StandardFonts.Helvetica);
    for (let i = 1; i <= n; i += 1) d.addPage([300, 300]).drawText(`N${i}`, { x: 10, y: 10, size: 20, font: f });
    return new Uint8Array(await d.save({ useObjectStreams: false }));
}


test("fixtures: the oracle's own description of the inputs", () => {
    assert.deepEqual(fx("a").pages.map((p) => [p.label, p.width, p.height, p.rotate]), [["A-P1", 595, 842, 0], ["A-P2", 612, 792, 0], ["A-P3", 300, 400, 0]]);
    assert.deepEqual(fx("b").pages.map((p) => [p.label, p.width, p.height]), [["B-P1", 595, 842], ["B-P2", 842, 595]]);
    assert.equal(fx("a-deco").outline, 2);
    assert.equal(fx("a-deco").annotations, 1);
    assert.equal(fx("a-deco").pages[1].rotate, 90);
});


/* =========================================================
   Recognising a file
========================================================= */

test("checkPdfBytes: content, not the name", () => {
    const enc = (s) => new TextEncoder().encode(s);
    assert.deepEqual(checkPdfBytes(enc("%PDF-1.7\n..."), enc("...\n%%EOF\n"), 500), { ok: true });
    assert.match(checkPdfBytes(enc("x"), enc("x"), 0).message, /empty/);
    assert.match(checkPdfBytes(enc("hello"), enc("%%EOF"), 500).message, /not a PDF/);
    assert.match(checkPdfBytes(enc("%PDF-1.4"), enc("no end"), 500).message, /incomplete or damaged/);
    assert.match(checkPdfBytes(enc("%PDF-1.4"), enc("%%EOF"), MAX_FILE_BYTES + 1).message, /most one PDF/);
    /* the %PDF- header may follow a few junk bytes, as the PDF specification allows */
    assert.equal(checkPdfBytes(enc("ï»¿%PDF-1.4"), enc("%%EOF"), 9).ok, true);
});

test("checkPdfBytes: every real fixture passes the cheap check, a truncated one does not", () => {
    for (const name of ["a", "b", "c", "a-deco", "enc-aes256", "enc-rc4", "enc-owner-only"]) {
        const b = bytesOf(name);
        assert.equal(checkPdfBytes(b.subarray(0, 1024), b.subarray(Math.max(0, b.length - 1024)), b.length).ok, true, name);
    }
    const a = bytesOf("a");
    const cut = a.subarray(0, Math.floor(a.length / 2));
    assert.equal(checkPdfBytes(cut.subarray(0, 1024), cut.subarray(Math.max(0, cut.length - 1024)), cut.length).ok, false);
});

test("planFiles: counts, sizes and the total are limited, the rest is still accepted", () => {
    const f = (name, size) => ({ name, size });
    const plan = planFiles([], [f("a.pdf", 1000), f("empty.pdf", 0), f("huge.pdf", MAX_FILE_BYTES + 1), f("b.pdf", 2000)]);
    assert.deepEqual(plan.accepted, [0, 3]);
    assert.deepEqual(plan.rejected.map((r) => r.name), ["empty.pdf", "huge.pdf"]);
    const many = planFiles(new Array(MAX_FILES).fill(10), [f("one-more.pdf", 10)]);
    assert.deepEqual(many.accepted, []);
    assert.match(many.rejected[0].message, new RegExp(`up to ${MAX_FILES} PDFs`));
    const total = planFiles([MAX_TOTAL_BYTES - 5], [f("x.pdf", 10), f("y.pdf", 3)]);
    assert.deepEqual(total.accepted, [1]);
    assert.match(total.rejected[0].message, /together would pass/);
});


/* =========================================================
   Page ranges
========================================================= */

test("parseRanges: the grammar of the specification", () => {
    const ok = (text, count, options) => parseRanges(text, count, options);
    assert.deepEqual(ok("1-3, 5, 7-9", 10).pages, [1, 2, 3, 5, 7, 8, 9]);
    assert.deepEqual(ok("1-3, 5, 7-9", 10).items, [{ from: 1, to: 3 }, { from: 5, to: 5 }, { from: 7, to: 9 }]);
    assert.deepEqual(ok("all", 4).pages, [1, 2, 3, 4]);
    assert.deepEqual(ok("ALL", 2).pages, [1, 2]);
    assert.deepEqual(ok(" 2 - 4 ;  1 ", 5).pages, [2, 3, 4, 1], "spaces around a dash, a semicolon, and a page after a run");
    assert.deepEqual(ok("3 1 2", 3).pages, [3, 1, 2], "pages separated by spaces");
    assert.deepEqual(ok("2, 2, 2", 3).pages, [2, 2, 2], "a page may be repeated");
    assert.deepEqual(ok("5-3", 6, { descending: true }).pages, [5, 4, 3]);
    assert.deepEqual(ok("4", 4).pages, [4]);
});

test("parseRanges: every refusal names what is wrong", () => {
    const bad = (text, count, options) => {
        const r = parseRanges(text, count, options);
        assert.equal(r.ok, false, text);
        return r.message;
    };
    assert.match(bad("", 5), /Enter the pages/);
    assert.match(bad("   ", 5), /Enter the pages/);
    assert.equal(bad("12", 9), "Page 12 does not exist: this PDF has 9 pages.");
    assert.equal(bad("2-7", 3), "Page 7 does not exist: this PDF has 3 pages.");
    assert.equal(bad("1", 0), "Page 1 does not exist: this PDF has 0 pages.");
    assert.match(bad("0", 5), /start at 1/);
    assert.match(bad("1-0", 5), /start at 1/);
    assert.match(bad("-3", 5), /not a page or a range/, "a negative number is not a page");
    assert.match(bad("1,,2", 5), /extra comma/);
    assert.match(bad("1,", 5), /extra comma/);
    assert.match(bad("abc", 5), /"abc" is not a page or a range/);
    assert.match(bad("1.5", 5), /not a page or a range/);
    assert.match(bad("5-3", 6), /counts down/);
    assert.match(bad("1-2000", 3000, { maxPages: 1000 }), /more than 1000 pages/);
    assert.equal(parseRanges("1-1000", 1000).ok, true);
    assert.equal(parseRanges("1-1000, 1", 1000).ok, false, "1,001 pages is over the limit");
});

test("planEveryN: whole parts and the last one shorter; the number of files is limited", () => {
    assert.deepEqual(planEveryN(7, 3).parts, [{ from: 1, to: 3 }, { from: 4, to: 6 }, { from: 7, to: 7 }]);
    assert.deepEqual(planEveryN(3, "5").parts, [{ from: 1, to: 3 }]);
    assert.equal(planEveryN(MAX_PARTS, 1).parts.length, MAX_PARTS);
    assert.match(planEveryN(MAX_PARTS + 1, 1).message, /most is 20/);
    for (const n of ["", "0", "-1", "1.5", "two", NaN]) assert.equal(planEveryN(10, n).ok, false, String(n));
    /* the parts always cover every page exactly once, in order */
    for (const [count, n] of [[1, 1], [10, 3], [20, 7], [19, 19], [100, 5]]) {
        const parts = planEveryN(count, n).parts;
        assert.deepEqual(parts.flatMap((p) => Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i)), Array.from({ length: count }, (_, i) => i + 1));
    }
});

test("planRangeParts: one part for each range, forward only, at most 20", () => {
    assert.deepEqual(planRangeParts("1-3, 4-4, 5-12", 12).parts, [{ from: 1, to: 3 }, { from: 4, to: 4 }, { from: 5, to: 12 }]);
    assert.deepEqual(planRangeParts("1-2, 2-3", 3).parts.length, 2, "overlapping ranges are allowed");
    assert.equal(planRangeParts("3-1", 5).ok, false);
    assert.equal(planRangeParts(Array.from({ length: MAX_PARTS + 1 }, (_, i) => i + 1).join(","), 30).ok, false);
    assert.equal(describePart({ from: 1, to: 3 }, 0), "part-1.pdf: pages 1 to 3 (3 pages)");
    assert.equal(describePart({ from: 4, to: 4 }, 1), "part-2.pdf: page 4 (1 page)");
    assert.equal(partName(11), "part-12.pdf");
});

test("planPages: order, repeats, turns and where they apply", () => {
    const plan = (o) => planPages({ pageCount: 8, ...o });
    assert.deepEqual(plan({ keep: "3, 1, 5-6" }).entries, [{ source: 3, turn: 0 }, { source: 1, turn: 0 }, { source: 5, turn: 0 }, { source: 6, turn: 0 }]);
    assert.deepEqual(plan({ keep: "2, 2", turn: "90" }).entries, [{ source: 2, turn: 90 }, { source: 2, turn: 90 }]);
    assert.deepEqual(plan({ keep: "1-4", turn: "270", applyTo: "2, 4" }).entries.map((e) => e.turn), [0, 270, 0, 270]);
    assert.deepEqual(plan({ keep: "1-3", turn: "0", applyTo: "garbage" }).entries.map((e) => e.turn), [0, 0, 0], "no turn: the 'apply to' text is not read");
    assert.deepEqual(plan({ keep: "4-2" }).entries.map((e) => e.source), [4, 3, 2]);
    assert.equal(plan({ keep: "9" }).ok, false);
    assert.match(plan({ keep: "1", turn: "90", applyTo: "40" }).message, /^Pages to turn: Page 40 does not exist/);
    assert.match(plan({ keep: "1", turn: "45" }).message, /how to turn/);
    assert.equal(describeEntry({ source: 3, turn: 90 }, 0), "Page 1 = original page 3, turned 90° clockwise");
    assert.equal(describeEntry({ source: 3, turn: 270 }, 1), "Page 2 = original page 3, turned 90° anticlockwise");
    assert.equal(describeEntry({ source: 3, turn: 0 }, 2), "Page 3 = original page 3");
});

test("addTurn: always 0, 90, 180 or 270", () => {
    assert.equal(addTurn(0, 90), 90);
    assert.equal(addTurn(90, 90), 180);
    assert.equal(addTurn(270, 90), 0);
    assert.equal(addTurn(90, 270), 0);
    assert.equal(addTurn(180, 180), 0);
    assert.equal(addTurn(-90, 0), 270, "a negative rotation in a source file");
    assert.equal(addTurn(450, 0), 90);
    assert.equal(addTurn(undefined, 90), 90);
});

test("wording", () => {
    assert.equal(describeMerge({ files: 2, pages: 5, bytes: 2048 }), "2 PDFs joined into 5 pages, 2.0 KB.");
    assert.equal(describeMerge({ files: 3, pages: 1, bytes: 10 }), "3 PDFs joined into 1 page, 10 bytes.");
    assert.equal(describePages({ pages: 1, bytes: 1 }), "1 page, 1 byte.");
});


/* =========================================================
   Opening documents
========================================================= */

test("openPdf: a good document, and every kind of protection is refused as protected", async () => {
    const a = await openPdf(bytesOf("a"), pdfLib);
    assert.equal(a.pageCount, 3);
    assert.equal((await openPdf(bytesOf("b"), pdfLib)).pageCount, 2, "a document written with object streams");
    for (const name of ["enc-aes256", "enc-rc4", "enc-owner-only"]) {
        await assert.rejects(() => openPdf(bytesOf(name), pdfLib), (e) => e instanceof PdfProblem && e.kind === "protected" && e.message === PROTECTED_MESSAGE, name);
    }
});

test("openPdf: garbage of every shape becomes the one plain 'damaged' message, never the library's text", async () => {
    const enc = (s) => new TextEncoder().encode(s);
    const cases = {
        "not a pdf": enc("not a pdf at all".repeat(20)),
        "header then garbage (the library throws a TypeError here)": enc("%PDF-1.7\n" + "garbage".repeat(50)),
        "nothing": new Uint8Array(0),
        "one byte": enc("%")
    };
    for (const [label, bytes] of Object.entries(cases)) {
        await assert.rejects(() => openPdf(bytes, pdfLib), (e) => e instanceof PdfProblem && e.kind === "damaged" && e.message === DAMAGED_MESSAGE, label);
    }
});

test("documented risk: the library silently opens a file that lost its end, so the %%EOF check must come first", async () => {
    const a = bytesOf("a");
    const cut = a.subarray(0, Math.floor(a.length / 2));
    const opened = await openPdf(cut, pdfLib).then((r) => r.pageCount, () => null);
    /* if a future library version refuses it, the check is simply redundant; if it opens fewer than 3 pages, the check is what protects the visitor */
    assert.ok(opened === null || opened < 3, `opened ${opened}`);
    assert.equal(checkPdfBytes(cut.subarray(0, 1024), cut.subarray(Math.max(0, cut.length - 1024)), cut.length).ok, false);
});

test("openPdf: the page limit", async () => {
    const big = await numbered(MAX_PAGES + 1);
    await assert.rejects(() => openPdf(big, pdfLib), (e) => e instanceof PdfProblem && e.kind === "too-many-pages");
});


/* =========================================================
   Merge
========================================================= */

test("mergePdfs: the pages of each file in order, with their sizes and turns, checked by two readers", async () => {
    const names = ["a", "b", "c", "a-deco"];
    const progress = [];
    const out = await mergePdfs({ count: names.length, getBytes: async (i) => bytesOf(names[i]), pdfLib, onProgress: (d, c) => progress.push([d, c]), ...noYield });
    const read = readPages(out.bytes);
    const expected = names.flatMap((n) => fx(n).pages);

    assert.equal(out.pages, 9);
    assert.equal(out.files, 4);
    assert.deepEqual(read.pages.map((p) => p.label), expected.map((p) => p.label));
    assert.deepEqual(read.pages.map((p) => [p.width, p.height]), expected.map((p) => [p.width, p.height]));
    assert.deepEqual(read.pages.map((p) => p.rotate), expected.map((p) => p.rotate), "a page that was already turned stays turned");
    assert.equal(read.pages.length, 9);
    assert.deepEqual(progress[0], [0, 4]);
    assert.deepEqual(progress.at(-1), [4, 4]);
    assert.equal(read.hasProducer || read.hasCreationDate || read.mentionsLibrary, false, "no creator, date or library name");
    assert.equal(read.bookmarks, false, "bookmarks are NOT kept (and the page says so)");
});

test("mergePdfs: reordering the input reorders the output", async () => {
    const out = await mergePdfs({ count: 3, getBytes: async (i) => bytesOf(["c", "b", "a"][i]), pdfLib, ...noYield });
    assert.deepEqual(labelsOf(out.bytes), ["C-P1", "B-P1", "B-P2", "A-P1", "A-P2", "A-P3"]);
});

test("mergePdfs: a protected or damaged file stops the job with its index, and nothing is returned", async () => {
    const files = [bytesOf("a"), bytesOf("enc-aes256"), bytesOf("c")];
    await assert.rejects(() => mergePdfs({ count: 3, getBytes: async (i) => files[i], pdfLib, ...noYield }), (e) => e.index === 1 && e.kind === "protected");
    await assert.rejects(() => mergePdfs({ count: 2, getBytes: async (i) => [bytesOf("a"), new TextEncoder().encode("%PDF-1.7 junk")][i], pdfLib, ...noYield }), (e) => e.index === 1 && e.kind === "damaged");
    await assert.rejects(() => mergePdfs({ count: 2, getBytes: async (i) => { if (i === 1) throw new Error("disk"); return bytesOf("a"); }, pdfLib, ...noYield }), (e) => e.index === 1);
});

test("mergePdfs: one file at a time, and cancelling stops without a file", async () => {
    let open = 0, peak = 0, calls = 0;
    const getBytes = async (i) => { open += 1; peak = Math.max(peak, open); await new Promise((r) => setTimeout(r, 1)); open -= 1; calls += 1; return bytesOf(["a", "b", "c"][i]); };
    await mergePdfs({ count: 3, getBytes, pdfLib, ...noYield });
    assert.equal(peak, 1);

    let after = 0;
    const cancelled = await mergePdfs({ count: 3, getBytes: async (i) => { after += 1; return bytesOf("a"); }, pdfLib, isCancelled: () => after >= 1, ...noYield });
    assert.deepEqual(cancelled, { cancelled: true });
    assert.equal(after, 1, "no further file was read after the cancel");
    assert.deepEqual(await mergePdfs({ count: 2, getBytes: async () => bytesOf("a"), pdfLib, isCancelled: () => true, ...noYield }), { cancelled: true });
});

test("mergePdfs: the total page limit", async () => {
    const big = await numbered(600);
    await assert.rejects(() => mergePdfs({ count: 2, getBytes: async () => big, pdfLib, ...noYield }), (e) => e.kind === "too-many-pages" && e.index === 1);
});

test("mergePdfs: 2 x 300 pages come out as 600 pages in order", async () => {
    const big = await numbered(300);
    const out = await mergePdfs({ count: 2, getBytes: async () => big, pdfLib, ...noYield });
    const labels = labelsOf(out.bytes);
    assert.equal(labels.length, 600);
    assert.equal(labels[0], "N1");
    assert.equal(labels[299], "N300");
    assert.equal(labels[300], "N1");
    assert.equal(labels[599], "N300");
});


/* =========================================================
   Split
========================================================= */

test("splitPdf: each part has exactly its pages, and every-N parts add up to the source", async () => {
    const source = await numbered(7);
    const plan = planEveryN(7, 3).parts;
    const out = await splitPdf({ bytes: source, parts: plan, pdfLib, ...noYield });

    assert.deepEqual(out.parts.map((p) => [p.from, p.to, p.pages]), [[1, 3, 3], [4, 6, 3], [7, 7, 1]]);
    assert.deepEqual(out.parts.map((p) => labelsOf(p.bytes)), [["N1", "N2", "N3"], ["N4", "N5", "N6"], ["N7"]]);
    assert.deepEqual(out.parts.flatMap((p) => labelsOf(p.bytes)), labelsOf(source), "the parts together are the source, in order");
});

test("splitPdf: ranges, overlap, sizes and turns of the pages are kept", async () => {
    const out = await splitPdf({ bytes: bytesOf("a-deco"), parts: planRangeParts("1-2, 2-3, 3-3", 3).parts, pdfLib, ...noYield });
    const read = out.parts.map((p) => readPages(p.bytes).pages);

    assert.deepEqual(read.map((pages) => pages.map((p) => p.label)), [["A-P1", "A-P2"], ["A-P2", "A-P3"], ["A-P3"]]);
    assert.deepEqual(read[0].map((p) => [p.width, p.height, p.rotate]), [[595, 842, 0], [612, 792, 90]]);
    assert.deepEqual(read[1].map((p) => [p.width, p.height, p.rotate]), [[612, 792, 90], [300, 400, 0]]);
});

test("splitPdf: what is and is not kept is stated, and true", async () => {
    const out = await splitPdf({ bytes: bytesOf("a-deco"), parts: [{ from: 1, to: 1 }, { from: 2, to: 3 }], pdfLib, ...noYield });
    const [first, second] = out.parts.map((p) => readPages(p.bytes));

    assert.equal(first.pages[0].annotations, 1, "the link annotation on page 1 was copied with it");
    assert.equal(second.pages[0].annotations, 0);
    assert.equal(first.bookmarks || second.bookmarks, false, "bookmarks are not kept");
    assert.equal(first.hasProducer || first.hasCreationDate || first.mentionsLibrary, false);
});

test("splitPdf: protected and damaged inputs are refused, cancel returns no files", async () => {
    await assert.rejects(() => splitPdf({ bytes: bytesOf("enc-rc4"), parts: [{ from: 1, to: 1 }], pdfLib, ...noYield }), (e) => e.kind === "protected");
    await assert.rejects(() => splitPdf({ bytes: new TextEncoder().encode("%PDF-1.7 junk"), parts: [{ from: 1, to: 1 }], pdfLib, ...noYield }), (e) => e.kind === "damaged");
    let seen = 0;
    const out = await splitPdf({ bytes: bytesOf("a"), parts: [{ from: 1, to: 1 }, { from: 2, to: 2 }, { from: 3, to: 3 }], pdfLib, onProgress: () => { seen += 1; }, isCancelled: () => seen >= 2, ...noYield });
    assert.deepEqual(out, { cancelled: true });
});


/* =========================================================
   Extract, Reorder and Rotate
========================================================= */

test("buildPagesPdf: the chosen pages in the chosen order, repeats included", async () => {
    const plan = planPages({ pageCount: 3, keep: "3, 1, 1, 2" });
    const out = await buildPagesPdf({ bytes: bytesOf("a"), entries: plan.entries, pdfLib, ...noYield });
    const read = readPages(out.bytes);

    assert.equal(out.pages, 4);
    assert.deepEqual(read.pages.map((p) => p.label), ["A-P3", "A-P1", "A-P1", "A-P2"]);
    assert.deepEqual(read.pages.map((p) => [p.width, p.height]), [[300, 400], [595, 842], [595, 842], [612, 792]]);
    assert.deepEqual(read.pages.map((p) => p.rotate), [0, 0, 0, 0]);
});

test("buildPagesPdf: a turn is added to the page's own turn; a repeated page can be turned differently", async () => {
    /* original page 2 is already turned 90 */
    const out = await buildPagesPdf({ bytes: bytesOf("a-deco"), entries: [{ source: 2, turn: 90 }, { source: 2, turn: 270 }, { source: 2, turn: 0 }, { source: 1, turn: 270 }, { source: 3, turn: 180 }], pdfLib, ...noYield });

    assert.deepEqual(readPages(out.bytes).pages.map((p) => [p.label, p.rotate]), [["A-P2", 180], ["A-P2", 0], ["A-P2", 90], ["A-P1", 270], ["A-P3", 180]]);
});

test("buildPagesPdf: removing pages is choosing the rest", async () => {
    const plan = planPages({ pageCount: 300, keep: "1-2, 4-300" });
    const out = await buildPagesPdf({ bytes: await numbered(300), entries: plan.entries, pdfLib, ...noYield });
    const labels = labelsOf(out.bytes);

    assert.equal(labels.length, 299);
    assert.equal(labels.includes("N3"), false);
    assert.equal(labels[2], "N4");
});

test("buildPagesPdf: protected and damaged inputs are refused, cancel returns no file", async () => {
    await assert.rejects(() => buildPagesPdf({ bytes: bytesOf("enc-owner-only"), entries: [{ source: 1, turn: 0 }], pdfLib, ...noYield }), (e) => e.kind === "protected");
    assert.deepEqual(await buildPagesPdf({ bytes: bytesOf("a"), entries: [{ source: 1, turn: 0 }], pdfLib, isCancelled: () => true, ...noYield }), { cancelled: true });
});


/* =========================================================
   A second, independent reader (pypdf), when it is installed
========================================================= */

function pythonCheck(bytes) {

    const file = path.join(os.tmpdir(), `pdf-tools-test-${process.pid}-${Math.random().toString(36).slice(2)}.pdf`);

    fs.writeFileSync(file, bytes);

    try {
        for (const python of ["python", "python3", "py"]) {
            const run = spawnSync(python, ["-I", "tests/fixtures/pdf-tools-check.py", file], { encoding: "utf8" });
            if (run.error) continue;
            if (run.status === 3) return null;
            if (run.status === 0) return JSON.parse(run.stdout);
        }
        return null;
    } finally {
        fs.rmSync(file, { force: true });
    }

}

test("pypdf agrees with the strict reader on a merge, a split part and a page choice (skipped without pypdf)", async (t) => {

    const merged = (await mergePdfs({ count: 3, getBytes: async (i) => bytesOf(["a-deco", "b", "c"][i]), pdfLib, ...noYield })).bytes;

    if (pythonCheck(merged) === null) {
        t.skip("pypdf is not installed");
        return;
    }

    const part = (await splitPdf({ bytes: bytesOf("a-deco"), parts: [{ from: 1, to: 2 }], pdfLib, ...noYield })).parts[0].bytes;
    const chosen = (await buildPagesPdf({ bytes: bytesOf("a-deco"), entries: [{ source: 2, turn: 90 }, { source: 3, turn: 0 }], pdfLib, ...noYield })).bytes;

    for (const bytes of [merged, part, chosen]) {
        const theirs = pythonCheck(bytes);
        const ours = readPages(bytes);
        assert.equal(theirs.encrypted, false);
        assert.deepEqual(theirs.pages.map((p) => [p.label, p.width, p.height, p.rotate, p.annotations]), ours.pages.map((p) => [p.label, p.width, p.height, p.rotate, p.annotations]));
        assert.equal(theirs.outline, 0);
    }

    assert.deepEqual(pythonCheck(chosen).pages.map((p) => p.rotate), [180, 0]);

});


/* =========================================================
   The tools' own code: no network, no storage, no tracking
========================================================= */

test("the tools' code makes no request, stores nothing and loads nothing from another site", () => {

    const dirs = ["merge-pdf", "split-pdf", "pdf-pages", "pdf-shared"].map((d) => path.join("assets/js/tools", d));
    const forbidden = [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/, /localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/, /https?:\/\//, /\bgtag\b|\bdataLayer\b|analytics/i, /\beval\s*\(|new Function\(/];

    for (const dir of dirs) {
        for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".js"))) {
            const source = fs.readFileSync(path.join(dir, name), "utf8");
            for (const pattern of forbidden) {
                assert.equal(pattern.test(source), false, `${dir}/${name} matches ${pattern}`);
            }
        }
    }

});

test("the page text makes no claim the tests cannot support", () => {

    const dirs = ["merge-pdf", "split-pdf", "pdf-pages", "pdf-shared"].map((d) => path.join("assets/js/tools", d));
    const claims = /(?<!not promise that it )works offline|100% private|universal|every PDF|any PDF|lossless|no quality loss|guarantee|AI-powered|best PDF|bypass|unlock|remove (the )?password/i;

    for (const dir of dirs) {
        for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".js"))) {
            const source = fs.readFileSync(path.join(dir, name), "utf8");
            assert.equal(claims.test(source), false, `${dir}/${name}: ${claims.exec(source)?.[0]}`);
        }
    }

});
