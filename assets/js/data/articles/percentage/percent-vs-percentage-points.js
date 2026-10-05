/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Percent vs Percentage Points

   Category:
   Math

   Topic:
   Percentage

   Every figure below was worked out with the Percentage
   Calculator's model and checked against an independent
   reference (tests/fixtures/percentage-golden.py): a rate
   moving from 5 to 7 is 2 percentage points and a 40.00%
   increase; 12 to 9 is 3 percentage points and a 25.00%
   decrease. Educational: percentage points are not a
   calculator mode. No real rates or indexes are named.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A rate goes from 5% to 7%. Is that up 2% or up 40%? Both statements are true, and they mean different things. This guide separates a change in percentage points from a change in percent, so you can tell which one a figure is talking about.",


    /* =====================================================
       AUTHOR
    ===================================================== */

    author: {

        name:
            "ToolZen Hub",

        type:
            "Organization",

        role:
            "Calculator Guides"

    },


    /* =====================================================
       TAGS
    ===================================================== */

    tags: [

        "Percentage Points",

        "Percentage Change",

        "Rates",

        "Base Value"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Percentage points are the plain difference between two percentages: 7% minus 5% is 2 percentage points.",

        "A percent change is that difference measured against the starting percentage: 2 out of 5 is 40.00%.",

        "So a rate from 5% to 7% is up 2 percentage points and up 40.00%. Both are correct and they answer different questions.",

        "A rate from 12% to 9% is down 3 percentage points and down 25.00%.",

        "The Percentage Calculator works with the percent change. Percentage points are simply the subtraction, and the calculator has no mode for them."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter 5 as the starting value and 7 as the ending value, and leave the percentage change empty, to see the percent change between the two rates."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "two-ways-to-describe-one-move",

            label:
                "Two Ways to Describe One Move"

        },


        {

            id:
                "percentage-points-the-difference",

            label:
                "Percentage Points: The Difference"

        },


        {

            id:
                "percent-the-relative-change",

            label:
                "Percent: The Relative Change"

        },


        {

            id:
                "a-fall-works-the-same-way",

            label:
                "A Fall Works the Same Way"

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
                "two-ways-to-describe-one-move",

            heading:
                "1. Two Ways to Describe One Move",

            paragraphs: [

                "Suppose a rate moves from 5% to 7%. One description says it rose by 2. Another says it rose by 40%. They are not in conflict; they use different bases.",

                "The first compares the two percentages directly. The second compares the move with where the rate started."

            ]

        },


        {

            id:
                "percentage-points-the-difference",

            heading:
                "2. Percentage Points: The Difference",

            paragraphs: [

                "A percentage point is one unit on the percentage scale. Going from 5% to 7% is a difference of 7 − 5 = 2 percentage points.",

                "Percentage points are just subtraction. They say how far apart two percentages are without saying how large that gap is compared with either of them."

            ]

        },


        {

            id:
                "percent-the-relative-change",

            heading:
                "3. Percent: The Relative Change",

            paragraphs: [

                "The percent change measures that gap against the starting rate. The gap is 2 and the start is 5, so the change is 2 ÷ 5 = 40.00%.",

                "In the Percentage Calculator, enter 5 as the starting value and 7 as the ending value, and leave the percentage change empty. It is worked out as +40.00%."

            ]

        },


        {

            id:
                "a-fall-works-the-same-way",

            heading:
                "4. A Fall Works the Same Way",

            paragraphs: [

                "A rate from 12% to 9% is down 3 percentage points, because 12 − 9 = 3. As a percent change it is down 3 ÷ 12 = 25.00%.",

                "The two figures are always different unless the starting rate is 100%, because the percent change divides the point change by the starting rate."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "Neither figure says whether a change is large or small in practice, or why it happened. A move of 2 percentage points can matter a lot or very little depending on what the rate measures.",

                "This article uses plain numbers and does not refer to any real rate, index or measurement."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: 5% to 7%, and 12% to 9%",

        paragraphs: [

            "From 5% to 7%: 2 percentage points up, 40.00% up as a percent change.",

            "From 12% to 9%: 3 percentage points down, 25.00% down as a percent change."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "When a figure about a percentage changes, check which one is being reported: the gap in points, or the percent change measured against the start. The words \"up 2%\" on their own do not say."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Look for the words \"percentage points\" when two percentages are subtracted.",

        "Remember that a percent change needs a starting value to be measured against.",

        "Do not mix the two when comparing figures from different sources.",

        "State both when you report a change, if the difference could be misread."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Is a percentage point the same as a percent?",

            answer:
                "No. A percentage point is the plain difference between two percentages. A percent change is that difference divided by the starting percentage."

        },


        {

            question:
                "Why are the two numbers different?",

            answer:
                "Because they use different bases. The point change is a subtraction; the percent change measures the subtraction against the starting rate."

        },


        {

            question:
                "Does the Percentage Calculator work in percentage points?",

            answer:
                "No. It works with the percent change. You can use it to find the percent change between two rates by entering them as the starting and ending values; the percentage points are the plain difference you can subtract yourself."

        },


        {

            question:
                "When are they the same number?",

            answer:
                "Only when the starting rate is 100%, since the percent change divides the point change by the starting rate."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
