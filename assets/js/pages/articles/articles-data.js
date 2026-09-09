/* =========================================================
   ToolZen Hub
   Articles Data

   Purpose:
   Central data source for the Articles listing page.

   Architecture:

   Article Listing
        ↓
   Article Metadata
        ↓
   topic + slug
        ↓
   Central ROUTES.article()
        ↓
   Individual Article Page

   Articles without a detail page yet can remain in this
   file without topic/slug until their pages are created.
========================================================= */


/* =========================================================
   ARTICLES
========================================================= */

export const articles = [


    /* =====================================================
       LOAN COMPARISON ARTICLES
    ===================================================== */

    {
        id: 1,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "how-to-reduce-home-loan-interest",

        title:
            "How to Reduce Your Home Loan Interest",

        description:
            "Learn practical ways to reduce your home loan interest, lower your borrowing cost and save money over the life of your loan.",

        date:
            "Aug 25, 2026",

        readTime:
            "6 min read",

        image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",

        alt:
            "House model on desk"
    },


    {
        id: 2,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "emi-vs-total-interest",

        title:
            "EMI vs Total Interest: What Should You Compare?",

        description:
            "Understand why EMI alone does not tell the complete story when comparing loan options and borrowing costs.",

        date:
            "Aug 25, 2026",

        readTime:
            "5 min read",

        image:
            "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",

        alt:
            "Loan and financial planning"
    },


    {
        id: 3,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "fixed-vs-floating-interest-rates",

        title:
            "Fixed vs Floating Interest Rates",

        description:
            "Understand the difference between fixed and floating interest rates before choosing a loan.",

        date:
            "Aug 25, 2026",

        readTime:
            "6 min read",

        image:
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",

        alt:
            "Financial planning and investment"
    },


    {
        id: 4,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "loan-tenure-total-interest",

        title:
            "How Loan Tenure Affects Total Interest",

        description:
            "See why choosing a longer or shorter loan tenure can significantly affect your total interest cost.",

        date:
            "Aug 25, 2026",

        readTime:
            "6 min read",

        image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",

        alt:
            "Financial analysis on laptop"
    },


    {
        id: 5,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "what-is-loan-prepayment",

        title:
            "What Is Loan Prepayment?",

        description:
            "Understand how loan prepayment works and how paying down your principal can potentially reduce interest.",

        date:
            "Aug 25, 2026",

        readTime:
            "4 min read",

        image:
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",

        alt:
            "Financial documents and planning"
    },


    {
        id: 6,

        category:
            "Loans",

        topic:
            "loan-comparison",

        slug:
            "choose-right-loan-tenure",

        title:
            "How to Choose the Right Loan Tenure",

        description:
            "Learn how to balance monthly affordability with total borrowing cost when choosing a loan tenure.",

        date:
            "Aug 25, 2026",

        readTime:
            "5 min read",

        image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",

        alt:
            "House model with keys"
    },


    /* =====================================================
       OTHER ARTICLES
       
       These remain in the listing until their individual
       article pages are created.
    ===================================================== */


    {
        id: 7,

        category:
            "Investment",

        title:
            "Best SIP Strategies for Beginners",

        description:
            "Learn practical SIP investment strategies to build wealth consistently and work towards your financial goals.",

        date:
            "Aug 25, 2026",

        readTime:
            "5 min read",

        image:
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",

        alt:
            "Coins with plant growing"
    },


    {
        id: 8,

        category:
            "Tax",

        title:
            "Tax Saving Guide: Save More, Legally",

        description:
            "Explore smart tax-saving options and understand ways to reduce taxable income legally.",

        date:
            "Aug 25, 2026",

        readTime:
            "7 min read",

        image:
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",

        alt:
            "Tax planning documents"
    },


    {
        id: 9,

        category:
            "Business",

        title:
            "ROI vs Profit: What's the Difference?",

        description:
            "Understand the difference between ROI and profit and when each metric is useful for business decisions.",

        date:
            "Aug 25, 2026",

        readTime:
            "4 min read",

        image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",

        alt:
            "Business analytics on laptop"
    },


    {
        id: 10,

        category:
            "Health",

        title:
            "How to Calculate Your Daily Calorie Needs",

        description:
            "Understand the basics of calorie requirements and how simple calculations can help with everyday planning.",

        date:
            "Aug 25, 2026",

        readTime:
            "5 min read",

        image:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",

        alt:
            "Healthy food and nutrition"
    },


    {
        id: 11,

        category:
            "Math",

        title:
            "How to Calculate Percentage Easily",

        description:
            "Learn simple percentage formulas with practical examples for everyday use.",

        date:
            "Aug 25, 2026",

        readTime:
            "4 min read",

        image:
            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",

        alt:
            "Mathematics calculation"
    },


    {
        id: 12,

        category:
            "Converter",

        title:
            "Easy Unit Conversion Guide",

        description:
            "Learn how to quickly convert common units used in everyday calculations, shopping and measurements.",

        date:
            "Aug 25, 2026",

        readTime:
            "4 min read",

        image:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",

        alt:
            "Measurements and calculations"
    }

];



/* =========================================================
   CATEGORIES
========================================================= */

export const categories = [

    {
        name:
            "Loans",

        icon:
            "🏠",

        count:
            24
    },


    {
        name:
            "Investment",

        icon:
            "📈",

        count:
            18
    },


    {
        name:
            "Tax",

        icon:
            "📄",

        count:
            16
    },


    {
        name:
            "Business",

        icon:
            "💼",

        count:
            14
    },


    {
        name:
            "Health",

        icon:
            "❤️",

        count:
            12
    },


    {
        name:
            "Math",

        icon:
            "🧮",

        count:
            10
    },


    {
        name:
            "Converter",

        icon:
            "🔄",

        count:
            8
    }

];
