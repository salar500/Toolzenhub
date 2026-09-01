import {
    formatINR
} from "../../../assets/js/calculators/common/formatter.js";

import {
    renderAmortizationModal
} from "./AmortizationModalView.js";

import {
    downloadAmortizationPDF
} from "./AmortizationPDF.js";

import {
    getLoanDisplayUnit,
    getAmortizationTotals
} from "./AmortizationHelpers.js";


/* =========================================================
   OPEN AMORTIZATION MODAL
========================================================= */

export function openAmortizationModal(
    loan,
    schedule,
    loanName
) {

    /* =====================================================
       SAFETY CHECKS
    ===================================================== */

    if (!loan) {

        console.error(
            "Amortization modal: loan data is missing.",
            loan
        );

        return;
    }


    if (!Array.isArray(schedule)) {

        console.error(
            "Amortization modal: schedule is not an array.",
            schedule
        );

        return;
    }


    console.log(
        "Opening amortization modal:",
        {
            loan,
            loanName,
            scheduleLength:
                schedule.length
        }
    );


    /* =====================================================
       REMOVE EXISTING MODAL
    ===================================================== */

    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {

        existingModal.remove();

    }


    /* =====================================================
       GET DISPLAY UNIT
    ===================================================== */

    const displayUnit =
        getLoanDisplayUnit(
            loanName
        );


    /* =====================================================
       CALCULATE TOTALS
    ===================================================== */

    const totals =
        getAmortizationTotals(
            loan,
            schedule
        );


    /* =====================================================
       CREATE MODAL
    ===================================================== */

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "amortization-modal";


    modal.className =
        "loan-amortization-modal is-open";


    modal.innerHTML =
        renderAmortizationModal({

            loan,

            schedule,

            loanName,

            emi:
                totals.emi,

            totalInterest:
                totals.totalInterest,

            totalRepayment:
                totals.totalRepayment,

            displayUnit

        });


    /* =====================================================
       ADD MODAL TO PAGE
    ===================================================== */

    document.body.appendChild(
        modal
    );


    /* =====================================================
       CLOSE BUTTONS + OVERLAY
    ===================================================== */

    modal
        .querySelectorAll(
            "[data-close-amortization]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeAmortizationModal
                );

            }
        );


    /* =====================================================
       DOWNLOAD PDF BUTTON
    ===================================================== */

    const downloadButton =
        modal.querySelector(
            "[data-download-amortization-pdf]"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            async () => {

                await downloadAmortizationPDF(

                    loan,

                    schedule,

                    loanName,

                    totals.emi,

                    totals.totalInterest,

                    totals.totalRepayment,

                    displayUnit,

                    downloadButton

                );

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        handleEscape
    );


    /* =====================================================
       PREVENT PAGE SCROLL
    ===================================================== */

    document.body.classList.add(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "hidden";


    console.log(
        "Amortization modal successfully added to DOM."
    );

}


/* =========================================================
   CLOSE AMORTIZATION MODAL
========================================================= */

export function closeAmortizationModal() {

    const modal =
        document.querySelector(
            "#amortization-modal"
        );


    if (!modal) {

        return;

    }


    modal.remove();


    document.body.classList.remove(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "";


    document.removeEventListener(
        "keydown",
        handleEscape
    );


    console.log(
        "Amortization modal closed."
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

function handleEscape(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeAmortizationModal();

    }

}
