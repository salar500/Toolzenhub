import { formatINR } from "../../../../../assets/js/common/formatter.js";

import {
    compareLoans
} from "./Results.js";


export function createLoanCard(
    prefix,
    title,
    badge,
    rate
) {

    return `

        <article class="loan-card">

            <div class="loan-card-header">

                <div>

                    <h2>${title}</h2>

                    <span class="loan-badge">
                        ${badge}
                    </span>

                </div>

            </div>


            <div class="loan-field">

                <label>
                    Loan Amount
                </label>

                <div class="loan-input-row">

                    <select id="${prefix}-amount">
                        ${createAmountOptions()}
                    </select>

                    <select id="${prefix}-unit">

                        <option value="1000">
                            Thousands
                        </option>

                        <option value="100000" selected>
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


                <div class="loan-slider-row">

                    <input
                        id="${prefix}-amount-slider"
                        type="range"
                        min="1"
                        max="100"
                        value="50"
                    >

                </div>


                <small id="${prefix}-amount-display">
                    ₹50,00,000
                </small>

            </div>


            <div class="loan-field">

                <label>
                    Interest Rate (% p.a.)
                </label>

                <div class="loan-number-input">

                    <input
                        id="${prefix}-rate"
                        type="number"
                        min="0"
                        max="25"
                        step="0.01"
                        value="${rate}"
                    >

                    <span>%</span>

                </div>


                <input
                    id="${prefix}-rate-slider"
                    class="loan-slider"
                    type="range"
                    min="0"
                    max="25"
                    step="0.01"
                    value="${rate}"
                >


                <div class="loan-range-labels">
                    <span>0</span>
                    <span>25</span>
                </div>

            </div>


            <div class="loan-field">

                <label>
                    Tenure (Years)
                </label>

                <input
                    id="${prefix}-years"
                    class="loan-years-input"
                    type="number"
                    min="1"
                    max="100"
                    value="20"
                >


                <input
                    id="${prefix}-years-slider"
                    class="loan-slider"
                    type="range"
                    min="1"
                    max="100"
                    value="20"
                >


                <div class="loan-range-labels">
                    <span>1</span>
                    <span>100</span>
                </div>

            </div>

        </article>

    `;
}


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


export function initializeLoanInputs() {

    ["a", "b"].forEach(prefix => {

        const amount =
            document.querySelector(`#${prefix}-amount`);

        const unit =
            document.querySelector(`#${prefix}-unit`);

        const amountSlider =
            document.querySelector(`#${prefix}-amount-slider`);

        const rate =
            document.querySelector(`#${prefix}-rate`);

        const rateSlider =
            document.querySelector(`#${prefix}-rate-slider`);

        const years =
            document.querySelector(`#${prefix}-years`);

        const yearsSlider =
            document.querySelector(`#${prefix}-years-slider`);


        amountSlider.addEventListener(
            "input",
            () => {

                amount.value = amountSlider.value;

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        amount.addEventListener(
            "change",
            () => {

                amountSlider.value = amount.value;

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        unit.addEventListener(
            "change",
            () => {

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        rateSlider.addEventListener(
            "input",
            () => {

                rate.value = rateSlider.value;

                compareLoans();

            }
        );


        rate.addEventListener(
            "input",
            () => {

                rateSlider.value = rate.value;

                compareLoans();

            }
        );


        yearsSlider.addEventListener(
            "input",
            () => {

                years.value = yearsSlider.value;

                compareLoans();

            }
        );


        years.addEventListener(
            "input",
            () => {

                yearsSlider.value = years.value;

                compareLoans();

            }
        );


        updateAmountDisplay(prefix);

    });

}


function updateAmountDisplay(prefix) {

    const amount =
        Number(
            document.querySelector(`#${prefix}-amount`).value
        );

    const unit =
        Number(
            document.querySelector(`#${prefix}-unit`).value
        );

    const display =
        document.querySelector(
            `#${prefix}-amount-display`
        );

    if (!display) {
        return;
    }

    display.textContent =
        formatINR(amount * unit);

}


export function resetLoanInputs() {

    resetLoan("a", 8.5);
    resetLoan("b", 9);

    updateAmountDisplay("a");
    updateAmountDisplay("b");

    compareLoans();

}


function resetLoan(prefix, rate) {

    document.querySelector(`#${prefix}-amount`).value = 50;
    document.querySelector(`#${prefix}-unit`).value = 100000;

    document.querySelector(`#${prefix}-rate`).value = rate;
    document.querySelector(`#${prefix}-rate-slider`).value = rate;

    document.querySelector(`#${prefix}-years`).value = 20;
    document.querySelector(`#${prefix}-years-slider`).value = 20;

    document.querySelector(`#${prefix}-amount-slider`).value = 50;

}
