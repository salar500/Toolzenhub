/* =========================================================
   ToolZen Hub
   Article Registry

   Purpose:
   Central registry for all individual articles.

   The shared article engine uses the current URL to
   determine which article data module should be loaded.

   This architecture scales to hundreds or thousands
   of articles without creating a JS file for every page.
========================================================= */


export const articleRegistry = {


    /* =====================================================
       LOAN COMPARISON ARTICLES
    ===================================================== */

    "loan-comparison/how-to-reduce-home-loan-interest":
        () =>
            import(
                "./loan-comparison/how-to-reduce-home-loan-interest.js"
            ),


    "loan-comparison/emi-vs-total-interest":
        () =>
            import(
                "./loan-comparison/emi-vs-total-interest.js"
            ),


    "loan-comparison/fixed-vs-floating-interest-rates":
        () =>
            import(
                "./loan-comparison/fixed-vs-floating-interest-rates.js"
            ),


    "loan-comparison/loan-tenure-total-interest":
        () =>
            import(
                "./loan-comparison/loan-tenure-total-interest.js"
            ),


    "loan-comparison/what-is-loan-prepayment":
        () =>
            import(
                "./loan-comparison/what-is-loan-prepayment.js"
            ),


    "loan-comparison/choose-right-loan-tenure":
        () =>
            import(
                "./loan-comparison/choose-right-loan-tenure.js"
            )


};
