/* =========================================================
   ToolZen Hub
   Articles Rendering
========================================================= */


/* =========================================================
   ARTICLE DATA
========================================================= */

import {
    articleRegistry
} from "../../article-registry.js";

import {
    search
} from "../../utils/search.js";


/* =========================================================
   STATE
========================================================= */

import {
    articlesState
} from "./articles-state.js";


/* =========================================================
   PAGINATION
========================================================= */

import {
    updatePagination
} from "./articles-pagination.js";


/* =========================================================
   CENTRAL ROUTES
========================================================= */

import {
    ROUTES
} from "../../routes.js";



/* =========================================================
   FILTER ARTICLES
========================================================= */

export function getFilteredArticles() {

    const category =
        articlesState.selectedCategory;

    const searchTerm =
        articlesState.searchTerm
            .trim();


    /*
     * Category filter only: the registry's own order.
     */

    const inCategory =
        articleRegistry.filter(
            article =>
                category === "All" ||
                article.category === category
        );


    if (!searchTerm) {

        return inCategory;

    }


    /*
     * Search: the shared engine (utils/search.js) ranks the
     * matches. The listing has always shown Coming-soon
     * articles as "Coming soon" cards, so it asks for them.
     */

    const byId =
        new Map(
            inCategory.map(
                article => [
                    article.id,
                    article
                ]
            )
        );

    return search(
        searchTerm,
        {
            types: ["article"],
            category:
                category === "All"
                    ? undefined
                    : category,
            includeComingSoon: true
        }
    )
        .map(
            result =>
                byId.get(result.id)
        )
        .filter(Boolean);

}


/* =========================================================
   ARTICLE URL
========================================================= */

function getArticleHref(
    article
) {

    /*
     * Only published articles with both a topic and slug
     * have an individual article page.
     *
     * Unpublished articles are shown as "Coming soon"
     * and have no link.
     */

    if (
        article.published !== true ||
        !article.topic ||
        !article.slug
    ) {

        return null;

    }


    return ROUTES.article(
        article.topic,
        article.slug
    );

}



/* =========================================================
   ARTICLE CARD
========================================================= */

function renderArticleCard(
    article
) {

    const articleHref =
        getArticleHref(article);


    if (!articleHref) {

        return renderComingSoonArticleCard(article);

    }


    return `

        <article class="article-card">

            <a
                href="${articleHref}"
                class="article-card-image-link"
                data-article-id="${article.id}"
                aria-label="${article.title}"
            >

                <img
                    class="article-card-image"
                    src="${article.image}"
                    alt="${article.alt}"
                    loading="lazy"
                >

            </a>


            <div class="article-card-content">

                <div>

                    <span class="article-card-category">
                        ${article.categoryName}
                    </span>


                    <h2>

                        <a
                            href="${articleHref}"
                            data-article-id="${article.id}"
                        >
                            ${article.title}
                        </a>

                    </h2>


                    <p>
                        ${article.description}
                    </p>

                </div>


                <div class="article-card-meta">

                    <div class="article-meta-items">

                        <span>
                            📅
                            ${article.date}
                        </span>

                        <span>
                            ◷
                            ${article.readTime}
                        </span>

                    </div>


                    <span
                        class="article-arrow"
                        aria-hidden="true"
                    >
                        →
                    </span>

                </div>

            </div>

        </article>

    `;

}



/* =========================================================
   COMING SOON ARTICLE CARD
========================================================= */

function renderComingSoonArticleCard(
    article
) {

    return `

        <article
            class="article-card article-card--soon"
            aria-disabled="true"
        >

            <div class="article-card-image-link">

                <img
                    class="article-card-image"
                    src="${article.image}"
                    alt="${article.alt}"
                    loading="lazy"
                >

            </div>


            <div class="article-card-content">

                <div>

                    <span class="article-card-category">
                        ${article.categoryName}
                    </span>


                    <h2>
                        ${article.title}
                    </h2>


                    <p>
                        ${article.description}
                    </p>

                </div>


                <div class="article-card-meta">

                    <span class="coming-soon-badge">
                        Coming soon
                    </span>

                </div>

            </div>

        </article>

    `;

}



/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyState() {

    return `

        <div class="articles-empty">

            <div>

                <div class="articles-empty-icon">
                    🔎
                </div>

                <h2>
                    No articles found
                </h2>

                <p>
                    Try another category or search term.
                </p>

            </div>

        </div>

    `;

}



/* =========================================================
   RENDER ARTICLE CARDS
========================================================= */

export function renderArticleCards() {

    const list =
        document.getElementById(
            "articles-list"
        );


    if (!list) {
        return;
    }


    const filteredArticles =
        getFilteredArticles();


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredArticles.length /
                articlesState.articlesPerPage
            )
        );


    if (
        articlesState.currentPage >
        totalPages
    ) {

        articlesState.currentPage =
            totalPages;

    }


    const startIndex =
        (
            articlesState.currentPage - 1
        ) *
        articlesState.articlesPerPage;


    const visibleArticles =
        filteredArticles.slice(
            startIndex,
            startIndex +
            articlesState.articlesPerPage
        );


    if (!visibleArticles.length) {

        list.innerHTML =
            renderEmptyState();

    } else {

        list.innerHTML =
            visibleArticles
                .map(renderArticleCard)
                .join("");

    }


    updatePagination(totalPages);

}
