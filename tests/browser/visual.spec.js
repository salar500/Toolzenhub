/**
 * M0.12 — Visual baselines (full-page screenshots).
 *
 * Pages: Home, Categories, Loans, Calculators, EMI, Loan Comparison, Loan Prepayment, Articles, one published article,
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
  ["tools", "tools.html", ".directory-group", false],
  ["investment", "investment.html", ".category-page-card", false],
  ["loans", "loans.html", "#loans-calculators-grid .calculator-card", false],
  ["calculators", "calculators.html", "#calculators-grid .calculator-card", false],
  ["emi", "calculators/emi/", ".related-article-card", true],
  ["loan-comparison", "calculators/loan-comparison/", ".related-article-card", true],
  ["prepayment", "calculators/prepayment/", ".related-article-card", true],
  ["balance-transfer", "calculators/balance-transfer/", ".related-article-card", true],
  ["sip", "calculators/sip/", ".related-article-card", true],
  ["margin", "calculators/margin/", ".related-article-card", true],
  ["profit", "calculators/profit/", ".related-article-card", true],
  ["home-loan", "calculators/home-loan/", ".related-article-card", true],
  ["fd", "calculators/fd/", ".related-article-card", true],
  ["gst", "calculators/gst/", ".related-article-card", true],
  ["cagr", "calculators/cagr/", ".related-article-card", true],
  ["percentage", "calculators/percentage/", ".related-article-card", true],
  ["time-tools", "time-tools.html", ".category-page-card, .directory-tools a", false],
  ["date-difference", "tools/date-difference/", ".calculator-info details", false],
  ["date-calculator", "tools/date-calculator/", ".calculator-info details", false],
  ["countdown-timer", "tools/countdown-timer/", ".calculator-info details", false],
  ["stopwatch", "tools/stopwatch/", ".calculator-info details", false],
  ["developer-tools", "developer-tools.html", ".category-page-card, .directory-tools a", false],
  ["json-formatter", "tools/json-formatter/", ".calculator-info details", false],
  ["articles", "articles.html", "#articles-list .article-card", false],
  ["article", "articles/loan-comparison/what-is-loan-prepayment/", ".article-related-card", true],
  ["contact", "contact.html", "form.contact-form", false],
  ["not-found", "no/such/page", ".nf-card h1", false],
];

/*
 * The Unix Timestamp Converter shows a live clock and the browser's own time zone, so its baseline pins both: a fixed, paused clock and
 * a fixed zone. (The page is still screenshotted the same way as every other page.)
 */
test.describe("visual baselines @visual (clock and zone pinned)", () => {
  test.use({ timezoneId: "Asia/Kolkata", locale: "en-US" });

  test("unix-timestamp-converter", async ({ page, go }) => {
    await page.clock.install({ time: new Date("2026-03-10T09:59:59Z") });
    await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator("#ts-panel")).toHaveAttribute("data-ready", "true");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(["visual", "unix-timestamp-converter.png"], { fullPage: true });
  });
});

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
