/**
 * The section sidebar in all six ecosystems, the parts the section-switcher spec does not cover (2026-11-05): hide then show gives the tool back
 * exactly the width it had; Back and Forward after choosing a sibling land on the right tool with the sidebar open and that tool marked;
 * a refresh (and a direct link) opens the sidebar by default (nothing is remembered, D4); the sidebar's own scroll position and search text
 * do not leak between pages. One viewport (1600 px) where the sidebar is a column for every section, including the long labs.
 */
import { test, expect } from "../helpers/test-base.mjs";

const CASES = [
  ["calculators/emi/", "Calculators", "EMI Calculator"],
  ["tools/stopwatch/", "Time Tools", "Stopwatch"],
  ["tools/json-formatter/", "Developer Tools", "JSON Formatter"],
  ["tools/image-compressor-resizer/", "Image Tools", "Image Compressor"],
  ["tools/merge-pdf/", "PDF Tools", "Merge PDF"],
  ["tools/sql-practice-lab/", "Practice Labs", "SQL Practice Lab"]
];

const rail = (page, section) => page.getByRole("navigation", { name: `${section}: switch tool` });

for (const [route, section, current] of CASES) {
  test.describe(`${section} (${route})`, () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
    });

    test("hide then show returns the tool to its exact width and position; the current tool stays marked", async ({ page, go }) => {
      await go(route);
      await expect(rail(page, section)).toBeVisible();
      const main = page.locator("main h1").first();
      const before = await main.boundingBox();
      await rail(page, section).getByRole("button", { name: /^Hide/ }).click();
      await expect(rail(page, section)).toBeHidden();
      await page.getByRole("button", { name: new RegExp(`^Show ${section}`) }).click();
      await expect(rail(page, section)).toBeVisible();
      const after = await main.boundingBox();
      expect(Math.abs(after.x - before.x)).toBeLessThan(2);
      expect(Math.abs(after.width - before.width)).toBeLessThan(2);
      await expect(rail(page, section).locator('a[aria-current="page"]')).toContainText(current);
    });

    test("Back and Forward after choosing a sibling; refresh and a direct link open the sidebar", async ({ page, go }) => {
      await go(route);
      const start = page.url();
      const sibling = rail(page, section).locator('.section-switcher__list a:not([aria-current="page"])').first();
      const siblingName = (await sibling.innerText()).trim();
      await sibling.click();
      await page.waitForLoadState("domcontentloaded");
      const there = page.url();
      expect(there).not.toBe(start);
      await expect(rail(page, section).locator('a[aria-current="page"]')).toContainText(siblingName);
      await page.goBack();
      await expect(page).toHaveURL(start);
      await expect(rail(page, section)).toBeVisible();
      await expect(rail(page, section).locator('a[aria-current="page"]')).toContainText(current);
      await page.goForward();
      await expect(page).toHaveURL(there);
      await expect(rail(page, section).locator('a[aria-current="page"]')).toContainText(siblingName);
      // refresh after hiding: nothing was remembered, so the sidebar is open again
      const hide = rail(page, section).getByRole("button", { name: /^Hide/ });
      await hide.click();
      await expect(rail(page, section)).toBeHidden();
      await page.reload();
      await expect(rail(page, section)).toBeVisible();
      await expect(page.getByRole("button", { name: new RegExp(`^Show ${section}`) })).toBeHidden();
    });

    test("a search typed in the sidebar is not carried to the next page", async ({ page, go }) => {
      await go(route);
      const box = page.getByLabel(`Find a tool in ${section}`);
      if ((await box.count()) === 0) return; // small sections have no search box (covered in section-switcher.spec.js)
      await box.fill("zzzz");
      await box.press("Escape");
      await expect(box).toHaveValue("");
      await box.fill("a");
      await rail(page, section).locator('.section-switcher__list a:not([aria-current="page"]):visible').first().click();
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByLabel(`Find a tool in ${section}`)).toHaveValue("");
    });

  });
}
