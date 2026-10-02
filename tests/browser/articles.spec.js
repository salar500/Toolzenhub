/**
 * M0.9 — Articles: every published article page, and the articles listing page.
 *
 * Article pages are generated HTML (npm run build): the whole article and every SEO tag (canonical, Open
 * Graph, Twitter, JSON-LD) are in the file, on the PRODUCTION origin https://toolzenhub.in in both builds. The "choose-right-loan-tenure" article currently
 * has NO featured image (image: null, TODO(image)) — that is asserted as the baseline.
 */
import { test, expect, expectClean, settleImages, livePages, rel, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const articles = livePages.filter((p) => p.type === "article");
const titleOf = (p) => p.expectedTitle.replace(/ \| ToolZen Hub$/, "");
const NO_IMAGE = new Set(["choose-right-loan-tenure"]); // baseline: featured image is null

test.describe("published article pages", () => {
  for (const a of articles) {
    test(`${a.slug}`, async ({ page, go, watch, siteRoot, baseURL, api }) => {
      const response = await go(rel(a.url));
      expect(response.status()).toBe(200);
      const title = titleOf(a);

      // route, title, heading, body shell
      await expect(page).toHaveTitle(a.expectedTitle);
      await expect(page.locator(".article-hero h1")).toHaveText(title);
      await expect(page.locator("article.article")).toBeVisible();
      expect(await page.locator("article.article .article-section").count(), "content sections").toBeGreaterThanOrEqual(5);
      expect(await page.locator(".article-key-takeaways li").count(), "key takeaways").toBeGreaterThanOrEqual(3);

      // breadcrumb: Home › Articles › Loans › <title>
      const crumb = page.locator(".calculator-breadcrumb").first();
      await expect(crumb).toContainText(`Articles`);
      await expect(crumb).toContainText("Loans");
      await expect(crumb).toContainText(title);
      expect(await crumb.locator("a").evaluateAll((l) => l.map((x) => x.getAttribute("href")))).toEqual([siteRoot, `${siteRoot}articles.html`, `${siteRoot}articles.html?category=loans`]);

      // table of contents: every entry points at a real heading on the page
      const toc = await page.locator(".article-toc a").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
      expect(toc.length).toBeGreaterThanOrEqual(5);
      for (const h of toc) expect(await page.locator(h).count(), `TOC target ${h}`).toBeGreaterThan(0);

      // featured image (baseline: one article has none)
      const hero = page.locator(".article-hero-image img");
      if (NO_IMAGE.has(a.slug)) await expect(hero).toHaveCount(0);
      else {
        await expect(hero).toBeVisible();
        expect(await hero.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
        await expect(hero).toHaveAttribute("src", new RegExp(`^${siteRoot}assets/Images/articles/${a.slug}\\.png$`));
      }
      expect(await settleImages(page), "broken images").toEqual([]);

      // FAQ
      expect(await page.locator(".article-faq details").count(), "FAQ items").toBeGreaterThanOrEqual(3);

      // calculator link area
      const cta = page.locator(".article-calculator-button");
      await expect(cta).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);

      // related articles: the other five, all resolvable, none is the page itself
      const related = await page.locator(".article-related-card").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
      expect(related).toHaveLength(5);
      for (const h of related) {
        expect(h).not.toBe(`${siteRoot}articles/${a.topic}/${a.slug}/`);
        expect((await api.get(h)).status(), h).toBe(200);
      }

      // SEO generated at build time: canonical on the production origin (never the preview host) + OG title + JSON-LD
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://toolzenhub.in${a.url}`);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", a.expectedTitle);
      const ld = await page.locator('script[type="application/ld+json"]').evaluateAll((s) => s.map((x) => JSON.parse(x.textContent)["@type"]));
      expect(ld.sort()).toEqual(["Article", "BreadcrumbList", "FAQPage"]); // M8 adds the breadcrumb trail

      expectClean(watch);
    });
  }

  test("layout fits the viewport (no horizontal scroll)", async ({ page, go }) => {
    await go("articles/loan-comparison/what-is-loan-prepayment/");
    await expect(page.locator("article.article")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("articles listing page", () => {
  const cards = (page) => page.locator("#articles-list .article-card");
  const soonCards = (page) => page.locator("#articles-list .article-card--soon");

  test("renders the first page with pagination and category counts", async ({ page, go, watch }) => {
    await go("articles.html");
    await expect(page.locator("h1")).toHaveText("Articles & Guides");
    await expect(cards(page)).toHaveCount(5);
    await expect(page.locator(".articles-pagination button[data-page]:not([data-page=next])")).toHaveCount(3);
    // sidebar counts are published-only: Loans 6, everything else 0
    const counts = await page.locator(".article-category-count").evaluateAll((l) => l.map((x) => x.textContent.replace(/\D+/g, "")));
    expect(counts).toEqual(["6", "0", "0", "0", "0"]);
    // page 1 is the first five published articles, all clickable
    await expect(page.locator("#articles-list .article-card a[href]").first()).toBeVisible();
    await expect(soonCards(page)).toHaveCount(0);
    expectClean(watch);
  });

  test("pagination: page 2 mixes one published article with Coming soon; page 3 is all Coming soon", async ({ page, go }) => {
    await go("articles.html");
    await page.locator('.articles-pagination button[data-page="2"]').click();
    await expect(page.locator('.articles-pagination button[data-page="2"]')).toHaveClass(/active/);
    await expect(cards(page)).toHaveCount(5);
    await expect(soonCards(page)).toHaveCount(4);
    await page.locator('.articles-pagination button[data-page="3"]').click();
    await expect(cards(page)).toHaveCount(2);
    await expect(soonCards(page)).toHaveCount(2);
    await expect(page.locator(".articles-pagination .pagination-next")).toBeDisabled();
  });

  test("filter by category: Loans shows only the 6 published articles", async ({ page, go }) => {
    await go("articles.html");
    await page.locator('.article-filter[data-category="loans"]').click();
    await expect(page.locator('.article-filter[data-category="loans"]')).toHaveClass(/active/);
    await expect(cards(page)).toHaveCount(5);
    await expect(soonCards(page)).toHaveCount(0);
    await page.locator('.articles-pagination button[data-page="2"]').click();
    await expect(cards(page)).toHaveCount(1);
    await expect(soonCards(page)).toHaveCount(0);
  });

  test("Coming soon articles are not clickable", async ({ page, go, siteRoot }) => {
    await go("articles.html");
    await page.locator('.article-filter[data-category="investment"]').click();
    await expect(cards(page)).toHaveCount(1);
    const soon = soonCards(page).first();
    await expect(soon).toBeVisible();
    await expect(soon).toContainText("Coming soon");
    await expect(soon.locator("a")).toHaveCount(0);
    await expect(soon).toHaveAttribute("aria-disabled", "true");
    const before = page.url();
    await soon.click();
    await soon.locator("h2").click();
    expect(page.url()).toBe(before);
    await expect(page.locator(".articles-pagination button")).toHaveCount(0);
  });

  test("?category= in the URL pre-filters the list", async ({ page, go }) => {
    await go("articles.html?category=investment");
    await expect(cards(page)).toHaveCount(1);
    await expect(soonCards(page)).toHaveCount(1);
    await expect(page.locator('.article-filter[data-category="investment"]')).toHaveClass(/active/);
  });

  test("search: finds an article, shows an empty state, and clears", async ({ page, go }) => {
    await go("articles.html");
    const search = page.locator("#article-search");
    await search.fill("prepayment");
    await expect(cards(page).first()).toContainText("What Is Loan Prepayment?");
    expect(await cards(page).count()).toBeLessThan(5);
    await search.fill("zzzz-no-such-article");
    await expect(page.locator("#articles-list .articles-empty")).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    await search.fill("");
    await expect(cards(page)).toHaveCount(5);
  });

  test("clicking an article opens it, and the breadcrumb returns to the list", async ({ page, go, siteRoot }) => {
    await go("articles.html");
    const first = page.locator("#articles-list .article-card h2 a").first();
    const title = (await first.textContent()).trim();
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${siteRoot}articles/loan-comparison/[a-z-]+/$`));
    await expect(page.locator(".article-hero h1")).toHaveText(title);
    await page.locator(".calculator-breadcrumb a", { hasText: "Articles" }).first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}articles.html`);
    await expect(cards(page).first()).toBeVisible();
  });
});


/* ---------------------------------------------------------------------------------------------------------
 * M5 — authoritative article catalog (assets/js/data/articles.js).
 * Expected values are LITERALS captured from the live article objects BEFORE the migration (git a06e9bc..087dbc4),
 * not derived from the code under test.
 * ------------------------------------------------------------------------------------------------------- */
const CATALOG = {
  "how-to-reduce-home-loan-interest": { title: "How to Reduce Your Home Loan Interest", description: "Learn practical ways to reduce your home loan interest, lower your borrowing cost and save money over the life of your loan.", readTime: "6 min read", hero: "/assets/Images/articles/how-to-reduce-home-loan-interest.png", alt: "Home loan interest calculation and financial planning", related: ["emi-vs-total-interest","fixed-vs-floating-interest-rates","loan-tenure-total-interest","what-is-loan-prepayment","choose-right-loan-tenure"] },
  "emi-vs-total-interest": { title: "EMI vs Total Interest: What Should You Compare?", description: "Understand why EMI alone does not tell the complete story when comparing loan options and borrowing costs.", readTime: "5 min read", hero: "/assets/Images/articles/emi-vs-total-interest.png", alt: "EMI and total home loan interest comparison", related: ["how-to-reduce-home-loan-interest","fixed-vs-floating-interest-rates","loan-tenure-total-interest","what-is-loan-prepayment","choose-right-loan-tenure"] },
  "fixed-vs-floating-interest-rates": { title: "Fixed vs Floating Interest Rates", description: "Understand the difference between fixed and floating interest rates before choosing a loan.", readTime: "6 min read", hero: "/assets/Images/articles/fixed-vs-floating-interest-rates.png", alt: "Fixed and floating home loan interest rate comparison", related: ["how-to-reduce-home-loan-interest","emi-vs-total-interest","loan-tenure-total-interest","what-is-loan-prepayment","choose-right-loan-tenure"] },
  "loan-tenure-total-interest": { title: "How Loan Tenure Affects Total Interest", description: "See why choosing a longer or shorter loan tenure can significantly affect your total interest cost.", readTime: "6 min read", hero: "/assets/Images/articles/loan-tenure-total-interest.png", alt: "Loan tenure and total interest comparison", related: ["how-to-reduce-home-loan-interest","emi-vs-total-interest","fixed-vs-floating-interest-rates","what-is-loan-prepayment","choose-right-loan-tenure"] },
  "what-is-loan-prepayment": { title: "What Is Loan Prepayment?", description: "Understand how loan prepayment works and how paying down your principal can potentially reduce interest.", readTime: "4 min read", hero: "/assets/Images/articles/what-is-loan-prepayment.png", alt: "Home loan prepayment and principal repayment", related: ["how-to-reduce-home-loan-interest","emi-vs-total-interest","fixed-vs-floating-interest-rates","loan-tenure-total-interest","choose-right-loan-tenure"] },
  "choose-right-loan-tenure": { title: "How to Choose the Right Loan Tenure", description: "Learn how to balance monthly affordability with total borrowing cost when choosing a loan tenure.", readTime: "5 min read", hero: null, alt: null, related: ["how-to-reduce-home-loan-interest","emi-vs-total-interest","fixed-vs-floating-interest-rates","loan-tenure-total-interest","what-is-loan-prepayment"] },
};

test.describe("M5 article metadata comes from the catalog and is unchanged", () => {
  for (const [slug, want] of Object.entries(CATALOG)) {
    test(slug, async ({ page, go, siteRoot, baseURL }) => {
      await go(`articles/loan-comparison/${slug}/`);
      await expect(page).toHaveTitle(`${want.title} | ToolZen Hub`);
      await expect(page.locator(".article-hero h1")).toHaveText(want.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", want.description);
      await expect(page.locator(".article-meta")).toContainText(want.readTime);
      await expect(page.locator(".article-meta")).toContainText("Aug 25, 2026");

      // JSON-LD carries the same metadata
      const article = await page.locator('script[type="application/ld+json"]').evaluateAll((s) => s.map((x) => JSON.parse(x.textContent)).find((j) => j["@type"] === "Article"));
      expect(article.headline).toBe(want.title);
      expect(article.description).toBe(want.description);
      expect(article.articleSection).toBe("loans");
      // M8: structured data now uses ISO 8601 (was "Aug 25, 2026"); the VISIBLE date above is unchanged
      expect(article.datePublished).toBe("2026-08-25");
      expect(article.dateModified).toBe("2026-08-25");

      // hero image (one article has none yet)
      const hero = page.locator(".article-hero-image img");
      if (want.hero) {
        await expect(hero).toHaveAttribute("src", siteRoot + want.hero.replace(/^\//, ""));
        await expect(hero).toHaveAttribute("alt", want.alt);
      } else await expect(hero).toHaveCount(0);

      // curated related articles: exactly these, in this order, each with its own title
      const hrefs = await page.locator(".article-related-card").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
      expect(hrefs).toEqual(want.related.map((s) => `${siteRoot}articles/loan-comparison/${s}/`));
      const titles = await page.locator(".article-related-card h3").evaluateAll((l) => l.map((x) => x.textContent.trim()));
      expect(titles).toEqual(want.related.map((s) => CATALOG[s].title));
      await expect(page.locator(".article-related-category").first()).toHaveText("Finance");
    });
  }
});
