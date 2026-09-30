/* =========================================================
   ToolZen Hub
   Article Registry

   Purpose:
   Central registry for all articles.

   This is the single source of truth for:

   - Articles listing page
   - Category filtering
   - Sidebar categories
   - Calculator Related Articles
   - Individual article URLs
   - Future category pages

   Add each article ONCE here.
========================================================= */

export const articleRegistry = [

    /* =====================================================
       LOANS
    ===================================================== */

    {
        id: 1,
        category: "loans",
        categoryName: "Loans",
        topic: "loan-comparison",
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
        category: "loans",
        categoryName: "Loans",
        topic: "loan-comparison",
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
        category: "loans",
        categoryName: "Loans",
        topic: "loan-comparison",
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
        category: "loans",
        categoryName: "Loans",
        topic: "loan-comparison",
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
        category: "loans",
        categoryName: "Loans",
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
        category: "loans",
        categoryName: "Loans",
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
       INVESTMENT
    ===================================================== */

    {
        id: 7,
        category: "investment",
        categoryName: "Investment",
        topic:
            "investment",
        slug:
            "best-sip-strategies-for-beginners",
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


    /* =====================================================
       TAX
    ===================================================== */

    {
        id: 8,
        category: "tax",
        categoryName: "Tax",
        topic:
            "tax",
        slug:
            "tax-saving-guide-save-more-legally",
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


    /* =====================================================
       BUSINESS
    ===================================================== */

    {
        id: 9,
        category: "business",
        categoryName: "Business",
        topic:
            "business",
        slug:
            "roi-vs-profit-whats-the-difference",
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


    /* =====================================================
       HEALTH
    ===================================================== */

    {
        id: 10,
        category: "health",
        categoryName: "Health",
        topic:
            "health",
        slug:
            "how-to-calculate-your-daily-calorie-needs",
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


    /* =====================================================
       MATH
    ===================================================== */

    {
        id: 11,
        category: "math",
        categoryName: "Math",
        topic:
            "math",
        slug:
            "how-to-calculate-percentage-easily",
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


    /* =====================================================
       CONVERTER
    ===================================================== */

    {
        id: 12,
        category: "converter",
        categoryName: "Converter",
        topic:
            "converter",
        slug:
            "easy-unit-conversion-guide",
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
   ARTICLE CATEGORIES
========================================================= */

export const articleCategories = [

    {
        slug: "loans",
        name: "Loans",
        icon: "🏠"
    },

    {
        slug: "investment",
        name: "Investment",
        icon: "📈"
    },

    {
        slug: "tax",
        name: "Tax",
        icon: "📄"
    },

    {
        slug: "business",
        name: "Business",
        icon: "💼"
    },

    {
        slug: "health",
        name: "Health",
        icon: "❤️"
    },

    {
        slug: "math",
        name: "Math",
        icon: "🧮"
    },

    {
        slug: "converter",
        name: "Converter",
        icon: "🔄"
    }

];


/* =========================================================
   CALCULATE CATEGORY COUNTS
========================================================= */

articleCategories.forEach(
    category => {

        category.count =
            articleRegistry.filter(
                article =>
                    article.category ===
                    category.slug
            ).length;

    }
);
