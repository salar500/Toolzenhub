# 06. Learning ecosystem roadmap and role journeys (B18, B19)

## What can honestly run in the browser

| Subject | Runnable in a visitor's browser? | Evidence | Consequence |
|---|---|---|---|
| SQL | **Yes, in principle.** SQLite compiled to WebAssembly (sql.js: MIT licence, in-memory database, optional worker build) | P (README) | Deterministic checking by comparing result sets; needs a new dependency and a spike on size and memory |
| Playwright | **No.** It is a Node.js library; tests run in Node and drive a real browser | P (README, issue) | Only reading, ordering and spotting-the-mistake exercises on locators, assertions and waits; never say "run Playwright" |
| Excel | Only with a formula evaluator that is correct and licensed; Excel compatibility cannot be claimed | U | Defer; verify a candidate engine's licence and function coverage first |
| Power BI and DAX | **No** | I | Concept and reading exercises at most; do not simulate a product that cannot be reproduced |
| Manual QA, API testing, interview preparation | Static: scenarios, test-design, request and response reading | existing Test Design Lab | Extend the existing engine and content schema |

## Curriculum shape (design, not content volume)

Beginner, Fundamentals, Examples, Interactive exercise, Guided practice, Realistic task, Debugging task, Assessment, Interview questions. Each stage is optional and **no stage is shipped as an empty shell**. The earlier approval already states the number of items is a planning target, not a quota (`practice-labs/18` condition 7): fewer, accurate, independently validated items beat volume. Every exercise needs an independent expected answer (rule 8.2).

References (UX and curriculum inspiration only, never copied): SQLBolt (one concept, then an interactive exercise, per lesson), W3Schools (short concept, runnable example, quiz). Both descriptions come from third-party pages (doc 00). Official documentation of the subject is the factual source for content.

## First vertical: SQL (recommendation, conditional)

Why SQL first: it is the only subject here with a real, checkable browser runtime; it serves testers (data validation queries), developers and analysts; answers can be verified deterministically; it matches the owner's testing audience. Why conditional: it adds the first third-party runtime dependency and executes visitor-written text.

**Gate: a feasibility spike** (no product code): measure the gzip size of the loader and the wasm file, memory for a 50,000-row sample, start-up time on a mid-range phone class, how queries are time-limited (a worker with a termination timer, since a runaway query must be stoppable), and confirm the exact licence text. Pass criteria are written in doc 07 (AC-SQL-SPIKE). If the spike fails, SQL is dropped or reduced to static "read the result" exercises, and the recorded reason stays here.

Security boundary (unchanged from the 2026-10-28 approval): SQL is not JavaScript, but it is still visitor-supplied text run by a runtime. It runs in a worker with a statement time limit, an in-memory database, no file or network access, a fixed set of datasets owned by the site, and results rendered with `textContent`. This is new scope and needs the owner's approval (O-3).

Suggested path, only after the spike passes: Orientation, SELECT and WHERE, sorting and limiting, aggregates and GROUP BY, joins, NULLs and data validation, subqueries, then "tester queries" (find orphan rows, duplicates, mismatched totals). Mini-project: a small order database with five questions. Assessment: a short timed-free set with explanations, scored locally.

## Second and later subjects (not now)

Playwright reading lab (static) and an interview-readiness set follow only after SQL shows the learning model is usable and maintainable (the request's own instruction). Excel waits for an evaluator decision. Power BI is not recommended beyond reading exercises.

## Role journeys (candidate, no promises)

| Role | Learning to practice to project to assessment | Exists today |
|---|---|---|
| Manual QA tester | Test design basics, boundary and equivalence, bug reports, Test Design Lab | Test Design Lab, Smart Flashcards (testing deck) |
| QA automation | JSON and API reading, JSONPath, Cron, then locators (static) | JSON Error-Fixing, JSONPath, Cron labs |
| SQL tester or developer | The SQL path above | nothing yet |
| Data or Excel professional | After an evaluator is chosen | nothing |

Resume, LinkedIn and portfolio templates are **not recommended** (doc 03, N22): off mission, no test oracle and a content-farm risk. Certificates are not offered, and no outcome ("job-ready", "hired") may be promised or implied; nothing may call anything accredited.

## Progress and privacy

Smart Flashcards has an approved, opt-in, browser-local saving exception (rule 7.7). The labs save nothing. Extending saving to new subjects needs its own approval and a rule 7.7 edit (O-6). Without it, a learner's progress resets on reload, which is acceptable for a first version. No account, no sync.
