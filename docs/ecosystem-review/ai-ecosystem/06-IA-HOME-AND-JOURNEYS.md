# 06. Information architecture, AI Home and user journeys

## 1. Information architecture (decided, subject to owner decisions D1 to D3)

No new section, no new header item, no new route in the initial production scope. Every existing URL is kept.

```
AI Tools (section, /ai-tools.html)  = AI Home: launcher + the listing it already has
├── Plan with AI
│   └── AI Workbench                /tools/ai-workbench/            (+ ?task=<id>, ?outcome=<id>)
│         ├─ playbook starters      (a part of the Workbench page, not a page)
│         └─ open a saved pack      (a part of the Workbench page)
├── Carry your context
│   └── AI Context Bridge           /tools/context-pack-builder/    (retitled, D2; id and URL unchanged)
├── Check an answer
│   ├── AI Output Reviewer          /tools/ai-answer-checklist/     (retitled, D3; id and URL unchanged)
│   └── Compare Two AI Answers      /tools/ai-answer-compare/       (unchanged)
├── Quick briefs
│   ├── AI Prompt Builder           /tools/prompt-builder/          (+ Prompt check, valuable)
│   ├── Bug Report to Debugging Prompt /tools/bug-report-prompt/    (unchanged)
│   └── Meeting Notes to Action Plan /tools/meeting-notes-action-plan/ (unchanged)
└── AI products
    └── AI Directory                /ai-tools/directory/            (+ task filter)
```

Sidebar groups (`SECTION_GROUPS`) become: Plan with AI; Carry your context; Check an answer; Quick briefs; AI products. Presentation only (rule 4.8).

### What is a page, a part, or a component

| Candidate | Decision | Why |
| --- | --- | --- |
| AI Home | the existing section page plus a launcher block | a new route would duplicate the section landing (rule 4.4) |
| Workbench | existing page, extended | proven core |
| Context Bridge | the Context Pack Builder evolved | same job, done fully (rule 1.6: a variant is a mode) |
| Output Reviewer | the Evidence Checklist evolved | same job, done fully |
| Playbooks | a part of the Workbench (starters + open a file) | a playbook is a pre-answered Work Pack; a separate page would duplicate the Workbench |
| Project Context Kits | merged into the Context Bridge | one context object, not two |
| Prompt Builder | kept for free-form tasks the 44 tasks do not cover; gains Prompt check later | distinct: any task, one prompt |
| Bug Report tool | kept; the Workbench's debug task links to it for "one bug with logs" | faster for its narrow job |
| Utilities (pack format, task index, hand-off) | shared modules in `ai-tools/common/` | real duplication across four tools (rule 9.4) |

### Positioning of overlapping tools (shown as one-line notes on the pages)
- Prompt Builder: "One prompt for any task." Workbench: "A full plan for a known kind of task."
- Bug Report: "One bug, with its error and steps." Workbench debug: "An investigation in stages."
- Output Reviewer: "Check one answer against what you asked." Compare: "Two answers to the same question."

### Cross-tool hand-offs

| From | To | What travels | How |
| --- | --- | --- | --- |
| AI Home launcher | Workbench | task id (or outcome id) | `?task=` query, no user text in the URL |
| Directory card ("Plan a task with this product") | Workbench | product id | `?product=` query |
| Context Bridge | Workbench | the Context Pack text | in-memory hand-off, else paste or open file |
| Workbench | Output Reviewer | task id, deliverable, requirements, format, quality checks | in-memory hand-off, else "Copy review kit" / open the pack file in the Reviewer |
| Output Reviewer | Workbench / chat | refinement prompt | copy |
| Workbench | Context Bridge | task, decisions recorded in a stage | "Start a context pack from this task" (in-memory) |

The in-memory hand-off lives only while the visitor stays inside AI Tools pages in the same tab (workspace navigation keeps the document); it is never stored, and a page reload clears it. Each receiving tool always also accepts paste and file, so the hand-off is a convenience, never a dependency.

## 2. AI Home: the launcher

### Options compared

| Start | Strength | Weakness | Verdict |
| --- | --- | --- | --- |
| A. Natural-language box | familiar (the single AI input); no need to know tool names | deterministic matching can miss; must not look like a chat | **Primary**, with confirmation |
| B. Category choice | recognisable, no typing | eight outcomes need reading | Shown under the box as "Or choose" |
| C. Common task shortcuts | one click | static list | Six chips under the box |
| D. Open a saved pack or context | fastest for returning users | needs a file | A secondary action "Open a saved pack" |
| E. Direct links to tools | for people who know | not for beginners | The existing listing below the launcher |

### Specification
- Heading: "What do you want to do with AI?" Box label: "Describe it in a few words". Placeholder: "e.g. test plan for a checkout coupon feature". Button: "Find the right start". No send arrow, no chat bubbles, no typing animation.
- Matching: the task index (`07` section 2). Results are a **short list of up to three task cards** with "Open in the Workbench", plus, when the text matches a utility (bug, meeting notes, compare, check an answer, context, which AI product), that utility's card. Wording: "Closest matches. Choose one:" Never auto-opens.
- No match: "No close match. Choose what you want to accomplish:" and the eight outcome buttons; plus "Or write one prompt for anything: AI Prompt Builder".
- Shortcuts (curated, not ranked by use): Test plan; Article; Debug a problem; Continue a project in another AI; Check an AI answer; Which AI product for this?
- Returning visit: identical (nothing stored); "Open a saved pack" accepts a `.md` Work Pack or Context Pack and routes to the right tool through the in-memory hand-off.
- Keyboard: Enter runs the match; the results list is a list of links; focus moves to the results heading only after the button press, never on typing. Mobile: the box is full width, 16 px text, the button below it.
- Without script: the box is hidden; the outcome links and the listing remain.

## 3. User journeys

Each: goal; start; actions and questions; inputs; decisions; outputs; errors and recovery; completion; reason to return; today versus target.

**A. Beginner, first time.** Goal: a birthday-party invitation and a picture. Start: AI Home. Types "invitation and picture for my daughter's party". The task index maps "invitation" to the new "email or message" task and "picture" to "generate a new image"; both cards are shown and the visitor picks the picture first. Workbench asks 4 questions (subject, style, format, text in image) with examples; Beginner experience adds explanations. Output: a Short pack, one prompt, a product shortlist from the directory with "not a ranking". Error: no product chosen, the prompt is still neutral. Done: copied prompt. Return: next occasion. **Today:** must pick "Create images" from a list; no free-text start except the "not sure" outcome matcher. **Target:** launcher.

**B. Frequent ChatGPT user, recurring task.** Goal: the weekly newsletter. First week: Workbench "article" with answers, Download .md. Next week: AI Home, "Open a saved pack", the file restores all answers; changes the topic and date; new pack in under a minute. Error: an older pack version: the importer says which fields no longer exist and keeps the rest. Return: weekly. **Today:** starts from zero every week. **Target:** round-trip (`10`).

**C. Switching from ChatGPT to Claude.** Goal: continue a project. Context Bridge, mode "Hand off to another AI". Step 1 offers an **extraction prompt** to paste into ChatGPT ("Summarise this project in the following sections…" in the Bridge's format). The visitor pastes ChatGPT's reply back; the Bridge parses the sections into fields, marks empty ones, flags stale items ("Next task" older than "Work completed"). The visitor edits and copies the Handoff (short) into Claude. Error: the reply ignored the format: the Bridge keeps it as free text under "Notes" and lists missing sections. Return: every switch or new session. **Today:** retype into the Context Pack form. **Target:** `08`.

**D. QA professional, release.** Goal: test plan, cases, regression, release check. AI Home "release test plan" → playbook starter "Release testing" (stages: test plan, cases, regression plan, defect review) built from existing tasks. Pack file per release; next release reopens it. Output Reviewer checks the AI's test plan against the pack's requirements (traceability table present? each AC mentioned?). **Today:** separate tasks, no reuse, no review against the request. **Target:** playbook + review.

**E. Developer, feature.** Goal: plan, build, debug, review. Context Bridge "coding agent" format produces an AGENTS.md-style file the developer saves under the name their tool reads (S15). Workbench "code a feature" with the context attached; stages; debug via the Bug Report tool; Output Reviewer with code checks (fenced code present, placeholders like TODO, requested language, tests mentioned). **Today:** context pack and Workbench unconnected. **Target:** context in, review out.

**F. Content creator.** Research → article → repurpose. Workbench "article" (research stage included at detailed depth) then "repurpose" with the article pasted; Reviewer with the content blueprint (length limit, headings, claims with figures to verify, banned phrases the user listed). Return: weekly playbook.

**G. Image or video creator.** Goal: a 6-shot product video with one consistent character. Workbench "storyboard" then "image to video"; the pack includes a **consistency sheet** (subject, look, palette, lighting, camera, never-change list) repeated in each shot prompt; refinements "continuity" and "visual". Directory shortlist from video and images categories with the official summaries. Error: product-specific syntax requested: the pack says the product's own documentation decides syntax. **Today:** good blueprints, no consistency sheet as a reusable block. **Target:** sheet in the pack file (store later, Stage 11).

**H. Researcher.** Research plan → literature review → report; `NO_FABRICATION` throughout; the Reviewer lists every citation, URL, figure and date as "to open and check" and runs the evidence refinement. Return: per project.

**I. Weak AI answer.** AI Home "check an AI answer" → Output Reviewer: paste answer, optionally paste the request (or it arrives from the Workbench). Deterministic findings (missing requested sections, placeholders, unhedged absolute claims, figures, dates, URLs, contradictions within the answer, format) and a generated **follow-up prompt** that names the gaps. Completion: the follow-up copied. **Today:** claims checklist only. **Target:** `09`.

**J. Returning user.** Opens the saved Work Pack or Context Pack file from AI Home or inside the tool; everything restores; edits; downloads the new version (version number +1, date). No account, no storage.
