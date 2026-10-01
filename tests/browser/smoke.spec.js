/**
 * M0.2 — Smoke test of EVERY live page in the URL inventory (tests/inventory/url-inventory.json).
 *
 * For each page: loads with HTTP 200, the page's primary element is rendered (client-rendered pages
 * are awaited via that selector — no sleeps), the <title> matches the inventory, header/footer exist
 * where expected, every <img> loads, and nothing throws (no uncaught JS errors, console errors,
 * or failed local requests).
 *
 * Also verifies the "Coming soon" entries are NOT routes (they must return the 404 page) and that
 * the static resources (robots.txt, sitemap.xml, favicon.svg) are served.
 *
 * Runs in both deployment modes (@portable): /Toolzenhub/ subpath and root domain.
 */
import { test, expect, expectClean, settleImages, livePages, rel, INVENTORY } from "../helpers/test-base.mjs";

test.describe("smoke: every live page loads @portable", () => {
  for (const p of livePages) {
    test(`${p.url}  [${p.type}]`, async ({ page, go, watch }) => {
      const response = await go(rel(p.url));
      expect(response.status(), "HTTP status").toBe(200);

      // client-rendered pages: wait for the real content, not a timer
      await expect(page.locator(p.primarySelector).first(), `primary element ${p.primarySelector}`).toBeVisible();

      // title
      await expect(page).toHaveTitle(p.expectedTitle);
      const title = await page.title();
      expect(title.length, "title length").toBeGreaterThanOrEqual(15);
      expect(title).toMatch(/ToolZen/);

      // a visible <h1>
      await expect(page.locator("h1").first()).toBeVisible();

      // global header / footer
      if (p.expectsHeader) {
        await expect(page.locator("#header .site-header")).toBeVisible();
        await expect(page.locator("#header a.navbar__brand")).toHaveAttribute("href", /.+/);
      }
      if (p.expectsFooter) {
        await expect(page.locator("#footer .footer")).toBeVisible();
        await expect(page.locator("#footer a[href]").first()).toBeAttached();
      }

      // document language + viewport (basic page hygiene)
      await expect(page.locator("html")).toHaveAttribute("lang", /en/);
      await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);

      // images
      const broken = await settleImages(page);
      expect(broken, "images that failed to load").toEqual([]);

      expectClean(watch);
      expect(watch.external.filter((x) => !/fonts\.googleapis\.com|images\.unsplash\.com/.test(x)), "unexpected external network use").toEqual([]);
    });
  }
});

test.describe("Coming soon entries are not routes @portable", () => {
  for (const c of INVENTORY.comingSoon) {
    test(`${c.kind} "${c.id}" -> ${c.wouldBeUrl} is a 404`, async ({ api }) => {
      const res = await api.get(rel(c.wouldBeUrl));
      expect(res.status()).toBe(404);
      expect(await res.text()).toContain("Page not found");
    });
  }
});

test.describe("static resources @portable", () => {
  test("robots.txt", async ({ api }) => {
    const res = await api.get("robots.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/text\/plain/);
    expect(await res.text()).toMatch(/^Sitemap: https:\/\/salar500\.github\.io\/Toolzenhub\/sitemap\.xml$/m);
  });

  test("sitemap.xml is XML and lists exactly the indexable pages", async ({ api }) => {
    const res = await api.get("sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toHaveLength(INVENTORY.summary.liveIndexable);
  });

  test("favicon.svg", async ({ api }) => {
    const res = await api.get("favicon.svg");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/svg/);
  });
});

test.describe("development-only files are not published @portable", () => {
  // The test server serves what GitHub Pages (Jekyll) would publish: _config.yml `exclude:` + Jekyll defaults.
  for (const dev of ["tests/README.md", "tests/baselines/visual/home-visual-desktop.png", "tests/inventory/url-inventory.json", "package.json", "package-lock.json", "playwright.config.js", "node_modules/@playwright/test/package.json", "_config.yml"]) {
    test(`/${dev} is a 404`, async ({ api }) => {
      expect((await api.get(dev)).status()).toBe(404);
    });
  }
});
