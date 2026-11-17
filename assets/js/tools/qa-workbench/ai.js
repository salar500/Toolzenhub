/* =========================================================
   ToolZen Hub
   QA Workbench: AI help (Tool Pack 59 section 10; QD7, QD8,
   QD11, QD12, QD25, QD26)

   Text only, and always optional. The payloads handed to the
   Output Reviewer, the AI Workbench and Bug Report (handoff.js),
   the request for test cases a visitor copies into their own AI,
   and the parser that turns the AI's Markdown table back into
   suggested test cases. A suggestion is never a project record
   until the visitor accepts it, and nothing here can create a
   test run or change a requirement. Pure.
========================================================= */

import { byId, criteriaOf, MAX, LIMITS, PRIORITIES, CASE_TYPES, parseId } from "./model.js";

/* the receivers' own field limits (ai-answer-checklist question 12,000; Workbench long answer 8,000) */
export const REVIEW_LIMIT = 12000;
export const REVIEW_ITEMS = 40;
export const WORKBENCH_LIMIT = 8000;

const flat = (value) => String(value ?? "").replace(/\s*\n\s*/g, " ").trim();

/** The accepted, active criteria of one requirement. */
export const activeCriteria = (p, reqId) => criteriaOf(p, reqId).filter((c) => c.state === "active" && c.status === "accepted");

/** "AC-001 text" lines, cut to fit `limit` characters and `items` lines; { lines, cut } */
function criterionLines(criteria, limit, items) {

    const lines = [];
    let size = 0;

    for (const c of criteria) {
        const lineText = `- ${c.id} ${flat(c.text)}`;
        if (lines.length >= items || size + lineText.length + 1 > limit) return { lines, cut: criteria.length - lines.length };
        lines.push(lineText);
        size += lineText.length + 1;
    }

    return { lines, cut: 0 };

}

/**
 * For the Output Reviewer (kind "review"): the criteria under an "Acceptance criteria" heading, which its
 * extractRequirements reads item by item. { payload, cut } where cut counts the criteria left out.
 */
export function reviewPayload(p, reqId) {

    const r = byId(p.requirements, reqId);
    /* everything under the heading is read as a criterion, so the heading and its list come last */
    const head = `Test cases for ${flat(r?.title)} (${reqId}) of the project ${flat(p.project.name)}. Each test case should name the criterion it covers and have an expected result.\n\n## Acceptance criteria\n`;
    const { lines, cut } = criterionLines(activeCriteria(p, reqId), REVIEW_LIMIT - head.length, REVIEW_ITEMS);

    return {
        payload: { request: `${head}${lines.join("\n")}`, task: "test-cases", title: `${reqId} ${flat(r?.title)}`.slice(0, 120) },
        cut
    };

}

/** For the AI Workbench (kind "task"): the "test-cases" task with what is being tested and the criteria. */
export function workbenchPayload(p, reqId) {

    const r = byId(p.requirements, reqId);
    const feature = [flat(p.project.feature || p.project.name), `${reqId}: ${flat(r?.title)}`, flat(r?.description)].filter(Boolean).join(". ").slice(0, 2000);
    const { lines, cut } = criterionLines(activeCriteria(p, reqId), WORKBENCH_LIMIT - 100, LIMITS.criteria);

    return {
        payload: { task: "test-cases", answers: { feature, requirements: lines.join("\n") }, from: "qa-workbench" },
        cut
    };

}

/** For Bug Report to Debugging Prompt (kind "bug"): its own field names. */
export function bugPayload(p, defect) {

    const runs = defect.exIds.map((id) => byId(p.executions, id)).filter(Boolean);
    const run = runs[runs.length - 1];
    const environment = [defect.environment || run?.environment || p.project.environment, defect.build || run?.build || p.project.build ? `Build ${defect.build || run?.build || p.project.build}` : ""].filter(Boolean).join("\n");
    const cases = defect.tcIds.map((id) => byId(p.testCases, id)).filter(Boolean);

    return {
        observed: [defect.title, defect.actual].filter(Boolean).join("\n").slice(0, 4000),
        expected: (defect.expected || cases[0]?.expected || "").slice(0, 4000),
        steps: (defect.steps || cases[0]?.steps.map((s) => s.action).join("\n") || "").slice(0, 4000),
        environment: environment.slice(0, 4000),
        evidence: [defect.description, cases.length ? `Found by ${cases.map((t) => `${t.id} ${t.title}`).join("; ")}.` : "", defect.id].filter(Boolean).join("\n").slice(0, 4000)
    };

}

/* ---------- asking an AI for test cases, and reading its table back ---------- */

export const TABLE_COLUMNS = ["Covers", "Title", "Type", "Priority", "Preconditions", "Test data", "Steps", "Expected result"];

/** The request a visitor copies into their own AI: one Markdown table with fixed columns. */
export function suggestionRequest(p, reqId, focus = "") {

    const r = byId(p.requirements, reqId);
    const { lines } = criterionLines(activeCriteria(p, reqId), WORKBENCH_LIMIT, LIMITS.criteria);
    const existing = p.testCases.filter((t) => t.state === "active" && p.mappings.some((m) => m.tcId === t.id && lines.some((l) => l.startsWith(`- ${m.acId} `))));

    return [
        `Design manual test cases for this requirement of ${flat(p.project.feature || p.project.name)}.`,
        "",
        `Requirement ${reqId}: ${flat(r?.title)}`,
        r?.description ? flat(r.description) : "",
        "",
        "Acceptance criteria:",
        ...lines,
        existing.length ? `\nTest cases that already exist (do not repeat them):\n${existing.map((t) => `- ${flat(t.title)}`).join("\n")}` : "",
        "",
        focus ? `Focus on: ${flat(focus)}.` : "Cover positive, negative and boundary cases where they apply; include the cases a careless implementation would get wrong.",
        "Only use the criteria above; do not invent requirements. If a criterion is ambiguous, say so after the table instead of guessing.",
        "",
        `Answer with one Markdown table with exactly these columns: ${TABLE_COLUMNS.join(" | ")}.`,
        "- Covers: the criterion ids the case tests, for example AC-001 AC-002.",
        `- Type: one of ${CASE_TYPES.filter(Boolean).join(", ")}. Priority: high, medium or low.`,
        "- Steps: numbered steps separated by <br>. Expected result: what can be checked exactly, never \"works correctly\".",
        "One row per test case. No test results: these cases have not been run."
    ].filter((l, i, all) => l !== "" || all[i - 1] !== "").join("\n");

}

const HEADINGS = [
    ["covers", /^(covers?|criteri(a|on)|ac|acceptance|requirements?|traces?)/],
    ["title", /^(title|name|test case|case|scenario|summary)/],
    ["type", /^(type|kind|category)/],
    ["priority", /^(priority|prio)/],
    ["pre", /^(pre[- ]?conditions?|preconditions?|setup|given)/],
    ["data", /^(test data|data|inputs?)/],
    ["steps", /^(steps?|actions?|procedure|when)/],
    ["expected", /^(expected|expected results?|then|result)/]
];

const cells = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
const pieces = (cell) => cell.split(/<br\s*\/?>|\n/i).map((s) => s.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim()).filter(Boolean);

/**
 * Suggested test cases from the first Markdown table in an AI answer. Columns are matched by their headings;
 * an id column is ignored (accepted cases get new ids). { cases, problems } where each case has title, type,
 * priority, pre, data, steps [{ action, expected }], expected and acIds (only ids of criteria in the project).
 */
export function parseCaseTable(text, p) {

    const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");
    const problems = [];
    const start = lines.findIndex((l, i) => /^\s*\|.*\|\s*$/.test(l) && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? ""));

    if (start < 0) return { cases: [], problems: ["No Markdown table was found. Ask the AI for the table described in the request, then paste its answer."] };

    const columns = cells(lines[start]).map((h) => HEADINGS.find(([, re]) => re.test(h.toLowerCase().replace(/[*_`]/g, "").trim()))?.[0] ?? null);
    if (!columns.includes("title")) return { cases: [], problems: ["The table has no Title column."] };

    const known = new Set(p.criteria.filter((c) => c.state === "active").map((c) => c.id));
    const cases = [];

    for (let i = start + 2; i < lines.length && /^\s*\|/.test(lines[i]); i += 1) {

        if (cases.length >= 100) {
            problems.push("Only the first 100 rows were read.");
            break;
        }

        const row = cells(lines[i]);
        const get = (key) => row[columns.indexOf(key)] ?? "";
        const title = get("title").replace(/<br\s*\/?>/gi, " ").slice(0, MAX.title);
        if (!title) continue;

        const actions = pieces(get("steps"));
        const expectations = pieces(get("expected"));
        const named = (get("covers").toUpperCase().match(/AC-\d{3,6}/g) ?? []).filter((id) => parseId(id));
        const unknown = named.filter((id) => !known.has(id));
        if (unknown.length) problems.push(`"${title.slice(0, 60)}" names ${unknown.join(", ")}, which ${unknown.length === 1 ? "is not an active criterion" : "are not active criteria"} of this project; ${unknown.length === 1 ? "it is" : "they are"} left out.`);

        const steps = actions.length === expectations.length
            ? actions.map((action, k) => ({ action, expected: expectations[k] }))
            : actions.map((action) => ({ action, expected: "" }));

        cases.push({
            title,
            type: CASE_TYPES.includes(get("type").toLowerCase()) ? get("type").toLowerCase() : "",
            priority: PRIORITIES.includes(get("priority").toLowerCase()) ? get("priority").toLowerCase() : "medium",
            pre: get("pre").replace(/<br\s*\/?>/gi, "\n"),
            data: get("data").replace(/<br\s*\/?>/gi, "\n"),
            steps: steps.length ? steps : [{ action: "", expected: "" }],
            expected: actions.length === expectations.length ? "" : expectations.join("\n"),
            acIds: [...new Set(named.filter((id) => known.has(id)))]
        });

    }

    if (!cases.length && !problems.length) problems.push("The table has no rows with a title.");

    return { cases, problems };

}
