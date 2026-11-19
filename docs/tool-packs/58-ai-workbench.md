# Tool Pack 58: AI Workbench

Status: built; extended by the AI ecosystem programme (2026-11-16); **renamed the AI Prompt Builder and made the central AI product on 2026-11-18 (decision D22)**: id `prompt-builder`, route `/tools/prompt-builder/`, code in `assets/js/tools/prompt-builder/`; `/tools/ai-workbench/` redirects there. The conversational first screen, the absorbed tasks and the context pack are in `docs/ecosystem-review/ai-ecosystem/26-CONSOLIDATION.md`; this pack's sections stay valid for the engine      Base commit: b0772e83      Section `ai-tools` (category `ai`); tool `ai-workbench` (route `/tools/ai-workbench/`)

Owner instruction, 2026-11-16 (the final master development prompt): a comprehensive AI Workbench inside AI Tools that takes a visitor from an outcome they want to a complete **AI Work Pack**: what to prepare, which AI product suits the job, the instructions to give it, the stages to follow, how to refine the result and how to check it. ToolZen Hub prepares the work; the visitor's own AI product does it. No AI service is called, nothing is sent, and there is no eighth ecosystem: professions are contexts inside one Workbench, never separate pages.

## 1. Tool identity

| id | Title | Section | Type | One sentence |
| --- | --- | --- | --- | --- |
| `ai-workbench` | AI Workbench | ai-tools (category `ai`) | utility | Choose what you want to accomplish, answer a few questions, and get a Work Pack: preparation checklist, master prompt, staged prompts, refinement prompts, a quality checklist and next steps, for the AI product you use. |

## 2. User problem and the AI-era test (rule 1.4)

People know what they want ("a test plan for this feature", "a product photo on a white background", "a 60-second video from this script") but not how to brief an AI product so the first answer is usable, which product fits, or how to check what comes back. They write one vague prompt, accept a weak answer, and start again. An assistant asked "write me a prompt" produces a generic one because it does not know what to ask; the Workbench asks the few questions that change the result, never invents the missing facts (stack, sources, brand rules), flags what is missing, and gives a repeatable, staged method with a review checklist. It is deterministic (the same answers give the same pack), private (nothing leaves the browser) and faster than describing the task to an assistant from scratch.

## 3. Primary jobs

- "I know the outcome; tell me what to prepare and what to ask."
- "Which kind of AI product should I use for this, and why?"
- "Break this into stages I can follow, with a prompt for each."
- "Give me the follow-up prompts to fix what is wrong with the first answer."
- "How do I check the result before I use it?"

## 4. Where it lives and what is not created (rule 14.4)

One tool page, `/tools/ai-workbench/`, in AI Tools, listed with the other AI tools and in the sidebar group "Plan with AI". Not created: role or audience pages, a page per task, an eighth section, a header item, a chatbot, any API call or execution, prompt marketplace, account, sync or billing.

## 5. Taxonomy (assets/js/tools/ai-workbench/taxonomy.js)

Outcome first ("What do you want to accomplish with AI?"), then a specific task:

| Outcome | Tasks (blueprints) |
| --- | --- |
| Create content | article or blog post; social media posts; marketing copy; script for a video or podcast; repurpose content |
| Create images | generate an image; edit an existing image; product photo; thumbnail or banner; character or illustration series |
| Create videos | video concept and script; storyboard and shot list; AI video generation (text to video); image to video |
| Create audio | narration or voiceover; podcast episode; music track; sound effects |
| Build software | requirements analysis; code a feature; debug a problem; code review; refactor; API design; technical documentation |
| Test software (inside Build software) | test plan; test scenarios and cases; API testing; test automation; regression plan; defect report and analysis; performance test plan |
| Research and analyse | research plan; literature review; analyse data (SQL, Excel, Power BI or DAX); market research; report from findings |
| Improve existing work | review and improve a draft; fix accuracy and clarity; adapt for another audience |
| Plan a multi-step workflow | plan a project with AI; learning plan; interview preparation; presentation or proposal |
| Not sure | focuses the "Describe what you want to do" box at the top of the form (section 16) |

Each blueprint is data: its questions (four to six up front that change the output, each optional unless it is essential; optional details marked `more` sit under a closed "More details (optional)" disclosure; a question with `showIf` appears only when another answer calls for it; an essential is never hidden and always reaches a prompt as `[add: …]` when unanswered), preparation items, the deliverable, its stages, the refinement kinds that apply, its quality checks, its next steps and the directory categories that fit it.

## 6. Context (optional, skippable)

Professional context (from a short list per outcome, or "Skip") and experience: Beginner, Intermediate, Experienced, Senior, Specialist or architect. Experience changes depth, not tone: Beginner adds an explanation request and a glossary step and keeps the stages fewer; Senior and Specialist ask for trade-offs, risks, alternatives and decision records, and add review criteria (maintainability, coverage of edge cases, methodology).

## 7. Depth

Short (one prompt, small checklist), Standard (master prompt and two to four stages), Detailed (adds constraints, consistency and a final review stage), Multi-stage (every stage of the blueprint). The default is set by the blueprint and the experience and can be changed. Detailed is never just longer: a section is added only when it has content.

## 8. The compiler (assets/js/tools/ai-workbench/compiler.js, pure)

`compileWorkPack(input)` takes `{ taskId, answers, role, experience, depth, productId }` and returns `{ overview, product, preparation, missing, conflicts, masterPrompt, stages, refinements, quality, nextSteps, complexity }`. Steps: load the blueprint; validate essentials (a missing essential is listed in `missing` and written into the prompt as a bracketed placeholder the visitor must fill, never invented); detect conflicts (for example a length limit shorter than the requested sections, "keep unchanged" and "change" naming the same element) and list them; drop empty sections; compose the master prompt from the task's own sections; compose each stage (name, objective, what to submit, prompt, expected output, done when, next); pick the refinement prompts that apply; build the quality checklist; build next steps. Deterministic and side-effect free; user text is data (rule 8.7) and is placed with `textContent` or as control values.

Prompt rules: no request for hidden reasoning, no invented product syntax or parameters, no fake role inflation ("world-class expert"), no repeated or contradictory instructions; one deliverable per stage; facts the visitor did not give are asked for, not assumed; research and data tasks forbid invented sources, citations and figures and ask to separate evidence from interpretation.

## 9. AI product recommendation (assets/js/tools/ai-workbench/products.js)

From `data/ai-directory.js` only. A blueprint names the directory categories that fit it (for example image editing: `images`, then `assistants` whose official summary mentions image editing). The pack lists the matching products in directory order, each with the summary its official site gave on its check date, and says it is not a ranking. The visitor may pick one or "My own AI product". When no listed product fits, the pack says: "Tool suitability not verified. Choose your preferred AI tool." The prompt is provider-neutral; nothing product-specific is added that the directory does not state.

## 10. Screens

1. Landing: the question, nine outcome buttons, a link to the AI Directory.
2. Task and questions: the outcome's tasks; the chosen task's questions (conditional); optional context; product choice.
3. Preparation: summary, product, what to prepare, what is missing.
4. Work Pack: overview, master prompt, stages (numbered, each with Copy), refinements, quality checklist, next steps; Copy all and Download .md.

The four parts are sections of one page, revealed in order (progressive disclosure), with a step indicator; nothing is a separate URL. Everything updates as the visitor answers; no Generate button is needed, though "Show my Work Pack" moves focus to it.

## 11. Saved work

Nothing is stored (rule 7.7). Reuse is by file (section 16): the downloaded pack opens again with every answer. Browser saving stays a future, opt-in option needing a Privacy page change and owner approval.

## 12. Limits and validation

Text fields 2,000 characters (long material 8,000), stated by `maxlength`. No invalid values: missing essentials and conflicts are told in words above the pack and announced once in a polite status region.

## 13. Accessibility and mobile

Native radio groups and selects with labels and linked hints; step headings; one polite status region (not per keystroke); visible focus; 44 px targets; one column below 1200 px; prompts in read-only text areas that wrap, with Copy buttons; no horizontal overflow.

## 14. Tests

Unit (`tests/unit/ai-workbench.test.mjs`): taxonomy integrity (every task has a blueprint, every blueprint's questions have unique keys and labels), every task compiles with empty answers (no crash; essentials listed as missing) and with an example (no placeholder left), no blueprint leaks another task's sections, no forbidden phrases (hidden reasoning, "world-class", invented syntax), research tasks carry the no-fabrication rule, depth scaling (Short has one stage, Multi-stage all), experience changes the content, conflicts are detected, recommendation only from the directory with the not-verified fallback, determinism. Browser (`tests/browser/ai-workbench.spec.js`): outcome to pack journey on desktop and mobile, copy, keyboard path, no overflow at 320 px.

## 15. Maintenance

Blueprints are data and are reviewed when a directory entry changes (the product list follows the directory's six-month re-check). No external data at run time.

## 16. AI ecosystem programme additions (2026-11-16)

Specified in `docs/ecosystem-review/ai-ecosystem/17-FINAL-DESIGN.md` section 5 (the build specification) and `16-DECISION-REGISTER.md`.

- **46 tasks**: `email-message` (Create content) and `doc-summary` (Research and analyse, no-fabrication) added; matrix in `18-TASK-BLUEPRINT-MATRIX.md`.
- **Start panel**: "Describe what you want to do" matched by `task-index.js` (fixed synonyms; best match, other possible tasks or "several could fit"; other AI tools offered when their job is named; the visitor always chooses); "Start from a playbook" (`playbooks.js`, ten starters, choices only); "Open a saved Work Pack" (file or paste, `ai-tools/common/pack-format.js`).
- **Links**: `?start=describe`, `?outcome=`, `?task=`, `?product=` (ids only).
- **Compiler**: project context block (labelled briefs only), consistency sheet for image, video and audio work (master prompt and every stage), placeholder-text conflict, requirement de-duplication, stage header naming the deliverable, prompt length and a note above 600 words.
- **Pack**: Everything / Prompts only; multi-stage stages folded after the first with Expand all; download `ai-work-pack-<task>-<date>.md` with the data comment (Copy unchanged); "Check the answer you get" hands the request to the AI Output Reviewer and a task seed to the AI Context Bridge in memory (`ai-tools/common/handoff.js`).
- Tests: `tests/unit/ai-ecosystem.test.mjs` (golden table of 60 descriptions, file format, playbooks, compiler additions).

## 17. Professions, tasks and tools (D18, 2026-11-17)

On the owner's direction the Workbench, not a new tool, gained "Start from your profession" (20 professions in 6 groups), 36 tasks in eight new families (marketing, business, people, education, design, operations, finance, legal), a registry of 71 professional tools mapped to 59 tasks, a tool step (several tools, none, recommend one, or another tool by name, with experience of each tool asked apart from experience in the job), tool-aware instructions and hand-offs in the master prompt, a context review above the Work Pack, and labelled local adjustments (shorter, more detailed, edit before copying). Work Pack files keep the profession and tools. Research, sources, rules and results: `docs/ecosystem-review/ai-ecosystem/20-ROLES-TASKS-TOOLS.md`. The task matcher now loads on first use and the tool code with the tool step, so the first load stays within D17.

## 18. Professional prompt engine (D19, 2026-11-17)

Each labelled task now has a professional method, written into the master prompt at the prompt detail the visitor chooses above the pack: Standard, Detailed (the default) or Very detailed, with word counts for each. Visitors can add edge cases, examples, step-by-step phases or detailed deliverables at any level, choose an answer format and tone, and return to the recommended prompt; "Make it shorter" and "Make it more detailed" step the detail. A 20-point prompt check runs by fixed rules (not AI). Domain safeguards (health, payments, personal data, security) follow the visitor's own words. Very detailed adds each tool's deeper practice and step-by-step hand-offs. A new task, "A business performance dashboard", serves the data analyst and business analyst. Work Pack files keep the prompt settings. Without a method the compiler output is unchanged. Design, sources and results: `docs/ecosystem-review/ai-ecosystem/21-PROFESSIONAL-PROMPT-ENGINE.md`; generated examples: `22-PROMPT-ENGINE-EXAMPLES.md`. First load: 49.9 / 14.6 kB added against the D17 budget of 50 / 16.

## 19. The guided single panel (D20, 2026-11-17 and 18)

The Workbench now opens on "What is your role?" with every profession and a search; the same panel then shows that profession's tasks, each essential question or choice as its own step, the optional questions together, the tools, the visitor and their project, the AI product and the prompt, with Back, Continue or Skip, Clear and Start over. The page around the panel does not change and nothing navigates. The full page ("Other ways to start", "Show everything on one page") keeps describing a task, playbooks, opening a saved pack and choosing by outcome; links with a task or outcome and hand-offs open it directly. First-load JavaScript added since the AI programme began: 41.3 / 12.8 kB against D17's 50 / 16 kB. Details: `docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md`.

## 20. Strategies, concise prompts and coverage (D21, 2026-11-18)

Each task can be done with a professional approach of its family, an emphasis and an audience; "Generate another approach" changes the methodology deterministically, without repeats, and keeps the task, answers and tools. Each prompt with a method has a concise version, either can lead, and any section can be copied on its own; Work Pack files keep the approach and the version. The domain (health, payments or banking, personal data) now changes the method itself where it matters. Two creative professions (22 in all) and five media tools (76 in all) were added, and 20 tasks with only a role and an approach were given their own methods. Coverage after the product-quality review and the quality batch: 21 Strong, 54 Adequate, 10 not applicable (one-paragraph media prompts), none Thin or Missing, of 85 tasks; a graphic design brief task was added and DaVinci Resolve checked (12 of 76 tools). A real-platform test set is prepared in `25` section 4, not yet run. Details: `24-STRATEGY-ENGINE.md` and `25-BENCHMARK-JOURNEYS.md`.
