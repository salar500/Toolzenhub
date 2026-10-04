/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   How Much SIP Do You Need for a Goal?

   Category:
   Investment

   Topic:
   SIP

   Every figure below was worked out with the SIP Calculator's
   model and checked against an independent reference
   (tests/fixtures/sip-golden.py, which finds the required SIP by
   searching, not by a formula): a target of Rs 1,00,00,000 after 15
   years at ASSUMED returns of 8%, 10% and 12% a year (the annual
   return divided by 12 each month, each SIP at the start of the
   month). They are projections, not forecasts.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Many people start from the number they want, not the SIP they can afford: how much a month would it take? A SIP projection can answer that, as long as it is clear that the answer rests on an assumed return. This guide works the question backwards for a ₹1 crore target and shows how much the answer moves.",


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

        "Goal Planning",

        "Investment Projection",

        "Financial Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "The monthly SIP a target needs depends on the return you assume, the period and any yearly step-up.",

        "For ₹1,00,00,000 in 15 years, the starting SIP needed is about ₹28,708 at an assumed 8%, about ₹23,928 at 10% and about ₹19,819 at 12%.",

        "A ₹10,000 SIP at an assumed 10% for 15 years projects to about ₹41,79,243, which may fall short of the target by about ₹58,20,757.",

        "A 10% yearly step-up lowers the starting SIP needed to about ₹13,445, because later instalments are larger.",

        "The answer is an estimate under assumptions. It is not a forecast and not advice."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a target amount to see whether your plan may reach it, by how much, and the starting monthly SIP it would need."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "working-backwards",

            label:
                "Working Backwards"

        },


        {

            id:
                "the-answer-depends-on-the-assumption",

            label:
                "The Answer Depends on the Assumption"

        },


        {

            id:
                "how-a-step-up-changes-it",

            label:
                "How a Step-Up Changes It"

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
                "working-backwards",

            heading:
                "1. Working Backwards",

            paragraphs: [

                "A projection normally goes forwards: a SIP, a return and a period give an estimated value. A target reverses it: given the value you want, what starting SIP is needed under the same return and period?",

                "Because the estimated value grows in proportion to the SIP, the answer is simple to work out. The starting SIP needed is the target divided by the value that a SIP of ₹1 would reach under the same assumptions."

            ]

        },


        {

            id:
                "the-answer-depends-on-the-assumption",

            heading:
                "2. The Answer Depends on the Assumption",

            paragraphs: [

                "For a target of ₹1,00,00,000 after 15 years with a fixed SIP, the starting SIP needed is about ₹28,708 a month at an assumed return of 8%, about ₹23,928 at 10% and about ₹19,819 at 12%.",

                "So a four-point difference in the return you assume changes the monthly amount by about ₹8,900, close to half of the lowest figure. That is why the answer should be read as a range of scenarios, not as the amount a goal requires.",

                "Against the target, a ₹10,000 SIP at an assumed 10% for 15 years projects to about ₹41,79,243. That may fall short of ₹1,00,00,000 by about ₹58,20,757."

            ]

        },


        {

            id:
                "how-a-step-up-changes-it",

            heading:
                "3. How a Step-Up Changes It",

            paragraphs: [

                "If the monthly amount rises by 10% every year, the starting SIP needed for the same target at an assumed 10% falls to about ₹13,445 a month. The target is reached by larger instalments later, not by a smaller total.",

                "A ₹10,000 SIP with a 10% yearly step-up projects to about ₹74,37,840 over 15 years, which may fall short of ₹1,00,00,000 by about ₹25,62,160."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "A required SIP is only as reliable as the return behind it. Returns are not guaranteed, can be lower than assumed and can be negative, so reaching a target is never certain, and investments are subject to market risk.",

                "The estimate leaves out taxes, fund charges, exit loads and inflation. In particular, ₹1 crore in 15 years will buy less than ₹1 crore does today. This article gives information, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: A ₹1,00,00,000 Target in 15 Years",

        paragraphs: [

            "With each SIP invested at the start of the month and the annual return divided by 12 each month, a fixed SIP would need to start at about ₹28,708 a month at an assumed 8%, about ₹23,928 at 10% and about ₹19,819 at 12%.",

            "With a 10% yearly step-up at an assumed 10%, the starting SIP needed is about ₹13,445 a month.",

            "If a plan is already larger than the amount needed, the calculator shows an estimated surplus instead. For example, ₹50,000 a month at an assumed 12% for 20 years projects to about ₹4,99,57,396, and the starting SIP needed for ₹1,00,00,000 under the same assumptions is about ₹10,009."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Working backwards from a goal turns a projection into a planning question, but the answer is still only as firm as the return you assumed. Looking at it at more than one assumption, and with and without a step-up, shows the range of monthly amounts a goal might involve."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Treat the amount needed as a scenario, not a requirement.",

        "Try more than one assumed return.",

        "Remember that a target in future years is worth less than it looks, because of inflation.",

        "Check that the amount, and any step-up, fits your own circumstances.",

        "Remember that investments are subject to market risk."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Will this SIP definitely reach my target?",

            answer:
                "No. The calculator shows whether the projection may reach the target under the return you assumed. Real returns can be lower, and can be negative."

        },


        {

            question:
                "Why does the starting SIP change so much with the return?",

            answer:
                "Over a long period, a higher assumed return adds more growth, so a smaller SIP can reach the same target. The change compounds."

        },


        {

            question:
                "Does the required SIP include inflation?",

            answer:
                "No. It is a figure in future rupees. Inflation would make the same amount worth less by then."

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
