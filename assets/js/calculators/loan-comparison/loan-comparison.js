/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../formulas/loan.js";

import {
    formatINR,
    formatPercent
} from "../common/formatter.js";


/* =========================================================
   RENDER
========================================================= */

export function render() {

    const app = document.querySelector("#app");

    if (!app) return;


    app.innerHTML = `

        <section class="loan-calculator">

            <div class="loan-calculator__intro">

                <span class="loan-calculator__eyebrow">
                    Finance Tool
                </span>

                <h1 class="loan-calculator__title">
                    Loan Comparison Calculator
                </h1>

                <p class="loan-calculator__description">
                    Compare two loans by EMI, interest rate,
                    total interest and total repayment.
                </p>

            </div>


            <div class="loan-calculator__grid">

                ${createLoanCard("a", "Loan A", "Option A", 8.5)}

                ${createLoanCard("b", "Loan B", "Option B", 9)}

            </div>


            <button
                id="compare-loans"
                class="loan-compare-button"
                type="button"
            >
                Compare Loans
            </button>


            <div class="loan-result">

                <h2 class="loan-result__title">
                    Loan Comparison
                </h2>

                <div id="comparison-result">

                    Enter your loan details and compare.

                </div>

            </div>

        </section>

    `;


    initializeLoanInputs();

    document
        .querySelector("#compare-loans")
        ?.addEventListener(
            "click",
            compareLoans
        );


    compareLoans();

}


/* =========================================================
   LOAN CARD
========================================================= */

function createLoanCard(
    prefix,
    title,
    badge,
    rate
) {

    return `

        <div class="loan-card">

            <div class="loan-card__header">

                <h2 class="loan-card__title">
                    ${title}
                </h2>

                <span class="loan-card__badge">
                    ${badge}
                </span>

            </div>


            <div class="loan-field">

                <label>
                    Loan Amount
                </label>

                <div class="loan-amount-row">

                    <select
                        id="${prefix}-amount"
                    >

                        ${createAmountOptions()}

                    </select>


                    <select
                        id="${prefix}-unit"
                    >

                        <option value="1000">
                            Thousands
                        </option>

                        <option
                            value="100000"
                            selected
                        >
                            Lakhs
                        </option>

                        <option value="10000000">
                            Crores
                        </option>

                        <option value="1000000">
                            Millions
                        </option>

                    </select>

                </div>


                <input
                    id="${prefix}-amount-slider"
                    class="loan-range"
                    type="range"
                    min="1"
                    max="100"
                    value="50"
                >

            </div>


            <div class="loan-field">

                <label>
                    Interest Rate (%)
                </label>

                <input
                    id="${prefix}-rate"
                    type="number"
                    min="0"
                    max="25"
                    step="0.01"
                    value="${rate}"
                >

                <input
                    id="${prefix}-rate-slider"
                    class="loan-range"
                    type="range"
                    min="0"
                    max="25"
                    step="0.01"
                    value="${rate}"
                >

            </div>


            <div class="loan-field">

                <label>
                    Tenure (Years)
                </label>

                <input
                    id="${prefix}-years"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value="20"
                >

                <input
                    id="${prefix}-years-slider"
                    class="loan-range"
                    type="range"
                    min="1"
                    max="100"
                    value="20"
                >

            </div>

        </div>

    `;

}


/* =========================================================
   AMOUNT OPTIONS
========================================================= */

function createAmountOptions() {

    return Array.from(
        { length: 100 },
        (_, index) => {

            const value = index + 1;

            return `
                <option
                    value="${value}"
                    ${value === 50 ? "selected" : ""}
                >
                    ${value}
                </option>
            `;

        }
    ).join("");

}


/* =========================================================
   INPUT INITIALIZATION
========================================================= */


            function initializeLoanInputs() {

    ["a", "b"].forEach(prefix => {

        const amount =
            document.querySelector(
                `#${prefix}-amount`
            );

        const unit =
            document.querySelector(
                `#${prefix}-unit`
            );

        const amountSlider =
            document.querySelector(
                `#${prefix}-amount-slider`
            );

        const rate =
            document.querySelector(
                `#${prefix}-rate`
            );

        const rateSlider =
            document.querySelector(
                `#${prefix}-rate-slider`
            );

        const years =
            document.querySelector(
                `#${prefix}-years`
            );

        const yearsSlider =
            document.querySelector(
                `#${prefix}-years-slider`
            );


        /* ================================================
           Amount
        ================================================ */

        amountSlider.addEventListener(
            "input",
            () => {

                amount.value =
                    amountSlider.value;

                compareLoans();

            }
        );


        amount.addEventListener(
            "change",
            () => {

                amountSlider.value =
                    amount.value;

                compareLoans();

            }
        );


        unit.addEventListener(
            "change",
            compareLoans
        );


        /* ================================================
           Interest Rate
        ================================================ */

        rateSlider.addEventListener(
            "input",
            () => {

                rate.value =
                    rateSlider.value;

                compareLoans();

            }
        );


        rate.addEventListener(
            "input",
            () => {

                rateSlider.value =
                    rate.value;

                compareLoans();

            }
        );


        /* ================================================
           Tenure
        ================================================ */

        yearsSlider.addEventListener(
            "input",
            () => {

                years.value =
                    yearsSlider.value;

                compareLoans();

            }
        );


        years.addEventListener(
            "input",
            () => {

                yearsSlider.value =
                    years.value;

                compareLoans();

            }
        );

    });

            }

}


/* =========================================================
   GET LOAN DATA
========================================================= */

function getLoanData(prefix) {

    const amount =
        Number(
            document.querySelector(
                `#${prefix}-amount`
            ).value
        );

    const unit =
        Number(
            document.querySelector(
                `#${prefix}-unit`
            ).value
        );

    const rate =
        Number(
            document.querySelector(
                `#${prefix}-rate`
            ).value
        );

    const years =
        Number(
            document.querySelector(
                `#${prefix}-years`
            ).value
        );


    return {

        principal:
            amount * unit,

        rate,

        years

    };

}


/* =========================================================
   COMPARE
========================================================= */

function compareLoans() {

    const loanA =
        getLoanData("a");

    const loanB =
        getLoanData("b");


    const output =
        document.querySelector(
            "#comparison-result"
        );


    if (
        loanA.principal <= 0 ||
        loanB.principal <= 0 ||
        loanA.rate < 0 ||
        loanB.rate < 0 ||
        loanA.years <= 0 ||
        loanB.years <= 0
    ) {

        output.innerHTML = `

            <div class="loan-winner-box">
                Please enter valid loan details.
            </div>

        `;

        return;

    }


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


    output.innerHTML = `

        <div class="loan-result__table-wrap">

            <table>

                <thead>

                    <tr>

                        <th>
                            Metric
                        </th>

                        <th>
                            Loan A
                        </th>

                        <th>
                            Loan B
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            EMI
                        </td>

                        <td class="${
                            emiA < emiB
                                ? "loan-winner"
                                : ""
                        }">

                            ${formatINR(emiA)}

                        </td>

                        <td class="${
                            emiB < emiA
                                ? "loan-winner"
                                : ""
                        }">

                            ${formatINR(emiB)}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Total Interest
                        </td>

                        <td class="${
                            interestA < interestB
                                ? "loan-winner"
                                : ""
                        }">

                            ${formatINR(interestA)}

                        </td>

                        <td class="${
                            interestB < interestA
                                ? "loan-winner"
                                : ""
                        }">

                            ${formatINR(interestB)}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Total Repayment
                        </td>

                        <td>
                            ${formatINR(repaymentA)}
                        </td>

                        <td>
                            ${formatINR(repaymentB)}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            Interest Rate
                        </td>

                        <td>
                            ${formatPercent(loanA.rate)}
                        </td>

                        <td>
                            ${formatPercent(loanB.rate)}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            Tenure
                        </td>

                        <td>
                            ${loanA.years} years
                        </td>

                        <td>
                            ${loanB.years} years
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <div class="loan-winner-box">

            <strong>
                🏆 Lower Interest Cost:
            </strong>

            ${winner}

            <br><br>

            Interest Difference:

            <strong>
                ${formatINR(savings)}
            </strong>

        </div>


        <div class="loan-result__table-wrap">

            <h3>
                First 12 Months — Loan A
            </h3>

            ${renderAmortization(
                calculateAmortization(
                    loanA.principal,
                    loanA.rate,
                    loanA.years
                )
            )}

        </div>


        <div class="loan-result__table-wrap">

            <h3>
                First 12 Months — Loan B
            </h3>

            ${renderAmortization(
                calculateAmortization(
                    loanB.principal,
                    loanB.rate,
                    loanB.years
                )
            )}

        </div>

    `;

}


/* =========================================================
   AMORTIZATION TABLE
========================================================= */

function renderAmortization(schedule) {

    return `

        <table>

            <thead>

                <tr>

                    <th>Month</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>

                </tr>

            </thead>


            <tbody>

                ${schedule
                    .slice(0, 12)
                    .map(row => `

                        <tr>

                            <td>
                                ${row.month}
                            </td>

                            <td>
                                ${formatINR(row.principal)}
                            </td>

                            <td>
                                ${formatINR(row.interest)}
                            </td>

                            <td>
                                ${formatINR(row.balance)}
                            </td>

                        </tr>

                    `)
                    .join("")}

            </tbody>

        </table>

    `;

}
