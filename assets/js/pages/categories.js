/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */


/* =========================================================
   Category Data
========================================================= */

const categories = [

    {
        id: "loans",
        icon: "🏠",
        iconClass: "loans",
        title: "Loans",
        description: "EMI, Home Loan, Personal Loan and more",
        href: "loans.html"
    },

    {
        id: "investment",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        href: "investment.html"
    },

    {
        id: "tax",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Income Tax, GST, TDS and more",
        href: "tax.html"
    },

    {
        id: "health",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more",
        href: "health.html"
    },

    {
        id: "business",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more",
        href: "business.html"
    },

    {
        id: "math",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more",
        href: "math.html"
    },

    {
        id: "converter",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more",
        href: "converter.html"
    },

    {
        id: "more",
        icon: "▦",
        iconClass: "more",
        title: "More",
        description: "Explore all calculators and tools",
        href: "more.html"
    }

];


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

    const form = document.getElementById("categories-search-form");
    const input = document.getElementById("categories-search-input");

    if (!form || !input) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const query = input.value.trim().toLowerCase();

        if (!query) {
            return;
        }


        const match = categories.find(category => {

            return (
                category.title.toLowerCase().includes(query) ||
                category.description.toLowerCase().includes(query)
            );

        });


        if (match) {

            window.location.href = match.href;

        }

    });

}


/* =========================================================
   Init
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    renderCategoriesPage();

    initCategoriesSearch();

});
