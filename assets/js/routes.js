/* =========================================================
   ToolZen Hub
   Central Routes

   Supports:
   - GitHub Pages
   - Hostinger / Production Domain
========================================================= */


import {
    resolveSiteRoot
} from "./site-config.js";


/* =========================================================
   SITE ROOT
========================================================= */

function readBuiltBase() {

    /*
     * 1. The site build (Node) sets the base it is building for.
     * 2. A generated page declares it: <meta name="tz-site-base">.
     * 3. Otherwise (source files, unit tests) the host decides.
     */

    if (typeof globalThis.__TZ_SITE_BASE__ === "string") {
        return globalThis.__TZ_SITE_BASE__;
    }

    if (typeof document !== "undefined") {

        const base =
            document
                .querySelector('meta[name="tz-site-base"]')
                ?.getAttribute("content");

        if (base) {
            return base;
        }

    }

    return null;

}


export const SITE_ROOT =
    readBuiltBase() ??
    resolveSiteRoot(
        window.location.hostname
    );



/* =========================================================
   ROUTES
========================================================= */

export const ROUTES = {


    /* =====================================================
       HOME
    ===================================================== */

    home:
        SITE_ROOT,


    /* =====================================================
       CATEGORIES
    ===================================================== */

    categories:
        `${SITE_ROOT}categories.html`,


    /* =====================================================
       CALCULATOR CATEGORIES
    ===================================================== */

    calculatorCategories:
        `${SITE_ROOT}categories.html`,


    /* =====================================================
       LOANS
    ===================================================== */

    loans:
        `${SITE_ROOT}loans.html`,


    /* =====================================================
       ARTICLES
    ===================================================== */

    articles:
        `${SITE_ROOT}articles.html`,


    /* =====================================================
       ARTICLE CATEGORY
    ===================================================== */

    articleCategory(
        category
    ) {

        return (
            `${SITE_ROOT}articles.html` +
            `?category=${encodeURIComponent(category)}`
        );

    },


    /* =====================================================
       INDIVIDUAL ARTICLE
    ===================================================== */

    article(
        topic,
        slug
    ) {

        return (
            `${SITE_ROOT}articles/` +
            `${topic}/${slug}/`
        );

    },


    /* =====================================================
       ABOUT
    ===================================================== */

    about:
        `${SITE_ROOT}about.html`,


    /* =====================================================
       CONTACT
    ===================================================== */

    contact:
        `${SITE_ROOT}contact.html`,


    /* =====================================================
       TERMS
    ===================================================== */

    terms:
        `${SITE_ROOT}terms.html`,


    /* =====================================================
       DISCLAIMER
    ===================================================== */

    disclaimer:
        `${SITE_ROOT}disclaimer.html`,


    /* =====================================================
       PRIVACY POLICY
    ===================================================== */

    privacy:
        `${SITE_ROOT}privacy.html`,


    /* =====================================================
       ALL CALCULATORS
    ===================================================== */

    calculators:
        `${SITE_ROOT}calculators.html`,


    /* =====================================================
       INDIVIDUAL CALCULATOR
    ===================================================== */

    calculator(
        slug
    ) {

        return (
            `${SITE_ROOT}calculators/` +
            `${slug}/`
        );

    },


    /* =====================================================
       ASSET

       Resolves an asset path (for example
       "/assets/Images/articles/x.png") against the site
       root, so it also works under /Toolzenhub/ on
       GitHub Pages. Absolute http(s) URLs pass through.
    ===================================================== */

    asset(
        path
    ) {

        if (!path) {

            return "";

        }


        if (/^https?:\/\//i.test(path)) {

            return path;

        }


        return `${SITE_ROOT}${path.replace(/^\/+/, "")}`;

    }

};
