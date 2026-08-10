/* =========================================================
   ToolZen Hub
   All Categories Page
========================================================= */

import { categories } from "../data/categories.js";

import { renderHeader } from "../components/header.js";

import { renderFooter } from "../components/footer.js";


/* =========================================================
   Render Category Cards
========================================================= */

function renderCategoriesPage() {

    const grid = document.getElementById(
        "categories-page-grid"
    );

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
   Category Search
========================================================= */

function initCategoriesSearch() {

    const form = document.getElementById(
        "categories-search-form"
    );

    const input = document.getElementById(
        "categories-search-input"
    );


    if (!form || !input) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const query = input.value
            .trim()
            .toLowerCase();


        if (!query) {
            return;
        }


        const match = categories.find(category => {

            return (

                category.title
                    .toLowerCase()
                    .includes(query)

                ||

                category.description
                    .toLowerCase()
                    .includes(query)

            );

        });


        if (match) {

            window.location.href = match.href;

        }

    });

}


/* =========================================================
   Handle Category Hash
========================================================= */

function handleCategoryHash() {

    const hash = window.location.hash;

    if (!hash) {
        return;
    }


    const target = document.querySelector(hash);

    if (!target) {
        return;
    }


    requestAnimationFrame(() => {

        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        target.classList.add(
            "category-page-card--active"
        );


        window.setTimeout(() => {

            target.classList.remove(
                "category-page-card--active"
            );

        }, 1400);

    });

}


/* =========================================================
   Initialize Page
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Render global components first.
         * This is what was missing from the
         * standalone categories page.
         */

        renderHeader();

        renderFooter();


        /*
         * Then render page content.
         */

        renderCategoriesPage();

        initCategoriesSearch();

        handleCategoryHash();

    }
);
