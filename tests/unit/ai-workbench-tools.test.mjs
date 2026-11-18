/*
 * AI Workbench: professions, tasks and tool intelligence (AI programme D18; 20-ROLES-TASKS-TOOLS.md).
 * The registry resolves; prompts change meaningfully with the tool, the task and the visitor's experience of the tool;
 * hand-offs between tools never claim an integration that is not documented; the ten benchmark journeys of the brief
 * give different, specific prompts; professional safeguards are present.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window ??= { location: { hostname: "toolzenhub.in", pathname: "/" } };

const { TASKS, getTask } = await import("../../assets/js/tools/ai-workbench/taxonomy.js");
const { TOOLS, TASK_TOOLS, TOOL_BY_ID, ROLE_TOOLS, HANDOFFS, handoffLines, toolsFor, toolPrompt, TOOL_EXPERIENCE } = await import("../../assets/js/tools/ai-workbench/tools.js");
const { ROLES, ROLE_GROUPS, getRole } = await import("../../assets/js/tools/ai-workbench/roles.js");
const { loadBlueprint } = await import("../../assets/js/tools/ai-workbench/blueprints.js");
const { compileWorkPack } = await import("../../assets/js/tools/ai-workbench/compiler.js");

/* the page passes the tools as toolPrompt(...) (guide.js); the tests do the same */
const pack = async (taskId, input = {}) => compileWorkPack(await loadBlueprint(taskId), getTask(taskId), { ...input, toolPrompt: toolPrompt(input, taskId) });
const use = (...ids) => ids.map((id) => ({ tool: TOOL_BY_ID[id], experience: "" }));

test("registry: every task, tool, profession and hand-off resolves; every task has a blueprint", async () => {
  for (const [task, ids] of Object.entries(TASK_TOOLS)) {
    assert.ok(getTask(task), `TASK_TOOLS names an unknown task ${task}`);
    for (const id of ids) assert.ok(TOOL_BY_ID[id], `${task} offers an unknown tool ${id}`);
  }
  for (const tool of TOOLS) {
    assert.ok(tool.name && tool.terms && tool.share && tool.check && /^https:\/\//.test(tool.doc), `${tool.id} is incomplete`);
    assert.ok(Object.values(TASK_TOOLS).some((ids) => ids.includes(tool.id)), `${tool.id} is offered for no task`);
    for (const taskId of Object.keys(tool.tasks ?? {})) assert.ok(TASK_TOOLS[taskId]?.includes(tool.id), `${tool.id} has guidance for ${taskId} but is not offered there`);
  }
  for (const h of HANDOFFS) assert.ok(TOOL_BY_ID[h.from] && TOOL_BY_ID[h.to], `${h.from} -> ${h.to}`);
  assert.equal(ROLES.length, 22); // 20 (D18) and two creative professions (D21)
  for (const role of ROLES) {
    assert.ok(ROLE_GROUPS.some((g) => g.id === role.group), role.id);
    assert.ok(role.tasks.length >= 4, `${role.id} has only ${role.tasks.length} tasks`);
    for (const t of role.tasks) assert.ok(getTask(t), `${role.id}: unknown task ${t}`);
    assert.ok(ROLE_TOOLS[role.id]?.length, `${role.id} has no tools in ROLE_TOOLS`);
    for (const id of ROLE_TOOLS[role.id]) assert.ok(TOOL_BY_ID[id], `${role.id}: unknown tool ${id}`);
  }
  for (const t of TASKS) assert.ok(await loadBlueprint(t.id), `no blueprint for ${t.id}`);
});

test("no tool chosen: the prompt is exactly what it was before tools existed", async () => {
  const answers = { feature: "Checkout coupons", requirements: "AC1 valid code reduces total" };
  const before = (await pack("test-cases", { answers })).masterPrompt;
  const after = (await pack("test-cases", { answers, tools: [], toolChoice: "", otherTool: "", handoffs: [] })).masterPrompt;
  assert.equal(after, before);
  assert.doesNotMatch(before, /Working in /);
});

test("the tool changes the instructions, not just a name: Postman API testing versus Playwright automation", async () => {
  const postman = (await pack("api-testing", { answers: { api: "POST /cart/items" }, tools: use("postman") })).masterPrompt;
  const playwright = (await pack("test-automation", { answers: { flow: "Sign in and add to cart" }, tools: use("playwright") })).masterPrompt;
  assert.match(postman, /Working in Postman:/);
  assert.match(postman, /pm\.test and pm\.expect/);
  assert.match(postman, /Collection Runner or the Postman CLI/);
  assert.match(postman, /environment variables, never hard-coded/);
  assert.doesNotMatch(postman, /locator|fixture|trace viewer/i);
  assert.match(playwright, /Working in Playwright:/);
  assert.match(playwright, /getByRole, getByLabel/);
  assert.match(playwright, /trace viewer/);
  assert.doesNotMatch(playwright, /pm\.test|Collection Runner/);
  for (const p of [postman, playwright]) assert.match(p, /You cannot open my (Postman|Playwright) or my accounts: ask me to share/);
});

test("the same tool for another task gets that task's workflow", async () => {
  const testing = (await pack("api-testing", { tools: use("postman") })).masterPrompt;
  const design = (await pack("api-design", { tools: use("postman") })).masterPrompt;
  assert.match(testing, /post-response script assertions/);
  assert.doesNotMatch(design, /post-response script assertions/);
  assert.match(design, /collection examples/);
});

test("experience with a tool is separate from experience in the job, and changes the instructions", async () => {
  const p = (await pack("test-automation", { experience: "senior", tools: [{ tool: TOOL_BY_ID.playwright, experience: "new" }] })).masterPrompt;
  assert.match(p, /my experience with it: new to it/);
  assert.match(p, /I am new to Playwright: say where in Playwright each step is done/);
  assert.match(p, /Skip the basics\. For each significant choice/, "the senior professional rule is still there");
  const expert = (await pack("test-automation", { tools: [{ tool: TOOL_BY_ID.playwright, experience: "expert" }] })).masterPrompt;
  assert.match(expert, /I know Playwright in depth: no basic explanations/);
  assert.doesNotMatch(expert, /say where in Playwright/);
  assert.deepEqual(TOOL_EXPERIENCE.map((x) => x.id), ["", "new", "basic", "intermediate", "advanced", "expert"]);
});

test("hand-offs: documented links are named; every other pair is an export, never an assumed integration", () => {
  assert.match(handoffLines(["excel", "power-bi"]).join(" "), /Get data; do the cleaning in Power Query/);
  assert.match(handoffLines(["jira", "postman"]).join(" "), /Jira and Postman are not connected by default/);
  const generic = handoffLines(["miro", "zotero"]);
  assert.equal(generic.length, 1);
  assert.match(generic[0], /Do not assume two tools are connected unless I say they are/);
  assert.deepEqual(handoffLines(["postman"]), []);
});

test("no tool, recommend one, or another tool by name", async () => {
  const none = (await pack("data-analysis", { toolChoice: "none" })).masterPrompt;
  assert.match(none, /I do not use a specific tool for this/);
  const rec = (await pack("data-analysis", { toolChoice: "recommend", offered: toolsFor("data-analysis").map((x) => x.name) })).masterPrompt;
  assert.match(rec, /Recommend the tool that suits this task best \(for example Microsoft Excel, /);
  assert.match(rec, /Do not assume I already have it/);
  const other = (await pack("api-testing", { otherTool: "Insomnia" })).masterPrompt;
  assert.match(other, /I also use Insomnia\. .*ask me rather than guessing its features/);
});

test("a chosen tool adds what to prepare and what to check", async () => {
  const p = await pack("api-testing", { tools: use("postman") });
  assert.ok(p.preparation.required.some((x) => /^From Postman: the collection exported as JSON/.test(x)));
  assert.ok(p.quality.some((x) => /^Postman: Run the collection against a test environment yourself/.test(x)));
});

test("image, video and audio prompts take no tool blocks", async () => {
  const p = (await pack("image-generate", { tools: use("figma") })).masterPrompt;
  assert.doesNotMatch(p, /Working in/);
});

test("a profession lists its own tools first for a task", () => {
  assert.equal(toolsFor("data-analysis", ROLE_TOOLS.finance)[0].id, "excel");
  assert.equal(toolsFor("incident", ROLE_TOOLS.developer)[0].id, "docker");
  assert.deepEqual(toolsFor("email-message"), []);
});

/* the ten journeys of the brief (Batch 13); each must be specific, and all must differ */
const JOURNEYS = [
  ["QA + API testing + Postman", "api-testing", "QA engineer or software tester", ["postman"], /pm\.test/],
  ["QA + UI automation + Playwright", "test-automation", "QA engineer or software tester", ["playwright", "github-actions"], /GitHub Actions workflow \(Playwright offers one/],
  ["Developer + debugging + GitHub", "debug", "Software developer", ["github"], /recent commits and pull requests/],
  ["Data analyst + dashboard + Excel and Power BI", "data-analysis", "Data analyst", ["excel", "power-bi"], /star schema/],
  ["Marketer + SEO audit + Search Console", "seo-audit", "Digital marketer", ["search-console"], /Performance report/],
  ["Project manager + planning + Jira", "project-plan", "Project manager", ["jira"], /work items \(called issues in older versions\)/],
  ["Designer + handoff + Figma", "design-handoff", "UI/UX designer", ["figma"], /Dev Mode/],
  ["Finance + analysis + Excel", "financial-analysis", "Finance or accounting professional", ["excel"], /XLOOKUP/],
  ["Student + learning plan", "learning-plan", "Student", [], /learning plan|learn/i],
  ["Technical writer + documentation", "tech-docs", "Technical writer", ["markdown-docs"], /front matter/]
];

test("the ten benchmark journeys: specific to their tools and tasks, deterministic, all different", async () => {
  const prompts = [];
  for (const [name, taskId, role, tools, marker] of JOURNEYS) {
    const input = { role, tools: use(...tools), handoffs: handoffLines(tools) };
    const a = (await pack(taskId, input)).masterPrompt;
    const b = (await pack(taskId, input)).masterPrompt;
    assert.equal(a, b, `${name}: same input, same prompt`);
    assert.match(a, marker, name);
    assert.match(a, new RegExp(`I work as an? ${/^[A-Z]{2}/.test(role) ? role.slice(0, 2) : role.charAt(0).toLowerCase()}`), `${name}: the profession is in the prompt`);
    for (const id of tools) assert.match(a, new RegExp(`Working in ${TOOL_BY_ID[id].name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), `${name}: ${id}`);
    prompts.push(a);
  }
  assert.equal(new Set(prompts).size, JOURNEYS.length, "every journey gives a different prompt");
});

test("professional safeguards are in the prompts and checklists where the work needs them", async () => {
  const finance = await pack("financial-analysis", {});
  assert.ok(finance.quality.some((q) => /qualified accountant/.test(q)));
  const legal = await pack("contract-review", {});
  assert.match(legal.masterPrompt, /Cases, statutes, sections or citations you cannot quote/);
  assert.ok(legal.quality.some((q) => /qualified lawyer/.test(q)));
  assert.match((await pack("job-description", {})).masterPrompt, /protected characteristic/);
  assert.match((await pack("incident", {})).masterPrompt, /Never ask me for passwords, keys or tokens/);
  assert.match((await pack("hr-policy", {})).masterPrompt, /\[check: legal requirement\]/);
  assert.match((await pack("ticket-analysis", {})).masterPrompt, /Counts or trends not computed from the data I gave/);
});
