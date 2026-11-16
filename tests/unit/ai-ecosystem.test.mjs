/*
 * AI ecosystem programme (docs/ecosystem-review/ai-ecosystem/17-FINAL-DESIGN.md):
 * the portable file format, the in-memory hand-off, the task index, the playbook starters and the compiler additions.
 * The golden table of descriptions was written by hand before the index was run (rulebook 8.2).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { withMeta, readMeta, stripMeta, pick, sectionsOf, keyOf, slug, today } from "../../assets/js/tools/ai-tools/common/pack-format.js";
import { put, take } from "../../assets/js/tools/ai-tools/common/handoff.js";
import { PLAYBOOKS } from "../../assets/js/tools/ai-workbench/playbooks.js";
import { compileWorkPack, activeQuestions, CONSISTENCY } from "../../assets/js/tools/ai-workbench/compiler.js";
import { loadBlueprint } from "../../assets/js/tools/ai-workbench/blueprints.js";
import { TASKS, getTask } from "../../assets/js/tools/ai-workbench/taxonomy.js";

/* routes.js reads the host once (as in the other AI unit tests) */
globalThis.window ??= { location: { hostname: "toolzenhub.in", pathname: "/" } };
const { matchTasks, indexCovers } = await import("../../assets/js/tools/ai-workbench/task-index.js");

const blueprints = Object.fromEntries(await Promise.all(TASKS.map(async (t) => [t.id, await loadBlueprint(t.id)])));

/* ---------- file format ---------- */

test("pack format: the metadata round-trips, cannot close its own comment, and is stripped for pasting", () => {
  const meta = { kind: "work-pack", format: 1, answers: { topic: "a --> b <script>x</script>" } };
  const file = withMeta("# Pack\n\nBody", meta);
  assert.ok(file.startsWith("# Pack\n\nBody\n\n<!-- toolzenhub:"));
  assert.equal((file.match(/-->/g) || []).length, 1, "the JSON never contains -->");
  assert.deepEqual(readMeta(file).meta, meta);
  assert.equal(stripMeta(file), "# Pack\n\nBody");
});

test("pack format: missing, cut short, unreadable and oversize files are refused in words", () => {
  assert.equal(readMeta("# just text").error, "none");
  assert.match(readMeta("x <!-- toolzenhub:{\"a\":1}").error, /cut short/);
  assert.match(readMeta("x <!-- toolzenhub:{not json} -->").error, /not readable/);
  assert.match(readMeta("x <!-- toolzenhub:[1,2] -->").error, /not readable/);
  assert.match(readMeta(`${"x".repeat(200001)}`).error, /200 kB/);
});

test("pack format: pick keeps allowed keys and types, caps lengths, and lists what it dropped", () => {
  const { value, ignored } = pick(
    { kind: "work-pack", version: 3, answers: { a: "1234567", b: 5, c: { d: "x" } }, evil: "x", depth: 7, flag: true },
    { kind: "string:20", version: "int", answers: "strings:4", depth: "string:10", flag: "bool" }
  );
  assert.deepEqual(value, { kind: "work-pack", version: 3, answers: { a: "1234", c: { d: "x" } }, flag: true });
  assert.deepEqual(ignored.sort(), ["depth", "evil"]);
});

test("pack format: sections by heading in the forms an AI reply uses", () => {
  const s = sectionsOf("Intro line\n## Purpose\nA shop\n**Current state**\nBeta\nNext task:\nShip it\n# Decisions\n- one\n<!-- toolzenhub:{} -->");
  assert.deepEqual(s.map((x) => x.title), ["", "Purpose", "Current state", "Next task", "Decisions"]);
  assert.equal(s[4].body, "- one");
  assert.equal(keyOf("1. Next  task!"), "1 next task");
  assert.equal(slug("ToolZen Hub: AI Tools!"), "toolzen-hub-ai-tools");
  assert.equal(slug("***"), "project");
  assert.equal(today(new Date(2026, 0, 5)), "2026-01-05");
});

/* ---------- hand-off ---------- */

test("hand-off: a payload is taken once; nothing is left behind", () => {
  put("review", { request: "x" });
  assert.deepEqual(take("review"), { request: "x" });
  assert.equal(take("review"), null);
  assert.equal(take("never-put"), null);
});

/* ---------- task index ---------- */

const GOLDEN = [
  ["test plan for a checkout coupon feature", "test-plan"],
  ["release testing strategy", "test-plan"],
  ["write test cases for login", "test-cases"],
  ["BDD scenarios given when then", "test-cases"],
  ["api tests with postman", "api-testing"],
  ["automate tests with playwright", "test-automation"],
  ["selenium automation script", "test-automation"],
  ["regression suite for the next release", "regression"],
  ["defect report for a payment issue", "defect"],
  ["load test with jmeter", "performance-test"],
  ["my app crashes with a stack trace", "debug"],
  ["fix this error in my python code", "debug"],
  ["review my pull request", "code-review"],
  ["refactor legacy code", "refactor"],
  ["design a rest api", "api-design"],
  ["write a readme", "tech-docs"],
  ["user stories and acceptance criteria", "requirements"],
  ["build a feature in react", "code-feature"],
  ["blog post about guest checkout", "article"],
  ["linkedin post about our launch", "social-posts"],
  ["instagram caption for a cafe", "social-posts"],
  ["landing page copy", "marketing-copy"],
  ["product description for my shop", "marketing-copy"],
  ["youtube script about budgeting", "script"],
  ["turn my article into a newsletter", "repurpose"],
  ["reply to an angry customer email", "email-message"],
  ["write an email to my manager", "email-message"],
  ["cover letter", "email-message"],
  ["generate an image of a dragon", "image-generate"],
  ["poster for a music night", "image-generate"],
  ["remove background from a photo", "image-edit"],
  ["product photo on white background", "product-photo"],
  ["youtube thumbnail", "thumbnail"],
  ["same character in a comic", "image-series"],
  ["storyboard for an ad", "storyboard"],
  ["shot list for a wedding film", "storyboard"],
  ["text to video of a sunrise", "text-to-video"],
  ["animate a photo of my dog", "image-to-video"],
  ["voiceover for a training video", "voiceover"],
  ["text to speech narration", "voiceover"],
  ["plan a podcast episode", "podcast"],
  ["jingle for my brand", "music"],
  ["sound effects for a game", "sound-effects"],
  ["research plan for my thesis", "research-plan"],
  ["literature review on remote work", "literature-review"],
  ["sql query for monthly sales", "data-analysis"],
  ["excel formula to sum by month", "data-analysis"],
  ["power bi dax measure", "data-analysis"],
  ["competitor analysis for a coffee brand", "market-research"],
  ["summarise this pdf contract", "doc-summary"],
  ["key points from a 40 page document", "doc-summary"],
  ["proofread my essay", "fix-accuracy"],
  ["fact check my draft", "fix-accuracy"],
  ["simplify this for beginners", "adapt-audience"],
  ["project plan with milestones", "project-plan"],
  ["learn python study plan", "learning-plan"],
  ["prepare for a job interview", "interview-prep"],
  ["slides for a sales pitch", "presentation"],
  ["status report for the board", "report"],
  ["critique my draft", "review-draft"]
];

test("task index: every task has true synonyms and every synonym list names a task", () => {
  assert.ok(indexCovers());
});

test("task index: the golden table (written first) finds the expected task first", () => {
  assert.ok(GOLDEN.length >= 60);
  const misses = GOLDEN.map(([text, id]) => [text, id, matchTasks(text).tasks[0]?.id]).filter(([, id, got]) => id !== got);
  assert.deepEqual(misses, []);
});

test("task index: ambiguity is shown, never resolved silently; utilities are offered; nothing for empty text", () => {
  const both = matchTasks("bug in my excel formula").tasks.map((t) => t.id);
  assert.ok(both.includes("debug") && both.includes("data-analysis"), both.join());
  assert.equal(matchTasks("interview podcast").confident, false, "equal scores are shown as equal");
  assert.equal(matchTasks("test plan for a checkout coupon feature").confident, true);
  assert.ok(matchTasks("compare two answers from chatgpt").utilities.some((u) => u.id === "ai-answer-compare"));
  assert.ok(matchTasks("switch to claude and continue my project").utilities.some((u) => u.id === "context-pack-builder"));
  assert.ok(matchTasks("which ai tool for video").utilities.some((u) => u.id === "ai-directory"));
  assert.deepEqual(matchTasks("   ").tasks, []);
  assert.deepEqual(matchTasks("zzqx qqq").tasks, []);
  assert.ok(matchTasks("anything at all about testing and code and images and video").tasks.length <= 3);
  assert.deepEqual(matchTasks("Test Plan!"), matchTasks("test plan"), "case and punctuation do not matter");
});

/* ---------- playbooks ---------- */

test("playbooks: every step names a real task, every answer is a real question of it with a real option, no project facts", () => {
  assert.equal(PLAYBOOKS.length, 10);
  for (const p of PLAYBOOKS) {
    assert.ok(p.title && p.purpose && p.steps.length >= 1, p.id);
    for (const s of p.steps) {
      const bp = blueprints[s.task];
      assert.ok(getTask(s.task) && bp, `${p.id}: ${s.task}`);
      assert.ok(["short", "standard", "detailed", "multi"].includes(s.depth), `${p.id}: ${s.depth}`);
      for (const [key, value] of Object.entries(s.answers)) {
        const q = bp.questions.find((x) => x.key === key);
        assert.ok(q, `${p.id}/${s.task}: no question ${key}`);
        assert.equal(q.kind, "select", `${p.id}/${s.task}: a starter fills choices only`);
        assert.ok(q.options.some((o) => o.value === value), `${p.id}/${s.task}: ${value}`);
      }
      assert.equal(compileWorkPack(bp, getTask(s.task), { answers: s.answers, depth: s.depth }).depth, s.depth);
    }
  }
});

/* ---------- compiler additions (17 §5.4) ---------- */

const fill = (bp) => {
  const a = {};
  for (let pass = 0; pass < 2; pass++) for (const q of activeQuestions(bp, a)) a[q.key] = q.kind === "select" ? q.options[1].value : `sample ${q.key}`;
  return a;
};

test("compiler: project context appears once, fenced, after the goal and before the requirements; its file data is dropped", () => {
  const bp = blueprints["test-plan"];
  const pack = compileWorkPack(bp, getTask("test-plan"), { answers: fill(bp), context: "React app ``` with fences\n<!-- toolzenhub:{\"x\":1} -->" });
  const mp = pack.masterPrompt;
  assert.equal(mp.split("Project context (from my notes").length, 2);
  assert.ok(mp.indexOf("Project context") > mp.indexOf("Write a test plan") && mp.indexOf("Project context") < mp.indexOf("Requirements:"));
  assert.match(mp, /````text\nReact app ``` with fences\n````/);
  assert.doesNotMatch(mp, /toolzenhub/);
  assert.doesNotMatch(compileWorkPack(bp, getTask("test-plan"), { answers: fill(bp) }).masterPrompt, /Project context/);
});

test("compiler: image, video and audio prompts take the consistency sheet, not project context", () => {
  const bp = blueprints["image-series"];
  const pack = compileWorkPack(bp, getTask("image-series"), { answers: fill(bp), depth: "multi", context: "secret notes", consistency: { subject: "a red fox", never: "the scarf\nthe eyes", look: "" } });
  assert.doesNotMatch(pack.masterPrompt, /secret notes/);
  const line = "Keep the same in every output: Subject or character: a red fox; Never change: the scarf; the eyes.";
  assert.ok(pack.masterPrompt.includes(line));
  assert.ok(pack.stages.every((s) => s.prompt.includes(line)));
  assert.equal(CONSISTENCY.length, 7);
});

test("compiler: placeholder text in an answer is a conflict; requirements are never written twice; stage headers name the deliverable", () => {
  const bp = blueprints.article;
  const pack = compileWorkPack(bp, getTask("article"), { answers: { ...fill(bp), topic: "TODO pick a topic" }, depth: "multi" });
  assert.ok(pack.conflicts.some((c) => /Topic and main point still contains placeholder text/.test(c)));
  const reqs = pack.masterPrompt.split("Requirements:\n")[1].split("\n\n")[0].split("\n");
  assert.equal(new Set(reqs.map((r) => r.toLowerCase())).size, reqs.length);
  assert.ok(pack.stages.every((s) => s.prompt.includes("(Part of the work on an article.)")));
});

test("compiler: the prompt length is reported, a long prompt gets the note, and the same input gives the same pack", () => {
  const bp = blueprints["test-plan"];
  const input = { answers: fill(bp), context: "word ".repeat(700) };
  const a = compileWorkPack(bp, getTask("test-plan"), input);
  assert.ok(a.promptWords > 600 && a.notes.length === 1);
  assert.deepEqual(compileWorkPack(bp, getTask("test-plan"), input), a);
  assert.equal(compileWorkPack(bp, getTask("test-plan"), { answers: fill(bp) }).notes.length, 0);
});

test("the two new tasks: an email reply asks for the received message; a document summary forbids outside facts", () => {
  const e = blueprints["email-message"];
  assert.ok(!activeQuestions(e, { kind: "A new message" }).some((q) => q.key === "received"));
  const reply = compileWorkPack(e, getTask("email-message"), { answers: { kind: "A reply to a message I received", goal: "Agree a date", recipient: "a customer" } });
  assert.deepEqual(reply.missing, ["The message you are replying to"]);
  assert.match(reply.masterPrompt, /Write a reply to the message below/);
  const busy = compileWorkPack(e, getTask("email-message"), { answers: { goal: "x", recipient: "y", length: "Short (under 100 words)", include: "a\nb\nc\nd\ne\nf" } });
  assert.equal(busy.conflicts.length, 1);
  const d = compileWorkPack(blueprints["doc-summary"], getTask("doc-summary"), { answers: { document: "a contract", purpose: "renewal" } });
  assert.match(d.masterPrompt, /quote the passage/);
  assert.match(d.masterPrompt, /Invented sources/);
});

/* ---------- AI Context Bridge (17 §6) ---------- */

const ctx = await import("../../assets/js/tools/ai-tools/common/context-engine.js");
const bridge = await import("../../assets/js/tools/context-pack-builder/index.js");
const reviewer = await import("../../assets/js/tools/ai-answer-checklist/index.js");
const rv = await import("../../assets/js/tools/ai-tools/common/review-engine.js");

const PROJECT = { project: "Shop", purpose: "An online shop.", role: "Developer", stack: "Node\nPostgres", state: "Beta.", decisions: "d1\nd2\nd3\nd4\nd5\nd6\nd7", rejected: "A chatbot", terms: "SKU: stock unit", files: "app.js - entry", done: "c1\nc2\nc3\nc4\nc5\nc6", issues: "Slow search", rules: "No new dependencies", task: "Add coupons.", verify: "npm test", reply: "Ask first." };

test("bridge: every mode renders from the same fields, with its own title and sections; the handoff keeps the latest five", () => {
  const brief = ctx.composeContext({ ...PROJECT, mode: "brief" });
  assert.ok(brief.startsWith("# Project context: Shop"));
  for (const h of ["## Purpose", "## Decisions", "## Rejected approaches", "## Terms", "## How to respond"]) assert.ok(brief.includes(h), h);
  const hand = ctx.composeContext({ ...PROJECT, mode: "handoff" });
  assert.ok(hand.startsWith("# Handoff: Shop"));
  assert.ok(hand.includes("- d3\n") && !hand.includes("- d2\n") && hand.includes("(2 earlier items left out)"));
  assert.ok(hand.includes("(1 earlier item left out)"));
  assert.ok(!hand.includes("## Terms") && !hand.includes("## Rejected"));
  const session = ctx.composeContext({ ...PROJECT, mode: "session" });
  assert.ok(session.startsWith("# Continuing: Shop") && !session.includes("## Purpose"));
  const agent = ctx.composeContext({ ...PROJECT, mode: "agent" });
  assert.ok(agent.startsWith("# Shop: instructions for coding assistants"));
  for (const h of ["## Project", "## Do not", "## Where things are", "## How to check work"]) assert.ok(agent.includes(h), h);
  assert.ok(!agent.includes("## The next task"));
  assert.equal(ctx.modeOf("nonsense"), "brief");
});

test("bridge: an opened pack's next version names what changed", () => {
  const md = ctx.composeContext({ ...PROJECT, mode: "brief" }, { version: 4, date: "2026-11-16", changed: ["Current state", "The next task"] });
  assert.ok(md.includes("Version 4, 2026-11-16. Changed since version 3: Current state, The next task."));
  assert.deepEqual(ctx.changedSections(PROJECT, { ...PROJECT, state: "Live.", task: "Ship." }), ["Current state", "The next task"]);
});

test("bridge: the extraction prompt names every heading; a reply is parsed by heading, empties and unknowns handled, nothing invented", () => {
  for (const s of ctx.SECTIONS.filter((x) => x.key !== "reply")) assert.ok(ctx.EXTRACTION_PROMPT.includes(`## ${s.heading}`), s.heading);
  const reply = "Sure! Here it is.\n## Project name\nShop\n## Purpose\nAn online shop.\n**Current state**\nBeta\n## Decisions\n- Use Postgres\n- Keep REST\n## Rejected approaches\nnone\n## The next task\nAdd coupons\n## Mood\nOptimistic";
  const { values, filled, empty } = ctx.parseReply(reply);
  assert.deepEqual(values.decisions, "Use Postgres\nKeep REST");
  assert.equal(values.project, "Shop");
  assert.equal(values.state, "Beta");
  assert.ok(!("rejected" in values));
  assert.ok(empty.includes("Rejected approaches") && filled.includes("The next task"));
  assert.match(values.notes, /Mood: Optimistic/);
  assert.match(values.notes, /Sure! Here it is/);
  assert.deepEqual(ctx.parseReply("no headings at all").filled, []);
});

test("bridge: notes warn about secrets, length and stale or contradictory items without changing any field", () => {
  const labels = { stack: "How it is built" };
  const v = { ...PROJECT, mode: "handoff", stack: "api_key = abcd1234efgh", task: "c6", decisions: "Use a chatbot for help", rejected: "Use a chatbot" };
  const notes = ctx.contextNotes(v, "word ".repeat(450), labels, { today: "2026-11-30", opened: "2026-11-01" });
  assert.ok(notes.some((n) => /Short handoff: 450 words\. Over 400/.test(n)));
  assert.ok(notes.some((n) => /How it is built contains text that looks like a password or key/.test(n)));
  assert.ok(notes.some((n) => /more than 14 days ago/.test(n)));
  assert.ok(notes.some((n) => /also appears under completed work/.test(n)));
  assert.ok(notes.some((n) => /both a decision and a rejected approach/.test(n)));
  assert.equal(v.stack, "api_key = abcd1234efgh");
  assert.deepEqual(ctx.contextNotes({ ...PROJECT, mode: "brief" }, "", {}, {}), []);
});

test("bridge page: the mode is the first field, the example still composes the brief, a download carries its version", () => {
  assert.equal(bridge.CONFIG.fields[0].key, "mode");
  const b = bridge.build(bridge.CONFIG.example.values);
  assert.ok(b.markdown.startsWith("# Project context: ToolZen Hub"));
  const file = bridge.CONFIG.downloadText(b.markdown, bridge.CONFIG.example.values, {});
  const { meta } = readMeta(file);
  assert.equal(meta.kind, "context-pack");
  assert.equal(meta.version, 1);
  assert.equal(meta.values.project, "ToolZen Hub");
  assert.equal(bridge.CONFIG.fileName({ project: "ToolZen Hub" }, { version: 3 }), "context-toolzen-hub-v3");
});

/* ---------- AI Output Reviewer (17 §7) ---------- */

const REQUEST = "Write release notes.\n\nRequirements:\n- Mention the coupon feature and its expiry rules\n- List known issues\n- Thank the beta testers\n\nFormat of your answer:\n- A table of changes\n- Under 120 words";

test("reviewer: requested items are found in a Workbench prompt and checked by their words, never called met or failed", () => {
  const items = rv.extractRequirements(REQUEST);
  assert.deepEqual(items, ["Mention the coupon feature and its expiry rules", "List known issues", "Thank the beta testers", "A table of changes", "Under 120 words"]);
  assert.deepEqual(rv.extractRequirements("Please:\n1. include a summary\n2. add tests"), ["include a summary", "add tests"]);
  assert.deepEqual(rv.extractRequirements("Is a fixed deposit better than a debt fund?"), []);
  assert.equal(rv.coverage("Mention the coupon feature and its expiry rules", "Coupons now expire after 30 days, see the expiry rules.").addressed, true);
  assert.equal(rv.coverage("Thank the beta testers", "Coupons now expire.").addressed, false);
});

test("reviewer: format checks for a table, JSON only, headings, code, word limits and counts", () => {
  assert.ok(rv.formatChecks("Give a table", "No table here.").some((f) => /no Markdown table/.test(f)));
  assert.deepEqual(rv.formatChecks("Give a table", "| a | b |\n|---|---|\n| 1 | 2 |"), []);
  assert.ok(rv.formatChecks("Return JSON only", "{\"a\": 1,}").some((f) => /not valid JSON/.test(f)));
  assert.deepEqual(rv.formatChecks("Return JSON only", "```json\n{\"a\": 1}\n```"), []);
  assert.ok(rv.formatChecks("Use headings", "Plain text.").some((f) => /no headings/.test(f)));
  assert.ok(rv.formatChecks("Write the code to fix it", "Change line 3.").some((f) => /no code block/.test(f)));
  assert.ok(rv.formatChecks("Keep it under 5 words", "one two three four five six seven").some((f) => /7 words; the limit is 5/.test(f)));
  assert.ok(rv.formatChecks("", "one two three", "2").some((f) => /limit is 2/.test(f)));
  assert.ok(rv.formatChecks("Give 3 ideas", "- a\n- b").some((f) => /asks for 3; the answer lists 2/.test(f)));
});

test("reviewer: leftovers and contradictions inside one answer", () => {
  assert.ok(rv.leftovers("Dear [your name], the plan is TODO").length >= 2);
  assert.ok(rv.leftovers("It starts like this and then").some((l) => /cut off/.test(l)));
  assert.ok(rv.leftovers("```js\nlet a = 1;").some((l) => /never closed/.test(l)));
  assert.deepEqual(rv.leftovers("All done."), []);
  const c = rv.contradictions("The plan costs 500 rupees per month. Later we note the plan costs 700 rupees per month.");
  assert.equal(c.length, 1);
  assert.equal(c[0].why, "different figures");
});

test("reviewer: a request with items gives the review with a follow-up prompt naming only the gaps; a plain question keeps the old checklist", () => {
  const answer = "| Change | Note |\n|---|---|\n| Coupons | Coupon codes now have expiry rules. |\n\nKnown issues: search is slow.";
  const r = rv.review({ answer, question: REQUEST, purpose: "publish", reviewType: "article", wordLimit: "" });
  assert.ok(r.markdown.startsWith("# Review of an AI answer\n\n## Against your request"));
  assert.match(r.markdown, /Thank the beta testers: \*\*not visibly addressed\*\*/);
  assert.match(r.markdown, /List known issues: visibly addressed/);
  assert.match(r.followUp, /Thank the beta testers/);
  assert.doesNotMatch(r.followUp, /coupon feature/);
  assert.match(r.markdown, /## What this review cannot tell you/);
  for (const word of [/\bverified\b/i, /\baccurate\b/i, /\bcorrect answer\b/i, /\bscore\b/i, /%/]) assert.doesNotMatch(r.markdown.split("## Statements to check")[0], word);
  const plain = reviewer.build(reviewer.CONFIG.example.values);
  assert.ok(plain.markdown.startsWith("# Evidence checklist for an AI answer\n\n## The question asked"));
  assert.ok(reviewer.CONFIG.fields.some((f) => f.key === "reviewType") && reviewer.CONFIG.actions[0].id === "follow-up");
});

/* ---------- AI Home (17 §4) ---------- */

test("AI Home: the AI Tools page starts with plain links into the Workbench and the AI tools; other sections are untouched", async () => {
  const { sectionPageHtml, aiHomeStartHtml } = await import("../../assets/js/pages/directory/directory-html.js");
  const ai = sectionPageHtml("ai-tools");
  const start = aiHomeStartHtml();
  assert.ok(ai.includes(start));
  assert.ok(ai.indexOf("ai-start-title") < ai.indexOf("categories-detail__heading"), "the start block comes before the tool list");
  assert.match(start, /href="\/tools\/ai-workbench\/\?start=describe"/);
  assert.equal((start.match(/\?outcome=/g) || []).length, 8);
  for (const t of ["test-plan", "article", "debug", "email-message"]) assert.ok(start.includes(`?task=${t}"`), t);
  assert.match(start, /\/tools\/context-pack-builder\/\?mode=handoff/);
  assert.match(start, /\/tools\/ai-answer-checklist\//);
  assert.doesNotMatch(start, /ai-tools\/directory/, "the directory keeps its card and sidebar entry only");
  assert.doesNotMatch(start, /<script|<form|<input/);
  for (const id of ["time-tools", "developer-tools", "image-tools", "pdf-tools"]) assert.doesNotMatch(sectionPageHtml(id), /ai-start/, id);
});

test("reviewer: testing and research types add their checks", () => {
  const t = rv.review({ answer: "Login works.", question: "", purpose: "learning", reviewType: "testing" });
  assert.match(t.markdown, /No test case ids were found/);
  assert.match(t.markdown, /No expected results were found/);
  const r = rv.review({ answer: "Remote work raises output.", question: "", purpose: "learning", reviewType: "research" });
  assert.match(r.markdown, /No citations or links were found/);
});
