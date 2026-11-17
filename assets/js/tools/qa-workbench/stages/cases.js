/* =========================================================
   ToolZen Hub
   QA Workbench, stage 3: Test cases. Ordered steps, the criteria a
   case tests, and the optional AI help: a request to copy, the
   hand-offs to the AI Workbench and the Output Reviewer (QD25,
   QD26), and the AI's table read back as suggestions that wait for
   acceptance (QD8). ai.js is fetched when the stage opens, so a
   hand-off link puts its payload on the click itself.
========================================================= */

import * as M from "../model.js";
import { latestRuns } from "../metrics.js";
import { put } from "../../ai-tools/common/handoff.js";
import { P, e, opt, choicesOf, btn, plural, heading, note, form, grid, toolbar, empty, search, filter, stateFilter, textInput, textArea, select, formEnd, rowActions, routeOf, nextId, showErrors, redrawTo } from "./ui.js";
import { records } from "./records.js";

const L = M.LABELS;
const choices = choicesOf(L);

let ai = null;
const loadAi = async () => (ai ??= await import("../ai.js"));

export const after = () => {
    loadAi();
};

const steplist = (steps) => `<ol class="${P}-steplist">${steps.map((x) => `<li>${e(x.action)}${x.expected ? `<br><span class="ai-note">Expected: ${e(x.expected)}</span>` : ""}</li>`).join("")}</ol>`;

function stepRow(step = { action: "", expected: "" }) {

    const id = nextId("s");

    return `<li class="${P}-step"><div class="calculator-form__group"><label class="calculator-form__label" for="${id}a">Action</label><textarea id="${id}a" name="step-action" class="calculator-form__input ai-textarea" rows="2" maxlength="${M.MAX.step}">${e(step.action)}</textarea></div><div class="calculator-form__group"><label class="calculator-form__label" for="${id}e">Expected result of this step</label><textarea id="${id}e" name="step-expected" class="calculator-form__input ai-textarea" rows="2" maxlength="${M.MAX.step}">${e(step.expected)}</textarea></div><div class="qa-actions qa-actions--small">${btn("step-up", "Move up")}${btn("step-down", "Move down")}${btn("step-remove", "Remove step")}</div></li>`;

}

function coversBox(p, chosen) {

    const groups = p.requirements.filter((r) => r.state === "active").map((r) => {
        const list = M.criteriaOf(p, r.id).filter((c) => c.state === "active");
        return list.length ? `<fieldset class="${P}-covers__group"><legend>${e(r.id)} ${e(r.title)}</legend>${list.map((c) => `<label class="${P}-check"><input type="checkbox" name="covers" value="${e(c.id)}"${chosen.includes(c.id) ? " checked" : ""}> <span><strong>${e(c.id)}</strong> ${e(c.text)}${c.status === "accepted" ? "" : ` (${e(L[c.status])})`}</span></label>`).join("")}</fieldset>` : "";
    }).join("");

    return `<div class="${P}-covers qa-wide"><p class="calculator-form__label">Acceptance criteria this case tests</p>${groups || note("No active criteria yet. Add them in Requirements; you can map later in Coverage.")}</div>`;

}

function caseForm(p, t = {}, suggestion = -1) {

    const chosen = t.id ? M.mappingsOfCase(p, t.id).map((m) => m.acId) : (t.acIds ?? []);
    const fromAi = suggestion >= 0;

    return form("tc", `<h3>${t.id ? `Edit ${e(t.id)}` : fromAi ? "Review the AI suggestion" : "New test case"}</h3>${fromAi ? note("Suggested by an AI. Check every field; it is added only when you save it.") : ""}${grid(
        textInput("title", "Title", t.title, { required: true }),
        select("priority", "Priority", choices(M.PRIORITIES, t.priority ?? "medium")),
        select("type", "Type", choices(M.CASE_TYPES, t.type ?? "", "Not set")),
        textInput("area", "Area or level", t.area, { max: M.MAX.short, hint: "Optional, for example \"API\" or \"UI\"." }),
        textArea("objective", "Objective", t.objective, { rows: 2 }),
        textArea("pre", "Preconditions", t.pre, { rows: 2 }),
        textArea("data", "Test data", t.data, { rows: 2 })
    )}<fieldset class="${P}-steps-box"><legend>Steps, in order (required)</legend><ol class="${P}-steps">${(t.steps?.length ? t.steps : [{ action: "", expected: "" }]).map(stepRow).join("")}</ol>${btn("step-add", "Add a step")}<span class="qa-error" data-error-for="steps" hidden></span></fieldset>${grid(
        textArea("expected", "Expected result of the case", t.expected, { hint: "Required unless a step has its expected result." }),
        textInput("automation", "Automation reference", t.automation, { hint: "Optional: a script, spec or status, for example \"checkout.spec.ts\"." }),
        coversBox(p, chosen)
    )}${formEnd(t.id ? "Save test case" : fromAi ? "Accept and add" : "Add test case")}`, { id: t.id, attrs: fromAi ? ` data-suggestion="${suggestion}"` : "" });

}

function card(ctx, t, latest) {

    const p = ctx.s.project;
    if (ctx.ui.editing?.kind === "tc" && ctx.ui.editing.id === t.id) return `<li>${caseForm(p, t)}</li>`;

    const covers = M.mappingsOfCase(p, t.id).map((m) => m.acId);
    const run = latest.get(t.id);
    const extra = btn("duplicate", "Duplicate", { id: t.id, aria: `Duplicate ${t.id}` }) + (t.state === "active" ? btn("run-case", "Record a run", { id: t.id, aria: `Record a run of ${t.id}` }) : "");
    const more = [t.area ? `Area: ${t.area}` : "", t.automation ? `Automation: ${t.automation}` : ""].filter(Boolean).join(" · ");

    return `<li class="${P}-item ${P}-case"><details${ctx.ui.open.has(t.id) ? " open" : ""} data-open-id="${e(t.id)}"><summary><strong>${e(t.id)}</strong> ${e(t.title)} <span class="${P}-meta">${e(L[t.priority])}${t.type ? ` · ${e(L[t.type])}` : ""} · ${run ? `latest ${e(L[run.status])}` : "not run"}${t.state === "retired" ? " · Retired" : ""}${t.origin === "ai" ? " · from an AI suggestion" : ""}</span></summary>
        ${note(covers.length ? `Tests ${covers.join(", ")}.` : "Not mapped to a criterion.")}${[["Objective", t.objective], ["Preconditions", t.pre], ["Test data", t.data]].filter(([, v]) => v).map(([k, v]) => `<p class="${P}-text"><strong>${k}:</strong> ${e(v)}</p>`).join("")}${steplist(t.steps)}${t.expected ? `<p class="${P}-text"><strong>Expected result:</strong> ${e(t.expected)}</p>` : ""}${more ? note(more) : ""}${rowActions(t.id, t.state, !M.referencesTo(p, t.id).length, "edit-tc", extra)}</details></li>`;

}

function aiBox(ctx) {

    const { s, ui } = ctx;
    const p = s.project;
    const reqs = p.requirements.filter((r) => r.state === "active" && M.criteriaOf(p, r.id).some((c) => c.state === "active" && c.status === "accepted"));
    if (!reqs.some((r) => r.id === ui.aiReq)) ui.aiReq = reqs[0]?.id ?? "";

    const suggestions = ui.suggestions.map((x, i) => `<li class="${P}-suggestion"><p><strong>Suggestion ${i + 1}:</strong> ${e(x.title)} <span class="${P}-meta">${e(L[x.priority])}${x.type ? ` · ${e(L[x.type])}` : ""} · ${x.acIds.length ? `tests ${e(x.acIds.join(", "))}` : "no criterion named"}</span></p>${steplist(x.steps)}${x.expected ? note(`Expected: ${x.expected}`) : ""}<div class="qa-actions qa-actions--small">${btn("sugg-accept", "Accept", { id: String(i), aria: `Accept suggestion ${i + 1}` })}${btn("sugg-edit", "Edit, then accept", { id: String(i), aria: `Edit suggestion ${i + 1}` })}${btn("sugg-discard", "Discard", { id: String(i), aria: `Discard suggestion ${i + 1}` })}</div></li>`).join("");
    const link = (act, to, label) => `<a class="calculator-form__button calculator-form__button--secondary qa-btn" href="${e(routeOf(to))}" data-act="${act}">${label}</a>`;

    const body = reqs.length ? `${note("Ask your own AI for test cases for one requirement, then paste its table back here. Suggestions are only added when you accept them. Before you leave this page for another AI tool, download the project if you want a copy that survives a reload.")}${grid(
        select("aiReq", "Requirement", reqs.map((r) => opt(r.id, `${r.id} ${r.title}`, ui.aiReq)).join("")),
        textInput("aiFocus", "Focus (optional)", ui.filters.aiFocus ?? "", { hint: "For example \"negative and boundary cases\" or \"regression after the tax change\"." })
    )}<div class="qa-actions">${btn("ai-copy", "Copy a request for test cases")}${link("to-workbench", "ai-workbench", "Plan these tests in the AI Workbench")}${link("to-reviewer", "ai-answer-checklist", "Check an AI answer against these criteria")}</div><p class="ai-note" id="${P}-ai-note"></p>${textArea("aiAnswer", "Paste the AI's answer with its table", "", { rows: 5, max: 60000 })}<div class="qa-actions">${btn("ai-read", "Read the suggested test cases")}</div>${ui.suggestionNotes.length ? `<ul class="ai-note">${ui.suggestionNotes.map((x) => `<li>${e(x)}</li>`).join("")}</ul>` : ""}${suggestions ? `<ol class="${P}-list ${P}-suggestions">${suggestions}</ol>` : ""}`
        : note("Add accepted acceptance criteria to a requirement first: the AI is asked for cases that test them.");

    return `<details class="${P}-box" data-box="ai" data-open-id="ai-box"${ui.suggestions.length || ui.open.has("ai-box") ? " open" : ""}><summary>AI help (optional)</summary>${body}</details>`;

}

export function html(ctx) {

    const { s, ui } = ctx;
    const p = s.project;
    const f = ui.filters;
    const latest = latestRuns(p);
    const q = (f.tcQuery ?? "").toLowerCase();
    const state = f.tcState ?? "active";
    const sort = f.tcSort ?? "id";
    const rank = { high: 0, medium: 1, low: 2 };
    const list = p.testCases.filter((t) => (state === "all" || t.state === state) && (!f.tcType || t.type === f.tcType) && (!f.tcPriority || t.priority === f.tcPriority) &&
        (!f.tcMapped || (f.tcMapped === "yes") === M.mappingsOfCase(p, t.id).length > 0) &&
        (!q || `${t.id} ${t.title} ${t.objective} ${t.pre} ${t.data} ${t.expected} ${t.steps.map((x) => `${x.action} ${x.expected}`).join(" ")}`.toLowerCase().includes(q)))
        .sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : sort === "priority" ? rank[a.priority] - rank[b.priority] : 0));
    const inUse = state !== "active" || f.tcType || f.tcPriority || f.tcMapped || sort !== "id";

    return `${heading("Test cases")}${note("Ordered steps with expected results. Map each case to the criteria it tests; a case is only counted in coverage while it is active.")}${aiBox(ctx)}
        ${toolbar(search("tcQuery", "Search test cases", f.tcQuery ?? ""), btn("add-tc", "Add test case", { primary: true }), `<details class="${P}-filters" data-open-id="tc-filters"${ui.open.has("tc-filters") ? " open" : ""}><summary>Filter and sort${inUse ? " (in use)" : ""}</summary><div class="${P}-filters__grid">${[
            stateFilter("tcState", state),
            filter("tcType", "Type", opt("", "Any type", f.tcType ?? "") + M.CASE_TYPES.filter(Boolean).map((v) => opt(v, L[v], f.tcType ?? "")).join("")),
            filter("tcPriority", "Priority", opt("", "Any priority", f.tcPriority ?? "") + choices(M.PRIORITIES, f.tcPriority ?? "")),
            filter("tcMapped", "Mapping", opt("", "Mapped or not", f.tcMapped ?? "") + opt("yes", "Mapped", f.tcMapped ?? "") + opt("no", "Not mapped", f.tcMapped ?? "")),
            filter("tcSort", "Sort by", opt("id", "Id", sort) + opt("priority", "Priority", sort) + opt("title", "Title", sort))
        ].join("")}</div></details>`)}
        ${ui.editing?.kind === "tc" && !ui.editing.id ? caseForm(p, ui.editing.draft ?? {}, ui.editing.suggestion ?? -1) : ""}
        ${p.testCases.length ? (list.length ? "" : empty("No test case matches.")) : empty("No test cases yet. Add one, or use the AI help above.")}
        <ul class="${P}-list">${list.map((t) => card(ctx, t, latest)).join("")}</ul>`;

}

const editCase = (editing) => (ctx, id) => {
    ctx.ui.editing = editing(id);
    return redrawTo(ctx, "form[data-form=tc] input[name=title]");
};

export const actions = {

    ...records,

    "add-tc": editCase(() => ({ kind: "tc" })),
    "edit-tc": editCase((id) => ({ kind: "tc", id })),

    duplicate: async (ctx, id) => {
        const r = M.duplicateTestCase(ctx.s.project, id);
        if (r.errors) return ctx.announce(r.errors.form);
        ctx.ui.open.add(r.id);
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${r.id} is a copy of ${id}. Mappings are not copied: map it to its criteria.`);
    },

    "ai-copy": async (ctx) => {
        const text = (await loadAi()).suggestionRequest(ctx.s.project, ctx.ui.aiReq, ctx.ui.filters.aiFocus ?? "");
        const out = ctx.$("ai-note");
        try {
            await navigator.clipboard.writeText(text);
            out.textContent = "Request copied. Paste it into your AI, then paste its answer below.";
        } catch {
            out.textContent = "Copying was refused by the browser. Select the request below and copy it.";
            const pre = document.createElement("pre");
            pre.className = "ai-bridge__text";
            pre.tabIndex = 0;
            pre.textContent = text;
            out.after(pre);
        }
        ctx.announce(out.textContent);
    },

    "ai-read": async (ctx) => {
        const { ui, panel } = ctx;
        const { cases, problems } = (await loadAi()).parseCaseTable(panel.querySelector("textarea[name=aiAnswer]")?.value ?? "", ctx.s.project);
        ui.suggestions = cases;
        ui.suggestionNotes = problems;
        ui.open.add("ai-box");
        await redrawTo(ctx, `.${P}-suggestions button`);
        ctx.announce(cases.length ? `${plural(cases.length, "suggested test case")} to review. Nothing is added until you accept it.` : problems[0] ?? "No test cases were found.");
    },

    "sugg-accept": async (ctx, i) => {
        const { ui } = ctx;
        const x = ui.suggestions[Number(i)];
        if (!x) return;
        const r = M.addTestCase(ctx.s.project, { ...x, origin: "ai" });
        if (r.errors) {
            ui.editing = { kind: "tc", draft: x, suggestion: Number(i) };
            await ctx.redraw();
            return showErrors(ctx, ctx.panel.querySelector("form[data-form=tc]"), r.errors);
        }
        ui.suggestions.splice(Number(i), 1);
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${r.id} added from the suggestion${x.acIds.length ? ` and mapped to ${x.acIds.join(", ")}` : ""}.`);
    },

    "sugg-edit": (ctx, i) => {
        const x = ctx.ui.suggestions[Number(i)];
        if (!x) return;
        ctx.ui.editing = { kind: "tc", draft: x, suggestion: Number(i) };
        return redrawTo(ctx, "form[data-form=tc] input[name=title]");
    },

    "sugg-discard": async (ctx, i) => {
        ctx.ui.suggestions.splice(Number(i), 1);
        await ctx.redraw();
        ctx.announce("Suggestion discarded.");
    },

    "step-add": (ctx, id, button) => {
        const list = button.closest("form").querySelector(`.${P}-steps`);
        list.insertAdjacentHTML("beforeend", stepRow());
        list.lastElementChild.querySelector("textarea")?.focus();
    },

    "step-remove": (ctx, id, button) => {
        const row = button.closest("li");
        if (row.parentElement.children.length === 1) {
            for (const t of row.querySelectorAll("textarea")) t.value = "";
            return;
        }
        const next = row.nextElementSibling ?? row.previousElementSibling;
        row.remove();
        next?.querySelector("textarea")?.focus();
        ctx.announce("Step removed.");
    },

    "step-up": (ctx, id, button) => {
        const row = button.closest("li");
        if (!row.previousElementSibling) return;
        row.previousElementSibling.before(row);
        button.focus();
        ctx.announce("Step moved up.");
    },

    "step-down": (ctx, id, button) => {
        const row = button.closest("li");
        if (!row.nextElementSibling) return;
        row.nextElementSibling.after(row);
        button.focus();
        ctx.announce("Step moved down.");
    }

};

export const submit = {

    async tc(ctx, formEl, v) {
        const p = ctx.s.project;
        const data = new FormData(formEl);
        const expects = data.getAll("step-expected");
        const input = { ...v, steps: data.getAll("step-action").map((action, i) => ({ action, expected: expects[i] ?? "" })) };
        const covers = data.getAll("covers").map(String);
        const id = formEl.dataset.id;
        const suggestion = formEl.dataset.suggestion !== undefined ? Number(formEl.dataset.suggestion) : -1;
        let message;

        if (id) {
            const r = M.updateTestCase(p, id, input);
            if (r.errors) return showErrors(ctx, formEl, r.errors);
            const current = M.mappingsOfCase(p, id);
            for (const m of current) if (!covers.includes(m.acId)) M.removeMapping(p, m.id);
            for (const acId of covers) if (!current.some((m) => m.acId === acId)) M.addMapping(p, acId, id);
            message = `${id} saved.`;
        } else {
            const r = M.addTestCase(p, { ...input, acIds: covers, origin: suggestion >= 0 ? "ai" : "typed" });
            if (r.errors) return showErrors(ctx, formEl, r.errors);
            if (suggestion >= 0) ctx.ui.suggestions.splice(suggestion, 1);
            ctx.ui.open.add(r.id);
            message = `${r.id} added${covers.length ? ` and mapped to ${covers.join(", ")}` : ""}.`;
        }

        ctx.ui.editing = null;
        ctx.changed();
        await ctx.redraw();
        ctx.announce(message);
    }

};

/* a hand-off puts its payload on the click, then the workspace shows the other tool in place (16 D8) */
export function link(ctx, a, event) {

    const { s, ui } = ctx;
    if (!s.project || !ui.aiReq) return;
    if (!ai) {
        event.preventDefault();
        loadAi().then(() => a.click());
        return;
    }
    if (a.dataset.act === "to-reviewer") put("review", ai.reviewPayload(s.project, ui.aiReq).payload);
    if (a.dataset.act === "to-workbench") put("task", ai.workbenchPayload(s.project, ui.aiReq).payload);

}

export function onChange(ctx, el) {

    if (el.name === "aiReq") ctx.ui.aiReq = el.value;

}

export function onInput(ctx, el) {

    if (el.name === "aiFocus") ctx.ui.filters.aiFocus = el.value;

}
