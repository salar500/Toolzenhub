/* ROI Calculator (Business). The page is drawn by common/simple-calculator.js; the arithmetic is formulas/roi.js. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveRoi } from "../formulas/roi.js";

const calculator = createSimpleCalculator({
    prefix: "roi",
    toolId: "roi",
    eyebrow: "Business Tool",
    intro: "Enter what you put in and what it is worth now, and see the return as a percentage, the profit or loss and, if you add the years, the yearly rate.",
    sectionTitle: "Work Out the Return",
    sectionText: "Use the same currency for both amounts. Results update as you type.",
    emptyMessage: "Enter the amount invested and the final value to see the return on investment.",
    footnote: "Arithmetic on the numbers you entered. It is not advice and it includes no tax, fee or inflation.",
    fields: [
        { key: "invested", label: "Amount invested", hint: "The total you put in, including costs you want counted.", slider: { min: 10000, max: 10000000, step: 10000 } },
        { key: "final", label: "Final value", hint: "What it is worth now, or what you received, including any income you want counted.", slider: { min: 10000, max: 20000000, step: 10000 } },
        { key: "years", label: "Years held (optional)", unit: "years", hint: "Add this to see the return as a yearly rate.", slider: { min: 1, max: 30, step: 1 } }
    ],
    solve: solveRoi,
    howTo: [
        "Enter the amount invested: everything you paid in that you want counted as the cost.",
        "Enter the final value: what it is worth now or what you received, including income you want counted.",
        "Read the return on investment, and the profit or loss in money.",
        "Add the number of years to see the average yearly rate."
    ],
    reading: [
        "<strong>Return on investment</strong> is the profit or loss divided by the amount invested, shown as a percentage: (final value - amount invested) / amount invested x 100.",
        "<strong>The yearly rate</strong> is the compound rate that would turn the amount invested into the final value over the years entered: (final / invested)<sup>1/years</sup> - 1. It is an average; the real path may have gone up and down.",
        "ROI is not the same as profit: profit is an amount of money, ROI compares that profit with what you put in, so two investments with the same profit can have very different ROI."
    ],
    example: {
        values: { invested: "50000", final: "65000", years: "3" },
        text: "You invest 50,000 and it is worth 65,000 after 3 years. The profit is 15,000, and 15,000 / 50,000 = 30%. Over 3 years that averages (1.3)<sup>1/3</sup> - 1, about 9.14% a year."
    },
    assumptions: [
        "The result uses only the two amounts (and the years) you enter. Fees, taxes and inflation change the real return and are not included unless you put them into the amounts.",
        "ROI does not say how risky the investment was or how long it took unless you add the years.",
        "Income received along the way (such as dividends or rent) is counted only if you include it in the final value.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Can ROI be negative?", a: "Yes. If the final value is below the amount invested, the ROI is negative and the page shows a net loss." },
        { q: "What is a good ROI?", a: "There is no single answer. It depends on the time held, the risk taken and what else the money could have done, so this calculator does not label a result good or bad." },
        { q: "Why does the yearly rate differ from ROI divided by years?", a: "The yearly rate compounds. 30% over 3 years is about 9.14% a year compounded, not 10%." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
