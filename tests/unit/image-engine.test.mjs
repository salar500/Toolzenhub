/**
 * Image Compressor & Resizer (Tool Pack 20): the pure engine and the pipeline's logic.
 *
 * No DOM and no browser. Header parsing is compared with what Pillow itself reads from the committed fixtures
 * (tests/fixtures/images/expected.json, made by make-fixtures.py), so it is checked against a reader that
 * shares no code with it. The pipeline is exercised with a fake environment: the pixel work is covered in the
 * browser tests.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MAX_FILE_BYTES, MAX_INPUT_PIXELS, MAX_INPUT_SIDE, MAX_OUTPUT_SIDE, MAX_OUTPUT_PIXELS, HEADER_BYTES, QUALITY_MIN, QUALITY_MAX, QUALITY_DEFAULT,
  QUALITY_PRESETS, TARGET_ATTEMPTS, MESSAGES, sniffFormat, refusalFor, readSize, inspectAlpha, checkFile, checkInputSize, checkOutputSize,
  fitToOutputLimits, heightFromWidth, widthFromHeight, parseDimension, RESIZE_PRESETS, presetSize, outputChoices, defaultOutput, usesQuality, clampQuality,
  parseTargetKB, searchQuality, formatBytes, formatDimensions, describeChange, safeBaseName, outputFileName, extensionFor, createOperationTracker,
} from "../../assets/js/tools/image-compressor-resizer/image-engine.js";
import { processImage, inspectImage, serializeError, PipelineError } from "../../assets/js/tools/image-compressor-resizer/image-pipeline.js";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "images");
const expected = JSON.parse(fs.readFileSync(path.join(DIR, "expected.json"), "utf8"));
const bytes = (name) => new Uint8Array(fs.readFileSync(path.join(DIR, name)));
const head = (name) => bytes(name).subarray(0, HEADER_BYTES);

describe("what a file is, by its bytes", () => {
  test("every fixture is recognised from its content, whatever it is called", () => {
    const want = {
      "photo.jpg": "jpeg", "lowq.jpg": "jpeg", "portrait-exif6.jpg": "jpeg", "exif-secret.jpg": "jpeg", "truncated.jpg": "jpeg",
      "logo-alpha.png": "png", "opaque-rgba.png": "png", "screenshot.png": "png", "png-named-jpg.jpg": "png",
      "photo.webp": "webp", "alpha.webp": "webp", "lossless.webp": "webp",
      "anim.gif": "gif", "heic-stub.heic": "heic", "avif-stub.avif": "avif", "icon.svg": "svg", "not-an-image.jpg": "unknown", "empty.jpg": "unknown",
    };
    for (const [name, format] of Object.entries(want)) assert.equal(sniffFormat(head(name)), format, name);
  });

  test("SVG is found past an XML declaration, a comment and a doctype; other text is not SVG", () => {
    const enc = (s) => new TextEncoder().encode(s);
    for (const s of ["<svg xmlns='x'></svg>", "  \n<svg ", '<?xml version="1.0"?><svg>', "<!-- c --><svg>", '<?xml version="1.0"?>\n<!-- hi -->\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x"><svg>', ]) {
      assert.equal(sniffFormat(enc(s)), "svg", s);
    }
    assert.equal(sniffFormat(new Uint8Array([0xef, 0xbb, 0xbf, ...enc("<svg>")])), "svg"); // a real byte order mark
    for (const s of ["<html><svg></svg></html>", "svg", "<svgx>", "<p>hello</p>"]) assert.equal(sniffFormat(enc(s)), "unknown", s);
  });

  test("every HEIC and AVIF brand is named; unrelated container brands are not", () => {
    const box = (brand) => new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, ...[...brand].map((c) => c.charCodeAt(0)), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    for (const b of ["heic", "heix", "hevc", "mif1", "heif"]) assert.equal(sniffFormat(box(b)), "heic", b);
    for (const b of ["avif", "avis"]) assert.equal(sniffFormat(box(b)), "avif", b);
    assert.equal(sniffFormat(box("isom")), "unknown"); // an MP4, not an image
  });

  test("a label, a name or a short file never confuses it", () => {
    assert.equal(sniffFormat(new Uint8Array([])), "unknown");
    assert.equal(sniffFormat(new Uint8Array([0xff, 0xd8])), "unknown");
    assert.equal(sniffFormat(new Uint8Array([0xff, 0xd8, 0xff])), "jpeg");
    assert.equal(sniffFormat(bytes("png-named-jpg.jpg")), "png"); // named .jpg, is a PNG
  });

  test("refused formats each get their own targeted message; supported ones none", () => {
    assert.equal(refusalFor("jpeg"), null);
    assert.equal(refusalFor("png"), null);
    assert.equal(refusalFor("webp"), null);
    assert.equal(refusalFor("heic"), "HEIC/HEIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first.");
    assert.equal(refusalFor("gif"), "GIF isn't supported because this tool does not preserve animation.");
    assert.match(refusalFor("avif"), /AVIF isn't supported/);
    assert.match(refusalFor("svg"), /SVG isn't supported/);
    assert.equal(refusalFor("unknown"), MESSAGES.undecodable);
  });
});

describe("size and transparency from the header, against Pillow", () => {
  test("the stored size of every real fixture equals what Pillow reads", () => {
    let checked = 0;
    for (const [name, want] of Object.entries(expected)) {
      const format = sniffFormat(head(name));
      assert.equal(format.toUpperCase(), want.format === "JPEG" ? "JPEG" : want.format, name);
      assert.deepEqual(readSize(head(name), format), { width: want.width, height: want.height }, name);
      checked++;
    }
    assert.ok(checked >= 10);
  });

  test("a truncated or unreadable file has no size; so does a stub", () => {
    assert.equal(readSize(head("not-an-image.jpg"), "unknown"), null);
    assert.equal(readSize(bytes("heic-stub.heic"), "heic"), null);
    assert.equal(readSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0]), "jpeg"), null);
    assert.equal(readSize(new Uint8Array(10), "png"), null);
  });

  test("transparency: 'none' only when the header proves it; anything with a possible alpha channel is 'possible'", () => {
    const f = (name) => inspectAlpha(head(name), sniffFormat(head(name)));
    for (const name of ["photo.jpg", "exif-secret.jpg", "screenshot.png", "photo.webp", "lossless.webp"]) assert.equal(f(name), "none", name);
    for (const name of ["logo-alpha.png", "opaque-rgba.png", "alpha.webp"]) assert.equal(f(name), "possible", name);
  });

  test("the safe direction: no fixture that really has a transparent pixel is ever called 'none'", () => {
    for (const [name, want] of Object.entries(expected)) {
      if (want.hasTransparentPixel) assert.notEqual(inspectAlpha(head(name), sniffFormat(head(name))), "none", name);
    }
  });

  test("an unknown or cut-off header is 'possible', never 'none'", () => {
    assert.equal(inspectAlpha(new Uint8Array(10), "png"), "possible");
    assert.equal(inspectAlpha(new Uint8Array(40), "webp"), "possible");
    // a palette PNG with a tRNS chunk before the data has transparency
    const png = Array.from(bytes("screenshot.png").subarray(0, 33));
    png[25] = 3; // palette
    const trns = [0, 0, 0, 1, 0x74, 0x52, 0x4e, 0x53, 0, 0, 0, 0, 0];
    assert.equal(inspectAlpha(new Uint8Array([...png, ...trns, 0, 0, 0, 0, 0x49, 0x44, 0x41, 0x54]), "png"), "possible");
    assert.equal(inspectAlpha(new Uint8Array([...png, 0, 0, 0, 0, 0x49, 0x44, 0x41, 0x54, 0, 0, 0, 0]), "png"), "none");
  });
});

describe("limits, checked before anything is decoded", () => {
  test("the limits are the frozen ones", () => {
    assert.deepEqual([MAX_FILE_BYTES, MAX_INPUT_PIXELS, MAX_INPUT_SIDE, MAX_OUTPUT_SIDE, MAX_OUTPUT_PIXELS], [26214400, 40000000, 16384, 8192, 16777216]);
  });

  test("the file size is judged from the size the browser reports, before a byte is read", () => {
    assert.equal(checkFile({ size: 1 }).ok, true);
    assert.equal(checkFile({ size: MAX_FILE_BYTES }).ok, true);
    const big = checkFile({ size: MAX_FILE_BYTES + 1 });
    assert.equal(big.ok, false);
    assert.match(big.message, /over the 25\.0 MB limit/);
    assert.equal(checkFile({ size: 0 }).message, MESSAGES.empty);
    assert.equal(checkFile(null).ok, false);
  });

  test("a huge image is refused from its header: the pixel limit and the side limit, at their boundaries", () => {
    assert.equal(checkInputSize(8000, 5000).ok, true); // exactly 40,000,000
    assert.equal(checkInputSize(8001, 5000).ok, false);
    assert.match(checkInputSize(8001, 5000).message, /40 megapixels/);
    assert.equal(checkInputSize(16384, 2000).ok, true);
    assert.equal(checkInputSize(16385, 100).ok, false);
    assert.match(checkInputSize(16385, 100).message, /16,384 pixels on a side/);
    assert.equal(checkInputSize(65535, 65535).ok, false);
    // a real JPEG header patched to claim 10,000 x 5,000 is read as that and refused without decoding
    const patched = Uint8Array.from(bytes("photo.jpg"));
    for (let i = 0; i < patched.length - 9; i++) {
      if (patched[i] === 0xff && patched[i + 1] === 0xc0) { patched[i + 5] = 5000 >> 8; patched[i + 6] = 5000 & 255; patched[i + 7] = 10000 >> 8; patched[i + 8] = 10000 & 255; break; }
    }
    const size = readSize(patched, "jpeg");
    assert.deepEqual(size, { width: 10000, height: 5000 });
    assert.equal(checkInputSize(size.width, size.height).ok, false);
  });

  test("the output size is checked before a canvas exists: whole pixels, at least 1, inside both limits", () => {
    assert.equal(checkOutputSize(8192, 2048).ok, true); // exactly 16,777,216
    assert.equal(checkOutputSize(8192, 2049).ok, false);
    assert.equal(checkOutputSize(8193, 1).ok, false);
    for (const [w, h] of [[0, 10], [10, 0], [-1, 5], [1.5, 5], [5, 2.5], [NaN, 5], [Infinity, 5], ["12", 5]]) assert.equal(checkOutputSize(w, h).ok, false, `${w}x${h}`);
    assert.equal(checkOutputSize(1, 1).ok, true);
  });
});

describe("resize arithmetic", () => {
  test("the other side follows with the aspect ratio locked, rounded, never below 1", () => {
    assert.equal(heightFromWidth(1600, 4000, 3000), 1200);
    assert.equal(widthFromHeight(1200, 4000, 3000), 1600);
    assert.equal(heightFromWidth(1000, 3, 2), 667);
    assert.equal(heightFromWidth(1, 4000, 3), 1); // 0.00075 rounds to 0 and is lifted to 1
    assert.equal(widthFromHeight(1, 3, 4000), 1);
  });

  test("an image bigger than the output limit starts at the largest size that can be made, in proportion", () => {
    assert.deepEqual(fitToOutputLimits(4000, 3000), { width: 4000, height: 3000 }); // already fine
    assert.deepEqual(fitToOutputLimits(8192, 2048), { width: 8192, height: 2048 }); // exactly at the limit
    for (const [w, h] of [[6000, 4000], [8000, 6000], [16384, 2000], [3000, 16000], [8192, 8192], [10000, 5000], [40000 / 5, 5000]]) {
      const fit = fitToOutputLimits(w, h);
      assert.equal(checkOutputSize(fit.width, fit.height).ok, true, `${w}x${h} -> ${fit.width}x${fit.height}`);
      assert.ok(Math.abs(fit.width / fit.height - w / h) / (w / h) < 0.01, `${w}x${h} keeps its shape`);
      assert.ok(fit.width <= w && fit.height <= h);
      // and it is the largest: one pixel more on the width would break a limit
      assert.equal(checkOutputSize(fit.width + 1, heightFromWidth(fit.width + 1, w, h)).ok, false, `${w}x${h} largest`);
    }
    assert.deepEqual(fitToOutputLimits(6000, 4000), { width: 5016, height: 3344 });
  });

  test("a typed dimension is whole pixels only: no decimals, signs, exponents, text, or out-of-range", () => {
    assert.deepEqual(parseDimension(" 1200 ", "width"), { ok: true, value: 1200 });
    assert.deepEqual(parseDimension("8192", "width"), { ok: true, value: 8192 });
    for (const bad of ["", "   ", "abc", "12.5", "-5", "+5", "1e3", "0x10", "0", "00", "1,200", "8193", "99999999999999999999", "Infinity", "NaN", null, undefined]) {
      const r = parseDimension(bad, "width");
      assert.equal(r.ok, false, String(bad));
      assert.ok(r.message.length > 10, String(bad));
    }
    assert.match(parseDimension("abc", "height").message, /height/);
  });

  test("presets: percentages round; long-side presets fit; one that would enlarge is not offered", () => {
    assert.deepEqual(RESIZE_PRESETS.map((p) => p.id), ["original", "75", "50", "long1920", "long1280"]);
    assert.deepEqual(presetSize("original", 4000, 3000), { width: 4000, height: 3000 });
    assert.deepEqual(presetSize("75", 4000, 3000), { width: 3000, height: 2250 });
    assert.deepEqual(presetSize("50", 4001, 3001), { width: 2001, height: 1501 });
    assert.deepEqual(presetSize("long1920", 4000, 3000), { width: 1920, height: 1440 });
    assert.deepEqual(presetSize("long1920", 3000, 4000), { width: 1440, height: 1920 });
    assert.deepEqual(presetSize("long1280", 4000, 3000), { width: 1280, height: 960 });
    assert.equal(presetSize("long1920", 1920, 1080), null);
    assert.equal(presetSize("long1280", 800, 600), null);
    assert.deepEqual(presetSize("50", 1, 1), { width: 1, height: 1 });
    assert.equal(presetSize("bogus", 10, 10), null);
  });
});

describe("output formats and quality", () => {
  const all = { jpeg: true, webp: true, png: true };

  test("JPEG is disabled for anything that may have transparency, with the reason; WebP and PNG stay", () => {
    const find = (choices, mime) => choices.find((c) => c.mime === mime);
    for (const alpha of ["possible", "yes"]) {
      const jpeg = find(outputChoices({ inputMime: "image/png", alpha, supported: all }), "image/jpeg");
      assert.equal(jpeg.disabled, true, alpha);
      assert.equal(jpeg.reason, alpha === "possible" ? "Checking for transparency…" : "JPEG doesn't support transparency. Keep PNG or use WebP.");
    }
    for (const alpha of ["none", "no"]) assert.equal(find(outputChoices({ inputMime: "image/png", alpha, supported: all }), "image/jpeg").disabled, false, alpha);
    const choices = outputChoices({ inputMime: "image/png", alpha: "yes", supported: all });
    assert.equal(find(choices, "image/webp").disabled, false);
    assert.equal(find(choices, "image/png").disabled, false);
  });

  test("a format the browser cannot encode is not offered at all; the original is labelled", () => {
    const noWebp = outputChoices({ inputMime: "image/jpeg", alpha: "none", supported: { jpeg: true, webp: false, png: true } });
    assert.deepEqual(noWebp.map((c) => c.mime), ["image/jpeg", "image/png"]);
    assert.equal(noWebp[0].label, "JPEG (original format)");
    assert.equal(noWebp[1].label, "PNG");
  });

  test("the default is the original format when usable, otherwise the first usable one", () => {
    assert.equal(defaultOutput("image/jpeg", outputChoices({ inputMime: "image/jpeg", alpha: "none", supported: all })), "image/jpeg");
    assert.equal(defaultOutput("image/png", outputChoices({ inputMime: "image/png", alpha: "possible", supported: all })), "image/png");
    const webpOnlyInput = outputChoices({ inputMime: "image/webp", alpha: "none", supported: { jpeg: true, webp: false, png: true } });
    assert.equal(defaultOutput("image/webp", webpOnlyInput), "image/jpeg");
    assert.equal(defaultOutput("image/jpeg", []), "image/png");
  });

  test("only JPEG and WebP have a quality; PNG has none", () => {
    assert.equal(usesQuality("image/jpeg"), true);
    assert.equal(usesQuality("image/webp"), true);
    assert.equal(usesQuality("image/png"), false);
  });

  test("quality is a whole number between 30 and 95; the presets are the documented values", () => {
    assert.deepEqual([QUALITY_MIN, QUALITY_MAX, QUALITY_DEFAULT], [30, 95, 80]);
    assert.deepEqual(QUALITY_PRESETS.map((p) => [p.label, p.quality]), [["High quality", 90], ["Balanced", 80], ["Smaller file", 60]]);
    for (const [input, out] of [[80, 80], [100, 95], [1000, 95], [0, 30], [-5, 30], [29, 30], [96, 95], [79.6, 80], ["70", 70], [NaN, 80], [undefined, 80], ["abc", 80], [Infinity, 95]]) {
      assert.equal(clampQuality(input), out, String(input));
    }
  });

  test("the target is whole KB inside a sensible range, and means 1,024-byte kilobytes", () => {
    assert.deepEqual(parseTargetKB("500"), { ok: true, value: 500, bytes: 512000 });
    assert.equal(parseTargetKB(" 10 ").ok, true);
    assert.equal(parseTargetKB("20000").ok, true);
    for (const bad of ["", "9", "20001", "0", "-100", "1.5", "5e2", "abc", "500KB", null]) assert.equal(parseTargetKB(bad).ok, false, String(bad));
  });
});

describe("up to N KB: the bounded search", () => {
  const KB = 1024;
  const linear = (perPoint) => async (quality) => ({ size: quality * perPoint, quality });

  test("the highest quality that fits wins, found in at most 8 encodes, to the nearest whole number", async () => {
    // size = quality x 10 KB; target 500 KB -> quality 50
    const result = await searchQuality({ targetBytes: 500 * KB, encode: linear(10 * KB) });
    assert.equal(result.status, "reached");
    assert.equal(result.best.quality, 50);
    assert.ok(result.best.size <= 500 * KB);
    assert.ok(result.attempts.length <= TARGET_ATTEMPTS);
    assert.equal(result.attempts[0].quality, QUALITY_MAX); // the highest is tried first
    assert.equal(result.attempts[1].quality, QUALITY_MIN); // then the floor
  });

  test("on a well-behaved encoder it lands on the best quality, or one point below it in the worst case, within 8 encodes", async () => {
    let exact = 0;
    for (let target = 31; target <= 94; target++) {
      const r = await searchQuality({ targetBytes: target * 10 * KB + 5, encode: linear(10 * KB) });
      assert.ok(r.attempts.length <= 8, `attempts ${r.attempts.length}`);
      assert.ok(r.best.quality === target || r.best.quality === target - 1, `target ${target} got ${r.best.quality}`);
      assert.ok(r.best.size <= target * 10 * KB + 5);
      if (r.best.quality === target) exact++;
    }
    assert.ok(exact >= 32); // most targets are hit exactly
  });

  test("already small enough: one encode at the top quality", async () => {
    const r = await searchQuality({ targetBytes: 1000 * KB, encode: linear(10 * KB) });
    assert.equal(r.status, "reached");
    assert.equal(r.best.quality, 95);
    assert.equal(r.attempts.length, 1);
  });

  test("unreachable: even the floor is too big, so it stops after two encodes and reports the smallest", async () => {
    const r = await searchQuality({ targetBytes: 100 * KB, encode: linear(10 * KB) }); // 30 -> 300 KB
    assert.equal(r.status, "unreachable");
    assert.deepEqual([r.floor.quality, r.floor.size], [30, 300 * KB]);
    assert.equal(r.attempts.length, 2);
    assert.equal(r.best, undefined);
  });

  test("a target exactly equal to the floor's size is reachable at the floor", async () => {
    const r = await searchQuality({ targetBytes: 300 * KB, encode: linear(10 * KB) });
    assert.equal(r.status, "reached");
    assert.equal(r.best.quality, 30);
  });

  test("encoder sizes that are not monotonic: the answer is still valid and the best seen, within the bound", async () => {
    // jagged: size wobbles by +-40 KB around a rising trend
    const jagged = async (q) => ({ size: (q * 10 + ((q * 7919) % 9 - 4) * 10) * KB });
    for (const targetKB of [350, 420, 500, 640, 800]) {
      const r = await searchQuality({ targetBytes: targetKB * KB, encode: jagged });
      assert.ok(r.attempts.length <= TARGET_ATTEMPTS, `attempts ${r.attempts.length}`);
      if (r.status === "reached") {
        assert.ok(r.best.size <= targetKB * KB);
        // nothing it tried at a higher quality also fit
        for (const a of r.attempts) if (a.size <= targetKB * KB) assert.ok(a.quality <= r.best.quality);
      }
    }
  });

  test("it never runs without end, whatever the encoder does", async () => {
    let calls = 0;
    const r = await searchQuality({ targetBytes: 1, encode: async () => { calls++; return { size: 5 }; } });
    assert.equal(r.status, "unreachable");
    assert.ok(calls <= TARGET_ATTEMPTS);
    calls = 0;
    await searchQuality({ targetBytes: 6, encode: async () => { calls++; return { size: 5 }; } });
    assert.ok(calls <= TARGET_ATTEMPTS);
    calls = 0;
    await searchQuality({ targetBytes: 5 * KB, encode: async (q) => { calls++; return { size: q % 2 ? 10 * KB : 1 * KB }; } });
    assert.ok(calls <= TARGET_ATTEMPTS);
  });

  test("it is deterministic and keeps only the winning result (the others can be freed)", async () => {
    const run = () => searchQuality({ targetBytes: 500 * KB, encode: async (q) => ({ size: q * 10 * KB, payload: { q } }) });
    const a = await run();
    const b = await run();
    assert.deepEqual(a.attempts, b.attempts);
    assert.deepEqual(a.best.result.payload, { q: 50 });
    assert.deepEqual(Object.keys(a.best).sort(), ["quality", "result", "size"]);
  });
});

describe("wording", () => {
  test("sizes are shown in KB and MB, with 1,024-byte units", () => {
    assert.equal(formatBytes(0), "0 bytes");
    assert.equal(formatBytes(1), "1 byte");
    assert.equal(formatBytes(1023), "1023 bytes");
    assert.equal(formatBytes(1024), "1.0 KB");
    assert.equal(formatBytes(3.2 * 1024), "3.2 KB");
    assert.equal(formatBytes(420 * 1024), "420 KB");
    assert.equal(formatBytes(1024 * 1024 - 1), "1,024 KB");
    assert.equal(formatBytes(3.8 * 1024 * 1024), "3.8 MB");
    assert.equal(formatBytes(MAX_FILE_BYTES), "25.0 MB");
    assert.equal(formatDimensions(4000, 3000), "4,000 × 3,000");
  });

  test("a smaller output is a reduction; a larger one is plainly larger and never a negative reduction", () => {
    assert.deepEqual(describeChange(1000 * 1024, 200 * 1024), { kind: "smaller", text: "Reduced by 800 KB (80%).", detail: "" });
    assert.equal(describeChange(100 * 1024 * 1024 / 10, 1).kind, "smaller");
    assert.equal(describeChange(1000 * 1024, 1000 * 1024 - 1).text, "Reduced by 1 byte (less than 1%).");
    const larger = describeChange(1000 * 1024, 1120 * 1024);
    assert.deepEqual(larger, { kind: "larger", text: "Larger by 120 KB (12%).", detail: "Output is 120 KB larger than the original." });
    assert.doesNotMatch(larger.text, /-|Reduced/);
    assert.equal(describeChange(5, 5).kind, "same");
    assert.equal(describeChange(3.8 * 1024 * 1024, 420 * 1024).text, "Reduced by 3.4 MB (89%).");
  });

  test("file names: a safe base, no path, no reserved characters, no doubled extension, the extension of the real bytes", () => {
    assert.equal(outputFileName("holiday.jpg", "image/webp", false), "holiday-compressed.webp");
    assert.equal(outputFileName("holiday.jpg", "image/jpeg", true), "holiday-resized.jpg");
    assert.equal(outputFileName("C:\\fakepath\\My Photo.PNG", "image/png", false), "My Photo-compressed.png");
    assert.equal(outputFileName("a/b/c.d.jpeg", "image/jpeg", false), "c.d-compressed.jpg");
    assert.equal(outputFileName('we<ird>:"na|me?*.jpg', "image/png", true), "weirdname-resized.png");
    assert.equal(outputFileName("", "image/png", false), "image-compressed.png");
    assert.equal(outputFileName("...", "image/png", false), "image-compressed.png");
    assert.equal(outputFileName("tab\tand\nnewline.jpg", "image/jpeg", false), "tab and newline-compressed.jpg");
    assert.equal(safeBaseName("x".repeat(200) + ".jpg").length, 80);
    assert.equal(safeBaseName("<script>alert(1)</script>.png"), "script"); // the "/" is a path separator: only what follows it is kept
    assert.equal(safeBaseName("<b onclick=alert(1)>x.png"), "b onclick=alert(1)x");
    assert.equal(safeBaseName(null), "image");
    assert.equal(extensionFor("image/jpeg"), "jpg");
    assert.equal(extensionFor("image/png"), "png");
    assert.equal(extensionFor("image/webp"), "webp");
    assert.doesNotMatch(outputFileName("a.jpg", "image/png", false), /\.jpg/); // PNG bytes are never labelled .jpg
  });
});

describe("a late answer never overwrites a newer choice", () => {
  test("only the latest operation is current; reset and a new file invalidate the old one", () => {
    const t = createOperationTracker();
    const a = t.begin();
    assert.equal(t.isCurrent(a), true);
    const b = t.begin();
    assert.equal(t.isCurrent(a), false);
    assert.equal(t.isCurrent(b), true);
    t.invalidate(); // a reset
    assert.equal(t.isCurrent(b), false);
    const c = t.begin();
    assert.equal(t.isCurrent(c), true);
    assert.notEqual(new Set([a, b, c]).size, 2);
  });
});

/* a stand-in for the browser: records what the pipeline asks of it */
function fakeEnv({ sourceWidth = 4000, sourceHeight = 3000, sizeFor = (mime, q) => (q ? q * 1000 : 50000), decodeFails = false, returnType = null, noContext = false } = {}) {
  const log = { decoded: 0, closed: 0, canvases: [], encodes: [], fills: [] };
  return {
    log,
    kind: "fake",
    now: (() => { let t = 0; return () => (t += 5); })(),
    createImageBitmap: async () => {
      if (decodeFails) throw new DOMException("bad", "InvalidStateError");
      log.decoded++;
      return { width: sourceWidth, height: sourceHeight, close() { log.closed++; } };
    },
    createCanvas(width, height) {
      const canvas = { width, height, getContext: () => (noContext ? null : { fillRect(...a) { log.fills.push(a); }, drawImage() {}, clearRect() {}, getImageData: () => ({ data: new Uint8ClampedArray(4).fill(255) }), set fillStyle(v) { log.fills.push(v); }, set imageSmoothingQuality(v) {} }) };
      log.canvases.push(canvas);
      return canvas;
    },
    async toBlob(canvas, mime, quality) {
      log.encodes.push({ mime, quality, width: canvas.width, height: canvas.height });
      const q = quality === undefined ? 0 : Math.round(quality * 100);
      return { type: returnType ?? mime, size: sizeFor(mime, q) };
    },
  };
}

describe("the pipeline's rules (against a fake browser)", () => {
  const file = { size: 123 };

  test("the output size is validated before the image is decoded or a canvas exists", async () => {
    const env = fakeEnv();
    await assert.rejects(processImage({ file, width: 0, height: 100, mime: "image/jpeg", quality: 80 }, env), (e) => e.code === "invalid-size");
    await assert.rejects(processImage({ file, width: 9000, height: 100, mime: "image/jpeg", quality: 80 }, env), (e) => e.code === "invalid-size");
    await assert.rejects(processImage({ file, width: 8192, height: 4096, mime: "image/jpeg", quality: 80 }, env), (e) => e.code === "invalid-size");
    assert.deepEqual([env.log.decoded, env.log.canvases.length], [0, 0]);
  });

  test("a decoded image over the pixel limit is refused before the output canvas is allocated, and the bitmap is released", async () => {
    const env = fakeEnv({ sourceWidth: 9000, sourceHeight: 5000 });
    await assert.rejects(processImage({ file, width: 100, height: 100, mime: "image/jpeg", quality: 80 }, env), (e) => e.code === "too-large");
    assert.equal(env.log.canvases.length, 0);
    assert.ok(env.log.closed >= 1);
    await assert.rejects(inspectImage({ file }, fakeEnv({ sourceWidth: 9000, sourceHeight: 5000 })), (e) => e.code === "too-large");
  });

  test("a normal run: one decode, the bitmap closed, every canvas shrunk to nothing, the quality clamped", async () => {
    const env = fakeEnv();
    const r = await processImage({ file, width: 1600, height: 1200, mime: "image/jpeg", quality: 120 }, env);
    assert.equal(env.log.decoded, 1);
    assert.ok(env.log.closed >= 1);
    assert.ok(env.log.canvases.every((c) => c.width === 0 && c.height === 0), "all canvases released");
    assert.equal(r.quality, 95);
    assert.equal(r.size, 95000);
    assert.deepEqual([r.width, r.height, r.mime, r.target], [1600, 1200, "image/jpeg", null]);
    assert.equal(env.log.encodes[0].quality, 0.95);
    assert.equal(env.log.encodes[0].width, 1600);
    assert.ok(r.preview.blob && r.preview.width <= 640 && r.preview.height <= 640);
  });

  test("PNG has no quality: none is passed to the encoder and none is reported", async () => {
    const env = fakeEnv();
    const r = await processImage({ file, width: 800, height: 600, mime: "image/png", quality: 50, targetBytes: 1000 }, env);
    assert.equal(r.quality, null);
    assert.equal(r.target, null);
    assert.equal(env.log.encodes[0].quality, undefined);
    assert.equal(env.log.encodes.filter((e) => e.mime === "image/png").length >= 1, true);
  });

  test("JPEG output is drawn over white so transparency can never come out black", async () => {
    const env = fakeEnv();
    await processImage({ file, width: 100, height: 100, mime: "image/jpeg", quality: 80 }, env);
    assert.ok(env.log.fills.includes("#ffffff"));
    const png = fakeEnv();
    await processImage({ file, width: 100, height: 100, mime: "image/png" }, png);
    assert.equal(png.log.fills.filter((f) => f === "#ffffff").length, 1); // only the opaque preview, not the output
  });

  test("up to N KB: the search result is used, the quality used is reported, and the attempts are counted", async () => {
    const env = fakeEnv({ sizeFor: (mime, q) => q * 10 * 1024 });
    const r = await processImage({ file, width: 800, height: 600, mime: "image/jpeg", quality: 80, targetBytes: 500 * 1024 }, env);
    assert.deepEqual([r.quality, r.size], [50, 500 * 1024]);
    assert.deepEqual(r.target, { requestedBytes: 500 * 1024, reached: true, attempts: r.timings.attempts, floorSize: null });
    assert.ok(r.timings.attempts <= 8);
    assert.equal(env.log.encodes.filter((e) => e.mime === "image/jpeg").length >= r.timings.attempts, true);
  });

  test("an unreachable target reports the floor result, not a silent lower quality", async () => {
    const env = fakeEnv({ sizeFor: (mime, q) => q * 10 * 1024 });
    const r = await processImage({ file, width: 800, height: 600, mime: "image/webp", quality: 80, targetBytes: 100 * 1024 }, env);
    assert.deepEqual([r.quality, r.size, r.target.reached, r.target.floorSize], [30, 300 * 1024, false, 300 * 1024]);
    assert.equal(r.timings.attempts, 2);
    assert.ok(env.log.encodes.every((e) => e.quality === undefined || e.quality >= 0.3));
  });

  test("an encoder that answers with another type (a browser that cannot encode WebP) is an error, not a mislabelled file", async () => {
    const env = fakeEnv({ returnType: "image/png" });
    await assert.rejects(processImage({ file, width: 100, height: 100, mime: "image/webp", quality: 80 }, env), (e) => e.code === "encoder-unavailable" && e.message === MESSAGES.encoderUnavailable);
    assert.ok(env.log.canvases.every((c) => c.width === 0), "canvases released after the failure");
    assert.ok(env.log.closed >= 1);
  });

  test("a file that cannot be decoded gives the plain message and no canvas is made", async () => {
    const env = fakeEnv({ decodeFails: true });
    await assert.rejects(processImage({ file, width: 100, height: 100, mime: "image/jpeg", quality: 80 }, env), (e) => e.code === "decode" && e.message === MESSAGES.undecodable);
    await assert.rejects(inspectImage({ file }, env), (e) => e.code === "decode");
    assert.equal(env.log.canvases.length, 0);
  });

  test("a browser without a drawing surface is reported as unsupported so the page can fall back", async () => {
    await assert.rejects(processImage({ file, width: 10, height: 10, mime: "image/jpeg", quality: 80 }, fakeEnv({ noContext: true })), (e) => e.code === "unsupported");
  });

  test("inspect: decodes once, scans for transparency only when asked, and releases the bitmap", async () => {
    const env = fakeEnv({ sourceWidth: 600, sourceHeight: 300 });
    const plain = await inspectImage({ file, scanAlpha: false }, env);
    assert.deepEqual([plain.width, plain.height, plain.alpha], [600, 300, null]);
    const scanned = await inspectImage({ file, scanAlpha: true }, env); // the fake pixels are opaque
    assert.equal(scanned.alpha, "no");
    assert.equal(env.log.decoded, 2);
    assert.ok(env.log.closed >= 2);
    assert.ok(env.log.canvases.every((c) => c.width === 0));
    assert.equal(plain.preview.width, 600);
  });

  test("errors given to the page never carry stack traces or the browser's own text", () => {
    assert.deepEqual(serializeError(new PipelineError("decode", "x")), { code: "decode", message: "x" });
    assert.deepEqual(serializeError(new RangeError("Array buffer allocation failed at 0x7ff...")), { code: "failed", message: MESSAGES.failed });
    assert.deepEqual(serializeError(null), { code: "failed", message: MESSAGES.failed });
  });
});
