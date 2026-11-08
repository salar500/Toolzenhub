/* =========================================================
   ToolZen Hub
   Locator practice (the locator block): type a Playwright-style locator, see what it matches in ShopLite (same-origin
   frame) and get it checked: exactly one element, and the intended one, as Playwright's strict mode requires for actions.
   Uses the teaching evaluator in automation/locator.js, which the page labels as a subset; nothing is stored or sent.
========================================================= */

import { parseLocator, resolve } from "./automation/locator.js";

const MARK = "3px solid #d97706";

export function initLocatorPractice(root = document) {

    for (const block of root.querySelectorAll("[data-locator]")) {

        const frame = block.querySelector("iframe");
        const tasks = [...block.querySelectorAll("[data-locator-task]")];
        let marked = [];

        const clearMarks = () => { for (const el of marked) el.style.outline = el.dataset.slOutline ?? ""; marked = []; };

        for (const task of tasks) {
            const input = task.querySelector("input");
            const out = task.querySelector("[data-locator-out]");
            task.querySelector("[data-locator-tools]").hidden = false;

            task.querySelector("[data-locator-check]").addEventListener("click", () => {
                clearMarks();
                const doc = frame.contentDocument;
                if (!doc?.body) { out.dataset.verdict = "cannot-check"; out.textContent = "ShopLite has not loaded yet. Wait a moment and try again."; return; }
                const here = doc.defaultView.location.hash || "#/";
                if (task.dataset.screen && here !== task.dataset.screen) doc.defaultView.location.hash = task.dataset.screen;
                setTimeout(() => {
                    let found;
                    try { found = resolve(doc, parseLocator(input.value)); }
                    catch (error) { out.dataset.verdict = "not-yet"; out.textContent = error.message; return; }
                    const target = doc.querySelector(task.dataset.target);
                    for (const el of found) { el.dataset.slOutline = el.style.outline; el.style.outline = MARK; }
                    marked = found;
                    found[0]?.scrollIntoView?.({ block: "center" });
                    if (found.length === 1 && found[0] === target) {
                        out.dataset.verdict = "correct";
                        out.textContent = /getByRole|getByLabel|getByPlaceholder|getByText/.test(input.value)
                            ? "Correct: exactly one element, the right one, found the way a user would find it."
                            : "Correct element, exactly one. Prefer a user-facing locator (getByRole, getByLabel) where you can: it survives layout changes.";
                    } else if (found.length > 1) {
                        out.dataset.verdict = "not-yet";
                        out.textContent = `${found.length} elements match (highlighted). Playwright's strict mode would refuse to act: narrow it with a name, exact: true, or a filter.`;
                    } else if (found.length === 1) {
                        out.dataset.verdict = "not-yet";
                        out.textContent = "One element matches (highlighted), but not the one the task asks for.";
                    } else {
                        out.dataset.verdict = "not-yet";
                        out.textContent = "No element matches. Check the role, the exact text of the name, and capital letters.";
                    }
                }, 150);
            });
        }

    }

}
