/* =========================================================
   ToolZen Hub
   Related Calculators Component
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    calculatorMetadata
} from "../calculator-registry.js";

import {
    getCalculatorById
} from "../data/calculators.js";

import {
    getRelatedTools
} from "../data/relationships.js";


/* =========================================================
   RELATED-CARD COPY (presentation)

   Tool identity (title, category, availability, route) comes
   from the calculator catalog. The compact icon and one-line
   blurb used on these small cards are presentation copy that
   differs from the catalog's listing copy, so they stay here,
   keyed by tool id. A tool without an entry falls back to its
   catalog icon and description.
========================================================= */

const RELATED_CARD_COPY = {

    "loan-comparison": {
        icon: "⇄",
        description:
            "Compare two loans side by side."
    },

    "emi": {
        icon: "▦",
        description:
            "Calculate your monthly loan EMI."
    }

};


/* =========================================================
   RENDER RELATED CALCULATORS
========================================================= */

export function renderRelatedCalculators(
    currentSlug = ""
) {


    /*
     * Find the category of the current calculator.
     */

    const currentCalculator =
        calculatorMetadata[currentSlug];


    const category =
        currentCalculator?.category;


    /*
     * If the calculator has no category,
     * don't render the section.
     */

    if (!category) {
        return "";
    }


    /*
     * Curated related tools first, then the rest of the
     * tool's category (data/relationships.js).
     */

    const relatedCalculators =
        getRelatedTools(
            currentSlug,
            { limit: 6 }
        )
            .map(
                tool => {
                    const copy =
                        RELATED_CARD_COPY[tool.id] || {};
                    return {
                        slug: tool.id,
                        icon:
                            copy.icon ?? tool.icon,
                        title: tool.title,
                        description:
                            copy.description ??
                            tool.description
                    };
                }
            )
            .filter(
                calculator =>
                    calculator.title
            );


    /*
     * Don't render an empty section.
     */

    if (!relatedCalculators.length) {
        return "";
    }


    return `

        <section class="related-section">

            <div class="related-section__heading">

                <h2>
                    Related Calculators
                </h2>

                <a
                    href="${ROUTES.calculators}"
                >
                    View all →
                </a>

            </div>


            <div class="related-calculators-grid">

                ${relatedCalculators.map(
                    calculator => `

                    <a
                        href="${ROUTES.calculator(
                            calculator.slug
                        )}"
                        class="related-calculator-card"
                    >

                        <div class="related-calculator-icon">
                            ${calculator.icon}
                        </div>


                        <div class="related-calculator-content">

                            <strong>
                                ${calculator.title}
                            </strong>

                            <span>
                                ${calculator.description}
                            </span>

                        </div>

                    </a>

                `
                ).join("")}

            </div>

        </section>

    `;

}
