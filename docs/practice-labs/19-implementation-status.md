# 19. Practice Labs implementation status (living record)

This file is updated by every development milestone of the master mission (2026-11-08). It records only what is built and pushed; plans stay in the [blueprint](../practice-labs-development-blueprint.md).

## 1. Decisions applied at the start of the mission

The owner's mission prompt of 2026-11-08 is the authority for these.

| Id | Decision | Applied as |
|---|---|---|
| D1 | Opt-in device progress (rule 7.7 exception) | **Not approved.** No persistence is built. Lessons show position only. Flashcards keep their existing exception |
| D2 | Department structure, rule 4.10 | **Owner-directed** (the eight departments of the mission). Recorded in rule 4.10 |
| D3 | Pyodide | Investigate and measure when a Python task needs it. Lazy, vendored, same-origin only |
| D4 | Java execution | Investigate. Use an honest alternative if it is not feasible |
| D5 | Browser AI models | No model downloads. Visualizers and labelled simulations only |
| D6 | Code-editor library | Resolved earlier: plain textarea first |
| D7 | Analytics events | **Not added** (no consent-architecture change) |
| D8 | Monetisation | None |
| D9 | Never assigned: a numbering gap in the decision register | — |
| D10 | Launch order | The mission's stage order: Database, then Testing, Automation, AI, Data, Programming, Web and Backend, DevOps |

## 2. Milestones

| # | Milestone | Commit | Checks run (feature-specific only) | Not run |
|---|---|---|---|---|
| M1 | Stage 1 foundation: department registry (the owner's 8); Practice Labs home with search (build-time index; department, type and level filters); 3 department pages; department step in breadcrumbs; lessons reordered (lesson card, first example after the idea, "Your turn" task after it); rule 4.10 | `6f2b632` | Unit test (namespace, 150+ words per department, search targets); 2,614 links resolve; department SEO tags; at 1280 and 390: home, search, filters, department page, sidebar noun, first example 601/816 px and first task 1,273/1,581 px, solution judged correct, no overflow | Full suites, lab pages, accessibility sweep |
| M2a | SQL part 1: 6 new lessons (dates and text; running totals; LAG, LEAD and ranking; recursive CTEs; reading query plans; writing faster queries), a new advanced module, 19 exercises incl. 4 plan-checked, company and bank datasets; generator `scripts/practice-labs/build_sql_additions.py` (Python sqlite3 oracle); browser plan checker; lab unchanged | `1238106` | Generator ran every solution and asserted 4 plans; unit test incl. `validateExerciseSet`; sql.js judged all 19 solutions correct; 4 deliberate wrong answers rejected with specific feedback; phone: no overflow, first example at most 1,171 px, first task at most 2,196 px | Other lessons, lab pages |
| M2b | SQL part 2: 5 projects (HR analytics, bank statement checks, shop sales report reusing the lab's 3 report exercises by id, clinic appointments, KPI pack) with 24 checked milestones; interview practice (10 concept questions with a new quiz engine, 10 coding problems); clinic and targets datasets (synthetic); projects index; roadmap groups; search covers projects and interview; SQL path status **complete** (24 lessons, 5 projects, interview) | `08e6955` | Generator: 50 path exercises run, empty-answer guard (caught and replaced one problem whose answer was empty); unit test; sql.js judged all 34 milestones and problems correct (incl. the 3 reused lab exercises and data-changing milestones); a wrong data change rejected; quiz right and wrong paths; search finds projects; roadmap groups; 4,280 links on 47 pages resolve, index of 39 entries valid; phone: project, interview and index pages without overflow | Lab pages, accessibility sweep |
| M2c | JOIN visualizer in the "Joining tables" lesson: four join types stepped row by row (driving row and matches highlighted, result grows, plain-language note per step), then the same SQL run in sql.js and compared; static tables and the INNER result without script. Fix found on the way: primary buttons on learning pages had no style (bare text); they now use the site's form-button classes, as the labs do | `81114b9` | Unit test of the model (6 cases, expected rows worked by hand and confirmed with Python sqlite3, incl. RIGHT and FULL joins); browser at 1280 and 390: each type stepped to the end, SQLite confirms the same rows, mid-step highlight state, no overflow, first task still within 3 screens; milestone M1 checks re-run after the button change (27 pass) | Lab pages |
| M3a | Stage 3 begins: **ShopLite**, a small original practice shop at `/practice-labs/shoplite/` (noindex, not in the sitemap). It has search, filters, sorting, product, cart (quantity, remove, coupons), checkout (address, delivery date, pay on delivery; no card fields), orders, sign-in, sign-up, account and password change, plus a Requirements screen with 10 written rules. Releases: stable and release 1.1 (`?release=r-bugs-1`) with 10 seeded bugs; bug registry with a report matcher; state in memory only | `415b647` | Unit test (10 cases: every rule in stable, every bug's exact effect, matcher recognises a plain report of each bug and rejects unrelated ones); browser: each of the 10 bugs reproduced through the UI from its steps in release 1.1 and absent in stable; a valid order flow works in stable; phone: no overflow on shop, cart and requirements | Bug Hunting Simulator (next), accessibility release |

**Design decisions in M2b:**

- **Project 6 merged.** The planned sixth project ("interview challenges") would have duplicated the interview page, so it became the interview page.
- **Clinic data.** Patients are identified by synthetic codes, not names.

| M3b | Manual Software Testing path published (department Software Testing now has a page): lessons 1 to 10 (modules What Testing Is, Testing in the Life Cycle, Writing Test Cases) rendered from typed blocks; quizzes, ordering tasks, 4 structured writing labs (requirement questions, scenarios, a test case, positive and negative data) with a deterministic rubric checker; ShopLite tasks linked from lessons | `4a054e4` | Unit tests (12: curriculum generic over paths; every MT lesson has checked practice; writing models meet and weak answers miss their rubric); 5,374 links on 63 pages resolve; at 1280 and 390: quiz, ordering (wrong rejected, right accepted), writing lab (weak answer 5 of 9 items, good answer all items, model opens), department lists the path, first task within 3 screens, no overflow | Lab pages, accessibility sweep |

| M3c-1 | Manual Testing lessons 11 to 17 (Intermediate: Test Data and Coverage; Executing Tests and Reporting Bugs; Types of Testing) and the bug-report writing lab (model and two weak answers) | `40629ff` | Unit tests (writing models and weak answers, curriculum 12 cases); at 1280 and 390: bug-report lab (weak answer not yet, good answer all items), bug life-cycle ordering accepted, no overflow; path roadmap lists 17 lessons | Other pages |

| M3c-2 | Manual Testing lessons 18 to 24 (exploratory testing, usability and compatibility; Advanced: test plan, risk-based testing, Agile, acceptance criteria, metrics): all 24 planned lessons published. **Bug Hunting Simulator**: ShopLite release 1.1 in a frame beside a structured report form; findings recognised by `matchReport`, duplicates flagged, area hints after 3 misses, a counter, and a give-up reveal of all 10 bugs; in memory only | `ffb8e89` | Unit test (9 cases); at 1280 and 390: a real report recognised, the duplicate flagged, an unrelated report rejected, hint after 3 misses, counter 1 of 10, frame visible, no overflow; advanced lesson ordering task; 7,409 links on 84 pages resolve; earlier M3b checks re-run (17 pass) | Other pages |

| M3c-3 | Manual Testing **complete**: interview practice (15 scenario questions; the interview page now supports paths without coding problems), a test-plan writing lab in the test-plan lesson; path status complete | `c8d7a9c` | Unit tests (writing 3, curriculum 9); at 1280 and 390: MT interview (15 questions, no coding section, quiz works, no overflow), test-plan lab not-yet for a vague plan; SQL interview unchanged (10 + 10); MT path has no "still to come"; 7,523 links on 85 pages resolve | Other pages |

| M3d | **Test Design Techniques** path (complete): 6 lessons over 3 levels (partitions, boundaries, decision tables, state transitions, pairwise, use cases and error guessing). The new `labset` block mounts the shared lab shell inside a lesson on the Test Design Lab's own exercises (all 20, each used once), with its own evaluator and partition input; the lab page is unchanged | `3a32b81` | Unit test (10: every lab exercise used exactly once); at 1280 and 390: lab shell mounted in the lesson, a wrong answer flagged, 17/18/65/66 accepted, no overflow; department lists both paths; 8,375 links on 98 pages resolve | Lab page itself |

| M4a | Stage 4 begins: **Automation Engineering** department published, with the **Playwright with TypeScript** path at beginner level (7 lessons: automation basics, how Playwright works, setup (run locally), TypeScript for tests, locators, web-first assertions, a complete test). A new teaching **locator evaluator** (`automation/locator.js`: getByRole for 20 roles, getByLabel, getByText, getByPlaceholder, getByTestId, CSS, filter, first, last, nth; accessible-name subset) and a **locator practice** block on ShopLite that enforces strict mode, labelled "not Playwright itself" | `a390478` | Parser unit test (2); curriculum test (12); at 1280 and 390: all 5 model locators solve their tasks; an ambiguous locator gets the "24 elements match" strict-mode message; no overflow; 9,240 links on 111 pages resolve. One defect found and fixed: the frame did not switch screens (`startsWith`) | Real Playwright runs (by design, local only) |

| M4b | **Playwright path complete**: 8 more lessons (Intermediate: actions and forms, navigation and waiting, hooks and fixtures, Page Object Model, network mocking and API; Advanced: debugging and flaky tests, configuration and parallel runs, reports and CI) and interview practice (12 questions). A static **code-check** engine (`automation/code-check.js`: awaited actions, no fixed waits, user-facing locators, required and forbidden patterns) with 4 exercises, each with a model and weak versions; labelled "simulated check: read, not run" | `bf01ab2` | Code-check unit test (models and weak versions pinned); curriculum test (10; caught a too-short module description, fixed); at 1280 and 390: the flaky-test exercise starter gets not yet and the model gets all met; interview has 12 questions; no overflow; 10,480 links on 126 pages resolve | Real Playwright execution (by design) |

| M5a | **AI and AI Engineering department published** with the **AI and LLM Foundations** path. It has 10 lessons across beginner, intermediate and advanced: AI, machine learning and generative AI; tokens; context windows and prompts; temperature and sampling; embeddings and RAG; evaluating AI features; hallucination and prompt injection; precision, recall and thresholds; agents; and responsible AI. It also has interview practice (10 questions). An `aiviz` block offers five deterministic teaching visualizers (`ai/models.js` with `learn-aiviz.js`): a tokenizer, a context budget, softmax with temperature and top-p, cosine retrieval over hand-made vectors, and a confusion matrix with a threshold. Each is labelled as a teaching model; no model runs and nothing is downloaded or sent. One writing lab designs an AI evaluation set | `31404cd` | AI models unit test (5, hand-counted); writing-check covers the new exercise; curriculum test; at 1280 and 390, all five visualizers render with no overflow, the threshold slider updates the metrics, and the writing lab and interview page (10 questions) are present; 11,822 links on 145 pages resolve | Real model outputs (by design); prompt-engineering and ML-foundations paths (planned) |

| M6a | **Data and Analytics: the Statistics and Data Analysis path**, with 9 lessons. Beginner: data types, mean, median and mode, spread, and percentiles and outliers. Intermediate: grouping and pivots, cleaning, and correlation and regression. Advanced: A/B tests and significance, and charts and presenting. The path also has interview practice (10 questions) and links to the Excel Practice Lab. A new `numeric` block shows the dataset table with answer boxes; `data/stats.js` computes each answer from the same table using Excel's definitions (STDEV.S, PERCENTILE.INC) and accepts it at the stated precision. There are 12 numeric exercises | `68ffafd` | Stats unit test (functions against hand values; each exercise is answerable, an off answer and text are refused, ₹ and commas are accepted); every explanation's figures were cross-checked against the computed answers (5 corrected before commit); at 1280 and 390, a wrong answer is refused, the right one accepted with ₹ and commas and by Enter, correlation is accepted, the interview has 10 questions and there is no overflow; 13,025 links on 162 pages resolve | Excel and Power BI labs not yet split into path lessons (they remain linked labs) |

| M7a | **Programming department published with the JavaScript Programming path**. It has 10 lessons:

- Beginner: values and functions, conditions, loops, arrays, and objects and strings.
- Intermediate: map, filter and reduce; errors and validation; promises and await.
- Advanced: problem solving and complexity; clean code and testing.

The path also has interview practice (12 questions).

A new `jsrun` block runs the learner's code against the exercise's tests in a fresh **module Web Worker** (`programming/js-worker.js`). Before any code runs, the worker removes fetch, XHR, WebSocket, importScripts, IndexedDB and similar APIs. Code that contains `import` is refused. The page terminates the worker after 2 s. There are 12 exercises, each pinned by its model, buggy versions and a non-passing starter | `90f15d7` | JS exercises unit test (12 pinned; syntax error, missing function, thrown error, console capture and import refusal). At 1280 and 390: the starter and buggy version fail (3 of 4, with the 999 boundary named) and the model passes; an endless loop is stopped while the page stays responsive; fetch is unavailable; console output is shown; there is no overflow and no outside requests; the interview has 12 questions. 14,430 links on 182 pages resolve. The leak guard caught the word "undefined" in lesson text twice; both were reworded | Python and Java paths (planned; no large runtime downloads) |

| M8a | **Web and Backend: the HTTP and REST APIs path**. It has 9 lessons:

- Beginner: URLs, methods, status codes, and query parameters, headers and JSON.
- Intermediate: authentication and authorisation, validation errors, and REST design.
- Advanced: testing APIs, and caching, rate limits and security.

The path also has interview practice (12 questions) and links to the JSON Error-Fixing Lab.

A new `apitask` block lets the learner build a request (method, path and query, headers, body). `web/mock-api.js` answers it inside the page. It is a deterministic, stateless model of a ShopLite API with products, filters, a bearer-token orders endpoint and a JSON cart endpoint, and it covers 200, 201 (with Location), 204, 400, 401, 404, 405 (with Allow), 415 and 422. Each task's goal is checked. Nothing is sent, and the host is the reserved `.example` domain. There are 8 tasks | `34e3582` | Mock API unit test (every response code; each task's model meets its goal and its start does not). At 1280 and 390: the orders endpoint gives 401 without a token and meets the goal with one; the cart gives 415 without Content-Type, then 201 with Location; there is no overflow; nothing is sent to the example host; the interview has 12 questions. 15,633 links on 199 pages resolve | HTML, CSS and DOM path and backend fundamentals (next) |

| M8b | **Web and Backend: the HTML, CSS and the DOM path**, with 9 lessons:

- Beginner: elements, links and images, semantic HTML, and forms.
- Intermediate: CSS basics, flexbox and responsive layout, and accessibility.
- Advanced: the DOM and events with XSS, and performance and Core Web Vitals.

It also has interview practice (12 questions).

A new `webplay` block renders the learner's HTML and CSS in an `iframe sandbox="allow-same-origin"` with no scripts permission. `web/dom-check.js` then reads the rendered DOM and computed styles using these rule types: exists, count, none, attr, labelled, named and style. There are 8 exercises | `a14a9e0` | New focused browser spec `tests/browser/practice-labs-webplay.spec.js` (10 tests on subpath-desktop only): each exercise's starter fails and its model passes; a script tag and an onerror handler in learner markup do not run. Phone (390): the model passes with no overflow; the interview has 12 questions. 16,817 links on 216 pages resolve | Backend fundamentals path (planned) |

| M9a | **The DevOps, Cloud and Cybersecurity department is published with two paths.**

**Git and DevOps Foundations** (8 lessons):

- Beginner: first commit; staging, unstaging and discarding.
- Intermediate: branches and merging; conflicts, remotes and pull requests; CI/CD.
- Advanced: containers, cloud and monitoring.

A new `gitsim` block uses `devops/git-sim.js`, a modelled repository with a working tree, index, commits and branches. It supports status, add, commit, restore with or without `--staged`, branch, switch or checkout with or without `-c`/`-b`, fast-forward and three-way merges with conflict detection, and log. It has deterministic ids and no persistence. There are 7 goal-checked tasks.

**Application Security Foundations** (7 lessons, defensive code review):

- threat modelling;
- injection;
- XSS;
- passwords and sessions;
- access control;
- secrets, configuration and dependencies;
- security testing.

Both paths have interview practice (12 questions each). The Cron Challenge Lab is linked from the Git and DevOps path | `f6070cb` | Git simulator unit test (3: status, add, commit and restore; switch refusal; fast-forward, three-way and conflict merges; all 7 task models reach their goals and their starts do not). At 1280 and 390: the merge task's goal is met only after the merge, the terminal shows the untracked file and "Fast-forward", reset restores the start, there is no overflow, the security interview has 12 questions, and the department lists both paths. 19,059 links on 249 pages resolve | Shell simulator and deeper cloud paths (planned) |

| M10–11 | **Role journeys and completion review.**

- The Practice Labs home page gains "Journeys by role" (`journeys.js`). Seven journeys (QA, automation, data analyst, web developer, backend developer, AI engineer and tester, DevOps) order existing paths and labs across departments. A unit test checks that every step resolves to a published path or lab.
- Review: the search index covers every path, lesson, project and interview page (172 entries); all 8 departments are published; no path is in "building" status.
- One stale home-page sentence ("the others are being built") was reworded | `97770d8` | 29 focused unit tests across the Practice Labs suites. At 1280 and 390: 7 journeys, the first opens with 5 linked steps, no "In development" cards, no overflow, and search finds the new Git lesson. 19,093 links on 249 pages resolve | See section 4 for honest limits |

### Milestone log (continued)

Milestones from M12 on are recorded here as sections rather than table rows.

#### M12a: Python and Java Programming paths (commit: `971f80d`)

- **Python Programming** has 10 lessons:
  - Beginner: basics, conditions and arithmetic, loops and lists, dictionaries and sets.
  - Intermediate: scope, defaults and comprehensions; exceptions; classes; files and modules.
  - Advanced: problem solving; pytest.
  - It also has interview practice (12 questions).
- **Pyodide 314.0.7** (MPL-2.0) is vendored unmodified in `assets/js/vendor/pyodide/`, about 13.4 MB, with VERSION and LICENSE files, following rule D3 and the sql.js precedent:
  - It is same-origin and loaded only when the learner presses "Load Python".
  - It runs in a module Worker (`programming/py-worker.js`) that removes network APIs after start-up.
  - A run is stopped after 10 s, and Python then reloads on the next run.
- **New `pyrun` block:** 11 exercises with a shared Python harness (`programming/py-harness.js`). The same harness pins every model, buggy version and starter with the local CPython 3.10 (`tests/unit/py-exercises.test.mjs`).
- **Java Programming** has 9 lessons:
  - Types, strings and equality, loops and arrays.
  - Methods and pass-by-value, classes, inheritance and polymorphism, collections.
  - Exceptions, streams and JUnit.
  - It also has interview practice (12 questions).
- **Java does not run in the page.** This is the D4 fallback: TeaVM's licence, real size and behaviour on phones were not confirmed.
- **New `predict` block:** output prediction for 14 Java and 4 Python programs. A hint appears on the second wrong try. Every expected output was produced by real `java Main.java` (JDK 17) and CPython (`tests/unit/predict.test.mjs`), and each page labels the exercise "not executed".
- **Checks performed:**
  - Unit tests: Python exercises (2), predictions (3) and the curriculum test.
  - Chrome at 1280 px:
    - no Pyodide request before the click;
    - Python loads in about 5.7 s locally;
    - the starter fails, the buggy version shows 2 of 3 with its printed output, and the model passes;
    - a second exercise reuses the loaded runtime;
    - `js.fetch` from Python fails;
    - an endless loop is stopped at 10 s and the page stays responsive;
    - no outside requests;
    - a wrong Java prediction gives the hint on the second try, and the right one is accepted.
  - Phone (390 px): no overflow on the Java or Python lesson pages.
- **Deployment note:** the production server must serve `.mjs` as JavaScript and `.wasm` as `application/wasm`. GitHub Pages does both; the Hostinger configuration was not checked or touched.

#### M12b: Shell simulator, Linux path and Kubernetes path (commit: `66f78ed`)

- **New `shellsim` block** (`devops/shell-sim.js` and `devops/shell-tasks.js`): a Bash-like shell over an in-memory model of a ShopLite server.
  - Commands: pwd, ls (-a, -l), cd, cat, head, tail, wc, grep (-i, -n, -c, -v), sort (-r, -n), uniq (-c), cut, echo, mkdir (-p), touch, cp (-r), mv, rm (-r, refusing to delete home or root), find -name, chmod (+x, -x or octal) and whoami.
  - Pipes, `>`, `>>` and `&&` work; listings sort as in the C locale.
  - The prompt follows the current directory, the Up and Down keys recall earlier commands, and there are 9 goal-checked tasks.
- **Linux and the Command Line** (8 lessons): file system and navigation, reading logs, grep and find, pipes and redirection, managing files, permissions, processes, services and environment variables, and shell scripting. It has interview practice (10 questions) and links to the Cron Challenge Lab.
- **Kubernetes and Deployment** (5 lessons): Docker Compose; pods, deployments and services; configuration, secrets and health checks; deployment strategies and rollbacks; SLIs, SLOs and error budgets. It has interview practice (10 questions). No cluster runs in the page, and the path page says so.
- **Checks performed:**
  - Unit tests: shell simulator (2), covering core behaviour (navigation, pipes, redirection, mv, rm, chmod, `&&`, unsupported commands) and every task's model against a fresh shell; curriculum test (one leaked word, "undefined", reworded).
  - At 1280 and 390 px: the prompt follows `cd`; a pipeline that keeps the header does not meet the goal; Up recalls the last command; the correct pipeline meets the goal; the terminal shows the output; no overflow; the Kubernetes path page lists its lessons.
  - 23,377 links on 311 pages resolve.

#### M12c (checkpoint): AI engines for the Machine Learning and Prompt Engineering paths (commit: `602f8e1`)

- `ai/ml-models.js`: least squares, polynomial fit, k-means and Gini impurity, with fixed datasets. Pinned against `numpy.polyfit` in `tests/unit/ml-models.test.mjs`.
- Four new `aiviz` kinds in `learn-aiviz.js`: regression, overfit, kmeans and tree (SVG plots).
- `ai/structured.js` with a new `schema` block (`learn-schema.js`): the learner writes JSON that is validated against a schema and checked for the expected values. 4 exercises (ticket extraction, review classification, a tool call and a refusal), pinned in `tests/unit/structured.test.mjs`.
- 3 prompt-writing labs added to `ai/writing.js` (pe-w-anatomy, pe-w-few-shot, pe-w-guardrails), pinned by the writing-check test.
- **Not yet used by any lesson page**: the ML and Prompt Engineering lessons are the next step.
- Checks performed: focused unit tests (23 pass) and the build. No browser check yet for the new visualizers or the schema block.

#### M12d: Machine Learning Foundations and Prompt Engineering paths (commit: `b6a44c2`)

- **Machine Learning Foundations** (9 lessons):
  - Beginner: ML and the project workflow; data, features and splits with leakage; linear regression with an interactive fit.
  - Intermediate: classification and thresholds; decision trees and ensembles with the Gini split visualizer; overfitting and validation with a polynomial-degree visualizer.
  - Advanced: k-means stepped through iterations; neural networks; NLP, vision, transfer learning and drift.
  - Interview practice (12 questions).
- **Prompt Engineering** (7 lessons):
  - Prompt anatomy and few-shot (writing labs checked against rubrics).
  - Structured outputs and tool calling (4 `schema` exercises).
  - Chains (an ordering task).
  - Evaluation (quiz on dated, written example outputs).
  - Prompt security (a guardrail writing lab).
  - Interview practice (10 questions).
- The AI department now lists three paths.
- **Checks performed:**
  - Curriculum test.
  - At 1280 and 390 px:
    - regression plot shows 8 points, and the error falls from 235.68 to 0.89 as the sliders approach the fit;
    - degree 9 shows training error 0.0000 and test error 0.0730;
    - k-means converges at iteration 4 with 12 points;
    - the tree split at 6 gives 0.160;
    - the schema block refuses "yes" for a boolean and accepts the model;
    - the prompt-writing lab is present;
    - no overflow.
  - 25,573 links on 343 pages resolve.

#### M12e: Backend Fundamentals path (commit: `44db5ba`)

- **Backend Fundamentals** has 9 lessons:
  - request lifecycle; routing; validation and errors;
  - databases from code (parameters, transactions, migrations, N+1); pagination and caching; sessions and JWTs;
  - money and idempotency; architecture with queues and services; configuration, structured logging and twelve-factor apps.
- It also has interview practice (12 questions) and links to the JSON Error-Fixing Lab.
- 5 new `jsrun` exercises: a router, order validation, pagination, money in paise with GST and delivery, and an idempotent payment handler.
- `js-eval.js` gained an optional `harness` (run a scenario that calls the learner's function) and per-test `call` labels. The worker message now carries the harness.
- The path also reuses three `apitask` tasks.
- **Checks performed:**
  - JS exercises unit test: all 17 pinned.
  - Curriculum test.
  - At 1280 and 390 px:
    - the money and idempotency starters fail and their models pass;
    - a buggy idempotency handler fails, showing the scenario label;
    - no overflow.
  - 26,774 links on 360 pages resolve.

#### M12f: API Test Automation and Selenium WebDriver with Java paths (commit: `d0728a6`)

- **API Test Automation** has 5 lessons:
  - why automate at the API level;
  - Playwright request fixture assertions;
  - authentication, test data and clean-up;
  - schemas, contracts and data-driven tests;
  - frameworks and CI.
- **Selenium WebDriver with Java** has 6 lessons:
  - WebDriver architecture;
  - locators;
  - explicit waits and stale elements;
  - actions, frames and windows;
  - JUnit lifecycle and page objects;
  - Grid, headless runs and CI.
- Both paths have interview practice (10 questions each).
- 6 new code-check exercises in `automation/more-code.js`, merged into `CODE`:
  - API: GET with JSON and count; POST with 201, Location header and body; positive and negative auth without logging the token.
  - Selenium: explicit wait instead of `Thread.sleep` and absolute XPath; JUnit `@BeforeEach`/`@AfterEach` with `quit()` and no static driver; a LoginPage page object.
  - These rules are must/mustNot only. The Playwright-oriented `awaitActions` rule would wrongly flag plain `expect(value).toBe` in API tests.
- The codecheck note now names where to run each exercise (`runIn`).
- The Automation department now lists three paths.
- Checks performed:
  - code-check unit test (all 10 exercises pinned, models and weak versions);
  - curriculum test;
  - at 1280 and 390 px, on the Selenium wait and API auth exercises: the starter is not yet met, the model meets every rule, the tool-specific run note shows, and there is no overflow;
  - 28,507 links on 387 pages resolve.

#### M12g: Database Design and Testing path, with SQL playgrounds (commit: `89ec2fd`)

- **Database Design and Testing** has 8 lessons:
  - modelling;
  - primary and foreign keys;
  - normalisation from 1NF to 3NF;
  - constraints;
  - indexes and query plans;
  - transactions, isolation and locking;
  - PostgreSQL, MySQL and SQLite differences;
  - database testing and integrity checks.
- It also has interview practice (12 questions) and links to the SQL Practice Lab.
- The Database Engineering department's design, dialect and testing items now point to this path.
- **New `sqlplay` block:** an editable SQL textarea run on the SQL lab's real engine (sql.js in a Worker, a fresh copy of the ShopLite tables each run). `learn-practice.js` now reads a textarea's value as well as the code text of fixed examples.
- The path has 10 playgrounds:
  - a foreign-key violation;
  - CHECK and DEFAULT constraints;
  - a normalised join;
  - a query plan before and after an index;
  - a rollback;
  - an upsert;
  - orphan and duplicate checks.
- **Checks performed:**
  - `tests/unit/db-design.test.mjs` runs every playground with Python sqlite3 on the same setup. Each one errors or returns rows exactly as its lesson says: the foreign-key and CHECK messages, the upsert result `[1, 8]`, and the plan `USING INDEX`.
  - Curriculum test.
  - At 1280 and 390 px: the foreign-key error shows, the edited SQL runs, the plan shows the index search, and there is no overflow.
  - Because the shared runner changed, I checked that an existing SQL path example still runs.
  - 29,615 links on 403 pages resolve.

#### M12h: Specialised Testing path (commit: `2873051`)

- **Specialised Testing** has 8 lessons:
  - integration testing (stubs and drivers);
  - API testing for testers, with 2 `apitask` tasks;
  - database testing, with 2 `sqlplay` checks: a status audit and recomputed totals;
  - accessibility testing, with 2 `webplay` fixes and WCAG 2.2 questions;
  - UAT (an ordering task);
  - performance testing;
  - defect management with a root-cause analysis lab;
  - mobile and cross-device testing.
- It also has interview practice (10 questions).
- New writing lab `st-w-rca` in `manual-testing/writing-2.js`: a blameless root-cause analysis with 4 fields and 7 rules.
- The Software Testing department now lists API and accessibility testing as covered by this path.
- **Checks performed:**
  - writing-check test (the RCA model passes and its weak version misses exactly 6 rules);
  - `db-design.test.mjs` now also runs this path's playgrounds. This caught one wrong status value in a lesson query ('placed' instead of 'pending'), which I fixed, and the test now asserts that no order has an unlisted status;
  - curriculum test;
  - at 1280 and 390 px: the RCA lab renders with 4 fields, a weak answer gets not yet, the database playground runs, and there is no overflow.

#### M12i: Excel Formulas and Power BI paths built on the labs' own engines (commit: `c344401`)

- **Excel Formulas** has 8 lessons:
  - references; everyday functions; logic;
  - conditional sums and counts; text and dates; lookups; cleaning;
  - financial functions with budget and payroll projects.
  - Together they use all 55 Excel Practice Lab exercises, each exactly once.
- **Power BI: Power Query, Modelling and DAX** has 6 lessons:
  - Power Query cleaning; shaping; combining with projects;
  - star-schema modelling;
  - DAX basics; CALCULATE and time intelligence.
  - Together they use all 43 Power BI Practice Lab exercises, each exactly once.
- Both paths have interview practice (10 questions each).
- **How the labs are reused:** the `labset` block now mounts the Excel and Power BI labs with their own evaluators and inputs, with no copied engine or exercises. Their `exerciseInput` (and the Power BI `KIND_LABEL`) are now exported for this; nothing else changed in the labs.
- The Data and Analytics department now lists these as paths.
- **Checks performed:**
  - A new unit test confirms every lab exercise is used exactly once by an existing id; the curriculum test passes.
  - At 1280 and 390 px:
    - the Excel lab mounts in a lesson, refuses `=B2+B3` and accepts `=B2*B3`;
    - the Power BI lab mounts with its input;
    - there is no overflow.
  - Both standalone lab pages still mount their exercises.
  - 32,652 links on 447 pages resolve.

#### M12j: Data Engineering Foundations path and updated role journeys (commit: (this milestone's commit))

- **Data Engineering Foundations** (6 lessons):
  - ETL, ELT, batch and streaming;
  - SQL transformations (a clean, deduplicated contacts table with lineage);
  - incremental, idempotent loads (watermark plus INSERT OR IGNORE: 17 rows even when run twice);
  - warehouse modelling (a fact view and a monthly mart; slowly changing dimensions);
  - data-quality checks in one query;
  - orchestration and backfills.
  - It has interview practice (10 questions) and links to the SQL Practice Lab.
- **Journeys** now use the new paths, and there is an eighth, Data engineer: SQL, Python, Database Design, Data Engineering, then Machine Learning.
  - QA adds Specialised Testing.
  - Automation adds API Test Automation and Selenium.
  - Data analyst uses the Excel and Power BI paths.
  - Web adds Backend.
  - Backend adds Database Design and Linux.
  - AI adds Python, Machine Learning and Prompt Engineering.
  - DevOps adds Linux and Kubernetes.
- **Checks performed:**
  - `db-design.test.mjs` now runs all playgrounds of the three SQL-using paths and asserts the load count of 17.
  - The curriculum test passes, including that every journey step resolves.
  - At 390 px the incremental playground shows 17 and there is no overflow.
  - At 1280 and 390 px the home page shows 8 journeys, the first opens with 6 steps, no department card is marked in development, and search works.
  - 33,584 links on 461 pages resolve.

### Final inventory, 2026-11-08 (preview branch)

- **8 of 8 departments published.**
- **11 learning paths, all complete, 131 lessons:**

| Path | Department | Lessons |
|---|---|---|
| SQL | Database Engineering | 24 |
| Manual Software Testing | Software Testing | 24 |
| Test Design Techniques | Software Testing | 6 |
| Playwright with TypeScript | Automation | 15 |
| AI and LLM Foundations | AI | 10 |
| Statistics and Data Analysis | Data and Analytics | 9 |
| JavaScript Programming | Programming | 10 |
| HTTP and REST APIs | Web and Backend | 9 |
| HTML, CSS and the DOM | Web and Backend | 9 |
| Git and DevOps Foundations | DevOps, Cloud and Security | 8 |
| Application Security Foundations | DevOps, Cloud and Security | 7 |

- **249 generated learning pages**, including:
  - 10 interview-practice pages;
  - the SQL projects (5 and an index);
  - department pages;
  - the home page with search and journeys.
- **Interactive engines added in this mission, all in the browser:**

| Engine | What it does | Exercises |
|---|---|---|
| codecheck | Static Playwright code rules | 4 |
| aiviz | Teaching visualizers | 5 |
| numeric | Calculations from a table | 12 |
| jsrun | JavaScript in a sandboxed Worker | 12 |
| apitask | Requests to an in-page mock API | 8 |
| webplay | Script-free iframe with DOM and style checks | 8 |
| gitsim | Modelled Git repository | 7 |

  The earlier engines (SQL, locators, ShopLite bug hunt, writing labs and the Test Design Lab sets) remain.
- **Not done, by design or deferred:**
  - real Playwright, Python or Java execution: no large runtime downloads;
  - real AI model output: no runtime AI;
  - shell simulator, backend-fundamentals path, prompt-engineering and ML paths, API automation and Selenium paths;
  - progress saving: rule 7.7, the D1 exception is not approved.
- **No full regression was run.** Testing in this mission was focused per batch, as instructed.

## 3. Current inventory (built)

| Item | Count |
|---|---|
| Learning-path pages | 62 (home, 4 departments; SQL: 40; Manual Testing: path, 1 level, 3 modules, 10 lessons) plus ShopLite |
| Search index entries | 52 |
| Labs (unchanged) | 7 |
| Exercises | 223 in the labs + 50 in the SQL path (19 lesson tasks, 21 project milestones, 10 interview problems) + 10 concept questions |
| Flashcards | 181 |

## 4. Known limitations (current)

- Five departments have no page yet: Testing, Automation, AI, Programming and DevOps. They are listed as "in development" until they have content.
- Search covers departments, labs, the path and lessons. The labs' internal lessons and exercises are not indexed separately.
- The Query Explainer (blueprint E8, stage-by-stage row counts) is not built. The query-plan lessons teach with real EXPLAIN QUERY PLAN output instead.
- Database Engineering beyond SQL is planned only: design and modelling, PostgreSQL and database testing.

## 5. Next checkpoint

**Resume here (checkpoint after M12c).** Steps, in order:

1. *(Done in M12d.)* **Write and wire the lessons.**
   - `ai/ml-lessons.js`, the Machine Learning path. About 9 lessons, using the aiviz kinds regression, overfit, kmeans and tree, plus confusion.
   - `ai/prompt-lessons.js`, the Prompt Engineering path. Use the write labs pe-w-anatomy, pe-w-few-shot and pe-w-guardrails, the schema exercises pe-s-*, and quizzes on recorded outputs.
   - Wire both with the add_path helper pattern: curriculum, learn-html CONTENT (`writing: new Map(AI_WRITING...)` for the prompt path), the BUILD_ONLY list in eleventy.shared.js, the curriculum test's extras count and its block-type list (add "schema"), and the ai-engineering department.
   - Check in the browser: the new visualizers and the schema block, at 1280 and 390 px.
2. *(Done in M12e.)* **Backend Fundamentals path**, reusing apitask and quizzes.
3. *(Done in M12f.)* **API Automation and Selenium paths**: new codecheck exercises, plus predict blocks for the Selenium Java code.
4. *(Database design done in M12g.)* **Database design**, then *(done in M12h)* **specialised testing** (API, database and accessibility testing), then *(done in M12i)* **Excel and Power BI paths**.
5. **Final pass.**
   - Repair the multi-line rows of the milestone table (M7a onwards): they break the Markdown table.
   - Run the completion review.
