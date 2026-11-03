/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title, description, dates, read time, related tools and
   articles) lives in data/articles.js.

   Article:
   How to Calculate Your Daily Calorie Needs

   Category:
   Health

   Method and sources (no medical claim beyond them): the Mifflin-St Jeor equation (Mifflin MD, St Jeor ST et al.,
   Am J Clin Nutr 1990;51(2):241-247), and the conventional activity multipliers 1.2, 1.375, 1.55, 1.725 and 1.9, whose
   wording differs between sources. Every figure below was worked out by hand and checked against the BMR and Calorie
   calculators' model: a 30-year-old man of 80 kg and 180 cm has 10 x 80 + 6.25 x 180 - 5 x 30 + 5 = 1,780 kcal, and
   1,780 x 1.55 = 2,759 kcal; a 30-year-old woman of 60 kg and 165 cm has 600 + 1,031.25 - 150 - 161 = 1,320.25 kcal.
   It gives no weight-loss or weight-gain target.
========================================================= */


const article = {

    introduction:
        "The energy your body uses in a day depends on how much of it goes on simply staying alive and how much on moving. This guide shows how that estimate is built from your age, sex, weight, height and activity, and what it can and cannot tell you.",

    author: { name: "ToolZen Hub", type: "Organization", role: "Calculator Guides" },

    tags: ["Calories", "BMR", "Daily Energy", "Mifflin-St Jeor"],

    keyTakeaways: [
        "Your basal metabolic rate (BMR) is the energy your body uses at complete rest.",
        "The Mifflin-St Jeor equation estimates BMR from weight, height, age and sex: 10 × kg + 6.25 × cm − 5 × age, then + 5 for men or − 161 for women.",
        "Multiplying BMR by an activity factor (1.2 to 1.9) estimates the energy used in a normal day.",
        "It is an estimate for healthy adults, not a measurement, and not a diet target.",
        "Ask a doctor or a registered dietitian before changing how much you eat."
    ],

    calculator: {
        description:
            "Choose male, enter 30 for age, 80 for weight and 180 for height, and pick moderate exercise, to see about 2,759 kilocalories a day."
    },

    tableOfContents: [
        { id: "two-parts-resting-and-moving", label: "Two Parts: Resting and Moving" },
        { id: "the-mifflin-st-jeor-equation", label: "The Mifflin-St Jeor Equation" },
        { id: "adding-activity", label: "Adding Activity" },
        { id: "what-the-number-is-not", label: "What the Number Is Not" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "two-parts-resting-and-moving",
            heading: "1. Two Parts: Resting and Moving",
            paragraphs: [
                "Most of the energy you use in a day goes on keeping the body running: breathing, circulation, temperature and the work of cells. The amount used at complete rest is the basal metabolic rate, or BMR.",
                "The rest is the energy of moving, from walking to a workout, plus the energy of digesting food. An estimate of the whole day starts from BMR and adds an allowance for activity."
            ]
        },
        {
            id: "the-mifflin-st-jeor-equation",
            heading: "2. The Mifflin-St Jeor Equation",
            paragraphs: [
                "One widely used formula for BMR comes from a 1990 study by Mifflin, St Jeor and colleagues. In kilocalories a day: 10 × weight in kg + 6.25 × height in cm − 5 × age in years, then add 5 for a man or subtract 161 for a woman.",
                "For a 30-year-old man of 80 kg and 180 cm: 10 × 80 = 800, 6.25 × 180 = 1,125, 5 × 30 = 150, so 800 + 1,125 − 150 + 5 = 1,780 kilocalories.",
                "For a 30-year-old woman of 60 kg and 165 cm: 600 + 1,031.25 − 150 − 161 = 1,320.25, about 1,320 kilocalories."
            ]
        },
        {
            id: "adding-activity",
            heading: "3. Adding Activity",
            paragraphs: [
                "To estimate a whole day, BMR is multiplied by an activity factor. The usual factors are 1.2 for little or no exercise, 1.375 for light exercise, 1.55 for moderate exercise, 1.725 for hard exercise and 1.9 for very hard exercise or a physical job.",
                "For the man above with moderate exercise: 1,780 × 1.55 = 2,759 kilocalories a day. With little exercise it would be 1,780 × 1.2 = 2,136.",
                "These factors are conventions, and sources describe the levels in slightly different words. People also tend to overestimate how active they are, so if you are unsure, the lower factor is the safer pick."
            ]
        },
        {
            id: "what-the-number-is-not",
            heading: "4. What the Number Is Not",
            paragraphs: [
                "The result is an estimate for healthy adults. Your real energy use can differ by a good margin because of body composition, health, medicines, age and more.",
                "It is not a diet target. It does not say how much you should eat to gain or lose weight, and it is not meant for pregnancy, breastfeeding, children or people with medical conditions that change energy needs. A doctor or a registered dietitian can advise on those."
            ]
        }
    ],

    example: {
        heading: "Example: From BMR to a Whole Day",
        paragraphs: [
            "A 30-year-old man of 80 kg and 180 cm has a BMR of 1,780 kilocalories. If he exercises moderately, 1,780 × 1.55 = 2,759 kilocalories is an estimate of the energy his body uses in a day.",
            "In kilojoules, multiply by 4.184: 2,759 × 4.184 is about 11,544 kilojoules."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "Formulas like this give a reasonable starting point for a group of people and a rough one for any individual. Treat the number as a rough guide, not a rule, and pair it with advice from a professional if the decision matters for your health."
    },

    considerations: [
        "Use your real weight and height, in kilograms and centimetres.",
        "Pick the activity level that fits a normal week, and choose lower if unsure.",
        "Treat the result as an estimate, not a measurement or a target.",
        "Ask a doctor or a registered dietitian before changing how much you eat."
    ],

    faq: [
        {
            question: "What is BMR?",
            answer: "Basal metabolic rate is the energy your body uses at complete rest in a day, for breathing, circulation and keeping the body running."
        },
        {
            question: "Is this how many calories I should eat?",
            answer: "No. It estimates the energy your body uses. How much you should eat depends on your health and goals; ask a doctor or a registered dietitian."
        },
        {
            question: "Which activity level should I choose?",
            answer: "The one closest to a normal week. People often overestimate their activity, so if you are unsure, choose the lower level."
        },
        {
            question: "Why does the formula ask for sex?",
            answer: "The equation has a different constant for men and women. Nothing you enter is stored."
        },
        {
            question: "Which calculators does this guide go with?",
            answer: "The BMR Calculator gives the resting figure and the Calorie Calculator multiplies it by an activity level."
        }
    ]

};

export default article;
