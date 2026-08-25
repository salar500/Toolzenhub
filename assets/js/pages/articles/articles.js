
/* =========================================================
   ToolZen Hub
   Articles Page
   Main Entry
========================================================= */

import {
    renderArticlesTemplate
} from "./articles-template.js";


import {
    articlesState
} from "./articles-state.js";


import {
    renderArticleCards
} from "./articles-render.js";


import {
    initializeArticleFilters,
    initializeArticleSearch
} from "./articles-filters.js";


import {
    initializePagination
} from "./articles-pagination.js";


import {
    initializeSidebarCategories,
    initializeMoreCategories,
    initializeNewsletter,
    initializeArticleLinks
} from "./articles-sidebar.js";


/* =========================================================
   RENDER ARTICLES PAGE
========================================================= */

export function renderArticlesPage() {

    const app =
        document.getElementById("app");


    if (!app) {
        return;
    }


    /*
     * Reset page state
     */

    articlesState.selectedCategory =
        "All";


    articlesState.currentPage =
        1;


    articlesState.searchTerm =
        "";


    articlesState.categoriesExpanded =
        false;


    /*
     * Render page HTML
     */

    app.innerHTML =
        renderArticlesTemplate();


    /*
     * Initialize components
     */

    initializeArticlesPage();

}


/* =========================================================
   INITIALIZE ARTICLES PAGE
========================================================= */

function initializeArticlesPage() {

    renderArticleCards();


    initializeArticleFilters();


    initializeArticleSearch();


    initializePagination();


    initializeSidebarCategories();


    initializeMoreCategories();


    initializeNewsletter();


    initializeArticleLinks();

}


/* =========================================================
   AUTO INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const articlesPage =
            document.getElementById(
                "articles-page"
            );


        const app =
            document.getElementById(
                "app"
            );


        /*
         * If Articles page already exists,
         * don't render it again.
         */

        if (articlesPage) {
            return;
        }


        /*
         * Automatically render Articles page
         * when URL contains "articles".
         */

        if (
            app &&
            window.location.pathname
                .toLowerCase()
                .includes("articles")
        ) {

            renderArticlesPage();

        }

    }
);
