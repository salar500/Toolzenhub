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


/* =========================================================
   ARTICLE URL
========================================================= */

function getArticleHref(
    article
) {

    /*
     * Only articles with both a topic and slug
     * have an individual article page.
     *
     * Articles without a detail page remain
     * non-navigational until their pages are created.
     */

    if (
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
     * Get articles belonging to the same category.
     */

    const relatedArticles =
        articleRegistry
            .filter(
                article =>
                    article.category === category
            )
            .slice(0, 6);


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

                                    <div class="related-article-image">

                                        <img
                                            src="${article.image}"
                                            alt="${article.alt || article.title}"
                                            loading="lazy"
                                        >

                                    </div>


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

                                <div class="related-article-image">

                                    <img
                                        src="${article.image}"
                                        alt="${article.alt || article.title}"
                                        loading="lazy"
                                    >

                                </div>


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
