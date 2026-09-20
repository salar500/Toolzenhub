/* =========================================================
   ToolZen Hub
   Calculator Catalog

   Responsibilities:
   - Calculator metadata
   - Category association
   - Calculator type
   - Calculator URL
========================================================= */

import {
    ROUTES
} from "../routes.js";


/* =========================================================
   Calculator Catalog
========================================================= */

export const calculators = [

    /* =====================================================
       LOANS
    ===================================================== */

    {
        id: "loan-comparison",

        category: "loans",

        type: "advanced",

        icon: "⚖",

        title:
            "Loan Comparison Calculator",

        description:
            "Compare two loans by EMI, interest rate, total interest and repayment.",

        href:
            ROUTES.calculator(
                "loan-comparison"
            )
    },


    {
        id: "emi",

        category: "loans",

        type: "simple",

        icon: "▦",

        title:
            "EMI Calculator",

        description:
            "Calculate your monthly EMI for any loan amount, interest rate and tenure.",

        href:
            ROUTES.calculator(
                "emi"
            )
    },


    {
        id: "home-loan",

        category: "loans",

        type: "simple",

        icon: "⌂",

        title:
            "Home Loan Calculator",

        description:
            "Calculate home loan EMI, interest and total repayment.",

        href:
            ROUTES.calculator(
                "home-loan"
            )
    },


    {
        id: "personal-loan",

        category: "loans",

        type: "simple",

        icon: "♙",

        title:
            "Personal Loan Calculator",

        description:
            "Calculate EMI and total repayment for a personal loan.",

        href:
            ROUTES.calculator(
                "personal-loan"
            )
    },


    {
        id: "loan-eligibility",

        category: "loans",

        type: "simple",

        icon: "▤",

        title:
            "Loan Eligibility Calculator",

        description:
            "Estimate your eligibility for different types of loans.",

        href:
            ROUTES.calculator(
                "loan-eligibility"
            )
    },


    {
        id: "balance-transfer",

        category: "loans",

        type: "simple",

        icon: "⟳",

        title:
            "Balance Transfer Calculator",

        description:
            "Estimate potential savings from transferring your existing loan.",

        href:
            ROUTES.calculator(
                "balance-transfer"
            )
    },


    {
        id: "interest",

        category: "loans",

        type: "simple",

        icon: "%",

        title:
            "Interest Calculator",

        description:
            "Calculate simple and compound interest on your investment or loan.",

        href:
            ROUTES.calculator(
                "interest"
            )
    },


    {
        id: "prepayment",

        category: "loans",

        type: "simple",

        icon: "₹",

        title:
            "Prepayment Calculator",

        description:
            "Estimate interest savings from making a partial loan prepayment.",

        href:
            ROUTES.calculator(
                "prepayment"
            )
    }

];


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
