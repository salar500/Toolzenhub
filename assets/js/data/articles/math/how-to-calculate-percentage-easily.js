/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How to Calculate Percentage Easily

   Category:
   Math

   Topic:
   Math (the key was reserved when the article was a
   placeholder, so the address is kept)

   Every figure below was worked out by hand and checked
   against the Percentage Calculator's model:
   15% of 240 is 36; 45 is 25% of 180; 2,000 up 12% is 2,240
   and down 12% is 1,760; 80 to 100 is +25.00% and 100 back to 80
   is -20.00%. Plain numbers only: no tax, fee or real rate.
========================================================= */


const article = {

    introduction:
        "Most percentage questions are one of four: what is a percentage of a number, what percentage one number is of another, what a number becomes after a rise or a fall, and how much something changed in percent. They all come from one idea, and once you see it you can do the common cases in your head.",

    author: {

        name:
            "ToolZen Hub",

        type:
            "Organization",

        role:
            "Calculator Guides"

    },

    tags: [

        "Percentage",
        "Percentage Change",
        "Mental Maths",
        "Everyday Maths"

    ],

    keyTakeaways: [

        "Percent means per hundred: 15% is 15 out of every 100, or 0.15.",

        "A percentage of a number is the number times the percentage divided by 100: 15% of 240 is 240 × 15 ÷ 100 = 36.",

        "To find what percentage one number is of another, divide and multiply by 100: 45 is 45 ÷ 180 × 100 = 25% of 180.",

        "A rise or fall multiplies by 1 plus or minus the percentage: 2,000 up 12% is 2,000 × 1.12 = 2,240.",

        "A percentage change is the difference divided by the starting value, so 80 to 100 is +25.00%, but 100 back to 80 is −20.00%."

    ],

    calculator: {

        description:
            "Enter 80 as the starting value and 100 as the ending value, and leave the percentage change empty, to see the change worked out as +25.00%."

    },

    tableOfContents: [

        { id: "one-idea-per-hundred", label: "One Idea: Per Hundred" },
        { id: "a-percentage-of-a-number", label: "A Percentage of a Number" },
        { id: "what-percentage-is-one-number-of-another", label: "What Percentage One Number Is of Another" },
        { id: "a-rise-or-a-fall", label: "A Rise or a Fall" },
        { id: "percentage-change-between-two-values", label: "Percentage Change Between Two Values" },
        { id: "quick-ways-to-do-it-in-your-head", label: "Quick Ways to Do It in Your Head" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }

    ],

    sections: [

        {

            id: "one-idea-per-hundred",

            heading: "1. One Idea: Per Hundred",

            paragraphs: [

                "The word percent comes from \"per hundred\". 15% means 15 out of every 100, which is the fraction 15/100 or the decimal 0.15.",

                "Every percentage calculation turns the percentage into that decimal and then multiplies or divides. The rest of this guide is four ways of doing that."

            ]

        },

        {

            id: "a-percentage-of-a-number",

            heading: "2. A Percentage of a Number",

            paragraphs: [

                "To find 15% of 240, multiply 240 by 0.15, which is 36. The same thing written as steps: 240 × 15 = 3,600, then ÷ 100 = 36.",

                "The order does not matter, because multiplication can be done either way round. 15% of 240 is the same as 240% of 15, which is a handy fact when one of the numbers is easier to work with."

            ]

        },

        {

            id: "what-percentage-is-one-number-of-another",

            heading: "3. What Percentage One Number Is of Another",

            paragraphs: [

                "To find what percentage 45 is of 180, divide the part by the whole and multiply by 100: 45 ÷ 180 = 0.25, and 0.25 × 100 = 25. So 45 is 25% of 180.",

                "Keep the whole on the bottom. Dividing the other way round, 180 ÷ 45 = 4, gives 400%, which answers a different question: how many times larger the whole is."

            ]

        },

        {

            id: "a-rise-or-a-fall",

            heading: "4. A Rise or a Fall",

            paragraphs: [

                "To increase a number by a percentage, multiply by 1 plus the percentage as a decimal. 2,000 up 12% is 2,000 × 1.12 = 2,240.",

                "To decrease it, multiply by 1 minus the percentage. 2,000 down 12% is 2,000 × 0.88 = 1,760.",

                "To go the other way, from the result back to the start, divide by the same multiplier rather than subtracting the percentage: 2,240 ÷ 1.12 = 2,000. The guide on finding the original price before a percentage change shows why subtraction gives the wrong answer."

            ]

        },

        {

            id: "percentage-change-between-two-values",

            heading: "5. Percentage Change Between Two Values",

            paragraphs: [

                "To find how much a value changed in percent, take the difference, divide by the starting value and multiply by 100. From 80 to 100 the difference is 20, and 20 ÷ 80 = 0.25, so the change is +25.00%.",

                "Going back from 100 to 80 the difference is 20 again, but the starting value is now 100, so 20 ÷ 100 = 0.20 and the change is −20.00%. The same gap is a different percentage because the base is different.",

                "That is also why a rise of 20% followed by a fall of 20% does not return you to the start. A separate guide works that example through."

            ]

        },

        {

            id: "quick-ways-to-do-it-in-your-head",

            heading: "6. Quick Ways to Do It in Your Head",

            paragraphs: [

                "Move the decimal point to find 10%: 10% of 240 is 24. Half of that is 5%, which is 12. So 15% of 240 is 24 + 12 = 36, the same answer as before.",

                "Find 1% by dividing by 100 and scale up: 1% of 240 is 2.4, so 7% is 7 × 2.4 = 16.8.",

                "For 50% halve the number, for 25% halve it twice, and for 20% find 10% and double it. These cover most everyday cases such as a tip, a discount or a share of a bill."

            ]

        }

    ],

    example: {

        heading:
            "Example: A 15% Discount on 240",

        paragraphs: [

            "15% of 240 is 36, so the discount is 36 and the price after it is 240 − 36 = 204. The same result comes from multiplying by 0.85: 240 × 0.85 = 204.",

            "Check it by going back: 204 ÷ 0.85 = 240."

        ]

    },

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A percentage is always a share of something, so the first question is of what. A percentage of the starting value, of the new value or of a total can give very different numbers, and most mistakes come from using the wrong base. Name the base before you calculate."

    },

    considerations: [

        "Say what the percentage is of before you calculate.",

        "Convert to a decimal first: divide by 100.",

        "Divide, rather than subtract, to undo a rise or a fall.",

        "A percentage change needs a starting value, and swapping the two values changes the answer."

    ],

    faq: [

        {

            question:
                "How do I turn a percentage into a decimal?",

            answer:
                "Divide by 100, which moves the decimal point two places to the left. 15% is 0.15 and 7.5% is 0.075."

        },

        {

            question:
                "Is 15% of 240 the same as 240% of 15?",

            answer:
                "Yes. Both are 36, because the calculation is the same multiplication in a different order."

        },

        {

            question:
                "Why is going from 80 to 100 a 25% rise but 100 to 80 only a 20% fall?",

            answer:
                "Both changes are 20, but a percentage change is measured against the starting value. 20 is a quarter of 80 and a fifth of 100."

        },

        {

            question:
                "What does the Percentage Calculator do that this guide does not?",

            answer:
                "It does the arithmetic for you: fill in any two of the starting value, the percentage change and the ending value, and it works out the third, shows the change that undoes it and the effect of a second change."

        }

    ]

};

export default article;
