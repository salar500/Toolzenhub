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
        title: "Loan Comparison Calculator",
        description:
            "Compare two loans by EMI, interest rate, total interest and repayment.",
        href: ROUTES.calculator("loan-comparison")
    },

    {
        id: "emi",
        category: "loans",
        type: "simple",
        icon: "▦",
        title: "EMI Calculator",
        description:
            "Calculate your monthly EMI for any loan amount, interest rate and tenure.",
        href: ROUTES.calculator("emi")
    },

    {
        id: "home-loan",
        category: "loans",
        type: "simple",
        icon: "⌂",
        title: "Home Loan Calculator",
        description:
            "Calculate home loan EMI, interest and total repayment.",
        href: ROUTES.calculator("home-loan")
    },

    {
        id: "personal-loan",
        category: "loans",
        type: "simple",
        icon: "♙",
        title: "Personal Loan Calculator",
        description:
            "Calculate EMI and total repayment for a personal loan.",
        href: ROUTES.calculator("personal-loan")
    },

    {
        id: "loan-eligibility",
        category: "loans",
        type: "simple",
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description:
            "Estimate your eligibility for different types of loans.",
        href: ROUTES.calculator("loan-eligibility")
    },

    {
        id: "balance-transfer",
        category: "loans",
        type: "simple",
        icon: "⟳",
        title: "Balance Transfer Calculator",
        description:
            "Estimate potential savings from transferring your existing loan.",
        href: ROUTES.calculator("balance-transfer")
    },

    {
        id: "interest",
        category: "loans",
        type: "simple",
        icon: "%",
        title: "Interest Calculator",
        description:
            "Calculate simple and compound interest on your investment or loan.",
        href: ROUTES.calculator("interest")
    },

    {
        id: "prepayment",
        category: "loans",
        type: "simple",
        icon: "₹",
        title: "Prepayment Calculator",
        description:
            "Estimate interest savings from making a partial loan prepayment.",
        href: ROUTES.calculator("prepayment")
    },


    /* =====================================================
       INVESTMENT
    ===================================================== */

    {
        id: "sip",
        category: "investment",
        type: "simple",
        icon: "◈",
        title: "SIP Calculator",
        description:
            "Plan your SIP investments.",
        href: ROUTES.calculator("sip")
    },

    {
        id: "ppf",
        category: "investment",
        type: "simple",
        icon: "₹",
        title: "PPF Calculator",
        description:
            "Calculate PPF investment returns.",
        href: ROUTES.calculator("ppf")
    },

    {
        id: "fd",
        category: "investment",
        type: "simple",
        icon: "▣",
        title: "FD Calculator",
        description:
            "Calculate fixed deposit returns.",
        href: ROUTES.calculator("fd")
    },

    {
        id: "cagr",
        category: "investment",
        type: "simple",
        icon: "↗",
        title: "CAGR Calculator",
        description:
            "Calculate compound annual growth rate.",
        href: ROUTES.calculator("cagr")
    },


    /* =====================================================
       TAX
    ===================================================== */

    {
        id: "gst",
        category: "tax",
        type: "simple",
        icon: "%",
        title: "GST Calculator",
        description:
            "Calculate GST easily and accurately.",
        href: ROUTES.calculator("gst")
    },

    {
        id: "income-tax",
        category: "tax",
        type: "simple",
        icon: "₹",
        title: "Income Tax Calculator",
        description:
            "Estimate your income tax.",
        href: ROUTES.calculator("income-tax")
    },


    /* =====================================================
       HEALTH
    ===================================================== */

    {
        id: "bmi",
        category: "health",
        type: "simple",
        icon: "⚖",
        title: "BMI Calculator",
        description:
            "Check your body mass index.",
        href: ROUTES.calculator("bmi")
    },

    {
        id: "calorie",
        category: "health",
        type: "simple",
        icon: "◉",
        title: "Calorie Calculator",
        description:
            "Estimate your daily calorie needs.",
        href: ROUTES.calculator("calorie")
    },

    {
        id: "bmr",
        category: "health",
        type: "simple",
        icon: "♨",
        title: "BMR Calculator",
        description:
            "Calculate your basal metabolic rate.",
        href: ROUTES.calculator("bmr")
    },


    /* =====================================================
       BUSINESS
    ===================================================== */

    {
        id: "profit",
        category: "business",
        type: "simple",
        icon: "₹",
        title: "Profit Calculator",
        description:
            "Calculate business profit.",
        href: ROUTES.calculator("profit")
    },

    {
        id: "margin",
        category: "business",
        type: "simple",
        icon: "%",
        title: "Margin Calculator",
        description:
            "Calculate profit margin.",
        href: ROUTES.calculator("margin")
    },

    {
        id: "roi",
        category: "business",
        type: "simple",
        icon: "↗",
        title: "ROI Calculator",
        description:
            "Calculate return on investment.",
        href: ROUTES.calculator("roi")
    },


    /* =====================================================
       MATH
    ===================================================== */

    {
        id: "percentage",
        category: "math",
        type: "simple",
        icon: "%",
        title: "Percentage Calculator",
        description:
            "Calculate percentages easily.",
        href: ROUTES.calculator("percentage")
    },

    {
        id: "ratio",
        category: "math",
        type: "simple",
        icon: "÷",
        title: "Ratio Calculator",
        description:
            "Calculate and simplify ratios.",
        href: ROUTES.calculator("ratio")
    },

    {
        id: "age",
        category: "math",
        type: "simple",
        icon: "◷",
        title: "Age Calculator",
        description:
            "Calculate age accurately.",
        href: ROUTES.calculator("age")
    },


    /* =====================================================
       CONVERTER
    ===================================================== */

    {
        id: "unit-converter",
        category: "converter",
        type: "simple",
        icon: "↔",
        title: "Unit Converter",
        description:
            "Convert common units quickly.",
        href: ROUTES.calculator("unit-converter")
    },

    {
        id: "currency",
        category: "converter",
        type: "simple",
        icon: "¤",
        title: "Currency Converter",
        description:
            "Convert currencies easily.",
        href: ROUTES.calculator("currency")
    },

    {
        id: "date",
        category: "converter",
        type: "simple",
        icon: "▣",
        title: "Date Calculator",
        description:
            "Calculate dates and date differences.",
        href: ROUTES.calculator("date")
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
