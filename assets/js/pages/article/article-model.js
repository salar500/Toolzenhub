/* =========================================================
   ToolZen Hub
   Article Model

   Joins the two halves of a published article:

   - metadata   data/articles.js       (identity, title, dates,
                                        image, relationships ...)
   - content    data/articles/<topic>/<slug>.js
                                       (introduction, sections,
                                        FAQ, tags, author ...)

   into the single article object the renderer and the SEO
   module consume. Pure: no DOM, no network.
========================================================= */

import {
    articleCategories
} from "../../data/articles.js";

import {
    getRelatedArticles,
    getRelatedToolsForArticle
} from "../../data/relationships.js";


/* =========================================================
   CALCULATOR RELATIONSHIP

   id + title come from the calculator catalog; the sentence
   explaining why the calculator helps stays with the article.
========================================================= */

function buildCalculator(
    entry,
    content
) {

    /*
     * The article's own (curated) tool first; the category's
     * tools only if it names none (data/relationships.js).
     */

    const calculator =
        getRelatedToolsForArticle(
            entry.key
        )[0];

    if (!calculator) {
        return undefined;
    }

    return {
        slug:
            calculator.id,
        title:
            calculator.title,
        description:
            content.calculator?.description
    };

}


/* =========================================================
   RELATED ARTICLES

   Curated, ordered keys in the catalog (shown as written, not
   padded). Each card is built from the target article's own
   metadata. Targets that are not published are skipped.
========================================================= */

function buildRelatedArticles(
    entry
) {

    return getRelatedArticles(entry.key)
        .map(
            target => ({
                slug:
                    target.slug,
                topic:
                    target.topic,
                title:
                    target.title,
                category:
                    target.relatedLabel,
                image:
                    target.heroImage ?? null
            })
        );

}


/* =========================================================
   BUILD ARTICLE
========================================================= */

export function buildArticle(
    entry,
    content
) {

    const category =
        articleCategories.find(
            item =>
                item.slug === entry.category
        );

    const calculator =
        buildCalculator(entry, content);

    return {

        ...content,

        slug:
            entry.slug,
        topic:
            entry.topic,
        title:
            entry.title,
        description:
            entry.description,

        category:
            entry.category,
        categoryName:
            category?.name ||
            entry.category,

        datePublished:
            entry.publishedAt,
        dateModified:
            entry.updatedAt,
        readTime:
            entry.readTime,

        image:
            entry.heroImage ?? null,

        ...(calculator
            ? { calculator }
            : {}),

        relatedArticles:
            buildRelatedArticles(entry)

    };

}
