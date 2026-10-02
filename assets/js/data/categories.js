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
   pathPrefix   first URL segment of the section's tool pages:
                /{pathPrefix}/{tool id}/  ("calculators" keeps
                every existing tool URL as it is)
========================================================= */

export const sections = [

    {
        id: "calculators",
        title: "Calculators",
        landing: "calculatorCategories",
        pathPrefix: "calculators"
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
        description: "EMI, Home Loan, Personal Loan and more",
        href: "loans.html",
        landing: "loans"
    },


    {
        id: "investment",
        sectionId: "calculators",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        href: "investment.html"
    },


    {
        id: "tax",
        sectionId: "calculators",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Income Tax, GST, TDS and more",
        href: "tax.html"
    },


    {
        id: "health",
        sectionId: "calculators",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more",
        href: "health.html"
    },


    {
        id: "business",
        sectionId: "calculators",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more",
        href: "business.html"
    },


    {
        id: "math",
        sectionId: "calculators",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more",
        href: "math.html"
    },


    {
        id: "converter",
        sectionId: "calculators",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more",
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
   (data/calculators.js). Ids must be unique across the site.
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
