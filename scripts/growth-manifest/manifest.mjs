/**
 * Growth manifest envelope: builds and independently validates the complete schemaVersion 1 manifest file.
 *
 * Pure. The items come from the B2 mapper; the revision and generatedAt come from Git (source-state.mjs + source-time.mjs).
 * Nothing here reads a clock, a file or the environment, so identical inputs give identical bytes.
 *
 * The envelope carries only documented facts: schemaVersion, the site id, the generator, generatedAt (the source revision's
 * committer time), the source revision with dirty:false (a dirty source is refused before this point), counts, the manifest
 * fingerprint and the content. declaredCanonicalOrigin is informational and optional in the contract and is NOT written:
 * the destination origin is a Growth-side owner decision, never the website's. `retired` carries the ledger's recorded
 * retirements as advisories and is omitted when there are none, as the contract recommends.
 */
import { SHA256_FINGERPRINT, compareContentIds, computeFileHash, computeManifestFingerprint, encodeManifestFile, isCanonicalManifestFileBytes, isValidContentId } from "./canonical.mjs";
import { isManifestTimestamp } from "./source-time.mjs";
import { MAX_ENTRIES, validateItems } from "./validate.mjs";

export const MANIFEST_SCHEMA = 1;
export const SITE_ID = "toolzenhub";
export const GENERATOR = Object.freeze({ name: "toolzenhub-growth-manifest", version: "1.0.0" });
/** Consumer hard ceiling for the file. */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

const REVISION = /^[0-9a-f]{40}$/;
const ENVELOPE_KEYS = ["content", "counts", "generatedAt", "generator", "manifestFingerprint", "schemaVersion", "site", "source"];
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** The ledger's recorded retirements as { id, reason } advisories, in canonical content-id order. */
export function retiredAdvisories(ledger) {
  const out = [];
  for (const a of ledger?.articles ?? []) if (a.state === "retired") out.push({ id: `article:${a.id}`, reason: a.retired.reason });
  for (const t of ledger?.tools ?? []) if (t.state === "retired") out.push({ id: `tool:${t.id}`, reason: t.retired.reason });
  return out.sort((x, y) => compareContentIds(x.id, y.id));
}

/** The manifest object (not yet validated or serialized). `retired` is omitted when empty. */
export function buildManifest({ items, revision, generatedAt, retired = [] }) {
  const manifest = {
    schemaVersion: MANIFEST_SCHEMA,
    site: { id: SITE_ID },
    generator: { name: GENERATOR.name, version: GENERATOR.version },
    generatedAt,
    source: { revision, dirty: false },
    counts: { tools: items.filter((i) => i.type === "tool").length, articles: items.filter((i) => i.type === "article").length },
    manifestFingerprint: computeManifestFingerprint(MANIFEST_SCHEMA, SITE_ID, items),
    content: items,
  };
  if (retired.length > 0) manifest.retired = retired;
  return manifest;
}

/**
 * Validates manifest FILE BYTES from scratch (it trusts nothing the builder said): canonical form, envelope, counts,
 * fingerprints, every item, the retired advisories, and the consumer's size ceilings. Never throws.
 */
export function validateManifestFile(bytes) {
  const problems = [];
  const add = (code, id, message) => problems.push({ code, id, message });
  try {
    if (!(bytes instanceof Uint8Array)) return { ok: false, problems: [{ code: "FILE", id: "file", message: "must be bytes" }] };
    if (bytes.length > MAX_FILE_BYTES) add("FILE", "file", `larger than ${MAX_FILE_BYTES} bytes`);
    if (!isCanonicalManifestFileBytes(bytes)) return { ok: false, problems: [...problems, { code: "FILE", id: "file", message: "is not the canonical on-disk form (UTF-8, no BOM, sorted keys, 2-space indent, LF, one trailing newline)" }] };
    const m = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!isObject(m)) return { ok: false, problems: [{ code: "ENVELOPE", id: "manifest", message: "must be an object" }] };
    const keys = Object.keys(m).sort();
    if (!ENVELOPE_KEYS.every((k) => keys.includes(k)) || !keys.every((k) => ENVELOPE_KEYS.includes(k) || k === "retired")) add("ENVELOPE", "manifest", `must have exactly the keys ${ENVELOPE_KEYS.join(", ")} (and retired when non-empty)`);
    if (m.schemaVersion !== MANIFEST_SCHEMA) add("ENVELOPE", "schemaVersion", `must be ${MANIFEST_SCHEMA}`);
    if (!isObject(m.site) || JSON.stringify(Object.keys(m.site)) !== '["id"]' || m.site.id !== SITE_ID) add("ENVELOPE", "site", `must be exactly { id: "${SITE_ID}" } (no origin is declared)`);
    if (!isObject(m.generator) || m.generator.name !== GENERATOR.name || m.generator.version !== GENERATOR.version || Object.keys(m.generator).length !== 2) add("ENVELOPE", "generator", "must be the producer's name and version");
    if (!isManifestTimestamp(m.generatedAt)) add("ENVELOPE", "generatedAt", "must be a real UTC instant YYYY-MM-DDTHH:mm:ss.sssZ");
    if (!isObject(m.source) || Object.keys(m.source).sort().join() !== "dirty,revision" || !REVISION.test(m.source.revision) || m.source.dirty !== false) add("ENVELOPE", "source", "must be { revision: 40 lowercase hex, dirty: false }");
    if (!Array.isArray(m.content)) {
      add("ENVELOPE", "content", "must be an array");
      return { ok: false, problems };
    }
    if (m.content.length > MAX_ENTRIES) add("LIMIT", "content", `more than ${MAX_ENTRIES} entries`);
    const checked = validateItems(m.content);
    for (const p of checked.problems) problems.push(p);
    const tools = m.content.filter((i) => i?.type === "tool").length;
    const articles = m.content.filter((i) => i?.type === "article").length;
    if (!isObject(m.counts) || m.counts.tools !== tools || m.counts.articles !== articles || Object.keys(m.counts).length !== 2) add("COUNTS", "counts", `must equal the content (${tools} tools, ${articles} articles)`);
    if (typeof m.manifestFingerprint !== "string" || !SHA256_FINGERPRINT.test(m.manifestFingerprint)) add("FINGERPRINT", "manifestFingerprint", "must be sha256:<64 lowercase hex>");
    else if (checked.ok && computeManifestFingerprint(MANIFEST_SCHEMA, SITE_ID, m.content) !== m.manifestFingerprint) add("FINGERPRINT", "manifestFingerprint", "does not match the content");
    if (m.retired !== undefined) {
      const ids = new Set(m.content.map((i) => i?.id));
      if (!Array.isArray(m.retired) || m.retired.length === 0) add("RETIRED", "retired", "must be a non-empty array, or omitted");
      else {
        m.retired.forEach((r, i) => {
          if (!isObject(r) || Object.keys(r).sort().join() !== "id,reason" || !isValidContentId(r.id) || typeof r.reason !== "string" || r.reason.trim().length === 0 || r.reason.length > 200 || /[\t\n]/.test(r.reason)) add("RETIRED", `retired[${i}]`, "must be { id, reason } with a valid id and a one-line reason of at most 200 characters");
          else {
            if (ids.has(r.id)) add("RETIRED", `retired[${i}]`, "a retired identity must not also be published");
            if (i > 0 && isValidContentId(m.retired[i - 1]?.id) && compareContentIds(m.retired[i - 1].id, r.id) >= 0) add("RETIRED", `retired[${i}]`, "must be unique and sorted in canonical order");
          }
        });
      }
    }
  } catch (cause) {
    add("FILE", "file", `could not be validated (${cause?.message ?? "error"})`);
  }
  return { ok: problems.length === 0, problems };
}

/**
 * Builds the manifest and its canonical bytes, then validates those bytes from scratch.
 * Returns { ok, bytes, manifest, fileHash, manifestFingerprint, errors }; bytes only when ok.
 */
export function buildManifestBytes({ items, revision, generatedAt, retired = [] }) {
  const fail = (errors) => ({ ok: false, bytes: null, manifest: null, fileHash: null, manifestFingerprint: null, errors });
  if (typeof revision !== "string" || !REVISION.test(revision)) return fail([{ code: "ENVELOPE", id: "source.revision", message: "must be a 40-character lowercase hex commit id" }]);
  if (!isManifestTimestamp(generatedAt)) return fail([{ code: "ENVELOPE", id: "generatedAt", message: "must be a real UTC instant YYYY-MM-DDTHH:mm:ss.sssZ" }]);
  let manifest;
  let bytes;
  try {
    manifest = buildManifest({ items, revision, generatedAt, retired });
    bytes = encodeManifestFile(manifest);
  } catch (cause) {
    return fail([{ code: "SERIALIZE", id: "manifest", message: `cannot be serialized (${cause.message})` }]);
  }
  const check = validateManifestFile(bytes);
  if (!check.ok) return fail(check.problems);
  return { ok: true, bytes, manifest, fileHash: computeFileHash(bytes), manifestFingerprint: manifest.manifestFingerprint, errors: [] };
}
