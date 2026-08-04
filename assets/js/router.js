// assets/js/core/router.js

export function currentPage() {

    const path = window.location.pathname;

    if (path === "/") {

        return "home";

    }

    return path;

}
