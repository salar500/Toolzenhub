/* =========================================================
   ToolZen Hub
   Shared UI: dialog focus management

   The behaviour a modal dialog needs, whatever it contains:

   - focus moves into the dialog when it opens
   - Tab and Shift+Tab stay inside it
   - Escape asks to close it
   - the page behind it is inert (not focusable, not read out)
   - when it closes, focus returns to the control that opened it

   This file owns ONLY that. The dialog's markup, how it is
   opened and removed, and what Escape does are the tool's.
   Nothing forces a tool to use a dialog.

       const focus = activateDialog({ dialog, onEscape: close });
       ...
       focus.release();      // after the dialog is closed
========================================================= */

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/*
 * The regions of the shared page layout (layouts/base.njk) that
 * sit behind a dialog.
 */

const PAGE_REGIONS = ["#header", "#app", "#footer"];


export function getFocusable(
    container
) {

    return [...container.querySelectorAll(FOCUSABLE)]
        .filter(element => element.getClientRects().length > 0);

}


function setInert(
    selectors,
    inert
) {

    selectors.forEach(selector => {

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


/*
 * dialog      the element focus is kept inside
 * onEscape    called when Escape is pressed
 * background  selectors of what to make inert (the page layout)
 * restoreTo   what gets focus back on release (default: what has
 *             focus now, i.e. the control that opened the dialog)
 */

export function activateDialog({
    dialog,
    onEscape,
    background = PAGE_REGIONS,
    restoreTo = document.activeElement
}) {

    function handleKeydown(
        event
    ) {

        if (event.key === "Escape") {

            onEscape?.();

            return;

        }

        if (event.key !== "Tab") {
            return;
        }

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

    document.addEventListener(
        "keydown",
        handleKeydown
    );

    setInert(background, true);

    (getFocusable(dialog)[0] || dialog).focus();

    return {

        release() {

            document.removeEventListener(
                "keydown",
                handleKeydown
            );

            setInert(background, false);

            if (
                restoreTo &&
                document.contains(restoreTo)
            ) {
                restoreTo.focus();
            }

        }

    };

}
