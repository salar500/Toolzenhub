# Practice Labs learning platform

Owner roadmap of 2026-11-08 (Phases 3 to 10). **The plan for everything not yet built is `docs/practice-labs-development-blueprint.md`** (research, taxonomy, catalogue, architecture, waves, open decisions). This file owns the architecture, the content standard, the curriculum plan and the source register of the learning paths. Product rules stay in `product-decision-rules.md` (rule 4.10 for the section, 7 for persistence, 8.9 for date counting).

## 1. What exists (state, not plan)

| Item | State |
|---|---|
| Platform (pages, roadmap, desktop and phone layout, SEO, sitemap) | Built; 30 generated pages |
| SQL path | **Building**: 18 lessons published (6 beginner, 8 intermediate, 4 advanced), each with examples, runnable SQL, exercises, hints, solutions. Not complete: see section 7 |
| Manual Testing, Playwright, Power BI, Java, Python, API Testing, Git and GitHub | **Planned**. No pages. Listed as "Planned" (not linked) on `/practice-labs/` |
| Existing labs (`/tools/<id>/`, hub `/practice-labs.html`) | Unchanged. The SQL lab is also the engine and the exercise bank of the SQL path |

## 2. Architecture

- **Curriculum** `assets/js/practice-labs/curriculum.js`: plain data. Path, then levels (beginner, intermediate, advanced), then modules, then lessons (`id` = the content id, `slug` = the URL part). A path with status `planned` has no `levels`, so no page can exist for it.
- **Content**: a lesson's explanation, examples (with results produced by an independent SQLite build), common mistakes and exercise ids come from the SQL Practice Lab (`tools/sql-practice-lab/lessons.js`, `exercises.js`). The teaching sections the path adds (objectives, why it matters, analogy, knowledge check, summary, prerequisite) are in `practice-labs/sql-extras.js`. One source for every fact, so the lab and the path cannot disagree.
- **Pages** `practice-labs/learn-html.js` (build only) returns one finished `<main>` per node; `src/_data/learn.js` adds permalink and BreadcrumbList JSON-LD; `src/learn-pages.njk` paginates it. Same pattern as the directory pages. The sitemap collection picks the pages up from `sitemapOrder` (3.4 to 3.44).
- **Navigation**: the roadmap is the ecosystem sidebar markup (`nav.section-switcher`, modules as groups, lessons as links), so the desktop sidebar, the phone bar and drawer and the search come from `ui/section-rail.js` unchanged. `data-rail-noun="lesson"` makes it say "lesson" instead of "tool". Page frame: the one from `ecosystem-workspace.md` section 14.
- **Client** `entries/learn.js` starts the header, footer and rail; `practice-labs/learn-practice.js` loads only on a page with SQL to run: it reuses the lab's worker, runner and evaluator.
- Build-only modules (`curriculum.js`, `learn-html.js`, `sql-extras.js`) are in `BUILD_ONLY` (`eleventy.shared.js`).

## 3. URLs

`/practice-labs/` (all learning paths), `/practice-labs/<path>/`, `/practice-labs/<path>/<level>/`, `/practice-labs/<path>/<level>/<module>/`, `/practice-labs/<path>/<level>/<module>/<lesson>/`. The hub `/practice-labs.html` and every `/tools/<id>/` URL are unchanged (they stay the landing of the section and the standalone labs). Breadcrumb: Home, Practice Labs (the hub), path, level, module, lesson. Slugs are descriptive, lower case and unique within their parent (unit test).

## 4. Lesson template

Every published lesson shows these, in this order, only where they apply: title; what you will learn; before you start; the idea in plain words; why it matters at work; an everyday picture; worked examples (SQL, what it does, the expected result, run it yourself); practice (task, hints, solution, why it works); common mistakes; check your understanding (question and answer); summary; previous and next lesson; related lessons, labs and flashcards. The real-world application is the "why it matters" section. No section is padded: a lesson without an exercise says so and points to the sandbox.

## 5. Interface

- **Desktop**: roadmap on the left (current module open, current lesson marked, search), lesson in a reading column (about 780 px), practice cards in the flow of the lesson.
- **Phone**: the ecosystem phone bar names the lesson and opens the roadmap drawer; one column; breadcrumb trimmed to Home, Practice Labs and the last two steps (the line above the title links path, level and module); 16 px editor text so the phone does not zoom; 44 px buttons; results and code scroll inside their own box; previous and next stacked full width; a "Lesson 5 of 18" bar.
- **Execution**: SQL runs in the browser (sql.js, SQLite compiled to WebAssembly, in a Web Worker, fresh in-memory database per run, 3 second limit, nothing uploaded). Without script the lesson is fully readable (examples, results, hints and solutions are in the HTML).

## 6. Progress (rule 7.7)

Version 1 keeps **nothing**: the lesson shows its position ("Lesson 5 of 18") and nothing is saved, so there are no completion marks across pages. **Proposal, not approved**: an opt-in, device-only progress switch, the same pattern as the flashcards exception (`learning/progress-store.js`, off until chosen, one key, only lesson ids and a calendar day, validated on read, nothing sent), would allow completion marks and a resume link. It needs an owner decision and a rulebook exception before it is built.

## 7. Curriculum plan and gaps

SQL, built: databases, SELECT, calculations, errors, WHERE, sorting, LIMIT and DISTINCT, NULL, CASE, aggregates, joins, subqueries and WITH, UNION, INSERT/UPDATE/DELETE, cleaning, dialects, window functions (ranking), tables, constraints, views and indexes, transactions. **Not yet built**: recursive CTEs, execution plans and query tuning (EXPLAIN QUERY PLAN), more window-function lessons, the six practice projects (employees, banking, e-commerce, healthcare, business reporting, interview challenges). The path page says so. The other seven paths follow one complete path at a time; none is announced as available before it has real lessons, and the Playwright, Java, Python, Git and Power BI paths need an honest execution plan first (section 8).

## 8. Execution feasibility (decided per subject; not yet built except SQL)

| Subject | Plan |
|---|---|
| SQL | Built: SQLite WebAssembly, in the browser |
| Manual Testing | Scenarios, test-case and bug-report exercises with a checklist-style answer check; no execution needed |
| Git and GitHub | Command exercises checked against a simulated repository state (a small model in JS), plus workflow walk-throughs |
| API Testing | Request and response reading exercises on fixed examples; live calls only to the visitor's own tools, never to a ToolZen Hub service |
| Python | To investigate: Pyodide (large download, runs in the browser) against read-only examples with a stated expected output. Decide before building |
| Java | Syntax and reading exercises with stated expected output; no in-browser execution unless a verified, local option exists |
| Playwright | A browser automation runtime cannot run in a static page. Lessons use code to read, fix and explain, with local setup instructions; the page never claims to execute a test |
| Power BI | DAX and modelling exercises on a stated dataset with worked answers; clearly marked where Power BI Desktop is required |

## 9. Source register

Moved and expanded: `docs/practice-labs/15-source-register.md` (2026-11-08). It records every source consulted, with its evidence class and reliability, plus what was not researched. All lesson text, analogies, examples and exercises remain original to this site.

## 10. Checks run for this delivery (focused, no regression)

Unit: curriculum integrity (`tests/unit/practice-labs-curriculum.test.mjs`) and the sidebar groups test. Scripted browser check on the preview build: every internal link on the 30 pages resolves; the sitemap lists them; lesson has title, description, canonical, BreadcrumbList, one h1; at 1280 and 390 px an example runs, a wrong answer is judged "not yet" and the shown solution "correct", no horizontal overflow; the sidebar says "lessons". Not run: the browser regression suite, accessibility sweeps, visual baselines.

## 11. Remaining roadmap

See the blueprint: waves W0 to W9 (`docs/practice-labs-development-blueprint.md`, section 13) and the decisions awaiting the owner (section 20). The order of later paths described in section 7 above is superseded by the blueprint's waves.
