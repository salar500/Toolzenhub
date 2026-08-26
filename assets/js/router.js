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
        path.endsWith("/index.html")
    ) {

        return {
            type: "home"
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
