/**
 * M8 — the generated site (Eleventy build).
 *
 *   1. Pages carry their content in the HTML itself: with JavaScript DISABLED, a published article shows its
 *      whole body, and a tool page shows its finished layout, breadcrumb and related sections.
 *   2. Each page loads only its own scripts: no tool code on an article or on the other tool, no framework.
 *   3. Deployment: the build declares its base, and canonicals are on the production origin in both builds.
 *
 * Runs in both deployment modes (@portable): the /Toolzenhub/ preview build and the root-domain build.
 */
import { test, expect, livePages, rel } from "../helpers/test-base.mjs";

const articles = livePages.filter((p) => p.type === "article");
const NO_IMAGE = new Set(["choose-right-loan-tenure"]);

test.describe("generated pages carry their content without JavaScript @portable", () => {
  test.use({ javaScriptEnabled: false });

  for (const a of articles) {
    test(`article ${a.slug}: whole body, takeaways, FAQ, related, breadcrumb, header, footer`, async ({ page, go }) => {
      await go(rel(a.url));
      await expect(page.locator(".article-hero h1")).toHaveText(a.expectedTitle.replace(/ \| ToolZen Hub$/, ""));
      expect(await page.locator("article.article .article-section").count(), "content sections").toBeGreaterThanOrEqual(4);
      expect(await page.locator(".article-key-takeaways li").count()).toBeGreaterThanOrEqual(3);
      expect(await page.locator(".article-faq details").count()).toBeGreaterThanOrEqual(3);
      expect(await page.locator(".article-toc a").count()).toBeGreaterThanOrEqual(4);
      await expect(page.locator(".article-related-card")).toHaveCount(/\/(loan-prepayment|balance-transfer|sip)\//.test(a.url) ? 3 : 5);
      await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
      await expect(page.locator(".article-calculator-button")).toHaveCount(1);
      await expect(page.locator(".site-header .navbar__link").first()).toBeAttached();
      await expect(page.locator("footer.footer")).toBeAttached();
      await expect(page.locator(".article-hero-image img")).toHaveCount(NO_IMAGE.has(a.slug) ? 0 : 1);
      const text = await page.locator("article.article").innerText();
      expect(text.length, "visible article text without script").toBeGreaterThan(3000);
    });
  }

  test("EMI calculator: form, supporting content, one breadcrumb and related sections are in the HTML", async ({ page, go }) => {
    await go("calculators/emi/");
    await expect(page.locator("h1")).toHaveText("EMI Calculator");
    await expect(page.locator("#emi-form")).toBeAttached();
    await expect(page.locator("#emi-loan")).toHaveValue("1000000");
    await expect(page.locator(".calculator-info")).toHaveCount(3);
    await expect(page.locator(".calculator-info details")).toHaveCount(3);
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    await expect(page.locator(".related-calculator-card")).toHaveCount(3);
    expect(await page.locator(".related-article-card").count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator(".site-header")).toBeAttached();
  });

  test("About: the whole page (heading and prose) is in the HTML", async ({ page, go }) => {
    await go("about.html");
    await expect(page.locator("#app h1")).toBeAttached();
    expect(await page.locator("#app h2").count(), "sections").toBeGreaterThanOrEqual(3);
    const text = await page.locator("#app").innerText();
    expect(text.length, "visible About text without script").toBeGreaterThan(1500);
    await expect(page.locator(".site-header")).toBeAttached();
    await expect(page.locator("footer.footer")).toBeAttached();
  });

  test("Loan Comparison: both loan cards, supporting content, one breadcrumb and related sections are in the HTML", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await expect(page.locator("h1")).toHaveText("Loan Comparison Calculator");
    await expect(page.locator("#a-amount")).toBeAttached();
    await expect(page.locator("#b-amount")).toBeAttached();
    await expect(page.locator("#compare-loans")).toBeAttached();
    await expect(page.locator(".loan-info-grid details").first()).toBeAttached();
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    await expect(page.locator(".related-calculator-card")).toHaveCount(3);
    expect(await page.locator(".related-article-card").count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe("each page loads only its own scripts @portable", () => {
  /** the .js files a page really requests (not counting the document itself) */
  async function scriptsLoaded(page, go, path) {
    const seen = new Set();
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (r.resourceType() === "script" || u.pathname.endsWith(".js")) seen.add(u.pathname);
    });
    await go(path);
    await page.waitForLoadState("networkidle");
    return [...seen];
  }
  const has = (list, fragment) => list.some((s) => s.includes(fragment));

  test("EMI page: the tool entry and the EMI module; no other tool, no router/app bundle", async ({ page, go }) => {
    const js = await scriptsLoaded(page, go, "calculators/emi/");
    expect(has(js, "/entries/tool.js")).toBe(true);
    expect(has(js, "/calculators/emi/index.js")).toBe(true);
    expect(has(js, "/formulas/loan.js")).toBe(true);
    expect(has(js, "loan-comparison")).toBe(false);
    expect(has(js, "/js/app.js")).toBe(false);
    expect(has(js, "/pages/articles/")).toBe(false);
    expect(has(js, "/pages/article/")).toBe(false);
    expect(has(js, "/hero.js")).toBe(false);
  });

  test("Loan Comparison page: the tool entry and its own module; not the EMI module", async ({ page, go }) => {
    const js = await scriptsLoaded(page, go, "calculators/loan-comparison/");
    expect(has(js, "/entries/tool.js")).toBe(true);
    expect(has(js, "/loans/loan-comparison/index.js")).toBe(true);
    expect(has(js, "/calculators/emi/")).toBe(false);
    expect(has(js, "/js/app.js")).toBe(false);
    expect(has(js, "/pages/article")).toBe(false);
  });

  test("article page: header, footer, newsletter and the table-of-contents script only", async ({ page, go }) => {
    const js = await scriptsLoaded(page, go, "articles/loan-comparison/emi-vs-total-interest/");
    expect(has(js, "/entries/article.js")).toBe(true);
    expect(has(js, "/pages/article/article-interactions.js")).toBe(true);
    for (const heavy of ["/calculators/", "/loans/", "/js/app.js", "/pages/articles/", "/pages/article/article-render.js", "/pages/article/articleContent.js", "/pages/article/article-seo.js", "/pages/tool-page.js", "/data/articles.js", "/data/calculators.js", "/hero.js"]) {
      expect(has(js, heavy), heavy).toBe(false);
    }
    expect(js.length, `modules loaded: ${js.join(", ")}`).toBeLessThanOrEqual(9);
  });

  test("home page: the application entry; no tool module", async ({ page, go }) => {
    const js = await scriptsLoaded(page, go, "");
    expect(has(js, "/js/app.js")).toBe(true);
    expect(has(js, "/calculators/emi/index.js")).toBe(false);
    expect(has(js, "/loans/loan-comparison/")).toBe(false);
  });

  test("no framework runtime anywhere: no vendor script, no hydration marker", async ({ page, go }) => {
    for (const p of ["calculators/emi/", "articles/loan-comparison/emi-vs-total-interest/"]) {
      const js = await scriptsLoaded(page, go, p);
      expect(js.every((s) => /\/assets\/js\/|\/loans\//.test(s)), `only the site's own modules: ${js.join(", ")}`).toBe(true);
      expect(await page.locator("[data-reactroot], [data-hydrate], [data-astro-cid], #__next, #__nuxt").count()).toBe(0);
    }
  });
});

test.describe("deployment base and production canonical @portable", () => {
  test("the build declares its base and every canonical is on the production origin", async ({ page, go, siteRoot }) => {
    for (const p of livePages.filter((x) => ["/", "/about.html", "/calculators/emi/", "/articles/loan-comparison/what-is-loan-prepayment/"].includes(x.url))) {
      await go(rel(p.url));
      await expect(page.locator('meta[name="tz-site-base"]')).toHaveAttribute("content", siteRoot);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://toolzenhub.in${p.url}`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://toolzenhub.in${p.url}`);
    }
  });

  test("the 404 page is noindex and declares no canonical", async ({ page, go }) => {
    await go("no/such/page");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test("in-page links and the module URL use this build's base, so nothing 404s", async ({ page, go, siteRoot, watch }) => {
    await go("calculators/emi/");
    await page.waitForLoadState("networkidle");
    const hrefs = await page.locator("a[href^='/']").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(10);
    for (const h of hrefs) expect(h.startsWith(siteRoot), h).toBe(true);
    expect(watch.failedLocal).toEqual([]);
  });
});

test.describe("pages built in the browser do not shift their footer @portable", () => {
  // The footer is generated into the HTML. On a page whose content is built by script, the content would arrive
  // above it and push it down (layout shift, a Lighthouse CLS penalty) unless the footer waits for the content.
  for (const path of ["", "categories.html", "calculators.html", "loans.html", "articles.html"]) {
    test(`${path || "home"}: the footer is not a layout-shift source and total CLS stays "good"`, async ({ page, go }) => {
      await page.addInitScript(() => {
        window.__shifts = [];
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__shifts.push({ value: e.value, nodes: (e.sources || []).map((s) => (s.node && (s.node.id || s.node.tagName)) || "?") });
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await go(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("footer.footer")).toBeVisible(); // the footer does appear once the page has rendered
      const shifts = await page.evaluate(() => window.__shifts);
      expect(shifts.flatMap((s) => s.nodes), "footer among the shifted elements").not.toContain("footer");
      expect(shifts.flatMap((s) => s.nodes)).not.toContain("footer");
      const cls = shifts.reduce((a, s) => a + s.value, 0);
      expect(cls, `cumulative layout shift ${cls.toFixed(3)}`).toBeLessThan(0.1);
    });
  }

  test("without JavaScript the footer of such a page is still shown", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto("loans.html");
    await expect(page.locator("footer.footer")).toBeVisible();
    await context.close();
  });
});
