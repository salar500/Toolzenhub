/* =========================================================
   ToolZen Hub
   Calculator Registry

   Purpose:
   Runtime view of the implemented (published) calculators.

   Everything here is DERIVED from the calculator catalog
   (data/calculators.js), which is the single source of truth
   for calculator identity, category, title and availability.
   Nothing is declared twice.

   - calculatorRegistry:  slug -> () => import(...)  loader
   - calculatorMetadata:  slug -> { section, category, title }

   Calculators are still loaded dynamically, only when needed:
   a catalog entry's loader runs import() when called.

   Coming-soon calculators have no loader, so they are not in
   either object and cannot be rendered as a calculator page.
========================================================= */

import {
    calculators
} from "./data/calculators.js";


const implemented =
    calculators.filter(
        calculator =>
            calculator.available &&
            typeof calculator.loader === "function"
    );


/* =========================================================
   CALCULATOR LOADERS
========================================================= */

export const calculatorRegistry =
    Object.fromEntries(
        implemented.map(
            calculator => [
                calculator.id,
                calculator.loader
            ]
        )
    );


/* =========================================================
   CALCULATOR METADATA
========================================================= */

export const calculatorMetadata =
    Object.fromEntries(
        implemented.map(
            calculator => [
                calculator.id,
                {
                    section: calculator.section,
                    category: calculator.category,
                    ...(calculator.subcategory
                        ? { subcategory: calculator.subcategory }
                        : {}),
                    title: calculator.title
                }
            ]
        )
    );
