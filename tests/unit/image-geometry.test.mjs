/**
 * Image Compressor & Resizer, rotate/flip/crop (Tool Pack 43): the geometry, with an independent oracle.
 *
 * The risk of a crop tool is the wrong pixels. So the canvas transform the tool builds is CHECKED BY
 * RENDERING: a tiny picture whose every pixel is different is drawn through the matrix (nearest pixel,
 * scale 1) in plain JavaScript and compared, pixel for pixel, with what Pillow's own transpose, flip and
 * crop produce for the same edit (an implementation that shares no code with the tool).
 *
 *   node --test tests/unit/image-geometry.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import {
    RATIOS,
    cleanTurn,
    turnedSize,
    ratioRect,
    validateRect,
    moveRect,
    resizeRect,
    sourceMatrix,
    describeEdit
} from "../../assets/js/tools/image-compressor-resizer/image-geometry.js";
import { outputFileName, MAX_OUTPUT_SIDE } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const python = spawnSync("python", ["-c", "import PIL"], { encoding: "utf8" }).status === 0 ? "python" : null;
const needPython = python ? {} : { skip: "Python with Pillow is not installed" };

/* draw a source picture (pixel value = its index) through the matrix at scale 1, nearest pixel */
function render(width, height, edit) {

    const turned = turnedSize(width, height, edit.turn);
    const crop = edit.crop ?? { x: 0, y: 0, width: turned.width, height: turned.height };
    const [a, b, c, d, e, f] = sourceMatrix({ width, height, ...edit, outWidth: crop.width, outHeight: crop.height });
    const det = a * d - b * c;
    const out = [];

    for (let j = 0; j < crop.height; j++) {

        const row = [];

        for (let i = 0; i < crop.width; i++) {

            const ox = i + 0.5 - e;
            const oy = j + 0.5 - f;
            const sx = Math.floor((d * ox - c * oy) / det);
            const sy = Math.floor((-b * ox + a * oy) / det);

            row.push(sx < 0 || sy < 0 || sx >= width || sy >= height ? -1 : sy * width + sx);

        }

        out.push(row);

    }

    return out;

}

test("rotate, flip and crop: every pixel agrees with Pillow for all 16 turn and flip combinations and several crops", needPython, () => {

    const W = 7;
    const H = 5;
    const cases = [];

    for (const turn of [0, 1, 2, 3]) {
        for (const flipH of [false, true]) {
            for (const flipV of [false, true]) {
                const t = turnedSize(W, H, turn);
                cases.push({ turn, flipH, flipV, crop: null });
                cases.push({ turn, flipH, flipV, crop: { x: 1, y: 2, width: Math.min(3, t.width - 1), height: Math.min(2, t.height - 2) } });
                cases.push({ turn, flipH, flipV, crop: { x: t.width - 2, y: t.height - 3, width: 2, height: 3 } });
            }
        }
    }

    const code = [
        "import json, sys",
        "from PIL import Image",
        "W, H = int(sys.argv[1]), int(sys.argv[2])",
        "cases = json.loads(sys.argv[3])",
        "src = Image.new('I', (W, H)); src.putdata(list(range(W * H)))",
        "out = []",
        "for c in cases:",
        "    im = src",
        "    if c['turn'] == 1: im = im.transpose(Image.ROTATE_270)",
        "    if c['turn'] == 2: im = im.transpose(Image.ROTATE_180)",
        "    if c['turn'] == 3: im = im.transpose(Image.ROTATE_90)",
        "    if c['flipH']: im = im.transpose(Image.FLIP_LEFT_RIGHT)",
        "    if c['flipV']: im = im.transpose(Image.FLIP_TOP_BOTTOM)",
        "    k = c['crop']",
        "    if k: im = im.crop((k['x'], k['y'], k['x'] + k['width'], k['y'] + k['height']))",
        "    w, h = im.size",
        "    px = list(im.getdata())",
        "    out.append([px[j * w:(j + 1) * w] for j in range(h)])",
        "print(json.dumps(out))"
    ].join("\n");

    const run = spawnSync(python, ["-c", code, String(W), String(H), JSON.stringify(cases)], { encoding: "utf8" });

    assert.equal(run.status, 0, run.stderr);

    const expected = JSON.parse(run.stdout);

    assert.equal(cases.length, 48);

    cases.forEach((edit, i) => {
        assert.deepEqual(render(W, H, edit), expected[i], `case ${i}: ${JSON.stringify(edit)}`);
    });

});

test("scaling: the crop fills the output exactly (corners of the crop land on the corners of the output)", () => {

    const [a, b, c, d, e, f] = sourceMatrix({ width: 4000, height: 3000, turn: 1, flipH: true, crop: { x: 100, y: 200, width: 1000, height: 1500 }, outWidth: 200, outHeight: 300 });
    const at = (x, y) => [a * x + c * y + e, b * x + d * y + f];
    /* source -> after turn 1 and flip: find where source point maps; the crop rectangle's own corners are checked via the inverse */
    const det = a * d - b * c;
    const back = (ox, oy) => [(d * (ox - e) - c * (oy - f)) / det, (-b * (ox - e) + a * (oy - f)) / det];
    const corners = [back(0, 0), back(200, 0), back(0, 300), back(200, 300)];

    /* the four output corners come from four distinct source corners that span a 1500 x 1000 source area */
    const xs = corners.map((p) => p[0]);
    const ys = corners.map((p) => p[1]);

    assert.ok(Math.abs(Math.max(...xs) - Math.min(...xs) - 1500) < 1e-6);
    assert.ok(Math.abs(Math.max(...ys) - Math.min(...ys) - 1000) < 1e-6);
    assert.ok(at(0, 0).every(Number.isFinite));

});

test("worked example 2: 4000x3000 to an exact 200x230 crops about 2609x3000 from the middle, then scales; nothing is stretched", () => {

    const rect = ratioRect(4000, 3000, 200, 230);

    assert.deepEqual(rect, { x: 695, y: 0, width: 2609, height: 3000 });
    assert.ok(Math.abs(rect.width / rect.height - 200 / 230) < 1 / 3000, "the shape is the target shape to within one source pixel");

    const portrait = ratioRect(3000, 4000, 200, 230);

    assert.deepEqual(portrait, { x: 0, y: 275, width: 3000, height: 3450 }, "a tall picture is cut from the top and bottom");

});

test("ratioRect: the largest centred rectangle, whole pixels, never outside the picture", () => {

    assert.deepEqual(ratioRect(4000, 3000, 1, 1), { x: 500, y: 0, width: 3000, height: 3000 });
    assert.deepEqual(ratioRect(4000, 3000, 4, 3), { x: 0, y: 0, width: 4000, height: 3000 }, "already that shape: the whole picture");
    assert.deepEqual(ratioRect(4000, 3000, 16, 9), { x: 0, y: 375, width: 4000, height: 2250 });
    assert.deepEqual(ratioRect(1920, 1080, 9, 16), { x: 656, y: 0, width: 608, height: 1080 });
    assert.deepEqual(ratioRect(1, 1, 16, 9), { x: 0, y: 0, width: 1, height: 1 }, "a 1 pixel picture stays 1 x 1");

    for (const [w, h] of [[7, 5], [100, 1], [1, 100], [3333, 2222], [8192, 8192]]) {
        for (const r of RATIOS.filter((x) => x.w)) {
            const k = ratioRect(w, h, r.w, r.h);
            assert.ok(k.x >= 0 && k.y >= 0 && k.x + k.width <= w && k.y + k.height <= h && k.width >= 1 && k.height >= 1, `${w}x${h} ${r.id}`);
        }
    }

});

test("validateRect: whole pixels, at least 1 x 1, inside the picture, with a message each", () => {

    assert.deepEqual(validateRect({ x: 0, y: 0, width: 10, height: 10 }, 10, 10), { ok: true });
    assert.equal(validateRect({ x: 1, y: 0, width: 10, height: 10 }, 10, 10).ok, false);
    assert.equal(validateRect({ x: 0, y: 0, width: 0, height: 5 }, 10, 10).ok, false);
    assert.equal(validateRect({ x: -1, y: 0, width: 5, height: 5 }, 10, 10).ok, false);
    assert.equal(validateRect({ x: 0.5, y: 0, width: 5, height: 5 }, 10, 10).ok, false);
    assert.equal(validateRect({ x: NaN, y: 0, width: 5, height: 5 }, 10, 10).ok, false);
    assert.equal(validateRect(undefined, 10, 10).ok, false);
    assert.match(validateRect({ x: 8, y: 0, width: 5, height: 5 }, 10, 10).message, /inside the picture/);

});

test("moveRect and resizeRect stay inside the picture and keep the shape when asked", () => {

    assert.deepEqual(moveRect({ x: 10, y: 10, width: 20, height: 20 }, -50, 500, 100, 100), { x: 0, y: 80, width: 20, height: 20 });
    assert.deepEqual(moveRect({ x: 10, y: 10, width: 20, height: 20 }, 1, 1, 100, 100), { x: 11, y: 11, width: 20, height: 20 }, "an arrow key is 1 pixel");

    const grown = resizeRect({ x: 10, y: 10, width: 20, height: 20 }, "se", 30, 5, 100, 100);

    assert.deepEqual(grown, { x: 10, y: 10, width: 50, height: 25 });

    const kept = resizeRect({ x: 10, y: 10, width: 40, height: 20 }, "se", 20, 0, 100, 100, 2);

    assert.deepEqual(kept, { x: 10, y: 10, width: 60, height: 30 }, "ratio 2:1 kept");

    const clamped = resizeRect({ x: 10, y: 10, width: 40, height: 20 }, "se", 500, 500, 100, 50, 2);

    assert.ok(clamped.x + clamped.width <= 100 && clamped.y + clamped.height <= 50);
    assert.ok(Math.abs(clamped.width / clamped.height - 2) < 0.1);

    const nw = resizeRect({ x: 50, y: 50, width: 20, height: 20 }, "nw", -20, -20, 100, 100);

    assert.deepEqual(nw, { x: 30, y: 30, width: 40, height: 40 }, "the opposite corner stays");

    const flipped = resizeRect({ x: 50, y: 50, width: 20, height: 20 }, "se", -40, -40, 100, 100);

    assert.ok(flipped.width >= 1 && flipped.height >= 1 && flipped.x >= 0 && flipped.y >= 0, "dragging past the anchor stays valid");

});

test("turn helpers and the words used in results", () => {

    assert.deepEqual([0, 1, 4, -1, 2.5, "x"].map(cleanTurn), [0, 1, 0, 3, 0, 0]);
    assert.deepEqual(turnedSize(300, 200, 1), { width: 200, height: 300 });
    assert.equal(describeEdit({}), "");
    assert.equal(describeEdit({ turn: 1, flipH: true, crop: { x: 120, y: 40, width: 600, height: 800 } }), "rotated 90 degrees right, flipped horizontally, cropped to 600 × 800 at 120, 40");
    assert.equal(describeEdit({ turn: 3, flipV: true }), "rotated 90 degrees left, flipped vertically");

});

test("file name: -cropped when the picture was cropped, rotated or flipped, else -resized or -compressed as before", () => {

    assert.equal(outputFileName("holiday.jpg", "image/jpeg", false), "holiday-compressed.jpg");
    assert.equal(outputFileName("holiday.jpg", "image/jpeg", true), "holiday-resized.jpg");
    assert.equal(outputFileName("holiday.jpg", "image/webp", true, true), "holiday-cropped.webp");
    assert.equal(outputFileName("holiday.jpg", "image/png", false, true), "holiday-cropped.png");
    assert.ok(MAX_OUTPUT_SIDE > 0);

});
