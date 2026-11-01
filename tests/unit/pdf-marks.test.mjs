/*
 * PDF page numbers and watermark (tool pack 52): the pure rules and markPdf run with the VENDORED
 * pdf-lib on synthetic documents. The output is re-opened and its content streams are read back.
 * Run directly: node --test tests/unit/pdf-marks.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
    checkSettings, numberText, numberFor, visibleToPage, visibleSize, numberAnchor,
    watermarkFontSize, watermarkAnchor, markPdf, markedName, isDrawableText, DEFAULT_SETTINGS
} from "../../assets/js/tools/pdf-shared/pdf-marks.js";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

const ok = (raw) => {
    const r = checkSettings(raw);
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.settings;
};

/* ---------- settings ---------- */

test("defaults are valid; nothing selected is refused", () => {
    assert.equal(checkSettings({}).ok, true);
    const r = checkSettings({ numbers: false, watermark: false });
    assert.equal(r.ok, false);
    assert.match(r.general, /page numbers, a watermark or both/);
});

test("start, size, opacity and text limits", () => {
    for (const bad of ["0", "-1", "1.5", "abc", "", "100000"]) {
        assert.ok(checkSettings({ start: bad }).errors.start, bad);
    }
    for (const bad of ["5", "37", "x"]) assert.ok(checkSettings({ numberSize: bad }).errors.numberSize, bad);
    for (const bad of ["4", "81", "x"]) assert.ok(checkSettings({ watermark: true, watermarkText: "A", watermarkOpacity: bad }).errors.watermarkOpacity, bad);
    assert.ok(checkSettings({ watermark: true, watermarkText: "" }).errors.watermarkText);
    assert.ok(checkSettings({ watermark: true, watermarkText: "x".repeat(41) }).errors.watermarkText);
    assert.equal(checkSettings({ watermark: true, watermarkText: "x".repeat(40) }).ok, true);
    assert.match(checkSettings({ watermark: true, watermarkText: "गोपनीय" }).errors.watermarkText, /Latin/);
    assert.equal(isDrawableText("Café – Draft"), false); // the en dash is outside Latin-1
    assert.equal(isDrawableText("Café Draft"), true);
    assert.equal(ok({ watermark: true, watermarkText: "  DRAFT  " }).watermarkText, "DRAFT");
    assert.equal(ok({ start: "7", numberSize: "12" }).start, 7);
});

/* ---------- page number text ---------- */

test("number text formats, a custom start and skipping the first page", () => {
    assert.equal(numberText("n", 0, 1, 10), "1");
    assert.equal(numberText("page-n", 2, 1, 10), "Page 3");
    assert.equal(numberText("page-n-of-total", 9, 1, 10), "Page 10 of 10");
    assert.equal(numberText("n-of-total", 0, 1, 10), "1 of 10");
    assert.equal(numberText("page-n-of-total", 0, 5, 3), "Page 5 of 7");
    assert.equal(numberText("page-n-of-total", 2, 5, 3), "Page 7 of 7");
    const s = { format: "page-n-of-total", start: 1, skipFirst: true };
    assert.equal(numberFor(0, s, 4), null);
    assert.equal(numberFor(1, s, 4), "Page 1 of 3");
    assert.equal(numberFor(3, s, 4), "Page 3 of 3");
});

/* ---------- geometry ---------- */

/* independent definition: forward map from the page's own coordinates to what a reader sees (clockwise turn) */
function forward(x, y, W, H, R) {
    switch (R) {
        case 90: return { x: y, y: W - x };
        case 180: return { x: W - x, y: H - y };
        case 270: return { x: H - y, y: x };
        default: return { x, y };
    }
}

test("visibleToPage is the inverse of the clockwise turn for every rotation", () => {
    const W = 612, H = 792;
    for (const R of [0, 90, 180, 270]) {
        const vis = visibleSize(W, H, R);
        for (const [vx, vy] of [[0, 0], [28, 28], [100, 300], [vis.width, vis.height], [vis.width / 2, 10]]) {
            const p = visibleToPage(vx, vy, W, H, R);
            const back = forward(p.x, p.y, W, H, R);
            assert.ok(Math.abs(back.x - vx) < 1e-9 && Math.abs(back.y - vy) < 1e-9, `R=${R} (${vx},${vy})`);
        }
    }
    assert.deepEqual(visibleSize(612, 792, 90), { width: 792, height: 612 });
});

test("named positions on the visible page", () => {
    assert.deepEqual(numberAnchor("bottom-center", 600, 800, 100, 10), { x: 250, y: 28 });
    assert.deepEqual(numberAnchor("bottom-left", 600, 800, 100, 10), { x: 28, y: 28 });
    assert.deepEqual(numberAnchor("bottom-right", 600, 800, 100, 10), { x: 472, y: 28 });
    assert.deepEqual(numberAnchor("top-center", 600, 800, 100, 10), { x: 250, y: 762 });
    assert.deepEqual(numberAnchor("top-right", 600, 800, 100, 10), { x: 472, y: 762 });
});

test("watermark size fits and the anchor centres the text", () => {
    assert.equal(watermarkFontSize(5, 600, 800, 0), 96);
    assert.equal(watermarkFontSize(100, 600, 800, 0), 12);
    assert.equal(watermarkFontSize(8, 600, 800, 45), 87);
    const a = watermarkAnchor(600, 800, 200, 50, 0);
    assert.equal(a.x, 200);
    assert.equal(a.y, 400 - 17.5);
    const w = 300, s = 60, th = 45 * Math.PI / 180;
    const b = watermarkAnchor(600, 800, w, s, 45);
    const midX = b.x + (w / 2) * Math.cos(th) - ((s * 0.7) / 2) * Math.sin(th);
    const midY = b.y + (w / 2) * Math.sin(th) + ((s * 0.7) / 2) * Math.cos(th);
    assert.ok(Math.abs(midX - 300) < 1e-9 && Math.abs(midY - 400) < 1e-9);
});

test("file names", () => {
    assert.equal(markedName("Report 2026.pdf"), "Report 2026-marked.pdf");
    assert.equal(markedName("a/b\\c<>.PDF"), "abc-marked.pdf");
    assert.equal(markedName("###.pdf"), "marked.pdf");
    assert.equal(markedName(""), "marked.pdf");
});

/* ---------- the operation on real documents ---------- */

async function sample(pages = [{ w: 612, h: 792 }, { w: 612, h: 792 }, { w: 595, h: 842, rotate: 90 }]) {
    const doc = await pdfLib.PDFDocument.create();
    for (const p of pages) {
        const page = doc.addPage([p.w, p.h]);
        if (p.rotate) page.setRotation(pdfLib.degrees(p.rotate));
    }
    return doc.save();
}

const hex = (text) => Buffer.from(text, "latin1").toString("hex").toUpperCase();

async function streamsOf(bytes, index) {
    const doc = await pdfLib.PDFDocument.load(bytes);
    const page = doc.getPages()[index];
    const contents = page.node.Contents();
    if (!contents) return "";
    const refs = contents instanceof pdfLib.PDFArray ? contents.asArray() : [contents];
    return refs.map((r) => {
        const s = doc.context.lookup(r);
        const raw = pdfLib.decodePDFRawStream(s).decode();
        return Buffer.from(raw).toString("latin1");
    }).join("\n");
}

test("numbers every page and keeps page count, sizes and turns", async () => {
    const bytes = await sample();
    const res = await markPdf({ bytes, settings: ok({}), pdfLib, yieldBetween: false });
    assert.equal(res.pages, 3);
    assert.equal(res.numbered, 3);
    assert.equal(res.watermarked, 0);

    const out = await pdfLib.PDFDocument.load(res.bytes);
    assert.equal(out.getPageCount(), 3);
    assert.deepEqual(out.getPages().map((p) => p.getSize()), [{ width: 612, height: 792 }, { width: 612, height: 792 }, { width: 595, height: 842 }]);
    assert.equal(out.getPages()[2].getRotation().angle, 90);

    for (const [i, label] of ["Page 1 of 3", "Page 2 of 3", "Page 3 of 3"].entries()) {
        const text = await streamsOf(res.bytes, i);
        assert.ok(text.includes(`<${hex(label)}> Tj`), `${label} in:\n${text.slice(0, 400)}`);
    }
});

test("the number sits where the geometry says, also on a turned page", async () => {
    const bytes = await sample();
    const settings = ok({ position: "bottom-right", format: "n" });
    const res = await markPdf({ bytes, settings, pdfLib, yieldBetween: false });
    const helv = await (await pdfLib.PDFDocument.create()).embedFont(pdfLib.StandardFonts.Helvetica);
    const tw = helv.widthOfTextAtSize("3", 10);

    // page 3: 595 x 842 turned 90, so a reader sees 842 wide, 595 high
    const text = await streamsOf(res.bytes, 2);
    const m = /([-\d.e]+) ([-\d.e]+) ([-\d.e]+) ([-\d.e]+) ([-\d.e]+) ([-\d.e]+) Tm/.exec(text);
    assert.ok(m, text.slice(0, 300));
    const [a, b, , , e, f] = m.slice(1).map(Number);
    const vis = { x: 842 - 28 - tw, y: 28 };                 // bottom right as the reader sees it
    const W = 595;
    const expected = { x: W - vis.y, y: vis.x };               // invert the forward map (x, y) -> (y, W - x)
    assert.ok(Math.abs(e - expected.x) < 1e-6 && Math.abs(f - expected.y) < 1e-6, `${e},${f} vs ${expected.x},${expected.y}`);
    assert.ok(Math.abs(Math.atan2(b, a) - Math.PI / 2) < 1e-6);
});

test("skip the first page and start at another number", async () => {
    const bytes = await sample([{ w: 612, h: 792 }, { w: 612, h: 792 }, { w: 612, h: 792 }]);
    const res = await markPdf({ bytes, settings: ok({ skipFirst: true, start: "5", format: "page-n-of-total" }), pdfLib, yieldBetween: false });
    assert.equal(res.numbered, 2);
    assert.ok(!(await streamsOf(res.bytes, 0)).includes(" Tj"));
    assert.ok((await streamsOf(res.bytes, 1)).includes(`<${hex("Page 5 of 6")}> Tj`));
    assert.ok((await streamsOf(res.bytes, 2)).includes(`<${hex("Page 6 of 6")}> Tj`));
});

test("watermark on every page, diagonal and horizontal, with its strength", async () => {
    const bytes = await sample();
    for (const angle of ["diagonal", "horizontal"]) {
        const res = await markPdf({ bytes, settings: ok({ numbers: false, watermark: true, watermarkText: "DRAFT", watermarkAngle: angle, watermarkOpacity: "30" }), pdfLib, yieldBetween: false });
        assert.equal(res.watermarked, 3);
        assert.equal(res.numbered, 0);
        for (let i = 0; i < 3; i++) {
            const text = await streamsOf(res.bytes, i);
            assert.ok(text.includes(`<${hex("DRAFT")}> Tj`), `${angle} page ${i}`);
        }
        const doc = await pdfLib.PDFDocument.load(res.bytes);
        const ext = doc.getPages()[0].node.Resources().lookup(pdfLib.PDFName.of("ExtGState"), pdfLib.PDFDict);
        const gs = ext.lookup(ext.keys()[0], pdfLib.PDFDict);
        assert.equal(gs.lookup(pdfLib.PDFName.of("ca")).asNumber(), 0.3);
    }
});

test("the source is not changed; damaged files are refused plainly", async () => {
    const bytes = await sample();
    const copy = bytes.slice();
    await markPdf({ bytes, settings: ok({}), pdfLib, yieldBetween: false });
    assert.deepEqual(bytes, copy);

    await assert.rejects(markPdf({ bytes: new TextEncoder().encode("%PDF-1.4 garbage"), settings: ok({}), pdfLib }), (e) => e.name === "PdfProblem" && e.kind === "damaged");
});

test("cancelling stops the work and returns no file", async () => {
    const bytes = await sample();
    const res = await markPdf({ bytes, settings: ok({}), pdfLib, isCancelled: () => true, yieldBetween: false });
    assert.deepEqual(res, { cancelled: true });
});

test("defaults object is frozen and complete", () => {
    assert.ok(Object.isFrozen(DEFAULT_SETTINGS));
    assert.equal(DEFAULT_SETTINGS.format, "page-n-of-total");
});
