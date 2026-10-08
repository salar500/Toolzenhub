/* =========================================================
   ToolZen Hub
   Category Data

   The authoritative hierarchy data (see data/taxonomy.js for
   the lookups that resolve it):

       Section -> Major category -> Subcategory (optional)
                                      -> Tool -> Articles

   Items refer to each other by stable id, never by title or
   position. A tool can sit directly under a major category.

   A category names its parent section with `sectionId`. A tool
   is NOT given a section of its own: it is derived from the
   tool's category (tool -> category -> section).

   `landing` names the ROUTES key of the item's own page. An
   item without `landing` has no page of its own.
========================================================= */


/* =========================================================
   SECTIONS

   Top-level product areas. "Calculators" is the only section
   today; its page is the categories page.

   id           stable identifier (categories refer to it)
   title        label shown to visitors
   landing      ROUTES key of the section's own page
   summary      one line for the Home "Explore Tools" card
   icon         the card's symbol
   pathPrefix   first URL segment of the section's tool pages:
                /{pathPrefix}/{tool id}/  ("calculators" keeps
                every existing tool URL as it is)
========================================================= */

export const sections = [

    {
        id: "calculators",
        title: "Calculators",
        description:
            "Calculators for loans, investment, tax, business and math.",
        summary:
            "Loans, investment, business, tax and math calculators",
        icon: "🧮",
        landing: "calculatorCategories",
        pathPrefix: "calculators"
    },

    /*
     * Time Tools has no categories: its tools sit directly under the
     * section (a tool names `sectionId: "time-tools"` instead of a
     * category). Subcategories come only when several live tools make
     * grouping help.
     */
    {
        id: "time-tools",
        title: "Time Tools",
        description:
            "Practical date and time utilities.",
        seoDescription:
            "Time Tools from ToolZen Hub: date utilities such as the days between two dates, a countdown timer, a stopwatch and a time zone converter.",
        summary:
            "Date tools, timers and a time zone converter",
        icon: "📅",
        landing: "timeTools",
        pathPrefix: "tools"
    },

    /*
     * Developer Tools, like Time Tools, has no categories: its tools sit
     * directly under the section. One live tool does not need a grouping
     * layer; subcategories (if ever) come only when several tools do.
     */
    {
        id: "developer-tools",
        title: "Developer Tools",
        description:
            "Browser-based tools for working with data and code.",
        seoDescription:
            "Developer Tools from ToolZen Hub: a JSON formatter and validator, a Unix timestamp converter, a text diff checker and a JWT decoder that run in your browser.",
        summary:
            "JSON, timestamp, text compare and JWT tools, in your browser",
        icon: "{ }",
        landing: "developerTools",
        pathPrefix: "tools"
    },

    /*
     * Image Tools, like Time Tools and Developer Tools, has no categories: its
     * tools sit directly under the section. It opens with one real tool and no
     * placeholders; only image tools belong here.
     */
    {
        id: "image-tools",
        title: "Image Tools",
        description:
            "Private browser-based tools for resizing and optimizing images.",
        seoDescription:
            "Image Tools from ToolZen Hub: an image compressor and resizer that runs in your browser, so you can make a photo smaller without uploading it.",
        summary:
            "Compress and resize images in your browser",
        icon: "🖼️",
        landing: "imageTools",
        pathPrefix: "tools"
    }

];


/* =========================================================
   MAJOR CATEGORIES
========================================================= */

export const categories = [

    {
        id: "loans",
        sectionId: "calculators",
        icon: "🏠",
        iconClass: "loans",
        title: "Loans",
        description: "Calculate and compare loan payments, borrowing costs and repayment options",
        href: "loans.html",
        landing: "loans"
    },


    {
        id: "investment",
        sectionId: "calculators",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "Explore investment growth, returns and savings scenarios",
        href: "investment.html",
        landing: "investment",
        seoDescription:
            "Investment calculators from ToolZen Hub: plan a SIP, compare fixed deposit maturities, and find the yearly growth rate (CAGR) between two values."
    },


    {
        id: "tax",
        sectionId: "calculators",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Work through tax-related calculations with clear assumptions",
        href: "tax.html",
        landing: "tax",
        seoDescription:
            "Tax calculators from ToolZen Hub: add GST to an amount or take it out, with the tax shown by rate across up to four items."
    },


    {
        id: "health",
        sectionId: "calculators",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "Health calculators are coming soon",
        href: "health.html"
    },


    {
        id: "business",
        sectionId: "calculators",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Calculate margins, profit and other practical business metrics",
        href: "business.html",
        landing: "business",
        seoDescription:
            "Business calculators from ToolZen Hub: set a price from a target margin or markup, and work out profit and break-even."
    },


    {
        id: "math",
        sectionId: "calculators",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Solve percentage and everyday math problems",
        href: "math.html",
        landing: "math",
        seoDescription:
            "Math calculators from ToolZen Hub: work out a percentage change, an ending value, or the original value before a change."
    },


    {
        id: "converter",
        sectionId: "calculators",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Converter tools are coming soon",
        href: "converter.html"
    },


    {
        id: "more",
        sectionId: "calculators",
        icon: "▦",
        iconClass: "more",
        title: "More",
        description: "Explore all calculators and tools",
        href: "more.html"
    }

];


/* =========================================================
   SUBCATEGORIES

   None are defined yet: every tool sits directly under its
   major category. When one is added:

       {
           id: "home-loans",
           category: "loans",          // category.id
           title: "Home Loans",
           landing: "..."              // optional ROUTES key
       }

   and a tool opts in with `subcategory: "home-loans"`
   (data/tools.js). Ids must be unique across the site.
========================================================= */

export const subcategories = [];


/* =========================================================
   LOOKUPS OVER THIS FILE'S OWN DATA
   (the rest of the hierarchy is in data/taxonomy.js, which
   re-exports these)
========================================================= */

export function getSectionById(
    id
) {

    return sections.find(
        section =>
            section.id === id
    );

}


/*
 * A tool's section: the one its category belongs to, or, for a tool that
 * sits directly under a section (no category), the one it names with
 * `sectionId`.
 */

export function getSectionForTool(
    tool
) {

    return tool?.sectionId
        ? getSectionById(tool.sectionId)
        : getSectionForCategory(tool?.category);

}


export function getSectionForCategory(
    categoryId
) {

    const category =
        categories.find(
            item =>
                item.id === categoryId
        );

    return category
        ? getSectionById(category.sectionId)
        : undefined;

}
