/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */


import { currentPage }
    from "./router.js";


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


import { initializeNewsletter }
    from "./components/newsletter.js";


import { renderCalculator }
    from "./pages/calculator.js";


import { renderArticlesPage }
    from "./pages/articles/articles.js";


import { renderAboutPage }
    from "./pages/about/about.js";


import { renderContactPage }
    from "./pages/contact.js";


import {
    renderCategoriesPage,
    initializeSearch
} from "./pages/categories.js";



/* =========================================================
   APPLICATION
========================================================= */

async function initializeApp() {


    const page =
        currentPage();



    /* =====================================================
       GLOBAL HEADER
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


        initializeNewsletter();


        return;

    }



    /* =====================================================
       CATEGORIES PAGE
    ===================================================== */

    if (page.type === "categories") {


        renderCategoriesPage();


        initializeSearch();


        renderFooter();


        initializeNewsletter();


        return;

    }



    /* =====================================================
       ARTICLES PAGE
    ===================================================== */

    if (page.type === "articles") {


        renderArticlesPage();


        renderFooter();


        initializeNewsletter();


        return;

    }



    /* =====================================================
       ABOUT PAGE
    ===================================================== */

    if (page.type === "about") {


        renderAboutPage();


        renderFooter();


        initializeNewsletter();


        return;

    }



    /* =====================================================
       CONTACT PAGE
    ===================================================== */

    if (page.type === "contact") {


        renderContactPage();


        renderFooter();


        initializeNewsletter();


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


        initializeNewsletter();


        return;

    }



    /* =====================================================
       OTHER PAGE
    ===================================================== */

    renderFooter();


    initializeNewsletter();

}



/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
