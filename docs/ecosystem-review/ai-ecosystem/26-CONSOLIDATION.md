# 26. Three AI products (decision D22, 2026-11-18)

The owner asked for a simpler AI ecosystem: one place to create a prompt, one to check an answer, one to find an AI product. This document records what was built, what was absorbed, what was discontinued, and how the old addresses behave. Decision: `16-DECISION-REGISTER.md` D22. Rule: `docs/product-decision-rules.md` 4.11.

## 1. The three products

| Product | Address | Job | Code |
| --- | --- | --- | --- |
| AI Prompt Builder | `/tools/prompt-builder/` | Describe a task or start from a profession, answer a few questions, get a main prompt, stage prompts and refinement prompts; write a project context pack | `assets/js/tools/prompt-builder/` (the former `ai-workbench/` folder), `assets/css/tools/prompt-builder.css` |
| AI Answer Checker | `/tools/ai-answer-checker/` | Review one AI answer against what was asked, or compare two answers to the same question | `assets/js/tools/ai-answer-checker/` (`index.js`, `review.js`, `compare.js`), styles in `assets/css/tools/ai-tools.css` |
| AI Directory | `/ai-tools/directory/` | Find an AI product (49 products, 14 categories), each checked on its official site | `assets/js/data/ai-directory.js`, `assets/js/pages/directory/directory-html.js`, `src/ai-directory.njk` (unchanged except its links into the Prompt Builder) |

The section sidebar groups them as "Create a prompt", "Check an answer" and "Find an AI product" (`components/section-switcher.js`); the home card and the AI Tools page lead with the AI Prompt Builder; the AI Tools page's start block links into both tools (rule 4.11 (a)).

**The central product keeps the id `prompt-builder`.** The AI Workbench's code moved into `assets/js/tools/prompt-builder/` and replaced the old standalone Prompt Builder's single module, so the product's name and address agree (`/tools/prompt-builder/`), the identity ledger records the same module path, and the AI Workbench's id is retired. Internal names (`wb-` element ids and classes, "Work Pack") are unchanged.

## 2. What was absorbed, and where

| Retired product | Now | What survives | What is discontinued |
| --- | --- | --- | --- |
| AI Workbench | The AI Prompt Builder itself | Everything: 22 professions, the task taxonomy (now 90 tasks), methods, strategies, detail levels, concise prompts, tools, playbooks, Work Pack files | Nothing |
| AI Prompt Builder (standalone, general) | Task "Any other task: one well-built prompt" (outcome "Something else"), `blueprints/general.js` | The fields (goal, role, reader, background, material, rules, format, tone, example, success criteria, what to do when unclear) and the eight kinds of task with their suggested rules and checks (used only when the visitor wrote none) | The clarity score of the old brief page (the Prompt Builder's own prompt check covers the labelled tasks; the general prompt has no profession method) |
| Bug Report to Debugging Prompt | Task "Debug a problem or a bug report" (`blueprints/software.js`) | Observed, expected, steps, frequency, environment, error output, where to look first, what must not change, size of the fix, how the fix is proven; reproduce first, root cause before code, report what was and was not verified | The fixed "Debugging task" document layout (the prompt now follows the shared prompt structure) |
| AI Context Bridge | The project context pack inside the Prompt Builder (`context.js`, loaded the first time its section is opened) | All four forms, every field, the extraction prompt, opening a saved pack with versions, the notes; "Use this pack in my prompt" puts it in the prompt's project context | Its own page and its "How to use it" sections (the key answers are in the Prompt Builder's FAQ) |
| AI Output Reviewer | AI Answer Checker, Review one answer (`review.js`) | The whole review (engine unchanged), the follow-up prompt, the hand-off from the Prompt Builder | Nothing |
| Compare Two AI Answers | AI Answer Checker, Compare two answers (`compare.js`) | The whole comparison (engine unchanged) | Nothing |
| Meeting Notes to Action Plan | Task "A meeting follow-up: decisions, actions and a message" (`blueprints/business.js`) | Decisions, actions with owners and dates (never assigned by the AI, gaps marked), open questions, risks and the follow-up message, now written by the visitor's AI from a prompt | **The rule-based sorting in the browser** (`notes-engine.js`, removed): the page no longer sorts notes itself; the visitor's AI does, under the prompt's rules |
| QA Requirement-to-Release Workbench | Tasks "Review requirements and acceptance criteria", "A release readiness assessment", "A QA test summary report", with the existing test plan, test cases, API tests, automation, regression, defect and performance tasks | Prompts for every QA activity the Workbench supported, with its rules (planned, executed and passed kept apart; nothing reported as run; readiness is the decision owner's) | **The QA project records**: requirements, acceptance criteria, test cases, their mapping, test runs and defects kept in one project; deterministic coverage counts; the QA report built from recorded results; the project file. None of this was moved: there is no replacement record keeping (no database or storage was added). A visitor who needs it uses their test management tool and asks the Prompt Builder for the prompts. |

## 3. The AI Prompt Builder's conversation

**Replaced on 2026-11-19 (D23):** the conversation below was the D22 design. The AI Prompt Builder now asks one question at a time, role first, with a trail of answers; the current design is `23-GUIDED-PANEL.md`. This section is kept as the record of D22.

1. **First screen.** "What would you like to create today?" with "Tell us what you want to accomplish. We'll help you build a professional prompt for your AI assistant." A box takes the task in the visitor's own words (Enter sends, Shift and Enter is a new line); below it, eight suggested professions, every one of the 22 under "All 22 professions, by area", and a search through all of them. "Other ways to start" opens the full page (outcomes, playbooks, a saved Work Pack, the project context pack).
2. **A description** is matched to the tasks by fixed synonyms (`task-index.js`, deterministic, in the browser). A confident match is offered first; otherwise the closest three are offered as equals; "Something else: one well-built prompt for this" is always offered; the AI Answer Checker, the context pack or the AI Directory are linked when the words name their job. The chosen task's first open question receives the description, which the visitor can edit. No AI reads the description and the page never says it does.
3. **A profession** lists its tasks, with "Any other task" last.
4. **The questions** of the task, one essential question or choice per step, the rest together in one optional step; then the visitor's tools, the visitor and their project (with the project context pack), the AI product and the prompt. Every answer stays visible above the current question with its own Change button ("Your answers so far"); Back, Continue or Skip, Clear this step and Start over remain. Links with `?task=` or `?role=` start the conversation at that task or profession; `?outcome=`, `?start=describe` and `?start=context` open the full page.
5. **The result.** The three kinds of prompt are named at the top in plain words: the main prompt (the complete instructions), stage prompts (one step of the work at a time) and refinement prompts (to improve an answer). The existing controls stay: prompt detail (Standard, Detailed, Very detailed), the full or concise version, another approach and a chosen approach, refinements, editing before copying, Copy and Copy one section, Copy the whole pack, Download .md, and Check the answer with the AI Answer Checker. Depth is labelled Quick, Standard, Detailed and Multi-stage ("Quick" was "Short").

The wording "master prompt" became "main prompt" everywhere in the product and its prompts.

## 4. Addresses and search

Seven retired addresses are kept as redirects (`assets/js/data/retired-tools.js`; a page built by `src/retired-tools.njk` with the new canonical, `noindex`, a meta refresh and a script that keeps the visitor's query when the target has none; a `RedirectMatch 301` per address in the production `.htaccess`). No redirect goes to the home page, none chains to another retired address, and none is in the sitemap.

| Old address | Goes to |
| --- | --- |
| `/tools/ai-workbench/` | `/tools/prompt-builder/` (with the visitor's own query, so `?outcome=video` still works) |
| `/tools/bug-report-prompt/` | `/tools/prompt-builder/?task=debug` |
| `/tools/context-pack-builder/` | `/tools/prompt-builder/?start=context` |
| `/tools/meeting-notes-action-plan/` | `/tools/prompt-builder/?task=meeting-follow-up` |
| `/tools/qa-workbench/` | `/tools/prompt-builder/?role=qa` |
| `/tools/ai-answer-checklist/` | `/tools/ai-answer-checker/` |
| `/tools/ai-answer-compare/` | `/tools/ai-answer-checker/?mode=compare` |

The retired ids are retired in `scripts/growth-manifest/identity-ledger.json` (state `retired`, with the reason) and `ai-answer-checker` is recorded as added. The two tools carry the true names of the tools they absorbed as search aliases (the Prompt Builder: prompt builder, AI workbench, debugging prompt, context pack, context bridge and others; the Checker: AI output reviewer, compare AI answers and others), within the search index's per-entry size limit.

## 5. Shared engines after the change

| Module | Used by |
| --- | --- |
| `ai-tools/common/brief-tool.js` (now also exports the page's parts: `body()` and `info()`) | Answer Checker (both modes), the context pack |
| `ai-tools/common/brief-engine.js` | brief-tool, claim, compare, review and context engines |
| `ai-tools/common/review-engine.js`, `claim-engine.js`, `compare-engine.js` | Answer Checker |
| `ai-tools/common/context-engine.js` | the context pack |
| `ai-tools/common/pack-format.js` | Prompt Builder (Work Pack files), context pack, review engine |
| `ai-tools/common/handoff.js` | one kind left: the Prompt Builder's prompt to the Answer Checker |
| removed: `ai-tools/common/notes-engine.js`, the folders `bug-report-prompt/`, `meeting-notes-action-plan/`, `qa-workbench/` and `assets/css/tools/qa-workbench.css` | nothing (checked: no remaining import) |

The two prompt engines remain distinct by purpose: the Prompt Builder compiles prompts (`compiler.js`, `method.js`); the brief engine composes the context pack and the checker's reports. The old general Prompt Builder's composition moved into a Prompt Builder task, so prompts now come from one engine.

## 6. Known limits

- A description is matched by fixed words; an unusual wording may match nothing or several tasks, and the visitor then chooses or writes a general prompt. The healthcare-API example of the owner's brief offers API tests first but not as a confident match, because API design shares the word "endpoint".
- The general prompt has no profession method, so it has no prompt-detail levels or strategies; the visitor's own role, rules and criteria shape it.
- The QA project record keeping and the rule-based meeting-notes sorting are discontinued (section 2).
- The professional tool catalogue still has 12 of 76 entries checked against official documentation; the others stay unverified catalogue descriptions (`20-ROLES-TASKS-TOOLS.md`).
- External validation of the prompts in real AI products is still the owner's to run (`25-BENCHMARK-JOURNEYS.md` §4–5).

## 7. Testing evidence

Recorded in the phase report of 2026-11-18 and summarised here when the phase closes.
