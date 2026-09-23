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
   RENDER CALCULATOR CARDS
========================================================= */

function renderLoanCalculators(
    calculators
) {

    const grid = document.getElementById(
        "loans-calculators-grid"
    );

    if (!grid) {
        return;
    }


    if (!calculators.length) {

        grid.innerHTML = `
            <div class="loans-search-empty">
                <h3>No calculators found</h3>

                <p>
                    Try another search term.
                </p>
            </div>
        `;

        return;
    }


    grid.innerHTML =
        renderCalculatorCards(
            calculators
        );

}


/* =========================================================
   SEARCH
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


    const loanCalculators =
        getCalculatorsByCategory(
            "loans"
        );


    function performSearch(query) {

        const search =
            String(query || "")
                .trim()
                .toLowerCase();


        if (!search) {

            renderLoanCalculators(
                loanCalculators
            );

            return;
        }


        const results =
            loanCalculators.filter(
                calculator => {

                    const searchableText = [

                        calculator.title,

                        calculator.description,

                        calculator.category,

                        calculator.id

                    ]
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        search
                    );

                }
            );


        renderLoanCalculators(
            results
        );

    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            performSearch(
                input.value
            );

        }
    );


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    input.addEventListener(
        "input",
        function() {

            performSearch(
                input.value
            );

        }
    );

}


/* =========================================================
   HEADER NAVIGATION
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
   BREADCRUMB NAVIGATION
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
   APPLICATION
========================================================= */

function initializeLoansPage() {

    renderHeader();

    setActiveNavigation();

    initializeBreadcrumb();

    renderLoanCalculators(
        getCalculatorsByCategory(
            "loans"
        )
    );

    initializeSearch();

    renderFooter();

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLoansPage
);
