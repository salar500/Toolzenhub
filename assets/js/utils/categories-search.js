/* =========================================================
   ToolZen Hub
   Calculator Search Utility

   Used by:
   - Home Hero Search
   - Categories Page Search
   - All Calculators Page Search

   Purpose:
   Search calculators from the master calculator catalog.

   This is completely separate from article search.
========================================================= */

import {
    calculators
} from "../data/calculators.js";

import {
    ROUTES
} from "../routes.js";

import {
    categories
} from "../data/categories.js";

import {
    search
} from "./search.js";


/* =========================================================
   CATEGORY LABELS
========================================================= */

const categoryLabels = Object.fromEntries(
    categories.map(
        category => [
            category.id,
            category.title
        ]
    )
);


/* =========================================================
   CALCULATOR SEARCH DATA
========================================================= */

function getSearchCalculators() {

    return calculators.map(
        calculator => ({

            ...calculator,

            category:
                categoryLabels[
                    calculator.category
                ] ||
                calculator.category,

            url:
                calculator.available
                    ? calculator.href
                    : null

        })
    );

}


/* =========================================================
   SEARCH CALCULATORS
========================================================= */

export function searchCalculators(query) {

    /*
     * Ranked by the shared search (utils/search.js). These
     * pages have always listed Coming-soon tools (as "Coming
     * soon" cards), so they ask for them explicitly.
     */

    const byId =
        new Map(
            getSearchCalculators().map(
                calculator => [
                    calculator.id,
                    calculator
                ]
            )
        );

    return search(
        query,
        {
            types: ["tool"],
            includeComingSoon: true
        }
    ).map(
        result =>
            byId.get(result.id)
    );

}


/* =========================================================
   GET ALL CALCULATORS
========================================================= */

export function getCalculators() {

    return getSearchCalculators();

}


/* =========================================================
   CALCULATOR SEARCH URL
========================================================= */

export function getCalculatorSearchUrl(query) {

    const search =
        String(query || "").trim();


    if (!search) {
        return ROUTES.categories;
    }


    return `${ROUTES.categories}?q=${encodeURIComponent(search)}`;

}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    searchCalculators,

    getCalculators,

    getCalculatorSearchUrl

};
