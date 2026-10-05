/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How to Find the Original Price Before a Percentage Change

   Category:
   Math

   Topic:
   Percentage

   Every figure below was worked out with the Percentage
   Calculator's model and checked against an independent
   reference (tests/fixtures/percentage-golden.py): 2,400 after
   a 20% increase came from 2,000 (not 1,920); 1,600 after a 20%
   decrease came from 2,000 (not 1,920); 118 after an 18%
   increase came from 100. Arithmetic on plain numbers; no
   money, tax or advice.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A number is now 2,400 after going up by 20%. What was it before? The tempting answer is to take 20% off 2,400, and it is wrong. This guide shows the method that works, why subtracting fails, and how to check the answer by going forward again.",


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

        "Reverse Percentage",

        "Original Value",

        "Percentage Increase",

        "Percentage Decrease"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "A value after a 20% increase is the original times 1.20. To go back, divide by 1.20, not subtract 20%.",

        "2,400 after a 20% increase came from 2,000. Subtracting 20% of 2,400 gives 1,920, which is not the original.",

        "For a decrease, divide by 1 minus the percentage: 1,600 after a 20% decrease came from 2,000, because 1,600 ÷ 0.80 is 2,000.",

        "The check is to go forward again: 2,000 raised by 20% is 2,400.",

        "This is arithmetic on plain numbers. Tax, fees and shop rounding are not included."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter the ending value and the percentage change, and leave the starting value empty. The starting value is worked out and shown in the result."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "the-wrong-turn",

            label:
                "The Wrong Turn"

        },


        {

            id:
                "the-method",

            label:
                "The Method"

        },


        {

            id:
                "a-decrease-works-the-same-way",

            label:
                "A Decrease Works the Same Way"

        },


        {

            id:
                "check-by-going-forward",

            label:
                "Check by Going Forward"

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
                "the-wrong-turn",

            heading:
                "1. The Wrong Turn",

            paragraphs: [

                "A value is 2,400 after a 20% increase. Twenty percent of 2,400 is 480, and 2,400 minus 480 is 1,920. It looks reasonable and it is wrong.",

                "The 20% increase was taken of the original value, not of 2,400. Taking 20% of the new value removes too much, so 1,920 is below the true original."

            ]

        },


        {

            id:
                "the-method",

            heading:
                "2. The Method",

            paragraphs: [

                "An increase of 20% multiplies the original by 1.20. So the original is the new value divided by 1.20: 2,400 ÷ 1.20 = 2,000.",

                "In general, original = new value × 100 ÷ (100 + percentage). With a percentage of 20 that is 2,400 × 100 ÷ 120 = 2,000.",

                "In the calculator, enter 2,400 as the ending value and 20 as the percentage change, and leave the starting value empty."

            ]

        },


        {

            id:
                "a-decrease-works-the-same-way",

            heading:
                "3. A Decrease Works the Same Way",

            paragraphs: [

                "A decrease of 20% multiplies the original by 0.80. A value of 1,600 after a 20% decrease therefore came from 1,600 ÷ 0.80 = 2,000.",

                "The wrong turn here is adding 20% of 1,600 back, which gives 1,920. Enter −20 as the percentage change in the calculator and the starting value is worked out as 2,000.00."

            ]

        },


        {

            id:
                "check-by-going-forward",

            heading:
                "4. Check by Going Forward",

            paragraphs: [

                "Raise the answer by the percentage and see whether you reach the number you started with. 2,000 raised by 20% is 2,400, so 2,000 is right. 1,920 raised by 20% is 2,304, so 1,920 is not.",

                "Another case: 118 after an 18% increase came from 118 × 100 ÷ 118 = 100, and 100 raised by 18% is 118."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "The method assumes the percentage was taken of the original value, and that nothing else was added. It does not include tax, fees or the rounding a shop or an invoice may apply, so a real price can differ from the exact figure by a little.",

                "If the numbers you have are already rounded, the working-back figure is only as exact as they are."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: 2,400 After a 20% Increase",

        paragraphs: [

            "New value 2,400, increase 20%. Original = 2,400 × 100 ÷ 120 = 2,000.00. Check: 2,000 raised by 20% is 2,400.",

            "Subtracting 20% of 2,400 would give 1,920, which raised by 20% is 2,304, not 2,400."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A percentage describes a relationship between two numbers, and it is taken of one of them. To work backwards you have to undo the multiplication that was done going forward, which is why you divide."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Divide by 1 plus the percentage for an increase and by 1 minus the percentage for a decrease.",

        "Check the answer by going forward again.",

        "Do not take the percentage of the new value to find the original.",

        "Remember that rounded prices make the working-back figure approximate."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Why can't I just subtract the percentage?",

            answer:
                "Because the percentage was taken of the original, not of the new value. Subtracting a percentage of the new value removes a different amount from the one that was added."

        },


        {

            question:
                "How do I find the original after a decrease?",

            answer:
                "Divide the new value by 1 minus the percentage, written as a fraction. For a 20% decrease, divide by 0.80."

        },


        {

            question:
                "Can I use this to take tax out of a price?",

            answer:
                "The arithmetic is the same shape as removing a percentage, but tax has its own rules and rounding. The GST Calculator is built for that; this one works with plain numbers."

        },


        {

            question:
                "How do I try this in the calculator?",

            answer:
                "Fill in the ending value and the percentage change, leave the starting value empty, and the starting value is worked out in the result. The empty field is never filled in for you."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
