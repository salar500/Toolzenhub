/* =========================================================
   ToolZen Hub
   Related Calculators Component
========================================================= */

import {
    ROUTES
} from "../routes.js";


export function renderRelatedCalculators(
    currentSlug = ""
) {

    const calculators = [

        {
            slug: "emi",
            icon: "▦",
            title: "EMI Calculator",
            description:
                "Calculate your monthly loan EMI.",
            href: ROUTES.calculator("emi")
        },

        {
            slug: "home-loan",
            icon: "⌂",
            title: "Home Loan Calculator",
            description:
                "Calculate home loan EMI and interest.",
            href: ROUTES.calculator("home-loan")
        },

        {
            slug: "personal-loan",
            icon: "♙",
            title: "Personal Loan Calculator",
            description:
                "Calculate personal loan payments.",
            href: ROUTES.calculator("personal-loan")
        },

        {
            slug: "loan-eligibility",
            icon: "▤",
            title: "Loan Eligibility Calculator",
            description:
                "Check how much loan you may qualify for.",
            href: ROUTES.calculator("loan-eligibility")
        },

        {
            slug: "prepayment",
            icon: "₹",
            title: "Prepayment Calculator",
            description:
                "Estimate savings from prepayment.",
            href: ROUTES.calculator("prepayment")
        },

        {
            slug: "interest",
            icon: "%",
            title: "Interest Calculator",
            description:
                "Calculate simple and compound interest.",
            href: ROUTES.calculator("interest")
        }

    ];


    const filteredCalculators =
        calculators.filter(
            calculator =>
                calculator.slug !== currentSlug
        );


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

                ${filteredCalculators.map(
                    calculator => `

                    <a
                        href="${calculator.href}"
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
