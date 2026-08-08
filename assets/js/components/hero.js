/* =========================================================
   ToolZen Hub
   Global / Home Hero Component
========================================================= */

export function renderHero() {

    const hero = document.getElementById("hero");

    if (!hero) {
        return;
    }

    hero.innerHTML = `

        <section class="hero">

            <div class="hero__background"></div>

            <div class="container">

                <div class="hero__grid">


                    <!-- =====================================
                         Hero Content
                    ====================================== -->

                    <div class="hero__content">

                        <div class="hero__eyebrow">

                            <span>100% Free</span>

                            <span class="hero__dot">•</span>

                            <span>Accurate</span>

                            <span class="hero__dot">•</span>

                            <span>Easy to Use</span>

                        </div>


                        <h1 class="hero__title">

                            Smart Financial &

                            <span class="hero__title-highlight">
                                Everyday Calculators
                            </span>

                        </h1>


                        <p class="hero__description">

                            Calculate, compare and plan better for a
                            smarter life.

                        </p>


                        <!-- Search -->

                        <form
                            class="hero__search"
                            id="calculator-search"
                            role="search"
                        >

                            <span
                                class="hero__search-icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>


                            <input
                                type="search"
                                name="q"
                                placeholder="Search calculators..."
                                autocomplete="off"
                                aria-label="Search calculators"
                            >


                            <button
                                type="submit"
                                class="hero__search-button"
                                aria-label="Search calculators"
                            >
                                ⌕
                            </button>

                        </form>

                    </div>


                    <!-- =====================================
                         Hero Visual
                    ====================================== -->

                    <div class="hero__visual">

                        <img
                            src="assets/images/hero-calculator.png"
                            alt="Financial calculators, charts and money"
                            class="hero__image"
                        >

                    </div>

                </div>

            </div>

        </section>
    `;
}
