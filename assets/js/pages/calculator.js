/* =========================================================
   ToolZen Hub
   Calculator Page Controller

   Thin adapter: resolves a calculator from the catalog-derived
   registry and hands it to the shared tool page (tool-page.js),
   which owns breadcrumb, related content and error states.
========================================================= */

import {
    calculatorRegistry,
    calculatorMetadata
} from "../calculator-registry.js";

import {
    renderToolPage
} from "./tool-page.js";


export async function renderCalculator(slug) {

    await renderToolPage(
        slug,
        {
            loader:
                calculatorRegistry[slug],

            metadata:
                calculatorMetadata[slug]
        }
    );

}
