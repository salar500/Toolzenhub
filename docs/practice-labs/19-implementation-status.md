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
| M2b | SQL part 2: 5 projects (HR analytics, bank statement checks, shop sales report reusing the lab's 3 report exercises by id, clinic appointments, KPI pack) with 24 checked milestones; interview practice (10 concept questions with a new quiz engine, 10 coding problems); clinic and targets datasets (synthetic); projects index; roadmap groups; search covers projects and interview; SQL path status **complete** (24 lessons, 5 projects, interview) | (this milestone's commit) | Generator: 50 path exercises run, empty-answer guard (caught and replaced one problem whose answer was empty); unit test; sql.js judged all 34 milestones and problems correct (incl. the 3 reused lab exercises and data-changing milestones); a wrong data change rejected; quiz right and wrong paths; search finds projects; roadmap groups; 4,280 links on 47 pages resolve, index of 39 entries valid; phone: project, interview and index pages without overflow | Lab pages, accessibility sweep |

**Design decisions in M2b:**

- **Project 6 merged.** The planned sixth project ("interview challenges") would have duplicated the interview page, so it became the interview page.
- **Clinic data.** Patients are identified by synthetic codes, not names.

## 3. Current inventory (built)

| Item | Count |
|---|---|
| Learning-path pages | 47 (home, 3 departments, SQL: 1 path, 3 levels, 8 modules, 24 lessons, projects index, 5 projects, interview practice) |
| Search index entries | 39 |
| Labs (unchanged) | 7 |
| Exercises | 223 in the labs + 50 in the SQL path (19 lesson tasks, 21 project milestones, 10 interview problems) + 10 concept questions |
| Flashcards | 181 |

## 4. Known limitations (current)

- Five departments have no page yet: Testing, Automation, AI, Programming and DevOps. They are listed as "in development" until they have content.
- Search covers departments, labs, the path and lessons. The labs' internal lessons and exercises are not indexed separately.
- The SQL JOIN Visualizer and the Query Explainer (blueprint E8) are not built yet. The joins lesson teaches with examples and tasks only.
- Database Engineering beyond SQL is planned only: design and modelling, PostgreSQL and database testing.

## 5. Next checkpoint

Stage 2 closing item: an interactive JOIN visualizer embedded in the joins lesson, using the real engine. Then Stage 3, Software Testing and Quality Engineering:

1. ShopLite (the practice app with seeded bugs);
2. the structured writing labs;
3. the Bug Hunting Simulator;
4. the Manual Testing and Test Design paths.
