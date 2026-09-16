/* =========================================================
   ToolZen Hub
   Individual Article Page Engine

   Purpose:
   Main entry point for the shared article page system.

   Handles:
   - Article loading
   - Article rendering
   - SEO
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
    renderArticle
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
   Initialize Article From URL
========================================================= */

export async function initializeArticlePageFromURL() {

    console.log(
        "ToolZen Hub: initializeArticlePageFromURL()"
    );


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
   DEFAULT EXPORT
========================================================= */

export default {

    initializeArticlePage,

    initializeArticlePageFromURL

};
