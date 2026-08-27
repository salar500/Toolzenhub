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


/* =========================================================
   SEARCH UTILITIES
========================================================= */

import {
    searchCalculators,
    renderCalculatorSearchResults
} from "./utils/categories-search.js";

import {
    searchArticles,
    renderArticleSearchResults
} from "./utils/articles-search.js";


/* =========================================================
   CALCULATOR SEARCH INITIALIZATION
   Used by:
   - Home Hero
   - Categories Page
========================================================= */

function initializeCalculatorSearch() {

    const searchForms =
        document.querySelectorAll(
            "#calculator-search, #categories-calculator-search"
        );


    if (!searchForms.length) {
        return;
    }


    searchForms.forEach(
        (form) => {

            const input =
                form.querySelector(
                    'input[name="q"]'
                );


            if (!input) {
                return;
            }


            /*
               Results container is selected according
               to the search form being used.
            */

            let resultsContainer = null;


            if (
                form.id ===
                "calculator-search"
            ) {

                resultsContainer =
                    document.getElementById(
                        "hero-calculator-search-results"
                    );

            }


            if (
                form.id ===
                "categories-calculator-search"
            ) {

                resultsContainer =
                    document.getElementById(
                        "categories-calculator-search-results"
                    );

            }


            /* =============================================
               LIVE SEARCH
            ============================================= */

            input.addEventListener(
                "input",
                () => {

                    const query =
                        input.value.trim();


                    if (!query) {

                        if (resultsContainer) {

                            resultsContainer.innerHTML =
                                "";

                        }

                        return;
                    }


                    const results =
                        searchCalculators(
                            query
                        );


                    renderCalculatorSearchResults(
                        results,
                        resultsContainer
                    );

                }
            );


            /* =============================================
               FORM SUBMIT
            ============================================= */

            form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();


                    const query =
                        input.value.trim();


                    if (!query) {

                        input.focus();

                        return;
                    }


                    const results =
                        searchCalculators(
                            query
                        );


                    renderCalculatorSearchResults(
                        results,
                        resultsContainer
                    );

                }
            );

        }
    );

}


/* =========================================================
   ARTICLE SEARCH INITIALIZATION
   Used only by Articles Page
========================================================= */

function initializeArticleSearch() {

    const form =
        document.getElementById(
            "article-search"
        );


    if (!form) {
        return;
    }


    const input =
        form.querySelector(
            'input[name="q"]'
        );


    const resultsContainer =
        document.getElementById(
            "article-search-results"
        );


    if (
        !input ||
        !resultsContainer
    ) {
        return;
    }


    /* =============================================
       LIVE SEARCH
    ============================================= */

    input.addEventListener(
        "input",
        () => {

            const query =
                input.value.trim();


            if (!query) {

                resultsContainer.innerHTML =
                    "";

                return;
            }


            const results =
                searchArticles(
                    query
                );


            renderArticleSearchResults(
                results,
                resultsContainer
            );

        }
    );


    /* =============================================
       FORM SUBMIT
    ============================================= */

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const query =
                input.value.trim();


            if (!query) {

                input.focus();

                return;
            }


            const results =
                searchArticles(
                    query
                );


            renderArticleSearchResults(
                results,
                resultsContainer
            );

        }
    );

}


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

        initializeCalculatorSearch();

        initializeNewsletter();

        return;
    }


    /* =====================================================
       ARTICLES PAGE
    ===================================================== */

    if (page.type === "articles") {

        renderArticlesPage();

        renderFooter();

        initializeArticleSearch();

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

    /*
       Calculator search is also initialized here
       if the current page contains the calculator
       search form.

       This allows the Categories page to work even
       if its router type is handled elsewhere.
    */

    initializeCalculatorSearch();

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
