/* Personal Loan Calculator (Loans). The page is drawn by common/simple-calculator.js; the arithmetic is
   formulas/personal-loan.js (the EMI formula of formulas/loan.js plus an optional processing fee). */

import { createSimpleCalculator } from "../common/simple-calculator.js";
import { solvePersonalLoan } from "../formulas/personal-loan.js";

const calculator = createSimpleCalculator({
    prefix: "pl",
    toolId: "personal-loan",
    eyebrow: "Loan Tool",
    intro: "Work out the monthly EMI, the total interest and, if you add the lender's processing fee, what the loan costs altogether.",
    sectionTitle: "Enter the Loan",
    sectionText: "Use the amount, the yearly interest rate and the tenure your lender quotes. Results update as you type.",
    emptyMessage: "Enter the loan amount, the interest rate and the tenure to see the EMI.",
    footnote: "Arithmetic on the numbers you entered, on a reducing balance. Your lender's offer and schedule decide the real figures. Not advice.",
    fields: [
        { key: "amount", label: "Loan amount", hint: "The amount you borrow.", slider: { min: 50000, max: 5000000, step: 10000 } },
        { key: "rate", label: "Interest rate (a year)", unit: "%", hint: "The yearly rate the lender quotes, on a reducing balance.", slider: { min: 5, max: 30, step: 0.1 } },
        { key: "years", label: "Tenure", unit: "years", hint: "How long you take to repay. Personal loans are often 1 to 5 years.", slider: { min: 1, max: 10, step: 1 } },
        { key: "fee", label: "Processing fee (optional)", unit: "%", hint: "The fee as a percentage of the loan amount, if the lender charges one.", slider: { min: 0, max: 5, step: 0.1 } }
    ],
    solve: solvePersonalLoan,
    howTo: [
        "Enter the loan amount, the yearly interest rate and the tenure in years.",
        "If the lender charges a processing fee, enter it as a percentage of the loan.",
        "Read the EMI, the total interest and, with a fee, the total cost.",
        "Change the tenure to see how a longer loan lowers the EMI but raises the interest."
    ],
    reading: [
        "<strong>The EMI</strong> is the fixed monthly payment that repays the loan with interest over the tenure, with interest charged each month on the balance still owed: EMI = P x r x (1 + r)<sup>n</sup> / ((1 + r)<sup>n</sup> - 1), where r is the monthly rate and n the number of months.",
        "<strong>Total interest</strong> is the EMI times the number of months, minus the amount borrowed.",
        "<strong>The processing fee</strong>, when entered, is shown separately and added to the cost. It is not part of the EMI."
    ],
    example: {
        values: { amount: "500000", rate: "12", years: "3", fee: "2" },
        text: "A loan of 5,00,000 at 12% a year for 3 years (36 months) with a 2% processing fee. The monthly rate is 1%, which gives the EMI below; the fee is 2% of 5,00,000."
    },
    assumptions: [
        "A fixed rate on a reducing balance, with equal monthly payments starting one month after the loan.",
        "The fee is a percentage of the loan amount, added as entered. Taxes on the fee, insurance, prepayment and late charges are not included.",
        "A lender may deduct the fee from the amount you receive, or round the EMI. The lender's schedule is the one that applies.",
        "For a full schedule or to compare two loans, use the EMI Calculator or the Loan Comparison Calculator.",
        "Nothing is looked up, and nothing you enter leaves this page."
    ],
    faq: [
        { q: "How is this different from the EMI Calculator?", a: "The calculation of the EMI is the same. This page adds an optional processing fee and shows what the loan costs in total." },
        { q: "Does it tell me whether I will be approved?", a: "No. Approval is the lender's decision. The Loan Eligibility Calculator shows an estimate based on a share of income that you choose." }
    ]
});

export const markup = calculator.markup;
export const render = calculator.render;
export const init = calculator.init;
