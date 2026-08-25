/* =========================================================
   ToolZen Hub
   Articles Sidebar
========================================================= */

import { categories } from "./articles-data.js";

import { articlesState } from "./articles-state.js";

import { setArticleCategory } from "./articles-filters.js";

import { renderArticleCards } from "./articles-render.js";


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

function initializeCategoryLink(item) {

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

function createCategoryItem(category) {

    const item =
        document.createElement("a");


    item.href = "#";


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


    initializeCategoryLink(item);


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


                        list.appendChild(item);

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

    const articleLinks =
        document.querySelectorAll(
            ".article-card a, .popular-article"
        );


    articleLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const articleId =
                    link.dataset.articleId;


                /*
                 * Article detail routing
                 * can be connected here later.
                 *
                 * Example:
                 *
                 * window.location.hash =
                 *     `article/${articleId}`;
                 */

                console.log(
                    "Article selected:",
                    articleId
                );

            }
        );

    });

}
