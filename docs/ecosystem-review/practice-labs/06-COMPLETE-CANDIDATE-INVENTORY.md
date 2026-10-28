# 06 Complete candidate inventory

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Count

The prompt lists **54** candidates (items 1 to 54). All 54 are preserved here, none dropped. Categories: A JSON and data (7); B API and HTTP (6); C SQL and databases (3); D Frontend development (5); E QA and testing (8); F Development workflows (5); G Flashcards (9); H Learning features (11).

## How each candidate is classified

| Classification | Count | Meaning |
|---|---|---|
| Tool | 28 | an independent user-facing page |
| Mode | 5 | a mode of another tool, not a new page (rulebook 1.6) |
| Content | 1 | a topic with no page of its own |
| Content pack | 9 | a deck of cards inside one flashcard engine |
| Feature | 10 | a capability of the flashcard tool or of a lab |
| Concept | 1 | an idea realised by other candidates |

The same row also records the disposition used by doc 07 (P0, P1, P2, DEFER, REJECT). Weighted scores, gates and the reasons for each score are in doc 07; the one-line reason for each disposition is below.

Totals: P0 16, P1 7, P2 9, DEFER 15, REJECT 7 (sum 54).

Of the P0 rows, only **five are user-facing experiences**: Smart Flashcards (carrying items 35, 36, 40), the JSON Error-Fixing Lab (item 2, which folds item 1), the JSONPath Challenge Lab (3), the Cron Challenge Lab (32) and the Test Design Lab (23 and 24). The other P0 rows are modes, content packs and features inside those five (44 to 47, 49, 51, 53).

## Security-sensitive, high-maintenance and duplicate candidates

- Security-sensitive: 14, 15 (SQL execution), 17, 18, 20 (rendering visitor HTML or CSS), 19 (running visitor JavaScript), 30, 31 (terminal and repository simulation), 52 (history, rulebook 7.7). Assessed in doc 13.
- High maintenance: 14, 15, 16, 30, 31, 42, 54.
- Duplicates or near-duplicates of existing tools: 4 (JSON Compare), 6 (Base64), 33 (Unix Timestamp), parts of 7 and 13.
- Infeasible or unassessable as automatic labs: 19, 21, 22, 27, 34.

## Candidate table

| # | Candidate | Cat | Classification | Disposition | Reason |
|---|---|---|---|---|---|
| 1 | JSON Syntax Practice Lab | A | Mode of #2 | P0 | Syntax rules are practised by fixing errors; folded into the JSON Error-Fixing Lab (rule 1.6: a variant is a mode, not a tool). |
| 2 | JSON Error-Fixing Lab | A | Tool | P0 | Strict RFC 8259 validator already exists and gives positioned errors; any correct fix is accepted by parsed-value equality. |
| 3 | JSONPath Challenge Lab | A | Tool | P0 | Reuses the RFC 9535 engine (715-test compliance suite already kept); accepts every equivalent query. Demand for JSONPath practice is a hypothesis. |
| 4 | JSON Comparison Challenge Lab | A | Tool | P2 | Little to learn beyond using JSON Compare; no deterministic teaching goal that the tool page does not already serve. |
| 5 | CSV Data-Cleaning Practice Lab | A | Tool | DEFER | Overlaps the unbuilt CSV Cleaning Workbench candidate; CSV dialect ambiguity makes answers hard to fix. |
| 6 | Base64 Encoding Practice | A | Content | REJECT | Fully served by the Base64 tool; concept cards belong in the JSON and data deck, not a lab. |
| 7 | URL Encoding and Parsing Lab | A | Tool | P2 | URL Parser engine exists; useful but narrow; revisit after the first labs show use. |
| 8 | HTTP Status Code Practice Lab | B | Tool | P1 | Delivered at P0 as scenario cards in the HTTP and APIs deck; a separate lab page is justified only if the deck proves too small a surface. |
| 9 | API Response Validation Lab | B | Tool | DEFER | Needs schema validation; the JSON Schema Validator is blocked on an owner decision. |
| 10 | API Testing Scenario Lab | B | Tool | P2 | Scenario multiple-choice content heavy; fits later as card content. |
| 11 | Request and Response Header Lab | B | Tool | P2 | Header facts are static reference; better as cards. |
| 12 | Authentication Concepts Lab | B | Tool | DEFER | Security guidance is easy to state wrongly; needs an expert reviewer before any content ships. |
| 13 | JWT Inspection Practice Lab | B | Tool | P2 | JWT Decoder engine exists; must use invented sample tokens only; later. |
| 14 | SQL Query Practice Lab | C | Tool | P1 | The most useful practice topic, but needs a new WebAssembly dependency, a worker sandbox and a large content set. P1 only after a separately approved feasibility spike. |
| 15 | SQL Debugging Lab | C | Mode of #14 | P1 | A mode of the SQL lab; same spike. |
| 16 | Database Testing Scenario Lab | C | Tool | DEFER | Needs the SQL engine and QA content together. |
| 17 | HTML Debugging Lab | D | Tool | DEFER | Rendering visitor HTML needs a sandbox design that is not justified yet. |
| 18 | CSS Layout Practice Lab | D | Tool | DEFER | Checking layout needs computed-style access to rendered visitor CSS; CSS can also fetch remote files. |
| 19 | JavaScript Debugging Lab | D | Tool | REJECT | Running visitor JavaScript cannot be made acceptably safe here; prediction questions are static cards instead. |
| 20 | Responsive Design Challenge Lab | D | Tool | DEFER | Needs rendering and viewport control; weak on phones. |
| 21 | Browser Console Concepts Lab | D | Tool | REJECT | A mock console teaches a poor copy of the real one; MDN covers it. |
| 22 | Test Case Design Lab | E | Tool | DEFER | Free-form test-case writing cannot be assessed deterministically; the structured parts are #23 and #24. |
| 23 | Boundary Value Analysis Lab | E | Mode of Test Design Lab | P0 | Deterministic: required values follow from a stated rule. Original exercises; technique definition to be checked against the public ISTQB syllabus at content review. |
| 24 | Equivalence Partitioning Lab | E | Mode of Test Design Lab | P0 | Deterministic classification; shares one lab with #23. |
| 25 | Bug Report Writing Lab | E | Tool | P2 | Only a structured checklist form could be assessed; free text cannot. |
| 26 | Regression Test Selection Lab | E | Tool | DEFER | Needs rich scenario data to be meaningful. |
| 27 | Exploratory Testing Scenario Lab | E | Tool | REJECT | Open-ended by nature; no deterministic correct answer. |
| 28 | Accessibility Testing Lab | E | Tool | P1 | Scenario questions grounded in W3C WAI and WebAIM material; needs an accessibility reviewer. |
| 29 | API Test Case Design Lab | E | Mode of Test Design Lab | P2 | A later mode of the Test Design Lab using API parameters. |
| 30 | Git Workflow Simulator | F | Tool | DEFER | A faithful repository simulation is a large build; a shallow one teaches wrong habits. |
| 31 | Command-Line Concepts Lab | F | Tool | DEFER | Terminal simulation is large and risks implying commands are safe to run. |
| 32 | Cron Expression Challenge Lab | F | Tool | P0 | Cron engine already parses and lists runs; a wrong answer can be shown the next run times it actually produces. |
| 33 | Unix Timestamp Challenge Lab | F | Tool | P2 | Shallow; the converter already shows the answer. |
| 34 | Data Validation Challenge Lab | F | Tool | DEFER | 'Write a validation rule' has no single checkable form without a schema engine. |
| 35 | JSON Flashcards | G | Content pack | P0 | Deck 'JSON and data formats' in the Smart Flashcards tool. |
| 36 | HTTP and API Flashcards | G | Content pack | P0 | Deck 'HTTP and APIs' with scenario cards; RFC 9110 is the primary source. |
| 37 | SQL Flashcards | G | Content pack | P1 | Feasible without any execution, but kept out of the first set to start narrow (rule 1.8). |
| 38 | JavaScript Flashcards | G | Content pack | P2 | Very strong free incumbents and a very large subject; MDN is the primary source. |
| 39 | Git Flashcards | G | Content pack | P1 | Good second-wave deck; official Git documentation is the source. |
| 40 | QA and Testing Flashcards | G | Content pack | P0 | Deck 'Software testing', paired with the Test Design Lab. |
| 41 | Accessibility Flashcards | G | Content pack | P1 | Needs an accessibility reviewer; pairs with #28. |
| 42 | Web Development Flashcards | G | Content pack | DEFER | Too broad; overlaps #38, #41 and MDN. |
| 43 | Interview Preparation Flashcards | G | Content pack | REJECT | A separate deck invites readiness claims; an 'interview-style' tag on cards of other decks covers the need. |
| 44 | Daily Revision Session | H | Feature | P0 | The due-cards session of the scheduler; available only when saving is on. |
| 45 | Mistake Review | H | Feature | P0 | Re-asks cards missed in the current session; works with no storage. |
| 46 | Spaced Repetition | H | Feature | P0 | A simple fixed-interval box scheduler (not FSRS); explainable and deterministic. |
| 47 | Progress Tracking | H | Feature | P0 | Minimal counts only (cards seen, known, not known). Supporting feature required by #44 and #46, not a standalone draw. |
| 48 | Topic Mastery | H | Feature | REJECT | 'Mastery' from a handful of self-graded cards would be a misleading indicator. |
| 49 | Practical Challenges | H | Concept | P0 | Realised by the P0 labs (#2, #3, #23, #24, #32); not a separate product. |
| 50 | Assessment Mode | H | Feature | DEFER | Timed or scored tests invite certification-readiness claims. |
| 51 | Lab-to-Flashcard Connections | H | Feature | P0 | Each lab explanation links to the deck topic that revises it (plain link; no data passed). |
| 52 | Learning History | H | Feature | REJECT | A history log conflicts with rule 7.7 and adds nothing beyond #47. |
| 53 | Import/Export Progress | H | Feature | P0 | Lets a learner keep progress without browser storage, and move it between devices without any account. |
| 54 | Offline Learning | H | Feature | DEFER | The site has no service worker; offline support is an architecture change. Pages already work after loading without a network. |

Categories: A JSON and data, B API and HTTP, C SQL and databases, D frontend, E QA and testing, F development workflows, G flashcards, H learning features.
