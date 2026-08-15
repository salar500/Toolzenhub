export function renderRelatedCalculators() {

    const calculators = [

        {
            icon: "▦",
            title: "EMI Calculator",
            description: "Calculate your monthly loan EMI.",
            href: "/Toolzenhub/calculators/emi/"
        },

        {
            icon: "⌂",
            title: "Home Loan Calculator",
            description: "Calculate home loan EMI and interest.",
            href: "/Toolzenhub/calculators/home-loan/"
        },

        {
            icon: "♙",
            title: "Personal Loan Calculator",
            description: "Calculate personal loan payments.",
            href: "/Toolzenhub/calculators/personal-loan/"
        },

        {
            icon: "▤",
            title: "Loan Eligibility Calculator",
            description: "Check how much loan you may qualify for.",
            href: "/Toolzenhub/calculators/loan-eligibility/"
        },

        {
            icon: "₹",
            title: "Prepayment Calculator",
            description: "Estimate savings from prepayment.",
            href: "/Toolzenhub/calculators/prepayment/"
        },

        {
            icon: "%",
            title: "Interest Calculator",
            description: "Calculate simple and compound interest.",
            href: "/Toolzenhub/calculators/interest/"
        }

    ];


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

                ${calculators.map(item => `

                    <a
                        href="${item.href}"
                        class="loan-related-card"
                    >

                        <div class="loan-related-icon">
                            ${item.icon}
                        </div>

                        <div>

                            <strong>
                                ${item.title}
                            </strong>

                            <span>
                                ${item.description}
                            </span>

                        </div>

                    </a>

                `).join("")}

            </div>

        </section>

    `;

}


export function renderRelatedArticles() {

    const articles = [

        {
            title: "How to Reduce Your Home Loan Interest",
            description:
                "Practical ways to reduce your overall borrowing cost."
        },

        {
            title: "EMI vs Total Interest: What Should You Compare?",
            description:
                "Why EMI alone doesn't tell the complete story."
        },

        {
            title: "Fixed vs Floating Interest Rates",
            description:
                "Understand the difference before choosing a loan."
        },

        {
            title: "How Loan Tenure Affects Total Interest",
            description:
                "See why a longer tenure can increase borrowing cost."
        },

        {
            title: "What Is Loan Prepayment?",
            description:
                "Understand how prepayment can reduce interest."
        },

        {
            title: "How to Choose the Right Loan Tenure",
            description:
                "Balance monthly affordability with total cost."
        }

    ];


    return `

        <section class="loan-related-section">

            <div class="loan-section-heading">

                <h2>
                    Related Articles
                </h2>

                <a href="/Toolzenhub/articles/">
                    View all →
                </a>

            </div>


            <div class="loan-articles-grid">

                ${articles.map(article => `

                    <article class="loan-article-card">

                        <div class="loan-article-image">
                            Finance
                        </div>

                        <div class="loan-article-content">

                            <h3>
                                ${article.title}
                            </h3>

                            <p>
                                ${article.description}
                            </p>

                        </div>

                    </article>

                `).join("")}

            </div>

        </section>

    `;

}
