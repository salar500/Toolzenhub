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

import { renderArticlesPage }
    from "./pages/articles.js";


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
       Calculator Page
    ===================================================== */

    if (page.type === "calculator") {

        await renderCalculator(
            page.slug
        );

        renderFooter();

        return;
    }


    /* =====================================================
       Articles Page
    ===================================================== */

    if (page.type === "articles") {

        renderArticlesPage();

        renderFooter();

        return;
    }


    /* =====================================================
       Home Page
    ===================================================== */

    if (page.type === "home") {

        renderHero();

        renderCategories();

        renderArticles();

        renderFooter();

        return;
    }


    /* =====================================================
       Fallback
    ===================================================== */

    renderHero();

    renderCategories();

    renderArticles();

    renderFooter();

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
