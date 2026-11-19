# Tool Pack 59: QA Requirement-to-Release Workbench

Status: **retired 2026-11-18 (AI consolidation, decision D22)**: the tool, its tests and its stylesheet were removed; `/tools/qa-workbench/` redirects to the AI Prompt Builder's QA tasks (`/tools/prompt-builder/?role=qa`) and the id stays reserved. The QA project records it kept are discontinued, not moved (`docs/ecosystem-review/ai-ecosystem/26-CONSOLIDATION.md` section 2). This pack is kept as the record of what was built (it was committed at 3cafe100 and shown on the preview).      Previous status: built locally (P1-P7 of section 14)      Base commit: 89f3e604      Section `ai-tools` (category `ai`); tool `qa-workbench` (route `/tools/qa-workbench/`)

Owner direction, 2026-11-17: one focused tool for small QA teams, manual and automation QA professionals, that manages one connected workflow, **requirement → test cases → traceability and coverage → execution → defects → QA report**, inside AI Tools. It must stay useful without any AI product; AI help is optional and reuses the existing AI tools. The core differentiation is reliable requirements traceability, deterministic coverage, explicit execution records and a trustworthy report. The architecture was mapped read-only against the code at `89f3e604` before this spec was written; every reuse point below was checked in that checkout.

This pack is the specification required by rule 9.5. The owner's master execution directive of 2026-11-17 authorised the whole implementation (section 14) without a stop between phases; committing, pushing, merging and deploying still need their own approval (rule 11). What was built and tested is in section 16.

## 1. Tool identity

| id | Title | Section | Type | One sentence |
| --- | --- | --- | --- | --- |
| `qa-workbench` | QA Requirement-to-Release Workbench | ai-tools (category `ai`) | utility | Keep one QA project's requirements, acceptance criteria, test cases, mappings, test runs and defects together, see exactly what is mapped, run and passed, and download a report and the project file. |

Sidebar group: "Test and release" (a new entry in `SECTION_GROUPS["ai-tools"]`, `assets/js/components/section-switcher.js`).

## 2. User problem and the AI-era test (rule 1.4)

QA engineers keep requirements in one place, test cases in a spreadsheet or a chat answer, run results in another sheet and defects in a tracker, and rebuild the coverage picture by hand before every release. Coverage claims are made without a stated denominator, mapped requirements are reported as tested, and generated test cases are pasted in without anyone checking what they cover. An assistant cannot be trusted to keep exact counts across many records or to remember which run is the latest; this tool keeps stable ids and calculates every total deterministically from the records the visitor accepted and recorded. It is private (nothing leaves the browser) and repeatable (the same file gives the same report).

## 3. Primary jobs

- "Which acceptance criteria have no test case?"
- "Which criteria have been run, and which passed, failed or are blocked, for this build?"
- "Which failed tests have no defect, and which defects are still outstanding?"
- "Give me a QA report I can send, with numbers I can defend."
- "Let a teammate open the same project from a file."

## 4. Where it lives and what is not created

One tool page in AI Tools (QD1, QD2, rule 4.11 item f). Not created: a new section, a separate QA navigation, a page per stage, a scenario builder, API or automation workspaces, dashboards, accounts, a backend, cloud storage, browser storage, Jira or Azure DevOps integration, remote or autonomous test execution, a readiness score (QD9, QD13, QD14).

## 5. Decision register (QD1-QD32)

QD ids are separate from the AI ecosystem programme's D1-D17 (`docs/ecosystem-review/ai-ecosystem/16-DECISION-REGISTER.md`). QD1-QD10 keep the meanings they were first given; later decisions are numbered from QD11.

### 5.1 Selected by the owner

| ID | Decision |
| --- | --- |
| QD1 | The Quality Workbench remains inside AI Tools. |
| QD2 | One focused QA workflow tool. |
| QD3 | File-only persistence. |
| QD4 | The existing Markdown work-pack format. |
| QD5 | Requirements traceability is the core differentiator. |
| QD6 | Deterministic coverage calculations. |
| QD7 | AI assistance reuses the existing hand-off infrastructure. |
| QD8 | Human acceptance is required for AI suggestions. |
| QD9 | No autonomous test execution in the MVP. |
| QD10 | Small-team file exchange, not live collaboration. |
| QD11 | No provider API: AI help only by copy and paste and by in-tab hand-offs. |
| QD12 | A test result is recorded only by the user; an AI never marks a test passed or supplies an actual result. |
| QD13 | Jira and Azure DevOps integration and remote Playwright execution are deferred. |
| QD14 | The MVP is one page with seven stages (Overview, Requirements, Test cases, Coverage, Execution, Defects, Report) and the exclusions of section 4. |
| QD29 | Rule 4.11 is amended for the placement, the `qa-project` file kind and item (f) (owner approval 2026-11-17). |
| QD30 | Temporary in-tab memory of the open project (section 9). No localStorage, sessionStorage, IndexedDB, cookies or other browser persistence; it is never described as saved (owner approval 2026-11-17; rule 4.11 item d, rule 4.8). |
| QD31 | File and record limits of section 11, **provisional**: they become final only after timing on a real Android phone and a real iPhone (owner approval 2026-11-17). |
| QD32 | Declined for the MVP: an unsaved-project warning shown on other AI pages (it would need shared code outside the tool). |

### 5.2 Technical decisions accepted with the implementation plan

| ID | Decision |
| --- | --- |
| QD15 | File kind `qa-project` with `schema: 1`; a file with another kind, or a missing, non-integer or higher schema, is refused. |
| QD16 | `readMeta` and `readFile` in `assets/js/tools/ai-tools/common/pack-format.js` gain an optional maximum size; the default stays 200 kB, so every existing caller is unchanged. |
| QD17 | A QA-owned validator; `pick` is not used (it keeps at most 20 list items and drops arrays inside items). |
| QD18 | Ids `REQ-001`, `AC-001`, `TC-001`, `MAP-0001`, `EX-0001`, `DEF-001` from per-type counters that only increase; an id is never reused. |
| QD19 | An item that something refers to is retired, not deleted; an unreferenced item may be deleted after a confirmation. |
| QD20 | An opened file is accepted whole or refused whole, with the errors located by record id; unknown fields are ignored and listed. |
| QD21 | The calculation definitions of section 8. |
| QD22 | CSV hardening of section 7. |
| QD23 | Tool id `qa-workbench`; sidebar group "Test and release". |
| QD24 | Page budget about 40 kB raw / 13 kB gzip of added JavaScript (the per-page pattern of D17). |
| QD25 | Acceptance criteria are sent straight to the Output Reviewer, not through the Workbench (section 10). |
| QD26 | Two small receivers in published tools: the Workbench takes a `task` hand-off, Bug Report takes a `bug` hand-off. |
| QD27 | The Output Reviewer's repeated review per keystroke (AI programme finding 1) is fixed before the Reviewer hand-off ships (phase P6); it is not needed for P1-P5. |

### 5.3 Technical requirement directed by the owner (2026-11-17)

| ID | Decision |
| --- | --- |
| QD28 | A page-level `beforeunload` warning while the open project has changes that are not in a downloaded file (owner's master execution directive, 2026-11-17: "implement it"). The tool adds the listener only while there are such changes and removes it after a download; `ui/tool-scope.js` removes it when the visitor leaves the page in place. Browsers decide whether to show it (section 9). |

## 6. Data model

Records are plain objects; every reference is by id.

| Record | Id | Fields (* required) | Relationships |
| --- | --- | --- | --- |
| Project | (the file) | `name`*, `description`, `feature`, `build`, `environment`, `owner`, `scope`, `createdOn`, `updatedOn`; the file also holds `next` (one counter per id type) and `savedOn` | |
| Requirement | `REQ-001` | `title`*, `description`, `source`, `priority` (high, medium, low), `state` (active, retired), `createdOn`, `updatedOn` | owns criteria |
| Acceptance criterion | `AC-001` | `reqId`*, `text`*, `notes`, `status` (accepted, needs clarification, excluded), `reason` (required when excluded), `state` (active, retired) | one requirement |
| Test case | `TC-001` | `title`*, `objective`, `pre`, `data`, `steps`* (ordered `{ action, expected }`, at least one action), `expected` (required unless a step has one), `priority`, `type` (positive, negative, boundary, validation, integration, regression, exploratory, security, usability, or none), `area`, `automation` (a reference or status), `origin` (typed, ai), `state` (active, retired) | |
| Mapping | `MAP-0001` | `acId`*, `tcId`*, `createdOn` | one record per criterion and test case pair (many-to-many); a duplicate pair, or a retired end, is refused |
| Test run | `EX-0001` | `tcId`*, `status`* (pass, fail, blocked), `actual` (required for fail and blocked), `build`, `environment`, `tester`, `executedOn`* (defaults to now, editable), `notes` | many per test case |
| Defect | `DEF-001` | `title`*, `description`, `steps`, `expected`, `actual`*, `severity`* (critical, major, minor, trivial), `priority`*, `status` (open, fixed awaiting retest, deferred, closed), `reason` (required when deferred), `environment`, `build`, `reporter`, `assignee`, `tcIds`, `exIds` (the runs it came from), `resolution`, `history` (each status with its date) | many-to-many with test cases and runs |

"Not run" is never recorded; it is the absence of a run in the chosen scope. Totals are never stored; they are calculated (section 8). The link between a run and a defect is kept once, on the defect (`exIds`). AI suggestions are not records: they are held on the page until the visitor accepts one, which then becomes an active test case with `origin: "ai"` (a discarded one leaves nothing in the project or the file).

**Ids and counters (QD18).** A new record takes the next number of its type; the counter only increases, so a deleted id is never given again. When a file is opened, each counter becomes the larger of its stored value and the highest id of that type plus one; no record changes, and a note says so if a counter moved. Two people editing copies of one file can create the same new id; the MVP has no merge (QD10), and the page says so.

**Retire and delete (QD19).** A requirement, criterion or test case that nothing refers to can be deleted after a confirmation (a requirement with its unmapped criteria). One that is referenced (a criterion or case with mappings, a case with runs or defects, a requirement with mapped criteria) can only be retired: it is kept, listed, and left out of every total, and can be restored (a criterion only while its requirement is active). A requirement's retirement takes its criteria out of the totals. A test run can be deleted, after a confirmation that says it is for runs recorded by mistake, only while no defect refers to it; defects are never deleted (they are closed or deferred). A copied test case gets a new id and no mappings, runs or defects.

## 7. The project file (QD3, QD4, QD15-QD17, QD20)

**Format.** The existing AI Tools file (rule 4.11 c; `pack-format.js`): readable Markdown, then one comment `<!-- toolzenhub:{json} -->` written by `withMeta`, which escapes `<` and `>` inside the JSON so the data can never close its comment. `readMeta` reads the last such comment, so text earlier in the file cannot override the data. Only the comment is read when a file is opened: edits made by hand to the Markdown are not imported, and the page says so. The data is `{ kind: "qa-project", schema: 1, project, requirements, criteria, testCases, mappings, executions, defects }`. File name: `qa-project-<slug>-<date>.md` (`slug`, `today`). Copy never includes the comment (rule 4.11 c).

**Markdown body.** The project in readable form: overview, requirements with their criteria and mappings, test cases with steps, every test run, and defects. The QA report is a separate download. Visitor text that contains `<!--` or `-->` is neutralised in the body so a Markdown viewer does not hide the rest of the file.

**Opening (whole file or nothing, QD20).** Refused, with the reason in words, when: the file is larger than the limit; it has no data comment, or the comment is cut short or unreadable; `kind` is not `qa-project`; `schema` is missing, not an integer or higher than 1; an id is malformed or repeated; a reference points to no record; a value is outside its list; a required field is empty; a record limit is exceeded. The first ten errors are listed by record id, then a count. Nothing is repaired. Unknown fields are ignored and listed. Opening a file over a project with changes that are not in a downloaded file asks for confirmation first. Files over 200 kB are opened through the file picker only; the paste box stays at 200 kB.

**CSV (QD22).** Downloads for the traceability records, test cases, runs and defects. Every cell is quoted and inner quotes are doubled; lines end with CRLF; a cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return is prefixed with `'` so a spreadsheet does not run it as a formula. The download starts with a UTF-8 byte-order mark so Excel reads ₹ and accented text correctly (the calculator CSVs have none; they hold numbers). Opened in Microsoft Excel on 2026-11-17 (Office 16, by automation): all four files open with the right rows and columns; ₹, accents and symbols, commas, quotes and line breaks inside cells are kept; no cell becomes a formula, and a neutralised cell shows its leading apostrophe. Excel itself turns number-like text into numbers when it opens a CSV, so a build label such as "1.0" displays as "1" (the file still holds "1.0"); to keep it, import with Data › From Text/CSV and set that column to Text.

## 8. Calculations (QD6, QD21)

Pure functions over the records; the same file always gives the same numbers. Values are calculated unrounded and rounded only for display (one decimal place for percentages).

**What counts.** A *counted test case* has `state = active`; retired cases count nowhere (their history stays visible), and AI suggestions are not records until accepted. A *counted criterion* has `status = accepted` and an active requirement; criteria that need clarification, excluded criteria (with their reason) and the criteria of retired requirements are listed beside the totals, never inside them.

**Scope and the latest run.** A report's scope is one build label or all builds, and the report states it. A case's *latest run in scope* is its run with the latest `executedOn` in that scope, ties broken by the higher EX number.

| Measure | Definition |
| --- | --- |
| Mapped criteria | counted criteria with at least one mapping to a counted test case, shown as "n of N" and as a percentage of N. With N = 0 the page says "No accepted criteria", never 0 % or 100 %. |
| Requirement mapping | fully mapped (every counted criterion mapped), partly mapped, not mapped, or "no accepted criteria". The word "covered" is not used for mapping. |
| Criteria with an executed test | counted criteria where at least one mapped counted case has a latest run in scope of pass or fail. |
| Criterion result | **failed** if any mapped counted case's latest run is fail; else **blocked** if any is blocked; else **passed** if every mapped counted case passed; else **partly run** if some passed and some have no run; else **not run**. |
| Test case totals | pass, fail, blocked, not run (no run in scope), over counted test cases. Invariant: the four sum to the number of counted test cases. |
| Passed | always two lines, never one "pass rate": "Passed n of N active test cases" and "Passed n of m executed (pass and fail)". Blocked cases are not executed. |
| Defects | outstanding = open plus fixed awaiting retest; deferred (with reason) and closed are shown separately. A defect linked only to retired cases still counts. Failed cases with no linked defect are listed. |

A mapped criterion is never shown as tested, and a tested one is never shown as passed. There is no combined readiness score; the report presents counts and lists for a person to judge.

## 9. Saving, and the open project in the tab (QD3, QD28, QD30, QD32)

**Saving is downloading.** The only way to keep a project across a reload, a full page load, closing the browser or the browser discarding the tab is to download its Markdown file and open it again. A project bar at the top of the tool always shows the project name and either "Not saved to a file" (with when it last changed) or "Downloaded at <time>", beside a **Download project** button. Every action that sends work to an AI or to another tool sits beside Download project, with one line saying that a phone may close a background tab while the visitor is in an AI app.

**Temporary in-tab memory (QD30).** The open project is held in a module in the tool's own folder (`assets/js/tools/qa-workbench/session.js`). The workspace re-imports only the tool's entry module with a new query string (`ui/tool-mount.js`); a module it imports by a relative path resolves to the same address and keeps its state, which is how the existing AI hand-offs survive the move between tools (`ai-tools/common/handoff.js`). So the project is there again when the visitor comes back to the tool by a link or by Back and Forward between AI Tools pages shown in place. It is not saving: nothing is written to localStorage, sessionStorage, IndexedDB, cookies or any other browser storage, and the project bar keeps saying "Not saved to a file". This is proved in the browser on the desktop and mobile projects (`qa-workbench.spec.js`): the project is still open after moving to the Output Reviewer and to the AI Workbench in place and coming back by Back and Forward, in the same document, and is gone after a reload.

| Event | The open project |
| --- | --- |
| A link within AI Tools, shown in place | kept in the tab |
| Back or Forward between AI Tools pages shown in place | kept in the tab |
| Back or Forward to a page of another document | gone (a browser may restore the page from its back-forward cache; this is not relied on) |
| Reload, or a full page load (another ecosystem, the header, the workspace's fallback to a normal load) | gone; on the QA page itself the QD28 warning asks first on browsers that show it |
| Reload or close while on another AI page | gone, without a warning (QD32 declined) |
| The browser or tab is closed, or the phone discards the tab | gone; no warning is possible |
| A new tab | starts empty; each tab has its own memory |

`beforeunload` is not shown reliably on iOS Safari and only under conditions on Chrome Android; both are checked on real devices (section 13), and the downloaded file is the protection on phones.

## 10. AI help (QD7, QD8, QD11, QD12, QD25-QD27)

All AI help is optional and text only, in an "AI help (optional)" disclosure on the Test cases stage and a "Debugging prompt" link on each defect. Nothing from an AI changes a recorded result, an accepted requirement or an accepted criterion; it arrives as a suggestion the visitor accepts, edits then accepts, or discards, one at a time. As built (2026-11-17; each flow verified end to end in the browser, section 16):

| Flow | Sending side (`qa-workbench/ai.js`) | Receiving side |
| --- | --- | --- |
| Criteria to the Output Reviewer | `put("review", { request, task: "test-cases", title })`: the accepted criteria of one requirement listed last, under `## Acceptance criteria`, which `extractRequirements` reads item by item | the Reviewer's existing `wire` (unchanged): fills the request, sets the review type "testing" |
| Requirements to the AI Workbench | `put("task", { task: "test-cases", answers: { feature, requirements } })` | new in `ai-workbench/index.js`: `take("task")` opens the task through `selectTask` with the answers (text only, each cut to 8,000 characters) and says where they came from |
| Workbench to Reviewer | (the Workbench's own "Check the answer") | not used for traceability: in the master prompt the criteria sit inside "Context", and the Reviewer checks the blueprint's generic lines instead (QD25) |
| A request for test cases | "Copy a request for test cases": one requirement, its accepted criteria, the active cases that already cover them, and the fixed table columns Covers, Title, Type, Priority, Preconditions, Test data, Steps, Expected result | the visitor's own AI product |
| AI test cases into the project | the visitor pastes the answer; the first Markdown table is read by its column headings; criterion ids that are not active criteria of the project are left out and named | each row is a suggestion until accepted; an accepted one is mapped to the criteria it named |
| Defect to Bug Report | `put("bug", { observed, expected, steps, environment, evidence })` | new in `bug-report-prompt/index.js`: a `wire` hook that takes `bug` and fills only empty fields |
| Context Bridge | none | not used; its `seed` hand-off sets the project name to a task title (AI programme finding 5) |

Before a hand-off the AI module is already loaded on the Test cases and Defects stages, so the payload is put on the click and the workspace shows the other tool in place; the open project stays in the tab (section 9). The Output Reviewer works out its review once per change instead of three times (QD27; `ai-answer-checklist/index.js`).

Limits a sender respects: the Reviewer request field holds 12,000 characters and its review lists at most 40 requested items (`MAX_REQUIREMENTS`), so criteria go one requirement at a time; the Workbench requirements answer holds 8,000 characters. Text over a limit is cut and the page says so. Links never carry the visitor's text (rule 4.11 d).

## 11. Limits (QD31, provisional)

| Limit | Value |
| --- | --- |
| Project file | 3 MB |
| Requirements | 100 |
| Acceptance criteria | 400 |
| Test cases | 500 |
| Runs | 2,000 |
| Defects | 200 |

Evidence so far, measured in Node on 2026-11-17 with realistic text (five steps per case; the Markdown body about three quarters of the JSON): 10 requirements, 40 criteria, 50 cases, 100 runs and 10 defects make a file of about 201 kB; 30 / 120 / 150 / 300 / 30 about 601 kB; 50 / 200 / 300 / 600 / 50 about 1.17 MB; 100 / 400 / 500 / 1,500 / 100 about 2.25 MB. Parsing the largest took under 50 ms. Built and measured in the browser on 2026-11-17 (`qa-workbench.spec.js`, a project at every limit with five steps per case, desktop Chrome on this 4 GB laptop with the CPU slowed four times): the file is 2.4 MB; across six runs opening it took 3.1 to 4.6 s, each stage drew in 0.4 to 3.2 s, and a search of 500 test cases took 1.2 to 3.0 s (the range follows how busy the laptop was; the later runs include the split into stage modules). That is usable but slow at the top of the range, and it is emulation, not a phone: the limits stay provisional until timed on a real Android phone and a real iPhone.

## 12. Screens

One page; the seven stages switch inside it with buttons marked `aria-current` (not separate URLs), so the workspace navigation is not involved. Wide screens: a row of stage buttons with record counts. Below 700 px: a full-width stage select. Previous and Next follow every stage; opening a stage moves focus to its heading. The project bar (section 9) stays above every stage. On the Test cases stage, the less used filters (state, type, priority, mapping, sort) sit in a "Filter and sort" disclosure. Requirements and test cases are disclosures that keep their open state while the visitor works.

| Stage | Main content | Primary actions | Required | Empty state | Checks shown |
| --- | --- | --- | --- | --- | --- |
| 1 Overview | name, application type, QA mode, environments, constraints; record counts | New project, Open project file, Download project | name | "Start a project or open a project file." | file errors listed by record id |
| 2 Requirements | requirements, each with its criteria and their status | Add requirement, Add criterion, Retire | requirement title; criterion text; reason for an excluded criterion | "Add the first requirement." | a repeated title is a warning, not an error |
| 3 Test cases | cases; an editor with ordered steps (action, expected result) | Add case, Add step, Move step, Import AI suggestions | title; at least one step with an expected result | "No test cases yet." | missing expected result; a title very similar to another case's (word overlap, advisory only) |
| 4 Coverage | one record per criterion: its cases and its mapping status | Map, Unmap, Download CSV | | "Accept a criterion first." | unmapped criteria listed first |
| 5 Execution | one card per counted case: latest run in scope and history | Record a run | status; actual result for fail and blocked | "No active test cases to run." | a failed run offers Create defect |
| 6 Defects | defects with linked cases | Add defect (filled from a failed run), Link cases, Send to Bug Report | title, actual result, severity, priority | "No defects recorded." | failed cases without a defect |
| 7 Report | the measures of section 8, the lists, the visitor's notes | Download report, Download CSVs, Copy report | | "Nothing to report yet." | the totals invariant |

Coverage and other wide data are stacked records, never a page-wide grid (the wide-table rule). Only the shown stage is drawn; long lists get a filter.

## 13. Accessibility, mobile and privacy

Rules 7.2 and 7.3 apply in full: labels and linked hints, errors in words next to their field, visible focus, keyboard-only use, 44 px targets, no meaning by colour alone (every status is also a word), one polite status region (never per keystroke), no page-level horizontal scroll at 320 to 390 px. Visitor text is placed with `textContent` or as a control value, never as HTML (rule 8.7); opened files are untrusted data and no part of them is run. Nothing is sent anywhere (rule 8.8); the Privacy page's statement that what you type stays on your device is unchanged and true. Real-device checks before release: Android Chrome and iOS Safari for download and reopen (including whether iOS saves the file as `.md.txt`, so the file input accepts `.md`, `.txt`, `text/markdown` and `text/plain`), the `beforeunload` behaviour, a tab discarded while the visitor is in an AI app, the drawer, the stage select, and both themes.

## 14. Implementation sequence

The plan as approved. The owner's directive of 2026-11-17 ran P1 to P7 in one pass (the preview push in P7 was not made; it needs its own approval). What was built, with its results, is section 16.

| Phase | Scope | Files | Must stay untouched | Tests | Done when |
| --- | --- | --- | --- | --- | --- |
| P0 | This spec; rule wording (4.8, 4.11); Tool Pack 56 note | `docs/tool-packs/59-qa-workbench.md`, `docs/product-decision-rules.md`, `docs/tool-packs/56-ai-tools-ecosystem.md` | all code | review | the owner approves the documents |
| P1 | Engine without UI: records, ids, validator, calculations, file read and write, CSV; optional size limit | `assets/js/tools/ai-tools/common/pack-format.js`; planned `assets/js/tools/qa-workbench/model.js`, `metrics.js`, `qa-file.js`, `csv.js`, `tests/unit/qa-workbench.test.mjs` | every existing file reader; `pick`, `withMeta`, `FORMAT` | new unit tests with golden tables computed by hand first (rule 8.2); `tests/unit/ai-ecosystem.test.mjs` passes unchanged | all pass |
| P2 | Catalog entry, sidebar group, page shell, project bar, stages 1 and 2, download and open, in-tab memory, QD28 if approved; phone timing at the limits | `assets/js/data/tools.js`, `assets/js/components/section-switcher.js`; planned `qa-workbench/index.js`, `session.js`, `assets/css/tools/qa-workbench.css`, `tests/browser/qa-workbench.spec.js` | the other AI tools; `ui/workspace-nav.js`, `ui/tool-mount.js`, `ui/tool-scope.js` | pinned updates to `section-groups`, `sections`, `catalog`, `tool-catalog` unit tests; both builds; browser (desktop): create, download, reopen, invalid file, leave and come back by Back | all pass; limits timed on a phone |
| P3 | Stages 3 and 4 | `qa-workbench/index.js`, its CSS and spec | as P2 | unit; browser mapping | the page's coverage equals the golden tables |
| P4 | Stages 5 and 6 | same | as P2 | unit; browser run to defect | the totals invariant holds on the page |
| P5 | Stage 7, report and CSV downloads | same | as P2 | full journey on desktop and mobile projects | the report equals the engine's output |
| P6 | AI help: QD27 fix, criteria to the Reviewer, Workbench `task` receiver, AI table import, Bug Report receiver | `assets/js/tools/ai-answer-checklist/index.js`, `assets/js/tools/ai-workbench/index.js`, `assets/js/tools/bug-report-prompt/index.js`; planned `qa-workbench/import-table.js` | Workbench compiler and blueprints, `review-engine.js`, the Context Bridge | receiver unit tests; the AI browser specs once | every flow of section 10 verified end to end in a browser |
| P7 | Static checks, regenerated inventory and SEO keyword map, visual review by eye, page weight; then a request to push to the preview; real devices | generated data only | everything else | `npm run test:static`, both builds, section 13 manual checks | the owner approves the push; QD31 made final or changed |

Browser runs follow rule 10.3: one worker, focused specs, desktop then mobile.

## 15. Deferred

Live collaboration and merging two edited copies; integrations with Jira, Azure DevOps or test management tools; remote or automated test execution; Playwright script review and API test workspaces; risk assessment; reusable templates; requirement version history; an unsaved warning across other AI pages (QD32); any browser storage.

## 16. Implementation record (2026-11-17, base 89f3e604, uncommitted)

**New files.** `assets/js/tools/qa-workbench/`: `index.js` (the shell: static markup, project bar, stage switcher, event routing), `core.js` (limits, ids, time, lookups, the project), `model.js` (the vocabulary and the record operations; re-exports `core.js`), `metrics.js` (section 8), `project-file.js` (file and validator), `report.js` (report and CSV), `ai.js` (hand-off payloads, the request, the table reader), `session.js` (tab memory), and `stages/`: `ui.js` (shared markup helpers, form errors, the actions every stage has), `records.js` (retire, restore, delete, record a run, CSV), and one module per stage (`overview.js`, `overview-project.js`, `requirements.js`, `cases.js`, `coverage.js`, `execution.js`, `defects.js`, `report.js`), each loaded when its stage first opens. `assets/css/tools/qa-workbench.css`. Tests: `tests/unit/qa-workbench.test.mjs`, `tests/browser/qa-workbench.spec.js`.

**Changed shared and existing files, and why.** `assets/js/data/tools.js` (catalog entry, last of the AI tools so the other tools' six related links are unchanged); `assets/js/components/section-switcher.js` (group "Test and release"); `src/_data/toolStyles.json` (the page's stylesheets); `scripts/growth-manifest/identity-ledger.json` (the new published id, rule 6.6); `assets/js/tools/ai-tools/common/pack-format.js` (QD16: optional size limit on `readMeta` and `readFile`, default and message unchanged); `assets/js/tools/ai-tools/common/handoff.js` (comment: the two new kinds); `assets/js/tools/ai-workbench/index.js` (QD26 `task` receiver); `assets/js/tools/bug-report-prompt/index.js` (QD26 `bug` receiver, empty fields only); `assets/js/tools/ai-answer-checklist/index.js` (QD27: one review per change). Generated: `tests/inventory/url-inventory.json` (one page added), `docs/seo-keyword-map.json` (the new page; it also caught up the two AI tool titles retitled on 2026-11-16).

**Pinned expectations changed (reviewed).** The AI tool list, counts (eight tools and the directory) and related lists in `catalog`, `sections`, `search` (also the index's coarse size backstop, 76,000 to 80,000 bytes, as its comment requires when the catalog grows), `relationships`, `ai-tools`, `ai-directory`, `tool-capabilities` unit tests and `tests/browser/ai-tools.spec.js`. One pre-existing omission fixed in passing: `tool-capabilities.test.mjs` never listed the AI Workbench (Tool Pack 58) among the non-calculator tools, so that test was already failing at 89f3e604.

**Deviations from sections 6 to 12, made while building.** AI suggestions are held on the page and never stored in the project (no "suggested" state). Defects cannot be deleted. A run can be deleted only while no defect refers to it. A copied test case does not copy its mappings. The CSV starts with a byte-order mark. The Markdown body does not contain the report.

**Page weight (QD24 met, 2026-11-17).** The first build loaded 129.4 kB raw / 33.3 kB gzip at once. On the owner's direction the page was split: a small shell, the Overview for a visit with no project, and one module per stage loaded when the stage first opens; the vocabulary, the record actions and the figures load only with the stages that need them. Measured from the browser's own requests (the page's modules under `qa-workbench/` and `ai-tools/common/`, each gzipped at level 9): first load **35.2 kB raw / 12.5 kB gzip** (`index.js`, `core.js`, `session.js`, `stages/ui.js`, `stages/overview.js`). Added when first opened: the Overview with a project 4.5 / 1.6; Requirements (with the records and figures) 33.1 / 10.4; Test cases (with the AI help) 29.4 / 10.2; Coverage 5.9 / 2.2; Execution 8.1 / 3.0; Defects 8.3 / 3.2; Report (with the report, file and CSV code) 36.6 / 12.5. All stages opened: 161 / 56. A browser test (`qa-workbench.spec.js`) fails if the first load passes 40 kB raw or 13 kB gzip, or fetches a record or later-stage module. The stylesheet is 11 / 3.

**Final verification (2026-11-17, both builds fresh, run one at a time on this 4 GB laptop).**

| Check | Result |
| --- | --- |
| Unit suite, every file | 4,048 tests: 4,044 pass, 0 fail, 4 skipped (skips pre-existing); includes `qa-workbench.test.mjs` 20/20, `build-output` 17/17, `static-checkers` 21/21 |
| `qa-workbench.spec.js` | subpath-desktop 14/14, subpath-mobile 6/6, root-desktop 2/2 |
| Existing AI specs (`ai-ecosystem`, `ai-tools`, `ai-workbench`), after the final changes | subpath-desktop 21/21, subpath-mobile 19/19, root-desktop 4/4 |
| Static checks, both builds | inventory (676 live pages), links, assets, SEO: pass |
| Accessibility | axe-core 4.13 (already installed with lighthouse; injected by the test, no new dependency), WCAG 2.0/2.1/2.2 A and AA rules, scoped to the Workbench: no violations on all seven stages with their forms and panels open, in the light and the dark theme, on a refused file and on a form showing its errors. Keyboard-only journey, focus on each stage heading, visible focus ring, errors tied to fields (`aria-invalid`, `aria-describedby`), status announced in the polite region: pass. Not a WCAG audit or certification. |
| Layout | 390, 412, 820 and 1280 px (and the 390 px touch project): every stage with its editors open, no page overflow, no control outside the screen, no touch target under 44 px, the stage heading never under the sticky header: pass. Light and dark reviewed by eye at 390 and 1280 px. |
| Page weight | first load 35.2 kB raw / 12.5 kB gzip, guarded by a browser test |
| CSV in Excel | see section 7 |

**Not tested.** Physical devices: no Android phone or iPhone was available, so Android Chrome and iOS Safari remain outstanding (file choice and download, reopening, in-tab navigation, the `beforeunload` behaviour, editors on a real keyboard, a project at the limits). All phone results above are Chrome emulation on a laptop.

**Known limitations.** A phone may discard the tab while the visitor is in an AI app: only the downloaded file survives (section 9). `beforeunload` is not shown reliably on iOS Safari. At the provisional limits, opening takes a few seconds and searches one to three seconds with a slowed CPU (section 11). Team members editing copies of one file can create the same new id; there is no merge. Excel displays number-like build labels as numbers (section 7).
