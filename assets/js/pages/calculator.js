/* =========================================================
   ToolZen Hub
   Calculator Page Controller
========================================================= */


import {
    calculatorRegistry
} from "../calculator-registry.js";


import {
    renderRelatedCalculators
} from "../components/related-calculators.js";


import {
    renderRelatedArticles
} from "../components/related-articles.js";


/* =========================================================
   LOAD CALCULATOR
========================================================= */

export async function renderCalculator(slug) {


    const loader =
        calculatorRegistry[slug];


    /* =====================================================
       CALCULATOR NOT FOUND
    ===================================================== */

    if (!loader) {

        console.error(
            `Calculator not found: ${slug}`
        );

        renderCalculatorNotFound();

        return;

    }


    /* =====================================================
       LOAD CALCULATOR MODULE
    ===================================================== */

    try {


        const module =
            await loader();


        /* =================================================
           CHECK RENDER FUNCTION
        ================================================= */

        if (
            typeof module.render !== "function"
        ) {

            console.error(
                `Calculator "${slug}" does not export render().`
            );

            renderCalculatorNotFound();

            return;

        }


        /* =================================================
           RENDER CALCULATOR
        ================================================= */

        module.render();


        /* =================================================
           GET APP
        ================================================= */

        const app =
            document.getElementById("app");


        if (!app) {
            return;
        }


        /* =================================================
           RELATED CALCULATORS
        ================================================= */

        if (
            module.showRelatedCalculators !== false
        ) {

            app.insertAdjacentHTML(
                "beforeend",
                renderRelatedCalculators(slug)
            );

        }


        /* =================================================
           RELATED ARTICLES
        ================================================= */

        if (
            module.showRelatedArticles !== false
        ) {

            app.insertAdjacentHTML(
                "beforeend",
                renderRelatedArticles(slug)
            );

        }


    } catch (error) {


        console.error(
            `Failed to load calculator "${slug}":`,
            error
        );


        renderCalculatorError();

    }

}


/* =========================================================
   CALCULATOR NOT FOUND
========================================================= */

function renderCalculatorNotFound() {


    const app =
        document.getElementById("app");


    if (!app) {
        return;
    }


    app.innerHTML = `

        <section class="calculator-error">

            <h1>Calculator Not Found</h1>

            <p>
                The calculator you're looking for
                doesn't exist.
            </p>

        </section>

    `;

}


/* =========================================================
   CALCULATOR LOADING ERROR
========================================================= */

function renderCalculatorError() {


    const app =
        document.getElementById("app");


    if (!app) {
        return;
    }


    app.innerHTML = `

        <section class="calculator-error">

            <h1>Something went wrong</h1>

            <p>
                We couldn't load this calculator.
                Please try again.
            </p>

        </section>

    `;

}
