/**
 * Image Compressor & Resizer, batch (Tool Pack 42): the rules that need no browser.
 *
 * What the batch does to each image is the single-image pipeline (covered by image-engine.test.mjs and the
 * browser specs); here are the numbers around it: how many files and how many bytes, the size each output
 * gets (checked by hand and against Pillow), the names, and the sentence at the end.
 *
 *   node --test tests/unit/image-batch.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import {
    MAX_BATCH_FILES,
    MAX_BATCH_BYTES,
    planBatchSelection,
    batchOutputSize,
    batchFileName,
    describeBatchFinish,
    batchTotals
} from "../../assets/js/tools/image-compressor-resizer/batch-rules.js";
import { MAX_FILE_BYTES, MAX_OUTPUT_SIDE, MAX_OUTPUT_PIXELS } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const file = (name, size) => ({ name, size });

test("limits: 20 images and 100 MB, in the order chosen; the rest are named with a reason", () => {

    assert.equal(MAX_BATCH_FILES, 20);
    assert.equal(MAX_BATCH_BYTES, 100 * 1024 * 1024);

    const many = Array.from({ length: 23 }, (_, i) => file(`p${i}.jpg`, 1000));
    const plan = planBatchSelection(many);

    assert.deepEqual(plan.accepted, Array.from({ length: 20 }, (_, i) => i));
    assert.deepEqual(plan.rejected.map((r) => r.name), ["p20.jpg", "p21.jpg", "p22.jpg"]);
    assert.match(plan.rejected[0].message, /up to 20 images/);

});

test("limits: one file over 25 MB or empty is refused alone; the total stops the next file, not the earlier ones", () => {

    const MB = 1024 * 1024;
    const plan = planBatchSelection([
        file("a.jpg", 24 * MB), file("b.jpg", 24 * MB), file("c.jpg", 24 * MB), file("d.jpg", 24 * MB), file("e.jpg", 24 * MB),
        file("huge.jpg", MAX_FILE_BYTES + 1), file("empty.jpg", 0), file("small.jpg", 1000)
    ]);

    assert.deepEqual(plan.accepted, [0, 1, 2, 3, 7], "four 24 MB files fit in 100 MB; the fifth does not; the small one still does");
    assert.deepEqual(plan.rejected.map((r) => r.name), ["e.jpg", "huge.jpg", "empty.jpg"]);
    assert.match(plan.rejected[0].message, /over 100\.0 MB/);
    assert.match(plan.rejected[1].message, /over the 25\.0 MB limit/);
    assert.match(plan.rejected[2].message, /empty/);

});

test("a selection with a missing or malformed entry does not throw", () => {

    const plan = planBatchSelection([null, undefined, {}, file("ok.png", 10)]);

    assert.deepEqual(plan.accepted, [3]);
    assert.equal(plan.rejected.length, 3);

});

test("worked example 1: 4000x3000, 3000x4000 and 600x400 with longest side 800", () => {

    const pick = ({ width, height }) => [width, height];

    assert.deepEqual(pick(batchOutputSize(4000, 3000, 800)), [800, 600]);
    assert.deepEqual(pick(batchOutputSize(3000, 4000, 800)), [600, 800]);
    assert.deepEqual(pick(batchOutputSize(600, 400, 800)), [600, 400], "never enlarged");
    assert.equal(batchOutputSize(600, 400, 800).reduced, false);
    assert.equal(batchOutputSize(4000, 3000, 800).reduced, true);

});

test("the longest side is exact, the ratio is kept to a pixel, a square stays square, 1 pixel is the floor", () => {

    assert.deepEqual(batchOutputSize(1000, 1000, 333), { width: 333, height: 333, reduced: true, limited: false });
    assert.deepEqual(batchOutputSize(10000, 10, 100), { width: 100, height: 1, reduced: true, limited: false });
    assert.deepEqual(batchOutputSize(10, 10000, 100), { width: 1, height: 100, reduced: true, limited: false });
    assert.deepEqual(batchOutputSize(4000, 3000, null), { width: 4000, height: 3000, reduced: false, limited: false }, "keep size");
    assert.deepEqual(batchOutputSize(800, 600, 800), { width: 800, height: 600, reduced: false, limited: false }, "equal to the limit: unchanged");

});

test("keeping the size is still held inside the output limits and says so", () => {

    const wide = batchOutputSize(12000, 1000, null);

    assert.ok(wide.width <= MAX_OUTPUT_SIDE && wide.limited && wide.reduced);
    assert.equal(wide.width, 8192);
    assert.ok(Math.abs(wide.width / wide.height - 12) < 0.02);

    const big = batchOutputSize(7000, 7000, null);

    assert.ok(big.width * big.height <= MAX_OUTPUT_PIXELS && big.limited);

});

test("every output size agrees with Pillow's rounding of the same ratio (independent)", () => {

    const cases = [[4000, 3000, 800], [3000, 4000, 800], [4032, 3024, 1600], [1920, 1080, 1280], [1080, 1920, 1280], [999, 1001, 500], [5183, 3457, 777]];
    const ours = cases.map(([w, h, side]) => { const o = batchOutputSize(w, h, side); return [o.width, o.height]; });

    const probe = spawnSync("python", ["-c", "import PIL"], { encoding: "utf8" });

    if (probe.status !== 0) {
        return;
    }

    /* Pillow's own thumbnail() keeps a ratio inside a box; its rounding must agree with ours to within one pixel */
    const code = [
        "import json, sys",
        "from PIL import Image",
        "out = []",
        "for w, h, side in json.loads(sys.argv[1]):",
        "    im = Image.new('L', (w, h)); im.thumbnail((side, side), Image.LANCZOS); out.append(list(im.size))",
        "print(json.dumps(out))"
    ].join("\n");
    const run = spawnSync("python", ["-c", code, JSON.stringify(cases)], { encoding: "utf8" });

    assert.equal(run.status, 0, run.stderr);

    const theirs = JSON.parse(run.stdout);

    ours.forEach(([w, h], i) => {
        assert.equal(Math.max(w, h), cases[i][2], `case ${i}: longest side is exact`);
        assert.ok(Math.abs(w - theirs[i][0]) <= 1 && Math.abs(h - theirs[i][1]) <= 1, `case ${i}: ours ${w}x${h}, Pillow ${theirs[i]}`);
    });

});

test("names: sanitised base, -compressed or -resized, the real extension, repeats get -2, -3, case-insensitively", () => {

    const taken = new Set();

    assert.equal(batchFileName("holiday.jpg", "image/jpeg", false, taken), "holiday-compressed.jpg");
    assert.equal(batchFileName("holiday.jpg", "image/jpeg", false, taken), "holiday-compressed-2.jpg");
    assert.equal(batchFileName("Holiday.JPG", "image/jpeg", false, taken), "Holiday-compressed-3.jpg", "a case-insensitive disk would overwrite otherwise");
    assert.equal(batchFileName("holiday.png", "image/webp", true, taken), "holiday-resized.webp");
    assert.equal(batchFileName("holiday.webp", "image/webp", true, taken), "holiday-resized-2.webp");
    assert.equal(batchFileName("../../etc/passwd", "image/png", false, taken), "passwd-compressed.png", "no path survives");
    assert.equal(batchFileName("a<b>:c|d?.jpg", "image/jpeg", false, taken), "abcd-compressed.jpg");
    assert.equal(batchFileName("", "image/png", false, taken), "image-compressed.png");
    assert.equal(batchFileName("写真.jpg", "image/jpeg", false, taken), "写真-compressed.jpg", "Unicode is kept");
    assert.equal(taken.size, 9);

});

test("the closing sentence and the totals", () => {

    const rows = (statuses) => statuses.map((status) => ({ status }));

    assert.equal(describeBatchFinish(rows(Array(12).fill("done").concat(["skipped", "skipped"]))), "12 of 14 images done; 2 skipped");
    assert.equal(describeBatchFinish(rows(["done"])), "1 of 1 image done");
    assert.equal(describeBatchFinish(rows(["done", "failed", "cancelled", "cancelled"])), "1 of 4 images done; 1 failed; 2 cancelled");
    assert.equal(describeBatchFinish(rows(["failed", "failed"])), "0 of 2 images done; 2 failed");

    const t = batchTotals([
        { status: "done", size: 1000, result: { size: 400 } },
        { status: "done", size: 2000, result: { size: 600 } },
        { status: "failed", size: 5000 },
        { status: "skipped", size: 7000 }
    ]);

    assert.deepEqual([t.count, t.before, t.after, t.change.kind], [2, 3000, 1000, "smaller"]);
    assert.equal(batchTotals([{ status: "failed", size: 1 }]).change, null);

    const bigger = batchTotals([{ status: "done", size: 100, result: { size: 150 } }]);

    assert.equal(bigger.change.kind, "larger", "a larger total is said to be larger, never a negative reduction");

});
