/* =========================================================
   ToolZen Hub
   Calculator Catalog (compatibility view)

   The authoritative catalog is data/tools.js. This file is the
   stable calculator-specific API over it, for the pages and
   components that list or look up calculators: the tools of
   the Calculators section, the SAME objects as in the
   authoritative catalog (nothing is copied or stored twice).
========================================================= */

import {
    tools
} from "./tools.js";

import {
    getSectionForCategory
} from "./categories.js";


/* =========================================================
   Calculators
========================================================= */

export const calculators = tools.filter(
    tool =>
        getSectionForCategory(tool.category)?.id === "calculators"
);


/* =========================================================
   Get Calculators By Category
========================================================= */

export function getCalculatorsByCategory(
    categoryId
) {

    return calculators.filter(
        calculator =>
            calculator.category === categoryId
    );

}


/* =========================================================
   Get Calculator By ID
========================================================= */

export function getCalculatorById(
    calculatorId
) {

    return calculators.find(
        calculator =>
            calculator.id === calculatorId
    );

}
