/* BMI Calculator (Health). The page is drawn by common/simple-calculator.js; the arithmetic and the categories
   (WHO) are in formulas/body.js. A screening number, not a diagnosis. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveBmi } from "../formulas/body.js";

const calculator = createSimpleCalculator({
    prefix: "bmi",
    toolId: "bmi",
    eyebrow: "Health Tool",
    intro: "Work out your body mass index from your weight and height, and see where it falls in the WHO adult categories.",
    sectionTitle: "Enter Your Measurements",
    sectionText: "Use kilograms and centimetres (1 inch is 2.54 cm; 1 kg is about 2.2 pounds). For adults aged 18 or more. Results update as you type.",
    emptyMessage: "Enter your weight, height and age to see your BMI.",
    footnote: "A screening number, not a diagnosis or medical advice.",
    fields: [
        { key: "weight", label: "Weight", unit: "kg", hint: "Your weight in kilograms, from 20 to 300." },
        { key: "height", label: "Height", unit: "cm", hint: "Your height in centimetres, from 100 to 250." },
        { key: "age", label: "Age", unit: "years", hint: "In whole years. The categories here are for adults aged 18 or more." }
    ],
    solve: solveBmi,
    howTo: [
        "Enter your weight in kilograms and your height in centimetres.",
        "Enter your age in whole years; these categories apply from 18.",
        "Read your BMI, the WHO category and the Asian-population action points.",
        "Use the weight range to see what the normal BMI range means at your height."
    ],
    reading: [
        "<strong>BMI</strong> is weight in kilograms divided by height in metres squared.",
        "<strong>The WHO adult categories</strong> are: below 18.5 underweight; 18.5 to 24.9 normal range; 25 to 29.9 overweight; 30 and above obesity.",
        "<strong>For Asian populations</strong>, a WHO expert consultation in 2004 kept those categories and added two points for public health action: 23.0 or more (increased risk) and 27.5 or more (higher risk), because the risk of type 2 diabetes and heart disease was substantial at lower BMI than the international overweight cut-off. Both are shown so you can read them side by side.",
        "BMI does not separate muscle from fat, and it does not show where fat is carried, so it can mislead for athletes, older people and others. It is a starting point for a conversation with a doctor, not a diagnosis."
    ],
    example: {
        values: { weight: "70", height: "175", age: "30" },
        text: "A person of 70 kg and 175 cm (1.75 m): 70 / (1.75 x 1.75) = 70 / 3.0625, which is about 22.9. That is in the WHO normal range and below the 23.0 action point."
    },
    assumptions: [
        "For adults aged 18 or more. For children and teenagers, BMI is read against growth charts for their age and sex; ask a doctor.",
        "The category is taken from the BMI rounded to one decimal, as shown.",
        "Pregnancy, bodybuilding, a very different build and some medical conditions make BMI less meaningful.",
        "Sources: WHO adult BMI classification; WHO Expert Consultation, Lancet 2004;363:157-163 (Asian populations).",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Is BMI a measure of health?", a: "No. It is a quick screening number based on weight and height. Health depends on many other things." },
        { q: "Why are there two sets of numbers?", a: "The WHO international categories are the standard. For Asian populations the WHO consultation added lower action points because risks rise at a lower BMI. Both are shown." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
