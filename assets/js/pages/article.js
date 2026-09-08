/* =========================================================
   ToolZen Hub
   Individual Article Page Engine

   Purpose:
   Shared article renderer used by every article page.

   Handles:
   - Global Header
   - Global Footer
   - Newsletter
   - Breadcrumb
   - Article data rendering
   - Article sections
   - Example
   - Things to Consider
   - FAQ
   - Calculator CTA
   - Related Articles
   - Article SEO structured data
========================================================= */


/* =========================================================
   Global Components
========================================================= */

import {
    renderHeader
} from "../components/header.js";


import {
    renderFooter
} from "../components/footer.js";


import {
    renderBreadcrumb
} from "../components/breadcrumb.js";


import {
    initializeNewsletter
} from "../components/newsletter.js";


/* =========================================================
   Article Data

   The individual article page can provide its data module
   through window.ToolZenArticle before this engine loads.

   This keeps the engine reusable for every article.
========================================================= */


/* =========================================================
   Utility
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
   Render Article Sections
========================================================= */

function renderSections(
    sections = []
) {

    return sections.map(section => `

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

    `).join("");

}



/* =========================================================
   Render Example
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
   Render Considerations
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
                                ✓
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
   Render FAQ
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

            <h2 id="article-faq-title">
                Frequently Asked Questions
            </h2>


            ${faq.map(
                item => `

                    <details
                        class="article-faq-item"
                    >

                        <summary>
                            ${escapeHTML(item.question)}
                        </summary>


                        <div
                            class="article-faq-answer"
                        >

                            <p>
                                ${escapeHTML(item.answer)}
                            </p>

                        </div>

                    </details>

                `
            ).join("")}

        </section>

    `;

}



/* =========================================================
   Render Calculator CTA
========================================================= */

function renderCalculator(
    calculator
) {

    if (!calculator) {
        return "";
    }


    return `

        <section
            class="article-calculator"
            aria-labelledby="article-calculator-title"
        >

            <div class="article-calculator-content">

                <span>
                    ${escapeHTML(calculator.title)}
                </span>


                <h2 id="article-calculator-title">
                    Compare Your Loan Options
                </h2>


                <p>
                    ${escapeHTML(calculator.description)}
                </p>

            </div>


            <a
                class="article-calculator-button"
                href="${escapeHTML(calculator.href)}"
            >
                Compare Loans →
            </a>

        </section>

    `;

}



/* =========================================================
   Render Related Articles
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

                <h2 id="article-related-title">
                    Related Articles
                </h2>

            </div>


            <div class="article-related-grid">

                ${articles.map(
                    article => `

                        <a
                            href="${escapeHTML(article.href)}"
                            class="article-related-card"
                        >

                            <span class="article-related-category">
                                ${escapeHTML(article.category)}
                            </span>


                            <h3>
                                ${escapeHTML(article.title)}
                            </h3>


                            <span class="article-related-link">
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
   Render Sidebar
========================================================= */

function renderSidebar(
    article
) {

    const calculator =
        article.calculator;


    return `

        <aside class="article-sidebar">


            <!-- ==========================================
                 Popular Calculator
            =========================================== -->

            <section
                class="article-sidebar-widget"
                aria-labelledby="popular-calculators"
            >

                <h2 id="popular-calculators">
                    Popular Calculators
                </h2>


                ${
                    calculator
                        ? `

                            <div class="article-calculator-list">

                                <a
                                    href="${escapeHTML(calculator.href)}"
                                    class="article-calculator-item"
                                >

                                    <span
                                        class="article-calculator-icon"
                                        aria-hidden="true"
                                    >
                                        ⇄
                                    </span>


                                    <span>
                                        ${escapeHTML(calculator.title)}
                                    </span>


                                    <span aria-hidden="true">
                                        →
                                    </span>

                                </a>

                            </div>

                        `
                        : ""
                }

            </section>


            <!-- ==========================================
                 ToolZen Hub Editorial Profile
            =========================================== -->

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
                    ${escapeHTML(article.author?.name || "ToolZen Hub")}
                </h2>


                <p>
                    Helpful finance guides, calculators and practical
                    explanations designed to make everyday financial
                    decisions easier to understand.
                </p>

            </section>

        </aside>

    `;

}



/* =========================================================
   Render Article
========================================================= */

function renderArticle(
    article
) {

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {
        return;
    }


    app.innerHTML = `

        <div class="article-container">


            <!-- ==========================================
                 Breadcrumb
            =========================================== -->

            <div
                id="article-breadcrumb"
                class="article-breadcrumb"
            ></div>


            <!-- ==========================================
                 Article Layout
            =========================================== -->

            <div class="article-layout">


                <!-- ======================================
                     Main Article
                ======================================= -->

                <article class="article">


                    <!-- ==================================
                         Article Header
                    =================================== -->

                    <header class="article-header">

                        <span class="article-category">
                            ${escapeHTML(article.category)}
                        </span>


                        <h1 class="article-title">
                            ${escapeHTML(article.title)}
                        </h1>


                        <p class="article-introduction">
                            ${escapeHTML(article.introduction)}
                        </p>


                        <div
                            class="article-meta"
                            aria-label="Article information"
                        >

                            <div class="article-author">

                                <div
                                    class="article-author-avatar"
                                    aria-hidden="true"
                                >
                                    TZ
                                </div>


                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            article.author?.name ||
                                            "ToolZen Hub"
                                        )}
                                    </strong>


                                    <span>
                                        ${escapeHTML(
                                            article.author?.role ||
                                            "Finance & Calculator Guides"
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </header>


                    <!-- ==================================
                         Featured Image
                    =================================== -->

                    ${
                        article.image
                            ? `

                                <figure
                                    class="article-featured-image"
                                >

                                    <img
                                        src="${escapeHTML(article.image.src)}"
                                        alt="${escapeHTML(article.image.alt)}"
                                        width="800"
                                        height="450"
                                        fetchpriority="high"
                                    >

                                </figure>

                            `
                            : ""
                    }


                    <!-- ==================================
                         Article Content
                    =================================== -->

                    <div class="article-content">

                        ${renderSections(
                            article.sections
                        )}


                        ${renderExample(
                            article.example
                        )}


                        ${renderConsiderations(
                            article.considerations
                        )}


                        ${renderCalculator(
                            article.calculator
                        )}


                        ${renderFAQ(
                            article.faq
                        )}

                    </div>

                </article>


                <!-- ======================================
                     Sidebar
                ======================================= -->

                ${renderSidebar(article)}

            </div>


            <!-- ==========================================
                 Related Articles
            =========================================== -->

            ${renderRelatedArticles(
                article.relatedArticles
            )}

        </div>

    `;

}



/* =========================================================
   Render Breadcrumb
========================================================= */

function initializeBreadcrumb(
    article
) {

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
                href: "/Toolzenhub/articles.html"
            },

            {
                label: article.title
            }

        ]);

}



/* =========================================================
   Generate FAQ Schema
========================================================= */

function generateFAQSchema(
    article
) {

    if (
        !article.faq ||
        !article.faq.length
    ) {
        return;
    }


    const existing =
        document.querySelector(
            "#article-faq-schema"
        );


    if (existing) {
        existing.remove();
    }


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "FAQPage",

        "mainEntity":
            article.faq.map(item => ({

                "@type":
                    "Question",

                "name":
                    item.question,

                "acceptedAnswer": {

                    "@type":
                        "Answer",

                    "text":
                        item.answer

                }

            }))

    };


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "article-faq-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(schema);


    document.head.appendChild(
        script
    );

}



/* =========================================================
   Initialize Article Page
========================================================= */

export function initializeArticlePage(
    article
) {

    if (!article) {
        console.error(
            "ToolZen Hub: Article data was not provided."
        );

        return;
    }


    /* =====================================================
       Global Header
    ===================================================== */

    renderHeader();


    /* =====================================================
       Article
    ===================================================== */

    renderArticle(
        article
    );


    /* =====================================================
       Breadcrumb
    ===================================================== */

    initializeBreadcrumb(
        article
    );


    /* =====================================================
       FAQ Schema
    ===================================================== */

    generateFAQSchema(
        article
    );


    /* =====================================================
       Global Footer
    ===================================================== */

    renderFooter();


    /* =====================================================
       Newsletter
    ===================================================== */

    initializeNewsletter();

}



/* =========================================================
   Default Export
========================================================= */

export default {
    initializeArticlePage
};
