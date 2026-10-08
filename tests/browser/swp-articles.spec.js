/**
 * Tool Pack 21 content pack: the two SWP articles and the SWP calculator's new Related Articles section.
 *
 * Only what is new: the article pages at 320, 360, 390 and desktop widths (no page-level overflow, readable headings and examples,
 * the call to action, the related cards, the diagram on the first article and no image space at all on the second, accessibility
 * basics) and the calculator's own related section. The generic article checks (canonical, JSON-LD, breadcrumb) run for every
 * article in articles.spec.js; the figures are pinned by tests/unit/swp-articles.test.mjs.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow, settleImages } from "../helpers/test-base.mjs";

const ONE = { slug: "how-a-systematic-withdrawal-plan-works", title: "How a Systematic Withdrawal Plan Works: Withdrawals, Growth and the Balance Left" };
const TWO = { slug: "what-changes-how-long-a-corpus-lasts", title: "What Changes How Long a Corpus Lasts: Return, Withdrawal and Yearly Increase" };
const path = (a) => `articles/swp/${a.slug}/`;

for (const width of [320, 360, 390, 1280]) {
  test.describe(`SWP articles at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const [name, a, other] of [["article 1", ONE, TWO], ["article 2", TWO, ONE]]) {
      test(`${name}: no page-level overflow, readable heading and examples, call to action and related cards at ${width}px`, async ({ page, go, watch, siteRoot, api }) => {
        await go(path(a));
        await expect(page.locator(".article-hero h1")).toHaveText(a.title);
        await expectNoHorizontalOverflow(page);

        // the long title wraps inside the viewport instead of being cut off or widening the page
        const h1 = await page.locator(".article-hero h1").evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, clipped: e.scrollWidth > e.clientWidth + 1, size: parseFloat(getComputedStyle(e).fontSize) }; });
        expect(h1.left).toBeGreaterThanOrEqual(0);
        expect(h1.right).toBeLessThanOrEqual(width);
        expect(h1.clipped).toBe(false);
        expect(h1.size).toBeGreaterThanOrEqual(22);

        // sections, takeaways and the example: visible, inside the viewport, body text at a readable size (the shared article CSS sets the
        // key takeaways one step smaller on a phone, 13px, for every article; the paragraphs are 15px)
        expect(await page.locator("article.article .article-section").count()).toBeGreaterThanOrEqual(4);
        expect(await page.locator(".article-key-takeaways li").count()).toBeGreaterThanOrEqual(4);
        await expect(page.locator(".article-example")).toBeVisible();
        const text = await page.locator("article.article .article-section p, .article-example p, .article-key-takeaways li").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, size: parseFloat(getComputedStyle(e).fontSize), min: e.tagName === "LI" ? 13 : 14, clipped: e.scrollWidth > e.clientWidth + 1 }; }));
        expect(text.length).toBeGreaterThan(8);
        for (const t of text) {
          expect(t.left).toBeGreaterThanOrEqual(0);
          expect(t.right).toBeLessThanOrEqual(width);
          expect(t.size).toBeGreaterThanOrEqual(t.min);
          expect(t.clipped).toBe(false);
        }

        // the one call to action leads to the SWP calculator
        const cta = page.locator(".article-calculator-button");
        await expect(cta).toHaveCount(1);
        await expect(cta).toHaveAttribute("href", `${siteRoot}calculators/swp/`);
        const box = await cta.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width).toBeLessThanOrEqual(width);

        // two related cards: the other SWP article and one SIP article, all resolvable
        const related = await page.locator(".article-related-card").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
        expect(related).toHaveLength(2);
        expect(related[0]).toBe(`${siteRoot}${path(other)}`);
        expect(related[1]).toMatch(a === ONE ? /\/articles\/sip\/how-a-sip-grows\/$/ : /\/articles\/sip\/how-return-assumptions-change-a-sip-projection\/$/);
        for (const h of related) expect((await api.get(h)).status(), h).toBe(200);

        expect(await settleImages(page), "broken images").toEqual([]);
        expectClean(watch);
      });
    }

    test(`article 1 shows its diagram, with alt text, inside the page at ${width}px`, async ({ page, go, siteRoot }) => {
      await go(path(ONE));
      const img = page.locator(".article-hero-image img");
      await expect(img).toBeVisible();
      expect(await img.evaluate((i) => i.complete && i.naturalWidth === 1200 && i.naturalHeight === 675)).toBe(true);
      await expect(img).toHaveAttribute("src", `${siteRoot}assets/Images/articles/${ONE.slug}.png`);
      const alt = await img.getAttribute("alt");
      expect(alt).toContain("₹99,20,000");
      expect(alt).toContain("₹99,83,826");
      // the WebP is offered first, the PNG is the fallback
      expect(await page.locator(".article-hero-image source").evaluateAll((s) => s.map((x) => x.getAttribute("type")))).toContain("image/webp");
      // The shared article CSS shows a hero at 16:10, 16:8.5 or 16:9 with object-fit: cover, so a little is trimmed at the edges. The diagram keeps its five
      // rows inside x 7.5% to 92.5% and y 11.6% to 87.7% of the 1200 x 675 canvas, so none is cut while the frame ratio stays between 1.51 and 2.3.
      const r = await img.evaluate((i) => { const b = i.getBoundingClientRect(); return { left: b.left, right: b.right, ratio: b.width / b.height, fit: getComputedStyle(i).objectFit }; });
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.right).toBeLessThanOrEqual(width);
      expect(r.fit).toBe("cover");
      expect(r.ratio).toBeGreaterThan(1.51);
      expect(r.ratio).toBeLessThan(2.3);
    });

    test(`article 2 has no image and no empty image space at ${width}px`, async ({ page, go }) => {
      await go(path(TWO));
      await expect(page.locator(".article-hero-image")).toHaveCount(0);
      await expect(page.locator(".article-hero img")).toHaveCount(0);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
      // the hero is the heading block only: the heading starts near the top of the page, not below a blank band
      const gap = await page.evaluate(() => document.querySelector(".article-hero h1").getBoundingClientRect().top - document.querySelector(".article-breadcrumb").getBoundingClientRect().bottom);
      expect(gap).toBeLessThan(160);
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("SWP articles: accessibility basics", () => {
  for (const a of [ONE, TWO]) {
    test(`${a.slug}: one h1, no skipped heading level, working contents links, labelled and keyboard-operable FAQ, visible focus`, async ({ page, go }) => {
      await go(path(a));
      expect(await page.locator("main h1, article h1").count()).toBe(1);
      const levels = await page.locator("article.article h1, article.article h2, article.article h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);

      // every contents link lands on a heading that exists
      const toc = await page.locator(".article-toc a").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
      expect(toc.length).toBeGreaterThanOrEqual(5);
      for (const h of toc) expect(await page.locator(h).count(), h).toBe(1);

      // the FAQ opens and closes from the keyboard
      const first = page.locator(".article-faq details").first();
      await first.locator("summary").focus();
      expect(await first.evaluate((d) => d.open)).toBe(false);
      await page.keyboard.press("Enter");
      expect(await first.evaluate((d) => d.open)).toBe(true);
      await page.keyboard.press("Enter");
      expect(await first.evaluate((d) => d.open)).toBe(false);

      // keyboard focus on the call to action is visible
      await page.locator(".article-calculator-button").focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await page.locator(".article-calculator-button").evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect(outline.style !== "none" && outline.width > 0 || outline.shadow !== "none").toBe(true);

      // every link has a name and every image has alt text
      for (const name of await page.locator("article.article a").evaluateAll((l) => l.map((x) => (x.textContent || x.getAttribute("aria-label") || "").trim()))) expect(name.length).toBeGreaterThan(0);
      for (const alt of await page.locator("article.article img").evaluateAll((l) => l.map((x) => x.getAttribute("alt")))) expect(alt === null || alt.length > 0).toBe(true);
    });
  }
});

test.describe("the SWP calculator receives the articles through the normal relationship", () => {
  for (const width of [320, 390]) {
    test(`Related Articles on the calculator page at ${width}px: both cards, mechanism first, the second without an image block`, async ({ page, go, siteRoot }) => {
      await page.setViewportSize({ width, height: 900 });
      await go("calculators/swp/");
      await page.locator("#swp-results .calculator-results__value").first().waitFor();
      await expect(page.getByRole("heading", { name: "Related Articles", level: 2 })).toBeVisible();
      const cards = page.locator(".related-article-card");
      await expect(cards).toHaveCount(2);
      expect(await cards.evaluateAll((l) => l.map((x) => x.getAttribute("href")))).toEqual([`${siteRoot}${path(ONE)}`, `${siteRoot}${path(TWO)}`]);
      await expect(cards.nth(0).locator("h3")).toHaveText(ONE.title);
      await expect(cards.nth(1).locator("h3")).toHaveText(TWO.title);
      await expect(cards.nth(0).locator("img")).toHaveCount(1);
      await expect(cards.nth(1).locator(".related-article-image")).toHaveCount(0);
      expect(await settleImages(page), "broken images").toEqual([]);
      await expectNoHorizontalOverflow(page);
      // the section is the page's own: the calculator itself is unchanged and still answers
      await expect(page.locator("#swp-results .calculator-results__value").first()).toHaveText("20 years 10 months");
    });
  }

  test("a card opens the article", async ({ page, go, siteRoot }) => {
    await go("calculators/swp/");
    await page.locator(".related-article-card").first().click();
    await expect(page).toHaveURL(new RegExp(`${siteRoot}articles/swp/${ONE.slug}/$`));
    await expect(page.locator(".article-hero h1")).toHaveText(ONE.title);
  });
});
