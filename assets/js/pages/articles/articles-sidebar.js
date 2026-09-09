/* =========================================================
   ToolZen Hub
   Articles Sidebar
========================================================= */


/* =========================================================
   CATEGORY DATA
========================================================= */

import {
    categories
} from "./articles-data.js";


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
        category.name;


    item.innerHTML = `

        <span class="article-category-name">

            <span class="article-category-icon">
                ${category.icon}
            </span>

            ${category.name}

        </span>


        <span class="article-category-count">

            ${category.count}

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
                categories.slice(5);


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
                                `[data-sidebar-category="${category.name}"]`
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
