/* =========================================================
   ToolZen Hub
   QA Workbench, stage 4: Coverage and traceability. One record per
   criterion with the test cases mapped to it (never a page-wide
   grid); mapped, executed and passed stay apart (QD21). The list
   of cases to map is drawn only for the criterion being mapped.
========================================================= */

import * as M from "../model.js";
import { metrics, percent, RESULT_LABELS } from "../metrics.js";
import { P, e, opt, btn, tag, heading, note, fig, form, toolbar, empty, search, filter, select, formEnd, showErrors, redrawTo } from "./ui.js";
import { records } from "./records.js";

const L = M.LABELS;

function row(ctx, c, info, activeCases) {

    const p = ctx.s.project;
    const maps = M.mappingsOfCriterion(p, c.id);
    const tags = info
        ? `${tag(info.caseIds.length ? "Mapped" : "Not mapped", info.caseIds.length ? "mapped" : "unmapped")} ${tag(`Result: ${RESULT_LABELS[info.result]}`, info.result)}${info.onlyRetired ? ` ${tag("Only retired cases", "retired")}` : ""}`
        : tag(`Not counted: ${L[c.status]}`, c.status);
    const chips = maps.length ? `<ul class="${P}-chips">${maps.map((x) => {
        const t = M.byId(p.testCases, x.tcId);
        return `<li>${e(x.tcId)} ${e(t?.title ?? "")}${t?.state === "retired" ? " (retired)" : ""} ${btn("unmap", "Remove", { id: x.id, aria: `Remove the mapping of ${c.id} to ${x.tcId}` })}</li>`;
    }).join("")}</ul>` : "";
    let mapping = btn("map", "Map a test case", { id: c.id, aria: `Map a test case to ${c.id}` });

    if (ctx.ui.mapping === c.id) {
        const free = activeCases.filter((t) => !maps.some((x) => x.tcId === t.id));
        mapping = form("map", `${free.length ? select("tcId", `Test case to map to ${c.id}`, free.map((t) => opt(t.id, `${t.id} ${t.title}`, "")).join("")) : note(`Every active test case is already mapped to ${c.id}.`)}${formEnd("Map")}`, { attrs: ` data-ac="${e(c.id)}"` });
    }

    return `<li class="${P}-item ${P}-covrow"><p><strong>${e(c.id)}</strong> ${e(c.text)}</p><p class="${P}-meta">${tags}</p>${chips}${mapping}</li>`;

}

export function html(ctx) {

    const p = ctx.s.project;
    const m = metrics(p);
    const f = ctx.ui.filters;
    const show = f.covShow ?? "all";
    const q = (f.covQuery ?? "").toLowerCase();
    const byAc = new Map(m.criteria.list.map((c) => [c.id, c]));
    const activeCases = p.testCases.filter((t) => t.state === "active");

    const groups = p.requirements.filter((r) => r.state === "active").map((r) => {
        const rows = M.criteriaOf(p, r.id).filter((c) => {
            const info = byAc.get(c.id);
            if (c.state !== "active" || (q && !`${c.id} ${c.text} ${r.id} ${r.title}`.toLowerCase().includes(q))) return false;
            if (show === "unmapped") return info && !info.caseIds.length;
            if (show === "problems") return info && ["failed", "blocked"].includes(info.result);
            if (show === "retired") return info?.onlyRetired;
            return true;
        });
        return rows.length ? `<section class="${P}-cov"><h3>${e(r.id)} ${e(r.title)}</h3><ul class="${P}-list">${rows.map((c) => row(ctx, c, byAc.get(c.id), activeCases)).join("")}</ul></section>` : "";
    }).join("");

    return `${heading("Coverage and traceability")}${note("Each criterion and the test cases mapped to it. Mapped is not tested, and tested is not passed: the result comes from the latest runs, all builds.")}
        <dl class="${P}-figs">${[
            fig("Accepted criteria", String(m.criteria.counted)),
            fig("Mapped to an active test case", m.criteria.counted ? `${m.criteria.mapped} of ${m.criteria.counted}` : "None to map", percent(m.criteria.mapped, m.criteria.counted)),
            fig("Not mapped", String(m.criteria.unmapped.length), m.criteria.onlyRetired.length ? `${m.criteria.onlyRetired.length} only to retired cases` : ""),
            fig("With an executed test", `${m.criteria.executed} of ${m.criteria.counted}`),
            fig("Criterion results", `${m.criteria.results.passed} passed, ${m.criteria.results.failed} failed, ${m.criteria.results.blocked} blocked`, `${m.criteria.results["partly-run"]} partly run, ${m.criteria.results["not-run"]} not run`),
            fig("Active test cases linked to a criterion", `${m.cases.linked} of ${m.cases.active}`)
        ].join("")}</dl>
        ${toolbar(search("covQuery", "Search criteria", f.covQuery ?? ""), filter("covShow", "Show", opt("all", "All criteria", show) + opt("unmapped", "Not mapped", show) + opt("problems", "Failed or blocked", show) + opt("retired", "Mapped only to retired cases", show)), btn("csv", "Download traceability CSV", { id: "traceability" }))}
        ${groups || empty(p.criteria.length ? "No criterion matches." : "No acceptance criteria yet. Add them in Requirements.")}
        ${m.cases.unlinked.length ? `<h3>Active test cases not linked to an accepted criterion</h3><p>${e(m.cases.unlinked.join(", "))}</p>` : ""}`;

}

export const actions = {

    ...records,

    map: (ctx, id) => {
        ctx.ui.mapping = id;
        return redrawTo(ctx, "form[data-form=map] select");
    },

    unmap: async (ctx, id) => {
        const m = ctx.s.project.mappings.find((x) => x.id === id);
        if (!m || !window.confirm(`Remove the mapping of ${m.acId} to ${m.tcId}?`)) return;
        M.removeMapping(ctx.s.project, id);
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${m.acId} is no longer mapped to ${m.tcId}.`);
    }

};

export const submit = {

    async map(ctx, formEl, v) {
        const r = M.addMapping(ctx.s.project, formEl.dataset.ac, v.tcId);
        if (r.errors) return showErrors(ctx, formEl, r.errors);
        ctx.ui.mapping = "";
        ctx.changed();
        await ctx.redraw();
        ctx.announce(`${formEl.dataset.ac} mapped to ${v.tcId}.`);
    }

};
