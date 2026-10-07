/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: the engine (pure, no DOM)

   Everything that can be decided without decoding pixels lives
   here so it can be tested without a browser: what a file IS (by
   its bytes), how big it claims to be (read from its header, so
   an enormous image is refused before it is decoded), the limits,
   resize arithmetic, which output formats are allowed, the bounded
   quality search for "up to N KB", file names and the wording of
   the result. The rules are frozen in
   docs/tool-packs/20-image-compressor-resizer.md.

   The pixel work (decode, draw, encode) is in image-pipeline.js.
========================================================= */

/* =========================================================
   Limits (guardrails, not targets: lower them, never raise them
   because a desktop browser coped)
========================================================= */

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 40_000_000;
export const MAX_INPUT_SIDE = 16384;
export const MAX_OUTPUT_SIDE = 8192;
export const MAX_OUTPUT_PIXELS = 16_777_216;

/* the part of a file read to learn its type and size without decoding it */
export const HEADER_BYTES = 2 * 1024 * 1024;

export const QUALITY_MIN = 30;
export const QUALITY_MAX = 95;
export const QUALITY_DEFAULT = 80;

export const QUALITY_PRESETS = Object.freeze([
    { id: "high", label: "High quality", quality: 90 },
    { id: "balanced", label: "Balanced", quality: 80 },
    { id: "smaller", label: "Smaller file", quality: 60 }
]);

export const TARGET_MIN_KB = 10;
export const TARGET_MAX_KB = 20000;
export const TARGET_ATTEMPTS = 8;

export const PREVIEW_SIDE = 640;
export const ALPHA_BAND_ROWS = 256;

export const FORMATS = Object.freeze({
    "image/jpeg": { label: "JPEG", extension: "jpg" },
    "image/png": { label: "PNG", extension: "png" },
    "image/webp": { label: "WebP", extension: "webp" }
});

export const MESSAGES = Object.freeze({
    undecodable: "This file could not be decoded as a supported image.",
    heic: "HEIC/HEIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first.",
    gif: "GIF isn't supported because this tool does not preserve animation.",
    avif: "AVIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first.",
    svg: "SVG isn't supported. This tool works on JPEG, PNG and WebP photos and screenshots.",
    unsupported: "This file isn't a JPEG, PNG or WebP image.",
    many: "Please add one image at a time.",
    empty: "This file is empty.",
    jpegNoAlpha: "JPEG doesn't support transparency. Keep PNG or use WebP.",
    pngNote: "PNG is lossless here; reduce dimensions or choose WebP/JPEG for smaller files.",
    limited: "This image is larger than the 8,192 pixel or 16.7 megapixel output limit, so the size starts reduced to fit.",
    stretch: "Changing width and height independently may stretch the image.",
    enlarge: "Enlarging an image does not create new detail.",
    qualityHelp: "Higher values usually preserve more detail but may produce a larger file.",
    metadata: "Re-encoding normally removes embedded camera metadata, such as location.",
    encoderUnavailable: "This browser could not encode that format. Choose another output format.",
    failed: "The image could not be processed. Try a smaller size or another format."
});

const nf = (n) => n.toLocaleString("en-US");


/* =========================================================
   What a file is, by its bytes
========================================================= */

const ascii = (bytes, from, length) => {

    let out = "";

    for (let i = from; i < from + length && i < bytes.length; i++) {
        out += String.fromCharCode(bytes[i]);
    }

    return out;

};

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1", "heif"]);
const AVIF_BRANDS = new Set(["avif", "avis"]);

/*
 * "jpeg" | "png" | "webp" (supported), "gif" | "heic" | "avif" | "svg" (named, refused), or "unknown".
 * The file name and the label the browser attached are never consulted.
 */
export function sniffFormat(bytes) {

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "jpeg";
    }

    if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
        return "png";
    }

    if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
        return "webp";
    }

    if (bytes.length >= 6 && (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a")) {
        return "gif";
    }

    if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {

        const brand = ascii(bytes, 8, 4);

        if (HEIC_BRANDS.has(brand)) return "heic";
        if (AVIF_BRANDS.has(brand)) return "avif";

    }

    /* SVG is text: look past a byte order mark, whitespace and an XML declaration */
    const head = ascii(bytes, 0, Math.min(bytes.length, 2048)).replace(/^\xEF\xBB\xBF/, "").trimStart().toLowerCase();

    if (/^(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[^>]*>\s*)?<svg[\s>]/.test(head)) {
        return "svg";
    }

    return "unknown";

}

export const MIME_OF = Object.freeze({ jpeg: "image/jpeg", png: "image/png", webp: "image/webp" });

/* the message for a refused format, or null when the format is supported */
export function refusalFor(format) {

    if (format === "jpeg" || format === "png" || format === "webp") return null;
    if (format === "heic") return MESSAGES.heic;
    if (format === "gif") return MESSAGES.gif;
    if (format === "avif") return MESSAGES.avif;
    if (format === "svg") return MESSAGES.svg;

    /* a file that is not recognisably an image at all: the browser could not decode it either */
    return MESSAGES.undecodable;

}


/* =========================================================
   Size from the header (no decoding)
========================================================= */

const u16be = (b, i) => (b[i] << 8) | b[i + 1];
const u32be = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const u24le = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);

function jpegSize(b) {

    let i = 2;

    while (i + 3 < b.length) {

        if (b[i] !== 0xff) {
            return null;
        }

        while (b[i] === 0xff) i++;

        const marker = b[i++];

        if (marker === 0xd9 || marker === 0xda) {
            return null;
        }

        /* markers with no length */
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
            continue;
        }

        const length = u16be(b, i);

        /* start of frame, not the Huffman, arithmetic or reserved markers that share the range */
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {

            if (i + 7 > b.length) return null;

            return { width: u16be(b, i + 5), height: u16be(b, i + 3) };

        }

        i += length;

    }

    return null;

}

function pngSize(b) {

    if (b.length < 26 || ascii(b, 12, 4) !== "IHDR") {
        return null;
    }

    return { width: u32be(b, 16), height: u32be(b, 20) };

}

function webpSize(b) {

    if (b.length < 30) {
        return null;
    }

    const kind = ascii(b, 12, 4);

    if (kind === "VP8X") {
        return { width: u24le(b, 24) + 1, height: u24le(b, 27) + 1 };
    }

    if (kind === "VP8 ") {

        if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;

        return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };

    }

    if (kind === "VP8L") {

        if (b[20] !== 0x2f) return null;

        const bits = (b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24)) >>> 0;

        return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };

    }

    return null;

}

/* { width, height } as stored in the file (before any EXIF turn), or null when it cannot be read */
export function readSize(bytes, format) {

    const size = format === "jpeg" ? jpegSize(bytes) : format === "png" ? pngSize(bytes) : format === "webp" ? webpSize(bytes) : null;

    return size && size.width > 0 && size.height > 0 ? size : null;

}

/*
 * Can the image have transparency? "none" is certain; "possible" means the header allows an alpha
 * channel (the pixels are then scanned). Unknown is "possible": never guess in the unsafe direction.
 */
export function inspectAlpha(bytes, format) {

    if (format === "jpeg") {
        return "none";
    }

    if (format === "png") {

        if (bytes.length < 26) return "possible";

        const colorType = bytes[25];

        if (colorType === 4 || colorType === 6) return "possible";

        let i = 8;

        while (i + 8 <= bytes.length) {

            const length = u32be(bytes, i);
            const type = ascii(bytes, i + 4, 4);

            if (type === "tRNS") return "possible";
            if (type === "IDAT") return "none";

            i += 12 + length;

        }

        return "possible";

    }

    if (format === "webp") {

        const kind = ascii(bytes, 12, 4);

        if (kind === "VP8 ") return "none";

        if (kind === "VP8L") {

            if (bytes.length < 25) return "possible";

            const bits = (bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24)) >>> 0;

            return (bits >>> 28) & 1 ? "possible" : "none";

        }

        if (kind === "VP8X") {

            if ((bytes[20] & 0x10) !== 0) return "possible";

            /* no alpha flag, but an ALPH chunk anywhere would still mean alpha */
            for (let i = 30; i + 8 <= bytes.length;) {

                const type = ascii(bytes, i, 4);

                if (type === "ALPH") return "possible";
                if (type === "VP8 " || type === "VP8L") return "none";

                i += 8 + u32be(bytes, i + 4) + (u32be(bytes, i + 4) & 1);

            }

            return "none";

        }

    }

    return "possible";

}


/* =========================================================
   Limits, checked early
========================================================= */

/* the file as the browser reports it, before reading a byte of it */
export function checkFile(file) {

    if (!file || typeof file.size !== "number") {
        return { ok: false, message: MESSAGES.unsupported };
    }

    if (file.size === 0) {
        return { ok: false, message: MESSAGES.empty };
    }

    if (file.size > MAX_FILE_BYTES) {
        return { ok: false, message: `This file is ${formatBytes(file.size)}, over the ${formatBytes(MAX_FILE_BYTES)} limit. Choose a smaller image or reduce it elsewhere first.` };
    }

    return { ok: true };

}

/* the stored size, before decoding: refuse what would need too much memory */
export function checkInputSize(width, height) {

    if (width > MAX_INPUT_SIDE || height > MAX_INPUT_SIDE) {
        return { ok: false, message: `This image is ${nf(width)} × ${nf(height)} pixels. The limit is ${nf(MAX_INPUT_SIDE)} pixels on a side.` };
    }

    if (width * height > MAX_INPUT_PIXELS) {
        return { ok: false, message: `This image is ${(width * height / 1e6).toFixed(1)} megapixels. The limit is ${MAX_INPUT_PIXELS / 1e6} megapixels, so it can't be processed safely on every device. Reduce it elsewhere first, or use a lower-resolution photo.` };
    }

    return { ok: true };

}

/* a requested output size, before any output canvas is allocated */
export function checkOutputSize(width, height) {

    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
        return { ok: false, message: "The new width and height must be whole pixels of at least 1." };
    }

    if (width > MAX_OUTPUT_SIDE || height > MAX_OUTPUT_SIDE) {
        return { ok: false, message: `The new size can't be more than ${nf(MAX_OUTPUT_SIDE)} pixels on a side.` };
    }

    if (width * height > MAX_OUTPUT_PIXELS) {
        return { ok: false, message: `The new size can't be more than ${(MAX_OUTPUT_PIXELS / 1e6).toFixed(1)} megapixels.` };
    }

    return { ok: true };

}


/* =========================================================
   Resize arithmetic
========================================================= */

const clampMin1 = (n) => Math.max(1, n);

export const heightFromWidth = (width, originalWidth, originalHeight) => clampMin1(Math.round(width * originalHeight / originalWidth));
export const widthFromHeight = (height, originalWidth, originalHeight) => clampMin1(Math.round(height * originalWidth / originalHeight));

/* the size an image starts at: its own, unless that is more than can be output, then the largest that fits */
export function fitToOutputLimits(width, height) {

    if (checkOutputSize(width, height).ok) {
        return { width, height };
    }

    const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(width, height), Math.sqrt(MAX_OUTPUT_PIXELS / (width * height)));

    let w = Math.max(1, Math.floor(width * scale));
    let h = heightFromWidth(w, width, height);

    while (!checkOutputSize(w, h).ok && w > 1) {
        w -= 1;
        h = heightFromWidth(w, width, height);
    }

    return { width: w, height: h };

}

/*
 * A dimension typed by a person: whole pixels only. No decimals, signs, exponents or text.
 * { ok: true, value } or { ok: false, message }
 */
export function parseDimension(text, label) {

    const raw = String(text ?? "").trim();

    if (!/^\d+$/.test(raw)) {
        return { ok: false, message: `Enter the ${label} as a whole number of pixels, such as 1200.` };
    }

    const value = Number(raw);

    if (!Number.isSafeInteger(value) || value < 1) {
        return { ok: false, message: `The ${label} must be at least 1 pixel.` };
    }

    if (value > MAX_OUTPUT_SIDE) {
        return { ok: false, message: `The ${label} can't be more than ${nf(MAX_OUTPUT_SIDE)} pixels.` };
    }

    return { ok: true, value };

}

export const RESIZE_PRESETS = Object.freeze([
    { id: "original", label: "Original size" },
    { id: "75", label: "75%" },
    { id: "50", label: "50%" },
    { id: "long1920", label: "Long side 1920" },
    { id: "long1280", label: "Long side 1280" }
]);

/* the size a preset gives, or null when the preset would enlarge the image (it is then not offered) */
export function presetSize(id, width, height) {

    if (id === "original") {
        return { width, height };
    }

    if (id === "75" || id === "50") {

        const scale = Number(id) / 100;

        return { width: clampMin1(Math.round(width * scale)), height: clampMin1(Math.round(height * scale)) };

    }

    if (id === "long1920" || id === "long1280") {

        const side = id === "long1920" ? 1920 : 1280;
        const longest = Math.max(width, height);

        if (longest <= side) {
            return null;
        }

        return width >= height
            ? { width: side, height: heightFromWidth(side, width, height) }
            : { width: widthFromHeight(side, width, height), height: side };

    }

    return null;

}


/* =========================================================
   Output format rules
========================================================= */

/*
 * alpha: "none" (certain), "possible" (header allows it, not yet scanned), "yes", "no" (scanned)
 * supported: { jpeg, webp, png } what this browser can encode
 *
 * Returns [{ mime, label, disabled, reason }] in a stable order. JPEG is disabled for anything that
 * may have transparency (it would turn black or white); WebP is hidden when it cannot be encoded.
 */
export function outputChoices({ inputMime, alpha, supported }) {

    const choices = [];

    const mayHaveAlpha = alpha === "possible" || alpha === "yes";

    for (const mime of ["image/jpeg", "image/webp", "image/png"]) {

        const key = FORMATS[mime].label.toLowerCase();

        if (supported && supported[key] === false) {
            continue;
        }

        const isOriginal = mime === inputMime;

        const choice = {
            mime,
            label: `${FORMATS[mime].label}${isOriginal ? " (original format)" : ""}`,
            disabled: false,
            reason: ""
        };

        if (mime === "image/jpeg" && mayHaveAlpha) {
            choice.disabled = true;
            choice.reason = alpha === "possible" ? "Checking for transparency…" : MESSAGES.jpegNoAlpha;
        }

        choices.push(choice);

    }

    return choices;

}

/* the format to select first: the original's when it can be used, else the first usable one */
export function defaultOutput(inputMime, choices) {

    const same = choices.find((choice) => choice.mime === inputMime && !choice.disabled);

    return (same ?? choices.find((choice) => !choice.disabled))?.mime ?? "image/png";

}

export const usesQuality = (mime) => mime === "image/jpeg" || mime === "image/webp";

export function clampQuality(value) {

    const n = Math.round(Number(value));

    if (Number.isNaN(n)) {
        return QUALITY_DEFAULT;
    }

    return Math.min(QUALITY_MAX, Math.max(QUALITY_MIN, n));

}

/* "Up to N KB": whole kilobytes inside a sensible range */
export function parseTargetKB(text) {

    const raw = String(text ?? "").trim();

    if (!/^\d+$/.test(raw)) {
        return { ok: false, message: "Enter the most you want, in whole KB, such as 500." };
    }

    const value = Number(raw);

    if (value < TARGET_MIN_KB || value > TARGET_MAX_KB) {
        return { ok: false, message: `Choose between ${nf(TARGET_MIN_KB)} and ${nf(TARGET_MAX_KB)} KB.` };
    }

    return { ok: true, value, bytes: value * 1024 };

}


/* =========================================================
   "Up to N KB": a bounded search over quality
========================================================= */

/*
 * encode(quality) -> Promise<{ size, ...anything }>. At most `maxAttempts` encodes:
 *   1. the highest quality (done if it already fits),
 *   2. the lowest quality (if even that does not fit, stop: dimensions are the problem),
 *   3. bisection between them on whole numbers.
 * Encoder output size is not strictly monotonic in quality, so the best valid result seen (the highest
 * quality at or under the target) is the answer, not the last one tried.
 *
 * { status: "reached", best: { quality, size, result }, attempts }
 * { status: "unreachable", floor: { quality, size, result }, attempts }
 */
export async function searchQuality({ targetBytes, encode, min = QUALITY_MIN, max = QUALITY_MAX, maxAttempts = TARGET_ATTEMPTS }) {

    const attempts = [];

    let best = null;

    const attempt = async (quality) => {

        const result = await encode(quality);

        attempts.push({ quality, size: result.size });

        if (result.size <= targetBytes && (best === null || quality > best.quality)) {
            best = { quality, size: result.size, result };
        }

        return result;

    };

    const top = await attempt(max);

    if (top.size <= targetBytes) {
        return { status: "reached", best, attempts };
    }

    const floor = await attempt(min);

    if (floor.size > targetBytes) {
        return { status: "unreachable", floor: { quality: min, size: floor.size, result: floor }, attempts };
    }

    let low = min;
    let high = max;

    while (high - low > 1 && attempts.length < maxAttempts) {

        const middle = Math.floor((low + high) / 2);

        const result = await attempt(middle);

        if (result.size <= targetBytes) {
            low = middle;
        } else {
            high = middle;
        }

    }

    return { status: "reached", best, attempts };

}


/* =========================================================
   Wording: sizes, change, file names
========================================================= */

export function formatBytes(bytes) {

    if (bytes < 1024) {
        return `${bytes} ${bytes === 1 ? "byte" : "bytes"}`;
    }

    if (bytes < 1024 * 1024) {

        const kb = bytes / 1024;

        return kb < 10 ? `${kb.toFixed(1)} KB` : `${nf(Math.round(kb))} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}

export const formatDimensions = (width, height) => `${nf(width)} × ${nf(height)}`;

/*
 * How the output compares with the original, in words. Never a negative "reduction":
 * { kind: "smaller" | "larger" | "same", text, detail }
 */
export function describeChange(originalBytes, outputBytes) {

    const difference = originalBytes - outputBytes;

    if (difference === 0) {
        return { kind: "same", text: "Same size as the original.", detail: "" };
    }

    const amount = formatBytes(Math.abs(difference));

    const percent = Math.abs(difference) / originalBytes * 100;

    const shown = percent < 1 ? "less than 1%" : `${Math.round(percent)}%`;

    if (difference > 0) {
        return { kind: "smaller", text: `Reduced by ${amount} (${shown}).`, detail: "" };
    }

    return {
        kind: "larger",
        text: `Larger by ${amount} (${shown}).`,
        detail: `Output is ${amount} larger than the original.`
    };

}

/* a name safe to show and to save: no path, no reserved characters, no extension, never empty */
export function safeBaseName(name) {

    let base = String(name ?? "");

    base = base.split(/[\\/]/).pop();

    base = base.replace(/\.[A-Za-z0-9]{1,5}$/, "").replace(/[\t\n\r\v\f]+/g, " ");

    base = base.replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "").replace(/\s+/g, " ").replace(/^[.\s]+|[.\s]+$/g, "");

    if (base.length > 80) {
        base = base.slice(0, 80).trim();
    }

    return base === "" ? "image" : base;

}

export const extensionFor = (mime) => FORMATS[mime]?.extension ?? "bin";

/* "holiday.jpg" -> "holiday-compressed.webp"; the extension always matches the bytes */
export function outputFileName(originalName, mime, resized) {

    return `${safeBaseName(originalName)}-${resized ? "resized" : "compressed"}.${extensionFor(mime)}`;

}


/* =========================================================
   A late answer must never overwrite a newer choice
========================================================= */

export function createOperationTracker() {

    let current = 0;

    return {
        begin() {
            current += 1;
            return current;
        },
        invalidate() {
            current += 1;
        },
        isCurrent(id) {
            return id === current;
        }
    };

}
