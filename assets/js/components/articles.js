/* =========================================================
   ToolZen Hub
   Latest Articles Component
========================================================= */

export function renderArticles() {

    const articles = document.getElementById("latest-articles");

    if (!articles) {
        return;
    }


    /* =====================================================
       Latest Articles
    ===================================================== */

    articles.innerHTML = `

        <section class="articles-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Latest Articles
                    </h2>

                    <a
                        href="#"
                        class="section-link"
                    >
                        View all articles
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="articles-grid">


                    <!-- Article 1 -->

                    <a
                        href="#"
                        class="article-card"
                    >

                        <div class="article-card__image">

                            <img
                                src="assets/Images/article-financial-planning.jpg"
                                alt="Financial planning and calculator"
                                loading="lazy"
                            >

                        </div>


                        <div class="article-card__content">

                            <div class="article-card__category">
                                Finance
                            </div>


                            <h3 class="article-card__title">
                                How to Plan Your Finances Smarter
                            </h3>


                            <p class="article-card__description">
                                Simple ways to understand your
                                money, savings and financial goals.
                            </p>


                            <div class="article-card__footer">

                                <span class="article-card__read">
                                    Read article
                                </span>

                                <span
                                    class="article-card__arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>

                        </div>

                    </a>


                    <!-- Article 2 -->

                    <a
                        href="#"
                        class="article-card"
                    >

                        <div class="article-card__image">

                            <img
                                src="assets/Images/article-investment.jpg"
                                alt="Investment growth and savings"
                                loading="lazy"
                            >

                        </div>


                        <div class="article-card__content">

                            <div class="article-card__category">
                                Investment
                            </div>


                            <h3 class="article-card__title">
                                SIP vs Lump Sum: Which Is Better?
                            </h3>


                            <p class="article-card__description">
                                Understand the difference between
                                SIP and lump-sum investing.
                            </p>


                            <div class="article-card__footer">

                                <span class="article-card__read">
                                    Read article
                                </span>

                                <span
                                    class="article-card__arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>

                        </div>

                    </a>


                    <!-- Article 3 -->

                    <a
                        href="#"
                        class="article-card"
                    >

                        <div class="article-card__image">

                            <img
                                src="assets/Images/article-loan.jpg"
                                alt="Loan and EMI planning"
                                loading="lazy"
                            >

                        </div>


                        <div class="article-card__content">

                            <div class="article-card__category">
                                Loans
                            </div>


                            <h3 class="article-card__title">
                                How to Reduce Your Loan Interest
                            </h3>


                            <p class="article-card__description">
                                Learn practical ways to compare
                                loans and reduce interest costs.
                            </p>


                            <div class="article-card__footer">

                                <span class="article-card__read">
                                    Read article
                                </span>

                                <span
                                    class="article-card__arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>

                        </div>

                    </a>

                </div>

            </div>

        </section>
    `;
}
