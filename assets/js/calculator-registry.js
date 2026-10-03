/* =========================================================
   ToolZen Hub
   Calculator Registry

   Purpose:
   Runtime view of the implemented (published) calculators.

   Everything here is DERIVED from the tool catalog
   (data/tools.js), which is the single source of truth for
   tool identity, category, title, availability and loader.
   Nothing is declared twice.

   - calculatorRegistry:  slug -> () => import(...)  loader
   - calculatorMetadata:  slug -> { section, category, title }

   Calculators are still loaded dynamically, only when needed:
   a catalog entry's loader runs import() when called.

   Coming-soon calculators have no loader, so they are not in
   either object and cannot be rendered as a calculator page.
========================================================= */

import {
    getPublishedTools,
    getToolMetadata
} from "./data/tools.js";


const implemented =
    getPublishedTools().filter(
        calculator =>
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
                getToolMetadata(calculator)
            ]
        )
    );
