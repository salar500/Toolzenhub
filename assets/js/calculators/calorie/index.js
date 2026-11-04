/* Calorie Calculator (Health). The page is drawn by common/simple-calculator.js; the arithmetic is in
   formulas/body.js: Mifflin-St Jeor BMR times a conventional activity multiplier. Maintenance only: it gives no
   weight-loss or weight-gain target. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveCalorie, SEX, ACTIVITY } from "../formulas/body.js";

const calculator = createSimpleCalculator({
    prefix: "cal",
    toolId: "calorie",
    eyebrow: "Health Tool",
    intro: "Estimate how many kilocalories your body uses in a day, from your basal metabolic rate and how active you are.",
    sectionTitle: "Enter Your Details",
    sectionText: "Use kilograms and centimetres (1 inch is 2.54 cm). Results update as you type.",
    emptyMessage: "Choose male or female, enter your age, weight and height, and pick an activity level.",
    footnote: "An estimate, not medical advice or a diet target.",
    fields: [
        { key: "sex", label: "Sex", kind: "select", value: "", options: SEX, hint: "The formula has a different constant for each." },
        { key: "age", label: "Age", unit: "years", hint: "In whole years, from 15 to 100.", slider: { min: 15, max: 100, step: 1 } },
        { key: "weight", label: "Weight", unit: "kg", hint: "Your weight in kilograms, from 20 to 300.", slider: { min: 20, max: 300, step: 1 } },
        { key: "height", label: "Height", unit: "cm", hint: "Your height in centimetres, from 100 to 250.", slider: { min: 100, max: 250, step: 1 } },
        { key: "activity", label: "Activity level", kind: "select", value: "1.2", options: ACTIVITY, hint: "Pick the closest. People often overestimate how active they are." }
    ],
    solve: solveCalorie,
    howTo: [
        "Choose male or female, and enter your age, weight and height.",
        "Pick the activity level that fits a typical week.",
        "Read the estimated kilocalories your body uses in a day."
    ],
    reading: [
        "<strong>The estimate</strong> is your basal metabolic rate (Mifflin-St Jeor) multiplied by an activity factor: 1.2, 1.375, 1.55, 1.725 or 1.9.",
        "The factors are conventional multipliers, and sources describe the activity levels in slightly different words, so treat the result as a rough guide rather than a measurement.",
        "This page does not suggest a calorie target for losing or gaining weight."
    ],
    example: {
        values: { sex: "male", age: "30", weight: "80", height: "180", activity: "1.55" },
        text: "A 30-year-old man of 80 kg and 180 cm has a BMR of 1,780 kilocalories (10 x 80 + 6.25 x 180 - 5 x 30 + 5). With moderate exercise, 1,780 x 1.55 = 2,759 kilocalories a day."
    },
    assumptions: [
        "An equation fitted to groups of healthy adults; an individual's real energy use can differ by a good margin.",
        "Not meant for pregnancy, breastfeeding, children, or people with medical conditions that change energy needs.",
        "The result is not a diet or weight-loss target. Ask a doctor or registered dietitian before changing how much you eat.",
        "Sources: Mifflin MD, St Jeor ST, et al., Am J Clin Nutr 1990;51(2):241-247; the activity multipliers are conventional.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Is this how much I should eat?", a: "No. It estimates the energy you use in a day. What you should eat depends on your health and goals; ask a doctor or dietitian." },
        { q: "Which activity level should I pick?", a: "The closest to a normal week. If you are unsure, choose the lower one." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
