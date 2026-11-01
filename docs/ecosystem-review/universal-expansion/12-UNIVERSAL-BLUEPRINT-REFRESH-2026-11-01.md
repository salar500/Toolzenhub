# 12. Universal blueprint refresh (Prompt 1 re-run, 2026-11-01)

Research, audit and architecture only. **No implementation file, catalog or rule was changed.** Nothing here is an approval or a build queue. It refreshes docs 00 to 11 of this package against the repository as it is today, and it does not repeat their detail; where a section says "see doc N" that document holds the evidence.

## A. Checkpoint and existing architecture

| Fact | Value | Class |
|---|---|---|
| Branch / HEAD | `main` / `624b3bb`; modified: this package's ledger and the Gratuity spec; new: `docs/tool-packs/29-gratuity-release-evidence.md` (all from the work earlier today, uncommitted) | verified (git) |
| Production and preview builds | `npm run build:all` passed today; `dist` 112 files, `dist-ghpages` 111, both about 15 MB; links, assets, SEO and inventory pass; 108 sitemap URLs | verified earlier today |
| Catalog | `assets/js/data/tools.js` holds **65** records: **54 published** (Calculators 19, Time Tools 13, Developer Tools 17, Image Tools 2, PDF Tools 3) and **11 Coming soon** (all Calculators) | verified (catalog dump) |
| Articles | **40** records: **34 published**, **6 Coming soon** | verified (articles dump) |
| Article categories | loans 13, investment 10, business 6, tax 2, math 3 published; **health and converter have no published article**; `more` has none | verified |
| Stack | Eleventy, HTML, CSS, ES modules; registries `categories.js`, `tools.js`, `articles.js`, `taxonomy.js`, `relationships.js`, `search-index.js`; two builds (`/` and `/Toolzenhub/`) | verified (docs 08) |
| Report an Issue | `REPORT_ISSUE_URL` is `https://github.com/salar500/Toolzenhub/issues/new`, which equals `git remote origin`. The old wrong-URL defect (B09/D1) is **not present**. The remaining gap is a non-GitHub channel (O-2) | verified |

Changes since doc 00: HEAD moved from `650aa44` to `624b3bb`; Stages 0 to 4 are built and committed locally (ledger 11); a full desktop regression (1,711 tests) and visual/mobile runs passed on `3a8390e`.

## B. Inventory: implemented, incomplete, Coming soon

**Existing and working (54 tools):** see doc 00 for the section split. Five learning experiences (Smart Flashcards and four labs) live in Developer Tools and are listed on `/practice-labs.html`.

**Existing Coming soon (11 calculators), verdicts re-checked against doc 03:**

| Item | Verdict | Reason |
|---|---|---|
| personal-loan, loan-eligibility, interest | Combine into existing EMI / Loan Comparison guidance or retire the record (D, merge) | Variants of tools that exist (rule 1.6) |
| roi, ratio | Defer or retire (D) | Variants; fail the usefulness test |
| age | Merge into Date Difference as a mode or true alias (D) | Duplicate |
| bmi, bmr, calorie | Defer (C) | Health limits and trust bar not met; factory excluded them |
| unit-converter | Defer (C) | Fails the AI-era test (rule 1.4) despite high guessed demand |
| currency | Blocked | Needs live rates, an external API (gate) |

**Coming soon articles (6):** Best SIP Strategies for Beginners, Tax Saving Guide, ROI vs Profit, Daily Calorie Needs, Percentage Made Easy, Easy Unit Conversion. The first three and "Percentage" can be written from existing calculators and are the only ones worth keeping; the calorie and unit-conversion articles depend on deferred tools. **Existing Coming soon items.** The All Tools page no longer shows the Coming soon block (O-5 done); the records stay in the catalog.

**Incomplete:** Gratuity (B6 gate, D8 review, G9 phone acceptance open: `29-gratuity-release-evidence.md`); Developer Tools 13th item (JSON Schema Validator, blocked on an owner decision); World Clock 2.0 production ZIP not deployed (no production action without a request).

## C. UX and consistency audit (status after Stages 0 to 4)

| Observation | Status |
|---|---|
| Directory items: whole-item link, descriptions (U1) | Done, committed locally |
| Search focus indicator (U2) | Done and fixed after a regression; one indicator on the input |
| Date guidance (U3), Date Difference presets (U4) | Done: hint sentence on six tools; presets Today, Tomorrow, +6, +7 days. **Calendar icons are the browser's native control**; whether every phone shows a visible icon is **not verified** (needs your device check) |
| Gratuity default (U5) | Done as **Regular employee**, with a hint that software and IT staff are regular employees. "Software Employee" is **not** a statutory type; creating one would imply a legal category the spec does not support. Keep unless you decide otherwise |
| Featured Tools balance (U6) | Done |
| Practice Labs hub (U8) | Done |
| Sliders (U9) | Open: only Loan Comparison has sliders; field inventory not done |
| Non-GitHub reporting channel (U10) | Open: owner decision O-2 |
| Navigation speed (U11) | Open: needs a browser trace |

## D. Calculator and input improvements (proposals)

- **Existing but needs improvement: linked slider and number control** for rate, tenure and similar bounded fields. Extract the Loan Comparison slider into a shared control only when a second consumer needs it (rule 9.4); the number input stays the source of truth. First step is a **static field inventory** (no browser): list every numeric input with its sensible min, max and step. Cheap, fits low RAM.
- Examples and units: already partly present; an audit pass per calculator is a content task, to be batched three calculators at a time.

## E. Search and navigation

Done for the shared field. Remaining: confirm on a phone that empty states and keyboard behaviour are acceptable (owner pass), and check the per-page search CSS files (categories, calculators, loans, articles) for drift. Do not remove visible focus indicators.

## F. Images and visuals

Four diagram images were added to articles; the five imageless articles and a relevant Articles hero were in U7. **Not re-audited in a browser today.** Convention proposal: calculator articles use a labelled worked-example diagram from the article's own numbers; developer guides use code/flow diagrams; no stock book imagery; provenance fields `imageSource`/`imageLicence` (doc 08); alt text describes the point of the diagram. Mark: existing and working, with a residual audit of the remaining imageless articles.

## G. PDF ecosystem

Existing and working: Merge, Split, Extract/Reorder/Rotate, Photos to PDF. **New proposed (B): PDF Page Numbers and Watermark** (`pdf-lib`, low risk, spec first). **Research-dependent: PDF to Images** (needs a PDF.js size, memory and licence spike; do not start on a 4 GB machine without bounded page-by-page rendering). Deferred or rejected: compress (pdf-lib cannot recompress images), encrypt/unlock, OCR, Office conversion. See doc 04. No Adobe branding or UI is copied.

## H. Finance and Risk-Reward

**New proposed (A in doc 03, deferred in the ledger): Stock Risk-Reward and Position Size Calculator.** Core is unambiguous and independent of fees: risk per unit = |entry − stop|, reward per unit = |target − entry|, ratio = reward ÷ risk, quantity = floor(capital × risk% ÷ risk per unit), and the position cost and the capital at risk. Directional validation (long needs stop < entry < target; short the reverse). Fees and slippage are an extension, not v1. Needs the owner's category (Investment or a new subcategory) and wording that it is a calculation, not advice. Changing-data products (bank rates, medical costs): **not recommended** without a maintenance owner (rules 13.9, doc 03 N19, N20); if ever approved, official sources, verification date, country, currency and rate type are mandatory.

## I. Time tools

Existing and working (13 tools including World Clock, Meeting Planner, Shift Planner, Business Days, Countdown, Time Zone Converter). Doc 02 of the older review still lists some as unbuilt and is out of date. No new time tool is recommended; the open item is the World Clock 2.0 release (production ZIP built, undeployed).

## J. Developer Tools and Labs

Keep them related but distinct: labs are listed on the hub page while living in the Developer Tools section. Five learning experiences exist. **Proposed (research-dependent): SQL Practice Lab**: the Node spike measured sql.js at about 343 KB gzip total, 95 ms init, 85 ms for a join over 50,000 rows and a runaway query stopped by a timer in a thread. **Not yet measured in a real browser worker, on a phone, or for licence/vendoring.** It needs owner decision O-3 (a vendored dependency). Excel practice, Power BI/DAX execution and a Playwright runtime are rejected or deferred (cannot honestly run; a simulation must be labelled and Power BI is rejected). A static "Playwright locator reading" lab is possible later (C). The 12-stage learning ladder in the request should be built one subject at a time and **only advertised as far as it exists**; do not label a path complete with a few exercises.

## K. Career ecosystem

**Not recommended now (D, doc 03 N22; C for interview pathways N21).** A resume/LinkedIn content area is off mission and a content-farm risk. A narrow, defensible alternative: interview-preparation pathways attached to existing labs (SQL, JSON, Cron, test design) once a second subject exists. No employment promises.

## L. Articles and knowledge library

Real gaps: **health and converter article categories are empty and tied to deferred tools**; non-calculator tools have no task guides (N18). Proposal: write the three Coming soon articles that match built calculators (SIP strategies, tax saving, percentage), retire or hold the other three, and for N18 allow an article topic to name a section only once four approved guides exist (O-7). Each guide must answer a question the tool page does not (rule 6.1).

## M. Changing-information strategy

Unchanged from doc 09 and rule 13: no tracker or comparison is built unless explicitly requested with an official-source maintenance plan. Applies to bank rates and medical costs. Gratuity's ceiling shows the pattern: record the source, the reading, the date and the gate (`29-gratuity-release-evidence.md`).

## N. Performance findings

Carried from doc 08 (HTTP timing and static analysis only): small HTML (2.4 to 7.7 KB gzip), 15 to 23 render-blocking stylesheets per page, 6 to 33 JS modules, import depth 4 to 7, `Cache-Control: max-age=600` on GitHub Pages. Inference: request count and module-chain depth on a distant network, not computation. **No browser trace has been run**, so no fix is justified yet. Fix candidates after a trace: one combined stylesheet per page type, `modulepreload` for known chains. These are shared-architecture changes (verify when made, rule 10.11). A trace can run on a GitHub runner only with your push approval (rule 10.3).

## O. Low-RAM development and testing strategy (mandatory, owner decision of 2026-11-01)

Saved to memory (`feedback-low-ram-adaptive-engineering`). **Not yet written into the rulebook** (you gave no preference); if you want it recorded, it extends rules 10.3 and 10.14 and I would name it as a rule change.

- Check free memory once before an expensive operation; one task, one build or test process at a time; no parallel agents or browsers.
- Bands (guidance): above 1 GB normal; 700 MB to 1 GB small batches and focused checks (today's session was at about 790 MB); 400 to 700 MB editing, inspection and unit tests, defer builds; below 400 MB checkpoint and wait. Real instability overrides the numbers.
- Split tests into sequential groups instead of dropping assertions; an interrupted run is recorded as interrupted, never as pass or fail.
- Save a checkpoint (ledger) before pausing and resume from it. Never kill unrelated processes.
- Static, catalog-level and pure-module work is cheap and should go first; browser and build work is batched at checkpoints.
- Today's evidence: a full build took 23 s and about 45 MB of free memory; the five Gratuity test files ran in 1.3 s. Node unit work is not the memory problem; Chromium is.

## P. Prioritised roadmap

| Order | Item | Label | Gate |
|---|---|---|---|
| 1 | Close Gratuity: your phone checklist, S.O. 1420(E) Gazette PDF or acceptance, external review | Existing, needs improvement | You / reviewer |
| 2 | Calculator field inventory (static), then shared slider decision | Existing, needs improvement | None |
| 3 | N1 Risk-Reward Calculator (spec, pure module, hand-computed vectors) | New proposed | Category and wording decision |
| 4 | Three articles for built calculators; retire or hold the rest; retire redundant Coming soon calculator records | Existing Coming soon | Owner confirms retirements |
| 5 | Browser trace, then small build-time speed fixes | Research-dependent | Runner approval or free RAM |
| 6 | N2 PDF page numbers and watermark | New proposed | Spec first |
| 7 | O-2 reporting channel | Blocked | Owner choice |
| 8 | SQL Practice Lab | Research-dependent | O-3, browser spike |
| 9 | PDF to Images | Research-dependent | Spike |
| Deferred | Unit converter, health calculators, Excel practice, interview pathways | Deferred | |
| Rejected | Resume/LinkedIn area, Power BI execution, compress/encrypt PDF, country reference, health-cost guide | | |

## Q. Dependencies and affected files (when built)

N1: catalog and search index entries, `assets/js/calculators/risk-reward/` (new), a pure formula module, spec in `docs/tool-packs/`, listing baselines (deliberate edit). Sliders: `loans/loan-comparison/components/LoanCard.js`, `assets/css/calculators/loan/03-form-fields.css`, then each adopting calculator. Speed work: `eleventy*.config.js` and base templates. Retiring Coming soon records: `tools.js`, `search-index.js`, `articles.js`, pinned specs.

## R. Acceptance criteria (headline)

Each item needs: a spec; pure-module tests with hand-computed vectors for any arithmetic; the built page reachable at both bases; static checks (links, assets, SEO, inventory) pass; keyboard and 320/390 px reviewed by you; wording that never turns an estimate into advice; docs and ledger updated. Doc 07 holds the item-level criteria.

## S. Risks and unresolved decisions

1. Gratuity gates (B6, D8, G9) stay open.
2. Which Coming soon records to retire, and whether "Software Employee" should be a separate type (not recommended).
3. N1 category and fee scope; O-2 channel; O-3 SQL dependency; O-7 guide taxonomy.
4. No search-demand data exists; every demand score is a hypothesis.
5. The older package assumed Hostinger behaves like Pages; production performance is unmeasured.
6. Evidence limit of this refresh: today's new research is the Gratuity ceiling only; the PDF, SQL, risk-reward and competitor evidence is carried from doc 00 and was **not re-researched**. No hands-on competitor test, browser trace or device check was run.

## T. Recommended implementation sequence

Gratuity closure (yours), then the static field inventory, then N1, then the three article/retirement batch, then trace-led speed work. One coherent batch at a time, each ending in a ledger checkpoint, local commits only on your approval.
