/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import { categories } from "../data/categories.js";


/* =========================================================
   DOM
========================================================= */

const grid = document.getElementById("categories-page-grid");
const form = document.getElementById("categories-search-form");
const input = document.getElementById("categories-search-input");
const noResults = document.getElementById("categories-no-results");


/* =========================================================
   Render Categories
========================================================= */

function renderCategories(list = categories) {

    if (!grid) {
        return;
    }


    grid.innerHTML = list.map(category => `

        <a
            id="category-${category.id}"
            href="${category.href}"
            class="category-page-card"
            data-category="${category.id}"
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


    if (noResults) {
        noResults.hidden = list.length !== 0;
    }

}


/* =========================================================
   Search Categories
========================================================= */

function searchCategories(query) {

    const normalizedQuery = query
        .trim()
        .toLowerCase();


    if (!normalizedQuery) {

        renderCategories(categories);

        return;

    }


    const matches = categories.filter(category => {

        const title =
            category.title.toLowerCase();

        const description =
            category.description.toLowerCase();

        const id =
            category.id.toLowerCase();


        return (
            title.includes(normalizedQuery) ||
            description.includes(normalizedQuery) ||
            id.includes(normalizedQuery)
        );

    });


    renderCategories(matches);

}


/* =========================================================
   Search Submit
========================================================= */

function initSearch() {

    if (!form || !input) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const query = input.value.trim();

        if (!query) {

            renderCategories(categories);

            return;

        }


        const normalizedQuery =
            query.toLowerCase();


        /*
         * If the user enters an exact category name,
         * go directly to that category page.
         */

        const exactMatch =
            categories.find(category =>
                category.title.toLowerCase() === normalizedQuery ||
                category.id.toLowerCase() === normalizedQuery
            );


        if (exactMatch) {

            window.location.href =
                exactMatch.href;

            return;

        }


        /*
         * Otherwise filter the category cards.
         */

        searchCategories(query);

    });


    /*
     * Live search
     */

    input.addEventListener("input", function () {

        searchCategories(input.value);

    });

}


/* =========================================================
   Init
========================================================= */

function initCategoriesPage() {

    renderCategories();

    initSearch();

}


/* =========================================================
   DOM Ready
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initCategoriesPage
    );

} else {

    initCategoriesPage();

}
