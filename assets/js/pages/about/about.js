/* =========================================================
   ToolZen Hub
   About Page
========================================================= */

import { renderAboutTemplate } from "./about-template.js";


/* =========================================================
   RENDER ABOUT PAGE
========================================================= */

export function renderAboutPage() {

    const app = document.getElementById("app");

    if (!app) {
        return;
    }


    app.innerHTML = renderAboutTemplate();

}


/* =========================================================
   AUTO INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const app = document.getElementById("app");

        if (!app) {
            return;
        }


        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (currentPage === "about.html") {

            renderAboutPage();

        }

    }
);
