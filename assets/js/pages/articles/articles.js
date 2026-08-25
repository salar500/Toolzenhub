/* =========================================================
   ToolZen Hub
   Articles Page
   Main Entry
========================================================= */


/* =========================================================
   TEMPLATE
========================================================= */

import {
    renderArticlesTemplate
} from "./articles-template.js";


/* =========================================================
   STATE
========================================================= */

import {
    articlesState
} from "./articles-state.js";


/* =========================================================
   ARTICLE RENDERING
========================================================= */

import {
    renderArticleCards
} from "./articles-render.js";


/* =========================================================
   FILTERS & SEARCH
========================================================= */

import {
    initializeArticleFilters,
    initializeArticleSearch
} from "./articles-filters.js";


/* =========================================================
   PAGINATION
========================================================= */

import {
    initializePagination
} from "./articles-pagination.js";


/* =========================================================
   SIDEBAR
========================================================= */

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


    /* =====================================================
       RESET PAGE STATE
    ===================================================== */

    articlesState.selectedCategory =
        "All";


    articlesState.currentPage =
        1;


    articlesState.searchTerm =
        "";


    articlesState.categoriesExpanded =
        false;


    /* =====================================================
       RENDER PAGE HTML
    ===================================================== */

    app.innerHTML =
        renderArticlesTemplate();


    /* =====================================================
       INITIALIZE PAGE
    ===================================================== */

    initializeArticlesPage();

}


/* =========================================================
   INITIALIZE ARTICLES PAGE
========================================================= */

function initializeArticlesPage() {

    /* =====================================================
       ARTICLE CARDS
    ===================================================== */

    renderArticleCards();


    /* =====================================================
       FILTERS
    ===================================================== */

    initializeArticleFilters();


    /* =====================================================
       SEARCH
    ===================================================== */

    initializeArticleSearch();


    /* =====================================================
       PAGINATION
    ===================================================== */

    initializePagination();


    /* =====================================================
       SIDEBAR CATEGORIES
    ===================================================== */

    initializeSidebarCategories();


    /* =====================================================
       MORE CATEGORIES
    ===================================================== */

    initializeMoreCategories();


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    initializeNewsletter();


    /* =====================================================
       ARTICLE LINKS
    ===================================================== */

    initializeArticleLinks();

}
