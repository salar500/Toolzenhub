/* =========================================================
   ToolZen Hub
   Individual Article Page Engine

   Purpose:
   Main entry point for the shared article page system.

   Handles:
   - Article loading
   - Article rendering
   - SEO initialization
   - Global Header
   - Global Footer
   - Newsletter
========================================================= */


/* =========================================================
   Global Components
========================================================= */

import {
    renderHeader
} from "../components/header.js";


import {
    renderFooter
} from "../components/footer.js";


import {
    initializeNewsletter
} from "../components/newsletter.js";


/* =========================================================
   Article Loader
========================================================= */

import {
    loadArticle
} from "./article/article-loader.js";


/* =========================================================
   Article Renderer
========================================================= */

import {
    renderArticle,
    initializeBreadcrumb
} from "./article/article-render.js";


/* =========================================================
   Article SEO
========================================================= */

import {
    initializeArticleSEO
} from "./article/article-seo.js";



/* =========================================================
   Initialize Article Page
========================================================= */

export function initializeArticlePage(
    article
) {

    if (!article) {

        console.error(
            "ToolZen Hub: Article data was not provided."
        );

        return;

    }


    /* =====================================================
       GLOBAL HEADER
    ===================================================== */

    renderHeader();


    /* =====================================================
       ARTICLE
    ===================================================== */

    renderArticle(
        article
    );


    /* =====================================================
       BREADCRUMB
    ===================================================== */

    initializeBreadcrumb(
        article
    );


    /* =====================================================
       SEO
    ===================================================== */

    initializeArticleSEO(
        article
    );


    /* =====================================================
       GLOBAL FOOTER
    ===================================================== */

    renderFooter();


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    initializeNewsletter();

}



/* =========================================================
   INITIALIZE ARTICLE FROM URL
========================================================= */

export async function initializeArticlePageFromURL() {

    const article =
        await loadArticle();


    if (!article) {

        console.error(
            "ToolZen Hub: Article could not be loaded."
        );

        return;

    }


    initializeArticlePage(
        article
    );

}



/* =========================================================
   STANDALONE DOM READY
=========================================================

   This allows article.js to work independently if needed.

========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeArticlePageFromURL();

        }
    );

}



/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    initializeArticlePage,

    initializeArticlePageFromURL

};
