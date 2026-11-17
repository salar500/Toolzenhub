/* =========================================================
   ToolZen Hub
   QA Workbench, stage 1 with a project open: where the project
   stands (figures from metrics.js, all builds) and what to do next.
   Loaded once a project is open, so a fresh visit does not fetch it.
========================================================= */

import { metrics } from "../metrics.js";
import { P, STAGES, e, btn, plural, heading, fig } from "./ui.js";
import { projectForm, openBox } from "./overview.js";

function nextSteps(ctx, m) {

    const p = ctx.s.project;
    const out = [];
    const step = (text, stage) => out.push(`<li>${e(text)} ${btn("goto", `Go to ${STAGES.find((x) => x.id === stage).title}`, { id: stage })}</li>`);

    if (!p.requirements.length) step("Add the first requirement and its acceptance criteria.", "requirements");
    else if (!m.criteria.counted) step("Add acceptance criteria to your requirements: they define what must be tested.", "requirements");
    if (m.criteria.clarify.length) step(`${plural(m.criteria.clarify.length, "criterion needs", "criteria need")} clarification.`, "requirements");
    if (m.criteria.counted && !m.cases.active) step("Write the first test case.", "cases");
    if (m.criteria.unmapped.length) step(`${plural(m.criteria.unmapped.length, "accepted criterion has", "accepted criteria have")} no test case mapped.`, "coverage");
    if (m.runs.notRun.length) step(`${plural(m.runs.notRun.length, "active test case has", "active test cases have")} not been run.`, "execution");
    if (m.defects.failedWithoutDefect.length) step(`${plural(m.defects.failedWithoutDefect.length, "failed test case has", "failed test cases have")} no defect linked.`, "defects");
    if (m.defects.retest.length) step(`${plural(m.defects.retest.length, "defect is", "defects are")} fixed and waiting for a retest.`, "execution");
    if (ctx.s.dirty) out.push(`<li>Your changes are not in a file yet. ${btn("download", "Download project")}</li>`);

    return out.length ? `<ul class="${P}-next">${out.join("")}</ul>` : "<p>Nothing is waiting: every accepted criterion is mapped, every active test case has a run, and every failure has a defect.</p>";

}

export function html(ctx) {

    const info = ctx.s.project.project;
    if (ctx.ui.editing?.kind === "project") return `${heading("Edit project details")}${projectForm(info)}`;

    const m = metrics(ctx.s.project);
    const details = [["Feature or application", info.feature], ["Build or version", info.build], ["Environment", info.environment], ["Tester or owner", info.owner], ["Created", info.createdOn.replace("T", " ")], ["Last changed", info.updatedOn.replace("T", " ")]]
        .filter(([, v]) => v).map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("");

    return `${heading(info.name)}<dl class="${P}-details">${details}</dl>${info.description ? `<p class="${P}-text">${e(info.description)}</p>` : ""}${info.scope ? `<p class="${P}-text"><strong>Scope:</strong> ${e(info.scope)}</p>` : ""}<div class="qa-actions">${btn("edit-project", "Edit details")}</div>
        <h3>Where the project stands</h3><p class="ai-note">Counted from your records, all builds. Mapped, executed and passed are separate: a mapped criterion has not necessarily been tested.</p>
        <dl class="${P}-figs">${[
            fig("Active requirements", String(m.requirements.active)),
            fig("Accepted criteria", String(m.criteria.counted), m.criteria.clarify.length ? `${m.criteria.clarify.length} need clarification` : ""),
            fig("Mapped criteria", m.criteria.counted ? `${m.criteria.mapped} of ${m.criteria.counted}` : "No accepted criteria", m.criteria.unmapped.length ? `${m.criteria.unmapped.length} not mapped` : ""),
            fig("Active test cases", String(m.cases.active)),
            fig("Executed test cases", `${m.runs.executed} of ${m.cases.active}`, "pass or fail"),
            fig("Latest results", `${m.runs.pass.length} pass, ${m.runs.fail.length} fail, ${m.runs.blocked.length} blocked`, `${m.runs.notRun.length} not run`),
            fig("Outstanding defects", String(m.defects.outstanding), `${m.defects.open.length} open, ${m.defects.retest.length} awaiting retest`),
            fig("Deferred and closed defects", `${m.defects.deferred.length} deferred, ${m.defects.closed.length} closed`)
        ].join("")}</dl>
        <h3>What to do next</h3>${nextSteps(ctx, m)}${openBox(ctx, false)}<div class="qa-actions">${btn("new-project", "Start a new project")}</div>`;

}
