/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

export function render() {

    const app = document.getElementById("app");

    if (!app) {
        return;
    }

    app.innerHTML = `

        <section class="loan-calculator">

            <div class="loan-calculator__intro">

                <span class="loan-calculator__eyebrow">
                    Loan Calculator
                </span>

                <h1 class="loan-calculator__title">
                    Loan Comparison Calculator
                </h1>

                <p class="loan-calculator__description">
                    Compare two loans by EMI, interest cost
                    and total repayment.
                </p>

            </div>


            <div class="loan-calculator__grid">

                <!-- Loan A -->

                <div class="loan-card">

                    <div class="loan-card__header">

                        <h2 class="loan-card__title">
                            Loan A
                        </h2>

                        <span class="loan-card__badge">
                            Option A
                        </span>

                    </div>


                    <div class="loan-field">

                        <label for="loan-a-amount">
                            Loan Amount
                        </label>

                        <div class="loan-amount-row">

                            <input
                                id="loan-a-amount"
                                type="number"
                                value="500000"
                                min="1"
                            >

                            <select id="loan-a-unit">

                                <option value="1">
                                    ₹
                                </option>

                                <option value="100000">
                                    Lakhs
                                </option>

                                <option value="10000000">
                                    Crores
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="loan-field">

                        <label for="loan-a-rate">
                            Interest Rate (%)
                        </label>

                        <input
                            id="loan-a-rate"
                            type="number"
                            value="8.5"
                            min="0"
                            step="0.01"
                        >

                        <input
                            class="loan-range"
                            id="loan-a-rate-range"
                            type="range"
                            min="0"
                            max="25"
                            step="0.01"
                            value="8.5"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="loan-a-years">
                            Tenure (Years)
                        </label>

                        <input
                            id="loan-a-years"
                            type="number"
                            value="20"
                            min="1"
                            max="50"
                        >

                        <input
                            class="loan-range"
                            id="loan-a-years-range"
                            type="range"
                            min="1"
                            max="50"
                            value="20"
                        >

                    </div>

                </div>


                <!-- Loan B -->

                <div class="loan-card">

                    <div class="loan-card__header">

                        <h2 class="loan-card__title">
                            Loan B
                        </h2>

                        <span class="loan-card__badge">
                            Option B
                        </span>

                    </div>


                    <div class="loan-field">

                        <label for="loan-b-amount">
                            Loan Amount
                        </label>

                        <div class="loan-amount-row">

                            <input
                                id="loan-b-amount"
                                type="number"
                                value="500000"
                                min="1"
                            >

                            <select id="loan-b-unit">

                                <option value="1">
                                    ₹
                                </option>

                                <option value="100000">
                                    Lakhs
                                </option>

                                <option value="10000000">
                                    Crores
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="loan-field">

                        <label for="loan-b-rate">
                            Interest Rate (%)
                        </label>

                        <input
                            id="loan-b-rate"
                            type="number"
                            value="9"
                            min="0"
                            step="0.01"
                        >

                        <input
                            class="loan-range"
                            id="loan-b-rate-range"
                            type="range"
                            min="0"
                            max="25"
                            step="0.01"
                            value="9"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="loan-b-years">
                            Tenure (Years)
                        </label>

                        <input
                            id="loan-b-years"
                            type="number"
                            value="20"
                            min="1"
                            max="50"
                        >

                        <input
                            class="loan-range"
                            id="loan-b-years-range"
                            type="range"
                            min="1"
                            max="50"
                            value="20"
                        >

                    </div>

                </div>

            </div>


            <button
                id="loan-compare-button"
                class="loan-compare-button"
                type="button"
            >
                Compare Loans
            </button>


            <div
                id="loan-result"
                class="loan-result"
            >

                <h2 class="loan-result__title">
                    Comparison Result
                </h2>

                <div id="loan-result-content">
                    Enter your loan details and compare.
                </div>

            </div>

        </section>

    `;

}
