/* =========================================================
   ToolZen Hub
   Tool Page Messages

   The shared "not found" and "error" states of a tool page.
========================================================= */

export const TOOL_MOUNT_SELECTOR =
    "#app";


/* =========================================================
   NOT FOUND
========================================================= */

export function renderToolNotFound() {

    renderToolMessage(
        "Calculator Not Found",
        `The calculator you're looking for
                doesn't exist.`
    );

}


/* =========================================================
   ERROR
========================================================= */

export function renderToolError() {

    renderToolMessage(
        "Something went wrong",
        `We couldn't load this calculator.
                Please try again.`
    );

}


function renderToolMessage(
    heading,
    text
) {

    const app =
        document.querySelector(
            TOOL_MOUNT_SELECTOR
        );


    if (!app) {
        return;
    }


    app.innerHTML = `

        <section class="calculator-error">

            <h1>
                ${heading}
            </h1>

            <p>
                ${text}
            </p>

        </section>

    `;

}
