/* =========================================================
   ToolZen Hub
   Latest Articles Component
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    articleRegistry
} from "../article-registry.js";


/* =========================================================
   LATEST ARTICLES

   Shows the first published articles from the central
   article registry. Articles without published: true
   ("Coming soon") are never shown here.
========================================================= */

const LATEST_ARTICLES_LIMIT = 3;


function renderArticleCard(article) {

    return `
                    <a
                        href="${ROUTES.article(article.topic, article.slug)}"
                        class="article-card"
                    >

                        ${article.image ? `<div class="article-card__image">

                            <img
                                src="${article.image}"
                                alt="${article.alt}"
                                loading="lazy"
                            >

                        </div>` : ""}

                        <div class="article-card__content">

                            <div class="article-card__category">
                                ${article.categoryName}
                            </div>

                            <h3 class="article-card__title">
                                ${article.title}
                            </h3>

                            <p class="article-card__description">
                                ${article.description}
                            </p>

                            <div class="article-card__footer">

                                <span class="article-card__read">
                                    Read article
                                </span>

                                <span
                                    class="article-card__arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>

                        </div>

                    </a>
    `;

}


export function renderArticles() {

    const articles = document.getElementById("latest-articles");

    if (!articles) {
        return;
    }

    const latestArticles =
        articleRegistry
            .filter(article => article.published === true)
            .slice(0, LATEST_ARTICLES_LIMIT);

    if (!latestArticles.length) {
        return;
    }


    /* =====================================================
       Latest Articles
    ===================================================== */

    articles.innerHTML = `

        <section class="articles-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Latest Articles
                    </h2>

                    <a
                        href="${ROUTES.articles}"
                        class="section-link"
                    >
                        View all articles
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="articles-grid">

                    ${latestArticles.map(renderArticleCard).join("")}

                </div>

            </div>

        </section>

    `;

}
