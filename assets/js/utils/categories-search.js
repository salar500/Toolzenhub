/* =========================================================
   ToolZen Hub
   Calculator Search Utility

   Used by:
   - Home Hero Search
   - Categories Page Search

   Purpose:
   Search calculators only.

   This is completely separate from article search.
========================================================= */

import {
    ROUTES
} from "../routes.js";


/* =========================================================
   CALCULATOR DATA
========================================================= */

const calculators = [

    {
        title: "Loan Comparison",
        description: "Compare loans side by side",
        category: "Loans",
        keywords: "loan comparison loans interest emi repayment",
        url: ROUTES.calculator("loan-comparison")
    },

    {
        title: "EMI Calculator",
        description: "Calculate your EMI instantly",
        category: "Loans",
        keywords: "emi loan monthly payment interest",
        url: ROUTES.calculator("emi")
    },

    {
        title: "Home Loan Calculator",
        description: "Calculate your home loan",
        category: "Loans",
        keywords: "home loan housing loan emi interest",
        url: ROUTES.calculator("home-loan")
    },

    {
        title: "Personal Loan Calculator",
        description: "Calculate personal loan payments",
        category: "Loans",
        keywords: "personal loan emi interest repayment",
        url: ROUTES.calculator("personal-loan")
    },

    {
        title: "SIP Calculator",
        description: "Plan your SIP investments",
        category: "Investment",
        keywords: "sip investment mutual fund returns savings",
        url: ROUTES.calculator("sip")
    },

    {
        title: "PPF Calculator",
        description: "Calculate PPF investment returns",
        category: "Investment",
        keywords: "ppf investment returns savings",
        url: ROUTES.calculator("ppf")
    },

    {
        title: "FD Calculator",
        description: "Calculate fixed deposit returns",
        category: "Investment",
        keywords: "fd fixed deposit investment interest",
        url: ROUTES.calculator("fd")
    },

    {
        title: "CAGR Calculator",
        description: "Calculate compound annual growth rate",
        category: "Investment",
        keywords: "cagr growth investment return",
        url: ROUTES.calculator("cagr")
    },

    {
        title: "GST Calculator",
        description: "Calculate GST easily and accurately",
        category: "Tax",
        keywords: "gst tax goods services tax calculation",
        url: ROUTES.calculator("gst")
    },

    {
        title: "Income Tax Calculator",
        description: "Estimate your income tax",
        category: "Tax",
        keywords: "income tax tax calculation salary",
        url: ROUTES.calculator("income-tax")
    },

    {
        title: "BMI Calculator",
        description: "Check your body mass index",
        category: "Health",
        keywords: "bmi health weight body mass index",
        url: ROUTES.calculator("bmi")
    },

    {
        title: "Calorie Calculator",
        description: "Estimate your daily calorie needs",
        category: "Health",
        keywords: "calorie calories health diet daily",
        url: ROUTES.calculator("calorie")
    },

    {
        title: "BMR Calculator",
        description: "Calculate your basal metabolic rate",
        category: "Health",
        keywords: "bmr basal metabolic rate calories",
        url: ROUTES.calculator("bmr")
    },

    {
        title: "Profit Calculator",
        description: "Calculate business profit",
        category: "Business",
        keywords: "profit business revenue cost",
        url: ROUTES.calculator("profit")
    },

    {
        title: "Margin Calculator",
        description: "Calculate profit margin",
        category: "Business",
        keywords: "margin profit business percentage",
        url: ROUTES.calculator("margin")
    },

    {
        title: "ROI Calculator",
        description: "Calculate return on investment",
        category: "Business",
        keywords: "roi return investment business",
        url: ROUTES.calculator("roi")
    },

    {
        title: "Percentage Calculator",
        description: "Calculate percentages easily",
        category: "Math",
        keywords: "percentage percent maths calculation",
        url: ROUTES.calculator("percentage")
    },

    {
        title: "Ratio Calculator",
        description: "Calculate and simplify ratios",
        category: "Math",
        keywords: "ratio maths proportion calculation",
        url: ROUTES.calculator("ratio")
    },

    {
        title: "Age Calculator",
        description: "Calculate age accurately",
        category: "Math",
        keywords: "age date birth calculation",
        url: ROUTES.calculator("age")
    },

    {
        title: "Unit Converter",
        description: "Convert common units quickly",
        category: "Converter",
        keywords: "unit conversion length weight temperature",
        url: ROUTES.calculator("unit-converter")
    },

    {
        title: "Currency Converter",
        description: "Convert currencies easily",
        category: "Converter",
        keywords: "currency exchange money conversion",
        url: ROUTES.calculator("currency")
    },

    {
        title: "Date Calculator",
        description: "Calculate dates and date differences",
        category: "Converter",
        keywords: "date days calendar difference",
        url: ROUTES.calculator("date")
    }

];


/* =========================================================
   SEARCH CALCULATORS
========================================================= */

export function searchCalculators(query) {

    const search =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!search) {
        return [];
    }


    return calculators.filter(
        calculator => {

            const searchableText = [

                calculator.title,

                calculator.description,

                calculator.category,

                calculator.keywords

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(search);

        }
    );

}


/* =========================================================
   GET ALL CALCULATORS
========================================================= */

export function getCalculators() {

    return [...calculators];

}


/* =========================================================
   CALCULATOR SEARCH URL
========================================================= */

export function getCalculatorSearchUrl(query) {

    const search =
        String(query || "").trim();


    if (!search) {
        return ROUTES.categories;
    }


    return `${ROUTES.categories}?q=${encodeURIComponent(search)}`;

}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    searchCalculators,

    getCalculators,

    getCalculatorSearchUrl

};
