# Requirements reconciliation (authoritative index), 2026-11-04

One index of every ToolZenHub requirement found in the repository and in the owner's prompts, with its source, status, evidence and remaining action. It **cross-references** the owning documents and does not restate them. When a row and its source disagree, the source wins and this row is corrected. It is not a rulebook: policy lives in `docs/product-decision-rules.md` (R below), procedure in the documents it names.

Checkpoint verified from the repository (not from memory): branch `main`, HEAD `42eda5c`, working tree clean, `origin/main` 12 commits behind HEAD (nothing pushed). Live pages 126 (`tests/inventory/url-inventory.json`), 66 built calculators and tools, 36 published articles, 1 Coming Soon calculator (Currency Converter), 2 Coming Soon articles. Practice Labs section (rule 4.10, `cb14d76`) and the "More <section>" switcher (`42eda5c`) exist; the persistent sidebar and the mobile drawer do not.

Status words: DONE (built, automated evidence), DONE-MANUAL (built, a person must judge it), PARTIAL, OPEN (not built, in scope), BLOCKED, DEFERRED (owner or product decision), UNAVAILABLE (no record in the repository).

Sources: R = `docs/product-decision-rules.md`; Q = `docs/quality/*`; U = `docs/ecosystem-review/universal-expansion/*` (number = file); PL = `docs/ecosystem-review/practice-labs/*`; TP = `docs/tool-packs/*`; L = `U/11-DEVELOPMENT-LEDGER.md`; P5111 = the owner's master roadmap prompt of 2026-11-04 (Parts 1 to 13); P-A = the owner's earlier Phases A to S prompt.

## 1. Historical manual findings

The 27 findings are the rows of `Q/MASTER_REGRESSION_CATALOG.md` (the single owner of their status; read it for evidence). Summary, re-checked against the repository today:

| # | Finding | Status | Remaining action |
|---|---|---|---|
| 1 | Slider sync and initial styling | DONE-MANUAL | Phase 8 audit of every calculator field against P5111 Part 4A (see 2.1) |
| 2 | Loan Comparison slider delay | DONE | mobile verification was interrupted: re-run `loan-comparison` on `subpath-mobile` |
| 3 | Age duplicate date icons | DONE | none (Safari check is manual) |
| 4 | Date Difference inclusive presets | DONE | re-verify the exact semantics against P5111 Part 4B in Phase 9 |
| 5, 6, 7 | Countdown 12/24 h, zone field, sound | DONE (7 DONE-MANUAL) | audibility manual |
| 8 | Other time-tool sounds | DONE-MANUAL | decision recorded: no new sound (L, Q3 decision 4) |
| 9, 10 | Meeting Planner, Time Zone Converter clarity | PARTIAL | wording and usability improvement in Phase 9 (never made) |
| 11 | JSON precise errors | DONE | none |
| 12, 13, 14, 15 | JSON line numbers, suggested fixes, compare, long documents | DONE (14, 15 DONE-MANUAL) | compare reports differences by path, not by line: evaluate mapping a path to a line in Phase 10 |
| 16, 17, 18 | Active states (header "All Tools") | DONE | the requested persistent sidebar is a separate item (2.2) |
| 19 | Labs separation | DONE | rule 4.10; hub and breadcrumbs verified |
| 20 | SIP and Tax articles | DONE 2026-11-05 | published ids 7 (`/articles/investment/best-sip-strategies-for-beginners/`) and 8 (`/articles/tax/tax-saving-guide-save-more-legally/`) with original content, an image each, metadata, related links and tests; sources in the article files; not independently reviewed |
| 21 | Broken article images | DONE | none |
| 22 | All Tools search clearing | DONE | none |
| 23 | Global search | PARTIAL | evaluate category-aware suggestions (P5111 4H) |
| 24 | Homepage hero | PARTIAL | the unused space beside the hero was never addressed (P5111 4G) |
| 25 | Responsive category workspace | PARTIAL | same as 2.2 |
| 26 | SQL, Excel, Power BI | PARTIAL: SQL lab and deck built (Q3-13, Q3-14); Excel Practice Lab and deck built locally (Q3-15); Power BI Practice Lab and deck built locally (Q3-16) | Phases 3 to 4 below |
| 27 | Image and PDF expansion | PARTIAL | existing tools audited; expansion candidates in 2.6 and 2.7 |

Earlier owner observations B01 to B24 (`U/01`): all dispositions stand (verdict table in `U/03`). Items still open there: B03 search focus consistency (U2, done in Batch 1 and re-checked by `site-a11y`), B09 reporting channel (O-2, owner choice needed), B16 navigation speed (needs a browser trace; none run), B20 country and capital catalogue (rejected, duplicates World Clock data), B21 and B22 (rejected or evergreen only).

## 2. Feature and roadmap requirements

### 2.1 Calculators and sliders (P5111 4A, Phase 8)

Decision on record (U/13, L Batch 3): one shared opt-in `numberField({slider})` plus `ui/field-slider.js`; sliders only for bounded rate, tenure and similar fields; money amounts, dates and cash-flow inputs are excluded because their ranges are too wide. P5111 now also lists loan amounts, contribution amounts and similar fields. **Conflict C1** (below). Status: PARTIAL, mostly FIXED 2026-11-04 (conflict C1 resolved in favour of the later owner brief): practical-range sliders added to EMI loan amount; SIP monthly amount, return, step-up, inflation; PPF yearly and monthly deposit; FD deposit; Home Loan income and income share; Balance Transfer, Prepayment and Credit Card balances (and card payment); SWP corpus, withdrawal, return, increase, inflation; Margin target margin, markup, discount. The number input stays the source of truth and accepts any valid value beyond the slider range. Dates, XIRR rows, derived outputs and the rest are excluded. Evidence: 10 shared tests plus the changed calculators' own specs (EMI 21, SIP 27, PPF 28, FD 27, Home Loan 24, Balance Transfer 23, Credit Card 23, Prepayment 27, SWP 37, Margin 30) passed on subpath-desktop; the changed calculators were not re-run on mobile in that batch. Remaining simple calculators audited 2026-11-05 (field by field; selects and the derived results are never sliders). Personal Loan: amount 50,000 to 50,00,000 step 10,000 (added), rate and tenure (already), fee 0 to 5 step 0.1 (added). Loan Eligibility: income 10,000 to 10,00,000 step 5,000 and existing EMIs 0 to 5,00,000 step 1,000 (added), share, rate, tenure (already). Interest: principal 10,000 to 1,00,00,000 step 10,000 (added), rate and time (already). ROI: invested 10,000 to 1,00,00,000 and final value 10,000 to 2,00,00,000, step 10,000 (added), years (already). BMI, BMR, Calorie: weight 20 to 300 kg, height 100 to 250 cm, age 18 to 100 (BMI) or 15 to 100 (BMR, Calorie) (added; ranges equal the formula limits); sex and activity are selects, excluded. Percentage: no sliders, because any two of three values are entered and the unknowns are unbounded. Ratio: no sliders, because the terms are arbitrary numbers. Unit Converter: no slider, because the value is unbounded and may be negative. Tests: `field-slider.spec.js` "sliders exactly on the audited fields" for all nine (exact slider set, min and max, aria-hidden, two-way sync with a step-aligned value, no overflow), plus `simple-calculators.spec.js`, run on subpath-mobile: 54 and 9 passed. Not checked: a physical touch screen, the visual fill of every slider on first paint beyond the shared component's own test.

### 2.2 Navigation workspace (P5111 4E, Phase 1; finding 25)

R 4.8 permits a page-scoped rail on All Tools only and requires small steps before any sidebar. Built: header active states, section switcher (disclosure). Not built: persistent category-aware sidebar, mobile drawer. **Conflict C2.** Status: PARTIAL. Remaining: Phase 1.

### 2.3 Date and time (P5111 4B, 4C, Phase 9)

Presets, sounds, 12/24 h, zone prefill DONE. Open: Meeting Planner and Time Zone Converter explanations; confirm Date Difference semantics (Last 7 days = today-6 to today, Last 30 = today-29 to today, today through next 7 days = 8 inclusive dates, forward and backward visibly distinct) against `date-difference-presets.test.mjs`.

### 2.4 Developer tools (P5111 4D, Phase 10)

JSON Formatter and Compare DONE as in section 1. Open: audit of the wider developer ecosystem for real defects; JSON Schema Validator remains BLOCKED (TP/41: vendored-library verification was refused by the command classifier; the owner must add a Bash permission rule or accept a different check).

### 2.5 Articles (P5111 4F, Phase 11)

Two Coming Soon (SIP strategies, tax saving) DEFERRED by product decision (L, Q3 decision 1). Open: audit of titles, descriptions, images, links, related content for all 36 published articles (U/02, U/09 list known gaps: imageless articles fixed, article categories for non-calculator tools absent).

### 2.6 Image tools (Phase 6)

Built: Image Compressor and Resizer, Photos to PDF, crop, batch. Candidates (U/03): crop, rotate, flip and metadata remover N6 (verdict C, needs own spec). QR Code Generator: TP/32 DRAFT, not approved, feasibility only. Remaining: audit, then implement the highest-value safe additions.

### 2.7 PDF tools (Phase 7)

Built: Merge, Split, Extract/Reorder/Rotate pages (`pdf-pages`), page numbers and watermark (`pdf-marks`, TP/52). Candidates: PDF to images N4 (verdict B, PDF.js not vendored, spike), metadata viewer and cleaner N3 (C), Compress PDF N5 (D: `pdf-lib` cannot recompress images; P5111 forbids claims without evidence), delete pages and crop to be checked against `pdf-pages`/`pdf-marks`.

### 2.8 Calculator inventory (P5111 Phase 8)

Not built and not to be built automatically: Car Loan, Education Loan, Discrete. Position Size exists (inside Risk-Reward, TP/51); Old vs New Tax Regime exists (`income-tax`, TP/17). Currency Converter: Coming Soon, needs a live-rate source (external-API gate, R 12). Unit Converter, BMI, BMR, Calorie, Age, Ratio, ROI, Interest, Personal Loan, Loan Eligibility were built in the Website Completion phase (TP/53) although the older verdicts had been C or D; the later owner request wins (L Batch 4).

### 2.9 Learning ecosystems (P5111 Phases 2 to 5)

Built: Smart Flashcards (3 decks, `tz-learn-v1` opt-in saving, rule 7.7 exception) and four labs (JSON error fixing, JSONPath, Cron, Test design); PL/18 approved Option B with deferred items: SQL execution, arbitrary JS execution, advanced gamification, FSRS. SQL: Node spike measured sql.js at about 343 KB gzip, 95 ms init, 85 ms for a 50,000-row join, runaway query stopped by a worker timer; **no browser or low-memory measurement exists** (U/12 J). Excel and Power BI: U/06 says a simulation must not claim Excel or Power BI; Excel needs a licensed evaluator; Power BI cannot run. **Conflict C3.** Status: OPEN. Remaining: Phases 2 to 5.

### 2.10 Roadmap items to reconcile (P5111 Phase 12)

| Item | Record | Status |
|---|---|---|
| Photos to PDF | TP/31, in catalog and built | DONE |
| Salary/CTC to in-hand | TP/30, catalog id `salary-in-hand`, built; independent payroll review and phone acceptance still open | DONE-MANUAL |
| Gratuity | TP/29 and release evidence; gates B6, D8, G9 open | DONE-MANUAL, gates open |
| QR Code | TP/32 DRAFT, not approved | DEFERRED |
| World Map | no record in any repository document (U/02, U/14 P5) | UNAVAILABLE |
| World Clock 2.0 | built; production ZIP built from an older commit, undeployed | DONE, not released |
| Time Tools ecosystem navigation | TP/34 pilot | superseded by the section switcher |
| Home Loan rate comparison | rule 13 example only, verdict D | DEFERRED |

World Map: no dataset, licence or scope exists. Phase 12 will evaluate it as a new candidate only (R 12) and will not claim completeness.

## 3. Engineering rules (policy owners)

All of R sections 1 to 15 stand. The ones this programme leans on most: 1.2 no tool-count goal; 1.7 category balance never decides; 4.2 one section per tool; 4.4 real pages only; 8.5 never silently change data; 8.8 privacy and consent analytics; 9.1 avoid dependencies; 9.3 preserve working tools; 10.1 to 10.15 testing policy (impact-based, one worker, no full regression by default, honest gaps, stale-process checks); 11.2 and 11.4 commit per phase, never force-push, never touch Hostinger; 15 maintenance (rule changes named in each report). Procedure owners: `docs/tool-pack-factory.md`, `docs/shared-tool-ux.md`, `docs/content-clusters.md`, `tests/README.md`. Memory-held constraints: low-RAM adaptive engineering (R 10.3), never junction `node_modules`, stop the scratch server before a build.

## 4. Cloud versus local and cost decisions

R 1.5 and 8.8: browser-local, no uploads, no AI at runtime, no paid service; R 12 gates reject paid external APIs; R 13.9 changing-data products need a maintenance owner. P5111 3.1 restates the ladder (existing, own code, browser API, open-source, free tier, manual, paid last). Specific decisions: Currency stays Coming Soon; PDF compression not claimed; SQL only as a vendored, in-memory, worker-contained library (PL/18 H allows sql.js with its own approval; P5111 now authorises the evaluation, **C3**); no analytics events from tools; Growth OS is never a runtime dependency (R 6.6, 6.7).

## 5. Product selection and prioritisation

R 1 (pain first, AI-era test, different job not variant), R 12 (six weighted dimensions, evidence classes, mandatory gates, verdicts A to D), R 13 (trackers), R 14 (checklist). Candidate verdicts are in `U/03`; this index does not re-score them.

## 6. Learning-lab requirements

PL/10 (Smart Flashcards), PL/11 (labs), PL/12 (shared engine), PL/13 (security and privacy), PL/14 (accessibility and performance), PL/15 (acceptance), PL/18 (owner conditions 1 to 15: items are a planning target, never filler; no unsafe code execution; no external APIs; progress saving opt-in and scoped). Open: topic-level deck links (Q/TECHNICAL_DEBT T-6), second reviewer for the 163 learning items (T-12), screen-reader testing (T-8).

## 7. Testing, regression and documentation requirements

R 10, `Q/TEST_STRATEGY.md`, `Q/MASTER_REGRESSION_CATALOG.md` (rows added when a page is published), `Q/TEST_EXECUTION_LEDGER.md` (each run with commit and scope), `Q/DEFECT_LEDGER.md`, `Q/TECHNICAL_DEBT.md`, `Q/RELEASE_LEDGER.md`, `Q/MANUAL_QA_GUIDE.md` (one consolidated guide at the end, P5111 Part 8), L (development ledger). Open evidence gaps: mobile re-run of the switcher consumers and of Loan Comparison, visual baselines, performance trace, Firefox, WebKit, real devices, screen readers.

## 8. Roll-up

DONE or DONE-MANUAL: findings 2 to 8, 11 to 19, 21, 22, 27 (partly); Practice Labs section; switcher; Phase 1 header states. PARTIAL: 9, 10, 23 to 25; sliders audit; image and PDF expansion. OPEN: SQL, Excel, Power BI, flashcard topic links, hero image, global search suggestions. BLOCKED: JSON Schema Validator (library check refused); Gratuity gates; reporting channel (owner). DEFERRED: SIP and Tax articles, Currency, QR, home-loan rate comparison, PDF compression. UNAVAILABLE: World Map.

## 9. Conflicts and the safest interpretation chosen

| ID | Conflict | Resolution |
|---|---|---|
| C1 | R and U/13 exclude money amounts from sliders; P5111 4A lists loan amounts, contributions and similar. | Apply sliders where a bounded, practical range exists (amount ranges with a sensible cap, number input remains the source of truth and accepts any valid value beyond the slider range); never for dates, XIRR cash-flow rows or free categorical input. Recorded per field in Phase 8. |
| C2 | R 4.8 limits sidebars (pilot first, All Tools rail only); P5111 Phase 1 asks for a persistent category-aware sidebar and mobile drawer. | The owner's later instruction is treated as the approval of the next step; the rule is edited in the same commit, the sidebar adds no header item, never lists another section's tools, and takes no phone space (drawer, closed by default). |
| C3 | PL/18 deferred SQL execution and conditioned new dependencies; P5111 asks for SQL, Excel and Power BI ecosystems. | SQL runs only inside a worker with a time limit and an in-memory database from a vendored, licence-checked library; if the browser spike fails the exercises fall back to static "read the result" items, never fake execution. Excel and Power BI are labelled educational simulations or reading exercises; no claim of Excel or Power BI behaviour. Rulebook entry names the change. |
| C4 | R 10.13 (manual-first acceptance) against P5111 Part 7 (automated testing, one final manual guide). | Both are satisfied: impact-based automation during development, one consolidated manual guide at the end. |
| C5 | R 11.2 (push after each phase) against the owner's instruction and the global rule never to push without approval. | No push in this programme. Commits are local. |
| C6 | R 4.7 and 11.7 reserve section creation to the owner. | The owner delegated autonomy; any new section or move is named as a rule change. SQL, Excel and Power BI content goes inside Practice Labs, so no further section is needed. |

## 10. Unavailable records

World Map (no document). The 2026-11-01 owner statement that Salary/CTC and Photos to PDF "remain priorities" has no separate document: both are built per TP/30 and TP/31. The original text of the 27-scenario list is not in the repository; the catalogue rows are its only record.
