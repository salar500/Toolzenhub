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
         * Render calculator first.
         */

        module.render();


        /*
         * Special calculators can manage
         * their own related content.
         *
         * Loan Comparison is one such calculator.
         */

        if (
            module.showRelatedCalculators === false &&
            module.showRelatedArticles === false
        ) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * Related content must be inserted
         * INSIDE the calculator page container.
         *
         * Otherwise it becomes full-width.
         */

        const calculatorPage =
            document.querySelector(
                "#app .calculator-page"
            );


        if (!calculatorPage) {

            console.warn(
                "Calculator page container not found."
            );

            return;
        }


        /*
         * Related Calculators
         */

        if (
            module.showRelatedCalculators !== false
        ) {

            calculatorPage.insertAdjacentHTML(
                "beforeend",
                renderRelatedCalculators(slug)
            );

        }


        /*
         * Related Articles
         */

        if (
            module.showRelatedArticles !== false
        ) {

            calculatorPage.insertAdjacentHTML(
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
   NOT FOUND
========================================================= */

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


/* =========================================================
   ERROR
========================================================= */

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
