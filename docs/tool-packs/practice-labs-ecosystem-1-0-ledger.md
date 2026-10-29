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
| 55 Test Design Lab | LP-5 | IMPLEMENTED (see below) | see git log |
| 56 Integration and consolidated checkpoint | LP-6 | IMPLEMENTED (see below) | see git log |

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

## Pack 55: Test Design Lab

Requirements: FR-TDL-001 to FR-TDL-008, FR-LAB items through the shared shell.

Implemented:
- `tools/test-design-lab/`: 20 original exercises over whole numbers, ten on boundary values (3 beginner/intermediate/advanced mix, two-value and three-value forms stated per exercise) and ten on equivalence partitions. Every specification says whether each limit is included and that only whole numbers are meant.
- The evaluator reads a declarative rule held in the exercise data. For boundary values it finds the first and last valid whole numbers from the minimum, the maximum and their inclusive flags, builds the required set (two or three values per boundary), accepts any answer that contains it, lists extras as neither wrong nor needed, and names missing values by role, not number. For partitions it places each sample value by interval and reports one word per value and a count. Input limits: 30 values, plain whole numbers up to 1,000,000,000 (no signs other than minus, no leading zeros), 2,000 characters.
- Shell change (deliberate, shared): the response control and its label, the empty-answer test and message, and the related-tool note can now be chosen per exercise, so one lab can mix a text answer and labelled selects.
- Page states the scope: whole numbers only, text, dates, decimals and field combinations not assessed, no certification, exam or syllabus claim, and that textbooks differ on two-value and three-value analysis.

Content counts: planned 20 (10 + 10, the requirement minimums); authored and validated 20; published locally 20; deferred 0.

Tests added or changed (deliberate):
- NEW `tests/unit/test-design-lab.test.mjs`: 32 pass. Independent oracle: Python builds a yes/no predicate for each generated rule, scans the number line for every place validity changes, and reads the boundary values off those places. A seeded corpus of 2,000 generated rules with seven answers each (over 10,000 boundary cases, thousands of each verdict) gives the same required set, the same verdict and the same count of present values; 400 generated tilings give the same partition for every value. Also: every partition set tiles the integers exactly once (scanned over -2,500 to 2,500), labels state their own limits, every partition has a sample, wrong answers and input that is not usable behave as stated, no certification or exam wording.
- NEW `tests/browser/test-design-lab.spec.js` (10 shared contract tests plus 10 lab-specific): 20 of 20 on subpath-desktop and on subpath-mobile.
- Changed pins: the five catalog-level unit tests, `developer-tools-related.spec.js`, the inventory (107 live pages).

Defects found and fixed in this pack:
- A learner typing a thousands separator ("1,000") had it silently read as the two values 1 and 0. Tokens with leading zeros are now refused with the token named. Found by a test written for hostile input, not by a user.
- A first test for "no exam wording" matched the word "example"; it now matches whole words.

Known limits: one author, so the specifications have not had the second reviewer FR-TDL-001 asks for; this is recorded here and in the set's review record. The technique is described as commonly taught and the page says the forms differ between textbooks.

## Pack 56: Integration and consolidated checkpoint (LP-6)

Changes:
- Smart Flashcards: the "The Decks" copy now describes all three decks (topics taken from the deck data) and names the four labs in plain text. Its related list is now json-formatter, jsonpath-tester, json-error-fixing-lab, test-design-lab. No hard-coded href was added: the link checker resolves JS-template hrefs from the site root, so plain text was used (a first version with relative links failed the link check and was corrected).
- Developer Tools section text in `categories.js` was NOT changed: it is pinned by the home DOM baseline and the SEO baseline, it is still true, and changing it would need baselines regenerated. Recorded as deferred (FR-INT-006 asks only for a minimal update).
- Stale pins from earlier work corrected in six older specs: Developer Tools now lists 17 tools (was 12), and the All Tools section-title lists include PDF Tools, a section that predates this work. No assertion was weakened.
- One flashcards test made deterministic (it addressed checkboxes that are redrawn after each change); it failed once on mobile under load, then passed 4 of 4 repeats.

Checkpoint results (all local, system Chrome only):
- Full unit suite: 3,577 tests, 3,573 pass, 0 fail, 4 skipped (skips are existing environment-dependent ones).
- Learning and related browser specs on subpath-desktop: 88 of 88; on subpath-mobile: 68 of 69 on the first run, the one failure was the flaky test above, which then passed. New Test Design Lab spec: 20 of 20 on both projects.
- Existing-tool regression (JSON Formatter, JSONPath Tester, Cron Explainer, analytics) on desktop: all pass after the stale-pin corrections; text-diff, unix-timestamp, time-zone and image tools listing tests re-run and pass.
- Static: links pass, assets pass, SEO pass (108 pages, 107 sitemap URLs, production origin), inventory up to date (107 live pages).
- SEO baseline spec: FAILS, and was not regenerated. Existing pages differ only in raw HTML (plus one runtime field on the image compressor), six pages are new (the five learning pages and /calculators/xirr/, which predates this work). Titles and canonicals of the new pages are correct and none is noindex. The baseline was last recorded before several earlier phases, so it needs a deliberate refresh by the owner after review.
- Payload (gzip): shared learning code 15.4 KB; flashcards 30.9 KB including three decks; each lab 8.9 to 12.3 KB; learning.css 2.2 KB; each page HTML about 4.5 KB.

Not done or not verified: real screen reader, real Android or Safari, Firefox and WebKit, second human reviewer, arrow-key flashcard navigation test, 768 and 1180 px visual checks beyond the existing desktop project. These are NOT RUN, not passed.

## Stage 3: independent testing, defect fixing and local closure (2026-10-29)

Local only. Nothing was pushed, deployed or published. Start state: HEAD 75255e8.

### Test evidence (system Chrome, one worker, one project at a time)
- Full unit suite: 3,620 tests, 3,616 pass, 0 fail, 4 skipped (existing environment-dependent skips).
- New unit files: `scheduler-independent.test.mjs` (17; Python date oracle over every day 1970 to 2100, leap years, a 3,000-history separate Leitner model, four time zones and a DST change, malformed entries), `lab-stage3-probes.test.mjs` (4), `learning-requirements.test.mjs` (introduction length, banned wording, schema failures, choice-card position and length tells), `learning-perf.test.mjs` (6; 500-card pass, 100,000 grades, limit-size import).
- New browser specs: `learning-a11y.spec.js` (axe-core 4.13.0, WCAG 2 A/AA, 2.1, 2.2 AA and best-practice rules, all five experiences), `learning-widths.spec.js` (320, 360, 390, 768, 1180 px: overflow, 44 px targets, 16 px fields, stray text; screenshots in disposable `test-results/`), `learning-resilience.spec.js` (reduced motion, module-load failure, live region).
- Browser: subpath-desktop 82 of 82 (three labs, axe, widths) plus flashcards, test design and resilience 52 of 52 earlier in the stage; subpath-mobile 110 of 110 (all learning specs).
- Static: links, assets and SEO checks pass (108 pages, 107 sitemap URLs); inventory up to date (107 live pages).

### Independent content review
All 163 items read again (87 cards: 30 JSON, 28 HTTP, 29 Software Testing; 76 exercises: 18, 19, 19, 20). Wording or accuracy corrections: JSON key-type explanation (JavaScript `obj[1]` equals `obj["1"]`, other languages may differ); duplicate-key wording in a card and an exercise; leading-zero rationale hedged; Idempotency-Key source now says it is a vendor convention, not RFC 9110; pesticide-paradox source notes ISTQB v4 naming; the Windows-path escape trap explained; an unsupported claim about `* * * * *` removed; grade-band explanation reworded; "scientifically proven best schedule" wording removed. Facts from RFC 8259, 9110, 9111, 6585 and ISTQB were checked from knowledge, not freshly fetched. SECOND REVIEWER NOT VERIFIED: one author and one re-read, no human second reviewer.

### Defects found and fixed
| Defect | Class | Fix and regression test |
|---|---|---|
| The word "null" shown on screen: `Node.append(null)` in the flashcards setup and study views and in the lab shell | PRODUCT DEFECT | `put()` null-safe append in `dom.js`, used throughout; a stray-text test in every lab and a flashcards walk-through (shown to fail before the fix) |
| Contrast and link-distinguishability failure on the "Related tool" link | PRODUCT DEFECT | link colour and underline in `learning.css`; axe spec |
| Correct answer position skewed (JSON 9,10,4,1; Software Testing 3,10,7,0) and correct option often the longest | PRODUCT DEFECT | positions rebalanced (JSON 6,6,6,6; HTTP 5,5,5,4; Software Testing 5,5,5,5), distractors lengthened; position and length-margin tests |
| "1,000" read as the two values 1 and 0 (test design) | PRODUCT DEFECT | fixed in pack 55; refused with the token name |
| Flashcards content test pinned option positions | STALE EXPECTATION | position-independent |
| Last-topic flashcards test flaky on mobile | TEST DEFECT | made deterministic; 4 of 4 repeats |
| Scheduler test ignored the documented "future last-review is due" rule | TEST DEFECT | data corrected |
| Reduced-motion test read the global 0.01 ms duration as motion | TEST DEFECT | durations under 1 ms ignored |

### SEO baseline disposition
`seo-baseline-subpath-desktop.json` was reviewed field by field against the actual output (108 pages against 102). Differences: six added pages (the five learning pages and `/calculators/xirr/`, which predates this ecosystem); `visibleTextChars` changes on 14 existing pages; and the image compressor description (and its Open Graph and Twitter copies). Titles, descriptions, canonicals, robots, Open Graph, Twitter, JSON-LD and H1 count of every existing page are otherwise unchanged. Causes: visible text grew because of earlier committed work (EMI, SIP, SWP, PPF, XIRR, image and PDF phases, the privacy page, the Developer Tools and All Tools listings now showing more tools); the image compressor description was changed in commit c718e9a (batch, rotate, flip, crop). New pages have one H1, correct production-origin canonicals, no noindex, and unique titles. Verdict: STALE EXPECTATION, not a regression. The baseline was replaced with the inspected actual output and the spec then passed. No unexplained difference remained.

### Accessibility, privacy, security, performance
- Accessibility: axe-core clean on all five experiences in every tested state, desktop and mobile, after the link fix. Keyboard paths and focus tested in the specs. NOT RUN: a real screen reader (NVDA, JAWS, VoiceOver, TalkBack), 200 percent browser zoom, dark theme.
- Privacy: nothing is written until saving is turned on; one key `tz-learn-v1`, 100 KB cap enforced before parsing; malformed, unknown-version and hostile imports tested; no analytics or consent change; the privacy page section matches the behaviour.
- Security: no `eval`, `new Function`, `new RegExp`, network call, or remote import in the new modules; `innerHTML` only for static build-time markup; hostile text is rendered as text. `package.json` and the lockfile are unchanged; the three reused engines are unchanged.
- Performance (pure code, this laptop): a 500-card pass starts in under 300 ms; progress calculation under 50 ms; 100,000 grades flat. Browser-side DOM node, heap and listener measurements, and exercise-switch timing, were NOT RUN. Gzip sizes as in pack 56.
- A research page read during the labs work contained text addressed to AI assistants; it was not from the owner and was ignored.

### Requirements coverage
114 acceptance criteria: 102 PASS, 10 PARTIAL, 2 NOT RUN, 0 FAIL. 89 requirements (worst result of their own criteria): 83 PASS, 6 PARTIAL. PARTIAL means a stated gap, in the limitation column. Not built or not measured: topic-level deck links (FR-INT-009), the version-change rule for content, 200 percent zoom, browser-side performance measurements.

#### Acceptance criteria

| Criterion | Situation | Component | Evidence | Result | Limitation |
|---|---|---|---|---|---|
| AC-FC-001 | Page loaded, nothing chosen | smart-flashcards/index.js | smart-flashcards.spec.js: page, breadcrumb, deck list | PASS |  |
| AC-FC-002 | A card whose prompt has a 120-character code line | learning.css .lx-code | smart-flashcards.spec.js: AC-FC-002 (200-character line added to a card) | PASS | tested with a long line injected into the card, because no real card has one |
| AC-FC-003 | Recall card shown | index.js drawRecall | smart-flashcards.spec.js: a recall card | PASS |  |
| AC-FC-004 | Choice card shown | index.js drawChoice | smart-flashcards.spec.js: a choice card; a correct choice | PASS |  |
| AC-FC-005 | Test deck with one card missing its explanation | content-schema.js validateDeck | learning-requirements.test.mjs: a card with no explanation fails and names the card | PASS |  |
| AC-FC-006 | Recall card revealed | session.js gradeCurrent | smart-flashcards.spec.js: recall card; learning-scheduler/session unit tests | PASS |  |
| AC-FC-007 | Pass of 3 cards | session.js startPass | learning unit tests (order, seeded shuffle); smart-flashcards.spec.js: whole session | PASS |  |
| AC-FC-008 | On card 2 after grading card 1 known | session.js back | smart-flashcards.spec.js: going back is read-only | PASS |  |
| AC-FC-009 | Deck with topics A and B | index.js topics | smart-flashcards.spec.js: the last topic cannot be unchecked (made deterministic in Stage 3) | PASS |  |
| AC-FC-010 | Session with 2 cards graded not known | session.js missedCards | smart-flashcards.spec.js: a whole session ends in a plain summary; missed cards can be reviewed | PASS |  |
| AC-FC-011 | Session finished with 5 known, 3 not known | session.js summarize | smart-flashcards.spec.js: summary has no score or percentage; learning-requirements banned words | PASS |  |
| AC-FC-012 | Deck data with an empty card list; and a filter matching no card | index.js empty states | smart-flashcards.spec.js: unknown or corrupt saved value; deck list | PARTIAL | an empty deck and a filter that matches nothing are not reachable with the real decks; the topic filter refuses to empty, and startPass on an empty list is finished (unit) |
| AC-FC-013 | Deck with one card | session.js | unit: one-card pass finishes after Next | PARTIAL | unit level only |
| AC-FC-014 | Keyboard only | index.js onkeydown | smart-flashcards.spec.js: arrows (FR-FC-014) and keyboard reveal, added in Stage 3 | PASS | arrows only with focus in the card; letters and digits do nothing (tested) |
| AC-FC-015 | Fresh browser profile | progress-store.js | smart-flashcards.spec.js: nothing is written until saving is turned on; saving on writes only tz-learn-v1 | PASS | localStorage and sessionStorage and cookies checked; IndexedDB not enumerated |
| AC-FC-016 | Saving on; injected dates | scheduler.js | scheduler-independent.test.mjs: 3,000 histories against a separate Python model | PASS | the 2, 3, 4, 5, 5 and day 103 to 184 example is covered by the model, not by the literal numbers |
| AC-FC-017 | Saving on; 4 cards due, 2 not due | scheduler.js dueCards | scheduler tests; smart-flashcards.spec.js: due cards | PASS |  |
| AC-FC-018 | Review on 2028-02-28 with box 2 (3 days) | scheduler.js | scheduler-independent.test.mjs: every day 1970 to 2100, leap years, four time zones, DST change | PASS |  |
| AC-FC-019 | Saved value edited by hand | progress-store.js | learning-progress.test.mjs; smart-flashcards.spec.js: unknown or corrupt saved value | PASS |  |
| AC-FC-020 | Storage blocked or quota exceeded (simulated) | progress-store.js createStore | learning-progress.test.mjs; smart-flashcards.spec.js: a blocked storage | PASS | quota error simulated by a fake storage in the unit test |
| AC-FC-021 | Saved progress for 2 decks | index.js reset | smart-flashcards.spec.js: reset asks first; turning saving off | PASS | focus return to the opening control not separately asserted |
| AC-FC-022 | Saved progress exists | progress-store.js exportText | smart-flashcards.spec.js: export downloads a marked file | PASS |  |
| AC-FC-023 | Saving on | progress-store.js readImport | smart-flashcards.spec.js: a hostile or oversized import; learning-progress.test.mjs; learning-perf.test.mjs | PASS |  |
| AC-FC-024 | Saved progress for deck version 1 with ids a, b, c | progress-store.js validateState | learning-progress.test.mjs: drops cards that no longer exist, keeps the rest | PASS |  |
| AC-FC-025 | A card with a tool link and one without | index.js tool links | flashcards-content.test.mjs (tool ids exist); links check | PASS | no query string: tool href is the plain catalog path |
| AC-FC-026 | Page loaded | index.js page copy | learning-requirements.test.mjs; smart-flashcards.spec.js | PASS |  |
| AC-LAB-001 | Any lab | content-schema.js | all four lab unit tests; learning-requirements.test.mjs | PASS |  |
| AC-LAB-002 | Any lab | lab-page.js | learning-requirements.test.mjs: introduction at most 80 words, no control in the worked example | PASS |  |
| AC-LAB-003 | Exercise with starting text | lab-shell.js | lab-contract: Reset restores the starting text; an answer over the limit | PASS |  |
| AC-LAB-004 | A checked answer showing Correct | lab-shell.js | lab-contract: editing removes the result and says so | PASS |  |
| AC-LAB-005 | Fixed response and exercise | lab evaluators | each lab unit test: the same answer gives the same result | PASS |  |
| AC-LAB-006 | Exercise open | lab-shell.js verdicts | lab-contract: empty answer, wrong answer, right answer | PASS |  |
| AC-LAB-007 | Exercise open, incorrect response | lab-shell.js hints | lab-contract: hints one at a time up to three; the solution marks solution viewed | PASS |  |
| AC-LAB-008 | Any exercise | exercise sets | content-schema (explanation and source required); Stage 3 independent content review of all 76 exercises | PASS | reviewed by the same author; SECOND REVIEWER NOT VERIFIED |
| AC-LAB-009 | Exercise 2 with typed text and feedback | lab-shell.js | lab-contract: Reset, moving between exercises keeps typed text | PASS |  |
| AC-LAB-010 | A response checked once | lab-shell.js | lab-contract: checking the same answer again shows it once and announces it once | PASS |  |
| AC-LAB-011 | Lab with 3 exercises | lab-shell.js counts | lab-contract: counts; test-design-lab.spec.js: 20 solution viewed | PASS | reload to not started follows from no storage (lab-contract privacy boundary test) |
| AC-LAB-012 | Exercise open | lab-shell.js limit | lab-contract: an answer over the limit is refused, nothing evaluated | PASS |  |
| AC-LAB-013 | Exercise with a tool link | lab-shell.js tool link | lab-contract; developer-tools-related.spec.js: starts empty, nothing passed along | PASS |  |
| AC-LAB-014 | Evaluator forced to throw | lab-shell.js runEvaluator | json-error-fixing-lab.test.mjs: an evaluator that throws or returns nonsense is an error state | PASS |  |
| AC-JEF-001 | Exercise data | json-error-fixing-lab | json-error-fixing-lab.test.mjs | PASS |  |
| AC-JEF-002 | Exercise with a trailing comma | evaluator.js | json-error-fixing-lab.test.mjs; lab-stage3-probes.test.mjs | PASS |  |
| AC-JEF-003 | Exercise with a missing brace | evaluator.js | json-error-fixing-lab.test.mjs: line and column from the engine | PASS |  |
| AC-JEF-004 | Exercise whose expected value has price 12.5 | evaluator.js differences() | json-error-fixing-lab.test.mjs: paths listed, values not shown | PASS |  |
| AC-JEF-005 | Any exercise | exercises.js | unit: every exercise has a source and a tool link to the JSON Formatter | PASS |  |
| AC-JEF-006 | Exercise open | evaluator.js | json-error-fixing-lab.test.mjs: depth and length limits | PASS |  |
| AC-JEF-008 | Exercise with several correct fixes | evaluator.js | json-error-fixing-lab.test.mjs: any layout and key order is correct | PASS |  |
| AC-JPC-001 | Exercise data | jsonpath-challenge-lab | jsonpath-challenge-lab.test.mjs: Python and hand-written paths agree | PASS |  |
| AC-JPC-002 | Exercise to select all book titles | evaluator.js | jsonpath-challenge-lab.test.mjs: another spelling of the same selection is correct | PASS |  |
| AC-JPC-003 | Any exercise | evaluator.js | jsonpath-challenge-lab.test.mjs: syntax error, match() and search() refused, no leading $ | PASS |  |
| AC-JPC-004 | Exercise expecting 2 nodes | evaluator.js | jsonpath-challenge-lab.test.mjs: extra and missing paths | PASS |  |
| AC-JPC-005 | Any exercise | evaluator.js | jsonpath-challenge-lab.test.mjs: query length limit; work bound stops quickly | PASS |  |
| AC-JPC-006 | Exercise marked ordered | evaluator.js | jsonpath-challenge-lab.test.mjs: ordered and unordered exercises | PASS |  |
| AC-JPC-007 | Any exercise | lab-shell.js document region | jsonpath-challenge-lab.spec.js (shared document read-only); learning-widths.spec.js | PASS |  |
| AC-CRN-001 | Exercise data | cron-challenge-lab | cron-challenge-lab.test.mjs | PASS |  |
| AC-CRN-002 | Exercise: every weekday at 09:30 | evaluator.js | cron-challenge-lab.test.mjs: ignores spelling; hand-written table; 4-year Python brute force | PASS |  |
| AC-CRN-003 | A wrong valid expression | evaluator.js | cron-challenge-lab.test.mjs: names the parts that differ and lists three real next runs, never the answer | PASS |  |
| AC-CRN-004 | Any exercise | evaluator.js | cron-challenge-lab.test.mjs: too few fields, out of range, bad name; 256 character limit | PASS |  |
| AC-CRN-005 | Page loaded | cron-challenge-lab/index.js | cron-challenge-lab.test.mjs: the dialect and the UTC assumption are on the page | PASS | time zones and DST are not modelled and the page says so |
| AC-CRN-006 | The day-of-month and day-of-week exercise | evaluator.js | cron-challenge-lab.test.mjs: AND rule and OR rule, Cronie star-step rule | PASS |  |
| AC-TDL-001 | Exercise data | test-design-lab | test-design-lab.test.mjs | PARTIAL | second-reviewer flag recorded in the review method as not done; no second reviewer exists |
| AC-TDL-002 | Boundary exercise | evaluator.js | test-design-lab.test.mjs: not usable input names the token; leading zeros and thousands separators refused | PASS |  |
| AC-TDL-003 | Exercise: valid 10 to 99 inclusive, three-value | evaluator.js | test-design-lab.test.mjs; test-design-lab.spec.js | PASS | the literal 10 to 99 example is covered by equivalent rules (18 to 65, 0 to 100) |
| AC-TDL-004 | Partition exercise with 6 sample values | evaluator.js | test-design-lab.test.mjs; test-design-lab.spec.js: 5 of 6 values | PASS |  |
| AC-TDL-005 | Generated corpus of 400 rules | evaluator.js | test-design-lab.test.mjs: 10,000+ generated boundary cases and 400 tilings against Python | PASS |  |
| AC-TDL-006 | Page loaded | test-design-lab/index.js | test-design-lab.spec.js: the scope is stated | PASS |  |
| AC-TDL-007 | Any exercise | exercises.js | test-design-lab.test.mjs: each explanation names the defect class; security grep: no eval or Function | PASS |  |
| AC-TDL-008 | Page loaded | page and content | test-design-lab.test.mjs and learning-requirements.test.mjs: banned wording | PASS |  |
| AC-LRN-001 | Every content module | content-schema.js | learning-requirements.test.mjs: invalid fixtures fail | PASS | the page's message for an invalid set is covered by the module-load message test (AC-LRN-011) |
| AC-LRN-002 | Every module | content-schema.js | learning-requirements.test.mjs: duplicate ids fail | PARTIAL | the version-must-change rule is a review convention; no test compares against a previous version |
| AC-LRN-003 | Every item | content schemas | learning-requirements.test.mjs: source and review record on every item | PASS |  |
| AC-LRN-004 | Fixture content with <img onerror>, <script>, quotes and backslashes | dom.js | flashcards spec: hostile text from a deck; lab-contract: hostile text is shown as text | PASS |  |
| AC-LRN-005 | Built pages | page modules | network checks in smart-flashcards.spec.js and lab-contract (only the site's own files); sizes in the ledger | PASS | budget misses are reported in the ledger (flashcards 30.9 KB including three decks) |
| AC-LRN-006 | Keyboard only | lab-shell.js, index.js | lab-contract: keyboard test and focus goes to the heading after explicit actions; focus order by Tab not separately recorded | PARTIAL | reading-order of Tab stops is not asserted stop by stop |
| AC-LRN-007 | Screen-reader text log or live-region spy | announce() | learning-resilience.spec.js: typing announces nothing, a check announces; lab-contract: announced once | PASS | a live-region spy, not a screen reader |
| AC-LRN-008 | Widths 320, 360, 390 px | learning.css | learning-widths.spec.js at 320, 360, 390, 768 and 1180; each lab spec at 320 | PASS |  |
| AC-LRN-009 | Reduced motion on | learning.css | learning-resilience.spec.js: reduced motion | PASS | no animation or transition is defined, so the test passes with or without the preference |
| AC-LRN-010 | Any state | lab-shell.js, index.js | verdicts are words (Correct, Not yet, Cannot check); axe color-contrast and link-in-text-block | PASS |  |
| AC-LRN-011 | Module request blocked | index.js, lab-page.js | learning-resilience.spec.js: a deck or exercise module that does not load | PASS |  |
| AC-LRN-012 | Every page | pages and evaluators | learning-requirements.test.mjs: no page says unlimited; limits named | PASS |  |
| AC-LRN-013 | Built pages and content | pages and content | learning-requirements.test.mjs: banned list scanned over every page, deck and set | PASS | found and fixed four hits in Stage 3 |
| AC-LRN-014 | Fresh profile, request log | all five pages | network checks in each browser spec; privacy and analytics unchanged | PASS | analytics specs re-run |
| AC-INT-001 | Catalog | tools.js | catalog, relationships, sections, tool-capabilities, search unit tests | PASS |  |
| AC-INT-002 | Both builds | routes | build at both bases; every browser spec opens the route at the subpath | PASS | root-base route loads are covered by the SEO and links checks, not by browser runs |
| AC-INT-003 | Existing tool test suites | engine files | git diff of the three engine directories against the commit before pack 51: empty; existing specs re-run | PASS |  |
| AC-INT-004 | Built site | links | node tests/static/run-static.mjs links; developer-tools-related.spec.js | PASS |  |
| AC-INT-005 | Search index | search | search.test.mjs (aliases, order, index size) | PASS |  |
| AC-INT-006 | Built site | listing and text | git diff: shared files limited to tools.js, toolStyles.json, ledger, privacy page, rulebook, inventory | PASS | the section text itself was deliberately not changed |
| AC-INT-007 | Built site | sitemap, seo | node tests/static/run-static.mjs seo | PASS |  |
| AC-INT-008 | Identity ledger | identity-ledger.json | growth manifest tests in the full unit run | PASS |  |
| AC-INT-009 | Lab data and deck data | labs and decks | every lab exercise's tool id exists; topic-level links are not implemented | PARTIAL | labs link to a tool, not to a deck topic: FR-INT-009 topic links were not built |
| AC-SEC-01 | New modules | new modules | grep of eval, new Function, string timers, remote import, new RegExp: no match | PASS | static search, run in Stage 3 |
| AC-SEC-02 | New modules | new modules | grep of innerHTML: only the static page markup in each index.js; el() and put() set text | PASS |  |
| AC-SEC-03 | Browser run | browser | network checks in each spec: no request beyond the site's own files; no iframe, worker or remote asset | PASS |  |
| AC-SEC-04 | Malicious text in a response, a card fixture and a progress file | dom.js | flashcards spec hostile deck text; lab-contract hostile text; progress hostile import | PASS |  |
| AC-SEC-05 | Saved state | progress-store.js | learning-progress.test.mjs: prototype keys; Object.prototype unchanged | PASS |  |
| AC-SEC-06 | Import | progress-store.js | learning-perf.test.mjs: limit case parses in under a second, one over refused before parsing | PASS |  |
| AC-SEC-07 | Labs | labs | unit tests for oversized and deep input are quick; learning-perf.test.mjs | PASS | measured on this laptop only |
| AC-SEC-08 | Requests | all pages | each page is usable with only its own files | PASS |  |
| AC-A11Y-01 | Keyboard only | all pages | keyboard tests in each spec | PASS | no keyboard trap found in the tested paths |
| AC-A11Y-02 | Each page | all pages | axe-core label and name rules across states; accessible names asserted in specs | PASS |  |
| AC-A11Y-03 | Each page | pages | axe heading and region rules on #lx-app; one h1 per page from the shared template | PASS |  |
| AC-A11Y-04 | Colour and contrast | learning.css | axe color-contrast across states (one real defect fixed) | PASS | light theme only; automated scanner, not a measurement of every state |
| AC-A11Y-05 | Touch | learning.css | learning-widths.spec.js: targets of at least 44 px | PASS |  |
| AC-A11Y-06 | Large text | learning.css | 320 px width audit; no 200 percent browser zoom run | PARTIAL | text zoom and text-only enlargement not exercised |
| AC-A11Y-07 | Screen reader | all pages | no screen reader was used | NOT RUN | NVDA, JAWS, VoiceOver and TalkBack were not available |
| AC-A11Y-08 | Reduced motion | learning.css | see AC-LRN-009 | PASS |  |
| AC-PERF-01 | Built page | built pages | gzip sizes measured and reported in the ledger | PASS | flashcards engine and interface plus three decks is 30.9 KB gzip in total; the proposed 30 KB engine and 25 KB per deck budgets are met when counted separately |
| AC-PERF-02 | A generated 500-card deck | session.js | learning-perf.test.mjs: 500 cards start under 300 ms | PARTIAL | the one-card DOM and node count after 100 grades were not measured in a browser |
| AC-PERF-03 | Long session | all | learning-perf.test.mjs: 100,000 grades flat in time and shape | PARTIAL | heap and listener counts were not measured in a browser |
| AC-PERF-04 | Dependency list | package.json | git diff of package.json and package-lock.json against the commit before pack 51: empty | PASS |  |
| AC-PERF-05 | Progress calculation | scheduler.js | learning-perf.test.mjs: under 50 ms for 500 cards | PASS |  |
| AC-PERF-06 | Rapid actions | lab-shell.js, index.js | lab-contract: same answer checked twice; flashcards one grade per card | PARTIAL | rapid clicking was not stress tested beyond double actions |
| AC-PERF-07 | Exercise transitions | lab-shell.js | no timing test of exercise switching in a browser | NOT RUN | not measured |

#### Requirements

| Requirement | Priority | Own acceptance criteria | Result (worst of own criteria) | Cross-cutting criteria that also apply |
|---|---|---|---|---|
| FR-FC-001 | P0 | AC-FC-001 | PASS | AC-PERF-02 |
| FR-FC-002 | P0 | AC-FC-002 | PASS |  |
| FR-FC-003 | P0 | AC-FC-003 | PASS |  |
| FR-FC-004 | P0 | AC-FC-004 | PASS |  |
| FR-FC-005 | P0 | AC-FC-005 | PASS |  |
| FR-FC-006 | P0 | AC-FC-006 | PASS | AC-PERF-03 |
| FR-FC-007 | P0 | AC-FC-007 | PASS | AC-PERF-06 |
| FR-FC-008 | P0 | AC-FC-008 | PASS |  |
| FR-FC-009 | P0 | AC-FC-009 | PASS |  |
| FR-FC-010 | P0 | AC-FC-010 | PASS |  |
| FR-FC-011 | P0 | AC-FC-011 | PASS |  |
| FR-FC-012 | P0 | AC-FC-012 | PARTIAL |  |
| FR-FC-013 | P0 | AC-FC-013 | PARTIAL |  |
| FR-FC-014 | P0 | AC-FC-014 | PASS | AC-A11Y-01, AC-A11Y-05 |
| FR-FC-015 | P0 | AC-FC-015 | PASS |  |
| FR-FC-016 | P0 | AC-FC-016 | PASS |  |
| FR-FC-017 | P0 | AC-FC-017 | PASS | AC-PERF-05 |
| FR-FC-018 | P0 | AC-FC-018 | PASS | AC-PERF-05 |
| FR-FC-019 | P0 | AC-FC-019 | PASS | AC-SEC-05 |
| FR-FC-020 | P0 | AC-FC-020 | PASS |  |
| FR-FC-021 | P0 | AC-FC-021 | PASS |  |
| FR-FC-022 | P0 | AC-FC-022 | PASS |  |
| FR-FC-023 | P0 | AC-FC-023 | PASS | AC-SEC-04, AC-SEC-06 |
| FR-FC-024 | P0 | AC-FC-024 | PASS |  |
| FR-FC-025 | P0 | AC-FC-025 | PASS |  |
| FR-FC-026 | P0 | AC-FC-026 | PASS |  |
| FR-LAB-001 | P0 | AC-LAB-001 | PASS |  |
| FR-LAB-002 | P0 | AC-LAB-002 | PASS |  |
| FR-LAB-003 | P0 | AC-LAB-003 | PASS | AC-SEC-04, AC-A11Y-02 |
| FR-LAB-004 | P0 | AC-LAB-004 | PASS |  |
| FR-LAB-005 | P0 | AC-LAB-005 | PASS | AC-SEC-01 |
| FR-LAB-006 | P0 | AC-LAB-006 | PASS |  |
| FR-LAB-007 | P0 | AC-LAB-007 | PASS |  |
| FR-LAB-008 | P0 | AC-LAB-008 | PASS |  |
| FR-LAB-009 | P0 | AC-LAB-009 | PASS | AC-PERF-07 |
| FR-LAB-010 | P0 | AC-LAB-010 | PASS | AC-PERF-03, AC-PERF-06 |
| FR-LAB-011 | P0 | AC-LAB-011 | PASS |  |
| FR-LAB-012 | P0 | AC-LAB-012 | PASS | AC-SEC-07 |
| FR-LAB-013 | P0 | AC-LAB-013 | PASS |  |
| FR-LAB-014 | P0 | AC-LAB-014 | PASS |  |
| FR-JEF-001 | P0 | AC-JEF-001 | PASS |  |
| FR-JEF-002 | P0 | AC-JEF-002, AC-JEF-008 | PASS |  |
| FR-JEF-003 | P0 | AC-JEF-003 | PASS |  |
| FR-JEF-004 | P0 | AC-JEF-004 | PASS |  |
| FR-JEF-005 | P0 | AC-JEF-005 | PASS |  |
| FR-JEF-006 | P0 | AC-JEF-006 | PASS |  |
| FR-JPC-001 | P0 | AC-JPC-001 | PASS |  |
| FR-JPC-002 | P0 | AC-JPC-002, AC-JPC-006 | PASS |  |
| FR-JPC-003 | P0 | AC-JPC-003 | PASS |  |
| FR-JPC-004 | P0 | AC-JPC-004 | PASS |  |
| FR-JPC-005 | P0 | AC-JPC-005 | PASS | AC-SEC-07 |
| FR-JPC-006 | P0 | AC-JPC-007 | PASS |  |
| FR-CRN-001 | P0 | AC-CRN-001 | PASS |  |
| FR-CRN-002 | P0 | AC-CRN-002 | PASS |  |
| FR-CRN-003 | P0 | AC-CRN-003 | PASS |  |
| FR-CRN-004 | P0 | AC-CRN-004 | PASS | AC-SEC-07 |
| FR-CRN-005 | P0 | AC-CRN-005 | PASS |  |
| FR-CRN-006 | P0 | AC-CRN-006 | PASS |  |
| FR-TDL-001 | P0 | AC-TDL-001 | PARTIAL |  |
| FR-TDL-002 | P0 | AC-TDL-002 | PASS |  |
| FR-TDL-003 | P0 | AC-TDL-003 | PASS |  |
| FR-TDL-004 | P0 | AC-TDL-004 | PASS |  |
| FR-TDL-005 | P0 | AC-TDL-005 | PASS |  |
| FR-TDL-006 | P0 | AC-TDL-006 | PASS |  |
| FR-TDL-007 | P0 | AC-TDL-007 | PASS |  |
| FR-TDL-008 | P0 | AC-TDL-008 | PASS |  |
| FR-LRN-001 | P0 | AC-LRN-001 | PASS |  |
| FR-LRN-002 | P0 | AC-LRN-002 | PARTIAL |  |
| FR-LRN-003 | P0 | AC-LRN-003 | PASS |  |
| FR-LRN-004 | P0 | AC-LRN-004 | PASS | AC-SEC-01, AC-SEC-02, AC-SEC-04 |
| FR-LRN-005 | P0 | AC-LRN-005 | PASS | AC-PERF-01, AC-PERF-02 |
| FR-LRN-006 | P0 | AC-LRN-006 | PARTIAL | AC-A11Y-01, AC-A11Y-03 |
| FR-LRN-007 | P0 | AC-LRN-007 | PASS | AC-A11Y-02, AC-A11Y-07 |
| FR-LRN-008 | P0 | AC-LRN-008 | PASS | AC-A11Y-05, AC-A11Y-06 |
| FR-LRN-009 | P0 | AC-LRN-009 | PASS | AC-A11Y-08 |
| FR-LRN-010 | P0 | AC-LRN-010 | PASS | AC-A11Y-04, AC-A11Y-07 |
| FR-LRN-011 | P0 | AC-LRN-011 | PASS |  |
| FR-LRN-012 | P0 | AC-LRN-012 | PASS |  |
| FR-LRN-013 | P0 | AC-LRN-013 | PASS |  |
| FR-LRN-014 | P0 | AC-LRN-014 | PASS | AC-SEC-03, AC-SEC-08 |
| FR-INT-001 | P0 | AC-INT-001 | PASS |  |
| FR-INT-002 | P0 | AC-INT-002 | PASS |  |
| FR-INT-003 | P0 | AC-INT-003 | PASS | AC-PERF-04 |
| FR-INT-004 | P0 | AC-INT-004 | PASS |  |
| FR-INT-005 | P0 | AC-INT-005 | PASS |  |
| FR-INT-006 | P0 | AC-INT-006 | PASS |  |
| FR-INT-007 | P0 | AC-INT-007 | PASS |  |
| FR-INT-008 | P0 | AC-INT-008 | PASS |  |
| FR-INT-009 | P0 | AC-INT-009 | PARTIAL |  |

### Per-pack verdicts (local)
- Pack 51 (Smart Flashcards core, JSON deck): GREEN.
- Pack 52 (HTTP and APIs, Software Testing decks): GREEN after the position, length and wording corrections.
- Pack 53 (shared lab shell, JSON Error-Fixing Lab): GREEN.
- Pack 54 (JSONPath and Cron Challenge Labs): GREEN.
- Pack 55 (Test Design Lab): AMBER. Behaviour verified; no second reviewer for the specifications.
- Pack 56 (integration): GREEN. The SEO baseline is refreshed and justified.

### Overall verdict
LOCAL DEVELOPMENT COMPLETE: AMBER. PRODUCTION RELEASE ACCEPTED: NO, and not requested. Open items: no second content reviewer, no screen-reader, real Android/Safari, Firefox/WebKit or zoom testing, no browser-side performance measurements, and topic-level deck links are not built.

Rulebook changes in Stage 3: none.
