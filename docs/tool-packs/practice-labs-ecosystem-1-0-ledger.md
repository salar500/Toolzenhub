# Practice Labs & Smart Flashcards Ecosystem 1.0: development ledger

Single progress ledger for packs 51 to 56. Requirements: `docs/ecosystem-review/practice-labs/` (FR and AC ids below refer to docs 10, 11, 12, 15). Approval record: `docs/ecosystem-review/practice-labs/18-CONSOLIDATED-OWNER-APPROVAL.md`. Pack numbers are the next free numbers after the last spec in this folder (41) and after the calculators packs 45 to 50; the research package called them LP-1 to LP-6 (LP-n = pack 50 + n). This file is the continuation point after any interruption: read it, then `git log`.

Status values: NOT_STARTED, IN_PROGRESS, BLOCKED, IMPLEMENTED, VERIFIED, COMPLETED. Release state of everything here: **local only** (not pushed, not on GitHub Pages, not on production).

Base commit: `df4dd66`. Owner scope: Option B, with the conditions recorded in doc 18 (item counts are a planning target, not a quota).

## Architecture decisions (routine, recorded once)

- Stack unchanged: vanilla ES modules, Eleventy, the shared tool layer. No new dependency, no visitor code executed, no network call by the new code.
- Shared learning layer in `assets/js/learning/`: `dom.js` (safe element building, no HTML strings), `content-schema.js` (deck and exercise-set validators), `scheduler.js` (Leitner boxes, integer calendar days), `session.js` (a pass over cards), `progress-store.js` (the optional saved progress). Pack 53 adds `lab-shell.js` when the second consumer exists (rule 9.4).
- One stylesheet for all five tools, `assets/css/tools/learning.css`, registered per tool in `src/_data/toolStyles.json`; colours are the shared tokens.
- Decks and exercise sets are plain data loaded on demand (`import()`); the page validates them at run time and the unit tests validate them at build.
- Tool ids and routes: `smart-flashcards`, `json-error-fixing-lab`, `jsonpath-challenge-lab`, `cron-challenge-lab`, `test-design-lab`, all `/tools/<id>/` in Developer Tools.
- Tests are updated deliberately; each change to a pin is named below.

## Pack ledger

| Pack | Research name | Status | Commit |
|---|---|---|---|
| 51 Smart Flashcards core, JSON deck, scheduler, opt-in progress | LP-1 | IMPLEMENTED (see below) | see git log |
| 52 HTTP and APIs deck, Software testing deck | LP-2 | IMPLEMENTED (see below) | see git log |
| 53 Lab shell and JSON Error-Fixing Lab | LP-3 | IMPLEMENTED (see below) | see git log |
| 54 JSONPath and Cron Challenge Labs | LP-4 | IMPLEMENTED (see below) | see git log |
| 55 Test Design Lab | LP-5 | NOT_STARTED | |
| 56 Integration and consolidated checkpoint | LP-6 | NOT_STARTED | |

## Pack 51: Smart Flashcards core, JSON deck, scheduler, opt-in progress

Requirements: FR-FC-001 to FR-FC-026 (the deck list shows one deck until pack 52), FR-LRN-001 to FR-LRN-014 as they apply, FR-INT-001, FR-INT-002.

Implemented:
- Page `assets/js/tools/smart-flashcards/index.js` (static intro and explanatory sections in `markup()`, the interactive part built with `learning/dom.js`): deck choice, topic filter (the last topic cannot be unchecked), optional shuffle, recall cards (reveal, then I knew it / I did not know it) and single-answer choice cards (Check answer), one grade per card, Previous (read-only) and Next (unlocked by grading), summary with plain counts, review of missed cards, study again, due-card review, and the progress panel (switch, export, import, reset, confirmation dialog). No flip animation, no single-key shortcuts, arrow keys only inside the card region, no timer, points or streaks.
- JSON deck `decks/json.js`: 30 original cards over 7 topics (value types, syntax errors, strings and escaping, numbers, JSON and JavaScript, keys and duplicates, JSON in API responses).
- Scheduler: boxes 1 to 5, intervals 1, 3, 7, 14, 30 days, known moves up, not known returns to box 1, a first "known" puts a new card in box 2, a future last-review day counts as due today; local calendar day numbers.
- Progress: key `tz-learn-v1`, at most 100 KB, off by default, validated on read and on import (unknown decks and cards, boxes, days, prototype-polluting keys, size, format marker), export file `toolzenhub-flashcards-progress-<date>.json`, merge on import by later review day, reset and turn-off remove only this key.
- Rulebook 7.7 now carries the narrow approved exception (replaced in place, one rule); `src/privacy.njk` has a "Saved Flashcard Progress" section. Analytics behaviour is unchanged.
- Catalog entry, stylesheet list, growth identity ledger record, hand-written test lists (below).

Tests added or changed (deliberate):
- NEW `tests/unit/learning-scheduler.test.mjs` (scheduler checked against `Date.UTC` and a hand-written box table; session rules): 27 pass.
- NEW `tests/unit/learning-progress.test.mjs` (validation, hostile and oversized input, prototype keys, adapter with blocked and full storage, privacy and rule wording): 25 pass.
- NEW `tests/unit/flashcards-content.test.mjs` (schema negatives, manifest, every deck valid, claims on the JSON cards checked against the strict engine by a hand-written table, JavaScript claims run): 42 pass.
- NEW `tests/browser/smart-flashcards.spec.js`: 18 of 18 pass on subpath-desktop and on subpath-mobile (one worker, one project at a time).
- Changed pins: `catalog.test.mjs`, `relationships.test.mjs`, `search.test.mjs` (tool count 60 to 61, the tool's pinned aliases), `sections.test.mjs`, `tool-capabilities.test.mjs` (the new id added to the hand-written lists); `tests/browser/developer-tools-related.spec.js` (the new tool's curated list); `tests/inventory/url-inventory.json` regenerated (103 live pages).

Defects found and fixed in this pack:
- The correct option was the single longest on 18 of 24 choice cards, a tell. Distractors were lengthened and a content test now fails if it passes 60 percent.
- The prompt-uniqueness check treated "Is this valid JSON?" with different code samples as duplicates; the check now includes the code.
- The asset checker read the word `import` in an aria-label followed by a quote as a static import; the label was reworded.
- A test helper assumed topic boxes keep their identity across redraws; the helper looks each one up again.

Known limits: the deck has had one reviewer (the author); the review record says so. Arrow-key navigation is implemented but has no dedicated browser test yet (to be added at the checkpoint). Only system Chrome was used; no screen reader was used.

## Pack 52: HTTP and APIs deck, Software Testing deck

Requirements: FR-FC-027 to FR-FC-040 (the two further decks), FR-INT-003. No second page: the decks reuse the pack 51 engine, scheduler and progress store unchanged.

Implemented:
- `decks/http-apis.js`: 28 original cards over 5 topics (methods, status codes, headers and bodies, caching, API practice), sourced to RFC 9110, RFC 9111, RFC 5789 and RFC 6585.
- `decks/software-testing.js`: 29 original cards over 5 topics (basic terms, levels and types, test design, defects and reports, practice and judgement), sourced to the ISTQB Glossary and ISO/IEC/IEEE 29119 and described as common usage; every boundary card states its own domain, inclusivity and (for decimals) step size.
- Both are registered in the `DECKS` manifest (card counts 28 and 29). Saved progress now covers 87 cards across three decks; imports for the new deck ids are validated against their card ids.

Content counts (honest): planned target for the three decks was about 90 cards in the research package; authored and validated 87 (30 + 28 + 29); published locally 87; deferred 0. The count is a target, not a quota (doc 18).

Tests added or changed (deliberate):
- `tests/unit/flashcards-content.test.mjs`: 52 pass (was 42). New independent checks: every "NNN Name" on an HTTP card against a status table written by hand from the RFCs; method properties; the boundary and partition cards are checked against a brute-force scan of a number line (finds where validity changes and reads the boundaries off, a different method from the two-value and three-value rules the cards state); decision table size.
- `tests/browser/smart-flashcards.spec.js`: 20 of 20 on subpath-desktop (two new tests study a whole pass through each new deck and check a plain summary with no percentage).

Defects found and fixed in this pack:
- All 19 HTTP choice cards first had the correct answer in position 1, and 17 of 20 testing cards had it as the single longest option. Positions were rotated and options rebalanced; the existing tell checks (position spread, longest-option share at or below 60 percent) cover both decks.
- One card said POST and PATCH are "not guaranteed" to be idempotent, tripping the banned-word check; reworded to "not defined as idempotent".
- 401 card said the server "should" send WWW-Authenticate; the RFC says it must, so the wording now states what the response carries.
- A test regex lost its word-boundary escapes when written (control characters in the file); restored.

Known limits: one reviewer (the author) for both decks, recorded in each deck's review record. HTTP card text describes RFC 9110 semantics; individual APIs may differ and the cards say so where it matters.

## Pack 53: Lab shell and JSON Error-Fixing Lab

Requirements: FR-LAB-001 to FR-LAB-014, FR-JEF-001 to FR-JEF-006, FR-LRN shared items as they apply.

Implemented:
- `learning/lab-shell.js` (the exercise list, one exercise at a time, explicit Check answer, hints up to three, solution, Reset exercise, Previous/Next, plain counts, the related-tool link; an evaluator that throws is a plain error state; a stale result is removed on edit; the same answer checked twice renders and announces once; a response that cannot be checked is not an attempt), `learning/lab-page.js` (static page text, validation of the exercise set, mounting).
- `tools/json-error-fixing-lab/`: 18 original exercises (6 beginner, 7 intermediate, 5 advanced) covering every fault in FR-JEF-001, the evaluator on top of the JSON Formatter's strict engine (`analyze`) and `JSON.parse`, comparing values with no type coercion, array order kept, key order ignored, repeated keys refused, differences listed as paths without the expected values.
- Catalog entry (Developer Tools), stylesheet list, growth ledger record.

Content counts: planned about 24 in the research package; authored and validated 18 (the requirement minimum is 16); published locally 18; deferred 0.

Tests added or changed (deliberate):
- NEW `tests/unit/json-error-fixing-lab.test.mjs`: 27 pass. Independent oracle: Python's json module, strict (NaN, Infinity and duplicate keys refused), confirms all 18 starting texts are rejected and all 18 solutions parse to the expected value with types compared strictly. Also: every fault covered, layouts and key orders accepted, wrong types and values refused without leaking expected text values, hostile and oversized input, prototype keys, the shell's error and status rules.
- NEW `tests/helpers/lab-contract.mjs`: the browser behaviour shared by every text lab (10 tests). NEW `tests/browser/json-error-fixing-lab.spec.js`: 5 lab-specific tests. 15 of 15 on subpath-desktop and on subpath-mobile.
- Changed pins: the same five catalog-level unit tests and `developer-tools-related.spec.js` as pack 51, the search index coarse size backstop 58,000 to 62,000 bytes (the comment in that test says it must rise with the catalog), the regenerated inventory (104 live pages).

Defects found and fixed in this pack:
- A response that could not be checked (empty, over the limit) still marked the exercise as in progress; now only a real check does.
- The exercise-set header required a description that the set lacked.
- A test expectation about the path of a key named `__proto__` was wrong (the path text is `$.__proto__`); the test, not the product, was corrected.

Known limits: one author. The checker uses the JSON Formatter's engine, so the Python oracle is the independent evidence for the exercise data, not for the engine itself (the engine has its own tests).

## Pack 54: JSONPath and Cron Challenge Labs

Requirements: FR-JPC-001 to FR-JPC-006, FR-CRN-001 to FR-CRN-006, FR-LAB items through the shared shell.

Implemented:
- `tools/jsonpath-challenge-lab/`: 19 original exercises (6 beginner, 7 intermediate, 6 advanced) on one built-in library document. The evaluator runs the page's RFC 9535 engine and compares the selected nodes as Normalized Paths (multiset: a node selected twice is a difference; order matters only where the exercise says so; equal values at different nodes are different nodes). Wrong answers list up to five extra and five missing paths. Engine refusals (syntax, `match()`/`search()`, length) are Cannot check with the engine message and position; the engine's work bound is Cannot check as well.
- `tools/cron-challenge-lab/`: 19 original exercises (5 beginner, 7 intermediate, 7 advanced) in the Cronie dialect, times in UTC. Equivalence is canonical, not a time window: minute, hour and month value sets plus a 31 by 7 day table built with Cronie's rule (both day fields must match when either is a star field, either one is enough otherwise). Wrong valid answers say which of minutes, hours, months or days differ and list the next three runs from the exercise's fixed reference time. The method and its limits (no time zones or DST, no never-running schedules) are stated on the page.
- Catalog entries, stylesheet list, growth records.

Content counts: planned about 16 and 14 (research minimums); authored and validated 19 and 19; published locally 38; deferred 0.

Tests added or changed (deliberate):
- NEW `tests/unit/jsonpath-challenge-lab.test.mjs`: 27 pass. Independent oracle: a JSONPath subset evaluator written in Python. Hand-written paths, Python and the page's engine agree on all 19 solutions, and Python and the engine agree on 28 further queries (slices with steps, unions, filters with and/or/not, count(), descendant, missing members). Values shown are checked against the hand-written paths by a plain walk.
- NEW `tests/unit/cron-challenge-lab.test.mjs`: 27 pass. Independent oracle: a cron implementation in Python that walks real calendar dates. It lists the next three runs from each reference time (equal to the engine's for all 19 solutions) and decides sameness of 62 hand-written claims by comparing every run over four calendar years (2026 to 2029, including a leap day); the table, Python and the page's canonical comparison agree on all of them.
- NEW `tests/browser/jsonpath-challenge-lab.spec.js` and `tests/browser/cron-challenge-lab.spec.js` (10 shared contract tests each plus 7 lab-specific): 17 of 17 each on subpath-desktop and subpath-mobile.
- Stale-count guard added to the three lab unit tests (catalog SEO text and set description must state the real exercise count).
- Changed pins: the five catalog-level unit tests, `developer-tools-related.spec.js`, the inventory (106 live pages).

Defects found and fixed in this pack:
- A block comment in the cron evaluator contained the characters that close a comment, a syntax error that made the module fail to load; the comment was reworded. Caught by the unit test run.
- The JSONPath SEO text and spec said 18 exercises when there are 19; corrected and now guarded by a test.
- One equivalence claim in the table was an invalid expression (hour 30) and so Cannot check, not Not yet; the claim was replaced.

Known limits: one author. The Python JSONPath evaluator covers only the subset the exercises use. The cron comparison does not distinguish schedules that never match a real date and does not model time zones or daylight saving time; both are stated on the page.
