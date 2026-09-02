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
