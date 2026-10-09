/**
 * Growth manifest canonical core (schemaVersion 1): serialization, ordering and fingerprints.
 *
 * Standalone implementation of the consumer contract (Growth OS docs/09-INTEGRATION.md section 12a, ADR-0004 and its
 * Amendment 1). Node built-ins only; nothing here imports Growth code or reads the site registries. The vendored golden
 * vectors (tests/fixtures/growth-manifest/) are the reference data this module must reproduce exactly.
 *
 * TWO canonical forms:
 *  A. canonicalJson(): hash input. Object keys sorted by UTF-16 code unit at every level, arrays in the given order, no
 *     whitespace, JSON string escaping.
 *  B. serializeManifestFile(): the exact text of the manifest file. UTF-8 (encodeManifestFile), no BOM, LF, two-space
 *     indentation (the JSON.stringify(value, null, 2) layout; empty array "[]", empty object "{}"), keys sorted as in A,
 *     exactly one trailing newline.
 *
 * Both are built by hand instead of via JSON.stringify(sortedCopy): a JavaScript object enumerates integer-like keys
 * (for example "10") ahead of other keys whatever order they are inserted in, which would silently defeat a key sort.
 * Sorting an explicit key list and emitting text keeps the order exactly "UTF-16 code unit", independent of locale.
 *
 * Numbers: only safe integers may appear (schemaVersion, counts, image metadata). Anything else is refused here
 * instead of being formatted: NaN, Infinity, fractions, exponents, unsafe integers and negative zero. A safe integer
 * formats as plain decimal digits under JavaScript number semantics, the same text in every locale.
 *
 * Strings: this module escapes them (JSON rules) but does not judge them. The character policy and NFC rule live in
 * text-policy.mjs and are applied by the caller before export.
 */
import { createHash } from "node:crypto";

export const MANIFEST_SCHEMA_VERSION = 1;
export const FINGERPRINT_PREFIX = "sha256:";
export const SHA256_FINGERPRINT = /^sha256:[0-9a-f]{64}$/;

/** Every key an item carries, optional facts as explicit null (the 18 item keys of the consumer contract). */
export const ITEM_KEYS = Object.freeze([
  "id", "type", "sourceId", "slug", "canonicalPath", "title", "description", "status", "section", "category", "subcategory",
  "publishedAt", "updatedAt", "marketingEligible", "relatedContentIds", "image", "capabilities", "sourceFingerprint",
]);

/** Keys the consumer rejects outright at any level; refusing to write them keeps the producer from emitting them. */
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Internal recursion guard against runaway or cyclic input; not a contract number (the consumer enforces its own). */
const MAX_NESTING = 64;

/** Image metadata numbers: non-negative integers up to this bound (consumer contract). */
export const IMAGE_NUMBER_MAX = 1000000;

const TOOL_SOURCE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const ARTICLE_SOURCE_ID = /^[1-9][0-9]{0,15}$/;
const IMAGE_NUMBER_TEXT = /^(0|[1-9][0-9]{0,6})$/;

/** Code-unit comparison, locale independent (never localeCompare). */
function compareCodeUnits(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function formatNumber(value, path) {
  if (!Number.isSafeInteger(value) || Object.is(value, -0)) {
    throw new RangeError(`${path || "<root>"}: only safe integers may appear as JSON numbers (got ${String(value)})`);
  }
  return String(value);
}

function sortedKeys(object, path) {
  const keys = Object.keys(object);
  for (const key of keys) {
    if (UNSAFE_KEYS.has(key)) throw new TypeError(`${path || "<root>"}: unsafe key ${JSON.stringify(key)}`);
  }
  return keys.sort(compareCodeUnits);
}

function walk(value, path, depth, indent) {
  if (depth > MAX_NESTING) throw new RangeError(`${path || "<root>"}: nested deeper than ${MAX_NESTING}`);
  if (value === null) return "null";
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      return formatNumber(value, path);
    case "object":
      break;
    default:
      throw new TypeError(`${path || "<root>"}: ${typeof value} is not JSON-safe`);
  }

  const pretty = indent !== null;
  const inner = pretty ? indent + "  " : "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const parts = [];
    for (let i = 0; i < value.length; i++) {
      if (!(i in value)) throw new TypeError(`${path}[${i}]: sparse arrays are not JSON-safe`);
      parts.push(walk(value[i], `${path}[${i}]`, depth + 1, pretty ? inner : null));
    }
    return pretty ? "[\n" + parts.map((p) => inner + p).join(",\n") + "\n" + indent + "]" : "[" + parts.join(",") + "]";
  }
  if (!isPlainObject(value)) throw new TypeError(`${path || "<root>"}: only plain objects, arrays and primitives are JSON-safe`);
  const keys = sortedKeys(value, path);
  if (keys.length === 0) return "{}";
  const parts = keys.map((key) => {
    const child = walk(value[key], path ? `${path}.${key}` : key, depth + 1, pretty ? inner : null);
    return pretty ? inner + JSON.stringify(key) + ": " + child : JSON.stringify(key) + ":" + child;
  });
  return pretty ? "{\n" + parts.join(",\n") + "\n" + indent + "}" : "{" + parts.join(",") + "}";
}

/** Form A: canonical in-memory JSON, used only as hash input. */
export function canonicalJson(value) {
  return walk(value, "", 0, null);
}

/** Form B: the exact text of a manifest file (write it as UTF-8 without a BOM; see encodeManifestFile). */
export function serializeManifestFile(value) {
  return walk(value, "", 0, "") + "\n";
}

/** Form B as bytes: UTF-8, no byte-order mark. */
export function encodeManifestFile(value) {
  return new Uint8Array(Buffer.from(serializeManifestFile(value), "utf8"));
}

export function sha256Hex(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function sha256HexBytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** The file hash the operator confirms: bare lowercase hex SHA-256 of the file bytes. */
export function computeFileHash(bytes) {
  return sha256HexBytes(bytes);
}

/**
 * Item fingerprint: "sha256:" + hex SHA-256 of the UTF-8 bytes of canonicalJson (form A) of the item with every field
 * EXCEPT sourceFingerprint. No manifest-level field takes part.
 */
export function computeItemFingerprint(item) {
  if (!isPlainObject(item)) throw new TypeError("item must be a plain object");
  const rest = {};
  for (const key of Object.keys(item)) if (key !== "sourceFingerprint") rest[key] = item[key];
  return FINGERPRINT_PREFIX + sha256Hex(canonicalJson(rest));
}

/**
 * Manifest fingerprint: "sha256:" + hex SHA-256 of canonicalJson of { schemaVersion, siteId, items: [{ id,
 * sourceFingerprint }, ...] } with the items in manifest (contract) order. generatedAt, generator, source revision,
 * origin, counts and retired are excluded.
 */
export function computeManifestFingerprint(schemaVersion, siteId, items) {
  return (
    FINGERPRINT_PREFIX +
    sha256Hex(canonicalJson({ schemaVersion, siteId, items: items.map((i) => ({ id: i.id, sourceFingerprint: i.sourceFingerprint })) }))
  );
}

/** True when a file is exactly the canonical form B of what it parses to (the consumer's own acceptance test). */
export function isCanonicalManifestFileBytes(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return false;
  }
  try {
    return serializeManifestFile(JSON.parse(text)) === text;
  } catch {
    return false;
  }
}

export function isValidContentId(id) {
  if (typeof id !== "string") return false;
  const colon = id.indexOf(":");
  if (colon <= 0) return false;
  const type = id.slice(0, colon);
  const rest = id.slice(colon + 1);
  if (type === "tool") return TOOL_SOURCE_ID.test(rest);
  if (type === "article") return ARTICLE_SOURCE_ID.test(rest);
  return false;
}

/**
 * Total order for valid content ids: tools before articles; tools by source id in UTF-16 code-unit order; articles by
 * numeric value (shorter digit strings first, then lexicographic: no leading zeros). Unlike the consumer, which assumes
 * valid input, an invalid id throws here so that a mapper bug cannot be sorted silently into the output.
 */
export function compareContentIds(a, b) {
  if (!isValidContentId(a)) throw new TypeError(`invalid content id: ${JSON.stringify(a)}`);
  if (!isValidContentId(b)) throw new TypeError(`invalid content id: ${JSON.stringify(b)}`);
  const ca = a.indexOf(":");
  const cb = b.indexOf(":");
  const typeA = a.slice(0, ca);
  const typeB = b.slice(0, cb);
  if (typeA !== typeB) return typeA === "tool" ? -1 : 1;
  const ra = a.slice(ca + 1);
  const rb = b.slice(cb + 1);
  if (typeA === "article" && ra.length !== rb.length) return ra.length < rb.length ? -1 : 1;
  return compareCodeUnits(ra, rb);
}

/** A new array of valid content ids in canonical order. */
export function sortContentIds(ids) {
  return [...ids].sort(compareContentIds);
}

/** A new array of objects with an `id` in canonical manifest order (tools first, then articles numerically). */
export function sortItemsCanonical(items) {
  return [...items].sort((x, y) => compareContentIds(x.id, y.id));
}

/** True for the plain-decimal text of an image metadata number: 0 to 1000000, no sign, fraction, exponent or leading zero. */
export function isCanonicalImageNumberText(text) {
  return typeof text === "string" && IMAGE_NUMBER_TEXT.test(text) && Number(text) <= IMAGE_NUMBER_MAX;
}

/** True for a value that may be written as image metadata: a non-negative integer up to 1000000 (never -0). */
export function isValidImageNumber(value) {
  return Number.isSafeInteger(value) && !Object.is(value, -0) && value >= 0 && value <= IMAGE_NUMBER_MAX;
}
