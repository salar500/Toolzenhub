# 17. Final design (design freeze)

This is the build specification for Phase 2. It supersedes `06` to `15` where they differ (see `16`). **Reconciled on 2026-11-17** with what was built and verified: the six recorded deviations (`19` §5) are folded into the text below, so this document now describes the final product exactly. Sections 12-17 (journeys, matcher, playbooks, architecture, performance, the two renamed tools) were added in the same review so that no behaviour is left for development-time invention. Visual design uses only the existing layer: `variables.css` tokens (`--space-*`, `--font-*`, `--fw-*`, `--radius-*`, `--surface-*`, `--ink*`, `--line*`, `--state-*`, `--eco-ai-tools*`, `--focus-ring`, `--target-size`), the shared button and form classes (`calculator-form__button`, `--secondary`, `calculator-form__input`, `calculator-form__group`), `ai-tools.css`, `ai-workbench.css`, `directory.css`. No new colour, font or token. Dark theme comes from `:root[data-theme="dark"]` tokens; every new rule uses tokens only, so both themes work without theme-specific CSS.

## 1. Target users (final)

People who use AI products at least weekly for work or study: software developers and QA professionals; content, image, video and audio creators; researchers, students and analysts; business users; and everyday users who struggle to describe what they need. Role and experience adapt one shared system (`taxonomy.js` `ROLES`, `EXPERIENCE`); there are no profession pages.

## 2. Positioning and scope (final)

"AI Tools: prepare, carry and check your AI work, for whichever AI you use." Core: Workbench (prepare), Context Bridge (carry), Output Reviewer (check), file-based reuse and playbook starters (reuse). Supporting: AI Home start block, Directory links into the Workbench, Compare Two AI Answers, Prompt Builder, Bug Report, Meeting Notes. Future: opt-in saving, Directory task/input/output fields, Prompt check, three-answer comparison. Excluded: `16` D16.

## 3. Information architecture (final)

Routes unchanged: `/ai-tools.html`, `/tools/ai-workbench/`, `/tools/context-pack-builder/` (AI Context Bridge), `/tools/ai-answer-checklist/` (AI Output Reviewer), `/tools/ai-answer-compare/`, `/tools/prompt-builder/`, `/tools/bug-report-prompt/`, `/tools/meeting-notes-action-plan/`, `/ai-tools/directory/`. Query parameters (fixed values only): Workbench `start=describe`, `outcome=<id>`, `task=<id>`, `product=<directory id>`; Context Bridge `mode=<brief|handoff|session|agent>`. Sidebar groups per D7. No header item, no new section.

## 4. AI Home (`/ai-tools.html`)

Order: breadcrumb; intro (eyebrow "Section", h1 "AI Tools", description); **Start block**; h2 "AI Tools tools" and the cards (existing); "← All tools".

Start block markup (`aiHomeStartHtml()` in `pages/directory/directory-html.js`, rendered only for `ai-tools`):

```
<section class="ai-start" aria-labelledby="ai-start-title">
  <h2 id="ai-start-title">What do you want to do with AI?</h2>
  <p>Prepare the work, carry your project between AI products, and check what comes back. Everything runs in your browser; no AI service is called.</p>
  <a class="calculator-form__button ai-start__primary" href="/tools/ai-workbench/?start=describe">Describe your task</a>
  <p class="ai-start__hint">Type it in your own words; the Workbench shows the closest tasks for you to choose from.</p>
  <h3>Or choose an outcome</h3>  <ul class="ai-start__chips"> 8 links (?outcome=) </ul>
  <h3>Common starts</h3>  <ul class="ai-start__chips"> 6 links </ul>
</section>
```

Common starts: "A test plan" (`?task=test-plan`), "An article" (`?task=article`), "Debug a problem" (`?task=debug`), "Continue a project in another AI" (Context Bridge `?mode=handoff`), "Check an AI answer" (Output Reviewer), "Write or reply to an email" (`?task=email-message`). There is no Directory link in the block: an owner decision of 2026-11-16 (pinned in `tests/unit/ai-directory.test.mjs`) allows the AI Tools page to link the Directory only by its card and sidebar entry. Outcome links use the `OUTCOMES` titles except "unsure". All links are built with `ROUTES` so they carry the preview base path.

Layout: the block is a card (`--surface-card`, `--line` border, `--radius-lg`, padding `--space-6`, max width `--width-wide`), placed in the content column. Chips: `display:flex; flex-wrap:wrap; gap: --space-2`; each chip a link styled as a pill (`--radius-full`, `--line-control` border, min-height `--target-size`, padding `0 --space-4`, `--font-sm`). Primary link uses the primary button class. Phone (< 600 px): primary link full width; chips wrap; padding `--space-4`. States: static; no empty or error states. Accessibility: one h2, two h3, lists of links; focus ring from the shared layer.

Section catalog text (catalog-driven, rule 4.5): `description` "Prepare your AI work, carry your project between AI products and check what comes back: the AI Prompt Builder (with project context packs), the AI Answer Checker and a directory of AI products. Nothing is sent to any AI service." (rewritten for the three products of D22, 2026-11-19); `summary` "Prepare, carry and check your work with ChatGPT, Claude, Gemini and other AI products"; `seoDescription` accordingly (under 240 characters).

## 5. AI Workbench (`/tools/ai-workbench/`)

### 5.1 Page structure (top to bottom)
1. Intro and trust card (existing).
2. Progress list: Outcome, Task, Details, Work Pack (existing).
3. **Start panel** (new, always visible at the top of the form, a `wb-start` group):
   - Describe: label "Describe what you want to do", hint "In your own words, for example \"test plan for a coupon feature\" or \"animate a product photo\".", text input (maxlength 300), button "Find matching tasks" (secondary). Results region `wb-matches` (a list of task buttons "Use this task", each with outcome and task title).
   - `details` "Start from a playbook": the ten starters as a list; each starter has a title, one line of purpose, and one button per step ("Step 1: A test plan").
   - `details` "Open a saved Work Pack": file input (`.md,.txt`, label "Choose a Work Pack file") and a textarea "Or paste the file's text" with button "Open this pack".
4. Outcome fieldset (existing, 9 choices; "I'm not sure" focuses the describe input and says "Describe it above; the Workbench suggests tasks.").
5. Task fieldset (existing).
6. Details: questions (existing, with `more` disclosure); **consistency sheet** `details` "Keep the same across every output (optional)" for image, video and audio tasks; "Your context (optional)" with role, experience, depth and **Project context** (brief-style tasks only; textarea 8,000; hint "Paste a context pack from the AI Context Bridge, or notes the AI should know.").
7. AI product (existing; `?product` preselects).
8. Actions: "Show my Work Pack" (primary), "Start again" (secondary).
9. Results card: the Work Pack (5.3).
10. How it works, What a Work Pack contains, FAQ (existing, updated wording for files and hand-offs).

### 5.2 Interactions and states

| Event | Result |
| --- | --- |
| Page opens, no query | step 1; pack area "Choose what you want to accomplish, or describe it above. Your Work Pack appears here as you answer." |
| `?start=describe` | describe input focused (no scroll jump beyond it) |
| `?outcome=x` | outcome checked, task list shown, step 2 |
| `?task=x` | outcome and task chosen, questions loaded, focus on the Details heading, step 3 |
| Unknown id in a query | ignored; note under the start panel: "That link named a task that is not offered. Choose what you want to accomplish." |
| Find matching tasks, empty text | note "Type a few words first." |
| Matches found (confident) | heading "Best match:" and one card, then "Other possible tasks:" up to two; status "N tasks match. Choose one." |
| Matches found (ambiguous) | "Several could fit. Choose one:" up to three cards |
| No match | "No close match. Choose what you want to accomplish below, or write one prompt for anything with the AI Prompt Builder." (link) |
| Use this task | outcome and task chosen as if clicked; focus to the Details heading |
| Playbook step | task chosen; the step's answers and depth filled into empty fields only; note "Filled from the playbook \"<title>\". Edit anything." |
| Open a pack (valid) | outcome, task, answers, role, experience, depth, product, project context, consistency restored; note "Opened \"<task>\", version N of <date>." and a list of ignored fields if any |
| Open a pack (invalid) | error in words beside the control: "This is not a Work Pack file." / "This pack is for a task that is no longer offered: <id>." / "The file is larger than 200 kB." Focus stays; nothing else changes |
| Answer typed | pack recomposed after 150 ms; one announcement per state change. The pack's markup is replaced only when its Markdown or the view changed (a signature of both), so a change event fired on blur never redraws the pack under a pointer that is clicking a button in it |
| Utility words in the description ("bug report", "meeting notes", "compare answers", "which AI") | the matching utility tools are listed under the task matches, under "Another AI tool may fit", as links |
| Context hand-off present on load | project context filled; note "Project context brought from the AI Context Bridge. Choose a task; it is used in the master prompt." |
| `?product=` for a task that does not list it | note "<name> is not listed for this task in the AI Directory. You can still use it: it is set as your own AI product." |
| Essential left empty | "Almost ready. Missing: X. It is marked [add: x] in the prompts; fill it in here or tell the AI when it asks." |
| Conflict | "Check this first:" list above the pack |
| Earlier answer changed | pack recomposed; nothing else reset; a changed task resets questions (a different blueprint) |
| Product changed | pack recomposed |
| Start again | everything cleared including start panel; focus to the describe input; status "Cleared." |
| Refresh | everything is gone (stated in the FAQ); query restores only the task |
| Back | the previous URL's query is reapplied on load (full load) |
| Copy refused | text selected; status "Copying was refused by the browser. The text is selected: press Ctrl+C or Cmd+C." |
| Blueprint load fails | "The questions could not be loaded. Check your connection and choose the task again." (existing) |

### 5.3 The Work Pack (final structure)

State line → Check this first (if any) → View switch (radio group "Show": Everything, Prompts only) → Overview (task, deliverable, success) → AI product → Prepare → Master prompt (with "N words" after the heading) → Stages (multi-stage: stage 1 open, others closed `details` with "Expand all stages" button) → Refinement prompts → Quality checklist → Next steps → Actions: "Copy the whole pack" (primary), "Download .md", "Check the answer you get" row: link "Open the AI Output Reviewer with this request" and, for brief-style tasks, "Start a context pack from this task" (Context Bridge). Short depth shows: state, overview, product, prepare, master prompt, two refinements, quality, next steps (no stages section).

Prompts only view hides overview, product, prepare, quality and next steps and the stage fact lists; prompts and their Copy buttons remain. The choice is not stored.

### 5.4 Compiler: input-to-output rules (final)

Input: `{ answers, role, experience, depth, product, alternatives, noProductLine, context, consistency }`.

1. Answers are trimmed; only the blueprint's own keys are read; hidden (`showIf` false) answers are ignored.
2. Every visible unanswered essential becomes `[add: <label>]` and is listed in `missing`; the closing line asks the AI to ask for them.
3. Every answered field appears in the master prompt exactly once (in its context line or requirement), verbatim.
4. Conflicts: blueprint rules plus the generic rule "an answer contains placeholder text (`[add`, `TODO`, `TBD`, `lorem`, `xxx`)" → "<label> still contains placeholder text: replace it or leave the field empty."
5. Requirements are de-duplicated by normalised text (lower case, collapsed spaces, final full stop removed); the first occurrence is kept.
6. Project context (brief style only): after the goal, `Project context (from my notes, use it; do not repeat it back):` followed by the text in a fence. A pack's own metadata comment is stripped first. Not added when empty.
7. Consistency sheet (descriptive style and creative stages): `Keep the same in every output: Subject: …; Look and style: …; Colours: …; Lighting: …; Camera and framing: …; Voice and pronunciation: …; Never change: ….` (only filled items), appended to the master prompt and to every stage prompt.
8. Stage prompt header: `Stage i of n: <name>. (Part of the work on <deliverable>.)`.
9. Depth: Short = master prompt and first two refinements, no stages; Standard = stages at `standard`; Detailed = `standard`+`detailed` + Final review; Multi = all + Final review. Default per blueprint, moved by experience (existing).
10. Experience rules add requirement and quality lines (existing).
11. `wordCount` of the master prompt is reported; over 600 words a note: "A long prompt is followed less reliably. Consider Standard depth or a shorter project context."
12. Markdown (`markdown`) = what is shown, in the same order; Copy copies `markdown`; Download writes `markdown` + the metadata comment (`16` D9). Copy and download never differ in visible text.

Correct (task `test-plan`, essentials answered, Standard):
~~~
Write a test plan for the following: Checkout coupon codes for signed-in customers

Project context (from my notes, use it; do not repeat it back):
```text
React web app; Playwright; release on the 20th
```

Context:
- Testing in scope: Functional and regression
Requirements:
- Cover scope and out of scope, …
…
If anything essential is missing or unclear, ask me before you start. …
~~~
Incorrect (each is a test failure): a requirement line repeated; "Playwright" added when the visitor did not name it; `[add: …]` missing for an empty essential; a "Context:" heading with nothing under it; a stage without "done when"; the copied text differing from the shown text; "world-class", "think step by step silently" or invented product parameters.

### 5.5 Data models

```
WorkPackFile  { kind:"work-pack", format:1, version:int>=1, date:"YYYY-MM-DD", task:TaskId,
                answers:{[key]:string<=8000}, role:string<=100, experience:""|beginner|…,
                depth:""|short|standard|detailed|multi, product:string<=100 (directory id or own name),
                ownProduct:boolean, context:string<=8000, consistency:{subject,look,colours,lighting,camera,voice,never}:string<=300 }
Match         { taskId, outcome, title, score }
Starter       { id, title, purpose, steps:[{ task, answers, depth }] }
Handoff       { review:{ request, task, title } | context:{ text, from } | seed:{ project, purpose, task } }
```

### 5.6 Responsive and theme
- ≥ 1200 px: form left, pack right (existing shared layout); the start panel spans the form column.
- 600-1199 px: one column; the pack follows the form; "Jump to the Work Pack" link (existing).
- < 600 px: one column; choice grids one column (existing media query); start-panel button full width; matches as full-width cards; prompts wrap; actions stack full width.
- Both themes through tokens; prompt blocks use `--surface-sunken`; the alert uses `--state-warning-soft` and `--state-warning-line` with the word "Check this first".

## 6. AI Context Bridge (`/tools/context-pack-builder/`)

Page: the shared brief page (D10) with this order: intro; trust card; **panel** (two `details`): "Bring context from an AI conversation" and "Open a saved context pack"; the form; the check panel and output; how to use; contents; using it; FAQ.

Fields (in order): `mode`, a select (the shared brief page draws selects; the first field), labelled "What is it for", choices "Project brief", "Handoff to another AI", "Session update", "Coding agent file" (short labels so the control never widens the page at 1280 px; the hint explains each), `project`*, `purpose`*, `role`, `stack`, `state`*, `decisions`, `rejected`, `terms`, `files`, `done`, `issues`, `rules`, `task`*, `verify`, `reply`. (* essential.) Existing keys keep their meaning; new keys are optional.

Compose by mode:

| Section | Brief | Handoff | Session | Agent file |
| --- | --- | --- | --- | --- |
| Purpose | ✓ | ✓ | – | ✓ (Project) |
| My role | ✓ | ✓ | – | – |
| How it is built | ✓ | ✓ | – | ✓ |
| Current state | ✓ | ✓ | ✓ | – |
| Decisions | ✓ | latest 5 | ✓ | ✓ |
| Rejected approaches | ✓ | – | ✓ | ✓ (Do not) |
| Terms | ✓ | – | – | ✓ |
| Key files | ✓ | ✓ | – | ✓ (Where things are) |
| Completed work | ✓ | last 5 | ✓ | – |
| Known issues | ✓ | ✓ | ✓ | ✓ |
| Rules | ✓ | ✓ | – | ✓ |
| Next task | ✓ | ✓ | ✓ | – |
| Verification | ✓ | ✓ | ✓ | ✓ (How to check work) |
| How to respond | ✓ | ✓ | ✓ | – |

Heading: Brief "# Project context: X"; Handoff "# Handoff: X"; Session "# Continuing: X"; Agent "# X: instructions for coding assistants". A list cut short adds "(N earlier items left out)". When opened from a file and edited: line "Version N+1, YYYY-MM-DD. Changed since version N: Current state, Next task." under the heading.

Check panel notes (no score change): "Short handoff: N words" and, over 400, "Over 400 words: an assistant may skim it; trim the longest sections."; secret-like text "Field X contains text that looks like a password or key. Remove it before you paste this anywhere."; staleness (opened pack older than 14 days, item both done and next, next task empty with open issues).

Extraction panel: step 1 a read-only prompt with Copy ("Copy the prompt, paste it at the end of your AI conversation"), step 2 textarea "Paste the AI's reply" and button "Fill the form from this reply". Result note: "Filled N sections. Nothing for: …. Check every field: the AI's summary may be wrong or incomplete." No heading matched: "No section of the reply matched the headings. Check that the AI kept the headings from the prompt; nothing was changed." Fields already typed are overwritten only after the native confirm "Replace what you typed with the AI's summary? Fields the reply leaves empty keep what you typed." when any field is non-empty.

Reply parsing (`parseReply`): the reply is split at Markdown headings (`#` to `######`, or a line that is wholly `**bold**` or `__bold__`, with an optional colon); a heading is matched case-insensitively, without a leading number, to a section heading, its coding-agent heading, or an alias (Project name, Completed work, Next task, Rules, Known issues, Key files, Files and references, How it will be verified, Verification, Technical context, Constraints). Bullet marks are removed. A body of "none", "n/a", "nothing" or a dash counts as empty. Text under an unknown heading goes to Notes, never dropped.

Open panel: file input and paste textarea with "Open this pack". A file with the Bridge's metadata opens its values and version: note "Opened version N of <date>. Edit what changed; the download becomes version N+1 and lists what changed." Any other Markdown pack is read by its headings through `parseReply`: note "Read by its headings (it has no saved version). Check every field." Typed fields are replaced only after the confirm "Replace what you typed with the opened pack?". Errors as in 5.2. Download name `context-<project-slug>-v<N>.md`; metadata `{kind:"context-pack", format:1, version, date, values}` (each value at most 4,000 characters).

Hand-off out: the action "Copy and use in the Workbench" copies the pack and puts it as the `context` hand-off in the same click; a line under the actions links "open the AI Workbench". The Workbench announces "Project context brought from the AI Context Bridge." Hand-off in: a `seed` from the Workbench fills project, purpose and next task when they are empty.

Secret-like text (note only, never a block): keys beginning `sk-` or `AKIA`, a private-key header, `password|passwd|pwd|secret|api key|token` followed by `:` or `=` and four or more characters, a hexadecimal run of 40 or more, or a base64-like run of 48 or more.

## 7. AI Output Reviewer (`/tools/ai-answer-checklist/`)

Fields: `answer`* (40,000), `question` relabelled "What you asked (your prompt or requirements)" (12,000; hint "Paste the prompt you gave, or a list of requirements. The review checks the answer against it."), `purpose` (existing), `reviewType` select (General; Code; Test plan or test cases; Article or copy; Research or report; Image or video prompt), `wordLimit` text (digits, optional; "Word limit, if you set one").

Output (Markdown in the output text area):
- When nothing in the request can be checked (no requested items extracted) and no format, leftover, contradiction or review-type finding exists: exactly the existing evidence checklist (backward compatible; a plain question has nothing to check against).
- Otherwise: `# Review of an AI answer`, then `## Against your request` (each extracted requirement: "- [ ] <requirement> — visibly addressed" or "— not visibly addressed"), `## Format` (findings or "No format problems found by these checks."), `## Leftovers`, `## Contradictions inside the answer`, then the existing sections (statements to check, what it leaves out, questions to put back), then `## Follow-up prompt` (fenced, only gaps), then `## What this review cannot tell you`.

Requirement extraction from the request: lines under "Requirements:" and "Format of your answer:" (Workbench prompts) or else every bullet or numbered line; else every sentence with "must", "should", "include", "need". Coverage: a requirement is "visibly addressed" when at least half (minimum two) of its content words (length ≥ 4, stop words removed, simple stem) appear in the answer.

Format checks: request mentions "table" → a Markdown table in the answer; "JSON" with "only" → `JSON.parse` of the answer (or its single fenced block), error position reported; "headings" or a Markdown heading list in the request → each requested heading present; a word limit (field or "under/at most/no more than N words") → word count compared; "N items/posts/cases/ideas" → count of list items compared; "write/fix/give/return … code" → a code block present. Requirement headings recognised: Requirements, Format of your answer, Acceptance criteria, Must include. At most 40 requirements.

Review-type checks (added to Format): Test plan or test cases → test case ids (TC-1, ID, Case 1, or an id column) and the word "expected"; Code → a code block; Research or report → a link, DOI, "(year)" or "et al" to check. General, Article and Image/video add no extra check.

Leftovers: `[add:`, `TODO`, `TBD`, `lorem ipsum`, `XXX`, `<placeholder>` / `<insert …>` / `<your …>`, `[insert …]` / `[your …]` / `[name]` / `[date]` / `[company]`, `as an AI`, an answer ending without terminal punctuation or inside an open code fence.

Contradictions: sentence pairs inside the answer with similarity ≥ 0.6 (raised from 0.5 in testing: at 0.5 unrelated sentences sharing a number were paired) and a figure or negation conflict (`compare-engine.conflict`), first 400 sentences, at most 10 pairs.

Follow-up prompt: "Please revise your last answer." then one line per gap in the order found (missing requirement, format, leftover, contradiction), then "Keep everything that is already correct. Do not add facts I did not give you; mark anything uncertain. Then give the corrected answer in full." Empty, and the action disabled, when there are no gaps.

Check panel notes: "Review: N requested items not visibly addressed, M statements to verify, K format problems." Extra action "Copy follow-up prompt". Hand-off in: request and review type from the Workbench (task to type, `TYPE_OF_TASK` in the page module: code-feature, debug, code-review, refactor, api-design and test-automation → Code; test-plan, test-cases, api-testing, regression, defect, performance-test → Test plan or test cases; article, social-posts, marketing-copy, script, repurpose, email-message → Article or copy; research-plan, literature-review, market-research, report, doc-summary → Research or report; the five image and four video tasks → Image or video prompt; every other task General), announcement "Brought from the Workbench: the request for <task>. Paste the AI's answer." A link to Compare Two AI Answers sits under the output.

Guarantees (shown on the page): the review **can** tell you which requested items have no visible match, whether the requested format was followed by these checks, what placeholders were left, which statements contain figures, dates, sources or absolute wording, and where the answer contradicts itself on a figure. It **cannot** tell you whether anything is true, whether reasoning is sound, or whether a cited source says what is claimed.

Responsive and theme (Context Bridge and Output Reviewer, the shared brief page): ≥ 1200 px form left, output right; below, one column with the output after the form. The action row wraps (`.ai-actions { flex-wrap: wrap }`) so a third action never widens the page. The Bridge's two panels are `details` cards (`--surface-page`, `--line`, `--radius-md`), summaries 44 px high; their buttons go full width under 600 px; the extraction prompt is a scrollable block at most 220 px high (`--surface-sunken`, monospace). The output text area uses 16 px text under 600 px (no zoom on focus). Tokens only, so light and dark need no theme-specific rule.

## 8. AI Directory (`/ai-tools/directory/`)

Unchanged data and filters. Each card gains a secondary link "Plan a task with <name>" → `/tools/ai-workbench/?product=<id>`. Under the intro: "Not sure which product fits? Describe your task in the AI Workbench; it lists the products made for that kind of task." When the Workbench receives `?product` for a task that does not list it: note "<name> is not listed for this task in the AI Directory. You can still use it: choose My own AI product." and "My own AI product" is preselected with the name filled.

## 9. Accessibility (all AI pages)

Native controls only; every control labelled with a linked hint; one polite live region per tool, never per keystroke; focus moves only after an explicit action (Use this task, Open, Show my Work Pack, Start again); `details` for disclosures; errors beside their control and linked by `aria-describedby`; 44 px targets (`--target-size`); colour never alone (words "Check this first", "not visibly addressed"); reduced motion (no new animation); copy buttons named for what they copy.

## 10. Privacy (final)

Nothing is stored (no localStorage, sessionStorage, IndexedDB or cookies written by AI tools). No network request carries user text (file reading is `FileReader`/`file.text()` locally). Query strings carry only fixed ids. The in-memory hand-off ends with the tab. No Privacy page change. Page wording: "Prepared in your browser. No AI service is called. Nothing is stored."

## 11. Microcopy (final strings not listed above)

- Workbench pack area empty: "Choose what you want to accomplish, or describe it above. Your Work Pack appears here as you answer."
- Download status: "Downloaded <file>. Open it here again with Open a saved Work Pack."
- Workbench FAQ "Is anything saved?": "No. Your answers stay on this page and are gone when you leave it. Download the Work Pack to keep it; Open a saved Work Pack brings every answer back."
- Bridge intro: "Write down once what an AI product needs to know about your project, then carry it to another chat or another product: a full brief, a short handoff, a session update or a file for a coding assistant."
- Reviewer intro: "Paste an AI answer and, if you can, what you asked. Get the requested items it does not visibly address, format problems, leftovers, statements to verify, and a follow-up prompt that names the gaps."

## 12. User journeys (final)

Each journey names its entry, steps, end state and the test that pins it (`tests/browser/ai-ecosystem.spec.js` = E, `ai-workbench.spec.js` = W, `ai-tools.spec.js` = T, `tests/unit/ai-ecosystem.test.mjs` = U).

| Id | Journey | Steps | Ends with | Pinned by |
| --- | --- | --- | --- | --- |
| A | Knows the outcome | AI Home outcome link → Workbench task list → task → answers → pack | Copy or Download | W |
| B | Not sure what to ask for | AI Home "Describe your task" (or "I'm not sure") → describe → matches → Use this task → answers → pack | pack | E, W |
| C | Common start | AI Home "A test plan" → Workbench with task and questions open | pack | E |
| D | Recurring work | Workbench → Start from a playbook → Step n → fields prefilled (empty fields only) → pack; repeat per step | one pack per step | U |
| E | Reuse my own setup | Download a Work Pack → later: Open a saved Work Pack (file or paste) → every answer restored → edit → pack | same master prompt as before | E (@portable) |
| F | Move a project to another AI | AI Home "Continue a project in another AI" → Bridge in Handoff mode → Copy the extraction prompt → paste it into the old chat → paste the reply → Fill → check fields → Copy → paste into the new product | handoff text | E |
| G | Start a new session | Bridge → Open a saved context pack → edit what changed → Session update → Download (version N+1, changed sections named) | versioned file | U |
| H | Coding assistant file | Bridge → Coding agent file → Download → saved by the visitor as AGENTS.md / CLAUDE.md | file | E, U |
| I | Context into a task | Bridge → "Copy and use in the Workbench" → open the AI Workbench → project context filled → task → pack | pack with context | E (@desktop-only) |
| J | Check what came back | Workbench pack → "Open the AI Output Reviewer with this request" → paste the AI's answer → review → Copy follow-up prompt → paste back into the AI | follow-up prompt | E (@desktop-only) |
| K | Check any answer | Reviewer direct → paste answer and own prompt → review | review | U, T |
| L | Choose a product | Directory → filter → card "Plan a task with <name>" → Workbench with the product set | pack for that product | **not pinned** (built and checked by eye; the link crawl covers the URL; a browser test is a Phase 3 follow-up) |

Journeys I and J depend on the in-memory hand-off; on a full page load (a new tab, a reload) the hand-off is empty by design and the receiving field accepts paste, which is the documented fallback.

## 13. The task matcher (`ai-workbench/task-index.js`)

- **Input:** the describe text, at most 300 characters. Lower-cased; anything not a letter or digit becomes a space; a light stem (`-ing` from 6 letters, `-ies` → `-y`, `-es` after ss/sh/ch/x, a final `-s` from 4 letters except `-ss`); stop words removed (a, an, the, for, to, of, and, or, my, me, I, we, our, on, in, with, from, about, this, that, it, is, be, do, need, want, help, make, create, write, some, new, please, can, you, how, get, use).
- **Synonyms:** each of the 46 tasks has a list of real terms (no broad or invented words, rule 5.3); a unit test (`indexCovers`) fails when a task has none or a list names no task.
- **Score:** each synonym phrase found as a consecutive word run: 3 when it has two or more words, 2 for one word (a phrase that stems to one already counted is skipped); each further word of the task title present: 1; each word of the outcome title present: 0.5. Tasks under 1 are dropped.
- **Result:** up to three tasks, best first, ties in catalog order; **confident** when the best is at least 3 and at least 1.5 times the second. Confident: "Best match" plus "Other possible tasks"; otherwise "Several could fit". Utility tools whose trigger phrases appear are listed as links.
- **Never:** choose a task for the visitor, call a service, or store the text. A 60-phrase golden table (`U`) pins the expected top task for real phrasings; changing a synonym means running it.

## 14. Playbook starters (`ai-workbench/playbooks.js`)

Ten starters, data only, each `{ id, title, purpose, steps: [{ task, depth, answers }] }`; answers are generic choices, never project facts. Choosing a step selects the task with the step's depth and fills only fields that are still empty; note "Filled from the playbook \"<title>\". Edit anything."

| Starter | Steps (task, depth) |
| --- | --- |
| Weekly article or newsletter | article (detailed, purpose "Explain or teach"); repurpose (standard, target "Social posts") |
| YouTube video from idea to upload | video-concept; script; thumbnail (short) |
| Release testing | test-plan (detailed, scope "Functional and regression"); test-cases; regression; defect (short) |
| API test cycle | api-testing; test-automation |
| Bug investigation | debug (multi); purpose points to Bug Report for a single bug |
| Feature from requirements to review | requirements; code-feature (detailed); code-review |
| Research report | research-plan (detailed); literature-review; report |
| Monthly business report | data-analysis; report; presentation |
| Meeting follow-up | email-message (short, kind "A new message"); purpose points to Meeting Notes |
| Consistent image series | image-series |

Unmarked depths are Standard. A unit test fails if a step names a task that is not offered, or an answer that is not a real option of that task's questions. Review date `PLAYBOOKS_REVIEWED`, at least every six months with the blueprints.

## 15. Technical architecture (final)

Static pages, vanilla ES modules, no framework, no backend, no AI API, no storage. Every module below loads only on the page that imports it.

| Module | Role | Loaded by |
| --- | --- | --- |
| `pages/directory/directory-html.js` `aiHomeStartHtml()` | AI Home start block, plain links, rendered only for section `ai-tools` at build | build (no runtime script) |
| `tools/ai-workbench/index.js` | Workbench page: start panel, form, pack view, hand-offs | Workbench |
| `ai-workbench/compiler.js`, `taxonomy.js`, `blueprints/*.js` (lazy per family), `products.js` | the pack compiler and its data | Workbench |
| `ai-workbench/task-index.js`, `playbooks.js` | matcher, starters | Workbench |
| `ai-tools/common/pack-format.js` | file metadata write/read (`withMeta`, `readMeta`, allow-list `pick`, 200 kB cap), headings parser, `slug`, `today`, local download and file read | Workbench, Bridge, Reviewer |
| `ai-tools/common/handoff.js` | one in-memory payload per kind (`review`, `context`, `seed`), taken once | Workbench, Bridge, Reviewer |
| `ai-tools/common/brief-tool.js`, `brief-engine.js` | shared brief page; optional hooks `panel`, `wire(api)`, `context()`, `notes(values)`, `actions`, `downloadText(markdown, values)`, `fileName(values, extra)`, `afterDownload`; without hooks the markup is byte-identical to before | six brief tools |
| `context-pack-builder/index.js` + `common/context-engine.js` | AI Context Bridge | Bridge |
| `ai-answer-checklist/index.js` + `common/review-engine.js` (+ existing `claim-engine.js`, `compare-engine.js`) | AI Output Reviewer | Reviewer |

Data flow: form values → pure engine (`compose`, `composeContext`, `review`) → Markdown shown in the page → Copy (Markdown) or Download (Markdown + metadata comment). Opened files → `readMeta` → `pick` (only known keys, typed, capped) → form controls (never `innerHTML`, rule 8.7). Hand-off: sender `put(kind)` then same-tab navigation; receiver `take(kind)` on mount. The hand-off works because workspace navigation re-imports only the tool module (`?m=N`) while shared modules keep their identity (`tool-mount.js`).

## 16. Performance (final budget)

Measured 2026-11-17, unminified source (the build does not minify), raw / gzip, compared with commit 7b339d7f:

| Page | New shared modules | Page module growth | Total added | Budget (`14` §6) |
| --- | --- | --- | --- | --- |
| Workbench | task index 11.1 / 4.2, playbooks 4.3 / 1.2, pack format 6.8 / 2.6, hand-off 1.1 / 0.5 = 23.3 / 8.5 | index +19.9 / +5.2, compiler +3.0 / +1.1 | about 46 / 15 | 25 / 9 for the new modules: **met** (23.3 / 8.5); page growth was not budgeted |
| Context Bridge | engine 9.6 / 3.7, pack format 6.8 / 2.6, hand-off 1.1 / 0.5 | page +12.1 / +3.6, brief-tool +3.3 / +0.8 | about 33 / 11 | 15 / 6 for engine + pack format: **over** (16.4 / 6.3) |
| Output Reviewer | engine 12.3 / 4.6, pack format 6.8 / 2.6 (imported by the engine), hand-off 1.1 / 0.5 | page +4.2 / +1.6, brief-tool +3.3 / +0.8 | about 28 / 10 | 15 / 6 for the engine: **met** (12.3 / 4.6) |
| Four other brief tools | none | brief-tool +3.3 / +0.8 | 3.3 / 0.8 | not budgeted |

Final budget decision (owner delegation, routine): the budget applies to **all JavaScript a page adds**, not only its new modules, because that is what a visitor downloads. Final per-page ceilings: Workbench 50 / 16, Context Bridge 35 / 12, Output Reviewer 30 / 10, other brief tools 4 / 1, AI Home 0 (no script). All are met today. The trim work below is an implementation follow-up, not a design change: (1) the Reviewer imports all of `pack-format.js` for `sectionsOf`/`keyOf`; move those two into a small module (about −6 kB raw on the Reviewer); (2) the Workbench page module carries static markup that can be built once (about −5 kB). Neither changes behaviour, and neither blocks a preview.

## 17. The two renamed tools (what they are, and are not)

**AI Context Bridge** (formerly Project Context Pack Builder; `/tools/context-pack-builder/`, id unchanged, old names kept as search aliases).
- *What it represents:* the "carry" step. A visitor writes down once what any AI product needs to know about a project (purpose, how it is built, state, decisions, rejected approaches, terms, files, done work, issues, rules, next task, verification) and gets it out in four forms: a full project brief, a short handoff (latest five decisions and done items), a session update (what changed), and a coding-agent instruction file.
- *Journeys:* F, G, H, I (section 12).
- *Functions:* four modes from one set of fields; an extraction prompt to run at the end of an AI conversation, whose reply fills the form by heading; open a saved pack (with version) or any Markdown pack (by headings); versioned download that names the changed sections; notes for a long handoff, secret-like text, a pack older than 14 days, an item both done and next, open issues with no next task, and a line both decided and rejected; hand-off to the Workbench.
- *Limitations:* it does not read any AI conversation itself (the visitor copies the prompt and the reply); the AI's summary may be wrong or incomplete, and the page says to check every field; the secret check is a pattern, not a guarantee; nothing is saved unless the visitor downloads the file; the hand-off to the Workbench is lost on reload (paste works); it does not install the coding-agent file anywhere.

**AI Output Reviewer** (formerly AI Answer Evidence Checklist; `/tools/ai-answer-checklist/`, id unchanged, old name kept as an alias).
- *What it represents:* the "check" step. It compares an AI answer with what was asked.
- *Journeys:* J, K.
- *Functions:* extracts the requested items from the request and marks each "visibly addressed" (with an excerpt) or "not visibly addressed"; format checks (table, JSON only, headings, code, word limit, item count) and review-type checks; leftovers and signs of a cut-off answer; contradictions on a figure or negation inside the answer; the existing evidence checklist (statements with figures, dates, sources or absolute wording to verify; what it leaves out; questions to put back); one follow-up prompt naming only the gaps; a hand-off from the Workbench with the request and review type.
- *Limitations:* it reads words, not meaning, so a requirement met in other words shows as "not visibly addressed" (the page says to read for it); it never says an answer is true, accurate, verified or correct; it cannot check reasoning or whether a source says what is claimed; with a plain question and nothing to check, the output is the old checklist; the contradiction check covers the first 400 sentences.
