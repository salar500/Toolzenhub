# 16. Existing assets: preserve and reuse plan

**Principle (the owner, 2026-11-08):** working Practice Labs assets are preserved and reused, never rebuilt without a defect or a real gap. Every wave in the [blueprint](../practice-labs-development-blueprint.md) starts from this inventory.

All facts below were read from the repository at `f2b9d3c` on 2026-11-08 [V].

## 1. Inventory

### 1.1 Shared learning framework (`assets/js/learning/`)

| Module | Lines | What it does now | Reuse in the blueprint |
|---|---|---|---|
| `lab-shell.js` | 473 | One flow for every lab: exercise list grouped by level or topic, one exercise at a time, explicit Check, verdicts (`VERDICT_WORD`), progressive hints (`MAX_HINTS`), "solution viewed" status, `runEvaluator`, `mountLab` | **The E2 challenge engine.** It is extended (new checker types plug into `runEvaluator`), not replaced. Standalone challenge sets and interview modules mount it |
| `lab-page.js` | 157 | Build-time lab page (intro, worked example, how-to, notes) plus `initLab` | Kept for the `/tools/<id>/` labs. Lesson pages use the learning-path renderer |
| `content-schema.js` | 147 | `validateExerciseSet`, `validateDeck`, limits | **Extended** with `validateLesson` ([09](09-technical-architecture.md), section 2). Existing validators are unchanged |
| `dom.js` | 66 | Safe DOM building (text only, never HTML) | Used by every new engine UI |
| `progress-store.js` | 259 | Opt-in, local flashcard progress (the rule 7.7 exception) | **The pattern and code base** for the progress proposal D1 (a new key; the same validation, export and import) |
| `scheduler.js`, `session.js` | 142, 104 | Leitner scheduling and flashcard passes (pure) | Reused if D1 is approved, for "revise this lesson" from the decks |

All 7 labs mount the shell: `cron-challenge-lab`, `excel-practice-lab`, `json-error-fixing-lab`, `jsonpath-challenge-lab`, `power-bi-practice-lab`, `sql-practice-lab` and `test-design-lab` [V].

### 1.2 Labs (routes `/tools/<id>/`, **unchanged and kept**)

| Lab | Exercises | Lessons | Engine | Reused by (path / experience) |
|---|---|---|---|---|
| SQL Practice Lab | 49 | 18 | sql.js worker, runner, `compareResults` evaluator, dataset | P50 SQL (built), E1 SQL, E8 JOIN visualizer and Query Explainer, E9 data cleaning, P74, P75 |
| Excel Practice Lab | 55 | 13 | Formula parser and engine (`formula/`), sheet view | P70 Excel (wrap, as SQL was), E9 Data Lab, P74 |
| Power BI Practice Lab | 43 | 13 | DAX engine (`dax/`), Power Query engine (`pq/`), model, datasets, report | P71 Power BI (wrap), E11 |
| Test Design Lab | 20 | 0 | Partition input plus evaluator | P02 Test Design (its exercises are attached to lessons), P01 M4 |
| JSON Error-Fixing Lab | 18 | 0 | JSON evaluator | P03 API Testing L6 (JSON bodies), P30 JS (objects and JSON) |
| JSONPath Challenge Lab | 19 | 0 | JSONPath evaluator | P03 L6 and L8 (assertions), E6 response explorer |
| Cron Challenge Lab | 19 | 0 | Cron evaluator | P41 CI/CD (scheduled pipelines), P14 command line (cron) |

### 1.3 Smart Flashcards (181 cards)

| Deck | Cards | Linked from |
|---|---|---|
| SQL | 30 | P50 (built) |
| software-testing | 29 | P01, P02 |
| HTTP APIs | 28 | P03, P53 |
| JSON | 30 | P03, P30 |
| Excel | 31 | P70 |
| Power BI | 33 | P71 |

New decks (Git, Playwright, Python, AI) are added through the existing deck schema (`validateDeck`) when their path ships.

### 1.4 Developer Tools whose engines the paths reuse (pages unchanged)

| Tool | Reused as |
|---|---|
| JSON Formatter, JSON Compare, JSON ⇄ CSV | E6 response viewer (pretty print, diff of responses), E9 dataset import |
| JSONPath Tester | E6 assertion box, P03 L8 |
| JWT Decoder | P03 L9 authentication (decode mock tokens) |
| URL Parser | P03 L5 (path and query parameters), P53 |
| Base64 | P03 L9 (Basic auth header) |
| Unix Timestamp Converter | P03 and P54 (timestamps in payloads) |
| Text Diff, List Comparer | E7 git simulator (file diffs), P01 regression comparison exercises |
| Cron Expression Explainer | P41 |
| UUID Generator | E6 mock API ids, P03 L12 test data |

**Rule:** the paths import the pure engine modules. They **link** to the tool page for the full tool, and never copy its UI (rule 4.2: a tool lives in one section).

### 1.5 Learning-path platform (built at `9b6e7e9`)

`practice-labs/curriculum.js`, `learn-html.js`, `sql-extras.js`, `learn-practice.js`, `entries/learn.js`, `pages/learn.css`, `src/_data/learn.js`, `src/learn-pages.njk`, and the rail noun option in `ui/section-rail.js`.

In W0 these evolve in place into the registries and block model ([09](09-technical-architecture.md)). Nothing is thrown away:

- `curriculum.js` becomes `registry/paths.js` plus `paths/sql/curriculum.js`;
- `sql-extras.js` becomes the SQL lessons' extra blocks through the adapter;
- `learn-html.js` becomes the generic assembler.

## 2. Preservation rules (binding on the development stage)

1. **URLs:** no existing URL changes. Everything stays where it is today:
   - `/tools/<id>/` for the 7 labs and the flashcards;
   - `/practice-labs.html`;
   - `/practice-labs/`;
   - every `/practice-labs/sql/...` lesson.
2. **Exercise ids are permanent.** The 223 exercise ids keep their meaning. An exercise's expected result changes only together with its solution (the existing rule in each `exercises.js` header). Paths reference exercises by id and never fork copies.
3. **No duplicate content.** A lesson that a lab already teaches is wrapped (lesson data plus extras or blocks) and never rewritten from scratch. Lab pages keep their own lessons; the path is a second, structured route to the same content.
4. **Engines are imported, not cloned.** A path that needs SQL, DAX, Excel formulas or JSONPath imports the lab's engine module, so one fix improves every page that uses it.
5. **Regression boundary.** When a shared module changes (`lab-shell.js`, an engine, `section-rail.js`), the sanity checks include 1 or 2 existing lab pages that use it ([13](13-acceptance-criteria.md), section 3, shared component row).
6. **Retire nothing in this programme.** A lab page is kept even when its path covers the same ground, because it has its own search intent and its own users (the exercise-first entry).

## 3. Effort saved (estimate, opinion)

Reuse removes these from new work:

- the challenge engine;
- two spreadsheet and BI engines (Excel formula, DAX, Power Query);
- the SQL runtime;
- 223 verified exercises;
- 44 lessons of source content for 3 paths;
- 181 flashcards;
- 10 developer-tool engines.

**[Opinion]** At a guess, about a third of W1, W2 and W6 effort shrinks to wrapping and linking. This is a judgement, not a measurement.

## 4. Known gaps in the existing assets (verified, to fix when touched)

| Gap | Where | Fix (wave) |
|---|---|---|
| First code example sits 1,770 px down on a 390 × 844 phone (about 2.1 screens), measured on `/practice-labs/sql/intermediate/combining/joining-tables/` | Lesson layout | Phone lesson card (W0); acceptance at 1.5 screens or less |
| No recursive queries; EXPLAIN mentioned once; the 3 `sql-project-*` exercises are attached to no lesson | SQL content | W1 |
| Test Design, JSON, JSONPath and Cron labs have no lessons | Labs | W2 (Test Design), W3 (JSON, JSONPath), W9 (Cron) |
| The learning-path editor is a plain textarea without line numbers | `learn-practice` | W0 (line-number gutter, sticky action bar on phones) |
