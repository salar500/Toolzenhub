/* =========================================================
   ToolZen Hub
   Router
========================================================= */

export function currentPage() {

    const path = window.location.pathname;


    /* =====================================================
       HOME
    ===================================================== */

    if (
        path === "/" ||
        path.endsWith("/index.html") ||
        path.endsWith("/")
    ) {

        return {
            type: "home"
        };

    }


    /* =====================================================
       CALCULATOR
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
