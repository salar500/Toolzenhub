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


/* =========================================================
   CATEGORY LABELS
========================================================= */

const categoryLabels = {

    loans: "Loans",

    investment: "Investment",

    tax: "Tax",

    health: "Health",

    business: "Business",

    math: "Math",

    converter: "Converter"

};


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
                calculator.href

        })
    );

}


/* =========================================================
   SEARCH CALCULATORS
========================================================= */

export function searchCalculators(query) {

    const search =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!search) {
        return [];
    }


    const searchCalculators =
        getSearchCalculators();


    return searchCalculators.filter(
        calculator => {

            const searchableText = [

                calculator.title,

                calculator.description,

                calculator.category

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(
                search
            );

        }
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
