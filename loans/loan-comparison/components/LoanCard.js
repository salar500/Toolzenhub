```javascript
import { formatINR } from "../../../assets/js/calculators/common/formatter.js";

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
                        class="loan-slider"
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value="50"
                    >

                </div>


                <div class="loan-range-labels">
                    <span>1</span>
                    <span>100</span>
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
                    <span>0%</span>
                    <span>25%</span>
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
                    step="1"
                    value="20"
                >


                <input
                    id="${prefix}-years-slider"
                    class="loan-slider"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
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


        /* ==========================================
           LOAN AMOUNT SLIDER
        =========================================== */

        amountSlider.addEventListener(
            "input",
            () => {

                amount.value =
                    amountSlider.value;

                updateSliderFill(
                    amountSlider
                );

                updateAmountDisplay(
                    prefix
                );

                compareLoans();

            }
        );


        /* ==========================================
           LOAN AMOUNT SELECT
        =========================================== */

        amount.addEventListener(
            "change",
            () => {

                amountSlider.value =
                    amount.value;

                updateSliderFill(
                    amountSlider
                );

                updateAmountDisplay(
                    prefix
                );

                compareLoans();

            }
        );


        /* ==========================================
           UNIT
        =========================================== */

        unit.addEventListener(
            "change",
            () => {

                updateAmountDisplay(
                    prefix
                );

                compareLoans();

            }
        );


        /* ==========================================
           INTEREST RATE SLIDER
        =========================================== */

        rateSlider.addEventListener(
            "input",
            () => {

                rate.value =
                    rateSlider.value;

                updateSliderFill(
                    rateSlider
                );

                compareLoans();

            }
        );


        /* ==========================================
           INTEREST RATE INPUT
        =========================================== */

        rate.addEventListener(
            "input",
            () => {

                let value =
                    Number(rate.value);

                if (value < 0) {
                    value = 0;
                }

                if (value > 25) {
                    value = 25;
                }

                rateSlider.value =
                    value;

                updateSliderFill(
                    rateSlider
                );

                compareLoans();

            }
        );


        /* ==========================================
           TENURE SLIDER
        =========================================== */

        yearsSlider.addEventListener(
            "input",
            () => {

                years.value =
                    yearsSlider.value;

                updateSliderFill(
                    yearsSlider
                );

                compareLoans();

            }
        );


        /* ==========================================
           TENURE INPUT
        =========================================== */

        years.addEventListener(
            "input",
            () => {

                let value =
                    Number(years.value);

                if (value < 1) {
                    value = 1;
                }

                if (value > 100) {
                    value = 100;
                }

                yearsSlider.value =
                    value;

                updateSliderFill(
                    yearsSlider
                );

                compareLoans();

            }
        );


        /* ==========================================
           INITIAL STATE
        =========================================== */

        updateAmountDisplay(
            prefix
        );

        updateSliderFill(
            amountSlider
        );

        updateSliderFill(
            rateSlider
        );

        updateSliderFill(
            yearsSlider
        );

    });

}


/* =========================================================
   SLIDER VISUAL FILL
========================================================= */

function updateSliderFill(slider) {

    if (!slider) {
        return;
    }


    const min =
        Number(slider.min);

    const max =
        Number(slider.max);

    const value =
        Number(slider.value);


    if (
        Number.isNaN(min) ||
        Number.isNaN(max) ||
        Number.isNaN(value) ||
        max <= min
    ) {
        return;
    }


    const percentage =
        ((value - min) / (max - min)) * 100;


    slider.style.setProperty(
        "--slider-progress",
        `${percentage}%`
    );

}


/* =========================================================
   AMOUNT DISPLAY
========================================================= */

function updateAmountDisplay(prefix) {

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


    const display =
        document.querySelector(
            `#${prefix}-amount-display`
        );


    if (!display) {
        return;
    }


    display.textContent =
        formatINR(
            amount * unit
        );

}


/* =========================================================
   RESET
========================================================= */

export function resetLoanInputs() {

    resetLoan(
        "a",
        8.5
    );


    resetLoan(
        "b",
        9
    );


    updateAmountDisplay(
        "a"
    );


    updateAmountDisplay(
        "b"
    );


    document
        .querySelectorAll(".loan-slider")
        .forEach(
            slider => {
                updateSliderFill(
                    slider
                );
            }
        );


    compareLoans();

}


/* =========================================================
   RESET INDIVIDUAL LOAN
========================================================= */

function resetLoan(
    prefix,
    rate
) {

    const amount =
        document.querySelector(
            `#${prefix}-amount`
        );


    const unit =
        document.querySelector(
            `#${prefix}-unit`
        );


    const rateInput =
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


    const amountSlider =
        document.querySelector(
            `#${prefix}-amount-slider`
        );


    if (amount) {
        amount.value = 50;
    }


    if (unit) {
        unit.value = 100000;
    }


    if (rateInput) {
        rateInput.value = rate;
    }


    if (rateSlider) {
        rateSlider.value = rate;
    }


    if (years) {
        years.value = 20;
    }


    if (yearsSlider) {
        yearsSlider.value = 20;
    }


    if (amountSlider) {
        amountSlider.value = 50;
    }

}
```
