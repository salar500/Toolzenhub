/* =========================================================
   ToolZen Hub
   Calculator Information Components
========================================================= */


/* =========================================================
   HOW TO USE
========================================================= */

export function renderHowToUse() {

    return `
        <section class="loan-info-card">

            <div class="loan-info-icon">
                🧮
            </div>

            <div>

                <h2>How to Use This Calculator</h2>

                <ol>
                    <li>Enter the loan details for Loan A.</li>
                    <li>Enter the loan details for Loan B.</li>
                    <li>Click <strong>Compare Loans</strong>.</li>
                    <li>
                        Review EMI, interest and repayment
                        before choosing an option.
                    </li>
                </ol>

            </div>

        </section>
    `;
}


/* =========================================================
   WHY COMPARE
========================================================= */

export function renderWhyCompare() {

    return `
        <section class="loan-info-card">

            <div class="loan-info-icon">
                ⚖️
            </div>

            <div>

                <h2>Why Compare Loans?</h2>

                <p>
                    Two loans can have similar EMIs but very
                    different total costs. This calculator helps
                    you compare the important numbers side by side.
                </p>

                <div class="loan-check-list">

                    <span>✓ Monthly EMI</span>
                    <span>✓ Interest Rate</span>
                    <span>✓ Total Interest</span>
                    <span>✓ Total Repayment</span>
                    <span>✓ Loan Tenure</span>

                </div>

            </div>

        </section>
    `;
}


/* =========================================================
   HOW IT WORKS
========================================================= */

export function renderHowItWorks() {

    return `
        <section class="loan-info-card">

            <div class="loan-info-icon">
                🧮
            </div>

            <div>

                <h2>How Does Loan Comparison Work?</h2>

                <p>
                    We calculate the EMI for each loan using the
                    loan amount, annual interest rate and tenure.
                </p>

                <ul>

                    <li>
                        Total Repayment = EMI × Number of Payments
                    </li>

                    <li>
                        Total Interest = Total Repayment − Principal
                    </li>

                </ul>

            </div>

        </section>
    `;
}


/* =========================================================
   EXAMPLE
========================================================= */

export function renderExample() {

    return `
        <section class="loan-info-card loan-example-card">

            <div class="loan-info-icon">
                ₹
            </div>

            <div>

                <h2>Example</h2>

                <p>
                    Suppose you compare two ₹50 lakh loans
                    for 20 years.
                </p>

                <div class="loan-example-grid">

                    <div>
                        <strong>Loan A</strong>
                        <span>8.5%</span>
                    </div>

                    <div>
                        <strong>Loan B</strong>
                        <span>9%</span>
                    </div>

                </div>

                <p>
                    If Loan A has the lower total interest,
                    it may be the cheaper option overall.
                </p>

            </div>

        </section>
    `;
}


/* =========================================================
   THINGS TO CONSIDER
========================================================= */

export function renderThingsToConsider() {

    return `
        <section class="loan-content-card">

            <h2>💡 Things to Consider</h2>

            <ul class="loan-consider-list">

                <li>Don't compare using EMI alone.</li>

                <li>
                    Check total interest and repayment.
                </li>

                <li>
                    Consider processing fees and other charges.
                </li>

                <li>
                    Check prepayment and foreclosure charges.
                </li>

                <li>
                    Understand fixed vs floating interest rates.
                </li>

                <li>
                    Choose a tenure that fits your financial goals.
                </li>

            </ul>

        </section>
    `;
}
