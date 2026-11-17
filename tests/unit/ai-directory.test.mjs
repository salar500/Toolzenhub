/**
 * The AI products directory (data/ai-directory.js, pages/directory/directory-html.js aiDirectoryHtml): every entry is
 * complete, dated and honest about price; no duplicates, referral codes, ratings or "best" wording; every category
 * shown has products; the page is plain HTML with safe external links, and the AI Tools page links to it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "toolzenhub.in", pathname: "/" } };
const { AI_PRODUCTS, AI_CATEGORIES, AI_AUDIENCES, PRICING, KINDS, VERIFIED } = await import("../../assets/js/data/ai-directory.js");
const { aiDirectoryHtml, sectionPageHtml, allToolsHtml } = await import("../../assets/js/pages/directory/directory-html.js");
const tax = await import("../../assets/js/data/taxonomy.js");

const TODAY = "2026-11-15";
const CATEGORY_IDS = new Set(AI_CATEGORIES.map((c) => c.id));
const AUDIENCE_IDS = new Set(AI_AUDIENCES.map((a) => a.id));

test("every entry is complete, uses known values and was checked on a real date", () => {
  assert.ok(AI_PRODUCTS.length >= 40 && AI_PRODUCTS.length <= 60, "about 40-60 products (owner direction)");
  for (const p of AI_PRODUCTS) {
    assert.match(p.id, /^[a-z0-9-]+$/, p.id);
    assert.ok(p.name && p.summary, p.id);
    assert.ok(p.summary.length <= 200, `${p.id}: a short summary`);
    assert.match(p.url, /^https:\/\//, p.id);
    assert.ok(KINDS[p.kind], `${p.id}: kind`);
    assert.ok(p.categories.length >= 1 && p.categories.length <= 2 && p.categories.every((c) => CATEGORY_IDS.has(c)), `${p.id}: categories`);
    assert.ok(p.audiences.length >= 1 && p.audiences.every((a) => AUDIENCE_IDS.has(a)), `${p.id}: audiences`);
    assert.ok(Array.isArray(p.access), `${p.id}: access`);
    assert.ok(PRICING[p.pricing], `${p.id}: pricing`);
    assert.match(p.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.verifiedOn <= TODAY);
  }
  assert.equal(VERIFIED, "2026-11-15");
});

test("no duplicates, referral codes, prices, ratings or superlatives (rules 3.1-3.3)", () => {
  const ids = AI_PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "ids unique");
  const names = AI_PRODUCTS.map((p) => p.name.toLowerCase());
  assert.equal(new Set(names).size, names.length, "names unique");
  const urls = AI_PRODUCTS.map((p) => p.url);
  assert.equal(new Set(urls).size, urls.length, "official URLs unique");
  for (const p of AI_PRODUCTS) {
    assert.doesNotMatch(p.url, /[?&](utm_|ref=|aff|via=|partner)/i, `${p.id}: no referral or tracking parameter`);
    const text = `${p.summary} ${p.note}`;
    assert.doesNotMatch(text, /[$₹€£]\s?\d|\d+\s?(usd|inr)\b/i, `${p.id}: no price`);
    assert.doesNotMatch(text, /\b(best|leading|top-rated|most popular|#1|number one|cheapest)\b/i, `${p.id}: no superlative`);
    assert.doesNotMatch(text, /\b\d(\.\d)?\s?\/\s?5\b|\bstars?\b|\brating\b/i, `${p.id}: no rating`);
  }
});

test("every category and audience offered has products; the left-out products are not listed", () => {
  for (const c of AI_CATEGORIES) assert.ok(AI_PRODUCTS.some((p) => p.categories.includes(c.id)), `${c.id} is empty`);
  for (const a of AI_AUDIENCES) assert.ok(AI_PRODUCTS.some((p) => p.audiences.includes(a.id)), `${a.id} is empty`);
  for (const host of ["windsurf.com", "tabnine.com", "codeassist.google", "perplexity.ai", "julius.ai", "canva.com", "platform.openai.com"]) {
    assert.ok(!AI_PRODUCTS.some((p) => p.url.includes(host)), `${host} was left out until checked by hand`);
  }
});

test("the page: every product as plain HTML, safe external links, filters only added by script, linked from AI Tools", () => {
  const html = aiDirectoryHtml();
  assert.equal((html.match(/class="ai-card"/g) || []).length, AI_PRODUCTS.length);
  const links = html.match(/<a class="ai-card__link"[^>]+>/g);
  assert.equal(links.length, AI_PRODUCTS.length);
  for (const a of links) assert.match(a, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /data-ai-filters hidden/, "the filter form appears only when the script runs");
  assert.match(html, /Nothing here is sponsored, ranked or an endorsement/);
  assert.doesNotMatch(html, /<img\b/, "no logos or images from other sites");
  assert.match(html, /<h1 class="categories-page__title">AI Directory<\/h1>/);
  // the sidebar names this page and does not call the overview the current page
  assert.match(html, /section-switcher__now">AI Directory</);
  assert.doesNotMatch(html, /aria-current="page"[^>]*>AI Tools overview/);
  // on the AI Tools page: one standard card in the tools grid, drawn by the shared card component (owner, 2026-11-15)
  const aiTools = sectionPageHtml("ai-tools");
  const grid = aiTools.slice(aiTools.indexOf("directory-tools"), aiTools.indexOf("directory-section__more"));
  assert.match(grid, /<a\s+href="\/ai-tools\/directory\/"\s+class="category-page-card"\s*>/);
  assert.match(grid, /<h3 class="category-page-card__title">\s*AI Directory\s*<\/h3>/);
  assert.equal((grid.match(/class="category-page-card"/g) || []).length, 9, "the eight AI tools and the directory card");
  // linked by the card and by its one sidebar entry (owner, 2026-11-16): no banner or extra link
  const nav = aiTools.slice(aiTools.indexOf('<nav class="section-switcher"'), aiTools.indexOf("</nav>", aiTools.indexOf('<nav class="section-switcher"')));
  assert.equal((nav.match(/ai-tools\/directory\//g) || []).length, 1, "one sidebar entry");
  assert.equal((aiTools.match(/ai-tools\/directory\//g) || []).length, 2, "the card and the sidebar entry, nothing else");
  assert.doesNotMatch(sectionPageHtml("developer-tools"), /ai-tools\/directory/, "only the AI Tools ecosystem links it");
  // the directory page marks itself in the sidebar
  assert.match(html, /<a href="\/ai-tools\/directory\/" aria-current="page">AI Directory<\/a>/);
  // the same seven entries wherever the section is listed and counted (owner, 2026-11-16)
  assert.equal(tax.getSectionListing("ai-tools").length, 9); // eight tools (the Workbench since 2026-11-16, the QA Workbench since 2026-11-17) and the directory
  assert.match(nav, /section-switcher__count">9</);
  const all = allToolsHtml();
  const aiBlock = all.slice(all.indexOf('id="directory-ai-tools-heading"'), all.indexOf("</section>", all.indexOf('id="directory-ai-tools-heading"')));
  assert.match(aiBlock, /directory-section__count">9 tools</);
  assert.equal((aiBlock.match(/ai-tools\/directory\//g) || []).length, 1, "All Tools lists the directory once");
});
