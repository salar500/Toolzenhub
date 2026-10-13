/* =========================================================
   ToolZen Hub
   Base64 Encoder & Decoder: the engine

   Pure functions. No DOM, network, storage or Date.

   Standard Base64 (RFC 4648 section 4: A-Z a-z 0-9 + /, padded with =)
   of the UTF-8 bytes of a text. The table is implemented here
   because strict validation needs more control than atob gives.

   ENCODING  text -> UTF-8 bytes -> padded Base64, no line breaks.

   DECODING  Base64 -> bytes -> strict UTF-8 text.
     1. Only ASCII space, tab, CR and LF are ignored (anywhere).
     2. Only the 64 alphabet characters and trailing = are allowed.
        - and _ get a base64url hint.
     3. = may appear only at the end, at most two, and when present
        the data characters plus the = must make a multiple of 4.
        Missing padding is accepted (remainder 2 or 3); a remainder of
        1 is never valid.
     4. The unused low bits of the last character must be zero
        (RFC 4648 section 3.5 allows a decoder to refuse otherwise).
        Many decoders accept QR== for "A"; this tool does not.
     5. The bytes must be valid UTF-8 (a byte-order mark is kept).

   Limits: 1,000,000 UTF-8 bytes to encode; 1,333,336 submitted
   characters (whitespace included) to decode.
========================================================= */

export const MAX_ENCODE_BYTES = 1000000;

/* the padded Base64 length of MAX_ENCODE_BYTES: 4 * ceil(1000000 / 3) */
export const MAX_DECODE_CHARS = 1333336;

const ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const ENCODE_TABLE = new Uint8Array(64);

for (let i = 0; i < 64; i++) {
    ENCODE_TABLE[i] = ALPHABET.charCodeAt(i);
}

/* 255 = not in the alphabet */
const DECODE_TABLE = new Uint8Array(128).fill(255);

for (let i = 0; i < 64; i++) {
    DECODE_TABLE[ALPHABET.charCodeAt(i)] = i;
}

const IGNORED = new Set([0x20, 0x09, 0x0d, 0x0a]);

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;

const byteText = (n) =>
    `${n.toLocaleString("en-US")} byte${n === 1 ? "" : "s"}`;

const fail = (code, message, extra = {}) =>
    ({ ok: false, code, message, ...extra });

const hex = (cp) =>
    `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

/* a character, named so that an invisible one can be found */
export function describeChar(cp) {

    if (cp === 0xa0) {
        return `a no-break space (${hex(cp)})`;
    }

    if (cp === 0x0b || cp === 0x0c) {
        return `a control character (${hex(cp)})`;
    }

    if (cp < 0x20 || cp === 0x7f || (cp >= 0x80 && cp < 0xa0)) {
        return `a control character (${hex(cp)})`;
    }

    if (
        cp === 0x200b || cp === 0x200c || cp === 0x200d ||
        cp === 0x2060 || cp === 0xfeff
    ) {
        return `an invisible character (${hex(cp)})`;
    }

    if (cp === 0x2028 || cp === 0x2029 || (cp >= 0x2000 && cp <= 0x200a) || cp === 0x3000 || cp === 0x202f || cp === 0x205f || cp === 0x1680) {
        return `a space character that is not an ASCII space (${hex(cp)})`;
    }

    return `"${String.fromCodePoint(cp)}" (${hex(cp)})`;

}


/* =========================================================
   BYTES <-> BASE64 (no validation: callers validate)
========================================================= */

export function encodeBytes(bytes) {

    const n = bytes.length;

    const out = new Uint8Array(Math.ceil(n / 3) * 4);

    let o = 0;
    let i = 0;

    for (; i + 2 < n; i += 3) {

        const v = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        out[o++] = ENCODE_TABLE[(v >> 18) & 63];
        out[o++] = ENCODE_TABLE[(v >> 12) & 63];
        out[o++] = ENCODE_TABLE[(v >> 6) & 63];
        out[o++] = ENCODE_TABLE[v & 63];

    }

    if (n - i === 1) {

        const v = bytes[i] << 16;

        out[o++] = ENCODE_TABLE[(v >> 18) & 63];
        out[o++] = ENCODE_TABLE[(v >> 12) & 63];
        out[o++] = 0x3d;
        out[o++] = 0x3d;

    } else if (n - i === 2) {

        const v = (bytes[i] << 16) | (bytes[i + 1] << 8);

        out[o++] = ENCODE_TABLE[(v >> 18) & 63];
        out[o++] = ENCODE_TABLE[(v >> 12) & 63];
        out[o++] = ENCODE_TABLE[(v >> 6) & 63];
        out[o++] = 0x3d;

    }

    /* every byte is ASCII, so this is a plain, fast conversion */
    return new TextDecoder("utf-8").decode(out);

}

/* sextets (0..63) -> bytes; the count must not leave a remainder of 1 */
function sextetsToBytes(sextets, count) {

    const length = Math.floor((count * 6) / 8);

    const out = new Uint8Array(length);

    let o = 0;
    let i = 0;

    for (; i + 3 < count; i += 4) {

        const v =
            (sextets[i] << 18) | (sextets[i + 1] << 12) |
            (sextets[i + 2] << 6) | sextets[i + 3];

        out[o++] = (v >> 16) & 255;
        out[o++] = (v >> 8) & 255;
        out[o++] = v & 255;

    }

    const left = count - i;

    if (left === 2) {

        const v = (sextets[i] << 18) | (sextets[i + 1] << 12);

        out[o++] = (v >> 16) & 255;

    } else if (left === 3) {

        const v =
            (sextets[i] << 18) | (sextets[i + 1] << 12) | (sextets[i + 2] << 6);

        out[o++] = (v >> 16) & 255;
        out[o++] = (v >> 8) & 255;

    }

    return out;

}


/* =========================================================
   ENCODE TEXT
========================================================= */

export function encodeText(text) {

    if (typeof text !== "string" || text.length === 0) {
        return fail("EMPTY", "Enter some text to encode.");
    }

    /* every UTF-16 unit is at least one byte, so this is a cheap early limit check */
    if (text.length > MAX_ENCODE_BYTES) {
        return fail(
            "TOO_LONG",
            `This text is longer than the limit of ${byteText(MAX_ENCODE_BYTES)} of UTF-8. It has ${countText(text.length)}.`
        );
    }

    /* UTF-8 cannot represent an unpaired surrogate; refuse it rather than change it */
    for (let i = 0; i < text.length; i++) {

        const unit = text.charCodeAt(i);

        if (unit >= 0xd800 && unit <= 0xdbff) {

            const next = text.charCodeAt(i + 1);

            if (next >= 0xdc00 && next <= 0xdfff) {
                i++;
                continue;
            }

            return fail(
                "UNPAIRED_SURROGATE",
                `The text has half of a character pair (${hex(unit)}) at position ${i + 1}, which UTF-8 cannot represent. Remove or replace it.`,
                { position: i + 1 }
            );

        }

        if (unit >= 0xdc00 && unit <= 0xdfff) {
            return fail(
                "UNPAIRED_SURROGATE",
                `The text has half of a character pair (${hex(unit)}) at position ${i + 1}, which UTF-8 cannot represent. Remove or replace it.`,
                { position: i + 1 }
            );
        }

    }

    const bytes = new TextEncoder().encode(text);

    if (bytes.length > MAX_ENCODE_BYTES) {
        return fail(
            "TOO_LONG",
            `This text is ${byteText(bytes.length)} as UTF-8, which is over the limit of ${byteText(MAX_ENCODE_BYTES)}.`
        );
    }

    const value = encodeBytes(bytes);

    return {
        ok: true,
        value,
        bytes: bytes.length,
        chars: value.length,
        notes: []
    };

}


/* =========================================================
   DECODE BASE64
========================================================= */

export function decodeBase64(input) {

    if (typeof input !== "string") {
        return fail("EMPTY", "Enter some Base64 to decode.");
    }

    if (input.length > MAX_DECODE_CHARS) {
        return fail(
            "TOO_LONG",
            `This input has ${countText(input.length)}, which is over the limit of ${countText(MAX_DECODE_CHARS)} (the Base64 of ${byteText(MAX_ENCODE_BYTES)}). Whitespace counts.`
        );
    }

    const sextets = new Uint8Array(input.length);

    let count = 0;
    let ignored = 0;
    let padding = 0;
    let firstPaddingAt = 0;
    let lastDataAt = 0;
    let position = 0;

    for (const ch of input) {

        position++;

        const cp = ch.codePointAt(0);

        if (IGNORED.has(cp)) {
            ignored++;
            continue;
        }

        if (cp === 0x3d) {

            if (padding === 0) {
                firstPaddingAt = position;
            }

            padding++;

            continue;

        }

        if (padding > 0) {
            return fail(
                "MISPLACED_PADDING",
                `The padding character = at position ${firstPaddingAt} is followed by more characters. = may only appear at the end.`,
                { position: firstPaddingAt }
            );
        }

        const value = cp < 128 ? DECODE_TABLE[cp] : 255;

        if (value === 255) {

            if (cp === 0x2d || cp === 0x5f) {
                return fail(
                    "BASE64URL",
                    `"${ch}" at position ${position} is not part of standard Base64. This looks like base64url, which writes - and _ where Base64 writes + and /. This tool reads standard Base64 only.`,
                    { position }
                );
            }

            return fail(
                "INVALID_CHARACTER",
                `${describeChar(cp)} at position ${position} is not allowed in Base64. Only A-Z, a-z, 0-9, + and /, with = at the end, are read (and ASCII space, tab and line breaks are ignored).`,
                { position }
            );

        }

        sextets[count++] = value;
        lastDataAt = position;

    }

    if (count === 0 && padding === 0) {
        return fail("EMPTY", "Enter some Base64 to decode.");
    }

    if (count === 0) {
        return fail(
            "BAD_PADDING",
            "There is padding (=) but no Base64 characters before it.",
            { position: firstPaddingAt }
        );
    }

    if (padding > 2) {
        return fail(
            "BAD_PADDING",
            `There are ${padding} = characters at the end. Base64 uses at most two.`,
            { position: firstPaddingAt }
        );
    }

    const remainder = count % 4;

    if (remainder === 1) {
        return fail(
            "TRUNCATED",
            `${countText(count)} of Base64 leaves a single character over, and one character cannot encode a byte. The text is probably cut short.`
        );
    }

    if (padding > 0 && (count + padding) % 4 !== 0) {

        const needed = (4 - remainder) % 4;

        return fail(
            "BAD_PADDING",
            `The padding is wrong: ${countText(count)} of Base64 needs ${needed === 0 ? "no =" : `${needed} = at the end`}, but there ${padding === 1 ? "is 1 =" : `are ${padding} =`}.`,
            { position: firstPaddingAt }
        );

    }

    /* RFC 4648 section 3.5: the unused low bits of the last character should be zero */
    if (remainder === 2 && (sextets[count - 1] & 0x0f) !== 0) {
        return fail(
            "NON_CANONICAL",
            `The last character at position ${lastDataAt} carries extra bits that no byte uses. A Base64 encoder would not write it this way, so the text may have a typo or be cut short. This tool is strict here; many other decoders accept it.`,
            { position: lastDataAt }
        );
    }

    if (remainder === 3 && (sextets[count - 1] & 0x03) !== 0) {
        return fail(
            "NON_CANONICAL",
            `The last character at position ${lastDataAt} carries extra bits that no byte uses. A Base64 encoder would not write it this way, so the text may have a typo or be cut short. This tool is strict here; many other decoders accept it.`,
            { position: lastDataAt }
        );
    }

    const bytes = sextetsToBytes(sextets, count);

    let value;

    try {
        value = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch (problem) {
        return fail(
            "NOT_UTF8",
            `These ${byteText(bytes.length)} are valid Base64 but not UTF-8 text, so they look like binary data. This tool shows text only.`,
            { bytes: bytes.length }
        );
    }

    const notes = [];

    if (ignored > 0) {
        notes.push(`${countText(ignored)} of whitespace ${ignored === 1 ? "was" : "were"} ignored.`);
    }

    if (padding === 0 && remainder !== 0) {
        notes.push("Padding was missing and is assumed.");
    }

    return {
        ok: true,
        value,
        bytes: bytes.length,
        chars: input.length,
        notes
    };

}
