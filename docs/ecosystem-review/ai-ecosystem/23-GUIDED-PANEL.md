# 23. The guided panel of the AI Prompt Builder: one question at a time

Status: the guided single panel was built on 2026-11-17 and 2026-11-18 (D20) and made conversational by D22. On **2026-11-19** the owner's master brief replaced the conversation with **one question at a time** (D23 in `16-DECISION-REGISTER.md`; policy: rulebook 4.11). Built and verified locally, **not committed** (base `65b4a67b`).

## 1. What the visitor sees

Open → choose your role → choose your task → answer only the questions that task needs → add optional details → Generate → copy, edit, refine or reuse. Each step **replaces** the one before it in the same panel; the page around it (header, sidebar, information sections) does not change, nothing navigates and nothing reloads.

| Step | Shown when | Control |
| --- | --- | --- |
| What best describes your role? | Always first | One searchable list (combobox): the 22 professions grouped by area, each with its number of tasks, and "My role is not listed" at the end. The explanation says the role decides which tasks are suggested first and how the prompt is written, and that it can be changed at any time |
| What would you like help with? | After the role | "Your role: … Change role" above one searchable list: "Suggested for <role>" and "Any other task" (every task, by outcome, when the role is not listed). Typing searches every task by its words and through `task-index.js` ("Best matches", the role's own tasks first, then "All other tasks" and "Not in the list"); three or more typed words also answer the task's first essential question, where it is empty |
| One question | For each question of the task that is not a "more" question, in the blueprint's order, recomputed after every answer (conditional questions appear and disappear) | A choice: one button per option, pressing one moves on. A typed answer: Continue (Skip, or "Skip for now" for an essential, while empty); Enter in a one-line answer is Continue |
| Which tools do you use for this? | When the task has tools | The D18 tool step (several, none, recommend, another; experience per tool) |
| Anything else we should know? | Always, last | Project details (up to 8,000 characters), prompt length (Concise, Standard, Detailed, Very detailed) for tasks with a method, experience, AI product (one select from the AI Directory, or another by name); folded: "More details for this task" (the deeper questions), "More options" (parts to add, stages), the consistency sheet for image, video and audio work, and the project context pack |
| Your prompt | After Generate my prompt | The result: what it is for (role · task), Copy prompt, Edit prompt, Download .md, Reuse selections, New prompt, essentials still missing as buttons that reopen their question, the prompt settings folded (detail, concise or full, another approach, refine), then the pack on "Prompts only" |

**The trail.** Above the question, every step reached so far is a button showing its answer ("QA engineer or software tester › API tests › Banking API… › Skipped › …"), the current step marked with `aria-current="step"`. Pressing one reopens that question with its answer kept and Continue offered; each shows its full text as a tooltip. After every step change the panel's top is scrolled clear of whatever is stuck to the top of the window (on a phone, the header and the section menu), so the trail and the chosen role stay in sight. On a phone the trail is one row that scrolls sideways inside itself, kept on the current step; the page never scrolls sideways. It is a step trail inside the tool, not the page breadcrumb of rule 4.6 (which is unchanged). It replaces the D22 conversation and the D20 step list: there is one progress system.

**Changing an earlier answer.** A role that also lists the chosen task keeps it with every answer. A role that does not list it asks for the task again (the old answers stay in the form; a newly chosen task keeps only the answers both tasks ask for, shown in their own steps, never silently). A choice that makes a later question irrelevant removes that step; its typed value is kept but not used in the prompt. Nothing typed is discarded by navigation.

**Generate.** Writes the pack from the same compiler as the full page. With nothing answered it refuses, says so in the final step (`role="alert"`) and offers the first question; a missing essential is written as `[add: …]` (never invented) and listed in the result with a button to answer it. A failure to write the pack leaves every answer in place and asks to press again.

**Edit.** "Edit prompt" opens the edit box under the main prompt. The edit is kept when an answer or setting rewrites the pack (with a note and "Replace my edit with the new prompt"); Copy prompt then copies the edit, and the download adds it as "Your edited prompt". It is never stored; New prompt and Reuse selections clear it.

**Reuse selections** keeps the role, the task, every answer, the tools and the prompt preferences, clears the project details, the consistency sheet and any edit, and opens the task step with Continue, so the visitor changes only what differs. **New prompt** clears everything, including the prompt settings, so nothing reaches the next prompt.

"More ways to start" (first screen) and "Show everything on one page" switch to the one-page form, where describing a task, playbooks, opening a saved Work Pack and choosing by outcome work as before; "Back to the guided steps" returns, offered at the top of the one-page form as well as at its end, and the role, the task and every answer are kept both ways.

**Words (2026-11-20, owner's UX review).** The step explanations say what to do in plain words: a needed answer says "Needed for a useful prompt. If you leave it blank, the prompt asks the AI to request it from you before it starts"; an optional one "Optional. Skip it if it does not apply or you do not know yet"; the task's name is no longer repeated in each question (the trail shows it). The testing tasks ask "What are you testing?". Spacing: the panel follows the introduction with the introduction's own gap (as on the AI Answer Checker), the explanation is apart from the field, and a field's hint and the buttons share one gap.

**Test scenarios and test cases (2026-11-20).** An optional "Website or web app to explore" question. With a site there (or a web address or a name such as "amazon.in" in the description; library names such as ASP.NET or socket.io are not taken for sites), the prompt asks the receiving AI to open the site first if it can browse, inspect and follow the related flows without real orders, payments, accounts or messages, label each scenario Observed or Assumed, list what it could not reach, never invent features, and say in its first line if it cannot browse. The Prompt Builder itself does not browse. Always: every expected result is exact (message, value, status or page); a case whose result depends on an unconfirmed rule is marked "Blocked – Requirement Confirmation Needed" with the exact question, apart from the executable cases; provisional results only as "Assumption:". Links: `?task=` and `?role=` continue in the steps; `?outcome=`, `?start=describe` and `?start=context` open the one-page form.

## 2. How it is built

The form in `index.js` stays the **one store of every answer**: the steps show its own fields one at a time (a `wb-off` class in guided mode), so every rule, the compiler, the blueprints, the methods, the file format and the hand-off to the AI Answer Checker are unchanged. The page is drawn in its guided state (so nothing moves when the script starts); the one-page form removes `wb-off` when it is chosen or when the steps cannot load.

| State | Where it lives |
| --- | --- |
| Role, chosen or "not listed" | `panel-steps.js` (`role`, `roleChosen`); the role's title in the form's role field for the prompt |
| Task, answers, tools, experience, product, project details, consistency | The form fields (`index.js`) |
| Prompt length, version, approach, parts, format, tone | The prompt controls (`guide.js`); the final step's chips write into them and are redrawn from them |
| Current step, steps reached, generated | `panel-steps.js` (`current`, `visited`, `generated`); the plan is recomputed from the answers each time |
| Generated pack, the visitor's edit | `state.pack`, `state.edit` in `index.js` |

| Module | Loaded | Job |
| --- | --- | --- |
| `panel.js` | With the page | The first screen; loads the list behaviour on the box's first use and the steps on the first choice |
| `picker-markup.js` | With the page | The list's box and hint as markup, built into the page |
| `picker.js`, `roles.js` | First use of the role box | The searchable list (ARIA combobox and listbox, keyboard, filter) and the professions it lists (the first screen's hint counts them with `ROLE_COUNT`, kept equal to `roles.js` by a unit test) |
| `pack-io.js` | First download or opening of a pack | Writing the Work Pack file with its data comment, and opening a saved one again |
| `panel-steps.js` | First choice | Every later step, the trail, Generate, Reuse, New prompt, the full-page switch |
| `task-index.js` | First words typed into the task search | The fixed-synonym matcher |
| `view.js`, `guide.js`, blueprints, methods, `pack-format.js` | A task chosen | The pack, controls, files |

## 3. Accessibility

- The lists follow the ARIA combobox pattern: `aria-expanded`, `aria-controls`, `aria-activedescendant`, options grouped with labelled `role="group"`; Arrow keys, Page keys, Enter, Escape and Tab; the number of matches is announced in the page's one polite status region; the current choice is marked in words, not by colour alone.
- Each step's title is the question and receives focus when the step changes (not on first load); a one-question field keeps its own label for screen readers; choices are buttons with `aria-pressed`; Generate's refusal is a `role="alert"` message.
- The trail is a `nav` named "Your selections", each answer a button whose name says the step, the answer and "Change".
- Touch targets: list options, chips and trail buttons are at least 44 px tall on touch screens; the step's main button takes its own row on a phone.
- Tested with axe (WCAG 2.0 to 2.2 A and AA) at 320, 360, 390, 430, 820 and 1280 px, light and dark, on the role list open, the task list open, a question, a choice, the final step and the prompt: no violations, no page-level horizontal overflow. Automated checks only: no screen-reader, real-phone or Safari session was run.

## 4. Performance (D17)

**Method (reproducible).** The method of `17` §16: all JavaScript the page adds on first load, unminified source with LF line ends, raw / gzip (Node's default level), each file against its own path at `7b339d7f` (a `prompt-builder/` file against `ai-workbench/`, since an older tool used that path then). First load is the static import graph of `index.js` plus `panel.js`, which `index.js` loads as the page starts; the site-wide catalogue (`data/tools.js`, `categories.js`, `tool-capabilities.js`), which every page loads, is left out. The method gives exactly the recorded 41.4 / 12.8 kB at `99530433`.

| Measure | Result (2026-11-19) |
| --- | --- |
| First-load JavaScript added, D17 budget 50 / 16 kB | `99530433` (D21): 41.4 / 12.8. `65b4a67b` (D22): **48.1 / 14.6** (the 41.3 / 12.8 repeated in later notes was the D21 figure). This redesign before trimming: **54.4 / 16.6, over the budget**. After trimming: **46.7 / 14.2, within it** (with the slow-connection fix); **47.4 / 14.4** after the 2026-11-20 wording and role-line changes |
| The trim | `roles.js` (5.2 / 1.8) loads with the list instead of with the page; writing and opening a pack file (`pack-io.js`, 3.0 / 0.9 out of `index.js`) loads with the first download or opening. Nothing the visitor sees changed |
| Layout shift on load | 0.0001 (was 0.3247: the page was drawn as the one-page form, then hidden; fixed by drawing the guided state) |
| Writing the pack after a change | 3.8 to 5.0 ms per change (20 changes, API tests) |
| JavaScript heap after a journey | about 5 MB |

## 5. Tests

`tests/browser/prompt-builder-guided.spec.js` (the journeys, the trail, edit, copy, download, reuse, new prompt, the list by keyboard, links, role and task changes, refusal and missing essentials, length and settings, playbooks, old files, six widths with axe in both themes), `prompt-builder.spec.js` and `prompt-builder-professions.spec.js` (the one-page form), `ai-ecosystem.spec.js`; `tests/unit/prompt-builder-flow.test.mjs` (all 22 professions and 90 tasks: every task has a first question, answered gives a ready prompt with no `[add: …]` and every answer in it, unanswered is the state Generate refuses; the list filter; API test, design and documentation wording).

## 6. Known limitations

- The visitor's edit of the prompt is not restored when a downloaded Work Pack is opened again (the file keeps the answers; the edit is in the text only).
- The full page shows the final step's length chips and the prompt settings together: two views of one setting.
- Nothing is kept across a reload (rule 7.7); Reuse works within the visit.
- No real-device, screen-reader or Safari check has been made.
