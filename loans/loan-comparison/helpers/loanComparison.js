/* =========================================================
   Loan Comparison
   Logic / Events
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../../../assets/js/formulas/loan.js";

import {
    formatINR
} from "../../../assets/js/common/formatter.js";

import {
    renderResults
} from "../components/Results.js";


/* =========================================================
   INITIALIZE
========================================================= */

export function initializeLoanComparison() {

    ["a", "b"].forEach(
        initializeLoanInputs
    );

    document
        .querySelector("#compare-loans")
        ?.addEventListener(
            "click",
            compareLoans
        );

    document
        .querySelector("#reset-loans")
        ?.addEventListener(
            "click",
            resetLoans
        );

    compareLoans();
}


/* =========================================================
   INPUT INITIALIZATION
========================================================= */

function initializeLoanInputs(prefix) {

    const amount =
        getElement(`${prefix}-amount`);

    const unit =
        getElement(`${prefix}-unit`);

    const amountSlider =
        getElement(`${prefix}-amount-slider`);

    const rate =
        getElement(`${prefix}-rate`);

    const rateSlider =
        getElement(`${prefix}-rate-slider`);

    const years =
        getElement(`${prefix}-years`);

    const yearsSlider =
        getElement(`${prefix}-years-slider`);


    if (
        !amount ||
        !unit ||
        !amountSlider ||
        !rate ||
        !rateSlider ||
        !years ||
        !yearsSlider
    ) {
        return;
    }


    /* Amount slider */

    amountSlider.addEventListener(
        "input",
        () => {

            amount.value =
                amountSlider.value;

            updateAmountDisplay(prefix);

            compareLoans();

        }
    );


    /* Amount select */

    amount.addEventListener(
        "change",
        () => {

            amountSlider.value =
                amount.value;

            updateAmountDisplay(prefix);

            compareLoans();

        }
    );


    /* Unit */

    unit.addEventListener(
        "change",
        () => {

            updateAmountDisplay(prefix);

            compareLoans();

        }
    );


    /* Rate slider */

    rateSlider.addEventListener(
        "input",
        () => {

            rate.value =
                rateSlider.value;

            compareLoans();

        }
    );


    /* Rate input */

    rate.addEventListener(
        "input",
        () => {

            rateSlider.value =
                rate.value;

            compareLoans();

        }
    );


    /* Years slider */

    yearsSlider.addEventListener(
        "input",
        () => {

            years.value =
                yearsSlider.value;

            compareLoans();

        }
    );


    /* Years input */

    years.addEventListener(
        "input",
        () => {

            yearsSlider.value =
                years.value;

            compareLoans();

        }
    );


    updateAmountDisplay(prefix);
}


/* =========================================================
   GET ELEMENT
========================================================= */

function getElement(id) {

    return document.querySelector(
        `#${id}`
    );

}


/* =========================================================
   AMOUNT DISPLAY
========================================================= */

function updateAmountDisplay(prefix) {

    const amountElement =
        getElement(`${prefix}-amount`);

    const unitElement =
        getElement(`${prefix}-unit`);

    const display =
        getElement(`${prefix}-amount-display`);


    if (
        !amountElement ||
        !unitElement ||
        !display
    ) {
        return;
    }


    const amount =
        Number(amountElement.value);

    const unit =
        Number(unitElement.value);


    display.textContent =
        formatINR(
            amount * unit
        );

}


/* =========================================================
   GET LOAN DATA
========================================================= */

function getLoanData(prefix) {

    const amount =
        Number(
            getElement(
                `${prefix}-amount`
            )?.value
        );

    const unit =
        Number(
            getElement(
                `${prefix}-unit`
            )?.value
        );

    const rate =
        Number(
            getElement(
                `${prefix}-rate`
            )?.value
        );

    const years =
        Number(
            getElement(
                `${prefix}-years`
            )?.value
        );


    return {

        principal:
            amount * unit,

        rate,

        years

    };

}


/* =========================================================
   COMPARE LOANS
========================================================= */

function compareLoans() {

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


    renderResults({

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

    });

}


/* =========================================================
   RESET
========================================================= */

function resetLoans() {

    setLoanDefaults(
        "a",
        8.5
    );

    setLoanDefaults(
        "b",
        9
    );


    updateAmountDisplay("a");
    updateAmountDisplay("b");

    compareLoans();

}


/* =========================================================
   DEFAULT VALUES
========================================================= */

function setLoanDefaults(
    prefix,
    rate
) {

    getElement(
        `${prefix}-amount`
    ).value = 50;

    getElement(
        `${prefix}-unit`
    ).value = 100000;

    getElement(
        `${prefix}-amount-slider`
    ).value = 50;

    getElement(
        `${prefix}-rate`
    ).value = rate;

    getElement(
        `${prefix}-rate-slider`
    ).value = rate;

    getElement(
        `${prefix}-years`
    ).value = 20;

    getElement(
        `${prefix}-years-slider`
    ).value = 20;

}
