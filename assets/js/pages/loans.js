/* =========================================================
   ToolZen Hub
   Loans Calculators Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";


/* =========================================================
   Loan Calculator Data
========================================================= */

const loanCalculators = [

    {
        id: "loan-comparison",
        icon: "⚖",
        title: "Loan Comparison Calculator",
        description: "Compare two loans side by side and find the best option.",
        href: "loan-comparison.html"
    },

    {
        id: "emi",
        icon: "▦",
        title: "EMI Calculator",
        description: "Calculate your EMI for any loan amount.",
        href: "emi-calculator.html"
    },

    {
        id: "home-loan",
        icon: "⌂",
        title: "Home Loan Calculator",
        description: "Calculate EMI, interest and payment schedule.",
        href: "home-loan-calculator.html"
    },

    {
        id: "personal-loan",
        icon: "♙",
        title: "Personal Loan Calculator",
        description: "Calculate EMI and total payable for personal loan.",
        href: "personal-loan-calculator.html"
    },

    {
        id: "loan-eligibility",
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description: "Check your eligibility for various loans.",
        href: "loan-eligibility-calculator.html"
    },

    {
        id: "balance-transfer",
        icon: "⟳",
        title: "Balance Transfer Calculator",
        description: "Check savings on balance transfer.",
        href: "balance-transfer-calculator.html"
    },

    {
        id: "interest",
        icon: "%",
        title: "Interest Calculator",
        description: "Calculate simple and compound interest.",
        href: "interest-calculator.html"
    },

    {
        id: "prepayment",
        icon: "₹",
        title: "Prepayment Calculator",
        description: "Calculate savings on part prepayment of loan.",
        href: "prepayment-calculator.html"
    }

];


/* =========================================================
   Render Calculator Cards
========================================================= */

function renderLoanCalculators() {

    const grid = document.getElementById(
        "loans-calculators-grid"
    );

    if (!grid) {
        return;
    }


    grid.innerHTML = loanCalculators.map(calculator => `

        <a
            href="${calculator.href}"
            class="loan-calculator-card"
        >

            <div
                class="
                    loan-calculator-card__icon
                    loan-calculator-card__icon--${calculator.id}
                "
                aria-hidden="true"
            >
                ${calculator.icon}
            </div>


            <div class="loan-calculator-card__content">

                <h2 class="loan-calculator-card__title">
                    ${calculator.title}
                </h2>

                <p class="loan-calculator-card__description">
                    ${calculator.description}
                </p>

            </div>


            <span
                class="loan-calculator-card__arrow"
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
        "loans-search-form"
    );

    const input = document.getElementById(
        "loans-search-input"
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
   Header Navigation
========================================================= */

function setActiveNavigation() {

    const navigationLinks =
        document.querySelectorAll(".navbar__link");


    navigationLinks.forEach(link => {

        link.classList.remove("active");

    });


    const categoriesLink =
        document.querySelector(
            '.navbar__link[data-nav="categories"]'
        );


    if (categoriesLink) {

        categoriesLink.classList.add("active");

    }

}


/* =========================================================
   Application
========================================================= */

function initializeLoansPage() {

    renderHeader();

    setActiveNavigation();

    renderLoanCalculators();

    initializeSearch();

    renderFooter();

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLoansPage
);
