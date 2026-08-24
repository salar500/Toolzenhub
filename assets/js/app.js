/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { currentPage } from "./router.js";

import { renderHeader }
    from "./components/header.js";

import { renderHero }
    from "./components/hero.js";

import { renderCategories }
    from "./components/categories.js";

import { renderArticles }
    from "./components/articles.js";

import { renderFooter }
    from "./components/footer.js";

import { renderCalculator }
    from "./pages/calculator.js";


/* =========================================================
   Application
========================================================= */

async function initializeApp() {

    const page = currentPage();


    /* =====================================================
       Global Header
    ===================================================== */

    renderHeader();


    /* =====================================================
       HOME PAGE
    ===================================================== */

    if (page.type === "home") {

        renderHero();

        renderCategories();

        renderArticles();

        renderFooter();

        return;
    }


    /* =====================================================
       ARTICLES PAGE
    ===================================================== */

    if (page.type === "articles") {

        /*
         * articles.html already contains the complete
         * article page HTML.
         *
         * We only render the global header and footer.
         */

        renderFooter();

        return;
    }


    /* =====================================================
       CALCULATOR PAGE
    ===================================================== */

    if (page.type === "calculator") {

        await renderCalculator(
            page.slug
        );

        renderFooter();

        return;
    }


    /* =====================================================
       OTHER PAGE
    ===================================================== */

    renderFooter();

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
