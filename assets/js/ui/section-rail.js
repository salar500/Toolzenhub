/* =========================================================
   ToolZen Hub
   Section rail (tool pages)

   The "More <section>" navigation is a closed disclosure everywhere. On a wide screen (the same width
   section-switcher.css turns it into a left column) it is held open so it reads as a persistent rail; on a
   narrower screen it goes back to the closed disclosure, which is the phone and tablet pattern. Without script it
   stays a closed disclosure, so nothing depends on this file. Nothing is stored.
========================================================= */

const WIDE = "(min-width: 1400px)";

export function initSectionRail(root = document) {

    const details = root.querySelector(".section-switcher details");

    if (!details || typeof window.matchMedia !== "function") {
        return;
    }

    const query = window.matchMedia(WIDE);

    const keepOpen = event => {

        if (query.matches) {
            event.preventDefault();
        }

    };

    const summary = details.querySelector("summary");

    /* held open, the heading is not a control: it leaves the tab order so keyboard users do not land on a dead stop */
    const apply = () => {

        details.open = query.matches;

        if (query.matches) {
            summary?.setAttribute("tabindex", "-1");
        } else {
            summary?.removeAttribute("tabindex");
        }

    };

    summary?.addEventListener("click", keepOpen);

    query.addEventListener("change", apply);

    apply();

}
