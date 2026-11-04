/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title, description, dates, read time, related tools and
   articles) lives in data/articles.js.

   Article:
   Best SIP Strategies for Beginners

   Category:
   Investment

   Topic:
   SIP

   Every figure is a PROJECTION at an ASSUMED constant return, worked out with the SIP Calculator's model and checked against the
   independent reference tests/fixtures/sip-golden.py (each SIP is invested at the start of the month; the annual return is divided
   by 12): Rs 10,000 a month for 15 years at 10% invested Rs 18,00,000 and is worth about Rs 41,79,243; at 9% about Rs 38,12,438.
   Rs 10,000 a month for 20 years invests Rs 24,00,000 and is worth about Rs 76,56,969; Rs 20,000 a month for 10 years also invests
   Rs 24,00,000 and is worth about Rs 41,31,040. Rs 5,000 a month at 10% is worth about Rs 3,90,412 after 5 years, Rs 10,32,760 after
   10, Rs 20,89,621 after 15 and Rs 38,28,485 after 20. Rs 10,000 a month for 10 years invests Rs 12,00,000 (about Rs 20,65,520); left
   untouched for 5 more years it is about Rs 33,98,419. The four invented prices 100, 80, 125 and 100 buy 100 + 125 + 80 + 100 = 405
   units for Rs 40,000: an average price of about Rs 98.77 against a simple average price of Rs 101.25. No return is promised or implied.
========================================================= */


const article = {

    introduction:
        "A SIP is a way of paying, not a product: a fixed amount goes into an investment on a fixed date every month. The strategies that matter for a beginner are less about picking the best fund and more about habits: knowing what the money is for, choosing an amount you can keep paying, starting early, raising it when you can, and not stopping when prices fall. This guide shows each one with a worked example, at an assumed return and with no promise of any result.",

    author: { name: "ToolZen Hub", type: "Organization", role: "Finance & Calculator Guides" },

    tags: ["SIP", "Investing for Beginners", "Investment Projection", "Financial Planning"],

    keyTakeaways: [
        "Start from the goal and the time you have. Money you will need soon should not depend on a market that can fall just before you need it.",
        "Pick an amount you can keep paying through a hard month. A smaller SIP that continues beats a larger one that stops.",
        "Time does most of the work in a projection: ₹10,000 a month for 20 years and ₹20,000 a month for 10 years both invest ₹24,00,000, but at an assumed 10% the first is estimated at about ₹76,56,969 and the second at about ₹41,31,040.",
        "Raise the amount when your income rises, and stay invested through falls: stopping a SIP also stops the units you would have bought at lower prices.",
        "Everything here is a projection at an assumed return, not a forecast. Mutual fund investments are subject to market risk."
    ],

    calculator: {
        description:
            "Enter an amount, a number of years and an assumed return to see the estimated value, then change one thing at a time (the years, the amount or the yearly step-up) to see what it does."
    },

    tableOfContents: [
        { id: "start-with-the-goal", label: "Start With the Goal and the Time You Have" },
        { id: "an-amount-you-can-keep-paying", label: "An Amount You Can Keep Paying" },
        { id: "start-early", label: "Start Early" },
        { id: "raise-it-when-you-can", label: "Raise It When You Can" },
        { id: "stay-through-the-falls", label: "Stay Invested Through the Falls" },
        { id: "mind-the-costs", label: "Mind the Costs and Know What You Hold" },
        { id: "review-once-a-year", label: "Review Once a Year" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "start-with-the-goal",
            heading: "1. Start With the Goal and the Time You Have",
            paragraphs: [
                "Write down what the money is for and when you will need it: a deposit for a house in ten years, a child's education in fifteen, retirement in twenty-five. The goal sets the amount you need and the time you have, and the time you have decides how much of a fall you can wait out.",
                "A market-linked investment can be worth less than you put in for a long time. Money you will need within a few years is the money least able to wait, so it belongs in something you understand to be steadier, even though that usually means a lower return. A SIP suits money with a long time ahead of it."
            ]
        },
        {
            id: "an-amount-you-can-keep-paying",
            heading: "2. An Amount You Can Keep Paying",
            paragraphs: [
                "Choose an amount that still fits in your month when something goes wrong. Most of the benefit of a SIP comes from its being regular, and a SIP you have to stop after six months does little.",
                "Keep an emergency fund separate, so that a medical bill or a gap in income does not force you to sell. If the amount you would like to invest is more than you can comfortably keep paying, start smaller and raise it later.",
                "Setting up an automatic instruction on the day after your salary arrives removes the monthly decision. You pay yourself first."
            ]
        },
        {
            id: "start-early",
            heading: "3. Start Early",
            paragraphs: [
                "At an assumed 10% a year, a SIP of ₹5,000 a month is estimated at about ₹3,90,412 after 5 years, ₹10,32,760 after 10 years, ₹20,89,621 after 15 years and ₹38,28,485 after 20 years. The amount invested grows in a straight line, from ₹3,00,000 to ₹12,00,000. The estimated value grows faster than that, because the growth itself earns growth.",
                "The same effect shows when you compare a long plan with a larger, shorter one. ₹10,000 a month for 20 years invests ₹24,00,000 and is estimated at about ₹76,56,969. ₹20,000 a month for 10 years invests exactly the same ₹24,00,000 and is estimated at about ₹41,31,040. Doubling the monthly amount did not make up for halving the time.",
                "This is arithmetic at an assumed constant return. Real returns are not constant and can be negative, so the numbers show the effect of time, not what you will receive."
            ]
        },
        {
            id: "raise-it-when-you-can",
            heading: "4. Raise It When You Can",
            paragraphs: [
                "Your income is likely to rise over the years, and your SIP can rise with it. A step-up raises the monthly amount by a fixed percentage once a year. It is a simple way to invest more without noticing the change month to month.",
                "The projection rises because you invest more, so compare the amount invested as well as the estimated value. The Step-Up SIP guide on this site works through ₹10,000 a month with a 5% and a 10% yearly step-up."
            ]
        },
        {
            id: "stay-through-the-falls",
            heading: "5. Stay Invested Through the Falls",
            paragraphs: [
                "Prices will move. A SIP buys a fixed amount of money's worth each month, so it buys more units when the price is low and fewer when it is high. Take four invented prices: 100, 80, 125 and 100. ₹10,000 a month buys 100, 125, 80 and 100 units, 405 in all for ₹40,000. The average price you paid is about ₹98.77, a little under the simple average of the four prices, ₹101.25.",
                "This is not a trick that makes a SIP beat every other way of investing: the prices were chosen for the example, and a price that only falls still loses money. It shows why stopping a SIP in a fall is costly. You stop buying at the lowest prices.",
                "Staying also matters for time. ₹10,000 a month for 10 years invests ₹12,00,000 and is estimated at about ₹20,65,520 at an assumed 10%. Left untouched for 5 more years it is estimated at about ₹33,98,419. Continuing the SIP for the full 15 years is estimated at about ₹41,79,243."
            ]
        },
        {
            id: "mind-the-costs",
            heading: "6. Mind the Costs and Know What You Hold",
            paragraphs: [
                "A fund's charges reduce the return you keep. Over 15 years, ₹10,000 a month is estimated at about ₹41,79,243 at an assumed 10% and about ₹38,12,438 at 9%. A difference of one percentage point is estimated to cost about ₹3,66,805, on the same ₹18,00,000 invested.",
                "Before you start, read what the fund holds, how risky its own documents say it is (the scheme's risk label) and what it charges, and make sure you understand what you are buying. Do not choose a fund only because it did well last year. A past return does not tell you the next one."
            ]
        },
        {
            id: "review-once-a-year",
            heading: "7. Review Once a Year",
            paragraphs: [
                "Checking a SIP every day invites decisions based on noise. Once a year, ask three questions: is the goal the same, can I raise the amount, and is the investment still what I thought it was? If the answers are yes, yes and yes, leave it alone.",
                "Change the plan when your life changes, not when the market does."
            ]
        }
    ],

    example: {
        heading: "Example: The Same ₹24,00,000, Invested Two Ways",
        paragraphs: [
            "Plan A invests ₹10,000 a month for 20 years. Plan B invests ₹20,000 a month for 10 years. Both put in ₹24,00,000.",
            "At an assumed 10% a year, Plan A is estimated at about ₹76,56,969 and Plan B at about ₹41,31,040. Plan A needed a smaller monthly amount and more years; Plan B needed twice the monthly amount for half the time and ended with roughly half as much.",
            "Neither figure is a forecast. Change the return in the SIP Calculator and the gap changes, but the direction does not."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "A good SIP strategy is mostly behaviour: a clear goal, an affordable amount, an early start, a rising instalment and the patience to stay. None of these needs a forecast, and none can promise a result."
    },

    considerations: [
        "Keep money you need soon out of market-linked investments.",
        "Keep an emergency fund apart from your SIP.",
        "Remember the return in every example is an assumption, not a forecast.",
        "Remember that taxes, charges and inflation are not in the projections.",
        "Remember that mutual fund investments are subject to market risk. This is information, not investment advice."
    ],

    faq: [
        {
            question: "How much should a beginner invest in a SIP?",
            answer: "Only an amount you can keep paying through a difficult month, after your essential expenses and an emergency fund. There is no single right amount. Start smaller if you need to and raise it as your income grows."
        },
        {
            question: "Is a SIP safe?",
            answer: "A SIP is a way of investing regularly, not a type of safety. The value of what you buy can rise and fall, and you can get back less than you put in. The risk depends on the investment, not on the SIP."
        },
        {
            question: "Should I stop my SIP when the market falls?",
            answer: "Stopping means you stop buying at the lower prices, and you do not take part in a recovery if one comes. That does not mean continuing is right for everyone: if you need the money soon or can no longer afford the payments, change the plan for that reason, not because of the headlines."
        },
        {
            question: "Is a longer SIP always better?",
            answer: "In the examples, more years gave a larger estimate for the same money invested, but only at an assumed constant return. The right length is the time until you need the money."
        },
        {
            question: "How were the figures calculated?",
            answer: "With the SIP Calculator, using a standard monthly model: each SIP is invested at the start of the month and the annual return is divided by 12. You can reproduce them by entering the same values."
        }
    ]

};

export default article;
