/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the guided panel's steps (AI programme D20;
   one question at a time since 2026-11-19;
   docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md)

   Everything after the first screen. Each step replaces the one
   before it: the role, the task (one searchable list; typed words
   are also matched by task-index.js), then only the questions this
   task needs, one at a time (a choice moves on by itself, a typed
   answer with Continue or Skip), the tools where the task has
   them, and "Anything else we should know?" with the prompt's
   length, the visitor's experience and the AI product. "Generate
   my prompt" replaces the steps with the prompt and its actions:
   copy, edit, download, settings, Reuse selections and New prompt.
   The answers so far are a trail of buttons above the question;
   pressing one reopens it with its answer kept.

   The steps are the page's own form fields and pack (index.js),
   shown one at a time, so the form stays the one store of every
   answer. Loaded by panel.js on the first choice (D17). Nothing
   is sent anywhere and nothing is stored.
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { getRole } from "./roles.js";
import { OUTCOMES, getTask, getOutcome, tasksFor } from "./taxonomy.js";
import { activeQuestions } from "./compiler.js";
import { mountPicker, filterGroups } from "./picker.js";
import { NO_ROLE, ROLE_TITLE, ROLE_WHY, TASK_TITLE } from "./panel.js";

const label = (title) => title.replace(/^Testing: /, "").replace(/^./, (c) => c.toUpperCase());

/* the matcher loads with the first words typed into the task search (D17) */
const loadMatcher = () => import("./task-index.js");

const short = (text, n = 48) => {
    const t = String(text ?? "").replace(/\s+/g, " ").trim();
    return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

const GENERAL = "general-prompt";

const taskItem = (id) => {
    const t = getTask(id);
    return { id, label: label(t.title), keywords: getOutcome(t.outcome)?.title ?? "" };
};

/* every task, by outcome, for a visitor whose role is not listed and for searches */
const allGroups = () => OUTCOMES.filter((o) => o.id !== "unsure")
    .map((o) => ({ title: o.title, items: tasksFor(o.id).map((t) => taskItem(t.id)) }))
    .filter((g) => g.items.length);

/**
 * h: { P, form, state, chooseTask(taskId, prefill), setRole(roleId), answers(), reset(), update(), announce(text, delay), rolePicker }
 * Returns { handle(button), pickRole(id), setMode(mode), go(step), begin({ task, role }) }.
 */
export function initSteps(h) {

    const { P, form, state } = h;
    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");
    const formSection = form.closest("section");

    let current = "role";
    /* a profession id; "" when none is chosen or the visitor's role is not listed */
    let role = "";
    let roleChosen = false;
    /* the role changed to one that does not list the chosen task: the task is asked again, its answers kept */
    let taskStale = false;
    let generated = false;
    let promptSeen = false;
    let visited = new Set(["role"]);

    /* ---------- the steps of this journey, worked out from the answers so far ---------- */

    const groupOf = (key) => form.querySelector(`#${P}-questions [data-key="${CSS.escape(key)}"]`)?.closest(".calculator-form__group");
    const questionOf = (step) => step?.startsWith("q:") ? state.blueprint?.questions.find((q) => q.key === step.slice(2)) ?? null : null;

    function plan() {

        const steps = ["role", "task"];
        if (!state.blueprint || !state.taskId || taskStale) return steps;
        /* only the questions this task asks for these answers, in the blueprint's order; the deeper ones wait in the final step */
        steps.push(...activeQuestions(state.blueprint, h.answers()).filter((q) => !q.more).map((q) => `q:${q.key}`));
        if (!$("tools").hidden) steps.push("tools");
        steps.push("final");
        if (generated) steps.push("prompt");
        return steps;

    }

    function nodesOf(step) {

        if (step === "role") return [$("roles")];
        if (step === "task") return [$("guide-tasks")];
        if (step.startsWith("q:")) return [$("details"), groupOf(step.slice(2))];
        if (step === "tools") return [$("details"), $("tools")];
        if (step === "final") return [$("details"), $("final"), ...($("context-field").hidden ? [] : [$("bridge")])];
        return [$("results")];

    }

    /* everything a step can show; a guided step hides the rest */
    const parts = () => [$("unsure"), $("outcomes"), $("tasks"), $("roles"), $("guide-tasks"), $("details"), $("details-title"), $("details-title").nextElementSibling,
        ...form.querySelectorAll(`#${P}-questions > .calculator-form__group`), $("tools"), $("final"),
        form.querySelector(`#${P}-details > .calculator-form__actions`), $("results"), $("bridge"), formSection].filter(Boolean);

    const fieldsOf = (step) => nodesOf(step).filter((n) => n && n !== $("details") && n !== $("bridge"))
        .flatMap((n) => [...n.querySelectorAll("input:not([type=search]), textarea, select")]).filter((f) => !f.closest(`.${P}-full-only`));

    const filled = (f) => (f.type === "checkbox" || f.type === "radio") ? f.checked : Boolean(f.value.trim?.() ?? f.value) && !(f.tagName === "SELECT" && f.selectedIndex === 0);

    function answered(step) {

        if (step === "role") return roleChosen;
        if (step === "task") return Boolean(state.taskId) && !taskStale;
        if (step.startsWith("q:") || step === "tools") return fieldsOf(step).some(filled);
        return false;

    }

    /* ---------- words for the title, the trail and the buttons ---------- */

    function titleOf(step) {

        if (step === "role") return [ROLE_TITLE, ROLE_WHY];
        if (step === "task") return [TASK_TITLE, role ? "Choose one of the suggested tasks, or type a few words to search all of them. If nothing fits, choose \"Any other task\" and describe it in your own words." : "Choose a task from the list, or type a few words to search. If nothing fits, choose \"Any other task\" and describe it in your own words."];
        if (step.startsWith("q:")) {
            const q = questionOf(step);
            const why = q.essential ? "Needed for a useful prompt. If you leave it blank, the prompt asks the AI to request it from you before it starts."
                : q.kind === "select" ? "Choose one to continue, or skip it if it does not matter."
                    : "Optional. Skip it if it does not apply or you do not know yet.";
            return [q.label, why];
        }
        if (step === "tools") return ["Which tools do you use for this?", "Optional. The prompt will use your tools' own terms and steps."];
        if (step === "final") return ["Anything else we should know?", "Optional. Add details about your project and choose how long the prompt should be, your experience and the AI assistant. Then generate your prompt."];
        return ["Your prompt", "Copy it into your AI assistant, or edit it first. To change an answer, press it in the list above. Nothing is sent anywhere."];

    }

    const stepName = (step) => step === "role" ? "Role" : step === "task" ? "Task" : step === "tools" ? "Tools" : step === "final" ? "Final details" : step === "prompt" ? "Your prompt" : short(questionOf(step)?.label, 40);

    function answerOf(step) {

        if (step === "role") return role ? getRole(role).title : roleChosen ? "Role not listed" : "Choose a role";
        if (step === "task") return state.taskId && !taskStale ? label(getTask(state.taskId).title) : "Choose a task";
        if (step === "prompt") return "Your prompt";
        const fields = fieldsOf(step);
        if (step === "tools") {
            const chosen = fields.filter((x) => (x.type === "checkbox" || x.type === "radio") && x.checked)
                .map((x) => x.closest("label")?.querySelector("span, strong")?.textContent?.trim() || x.value);
            return chosen.length ? short(chosen.join(", ")) : "Skipped";
        }
        if (step === "final") {
            const n = fields.filter((x) => x.type !== "checkbox" && x.type !== "radio" && filled(x)).length;
            return n ? `${n} detail${n === 1 ? "" : "s"} added` : "Nothing added";
        }
        const x = fields.find(filled);
        if (!x) return questionOf(step)?.essential ? "Missing" : "Skipped";
        return short(x.tagName === "SELECT" ? x.options[x.selectedIndex].textContent : x.value);

    }

    /* ---------- the trail of answers: every step reached so far, the current one marked ---------- */

    function trail(steps) {

        const last = steps.reduce((m, s, i) => visited.has(s) ? i : m, 0);
        const shown = steps.slice(0, Math.max(last, steps.indexOf(current)) + 1);
        const nav = $("trail-nav");
        nav.hidden = shown.length < 2;
        $("trail").innerHTML = shown.map((s) => {
            if (s === current) return `<li><span class="${P}-trail__item ${P}-trail__item--current" aria-current="step"><span class="ai-sr-only">Current step: </span>${e(stepName(s))}</span></li>`;
            const a = answerOf(s);
            const quiet = ["Skipped", "Nothing added", "Missing", "Choose a role", "Choose a task"].includes(a);
            return `<li><button type="button" class="${P}-trail__item${quiet ? ` ${P}-trail__item--quiet` : ""}" data-panel-go="${e(s)}" title="${e(`${stepName(s)}: ${a}. Press to change.`)}"><span class="ai-sr-only">${e(stepName(s))}: </span>${e(a)}<span class="ai-sr-only">. Change</span></button></li>`;
        }).join("");
        /* on a phone the trail scrolls sideways inside itself: keep the current step in view */
        const list = $("trail");
        const at = list.querySelector("[aria-current]")?.parentElement;
        if (at && list.scrollWidth > list.clientWidth) list.scrollLeft = Math.max(0, at.offsetLeft - 24);

    }

    function nav(steps) {

        const i = steps.indexOf(current);
        const q = questionOf(current);
        const has = answered(current);
        const button = (id, text, extra = "") => `<button type="button" class="calculator-form__button${extra}" data-panel="${id}">${text}</button>`;
        const secondary = " calculator-form__button--secondary";

        /* a choice moves on by itself; Continue appears only where something is already chosen or typed */
        let primary = "";
        if (current === "final") primary = button("generate", "Generate my prompt");
        else if (current === "role" || current === "task") primary = has && steps[i + 1] ? button("next", "Continue") : "";
        else if (current !== "prompt") primary = button("next", has ? "Continue" : q?.essential ? "Skip for now" : "Skip", has ? "" : secondary);

        const html = `
                <div class="${P}-panel__buttons">
                    ${primary}
                    ${i > 0 ? button("back", "Back", secondary) : ""}
                    ${current !== "prompt" && (current !== "role" || roleChosen) ? button("restart", "New prompt", secondary) : ""}
                </div>
                <p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="full">${current === "role" ? "More ways to start: an outcome, a playbook, a saved Work Pack or a project context pack" : "Show everything on one page"}</button></p>`;
        /* redrawn only when it changes: a field's change event fires on the mousedown of a click on Continue */
        if ($("panel-nav").dataset.drawn !== html) {
            $("panel-nav").innerHTML = html;
            $("panel-nav").dataset.drawn = html;
        }

    }

    /* a choice question is answered with one press, like the role and the task */
    function picks(step) {

        const group = step.startsWith("q:") && groupOf(step.slice(2));
        const select = group && group.querySelector("select");
        if (!select) return;
        group.dataset.panelQ = "";
        let box = group.querySelector(`.${P}-pick`);
        if (!box) {
            box = document.createElement("div");
            box.className = `${P}-pick`;
            box.setAttribute("role", "group");
            box.setAttribute("aria-labelledby", `${P}-step-title`);
            select.after(box);
        }
        box.innerHTML = [...select.options].filter((o) => o.value).map((o) => `<button type="button" class="${P}-role" data-pick="${e(o.value)}" aria-pressed="${o.value === select.value}">${e(o.textContent)}</button>`).join("");

    }

    /* the result's summary, what is still missing and the two ways to go again */
    function result() {

        const task = getTask(state.taskId);
        $("result-sum").textContent = [role ? getRole(role).title : "", task ? label(task.title) : ""].filter(Boolean).join(" · ");
        const missing = plan().filter((s) => s.startsWith("q:") && questionOf(s).essential && !answered(s));
        $("result-missing").innerHTML = missing.length ? `
                        <p class="ai-note">Marked <code>[add: …]</code> in the prompt, so the AI asks you for ${missing.length === 1 ? "it" : "them"}. Answer here instead:</p>
                        <p class="${P}-result-missing__list">${missing.map((s) => `<button type="button" class="calculator-form__button calculator-form__button--secondary" data-panel-go="${e(s)}">${e(questionOf(s).label)}</button>`).join("")}</p>` : "";
        $("result-again").innerHTML = `
                        <button type="button" class="calculator-form__button calculator-form__button--secondary" data-panel="reuse">Reuse selections</button>
                        <button type="button" class="calculator-form__button calculator-form__button--secondary" data-panel="restart">New prompt</button>`;

    }

    /* ---------- showing a step ---------- */

    function go(step, { focus = true } = {}) {

        const steps = plan();
        current = steps.includes(step) ? step : steps.includes(current) ? current : steps[0];
        visited.add(current);
        state.quiet = current !== "prompt";

        if (panel.dataset.mode === "guided") {
            const keep = new Set([...nodesOf(current), ...(current === "prompt" ? [] : [formSection])].filter(Boolean));
            for (const part of parts()) part.classList.toggle(`${P}-off`, !keep.has(part));
            for (const g of form.querySelectorAll("[data-panel-q]")) delete g.dataset.panelQ;
            if (current.startsWith("q:")) groupOf(current.slice(2)).dataset.panelQ = "";
            picks(current);
        }
        panel.dataset.step = current.split(":")[0];

        /* the prompt opens on the prompts; "Everything" is one press away */
        if (current === "prompt") {
            if (!promptSeen) {
                promptSeen = true;
                state.view = "prompts";
            }
            h.update();
            result();
        }

        const [title, why] = titleOf(current);
        $("step-title").textContent = title;
        $("step-why").textContent = why;
        /* the task step says which role it is suggesting for, with a way back to change it */
        if (current === "task") {
            $("chosen-role").innerHTML = role
                ? `Your role: <strong>${e(getRole(role).title)}</strong> <button type="button" class="${P}-linkish" data-panel-go="role">Change role</button>`
                : `Your role is not listed, so every task is shown. <button type="button" class="${P}-linkish" data-panel-go="role">Choose a role</button>`;
        }
        trail(steps);
        nav(steps);

        if (focus) {
            $("step-title").focus({ preventScroll: true });
            keepHeadInView();
            requestAnimationFrame(keepHeadInView);
        }

    }

    /* the trail and the question start below the sticky bars, never under them (on a phone the section menu is one of them) */
    function keepHeadInView() {
        const bars = [...document.querySelectorAll("header, nav")].filter((el) => {
            const position = getComputedStyle(el).position;
            const box = el.getBoundingClientRect();
            return (position === "sticky" || position === "fixed") && box.top <= 1 && box.width > innerWidth * 0.6;
        });
        const covered = Math.max(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0, ...bars.map((el) => el.getBoundingClientRect().bottom));
        const top = $("panel-head").getBoundingClientRect().top;
        if (top < covered + 4) window.scrollBy(0, top - covered - 8);
    }

    const move = (by) => {
        const steps = plan();
        const next = steps[steps.indexOf(current) + by];
        if (next) go(next);
    };

    /* ---------- the task list: the role's tasks, every task on a search ---------- */

    function taskGroups() {

        const r = getRole(role);
        return r
            ? [{ title: `Suggested for ${r.title}`, items: [...r.tasks.filter((id) => id !== GENERAL), GENERAL].map(taskItem) }]
            : allGroups();

    }

    async function searchTasks(query, mine) {

        const seen = new Set();
        const fresh = (items) => items.filter((it) => !seen.has(it.id) && seen.add(it.id));
        const groups = [];
        let matched = { tasks: [], utilities: [] };
        try {
            matched = (await loadMatcher()).matchTasks(query);
        } catch {
            /* the plain search below still works */
        }
        /* among the closest, the role's own tasks come first (an "API" search by a tester leads with API tests) */
        const mineIds = new Set(getRole(role)?.tasks ?? []);
        const closest = fresh([...matched.tasks].sort((a, b) => Number(!mineIds.has(a.id)) - Number(!mineIds.has(b.id))).map((t) => taskItem(t.id)));
        if (closest.length) groups.push({ title: "Best matches", items: closest });
        for (const g of mine) {
            const items = fresh(g.items);
            if (items.length) groups.push({ ...g, items });
        }
        const others = fresh(filterGroups(allGroups(), query).flatMap((g) => g.items));
        if (others.length) groups.push({ title: getRole(role) ? "All other tasks" : "More tasks", items: others });
        if (!seen.has(GENERAL)) groups.push({ title: "Not in the list", items: [taskItem(GENERAL)] });

        $("task-tools").innerHTML = matched.utilities.length
            ? `Already have an answer, or looking for an AI product? ${matched.utilities.map((u) => `<a href="${e(u.route)}">${e(u.title)}</a>`).join(" · ")}`
            : "";
        return groups;

    }

    const taskPicker = mountPicker($("task-picker"), {
        id: `${P}-task-input`,
        labelledBy: `${P}-step-title`,
        placeholder: "Search or choose a task",
        hint: "You can also open the list and move through it with the arrow keys.",
        groups: taskGroups,
        search: searchTasks,
        empty: () => "Nothing matches.",
        onPick: (id, { query }) => pickTask(id, query),
        announce: (text) => h.announce(text)
    });

    /* ---------- choices ---------- */

    function pickRole(id) {

        const next = id === NO_ROLE ? "" : id;
        if (next && !getRole(next)) return;
        roleChosen = true;
        role = next;
        state.profession = role;
        h.rolePicker.setCurrent(id);
        if (role) h.setRole(role);
        else $("role").value = "";
        /* a chosen task the new role does not list is asked again; its answers stay in the form until another task is chosen */
        if (state.taskId && role && !getRole(role).tasks.includes(state.taskId)) {
            taskStale = true;
            generated = false;
            visited = new Set(["role"]);
        }
        $("task-tools").textContent = "";
        go("task");
        h.announce(role ? `Role set to ${getRole(role).title}. ${getRole(role).tasks.length} tasks are suggested.` : "Every task is listed.", 0);

    }

    async function pickTask(id, query = "") {

        if (!getTask(id)) return;
        if (id !== state.taskId) {
            /* answers whose questions the new task also asks are carried over, shown in their own steps; nothing else is */
            const kept = Object.fromEntries(Object.entries(h.answers()).filter(([, v]) => v));
            await h.chooseTask(id, Object.keys(kept).length ? { answers: kept, onlyEmpty: true, message: `${getTask(id).title}: answers it shares with the previous task were kept.` } : null);
            if (state.taskId !== id) return;
            generated = false;
            visited = new Set(["role", "task"]);
        }
        taskStale = false;
        taskPicker.setCurrent(id);
        if (role) h.setRole(role);
        /* words typed to find the task answer its first essential question, where that is still empty */
        if (query.split(/\s+/).filter(Boolean).length >= 3) {
            const first = state.blueprint.questions.find((q) => q.essential && q.kind !== "select" && !q.more);
            const field = first && form.querySelector(`#${P}-questions [data-key="${CSS.escape(first.key)}"]`);
            if (field && !field.value.trim()) {
                field.value = query.slice(0, field.maxLength > 0 ? field.maxLength : 300);
                h.update();
            }
        }
        const steps = plan();
        go(steps[steps.indexOf("task") + 1] ?? "final");

    }

    function generate() {

        const error = $("final-error");
        error.textContent = "";
        try {
            state.quiet = true;
            h.update();
        } catch {
            error.textContent = "The prompt could not be written. Your answers are kept: press Generate my prompt again.";
            return;
        }
        const pack = state.pack;
        if (!pack || pack.state === "empty") {
            const first = plan().find((s) => s.startsWith("q:"));
            error.innerHTML = `Answer at least one question first, so the prompt is about your work.${first ? ` <button type="button" class="${P}-linkish" data-panel-go="${e(first)}">Go to: ${e(questionOf(first).label)}</button>` : ""}`;
            return;
        }
        generated = true;
        go("prompt");
        h.announce(`Your prompt is ready: ${state.pack.promptWords} words.${state.pack.missing.length ? ` ${state.pack.missing.length} essential${state.pack.missing.length === 1 ? " is" : "s are"} marked to add.` : ""}`, 0);

    }

    /* the next prompt with the same role, task, answers and preferences; the project's own details and any edit are cleared */
    function reuse() {

        state.edit = null;
        $("project").value = "";
        for (const el of form.querySelectorAll("[data-cs]")) el.value = "";
        $("final-error").textContent = "";
        generated = false;
        promptSeen = false;
        h.update();
        visited = new Set(plan());
        go("task");
        h.announce("Reusing your selections. Your role, task, answers and preferences are kept; the project details were cleared. Change anything, then generate again.", 0);

    }

    function restart() {

        h.reset();
        role = "";
        roleChosen = false;
        taskStale = false;
        generated = false;
        promptSeen = false;
        visited = new Set(["role"]);
        state.profession = "";
        h.rolePicker.clear();
        taskPicker.clear();
        $("task-tools").textContent = "";
        setMode("guided", false);
        go("role");
        h.announce("New prompt. Choose your role.", 0);

    }

    function setMode(mode, focus = true) {

        panel.dataset.mode = mode;
        const old = document.querySelector(`.${P}-progress`);
        if (old) old.hidden = mode === "guided";
        if (mode === "full") {
            state.quiet = false;
            for (const part of parts()) part.classList.remove(`${P}-off`);
            $("panel-nav").innerHTML = `<p class="${P}-panel__other"><button type="button" class="${P}-linkish" data-panel="guided">Back to the guided steps</button></p>`;
            $("panel-nav").dataset.drawn = "";
            return;
        }
        go(state.blueprint && !taskStale ? (visited.has(current) && current !== "role" ? current : plan()[2] ?? "final") : roleChosen ? "task" : "role", { focus });

    }

    /* ---------- events ---------- */

    function handle(b) {

        if (b.dataset.panelGo) {
            const step = b.dataset.panelGo;
            if (step === "prompt") generate();
            else go(step);
        } else if (b.dataset.pick !== undefined) {
            const select = b.closest(".calculator-form__group").querySelector("select");
            select.value = b.dataset.pick;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            move(1);
        } else if (b.dataset.panel === "back") move(-1);
        else if (b.dataset.panel === "next") move(1);
        else if (b.dataset.panel === "generate") generate();
        else if (b.dataset.panel === "reuse") reuse();
        else if (b.dataset.panel === "restart") restart();
        else if (b.dataset.panel === "full") {
            setMode("full");
            $(state.blueprint ? "details-title" : "describe").focus();
        } else if (b.dataset.panel === "guided") setMode("guided");

    }

    panel.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (b && panel.contains(b)) handle(b);
    });

    /* the buttons follow the answers: Skip becomes Continue once something is typed or chosen */
    const follow = () => panel.dataset.mode === "guided" && nav(plan());
    form.addEventListener("input", follow);
    form.addEventListener("change", follow);

    /* Enter in a one-line answer moves on, as Continue does */
    form.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.isComposing || panel.dataset.mode !== "guided" || !current.startsWith("q:")) return;
        if (event.target.matches("input[type=text]") && groupOf(current.slice(2))?.contains(event.target)) {
            event.preventDefault();
            move(1);
        }
    });

    /* the context review's Change links, in the guided panel: the step that holds the answer */
    state.goTo = (target) => {
        const steps = plan();
        const missing = steps.find((s) => s.startsWith("q:") && questionOf(s).essential && !answered(s));
        go({ role: "role", outcomes: "task", tools: "tools", experience: "final" }[target] ?? missing ?? steps.find((s) => s.startsWith("q:")) ?? "final");
    };

    /* a link named a task (and perhaps a profession), or only a profession */
    async function begin({ task = "", role: roleId = "" } = {}) {

        if (roleId && getRole(roleId)) {
            role = roleId;
            roleChosen = true;
            state.profession = roleId;
            h.rolePicker.setCurrent(roleId);
        }
        if (task && getTask(task)) await pickTask(task);
        else if (role) go("task", { focus: false });

    }

    return { handle, pickRole, setMode, go, begin };

}
