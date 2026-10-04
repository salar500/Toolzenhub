/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   How Return Assumptions Change a SIP Projection

   Category:
   Investment

   Topic:
   SIP

   Every figure below was worked out with the SIP Calculator's
   model and checked against an independent reference
   (tests/fixtures/sip-golden.py): Rs 10,000 invested at the start
   of every month for 15 years, at ASSUMED returns of 8%, 10% and
   12% a year (the annual return divided by 12 each month). They
   are projections, not forecasts.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "The return you assume is the one number in a SIP projection that nobody knows. Changing it by a couple of percentage points changes the estimated value by far more than the same change in the amount you invest. This guide shows by how much, on one plan, and why a single return should not be read as the answer.",


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

        "Return Assumptions",

        "Scenarios",

        "Financial Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "The same SIP gives very different estimated values at different assumed returns, because the difference compounds.",

        "For ₹10,000 a month over 15 years, assumed returns of 8%, 10% and 12% give estimated values of about ₹34,83,451, ₹41,79,243 and ₹50,45,760.",

        "Two percentage points lower reduces the estimated value by about 17%, and two points higher raises it by about 21%.",

        "A scenario is not a best or worst case: real returns can fall outside all of them, and can be negative.",

        "This shows how sensitive a projection is. It is not a forecast and not advice."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "The calculator shows your plan at the assumed return and at two points lower and higher, side by side."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "one-plan-three-returns",

            label:
                "One Plan, Three Returns"

        },


        {

            id:
                "why-two-points-matter",

            label:
                "Why Two Points Matter"

        },


        {

            id:
                "reading-a-range",

            label:
                "Reading a Range"

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
                "one-plan-three-returns",

            heading:
                "1. One Plan, Three Returns",

            paragraphs: [

                "Take a plan of ₹10,000 a month for 15 years. You invest ₹18,00,000 whatever the return turns out to be. Only the estimated growth changes.",

                "At an assumed return of 8% a year the estimated value is about ₹34,83,451, and the estimated growth about ₹16,83,451. At 10% they are about ₹41,79,243 and ₹23,79,243. At 12% they are about ₹50,45,760 and ₹32,45,760."

            ]

        },


        {

            id:
                "why-two-points-matter",

            heading:
                "2. Why Two Points Matter",

            paragraphs: [

                "Two percentage points sounds small. Applied every month for 15 years, and compounding on a growing balance, it is not. Compared with 10%, an assumed 8% lowers the estimated value by about ₹6,95,791, which is about 17%. An assumed 12% raises it by about ₹8,66,517, about 21%.",

                "The effect is not symmetrical, because compounding gains more from a higher rate than it loses from a lower one of the same size. At 12% the estimated value is about 45% higher than at 8%."

            ]

        },


        {

            id:
                "reading-a-range",

            heading:
                "3. Reading a Range",

            paragraphs: [

                "Showing a range makes the uncertainty visible. The SIP Calculator shows your plan at the return you assumed and at two points lower and higher, labelled lower, as assumed and higher.",

                "These are scenarios, not forecasts. They are not a worst case or a best case: actual returns can be below the lowest scenario, above the highest, or negative in some periods. A range helps you see how much of a projection rests on the assumption, which is more useful than treating one figure as the answer."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "The returns here are assumptions chosen to show sensitivity. They are not the returns of any investment, and nothing here says which return to expect. Investments are subject to market risk.",

                "The projections leave out taxes, fund charges, exit loads and inflation. This article gives information, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹10,000 a Month for 15 Years at Three Assumed Returns",

        paragraphs: [

            "In every case you invest ₹18,00,000 in total, with each SIP made at the start of the month and the annual return divided by 12 each month.",

            "At an assumed 8% a year, the estimated value is about ₹34,83,451. At 10% it is about ₹41,79,243. At 12% it is about ₹50,45,760.",

            "The difference between the lower and the higher scenario is about ₹15,62,309, nearly as much as the ₹18,00,000 you invest."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "The amount you invest and the period are choices. The return is an assumption, and it moves the result more than most people expect. Looking at a plan at more than one assumed return shows how much of the projection depends on a number nobody can promise."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Look at a range of assumed returns, not one.",

        "Remember that returns can be lower than any scenario, and negative.",

        "Remember that taxes, charges and inflation are not in the projection.",

        "Use projections to understand a plan, not to predict an outcome.",

        "Remember that investments are subject to market risk."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Which assumed return should I use?",

            answer:
                "There is no right answer, and this site does not recommend one. The default of 10% is only an example. Try a range, and treat the result as a scenario, not a prediction."

        },


        {

            question:
                "Is the lower scenario the worst case?",

            answer:
                "No. It is the plan at two points below the return you entered. Real returns can be lower, and can be negative."

        },


        {

            question:
                "Why is a higher return worth more than a lower one costs?",

            answer:
                "Compounding builds on a growing balance, so each extra point of return adds more than the same point removes. The effect grows with the length of the period."

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
