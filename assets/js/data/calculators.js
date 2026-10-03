/* =========================================================
   ToolZen Hub
   Calculator Catalog

   THE authoritative source of calculator identity.

   Responsibilities:
   - Calculator identity (id = URL slug), title, description
   - Category association (`category` = major category id,
     data/categories.js). The section, the URL and the site
     path are DERIVED from the category, never written here.
   - Optional `subcategory` (a subcategory id of that
     category). Omit it for a tool that sits directly under
     its major category, which is every tool today.
   - Availability: status "published" | "coming-soon"
   - Optional `toolType` (default "calculator") and, for
     PUBLISHED tools only, `capabilities`: flags saying what
     the tool's code supports (data/tool-capabilities.js).
     Declaring a capability creates no functionality.
   - `seo` (published tools): the page <title> and meta
     description, kept exactly as the page has always had them
   - Dynamic loaders for implemented calculators

   Presentation choices (which tools the home page features,
   in which order, with which short copy) live with the
   component that shows them and reference tool ids.
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    getSectionForCategory
} from "./categories.js";

import {
    describeTool
} from "./tool-capabilities.js";


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
        capabilities: {
            compare: true,
            reset: true,
            realtime: true,
            multipleInputs: true,
            unitSelection: true,
            table: true,
            schedule: true,
            modal: true,
            download: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Loan Comparison Calculator | ToolZenHub",
            description:
                "Compare two loans by EMI, interest rate, total interest and total repayment with ToolZenHub."
        }
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
        capabilities: {
            reset: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "EMI Calculator | ToolZen Hub",
            description:
                "Calculate your monthly EMI, total interest and total repayment for a loan.",
            themeColor:
                "#2563eb"
        }
    },

    {
        id: "home-loan",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "⌂",
        title: "Home Loan Calculator",
        description:
            "Calculate home loan EMI, interest and total repayment."
    },

    {
        id: "personal-loan",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "♙",
        title: "Personal Loan Calculator",
        description:
            "Calculate EMI and total repayment for a personal loan."
    },

    {
        id: "loan-eligibility",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description:
            "Estimate your eligibility for different types of loans."
    },

    {
        id: "balance-transfer",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "⟳",
        title: "Balance Transfer Calculator",
        description:
            "Estimate potential savings from transferring your existing loan."
    },

    {
        id: "interest",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "%",
        title: "Interest Calculator",
        description:
            "Calculate simple and compound interest on your investment or loan."
    },

    {
        id: "prepayment",
        status: "coming-soon",
        category: "loans",
        type: "simple",
        icon: "₹",
        title: "Prepayment Calculator",
        description:
            "Estimate interest savings from making a partial loan prepayment."
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
            "Plan your SIP investments."
    },

    {
        id: "ppf",
        status: "coming-soon",
        category: "investment",
        type: "simple",
        icon: "₹",
        title: "PPF Calculator",
        description:
            "Calculate PPF investment returns."
    },

    {
        id: "fd",
        status: "coming-soon",
        category: "investment",
        type: "simple",
        icon: "▣",
        title: "FD Calculator",
        description:
            "Calculate fixed deposit returns."
    },

    {
        id: "cagr",
        status: "coming-soon",
        category: "investment",
        type: "simple",
        icon: "↗",
        title: "CAGR Calculator",
        description:
            "Calculate compound annual growth rate."
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
            "Calculate GST easily and accurately."
    },

    {
        id: "income-tax",
        status: "coming-soon",
        category: "tax",
        type: "simple",
        icon: "₹",
        title: "Income Tax Calculator",
        description:
            "Estimate your income tax."
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
            "Check your body mass index."
    },

    {
        id: "calorie",
        status: "coming-soon",
        category: "health",
        type: "simple",
        icon: "◉",
        title: "Calorie Calculator",
        description:
            "Estimate your daily calorie needs."
    },

    {
        id: "bmr",
        status: "coming-soon",
        category: "health",
        type: "simple",
        icon: "♨",
        title: "BMR Calculator",
        description:
            "Calculate your basal metabolic rate."
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
            "Calculate business profit."
    },

    {
        id: "margin",
        status: "coming-soon",
        category: "business",
        type: "simple",
        icon: "%",
        title: "Margin Calculator",
        description:
            "Calculate profit margin."
    },

    {
        id: "roi",
        status: "coming-soon",
        category: "business",
        type: "simple",
        icon: "↗",
        title: "ROI Calculator",
        description:
            "Calculate return on investment."
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
            "Calculate percentages easily."
    },

    {
        id: "ratio",
        status: "coming-soon",
        category: "math",
        type: "simple",
        icon: "÷",
        title: "Ratio Calculator",
        description:
            "Calculate and simplify ratios."
    },

    {
        id: "age",
        status: "coming-soon",
        category: "math",
        type: "simple",
        icon: "◷",
        title: "Age Calculator",
        description:
            "Calculate age accurately."
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
            "Convert common units quickly."
    },

    {
        id: "currency",
        status: "coming-soon",
        category: "converter",
        type: "simple",
        icon: "¤",
        title: "Currency Converter",
        description:
            "Convert currencies easily."
    },

    {
        id: "date",
        status: "coming-soon",
        category: "converter",
        type: "simple",
        icon: "▣",
        title: "Date Calculator",
        description:
            "Calculate dates and date differences."
    }

];


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
   - section    the title of the section of the tool's category
                (data/categories.js); kept as the label that
                breadcrumbs and the registry have always used
   - sitePath   "/{section.pathPrefix}/{id}/": the page's path
                from the site root, whatever the deployment base
                (Calculators: /calculators/{id}/)
   - href       the same page as a link for the current base
   - toolType   "calculator" unless the entry says otherwise
   - capabilities  one true/false per capability key
                (everything not declared is false)
   - available  (status === "published"; read by cards/search)
   - loader     (present only for published tools)
========================================================= */

export const calculators = catalog.map(
    calculator => {

        const published =
            calculator.status === "published";

        const section =
            getSectionForCategory(
                calculator.category
            );

        if (!section) {

            throw new Error(
                `Tool "${calculator.id}": category ` +
                `"${calculator.category}" has no section ` +
                `(data/categories.js)`
            );

        }

        const {
            toolType,
            capabilities
        } = describeTool(calculator);

        return {
            ...calculator,
            toolType,
            capabilities,
            section: section.title,
            sitePath:
                `/${section.pathPrefix}/${calculator.id}/`,
            href:
                ROUTES.tool(
                    section.pathPrefix,
                    calculator.id
                ),
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
