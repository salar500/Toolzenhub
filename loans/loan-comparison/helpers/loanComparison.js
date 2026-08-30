import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../../../assets/js/calculators/formulas/loan.js";

import {
    generatePDF
} from "../common/pdf/pdfGenerator.js";

export function getLoanData(prefix) {

    const amountElement =
        document.querySelector(
            `#${prefix}-amount`
        );

    const unitElement =
        document.querySelector(
            `#${prefix}-unit`
        );

    const rateElement =
        document.querySelector(
            `#${prefix}-rate`
        );

    const yearsElement =
        document.querySelector(
            `#${prefix}-years`
        );


    if (
        !amountElement ||
        !unitElement ||
        !rateElement ||
        !yearsElement
    ) {

        console.error(
            `Loan ${prefix.toUpperCase()} input fields are missing.`
        );

        return {
            principal: 0,
            rate: 0,
            years: 0
        };

    }


    const amount =
        Number(amountElement.value);

    const unit =
        Number(unitElement.value);

    const rate =
        Number(rateElement.value);

    const years =
        Number(yearsElement.value);


    return {

        principal:
            amount * unit,

        rate,

        years

    };

}


/* =========================================================
   LOAN COMPARISON
========================================================= */

export function calculateLoanComparison() {

    const loanA =
        getLoanData("a");

    const loanB =
        getLoanData("b");


    const emiA =
        calculateEMI(
            loanA.principal,
            loanA.rate,
            loanA.years
        );


    const emiB =
        calculateEMI(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const interestA =
        calculateTotalInterest(
            loanA.principal,
            loanA.rate,
            loanA.years
        );


    const interestB =
        calculateTotalInterest(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const repaymentA =
        calculateTotalRepayment(
            loanA.principal,
            loanA.rate,
            loanA.years
        );


    const repaymentB =
        calculateTotalRepayment(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const amortizationA =
        calculateAmortization(
            loanA.principal,
            loanA.rate,
            loanA.years
        );


    const amortizationB =
        calculateAmortization(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const winner =
        interestA < interestB
            ? "Loan A"
            : interestB < interestA
                ? "Loan B"
                : "Both Loans";


    const savings =
        Math.abs(
            interestA - interestB
        );


    return {

        loanA,
        loanB,

        emiA,
        emiB,

        interestA,
        interestB,

        repaymentA,
        repaymentB,

        winner,

        savings,

        amortizationA,

        amortizationB

    };

}
