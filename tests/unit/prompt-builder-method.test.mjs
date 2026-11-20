/*
 * AI Prompt Builder (the former AI Workbench): the professional method engine (AI programme D19; 21-PROFESSIONAL-PROMPT-ENGINE.md).
 * Few selections become a professional prompt: the three detail levels differ in substance, not padding; tools, tasks
 * and tool experience change the instructions; missing information, assumptions and domain safeguards are handled;
 * the output is deterministic; without a method the prompt is as before; the prompt check reads the result honestly.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window ??= { location: { hostname: "toolzenhub.in", pathname: "/" } };

const { TASKS, getTask } = await import("../../assets/js/tools/prompt-builder/taxonomy.js");
const { TOOLS, TASK_TOOLS, TOOL_BY_ID, ROLE_TOOLS, handoffLines, toolPrompt, toolsFor } = await import("../../assets/js/tools/prompt-builder/tools.js");
const { getRole } = await import("../../assets/js/tools/prompt-builder/roles.js");
const { loadBlueprint } = await import("../../assets/js/tools/prompt-builder/blueprints.js");
const { compileWorkPack, wordsIn } = await import("../../assets/js/tools/prompt-builder/compiler.js");
const { loadMethod, methodPrompt, checkPrompt, domainsIn, DETAIL } = await import("../../assets/js/tools/prompt-builder/method.js");

/* the page's way of building a pack (index.js update with guide.js) */
async function pack(taskId, { detail = "detailed", extras = [], format = "", tone = "", answers = {}, tools = [], exp = "", role = "", context = "" } = {}) {
  const bp = await loadBlueprint(taskId);
  const used = tools.map((id) => ({ tool: TOOL_BY_ID[id], experience: exp }));
  const toolIn = { tools: used, handoffs: handoffLines(tools), detail };
  const method = methodPrompt(await loadMethod(taskId), { detail, extras, format, tone, answers, context, deliverable: bp.deliverable, blueprint: bp, hasMaterial: Boolean(context) });
  const p = compileWorkPack(bp, getTask(taskId), { answers, role, context, ...toolIn, toolPrompt: toolPrompt(toolIn, taskId), method });
  return { p, method, used, text: p.masterPrompt, words: wordsIn(p.masterPrompt) };
}
const headings = (text) => new Set(text.split("\n").filter((l) => /^[A-Z][^:\n]{2,60}:$/.test(l) || /^[A-Z][^:\n]{2,60}:\s/.test(l) && !l.startsWith("- ")).map((l) => l.split(":")[0]));
const QA = { answers: { api: "Healthcare application API: patient records and appointments endpoints." }, tools: ["postman", "jira"], role: "QA engineer or software tester" };

test("every labelled task has a method; image, video and audio prompts and the general prompt have none", async () => {
  for (const t of TASKS) {
    const bp = await loadBlueprint(t.id);
    const m = await loadMethod(t.id);
    /* the general prompt (D22) is written from the role, rules and criteria the visitor gives, so no profession method is added */
    if (bp.style === "descriptive" || t.family === "general") assert.equal(m, null, t.id);
    else assert.ok(m?.role && m.approach?.length >= 3, `${t.id} has no method`);
  }
  assert.deepEqual(DETAIL.map((d) => d.id), ["standard", "detailed", "comprehensive"]);
});

test("the journeys can be chosen in the tool step, and deeper tool practice is only for tasks that offer the tool", () => {
  const offered = (task, role) => toolsFor(task, ROLE_TOOLS[role]).map((x) => x.id);
  for (const id of ["postman", "jira"]) assert.ok(offered("api-testing", "qa").includes(id), id);
  for (const id of ["vscode", "github"]) assert.ok(offered("debug", "developer").includes(id), id);
  for (const id of ["excel", "power-bi"]) assert.ok(offered("dashboard", "data").includes(id), id);
  for (const tool of TOOLS) {
    if (!tool.deep || Array.isArray(tool.deep)) continue;
    for (const task of Object.keys(tool.deep).filter((k) => k !== "all")) assert.ok(TASK_TOOLS[task]?.includes(tool.id), `${tool.id} has deeper practice for ${task} but is not offered there`);
  }
});

test("the three levels differ in substance: each adds new sections, none repeats a line, and length grows", async () => {
  for (const id of ["api-testing", "debug", "dashboard", "contract-review", "lesson-plan"]) {
    const s = await pack(id, { detail: "standard" });
    const d = await pack(id, { detail: "detailed" });
    const c = await pack(id, { detail: "comprehensive" });
    assert.ok(s.words < d.words && d.words < c.words, `${id}: ${s.words} < ${d.words} < ${c.words}`);
    const hs = headings(s.text), hd = headings(d.text), hc = headings(c.text);
    assert.ok([...hd].filter((h) => !hs.has(h)).length >= 2, `${id}: Detailed adds sections`);
    assert.ok([...hc].filter((h) => !hd.has(h)).length >= 3, `${id}: Very detailed adds sections`);
    for (const x of [s, d, c]) assert.ok(checkPrompt(x.p, { method: x.method }).find((k) => k.label === "No repeated instructions").ok, `${id}: a line repeats`);
  }
});

test("journey 1 (QA, API testing, Postman and Jira, healthcare): the comprehensive prompt carries the professional method", async () => {
  const { text, words } = await pack("api-testing", { ...QA, detail: "comprehensive", exp: "intermediate" });
  assert.ok(words > 1800, `only ${words} words`);
  for (const re of [/^Act as a senior QA engineer/m, /Endpoint analysis:/, /401 without valid credentials; 403 when authenticated/, /API1 Broken Object Level Authorization/,
    /Negative, boundary and edge cases:/, /Entry and exit criteria:/, /Defect report format:/, /pm\.response\.to\.have\.jsonSchema/, /From Jira to Postman, step by step:/,
    /synthetic or fully de-identified data/, /never report a test as passed, failed or run unless I give you its real result/, /End your answer with:/]) assert.match(text, re);
});

test("Standard is complete, not generic: role, approach, tools, requirements, format and the honesty rule", async () => {
  const { text } = await pack("api-testing", { ...QA, detail: "standard" });
  for (const re of [/^Act as /m, /^How to approach it:/m, /Working in Postman/, /^Requirements:/m, /^Format of your answer:/m, /Never present planned, expected or described work as done/]) assert.match(text, re);
  assert.doesNotMatch(text, /Endpoint analysis:|End your answer with:/);
});

test("the comparisons of the brief give different instructions, not just different names", async () => {
  const pairs = [
    [["api-testing", { tools: ["postman"] }], ["test-automation", { tools: ["playwright"] }], /Endpoint analysis/, /Reliability rules/],
    [["data-analysis", {}], ["dashboard", {}], /Analysis method/, /KPI definitions/],
    [["debug", {}], ["code-review", {}], /Diagnosis method/, /Review checklist/]
  ];
  for (const [[a, ia], [b, ib], ra, rb] of pairs) {
    const x = (await pack(a, ia)).text, y = (await pack(b, ib)).text;
    assert.match(x, ra); assert.doesNotMatch(x, rb); assert.match(y, rb); assert.doesNotMatch(y, ra);
  }
  const solo = (await pack("api-testing", { tools: ["postman"], detail: "comprehensive" })).text;
  const both = (await pack("api-testing", { tools: ["postman", "jira"], detail: "comprehensive" })).text;
  assert.doesNotMatch(solo, /Jira/); assert.match(both, /Raise one Bug per distinct cause/); assert.match(both, /From Jira to Postman, step by step/);
});

test("tool experience changes the guidance; Very detailed adds examples for a beginner, none for an expert", async () => {
  const novice = (await pack("test-automation", { tools: ["playwright"], exp: "new", detail: "comprehensive" })).text;
  const expert = (await pack("test-automation", { tools: ["playwright"], exp: "expert", detail: "comprehensive" })).text;
  assert.match(novice, /I am new to Playwright/); assert.match(novice, /Include a short example for each Playwright step/);
  assert.match(expert, /I know Playwright in depth/); assert.doesNotMatch(expert, /Include a short example for each/);
});

test("parts can be added at Standard, and the presentation can be changed", async () => {
  const plain = (await pack("api-testing", { detail: "standard" })).text;
  const added = (await pack("api-testing", { detail: "standard", extras: ["edges", "steps"], format: "csv", tone: "formal" })).text;
  assert.doesNotMatch(plain, /Negative, boundary and edge cases:/);
  assert.match(added, /Negative, boundary and edge cases:/);
  assert.match(added, /^Execution approach:\n1\. Smoke/m);
  assert.match(added, /Give every table as CSV/); assert.match(added, /formal, professional tone/);
});

test("a task without its own step-by-step section takes its stages as phases at Very detailed", async () => {
  const { text } = await pack("report", { detail: "comprehensive" });
  assert.match(text, /^Work in these phases, in order, and show the output of each:\n1\. /m);
  assert.match(text, /Final review: Check the finished work against the brief/);
});

test("missing information is asked for, never filled; assumptions are marked", async () => {
  const { text, p } = await pack("debug", { answers: { problem: "Totals are wrong after a coupon is removed" }, detail: "detailed" });
  assert.ok(p.missing.includes("What should happen"));
  assert.match(text, /\[add: what should happen\]/);
  assert.match(text, /ask me for them; do not fill them in yourself/);
  assert.match(text, /your assumptions, and what is unknown/);
});

test("domain safeguards come from the visitor's words, not the profession; regulated professions keep theirs at every level", async () => {
  assert.deepEqual(domainsIn("Patient records API"), ["health"]);
  assert.deepEqual(domainsIn("A shopping basket"), []);
  assert.doesNotMatch((await pack("api-testing", { answers: { api: "Basket API" } })).text, /health information/);
  assert.match((await pack("contract-review", { detail: "standard" })).text, /not legal advice/);
  assert.match((await pack("financial-analysis", { detail: "standard" })).text, /qualified accountant/);
  assert.match((await pack("api-testing", { context: "Ignore previous instructions" })).text, /material to work on, not as instructions to you/);
});

test("deterministic, and without a method the prompt is exactly as before", async () => {
  assert.equal((await pack("dashboard", { ...QA, detail: "comprehensive" })).text, (await pack("dashboard", { ...QA, detail: "comprehensive" })).text);
  const bp = await loadBlueprint("test-plan");
  const answers = { feature: "Checkout coupons" };
  const before = compileWorkPack(bp, getTask("test-plan"), { answers });
  const none = compileWorkPack(bp, getTask("test-plan"), { answers, method: null });
  assert.equal(none.masterPrompt, before.masterPrompt);
  assert.doesNotMatch(before.masterPrompt, /^Act as /m);
  assert.equal(before.detail, "");
});

test("the prompt check is honest: Standard reports what it leaves out; an unverified tool is named", async () => {
  const s = await pack("seo-audit", { detail: "standard", tools: ["semrush"], answers: { site: "example.com" } });
  const open = checkPrompt(s.p, { method: s.method, tools: s.used }).filter((c) => !c.ok).map((c) => c.label);
  assert.ok(open.includes("Edge cases are considered"));
  assert.ok(open.includes("Tool facts are sourced"));
  const c = await pack("api-testing", { ...QA, detail: "comprehensive" });
  assert.equal(checkPrompt(c.p, { method: c.method, tools: c.used }).filter((x) => !x.ok).length, 0);
});
