import { formatINR } from "../../../assets/js/calculators/common/formatter.js";

import {
    calculateEMI,
    calculateTotalInterest,
    calculateTotalRepayment,
    calculateAmortization
} from "../helpers/loanComparison.js";


/* =========================================================
   OPEN FULL AMORTIZATION MODAL
========================================================= */

export function openAmortizationModal(prefix) {

    const data = getLoanData(prefix);

    if (!data) {
        return;
    }

    closeAmortizationModal();

    const modal = document.createElement("div");

    modal.className = "loan-amortization-modal";

    modal.innerHTML = `

        <div class="loan-modal-overlay"></div>

        <div
            class="loan-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-modal-title"
        >

            <div class="loan-modal-header">

                <div>

                    <span class="loan-modal-eyebrow">
                        ${data.title}
                    </span>

                    <h2 id="loan-modal-title">
                        Full Amortization Schedule
                    </h2>

                    <p>
                        ${formatINR(data.principal)}
                        • ${data.rate}% p.a.
                        • ${data.years} years
                    </p>

                </div>

                <button
                    type="button"
                    class="loan-modal-close"
                    id="loan-modal-close"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div class="loan-modal-summary">

                <div class="loan-modal-summary-card">

                    <span>
                        Monthly EMI
                    </span>

                    <strong>
                        ${formatINR(data.emi)}
                    </strong>

                </div>


                <div class="loan-modal-summary-card">

                    <span>
                        Total Interest
                    </span>

                    <strong>
                        ${formatINR(data.totalInterest)}
                    </strong>

                </div>


                <div class="loan-modal-summary-card">

                    <span>
                        Total Repayment
                    </span>

                    <strong>
                        ${formatINR(data.totalRepayment)}
                    </strong>

                </div>

            </div>


            <div class="loan-modal-table-wrapper">

                <table class="loan-amortization-table loan-full-table">

                    <thead>

                        <tr>

                            <th>Month</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Balance</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${data.schedule.map(row => `

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

                        `).join("")}

                    </tbody>

                </table>

            </div>


            <div class="loan-modal-footer">

                <span>
                    ${data.schedule.length} monthly payments
                </span>

                <button
                    type="button"
                    class="loan-modal-footer-button"
                    id="loan-modal-close-bottom"
                >
                    Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    document
        .querySelector("#loan-modal-close")
        ?.addEventListener(
            "click",
            closeAmortizationModal
        );


    document
        .querySelector("#loan-modal-close-bottom")
        ?.addEventListener(
            "click",
            closeAmortizationModal
        );


    document
        .querySelector(".loan-modal-overlay")
        ?.addEventListener(
            "click",
            closeAmortizationModal
        );


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        handleModalEscape
    );


    /* =====================================================
       PREVENT BODY SCROLL
    ===================================================== */

    document.body.classList.add(
        "loan-modal-open"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

export function closeAmortizationModal() {

    const modal =
        document.querySelector(
            ".loan-amortization-modal"
        );


    if (modal) {
        modal.remove();
    }


    document.body.classList.remove(
        "loan-modal-open"
    );


    document.removeEventListener(
        "keydown",
        handleModalEscape
    );

}


/* =========================================================
   ESC KEY
========================================================= */

function handleModalEscape(event) {

    if (event.key === "Escape") {

        closeAmortizationModal();

    }

}


/* =========================================================
   GET LOAN DATA
========================================================= */

function getLoanData(prefix) {

    const amountElement =
        document.querySelector(
            `#${prefix}-amount`
        );

    const unitElement =
        document.querySelector(
            `#${prefix}-unit`
        );

    const rateElement =
        document.querySelector(
            `#${prefix}-rate`
        );

    const yearsElement =
        document.querySelector(
            `#${prefix}-years`
        );


    if (
        !amountElement ||
        !unitElement ||
        !rateElement ||
        !yearsElement
    ) {
        return null;
    }


    const amount =
        Number(amountElement.value);

    const unit =
        Number(unitElement.value);

    const rate =
        Number(rateElement.value);

    const years =
        Number(yearsElement.value);


    const principal =
        amount * unit;


    const emi =
        calculateEMI(
            principal,
            rate,
            years
        );


    const totalInterest =
        calculateTotalInterest(
            principal,
            rate,
            years
        );


    const totalRepayment =
        calculateTotalRepayment(
            principal,
            rate,
            years
        );


    const schedule =
        calculateAmortization(
            principal,
            rate,
            years
        );


    return {

        title:
            prefix === "a"
                ? "Loan A"
                : "Loan B",

        principal,

        rate,

        years,

        emi,

        totalInterest,

        totalRepayment,

        schedule

    };

}
