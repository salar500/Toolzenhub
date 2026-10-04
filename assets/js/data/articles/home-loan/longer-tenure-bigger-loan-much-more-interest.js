/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Longer Tenure, Bigger Loan, Much More Interest

   Category:
   Loans

   Topic:
   Home Loan

   Every figure below was worked out with the Home Loan
   Calculator's model and checked against an independent
   reference (tests/fixtures/home-loan-golden.py): the SAME EMI
   room of Rs 30,000 a month at 8.5% a year over 10, 15, 20, 25
   and 30 years. The question here fixes the EMI and varies the
   loan; the existing tenure article fixes the loan and varies
   the EMI. Arithmetic only: no tenure is recommended.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Stretching a loan over more years lowers the EMI on a given loan. Turn that around and keep the EMI the same: a longer tenure then fits a larger loan. This guide holds a monthly EMI room fixed and shows how much more loan each extra decade fits, and what it costs in interest. It shows the arithmetic; it does not say which tenure to choose.",


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

        "Loan Tenure",

        "Total Interest",

        "EMI Budget"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "With an EMI room of ₹30,000 at 8.5% a year, 10 years fits a loan of ₹24,19,634 and 30 years fits ₹39,01,609.",

        "Going from 10 to 30 years raises the loan by about 61.25%, while the total interest rises from ₹11,80,365.86 to ₹68,98,390.16, about 5.8 times as much.",

        "Going from 20 to 30 years raises the loan by only about 12.86% (₹34,56,925 to ₹39,01,609), while the interest rises by about 84.30% (₹37,43,074.59 to ₹68,98,390.16).",

        "Each extra year fits less additional loan than the one before, because the EMI is spread over more months.",

        "This is arithmetic for one set of numbers, not advice about which tenure to take."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your income, share and rate to see the same table of loans and interest across tenures for your own numbers."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "a-different-question",

            label:
                "A Different Question"

        },


        {

            id:
                "the-same-emi-five-tenures",

            label:
                "The Same EMI, Five Tenures"

        },


        {

            id:
                "why-the-loan-grows-slowly",

            label:
                "Why the Loan Grows Slowly"

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
                "a-different-question",

            heading:
                "1. A Different Question",

            paragraphs: [

                "A common question is what a longer tenure does to the EMI on a loan you have already chosen: the EMI falls and the total interest rises. This article asks something else. If the monthly EMI you can carry stays the same, what does a longer tenure do to the size of the loan?",

                "The answer matters when the EMI is the thing you are holding fixed, which it often is in a home search."

            ]

        },


        {

            id:
                "the-same-emi-five-tenures",

            heading:
                "2. The Same EMI, Five Tenures",

            paragraphs: [

                "Take an EMI room of ₹30,000 a month at 8.5% a year. Over 10 years the loan that fits is ₹24,19,634, with total interest of ₹11,80,365.86. Over 15 years it is ₹30,46,490 and the interest ₹23,53,508.59. Over 20 years it is ₹34,56,925 and ₹37,43,074.59.",

                "Over 25 years the loan is ₹37,25,657 and the interest ₹52,74,342.76. Over 30 years it is ₹39,01,609 and the interest ₹68,98,390.16.",

                "From 10 to 30 years the loan that fits rises by about 61.25%, and the total interest is about 5.8 times as much. From 20 to 30 years the loan rises by about 12.86% and the interest by about 84.30%."

            ]

        },


        {

            id:
                "why-the-loan-grows-slowly",

            heading:
                "3. Why the Loan Grows Slowly",

            paragraphs: [

                "The EMI pays interest on the outstanding balance first, and what is left reduces the balance. Early in a long loan, most of each payment is interest, so adding years adds more months of interest than it adds principal that the same EMI can carry.",

                "That is why the loan rises by about ₹6.3 lakh from 10 to 15 years but by only about ₹1.8 lakh from 25 to 30 years, while the extra years keep adding interest."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "The table does not say which tenure is right for anyone. A larger loan can matter for one buyer and the extra interest for another, and neither is a recommendation. It also assumes the rate stays the same for the whole tenure, and it leaves out fees, rate changes, tax benefits and part-payments.",

                "It is not a lender's offer, and it does not use a lender's rules. It shows what the numbers do under the assumptions you enter."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: A ₹30,000 EMI Room at 8.5% a Year",

        paragraphs: [

            "10 years: ₹24,19,634 and ₹11,80,365.86 of interest. 15 years: ₹30,46,490 and ₹23,53,508.59. 20 years: ₹34,56,925 and ₹37,43,074.59. 25 years: ₹37,25,657 and ₹52,74,342.76. 30 years: ₹39,01,609 and ₹68,98,390.16.",

            "The total repayments over those tenures are ₹35,99,999.86, ₹53,99,998.59, ₹71,99,999.59, ₹89,99,999.76 and ₹1,07,99,999.16."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "With a fixed EMI, a longer tenure buys a larger loan at a growing cost in interest. Seeing both numbers together, for your own income and rate, makes the trade-off visible without telling you how to weigh it."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Look at the loan and the total interest together, not one alone.",

        "Hold the EMI fixed when comparing tenures, as the table does.",

        "Remember that the rate is assumed to stay the same.",

        "Remember that fees, rate changes, tax benefits and part-payments are not in the figures."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "How is this different from the article on tenure and total interest?",

            answer:
                "That one keeps the loan the same and asks what a longer tenure does to the EMI and the interest. This one keeps the EMI the same and asks what a longer tenure does to the loan that fits."

        },


        {

            question:
                "Does this mean a longer tenure is better or worse?",

            answer:
                "No. It only shows that a longer tenure fits a larger loan and costs more interest. Which matters more depends on your own situation."

        },


        {

            question:
                "Why does each extra decade add less loan?",

            answer:
                "Because most of an early payment is interest. Extra years add more interest than they add principal the same EMI can carry."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Home Loan Calculator, using an income and share that give a ₹30,000 EMI room, 8.5% a year, and the tenures in the table. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
