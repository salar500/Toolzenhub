/* =========================================================
   ToolZen Hub
   QA Workbench: the record operations (Tool Pack 59 sections 6
   and 8; QD18, QD19)

   Every record has a stable id from a per-type counter that only
   increases; a record that something refers to is retired, never
   deleted. Each operation checks its input and either changes the
   project and returns { id }, or leaves it untouched and returns
   { errors } keyed by field, in words. Loaded by the stages that
   change records; core.js (re-exported here) is the rest. Pure
   apart from the project object it is given.
========================================================= */

import {
    LIMITS, MAX, TYPES, STAMP_RE, formatId, parseId, stamp, cleanText as text, cleanLine as line, byId, find, criteriaOf, mappingsOfCriterion,
    mappingsOfCase, runsOfCase, defectsOfCase, defectsOfRun
} from "./core.js";

export * from "./core.js";

/* the vocabulary of records: only the stages that edit them load it */
export const PLURALS = Object.freeze({
    requirements: "requirements", criteria: "acceptance criteria", testCases: "test cases", mappings: "mappings", executions: "test runs", defects: "defects"
});

export const PRIORITIES = Object.freeze(["high", "medium", "low"]);
export const CRITERION_STATUS = Object.freeze(["accepted", "clarify", "excluded"]);
export const CASE_TYPES = Object.freeze(["", "positive", "negative", "boundary", "validation", "integration", "regression", "exploratory", "security", "usability"]);
export const RUN_STATUS = Object.freeze(["pass", "fail", "blocked"]);
export const SEVERITIES = Object.freeze(["critical", "major", "minor", "trivial"]);
export const DEFECT_STATUS = Object.freeze(["open", "retest", "deferred", "closed"]);
export const STATES = Object.freeze(["active", "retired"]);

export const LABELS = Object.freeze({
    accepted: "Accepted", clarify: "Needs clarification", excluded: "Excluded",
    pass: "Pass", fail: "Fail", blocked: "Blocked",
    open: "Open", retest: "Fixed, awaiting retest", deferred: "Deferred", closed: "Closed",
    high: "High", medium: "Medium", low: "Low",
    critical: "Critical", major: "Major", minor: "Minor", trivial: "Trivial",
    positive: "Positive", negative: "Negative", boundary: "Boundary", validation: "Validation", integration: "Integration",
    regression: "Regression", exploratory: "Exploratory", security: "Security", usability: "Usability",
    active: "Active", retired: "Retired"
});

const oneOf = (value, list, fallback) => (list.includes(value) ? value : fallback);
const ids = (value, type) => [...new Set((Array.isArray(value) ? value : []).filter((id) => parseId(id)?.type === type))];

function nextId(p, type) {

    const id = formatId(type, p.next[type]);
    p.next[type] += 1;

    return id;

}

const touch = (p, now) => {
    p.project.updatedOn = now;
};

const full = (p, key) => p[key].length >= LIMITS[key];
const fullError = (key) => ({ form: `This project has reached its limit of ${LIMITS[key]} ${PLURALS[key]}. Download it and start a second project for further work.` });
const missing = (id) => ({ errors: { form: `${id} does not exist.` } });
const errorsOf = (errors) => (Object.keys(errors).length ? errors : null);

/* ---------- requirements ---------- */

const requirementFields = (input) => ({
    title: line(input.title, MAX.title),
    description: text(input.description, MAX.text),
    source: line(input.source, MAX.title),
    priority: oneOf(input.priority, PRIORITIES, "medium")
});

export function addRequirement(p, input, now = stamp()) {

    if (full(p, "requirements")) return { errors: fullError("requirements") };

    const fields = requirementFields(input);
    if (!fields.title) return { errors: { title: "Give the requirement a title." } };

    const id = nextId(p, "REQ");
    p.requirements.push({ id, ...fields, state: "active", createdOn: now, updatedOn: now });
    touch(p, now);

    return { id };

}

export function updateRequirement(p, id, input, now = stamp()) {

    const r = byId(p.requirements, id);
    if (!r) return missing(id);

    const fields = requirementFields({ ...r, ...input });
    if (!fields.title) return { errors: { title: "Give the requirement a title." } };

    Object.assign(r, fields, { updatedOn: now });
    touch(p, now);

    return { id };

}

/* ---------- acceptance criteria ---------- */

function criterionFields(input) {

    const status = oneOf(input.status, CRITERION_STATUS, "accepted");

    return { text: text(input.text, MAX.criterion), notes: text(input.notes, MAX.note), status, reason: status === "excluded" ? line(input.reason, MAX.title) : "" };

}

const criterionErrors = (f) => errorsOf({
    ...(f.text ? {} : { text: "Write what the criterion requires." }),
    ...(f.status === "excluded" && !f.reason ? { reason: "Say why the criterion is excluded." } : {})
});

export function addCriterion(p, reqId, input, now = stamp()) {

    const r = byId(p.requirements, reqId);
    if (!r) return missing(reqId);
    if (r.state === "retired") return { errors: { form: `${reqId} is retired. Restore it before adding criteria.` } };
    if (full(p, "criteria")) return { errors: fullError("criteria") };

    const fields = criterionFields(input);
    const errors = criterionErrors(fields);
    if (errors) return { errors };

    const id = nextId(p, "AC");
    p.criteria.push({ id, reqId, ...fields, state: "active", createdOn: now, updatedOn: now });
    touch(p, now);

    return { id };

}

export function updateCriterion(p, id, input, now = stamp()) {

    const c = byId(p.criteria, id);
    if (!c) return missing(id);

    const fields = criterionFields({ ...c, ...input });
    const errors = criterionErrors(fields);
    if (errors) return { errors };

    Object.assign(c, fields, { updatedOn: now });
    touch(p, now);

    return { id };

}

/* ---------- test cases ---------- */

const steps = (list) => (Array.isArray(list) ? list : [])
    .map((s) => ({ action: text(s?.action, MAX.step), expected: text(s?.expected, MAX.step) }))
    .filter((s) => s.action || s.expected)
    .slice(0, LIMITS.steps);

const caseFields = (input) => ({
    title: line(input.title, MAX.title),
    objective: text(input.objective, MAX.note),
    pre: text(input.pre, MAX.note),
    data: text(input.data, MAX.note),
    steps: steps(input.steps),
    expected: text(input.expected, MAX.note),
    priority: oneOf(input.priority, PRIORITIES, "medium"),
    type: oneOf(input.type, CASE_TYPES, ""),
    area: line(input.area, MAX.short),
    automation: line(input.automation, MAX.title),
    origin: input.origin === "ai" ? "ai" : "typed"
});

function caseErrors(f) {

    if (!f.title) return { title: "Give the test case a title." };
    if (!f.steps.some((s) => s.action)) return { steps: "Add at least one step with an action." };
    if (!f.expected && !f.steps.some((s) => s.expected)) return { expected: "Write the expected result, for the case or for a step." };

    return null;

}

/** input.acIds: criteria to map the new case to (each must be active) */
export function addTestCase(p, input, now = stamp()) {

    if (full(p, "testCases")) return { errors: fullError("testCases") };

    const fields = caseFields(input);
    const errors = caseErrors(fields);
    if (errors) return { errors };

    const id = nextId(p, "TC");
    p.testCases.push({ id, ...fields, state: "active", createdOn: now, updatedOn: now });
    for (const acId of ids(input.acIds, "AC")) addMapping(p, acId, id, now);
    touch(p, now);

    return { id };

}

export function updateTestCase(p, id, input, now = stamp()) {

    const t = byId(p.testCases, id);
    if (!t) return missing(id);

    const fields = caseFields({ ...t, ...input, origin: t.origin });
    const errors = caseErrors(fields);
    if (errors) return { errors };

    Object.assign(t, fields, { updatedOn: now });
    touch(p, now);

    return { id };

}

/** A copy with a new id and a "Copy of" title; mappings, runs and defects are not copied (a copy covers nothing until mapped). */
export function duplicateTestCase(p, id, now = stamp()) {

    const t = byId(p.testCases, id);
    if (!t) return missing(id);

    return addTestCase(p, { ...t, title: `Copy of ${t.title}`.slice(0, MAX.title), steps: t.steps.map((s) => ({ ...s })), origin: "typed" }, now);

}

/* ---------- mappings: one record per criterion and test case pair ---------- */

export function addMapping(p, acId, tcId, now = stamp()) {

    const c = byId(p.criteria, acId);
    const t = byId(p.testCases, tcId);
    if (!c || !t) return missing(!c ? acId : tcId);
    if (c.state === "retired" || t.state === "retired") return { errors: { form: `${c.state === "retired" ? acId : tcId} is retired. Restore it before mapping.` } };
    if (p.mappings.some((m) => m.acId === acId && m.tcId === tcId)) return { errors: { form: `${acId} is already mapped to ${tcId}.` } };
    if (full(p, "mappings")) return { errors: fullError("mappings") };

    const id = nextId(p, "MAP");
    p.mappings.push({ id, acId, tcId, createdOn: now });
    touch(p, now);

    return { id };

}

export function removeMapping(p, id, now = stamp()) {

    const i = p.mappings.findIndex((m) => m.id === id);
    if (i < 0) return missing(id);

    p.mappings.splice(i, 1);
    touch(p, now);

    return { id };

}

/* ---------- test runs ---------- */

export function addExecution(p, input, now = stamp()) {

    if (full(p, "executions")) return { errors: fullError("executions") };

    const t = byId(p.testCases, input.tcId);
    if (!t) return { errors: { tcId: "Choose a test case." } };
    if (t.state === "retired") return { errors: { tcId: `${t.id} is retired. Restore it before running it.` } };

    const status = RUN_STATUS.includes(input.status) ? input.status : "";
    const fields = {
        tcId: t.id,
        status,
        build: line(input.build, MAX.short),
        environment: line(input.environment, MAX.title),
        tester: line(input.tester, MAX.short),
        executedOn: STAMP_RE.test(String(input.executedOn ?? "")) ? input.executedOn : "",
        actual: text(input.actual, MAX.note),
        notes: text(input.notes, MAX.note)
    };

    const errors = errorsOf({
        ...(status ? {} : { status: "Choose Pass, Fail or Blocked." }),
        ...(fields.executedOn ? {} : { executedOn: "Give the date and time of the run." }),
        ...((status === "fail" || status === "blocked") && !fields.actual ? { actual: status === "fail" ? "Say what actually happened." : "Say what blocked the test." } : {})
    });
    if (errors) return { errors };

    const id = nextId(p, "EX");
    p.executions.push({ id, ...fields, createdOn: now });
    touch(p, now);

    return { id };

}

/** A run recorded by mistake may be removed while no defect refers to it; history is otherwise kept. */
export function deleteExecution(p, id, now = stamp()) {

    const i = p.executions.findIndex((e) => e.id === id);
    if (i < 0) return missing(id);

    const linked = defectsOfRun(p, id);
    if (linked.length) return { errors: { form: `${id} is linked to ${linked.map((d) => d.id).join(", ")}; remove the link first.` } };

    p.executions.splice(i, 1);
    touch(p, now);

    return { id };

}

/* ---------- defects ---------- */

function defectFields(p, input) {

    const status = oneOf(input.status, DEFECT_STATUS, "open");

    return {
        title: line(input.title, MAX.title),
        description: text(input.description, MAX.text),
        steps: text(input.steps, MAX.text),
        expected: text(input.expected, MAX.note),
        actual: text(input.actual, MAX.note),
        severity: oneOf(input.severity, SEVERITIES, ""),
        priority: oneOf(input.priority, PRIORITIES, ""),
        status,
        reason: status === "deferred" ? line(input.reason, MAX.title) : "",
        environment: line(input.environment, MAX.title),
        build: line(input.build, MAX.short),
        reporter: line(input.reporter, MAX.short),
        assignee: line(input.assignee, MAX.short),
        tcIds: ids(input.tcIds, "TC").filter((id) => byId(p.testCases, id)),
        exIds: ids(input.exIds, "EX").filter((id) => byId(p.executions, id)),
        resolution: text(input.resolution, MAX.note)
    };

}

const defectErrors = (f) => errorsOf({
    ...(f.title ? {} : { title: "Give the defect a title." }),
    ...(f.actual ? {} : { actual: "Say what actually happens." }),
    ...(f.severity ? {} : { severity: "Choose a severity." }),
    ...(f.priority ? {} : { priority: "Choose a priority." }),
    ...(f.status === "deferred" && !f.reason ? { reason: "Say why the defect is deferred." } : {})
});

export function addDefect(p, input, now = stamp()) {

    if (full(p, "defects")) return { errors: fullError("defects") };

    const fields = defectFields(p, input);
    const errors = defectErrors(fields);
    if (errors) return { errors };

    const id = nextId(p, "DEF");
    p.defects.push({ id, ...fields, history: [{ on: now, status: fields.status }], createdOn: now, updatedOn: now });
    touch(p, now);

    return { id };

}

/** Edits a defect; a change of status is added to its history. */
export function updateDefect(p, id, input, now = stamp()) {

    const d = byId(p.defects, id);
    if (!d) return missing(id);

    const fields = defectFields(p, { ...d, ...input });
    const errors = defectErrors(fields);
    if (errors) return { errors };

    if (fields.status !== d.status) d.history.push({ on: now, status: fields.status });
    Object.assign(d, fields, { updatedOn: now });
    touch(p, now);

    return { id };

}

/* ---------- retire, restore and delete (QD19) ---------- */

/** What refers to a record, in words; empty when nothing does. */
export function referencesTo(p, id) {

    const type = parseId(id)?.type;
    const out = [];
    const n = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

    if (type === "REQ") {
        const mapped = criteriaOf(p, id).filter((c) => mappingsOfCriterion(p, c.id).length);
        if (mapped.length) out.push(`mapped criteria ${mapped.map((c) => c.id).join(", ")}`);
    } else if (type === "AC") {
        const maps = mappingsOfCriterion(p, id);
        if (maps.length) out.push(`${n(maps.length, "mapping")} to ${maps.map((m) => m.tcId).join(", ")}`);
    } else if (type === "TC") {
        const maps = mappingsOfCase(p, id);
        const runs = runsOfCase(p, id);
        const defects = defectsOfCase(p, id);
        if (maps.length) out.push(n(maps.length, "mapping"));
        if (runs.length) out.push(n(runs.length, "test run"));
        if (defects.length) out.push(`defect${defects.length === 1 ? "" : "s"} ${defects.map((d) => d.id).join(", ")}`);
    }

    return out;

}

export function setState(p, id, state, now = stamp()) {

    const type = parseId(id)?.type;
    if (!["REQ", "AC", "TC"].includes(type) || !STATES.includes(state)) return { errors: { form: `${id} cannot be ${state}.` } };

    const r = find(p, id);
    if (!r) return missing(id);
    if (state === "active" && type === "AC" && byId(p.requirements, r.reqId)?.state === "retired") {
        return { errors: { form: `Restore ${r.reqId} first: ${id} belongs to it.` } };
    }

    r.state = state;
    r.updatedOn = now;
    touch(p, now);

    return { id };

}

/** Deletes a requirement (with its criteria), a criterion or a test case only when nothing refers to it. */
export function deleteRecord(p, id, now = stamp()) {

    const type = parseId(id)?.type;
    if (!["REQ", "AC", "TC"].includes(type)) return { errors: { form: `${id} cannot be deleted.` } };
    if (!find(p, id)) return missing(id);

    const refs = referencesTo(p, id);
    if (refs.length) return { errors: { form: `${id} is in use (${refs.join("; ")}). Retire it instead.` } };

    if (type === "REQ") {
        p.criteria = p.criteria.filter((c) => c.reqId !== id);
        p.requirements = p.requirements.filter((r) => r.id !== id);
    } else {
        const key = TYPES[type].collection;
        p[key] = p[key].filter((r) => r.id !== id);
    }

    touch(p, now);

    return { id };

}
