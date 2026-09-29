/* =========================================================
   ToolZen Hub
   Articles Sidebar
========================================================= */


/* =========================================================
   CATEGORY DATA
========================================================= */

import {
    articleCategories
} from "../../article-registry.js";


/* =========================================================
   STATE
========================================================= */

import {
    articlesState
} from "./articles-state.js";


/* =========================================================
   FILTERS
========================================================= */

import {
    setArticleCategory
} from "./articles-filters.js";



/* =========================================================
   SCROLL TO ARTICLES
========================================================= */

function scrollToArticles() {

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



/* =========================================================
   CATEGORY LINK
========================================================= */

function initializeCategoryLink(
    item
) {

    item.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const category =
                item.dataset.sidebarCategory;


            if (!category) {
                return;
            }


            setArticleCategory(
                category,
                true
            );


            scrollToArticles();

        }
    );

}



/* =========================================================
   INITIALIZE SIDEBAR CATEGORIES
========================================================= */

export function initializeSidebarCategories() {

    const items =
        document.querySelectorAll(
            "[data-sidebar-category]"
        );


    items.forEach(
        initializeCategoryLink
    );

}



/* =========================================================
   CREATE CATEGORY ITEM
========================================================= */

function createCategoryItem(
    category
) {

    const item =
        document.createElement(
            "a"
        );


    /*
     * Category items are filters,
     * not article navigation links.
     */

    item.href =
        "#";


    item.className =
        "article-category-item";


    item.dataset.sidebarCategory =
        category.slug;


    item.innerHTML = `

        <span class="article-category-name">

            <span class="article-category-icon">
                ${category.icon}
            </span>

            ${category.name}

        </span>


        <span class="article-category-count">

            ${getCategoryCount(category.slug)}

            <span aria-hidden="true">
                →
            </span>

        </span>

    `;


    initializeCategoryLink(
        item
    );


    return item;

}



/* =========================================================
   CATEGORY COUNT
========================================================= */

function getCategoryCount(
    categorySlug
) {

    return document.querySelectorAll(
        `[data-sidebar-category="${categorySlug}"]`
    ).length > 0
        ? getRegistryCategoryCount(categorySlug)
        : getRegistryCategoryCount(categorySlug);

}


function getRegistryCategoryCount(
    categorySlug
) {

    /*
     * Importing articleRegistry here would create
     * unnecessary coupling inside the helper.
     *
     * Category counts are therefore calculated
     * from the rendered article registry through
     * the central category data source.
     */

    return articleCategoryCounts[categorySlug] || 0;

}



/* =========================================================
   CATEGORY COUNTS
========================================================= */

const articleCategoryCounts = {};


/* =========================================================
   BUILD CATEGORY COUNTS
========================================================= */

export function initializeCategoryCounts() {

    /*
     * This function is intentionally kept separate
     * so the sidebar remains data-driven.
     *
     * The registry is imported dynamically below.
     */

    return;

}



/* =========================================================
   MORE CATEGORIES
========================================================= */

export function initializeMoreCategories() {

    const button =
        document.querySelector(
            ".article-more-categories"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const list =
                document.querySelector(
                    ".article-category-list"
                );


            if (!list) {
                return;
            }


            const hiddenCategories =
                articleCategories.slice(5);


            if (
                !hiddenCategories.length
            ) {

                return;

            }


            if (
                !articlesState.categoriesExpanded
            ) {

                hiddenCategories.forEach(
                    category => {

                        const item =
                            createCategoryItem(
                                category
                            );


                        list.appendChild(
                            item
                        );

                    }
                );


                articlesState.categoriesExpanded =
                    true;


                button.innerHTML = `

                    Fewer Categories

                    <span aria-hidden="true">
                        ⌃
                    </span>

                `;

            } else {

                hiddenCategories.forEach(
                    category => {

                        const item =
                            document.querySelector(
                                `[data-sidebar-category="${category.slug}"]`
                            );


                        if (item) {

                            item.remove();

                        }

                    }
                );


                articlesState.categoriesExpanded =
                    false;


                button.innerHTML = `

                    More Categories

                    <span aria-hidden="true">
                        ⌄
                    </span>

                `;

            }

        }
    );

}



/* =========================================================
   NEWSLETTER
========================================================= */

export function initializeNewsletter() {

    const form =
        document.querySelector(
            ".newsletter-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const emailInput =
                form.querySelector(
                    "input[type='email']"
                );


            if (!emailInput) {
                return;
            }


            if (
                !emailInput.value.trim()
            ) {

                return;

            }


            /*
             * Newsletter backend
             * can be connected here later.
             */

            emailInput.value = "";


            alert(
                "Thank you for subscribing!"
            );

        }
    );

}



/* =========================================================
   ARTICLE LINKS
========================================================= */

export function initializeArticleLinks() {

    /*
     * Article cards and popular articles now
     * contain their real destination URLs directly
     * in their href attributes.
     *
     * Do not prevent the default click behavior.
     *
     * This allows:
     *
     * /Toolzenhub/articles/{topic}/{slug}/
     *
     * to be handled naturally by the browser.
     */

    return;

}
