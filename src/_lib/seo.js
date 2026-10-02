/**
 * Build-time SEO helpers (never shipped to the browser).
 *
 * Every absolute URL here is the PRODUCTION origin (assets/js/site-config.js) plus a site path.
 * A deployment base such as /Toolzenhub/ never appears in them.
 */
import { SITE, productionUrl } from "../../assets/js/site-config.js";

const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };

/**
 * "Aug 25, 2026" -> "2026-08-25". The visible date text is untouched; this only gives structured data
 * the ISO 8601 format schema.org expects. Throws on an unrecognised format instead of guessing.
 */
export function isoDate(display) {
  const m = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/.exec(String(display).trim());
  if (!m || !MONTHS[m[1]]) throw new Error(`Cannot convert date "${display}" to ISO 8601`);
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, "0")}`;
}

/** a link as the browser sees it ("/Toolzenhub/loans.html") -> the site path ("/loans.html") */
export function sitePath(href, base = globalThis.__TZ_SITE_BASE__ || "/") {
  const withoutBase = base !== "/" && href.startsWith(base) ? "/" + href.slice(base.length) : href;
  return withoutBase;
}

/** BreadcrumbList from the same items the visible breadcrumb shows; the last item is the current page */
export function breadcrumbLd(trail, currentSitePath) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => {
      const last = index === trail.length - 1;
      const entry = { "@type": "ListItem", position: index + 1, name: String(item.label).trim() };
      if (last) entry.item = productionUrl(currentSitePath);
      else if (item.href) entry.item = productionUrl(sitePath(item.href));
      return entry;
    }),
  };
}

/** Article structured data: the fields the page has always declared, with ISO dates */
export function articleLd(article, { url, imageUrl }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description || article.introduction || "",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": article.author?.type || "Organization", name: article.author?.name || SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: productionUrl("/favicon.svg") } },
    articleSection: article.category,
  };
  if (article.datePublished) schema.datePublished = isoDate(article.datePublished);
  if (article.dateModified) schema.dateModified = isoDate(article.dateModified);
  if (imageUrl) schema.image = imageUrl;
  return schema;
}

/** FAQPage structured data. The FAQ is visible on the page (details/summary), which is what makes this appropriate. */
export function faqLd(article) {
  if (!article.faq || !article.faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
}
