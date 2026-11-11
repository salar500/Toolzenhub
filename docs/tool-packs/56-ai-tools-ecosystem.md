# Tool Pack 56: AI Tools, the seventh ecosystem (first department)

Status: built      Base commit: ffa25d6      Section `ai-tools` (landing `/ai-tools.html`); tools `prompt-builder`, `bug-report-prompt`, `context-pack-builder` (routes `/tools/<id>/`)

Owner instruction, 2026-11-11 (the master transformation brief): create a dedicated seventh ecosystem for people who already use ChatGPT, Claude, Gemini and other assistants, with browser-based utilities that produce reusable outputs for those assistants, and no AI account, API key, paid API or cloud AI service. The brief names seven candidate departments; this pack builds the first, "Idea to Prompt Studio" together with the first tool of "AI Coding Companion" and the first of "AI Context and Knowledge Preparation", because those three share one engine and solve the three most frequent problems in the brief: thinking of what to ask, describing a bug so the assistant can fix it, and explaining a project again in every chat.

## 1. Tool identity

| id | Title | Section | Type | One sentence |
| --- | --- | --- | --- | --- |
| `prompt-builder` | AI Prompt Builder | ai-tools (no category) | utility | A rough idea becomes a complete prompt: task, role, audience, context, material, rules, format, example, success criteria, and what to do when unclear. |
| `bug-report-prompt` | Bug Report to Debugging Prompt | ai-tools | utility | What happened, what should happen, steps, environment and error output become a debugging task with the rules of a safe fix. |
| `context-pack-builder` | Project Context Pack Builder | ai-tools | utility | Purpose, stack, key files, completed work, traps, rules, next task and verification, written once and pasted into every chat. |

Aliases are in the catalog and are true names (prompt builder, debugging prompt, context pack, project instructions for AI, and so on).

## 2. User problem

People use assistants daily and get weak answers because the request was vague: no deliverable named, no context, no rules, no criteria. Developers paste "it doesn't work" and get a guess. Anyone working on a project over several chats explains it again every time. Today they write prompts from memory, copy templates from blogs, or give up and accept a mediocre answer.

## 3. Primary jobs

- "I know roughly what I want; turn it into a prompt that gets it."
- "Make this bug something my coding assistant can actually fix, without it breaking other things."
- "Let me describe my project once and reuse it."
- "Tell me what my prompt is missing before I send it."

## 4. Target users

Anyone who uses an assistant for work or study; developers using Claude Code, Copilot, Cursor or ChatGPT. Not for: people who want the site to answer the question itself (there is no model here), or who want prompt libraries to browse (not in v1).

## 5. Inputs

Each tool is a guided form. Essentials are marked "(essential)"; every other field is optional and its heading is left out of the brief when empty. Fields, hints and placeholders are in each tool's `CONFIG.fields`. Long answers are textareas (4,000 characters), short ones text inputs (200), choices selects. Nothing is stored; a Load example button fills a realistic example.

## 6. Outputs

One Markdown brief in an editable text area, written as the visitor types, with a clarity check above it: which essentials are missing, which answers look vague ("etc", "and so on", a very short essential), a completeness score (20 off per missing essential, 5 per warning) stated as a check of the brief and not of the answer, and the word count when ready. Actions: Copy, Download .md, Reset. A line says where to paste it. Deliberately not shown: any "generated answer"; the site calls no model.

## 7. Model rules

`ai-tools/common/brief-engine.js` is pure: `tidy`, `lines` (list markers stripped), `bullets`, `numbered`, `fenced` (a longer fence when the text contains one), `section` (nothing for an empty body), `document`, `clarityCheck`, `buildBrief`. Each tool's `compose(values)` is pure and deterministic over tidied values. Verified by `tests/unit/ai-tools.test.mjs` (helper behaviour, check arithmetic, each example composing a ready brief with no leaked value, section order, the page's labels and hint links, catalog integration).

## 8. Assumptions

Shown on each page: built in the browser, no AI service called, nothing stored; the score is about the brief, not the answer; the visitor decides where to paste and should remove secrets from logs first.

## 9. Edge cases

Empty form: "Fill in the form…" and no brief. Only optional fields filled: "incomplete", the brief still shown so it takes shape. A fence inside error output: wrapped in a longer fence. List markers typed by the visitor: stripped and re-rendered. Clipboard refused: the text is selected and a status says to press Ctrl+C or Cmd+C.

## 10. Validation

There are no invalid values, only missing essentials and vague answers; both are told in words in the check panel and announced in a polite live region. Lengths are capped by `maxlength`.

## 11. UX flow

Intro, trust card, guided form (example and reset), the brief with its check and actions, how to use it, what the brief contains and why, using it with an assistant, FAQ. Everything updates live; the only actions are copy, download, example and reset. The shared tool page adds the breadcrumb, the section sidebar and the related tools (the other two). From 1200 px the form and the brief sit side by side through the shared calculator layout (`.calculator-section` followed by `.calculator-results`).

## 12. Result hierarchy

First the check line (ready or what is missing), then the brief, then the actions and the paste instruction.

## 13 to 16. Comparison, chart, export, print

Table and chart: NOT NEEDED (text). Export: Download .md (the brief is kept and reused). Print: NOT NEEDED.

## 17. Mobile

One column; textareas full width and resizable; the brief 260 px tall minimum; buttons wrap; 44 px targets from the shared button styles; no horizontal overflow (long tokens wrap with `overflow-wrap: anywhere`).

## 18. Accessibility

Every control has a label and a linked hint; essentials are named in the label text; the check is text, with a coloured left border as a second cue only; a polite live region announces readiness, copies and downloads; focus returns to the first field on Reset; the output text area has a visible focus ring; reduced motion is unaffected (nothing animates).

## 19. Search

Aliases in the catalog; the queries "prompt builder", "debugging prompt", "context pack", "chatgpt prompt", "claude md" find the tools.

## 20. Related tools

Each tool lists the other two (rule 4.2: inside the section). `autoRelated` is default: the section has no category, so automatic lists stay within it.

## 21. Articles

Built 2026-11-11 (Batch 4): article category `ai` ("AI"), and three guides, one per built tool, each answering one question: writing instructions an assistant can act on (Prompt Builder), giving an assistant a project's context (Context Pack Builder), reading an AI answer before trusting it (Evidence Checklist). Text only (method, nothing to chart); each links the other two. The brief's other five follow their tools.

## 22. Imagery

None. The section card uses the shared `spark` icon.

## 23. SEO

Catalog `seo.title` (under 70 characters) and `seo.description` (100 to 240), self-canonical through the shared tool page, one h1, the section page generated from `seoDescription`, breadcrumb structured data as for every tool.

## 24. Performance

Engine + page scaffold + one tool: about 6 kB gzipped of JavaScript, one 2 kB stylesheet; nothing loads on other pages; no dependency.

## 25. Tests

Unit: `tests/unit/ai-tools.test.mjs`; `sections.test.mjs` (seven sections, the section's tools and route); `section-groups.test.mjs` (the sidebar group). Browser: `tests/browser/ai-tools.spec.js` (each tool: blank state, example to ready, live update, missing-essential wording, copy enabled, mobile overflow, the section page and the home card). Inventory regenerated; links, assets, SEO checks on both builds.

## 26. Quality gate

Met: labels and hints, errors in words, live region, keyboard, no colour-only meaning, no storage, no network, both builds clean, static checks, unit and focused browser tests. NOT NEEDED: golden numeric values (no arithmetic), visual baselines for the new pages (added when the section's look is reviewed on the preview).

## 27. Deferred

The other candidate departments and tools (prompt improver and comparison, two-answer comparison, evidence checklist, meeting notes to action plan, workflow planner, skill-gap assessment, and the rest): each needs its own validation against real use and a distinct engine; none is a text template of these three. AI articles (section 21). A prompt template library (would need curation rules first).

## 28. Commit checkpoint

`feat(ai-tools): the seventh ecosystem with three brief builders`, then: unit (the five files above), `npm run build:all`, `npm run inventory:generate` and review, `npm run test:static`, `ai-tools.spec` on desktop and mobile, `home-brand.spec`, `section-switcher.spec` on one AI tool, and a look at the three pages, the section page and the home card at 390 and 1280 px.

## Implementation notes

- **Fourth tool, second department (AI Output Verification): AI Answer Evidence Checklist** (`ai-answer-checklist`, `/tools/ai-answer-checklist/`). Paste an answer; the claim engine (`ai-tools/common/claim-engine.js`, pure) splits it into sentences (code blocks, headings, list markers and emphasis stripped) and classifies each: money, percentage, date, other figure, names a source, absolute wording (always, never, guaranteed, the only…), hedged wording. The checklist lists each checkable statement with a box, its kind and how to check it, then what the answer leaves out (no source, no assumption, no date for figures, no limitation), the questions to put back to the assistant, and a first line that depends on what the answer is for (learning, a money/legal/health decision, code to run, something to publish). It is word patterns and says so on the page; it never claims to judge correctness (rulebook 4.11). Same shared page; the paste line is tool-specific (`config.pasteLine`). The briefs' related lists gain it by section fallback; its own list is curated (Prompt Builder, Context Pack) then the section.

- The brief is composed while essentials are missing (state "incomplete") rather than withheld, so the visitor sees it take shape; the check says it is not ready.
- The hero's one sentence gained "and AI" in its list of tool kinds (home copy otherwise unchanged; the card appears from the catalog).
