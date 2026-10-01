/**
 * M0.13 — SEO baseline. RECORDS what the site emits TODAY; it does not judge it and nothing is added.
 *
 * For every live page (and the 404 document) it stores, as tests/baselines/seo/seo-baseline-*.json:
 *   runtime  what a rendering crawler sees after JavaScript ran: title, meta description, canonical,
 *            robots, Open Graph, Twitter, JSON-LD types, H1s, lang, viewport, theme-color, favicon
 *   rawHtml  what a NON-rendering crawler / social scraper sees before JavaScript: same tags plus the
 *            amount of visible text and H1 count (shows which pages depend entirely on JS)
 *
 * Missing tags are recorded as null / empty — that is the point. If a later phase adds canonicals,
 * Open Graph or structured data the diff shows exactly what changed; update the baseline then.
 */
import { test, expect, livePages, rel, INVENTORY } from "../helpers/test-base.mjs";

const squash = (s) => (s == null ? null : s.replace(/\s+/g, " ").trim());

/** parse the tags we care about out of an HTML string (raw, pre-JS) */
function rawFacts(html) {
  const meta = (name, attr = "name") => {
    const m = html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, "i")) || html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, "i"));
    return m ? squash(m[1]) : null;
  };
  const title = html.match(/<title>\s*([\s\S]*?)\s*<\/title>/i);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
  const visible = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<head\b[\s\S]*?<\/head>/i, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    title: title ? squash(title[1]) : null,
    description: meta("description"),
    canonical: canonical ? canonical[1] : null,
    robots: meta("robots"),
    hasOpenGraph: /property="og:/i.test(html),
    hasTwitter: /name="twitter:/i.test(html),
    hasJsonLd: /application\/ld\+json/i.test(html),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    visibleTextChars: visible.length, // characters of visible text in the raw HTML (0 => the page is an empty JS shell)
  };
}

test.describe("SEO baseline @desktop-only", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "subpath-desktop", "SEO baseline is recorded once, in production desktop mode");
  });

  test("record title / description / canonical / robots / OG / Twitter / JSON-LD / H1 for every page", async ({ page, go, api, siteRoot, baseURL }) => {
    test.setTimeout(240_000);
    const origin = new URL(baseURL).origin;
    const norm = (v) => (v == null ? v : v.split(origin).join("{ORIGIN}").split(siteRoot).join("{ROOT}"));
    const result = {};

    const pages = [...livePages.map((p) => ({ key: p.url, path: rel(p.url), ready: p.primarySelector })), { key: "(404 document)", path: "no/such/page", ready: ".nf-card h1", status: 404 }];
    for (const p of pages) {
      const raw = await (await api.get(p.path)).text();
      await go(p.path);
      await page.locator(p.ready).first().waitFor({ state: "visible" });

      const runtime = await page.evaluate(() => {
        const sq = (s) => (s == null ? null : s.replace(/\s+/g, " ").trim());
        const metas = (prefix, attr) => Object.fromEntries([...document.querySelectorAll(`meta[${attr}^="${prefix}"]`)].map((m) => [m.getAttribute(attr), sq(m.getAttribute("content"))]).sort(([a], [b]) => a.localeCompare(b)));
        const one = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) ?? null;
        return {
          title: sq(document.title),
          description: sq(one('meta[name="description"]', "content")),
          canonical: one('link[rel="canonical"]', "href"),
          robots: one('meta[name="robots"]', "content"),
          openGraph: metas("og:", "property"),
          twitter: metas("twitter:", "name"),
          jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
            const j = JSON.parse(s.textContent);
            return { type: j["@type"], keys: Object.keys(j).sort() };
          }),
          h1: [...document.querySelectorAll("h1")].map((h) => sq(h.textContent)),
          lang: document.documentElement.getAttribute("lang"),
          viewport: one('meta[name="viewport"]', "content"),
          themeColor: one('meta[name="theme-color"]', "content"),
          favicon: one('link[rel="icon"]', "href"),
          charset: document.characterSet,
        };
      });
      for (const k of ["canonical", "favicon"]) runtime[k] = norm(runtime[k]);
      runtime.openGraph = Object.fromEntries(Object.entries(runtime.openGraph).map(([k, v]) => [k, norm(v)]));
      runtime.twitter = Object.fromEntries(Object.entries(runtime.twitter).map(([k, v]) => [k, norm(v)]));

      const rawHtml = rawFacts(raw);
      rawHtml.canonical = norm(rawHtml.canonical);
      result[p.key] = { runtime, rawHtml };
    }

    // a few facts that must hold regardless of the baseline (cheap, high-value)
    for (const p of livePages) {
      const r = result[p.url];
      expect(r.runtime.title, `${p.url} title`).toBe(p.expectedTitle);
      expect((r.runtime.description || "").length, `${p.url} meta description`).toBeGreaterThan(20);
      expect(r.runtime.h1.length, `${p.url} has an H1`).toBeGreaterThanOrEqual(1);
    }

    const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
    expect(JSON.stringify(sorted, null, 2) + "\n").toMatchSnapshot(["seo", "seo-baseline.json"]);
  });
});
