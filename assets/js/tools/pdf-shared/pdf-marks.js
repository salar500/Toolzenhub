/* =========================================================
   ToolZen Hub
   PDF Tools: page numbers and a text watermark

   The rules (what a setting may be, how a page number reads, where a
   mark goes on a page that is turned) are pure and need no PDF library.
   `markPdf` stamps an open document; the library is passed in so these
   run in Node for the tests and in the browser for the tool.

   The marks use the standard Helvetica font, which holds the Western
   (Latin) alphabet only. Text outside it is refused with a plain
   message instead of being drawn as boxes or failing half way.
   Specification: docs/tool-packs/52-pdf-page-numbers-watermark.md
========================================================= */

import { openPdf, classifyError } from "./pdf-ops.js";

export const MARKED_SUFFIX = "-marked.pdf";
export const MARKED_FALLBACK_NAME = "marked.pdf";

export const NUMBER_FORMATS = Object.freeze([
    { id: "n", label: "1, 2, 3" },
    { id: "page-n", label: "Page 1, Page 2" },
    { id: "page-n-of-total", label: "Page 1 of 10" },
    { id: "n-of-total", label: "1 of 10" }
]);

export const POSITIONS = Object.freeze([
    { id: "bottom-center", label: "Bottom centre" },
    { id: "bottom-right", label: "Bottom right" },
    { id: "bottom-left", label: "Bottom left" },
    { id: "top-center", label: "Top centre" },
    { id: "top-right", label: "Top right" },
    { id: "top-left", label: "Top left" }
]);

export const LIMITS = Object.freeze({
    fontMin: 6,
    fontMax: 36,
    startMin: 1,
    startMax: 99999,
    watermarkMaxChars: 40,
    opacityMin: 5,
    opacityMax: 80
});

export const EDGE_MARGIN = 28;

export const DEFAULT_SETTINGS = Object.freeze({
    numbers: true,
    format: "page-n-of-total",
    position: "bottom-center",
    start: "1",
    skipFirst: false,
    numberSize: "10",
    watermark: false,
    watermarkText: "",
    watermarkAngle: "diagonal",
    watermarkOpacity: "20"
});

/* Latin-1 printable characters: what the standard font can draw */
export function isDrawableText(text) {
    return /^[\x20-\x7E\xA0-\xFF]*$/.test(text);
}

const wholeNumber = (text) => /^\d{1,6}$/.test(String(text).trim());

/*
 * Checks the settings. Returns { ok:true, settings } with numbers where
 * numbers belong, or { ok:false, errors:{ field: message }, general? }.
 */
export function checkSettings(raw) {

    const s = { ...DEFAULT_SETTINGS, ...(raw || {}) };
    const errors = {};

    if (!s.numbers && !s.watermark) {
        return { ok: false, errors: {}, general: "Turn on page numbers, a watermark or both." };
    }

    const out = { ...s };

    if (s.numbers) {

        if (!NUMBER_FORMATS.some((f) => f.id === s.format)) errors.format = "Choose how the page numbers read.";
        if (!POSITIONS.some((p) => p.id === s.position)) errors.position = "Choose where the page numbers go.";

        if (!wholeNumber(s.start) || Number(s.start) < LIMITS.startMin || Number(s.start) > LIMITS.startMax) {
            errors.start = `The first number must be a whole number from ${LIMITS.startMin} to ${LIMITS.startMax}.`;
        } else {
            out.start = Number(s.start);
        }

        if (!wholeNumber(s.numberSize) || Number(s.numberSize) < LIMITS.fontMin || Number(s.numberSize) > LIMITS.fontMax) {
            errors.numberSize = `The size must be a whole number from ${LIMITS.fontMin} to ${LIMITS.fontMax}.`;
        } else {
            out.numberSize = Number(s.numberSize);
        }

    }

    if (s.watermark) {

        const text = String(s.watermarkText).trim();

        if (text === "") {
            errors.watermarkText = "Write the watermark text.";
        } else if (text.length > LIMITS.watermarkMaxChars) {
            errors.watermarkText = `The watermark can be at most ${LIMITS.watermarkMaxChars} characters.`;
        } else if (!isDrawableText(text)) {
            errors.watermarkText = "The watermark can use letters, digits and common punctuation of the Western (Latin) alphabet. Other scripts are not supported yet.";
        } else {
            out.watermarkText = text;
        }

        if (!["diagonal", "horizontal"].includes(s.watermarkAngle)) errors.watermarkAngle = "Choose diagonal or horizontal.";

        if (!wholeNumber(s.watermarkOpacity) || Number(s.watermarkOpacity) < LIMITS.opacityMin || Number(s.watermarkOpacity) > LIMITS.opacityMax) {
            errors.watermarkOpacity = `The strength must be a whole number from ${LIMITS.opacityMin} to ${LIMITS.opacityMax}.`;
        } else {
            out.watermarkOpacity = Number(s.watermarkOpacity);
        }

    }

    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, settings: out };

}

/* The words of one page number. `index` is 0-based; the first number printed is `start`. */
export function numberText(format, index, start, total, skipFirst = false) {

    const shown = start + index - (skipFirst ? 1 : 0);
    const last = start + total - 1 - (skipFirst ? 1 : 0);

    switch (format) {
        case "n": return `${shown}`;
        case "page-n": return `Page ${shown}`;
        case "n-of-total": return `${shown} of ${last}`;
        default: return `Page ${shown} of ${last}`;
    }

}

/* Page number printed on page `index`, or null when this page is not numbered */
export function numberFor(index, settings, total) {

    if (settings.skipFirst && index === 0) return null;

    return numberText(settings.format, index, settings.start, total, settings.skipFirst);

}

/*
 * Where a point on the VISIBLE page lies in the page's own coordinates.
 * The visible page is the page after its /Rotate turn (clockwise). (vx, vy)
 * measure from the bottom-left corner of what a reader sees. `width` and
 * `height` are the page's own size (before the turn).
 */
export function visibleToPage(vx, vy, width, height, rotation) {

    switch (((rotation % 360) + 360) % 360) {
        case 90: return { x: width - vy, y: vx };
        case 180: return { x: width - vx, y: height - vy };
        case 270: return { x: vy, y: height - vx };
        default: return { x: vx, y: vy };
    }

}

/* the size of the page as a reader sees it */
export function visibleSize(width, height, rotation) {

    const turned = ((rotation % 360) + 360) % 360;

    return turned === 90 || turned === 270
        ? { width: height, height: width }
        : { width, height };

}

/* lower-left corner of a text line of the given size at a named position on the visible page */
export function numberAnchor(position, visWidth, visHeight, textWidth, size, margin = EDGE_MARGIN) {

    const [vertical, horizontal] = position.split("-");

    const x = horizontal === "left" ? margin
        : horizontal === "right" ? visWidth - margin - textWidth
            : (visWidth - textWidth) / 2;

    const y = vertical === "top" ? visHeight - margin - size : margin;

    return { x, y };

}

/*
 * Largest whole font size (at most 96, at least 12) at which the text, set
 * at the given visible angle, fits about 80% of the page's usable length.
 */
export function watermarkFontSize(widthAtOne, visWidth, visHeight, angle) {

    const usable = angle === 0
        ? visWidth * 0.8
        : Math.hypot(visWidth, visHeight) * 0.7;

    const size = Math.floor(usable / widthAtOne);

    return Math.max(12, Math.min(96, size));

}

/* lower-left anchor (visible coordinates) that centres a text line on the page at a visible angle in degrees */
export function watermarkAnchor(visWidth, visHeight, textWidth, size, angleDegrees) {

    const theta = (angleDegrees * Math.PI) / 180;
    const half = textWidth / 2;
    const rise = (size * 0.7) / 2;

    return {
        x: visWidth / 2 - half * Math.cos(theta) + rise * Math.sin(theta),
        y: visHeight / 2 - half * Math.sin(theta) - rise * Math.cos(theta)
    };

}

const nextTurn = () => new Promise((resolve) => setTimeout(resolve, 0));
const cancelled = (isCancelled) => typeof isCancelled === "function" && isCancelled();

/*
 * Adds the marks. `settings` must come from checkSettings. Returns
 * { bytes, pages, numbered, watermarked } or { cancelled:true }.
 */
export async function markPdf({ bytes, settings, pdfLib, onProgress, isCancelled, yieldBetween = true }) {

    let source;

    try {
        source = await openPdf(bytes, pdfLib);
    } catch (error) {
        throw classifyError(error, pdfLib);
    }

    const { doc, pageCount } = source;
    const { StandardFonts, rgb, degrees } = pdfLib;
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();

    let numbered = 0;

    for (let index = 0; index < pageCount; index += 1) {

        if (cancelled(isCancelled)) {
            return { cancelled: true };
        }

        if (typeof onProgress === "function") onProgress(index, pageCount);

        const page = pages[index];
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle;
        const visible = visibleSize(width, height, rotation);

        if (settings.watermark) {

            const angle = settings.watermarkAngle === "diagonal" ? 45 : 0;
            const size = watermarkFontSize(font.widthOfTextAtSize(settings.watermarkText, 1), visible.width, visible.height, angle);
            const textWidth = font.widthOfTextAtSize(settings.watermarkText, size);
            const anchor = watermarkAnchor(visible.width, visible.height, textWidth, size, angle);
            const at = visibleToPage(anchor.x, anchor.y, width, height, rotation);

            page.drawText(settings.watermarkText, {
                x: at.x,
                y: at.y,
                size,
                font,
                color: rgb(0.5, 0.5, 0.5),
                opacity: settings.watermarkOpacity / 100,
                rotate: degrees(angle + rotation)
            });

        }

        if (settings.numbers) {

            const label = numberFor(index, settings, pageCount);

            if (label !== null) {

                const size = settings.numberSize;
                const textWidth = font.widthOfTextAtSize(label, size);
                const anchor = numberAnchor(settings.position, visible.width, visible.height, textWidth, size);
                const at = visibleToPage(anchor.x, anchor.y, width, height, rotation);

                page.drawText(label, {
                    x: at.x,
                    y: at.y,
                    size,
                    font,
                    color: rgb(0.1, 0.1, 0.1),
                    rotate: degrees(rotation)
                });

                numbered += 1;

            }

        }

        if (yieldBetween && index % 10 === 9) await nextTurn();

    }

    if (cancelled(isCancelled)) {
        return { cancelled: true };
    }

    if (typeof onProgress === "function") onProgress(pageCount, pageCount);

    return {
        bytes: await doc.save({ useObjectStreams: false }),
        pages: pageCount,
        numbered,
        watermarked: settings.watermark ? pageCount : 0
    };

}

/* "report.pdf" -> "report-marked.pdf"; anything unusable falls back to a fixed name */
export function markedName(originalName) {

    const base = String(originalName || "")
        .replace(/\.pdf$/i, "")
        .replace(/[^A-Za-z0-9._ -]/g, "")
        .trim()
        .slice(0, 80);

    return base ? `${base}${MARKED_SUFFIX}` : MARKED_FALLBACK_NAME;

}
