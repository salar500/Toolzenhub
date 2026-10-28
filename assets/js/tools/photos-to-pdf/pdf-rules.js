/* =========================================================
   ToolZen Hub
   Photos to PDF: the rules

   Pure functions and constants, no DOM and no PDF library: what a
   file may be, the limits, how a JPEG is read (size, colour model,
   EXIF turn), whether it can go into the PDF as it is, where it sits
   on the page, how the list is reordered and how messages are worded.
   The PDF itself is built in pdf-build.js, the pixel work is in
   image-prep.js and the page is index.js.
   See docs/tool-packs/31-photos-to-pdf.md.

   The limits are PROVISIONAL: no phone has been measured (spec,
   section 15). They are deliberately conservative.
========================================================= */

import {
    MAX_FILE_BYTES,
    MAX_INPUT_PIXELS,
    HEADER_BYTES,
    MAX_OUTPUT_PIXELS,
    MESSAGES,
    sniffFormat,
    refusalFor,
    readSize,
    checkFile,
    checkInputSize,
    formatBytes
} from "../image-compressor-resizer/image-engine.js";

export { MAX_FILE_BYTES, MAX_INPUT_PIXELS, HEADER_BYTES, formatBytes, sniffFormat };


/* =========================================================
   LIMITS
========================================================= */

export const MAX_IMAGES = 30;

/* what the browser may have to hold while the PDF is built: about twice this, plus the PDF itself */
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

/* a picture that must be redrawn (PNG, WebP, turned or unusual JPEG) is drawn at most this large */
export const REDRAW_MAX_PIXELS = MAX_OUTPUT_PIXELS;

export const REDRAW_QUALITY = 0.92;

export const THUMB_SIDE = 160;

export const FILE_NAME = "photos.pdf";


/* =========================================================
   PAGE SETTINGS
========================================================= */

export const PAGE_SIZES = Object.freeze({
    a4: Object.freeze({ id: "a4", label: "A4", width: 595.28, height: 841.89 }),
    letter: Object.freeze({ id: "letter", label: "US Letter", width: 612, height: 792 }),
    image: Object.freeze({ id: "image", label: "Same shape as each image", width: 0, height: 0 })
});

export const ORIENTATIONS = Object.freeze([
    Object.freeze({ id: "auto", label: "Automatic (follow each image)" }),
    Object.freeze({ id: "portrait", label: "Portrait" }),
    Object.freeze({ id: "landscape", label: "Landscape" })
]);

/* points (1/72 inch) */
export const MARGINS = Object.freeze({
    none: Object.freeze({ id: "none", label: "None", points: 0 }),
    small: Object.freeze({ id: "small", label: "Small (6 mm)", points: 18 }),
    medium: Object.freeze({ id: "medium", label: "Medium (13 mm)", points: 36 })
});

export const DEFAULT_SETTINGS = Object.freeze({ pageSize: "a4", orientation: "auto", margin: "small" });

/* the longest side of the picture area when each page takes the shape of its image (an A4 long edge) */
export const MATCH_LONG_SIDE = 841.89;

/* a valid settings object, with anything unknown replaced by the default */
export function cleanSettings(input = {}) {

    return {
        pageSize: Object.hasOwn(PAGE_SIZES, input.pageSize) ? input.pageSize : DEFAULT_SETTINGS.pageSize,
        orientation: ORIENTATIONS.some((o) => o.id === input.orientation) ? input.orientation : DEFAULT_SETTINGS.orientation,
        margin: Object.hasOwn(MARGINS, input.margin) ? input.margin : DEFAULT_SETTINGS.margin
    };

}

/*
 * The page and the picture on it, in points, with the PDF origin at the bottom left.
 * The picture is scaled to fit the picture area (a smaller one is enlarged), never cropped,
 * and centred.
 */
export function computeLayout(imageWidth, imageHeight, settingsInput) {

    const settings = cleanSettings(settingsInput);
    const margin = MARGINS[settings.margin].points;

    if (!(imageWidth > 0) || !(imageHeight > 0)) {
        throw new RangeError("Image size must be positive.");
    }

    if (settings.pageSize === "image") {

        const scale = MATCH_LONG_SIDE / Math.max(imageWidth, imageHeight);
        const width = imageWidth * scale;
        const height = imageHeight * scale;

        return { pageWidth: width + 2 * margin, pageHeight: height + 2 * margin, x: margin, y: margin, width, height };

    }

    const base = PAGE_SIZES[settings.pageSize];
    const landscape = settings.orientation === "landscape" || (settings.orientation === "auto" && imageWidth > imageHeight);
    const pageWidth = landscape ? base.height : base.width;
    const pageHeight = landscape ? base.width : base.height;

    const scale = Math.min((pageWidth - 2 * margin) / imageWidth, (pageHeight - 2 * margin) / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;

    return { pageWidth, pageHeight, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height };

}


/* =========================================================
   TURNING A PHOTO
========================================================= */

/*
 * `turn` is a clockwise quarter-turn count of 0 to 3 (0, 90, 180, 270 degrees). The picture is
 * never saved again to turn it: the page shows the same pixels, placed with a rotation, so quality
 * and size are unchanged.
 */
export const TURN_LABELS = Object.freeze(["Not rotated", "Rotated 90 degrees right", "Rotated 180 degrees", "Rotated 90 degrees left"]);

export function cleanTurn(turn) {

    return Number.isInteger(turn) ? ((turn % 4) + 4) % 4 : 0;

}

/* width and height of the photo as it looks after the turn */
export function turnedSize(width, height, turn) {

    return cleanTurn(turn) % 2 === 1 ? { width: height, height: width } : { width, height };

}

/*
 * Where and how to draw an upright picture so that it fills the box in `layout` (from
 * computeLayout, worked out for the TURNED size) turned clockwise by `turn` quarter-turns.
 * PDF coordinates grow upwards and drawImage's `rotateDegrees` is counter-clockwise about (x, y),
 * so a clockwise turn of 90 is -90 about the box's top-left corner.
 * Returns { x, y, width, height, rotateDegrees } for page.drawImage.
 */
export function placeTurned(layout, turn) {

    const left = layout.x;
    const bottom = layout.y;
    const w = layout.width;
    const h = layout.height;

    switch (cleanTurn(turn)) {

        case 1:
            return { x: left, y: bottom + h, width: h, height: w, rotateDegrees: -90 };

        case 2:
            return { x: left + w, y: bottom + h, width: w, height: h, rotateDegrees: 180 };

        case 3:
            return { x: left + w, y: bottom, width: h, height: w, rotateDegrees: 90 };

        default:
            return { x: left, y: bottom, width: w, height: h, rotateDegrees: 0 };

    }

}


/* =========================================================
   JPEG READING
========================================================= */

const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/* the sequential and progressive Huffman modes every PDF viewer reads */
const SAFE_SOF = new Set([0xc0, 0xc1, 0xc2]);

/*
 * What the PDF needs to know about a JPEG, read from its headers only:
 * { width, height, components, precision, sof, orientation (1 to 8, 1 when absent), adobeTransform (or null) },
 * or null when no frame header is found. Never throws on a damaged file.
 */
export function jpegInfo(bytes) {

    if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        return null;
    }

    let orientation = 1;
    let adobeTransform = null;
    let i = 2;

    while (i + 3 < bytes.length) {

        if (bytes[i] !== 0xff) {
            i += 1;
            continue;
        }

        const marker = bytes[i + 1];

        if (marker === 0xff) {
            i += 1;
            continue;
        }

        if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
            i += 2;
            continue;
        }

        if (marker === 0xd9 || marker === 0xda) {
            return null;
        }

        const length = (bytes[i + 2] << 8) | bytes[i + 3];

        if (length < 2) {
            return null;
        }

        const start = i + 4;

        if (SOF_MARKERS.has(marker)) {

            if (start + 6 > bytes.length) {
                return null;
            }

            return {
                precision: bytes[start],
                height: (bytes[start + 1] << 8) | bytes[start + 2],
                width: (bytes[start + 3] << 8) | bytes[start + 4],
                components: bytes[start + 5],
                sof: marker,
                orientation,
                adobeTransform
            };

        }

        if (marker === 0xe1 && length >= 16 && bytes[start] === 0x45 && bytes[start + 1] === 0x78 && bytes[start + 2] === 0x69 && bytes[start + 3] === 0x66 && bytes[start + 4] === 0 && bytes[start + 5] === 0) {
            orientation = exifOrientation(bytes, start + 6, Math.min(bytes.length, i + 2 + length)) ?? orientation;
        }

        if (marker === 0xee && length >= 14 && bytes[start] === 0x41 && bytes[start + 1] === 0x64 && bytes[start + 2] === 0x6f && bytes[start + 3] === 0x62 && bytes[start + 4] === 0x65) {
            adobeTransform = bytes[start + 11];
        }

        i += 2 + length;

    }

    return null;

}

/* the EXIF Orientation (1 to 8) from a TIFF block starting at `start`, or null */
function exifOrientation(bytes, start, end) {

    if (end - start < 12) {
        return null;
    }

    const little = bytes[start] === 0x49 && bytes[start + 1] === 0x49;
    const big = bytes[start] === 0x4d && bytes[start + 1] === 0x4d;

    if (!little && !big) {
        return null;
    }

    const u16 = (p) => (p + 1 < end ? (little ? bytes[p] | (bytes[p + 1] << 8) : (bytes[p] << 8) | bytes[p + 1]) : null);
    const u32 = (p) => (p + 3 < end ? (little ? (bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16) | (bytes[p + 3] << 24)) >>> 0 : ((bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3]) >>> 0) : null);

    if (u16(start + 2) !== 0x2a) {
        return null;
    }

    const ifd = u32(start + 4);

    if (ifd === null) {
        return null;
    }

    const first = start + ifd;
    const entries = u16(first);

    if (entries === null || entries > 256) {
        return null;
    }

    for (let n = 0; n < entries; n += 1) {

        const entry = first + 2 + n * 12;

        if (u16(entry) === 0x0112) {

            const value = u16(entry + 8);

            return value >= 1 && value <= 8 ? value : null;

        }

    }

    return null;

}

/*
 * "keep": the original bytes go into the PDF unchanged (no quality loss, no size growth).
 * "redraw": the browser decodes the picture and it is saved again as a JPEG.
 * A redraw is needed for every non-JPEG, a JPEG that is turned by EXIF (a PDF viewer would show
 * it sideways), and a JPEG the PDF cannot take as it is (not 8-bit, not one or three colour
 * channels, not Huffman, or RGB marked as such by an Adobe header).
 */
export function embedStrategy(format, info) {

    if (format !== "jpeg" || !info) {
        return "redraw";
    }

    if (info.orientation !== 1 || info.precision !== 8 || !SAFE_SOF.has(info.sof)) {
        return "redraw";
    }

    if (info.components !== 1 && info.components !== 3) {
        return "redraw";
    }

    if (info.components === 3 && info.adobeTransform === 0) {
        return "redraw";
    }

    return "keep";

}

/* the size a redraw uses: the stored size, reduced if it would exceed the redraw limit */
export function redrawSize(width, height) {

    const pixels = width * height;

    if (pixels <= REDRAW_MAX_PIXELS) {
        return { width, height, reduced: false };
    }

    const scale = Math.sqrt(REDRAW_MAX_PIXELS / pixels);

    return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), reduced: true };

}


/* =========================================================
   FILES
========================================================= */

/*
 * The first bytes of a file: is it a picture this tool takes? Never trusts the name or the label.
 * { ok: true, format, width, height } or { ok: false, message }
 */
export function checkHeader(bytes) {

    const format = sniffFormat(bytes);
    const refusal = refusalFor(format);

    if (refusal) {
        return { ok: false, message: refusal };
    }

    const size = readSize(bytes, format);

    if (!size) {
        return { ok: false, message: MESSAGES.undecodable };
    }

    const input = checkInputSize(size.width, size.height);

    if (input && input.ok === false) {
        return { ok: false, message: input.message };
    }

    return { ok: true, format, width: size.width, height: size.height };

}

/*
 * Which of the chosen files fit, given what is already listed. Decided in order:
 * { accepted: [index], rejected: [{ name, message }] }. Sizes only; the content is checked later.
 */
export function planAdditions(listedSizes, candidates) {

    const accepted = [];
    const rejected = [];

    let count = listedSizes.length;
    let total = listedSizes.reduce((sum, size) => sum + size, 0);

    candidates.forEach((file, index) => {

        const verdict = checkFile(file);

        if (!verdict.ok) {
            rejected.push({ name: file.name, message: verdict.message });
            return;
        }

        if (count >= MAX_IMAGES) {
            rejected.push({ name: file.name, message: `Not added: a PDF can have up to ${MAX_IMAGES} photos here. Create this PDF first, then make another.` });
            return;
        }

        if (total + file.size > MAX_TOTAL_BYTES) {
            rejected.push({ name: file.name, message: `Not added: the photos together would pass ${formatBytes(MAX_TOTAL_BYTES)}, which is the most this page handles at once. Remove a photo or make a second PDF.` });
            return;
        }

        accepted.push(index);
        count += 1;
        total += file.size;

    });

    return { accepted, rejected };

}

/* a new array with the item at `index` moved by `delta` places (clamped, never out of range) */
export function moveItem(list, index, delta) {

    const target = Math.min(list.length - 1, Math.max(0, index + delta));

    if (index < 0 || index >= list.length || target === index) {
        return list.slice();
    }

    const next = list.slice();
    const [item] = next.splice(index, 1);

    next.splice(target, 0, item);

    return next;

}

/* a few rejection lines for one message: the first five, then a count */
export function summariseRejections(rejected) {

    const shown = rejected.slice(0, 5).map((r) => `${r.name}: ${r.message}`);

    if (rejected.length > 5) {
        shown.push(`${rejected.length - 5} more files were not added.`);
    }

    return shown;

}

export function describeResult({ pages, bytes, redrawn, reduced }) {

    const parts = [`${pages} ${pages === 1 ? "page" : "pages"}, ${formatBytes(bytes)}.`];

    if (redrawn > 0) {
        parts.push(`${redrawn} ${redrawn === 1 ? "photo was" : "photos were"} saved again as JPEG to fit (PNG or WebP, a turned photo or an unusual JPEG); transparent areas became white.`);
    }

    if (reduced > 0) {
        parts.push(`${reduced} ${reduced === 1 ? "photo was" : "photos were"} reduced in size to keep the page responsive.`);
    }

    return parts.join(" ");

}
