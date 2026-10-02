/**
 * One entry per PUBLISHED article, built from the article catalog (assets/js/data/articles.js).
 * Coming-soon articles have no content loader, so no page is generated for them.
 *
 * `html` is the finished article page content (hero, key takeaways, sections, FAQ, related ...), produced
 * by the same function the browser used to run (pages/article/article-render.js), so the body is in the
 * HTML and does not depend on script.
 */
import { articles } from "../../assets/js/data/articles.js";
import { buildArticle } from "../../assets/js/pages/article/article-model.js";
import { articleMarkup, articleBreadcrumbItems } from "../../assets/js/pages/article/article-render.js";
import { breadcrumbTrail } from "../../assets/js/components/breadcrumb.js";
import { SITE, productionUrl } from "../../assets/js/site-config.js";
import { breadcrumbLd, articleLd, faqLd } from "../_lib/seo.js";
import fs from "node:fs";

// Read as plain JSON (an `import ... with { type: "json" }` prints an experimental-feature warning on every build).
const articleStyles = JSON.parse(fs.readFileSync(new URL("./articleStyles.json", import.meta.url), "utf8"));

export default async function () {
  const pages = [];
  for (const entry of articles.filter((a) => a.published && typeof a.content === "function")) {
    const module = await entry.content();
    const article = buildArticle(entry, module.default || module.article);
    const sitePath = `/articles/${entry.topic}/${entry.slug}/`;
    const url = productionUrl(sitePath);
    const imageUrl = article.image?.src ? productionUrl(article.image.src) : "";
    pages.push({
      key: entry.key,
      slug: entry.slug,
      topic: entry.topic,
      sitePath,
      url,
      title: `${article.title} | ${SITE.name}`,
      description: article.description || article.introduction || "",
      themeColor: articleStyles.themeColor,
      fonts: articleStyles.fonts,
      styles: articleStyles.styles,
      imageUrl,
      imageAlt: article.image?.alt || "",
      html: articleMarkup(article),
      jsonld: [
        articleLd(article, { url, imageUrl }),
        faqLd(article),
        breadcrumbLd(breadcrumbTrail(articleBreadcrumbItems(article)), sitePath),
      ].filter(Boolean),
    });
  }
  return pages;
}
