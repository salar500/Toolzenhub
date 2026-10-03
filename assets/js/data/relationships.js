/* =========================================================
   ToolZen Hub
   Content Relationships

   One place that decides what is related to what, for all
   four directions:

       tool    -> related tools
       tool    -> related articles
       article -> related tools
       article -> related articles

   CURATED FIRST, AUTOMATIC SECOND

   1. Curated links are explicit ids in the catalogs and are
      always kept, in the order written:

        tool.relatedTools      [tool ids]         (optional)
        tool.relatedArticles   [article keys]     (optional)
        article.tools          [tool ids]         (exists)
        article.related        [article keys]     (exists)

   2. Automatic fallback comes from the hierarchy
      (data/taxonomy.js): the same subcategory first, then the
      same major category, in catalog order. It only ever
      ADDS to a curated list (when `fill` is on) and never
      replaces or reorders it.

   Only published items are returned, and an item is never
   related to itself. Items are catalog entries (the caller
   formats them).
========================================================= */

import {
    tools
} from "./tools.js";

import {
    articles,
    getArticleByKey
} from "./articles.js";


/* =========================================================
   HELPERS
========================================================= */

const publishedTools = () =>
    tools.filter(
        tool =>
            tool.available
    );

const publishedArticles = () =>
    articles.filter(
        article =>
            article.published
    );

const toolById = id =>
    tools.find(
        tool =>
            tool.id === id
    );


/*
 * curated first, then automatic fill; no duplicates; the
 * subject itself (`exclude`) is dropped BEFORE the limit.
 */

function resolve(
    curated,
    automatic,
    {
        limit,
        fill = true,
        exclude
    } = {}
) {

    const seen = new Set(
        exclude === undefined
            ? []
            : [exclude]
    );
    const result = [];

    const add = item => {

        if (!item || seen.has(item.key ?? item.id)) {
            return;
        }

        seen.add(item.key ?? item.id);
        result.push(item);

    };

    curated.forEach(add);

    if (fill) {
        automatic.forEach(add);
    }

    return typeof limit === "number"
        ? result.slice(0, limit)
        : result;

}


/*
 * Same subcategory first, then the rest of the category.
 */

function byHierarchy(
    items,
    subject
) {

    const sameCategory =
        items.filter(
            item =>
                item.category === subject.category
        );

    const sameSubcategory =
        subject.subcategory
            ? sameCategory.filter(
                item =>
                    item.subcategory === subject.subcategory
            )
            : [];

    return [
        ...sameSubcategory,
        ...sameCategory
    ];

}


/* =========================================================
   TOOL -> RELATED TOOLS
========================================================= */

export function getRelatedTools(
    toolId,
    options = {}
) {

    const tool =
        toolById(toolId);

    if (!tool) {
        return [];
    }

    const curated =
        (tool.relatedTools || [])
            .map(toolById)
            .filter(
                item =>
                    item && item.available
            );

    const automatic =
        byHierarchy(
            publishedTools(),
            tool
        );

    return resolve(
        curated,
        automatic,
        {
            ...options,
            exclude: toolId
        }
    );

}


/* =========================================================
   TOOL -> RELATED ARTICLES

   Curated keys first, then articles that point at the tool,
   then the rest of its category.
========================================================= */

export function getRelatedArticlesForTool(
    toolId,
    options = {}
) {

    const tool =
        toolById(toolId);

    if (!tool) {
        return [];
    }

    const curated =
        (tool.relatedArticles || [])
            .map(getArticleByKey)
            .filter(
                item =>
                    item && item.published
            );

    const pointingAtTool =
        publishedArticles().filter(
            article =>
                (article.tools || []).includes(toolId)
        );

    const automatic = [
        ...pointingAtTool,
        ...byHierarchy(
            publishedArticles(),
            tool
        )
    ];

    return resolve(
        curated,
        automatic,
        options
    );

}


/* =========================================================
   ARTICLE -> RELATED TOOLS

   The article's own tool list (curated), then published
   tools of its category.
========================================================= */

export function getRelatedToolsForArticle(
    articleKey,
    options = {}
) {

    const article =
        getArticleByKey(articleKey);

    if (!article) {
        return [];
    }

    const curated =
        (article.tools || [])
            .map(toolById)
            .filter(
                item =>
                    item && item.available
            );

    const automatic =
        byHierarchy(
            publishedTools(),
            article
        );

    return resolve(
        curated,
        automatic,
        options
    );

}


/* =========================================================
   ARTICLE -> RELATED ARTICLES

   A curated list is shown as written and is NOT padded
   (fill is off by default). An article with no curated list
   falls back to the other published articles of its category.
========================================================= */

export function getRelatedArticles(
    articleKey,
    {
        limit,
        fill
    } = {}
) {

    const article =
        getArticleByKey(articleKey);

    if (!article) {
        return [];
    }

    const curated =
        (article.related || [])
            .map(getArticleByKey)
            .filter(
                item =>
                    item && item.published
            );

    const automatic =
        byHierarchy(
            publishedArticles(),
            article
        );

    const hasCuratedList =
        Array.isArray(article.related) &&
        article.related.length > 0;

    return resolve(
        curated,
        automatic,
        {
            limit,
            fill: fill ?? !hasCuratedList,
            exclude: articleKey
        }
    );

}
