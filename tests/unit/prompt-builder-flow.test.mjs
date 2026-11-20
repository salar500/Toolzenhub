/**
 * AI Prompt Builder, one question at a time (2026-11-19): the data the guided steps are built from, for every
 * profession and every task. Each profession lists real tasks; each task has at least one question to ask first;
 * every task, answered, gives a complete prompt with no [add: …] left, and unanswered gives the "empty" state that
 * Generate refuses; the searchable list filters by words, never by the group a choice sits in; typed words that name
 * an API test, an API design or API documentation lead to the right task.
 */
import test from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "toolzenhub.in", pathname: "/" } };

const { ROLES, ROLE_GROUPS } = await import("../../assets/js/tools/prompt-builder/roles.js");
const { TASKS, getTask } = await import("../../assets/js/tools/prompt-builder/taxonomy.js");
const { loadBlueprint } = await import("../../assets/js/tools/prompt-builder/blueprints.js");
const { compileWorkPack, activeQuestions } = await import("../../assets/js/tools/prompt-builder/compiler.js");
const { filterGroups } = await import("../../assets/js/tools/prompt-builder/picker.js");
const { matchTasks } = await import("../../assets/js/tools/prompt-builder/task-index.js");

/* an answer for every question a visitor would see, chosen without looking at the prompt it makes */
function answerAll(blueprint) {
  const answers = {};
  for (let pass = 0; pass < 3; pass += 1) {
    for (const q of activeQuestions(blueprint, answers)) {
      if (answers[q.key]) continue;
      answers[q.key] = q.kind === "select" ? q.options.find((o) => o.value)?.value ?? "" : `Sample answer for ${q.label}`;
    }
  }
  return answers;
}

test("all 22 professions, in their groups, each listing only real tasks without repeats", () => {
  assert.equal(ROLES.length, 22);
  const groups = new Set(ROLE_GROUPS.map((g) => g.id));
  for (const r of ROLES) {
    assert.ok(groups.has(r.group), r.id);
    assert.ok(r.tasks.length >= 4, `${r.id} offers a real choice`);
    assert.equal(new Set(r.tasks).size, r.tasks.length, `${r.id} repeats a task`);
    for (const id of r.tasks) assert.ok(getTask(id), `${r.id} lists an unknown task ${id}`);
  }
  assert.equal(new Set(ROLES.map((r) => r.id)).size, 22);
});

test("the first screen's count of professions matches roles.js, which loads only with the list (D17), and the list offers every role plus 'not listed'", async () => {
  const panel = await import("../../assets/js/tools/prompt-builder/panel.js");
  const roles = await import("../../assets/js/tools/prompt-builder/roles.js");
  assert.equal(panel.ROLE_COUNT, ROLES.length);
  assert.match(panel.ROLE_PICKER.hint, new RegExp(`^${ROLES.length} professions\\.`));
  const ids = panel.roleGroups(roles).flatMap((g) => g.items.map((i) => i.id));
  assert.deepEqual(ids.slice(0, -1).sort(), ROLES.map((r) => r.id).sort());
  assert.equal(ids.at(-1), panel.NO_ROLE);
});

test("every task has a first question to ask one at a time, and its choices have options to press", async () => {
  for (const t of TASKS) {
    const bp = await loadBlueprint(t.id);
    const first = activeQuestions(bp, {}).filter((q) => !q.more);
    assert.ok(first.length >= 1, `${t.id} has no question before the final step`);
    for (const q of bp.questions.filter((x) => x.kind === "select")) {
      assert.ok(q.options.filter((o) => o.value).length >= 2, `${t.id}.${q.key} needs at least two choices`);
      assert.ok(q.options.length <= 12, `${t.id}.${q.key} is too long for one-press choices`);
    }
  }
});

test("every task: answered gives a ready prompt with every answer in it and nothing to add; unanswered is the empty state Generate refuses", async () => {
  for (const t of TASKS) {
    const bp = await loadBlueprint(t.id);
    const answers = answerAll(bp);
    const pack = compileWorkPack(bp, t, { answers });
    assert.equal(pack.state, "ready", `${t.id}: ${pack.missing.join(", ")}`);
    /* an image, video or audio prompt is one descriptive paragraph by design; every other prompt is a full brief */
    assert.ok(pack.masterPrompt.trim().length > (bp.style === "descriptive" ? 60 : 400), `${t.id} prompt is too thin`);
    assert.doesNotMatch(pack.masterPrompt, /\[add:/, t.id);
    assert.doesNotMatch(pack.masterPrompt, /undefined|\[object Object\]|NaN/, t.id);
    for (const q of bp.questions.filter((x) => x.kind !== "select" && answers[x.key])) {
      assert.ok(pack.markdown.includes(answers[q.key]), `${t.id}: the answer to "${q.label}" is not in the pack`);
    }
    assert.equal(compileWorkPack(bp, t, { answers: {} }).state, "empty", t.id);
  }
});

test("an essential left empty is written as [add: …] and listed missing, never invented", async () => {
  const t = getTask("api-testing");
  const bp = await loadBlueprint(t.id);
  const answers = answerAll(bp);
  const essential = bp.questions.find((q) => q.essential && q.kind !== "select");
  const others = Object.fromEntries(Object.entries(answers).filter(([k]) => k !== essential.key));
  const pack = compileWorkPack(bp, t, { answers: others });
  assert.equal(pack.state, "incomplete");
  assert.ok(pack.missing.length >= 1);
  assert.match(pack.masterPrompt, /\[add: /);
});

test("the same answers always give the same prompt (no randomness between Reuse and a new run)", async () => {
  for (const id of ["test-plan", "article", "image-generate", "general-prompt"]) {
    const bp = await loadBlueprint(id);
    const answers = answerAll(bp);
    assert.equal(compileWorkPack(bp, getTask(id), { answers }).markdown, compileWorkPack(bp, getTask(id), { answers: { ...answers } }).markdown, id);
  }
});

test("the searchable list matches every typed word in a choice's label or keywords, not in its group's title", () => {
  const groups = [
    { title: "Finance and legal", items: [{ id: "finance", label: "Finance or accounting professional" }, { id: "legal", label: "Legal professional" }] },
    { title: "Not listed", items: [{ id: "none", label: "My role is not listed", keywords: "other none skip" }] }
  ];
  assert.deepEqual(filterGroups(groups, "legal").flatMap((g) => g.items.map((i) => i.id)), ["legal"]);
  assert.deepEqual(filterGroups(groups, "  PROFESSIONAL   legal ").flatMap((g) => g.items.map((i) => i.id)), ["legal"]);
  assert.deepEqual(filterGroups(groups, "other").flatMap((g) => g.items.map((i) => i.id)), ["none"]);
  assert.deepEqual(filterGroups(groups, "zzz"), []);
  assert.equal(filterGroups(groups, ""), groups);
  assert.deepEqual(filterGroups([{ title: "T", items: [{ id: "c", label: "Café menu" }] }], "cafe").length, 1, "accents do not matter");
});

test("test cases (2026-11-20): a named website is explored first by the receiving AI, observed kept apart from assumed; an unconfirmed rule blocks a case instead of being invented", async () => {
  const t = getTask("test-cases");
  const bp = await loadBlueprint(t.id);
  const prompt = (answers) => compileWorkPack(bp, t, { answers: { format: "numbered steps with expected results", ...answers } });
  for (const answers of [{ feature: "Coupon codes at checkout", site: "https://shop.example.com" }, { feature: "Amazon.in checkout with a coupon" }, { feature: "Checkout on www.example.org" }]) {
    const p = prompt(answers);
    assert.match(p.masterPrompt, /open .+ if you can browse the web/, answers.feature);
    assert.match(p.masterPrompt, /"Observed".+"Assumed"/, answers.feature);
    assert.match(p.masterPrompt, /If you cannot open websites, say so in your first line/, answers.feature);
    assert.match(p.markdown, /First open .+ if you can browse/, `${answers.feature}: the first stage explores before listing scenarios`);
  }
  /* library names that look like domains are not websites; a feature without a site gets no browsing instructions */
  for (const feature of ["ASP.NET login API with socket.io events", "Coupon codes at checkout", "Chart.js dashboard filters"]) {
    assert.doesNotMatch(prompt({ feature }).masterPrompt, /if you can browse the web/, feature);
  }
  /* always: exact expected results, blocked cases with their question, assumptions labelled */
  const p = prompt({ feature: "Coupon codes at checkout" });
  assert.match(p.masterPrompt, /Blocked – Requirement Confirmation Needed/);
  assert.match(p.masterPrompt, /write the exact question that must be answered/);
  assert.match(p.masterPrompt, /labelled "Assumption:"/);
  assert.match(p.masterPrompt, /according to the defined behaviour/, "the vague phrases are named as ones to avoid");
});

test("typed words: an API test, an API design and API documentation lead to their own tasks", () => {
  const top = (text) => matchTasks(text).tasks.map((t) => t.id);
  assert.equal(top("write API tests for our payment endpoints")[0], "api-testing");
  assert.ok(top("test our REST API endpoints").includes("api-testing"));
  assert.equal(top("design a REST API for orders")[0], "api-design");
  assert.ok(top("document our FHIR API").includes("tech-docs"));
  assert.ok(!top("design a REST API for orders").slice(0, 1).includes("api-testing"));
});
