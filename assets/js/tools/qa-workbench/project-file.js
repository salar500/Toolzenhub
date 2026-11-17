/* =========================================================
   ToolZen Hub
   QA Workbench: the project file (Tool Pack 59 section 7; QD3,
   QD4, QD15, QD17, QD20)

   A project downloads as readable Markdown ending with one
   ToolZen Hub data comment (pack-format.js, rule 4.11 c), kind
   "qa-project", schema 1. Opening reads only that comment and
   validates the whole project before anything is replaced: one
   error refuses the file, nothing is repaired, unknown fields are
   ignored and listed. A counter lower than the ids already used is
   raised (no record changes) and a note says so. The data is the
   visitor's own file and untrusted: only known keys are copied
   into new objects, so no key of the file can reach a prototype.
   Pure.
========================================================= */

import { withMeta, readMeta, slug, today } from "../ai-tools/common/pack-format.js";
import {
    KIND, SCHEMA, LIMITS, MAX, TYPES, PRIORITIES, CRITERION_STATUS, CASE_TYPES, RUN_STATUS, SEVERITIES, DEFECT_STATUS, STATES,
    LABELS, STAMP_RE, parseId, mappingsOfCriterion, stamp
} from "./model.js";

/* ---------- the record shapes: [kind, option, required] ---------- */

const T = (max, required = false) => ["text", max, required];
const L = (max, required = false) => ["line", max, required];
const E = (list, required = false) => ["enum", list, required];
const STAMP = ["stamp", null, false];

const SHAPES = {
    project: {
        name: L(MAX.name, true), description: T(MAX.text), feature: L(MAX.title), build: L(MAX.short), environment: L(MAX.title),
        owner: L(MAX.short), scope: T(MAX.note), createdOn: STAMP, updatedOn: STAMP
    },
    requirements: {
        id: ["id", "REQ", true], title: L(MAX.title, true), description: T(MAX.text), source: L(MAX.title), priority: E(PRIORITIES),
        state: E(STATES), createdOn: STAMP, updatedOn: STAMP
    },
    criteria: {
        id: ["id", "AC", true], reqId: ["ref", "REQ", true], text: T(MAX.criterion, true), notes: T(MAX.note), status: E(CRITERION_STATUS),
        reason: L(MAX.title), state: E(STATES), createdOn: STAMP, updatedOn: STAMP
    },
    testCases: {
        id: ["id", "TC", true], title: L(MAX.title, true), objective: T(MAX.note), pre: T(MAX.note), data: T(MAX.note), steps: ["steps", null, true],
        expected: T(MAX.note), priority: E(PRIORITIES), type: E(CASE_TYPES), area: L(MAX.short), automation: L(MAX.title),
        origin: E(["typed", "ai"]), state: E(STATES), createdOn: STAMP, updatedOn: STAMP
    },
    mappings: {
        id: ["id", "MAP", true], acId: ["ref", "AC", true], tcId: ["ref", "TC", true], createdOn: STAMP
    },
    executions: {
        id: ["id", "EX", true], tcId: ["ref", "TC", true], status: E(RUN_STATUS, true), build: L(MAX.short), environment: L(MAX.title),
        tester: L(MAX.short), executedOn: ["stamp", null, true], actual: T(MAX.note), notes: T(MAX.note), createdOn: STAMP
    },
    defects: {
        id: ["id", "DEF", true], title: L(MAX.title, true), description: T(MAX.text), steps: T(MAX.text), expected: T(MAX.note),
        actual: T(MAX.note, true), severity: E(SEVERITIES, true), priority: E(PRIORITIES, true), status: E(DEFECT_STATUS),
        reason: L(MAX.title), environment: L(MAX.title), build: L(MAX.short), reporter: L(MAX.short), assignee: L(MAX.short),
        tcIds: ["refs", "TC", false], exIds: ["refs", "EX", false], resolution: T(MAX.note), history: ["history", null, false],
        createdOn: STAMP, updatedOn: STAMP
    }
};

/* an optional choice the file leaves out takes the value a new record would have */
const DEFAULTS = { priority: "medium", state: "active", origin: "typed", type: "" };
const STATUS_DEFAULT = { criteria: "accepted", defects: "open" };
const defaultOf = (collection, key, list) => (key === "status" ? STATUS_DEFAULT[collection] : DEFAULTS[key]) ?? list[0];
const COLLECTIONS = ["requirements", "criteria", "testCases", "mappings", "executions", "defects"];
const TOP_KEYS = new Set(["kind", "schema", "savedOn", "project", "next", ...COLLECTIONS]);
const MAX_ERRORS = 50;

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/* one field: { value } or { error } */
function field(raw, [kind, option, required], collection, key) {

    const missing = raw === undefined || raw === null || (raw === "" && kind !== "enum");

    if (missing) {
        if (required) return { error: "is missing" };
        if (kind === "refs" || kind === "history") return { value: [] };
        if (kind === "enum") return { value: defaultOf(collection, key, option) };
        return { value: "" };
    }

    switch (kind) {
        case "text":
        case "line":
            if (typeof raw !== "string") return { error: "is not text" };
            if (raw.length > option) return { error: `is longer than ${option} characters` };
            return { value: raw };
        case "enum":
            return option.includes(raw) ? { value: raw } : { error: `has an unknown value "${String(raw).slice(0, 30)}"` };
        case "stamp":
            return typeof raw === "string" && STAMP_RE.test(raw) ? { value: raw } : { error: "is not a date and time (YYYY-MM-DDTHH:MM)" };
        case "id":
        case "ref":
            return parseId(raw)?.type === option ? { value: raw } : { error: `is not a ${option} id` };
        case "refs":
            if (!Array.isArray(raw) || raw.length > 100) return { error: "is not a list of ids" };
            if (raw.some((id) => parseId(id)?.type !== option)) return { error: `holds something that is not a ${option} id` };
            return { value: [...new Set(raw)] };
        case "steps": {
            if (!Array.isArray(raw) || raw.length > LIMITS.steps) return { error: `is not a list of at most ${LIMITS.steps} steps` };
            const out = [];
            for (const s of raw) {
                if (!isObject(s)) return { error: "holds a step that is not an object" };
                const action = s.action ?? "";
                const expected = s.expected ?? "";
                if (typeof action !== "string" || typeof expected !== "string" || action.length > MAX.step || expected.length > MAX.step) return { error: "holds a step that is not valid text" };
                out.push({ action, expected });
            }
            return { value: out };
        }
        case "history": {
            if (!Array.isArray(raw) || raw.length > 200) return { error: "is not a list" };
            const out = [];
            for (const h of raw) {
                if (!isObject(h) || !STAMP_RE.test(String(h.on ?? "")) || !DEFECT_STATUS.includes(h.status)) return { error: "holds an entry that is not a date and a status" };
                out.push({ on: h.on, status: h.status });
            }
            return { value: out };
        }
        default:
            return { error: "is not understood" };
    }

}

/* one record: a new object with only the known keys */
function record(raw, shape, collection, label, errors, ignored) {

    if (!isObject(raw)) {
        errors.push(`${label}: is not a record.`);
        return null;
    }

    const out = {};
    const name = typeof raw.id === "string" && raw.id.length <= 12 ? raw.id : label;

    for (const key of Object.keys(shape)) {
        const { value, error } = field(own(raw, key) ? raw[key] : undefined, shape[key], collection, key);
        if (error) errors.push(`${name}: ${key} ${error}.`);
        else out[key] = value;
    }

    for (const key of Object.keys(raw)) {
        if (!own(shape, key)) ignored.add(`${collection}.${key.slice(0, 40)}`);
    }

    return out;

}

/**
 * Validates parsed file data. Returns { project, notes, ignored } or { errors, ignored }.
 * Nothing is partly accepted: any error refuses the whole file.
 */
export function validateProject(data) {

    const errors = [];
    const ignored = new Set();
    const notes = [];
    const add = (message) => {
        if (errors.length < MAX_ERRORS) errors.push(message);
    };

    if (!isObject(data)) return { errors: ["The file's data is not a project."], ignored: [] };
    if (data.kind !== KIND) {
        return { errors: [data.kind === "work-pack" ? "This is a Work Pack: open it in the AI Workbench." : data.kind === "context-pack" ? "This is a context pack: open it in the AI Context Bridge." : "This file is not a QA project."], ignored: [] };
    }
    if (!Number.isInteger(data.schema)) return { errors: ["The file does not say which version of the QA project format it uses."], ignored: [] };
    if (data.schema > SCHEMA) return { errors: [`The file uses version ${data.schema} of the QA project format; this page reads version ${SCHEMA}. Open it with a newer version of the page.`], ignored: [] };
    if (data.schema < 1) return { errors: ["The file's format version is not valid."], ignored: [] };

    for (const key of Object.keys(data)) if (!TOP_KEYS.has(key)) ignored.add(key.slice(0, 40));

    const out = { project: record(data.project ?? {}, SHAPES.project, "project", "Project", errors, ignored) ?? {} };

    for (const key of COLLECTIONS) {
        const raw = data[key] ?? [];
        if (!Array.isArray(raw)) {
            add(`${key} is not a list.`);
            out[key] = [];
            continue;
        }
        if (raw.length > LIMITS[key]) add(`The file has ${raw.length} ${key}; the limit is ${LIMITS[key]}.`);
        out[key] = raw.slice(0, LIMITS[key]).map((r, i) => record(r, SHAPES[key], key, `${key} item ${i + 1}`, errors, ignored)).filter(Boolean);
    }

    if (errors.length) return { errors: errors.slice(0, MAX_ERRORS), ignored: [...ignored] };

    /* ids: unique and of the right type; references resolve */
    const known = {};
    for (const key of COLLECTIONS) {
        known[key] = new Set();
        for (const r of out[key]) {
            if (known[key].has(r.id)) add(`${r.id} appears more than once.`);
            known[key].add(r.id);
        }
    }

    const refCheck = (owner, id, key) => {
        if (!known[key].has(id)) add(`${owner} refers to ${id}, which is not in the file.`);
    };

    const pairs = new Set();
    for (const c of out.criteria) {
        refCheck(c.id, c.reqId, "requirements");
        if (c.status === "excluded" && !c.reason) add(`${c.id}: an excluded criterion needs its reason.`);
    }
    for (const t of out.testCases) {
        if (!t.steps.some((s) => s.action)) add(`${t.id}: has no step with an action.`);
        else if (!t.expected && !t.steps.some((s) => s.expected)) add(`${t.id}: has no expected result.`);
    }
    for (const m of out.mappings) {
        refCheck(m.id, m.acId, "criteria");
        refCheck(m.id, m.tcId, "testCases");
        const pair = `${m.acId}>${m.tcId}`;
        if (pairs.has(pair)) add(`${m.id}: ${m.acId} is mapped to ${m.tcId} twice.`);
        pairs.add(pair);
    }
    for (const e of out.executions) {
        refCheck(e.id, e.tcId, "testCases");
        if ((e.status === "fail" || e.status === "blocked") && !e.actual) add(`${e.id}: a ${e.status === "fail" ? "failed" : "blocked"} run needs its actual result.`);
    }
    for (const d of out.defects) {
        for (const id of d.tcIds) refCheck(d.id, id, "testCases");
        for (const id of d.exIds) refCheck(d.id, id, "executions");
        if (d.status === "deferred" && !d.reason) add(`${d.id}: a deferred defect needs its reason.`);
        if (!d.history.length) d.history = [{ on: d.createdOn || d.updatedOn || stamp(), status: d.status }];
    }

    if (errors.length) return { errors: errors.slice(0, MAX_ERRORS), ignored: [...ignored] };

    /* counters: never below the highest id in use (QD18) */
    const next = {};
    const rawNext = isObject(data.next) ? data.next : {};
    for (const [type, { collection }] of Object.entries(TYPES)) {
        const highest = Math.max(0, ...out[collection].map((r) => parseId(r.id).n));
        const stored = Number.isInteger(rawNext[type]) && rawNext[type] > 0 ? rawNext[type] : 1;
        next[type] = Math.max(stored, highest + 1);
        if (next[type] !== stored) notes.push(`The next ${type} number was raised to ${next[type]} so no id is reused.`);
    }

    out.next = next;

    return { project: out, notes, ignored: [...ignored] };

}

/** Reads a file's text: { project, notes, ignored } or { errors, ignored }. */
export function readProject(text) {

    const { meta, error } = readMeta(text, LIMITS.fileBytes);

    if (error) {
        return { errors: [error === "none" ? "This is not a QA project file: it has no ToolZen Hub data at its end. Only a project downloaded from this page can be opened." : error], ignored: [] };
    }

    return validateProject(meta);

}

/* ---------- writing ---------- */

/** Visitor text in the readable part: a comment opener or closer is broken so a Markdown viewer shows the whole file. */
export const neutral = (value) => String(value ?? "").replace(/<!--/g, "<\\!--").replace(/-->/g, "--\\>");

const para = (value) => neutral(value).trim();
const inline = (value) => neutral(value).replace(/\s*\n\s*/g, " ").trim();

function body(p) {

    const out = [];
    const info = p.project;
    const push = (...lines) => out.push(...lines);

    push(`# QA project: ${inline(info.name)}`, "");
    push("This file is a QA Requirement-to-Release Workbench project. Open it in the Workbench on ToolZen Hub to continue; only the data at the end of the file is read back, so edits to this text are not.", "");

    push("## Overview", "");
    for (const [label, value] of [["Feature or application", info.feature], ["Build or version", info.build], ["Environment", info.environment], ["Owner", info.owner], ["Created", info.createdOn], ["Last changed", info.updatedOn]]) {
        if (value) push(`- ${label}: ${inline(value)}`);
    }
    if (info.description) push("", para(info.description));
    if (info.scope) push("", "Scope:", "", para(info.scope));
    push("");

    push("## Requirements and acceptance criteria", "");
    if (!p.requirements.length) push("None yet.", "");
    for (const r of p.requirements) {
        push(`### ${r.id} ${inline(r.title)}`, "", `Priority ${LABELS[r.priority]}. ${LABELS[r.state]}.${r.source ? ` Source: ${inline(r.source)}.` : ""}`, "");
        if (r.description) push(para(r.description), "");
        for (const c of p.criteria.filter((x) => x.reqId === r.id)) {
            const maps = mappingsOfCriterion(p, c.id).map((m) => m.tcId);
            push(`- ${c.id} (${LABELS[c.status]}${c.state === "retired" ? ", retired" : ""}${c.reason ? `: ${inline(c.reason)}` : ""}): ${inline(c.text)}${maps.length ? `. Mapped to ${maps.join(", ")}.` : ". Not mapped."}`);
        }
        push("");
    }

    push("## Test cases", "");
    if (!p.testCases.length) push("None yet.", "");
    for (const t of p.testCases) {
        const covers = p.mappings.filter((m) => m.tcId === t.id).map((m) => m.acId);
        push(`### ${t.id} ${inline(t.title)}`, "", `Priority ${LABELS[t.priority]}.${t.type ? ` ${LABELS[t.type]}.` : ""} ${LABELS[t.state]}.${covers.length ? ` Covers ${covers.join(", ")}.` : " Covers no criterion."}${t.origin === "ai" ? " Suggested by an AI and accepted." : ""}`, "");
        if (t.objective) push(`Objective: ${inline(t.objective)}`, "");
        if (t.pre) push(`Preconditions: ${inline(t.pre)}`, "");
        if (t.data) push(`Test data: ${inline(t.data)}`, "");
        t.steps.forEach((s, i) => push(`${i + 1}. ${inline(s.action)}${s.expected ? ` (expected: ${inline(s.expected)})` : ""}`));
        if (t.expected) push("", `Expected result: ${inline(t.expected)}`);
        if (t.area || t.automation) push("", [t.area ? `Area: ${inline(t.area)}` : "", t.automation ? `Automation: ${inline(t.automation)}` : ""].filter(Boolean).join(". "));
        push("");
    }

    push("## Test runs", "");
    if (!p.executions.length) push("None yet.", "");
    for (const e of p.executions) {
        push(`- ${e.id} ${e.tcId}: ${LABELS[e.status]}, ${e.executedOn}${e.build ? `, build ${inline(e.build)}` : ""}${e.environment ? `, ${inline(e.environment)}` : ""}${e.tester ? `, by ${inline(e.tester)}` : ""}.${e.actual ? ` Actual: ${inline(e.actual)}` : ""}${e.notes ? ` Notes: ${inline(e.notes)}` : ""}`);
    }
    push("");

    push("## Defects", "");
    if (!p.defects.length) push("None recorded.", "");
    for (const d of p.defects) {
        push(`### ${d.id} ${inline(d.title)}`, "", `${LABELS[d.status]}${d.reason ? ` (${inline(d.reason)})` : ""}. Severity ${LABELS[d.severity]}, priority ${LABELS[d.priority]}.${d.tcIds.length ? ` Test cases ${d.tcIds.join(", ")}.` : ""}${d.exIds.length ? ` Runs ${d.exIds.join(", ")}.` : ""}`, "");
        for (const [label, value] of [["Description", d.description], ["Steps to reproduce", d.steps], ["Expected", d.expected], ["Actual", d.actual], ["Resolution", d.resolution]]) {
            if (value) push(`${label}: ${inline(value)}`, "");
        }
    }

    return out.join("\n");

}

/** The file's text: readable Markdown and the data comment. */
export function projectFile(p, savedOn = stamp()) {

    return withMeta(body(p), {
        kind: KIND,
        schema: SCHEMA,
        savedOn,
        project: p.project,
        next: p.next,
        requirements: p.requirements,
        criteria: p.criteria,
        testCases: p.testCases,
        mappings: p.mappings,
        executions: p.executions,
        defects: p.defects
    });

}

export const projectFileName = (p, date = today()) => `qa-project-${slug(p.project.name, "project")}-${date}.md`;
