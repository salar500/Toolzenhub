/* =========================================================
   ToolZen Hub
   Categories Page
========================================================= */

import {
    searchCalculators
} from "../utils/categories-search.js";

import {
    ROUTES
} from "../routes.js";

import {
    categories
} from "../data/categories.js";

import {
    getCategoryUrl,
    getCategoryLandingUrl,
    getCategoryByTitle,
    getToolsByCategory
} from "../data/taxonomy.js";

import {
    renderBreadcrumb
} from "../components/breadcrumb.js";

import {
    toolCardHtml
} from "../components/category-tool-card.js";


/* =========================================================
   RENDER BREADCRUMB
========================================================= */

export function renderCategoriesBreadcrumb() {

    const breadcrumb =
        document.getElementById(
            "categories-breadcrumb"
        );

    if (!breadcrumb) {
        return;
    }


    breadcrumb.innerHTML =
        renderBreadcrumb([
            {
                label: "All Tools",
                href: ROUTES.tools
            },
            {
                label: "Calculators"
            }
        ]);

}


/* =========================================================
   RENDER CATEGORY CARDS
========================================================= */

/*
 * A category card is shown only when the category has tools to show (live or
 * coming soon). A category with none, such as "More" today, stays in the data but
 * has no card: it would open a page with nothing in it.
 */
function visibleCategories() {

    return categories.filter(
        category =>
            getToolsByCategory(category.id).length > 0
    );

}


/* =========================================================
   TOOLS BY CATEGORY (the destination of a category card that has
   no landing page of its own)

   One section per such category, with the category id as its anchor
   (categories.html#investment), listing its tools: live tools as
   links, tools that are not built yet as non-clickable "Coming soon"
   cards. A category with a landing page (Loans) links to it instead.
========================================================= */

function renderCategorySections() {

    const container = document.getElementById(
        "categories-sections"
    );

    if (!container) {
        return;
    }

    container.hidden = false;

    container.innerHTML =
        visibleCategories()
            .filter(category => !getCategoryLandingUrl(category.id))
            .map(category => `

        <section
            class="categories-detail"
            id="${category.id}"
            aria-labelledby="${category.id}-heading"
        >

            <div class="categories-detail__header">

                <h2
                    class="categories-detail__title"
                    id="${category.id}-heading"
                    tabindex="-1"
                >
                    ${escapeHtml(category.title)}
                </h2>

                <p class="categories-detail__text">
                    ${escapeHtml(category.description)}
                </p>

            </div>

            <div class="categories-detail__grid">
                ${getToolsByCategory(category.id).map(tool => toolCardHtml(tool, category)).join("")}
            </div>

        </section>

    `).join("");

}

/* the page is drawn by script, so a link such as categories.html#investment is scrolled to once its section exists */
function scrollToHash() {

    const id =
        decodeURIComponent(window.location.hash.slice(1));

    const target =
        id ? document.getElementById(id) : null;

    if (!target || target.closest("[hidden]")) {
        return;
    }

    target.scrollIntoView();

    /*
     * The browser also handles the fragment itself once the page has loaded, and
     * that blurs whatever was focused, so the heading is focused after that.
     */
    const focusHeading = () =>
        target
            .querySelector('[tabindex="-1"]')
            ?.focus({ preventScroll: true });

    if (document.readyState === "complete") {
        requestAnimationFrame(focusHeading);
    } else {
        window.addEventListener(
            "load",
            () => requestAnimationFrame(focusHeading),
            { once: true }
        );
    }

}


export function renderCategoriesPage() {

    renderCategoriesBreadcrumb();


    const grid = document.getElementById(
        "categories-grid"
    );

    if (!grid) {
        return;
    }


    grid.innerHTML = visibleCategories().map(category => {


        /* =================================================
           CATEGORY DESTINATION

           The category's landing page (Loans today),
           otherwise its section on this page.
        ================================================= */

        const categoryUrl =
            getCategoryUrl(
                category.id
            );

        return `

        <a
            href="${categoryUrl}"
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

    `;

    }).join("");

    renderCategorySections();

    scrollToHash();
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

    const sections = document.getElementById("categories-sections");

    if (sections) {
        sections.hidden = Boolean(query);
    }


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

    grid.innerHTML = results.map(calculator => {

        /*
         * Calculators that are not built yet have no URL.
         * They are shown as non-clickable "Coming soon" cards.
         */

        const isAvailable =
            Boolean(calculator.url);


        const openTag =
            isAvailable
                ? `<a
            href="${calculator.url}"
            class="category-page-card"
        >`
                : `<div
            class="category-page-card category-page-card--soon"
            aria-disabled="true"
        >`;


        const closeTag =
            isAvailable
                ? "</a>"
                : "</div>";


        const soonBadge =
            isAvailable
                ? ""
                : `<span class="coming-soon-badge">Coming soon</span>`;


        const arrow =
            isAvailable
                ? `<span
                class="category-page-card__arrow"
                aria-hidden="true"
            >
                →
            </span>`
                : "";


        return `

        ${openTag}

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

                ${soonBadge}

            </div>


            ${arrow}

        ${closeTag}

    `;

    }).join("");
}


/* =========================================================
   CATEGORY ICON

   Looked up from the category data by the category title the
   search results carry. Unknown titles use the "More" look.
========================================================= */

function getCategoryIcon(category) {

    return (
        getCategoryByTitle(category)?.icon ||
        "▦"
    );

}


/* =========================================================
   CATEGORY ICON CLASS
========================================================= */

function getCategoryIconClass(category) {

    return (
        getCategoryByTitle(category)?.iconClass ||
        "more"
    );

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
                    ROUTES.categories
                );


                renderCategoriesPage();

                input.focus();

                return;
            }


            const newUrl =
                `${ROUTES.categories}?q=${encodeURIComponent(query)}`;


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
                    ROUTES.categories
                );


                renderCategoriesPage();

                return;
            }


            const newUrl =
                `${ROUTES.categories}?q=${encodeURIComponent(query)}`;


            window.history.replaceState(
                {},
                "",
                newUrl
            );


            renderCalculatorResults(query);

        }
    );

}
