/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the guided panel, first screen (AI
   programme D20, conversational since D22;
   docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md and
   26-CONSOLIDATION.md)

   What the page needs when it opens: "What would you like to
   create today?", a box to describe the task in the visitor's own
   words, and the professions (a few suggested, every one a press
   away, with a search). The rest of the conversation (the task, its
   questions, tools, the visitor, the AI and the prompt, with Back,
   Change and Start over) is panel-steps.js, loaded on the first
   press in the panel, so the first load stays within D17. A task
   or profession link continues in the panel; an outcome, a
   describe start or the context pack open the full page.
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { ROLE_GROUPS, ROLES } from "./roles.js";

/* shown first: the professions most visitors start from; every other one is listed under "All professions" */
const SUGGESTED = ["developer", "qa", "writer", "marketer", "data", "owner", "student", "creator"];

/** h: as panel-steps.js initSteps, plus guided (start on the first screen, or on the full page) and start ({ task, role } from a link). */
export function initPanel(h) {

    const { P } = h;
    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");
    const role = (r) => `<li><button type="button" class="${P}-role" data-role-pick="${e(r.id)}" aria-pressed="false"><span class="${P}-role__name">${e(r.title)}</span> <span class="ai-note">${r.tasks.length} tasks</span></button></li>`;
    const suggested = SUGGESTED.map((id) => ROLES.find((r) => r.id === id)).filter(Boolean);

    $("role-grid").innerHTML = `
                        <ul class="${P}-role-list ${P}-role-list--suggested" aria-label="Suggested professions">${suggested.map(role).join("")}
                        </ul>
                        <details class="${P}-all-roles" id="${P}-all-roles">
                            <summary>All ${ROLES.length} professions, by area</summary>${ROLE_GROUPS.map((g) => `
                            <div class="${P}-role-group" data-group="${e(g.id)}">
                                <h3 class="${P}-role-group__title">${e(g.title)}</h3>
                                <ul class="${P}-role-list">${ROLES.filter((r) => r.group === g.id).map(role).join("")}
                                </ul>
                            </div>`).join("")}
                        </details>
                        <p class="ai-note" id="${P}-role-none" hidden>No profession matches. Describe your task above instead, or choose "Other ways to start" below.</p>`;

    /* a search looks through every profession: the suggested list hides while it runs, and the full list opens on its matches */
    function filter(text) {
        const q = text.trim().toLowerCase();
        const all = $("all-roles");
        const short = panel.querySelector(`.${P}-role-list--suggested`);
        short.hidden = Boolean(q);
        if (q) all.open = true;
        let any = false;
        for (const li of all.querySelectorAll(`.${P}-role-list li`)) {
            li.hidden = Boolean(q) && !li.textContent.toLowerCase().includes(q);
            any ||= !li.hidden;
        }
        for (const g of all.querySelectorAll(`.${P}-role-group`)) g.hidden = !g.querySelector("li:not([hidden])");
        $("role-none").hidden = any || !q;
    }
    $("role-search").addEventListener("input", (event) => filter(event.target.value));

    /* Enter sends the description, Shift and Enter starts a new line (as in a chat) */
    $("ask").addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            panel.querySelector(`[data-panel="ask"]`).click();
        }
    });

    /* the first screen: describe the task or choose a profession (panel-steps.js shows each later step) */
    panel.dataset.mode = h.guided ? "guided" : "full";
    const old = document.querySelector(`.${P}-progress`);
    if (old) old.hidden = h.guided;
    const other = (id, text) => `<p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="${id}">${text}</button></p>`;
    if (h.guided) {
        for (const id of ["unsure", "outcomes", "tasks", "guide-tasks", "details", "results", "bridge"]) $(id)?.classList.add(`${P}-off`);
        $("step-why").textContent = "Tell us what you want to accomplish. We'll help you build a professional prompt for your AI assistant.";
        $("steps").innerHTML = `<li aria-current="step">Start</li>`;
        $("panel-nav").innerHTML = other("full", "Other ways to start: an outcome, a playbook, a saved Work Pack or a project context pack");
    } else {
        $("panel-nav").innerHTML = other("guided", "Back to the guided steps");
    }

    /* the first press loads the steps; presses while they load are handled in order once they are here */
    let steps = null;
    let loaded = false;
    const load = () => (steps ??= import("./panel-steps.js").then((m) => {
        const api = m.initSteps({ ...h, filter });
        loaded = true;
        return api;
    }));
    const failed = () => {
        steps = null;
        h.announce("The next step could not be loaded. Check your connection and try again.", 0);
    };

    panel.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (loaded || !b || !panel.contains(b) || !(b.dataset.rolePick || b.dataset.panel)) return;
        load().then((api) => api.handle(b), failed);
    });

    /* a link named a task or a profession: continue from there */
    if (h.start) load().then((api) => api.begin(h.start), failed);

}
