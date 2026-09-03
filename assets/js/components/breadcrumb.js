/* =========================================================
   ToolZen Hub
   Calculator Breadcrumb Component

   Purpose:
   Reusable breadcrumb for all calculator pages.

   Visual structure and CSS classes are kept identical
   to the existing calculator breadcrumb.
========================================================= */


import {
    ROUTES
} from "../routes.js";



/* =========================================================
   Render Calculator Breadcrumb
========================================================= */

export function renderBreadcrumb({
    category = "",
    categoryUrl = ROUTES.categories,
    title = ""
} = {}) {


    return `

        <div class="calculator-breadcrumb">

            <a href="${ROUTES.home}">
                Home
            </a>

            <span>›</span>

            <a href="${categoryUrl}">
                ${category}
            </a>

            <span>›</span>

            <strong>
                ${title}
            </strong>

        </div>

    `;

}
