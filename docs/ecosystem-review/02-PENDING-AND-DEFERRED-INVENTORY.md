# 02. Pending, proposed, deferred and rejected candidates

Sources read: `docs/tool-pack-factory.md` (Roadmap R1, Roadmap R2, planning inventories P1 and P2, the "considered and not on the roadmap" list), `docs/tool-packs/28` to `33`, `docs/product-decision-rules.md` section 12 and 13, and the two candidate lists pasted into the review requests of 2026-10-25. Duplicates across those lists are merged here. **Nothing in this file approves a build.** The factory says R1, R2, P1 and P2 "authorize nothing"; rulebook 12 requires a section-12 evaluation, a feasibility audit and an approved specification before any build.

## Evidence rule used throughout

Per rulebook 12.4 every demand or retention statement is one of: verified data, public evidence, reasoned hypothesis, unknown. **No search-volume, traffic or retention figure exists in the repository for any candidate below, and none was added.** Every "Evidence" cell therefore reads *hypothesis* or *unknown* unless a verified source is named. No external keyword research and no new competitor research was done in this phase (see 16).

## Status classes

BUILT, APPROVED-NOT-BUILT, PROPOSED, RESEARCH-NEEDED, DEFERRED, REJECTED (excluded), BLOCKED.

## A. Candidates that are now built (listed so they are not counted as pending)

| Candidate | Where it appears | Built as | Notes |
|---|---|---|---|
| Hours & Timesheet | R1 #1, P1 Time 4 (tracker variant is separate) | `hours-calculator` (Tool Pack 23) | The P1 "Timesheet & Work Hours Tracker" with stored entries is still a different, unbuilt candidate (see C) |
| Credit Card Payoff, Cron Explainer, PPF, Base64 | R1 #2 to #5 | Tool Packs 24 to 27 | Built, published |
| Salary / CTC to In-Hand | R1 #6 | `salary-in-hand` (Tool Pack 30) | On preview, spec "DRAFT, release not approved" |
| Photos to PDF = Images to PDF | R1 #7 = P1 Documents 3 | `photos-to-pdf` (Tool Pack 31) | One candidate, one route |
| World Clock | R2 #1 = P1 Time 5 | `world-clock` (Tool Pack 28) | Not on production |
| Gratuity Calculator | R2 #2 | `gratuity` (Tool Pack 29) | Not on production; spec DRAFT |
| Merge PDF, Split PDF, Extract/Reorder/Rotate PDF Pages | P1 Documents 1, 2, 5-7 | `merge-pdf`, `split-pdf`, `pdf-pages` (Tool Pack 33) | PDF Tools section approved 2026-10-26; not on production |
| Time Zone Converter, Online Countdown Timer, Stopwatch with laps | P1 Time 2, 6, 7 | Tool Packs 19, 13, 14 | Already published when P1 was written |

## B. Roadmap candidates not built

| Candidate | Section (provisional) | Status | User problem | Evidence | Differentiation | Complexity / correctness risk | Recommendation |
|---|---|---|---|---|---|---|---|
| QR Code Generator (Tool Pack 32) | Image Tools | **DEFERRED** (spec DRAFT, "IMPLEMENTATION NOT APPROVED"; R1 #8, feasibility-dependent) | Make a QR code for a URL or text | Hypothesis (commodity, strong free incumbents) | Weak on its own; spec 32 argues exactness and local generation | Low UI complexity; encoder correctness is the gate (spec 32 recommends porting MIT-licensed Nayuki code, with jsQR, Apache-2.0, as a dev-only oracle, licence data VERIFIED in the spec) | Keep deferred until the owner decides; do not build for count |
| International Meeting Planner | Time Tools | **APPROVED-NOT-BUILT by owner statement only** (see below) | Find overlapping working hours across 2 to 4 cities | Hypothesis | Must do what Time Zone Converter does not (spec 19 and R2 text say the converter has no planner) | Medium: DST and cross-midnight correctness; reuses the time-zone engine | Highest-fit Time Tools gap; specification still unwritten |
| Pomodoro Focus Timer | Time Tools | **APPROVED-NOT-BUILT by owner statement only** | Focus and break cycles | Hypothesis | Must be a different job from Countdown Timer; any saved history needs a rulebook 7.7 reason | Low to medium: timer accuracy in background tabs | Needs a Countdown-versus-Pomodoro differentiation decision first |
| Shift Schedule Planner | Time Tools | **APPROVED-NOT-BUILT by owner statement only** | Plan repeating shifts | Hypothesis | Unclear against Hours & Timesheet | Medium: rotation rules | Lowest-confidence of the three; confirm the use case before specification |

**What "approved by owner statement" means.** The owner's prompts of 2026-10-25 describe the three Time Tools as "approved" for Batch 2. No repository document records that approval, and this phase may not change the roadmap or rulebook. It is therefore listed in 14 as a decision to record. Repository facts: none of the three is in the catalog, no Tool Pack spec exists for them, and HEAD has not changed since `8ece03a`. They are **not built**.

## C. Unbuilt P1 candidates (30 listed in P1, merged with duplicates)

| Candidate | Provisional home | Status | Overlap / main risk | Recommendation |
|---|---|---|---|---|
| SQL Practice Lab | Undecided | RESEARCH-NEEDED | Needs a browser-local SQL engine chosen by audit; validate by output equivalence | Research later; no section fits |
| QA Testing Practice Lab | Undecided | RESEARCH-NEEDED | Content volume, correctness of answers | Defer |
| Excel Formula Practice & Troubleshooting | Undecided | RESEARCH-NEEDED | No Excel-compatibility claim without proof | Defer |
| CSV Cleaning Workbench | Undecided (Developer Tools is the closest) | RESEARCH-NEEDED | Shares an engine with P2 Text Cleaning Workbench | Evaluate together; one tool |
| Playwright Locator Playground | Undecided | RESEARCH-NEEDED | Niche audience | Defer |
| JSON Schema & JSONPath Lab | Developer Tools | PROPOSED | Extend JSON Formatter, do not duplicate (P1 text) | Strongest Developer Tools candidate; needs audit |
| Spreadsheet & CSV Reconciliation | Undecided | RESEARCH-NEEDED | Text Diff covers text, not keyed records | Defer |
| Regex Tester with Guided Debugging | Developer Tools | **REJECTED for R1** (exclusion "stands" per P1) | Listed again in the 2026-10-25 request | Re-opening needs an explicit owner decision |
| Batch File Renamer | Undecided | RESEARCH-NEEDED | Browser file-access limits | Defer |
| PDF to Images | Undecided (PDF Tools would be natural) | RESEARCH-NEEDED | Needs a PDF renderer (PDF.js is not vendored; heavy); memory risk | Do not start without a spike |
| Document Format Converter | Undecided | DEFERRED | No layout-fidelity promise possible | Defer |
| Document Comparison Tool | Undecided | DEFERRED | Text Diff covers plain text | Defer |
| Blank PDF Page Remover | Undecided | DEFERRED | "Never delete an uncertain blank page silently" (P1) | Defer |
| PDF Print Preparation | Undecided | RESEARCH-NEEDED | Vague job | Defer |
| File Metadata Inspector | Undecided | RESEARCH-NEEDED | Privacy value is a hypothesis | Defer |
| Duplicate File Finder | Undecided | DEFERRED | Browser file access, memory | Defer |
| Timesheet & Work Hours Tracker | Time Tools | DEFERRED | Stored entries need a rulebook 7.7 persistence reason; Hours Calculator exists | Defer |

## D. P2 candidates (all tiers, none approved)

Tier A (needs section-12 evaluation first): Supplier Quote Comparison, Gold & Silver Purchase Cost Calculator (tax rule must be verified from an authoritative source), Subscription Cost Comparison, Travel Budget Scenario Planner. Tier B: Workplace English Practice Lab, Quantitative Aptitude Practice Lab, Project Profitability & Pricing, Job Offer Comparison (reconcile with the built Salary tool), Typing Accuracy & Speed Practice, Inventory Reorder Planner, Writing Readability Inspector, Text Cleaning Workbench. Tier C (hold or deferred): Currency Conversion Cost Comparison (the Currency exclusion is binding), Study Revision Planner, live gold/currency/market/fuel information pages (trackers, rulebook 13), Resume Readability Checker, Career Skill Gap Planner, travel, household, Markdown and transliteration items. All keep the status the factory gives them. None is re-scored here.

## E. Excluded by the factory ("considered and not on the roadmap")

Unit Converter, Currency, Loan Eligibility, Personal Loan, Interest, ROI, RD, Age, Ratio, the Health tools (BMI, BMR, Calorie), Regex Tester, Password Generator, Inflation, EXIF tool. Reason recorded: failed a mandatory gate, were variants of an existing tool, or had no fitting section. Eleven of them still exist as `coming-soon` catalog entries (see 01). The 2026-10-25 requests list many of these again (for example ROI, Ratio, Age, Unit Converter, BMI/BMR, Loan Eligibility Estimator, Regex Tester, Metadata Viewer/Remover). That does not reopen them; each would need a new section-12 evaluation and owner approval.

## F. New candidate ideas from the 2026-10-25 lists that are not in any authoritative roadmap

These are **PROPOSED, unscored and unevaluated**. For each, the first decision is not "build" but the option in rulebook-style order: already available, improve an existing tool, add a mode, new tool, guide, or defer.

| Ecosystem | Idea | Disposition proposed here (a reasoned inference, not a decision) |
|---|---|---|
| Calculators / loans | Loan Amortization Explorer; Debt Snowball vs Avalanche; Mortgage Refinance Comparison; Loan Fee Impact; APR calculator | Amortization already exists as a schedule inside Home Loan, Prepayment and Loan Comparison: mostly ALREADY AVAILABLE or MODE. Snowball vs Avalanche is the only distinct job (extends Credit Card Payoff); RESEARCH-NEEDED |
| Calculators / investment | XIRR; Lumpsum; Recurring Deposit; Inflation-Adjusted/Real Return; Retirement Corpus; Goal planner | Lumpsum overlaps SIP/FD/CAGR (MODE); RD was excluded by R1; Goal planning is partly covered by the SIP guide "How Much SIP Do You Need for a Goal?". XIRR is the one distinct computation; RESEARCH-NEEDED |
| Calculators / tax | HRA, Capital Gains, TDS, Leave Encashment, Regime Break-Even | All rule-dependent (rulebook 3.6, 8): BLOCKED until an authoritative dated source and an oracle exist. Regime comparison already exists inside Income Tax (`compare`) |
| Calculators / business | Commission, Cash Runway, Break-even scenarios, Freelancer Rate | Break-even is covered by Profit; Freelancer Rate ties to P2 Project Profitability (Tier B). RESEARCH-NEEDED |
| Calculators / math, health | Fraction, Weighted Average, Percentage Difference, Scientific, hydration and fitness | Percentage Difference belongs inside Percentage (MODE); health stays EXCLUDED until limits can be stated (rulebook 3, R1) |
| Time Tools | Business Days; Working Days Between Dates; Deadline; Week Number; Time Duration Adder; Interval Timer; DST Transition Checker; Recurring Dates | Business/working days, deadline and week number are modes of Date Calculator or Date Difference (MODE); Interval/multi-stage timer overlaps Countdown/Pomodoro; DST Checker overlaps Time Zone Converter and the planned Meeting Planner |
| Developer Tools | JSON Diff, JSON/CSV/YAML/XML converters, URL and HTML entity encoders, UUID, hash, HTTP status, cURL, query parser, colour converter | Many are commodities with strong free alternatives (hypothesis); JSON Diff, JSON Schema and JSONPath extend the JSON tool; the rest RESEARCH-NEEDED, one family at a time |
| Image Tools | Target-size option; batch resize; crop; rotate/flip; format conversion; favicon; metadata viewer/remover; passport layout | Target size, resize modes and format output belong in the existing compressor (ENHANCE, not a new page). Crop/rotate, metadata and passport layout are separate jobs: RESEARCH-NEEDED. Background removal, OCR, watermark are ADVANCED RESEARCH and carry model/size risk: DEFERRED |
| PDF Tools | Add page numbers; insert blank pages; delete/duplicate pages; metadata viewer/remover; header/footer; watermark; compression; PDF to text/images | Delete and duplicate are already possible inside `pdf-pages` (page list and repeats): ALREADY AVAILABLE. Page numbers, watermark, header/footer and metadata viewing are candidate modes or tools using the vendored pdf-lib: RESEARCH-NEEDED. Metadata removal must never be claimed complete without verification (spec 33 spike). Compression, PDF to images/text/OCR need a renderer or heavy dependency: DEFERRED |
| Other | World Map | The word does not appear in any repository document read. The owner's prompts call it deferred. **Evidence gap**: nothing to inventory beyond that statement |

## G. Counts

Unbuilt, individually named candidates in the authoritative lists: P1 17 (table C), P2 about 18 (D), roadmap B: 4 (QR plus three Time Tools). Excluded entries: 14 names. The unscored ideas in F are not counted as candidates until a section-12 evaluation exists for each.
