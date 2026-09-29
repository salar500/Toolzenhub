/* =========================================================
   Related Articles
========================================================= */

export function renderRelatedArticles() {

    const articles = [

        {
            image:
                "/Toolzenhub/assets/Images/articles/how-to-reduce-home-loan-interest.png",

            title:
                "How to Reduce Your Home Loan Interest",

            description:
                "Practical ways to reduce your overall borrowing cost."
        },


        {
            image:
                "/Toolzenhub/assets/Images/articles/emi-vs-total-interest.png",

            title:
                "EMI vs Total Interest: What Should You Compare?",

            description:
                "Why EMI alone doesn't tell the complete story."
        },


        {
            image:
                "/Toolzenhub/assets/Images/articles/fixed-vs-floating-interest-rate.png",

            title:
                "Fixed vs Floating Interest Rates",

            description:
                "Understand the difference before choosing a loan."
        },


        {
            image:
                "/Toolzenhub/assets/Images/articles/loan-tenure-total-interest.png",

            title:
                "How Loan Tenure Affects Total Interest",

            description:
                "See why a longer tenure can increase borrowing cost."
        },


        {
            image:
                "/Toolzenhub/assets/Images/articles/what-is-loan-prepayment.png",

            title:
                "What Is Loan Prepayment?",

            description:
                "Understand how prepayment can reduce interest."
        },


        {
            image:
                "/Toolzenhub/assets/Images/articles/loan-tenure-total-interest.png",

            title:
                "How to Choose the Right Loan Tenure",

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


                <a href="${ROUTES.articles}">
                    View all →
                </a>

            </div>


            <div class="loan-articles-grid">

                ${articles.map(article => `

                    <article class="loan-article-card">

                        <div class="loan-article-image">

                            <img
                                src="${article.image}"
                                alt="${article.title}"
                                loading="lazy"
                            >

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
