/* =========================================================
   ToolZen Hub
   Global Breadcrumb Component

   Purpose:
   Central reusable breadcrumb system.

   Supports:
   - Home
   - Section
   - Category
   - Individual tool

   Examples:

   Home → Calculators
   Home → Calculators → Loans
   Home → Calculators → Loans → EMI Calculator
   Home → Calculators → Loans → Subcategory → Tool
           (the subcategory step appears only for tools that
            have one; none do yet)

   Where each step links comes from the hierarchy data
   (data/taxonomy.js), not from this file.

   Home → Timers → Countdown Timer

   Home → Developer Tools → JSON Formatter

   Existing breadcrumb styling/classes are preserved.
========================================================= */


import {
    ROUTES
} from "../routes.js";

import {
    getSectionUrl,
    getCategoryLandingUrl,
    getSubcategory,
    getSubcategoryLandingUrl
} from "../data/taxonomy.js";


/* =========================================================
   RENDER BREADCRUMB
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


/* =========================================================
   RENDER TOOL BREADCRUMB
========================================================= */

/*
 * Builds a breadcrumb automatically from tool metadata.
 *
 * Example:
 *
 * renderToolBreadcrumb({
 *
 *     section: "Calculators",
 *
 *     category: "Loans",
 *
 *     title: "Loan Comparison Calculator"
 *
 * });
 *
 * Result:
 *
 * Home → Calculators → Loans → Loan Comparison Calculator
 *
 * The category step shows metadata.category exactly as given
 * (the catalog passes the id, so it reads "loans"). A
 * `subcategory` id in the metadata adds one more step.
 */


export function renderToolBreadcrumb(
    metadata = {}
) {

    const items = [];


    /* =====================================================
       SECTION
    ===================================================== */

    if (metadata.section) {

        items.push({

            label:
                metadata.section,

            href:
                getSectionRoute(
                    metadata.section
                )

        });

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    if (metadata.category) {

        items.push({

            label:
                metadata.category,

            href:
                getCategoryRoute(
                    metadata.category
                )

        });

    }


    /* =====================================================
       SUBCATEGORY (optional)
    ===================================================== */

    if (metadata.subcategory) {

        const subcategory =
            getSubcategory(
                metadata.subcategory
            );

        items.push({

            label:
                subcategory?.title ||
                metadata.subcategory,

            href:
                getSubcategoryLandingUrl(
                    metadata.subcategory
                )

        });

    }


    /* =====================================================
       TOOL
    ===================================================== */

    if (metadata.title) {

        items.push({

            label:
                metadata.title

        });

    }


    return renderBreadcrumb(items);

}


/* =========================================================
   SECTION ROUTES
========================================================= */

function getSectionRoute(
    section
) {

    return getSectionUrl(section);

}


/* =========================================================
   CATEGORY ROUTES

   Only categories with a landing page link (Loans today);
   the others show as plain text.
========================================================= */

function getCategoryRoute(
    category
) {

    return getCategoryLandingUrl(
        String(category)
            .trim()
            .toLowerCase()
    );

}
