/* =========================================================
   ToolZen Hub
   Articles Rendering
========================================================= */

import { articles } from "./articles-data.js";

import { articlesState } from "./articles-state.js";

import { updatePagination } from "./articles-pagination.js";


/* =========================================================
   FILTER ARTICLES
========================================================= */

export function getFilteredArticles() {

    const category =
        articlesState.selectedCategory;

    const searchTerm =
        articlesState.searchTerm
            .trim()
            .toLowerCase();


    return articles.filter(article => {

        const matchesCategory =
            category === "All" ||
            article.category === category;


        const matchesSearch =
            !searchTerm ||

            article.title
                .toLowerCase()
                .includes(searchTerm) ||

            article.description
                .toLowerCase()
                .includes(searchTerm) ||

            article.category
                .toLowerCase()
                .includes(searchTerm);


        return (
            matchesCategory &&
            matchesSearch
        );

    });

}


/* =========================================================
   ARTICLE CARD
========================================================= */

function renderArticleCard(article) {

    return `

        <article class="article-card">

            <a
                href="#"
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
                        ${article.category}
                    </span>


                    <h2>

                        <a
                            href="#"
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
