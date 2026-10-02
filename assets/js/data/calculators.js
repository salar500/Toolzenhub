/* =========================================================
   ToolZen Hub
   Calculator Catalog

   THE authoritative source of calculator identity.

   Responsibilities:
   - Calculator identity (id = URL slug), title, description
   - Category association (`category` = major category id,
     data/categories.js) and section
   - Optional `subcategory` (a subcategory id of that
     category). Omit it for a tool that sits directly under
     its major category, which is every tool today.
   - Availability: status "published" | "coming-soon"
   - Calculator URL
   - Dynamic loaders for implemented calculators

   Presentation choices (which tools the home page features,
   in which order, with which short copy) live with the
   component that shows them and reference tool ids.
========================================================= */

import {
    ROUTES
} from "../routes.js";


/* =========================================================
   Calculator Catalog
========================================================= */

const catalog = [

    /* =====================================================
       LOANS
    ===================================================== */

    {
        id: "loan-comparison",
        status: "published",
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
        status: "published",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
        status: "coming-soon",
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
   Section
========================================================= */

export const CALCULATORS_SECTION = "Calculators";


/* =========================================================
   Loaders (implemented calculators only)

   Loaded on demand with import(): a calculator's JavaScript is
   fetched only when its page is opened.
========================================================= */

const loaders = {

    "loan-comparison": () =>
        import("../../../loans/loan-comparison/index.js"),

    "emi": () =>
        import("../calculators/emi/index.js")

};


/* =========================================================
   Calculators
   Catalog entries + derived fields:
   - section
   - available  (status === "published"; read by cards/search)
   - loader     (present only for published tools)
========================================================= */

export const calculators = catalog.map(
    calculator => {

        const published =
            calculator.status === "published";

        return {
            ...calculator,
            section: CALCULATORS_SECTION,
            available: published,
            ...(published && loaders[calculator.id]
                ? { loader: loaders[calculator.id] }
                : {})
        };

    }
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
