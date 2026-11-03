/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title, description, dates, read time, related tools and
   articles) lives in data/articles.js.

   Article:
   ROI vs Profit: What's the Difference?

   Category:
   Business

   Every figure below was worked out by hand and checked against the ROI Calculator's model:
   50,000 to 65,000 is a profit of 15,000 and an ROI of 30%; 30% over 3 years is (1.3)^(1/3) - 1, about 9.14% a year;
   10,000 earning 2,000 is 20% and 1,00,000 earning 5,000 is 5%; goods sold for 1,20,000 that cost 90,000 give a profit
   of 30,000, a margin of 25% of the selling price and an ROI of 33.33% on the cost.
   Plain numbers only: no tax, fee or real rate.
========================================================= */


const article = {

    introduction:
        "Profit tells you how much money you made. Return on investment, or ROI, tells you how much you made compared with what you put in. They answer different questions, and mixing them up is a common reason a good-looking result turns out to be a poor one.",

    author: { name: "ToolZen Hub", type: "Organization", role: "Calculator Guides" },

    tags: ["ROI", "Profit", "Return on Investment", "Business Metrics"],

    keyTakeaways: [
        "Profit is an amount of money: what you ended up with minus what you put in.",
        "ROI is profit divided by the amount invested, shown as a percentage, so it compares results of different sizes.",
        "A larger profit does not mean a better ROI: 5,000 earned on 1,00,000 is a 5% ROI, while 2,000 earned on 10,000 is 20%.",
        "ROI ignores time unless you add it: 30% over 3 years is about 9.14% a year, not 10%.",
        "ROI and profit margin use different bases: ROI divides by what you invested, margin divides by what you sold for."
    ],

    calculator: {
        description:
            "Enter 50,000 as the amount invested and 65,000 as the final value, and add 3 years, to see a 30% return and about 9.14% a year."
    },

    tableOfContents: [
        { id: "profit-is-an-amount", label: "Profit Is an Amount" },
        { id: "roi-is-a-ratio", label: "ROI Is a Ratio" },
        { id: "why-the-bigger-profit-can-be-the-weaker-return", label: "Why the Bigger Profit Can Be the Weaker Return" },
        { id: "roi-and-time", label: "ROI and Time" },
        { id: "roi-and-profit-margin", label: "ROI and Profit Margin" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "profit-is-an-amount",
            heading: "1. Profit Is an Amount",
            paragraphs: [
                "Profit is what you finished with minus what you put in. If you invest 50,000 and it is worth 65,000 later, the profit is 65,000 − 50,000 = 15,000. If it is worth 45,000, the result is a loss of 5,000.",
                "Profit is useful because it is real money, but on its own it does not say whether the result was good. 15,000 is a large result on 50,000 and a small one on 50,00,000."
            ]
        },
        {
            id: "roi-is-a-ratio",
            heading: "2. ROI Is a Ratio",
            paragraphs: [
                "ROI divides the profit by the amount invested and shows it as a percentage: ROI = (final value − amount invested) ÷ amount invested × 100. For the example above, 15,000 ÷ 50,000 = 0.30, so the ROI is 30%.",
                "Because it is a percentage, ROI lets you compare results of different sizes. A loss gives a negative ROI: a final value of 45,000 on 50,000 is −5,000 ÷ 50,000, or −10%."
            ]
        },
        {
            id: "why-the-bigger-profit-can-be-the-weaker-return",
            heading: "3. Why the Bigger Profit Can Be the Weaker Return",
            paragraphs: [
                "Take two projects. Project A puts in 10,000 and earns 2,000, an ROI of 20%. Project B puts in 1,00,000 and earns 5,000, an ROI of 5%.",
                "Project B has the larger profit and Project A has the better return on the money used. Which matters more depends on what else the money could have done: if the extra 90,000 could have earned more elsewhere, the smaller profit on a smaller amount may be the better choice."
            ]
        },
        {
            id: "roi-and-time",
            heading: "4. ROI and Time",
            paragraphs: [
                "A basic ROI does not say how long it took. 30% in one year is a much better result than 30% in three years.",
                "To compare, turn the ROI into a yearly rate. The amount grew by a factor of 1.3 over 3 years, so the yearly rate is 1.3 to the power of 1/3, minus 1: about 9.14% a year. It is not 10%, because each year's growth builds on the last.",
                "The yearly rate is an average. The real path may have gone up and down on the way."
            ]
        },
        {
            id: "roi-and-profit-margin",
            heading: "5. ROI and Profit Margin",
            paragraphs: [
                "Profit margin is profit divided by the selling price. ROI is profit divided by what you invested. They use the same profit with different bases.",
                "Suppose goods that cost 90,000 are sold for 1,20,000. The profit is 30,000. The margin is 30,000 ÷ 1,20,000 = 25% of the selling price. The ROI on the 90,000 spent is 30,000 ÷ 90,000 = 33.33%.",
                "Neither is wrong; they answer different questions. Say which one you mean before comparing numbers."
            ]
        }
    ],

    example: {
        heading: "Example: Two Ways to Describe the Same Result",
        paragraphs: [
            "You invest 50,000 and, three years later, it is worth 65,000. The profit is 15,000, the ROI is 30%, and the average yearly rate is about 9.14%.",
            "Each number is correct. The profit says how much, the ROI says how much for each unit invested, and the yearly rate says how fast."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "Profit, ROI, margin and a yearly rate are four views of the same result. A good comparison names what is divided by what, and over what time. These figures are arithmetic on the numbers you give them: they do not include tax, fees or inflation unless you put those into the amounts, and they say nothing about risk."
    },

    considerations: [
        "Count every cost you want included in the amount invested.",
        "Compare ROI over the same period, or turn each into a yearly rate.",
        "A high ROI on a small amount is not the same as a large profit.",
        "ROI says nothing about risk."
    ],

    faq: [
        {
            question: "Is ROI the same as profit?",
            answer: "No. Profit is an amount of money. ROI is the profit divided by the amount invested, shown as a percentage."
        },
        {
            question: "Can ROI be negative?",
            answer: "Yes. If the final value is less than the amount invested, the profit is negative and so is the ROI."
        },
        {
            question: "What is a good ROI?",
            answer: "There is no single answer. It depends on how long the money was tied up, how risky it was and what else the money could have done, so a result is best compared with the alternatives rather than judged alone."
        },
        {
            question: "Why is 30% over 3 years not 10% a year?",
            answer: "Because growth compounds. Each year grows from the previous year's total, so the average yearly rate that gives 30% in three years is about 9.14%."
        },
        {
            question: "What does the ROI Calculator do that this guide does not?",
            answer: "It does the arithmetic for you: enter the amount invested and the final value, add the years if you like, and it shows the ROI, the profit or loss and the yearly rate."
        }
    ]

};

export default article;
