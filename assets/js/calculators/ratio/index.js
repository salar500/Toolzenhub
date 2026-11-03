/* Ratio Calculator (Math). The page is drawn by common/simple-calculator.js; the arithmetic is formulas/ratio.js. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveRatio } from "../formulas/ratio.js";

const calculator = createSimpleCalculator({
    prefix: "ratio",
    toolId: "ratio",
    eyebrow: "Math Tool",
    intro: "Simplify a ratio to its lowest terms, see it as multiples and shares, and find the missing term when you scale it up or down.",
    sectionTitle: "Enter the Ratio",
    sectionText: "Enter two numbers as A : B. To scale the ratio, also enter a new value for the first term. Results update as you type.",
    emptyMessage: "Enter the two numbers of the ratio to see it in its simplest form.",
    footnote: "Arithmetic on the numbers you entered.",
    fields: [
        { key: "a", label: "First number (A)", hint: "The first term of the ratio, for example 12." },
        { key: "b", label: "Second number (B)", hint: "The second term of the ratio, for example 20." },
        { key: "c", label: "New first term (optional)", hint: "To scale the ratio: the value you want A to become. The matching B is worked out." }
    ],
    solve: solveRatio,
    howTo: [
        "Enter the two terms of the ratio as A and B. Decimals are fine (up to 6 places).",
        "Read the simplest form, the multiples and the shares of the total.",
        "To scale the ratio, enter the value you want A to become; the matching second term is shown."
    ],
    reading: [
        "<strong>The simplest form</strong> divides both terms by their greatest common divisor, so 12 : 20 becomes 3 : 5.",
        "<strong>The multiples</strong> say how many times larger one term is than the other: 12 is 0.6 times 20.",
        "<strong>The shares</strong> are each term divided by the total, as a percentage: in 3 : 5, the parts are 37.5% and 62.5% of the whole.",
        "<strong>Scaling</strong> keeps the ratio equal: if A : B = C : D then D = B x C / A."
    ],
    example: {
        values: { a: "12", b: "20", c: "30" },
        text: "A recipe uses 12 cups of flour to 20 cups of milk. The ratio is 12 : 20, which simplifies to 3 : 5. To make a batch that uses 30 cups of flour, the milk needed is 20 x 30 / 12 = 50 cups."
    },
    assumptions: [
        "Both terms must be 0 or more, and at least one must be above 0.",
        "Decimals are converted to whole numbers (up to 6 decimal places) before simplifying, so the simplest form is exact.",
        "A ratio with a 0 term simplifies to 0 : 1 or 1 : 0.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "What is a ratio?", a: "A ratio compares two quantities, written A : B. It tells you how much of one there is for each amount of the other." },
        { q: "How do I simplify a ratio with decimals?", a: "Multiply both terms by the same power of 10 to make them whole numbers, then divide by the greatest common divisor. The calculator does this for you." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
