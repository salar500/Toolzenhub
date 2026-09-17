/* =========================================================
   ToolZen Hub
   Article Content Renderer

   CHILD MODULE

   Handles:
   - Table of Contents
   - Key Takeaways
   - Article sections
   - Examples
   - Bigger Picture
   - Things to Consider
   - Calculator CTA
   - FAQ
   - Related Articles
========================================================= */

import { ROUTES } from "../../routes.js";


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
   ICONS
========================================================= */

function icon(type) {

    const icons = {

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
                <path d="M8 7h8"/>
                <path d="M8 11h2"/>
                <path d="M14 11h2"/>
                <path d="M8 15h2"/>
                <path d="M14 15h2"/>
                <path d="M8 18h8"/>
            </svg>
        `,

        list: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M8 6h12"/>
                <path d="M8 12h12"/>
                <path d="M8 18h12"/>

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
   TABLE OF CONTENTS
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

                ${items.map((item, index) => `

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

                `).join("")}

            </nav>

        </section>

    `;

}


/* =========================================================
   KEY TAKEAWAYS
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

                ${takeaways.map(item => `

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

                `).join("")}

            </ul>

        </section>

    `;

}


/* =========================================================
   ARTICLE SECTIONS
========================================================= */

function renderSections(
    sections = []
) {

    if (!sections.length) {
        return "";
    }


    return sections.map(section => `

        <section
            class="article-section"
            aria-labelledby="${escapeHTML(
                section.id
            )}"
        >

            <h2 id="${escapeHTML(section.id)}">
                ${escapeHTML(
                    section.heading || ""
                )}
            </h2>


            ${(section.paragraphs || [])
                .map(paragraph => `
                    <p>
                        ${escapeHTML(paragraph)}
                    </p>
                `)
                .join("")}

        </section>

    `).join("");

}


/* =========================================================
   EXAMPLE
========================================================= */

function renderExample(example) {

    if (!example) {
        return "";
    }


    return `

        <section
            class="article-example"
            aria-labelledby="article-example-title"
        >

            <h2 id="article-example-title">
                ${escapeHTML(
                    example.heading || "Example"
                )}
            </h2>


            ${(example.paragraphs || [])
                .map(paragraph => `
                    <p>
                        ${escapeHTML(paragraph)}
                    </p>
                `)
                .join("")}

        </section>

    `;

}


/* =========================================================
   BIGGER PICTURE
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
                →
            </div>


            <div>

                <h2 id="article-bigger-picture-title">
                    ${escapeHTML(
                        biggerPicture.heading ||
                        "The Bigger Picture"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        biggerPicture.text || ""
                    )}
                </p>

            </div>

        </section>

    `;

}


/* =========================================================
   THINGS TO CONSIDER
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

            <div class="article-section-heading">

                <span class="article-section-kicker">
                    Before You Decide
                </span>

                <h2 id="article-considerations-title">
                    Things to Consider
                </h2>

            </div>


            <ul>

                ${considerations.map((item, index) => `

                    <li>

                        <span
                            class="article-consideration-number"
                            aria-hidden="true"
                        >
                            ${index + 1}
                        </span>

                        <span class="article-consideration-text">
                            ${escapeHTML(item)}
                        </span>

                    </li>

                `).join("")}

            </ul>

        </section>

    `;

}


/* =========================================================
   CALCULATOR CTA
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
                        calculator.description || ""
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
   FAQ
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

            <div class="article-section-heading">

                <span class="article-section-kicker">
                    Common Questions
                </span>

                <h2 id="article-faq-title">
                    Frequently Asked Questions
                </h2>

            </div>


            <div class="article-faq-list">

                ${faq.map((item, index) => `

                    <details
                        class="article-faq-item"
                    >

                        <summary>

                            <span class="article-faq-question">
                                ${escapeHTML(
                                    item.question
                                )}
                            </span>

                            <span
                                class="article-faq-toggle"
                                aria-hidden="true"
                            >
                                <span class="faq-plus">
                                    +
                                </span>

                                <span class="faq-minus">
                                    −
                                </span>
                            </span>

                        </summary>


                        <div class="article-faq-answer">

                            <p>
                                ${escapeHTML(
                                    item.answer
                                )}
                            </p>

                        </div>

                    </details>

                `).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
   RELATED ARTICLES
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
                    Explore more practical guides
                    from ToolZen Hub.
                </p>

            </div>


            <div class="article-related-grid">

                ${articles.map(article => `

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
                                article.category || ""
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                article.title || ""
                            )}
                        </h3>


                        <span
                            class="article-related-link"
                        >
                            Read article →
                        </span>

                    </a>

                `).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
   MAIN CONTENT FUNCTION
========================================================= */

export function renderArticleContent(
    article
) {

    return `

        <!-- =========================================
             TABLE OF CONTENTS
        ========================================== -->

        ${renderTableOfContents(
            article.tableOfContents
        )}


        <!-- =========================================
             KEY TAKEAWAYS
        ========================================== -->

        ${renderKeyTakeaways(
            article.keyTakeaways
        )}


        <div class="article-content">


            <!-- =====================================
                 ARTICLE SECTIONS
            ====================================== -->

            ${renderSections(
                article.sections
            )}


            <!-- =====================================
                 EXAMPLE
            ====================================== -->

            ${renderExample(
                article.example
            )}


            <!-- =====================================
                 BIGGER PICTURE
            ====================================== -->

            ${renderBiggerPicture(
                article.biggerPicture
            )}


            <!-- =====================================
                 THINGS TO CONSIDER
            ====================================== -->

            ${renderConsiderations(
                article.considerations
            )}


            <!-- =====================================
                 SINGLE CALCULATOR LINK
            ====================================== -->

            ${renderCalculator(
                article.calculator
            )}


            <!-- =====================================
                 FAQ
            ====================================== -->

            ${renderFAQ(
                article.faq
            )}


            <!-- =====================================
                 RELATED ARTICLES
            ====================================== -->

            ${renderRelatedArticles(
                article.relatedArticles
            )}

        </div>

    `;

}
