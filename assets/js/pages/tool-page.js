/* =========================================================
   ToolZen Hub
   Shared Tool Page

   Owns everything around a tool, never the tool itself.

   Shared (this file):
   - loading the tool module on demand
   - the tool mount (#app)
   - breadcrumb placement (first child of the page wrapper)
   - related tools and related articles (last children)
   - the "not found" and "error" states

   Tool-specific (the tool module):
   - its heading / intro, inputs, results and info sections
   - its own DOM, events and calculations

   TOOL MODULE CONTRACT

     export function render(mount)   REQUIRED
         Render the tool into the mount element (#app). The
         argument may be ignored; tools may also look up #app
         themselves. The tool's markup must be wrapped in
         <div class="calculator-page"> so the shared layer
         knows where to place the breadcrumb and related
         content.

     export const showRelatedCalculators = false   OPTIONAL
     export const showRelatedArticles = false      OPTIONAL
         Opt out of a related section (default: shown).

   A tool is addressed by id and described by metadata
   { section, category, title }, both supplied by the caller
   (today: the calculator catalog). Nothing here knows about
   EMI, loans or calculators in particular.
========================================================= */

import {
    renderToolBreadcrumb
} from "../components/breadcrumb.js";

import {
    renderRelatedCalculators
} from "../components/related-calculators.js";

import {
    renderRelatedArticles
} from "../components/related-articles.js";


export const TOOL_MOUNT_SELECTOR =
    "#app";

export const TOOL_PAGE_SELECTOR =
    "#app .calculator-page";


/* =========================================================
   CONTRACT
========================================================= */

/*
 * Reads a loaded tool module and returns its normalized
 * contract, or null when it does not satisfy it.
 */

export function readToolContract(
    module
) {

    if (
        !module ||
        typeof module.render !== "function"
    ) {

        return null;

    }


    return {

        render:
            module.render,

        showRelatedTools:
            module.showRelatedCalculators !== false,

        showRelatedArticles:
            module.showRelatedArticles !== false

    };

}


/* =========================================================
   RENDER TOOL PAGE
========================================================= */

/*
 * loader:   () => Promise<module>   (undefined if unknown)
 * metadata: { section, category, title }  (optional)
 */

export async function renderToolPage(
    id,
    {
        loader,
        metadata
    } = {}
) {

    if (!loader) {

        console.error(
            `Calculator not found: ${id}`
        );

        renderToolNotFound();

        return;
    }


    try {

        const module =
            await loader();


        const contract =
            readToolContract(module);


        if (!contract) {

            console.error(
                `Calculator "${id}" does not export render().`
            );

            renderToolNotFound();

            return;
        }


        /*
         * The tool renders its own content first.
         */

        contract.render(
            document.querySelector(
                TOOL_MOUNT_SELECTOR
            )
        );


        const page =
            document.querySelector(
                TOOL_PAGE_SELECTOR
            );


        if (!page) {

            console.warn(
                "Calculator page container not found."
            );

            return;
        }


        if (metadata) {

            page.insertAdjacentHTML(
                "afterbegin",
                renderToolBreadcrumb(metadata)
            );

        }


        if (contract.showRelatedTools) {

            page.insertAdjacentHTML(
                "beforeend",
                renderRelatedCalculators(id)
            );

        }


        if (contract.showRelatedArticles) {

            page.insertAdjacentHTML(
                "beforeend",
                renderRelatedArticles(id)
            );

        }


    } catch (error) {

        console.error(
            `Failed to load calculator "${id}":`,
            error
        );

        renderToolError();

    }

}


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
