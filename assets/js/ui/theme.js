/* =========================================================
   ToolZen Hub
   Light and dark theme

   The page's theme is html[data-theme="light" | "dark"]. A small
   inline script in the page head sets it before first paint: the
   saved choice if there is one, otherwise the device's setting.
   Nothing is saved until the visitor presses the toggle, and then
   only the word "light" or "dark" (key tz-theme). The rulebook's
   persistence exception for it is in docs/product-decision-rules.md.
========================================================= */

const KEY = "tz-theme";


export function currentTheme() {

    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";

}


function save(theme) {

    try {
        localStorage.setItem(KEY, theme);
    } catch {
        /* private window or blocked storage: the choice lasts until the page is left */
    }

}


function paint(button) {

    const dark = currentTheme() === "dark";

    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.setAttribute("aria-pressed", dark ? "true" : "false");

}


export function bindThemeToggle(root = document) {

    for (const button of root.querySelectorAll("[data-action='theme']")) {

        if (button.dataset.bound === "true") {
            continue;
        }

        button.dataset.bound = "true";

        paint(button);

        button.addEventListener("click", () => {

            const next = currentTheme() === "dark" ? "light" : "dark";

            document.documentElement.dataset.theme = next;

            save(next);

            for (const other of document.querySelectorAll("[data-action='theme']")) {
                paint(other);
            }

        });

    }

}
