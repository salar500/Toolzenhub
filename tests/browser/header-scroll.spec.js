/**
 * The global header stays reachable while scrolling (owner finding, 2026-11-09).
 * From 960 px it is sticky on every kind of page, the home page included (whose overflow rule used to defeat it).
 * Below 960 px it slides away while scrolling down and returns on any scroll up, and the phone tool bar is never covered.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const PAGES = ["", "calculators/emi/", "tools/date-difference/", "practice-labs/sql/intermediate/combining/joining-tables/", "articles.html"];

const headerBox = (page) => page.evaluate(() => {
  const b = document.getElementById("header").getBoundingClientRect();
  return { top: Math.round(b.top), bottom: Math.round(b.bottom) };
});

const scrollTo = async (page, y) => {
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(350);
};

test.describe("global header while scrolling", () => {
  for (const url of PAGES) {
    test(`${url || "home"}: reachable at the bottom of the page`, async ({ page, go }, info) => {
      await go(url);
      await page.waitForLoadState("load");
      const bottom = await page.evaluate(() => document.documentElement.scrollHeight);
      await scrollTo(page, bottom);
      const wide = (page.viewportSize()?.width ?? 0) >= 960;
      if (!wide) {
        // scrolled down: tucked away, then any upward scroll brings it back
        expect((await headerBox(page)).bottom).toBeLessThanOrEqual(0);
        const y = await page.evaluate(() => window.scrollY);
        await scrollTo(page, y - 40);
      }
      expect((await headerBox(page)).top).toBe(0);
      await expectNoHorizontalOverflow(page);
      info.annotations.push({ type: "width", description: String(page.viewportSize()?.width) });
    });
  }

  test("on a phone tool page the tool bar sits under the shown header and at the top when it hides", async ({ page, go }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 960, "phone and tablet behaviour");
    await go("tools/date-difference/");
    await page.waitForLoadState("load");
    const bar = page.locator(".section-switcher.is-drawer");
    test.skip((await bar.count()) === 0, "this layout has no drawer bar");
    await scrollTo(page, 1200);
    const hiddenBar = await bar.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(hiddenBar).toBeLessThanOrEqual(1);
    await scrollTo(page, 1100);
    const shown = await headerBox(page);
    const shownBar = await bar.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(shown.top).toBe(0);
    expect(shownBar).toBeGreaterThanOrEqual(shown.bottom - 1);
  });
});
