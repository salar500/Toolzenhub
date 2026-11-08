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

| M3c-1 | Manual Testing lessons 11 to 17 (Intermediate: Test Data and Coverage; Executing Tests and Reporting Bugs; Types of Testing) and the bug-report writing lab (model and two weak answers) | (this milestone's commit) | Unit tests (writing models and weak answers, curriculum 12 cases); at 1280 and 390: bug-report lab (weak answer not yet, good answer all items), bug life-cycle ordering accepted, no overflow; path roadmap lists 17 lessons | Other pages |

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

**M3c (remaining):** lessons 18 to 24 (exploratory, usability and compatibility testing; test planning; risk; Agile; acceptance criteria; metrics) and the items below. Lessons 11 to 17 are done. Original M3c scope: modules 4 to 8 (lessons 11 to 24 per [06](06-curriculum-specifications.md), section 3) as blocks in `manual-testing/lessons.js`, adding the intermediate and advanced levels to `curriculum.js`. Also:

- a bug-report writing lab (template bug report, in `manual-testing/writing.js`, with model and weak answers);
- the **Bug Hunting Simulator** as project 1: ShopLite release 1.1 in an iframe (stacked on a phone), a report form (area from `AREAS`, title, steps, expected, actual, severity) calling `matchReport`, found count and area hints after 3 misses, all in memory;
- a test plan writing lab;
- interview practice.

**Then:** M3d, the Test Design path wrapping the Test Design Lab; then Stages 4 to 11.
