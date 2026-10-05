/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   Why +20% Then −20% Doesn't Get You Back

   Category:
   Math

   Topic:
   Percentage

   Every figure below was worked out with the Percentage
   Calculator's model and checked against an independent
   reference (tests/fixtures/percentage-golden.py): 100 raised
   by 20% is 120; a 20% fall of 120 is 24, giving 96; the net
   change is −4.00% and the change that undoes +20% is −16.67%.
   Arithmetic on plain numbers; no money, tax or advice.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "Raise a number by 20%, then lower the result by 20%, and it does not come back to where it began. The two 20%s sound like opposites, but each is taken of a different number. This guide works one example step by step to show why, and what percentage does take the number back.",


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

        "Percentage",

        "Percentage Change",

        "Base Value",

        "Reverse Percentage"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "A percentage always refers to a particular number, its base. A 20% rise is 20% of the starting value; a 20% fall afterwards is 20% of the new, larger value.",

        "100 raised by 20% is 120. A 20% fall of 120 takes off 24, leaving 96, which is 4.00% below the 100 it began at.",

        "Adding the two percentages gives 0%, but that is not the combined change. The net change here is −4.00%.",

        "The change that does take 120 back to 100 is a fall of 16.67%, because it is taken of the larger value.",

        "This is arithmetic on plain numbers. It does not include tax, fees or any rounding a shop applies."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a starting value and a percentage change, then add a second change under Then Another Change to see the value after both, the net change and the plain sum of the two percentages."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-question",

            label:
                "The Question"

        },


        {

            id:
                "the-first-20-percent",

            label:
                "The First 20%"

        },


        {

            id:
                "the-second-20-percent",

            label:
                "The Second 20%"

        },


        {

            id:
                "which-percentage-takes-it-back",

            label:
                "Which Percentage Takes It Back"

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
                "the-question",

            heading:
                "1. The Question",

            paragraphs: [

                "Start with 100. Raise it by 20%. Then lower the result by 20%. It is tempting to say the two cancel and you are back at 100.",

                "They do not. The reason is in the words \"of what\": every percentage is a share of some number, and the two 20%s are shares of different numbers."

            ]

        },


        {

            id:
                "the-first-20-percent",

            heading:
                "2. The First 20%",

            paragraphs: [

                "The first 20% is taken of the starting value, 100. Twenty percent of 100 is 20, so the value becomes 120.",

                "In the calculator, enter 100 as the starting value and 20 as the percentage change, and leave the ending value empty. The ending value is worked out as 120.00."

            ]

        },


        {

            id:
                "the-second-20-percent",

            heading:
                "3. The Second 20%",

            paragraphs: [

                "The second 20% is taken of the value now in front of you, 120, not of the original 100. Twenty percent of 120 is 24, so taking it off leaves 96.",

                "The value ended 4 below where it began, which is a net change of −4.00% from the starting value. Adding the two percentages gives 0%, but that sum is not the combined change, because the two percentages have different bases."

            ]

        },


        {

            id:
                "which-percentage-takes-it-back",

            heading:
                "4. Which Percentage Takes It Back",

            paragraphs: [

                "To get from 120 back to 100 the value must fall by 20, and 20 is 16.67% of 120. So the change that undoes a 20% rise is a fall of about 16.67%, not 20%.",

                "The same holds the other way: a 20% fall is undone by a rise of 25%, because the 20 that was taken off is 25% of the smaller value left. The calculator shows this as the change that undoes it, for any percentage you enter."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The calculation is arithmetic on plain numbers. It does not include tax, fees, or the rounding a shop or an invoice may apply, which can make a real price differ from the exact figure.",

                "It also says nothing about whether a rise or a fall is large or small for a particular price or measurement. It only describes how the numbers relate."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: 100 Up 20%, Then Down 20%",

        paragraphs: [

            "Start 100. After a 20% rise: 120. After a 20% fall of 120: 96. Net change from the start: −4.00%. Adding the two percentages: 0%, which is not the combined change.",

            "The change that takes 120 back to 100 is −16.67%. The change that takes 96 back to 120 is +25.00%."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "Whenever two percentages are applied one after the other, ask which number each one is taken of. Once the base changes, the percentages stop adding up the way their sizes suggest."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Ask \"percent of what?\" before comparing two percentages.",

        "Do not add or subtract percentages that have different bases.",

        "To reverse a change, work out the percentage from the new value, not the old one.",

        "Remember that real prices may be rounded or include tax that this arithmetic leaves out."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why does a 20% rise followed by a 20% fall leave a lower number?",

            answer:
                "Because the fall is taken of the larger value after the rise. Twenty percent of 120 is 24, which is more than the 20 that was added, so the value ends at 96."

        },


        {

            question:
                "What percentage undoes a 20% increase?",

            answer:
                "A fall of about 16.67%. The 20 that was added is 16.67% of the new value, 120."

        },


        {

            question:
                "Does the order of two changes matter?",

            answer:
                "Not for the final value when both are percentages of the current value: a 20% rise then a 20% fall and a 20% fall then a 20% rise both end at 96. The values in between differ."

        },


        {

            question:
                "How do I try this in the calculator?",

            answer:
                "Enter a starting value of 100 and a change of 20, leave the ending value empty, and then enter -20 under Then Another Change. The result shows the value after both, the net change and the plain sum of the two percentages."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
