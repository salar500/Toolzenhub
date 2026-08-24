
/* =========================================================
   ToolZen Hub
   Router
========================================================= */


/* =========================================================
   NORMALIZE PATH
========================================================= */

function normalizePath(path) {

    if (!path) {
        return "/";
    }

    // Remove query/hash if present
    path = path.split("?")[0].split("#")[0];

    // Convert multiple slashes to one
    path = path.replace(/\/+/g, "/");

    // Ensure leading slash
    if (!path.startsWith("/")) {
        path = "/" + path;
    }

    // Remove trailing slash except for root
    if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    return path;

}


/* =========================================================
   REMOVE PROJECT BASE PATH
   Example:
   /Toolzenhub/articles/
   becomes:
   /articles
========================================================= */

function getApplicationPath(path) {

    const normalizedPath =
        normalizePath(path);

    const lowerPath =
        normalizedPath.toLowerCase();


    /* -----------------------------------------------------
       GitHub Pages / Project Folder
       ----------------------------------------------------- */

    if (
        lowerPath === "/toolzenhub"
    ) {

        return "/";

    }


    if (
        lowerPath.startsWith("/toolzenhub/")
    ) {

        return normalizedPath.substring(
            "/Toolzenhub".length
        ) || "/";

    }


    return normalizedPath;

}


/* =========================================================
   CURRENT PAGE
========================================================= */

export function currentPage() {

    const rawPath =
        window.location.pathname;


    const path =
        getApplicationPath(rawPath);


    /* =====================================================
       HOME PAGE
    ===================================================== */

    if (
        path === "/" ||
        path === "/index.html"
    ) {

        return {
            type: "home",
            path: "/"
        };

    }


    /* =====================================================
       ARTICLES LIST PAGE
       
       Supported:
       /articles
       /articles/
       /Toolzenhub/articles/
    ===================================================== */

    if (
        path === "/articles" ||
        path === "/articles.html"
    ) {

        return {
            type: "articles",
            path: "/articles"
        };

    }


    /* =====================================================
       SINGLE ARTICLE PAGE
       
       Supported:
       /articles/how-emi-is-calculated
       /articles/how-emi-is-calculated/
    ===================================================== */

    const articleMatch =
        path.match(
            /^\/articles\/([^/]+)$/
        );


    if (articleMatch) {

        return {
            type: "article",
            slug: articleMatch[1],
            path
        };

    }


    /* =====================================================
       CALCULATOR PAGE
       
       Supported:
       /calculators/emi
       /calculators/emi/
       /Toolzenhub/calculators/emi/
    ===================================================== */

    const calculatorMatch =
        path.match(
            /^\/calculators\/([^/]+)$/
        );


    if (calculatorMatch) {

        return {
            type: "calculator",
            slug: calculatorMatch[1],
            path
        };

    }


    /* =====================================================
       STATIC PAGES
       
       Examples:
       /about
       /contact
       /privacy-policy
       /terms
       /disclaimer
    ===================================================== */

    const staticPageMatch =
        path.match(
            /^\/([^/]+)$/
        );


    if (staticPageMatch) {

        return {
            type: "page",
            slug: staticPageMatch[1],
            path
        };

    }


    /* =====================================================
       UNKNOWN / FALLBACK
    ===================================================== */

    return {
        type: "not-found",
        path
    };

}


/* =========================================================
   NAVIGATION HELPER
========================================================= */

export function navigateTo(path) {

    window.location.href = path;

}


/* =========================================================
   GET CURRENT PATH
========================================================= */

export function getCurrentPath() {

    return getApplicationPath(
        window.location.pathname
    );

}
