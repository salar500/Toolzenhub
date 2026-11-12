/**
 * Dark-theme visual baselines (full-page screenshots), one representative page per template and ecosystem.
 *
 * The theme follows the DEVICE setting (colorScheme "dark"), so nothing is stored and the page is what a visitor on a
 * dark device sees (assets/js/ui/theme.js). Same determinism and tolerance as visual.spec.js (light), whose baselines
 * are untouched; these live in tests/baselines/visual-dark/<page>-<project>.png.
 *
 * Reviewed before recording: do not accept a diff to make a run pass.
 */
import { test, expect, settleImages } from "../helpers/test-base.mjs";

const PAGES = [
  // name, path, ready selector, include on tablet
  ["home", "", "#latest-articles a.article-card", true],
  ["tools", "tools.html", ".directory-group", false],
  ["categories", "categories.html", "#categories-grid .category-page-card", false],
  ["loans", "loans.html", "#loans-calculators-grid .calculator-card", false],
  ["emi", "calculators/emi/", ".related-article-card", true],
  ["article", "articles/loan-comparison/how-to-reduce-home-loan-interest/", ".article-related-card", true],
  ["articles", "articles.html", "#articles-list .article-card", false],
  ["json-formatter", "tools/json-formatter/", ".calculator-info details", true],
  ["date-difference", "tools/date-difference/", ".calculator-info details", false],
  ["image-compressor", "tools/image-compressor-resizer/", ".calculator-info details", false],
  ["merge-pdf", "tools/merge-pdf/", ".calculator-info details", false],
  ["ai-tools", "ai-tools.html", ".category-page-card", false],
  ["prompt-builder", "tools/prompt-builder/", ".calculator-info details", true],
  ["practice-labs", "practice-labs.html", ".category-page-card", false],
  ["sql-practice-lab", "tools/sql-practice-lab/", ".calculator-info details", false],
  ["learning-path", "practice-labs/sql/", ".learn-card", false],
  ["contact", "contact.html", "form.contact-form", false],
  ["not-found", "no/such/page", ".nf-card h1", false],
];

test.describe("dark theme visual baselines @visual", () => {
  test.use({ colorScheme: "dark" });

  for (const [name, path, ready, onTablet] of PAGES) {
    test(name, async ({ page, go }, testInfo) => {
      test.skip(testInfo.project.name === "visual-tablet" && !onTablet, "tablet baselines cover the key templates only");
      await go(path);
      // the 404 page is a self-contained document (its own CSS, no data-theme); it follows the device setting through a media query
      if (name !== "not-found") expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
      await expect(page.locator(ready).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await settleImages(page), "broken images would make the screenshot meaningless").toEqual([]);
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page).toHaveScreenshot(["visual-dark", `${name}.png`], { fullPage: true });
    });
  }
});
