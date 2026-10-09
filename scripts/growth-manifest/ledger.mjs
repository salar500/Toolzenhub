/**
 * Growth manifest identity ledger: the permanent record that stops a content identity being reused, reassigned or lost.
 *
 * PURE. No file system, no clock, no network. The ledger file (scripts/growth-manifest/identity-ledger.json) is read by
 * registry.mjs; the previous COMMITTED version (git show HEAD:...) is supplied by the caller, which is the later
 * source-state module. Nothing here ever writes or regenerates the ledger: every change to it is a deliberate, reviewed
 * edit in a commit.
 *
 * The website catalogs stay the source of truth for what content exists NOW. The ledger records only what must never be
 * lost or reused:
 *  - ARTICLES: every declared article id (published AND coming-soon), its topic/slug key, and every key it ever had. Ids are
 *    permanent and monotonic: `nextArticleId` is the high-water mark (always highest id + 1). A new article takes an id at or
 *    above it; an unrecorded id below it is a reserved gap and can never be used. A retired id and all its keys stay
 *    reserved forever.
 *  - PUBLISHED TOOLS: the id and implementation module of every tool that has been published and recorded. Coming-soon
 *    placeholders are NOT recorded (their ids may still change); a tool is recorded when it is first published. Retiring a
 *    tool does not free its id.
 *
 * Provenance says how much is actually known (never more than the evidence):
 *  - "history-verified" (articles): the id/key pair is consistent across the verified Git history window (historyWindow).
 *  - "bootstrap": first observed when the ledger was created; no earlier history is claimed.
 *  - "allocated" (articles) / "added" (tools): recorded after the bootstrap by the allocation rule.
 *
 * Changing an identity is explicit and auditable, and is compared with the previous committed ledger so editing the
 * catalog and the ledger together cannot silently bypass the protection:
 *  - RETIRE: set state "retired" with retired.reason. The record stays. Remove the item from the catalog (or leave a tool
 *    unpublished) only after that.
 *  - RENAME an article's topic/slug: set the new `key` and append { from: <old key>, reason } to keyChanges.
 *  - MOVE a published tool's implementation: set the new `module` and append { from: <old module>, reason } to moduleChanges.
 *  - ADD: append a record (article provenance "allocated", id = nextArticleId; tool provenance "added") and, for an
 *    article, advance nextArticleId.
 * Removing a record, reviving a retired one, rewriting history, editing provenance or the verified window are all refused.
 */
import { serializeManifestFile } from "./canonical.mjs";
import { findTextIssues } from "./text-policy.mjs";

export const LEDGER_FILE = "scripts/growth-manifest/identity-ledger.json";
export const LEDGER_SCHEMA_VERSION = 1;

const TOPIC = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const TOOL_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MODULE_PATH = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const COMMIT = /^[0-9a-f]{40}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const ARTICLE_PROVENANCE = ["history-verified", "bootstrap", "allocated"];
const TOOL_PROVENANCE = ["bootstrap", "added"];
const STATES = ["active", "retired"];
const LEDGER_KEYS = ["articles", "historyWindow", "nextArticleId", "readme", "schemaVersion", "tools"];
const WINDOW_KEYS = ["firstCommit", "scope", "startDate", "verifiedAtCommit"];
const ARTICLE_KEYS = ["id", "key", "keyChanges", "provenance", "state"];
const TOOL_KEYS = ["id", "module", "moduleChanges", "provenance", "state"];

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const sameKeys = (obj, required, optional = []) => {
  const keys = Object.keys(obj).sort();
  return required.every((k) => keys.includes(k)) && keys.every((k) => required.includes(k) || optional.includes(k));
};
const isKey = (v) => typeof v === "string" && v.length <= 200 && (() => {
  const i = v.indexOf("/");
  return i > 0 && TOPIC.test(v.slice(0, i)) && SLUG.test(v.slice(i + 1)) && v.length - i - 1 <= 128;
})();
const isReason = (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 200 && !/[\t\n\r]/.test(v);
const isModule = (v) => typeof v === "string" && v.length <= 300 && MODULE_PATH.test(v) && !v.includes("//") && !v.split("/").some((s) => s === "." || s === "..");
const realDate = (v) => typeof v === "string" && ISO_DATE.test(v) && new Date(`${v}T00:00:00.000Z`).toISOString().slice(0, 10) === v;

const result = (errors) => ({ ok: errors.length === 0, errors });

/** Validates the ledger's own structure and internal consistency. Never throws; every problem is reported. */
export function validateLedger(ledger) {
  const errors = [];
  const add = (code, id, message) => errors.push({ code, id, message });
  try {
    if (!isObject(ledger)) return result([{ code: "LEDGER_MALFORMED", id: "ledger", message: "the ledger must be an object" }]);
    if (!sameKeys(ledger, LEDGER_KEYS)) add("LEDGER_MALFORMED", "ledger", `must have exactly the keys ${LEDGER_KEYS.join(", ")}`);
    if (ledger.schemaVersion !== LEDGER_SCHEMA_VERSION) add("LEDGER_MALFORMED", "schemaVersion", `must be ${LEDGER_SCHEMA_VERSION}`);
    if (typeof ledger.readme !== "string" || ledger.readme.trim().length === 0 || ledger.readme.length > 300) add("LEDGER_MALFORMED", "readme", "must be a short non-empty string");

    const w = ledger.historyWindow;
    if (!isObject(w) || !sameKeys(w, WINDOW_KEYS)) add("LEDGER_MALFORMED", "historyWindow", `must have exactly the keys ${WINDOW_KEYS.join(", ")}`);
    else {
      if (!realDate(w.startDate)) add("LEDGER_MALFORMED", "historyWindow.startDate", "must be a real YYYY-MM-DD date");
      for (const k of ["firstCommit", "verifiedAtCommit"]) if (typeof w[k] !== "string" || !COMMIT.test(w[k])) add("LEDGER_MALFORMED", `historyWindow.${k}`, "must be a 40-character lowercase hex commit id");
      if (typeof w.scope !== "string" || w.scope.trim().length === 0 || w.scope.length > 700) add("LEDGER_MALFORMED", "historyWindow.scope", "must state the verified scope in at most 700 characters");
    }

    // ---- articles
    const reserved = new Map(); // key -> article id
    const claim = (key, id, where) => {
      const owner = reserved.get(key);
      if (owner === undefined) reserved.set(key, id);
      else if (owner === id) add("KEY_REPEATED", `article:${id}`, `${where} repeats the key ${key}, which this article already used`);
      else add("KEY_COLLISION", `article:${id}`, `${where} ${key} is already reserved by article:${owner}`);
    };
    let maxId = 0;
    if (!Array.isArray(ledger.articles)) add("LEDGER_MALFORMED", "articles", "must be an array");
    else {
      let previousId = 0;
      for (const [index, a] of ledger.articles.entries()) {
        const label = isObject(a) && Number.isSafeInteger(a.id) ? `article:${a.id}` : `articles[${index}]`;
        if (!isObject(a) || !sameKeys(a, ARTICLE_KEYS, ["retired"])) {
          add("RECORD_INVALID", label, `must have exactly the keys ${ARTICLE_KEYS.join(", ")} (and retired when retired)`);
          continue;
        }
        if (!Number.isSafeInteger(a.id) || a.id < 1) {
          add("RECORD_INVALID", label, "id must be a positive integer");
          continue;
        }
        if (a.id === previousId) add("ID_DUPLICATE", label, "duplicate article id");
        else if (a.id < previousId) add("ORDER", label, "articles must be sorted by ascending id");
        previousId = Math.max(previousId, a.id);
        maxId = Math.max(maxId, a.id);
        if (!isKey(a.key)) add("RECORD_INVALID", label, "key must be topic/slug");
        else claim(a.key, a.id, "key");
        if (!STATES.includes(a.state)) add("RECORD_INVALID", label, `state must be ${STATES.join(" or ")}`);
        if (!ARTICLE_PROVENANCE.includes(a.provenance)) add("RECORD_INVALID", label, `provenance must be ${ARTICLE_PROVENANCE.join(", ")}`);
        if (a.state === "retired") {
          if (!isObject(a.retired) || !sameKeys(a.retired, ["reason"]) || !isReason(a.retired.reason)) add("RECORD_INVALID", label, "a retired article needs retired: { reason } (1-200 characters on one line)");
        } else if (a.retired !== undefined) add("RECORD_INVALID", label, "only a retired article carries retired");
        if (!Array.isArray(a.keyChanges)) add("RECORD_INVALID", label, "keyChanges must be an array");
        else {
          for (const [i, c] of a.keyChanges.entries()) {
            if (!isObject(c) || !sameKeys(c, ["from", "reason"]) || !isKey(c.from) || !isReason(c.reason)) add("RECORD_INVALID", label, `keyChanges[${i}] must be { from: topic/slug, reason }`);
            else claim(c.from, a.id, `keyChanges[${i}].from`);
          }
        }
      }
    }
    if (Number.isSafeInteger(ledger.nextArticleId) && ledger.nextArticleId >= 1) {
      if (ledger.nextArticleId !== maxId + 1) add("NEXT_ID_INVALID", "nextArticleId", `must be the highest article id + 1 (${maxId + 1}), not ${ledger.nextArticleId}`);
    } else add("NEXT_ID_INVALID", "nextArticleId", "must be a positive integer");

    // ---- tools
    if (!Array.isArray(ledger.tools)) add("LEDGER_MALFORMED", "tools", "must be an array");
    else {
      let previous = "";
      for (const [index, t] of ledger.tools.entries()) {
        const label = isObject(t) && typeof t.id === "string" ? `tool:${t.id}` : `tools[${index}]`;
        if (!isObject(t) || !sameKeys(t, TOOL_KEYS, ["retired"])) {
          add("RECORD_INVALID", label, `must have exactly the keys ${TOOL_KEYS.join(", ")} (and retired when retired)`);
          continue;
        }
        if (typeof t.id !== "string" || !TOOL_ID.test(t.id) || t.id.length > 128) {
          add("RECORD_INVALID", label, "id must be a lower-case slug");
          continue;
        }
        if (t.id === previous) add("ID_DUPLICATE", label, "duplicate tool id");
        else if (t.id < previous) add("ORDER", label, "tools must be sorted by id");
        if (t.id > previous) previous = t.id;
        if (!isModule(t.module)) add("RECORD_INVALID", label, "module must be a safe repository-relative path");
        if (!STATES.includes(t.state)) add("RECORD_INVALID", label, `state must be ${STATES.join(" or ")}`);
        if (!TOOL_PROVENANCE.includes(t.provenance)) add("RECORD_INVALID", label, `provenance must be ${TOOL_PROVENANCE.join(" or ")}`);
        if (t.state === "retired") {
          if (!isObject(t.retired) || !sameKeys(t.retired, ["reason"]) || !isReason(t.retired.reason)) add("RECORD_INVALID", label, "a retired tool needs retired: { reason } (1-200 characters on one line)");
        } else if (t.retired !== undefined) add("RECORD_INVALID", label, "only a retired tool carries retired");
        if (!Array.isArray(t.moduleChanges)) add("RECORD_INVALID", label, "moduleChanges must be an array");
        else {
          const seen = new Set([t.module]);
          for (const [i, c] of t.moduleChanges.entries()) {
            if (!isObject(c) || !sameKeys(c, ["from", "reason"]) || !isModule(c.from) || !isReason(c.reason)) add("RECORD_INVALID", label, `moduleChanges[${i}] must be { from: path, reason }`);
            else if (seen.has(c.from)) add("RECORD_INVALID", label, `moduleChanges[${i}].from repeats a path this tool already used`);
            else seen.add(c.from);
          }
        }
      }
    }

    for (const issue of findTextIssues(ledger, "ledger")) add("TEXT_POLICY", issue.path, issue.message);
  } catch (cause) {
    add("LEDGER_MALFORMED", "ledger", `could not be validated (${cause?.message ?? "error"})`);
  }
  return result(errors);
}

/** The exact canonical text of a ledger file (the same form as the manifest: sorted keys, two spaces, one newline). */
export function serializeLedger(ledger) {
  return serializeManifestFile(ledger);
}

/** Parses ledger file text. Rejects anything that is not valid, canonical and structurally correct; never throws. */
export function parseLedgerText(text) {
  let ledger;
  try {
    ledger = JSON.parse(text);
  } catch {
    return { ok: false, ledger: null, errors: [{ code: "LEDGER_MALFORMED", id: "ledger", message: "the ledger file is not valid JSON" }] };
  }
  const structure = validateLedger(ledger);
  if (!structure.ok) return { ok: false, ledger: null, errors: structure.errors };
  let canonical;
  try {
    canonical = serializeLedger(ledger);
  } catch (cause) {
    return { ok: false, ledger: null, errors: [{ code: "LEDGER_MALFORMED", id: "ledger", message: `cannot be serialized (${cause.message})` }] };
  }
  if (canonical !== text) return { ok: false, ledger: null, errors: [{ code: "LEDGER_NOT_CANONICAL", id: "ledger", message: "the ledger file is not in the canonical form (sorted keys, two-space indent, LF, one trailing newline); re-serialize it" }] };
  return { ok: true, ledger, errors: [] };
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** True when `next` is `previous` plus exactly one appended { from: expectedFrom, reason } entry. */
function appendsOneChange(previous, next, expectedFrom) {
  return Array.isArray(next) && next.length === previous.length + 1 && sameJson(next.slice(0, previous.length), previous) && next[previous.length].from === expectedFrom;
}

/**
 * Compares a ledger with the previous COMMITTED ledger. Protected identities may never be dropped, revived, re-labelled or
 * have their history rewritten; allowed changes are additions by the allocation rule, retirement, and explicit
 * rename / move entries. Both ledgers are validated first. Never throws.
 */
export function compareLedgers(previous, current) {
  const errors = [];
  const add = (code, id, message) => errors.push({ code, id, message });
  for (const [name, ledger] of [["previous", previous], ["current", current]]) {
    const check = validateLedger(ledger);
    if (!check.ok) for (const e of check.errors) add(e.code, e.id, `${name} ledger: ${e.message}`);
  }
  if (errors.length > 0) return result(errors);

  if (!sameJson(previous.historyWindow, current.historyWindow)) add("WINDOW_CHANGED", "historyWindow", "the verified history window is evidence and must not be edited");
  if (current.nextArticleId < previous.nextArticleId) add("NEXT_ID_LOWERED", "nextArticleId", "the article id high-water mark can only grow");

  const currentArticles = new Map(current.articles.map((a) => [a.id, a]));
  for (const p of previous.articles) {
    const id = `article:${p.id}`;
    const c = currentArticles.get(p.id);
    if (c === undefined) {
      add("RECORD_DROPPED", id, "a protected article identity was removed from the ledger; retire it instead");
      continue;
    }
    if (c.provenance !== p.provenance) add("PROVENANCE_CHANGED", id, "provenance records what is known and must not be edited");
    if (p.state === "retired" && c.state !== "retired") add("RETIRED_REVIVED", id, "a retired identity stays retired");
    if (p.state === "retired" && c.state === "retired" && c.retired.reason !== p.retired.reason) add("RETIREMENT_EDITED", id, "a recorded retirement must not be rewritten");
    if (c.key !== p.key) {
      if (p.state === "retired") add("KEY_CHANGED", id, "a retired article cannot be renamed");
      else if (!appendsOneChange(p.keyChanges, c.keyChanges, p.key)) add("KEY_CHANGED", id, `the key changed from ${p.key} to ${c.key} without appending { from: "${p.key}", reason } to keyChanges`);
    } else if (!sameJson(p.keyChanges, c.keyChanges)) add("HISTORY_REWRITTEN", id, "keyChanges is history and may only grow with a rename");
  }
  for (const c of current.articles) {
    if (previous.articles.some((p) => p.id === c.id)) continue;
    const id = `article:${c.id}`;
    if (c.id < previous.nextArticleId) add("ID_BELOW_HIGH_WATER", id, `a new article id must be at least ${previous.nextArticleId}; lower unrecorded ids are reserved gaps`);
    if (c.provenance !== "allocated") add("PROVENANCE_INVALID", id, 'a new article must have provenance "allocated"');
    if (c.state !== "active" || c.keyChanges.length > 0) add("RECORD_INVALID", id, "a new article starts active with no key changes");
  }

  const currentTools = new Map(current.tools.map((t) => [t.id, t]));
  for (const p of previous.tools) {
    const id = `tool:${p.id}`;
    const c = currentTools.get(p.id);
    if (c === undefined) {
      add("RECORD_DROPPED", id, "a protected tool identity was removed from the ledger; retire it instead");
      continue;
    }
    if (c.provenance !== p.provenance) add("PROVENANCE_CHANGED", id, "provenance records what is known and must not be edited");
    if (p.state === "retired" && c.state !== "retired") add("RETIRED_REVIVED", id, "a retired identity stays retired");
    if (p.state === "retired" && c.state === "retired" && c.retired.reason !== p.retired.reason) add("RETIREMENT_EDITED", id, "a recorded retirement must not be rewritten");
    if (c.module !== p.module) {
      if (p.state === "retired") add("MODULE_CHANGED", id, "a retired tool cannot be moved");
      else if (!appendsOneChange(p.moduleChanges, c.moduleChanges, p.module)) add("MODULE_CHANGED", id, `the module changed from ${p.module} to ${c.module} without appending { from: "${p.module}", reason } to moduleChanges`);
    } else if (!sameJson(p.moduleChanges, c.moduleChanges)) add("HISTORY_REWRITTEN", id, "moduleChanges is history and may only grow with a move");
  }
  for (const c of current.tools) {
    if (previous.tools.some((p) => p.id === c.id)) continue;
    const id = `tool:${c.id}`;
    if (c.provenance !== "added") add("PROVENANCE_INVALID", id, 'a new tool must have provenance "added"');
    if (c.state !== "active" || c.moduleChanges.length > 0) add("RECORD_INVALID", id, "a new tool starts active with no module changes");
  }
  return result(errors);
}

/**
 * Checks the live catalogs against the ledger (and, when supplied, the previous committed ledger). Pure.
 *  - articles: EVERY declared article entry (published and coming-soon), as { id, topic, slug, status }.
 *  - tools: every declared tool entry, as { id, status }.
 *  - toolModules: { [toolId]: { path } } with the repository-relative implementation path of each published tool.
 * Returns { ok, errors }; any error means the export must not proceed.
 */
export function checkIdentities({ ledger, previousLedger = null, articles, tools, toolModules = {} }) {
  const errors = [];
  const add = (code, id, message) => errors.push({ code, id, message });
  const own = validateLedger(ledger);
  if (!own.ok) return result(own.errors);
  if (previousLedger !== null && previousLedger !== undefined) for (const e of compareLedgers(previousLedger, ledger).errors) errors.push(e);
  try {
    // ---- reserved article keys: current and historical, for every record (including retired ones)
    const keyOwner = new Map();
    for (const a of ledger.articles) {
      keyOwner.set(a.key, a.id);
      for (const c of a.keyChanges) keyOwner.set(c.from, a.id);
    }
    const byId = new Map(ledger.articles.map((a) => [a.id, a]));

    const seenIds = new Set();
    const seenKeys = new Map();
    for (const entry of Array.isArray(articles) ? articles : []) {
      const id = `article:${entry?.id}`;
      if (!Number.isSafeInteger(entry?.id) || entry.id < 1) {
        add("ARTICLE_ID_INVALID", id, "an article id must be a positive integer");
        continue;
      }
      if (seenIds.has(entry.id)) add("ARTICLE_ID_DUPLICATE", id, "the catalog declares this article id twice");
      seenIds.add(entry.id);
      const key = `${entry.topic}/${entry.slug}`;
      if (!isKey(key)) {
        add("ARTICLE_KEY_INVALID", id, `topic/slug ${JSON.stringify(key)} is not a valid key`);
        continue;
      }
      if (seenKeys.has(key) && seenKeys.get(key) !== entry.id) add("ARTICLE_KEY_DUPLICATE", id, `the catalog gives ${key} to article:${seenKeys.get(key)} as well`);
      seenKeys.set(key, entry.id);

      const record = byId.get(entry.id);
      const owner = keyOwner.get(key);
      if (record === undefined) {
        if (entry.id < ledger.nextArticleId) add("ARTICLE_ID_GAP_REUSED", id, `id ${entry.id} was never recorded but is below the high-water mark ${ledger.nextArticleId}; unrecorded ids below it are reserved and cannot be used`);
        else add("ARTICLE_UNLEDGERED", id, `not in the ledger; add { id: ${entry.id}, provenance: "allocated" } and advance nextArticleId to ${entry.id + 1}`);
        if (owner !== undefined) add("ARTICLE_KEY_REUSED", id, `${key} is reserved by article:${owner}`);
        continue;
      }
      if (record.state === "retired") {
        add("RETIRED_ID_REUSED", id, "this article id is retired and permanently reserved");
        continue;
      }
      if (key !== record.key) {
        if (owner !== undefined && owner !== entry.id) add("ARTICLE_KEY_REUSED", id, `${key} is reserved by article:${owner}`);
        else if (record.keyChanges.some((c) => c.from === key)) add("ARTICLE_KEY_REVERTED", id, `${key} is a previous key of this article; the ledger says it is now ${record.key}`);
        else add("ARTICLE_KEY_CHANGED", id, `the catalog says ${key} but the ledger says ${record.key}; record the rename (new key plus a keyChanges entry) to make it explicit`);
      } else if (owner !== entry.id) add("ARTICLE_KEY_REUSED", id, `${key} is reserved by article:${owner}`);
    }
    for (const record of ledger.articles) {
      if (record.state === "active" && !seenIds.has(record.id)) add("ARTICLE_MISSING", `article:${record.id}`, `the catalog no longer declares this protected article (${record.key}); retire it in the ledger to make the removal explicit`);
    }

    // ---- tools
    const catalogTools = new Map();
    for (const entry of Array.isArray(tools) ? tools : []) {
      if (typeof entry?.id !== "string") continue;
      if (catalogTools.has(entry.id)) add("TOOL_ID_DUPLICATE", `tool:${entry.id}`, "the catalog declares this tool id twice");
      catalogTools.set(entry.id, entry);
    }
    const toolRecords = new Map(ledger.tools.map((t) => [t.id, t]));
    for (const [id, entry] of catalogTools) {
      const label = `tool:${id}`;
      const record = toolRecords.get(id);
      if (record !== undefined && record.state === "retired") {
        add("RETIRED_ID_REUSED", label, "this tool id is retired and permanently reserved");
        continue;
      }
      if (entry.status !== "published") continue;
      if (record === undefined) {
        add("TOOL_UNLEDGERED", label, `a published tool must be recorded; add { id: "${id}", provenance: "added", module } to the ledger`);
        continue;
      }
      const modulePath = toolModules?.[id]?.path;
      if (typeof modulePath !== "string") add("TOOL_MODULE_UNKNOWN", label, "the implementation module of this published tool could not be determined");
      else if (modulePath !== record.module) {
        if (record.moduleChanges.some((c) => c.from === modulePath)) add("TOOL_MODULE_REVERTED", label, `${modulePath} is a previous module of this tool; the ledger says it is now ${record.module}`);
        else add("TOOL_REASSIGNED", label, `the implementation is ${modulePath} but the ledger says ${record.module}; an id must not be reassigned, record a deliberate move in moduleChanges`);
      }
    }
    for (const record of ledger.tools) {
      if (record.state !== "active") continue;
      const entry = catalogTools.get(record.id);
      if (entry === undefined) add("TOOL_MISSING", `tool:${record.id}`, "a recorded published tool disappeared from the catalog; retire it in the ledger to make this explicit");
      else if (entry.status !== "published") add("TOOL_UNPUBLISHED", `tool:${record.id}`, "a recorded published tool is no longer published; retire it in the ledger to make this explicit");
    }
  } catch (cause) {
    add("LEDGER_CHECK_FAILED", "ledger", `the catalogs could not be checked (${cause?.message ?? "error"})`);
  }
  return result(errors);
}
