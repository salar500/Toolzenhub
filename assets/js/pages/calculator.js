/* =========================================================
   ToolZen Hub
   Calculator Page Controller
========================================================= */

const calculatorRegistry = {

    "loan-comparison": () =>
        import("../../../loans/loan-comparison/index.jss")

};


/* =========================================================
   Load Calculator
========================================================= */

export async function renderCalculator(slug) {

    const loader = calculatorRegistry[slug];

    if (!loader) {

        console.error(
            `Calculator not found: ${slug}`
        );

        renderCalculatorNotFound();

        return;

    }

    try {

        const module = await loader();

        if (
            typeof module.render !== "function"
        ) {

            console.error(
                `Calculator "${slug}" does not export render().`
            );

            renderCalculatorNotFound();

            return;

        }

        module.render();

    } catch (error) {

        console.error(
            `Failed to load calculator "${slug}":`,
            error
        );

        renderCalculatorError();

    }

}


/* =========================================================
   Calculator Not Found
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
   Calculator Loading Error
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
