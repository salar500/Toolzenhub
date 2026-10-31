/* =========================================================
   ToolZen Hub
   "Jump to result" link (Design System 2.0, TX-02.3)

   On a phone the result follows a long form (on the 19 calculators measured it starts 1,282px or more down the
   page, so it is never on the first screen). A plain link before the form takes the visitor to it and moves
   focus there, so a keyboard or screen-reader user continues from the result. It points at the result element
   each calculator already has (no new ids) and is hidden from 960px up (the owner scoped this to phones; the
   result is still below the form there, see the matrix note on TX-02). A page without a result section (Loan
   Comparison) gets no link. The position is not measured, because the form may still be rendering when this runs.
========================================================= */

export function addJumpToResult(app) {

    const result =
        app.querySelector("section.calculator-results[id]");

    const form =
        app.querySelector("form");

    if (!result || !form || app.querySelector(".jump-to-result")) {
        return;
    }

    const link =
        document.createElement("a");

    link.className = "jump-to-result";

    link.href = `#${result.id}`;

    link.textContent = "Jump to result";

    link.addEventListener("click", () => {

        /* the browser scrolls to the fragment; focus follows, without a second scroll */
        result.setAttribute("tabindex", "-1");

        result.focus({ preventScroll: true });

    });

    const anchor =
        form.closest("section") || form;

    anchor.parentNode.insertBefore(link, anchor);

}
