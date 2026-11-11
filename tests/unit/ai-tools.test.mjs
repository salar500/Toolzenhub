/**
 * AI Tools (the seventh section, 2026-11-11): the brief engine, the three brief tools and their place in the catalog.
 * Everything is pure text in the browser: no AI service, no storage. These tests pin the composed Markdown's shape, the
 * clarity check's arithmetic and the catalog integration (section, URLs, related lists kept inside the section).
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };

let engine, prompt, bug, pack, tools, tax;
before(async () => {
  engine = await import("../../assets/js/tools/ai-tools/common/brief-engine.js");
  prompt = await import("../../assets/js/tools/prompt-builder/index.js");
  bug = await import("../../assets/js/tools/bug-report-prompt/index.js");
  pack = await import("../../assets/js/tools/context-pack-builder/index.js");
  tools = await import("../../assets/js/data/tools.js");
  tax = await import("../../assets/js/data/taxonomy.js");
});

const TOOLS = () => [prompt, bug, pack];

describe("brief engine: text helpers", () => {
  test("tidy: CRLF to LF, trailing spaces gone, at most one blank line, trimmed", () => {
    assert.equal(engine.tidy("  a \r\n\r\n\r\n\r\nb  \n"), "a\n\nb");
    assert.equal(engine.tidy(undefined), "");
  });

  test("lines, bullets and numbered strip list markers the visitor already typed", () => {
    assert.deepEqual(engine.lines("- one\n* two\n1. three\n2) four\n\n  five  "), ["one", "two", "three", "four", "five"]);
    assert.equal(engine.bullets("- a\nb"), "- a\n- b");
    assert.equal(engine.numbered("1. a\nb"), "1. a\n2. b");
    assert.equal(engine.bullets(""), "");
  });

  test("fenced: a fence inside the text gets a longer fence around it", () => {
    assert.equal(engine.fenced("x"), "```\nx\n```");
    assert.equal(engine.fenced("a\n```\nb"), "````\na\n```\nb\n````");
  });

  test("section and document: an empty body renders nothing, and parts join with one blank line", () => {
    assert.equal(engine.section("Heading", "  "), "");
    assert.equal(engine.section("Heading", "body"), "## Heading\n\nbody");
    assert.equal(engine.section("Top", "t", 1), "# Top\n\nt");
    assert.equal(engine.document(["# A", "", "## B\n\nb\n\n\n"]), "# A\n\n## B\n\nb\n");
  });
});

describe("brief engine: clarity check", () => {
  const fields = [
    { key: "goal", label: "Goal", required: true },
    { key: "notes", label: "Notes" },
    { key: "format", label: "Format", kind: "select" }
  ];

  test("missing essentials are listed; optional fields never count as missing", () => {
    const c = engine.clarityCheck(fields, { goal: "", notes: "", format: "" });
    assert.deepEqual(c.missing, [{ key: "goal", label: "Goal" }]);
    assert.equal(c.filled, 0);
    assert.equal(c.total, 3);
    assert.equal(c.score, 80);
  });

  test("vague words and very short essentials warn; a select never does", () => {
    const c = engine.clarityCheck(fields, { goal: "A plan", notes: "Use the usual tools etc.", format: "etc" });
    assert.deepEqual(c.missing, []);
    assert.deepEqual(c.warnings.map((w) => w.key), ["goal", "notes"]);
    // a one-line field is short by nature: no "very short" warning for a name
    assert.deepEqual(engine.clarityCheck([{ key: "name", label: "Name", kind: "text", required: true }], { name: "ToolZen" }).warnings, []);
    assert.match(c.warnings[0].text, /very short/);
    assert.match(c.warnings[1].text, /"etc\.?"/);
    assert.equal(c.score, 90);
  });

  test("a complete, specific brief scores 100", () => {
    const c = engine.clarityCheck(fields, { goal: "A one-page summary of the survey for the leadership meeting.", notes: "", format: "" });
    assert.equal(c.score, 100);
    assert.deepEqual(c.warnings, []);
  });

  test("buildBrief: nothing filled is 'empty' with no markdown; an essential missing is 'incomplete' but still composed", () => {
    const config = { fields, compose: (v) => `# ${v.goal}\n\n${v.notes}` };
    assert.deepEqual(engine.buildBrief(config, { goal: "", notes: "", format: "" }).state, "empty");
    const partial = engine.buildBrief(config, { goal: "", notes: "some notes", format: "" });
    assert.equal(partial.state, "incomplete");
    assert.equal(partial.markdown, "# \n\nsome notes");
    const ok = engine.buildBrief(config, { goal: "Write the plan", notes: "", format: "" });
    assert.equal(ok.state, "ok");
    assert.equal(ok.words, 3, "Markdown marks are not words");
  });
});

describe("the three brief tools", () => {
  test("each tool's example composes a ready brief with no leaked value, and a blank form is empty", () => {
    for (const t of TOOLS()) {
      const brief = t.build(t.CONFIG.example.values);
      assert.equal(brief.state, "ok", t.CONFIG.toolId);
      assert.deepEqual(brief.check.warnings, [], `${t.CONFIG.toolId}: the example must not trip its own clarity check`);
      assert.ok(!/undefined|\[object|null/.test(brief.markdown), `${t.CONFIG.toolId}: leaked value`);
      assert.ok(brief.words > 80, `${t.CONFIG.toolId}: ${brief.words} words`);
      const blank = t.build(Object.fromEntries(t.CONFIG.fields.map((f) => [f.key, ""])));
      assert.equal(blank.state, "empty");
      assert.equal(blank.markdown, "");
      // the form after Reset: every choice at its first option is still an empty form
      const defaults = t.build(Object.fromEntries(t.CONFIG.fields.map((f) => [f.key, f.kind === "select" ? f.options[0].value : ""])));
      assert.equal(defaults.state, "empty", `${t.CONFIG.toolId}: defaults only`);
    }
  });

  test("every field has a key, a label and a hint; essentials are marked; selects have options", () => {
    for (const t of TOOLS()) {
      const keys = t.CONFIG.fields.map((f) => f.key);
      assert.equal(new Set(keys).size, keys.length, t.CONFIG.toolId);
      for (const f of t.CONFIG.fields) {
        assert.ok(f.label && f.hint, `${t.CONFIG.toolId} ${f.key}`);
        if (f.kind === "select") assert.ok(f.options.length >= 2 && f.options.every((o) => o.label), `${t.CONFIG.toolId} ${f.key}`);
      }
      assert.ok(t.CONFIG.fields.filter((f) => f.required).length >= 2, t.CONFIG.toolId);
    }
  });

  test("prompt builder: the task comes first, empty optional sections vanish, success criteria become a checklist", () => {
    const v = Object.fromEntries(prompt.CONFIG.fields.map((f) => [f.key, ""]));
    const brief = prompt.build({ ...v, goal: "A reply to the customer's complaint about the late delivery.", success: "- Polite\n- Under 120 words" });
    assert.equal(brief.state, "ok");
    assert.ok(brief.markdown.startsWith("# Task\n\nA reply to the customer's complaint"));
    assert.ok(!brief.markdown.includes("## Act as"));
    assert.ok(!brief.markdown.includes("## Requirements"));
    assert.ok(brief.markdown.includes("## Success criteria\n\n- Polite\n- Under 120 words\n\nCheck your answer"));
    const withFormat = prompt.build({ ...v, goal: "x".repeat(20), success: "y".repeat(20), format: "Valid JSON only, with no text before or after it." });
    assert.ok(withFormat.markdown.includes("## Requirements\n\n- Format: Valid JSON only"));
    // the guided choices (2026-11-11 brief): task type opens the task line; tone, detail and a coding assistant add requirement lines
    const guided = prompt.build({ ...v, task: "Write or fix code", goal: "A function that parses the CSV export.", success: "It runs as written", tone: "Plain and direct, no padding.", detail: "Keep it brief: the shortest answer that meets the criteria, with no preamble.", assistant: "a coding assistant (Claude Code, Cursor, Copilot in the editor)" });
    assert.ok(guided.markdown.startsWith("# Task\n\nWrite or fix code: A function that parses the CSV export."));
    assert.ok(guided.markdown.includes("- Tone: Plain and direct, no padding.\n- Length: Keep it brief") && guided.markdown.includes("- You can read the files I name"));
    assert.ok(!prompt.build({ ...v, goal: "x".repeat(20), success: "y".repeat(20), assistant: "ChatGPT" }).markdown.includes("read the files"));
    // every task type suggests rules and success criteria, as a starting point the page writes only into empty fields
    for (const o of prompt.CONFIG.fields.find((f) => f.key === "task").options.slice(1)) assert.ok(o.fill.rules.length > 20 && o.fill.success.length > 20, o.label);
  });

  test("bug report: steps are numbered, error output is fenced, the method follows the chosen scope and tests", () => {
    const brief = bug.build(bug.CONFIG.example.values);
    assert.ok(brief.markdown.startsWith("# Debugging task\n\n## What happens"));
    assert.ok(brief.markdown.includes("## Steps to reproduce\n\n1. Sign in as a normal user"));
    assert.ok(brief.markdown.includes("## Error output\n\n```\nPUT /api/profile 200 OK"));
    assert.ok(brief.markdown.includes("3. Make the smallest change that fixes the cause."));
    assert.ok(brief.markdown.includes("4. Add an automated test that fails before the fix"));
    assert.ok(brief.markdown.includes("## Must not change\n\n- The API contract"));
    assert.ok(brief.markdown.trimEnd().endsWith("Do not guess and do not invent output."));
  });

  test("context pack: titled by the project, the sections keep their order, the reply instruction closes it", () => {
    const brief = pack.build(pack.CONFIG.example.values);
    assert.ok(brief.markdown.startsWith("# Project context: ToolZen Hub\n\n## Purpose"));
    const order = ["## Purpose", "## How it is built", "## Current state", "## Key files and folders", "## Completed work, do not redo", "## Known issues and traps", "## Rules and conventions", "## The next task", "## How the work will be verified", "## How to respond"];
    let last = -1;
    for (const h of order) { const i = brief.markdown.indexOf(h); assert.ok(i > last, h); last = i; }
    assert.ok(brief.markdown.includes("- Static site built with Eleventy 3"));
  });

  test("the page: a labelled control per field with its hint linked, an editable brief, copy and download, no related articles", () => {
    for (const t of TOOLS()) {
      const html = t.markup();
      const prefix = t.CONFIG.prefix;
      for (const f of t.CONFIG.fields) {
        assert.ok(html.includes(`for="${prefix}-${f.key}"`), `${t.CONFIG.toolId}: label for ${f.key}`);
        assert.ok(html.includes(`aria-describedby="${prefix}-${f.key}-hint"`), `${t.CONFIG.toolId}: hint of ${f.key}`);
      }
      assert.ok(html.includes(`<textarea id="${prefix}-output"`), t.CONFIG.toolId);
      assert.ok(!t.CONFIG.fields.some((f) => ["output", "load-example", "copy", "download", "reset", "check", "live", "form"].includes(f.key)), `${t.CONFIG.toolId}: a field key must not collide with the page's own ids`);
      assert.ok(html.includes(`id="${prefix}-copy"`) && html.includes(`id="${prefix}-download"`) && html.includes(`id="${prefix}-load-example"`) && html.includes(`id="${prefix}-reset"`));
      assert.ok(html.includes('class="calculator-section"') && html.includes('class="calculator-results"'), "the shared side-by-side layout");
      assert.equal(t.showRelatedArticles, false);
      assert.equal(t.showRelatedCalculators, true);
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    }
  });
});

describe("the claim engine and the evidence checklist", () => {
  let claims, checker;
  before(async () => {
    claims = await import("../../assets/js/tools/ai-tools/common/claim-engine.js");
    checker = await import("../../assets/js/tools/ai-answer-checklist/index.js");
  });

  test("sentences: code blocks, list markers, headings and emphasis are stripped; short fragments dropped", () => {
    const s = claims.sentences("## Title\n\n- **Rates** are 7.5% now. Code:\n```js\nconst x = 1;\n```\nIt *always* works! Done now.");
    assert.ok(s.includes("Rates are 7.5% now."));
    assert.ok(s.includes("It always works!"));
    assert.ok(!s.some((x) => x.includes("const x")));
  });

  test("classify: money, percent, date, source and absolute wording are found; a plain sentence is not checkable", () => {
    assert.deepEqual(claims.classify("Deposits up to ₹5 lakh are insured.").kinds, ["money"]);
    assert.deepEqual(claims.classify("Rates are around 7.5% for 5 years.").kinds, ["percent"]);
    assert.ok(claims.classify("According to a 2023 SEBI report, returns were lower.").kinds.includes("source"));
    assert.ok(claims.classify("According to a 2023 SEBI report, returns were lower.").kinds.includes("date"));
    assert.equal(claims.classify("Debt funds are always more tax-efficient.").absolute, "always");
    assert.equal(claims.classify("It depends on your bank.").checkable, false);
    assert.equal(claims.classify("It depends on your bank.").hedge, "it depends");
  });

  test("analyse: an answer with no source, assumption, date note or limitation lists all four gaps; a careful one lists none", () => {
    const bare = claims.analyse("Fixed deposits pay 7% a year. They are always safe.");
    assert.equal(bare.missing.length, 4);
    assert.equal(bare.absolutes, 1);
    const careful = claims.analyse("As of March 2026, according to the RBI, rates are about 7%. I assume you are in India. However, rates change.");
    assert.deepEqual(careful.missing, []);
  });

  test("the checklist: the example composes a ready checklist with boxes, the gaps and the questions; the purpose sets the first line", () => {
    const brief = checker.build(checker.CONFIG.example.values);
    assert.equal(brief.state, "ok");
    assert.ok(brief.markdown.startsWith("# Evidence checklist for an AI answer\n\n## The question asked"));
    assert.ok(brief.markdown.includes("feeds a decision with money, legal or health consequences"));
    assert.ok(brief.markdown.includes("1. [ ] \""));
    assert.ok(brief.markdown.includes('absolute: "never guaranteed"') || brief.markdown.includes('absolute: "never"'));
    assert.ok(brief.markdown.includes("## Questions to put back to the assistant"));
    assert.ok(brief.markdown.includes("Give one exception to each absolute statement"));
    assert.ok(!/undefined|\[object/.test(brief.markdown));
    const general = checker.build({ answer: "It depends on what you need and how you work.", question: "", purpose: "code" });
    assert.ok(general.markdown.includes("No figures, dates, sources or absolute statements were found"));
    assert.ok(general.markdown.includes("Run it in a safe place first"));
  });
});

describe("the comparison engine and Compare Two AI Answers", () => {
  let cmp, tool;
  before(async () => {
    cmp = await import("../../assets/js/tools/ai-tools/common/compare-engine.js");
    tool = await import("../../assets/js/tools/ai-answer-compare/index.js");
  });

  test("tokens and similarity: content words, light stemming, stop words dropped; reworded sentences match, unrelated ones do not", () => {
    assert.deepEqual([...cmp.tokens("The deposits are insured up to ₹5 lakh.")].sort(), ["deposit", "insur", "lakh"]);
    assert.ok(cmp.similarity("FD rates are around 7.5% for 5 years.", "FD rates are currently about 7% for 5 years.") >= 0.5);
    assert.ok(cmp.similarity("A liquid fund suits money needed within a year.", "The interest is taxed at your slab rate.") < 0.5);
  });

  test("conflict: different figures, or one side negated", () => {
    assert.equal(cmp.conflict("FD rates are around 7.5% for 5 years.", "FD rates are around 7% for 5 years."), "different figures");
    assert.equal(cmp.conflict("Returns are guaranteed.", "Returns are not guaranteed."), "one says the opposite of the other");
    assert.equal(cmp.conflict("Deposits up to ₹5 lakh are insured.", "Deposits up to ₹5 lakh per bank are insured by DICGC."), null);
    // a caveat added to the same statement is an addition, not a contradiction
    assert.equal(cmp.conflict("Debt funds returned about 6.5% a year.", "Debt funds returned about 6.5% a year, but a fund can lose value in a bad year; it is not guaranteed."), null);
    // two unrelated sentences that share one word do not match
    assert.equal(cmp.compare("A liquid fund suits money needed within a year.", "The interest is taxed every year.").agree.length, 0);
    assert.deepEqual(cmp.numbers("₹5,00,000 at 7.5% over 5 years"), [500000, 7.5, 5]);
  });

  test("compare: the example's agreements, disagreements and omissions land where they should", () => {
    const r = cmp.compare(tool.CONFIG.example.values.answerA, tool.CONFIG.example.values.answerB);
    assert.ok(r.agree.some((d) => d.a.includes("insured")), "the insurance sentence is shared");
    assert.ok(r.disagree.some((d) => d.why === "different figures" && d.a.includes("7.5%")), "the FD rate differs");
    assert.ok(r.onlyB.some((s) => s.includes("taxed")), "only B mentions tax");
    assert.ok(r.onlyA.some((s) => s.includes("liquid fund")), "only A mentions a liquid fund");
    assert.ok(r.profileA.recommendations.length >= 1 && r.profileB.recommendations.length >= 1);
    assert.equal(r.profileB.limitations, true);
  });

  test("the comparison: ready from the example, every section present, the focus sets the first line, no leaked value", () => {
    const brief = tool.build(tool.CONFIG.example.values);
    assert.equal(brief.state, "ok");
    for (const h of ["# Two answers compared", "## The question", "## Before you choose", "## In one look", "## Where they disagree", "## Where they agree", "## Only in Answer A", "## Only in Answer B", "## What each recommends", "## What to do next", "## About this comparison"]) assert.ok(brief.markdown.includes(h), h);
    assert.ok(brief.markdown.includes("You are choosing between recommendations"));
    assert.ok(brief.markdown.includes("1. different figures.\n   - Answer A: \"FD rates are currently around 7.5%"));
    assert.ok(!/undefined|\[object|NaN/.test(brief.markdown));
    const same = tool.build({ question: "", focus: "facts", answerA: "The sky is blue on a clear day.", answerB: "The sky is blue on a clear day." });
    assert.ok(same.markdown.includes("No matched statement contradicts the other") && same.markdown.includes("Nothing that the other answer does not also say."));
  });
});

describe("the notes engine and Meeting Notes to Action Plan", () => {
  let notes, tool;
  before(async () => {
    notes = await import("../../assets/js/tools/ai-tools/common/notes-engine.js");
    tool = await import("../../assets/js/tools/meeting-notes-action-plan/index.js");
  });

  test("owners: @name, 'Name to', 'Name will', 'owner:', '(Name)', an attendee's name; never a pronoun or a prefix word", () => {
    assert.equal(notes.ownerOf("@Meera: update the pricing page"), "Meera");
    assert.equal(notes.ownerOf("Priya to send the deck by Friday"), "Priya");
    assert.equal(notes.ownerOf("Rahul will book the venue"), "Rahul");
    assert.equal(notes.ownerOf("Book the venue, owner: Arjun"), "Arjun");
    assert.equal(notes.ownerOf("Book the venue (Rahul)"), "Rahul");
    assert.equal(notes.ownerOf("Marketing needs the press note; ask Meera", ["Priya", "Meera"]), "Meera");
    assert.equal(notes.ownerOf("We will launch on the 20th"), null);
    assert.equal(notes.ownerOf("Decision to drop the feature"), null);
  });

  test("due phrases: weekdays, 'next week', dates, 'before 18 Nov', 'by the 15th'", () => {
    assert.equal(notes.dueOf("send the deck by Friday"), "Friday");
    assert.equal(notes.dueOf("book the venue next week"), null); // no "by": not a deadline
    assert.equal(notes.dueOf("update the pricing page before 18 Nov"), "18 Nov");
    assert.equal(notes.dueOf("confirm the vendor can deliver by the 15th"), null); // "by the 15th" names the vendor's date, not the action's; a plain "by 15th" would
    assert.equal(notes.dueOf("deadline 15/11"), "15/11");
  });

  test("classify: decisions, actions with owner and due, questions, risks, notes", () => {
    assert.equal(notes.classifyLine("Decided: launch on 20 Nov").kind, "decision");
    assert.equal(notes.classifyLine("Agreed to drop the referral feature").kind, "decision");
    assert.deepEqual(notes.classifyLine("Priya to send the revised deck by Friday"), { kind: "action", text: "Send the revised deck", owner: "Priya", due: "Friday" });
    assert.deepEqual(notes.classifyLine("@Meera: update the pricing page before 18 Nov"), { kind: "action", text: "Update the pricing page", owner: "Meera", due: "18 Nov" });
    assert.equal(notes.classifyLine("Is the event budget approved?").kind, "question");
    assert.equal(notes.classifyLine("Risk: the vendor contract is not signed yet").kind, "risk");
    assert.equal(notes.classifyLine("Next meeting Thursday").kind, "note");
  });

  test("the plan: the example yields decisions, owned and flagged actions, questions, risks, the message and nothing invented", () => {
    const brief = tool.build(tool.CONFIG.example.values);
    assert.equal(brief.state, "ok");
    assert.ok(brief.markdown.startsWith("# Action plan: Launch planning (11 Nov 2026)\n\nAttendees: Priya, Rahul, Meera, Arjun"));
    assert.ok(brief.markdown.includes("## Decisions\n\n- The launch date is 20 Nov, no further slip\n- Agreed to drop the referral feature"));
    assert.ok(brief.markdown.includes("[ ] Send the revised deck to the sales team — owner: Priya — due: Friday"));
    assert.ok(brief.markdown.includes("[ ] Book the venue next week — owner: Rahul — no date"));
    assert.ok(brief.markdown.includes("## Open questions\n\n- Is the event budget approved? Finance has not replied"));
    assert.ok(brief.markdown.includes("## Risks and blockers\n\n- The vendor contract is not signed yet"));
    assert.ok(brief.markdown.includes("## Follow-up message to the attendees\n\nHi all,"));
    assert.ok(brief.markdown.includes("- Send the revised deck to the sales team (Priya, by Friday)"));
    assert.ok(brief.markdown.includes("## Other notes (not sorted)\n\n- Marketing wants the press note two days earlier\n- Next meeting Thursday"));
    assert.ok(!/undefined|\[object|NaN/.test(brief.markdown));
    const only = tool.build({ ...tool.CONFIG.example.values, deliver: "message" });
    assert.ok(!only.markdown.includes("# Action plan") && only.markdown.includes("Hi all,"));
    const empty = tool.build({ notes: "Chatted about the weather", attendees: "", meeting: "", date: "", deliver: "plan" });
    assert.ok(empty.markdown.includes("No decision was recorded") && empty.markdown.includes("No action was recorded"));
  });
});

describe("catalog integration", () => {
  test("six published tools in the AI Tools section at /tools/<id>/, related only to each other", () => {
    const ids = ["prompt-builder", "bug-report-prompt", "context-pack-builder", "ai-answer-checklist", "ai-answer-compare", "meeting-notes-action-plan"];
    assert.deepEqual(tax.getToolsBySection("ai-tools").map((t) => t.id), ids);
    for (const id of ids) {
      const t = tools.getToolById(id);
      assert.equal(t.available, true, id);
      assert.equal(t.sitePath, `/tools/${id}/`, id);
      assert.equal(t.toolType, "utility", id);
      assert.ok(t.seo.title.length <= 70 && t.seo.description.length >= 100 && t.seo.description.length <= 240, `${id}: seo lengths ${t.seo.title.length}/${t.seo.description.length}`);
      for (const r of t.relatedTools) assert.ok(ids.includes(r) && r !== id, `${id} -> ${r}`);
    }
  });
});
