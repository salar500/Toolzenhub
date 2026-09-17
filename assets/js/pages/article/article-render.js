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
   SITE ROOT
========================================================= */

function getSiteRoot() {

    return window.location.hostname === "salar500.github.io"
        ? "/Toolzenhub/"
        : "/";

}


/* =========================================================
   ASSET RESOLVER
========================================================= */

function resolveAsset(source) {

    if (!source) {
        return "";
    }


    if (
        source.startsWith("http://") ||
        source.startsWith("https://")
    ) {
        return source;
    }


    return new URL(
        source.replace(/^\/+/, ""),
        window.location.origin + getSiteRoot()
    ).href;

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

export function renderArticle(article) {

    const app =
        document.getElementById("app");


    if (!app) {

        console.error(
            "ToolZen Hub: #app element was not found."
        );

        return;
    }


    const imageSource =
        article.image
            ? resolveAsset(article.image.src)
            : "";


    app.innerHTML = `

        <div class="article-container">


            <!-- =========================================
                 BREADCRUMB
            ========================================== -->

            <div
                id="article-breadcrumb"
                class="article-breadcrumb"
            ></div>


            <!-- =========================================
                 ARTICLE HERO
            ========================================== -->

            <header class="article-hero">

                <div class="article-hero-content">


                    <span class="article-category">
                        ${escapeHTML(
                            article.category ||
                            "Finance"
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


    initializeBreadcrumb(article);

}


/* =========================================================
   BREADCRUMB
========================================================= */

export function initializeBreadcrumb(article) {

    const breadcrumb =
        document.getElementById(
            "article-breadcrumb"
        );


    if (!breadcrumb) {
        return;
    }


    breadcrumb.innerHTML =
        renderBreadcrumb([

            {
                label: "Articles",
                href: ROUTES.articles
            },

            {
                label:
                    article.category ||
                    "Articles"
            },

            {
                label:
                    article.title ||
                    ""
            }

        ]);

}


/* =========================================================
   TABLE OF CONTENTS CLICK HANDLER
========================================================= */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                ".article-toc a"
            );


        if (!link) {
            return;
        }


        const links =
            document.querySelectorAll(
                ".article-toc a"
            );


        links.forEach(item => {

            item.classList.remove(
                "is-active"
            );

        });


        link.classList.add(
            "is-active"
        );

    }
);
