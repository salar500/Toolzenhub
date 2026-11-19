/**
 * AI Prompt Builder (the AI Workbench of Tool Pack 58; central since D22): taxonomy integrity, every task compiles (empty and answered), essentials are never
 * invented, depth and experience change the pack, research briefs forbid fabrication, edit conflicts are found,
 * products come only from the AI Directory, and the compiler is deterministic.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

globalThis.window = { location: { hostname: "toolzenhub.in", pathname: "/" } };
const tax = await import("../../assets/js/tools/prompt-builder/taxonomy.js");
const { compileWorkPack, activeQuestions, NO_FABRICATION, PLACEHOLDER } = await import("../../assets/js/tools/prompt-builder/compiler.js");
const { loadBlueprint, familyLoader } = await import("../../assets/js/tools/prompt-builder/blueprints.js");
const { productsFor, NOT_VERIFIED } = await import("../../assets/js/tools/prompt-builder/products.js");
const { AI_PRODUCTS } = await import("../../assets/js/data/ai-directory.js");

const blueprints = {};
for (const t of tax.TASKS) blueprints[t.id] = await loadBlueprint(t.id);

/* a plausible answer for every visible question: the option after the empty one, or a short text */
function fill(bp) {
  const a = {};
  for (let pass = 0; pass < 2; pass++) {
    for (const q of activeQuestions(bp, a)) a[q.key] = q.kind === "select" ? q.options[1].value : `sample ${q.key}`;
  }
  return a;
}

const FORBIDDEN = [/world[- ]class/i, /chain[- ]of[- ]thought/i, /step by step reasoning/i, /hidden reasoning/i, /think silently/i, /--ar\b/, /--v \d/, /\/imagine/i, /\bundefined\b/, /\bnull\b/, /\[object Object\]/];

test("taxonomy: ten outcomes, every task belongs to one and has a blueprint in its family module", () => {
  assert.equal(tax.OUTCOMES.length, 10);
  assert.deepEqual(tax.OUTCOMES.map((o) => o.title)[9], "I'm not sure. Help me choose");
  const ids = new Set();
  for (const t of tax.TASKS) {
    assert.ok(!ids.has(t.id), `duplicate task ${t.id}`);
    ids.add(t.id);
    assert.ok(tax.getOutcome(t.outcome), `${t.id}: unknown outcome`);
    assert.ok(tax.FAMILIES.includes(t.family) && familyLoader(t.family), `${t.id}: unknown family`);
    assert.ok(blueprints[t.id], `${t.id}: no blueprint`);
  }
  for (const o of tax.OUTCOMES.filter((x) => x.id !== "unsure" && x.id !== "other")) assert.ok(tax.tasksFor(o.id).length >= 3, `${o.id} has tasks`);
  /* "Something else" holds the one general prompt (D22) */
  assert.deepEqual(tax.tasksFor("other").map((t) => t.id), ["general-prompt"]);
  assert.equal(tax.tasksFor("unsure").length, 0);
});

test("each family module holds only blueprints of tasks in that family", async () => {
  for (const family of tax.FAMILIES) {
    const keys = Object.keys((await familyLoader(family)()).BLUEPRINTS);
    assert.deepEqual(keys.sort(), tax.TASKS.filter((t) => t.family === family).map((t) => t.id).sort(), family);
  }
});

test("blueprints: unique keys, an essential, four to six questions up front (the rest under More details), valid stages and refinements", () => {
  const problems = [];
  for (const [id, bp] of Object.entries(blueprints)) {
    const keys = bp.questions.map((q) => q.key);
    assert.equal(new Set(keys).size, keys.length, `${id}: duplicate keys`);
    assert.ok(bp.questions.some((q) => q.essential), `${id}: no essential`);
    const upFront = bp.questions.filter((q) => !q.more && !q.showIf).length;
    if (upFront > 6 || bp.questions.length < 3) problems.push(`${id}: ${upFront} up front`);
    for (const q of bp.questions) if (q.more && q.essential) problems.push(`${id}.${q.key}: an essential is never hidden under More details`);
    for (const q of bp.questions) {
      assert.ok(q.label && ["text", "textarea", "select"].includes(q.kind), `${id}.${q.key}`);
      if (q.kind === "select") assert.equal(q.options[0].value, "", `${id}.${q.key}: first option is empty`);
    }
    for (const s of bp.stages) assert.ok(["standard", "detailed", "multi"].includes(s.at) && s.name && s.ask, `${id}: stage ${s.name}`);
    assert.ok(bp.refine.length >= 1, `${id}: refinements`);
    assert.ok(bp.categories.length >= 1, `${id}: directory categories`);
  }
  assert.deepEqual(problems, []);
});

test("every task compiles with no answers: empty state, essentials listed as missing and written as placeholders, nothing invented", () => {
  const unseen = [];
  for (const t of tax.TASKS) {
    const bp = blueprints[t.id];
    const pack = compileWorkPack(bp, t, {});
    assert.equal(pack.state, "empty", t.id);
    const essentials = activeQuestions(bp, {}).filter((q) => q.essential).map((q) => q.label);
    assert.deepEqual(pack.missing, essentials, t.id);
    /* an essential that never reaches a prompt is not essential: it must show as [add: ...] somewhere the visitor will paste */
    for (const label of essentials) if (!pack.masterPrompt.includes(PLACEHOLDER(label)) && !pack.stages.some((s) => s.prompt.includes(PLACEHOLDER(label)))) unseen.push(`${t.id}: ${label}`);
    for (const re of FORBIDDEN) assert.doesNotMatch(pack.markdown, re, `${t.id}: ${re}`);
  }
  assert.deepEqual(unseen, []);
});

test("every task compiles answered: ready, no placeholder left, no forbidden phrase, every visible answer used", () => {
  for (const t of tax.TASKS) {
    const bp = blueprints[t.id];
    const answers = fill(bp);
    const pack = compileWorkPack(bp, t, { answers, depth: "multi" });
    assert.equal(pack.state, "ready", t.id);
    assert.doesNotMatch(pack.markdown, /\[add: /, t.id);
    for (const re of FORBIDDEN) assert.doesNotMatch(pack.markdown, re, `${t.id}: ${re}`);
    assert.ok(pack.masterPrompt.length > 60, t.id);
    assert.ok(pack.quality.length >= 2 && pack.refinements.length >= 1, t.id);
    /* each answered text field reaches the pack (selects may be rephrased) */
    for (const q of activeQuestions(bp, answers).filter((x) => x.kind !== "select")) {
      assert.ok(pack.markdown.includes(answers[q.key]), `${t.id}: ${q.key} not used`);
    }
  }
});

test("depth: short is one prompt with at most two refinements; detailed and multi add the final review; multi has every stage", () => {
  for (const t of tax.TASKS) {
    const bp = blueprints[t.id];
    const answers = fill(bp);
    const short = compileWorkPack(bp, t, { answers, depth: "short" });
    const standard = compileWorkPack(bp, t, { answers, depth: "standard" });
    const multi = compileWorkPack(bp, t, { answers, depth: "multi" });
    assert.equal(short.stages.length, 0, t.id);
    assert.ok(short.refinements.length <= 2, t.id);
    assert.equal(standard.stages.length, bp.stages.filter((s) => s.at === "standard").length, t.id);
    assert.equal(multi.stages.length, bp.stages.length + 1, t.id);
    assert.equal(multi.stages.at(-1).name, "Final review", t.id);
    assert.ok(multi.stages.every((s, i) => s.prompt.startsWith(`Stage ${i + 1} of ${multi.stages.length}:`)), t.id);
  }
});

test("experience changes the requirements and the checks, not only the tone; senior work defaults to more control", () => {
  const t = tax.getTask("test-plan");
  const bp = blueprints["test-plan"];
  const answers = fill(bp);
  const beginner = compileWorkPack(bp, t, { answers, experience: "beginner" });
  const senior = compileWorkPack(bp, t, { answers, experience: "senior", role: "QA lead or test manager" });
  assert.match(beginner.masterPrompt, /plain words and define any term/);
  assert.match(senior.masterPrompt, /trade-offs, the risks and the alternative you rejected/);
  assert.match(senior.masterPrompt, /I work as a qA lead|I work as a QA lead/i);
  assert.notDeepEqual(beginner.quality, senior.quality);
  assert.equal(beginner.depth, "standard");
  assert.equal(senior.depth, "detailed");
  assert.equal(compileWorkPack(bp, t, { answers }).depth, "standard");
  /* a chosen depth wins over the experience */
  assert.equal(compileWorkPack(bp, t, { answers, experience: "senior", depth: "short" }).depth, "short");
});

test("research and data briefs forbid invented sources and figures; other briefs are not padded with it", () => {
  for (const t of tax.TASKS) {
    const bp = blueprints[t.id];
    const pack = compileWorkPack(bp, t, { answers: fill(bp) });
    if (bp.noFabrication) {
      assert.ok(pack.masterPrompt.includes(NO_FABRICATION), t.id);
      assert.ok(pack.quality.some((q) => /source, citation and figure exists/.test(q)), t.id);
    } else {
      assert.ok(!pack.masterPrompt.includes(NO_FABRICATION), t.id);
    }
  }
  for (const id of ["research-plan", "literature-review", "data-analysis", "market-research", "report"]) assert.ok(blueprints[id].noFabrication, id);
});

test("software and testing briefs never assume a stack: they tell the AI to ask", () => {
  for (const t of tax.TASKS.filter((x) => x.family === "software" || x.family === "testing")) {
    const pack = compileWorkPack(blueprints[t.id], t, {});
    if (["requirements", "regression", "defect"].includes(t.id)) continue;
    assert.match(pack.masterPrompt, /Do not assume|ask/i, t.id);
  }
});

test("image edit: what changes and what stays are separate; a word in both is a conflict", () => {
  const t = tax.getTask("image-edit");
  const bp = blueprints["image-edit"];
  const ok = compileWorkPack(bp, t, { answers: { source: "shop front photo", change: "make the sky clear blue", keep: "the sign and the people" } });
  assert.deepEqual(ok.conflicts, []);
  assert.match(ok.masterPrompt, /Change only this: make the sky clear blue\./);
  assert.match(ok.masterPrompt, /Keep unchanged: the sign and the people; everything not mentioned above\./);
  const clash = compileWorkPack(bp, t, { answers: { source: "photo", change: "brighten the sign", keep: "the sign exactly" } });
  assert.equal(clash.conflicts.length, 1);
  assert.match(clash.conflicts[0], /"sign"/);
  assert.match(clash.markdown, /## Check these first/);
});

test("conditional questions: hidden until their condition holds, and a hidden answer is not used", () => {
  const bp = blueprints.music;
  assert.ok(!activeQuestions(bp, {}).some((q) => q.key === "lyrics"));
  assert.ok(activeQuestions(bp, { vocals: "Vocals with my lyrics" }).some((q) => q.key === "lyrics"));
  const pack = compileWorkPack(bp, tax.getTask("music"), { answers: { genre: "jazz", mood: "calm", vocals: "No vocals (instrumental)", lyrics: "SECRET LYRIC" } });
  assert.doesNotMatch(pack.markdown, /SECRET LYRIC/);
});

test("products: only directory entries, in the blueprint's category order; an assistant fits an image task only when its summary says images", () => {
  const ids = new Set(AI_PRODUCTS.map((p) => p.id));
  for (const t of tax.TASKS) {
    for (const p of productsFor(blueprints[t.id])) {
      assert.ok(ids.has(p.id), `${t.id}: ${p.id}`);
      const real = AI_PRODUCTS.find((x) => x.id === p.id);
      assert.equal(p.summary, real.summary, "the directory's own words");
      assert.equal(p.url, real.url);
    }
  }
  const image = productsFor(blueprints["image-generate"]).map((p) => p.id);
  assert.ok(image.includes("chatgpt") && image.includes("gemini"), "assistants whose summaries mention images");
  assert.ok(!image.includes("claude") && !image.includes("microsoft-copilot"), "assistants whose summaries do not");
  assert.equal(productsFor({ categories: [{ id: "no-such-category" }] }).length, 0);
  assert.equal(NOT_VERIFIED, "Tool suitability not verified. Choose your preferred AI tool.");
  // the page's first load holds no directory data: products.js is imported only when a task is chosen
  const page = fs.readFileSync(new URL("../../assets/js/tools/prompt-builder/index.js", import.meta.url), "utf8");
  assert.doesNotMatch(page, /^import[^;]*products\.js/m);
  assert.doesNotMatch(page, /^import[^;]*blueprints\/[a-z]+\.js/m);
});

test("the chosen product and the alternatives reach the pack; with none, the pack says so", () => {
  const t = tax.getTask("article");
  const bp = blueprints.article;
  const offered = productsFor(bp);
  const pack = compileWorkPack(bp, t, { answers: fill(bp), product: offered[0], alternatives: offered.map((p) => p.name) });
  assert.match(pack.markdown, new RegExp(`## AI product\\n\\n- ${offered[0].name}`));
  assert.ok(!pack.product.alternatives.includes(offered[0].name));
  const none = compileWorkPack(bp, t, { answers: fill(bp), noProductLine: NOT_VERIFIED });
  assert.match(none.markdown, /Tool suitability not verified/);
  const own = compileWorkPack(bp, t, { answers: fill(bp), product: { name: "My Local Model", own: true } });
  assert.match(own.markdown, /- My Local Model \(your choice\)/);
});

test("user text is kept as data: markup in an answer reaches the text unchanged and the compiler is deterministic", () => {
  const t = tax.getTask("debug");
  const bp = blueprints.debug;
  const answers = { problem: "<script>alert(1)</script> fails", expected: "it \"works\" & returns `0`", stack: "Node 20" };
  const a = compileWorkPack(bp, t, { answers });
  const b = compileWorkPack(bp, t, { answers: { ...answers } });
  assert.equal(a.markdown, b.markdown);
  assert.ok(a.masterPrompt.includes("<script>alert(1)</script> fails"));
  assert.ok(a.masterPrompt.includes("it \"works\" & returns `0`"));
});

test("the page markup (built into the HTML): the first question, the trail, ten outcome radios, labelled fields, one status region, no AI call", async () => {
  const page = await import("../../assets/js/tools/prompt-builder/index.js");
  const html = page.markup();
  assert.ok(html.trimStart().startsWith('<div class="calculator-page">'));
  assert.match(html, /<h1>AI Prompt Builder<\/h1>/);
  /* one question at a time (2026-11-19): the role first, its list drawn into one place; the trail of answers, hidden until there is one */
  assert.match(html, /id="wb-step-title"[^>]*>What best describes your role\?<\/h2>/);
  assert.match(html, /<div id="wb-role-picker">/);
  assert.match(html, /<nav class="wb-trail" id="wb-trail-nav" aria-label="Your selections" hidden><ol id="wb-trail"><\/ol><\/nav>/);
  assert.doesNotMatch(html, /id="wb-thread"|id="wb-ask"|id="wb-steps"/, "the earlier conversation and step list are gone");
  /* the final step and the result's own actions */
  assert.match(html, /for="wb-project"\s*>\s*Project details, constraints or instructions \(optional\)\s*<\/label>/);
  for (const id of ["wb-copy-main", "wb-edit-main", "wb-download-main"]) assert.match(html, new RegExp(`<button type="button" id="${id}"`), id);
  assert.match(html, /id="wb-final-error" role="alert"/);
  /* the project context pack has its own form, so it sits outside the page form */
  assert.ok(html.indexOf('id="wb-bridge"') > html.indexOf("</form>"));
  assert.match(html, /<legend class="calculator-section__title">What do you want to accomplish with AI\?<\/legend>/);
  assert.equal((html.match(/name="wb-outcome"/g) || []).length, 10);
  for (const id of ["wb-describe", "wb-role", "wb-experience", "wb-depth"]) assert.match(html, new RegExp(`<label[^>]+for="${id}"`), id);
  assert.equal((html.match(/role="status"/g) || []).length, 1);
  assert.match(html, /<section id="wb-results" class="calculator-results/);
  assert.doesNotMatch(html, /fetch\(|api\.openai|anthropic\.com\/v1|generativelanguage/);
  assert.equal(typeof page.init, "function");
  assert.equal(typeof page.render, "function");
});

test("not sure: a plain description suggests an outcome, or nothing", () => {
  assert.equal(tax.suggestOutcome("a short video for my bakery's instagram reel"), "video");
  assert.equal(tax.suggestOutcome("I need test cases for the login api"), "software");
  assert.equal(tax.suggestOutcome("thumbnail for youtube"), "images");
  assert.equal(tax.suggestOutcome("help me learn sql for an interview"), "plan");
  assert.equal(tax.suggestOutcome("zzz"), null);
  assert.equal(tax.suggestOutcome(""), null);
});

/* ---------- the tasks that absorbed the retired tools (D22, 2026-11-18) ---------- */

const pack = (id, answers, extra = {}) => compileWorkPack(blueprints[id], tax.getTask(id), { answers, ...extra });

test("any other task (the former standalone Prompt Builder): the visitor's role and goal lead; a kind adds its rules only when none were written", () => {
  const base = { goal: "A one-page summary of our customer survey for Monday's meeting.", success: "A manager can read it in two minutes" };
  const plain = pack("general-prompt", base);
  assert.equal(plain.state, "ready");
  assert.ok(plain.masterPrompt.startsWith("A one-page summary"));
  const acted = pack("general-prompt", { ...base, actas: "an experienced customer-research analyst", kind: "Summarise or explain something" });
  assert.ok(acted.masterPrompt.startsWith("Act as an experienced customer-research analyst.\n\nSummarise or explain something: A one-page summary"));
  assert.match(acted.masterPrompt, /Keep every number and name exactly as in the source\./, "the kind's rules, since none were written");
  const own = pack("general-prompt", { ...base, kind: "Summarise or explain something", rules: "No more than 400 words\nBritish English" });
  assert.match(own.masterPrompt, /No more than 400 words\./);
  assert.doesNotMatch(own.masterPrompt, /Keep every number and name exactly/, "the visitor's own rules replace the suggestions");
  assert.match(own.masterPrompt, /check your answer against each of these: A manager can read it in two minutes\./);
  /* no profession method is added, so no role is invented */
  assert.doesNotMatch(plain.masterPrompt, /^Act as/);
});

test("debug a problem or a bug report (the former Bug Report to Debugging Prompt): reproduce first, fix size and proof as chosen", () => {
  const answers = { stack: "Node.js 20, Express 4", code: "function save(req, res) {}", problem: "Saving the profile loses the new phone number", expected: "The number is stored and shown after a refresh", steps: "Sign in\nOpen Profile\nChange the phone\nSave\nRefresh", frequency: "Every time", environment: "Chrome 131, staging", files: "src/api/profile.js", protect: "The PUT /api/profile contract", fixScope: "Smallest fix only", tests: "Add a regression test that fails first" };
  const p = pack("debug", answers);
  assert.equal(p.state, "ready");
  assert.match(p.masterPrompt, /Reproduce the problem first, following the steps above/);
  assert.match(p.masterPrompt, /Find the root cause; do not patch the symptom/);
  assert.match(p.masterPrompt, /Add an automated test that fails before the fix and passes after it/);
  assert.match(p.masterPrompt, /Report in this order: the cause, the fix, how it is verified, and anything that could not be verified/);
  for (const v of ["Every time", "Chrome 131, staging", "src/api/profile.js", "The PUT /api/profile contract"]) assert.ok(p.masterPrompt.includes(v), v);
  const wider = pack("debug", { ...answers, fixScope: "Fix, and improve the code around it if clearly needed", tests: "No test changes; verify by hand" });
  assert.match(wider.masterPrompt, /improve it as well, and say exactly what you changed beyond the fix/);
  assert.match(wider.masterPrompt, /Do not change the tests\. Describe exactly how to verify the fix by hand\./);
  assert.equal(tax.getTask("debug").title, "Debug a problem or a bug report");
});

test("meeting follow-up (the former Meeting Notes to Action Plan, as a prompt): owners and dates only from the notes, gaps marked", () => {
  const p = pack("meeting-follow-up", { notes: "Launch moves to 3 March\nPriya to update the pricing page by Friday\nOpen: Hindi version?", meeting: "Launch planning, 11 November", need: "The action plan and a follow-up message" });
  assert.equal(p.state, "ready");
  assert.match(p.masterPrompt, /Never assign an owner or a date yourself/);
  assert.match(p.masterPrompt, /\[owner\?\] or \[date\?\]/);
  assert.match(p.masterPrompt, /Write the follow-up message for the attendees/);
  const planOnly = pack("meeting-follow-up", { notes: "x is decided", need: "The action plan only" });
  assert.doesNotMatch(planOnly.masterPrompt, /Write the follow-up message/);
});

test("QA prompts (what the retired QA Workbench helped produce): planned, run and passed kept apart; nothing reported as run", async () => {
  const review = pack("requirements-review", { feature: "Coupons at checkout", requirements: "AC1: a valid code reduces the total", focus: "Both, with the test conditions for each criterion" });
  assert.match(review.masterPrompt, /Rewrite each criterion that needs it as a testable statement/);
  assert.match(review.masterPrompt, /List the test conditions each criterion needs/);
  const ready = pack("release-readiness", { release: "Version 2.15", results: "Planned 140, executed 128, passed 119, failed 6, blocked 3, not run 12" });
  assert.match(ready.masterPrompt, /never treat a test that was not run as passed/);
  assert.match(ready.masterPrompt, /No exit criteria are agreed: propose measurable ones first, marked as proposals/);
  assert.match(ready.masterPrompt, /it is a recommendation for the person who decides, not a decision/);
  const report = pack("qa-report", { scope: "Release 2.15", results: "Planned 140, executed 128", audience: "Managers and stakeholders" });
  assert.match(report.masterPrompt, /Never write a percentage without the counts behind it/);
  assert.ok(report.masterPrompt.includes("Write a test summary report for managers and stakeholders on: Release 2.15"));
  const qa = (await import("../../assets/js/tools/prompt-builder/roles.js")).getRole("qa");
  for (const id of ["requirements-review", "release-readiness", "qa-report"]) assert.ok(qa.tasks.includes(id), id);
});

test("describing the task: the closest tasks are offered, the visitor chooses; the retired tools' jobs land on their tasks", async () => {
  const { matchTasks } = await import("../../assets/js/tools/prompt-builder/task-index.js");
  assert.equal(matchTasks("I want to test a healthcare API with patient authentication and appointment endpoints").tasks[0].id, "api-testing");
  assert.deepEqual([matchTasks("turn my meeting notes into action items").tasks[0].id, matchTasks("turn my meeting notes into action items").confident], ["meeting-follow-up", true]);
  assert.equal(matchTasks("bug report: login fails after a password reset").tasks[0].id, "debug");
  assert.equal(matchTasks("release readiness for version 2").tasks[0].id, "release-readiness");
  assert.ok(matchTasks("write a prompt for my wedding budget").tasks.some((t) => t.id === "general-prompt"));
  for (const r of matchTasks("compare two answers and check the answer").utilities) assert.ok(!/ai-answer-checklist|ai-answer-compare|context-pack-builder|bug-report|meeting-notes/.test(r.route), r.route);
});
