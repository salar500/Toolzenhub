/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How to Find Your Break-Even Point

   Category:
   Business

   Topic:
   Profit

   Every figure below was worked out with the Profit
   Calculator's model and checked against an independent
   reference (tests/fixtures/profit-golden.py, which finds the
   break-even by searching whole units): a price of Rs 800, a
   variable cost of Rs 600 and fixed costs of Rs 50,000, plus a
   price of Rs 730 for the rounding example. Calculated figures
   for the numbers entered, not a forecast.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "The break-even point is the number of units you have to sell for the money they bring in, after their own variable costs, to cover the fixed costs. Below it a period shows a loss, above it a profit. This guide finds it on one example, shows why it is rounded up to a whole unit, and explains what it does and does not say.",


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

        "Break-Even",

        "Fixed Costs",

        "Variable Costs",

        "Small Business"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Each unit contributes its selling price minus its variable cost towards the fixed costs.",

        "At a price of ₹800, a variable cost of ₹600 and fixed costs of ₹50,000, each unit contributes ₹200, so 250 units cover the fixed costs.",

        "Break-even is a whole number of units: when the fixed costs do not divide evenly, the answer is rounded up.",

        "Selling more than the break-even is profit; selling fewer is a loss. The break-even does not change with the units sold.",

        "These are calculated figures for the numbers entered, before tax. They are not a forecast."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a selling price, a variable cost, your fixed costs and the units sold to see the break-even point and the profit for the period."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "fixed-and-variable-costs",

            label:
                "Fixed and Variable Costs"

        },


        {

            id:
                "contribution-per-unit",

            label:
                "Contribution per Unit"

        },


        {

            id:
                "why-the-answer-is-rounded-up",

            label:
                "Why the Answer Is Rounded Up"

        },


        {

            id:
                "what-break-even-does-not-tell-you",

            label:
                "What Break-Even Does Not Tell You"

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
                "fixed-and-variable-costs",

            heading:
                "1. Fixed and Variable Costs",

            paragraphs: [

                "A variable cost rises with each unit you make or sell: materials, packing, delivery. A fixed cost stays the same for the period whatever you sell: rent, salaries, subscriptions.",

                "Break-even needs the two kept apart, because they behave differently. Selling one more unit adds its variable cost but not more rent."

            ]

        },


        {

            id:
                "contribution-per-unit",

            heading:
                "2. Contribution per Unit",

            paragraphs: [

                "The contribution is what a unit leaves after its own variable cost: the selling price minus the variable cost. At a price of ₹800 and a variable cost of ₹600, each unit contributes ₹200.",

                "The fixed costs have to be covered by these contributions. With fixed costs of ₹50,000 for the period, ₹50,000 divided by ₹200 is 250 units. At 250 units the contributions add up to exactly ₹50,000, and the period shows neither a profit nor a loss. The revenue at that point is ₹2,00,000.",

                "Sell 400 units and the profit is ₹200 × 400 − ₹50,000 = ₹30,000, which is 150 units above the break-even. Sell 200 and the period shows a loss of ₹10,000, 50 units short of it."

            ]

        },


        {

            id:
                "why-the-answer-is-rounded-up",

            heading:
                "3. Why the Answer Is Rounded Up",

            paragraphs: [

                "You cannot sell part of a unit, so the break-even is a whole number. If the price is ₹730 instead, each unit contributes ₹130, and ₹50,000 divided by ₹130 is 384.6.",

                "At 384 units the contributions come to ₹49,920, which is ₹80 short of the fixed costs, so the period is still a loss of ₹80. At 385 units they come to ₹50,050 and the profit is ₹50. The break-even is therefore 385 units, the next whole unit up, and the revenue there is ₹2,81,050."

            ]

        },


        {

            id:
                "what-break-even-does-not-tell-you",

            heading:
                "4. What Break-Even Does Not Tell You",

            paragraphs: [

                "Break-even says how many units cover the fixed costs under the numbers entered. It does not say whether you will sell that many, and it does not say whether the product is worth selling.",

                "If the selling price is at or below the variable cost, each unit contributes nothing or less, and no number of units covers the fixed costs. The figures also leave out tax and GST, depreciation, interest, the owner's pay unless it is in the fixed costs, returns, discounts and stock. This article gives arithmetic, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹800 Price, ₹600 Variable Cost, ₹50,000 Fixed Costs",

        paragraphs: [

            "Each unit contributes ₹200. The fixed costs of ₹50,000 are covered by 250 units, at a revenue of ₹2,00,000. Selling 400 units gives a profit of ₹30,000, which is 150 units above break-even.",

            "At a price of ₹730 the contribution is ₹130 and the break-even is 385 units, because ₹50,000 divided by ₹130 is 384.6 and is rounded up."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Break-even turns a month's costs into a number of sales to reach. It is the line between a loss and a profit under the numbers you enter, and it moves whenever the price, the variable cost or the fixed costs move."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Keep fixed and variable costs in their own groups.",

        "Use the same period for the fixed costs and the units sold.",

        "Round a fractional break-even up to the next whole unit.",

        "Remember that tax, depreciation, interest, returns and stock are not in the figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Does the break-even change if I sell more?",

            answer:
                "No. It depends on the price, the variable cost and the fixed costs, not on how many units you sold. The units sold only decide whether the period is above or short of it."

        },


        {

            question:
                "What if I have no fixed costs?",

            answer:
                "Then the break-even is 0 units: every unit sold adds its contribution to the profit from the first sale."

        },


        {

            question:
                "What if my price is below my variable cost?",

            answer:
                "Each sale then adds to the loss, so no number of units covers the fixed costs. The calculator shows the loss and says there is no finite break-even."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Profit Calculator, using a price of ₹800, a variable cost of ₹600 and fixed costs of ₹50,000, and a price of ₹730 for the rounding example. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
