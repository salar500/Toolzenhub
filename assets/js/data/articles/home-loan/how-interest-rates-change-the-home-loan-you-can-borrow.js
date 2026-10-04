/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How Interest Rates Change the Home Loan You Can Borrow

   Category:
   Loans

   Topic:
   Home Loan

   Every figure below was worked out with the Home Loan
   Calculator's model and checked against an independent
   reference (tests/fixtures/home-loan-golden.py): the SAME EMI
   room of Rs 30,000 a month over 20 years at 7.5%, 8.5%, 9.5%
   and 10.5% a year. Each rate is held for the whole tenure; this
   is arithmetic, not a view on where rates will go.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "The interest rate decides how much of each EMI goes to interest, so it also decides how large a loan a given EMI can carry. This guide keeps the monthly EMI room and the tenure fixed and changes only the rate, one percentage point at a time. It is arithmetic on rates you assume, not a view on where rates will go.",


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

        "Home Loan",

        "Interest Rate",

        "Loan Amount",

        "EMI Budget"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "With an EMI room of ₹30,000 over 20 years, the loan that fits is ₹37,23,963 at 7.5%, ₹34,56,925 at 8.5%, ₹32,18,431 at 9.5% and ₹30,04,868 at 10.5%.",

        "Each extra percentage point lowers the loan by ₹2,67,038, then ₹2,38,494, then ₹2,13,563: a smaller step each time.",

        "From 7.5% to 10.5% the loan that fits is about 19.31% lower, with the EMI and the tenure unchanged.",

        "The rate here is held for the whole tenure. A loan whose rate changes would not follow this table.",

        "This is arithmetic on assumed rates, not a view on where rates will go."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your own income, share, rate and tenure and change the rate to see the loan that fits move."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-rate-and-the-loan",

            label:
                "The Rate and the Loan"

        },


        {

            id:
                "four-rates-one-emi",

            label:
                "Four Rates, One EMI"

        },


        {

            id:
                "why-each-point-takes-less",

            label:
                "Why Each Point Takes Less"

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
                "the-rate-and-the-loan",

            heading:
                "1. The Rate and the Loan",

            paragraphs: [

                "Each EMI pays the interest on the balance first and reduces the balance with what is left. A higher rate takes more of every payment as interest, so less is left to pay the loan down. For the same EMI and the same number of years, a higher rate therefore fits a smaller loan.",

                "This article keeps everything else fixed and moves only the rate."

            ]

        },


        {

            id:
                "four-rates-one-emi",

            heading:
                "2. Four Rates, One EMI",

            paragraphs: [

                "Take an EMI room of ₹30,000 a month over 20 years. At 7.5% a year the loan that fits is ₹37,23,963. At 8.5% it is ₹34,56,925. At 9.5% it is ₹32,18,431. At 10.5% it is ₹30,04,868.",

                "From 7.5% to 10.5% that is a fall of about 19.31%, with the same EMI and the same tenure."

            ]

        },


        {

            id:
                "why-each-point-takes-less",

            heading:
                "3. Why Each Point Takes Less",

            paragraphs: [

                "Moving from 7.5% to 8.5% lowers the loan by ₹2,67,038. The next point, to 9.5%, lowers it by ₹2,38,494, and the one after, to 10.5%, by ₹2,13,563. Each point takes a little less than the one before.",

                "That is because the loan is already smaller by then, so a point of interest is a point of a smaller amount. It is the way the arithmetic works, and it does not mean a higher rate is cheaper."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "The table holds each rate for the whole tenure. A loan whose rate changes over time would not follow it, and this article says nothing about where rates will go or which rate a lender will offer.",

                "It is not a lender's offer, and it does not use a lender's rules. It also leaves out fees, stamp duty, registration, insurance, tax benefits and part-payments."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: A ₹30,000 EMI Room over 20 Years",

        paragraphs: [

            "7.5%: ₹37,23,963. 8.5%: ₹34,56,925. 9.5%: ₹32,18,431. 10.5%: ₹30,04,868.",

            "The differences are ₹2,67,038, ₹2,38,494 and ₹2,13,563, and the whole fall from 7.5% to 10.5% is ₹7,19,095."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "The loan that fits an EMI is as sensitive to the rate as to the income. Trying a few rates in your own numbers shows how much of the loan depends on an assumption you cannot control."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Try more than one rate to see how much the loan depends on it.",

        "Remember that the rate here is the same for the whole tenure.",

        "Remember that this says nothing about which rate a lender will offer.",

        "Remember that fees, tax benefits and part-payments are not in the figures."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Will the rate on my loan stay the same?",

            answer:
                "That depends on the loan, and this calculation does not know. It assumes the rate you enter holds for the whole tenure."

        },


        {

            question:
                "Is a lower rate always shown with a bigger loan?",

            answer:
                "For the same EMI and tenure, yes: less of each payment goes to interest, so the same EMI carries more loan."

        },


        {

            question:
                "Does this tell me which rate to expect?",

            answer:
                "No. The rates are assumptions you can change. The article shows the arithmetic, not a forecast."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Home Loan Calculator, using an income and share that give a ₹30,000 EMI room, 20 years, and each rate in turn. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
