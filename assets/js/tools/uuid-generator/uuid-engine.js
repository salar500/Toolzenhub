/* =========================================================
   ToolZen Hub
   UUID Generator: the engine

   Pure functions. No DOM, network, storage or code execution. The
   engine never reads the clock or a random source itself: the caller
   passes them in, so every rule here is tested with fixed bytes.

   Layouts follow RFC 9562 (128 bits, written as 8-4-4-4-12 hex):

   v4   122 random bits; version nibble 0100; variant bits 10.
   v7   48-bit Unix time in milliseconds, version nibble 0111, a
        12-bit rand_a, variant bits 10, 62 random bits (rand_b).
        Ordering inside one batch uses RFC 9562 section 6.2 method 1:
        rand_a is a fixed-length counter placed right after the
        timestamp. It is seeded at random below 2048 (so a batch has
        room) on each new millisecond, and incremented by 1 for each
        further UUID in the same millisecond. If it would pass 4095
        the timestamp is moved one millisecond ahead and the counter
        is seeded again (the "increment the timestamp" option of
        section 6.2). So the UUIDs of a batch always sort in the
        order they were made, and the timestamp of a very large batch
        can run slightly ahead of the real clock.
   nil  all 128 bits zero.

   A UUID is an identifier, not a secret: RFC 9562 section 8 says it
   must not be used as a security capability.
========================================================= */

export const MAX_COUNT = 1000;
export const DEFAULT_COUNT = 5;
export const VERSIONS = ["v4", "v7", "nil"];

const MAX_TIMESTAMP = 2 ** 48 - 1;
const COUNTER_SEED_LIMIT = 2048;
const COUNTER_MAX = 4095;

const HEX = "0123456789abcdef";

function hex(bytes) {

    let out = "";

    for (const b of bytes) {
        out += HEX[b >> 4] + HEX[b & 15];
    }

    return out;
}

/** 16 bytes -> "8-4-4-4-12" lower-case hex */
export function toCanonical(bytes) {

    const h = hex(bytes);

    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** apply the display options to a canonical (lower-case, hyphenated) UUID */
export function formatUuid(canonical, options = {}) {

    let text = canonical;

    if (options.hyphens === false) {
        text = text.replaceAll("-", "");
    }

    if (options.uppercase) {
        text = text.toUpperCase();
    }

    if (options.braces) {
        text = `{${text}}`;
    }

    return text;
}

export function v4(randomBytes) {

    const b = Uint8Array.from(randomBytes(16));

    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;

    return b;
}

export function nil() {
    return new Uint8Array(16);
}

/**
 * A batch of v7 UUIDs as byte arrays.
 * @param {number} count
 * @param {() => number} now     milliseconds since the Unix epoch
 * @param {(n: number) => Uint8Array} randomBytes
 */
export function v7Batch(count, now, randomBytes) {

    let ts = Math.floor(now());

    if (!Number.isFinite(ts) || ts < 0 || ts > MAX_TIMESTAMP) {
        throw new RangeError("The clock is outside the range a UUIDv7 can hold.");
    }

    const seed = () => {
        const r = randomBytes(2);
        return (r[0] | (r[1] << 8)) % COUNTER_SEED_LIMIT;
    };

    let counter = seed();
    const out = [];

    for (let i = 0; i < count; i++) {

        if (i > 0) {

            counter++;

            if (counter > COUNTER_MAX) {

                ts++;
                counter = seed();

                if (ts > MAX_TIMESTAMP) {
                    throw new RangeError("The clock is outside the range a UUIDv7 can hold.");
                }
            }
        }

        const r = Uint8Array.from(randomBytes(8));
        const b = new Uint8Array(16);

        /* 48-bit big-endian timestamp (no 32-bit bit operations on it) */
        let t = ts;

        for (let k = 5; k >= 0; k--) {
            b[k] = t % 256;
            t = Math.floor(t / 256);
        }

        b[6] = 0x70 | (counter >> 8);
        b[7] = counter & 0xff;
        b[8] = 0x80 | (r[0] & 0x3f);
        b.set(r.subarray(1), 9);

        out.push(b);
    }

    return out;
}

/**
 * Generate UUIDs.
 *   options: { version: "v4" | "v7" | "nil", count, uppercase, hyphens, braces }
 *   deps:    { randomBytes(n) -> Uint8Array, now() -> ms }   (not needed for nil)
 * Returns { ok: true, uuids: string[], version, count } or { ok: false, message }.
 */
export function generate(options = {}, deps = {}) {

    const version = options.version ?? "v4";
    const count = options.count === undefined ? DEFAULT_COUNT : options.count;

    if (!VERSIONS.includes(version)) {
        return { ok: false, message: "Choose version 4, version 7 or nil." };
    }

    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
        return { ok: false, message: `Enter a whole number from 1 to ${MAX_COUNT}.` };
    }

    let list;

    try {

        if (version === "nil") {
            list = Array.from({ length: count }, nil);
        } else if (typeof deps.randomBytes !== "function") {
            return { ok: false, message: "This browser has no secure random number source, so no UUIDs were made." };
        } else if (version === "v4") {
            list = Array.from({ length: count }, () => v4(deps.randomBytes));
        } else {
            list = v7Batch(count, deps.now, deps.randomBytes);
        }

    } catch (problem) {
        return { ok: false, message: problem.message };
    }

    return {
        ok: true,
        version,
        count,
        uuids: list.map((bytes) => formatUuid(toCanonical(bytes), options))
    };
}

/**
 * Read a UUID back (any display format above). For checking and for tests.
 * Returns { valid: false } or { valid: true, version, variant, timestampMs }.
 */
export function inspect(text) {

    const m = /^\{?([0-9a-fA-F]{8})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{12})\}?$/.exec(String(text).trim());

    if (!m) {
        return { valid: false };
    }

    const h = m.slice(1).join("").toLowerCase();
    const version = parseInt(h[12], 16);
    const variantNibble = parseInt(h[16], 16);

    return {
        valid: true,
        version,
        variant: variantNibble >> 2 === 2 ? "RFC 9562" : "other",
        timestampMs: version === 7 ? parseInt(h.slice(0, 12), 16) : null
    };
}
