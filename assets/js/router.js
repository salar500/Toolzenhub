/* =========================================================
   ToolZen Hub
   Router
========================================================= */

export function currentPage() {

    const path =
        window.location.pathname
            .replace(/\/+$/, "");


    /* =====================================================
       HOME PAGE
    ===================================================== */

    if (
        path === "" ||
        path === "/index.html" ||
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
            /\/calculators\/([^/]+)$/
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
