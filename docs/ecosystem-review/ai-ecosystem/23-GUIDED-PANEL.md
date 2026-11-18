# 23. The guided single panel of the AI Workbench

Status: **built locally on 2026-11-17 and 2026-11-18, not committed** (base `3cafe100`). Decision: D20 in `16-DECISION-REGISTER.md`; policy: rulebook 4.11 (AI Workbench item).

## 1. What the visitor sees

The Workbench opens on **"What is your role?"** with every profession (22, in seven groups) and a search. Choosing one changes only the panel: the header, navigation, page background and the rest of the page stay as they are, nothing navigates and nothing reloads (a browser test checks the address, a marker set on the page and the header's position across a whole journey).

| Step | Shown when | What it is |
| --- | --- | --- |
| Role | Always first | Every profession as a button, grouped, with a search |
| Task | After a role | That profession's tasks only |
| One question | For each essential question and each choice | The question as the step's title; a choice is answered with one press |
| Anything else that helps | When the task has other questions | The optional questions together, "More details" opened |
| Tools | When the task has tools | The D18 tool step (several tools, none, recommend, another; experience per tool) |
| About you and your project | Always | Experience, project context, depth; the consistency sheet for image, video and audio work |
| Where will you use the prompt | Always | AI Directory products for the task, or your own |
| Your prompt | Last | The pack, opened on "Prompts only", with the D19 and D21 controls |

The progress line names the kinds of step this journey has (for example Role → Task → Details → Tools → You → AI → Prompt), never a fixed count. Back keeps every answer; Continue becomes Skip on an empty step; Clear empties the current step; Start over clears everything, including tools and refinements, so nothing reaches the next prompt. Changing the task keeps the answers both tasks ask for (for example "What is being tested" from a test plan to test cases) and nothing else.

"Other ways to start" and "Show everything on one page" switch to the full page, where describing a task, playbooks, opening a saved Work Pack and choosing by outcome work as before; "Back to the guided steps" returns. A link with a task or outcome, a hand-off from the QA Workbench or `?start=describe` opens the full page directly.

## 2. How it is built

The steps are the page's own form groups and pack, shown one group at a time (a `wb-off` class while the panel is in guided mode), so every field, rule and file format of the full page applies unchanged.

| Module | Loaded | Size (raw / gzip) | Job |
| --- | --- | --- | --- |
| `panel.js` | With the page | 4.1 / 1.7 kB | Professions, search, the first screen; loads the steps on the first press |
| `roles.js` | With the page | 5.1 / 1.8 kB | Professions and their tasks (their tools are in `tools.js`) |
| `panel-steps.js` | First press in the panel | 15.5 / 5.1 kB | Every later step, Back, Continue, Skip, Clear, Start over, the full-page switch |
| `playbooks.js` | "Start from a playbook" opened | 5.3 / 1.7 kB | Starters and their list |
| `view.js`, `pack-format.js`, `guide.js`, `method.js`, `strategies.js`, `tools.js`, blueprint and method families | A task chosen | see section 4 | The pack, files, tools, method and strategies |

Defect found and fixed: when the page was left by in-place navigation before the lazily loaded panel arrived, the panel wrote into a page that was gone (a QA Workbench hand-off test caught the error); the panel now starts only if the form is still on the page.

## 3. Accessibility and layouts

- Roles, tasks and choices are buttons with `aria-pressed`; the step title receives focus on each step (not on first load); the progress list marks the current step with `aria-current`.
- In a one-question step the field's label stays for screen readers (the visible title is the question).
- Tested with axe (WCAG 2.0 to 2.2 A and AA) at 390, 412, 820 and 1280 px, light and dark, on the role, task, question and prompt steps: no violations, no horizontal overflow. Automated checks only; no screen-reader or real-phone session was run.

## 4. Performance (D17)

Measured from the browser's requests on opening the page (preview build), gzip level 9, minus the same files at `7b339d7f`:

| | Before the split | After (2026-11-18) | Budget |
| --- | --- | --- | --- |
| First-load JavaScript added | 58.5 / 17.8 kB | 41.3 / 12.8 kB | 50 / 16 kB |

What made room: the pack view, the file format and the playbooks load when needed; the step logic loads on the first press; each profession's tools moved to `tools.js`.
