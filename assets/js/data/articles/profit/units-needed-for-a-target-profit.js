/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How Many Units Do You Need for a Target Profit?

   Category:
   Business

   Topic:
   Profit

   Every figure below was worked out with the Profit
   Calculator's model and checked against an independent
   reference (tests/fixtures/profit-golden.py, which finds the
   units by searching whole units): a price of Rs 800, a variable
   cost of Rs 600, fixed costs of Rs 50,000 and targets of
   Rs 50,000, Rs 1,00,000 and Rs 2,00,000. A target is a goal,
   not an expectation.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Covering the fixed costs is only the first step; most sellers also have a profit in mind. The units a target profit needs come from one idea: the contributions of all the units must cover the fixed costs and the target. This guide works it out for three targets on one example. A target is a goal you choose, not a number you can expect.",


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

        "Target Profit",

        "Break-Even",

        "Contribution",

        "Small Business"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "The units for a target profit are the fixed costs plus the target, divided by the contribution per unit, rounded up to a whole unit.",

        "At a price of ₹800, a variable cost of ₹600 and fixed costs of ₹50,000, each unit contributes ₹200.",

        "A profit of ₹50,000 needs 500 units, ₹1,00,000 needs 750 units and ₹2,00,000 needs 1,250 units.",

        "The first 250 units only cover the fixed costs. Every unit after that adds ₹200 to the profit.",

        "A target is a goal, not an expectation. These figures say nothing about whether the sales will come."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a target profit with your price, costs and units sold to see the units and revenue it needs and how many more than you sold."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-idea",

            label:
                "The Idea"

        },


        {

            id:
                "three-targets-one-example",

            label:
                "Three Targets, One Example"

        },


        {

            id:
                "comparing-with-what-you-sold",

            label:
                "Comparing With What You Sold"

        },


        {

            id:
                "what-this-does-not-tell-you",

            label:
                "What This Does Not Tell You"

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
                "the-idea",

            heading:
                "1. The Idea",

            paragraphs: [

                "Each unit contributes its selling price minus its variable cost. The contributions of all the units sold must pay for the fixed costs first, and what is left is the profit.",

                "So for a target, the contributions have to add up to the fixed costs plus the target. The units needed are that total divided by the contribution per unit, rounded up, because a unit cannot be split."

            ]

        },


        {

            id:
                "three-targets-one-example",

            heading:
                "2. Three Targets, One Example",

            paragraphs: [

                "With a price of ₹800 and a variable cost of ₹600, each unit contributes ₹200. Fixed costs are ₹50,000 for the period.",

                "For a profit of ₹50,000 the contributions must total ₹1,00,000, which takes 500 units and a revenue of ₹4,00,000. For ₹1,00,000 they must total ₹1,50,000, which takes 750 units and a revenue of ₹6,00,000. For ₹2,00,000 they must total ₹2,50,000, which takes 1,250 units and a revenue of ₹10,00,000.",

                "Split that way, the first 250 units in each case do nothing but cover the fixed costs. The target itself comes from the units after those: 250 for ₹50,000, 500 for ₹1,00,000 and 1,000 for ₹2,00,000."

            ]

        },


        {

            id:
                "comparing-with-what-you-sold",

            heading:
                "3. Comparing With What You Sold",

            paragraphs: [

                "If 400 units were sold in the period, the profit is ₹30,000. That is 100 units short of the 500 a ₹50,000 target needs, 350 short of the 750 a ₹1,00,000 target needs and 850 short of the 1,250 a ₹2,00,000 target needs.",

                "If more than the needed units were sold, the target is already met. 1,000 units, for example, give a profit of ₹1,50,000, above a ₹1,00,000 target."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "The units a target needs are a calculation under the numbers entered: the same price and variable cost for every unit and fixed costs that do not change. They do not say whether that many units can be sold, and a target is a goal you choose, not something to expect.",

                "If the selling price is at or below the variable cost, no number of units reaches a profit. The figures also leave out tax and GST, depreciation, interest, the owner's pay unless it is in the fixed costs, returns, discounts and stock. This article gives arithmetic, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: Targets of ₹50,000, ₹1,00,000 and ₹2,00,000",

        paragraphs: [

            "At a price of ₹800, a variable cost of ₹600 and fixed costs of ₹50,000, a ₹50,000 target needs 500 units, a ₹1,00,000 target needs 750 units and a ₹2,00,000 target needs 1,250 units.",

            "With 400 units sold, the profit is ₹30,000, and the additional units needed are 100, 350 and 850."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A target profit turns into a number of units with one division. Seeing that number next to the units actually sold shows how far a goal is from the current numbers, without saying how to close the gap."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Add the target to the fixed costs, then divide by the contribution per unit.",

        "Round up to a whole unit.",

        "Compare the result with the units actually sold in the same period.",

        "Remember that a target is a goal, and that tax, depreciation, interest, returns and stock are not in the figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why are the fixed costs added to the target?",

            answer:
                "Because the contributions have to pay the fixed costs before any profit is left. The units must cover both."

        },


        {

            question:
                "What if the price is below the variable cost?",

            answer:
                "Then each sale adds to the loss, and no number of units reaches a profit target. The calculator says that no finite number of units reaches it."

        },


        {

            question:
                "Is the target a prediction?",

            answer:
                "No. It is a goal you enter. The calculator only works out how many units it would need under your numbers."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Profit Calculator, using a price of ₹800, a variable cost of ₹600, fixed costs of ₹50,000 and the three targets. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
