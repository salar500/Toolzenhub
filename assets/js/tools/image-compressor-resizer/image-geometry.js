/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: rotate, flip and crop geometry

   Pure functions with no browser API. Everything is in whole pixels of
   the picture AS THE USER SEES IT (the EXIF turn is already applied by
   the browser's decoder), after the chosen rotate and flip:

     source picture  ->  rotate (clockwise quarter turns)  ->  flip
                     ->  crop rectangle  ->  scaled to the output size

   sourceMatrix() folds all of that into ONE canvas transform, so the
   output is drawn straight from the decoded picture: no full-size
   intermediate canvas, and nothing is ever cropped from a previous
   output. The preview and the final file use the same matrix.
========================================================= */

export const RATIOS = Object.freeze([
    { id: "free", label: "Free", w: 0, h: 0 },
    { id: "1:1", label: "1:1 (square)", w: 1, h: 1 },
    { id: "4:3", label: "4:3", w: 4, h: 3 },
    { id: "3:4", label: "3:4", w: 3, h: 4 },
    { id: "3:2", label: "3:2", w: 3, h: 2 },
    { id: "2:3", label: "2:3", w: 2, h: 3 },
    { id: "16:9", label: "16:9", w: 16, h: 9 },
    { id: "9:16", label: "9:16", w: 9, h: 16 },
    { id: "custom", label: "Custom", w: 0, h: 0 }
]);

export const TURN_WORDS = Object.freeze(["", "rotated 90 degrees right", "rotated 180 degrees", "rotated 90 degrees left"]);

export const cleanTurn = (turn) => (Number.isInteger(turn) ? ((turn % 4) + 4) % 4 : 0);

/* the size of the picture after a turn */
export function turnedSize(width, height, turn) {

    return cleanTurn(turn) % 2 === 1 ? { width: height, height: width } : { width, height };

}

/*
 * The largest rectangle of the shape ratioW:ratioH that fits inside width x height, centred, in whole
 * pixels. The size is rounded to the nearest pixel (never above the picture); the position is rounded down.
 */
export function ratioRect(width, height, ratioW, ratioH) {

    let w = width;
    let h = height;

    if (width * ratioH >= height * ratioW) {
        w = Math.min(width, Math.max(1, Math.round(height * ratioW / ratioH)));
    } else {
        h = Math.min(height, Math.max(1, Math.round(width * ratioH / ratioW)));
    }

    return { x: Math.floor((width - w) / 2), y: Math.floor((height - h) / 2), width: w, height: h };

}

/* a rectangle must be whole pixels, at least 1 x 1, and inside the picture: { ok } or { ok: false, message } */
export function validateRect(rect, width, height) {

    const { x, y, width: w, height: h } = rect ?? {};

    if (![x, y, w, h].every(Number.isInteger)) {
        return { ok: false, message: "Enter whole numbers of pixels." };
    }

    if (w < 1 || h < 1) {
        return { ok: false, message: "The crop must be at least 1 pixel wide and 1 pixel high." };
    }

    if (x < 0 || y < 0) {
        return { ok: false, message: "The crop cannot start before the left or top edge of the picture." };
    }

    if (x + w > width || y + h > height) {
        return { ok: false, message: `The crop must stay inside the picture, which is ${width} × ${height} pixels here.` };
    }

    return { ok: true };

}

/* move a rectangle by whole pixels, kept inside the picture */
export function moveRect(rect, dx, dy, width, height) {

    return {
        ...rect,
        x: Math.min(width - rect.width, Math.max(0, rect.x + Math.round(dx))),
        y: Math.min(height - rect.height, Math.max(0, rect.y + Math.round(dy)))
    };

}

/*
 * Drag one corner ("nw" | "ne" | "sw" | "se") by (dx, dy) source pixels; the opposite corner stays.
 * With `ratio` (width / height) the shape is kept. The result is inside the picture and at least 1 x 1.
 */
export function resizeRect(rect, corner, dx, dy, width, height, ratio = null) {

    const anchorX = corner.includes("w") ? rect.x + rect.width : rect.x;
    const anchorY = corner.includes("n") ? rect.y + rect.height : rect.y;

    let px = (corner.includes("w") ? rect.x : rect.x + rect.width) + Math.round(dx);
    let py = (corner.includes("n") ? rect.y : rect.y + rect.height) + Math.round(dy);

    px = Math.min(width, Math.max(0, px));
    py = Math.min(height, Math.max(0, py));

    let w = Math.max(1, Math.abs(px - anchorX));
    let h = Math.max(1, Math.abs(py - anchorY));

    const left = px < anchorX;
    const up = py < anchorY;

    if (ratio) {

        h = Math.max(1, Math.round(w / ratio));

        const roomX = left ? anchorX : width - anchorX;
        const roomY = up ? anchorY : height - anchorY;

        if (h > roomY) {
            h = roomY;
            w = Math.max(1, Math.round(h * ratio));
        }

        if (w > roomX) {
            w = roomX;
            h = Math.max(1, Math.round(w / ratio));
        }

    }

    return { x: left ? anchorX - w : anchorX, y: up ? anchorY - h : anchorY, width: w, height: h };

}


/* =========================================================
   One canvas transform for the whole edit
========================================================= */

/* [a, b, c, d, e, f] as canvas setTransform: x' = a x + c y + e, y' = b x + d y + f */
function compose(outer, inner) {

    const [a1, b1, c1, d1, e1, f1] = outer;
    const [a2, b2, c2, d2, e2, f2] = inner;

    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1
    ];

}

/*
 * The transform that draws the decoded source picture (width x height, upright) at (0, 0) into an
 * output canvas of outWidth x outHeight showing `crop` of the rotated and flipped picture.
 * Use: context.setTransform(...sourceMatrix(...)); context.drawImage(bitmap, 0, 0);
 * crop null means the whole turned picture.
 */
export function sourceMatrix({ width, height, turn = 0, flipH = false, flipV = false, crop = null, outWidth, outHeight }) {

    const t = cleanTurn(turn);
    const shown = turnedSize(width, height, t);

    let m = [
        [1, 0, 0, 1, 0, 0],
        [0, 1, -1, 0, height, 0],
        [-1, 0, 0, -1, width, height],
        [0, -1, 1, 0, 0, width]
    ][t];

    if (flipH) {
        m = compose([-1, 0, 0, 1, shown.width, 0], m);
    }

    if (flipV) {
        m = compose([1, 0, 0, -1, 0, shown.height], m);
    }

    const area = crop ?? { x: 0, y: 0, width: shown.width, height: shown.height };

    m = compose([1, 0, 0, 1, -area.x, -area.y], m);
    m = compose([outWidth / area.width, 0, 0, outHeight / area.height, 0, 0], m);

    return m;

}


/* =========================================================
   Words
========================================================= */

/*
 * What was done to the picture, for the result and the screen reader:
 * 'rotated 90 degrees right, flipped horizontally, cropped to 600 × 800 at 120, 40'; '' when nothing.
 */
export function describeEdit({ turn = 0, flipH = false, flipV = false, crop = null }) {

    const parts = [];

    if (cleanTurn(turn)) parts.push(TURN_WORDS[cleanTurn(turn)]);
    if (flipH) parts.push("flipped horizontally");
    if (flipV) parts.push("flipped vertically");
    if (crop) parts.push(`cropped to ${crop.width} × ${crop.height} at ${crop.x}, ${crop.y}`);

    return parts.join(", ");

}
