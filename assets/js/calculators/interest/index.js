/* Interest Calculator (Loans). The page is drawn by common/simple-calculator.js; the arithmetic is formulas/interest.js. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveInterest, FREQUENCIES } from "../formulas/interest.js";

const calculator = createSimpleCalculator({
    prefix: "interest",
    toolId: "interest",
    eyebrow: "Loan Tool",
    intro: "Work out simple interest and compound interest on the same amount, rate and time, and see how much the compounding adds.",
    sectionTitle: "Enter the Amount, Rate and Time",
    sectionText: "Use a yearly rate. Results update as you type.",
    emptyMessage: "Enter the principal, the yearly rate and the time to see the interest.",
    footnote: "Arithmetic on the numbers you entered, before tax and fees. Not advice.",
    fields: [
        { key: "principal", label: "Principal", hint: "The amount borrowed or invested." },
        { key: "rate", label: "Interest rate (a year)", unit: "%", hint: "The yearly rate, for example 8.5.", slider: { min: 1, max: 20, step: 0.1 } },
        { key: "years", label: "Time", unit: "years", hint: "For example 2.5 for two and a half years.", slider: { min: 1, max: 30, step: 1 } },
        { key: "frequency", label: "Compounded", kind: "select", value: "1", options: FREQUENCIES, hint: "How often the interest is added to the balance. Simple interest ignores this." }
    ],
    solve: solveInterest,
    howTo: [
        "Enter the principal: the amount borrowed or invested.",
        "Enter the yearly interest rate and the time in years.",
        "Choose how often the interest is compounded.",
        "Compare the compound interest with the simple interest on the same figures."
    ],
    reading: [
        "<strong>Simple interest</strong> is calculated on the principal only: interest = principal x rate x time.",
        "<strong>Compound interest</strong> is calculated on the principal plus the interest already added: amount = principal x (1 + rate / n)<sup>n x time</sup>, where n is how many times a year the interest is added. The interest is the amount minus the principal.",
        "The more often interest is compounded, and the longer the time, the more compound interest exceeds simple interest."
    ],
    example: {
        values: { principal: "10000", rate: "10", years: "2", frequency: "1" },
        text: "10,000 at 10% a year for 2 years. Simple interest is 10,000 x 10% x 2 = 2,000. With yearly compounding the amount is 10,000 x 1.1<sup>2</sup> = 12,100, so the compound interest is 2,100: 100 more, because the second year's interest is also earned on the first year's interest."
    },
    assumptions: [
        "A fixed yearly rate for the whole time. A rate that changes is not modelled.",
        "Interest is shown before tax, fees and inflation. A lender's or bank's own schedule, day count and rounding can give slightly different figures.",
        "Daily compounding uses 365 days a year.",
        "This is not a loan repayment schedule; for monthly loan payments use the EMI Calculator.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Which is bigger, simple or compound interest?", a: "For the same rate and time, compound interest is equal to or larger than simple interest, and the gap grows with time and with how often interest is added." },
        { q: "Does this show an EMI?", a: "No. For monthly loan payments use the EMI Calculator." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
