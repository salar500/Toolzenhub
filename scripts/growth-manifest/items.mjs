/**
 * Growth manifest items: maps the published ToolZenHub registries to schemaVersion 1 manifest items.
 *
 * PURE. This module reads no file, writes nothing, uses no clock and no network. It receives a registry description
 * (see "Registry input" below), so the same code runs on the real catalogs (registry.mjs gathers them and the file-system
 * facts) and on small synthetic registries in tests.
 *
 * Rules (Growth OS docs/09-INTEGRATION.md sections 5, 7 and 12a):
 *  - Only published tools and articles are exported. A coming-soon entry is skipped before any check, so it cannot leak
 *    and cannot fail the export. Any other status is an error, never a silent skip.
 *  - FAIL CLOSED: a published entry with invalid or missing required metadata or implementation is an ERROR. Nothing is
 *    excluded quietly, nothing is invented, defaulted or repaired. On any error no items are returned.
 *  - Section and category are taxonomy ids, never display titles. A tool that names `sectionId` instead of a category
 *    exports `category: null`; a category is never inferred from a section. Which sections may be categoryless is the
 *    consumer's trusted configuration (Growth G3C-C), not decided here.
 *  - Titles and descriptions are the catalog's own (not the SEO text, which carries the brand suffix).
 *  - Dates come from the catalog's display strings ("Aug 25, 2026") and are converted strictly; a missing or malformed date
 *    is an error. Tools carry no dates.
 *  - Relationships are the CURATED links written in the catalogs (tool.relatedTools, tool.relatedArticles, article.tools,
 *    article.related). The site's automatic "fill" is a display heuristic, not source truth, and is not exported. A target
 *    that exists but is not published is filtered out (the contract requires targets to be published) and reported as a
 *    notice; an unknown target, a self reference or a duplicate is an error.
 *  - marketingEligible is the documented source-side computation (section 5): status published AND a valid page contract
 *    exists AND the item passes validation. It is NOT a human marketing approval and not permission to publish anything.
 *
 * Registry input: {
 *   tools, articles               built catalogs (assets/js/data/tools.js, articles.js)
 *   sections, categories, subcategories   taxonomy (assets/js/data/categories.js)
 *   capabilityKeys                the capability vocabulary (assets/js/data/tool-capabilities.js)
 *   facts: {
 *     toolModules:    { [toolId]: { ok, error? } }      the tool's implementation file exists
 *     toolStyles:     [toolId]                          ids with an entry in src/_data/toolStyles.json
 *     articleContent: { [articleKey]: { ok, error? } }  the content module loads and yields an article
 *     images:         { [src]: { ok, width, height, error? } }  verified local hero image files
 *   }
 * }
 * Returns { ok, items, errors, notices }. `items` (fingerprinted, canonical order) only when ok.
 */
import { canonicalJson, computeItemFingerprint, isValidContentId, isValidImageNumber, sortContentIds, sortItemsCanonical } from "./canonical.mjs";
import { findTextIssues } from "./text-policy.mjs";

/** Local hero images must live under this site-relative directory. */
export const APPROVED_IMAGE_PREFIX = "/assets/Images/";

const TOOL_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOPIC = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const TAXONOMY = /^[a-z0-9][a-z0-9-]*$/;
const CAPABILITY_FLAG = /^[A-Za-z][A-Za-z0-9_]*$/;
const PATH_PROFILE = /^\/[A-Za-z0-9._~/-]*$/;
const DISPLAY_DATE = /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/;
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const LIMITS = { title: 500, description: 5000, slug: 128, taxonomy: 64, path: 2048, capabilities: 64, capabilityFlag: 64, imageJson: 4096 };

export const SOURCE_STATUS = Object.freeze({ published: "published", comingSoon: "coming-soon" });

/** A site-relative path the consumer accepts: one leading slash, [A-Za-z0-9._~/-] only, no "//", no "." or ".." segment. */
export function isSafeSitePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= LIMITS.path &&
    PATH_PROFILE.test(value) &&
    !value.includes("//") &&
    !value.split("/").some((s) => s === "." || s === "..")
  );
}

/** Converts a catalog display date ("Aug 25, 2026") to YYYY-MM-DD, or null when it is not exactly that form or not a real date. */
export function parseDisplayDate(text) {
  if (typeof text !== "string") return null;
  const m = DISPLAY_DATE.exec(text);
  if (m === null || !Object.prototype.hasOwnProperty.call(MONTHS, m[1])) return null;
  const month = MONTHS[m[1]];
  const day = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * The documented source-side computation (Growth docs/09 section 5). It reports that the item is published, has a valid
 * page contract and passed validation. It is not approval to market, post or export anything.
 */
export function computeMarketingEligible({ status, pageContractValid, itemIssues }) {
  return status === SOURCE_STATUS.published && pageContractValid === true && itemIssues === 0;
}

const isText = (v) => typeof v === "string" && v.trim().length > 0;
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function mapRegistry(registry) {
  const errors = [];
  const notices = [];
  const error = (code, id, message) => errors.push({ code, id, message });
  const notice = (code, id, message) => notices.push({ code, id, message });

  const sections = new Map((registry.sections ?? []).map((s) => [s.id, s]));
  const categories = new Map((registry.categories ?? []).map((c) => [c.id, c]));
  const subcategories = new Set((registry.subcategories ?? []).map((s) => s.id));
  const capabilityKeys = new Set(registry.capabilityKeys ?? []);
  const facts = registry.facts ?? {};
  const toolStyles = new Set(facts.toolStyles ?? []);

  // ---- eligibility: published only; an unrecognized status is an error, never a silent skip
  const publishedTools = [];
  for (const t of registry.tools ?? []) {
    const id = `tool:${t?.id}`;
    if (t?.status === SOURCE_STATUS.published) publishedTools.push(t);
    else if (t?.status !== SOURCE_STATUS.comingSoon) error("STATUS_UNSUPPORTED", id, `status ${JSON.stringify(t?.status)} is neither published nor coming-soon`);
  }
  const publishedArticles = [];
  for (const a of registry.articles ?? []) {
    const id = `article:${a?.id}`;
    if (a?.status === SOURCE_STATUS.published) publishedArticles.push(a);
    else if (a?.status !== SOURCE_STATUS.comingSoon) error("STATUS_UNSUPPORTED", id, `status ${JSON.stringify(a?.status)} is neither published nor coming-soon`);
  }

  const toolsById = new Map();
  for (const t of publishedTools) {
    if (typeof t.id === "string" && toolsById.has(t.id)) error("ID_DUPLICATE", `tool:${t.id}`, "duplicate published tool id");
    else toolsById.set(t.id, t);
  }
  const articlesByKey = new Map();
  const articleIds = new Set();
  for (const a of publishedArticles) {
    const id = `article:${a.id}`;
    if (articleIds.has(a.id)) error("ID_DUPLICATE", id, "duplicate published article id");
    articleIds.add(a.id);
    const key = `${a.topic}/${a.slug}`;
    if (articlesByKey.has(key)) error("KEY_DUPLICATE", id, `duplicate topic/slug ${key}`);
    else articlesByKey.set(key, a);
  }
  // known-but-unpublished targets (to filter) versus unknown ones (an error)
  const knownToolIds = new Set((registry.tools ?? []).map((t) => t?.id));
  const knownArticleKeys = new Set((registry.articles ?? []).map((a) => `${a?.topic}/${a?.slug}`));

  /** Resolves a list of reference ids to content ids. `kind` is "tool" or "article"; `self` is the owner's content id. */
  function relations(owner, list, field, kind) {
    const out = [];
    if (list === undefined || list === null) return out;
    if (!Array.isArray(list)) {
      error("RELATION_INVALID", owner, `${field} must be an array`);
      return out;
    }
    const seen = new Set();
    list.forEach((ref, i) => {
      const where = `${field}[${i}]`;
      if (typeof ref !== "string" || ref.length === 0) return error("RELATION_INVALID", owner, `${where} must be a non-empty string`);
      if (seen.has(ref)) return error("RELATION_DUPLICATE", owner, `${where} repeats ${JSON.stringify(ref)}`);
      seen.add(ref);
      let target;
      if (kind === "tool") {
        if (!knownToolIds.has(ref)) return error("RELATION_DANGLING", owner, `${where} names unknown tool ${JSON.stringify(ref)}`);
        target = toolsById.has(ref) ? `tool:${ref}` : null;
      } else {
        if (!knownArticleKeys.has(ref)) return error("RELATION_DANGLING", owner, `${where} names unknown article ${JSON.stringify(ref)}`);
        target = articlesByKey.has(ref) ? `article:${articlesByKey.get(ref).id}` : null;
      }
      if (target !== null && !isValidContentId(target)) return error("RELATION_INVALID", owner, `${where} names ${JSON.stringify(ref)}, whose id is not a valid content id`);
      if (target === null) return notice("RELATION_UNPUBLISHED_FILTERED", owner, `${where} names ${JSON.stringify(ref)}, which is not published, so the link is not exported`);
      if (target === owner) return error("RELATION_SELF", owner, `${where} refers to the item itself`);
      out.push(target);
    });
    return out;
  }

  const items = [];

  // ---------------------------------------------------------------- tools
  for (const t of publishedTools) {
    const id = `tool:${t.id}`;
    const e = (code, message) => error(code, id, message);
    const before = errors.length;

    if (typeof t.id !== "string" || !TOOL_ID.test(t.id) || !isValidContentId(id) || t.id.length > LIMITS.slug) e("ID_INVALID", `tool id ${JSON.stringify(t.id)} is not a valid lower-case slug`);
    if (t.available !== true) e("STATUS_INCONSISTENT", "status is published but the built catalog does not mark the tool available");
    if (!isText(t.title) || t.title.length > LIMITS.title) e("TITLE_INVALID", "title is missing or not a non-empty string of at most 500 characters");
    else if (/[\t\n]/.test(t.title)) e("TITLE_INVALID", "title must not contain a tab or a line break");
    if (!isText(t.description) || t.description.length > LIMITS.description) e("DESCRIPTION_INVALID", "description is missing or not a non-empty string of at most 5000 characters");

    // section and category
    let sectionId = null;
    let category = null;
    if (t.sectionId !== undefined) {
      if (t.category !== undefined) e("TAXONOMY_INVALID", "names both a sectionId and a category");
      if (!sections.has(t.sectionId)) e("TAXONOMY_INVALID", `unknown sectionId ${JSON.stringify(t.sectionId)}`);
      else sectionId = t.sectionId;
    } else {
      const c = categories.get(t.category);
      if (c === undefined) e("TAXONOMY_INVALID", `unknown category ${JSON.stringify(t.category)}`);
      else if (!sections.has(c.sectionId)) e("TAXONOMY_INVALID", `category ${t.category} names unknown section ${JSON.stringify(c.sectionId)}`);
      else {
        sectionId = c.sectionId;
        category = c.id;
      }
    }
    if (sectionId !== null && (sectionId.length > LIMITS.taxonomy || !TAXONOMY.test(sectionId))) e("TAXONOMY_INVALID", `section id ${JSON.stringify(sectionId)} is not a taxonomy token`);
    if (category !== null && (category.length > LIMITS.taxonomy || !TAXONOMY.test(category))) e("TAXONOMY_INVALID", `category id ${JSON.stringify(category)} is not a taxonomy token`);
    let subcategory = null;
    if (t.subcategory !== undefined && t.subcategory !== null) {
      if (typeof t.subcategory !== "string" || !subcategories.has(t.subcategory)) e("TAXONOMY_INVALID", `unknown subcategory ${JSON.stringify(t.subcategory)}`);
      else subcategory = t.subcategory;
    }

    // canonical route: the catalog derives it; it must equal the documented formula /{section path prefix}/{id}/
    const section = sectionId === null ? undefined : sections.get(sectionId);
    let canonicalPath = null;
    if (section !== undefined) {
      const expected = `/${section.pathPrefix}/${t.id}/`;
      if (t.sitePath !== expected) e("PATH_INVALID", `sitePath ${JSON.stringify(t.sitePath)} differs from the route formula ${expected}`);
      else if (!isSafeSitePath(expected)) e("PATH_INVALID", `route ${expected} is not a supported canonical path`);
      else canonicalPath = expected;
    }

    // page contract: implementation file and stylesheet entry (what the site build requires to generate the page)
    const moduleFact = facts.toolModules?.[t.id];
    if (typeof t.loader !== "function") e("PAGE_CONTRACT", "published tool has no loader");
    if (!isObject(moduleFact) || moduleFact.ok !== true) e("PAGE_CONTRACT", `implementation file is not verified${isObject(moduleFact) && moduleFact.error ? `: ${moduleFact.error}` : ""}`);
    if (!toolStyles.has(t.id)) e("PAGE_CONTRACT", "no entry in src/_data/toolStyles.json");

    // capabilities: the resolved catalog object, one boolean per vocabulary key; unknown keys are errors
    let capabilities = [];
    if (!isObject(t.capabilities)) e("CAPABILITY_INVALID", "capabilities are missing");
    else {
      for (const [key, value] of Object.entries(t.capabilities)) {
        if (!capabilityKeys.has(key)) e("CAPABILITY_UNKNOWN", `unknown capability ${JSON.stringify(key)}`);
        else if (typeof value !== "boolean") e("CAPABILITY_INVALID", `capability ${key} must be true or false`);
        else if (!CAPABILITY_FLAG.test(key) || key.length > LIMITS.capabilityFlag) e("CAPABILITY_INVALID", `capability ${JSON.stringify(key)} is not a valid flag name`);
      }
      capabilities = Object.entries(t.capabilities).filter(([key, value]) => value === true && capabilityKeys.has(key)).map(([key]) => key).sort();
      if (capabilities.length > LIMITS.capabilities) e("CAPABILITY_INVALID", `more than ${LIMITS.capabilities} capabilities`);
    }

    const related = [...relations(id, t.relatedTools, "relatedTools", "tool"), ...relations(id, t.relatedArticles, "relatedArticles", "article")];

    if (errors.length > before) continue;
    items.push({
      id,
      type: "tool",
      sourceId: t.id,
      slug: t.id,
      canonicalPath,
      title: t.title,
      description: t.description,
      status: "published",
      section: sectionId,
      category,
      subcategory,
      publishedAt: null,
      updatedAt: null,
      marketingEligible: computeMarketingEligible({ status: "published", pageContractValid: true, itemIssues: errors.length - before }),
      relatedContentIds: sortContentIds(related),
      image: null,
      capabilities,
    });
  }

  // ------------------------------------------------------------- articles
  for (const a of publishedArticles) {
    const id = `article:${a.id}`;
    const e = (code, message) => error(code, id, message);
    const before = errors.length;

    if (!Number.isSafeInteger(a.id) || a.id < 1 || !isValidContentId(id)) e("ID_INVALID", `article id ${JSON.stringify(a.id)} must be a positive integer`);
    if (a.published !== true) e("STATUS_INCONSISTENT", "status is published but the built catalog does not mark the article published");
    if (typeof a.topic !== "string" || !TOPIC.test(a.topic)) e("PATH_INVALID", `topic ${JSON.stringify(a.topic)} is not a supported path segment`);
    if (typeof a.slug !== "string" || !SLUG.test(a.slug) || a.slug.length > LIMITS.slug) e("PATH_INVALID", `slug ${JSON.stringify(a.slug)} is not valid (letters, digits, dot, underscore, hyphen; at most 128)`);
    const key = `${a.topic}/${a.slug}`;
    if (a.key !== undefined && a.key !== key) e("KEY_MISMATCH", `key ${JSON.stringify(a.key)} differs from topic/slug ${key}`);
    const canonicalPath = `/articles/${a.topic}/${a.slug}/`;
    if (!isSafeSitePath(canonicalPath)) e("PATH_INVALID", `route ${canonicalPath} is not a supported canonical path`);
    if (!isText(a.title) || a.title.length > LIMITS.title) e("TITLE_INVALID", "title is missing or not a non-empty string of at most 500 characters");
    else if (/[\t\n]/.test(a.title)) e("TITLE_INVALID", "title must not contain a tab or a line break");
    if (!isText(a.description) || a.description.length > LIMITS.description) e("DESCRIPTION_INVALID", "description is missing or not a non-empty string of at most 5000 characters");

    // page contract: the content loader exists and its module loads
    const contentFact = facts.articleContent?.[key];
    if (typeof a.content !== "function") e("PAGE_CONTRACT", "published article has no content loader");
    if (!isObject(contentFact) || contentFact.ok !== true) e("PAGE_CONTRACT", `content module is not verified${isObject(contentFact) && contentFact.error ? `: ${contentFact.error}` : ""}`);

    // category and section (the category's own section; nothing is invented)
    let sectionId = null;
    let category = null;
    const c = categories.get(a.category);
    if (c === undefined) e("TAXONOMY_INVALID", `unknown category ${JSON.stringify(a.category)}`);
    else if (!sections.has(c.sectionId)) e("TAXONOMY_INVALID", `category ${a.category} names unknown section ${JSON.stringify(c.sectionId)}`);
    else {
      category = c.id;
      sectionId = c.sectionId;
    }
    let subcategory = null;
    if (a.subcategory !== undefined && a.subcategory !== null) {
      if (typeof a.subcategory !== "string" || !subcategories.has(a.subcategory)) e("TAXONOMY_INVALID", `unknown subcategory ${JSON.stringify(a.subcategory)}`);
      else subcategory = a.subcategory;
    }

    // dates: converted exactly, never invented, ordered
    const publishedAt = parseDisplayDate(a.publishedAt);
    const updatedAt = parseDisplayDate(a.updatedAt);
    if (publishedAt === null) e("DATE_INVALID", `publishedAt ${JSON.stringify(a.publishedAt)} is missing or not a real date like "Aug 25, 2026"`);
    if (updatedAt === null) e("DATE_INVALID", `updatedAt ${JSON.stringify(a.updatedAt)} is missing or not a real date like "Aug 25, 2026"`);
    if (publishedAt !== null && updatedAt !== null && updatedAt < publishedAt) e("DATE_ORDER", `updatedAt ${updatedAt} is before publishedAt ${publishedAt}`);

    // image: the local hero, or null when none qualifies; a present-but-broken hero is an error
    let image = null;
    const hero = a.heroImage;
    if (hero !== undefined && hero !== null) {
      if (!isObject(hero) || typeof hero.src !== "string") e("IMAGE_INVALID", "heroImage must be { src, alt }");
      else if (/^[A-Za-z][A-Za-z0-9+.-]*:|^\/\//.test(hero.src)) notice("IMAGE_NOT_LOCAL", id, `hero image ${JSON.stringify(hero.src)} is not a local file, so the manifest image is null`);
      else if (!hero.src.startsWith(APPROVED_IMAGE_PREFIX) || !isSafeSitePath(hero.src)) e("IMAGE_INVALID", `hero image path ${JSON.stringify(hero.src)} is not a safe path under ${APPROVED_IMAGE_PREFIX}`);
      else if (!isText(hero.alt)) e("IMAGE_INVALID", "hero image has no alt text (none is invented)");
      else {
        const fact = facts.images?.[hero.src];
        if (!isObject(fact) || fact.ok !== true) e("IMAGE_INVALID", `hero image file is not verified${isObject(fact) && fact.error ? `: ${fact.error}` : ""}`);
        else if (!isValidImageNumber(fact.width) || !isValidImageNumber(fact.height) || fact.width < 1 || fact.height < 1) e("IMAGE_INVALID", "hero image dimensions are not positive integers up to 1000000");
        else {
          const descriptor = { alt: hero.alt, height: fact.height, path: hero.src, width: fact.width };
          if (canonicalJson(descriptor).length > LIMITS.imageJson) e("IMAGE_INVALID", `image descriptor exceeds ${LIMITS.imageJson} characters`);
          else image = descriptor;
        }
      }
    }

    const related = [...relations(id, a.tools, "tools", "tool"), ...relations(id, a.related, "related", "article")];

    if (errors.length > before) continue;
    items.push({
      id,
      type: "article",
      sourceId: String(a.id),
      slug: a.slug,
      canonicalPath,
      title: a.title,
      description: a.description,
      status: "published",
      section: sectionId,
      category,
      subcategory,
      publishedAt,
      updatedAt,
      marketingEligible: computeMarketingEligible({ status: "published", pageContractValid: true, itemIssues: errors.length - before }),
      relatedContentIds: sortContentIds(related),
      image,
      capabilities: null,
    });
  }

  // ---------------------------------------------------- cross-item rules
  const seenPaths = new Map();
  for (const item of items) {
    const lower = item.canonicalPath.toLowerCase();
    const owner = seenPaths.get(lower);
    if (owner !== undefined) error("PATH_DUPLICATE", item.id, `canonical path ${item.canonicalPath} is also used by ${owner}`);
    else seenPaths.set(lower, item.id);
  }
  for (const item of items) {
    for (const issue of findTextIssues(item, item.id)) error("TEXT_POLICY", item.id, `${issue.path} ${issue.message}`);
  }

  // one-sided tool/article links are registry inconsistencies worth knowing about, not export failures
  for (const t of publishedTools) {
    if (!Array.isArray(t.relatedArticles) || t.relatedArticles.length === 0) continue;
    for (const key of t.relatedArticles) {
      const a = articlesByKey.get(key);
      if (a !== undefined && !(a.tools ?? []).includes(t.id)) notice("LINK_ONE_SIDED", `tool:${t.id}`, `lists article ${key}, which does not list this tool in its tools`);
    }
    for (const a of publishedArticles) {
      if ((a.tools ?? []).includes(t.id) && !t.relatedArticles.includes(`${a.topic}/${a.slug}`)) notice("LINK_ONE_SIDED", `tool:${t.id}`, `article ${a.topic}/${a.slug} lists this tool, which does not list the article in its relatedArticles`);
    }
  }

  if (errors.length > 0) return { ok: false, items: [], errors, notices };
  const fingerprinted = items.map((item) => ({ ...item, sourceFingerprint: computeItemFingerprint(item) }));
  return { ok: true, items: sortItemsCanonical(fingerprinted), errors: [], notices };
}
