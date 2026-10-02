/* =========================================================
   ToolZen Hub
   Search Index

   A compact, flat list derived from the authoritative data
   (categories, subcategories, tools, articles). It is built
   when the module loads; nothing is declared twice and no
   separate index file has to be kept in sync.

   Entry
     key           "type:id", unique
     type          "category" | "subcategory" | "tool" | "article"
     id            the item's id in its own catalog
     title
     description
     category      major category id
     categoryTitle
     subcategory   subcategory id, or null
     subcategoryTitle
     aliases       optional alternative names (none defined yet)
     keywords      optional extra search words (none defined yet)
     route         where the item lives, or null when it has no page
     status        "published" | "coming-soon"

   What is indexed
   - Titles, short descriptions and ids only. Article BODIES
     are never copied here: they stay in their own lazily
     loaded modules.
   - Coming-soon items are present with status "coming-soon"
     so the pages that already list them as "Coming soon"
     cards (categories, calculators, Loans, articles) can
     keep doing so. search() leaves them out unless the
     caller asks for them (utils/search.js).
   - aliases / keywords come from the catalogs' optional
     `aliases` / `keywords` fields. None are defined today,
     so none are invented.
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    categories,
    subcategories
} from "./categories.js";

import {
    calculators
} from "./calculators.js";

import {
    articles
} from "./articles.js";

import {
    getCategory,
    getSubcategory,
    getCategoryUrl,
    getSubcategoryLandingUrl
} from "./taxonomy.js";


/* =========================================================
   HELPERS
========================================================= */

function titleOf(
    categoryId
) {

    return getCategory(categoryId)?.title || "";

}


function subcategoryTitleOf(
    subcategoryId
) {

    return subcategoryId
        ? getSubcategory(subcategoryId)?.title || ""
        : "";

}


function words(
    list
) {

    return Array.isArray(list)
        ? list.map(String)
        : [];

}


function statusOf(
    published
) {

    return published
        ? "published"
        : "coming-soon";

}


/* =========================================================
   ENTRIES
========================================================= */

function categoryEntries() {

    return categories.map(
        category => ({
            key: `category:${category.id}`,
            type: "category",
            id: category.id,
            title: category.title,
            description: category.description,
            category: category.id,
            categoryTitle: category.title,
            subcategory: null,
            subcategoryTitle: "",
            aliases: words(category.aliases),
            keywords: words(category.keywords),
            route: getCategoryUrl(category.id),
            status: "published"
        })
    );

}


function subcategoryEntries() {

    return subcategories.map(
        subcategory => ({
            key: `subcategory:${subcategory.id}`,
            type: "subcategory",
            id: subcategory.id,
            title: subcategory.title,
            description: subcategory.description || "",
            category: subcategory.category,
            categoryTitle: titleOf(subcategory.category),
            subcategory: subcategory.id,
            subcategoryTitle: subcategory.title,
            aliases: words(subcategory.aliases),
            keywords: words(subcategory.keywords),
            route: getSubcategoryLandingUrl(subcategory.id),
            status: "published"
        })
    );

}


function toolEntries() {

    return calculators.map(
        tool => ({
            key: `tool:${tool.id}`,
            type: "tool",
            id: tool.id,
            title: tool.title,
            description: tool.description,
            category: tool.category,
            categoryTitle: titleOf(tool.category),
            subcategory: tool.subcategory || null,
            subcategoryTitle: subcategoryTitleOf(tool.subcategory),
            aliases: words(tool.aliases),
            keywords: words(tool.keywords),
            route: tool.available
                ? tool.href
                : null,
            status: statusOf(tool.available)
        })
    );

}


function articleEntries() {

    return articles.map(
        article => ({
            key: `article:${article.id}`,
            type: "article",
            id: article.id,
            title: article.title,
            description: article.description,
            category: article.category,
            categoryTitle: titleOf(article.category),
            subcategory: article.subcategory || null,
            subcategoryTitle: subcategoryTitleOf(article.subcategory),
            aliases: words(article.aliases),
            keywords: words(article.keywords),
            route: article.published
                ? ROUTES.article(
                    article.topic,
                    article.slug
                )
                : null,
            status: statusOf(article.published)
        })
    );

}


/* =========================================================
   INDEX
========================================================= */

export function buildSearchIndex() {

    return [
        ...categoryEntries(),
        ...subcategoryEntries(),
        ...toolEntries(),
        ...articleEntries()
    ];

}


export const searchIndex =
    buildSearchIndex();
