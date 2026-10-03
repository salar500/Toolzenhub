/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Why When You Prepay Matters: Early vs Late Prepayment

   Category:
   Finance

   Topic:
   Loan Prepayment

   Every figure below was worked out with the Loan Prepayment
   Calculator's model and checked against an independent
   reference (tests/fixtures/prepayment-golden.py):
   Rs 25,00,000 owed at 8.5% a year with 180 monthly payments
   left, Rs 3,00,000 prepaid, EMI kept the same.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A prepayment of the same amount does not save the same interest at every point in a loan. The earlier it is made, the more interest it tends to save. This guide shows why, with one loan and four different timings.",


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

        "Loan Prepayment",

        "Interest Savings",

        "Loan Planning",

        "Amortization"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "The same prepayment saves less interest the later in the loan it is made.",

        "In the example below, ₹3,00,000 prepaid right away saves about ₹6,35,199 in interest. The same amount prepaid after 10 years saves about ₹1,31,906.",

        "Early EMIs are mostly interest, so early principal repayment has more time to reduce the interest charged.",

        "This shows how timing changes the effect of a prepayment. It is not advice on when to prepay.",

        "Lender rules, charges and the date a payment is applied can change real results."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Use the Make the Prepayment After field to see how the timing of your own prepayment changes the result."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "why-timing-matters",

            label:
                "Why Timing Matters"

        },


        {

            id:
                "what-the-pattern-shows",

            label:
                "What the Pattern Shows"

        },


        {

            id:
                "what-this-does-not-tell-you",

            label:
                "What This Does Not Tell You"

        },


        {

            id:
                "try-your-own-timing",

            label:
                "Try Your Own Timing"

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
                "why-timing-matters",

            heading:
                "1. Why Timing Matters",

            paragraphs: [

                "Interest is charged on the balance you still owe, and that balance is highest at the start of a loan. So a large share of each early EMI goes to interest and only a small share reduces the principal.",

                "On the loan in the example below, about 71.9% of the first EMI (₹17,708 of ₹24,618) is interest. By the 61st EMI it is about 57.1% (₹14,065), and by the 121st about 34.5% (₹8,500).",

                "A rupee prepaid early removes principal that would otherwise have been charged interest for many years. A rupee prepaid late has far less time left to save anything."

            ]

        },


        {

            id:
                "what-the-pattern-shows",

            heading:
                "2. What the Pattern Shows",

            paragraphs: [

                "Measured against the amount prepaid, the saving falls from about ₹2.12 of interest for every ₹1 prepaid when the payment is made right away, to about ₹1.68 after 2 years, ₹1.13 after 5 years and ₹0.44 after 10 years.",

                "The time saved shrinks in the same way, from 3 years 1 month to 1 year 5 months. The change is gradual rather than sudden: each extra year of waiting reduces the benefit a little more."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "3. What This Does Not Tell You",

            paragraphs: [

                "These figures describe what a prepayment does at different times. They do not say when, or whether, you should prepay. Making an early prepayment needs money to be available, and that money may have other uses.",

                "Emergency savings, other debts, your lender's prepayment rules and any charges all matter too. This article gives information, not advice."

            ]

        },


        {

            id:
                "try-your-own-timing",

            heading:
                "4. Try Your Own Timing",

            paragraphs: [

                "In the Loan Prepayment Calculator, the Make the Prepayment After field sets when the prepayment happens. Entering 0 means right away, before your next EMI. Entering 24 means after 24 more EMIs have been paid.",

                "Enter your own balance, interest rate, remaining tenure and prepayment, then change that one field to see how much the timing alone changes the result."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹3,00,000 Prepaid at Four Different Times",

        paragraphs: [

            "Suppose you owe ₹25,00,000 at an interest rate of 8.5% a year, with 15 years (180 monthly payments) left. The EMI is about ₹24,618 and, without a prepayment, the interest over the remaining 15 years is about ₹19,31,328. In each case below, the EMI is kept the same and no charges are included.",

            "Prepaid right away: the loan ends after 11 years 11 months, which is 3 years 1 month sooner, and the interest saved is about ₹6,35,199.",

            "Prepaid after 2 years (24 EMIs): the loan ends after 12 years 4 months, which is 2 years 8 months sooner, and the interest saved is about ₹5,04,951.",

            "Prepaid after 5 years (60 EMIs): the loan ends after 12 years 11 months, which is 2 years 1 month sooner, and the interest saved is about ₹3,39,823.",

            "Prepaid after 10 years (120 EMIs): the loan ends after 13 years 7 months, which is 1 year 5 months sooner, and the interest saved is about ₹1,31,906."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Because loan interest is charged on a balance that shrinks over time, the same payment does more work the earlier it is made. Seeing that effect with your own numbers helps you judge how much a prepayment, and its timing, would change your loan."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Timing changes the size of the saving, but it does not tell you whether prepaying is right for you.",

        "Check your lender's prepayment rules, charges and how it applies a payment.",

        "Keep an appropriate emergency fund before using surplus money for a prepayment.",

        "Compare the interest saved with your other financial priorities.",

        "Remember that the figures are estimates from a standard monthly model."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Does prepaying earlier always save more interest?",

            answer:
                "For the same amount on the same loan, under the standard model used here, an earlier prepayment saves at least as much interest as a later one, because it reduces the balance for longer. Real results depend on your lender's terms."

        },


        {

            question:
                "Why is so much of an early EMI interest?",

            answer:
                "Interest is charged on the balance you owe, which is highest at the start. A larger share of the early EMIs therefore goes to interest and a smaller share to principal."

        },


        {

            question:
                "Is a late prepayment pointless?",

            answer:
                "No. It still reduces the balance, and the interest charged from then on, but there is less time left for the saving to build up, so the amount is smaller. Whether it makes sense depends on your circumstances."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Loan Prepayment Calculator, using a standard monthly model with the EMI kept the same and no charges. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
