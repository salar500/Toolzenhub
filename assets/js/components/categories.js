/* =========================================================
   ToolZen Hub
   Categories + Popular Calculators Component
========================================================= */

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
                        href="categories.html"
                        class="section-link"
                    >
                        View all categories
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="category-grid">


                    <!-- Loans -->

                    <a href="loans.html" class="category-card">

                        <div class="category-card__icon category-card__icon--loans">
                            🏠
                        </div>

                        <div class="category-card__content">

                            <h3>Loans</h3>

                            <p>
                                EMI, Home Loan, Personal
                                Loan and more
                            </p>

                        </div>

                    </a>


                    <!-- Investment -->

                    <a href="investment.html" class="category-card">

                        <div class="category-card__icon category-card__icon--investment">
                            📈
                        </div>

                        <div class="category-card__content">

                            <h3>Investment</h3>

                            <p>
                                SIP, PPF, FD, CAGR
                                and more
                            </p>

                        </div>

                    </a>


                    <!-- Tax -->

                    <a href="tax.html" class="category-card">

                        <div class="category-card__icon category-card__icon--tax">
                            🧾
                        </div>

                        <div class="category-card__content">

                            <h3>Tax</h3>

                            <p>
                                Income Tax, GST
                                and more
                            </p>

                        </div>

                    </a>


                    <!-- Health -->

                    <a href="health.html" class="category-card">

                        <div class="category-card__icon category-card__icon--health">
                            ♥
                        </div>

                        <div class="category-card__content">

                            <h3>Health</h3>

                            <p>
                                BMI, Calorie, BMR
                                and more
                            </p>

                        </div>

                    </a>


                    <!-- Business -->

                    <a href="business.html" class="category-card">

                        <div class="category-card__icon category-card__icon--business">
                            💼
                        </div>

                        <div class="category-card__content">

                            <h3>Business</h3>

                            <p>
                                Profit, Margin, ROI
                                and more
                            </p>

                        </div>

                    </a>


                    <!-- Math -->

                    <a href="math.html" class="category-card">

                        <div class="category-card__icon category-card__icon--math">
                            🔢
                        </div>

                        <div class="category-card__content">

                            <h3>Math</h3>

                            <p>
                                Percentage, Ratio,
                                Age and more
                            </p>

                        </div>

                    </a>


                    <!-- Converter -->

                    <a href="converter.html" class="category-card">

                        <div class="category-card__icon category-card__icon--converter">
                            ↻
                        </div>

                        <div class="category-card__content">

                            <h3>Converter</h3>

                            <p>
                                Unit, Currency,
                                Date and more
                            </p>

                        </div>

                    </a>


                    <!-- More -->

                    <a href="categories.html" class="category-card">

                        <div class="category-card__icon category-card__icon--more">
                            ▦
                        </div>

                        <div class="category-card__content">

                            <h3>More</h3>

                            <p>
                                Explore all
                                calculators
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
                        href="#"
                        class="section-link"
                    >
                        View all calculators
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="calculator-grid">


                    <!-- Loan Comparison -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--green">
                            ⚖
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                Loan Comparison
                            </h3>

                            <p>
                                Compare loans side
                                by side
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>


                    <!-- EMI -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--blue">
                            ▣
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                EMI Calculator
                            </h3>

                            <p>
                                Calculate your EMI
                                instantly
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>


                    <!-- SIP -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--yellow">
                            ♜
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                SIP Calculator
                            </h3>

                            <p>
                                Plan your SIP
                                investments
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>


                    <!-- GST -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--purple">
                            ▤
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                GST Calculator
                            </h3>

                            <p>
                                Calculate GST easily
                                and accurately
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>


                    <!-- Home Loan -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--pink">
                            ⌂
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                Home Loan Calculator
                            </h3>

                            <p>
                                Calculate your home
                                loan eligibility
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>


                    <!-- BMI -->

                    <a href="#" class="calculator-card">

                        <div class="calculator-card__icon calculator-card__icon--teal">
                            ♙
                        </div>

                        <div class="calculator-card__content">

                            <h3>
                                BMI Calculator
                            </h3>

                            <p>
                                Check your body
                                mass index
                            </p>

                        </div>

                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </a>

                </div>

            </div>

        </section>
    `;
}
