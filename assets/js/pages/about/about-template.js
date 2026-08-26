/* =========================================================
   ToolZen Hub
   About Page Template
========================================================= */


/* =========================================================
   HERO / INTRO
========================================================= */

function renderAboutIntro() {

    return `

        <section class="about-intro">

            <div class="about-container">

                <nav
                    class="about-breadcrumb"
                    aria-label="Breadcrumb"
                >

                    <a href="index.html">
                        Home
                    </a>

                    <span aria-hidden="true">
                        →
                    </span>

                    <span>
                        About
                    </span>

                </nav>


                <div class="about-intro-content">

                    <span class="about-eyebrow">
                        About ToolZen Hub
                    </span>


                    <h1>
                        Smart Tools,
                        <span>Smarter You</span>
                    </h1>


                    <p>
                        ToolZen Hub is a growing collection of free
                        online calculators and practical tools designed
                        to make everyday calculations faster, simpler,
                        and easier to understand.
                    </p>


                    <p>
                        Whether you are planning your finances,
                        checking a health-related calculation,
                        working out a business figure, or simply
                        solving an everyday math problem, our goal
                        is to give you a useful tool without unnecessary
                        complexity.
                    </p>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   FEATURES
========================================================= */

function renderFeatures() {

    return `

        <section class="about-features-section">

            <div class="about-container">

                <div class="about-features">


                    <article class="about-feature-card">

                        <div class="about-feature-icon">

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                ></path>
                            </svg>

                        </div>


                        <h2>
                            Our Mission
                        </h2>


                        <p>
                            Make useful calculations simple,
                            accessible and easy to understand.
                        </p>

                    </article>


                    <article class="about-feature-card">

                        <div class="about-feature-icon">

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                                ></path>

                                <line
                                    x1="7"
                                    y1="7"
                                    x2="7.01"
                                    y2="7"
                                ></line>

                            </svg>

                        </div>


                        <h2>
                            Free to Use
                        </h2>


                        <p>
                            Our calculators and tools are designed
                            to be freely accessible to everyone.
                        </p>

                    </article>


                    <article class="about-feature-card">

                        <div class="about-feature-icon">

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                ></path>

                                <polyline
                                    points="22 4 12 14.01 9 11.01"
                                ></polyline>

                            </svg>

                        </div>


                        <h2>
                            Accuracy Matters
                        </h2>


                        <p>
                            We focus on clear formulas, sensible
                            inputs and reliable calculations.
                        </p>

                    </article>


                    <article class="about-feature-card">

                        <div class="about-feature-icon">

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="11"
                                    rx="2"
                                    ry="2"
                                ></rect>

                                <path
                                    d="M7 11V7a5 5 0 0 1 10 0v4"
                                ></path>

                            </svg>

                        </div>


                        <h2>
                            Privacy Conscious
                        </h2>


                        <p>
                            We aim to keep the experience simple
                            and respectful of your personal information.
                        </p>

                    </article>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   WHY TOOLZEN
========================================================= */

function renderWhySection() {

    return `

        <section class="about-content-section">

            <div class="about-container">

                <div class="about-content-card">

                    <div class="about-section-heading">

                        <span>
                            Why ToolZen Hub?
                        </span>

                        <h2>
                            Built for real-world calculations
                        </h2>

                        <p>
                            Many calculations are easier when the
                            right tool is available. ToolZen Hub brings
                            commonly needed calculators together so you
                            can get the result you need without searching
                            through complicated spreadsheets or formulas.
                        </p>

                    </div>


                    <div class="about-text-grid">

                        <div>

                            <h3>
                                Simple by design
                            </h3>

                            <p>
                                Enter your numbers, choose the relevant
                                options and get a clear result. Our goal
                                is to reduce unnecessary steps.
                            </p>

                        </div>


                        <div>

                            <h3>
                                Useful across everyday life
                            </h3>

                            <p>
                                From loan payments and investments to
                                percentages, conversions and health
                                calculations, our tools cover a wide
                                range of everyday needs.
                            </p>

                        </div>


                        <div>

                            <h3>
                                Designed for everyone
                            </h3>

                            <p>
                                You don't need advanced mathematical or
                                financial knowledge to use our tools.
                                We aim to keep the interface approachable.
                            </p>

                        </div>


                        <div>

                            <h3>
                                Continuously improving
                            </h3>

                            <p>
                                ToolZen Hub is intended to grow over
                                time with new calculators, improvements
                                and helpful educational content.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   WHAT WE OFFER
========================================================= */

function renderOfferSection() {

    return `

        <section class="about-offer-section">

            <div class="about-container">

                <div class="about-offer-card">

                    <div class="about-section-heading">

                        <span>
                            What We Offer
                        </span>

                        <h2>
                            A growing collection of useful tools
                        </h2>

                        <p>
                            ToolZen Hub brings different categories
                            of calculators together in one place.
                        </p>

                    </div>


                    <div class="about-category-grid">


                        <!-- =====================================
                             LOANS
                        ====================================== -->

                        <a
                            href="loans.html"
                            class="about-category"
                        >

                            <strong>
                                Loans
                            </strong>

                            <p>
                                EMI, Home Loan, Personal Loan
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             INVESTMENT
                        ====================================== -->

                        <a
                            href="investment.html"
                            class="about-category"
                        >

                            <strong>
                                Investment
                            </strong>

                            <p>
                                SIP, PPF, FD, CAGR
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             TAX
                        ====================================== -->

                        <a
                            href="categories.html#tax"
                            class="about-category"
                        >

                            <strong>
                                Tax
                            </strong>

                            <p>
                                Income Tax, GST
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             HEALTH
                        ====================================== -->

                        <a
                            href="categories.html#health"
                            class="about-category"
                        >

                            <strong>
                                Health & Fitness
                            </strong>

                            <p>
                                BMI, Calorie, BMR
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             BUSINESS
                        ====================================== -->

                        <a
                            href="categories.html#business"
                            class="about-category"
                        >

                            <strong>
                                Business
                            </strong>

                            <p>
                                Profit, Margin, ROI
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             MATH
                        ====================================== -->

                        <a
                            href="categories.html#math"
                            class="about-category"
                        >

                            <strong>
                                Math & Everyday
                            </strong>

                            <p>
                                Percentage, Ratio, Age
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             CONVERTER
                        ====================================== -->

                        <a
                            href="categories.html#converter"
                            class="about-category"
                        >

                            <strong>
                                Converter
                            </strong>

                            <p>
                                Unit, Currency, Date
                                and more.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                        <!-- =====================================
                             MORE
                        ====================================== -->

                        <a
                            href="categories.html#more"
                            class="about-category"
                        >

                            <strong>
                                More
                            </strong>

                            <p>
                                Explore all calculators
                                and useful tools.
                            </p>

                            <span class="about-category-arrow">
                                →
                            </span>

                        </a>


                    </div>


                    <!-- =====================================
                         ACTION
                    ====================================== -->

                    <div class="about-offer-action">

                        <a
                            href="categories.html"
                            class="about-primary-button"
                        >

                            Explore All Categories

                            <span aria-hidden="true">
                                →
                            </span>

                        </a>

                    </div>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   ACCURACY / DISCLAIMER
========================================================= */

function renderDisclaimer() {

    return `

        <section class="about-disclaimer-section">

            <div class="about-container">

                <div class="about-disclaimer">

                    <h2>
                        A note about calculator results
                    </h2>

                    <p>
                        ToolZen Hub calculators are provided for
                        informational and educational purposes.
                        Results may depend on the information entered,
                        assumptions used and applicable formulas.
                    </p>

                    <p>
                        Financial, tax and health-related calculations
                        should not be treated as professional advice.
                        When making important decisions, consider
                        consulting a qualified professional.
                    </p>

                </div>

            </div>

        </section>

    `;
}


/* =========================================================
   FINAL TEMPLATE
========================================================= */

export function renderAboutTemplate() {

    return `

        <div id="about-page">

            ${renderAboutIntro()}

            ${renderFeatures()}

            ${renderWhySection()}

            ${renderOfferSection()}

            ${renderDisclaimer()}

        </div>

    `;
}
