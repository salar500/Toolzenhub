# 17. Final design (design freeze)

This is the build specification for Phase 2. It supersedes `06` to `15` where they differ (see `16`). Visual design uses only the existing layer: `variables.css` tokens (`--space-*`, `--font-*`, `--fw-*`, `--radius-*`, `--surface-*`, `--ink*`, `--line*`, `--state-*`, `--eco-ai-tools*`, `--focus-ring`, `--target-size`), the shared button and form classes (`calculator-form__button`, `--secondary`, `calculator-form__input`, `calculator-form__group`), `ai-tools.css`, `ai-workbench.css`, `directory.css`. No new colour, font or token. Dark theme comes from `:root[data-theme="dark"]` tokens; every new rule uses tokens only, so both themes work without theme-specific CSS.

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

Common starts: "A test plan" (`?task=test-plan`), "An article" (`?task=article`), "Debug a problem" (`?task=debug`), "Continue a project in another AI" (Context Bridge `?mode=handoff`), "Check an AI answer" (Output Reviewer), "Which AI product?" (Directory). Outcome links use the `OUTCOMES` titles except "unsure".

Layout: the block is a card (`--surface-card`, `--line` border, `--radius-lg`, padding `--space-6`, max width `--width-wide`), placed in the content column. Chips: `display:flex; flex-wrap:wrap; gap: --space-2`; each chip a link styled as a pill (`--radius-full`, `--line-control` border, min-height `--target-size`, padding `0 --space-4`, `--font-sm`). Primary link uses the primary button class. Phone (< 600 px): primary link full width; chips wrap; padding `--space-4`. States: static; no empty or error states. Accessibility: one h2, two h3, lists of links; focus ring from the shared layer.

Section catalog text (catalog-driven, rule 4.5): `description` "Prepare your AI work, carry your project between AI products and check what comes back: a Workbench, a context bridge, an output reviewer, quick briefs and a directory of AI products. Nothing is sent to any AI service."; `summary` "Prepare, carry and check your work with ChatGPT, Claude, Gemini and other AI products"; `seoDescription` accordingly (under 240 characters).

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
| Matches found (confident) | heading "Best match:" and one card, then "Other possible tasks:" up to two; status "N tasks match." |
| Matches found (ambiguous) | "Several could fit. Choose one:" up to three cards |
| No match | "No close match. Choose what you want to accomplish below, or write one prompt for anything with the AI Prompt Builder." (link) |
| Use this task | outcome and task chosen as if clicked; focus to the Details heading |
| Playbook step | task chosen; the step's answers and depth filled into empty fields only; note "Filled from the playbook \"<title>\". Edit anything." |
| Open a pack (valid) | outcome, task, answers, role, experience, depth, product, project context, consistency restored; note "Opened \"<task>\", version N of <date>." and a list of ignored fields if any |
| Open a pack (invalid) | error in words beside the control: "This is not a Work Pack file." / "This pack is for a task that is no longer offered: <id>." / "The file is larger than 200 kB." Focus stays; nothing else changes |
| Answer typed | pack recomposed after 150 ms; one announcement per state change |
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

Fields (in order): `mode` select "What is it for" (Project brief — everything, for the start of a project; Hand off to another AI — short, to continue in another product; Continue a session — what changed, for a new chat; Coding agent file — instructions for a coding assistant), `project`*, `purpose`*, `role`, `stack`, `state`*, `decisions`, `rejected`, `terms`, `files`, `done`, `issues`, `rules`, `task`*, `verify`, `reply`. (* essential.) Existing keys keep their meaning; new keys are optional.

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

Extraction panel: step 1 a read-only prompt with Copy ("Copy the prompt, paste it at the end of your AI conversation"), step 2 textarea "Paste the AI's reply" and button "Fill the form from this reply". Result note: "Filled N sections. Nothing for: …. Check every field: the AI's summary may be wrong or incomplete." Fields already typed are overwritten only after the visitor confirms "Replace what you typed?" (native confirm) when any target field is non-empty.

Open panel: file input and paste textarea with "Open this pack"; errors as in 5.2. Download name `context-<project-slug>-v<N>.md`; metadata `{kind:"context-pack", format:1, version, date, values}`.

"Use in the Workbench" button under the output (link to `/tools/ai-workbench/` after `handoff.put("context")`); the Workbench announces "Project context brought from the AI Context Bridge."

## 7. AI Output Reviewer (`/tools/ai-answer-checklist/`)

Fields: `answer`* (40,000), `question` relabelled "What you asked (your prompt or requirements)" (12,000; hint "Paste the prompt you gave, or a list of requirements. The review checks the answer against it."), `purpose` (existing), `reviewType` select (General; Code; Test plan or test cases; Article or copy; Research or report; Image or video prompt), `wordLimit` text (digits, optional; "Word limit, if you set one").

Output (Markdown in the output text area):
- With no request and default type: exactly the existing checklist (backward compatible).
- With a request: `# Review of an AI answer`, then `## Against your request` (each extracted requirement: "- [ ] <requirement> — visibly addressed" or "— not visibly addressed"), `## Format` (findings or "No format problems found by these checks."), `## Leftovers`, `## Contradictions inside the answer`, then the existing sections (statements to check, what it leaves out, questions to put back), then `## Follow-up prompt` (fenced, only gaps), then `## What this review cannot tell you`.

Requirement extraction from the request: lines under "Requirements:" and "Format of your answer:" (Workbench prompts) or else every bullet or numbered line; else every sentence with "must", "should", "include", "need". Coverage: a requirement is "visibly addressed" when at least half (minimum two) of its content words (length ≥ 4, stop words removed, simple stem) appear in the answer.

Format checks: request mentions "table" → a Markdown table in the answer; "JSON" with "only" → `JSON.parse` of the answer (or its single fenced block), error position reported; "headings" or a Markdown heading list in the request → each requested heading present; a word limit (field or "under/at most/no more than N words") → word count compared; "N items/posts/cases/ideas" → count of list items compared.

Leftovers: `[add:`, `TODO`, `TBD`, `lorem ipsum`, `XXX`, `<placeholder>`, `as an AI`, an answer ending without terminal punctuation or inside an open code fence.

Contradictions: sentence pairs inside the answer with similarity ≥ 0.5 and a figure or negation conflict (`compare-engine.conflict`), first 400 sentences.

Check panel notes: "Review: N requested items not visibly addressed, M statements to verify, K format problems." Extra action "Copy follow-up prompt". Hand-off in: request and review type from the Workbench, note "Brought from the Workbench: the request for <task>."

Guarantees (shown on the page): the review **can** tell you which requested items have no visible match, whether the requested format was followed by these checks, what placeholders were left, which statements contain figures, dates, sources or absolute wording, and where the answer contradicts itself on a figure. It **cannot** tell you whether anything is true, whether reasoning is sound, or whether a cited source says what is claimed.

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
