/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   GST on a Mixed Invoice: How the Tax Adds Up Across Rates

   Category:
   Tax

   Topic:
   GST

   Every figure below was worked out with the GST Calculator's
   model and checked against an independent reference
   (tests/fixtures/gst-golden.py, which works in whole paise):
   Rs 1,000 at an example 5% and Rs 2,000 and Rs 500 at an
   example 18%, added item by item; and three items of Rs 10.10
   at an example 5% for the rounding note. The rates are examples
   a reader enters, not statements about what applies to anything.
   Arithmetic only, not tax advice.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "An invoice often has items at different rates. The tax on each item depends on its own rate, and the invoice total is those pieces added up. This guide works through one invoice with three items at two example rates, groups them by rate, and shows how each item is rounded to the paisa before the totals are added. The rates are examples that you would enter yourself; it does not say which rate applies to anything.",


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

        "GST",

        "Invoice",

        "Multiple Rates",

        "Rounding"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Three items before GST, ₹1,000.00 at an example 5% and ₹2,000.00 and ₹500.00 at an example 18%, carry ₹50.00, ₹360.00 and ₹90.00 of GST.",

        "Grouped by rate, the 5% row is ₹1,000.00 before GST with ₹50.00 of GST, and the 18% row is ₹2,500.00 with ₹450.00.",

        "The invoice comes to ₹3,500.00 before GST, ₹500.00 of GST and ₹4,000.00 with GST. The GST is 12.50% of the final amount.",

        "Each item is rounded to the paisa on its own before the items are added. Three items of ₹10.10 at 5% make ₹1.53 of GST item by item, against ₹1.52 worked out once on ₹30.30.",

        "The rates are the ones you enter. This is arithmetic, not a statement of which rate applies or tax advice."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter up to four items, each with an amount and a rate, to see the tax grouped by rate and the invoice total."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "one-invoice-two-rates",

            label:
                "One Invoice, Two Rates"

        },


        {

            id:
                "item-by-item",

            label:
                "Item by Item"

        },


        {

            id:
                "grouped-by-rate",

            label:
                "Grouped by Rate"

        },


        {

            id:
                "rounding-before-adding",

            label:
                "Rounding Before Adding"

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
                "one-invoice-two-rates",

            heading:
                "1. One Invoice, Two Rates",

            paragraphs: [

                "Suppose an invoice has three items before GST: ₹1,000.00, ₹2,000.00 and ₹500.00. Take an example rate of 5% for the first and an example rate of 18% for the other two.",

                "A single rate applied to the whole invoice would be wrong for at least one item, so the GST has to be worked out per item."

            ]

        },


        {

            id:
                "item-by-item",

            heading:
                "2. Item by Item",

            paragraphs: [

                "The first item carries ₹50.00 of GST, which is ₹1,050.00 with GST. The second carries ₹360.00, which is ₹2,360.00. The third carries ₹90.00, which is ₹590.00.",

                "Each item is worked out on its own and rounded to the nearest paisa, half up, before anything is added."

            ]

        },


        {

            id:
                "grouped-by-rate",

            heading:
                "3. Grouped by Rate",

            paragraphs: [

                "Items at the same rate can be added together. The 5% row is ₹1,000.00 before GST with ₹50.00 of GST, or ₹1,050.00. The 18% row combines the second and third items: ₹2,500.00 before GST with ₹450.00 of GST, or ₹2,950.00.",

                "The invoice total is the two rows added: ₹3,500.00 before GST, ₹500.00 of GST and ₹4,000.00 with GST. The GST is 12.50% of the final amount, which sits between the shares of the two rates."

            ]

        },


        {

            id:
                "rounding-before-adding",

            heading:
                "4. Rounding Before Adding",

            paragraphs: [

                "Rounding to the paisa item by item can differ by a paisa from working out the GST once on the grand total. Three items of ₹10.10 at an example 5% each carry ₹0.505 of GST, which rounds to ₹0.51. Item by item the GST is ₹1.53. Worked out once on ₹30.30 it is ₹1.515, which rounds to ₹1.52.",

                "The calculator rounds each item and then adds. Another billing system may round the grand total instead, so a total can differ by a paisa between systems."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The figures use the rates you enter. They do not decide whether GST applies, which rate applies to an item, or how it is classified.",

                "Place of supply, reverse charge, input tax credit, cess, returns and e-invoicing are not included. This is a calculation from the numbers you enter, not tax advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: Three Items at Two Example Rates",

        paragraphs: [

            "₹1,000.00 at 5%: ₹50.00 of GST. ₹2,000.00 at 18%: ₹360.00. ₹500.00 at 18%: ₹90.00.",

            "By rate: 5%, ₹1,000.00, ₹50.00, ₹1,050.00. 18%, ₹2,500.00, ₹450.00, ₹2,950.00. Total: ₹3,500.00, ₹500.00, ₹4,000.00."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "An invoice total is built from its items. Working item by item, grouping by rate and adding last keeps every figure traceable to a line you can check."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Work out the GST on each item with that item's own rate.",

        "Group items by rate before reading the subtotals.",

        "Remember that rounding item by item can differ by a paisa from rounding the total.",

        "Remember that the rates are the ones you enter, and that this is not tax advice."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why group the items by rate?",

            answer:
                "Because the GST on each group follows one rate, so each row of the table can be read and checked on its own before the total."

        },


        {

            question:
                "Why can my total differ by a paisa from another system?",

            answer:
                "This calculator rounds each item to the paisa and then adds. Some systems round the grand total instead, and the two can differ by a paisa."

        },


        {

            question:
                "Does this say which rate to use for an item?",

            answer:
                "No. You enter the rate for each item. The calculator does not know which rate applies to a product or a service."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the GST Calculator in Add GST mode, using ₹1,000.00 at 5% and ₹2,000.00 and ₹500.00 at 18%. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
