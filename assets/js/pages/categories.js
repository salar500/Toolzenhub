/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { categories } from "../data/categories.js";


/* =========================================================
   Render Categories
========================================================= */

function renderCategoriesPage() {

    const grid = document.getElementById("categories-page-grid");

    if (!grid) {
        return;
    }


    grid.innerHTML = categories.map(category => `

        <a
            id="${category.id}"
            href="${category.href}"
            class="category-page-card"
        >

            <div
                class="category-page-card__icon category-page-card__icon--${category.iconClass}"
                aria-hidden="true"
            >
                ${category.icon}
            </div>


            <div class="category-page-card__content">

                <h2 class="category-page-card__title">
                    ${category.title}
                </h2>


                <p class="category-page-card__description">
                    ${category.description}
                </p>

            </div>


            <span
                class="category-page-card__arrow"
                aria-hidden="true"
            >
                →
            </span>

        </a>

    `).join("");

}


/* =========================================================
   Search
========================================================= */

function initCategoriesSearch() {

    const form =
        document.getElementById("categories-search-form");

    const input =
        document.getElementById("categories-search-input");


    if (!form || !input) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const query =
            input.value.trim().toLowerCase();


        if (!query) {
            return;
        }


        const match = categories.find(category => {

            const title =
                category.title.toLowerCase();

            const description =
                category.description.toLowerCase();

            return (
                title.includes(query) ||
                description.includes(query)
            );

        });


        if (match) {

            window.location.href = match.href;

            return;
        }


        /*
         * If no category matches, send the user
         * to the categories page instead of doing
         * nothing silently.
         */

        input.focus();

    });

}


/* =========================================================
   Category Hash Navigation
========================================================= */

function handleCategoryHash() {

    const hash =
        window.location.hash.replace("#", "");


    if (!hash) {
        return;
    }


    const target =
        document.getElementById(hash);


    if (!target) {
        return;
    }


    setTimeout(() => {

        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 100);

}


/* =========================================================
   Initialize Page
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Global components
         */

        renderHeader();

        renderFooter();


        /*
         * Page content
         */

        renderCategoriesPage();

        initCategoriesSearch();


        /*
         * Handle links such as:
         * categories.html#loans
         */

        handleCategoryHash();

    }
);
