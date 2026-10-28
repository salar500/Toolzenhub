/* =========================================================
   ToolZen Hub
   Photos to PDF: removing location and camera details from a JPEG

   A pure module (no browser API), so it runs in the page and in the
   Node tests. A JPEG file is a chain of segments before its picture
   data. Exif (camera, date, GPS position) and XMP live in an APP1
   segment, and IPTC (caption, credit, place) in an APP13 segment.
   stripJpegMetadata copies the file without those two kinds of segment
   and touches nothing else: the picture data, the colour profile (APP2),
   JFIF (APP0) and Adobe (APP14) segments are byte for byte as they were,
   so the picture and its colours do not change.

   Other segments (comments, vendor APP segments) are left alone, so this
   is not a claim that a file has no metadata left.
========================================================= */

const APP1 = 0xe1;
const APP13 = 0xed;
const SOS = 0xda;
const EOI = 0xd9;

function isStandalone(marker) {

    return marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8);

}

/*
 * Returns { bytes, removed } where `removed` lists { marker, length } for each dropped segment
 * (bytes is the same array when nothing was removed), or null when the file is not a JPEG chain
 * this module can read safely (no start marker, a segment that runs past the end, picture data
 * that never starts). A caller that gets null must not embed the original bytes as "cleaned".
 */
export function stripJpegMetadata(bytes) {

    if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        return null;
    }

    const kept = [[0, 2]];
    const removed = [];

    let i = 2;
    let reachedScan = false;

    while (i + 1 < bytes.length) {

        if (bytes[i] !== 0xff) {
            return null;
        }

        const marker = bytes[i + 1];

        if (marker === 0xff) {
            kept.push([i, i + 1]);
            i += 1;
            continue;
        }

        if (isStandalone(marker)) {
            kept.push([i, i + 2]);
            i += 2;
            continue;
        }

        if (marker === EOI) {
            kept.push([i, bytes.length]);
            reachedScan = true;
            break;
        }

        if (i + 3 >= bytes.length) {
            return null;
        }

        const length = (bytes[i + 2] << 8) | bytes[i + 3];

        if (length < 2 || i + 2 + length > bytes.length) {
            return null;
        }

        if (marker === SOS) {
            kept.push([i, bytes.length]);
            reachedScan = true;
            break;
        }

        if (marker === APP1 || marker === APP13) {
            removed.push({ marker, length: length + 2 });
        } else {
            kept.push([i, i + 2 + length]);
        }

        i += 2 + length;

    }

    if (!reachedScan) {
        return null;
    }

    if (removed.length === 0) {
        return { bytes, removed };
    }

    const total = kept.reduce((sum, [from, to]) => sum + (to - from), 0);
    const out = new Uint8Array(total);

    let at = 0;

    for (const [from, to] of kept) {
        out.set(bytes.subarray(from, to), at);
        at += to - from;
    }

    return { bytes: out, removed };

}
