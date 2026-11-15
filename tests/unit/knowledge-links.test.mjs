/**
 * The "Learn and check" block (components/knowledge-links.js) and its data (data/knowledge.js,
 * data/official-sources.js): every reference resolves to a published page or a recorded source, sources are
 * primary, https and dated, the block stays short, and a page without an entry gets nothing.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "toolzenhub.in", pathname: "/" } };
const { KNOWLEDGE } = await import("../../assets/js/data/knowledge.js");
const { OFFICIAL_SOURCES } = await import("../../assets/js/data/official-sources.js");
const { getKnowledgeFor, renderKnowledgeLinks, resolveLearn, checkedDate } = await import("../../assets/js/components/knowledge-links.js");
const { getPublishedTools, getToolById } = await import("../../assets/js/data/tools.js");

const TODAY = "2026-11-15";
const KINDS = new Set(["standard", "documentation", "government", "regulator", "bank"]);

test("every entry belongs to a published tool and resolves completely", () => {
  const published = new Set(getPublishedTools().map((t) => t.id));
  for (const [id, entry] of Object.entries(KNOWLEDGE)) {
    assert.ok(published.has(id), `${id} is not a published tool`);
    const k = getKnowledgeFor(id);
    assert.ok(k.learn.length + k.official.length + (k.sources ? 1 : 0) > 0, `${id} has an empty entry`);
    assert.equal(k.learn.length + k.official.length + (k.sources ? 1 : 0) <= 6, true, `${id}: at most six items`);
    for (const item of [...k.learn, ...k.official]) assert.ok(item.why && item.why.length <= 200, `${id}: every link says why, briefly`);
    for (const { ref } of entry.learn ?? []) assert.match(ref, /^(path|lesson|lab|directory):/);
  }
});

test("learning links stay on the site and lab links are Practice Labs tools (rule 4.2: no other section's tools here)", () => {
  for (const id of Object.keys(KNOWLEDGE)) {
    for (const item of getKnowledgeFor(id).learn) {
      assert.match(item.href, /^\/(practice-labs|tools|ai-tools\/directory)\//, `${id}: ${item.href}`);
      if (item.kind === "Practice lab") assert.equal(getToolById(item.href.split("/")[2]).sectionId, "practice-labs");
    }
  }
  assert.throws(() => resolveLearn("lab:emi"), /Practice Labs/);
  assert.throws(() => resolveLearn("lesson:sql/beginner/nothing/here"), /no lesson/);
  assert.throws(() => resolveLearn("path:not-a-path"), /no published learning path/);
  assert.throws(() => resolveLearn("page:x"), /unknown reference/);
  assert.deepEqual(resolveLearn("directory:qa"), { kind: "AI Directory", title: "AI Directory: products for QA testers", href: "/ai-tools/directory/?audience=qa" });
  assert.equal(resolveLearn("directory:").href, "/ai-tools/directory/");
  assert.throws(() => resolveLearn("directory:managers"), /no AI directory audience/);
});

test("official sources: https, a publisher, a known kind, checked on a real date not in the future, no referral parameters", () => {
  for (const [id, s] of Object.entries(OFFICIAL_SOURCES)) {
    assert.match(s.url, /^https:\/\//, id);
    assert.doesNotMatch(s.url, /[?&](utm_|ref=|aff|via=)/i, id);
    assert.ok(s.title && s.publisher, id);
    assert.ok(KINDS.has(s.kind), id);
    assert.match(s.checkedOn, /^\d{4}-\d{2}-\d{2}$/, id);
    assert.ok(s.checkedOn <= TODAY, id);
  }
  const urls = Object.values(OFFICIAL_SOURCES).map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length, "no source listed twice");
  assert.equal(checkedDate("2026-11-15"), "15 Nov 2026");
});

test("rendering: external links open safely in a new tab and say so; text is escaped; no entry, no block", () => {
  const html = renderKnowledgeLinks("json-formatter");
  assert.match(html, /<h2 id="knowledge-links-title">Learn and check<\/h2>/);
  const external = html.match(/<a href="https:[^>]+>/g);
  assert.ok(external.length >= 2);
  for (const a of external) assert.match(a, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /opens the official site in a new tab/);
  assert.equal(renderKnowledgeLinks("text-diff"), "");
  assert.equal(renderKnowledgeLinks("no-such-tool"), "");
  const fd = renderKnowledgeLinks("fd");
  assert.match(fd, /Current FD rates on the banks&#39; own pages/);
  assert.doesNotMatch(fd, /\d+(\.\d+)?\s*%/, "no rate figure is copied onto the page (rule 13.2)");
});
