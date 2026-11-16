# 07. AI Workbench specification (improvements to Tool Pack 58)

Preserve: route, the 44 tasks and their ids, the compiler contract and its tests, the blueprint data model, depths, experience rules, refinements, `NO_FABRICATION`, directory-only products, "nothing is stored". Everything below is additive.

## 1. Entry and discovery

| Entry | Behaviour |
| --- | --- |
| Direct visit | unchanged: outcome buttons; a new describe box above them ("Describe what you want to do", same matcher as AI Home) |
| `?task=<id>` | outcome and task preselected, questions shown, focus on the Details heading; an unknown id is ignored with a polite note "That task was not found. Choose what you want to accomplish." |
| `?outcome=<id>` | outcome preselected, task list shown |
| `?product=<directory id>` | that product preselected when the chosen task lists it; otherwise a note "<name> is not listed for this task. You can still use it: choose My own AI product." |
| Playbook starter | answers prefilled from the starter (section 6) |
| Open a saved pack | answers, context, depth, product restored (`10`) |
| Hand-off from Context Bridge | the Project context field filled; a note says where it came from |

Query values are ids from fixed lists only; user text never goes in the URL (it would sit in history and logs).

## 2. Task index and matcher (`ai-workbench/task-index.js`, pure)

- Data: for each of the 46 tasks (44 + 2 new, section 5) a list of **true synonyms and phrases** people use for that job (for example `test-plan`: "test plan", "test strategy", "qa plan", "release testing"; `debug`: "bug", "error", "crash", "not working", "stack trace"; `image-to-video`: "animate", "animate a photo", "image to video"). Utilities are indexed too (`bug-report-prompt`, `ai-answer-checklist`, `ai-answer-compare`, `context-pack-builder`, `meeting-notes-action-plan`, `ai-directory`). Rule 5.3 applies: no invented or broad terms.
- Normalise: lower case, letters and digits only, collapse spaces, strip a trailing `s`, `es` or `ing` from words of five letters or more for comparison.
- Score: a matched multi-word phrase 3; a matched synonym word 2; a matched task-title word 1; outcome words (existing `OUTCOME_WORDS`) 0.5. Stop words ignored.
- Result: up to three candidates with score > 0, ordered by score, then catalog order. **Confident** when the top score is at least 3 and at least 1.5 times the second; the UI still requires a click ("Best match"). Otherwise "Several could fit" with up to three. Equal scores are presented as equal (fixes F1).
- Never chooses for the visitor; never claims to "understand". Empty result: outcome buttons and the Prompt Builder link.
- Tests: a hand-written golden table of at least 60 phrases to the expected first task, written before the index (rule 8.2), plus ambiguity cases ("bug in my Excel formula" must show both `debug` and `data-analysis`).

## 3. Question design (rules for every blueprint, existing and new)

1. Four to six visible questions; only what changes the output. Optional details under "More details (optional)".
2. Essentials are never hidden and never invented; unanswered they become `[add: …]` (existing).
3. Each question has a hint with a realistic example; selects for closed choices; "I don't know" is never an option: leaving it empty means unknown.
4. Conditional questions (`showIf`) only when an answer makes them relevant.
5. Long material (requirements, a draft, a document) is a textarea with the 8,000-character limit stated.
6. Contradiction rules per blueprint (`conflicts(a)`), plus three compiler-level checks for every task (new): an answer that contains a placeholder-like text (`[add`, `TODO`, `lorem`, `xxx`); a length limit in words smaller than the number of requested sections times 50; the same element both in "keep" and "change" fields (generalising the image-edit rule).
7. Effort budget: a Standard pack must be reachable with the essentials only (usually two answers).

## 4. Prompt construction (summary; full research in `12`)

- Master prompt order: goal; project context (when given, fenced, before the instructions); about me (role, experience); context lines; requirements; format; avoid; the missing-information instruction. Empty sections are dropped (existing).
- Depth chooses length; detailed is never padding: a block is added only if it has content (existing). New: a soft length signal on the pack: "Master prompt: 180 words" so the visitor sees size; above 600 words without project context, a note suggests Standard depth (S20 is the reason; the note is advice, not a rule).
- Stages: one deliverable per stage; "done when" is checkable (existing). New: each stage prompt starts with a one-line reminder of the deliverable so it works if pasted into a new chat with the master prompt.

## 5. New tasks (evidence: S25 writing and information seeking; `04` section 3)

| id | Outcome | Title | Essentials | Distinct from |
| --- | --- | --- | --- | --- |
| `email-message` | content | Write or reply to an email or message | what it must achieve; who it is to; (reply) the message received | Prompt Builder (free form) and `adapt-audience` (rewrite) |
| `doc-summary` | research | Summarise or pull information from a document | the document (pasted or attached in the AI product); what the summary is for | `literature-review` (many sources) and `report` (from findings) |

Each gets a full blueprint (questions, brief, stages at standard and detailed, refinements: accuracy, completeness, clarity; quality checks; preparation; next steps; categories). `doc-summary` sets `noFabrication` and asks the AI to quote the passage for each extracted fact.

## 6. Playbook starters (details in `10`)

A "Start from a playbook" disclosure on the landing lists curated starters: each is a task id plus prefilled non-personal answers and a depth (for example "Weekly newsletter", "Release testing", "Monthly report", "YouTube video from idea to upload", "Bug investigation"). A starter that spans several tasks lists them as steps, each opening the Workbench at that task with its answers.

## 7. Project context in

New optional field under "Your context": **Project context** (textarea, 8,000 characters): "Paste a Context Pack or any notes the AI should know." If the text is a Context Pack (`14` section 3), the pack header (project, version, date) is shown above the field and only its sections are included (not its own instructions block, to avoid two sets of instructions). Over 8,000 characters: the field refuses more and says "Use the short handoff from the Context Bridge."

## 8. Review out

Below the pack: **"Check the answer you get"**: a button "Open the Output Reviewer with this task" (in-memory hand-off of task id, deliverable, requirements, format lines, quality checks) and "Copy review kit" (the same as text, for a different tab or device). The Reviewer accepts either.

## 9. The Work Pack display

- Sections stay as now. At Multi-stage depth, stages after the first are collapsed `details` with their name and "done when" visible in the summary; "Expand all" button.
- A view switch "Everything | Prompts only" (radio group); Prompts only hides facts and lists, keeps every prompt with its Copy button.
- Download: the `.md` gains the pack metadata block (`14` section 3) so it can be reopened; file name `ai-work-pack-<task>-<yyyy-mm-dd>.md` (the visitor's local date).
- "Open a saved pack" (file input, `.md`, max 200 kB) on the landing and above the pack.

## 10. Consistency sheet (creative tasks)

For image-series, storyboard, text-to-video, image-to-video, voiceover and podcast: an optional "Keep the same across every output" group (subject or character; look and style; colours; lighting; camera or framing; voice and pronunciation list for audio; never change). The compiler repeats the sheet as one compact block in every stage prompt (consistency is the job; S11-S14). Saved only in the pack file.

## 11. Acceptance criteria

1. All 46 tasks compile with empty answers and with their example; no placeholder left in examples; existing unit tests unchanged and passing.
2. The matcher's golden table passes; ambiguous phrases show more than one card; no automatic selection.
3. `?task`, `?outcome`, `?product` open the right state; unknown ids are handled with the note; no user text in any URL.
4. A downloaded pack reopens to identical answers and an identical master prompt (round-trip test over every task's example).
5. Context in: a Context Pack pasted in appears once, fenced, before the requirements; its own instruction block is not duplicated.
6. Review out: the Reviewer opens with the task's requirements, in the same tab, without storage; after a reload the Reviewer still works by paste.
7. 320 px: no page-level horizontal scroll with the longest pack; every control 44 px.
8. Screen reader: one announcement per meaningful change; stage collapse state is exposed by `details`.
