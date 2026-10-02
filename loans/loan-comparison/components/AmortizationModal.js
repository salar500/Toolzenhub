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
   FOCUS MANAGEMENT

   - the element that opened the dialog gets focus back when it closes
   - focus moves into the dialog when it opens, and Tab stays inside it
   - the page behind the dialog is inert (not focusable, not read out)
========================================================= */

let openerElement = null;

const BACKGROUND_SELECTORS = ["#header", "#app", "#footer"];

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container) {

    return [...container.querySelectorAll(FOCUSABLE)]
        .filter(element => element.getClientRects().length > 0);

}

function setBackgroundInert(inert) {

    BACKGROUND_SELECTORS.forEach(selector => {

        const element =
            document.querySelector(selector);

        if (!element) {
            return;
        }

        if (inert) {
            element.setAttribute("inert", "");
        } else {
            element.removeAttribute("inert");
        }

    });

}


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

    } else {

        openerElement =
            document.activeElement;

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
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        handleKeydown
    );


    /* =====================================================
       FOCUS INTO THE DIALOG, PAGE BEHIND IT INERT
    ===================================================== */

    setBackgroundInert(true);

    const dialog =
        modal.querySelector(
            ".loan-amortization-dialog"
        ) || modal;

    (getFocusable(dialog)[0] || dialog).focus();


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


    document.removeEventListener(
        "keydown",
        handleKeydown
    );

    /*
     * Make the page usable again, then give focus back to the
     * control that opened the dialog.
     */

    setBackgroundInert(false);

    if (
        openerElement &&
        document.contains(openerElement)
    ) {
        openerElement.focus();
    }

    openerElement = null;

}


/* =========================================================
   KEYBOARD: ESCAPE CLOSES, TAB STAYS INSIDE THE DIALOG
========================================================= */

function handleKeydown(
    event
) {

    if (event.key === "Escape") {

        closeAmortizationModal();

        return;

    }

    if (event.key !== "Tab") {
        return;
    }

    const modal =
        document.querySelector(
            "#amortization-modal"
        );

    if (!modal) {
        return;
    }

    const dialog =
        modal.querySelector(
            ".loan-amortization-dialog"
        ) || modal;

    const items =
        getFocusable(dialog);

    if (!items.length) {

        event.preventDefault();

        return;

    }

    const first = items[0];
    const last = items[items.length - 1];
    const inside = dialog.contains(document.activeElement);

    if (
        event.shiftKey &&
        (document.activeElement === first || !inside)
    ) {

        event.preventDefault();

        last.focus();

    } else if (
        !event.shiftKey &&
        (document.activeElement === last || !inside)
    ) {

        event.preventDefault();

        first.focus();

    }

}
