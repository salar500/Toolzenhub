/* =========================================================
   ToolZen Hub
   QA Workbench, stage 2: Requirements and their acceptance
   criteria. Several criteria can be added at once, one per line;
   a referenced record is retired, never deleted (QD19).
========================================================= */

import * as M from "../model.js";
import { P, e, btn, plural, tag, heading, note, form, grid, toolbar, empty, search, stateFilter, textInput, textArea, select, choicesOf, formEnd, rowActions, showErrors, redrawTo } from "./ui.js";
import { records } from "./records.js";

const L = M.LABELS;
const choices = choicesOf(L);

function requirementForm(r = {}) {

    return form("req", `<h3>${r.id ? `Edit ${e(r.id)}` : "New requirement"}</h3>${grid(
        textInput("title", "Title", r.title, { required: true }),
        select("priority", "Priority", choices(M.PRIORITIES, r.priority ?? "medium")),
        textInput("source", "Source or reference", r.source, { hint: "A story, ticket or document, for example \"JIRA-142\"." }),
        textArea("description", "Description", r.description, { max: M.MAX.text })
    )}${formEnd(r.id ? "Save requirement" : "Add requirement")}`, { id: r.id });

}

function criterionForm(reqId, c = null) {

    return form("ac", `<h4>${c ? `Edit ${e(c.id)}` : `New acceptance criteria for ${e(reqId)}`}</h4>${grid(
        c ? textArea("text", "Criterion", c.text, { required: true, max: M.MAX.criterion, rows: 2 })
            : textArea("text", "Criteria, one per line", "", { required: true, max: 20000, rows: 4, hint: "Each line becomes one criterion with its own id." }),
        select("status", "Status", choices(M.CRITERION_STATUS, c?.status ?? "accepted"), { hint: "Only accepted criteria count in coverage." }),
        textInput("reason", "Reason, if excluded", c?.reason ?? ""),
        textArea("notes", "Notes", c?.notes ?? "", { rows: 2 })
    )}${c ? "" : `<p class="ai-note" id="${P}-ac-count" aria-live="polite"></p>`}${formEnd(c ? "Save criterion" : "Add criteria")}`, { id: c?.id, attrs: ` data-req="${e(reqId)}"` });

}

function criterionRow(ctx, c) {

    const p = ctx.s.project;
    if (ctx.ui.editing?.kind === "ac" && ctx.ui.editing.id === c.id) return `<li>${criterionForm(c.reqId, c)}</li>`;

    const maps = M.mappingsOfCriterion(p, c.id).map((m) => m.tcId);

    return `<li class="${P}-ac"><p><strong>${e(c.id)}</strong> ${tag(L[c.status], c.status)}${c.state === "retired" ? ` ${tag("Retired", "retired")}` : ""} ${e(c.text)}</p>${c.reason ? note(`Excluded: ${c.reason}`) : ""}${c.notes ? note(c.notes) : ""}${note(maps.length ? `Mapped to ${maps.join(", ")}.` : "No test case mapped.")}${rowActions(c.id, c.state, !M.referencesTo(p, c.id).length, "edit-ac")}</li>`;

}

function block(ctx, r) {

    const { s, ui } = ctx;
    const criteria = M.criteriaOf(s.project, r.id);
    const editing = ui.editing?.kind === "req" && ui.editing.id === r.id;
    const adding = ui.editing?.kind === "ac" && !ui.editing.id && ui.editing.reqId === r.id;
    const open = ui.open.has(r.id) || editing || adding || (ui.editing?.kind === "ac" && criteria.some((c) => c.id === ui.editing.id));
    const body = editing ? requirementForm(r) : `${r.description ? `<p class="${P}-text">${e(r.description)}</p>` : ""}${r.source ? note(`Source: ${r.source}`) : ""}${rowActions(r.id, r.state, !M.referencesTo(s.project, r.id).length, "edit-req", r.state === "active" ? btn("add-ac", "Add criteria", { id: r.id, aria: `Add criteria to ${r.id}` }) : "")}`;

    return `<details class="${P}-item" data-req="${e(r.id)}"${open ? " open" : ""}><summary><strong>${e(r.id)}</strong> ${e(r.title)} <span class="${P}-meta">${plural(criteria.length, "criterion", "criteria")} · ${e(L[r.priority])} priority${r.state === "retired" ? " · Retired" : ""}</span></summary>${body}${adding ? criterionForm(r.id) : ""}${criteria.length ? `<ul class="${P}-acs">${criteria.map((c) => criterionRow(ctx, c)).join("")}</ul>` : note("No acceptance criteria yet.")}</details>`;

}

export function html(ctx) {

    const p = ctx.s.project;
    const f = ctx.ui.filters;
    const q = (f.reqQuery ?? "").toLowerCase();
    const state = f.reqState ?? "active";
    const list = p.requirements.filter((r) => (state === "all" || r.state === state) &&
        (!q || `${r.id} ${r.title} ${r.description} ${r.source} ${M.criteriaOf(p, r.id).map((c) => `${c.id} ${c.text}`).join(" ")}`.toLowerCase().includes(q)));

    return `${heading("Requirements")}${note("Each requirement has acceptance criteria: what must be true for it to be done. Accepted criteria are what coverage is measured against.")}
        ${toolbar(search("reqQuery", "Search requirements and criteria", f.reqQuery ?? ""), stateFilter("reqState", state), btn("add-req", "Add requirement", { primary: true }))}
        ${ctx.ui.editing?.kind === "req" && !ctx.ui.editing.id ? requirementForm() : ""}
        ${p.requirements.length ? (list.length ? "" : empty("No requirement matches.")) : empty("No requirements yet. Add the first one, or open a project file in the Overview.")}
        <div class="${P}-list">${list.map((r) => block(ctx, r)).join("")}</div>`;

}

const edit = (editing, selector) => (ctx, id) => {
    ctx.ui.editing = editing(id);
    return redrawTo(ctx, selector);
};

export const actions = {

    ...records,
    "add-req": edit(() => ({ kind: "req" }), "form[data-form=req] input[name=title]"),
    "edit-req": edit((id) => ({ kind: "req", id }), "form[data-form=req] input[name=title]"),
    "add-ac": edit((id) => ({ kind: "ac", reqId: id }), "form[data-form=ac] textarea[name=text]"),
    "edit-ac": edit((id) => ({ kind: "ac", id }), "form[data-form=ac] textarea[name=text]")
};

export const submit = {

    async req(ctx, formEl, v) {
        const id = formEl.dataset.id;
        const r = id ? M.updateRequirement(ctx.s.project, id, v) : M.addRequirement(ctx.s.project, v);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        ctx.ui.editing = null;
        ctx.ui.open.add(r.id);
        ctx.changed();
        await redrawTo(ctx, `[data-req="${CSS.escape(r.id)}"] summary`);
        ctx.announce(`${r.id} ${id ? "saved" : "added"}.`);
    },

    async ac(ctx, formEl, v) {
        const p = ctx.s.project;
        const id = formEl.dataset.id;
        const reqId = formEl.dataset.req;
        let message;
        if (id) {
            const r = M.updateCriterion(p, id, v);
            if (r.errors) return showErrors(ctx, formEl, r.errors);
            message = `${id} saved.`;
        } else {
            const lines = String(v.text ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
            if (!lines.length) return showErrors(ctx, formEl, { text: "Write at least one criterion." });
            if (lines.some((x) => x.length > M.MAX.criterion)) return showErrors(ctx, formEl, { text: `A criterion can be at most ${M.MAX.criterion} characters.` });
            const room = M.LIMITS.criteria - p.criteria.length;
            if (lines.length > room) return showErrors(ctx, formEl, { text: `Only ${room} more criteria fit in this project.` });
            const first = M.addCriterion(p, reqId, { ...v, text: lines[0] });
            if (first.errors) return showErrors(ctx, formEl, first.errors);
            const added = [first.id, ...lines.slice(1).map((text) => M.addCriterion(p, reqId, { ...v, text }).id)];
            ctx.ui.open.add(reqId);
            message = `${added.length === 1 ? added[0] : `${added.length} criteria (${added[0]} to ${added.at(-1)})`} added to ${reqId}.`;
        }
        ctx.ui.editing = null;
        ctx.changed();
        await ctx.redraw();
        ctx.announce(message);
    }

};

export function onInput(ctx, el) {

    if (el.name === "text" && el.closest("form[data-form=ac]:not([data-id])")) {
        const n = el.value.split("\n").filter((x) => x.trim()).length;
        ctx.$("ac-count").textContent = n > 1 ? `Adds ${n} criteria.` : "";
    }

}
