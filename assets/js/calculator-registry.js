/* =========================================================
   ToolZen Hub
   Calculator Registry

   Purpose:
   Central registry for all calculators.

   Each calculator is loaded dynamically only when needed.
========================================================= */

export const calculatorRegistry = {

    "loan-comparison": () =>
        import("../loans/loan-comparison/index.js")

};
