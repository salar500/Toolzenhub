/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";


/* =========================================================
   Category Data
========================================================= */

const categories = [

    {
        id: "loans",
        icon: "🏠",
        iconClass: "loans",
        title: "Loans",
        description: "EMI, Home Loan, Personal Loan and more"
    },

    {
        id: "investment",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more"
    },

    {
        id: "tax",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Income Tax, GST, TDS and more"
    },

    {
        id: "health",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more"
    },

    {
        id: "business",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more"
    },

    {
        id: "math",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more"
    },

    {
        id: "converter",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more"
    },

    {
        id: "more",
        icon: "▦",
        iconClass: "more",
        title: "More",
        description: "Explore all calculators and tools"
    }

];


/* =========================================================
   Render Category Cards
========================================================= */

function renderCategoriesPage() {

    const grid = document.getElementById(
        "categories-grid"
    );

    if (!grid) {
        return;
    }


    grid.innerHTML = categories.map(category => `

        <a
            href="categories.html#${category.id}"
            class="category-page-card"
        >

            <div
                class="
                    category-page-card__icon
                    category-page-card__icon--${category.iconClass}
                "
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

function initializeSearch() {

    const form = document.getElementById(
        "categories-search-form"
    );

    const input = document.getElementById(
        "categories-search-input"
    );


    if (!form || !input) {
        return;
    }


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const query = input.value.trim();


        if (!query) {
            input.focus();
            return;
        }


        window.location.href =
            `search.html?q=${encodeURIComponent(query)}`;

    });

}


/* =========================================================
   Application
========================================================= */

function initializeCategoriesPage() {

    renderHeader();

    renderCategoriesPage();

    initializeSearch();

    renderFooter();

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeCategoriesPage
);
