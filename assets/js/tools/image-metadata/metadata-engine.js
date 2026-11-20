/* =========================================================
   ToolZen Hub
   Photo Metadata Viewer and Remover: the engine (Tool Pack 57)

   A pure module (no browser API): it reads what a JPEG or PNG
   carries besides its picture, and writes a copy without it.
   The picture data is never decoded or re-encoded; it is copied
   byte for byte, so the picture and its colours do not change.

   JPEG removal is the one already used by Photos to PDF
   (photos-to-pdf/jpeg-segments.js), so both tools remove the
   same things. PNG removal drops the text, eXIf and tIME chunks
   and copies every other chunk with its own CRC.

   Every read is bounds-checked: a file this module cannot read
   safely is reported as unreadable, never offered as cleaned.
========================================================= */

import { stripJpegMetadata } from "../photos-to-pdf/jpeg-segments.js";

export const LIMITS = Object.freeze({ files: 20, bytes: 25 * 1024 * 1024 });

const text = (bytes) => new TextDecoder("utf-8", { fatal: false }).decode(bytes);
const latin1 = (bytes) => String.fromCharCode(...bytes);
const startsWith = (bytes, at, s) => [...s].every((c, k) => bytes[at + k] === c.charCodeAt(0));

/** What the bytes are, whatever the file name says: "jpeg", "png", "webp", "gif", "heic", "avif" or null. */
export function sniff(bytes) {
    if (!bytes || bytes.length < 12) return null;
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
    if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, k) => bytes[k] === b)) return "png";
    if (startsWith(bytes, 0, "RIFF") && startsWith(bytes, 8, "WEBP")) return "webp";
    if (startsWith(bytes, 0, "GIF8")) return "gif";
    if (startsWith(bytes, 4, "ftyp")) {
        const brand = latin1(bytes.subarray(8, 12));
        if (/^avi[fs]$/.test(brand)) return "avif";
        if (/^(heic|heix|hevc|mif1|msf1)$/.test(brand)) return "heic";
    }
    return null;
}


/* =========================================================
   EXIF (a small TIFF structure)
========================================================= */

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
const MAX_ENTRIES = 512;

/**
 * Reads the fields this tool shows from an Exif/TIFF block (`bytes` from `start` to `end`).
 * Returns null when the block is not a TIFF structure that can be read safely.
 */
export function readExif(bytes, start = 0, end = bytes.length) {

    try {

        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const order = latin1(bytes.subarray(start, start + 2));
        if (order !== "II" && order !== "MM") return null;
        const le = order === "II";
        const at = (offset, size) => {
            const o = start + offset;
            if (offset < 0 || o + size > end) throw new RangeError("outside the block");
            return o;
        };
        const u16 = (offset) => view.getUint16(at(offset, 2), le);
        const u32 = (offset) => view.getUint32(at(offset, 4), le);
        const s32 = (offset) => view.getInt32(at(offset, 4), le);
        if (u16(2) !== 42) return null;

        function ifd(offset) {
            const entries = new Map();
            if (!offset) return entries;
            const count = u16(offset);
            if (count > MAX_ENTRIES) throw new RangeError("too many entries");
            for (let k = 0; k < count; k++) {
                const e = offset + 2 + k * 12;
                const tag = u16(e);
                const type = u16(e + 2);
                const n = u32(e + 4);
                const size = (TYPE_SIZE[type] ?? 0) * n;
                if (!size) continue;
                const valueAt = size <= 4 ? e + 8 : u32(e + 8);
                at(valueAt, size);
                entries.set(tag, { type, n, valueAt });
            }
            return entries;
        }

        function value(entries, tag) {
            const e = entries.get(tag);
            if (!e) return null;
            const { type, n, valueAt } = e;
            if (type === 2) return text(bytes.subarray(start + valueAt, start + valueAt + n)).replace(/\0+$/, "").trim() || null;
            const list = [];
            for (let k = 0; k < Math.min(n, 16); k++) {
                if (type === 1 || type === 7) list.push(bytes[start + valueAt + k]);
                else if (type === 3) list.push(u16(valueAt + k * 2));
                else if (type === 4) list.push(u32(valueAt + k * 4));
                else if (type === 9) list.push(s32(valueAt + k * 4));
                else if (type === 5) { const d = u32(valueAt + k * 8 + 4); list.push(d ? u32(valueAt + k * 8) / d : NaN); }
                else if (type === 10) { const d = s32(valueAt + k * 8 + 4); list.push(d ? s32(valueAt + k * 8) / d : NaN); }
            }
            return list;
        }

        const ifd0 = ifd(u32(4));
        const exifIfd = ifd(value(ifd0, 0x8769)?.[0] ?? 0);
        const gpsIfd = ifd(value(ifd0, 0x8825)?.[0] ?? 0);

        const coordinate = (tag, refTag, negative) => {
            const v = value(gpsIfd, tag);
            const ref = value(gpsIfd, refTag);
            if (!v || v.length < 3 || v.some((x) => !Number.isFinite(x))) return null;
            const deg = v[0] + v[1] / 60 + v[2] / 3600;
            return Math.round((ref === negative ? -deg : deg) * 1e6) / 1e6;
        };

        const latitude = coordinate(2, 1, "S");
        const longitude = coordinate(4, 3, "W");
        const altitudeValue = value(gpsIfd, 6)?.[0];
        const altitudeRef = value(gpsIfd, 5)?.[0] ?? 0;

        return {
            make: value(ifd0, 0x010f),
            model: value(ifd0, 0x0110),
            software: value(ifd0, 0x0131),
            dateTime: value(ifd0, 0x0132),
            artist: value(ifd0, 0x013b),
            copyright: value(ifd0, 0x8298),
            orientation: value(ifd0, 0x0112)?.[0] ?? null,
            dateTaken: value(exifIfd, 0x9003),
            lens: value(exifIfd, 0xa434),
            owner: value(exifIfd, 0xa430),
            serial: value(exifIfd, 0xa431),
            gps: latitude !== null && longitude !== null
                ? { latitude, longitude, altitude: Number.isFinite(altitudeValue) ? (altitudeRef === 1 ? -altitudeValue : altitudeValue) : null }
                : (gpsIfd.size ? { latitude: null, longitude: null, altitude: null } : null)
        };

    } catch {
        return null;
    }

}

/** True when an Exif reading holds anything that identifies a person, a device, a time or a place. */
export function exifIdentifies(exif) {
    return !!exif && !!(exif.make || exif.model || exif.software || exif.dateTime || exif.artist || exif.copyright || exif.dateTaken || exif.lens || exif.owner || exif.serial || exif.gps);
}


/* =========================================================
   JPEG
========================================================= */

const XMP_ID = "http://ns.adobe.com/xap/1.0/\0";

/** The metadata of a JPEG: { type, exif, orientation, blocks: [{ label, kept }] }, or null when it cannot be read safely. */
export function inspectJpeg(bytes) {

    const stripped = stripJpegMetadata(bytes);
    if (!stripped) return null;

    const blocks = [];
    let exif = null;
    let i = 2;

    while (i + 3 < bytes.length && bytes[i] === 0xff) {
        const marker = bytes[i + 1];
        if (marker === 0xff) { i += 1; continue; }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) { i += 2; continue; }
        if (marker === 0xda || marker === 0xd9) break;
        const length = (bytes[i + 2] << 8) | bytes[i + 3];
        const body = i + 4;
        const end = i + 2 + length;
        if (length < 2 || end > bytes.length) break;
        if (marker === 0xe1 && startsWith(bytes, body, "Exif\0\0")) {
            exif = readExif(bytes, body + 6, end);
            blocks.push({ label: "Exif (camera, dates, location)", kept: false });
        } else if (marker === 0xe1 && startsWith(bytes, body, XMP_ID)) {
            blocks.push({ label: "XMP (editing history, owner, location)", kept: false });
        } else if (marker === 0xe1) {
            blocks.push({ label: "Other APP1 block", kept: false });
        } else if (marker === 0xed) {
            blocks.push({ label: "IPTC (caption, credit, place)", kept: false });
        } else if (marker === 0xfe) {
            blocks.push({ label: "Comment", kept: false });
        } else if (marker === 0xe2 && startsWith(bytes, body, "ICC_PROFILE")) {
            blocks.push({ label: "Colour profile (ICC)", kept: true });
        } else if (marker === 0xe2 && startsWith(bytes, body, "MPF")) {
            blocks.push({ label: "Multi-picture index (MPF)", kept: false });
        } else if (marker === 0xe0 && startsWith(bytes, body, "JFXX")) {
            blocks.push({ label: "Thumbnail (JFXX)", kept: false });
        } else if (marker === 0xe0 && startsWith(bytes, body, "JFIF") && length > 16) {
            blocks.push({ label: "JFIF thumbnail", kept: false });
        } else if (marker === 0xee) {
            blocks.push({ label: "Adobe colour information", kept: true });
        } else if ((marker >= 0xe3 && marker <= 0xec) || marker === 0xef) {
            blocks.push({ label: `Maker block (APP${marker - 0xe0})`, kept: false });
        }
        i = end;
    }

    if (stripped.removed.some((r) => r.marker === 0xd9)) {
        blocks.push({ label: "Data after the picture", kept: false });
    }

    return { type: "jpeg", exif, orientation: exif?.orientation ?? null, blocks };

}

/** A 36-byte Exif block that holds only the orientation (2 to 8), so a photo stored sideways still shows upright. */
export function orientationBlock(orientation) {
    if (!Number.isInteger(orientation) || orientation < 2 || orientation > 8) throw new RangeError("orientation 2 to 8");
    return Uint8Array.from([
        0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // APP1, length 34, "Exif\0\0"
        0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,             // "MM", 42, IFD0 at 8
        0x00, 0x01,                                                 // one entry
        0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01,             // Orientation, SHORT, count 1
        0x00, orientation, 0x00, 0x00,                              // the value
        0x00, 0x00, 0x00, 0x00                                      // no next IFD
    ]);
}

/* after SOI, and after a JFIF APP0 when the file starts with one (JFIF expects to be first) */
function insertAfterStart(bytes, block) {
    let at = 2;
    if (bytes[2] === 0xff && bytes[3] === 0xe0) at = 4 + ((bytes[4] << 8) | bytes[5]);
    const out = new Uint8Array(bytes.length + block.length);
    out.set(bytes.subarray(0, at), 0);
    out.set(block, at);
    out.set(bytes.subarray(at), at + block.length);
    return out;
}


/* =========================================================
   PNG
========================================================= */

const PNG_SIGNATURE = 8;
const PNG_REMOVED = new Set(["tEXt", "iTXt", "zTXt", "eXIf", "tIME"]);

/** The chunks of a PNG: [{ type, start, end, dataStart, dataEnd }], or null when the chain cannot be read safely. */
function pngChunks(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunks = [];
    let i = PNG_SIGNATURE;
    while (i + 12 <= bytes.length) {
        const length = view.getUint32(i);
        const type = latin1(bytes.subarray(i + 4, i + 8));
        const end = i + 12 + length;
        if (!/^[A-Za-z]{4}$/.test(type) || end > bytes.length) return null;
        chunks.push({ type, start: i, end, dataStart: i + 8, dataEnd: i + 8 + length });
        i = end;
        if (type === "IEND") return chunks;
    }
    return null;
}

/** The metadata of a PNG: { type, exif, text: [{ keyword, value }], blocks }, or null when it cannot be read safely. */
export function inspectPng(bytes) {

    const chunks = pngChunks(bytes);
    if (!chunks || chunks[0]?.type !== "IHDR") return null;

    const blocks = [];
    const words = [];
    let exif = null;

    for (const c of chunks) {
        const data = bytes.subarray(c.dataStart, c.dataEnd);
        const nul = data.indexOf(0);
        const keyword = nul > 0 ? latin1(data.subarray(0, nul)) : "";
        if (c.type === "tEXt") {
            words.push({ keyword, value: latin1(data.subarray(nul + 1)) });
            blocks.push({ label: `Text: ${keyword || "(no keyword)"}`, kept: false });
        } else if (c.type === "iTXt") {
            /* keyword \0 compression-flag method language \0 translated \0 text */
            const compressed = data[nul + 1] === 1;
            let k = nul + 3;
            k = data.indexOf(0, k) + 1;
            k = data.indexOf(0, k) + 1;
            words.push({ keyword, value: compressed || k <= 0 ? null : text(data.subarray(k)) });
            blocks.push({ label: `Text: ${keyword || "(no keyword)"}`, kept: false });
        } else if (c.type === "zTXt") {
            words.push({ keyword, value: null });
            blocks.push({ label: `Compressed text: ${keyword || "(no keyword)"}`, kept: false });
        } else if (c.type === "eXIf") {
            exif = readExif(bytes, c.dataStart, c.dataEnd);
            blocks.push({ label: "Exif (camera, dates, location)", kept: false });
        } else if (c.type === "tIME") {
            blocks.push({ label: "Last-modified time", kept: false });
        } else if (c.type === "iCCP") {
            blocks.push({ label: "Colour profile (ICC)", kept: true });
        }
    }

    return { type: "png", exif, orientation: exif?.orientation ?? null, text: words, blocks };

}

function stripPng(bytes) {
    const chunks = pngChunks(bytes);
    if (!chunks) return null;
    const keep = chunks.filter((c) => !PNG_REMOVED.has(c.type));
    if (keep.length === chunks.length) return bytes;
    const out = new Uint8Array(PNG_SIGNATURE + keep.reduce((sum, c) => sum + (c.end - c.start), 0));
    out.set(bytes.subarray(0, PNG_SIGNATURE), 0);
    let at = PNG_SIGNATURE;
    for (const c of keep) { out.set(bytes.subarray(c.start, c.end), at); at += c.end - c.start; }
    return out;
}


/* =========================================================
   ONE CALL FOR THE PAGE
========================================================= */

/** The metadata of a file by its bytes: an inspection, or { type, unreadable: true } / { type, unsupported: true }. */
export function inspect(bytes) {
    const type = sniff(bytes);
    if (type === "jpeg") return inspectJpeg(bytes) ?? { type, unreadable: true };
    if (type === "png") return inspectPng(bytes) ?? { type, unreadable: true };
    return { type, unsupported: true };
}

const identifying = (info) => !!info && (exifIdentifies(info.exif) || info.blocks.some((b) => !b.kept) || (info.text ?? []).length > 0);

/**
 * A copy of the file without its metadata.
 * { ok: true, bytes, type, removed: [labels], kept: [labels], orientationKept, unchanged } or { ok: false, reason }.
 * The copy is read again before it is returned: if anything identifying is still found, it is refused.
 */
export function clean(bytes, { keepOrientation = true } = {}) {

    const info = inspect(bytes);
    if (info.unsupported) return { ok: false, reason: "unsupported" };
    if (info.unreadable) return { ok: false, reason: "unreadable" };

    let out;
    let orientationKept = false;

    if (info.type === "jpeg") {
        out = stripJpegMetadata(bytes)?.bytes;
        if (out && keepOrientation && info.orientation >= 2 && info.orientation <= 8) {
            out = insertAfterStart(out, orientationBlock(info.orientation));
            orientationKept = true;
        }
    } else {
        out = stripPng(bytes);
    }

    if (!out) return { ok: false, reason: "unreadable" };

    const after = inspect(out);
    if (after.unreadable || after.unsupported) return { ok: false, reason: "unreadable" };
    /* the orientation-only Exif block put back is the one allowed Exif: it identifies nothing (exifIdentifies ignores orientation) */
    const leftOver = after.blocks.filter((b) => !b.kept && !(orientationKept && b.label.startsWith("Exif")));
    if (leftOver.length || exifIdentifies(after.exif) || (after.text ?? []).length) return { ok: false, reason: "not-clean" };

    return {
        ok: true,
        type: info.type,
        bytes: out,
        removed: info.blocks.filter((b) => !b.kept).map((b) => b.label),
        kept: info.blocks.filter((b) => b.kept).map((b) => b.label),
        orientationKept,
        unchanged: !identifying(info)
    };

}
