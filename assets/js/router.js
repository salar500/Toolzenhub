// assets/js/core/router.js

export function currentPage() {

    const path = window.location.pathname;

    if (path === "/") {
        return {
            type: "home"
        };
    }

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

    return {
        type: "page",
        path
    };

}
