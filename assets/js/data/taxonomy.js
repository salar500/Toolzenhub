/* =========================================================
   ToolZen Hub
   Taxonomy

   Resolves the content hierarchy from the authoritative data:

       Section            data/categories.js   sections
         └─ Major category   data/categories.js   categories
              └─ Subcategory (optional)  data/categories.js   subcategories
                   └─ Tool           data/calculators.js
                        └─ supporting Articles   data/articles.js (article.tools)

   Relationships are stable ids:

       tool.category      -> category.id        (required)
       tool.subcategory   -> subcategory.id     (optional)
       subcategory.category -> category.id
       article.category   -> category.id
       article.tools[]    -> tool.id

   A tool may belong directly to a major category (no
   subcategory). No subcategories are defined yet; the
   functions below already handle them.

   The hierarchy is an information architecture. It does not
   have to match URLs: tool URLs stay /calculators/{id}/.
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    sections,
    categories,
    subcategories
} from "./categories.js";

import {
    calculators
} from "./calculators.js";

import {
    articles
} from "./articles.js";


/* =========================================================
   LOOKUPS
========================================================= */

export function getSection(
    idOrTitle
) {

    const wanted =
        String(idOrTitle ?? "")
            .trim()
            .toLowerCase();

    return sections.find(
        section =>
            section.id === wanted ||
            section.title.toLowerCase() === wanted
    );

}


export function getCategory(
    id
) {

    return categories.find(
        category =>
            category.id === id
    );

}


export function getCategoryByTitle(
    title
) {

    return categories.find(
        category =>
            category.title === title
    );

}


export function getSubcategory(
    id
) {

    return subcategories.find(
        subcategory =>
            subcategory.id === id
    );

}


export function getSubcategoriesOf(
    categoryId
) {

    return subcategories.filter(
        subcategory =>
            subcategory.category === categoryId
    );

}


/* =========================================================
   URLS

   Only some categories have a landing page of their own
   (Loans today). Landing pages are named by ROUTES key in
   data/categories.js.
========================================================= */

/*
 * Landing page, or null when the category has none.
 */

export function getCategoryLandingUrl(
    categoryId
) {

    const key =
        getCategory(categoryId)?.landing;

    return key
        ? ROUTES[key]
        : null;

}


/*
 * Where a category card sends the visitor: its landing page,
 * otherwise its anchor on the categories page.
 */

export function getCategoryUrl(
    categoryId
) {

    return (
        getCategoryLandingUrl(categoryId) ||
        `${ROUTES.categories}#${categoryId}`
    );

}


export function getSectionUrl(
    idOrTitle
) {

    const key =
        getSection(idOrTitle)?.landing;

    return key
        ? ROUTES[key]
        : null;

}


export function getSubcategoryLandingUrl(
    subcategoryId
) {

    const key =
        getSubcategory(subcategoryId)?.landing;

    return key
        ? ROUTES[key]
        : null;

}


/* =========================================================
   TOOLS IN THE HIERARCHY
========================================================= */

/*
 * Every tool in a major category, with or without a
 * subcategory.
 */

export function getToolsByCategory(
    categoryId
) {

    return calculators.filter(
        tool =>
            tool.category === categoryId
    );

}


export function getToolsBySubcategory(
    subcategoryId
) {

    return calculators.filter(
        tool =>
            tool.subcategory === subcategoryId
    );

}


/*
 * Tools that sit directly under the major category.
 */

export function getDirectTools(
    categoryId
) {

    return getToolsByCategory(categoryId)
        .filter(
            tool =>
                !tool.subcategory
        );

}


/*
 * Published articles that point at a tool.
 */

export function getArticlesForTool(
    toolId
) {

    return articles.filter(
        article =>
            article.published &&
            (article.tools || []).includes(toolId)
    );

}


/* =========================================================
   PATH OF A TOOL

   [section, category, subcategory?] as resolved objects.
========================================================= */

export function getToolPath(
    tool
) {

    return {
        section:
            getSection(tool?.section) || null,
        category:
            getCategory(tool?.category) || null,
        subcategory:
            tool?.subcategory
                ? getSubcategory(tool.subcategory) || null
                : null
    };

}
