/* =========================================================
   ToolZen Hub
   Global / Home Hero Component
========================================================= */

import { ROUTES } from "../routes.js";
import { iconSvg } from "../ui/icons.js";
import { heroArt } from "./hero-art.js";


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

                    <div class="hero__content">

                        <div class="hero__eyebrow">

                            <span>100% Free</span>

                            <span class="hero__dot">•</span>

                            <span>No sign-up</span>

                            <span class="hero__dot">•</span>

                            <span>Works in your browser</span>

                        </div>


                        <h1 class="hero__title">

                            Practical tools for

                            <span class="hero__title-highlight">
                                better everyday decisions
                            </span>

                        </h1>


                        <p class="hero__description">

                            Calculate loan payments, plan investments and
                            work through GST, margin and percentage
                            questions, then use the time, developer,
                            image, PDF and AI tools, all in your browser.

                        </p>


                        <div class="hero__actions">

                            <a class="btn btn-primary hero__cta" href="${ROUTES.tools}">
                                Browse all tools
                            </a>

                            <a class="btn hero__cta hero__cta--secondary" href="${ROUTES.calculators}">
                                Explore calculators
                            </a>

                        </div>


                        <!-- =================================
                             Calculator Search
                        ================================== -->

                        <form
                            class="hero__search tz-search"
                            id="calculator-search"
                            role="search"
                            novalidate
                        >

                            <span
                                class="hero__search-icon tz-search__icon"
                                aria-hidden="true"
                            >
                                ${iconSvg("search")}
                            </span>


                            <input
                                type="search"
                                class="tz-search__input"
                                name="q"
                                placeholder="Search tools..."
                                autocomplete="off"
                                aria-label="Search tools"
                            >


                            <button
                                type="submit"
                                class="hero__search-button tz-search__button"
                                aria-label="Search tools"
                            >
                                ${iconSvg("search")}
                            </button>

                        </form>


                        <div
                            id="hero-calculator-search-results"
                            class="calculator-search-results"
                            aria-live="polite"
                        ></div>

                    </div>

                    <div class="hero__visual">
                        ${heroArt()}
                    </div>

                </div>

            </div>

        </section>
    `;


    /* =====================================================
       CALCULATOR SEARCH
       Home Hero → All Tools search
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
               Open All Tools With the Search Query
            ============================================= */

            window.location.href =
                `${ROUTES.tools}?q=${encodeURIComponent(query)}`;

        }
    );

}
