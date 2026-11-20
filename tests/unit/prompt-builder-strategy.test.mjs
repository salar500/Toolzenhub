/*
 * AI Prompt Builder (the former AI Workbench): professional strategies and the concise prompt (AI programme D21; 24-STRATEGY-ENGINE.md).
 * Every valid combination of approach, emphasis and audience compiles for every task without repeated lines and gives
 * its own prompt; contradictory parts are never combined; the same strategy always gives the same prompt; "another
 * approach" changes the methodology first and never repeats; the concise prompt keeps what matters.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window ??= { location: { hostname: "toolzenhub.in", pathname: "/" } };

const { TASKS, getTask } = await import("../../assets/js/tools/prompt-builder/taxonomy.js");
const { loadBlueprint } = await import("../../assets/js/tools/prompt-builder/blueprints.js");
const { compileWorkPack, wordsIn } = await import("../../assets/js/tools/prompt-builder/compiler.js");
const { loadMethod, methodPrompt, checkPrompt, domainsIn } = await import("../../assets/js/tools/prompt-builder/method.js");
const S = await import("../../assets/js/tools/prompt-builder/strategies.js");
const { TOOL_BY_ID, toolPrompt } = await import("../../assets/js/tools/prompt-builder/tools.js");

async function build(taskId, { strategy = "", detail = "detailed", answers = {}, tools = [] } = {}) {
  const bp = await loadBlueprint(taskId);
  const m = await loadMethod(taskId);
  const method = methodPrompt(m, { detail, strategy, answers, deliverable: bp.deliverable, blueprint: bp });
  const toolIn = { tools: tools.map((id) => ({ tool: TOOL_BY_ID[id], experience: "" })), detail };
  return { pack: compileWorkPack(bp, getTask(taskId), { answers, method, ...toolIn, toolPrompt: toolPrompt(toolIn, taskId) }), method };
}
const repeated = (text) => {
  const seen = new Set();
  for (const line of text.split("\n").map((l) => l.replace(/^[-\d.)\s]+/, "").trim().toLowerCase()).filter((l) => l.length >= 40)) {
    if (seen.has(line)) return line;
    seen.add(line);
  }
  return "";
};

test("every valid strategy of every task compiles, has no repeated line, and gives its own prompt", async () => {
  let combos = 0;
  for (const task of TASKS) {
    const m = await loadMethod(task.id);
    if (!m) continue;
    const bp = await loadBlueprint(task.id);
    const prompts = new Set();
    for (const s of S.strategiesFor(task)) {
      const method = methodPrompt(m, { detail: "detailed", strategy: s.id, deliverable: bp.deliverable, blueprint: bp });
      const p = compileWorkPack(bp, task, { method }).masterPrompt;
      assert.equal(repeated(p), "", `${task.id} ${s.id} repeats a line`);
      prompts.add(p);
      combos += 1;
    }
    assert.equal(prompts.size, S.strategiesFor(task).length, `${task.id}: two strategies gave the same prompt`);
  }
  assert.ok(combos > 10000, `only ${combos} combinations`);
});

test("contradictory parts are never combined; ids are stable and readable back", () => {
  const qa = getTask("test-plan");
  const ids = S.strategiesFor(qa).map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(!ids.includes(S.strategyId("comply", "lean", "-")), "compliance with lean");
  assert.ok(!ids.includes(S.strategyId("explore", "-", "audit")), "exploratory with audit");
  assert.ok(!ids.includes(S.strategyId("-", "lean", "audit")), "lean with audit");
  assert.ok(ids.includes(S.strategyId("comply", "verify", "audit")));
  assert.equal(S.readStrategy(qa, S.strategyId("risk", "verify", "decision")).approach.label, "Risk-based");
  assert.equal(S.readStrategy(qa, "s1:nope+-+-"), null);
  assert.equal(S.readStrategy(getTask("defect"), S.strategyId("automate", "-", "-")), null, "automation is not offered for a defect report");
  const c = S.strategyCounts(qa);
  assert.ok(c.valid < c.theoretical && c.withApproach > 100, JSON.stringify(c));
});

test("the approach changes the methodology, the emphasis and audience change emphasis and deliverables; same id, same prompt", async () => {
  const risk = (await build("test-plan", { strategy: S.strategyId("risk", "-", "-") })).pack.masterPrompt;
  const trace = (await build("test-plan", { strategy: S.strategyId("trace", "-", "-") })).pack.masterPrompt;
  assert.match(risk, /^Professional approach: Risk-based:/m);
  assert.match(trace, /two-way traceability table/);
  assert.doesNotMatch(risk, /two-way traceability table/);
  const audit = (await build("test-plan", { strategy: S.strategyId("trace", "verify", "audit") })).pack.masterPrompt;
  assert.match(audit, /^Emphasis: Verification-heavy:/m);
  assert.match(audit, /^Written for: Review or audit:/m);
  assert.equal((await build("test-plan", { strategy: S.strategyId("trace", "verify", "audit") })).pack.masterPrompt, audit);
  const recommended = (await build("test-plan")).pack.masterPrompt;
  assert.doesNotMatch(recommended, /^Professional approach:/m);
  const unknown = (await build("test-plan", { strategy: "s1:nope+-+-" })).pack.masterPrompt;
  assert.equal(unknown, recommended, "an unknown saved strategy falls back to the recommended method");
});

test("another approach: methodology first, emphasis and audience kept, nothing repeated until all are shown", () => {
  for (const id of ["api-testing", "architecture", "dashboard", "script", "lesson-plan"]) {
    const task = getTask(id);
    const start = S.strategyId("-", "verify", "decision");
    const seen = [start];
    let current = start;
    const approaches = new Set();
    for (;;) {
      const next = S.nextStrategy(task, current, seen);
      if (!next) break;
      assert.ok(!seen.includes(next.id), `${id}: ${next.id} repeated`);
      if (approaches.size < S.approachesFor(task).length) {
        assert.notEqual(next.approach.id, S.readStrategy(task, current)?.approach.id ?? "-", `${id}: the approach did not change`);
        assert.equal(next.emphasis.id, "verify");
        assert.equal(next.audience.id, "decision");
      }
      approaches.add(next.approach.id);
      seen.push(next.id);
      current = next.id;
    }
    assert.equal(seen.length, S.strategiesFor(task).length, `${id}: every strategy is reached before none is left`);
  }
});

test("the concise prompt keeps the objective, context, method outline, strategy, safeguards, output and checks, and is shorter", async () => {
  for (const task of TASKS) {
    const m = await loadMethod(task.id);
    if (!m) continue;
    const { pack } = await build(task.id, { detail: "comprehensive" });
    assert.ok(wordsIn(pack.concisePrompt) < wordsIn(pack.masterPrompt), `${task.id}: concise is not shorter`);
    assert.ok(pack.concisePrompt.startsWith(pack.masterPrompt.split("\n\n")[0]), `${task.id}: the role is kept`);
  }
  const answers = { api: "Banking API: accounts and statements" };
  const { pack } = await build("api-testing", { answers, tools: ["postman"], strategy: S.strategyId("negative", "-", "-"), detail: "comprehensive" });
  const c = pack.concisePrompt;
  for (const re of [/Banking API: accounts and statements/, /^How to approach it:/m, /^Professional approach: Negative/m, /^Cover, in this order: Endpoint analysis;/m, /never report a test as passed/, /payments or banking/, /^Working in Postman: use its own terms/m, /^Requirements:/m, /^Format of your answer:/m, /^Before you answer, check:/m, /ask me before you start/]) assert.match(c, re);
  assert.doesNotMatch(c, /^Endpoint analysis:$/m, "the detail of each section is left out");
  assert.doesNotMatch(c, /^End your answer with:/m);
});

test("domain safeguards: banking is recognised; ordinary words are not over-triggered", () => {
  assert.deepEqual(domainsIn("A banking API for transfers"), ["payments"]);
  assert.deepEqual(domainsIn("Upload a file transfer report"), []);
  assert.deepEqual(domainsIn("Use the bank holiday calendar"), []);
});

test("domain inference (D-25): a word that only suggests a domain is an open question, never its requirements; a confirmed domain gets its guidance; general checks stay", async () => {
  const PAYMENT_RULES = /PCI DSS where cards are processed|test card numbers|idempotency keys for payment calls|integer minor units|reconciliation with the provider's records|failed and retried payments/;
  /* checkout, with or without a coupon, does not establish payments */
  for (const [taskId, answers] of [["test-cases", { feature: "Apply a coupon at checkout" }], ["code-feature", { feature: "Apply a coupon at checkout" }], ["test-cases", { feature: "Coupon codes give 10% off at checkout" }]]) {
    const p = (await build(taskId, { answers })).pack.masterPrompt;
    assert.doesNotMatch(p, PAYMENT_RULES, `${taskId}: ${answers.feature}`);
    assert.doesNotMatch(p, /This work touches payments or banking/, `${taskId}: ${answers.feature}`);
    /* unknown stays unknown: the AI is told to ask, and why */
    assert.match(p, /Unknown: my words \("checkout"\) do not say whether this work takes payments or handles card or bank details\. Do not assume it does/, taskId);
    assert.match(p, /list it as an open question and say why the answer matters: payments bring/, taskId);
    /* the general engineering and honesty guidance is kept */
    assert.match(p, /your assumptions, and what is unknown/, taskId);
  }
  const code = (await build("code-feature", { answers: { feature: "Apply a coupon at checkout" } })).pack.masterPrompt;
  for (const re of [/validat/i, /error/i, /edge cases/i]) assert.match(code, re, "general checks stay");
  /* an explicit payment requirement gets payment guidance, with the provider left unknown */
  const pay = (await build("code-feature", { answers: { feature: "Implement payment retry after a failed transaction" } })).pack.masterPrompt;
  assert.match(pay, /idempotency keys for payment calls/);
  assert.match(pay, /This work touches payments or banking/);
  assert.match(pay, /Do not assume a payment provider, its API or its rules/);
  assert.doesNotMatch(pay, /Unknown: my words/, "a confirmed domain is not asked about again");
  /* the other domains: confirmed by their own words, only asked about from a suggestion */
  assert.deepEqual(domainsIn("Apply a coupon at checkout"), []);
  assert.deepEqual(domainsIn("Diagnose why the health check endpoint fails"), []);
  assert.deepEqual(domainsIn("Appointment booking for a dental clinic"), []);
  assert.deepEqual(domainsIn("Login with user accounts and a security question"), []);
  assert.deepEqual(domainsIn("Patient records API"), ["health"]);
  assert.deepEqual(domainsIn("A security review of our login API"), ["security"]);
  const clinic = (await build("test-cases", { answers: { feature: "Appointment booking for a dental clinic" } })).pack.masterPrompt;
  assert.doesNotMatch(clinic, /This work involves health information|Because of the domain/);
  assert.match(clinic, /Unknown: my words \("clinic"\) do not say whether this work handles health or patient information/);
  assert.doesNotMatch((await build("debug", { answers: { problem: "The health check endpoint returns 500" } })).pack.masterPrompt, /Unknown: my words|health information/);
});

test("the check names unused answers and tools that do not fit the task, and says which points are structural", async () => {
  const { pack, method } = await build("api-testing", { answers: { api: "Orders API" } });
  const checks = checkPrompt(pack, { method, answers: { api: "Orders API", contract: "" }, offered: ["Postman"], tools: [{ tool: TOOL_BY_ID.figma }] });
  assert.equal(checks.length, 22);
  assert.equal(checks.find((c) => c.label === "Your answers are used").ok, true);
  assert.match(checks.find((c) => c.label === "The tools fit the task").note, /Figma/);
  assert.ok(checks.every((c) => c.kind === "structure" || c.kind === "rule"));
});

test("the domain changes the method itself, for the families where it matters", async () => {
  const health = (await build("test-plan", { answers: { feature: "Patient appointment booking for a hospital" } })).pack;
  const retail = (await build("test-plan", { answers: { feature: "Online shop wish list" } })).pack;
  assert.match(health.masterPrompt, /^Because of the domain:\n- Test that a patient's record is never shown to or changed for the wrong patient/m);
  assert.match(health.concisePrompt, /^Because of the domain:/m);
  assert.doesNotMatch(retail.masterPrompt, /Because of the domain/);
  const pay = (await build("architecture", { answers: { system: "A payments service for an online shop" } })).pack.masterPrompt;
  assert.match(pay, /idempotency keys for payment calls/);
  const lesson = (await build("lesson-plan", { answers: { topic: "Patient safety for nursing students" } })).pack.masterPrompt;
  assert.doesNotMatch(lesson, /Because of the domain/, "a family the domain does not change gets the safeguards only");
});

test("review fixes: the self-check is about the answer, domain method lines need the domain's own work, assistants stay offered", async () => {
  const review = (await build("code-review", { answers: { code: "x", purpose: "Endpoint returning a patient record" } })).pack.masterPrompt;
  const self = review.split("Check your answer before you send it:\n")[1].split("\n\n")[0];
  assert.doesNotMatch(self, /^- You /m, "checklist lines addressed to the person are not the AI's self-check");
  assert.match(review, /^Context of the change:/m);
  assert.doesNotMatch(review, /^Engineering checks:/m, "code review does not repeat the build checklist");
  assert.match(review, /when reviewing, check that they are there/);
  const reset = (await build("test-cases", { answers: { feature: "Password reset by email for a banking app" } })).pack.masterPrompt;
  assert.match(reset, /payments or banking/, "the safeguard still applies");
  assert.doesNotMatch(reset, /currency's precision/, "payment-testing method lines need payment words");
  const refund = (await build("test-cases", { answers: { feature: "Refunds to a debit card" } })).pack.masterPrompt;
  assert.match(refund, /currency's precision/);
  const api = (await build("api-testing", { answers: { api: "Orders API", output: "Test cases and a Postman collection outline" } })).pack.masterPrompt;
  assert.match(api, /outline of the Postman collection/);
  const { productsFor } = await import("../../assets/js/tools/prompt-builder/products.js");
  for (const id of ["api-testing", "code-review", "dashboard"]) {
    const names = productsFor(await loadBlueprint(id)).map((p) => p.name);
    assert.ok(names.includes("ChatGPT") && names.includes("Claude"), `${id}: ${names.join(", ")}`);
  }
  const clip = (await loadBlueprint("text-to-video")).brief({ scene: "A corridor", seconds: "8", camera: "", motion: "", look: "", aspect: "", audio: "" }, {}).text;
  assert.match(clip, /About 8 seconds long/);
});

/* the seven tasks that were Thin (24 section 5): each now carries its own method, distinct from the others */
const SEVEN = {
  "marketing-copy": [{ product: "Evening clinic hours", audience: "Local families", placement: "Landing page" }, /^Copy brief:/m, /^For a landing page:/m],
  refactor: [{ code: "function a(){}", goal: "Split the long function", stack: "Node 20" }, /characterisation tests/, /^Refactoring steps:\n1\. One named refactoring at a time/m],
  regression: [{ change: "New coupon engine", time: "Two days" }, /^Change-impact analysis:/m, /critical user journeys/],
  "performance-test": [{ system: "Checkout API", targets: "" }, /do not invent them/, /percentiles \(for example the 50th, 95th and 99th\)/],
  assessment: [{ topic: "Fractions", learners: "Year 6", type: "Multiple choice" }, /^Multiple-choice questions:/m, /wrong options built from real misconceptions/],
  "ops-script": [{ job: "Rotate log files", shell: "PowerShell", env: "Windows Server 2022" }, /SupportsShouldProcess/, /idempotent/],
  "budget-forecast": [{ what: "Next year for a bakery", base: "Last year's monthly sales" }, /fixed and variable/, /lowest cash point/]
};

test("the seven formerly Thin tasks: a specific method each, following the visitor's answers, and different from one another", async () => {
  const prompts = {};
  for (const [id, [answers, ...markers]] of Object.entries(SEVEN)) {
    const p = (await build(id, { answers })).pack.masterPrompt;
    for (const re of markers) assert.match(p, re, `${id}: ${re}`);
    prompts[id] = p;
  }
  for (const [id, [, own]] of Object.entries(SEVEN)) {
    for (const other of Object.keys(SEVEN).filter((x) => x !== id)) assert.doesNotMatch(prompts[other], own, `${other} carries ${id}'s method`);
  }
  assert.doesNotMatch((await build("ops-script", { answers: { job: "x", shell: "Bash" } })).pack.masterPrompt, /SupportsShouldProcess/, "the shell decides the script method");
  assert.match((await build("ops-script", { answers: { job: "x", shell: "Bash" } })).pack.masterPrompt, /set -euo pipefail/);
  assert.match((await build("assessment", { answers: { topic: "x", learners: "y", type: "Long answer or essay" } })).pack.masterPrompt, /^Open questions:/m);
  const forecast = (await build("budget-forecast", { answers: { what: "Next year", base: "" } })).pack.masterPrompt;
  assert.match(forecast, /\[add: /, "a missing base is asked for, never invented");
  assert.match(forecast, /never fill a gap with a made-up figure/);
});

test("graphic design: a brief that changes with what is designed, kept apart from a prompt for an image generator", async () => {
  const social = (await build("graphic-design", { answers: { kind: "A social media graphic", purpose: "Evening hours for families" } })).pack.masterPrompt;
  const brand = (await build("graphic-design", { answers: { kind: "A brand identity element (logo, brand board)", purpose: "A new bakery" } })).pack.masterPrompt;
  assert.match(social, /^Social media graphic:/m); assert.doesNotMatch(social, /^Brand identity:/m);
  assert.match(brand, /^Brand identity:/m); assert.match(brand, /trademark search/);
  for (const p of [social, brand]) {
    assert.match(p, /^Visual hierarchy and composition:/m);
    assert.match(p, /WCAG 2\.2 AA \(4\.5:1/);
    assert.match(p, /never claim an image, font or icon is licensed/);
    assert.doesNotMatch(p, /Research findings come only from real participants/, "the UX research rule does not apply");
  }
  const vd = (await build("graphic-design", { answers: { kind: "A layout (brochure, report, editorial page)", purpose: "x" }, detail: "comprehensive" })).pack.masterPrompt;
  assert.doesNotMatch(vd, /loading, error, partial and success states/, "screen states are not a poster's edge cases");
  assert.match(vd, /^Production specification:/m);
  const image = (await loadBlueprint("image-generate"));
  assert.equal(image.style, "descriptive", "an image-generation prompt stays a one-paragraph prompt");
});

test("overlaps removed: GitHub's authoring line is not in a review; the dashboard has one data section", async () => {
  const review = (await build("code-review", { tools: ["github"], answers: { code: "x" } })).pack.masterPrompt;
  assert.doesNotMatch(review, /Work on a branch and propose changes/);
  assert.match(review, /Review as a pull request review/);
  assert.match((await build("debug", { tools: ["github"] })).pack.masterPrompt, /Work on a branch and propose changes/, "kept where it fits");
  const dash = (await build("dashboard")).pack.masterPrompt;
  assert.doesNotMatch(dash, /^Data quality first:/m);
  assert.match(dash, /totals against a figure I trust/);
});

test("changing the strategy keeps the task and the visitor's answers; the concise version keeps them too", async () => {
  const answers = { feature: "Patient appointment booking", scope: "Functional and regression" };
  for (const s of S.strategiesFor(getTask("test-plan")).filter((x, i) => i % 23 === 0)) {
    const { pack } = await build("test-plan", { answers, strategy: s.id });
    for (const p of [pack.masterPrompt, pack.concisePrompt]) {
      assert.match(p, /Write a test plan for the following: Patient appointment booking/);
      assert.match(p, /Testing in scope: Functional and regression/);
      assert.match(p, /Because of the domain/);
    }
  }
});

test("the concise prompt keeps each tool's instructions for the task, not only its terms (real-platform preparation, 25 section 5)", async () => {
  const api = (await build("api-testing", { tools: ["postman", "jira"], answers: { api: "Orders API" } })).pack.concisePrompt;
  assert.match(api, /^Working in Postman: use its own terms .*post-response script assertions using pm\.test and pm\.expect/m);
  assert.match(api, /Collection Runner or the Postman CLI/);
  const plan = (await build("test-plan", { tools: ["jira"], answers: { feature: "x" } })).pack.concisePrompt;
  assert.match(plan, /^Working in Jira: .*Say how test work and defects will be tracked in Jira/m);
  const dash = (await build("dashboard", { tools: ["power-bi"], answers: { purpose: "x" } })).pack.concisePrompt;
  assert.match(dash, /^Working in Power BI: .*star schema.*DAX measures, not calculated columns/m, "the general instructions are kept");
  assert.match(api, /Put base URLs and tokens in environment variables, never hard-coded in requests/, "the tool's security rule is kept");
  const review = (await build("code-review", { tools: ["github"], answers: { code: "x" } })).pack.concisePrompt;
  assert.match(review, /Review as a pull request review/);
  assert.doesNotMatch(review, /Work on a branch and propose changes/);
});
