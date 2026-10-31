# 03. Unified candidate backlog and verdicts

## Method

The rulebook already defines the scoring (section 12): six dimensions scored 0 to 5, weights 25, 25, 20, 10, 10, 10, then the mandatory gates, then a verdict. This package uses that system and not the twelve-criterion list in the request, because section 12 says it wins. Verdict mapping to the request: **A** approved planning candidate (request "build or improve first"), **B** needs further validation (request "strong next candidate"), **C** future opportunity (defer), **D** rejected, unsuitable or merge. **A verdict A is a planning status, not approval to build** (rule 12.7).

Total = weighted score on a 0 to 100 scale. It is judgment, not a measurement (rule 12.3). **Every demand and repeat-use score is a hypothesis**: no Search Console, Keyword Planner or analytics data exists in this repository. A gate overrides the total.

Columns: demand / repeat use / usefulness / differentiation / feasibility / trust, privacy and performance.

## A. Fixes and enhancements to existing, published things (ranked by evidence, not scored)

These are not new products, so section 12 scoring does not apply. They are ordered by verified severity and reach (doc 02).

| ID | Item | Observation | Verdict | Why |
|---|---|---|---|---|
| U1 | Discoverable, consistent directory items (whole-card link, one pattern, descriptions for calculators) | B11, D2 | **A** | Verified, high reach, shared component, no URL change |
| U2 | One accessible search interaction system, consistent focus | B03, D7, D13 | **A** | Verified inconsistency; accessibility requirement; keep a visible indicator |
| U3 | Date-field guidance and affordances, native controls kept | B07, B08, D8 | **A** | 11 inputs, one shared pattern; device check owed |
| U4 | Date Difference presets (Today, +6, +7 days and a few more) writing to the existing fields | B15 | **A** | Small, reuses the engine; semantics fixed in doc 07 |
| U5 | Gratuity default and plain wording, formulas untouched | B06, D9 | **A** | Small; legal basis to be re-verified from a primary source first |
| U6 | Featured Tools rebalanced across implemented sections | B13, D10 | **A** | Tiny; rule 3.2 requires the reason to be recorded |
| U7 | Article imagery: images for the 5 imageless articles, a relevant Articles hero, labelled diagrams, crop fix | B04, D3 to D6 | **A** | Verified; improves existing content |
| U8 | Practice Labs discoverability | B17, D11 | **A for the decision package**; build needs owner approval | A section change needs approval (doc 05) |
| U9 | Linked slider and number control, shared component | B05 | **B** | Needs the field inventory and per-field decisions; only Loan Comparison has sliders today |
| U10 | Lightweight issue reporting | B09, D1 | **B** | Blocked on the owner's choice of real channel (O-2) |
| U11 | Navigation speed | B16 | **B** | Cause inferred only; measure in a browser first, avoid speculative rewrites |
| U12 | Hide or keep the "Coming soon" lines on All Tools | B01, D12 | **B** | Owner decision O-5 |

## B. New tools, ecosystems and content (scored)

| ID | Candidate | Scores (six dims) | Total | Gate result | Verdict |
|---|---|---|---|---|---|
| N7 | SQL Practice Lab (browser SQLite) | 4 / 4 / 4 / 3 / 2 / 4 | 74 | Needs a new dependency (sql.js), size unknown, memory on the 4 GB class of device unproven: **spike first** | **B** |
| N1 | Stock Risk-Reward and Position Size Calculator | 3 / 4 / 4 / 2 / 5 / 4 | 73 | Passes all gates; commodity, so differentiation must come from correctness, fees and slippage, and clear explanation | **A** |
| N12 | Unit Converter | 5 / 3 / 3 / 1 / 4 / 4 | 70 | Fails the AI-era test (rule 1.4): an assistant does it as well; high total only from a hypothesised demand | **C** |
| N4 | PDF to images | 4 / 3 / 4 / 2 / 2 / 3 | 65 | Needs PDF.js (not vendored), a worker and memory care on large files: **spike** | **B** (spike) |
| N8 | Playwright locator and assertion reading lab (static, no runtime) | 3 / 3 / 3 / 3 / 4 / 4 | 64 | Passes if it never claims to run Playwright | **C** (after the first vertical) |
| N5 | Compress PDF | 5 / 3 / 4 / 1 / 1 / 2 | 64 | `pdf-lib` cannot recompress image streams; honest output would often be no smaller: unreliable result | **D** for now |
| N19 | Home-loan rate comparison (changing data) | 4 / 3 / 4 / 3 / 1 / 1 | 61 | Fails the maintenance gate and rule 13.9 without a maintenance owner; no tracker has been selected | **D** (not now) |
| N11 | Age Calculator | 4 / 2 / 2 / 1 / 5 / 5 | 60 | Duplicate of Date Difference (rule 1.6) | **D** (mode or true alias) |
| N2 | PDF page numbers and watermark | 3 / 2 / 3 / 2 / 4 / 5 | 59 | Passes; vendored `pdf-lib` | **B** |
| N21 | Interview-readiness pathways | 3 / 3 / 3 / 2 / 3 / 3 | 58 | Depends on labs existing | **C** |
| N9 | Excel formula practice | 4 / 3 / 3 / 2 / 1 / 2 | 57 | Needs a formula evaluator; licence and "Excel compatible" claims unverified | **C** |
| N6 | Image crop, rotate, flip, metadata remover | 3 / 2 / 3 / 2 / 4 / 4 | 57 | Passes; the earlier factory excluded an EXIF tool, so this needs its own spec | **C** |
| N3 | PDF metadata viewer and cleaner | 2 / 2 / 3 / 3 / 4 / 4 | 54 | Passes; privacy value is a hypothesis | **C** |
| N18 | Task-led how-to guides for existing non-calculator tools | 3 / 1 / 3 / 2 / 5 / 4 | 54 | Passes if each guide answers a question the tool page does not (rule 6.1) | **B** |
| N15 | Personal Loan, Loan Eligibility, Interest | 3 / 2 / 2 / 1 / 5 / 4 | 53 | Variants of existing tools | **D** (merge) |
| N14 | ROI Calculator | 3 / 2 / 2 / 1 / 5 / 4 | 53 | Variant | **D** |
| N13 | BMI, BMR, Calorie | 4 / 2 / 2 / 1 / 4 / 2 | 52 | Health limits not stated; factory excluded them | **C** |
| N10 | Power BI or DAX practice | 3 / 3 / 2 / 2 / 1 / 1 | 46 | Cannot run; a simulation would mislead | **D** for execution |
| N22 | Resume and LinkedIn guidance | 3 / 1 / 2 / 0 / 4 / 3 | 42 | Off mission; content-farm risk | **D** |
| N16 | Ratio Calculator | 2 / 1 / 1 / 1 / 5 / 5 | 41 | Fails the usefulness test | **D** |
| N17 | Country and capital reference | 2 / 1 / 1 / 1 / 4 / 3 | 35 | Duplicates World Clock's data; no task | **D** |
| N20 | Health treatment-cost guide | 3 / 1 / 2 / 1 / 1 / 0 | 32 | No credible maintainable dataset; medical-advice risk | **D** |

Not scored and not recommended: Currency Converter (needs live rates: external-API gate); a global "World Map" (named by the owner earlier, no document exists; unknown).

## C. Reading the ranking honestly

- Two A or B-leading items (N7 and N1) differ by one point; the totals do not separate them. They are different kinds of work: N1 is a self-contained tool, N7 is the seed of an ecosystem that needs a dependency decision.
- N12 scores 70 mainly because demand is guessed at 5. The AI-era gate, not the score, decides.
- The ranking would change if Search Console data existed. Obtaining it is a precondition worth stating (doc 09, risk R2).

## D. Separation requested in the brief

- **Existing UX fixes:** U1, U2, U3, U5, U6, U12.
- **Existing tool enhancements:** U4, U9, U7 (content).
- **New tools:** N1 (A); N2, N4 (B); others C or D.
- **New ecosystems:** N7 (B), plus the Practice Labs presentation decision (U8).
- **Content improvements:** U7 (A), N18 (B).
- **Long-term research concepts:** N8, N9, N21, N10.
