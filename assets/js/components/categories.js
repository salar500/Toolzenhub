/* =========================================================
   ToolZen Hub
   Categories + Popular Calculators Component
========================================================= */

import {
    ROUTES
} from "../routes.js";


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


                    <!-- Loan Comparison -->

                    <a
                        href="${ROUTES.calculator("loan-comparison")}"
                        class="calculator-card"
                    >

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

                    <a
                        href="${ROUTES.calculator("emi")}"
                        class="calculator-card"
                    >

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

                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >

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

                            <span class="coming-soon-badge">Coming soon</span>

                        </div>

                    </div>


                    <!-- GST -->

                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >

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

                            <span class="coming-soon-badge">Coming soon</span>

                        </div>

                    </div>


                    <!-- Home Loan -->

                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >

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

                            <span class="coming-soon-badge">Coming soon</span>

                        </div>

                    </div>


                    <!-- BMI -->

                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >

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

                            <span class="coming-soon-badge">Coming soon</span>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    `;
}
