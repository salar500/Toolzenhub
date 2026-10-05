/* =========================================================
   ToolZen Hub
   Related Articles Component
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    calculatorMetadata
} from "../calculator-registry.js";

import {
    articleRegistry
} from "../article-registry.js";

import {
    getRelatedArticlesForTool
} from "../data/relationships.js";


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
     * Unpublished articles ("Coming soon") have no link.
     */

    if (
        article.published !== true ||
        !article.topic ||
        !article.slug
    ) {
        return "#";
    }


    return ROUTES.article(
        article.topic,
        article.slug
    );

}


/* =========================================================
   RENDER RELATED ARTICLES
========================================================= */

export function renderRelatedArticles(
    currentSlug = ""
) {


    /*
     * Find the category of the current calculator.
     */

    const calculator =
        calculatorMetadata[currentSlug];


    const category =
        calculator?.category;


    /*
     * If the calculator does not have a category,
     * there is nothing relevant to display.
     */

    if (!category) {
        return "";
    }


    /*
     * Curated articles first, then articles that point at the
     * tool, then the rest of its category
     * (data/relationships.js). The cards are drawn from the
     * listing view of each article.
     */

    const relatedArticles =
        getRelatedArticlesForTool(
            currentSlug,
            { limit: 6 }
        )
            .map(
                related =>
                    articleRegistry.find(
                        article =>
                            article.id === related.id
                    )
            )
            .filter(Boolean);


    /*
     * If there are no articles for this category,
     * don't render an empty section.
     */

    if (!relatedArticles.length) {
        return "";
    }


    return `

        <section class="related-section">

            <div class="related-section__heading">

                <h2>
                    Related Articles
                </h2>

                <a
                    href="${ROUTES.articles}"
                >
                    View all →
                </a>

            </div>


            <div class="related-articles-grid">

                ${relatedArticles.map(
                    article => {

                        const articleHref =
                            getArticleHref(
                                article
                            );


                        /*
                         * Articles with a real detail page
                         * are rendered as clickable cards.
                         *
                         * Articles without topic + slug
                         * remain non-clickable.
                         */

                        if (
                            articleHref === "#"
                        ) {

                            return `

                                <article
                                    class="related-article-card"
                                >

                                    ${article.image ? `<div class="related-article-image">

                                        <img
                                            src="${article.image}"
                                            alt="${article.alt || article.title}"
                                            loading="lazy"
                                        >

                                    </div>` : ""}


                                    <div class="related-article-content">

                                        <h3>
                                            ${article.title}
                                        </h3>

                                        <p>
                                            ${article.description}
                                        </p>

                                    </div>

                                </article>

                            `;

                        }


                        return `

                            <a
                                href="${articleHref}"
                                class="related-article-card"
                            >

                                ${article.image ? `<div class="related-article-image">

                                    <img
                                        src="${article.image}"
                                        alt="${article.alt || article.title}"
                                        loading="lazy"
                                    >

                                </div>` : ""}


                                <div class="related-article-content">

                                    <h3>
                                        ${article.title}
                                    </h3>

                                    <p>
                                        ${article.description}
                                    </p>

                                </div>

                            </a>

                        `;

                    }
                ).join("")}

            </div>

        </section>

    `;

}
