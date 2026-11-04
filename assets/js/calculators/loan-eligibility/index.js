/* Loan Eligibility Calculator (Loans). The page is drawn by common/simple-calculator.js; the arithmetic is
   formulas/loan-eligibility.js. It estimates from a share of income that the VISITOR chooses; it is not a lender's rule. */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solveLoanEligibility } from "../formulas/loan-eligibility.js";

const calculator = createSimpleCalculator({
    prefix: "le",
    toolId: "loan-eligibility",
    eyebrow: "Loan Tool",
    intro: "Estimate how large a loan a monthly EMI could support, from your income, the EMIs you already pay and the share of income you are willing to spend on loan payments.",
    sectionTitle: "Enter Your Numbers",
    sectionText: "Lenders use their own rules. Enter the share of income you want to use, or the one a lender tells you. Results update as you type.",
    emptyMessage: "Enter your monthly income, the share for loan payments, the rate and the tenure to see an estimate.",
    footnote: "An estimate from the numbers you entered. It is not an approval or an offer: a lender also looks at credit history, employment, age and more.",
    fields: [
        { key: "income", label: "Monthly income", hint: "The monthly income you want counted, for example your take-home pay or the figure a lender uses.", slider: { min: 10000, max: 1000000, step: 5000 } },
        { key: "existing", label: "Existing EMIs (optional)", hint: "The total of the loan and card EMIs you already pay each month.", slider: { min: 0, max: 500000, step: 1000 } },
        { key: "share", label: "Share of income for loan payments", unit: "%", value: "50", hint: "Lenders usually limit total monthly loan payments to a share of income. Use the share a lender gives you, or your own limit. The 50% shown is only a starting value.", slider: { min: 10, max: 70, step: 1 } },
        { key: "rate", label: "Interest rate (a year)", unit: "%", hint: "The yearly rate you expect, on a reducing balance.", slider: { min: 5, max: 20, step: 0.1 } },
        { key: "years", label: "Tenure", unit: "years", hint: "How long you would take to repay.", slider: { min: 1, max: 30, step: 1 } }
    ],
    solve: solveLoanEligibility,
    howTo: [
        "Enter your monthly income and the total of the EMIs you already pay.",
        "Set the share of income you can or want to spend on loan payments.",
        "Enter the interest rate and tenure you expect.",
        "Read the highest new EMI that fits, and the loan amount that EMI could repay."
    ],
    reading: [
        "<strong>The highest new EMI</strong> is your monthly income times the share, minus the EMIs you already pay.",
        "<strong>The loan amount</strong> is the present value of that EMI over the tenure at the rate you entered: the amount that the EMI would exactly repay, with interest charged each month on the balance.",
        "A longer tenure or a lower rate raises the loan amount for the same EMI."
    ],
    example: {
        values: { income: "80000", existing: "10000", share: "50", rate: "10", years: "20" },
        text: "With a monthly income of 80,000 and a 50% share, total loan payments can be 40,000. With 10,000 of existing EMIs, 30,000 is left for a new EMI. At 10% for 20 years, a 30,000 EMI repays the loan below."
    },
    assumptions: [
        "The share of income is your choice. It is not a rule of any particular lender, and lenders differ.",
        "Credit score, employment type, age, the property or purpose, down payment and the lender's own policy are not considered.",
        "A fixed rate on a reducing balance. Fees and insurance are not included.",
        "The result is an estimate to plan with, not a promise that a lender will lend this amount.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "Is this what my bank will approve?", a: "Not necessarily. Banks apply their own rules and checks. This page shows what an EMI within the share you chose could repay." },
        { q: "What share should I enter?", a: "Use the figure your lender gives you if you have one. Otherwise choose a share you are comfortable paying every month." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
