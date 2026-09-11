/* =========================================================
   ToolZen Hub
   Article Loader

   Purpose:
   Loads the correct article data module based on
   the current article URL.
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


    /*
       Expected URL:

       /Toolzenhub/articles/
       loan-comparison/
       how-to-reduce-home-loan-interest/

       We remove:
       - site root
       - articles/
       - trailing slash
    */


    const marker =
        "/articles/";


    const markerIndex =
        pathname.indexOf(marker);


    if (markerIndex === -1) {

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


    if (!routeKey) {

        console.error(
            "ToolZen Hub: Article route could not be determined."
        );

        return null;

    }


    const loader =
        articleRegistry[routeKey];


    if (!loader) {

        console.error(
            `ToolZen Hub: No article registered for "${routeKey}".`
        );

        return null;

    }


    try {

        const module =
            await loader();


        return (
            module.default ||
            module.article ||
            null
        );

    } catch (error) {

        console.error(
            "ToolZen Hub: Failed to load article data.",
            error
        );


        return null;

    }

}
