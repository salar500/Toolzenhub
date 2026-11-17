/* =========================================================
   ToolZen Hub
   QA Workbench: the calculations (Tool Pack 59 section 8; QD6,
   QD21)

   Every number comes from the records; nothing is stored. Mapped,
   executed and passed stay apart: a mapped criterion is never
   called tested, a tested one never called passed, and there is
   no combined readiness score. Pure.

   Counted test case: state active. Counted criterion: state
   active, status accepted, and its requirement active. Latest run
   of a case in scope: its run with the latest executedOn in the
   chosen build (or in all builds), ties broken by the higher run
   number.
========================================================= */

import { parseId } from "./core.js";

const num = (id) => parseId(id)?.n ?? 0;

/** The runs in scope: one build label, or every run when build is "". */
export const runsInScope = (p, build = "") => p.executions.filter((e) => !build || e.build === build);

/** The build labels used by runs, in first-use order. */
export function buildsOf(p) {

    return [...new Set(p.executions.map((e) => e.build).filter(Boolean))];

}

/** Map of test case id to its latest run in scope. */
export function latestRuns(p, build = "") {

    const latest = new Map();

    for (const e of runsInScope(p, build)) {
        const known = latest.get(e.tcId);
        if (!known || e.executedOn > known.executedOn || (e.executedOn === known.executedOn && num(e.id) > num(known.id))) latest.set(e.tcId, e);
    }

    return latest;

}

export function countedSets(p) {

    const activeReqs = new Set(p.requirements.filter((r) => r.state === "active").map((r) => r.id));
    const criteria = p.criteria.filter((c) => c.state === "active" && c.status === "accepted" && activeReqs.has(c.reqId));
    const cases = p.testCases.filter((t) => t.state === "active");

    return { activeReqs, criteria, cases, caseIds: new Set(cases.map((t) => t.id)) };

}

/** The result of one criterion from the latest runs of its mapped counted cases. */
export function criterionResult(caseIds, latest) {

    if (!caseIds.length) return "unmapped";

    const statuses = caseIds.map((id) => latest.get(id)?.status ?? "none");

    if (statuses.includes("fail")) return "failed";
    if (statuses.includes("blocked")) return "blocked";
    if (statuses.every((s) => s === "pass")) return "passed";
    if (statuses.includes("pass")) return "partly-run";

    return "not-run";

}

export const RESULT_LABELS = Object.freeze({
    unmapped: "Not mapped", failed: "Failed", blocked: "Blocked", passed: "Passed", "partly-run": "Partly run", "not-run": "Not run"
});

export const percent = (n, d) => (d ? `${(Math.round((n / d) * 1000) / 10).toFixed(1)} %` : "");

/** Everything the Overview, Coverage, Execution, Defects and Report stages show, for one scope. */
export function metrics(p, { build = "" } = {}) {

    const { activeReqs, criteria, cases, caseIds } = countedSets(p);
    const latest = latestRuns(p, build);

    /* criteria: mapping and result */
    const perCriterion = criteria.map((c) => {
        const mapped = p.mappings.filter((m) => m.acId === c.id);
        const counted = mapped.map((m) => m.tcId).filter((id) => caseIds.has(id));
        return {
            id: c.id,
            reqId: c.reqId,
            text: c.text,
            caseIds: counted,
            onlyRetired: !counted.length && mapped.length > 0,
            result: criterionResult(counted, latest)
        };
    });

    const mapped = perCriterion.filter((c) => c.caseIds.length);
    const executed = perCriterion.filter((c) => c.caseIds.some((id) => ["pass", "fail"].includes(latest.get(id)?.status)));
    const results = { passed: 0, failed: 0, blocked: 0, "partly-run": 0, "not-run": 0, unmapped: 0 };
    for (const c of perCriterion) results[c.result] += 1;

    /* requirements: how fully their counted criteria are mapped */
    const reqMapping = { full: [], partial: [], none: [], noCriteria: [] };
    for (const r of p.requirements.filter((x) => activeReqs.has(x.id))) {
        const own = perCriterion.filter((c) => c.reqId === r.id);
        const n = own.filter((c) => c.caseIds.length).length;
        const bucket = !own.length ? "noCriteria" : n === own.length ? "full" : n ? "partial" : "none";
        reqMapping[bucket].push(r.id);
    }

    /* test cases: latest result in scope */
    const runs = { pass: [], fail: [], blocked: [], notRun: [] };
    for (const t of cases) {
        const s = latest.get(t.id)?.status;
        (s ? runs[s] : runs.notRun).push(t.id);
    }

    const countedAc = new Set(criteria.map((c) => c.id));
    const linkedCases = cases.filter((t) => p.mappings.some((m) => m.tcId === t.id && countedAc.has(m.acId)));

    /* defects */
    const defects = { open: [], retest: [], deferred: [], closed: [] };
    for (const d of p.defects) defects[d.status].push(d.id);
    const failedWithoutDefect = runs.fail.filter((tcId) => !p.defects.some((d) => d.tcIds.includes(tcId)));

    const executedCases = runs.pass.length + runs.fail.length;

    return {
        scope: build,
        requirements: {
            active: activeReqs.size,
            retired: p.requirements.length - activeReqs.size,
            mapping: reqMapping
        },
        criteria: {
            counted: criteria.length,
            mapped: mapped.length,
            unmapped: perCriterion.filter((c) => !c.caseIds.length).map((c) => c.id),
            onlyRetired: perCriterion.filter((c) => c.onlyRetired).map((c) => c.id),
            executed: executed.length,
            results,
            clarify: p.criteria.filter((c) => c.state === "active" && c.status === "clarify" && activeReqs.has(c.reqId)).map((c) => c.id),
            excluded: p.criteria.filter((c) => c.state === "active" && c.status === "excluded" && activeReqs.has(c.reqId)).map((c) => c.id),
            outOfScope: p.criteria.filter((c) => c.state === "retired" || !activeReqs.has(c.reqId)).map((c) => c.id),
            list: perCriterion
        },
        cases: {
            active: cases.length,
            retired: p.testCases.length - cases.length,
            linked: linkedCases.length,
            unlinked: cases.filter((t) => !linkedCases.includes(t)).map((t) => t.id)
        },
        runs: {
            pass: runs.pass,
            fail: runs.fail,
            blocked: runs.blocked,
            notRun: runs.notRun,
            executed: executedCases,
            total: runsInScope(p, build).length,
            latest
        },
        defects: {
            ...defects,
            outstanding: defects.open.length + defects.retest.length,
            failedWithoutDefect
        }
    };

}
