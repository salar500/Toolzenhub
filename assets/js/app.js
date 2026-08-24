/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { currentPage } from "./router.js";

import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";
import { renderArticles } from "./components/articles.js";
import { renderFooter } from "./components/footer.js";

import { renderCalculator }
    from "./pages/calculator.js";

import { renderArticlesPage }
    from "./pages/articles.js";


/* =========================================================
   Application
========================================================= */

async function initializeApp() {

    const page = currentPage();


    /* =====================================================
       Global Header
    ===================================================== */

    renderHeader();


    /* =====================================================
       Calculator Page
    ===================================================== */

    if (page.type === "calculator") {

        await renderCalculator(
            page.slug
        );

        renderFooter();

        return;
    }


    /* =====================================================
       Articles Page
    ===================================================== */

    if (page.type === "articles") {

        renderArticlesPage();

        renderFooter();

        return;
    }


    /* =====================================================
       Home Page
    ===================================================== */

    if (page.type === "home") {

        renderHero();

        renderCategories();

        renderArticles();

        renderFooter();

        return;
    }


    /* =====================================================
       Fallback
    ===================================================== */

    const app =
        document.getElementById("app");

    if (app) {

        app.innerHTML = `
            <section style="
                width:min(1180px,calc(100% - 32px));
                margin:0 auto;
                padding:80px 0;
                text-align:center;
            ">

                <h1 style="
                    margin:0 0 10px;
                    color:#0f172a;
                    font-size:32px;
                ">
                    Page Not Found
                </h1>

                <p style="
                    margin:0 0 25px;
                    color:#64748b;
                ">
                    The page you are looking for does not exist.
                </p>

                <a
                    href="/Toolzenhub/"
                    style="
                        display:inline-block;
                        padding:11px 18px;
                        border-radius:8px;
                        background:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        font-weight:700;
                        font-size:14px;
                    "
                >
                    Go Home
                </a>

            </section>
        `;

    }

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
