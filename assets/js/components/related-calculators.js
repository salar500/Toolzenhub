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


/* =========================================================
   CALCULATOR INFORMATION
========================================================= */

const calculatorInfo = {


    /* =====================================================
       LOANS
    ===================================================== */

    "loan-comparison": {
        icon: "⇄",
        title: "Loan Comparison Calculator",
        description:
            "Compare two loans side by side."
    },


    "emi": {
        icon: "▦",
        title: "EMI Calculator",
        description:
            "Calculate your monthly loan EMI."
    },


    "home-loan": {
        icon: "⌂",
        title: "Home Loan Calculator",
        description:
            "Calculate home loan EMI and interest."
    },


    "personal-loan": {
        icon: "♙",
        title: "Personal Loan Calculator",
        description:
            "Calculate personal loan payments."
    },


    "loan-eligibility": {
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description:
            "Check how much loan you may qualify for."
    },


    "prepayment": {
        icon: "₹",
        title: "Prepayment Calculator",
        description:
            "Estimate savings from prepayment."
    },


    "interest": {
        icon: "%",
        title: "Interest Calculator",
        description:
            "Calculate simple and compound interest."
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
     * Find calculators belonging to the same category.
     */

    const relatedCalculators =
        Object.entries(calculatorMetadata)
            .filter(
                ([slug, metadata]) =>
                    metadata.category === category &&
                    slug !== currentSlug
            )
            .map(
                ([slug]) => ({
                    slug,
                    ...calculatorInfo[slug]
                })
            )
            .filter(
                calculator =>
                    calculator.title
            )
            .slice(0, 6);


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
