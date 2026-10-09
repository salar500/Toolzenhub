/**
 * Growth manifest item validation: an independent re-check of finished items against the consumer's schemaVersion 1 rules
 * (Growth OS docs/09-INTEGRATION.md sections 11 and 12a), written separately from the mapper so a mapper defect cannot
 * validate itself. Pure; it imports no Growth code. Returns every problem found as { code, id, message }.
 *
 * This checks the CONTENT array only. The envelope (counts, revision, generatedAt, fingerprint of the whole manifest)
 * and the file are the concern of the later source-state and output modules.
 *
 * It deliberately does not decide which sections may be categoryless: that is the consumer's trusted configuration
 * (Growth G3C-C). It reports the sections that currently hold categoryless tools so the owner can review them.
 */
import { ITEM_KEYS, SHA256_FINGERPRINT, canonicalJson, compareContentIds, computeItemFingerprint, isValidContentId, isValidImageNumber } from "./canonical.mjs";
import { findTextIssues } from "./text-policy.mjs";
import { isSafeSitePath } from "./items.mjs";

/** Consumer hard ceiling on manifest entries. */
export const MAX_ENTRIES = 1000;

const TAXONOMY = /^[a-z0-9][a-z0-9-]*$/;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const CAPABILITY_FLAG = /^[A-Za-z][A-Za-z0-9_]*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_KEYS = ["alt", "height", "path", "width"];

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const realIsoDate = (v) => typeof v === "string" && ISO_DATE.test(v) && new Date(`${v}T00:00:00.000Z`).toISOString().slice(0, 10) === v;
const taxonomy = (v) => typeof v === "string" && v.length > 0 && v.length <= 64 && TAXONOMY.test(v);

export function validateItems(items) {
  const problems = [];
  const add = (code, id, message) => problems.push({ code, id, message });
  if (!Array.isArray(items)) return { ok: false, problems: [{ code: "SHAPE", id: "content", message: "must be an array" }], categorylessSections: [] };
  if (items.length > MAX_ENTRIES) add("LIMIT", "content", `more than ${MAX_ENTRIES} entries`);

  const ids = new Set();
  const paths = new Map();
  const categoryless = new Set();

  for (const [index, item] of items.entries()) {
    const id = isObject(item) && typeof item.id === "string" ? item.id : `content[${index}]`;
    if (!isObject(item)) {
      add("SHAPE", id, "must be an object");
      continue;
    }
    const keys = Object.keys(item).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...ITEM_KEYS].sort())) {
      add("SHAPE", id, `must have exactly the ${ITEM_KEYS.length} contract keys (found ${keys.join(", ")})`);
      continue;
    }

    if (item.status !== "published") add("STATUS", id, "only published content may appear in a manifest");
    if (item.type !== "tool" && item.type !== "article") add("IDENTITY", id, "type must be tool or article");
    if (!isValidContentId(item.id) || item.id !== `${item.type}:${item.sourceId}`) add("IDENTITY", id, "id must be <type>:<sourceId> with a valid source id");
    if (ids.has(item.id)) add("DUPLICATE", id, "duplicate identity");
    ids.add(item.id);

    if (typeof item.slug !== "string" || !SLUG.test(item.slug) || item.slug.length > 128) add("SLUG", id, "slug is not valid");
    if (item.type === "tool" && item.slug !== item.sourceId) add("SLUG", id, "a tool's slug equals its id");

    if (!isSafeSitePath(item.canonicalPath)) add("PATH", id, "canonicalPath must be a site-relative path of [A-Za-z0-9._~/-] with no //, no . or .. segment");
    else {
      const lower = item.canonicalPath.toLowerCase();
      if (paths.has(lower)) add("PATH_DUPLICATE", id, `canonicalPath is also used by ${paths.get(lower)} (compared case-insensitively)`);
      else paths.set(lower, item.id);
    }

    if (typeof item.title !== "string" || item.title.trim().length === 0 || item.title.length > 500 || /[\t\n]/.test(item.title)) add("TITLE", id, "title must be 1-500 characters with no tab or line break");
    if (typeof item.description !== "string" || item.description.length === 0 || item.description.length > 5000) add("DESCRIPTION", id, "description must be 1-5000 characters");

    if (!taxonomy(item.section)) add("TAXONOMY", id, "section must be a taxonomy id");
    if (item.category !== null && !taxonomy(item.category)) add("TAXONOMY", id, "category must be null or a taxonomy id");
    if (item.subcategory !== null && !taxonomy(item.subcategory)) add("TAXONOMY", id, "subcategory must be null or a taxonomy id");

    if (item.type === "tool") {
      if (item.publishedAt !== null || item.updatedAt !== null) add("DATE", id, "tools carry no dates");
      if (item.category === null && typeof item.section === "string") categoryless.add(item.section);
      if (!Array.isArray(item.capabilities)) add("CAPABILITY", id, "a tool needs a capabilities array");
      else {
        if (item.capabilities.length > 64) add("CAPABILITY", id, "at most 64 capabilities");
        item.capabilities.forEach((flag, i) => {
          if (typeof flag !== "string" || flag.length > 64 || !CAPABILITY_FLAG.test(flag)) add("CAPABILITY", id, `capabilities[${i}] is not a valid flag`);
          else if (i > 0 && !(item.capabilities[i - 1] < flag)) add("CAPABILITY", id, "capabilities must be unique and sorted ascending");
        });
      }
    } else if (item.type === "article") {
      if (item.capabilities !== null) add("CAPABILITY", id, "capabilities must be null for articles");
      if (item.category === null) add("TAXONOMY", id, "an article carries its category");
      if (!realIsoDate(item.publishedAt) || !realIsoDate(item.updatedAt)) add("DATE", id, "an article needs real YYYY-MM-DD publishedAt and updatedAt");
      else if (item.updatedAt < item.publishedAt) add("DATE", id, "updatedAt is before publishedAt");
    }

    if (typeof item.marketingEligible !== "boolean") add("ELIGIBILITY", id, "marketingEligible must be a boolean");
    else if (item.marketingEligible && item.status !== "published") add("ELIGIBILITY", id, "eligible content must be published");

    if (!Array.isArray(item.relatedContentIds)) add("RELATION", id, "relatedContentIds must be an array");
    else {
      if (item.relatedContentIds.length > 500) add("RELATION", id, "at most 500 related entries");
      item.relatedContentIds.forEach((rel, i) => {
        if (!isValidContentId(rel)) return add("RELATION", id, `relatedContentIds[${i}] is not a valid content id`);
        if (rel === item.id) add("RELATION", id, `relatedContentIds[${i}] refers to the item itself`);
        if (i > 0 && isValidContentId(item.relatedContentIds[i - 1]) && compareContentIds(item.relatedContentIds[i - 1], rel) >= 0) add("RELATION", id, "relatedContentIds must be unique and sorted in canonical order");
      });
    }

    if (item.image !== null) {
      const img = item.image;
      if (!isObject(img) || JSON.stringify(Object.keys(img).sort()) !== JSON.stringify(IMAGE_KEYS)) add("IMAGE", id, `image must be null or exactly { ${IMAGE_KEYS.join(", ")} }`);
      else {
        if (!isSafeSitePath(img.path) || !img.path.startsWith("/assets/Images/")) add("IMAGE", id, "image path must be a safe local path under /assets/Images/");
        if (typeof img.alt !== "string" || img.alt.trim().length === 0) add("IMAGE", id, "image alt text is required");
        if (!isValidImageNumber(img.width) || !isValidImageNumber(img.height) || img.width < 1 || img.height < 1) add("IMAGE", id, "image width and height must be positive integers up to 1000000");
        try {
          if (canonicalJson(img).length > 4096) add("IMAGE", id, "image descriptor exceeds 4096 characters");
        } catch {
          add("IMAGE", id, "image descriptor holds a value that cannot be serialized");
        }
      }
    }

    if (typeof item.sourceFingerprint !== "string" || !SHA256_FINGERPRINT.test(item.sourceFingerprint)) add("FINGERPRINT", id, "sourceFingerprint must be sha256:<64 lowercase hex>");
    else {
      try {
        if (computeItemFingerprint(item) !== item.sourceFingerprint) add("FINGERPRINT", id, "sourceFingerprint does not match the item content");
      } catch (cause) {
        add("FINGERPRINT", id, `item cannot be fingerprinted: ${cause.message}`);
      }
    }

    for (const issue of findTextIssues(item, id)) add("TEXT_POLICY", id, `${issue.path} ${issue.message}`);
  }

  // whole-set rules: every relationship target is in the set, and the order is canonical
  for (const item of items) {
    if (!isObject(item) || !Array.isArray(item.relatedContentIds)) continue;
    for (const target of item.relatedContentIds) if (typeof target === "string" && !ids.has(target)) add("RELATION", item.id, `${target} is not in the manifest`);
  }
  for (let i = 1; i < items.length; i++) {
    const a = items[i - 1]?.id;
    const b = items[i]?.id;
    if (isValidContentId(a) && isValidContentId(b) && compareContentIds(a, b) > 0) {
      add("ORDER", b, "is out of canonical order (tools first by id, then articles by number)");
      break;
    }
  }

  return { ok: problems.length === 0, problems, categorylessSections: [...categoryless].sort() };
}
