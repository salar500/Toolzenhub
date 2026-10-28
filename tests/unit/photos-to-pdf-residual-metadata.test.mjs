/**
 * Photos to PDF: what is LEFT in a JPEG after the metadata strip, and in the PDF around it (Stage 3 audit).
 *
 * A synthetic JPEG (tests/fixtures/images/meta-keep.jpg, made with Pillow) is given one invented marker in
 * every place a JPEG can hide details: a comment, vendor APP segments, a second Exif-style APP segment, the
 * JFXX thumbnail extension, a JFIF thumbnail, a multi-picture (MPF) segment, and extra bytes after the end of the
 * image (where phones append a motion-photo video or a second picture). Each is found in the PDF BY READING THE
 * FILE'S BYTES, not by asking the code that wrote it. The picture data and the colour profile must survive
 * unchanged and Pillow must decode the same pixels.
 *
 *   node --test tests/unit/photos-to-pdf-residual-metadata.test.mjs
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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const source = new Uint8Array(fs.readFileSync(path.join(HERE, "..", "fixtures", "images", "meta-keep.jpg")));
const latin = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString("latin1");
const has = (bytes, text) => latin(bytes).includes(text);

const python = spawnSync("python", ["-c", "import PIL"], { encoding: "utf8" }).status === 0 ? "python" : null;
const needPython = python ? {} : { skip: "Python with Pillow is not installed" };

const text = (s) => [...Buffer.from(s, "latin1")];
const segment = (marker, body) => [0xff, marker, ((body.length + 2) >> 8) & 0xff, (body.length + 2) & 0xff, ...body];

/* the end of the picture data: the first FFD9 after the scan starts (the fixture has one scan) */
function endOfImage(bytes) {
    let i = 2;
    while (bytes[i] === 0xff && bytes[i + 1] !== 0xda) i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
    i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
    for (; i + 1 < bytes.length; i++) if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) return i + 2;
    throw new Error("no EOI");
}

const TAGS = {
    comment: "ZZ-COMMENT-MARKER",
    app3: "ZZ-APP3-MARKER",
    app12: "ZZ-APP12-MARKER",
    app15: "ZZ-APP15-MARKER",
    jfxx: "ZZ-JFXX-MARKER",
    mpf: "ZZ-MPF-MARKER",
    trailer: "ZZ-TRAILER-MARKER"
};

/* the fixture with a marker in each hiding place, and a JFIF thumbnail marker */
function loaded() {
    const eoi = endOfImage(source);
    const head = [...source.subarray(0, 2)];
    const rest = [...source.subarray(2, eoi)];
    const extra = [
        ...segment(0xfe, text(TAGS.comment)),
        ...segment(0xe3, text("Meta\0" + TAGS.app3)),
        ...segment(0xec, text("Ducky\0" + TAGS.app12)),
        ...segment(0xef, text("Vendor\0" + TAGS.app15)),
        ...segment(0xe0, text("JFXX\0\x10" + TAGS.jfxx)),
        ...segment(0xe2, text("MPF\0" + TAGS.mpf))
    ];
    const trailer = [0xff, 0xd8, ...text(TAGS.trailer), 0xff, 0xd9];
    return new Uint8Array([...head, ...extra, ...rest, ...trailer]);
}

const pdfLib = await loadPdfLib();

test("the audit fixture really carries every marker (so a pass below means something)", () => {
    const bytes = loaded();
    for (const tag of Object.values(TAGS)) assert.ok(has(bytes, tag), tag);
});

test("RESIDUALS: comments, vendor APP segments, JFXX, MPF and bytes after the end of the image are removed", () => {
    const result = stripJpegMetadata(loaded());
    assert.ok(result, "the file is readable");
    for (const [name, tag] of Object.entries(TAGS)) assert.equal(has(result.bytes, tag), false, `${name} (${tag}) must not survive`);
});

test("the picture, its colour profile and its JFIF header are untouched; the file still ends with the end marker", () => {
    const original = loaded();
    const result = stripJpegMetadata(original);
    const scanStart = (b) => { let i = 2; while (b[i] === 0xff && b[i + 1] !== 0xda) i += 2 + ((b[i + 2] << 8) | b[i + 3]); return i; };
    const a = original.subarray(scanStart(original), endOfImage(original));
    const b = result.bytes.subarray(scanStart(result.bytes));
    assert.deepEqual([...b], [...a], "scan data byte for byte");
    assert.deepEqual([...result.bytes.subarray(-2)], [0xff, 0xd9]);
    assert.ok(latin(result.bytes).includes("ICC_PROFILE"), "the colour profile stays");
    assert.ok(latin(result.bytes).includes("JFIF"), "the JFIF header stays");
});

test("Pillow decodes the cleaned file to the same pixels as the original photo", needPython, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tzh-meta-"));
    fs.writeFileSync(path.join(dir, "clean.jpg"), stripJpegMetadata(loaded()).bytes);
    const code = [
        "import sys, hashlib",
        "from PIL import Image",
        "a = Image.open(sys.argv[1]); a.load(); b = Image.open(sys.argv[2]); b.load()",
        "print(a.size == b.size and hashlib.sha256(a.tobytes()).hexdigest() == hashlib.sha256(b.tobytes()).hexdigest())"
    ].join("\n");
    const run = spawnSync(python, ["-c", code, path.join(dir, "clean.jpg"), path.join(HERE, "..", "fixtures", "images", "meta-keep.jpg")], { encoding: "utf8" });
    assert.equal(run.stdout.trim(), "True", run.stderr);
});

test("PDF: none of the markers, and no file name, author, producer, creator or date, is in the finished PDF", async () => {
    const stripped = stripJpegMetadata(loaded()).bytes;
    const result = await buildPdf({ count: 1, getImage: async () => ({ bytes: stripped, turn: 0 }), settings: {}, pdfLib, yieldBetween: false });
    const bytes = result.bytes;
    for (const tag of Object.values(TAGS)) assert.equal(has(bytes, tag), false, tag);
    for (const key of ["/Author", "/Producer", "/Creator", "/CreationDate", "/ModDate", "/Title", "/Subject", "/Keywords", "/Metadata"]) assert.equal(has(bytes, key), false, `PDF info entry ${key}`);
    assert.equal(has(bytes, "meta-keep"), false, "the source file name");
});

test("every JPEG fixture (baseline, progressive, CMYK, EXIF-turned) strips to a file Pillow decodes to the same pixels", needPython, () => {
    const dir = path.join(HERE, "..", "fixtures", "images");
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "tzh-meta-all-"));
    const names = fs.readdirSync(dir).filter((n) => /\.jpe?g$/i.test(n));
    assert.ok(names.length >= 4, "several JPEG fixtures exist");
    for (const name of names) {
        const original = new Uint8Array(fs.readFileSync(path.join(dir, name)));
        const result = stripJpegMetadata(original);
        if (result === null) continue; // an unreadable fixture is refused, never half-cleaned
        fs.writeFileSync(path.join(out, name), result.bytes);
        const code = "import sys, hashlib\nfrom PIL import Image\na = Image.open(sys.argv[1]); a.load(); b = Image.open(sys.argv[2]); b.load()\nprint(a.size == b.size and a.mode == b.mode and hashlib.sha256(a.tobytes()).hexdigest() == hashlib.sha256(b.tobytes()).hexdigest())";
        const run = spawnSync(python, ["-c", code, path.join(out, name), path.join(dir, name)], { encoding: "utf8" });
        assert.equal(run.stdout.trim(), "True", `${name}: ${run.stderr}`);
        assert.deepEqual([...result.bytes.subarray(-2)], [0xff, 0xd9], `${name} ends with the end marker`);
    }
});

test("a multi-scan progressive JPEG (made by Pillow) with a trailer keeps all its scans and loses the trailer", needPython, () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "tzh-meta-prog-"));
    const file = path.join(out, "prog.jpg");
    const make = "import sys, random\nfrom PIL import Image\nrandom.seed(7)\nim = Image.new('RGB', (160, 120))\nim.putdata([(random.randrange(256), random.randrange(256), random.randrange(256)) for _ in range(160 * 120)])\nim.save(sys.argv[1], progressive=True, quality=90)";
    assert.equal(spawnSync(python, ["-c", make, file], { encoding: "utf8" }).status, 0);
    const original = new Uint8Array(fs.readFileSync(file));
    const scans = (b) => b.reduce((n, v, i) => n + (v === 0xff && b[i + 1] === 0xda ? 1 : 0), 0);
    assert.ok(scans(original) > 1, "the file really has several scans");
    const withTrailer = new Uint8Array([...original, ...text("ZZ-TRAILER-MARKER")]);
    const result = stripJpegMetadata(withTrailer);
    assert.ok(result);
    assert.equal(has(result.bytes, "ZZ-TRAILER-MARKER"), false);
    assert.deepEqual([...result.bytes], [...original], "exactly the original file comes back");
});
