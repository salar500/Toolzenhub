/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title,
   description, dates, read time, images, category,
   related tools and articles) lives in data/articles.js.

   Article:
   How Much Does Compounding Frequency Change an FD's Maturity?

   Category:
   Investment

   Topic:
   FD

   Every figure below was worked out with the FD Calculator's
   model and checked against an independent reference
   (tests/fixtures/fd-golden.py, which simulates the deposit
   period by period): Rs 1,00,000 at a quoted 7% a year for 5
   years under four compounding choices, plus the same deposit
   at 7.4% compounded quarterly for scale. Arithmetic on the
   numbers entered, not a bank's quote.
========================================================= */


const article = {


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    introduction:
        "A fixed deposit quote usually names a rate and how often interest is added: monthly, quarterly, half-yearly or yearly. This guide takes one deposit and changes only that frequency, to show what it does to the maturity and to the effective annual yield. It is arithmetic on the numbers shown, not a view on which deposit to choose.",


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

        "Fixed Deposit",

        "Compounding",

        "Effective Annual Yield",

        "Maturity Amount"

    ],


    /* =====================================================
       KEY TAKEAWAYS
    ===================================================== */

    keyTakeaways: [

        "Compounding frequency is how often interest is added to the deposit, so that it earns interest itself. The quoted rate stays the same.",

        "₹1,00,000 at a quoted 7% a year for 5 years matures to ₹1,40,255.17 with yearly compounding, ₹1,41,059.88 half-yearly, ₹1,41,477.82 quarterly and ₹1,41,762.53 monthly.",

        "Monthly instead of yearly adds ₹1,507.35 here. A quoted rate 0.4 points higher (7.4% compounded quarterly) adds ₹2,807.01 over the 7% quarterly figure.",

        "The effective annual yield shows the same thing as a yearly rate: 7.0000% yearly, 7.1225% half-yearly, 7.1859% quarterly and 7.2290% monthly.",

        "Which frequency a deposit uses is set by the bank and the product, and a bank's own maturity can differ from these figures."

    ],


    /* =====================================================
       CALCULATOR RELATIONSHIP
    ===================================================== */

    calculator: {

        description:
            "Enter a deposit, a rate and a tenure, then switch the compounding between monthly, quarterly, half-yearly and yearly to see the maturity and the effective annual yield change."

    },


    /* =====================================================
       TABLE OF CONTENTS
    ===================================================== */

    tableOfContents: [

        {

            id:
                "what-compounding-means",

            label:
                "What Compounding Means"

        },


        {

            id:
                "one-deposit-four-frequencies",

            label:
                "One Deposit, Four Frequencies"

        },


        {

            id:
                "the-quoted-rate-and-the-yield",

            label:
                "The Quoted Rate and the Yield"

        },


        {

            id:
                "how-big-is-the-difference",

            label:
                "How Big Is the Difference?"

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
                "what-compounding-means",

            heading:
                "1. What Compounding Means",

            paragraphs: [

                "A fixed deposit earns interest at a quoted yearly rate. If the interest is added to the deposit from time to time, the added interest earns interest too. How often that happens is the compounding frequency.",

                "Yearly compounding adds interest once a year. Half-yearly adds it twice, quarterly four times and monthly twelve times. In each case the interest added is the quoted rate divided by the number of periods in the year, so the quoted rate is the same under all four."

            ]

        },


        {

            id:
                "one-deposit-four-frequencies",

            heading:
                "2. One Deposit, Four Frequencies",

            paragraphs: [

                "Take ₹1,00,000 at a quoted 7% a year for 5 years. With yearly compounding it matures to ₹1,40,255.17. With half-yearly compounding it matures to ₹1,41,059.88, with quarterly compounding to ₹1,41,477.82 and with monthly compounding to ₹1,41,762.53.",

                "Each step to a more frequent schedule adds a little less than the one before: ₹804.70 from yearly to half-yearly, ₹417.94 more to quarterly and ₹284.71 more to monthly."

            ]

        },


        {

            id:
                "the-quoted-rate-and-the-yield",

            heading:
                "3. The Quoted Rate and the Yield",

            paragraphs: [

                "The effective annual yield is what one year grows to under a given compounding. It turns the four schedules into comparable yearly rates: 7.0000% for yearly, 7.1225% for half-yearly, 7.1859% for quarterly and 7.2290% for monthly.",

                "It is not the quoted rate, which stays 7%, and it is not the growth over the whole 5 years, which is 40.26% for yearly compounding and 41.76% for monthly. With yearly compounding the yield equals the quoted rate."

            ]

        },


        {

            id:
                "how-big-is-the-difference",

            heading:
                "4. How Big Is the Difference?",

            paragraphs: [

                "Monthly instead of yearly compounding adds ₹1,507.35 on this deposit over 5 years. For scale, a quoted rate 0.4 points higher, 7.4% compounded quarterly, matures to ₹1,44,284.83, which is ₹2,807.01 more than 7% compounded quarterly.",

                "So the frequency matters, and it is usually smaller than a difference in the quoted rate. These figures hold for this deposit and these rates only."

            ]

        },


        {

            id:
                "what-this-does-not-tell-you",

            heading:
                "5. What This Does Not Tell You",

            paragraphs: [

                "Not every deposit offers every frequency, and the schedule is set by the bank and the product. A more frequent schedule is not a reason to choose a deposit: this article does not compare products or say which to take.",

                "The figures assume the rate stays the same and the interest stays in the deposit. A bank's own maturity can differ, because banks use their own compounding dates, day-count conventions and rounding. Tax and TDS, premature withdrawal, payout options and deposit insurance are not included."

            ]

        }

    ],


    /* =====================================================
       EXAMPLE
    ===================================================== */

    example: {

        heading:
            "Example: ₹1,00,000 at a Quoted 7% a Year for 5 Years",

        paragraphs: [

            "Yearly: ₹1,40,255.17, yield 7.0000%. Half-yearly: ₹1,41,059.88, yield 7.1225%. Quarterly: ₹1,41,477.82, yield 7.1859%. Monthly: ₹1,41,762.53, yield 7.2290%.",

            "Monthly instead of yearly adds ₹1,507.35. A quoted 7.4% compounded quarterly matures to ₹1,44,284.83, ₹2,807.01 more than 7% quarterly."

        ]

    },


    /* =====================================================
       BIGGER PICTURE
    ===================================================== */

    biggerPicture: {

        heading:
            "The Bigger Picture",

        text:
            "A quote is two numbers: the rate and how often it is compounded. Looking at the effective annual yield next to the maturity makes two quotes with different schedules comparable, without treating either number as the whole answer."

    },


    /* =====================================================
       THINGS TO CONSIDER
    ===================================================== */

    considerations: [

        "Read the rate and the compounding together.",

        "Use the effective annual yield to compare quotes with different schedules.",

        "Remember that the frequency is set by the bank and the product.",

        "Remember that tax, TDS and premature withdrawal are not in the figures."

    ],


    /* =====================================================
       FAQ
    ===================================================== */

    faq: [

        {

            question:
                "Does more frequent compounding change the quoted rate?",

            answer:
                "No. The quoted rate stays the same. More frequent compounding adds interest in smaller steps, so the interest earns interest sooner and the effective annual yield is slightly higher."

        },


        {

            question:
                "Is the effective annual yield the same as the total return?",

            answer:
                "No. The yield is what one year grows to. The total growth is for the whole tenure, and it is a different figure."

        },


        {

            question:
                "Will my bank's maturity match these figures?",

            answer:
                "Not necessarily. Banks use their own compounding dates, day-count conventions, rounding and product terms. These are calculations from the numbers shown, not a bank's quote."

        },


        {

            question:
                "How were the figures calculated?",

            answer:
                "With the FD Calculator, using a deposit of ₹1,00,000, a quoted rate of 7% a year, a tenure of 5 years and each compounding choice in turn. You can reproduce them by entering the same values."

        }

    ],


};



/* =========================================================
   EXPORT
========================================================= */

export default article;
