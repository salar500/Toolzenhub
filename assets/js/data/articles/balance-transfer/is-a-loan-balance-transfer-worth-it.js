/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Is a Loan Balance Transfer Worth It? Use Break-Even to Decide

   Category:
   Finance

   Topic:
   Balance Transfer

   Every figure below was worked out with the Loan Balance
   Transfer Calculator's model and checked against an independent
   reference (tests/fixtures/balance-transfer-golden.py). The
   scenarios use the same standard monthly model as the calculator;
   no lender rules are assumed.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A lower interest rate on your running loan sounds like an easy win, but the new lender's charges, the time left on your loan and the tenure you choose all change the answer. This guide shows how to use the break-even point to judge an offer, with worked examples and no lender-specific rules.",


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

        "Loan Refinancing",

        "Break-Even",

        "Loan Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "A balance transfer pays off only when the lower payments earn back the up-front charges. That point is the break-even.",

        "In the main example below, ₹17,500 of charges are earned back by month 12 and switching may save about ₹2,50,183 over 15 years.",

        "With a tiny rate drop or very little time left, the break-even can be years away, or never come.",

        "A longer new tenure can lower the EMI and still cost more overall, so compare the offer over your current remaining tenure too.",

        "These are estimates from a standard model. They are not advice, and lender charges and rules vary."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter your current loan, the new offer and the charges you were quoted to see the saving after charges, the break-even month and the same-tenure check."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "what-a-transfer-changes",

            label:
                "What a Transfer Changes"

        },


        {

            id:
                "reading-the-break-even",

            label:
                "Reading the Break-Even"

        },


        {

            id:
                "when-it-takes-long-or-never",

            label:
                "When It Takes Long, or Never"

        },


        {

            id:
                "check-the-rate-not-just-the-emi",

            label:
                "Check the Rate, Not Just the EMI"

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
                "what-a-transfer-changes",

            heading:
                "1. What a Transfer Changes",

            paragraphs: [

                "Moving a loan means a new lender pays off your current one, and you repay the new lender. Three things change: the interest rate, the one-time charges you pay to make the move, and, if you choose, the tenure.",

                "The rate lowers what each month's interest costs. The charges are paid up front, so on the day you switch you are behind by that amount. The tenure decides how many months you keep paying. Whether the move is worth it depends on all three together, not on the rate alone."

            ]

        },


        {

            id:
                "reading-the-break-even",

            heading:
                "2. Reading the Break-Even",

            paragraphs: [

                "The break-even is the first month in which the payments you have saved add up to at least the charges you paid. Before it you are behind. After it you are ahead, as long as the new loan stays cheaper.",

                "Think of your position as a running total. It starts at minus the charges. Each month the new, lower EMI adds the difference between the old EMI and the new one. When the total reaches zero you have earned the charges back.",

                "In the example below the charges are ₹17,500 and the EMI falls by about ₹1,487 a month, so the running total reaches zero in month 12 and keeps rising to a saving of about ₹2,50,183 by the end of the loan."

            ]

        },


        {

            id:
                "when-it-takes-long-or-never",

            heading:
                "3. When It Takes Long, or Never",

            paragraphs: [

                "A small rate drop saves little each month, so the same charges take much longer to earn back. A tenth of a percentage point on a ₹10,00,000 loan with 10 years left lowers the EMI by only about ₹53, and ₹5,000 of charges are not earned back until month 94, which is 7 years 10 months. The saving over the whole loan is then only about ₹1,410.",

                "When little time is left, there is little interest left to save. On ₹2,00,000 with 6 months to go, a drop from 12% to 10% lowers the EMI by about ₹197, but with ₹2,000 of charges switching would cost about ₹816 more overall and the charges are never earned back.",

                "The calculator also shows the break-even rate: the highest new rate at which switching still pays for your charges and tenure. With ₹17,500 of charges in the main example it is about 9.44%, only a little below the current 9.5%. With ₹4,00,000 of charges it falls to about 7.99%, so a drop to 8.5% would not be enough."

            ]

        },


        {

            id:
                "check-the-rate-not-just-the-emi",

            heading:
                "4. Check the Rate, Not Just the EMI",

            paragraphs: [

                "A lower EMI can come from a lower rate, from a longer tenure, or both. A longer tenure lowers the payment because you spread the same balance over more months, but you also pay interest for more months.",

                "To tell the two apart, compare the offer over your current remaining tenure as well. The calculator does this whenever the new tenure differs from the time you have left, and shows it as a fair check next to the result.",

                "In the example below, the same 8.5% offer over 20 years instead of 15 cuts the EMI by about ₹4,410 a month, but switching would cost about ₹5,25,428 more overall. Over the original 15 years the same rate would save about ₹2,50,183. The difference comes from the extra 5 years, not from the rate."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "A break-even month and a net saving describe the numbers you enter. They do not say whether you should switch. Your plans for the loan, how long you expect to keep it and your other financial priorities all matter.",

                "The figures assume both rates stay the same and that the charges are the amounts you enter, paid up front. Introductory or changing rates, how a lender calculates interest, and rules about charges can all change real results. This article gives information, not advice."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹25,00,000 Moved From 9.5% to 8.5%",

        paragraphs: [

            "Suppose you owe ₹25,00,000 at 9.5% a year with 15 years (180 monthly payments) left. The EMI is about ₹26,106 and, if you stay, you pay about ₹21,99,011 of interest. A new lender offers 8.5% for the same 15 years and asks ₹17,500 in charges. The new EMI is about ₹24,618 and the interest about ₹19,31,328.",

            "Over the whole loan, switching may save about ₹2,50,183 after the charges. The charges are earned back by month 12: after one year you are about ₹346 ahead.",

            "Now suppose the same offer runs for 20 years. The EMI falls to about ₹21,696, which is ₹4,410 less each month. The charges look quickly covered, by month 4. But you pay for 5 more years, and over the whole period switching would cost about ₹5,25,428 more than staying. Compared over the same 15 years, the rate on its own would save about ₹2,50,183."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A lower rate is only the start of the comparison. Count the charges, find the break-even, and check the offer over the same tenure. Doing that with your own numbers shows whether a lower EMI is a real saving or just a longer loan."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Ask for every charge in writing, at both lenders, before comparing.",

        "Compare the offer over your current remaining tenure as well as the tenure on offer.",

        "A break-even far in the future matters less if you may repay the loan sooner, and more if you expect to keep it.",

        "Check whether the new rate is fixed or can change, since the calculator assumes it stays the same.",

        "Remember that the figures are estimates from a standard monthly model."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "What is the break-even in a balance transfer?",

            answer:
                "It is the first month in which the payments you have saved add up to at least the charges you paid up front. Before it you are behind; after it you are ahead, if the new loan stays cheaper."

        },


        {

            question:
                "Can a balance transfer cost more even with a lower rate?",

            answer:
                "Yes. If the charges are large, little time is left, or the new tenure is much longer, the extra cost can outweigh what the lower rate saves. The calculator shows the total and the break-even so you can see which case you are in."

        },


        {

            question:
                "Why compare over the same tenure?",

            answer:
                "A longer tenure lowers the EMI by spreading the balance over more months, which also adds interest. Comparing over the tenure you have left shows what the lower rate does on its own."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the Loan Balance Transfer Calculator, using a standard monthly model, the same balance for both loans, the rates staying constant and the charges paid up front. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
