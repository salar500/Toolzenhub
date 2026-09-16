/* ========================================================
   ToolZen Hub
   Router
========================================================= */

export function currentPage() {

    const path =
        window.location.pathname;


    /* =====================================================
       HOME PAGE
    ===================================================== */

    if (
        path === "/" ||
        path === "/Toolzenhub/" ||
        path === "/Toolzenhub" ||
        path === "/Toolzenhub/index.html"
    ) {

        return {
            type: "home"
        };

    }


    /* =====================================================
       CATEGORIES PAGE
    ===================================================== */

    if (
        path === "/categories.html" ||
        path.endsWith("/categories.html") ||
        path === "/categories/" ||
        path.endsWith("/categories/")
    ) {

        return {
            type: "categories"
        };

    }


    /* =====================================================
       ARTICLES PAGE
    ===================================================== */

    if (
        path === "/articles.html" ||
        path.endsWith("/articles.html") ||
        path === "/articles/" ||
        path.endsWith("/articles/")
    ) {

        return {
            type: "articles"
        };

    }


    /* =====================================================
       ABOUT PAGE
    ===================================================== */

    if (
        path === "/about.html" ||
        path.endsWith("/about.html") ||
        path === "/about/" ||
        path.endsWith("/about/")
    ) {

        return {
            type: "about"
        };

    }


    /* =====================================================
       CONTACT PAGE
    ===================================================== */

    if (
        path === "/contact.html" ||
        path.endsWith("/contact.html") ||
        path === "/contact/" ||
        path.endsWith("/contact/")
    ) {

        return {
            type: "contact"
        };

    }


    /* =====================================================
       TERMS PAGE
    ===================================================== */

    if (
        path === "/terms.html" ||
        path.endsWith("/terms.html") ||
        path === "/terms/" ||
        path.endsWith("/terms/")
    ) {

        return {
            type: "terms"
        };

    }


    /* =====================================================
       DISCLAIMER PAGE
    ===================================================== */

    if (
        path === "/disclaimer.html" ||
        path.endsWith("/disclaimer.html") ||
        path === "/disclaimer/" ||
        path.endsWith("/disclaimer/")
    ) {

        return {
            type: "disclaimer"
        };

    }


    /* =====================================================
       PRIVACY PAGE
    ===================================================== */

    if (
        path === "/privacy.html" ||
        path.endsWith("/privacy.html") ||
        path === "/privacy/" ||
        path.endsWith("/privacy/")
    ) {

        return {
            type: "privacy"
        };

    }


    /* =====================================================
       INDIVIDUAL ARTICLE PAGE
       
       Expected:
       /articles/{topic}/{slug}/

       Example:
       /articles/loan-comparison/
       how-to-reduce-home-loan-interest/
    ===================================================== */

    const articleMatch =
        path.match(
            /\/articles\/([^/]+)\/([^/]+)\/?$/
        );


    if (articleMatch) {

        return {

            type: "article",

            topic:
                articleMatch[1],

            slug:
                articleMatch[2]

        };

    }


    /* =====================================================
       CALCULATOR PAGE
    ===================================================== */

    const calculatorMatch =
        path.match(
            /\/calculators\/([^/]+)\/?$/
        );


    if (calculatorMatch) {

        return {
            type: "calculator",
            slug: calculatorMatch[1]
        };

    }


    /* =====================================================
       OTHER PAGE
    ===================================================== */

    return {
        type: "page",
        path
    };

}
