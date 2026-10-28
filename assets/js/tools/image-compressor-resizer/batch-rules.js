/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: the rules of a batch

   Pure functions with no browser API (they run in the page and in the
   Node tests): how many files, how big in all, what size each output
   gets, what each output is called, and how a finished batch is
   described. The work on each image is the same pipeline a single
   image uses (image-pipeline.js).
========================================================= */

import {
    checkFile,
    heightFromWidth,
    widthFromHeight,
    fitToOutputLimits,
    safeBaseName,
    extensionFor,
    describeChange,
    formatBytes
} from "./image-engine.js";

/* provisional: the owner's requirements say "measured later"; the memory figure on a phone is UNKNOWN */
export const MAX_BATCH_FILES = 20;
export const MAX_BATCH_BYTES = 100 * 1024 * 1024;

export const STATUS = Object.freeze({
    waiting: "Waiting",
    working: "Working",
    done: "Done",
    skipped: "Skipped",
    failed: "Failed",
    cancelled: "Cancelled"
});

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/*
 * Which of the chosen files may enter the list, by count, size of each and size in all, using the
 * checks one image already gets (empty, over the file limit). The type and pixel checks read the
 * file's bytes, so the page does them afterwards, one file at a time.
 * Returns { accepted: [index...], rejected: [{ name, message }] }; order is the order chosen.
 */
export function planBatchSelection(files) {

    const accepted = [];
    const rejected = [];

    let total = 0;

    files.forEach((file, index) => {

        const name = file?.name || "image";
        const checked = checkFile(file);

        if (!checked.ok) {
            rejected.push({ name, message: checked.message });
            return;
        }

        if (accepted.length >= MAX_BATCH_FILES) {
            rejected.push({ name, message: `Not added: up to ${MAX_BATCH_FILES} images can be processed at a time.` });
            return;
        }

        if (total + file.size > MAX_BATCH_BYTES) {
            rejected.push({ name, message: `Not added: the images together would be over ${formatBytes(MAX_BATCH_BYTES)}.` });
            return;
        }

        total += file.size;
        accepted.push(index);

    });

    return { accepted, rejected };

}

/*
 * The longest side of every output, the same for all images, in whole pixels. null keeps each
 * image's own size. An image is never enlarged, and its width and height keep their ratio.
 * The result is also kept inside the output limits (8,192 px per side, 16.7 megapixels).
 * { width, height, reduced (smaller than the image), limited (cut down to fit the output limits) }
 */
export function batchOutputSize(width, height, longestSide = null) {

    let w = width;
    let h = height;

    if (longestSide && Math.max(width, height) > longestSide) {

        if (width >= height) {
            w = longestSide;
            h = heightFromWidth(w, width, height);
        } else {
            h = longestSide;
            w = widthFromHeight(h, width, height);
        }

    }

    const fitted = fitToOutputLimits(w, h);

    return {
        width: fitted.width,
        height: fitted.height,
        reduced: fitted.width !== width || fitted.height !== height,
        limited: fitted.width !== w || fitted.height !== h
    };

}

/*
 * "holiday.jpg" -> "holiday-compressed.webp" (or -resized when the size changed). A name already
 * taken in this batch gets -2, -3, ... before the extension, compared without regard to case so two
 * files never overwrite each other on a case-insensitive disk. `taken` is a Set that is updated.
 */
export function batchFileName(originalName, mime, resized, taken) {

    const stem = `${safeBaseName(originalName)}-${resized ? "resized" : "compressed"}`;
    const extension = extensionFor(mime);

    let candidate = `${stem}.${extension}`;
    let n = 1;

    while (taken.has(candidate.toLowerCase())) {
        n += 1;
        candidate = `${stem}-${n}.${extension}`;
    }

    taken.add(candidate.toLowerCase());

    return candidate;

}

/* the one sentence announced when a run ends: '12 of 14 images done; 2 skipped' */
export function describeBatchFinish(rows) {

    const count = (status) => rows.filter((row) => row.status === status).length;

    const parts = [`${count("done")} of ${plural(rows.length, "image", "images")} done`];

    for (const [status, word] of [["skipped", "skipped"], ["failed", "failed"], ["cancelled", "cancelled"]]) {

        const n = count(status);

        if (n > 0) {
            parts.push(`${n} ${word}`);
        }

    }

    return parts.join("; ");

}

/*
 * Totals over the finished images only: { count, before, after, change } where change is
 * describeChange's honest wording (a bigger total is said to be bigger).
 */
export function batchTotals(rows) {

    const done = rows.filter((row) => row.status === "done" && row.result);

    const before = done.reduce((sum, row) => sum + row.size, 0);
    const after = done.reduce((sum, row) => sum + row.result.size, 0);

    return { count: done.length, before, after, change: done.length ? describeChange(before, after) : null };

}
