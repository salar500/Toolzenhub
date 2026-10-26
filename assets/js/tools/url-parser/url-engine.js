/* =========================================================
   ToolZen Hub
   URL Parser & Encoder: the engine

   Pure functions, no DOM, no network, no storage, no clock.

   Parsing is done by the browser's own WHATWG URL parser (the
   URL constructor); this file explains what it returned and
   never navigates to, fetches or links the address. Encoding
   and decoding are written out here, byte by byte, so the rules
   are the documented ones and not whatever a browser does:

   - percent-encode keeps A-Z a-z 0-9 - . _ ~ (RFC 3986
     unreserved) and writes every other UTF-8 byte as %XX.
   - form-encode is the WHATWG application/x-www-form-urlencoded
     serializer: it keeps A-Z a-z 0-9 * - . _ , writes a space as
     + and every other byte as %XX.
   - decoding is strict. A % that is not followed by two hex
     digits, or bytes that are not UTF-8, are errors with a
     position. No replacement character is ever substituted.
========================================================= */

export const MAX_PARSE_CHARS = 100000;
export const MAX_CODEC_CHARS = 1000000;
export const MAX_QUERY_ROWS = 100;
export const MAX_SHOWN_PARAMS = 500;

const HEX = "0123456789ABCDEF";

const SPECIAL_DEFAULT_PORTS = {
    "http:": "80",
    "https:": "443",
    "ws:": "80",
    "wss:": "443",
    "ftp:": "21"
};

const UNRESERVED =
    /[A-Za-z0-9\-._~]/;

const FORM_SAFE =
    /[A-Za-z0-9*\-._]/;

const KEEPABLE =
    "!'()*";

const isHex = (c) =>
    /^[0-9A-Fa-f]$/.test(c);

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;


/* ---------- text to UTF-8 bytes, refusing lone surrogates ---------- */

function loneSurrogate(text) {

    for (let i = 0; i < text.length; i++) {

        const unit = text.charCodeAt(i);

        if (unit >= 0xD800 && unit <= 0xDBFF) {

            const next = text.charCodeAt(i + 1);

            if (next >= 0xDC00 && next <= 0xDFFF) {
                i++;
                continue;
            }

            return i;
        }

        if (unit >= 0xDC00 && unit <= 0xDFFF) {
            return i;
        }
    }

    return -1;
}

const utf8 = new TextEncoder();

function toBytes(text) {

    const at = loneSurrogate(text);

    if (at !== -1) {
        return {
            ok: false,
            message: `The text has a lone surrogate at position ${at} (counting from 0), which cannot be written as UTF-8. Nothing was changed.`,
            position: at
        };
    }

    return { ok: true, bytes: utf8.encode(text) };
}


/* ---------- UTF-8 validation with the offset of the first bad byte ---------- */

export function firstInvalidUtf8(bytes) {

    let i = 0;

    while (i < bytes.length) {

        const b = bytes[i];

        if (b < 0x80) {
            i += 1;
            continue;
        }

        let need = 0;
        let lo = 0x80;
        let hi = 0xBF;

        if (b >= 0xC2 && b <= 0xDF) {
            need = 1;
        } else if (b === 0xE0) {
            need = 2; lo = 0xA0;
        } else if (b >= 0xE1 && b <= 0xEC) {
            need = 2;
        } else if (b === 0xED) {
            need = 2; hi = 0x9F;
        } else if (b >= 0xEE && b <= 0xEF) {
            need = 2;
        } else if (b === 0xF0) {
            need = 3; lo = 0x90;
        } else if (b >= 0xF1 && b <= 0xF3) {
            need = 3;
        } else if (b === 0xF4) {
            need = 3; hi = 0x8F;
        } else {
            return i;
        }

        for (let k = 1; k <= need; k++) {

            const c = bytes[i + k];
            const min = k === 1 ? lo : 0x80;
            const max = k === 1 ? hi : 0xBF;

            if (c === undefined || c < min || c > max) {
                return i;
            }
        }

        i += need + 1;
    }

    return -1;
}


/* ---------- encoding ---------- */

function escapeByte(byte) {
    return "%" + HEX[byte >> 4] + HEX[byte & 15];
}

/**
 * Percent-encode (RFC 3986). options.keepSpecials leaves ! ' ( ) * alone,
 * as JavaScript's encodeURIComponent does.
 */
export function percentEncode(text, options = {}) {

    if (text.length > MAX_CODEC_CHARS) {
        return tooLong(text.length);
    }

    const made = toBytes(text);

    if (!made.ok) {
        return made;
    }

    let out = "";

    for (const byte of made.bytes) {

        const ch = String.fromCharCode(byte);

        if (
            byte < 0x80 &&
            (UNRESERVED.test(ch) ||
                (options.keepSpecials && KEEPABLE.includes(ch)))
        ) {
            out += ch;
        } else {
            out += escapeByte(byte);
        }
    }

    return done(text, out, made.bytes.length);
}

/** Form-encode (application/x-www-form-urlencoded): a space becomes +. */
export function formEncode(text) {

    if (text.length > MAX_CODEC_CHARS) {
        return tooLong(text.length);
    }

    const made = toBytes(text);

    if (!made.ok) {
        return made;
    }

    let out = "";

    for (const byte of made.bytes) {

        const ch = String.fromCharCode(byte);

        if (byte === 0x20) {
            out += "+";
        } else if (byte < 0x80 && FORM_SAFE.test(ch)) {
            out += ch;
        } else {
            out += escapeByte(byte);
        }
    }

    return done(text, out, made.bytes.length);
}

function done(text, out, bytes) {
    return {
        ok: true,
        value: out,
        chars: text.length,
        outChars: out.length,
        bytes
    };
}

function tooLong(n) {
    return {
        ok: false,
        message: `The text is ${countText(n)} long. The limit is ${MAX_CODEC_CHARS.toLocaleString("en-US")} characters. Nothing was changed.`
    };
}


/* ---------- strict decoding ---------- */

/**
 * Percent-decode strictly. options.plusAsSpace reads + as a space first
 * (form decoding). Errors name the position and leave the input alone.
 */
export function percentDecode(text, options = {}) {

    if (text.length > MAX_CODEC_CHARS) {
        return tooLong(text.length);
    }

    const bytes = [];
    const at = loneSurrogate(text);

    if (at !== -1) {
        return {
            ok: false,
            message: `The text has a lone surrogate at position ${at} (counting from 0), which cannot be read as UTF-8.`,
            position: at
        };
    }

    for (let i = 0; i < text.length; i++) {

        const ch = text[i];

        if (ch === "%") {

            const a = text[i + 1];
            const b = text[i + 2];

            if (a === undefined || b === undefined || !isHex(a) || !isHex(b)) {

                const seen = text.slice(i, i + 3);

                return {
                    ok: false,
                    message: `Incomplete percent sequence "${seen}" at position ${i} (counting from 0). A % must be followed by two hexadecimal digits.`,
                    position: i
                };
            }

            bytes.push(parseInt(a + b, 16));
            i += 2;
            continue;
        }

        if (ch === "+" && options.plusAsSpace) {
            bytes.push(0x20);
            continue;
        }

        const code = text.codePointAt(i);

        if (code > 0xFFFF) {
            i++;
        }

        for (const byte of utf8.encode(String.fromCodePoint(code))) {
            bytes.push(byte);
        }
    }

    const view = Uint8Array.from(bytes);
    const bad = firstInvalidUtf8(view);

    if (bad !== -1) {
        return {
            ok: false,
            message: `The decoded bytes are not valid UTF-8, starting at byte ${bad} (counting from 0). Nothing was changed and no replacement character was used.`,
            position: bad
        };
    }

    const value = new TextDecoder("utf-8", { fatal: true }).decode(view);

    return {
        ok: true,
        value,
        chars: text.length,
        outChars: value.length,
        bytes: view.length,
        stillEncoded: /%[0-9A-Fa-f]{2}/.test(value)
    };
}


/* ---------- query strings ---------- */

function decodeQueryPart(raw) {

    const r = percentDecode(raw, { plusAsSpace: true });

    return r.ok
        ? { value: r.value, note: null }
        : {
            value: raw,
            note: r.message.startsWith("Incomplete")
                ? "malformed percent sequence"
                : "not valid UTF-8"
        };
}

/** Read a query string (with or without a leading ?) into ordered rows. */
export function parseQuery(query) {

    const body = query.startsWith("?") ? query.slice(1) : query;
    const rows = [];

    for (const piece of body.split("&")) {

        if (piece === "") {
            continue;
        }

        const eq = piece.indexOf("=");
        const rawName = eq === -1 ? piece : piece.slice(0, eq);
        const rawValue = eq === -1 ? "" : piece.slice(eq + 1);
        const name = decodeQueryPart(rawName);
        const value = decodeQueryPart(rawValue);

        rows.push({
            name: name.value,
            value: value.value,
            hasEquals: eq !== -1,
            note: name.note || value.note
        });
    }

    const seen = new Map();

    for (const row of rows) {
        seen.set(row.name, (seen.get(row.name) || 0) + 1);
    }

    for (const row of rows) {
        row.repeated = seen.get(row.name) > 1;
        row.encodedTwice = /%[0-9A-Fa-f]{2}/.test(row.value);
    }

    return rows;
}

/** Build a query string from {name, value} rows. style: "percent" or "form". */
export function buildQuery(rows, style = "percent") {

    if (rows.length > MAX_QUERY_ROWS) {
        return {
            ok: false,
            message: `There are ${rows.length} rows. The limit is ${MAX_QUERY_ROWS}.`
        };
    }

    const encode = style === "form" ? formEncode : percentEncode;
    const parts = [];
    let blank = 0;

    for (let i = 0; i < rows.length; i++) {

        const name = rows[i].name ?? "";
        const value = rows[i].value ?? "";

        if (name === "" && value === "") {
            blank++;
            continue;
        }

        if (name === "") {
            return {
                ok: false,
                message: `Row ${i + 1} has a value but no name.`,
                row: i + 1
            };
        }

        const n = encode(name);
        const v = encode(value);
        const bad = !n.ok ? n : !v.ok ? v : null;

        if (bad) {
            return { ok: false, message: `Row ${i + 1}: ${bad.message}`, row: i + 1 };
        }

        parts.push(`${n.value}=${v.value}`);
    }

    return { ok: true, query: parts.join("&"), blankSkipped: blank };
}

/** The base URL with its query replaced; the fragment is kept. */
export function withQuery(baseText, query) {

    let url;

    try {
        url = new URL(baseText.trim());
    } catch (problem) {
        return {
            ok: false,
            message: "The Base URL is not a valid absolute URL."
        };
    }

    url.search = query;

    return { ok: true, href: url.href };
}


/* ---------- parsing ---------- */

const SCHEME = /^[A-Za-z][A-Za-z0-9+.\-]*:/;

function hintFor(text) {

    if (!SCHEME.test(text)) {
        return "There is no scheme such as https: at the start.";
    }

    const authority = text.match(/^[A-Za-z][A-Za-z0-9+.\-]*:\/\/([^/?#\\]*)/);

    if (authority) {

        const hostPort = authority[1].slice(authority[1].lastIndexOf("@") + 1);
        const port = hostPort.match(/:(\d+)$/);

        if (port && Number(port[1]) > 65535) {
            return "The port is outside the range 0 to 65535.";
        }

        const host = hostPort.replace(/:\d*$/, "");

        if (/\s/.test(host)) {
            return "The host contains a space or other forbidden character.";
        }

        if (host.startsWith("[") && !host.includes("]")) {
            return "The host has an opening [ without a closing ].";
        }
    }

    return null;
}

function stripDots(path) {

    const out = [];

    for (const segment of path.split("/")) {

        const s = segment.toLowerCase();

        if (s === "..") {
            if (out.length > 1) {
                out.pop();
            }
        } else if (s !== ".") {
            out.push(segment);
        }
    }

    return out.join("/");
}

function splitRaw(text) {

    const hash = text.indexOf("#");
    const beforeHash = hash === -1 ? text : text.slice(0, hash);
    const fragment = hash === -1 ? "" : text.slice(hash);
    const q = beforeHash.indexOf("?");
    const beforeQuery = q === -1 ? beforeHash : beforeHash.slice(0, q);
    const query = q === -1 ? "" : beforeHash.slice(q);
    const authority = beforeQuery.match(/^[A-Za-z][A-Za-z0-9+.\-]*:\/\/([^/\\]*)(.*)$/s);

    return {
        beforeQuery,
        query,
        fragment,
        authority: authority ? authority[1] : null,
        path: authority ? authority[2] : null
    };
}

function changesOf(text, url) {

    const changes = [];
    const raw = splitRaw(text);
    const special = url.protocol in SPECIAL_DEFAULT_PORTS || url.protocol === "file:";
    const rawScheme = (text.match(SCHEME) || [""])[0].slice(0, -1);

    if (rawScheme && rawScheme !== rawScheme.toLowerCase()) {
        changes.push("scheme lowercased");
    }

    if (raw.authority !== null) {

        const hostPort = raw.authority.slice(raw.authority.lastIndexOf("@") + 1);
        const port = (hostPort.match(/:(\d+)$/) || [])[1];
        const rawHost = hostPort.replace(/:\d*$/, "");

        if (/[^\x00-\x7F]/.test(rawHost)) {
            changes.push("non-ASCII host converted to punycode");
        } else if (
            rawHost !== rawHost.toLowerCase() &&
            rawHost.toLowerCase() === url.hostname
        ) {
            changes.push("host lowercased");
        }

        if (port && url.port === "" && SPECIAL_DEFAULT_PORTS[url.protocol] === String(Number(port))) {
            changes.push("default port removed");
        }
    }

    if (/[\t\n\r]/.test(text)) {
        changes.push("tabs or newlines removed");
    }

    const flat = text.replace(/[\t\n\r]/g, "");
    const flatRaw = splitRaw(flat);

    if (special && /\\/.test(flatRaw.beforeQuery)) {
        changes.push("backslashes treated as slashes");
    }

    if (flatRaw.path !== null) {

        const sameSlashes = flatRaw.path.replace(/\\/g, "/");
        const dotted = /(^|\/)(\.|%2e)(\.|%2e)?(\/|$)/i.test(sameSlashes);

        if (dotted) {
            changes.push("dot segments resolved");
        }

        let expected = dotted ? stripDots(sameSlashes) : sameSlashes;

        if (expected === "" && special) {
            expected = "/";
        }

        if (expected !== url.pathname) {
            changes.push("characters percent-encoded");
        }
    }

    const query = flatRaw.query === "?" ? "" : flatRaw.query;
    const fragment = flatRaw.fragment === "#" ? "" : flatRaw.fragment;

    if (
        (query !== url.search || fragment !== url.hash) &&
        !changes.includes("characters percent-encoded")
    ) {
        changes.push("characters percent-encoded");
    }

    return changes;
}

function malformedIn(label, part) {

    const found = [];

    for (let i = 0; i < part.length; i++) {

        if (part[i] !== "%") {
            continue;
        }

        if (!isHex(part[i + 1] ?? "") || !isHex(part[i + 2] ?? "")) {
            found.push({
                component: label,
                position: i,
                sequence: part.slice(i, i + 3)
            });
        }
    }

    return found;
}

function segmentsOf(pathname) {

    if (!pathname.startsWith("/")) {
        return null;
    }

    return pathname.slice(1).split("/").map((raw) => {

        const r = percentDecode(raw);

        return r.ok
            ? { raw, text: r.value, note: null }
            : {
                raw,
                text: raw,
                note: r.message.startsWith("Incomplete")
                    ? "malformed percent sequence"
                    : "not valid UTF-8"
            };
    });
}

/**
 * Parse a URL with the browser's WHATWG parser and explain the result.
 * Never fetches, opens or links the address.
 */
export function parseUrl(input, baseText = "") {

    if (input.length > MAX_PARSE_CHARS) {
        return {
            ok: false,
            message: `The URL is ${countText(input.length)} long. The limit is ${MAX_PARSE_CHARS.toLocaleString("en-US")} characters, so nothing was parsed.`
        };
    }

    const text = input.replace(/^[\u0000- ]+|[\u0000- ]+$/g, "");
    const notes = [];

    if (text !== input) {
        notes.push("Leading or trailing spaces were ignored.");
    }

    const base = baseText.replace(/^[\u0000- ]+|[\u0000- ]+$/g, "");
    let baseUrl = null;

    if (base !== "") {

        try {
            baseUrl = new URL(base);
        } catch (problem) {
            return {
                ok: false,
                field: "base",
                message: "The Base URL is not a valid absolute URL. Give a scheme such as https://."
            };
        }
    }

    if (baseUrl === null && !SCHEME.test(text)) {
        return {
            ok: false,
            message: "This is not an absolute URL. Add a scheme such as https:// or give a Base URL."
        };
    }

    let url;

    try {
        url = baseUrl ? new URL(text, baseUrl) : new URL(text);
    } catch (problem) {

        const hint = hintFor(text);

        return {
            ok: false,
            message: "The browser could not parse this as a URL." + (hint ? " " + hint : "")
        };
    }

    const scheme = url.protocol;
    const defaultPort = SPECIAL_DEFAULT_PORTS[scheme];
    const special = scheme in SPECIAL_DEFAULT_PORTS;

    const port = url.port !== ""
        ? url.port
        : defaultPort
            ? "default for the scheme"
            : "none";

    const params = parseQuery(url.search);
    const segments = segmentsOf(url.pathname);

    const malformed = [
        ...malformedIn("path", url.pathname),
        ...malformedIn("query", url.search),
        ...malformedIn("fragment", url.hash)
    ];

    const warnings = [];

    if (url.username || url.password) {
        warnings.push("This URL contains credentials.");
    }

    if (scheme !== "http:" && scheme !== "https:") {
        warnings.push(`The scheme is ${scheme.slice(0, -1)}, not http or https.`);
    }

    if (["javascript:", "data:", "vbscript:"].includes(scheme)) {
        warnings.push("This URL can run or embed content. It is shown as text and is never opened.");
    }

    if (url.hostname.split(".").some((label) => label.startsWith("xn--"))) {
        warnings.push("The host contains an internationalized (xn--) name. Check that it is the site you expect.");
    }

    if (url.hostname.startsWith("[")) {
        warnings.push("The host is an IPv6 address in brackets.");
    }

    if (params.some((row) => row.encodedTwice)) {
        warnings.push("A parameter value still contains percent-encoding. It may be encoded twice.");
    }

    const changes = baseUrl ? [] : changesOf(text, url);

    if (baseUrl) {
        notes.push("The address was resolved against the Base URL.");
    }

    return {
        ok: true,
        href: url.href,
        components: {
            scheme: scheme.slice(0, -1),
            username: url.username,
            password: url.password,
            host: url.hostname,
            port,
            path: url.pathname,
            query: url.search,
            fragment: url.hash,
            origin: special ? url.origin : "opaque"
        },
        segments,
        params,
        malformed,
        warnings,
        notes,
        changes,
        normalized: changes.length === 0
    };
}
