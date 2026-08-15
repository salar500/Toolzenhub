import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../../../assets/js/calculators/formulas/loan.js";


export function getLoanData(prefix) {

    const amount =
        Number(
            document.querySelector(`#${prefix}-amount`).value
        );

    const unit =
        Number(
            document.querySelector(`#${prefix}-unit`).value
        );

    const rate =
        Number(
            document.querySelector(`#${prefix}-rate`).value
        );

    const years =
        Number(
            document.querySelector(`#${prefix}-years`).value
        );


    return {

        principal: amount * unit,

        rate,

        years

    };

}


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

        amortizationA:
            calculateAmortization(
                loanA.principal,
                loanA.rate,
                loanA.years
            ),

        amortizationB:
            calculateAmortization(
                loanB.principal,
                loanB.rate,
                loanB.years
            )

    };

}
