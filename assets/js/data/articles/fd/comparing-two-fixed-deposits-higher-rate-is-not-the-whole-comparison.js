/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Comparing Two Fixed Deposits: A Higher Rate Is Not the Whole Comparison

   Category:
   Investment

   Topic:
   FD

   Every figure below was worked out with the FD Calculator's
   model and checked against an independent reference
   (tests/fixtures/fd-golden.py, which simulates each deposit
   period by period): Rs 1,00,000, both compounded quarterly,
   Option A at a quoted 7.1% for 3 years and Option B at 6.8% for
   5 years, and the same two rates over the same 5 years. Arithmetic
   on the numbers entered, not a bank's quote; no offer is ranked.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Two fixed deposit quotes often differ in more than the rate: one may run longer, and the schedule of compounding may differ too. This guide compares one pair of quotes, 7.1% for 3 years and 6.8% for 5 years, to show why the larger maturity amount is not, by itself, a like-for-like comparison. It states the differences in the numbers; it does not rank the offers.",


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

        "Fixed Deposit",

        "Tenure",

        "Effective Annual Yield",

        "Comparing Offers"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "On ₹1,00,000 compounded quarterly, 7.1% for 3 years matures to ₹1,23,507.50 and 6.8% for 5 years to ₹1,40,093.85, which is ₹16,586.35 more.",

        "The 5-year deposit matures to more because its money stays in for 2 more years, not because its rate is higher: its effective annual yield is 6.9754% against 7.2913%.",

        "When two deposits run for different lengths of time, their maturity amounts are not a like-for-like comparison.",

        "To compare on equal time, enter the same tenure for both. Over 5 years each, 7.1% matures to ₹1,42,174.67 and 6.8% to ₹1,40,093.85, ₹2,080.82 less.",

        "The numbers state the differences between the offers entered. They say nothing about what happens to the money after a shorter deposit matures."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a rate and a tenure for Option A, then a second rate and tenure under Compare With Another Offer, to see the maturities, the yields and the differences side by side."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "two-quotes-two-lengths",

            label:
                "Two Quotes, Two Lengths"

        },


        {

            id:
                "what-the-maturities-show",

            label:
                "What the Maturities Show"

        },


        {

            id:
                "comparing-on-equal-time",

            label:
                "Comparing on Equal Time"

        },


        {

            id:
                "yield-and-tenure-together",

            label:
                "Yield and Tenure Together"

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
                "two-quotes-two-lengths",

            heading:
                "1. Two Quotes, Two Lengths",

            paragraphs: [

                "Suppose one quote offers 7.1% a year for 3 years and another offers 6.8% a year for 5 years, both with interest added quarterly, on ₹1,00,000. The first has the higher rate. The second runs for 2 more years.",

                "Comparing the rates alone leaves out how long the money stays in. Comparing the maturity amounts alone leaves it out too."

            ]

        },


        {

            id:
                "what-the-maturities-show",

            heading:
                "2. What the Maturities Show",

            paragraphs: [

                "At 7.1% for 3 years the deposit matures to ₹1,23,507.50. At 6.8% for 5 years it matures to ₹1,40,093.85, which is ₹16,586.35 more.",

                "That difference is mostly time. The second deposit stays invested for 2 more years, so it has 2 more years of interest, even though its rate is lower. A larger maturity over a longer tenure does not show that one quote is stronger than the other."

            ]

        },


        {

            id:
                "comparing-on-equal-time",

            heading:
                "3. Comparing on Equal Time",

            paragraphs: [

                "One way to compare is to give both the same tenure. Over 5 years each, 7.1% matures to ₹1,42,174.67 and 6.8% to ₹1,40,093.85. The second is ₹2,080.82 less.",

                "This answers a different question: what the two rates would do over the same time. It is not what happens after the 3-year deposit matures, which depends on what is done with the money then and is not part of these numbers."

            ]

        },


        {

            id:
                "yield-and-tenure-together",

            heading:
                "4. Yield and Tenure Together",

            paragraphs: [

                "The effective annual yield puts each quote on a yearly footing. Here it is 7.2913% for the 3-year deposit and 6.9754% for the 5-year deposit, a difference of 0.32 percentage points.",

                "Read together with the tenures, the figures say: one deposit has the higher yearly growth, and the other has more years of growth. How to weigh those depends on your own situation, and this article does not weigh them for you."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The figures assume each rate stays the same and each deposit's interest stays in the deposit. They do not know a bank's compounding dates, day-count conventions, rounding or product terms, so a bank's own maturity can differ.",

                "Tax and TDS, premature withdrawal, payout options, deposit insurance and changes in rates are not included. This is a calculation from the numbers shown, not a bank's quote or advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: 7.1% for 3 Years Against 6.8% for 5 Years",

        paragraphs: [

            "Option A, 7.1% for 3 years, compounded quarterly: ₹1,23,507.50, effective annual yield 7.2913%. Option B, 6.8% for 5 years: ₹1,40,093.85, yield 6.9754%. Option B matures to ₹16,586.35 more, over 2 more years.",

            "Both for 5 years: 7.1% matures to ₹1,42,174.67 and 6.8% to ₹1,40,093.85, a difference of ₹2,080.82."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A maturity amount answers what a deposit grows to. It does not say how long that took. Putting the tenure and the effective annual yield next to it is what turns two numbers into a comparison."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Check whether the tenures match before comparing maturities.",

        "Read the effective annual yield together with the tenure.",

        "Remember that the numbers say nothing about the money after a shorter deposit matures.",

        "Remember that tax, TDS and premature withdrawal are not in the figures."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why is the longer deposit's maturity larger if its rate is lower?",

            answer:
                "Because the money stays in for 2 more years, so it earns interest for longer. A larger maturity over a longer tenure is not a like-for-like comparison."

        },


        {

            question:
                "How do I compare two deposits on equal time?",

            answer:
                "Enter the same tenure for both in the FD Calculator. The maturities then cover the same period, and the difference is more directly comparable."

        },


        {

            question:
                "Does this say which deposit to choose?",

            answer:
                "No. It states the differences between the numbers entered. Which matters more is your own decision, and tax, withdrawal terms and the bank's own rules are not in the figures."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the FD Calculator, using ₹1,00,000, quarterly compounding, 7.1% for 3 years as Option A and 6.8% for 5 years as Option B, then the same two rates over 5 years. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
