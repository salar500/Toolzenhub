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
