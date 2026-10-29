# 11 Tool page experience requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Requirement IDs refer to doc 17. Principle: **one shared frame and one shared design layer, with a different working area for each kind of tool.** Rulebook 7.5 ("one design layer") and 9.4 ("share only real duplication") apply; no generic "render a tool from config" layer is proposed.

## Shared frame (TX-01, GL-07)

Order, top to bottom: breadcrumb; eyebrow (section label, 12 px caps in the accent colour); h1; one-line description; **a privacy or processing note specific to the tool** (replaces the generic "100% Free to Use" badge, F-18); the working area; explanation and examples; FAQ; related tools (pilot, GL-06); related articles where curated.

| Aspect | Specification |
| --- | --- |
| Header block | title and description on the left, the privacy note on the right at 960 px and wider; stacked on phones |
| Spacing | 16 px between breadcrumb and eyebrow, 8 px eyebrow to h1, 12 px h1 to description, 24 px to the working area (today the breadcrumb is tight and the gap below is large) |
| Widths | reading 720, standard 1120, workspace up to 1440 (GL-08) |
| Landmarks | one `h1`, one `main`; working area is a labelled region where it has several panels |
| Privacy note | one sentence, true of that tool (rulebook 3.4, 8.8): for example "Your JSON is processed in your browser" (exists today) or "Files stay on your device" for the PDF tools, only where the tool spec says so |

## Layouts by family

| Family | Layout | Width class | Notes (requirement) |
| --- | --- | --- | --- |
| **Financial calculators** (19) | inputs left, sticky result right at 960 px and up; result after inputs on phones with a "Jump to result" link; headline result is the largest element, tabular numerals; assumptions next to every figure; labelled estimate text under projections (rulebook 3.7) | standard 1120 | TX-02. Auto-calculating tools keep no Calculate button (IX-03). **No formula or validation change** (QA-08) |
| **Time tools** (13) | tool-specific: clocks, timers, planners; digits tabular and fixed-width; ticking never shifts layout; World Clock may use the workspace width | standard, World Clock workspace | TX-04. Idle timers stay stopped when hidden (rulebook 7.4). World Clock DOM (3,370 nodes) must not grow |
| **Developer tools** (12 plus lab family) | two panes at 960 px and up; actions directly under the input; output pane height follows content with a bounded minimum; monospace 14 px; long output scrolls in its region | workspace 1440 | TX-03. Primary action visible without scrolling at 1280x800 and 390x844 (today at the fold, F-14) |
| **Smart Flashcards** | deck chooser, one card, "Show answer" reveal, rating buttons, progress text, opt-in saving panel; no flip animation, no streaks or points | reading-plus (720) for the card | TX-07. Storage contract `tz-learn-v1`, 100 KB, opt-in, unchanged (rulebook 7.7 exception) |
| **Practice Labs** (4) | task statement, editor or input, one Check action, verdict region (text plus icon), hint and reset | workspace | TX-06. Evaluation logic untouched; polite status region; no focus movement on Check |
| **Image tools** (2) | choose files button, preview list, controls, action, result, download | standard | TX-05. Processing engines untouched |
| **PDF tools** (3) | choose files button (never drop-zone only), ordered file list with remove, explicit action ("Merge", "Split"), progress, download; honest local-processing note | standard | TX-05. Byte-for-byte PDF output unchanged on fixtures |

## Controls, actions and states in tools

- **Primary action** filled; **secondary** outlined (Reset, Copy, Download); **destructive** outlined in the error colour and placed away from the primary (IX-01). Reset and Download look enabled whenever they are enabled (IX-02).
- **Input** controls at 44 px with a 3:1 border, label above, hint and error linked (IX-04). Units sit inside the field.
- **Results** are text first: figure, label, assumptions; copy buttons announce "Copied" in text (IX-08).
- **Errors** are specific and located; the visitor's input is never altered (rulebook 8.6 and 7.6).
- **Status** is announced through the tool's one polite region, never per keystroke (rulebook 7.3).

## Explanations, FAQ, related content

Explanation and FAQ stay in the static HTML (QA-04). FAQ becomes native `details` (CT-04, P1). Related tools appear only where intent genuinely overlaps, same section only (GL-06, rulebook 4.2 and 6.3); a tool with no relation renders no panel.

## Preserved without change

Financial formulas and validation; live clocks and timer engines; JSON, JSONPath, cron and diff evaluators; PDF and image engines; flashcard scheduling and storage; practice-lab answer evaluation; every route. These are protected by a path-diff gate (QA-08).
