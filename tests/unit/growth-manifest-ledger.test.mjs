/**
 * G3C-B3: the permanent content identity ledger. Pure validation is tested on small SYNTHETIC ledgers and catalogs; the real
 * ledger file is checked against the real catalogs and against its previous committed version. Nothing is written.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { sha256Hex } from "../../scripts/growth-manifest/canonical.mjs";
import { LEDGER_FILE, checkIdentities, compareLedgers, parseLedgerText, serializeLedger, validateLedger } from "../../scripts/growth-manifest/ledger.mjs";
import { REPO_ROOT, exportPublishedItems, loadRegistry, readLedgerFile } from "../../scripts/growth-manifest/registry.mjs";

const HEX_A = "a".repeat(40);
const HEX_B = "b".repeat(40);

function baseLedger() {
  return {
    schemaVersion: 1,
    readme: "Synthetic ledger for tests.",
    historyWindow: { startDate: "2026-09-29", firstCommit: HEX_A, verifiedAtCommit: HEX_B, scope: "Synthetic scope." },
    nextArticleId: 4,
    articles: [
      { id: 1, key: "loans/guide", keyChanges: [], provenance: "history-verified", state: "active" },
      { id: 2, key: "loans/later", keyChanges: [], provenance: "bootstrap", state: "active" },
      { id: 3, key: "tax/new-name", keyChanges: [{ from: "tax/old-name", reason: "renamed for clarity" }], provenance: "history-verified", state: "retired", retired: { reason: "merged into article 1" } },
    ],
    tools: [
      { id: "alpha", module: "assets/js/tools/alpha/index.js", moduleChanges: [], provenance: "bootstrap", state: "active" },
      { id: "beta", module: "assets/js/tools/beta/index.js", moduleChanges: [], provenance: "bootstrap", state: "retired", retired: { reason: "replaced by alpha" } },
    ],
  };
}
const catalog = () => ({
  articles: [
    { id: 1, topic: "loans", slug: "guide", status: "published" },
    { id: 2, topic: "loans", slug: "later", status: "coming-soon" },
  ],
  tools: [
    { id: "alpha", status: "published" },
    { id: "gamma", status: "coming-soon" },
  ],
  toolModules: { alpha: { path: "assets/js/tools/alpha/index.js" } },
});
const check = (mutateLedger = () => {}, mutateCatalog = () => {}, previousLedger = null) => {
  const ledger = baseLedger();
  mutateLedger(ledger);
  const c = catalog();
  mutateCatalog(c);
  return checkIdentities({ ledger, previousLedger, ...c });
};
const codes = (r) => r.errors.map((e) => e.code);
const expectCode = (r, code, id) => {
  assert.equal(r.ok, false, `expected ${code}`);
  assert.ok(r.errors.some((e) => e.code === code && (id === undefined || e.id === id)), `expected ${code}${id ? " for " + id : ""}, got ${JSON.stringify(r.errors)}`);
};
const invalid = (mutate, code) => {
  const l = baseLedger();
  mutate(l);
  expectCode(validateLedger(l), code);
};
const compare = (mutate) => {
  const next = baseLedger();
  mutate(next);
  return compareLedgers(baseLedger(), next);
};

describe("the ledger's own structure", () => {
  test("a valid ledger passes", () => {
    const r = validateLedger(baseLedger());
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("never throws on garbage; reports instead", () => {
    for (const bad of [null, undefined, 5, "x", [], {}, { articles: null }, { schemaVersion: 1, articles: [null], tools: [5] }]) {
      const r = validateLedger(bad);
      assert.equal(r.ok, false);
      assert.ok(r.errors.length > 0);
    }
    const cyclic = baseLedger();
    cyclic.self = cyclic;
    assert.equal(validateLedger(cyclic).ok, false);
  });

  test("top-level shape", () => {
    invalid((l) => (l.extra = 1), "LEDGER_MALFORMED");
    invalid((l) => delete l.tools, "LEDGER_MALFORMED");
    invalid((l) => (l.schemaVersion = 2), "LEDGER_MALFORMED");
    invalid((l) => (l.readme = ""), "LEDGER_MALFORMED");
    invalid((l) => (l.historyWindow.startDate = "2026-02-30"), "LEDGER_MALFORMED");
    invalid((l) => (l.historyWindow.firstCommit = "abc"), "LEDGER_MALFORMED");
    invalid((l) => (l.historyWindow.verifiedAtCommit = "G".repeat(40)), "LEDGER_MALFORMED");
    invalid((l) => (l.historyWindow.scope = ""), "LEDGER_MALFORMED");
    invalid((l) => delete l.historyWindow.scope, "LEDGER_MALFORMED");
  });

  test("article ids: invalid, duplicate, unordered", () => {
    for (const bad of [0, -1, 1.5, "1", null]) invalid((l) => (l.articles[0].id = bad), "RECORD_INVALID");
    invalid((l) => (l.articles[1].id = 1), "ID_DUPLICATE");
    invalid((l) => ([l.articles[0], l.articles[1]] = [l.articles[1], l.articles[0]]), "ORDER");
  });

  test("the high-water mark is always the highest id + 1", () => {
    invalid((l) => (l.nextArticleId = 3), "NEXT_ID_INVALID");
    invalid((l) => (l.nextArticleId = 9), "NEXT_ID_INVALID");
    invalid((l) => (l.nextArticleId = "4"), "NEXT_ID_INVALID");
    const empty = baseLedger();
    empty.articles = [];
    empty.nextArticleId = 1;
    assert.equal(validateLedger(empty).ok, true);
  });

  test("keys: format, collisions and repeats", () => {
    for (const bad of ["noslash", "/x", "x/", "Upper/x", "a/b/c", "a/", "a b/c", "a/-x", 5]) invalid((l) => (l.articles[0].key = bad), "RECORD_INVALID");
    invalid((l) => (l.articles[1].key = "loans/guide"), "KEY_COLLISION");
    invalid((l) => (l.articles[0].keyChanges = [{ from: "loans/later", reason: "x" }]), "KEY_COLLISION");
    invalid((l) => (l.articles[0].keyChanges = [{ from: "loans/guide", reason: "x" }]), "KEY_REPEATED");
    invalid((l) => (l.articles[2].keyChanges.push({ from: "tax/old-name", reason: "again" })), "KEY_REPEATED");
  });

  test("states, provenance, retirement and key changes", () => {
    invalid((l) => (l.articles[0].state = "gone"), "RECORD_INVALID");
    invalid((l) => (l.articles[0].provenance = "guessed"), "RECORD_INVALID");
    invalid((l) => delete l.articles[2].retired, "RECORD_INVALID");
    invalid((l) => (l.articles[2].retired = { reason: "" }), "RECORD_INVALID");
    invalid((l) => (l.articles[2].retired = { reason: "two\nlines" }), "RECORD_INVALID");
    invalid((l) => (l.articles[0].retired = { reason: "not retired" }), "RECORD_INVALID");
    invalid((l) => (l.articles[0].keyChanges = "none"), "RECORD_INVALID");
    invalid((l) => (l.articles[2].keyChanges[0].reason = ""), "RECORD_INVALID");
    invalid((l) => (l.articles[2].keyChanges[0].extra = 1), "RECORD_INVALID");
    invalid((l) => delete l.articles[0].provenance, "RECORD_INVALID");
  });

  test("tools: ids, modules, states, order and changes", () => {
    for (const bad of ["Upper", "a_b", "-x", "", "x".repeat(129), 5]) invalid((l) => (l.tools[0].id = bad), "RECORD_INVALID");
    for (const bad of ["../x.js", "/abs/x.js", "a//b.js", "a/../b.js", "a b.js", "", "a/./b.js", 5]) invalid((l) => (l.tools[0].module = bad), "RECORD_INVALID");
    invalid((l) => (l.tools[1].id = "alpha"), "ID_DUPLICATE");
    invalid((l) => ([l.tools[0], l.tools[1]] = [l.tools[1], l.tools[0]]), "ORDER");
    invalid((l) => (l.tools[0].provenance = "history-verified"), "RECORD_INVALID");
    invalid((l) => delete l.tools[1].retired, "RECORD_INVALID");
    invalid((l) => (l.tools[0].moduleChanges = [{ from: "assets/js/tools/alpha/index.js", reason: "x" }]), "RECORD_INVALID");
    invalid((l) => (l.tools[0].moduleChanges = [{ from: "assets/js/old.js", reason: "" }]), "RECORD_INVALID");
  });

  test("the character policy applies to every string", () => {
    invalid((l) => (l.articles[2].retired.reason = "zero\u200bwidth"), "TEXT_POLICY");
    invalid((l) => (l.readme = "cafe\u0301"), "TEXT_POLICY");
  });
});

describe("ledger text", () => {
  const text = serializeLedger(baseLedger());

  test("canonical text parses", () => {
    const r = parseLedgerText(text);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.ledger, baseLedger());
  });

  test("serialization is deterministic, key-order independent and ends with one newline", () => {
    const reversed = Object.fromEntries(Object.entries(baseLedger()).reverse());
    assert.equal(serializeLedger(reversed), text);
    assert.equal(serializeLedger(baseLedger()), text);
    assert.ok(text.endsWith("}\n") && !text.endsWith("\n\n") && !text.includes("\r"));
  });

  test("anything not canonical or not valid is refused with a controlled error", () => {
    const cases = {
      "not JSON": "{",
      "empty": "",
      "BOM": "\ufeff" + text,
      "CRLF": text.replace(/\n/g, "\r\n"),
      "no trailing newline": text.slice(0, -1),
      "tab indent": text.replace(/ {2}/g, "\t"),
      "reordered keys": JSON.stringify(baseLedger(), null, 2) + "\n",
    };
    for (const [name, bad] of Object.entries(cases)) {
      const r = parseLedgerText(bad);
      assert.equal(r.ok, false, name);
      assert.ok(r.errors[0].code.startsWith("LEDGER_"), `${name}: ${r.errors[0].code}`);
    }
    const bad = baseLedger();
    bad.nextArticleId = 99;
    assert.equal(parseLedgerText(serializeLedger(bad)).ok, false);
  });
});

describe("the catalog against the ledger", () => {
  test("a consistent catalog passes; retired identities may be absent; coming-soon tools need no record", () => {
    const r = check();
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("a coming-soon tool placeholder may change freely, including its id", () => {
    assert.equal(check(() => {}, (c) => (c.tools[1].id = "delta")).ok, true);
    assert.equal(check(() => {}, (c) => c.tools.pop()).ok, true);
    assert.equal(check(() => {}, (c) => c.tools.push({ id: "epsilon", status: "coming-soon" })).ok, true);
  });

  test("a published tool must be recorded", () => {
    expectCode(check(() => {}, (c) => { c.tools.push({ id: "fresh", status: "published" }); c.toolModules.fresh = { path: "assets/js/tools/fresh/index.js" }; }), "TOOL_UNLEDGERED", "tool:fresh");
  });

  test("a recorded published tool cannot vanish or be quietly unpublished", () => {
    expectCode(check(() => {}, (c) => c.tools.splice(0, 1)), "TOOL_MISSING", "tool:alpha");
    expectCode(check(() => {}, (c) => (c.tools[0].status = "coming-soon")), "TOOL_UNPUBLISHED", "tool:alpha");
  });

  test("a retired tool id is never freed", () => {
    expectCode(check(() => {}, (c) => { c.tools.push({ id: "beta", status: "published" }); c.toolModules.beta = { path: "x/y.js" }; }), "RETIRED_ID_REUSED", "tool:beta");
    expectCode(check(() => {}, (c) => c.tools.push({ id: "beta", status: "coming-soon" })), "RETIRED_ID_REUSED", "tool:beta");
  });

  test("a published tool id cannot be reassigned to a different implementation", () => {
    expectCode(check(() => {}, (c) => (c.toolModules.alpha.path = "assets/js/tools/unrelated/index.js")), "TOOL_REASSIGNED", "tool:alpha");
    expectCode(check(() => {}, (c) => delete c.toolModules.alpha), "TOOL_MODULE_UNKNOWN", "tool:alpha");
    expectCode(check((l) => { l.tools[0].module = "assets/js/tools/alpha2/index.js"; l.tools[0].moduleChanges = [{ from: "assets/js/tools/alpha/index.js", reason: "moved" }]; }), "TOOL_MODULE_REVERTED", "tool:alpha");
  });

  test("a deliberate, recorded move is accepted", () => {
    const r = check((l) => { l.tools[0].module = "assets/js/tools/alpha2/index.js"; l.tools[0].moduleChanges = [{ from: "assets/js/tools/alpha/index.js", reason: "moved" }]; }, (c) => (c.toolModules.alpha.path = "assets/js/tools/alpha2/index.js"));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("duplicate tool ids in the catalog", () => {
    expectCode(check(() => {}, (c) => c.tools.push({ id: "alpha", status: "published" })), "TOOL_ID_DUPLICATE", "tool:alpha");
  });

  test("every declared article is protected, coming-soon ones included", () => {
    expectCode(check(() => {}, (c) => c.articles.splice(1, 1)), "ARTICLE_MISSING", "article:2");
    expectCode(check(() => {}, (c) => c.articles.splice(0, 1)), "ARTICLE_MISSING", "article:1");
  });

  test("a new article must be recorded; unrecorded ids below the high-water mark are reserved gaps", () => {
    expectCode(check(() => {}, (c) => c.articles.push({ id: 4, topic: "tax", slug: "fresh", status: "published" })), "ARTICLE_UNLEDGERED", "article:4");
    const gapped = (l) => { l.articles.splice(1, 1); };
    const withGap = (c) => c.articles.push({ id: 2, topic: "loans", slug: "reused-gap", status: "published" });
    expectCode(check((l) => { gapped(l); }, (c) => { c.articles.splice(1, 1); withGap(c); }), "ARTICLE_ID_GAP_REUSED", "article:2");
  });

  test("a retired article id cannot come back, and neither can its keys", () => {
    expectCode(check(() => {}, (c) => c.articles.push({ id: 3, topic: "tax", slug: "new-name", status: "published" })), "RETIRED_ID_REUSED", "article:3");
    expectCode(check((l) => { l.nextArticleId = 4; }, (c) => c.articles.push({ id: 4, topic: "tax", slug: "new-name", status: "published" })), "ARTICLE_KEY_REUSED", "article:4");
    expectCode(check((l) => { l.articles.push({ id: 4, key: "x/y", keyChanges: [], provenance: "allocated", state: "active" }); l.nextArticleId = 5; }, (c) => c.articles.push({ id: 4, topic: "tax", slug: "old-name", status: "published" })), "ARTICLE_KEY_REUSED", "article:4");
  });

  test("an article's topic/slug cannot change or be given to another id without a recorded rename", () => {
    expectCode(check(() => {}, (c) => (c.articles[0].slug = "renamed")), "ARTICLE_KEY_CHANGED", "article:1");
    expectCode(check(() => {}, (c) => (c.articles[0].topic = "tax")), "ARTICLE_KEY_CHANGED", "article:1");
    expectCode(check(() => {}, (c) => ((c.articles[0].slug = "later"), (c.articles[1].slug = "guide"))), "ARTICLE_KEY_REUSED");
    expectCode(check(() => {}, (c) => ((c.articles[0].slug = "later"))), "ARTICLE_KEY_REUSED", "article:1");
  });

  test("a recorded rename is accepted; reverting to the old key is not", () => {
    const renamed = (l) => { l.articles[0].key = "loans/guide-2"; l.articles[0].keyChanges = [{ from: "loans/guide", reason: "clearer title" }]; };
    assert.equal(check(renamed, (c) => (c.articles[0].slug = "guide-2")).ok, true);
    expectCode(check(renamed, (c) => (c.articles[0].slug = "guide")), "ARTICLE_KEY_REVERTED", "article:1");
  });

  test("invalid ids, keys and duplicates in the catalog", () => {
    for (const bad of [0, -3, 1.5, "7", null, undefined]) expectCode(check(() => {}, (c) => (c.articles[0].id = bad)), "ARTICLE_ID_INVALID");
    expectCode(check(() => {}, (c) => (c.articles[1].id = 1)), "ARTICLE_ID_DUPLICATE", "article:1");
    expectCode(check(() => {}, (c) => (c.articles[0].topic = "Bad Topic")), "ARTICLE_KEY_INVALID", "article:1");
  });

  test("legitimate retirement is accepted and the item may then leave the catalog", () => {
    const retire = (l) => { l.articles[1].state = "retired"; l.articles[1].retired = { reason: "folded into guide" }; };
    assert.equal(check(retire, (c) => c.articles.splice(1, 1)).ok, true);
    expectCode(check(retire), "RETIRED_ID_REUSED", "article:2");
  });

  test("a new article takes the next id and advances the high-water mark", () => {
    const allocate = (l) => { l.articles.push({ id: 4, key: "tax/fresh", keyChanges: [], provenance: "allocated", state: "active" }); l.nextArticleId = 5; };
    const r = check(allocate, (c) => c.articles.push({ id: 4, topic: "tax", slug: "fresh", status: "published" }), baseLedger());
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("an invalid ledger stops everything with its own errors", () => {
    const r = check((l) => (l.nextArticleId = 1));
    expectCode(r, "NEXT_ID_INVALID");
    assert.ok(codes(r).every((c) => !c.startsWith("ARTICLE_") && !c.startsWith("TOOL_")));
  });

  test("never throws on malformed catalogs", () => {
    for (const bad of [null, undefined, 5, "x", [null], [5], [{}]]) {
      const r = checkIdentities({ ledger: baseLedger(), articles: bad, tools: bad, toolModules: null });
      assert.equal(typeof r.ok, "boolean");
    }
  });
});

describe("comparison with the previous committed ledger", () => {
  test("identical ledgers pass", () => assert.equal(compareLedgers(baseLedger(), baseLedger()).ok, true));

  test("protected records cannot be dropped, revived or re-labelled", () => {
    expectCode(compare((l) => ((l.articles = l.articles.slice(1)))), "RECORD_DROPPED", "article:1");
    expectCode(compare((l) => ((l.articles = l.articles.slice(0, 2)), (l.nextArticleId = 3))), "RECORD_DROPPED", "article:3");
    expectCode(compare((l) => (l.tools = l.tools.slice(1))), "RECORD_DROPPED", "tool:alpha");
    expectCode(compare((l) => ((l.articles[2].state = "active"), delete l.articles[2].retired)), "RETIRED_REVIVED", "article:3");
    expectCode(compare((l) => ((l.tools[1].state = "active"), delete l.tools[1].retired)), "RETIRED_REVIVED", "tool:beta");
    expectCode(compare((l) => (l.articles[2].retired.reason = "different story")), "RETIREMENT_EDITED", "article:3");
    expectCode(compare((l) => (l.tools[1].retired.reason = "different story")), "RETIREMENT_EDITED", "tool:beta");
    expectCode(compare((l) => (l.articles[0].provenance = "allocated")), "PROVENANCE_CHANGED", "article:1");
    expectCode(compare((l) => (l.tools[0].provenance = "added")), "PROVENANCE_CHANGED", "tool:alpha");
  });

  test("the verified window is evidence and cannot be edited", () => {
    expectCode(compare((l) => (l.historyWindow.startDate = "2026-01-01")), "WINDOW_CHANGED");
    expectCode(compare((l) => (l.historyWindow.scope = "Everything since the beginning.")), "WINDOW_CHANGED");
  });

  test("a rename must append exactly one history entry; history cannot be rewritten", () => {
    expectCode(compare((l) => (l.articles[0].key = "loans/other")), "KEY_CHANGED", "article:1");
    expectCode(compare((l) => ((l.articles[0].key = "loans/other"), (l.articles[0].keyChanges = [{ from: "loans/WRONG", reason: "x" }]))), "KEY_CHANGED", "article:1");
    expectCode(compare((l) => ((l.articles[0].key = "loans/other"), (l.articles[0].keyChanges = [{ from: "loans/guide", reason: "a" }, { from: "loans/x", reason: "b" }]))), "KEY_CHANGED", "article:1");
    expectCode(compare((l) => (l.articles[2].keyChanges = [])), "HISTORY_REWRITTEN", "article:3");
    expectCode(compare((l) => (l.articles[2].keyChanges[0].reason = "edited")), "HISTORY_REWRITTEN", "article:3");
    expectCode(compare((l) => ((l.articles[2].key = "tax/again"))), "KEY_CHANGED", "article:3");
    const ok = compare((l) => ((l.articles[0].key = "loans/other"), (l.articles[0].keyChanges = [{ from: "loans/guide", reason: "clearer" }])));
    assert.equal(ok.ok, true, JSON.stringify(ok.errors));
  });

  test("a tool move must append exactly one history entry", () => {
    expectCode(compare((l) => (l.tools[0].module = "assets/js/tools/other.js")), "MODULE_CHANGED", "tool:alpha");
    expectCode(compare((l) => (l.tools[1].module = "assets/js/tools/other.js")), "MODULE_CHANGED", "tool:beta");
    const ok = compare((l) => ((l.tools[0].module = "assets/js/tools/other.js"), (l.tools[0].moduleChanges = [{ from: "assets/js/tools/alpha/index.js", reason: "moved" }])));
    assert.equal(ok.ok, true, JSON.stringify(ok.errors));
  });

  test("retiring is allowed; new records follow the allocation rule", () => {
    assert.equal(compare((l) => ((l.articles[0].state = "retired"), (l.articles[0].retired = { reason: "merged" }))).ok, true);
    assert.equal(compare((l) => ((l.tools[0].state = "retired"), (l.tools[0].retired = { reason: "replaced" }))).ok, true);
    const add = (extra) => (l) => { l.articles.push({ id: 4, key: "tax/new", keyChanges: [], provenance: "allocated", state: "active", ...extra }); l.nextArticleId = 5; };
    assert.equal(compare(add({})).ok, true);
    expectCode(compare(add({ provenance: "history-verified" })), "PROVENANCE_INVALID", "article:4");
    expectCode(compare(add({ provenance: "bootstrap" })), "PROVENANCE_INVALID", "article:4");
    expectCode(compare(add({ keyChanges: [{ from: "tax/older", reason: "x" }] })), "RECORD_INVALID", "article:4");
    const newTool = (extra) => (l) => { l.tools.push({ id: "zeta", module: "assets/js/tools/zeta/index.js", moduleChanges: [], provenance: "added", state: "active", ...extra }); };
    assert.equal(compare(newTool({})).ok, true);
    expectCode(compare(newTool({ provenance: "bootstrap" })), "PROVENANCE_INVALID", "tool:zeta");
  });

  test("a gap below the previous high-water mark can never be filled", () => {
    const previous = baseLedger();
    previous.articles.splice(1, 1); // ids 1 and 3 only; next stays 4
    const current = baseLedger();
    current.articles.splice(1, 1, { id: 2, key: "loans/gap", keyChanges: [], provenance: "allocated", state: "active" });
    expectCode(compareLedgers(previous, current), "ID_BELOW_HIGH_WATER", "article:2");
  });

  test("the high-water mark cannot be lowered", () => {
    const previous = baseLedger();
    previous.articles.push({ id: 4, key: "tax/four", keyChanges: [], provenance: "allocated", state: "active" });
    previous.nextArticleId = 5;
    const current = baseLedger();
    expectCode(compareLedgers(previous, current), "RECORD_DROPPED", "article:4");
  });

  test("an invalid ledger on either side is reported, not thrown", () => {
    const broken = baseLedger();
    broken.nextArticleId = 1;
    assert.equal(compareLedgers(broken, baseLedger()).ok, false);
    assert.equal(compareLedgers(baseLedger(), null).ok, false);
    assert.equal(compareLedgers(undefined, undefined).ok, false);
  });

  test("editing the catalog and the ledger together does not bypass the protection once the previous ledger is supplied", () => {
    const tampered = baseLedger();
    tampered.articles[0].key = "loans/swapped";
    const c = catalog();
    c.articles[0].slug = "swapped";
    assert.equal(checkIdentities({ ledger: tampered, articles: c.articles, tools: c.tools, toolModules: c.toolModules }).ok, true, "premise: consistent on its own");
    expectCode(checkIdentities({ ledger: tampered, previousLedger: baseLedger(), articles: c.articles, tools: c.tools, toolModules: c.toolModules }), "KEY_CHANGED", "article:1");
    const dropped = baseLedger();
    dropped.tools = dropped.tools.slice(1);
    const c2 = catalog();
    c2.tools.shift();
    assert.equal(checkIdentities({ ledger: dropped, articles: c2.articles, tools: c2.tools, toolModules: c2.toolModules }).ok, true, "premise: consistent on its own");
    expectCode(checkIdentities({ ledger: dropped, previousLedger: baseLedger(), articles: c2.articles, tools: c2.tools, toolModules: c2.toolModules }), "RECORD_DROPPED", "tool:alpha");
  });
});

describe("the real ledger", () => {
  let registry;
  let file;
  before(async () => {
    registry = await loadRegistry();
    file = readLedgerFile();
  });

  test("the file is valid, canonical text", () => {
    assert.equal(file.ok, true, JSON.stringify(file.errors));
    assert.equal(fs.readFileSync(path.join(REPO_ROOT, LEDGER_FILE), "utf8"), serializeLedger(file.ledger));
  });

  test("records every declared article id, published and coming-soon, with its current key", () => {
    const declared = registry.articles.map((a) => a.id).sort((a, b) => a - b);
    assert.deepEqual(file.ledger.articles.map((a) => a.id), declared);
    assert.ok(registry.articles.some((a) => a.status !== "published"), "premise: coming-soon articles exist");
    for (const a of registry.articles) assert.equal(file.ledger.articles.find((r) => r.id === a.id).key, `${a.topic}/${a.slug}`);
    assert.equal(file.ledger.nextArticleId, Math.max(...declared) + 1);
    assert.ok(file.ledger.articles.every((a) => a.state === "active" && a.keyChanges.length === 0));
  });

  test("records exactly the published tools, anchored to their real implementation files; placeholders are not recorded", () => {
    const published = registry.tools.filter((t) => t.status === "published").map((t) => t.id).sort();
    assert.deepEqual(file.ledger.tools.map((t) => t.id), published);
    assert.ok(registry.tools.some((t) => t.status !== "published"), "premise: coming-soon tools exist");
    for (const record of file.ledger.tools) {
      assert.equal(record.module, registry.facts.toolModules[record.id].path);
      assert.ok(fs.statSync(path.join(REPO_ROOT, record.module)).isFile(), record.module);
      assert.ok(["bootstrap", "added"].includes(record.provenance), `${record.id}: ${record.provenance}`); // "added" is the provenance of a tool recorded after the bootstrap (docs/growth-manifest.md)
    }
  });

  test("provenance claims exactly what the evidence supports", () => {
    assert.ok(file.ledger.articles.every((a) => a.provenance === "history-verified"));
    const w = file.ledger.historyWindow;
    assert.equal(w.startDate, "2026-09-29");
    assert.match(w.scope, /Nothing before 2026-09-29 is claimed/);
    assert.match(w.scope, /Tool records carry no history claim/);
  });

  test("the catalogs satisfy the ledger", () => {
    const r = checkIdentities({ ledger: file.ledger, articles: registry.articles, tools: registry.tools, toolModules: registry.facts.toolModules });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test("it only ever grows relative to its previous committed version", (t) => {
    let committed;
    try {
      committed = execFileSync("git", ["show", `HEAD:${LEDGER_FILE}`], { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      t.skip("the ledger is not committed yet, so there is no previous version to compare");
      return;
    }
    const previous = parseLedgerText(committed.replace(/\r\n/g, "\n"));
    assert.equal(previous.ok, true, JSON.stringify(previous.errors));
    const r = compareLedgers(previous.ledger, file.ledger);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });
});

describe("integration with the B2 export", () => {
  let registryFile;
  before(() => {
    registryFile = readLedgerFile();
  });
  const ledgerHash = () => sha256Hex(fs.readFileSync(path.join(REPO_ROOT, LEDGER_FILE), "utf8"));

  test("the real export passes the identity gate and does not touch the ledger", async () => {
    const before = ledgerHash();
    const r = await exportPublishedItems();
    assert.equal(r.ok, true, JSON.stringify(r.errors.slice(0, 3)));
    assert.equal(ledgerHash(), before, "the ledger is never rewritten");
  });

  test("an identity problem fails closed before any item is produced", async () => {
    const ledger = structuredClone(registryFile.ledger);
    const dropped = ledger.tools.shift();
    const r = await exportPublishedItems({ ledger });
    assert.equal(r.ok, false);
    assert.deepEqual(r.items, []);
    expectCode({ ok: false, errors: r.errors }, "TOOL_UNLEDGERED", `tool:${dropped.id}`);
  });

  test("the previous committed ledger, when supplied, is enforced", async () => {
    const previous = structuredClone(registryFile.ledger);
    previous.articles.push({ id: previous.nextArticleId, key: "ghost/never-published", keyChanges: [], provenance: "allocated", state: "active" });
    previous.nextArticleId += 1;
    const r = await exportPublishedItems({ previousLedger: previous });
    assert.equal(r.ok, false);
    assert.deepEqual(r.items, []);
    assert.ok(r.errors.some((e) => e.code === "RECORD_DROPPED"));
  });

  test("a missing or corrupt ledger file is an error, never an empty ledger", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tz-ledger-"));
    const missing = readLedgerFile({ root: dir });
    assert.equal(missing.ok, false);
    assert.equal(missing.errors[0].code, "LEDGER_MISSING");
    fs.mkdirSync(path.join(dir, "scripts", "growth-manifest"), { recursive: true });
    fs.writeFileSync(path.join(dir, LEDGER_FILE), "{ not json");
    assert.equal(readLedgerFile({ root: dir }).ok, false);
    fs.writeFileSync(path.join(dir, LEDGER_FILE), JSON.stringify(registryFile.ledger));
    assert.equal(readLedgerFile({ root: dir }).errors[0].code, "LEDGER_NOT_CANONICAL");
  });
});

describe("purity", () => {
  test("the ledger module has no file system, network, process or clock access", () => {
    const source = fs.readFileSync(path.join(REPO_ROOT, "scripts", "growth-manifest", "ledger.mjs"), "utf8");
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const token of ["node:fs", "node:path", "node:os", "node:child_process", "node:http", "node:net", "fetch(", "writeFile", "Date.now", "new Date()", "Math.random", "process.env", "eval(", "import("]) assert.equal(code.includes(token), false, `ledger.mjs must not use ${token}`);
    for (const ch of source) assert.ok(ch === "\n" || (ch >= " " && ch <= "~"), `non-ASCII character U+${ch.codePointAt(0).toString(16)}`);
    for (const m of source.matchAll(/^import .* from "([^"]+)";?$/gm)) assert.match(m[1], /^[.][/][a-z-]+[.]mjs$/);
  });

  test("validation does not mutate its inputs", () => {
    const ledger = baseLedger();
    const c = catalog();
    const snapshot = JSON.stringify([ledger, c]);
    checkIdentities({ ledger, previousLedger: baseLedger(), ...c });
    compareLedgers(baseLedger(), ledger);
    assert.equal(JSON.stringify([ledger, c]), snapshot);
  });
});
