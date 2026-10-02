/* =========================================================
   ToolZen Hub
   Category Data

   The authoritative hierarchy data (see data/taxonomy.js for
   the lookups that resolve it):

       Section -> Major category -> Subcategory (optional)
                                      -> Tool -> Articles

   Items refer to each other by stable id, never by title or
   position. A tool can sit directly under a major category.

   `landing` names the ROUTES key of the item's own page. An
   item without `landing` has no page of its own.
========================================================= */


/* =========================================================
   SECTIONS

   Top-level product areas. "Calculators" is the only section
   with tools today; its page is the categories page.
========================================================= */

export const sections = [

    {
        id: "calculators",
        title: "Calculators",
        landing: "calculatorCategories"
    }

];


/* =========================================================
   MAJOR CATEGORIES
========================================================= */

export const categories = [

    {
        id: "loans",
        icon: "🏠",
        iconClass: "loans",
        title: "Loans",
        description: "EMI, Home Loan, Personal Loan and more",
        href: "loans.html",
        landing: "loans"
    },


    {
        id: "investment",
        icon: "📈",
        iconClass: "investment",
        title: "Investment",
        description: "SIP, PPF, FD, CAGR and more",
        href: "investment.html"
    },


    {
        id: "tax",
        icon: "🧾",
        iconClass: "tax",
        title: "Tax",
        description: "Income Tax, GST, TDS and more",
        href: "tax.html"
    },


    {
        id: "health",
        icon: "♥",
        iconClass: "health",
        title: "Health",
        description: "BMI, Calorie, BMR and more",
        href: "health.html"
    },


    {
        id: "business",
        icon: "💼",
        iconClass: "business",
        title: "Business",
        description: "Profit, Margin, ROI and more",
        href: "business.html"
    },


    {
        id: "math",
        icon: "🔢",
        iconClass: "math",
        title: "Math",
        description: "Percentage, Ratio, Age and more",
        href: "math.html"
    },


    {
        id: "converter",
        icon: "↻",
        iconClass: "converter",
        title: "Converter",
        description: "Unit, Currency, Date and more",
        href: "converter.html"
    },


    {
        id: "more",
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
