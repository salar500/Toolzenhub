/* =========================================================
   ToolZen Hub
   Article Markup

   Pure: returns the article page HTML. Used by the site build
   (src/_data/articlePages.js) to put the whole article in the
   generated page; no browser script renders articles.

   Controls:
   - Article hero
   - Breadcrumb
   - Metadata
   - Tags
   - Main article content

   Child module:
   - articleContent.js
========================================================= */

import { ROUTES } from "../../routes.js";
import { renderBreadcrumb } from "../../components/breadcrumb.js";

import { renderArticleContent } from "./articleContent.js";


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ASSET RESOLVER
========================================================= */

function resolveAsset(source) {

    return ROUTES.asset(source);

}


/* =========================================================
   ARTICLE CATEGORY NAME
========================================================= */

function getArticleCategoryName(
    article
) {

    return (
        article.categoryName ||
        article.category ||
        "Articles"
    );

}


/* =========================================================
   ICONS
========================================================= */

function icon(type) {

    const icons = {

        calendar: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M7 3v3M17 3v3M4 9h16"/>

                <rect
                    x="4"
                    y="5"
                    width="16"
                    height="16"
                    rx="1"
                />
            </svg>
        `,


        clock: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="8"
                />

                <path d="M12 7v5l3 2"/>
            </svg>
        `,


        author: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="8"
                    r="3"
                />

                <path d="M5 20a7 7 0 0114 0"/>
            </svg>
        `

    };


    return icons[type] || "";

}


/* =========================================================
   TAGS
========================================================= */

function renderTags(tags = []) {

    if (!tags.length) {
        return "";
    }


    return `

        <div
            class="article-tags"
            aria-label="Article topics"
        >

            ${tags.map(tag => `

                <span class="article-tag">
                    ${escapeHTML(tag)}
                </span>

            `).join("")}

        </div>

    `;

}


/* =========================================================
   ARTICLE RENDERER
========================================================= */

export function articleMarkup(article) {

    const imageSource =
        article.image
            ? resolveAsset(article.image.src)
            : "";


    const categoryName =
        getArticleCategoryName(
            article
        );


    /*
     * Hero images ship a WebP next to the PNG (same name). Browsers
     * that support WebP take the small file; the PNG stays as the
     * fallback and as the social-sharing image.
     */

    const webpSource =
        /\.png$/i.test(article.image?.src || "")
            ? resolveAsset(
                article.image.src.replace(/\.png$/i, ".webp")
            )
            : "";


    return `

        <div class="article-container">


            <!-- =========================================
                 BREADCRUMB
            ========================================== -->

            <div
                id="article-breadcrumb"
                class="article-breadcrumb"
            >${breadcrumbMarkup(article)}</div>


            <!-- =========================================
                 ARTICLE HERO
            ========================================== -->

            <header class="article-hero">

                <div class="article-hero-content">


                    <span class="article-category">
                        ${escapeHTML(
                            categoryName
                        )}
                    </span>


                    <h1 class="article-title">
                        ${escapeHTML(
                            article.title || ""
                        )}
                    </h1>


                    ${
                        article.introduction
                            ? `
                                <p class="article-introduction">
                                    ${escapeHTML(
                                        article.introduction
                                    )}
                                </p>
                            `
                            : ""
                    }


                    <!-- =================================
                         ARTICLE META
                    ================================== -->

                    <div
                        class="article-meta"
                        aria-label="Article information"
                    >


                        <div class="article-meta-item">

                            <span
                                class="article-meta-icon"
                                aria-hidden="true"
                            >
                                ${icon("calendar")}
                            </span>

                            <span>
                                ${escapeHTML(
                                    article.datePublished ||
                                    "Updated recently"
                                )}
                            </span>

                        </div>


                        <div
                            class="article-meta-divider"
                            aria-hidden="true"
                        >
                            •
                        </div>


                        <div class="article-meta-item">

                            <span
                                class="article-meta-icon"
                                aria-hidden="true"
                            >
                                ${icon("clock")}
                            </span>

                            <span>
                                ${escapeHTML(
                                    article.readTime ||
                                    "5 min read"
                                )}
                            </span>

                        </div>


                        <div
                            class="article-meta-divider"
                            aria-hidden="true"
                        >
                            •
                        </div>


                        <div class="article-meta-item">

                            <span
                                class="article-meta-icon"
                                aria-hidden="true"
                            >
                                ${icon("author")}
                            </span>

                            <span>
                                By
                                ${escapeHTML(
                                    article.author?.name ||
                                    "ToolZen Hub"
                                )}
                            </span>

                        </div>


                    </div>


                    ${renderTags(article.tags)}


                </div>


                <!-- =====================================
                     HERO IMAGE
                ====================================== -->

                ${
                    imageSource
                        ? `
                            <figure
                                class="article-hero-image"
                            >

                                ${webpSource
                                    ? `<picture>

                                    <source
                                        type="image/webp"
                                        srcset="${escapeHTML(
                                            webpSource
                                        )}"
                                    >

                                <img
                                    src="${escapeHTML(
                                        imageSource
                                    )}"
                                    alt="${escapeHTML(
                                        article.image?.alt ||
                                        ""
                                    )}"
                                    width="800"
                                    height="450"
                                    fetchpriority="high"
                                >

                                </picture>`
                                    : `<img
                                    src="${escapeHTML(
                                        imageSource
                                    )}"
                                    alt="${escapeHTML(
                                        article.image?.alt ||
                                        ""
                                    )}"
                                    width="800"
                                    height="450"
                                    fetchpriority="high"
                                >`}

                            </figure>
                        `
                        : ""
                }


            </header>


            <!-- =========================================
                 ARTICLE CONTENT
            ========================================== -->

            <div class="article-layout">


                <article class="article">

                    ${renderArticleContent(
                        article
                    )}

                </article>


            </div>


        </div>

    `;

}


/* =========================================================
   BREADCRUMB
========================================================= */

export function articleBreadcrumbItems(article) {

    const categoryName =
        getArticleCategoryName(
            article
        );


    return [

            {
                label: "Articles",
                href: ROUTES.articles
            },

            {
                label:
                    categoryName,

                href:
                    ROUTES.articleCategory(
                        article.category
                    )
            },

            {
                label:
                    article.title ||
                    ""
            }

        ];

}


function breadcrumbMarkup(article) {

    return renderBreadcrumb(
        articleBreadcrumbItems(article)
    );

}
