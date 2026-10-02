/**
 * Shared Eleventy configuration for ToolZen Hub.
 *
 * The site is built twice from the SAME source, differing only in two values:
 *
 *   production  base "/"             -> dist/            (eleventy.config.js)
 *   preview     base "/Toolzenhub/"  -> dist-ghpages/    (eleventy.preview.config.js)
 *
 * The base decides where the built pages link to (their own location). It never decides the
 * canonical domain: canonical URLs, Open Graph URLs, the sitemap and structured data always use
 * the production origin from assets/js/site-config.js, in both builds.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const fileUrl = (rel) => pathToFileURL(path.join(ROOT, rel)).href;

export function normalizeBase(base) {
  const trimmed = String(base || "/").trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

export function createConfig({ base, output }) {
  const siteBase = normalizeBase(base);

  // The shipped modules under assets/js are also used at build time to produce the static HTML
  // (header, footer, tool markup, article markup). They read window/location when imported, so give
  // them a build-time stand-in, and tell routes.js which base this build is for.
  globalThis.window = { location: { hostname: "build.local", pathname: siteBase, search: "" } };
  globalThis.__TZ_SITE_BASE__ = siteBase;
  process.env.TZ_SITE_BASE = siteBase;

  return async function eleventyConfig(eleventyConfig) {
    const { headerMarkup } = await import(fileUrl("assets/js/components/header.js"));
    const { footerMarkup } = await import(fileUrl("assets/js/components/footer.js"));

    // ---- shared markup, produced by the same functions the browser used to run
    eleventyConfig.addShortcode("siteHeader", () => headerMarkup());
    eleventyConfig.addShortcode("siteFooter", () => footerMarkup());

    // ---- filters
    // JSON for a <script type="application/ld+json"> block; "<" is escaped so a value can never close the tag
    eleventyConfig.addFilter("jsonLd", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));

    // ---- the pages that belong in the sitemap, derived from the pages that are actually generated.
    // Coming-soon tools/articles have no page, so they can never appear. Static pages first (their
    // sitemapOrder), then tools, then articles, each alphabetical.
    eleventyConfig.addCollection("indexable", (api) => {
      const group = (item) => (typeof item.data.sitemapOrder === "number" ? 0 : item.url.startsWith("/calculators/") ? 1 : 2);
      return api
        .getAll()
        .filter((item) => typeof item.url === "string" && /(\/|\.html)$/.test(item.url) && item.data.noindex !== true)
        .sort((a, b) => group(a) - group(b) || (a.data.sitemapOrder ?? 0) - (b.data.sitemapOrder ?? 0) || a.url.localeCompare(b.url));
    });

    // ---- files copied as they are (the browser modules, styles, images, favicon, legacy data files)
    eleventyConfig.addPassthroughCopy({ assets: "assets" });
    eleventyConfig.addPassthroughCopy({ "loans/loan-comparison": "loans/loan-comparison" });
    eleventyConfig.addPassthroughCopy({ data: "data" });
    eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });

    eleventyConfig.setQuietMode(true);

    return {
      dir: { input: "src", includes: "_includes", data: "_data", output },
      pathPrefix: siteBase,
      templateFormats: ["njk"],
      htmlTemplateEngine: "njk",
      markdownTemplateEngine: "njk",
    };
  };
}
