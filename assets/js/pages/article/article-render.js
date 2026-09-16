/* =========================================================
ToolZen Hub
Article Renderer

Main article page renderer.

This file controls:

- Article hero
- Breadcrumb
- Metadata
- Tags
- Key takeaways
- Article sections
- Example
- Bigger picture
- Things to consider
- Calculator CTA
- FAQ
- Sidebar
- Related articles

Sidebar rendering is controlled by:
./articleSidebar.js
========================================================= */


/* =========================================================
CENTRAL ROUTES
========================================================= */

import {
    ROUTES
} from "../../routes.js";


/* =========================================================
BREADCRUMB
========================================================= */

import {
    renderBreadcrumb
} from "../../components/breadcrumb.js";


/* =========================================================
SIDEBAR CONTROLLER
========================================================= */

import {
    renderSidebar
} from "./articleSidebar.js";


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
SITE ROOT
========================================================= */

function getSiteRoot() {

    return (
        window.location.hostname ===
        "salar500.github.io"

            ? "/Toolzenhub/"

            : "/"
    );

}


/* =========================================================
RESOLVE ASSET
========================================================= */

function resolveAsset(
    source
) {

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

        source.replace(
            /^\/+/,
            ""
        ),

        window.location.origin +
        getSiteRoot()

    ).href;

}


/* =========================================================
ICON
========================================================= */

function icon(
    type
) {

    const icons = {

        calendar: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/>
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
        `,

        check: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M5 12l4 4L19 6"/>
            </svg>
        `,

        info: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />
                <path d="M12 10v6M12 7h.01"/>
            </svg>
        `,

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
                <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h8"/>
            </svg>
        `,

        list: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M8 6h12M8 12h12M8 18h12"/>
                <circle cx="4" cy="6" r="1"/>
                <circle cx="4" cy="12" r="1"/>
                <circle cx="4" cy="18" r="1"/>
            </svg>
        `,

        arrow: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M5 12h13M13 6l6 6-6 6"/>
            </svg>
        `

    };


    return icons[type] || "";

}


/* =========================================================
RENDER TAGS
========================================================= */

function renderTags(
    tags = []
) {

    if (!tags.length) {

        return "";

    }


    return `

        <div
            class="article-tags"
            aria-label="Article topics"
        >

            ${tags.map(
                tag => `

                    <span class="article-tag">
                        ${escapeHTML(tag)}
                    </span>

                `
            ).join("")}

        </div>

    `;

}


/* =========================================================
RENDER KEY TAKEAWAYS
========================================================= */

function renderKeyTakeaways(
    takeaways = []
) {

    if (!takeaways.length) {

        return "";

    }


    return `

        <section
            class="article-key-takeaways"
            aria-labelledby="article-takeaways-title"
        >

            <div class="article-takeaways-heading">

                <div
                    class="article-takeaways-icon"
                    aria-hidden="true"
                >
                    ${icon("info")}
                </div>


                <h2 id="article-takeaways-title">
                    Key Takeaways
                </h2>

            </div>


            <ul>

                ${takeaways.map(
                    item => `

                        <li>

                            <span
                                class="article-check-icon"
                                aria-hidden="true"
                            >
                                ${icon("check")}
                            </span>


                            <span>
                                ${escapeHTML(item)}
                            </span>

                        </li>

                    `
                ).join("")}

            </ul>

        </section>

    `;

}


/* =========================================================
RENDER ARTICLE SECTIONS
========================================================= */

function renderSections(
    sections = []
) {

    return sections.map(
        section => `

            <section
                class="article-section"
                aria-labelledby="${escapeHTML(section.id)}"
            >

                <h2 id="${escapeHTML(section.id)}">
                    ${escapeHTML(section.heading)}
                </h2>


                ${(section.paragraphs || []).map(
                    paragraph => `

                        <p>
                            ${escapeHTML(paragraph)}
                        </p>

                    `
                ).join("")}

            </section>

        `
    ).join("");

}


/* =========================================================
RENDER EXAMPLE
========================================================= */

function renderExample(
    example
) {

    if (!example) {

        return "";

    }


    return `

        <section
            class="article-example"
            aria-labelledby="article-example-title"
        >

            <h2 id="article-example-title">
                ${escapeHTML(example.heading)}
            </h2>


            ${(example.paragraphs || []).map(
                paragraph => `

                    <p>
                        ${escapeHTML(paragraph)}
                    </p>

                `
            ).join("")}

        </section>

    `;

}


/* =========================================================
RENDER BIGGER PICTURE
========================================================= */

function renderBiggerPicture(
    biggerPicture
) {

    if (!biggerPicture) {

        return "";

    }


    return `

        <section
            class="article-bigger-picture"
            aria-labelledby="article-bigger-picture-title"
        >

            <div
                class="article-bigger-picture-icon"
                aria-hidden="true"
            >
                ${icon("arrow")}
            </div>


            <div>

                <h2 id="article-bigger-picture-title">
                    ${escapeHTML(
                        biggerPicture.heading
                    )}
                </h2>


                <p>
                    ${escapeHTML(
                        biggerPicture.text
                    )}
                </p>

            </div>

        </section>

    `;

}


/* =========================================================
RENDER CONSIDERATIONS
========================================================= */

function renderConsiderations(
    considerations = []
) {

    if (!considerations.length) {

        return "";

    }


    return `

        <section
            class="article-considerations"
            aria-labelledby="article-considerations-title"
        >

            <h2 id="article-considerations-title">
                Things to Consider
            </h2>


            <ul>

                ${considerations.map(
                    item => `

                        <li>

                            <span
                                aria-hidden="true"
                            >
                                ${icon("check")}
                            </span>


                            <span>
                                ${escapeHTML(item)}
                            </span>

                        </li>

                    `
                ).join("")}

            </ul>

        </section>

    `;

}


/* =========================================================
RENDER CALCULATOR CTA
========================================================= */

function renderCalculator(
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
            class="article-calculator"
            aria-labelledby="article-calculator-title"
        >

            <div class="article-calculator-visual">

                <div
                    class="article-calculator-icon-large"
                    aria-hidden="true"
                >
                    ${icon("calculator")}
                </div>

            </div>


            <div class="article-calculator-content">

                <span class="article-calculator-label">
                    ToolZen Hub Calculator
                </span>


                <h2 id="article-calculator-title">
                    Compare Your Loan Options
                </h2>


                <p>
                    ${escapeHTML(
                        calculator.description
                    )}
                </p>

            </div>


            <a
                class="article-calculator-button"
                href="${escapeHTML(href)}"
            >

                Compare Loans

                <span aria-hidden="true">
                    →
                </span>

            </a>

        </section>

    `;

}


/* =========================================================
RENDER FAQ
========================================================= */

function renderFAQ(
    faq = []
) {

    if (!faq.length) {

        return "";

    }


    return `

        <section
            class="article-faq"
            aria-labelledby="article-faq-title"
        >

            <div class="article-content-section-heading">

                <span class="article-section-kicker">
                    Common Questions
                </span>


                <h2 id="article-faq-title">
                    Frequently Asked Questions
                </h2>

            </div>


            <div class="article-faq-list">

                ${faq.map(
                    item => `

                        <details
                            class="article-faq-item"
                        >

                            <summary>

                                <span>
                                    ${escapeHTML(
                                        item.question
                                    )}
                                </span>


                                <span
                                    class="article-faq-plus"
                                    aria-hidden="true"
                                >
                                    +
                                </span>

                            </summary>


                            <div
                                class="article-faq-answer"
                            >

                                <p>
                                    ${escapeHTML(
                                        item.answer
                                    )}
                                </p>

                            </div>

                        </details>

                    `
                ).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
RENDER RELATED ARTICLES
========================================================= */

function renderRelatedArticles(
    articles = []
) {

    if (!articles.length) {

        return "";

    }


    return `

        <section
            class="article-related"
            aria-labelledby="article-related-title"
        >

            <div class="article-section-heading">

                <span class="article-section-kicker">
                    Continue Reading
                </span>


                <h2 id="article-related-title">
                    Related Articles
                </h2>


                <p>
                    Explore more practical guides from ToolZen Hub.
                </p>

            </div>


            <div class="article-related-grid">

                ${articles.map(
                    article => `

                        <a
                            href="${escapeHTML(
                                ROUTES.article(
                                    article.topic,
                                    article.slug
                                )
                            )}"
                            class="article-related-card"
                        >

                            <span
                                class="article-related-category"
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
                                class="article-related-link"
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
RENDER ARTICLE
========================================================= */

export function renderArticle(
    article
) {

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {

        return;

    }


    const imageSource =
        article.image
            ? resolveAsset(
                article.image.src
            )
            : "";


    app.innerHTML = `

        <div class="article-container">


            <!-- ==========================================
                 BREADCRUMB
            =========================================== -->

            <div
                id="article-breadcrumb"
                class="article-breadcrumb"
            ></div>


            <!-- ==========================================
                 PREMIUM ARTICLE HERO
            =========================================== -->

            <header class="article-hero">

                <div class="article-hero-content">


                    <span class="article-category">
                        ${escapeHTML(
                            article.category
                        )}
                    </span>


                    <h1 class="article-title">
                        ${escapeHTML(
                            article.title
                        )}
                    </h1>


                    <p class="article-introduction">
                        ${escapeHTML(
                            article.introduction
                        )}
                    </p>


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


                        <div class="article-meta-divider">
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


                        <div class="article-meta-divider">
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

                  
