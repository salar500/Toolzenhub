/* =========================================================
ToolZen Hub
Article Sidebar

This file is controlled by:

articleRenderer.js

It handles ONLY the article sidebar.
========================================================= */


/* =========================================================
ROUTES
========================================================= */

import {
    ROUTES
} from "../../routes.js";


/* =========================================================
UTILITY
========================================================= */

function escapeHTML(
    value = ""
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
ICON
========================================================= */

function icon(
    type
) {

    const icons = {

        calculator: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <rect
                    x="5"
                    y="3"
                    width="14"
                    height="18"
                    rx="2"
                />

                <path
                    d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h8"
                />
            </svg>
        `,


        list: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M8 6h12M8 12h12M8 18h12"
                />

                <circle
                    cx="4"
                    cy="6"
                    r="1"
                />

                <circle
                    cx="4"
                    cy="12"
                    r="1"
                />

                <circle
                    cx="4"
                    cy="18"
                    r="1"
                />
            </svg>
        `

    };


    return icons[type] || "";

}


/* =========================================================
SIDEBAR TABLE OF CONTENTS
========================================================= */

function renderTableOfContents(
    items = []
) {

    if (!items.length) {

        return "";

    }


    return `

        <section
            class="article-toc"
            aria-labelledby="article-toc-title"
        >

            <div class="article-toc-heading">

                <span
                    class="article-toc-icon"
                    aria-hidden="true"
                >
                    ${icon("list")}
                </span>


                <h2 id="article-toc-title">
                    Table of Contents
                </h2>

            </div>


            <nav
                aria-label="Article sections"
            >

                ${items.map(
                    (item, index) => `

                        <a
                            href="#${escapeHTML(item.id)}"
                            class="${
                                index === 0
                                    ? "is-active"
                                    : ""
                            }"
                        >

                            <span>
                                ${escapeHTML(
                                    item.label
                                )}
                            </span>


                            <span aria-hidden="true">
                                →
                            </span>

                        </a>

                    `
                ).join("")}

            </nav>

        </section>

    `;

}


/* =========================================================
SIDEBAR CALCULATOR
========================================================= */

function renderSidebarCalculator(
    calculator
) {

    if (!calculator) {

        return "";

    }


    const href =
        ROUTES.calculator(
            calculator.slug
        );


    return `

        <section
            class="article-sidebar-widget article-sidebar-calculator"
            aria-labelledby="sidebar-calculator-title"
        >

            <div class="article-sidebar-widget-heading">

                <span
                    class="article-sidebar-widget-icon"
                    aria-hidden="true"
                >
                    ${icon("calculator")}
                </span>


                <div>

                    <h2 id="sidebar-calculator-title">
                        ${escapeHTML(
                            calculator.title
                        )}
                    </h2>


                    <p>
                        Compare your loan options
                    </p>

                </div>

            </div>


            <div class="article-sidebar-calculator-fields">

                <div>

                    <span>
                        Loan Amount
                    </span>


                    <strong>
                        ₹40,00,000
                    </strong>

                </div>


                <div>

                    <span>
                        Interest Rate
                    </span>


                    <strong>
                        8.5%
                    </strong>

                </div>


                <div>

                    <span>
                        Tenure
                    </span>


                    <strong>
                        20 Years
                    </strong>

                </div>

            </div>


            <a
                href="${escapeHTML(href)}"
                class="article-sidebar-button"
            >

                Calculate Now


                <span aria-hidden="true">
                    →
                </span>

            </a>

        </section>

    `;

}


/* =========================================================
SIDEBAR RELATED ARTICLES
========================================================= */

function renderSidebarRelated(
    articles = []
) {

    if (!articles.length) {

        return "";

    }


    return `

        <section
            class="article-sidebar-widget article-sidebar-related"
            aria-labelledby="sidebar-related-title"
        >

            <h2 id="sidebar-related-title">
                Related Articles
            </h2>


            <div
                class="article-sidebar-related-list"
            >

                ${articles.slice(0, 4).map(
                    article => `

                        <a
                            href="${escapeHTML(
                                ROUTES.article(
                                    article.topic,
                                    article.slug
                                )
                            )}"
                            class="article-sidebar-related-item"
                        >

                            <span
                                class="article-sidebar-related-category"
                            >
                                ${escapeHTML(
                                    article.category
                                )}
                            </span>


                            <h3>
                                ${escapeHTML(
                                    article.title
                                )}
                            </h3>


                            <span
                                class="article-sidebar-related-link"
                            >
                                Read article →
                            </span>

                        </a>

                    `
                ).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
SIDEBAR AUTHOR
========================================================= */

function renderSidebarAuthor(
    article
) {

    return `

        <section
            class="article-sidebar-widget article-author-widget"
            aria-labelledby="article-author-title"
        >

            <div
                class="article-author-profile-avatar"
                aria-hidden="true"
            >
                TZ
            </div>


            <h2 id="article-author-title">

                ${escapeHTML(
                    article.author?.name ||
                    "ToolZen Hub"
                )}

            </h2>


            <p>
                Helpful finance guides, calculators
                and practical explanations designed
                to make everyday financial decisions
                easier to understand.
            </p>

        </section>

    `;

}


/* =========================================================
MAIN SIDEBAR CONTROLLER

articleRenderer.js calls this function.

This function controls the order of every
sidebar component.
========================================================= */

export function renderSidebar(
    article
) {

    return `

        <aside class="article-sidebar">


            ${renderTableOfContents(
                article.tableOfContents
            )}


            ${renderSidebarCalculator(
                article.calculator
            )}


            ${renderSidebarRelated(
                article.relatedArticles
            )}


            ${renderSidebarAuthor(
                article
            )}


        </aside>

    `;

}
