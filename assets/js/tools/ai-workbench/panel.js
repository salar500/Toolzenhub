/* =========================================================
   ToolZen Hub
   AI Workbench: the guided single panel, first screen (AI
   programme D20; docs/ecosystem-review/ai-ecosystem/
   23-GUIDED-PANEL.md)

   What the page needs when it opens: every profession, grouped,
   with a search, as the panel's first step. The rest of the
   journey (tasks, questions, tools, the prompt, Back and Start
   over) is panel-steps.js, loaded on the first press in the panel,
   so the first load stays within D17. A link, a hand-off or a
   describe start opens the full page instead.
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { ROLE_GROUPS, ROLES } from "./roles.js";

/** h: as panel-steps.js initSteps, plus guided (start on the professions, or on the full page). */
export function initPanel(h) {

    const { P } = h;
    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");

    $("role-grid").innerHTML = ROLE_GROUPS.map((g) => `
                        <div class="${P}-role-group" data-group="${e(g.id)}">
                            <h3 class="${P}-role-group__title">${e(g.title)}</h3>
                            <ul class="${P}-role-list">${ROLES.filter((r) => r.group === g.id).map((r) => `
                                <li><button type="button" class="${P}-role" data-role-pick="${e(r.id)}" aria-pressed="false"><span class="${P}-role__name">${e(r.title)}</span> <span class="ai-note">${r.tasks.length} tasks</span></button></li>`).join("")}
                            </ul>
                        </div>`).join("") + `
                        <p class="ai-note" id="${P}-role-none" hidden>No profession matches. Try another word, or choose "Other ways to start" below.</p>`;

    function filter(text) {
        const q = text.trim().toLowerCase();
        let any = false;
        for (const li of panel.querySelectorAll(`.${P}-role-list li`)) {
            li.hidden = Boolean(q) && !li.textContent.toLowerCase().includes(q);
            any ||= !li.hidden;
        }
        for (const g of panel.querySelectorAll(`.${P}-role-group`)) g.hidden = !g.querySelector("li:not([hidden])");
        $("role-none").hidden = any;
    }
    $("role-search").addEventListener("input", (event) => filter(event.target.value));

    /* the first screen: the professions only (panel-steps.js shows each later step) */
    panel.dataset.mode = h.guided ? "guided" : "full";
    const old = document.querySelector(`.${P}-progress`);
    if (old) old.hidden = h.guided;
    const other = (id, text) => `<p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="${id}">${text}</button></p>`;
    if (h.guided) {
        for (const id of ["unsure", "outcomes", "tasks", "guide-tasks", "details", "results"]) $(id)?.classList.add(`${P}-off`);
        $("step-why").textContent = `All ${ROLES.length} professions the Workbench supports. Choose yours to see the tasks that are part of that work.`;
        $("steps").innerHTML = `<li aria-current="step">Role</li>`;
        $("panel-nav").innerHTML = other("full", "Other ways to start: describe your task, a playbook, a saved Work Pack or all tasks by outcome");
    } else {
        $("panel-nav").innerHTML = other("guided", "Back to the guided steps");
    }

    /* the first press loads the steps; presses while they load are handled in order once they are here */
    let steps = null;
    let loaded = false;
    panel.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (loaded || !b || !panel.contains(b) || !(b.dataset.rolePick || b.dataset.panel)) return;
        steps ??= import("./panel-steps.js").then((m) => {
            const api = m.initSteps({ ...h, filter });
            loaded = true;
            return api;
        });
        steps.then((api) => api.handle(b), () => {
            steps = null;
            h.announce("The next step could not be loaded. Check your connection and try again.", 0);
        });
    });

}
