/* =========================================================
   Loan Comparison
   Loan Card Component
========================================================= */

export function renderLoanCard(
    prefix,
    title,
    badge,
    rate
) {

    return `

        <article class="loan-card">

            <div class="loan-card-header">

                <div>

                    <h2>
                        ${title}
                    </h2>

                    <span class="loan-badge">
                        ${badge}
                    </span>

                </div>

            </div>


            <!-- Loan Amount -->

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


            <!-- Interest Rate -->

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


            <!-- Tenure -->

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


/* =========================================================
   Amount Options
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
