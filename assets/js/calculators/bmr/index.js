/* BMR Calculator (Health). The page is drawn by common/simple-calculator.js; the arithmetic (Mifflin-St Jeor) is in
   formulas/body.js. An estimate of resting energy use, not a calorie target. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveBmr, SEX } from "../formulas/body.js";

const calculator = createSimpleCalculator({
    prefix: "bmr",
    toolId: "bmr",
    eyebrow: "Health Tool",
    intro: "Estimate your basal metabolic rate: the energy your body uses at complete rest in a day, from the Mifflin-St Jeor equation.",
    sectionTitle: "Enter Your Details",
    sectionText: "Use kilograms and centimetres (1 inch is 2.54 cm). Results update as you type.",
    emptyMessage: "Choose male or female and enter your age, weight and height to see your BMR.",
    footnote: "An estimate, not medical advice or a calorie target.",
    fields: [
        { key: "sex", label: "Sex", kind: "select", value: "", options: SEX, hint: "The formula has a different constant for each. It is the only reason this is asked." },
        { key: "age", label: "Age", unit: "years", hint: "In whole years, from 15 to 100." },
        { key: "weight", label: "Weight", unit: "kg", hint: "Your weight in kilograms, from 20 to 300." },
        { key: "height", label: "Height", unit: "cm", hint: "Your height in centimetres, from 100 to 250." }
    ],
    solve: solveBmr,
    howTo: [
        "Choose male or female, and enter your age in whole years.",
        "Enter your weight in kilograms and your height in centimetres.",
        "Read your BMR in kilocalories (and kilojoules) a day.",
        "To estimate the energy you use in a normal day, use the Calorie Calculator, which multiplies BMR by an activity level."
    ],
    reading: [
        "<strong>The Mifflin-St Jeor equation</strong> (Mifflin and St Jeor and colleagues, American Journal of Clinical Nutrition, 1990) gives BMR in kilocalories a day as 10 x weight (kg) + 6.25 x height (cm) - 5 x age (years), then + 5 for men or - 161 for women.",
        "<strong>BMR</strong> is the energy for breathing, circulation and keeping the body running at complete rest. It is not the energy you use in a real day, which is higher.",
        "One kilocalorie is 4.184 kilojoules."
    ],
    example: {
        values: { sex: "male", age: "30", weight: "80", height: "180" },
        text: "A 30-year-old man of 80 kg and 180 cm: 10 x 80 + 6.25 x 180 - 5 x 30 + 5 = 800 + 1,125 - 150 + 5 = 1,780 kilocalories a day."
    },
    assumptions: [
        "An equation fitted to groups of healthy adults. An individual's real resting energy use can differ by a good margin.",
        "Not meant for pregnancy or breastfeeding, or for people with medical conditions that change metabolism.",
        "The result is not a calorie target. Talk to a doctor or a registered dietitian about eating and weight goals.",
        "Source: Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr 1990;51(2):241-247.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Is BMR the same as the calories I should eat?", a: "No. It is the energy used at rest. What you need to eat depends on activity, health, goals and more." },
        { q: "Why is sex asked?", a: "The equation uses a different constant for men and women. Nothing is stored." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
