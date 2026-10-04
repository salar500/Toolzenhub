/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How Much Home Loan Fits Your EMI Budget?

   Category:
   Loans

   Topic:
   Home Loan

   Every figure below was worked out with the Home Loan
   Calculator's model and checked against an independent
   reference (tests/fixtures/home-loan-golden.py, which simulates
   the repayment month by month and searches whole rupees): an
   income of Rs 1,00,000, a 40% share for EMIs, existing EMIs of
   Rs 10,000, 8.5% a year over 20 years. Planning arithmetic on
   the numbers entered, not a lender's offer or decision.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Most people start a home search from the price of a property and work backwards to a loan. It is often clearer to start from the monthly EMI you are comfortable carrying and work out the loan that fits. This guide does that on one example: from income to an EMI room, from the room to a loan, and from the loan to a simple property budget. It is your own planning, not a lender's decision.",


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

        "EMI Budget",

        "Loan Amount",

        "Financial Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Start from the monthly EMI you choose to carry. The loan that fits follows from the EMI, the rate and the tenure.",

        "With an income of ₹1,00,000 and a 40% share for EMIs, ₹40,000 a month is available. Existing EMIs of ₹10,000 leave an EMI room of ₹30,000.",

        "At 8.5% a year over 20 years, a ₹30,000 EMI room fits a loan of ₹34,56,925. With no existing EMIs the room is ₹40,000 and the loan ₹46,09,233.",

        "The share of income is your own limit, not a lender's. 40% here is only an example.",

        "This is planning arithmetic. It is not a lender's offer or decision."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your income, the share you would put towards EMIs, a rate and a tenure to see the loan that fits your EMI budget."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "start-from-the-emi",

            label:
                "Start From the EMI"

        },


        {

            id:
                "from-income-to-an-emi-room",

            label:
                "From Income to an EMI Room"

        },


        {

            id:
                "from-the-room-to-a-loan",

            label:
                "From the Room to a Loan"

        },


        {

            id:
                "adding-your-own-funds",

            label:
                "Adding Your Own Funds"

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
                "start-from-the-emi",

            heading:
                "1. Start From the EMI",

            paragraphs: [

                "An EMI calculator answers one question: given a loan, what is the monthly EMI? A home search usually begins with the opposite one: given the EMI I can carry, how large a loan fits?",

                "The second question is the better first step, because the EMI is the number you live with every month. The loan, and the property budget it implies, follow from it."

            ]

        },


        {

            id:
                "from-income-to-an-emi-room",

            heading:
                "2. From Income to an EMI Room",

            paragraphs: [

                "Choose the share of your income you are willing to put towards EMIs. This is your own limit; lenders use their own, which are not part of this calculation. Take a monthly income of ₹1,00,000 and a share of 40% as an example: that is ₹40,000 a month.",

                "Part of that may already be spoken for. If you pay ₹10,000 a month in existing EMIs, the EMI room for a new loan is ₹40,000 − ₹10,000 = ₹30,000. If you pay nothing, the room is the full ₹40,000.",

                "If your existing payments are as large as the whole share, there is no room for a new EMI under those numbers. That is a result, not an error."

            ]

        },


        {

            id:
                "from-the-room-to-a-loan",

            heading:
                "3. From the Room to a Loan",

            paragraphs: [

                "With an EMI room, a rate and a tenure, the loan that fits is the largest amount whose EMI is no more than the room. At 8.5% a year over 20 years, a room of ₹30,000 fits a loan of ₹34,56,925. Its EMI is ₹30,000.00 to the paisa, and over 20 years you would repay ₹71,99,999.59, of which ₹37,43,074.59 is interest.",

                "The loan is rounded down to a whole rupee, so that the EMI never goes above the room. With no existing EMIs, the room is ₹40,000 and the same rate and tenure fit ₹46,09,233, which is ₹11,52,308 more."

            ]

        },


        {

            id:
                "adding-your-own-funds",

            heading:
                "4. Adding Your Own Funds",

            paragraphs: [

                "If you plan to put your own money into the purchase, add it to the loan for a simple property budget. With ₹5,00,000 of your own funds, the loan of ₹34,56,925 gives a property budget of ₹39,56,925.",

                "This is a plain total. It does not include stamp duty, registration, fees, insurance or tax, and it says nothing about what a lender requires you to contribute."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The loan that fits is arithmetic on the numbers you enter: your share, your rate and your tenure, with the rate assumed to stay the same. It is not a lender's offer, and it does not use a lender's rules, your credit history, your age, your employment or your documents.",

                "It also leaves out fees, stamp duty, registration, insurance, changes in the rate, tax benefits and part-payments. Use it to understand your own numbers, not as a promise of what any lender will do."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹1,00,000 Income, 40% for EMIs, ₹10,000 Existing EMIs",

        paragraphs: [

            "₹40,000 is available for EMIs and ₹30,000 after the existing payments. At 8.5% a year over 20 years, the loan that fits is ₹34,56,925, with total interest of ₹37,43,074.59 and a total repayment of ₹71,99,999.59.",

            "With ₹5,00,000 of your own funds the simple property budget is ₹39,56,925. With no existing EMIs the loan that fits is ₹46,09,233."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A loan is easier to judge once it is tied to a monthly payment you chose. Starting from the EMI turns a vague 'how much can I borrow' into a number you can check against your own budget, before any property or lender is involved."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Choose the share of income yourself; it is your limit, not a lender's.",

        "Count every existing EMI and loan payment before the room is worked out.",

        "Remember that the rate and the tenure are assumptions.",

        "Remember that fees, stamp duty, registration, insurance and tax are not in the figure."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Is the loan that fits what a lender would offer?",

            answer:
                "No. A lender decides on its own rules. This is the loan that fits an EMI budget you set, under a rate and a tenure you assume."

        },


        {

            question:
                "What share of income should I choose?",

            answer:
                "That is your decision, and the calculator does not suggest one. 40% is only an example. Try a few and see how the loan changes."

        },


        {

            question:
                "Why is the EMI slightly below the room?",

            answer:
                "The loan is rounded down to a whole rupee, so its EMI can be a fraction of a paisa under the room, never above it."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Home Loan Calculator, using an income of ₹1,00,000, a 40% share, existing EMIs of ₹10,000, 8.5% a year, 20 years and ₹5,00,000 of own funds. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
