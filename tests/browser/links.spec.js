/**
 * M0.4 (browser half) — crawl every live page, collect every RENDERED link and validate it.
 *
 * The static checker (tests/static/check-links.mjs) cannot see links that JavaScript builds from
 * ROUTES. This test can. For each live page (plus the search/filter variants) it checks:
 *   - no link escapes the deployment prefix (subpath mode: every internal href starts with
 *     /Toolzenhub/; root mode: none mentions /Toolzenhub)
 *   - every internal link targets a KNOWN live route from the URL inventory (so a typo, a stale
 *     link, or a link to a "Coming soon" route that does not exist is caught)
 *   - every distinct target really answers 200 on the exact-case server
 *   - in-page #fragment links point at an element that exists, EXCEPT the pre-existing ones recorded
 *     in the baseline (tests/baselines/links/summary.json)
 *   - "Coming soon" cards contain no links at all (intentional) and are therefore never flagged
 *   - no live page is an orphan (each is linked from somewhere)
 */
import { test, expect, livePages, rel, INVENTORY } from "../helpers/test-base.mjs";

const CATEGORY_SLUGS = ["loans", "investment", "tax", "business", "health", "math", "converter"];
const SOON = ".calculator-card--soon, .category-page-card--soon, .article-card--soon";

const VARIANTS = [
  "categories.html?q=loan",
  "calculators.html?q=emi",
  "articles.html?category=loans",
  "articles.html?category=investment",
];

test.describe("rendered link crawl @portable", () => {
  test("every rendered internal link is correct, known, and reachable", async ({ page, go, api, siteRoot, deployMode, browserName }, testInfo) => {
    test.setTimeout(240_000);
    const knownRoutes = new Set(livePages.map((p) => rel(p.url))); // "", "about.html", "calculators/emi/", …
    const crawl = [...livePages.map((p) => rel(p.url)), ...VARIANTS];

    const failures = [];
    const targets = new Map(); // site-relative path -> first page that links to it
    const summary = {};

    for (const entry of crawl) {
      const target = livePages.find((p) => rel(p.url) === entry);
      await go(entry);
      await page.waitForSelector(target ? target.primarySelector : "main, #app", { state: "visible" });

      const collect = async () =>
        page.evaluate(() => ({
          anchors: [...document.querySelectorAll("a[href]")].map((a) => ({
            raw: a.getAttribute("href"),
            abs: a.href,
            soon: !!a.closest(".calculator-card--soon, .category-page-card--soon, .article-card--soon"),
          })),
          soonWithLinks: [...document.querySelectorAll(".calculator-card--soon, .category-page-card--soon, .article-card--soon")].filter((c) => c.querySelector("a[href]") || c.hasAttribute("href")).length,
        }));

      let data = await collect();
      if (entry === "articles.html") {
        // the listing has client-side pages 2 and 3; visit them so their links are crawled too
        for (const n of ["2", "3"]) {
          await page.locator(`.articles-pagination button[data-page="${n}"]`).click();
          const more = await collect();
          data = { anchors: [...data.anchors, ...more.anchors], soonWithLinks: data.soonWithLinks + more.soonWithLinks };
        }
      }

      const pageSummary = { internal: 0, external: [], placeholders: 0, deadFragments: [] };
      if (data.soonWithLinks) failures.push(`${entry}: ${data.soonWithLinks} "Coming soon" card(s) contain a link`);
      for (const a of data.anchors) {
        const raw = a.raw.trim();
        if (raw === "#") {
          pageSummary.placeholders++;
          continue;
        }
        if (/^(mailto:|tel:|javascript:)/i.test(raw)) continue;
        const url = new URL(a.abs);
        const here = new URL(page.url());
        if (url.host !== here.host) {
          pageSummary.external.push(url.host);
          continue;
        }
        pageSummary.internal++;
        // prefix correctness
        if (deployMode === "subpath") {
          if (!url.pathname.startsWith(siteRoot)) failures.push(`${entry}: link "${raw}" escapes the ${siteRoot} prefix (-> ${url.pathname})`);
        } else if (raw.includes("/Toolzenhub")) failures.push(`${entry}: root-domain page links to "${raw}" (hard-coded /Toolzenhub)`);
        const relPath = url.pathname.startsWith(siteRoot) ? url.pathname.slice(siteRoot.length) : url.pathname.replace(/^\//, "");

        // fragment-only links point inside the current page
        if (url.pathname === here.pathname && url.hash) {
          if ((await page.locator(url.hash).count()) === 0) pageSummary.deadFragments.push(raw);
          continue;
        }
        // known route?
        if (!knownRoutes.has(relPath)) failures.push(`${entry}: link "${raw}" targets "${relPath}", which is not a live route in the URL inventory`);
        else {
          if (!targets.has(relPath)) targets.set(relPath, entry);
          if (url.hash) {
            // fragment on ANOTHER page: record (cannot cheaply verify without visiting) — the baseline lists them
            pageSummary.deadFragments.push(`${raw}  (fragment on another page; target element not verified)`);
          }
          if (url.search) {
            const q = url.searchParams;
            const okQuery = relPath === "articles.html" && CATEGORY_SLUGS.includes(q.get("category"));
            if (!okQuery) failures.push(`${entry}: link "${raw}" has an unexpected query string`);
          }
        }
      }
      pageSummary.external = [...new Set(pageSummary.external)].sort();
      pageSummary.deadFragments = [...new Set(pageSummary.deadFragments)].sort();
      summary[entry || "(home)"] = pageSummary;
    }

    // every distinct internal target answers 200
    for (const [relPath, from] of targets) {
      const res = await api.get(relPath);
      if (res.status() !== 200) failures.push(`link target "${relPath}" (linked from ${from}) returned ${res.status()}`);
    }
    // no orphans
    for (const route of knownRoutes) if (route !== "" && !targets.has(route)) failures.push(`orphan: "${route}" is not linked from any crawled page`);
    if (!targets.has("")) failures.push("orphan: the home page is not linked from any page");

    expect(failures, failures.join("\n")).toEqual([]);

    // Baseline of what the crawl found (placeholders, fragments, external hosts). Only compared in the
    // production-mode desktop project; a new placeholder / dead fragment shows up as a diff here.
    if (testInfo.project.name === "subpath-desktop") {
      expect(JSON.stringify(summary, null, 2) + "\n").toMatchSnapshot(["links", "summary.json"]);
    }
  });
});
