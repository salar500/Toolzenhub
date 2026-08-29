import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../../../assets/js/calculators/formulas/loan.js";


export function getLoanData(prefix) {

    const amountInput =
        document.querySelector(`#${prefix}-amount`);

    const unitInput =
        document.querySelector(`#${prefix}-unit`);

    const rateInput =
        document.querySelector(`#${prefix}-rate`);

    const yearsInput =
        document.querySelector(`#${prefix}-years`);


    if (
        !amountInput ||
        !unitInput ||
        !rateInput ||
        !yearsInput
    ) {

        console.error(
            `Loan ${prefix.toUpperCase()} input elements are missing.`
        );

        return {
            principal: 0,
            rate: 0,
            years: 0
        };
    }


    const amount =
        Number(amountInput.value);

    const unit =
        Number(unitInput.value);

    const rate =
        Number(rateInput.value);

    const years =
        Number(yearsInput.value);


    return {

        principal:
            amount * unit,

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
