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
    getSectionForCategory
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
        status: "coming-soon",
        category: "investment",
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
        icon: "%",
        title: "GST Calculator",
        description:
            "Calculate GST easily and accurately."
    },

    {
        id: "income-tax",
        status: "coming-soon",
        category: "tax",
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
        status: "coming-soon",
        category: "math",
        icon: "%",
        title: "Percentage Calculator",
        description:
            "Calculate percentages easily."
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

    {
        id: "date",
        status: "coming-soon",
        category: "converter",
        icon: "▣",
        title: "Date Calculator",
        description:
            "Calculate dates and date differences."
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
        getSectionForCategory(
            tool?.category
        );

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

            if (
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
                getSectionForCategory(
                    entry.category
                );

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
        category: tool.category,
        ...(tool.subcategory
            ? { subcategory: tool.subcategory }
            : {}),
        title: tool.title
    };

}
