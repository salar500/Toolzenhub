# 12. Prioritized development roadmap

## 1. Scoring model (rulebook 12)

The weights are: demand 25%, repeat use 25%, usefulness 20%, differentiation 10%, feasibility 10%, trust/privacy/performance 10%. Scores run from 0 to 5.

Each reason is labelled:

- **[V]** verified data;
- **[P]** public evidence;
- **[H]** hypothesis.

A score is a judgement, not a measurement (rule 12.3). Search volumes are **unknown** (no keyword data, [11 SEO](11-seo-strategy.md), section 6), so every demand score below is partly hypothesis.

| Candidate | Demand | Repeat | Useful | Diff. | Feasib. | Trust | Weighted | Main reasons |
|---|---|---|---|---|---|---|---|---|
| SQL completion (P50) | 4 | 3 | 5 | 3 | 5 | 5 | **4.05** | 58.6% of devs use SQL [S01 V]; engine built [V]; projects and interview are common needs [H] |
| Manual Testing + writing labs + ShopLite (P01, P02, E4, E5) | 3 | 3 | 5 | 5 | 4 | 5 | **3.90** | Free checked testing practice is missing [S26 P, H]; launch audience [03] |
| API Testing + workbench (P03, E6) | 3 | 3 | 5 | 4 | 4 | 5 | **3.80** | In Indian postings [S11 P]; no third-party calls needed [H] |
| Playwright (P07, E7 locator) | 4 | 3 | 5 | 4 | 2 | 4 | **3.75** | Adoption lead [S09 E]; postings [S11 P]; cannot run in the page (feasibility 2) |
| JavaScript Fundamentals (P30, E1 JS) | 4 | 3 | 4 | 1 | 5 | 5 | **3.65** | Most-used language [S01 V]; crowded market [P] |
| Python (P15) | 5 | 3 | 4 | 1 | 3 | 4 | **3.60** | 71.8% of learners [S01 V]; about 5 MB runtime [S41 P] |
| Git and GitHub (P13, E7 git) | 4 | 2 | 4 | 3 | 4 | 5 | **3.50** | Universal [H]; Learn Git Branching exists [S30 P] |
| Excel and Power BI paths (P70, P71: wrap existing labs) | 3 | 3 | 4 | 2 | 5 | 5 | **3.50** | 98 exercises and 26 lessons exist [V]; secondary audience [03] |
| AI Foundations + Prompt Evaluation + Testing AI (P60, P61, P06) | 4 | 2 | 4 | 3 | 3 | 4 | **3.30** | 44% learn with AI [S02 P]; testers' AI gap [S10 P]; no runtime AI (feasibility 3) |
| Java (P16) | 3 | 3 | 4 | 1 | 2 | 3 | **2.90** | 40.8% of learners [S01 V]; runtime uncertain [S43] |
| Remaining W9 paths | 2–4 | 2–3 | 3–4 | 1–3 | 2–4 | 4–5 | 2.6–3.4 | Built after demand is measured |

**Mandatory gates (rule 12):** all candidates pass. Java passes only with the honest fallback ([09](09-technical-architecture.md), section 7). No candidate needs a paid API.

## 2. Waves

Each wave follows the sequence in [14 / the blueprint](../practice-labs-development-blueprint.md), section 13:

1. Requirements
2. Architecture
3. Development
4. Feature sanity checks
5. Docs
6. Commit
7. Preview

| Wave | Scope (deliverables) | Depends on | Completion criteria (summary; full list in [13](13-acceptance-criteria.md)) |
|---|---|---|---|
| **W0 Platform foundations** | Department and path registries; department pages (8, each showing only published paths, with "coming" text); learning-paths home rebuilt around departments; lesson block model plus the adapter for the 18 SQL lessons; `validateLesson`; E3 quiz engine; E2 = the existing `learning/lab-shell.js` extended with a checker interface (not rebuilt, [16](16-existing-assets-reuse.md)); phone lesson card; breadcrumb department step; Practice Labs search index and UI; reserved-slug and namespace test | none | All 30 existing pages render identically except the intended changes (breadcrumb, lesson card); the 8 department pages exist; schema test passes |
| **W1 SQL complete** | L19 to L24; 6 projects (E13); interview module; SQL JOIN Visualizer (standalone) and Query Explainer (embedded); new datasets (employees, banking, clinic) with independent expected results | W0 | SQL status "complete"; every new expected result is verified by Python sqlite3; the visualizer works on phones |
| **W2 Testing foundations** | ShopLite (stable and r-bugs-1); E4 writing lab (test case, bug report, requirement questions, test plan); Bug Hunting Simulator; P01 (24 lessons, 3 projects, interview); P02 (6 lessons, 1 project); standalone: Test Case Writing Lab, Bug Report Writing Lab, Bug Hunting Simulator; Interview Practice index (SQL and testing) | W0 | Both paths complete; every seeded bug is reproducible; rubric checker gives specific feedback on 3 reference good and bad answers per template |
| **W3 API Testing** | E6 workbench plus Service Worker mock API (ShopLite API, r-api release); P03 (14 lessons, 2 projects, interview); standalone API Practice Workbench | W2 (ShopLite data) | Path complete; the mock works on the preview subpath and at the root; fallback shim tested |
| **W4 Playwright** | E7 locator evaluator; static and simulated code checker; starter project (zip) verified locally with real Playwright; P07 (19 lessons, project, interview); standalone Locator Practice | W2, W3 | Path complete; every locator task is verified against real Playwright locally (recorded); honesty labels present |
| **W5 Git and JavaScript** | E7 git simulator (standalone Git Practice Simulator); P13 (14 lessons, 2 projects, interview); E1 JS engine (standalone JavaScript Playground); P30 (12 lessons, 2 projects, interview) | W0 | Both paths complete; every goal is reachable and the reference solution passes |
| **W6 Python and Data paths** | Pyodide vendored (after D3) with E1 Python; P15 (lessons per the Requirements step; 3 projects); P70 Excel and P71 Power BI wrapped from the existing labs | D3 | Python first-run time and memory measured on a phone emulation and recorded; paths complete |
| **W7 AI foundations** | E10 Prompt Evaluation Lab (standalone); E8 tokenizer and temperature visualizers; P60, P61, P06 | W2 (testing vocabulary) | Recorded outputs dated and labelled; no runtime AI; paths complete |
| **W8 Applied AI, API automation, Java** | P62 (embedding visualizer, agent-loop simulator), P63 ML Foundations (ML visualizers), P65 Responsible AI, P08 API Test Automation, P16 Java (with D4 outcome) | W5, W6, W7 | Each path complete; Java execution or honest fallback per D4 |
| **W9 Remaining catalogue** | All other paths in [05](05-learning-path-catalogue.md), ordered by measured demand at that time (re-score with GSC data) | data from W1–W8 | Each is built only after its Requirements table exists; one complete path at a time |

P70 and P71 are scheduled in W6, not W9, because wrapping the existing labs is cheap (score 3.50). [05](05-learning-path-catalogue.md) shows them in W6.

## 3. Launch recommendations

- **Launch audience:** testers and testing job-seekers, with SQL as the first technical skill ([03](03-user-needs.md), section 3).
- **First departments:** D1 Software Testing, D5 Databases (SQL), then D2 Test Automation.
- **First paths:** SQL (complete), Manual Software Testing, Test Design, API Testing, Playwright.
- **First interactive tools:** SQL JOIN Visualizer, Test Case Writing Lab, Bug Report Writing Lab, Bug Hunting Simulator (ShopLite), API Practice Workbench, Locator Practice.
- **Best projects:** SQL interview challenges, the e-commerce sales report, the ShopLite release bug hunt, the ShopLite Orders API bug hunt, and automating ShopLite checkout.

**Free vs premium:**

- Everything in this blueprint is **free and account-free**.
- **Candidates for later monetisation (owner decision D8; nothing built):**
  - ads under rulebook 6.8;
  - an optional paid offline bundle (PDF workbooks and project packs);
  - sponsorship of a path.
- No paywalled lessons are recommended: the free-and-complete position is the differentiator ([01](01-market-research.md), finding 3).

**Organic acquisition:**

- **Search:** practice-led pages ([11](11-seo-strategy.md)).
- **Shareable artefacts:** exported test plans and SQL reports that carry a "made with" footer line, optional and off by default.
- **Communities:** the owner posting projects in QA communities is a manual activity; no automation is proposed.

**Retention without accounts:**

- standalone tools people reuse (writing labs, workbench, simulators);
- interview modules revisited before interviews;
- the existing opt-in flashcards;
- a **resume** feature only if D1 is approved;
- new monthly challenge sets in the Interview Practice index (content cadence, not streaks).

## 4. Success metrics (per wave, measured as in [11](11-seo-strategy.md), section 6)

| Metric | Source | Target type |
|---|---|---|
| Indexed pages vs published | GSC | 90% or more indexed within 8 weeks |
| Non-branded impressions and clicks per cluster | GSC | Trend up; no fixed number promised |
| Practice engagement (Run or Check per lesson view) | GA4 events (if D7) | Baseline in W1, then compare |
| Repeat visits to standalone tools | GA4 | Baseline, then trend |
| Path depth (sessions reaching lesson 2 or later) | GA4 | Baseline |
| Correctness reports | Contact form | Every report fixed within one wave |

**No traffic or revenue is guaranteed.**

## 5. Demand-validation experiments

| Id | Experiment | Measure | Decision it informs |
|---|---|---|---|
| X1 | Publish SQL projects and interview (W1) before any new path | GSC impressions and clicks on project and interview pages vs lessons at 8 weeks | Whether projects and interviews outrank lessons → build those types earlier in later paths |
| X2 | Publish the Test Case and Bug Report labs (W2) as standalone tools with lesson links | Tool-page clicks vs lesson clicks; repeat visits | Whether writing labs deserve more templates (requirement and test plan as standalone) |
| X3 | Bug Hunting Simulator traffic and use, compared with GSC queries showing "bug examples" intent | Share of visits that report at least one bug | Whether the D2 automation paths should be ShopLite-centred (planned yes) |
| X4 | Department page vs direct path entry | GSC landing-page share | Whether departments need richer content or stay navigational |
| X5 | Python "Load (6 MB)" consent button | Share of visitors who load it | Whether a lighter Python subset is needed for phones |
