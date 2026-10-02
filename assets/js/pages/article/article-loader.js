/* =========================================================
   ToolZen Hub
   Article Loader

   Purpose:
   Resolves the current article URL to a published article in
   the article catalog (data/articles.js), loads its content
   module on demand, and joins metadata and content into the
   article object the page renders (article-model.js).

   Expected URL:

   GitHub Pages:
   /Toolzenhub/articles/{topic}/{slug}/

   Production:
   /articles/{topic}/{slug}/
========================================================= */


/* =========================================================
   ARTICLE CATALOG
========================================================= */

import {
    getArticleByKey
} from "../../data/articles.js";


/* =========================================================
   ARTICLE MODEL
========================================================= */

import {
    buildArticle
} from "./article-model.js";


/* =========================================================
   Get Article Route Key
========================================================= */

function getArticleRouteKey() {

    const pathname =
        window.location.pathname;

    const marker =
        "/articles/";

    const markerIndex =
        pathname.indexOf(
            marker
        );

    if (markerIndex === -1) {

        console.error(
            "ToolZen Hub: Article route could not be determined.",
            pathname
        );

        return "";

    }

    const route =
        pathname
            .substring(
                markerIndex + marker.length
            )
            .replace(
                /^\/+|\/+$/g,
                ""
            );

    return route;

}


/* =========================================================
   LOAD ARTICLE
========================================================= */

export async function loadArticle() {

    const routeKey =
        getArticleRouteKey();

    if (!routeKey) {

        console.error(
            "ToolZen Hub: Article route could not be determined."
        );

        return null;

    }


    /*
     * Only published articles have a content loader.
     * Coming-soon entries and unknown routes stop here.
     */

    const entry =
        getArticleByKey(
            routeKey
        );

    const loader =
        entry?.content;

    if (!loader) {

        console.error(
            `ToolZen Hub: No article registered for "${routeKey}".`
        );

        return null;

    }


    try {

        const module =
            await loader();

        const content =
            module.default ||
            module.article ||
            null;

        if (!content) {

            console.error(
                "ToolZen Hub: Article module loaded but no article data was exported.",
                routeKey
            );

            return null;

        }

        return buildArticle(
            entry,
            content
        );

    } catch (error) {

        console.error(
            "ToolZen Hub: Failed to load article data.",
            error
        );

        return null;

    }

}
