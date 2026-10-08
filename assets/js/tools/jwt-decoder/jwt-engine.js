/* =========================================================
   ToolZen Hub
   JWT Decoder: the engine

   Reads the header and payload of a compact JWT. It is pure: no
   DOM, no network, no storage, no clock of its own (the time is
   passed in), so the same text always gives the same answer.

   What it does NOT do, on purpose: verify a signature, check the
   algorithm, trust any value, decrypt, or fetch anything. A token
   that decodes is only text that someone wrote in the right shape.
   Every value, including "alg", "typ" and "kid", is an untrusted
   declaration made by whoever produced the token.

   Reuse (read-only imports, neither engine is changed):
     json-engine.js       strict JSON, the place of an error, and
                          a formatted copy that keeps every number
                          and string exactly as written
     timestamp-engine.js  UTC and zone text and relative time

   Contract (the page and the tests depend on it):

     decodeToken(text, { nowMs, zone })

       { state: "empty" }
       { state: "too-large", limit }
       { state: "jwe", message, notes }          5 parts: encrypted
       { state: "invalid", problem, notes }      problem: { message, part, where?, context? }
       { state: "decoded", ... }                 see decoded() below

   Strings that came from the token are passed through safeText(),
   which writes control, invisible and bidirectional-override
   characters as visible \uXXXX escapes. Inside a JSON string that
   escape means the same character, so the formatted text stays
   equivalent JSON.
========================================================= */

import {
    analyze
} from "../json-formatter/json-engine.js";

import {
    formatUtcIso,
    describeInZone,
    localZone,
    relativeText,
    inRange
} from "../unix-timestamp-converter/timestamp-engine.js";


/* a token is normally a few kilobytes; this is generous and still instant */
export const MAX_TOKEN_CHARS = 100_000;

const PART_LABEL = ["header", "payload", "signature"];

const PART_NAME = ["Header", "Payload", "Signature"];


/* =========================================================
   SAFE TEXT
========================================================= */

/*
 * C0 and C1 controls, DEL, the Unicode line and paragraph separators,
 * zero-width and bidirectional formatting characters and the byte
 * order mark. All of them can make text look different from what it is.
 */
/* [first, last] code points; the same list builds both expressions below */
const UNSAFE_RANGES = [
    [0x00, 0x1f], [0x7f, 0x9f], [0xad], [0x61c], [0x180e], [0x200b, 0x200f], [0x2028, 0x202e],
    [0x2060, 0x206f], [0xfeff], [0xfff9, 0xfffb]
];

const hex4 = (n) => String.fromCharCode(92) + "u" + n.toString(16).padStart(4, "0");

const classOf = (ranges) => new RegExp("[" + ranges.map(([a, b]) => hex4(a) + (b === undefined ? "" : "-" + hex4(b))).join("") + "]", "g");

const UNSAFE = classOf(UNSAFE_RANGES);

const escapeOne = (ch) => String.fromCharCode(92) + "u" + ch.charCodeAt(0).toString(16).padStart(4, "0");

export function safeText(text) {

    return String(text).replace(UNSAFE, escapeOne);

}

/* the same for a block of formatted JSON, where tab, line feed and carriage return are layout, not content */
const UNSAFE_BLOCK = classOf([[0x00, 0x08], [0x0b, 0x0c], [0x0e, 0x1f], ...UNSAFE_RANGES.slice(1)]);

export function safeBlock(text) {

    return String(text).replace(UNSAFE_BLOCK, escapeOne);

}

/* one character, for a message: an accented letter, U+00E9 */
function describeChar(ch) {

    const code = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

    return `"${safeText(ch)}" (U+${code})`;

}


/* =========================================================
   BASE64URL (RFC 4648 section 5, no padding)
========================================================= */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const LOOKUP = new Int8Array(128).fill(-1);

for (let i = 0; i < ALPHABET.length; i++) {
    LOOKUP[ALPHABET.charCodeAt(i)] = i;
}

/*
 * Decodes text already known to use only the alphabet and to have a
 * length that is not 1 modulo 4.
 * { bytes, canonical }: canonical is false when the unused trailing
 * bits of the last character are not zero.
 */
export function decodeBase64Url(segment) {

    const bits = segment.length * 6;

    const bytes = new Uint8Array(Math.floor(bits / 8));

    let buffer = 0;
    let held = 0;
    let out = 0;

    for (let i = 0; i < segment.length; i++) {

        buffer = (buffer << 6) | LOOKUP[segment.charCodeAt(i)];
        held += 6;

        if (held >= 8) {
            held -= 8;
            bytes[out++] = (buffer >> held) & 0xff;
            buffer &= (1 << held) - 1;
        }

    }

    return { bytes, canonical: buffer === 0 };

}

/* the inverse, used by tests and by the example builder */
export function encodeBase64Url(bytes) {

    let text = "";

    for (let i = 0; i < bytes.length; i += 3) {

        const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);

        text += ALPHABET[(chunk >> 18) & 63] + ALPHABET[(chunk >> 12) & 63];

        if (i + 1 < bytes.length) {
            text += ALPHABET[(chunk >> 6) & 63];
        }

        if (i + 2 < bytes.length) {
            text += ALPHABET[chunk & 63];
        }

    }

    return text;

}


/* =========================================================
   THE TOKEN TEXT
========================================================= */

const invalid = (message, part, notes, extra = {}) => ({
    state: "invalid",
    problem: { message, part, ...extra },
    notes
});

/* a character the segment may not contain, with a hint where one helps */
function badCharacter(segment, partIndex) {

    let position = 0;

    for (const ch of segment) {

        position++;

        const code = ch.codePointAt(0);

        if (code < 128 && LOOKUP[code] >= 0) {
            continue;
        }

        let hint = "";

        if (ch === "+" || ch === "/") {
            hint = " A JWT uses base64url, which writes - and _ where ordinary Base64 writes + and /.";
        } else if (ch === "=") {
            hint = " Padding (=) may only end a part.";
        } else if (ch === "\"" || ch === "'") {
            hint = " Remove any quotation marks around the token.";
        }

        return `Part ${partIndex + 1} (${PART_LABEL[partIndex]}) contains ${describeChar(ch)} at position ${position}, which base64url does not allow.${hint}`;

    }

    return null;

}

/* what a pasted token may carry besides the token itself */
function normalize(text, notes) {

    let token = text.trim();

    const bearer = /^bearer(?:\s+|$)/i.exec(token);

    if (bearer) {
        token = token.slice(bearer[0].length);
        notes.push("The word Bearer at the start was ignored.");
    }

    if (/\s/.test(token)) {
        token = token.replace(/\s+/g, "");
        notes.push("Spaces and line breaks inside the token were ignored.");
    }

    return token;

}


/* =========================================================
   ONE PART: BASE64URL, UTF-8, JSON OBJECT
========================================================= */

const utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

const ROOT_WORDS = { object: "an object", array: "an array", string: "a string", number: "a number", boolean: "true or false", null: "null" };

function describeRoot(result) {

    return ROOT_WORDS[result.rootType] ?? "not an object";

}

/* { ok: true, text, formatted, value, notes } or { ok: false, problem } */
function readPart(segment, index, notes) {

    const label = PART_LABEL[index];

    let encoded = segment;

    if (encoded.endsWith("==")) {
        encoded = encoded.slice(0, -2);
        notes.push(`Padding (=) at the end of part ${index + 1} was ignored; JWTs do not use it.`);
    } else if (encoded.endsWith("=")) {
        encoded = encoded.slice(0, -1);
        notes.push(`Padding (=) at the end of part ${index + 1} was ignored; JWTs do not use it.`);
    }

    const bad = badCharacter(encoded, index);

    if (bad) {
        return { ok: false, problem: { message: bad, part: label } };
    }

    if (encoded.length % 4 === 1) {
        return {
            ok: false,
            problem: {
                message: `Part ${index + 1} (${label}) has ${encoded.length} characters, which is not a possible base64url length. A character was probably lost or added.`,
                part: label
            }
        };
    }

    const { bytes, canonical } = decodeBase64Url(encoded);

    if (!canonical) {
        notes.push(`The last character of part ${index + 1} carries extra bits that a canonical encoder would not write. Some decoders refuse this.`);
    }

    if (index === 2) {
        return { ok: true, bytes, encodedLength: encoded.length };
    }

    let text;

    try {
        text = utf8.decode(bytes);
    } catch (problem) {
        return {
            ok: false,
            problem: { message: `The ${label} (part ${index + 1}) decodes to bytes that are not valid UTF-8 text.`, part: label }
        };
    }

    const json = analyze(text, "format");

    if (json.state === "invalid") {

        return {
            ok: false,
            problem: {
                message: `The ${label} (part ${index + 1}) is not valid JSON: ${safeText(json.error.message)}`,
                part: label,
                where: `Line ${json.error.line}, column ${json.error.column}`,
                context: safeText(json.error.context)
            }
        };

    }

    if (json.state !== "valid") {
        /* empty or too large cannot happen for a non-empty part of this size, but never assume */
        return { ok: false, problem: { message: `The ${label} (part ${index + 1}) could not be read as JSON.`, part: label } };
    }

    if (json.rootType !== "object") {
        return {
            ok: false,
            problem: {
                message: `The ${label} (part ${index + 1}) is valid JSON but it is ${describeRoot(json)}. A JWT ${label} must be a JSON object.`,
                part: label
            }
        };
    }

    for (const note of json.notes) {
        notes.push(`${PART_NAME[index]}: ${safeText(note.message)}`);
    }

    if (json.noteTotal > json.notes.length) {
        notes.push(`${PART_NAME[index]}: and ${json.noteTotal - json.notes.length} more notes.`);
    }

    return {
        ok: true,
        text,
        formatted: safeBlock(json.output),
        value: JSON.parse(text),
        encodedLength: encoded.length
    };

}


/* =========================================================
   REGISTERED CLAIMS
========================================================= */

const CLAIMS = [
    { name: "iss", label: "Issuer", meaning: "who issued the token", type: "string" },
    { name: "sub", label: "Subject", meaning: "who or what the token is about", type: "string" },
    { name: "aud", label: "Audience", meaning: "who the token is meant for", type: "string or array of strings" },
    { name: "exp", label: "Expiration time", meaning: "the time at or after which the token should not be accepted", type: "number" },
    { name: "nbf", label: "Not before", meaning: "the time before which the token should not be accepted", type: "number" },
    { name: "iat", label: "Issued at", meaning: "when the token was issued", type: "number" },
    { name: "jti", label: "JWT ID", meaning: "the identifier its issuer gave the token", type: "string" }
];

const TIME_CLAIMS = ["exp", "nbf", "iat"];

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const isString = (v) => typeof v === "string";

const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

function typeOk(claim, value) {

    switch (claim.name) {
        case "aud":
            return isString(value) || (Array.isArray(value) && value.every(isString));
        case "exp":
        case "nbf":
        case "iat":
            return isNumber(value);
        default:
            return isString(value);
    }

}

/*
 * JavaScript reads every JSON number as a 64-bit float, which holds whole numbers exactly only up to 2^53 - 1
 * (9007199254740991). Beyond that the digits it would print are a rounded stand-in, so they are never shown as
 * if they were what the token says: the formatted payload (copied as written) is the place to read them.
 */
const unsafeNumber = (v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) > Number.MAX_SAFE_INTEGER;

const hasUnsafeNumber = (v) =>
    unsafeNumber(v) ||
    (Array.isArray(v) && v.some(hasUnsafeNumber)) ||
    (v !== null && typeof v === "object" && !Array.isArray(v) && Object.values(v).some(hasUnsafeNumber));

const UNSAFE_TEXT = "a number larger than JavaScript can hold exactly (see the payload above, which shows it as written)";

/* a value as short, safe text: strings as they are, everything else as compact JSON */
function valueText(value) {

    if (hasUnsafeNumber(value)) {
        return UNSAFE_TEXT;
    }

    return typeof value === "string" ? safeText(value) : safeText(JSON.stringify(value));

}

const typeName = (v) =>
    v === null ? "null"
        : Array.isArray(v) ? "an array"
            : typeof v === "object" ? "an object"
                : typeof v === "number" && !Number.isFinite(v) ? "a number too large for JavaScript"
                    : `a ${typeof v}`;


/* =========================================================
   TIME
========================================================= */

/*
 * A NumericDate is a count of seconds. The value is read as the
 * double JSON gave us; a fraction is kept to the millisecond. Never
 * rounded across a second boundary by accident: 59.9996 becomes the
 * next whole second.
 */
function secondsToNs(seconds) {

    let whole = Math.floor(seconds);

    let ms = Math.round((seconds - whole) * 1000);

    if (ms === 1000) {
        whole += 1;
        ms = 0;
    }

    return BigInt(whole) * 1_000_000_000n + BigInt(ms) * 1_000_000n;

}

const secondsText = (seconds) => String(seconds);

function describeInstant(ns, zone) {

    const local = describeInZone(ns, zone);

    return {
        utc: formatUtcIso(ns),
        local: `${local.display} (${local.offset}${local.abbr && !/^GMT[+-]/.test(local.abbr) ? ", " + local.abbr : ""})`,
        zone
    };

}

/* "1700000000000" read as milliseconds, shown only as a hint and never applied */
function millisecondHint(seconds, zone) {

    if (Math.abs(seconds) < 1e11) {
        return null;
    }

    const ns = secondsToNs(seconds / 1000);

    if (!inRange(ns)) {
        return null;
    }

    return `This number is large for seconds. JWT times are in seconds, so it is shown that way. Read as milliseconds it would be ${formatUtcIso(ns)} UTC. Nothing was converted.`;

}

function timeItem(claim, value, nowMs, zone) {

    const item = { name: claim.name, label: claim.label, seconds: secondsText(value) };

    if (unsafeNumber(value)) {

        item.seconds = UNSAFE_TEXT;
        item.status = `${claim.label} (${claim.name}) is too large to read exactly, so no date is shown.`;

        return item;

    }

    const ns = secondsToNs(value);

    if (!inRange(ns)) {

        item.outOfRange = true;
        item.status = `${claim.label} (${claim.name}) is outside the years 1 to 9999, so it cannot be shown as a date.`;
        item.hint = millisecondHint(value, zone);

        return item;

    }

    Object.assign(item, describeInstant(ns, zone));

    const delta = value - nowMs / 1000;

    item.relative = relativeText(Math.trunc(delta));

    item.hint = millisecondHint(value, zone);

    const rel = item.relative;

    if (claim.name === "exp") {
        item.status = delta <= 0
            ? `The expiry time has passed (${rel}) by this device's clock.`
            : `The expiry time has not passed yet (${rel}) by this device's clock.`;
    } else if (claim.name === "nbf") {
        item.status = delta > 0
            ? `The not-before time has not been reached yet (${rel}) by this device's clock.`
            : `The not-before time has been reached (${rel}) by this device's clock.`;
    } else {
        item.status = delta > 0
            ? `The issued-at time is in the future (${rel}) by this device's clock. The clocks may differ.`
            : `The issued-at time is in the past (${rel}) by this device's clock.`;
    }

    return item;

}

function timing(payload, nowMs, zone) {

    const items = [];

    const notes = [];

    const values = {};

    for (const claim of CLAIMS.filter((c) => TIME_CLAIMS.includes(c.name))) {

        if (has(payload, claim.name) && isNumber(payload[claim.name])) {
            if (!unsafeNumber(payload[claim.name])) {
                values[claim.name] = payload[claim.name];
            }
            items.push(timeItem(claim, payload[claim.name], nowMs, zone));
        }

    }

    if (!has(payload, "exp")) {
        notes.push("This payload has no exp claim, so it states no expiry time.");
    }

    if ("exp" in values && "iat" in values && values.exp < values.iat) {
        notes.push("The exp time is earlier than the iat time.");
    }

    if ("exp" in values && "nbf" in values && values.exp < values.nbf) {
        notes.push("The exp time is earlier than the nbf time.");
    }

    notes.push("This uses the clock of this device, which may be wrong. Whatever checks the token uses its own clock, and may allow some leeway.");

    return { zone, checkedAt: formatUtcIso(secondsToNs(Math.floor(nowMs / 1000))), items, notes };

}


/* =========================================================
   THE PUBLIC RESULT
========================================================= */

const HEADER_FIELDS = ["alg", "typ", "kid", "cty"];

export function decodeToken(text, options = {}) {

    const raw = String(text ?? "");

    if (raw.length > MAX_TOKEN_CHARS) {
        return { state: "too-large", limit: MAX_TOKEN_CHARS };
    }

    if (raw.trim() === "") {
        return { state: "empty" };
    }

    const notes = [];

    const token = normalize(raw, notes);

    if (token === "") {
        return invalid("There is nothing after the word Bearer.", "token", notes);
    }

    const segments = token.split(".");

    if (segments.length === 5) {
        return {
            state: "jwe",
            message: "This has five parts, which is the shape of an encrypted token (JWE). Its contents cannot be read without a key, and this tool does not decrypt tokens.",
            notes
        };
    }

    if (segments.length !== 3) {

        const found = segments.length === 1
            ? "1 part and no dots"
            : `${segments.length} parts`;

        return invalid(`A signed JWT has 3 parts separated by dots (header.payload.signature). This has ${found}.`, "token", notes);

    }

    if (segments[0] === "") {
        return invalid("Part 1 (the header) is empty.", "header", notes);
    }

    if (segments[1] === "") {
        return invalid("Part 2 (the payload) is empty.", "payload", notes);
    }

    const header = readPart(segments[0], 0, notes);

    if (!header.ok) {
        return { state: "invalid", problem: header.problem, notes };
    }

    const payload = readPart(segments[1], 1, notes);

    if (!payload.ok) {
        return { state: "invalid", problem: payload.problem, notes };
    }

    const signature = segments[2] === ""
        ? { ok: true, bytes: new Uint8Array(0), encodedLength: 0 }
        : readPart(segments[2], 2, notes);

    if (!signature.ok) {
        return { state: "invalid", problem: signature.problem, notes };
    }

    const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();

    const zone = options.zone || localZone();

    /* header declarations, each an untrusted claim about the token */
    const headerFields = [];

    for (const name of HEADER_FIELDS) {

        if (has(header.value, name)) {

            const value = header.value[name];

            headerFields.push({
                name,
                value: valueText(value),
                typeOk: isString(value),
                expected: "string",
                found: typeName(value)
            });

        }

    }

    const alg = has(header.value, "alg") && isString(header.value.alg) ? header.value.alg : null;

    if (alg !== null && alg.toLowerCase() === "none") {
        notes.push("The header declares alg \"none\", which means the token says it has no signature.");
    }

    if (signature.encodedLength === 0 && (alg === null || alg.toLowerCase() !== "none")) {
        notes.push("The signature part is empty, although the header does not declare alg \"none\".");
    }

    if (signature.encodedLength > 0 && alg !== null && alg.toLowerCase() === "none") {
        notes.push("The header declares alg \"none\", but the token has a signature part.");
    }

    if (!has(header.value, "alg")) {
        notes.push("The header has no alg field.");
    }

    const claims = [];

    for (const claim of CLAIMS) {

        if (!has(payload.value, claim.name)) {
            continue;
        }

        const value = payload.value[claim.name];

        const ok = typeOk(claim, value);

        claims.push({
            name: claim.name,
            label: claim.label,
            meaning: claim.meaning,
            value: valueText(value),
            typeOk: ok,
            expected: claim.type,
            found: typeName(value)
        });

    }

    return {
        state: "decoded",
        notes,
        structure: {
            parts: 3,
            alg: alg === null ? null : safeText(alg),
            signatureEncodedLength: signature.encodedLength,
            signatureBytes: signature.bytes.length,
            headerKeys: Object.keys(header.value).length,
            payloadKeys: Object.keys(payload.value).length
        },
        header: { formatted: header.formatted },
        payload: { formatted: payload.formatted },
        headerFields,
        claims,
        timing: timing(payload.value, nowMs, zone)
    };

}


/* =========================================================
   EXAMPLE
========================================================= */

/*
 * A made-up token. Nothing in it is a credential: the issuer is a
 * reserved .invalid name, the subject and audience are invented, and
 * the signature part is arbitrary bytes that no key produced. It is
 * built here (from text) so the example can never drift from the
 * rules above.
 */
const EXAMPLE_HEADER = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

const EXAMPLE_PAYLOAD = "{\"iss\":\"https://issuer.example.invalid\",\"sub\":\"example-user-001\",\"aud\":\"example-app\",\"name\":\"Ada Example\",\"iat\":1700000000,\"nbf\":1700000000,\"exp\":1700003600,\"jti\":\"example-0001\"}";

const enc = new TextEncoder();

export const EXAMPLE_TOKEN = [
    encodeBase64Url(enc.encode(EXAMPLE_HEADER)),
    encodeBase64Url(enc.encode(EXAMPLE_PAYLOAD)),
    encodeBase64Url(enc.encode("example-signature-not-real-0000000"))
].join(".");
