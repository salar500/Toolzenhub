/**
 * M0.11 — DOM structure baselines for the regions future migrations must not silently change.
 *
 * Each region is serialised by tests/helpers/dom-outline.mjs and compared with the file in
 * tests/baselines/dom/. A diff means the rendered structure changed: either a regression, or an
 * intentional change — in which case review the diff and run `npm run baseline:update`.
 *
 * Production-mode, desktop viewport only (the DOM is identical on mobile; CSS hides parts).
 */
import { test, expect } from "../helpers/test-base.mjs";
import { domOutline } from "../helpers/dom-outline.mjs";

const REGIONS = [
  // [snapshot name, page, ready selector, region selector(s)]
  ["header", "", "#header .site-header", "#header"],
  ["footer", "", "#footer .footer", "#footer"],
  ["home-main", "", "h1.hero__title", "#app"],
  ["categories-grid", "categories.html", "#categories-grid .category-page-card", "#categories-grid"],
  ["tools-directory", "tools.html", ".directory-section", ".directory-page"],
  ["investment-page", "investment.html", ".category-page-card", ".directory-page"],
  ["articles-listing", "articles.html", "#articles-list .article-card", "#articles-page"],
  ["breadcrumb-emi", "calculators/emi/", "#emi-form", ".calculator-breadcrumb"],
  ["emi-form-and-results", "calculators/emi/", "#emi-results .calculator-results__value", "#emi-form, #emi-results"],
  ["related-content-emi", "calculators/emi/", ".related-section", ".related-section"],
  ["breadcrumb-loan-comparison", "calculators/loan-comparison/", "#compare-loans", ".calculator-breadcrumb"],
  ["loan-comparison-main", "calculators/loan-comparison/", "#comparison-result .loan-summary-card", ".loan-comparison-tool, #comparison-result"],
  ["breadcrumb-article", "articles/loan-comparison/what-is-loan-prepayment/", "article.article", ".calculator-breadcrumb"],
  ["article-content-shell", "articles/loan-comparison/what-is-loan-prepayment/", "article.article", ".article-hero, article.article"],
  ["contact-form", "contact.html", "form.contact-form", "form.contact-form, .contact-form__notice, #contact-status"],
  ["not-found-page", "no/such/page", ".nf-card h1", "body"],
];

test.describe("DOM baselines @desktop-only", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "subpath-desktop", "DOM baselines are recorded once, in production desktop mode");
  });

  for (const [name, path, ready, region] of REGIONS) {
    test(name, async ({ page, go, siteRoot }) => {
      await go(path);
      await expect(page.locator(ready).first()).toBeVisible();
      const outline = await domOutline(page, region, { siteRoot });
      expect(outline).not.toContain("selector not found");
      expect(outline).toMatchSnapshot(["dom", `${name}.txt`]);
    });
  }
});
