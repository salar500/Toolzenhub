/* =========================================================
   ToolZen Hub
   Photos to PDF: reading a picture for the PDF

   The browser-only part. prepareImage turns one chosen file into the
   JPEG bytes that go into the PDF: the original bytes when they can be
   used as they are, otherwise the picture decoded by the browser (which
   applies the EXIF turn) and saved again as a JPEG on a white ground.
   makeThumbnail draws a small preview into a canvas (no object URL).
   Nothing here keeps a decoded picture: every bitmap is closed and every
   canvas shrunk as soon as it has been used.
========================================================= */

import { MIME_OF } from "../image-compressor-resizer/image-engine.js";

import {
    THUMB_SIDE,
    REDRAW_QUALITY,
    sniffFormat,
    jpegInfo,
    embedStrategy,
    redrawSize
} from "./pdf-rules.js";

function makeCanvas(width, height) {

    if (typeof OffscreenCanvas === "function") {
        return new OffscreenCanvas(width, height);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    return canvas;

}

function canvasToJpegBlob(canvas, quality) {

    if (typeof canvas.convertToBlob === "function") {
        return canvas.convertToBlob({ type: "image/jpeg", quality });
    }

    return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser could not save the picture."))), "image/jpeg", quality));

}

function release(canvas) {

    canvas.width = 1;
    canvas.height = 1;

}

/*
 * { bytes, width, height, redrawn, reduced }
 * Throws an Error with a user-readable message if the browser cannot decode the file.
 */
export async function prepareImage(file) {

    const original = new Uint8Array(await file.arrayBuffer());
    const format = sniffFormat(original);
    const info = format === "jpeg" ? jpegInfo(original) : null;

    if (embedStrategy(format, info) === "keep") {
        return { bytes: original, width: info.width, height: info.height, redrawn: false, reduced: false };
    }

    let bitmap;

    try {
        bitmap = await createImageBitmap(new Blob([original], { type: MIME_OF[format] || "image/jpeg" }), { imageOrientation: "from-image" });
    } catch {
        throw new Error("The browser could not decode this picture.");
    }

    const size = redrawSize(bitmap.width, bitmap.height);
    const canvas = makeCanvas(size.width, size.height);
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(bitmap, 0, 0, size.width, size.height);

    bitmap.close();

    let blob;

    try {
        blob = await canvasToJpegBlob(canvas, REDRAW_QUALITY);
    } finally {
        release(canvas);
    }

    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: size.width, height: size.height, redrawn: true, reduced: size.reduced };

}

/*
 * Draw a preview of the file, THUMB_SIDE pixels on its longer side, into `canvas`.
 * Resolves to true when drawn, false when the browser could not decode it.
 */
export async function makeThumbnail(file, canvas) {

    let bitmap;

    try {

        try {
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image", resizeWidth: THUMB_SIDE, resizeQuality: "low" });
        } catch {
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        }

        const scale = Math.min(1, THUMB_SIDE / Math.max(bitmap.width, bitmap.height));
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

        return true;

    } catch {

        return false;

    } finally {

        if (bitmap) bitmap.close();

    }

}
