/**
 * Photos to PDF (Tool Pack 44): turning a photo, and the location details inside a JPEG.
 *
 * The photos are synthetic (tests/fixtures/images/make-metadata-fixtures.py, Pillow plus hand-made
 * APP segments, invented marker strings; no real photograph). Two facts are settled by reading the
 * FILE, not the code that wrote it:
 *
 *   1. Before the fix, the whole JPEG (with its Exif/GPS, XMP and IPTC) was inside the PDF. The
 *      first test keeps that finding as a test of the unchanged embedding step.
 *   2. After the fix, the markers are gone, the picture data is byte for byte unchanged, Pillow
 *      decodes the stripped file to the same pixels, and a turned page really shows the photo turned
 *      (tests/fixtures/photos-to-pdf-turn-check.py paints the page from the PDF's own matrix).
 *
 *   node --test tests/unit/photos-to-pdf-turn-and-metadata.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { stripJpegMetadata } from "../../assets/js/tools/photos-to-pdf/jpeg-segments.js";
import { buildPdf, loadPdfLib } from "../../assets/js/tools/photos-to-pdf/pdf-build.js";
import { computeLayout, cleanTurn, turnedSize, placeTurned, jpegInfo, embedStrategy, sniffFormat, TURN_LABELS } from "../../assets/js/tools/photos-to-pdf/pdf-rules.js";
import { parsePdf } from "../helpers/pdf-structure.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, "..", "fixtures");

const read = (name) => new Uint8Array(fs.readFileSync(path.join(FIX, "images", name)));
const latin = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString("latin1");
const has = (bytes, text) => latin(bytes).includes(text);

const MARKERS = ["ZZ-EXIF-MARKER", "ZZ-XMP-MARKER", "ZZ-IPTC-MARKER"];

const pdfLib = await loadPdfLib();
const one = (bytes, turn = 0) => ({ count: 1, getImage: async () => ({ bytes, turn }) });

const python = spawnSync("python", ["-c", "import PIL"], { encoding: "utf8" }).status === 0 ? "python" : null;
const needPython = python ? {} : { skip: "Python with Pillow is not installed" };

/* the segments of a JPEG before its scan, as [marker, bytes] */
function segments(bytes) {
    const out = [];
    let i = 2;
    while (i + 3 < bytes.length && bytes[i] === 0xff) {
        const marker = bytes[i + 1];
        if (marker === 0xda) break;
        const length = (bytes[i + 2] << 8) | bytes[i + 3];
        out.push([marker, bytes.subarray(i, i + 2 + length)]);
        i += 2 + length;
    }
    return { list: out, scanStart: i };
}

/* =========================================================
   The finding: what the unchanged embedding step keeps
========================================================= */

test("FINDING: a kept JPEG put into a PDF as it is carries its Exif/GPS, XMP and IPTC with it", async () => {

    const source = read("meta-keep.jpg");

    for (const marker of MARKERS) assert.ok(has(source, marker), `${marker} is in the test photo`);

    const result = await buildPdf({ ...one(source), settings: {}, pdfLib, yieldBetween: false });

    for (const marker of MARKERS) assert.ok(has(result.bytes, marker), `${marker} survives inside the PDF`);

    assert.ok(has(result.bytes, latin(source)), "the whole original file is inside the PDF");

});

/* =========================================================
   The strip
========================================================= */

test("stripJpegMetadata removes Exif/XMP (APP1) and IPTC (APP13) and nothing else", () => {

    const source = read("meta-keep.jpg");
    const before = segments(source);
    const result = stripJpegMetadata(source);

    assert.ok(result);

    const after = segments(result.bytes);

    assert.deepEqual(result.removed.map((r) => r.marker).sort(), before.list.filter(([m]) => m === 0xe1 || m === 0xed).map(([m]) => m).sort(), "every APP1 and APP13 is reported");
    assert.ok(result.removed.length >= 3, "Exif, XMP and IPTC");

    const keptBefore = before.list.filter(([m]) => m !== 0xe1 && m !== 0xed);

    assert.equal(after.list.length, keptBefore.length);
    after.list.forEach(([marker, bytes], i) => {
        assert.equal(marker, keptBefore[i][0]);
        assert.deepEqual(Buffer.from(bytes), Buffer.from(keptBefore[i][1]), `segment ${i} (0x${marker.toString(16)}) is byte for byte unchanged`);
    });

    assert.deepEqual(Buffer.from(result.bytes.subarray(after.scanStart)), Buffer.from(source.subarray(before.scanStart)), "the picture data is byte for byte unchanged");

    for (const marker of MARKERS) assert.ok(!has(result.bytes, marker), `${marker} is gone`);

    const markers = after.list.map(([m]) => m);

    assert.ok(markers.includes(0xe0), "JFIF stays");
    assert.ok(markers.includes(0xe2) && has(result.bytes, "ICC_PROFILE"), "the colour profile stays");
    assert.ok(has(result.bytes, "ZZ-COM-MARKER"), "a comment is not touched: no claim that all metadata is gone");

});

test("a JPEG with nothing to remove comes back as the same array", () => {

    const plain = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xda, 0, 2, 1, 2, 3, 0xff, 0xd9]);
    const result = stripJpegMetadata(plain);

    assert.equal(result.bytes, plain);
    assert.deepEqual(result.removed, []);

});

test("stripJpegMetadata refuses what it cannot read safely, and never throws", () => {

    const good = read("meta-keep.jpg");
    const cases = {
        "empty": new Uint8Array(0),
        "not a jpeg": new Uint8Array([1, 2, 3, 4, 5, 6]),
        "no scan": good.subarray(0, 60),
        "segment longer than the file": new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 1, 2, 3]),
        "segment length below 2": new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0, 1, 0xff, 0xda, 0, 2]),
        "garbage between segments": new Uint8Array([0xff, 0xd8, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05]),
        "start only": new Uint8Array([0xff, 0xd8]),
        "undefined": undefined
    };

    for (const [name, bytes] of Object.entries(cases)) {
        assert.equal(stripJpegMetadata(bytes), null, name);
    }

    /* every truncation of a real file is either refused or still a chain that ends in a scan: no exception */
    for (let cut = 0; cut < good.length; cut += 97) {
        assert.doesNotThrow(() => stripJpegMetadata(good.subarray(0, cut)), `cut at ${cut}`);
    }

});

test("the stripped photo is still a kept JPEG with the same size, and decodes to the same pixels (Pillow)", needPython, () => {

    const source = read("meta-keep.jpg");
    const result = stripJpegMetadata(source);
    const info = jpegInfo(result.bytes);

    assert.deepEqual([info.width, info.height, info.orientation], [320, 240, 1]);
    assert.equal(embedStrategy(sniffFormat(result.bytes), info), "keep");

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pp-strip-"));
    const a = path.join(dir, "a.jpg");
    const b = path.join(dir, "b.jpg");

    fs.writeFileSync(a, source);
    fs.writeFileSync(b, result.bytes);

    const run = spawnSync(python, ["-c", [
        "import sys",
        "from PIL import Image",
        "x = Image.open(sys.argv[1]); y = Image.open(sys.argv[2])",
        "assert x.tobytes() == y.tobytes(), 'pixels differ'",
        "assert x.info.get('icc_profile') == y.info.get('icc_profile'), 'icc differs'",
        "assert 'exif' in x.info and 'exif' not in y.info, 'exif not removed'",
        "print('same pixels')"
    ].join("\n"), a, b], { encoding: "utf8" });

    fs.rmSync(dir, { recursive: true, force: true });

    assert.equal(run.status, 0, run.stderr || run.stdout);

});

test("REGRESSION: a PDF built from the stripped photo contains none of the markers and the original scan data", async () => {

    const source = read("meta-keep.jpg");
    const stripped = stripJpegMetadata(source).bytes;
    const result = await buildPdf({ ...one(stripped), settings: {}, pdfLib, yieldBetween: false });

    for (const marker of MARKERS) assert.ok(!has(result.bytes, marker), `${marker} is not in the PDF`);

    assert.ok(has(result.bytes, latin(stripped)), "the stripped file is embedded unchanged");

    const pdf = parsePdf(result.bytes);

    assert.equal(pdf.pages.length, 1);
    assert.equal(pdf.pages[0].image.filter, "DCTDecode");
    assert.equal(pdf.hasProducer, false);
    assert.equal(pdf.hasCreationDate, false);

});

/* =========================================================
   Turning
========================================================= */

test("turn helpers: counts wrap, sizes swap on a quarter turn, labels exist", () => {

    assert.deepEqual([0, 1, 2, 3, 4, 5, -1, -4, 1.5, "1", NaN, undefined].map(cleanTurn), [0, 1, 2, 3, 0, 1, 3, 0, 0, 0, 0, 0]);
    assert.deepEqual(turnedSize(300, 200, 0), { width: 300, height: 200 });
    assert.deepEqual(turnedSize(300, 200, 1), { width: 200, height: 300 });
    assert.deepEqual(turnedSize(300, 200, 2), { width: 300, height: 200 });
    assert.deepEqual(turnedSize(300, 200, 3), { width: 200, height: 300 });
    assert.equal(TURN_LABELS.length, 4);
    assert.deepEqual(TURN_LABELS.slice(0, 2), ["Not rotated", "Rotated 90 degrees right"]);

});

test("an unturned photo is placed exactly as before (FR-PP-011)", async () => {

    const source = stripJpegMetadata(read("meta-keep.jpg")).bytes;
    const plain = await buildPdf({ count: 1, getImage: async () => ({ bytes: source }), settings: {}, pdfLib, yieldBetween: false });
    const zero = await buildPdf({ count: 1, getImage: async () => ({ bytes: source, turn: 0 }), settings: {}, pdfLib, yieldBetween: false });
    const four = await buildPdf({ count: 1, getImage: async () => ({ bytes: source, turn: 4 }), settings: {}, pdfLib, yieldBetween: false });

    assert.deepEqual(Buffer.from(zero.bytes), Buffer.from(plain.bytes));
    assert.deepEqual(Buffer.from(four.bytes), Buffer.from(plain.bytes), "four quarter-turns are no turn");

});

test("each turn: the page has the turned shape and the image corners land where a clockwise turn puts them", async () => {

    const source = stripJpegMetadata(read("meta-keep.jpg")).bytes; // 320 x 240, landscape
    const settings = { pageSize: "a4", orientation: "auto", margin: "small" };

    for (const turn of [0, 1, 2, 3]) {

        const result = await buildPdf({ ...one(source, turn), settings, pdfLib, yieldBetween: false });
        const page = parsePdf(result.bytes).pages[0];
        const shown = turnedSize(320, 240, turn);
        const want = computeLayout(shown.width, shown.height, settings);

        assert.ok(Math.abs(page.mediaBox[0] - want.pageWidth) < 0.01 && Math.abs(page.mediaBox[1] - want.pageHeight) < 0.01, `turn ${turn}: page size`);

        const [a, b, c, d, e, f] = page.placement.matrix;
        const at = (u, v) => [a * u + c * v + e, b * u + d * v + f]; // image corner (u, v), v up

        const L = want.x;
        const B = want.y;
        const R = want.x + want.width;
        const T = want.y + want.height;

        /* original top-left, top-right and bottom-left corners after a clockwise turn */
        const expected = [
            { TL: [L, T], TR: [R, T], BL: [L, B] },
            { TL: [R, T], TR: [R, B], BL: [L, T] },
            { TL: [R, B], TR: [L, B], BL: [R, T] },
            { TL: [L, B], TR: [L, T], BL: [R, B] }
        ][turn];

        for (const [name, [u, v]] of Object.entries({ TL: [0, 1], TR: [1, 1], BL: [0, 0] })) {
            const got = at(u, v);
            assert.ok(Math.abs(got[0] - expected[name][0]) < 0.01 && Math.abs(got[1] - expected[name][1]) < 0.01, `turn ${turn}: ${name} is at ${got.map((n) => n.toFixed(2))}, wanted ${expected[name].map((n) => n.toFixed(2))}`);
        }

    }

});

test("a turned landscape photo on A4 'auto' gets a portrait page, and Fit uses the turned shape", async () => {

    const source = stripJpegMetadata(read("meta-keep.jpg")).bytes;
    const auto = parsePdf((await buildPdf({ ...one(source, 0), settings: { pageSize: "a4", orientation: "auto" }, pdfLib, yieldBetween: false })).bytes).pages[0].mediaBox;
    const turned = parsePdf((await buildPdf({ ...one(source, 1), settings: { pageSize: "a4", orientation: "auto" }, pdfLib, yieldBetween: false })).bytes).pages[0].mediaBox;

    assert.ok(auto[0] > auto[1], "unturned landscape: landscape page");
    assert.ok(turned[0] < turned[1], "turned: portrait page");

    const fit = parsePdf((await buildPdf({ ...one(source, 1), settings: { pageSize: "image", margin: "none" }, pdfLib, yieldBetween: false })).bytes).pages[0].mediaBox;

    assert.ok(Math.abs(fit[0] / fit[1] - 240 / 320) < 0.001, "Fit page has the turned 3:4 shape");

});

test("page order and each photo's own turn are kept in a three-photo PDF", async () => {

    const a = stripJpegMetadata(read("meta-keep.jpg")).bytes;
    const turns = [0, 1, 3];
    const result = await buildPdf({ count: 3, getImage: async (i) => ({ bytes: a, turn: turns[i] }), settings: { pageSize: "image", margin: "none" }, pdfLib, yieldBetween: false });
    const pages = parsePdf(result.bytes).pages;

    assert.equal(pages.length, 3);
    assert.deepEqual(pages.map((p) => p.mediaBox[0] > p.mediaBox[1]), [true, false, false], "page 2 and 3 are portrait; page 1 is not turned");

});

test("INDEPENDENT: the page painted from the PDF's own matrix shows the photo turned the right way (Pillow oracle)", needPython, async () => {

    const source = stripJpegMetadata(read("meta-keep.jpg")).bytes;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pp-turn-"));

    try {

        for (const turn of [0, 1, 2, 3]) {

            const file = path.join(dir, `turn-${turn}.pdf`);

            fs.writeFileSync(file, (await buildPdf({ ...one(source, turn), settings: { pageSize: "a4", margin: "small" }, pdfLib, yieldBetween: false })).bytes);

            const run = spawnSync(python, [path.join(FIX, "photos-to-pdf-turn-check.py"), file, String(turn)], { encoding: "utf8" });

            assert.equal(run.status, 0, `turn ${turn}: ${run.stderr || run.stdout}`);

        }

    } finally {

        fs.rmSync(dir, { recursive: true, force: true });

    }

});
