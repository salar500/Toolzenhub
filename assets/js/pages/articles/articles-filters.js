
/* =========================================================
   ToolZen Hub
   Articles Filters
========================================================= */

import { articlesState } from "./articles-state.js";

import { renderArticleCards } from "./articles-render.js";


/* =========================================================
   UPDATE ACTIVE FILTERS
========================================================= */

function updateActiveFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".article-filter"
        );


    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category ===
            articlesState.selectedCategory
        );

    });

}


/* =========================================================
   SET CATEGORY
========================================================= */

export function setArticleCategory(
    category,
    shouldScroll = false
) {

    if (!category) {
        return;
    }


    articlesState.selectedCategory =
        category;


    articlesState.currentPage =
        1;


    updateActiveFilters();

    renderArticleCards();


    if (shouldScroll) {

        const articlesMain =
            document.querySelector(
                ".articles-main"
            );


        if (articlesMain) {

            articlesMain.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }

}


/* =========================================================
   INITIALIZE FILTER BUTTONS
========================================================= */

export function initializeArticleFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".article-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                setArticleCategory(
                    category,
                    Boolean(
                        button.closest(
                            ".articles-hero-action"
                        )
                    )
                );

            }
        );

    });

}


/* =========================================================
   INITIALIZE SEARCH
========================================================= */

export function initializeArticleSearch() {

    const searchInput =
        document.getElementById(
            "article-search"
        );


    const searchForm =
        document.getElementById(
            "article-search-form"
        );


    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                articlesState.currentPage =
                    1;

                articlesState.searchTerm =
                    searchInput?.value || "";

                renderArticleCards();

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                articlesState.currentPage =
                    1;

                articlesState.searchTerm =
                    searchInput.value;

                renderArticleCards();

            }
        );

    }

}
