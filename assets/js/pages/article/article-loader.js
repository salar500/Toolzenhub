/* =========================================================
   ToolZen Hub
   Article Loader

   Purpose:
   Loads the correct article data module based on
   the current article URL.

   Expected URL:

   GitHub Pages:
   /Toolzenhub/articles/{topic}/{slug}/

   Production:
   /articles/{topic}/{slug}/
========================================================= */


/* =========================================================
   Article Registry
========================================================= */

import {
    articleRegistry
} from "../../data/articles/article-registry.js";


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
   Load Article
========================================================= */

export async function loadArticle() {

    const routeKey =
        getArticleRouteKey();


    console.log(
        "ToolZen Hub: Article route key:",
        routeKey
    );


    if (!routeKey) {

        console.error(
            "ToolZen Hub: Article route could not be determined."
        );

        return null;

    }


    const loader =
        articleRegistry[
            routeKey
        ];


    if (!loader) {

        console.error(
            `ToolZen Hub: No article registered for "${routeKey}".`
        );

        console.log(
            "ToolZen Hub: Available article routes:",
            Object.keys(
                articleRegistry
            )
        );

        return null;

    }


    try {

        console.log(
            "ToolZen Hub: Loading article:",
            routeKey
        );


        const module =
            await loader();


        const article =
            module.default ||
            module.article ||
            null;


        if (!article) {

            console.error(
                "ToolZen Hub: Article module loaded but no article data was exported.",
                routeKey
            );

            return null;

        }


        console.log(
            "ToolZen Hub: Article loaded successfully:",
            article.title
        );


        return article;

    } catch (error) {

        console.error(
            "ToolZen Hub: Failed to load article data.",
            error
        );


        return null;

    }

}
