/* =========================================================
   ToolZen Hub
   Central Routes

   Supports:
   - GitHub Pages
   - Hostinger / Production Domain
========================================================= */


/* =========================================================
   SITE ROOT
========================================================= */

export const SITE_ROOT =
    window.location.hostname ===
    "salar500.github.io"
        ? "/Toolzenhub/"
        : "/";



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
