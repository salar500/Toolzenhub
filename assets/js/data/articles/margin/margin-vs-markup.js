/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Margin vs Markup: Why They Are Not the Same

   Category:
   Business

   Topic:
   Margin

   Every figure below was worked out with the Margin
   Calculator's model and checked against an independent
   reference (tests/fixtures/margin-golden.py): a unit that
   costs Rs 600 and sells for Rs 800, and the conversions
   between the two percentages. Per-unit arithmetic only.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Margin and markup both describe the profit on a sale, and people use the words as if they were the same. They are not: they measure the same profit against two different amounts, so the two percentages never match. This guide shows the difference on one example, how to convert between them, and the pricing mistake that mixing them up causes.",


    /* =====================================================
       AUTHOR
    ===================================================== */

    author: {

        name:
            "ToolZen Hub",

        type:
            "Organization",

        role:
            "Finance & Calculator Guides"

    },


    /* =====================================================
       TAGS
    ===================================================== */

    tags: [

        "Margin",

        "Markup",

        "Pricing",

        "Small Business"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Margin is profit as a share of the selling price. Markup is the same profit as a share of the cost.",

        "A unit that costs ₹600 and sells for ₹800 earns ₹200: a 25% margin and a 33.33% markup.",

        "A 25% markup is only a 20% margin, and a 100% markup is a 50% margin.",

        "Adding your target margin percentage to the cost gives a lower margin than you meant: ₹600 plus 25% is ₹750.00, which is a 20.00% margin.",

        "Whichever you use, say which one you mean. These are calculated figures for the numbers entered, before overheads and tax."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a cost and a selling price, a target margin or a target markup to see the price, the margin and the markup side by side."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "one-profit-two-percentages",

            label:
                "One Profit, Two Percentages"

        },


        {

            id:
                "converting-between-them",

            label:
                "Converting Between Them"

        },


        {

            id:
                "the-pricing-mistake",

            label:
                "The Pricing Mistake"

        },


        {

            id:
                "what-this-does-not-include",

            label:
                "What This Does Not Include"

        },


        {

            id:
                "article-faq-title",

            label:
                "Frequently Asked Questions"

        }

    ],


    /* =====================================================
       ARTICLE CONTENT
    ===================================================== */

    sections: [

        {

            id:
                "one-profit-two-percentages",

            heading:
                "1. One Profit, Two Percentages",

            paragraphs: [

                "Take a unit that costs ₹600 and sells for ₹800. The profit is ₹200 either way. What changes is the amount you compare it with.",

                "Margin compares the profit with the selling price: ₹200 out of ₹800 is a 25% margin. Markup compares the same profit with the cost: ₹200 on a cost of ₹600 is a 33.33% markup.",

                "Because the cost is smaller than the price, markup is always the larger number whenever there is a profit. The two are equal only at zero."

            ]

        },


        {

            id:
                "converting-between-them",

            heading:
                "2. Converting Between Them",

            paragraphs: [

                "The two determine each other. Margin is the markup divided by one plus the markup, and markup is the margin divided by one minus the margin.",

                "A 10% markup is a 9.09% margin. A 25% markup is a 20.00% margin. A 50% markup is a 33.33% margin. A 100% markup, which doubles the cost, is a 50.00% margin.",

                "The gap widens as the numbers grow. At small percentages the two are close; at large ones they are far apart, and a markup can pass 100% while a margin never can, because the profit cannot be more than the price."

            ]

        },


        {

            id:
                "the-pricing-mistake",

            heading:
                "3. The Pricing Mistake",

            paragraphs: [

                "The common mistake is to want a margin and add that percentage to the cost. On a cost of ₹600, adding 25% gives ₹750.00. The profit is ₹150, which is only a 20.00% margin, not the 25% that was meant.",

                "To get a 25% margin on a ₹600 cost, the price has to be ₹800.00, which is a 33.33% markup. For a 40% margin, adding 40% to the cost gives ₹840.00, a 28.57% margin; the price that gives a 40% margin is ₹1,000.00, a 66.67% markup.",

                "The price for a target margin is the cost divided by one minus the margin. The price for a target markup is the cost times one plus the markup. Mixing the two formulas is what leaves a margin short of the target."

            ]

        },


        {

            id:
                "what-this-does-not-include",

            heading:
                "4. What This Does Not Include",

            paragraphs: [

                "These are per-unit figures for the numbers entered. They leave out overheads, fixed costs, tax and GST, returns and every other business cost, so they are not the profit of a business.",

                "Neither percentage is better than the other. Margin shows how much of each sale is profit; markup shows how far a price sits above the cost. What matters is saying which one you mean, so that two people reading the same percentage are reading the same thing."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: A ₹600 Unit Sold at ₹800",

        paragraphs: [

            "Cost ₹600 and price ₹800 give a profit of ₹200, a margin of 25.00% and a markup of 33.33%.",

            "Adding 25% to the cost gives ₹750.00, a margin of 20.00%. The price for a 25% margin is ₹800.00. The price for a 40% margin is ₹1,000.00, and adding 40% to the cost gives ₹840.00, a margin of 28.57%."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Margin and markup are two views of one profit. Knowing which one you are quoting, and converting between them correctly, keeps a price from landing short of the margin you meant."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Say whether a percentage is a margin or a markup.",

        "Work out a price from a target margin with cost divided by one minus the margin, not by adding the percentage.",

        "Remember that markup is the larger number whenever there is a profit.",

        "Remember that overheads, fixed costs, tax and returns are not in a per-unit figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Can a margin be 100% or more?",

            answer:
                "No. A margin is a share of the selling price, and the profit cannot be as large as the price while the cost is above zero. A markup can be 100% or more: a 100% markup simply means the price is double the cost."

        },


        {

            question:
                "Are margin and markup ever equal?",

            answer:
                "Only at zero profit, where both are 0%. Whenever there is a profit, markup is larger, and whenever there is a loss both are negative with the markup smaller in size."

        },


        {

            question:
                "Which one should I quote?",

            answer:
                "Either, as long as you say which. Margin is a share of the selling price and markup is a share of the cost, so the same profit gives a different percentage for each."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Margin Calculator: a cost of ₹600 at a selling price of ₹800, a target margin or a target markup. A price worked out from a target is rounded up to the next paisa. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
