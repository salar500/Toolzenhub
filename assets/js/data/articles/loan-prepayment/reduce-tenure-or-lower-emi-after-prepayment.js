/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Reduce Tenure or Lower the EMI After Prepaying:
   Which Saves More?

   Category:
   Finance

   Topic:
   Loan Prepayment

   Every figure below was worked out with the Loan Prepayment
   Calculator's model and checked against an independent
   reference (tests/fixtures/prepayment-golden.py):
   Rs 25,00,000 owed at 8.5% a year with 180 monthly payments
   left, Rs 3,00,000 prepaid before the next EMI.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "After a loan prepayment, one choice often comes up: keep paying the same EMI and finish the loan sooner, or keep the end date and lower the EMI. Both reduce interest, but not equally. This guide works through one example and explains why the two outcomes differ.",


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

        "EMI",

        "Loan Tenure",

        "Interest Savings"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Keeping your EMI after a prepayment shortens the loan. Lowering your EMI keeps the end date and reduces what you pay each month.",

        "In the example below, the same ₹3,00,000 prepayment saves about ₹6,35,199 in interest if the EMI is kept, and about ₹2,31,759 if the EMI is lowered.",

        "Under the same assumptions, keeping the EMI saves at least as much interest as lowering it, because the balance is repaid faster.",

        "A lower EMI gives monthly breathing room. A shorter loan gives a larger interest saving. Which suits you depends on your own situation.",

        "Whether a lender offers both options, and how it applies a prepayment, depends on the loan terms."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your own balance, interest rate, remaining tenure and prepayment to see both outcomes side by side."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "two-ways-a-prepayment-changes-a-loan",

            label:
                "The Two Ways a Prepayment Can Change a Loan"

        },


        {

            id:
                "why-the-outcomes-differ",

            label:
                "Why the Two Outcomes Differ"

        },


        {

            id:
                "cash-flow-or-interest",

            label:
                "Cash Flow or Interest: What Each Choice Gives You"

        },


        {

            id:
                "small-amounts",

            label:
                "The Gap Shows Up at Small Amounts Too"

        },


        {

            id:
                "why-lender-figures-differ",

            label:
                "Why Your Lender's Figures May Differ"

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
                "two-ways-a-prepayment-changes-a-loan",

            heading:
                "1. The Two Ways a Prepayment Can Change a Loan",

            paragraphs: [

                "A prepayment is a one-time payment that reduces the principal you still owe. What happens next depends on what happens to your EMI.",

                "Keep the EMI: you continue to pay the same amount each month. Because the balance is lower, it is cleared sooner, so the loan ends earlier.",

                "Lower the EMI: the loan keeps its original end date, and the EMI is worked out again on the smaller balance, so each monthly payment is smaller.",

                "Lenders differ in which of these they offer and in how they apply a prepayment, so check your loan terms. The figures in this article show what each choice would do if it were available."

            ]

        },


        {

            id:
                "why-the-outcomes-differ",

            heading:
                "2. Why the Two Outcomes Differ",

            paragraphs: [

                "Interest is charged on the balance you still owe. When you keep the EMI, every payment keeps reducing the balance at the original pace, but from a lower starting point. The balance shrinks sooner, so less interest builds up.",

                "When you lower the EMI, you pay less each month, so the balance comes down more slowly over the same period. The balance stays higher for longer, and interest is charged on it for longer.",

                "In this model, for the same prepayment made at the same time, keeping the EMI saves at least as much interest as lowering it. The example below shows how large the gap can be."

            ]

        },


        {

            id:
                "cash-flow-or-interest",

            heading:
                "3. Cash Flow or Interest: What Each Choice Gives You",

            paragraphs: [

                "Lowering the EMI frees up money every month for the rest of the loan. Keeping the EMI gives up that monthly relief in return for ending the loan sooner and saving more interest.",

                "Neither choice is better in itself. It depends on how comfortable your monthly budget is, your other commitments and what you would do with any money freed each month. This article gives information, not advice."

            ]

        },


        {

            id:
                "small-amounts",

            heading:
                "4. The Gap Shows Up at Small Amounts Too",

            paragraphs: [

                "The difference is not limited to large prepayments. On the same loan, a prepayment of ₹25,000 made after 12 EMIs would save more than ₹56,000 in interest if you keep the EMI, and about ₹17,837 if you lower it.",

                "Because a lower EMI repays the balance more slowly, the interest saving is smaller whatever the size of the prepayment."

            ]

        },


        {

            id:
                "why-lender-figures-differ",

            heading:
                "5. Why Your Lender's Figures May Differ",

            paragraphs: [

                "The figures here use a standard monthly model: interest is charged each month on the balance still owed, the rate stays the same, and no charges, fees or taxes are included.",

                "Real loans can differ in the date a payment is applied, how often interest is calculated, rounding, prepayment charges and the options available after a prepayment. Check your loan agreement, and treat any calculator result as an estimate."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹3,00,000 Prepaid on a ₹25,00,000 Loan",

        paragraphs: [

            "Suppose you owe ₹25,00,000 at an interest rate of 8.5% a year, with 15 years (180 monthly payments) left. The EMI is about ₹24,618. If nothing changes, you will pay about ₹19,31,328 in interest over the remaining 15 years, and about ₹44,31,328 in total.",

            "Now suppose you make a one-time prepayment of ₹3,00,000 right away, before your next EMI. The balance falls to ₹22,00,000.",

            "If you keep the EMI at about ₹24,618, the loan ends after 143 payments (11 years 11 months) instead of 180 (15 years), which is 37 months, or 3 years 1 month, sooner. Interest falls to about ₹12,96,129, a saving of about ₹6,35,199, and you pay about ₹37,96,129 in total.",

            "If you lower the EMI and keep the 15-year end date, the EMI is worked out again on the ₹22,00,000 balance. It falls to about ₹21,664, which is about ₹2,954 less every month. Interest falls to about ₹16,99,569, a saving of about ₹2,31,759, and you pay about ₹41,99,569 in total.",

            "Both choices reduce interest. Keeping the EMI saves about ₹4,03,439 more than lowering it, while lowering it leaves about ₹2,954 more in your pocket every month."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A prepayment can change a loan in two ways, and the choice between them is a trade-off between monthly cash flow and total interest. Seeing both outcomes with your own numbers makes that trade-off concrete."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Check which options your lender offers after a prepayment and how it applies the payment.",

        "Compare the interest saved with your other financial priorities and your emergency savings.",

        "Look at how a lower EMI fits your monthly budget, not only at total interest.",

        "Check your loan agreement for prepayment charges, minimum amounts or other conditions.",

        "Remember that the figures are estimates from a standard model."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Does keeping the EMI always save more interest than lowering it?",

            answer:
                "Under the standard model used here, for the same prepayment made at the same time, keeping the EMI saves at least as much interest as lowering it, because the balance is repaid faster. A lender's actual terms and charges can change the picture."

        },


        {

            question:
                "Why does lowering the EMI still reduce interest?",

            answer:
                "The prepayment reduces the balance that interest is charged on. You then repay that smaller balance more slowly than you would if you kept the EMI, so the saving is smaller."

        },


        {

            question:
                "Can I choose between the two options with my lender?",

            answer:
                "Some lenders offer a choice and some apply a prepayment in a set way. Check your loan terms or ask your lender."

        },


        {

            question:
                "Is a lower EMI the better choice if I need monthly flexibility?",

            answer:
                "It depends on your situation. A lower EMI eases monthly payments but costs more interest in total than keeping the EMI. This article gives information, not advice."

        },


        {

            question:
                "Where do the figures in the example come from?",

            answer:
                "They come from the Loan Prepayment Calculator, which uses a standard monthly model with no charges, so you can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
