/* =========================================================
   ToolZen Hub
   Categories + Popular Calculators Component
========================================================= */

import {
    ROUTES
} from "../routes.js";


import {
    getCalculatorById
} from "../data/calculators.js";


/* =========================================================
   POPULAR CALCULATORS (home page presentation)

   Which tools are featured and in what order is a presentation
   choice, kept here and referencing catalog tool ids. Whether a
   tool is clickable, and where it links, comes from the
   calculator catalog (status / href), never from this list:
   a coming-soon tool always renders as a non-clickable card.
   `title`, `blurb`, `icon` and `color` are card copy.
========================================================= */

const POPULAR_CALCULATORS = [
    { id: "loan-comparison", title: "Loan Comparison", blurb: "Compare loans side by side", icon: "⚖", color: "green" },
    { id: "emi", title: "EMI Calculator", blurb: "Calculate your EMI instantly", icon: "▣", color: "blue" },
    { id: "sip", title: "SIP Calculator", blurb: "Plan your SIP investments", icon: "♜", color: "yellow" },
    { id: "gst", title: "GST Calculator", blurb: "Calculate GST easily and accurately", icon: "▤", color: "purple" },
    { id: "home-loan", title: "Home Loan Calculator", blurb: "Calculate your home loan eligibility", icon: "⌂", color: "pink" },
    { id: "bmi", title: "BMI Calculator", blurb: "Check your body mass index", icon: "♙", color: "teal" }
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
    const popular = document.getElementById("popular-calculators");

    if (!categories || !popular) {
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


                <div class="category-grid">


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


                    <!-- More -->

                    <a
                        href="${ROUTES.categories}#more"
                        class="category-card"
                    >

                        <div class="category-card__icon category-card__icon--more">
                            ▦
                        </div>

                        <div class="category-card__content">

                            <h3>
                                More
                            </h3>

                            <p>
                                Explore all
                                ToolZen Hub tools
                            </p>

                        </div>

                    </a>

                </div>

            </div>

        </section>
    `;


    /* =====================================================
       Popular Calculators
    ===================================================== */

    popular.innerHTML = `

        <section class="popular-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Popular Calculators
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


                    ${POPULAR_CALCULATORS.map(renderPopularCard).join("")}

                </div>

            </div>

        </section>
    `;
}
