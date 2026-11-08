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

| # | Milestone | Commit | Preview | Checks run (feature-specific only) | Not run |
|---|---|---|---|---|---|
| M1 | Stage 1 foundation: department registry (the owner's 8); Practice Labs home rebuilt around departments with search (build-time index, department, type and level filters); 3 department pages (Database, Data and Analytics, Web and Backend); department step in breadcrumbs; lessons reordered (lesson card, first example right after the idea, "Your turn" task right after it); rule 4.10 updated | (this milestone's commit) | see report | Curriculum unit test (7 cases, incl. namespace, department text of 150+ words, search index targets); build; script: 2,614 internal links on 33 pages and the hub resolve; index entries point to built pages; department pages have one H1, canonical and breadcrumb data; unpublished departments have no page; at 1280 and 390: home lists 8 departments (3 linked), search finds lessons and filters by type and level, department page shows its labs, sidebar says "pages", lesson first example at 601 / 816 px and first task at 1,273 / 1,581 px, the task's solution is judged correct, no horizontal overflow | Full suites, the lab pages themselves, accessibility sweep |

## 3. Current inventory (built)

| Item | Count |
|---|---|
| Learning-path pages | 33 (home, 3 departments, SQL: 1 path, 3 levels, 7 modules, 18 lessons) |
| Search index entries | 27 |
| Labs (unchanged) | 7 |
| Exercises | 223 |
| Flashcards | 181 |

## 4. Known limitations (current)

- Five departments have no page yet: Testing, Automation, AI, Programming and DevOps. They are listed as "in development" until they have content.
- Search covers departments, labs, the path and lessons. The labs' internal lessons and exercises are not indexed separately.
- The SQL path is still missing its six lessons, its projects and its interview set (Stage 2).

## 5. Next checkpoint

Stage 2, Database Engineering: complete SQL ([06](06-curriculum-specifications.md), section 2; [18](18-department-specifications.md), D5).
