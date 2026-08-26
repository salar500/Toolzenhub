/* =========================================================
   ToolZen Hub
   Articles Template
========================================================= */

import { articles, categories } from "./articles-data.js";


/* =========================================================
   HERO
========================================================= */

function renderHero() {

    return `

        <section class="articles-hero">

            <div class="articles-container">

                <div class="articles-hero-inner">

                    <div class="articles-hero-content">

                        <h1>
                            Articles & Guides
                        </h1>

                        <p>
                            Helpful guides, tips and insights to help you
                            make smarter financial and everyday decisions.
                        </p>

                    </div>


                    <div class="articles-hero-visual">

                        <div class="articles-hero-illustration">

                            <img
                                class="articles-hero-image"
                                src="/assets/images/articles-hero.png"
                                alt="Books, plant and coffee mug representing learning and financial growth"
                            >

                        </div>


                        <div class="articles-hero-action">

                            <button
                                type="button"
                                class="article-filter active"
                                data-category="All"
                            >
                                All Articles
                            </button>

                        </div>


                    </div>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   FILTER BAR
========================================================= */

function renderFilterBar() {

    return `

        <div class="articles-filter-bar">

            <button
                type="button"
                class="article-filter active"
                data-category="All"
            >
                All Articles
            </button>

            ${categories.map(category => `

                <button
                    type="button"
                    class="article-filter"
                    data-category="${category.name}"
                >
                    ${category.name}
                </button>

            `).join("")}

        </div>

    `;
}


/* =========================================================
   SEARCH
========================================================= */

function renderSearch() {

    return `

        <div class="article-sidebar-search">

            <form id="article-search-form">

                <label
                    for="article-search"
                    class="sr-only"
                >
                    Search articles
                </label>

                <input
                    id="article-search"
                    type="search"
                    placeholder="Search articles..."
                    autocomplete="off"
                >

                <button
                    type="submit"
                    aria-label="Search articles"
                >

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >

                        <path
                            d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                        />

                    </svg>

                </button>

            </form>

        </div>

    `;
}


/* =========================================================
   CATEGORIES SIDEBAR
========================================================= */

function renderCategories() {

    const visibleCategories = categories.slice(0, 5);

    return `

        <div class="article-sidebar-card">

            <div class="article-sidebar-heading">

                <h2>
                    Categories
                </h2>

            </div>


            <div class="article-category-list">

                ${visibleCategories.map(category => `

                    <a
                        href="#"
                        class="article-category-item"
                        data-sidebar-category="${category.name}"
                    >

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

                    </a>

                `).join("")}

            </div>


            ${
                categories.length > 5
                    ? `
                        <button
                            type="button"
                            class="article-more-categories"
                        >
                            More Categories

                            <span aria-hidden="true">
                                ⌄
                            </span>

                        </button>
                    `
                    : ""
            }

        </div>

    `;
}


/* =========================================================
   POPULAR ARTICLES
========================================================= */

function renderPopularArticles() {

    return `

        <div class="article-sidebar-card">

            <div class="article-sidebar-heading">

                <h2>
                    Popular Articles
                </h2>

            </div>


            <div class="popular-articles">

                ${articles.slice(0, 4).map(article => `

                    <a
                        href="#"
                        class="popular-article"
                        data-article-id="${article.id}"
                    >

                        <img
                            src="${article.image}"
                            alt="${article.alt}"
                            loading="lazy"
                        >


                        <div>

                            <h3>
                                ${article.title}
                            </h3>

                            <span>
                                ${article.date}
                            </span>

                        </div>

                    </a>

                `).join("")}

            </div>

        </div>

    `;
}


/* =========================================================
   NEWSLETTER
========================================================= */

function renderNewsletter() {

    return `

        <div class="article-newsletter">

            <div class="newsletter-icon">

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <path
                        d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11zm2 .5l7 5 7-5"
                    />

                </svg>

            </div>


            <div class="newsletter-content">

                <h2>
                    Stay Updated
                </h2>

                <p>
                    Get the latest articles and updates
                    in your inbox.
                </p>

            </div>


            <form class="newsletter-form">

                <label
                    for="newsletter-email"
                    class="sr-only"
                >
                    Email address
                </label>


                <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email"
                    required
                >


                <button type="submit">
                    Subscribe
                </button>

            </form>

        </div>

    `;
}


/* =========================================================
   SIDEBAR
========================================================= */

function renderSidebar() {

    return `

        <aside class="articles-sidebar">

            ${renderSearch()}

            ${renderCategories()}

            ${renderPopularArticles()}

            ${renderNewsletter()}

        </aside>

    `;
}


/* =========================================================
   MAIN PAGE TEMPLATE
========================================================= */

export function renderArticlesTemplate() {

    return `

        <div id="articles-page">

            ${renderHero()}


            <main class="articles-container articles-main">

                ${renderFilterBar()}


                <div class="articles-layout">


                    <section class="articles-feed">

                        <div
                            id="articles-list"
                            class="articles-list"
                        ></div>


                        <nav
                            class="articles-pagination"
                            aria-label="Articles pagination"
                        ></nav>

                    </section>


                    ${renderSidebar()}

                </div>

            </main>

        </div>

    `;
}
