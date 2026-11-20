# 07. Interactive tools catalogue

## 1. Principle

The 31 proposed ideas are grouped into **13 reusable experiences**. Each experience is built once, as an engine plus a UI component, and is configured per path. A standalone tool page (`/tools/<id>/`) exists only where it has its own search intent and repeat use (rulebook 4.2 and 12). Everything else is embedded in lessons.

**Priority** means: P1 is needed by W1 to W3, P2 by W4 to W6, P3 later. **Rule references** point to `product-decision-rules.md`.

## 2. Mapping of the proposed ideas

| Proposed idea | Becomes | Standalone page? |
|---|---|---|
| SQL Playground, Python Playground, JavaScript Playground, Java Practice Lab | E1 Code Runner (one engine interface; SQL, JS, Python, Java engines) | SQL: **existing** lab sandbox. Python: yes (W6). JS: yes (W5). Java: only after D4 |
| SQL Challenges, Code Debugging Arena, Interview Practice Arena | E2 Challenge Engine (challenge sets per path; "fix the bug" is a challenge type) | Interview Arena: yes, as an index page linking each path's interview module |
| Knowledge checks, quizzes | E3 Quiz Engine | No |
| Test Case Writing Lab, Bug Report Writing Lab, Requirement Analysis Lab, Test Plan Builder | E4 Structured Writing Lab (one engine, four templates) | Yes: **Test Case Writing Lab** and **Bug Report Writing Lab** (strong "template"/"example" intent [H]); the other two are embedded |
| Bug Hunting Simulator, Locator Practice target, API Bug Hunting target | E5 ShopLite practice app (seeded-bug releases) | Yes: **Bug Hunting Simulator** |
| API Request Builder, JSON Response Explorer, API Bug Hunting | E6 API Workbench (Service Worker mock API; JSON viewer reuses the JSONPath engine) | Yes: **API Practice Workbench** |
| Locator Practice, Git Command Simulator, Merge Conflict Simulator, CI/CD Simulator, shell | E7 Simulators (locator evaluator, git, CI, shell) | Yes: **Git Practice Simulator**; **Locator Practice** (W4). CI and shell are embedded |
| SQL JOIN Visualizer, SQL Query Explainer, Algorithm Visualizers, AI/ML Concept Visualizers | E8 Visualizers | Yes: **SQL JOIN Visualizer**; others embedded |
| Dataset Exploration Lab, Data Cleaning Lab | E9 Data Lab (reuses the SQL and Excel engines; pandas later) | No (embedded in D7 paths) |
| Prompt Evaluation Lab | E10 Prompt Evaluation Lab (recorded outputs) | Yes (W7) |
| DAX Practice | Existing Power BI lab engines | Existing lab |
| Security Practice Scenarios | E12 Code-reading security scenarios | No |
| End-to-End Project Simulator | E13 Project Workspace (milestones over existing engines) | No (project pages are path pages) |

## 3. Experience specifications

Each block lists the required fields.

### E1 Code Runner

- **User problem:** "I want to run code without installing anything, and see the output and errors."
- **Audience:** all programming paths.
- **Learning value:** the experiment, observe, adjust loop.
- **Core:** an editor (a textarea with line numbers and a monospace font; a CodeMirror-class editor is deferred, decision D6), Run, Reset, an output panel (stdout, return value, table), an error panel with the line, and a time limit.
- **Input / output:** source text in; stdout, stderr, result tables, a timing note out.
- **Interaction:** Run (Ctrl+Enter); the output appears below on a phone and beside on a wide screen when the lesson declares a practice panel.
- **Exercise types:** free run; "make the output equal X" (with E2).
- **Feedback:** the engine's own error, plus a friendly explanation for the 10 to 20 most common errors per language (a mapping table).
- **Engines:**

  | Engine | Size | Load |
  |---|---|---|
  | sql.js | 728 KB | built |
  | JS | sandboxed Worker; no DOM access; a time limit through Worker termination | — |
  | Python | Pyodide, about 5.3 MB | on demand |
  | Java | TeaVM javac, about 6 MB, unverified | only after D4 |

- **Browser support:** WebAssembly and Workers in all evergreen browsers. Old browsers get a "cannot run here" note, and the lesson stays readable.
- **Mobile:** 16 px editor, full width, a sticky Run bar above the keyboard, output scrolls inside its box.
- **Feasibility:** proven for SQL; standard for JS; good for Python (a cold start of about 1 s on desktop [S41], slower on phones: measure); Java uncertain.
- **Maintenance:** M (runtime upgrades).
- **SEO:** "<language> online compiler / playground" intents [H]; competitive.
- **Priority:** JS P2; Python P2; Java P3.

### E2 Challenge Engine

- **Problem:** practice with an objective check.
- **Core:** a task, a starter, a check and a verdict (correct, not yet, cannot check), specific findings, progressive hints, then the solution with an explanation; "fix the bug" and "predict the output" variants.
- **Checkers:**

  | Checker | Status |
  |---|---|
  | RS result-set compare | built |
  | stdout compare | — |
  | unit-test assertions (JS, Python) | — |
  | static rules (regular-expression or AST patterns for Playwright code) | — |
  | plan pattern (SQL EXPLAIN) | — |

- **Feedback:** never reveals the expected answer in a failure message (as the built SQL evaluator does).
- **Priority:** P1.
- **Reuse:** this is the existing `learning/lab-shell.js` (used by all 7 labs: list, Check, verdicts, hints, solution-viewed) extended with pluggable checkers. It is not a new engine ([16](16-existing-assets-reuse.md), section 1.1).
- **Maintenance:** L.

### E3 Quiz Engine

- **Types:** single choice, multiple choice, order the steps, match pairs, predict the output, fill in the blank (exact or normalised).
- **Feedback:** an explanation per option.
- **Static fallback:** `<details>` question and answer (as built).
- **Priority:** P1.
- **Maintenance:** L.
- **Mobile:** 44 px options, one column.

### E4 Structured Writing Lab (test cases, bug reports, requirement questions, test plans)

- **Problem:** "Is my test case or bug report good?" Teachers usually mark this by hand.
- **Core:** a form template (fields per artefact); a deterministic **rubric checker**:
  - required fields present;
  - expected result is observable (verbs list; banned vague words such as "works", "properly", "correctly", "fine");
  - steps are numbered and atomic (one action each);
  - test data is concrete (values present);
  - severity and priority are consistent with the scenario facts;
  - each scenario fact covered (keyword sets per exercise, with synonyms).
- **Output:** a checklist of rubric items met or missed, each with advice; a model answer is revealed after an attempt; export as Markdown, CSV or plain text (the learner keeps their artefact; nothing is stored).
- **Honest limit:** the rubric checks structure and coverage, not wisdom. The page says so.
- **Priority:** P1 (W2).
- **Maintenance:** M (rubric tuning).
- **SEO:** strong for "test case template", "bug report example" intents [H].

### E5 ShopLite practice app

- **Problem:** testers need a real application to test, automate and break safely.
- **Core:** a small, original, static web shop at `/practice-labs/shoplite/` (a separate sub-app, `noindex`, its own minimal CSS). It has:
  - signup and login (fake, local),
  - product search and filters,
  - cart, coupon and checkout (no payment-card or bank fields at all: payment is a simulated choice such as "Pay on delivery", so the app can never look like a payment or credential form),
  - order history,
  - a profile form.
- **Releases:** a URL parameter or a release picker selects a **release**: `stable`, `r-bugs-1` (10 functional bugs), `r-a11y` (accessibility bugs), `r-api` (API bugs, via E6). Each seeded bug has an id, a category, a severity, reproduction facts and a "found it" check.
- **Bug Hunting Simulator:**
  - the learner reports what they found (pick a feature, describe the steps and the expected and actual behaviour);
  - matching is against seeded-bug facts (feature plus field plus behaviour keywords);
  - the score shows how many were found, with hints per area.
- **Data:** in memory, reset on reload. No persistence (rule 7.7) and no real personal data. The page warns: "Do not enter real data."
- **Mobile:** fully responsive (it is a practice target too).
- **Maintenance:** M (one app shared by D1, D2, D4 and D8).
- **Priority:** P1 (W2), the backbone of the testing departments.

### E6 API Workbench

- **Core:**
  - a request builder: method, URL from the mock API, params, headers and JSON body; Send;
  - a response viewer: status, headers, pretty JSON with a JSONPath query box (reusing the JSONPath Tester engine), and the time;
  - assertion checks (HT).
- **Mock server:** a Service Worker scoped to `/practice-labs/api-sandbox/` serves `/practice-labs/api-sandbox/v1/...`. The state is in memory, per tab. The `r-api` release adds seeded API bugs. Nothing leaves the browser. No real third-party APIs are called (privacy, rulebook 8.8).
- **Fallback:** if Service Workers are unavailable (some private modes), an in-page fetch shim gives identical behaviour.
- **Priority:** P1 (W3).
- **Maintenance:** M.
- **SEO:** "practice API testing online", "REST API for testing practice" [H].

### E7 Simulators

- **Locator evaluator (W4):**
  - Runs `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`, CSS and `.filter/.nth` in the page, against ShopLite in an iframe.
  - The role and accessible-name computation is a documented subset (a role table plus the name from label, aria-label, aria-labelledby and text).
  - It highlights matches and reports a count ("strict mode would fail: 3 elements").
  - The subset is stated on the page.
- **Git simulator (W5):**
  - An own model: commits, refs, HEAD, index, a working tree of small text files, remotes as a second model.
  - Commands supported: init, status, add, commit, log, diff (simple), branch, switch/checkout, merge (fast-forward or three-way with a conflict editor), rebase (linear), reset (soft, mixed, hard), revert, restore, reflog, tag, fetch, pull, push to a simulated origin.
  - An SVG commit graph updates as the learner types.
  - Goals are graph and ref states (GS).
  - isomorphic-git is not used: it needs a file system and does far more than teaching needs [S46].
- **CI simulator (W9):** a pipeline model (stages, jobs, needs, artifacts, cache), a YAML-like subset parser, and simulated runs with failures to diagnose.
- **Shell simulator (W9):** a virtual file system plus about 25 commands.
- **Priority:** locator P2 (W4); git P2 (W5); CI and shell P3.
- **Maintenance:** M.
- **SEO:** "git practice online", "learn git branching alternative" [H].

### E8 Visualizers

| Visualizer | Description | Wave |
|---|---|---|
| SQL JOIN Visualizer | Two small editable tables; pick a join type; matched rows highlighted and the result built row by row; runs the real query via sql.js. **P1, W1** | W1 |
| Query Explainer | Shows logical clause order (FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT) with intermediate row counts by running partial queries, plus the EXPLAIN QUERY PLAN tree. **P1** | W1 |
| Algorithm visualizers | Sorting, searching, stack/queue, tree traversal | W9 |
| ML visualizers | Linear regression with gradient descent, k-means, decision tree splits, confusion matrix and threshold slider | W8 |
| Tokenizer | A deterministic BPE-like teaching tokenizer, labelled as a simplified model, not a specific vendor's tokenizer | W7 |
| Embedding visualizer | Precomputed 2-D projections of small sentence sets; cosine similarity | W8 |
| Charts | Inline SVG drawn from data, following the site's dataviz rules | — |

**Mobile:** every visualizer has a vertical layout and works with touch; no hover-only information.

### E9 Data Lab

Datasets (CSV, as SQL tables, or as Excel-lab sheets) with a profile: rows, columns, types, nulls, distinct values, min and max. Cleaning tasks are checked by results. It reuses the sql.js and Excel engines; pandas through Pyodide later (W9). **P3.**

### E10 Prompt Evaluation Lab

- **Problem:** learning to judge and improve prompts and AI output without paying for an API.
- **Core:** a scenario (task, prompt versions), **recorded model outputs** (written and verified by the author, dated, labelled "recorded example, not live"), and a rubric builder (criteria with weights). The learner scores outputs and designs test cases (inputs plus expected properties). The check compares their scoring against the reference scoring, within a tolerance, and checks the rubric covers the required risks.
- **No runtime AI**, no keys (rule 1.5; the owner's constraint).
- **Priority:** P2 (W7).
- **Maintenance:** **H** (the field moves fast): a review date on every page.
- **Optional later:** browser-local small models (Transformers.js) only after decision D5.

### E11 DAX and Power Query

Existing Power BI lab engines: no new work beyond path wrapping (W9).

### E12 Security scenarios

- **Format:** "Spot the vulnerability" in a code snippet, "choose the fix", "order the attack steps".
- **No** live vulnerable endpoints and no exploit tooling. Concepts follow the OWASP Top 10.
- **P3.** Maintenance M.

### E13 Project Workspace

- A project page with a brief, deliverables, 4 to 6 milestones (each one an E2, E4, E5, E6 or E7 task), a final checklist and a reference solution.
- Export of the learner's work (a Markdown bundle), so it can go into a portfolio.
- **P1** for SQL projects (W1).

## 4. Standalone tool pages: launch order

| Order | Page | Wave |
|---|---|---|
| 1 | SQL JOIN Visualizer | W1 |
| 2 | Test Case Writing Lab | W2 |
| 3 | Bug Report Writing Lab | W2 |
| 4 | Bug Hunting Simulator | W2 |
| 5 | API Practice Workbench | W3 |
| 6 | Locator Practice | W4 |
| 7 | JavaScript Playground | W5 |
| 8 | Git Practice Simulator | W5 |
| 9 | Python Playground | W6 |
| 10 | Prompt Evaluation Lab | W7 |
| 11 | Interview Practice index | W2 onwards, grows |

Each goes through its own Tool Pack (`docs/tool-pack-factory.md`), as rule 4.10 requires.
