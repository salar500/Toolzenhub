/**
 * AI Tools (the seventh section, 2026-11-11; three products since D22, 2026-11-18): the brief engine, the brief pages
 * that remain (the AI Answer Checker's two modes and the Prompt Builder's project context pack), the claim and
 * comparison engines, and the section's place in the catalog, with the retired addresses.
 * Everything is pure text in the browser: no AI service, no storage. These tests pin the composed Markdown's shape, the
 * clarity check's arithmetic and the catalog integration (section, URLs, related lists kept inside the section).
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };

let engine, pack, review, compare, checker, tools, tax, retired;
before(async () => {
  engine = await import("../../assets/js/tools/ai-tools/common/brief-engine.js");
  pack = await import("../../assets/js/tools/prompt-builder/context.js");
  review = await import("../../assets/js/tools/ai-answer-checker/review.js");
  compare = await import("../../assets/js/tools/ai-answer-checker/compare.js");
  checker = await import("../../assets/js/tools/ai-answer-checker/index.js");
  tools = await import("../../assets/js/data/tools.js");
  tax = await import("../../assets/js/data/taxonomy.js");
  retired = await import("../../assets/js/data/retired-tools.js");
});

/* the brief configs still drawn by the shared brief page: { CONFIG, build } */
const BRIEFS = () => [
  { CONFIG: pack.CONFIG, build: pack.build },
  { CONFIG: review.CONFIG, build: review.tool.build },
  { CONFIG: compare.CONFIG, build: compare.tool.build }
];

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

describe("the brief pages", () => {
  test("each config's example composes a ready brief with no leaked value, and a blank form is empty", () => {
    for (const t of BRIEFS()) {
      const brief = t.build(t.CONFIG.example.values);
      assert.equal(brief.state, "ok", t.CONFIG.prefix);
      assert.ok(!/undefined|\[object|null/.test(brief.markdown), `${t.CONFIG.prefix}: leaked value`);
      const blank = t.build(Object.fromEntries(t.CONFIG.fields.map((f) => [f.key, ""])));
      assert.equal(blank.state, "empty", t.CONFIG.prefix);
      assert.equal(blank.markdown, "");
    }
    /* the context pack's example also passes its own clarity check, and it is a real pack */
    const ctx = pack.build(pack.CONFIG.example.values);
    assert.deepEqual(ctx.check.warnings, []);
    assert.ok(ctx.words > 80, `${ctx.words} words`);
  });

  test("every field has a key, a label and a hint; selects have options; no key collides with the page's own ids", () => {
    for (const t of BRIEFS()) {
      const keys = t.CONFIG.fields.map((f) => f.key);
      assert.equal(new Set(keys).size, keys.length, t.CONFIG.prefix);
      for (const f of t.CONFIG.fields) {
        assert.ok(f.label && f.hint, `${t.CONFIG.prefix} ${f.key}`);
        if (f.kind === "select") assert.ok(f.options.length >= 2 && f.options.every((o) => o.label), `${t.CONFIG.prefix} ${f.key}`);
        assert.ok(!["output", "load-example", "copy", "download", "reset", "check", "live", "form", "use"].includes(f.key), `${t.CONFIG.prefix}: ${f.key}`);
      }
      assert.ok(t.CONFIG.fields.some((f) => f.required), t.CONFIG.prefix);
    }
  });

  test("context pack: titled by the project, the sections keep their order, the reply instruction closes it", () => {
    const brief = pack.build(pack.CONFIG.example.values);
    assert.ok(brief.markdown.startsWith("# Project context: ToolZen Hub\n\n## Purpose"));
    const order = ["## Purpose", "## How it is built", "## Current state", "## Key files and folders", "## Completed work, do not redo", "## Known issues and traps", "## Rules and conventions"];
    let last = -1;
    for (const h of order) { const i = brief.markdown.indexOf(h); assert.ok(i > last, h); last = i; }
    assert.ok(brief.markdown.includes("- Static site built with Eleventy 3"));
    /* part of the Prompt Builder now: it is mounted into the page, not a page of its own */
    assert.equal(typeof pack.mountContext, "function");
    assert.equal(pack.markup, undefined);
    assert.equal(pack.CONFIG.jump, false);
  });

  test("the AI Answer Checker page: one h1, two modes as native radios, both forms labelled with their hints, review first", () => {
    const html = checker.markup();
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /<h1>AI Answer Checker<\/h1>/);
    assert.equal((html.match(/type="radio" name="chk-mode"/g) || []).length, 2);
    assert.match(html, /value="review" checked/);
    assert.match(html, /<span class="chk-mode__title">Review one answer<\/span>/);
    assert.match(html, /<span class="chk-mode__title">Compare two answers<\/span>/);
    assert.match(html, /id="chk-panel-compare" data-mode="compare" hidden/);
    for (const t of [review, compare]) {
      const prefix = t.CONFIG.prefix;
      for (const f of t.CONFIG.fields) {
        assert.ok(html.includes(`for="${prefix}-${f.key}"`), `${prefix}: label for ${f.key}`);
        assert.ok(html.includes(`aria-describedby="${prefix}-${f.key}-hint"`), `${prefix}: hint of ${f.key}`);
      }
      assert.ok(html.includes(`<textarea id="${prefix}-output"`) && html.includes(`id="${prefix}-copy"`) && html.includes(`id="${prefix}-download"`), prefix);
      assert.ok(html.includes(`<p id="${prefix}-live" class="ai-sr-only" role="status"`), prefix);
    }
    /* the limits are said on the page, and nothing is called */
    assert.match(html, /never decide whether an answer is true/);
    assert.doesNotMatch(html, /fetch\(|api\.openai|anthropic\.com\/v1|generativelanguage/);
    assert.equal(checker.showRelatedArticles, false);
    assert.equal(checker.showRelatedCalculators, true);
  });
});

describe("the claim engine and the evidence checklist", () => {
  let claims, checker;
  before(async () => {
    claims = await import("../../assets/js/tools/ai-tools/common/claim-engine.js");
    checker = (await import("../../assets/js/tools/ai-answer-checker/review.js"));
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
    const brief = checker.tool.build(checker.CONFIG.example.values);
    assert.equal(brief.state, "ok");
    assert.ok(brief.markdown.startsWith("# Evidence checklist for an AI answer\n\n## The question asked"));
    assert.ok(brief.markdown.includes("feeds a decision with money, legal or health consequences"));
    assert.ok(brief.markdown.includes("1. [ ] \""));
    assert.ok(brief.markdown.includes('absolute: "never guaranteed"') || brief.markdown.includes('absolute: "never"'));
    assert.ok(brief.markdown.includes("## Questions to put back to the assistant"));
    assert.ok(brief.markdown.includes("Give one exception to each absolute statement"));
    assert.ok(!/undefined|\[object/.test(brief.markdown));
    const general = checker.tool.build({ answer: "It depends on what you need and how you work.", question: "", purpose: "code" });
    assert.ok(general.markdown.includes("No figures, dates, sources or absolute statements were found"));
    assert.ok(general.markdown.includes("Run it in a safe place first"));
  });
});

describe("the comparison engine and Compare Two AI Answers", () => {
  let cmp, tool;
  before(async () => {
    cmp = await import("../../assets/js/tools/ai-tools/common/compare-engine.js");
    tool = await import("../../assets/js/tools/ai-answer-checker/compare.js");
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
    const brief = tool.tool.build(tool.CONFIG.example.values);
    assert.equal(brief.state, "ok");
    for (const h of ["# Two answers compared", "## The question", "## Before you choose", "## In one look", "## Where they disagree", "## Where they agree", "## Only in Answer A", "## Only in Answer B", "## What each recommends", "## What to do next", "## About this comparison"]) assert.ok(brief.markdown.includes(h), h);
    assert.ok(brief.markdown.includes("You are choosing between recommendations"));
    assert.ok(brief.markdown.includes("1. different figures.\n   - Answer A: \"FD rates are currently around 7.5%"));
    assert.ok(!/undefined|\[object|NaN/.test(brief.markdown));
    const same = tool.tool.build({ question: "", focus: "facts", answerA: "The sky is blue on a clear day.", answerB: "The sky is blue on a clear day." });
    assert.ok(same.markdown.includes("No matched statement contradicts the other") && same.markdown.includes("Nothing that the other answer does not also say."));
  });
});

describe("catalog integration", () => {
  test("two published tools in the AI Tools section at /tools/<id>/, related only to each other", () => {
    /* D22: the AI Prompt Builder leads, the AI Answer Checker follows; the AI Directory is the section's third product (a page) */
    const ids = ["prompt-builder", "ai-answer-checker"];
    assert.deepEqual(tax.getToolsBySection("ai-tools").map((t) => t.id), ids);
    for (const id of ids) {
      const t = tools.getToolById(id);
      assert.equal(t.available, true, id);
      assert.equal(t.sitePath, `/tools/${id}/`, id);
      assert.equal(t.toolType, "utility", id);
      assert.ok(t.seo.title.length <= 70 && t.seo.description.length >= 100 && t.seo.description.length <= 240, `${id}: seo lengths ${t.seo.title.length}/${t.seo.description.length}`);
      for (const r of t.relatedTools) assert.ok(ids.includes(r) && r !== id, `${id} -> ${r}`);
    }
    assert.equal(tools.getToolById("prompt-builder").title, "AI Prompt Builder");
    assert.equal(tools.getToolById("ai-answer-checker").title, "AI Answer Checker");
  });

  test("the retired addresses: none is a catalog tool, each goes to a surviving product, no chain and no loop", () => {
    const ids = retired.RETIRED_TOOLS.map((r) => r.id);
    assert.deepEqual([...ids].sort(), ["ai-answer-checklist", "ai-answer-compare", "ai-workbench", "bug-report-prompt", "context-pack-builder", "meeting-notes-action-plan", "qa-workbench"]);
    for (const r of retired.RETIRED_TOOLS) {
      assert.equal(tools.getToolById(r.id), undefined, `${r.id} is still in the catalog`);
      assert.ok(["prompt-builder", "ai-answer-checker"].includes(r.to), r.id);
      assert.ok(!ids.includes(r.to), `${r.id} -> ${r.to} would chain`);
      assert.match(r.query, /^(\?[a-z]+=[a-z0-9-]+)?$/, r.id);
      assert.ok(r.title && r.now.length > 20, r.id);
    }
  });
});
