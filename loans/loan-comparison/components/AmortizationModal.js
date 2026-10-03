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

import {
    activateDialog
} from "../../../assets/js/ui/dialog-focus.js";


/* =========================================================
   FOCUS MANAGEMENT

   The mechanics (focus in, Tab kept inside, Escape, inert page,
   focus restored) are the shared dialog helper in ui/. This file
   keeps only the handle of the dialog that is open.
========================================================= */

let activeFocus = null;


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


    /* =====================================================
       REMOVE EXISTING MODAL
    ===================================================== */

    const existingModal =
        document.querySelector(
            "#amortization-modal"
        );


    if (existingModal) {

        existingModal.remove();

        activeFocus?.release();

        activeFocus = null;

    }


    /* =====================================================
       GET SELECTED DISPLAY UNIT
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


    /* =====================================================
       RENDER MODAL VIEW
    ===================================================== */

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
       FOCUS INTO THE DIALOG, PAGE BEHIND IT INERT (shared helper)
    ===================================================== */

    const dialog =
        modal.querySelector(
            ".loan-amortization-dialog"
        ) || modal;

    activeFocus =
        activateDialog({
            dialog,
            onEscape:
                closeAmortizationModal
        });


    /* =====================================================
       PREVENT PAGE SCROLL
    ===================================================== */

    document.body.classList.add(
        "amortization-modal-open"
    );


    document.body.style.overflow =
        "hidden";

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


    /*
     * Make the page usable again and give focus back to the
     * control that opened the dialog (shared helper).
     */

    activeFocus?.release();

    activeFocus = null;

}

