/**
 * G3C-B2: the pure mapper (scripts/growth-manifest/items.mjs) on small SYNTHETIC registries. No real content, no file
 * system, no clock. Every negative case starts from one valid registry and breaks exactly one thing.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { ITEM_KEYS, computeItemFingerprint } from "../../scripts/growth-manifest/canonical.mjs";
import { APPROVED_IMAGE_PREFIX, computeMarketingEligible, isSafeSitePath, mapRegistry, parseDisplayDate } from "../../scripts/growth-manifest/items.mjs";
import { validateItems } from "../../scripts/growth-manifest/validate.mjs";
import { baseRegistry, loader } from "../helpers/growth-registry.mjs";

/** Breaks the valid registry with `mutate` and expects a fail-closed result carrying `code` for `id`. */
function expectError(mutate, code, id) {
  const registry = baseRegistry();
  mutate(registry);
  const result = mapRegistry(registry);
  assert.equal(result.ok, false, `expected ${code}`);
  assert.deepEqual(result.items, [], "nothing is exported when any published entry is broken");
  const hit = result.errors.find((e) => e.code === code && (id === undefined || e.id === id));
  assert.ok(hit, `expected ${code}${id ? " for " + id : ""}, got ${JSON.stringify(result.errors)}`);
  return result;
}

const byId = (result) => Object.fromEntries(result.items.map((i) => [i.id, i]));

describe("the valid synthetic registry", () => {
  const result = mapRegistry(baseRegistry());
  const items = byId(result);

  test("maps without errors and passes the independent validator", () => {
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.deepEqual(validateItems(result.items), { ok: true, problems: [], categorylessSections: ["time-tools"] });
  });

  test("exports exactly the published entries, in canonical order, with the 18 contract keys", () => {
    assert.deepEqual(result.items.map((i) => i.id), ["tool:emi-calculator", "tool:stopwatch", "article:1", "article:2"]);
    for (const item of result.items) assert.deepEqual(Object.keys(item).sort(), [...ITEM_KEYS].sort());
  });

  test("a tool item", () => {
    assert.deepEqual(items["tool:emi-calculator"], {
      id: "tool:emi-calculator", type: "tool", sourceId: "emi-calculator", slug: "emi-calculator", canonicalPath: "/calculators/emi-calculator/",
      title: "Tool emi-calculator", description: "Description of emi-calculator.", status: "published", section: "calculators", category: "loans",
      subcategory: null, publishedAt: null, updatedAt: null, marketingEligible: true, relatedContentIds: ["tool:stopwatch", "article:1"], image: null,
      capabilities: ["reset", "validation"], sourceFingerprint: items["tool:emi-calculator"].sourceFingerprint,
    });
  });

  test("an article item with a verified local hero", () => {
    assert.deepEqual(items["article:1"].image, { alt: "A chart of the loan", height: 675, path: "/assets/Images/articles/guide.png", width: 1200 });
    assert.equal(items["article:1"].canonicalPath, "/articles/loans/guide/");
    assert.equal(items["article:1"].section, "calculators");
    assert.equal(items["article:1"].category, "loans");
    assert.equal(items["article:1"].publishedAt, "2026-08-25");
    assert.equal(items["article:1"].updatedAt, "2026-09-01");
    assert.equal(items["article:1"].capabilities, null);
    assert.deepEqual(items["article:1"].relatedContentIds, ["tool:emi-calculator", "article:2"]);
    assert.equal(items["article:2"].image, null, "no hero means image null");
  });

  test("coming-soon entries never appear, even when they are broken", () => {
    const registry = baseRegistry();
    registry.tools[2] = { id: "Broken ID!", status: "coming-soon", title: "", description: null, category: "nope", loader };
    registry.articles[2] = { id: "x", status: "coming-soon", topic: "../..", slug: "", publishedAt: "never" };
    const r = mapRegistry(registry);
    assert.equal(r.ok, true);
    assert.deepEqual(r.items.map((i) => i.id), ["tool:emi-calculator", "tool:stopwatch", "article:1", "article:2"]);
  });

  test("the item count follows the registry, never a constant", () => {
    const registry = baseRegistry();
    registry.tools.push({ id: "extra-tool", status: "published", available: true, loader, title: "Extra", description: "Extra tool.", sectionId: "time-tools", sitePath: "/tools/extra-tool/", capabilities: { reset: false } });
    registry.facts.toolModules["extra-tool"] = { ok: true };
    registry.facts.toolStyles.push("extra-tool");
    const r = mapRegistry(registry);
    assert.equal(r.ok, true);
    assert.equal(r.items.length, result.items.length + 1);
    registry.tools.pop();
    registry.tools.splice(2, 1);
    assert.equal(mapRegistry(registry).items.length, result.items.length);
  });

  test("an unrecognized status is an error, not a silent skip", () => {
    expectError((r) => (r.tools[2].status = "draft"), "STATUS_UNSUPPORTED", "tool:future-tool");
    expectError((r) => (r.articles[2].status = "retired"), "STATUS_UNSUPPORTED", "article:3");
  });
});

describe("determinism and fingerprints", () => {
  test("the output does not depend on the order of the input catalogs", () => {
    const a = mapRegistry(baseRegistry());
    const shuffled = baseRegistry();
    shuffled.tools.reverse();
    shuffled.articles.reverse();
    const b = mapRegistry(shuffled);
    assert.deepEqual(b.items, a.items);
  });

  test("each fingerprint is the item's own and only changes with its content", () => {
    const a = mapRegistry(baseRegistry());
    for (const item of a.items) assert.equal(computeItemFingerprint(item), item.sourceFingerprint);
    const changed = baseRegistry();
    changed.tools[1].title = "Renamed stopwatch";
    const b = mapRegistry(changed);
    const fp = (r) => Object.fromEntries(r.items.map((i) => [i.id, i.sourceFingerprint]));
    assert.notEqual(fp(b)["tool:stopwatch"], fp(a)["tool:stopwatch"]);
    for (const id of ["tool:emi-calculator", "article:1", "article:2"]) assert.equal(fp(b)[id], fp(a)[id], id);
  });

  test("never reads the clock", () => {
    const realNow = Date.now;
    Date.now = () => {
      throw new Error("clock read");
    };
    try {
      assert.equal(mapRegistry(baseRegistry()).ok, true);
    } finally {
      Date.now = realNow;
    }
  });
});

describe("identity and canonical routes", () => {
  test("invalid tool ids", () => {
    for (const bad of ["Upper", "with space", "a_b", "-lead", "trail-", "a--b", "", "x".repeat(129)]) {
      expectError((r) => {
        r.tools[0].id = bad;
        r.facts.toolModules[bad] = { ok: true };
      }, "ID_INVALID");
    }
  });

  test("invalid article ids", () => {
    for (const bad of [0, -1, 1.5, "7", null, 2 ** 53]) expectError((r) => (r.articles[0].id = bad), "ID_INVALID");
  });

  test("duplicate identities and keys", () => {
    expectError((r) => (r.articles[1].id = 1), "ID_DUPLICATE", "article:1");
    expectError((r) => (r.tools[1].id = "emi-calculator"), "ID_DUPLICATE", "tool:emi-calculator");
    expectError((r) => {
      r.articles[1].slug = "guide";
      r.articles[1].key = "loans/guide";
    }, "KEY_DUPLICATE", "article:2");
  });

  test("the article route is /articles/{topic}/{slug}/", () => {
    const items = byId(mapRegistry(baseRegistry()));
    assert.equal(items["article:2"].canonicalPath, "/articles/loans/second/");
  });

  test("a tool route must equal /{section path prefix}/{id}/", () => {
    expectError((r) => (r.tools[0].sitePath = "/tools/emi-calculator/"), "PATH_INVALID", "tool:emi-calculator");
    expectError((r) => (r.tools[1].sitePath = "/tools/stopwatch"), "PATH_INVALID", "tool:stopwatch");
  });

  test("malformed topics and slugs", () => {
    for (const topic of ["Loans", "a/b", "..", "", "a b", "loans?x"]) expectError((r) => { r.articles[1].topic = topic; r.articles[1].key = `${topic}/second`; }, "PATH_INVALID", "article:2");
    for (const slug of ["", "-x", "a b", "a/b", "a?b", "x".repeat(129)]) expectError((r) => { r.articles[1].slug = slug; r.articles[1].key = `loans/${slug}`; }, "PATH_INVALID", "article:2");
  });

  test("a key that disagrees with topic/slug is refused", () => {
    expectError((r) => (r.articles[1].key = "loans/other"), "KEY_MISMATCH", "article:2");
  });

  test("routes that differ only by case collide", () => {
    expectError((r) => {
      r.articles.push({ ...r.articles[1], id: 9, slug: "Second", key: "loans/Second" });
      r.facts.articleContent["loans/Second"] = { ok: true };
    }, "PATH_DUPLICATE");
  });

  test("safe site paths", () => {
    for (const ok of ["/", "/tools/a/", "/articles/x-y/z_1.2/", "/assets/Images/a~b.png"]) assert.equal(isSafeSitePath(ok), true, ok);
    for (const bad of ["", "tools/a/", "//evil/", "https://x.test/", "/a b/", "/a?x=1", "/a#b", "/a%20b/", "/a/../b/", "/a/./b/", "/a\\b/", "/\u00e9/", "/" + "a".repeat(2048)]) assert.equal(isSafeSitePath(bad), false, bad);
  });
});

describe("sections and categories", () => {
  test("the section id is exported, never the title; a categoryless tool has category null", () => {
    const items = byId(mapRegistry(baseRegistry()));
    assert.equal(items["tool:stopwatch"].section, "time-tools");
    assert.equal(items["tool:stopwatch"].category, null);
    assert.equal(items["tool:emi-calculator"].section, "calculators");
    assert.equal(items["tool:emi-calculator"].category, "loans");
    for (const item of Object.values(items)) assert.notEqual(item.section, "Time Tools");
  });

  test("the categoryless sections are reported for review, not approved here", () => {
    const registry = baseRegistry();
    registry.sections.push({ id: "new-tools", title: "New", pathPrefix: "new" });
    registry.tools.push({ id: "fresh", status: "published", available: true, loader, title: "Fresh", description: "A fresh tool.", sectionId: "new-tools", sitePath: "/new/fresh/", capabilities: {} });
    registry.facts.toolModules.fresh = { ok: true };
    registry.facts.toolStyles.push("fresh");
    const r = mapRegistry(registry);
    assert.equal(r.ok, true);
    assert.deepEqual(validateItems(r.items).categorylessSections, ["new-tools", "time-tools"]);
  });

  test("broken taxonomy", () => {
    expectError((r) => (r.tools[1].sectionId = "nope"), "TAXONOMY_INVALID", "tool:stopwatch");
    expectError((r) => (r.tools[0].category = "nope"), "TAXONOMY_INVALID", "tool:emi-calculator");
    expectError((r) => (r.tools[0].sectionId = "calculators"), "TAXONOMY_INVALID", "tool:emi-calculator");
    expectError((r) => (r.tools[0].subcategory = "mortgage"), "TAXONOMY_INVALID", "tool:emi-calculator");
    expectError((r) => (r.articles[0].category = "nope"), "TAXONOMY_INVALID", "article:1");
    expectError((r) => (r.categories[0].sectionId = "ghost"), "TAXONOMY_INVALID");
    expectError((r) => (r.tools[0].category = undefined), "TAXONOMY_INVALID", "tool:emi-calculator");
  });

  test("an article takes its category's section and nothing is invented", () => {
    const registry = baseRegistry();
    registry.categories.push({ id: "time-cat", sectionId: "time-tools" });
    registry.articles[1].category = "time-cat";
    const items = byId(mapRegistry(registry));
    assert.equal(items["article:2"].section, "time-tools");
    assert.equal(items["article:2"].category, "time-cat");
    assert.equal(items["article:2"].subcategory, null);
  });
});

describe("titles and descriptions", () => {
  test("missing or invalid text is an error", () => {
    for (const bad of [undefined, "", "   ", 5, "x".repeat(501)]) expectError((r) => (r.tools[0].title = bad), "TITLE_INVALID", "tool:emi-calculator");
    for (const bad of [undefined, "", "  ", null, "x".repeat(5001)]) expectError((r) => (r.articles[0].description = bad), "DESCRIPTION_INVALID", "article:1");
    expectError((r) => (r.articles[0].title = "line\nbreak"), "TITLE_INVALID", "article:1");
    expectError((r) => (r.tools[0].title = "tab\there"), "TITLE_INVALID", "tool:emi-calculator");
  });

  test("a forbidden or non-NFC character fails the export, nothing is repaired", () => {
    expectError((r) => (r.tools[0].description = "zero\u200bwidth"), "TEXT_POLICY", "tool:emi-calculator");
    expectError((r) => (r.articles[1].title = "cafe\u0301"), "TEXT_POLICY", "article:2");
  });

  test("TAB and LF are allowed in a description", () => {
    const registry = baseRegistry();
    registry.tools[0].description = "line one\n\tline two";
    assert.equal(mapRegistry(registry).ok, true);
  });
});

describe("dates", () => {
  test("converts the catalog's display strings exactly", () => {
    assert.equal(parseDisplayDate("Aug 25, 2026"), "2026-08-25");
    assert.equal(parseDisplayDate("Jan 1, 2026"), "2026-01-01");
    assert.equal(parseDisplayDate("Dec 31, 2026"), "2026-12-31");
    assert.equal(parseDisplayDate("Feb 29, 2028"), "2028-02-29");
  });

  test("rejects anything else", () => {
    for (const bad of ["2026-08-25", "August 25, 2026", "Aug 25 2026", "aug 25, 2026", "Aug 25,2026", "Feb 30, 2026", "Feb 29, 2027", "Foo 1, 2026", "Aug 0, 2026", "Aug 32, 2026", "Aug 5, 26", " Aug 25, 2026", "Aug 25, 2026 ", "", null, undefined, 20260825]) {
      assert.equal(parseDisplayDate(bad), null, String(bad));
    }
  });

  test("missing, malformed and misordered dates are errors, never replaced", () => {
    expectError((r) => (r.articles[0].publishedAt = undefined), "DATE_INVALID", "article:1");
    expectError((r) => (r.articles[0].updatedAt = "2026-09-01"), "DATE_INVALID", "article:1");
    expectError((r) => (r.articles[0].updatedAt = "Aug 24, 2026"), "DATE_ORDER", "article:1");
  });

  test("the same date on both is fine; tools carry no dates", () => {
    const registry = baseRegistry();
    registry.articles[0].updatedAt = registry.articles[0].publishedAt;
    const items = byId(mapRegistry(registry));
    assert.equal(items["article:1"].updatedAt, "2026-08-25");
    assert.equal(items["tool:stopwatch"].publishedAt, null);
    assert.equal(items["tool:stopwatch"].updatedAt, null);
  });
});

describe("images", () => {
  test("a missing hero is image null; a card image is never used", () => {
    const registry = baseRegistry();
    registry.articles[0].heroImage = null;
    registry.articles[0].cardImage = { src: "/assets/Images/articles/card.png", alt: "card" };
    assert.equal(byId(mapRegistry(registry))["article:1"].image, null);
    delete registry.articles[0].heroImage;
    assert.equal(byId(mapRegistry(registry))["article:1"].image, null);
  });

  test("an external hero does not qualify: image null plus a notice", () => {
    for (const src of ["https://cdn.example.test/x.png", "//cdn.example.test/x.png", "data:image/png;base64,AAAA"]) {
      const registry = baseRegistry();
      registry.articles[0].heroImage = { src, alt: "remote" };
      const r = mapRegistry(registry);
      assert.equal(r.ok, true);
      assert.equal(byId(r)["article:1"].image, null);
      assert.ok(r.notices.some((n) => n.code === "IMAGE_NOT_LOCAL" && n.id === "article:1"));
    }
  });

  test("a present hero must be safe, local, described and verified", () => {
    const broken = [
      { src: "/assets/Images/../secret.png", alt: "x" },
      { src: "/assets/Images/a/../../x.png", alt: "x" },
      { src: "/assets/js/x.png", alt: "x" },
      { src: "/other/Images/x.png", alt: "x" },
      { src: "/assets/Images/a b.png", alt: "x" },
      { src: "/assets/Images/x.png?v=1", alt: "x" },
      { src: "/assets/Images/%2e%2e/x.png", alt: "x" },
      { src: "assets/Images/x.png", alt: "x" },
      { src: "/assets/Images/articles/guide.png", alt: "" },
      { src: "/assets/Images/articles/guide.png" },
      { src: 5, alt: "x" },
      "not an object",
    ];
    // the file facts say each path is a perfectly good image, so only the path and alt rules can reject it
    for (const hero of broken) {
      expectError((r) => {
        r.articles[0].heroImage = hero;
        if (hero && typeof hero.src === "string") r.facts.images[hero.src] = { ok: true, width: 10, height: 10 };
      }, "IMAGE_INVALID", "article:1");
    }
  });

  test("the file facts decide: unverified, zero or fractional dimensions are errors", () => {
    const src = "/assets/Images/articles/guide.png";
    expectError((r) => (r.facts.images[src] = { ok: false, error: "file does not exist" }), "IMAGE_INVALID", "article:1");
    delete baseRegistry().facts.images[src];
    expectError((r) => delete r.facts.images[src], "IMAGE_INVALID", "article:1");
    for (const dims of [{ width: 0, height: 10 }, { width: 10, height: 0 }, { width: 1.5, height: 10 }, { width: 10, height: 1000001 }, { width: -1, height: 5 }, { width: "10", height: 5 }]) {
      expectError((r) => (r.facts.images[src] = { ok: true, ...dims }), "IMAGE_INVALID", "article:1");
    }
  });

  test("the approved prefix", () => assert.equal(APPROVED_IMAGE_PREFIX, "/assets/Images/"));
});

describe("capabilities", () => {
  test("exports the true flags of the resolved catalog object, sorted", () => {
    const registry = baseRegistry();
    registry.tools[0].capabilities = { validation: true, reset: true, copy: false, examples: true };
    assert.deepEqual(byId(mapRegistry(registry))["tool:emi-calculator"].capabilities, ["examples", "reset", "validation"]);
    registry.tools[0].capabilities = { reset: false, copy: false };
    assert.deepEqual(byId(mapRegistry(registry))["tool:emi-calculator"].capabilities, []);
  });

  test("unknown or malformed capabilities are errors", () => {
    expectError((r) => (r.tools[0].capabilities = { reset: true, teleport: true }), "CAPABILITY_UNKNOWN", "tool:emi-calculator");
    expectError((r) => (r.tools[0].capabilities = { reset: "yes" }), "CAPABILITY_INVALID", "tool:emi-calculator");
    expectError((r) => (r.tools[0].capabilities = undefined), "CAPABILITY_INVALID", "tool:emi-calculator");
    expectError((r) => (r.tools[0].capabilities = ["reset"]), "CAPABILITY_INVALID", "tool:emi-calculator");
  });

  test("an unknown flag is refused even when it is false", () => {
    expectError((r) => (r.tools[0].capabilities = { reset: true, teleport: false }), "CAPABILITY_UNKNOWN", "tool:emi-calculator");
  });
});

describe("relationships", () => {
  test("curated links of all four directions become sorted content ids", () => {
    const items = byId(mapRegistry(baseRegistry()));
    assert.deepEqual(items["tool:emi-calculator"].relatedContentIds, ["tool:stopwatch", "article:1"]);
    assert.deepEqual(items["tool:stopwatch"].relatedContentIds, ["tool:emi-calculator"]);
    assert.deepEqual(items["article:1"].relatedContentIds, ["tool:emi-calculator", "article:2"]);
    assert.deepEqual(items["article:2"].relatedContentIds, ["article:1"]);
  });

  test("articles sort numerically, not as text", () => {
    const registry = baseRegistry();
    for (const id of [9, 10, 100]) {
      registry.articles.push({ ...registry.articles[1], id, slug: `a${id}`, key: `loans/a${id}` });
      registry.facts.articleContent[`loans/a${id}`] = { ok: true };
    }
    registry.articles[1].related = ["loans/a100", "loans/a9", "loans/a10", "loans/guide"];
    assert.deepEqual(byId(mapRegistry(registry))["article:2"].relatedContentIds, ["article:1", "article:9", "article:10", "article:100"]);
  });

  test("no automatic neighbours are added", () => {
    const registry = baseRegistry();
    registry.tools[1].relatedTools = undefined;
    assert.deepEqual(byId(mapRegistry(registry))["tool:stopwatch"].relatedContentIds, []);
  });

  test("unknown targets are errors", () => {
    expectError((r) => (r.tools[0].relatedTools = ["ghost"]), "RELATION_DANGLING", "tool:emi-calculator");
    expectError((r) => (r.tools[0].relatedArticles = ["loans/ghost"]), "RELATION_DANGLING", "tool:emi-calculator");
    expectError((r) => (r.articles[0].tools = ["ghost"]), "RELATION_DANGLING", "article:1");
    expectError((r) => (r.articles[0].related = ["loans/ghost"]), "RELATION_DANGLING", "article:1");
  });

  test("self references and duplicates are errors", () => {
    expectError((r) => (r.tools[0].relatedTools = ["emi-calculator"]), "RELATION_SELF", "tool:emi-calculator");
    expectError((r) => (r.articles[0].related = ["loans/guide"]), "RELATION_SELF", "article:1");
    expectError((r) => (r.tools[0].relatedTools = ["stopwatch", "stopwatch"]), "RELATION_DUPLICATE", "tool:emi-calculator");
    expectError((r) => (r.articles[0].related = ["loans/second", "loans/second"]), "RELATION_DUPLICATE", "article:1");
  });

  test("malformed lists are errors", () => {
    expectError((r) => (r.tools[0].relatedTools = "stopwatch"), "RELATION_INVALID", "tool:emi-calculator");
    expectError((r) => (r.articles[0].tools = [""]), "RELATION_INVALID", "article:1");
    expectError((r) => (r.articles[0].tools = [5]), "RELATION_INVALID", "article:1");
  });

  test("a known but unpublished target is filtered out and reported", () => {
    const registry = baseRegistry();
    registry.tools[0].relatedTools = ["stopwatch", "future-tool"];
    registry.articles[0].related = ["loans/second", "loans/later"];
    const r = mapRegistry(registry);
    assert.equal(r.ok, true);
    assert.deepEqual(byId(r)["tool:emi-calculator"].relatedContentIds, ["tool:stopwatch", "article:1"]);
    assert.deepEqual(byId(r)["article:1"].relatedContentIds, ["tool:emi-calculator", "article:2"]);
    assert.deepEqual(r.notices.filter((n) => n.code === "RELATION_UNPUBLISHED_FILTERED").map((n) => n.id).sort(), ["article:1", "tool:emi-calculator"]);
  });

  test("one-sided tool and article links are reported separately and do not fail the export", () => {
    const registry = baseRegistry();
    registry.tools[0].relatedArticles = ["loans/second"];
    const r = mapRegistry(registry);
    assert.equal(r.ok, true);
    const notes = r.notices.filter((n) => n.code === "LINK_ONE_SIDED");
    assert.equal(notes.length >= 1, true);
    assert.ok(notes.every((n) => n.id === "tool:emi-calculator"));
  });
});

describe("the page contract fails closed", () => {
  test("a published tool needs a loader, its module and its stylesheet entry", () => {
    expectError((r) => (r.tools[0].loader = undefined), "PAGE_CONTRACT", "tool:emi-calculator");
    expectError((r) => (r.facts.toolModules["emi-calculator"] = { ok: false, error: "the module file does not exist" }), "PAGE_CONTRACT", "tool:emi-calculator");
    expectError((r) => delete r.facts.toolModules["emi-calculator"], "PAGE_CONTRACT", "tool:emi-calculator");
    expectError((r) => (r.facts.toolStyles = ["stopwatch"]), "PAGE_CONTRACT", "tool:emi-calculator");
    expectError((r) => (r.tools[0].available = false), "STATUS_INCONSISTENT", "tool:emi-calculator");
  });

  test("a published article needs a loadable content module", () => {
    expectError((r) => (r.articles[0].content = undefined), "PAGE_CONTRACT", "article:1");
    expectError((r) => (r.facts.articleContent["loans/guide"] = { ok: false, error: "the module does not load" }), "PAGE_CONTRACT", "article:1");
    expectError((r) => delete r.facts.articleContent["loans/guide"], "PAGE_CONTRACT", "article:1");
    expectError((r) => (r.articles[0].published = false), "STATUS_INCONSISTENT", "article:1");
  });

  test("one broken entry blocks the whole export and every error is reported", () => {
    const registry = baseRegistry();
    registry.tools[0].title = "";
    registry.articles[1].updatedAt = "bad";
    const r = mapRegistry(registry);
    assert.equal(r.ok, false);
    assert.deepEqual(r.items, []);
    assert.deepEqual(r.errors.map((e) => e.id).sort(), ["article:2", "tool:emi-calculator"]);
  });
});

describe("marketingEligible is the documented source-side computation", () => {
  test("truth table: published AND page contract AND no item issues", () => {
    const all = { status: "published", pageContractValid: true, itemIssues: 0 };
    assert.equal(computeMarketingEligible(all), true);
    assert.equal(computeMarketingEligible({ ...all, status: "coming-soon" }), false);
    assert.equal(computeMarketingEligible({ ...all, status: "retired" }), false);
    assert.equal(computeMarketingEligible({ ...all, pageContractValid: false }), false);
    assert.equal(computeMarketingEligible({ ...all, pageContractValid: undefined }), false);
    assert.equal(computeMarketingEligible({ ...all, itemIssues: 1 }), false);
  });

  test("no manual override exists: nothing in a catalog entry can change the flag", () => {
    const registry = baseRegistry();
    registry.tools[0].marketingEligible = false;
    registry.tools[1].marketingEligible = true;
    registry.tools[1].marketingHold = true;
    registry.articles[0].marketing = "never";
    const items = byId(mapRegistry(registry));
    for (const item of Object.values(items)) assert.equal(item.marketingEligible, true, item.id);
  });
});
