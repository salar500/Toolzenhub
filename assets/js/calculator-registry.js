/* =========================================================
   ToolZen Hub
   Calculator Registry

   Purpose:
   Central registry for all calculators.

   Each calculator is loaded dynamically only when needed.

   Metadata stores:
   - Section
   - Category
   - Title

   This allows the website to build breadcrumbs,
   category pages, related tools and navigation centrally.
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
       LOAN COMPARISON
    ===================================================== */

    "loan-comparison": {

        section: "Calculators",

        category: "loans",

        title: "Loan Comparison Calculator"

    },


    /* =====================================================
       EMI CALCULATOR
    ===================================================== */

    "emi": {

        section: "Calculators",

        category: "loans",

        title: "EMI Calculator"

    }


};

