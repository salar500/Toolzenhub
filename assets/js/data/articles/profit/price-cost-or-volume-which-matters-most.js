/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Price, Cost or Volume: Which Matters Most?

   Category:
   Business

   Topic:
   Profit

   Every figure below was worked out with the Profit
   Calculator's model and checked against an independent
   reference (tests/fixtures/profit-golden.py, which recomputes
   each row from scratch): a price of Rs 800, a variable cost of
   Rs 600, fixed costs of Rs 50,000 and 400 units, with each of
   the four moved by 10%, one at a time. The ranking is a result
   of this one example, not a rule about businesses.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Profit depends on four things: the selling price, the variable cost of a unit, the units sold and the fixed costs. A change of the same size in each does not move profit by the same amount. This guide moves each by 10% on one example, one at a time, and shows which moves the profit most. It is a result of these numbers, not a rule.",


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

        "Profit",

        "Pricing",

        "Costs",

        "Small Business"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "In the example, a price of ₹800, a variable cost of ₹600, fixed costs of ₹50,000 and 400 units give a profit of ₹30,000.",

        "A 10% change in the selling price moves the profit by ₹32,000, a 10% change in the variable cost by ₹24,000, in the units sold by ₹8,000 and in the fixed costs by ₹5,000.",

        "A 10% lower price turns the ₹30,000 profit into a loss of ₹2,000.",

        "The price and the variable cost matter most here because they apply to every unit sold.",

        "This is the result of one set of numbers. With different numbers the order can change."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your own price, costs and units to see the same table of what changes with your numbers."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-starting-point",

            label:
                "The Starting Point"

        },


        {

            id:
                "moving-each-one-by-ten-percent",

            label:
                "Moving Each One by 10%"

        },


        {

            id:
                "why-the-order-comes-out-this-way",

            label:
                "Why the Order Comes Out This Way"

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
                "the-starting-point",

            heading:
                "1. The Starting Point",

            paragraphs: [

                "Take a product sold for ₹800 that costs ₹600 to make or buy, with fixed costs of ₹50,000 for the month and 400 units sold. Each unit contributes ₹200, the contributions add up to ₹80,000, and after the fixed costs the profit is ₹30,000. The break-even is 250 units.",

                "Now change one thing at a time by 10% and work the whole result out again each time."

            ]

        },


        {

            id:
                "moving-each-one-by-ten-percent",

            heading:
                "2. Moving Each One by 10%",

            paragraphs: [

                "Selling price: ₹720 gives a loss of ₹2,000, which is ₹32,000 less, and a break-even of 417 units. ₹880 gives a profit of ₹62,000, which is ₹32,000 more, and a break-even of 179 units.",

                "Variable cost: ₹660 gives a profit of ₹6,000, which is ₹24,000 less, and a break-even of 358 units. ₹540 gives ₹54,000, which is ₹24,000 more, and a break-even of 193 units.",

                "Units sold: 360 units give ₹22,000, which is ₹8,000 less. 440 units give ₹38,000, which is ₹8,000 more. The break-even stays at 250 units, because it does not depend on the units sold.",

                "Fixed costs: ₹55,000 gives ₹25,000, which is ₹5,000 less, and a break-even of 275 units. ₹45,000 gives ₹35,000, which is ₹5,000 more, and a break-even of 225 units."

            ]

        },


        {

            id:
                "why-the-order-comes-out-this-way",

            heading:
                "3. Why the Order Comes Out This Way",

            paragraphs: [

                "The price and the variable cost apply to every unit sold. A 10% change of ₹80 in the price is ₹80 on each of 400 units, which is ₹32,000. A 10% change of ₹60 in the variable cost is ₹60 on each unit, which is ₹24,000.",

                "A 10% change in the units sold is 40 units, each contributing ₹200, which is ₹8,000. A 10% change in the fixed costs is ₹5,000 once.",

                "The price moves the profit more than the variable cost here only because the price is the larger number: ₹800 against ₹600. With other numbers, the order of these four can differ."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "A change of 10% in each is an equal test, not a likely change. A price can often be changed by a different amount than a cost can, and a change in price may change the units sold. The table holds everything else as entered, so it shows what the numbers would do, not what will happen.",

                "The figures also leave out tax and GST, depreciation, interest, the owner's pay unless it is in the fixed costs, returns, discounts and stock. This article gives arithmetic, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹800 Price, ₹600 Variable Cost, ₹50,000 Fixed Costs, 400 Units",

        paragraphs: [

            "The profit is ₹30,000. A 10% lower price gives a loss of ₹2,000 and a 10% higher price a profit of ₹62,000. A 10% higher variable cost gives ₹6,000 and a 10% lower one ₹54,000.",

            "400 units less 10% gives ₹22,000 and 10% more gives ₹38,000. ₹55,000 of fixed costs gives ₹25,000 and ₹45,000 gives ₹35,000."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Comparing equal changes shows which input the profit is most sensitive to under your own numbers. It is a way to see where the numbers are most exposed, not a prediction of which will change."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Change one input at a time to see its effect alone.",

        "Remember that the order depends on your own numbers.",

        "Remember that a change in price may also change the units sold, which this table does not do.",

        "Remember that tax, depreciation, interest, returns and stock are not in the figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Does this mean price always matters most?",

            answer:
                "No. It is the result for these numbers. Where the price is small compared with the variable cost, or the fixed costs are large, the order can be different. Try your own numbers."

        },


        {

            question:
                "Why does a change in units sold matter so little here?",

            answer:
                "Because 10% of 400 units is 40 units, and each contributes ₹200, which is ₹8,000. The price and the variable cost are changes on every one of the 400 units."

        },


        {

            question:
                "Is a 10% change realistic?",

            answer:
                "It is a fixed size chosen so the four inputs can be compared fairly. It is not a likely change for any of them."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Profit Calculator, using a price of ₹800, a variable cost of ₹600, fixed costs of ₹50,000 and 400 units, and the table of what changes. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
