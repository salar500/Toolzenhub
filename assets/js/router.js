/* =========================================================
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
        path.endsWith("/index.html")
    ) {

        return {
            type: "home"
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
       ARTICLES PAGE
    ===================================================== */

    if (
        path === "/articles" ||
        path === "/articles/" ||
        path === "/Toolzenhub/articles" ||
        path === "/Toolzenhub/articles/"
    ) {

        return {
            type: "articles"
        };

    }


    /* =====================================================
       SINGLE ARTICLE PAGE
    ===================================================== */

    const articleMatch =
        path.match(
            /\/articles\/([^/]+)\/?$/
        );


    if (articleMatch) {

        return {
            type: "article",
            slug: articleMatch[1]
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
