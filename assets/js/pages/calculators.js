/* =========================================================
   ToolZen Hub
   All Calculators Page
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

import {
    getCalculators,
    searchCalculators
} from "../utils/categories-search.js";


/* =========================================================
   DOM ELEMENTS
========================================================= */

let grid;
let searchForm;
let searchInput;
let resultsCount;
let resultsLabel;
let emptyState;


/* =========================================================
   RENDER CALCULATORS
========================================================= */

function renderCalculators(calculators, query = "") {

    if (!grid) {
        return;
    }


    /* =====================================================
       EMPTY RESULTS
    ===================================================== */

    if (!calculators.length) {

        grid.innerHTML = "";

        emptyState.hidden = false;

        resultsCount.textContent = "0 calculators";

        resultsLabel.textContent =
            query
                ? `Search results for "${query}"`
                : "All Calculators";

        return;
    }


    /* =====================================================
       SHOW RESULTS
    ===================================================== */

    emptyState.hidden = true;


    resultsCount.textContent =
        `${calculators.length} ${
            calculators.length === 1
                ? "calculator"
                : "calculators"
        }`;


    resultsLabel.textContent =
        query
            ? `Search results for "${query}"`
            : "All Calculators";


    grid.innerHTML = calculators.map(
        calculator => `

            <a
                href="${calculator.url}"
                class="calculator-card"
            >

                <div class="calculator-card__content">

                    <span class="calculator-card__category">
                        ${calculator.category}
                    </span>


                    <h3 class="calculator-card__title">
                        ${calculator.title}
                    </h3>


                    <p class="calculator-card__description">
                        ${calculator.description}
                    </p>

                </div>


                <span
                    class="calculator-card__arrow"
                    aria-hidden="true"
                >
                    →
                </span>

            </a>

        `
    ).join("");
}


/* =========================================================
   PERFORM SEARCH
========================================================= */

function performSearch(query) {

    const search =
        String(query || "").trim();


    if (!search) {

        renderCalculators(
            getCalculators()
        );

        return;
    }


    renderCalculators(
        searchCalculators(search),
        search
    );
}


/* =========================================================
   INITIALIZE SEARCH
========================================================= */

function initializeSearch() {

    searchForm =
        document.getElementById(
            "calculators-search-form"
        );


    searchInput =
        document.getElementById(
            "calculators-search-input"
        );


    if (!searchForm || !searchInput) {
        return;
    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    searchForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const query =
                searchInput.value.trim();


            performSearch(query);


            /*
             * Keep search query in URL.
             * This allows direct links such as:
             *
             * calculators.html?q=emi
             */

            const url =
                new URL(
                    window.location.href
                );


            if (query) {

                url.searchParams.set(
                    "q",
                    query
                );

            } else {

                url.searchParams.delete("q");

            }


            window.history.replaceState(
                {},
                "",
                url
            );

        }
    );


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value.trim();


            performSearch(query);

        }
    );


    /* =====================================================
       URL SEARCH
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q");


    if (query) {

        searchInput.value = query;

        performSearch(query);

    }

}


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeCalculatorsPage() {

    grid =
        document.getElementById(
            "calculators-grid"
        );


    resultsCount =
        document.getElementById(
            "calculators-results-count"
        );


    resultsLabel =
        document.getElementById(
            "calculators-results-label"
        );


    emptyState =
        document.getElementById(
            "calculators-empty"
        );


    if (!grid) {
        return;
    }


    /* =====================================================
       GLOBAL COMPONENTS
    ===================================================== */

    renderHeader();

    renderFooter();


    /* =====================================================
       INITIAL CALCULATORS
    ===================================================== */

    renderCalculators(
        getCalculators()
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    initializeSearch();

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeCalculatorsPage
);
