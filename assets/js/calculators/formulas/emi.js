// assets/js/calculators/formulas/emi.js

export function calculate(values) {

    const P = values.loan;

    const r = values.rate / 1200;

    const n = values.years * 12;

    const emi =
        P *
        r *
        Math.pow(1 + r, n) /
        (Math.pow(1 + r, n) - 1);

    return {

        monthlyEmi: Math.round(emi),

        totalPayment: Math.round(emi * n),

        totalInterest: Math.round((emi * n) - P)

    };

}
