
/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import {
    searchCalculators
} from "../utils/categories-search.js";


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
   RENDER CATEGORY CARDS
========================================================= */

export function renderCategoriesPage() {

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
   RENDER CALCULATOR SEARCH RESULTS
========================================================= */

function renderCalculatorResults(query) {

    const grid = document.getElementById(
        "categories-grid"
    );

    if (!grid) {
        return;
    }


    const results =
        searchCalculators(query);


    /* =====================================================
       Empty Search
    ===================================================== */

    if (!query) {

        renderCategoriesPage();

        return;
    }


    /* =====================================================
       No Results
    ===================================================== */

    if (!results.length) {

        grid.innerHTML = `

            <div class="category-page-card">

                <div
                    class="category-page-card__icon"
                    aria-hidden="true"
                >
                    🔎
                </div>


                <div class="category-page-card__content">

                    <h2 class="category-page-card__title">
                        No calculators found
                    </h2>

                    <p class="category-page-card__description">
                        No calculators matched "${escapeHtml(query)}".
                        Try another search.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    /* =====================================================
       Results
    ===================================================== */

    grid.innerHTML = results.map(calculator => `

        <a
            href="${calculator.url}"
            class="category-page-card"
        >

            <div
                class="
                    category-page-card__icon
                    category-page-card__icon--${getCategoryIconClass(
                        calculator.category
                    )}
                "
                aria-hidden="true"
            >
                ${getCategoryIcon(calculator.category)}
            </div>


            <div class="category-page-card__content">

                <span
                    style="
                        display:block;
                        margin-bottom:4px;
                        color:#0b9f58;
                        font-size:10px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.4px;
                    "
                >
                    ${escapeHtml(calculator.category)}
                </span>


                <h2 class="category-page-card__title">
                    ${escapeHtml(calculator.title)}
                </h2>


                <p class="category-page-card__description">
                    ${escapeHtml(calculator.description)}
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
   CATEGORY ICON
========================================================= */

function getCategoryIcon(category) {

    const icons = {

        Loans: "🏠",

        Investment: "📈",

        Tax: "🧾",

        Health: "♥",

        Business: "💼",

        Math: "🔢",

        Converter: "↻"

    };


    return icons[category] || "▦";
}


/* =========================================================
   CATEGORY ICON CLASS
========================================================= */

function getCategoryIconClass(category) {

    const classes = {

        Loans: "loans",

        Investment: "investment",

        Tax: "tax",

        Health: "health",

        Business: "business",

        Math: "math",

        Converter: "converter"

    };


    return classes[category] || "more";
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SEARCH
========================================================= */

export function initializeSearch() {

    const form = document.getElementById(
        "categories-search-form"
    );

    const input = document.getElementById(
        "categories-search-input"
    );


    if (!form || !input) {
        return;
    }


    /* =====================================================
       READ SEARCH FROM URL
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlQuery =
        params.get("q")?.trim() || "";


    if (urlQuery) {

        input.value = urlQuery;

        renderCalculatorResults(urlQuery);

    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const query =
                input.value.trim();


            if (!query) {

                window.history.replaceState(
                    {},
                    "",
                    "categories.html"
                );


                renderCategoriesPage();

                input.focus();

                return;
            }


            const newUrl =
                `categories.html?q=${encodeURIComponent(query)}`;


            window.history.pushState(
                {},
                "",
                newUrl
            );


            renderCalculatorResults(query);

        }
    );


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    input.addEventListener(
        "input",
        function() {

            const query =
                input.value.trim();


            if (!query) {

                window.history.replaceState(
                    {},
                    "",
                    "categories.html"
                );


                renderCategoriesPage();

                return;
            }


            const newUrl =
                `categories.html?q=${encodeURIComponent(query)}`;


            window.history.replaceState(
                {},
                "",
                newUrl
            );


            renderCalculatorResults(query);

        }
    );

}
