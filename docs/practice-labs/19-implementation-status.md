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
- The Query Explainer (blueprint E8, stage-by-stage row counts) is not built. The query-plan lessons teach with real EXPLAIN QUERY PLAN output instead.
- Database Engineering beyond SQL is planned only: design and modelling, PostgreSQL and database testing.

## 5. Next checkpoint (exact resume point, 2026-11-08)

M3b is in progress. It is **committed locally and not pushed**, because nothing new is wired into pages yet. Files:

| File | Content |
|---|---|
| `assets/js/practice-labs/writing-check.js` | Pure rubric checker |
| `tests/unit/writing-check.test.mjs` | 3 passing tests |
| `assets/js/practice-labs/manual-testing/writing.js` | 4 writing exercises, each with a model answer and weak answers |
| `assets/js/practice-labs/manual-testing/lessons.js` | Lessons 1 to 10 (modules 1 to 3) as typed blocks |
| `assets/js/practice-labs/blocks-html.js` | Build-time renderer for text, list, example, callout, quiz, order, write and shoplite blocks |

**Remaining steps for M3b, in order:**

1. In `learn-html.js`, add `blocksLessonBody(entry, content)`. It renders the same header, lesson card and intro as the SQL lessons, then `renderBlocks(data.blocks, { quizBlock, writing: content.writing, idPrefix: lesson.id })`, then why, analogy, mistakes, check, summary, the pager and related links. Then:
   - make `lessonBody` call it when `content.kind === "blocks"`;
   - add `CONTENT["manual-testing"]` (kind "blocks", lessons, writing Map, labTool `test-design-lab`, `morePractice` text) and the `morePractice` text for SQL;
   - make the path page's "More practice" text use `content.morePractice`.
2. In `curriculum.js`, add the path `manual-testing` (department `software-testing`, status building, beginner level only: modules `what-testing-is`, `life-cycle` and `writing-test-cases` with the 10 lesson slugs, plus a `coming` list).
3. In `departments.js`, give software-testing `paths: ["manual-testing"]`, an intro of 150+ words, a start link, and Manual testing as a "path" subject.
4. Add `blocks-html.js` and `manual-testing/lessons.js` to BUILD_ONLY.
5. Add client modules, loaded from `entries/learn.js` when present:
   - `learn-writing.js`: collect `[data-field]` values, run `checkWriting`, list met and missing items, open the model answer after the first check, "Copy as text" to the clipboard;
   - `learn-order.js`: `data-order` holds the correct index of each shown item; check the selects.
6. Add CSS for `.learn-order`, `.learn-write` and `.learn-sample`. Update the curriculum unit test to be generic per path (lesson ids per content source, page counts).
7. Checks: build; at 1280 and 390 a quiz, an order and a writing lab work (model passes, weak answer misses); no overflow; links resolve. Then commit and push, verify Pages, and record M3b here.

A draft patch script for steps 1 to 4 is in the session scratchpad (`patch_mt.py`). It expects a `blocks_lesson.js` that was **not written yet**, so write `blocksLessonBody` directly.

**After M3b:**

- **M3c:** modules 4 to 8 (lessons 11 to 24 per [06](06-curriculum-specifications.md), section 3), with the Bug Hunting Simulator as a project. It shows ShopLite in an iframe plus a report form that calls `matchReport`; the bugs found are kept in memory only. Also a bug-report writing lab and the interview practice set.
- **M3d:** the Test Design path, wrapping the Test Design Lab's 20 exercises.
- Then Stages 4 to 11 per the mission.
