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

   Home → Timers → Countdown Timer

   Home → Developer Tools → JSON Formatter

   Existing breadcrumb styling/classes are preserved.
========================================================= */


import {
    ROUTES
} from "../routes.js";


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

    const normalized =
        String(section)
            .trim()
            .toLowerCase();


    /* =====================================================
       CALCULATORS
    ===================================================== */

    if (
        normalized === "calculators"
    ) {

        return ROUTES.calculatorCategories;

    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    return null;

}


/* =========================================================
   CATEGORY ROUTES
========================================================= */

function getCategoryRoute(
    category
) {

    const normalized =
        String(category)
            .trim()
            .toLowerCase();


    /* =====================================================
       LOANS
    ===================================================== */

    if (
        normalized === "loans"
    ) {

        return ROUTES.loans;

    }


    /* =====================================================
       FUTURE CATEGORIES
    ===================================================== */

    return null;

}
