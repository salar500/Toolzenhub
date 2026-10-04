/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   Step-Up SIP: What Increasing Your SIP Each Year Changes

   Category:
   Investment

   Topic:
   SIP

   Every figure below was worked out with the SIP Calculator's
   model and checked against an independent reference
   (tests/fixtures/sip-golden.py): a SIP that starts at Rs 10,000
   a month for 15 years at an ASSUMED 10% a year, with a yearly
   step-up of 0%, 5% and 10% (the monthly amount is raised at the
   13th, 25th and every later 12th month). They are projections,
   not forecasts.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A step-up SIP raises the monthly amount by a fixed percentage once a year. It is a simple idea with a large effect on the projection, mostly because it changes how much you invest. This guide shows what a 5% and a 10% yearly step-up do to one plan, and what the extra numbers do and do not mean.",


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

        "SIP",

        "Step-Up SIP",

        "Investment Projection",

        "Financial Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "A yearly step-up raises the monthly SIP once a year. A 10% step-up on ₹10,000 means ₹10,000 in year 1, ₹11,000 in year 2 and ₹12,100 in year 3.",

        "Over 15 years at an assumed 10%, a 10% step-up means investing about ₹38,12,698 instead of ₹18,00,000, and the estimated value is about ₹74,37,840 instead of ₹41,79,243.",

        "Most of the extra estimated value comes from the extra money invested, so the estimated value per rupee invested is lower than with a fixed SIP.",

        "A step-up asks for a larger instalment later: in the example the 15th year's monthly SIP is about ₹37,975.",

        "These are projections at an assumed return, not forecasts or advice."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Use the Yearly Step-Up field to compare a fixed SIP with a stepped one, and see the monthly SIP rise year by year in the table."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "what-a-step-up-does",

            label:
                "What a Step-Up Does"

        },


        {

            id:
                "fixed-against-stepped",

            label:
                "Fixed Against Stepped"

        },


        {

            id:
                "more-money-not-just-more-growth",

            label:
                "More Money, Not Just More Growth"

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
                "what-a-step-up-does",

            heading:
                "1. What a Step-Up Does",

            paragraphs: [

                "With a fixed SIP you invest the same amount every month. With a step-up you raise it by a percentage once a year, starting in the 13th month. The first year stays at your starting amount.",

                "A 10% step-up on a ₹10,000 SIP means ₹10,000 a month in year 1, ₹11,000 in year 2, ₹12,100 in year 3, and so on, rising to about ₹37,975 a month in year 15."

            ]

        },


        {

            id:
                "fixed-against-stepped",

            heading:
                "2. Fixed Against Stepped",

            paragraphs: [

                "Take ₹10,000 a month for 15 years at an assumed 10% a year. With a fixed SIP you invest ₹18,00,000 and the estimated value is about ₹41,79,243.",

                "With a 5% yearly step-up you invest about ₹25,89,428 and the estimated value is about ₹54,99,931, with the monthly SIP reaching about ₹19,799. With a 10% yearly step-up you invest about ₹38,12,698 and the estimated value is about ₹74,37,840."

            ]

        },


        {

            id:
                "more-money-not-just-more-growth",

            heading:
                "3. More Money, Not Just More Growth",

            paragraphs: [

                "It is easy to read a larger estimated value as the step-up working harder. Most of the difference is simply more money going in. The 10% step-up invests about ₹20,12,698 more than the fixed SIP.",

                "Measured against the money invested, the estimated value is 2.32 times with a fixed SIP, about 2.12 times with a 5% step-up and about 1.95 times with a 10% step-up. The step-up raises the estimated value, but each rupee invested later has less time to grow, so each rupee invested is estimated to become less."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "A step-up assumes your income and other commitments allow a larger instalment every year. Whether that fits your circumstances is for you to judge; this guide does not say what you should do.",

                "The figures use an assumed return of 10% a year, which is an example, not a forecast. Real returns can be lower, and can be negative, and investments are subject to market risk. Taxes, fund charges, exit loads and inflation are not included."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹10,000 a Month for 15 Years at an Assumed 10%",

        paragraphs: [

            "Each SIP is invested at the start of the month, the annual return is divided by 12 each month, and the step-up is applied from the 13th month and every 12 months after.",

            "Fixed SIP: ₹18,00,000 invested, an estimated value of about ₹41,79,243, and a monthly SIP of ₹10,000 throughout.",

            "5% yearly step-up: about ₹25,89,428 invested, an estimated value of about ₹54,99,931, and a monthly SIP of about ₹19,799 in the last year.",

            "10% yearly step-up: about ₹38,12,698 invested, an estimated value of about ₹74,37,840, and a monthly SIP of about ₹37,975 in the last year."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A step-up changes the projection mainly by changing how much you put in. Comparing a fixed and a stepped plan side by side shows how much of a larger result is more investment and how much is estimated growth."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Check that a rising instalment is realistic for your own circumstances.",

        "Compare the amount invested as well as the estimated value.",

        "Remember that the return is an assumption, not a forecast.",

        "Remember that taxes, charges and inflation are not in the projection.",

        "Remember that investments are subject to market risk."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "When does the step-up start?",

            answer:
                "In the 13th month. The first year stays at the starting amount, and the amount is raised again every 12 months after that."

        },


        {

            question:
                "Does a step-up make the investment better?",

            answer:
                "It raises the estimated value because you invest more. Whether it suits you depends on your circumstances. The projection does not say that it is better."

        },


        {

            question:
                "Why is the estimated value per rupee lower with a step-up?",

            answer:
                "The extra money goes in later, so it has less time to grow. The total is larger, but each rupee invested is estimated to become less."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the SIP Calculator, using a standard monthly model: each SIP is invested at the start of the month and the annual return is divided by 12. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
