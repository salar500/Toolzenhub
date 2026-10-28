# 07 Candidate scoring and priorities

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Method

The scoring method is the one in rulebook section 12, unchanged: six dimensions scored 0 to 5, weighted Search demand and discoverability 25%, Repeat use and retention 25%, Practical user usefulness 20%, Differentiation 10%, Implementation and maintenance feasibility 10%, Trust, privacy and performance 10%. The weighted total is out of 5.00 and is decision support, not a measurement (rulebook 12.3). Weights sum to 1.00.

Columns: D demand, R repeat use, U usefulness, X differentiation, F feasibility and maintenance, T trust, privacy and performance.

## Evidence behind the scores

- **Demand (D) is a HYPOTHESIS for every candidate.** No keyword volumes were obtained: Google Trends returned HTTP 429 (doc 05). Scores for demand are therefore conservative and reflect only what was observed about the competing landscape (many strong free incumbents for SQL, JavaScript and general flashcards, observed in doc 03).
- **Repeat use (R) is a HYPOTHESIS.** The site has no usage data (rulebook 3.1, 12.2). Flashcards score higher because revision is repeated by design; one-off lookups score lower.
- **Feasibility (F) and Trust (T) are partly VERIFIED**: the existing engines, their limits and their test suites were read in the repository (doc 02); the sql.js, sandbox and Worker facts were read on public pages (doc 13).
- Differentiation (X) rests on the reuse of ToolZenHub's own verified engines (VERIFIED in the repository) and on the observed competitor features (doc 03); where it relies on "no competitor does this" it is a HYPOTHESIS, because only the pages listed in doc 03 were inspected.

## Mandatory gates (rulebook 12)

- **G1**: does not solve a meaningful user problem.
- **G2**: only duplicates an existing tool or another candidate without a real improvement.
- **G3**: can give unreliable or misleading output (unassessable or ambiguous answers, misleading indicators).
- **G4**: maintenance or content burden is disproportionate.
- **G5**: needs a paid external API.
- **G6**: unacceptable privacy or security risk (unsafe execution, rendering of user code, storage rule conflict).
- **G7**: cannot deliver an acceptable mobile experience.
- **G8**: added only to raise the tool count.

A candidate that fails any gate is rejected or deferred however high it scores. In the table, a gate code means the candidate fails or is at risk on that gate. **No P0 candidate has a gate code.** P1 candidates 14 and 15 carry G4 and are P1 only because their disposition is conditional on a separately approved feasibility spike; without that spike they would be DEFER.

## Priority bands (judgment, not a rulebook formula)

The rulebook gives the weights and the gates and says weights never replace judgment. The bands below are how this research read the numbers:

- **P0**: no gate fails, a deterministic answer or a clear learning loop exists, existing verified engines or no new dependency, and the item belongs to the smallest coherent first scope (rulebook 1.8). P0 totals range from 2.50 to 3.60; the supporting features 47 and 53 sit below the tools because they exist to serve the tools and are not independent draws (stated in doc 06).
- **P1**: sound but later (needs a spike, a reviewer, or proof that the first set is used).
- **P2**: low value now or a mode that can wait.
- **DEFER**: a gate fails today or a blocker exists, but the idea may return.
- **REJECT**: a gate fails and no change would cure it.

Rulebook verdicts: P0 maps to **A** (approved planning candidate; planning status only, not approval to build), P1 to **B** (needs further validation), P2 and DEFER to **C** (future opportunity), REJECT to **D**.

## Scores

| # | Candidate | D | R | U | X | F | T | Weighted | Gates | Priority | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | JSON Syntax Practice Lab | 2 | 2 | 3 | 2 | 4 | 5 | 2.70 | none | P0 | A |
| 2 | JSON Error-Fixing Lab | 3 | 3 | 4 | 4 | 4 | 5 | 3.60 | none | P0 | A |
| 3 | JSONPath Challenge Lab | 2 | 3 | 4 | 4 | 3 | 5 | 3.25 | none | P0 | A |
| 4 | JSON Comparison Challenge Lab | 1 | 2 | 2 | 2 | 3 | 5 | 2.15 | none | P2 | C |
| 5 | CSV Data-Cleaning Practice Lab | 2 | 2 | 3 | 2 | 2 | 4 | 2.40 | G4 | DEFER | C |
| 6 | Base64 Encoding Practice | 1 | 1 | 2 | 1 | 5 | 5 | 2.00 | G2 | REJECT | D |
| 7 | URL Encoding and Parsing Lab | 2 | 2 | 3 | 2 | 4 | 5 | 2.70 | none | P2 | C |
| 8 | HTTP Status Code Practice Lab | 3 | 3 | 3 | 2 | 5 | 5 | 3.30 | none | P1 | B |
| 9 | API Response Validation Lab | 2 | 2 | 4 | 3 | 2 | 4 | 2.70 | G4 | DEFER | C |
| 10 | API Testing Scenario Lab | 2 | 2 | 3 | 2 | 3 | 5 | 2.60 | none | P2 | C |
| 11 | Request and Response Header Lab | 2 | 2 | 3 | 2 | 4 | 5 | 2.70 | none | P2 | C |
| 12 | Authentication Concepts Lab | 2 | 2 | 3 | 2 | 2 | 4 | 2.40 | G3 | DEFER | C |
| 13 | JWT Inspection Practice Lab | 2 | 2 | 3 | 3 | 4 | 4 | 2.70 | none | P2 | C |
| 14 | SQL Query Practice Lab | 3 | 3 | 5 | 2 | 2 | 3 | 3.20 | G4 | P1 | B |
| 15 | SQL Debugging Lab | 2 | 3 | 4 | 3 | 2 | 3 | 2.85 | G4 | P1 | B |
| 16 | Database Testing Scenario Lab | 1 | 2 | 3 | 2 | 2 | 3 | 2.05 | G4 | DEFER | C |
| 17 | HTML Debugging Lab | 2 | 2 | 3 | 2 | 2 | 2 | 2.20 | G6 | DEFER | C |
| 18 | CSS Layout Practice Lab | 2 | 2 | 3 | 2 | 2 | 2 | 2.20 | G6 | DEFER | C |
| 19 | JavaScript Debugging Lab | 3 | 3 | 4 | 2 | 1 | 1 | 2.70 | G6 | REJECT | D |
| 20 | Responsive Design Challenge Lab | 2 | 2 | 3 | 2 | 2 | 2 | 2.20 | G6, G7 | DEFER | C |
| 21 | Browser Console Concepts Lab | 1 | 1 | 2 | 1 | 2 | 2 | 1.40 | G2, G3 | REJECT | D |
| 22 | Test Case Design Lab | 2 | 2 | 3 | 2 | 1 | 4 | 2.30 | G3 | DEFER | C |
| 23 | Boundary Value Analysis Lab | 3 | 3 | 4 | 4 | 4 | 5 | 3.60 | none | P0 | A |
| 24 | Equivalence Partitioning Lab | 3 | 3 | 4 | 3 | 4 | 5 | 3.50 | none | P0 | A |
| 25 | Bug Report Writing Lab | 2 | 2 | 3 | 2 | 3 | 5 | 2.60 | G3 | P2 | C |
| 26 | Regression Test Selection Lab | 1 | 2 | 3 | 2 | 2 | 5 | 2.25 | none | DEFER | C |
| 27 | Exploratory Testing Scenario Lab | 1 | 2 | 2 | 2 | 1 | 5 | 1.95 | G3 | REJECT | D |
| 28 | Accessibility Testing Lab | 3 | 2 | 4 | 3 | 3 | 5 | 3.15 | none | P1 | B |
| 29 | API Test Case Design Lab | 2 | 2 | 3 | 3 | 3 | 5 | 2.70 | none | P2 | C |
| 30 | Git Workflow Simulator | 3 | 3 | 4 | 3 | 1 | 3 | 3.00 | G4 | DEFER | C |
| 31 | Command-Line Concepts Lab | 2 | 2 | 3 | 2 | 1 | 2 | 2.10 | G4, G6 | DEFER | C |
| 32 | Cron Expression Challenge Lab | 2 | 3 | 4 | 4 | 4 | 5 | 3.35 | none | P0 | A |
| 33 | Unix Timestamp Challenge Lab | 2 | 2 | 3 | 2 | 4 | 5 | 2.70 | none | P2 | C |
| 34 | Data Validation Challenge Lab | 2 | 2 | 3 | 2 | 2 | 4 | 2.40 | G3 | DEFER | C |
| 35 | JSON Flashcards | 3 | 4 | 3 | 2 | 4 | 5 | 3.45 | none | P0 | A |
| 36 | HTTP and API Flashcards | 3 | 4 | 3 | 2 | 4 | 5 | 3.45 | none | P0 | A |
| 37 | SQL Flashcards | 3 | 4 | 3 | 2 | 4 | 5 | 3.45 | none | P1 | B |
| 38 | JavaScript Flashcards | 3 | 4 | 3 | 1 | 3 | 5 | 3.25 | none | P2 | C |
| 39 | Git Flashcards | 3 | 4 | 3 | 2 | 4 | 5 | 3.45 | none | P1 | B |
| 40 | QA and Testing Flashcards | 3 | 4 | 3 | 3 | 4 | 5 | 3.55 | none | P0 | A |
| 41 | Accessibility Flashcards | 2 | 3 | 3 | 3 | 3 | 5 | 2.95 | none | P1 | B |
| 42 | Web Development Flashcards | 2 | 3 | 2 | 1 | 2 | 5 | 2.45 | G2, G4 | DEFER | C |
| 43 | Interview Preparation Flashcards | 2 | 3 | 2 | 2 | 2 | 4 | 2.45 | G3 | REJECT | D |
| 44 | Daily Revision Session | 2 | 4 | 4 | 2 | 4 | 5 | 3.40 | none | P0 | A |
| 45 | Mistake Review | 2 | 4 | 4 | 3 | 5 | 5 | 3.60 | none | P0 | A |
| 46 | Spaced Repetition | 2 | 4 | 4 | 2 | 4 | 4 | 3.30 | none | P0 | A |
| 47 | Progress Tracking | 1 | 3 | 3 | 1 | 4 | 4 | 2.50 | none | P0 | A |
| 48 | Topic Mastery | 1 | 2 | 1 | 1 | 3 | 1 | 1.45 | G3 | REJECT | D |
| 49 | Practical Challenges | 3 | 3 | 4 | 3 | 3 | 5 | 3.40 | none | P0 | A |
| 50 | Assessment Mode | 2 | 2 | 3 | 2 | 2 | 3 | 2.30 | G3 | DEFER | C |
| 51 | Lab-to-Flashcard Connections | 1 | 4 | 4 | 5 | 3 | 5 | 3.35 | none | P0 | A |
| 52 | Learning History | 1 | 2 | 2 | 1 | 3 | 2 | 1.75 | G6 | REJECT | D |
| 53 | Import/Export Progress | 1 | 3 | 3 | 3 | 3 | 5 | 2.70 | none | P0 | A |
| 54 | Offline Learning | 2 | 3 | 3 | 2 | 1 | 4 | 2.55 | G4 | DEFER | C |

## Totals

P0 16, P1 7, P2 9, DEFER 15, REJECT 7; total 54. Verdict A 16, B 7, C 24, D 7.

## Sensitivity: what would change the ranking

- If demand data later shows high demand for SQL practice, item 14 could move up, but its feasibility score (F=2) and the gate G4 would still require the spike and an approved dependency.
- SQL Query Practice Lab (14) scores 3.20, below every P0 tool (the lowest is 3.25). It is also outside the P0 band for a reason that is not a score: it needs a new dependency and a worker sandbox, which need an owner decision (doc 13).
- The Cron (32: 3.35) and JSONPath (3: 3.25) labs are P0 because they are gate-free and reuse verified engines. If the owner prefers a smaller first set, Option A (doc 08) is the fallback.
