/**
 * M5: the article catalog (assets/js/data/articles.js) is the single source of article metadata.
 * Expected values are LITERALS captured from the site as it was before M5 (git 087dbc4), not derived
 * from the code under test.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

// routes.js decides the URL prefix from window.location (GitHub Pages project site vs root).
globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

const PUBLISHED = [
  "loan-comparison/how-to-reduce-home-loan-interest",
  "loan-comparison/emi-vs-total-interest",
  "loan-comparison/fixed-vs-floating-interest-rates",
  "loan-comparison/loan-tenure-total-interest",
  "loan-comparison/what-is-loan-prepayment",
  "loan-comparison/choose-right-loan-tenure",
];
const COMING_SOON = [
  "investment/best-sip-strategies-for-beginners",
  "tax/tax-saving-guide-save-more-legally",
  "business/roi-vs-profit-whats-the-difference",
  "health/how-to-calculate-your-daily-calorie-needs",
  "math/how-to-calculate-percentage-easily",
  "converter/easy-unit-conversion-guide",
];
// metadata that must live ONLY in the catalog, never in a content module
const METADATA_KEYS = ["slug", "topic", "category", "categoryName", "title", "description", "datePublished", "dateModified", "readTime", "image", "relatedArticles"];

let catalog, legacy, model, calcs;
before(async () => {
  catalog = await import("../../assets/js/data/articles.js");
  legacy = await import("../../assets/js/article-registry.js");
  model = await import("../../assets/js/pages/article/article-model.js");
  calcs = await import("../../assets/js/data/calculators.js");
});

describe("catalog model", () => {
  test("12 entries with unique ids 1..12 and unique keys", () => {
    assert.deepEqual(catalog.articles.map((a) => a.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    assert.equal(new Set(catalog.articles.map((a) => a.key)).size, 12);
  });

  test("every entry has an explicit status of published or coming-soon", () => {
    for (const a of catalog.articles) assert.ok(["published", "coming-soon"].includes(a.status), `${a.key}: ${a.status}`);
  });

  test("exactly the six loan-comparison articles are published; the other six are coming-soon", () => {
    assert.deepEqual(catalog.articles.filter((a) => a.status === "published").map((a) => a.key), PUBLISHED);
    assert.deepEqual(catalog.articles.filter((a) => a.status === "coming-soon").map((a) => a.key), COMING_SOON);
  });

  test("`published` (read by listing, search and related content) is exactly status === published", () => {
    for (const a of catalog.articles) assert.equal(a.published, a.status === "published", a.key);
  });

  test("only published articles have a content loader, and every published article has one", () => {
    for (const a of catalog.articles) assert.equal(typeof a.content, a.published ? "function" : "undefined", a.key);
  });

  test("coming-soon placeholders carry no invented publication data, relationships or hero image", () => {
    for (const a of catalog.articles.filter((x) => !x.published)) {
      for (const k of ["publishedAt", "updatedAt", "heroImage", "tools", "related", "relatedLabel"]) assert.equal(a[k], undefined, `${a.key}.${k}`);
      assert.equal(a.listingDate, "Aug 25, 2026"); // existing placeholder date shown on the listing card
    }
  });

  test("published articles carry the dates, read time and card image they always had", () => {
    for (const a of catalog.articles.filter((x) => x.published)) {
      assert.equal(a.publishedAt, "Aug 25, 2026");
      assert.equal(a.updatedAt, "Aug 25, 2026");
      assert.match(a.readTime, /^\d min read$/);
      assert.match(a.cardImage.src, /^https:\/\/images\.unsplash\.com\//);
    }
  });

  test("hero images: five articles have /assets/Images/articles/<slug>.png; choose-right-loan-tenure has none yet", () => {
    for (const a of catalog.articles.filter((x) => x.published)) {
      if (a.slug === "choose-right-loan-tenure") assert.equal(a.heroImage, null);
      else assert.equal(a.heroImage.src, `/assets/Images/articles/${a.slug}.png`);
    }
  });

  test("every category exists; published counts are loans 6 and 0 elsewhere", () => {
    const slugs = catalog.articleCategories.map((c) => c.slug);
    for (const a of catalog.articles) assert.ok(slugs.includes(a.category), a.key);
    assert.deepEqual(Object.fromEntries(catalog.articleCategories.map((c) => [c.slug, c.count])), { loans: 6, investment: 0, tax: 0, business: 0, health: 0, math: 0, converter: 0 });
  });
});

describe("relationships", () => {
  test("related articles are curated, ordered, published, never the article itself, and 5 per article", () => {
    for (const a of catalog.articles.filter((x) => x.published)) {
      assert.equal(a.related.length, 5, a.key);
      assert.equal(new Set(a.related).size, 5, a.key);
      for (const key of a.related) {
        assert.notEqual(key, a.key);
        assert.equal(catalog.getArticleByKey(key)?.published, true, `${a.key} -> ${key}`);
      }
    }
    // order is curated data, not recomputed: spot-check two articles
    assert.deepEqual(catalog.getArticleByKey("loan-comparison/emi-vs-total-interest").related.map((k) => k.split("/")[1]), ["how-to-reduce-home-loan-interest", "fixed-vs-floating-interest-rates", "loan-tenure-total-interest", "what-is-loan-prepayment", "choose-right-loan-tenure"]);
    assert.deepEqual(catalog.getArticleByKey("loan-comparison/choose-right-loan-tenure").related.map((k) => k.split("/")[1]), ["how-to-reduce-home-loan-interest", "emi-vs-total-interest", "fixed-vs-floating-interest-rates", "loan-tenure-total-interest", "what-is-loan-prepayment"]);
  });

  test("related tools point at published calculators", () => {
    for (const a of catalog.articles.filter((x) => x.published)) {
      assert.deepEqual(a.tools, ["loan-comparison"]);
      for (const id of a.tools) assert.equal(calcs.getCalculatorById(id)?.status, "published");
    }
  });
});

describe("content modules hold content only", () => {
  test("no content module repeats catalog metadata, and the calculator note is only a description", async () => {
    for (const key of PUBLISHED) {
      const content = (await catalog.getArticleByKey(key).content()).default;
      for (const k of METADATA_KEYS) assert.equal(k in content, false, `${key} still has "${k}"`);
      assert.deepEqual(Object.keys(content.calculator), ["description"], key);
      for (const k of ["introduction", "author", "tags", "keyTakeaways", "tableOfContents", "sections", "faq"]) assert.ok(content[k], `${key} lost "${k}"`);
    }
  });
});

describe("article model (metadata + content -> page object)", () => {
  test("EMI vs Total Interest: literal fields as the page always received them", async () => {
    const entry = catalog.getArticleByKey("loan-comparison/emi-vs-total-interest");
    const article = model.buildArticle(entry, (await entry.content()).default);
    assert.equal(article.title, "EMI vs Total Interest: What Should You Compare?");
    assert.equal(article.description, "Understand why EMI alone does not tell the complete story when comparing loan options and borrowing costs.");
    assert.equal(article.category, "loans");
    assert.equal(article.categoryName, "Loans");
    assert.equal(article.datePublished, "Aug 25, 2026");
    assert.equal(article.dateModified, "Aug 25, 2026");
    assert.equal(article.readTime, "5 min read");
    assert.deepEqual(article.image, { src: "/assets/Images/articles/emi-vs-total-interest.png", alt: "EMI and total home loan interest comparison" });
    assert.deepEqual(Object.keys(article.calculator), ["slug", "title", "description"]);
    assert.equal(article.calculator.slug, "loan-comparison");
    assert.equal(article.calculator.title, "Loan Comparison Calculator");
    assert.deepEqual(article.relatedArticles[0], {
      slug: "how-to-reduce-home-loan-interest",
      topic: "loan-comparison",
      title: "How to Reduce Your Home Loan Interest",
      category: "Finance",
      image: { src: "/assets/Images/articles/how-to-reduce-home-loan-interest.png", alt: "Home loan interest calculation and financial planning" },
    });
  });

  test("an article without a hero image yields image: null, also as a related card", async () => {
    const entry = catalog.getArticleByKey("loan-comparison/choose-right-loan-tenure");
    const article = model.buildArticle(entry, (await entry.content()).default);
    assert.equal(article.image, null);
    const other = catalog.getArticleByKey("loan-comparison/emi-vs-total-interest");
    const otherArticle = model.buildArticle(other, (await other.content()).default);
    assert.equal(otherArticle.relatedArticles.find((r) => r.slug === "choose-right-loan-tenure").image, null);
  });

  test("related targets that are not published are skipped (curated list is read from the catalog)", async () => {
    const entry = catalog.getArticleByKey("loan-comparison/emi-vs-total-interest");
    const original = entry.related;
    entry.related = ["investment/best-sip-strategies-for-beginners", "loan-comparison/what-is-loan-prepayment", "nope/nope"];
    try {
      const article = model.buildArticle(entry, { calculator: { description: "x" } });
      assert.deepEqual(article.relatedArticles.map((r) => r.slug), ["what-is-loan-prepayment"]);
    } finally {
      entry.related = original;
    }
  });
});

describe("derived views keep their old shape", () => {
  test("legacy listing registry: 12 entries, first entry literal, `published` only on published articles", () => {
    assert.equal(legacy.articleRegistry.length, 12);
    assert.deepEqual(legacy.articleRegistry[0], {
      id: 1, published: true, category: "loans", categoryName: "Loans", topic: "loan-comparison", slug: "how-to-reduce-home-loan-interest",
      title: "How to Reduce Your Home Loan Interest",
      description: "Learn practical ways to reduce your home loan interest, lower your borrowing cost and save money over the life of your loan.",
      date: "Aug 25, 2026", readTime: "6 min read", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80", alt: "House model on desk",
    });
    assert.deepEqual(legacy.articleRegistry[6], {
      id: 7, category: "investment", categoryName: "Investment", topic: "investment", slug: "best-sip-strategies-for-beginners",
      title: "Best SIP Strategies for Beginners",
      description: "Learn practical SIP investment strategies to build wealth consistently and work towards your financial goals.",
      date: "Aug 25, 2026", readTime: "5 min read", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80", alt: "Coins with plant growing",
    });
    assert.equal(legacy.articleRegistry.filter((a) => a.published === true).length, 6);
    assert.equal(legacy.articleRegistry.filter((a) => "published" in a).length, 6);
  });
});
