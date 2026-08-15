/* =========================================================
   ToolZen Hub
   FAQ Component
========================================================= */

export function renderFAQ() {

    return `
        <section class="loan-content-card">

            <h2>❓ FAQs</h2>

            <details>

                <summary>
                    What is a loan comparison calculator?
                </summary>

                <p>
                    It compares two loans using EMI, interest,
                    repayment and tenure.
                </p>

            </details>


            <details>

                <summary>
                    Is a lower EMI always better?
                </summary>

                <p>
                    No. A lower EMI can result from a longer
                    tenure and may lead to higher total interest.
                </p>

            </details>


            <details>

                <summary>
                    Should I compare interest rate or EMI?
                </summary>

                <p>
                    Compare both, along with total interest,
                    repayment and fees.
                </p>

            </details>


            <details>

                <summary>
                    Can I compare loans with different tenures?
                </summary>

                <p>
                    Yes. The calculator can compare different
                    interest rates and loan periods.
                </p>

            </details>

        </section>
    `;
}
