/**
 * Photos to PDF (Tool Pack 31): the rules and the PDF it writes.
 *
 * The pictures are synthetic (tests/fixtures/photos-to-pdf-fixtures.json, made by Pillow, an
 * implementation independent of the tool). The PDF is checked by reading the FILE: with
 * tests/helpers/pdf-structure.mjs (a strict reader that knows nothing about pdf-lib) and, when
 * Python is installed, with tests/fixtures/photos-to-pdf-check.py. A PDF that merely exists proves
 * nothing, so these tests check page count, page order, page size, the placement and that the
 * original JPEG bytes are inside unchanged.
 *
 *   node --test tests/unit/photos-to-pdf.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
    MAX_IMAGES,
    MAX_TOTAL_BYTES,
    MAX_FILE_BYTES,
    PAGE_SIZES,
    MARGINS,
    cleanSettings,
    computeLayout,
    jpegInfo,
    embedStrategy,
    redrawSize,
    checkHeader,
    planAdditions,
    moveItem,
    summariseRejections,
    describeResult,
    REDRAW_MAX_PIXELS
} from "../../assets/js/tools/photos-to-pdf/pdf-rules.js";

import { buildPdf, loadPdfLib } from "../../assets/js/tools/photos-to-pdf/pdf-build.js";
import { parsePdf } from "../helpers/pdf-structure.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");

const fixtures = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "photos-to-pdf-fixtures.json"), "utf8")).items;
const bytesOf = (name) => new Uint8Array(Buffer.from(fixtures.find((f) => f.name === name).base64, "base64"));
const fx = (name) => fixtures.find((f) => f.name === name);

const pdfLib = await loadPdfLib();

const sources = (name) => ({ count: name.length, getImage: async (i) => ({ bytes: bytesOf(name[i]) }) });
const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} is not within ${eps} of ${b}`);


/* =========================================================
   Reading a JPEG
========================================================= */

test("jpegInfo reads size, colour channels and the EXIF turn of every fixture, and embedStrategy follows", () => {

    for (const f of fixtures.filter((x) => x.format === "jpeg" && x.width)) {

        const info = jpegInfo(bytesOf(f.name));

        assert.equal(info.width, f.width, f.name);
        assert.equal(info.height, f.height, f.name);
        assert.equal(info.components, f.components, f.name);
        assert.equal(info.orientation, f.orientation, f.name);
        assert.equal(embedStrategy("jpeg", info), f.strategy, f.name);

    }

});

test("a progressive JPEG is kept; a CMYK JPEG and a JPEG turned by EXIF are redrawn", () => {

    assert.equal(jpegInfo(bytesOf("rgb-progressive")).sof, 0xc2);
    assert.equal(embedStrategy("jpeg", jpegInfo(bytesOf("rgb-progressive"))), "keep");
    assert.equal(embedStrategy("jpeg", jpegInfo(bytesOf("cmyk"))), "redraw");
    assert.equal(jpegInfo(bytesOf("exif-turn-6")).orientation, 6);
    assert.equal(embedStrategy("jpeg", jpegInfo(bytesOf("exif-turn-6"))), "redraw");
    assert.equal(embedStrategy("jpeg", jpegInfo(bytesOf("exif-turn-1"))), "keep");

});

test("non-JPEG formats are always redrawn; broken input never throws", () => {

    assert.equal(embedStrategy("png", null), "redraw");
    assert.equal(embedStrategy("webp", null), "redraw");
    assert.equal(embedStrategy("jpeg", null), "redraw");
    assert.equal(jpegInfo(bytesOf("truncated-jpeg")), null);
    assert.equal(jpegInfo(bytesOf("not-an-image")), null);
    assert.equal(jpegInfo(new Uint8Array(0)), null);
    assert.equal(jpegInfo(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff])), null);

});

test("an Adobe RGB-marked 3-channel JPEG is redrawn; an Adobe YCbCr one is kept", () => {

    const base = { precision: 8, sof: 0xc0, components: 3, orientation: 1 };

    assert.equal(embedStrategy("jpeg", { ...base, adobeTransform: 0 }), "redraw");
    assert.equal(embedStrategy("jpeg", { ...base, adobeTransform: 1 }), "keep");
    assert.equal(embedStrategy("jpeg", { ...base, adobeTransform: null }), "keep");
    assert.equal(embedStrategy("jpeg", { ...base, precision: 12 }), "redraw");
    assert.equal(embedStrategy("jpeg", { ...base, sof: 0xc3 }), "redraw");

});

test("redrawSize keeps a size within the limit and shrinks a larger one in proportion", () => {

    assert.deepEqual(redrawSize(4000, 3000), { width: 4000, height: 3000, reduced: false });

    const big = redrawSize(10000, 8000);

    assert.equal(big.reduced, true);
    assert.ok(big.width * big.height <= REDRAW_MAX_PIXELS);
    near(big.width / big.height, 10000 / 8000, 0.01);

});


/* =========================================================
   Files
========================================================= */

test("checkHeader accepts JPEG, PNG and WebP by content and refuses the rest with a reason", () => {

    for (const name of ["rgb-baseline", "png-rgba", "webp", "cmyk"]) {
        assert.equal(checkHeader(bytesOf(name)).ok, true, name);
    }

    const png = checkHeader(bytesOf("png-rgba"));

    assert.deepEqual([png.format, png.width, png.height], ["png", 52, 30]);

    for (const name of ["gif", "not-an-image", "truncated-jpeg"]) {

        const verdict = checkHeader(bytesOf(name));

        assert.equal(verdict.ok, false, name);
        assert.ok(verdict.message.length > 10, name);

    }

    assert.match(checkHeader(bytesOf("gif")).message, /GIF/);

});

test("checkHeader refuses a picture that is too large before anything is decoded", () => {

    const png = new Uint8Array(33);

    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 0);
    new DataView(png.buffer).setUint32(16, 20000);
    new DataView(png.buffer).setUint32(20, 100);

    const verdict = checkHeader(png);

    assert.equal(verdict.ok, false);
    assert.match(verdict.message, /limit/);

});

test("planAdditions applies the count, per-file and total limits in order and names each refusal", () => {

    const file = (name, size) => ({ name, size });

    const ok = planAdditions([], [file("a.jpg", 1000), file("b.jpg", 2000)]);

    assert.deepEqual(ok.accepted, [0, 1]);
    assert.deepEqual(ok.rejected, []);

    const empty = planAdditions([], [file("e.jpg", 0), file("huge.jpg", MAX_FILE_BYTES + 1), file("fine.jpg", 5)]);

    assert.deepEqual(empty.accepted, [2]);
    assert.deepEqual(empty.rejected.map((r) => r.name), ["e.jpg", "huge.jpg"]);

    const listed = new Array(MAX_IMAGES - 1).fill(10);
    const full = planAdditions(listed, [file("one.jpg", 10), file("two.jpg", 10)]);

    assert.deepEqual(full.accepted, [0]);
    assert.match(full.rejected[0].message, new RegExp(`${MAX_IMAGES} photos`));

    const heavy = planAdditions([MAX_TOTAL_BYTES - 100], [file("x.jpg", 101), file("y.jpg", 100)]);

    assert.deepEqual(heavy.accepted, [1]);
    assert.match(heavy.rejected[0].message, /together/);

});

test("moveItem moves by one place, clamps at the ends and never changes the original", () => {

    const list = ["a", "b", "c"];

    assert.deepEqual(moveItem(list, 1, -1), ["b", "a", "c"]);
    assert.deepEqual(moveItem(list, 1, 1), ["a", "c", "b"]);
    assert.deepEqual(moveItem(list, 0, -1), ["a", "b", "c"]);
    assert.deepEqual(moveItem(list, 2, 1), ["a", "b", "c"]);
    assert.deepEqual(moveItem(list, 5, 1), ["a", "b", "c"]);
    assert.deepEqual(list, ["a", "b", "c"]);

});

test("summariseRejections caps the lines and describeResult words the outcome", () => {

    const many = Array.from({ length: 8 }, (_, n) => ({ name: `f${n}.jpg`, message: "No." }));
    const lines = summariseRejections(many);

    assert.equal(lines.length, 6);
    assert.match(lines[5], /3 more/);
    assert.match(describeResult({ pages: 1, bytes: 2048, redrawn: 0, reduced: 0 }), /^1 page, 2\.0 KB\.$/);
    assert.match(describeResult({ pages: 3, bytes: 2048, redrawn: 2, reduced: 1 }), /2 photos were saved again.*1 photo was reduced/);

});


/* =========================================================
   Page layout
========================================================= */

test("settings fall back to the defaults for anything unknown", () => {

    assert.deepEqual(cleanSettings({}), { pageSize: "a4", orientation: "auto", margin: "small" });
    assert.deepEqual(cleanSettings({ pageSize: "tabloid", orientation: "sideways", margin: "huge" }), { pageSize: "a4", orientation: "auto", margin: "small" });
    assert.deepEqual(cleanSettings({ pageSize: "letter", orientation: "landscape", margin: "none" }), { pageSize: "letter", orientation: "landscape", margin: "none" });

});

test("computeLayout: Letter portrait, hand-calculated (100 x 200 picture, no margin)", () => {

    const layout = computeLayout(100, 200, { pageSize: "letter", orientation: "portrait", margin: "none" });

    assert.deepEqual(layout, { pageWidth: 612, pageHeight: 792, x: 108, y: 0, width: 396, height: 792 });

});

test("computeLayout: Automatic follows each picture; Portrait and Landscape override it", () => {

    const wide = computeLayout(300, 100, { pageSize: "a4", orientation: "auto", margin: "none" });
    const tall = computeLayout(100, 300, { pageSize: "a4", orientation: "auto", margin: "none" });

    assert.ok(wide.pageWidth > wide.pageHeight);
    assert.ok(tall.pageWidth < tall.pageHeight);
    near(wide.pageWidth, 841.89);
    near(tall.pageWidth, 595.28);

    assert.ok(computeLayout(300, 100, { pageSize: "a4", orientation: "portrait", margin: "none" }).pageWidth < 600);
    assert.ok(computeLayout(100, 300, { pageSize: "a4", orientation: "landscape", margin: "none" }).pageWidth > 800);

});

test("computeLayout: the picture is centred, inside the margins, never cropped or stretched", () => {

    for (const pageSize of ["a4", "letter", "image"]) {
        for (const margin of Object.keys(MARGINS)) {
            for (const [w, h] of [[64, 40], [48, 72], [56, 56], [4000, 3000], [3, 900]]) {

                const l = computeLayout(w, h, { pageSize, orientation: "auto", margin });
                const m = MARGINS[margin].points;

                near(l.width / l.height, w / h, 1e-6);
                assert.ok(l.x >= m - 1e-6 && l.y >= m - 1e-6, `${pageSize}/${margin}/${w}x${h}`);
                assert.ok(l.x + l.width <= l.pageWidth - m + 1e-6 && l.y + l.height <= l.pageHeight - m + 1e-6, `${pageSize}/${margin}/${w}x${h}`);
                near(l.x - m, l.pageWidth - m - (l.x + l.width), 1e-6);
                near(l.y - m, l.pageHeight - m - (l.y + l.height), 1e-6);

            }
        }
    }

});

test("computeLayout: 'same shape as each image' makes every page the image's shape", () => {

    const l = computeLayout(4000, 3000, { pageSize: "image", orientation: "portrait", margin: "small" });

    near(l.width, 841.89);
    near(l.height, 631.42, 0.01);
    near(l.pageWidth, 841.89 + 36);
    near(l.pageHeight, 631.42 + 36, 0.01);
    assert.equal(l.x, 18);
    assert.equal(l.y, 18);
    assert.throws(() => computeLayout(0, 10, {}), RangeError);

});


/* =========================================================
   The PDF, read back from its bytes
========================================================= */

test("a PDF of three pictures has three pages, in list order, with the original JPEG bytes inside", async () => {

    const order = ["rgb-baseline", "rgb-progressive", "gray-baseline"];
    const result = await buildPdf({ ...sources(order), settings: {}, pdfLib });

    assert.equal(result.pages, 3);
    assert.equal(result.redrawn, 0);

    const pdf = parsePdf(result.bytes);

    assert.equal(pdf.pages.length, 3);
    assert.deepEqual(pdf.pages.map((p) => p.image.width), order.map((n) => fx(n).width));
    assert.deepEqual(pdf.pages.map((p) => p.image.sha256), order.map((n) => fx(n).sha256), "the embedded bytes are the original JPEGs");
    assert.ok(pdf.pages.every((p) => p.image.filter === "DCTDecode"));

});

test("reordering the list reorders the pages and nothing else", async () => {

    const first = ["rgb-baseline", "rgb-progressive", "gray-baseline"];
    const second = moveItem(moveItem(first, 2, -1), 0, 1);

    assert.deepEqual(second, ["rgb-progressive", "rgb-baseline", "gray-baseline"].map((n, i) => second[i]));

    const pdf = parsePdf((await buildPdf({ ...sources(second), settings: {}, pdfLib })).bytes);

    assert.deepEqual(pdf.pages.map((p) => p.image.width), second.map((n) => fx(n).width));
    assert.notDeepEqual(second, first);

});

test("page size, orientation and margin reach the file: MediaBox and the placement matrix", async () => {

    const names = ["rgb-baseline", "rgb-progressive", "gray-baseline"];
    const cases = [
        { pageSize: "a4", orientation: "auto", margin: "small" },
        { pageSize: "letter", orientation: "portrait", margin: "none" },
        { pageSize: "a4", orientation: "landscape", margin: "medium" },
        { pageSize: "image", orientation: "auto", margin: "small" }
    ];

    for (const settings of cases) {

        const pdf = parsePdf((await buildPdf({ ...sources(names), settings, pdfLib })).bytes);

        pdf.pages.forEach((page, i) => {

            const want = computeLayout(fx(names[i]).width, fx(names[i]).height, settings);

            near(page.mediaBox[0], want.pageWidth, 0.01);
            near(page.mediaBox[1], want.pageHeight, 0.01);
            near(page.placement.width, want.width, 0.01);
            near(page.placement.height, want.height, 0.01);
            near(page.placement.x, want.x, 0.01);
            near(page.placement.y, want.y, 0.01);

        });

    }

    const a4 = parsePdf((await buildPdf({ ...sources(names), settings: { pageSize: "a4", orientation: "auto", margin: "small" }, pdfLib })).bytes);

    assert.deepEqual(a4.pages.map((p) => p.mediaBox[0] > p.mediaBox[1]), [true, false, false], "64x40 lands on a landscape page, 48x72 and 56x56 on portrait ones");
    near(PAGE_SIZES.a4.width, 595.28);

});

test("the file carries no creator, producer or date, and does not mention the library", async () => {

    const pdf = parsePdf((await buildPdf({ ...sources(["rgb-baseline"]), settings: {}, pdfLib })).bytes);

    assert.equal(pdf.hasProducer, false);
    assert.equal(pdf.hasCreationDate, false);
    assert.equal(pdf.mentionsLibrary, false);

});

test("progress is reported after each picture and the page asks for one picture at a time", async () => {

    const names = ["rgb-baseline", "rgb-progressive", "gray-baseline", "rgb-baseline"];
    const progress = [];
    let inFlight = 0;
    let overlap = false;

    await buildPdf({
        count: names.length,
        getImage: async (i) => {
            inFlight += 1;
            if (inFlight > 1) overlap = true;
            await new Promise((resolve) => setTimeout(resolve, 1));
            inFlight -= 1;
            return { bytes: bytesOf(names[i]) };
        },
        settings: {},
        pdfLib,
        onProgress: (done, count) => progress.push([done, count])
    });

    assert.deepEqual(progress, [[1, 4], [2, 4], [3, 4], [4, 4]]);
    assert.equal(overlap, false);

});

test("cancelling stops before the next picture is requested and returns no file", async () => {

    const asked = [];
    let cancelled = false;

    const result = await buildPdf({
        count: 6,
        getImage: async (i) => {
            asked.push(i);
            if (i === 1) cancelled = true;
            return { bytes: bytesOf("rgb-baseline") };
        },
        settings: {},
        pdfLib,
        isCancelled: () => cancelled
    });

    assert.deepEqual(result, { cancelled: true });
    assert.deepEqual(asked, [0, 1], "nothing after the cancelled picture was read");

    const before = await buildPdf({ count: 3, getImage: async () => assert.fail("must not read"), settings: {}, pdfLib, isCancelled: () => true });

    assert.deepEqual(before, { cancelled: true });

});

test("a picture that cannot be embedded fails the build loudly instead of giving a partial PDF", async () => {

    await assert.rejects(buildPdf({ count: 2, getImage: async (i) => ({ bytes: i === 0 ? bytesOf("rgb-baseline") : bytesOf("not-an-image") }), settings: {}, pdfLib }));
    await assert.rejects(buildPdf({ count: 1, getImage: async () => { throw new Error("could not decode"); }, settings: {}, pdfLib }), /could not decode/);

});

test("30 pictures of about 1 MB each give 30 pages and a file about the size of the pictures", async () => {

    const base = bytesOf("rgb-baseline");
    const picture = (n) => {
        const padded = new Uint8Array(1024 * 1024);
        padded.set(base);
        padded[padded.length - 1] = n;
        return padded;
    };

    const result = await buildPdf({ count: 30, getImage: async (i) => ({ bytes: picture(i) }), settings: {}, pdfLib, yieldBetween: false });
    const pdf = parsePdf(result.bytes);

    assert.equal(pdf.pages.length, 30);
    assert.ok(result.bytes.length < 30 * 1024 * 1024 + 100 * 1024, `file is ${result.bytes.length} bytes`);
    assert.ok(result.bytes.length > 30 * 1024 * 1024);

});

test("a second, independent reader (Python, when installed) agrees with the first", async (t) => {

    const python = spawnSync("python", ["--version"], { encoding: "utf8" });

    if (python.error || python.status !== 0) {
        t.skip("python is not installed here; the JavaScript reader above still ran");
        return;
    }

    const order = ["gray-baseline", "rgb-baseline", "rgb-progressive", "exif-turn-1"];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tz-ptp-"));

    try {

        const file = path.join(dir, "out.pdf");
        const expected = path.join(dir, "expected.json");

        fs.writeFileSync(file, (await buildPdf({ ...sources(order), settings: {}, pdfLib })).bytes);
        fs.writeFileSync(expected, JSON.stringify({ images: order.map((n) => ({ width: fx(n).width, sha256: fx(n).sha256 })) }));

        const run = spawnSync("python", [path.join(ROOT, "tests", "fixtures", "photos-to-pdf-check.py"), file, expected], { encoding: "utf8" });

        assert.equal(run.status, 0, run.stderr);
        assert.deepEqual(JSON.parse(run.stdout).pages, order.length);

    } finally {

        fs.rmSync(dir, { recursive: true, force: true });

    }

});


/* =========================================================
   The library and the privacy of the tool
========================================================= */

test("the vendored library is the unmodified upstream file named in its notice", () => {

    const dir = path.join(ROOT, "assets", "js", "vendor", "pdf-lib");
    const file = fs.readFileSync(path.join(dir, "pdf-lib.esm.min.js"));
    const notice = fs.readFileSync(path.join(dir, "NOTICE.txt"), "utf8");
    const hash = crypto.createHash("sha256").update(file).digest("hex");

    assert.ok(notice.includes(hash), "NOTICE.txt must state the SHA-256 of the vendored file");
    assert.match(notice, /pdf-lib 1\.17\.1/);
    assert.match(notice, /Hopding\/pdf-lib/);
    assert.ok(fs.existsSync(path.join(dir, "LICENSE.txt")));
    assert.match(fs.readFileSync(path.join(dir, "LICENSE.txt"), "utf8"), /MIT License/);

});

test("the tool's own code makes no network request, stores nothing and loads nothing from another site", () => {

    const dir = path.join(ROOT, "assets", "js", "tools", "photos-to-pdf");

    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".js"))) {

        const code = fs.readFileSync(path.join(dir, name), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

        assert.doesNotMatch(code, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|gtag|dataLayer/, name);
        assert.doesNotMatch(code, /https?:\/\//, name);

    }

});
