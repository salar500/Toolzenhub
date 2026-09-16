/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */


/* =========================================================
   Router
========================================================= */

import {
    currentPage
} from "./router.js";


/* =========================================================
   Central Routes
========================================================= */

import {
    ROUTES
} from "./routes.js";


/* =========================================================
   Global Header
========================================================= */

import {
    renderHeader
} from "./components/header.js";


/* =========================================================
   Hero
========================================================= */

import {
    renderHero
} from "./components/hero.js";


/* =========================================================
   Home Categories
========================================================= */

import {
    renderCategories
} from "./components/categories.js";


/* =========================================================
   Home Articles
========================================================= */

import {
    renderArticles
} from "./components/articles.js";


/* =========================================================
   Global Footer
========================================================= */

import {
    renderFooter
} from "./components/footer.js";


/* =========================================================
   Newsletter
========================================================= */

import {
    initializeNewsletter
} from "./components/newsletter.js";


/* =========================================================
   Calculator
========================================================= */

import {
    renderCalculator
} from "./pages/calculator.js";


/* =========================================================
   Articles Listing Page
========================================================= */

import {
    renderArticlesPage
} from "./pages/articles/articles.js";


/* =========================================================
   Individual Article Page
========================================================= */

import {
    initializeArticlePageFromURL
} from "./pages/article.js";


/* =========================================================
   About
========================================================= */

import {
    renderAboutPage
} from "./pages/about/about.js";


/* =========================================================
   Contact
========================================================= */

import {
    renderContactPage
} from "./pages/contact.js";


/* =========================================================
   Categories Page
========================================================= */

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
       STATIC PAGE BREADCRUMB HOME
    ===================================================== */

    const breadcrumbHome =
        document.getElementById(
            "legal-breadcrumb-home"
        );


    if (breadcrumbHome) {

        breadcrumbHome.href =
            ROUTES.home;

    }



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
       STATIC LEGAL PAGES
    ===================================================== */

    if (
        page.type === "terms" ||
        page.type === "disclaimer" ||
        page.type === "privacy"
    ) {

        renderFooter();

        initializeNewsletter();

        return;

    }



    /* =====================================================
       INDIVIDUAL ARTICLE PAGE
    ===================================================== */

    if (page.type === "article") {

        await initializeArticlePageFromURL();

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
