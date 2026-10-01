/**
 * M0.9 — Articles: every published article page, and the articles listing page.
 *
 * Article pages are rendered client-side from per-article data files; the SEO tags (canonical, Open
 * Graph, Twitter, JSON-LD) are injected at runtime. The "choose-right-loan-tenure" article currently
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

      // runtime SEO (injected by article-seo.js): canonical + OG title + two JSON-LD blocks
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL(a.url.replace(/^\//, ""), baseURL).href);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", a.expectedTitle);
      const ld = await page.locator('script[type="application/ld+json"]').evaluateAll((s) => s.map((x) => JSON.parse(x.textContent)["@type"]));
      expect(ld.sort()).toEqual(["Article", "FAQPage"]);

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
