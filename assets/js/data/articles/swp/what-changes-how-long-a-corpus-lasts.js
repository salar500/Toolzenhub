/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   What Changes How Long a Corpus Lasts: Return, Withdrawal and
   Yearly Increase

   Category:
   Investment

   Topic:
   SWP

   One baseline, changed ONE assumption at a time: Rs 1 crore,
   Rs 80,000 a month at the START of each month, an ASSUMED 8% a
   year (an effective annual rate) and no yearly increase. Every
   figure was worked out with the SWP Calculator's model and
   checked against an independent reference
   (tests/fixtures/swp-golden.py, "articles" block). A duration
   counts the full monthly withdrawals; a part-paid last
   withdrawal is not counted as time. They are modeled scenarios,
   not forecasts.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Two plans that look alike can last very different lengths of time. This guide starts from one plan, ₹1 crore with ₹80,000 withdrawn each month at an assumed 8% a year, which lasts 20 years 10 months. It then changes one assumption at a time, the return, the withdrawal and a yearly increase, to show which changes matter and why the effect is not proportional.",


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

        "SWP",

        "Withdrawal Planning",

        "Return Assumptions",

        "Financial Planning"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Return: at an assumed 6% the baseline plan lasts 15 years 11 months, at 9% it lasts 26 years 1 month and at 10% it lasts 47 years 2 months. The gain from each extra point grows as the return rises.",

        "Withdrawal: ₹90,000 a month lasts 16 years 1 month, ₹70,000 lasts 31 years 9 months and ₹66,000 lasts 44 years 11 months. At ₹65,000 the model's balance is still ₹23,09,976 at the calculator's 50-year limit.",

        "Yearly increase: raising the withdrawal by 3% a year shortens the plan to 14 years 7 months, and by 5% a year to 12 years 7 months.",

        "Near the point where modeled growth matches the withdrawal, a small change can move the answer by years.",

        "These are modeled scenarios at an assumed constant return, not forecasts, and not suggestions for any input."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Choose \"How long will my corpus last?\", then change one value at a time and compare the lower and higher return scenarios the calculator shows beside your own."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "one-plan-one-change",

            label:
                "One Plan, One Change at a Time"

        },


        {

            id:
                "the-assumed-return",

            label:
                "The Assumed Return"

        },


        {

            id:
                "the-withdrawal-amount",

            label:
                "The Withdrawal Amount"

        },


        {

            id:
                "the-yearly-increase",

            label:
                "The Yearly Increase"

        },


        {

            id:
                "a-constant-return",

            label:
                "A Constant Return Is Not How Returns Arrive"

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
                "one-plan-one-change",

            heading:
                "1. One Plan, One Change at a Time",

            paragraphs: [

                "The baseline is a corpus of ₹1 crore, a withdrawal of ₹80,000 a month taken at the start of each month, an assumed return of 8% a year and no yearly increase. In the model it lasts 20 years 10 months.",

                "Each section below changes one of those assumptions and leaves the rest as they are. A duration here counts the full monthly withdrawals, so a small part-paid withdrawal at the end is not counted as time."

            ]

        },


        {

            id:
                "the-assumed-return",

            heading:
                "2. The Assumed Return",

            paragraphs: [

                "At an assumed 6% the same plan lasts 15 years 11 months, which is 4 years 11 months less than the baseline. At 9% it lasts 26 years 1 month, and at 10% it lasts 47 years 2 months.",

                "The effect is lopsided. Two points lower costs 4 years 11 months, while two points higher adds 26 years 4 months. Going from 8% to 9% adds 5 years 3 months, and going from 9% to 10% adds another 21 years 1 month, because a higher return replaces more of each withdrawal and a slower fall leaves more balance to earn growth."

            ]

        },


        {

            id:
                "the-withdrawal-amount",

            heading:
                "3. The Withdrawal Amount",

            paragraphs: [

                "Back at 8%, a withdrawal of ₹90,000 a month lasts 16 years 1 month. A withdrawal of ₹70,000 lasts 31 years 9 months, which is 10 years 11 months longer than the baseline. A withdrawal of ₹66,000 lasts 44 years 11 months, a further 13 years 2 months for a cut of only ₹4,000.",

                "The reason is a threshold. On ₹1 crore at an assumed 8%, one month's modeled growth on the remaining balance equals the withdrawal at about ₹63,929 a month. The closer a withdrawal is to that level, the more slowly the balance falls, so the same cut buys more years. At ₹65,000 the model's balance is still ₹23,09,976 after the calculator's 50-year limit, so a ₹1,000 cut from ₹66,000 turns a plan that is used up into one that is not used up within that limit.",

                "None of these withdrawals is a suggestion. They show how sensitive the answer is, nothing more."

            ]

        },


        {

            id:
                "the-yearly-increase",

            heading:
                "4. The Yearly Increase",

            paragraphs: [

                "The calculator can raise the withdrawal once a year by a percentage you choose. With a 3% increase the second year's withdrawal is ₹82,400 a month, and the plan lasts 14 years 7 months, which is 6 years 3 months shorter than the baseline. With a 5% increase the plan lasts 12 years 7 months, 8 years 3 months shorter, and by year 10 the monthly withdrawal has risen to about ₹1,24,106.",

                "The increase is a percentage you choose, not a forecast of inflation. The calculator does not know or predict inflation and does not adjust for it. Whether a plan with a yearly increase suits you is your decision; this guide does not say what to choose."

            ]

        },


        {

            id:
                "a-constant-return",

            heading:
                "5. A Constant Return Is Not How Returns Arrive",

            paragraphs: [

                "Every figure above uses one return applied the same way every year. Actual investment returns vary from year to year, can be negative, and do not arrive evenly, so a real plan can follow a different path from a steady one even if the average looks the same.",

                "Taxes, fund charges, exit loads and inflation are not included either. Investments are subject to market risk. The figures show how a model responds to its inputs, not what any investment will do."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: Reproduce the Baseline",

        paragraphs: [

            "In the SWP Calculator choose \"How long will my corpus last?\", enter a corpus of ₹1 crore, a monthly withdrawal of ₹80,000, a return of 8% a year and no yearly increase. The estimate is 20 years 10 months.",

            "Then change one value at a time, for example the return to 6% or 10%, or the withdrawal to ₹70,000, and read the estimate again. Each figure in this guide comes from the calculator's own model."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "How long a corpus lasts depends on several assumptions at once, and they do not matter equally. Changing them one at a time shows where an estimate is sensitive, which is a way of reading a scenario, not of choosing inputs."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Treat each duration as a scenario for the inputs shown.",

        "Try a lower and a higher return as well as the one you assume, to see how much depends on it.",

        "Notice how close a withdrawal is to the level where modeled growth just matches it.",

        "Remember that a yearly increase is a percentage you choose, not an inflation forecast.",

        "Remember that taxes, charges and inflation are not in the model.",

        "Remember that investments are subject to market risk."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why do the changes get larger as the return rises?",

            answer:
                "A higher return replaces more of each withdrawal, so the balance falls more slowly, and a slower fall leaves more balance to earn growth. Near the point where growth matches the withdrawal the balance barely falls, so a plan can last a very long time."

        },


        {

            question:
                "Is the yearly increase the same as inflation?",

            answer:
                "No. It is a percentage you choose. The calculator does not know or predict inflation."

        },


        {

            question:
                "Does a longer duration mean a plan is right for me?",

            answer:
                "No. A duration only describes the arithmetic for the inputs shown. Whether a plan suits your circumstances is your decision, and this guide does not say what to choose."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the SWP Calculator, using its standard model: each withdrawal is taken at the start of the month and the annual return is treated as an effective annual rate. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
