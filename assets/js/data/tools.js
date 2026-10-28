/* =========================================================
   ToolZen Hub
   Tool Catalog

   THE authoritative source of tool metadata, for every kind of
   tool (calculators today; converters, timers and other
   utilities later). One entry per tool owns:

   - id            the URL slug, unique across the catalog
   - title, description
   - status        "published" | "coming-soon" (the one place
                   this is decided; `available` is derived)
   - category      a major category id (data/categories.js)
   - toolType      optional, default "calculator"
   - capabilities  published tools only (data/tool-capabilities.js)
   - loader        published tools only: () => import("...")
                   This is the ONLY place a tool's module is
                   named, and it stays a literal import() so a
                   tool's code is fetched only when its page is
                   opened. Every other place (the registry, the
                   site build) reads this function; the build
                   reads the path out of its source text, so keep
                   it a plain literal.
   - seo           published tools: the page <title> and meta
                   description (and an optional themeColor)
   - icon          the card icon
   - aliases / keywords   optional extra search words (only where
                   they are accurate)
   - relatedTools / relatedArticles   optional curated links by
                   id (data/relationships.js)
   - subcategory   optional (none today)
   - autoRelated   optional; false keeps the tool out of the AUTOMATIC
                   same-category related lists, both as the page that
                   shows them and as a candidate in other tools' lists
                   (data/relationships.js). Its curated relatedTools
                   still apply. Used where two tools share a category
                   but not an intent (Income Tax and GST).

   Derived, never written here:
   - section    from the category (tool -> category -> section)
   - sitePath   "/{section prefix}/{id}/" (Calculators:
                /calculators/{id}/)
   - href       that page as a link for the current base
   - available  status === "published"

   The catalog is validated when it loads (duplicate or
   malformed ids, missing title, unknown category or status or
   tool type, bad capabilities, a published tool without a
   loader, a Coming Soon tool with one, clashing pages, unknown
   related tools). A mistake stops the build.

   data/calculators.js is a compatibility view of this catalog
   for the Calculators section; nothing is stored twice.

   Presentation choices (which tools the home page features,
   in which order, with which short copy) live with the
   component that shows them and reference tool ids.
========================================================= */

import {
    ROUTES
} from "../routes.js";

import {
    categories,
    getSectionForTool
} from "./categories.js";

import {
    describeTool
} from "./tool-capabilities.js";


/* =========================================================
   Catalog
========================================================= */

const catalog = [

    /* =====================================================
       LOANS
    ===================================================== */

    {
        id: "loan-comparison",
        status: "published",
        loader: () =>
            import("../../../loans/loan-comparison/index.js"),
        category: "loans",
        icon: "⚖",
        title: "Loan Comparison Calculator",
        relatedTools: [
            "emi",
            "prepayment",
            "balance-transfer"
        ],
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
        loader: () =>
            import("../calculators/emi/index.js"),
        category: "loans",
        icon: "▦",
        title: "EMI Calculator",
        relatedTools: [
            "loan-comparison",
            "prepayment",
            "home-loan"
        ],
        description:
            "Calculate your monthly EMI for any loan amount, interest rate and tenure.",
        aliases: [
            "personal loan emi",
            "car loan emi",
            "education loan emi",
            "home loan emi",
            "loan tenure calculator",
            "emi tenure calculator",
            "loan amortization schedule"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            copy: true,
            presets: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
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
        status: "published",
        loader: () =>
            import("../calculators/home-loan/index.js"),
        category: "loans",
        icon: "⌂",
        title: "Home Loan Calculator",
        relatedTools: [
            "emi",
            "loan-comparison"
        ],
        description:
            "Work out the home loan that fits your monthly EMI budget, what it would cost in interest, and how the tenure changes it.",
        aliases: [
            "home loan affordability",
            "how much loan can i afford",
            "loan amount calculator"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Home Loan Calculator: Loan Amount for Your EMI Budget | ToolZen Hub",
            description:
                "Work out the home loan that fits the monthly EMI you choose, with the interest it costs and what a different tenure does. Calculated from your numbers: not a lender's offer or decision."
        },
        relatedArticles: [
            "home-loan/how-much-home-loan-fits-your-emi-budget",
            "home-loan/longer-tenure-bigger-loan-much-more-interest",
            "home-loan/how-interest-rates-change-the-home-loan-you-can-borrow"
        ]
    },

    {
        id: "personal-loan",
        status: "coming-soon",
        category: "loans",
        icon: "♙",
        title: "Personal Loan Calculator",
        description:
            "Calculate EMI and total repayment for a personal loan."
    },

    {
        id: "loan-eligibility",
        status: "coming-soon",
        category: "loans",
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description:
            "Estimate your eligibility for different types of loans."
    },

    {
        id: "balance-transfer",
        status: "published",
        loader: () =>
            import("../calculators/balance-transfer/index.js"),
        category: "loans",
        icon: "⟳",
        title: "Loan Balance Transfer Calculator",
        description:
            "See whether moving your loan to a lower rate pays off after the charges, and when you earn them back.",
        aliases: [
            "loan transfer",
            "refinance",
            "switch loan"
        ],
        capabilities: {
            reset: true,
            compare: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            table: true,
            print: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Loan Balance Transfer Calculator | ToolZen Hub",
            description:
                "See whether moving your loan to a lower interest rate pays off after the charges, when you earn them back, and whether a longer tenure is hiding a higher cost."
        },
        relatedTools: [
            "prepayment",
            "emi",
            "loan-comparison"
        ],
        relatedArticles: [
            "balance-transfer/is-a-loan-balance-transfer-worth-it",
            "balance-transfer/balance-transfer-vs-prepayment",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/emi-vs-total-interest"
        ]
    },

    {
        id: "interest",
        status: "coming-soon",
        category: "loans",
        icon: "%",
        title: "Interest Calculator",
        description:
            "Calculate simple and compound interest on your investment or loan."
    },

    {
        id: "prepayment",
        status: "published",
        loader: () =>
            import("../calculators/prepayment/index.js"),
        category: "loans",
        icon: "₹",
        title: "Loan Prepayment Calculator",
        description:
            "See how much interest and time a one-time loan prepayment can save, and what it does to your EMI.",
        aliases: [
            "part payment",
            "early repayment"
        ],
        capabilities: {
            reset: true,
            compare: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            table: true,
            schedule: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Loan Prepayment Calculator | ToolZen Hub",
            description:
                "See how much interest and time a loan prepayment can save, and how it changes your EMI. Compare keeping your EMI with lowering it."
        },
        relatedTools: [
            "emi",
            "loan-comparison",
            "balance-transfer"
        ],
        relatedArticles: [
            "loan-comparison/what-is-loan-prepayment",
            "loan-prepayment/reduce-tenure-or-lower-emi-after-prepayment",
            "loan-prepayment/early-vs-late-loan-prepayment",
            "loan-comparison/how-to-reduce-home-loan-interest"
        ]
    },


    {
        id: "credit-card-payoff",
        status: "published",
        loader: () =>
            import("../calculators/credit-card-payoff/index.js"),
        category: "loans",
        icon: "◉",
        title: "Credit Card Payoff Calculator",
        description:
            "Estimate how many months a fixed monthly payment takes to clear a credit card balance, the interest you would pay, and what a larger payment changes. It is a simplified estimate, not a card statement. It runs in your browser.",
        aliases: [
            "credit card payoff calculator",
            "credit card repayment calculator",
            "credit card payoff time",
            "pay off credit card",
            "how long to pay off credit card",
            "credit card debt calculator"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            localProcessing: true
        },
        seo: {
            title:
                "Credit Card Payoff Calculator: Months and Interest | ToolZen Hub",
            description:
                "Estimate how many months a fixed monthly payment takes to clear a credit card balance, the interest you would pay, and what a larger payment changes. A simplified estimate, not a card statement. It runs in your browser."
        },
        relatedTools: [
            "balance-transfer",
            "prepayment",
            "emi"
        ],
        relatedArticles: [
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/emi-vs-total-interest"
        ]
    },


    /* =====================================================
       INVESTMENT
    ===================================================== */

    {
        id: "sip",
        status: "published",
        loader: () =>
            import("../calculators/sip/index.js"),
        category: "investment",
        icon: "◈",
        title: "SIP Calculator",
        relatedTools: [
            "swp",
            "cagr"
        ],
        description:
            "Estimate what a monthly SIP could grow to for a return you assume, with a yearly step-up, return scenarios and a target.",
        aliases: [
            "systematic investment plan",
            "step-up sip"
        ],
        capabilities: {
            reset: true,
            compare: true,
            chart: true,
            table: true,
            print: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "SIP Calculator | ToolZen Hub",
            description:
                "Estimate what a monthly SIP could grow to for an assumed return, with a yearly step-up, lower and higher return scenarios and a target. A projection, not a forecast."
        },
        relatedArticles: [
            "sip/how-a-sip-grows",
            "sip/how-return-assumptions-change-a-sip-projection",
            "sip/step-up-sip-explained",
            "sip/how-much-sip-do-you-need-for-a-goal"
        ]
    },

    {
        id: "ppf",
        status: "published",
        loader: () =>
            import("../calculators/ppf/index.js"),
        category: "investment",
        icon: "₹",
        title: "PPF Calculator",
        description:
            "Estimate the balance of a Public Provident Fund account from a yearly or monthly deposit, the interest rate you enter and the number of years, with a year-by-year table and a comparison of one yearly deposit with the same total paid monthly. It uses the PPF rule that interest is worked out monthly and added once a year. It runs in your browser.",
        aliases: [
            "ppf calculator",
            "public provident fund calculator",
            "ppf maturity calculator",
            "ppf interest calculator",
            "ppf return calculator"
        ],
        capabilities: {
            reset: true,
            table: true,
            schedule: true,
            compare: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "PPF Calculator: Estimate Your PPF Balance Year by Year | ToolZen Hub",
            description:
                "Estimate a PPF balance from a yearly or monthly deposit, the interest rate you enter and the number of years, with a year-by-year table. A projection from your inputs, not a statement of any account."
        }
    },

    {
        id: "fd",
        status: "published",
        loader: () =>
            import("../calculators/fd/index.js"),
        category: "investment",
        icon: "▣",
        title: "FD Calculator",
        relatedTools: [
            "cagr"
        ],
        description:
            "Work out what a fixed deposit matures to for a rate and tenure you enter, see its effective annual yield, and compare two offers side by side.",
        aliases: [
            "fixed deposit calculator",
            "fd maturity calculator",
            "fd comparison"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "FD Calculator: Maturity & Compare Deposits | ToolZen Hub",
            description:
                "Work out what a fixed deposit matures to, its interest and effective annual yield, and compare two offers. Calculated from your numbers: not a bank's quote or a guaranteed amount."
        },
        relatedArticles: [
            "fd/how-compounding-frequency-changes-an-fd-maturity",
            "fd/comparing-two-fixed-deposits-higher-rate-is-not-the-whole-comparison"
        ]
    },

    {
        id: "cagr",
        status: "published",
        loader: () =>
            import("../calculators/cagr/index.js"),
        category: "investment",
        icon: "↗",
        title: "CAGR Calculator",
        relatedTools: [
            "fd",
            "sip"
        ],
        description:
            "Find the yearly growth rate that connects a starting and an ending value over a period, see how it differs from a simple average, and compare two investments on the same yearly footing.",
        aliases: [
            "compound annual growth rate",
            "annualized return calculator",
            "required cagr",
            "cagr comparison"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        relatedArticles: [
            "cagr/cagr-vs-simple-average-growth-why-80-percent-over-5-years-is-not-16-percent-cagr",
            "cagr/comparing-two-investments-over-different-periods-a-bigger-gain-is-not-a-higher-yearly-rate"
        ],
        seo: {
            title:
                "CAGR Calculator: Annual Growth Rate and Compare Investments | ToolZen Hub",
            description:
                "Find the compound annual growth rate between two values, see how it differs from a simple average, and compare two investments. Calculated from your numbers: not a forecast or advice."
        }
    },

    {
        id: "swp",
        status: "published",
        loader: () =>
            import("../calculators/swp/index.js"),
        category: "investment",
        icon: "⇩",
        title: "SWP Calculator",
        description:
            "Estimate how long a corpus could last under regular withdrawals, how much you could withdraw, or what corpus a withdrawal plan needs, for a return you assume.",
        autoRelated: false,
        relatedTools: ["sip"],
        aliases: [
            "systematic withdrawal plan",
            "retirement withdrawal",
            "retirement drawdown",
            "withdrawal plan"
        ],
        capabilities: {
            reset: true,
            compare: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "SWP Calculator: How Long Will a Corpus Last? | ToolZen Hub",
            description:
                "Estimate how long a corpus could last under regular withdrawals, how much you could withdraw, or what corpus a plan needs, for a return you assume. A projection, not a forecast."
        }
    },

    {
        id: "xirr",
        status: "published",
        loader: () =>
            import("../calculators/xirr/index.js"),
        category: "investment",
        icon: "%",
        title: "XIRR Calculator",
        relatedTools: [
            "cagr",
            "sip"
        ],
        description:
            "Find the yearly rate of return of money you put in and got back on different dates. Enter each amount with its date, or paste them, and see the annualised rate, the totals and the cash flows in date order. It runs in your browser and stores nothing.",
        aliases: [
            "xirr",
            "xirr calculator",
            "irregular cash flow return",
            "internal rate of return with dates",
            "irr with dates",
            "annualised return with dates"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            copy: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "XIRR Calculator: Annualised Return from Dated Cash Flows | ToolZen Hub",
            description:
                "Find the yearly rate of return of money paid and received on different dates. Enter or paste the dated amounts. Calculated from your figures: not a forecast or advice."
        }
    },
    /* =====================================================
       TAX
    ===================================================== */

    {
        id: "gst",
        status: "published",
        loader: () =>
            import("../calculators/gst/index.js"),
        category: "tax",
        icon: "%",
        title: "GST Calculator",
        description:
            "Add GST to an amount or take it out of one, for the rate you enter, across up to four items, with the tax by rate. Calculated from your numbers.",
        aliases: [
            "add gst",
            "remove gst",
            "gst inclusive exclusive",
            "reverse gst calculator"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        relatedTools: [
            "margin",
            "profit"
        ],
        relatedArticles: [
            "gst/adding-and-removing-gst-why-the-tax-is-not-the-same-share-both-ways",
            "gst/gst-on-a-mixed-invoice-how-the-tax-adds-up-across-rates"
        ],
        seo: {
            title:
                "GST Calculator: Add or Remove GST on an Invoice | ToolZen Hub",
            description:
                "Add GST to an amount or take it out of one, with the amount before GST, the GST and the amount with GST for up to four items and the tax by rate. Calculated from the rate you enter: not tax advice."
        }
    },

    {
        id: "income-tax",
        status: "published",
        loader: () =>
            import("../calculators/income-tax/index.js"),
        category: "tax",
        icon: "₹",
        title: "Old vs New Tax Regime Calculator",
        description:
            "Compare the estimated income tax of the old and the new regime for tax year 2026-27, with the rebate, your deductions and the deductions the old regime needs to match. For resident individuals under 60 with salary or pension income up to ₹50 lakh.",
        aliases: [
            "income tax calculator",
            "old vs new tax regime",
            "tax regime comparison",
            "new regime calculator",
            "old regime calculator",
            "salary tax calculator india",
            "new vs old regime"
        ],
        autoRelated: false,
        relatedTools: [
            "home-loan"
        ],
        capabilities: {
            reset: true,
            compare: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Old vs New Tax Regime Calculator, Tax Year 2026-27 | ToolZen Hub",
            description:
                "Compare the estimated income tax under the old and the new regime for tax year 2026-27 (FY 2026-27): slabs, rebate, standard deduction, HRA, 80C and more, with the deductions the old regime needs to match. Calculated in your browser; an estimate, not tax advice."
        }
    },

    {
        id: "gratuity",
        status: "published",
        loader: () =>
            import("../calculators/gratuity/index.js"),
        category: "tax",
        icon: "₹",
        title: "Gratuity Calculator (India)",
        description:
            "Estimate gratuity under the Code on Social Security, 2020 from your qualifying monthly wages and your joining and exit dates, with how the figure was worked out and what it assumes. For exits from 21 November 2025.",
        aliases: [
            "gratuity calculator",
            "gratuity calculator india",
            "gratuity calculation",
            "gratuity formula",
            "gratuity eligibility"
        ],
        autoRelated: false,
        relatedTools: [
            "income-tax"
        ],
        capabilities: {
            reset: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Gratuity Calculator India (Code on Social Security) | ToolZen Hub",
            description:
                "Estimate gratuity under the Code on Social Security, 2020 from your qualifying monthly wages and joining and exit dates, with how it was worked out and what it assumes. For exits from 21 November 2025. An estimate, not legal advice."
        }
    },

    {
        id: "salary-in-hand",
        status: "published",
        loader: () =>
            import("../calculators/salary-in-hand/index.js"),
        category: "tax",
        icon: "₹",
        title: "Salary / CTC to In-Hand Calculator (India)",
        description:
            "Estimate your take-home salary from your annual CTC for tax year 2026-27, step by step: employer PF and gratuity, your PF, professional tax and income tax, with what is cash and what is not. An estimate, not your payslip.",
        aliases: [
            "ctc to in hand",
            "in hand salary",
            "in hand salary calculator",
            "take home salary",
            "ctc to take home",
            "salary calculator india"
        ],
        autoRelated: false,
        relatedTools: [
            "income-tax"
        ],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Salary / CTC to In-Hand Calculator India, Tax Year 2026-27 | ToolZen Hub",
            description:
                "Estimate your in-hand salary from your annual CTC for tax year 2026-27: employer PF, gratuity, your PF, professional tax and income tax, step by step. Calculated in your browser; an estimate, not your payslip or tax advice."
        }
    },


    /* =====================================================
       HEALTH
    ===================================================== */

    {
        id: "bmi",
        status: "coming-soon",
        category: "health",
        icon: "⚖",
        title: "BMI Calculator",
        description:
            "Check your body mass index."
    },

    {
        id: "calorie",
        status: "coming-soon",
        category: "health",
        icon: "◉",
        title: "Calorie Calculator",
        description:
            "Estimate your daily calorie needs."
    },

    {
        id: "bmr",
        status: "coming-soon",
        category: "health",
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
        status: "published",
        loader: () =>
            import("../calculators/profit/index.js"),
        category: "business",
        icon: "₹",
        title: "Profit Calculator",
        description:
            "Work out your profit for a period, the break-even point and the units a target needs, and see which of price, cost, volume or fixed costs moves profit most.",
        aliases: [
            "break-even calculator",
            "business profit calculator",
            "contribution margin calculator"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Profit Calculator: Profit and Break-Even Point | ToolZen Hub",
            description:
                "Work out profit for a period from a selling price, a variable cost per unit, fixed costs and units sold, with the break-even point, the units a target profit needs and what a 10% change in price, cost, volume or fixed costs does. Calculated for the numbers you enter."
        },
        relatedArticles: [
            "profit/how-to-find-your-break-even-point",
            "profit/price-cost-or-volume-which-matters-most",
            "profit/units-needed-for-a-target-profit"
        ]
    },

    {
        id: "margin",
        status: "published",
        loader: () =>
            import("../calculators/margin/index.js"),
        category: "business",
        icon: "%",
        title: "Margin Calculator",
        description:
            "Set a selling price from a target margin or markup, see margin and markup side by side, and see what a cost change or a discount does to your profit.",
        aliases: [
            "profit margin calculator",
            "markup calculator",
            "selling price calculator"
        ],
        capabilities: {
            reset: true,
            table: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Margin Calculator: Price, Margin and Markup | ToolZen Hub",
            description:
                "Work out a selling price from a target margin or markup, see margin and markup side by side, and see what a cost change or a discount does to profit per unit. Calculated for the numbers you enter."
        },
        relatedArticles: [
            "margin/margin-vs-markup",
            "margin/price-a-product-for-a-target-margin",
            "margin/what-a-discount-really-costs-you"
        ]
    },

    {
        id: "roi",
        status: "coming-soon",
        category: "business",
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
        status: "published",
        loader: () =>
            import("../calculators/percentage/index.js"),
        category: "math",
        icon: "%",
        title: "Percentage Calculator",
        description:
            "Fill in any two of a starting value, a percentage change and an ending value to work out the third, see the change that would undo it, and the effect of a second change.",
        aliases: [
            "percentage change calculator",
            "percentage increase calculator",
            "percentage decrease calculator",
            "reverse percentage calculator",
            "original price before increase"
        ],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        relatedTools: [
            "gst",
            "margin"
        ],
        relatedArticles: [
            "percentage/why-a-20-percent-rise-then-a-20-percent-fall-does-not-get-you-back",
            "percentage/how-to-find-the-original-price-before-a-percentage-change",
            "percentage/percent-vs-percentage-points"
        ],
        seo: {
            title:
                "Percentage Calculator: Change, Reverse Percentage and Original Value | ToolZen Hub",
            description:
                "Work out a percentage change, an ending value or the original value before a change. Fill in any two values, see the change that undoes it and the effect of a second change."
        }
    },

    {
        id: "ratio",
        status: "coming-soon",
        category: "math",
        icon: "÷",
        title: "Ratio Calculator",
        description:
            "Calculate and simplify ratios."
    },

    {
        id: "age",
        status: "coming-soon",
        category: "math",
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
        icon: "↔",
        title: "Unit Converter",
        description:
            "Convert common units quickly."
    },

    {
        id: "currency",
        status: "coming-soon",
        category: "converter",
        icon: "¤",
        title: "Currency Converter",
        description:
            "Convert currencies easily."
    },


    /* =====================================================
       TIME TOOLS  (a section without categories: the tool
       names its section directly)
    ===================================================== */

    {
        id: "date-difference",
        status: "published",
        loader: () =>
            import("../tools/date-difference/index.js"),
        sectionId: "time-tools",
        icon: "◷",
        title: "Date Difference Calculator",
        description:
            "Find how many days are between two calendar dates, with the difference in years, months and days and in weeks and days.",
        aliases: [
            "days between dates",
            "date duration",
            "weeks between dates",
            "how many days between dates",
            "calendar difference"
        ],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Date Difference Calculator: Days Between Two Dates | ToolZen Hub",
            description:
                "Find the number of days between two dates, the difference in years, months and days, and in weeks. Calendar dates only: leap years and month lengths are handled, business days and holidays are not."
        }
    },

    {
        id: "date-calculator",
        status: "published",
        loader: () =>
            import("../tools/date-calculator/index.js"),
        sectionId: "time-tools",
        icon: "⊞",
        title: "Date Calculator",
        description:
            "Add or subtract days, weeks, months and years from a date, and see the resulting date and its weekday.",
        relatedTools: ["business-days"],
        aliases: [
            "add days to date",
            "subtract days from date",
            "date after days",
            "date before days",
            "add months to date",
            "subtract months from date",
            "date arithmetic"
        ],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Date Calculator: Add or Subtract Days, Weeks, Months and Years | ToolZen Hub",
            description:
                "Add or subtract days, weeks, months and years from a date and see the resulting date and weekday. Calendar dates only: month ends and leap years are handled, weekends, business days and holidays are not."
        }
    },

    {
        id: "countdown-timer",
        status: "published",
        loader: () =>
            import("../tools/countdown-timer/index.js"),
        sectionId: "time-tools",
        icon: "◔",
        title: "Countdown Timer",
        description:
            "Set a time and count down to zero, with pause and resume, a large display and the time left in the browser tab.",
        aliases: [
            "online timer",
            "timer",
            "minute timer",
            "study timer",
            "focus timer"
        ],
        relatedTools: ["stopwatch"],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            examples: false,
            localProcessing: true
        },
        seo: {
            title:
                "Countdown Timer: Online Timer for Any Time up to 24 Hours | ToolZen Hub",
            description:
                "Set hours, minutes and seconds and count down to zero, with pause, resume, presets and the time left in the tab title. It runs in your browser and keeps correct time in a background tab; it does not alert you if the page is closed."
        }
    },

    {
        id: "stopwatch",
        status: "published",
        loader: () =>
            import("../tools/stopwatch/index.js"),
        sectionId: "time-tools",
        icon: "◴",
        title: "Stopwatch",
        description:
            "Measure elapsed time from zero with start, pause, resume and laps, showing each lap time, the total and the fastest and slowest lap.",
        aliases: [
            "online stopwatch",
            "lap timer",
            "split timer",
            "elapsed time",
            "timer stopwatch"
        ],
        relatedTools: ["countdown-timer"],
        capabilities: {
            reset: true,
            realtime: true,
            multipleInputs: false,
            validation: false,
            explanation: true,
            examples: false,
            localProcessing: true
        },
        seo: {
            title:
                "Online Stopwatch with Laps | ToolZen Hub",
            description:
                "Free online stopwatch with start, pause, resume and lap times, showing each lap, the total and the fastest and slowest lap. It runs in your browser and keeps correct time in a background tab."
        }
    },


    {
        id: "business-days",
        status: "published",
        loader: () =>
            import("../tools/business-days/index.js"),
        sectionId: "time-tools",
        icon: "⌗",
        title: "Business Days Calculator",
        description:
            "Add or subtract business days from a date, or count the business days between two dates, with the weekend days you choose and the holidays you type.",
        autoRelated: false,
        relatedTools: ["date-calculator", "date-difference"],
        aliases: [
            "business day calculator",
            "working days calculator",
            "add business days",
            "workdays between dates",
            "working day counter"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Business Days Calculator: Add, Subtract and Count Working Days | ToolZen Hub",
            description:
                "Free business days calculator: add or subtract working days from a date, or count the working days between two dates. Choose your weekend and type the holidays to skip. It runs in your browser."
        }
    },


    {
        id: "time-duration",
        status: "published",
        loader: () =>
            import("../tools/time-duration/index.js"),
        sectionId: "time-tools",
        icon: "∑",
        title: "Time Duration Calculator",
        description:
            "Add and subtract lengths of time such as 1:45 or 2h 30m, and read the total as hours, minutes and seconds and as decimal hours.",
        autoRelated: false,
        relatedTools: ["hours-calculator", "date-difference"],
        aliases: [
            "add time",
            "time addition calculator",
            "add hours and minutes",
            "subtract time",
            "hours minutes seconds calculator"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Time Duration Calculator: Add and Subtract Hours, Minutes and Seconds | ToolZen Hub",
            description:
                "Free time duration calculator: add and subtract lengths of time such as 1:45 or 2h 30m and see the total as hours, minutes and seconds, decimal hours and total minutes. It runs in your browser."
        }
    },


    {
        id: "shift-planner",
        status: "published",
        loader: () =>
            import("../tools/shift-planner/index.js"),
        sectionId: "time-tools",
        icon: "▦",
        title: "Shift Schedule Planner",
        description:
            "Place a repeating shift pattern such as 4 days on and 4 off on the calendar, with your shift times, and see each date as a day, evening, night or off shift.",
        autoRelated: false,
        relatedTools: ["hours-calculator", "date-calculator"],
        aliases: [
            "shift rotation calendar",
            "shift pattern calendar",
            "rota planner",
            "4 on 4 off calendar",
            "rotating shift schedule"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Shift Schedule Planner: Calendar for Rotating Shift Patterns | ToolZen Hub",
            description:
                "Free shift schedule planner: lay a repeating pattern such as 4 on 4 off or a day and night rotation onto the calendar and see every shift, the hours scheduled and the longest run on and off. It runs in your browser."
        }
    },


    {
        id: "pomodoro-timer",
        status: "published",
        loader: () =>
            import("../tools/pomodoro-timer/index.js"),
        sectionId: "time-tools",
        icon: "◔",
        title: "Pomodoro Focus Timer",
        description:
            "Work in timed focus periods with short breaks and a longer break after every few, with settings you can change and a count of the focus periods you completed.",
        autoRelated: false,
        relatedTools: ["interval-timer", "countdown-timer"],
        aliases: [
            "pomodoro timer",
            "pomodoro technique timer",
            "work and break timer"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            realtime: true,
            timer: true,
            multipleInputs: true,
            localProcessing: true
        },
        seo: {
            title:
                "Pomodoro Timer: Focus Periods and Breaks | ToolZen Hub",
            description:
                "Free Pomodoro timer: focus periods, short breaks and a long break after every few, with lengths you set. It shows the time left in the tab title and keeps correct time in a background tab. It runs in your browser."
        }
    },


    {
        id: "interval-timer",
        status: "published",
        loader: () =>
            import("../tools/interval-timer/index.js"),
        sectionId: "time-tools",
        icon: "◑",
        title: "Interval and Routine Timer",
        description:
            "Repeat timed work and rest stages for a number of rounds, with an optional get-ready time and cool-down, and name your own stages for any routine.",
        autoRelated: false,
        relatedTools: ["pomodoro-timer", "countdown-timer"],
        aliases: [
            "interval timer",
            "hiit timer",
            "tabata timer",
            "workout interval timer",
            "routine timer"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            realtime: true,
            timer: true,
            multipleInputs: true,
            localProcessing: true
        },
        seo: {
            title:
                "Interval Timer: Work and Rest Rounds for Workouts and Routines | ToolZen Hub",
            description:
                "Free interval timer: repeat work and rest stages for any number of rounds, with get-ready and cool-down, and name your own stages. It shows the time left in the tab title and runs in your browser."
        }
    },


    {
        id: "meeting-planner",
        status: "published",
        loader: () =>
            import("../tools/meeting-planner/index.js"),
        sectionId: "time-tools",
        icon: "⌖",
        title: "International Meeting Planner",
        description:
            "Find meeting times inside everyone's own hours across time zones: two to four people, their days and hours (overnight allowed), up to 14 days, with clock changes handled.",
        autoRelated: false,
        relatedTools: ["time-zone-converter", "world-clock"],
        aliases: [
            "meeting time planner",
            "schedule meeting across time zones",
            "find a meeting time",
            "international meeting scheduler",
            "best time to meet"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            localProcessing: true
        },
        seo: {
            title:
                "International Meeting Planner: Find a Time Across Time Zones | ToolZen Hub",
            description:
                "Free meeting planner: add two to four people with their time zones, days and hours, and find the times that suit everyone over the next days. Handles overnight hours and clock changes. It runs in your browser."
        }
    },


    {
        id: "time-zone-converter",
        status: "published",
        loader: () =>
            import("../tools/time-zone-converter/index.js"),
        sectionId: "time-tools",
        icon: "◷",
        title: "Time Zone Converter",
        description:
            "Convert a date and time from one time zone to others, with daylight-saving gaps and repeated hours explained, and find times that fall inside everyone's preferred hours. It runs in your browser.",
        autoRelated: false,
        relatedTools: ["unix-timestamp-converter", "meeting-planner"],
        aliases: [
            "time zone converter",
            "timezone converter",
            "time converter",
            "convert time zones",
            "world time converter",
            "meeting time converter",
            "international time converter",
            "time difference between countries",
            "meeting overlap"
        ],
        capabilities: {
            copy: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            realtime: true,
            urlState: true,
            localProcessing: true
        },
        seo: {
            title:
                "Time Zone Converter and Meeting Time Planner | ToolZen Hub",
            description:
                "Free time zone converter: turn a date and time in one zone into others, with daylight-saving gaps and repeated hours explained, and find times inside everyone's preferred hours. It runs in your browser: nothing is uploaded and your location is not requested."
        }
    },


    {
        id: "world-clock",
        status: "published",
        loader: () =>
            import("../tools/world-clock/index.js"),
        sectionId: "time-tools",
        icon: "◶",
        title: "World Clock",
        description:
            "Browse the current time in 195 cities and other time zones, search by city, country or the time it is now, and keep a shareable board of city clocks. It runs in your browser.",
        autoRelated: false,
        relatedTools: ["time-zone-converter", "meeting-planner"],
        aliases: [
            "world clock",
            "world time",
            "current time in cities",
            "city clocks",
            "multiple clocks",
            "time in different cities"
        ],
        capabilities: {
            share: true,
            urlState: true,
            realtime: true,
            timer: true,
            multipleInputs: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "World Clock: Live Time in Cities and Time Zones | ToolZen Hub",
            description:
                "Free world clock: browse the time in 195 cities, search by city or by the time it is now, such as 8 PM, and keep a shareable board. Runs in your browser."
        }
    },


    {
        id: "hours-calculator",
        status: "published",
        loader: () =>
            import("../tools/hours-calculator/index.js"),
        sectionId: "time-tools",
        icon: "Σ",
        title: "Hours & Timesheet Calculator",
        description:
            "Add up the hours you worked across several shifts: enter start and end times and unpaid breaks, including overnight shifts, and see each shift and the total in hours and minutes and in decimal hours. It runs in your browser.",
        autoRelated: false,
        relatedTools: ["shift-planner"],
        aliases: [
            "hours calculator",
            "hours worked calculator",
            "work hours calculator",
            "timesheet calculator",
            "time card calculator",
            "shift hours calculator",
            "overnight hours calculator",
            "calculate hours worked",
            "total hours calculator"
        ],
        capabilities: {
            reset: true,
            validation: true,
            explanation: true,
            examples: true,
            multipleInputs: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Hours Worked Calculator: Shifts, Breaks and Total Hours | ToolZen Hub",
            description:
                "Free hours worked calculator: enter start and end times for each shift, take off unpaid breaks, including overnight shifts, and see each shift and the total in hours and minutes and in decimal hours. It runs in your browser."
        }
    },


    /* =====================================================
       DEVELOPER TOOLS
    ===================================================== */

    {
        id: "json-formatter",
        status: "published",
        loader: () =>
            import("../tools/json-formatter/index.js"),
        sectionId: "developer-tools",
        icon: "{ }",
        title: "JSON Formatter & Validator",
        description:
            "Check JSON against the strict standard, see exactly where it breaks, and format or minify it. It runs in your browser.",
        relatedTools: ["jsonpath-tester", "json-compare", "json-csv-converter", "unix-timestamp-converter"],
        aliases: [
            "json formatter",
            "json validator",
            "format json",
            "pretty json",
            "pretty print json",
            "beautify json",
            "minify json",
            "validate json",
            "json viewer"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "JSON Formatter & Validator | ToolZen Hub",
            description:
                "Free online JSON formatter and validator. Check strict JSON, see the line and column of an error, then format or minify it. It runs in your browser: your JSON is not uploaded."
        }
    },

    {
        id: "unix-timestamp-converter",
        status: "published",
        loader: () =>
            import("../tools/unix-timestamp-converter/index.js"),
        sectionId: "developer-tools",
        icon: "⇄",
        title: "Unix Timestamp Converter",
        description:
            "Convert Unix timestamps in seconds, milliseconds, microseconds or nanoseconds to a date, and a date and time zone back to a timestamp, with daylight-saving gaps and overlaps explained. It runs in your browser.",
        relatedTools: ["jwt-decoder", "cron-expression-explainer", "json-formatter"],
        aliases: [
            "unix timestamp",
            "epoch converter",
            "epoch time",
            "timestamp converter",
            "unix time converter",
            "timestamp to date",
            "date to timestamp",
            "epoch to date",
            "milliseconds timestamp",
            "unix milliseconds"
        ],
        capabilities: {
            reset: true,
            copy: true,
            table: true,
            unitSelection: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Unix Timestamp Converter | ToolZen Hub",
            description:
                "Free Unix timestamp converter: seconds, milliseconds, microseconds or nanoseconds to a date, and a date and time zone back to a timestamp. It flags daylight-saving gaps and overlaps, converts a batch and runs in your browser."
        }
    },

    {
        id: "text-diff",
        status: "published",
        loader: () =>
            import("../tools/text-diff/index.js"),
        sectionId: "developer-tools",
        icon: "≠",
        title: "Text Diff / Compare",
        description:
            "Paste two versions of a text and see what was added, removed and changed, line by line with the changed words marked. It runs in your browser.",
        autoRelated: false,
        relatedTools: ["json-compare", "list-comparer", "json-formatter"],
        aliases: [
            "text diff",
            "diff checker",
            "compare text",
            "text compare",
            "compare two texts",
            "difference between two texts",
            "code diff",
            "prompt comparison",
            "compare versions"
        ],
        capabilities: {
            reset: true,
            copy: true,
            examples: true,
            multipleInputs: true,
            explanation: true,
            realtime: true,
            localProcessing: true
        },
        seo: {
            title:
                "Text Diff Checker: Compare Two Texts | ToolZen Hub",
            description:
                "Free online text diff checker. Paste two versions to see added, removed and changed lines with the changed words marked, optionally ignore whitespace-only changes, and copy a unified diff. It runs in your browser: your text is not uploaded."
        }
    },

    {
        id: "jwt-decoder",
        status: "published",
        loader: () =>
            import("../tools/jwt-decoder/index.js"),
        sectionId: "developer-tools",
        icon: "JWT",
        title: "JWT Decoder",
        description:
            "Read the header and payload of a JSON Web Token, see its claims explained and its times as dates. It does not check the signature. It runs in your browser.",
        autoRelated: false,
        relatedTools: ["unix-timestamp-converter", "base64-encoder-decoder", "json-formatter"],
        aliases: [
            "jwt decoder",
            "decode jwt",
            "jwt parser",
            "jwt viewer",
            "jwt payload viewer",
            "jwt claims",
            "jwt expiry",
            "json web token decoder",
            "jwt exp"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "JWT Decoder: Read a Token's Header and Claims | ToolZen Hub",
            description:
                "Free JWT decoder: paste a token to read its header and payload, see exp, nbf and iat as dates and compare them with your device clock. It does not verify the signature. It runs in your browser: your token is not uploaded."
        }
    },

    {
        id: "cron-expression-explainer",
        status: "published",
        loader: () =>
            import("../tools/cron-explainer/index.js"),
        sectionId: "developer-tools",
        icon: "* * *",
        title: "Cron Expression Explainer",
        description:
            "Paste a five-field cron expression written in cronie crontab syntax to see what each field means, a plain-language summary and the next five matching times in UTC. It checks the syntax, says what it does not support and runs in your browser.",
        autoRelated: false,
        relatedTools: ["unix-timestamp-converter"],
        aliases: [
            "cron expression explainer",
            "explain cron expression",
            "crontab explainer",
            "cron expression",
            "crontab syntax",
            "cron schedule explained",
            "cron next run times"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Cron Expression Explainer: Read a Crontab Schedule | ToolZen Hub",
            description:
                "Paste a five-field cron expression written in cronie crontab syntax to see what each field means, a plain-language summary and the next five matching times in UTC. It checks the syntax and runs in your browser."
        }
    },

    {
        id: "base64-encoder-decoder",
        status: "published",
        loader: () =>
            import("../tools/base64-encoder-decoder/index.js"),
        sectionId: "developer-tools",
        icon: "64",
        title: "Base64 Encoder & Decoder",
        description:
            "Encode text to Base64 or decode Base64 back to text, with UTF-8 support and a clear message for invalid input. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["jwt-decoder", "url-parser", "json-formatter"],
        aliases: [
            "base64 encoder",
            "base64 decoder",
            "base64 encode",
            "base64 decode",
            "base64 converter",
            "text to base64",
            "base64 to text",
            "base64url"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "Base64 Encoder & Decoder: Convert Text Online | ToolZen Hub",
            description:
                "Encode text to Base64 or decode Base64 back to text, with UTF-8 support and clear errors for invalid input. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "url-parser",
        status: "published",
        loader: () =>
            import("../tools/url-parser/index.js"),
        sectionId: "developer-tools",
        icon: "://",
        title: "URL Parser & Encoder",
        description:
            "Take a URL apart into its scheme, host, path, query parameters and fragment, see what the browser changed, and percent-encode, decode or build query strings. It runs in your browser: no address is opened or sent.",
        autoRelated: false,
        relatedTools: ["base64-encoder-decoder", "json-formatter"],
        aliases: [
            "url parser",
            "parse url",
            "url encoder",
            "url decoder",
            "url encode",
            "url decode",
            "percent encoding",
            "query string parser",
            "query string builder"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "URL Parser & Encoder: Parse, Encode and Decode URLs | ToolZen Hub",
            description:
                "Parse a URL into its parts and query parameters, see what the browser normalized, and percent-encode, decode or build query strings. It runs in your browser: no address is opened or sent."
        }
    },

    {
        id: "json-compare",
        status: "published",
        loader: () =>
            import("../tools/json-compare/index.js"),
        sectionId: "developer-tools",
        icon: "{≠}",
        title: "JSON Compare",
        description:
            "Compare two JSON documents as data: see what was added, removed, changed or changed in type, with the path of each and a JSON Patch. Key order and number formatting are not differences. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["json-formatter", "text-diff", "jsonpath-tester"],
        aliases: [
            "json compare",
            "compare json",
            "json diff",
            "json difference",
            "json patch generator"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "JSON Compare: Find the Differences Between Two JSON Documents | ToolZen Hub",
            description:
                "Compare two JSON documents as data: see what was added, removed, changed or changed in type, with the path of each and a JSON Patch. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "jsonpath-tester",
        status: "published",
        loader: () =>
            import("../tools/jsonpath-tester/index.js"),
        sectionId: "developer-tools",
        icon: "$.*",
        title: "JSONPath Tester",
        description:
            "Run a JSONPath query (RFC 9535, without match() and search()) on a JSON document and see the exact nodes it selects with their paths, and where an empty result stopped matching. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["json-formatter", "json-compare"],
        aliases: [
            "jsonpath",
            "json path",
            "jsonpath tester",
            "jsonpath evaluator",
            "json path query",
            "rfc 9535"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "JSONPath Tester: Run RFC 9535 JSONPath Queries on JSON | ToolZen Hub",
            description:
                "Run a JSONPath query on a JSON document and see the exact nodes it selects, with their paths and a trace of where an empty result stopped matching. It runs in your browser: nothing is uploaded."
        }
    },


    {
        id: "smart-flashcards",
        status: "published",
        loader: () =>
            import("../tools/smart-flashcards/index.js"),
        sectionId: "developer-tools",
        icon: "🗂",
        title: "Smart Flashcards",
        description:
            "Revise JSON, HTTP and APIs, and software testing with short original flashcards. Think of the answer, check it and read why. Revision dates are saved only if you turn saving on. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["json-formatter", "jsonpath-tester"],
        aliases: [
            "flashcards",
            "study flashcards",
            "revision cards",
            "spaced repetition flashcards",
            "json flashcards",
            "http flashcards",
            "software testing flashcards"
        ],
        capabilities: {
            download: true,
            explanation: true,
            localProcessing: true,
            modal: true
        },
        seo: {
            title:
                "Smart Flashcards: JSON, HTTP and Software Testing Revision Cards | ToolZen Hub",
            description:
                "Revise JSON, HTTP and APIs, and software testing with short original flashcards that explain every answer. Progress is saved only if you choose. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "json-error-fixing-lab",
        status: "published",
        loader: () =>
            import("../tools/json-error-fixing-lab/index.js"),
        sectionId: "developer-tools",
        icon: "🛠",
        title: "JSON Error-Fixing Lab",
        description:
            "Practise repairing broken JSON: trailing commas, wrong quotes, missing brackets, bad escapes and more. Each repair is checked by a strict validator, and every exercise explains why. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["json-formatter", "smart-flashcards"],
        aliases: [
            "fix invalid json",
            "json practice",
            "json exercises",
            "json error practice",
            "repair json",
            "json validation practice"
        ],
        capabilities: {
            examples: true,
            explanation: true,
            localProcessing: true,
            reset: true,
            validation: true
        },
        seo: {
            title:
                "JSON Error-Fixing Lab: Practise Repairing Invalid JSON | ToolZen Hub",
            description:
                "Practise fixing invalid JSON with 18 exercises: trailing commas, single quotes, bad escapes, truncated text and more. A strict validator checks each repair. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "jsonpath-challenge-lab",
        status: "published",
        loader: () =>
            import("../tools/jsonpath-challenge-lab/index.js"),
        sectionId: "developer-tools",
        icon: "🎯",
        title: "JSONPath Challenge Lab",
        description:
            "Practise writing JSONPath queries against a built-in document. Each query is run by an RFC 9535 engine and judged by the nodes it selects, with feedback on what you got and what you missed. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["jsonpath-tester", "smart-flashcards"],
        aliases: [
            "jsonpath practice",
            "jsonpath exercises",
            "jsonpath challenges",
            "learn jsonpath",
            "jsonpath practice questions"
        ],
        capabilities: {
            examples: true,
            explanation: true,
            localProcessing: true,
            reset: true,
            validation: true
        },
        seo: {
            title:
                "JSONPath Challenge Lab: Practise JSONPath Queries | ToolZen Hub",
            description:
                "Practise JSONPath with 19 exercises on a built-in document: child, wildcard, slice, descendant and filter selectors. An RFC 9535 engine checks the nodes you select. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "cron-challenge-lab",
        status: "published",
        loader: () =>
            import("../tools/cron-challenge-lab/index.js"),
        sectionId: "developer-tools",
        icon: "⏰",
        title: "Cron Challenge Lab",
        description:
            "Practise writing cron expressions for described schedules. Each expression is read by a Cronie-dialect engine and judged by the schedule it describes, with its next run times shown. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["cron-expression-explainer", "smart-flashcards"],
        aliases: [
            "cron practice",
            "cron exercises",
            "cron challenges",
            "learn cron",
            "crontab practice"
        ],
        capabilities: {
            examples: true,
            explanation: true,
            localProcessing: true,
            reset: true,
            validation: true
        },
        seo: {
            title:
                "Cron Challenge Lab: Practise Cron Expressions | ToolZen Hub",
            description:
                "Practise writing cron expressions with 19 exercises, from every minute to leap days and the day-of-month rule. A Cronie-dialect engine checks the schedule. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "list-comparer",
        status: "published",
        loader: () =>
            import("../tools/list-comparer/index.js"),
        sectionId: "developer-tools",
        icon: "⇄",
        title: "List Comparer",
        description:
            "Compare two lists, one item per line: see what is only in the first, only in the second, in both, and what is repeated, with case and spacing rules you choose. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["text-diff", "json-compare"],
        aliases: [
            "list comparer",
            "compare lists",
            "list compare",
            "list difference",
            "list intersection",
            "find duplicates",
            "common items",
            "set difference"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "List Comparer: Compare Two Lists and Find Differences and Duplicates | ToolZen Hub",
            description:
                "Compare two lists line by line: items only in the first, only in the second, in both, and repeated items, with case and spacing options. It runs in your browser: nothing is uploaded."
        }
    },


    {
        id: "uuid-generator",
        status: "published",
        loader: () =>
            import("../tools/uuid-generator/index.js"),
        sectionId: "developer-tools",
        icon: "ID",
        title: "UUID Generator",
        description:
            "Generate version 4 (random) or version 7 (time-ordered) UUIDs, or the nil UUID, one or many, with uppercase, hyphen and brace options. It runs in your browser: nothing is sent or stored.",
        autoRelated: false,
        relatedTools: ["base64-encoder-decoder", "jwt-decoder"],
        aliases: [
            "uuid generator",
            "uuid",
            "guid",
            "guid generator",
            "uuid v4",
            "uuid v7",
            "random uuid",
            "generate uuid"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: false,
            localProcessing: true
        },
        seo: {
            title:
                "UUID Generator: Version 4 and Version 7 UUIDs, Bulk and Formatted | ToolZen Hub",
            description:
                "Generate version 4 (random) or version 7 (time-ordered) UUIDs, or the nil UUID, one or many, with case, hyphen and brace options. It runs in your browser: nothing is sent or stored."
        }
    },


    {
        id: "json-csv-converter",
        status: "published",
        loader: () =>
            import("../tools/json-csv/index.js"),
        sectionId: "developer-tools",
        icon: "CSV",
        title: "JSON and CSV Converter",
        description:
            "Convert a JSON array of objects to CSV, or CSV to JSON, with RFC 4180 quoting, a choice of delimiter, nested values never flattened silently and spreadsheet formulas neutralized. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: ["json-formatter", "json-compare"],
        aliases: [
            "json to csv",
            "csv to json",
            "json csv",
            "csv json",
            "convert json to csv",
            "convert csv to json",
            "csv converter",
            "json converter"
        ],
        capabilities: {
            reset: true,
            copy: true,
            validation: true,
            explanation: true,
            examples: true,
            localProcessing: true
        },
        seo: {
            title:
                "JSON to CSV and CSV to JSON Converter | ToolZen Hub",
            description:
                "Convert a JSON array of objects to CSV or CSV to JSON with RFC 4180 quoting, delimiter choice and spreadsheet formula protection. It runs in your browser: nothing is uploaded."
        }
    },

    {
        id: "image-compressor-resizer",
        status: "published",
        loader: () =>
            import("../tools/image-compressor-resizer/index.js"),
        sectionId: "image-tools",
        icon: "▣",
        title: "Image Compressor & Resizer",
        description:
            "Make JPEG, PNG or WebP images smaller in dimensions and file size, keep them under a size you choose, rotate, flip or crop one, or change many at once, and see an honest before and after. It runs in your browser: nothing is uploaded.",
        autoRelated: false,
        relatedTools: [],
        aliases: [
            "image compressor",
            "compress image",
            "image resizer",
            "resize image",
            "reduce image size",
            "image size reducer",
            "compress jpg",
            "compress png",
            "resize photo",
            "compress image online",
            "compress multiple images",
            "batch image compressor",
            "batch resize images",
            "crop image",
            "rotate image",
            "flip image",
            "convert image",
            "png to jpg",
            "jpg to png",
            "webp to jpg",
            "jpg to webp"
        ],
        capabilities: {
            reset: true,
            download: true,
            presets: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Image Compressor & Resizer | ToolZen Hub",
            description:
                "Free image compressor and resizer for JPEG, PNG and WebP. Process one image or many, set new dimensions, rotate, flip or crop, choose a quality or keep the file under a size, and see the actual before and after. It runs in your browser: your images are not uploaded."
        }
    },

    {
        id: "photos-to-pdf",
        status: "published",
        loader: () =>
            import("../tools/photos-to-pdf/index.js"),
        sectionId: "image-tools",
        icon: "▤",
        title: "Photos to PDF",
        description:
            "Put several photos into one PDF, in the order you choose, with a page size and margin you pick. It runs in your browser: your photos are not uploaded.",
        autoRelated: false,
        relatedTools: ["image-compressor-resizer"],
        aliases: [
            "photos to pdf",
            "jpg to pdf",
            "images to pdf",
            "combine images into pdf",
            "picture to pdf",
            "photo to pdf",
            "png to pdf"
        ],
        capabilities: {
            reset: true,
            download: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Photos to PDF: Combine Pictures into One PDF | ToolZen Hub",
            description:
                "Free photos to PDF tool for JPEG, PNG and WebP. Put several photos into one PDF in the order you choose, with A4, Letter or photo-sized pages. It runs in your browser: your photos are not uploaded."
        }
    },

    {
        id: "merge-pdf",
        status: "published",
        loader: () =>
            import("../tools/merge-pdf/index.js"),
        sectionId: "pdf-tools",
        icon: "⊕",
        title: "Merge PDF",
        description:
            "Join several PDFs into one PDF, in the order you choose. It runs in your browser: your PDFs are not uploaded.",
        autoRelated: false,
        relatedTools: ["split-pdf", "pdf-pages"],
        aliases: [
            "merge pdf",
            "combine pdf",
            "join pdf",
            "pdf merger",
            "merge pdf files",
            "combine pdf files",
            "join pdf files"
        ],
        capabilities: {
            reset: true,
            download: true,
            multipleInputs: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Merge PDF: Combine PDF Files into One | ToolZen Hub",
            description:
                "Free merge PDF tool. Join several PDF files into one PDF in the order you choose. It runs in your browser: your PDFs are not uploaded."
        }
    },

    {
        id: "split-pdf",
        status: "published",
        loader: () =>
            import("../tools/split-pdf/index.js"),
        sectionId: "pdf-tools",
        icon: "⑂",
        title: "Split PDF",
        description:
            "Cut one PDF into smaller PDFs, every few pages or at page ranges you choose. It runs in your browser: your PDF is not uploaded.",
        autoRelated: false,
        relatedTools: ["pdf-pages", "merge-pdf"],
        aliases: [
            "split pdf",
            "pdf splitter",
            "cut pdf",
            "divide pdf",
            "split pdf into parts",
            "split pdf pages"
        ],
        capabilities: {
            reset: true,
            download: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Split PDF: Cut a PDF into Parts | ToolZen Hub",
            description:
                "Free split PDF tool. Cut one PDF into smaller PDFs, every few pages or at page ranges you choose. It runs in your browser: your PDF is not uploaded."
        }
    },

    {
        id: "pdf-pages",
        status: "published",
        loader: () =>
            import("../tools/pdf-pages/index.js"),
        sectionId: "pdf-tools",
        icon: "⇅",
        title: "Extract, Reorder and Rotate PDF Pages",
        description:
            "Make a new PDF from the pages you choose, in the order you choose, and turn sideways pages. It runs in your browser: your PDF is not uploaded.",
        autoRelated: false,
        relatedTools: ["merge-pdf", "split-pdf"],
        aliases: [
            "extract pdf pages",
            "reorder pdf pages",
            "rotate pdf pages",
            "rotate pdf",
            "delete pdf pages",
            "remove pdf pages",
            "rearrange pdf pages",
            "organize pdf pages",
            "pdf page organizer"
        ],
        capabilities: {
            reset: true,
            download: true,
            validation: true,
            explanation: true,
            localProcessing: true
        },
        seo: {
            title:
                "Extract, Reorder and Rotate PDF Pages | ToolZen Hub",
            description:
                "Free tool to extract, reorder, delete and rotate PDF pages. Choose the pages and their order, turn sideways pages, and download a new PDF. It runs in your browser: your PDF is not uploaded."
        }
    }

];


/* =========================================================
   Status
========================================================= */

const STATUSES = Object.freeze([
    "published",
    "coming-soon"
]);

const ID_PATTERN =
    /^[a-z0-9]+(-[a-z0-9]+)*$/;


/* =========================================================
   Route
   A tool's page lives under its section's route prefix
   (data/categories.js). One resolver for every tool.
========================================================= */

export function getToolRoute(
    tool
) {

    const section =
        getSectionForTool(tool);

    return ROUTES.tool(
        section.pathPrefix,
        tool.id
    );

}


/* =========================================================
   Tools
   Catalog entries + derived fields (see the header), checked
   as they are built. buildToolCatalog is exported so the
   checks themselves can be tested with sample entries.
========================================================= */

function fail(
    id,
    message
) {

    throw new Error(
        `Tool "${id}": ${message}`
    );

}

function isText(
    value
) {

    return (
        typeof value === "string" &&
        value.trim() !== ""
    );

}

export function buildToolCatalog(
    entries
) {

    const ids = new Set();

    const sitePaths = new Map();

    const built = entries.map(
        entry => {

            const id =
                entry.id;

            if (
                typeof id !== "string" ||
                !ID_PATTERN.test(id)
            ) {

                throw new Error(
                    `Tool id ${JSON.stringify(id)} must be a ` +
                    "lower-case slug (letters, digits, hyphens)"
                );

            }

            if (ids.has(id)) {
                fail(id, "duplicate id");
            }

            ids.add(id);

            if (!isText(entry.title)) {
                fail(id, "missing title");
            }

            if (!isText(entry.description)) {
                fail(id, "missing description");
            }

            if (!STATUSES.includes(entry.status)) {

                fail(
                    id,
                    `status must be ${STATUSES.join(" or ")}, ` +
                    `not ${JSON.stringify(entry.status)}`
                );

            }

            /*
             * A tool sits under a category (Calculators) or directly under a
             * section (`sectionId`, for a section without categories), not both.
             */

            if (entry.sectionId !== undefined) {

                if (entry.category !== undefined) {

                    fail(
                        id,
                        "names a category and a sectionId; use one"
                    );

                }

                if (!getSectionForTool(entry)) {

                    fail(
                        id,
                        `unknown sectionId ${JSON.stringify(entry.sectionId)}`
                    );

                }

            } else if (
                !categories.some(
                    category =>
                        category.id === entry.category
                )
            ) {

                fail(
                    id,
                    `unknown category ${JSON.stringify(entry.category)}`
                );

            }

            if ("type" in entry) {

                fail(
                    id,
                    "the old `type` field was removed; " +
                    "use `toolType` (data/tool-capabilities.js)"
                );

            }

            const published =
                entry.status === "published";

            if (
                published &&
                typeof entry.loader !== "function"
            ) {

                fail(
                    id,
                    "is published but has no loader " +
                    "(loader: () => import(\"...\"))"
                );

            }

            if (
                !published &&
                entry.loader !== undefined
            ) {

                fail(
                    id,
                    `is "${entry.status}", so it must not have a loader`
                );

            }

            const section =
                getSectionForTool(entry);

            if (!section) {

                fail(
                    id,
                    `category "${entry.category}" has no section ` +
                    "(data/categories.js)"
                );

            }

            const {
                toolType,
                capabilities
            } = describeTool(entry);

            const sitePath =
                `/${section.pathPrefix}/${id}/`;

            if (sitePaths.has(sitePath)) {

                fail(
                    id,
                    `its page ${sitePath} is already used by ` +
                    `"${sitePaths.get(sitePath)}"`
                );

            }

            sitePaths.set(sitePath, id);

            return {
                ...entry,
                toolType,
                capabilities,
                section: section.title,
                sitePath,
                href:
                    getToolRoute(entry),
                available: published
            };

        }
    );

    for (const tool of built) {

        for (const related of tool.relatedTools ?? []) {

            if (!ids.has(related)) {

                fail(
                    tool.id,
                    `relatedTools names unknown tool "${related}"`
                );

            }

        }

    }

    return built;

}

export const tools =
    buildToolCatalog(catalog);


/* =========================================================
   Generic helpers (any kind of tool)
========================================================= */

export function getTools() {

    return tools;

}

export function getPublishedTools() {

    return tools.filter(
        tool =>
            tool.available
    );

}

export function getToolById(
    id
) {

    return tools.find(
        tool =>
            tool.id === id
    );

}

export function getToolsByCategory(
    categoryId
) {

    return tools.filter(
        tool =>
            tool.category === categoryId
    );

}


/*
 * What the shared tool page and the breadcrumb need to know
 * about a tool: { section, category, subcategory?, title }.
 */

export function getToolMetadata(
    tool
) {

    return {
        section: tool.section,
        ...(tool.category
            ? { category: tool.category }
            : {}),
        ...(tool.subcategory
            ? { subcategory: tool.subcategory }
            : {}),
        title: tool.title
    };

}
