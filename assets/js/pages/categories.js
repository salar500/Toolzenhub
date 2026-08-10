/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import { categories as categoryData } from "../data/categories.js";


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderCategoriesPage();

});


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
            href="${category.href}"
            class="category-page-card"
        >

            <div
                class="category-page-card__icon category-page-card__icon--${category.iconClass}"
            >
                ${category.icon}
            </div>


            <div class="category-page-card__content">

                <h3 class="category-page-card__title">
                    ${category.title}
                </h3>

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
