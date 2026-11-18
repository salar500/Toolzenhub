/* =========================================================
   ToolZen Hub
   AI Workbench: the guided panel's steps (AI programme D20;
   docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md)

   Everything after the first screen: that profession's tasks, only
   the questions the task needs (an essential answer or a choice
   gets its own step, the rest share one optional step), the tools,
   the visitor and their project, the AI product and the prompt;
   Back, Continue, Skip, Clear, Start over and the full page. The
   steps are the page's own form fields and pack, shown one group
   at a time. Loaded by panel.js on the first press in the panel,
   so the page's first load carries only the professions (D17).
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { ROLES, getRole } from "./roles.js";
import { getTask } from "./taxonomy.js";
import { activeQuestions } from "./compiler.js";

const STAGES = { role: "Role", task: "Task", q: "Details", optional: "Details", tools: "Tools", you: "You", ai: "AI", prompt: "Prompt" };

const label = (title) => title.replace(/^Testing: /, "").replace(/^./, (c) => c.toUpperCase());

/**
 * h: { P, form, state, chooseTask(taskId, prefill), setRole(roleId), answers(), reset(), update(), announce(text, delay), filter(text) }
 * The first screen is already drawn by panel.js. Returns { handle(button), setMode(mode), go(step) }.
 */
export function initSteps(h) {

    const { P, form, state } = h;
    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");
    const formSection = form.closest("section");
    let current = "role";
    let role = "";
    let promptSeen = false;

    /* ---------- the steps of this journey, worked out from the answers so far ---------- */

    const groupOf = (key) => form.querySelector(`#${P}-questions [data-key="${CSS.escape(key)}"]`)?.closest(".calculator-form__group");

    function plan() {

        const steps = ["role"];
        if (role) steps.push("task");
        if (!state.blueprint) return steps;
        if (!role) steps.push("task");

        const shown = activeQuestions(state.blueprint, h.answers());
        const own = shown.filter((q) => !q.more && (q.essential || q.kind === "select"));
        steps.push(...own.map((q) => `q:${q.key}`));
        if (shown.some((q) => !own.includes(q))) steps.push("optional");
        if (!$("tools").hidden) steps.push("tools");
        steps.push("you", "ai", "prompt");

        return steps;

    }

    const optionalKeys = () => {
        const own = new Set(plan().filter((s) => s.startsWith("q:")).map((s) => s.slice(2)));
        return activeQuestions(state.blueprint, h.answers()).filter((q) => !own.has(q.key));
    };

    function nodesOf(step) {

        if (step === "role") return [$("roles")];
        if (step === "task") return [$("guide-tasks")];
        if (step.startsWith("q:")) return [$("details"), groupOf(step.slice(2))];
        if (step === "optional") {
            const keys = optionalKeys();
            const more = form.querySelector(`.${P}-more`);
            if (more && keys.some((q) => q.more)) more.open = true;
            return [$("details"), ...keys.map((q) => groupOf(q.key)), ...(keys.some((q) => q.more) ? [more] : [])];
        }
        if (step === "tools") return [$("details"), $("tools")];
        if (step === "you") {
            const about = form.querySelector(`.${P}-context`);
            about.open = true;
            return [$("details"), about, ...($("consistency").hidden ? [] : [$("consistency")])];
        }
        if (step === "ai") return [$("details"), $("products")];
        return [$("results")];

    }

    /* everything a step can show; a guided step hides the rest */
    const parts = () => [$("unsure"), $("outcomes"), $("tasks"), $("roles"), $("guide-tasks"), $("details"), $("details-title"), $("details-title").nextElementSibling,
        ...form.querySelectorAll(`#${P}-questions > .calculator-form__group, .${P}-more`), $("tools"), $("consistency"), form.querySelector(`.${P}-context`),
        $("products"), form.querySelector(`#${P}-details > .calculator-form__actions`), $("results"), formSection].filter(Boolean);

    /* ---------- showing a step ---------- */

    function titleOf(step) {

        const task = getTask(state.taskId);
        if (step === "role") return ["What is your role?", `All ${ROLES.length} professions the Workbench supports. Choose yours to see the tasks that are part of that work.`];
        if (step === "task") return ["What do you want to accomplish?", role ? `Tasks of a ${getRole(role).title.toLowerCase()}. Choose one; you can come back and change it.` : "Choose your role first, or change the task on the full page."];
        if (step.startsWith("q:")) {
            const q = state.blueprint.questions.find((x) => x.key === step.slice(2));
            return [q.label, `${task ? `${label(task.title)}. ` : ""}${q.essential ? "Essential: it goes into the prompt. Leave it empty and the prompt asks the AI to ask you for it." : "Choose one, or skip it if you do not know."}`];
        }
        if (step === "optional") return ["Anything else that helps? (optional)", "Fill in what you know and leave the rest empty; nothing is guessed in its place."];
        if (step === "tools") return ["Which tools do you use for this?", "Optional. The prompt then works the way your tools do: their terms, steps and what to share."];
        if (step === "you") return ["About you and your project (optional)", "Your experience shapes the explanations. Pasted notes are used as material, never as instructions to the AI."];
        if (step === "ai") return ["Where will you use the prompt?", "Products from the AI Directory for this task, not a ranking. The prompt works in any capable assistant; you can also name your own."];
        return ["Your prompt", "Copy the master prompt into your AI product. Change the detail, refine it, or go back to change any answer; nothing is sent anywhere."];

    }

    /* a choice question is answered with one press, like the role and the task */
    function picks(step) {

        if (!step.startsWith("q:")) return;
        const key = step.slice(2);
        const group = groupOf(key);
        const select = group?.querySelector("select");
        if (!select) return;
        group.dataset.panelQ = "";
        let box = group.querySelector(`.${P}-pick`);
        if (!box) {
            box = document.createElement("div");
            box.className = `${P}-pick`;
            box.setAttribute("role", "group");
            box.setAttribute("aria-label", select.labels?.[0]?.textContent ?? key);
            select.after(box);
        }
        box.innerHTML = [...select.options].filter((o) => o.value).map((o) => `<button type="button" class="${P}-role" data-pick="${e(o.value)}" aria-pressed="${o.value === select.value}">${e(o.textContent)}</button>`).join("");

    }

    function nav(steps) {

        const i = steps.indexOf(current);
        /* the role and the task are chosen with one press; every later step moves on with Continue, or Skip while it is empty */
        const pressed = current === "role" || current === "task" || current === "prompt";
        const fields = current === "role" || current === "task" ? [] : nodesOf(current).filter((n) => n && n !== $("details")).flatMap((n) => [...n.querySelectorAll("input:not([type=search]), textarea, select")]);
        const empty = fields.every((f) => (f.type === "checkbox" || f.type === "radio") ? !f.checked : !f.value || (f.tagName === "SELECT" && f.selectedIndex === 0));
        const button = (id, text, extra = "") => `<button type="button" class="calculator-form__button${extra}" data-panel="${id}">${text}</button>`;
        const secondary = " calculator-form__button--secondary";

        /* redrawn only when it changes: a field's change event fires on the mousedown of a click on Continue */
        const html = `
                <div class="${P}-panel__buttons">
                    ${i > 0 ? button("back", "Back", secondary) : ""}
                    ${pressed ? "" : button("next", empty ? "Skip" : "Continue")}
                    ${fields.length && current !== "prompt" && !empty ? button("clear", "Clear this step", secondary) : ""}
                    ${current !== "role" ? button("restart", "Start over", secondary) : ""}
                </div>
                <p class="${P}-panel__other">${current === "role" ? `<button type="button" class="${P}-linkish" data-panel="full">Other ways to start: describe your task, a playbook, a saved Work Pack or all tasks by outcome</button>` : `<button type="button" class="${P}-linkish" data-panel="full">Show everything on one page</button>`}</p>`;
        if ($("panel-nav").dataset.drawn !== html) {
            $("panel-nav").innerHTML = html;
            $("panel-nav").dataset.drawn = html;
        }

    }

    function show(step, { focus = true } = {}) {

        const steps = plan();
        current = steps.includes(step) ? step : steps[Math.min(steps.length - 1, 1)] ?? "role";

        if (panel.dataset.mode === "guided") {
            const keep = new Set([...nodesOf(current), ...(current === "prompt" ? [] : [formSection])].filter(Boolean));
            for (const part of parts()) part.classList.toggle(`${P}-off`, !keep.has(part));
            for (const g of form.querySelectorAll("[data-panel-q]")) delete g.dataset.panelQ;
            if (current.startsWith("q:")) groupOf(current.slice(2)).dataset.panelQ = "";
            picks(current);
        }

        /* the prompt step opens on the prompts; "Everything" is one press away */
        if (current === "prompt" && !promptSeen) {
            promptSeen = true;
            state.view = "prompts";
            h.update();
        }

        const [title, why] = titleOf(current);
        $("step-title").textContent = title;
        $("step-why").textContent = why;

        /* the progress names the kinds of step this journey has, in order, never a fixed count */
        const stages = [...new Set(steps.map((s) => STAGES[s.split(":")[0]]))];
        const at = STAGES[current.split(":")[0]];
        $("steps").innerHTML = stages.map((s, n) => `<li${s === at ? ` aria-current="step"` : ""} data-done="${n < stages.indexOf(at)}">${e(s)}</li>`).join("");

        nav(steps);

        if (focus) {
            $("step-title").focus({ preventScroll: true });
            if ($("panel-head").getBoundingClientRect().top < 0) $("panel-head").scrollIntoView({ block: "start" });
        }

    }

    const move = (by) => {
        const steps = plan();
        const next = steps[steps.indexOf(current) + by];
        if (next) show(next);
    };

    /* ---------- choices ---------- */

    function taskList() {

        const r = getRole(role);
        $("guide-task-list").innerHTML = r ? r.tasks.map(getTask).filter(Boolean).map((t) => `
                            <button type="button" class="${P}-role ${P}-role--task" data-guide-task="${e(t.id)}" aria-pressed="${t.id === state.taskId}">${e(label(t.title))}</button>`).join("") : "";

    }

    function pickRole(id) {

        role = id;
        state.profession = id;
        for (const b of panel.querySelectorAll("[data-role-pick]")) b.setAttribute("aria-pressed", String(b.dataset.rolePick === id));
        taskList();
        /* a task already chosen stays, with its answers, when the new profession has it too */
        if (state.taskId && getRole(id).tasks.includes(state.taskId)) h.setRole(id);
        show("task");
        h.announce(`${getRole(id).title}: ${getRole(id).tasks.length} tasks listed.`, 0);

    }

    async function pickTask(id) {

        if (id !== state.taskId) {
            /* answers whose questions the new task also asks are carried over; nothing else is */
            const kept = Object.fromEntries(Object.entries(h.answers()).filter(([, v]) => v));
            await h.chooseTask(id, Object.keys(kept).length ? { answers: kept, onlyEmpty: true, message: `${getTask(id).title}: answers it shares with the previous task were kept.` } : null);
            if (state.taskId !== id) return;
        }
        if (role) h.setRole(role);
        taskList();
        const steps = plan();
        show(steps[steps.indexOf("task") + 1] ?? "prompt");

    }

    function clearStep() {

        for (const n of nodesOf(current)) {
            if (!n || n === $("details")) continue;
            for (const f of n.querySelectorAll("input:not([type=search]), textarea, select")) {
                if (f.type === "checkbox" || f.type === "radio") f.checked = false;
                else if (f.tagName === "SELECT") f.selectedIndex = 0;
                else f.value = "";
            }
        }
        h.update();
        show(current);
        h.announce("This step was cleared.", 0);

    }

    function setMode(mode, focus = true) {

        panel.dataset.mode = mode;
        const old = document.querySelector(`.${P}-progress`);
        if (old) old.hidden = mode === "guided";
        if (mode === "full") {
            for (const part of parts()) part.classList.remove(`${P}-off`);
            $("panel-nav").innerHTML = `<p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="guided">Back to the guided steps</button></p>`;
            $("panel-nav").dataset.drawn = "";
            return;
        }
        show(state.blueprint ? plan().find((s) => s.startsWith("q:") || s === "optional" || s === "tools") ?? "you" : role ? "task" : "role", { focus });

    }

    /* ---------- events ---------- */

    function handle(b) {

        if (b.dataset.rolePick) pickRole(b.dataset.rolePick);
        else if (b.dataset.guideTask) pickTask(b.dataset.guideTask);
        else if (b.dataset.pick !== undefined) {
            const select = b.closest(".calculator-form__group").querySelector("select");
            select.value = b.dataset.pick;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            move(1);
        } else if (b.dataset.panel === "back") move(-1);
        else if (b.dataset.panel === "next") move(1);
        else if (b.dataset.panel === "clear") clearStep();
        else if (b.dataset.panel === "restart") {
            h.reset();
            role = "";
            promptSeen = false;
            state.profession = "";
            $("role-search").value = "";
            h.filter("");
            for (const x of panel.querySelectorAll("[data-role-pick]")) x.setAttribute("aria-pressed", "false");
            $("guide-task-list").innerHTML = "";
            setMode("guided");
            show("role");
            h.announce("Started over. Choose your role.", 0);
        } else if (b.dataset.panel === "full") {
            setMode("full");
            $(state.blueprint ? "details-title" : "describe").focus();
        } else if (b.dataset.panel === "guided") setMode("guided");

    }

    panel.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (b && panel.contains(b)) handle(b);
    });

    /* the navigation follows the answers: Continue becomes Skip on an empty optional step, Clear appears once something is filled */
    form.addEventListener("input", () => panel.dataset.mode === "guided" && nav(plan()));
    form.addEventListener("change", () => panel.dataset.mode === "guided" && nav(plan()));

    return { handle, setMode, go: show };

}
