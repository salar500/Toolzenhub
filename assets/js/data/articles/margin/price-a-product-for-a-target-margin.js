/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How to Price a Product for a Target Margin

   Category:
   Business

   Topic:
   Margin

   Every figure below was worked out with the Margin
   Calculator's model and checked against an independent
   reference (tests/fixtures/margin-golden.py, which finds each
   price by searching whole paise): a unit costing Rs 600 at
   target margins of 25%, 30% and 40%, and what a cost rise does
   to a Rs 800 price. A price that needs rounding is rounded up
   to the next paisa. Per-unit arithmetic only.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "If you know your cost and the margin you want, the price follows from one formula. The usual mistake is to add the margin percentage to the cost, which leaves the margin short. This guide works the right price out for three targets on one cost, explains why the last paisa is rounded up, and shows what to do with the price when the cost changes.",


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

        "Pricing",

        "Margin",

        "Small Business",

        "Cost Changes"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "The price for a target margin is the cost divided by one minus the margin.",

        "On a cost of ₹600, a 25% margin needs ₹800.00, a 30% margin needs ₹857.15 and a 40% margin needs ₹1,000.00.",

        "The price rises faster than the margin: 15 more points of margin add ₹200, a third of the cost.",

        "A price worked out from a target is rounded up to the next paisa, so it never falls short of the target.",

        "If the cost rises by 10% on a ₹800 price, the margin falls from 25.00% to 17.50%; ₹880.00 would keep it at 25%."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Choose Target margin, enter your cost and the margin you want, and see the price, the profit per unit and the markup it gives."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-formula",

            label:
                "The Formula"

        },


        {

            id:
                "three-targets-one-cost",

            label:
                "Three Targets, One Cost"

        },


        {

            id:
                "why-the-price-is-rounded-up",

            label:
                "Why the Price Is Rounded Up"

        },


        {

            id:
                "when-the-cost-changes",

            label:
                "When the Cost Changes"

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
                "the-formula",

            heading:
                "1. The Formula",

            paragraphs: [

                "A margin is profit as a share of the selling price. If you want a margin of 25%, then the cost is the other 75% of the price. So the price is the cost divided by 0.75.",

                "In general, price = cost ÷ (1 − margin). For a target markup the formula is different: price = cost × (1 + markup). Using the markup formula for a margin target is the mistake that leaves a margin short."

            ]

        },


        {

            id:
                "three-targets-one-cost",

            heading:
                "2. Three Targets, One Cost",

            paragraphs: [

                "On a cost of ₹600, a 25% margin needs a price of ₹800.00, which earns ₹200 a unit and is a 33.33% markup.",

                "A 30% margin needs ₹857.15, which earns ₹257.15 a unit. A 40% margin needs ₹1,000.00, which earns ₹400 a unit and is a 66.67% markup.",

                "The price rises faster than the margin does. Going from a 25% to a 40% margin is 15 more points, but it adds ₹200 to the price, a third of the cost, because each extra point of margin has to be earned out of a smaller remaining share of the price."

            ]

        },


        {

            id:
                "why-the-price-is-rounded-up",

            heading:
                "3. Why the Price Is Rounded Up",

            paragraphs: [

                "A price is a whole number of paise. For a 30% margin on ₹600 the exact price is ₹857.142857, which cannot be charged. Rounding to the nearest paisa would give ₹857.14, which is just under 30%.",

                "Rounding up to ₹857.15 gives a margin of a hair over 30%, so the price never misses the target. The margin and the markup worth quoting are then those of the price you actually charge."

            ]

        },


        {

            id:
                "when-the-cost-changes",

            heading:
                "4. When the Cost Changes",

            paragraphs: [

                "A price set for a margin only holds while the cost holds. If the cost rises 5% to ₹630.00 and the price stays at ₹800, the margin falls to 21.25%. To keep the 25% margin, the price would have to rise by the same 5%, to ₹840.00.",

                "If the cost rises 10% to ₹660.00, the margin at ₹800 falls to 17.50%, and ₹880.00 keeps it at 25%. The price that keeps a margin moves by the same percentage as the cost.",

                "If the price is already at or below the cost there is no margin to keep, and the question becomes the price that covers the new cost."

            ]

        },


        {

            id:
                "what-this-does-not-include",

            heading:
                "5. What This Does Not Include",

            paragraphs: [

                "These are per-unit figures for the numbers entered. They leave out overheads, fixed costs, tax and GST, returns and every other business cost, and the price here is without GST. A price can reach a target margin on paper and still not cover what the business has to pay.",

                "This article gives arithmetic, not a view on what margin to aim for or what price to charge."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: A ₹600 Unit at Three Target Margins",

        paragraphs: [

            "For a 25% margin the price is ₹800.00 (profit ₹200, markup 33.33%). For 30% it is ₹857.15 (profit ₹257.15). For 40% it is ₹1,000.00 (profit ₹400, markup 66.67%).",

            "If the cost rises 5% or 10% while the price stays at ₹800, the margin falls to 21.25% or 17.50%; the prices that keep a 25% margin are ₹840.00 and ₹880.00."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Pricing for a margin is one formula and one rule: divide the cost by one minus the margin, and round up. Re-running it whenever the cost changes keeps the margin you meant from drifting."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Use cost divided by one minus the margin for a margin target, not cost plus the margin percentage.",

        "Round a derived price up to the next paisa and quote the margin of that price.",

        "Re-check the price when the cost changes; it moves by the same percentage to keep the margin.",

        "Remember that overheads, fixed costs, tax and returns are not in a per-unit figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why not just add the margin percentage to the cost?",

            answer:
                "Because a margin is a share of the price, not of the cost. Adding 25% to a ₹600 cost gives ₹750.00, where the profit of ₹150 is only 20.00% of the price."

        },


        {

            question:
                "What is the highest margin I can price for?",

            answer:
                "The Margin Calculator accepts a target margin up to 95%. A margin of 100% or more would need an infinite price, since the cost could never be covered by a share of the price that leaves nothing for it."

        },


        {

            question:
                "Does the price include GST?",

            answer:
                "No. Enter the cost without GST and read the price as a price without GST. No tax is calculated."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Margin Calculator, using Target margin and a cost of ₹600, and the cost-change table for the 5% and 10% rises. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
