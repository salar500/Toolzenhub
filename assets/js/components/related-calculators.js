/* =========================================================
   ToolZen Hub
   Related Calculators Component
========================================================= */


/* =========================================================
   RENDER RELATED CALCULATORS
========================================================= */

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

            href:
                "/Toolzenhub/calculators/emi/"
        },

        {
            slug: "home-loan",

            icon: "⌂",

            title: "Home Loan Calculator",

            description:
                "Calculate home loan EMI and interest.",

            href:
                "/Toolzenhub/calculators/home-loan/"
        },

        {
            slug: "personal-loan",

            icon: "♙",

            title: "Personal Loan Calculator",

            description:
                "Calculate personal loan payments.",

            href:
                "/Toolzenhub/calculators/personal-loan/"
        },

        {
            slug: "loan-eligibility",

            icon: "▤",

            title: "Loan Eligibility Calculator",

            description:
                "Check how much loan you may qualify for.",

            href:
                "/Toolzenhub/calculators/loan-eligibility/"
        },

        {
            slug: "prepayment",

            icon: "₹",

            title: "Prepayment Calculator",

            description:
                "Estimate savings from prepayment.",

            href:
                "/Toolzenhub/calculators/prepayment/"
        },

        {
            slug: "interest",

            icon: "%",

            title: "Interest Calculator",

            description:
                "Calculate simple and compound interest.",

            href:
                "/Toolzenhub/calculators/interest/"
        }

    ];


    /* =====================================================
       REMOVE CURRENT CALCULATOR
    ===================================================== */

    const relatedCalculators =
        calculators.filter(
            calculator =>
                calculator.slug !== currentSlug
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return `

        <section class="loan-related-section">

            <div class="loan-section-heading">

                <h2>
                    Related Calculators
                </h2>

                <a href="/Toolzenhub/calculators/">
                    View all →
                </a>

            </div>


            <div class="loan-related-grid">

                ${relatedCalculators.map(
                    calculator => `

                    <a
                        href="${calculator.href}"
                        class="loan-related-card"
                    >

                        <div class="loan-related-icon">
                            ${calculator.icon}
                        </div>

                        <div>

                            <strong>
                                ${calculator.title}
                            </strong>

                            <span>
                                ${calculator.description}
                            </span>

                        </div>

                    </a>

                `).join("")}

            </div>

        </section>

    `;

}
