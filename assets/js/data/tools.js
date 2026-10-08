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
        status: "published",
        loader: () =>
            import("../calculators/home-loan/index.js"),
        category: "loans",
        icon: "⌂",
        title: "Home Loan Calculator",
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
        status: "coming-soon",
        category: "investment",
        icon: "₹",
        title: "PPF Calculator",
        description:
            "Calculate PPF investment returns."
    },

    {
        id: "fd",
        status: "published",
        loader: () =>
            import("../calculators/fd/index.js"),
        category: "investment",
        icon: "▣",
        title: "FD Calculator",
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
        relatedTools: ["unix-timestamp-converter"],
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
        relatedTools: [],
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
        relatedTools: ["unix-timestamp-converter"],
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
        relatedTools: ["json-formatter"],
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
        relatedTools: ["json-formatter"],
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
        relatedTools: ["json-formatter", "unix-timestamp-converter"],
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
        id: "image-compressor-resizer",
        status: "published",
        loader: () =>
            import("../tools/image-compressor-resizer/index.js"),
        sectionId: "image-tools",
        icon: "▣",
        title: "Image Compressor & Resizer",
        description:
            "Make a JPEG, PNG or WebP smaller in dimensions and file size, or keep it under a size you choose, and see an honest before and after. It runs in your browser: nothing is uploaded.",
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
            "compress image online"
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
                "Free image compressor and resizer for JPEG, PNG and WebP. Set new dimensions, choose a quality or keep the file under a size, and see the actual before and after. It runs in your browser: your image is not uploaded."
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
