/* =========================================================
   ToolZen Hub
   Related Articles Component
========================================================= */


/* =========================================================
   RENDER RELATED ARTICLES
========================================================= */

export function renderRelatedArticles(
    currentSlug = ""
) {

    const articles = [

        {
            slug: "reduce-home-loan-interest",

            title:
                "How to Reduce Your Home Loan Interest",

            description:
                "Practical ways to reduce your overall borrowing cost."
        },

        {
            slug: "emi-vs-total-interest",

            title:
                "EMI vs Total Interest: What Should You Compare?",

            description:
                "Why EMI alone doesn't tell the complete story."
        },

        {
            slug: "fixed-vs-floating-interest-rates",

            title:
                "Fixed vs Floating Interest Rates",

            description:
                "Understand the difference before choosing a loan."
        },

        {
            slug: "loan-tenure-total-interest",

            title:
                "How Loan Tenure Affects Total Interest",

            description:
                "See why a longer tenure can increase borrowing cost."
        },

        {
            slug: "loan-prepayment",

            title:
                "What Is Loan Prepayment?",

            description:
                "Understand how prepayment can reduce interest."
        },

        {
            slug: "choose-right-loan-tenure",

            title:
                "How to Choose the Right Loan Tenure",

            description:
                "Balance monthly affordability with total cost."
        }

    ];


    /* =====================================================
       CURRENT ARTICLE / CALCULATOR RESERVED FOR FUTURE USE
    ===================================================== */

    const relatedArticles =
        articles.filter(
            article =>
                article.slug !== currentSlug
        );


    /* =====================================================
       RENDER
    ===================================================== */

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

                ${relatedArticles.map(
                    article => `

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
