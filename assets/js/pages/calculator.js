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


export async function renderCalculator(slug) {

    const loader =
        calculatorRegistry[slug];

    if (!loader) {

        console.error(
            `Calculator not found: ${slug}`
        );

        renderCalculatorNotFound();

        return;
    }


    try {

        const module =
            await loader();


        if (
            typeof module.render !== "function"
        ) {

            console.error(
                `Calculator "${slug}" does not export render().`
            );

            renderCalculatorNotFound();

            return;
        }


        /*
         * Render the calculator itself first.
         */

        module.render();


        const app =
            document.getElementById("app");


        if (!app) {
            return;
        }


        /*
         * Some special calculators already contain
         * their own related content.
         *
         * Those calculators can disable the global
         * related sections by exporting:
         *
         * showRelatedCalculators = false
         * showRelatedArticles = false
         */


        if (
            module.showRelatedCalculators !== false
        ) {

            app.insertAdjacentHTML(
                "beforeend",
                renderRelatedCalculators(slug)
            );

        }


        if (
            module.showRelatedArticles !== false
        ) {

            app.insertAdjacentHTML(
                "beforeend",
                renderRelatedArticles()
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


function renderCalculatorNotFound() {

    const app =
        document.getElementById("app");


    if (!app) {
        return;
    }


    app.innerHTML = `

        <section class="calculator-error">

            <h1>
                Calculator Not Found
            </h1>

            <p>
                The calculator you're looking for
                doesn't exist.
            </p>

        </section>

    `;

}


function renderCalculatorError() {

    const app =
        document.getElementById("app");


    if (!app) {
        return;
    }


    app.innerHTML = `

        <section class="calculator-error">

            <h1>
                Something went wrong
            </h1>

            <p>
                We couldn't load this calculator.
                Please try again.
            </p>

        </section>

    `;

}
