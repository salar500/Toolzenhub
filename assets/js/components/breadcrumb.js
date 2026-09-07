/* =========================================================
   ToolZen Hub
   Global Breadcrumb Component

   Purpose:
   Reusable breadcrumb for all website pages.

   Supports:
   - Home → Categories
   - Home → Calculators
   - Home → Loans → Calculator
   - Home → Articles
   - Home → Articles → Article
   - Home → About
   - Home → Contact

   Existing breadcrumb styling/classes are preserved.
========================================================= */


import {
    ROUTES
} from "../routes.js";



/* =========================================================
   Render Breadcrumb
========================================================= */

export function renderBreadcrumb(
    items = []
) {


    /* =====================================================
       DEFAULT HOME
    ===================================================== */

    const breadcrumbItems = [

        {
            label: "Home",
            href: ROUTES.home
        },

        ...items

    ];


    /* =====================================================
       RENDER ITEMS
    ===================================================== */

    return `

        <div class="calculator-breadcrumb">

            ${breadcrumbItems.map(
                (item, index) => `

                    ${index > 0 ? `
                        <span>›</span>
                    ` : ""}


                    ${
                        item.href
                            ? `
                                <a href="${item.href}">
                                    ${item.label}
                                </a>
                            `
                            : `
                                <strong>
                                    ${item.label}
                                </strong>
                            `
                    }

                `
            ).join("")}

        </div>

    `;

}
