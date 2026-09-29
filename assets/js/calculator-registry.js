/* =========================================================
   ToolZen Hub
   Calculator Registry

   Purpose:
   Central registry for all calculators.

   Each calculator is loaded dynamically only when needed.
   Category information is stored separately so the existing
   dynamic loading system remains unchanged.
========================================================= */


/* =========================================================
   CALCULATOR LOADERS
========================================================= */

export const calculatorRegistry = {


    /* =====================================================
       LOAN COMPARISON
    ===================================================== */

    "loan-comparison": () =>
        import("../../loans/loan-comparison/index.js"),


    /* =====================================================
       EMI CALCULATOR
    ===================================================== */

    "emi": () =>
        import("./calculators/emi/index.js")


};


/* =========================================================
   CALCULATOR METADATA
========================================================= */

export const calculatorMetadata = {


    /* =====================================================
       LOANS
    ===================================================== */

    "loan-comparison": {
        category: "loans"
    },


    "emi": {
        category: "loans"
    }


};
