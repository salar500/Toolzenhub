/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Adding and Removing GST: Why the Tax Is Not the Same Share Both Ways

   Category:
   Tax

   Topic:
   GST

   Every figure below was worked out with the GST Calculator's
   model and checked against an independent reference
   (tests/fixtures/gst-golden.py, which works in whole paise and
   finds the amount before GST by a search): Rs 1,000 at an
   example rate of 18%, and the shares at 5%, 12% and 28%. The
   rates are examples a reader enters, not statements about what
   applies to anything. Arithmetic only, not tax advice.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Adding GST to a price and taking it out of a price look like opposites, and they are, but they do not use the same base. The rate applies to the amount before GST, so the GST is a smaller share of the amount with GST. This guide works one example both ways to show why taking the rate off a total gives the wrong answer. It uses an example rate that you would enter yourself; it does not say which rate applies to anything.",


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

        "Add GST",

        "Remove GST",

        "Invoice Amount"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Adding an example rate of 18% to ₹1,000 gives ₹180.00 of GST and ₹1,180.00 with GST.",

        "The ₹180.00 is 18% of the ₹1,000.00 before GST, but only 15.25% of the ₹1,180.00 with GST.",

        "Taking GST out by subtracting 18% from ₹1,180 gives ₹967.60, which is wrong: the amount before GST is ₹1,000.00 and the GST is ₹180.00.",

        "The share of the final amount is the rate divided by 100 plus the rate: 4.76% at 5%, 10.71% at 12%, 15.25% at 18% and 21.88% at 28%.",

        "The rate is whatever you enter. This is arithmetic, not a statement of which rate applies or tax advice."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Choose Add GST or Remove GST, enter an amount and a rate, and see the amount before GST, the GST, the amount with GST and the GST as a share of the final amount."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "adding-gst",

            label:
                "Adding GST"

        },


        {

            id:
                "removing-gst",

            label:
                "Removing GST"

        },


        {

            id:
                "why-the-share-is-smaller",

            label:
                "Why the Share Is Smaller"

        },


        {

            id:
                "the-share-at-other-rates",

            label:
                "The Share at Other Rates"

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
                "adding-gst",

            heading:
                "1. Adding GST",

            paragraphs: [

                "Start with an amount before GST. The GST is the rate applied to that amount, and the amount with GST is the two added together.",

                "Take ₹1,000 and an example rate of 18%. The GST is ₹180.00, and the amount with GST is ₹1,180.00."

            ]

        },


        {

            id:
                "removing-gst",

            heading:
                "2. Removing GST",

            paragraphs: [

                "Now start from the other end: ₹1,180 that already includes GST at 18%. A common shortcut is to take 18% off. That gives ₹1,180 less ₹212.40, or ₹967.60, which is not the ₹1,000.00 you started from.",

                "The correct way is to divide by one plus the rate. ₹1,180 divided by 1.18 is ₹1,000.00, and the GST inside the total is ₹180.00. The two always add up to the amount you entered, to the paisa."

            ]

        },


        {

            id:
                "why-the-share-is-smaller",

            heading:
                "3. Why the Share Is Smaller",

            paragraphs: [

                "The rate applies to the amount before GST, which is the smaller number. The same ₹180.00 measured against the larger amount with GST is a smaller share: ₹180.00 is 18% of ₹1,000.00 but 15.25% of ₹1,180.00.",

                "That is why subtracting the rate from the total takes off too much. It treats the GST as 18% of ₹1,180, which is ₹212.40, when it is only 15.25% of it."

            ]

        },


        {

            id:
                "the-share-at-other-rates",

            heading:
                "4. The Share at Other Rates",

            paragraphs: [

                "The share of the final amount is the rate divided by 100 plus the rate. At an example rate of 5% it is 4.76%, at 12% it is 10.71%, at 18% it is 15.25% and at 28% it is 21.88%.",

                "The higher the rate, the bigger the gap between the rate and the share, and the more the shortcut gets wrong. These are examples of rates you might enter, not a list of what applies."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The figures use the rate you enter. They do not decide whether GST applies, which rate applies to a product or a service, or how anything is classified.",

                "Each amount is rounded to the nearest paisa, half up. Place of supply, reverse charge, input tax credit, cess, returns and e-invoicing are not included. This is a calculation from the numbers you enter, not tax advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹1,000 at an Example Rate of 18%",

        paragraphs: [

            "Adding: ₹1,000.00 before GST, ₹180.00 of GST, ₹1,180.00 with GST. GST as a share of the final amount: 15.25%.",

            "Removing from ₹1,180: ₹1,000.00 before GST and ₹180.00 of GST, not ₹967.60."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A rate is a share of the amount before GST. Whenever the starting point is a total that already includes GST, that is a different base, and the arithmetic has to change with it."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Check whether your amount is before GST or includes it before you start.",

        "Do not subtract the rate from a total that includes GST.",

        "Remember that the share of the final amount is smaller than the rate.",

        "Remember that the rate is the one you enter, and that this is not tax advice."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why is the GST a smaller share of the amount with GST?",

            answer:
                "Because the rate applies to the amount before GST, which is the smaller number. The same GST measured against the larger total is a smaller share: ₹180 is 18% of ₹1,000 and 15.25% of ₹1,180."

        },


        {

            question:
                "How do I take GST out of a total correctly?",

            answer:
                "Divide the total by one plus the rate. ₹1,180 divided by 1.18 is ₹1,000.00, and the GST is the ₹180.00 that is left."

        },


        {

            question:
                "Does adding GST and then removing it give the same amount back?",

            answer:
                "In testing, yes. The calculator was checked on every amount from ₹0.01 to ₹2,000.00 at seven different rates, and each came back exactly. That is the range that was checked."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the GST Calculator, using ₹1,000 and an example rate of 18% in Add GST mode, and ₹1,180 at the same rate in Remove GST mode. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
