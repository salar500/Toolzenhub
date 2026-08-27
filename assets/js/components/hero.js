/* =========================================================
   ToolZen Hub
   Global / Home Hero Component
========================================================= */

export function renderHero() {

    const hero = document.getElementById("hero");

    if (!hero) {
        return;
    }


    /* =====================================================
       HERO HTML
    ===================================================== */

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


                        <!-- =================================
                             Calculator Search
                        ================================== -->

                        <form
                            class="hero__search"
                            id="calculator-search"
                            role="search"
                            novalidate
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


                        <!-- =================================
                             Search Results
                        ================================== -->

                        <div
                            id="hero-calculator-search-results"
                            class="calculator-search-results"
                            aria-live="polite"
                        ></div>

                    </div>


                    <!-- =====================================
                         Hero Visual
                    ====================================== -->

                    <div class="hero__visual">

                        <img
                            src="/Toolzenhub/assets/Images/hero-calculators.png"
                            alt="Financial calculators, charts and money"
                            class="hero__image"
                            loading="eager"
                        >

                    </div>

                </div>

            </div>

        </section>
    `;


    /* =====================================================
       CALCULATOR SEARCH
       Home Hero → Shared Calculator Search
    ===================================================== */

    const searchForm =
        hero.querySelector("#calculator-search");


    const searchInput =
        searchForm?.querySelector('input[name="q"]');


    if (!searchForm || !searchInput) {
        return;
    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    searchForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const query =
                searchInput.value.trim();


            /* =============================================
               Empty Search
            ============================================= */

            if (!query) {

                searchInput.focus();

                return;
            }


            /* =============================================
               Send Calculator Search Event
            ============================================= */

            document.dispatchEvent(
                new CustomEvent(
                    "toolzen:calculator-search",
                    {
                        detail: {
                            query
                        }
                    }
                )
            );

        }
    );


    /* =====================================================
       ENTER KEY / LIVE SEARCH SUPPORT
    ===================================================== */

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value.trim();


            document.dispatchEvent(
                new CustomEvent(
                    "toolzen:calculator-search",
                    {
                        detail: {
                            query
                        }
                    }
                )
            );

        }
    );

}
