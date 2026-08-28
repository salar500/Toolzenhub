import { formatINR } from "../../../assets/js/calculators/common/formatter.js";


export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

    closeAmortizationModal();


    const modal = document.createElement("div");

    modal.className = "loan-amortization-modal";

    modal.innerHTML = `

        <div class="loan-amortization-backdrop"></div>

        <div
            class="loan-amortization-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-amortization-title"
        >

            <div class="loan-modal-header">

                <div>

                    <span class="loan-modal-eyebrow">
                        ${loanName}
                    </span>

                    <h2 id="loan-amortization-title">
                        Full Amortization Schedule
                    </h2>

                    <p>
                        ${formatINR(loan.principal)}
                        • ${loan.rate}% p.a.
                        • ${loan.years} years
                    </p>

                </div>

                <button
                    type="button"
                    class="loan-modal-close"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div class="loan-modal-summary">

                <div>
                    <span>Monthly EMI</span>
                    <strong>
                        ${formatINR(loan.emi)}
                    </strong>
                </div>

                <div>
                    <span>Total Interest</span>
                    <strong>
                        ${formatINR(loan.interest)}
                    </strong>
                </div>

                <div>
                    <span>Total Repayment</span>
                    <strong>
                        ${formatINR(loan.repayment)}
                    </strong>
                </div>

            </div>


            <div class="loan-modal-table-scroll">

                <table class="loan-amortization-table">

                    <thead>

                        <tr>
                            <th>Month</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Balance</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${schedule.map(row => `

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
                    ${schedule.length} monthly payments
                </span>

                <button
                    type="button"
                    class="loan-modal-close-button"
                >
                    Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    requestAnimationFrame(() => {

        modal.classList.add(
            "is-open"
        );

    });


    const closeButtons =
        modal.querySelectorAll(
            ".loan-modal-close, .loan-modal-close-button"
        );


    closeButtons.forEach(button => {

        button.addEventListener(
            "click",
            closeAmortizationModal
        );

    });


    modal
        .querySelector(
            ".loan-amortization-backdrop"
        )
        ?.addEventListener(
            "click",
            closeAmortizationModal
        );


    document.addEventListener(
        "keydown",
        handleEscape
    );


    document.body.classList.add(
        "loan-modal-open"
    );

}


function handleEscape(event) {

    if (event.key === "Escape") {

        closeAmortizationModal();

    }

}


export function closeAmortizationModal() {

    const modal =
        document.querySelector(
            ".loan-amortization-modal"
        );


    if (!modal) {
        return;
    }


    document.removeEventListener(
        "keydown",
        handleEscape
    );


    modal.classList.remove(
        "is-open"
    );


    document.body.classList.remove(
        "loan-modal-open"
    );


    setTimeout(() => {

        modal.remove();

    }, 200);

}
