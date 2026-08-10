/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";


/* =========================================================
   Categories Data
========================================================= */

const categories = [

    {
        id: "loans",
        title: "Loans",
        description: "EMI, Home Loan, Personal Loan and more",
        icon: "🏠",
        className: "loans"
    },

    {
        id: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        icon: "📈",
        className: "investment"
    },

    {
        id: "tax",
        title: "Tax",
        description: "Income Tax, GST, TDS and more",
        icon: "🧾",
        className: "tax"
    },

    {
        id: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more",
        icon: "♥",
        className: "health"
    },

    {
        id: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more",
        icon: "💼",
        className: "business"
    },

    {
        id: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more",
        icon: "🔢",
        className: "math"
    },

    {
        id: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more",
        icon: "↻",
        className: "converter"
    },

    {
        id: "more",
        title: "More",
        description: "Explore all calculators and tools",
        icon: "▦",
        className: "more"
    }

];


/* =========================================================
   Render Categories
========================================================= */

function renderCategoriesPage() {

    const grid =
        document.getElementById("categories-grid");


    if (!grid) {
        console.error(
            "ToolZen Hub: #categories-grid not found."
        );

        return;
    }


    grid.innerHTML = categories.map(category => `

        <a
            href="#${category.id}"
            class="category-page-card"
            id="${category.id}"
        >

            <div
                class="
                    category-page-card__icon
                    category-page-card__icon--${category.className}
                "
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

    const form =
        document.getElementById(
            "categories-search-form"
        );


    const input =
        document.getElementById(
            "categories-search-input"
        );


    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            console.log(
                "Searching calculators:",
                query
            );

        }
    );

}


/* =========================================================
   Initialize Page
========================================================= */

function initializeCategoriesPage() {

    renderHeader();

    renderCategoriesPage();

    renderFooter();

    initializeSearch();

}


/* =========================================================
   Start
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCategoriesPage
    );

} else {

    initializeCategoriesPage();

}
