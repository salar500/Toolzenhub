/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { currentPage } from "./router.js";
import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";
import { renderArticles } from "./components/articles.js";
import { renderFooter } from "./components/footer.js";

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

        // Articles page will be connected here

        renderFooter();

        return;
    }


    /* =====================================================
       Single Article Page
    ===================================================== */

    if (page.type === "article") {

        // Individual article will be connected here

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

    }


    /* =====================================================
       Global Footer
    ===================================================== */

    renderFooter();

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
