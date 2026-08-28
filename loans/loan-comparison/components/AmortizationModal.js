
/* =========================================================
   ToolZen Hub
   Loan Comparison
   Full Amortization Modal
========================================================= */

import { formatINR } from "../../../assets/js/calculators/common/formatter.js";


export function openAmortizationModal(
    loanA,
    loanB
) {

    closeAmortizationModal();


    const modal = document.createElement("div");

    modal.id = "loan-amortization-modal";

    modal.className =
        "loan-amortization-modal";


    modal.innerHTML = `

        <div
            class="loan-amortization-overlay"
            data-close-amortization
        ></div>


        <section
            class="loan-amortization-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-amortization-title"
        >

            <header class="loan-amortization-header">

                <div>

                    <span class="calculator-eyebrow">
                        Loan Analysis
                    </span>

                    <h2 id="loan-amortization-title">
                        Full Amortization Schedule
                    </h2>

                    <p>
                        Complete month-by-month repayment schedule
                        for both loans.
                    </p>

                </div>


                <button
                    type="button"
                    class="loan-amortization-close"
                    aria-label="Close amortization schedule"
                    data-close-amortization
                >
                    ×
                </button>

            </header>


            <div class="loan-amortization-summary">

                ${renderLoanSummary(
                    "Loan A",
                    loanA
                )}

                ${renderLoanSummary(
                    "Loan B",
                    loanB
                )}

            </div>


            <div class="loan-amortization-tabs">

                <button
                    type="button"
                    class="loan-amortization-tab active"
                    data-amortization-tab="a"
                >
                    Loan A
                </button>

                <button
                    type="button"
                    class="loan-amortization-tab"
                    data-amortization-tab="b"
                >
                    Loan B
                </button>

            </div>


            <div class="loan-amortization-table-container">

                <div
                    class="loan-amortization-panel active"
                    data-amortization-panel="a"
                >

                    ${renderSchedule(
                        loanA.amortization
                    )}

                </div>


                <div
                    class="loan-amortization-panel"
                    data-amortization-panel="b"
                >

                    ${renderSchedule(
                        loanB.amortization
                    )}

                </div>

            </div>


            <footer class="loan-amortization-footer">

                <p>
                    Figures are approximate and for illustration
                    purposes. Actual loan costs may vary depending
                    on lender terms, fees, taxes and other charges.
                </p>

                <button
                    type="button"
                    class="loan-reset-button"
                    data-close-amortization
                >
                    Close
                </button>

            </footer>

        </section>

    `;


    document.body.appendChild(modal);


    requestAnimationFrame(() => {

        modal.classList.add(
            "is-open"
        );

    });


    initializeModalEvents(
        modal
    );

}


function renderLoanSummary(
    title,
    loan
) {

    return `

        <div class="loan-amortization-summary-card">

            <div class="loan-amortization-summary-title">
                ${title}
            </div>

            <div class="loan-amortization-summary-grid">

                <div>

                    <span>
                        Loan Amount
                    </span>

                    <strong>
                        ${formatINR(loan.amount)}
                    </strong>

                </div>


                <div>

                    <span>
                        Interest Rate
                    </span>

                    <strong>
                        ${loan.rate}%
                    </strong>

                </div>


                <div>

                    <span>
                        Tenure
                    </span>

                    <strong>
                        ${loan.years} Years
                    </strong>

                </div>


                <div>

                    <span>
                        Monthly EMI
                    </span>

                    <strong>
                        ${formatINR(loan.emi)}
                    </strong>

                </div>

            </div>

        </div>

    `;

}


function renderSchedule(
    schedule
) {

    if (
        !Array.isArray(schedule) ||
        schedule.length === 0
    ) {

        return `

            <div class="loan-amortization-empty">

                No amortization data available.

            </div>

        `;

    }


    return `

        <div class="loan-full-table-scroll">

            <table class="loan-amortization-table">

                <thead>

                    <tr>

                        <th>
                            Month
                        </th>

                        <th>
                            EMI
                        </th>

                        <th>
                            Principal
                        </th>

                        <th>
                            Interest
                        </th>

                        <th>
                            Balance
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${schedule
                        .map(row => `

                            <tr>

                                <td>
                                    ${row.month}
                                </td>

                                <td>
                                    ${formatINR(row.emi)}
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

        </div>

    `;

}


function initializeModalEvents(
    modal
) {


    modal
        .querySelectorAll(
            "[data-close-amortization]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                closeAmortizationModal
            );

        });


    modal
        .querySelectorAll(
            "[data-amortization-tab]"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.amortizationTab;


                    modal
                        .querySelectorAll(
                            ".loan-amortization-tab"
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === tab
                            );

                        });


                    modal
                        .querySelectorAll(
                            ".loan-amortization-panel"
                        )
                        .forEach(panel => {

                            panel.classList.toggle(
                                "active",
                                panel.dataset.amortizationPanel === target
                            );

                        });

                }
            );

        });


    document.addEventListener(
        "keydown",
        handleEscape
    );

}


function handleEscape(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}


export function closeAmortizationModal() {

    const existing =
        document.querySelector(
            "#loan-amortization-modal"
        );


    if (!existing) {
        return;
    }


    existing.remove();


    document.removeEventListener(
        "keydown",
        handleEscape
    );

}
