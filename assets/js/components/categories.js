/* =========================================================
   ToolZen Hub
   Home page: Browse Categories + Featured Tools
========================================================= */

import {
    ROUTES
} from "../routes.js";


import {
    getCalculatorById
} from "../data/calculators.js";


/* =========================================================
   FEATURED TOOLS (home page presentation)

   A CURATED short list of live tools, not a ranking: the site has
   no usage data, so it does not say "popular". Which tools are
   featured and in what order is a presentation choice, kept here
   and referencing catalog tool ids. It spans the live categories
   rather than listing one category's tools. Whether a tool is
   clickable, and where it links, comes from the calculator
   catalog (status / href), never from this list: a coming-soon
   tool would always render as a non-clickable card, so only live
   tools belong here.
   `title`, `blurb`, `icon` and `color` are card copy.
========================================================= */

const FEATURED_TOOLS = [
    { id: "emi", title: "EMI Calculator", blurb: "Calculate your EMI instantly", icon: "▣", color: "blue" },
    { id: "sip", title: "SIP Calculator", blurb: "Plan your SIP investments", icon: "♜", color: "yellow" },
    { id: "gst", title: "GST Calculator", blurb: "Add or remove GST on an invoice", icon: "▤", color: "purple" },
    { id: "margin", title: "Margin Calculator", blurb: "Set a price from a target margin", icon: "%", color: "green" },
    { id: "fd", title: "FD Calculator", blurb: "Compare fixed deposit maturities", icon: "◈", color: "teal" },
    { id: "home-loan", title: "Home Loan Calculator", blurb: "Find the loan that fits your EMI budget", icon: "⌂", color: "pink" }
];


function renderPopularCard(card) {

    const tool = getCalculatorById(card.id);
    const available = Boolean(tool?.available);

    const body = `
                        <div class="calculator-card__icon calculator-card__icon--${card.color}">
                            ${card.icon}
                        </div>
                        <div class="calculator-card__content">
                            <h3>
                                ${card.title}
                            </h3>
                            <p>
                                ${card.blurb}
                            </p>${available ? "" : `
                            <span class="coming-soon-badge">Coming soon</span>`}
                        </div>`;

    if (!available) {
        return `
                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >${body}
                    </div>`;
    }

    return `
                    <a
                        href="${tool.href}"
                        class="calculator-card"
                    >${body}
                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </a>`;

}


export function renderCategories() {

    const categories = document.getElementById("categories");
    const featured = document.getElementById("popular-calculators");   // the section keeps its id

    if (!categories || !featured) {
        return;
    }


    /* =====================================================
       Browse Categories
    ===================================================== */

    categories.innerHTML = `

        <section class="categories-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Browse Categories
                    </h2>

                    <a
                        href="${ROUTES.calculatorCategories}"
                        class="section-link"
                    >
                        View all categories
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <!-- one major section today, so one card; the modifier lets it be a readable width instead of an eighth of the row (drop it when a second section exists) -->
                <div class="category-grid category-grid--single">


                    <!-- Calculators -->

                    <a
                        href="${ROUTES.calculatorCategories}"
                        class="category-card"
                    >

                        <div class="category-card__icon category-card__icon--calculators">
                            🧮
                        </div>

                        <div class="category-card__content">

                            <h3>
                                Calculators
                            </h3>

                            <p>
                                Loans, Investment, Tax,
                                Health, Math and more
                            </p>

                        </div>

                    </a>

                </div>

            </div>

        </section>
    `;


    /* =====================================================
       Featured Tools
    ===================================================== */

    featured.innerHTML = `

        <section class="popular-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Featured Tools
                    </h2>

                    <a
                        href="${ROUTES.calculators}"
                        class="section-link"
                    >
                        View all calculators
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="calculator-grid">


                    ${FEATURED_TOOLS.map(renderPopularCard).join("")}

                </div>

            </div>

        </section>
    `;
}
