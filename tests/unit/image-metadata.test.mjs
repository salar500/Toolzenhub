/**
 * Photo Metadata Viewer and Remover (Tool Pack 57), the engine. The fixtures are synthetic and made with Pillow
 * (tests/fixtures/images/make-image-metadata-fixtures.py); md-expected.json is what Pillow reads from them, an
 * independent oracle for the reader. Removal is checked by reading the output again and by searching its bytes for
 * the invented marker strings.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { sniff, inspect, clean, readExif, orientationBlock, LIMITS } = await import("../../assets/js/tools/image-metadata/metadata-engine.js");

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "images");
const read = (name) => new Uint8Array(fs.readFileSync(path.join(DIR, name)));
const expected = JSON.parse(fs.readFileSync(path.join(DIR, "md-expected.json"), "utf8"));
const contains = (bytes, s) => Buffer.from(bytes).includes(Buffer.from(s, "latin1"));

test("the reader agrees with Pillow on every field it shows", () => {
  for (const name of ["md-gps-rot6.jpg", "md-text.png", "md-plain.png"]) {
    const e = expected[name];
    const info = inspect(read(name));
    const x = info.exif ?? {};
    assert.equal(x.make ?? null, e.make, `${name} make`);
    assert.equal(x.model ?? null, e.model, `${name} model`);
    assert.equal(x.software ?? null, e.software, `${name} software`);
    assert.equal(x.dateTime ?? null, e.dateTime, `${name} date`);
    assert.equal(x.dateTaken ?? null, e.dateTaken, `${name} date taken`);
    assert.equal(info.orientation ?? null, e.orientation, `${name} orientation`);
    if (e.gps) {
      assert.ok(Math.abs(x.gps.latitude - e.gps.latitude) < 1e-5, `${name} latitude`);
      assert.ok(Math.abs(x.gps.longitude - e.gps.longitude) < 1e-5, `${name} longitude`);
      assert.equal(x.gps.altitude, e.gps.altitude, `${name} altitude`);
    } else {
      assert.equal(x.gps ?? null, null, `${name} has no location`);
    }
    const words = Object.fromEntries((info.text ?? []).map((t) => [t.keyword, t.value]));
    assert.deepEqual(words, e.text, `${name} text`);
  }
});

test("the JPEG's other blocks are found: XMP, the comment, and what is kept", () => {
  const info = inspect(read("md-gps-rot6.jpg"));
  const labels = info.blocks.map((b) => b.label);
  assert.ok(labels.some((l) => l.startsWith("XMP")));
  assert.ok(labels.includes("Comment"));
  const keep = inspect(read("meta-keep.jpg"));
  assert.ok(keep.blocks.some((b) => b.label === "IPTC (caption, credit, place)" && !b.kept));
  assert.ok(keep.blocks.some((b) => b.label === "Colour profile (ICC)" && b.kept));
});

test("JPEG: removal drops every identifying block, keeps the picture and the colour profile, and puts the orientation back", () => {
  const original = read("md-gps-rot6.jpg");
  const r = clean(original);
  assert.equal(r.ok, true);
  assert.equal(r.orientationKept, true);
  for (const marker of ["ZZ-MAKE", "ZZ-MODEL-42", "ZZ-EDITOR", "2031:02:03", "ZZ-COMMENT", "ZZ-XMP-OWNER"]) assert.equal(contains(r.bytes, marker), false, marker);
  const after = inspect(r.bytes);
  assert.equal(after.orientation, 6);
  assert.equal(after.exif.gps, null);
  assert.equal(after.exif.make, null);
  // the picture data from the start of scan to the end is byte for byte the original's
  const sos = (b) => Buffer.from(b).indexOf(Buffer.from([0xff, 0xda]));
  assert.deepEqual(Buffer.from(r.bytes.subarray(sos(r.bytes))), Buffer.from(original.subarray(sos(original))));
  // without the option, no Exif at all remains
  const plain = clean(original, { keepOrientation: false });
  assert.equal(plain.ok, true);
  assert.equal(inspect(plain.bytes).exif, null);
  // the colour profile is kept
  const keep = clean(read("meta-keep.jpg"));
  assert.ok(keep.kept.includes("Colour profile (ICC)"));
  assert.ok(contains(keep.bytes, "ICC_PROFILE"));
  assert.equal(contains(keep.bytes, "ZZ-IPTC-MARKER"), false);
});

test("the orientation block is a valid, minimal Exif that identifies nothing", () => {
  const block = orientationBlock(6);
  assert.equal(block.length, 36);
  assert.equal((block[2] << 8) | block[3], 34);
  const exif = readExif(block, 10, block.length);
  assert.equal(exif.orientation, 6);
  assert.equal(exif.make, null);
  assert.equal(exif.gps, null);
  assert.throws(() => orientationBlock(1), RangeError);
  assert.throws(() => orientationBlock(9), RangeError);
});

test("PNG: text, eXIf and tIME go; the image chunks are copied with their CRCs; a clean PNG is unchanged", () => {
  const r = clean(read("md-text.png"));
  assert.equal(r.ok, true);
  for (const marker of ["ZZ-AUTHOR", "ZZ-DESCRIPTION", "ZZ-MAKE", "tIME", "eXIf", "tEXt", "iTXt"]) assert.equal(contains(r.bytes, marker), false, marker);
  const after = inspect(r.bytes);
  assert.equal(after.exif, null);
  assert.deepEqual(after.text, []);
  assert.ok(contains(r.bytes, "IHDR") && contains(r.bytes, "IDAT") && contains(r.bytes, "IEND"));
  const plain = clean(read("md-plain.png"));
  assert.equal(plain.ok, true);
  assert.equal(plain.unchanged, true);
  assert.deepEqual(Buffer.from(plain.bytes), Buffer.from(read("md-plain.png")));
});

test("files the tool does not handle are refused by their bytes, not their names", () => {
  assert.equal(sniff(read("photo.webp")), "webp");
  assert.equal(sniff(read("png-named-jpg.jpg")), "png");
  assert.equal(sniff(read("heic-stub.heic")), "heic");
  assert.equal(sniff(read("not-an-image.jpg")), null);
  assert.deepEqual(clean(read("photo.webp")), { ok: false, reason: "unsupported" });
  assert.deepEqual(clean(read("not-an-image.jpg")), { ok: false, reason: "unsupported" });
  assert.deepEqual(clean(read("truncated.jpg")), { ok: false, reason: "unreadable" });
  assert.equal(clean(read("empty.jpg")).ok, false);
  assert.equal(clean(read("png-named-jpg.jpg")).ok, true);
  assert.equal(LIMITS.files, 20);
});

test("a hostile Exif block (offsets outside it) is unreadable, never an error", () => {
  const bad = Uint8Array.from([0x4d, 0x4d, 0x00, 0x2a, 0xff, 0xff, 0xff, 0xf0]);
  assert.equal(readExif(bad), null);
  const loop = Uint8Array.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0xff, 0xff]);
  assert.equal(readExif(loop), null);
});
