/* =========================================================
   ToolZen Hub
   Article Catalog

   THE authoritative source of article metadata.

   Responsibilities:
   - Identity: id, slug, topic (URL: /articles/{topic}/{slug}/)
   - Category
   - Publication status: "published" | "coming-soon"
   - Title and description (also used for SEO)
   - Dates and reading time, where known
   - Images (listing card image, article hero image)
   - Relationships: related tools and related articles
   - Content source (dynamic loader, published articles only)

   NOT here: the article body (introduction, sections, FAQ,
   tags, author ...). That stays in the per-article content
   module named by `content`, which holds no metadata. The
   two are joined by pages/article/article-model.js.

   Rules
   - Only "published" articles have a route, a content module,
     a loader, search presence in sitemap, and category counts.
   - "coming-soon" entries are listing placeholders. They never
     get a route or a loader.
   - A value that is unknown is left out, never invented.

   Fields
     id            number, stable listing id
     status        "published" | "coming-soon"
     category      article category slug (articleCategories)
     topic, slug   URL segments
     title, description
     publishedAt, updatedAt   display strings as published
                              (published articles only)
     listingDate   date string shown on the listing card of a
                   coming-soon placeholder (existing data)
     readTime
     cardImage     { src, alt }  listing / related-card image
     heroImage     { src, alt } | null   article page image
     tools         calculator ids this article points to
     related       curated "topic/slug" keys, in display order
     relatedLabel  label printed on this article's related card
     content       () => import(...)
========================================================= */


import {
    categories
} from "./categories.js";


/* =========================================================
   ARTICLE CATEGORIES

   Articles use the same major categories as tools
   (data/categories.js): the id and name come from there.
   Article pages keep their own order and icons.
========================================================= */

const articleCategoryOrder = [
    { slug: "loans", icon: "🏠" },
    { slug: "investment", icon: "📈" },
    { slug: "tax", icon: "📄" },
    { slug: "business", icon: "💼" },
    { slug: "health", icon: "❤️" },
    { slug: "math", icon: "🧮" },
    { slug: "converter", icon: "🔄" }
];


export const articleCategories =
    articleCategoryOrder.map(
        ({ slug, icon }) => ({
            slug,
            name:
                categories.find(
                    category =>
                        category.id === slug
                )?.title || slug,
            icon
        })
    );


/* =========================================================
   ARTICLES
========================================================= */

const catalog = [

    /* =====================================================
       LOANS  (published)
    ===================================================== */

    {
        id: 1,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "how-to-reduce-home-loan-interest",
        title:
            "How to Reduce Your Home Loan Interest",
        description:
            "Learn practical ways to reduce your home loan interest, lower your borrowing cost and save money over the life of your loan.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "6 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
            alt:
                "House model on desk"
        },
        heroImage: {
            src:
                "/assets/Images/articles/how-to-reduce-home-loan-interest.png",
            alt:
                "Home loan interest calculation and financial planning"
        },
        tools: ["loan-comparison"],
        related: [
            "loan-comparison/emi-vs-total-interest",
            "loan-comparison/fixed-vs-floating-interest-rates",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/what-is-loan-prepayment",
            "loan-comparison/choose-right-loan-tenure"
        ],
        relatedLabel: "Finance"
    },

    {
        id: 2,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "emi-vs-total-interest",
        title:
            "EMI vs Total Interest: What Should You Compare?",
        description:
            "Understand why EMI alone does not tell the complete story when comparing loan options and borrowing costs.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "5 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
            alt:
                "Loan and financial planning"
        },
        heroImage: {
            src:
                "/assets/Images/articles/emi-vs-total-interest.png",
            alt:
                "EMI and total home loan interest comparison"
        },
        tools: ["loan-comparison"],
        related: [
            "loan-comparison/how-to-reduce-home-loan-interest",
            "loan-comparison/fixed-vs-floating-interest-rates",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/what-is-loan-prepayment",
            "loan-comparison/choose-right-loan-tenure"
        ],
        relatedLabel: "Finance"
    },

    {
        id: 3,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "fixed-vs-floating-interest-rates",
        title:
            "Fixed vs Floating Interest Rates",
        description:
            "Understand the difference between fixed and floating interest rates before choosing a loan.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "6 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
            alt:
                "Financial planning and investment"
        },
        heroImage: {
            src:
                "/assets/Images/articles/fixed-vs-floating-interest-rates.png",
            alt:
                "Fixed and floating home loan interest rate comparison"
        },
        tools: ["loan-comparison"],
        related: [
            "loan-comparison/how-to-reduce-home-loan-interest",
            "loan-comparison/emi-vs-total-interest",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/what-is-loan-prepayment",
            "loan-comparison/choose-right-loan-tenure"
        ],
        relatedLabel: "Finance"
    },

    {
        id: 4,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "loan-tenure-total-interest",
        title:
            "How Loan Tenure Affects Total Interest",
        description:
            "See why choosing a longer or shorter loan tenure can significantly affect your total interest cost.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "6 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            alt:
                "Financial analysis on laptop"
        },
        heroImage: {
            src:
                "/assets/Images/articles/loan-tenure-total-interest.png",
            alt:
                "Loan tenure and total interest comparison"
        },
        tools: ["loan-comparison"],
        related: [
            "loan-comparison/how-to-reduce-home-loan-interest",
            "loan-comparison/emi-vs-total-interest",
            "loan-comparison/fixed-vs-floating-interest-rates",
            "loan-comparison/what-is-loan-prepayment",
            "loan-comparison/choose-right-loan-tenure"
        ],
        relatedLabel: "Finance"
    },

    {
        id: 5,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "what-is-loan-prepayment",
        title:
            "What Is Loan Prepayment?",
        description:
            "Understand how loan prepayment works and how paying down your principal can potentially reduce interest.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "4 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
            alt:
                "Financial documents and planning"
        },
        heroImage: {
            src:
                "/assets/Images/articles/what-is-loan-prepayment.png",
            alt:
                "Home loan prepayment and principal repayment"
        },
        tools: ["loan-comparison"],
        related: [
            "loan-comparison/how-to-reduce-home-loan-interest",
            "loan-comparison/emi-vs-total-interest",
            "loan-comparison/fixed-vs-floating-interest-rates",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/choose-right-loan-tenure"
        ],
        relatedLabel: "Finance"
    },

    {
        id: 6,
        status: "published",
        category: "loans",
        topic: "loan-comparison",
        slug: "choose-right-loan-tenure",
        title:
            "How to Choose the Right Loan Tenure",
        description:
            "Learn how to balance monthly affordability with total borrowing cost when choosing a loan tenure.",
        publishedAt: "Aug 25, 2026",
        updatedAt: "Aug 25, 2026",
        readTime: "5 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
            alt:
                "House model with keys"
        },

        /*
         * TODO(image): add assets/Images/articles/choose-right-loan-tenure.png,
         * then set heroImage: { src, alt }. Until then the article
         * page shows no hero image.
         */
        heroImage: null,

        tools: ["loan-comparison"],
        related: [
            "loan-comparison/how-to-reduce-home-loan-interest",
            "loan-comparison/emi-vs-total-interest",
            "loan-comparison/fixed-vs-floating-interest-rates",
            "loan-comparison/loan-tenure-total-interest",
            "loan-comparison/what-is-loan-prepayment"
        ],
        relatedLabel: "Finance"
    },


    /* =====================================================
       COMING SOON  (listing placeholders: no route, no
       content module, not counted)
    ===================================================== */

    {
        id: 7,
        status: "coming-soon",
        category: "investment",
        topic: "investment",
        slug: "best-sip-strategies-for-beginners",
        title:
            "Best SIP Strategies for Beginners",
        description:
            "Learn practical SIP investment strategies to build wealth consistently and work towards your financial goals.",
        listingDate: "Aug 25, 2026",
        readTime: "5 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
            alt:
                "Coins with plant growing"
        }
    },

    {
        id: 8,
        status: "coming-soon",
        category: "tax",
        topic: "tax",
        slug: "tax-saving-guide-save-more-legally",
        title:
            "Tax Saving Guide: Save More, Legally",
        description:
            "Explore smart tax-saving options and understand ways to reduce taxable income legally.",
        listingDate: "Aug 25, 2026",
        readTime: "7 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
            alt:
                "Tax planning documents"
        }
    },

    {
        id: 9,
        status: "coming-soon",
        category: "business",
        topic: "business",
        slug: "roi-vs-profit-whats-the-difference",
        title:
            "ROI vs Profit: What's the Difference?",
        description:
            "Understand the difference between ROI and profit and when each metric is useful for business decisions.",
        listingDate: "Aug 25, 2026",
        readTime: "4 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            alt:
                "Business analytics on laptop"
        }
    },

    {
        id: 10,
        status: "coming-soon",
        category: "health",
        topic: "health",
        slug: "how-to-calculate-your-daily-calorie-needs",
        title:
            "How to Calculate Your Daily Calorie Needs",
        description:
            "Understand the basics of calorie requirements and how simple calculations can help with everyday planning.",
        listingDate: "Aug 25, 2026",
        readTime: "5 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
            alt:
                "Healthy food and nutrition"
        }
    },

    {
        id: 11,
        status: "coming-soon",
        category: "math",
        topic: "math",
        slug: "how-to-calculate-percentage-easily",
        title:
            "How to Calculate Percentage Easily",
        description:
            "Learn simple percentage formulas with practical examples for everyday use.",
        listingDate: "Aug 25, 2026",
        readTime: "4 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
            alt:
                "Mathematics calculation"
        }
    },

    {
        id: 12,
        status: "coming-soon",
        category: "converter",
        topic: "converter",
        slug: "easy-unit-conversion-guide",
        title:
            "Easy Unit Conversion Guide",
        description:
            "Learn how to quickly convert common units used in everyday calculations, shopping and measurements.",
        listingDate: "Aug 25, 2026",
        readTime: "4 min read",
        cardImage: {
            src:
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
            alt:
                "Measurements and calculations"
        }
    }

];


/* =========================================================
   CONTENT LOADERS

   Dynamic import() needs literal paths, so the loaders are
   listed once here and joined to the catalog by "topic/slug".
   Only published articles have one. The article body is still
   loaded on demand, never with the catalog.
========================================================= */

const contentLoaders = {

    "loan-comparison/how-to-reduce-home-loan-interest":
        () =>
            import(
                "./articles/loan-comparison/how-to-reduce-home-loan-interest.js"
            ),

    "loan-comparison/emi-vs-total-interest":
        () =>
            import(
                "./articles/loan-comparison/emi-vs-total-interest.js"
            ),

    "loan-comparison/fixed-vs-floating-interest-rates":
        () =>
            import(
                "./articles/loan-comparison/fixed-vs-floating-interest-rates.js"
            ),

    "loan-comparison/loan-tenure-total-interest":
        () =>
            import(
                "./articles/loan-comparison/loan-tenure-total-interest.js"
            ),

    "loan-comparison/what-is-loan-prepayment":
        () =>
            import(
                "./articles/loan-comparison/what-is-loan-prepayment.js"
            ),

    "loan-comparison/choose-right-loan-tenure":
        () =>
            import(
                "./articles/loan-comparison/choose-right-loan-tenure.js"
            )

};


/* =========================================================
   ARTICLES
   Catalog entries + derived fields:
   - key        "topic/slug"
   - published  (status === "published")
   - content    (present only for published articles)
========================================================= */

export const articles = catalog.map(
    article => {

        const key =
            `${article.topic}/${article.slug}`;

        const published =
            article.status === "published";

        return {
            ...article,
            key,
            published,
            ...(published && contentLoaders[key]
                ? { content: contentLoaders[key] }
                : {})
        };

    }
);


/* =========================================================
   LOOKUPS
========================================================= */

export function getArticleByKey(
    key
) {

    return articles.find(
        article =>
            article.key === key
    );

}


export function getPublishedArticles() {

    return articles.filter(
        article =>
            article.published
    );

}


/* =========================================================
   CATEGORY COUNTS

   Count published articles only. Coming-soon placeholders
   are listed but not counted.
========================================================= */

articleCategories.forEach(
    category => {

        category.count =
            articles.filter(
                article =>
                    article.published &&
                    article.category ===
                    category.slug
            ).length;

    }
);
