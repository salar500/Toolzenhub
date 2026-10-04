/**
 * M0.3 — The 404 page (404.html).
 *
 * GitHub Pages serves 404.html, with status 404, at ANY missing URL — at any depth. The page must
 * therefore not depend on relative paths. The test server reproduces that behaviour, including
 * exact-case matching (calculators/EMI/ is a 404 on GitHub Pages).
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";

const MISSING = [
  "definitely-missing",
  "a/b/c/d/e/missing.html",
  "calculators/ppf/", // Coming soon: not a route (SIP was published in Tool Pack 3)
  "articles/investment/best-sip-strategies-for-beginners/", // Coming soon article
  "calculators/EMI/", // wrong case => 404 on GitHub Pages
  "assets/js/no-such-file.js",
];

test.describe("404 document @portable", () => {
  for (const missing of MISSING) {
    test(`/${missing}`, async ({ page, go, watch, api, siteRoot }) => {
      const response = await go(missing);
      expect(response.status(), "status code").toBe(404);

      await expect(page).toHaveTitle("Page Not Found | ToolZen Hub");
      await expect(page.locator("h1")).toHaveText("Page not found");
      await expect(page.locator("text=Sorry, we couldn't find the page")).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

      // self-contained: no site header/footer, no app.js
      await expect(page.locator("#header")).toHaveCount(0);
      await expect(page.locator("#footer")).toHaveCount(0);

      // favicon: resolved against the SITE ROOT whatever the depth, and it loads
      const iconHref = await page.locator('link[rel="icon"]').getAttribute("href");
      expect(iconHref).toBe(`${siteRoot}favicon.svg`);
      const icon = await api.get(iconHref);
      expect(icon.status()).toBe(200);

      // navigation links are rewritten to the site root (works in both deployment modes)
      const routes = ["", "calculators.html", "categories.html", "articles.html", "about.html", "contact.html"];
      const hrefs = await page.locator("a[data-route]").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(hrefs).toEqual(routes.map((r) => siteRoot + r));
      for (const h of hrefs) expect((await api.get(h)).status(), h).toBe(200);

      // the only failed local request is the 404 document itself
      expectClean(watch, { allowFailedLocal: [new URL(response.url()).pathname], expected404: 1 });
    });
  }

  test("navigation works: 404 -> Home, and 404 -> All Calculators", async ({ page, go, siteRoot }) => {
    await go("some/deep/missing/page");
    await page.getByRole("link", { name: "Go to Home" }).click();
    await expect(page).toHaveURL((u) => u.pathname === siteRoot);
    await expect(page.locator("h1.hero__title")).toBeVisible();

    await go("another/missing");
    await page.getByRole("link", { name: "All Calculators" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators.html`);
    await expect(page.locator("#calculators-grid .calculator-card").first()).toBeVisible();
  });
});

test.describe("404 document without JavaScript @portable", () => {
  test.use({ javaScriptEnabled: false });

  test("essential content is plain HTML; JS-built navigation is hidden (no broken links)", async ({ page, go }) => {
    const response = await go("no/js/missing");
    expect(response.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Page not found");
    await expect(page.locator("text=Sorry, we couldn't find the page")).toBeVisible();
    await expect(page.locator(".nf-nav")).toBeHidden();
  });
});
