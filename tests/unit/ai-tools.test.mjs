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

describe("catalog integration", () => {
  test("four published tools in the AI Tools section at /tools/<id>/, related only to each other", () => {
    const ids = ["prompt-builder", "bug-report-prompt", "context-pack-builder", "ai-answer-checklist"];
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
