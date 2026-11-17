/* =========================================================
   ToolZen Hub
   QA Workbench, stage 5: Execution. The visitor records each run
   (QD12); every run is kept, and a case's latest run in the chosen
   scope gives its result. A failed or blocked run can start a
   defect with its details filled in.
========================================================= */

import * as M from "../model.js";
import { metrics, buildsOf } from "../metrics.js";
import { P, e, opt, btn, plural, tag, heading, note, fig, form, grid, toolbar, empty, search, filter, scope, textInput, textArea, select, formEnd, idList, showErrors, redrawTo } from "./ui.js";
import { records } from "./records.js";

const L = M.LABELS;

function runForm(ctx) {

    const { s, ui } = ctx;
    const p = s.project;
    const cases = p.testCases.filter((t) => t.state === "active");
    const chosen = cases.some((t) => t.id === ui.runFor) ? ui.runFor : cases[0]?.id;

    return form("run", `<h3>Record a test run</h3>${grid(
        select("tcId", "Test case", cases.map((t) => opt(t.id, `${t.id} ${t.title}`, chosen)).join(""), { required: true }),
        `<fieldset class="calculator-form__group ${P}-radios"><legend class="calculator-form__label">Result (required)</legend>${M.RUN_STATUS.map((v) => `<label class="${P}-check"><input type="radio" name="status" value="${v}"> ${e(L[v])}</label>`).join("")}<span class="qa-error" data-error-for="status" hidden></span></fieldset>`,
        textInput("executedOn", "Date and time", M.stamp(), { type: "datetime-local", required: true, max: 16 }),
        textInput("build", "Build or version", s.build || p.project.build, { max: M.MAX.short }),
        textInput("environment", "Environment", p.project.environment),
        textInput("tester", "Tester", p.project.owner, { max: M.MAX.short }),
        textArea("actual", "Actual result", "", { hint: "Required for Fail and Blocked: what happened, or what blocked the test." }),
        textArea("notes", "Notes", "", { rows: 2 })
    )}${formEnd("Record the run")}`);

}

function history(ctx, t) {

    const { s } = ctx;
    const p = s.project;
    const runs = p.executions.filter((x) => x.tcId === t.id && (!s.build || x.build === s.build))
        .sort((a, b) => b.executedOn.localeCompare(a.executedOn) || M.parseId(b.id).n - M.parseId(a.id).n);
    if (!runs.length) return "";

    return `<details${ctx.ui.open.has(`runs-${t.id}`) ? " open" : ""} data-open-id="runs-${e(t.id)}"><summary>History: ${plural(runs.length, "run")}</summary><ul class="${P}-runs">${runs.map((r) => {
        const linked = M.defectsOfRun(p, r.id);
        const info = [r.executedOn.replace("T", " "), r.build ? `build ${r.build}` : "", r.environment, r.tester].filter(Boolean).map(e).join(" · ");
        return `<li><strong>${e(r.id)}</strong> ${tag(L[r.status], r.status)} ${info}${r.actual ? `<br><span class="ai-note">Actual: ${e(r.actual)}</span>` : ""}${r.notes ? `<br><span class="ai-note">Notes: ${e(r.notes)}</span>` : ""}${linked.length ? `<br><span class="ai-note">Defects: ${idList(linked.map((d) => d.id))}</span>` : ""}<span class="qa-actions qa-actions--small">${r.status !== "pass" ? btn("defect-from-run", "Create defect", { id: r.id, aria: `Create a defect from ${r.id}` }) : ""}${linked.length ? "" : btn("delete-run", "Delete run", { id: r.id, aria: `Delete ${r.id}` })}</span></li>`;
    }).join("")}</ul></details>`;

}

export function html(ctx) {

    const { s, ui } = ctx;
    const p = s.project;
    const builds = buildsOf(p);
    if (s.build && !builds.includes(s.build)) s.build = "";
    const m = metrics(p, { build: s.build });
    const f = ui.filters;
    const q = (f.runQuery ?? "").toLowerCase();
    const show = f.runShow ?? "";
    const active = p.testCases.filter((t) => t.state === "active");
    const list = active.filter((t) => (!show || (m.runs.latest.get(t.id)?.status ?? "none") === show) && (!q || `${t.id} ${t.title}`.toLowerCase().includes(q)));
    const last = ui.lastRun ? M.byId(p.executions, ui.lastRun) : null;

    return `${heading("Execution")}${note("You run each test and record what happened. A test can be run many times; every run is kept, and its latest run in the chosen scope gives its result.")}
        ${toolbar(scope(s, builds), active.length ? btn("add-run", "Record a run", { primary: true }) : "")}
        <dl class="${P}-figs">${[
            fig("Active test cases", String(m.cases.active)),
            fig("Executed (pass or fail)", `${m.runs.executed} of ${m.cases.active}`),
            fig("Passed", m.runs.executed ? `${m.runs.pass.length} of ${m.runs.executed} executed` : "None executed", m.cases.active ? `${m.runs.pass.length} of ${m.cases.active} active` : ""),
            fig("Failed", String(m.runs.fail.length)),
            fig("Blocked", String(m.runs.blocked.length), "not passed, not executed"),
            fig("Not run", String(m.runs.notRun.length))
        ].join("")}</dl>
        ${last && last.status !== "pass" ? `<p class="${P}-callout">${e(last.id)} of ${e(last.tcId)} was recorded as ${e(L[last.status])}. ${btn("defect-from-run", "Create a defect from this run", { id: last.id, primary: true })}</p>` : ""}
        ${ui.editing?.kind === "run" ? runForm(ctx) : ""}
        ${active.length ? toolbar(search("runQuery", "Search test cases", f.runQuery ?? ""), filter("runShow", "Latest result", opt("", "Any", show) + opt("pass", "Pass", show) + opt("fail", "Fail", show) + opt("blocked", "Blocked", show) + opt("none", "Not run", show))) : empty("No active test cases to run. Write test cases first.")}
        <ul class="${P}-list">${list.map((t) => {
            const latest = m.runs.latest.get(t.id);
            return `<li class="${P}-item"><p><strong>${e(t.id)}</strong> ${e(t.title)} ${tag(latest ? L[latest.status] : "Not run", latest?.status ?? "not-run")}</p>${latest ? note(`Latest: ${latest.executedOn.replace("T", " ")}${latest.build ? `, build ${latest.build}` : ""}${latest.tester ? `, ${latest.tester}` : ""}.`) : ""}<div class="qa-actions qa-actions--small">${btn("run-case", "Record a run", { id: t.id, aria: `Record a run of ${t.id}` })}</div>${history(ctx, t)}</li>`;
        }).join("")}</ul>`;

}

export const actions = {

    ...records,

    "add-run": (ctx) => {
        ctx.ui.editing = { kind: "run" };
        return redrawTo(ctx, "form[data-form=run] select[name=tcId]");
    },

    "delete-run": async (ctx, id) => {
        if (!window.confirm(`Delete ${id}? Delete a run only if it was recorded by mistake; every real run should stay in the history.`)) return;
        const r = M.deleteExecution(ctx.s.project, id);
        if (r.errors) return ctx.announce(r.errors.form);
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${id} deleted.`);
    },

    "defect-from-run": (ctx, id) => {
        const p = ctx.s.project;
        const run = M.byId(p.executions, id);
        const t = M.byId(p.testCases, run.tcId);
        ctx.s.stage = "defects";
        ctx.ui.editing = {
            kind: "defect",
            draft: {
                title: `${t.title}: ${run.actual}`.slice(0, M.MAX.title),
                actual: run.actual,
                expected: t.expected || t.steps.map((x) => x.expected).filter(Boolean).join("\n"),
                steps: [t.pre ? `Preconditions: ${t.pre}` : "", ...t.steps.map((x, i) => `${i + 1}. ${x.action}`)].filter(Boolean).join("\n"),
                tcIds: [t.id], exIds: [run.id], build: run.build, environment: run.environment, reporter: run.tester
            }
        };
        ctx.ui.lastRun = "";
        return redrawTo(ctx, "form[data-form=defect] input[name=title]");
    }

};

export const submit = {

    async run(ctx, formEl, v) {
        const r = M.addExecution(ctx.s.project, v);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        Object.assign(ctx.ui, { editing: null, lastRun: r.id, runFor: "" });
        ctx.changed();
        await ctx.redraw();
        ctx.$("stage-title")?.focus();
        ctx.announce(`${r.id} recorded: ${v.tcId} ${L[v.status]}.`);
    }

};
