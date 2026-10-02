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
    getSection,
    getSectionUrl
} from "../data/taxonomy.js";

import {
    search as searchIndex
} from "../utils/search.js";

import {
    markPageReady
} from "../utils/page-ready.js";

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

        const text =
            String(query || "")
                .trim();


        if (!text) {

            renderLoanCalculators(
                loanCalculators
            );

            return;
        }


        /*
         * The shared search (utils/search.js), limited to this
         * page's category. It always matched a tool's id here,
         * and lists Coming-soon tools as cards.
         */

        const results =
            searchIndex(
                text,
                {
                    types: ["tool"],
                    category: "loans",
                    includeComingSoon: true,
                    matchId: true
                }
            ).map(
                result =>
                    loanCalculators.find(
                        calculator =>
                            calculator.id === result.id
                    )
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


    const calculatorsLink =
        document.getElementById(
            "loans-breadcrumb-categories"
        );


    if (homeLink) {

        homeLink.href =
            ROUTES.home;

    }


    if (calculatorsLink) {

        calculatorsLink.href =
            getSectionUrl("calculators");

        calculatorsLink.textContent =
            getSection("calculators").title;

        calculatorsLink.classList.add(
            "loans-breadcrumb__active"
        );

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

    markPageReady();

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLoansPage
);
