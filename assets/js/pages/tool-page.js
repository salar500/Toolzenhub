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

     export function markup()                      OPTIONAL
     export function init(mount)                   OPTIONAL
         The split form of render(): markup() returns the tool's
         HTML (pure, no DOM), init() binds it. The site build
         calls markup() to put the finished page in the HTML
         (buildToolPageHtml below); in the browser the shared
         page then calls only init(). A tool without them still
         works through render().

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

        markup:
            typeof module.markup === "function"
                ? module.markup
                : null,

        init:
            typeof module.init === "function"
                ? module.init
                : null,

        showRelatedTools:
            module.showRelatedCalculators !== false,

        showRelatedArticles:
            module.showRelatedArticles !== false

    };

}


/* =========================================================
   BUILD TOOL PAGE HTML (pure)

   The finished markup of a tool page: the tool's own markup
   with the shared breadcrumb as the first child of the page
   wrapper and the related sections as the last children, the
   same placement renderToolPage() uses in the browser.
   Used by the site build; returns "" if the module has no
   markup().
========================================================= */

const PAGE_OPEN =
    '<div class="calculator-page">';

export function buildToolPageHtml(
    id,
    module,
    metadata
) {

    const contract =
        readToolContract(module);

    if (!contract || !contract.markup) {
        return "";
    }

    let html =
        contract.markup();

    const open =
        html.indexOf(PAGE_OPEN);

    const close =
        html.lastIndexOf("</div>");

    if (open === -1 || close === -1) {
        return html;
    }

    const afterOpen =
        open + PAGE_OPEN.length;

    const related =
        (contract.showRelatedTools
            ? renderRelatedCalculators(id)
            : "") +
        (contract.showRelatedArticles
            ? renderRelatedArticles(id)
            : "");

    return (
        html.slice(0, afterOpen) +
        (metadata
            ? renderToolBreadcrumb(metadata)
            : "") +
        html.slice(afterOpen, close) +
        related +
        html.slice(close)
    );

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
         * A generated page already contains the finished markup
         * (tool content, breadcrumb, related sections): bind it.
         */

        const mount =
            document.querySelector(
                TOOL_MOUNT_SELECTOR
            );

        if (
            contract.init &&
            mount?.querySelector(".calculator-page")
        ) {

            contract.init(mount);

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


        /*
         * Exactly one breadcrumb: skip it if the tool
         * already rendered its own.
         */

        if (
            metadata &&
            !page.querySelector(
                ".calculator-breadcrumb"
            )
        ) {

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
   NOT FOUND / ERROR

   Kept in tool-messages.js so a generated tool page can show
   them without loading this whole module.
========================================================= */

export {
    renderToolNotFound,
    renderToolError
} from "./tool-messages.js";

import {
    renderToolNotFound,
    renderToolError
} from "./tool-messages.js";
