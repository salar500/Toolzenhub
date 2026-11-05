/**
 * docs/seo-keyword-map.json is an internal planning file generated from the catalogs (scripts/gen-seo-keyword-map.mjs): it covers every
 * live page once, is complete, and is never turned into a meta keywords tag.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const map = JSON.parse(fs.readFileSync("docs/seo-keyword-map.json", "utf8"));
const inventory = JSON.parse(fs.readFileSync("tests/inventory/url-inventory.json", "utf8"));

test("one entry per live page, each with a primary keyword, an intent and the planned fields", () => {
  assert.equal(map.entries.length, inventory.live.length);
  assert.deepEqual(map.entries.map((e) => e.url).sort(), inventory.live.map((p) => p.url).sort());
  for (const e of map.entries) {
    assert.ok(e.primaryKeyword.length > 1, e.url);
    assert.ok(e.searchIntent.length > 5, e.url);
    for (const k of ["secondaryKeywords", "relatedSearchPhrases", "relatedTools", "articleOpportunities", "cannibalizationWarnings", "contentGaps"]) assert.ok(Array.isArray(e[k]), `${e.url} ${k}`);
  }
});

test("the file says it is internal and carries no search volume or ranking claim", () => {
  assert.match(map.$comment, /INTERNAL/);
  assert.doesNotMatch(JSON.stringify(map), /monthly searches|"volume"|"ranking"/i);
});

test("no built page emits a meta keywords tag", () => {
  for (const dir of ["dist", "dist-ghpages"]) {
    if (!fs.existsSync(dir)) continue;
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith(".html") ? [`${d}/${e.name}`] : []));
    for (const f of walk(dir)) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /<meta\s+name="keywords"/i, f);
  }
});
