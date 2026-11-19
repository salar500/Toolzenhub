/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the guided panel, first screen (AI
   programme D20; one question at a time since 2026-11-19;
   docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md)

   What the page needs when it opens: "What best describes your
   role?" and one searchable list of every profession, grouped by
   area, with "My role is not listed" at its end. Choosing one
   moves on. The box is in the page's markup; the list's script
   (picker.js) and its data (roles.js) load when the box is first
   used. Everything after it (the task, its questions, the
   final details, the prompt and the trail of answers) is
   panel-steps.js, loaded on the first choice, so the first load
   stays within D17. A task or profession link continues in the
   panel; an outcome, a describe start or the context pack open
   the full page.
========================================================= */

/* the role list's last choice: no profession, so every task is offered */
export const NO_ROLE = "none";

/* the number of professions in roles.js, for the hint the page opens with; roles.js itself loads with the list (D17).
   tests/unit/prompt-builder-flow.test.mjs keeps the two equal */
export const ROLE_COUNT = 22;

/** roles: the roles.js module */
export const roleGroups = ({ ROLE_GROUPS, ROLES }) => [
    ...ROLE_GROUPS.map((g) => ({ title: g.title, items: ROLES.filter((r) => r.group === g.id).map((r) => ({ id: r.id, label: r.title, note: `${r.tasks.length} tasks` })) })),
    { title: "Not listed", items: [{ id: NO_ROLE, label: "My role is not listed", note: "every task", keywords: "other none skip" }] }
];

/* the first question's list, also drawn into the page's markup by index.js */
export const ROLE_PICKER = {
    id: "wb-role-input",
    labelledBy: "wb-step-title",
    placeholder: "Search or choose your role",
    hint: `${ROLE_COUNT} professions. Type to search, or open the list and use the arrow keys.`
};

/* the first screen's way to the one-page form, also in the page's markup */
export const MORE_WAYS = "More ways to start: an outcome, a playbook, a saved Work Pack or a project context pack";

/** h: as panel-steps.js initSteps, plus guided (start on the first screen, or on the full page) and start ({ task, role } from a link). */
export function initPanel(h) {

    const { P } = h;
    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");

    /* the first press loads the steps; a choice made while they load is handled once they are here */
    let steps = null;
    let loaded = false;
    let rolePicker = null;
    let picker = null;

    /* the list's behaviour loads on the box's first use (D17); what was pressed or typed meanwhile is applied when it arrives */
    const input = $("role-input");
    let wantOpen = false;
    const mount = () => (picker ??= Promise.all([import("./picker.js"), import("./roles.js")]).then(([{ mountPicker }, roles]) => {
        rolePicker = mountPicker($("role-picker"), {
            ...ROLE_PICKER,
            groups: () => roleGroups(roles),
            empty: () => "No profession matches. Choose \"My role is not listed\" to see every task.",
            onPick: (id) => load().then((api) => api.pickRole(id), failed),
            announce: (text) => h.announce(text)
        });
        if (document.activeElement === input && (wantOpen || input.value)) rolePicker.open();
        return rolePicker;
    }, (error) => {
        picker = null;
        h.announce("The list could not be loaded. Check your connection and try again.", 0);
        throw error;
    }));
    const early = (event) => {
        if (rolePicker) return;
        if (event.type === "pointerdown" || event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter") wantOpen = true;
        if (event.key === "Enter") event.preventDefault();
        mount().catch(() => {});
    };
    for (const type of ["focus", "pointerdown", "keydown"]) input.addEventListener(type, early);
    /* the box was pressed before this script arrived (a slow connection): open the list now rather than lose the press */
    if (document.activeElement === input) {
        wantOpen = true;
        mount().catch(() => {});
    }

    const load = () => (steps ??= Promise.all([import("./panel-steps.js"), mount()]).then(([m, rp]) => {
        const api = m.initSteps({ ...h, rolePicker: rp });
        loaded = true;
        return api;
    }));
    const failed = () => {
        steps = null;
        h.announce("The next step could not be loaded. Check your connection and try again.", 0);
    };

    panel.dataset.mode = h.guided ? "guided" : "full";
    const old = document.querySelector(`.${P}-progress`);
    if (old) old.hidden = h.guided;
    const other = (id, text) => `<p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="${id}">${text}</button></p>`;
    if (h.guided) {
        for (const id of ["unsure", "outcomes", "tasks", "guide-tasks", "details", "results", "bridge"]) $(id)?.classList.add(`${P}-off`);
        $("panel-nav").innerHTML = other("full", MORE_WAYS);
    } else {
        /* the page is drawn ready for the guided steps (so nothing moves as it starts); the one-page form shows everything */
        for (const el of panel.querySelectorAll(`.${P}-off`)) el.classList.remove(`${P}-off`);
        $("panel-nav").innerHTML = other("guided", "Back to the guided steps");
    }

    panel.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (loaded || !b || !panel.contains(b) || !b.dataset.panel) return;
        load().then((api) => api.handle(b), failed);
    });

    /* a link named a task or a profession: continue from there */
    if (h.start) load().then((api) => api.begin(h.start), failed);

}
