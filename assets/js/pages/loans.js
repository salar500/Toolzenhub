/* =========================================================
   ToolZen Hub
   Loans Calculators Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

import { ROUTES } from "../routes.js";

import {
    getCalculatorsByCategory
} from "../data/calculators.js";

import {
    renderCalculatorCards
} from "../components/calculator-card.js";


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


    const loanCalculators =
        getCalculatorsByCategory("loans");


    grid.innerHTML =
        renderCalculatorCards(
            loanCalculators
        );

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


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const query =
                input.value.trim();


            if (!query) {

                input.focus();

                return;
            }


            window.location.href =
                `search.html?q=${encodeURIComponent(query)}`;

        }
    );

}


/* =========================================================
   Header Navigation
========================================================= */

function setActiveNavigation() {

    const navigationLinks =
        document.querySelectorAll(
            ".navbar__link"
        );


    navigationLinks.forEach(
        link => {

            link.classList.remove(
                "active"
            );

        }
    );


    const categoriesLink =
        document.querySelector(
            '.navbar__link[data-nav="categories"]'
        );


    if (categoriesLink) {

        categoriesLink.classList.add(
            "active"
        );

    }

}


/* =========================================================
   Breadcrumb Navigation
========================================================= */

function initializeBreadcrumb() {

    const homeLink =
        document.getElementById(
            "loans-breadcrumb-home"
        );


    const categoriesLink =
        document.getElementById(
            "loans-breadcrumb-categories"
        );


    if (homeLink) {

        homeLink.href =
            ROUTES.home;

    }


    if (categoriesLink) {

        categoriesLink.href =
            ROUTES.categories;

    }

}


/* =========================================================
   Application
========================================================= */

function initializeLoansPage() {

    renderHeader();

    setActiveNavigation();

    initializeBreadcrumb();

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
