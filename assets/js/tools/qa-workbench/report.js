/* =========================================================
   ToolZen Hub
   QA Workbench: the QA report and the CSV downloads (Tool Pack
   59 sections 7 and 8; QD21, QD22)

   The report is written from the records and the metrics only.
   It says what mapped, executed and passed mean, states its
   scope, and never gives a readiness score or a release verdict:
   a release decision appears only as the visitor's own words.
   CSV cells are quoted, and a cell a spreadsheet would run as a
   formula is made plain text. Pure.
========================================================= */

import { LABELS, byId } from "./model.js";
import { metrics, percent, RESULT_LABELS } from "./metrics.js";
import { neutral } from "./project-file.js";

const inline = (value) => neutral(value).replace(/\s*\n\s*/g, " ").trim();
const list = (ids) => (ids.length ? ids.join(", ") : "none");

/** The QA report in Markdown. options: { build, decision, notes, generatedOn } */
export function buildReport(p, { build = "", decision = "", notes = "", generatedOn = "" } = {}) {

    const m = metrics(p, { build });
    const info = p.project;
    const out = [];
    const push = (...lines) => out.push(...lines);
    const scope = build ? `build ${inline(build)} only` : "all builds";
    const title = (id) => inline(byId(p.testCases, id)?.title ?? "");

    push(`# QA report: ${inline(info.name)}`, "");
    push(`Generated ${generatedOn}. Test runs counted: ${scope}.`, "");

    push("## Project", "");
    for (const [label, value] of [["Feature or application", info.feature], ["Build or version", build || info.build], ["Environment", info.environment], ["Owner", info.owner]]) {
        if (value) push(`- ${label}: ${inline(value)}`);
    }
    if (info.scope) push("", `Testing scope: ${inline(info.scope)}`);
    push("");

    push("## Requirements and acceptance criteria", "");
    push(`- Active requirements: ${m.requirements.active} (fully mapped ${m.requirements.mapping.full.length}, partly mapped ${m.requirements.mapping.partial.length}, not mapped ${m.requirements.mapping.none.length}, without accepted criteria ${m.requirements.mapping.noCriteria.length}).`);
    push(`- Accepted acceptance criteria: ${m.criteria.counted}. Needs clarification: ${list(m.criteria.clarify)}. Excluded: ${list(m.criteria.excluded)}.`);
    push("");

    push("## Traceability", "");
    if (m.criteria.counted) {
        push(`- Mapped to at least one active test case: ${m.criteria.mapped} of ${m.criteria.counted} (${percent(m.criteria.mapped, m.criteria.counted)}).`);
        push(`- With at least one executed test (pass or fail) in scope: ${m.criteria.executed} of ${m.criteria.counted}.`);
        push(`- Results: passed ${m.criteria.results.passed}, failed ${m.criteria.results.failed}, blocked ${m.criteria.results.blocked}, partly run ${m.criteria.results["partly-run"]}, not run ${m.criteria.results["not-run"]}, not mapped ${m.criteria.results.unmapped}.`);
        push(`- Not mapped: ${list(m.criteria.unmapped)}.`);
        if (m.criteria.onlyRetired.length) push(`- Mapped only to retired test cases: ${list(m.criteria.onlyRetired)}.`);
    } else {
        push("- No accepted acceptance criteria, so there is nothing to measure coverage against.");
    }
    push("");

    push("## Test cases and runs", "");
    push(`- Active test cases: ${m.cases.active} (${m.cases.linked} linked to an accepted criterion; not linked: ${list(m.cases.unlinked)}).`);
    push(`- Latest result in scope: pass ${m.runs.pass.length}, fail ${m.runs.fail.length}, blocked ${m.runs.blocked.length}, not run ${m.runs.notRun.length}.`);
    if (m.cases.active) push(`- Passed ${m.runs.pass.length} of ${m.cases.active} active test cases${percent(m.runs.pass.length, m.cases.active) ? ` (${percent(m.runs.pass.length, m.cases.active)})` : ""}.`);
    if (m.runs.executed) push(`- Passed ${m.runs.pass.length} of ${m.runs.executed} executed test cases (pass and fail; blocked cases are not executed) (${percent(m.runs.pass.length, m.runs.executed)}).`);
    push(`- Test runs recorded in scope: ${m.runs.total}.`);
    if (m.runs.fail.length) push("", "Failed:", "", ...m.runs.fail.map((id) => `- ${id} ${title(id)}: ${inline(m.runs.latest.get(id).actual)}`));
    if (m.runs.blocked.length) push("", "Blocked:", "", ...m.runs.blocked.map((id) => `- ${id} ${title(id)}: ${inline(m.runs.latest.get(id).actual)}`));
    if (m.runs.notRun.length) push("", `Not run: ${list(m.runs.notRun)}.`);
    push("");

    push("## Defects", "");
    push(`- Outstanding (open, and fixed awaiting retest): ${m.defects.outstanding}.`);
    push(`- Open ${m.defects.open.length}, fixed awaiting retest ${m.defects.retest.length}, deferred ${m.defects.deferred.length}, closed ${m.defects.closed.length}.`);
    for (const d of p.defects.filter((x) => x.status !== "closed")) {
        push(`- ${d.id} ${inline(d.title)}: ${LABELS[d.status]}, severity ${LABELS[d.severity]}, priority ${LABELS[d.priority]}${d.reason ? ` (${inline(d.reason)})` : ""}${d.tcIds.length ? `; ${d.tcIds.join(", ")}` : ""}.`);
    }
    if (m.defects.failedWithoutDefect.length) push(`- Failed test cases with no defect linked: ${list(m.defects.failedWithoutDefect)}.`);
    push("");

    if (decision || notes) {
        push("## Notes and decision (written by the tester)", "");
        if (decision) push(`Release decision: ${inline(decision)}`, "");
        if (notes) push(neutral(notes).trim(), "");
    }

    push("## How to read this report", "");
    push("- Mapped means a test case is linked to the criterion. It does not mean the criterion was tested.");
    push("- Executed means the latest run in scope passed or failed. It does not mean the test passed.");
    push("- A test case can have several runs; the latest run in scope (by date and time) gives its result.");
    push(`- Runs are counted for ${scope}.`);
    push("- Blocked tests are not passed and not executed. Not-run cases have no run in scope.");
    push("- Defects fixed and awaiting retest are still outstanding.");
    push("- These figures are counts of the records in this project. They are not a judgement of release readiness.");

    return `${out.join("\n")}\n`;

}

/* ---------- CSV ---------- */

/** One cell: quoted, inner quotes doubled, and a leading = + - @ tab or return made plain text. */
export function csvCell(value) {

    let s = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;

    return `"${s.replace(/"/g, '""')}"`;

}

export const csv = (header, rows) => `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;

export function csvFiles(p, { build = "" } = {}) {

    const m = metrics(p, { build });
    const result = new Map(m.criteria.list.map((c) => [c.id, c]));

    return {
        traceability: csv(
            ["Criterion", "Requirement", "Criterion text", "Status", "State", "Mapped test cases", "Result in scope"],
            p.criteria.map((c) => {
                const r = result.get(c.id);
                return [c.id, c.reqId, c.text, LABELS[c.status], LABELS[c.state], p.mappings.filter((x) => x.acId === c.id).map((x) => x.tcId).join(" "), r ? RESULT_LABELS[r.result] : "Not counted"];
            })
        ),
        "test-cases": csv(
            ["Test case", "Title", "Priority", "Type", "State", "Covers", "Preconditions", "Test data", "Steps", "Expected result", "Latest result in scope"],
            p.testCases.map((t) => [
                t.id, t.title, LABELS[t.priority], t.type ? LABELS[t.type] : "", LABELS[t.state],
                p.mappings.filter((x) => x.tcId === t.id).map((x) => x.acId).join(" "), t.pre, t.data,
                t.steps.map((s, i) => `${i + 1}. ${s.action}${s.expected ? ` => ${s.expected}` : ""}`).join("\n"), t.expected,
                m.runs.latest.get(t.id) ? LABELS[m.runs.latest.get(t.id).status] : (t.state === "active" ? "Not run" : "")
            ])
        ),
        runs: csv(
            ["Run", "Test case", "Result", "Build", "Environment", "Tester", "Executed on", "Actual result", "Notes"],
            p.executions.map((e) => [e.id, e.tcId, LABELS[e.status], e.build, e.environment, e.tester, e.executedOn, e.actual, e.notes])
        ),
        defects: csv(
            ["Defect", "Title", "Status", "Severity", "Priority", "Test cases", "Runs", "Build", "Environment", "Reporter", "Assignee", "Actual", "Expected", "Steps", "Reason", "Resolution"],
            p.defects.map((d) => [d.id, d.title, LABELS[d.status], LABELS[d.severity], LABELS[d.priority], d.tcIds.join(" "), d.exIds.join(" "), d.build, d.environment, d.reporter, d.assignee, d.actual, d.expected, d.steps, d.reason, d.resolution])
        )
    };

}
