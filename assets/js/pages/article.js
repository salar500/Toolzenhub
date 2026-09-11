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

   Architecture:

   Article URL
        ↓
   Article Loader
        ↓
   Article Data Module
        ↓
   Article Renderer
        ↓
   Article SEO
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
       Global Header
    ===================================================== */

    renderHeader();


    /* =====================================================
       Article
    ===================================================== */

    renderArticle(
        article
    );


    /* =====================================================
       Breadcrumb
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
       Global Footer
    ===================================================== */

    renderFooter();


    /* =====================================================
       Newsletter
    ===================================================== */

    initializeNewsletter();

}



/* =========================================================
   Initialize From URL
========================================================= */

async function initializeFromURL() {

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
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeFromURL
);



/* =========================================================
   Default Export
========================================================= */

export default {

    initializeArticlePage

};
