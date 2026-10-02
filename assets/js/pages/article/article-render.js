/* =========================================================
   ToolZen Hub
   Article Renderer

   MAIN CONTROLLER

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
   RENDER ARTICLE (browser)

   Pages generated by the site build already contain the
   article markup; this renders it into a page that does not.
========================================================= */

export function renderArticle(article) {

    const app =
        document.getElementById("app");


    if (!app) {

        console.error(
            "ToolZen Hub: #app element was not found."
        );

        return;
    }


    app.innerHTML =
        articleMarkup(article);

    bindArticleInteractions();

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


export function initializeBreadcrumb(article) {

    const breadcrumb =
        document.getElementById(
            "article-breadcrumb"
        );


    if (!breadcrumb) {
        return;
    }


    breadcrumb.innerHTML =
        breadcrumbMarkup(article);

}


/* =========================================================
   TABLE OF CONTENTS CLICK HANDLER

   In article-interactions.js: it is the only script an
   article page needs, so a generated page loads just that.
========================================================= */

export {
    bindArticleInteractions
} from "./article-interactions.js";

import {
    bindArticleInteractions
} from "./article-interactions.js";
