/**
 * M0.12 — Visual baselines (full-page screenshots).
 *
 * Pages: Home, Categories, Loans, Calculators, EMI, Loan Comparison, Articles, one published article,
 * Contact, 404.  Viewports: desktop (1280×800) and mobile (390×844) for all; tablet (820×1180) for the
 * four most important pages.
 *
 * Determinism: external fonts/images are stubbed (see helpers/test-base.mjs), animations disabled,
 * lazy images forced to load, web fonts awaited. Baselines live in tests/baselines/visual/
 * (<page>-<project>.png). They were generated on one machine/OS; text anti-aliasing differs between
 * platforms, so regenerate with `npm run baseline:update` on a new machine rather than loosening
 * the tolerance. Do not redesign to "make screenshots pass" — review the diff images in test-results/.
 */
import { test, expect, settleImages } from "../helpers/test-base.mjs";

const PAGES = [
  // name, path, ready selector, include on tablet
  ["home", "", "#latest-articles a.article-card", true],
  ["categories", "categories.html", "#categories-grid .category-page-card", false],
  ["loans", "loans.html", "#loans-calculators-grid .calculator-card", false],
  ["calculators", "calculators.html", "#calculators-grid .calculator-card", false],
  ["emi", "calculators/emi/", ".related-article-card", true],
  ["loan-comparison", "calculators/loan-comparison/", ".related-article-card", true],
  ["articles", "articles.html", "#articles-list .article-card", false],
  ["article", "articles/loan-comparison/what-is-loan-prepayment/", ".article-related-card", true],
  ["contact", "contact.html", "form.contact-form", false],
  ["not-found", "no/such/page", ".nf-card h1", false],
];

test.describe("visual baselines @visual", () => {
  for (const [name, path, ready, onTablet] of PAGES) {
    test(name, async ({ page, go }, testInfo) => {
      test.skip(testInfo.project.name === "visual-tablet" && !onTablet, "tablet baselines cover the four key pages only");
      await go(path);
      await expect(page.locator(ready).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      // force lazy images to load FIRST (decode() would wait forever on a lazy image that never started), then decode
      expect(await settleImages(page), "broken images would make the screenshot meaningless").toEqual([]);
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page).toHaveScreenshot(["visual", `${name}.png`], { fullPage: true });
    });
  }
});
