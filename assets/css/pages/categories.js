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
        description: "EMI, Home Loan, Personal Loan and more",
        calculators: [
            "EMI Calculator",
            "Home Loan Calculator",
            "Personal Loan Calculator",
            "Loan Comparison"
        ]
    },

    {
        id: "investment",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        calculators: [
            "SIP Calculator",
            "PPF Calculator",
            "FD Calculator",
            "CAGR Calculator"
        ]
    },

    {
        id: "tax",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Income Tax, GST and more",
        calculators: [
            "Income Tax Calculator",
            "GST Calculator",
            "HRA Calculator",
            "Tax Savings Calculator"
        ]
    },

    {
        id: "health",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more",
        calculators: [
            "BMI Calculator",
            "BMR Calculator",
            "Calorie Calculator",
            "Body Fat Calculator"
        ]
    },

    {
        id: "business",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more",
        calculators: [
            "Profit Calculator",
            "Margin Calculator",
            "ROI Calculator",
            "Break Even Calculator"
        ]
    },

    {
        id: "math",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more",
        calculators: [
            "Percentage Calculator",
            "Ratio Calculator",
            "Age Calculator",
            "Average Calculator"
        ]
    },

    {
        id: "converter",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more",
        calculators: [
            "Unit Converter",
            "Currency Converter",
            "Date Calculator",
            "Time Converter"
        ]
    }

];


/* =========================================================
   Render Categories
========================================================= */

function renderCategoriesPage() {

    const grid = document.getElementById(
        "categories-grid"
    );

    if (!grid) {
        return;
    }


    grid.innerHTML = categories.map(category => `

        <article
            id="${category.id}"
            class="category-page-card"
        >

            <div class="category-page-card__header">

                <div
                    class="
                        category-page-card__icon
                        category-page-card__icon--${category.iconClass}
                    "
                >
                    ${category.icon}
                </div>

                <div>

                    <h2 class="category-page-card__title">
                        ${category.title}
                    </h2>

                    <p class="category-page-card__description">
                        ${category.description}
                    </p>

                </div>

            </div>


            <div class="category-page-card__divider"></div>


            <ul class="category-page-card__links">

                ${category.calculators.map(calculator => `

                    <li>

                        <a
                            href="#"
                            class="category-page-card__link"
                        >

                            <span>
                                ${calculator}
                            </span>

                            <span
                                class="category-page-card__arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>

                        </a>

                    </li>

                `).join("")}

            </ul>

        </article>

    `).join("");
}


/* =========================================================
   Application
========================================================= */

function initializeCategoriesPage() {

    renderHeader();

    renderCategoriesPage();

    renderFooter();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeCategoriesPage
);
