/* =========================================================
   ToolZen Hub
   QA Workbench, stage 6: Defects. Linked to test cases and runs by
   id (an unknown id is an error, never dropped quietly); each
   change of status is kept with its date; closing asks first. A
   defect can be handed to Bug Report to Debugging Prompt (QD26).
========================================================= */

import * as M from "../model.js";
import { metrics } from "../metrics.js";
import { put } from "../../ai-tools/common/handoff.js";
import { P, e, opt, choicesOf, btn, heading, note, fig, form, grid, toolbar, empty, search, filter, textInput, textArea, select, formEnd, idList, routeOf, showErrors, redrawTo } from "./ui.js";

const L = M.LABELS;
const choices = choicesOf(L);

let ai = null;

export const after = () => {
    import("../ai.js").then((mod) => {
        ai = mod;
    });
};

function defectForm(p, d = {}) {

    return form("defect", `<h3>${d.id ? `Edit ${e(d.id)}` : "New defect"}</h3>${grid(
        textInput("title", "Title", d.title, { required: true }),
        select("status", "Status", choices(M.DEFECT_STATUS, d.status ?? "open"), { hint: "Fixed, awaiting retest is still outstanding. Close after a passing retest." }),
        select("severity", "Severity", opt("", "Choose", d.severity ?? "") + choices(M.SEVERITIES, d.severity ?? ""), { required: true }),
        select("priority", "Priority", opt("", "Choose", d.priority ?? "") + choices(M.PRIORITIES, d.priority ?? ""), { required: true }),
        textInput("reason", "Reason, if deferred", d.reason),
        textInput("tcIds", "Test cases", (d.tcIds ?? []).join(" "), { hint: "Ids separated by spaces, for example \"TC-001 TC-004\"." }),
        textInput("exIds", "Test runs", (d.exIds ?? []).join(" "), { hint: "Run ids, for example \"EX-0012\"." }),
        textInput("build", "Build or version", d.build ?? p.project.build, { max: M.MAX.short }),
        textInput("environment", "Environment", d.environment ?? p.project.environment),
        textInput("reporter", "Reporter", d.reporter ?? p.project.owner, { max: M.MAX.short }),
        textInput("assignee", "Assigned to", d.assignee, { max: M.MAX.short }),
        textArea("actual", "Actual result", d.actual, { required: true }),
        textArea("expected", "Expected result", d.expected),
        textArea("steps", "Steps to reproduce", d.steps, { max: M.MAX.text, rows: 4 }),
        textArea("description", "Description", d.description, { max: M.MAX.text }),
        textArea("resolution", "Resolution notes", d.resolution, { rows: 2 })
    )}${formEnd(d.id ? "Save defect" : "Add defect")}`, { id: d.id });

}

function card(ctx, d) {

    const p = ctx.s.project;
    if (ctx.ui.editing?.kind === "defect" && ctx.ui.editing.id === d.id) return `<li>${defectForm(p, d)}</li>`;

    const where = [d.build ? `Build ${d.build}` : "", d.environment, d.reporter ? `reported by ${d.reporter}` : "", d.assignee ? `assigned to ${d.assignee}` : ""].filter(Boolean).join(" · ");

    return `<li class="${P}-item"><details${ctx.ui.open.has(d.id) ? " open" : ""} data-open-id="${e(d.id)}"><summary><strong>${e(d.id)}</strong> ${e(d.title)} <span class="${P}-meta">${e(L[d.status])} · ${e(L[d.severity])} · ${e(L[d.priority])} priority</span></summary>
        <p class="ai-note">${d.tcIds.length ? `Test cases ${idList(d.tcIds)}.` : "No test case linked."}${d.exIds.length ? ` Runs ${idList(d.exIds)}.` : ""}${d.reason ? ` Deferred: ${e(d.reason)}.` : ""}</p>
        ${[["Actual", d.actual], ["Expected", d.expected], ["Steps to reproduce", d.steps], ["Description", d.description], ["Resolution", d.resolution]].filter(([, v]) => v).map(([k, v]) => `<p class="${P}-text"><strong>${k}:</strong> ${e(v)}</p>`).join("")}
        ${where ? note(where) : ""}${note(`History: ${d.history.map((h) => `${L[h.status]} ${h.on.replace("T", " ")}`).join(" → ")}`)}
        <div class="qa-actions qa-actions--small">${btn("edit-defect", "Edit", { id: d.id, aria: `Edit ${d.id}` })}<a class="calculator-form__button calculator-form__button--secondary qa-btn" href="${e(routeOf("bug-report-prompt"))}" data-act="to-bug" data-id="${e(d.id)}" aria-label="Write a debugging prompt for ${e(d.id)} in Bug Report">Debugging prompt</a></div></details></li>`;

}

export function html(ctx) {

    const { s, ui } = ctx;
    const p = s.project;
    const m = metrics(p);
    const f = ui.filters;
    const q = (f.defQuery ?? "").toLowerCase();
    const show = f.defShow ?? "outstanding";
    const list = p.defects.filter((d) => (show === "all" || (show === "outstanding" ? ["open", "retest"].includes(d.status) : d.status === show)) &&
        (!q || `${d.id} ${d.title} ${d.description} ${d.actual} ${d.tcIds.join(" ")}`.toLowerCase().includes(q)));

    return `${heading("Defects")}${note("Outstanding defects are open or fixed and awaiting retest. A fixed defect stays outstanding until a retest passes and you close it.")}
        <dl class="${P}-figs">${[fig("Outstanding", String(m.defects.outstanding)), fig("Open", String(m.defects.open.length)), fig("Fixed, awaiting retest", String(m.defects.retest.length)), fig("Deferred", String(m.defects.deferred.length)), fig("Closed", String(m.defects.closed.length))].join("")}</dl>
        ${m.defects.failedWithoutDefect.length ? `<p class="${P}-callout">Failed test cases with no defect linked: ${idList(m.defects.failedWithoutDefect)}.</p>` : ""}
        ${toolbar(search("defQuery", "Search defects", f.defQuery ?? ""), filter("defShow", "Show", opt("outstanding", "Outstanding", show) + M.DEFECT_STATUS.map((v) => opt(v, L[v], show)).join("") + opt("all", "All", show)), btn("add-defect", "Add defect", { primary: true }))}
        ${ui.editing?.kind === "defect" && !ui.editing.id ? defectForm(p, ui.editing.draft ?? {}) : ""}
        ${p.defects.length ? (list.length ? "" : empty("No defect matches.")) : empty("No defects recorded.")}
        <ul class="${P}-list">${list.map((d) => card(ctx, d)).join("")}</ul>`;

}

const editDefect = (editing) => (ctx, id) => {
    ctx.ui.editing = editing(id);
    return redrawTo(ctx, "form[data-form=defect] input[name=title]");
};

export const actions = {
    "add-defect": editDefect(() => ({ kind: "defect" })),
    "edit-defect": editDefect((id) => ({ kind: "defect", id }))
};

const idsIn = (value, type) => String(value ?? "").toUpperCase().split(/[\s,;]+/).filter((id) => M.parseId(id)?.type === type);

export const submit = {

    async defect(ctx, formEl, v) {
        const p = ctx.s.project;
        const id = formEl.dataset.id;

        /* typed ids must belong to the project: an unknown one is an error, never dropped quietly */
        const errors = {};
        for (const [key, type, collection, word] of [["tcIds", "TC", "testCases", "a test case"], ["exIds", "EX", "executions", "a test run"]]) {
            const unknown = String(v[key] ?? "").toUpperCase().split(/[\s,;]+/).filter(Boolean).filter((x) => M.parseId(x)?.type !== type || !M.byId(p[collection], x));
            if (unknown.length) errors[key] = `Not ${word} of this project: ${unknown.join(", ")}.`;
        }
        if (Object.keys(errors).length) return showErrors(ctx, formEl, errors);

        const before = id ? M.byId(p.defects, id) : null;
        if (v.status === "closed" && before?.status !== "closed" && !window.confirm("Close this defect? Close a defect only after a retest has passed.")) return;

        const input = { ...v, tcIds: idsIn(v.tcIds, "TC"), exIds: idsIn(v.exIds, "EX") };
        const r = id ? M.updateDefect(p, id, input) : M.addDefect(p, input);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        ctx.ui.editing = null;
        ctx.ui.open.add(r.id);
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${r.id} ${id ? "saved" : "added"}.`);
    }

};

/* the defect's details go to Bug Report on the click; the workspace then shows it in place */
export function link(ctx, a, event) {

    if (a.dataset.act !== "to-bug" || !ctx.s.project) return;
    if (!ai) {
        event.preventDefault();
        import("../ai.js").then((mod) => {
            ai = mod;
            a.click();
        });
        return;
    }
    put("bug", ai.bugPayload(ctx.s.project, M.byId(ctx.s.project.defects, a.dataset.id)));

}
