/* =========================================================
   ToolZen Hub
   QA Workbench: limits, ids, time, lookups and the project itself
   (Tool Pack 59 section 6). Small on purpose: the first load needs
   only this; model.js adds the vocabulary and the record operations
   and re-exports everything here. Pure.
========================================================= */

export const KIND = "qa-project";
export const SCHEMA = 1;

/* QD31: provisional until timed on real phones (Tool Pack 59 section 11) */
export const LIMITS = Object.freeze({
    fileBytes: 3000000, requirements: 100, criteria: 400, testCases: 500, mappings: 5000, executions: 2000, defects: 200, steps: 30
});

/* the longest text each field keeps */
export const MAX = Object.freeze({ name: 120, title: 200, short: 120, text: 4000, criterion: 1000, step: 1000, note: 2000 });

export const TYPES = Object.freeze({
    REQ: { width: 3, collection: "requirements" },
    AC: { width: 3, collection: "criteria" },
    TC: { width: 3, collection: "testCases" },
    MAP: { width: 4, collection: "mappings" },
    EX: { width: 4, collection: "executions" },
    DEF: { width: 3, collection: "defects" }
});

const ID_RE = /^(REQ|AC|TC|MAP|EX|DEF)-(\d{3,6})$/;

export const formatId = (type, n) => `${type}-${String(n).padStart(TYPES[type].width, "0")}`;

/** { type, n } of a well-formed id, or null */
export function parseId(id) {

    const m = ID_RE.exec(String(id ?? ""));

    return m && TYPES[m[1]].width <= m[2].length ? { type: m[1], n: Number(m[2]) } : null;

}

/** The visitor's local date and time as YYYY-MM-DDTHH:MM (the form of a datetime-local field). */
export function stamp(date = new Date()) {

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

}

export const STAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/* text as stored: newlines normalised, trimmed, capped; a line has no newlines */
export const cleanText = (value, max) => String(value ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max);
export const cleanLine = (value, max) => cleanText(value, max).replace(/\s*\n\s*/g, " ");

/* ---------- lookups ---------- */

export const byId = (list, id) => list.find((r) => r.id === id) ?? null;

export function find(p, id) {

    const parsed = parseId(id);

    return parsed ? byId(p[TYPES[parsed.type].collection], id) : null;

}

export const criteriaOf = (p, reqId) => p.criteria.filter((c) => c.reqId === reqId);
export const mappingsOfCriterion = (p, acId) => p.mappings.filter((m) => m.acId === acId);
export const mappingsOfCase = (p, tcId) => p.mappings.filter((m) => m.tcId === tcId);
export const runsOfCase = (p, tcId) => p.executions.filter((e) => e.tcId === tcId);
export const defectsOfCase = (p, tcId) => p.defects.filter((d) => d.tcIds.includes(tcId));
export const defectsOfRun = (p, exId) => p.defects.filter((d) => d.exIds.includes(exId));

/* ---------- the project ---------- */

export function emptyProject(now = stamp()) {

    return {
        project: { name: "", description: "", feature: "", build: "", environment: "", owner: "", scope: "", createdOn: now, updatedOn: now },
        next: { REQ: 1, AC: 1, TC: 1, MAP: 1, EX: 1, DEF: 1 },
        requirements: [], criteria: [], testCases: [], mappings: [], executions: [], defects: []
    };

}

function projectFields(input) {

    return {
        name: cleanLine(input.name, MAX.name),
        description: cleanText(input.description, MAX.text),
        feature: cleanLine(input.feature, MAX.title),
        build: cleanLine(input.build, MAX.short),
        environment: cleanLine(input.environment, MAX.title),
        owner: cleanLine(input.owner, MAX.short),
        scope: cleanText(input.scope, MAX.note)
    };

}

/** A new project, or { errors } (the name is required). */
export function createProject(input = {}, now = stamp()) {

    const fields = projectFields(input);
    if (!fields.name) return { errors: { name: "Give the project a name." } };

    const p = emptyProject(now);
    Object.assign(p.project, fields);

    return { project: p };

}

export function updateProject(p, input, now = stamp()) {

    const fields = projectFields({ ...p.project, ...input });
    if (!fields.name) return { errors: { name: "Give the project a name." } };

    Object.assign(p.project, fields, { updatedOn: now });

    return { ok: true };

}
