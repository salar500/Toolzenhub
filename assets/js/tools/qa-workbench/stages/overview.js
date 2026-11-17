/* =========================================================
   ToolZen Hub
   QA Workbench, stage 1: Overview. Start a project or open a file
   (checked whole before anything changes, QD20); with a project
   open, overview-project.js draws where it stands.
========================================================= */

import { createProject, updateProject, LIMITS, MAX } from "../core.js";
import { P, e, btn, plural, heading, form, grid, textInput, textArea, formEnd, showErrors, redrawTo } from "./ui.js";

let projectView = null;

export async function prepare(ctx) {

    if (ctx.s.project) projectView ??= await import("./overview-project.js");

}

export function projectForm(info = {}, isNew = false) {

    return form(isNew ? "create" : "project", `${grid(
        textInput("name", "Project name", info.name, { required: true, max: MAX.name }),
        textInput("feature", "Feature or application under test", info.feature),
        textInput("build", "Build or version", info.build, { max: MAX.short, hint: "Used as the default build of new test runs." }),
        textInput("environment", "Environment", info.environment, { hint: "For example \"Staging, Chrome 130\"." }),
        textInput("owner", "Tester or owner", info.owner, { max: MAX.short }),
        textArea("description", "Description", info.description, { max: MAX.text }),
        textArea("scope", "Testing scope", info.scope, { hint: "What this testing covers and what it does not." })
    )}${formEnd(isNew ? "Create project" : "Save details", !isNew)}`);

}

export function openBox(ctx, open) {

    const { s, ui } = ctx;
    const pv = ui.preview;
    let result = "";

    if (pv?.errors) {
        result = `<div class="${P}-problem" role="alert"><p><strong>This file was not opened.</strong> ${s.project ? "The project you have open is unchanged." : ""}</p><ul>${pv.errors.slice(0, 10).map((x) => `<li>${e(x)}</li>`).join("")}</ul>${pv.errors.length > 10 ? `<p>And ${pv.errors.length - 10} more.</p>` : ""}<p>Use a file downloaded from this page, unchanged. If you edited the data at its end, undo the edit.</p></div>`;
    } else if (pv?.project) {
        const q = pv.project;
        result = `<div class="${P}-preview"><p><strong>${e(q.project.name)}</strong>: ${plural(q.requirements.length, "requirement")}, ${plural(q.criteria.length, "criterion", "criteria")}, ${plural(q.testCases.length, "test case")}, ${plural(q.mappings.length, "mapping")}, ${plural(q.executions.length, "test run")}, ${plural(q.defects.length, "defect")}. Last changed ${e(q.project.updatedOn.replace("T", " "))}.</p>${pv.notes.length ? `<p class="ai-note">${pv.notes.map(e).join(" ")}</p>` : ""}${pv.ignored.length ? `<p class="ai-note">Fields this page does not use were ignored: ${pv.ignored.map(e).join(", ")}.</p>` : ""}<div class="qa-actions">${btn("open-confirm", s.project ? "Replace the open project with this one" : "Open this project", { primary: true })} ${btn("open-cancel", "Cancel")}</div></div>`;
    }

    return `<details class="${P}-box" data-open-id="open-box"${open || pv || ui.open.has("open-box") ? " open" : ""}><summary>Open a project file</summary><p class="ai-note">A project file downloaded from this page. The whole file is checked before anything changes.</p>${grid(
        textInput("file", "Project file", "", { type: "file", attrs: ' accept=".md,.txt,text/markdown,text/plain" data-open="file"' }),
        textArea("paste", "Or paste the file's text", "", { rows: 3, max: 200000, hint: "Up to 200 kB. Larger projects open from the file." })
    )}<div class="qa-actions">${btn("open-check", "Check the file")}</div><div id="${P}-open-result">${result}</div></details>`;

}

export function html(ctx) {

    return ctx.s.project
        ? projectView.html(ctx)
        : `${heading("Start a QA project")}<p>A project holds one release or feature: its requirements, test cases, test runs and defects. Only the name is required.</p>${projectForm({}, true)}${openBox(ctx, true)}`;

}

async function checkFile(ctx) {

    const { ui, panel } = ctx;
    const box = panel.querySelector(`.${P}-box`);
    const file = box?.querySelector('input[type="file"]')?.files?.[0];
    let text = box?.querySelector('textarea[name="paste"]')?.value ?? "";

    if (file) {
        const read = await (await import("../../ai-tools/common/pack-format.js")).readFile(file, LIMITS.fileBytes);
        if (read.error) {
            ui.preview = { errors: [read.error] };
            return ctx.redraw();
        }
        text = read.text;
    }

    if (!text.trim()) {
        ui.preview = { errors: ["Choose a project file or paste its text first."] };
        return ctx.redraw();
    }

    ui.preview = (await import("../project-file.js")).readProject(text);
    await ctx.redraw();
    ctx.$("open-result")?.querySelector("button, [role=alert]")?.focus?.();
    ctx.announce(ui.preview.errors ? "The file was not opened. Its problems are listed." : `The file holds ${ui.preview.project.project.name}. Check it, then open it.`);

}

export const actions = {

    "open-check": checkFile,

    "open-confirm": async (ctx) => {
        const { s, ui } = ctx;
        if (!ui.preview?.project) return;
        if (s.project && s.dirty && !window.confirm(`Replace ${s.project.project.name}? Its changes since the last download will be lost.`)) return;
        Object.assign(s, { project: ui.preview.project, dirty: false, downloadedAt: "", build: "" });
        Object.assign(ui, { preview: null, suggestions: [] });
        ui.open.delete("open-box");
        ctx.syncWarning();
        await ctx.go("overview");
        ctx.announce(`${s.project.project.name} opened.`);
    },

    "open-cancel": (ctx) => {
        ctx.ui.preview = null;
        return ctx.redraw();
    },

    "edit-project": (ctx) => {
        ctx.ui.editing = { kind: "project" };
        return redrawTo(ctx, "input[name=name]");
    },

    "new-project": async (ctx) => {
        const { s } = ctx;
        if (s.dirty && !window.confirm(`Start a new project? The changes to ${s.project.project.name} since the last download will be lost.`)) return;
        Object.assign(s, { project: null, dirty: false, downloadedAt: "" });
        ctx.ui.suggestions = [];
        ctx.syncWarning();
        await ctx.go("overview");
    }

};

export const submit = {

    async create(ctx, formEl, v) {
        const r = createProject(v);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        Object.assign(ctx.s, { project: r.project, downloadedAt: "", build: "" });
        ctx.changed();
        await ctx.redraw();
        ctx.$("stage-title")?.focus();
        ctx.announce(`Project ${r.project.project.name} started. It is not saved to a file until you download it.`);
    },

    async project(ctx, formEl, v) {
        const r = updateProject(ctx.s.project, v);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        ctx.ui.editing = null;
        ctx.changed();
        await ctx.redraw();
        ctx.$("stage-title")?.focus();
        ctx.announce("Project details saved.");
    }

};

export function onChange(ctx, el) {

    if (el.dataset.open === "file" && el.files?.[0]) checkFile(ctx);

}
