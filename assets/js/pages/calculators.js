
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

        resultsCount.textContent =
            "0 calculators";

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
   UPDATE URL
========================================================= */

function updateSearchUrl(query) {

    const url =
        new URL(
            window.location.href
        );


    const search =
        String(query || "").trim();


    if (search) {

        url.searchParams.set(
            "q",
            search
        );

    } else {

        url.searchParams.delete(
            "q"
        );

    }


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* =========================================================
   PERFORM SEARCH
========================================================= */

function performSearch(query, updateUrl = true) {

    const search =
        String(query || "").trim();


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    if (!search) {

        renderCalculators(
            getCalculators()
        );


        if (updateUrl) {

            updateSearchUrl("");

        }


        return;
    }


    /* =====================================================
       SEARCH RESULTS
    ===================================================== */

    renderCalculators(
        searchCalculators(search),
        search
    );


    if (updateUrl) {

        updateSearchUrl(search);

    }

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


            performSearch(
                query,
                true
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


            performSearch(
                query,
                true
            );

        }
    );


    /* =====================================================
       CLEAR SEARCH WITH ESCAPE
    ===================================================== */

    searchInput.addEventListener(
        "search",
        () => {

            const query =
                searchInput.value.trim();


            if (!query) {

                performSearch(
                    "",
                    true
                );

            }

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

        searchInput.value =
            query;

        performSearch(
            query,
            false
        );

    } else {

        searchInput.value =
            "";

        performSearch(
            "",
            false
        );

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
