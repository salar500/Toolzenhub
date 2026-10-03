/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Loan Balance Transfer vs Prepayment: Which Saves More?

   Category:
   Finance

   Topic:
   Balance Transfer

   Every figure below was worked out with the Loan Balance Transfer
   and Loan Prepayment Calculators' models and checked against an
   independent reference (tests/fixtures/balance-transfer-golden.py,
   the "articles" scenarios): Rs 25,00,000 owed at 9.5% a year with
   180 monthly payments left, Rs 3,00,000 of savings, Rs 17,500 of
   charges, the EMI kept the same. "Interest and charges" means the
   interest still to be paid plus any charges; the principal is
   repaid in every case.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Two common ways to cut the cost of a running loan are moving it to a lower rate and paying part of it off. They use your money differently, so they are easy to mix up. This guide compares them on one loan, shows how they can be combined, and shows where the order flips.",


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

        "Balance Transfer",

        "Loan Prepayment",

        "Interest Savings",

        "Loan Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "A transfer spends only the charges and changes the rate; a prepayment spends a lump sum and lowers the balance. They save interest in different ways.",

        "In the example, prepaying ₹3,00,000 saves about ₹7,57,014 of interest. Switching from 9.5% to 8.5% saves about ₹2,50,183 after ₹17,500 of charges and leaves ₹2,82,500 unspent.",

        "Doing both, switching and then prepaying the rest, saves about ₹8,54,697, more than either alone.",

        "If the rate drop is small, the order flips: with 9.3% instead of 8.5%, prepaying alone saves more than switching and then prepaying.",

        "This compares numbers. It is not advice on which to choose, and lender rules and charges vary."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your current loan, the new offer and the charges you were quoted to see what switching would save after charges."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "two-different-levers",

            label:
                "Two Different Levers"

        },


        {

            id:
                "the-same-loan-three-ways",

            label:
                "The Same Loan, Three Ways"

        },


        {

            id:
                "where-the-order-flips",

            label:
                "Where the Order Flips"

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
                "two-different-levers",

            heading:
                "1. Two Different Levers",

            paragraphs: [

                "A prepayment lowers the balance you owe. The interest charged from then on falls because there is less left to charge it on, and it costs you a lump sum.",

                "A balance transfer lowers the rate on the balance you owe. It costs you the charges, which are usually much smaller than a lump sum, and it does not lower the balance at all.",

                "Because one uses a lump sum and the other uses charges, comparing them only makes sense once you decide how much money you have available and what you would do with what is left."

            ]

        },


        {

            id:
                "the-same-loan-three-ways",

            heading:
                "2. The Same Loan, Three Ways",

            paragraphs: [

                "Take ₹25,00,000 owed at 9.5% with 15 years left, ₹3,00,000 of savings, and a new lender offering 8.5% for the same 15 years with ₹17,500 of charges. If you do nothing, the interest still to pay is about ₹21,99,011.",

                "Prepay only: using all ₹3,00,000 to prepay and keeping your EMI saves about ₹7,57,014 of interest and ends the loan after 140 EMIs.",

                "Switch only: paying ₹17,500 of charges and moving to 8.5% saves about ₹2,50,183 after the charges. It uses only a small part of the savings and leaves ₹2,82,500 unspent.",

                "Switch, then prepay the rest: after switching, using the remaining ₹2,82,500 to prepay the new loan saves about ₹8,54,697 in interest after the charges, and the loan ends after 144 EMIs."

            ]

        },


        {

            id:
                "where-the-order-flips",

            heading:
                "3. Where the Order Flips",

            paragraphs: [

                "The comparison depends on how big the rate drop is. Change the new rate to 9.3%, only 0.2 points lower, and keep everything else the same.",

                "Prepaying alone still saves about ₹7,57,014. Switching alone now saves only about ₹36,655 after the charges. Switching and then prepaying the rest saves about ₹7,33,672, which is now less than prepaying without switching, because the small rate drop does not make up for the charges.",

                "Per rupee of money spent, the pattern is the same. In the first case ₹17,500 of charges buy about ₹14.30 of saving for each ₹1. In the second they buy about ₹2.09 for each ₹1, while each ₹1 prepaid buys about ₹2.52 in both."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "4. What This Does Not Tell You",

            paragraphs: [

                "These figures compare interest and charges on one loan. They do not say what to do. Money used to prepay is no longer available for other needs, such as an emergency fund or other debts, and money left unspent could be used elsewhere. The figures ignore any return you could earn on it.",

                "Charges, whether your lender allows a prepayment, and how a payment is applied all vary by lender and loan. This article gives information, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹25,00,000 at 9.5%, ₹3,00,000 Available",

        paragraphs: [

            "With 15 years left and no change, you pay about ₹21,99,011 of interest. All figures keep the EMI the same and count interest plus charges; the principal is repaid in every case.",

            "Prepaying ₹3,00,000 saves about ₹7,57,014. Switching to 8.5% (₹17,500 of charges, same 15 years) saves about ₹2,50,183. Switching and then prepaying the remaining ₹2,82,500 saves about ₹8,54,697.",

            "With a new rate of 9.3% instead of 8.5%, the same three choices save about ₹7,57,014, ₹36,655 and ₹7,33,672."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A transfer works on the rate and a prepayment works on the balance. Which matters more depends on how large the rate drop is and how much money you can use. Trying both on your own numbers shows how they compare, and how much of the difference is simply the charges."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Decide how much money you can use before comparing the two.",

        "Keep an appropriate emergency fund before using surplus money for a prepayment.",

        "Check your lender's prepayment rules and any charges at both lenders.",

        "Compare the rate drop with the charges, not the rate alone.",

        "Remember that the figures are estimates from a standard monthly model."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Can I switch lenders and prepay as well?",

            answer:
                "The calculators model each separately. Doing both is possible in principle, and the example shows its effect, but whether it is allowed and what it costs depends on the lenders and the loan."

        },


        {

            question:
                "Is a transfer or a prepayment better?",

            answer:
                "It depends on the size of the rate drop, the charges and the money you can use. The example shows both orders: a larger drop favours switching, a small drop with the same charges favours prepaying. It is not a recommendation."

        },


        {

            question:
                "Why does a balance transfer save less interest than a big prepayment?",

            answer:
                "A transfer lowers the rate but not the balance, while a prepayment lowers the balance itself. A lump sum of ₹3,00,000 removes much more principal than the charges cost, so it can save more when the rate drop is modest."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Loan Balance Transfer and Loan Prepayment Calculators, using a standard monthly model with the EMI kept the same. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
