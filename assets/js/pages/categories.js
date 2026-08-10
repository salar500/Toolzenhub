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
        name: "Loans",
        description: "EMI, Home Loan, Personal Loan and more",
        icon: "🏠",
        className: "loans",
        href: "loans.html"
    },

    {
        name: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        icon: "📈",
        className: "investment",
        href: "investment.html"
    },

    {
        name: "Tax",
        description: "Income Tax, GST, TDS and more",
        icon: "🧾",
        className: "tax",
        href: "tax.html"
    },

    {
        name: "Health",
        description: "BMI, Calorie, BMR and more",
        icon: "♥",
        className: "health",
        href: "health.html"
    },

    {
        name: "Business",
        description: "Profit, Margin, ROI and more",
        icon: "💼",
        className: "business",
        href: "business.html"
    },

    {
        name: "Math",
        description: "Percentage, Ratio, Age and more",
        icon: "🔢",
        className: "math",
        href: "math.html"
    },

    {
        name: "Converter",
        description: "Unit, Currency, Date and more",
        icon: "↻",
        className: "converter",
        href: "converter.html"
    },

    {
        name: "More",
        description: "Explore all calculators and tools",
        icon: "▦",
        className: "more",
        href: "categories.html"
    }

];


/* =========================================================
   Render Categories
========================================================= */

function renderCategories() {

    const grid = document.getElementById("categories-grid");

    if (!grid) {
        console.error("categories-grid not found");
        return;
    }

    grid.innerHTML = categories.map(category => `

        <a
            href="${category.href}"
            class="category-page-card"
        >

            <span
                class="category-page-card__icon
                       category-page-card__icon--${category.className}"
            >
                ${category.icon}
            </span>

            <span class="category-page-card__content">

                <span class="category-page-card__title">
                    ${category.name}
                </span>

                <span class="category-page-card__description">
                    ${category.description}
                </span>

            </span>

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

function setupSearch() {

    const form =
        document.getElementById("categories-search-form");

    const input =
        document.getElementById("categories-search-input");

    if (!form || !input) {
        console.error("Categories search elements not found");
        return;
    }

    form.addEventListener("submit", event => {

        event.preventDefault();

        const query = input.value.trim();

        if (!query) {
            return;
        }

        window.location.href =
            `search.html?q=${encodeURIComponent(query)}`;

    });
}


/* =========================================================
   Initialize Page
========================================================= */

function initCategoriesPage() {

    console.log("Categories page JS loaded");

    renderHeader();
    renderFooter();

    renderCategories();
    setupSearch();
}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initCategoriesPage
    );

} else {

    initCategoriesPage();

}
