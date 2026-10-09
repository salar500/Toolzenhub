/**
 * Growth manifest `generatedAt` from an explicitly supplied Git committer time. Pure: it reads no clock, no
 * environment and no repository. Discovering the committer time (git log -1 --format=%ct) is the job of the later
 * source-state module (G3C-B4).
 *
 * Contract (Growth OS docs/09-INTEGRATION.md section 12a, "Generated timestamp"): the ToolZenHub producer sets
 * `generatedAt` to the source revision's Git committer time (UTC, with milliseconds), never the time the export ran, so
 * the same revision always yields the same bytes. The consumer requires a real UTC instant formatted
 * YYYY-MM-DDTHH:mm:ss.sssZ and flags a manifest more than 24 hours ahead of its local clock as FUTURE_MANIFEST.
 *
 * The future check needs "now", which this module will not read. The caller passes it explicitly as `nowMs`, and it is
 * used ONLY to refuse a committer time that is more than 24 hours ahead, never as the exported value.
 *
 * Accepted range: epoch 0 (1970-01-01T00:00:00.000Z) through 9999-12-31T23:59:59Z. Anything past year 9999 does not fit
 * the four-digit-year format and is refused. Negative values (and negative zero) are refused by the owner decision of
 * G3C-B1: git prints committer time as non-negative Unix seconds, so a negative value is not a supported source revision.
 * That is the one narrowing of the consumer, which would also parse a pre-1970 instant; epoch 0 itself is accepted.
 */

/** The consumer's FUTURE_MANIFEST tolerance: more than 24 hours ahead of the local clock. */
export const MAX_FUTURE_SKEW_MS = 24 * 60 * 60 * 1000;

const MAX_EPOCH_SECONDS = 253402300799; // 9999-12-31T23:59:59Z
const EPOCH_TEXT = /^(0|[1-9][0-9]{0,11})$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Validate a committer time given as git prints it (decimal seconds since the Unix epoch, as a string or an integer
 * number) and format it. Returns { ok: true, epochSeconds, iso } or { ok: false, reason }. Never throws.
 * `nowMs` (milliseconds since the epoch, required) is only the reference for the 24-hour future check.
 */
export function parseCommitterTime(raw, { nowMs } = {}) {
  if (typeof nowMs !== "number" || !Number.isFinite(nowMs)) {
    return { ok: false, reason: "nowMs must be supplied as a finite number (it is only the reference for the future check)" };
  }
  let seconds;
  if (typeof raw === "string") {
    if (!EPOCH_TEXT.test(raw)) return { ok: false, reason: "committer time must be decimal seconds with no sign, fraction, exponent, space or leading zero" };
    seconds = Number(raw);
  } else if (typeof raw === "number") {
    seconds = raw;
  } else {
    return { ok: false, reason: "committer time must be a decimal string or an integer number of seconds" };
  }
  if (!Number.isSafeInteger(seconds) || Object.is(seconds, -0)) return { ok: false, reason: "committer time must be a whole number of seconds" };
  if (seconds < 0) return { ok: false, reason: "committer time must not be before the Unix epoch" };
  if (seconds > MAX_EPOCH_SECONDS) return { ok: false, reason: "committer time is beyond year 9999" };
  if (seconds * 1000 - nowMs > MAX_FUTURE_SKEW_MS) return { ok: false, reason: "committer time is more than 24 hours in the future" };
  return { ok: true, epochSeconds: seconds, iso: new Date(seconds * 1000).toISOString() };
}

/** parseCommitterTime, throwing a RangeError with the reason on failure; returns the formatted timestamp. */
export function formatCommitterTime(raw, options) {
  const parsed = parseCommitterTime(raw, options);
  if (!parsed.ok) throw new RangeError(parsed.reason);
  return parsed.iso;
}

/** True for a real UTC instant written exactly as YYYY-MM-DDTHH:mm:ss.sssZ (the consumer's check). */
export function isManifestTimestamp(value) {
  if (typeof value !== "string" || !TIMESTAMP.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString() === value;
}
