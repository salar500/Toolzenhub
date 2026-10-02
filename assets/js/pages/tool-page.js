/* =========================================================
   ToolZen Hub
   Shared Tool Page

   Composes the finished page around a tool, never the tool
   itself. The site build calls buildToolPageHtml() to write the
   page; in the browser, entries/tool.js loads the page's tool
   module and calls its init().

   Shared (this file):
   - the breadcrumb, placed as the first child of the page wrapper
   - related tools and related articles, placed as the last children

   Tool-specific (the tool module):
   - its heading / intro, inputs, results and info sections
   - its own DOM, events and calculations

   TOOL MODULE CONTRACT

     export function render(mount)   REQUIRED
         Render the tool into the mount element (#app): markup()
         followed by init(). Kept so a tool can be rendered on its
         own. The tool's markup must be wrapped in
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
         (buildToolPageHtml below); in the browser only init()
         runs.

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
