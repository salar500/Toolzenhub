/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: the pixel work

   decode, draw, encode: nothing else. The same functions run in a
   Worker (image-worker.js) and on the main thread (the fallback);
   they are written against a small environment object so there is
   one implementation of the rules, not two.

   env = {
       kind          "worker" | "main"
       now()         a millisecond clock
       createImageBitmap(blob)
       createCanvas(width, height)
       toBlob(canvas, mime, quality)
   }

   Memory discipline (see the spec): the original File is the only
   thing that lives between runs. A run decodes it, draws it once at
   the output size, CLOSES the bitmap, encodes, and shrinks every
   canvas it made. Nothing here keeps a decoded image.
========================================================= */

import {
    MESSAGES,
    MAX_INPUT_PIXELS,
    PREVIEW_SIDE,
    ALPHA_BAND_ROWS,
    checkOutputSize,
    clampQuality,
    usesQuality,
    searchQuality
} from "./image-engine.js";


export class PipelineError extends Error {

    constructor(code, message) {

        super(message);

        this.code = code;

    }

}

/* a structured, UI-safe error: never a stack trace and never the browser's own text */
export function serializeError(problem) {

    if (problem instanceof PipelineError || (problem && typeof problem.code === "string" && problem.message)) {
        return { code: problem.code, message: problem.message };
    }

    return { code: "failed", message: MESSAGES.failed };

}


/* =========================================================
   Environments
========================================================= */

export function createMainEnv() {

    return {
        kind: "main",
        now: () => performance.now(),
        createImageBitmap: (blob) => createImageBitmap(blob),
        createCanvas: (width, height) => {

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            return canvas;

        },
        toBlob: (canvas, mime, quality) => new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
    };

}

export function createWorkerEnv() {

    return {
        kind: "worker",
        now: () => performance.now(),
        createImageBitmap: (blob) => createImageBitmap(blob),
        createCanvas: (width, height) => new OffscreenCanvas(width, height),
        toBlob: (canvas, mime, quality) => canvas.convertToBlob({ type: mime, quality })
    };

}


/* =========================================================
   Helpers
========================================================= */

function context2d(canvas) {

    const context = canvas.getContext("2d");

    if (!context) {
        throw new PipelineError("unsupported", "This browser could not create a drawing surface for the image.");
    }

    return context;

}

/* release a canvas's pixels now rather than whenever the garbage collector runs */
function release(canvas) {

    if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
    }

}

async function decode(file, env) {

    try {

        return await env.createImageBitmap(file);

    } catch (problem) {

        throw new PipelineError("decode", MESSAGES.undecodable);

    }

}

/* a small picture for the page: about PREVIEW_SIDE px, never the full decode */
async function scaledPreview(source, width, height, env, keepAlpha) {

    const scale = Math.min(1, PREVIEW_SIDE / Math.max(width, height));

    const previewWidth = Math.max(1, Math.round(width * scale));
    const previewHeight = Math.max(1, Math.round(height * scale));

    const canvas = env.createCanvas(previewWidth, previewHeight);

    try {

        const context = context2d(canvas);

        context.imageSmoothingQuality = "high";

        if (!keepAlpha) {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, previewWidth, previewHeight);
        }

        context.drawImage(source, 0, 0, previewWidth, previewHeight);

        const blob = await env.toBlob(canvas, keepAlpha ? "image/png" : "image/jpeg", 0.85);

        if (!blob) {
            throw new PipelineError("failed", MESSAGES.failed);
        }

        return { blob, width: previewWidth, height: previewHeight };

    } finally {

        release(canvas);

    }

}

/*
 * Does any pixel have an alpha under 255? Scanned in bands so a big image never needs a big
 * buffer, and it stops at the first transparent pixel.
 */
async function scanAlpha(bitmap, env) {

    const { width, height } = bitmap;

    const band = env.createCanvas(width, Math.min(ALPHA_BAND_ROWS, height));

    try {

        const context = context2d(band);

        for (let y = 0; y < height; y += ALPHA_BAND_ROWS) {

            const rows = Math.min(ALPHA_BAND_ROWS, height - y);

            context.clearRect(0, 0, width, rows);
            context.drawImage(bitmap, 0, y, width, rows, 0, 0, width, rows);

            const data = context.getImageData(0, 0, width, rows).data;

            for (let i = 3; i < data.length; i += 4) {

                if (data[i] < 255) {
                    return true;
                }

            }

        }

        return false;

    } finally {

        release(band);

    }

}


/* =========================================================
   inspect: learn what a chosen file is, once
========================================================= */

/*
 * request { file, scanAlpha: boolean, keepAlpha: boolean }
 * -> { width, height, alpha: "yes" | "no" | null, preview: { blob, width, height }, timings }
 *
 * width and height are what the browser shows (EXIF orientation applied).
 */
export async function inspectImage(request, env) {

    const started = env.now();

    const bitmap = await decode(request.file, env);

    try {

        const { width, height } = bitmap;

        if (width * height > MAX_INPUT_PIXELS) {
            throw new PipelineError("too-large", "This image has more pixels than can be processed safely.");
        }

        const decoded = env.now();

        const preview = await scaledPreview(bitmap, width, height, env, Boolean(request.keepAlpha));

        let alpha = null;

        if (request.scanAlpha) {
            alpha = (await scanAlpha(bitmap, env)) ? "yes" : "no";
        }

        return {
            width,
            height,
            alpha,
            preview,
            timings: { decodeMs: Math.round(decoded - started), totalMs: Math.round(env.now() - started) }
        };

    } finally {

        bitmap.close();

    }

}


/* =========================================================
   process: the compress and resize itself
========================================================= */

/*
 * request { file, width, height, mime, quality, targetBytes, keepAlpha }
 *   quality      whole number 30..95 (ignored for PNG)
 *   targetBytes  when set (JPEG and WebP only), the bounded "up to N KB" search runs instead
 *
 * -> { blob, width, height, mime, size, quality, target, preview, timings }
 *      quality  the quality actually used, or null for PNG
 *      target   null, or { requestedBytes, reached, attempts, floorSize }
 */
export async function processImage(request, env) {

    const started = env.now();

    /* the output size is checked before anything is decoded or allocated */
    const sizeCheck = checkOutputSize(request.width, request.height);

    if (!sizeCheck.ok) {
        throw new PipelineError("invalid-size", sizeCheck.message);
    }

    const { mime } = request;

    const bitmap = await decode(request.file, env);

    let canvas = null;

    try {

        if (bitmap.width * bitmap.height > MAX_INPUT_PIXELS) {
            throw new PipelineError("too-large", "This image has more pixels than can be processed safely.");
        }

        const decoded = env.now();

        canvas = env.createCanvas(request.width, request.height);

        const context = context2d(canvas);

        /* a transparent area must never come out black in a JPEG */
        if (mime === "image/jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, request.width, request.height);
        }

        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, request.width, request.height);

        const drawn = env.now();

        /* the decoded image is not needed again: let it go before encoding */
        bitmap.close();

        const encode = async (quality) => {

            const blob = await env.toBlob(canvas, mime, usesQuality(mime) ? quality / 100 : undefined);

            /* browsers answer PNG when asked for a type they cannot encode */
            if (!blob || blob.type !== mime) {
                throw new PipelineError("encoder-unavailable", MESSAGES.encoderUnavailable);
            }

            return { blob, size: blob.size };

        };

        let chosen;
        let qualityUsed = null;
        let target = null;
        let attempts = 1;

        if (usesQuality(mime) && request.targetBytes) {

            const search = await searchQuality({ targetBytes: request.targetBytes, encode });

            attempts = search.attempts.length;

            if (search.status === "reached") {

                chosen = search.best.result;
                qualityUsed = search.best.quality;

                target = { requestedBytes: request.targetBytes, reached: true, attempts, floorSize: null };

            } else {

                chosen = search.floor.result;
                qualityUsed = search.floor.quality;

                target = { requestedBytes: request.targetBytes, reached: false, attempts, floorSize: search.floor.size };

            }

        } else if (usesQuality(mime)) {

            qualityUsed = clampQuality(request.quality);

            chosen = await encode(qualityUsed);

        } else {

            chosen = await encode(0);

        }

        const encoded = env.now();

        const preview = await scaledPreview(canvas, request.width, request.height, env, Boolean(request.keepAlpha));

        return {
            blob: chosen.blob,
            width: request.width,
            height: request.height,
            mime,
            size: chosen.size,
            quality: qualityUsed,
            target,
            preview,
            timings: {
                decodeMs: Math.round(decoded - started),
                drawMs: Math.round(drawn - decoded),
                encodeMs: Math.round(encoded - drawn),
                totalMs: Math.round(env.now() - started),
                attempts
            }
        };

    } finally {

        bitmap.close();

        release(canvas);

    }

}
